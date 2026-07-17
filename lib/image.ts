// Helpers for working with base64 data URLs (data:image/jpeg;base64,....).

export type ParsedImage = { mimeType: string; base64: string };

/**
 * Parse a data URL into its mime type and raw base64 payload.
 * Throws if the string is not a base64 image data URL.
 */
export function parseDataUrl(dataUrl: string): ParsedImage {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(dataUrl);
  if (!match) {
    throw new Error("Invalid image data URL");
  }
  return { mimeType: match[1], base64: match[2] };
}

export function toDataUrl(mimeType: string, base64: string): string {
  return `data:${mimeType};base64,${base64}`;
}

/** Approximate decoded byte length of a base64 string. */
export function base64ByteLength(base64: string): number {
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}
