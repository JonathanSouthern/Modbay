import { kv } from "@vercel/kv";
import { put, del } from "@vercel/blob";
import type { ModOptions } from "@/lib/mods";

// Each user keeps their most recent builds; older ones roll off and their
// images are deleted from Blob storage.
const MAX_BUILDS = 50;

export type BuildRecord = {
  id: string;
  url: string; // Blob URL of the rendered image
  prompt: string; // exact instruction sent to the image model
  summary: string; // human-readable spec line
  createdAt: string; // ISO timestamp
};

function buildsKey(userId: string): string {
  return `user:${userId}:builds`;
}

function isConfigured(): boolean {
  return Boolean(
    process.env.KV_REST_API_URL &&
      process.env.KV_REST_API_TOKEN &&
      process.env.BLOB_READ_WRITE_TOKEN
  );
}

/** One-line spec description, e.g. "Racing red · Gloss · 19″ Bronze Mesh flow · Slammed". */
export function specSummary(o: ModOptions): string {
  const parts: string[] = [];
  if (o.color) {
    parts.push(o.finish ? `${o.color.name} · ${o.finish.label}` : o.color.name);
  } else if (o.finish) {
    parts.push(`${o.finish.label} finish`);
  }
  const rim = [o.rimSize?.label, o.rimColor?.label, o.rim?.label]
    .filter(Boolean)
    .join(" ");
  if (rim) parts.push(rim);
  if (o.stance) parts.push(o.stance.label);
  if (o.tint) parts.push(`${o.tint.label} tint`);
  if (o.headlights) parts.push(o.headlights.label);
  if (o.underglow) parts.push(`${o.underglow.label} glow`);
  if (o.mods.length > 0)
    parts.push(`${o.mods.length} mod${o.mods.length > 1 ? "s" : ""}`);
  return parts.join(" · ") || "Custom build";
}

/**
 * Persist a finished build: image to Blob, record (with the prompt) to KV.
 * Throws only on storage errors — callers decide whether that's fatal.
 */
export async function saveBuild(
  userId: string,
  args: {
    imageBase64: string;
    mimeType: string;
    prompt: string;
    options: ModOptions;
  }
): Promise<void> {
  if (!isConfigured()) {
    console.warn("[builds] storage not configured — build not saved");
    return;
  }

  const id = crypto.randomUUID();
  const ext = args.mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const blob = await put(
    `builds/${userId}/${id}.${ext}`,
    Buffer.from(args.imageBase64, "base64"),
    { access: "public", contentType: args.mimeType, addRandomSuffix: true }
  );

  const record: BuildRecord = {
    id,
    url: blob.url,
    prompt: args.prompt,
    summary: specSummary(args.options),
    createdAt: new Date().toISOString(),
  };
  await kv.lpush(buildsKey(userId), record);

  // Prune past the cap and delete the evicted images.
  const overflow =
    (await kv.lrange<BuildRecord>(buildsKey(userId), MAX_BUILDS, -1)) ?? [];
  if (overflow.length > 0) {
    await kv.ltrim(buildsKey(userId), 0, MAX_BUILDS - 1);
    await Promise.allSettled(overflow.map((b) => del(b.url)));
  }
}

/** Newest-first list of the user's saved builds. */
export async function listBuilds(userId: string): Promise<BuildRecord[]> {
  if (!isConfigured()) return [];
  return (await kv.lrange<BuildRecord>(buildsKey(userId), 0, MAX_BUILDS - 1)) ?? [];
}

/**
 * Remove one build: its KV record and its Blob image. The list is
 * rewritten rather than lrem'd — exact-serialization matching is fragile.
 */
export async function deleteBuild(
  userId: string,
  id: string
): Promise<boolean> {
  if (!isConfigured()) return false;

  const builds = await listBuilds(userId);
  const target = builds.find((b) => b.id === id);
  if (!target) return false;

  const remaining = builds.filter((b) => b.id !== id);
  const key = buildsKey(userId);
  await kv.del(key);
  if (remaining.length > 0) {
    await kv.rpush(key, ...remaining);
  }
  await del(target.url).catch((err) =>
    console.error("[builds] blob delete failed:", err)
  );
  return true;
}

export { MAX_BUILDS };
