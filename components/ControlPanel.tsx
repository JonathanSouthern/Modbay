"use client";

import BuildButton from "@/components/BuildButton";
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

/**
 * Spec-sheet section: an uppercase label on the left, the current
 * selection echoed in mono on the right, hairline rule below.
 */
function Section({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-line px-4 py-4 last:border-b-0">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          {label}
        </h3>
        {value && (
          <span className="truncate font-mono text-[11px] text-foreground">
            {value}
          </span>
        )}
      </div>
      {children}
    </section>
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
    <div className="overflow-hidden rounded-lg border border-line bg-panel">
      <Section label="Paint" value={color?.name ?? "—"}>
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map((c) => {
            const active = color?.name === c.name;
            return (
              <button
                key={c.name}
                type="button"
                title={c.name}
                onClick={() => onColor(c)}
                aria-pressed={active}
                aria-label={c.name}
                className={`h-9 w-9 rounded-full border border-white/10 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  active
                    ? "ring-2 ring-accent ring-offset-2 ring-offset-panel"
                    : "hover:scale-105"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>
      </Section>

      <Section label="Rims" value={rim?.label ?? "—"}>
        <div className="grid grid-cols-2 gap-1.5">
          {RIMS.map((r) => {
            const active = rim?.id === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onRim(r)}
                aria-pressed={active}
                className={`rounded border px-3 py-2 text-left text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  active
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-line-strong text-muted hover:border-line-strong hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section
        label="Mods"
        value={mods.length > 0 ? `${mods.length} selected` : "—"}
      >
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          {MODS.map((m) => {
            const active = mods.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => onToggleMod(m)}
                aria-pressed={active}
                className="group flex items-center gap-2.5 rounded px-1.5 py-1.5 text-left text-sm transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
              >
                <span
                  aria-hidden
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border transition ${
                    active
                      ? "border-accent bg-accent text-stage"
                      : "border-line-strong group-hover:border-muted"
                  }`}
                >
                  {active && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span
                  className={
                    active ? "text-foreground" : "text-muted group-hover:text-foreground"
                  }
                >
                  {m}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section label="Notes">
        <textarea
          value={freeText}
          onChange={(e) => onFreeText(e.target.value)}
          rows={2}
          placeholder="Anything else — e.g. subtle center racing stripe"
          className="w-full resize-none rounded border border-line-strong bg-stage px-3 py-2 text-sm text-foreground placeholder:text-muted/70 transition focus:border-accent focus:outline-none"
        />
      </Section>

      {/* Rail CTA — hidden on mobile, where the sticky bar takes over */}
      <div className="hidden space-y-2 px-4 py-4 lg:block">
        <BuildButton onBuild={onBuild} isLoading={isLoading} canBuild={canBuild} />
        {!canBuild && (
          <p className="text-center font-mono text-[11px] text-muted">
            Add a photo and pick at least one mod
          </p>
        )}
      </div>
    </div>
  );
}
