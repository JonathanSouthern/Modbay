import Anthropic from "@anthropic-ai/sdk";
import { parseDataUrl } from "@/lib/image";
import {
  HEADLIGHT_PROMPTS,
  STANCE_PROMPTS,
  TINT_PROMPTS,
  RIM_COLOR_PROMPTS,
  MOD_PROMPTS,
  type ModOptions,
} from "@/lib/mods";

// The doc specified "claude-sonnet-4-6"; that isn't a valid public model id,
// so we default to a current Sonnet and allow an env override.
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-5";

const SYSTEM_PROMPT = `You are an automotive photo-editing prompt engineer.
The user will send you a car photo and a list of desired modifications.
Return ONLY a single image editing instruction (under 120 words) that an
image-editing model can apply to transform the car photo. Be specific about:
- Paint finish (matte/gloss/metallic) and the exact color
- Rim style, finish, and size impression
- Body modifications and their placement
- Preserve the original car's angle, background, and lighting/mood
Do not include any preamble, explanation, or commentary. Output only the instruction.`;

function describeSelections(options: ModOptions): string {
  const lines: string[] = [];
  if (options.color) {
    const finish = options.finish ? ` in a ${options.finish.label.toLowerCase()} finish` : "";
    lines.push(`Paint color: ${options.color.name} (${options.color.hex})${finish}`);
  } else if (options.finish) {
    lines.push(
      `Paint finish: ${options.finish.label.toLowerCase()} (keep the current color)`
    );
  }
  if (options.rim || options.rimColor || options.rimSize) {
    const parts: string[] = [];
    if (options.rim) parts.push(`${options.rim.label} style`);
    if (options.rimColor)
      parts.push(
        RIM_COLOR_PROMPTS[options.rimColor.id] ?? options.rimColor.label.toLowerCase()
      );
    if (options.rimSize) parts.push(`${options.rimSize.id} inch`);
    lines.push(`Rims: ${parts.join(", ")}`);
  }
  if (options.stance) {
    lines.push(
      `Stance: ${options.stance.label} (${
        STANCE_PROMPTS[options.stance.id] ?? options.stance.label
      })`
    );
  }
  if (options.tint) {
    lines.push(
      `Window tint: ${TINT_PROMPTS[options.tint.id] ?? options.tint.label}`
    );
  }
  if (options.headlights) {
    lines.push(
      `Lights: ${
        HEADLIGHT_PROMPTS[options.headlights.id] ?? options.headlights.label
      }`
    );
  }
  if (options.underglow) {
    lines.push(
      `Neon underglow: ${options.underglow.label.toLowerCase()} (${
        options.underglow.hex
      }) glow beneath the car, casting light on the ground`
    );
  }
  if (options.mods.length > 0) {
    lines.push(
      `Modifications: ${options.mods
        .map((m) => MOD_PROMPTS[m] ?? m)
        .join("; ")}`
    );
  }
  if (options.freeText.trim()) {
    lines.push(`Additional request: ${options.freeText.trim()}`);
  }
  return lines.join("\n");
}

/**
 * Compose the editing instruction directly from the selections — no LLM
 * call. Used when ANTHROPIC_API_KEY is not configured.
 */
function templatePrompt(options: ModOptions): string {
  const changes: string[] = [];
  if (options.color) {
    const finish = options.finish
      ? ` with a ${options.finish.label.toLowerCase()} finish`
      : "";
    changes.push(
      `Paint: repaint the entire car body ${options.color.name} (${options.color.hex})${finish}.`
    );
  } else if (options.finish) {
    changes.push(
      `Paint: change the paint to a ${options.finish.label.toLowerCase()} finish, keeping the current color.`
    );
  }
  if (options.rim || options.rimColor || options.rimSize) {
    const size = options.rimSize ? `${options.rimSize.id}-inch ` : "";
    const style = options.rim ? `${options.rim.label.toLowerCase()}-style ` : "";
    const color = options.rimColor
      ? ` finished in ${RIM_COLOR_PROMPTS[options.rimColor.id] ?? options.rimColor.label.toLowerCase()}`
      : "";
    changes.push(
      `Wheels: completely replace the existing wheels with ${size}${style}aftermarket rims${color}. The new wheels must look clearly different from the current ones.`
    );
  }
  if (options.stance) {
    changes.push(
      `Ride height: ${STANCE_PROMPTS[options.stance.id] ?? options.stance.label}. The change in ride height must be obvious compared to the original photo.`
    );
  }
  if (options.tint) {
    changes.push(
      `Windows: ${TINT_PROMPTS[options.tint.id] ?? options.tint.label.toLowerCase() + " window tint"}.`
    );
  }
  if (options.headlights) {
    changes.push(
      `Lights: ${HEADLIGHT_PROMPTS[options.headlights.id] ?? options.headlights.label}.`
    );
  }
  if (options.underglow) {
    changes.push(
      `Underglow: add ${options.underglow.label.toLowerCase()} (${options.underglow.hex}) neon underglow beneath the car, casting a visible glow on the ground.`
    );
  }
  for (const m of options.mods) {
    changes.push(`Body: ${MOD_PROMPTS[m] ?? m}.`);
  }
  if (options.freeText.trim()) {
    changes.push(`Also: ${options.freeText.trim()}.`);
  }

  const list = changes.map((c, i) => `${i + 1}. ${c}`).join("\n");
  return [
    "Edit this photo of a car. Apply ALL of the following modifications — every numbered change must be clearly visible in the result, do not skip any:",
    list,
    "Keep the original camera angle, background, environment, lighting, and reflections. Do not change anything else about the scene. The result must look like a real photograph.",
  ].join("\n");
}

/**
 * Turn the car photo + selected mods into a single, precise image-editing
 * instruction for the downstream image model. Uses Claude to write a
 * photo-aware instruction when ANTHROPIC_API_KEY is set; otherwise falls
 * back to a deterministic template built from the selections.
 */
export async function buildGeminiPrompt(
  image: string,
  options: ModOptions
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return templatePrompt(options);

  const { mimeType, base64 } = parseDataUrl(image);
  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as
                | "image/jpeg"
                | "image/png"
                | "image/webp"
                | "image/gif",
              data: base64,
            },
          },
          {
            type: "text",
            text: `Desired modifications for this car:\n\n${describeSelections(
              options
            )}\n\nReturn the single editing instruction now.`,
          },
        ],
      },
    ],
  });

  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  if (!text) throw new Error("Claude returned an empty prompt");
  return text;
}
