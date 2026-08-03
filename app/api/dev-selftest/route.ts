// Temporary dev-only self-test for the builds storage layer. Not linked,
// removed before commit. Exercises Blob + KV round-trip with a 1px image.
import { NextResponse } from "next/server";
import { saveBuild, listBuilds, deleteBuild } from "@/lib/builds";
import { EMPTY_OPTIONS } from "@/lib/mods";

export const runtime = "nodejs";

const PX =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "dev only" }, { status: 404 });
  }
  const userId = "selftest-user";
  const log: string[] = [];
  log.push(
    `env: blob=${Boolean(process.env.BLOB_READ_WRITE_TOKEN)} kvUrl=${Boolean(
      process.env.KV_REST_API_URL
    )} kvToken=${Boolean(process.env.KV_REST_API_TOKEN)}`
  );

  await saveBuild(userId, {
    imageBase64: PX,
    mimeType: "image/png",
    prompt: "selftest prompt",
    options: { ...EMPTY_OPTIONS, mods: ["Clean & detail"] },
  });
  log.push("saved");

  const builds = await listBuilds(userId);
  log.push(`listed ${builds.length}: ${builds[0]?.summary} @ ${builds[0]?.url}`);

  for (const b of builds) {
    const ok = await deleteBuild(userId, b.id);
    log.push(`deleted ${b.id}: ${ok}`);
  }
  const after = await listBuilds(userId);
  log.push(`after cleanup: ${after.length}`);

  return NextResponse.json({ log });
}
