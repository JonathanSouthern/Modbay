"use client";

import {
  COLORS,
  RIMS,
  MODS,
  type ColorOption,
  type RimOption,
} from "@/lib/mods";

type Props = {
  color: ColorOption | null;
  onColor: (c: ColorOption) => void;
  rim: RimOption | null;
  onRim: (r: RimOption) => void;
  mods: string[];
  onToggleMod: (m: string) => void;
  freeText: string;
  onFreeText: (v: string) => void;
  onBuild: () => void;
  isLoading: boolean;
  canBuild: boolean;
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function ControlPanel({
  color,
  onColor,
  rim,
  onRim,
  mods,
  onToggleMod,
  freeText,
  onFreeText,
  onBuild,
  isLoading,
  canBuild,
}: Props) {
  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-5 shadow-sm">
      <Section title="Body color">
        <div className="grid grid-cols-5 gap-2.5">
          {COLORS.map((c) => {
            const active = color?.name === c.name;
            return (
              <button
                key={c.name}
                type="button"
                title={c.name}
                onClick={() => onColor(c)}
                className={`relative aspect-square rounded-full border shadow-sm transition ${
                  active
                    ? "ring-2 ring-accent ring-offset-2"
                    : "border-border hover:scale-105"
                }`}
                style={{ backgroundColor: c.hex }}
                aria-pressed={active}
                aria-label={c.name}
              />
            );
          })}
        </div>
        {color && <p className="text-xs text-muted">{color.name}</p>}
      </Section>

      <Section title="Rim style">
        <div className="flex flex-wrap gap-2">
          {RIMS.map((r) => {
            const active = rim?.id === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onRim(r)}
                aria-pressed={active}
                className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                  active
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-background text-foreground hover:border-accent/60"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Mods">
        <div className="flex flex-wrap gap-2">
          {MODS.map((m) => {
            const active = mods.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => onToggleMod(m)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  active
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-background text-foreground hover:border-accent/60"
                }`}
              >
                {active ? "✓ " : ""}
                {m}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Anything else?">
        <textarea
          value={freeText}
          onChange={(e) => onFreeText(e.target.value)}
          rows={3}
          placeholder="e.g. Also add a subtle racing stripe down the center"
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </Section>

      <button
        type="button"
        onClick={onBuild}
        disabled={isLoading || !canBuild}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
              />
            </svg>
            Building…
          </>
        ) : (
          <>✨ Build it</>
        )}
      </button>
      {!canBuild && (
        <p className="-mt-3 text-center text-xs text-muted">
          Upload a photo and pick at least one mod to start.
        </p>
      )}
    </div>
  );
}
