"use client";

import BuildButton from "@/components/BuildButton";
import {
  COLORS,
  RIMS,
  MODS,
  FINISHES,
  TINTS,
  PRESETS,
  type ColorOption,
  type RimOption,
  type FinishOption,
  type TintOption,
  type PresetOption,
} from "@/lib/mods";

type Props = {
  presetId: string | null;
  onPreset: (p: PresetOption) => void;
  color: ColorOption | null;
  onColor: (c: ColorOption) => void;
  finish: FinishOption | null;
  onFinish: (f: FinishOption) => void;
  rim: RimOption | null;
  onRim: (r: RimOption) => void;
  tint: TintOption | null;
  onTint: (t: TintOption) => void;
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

/** Small toggle chip used for finishes. */
function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded border px-2.5 py-1 text-xs transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-line-strong text-muted hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

export default function ControlPanel({
  presetId,
  onPreset,
  color,
  onColor,
  finish,
  onFinish,
  rim,
  onRim,
  tint,
  onTint,
  mods,
  onToggleMod,
  freeText,
  onFreeText,
  onBuild,
  isLoading,
  canBuild,
}: Props) {
  const paintValue =
    color && finish
      ? `${color.name} · ${finish.label}`
      : color?.name ?? finish?.label ?? "—";

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-panel">
      <Section
        label="Build style"
        value={PRESETS.find((p) => p.id === presetId)?.label ?? "Custom"}
      >
        <div className="grid grid-cols-2 gap-1.5">
          {PRESETS.map((p) => {
            const active = presetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                title={p.description}
                onClick={() => onPreset(p)}
                aria-pressed={active}
                className={`rounded border px-3 py-2 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  active
                    ? "border-accent bg-accent/10"
                    : "border-line-strong hover:border-muted"
                }`}
              >
                <span
                  className={`block text-sm ${
                    active ? "text-accent" : "text-foreground"
                  }`}
                >
                  {p.label}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-muted">
                  {p.description}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section label="Paint" value={paintValue}>
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
        <div className="mt-3 flex flex-wrap gap-1.5">
          {FINISHES.map((f) => (
            <Chip
              key={f.id}
              label={f.label}
              active={finish?.id === f.id}
              onClick={() => onFinish(f)}
            />
          ))}
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
                    : "border-line-strong text-muted hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section
        label="Glass"
        value={tint ? `${tint.label} · ${tint.vlt}% VLT` : "—"}
      >
        <div className="grid grid-cols-4 gap-1.5">
          {TINTS.map((t) => {
            const active = tint?.id === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onTint(t)}
                aria-pressed={active}
                title={`${t.vlt}% visible light transmission`}
                className={`flex flex-col items-center gap-1.5 rounded border px-2 py-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  active
                    ? "border-accent bg-accent/10"
                    : "border-line-strong hover:border-muted"
                }`}
              >
                {/* Window swatch — darker square = darker glass */}
                <span
                  aria-hidden
                  className="h-5 w-7 rounded-[3px] border border-white/15"
                  style={{
                    backgroundColor: `rgba(190, 210, 235, ${t.vlt / 100})`,
                  }}
                />
                <span
                  className={`text-[11px] ${
                    active ? "text-accent" : "text-muted"
                  }`}
                >
                  {t.label}
                </span>
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
                    active
                      ? "text-foreground"
                      : "text-muted group-hover:text-foreground"
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
