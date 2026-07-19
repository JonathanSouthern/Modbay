import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { buildGeminiPrompt } from "@/lib/prompt";
import { editCarImage } from "@/lib/gemini";
import { checkAndIncrement } from "@/lib/ratelimit";
import { parseDataUrl, toDataUrl, base64ByteLength } from "@/lib/image";
import { MAX_IMAGE_BYTES, type GenerateRequest } from "@/lib/mods";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  // 1. Auth (middleware also protects this, but double-check here).
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // 2. Parse + validate the body.
  let body: GenerateRequest;
  try {
    body = (await req.json()) as GenerateRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    image,
    color = null,
    finish = null,
    rim = null,
    tint = null,
    mods = [],
    freeText = "",
  } = body;

  if (!image) {
    return NextResponse.json({ error: "Missing image" }, { status: 400 });
  }

  const hasSelections =
    Boolean(color) ||
    Boolean(finish) ||
    Boolean(rim) ||
    Boolean(tint) ||
    mods.length > 0 ||
    freeText.trim().length > 0;
  if (!hasSelections) {
    return NextResponse.json(
      { error: "Select at least one modification" },
      { status: 400 }
    );
  }

  let parsed;
  try {
    parsed = parseDataUrl(image);
  } catch {
    return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
  }
  if (base64ByteLength(parsed.base64) > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "Image exceeds 10MB limit" },
      { status: 400 }
    );
  }

  // 3. Rate limit (10 builds/user/day).
  const rate = await checkAndIncrement(userId);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Daily limit reached (10 builds)" },
      { status: 429 }
    );
  }

  // 4 & 5. Claude → editing prompt → Gemini → edited image.
  try {
    const prompt = await buildGeminiPrompt(image, {
      color,
      finish,
      rim,
      tint,
      mods,
      freeText,
    });
    const edited = await editCarImage(parsed.base64, parsed.mimeType, prompt);

    // 6. Return the result + remaining count.
    return NextResponse.json({
      result: toDataUrl(edited.mimeType, edited.base64),
      remaining: rate.remaining,
    });
  } catch (err) {
    console.error("[generate] pipeline error:", err);
    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 500 }
    );
  }
}
