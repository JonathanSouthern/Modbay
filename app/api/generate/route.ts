import { NextResponse } from "next/server";
import { after } from "next/server";
import { saveBuild } from "@/lib/builds";
import { auth } from "@clerk/nextjs/server";
import { buildGeminiPrompt } from "@/lib/prompt";
import { editCarImage } from "@/lib/gemini";
import { checkAndIncrement, refund } from "@/lib/ratelimit";
import { parseDataUrl, toDataUrl, base64ByteLength } from "@/lib/image";
import {
  MAX_IMAGE_BYTES,
  type GenerateRequest,
  type ModOptions,
} from "@/lib/mods";

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

  const { image } = body;
  const options: ModOptions = {
    color: body.color ?? null,
    finish: body.finish ?? null,
    rim: body.rim ?? null,
    rimColor: body.rimColor ?? null,
    rimSize: body.rimSize ?? null,
    stance: body.stance ?? null,
    tint: body.tint ?? null,
    headlights: body.headlights ?? null,
    underglow: body.underglow ?? null,
    mods: body.mods ?? [],
    freeText: body.freeText ?? "",
  };

  if (!image) {
    return NextResponse.json({ error: "Missing image" }, { status: 400 });
  }

  const hasSelections = Object.values(options).some((v) =>
    Array.isArray(v)
      ? v.length > 0
      : typeof v === "string"
        ? v.trim().length > 0
        : v !== null
  );
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

  // 3. Rate limit (10 builds/user/day). Fails closed: if the store is
  // unavailable in production, builds are refused rather than unmetered.
  let rate;
  try {
    rate = await checkAndIncrement(userId);
  } catch (err) {
    console.error("[generate] rate limit unavailable:", err);
    return NextResponse.json(
      { error: "Builds are temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Daily limit reached (10 builds)" },
      { status: 429 }
    );
  }

  // 4 & 5. Claude → editing prompt → Gemini → edited image.
  try {
    const prompt = await buildGeminiPrompt(image, options);
    console.log(`[generate] user=${userId} prompt: ${prompt}`);
    const edited = await editCarImage(parsed.base64, parsed.mimeType, prompt);

    // Save to the user's garage after the response is sent — a storage
    // hiccup never fails a successful build.
    after(async () => {
      try {
        await saveBuild(userId, {
          imageBase64: edited.base64,
          mimeType: edited.mimeType,
          prompt,
          options,
        });
      } catch (err) {
        console.error("[generate] failed to save build to garage:", err);
      }
    });

    // 6. Return the result + remaining count.
    return NextResponse.json({
      result: toDataUrl(edited.mimeType, edited.base64),
      remaining: rate.remaining,
    });
  } catch (err) {
    console.error("[generate] pipeline error:", err);
    // Failed builds don't count against the daily allowance.
    await refund(userId);
    return NextResponse.json(
      { error: "Generation failed. Please try again — this build wasn't counted." },
      { status: 500 }
    );
  }
}
