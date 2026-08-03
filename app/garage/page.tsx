import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import {
  listBuilds,
  deleteBuild,
  MAX_BUILDS,
  type BuildRecord,
} from "@/lib/builds";

async function removeBuild(formData: FormData) {
  "use server";
  const { userId } = await auth();
  if (!userId) return;
  const id = formData.get("id");
  if (typeof id === "string" && id) {
    await deleteBuild(userId, id);
    revalidatePath("/garage");
  }
}

export const metadata: Metadata = {
  title: "Your garage — Modbay",
};

function buildDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function BuildCard({ build }: { build: BuildRecord }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-panel">
      <a
        href={build.url}
        target="_blank"
        rel="noopener"
        className="relative block aspect-[16/10] bg-stage focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
        title="Open full size"
      >
        <Image
          src={build.url}
          alt={build.summary}
          fill
          unoptimized
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
        />
      </a>
      <div className="space-y-2 px-4 py-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-sm text-foreground">{build.summary}</p>
          <span className="shrink-0 font-mono text-[10px] text-muted">
            {buildDate(build.createdAt)}
          </span>
        </div>
        <details className="group">
          <summary className="cursor-pointer list-none font-mono text-[11px] text-muted transition hover:text-foreground">
            <span className="group-open:hidden">Show edit instruction ▸</span>
            <span className="hidden group-open:inline">Edit instruction ▾</span>
          </summary>
          <p className="mt-1.5 rounded border border-line bg-stage px-2.5 py-2 font-mono text-[11px] leading-relaxed text-muted">
            {build.prompt}
          </p>
        </details>
        <div className="flex items-center justify-between">
          <a
            href={`${build.url}?download=1`}
            className="font-mono text-[11px] text-accent transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Download
          </a>
          <form action={removeBuild}>
            <input type="hidden" name="id" value={build.id} />
            <button
              type="submit"
              className="font-mono text-[11px] text-muted transition hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Remove
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default async function GaragePage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  let builds: BuildRecord[] = [];
  try {
    builds = await listBuilds(userId);
  } catch (err) {
    console.error("[garage] failed to list builds:", err);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-[0.06em]">
            The garage
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Every build you render is saved here automatically.
          </p>
        </div>
        <span className="font-mono text-[11px] text-muted">
          {builds.length}/{MAX_BUILDS} saved · oldest roll off
        </span>
      </div>

      {builds.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-line bg-stage py-20">
          <p className="font-display text-xl font-semibold uppercase tracking-[0.14em] text-foreground">
            No builds yet
          </p>
          <Link
            href="/"
            className="rounded bg-accent px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-[0.14em] text-stage transition hover:bg-accent-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Start your first build
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {builds.map((b) => (
            <BuildCard key={b.id} build={b} />
          ))}
        </div>
      )}
    </div>
  );
}
