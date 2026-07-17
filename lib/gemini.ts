import { GoogleGenAI } from "@google/genai";

// gemini-2.5-flash-image ("nano banana") edits an input image from a text prompt.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-image";

export type EditedImage = { mimeType: string; base64: string };

/**
 * Send the original car image + Claude's editing instruction to Gemini and
 * return the edited image as base64.
 */
export async function editCarImage(
  base64: string,
  mimeType: string,
  prompt: string
): Promise<EditedImage> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data: base64 } },
          { text: prompt },
        ],
      },
    ],
    config: {
      responseModalities: ["IMAGE", "TEXT"],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const inline = part.inlineData;
    if (inline?.data) {
      return { mimeType: inline.mimeType || "image/png", base64: inline.data };
    }
  }

  throw new Error("Gemini did not return an edited image");
}
