"use client";

import { SignUpButton } from "@clerk/nextjs";
import CompareSlider from "@/components/CompareSlider";

const FEATURES: { title: string; detail: string }[] = [
  { title: "Repaint", detail: "10 colors × 5 finishes — gloss to pearl" },
  { title: "Rims", detail: "Style, color, and size up to 22″" },
  { title: "Stance", detail: "Lowered, slammed, or lifted" },
  { title: "Window tint", detail: "Light 50% down to limo 5%" },
  { title: "Lights", detail: "Smoked lenses, halos, neon underglow" },
  { title: "Build styles", detail: "One-tap presets: JDM, Track Day…" },
];

const STEPS: { label: string; detail: string }[] = [
  { label: "Photo", detail: "Upload any photo of your car" },
  { label: "Spec", detail: "Fill the build sheet" },
  { label: "Build", detail: "AI renders it — compare & download" },
];

export default function Landing() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6">
      {/* Hero */}
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-4xl font-bold uppercase tracking-[0.06em] sm:text-6xl">
          Your car, modified<span className="text-accent">.</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted sm:text-lg">
          Upload a photo of your actual car, spec the build, and see it
          rendered in seconds — before you spend a dime at the shop.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <SignUpButton mode="modal">
            <button className="rounded bg-accent px-6 py-3 font-display text-base font-semibold uppercase tracking-[0.14em] text-stage transition active:scale-[0.98] hover:bg-accent-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              Start your build
            </button>
          </SignUpButton>
          <span className="font-mono text-[11px] tracking-wide text-muted">
            Free account · 10 builds a day
          </span>
        </div>
      </div>

      {/* Demo: drag the divider */}
      <div className="mx-auto mt-10 max-w-4xl">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-line bg-stage">
          <CompareSlider original="/demo/before.svg" result="/demo/after.svg" />
          <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded bg-stage/85 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            Demo — drag the divider
          </span>
        </div>
        <p className="mt-2 text-center font-mono text-[11px] text-muted">
          This build: deep purple pearl · bronze 20″ rims · slammed · limo
          tint · purple underglow
        </p>
      </div>

      {/* What you can spec */}
      <div className="mx-auto mt-14 max-w-4xl">
        <h2 className="mb-4 text-center font-display text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          The build sheet
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-line bg-panel px-4 py-3.5"
            >
              <p className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
                {f.title}
              </p>
              <p className="mt-1 text-[13px] leading-snug text-muted">
                {f.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="mx-auto mt-14 max-w-4xl">
        <h2 className="mb-4 text-center font-display text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          How it works
        </h2>
        <ol className="grid gap-2 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li
              key={s.label}
              className="flex items-start gap-3 rounded-lg border border-line bg-panel px-4 py-3.5"
            >
              <span className="font-display text-lg font-bold text-accent">
                0{i + 1}
              </span>
              <span>
                <span className="block font-display text-sm font-semibold uppercase tracking-[0.12em]">
                  {s.label}
                </span>
                <span className="mt-0.5 block text-[13px] text-muted">
                  {s.detail}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Closing CTA */}
      <div className="mt-14 text-center">
        <SignUpButton mode="modal">
          <button className="rounded border border-accent px-6 py-3 font-display text-base font-semibold uppercase tracking-[0.14em] text-accent transition active:scale-[0.98] hover:bg-accent hover:text-stage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            Build yours free
          </button>
        </SignUpButton>
        <p className="mt-3 font-mono text-[11px] text-muted">
          Your photo is processed by AI to render the build. Results are saved
          to your private garage — original photos aren&apos;t kept.
        </p>
      </div>
    </div>
  );
}
