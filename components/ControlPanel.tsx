"use client";

import { useState } from "react";
import BuildButton from "@/components/BuildButton";
import {
  COLORS,
  FINISHES,
  RIMS,
  RIM_COLORS,
  RIM_SIZES,
  STANCES,
  TINTS,
  HEADLIGHTS,
  UNDERGLOWS,
  MODS,
  PRESETS,
  type ModOptions,
  type PresetOption,
} from "@/lib/mods";

type Props = {
  spec: ModOptions;
  onPatch: (patch: Partial<ModOptions>) => void;
  presetId: string | null;
  onPreset: (p: PresetOption) => void;
  onBuild: () => void;
  isLoading: boolean;
  canBuild: boolean;
};

/**
 * Collapsible spec-sheet section: the header shows the uppercase label,
 * the current selection echoed in mono, and a chevron. Collapsed sections
 * keep their value echo visible, so the sheet stays scannable.
 */
function Section({
  label,
  value,
  open,
  onToggle,
  children,
}: {
  label: string;
  value?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-line last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={`${label} section`}
        className="flex w-full items-baseline justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-panel-raised/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
      >
        <span className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          {label}
        </span>
        <span className="flex min-w-0 items-center gap-2">
          {value && (
            <span className="truncate font-mono text-[11px] text-foreground">
              {value}
            </span>
          )}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className={`shrink-0 self-center text-muted transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        {/* inert removes collapsed controls from tab order and the a11y tree */}
        <div className="min-h-0 overflow-hidden" inert={!open}>
          <div className="px-4 pb-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

/** Sub-label inside a section (e.g. "Color" under Rims). */
function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted/80 first:mt-0">
      {children}
    </p>
  );
}

/** Small toggle chip for single-select options. */
function Chip({
  label,
  active,
  onClick,
  title,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={`rounded border px-2.5 py-1 text-xs transition active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-line-strong text-muted hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

/** Round color swatch with active ring. */
function Swatch({
  hex,
  label,
  active,
  onClick,
  size = "h-9 w-9",
  glow = false,
  background,
}: {
  hex: string;
  label: string;
  active: boolean;
  onClick: () => void;
  size?: string;
  glow?: boolean;
  /** CSS background override (e.g. metallic gradient); falls back to hex. */
  background?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`${size} rounded-full border border-white/10 transition active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        active
          ? "ring-2 ring-accent ring-offset-2 ring-offset-panel"
          : "hover:scale-105"
      }`}
      style={{
        background: background ?? hex,
        ...(glow ? { boxShadow: `0 0 ${active ? 12 : 6}px ${hex}` } : {}),
      }}
    />
  );
}

export default function ControlPanel({
  spec,
  onPatch,
  presetId,
  onPreset,
  onBuild,
  isLoading,
  canBuild,
}: Props) {
  const {
    color,
    finish,
    rim,
    rimColor,
    rimSize,
    stance,
    tint,
    headlights,
    underglow,
    mods,
    freeText,
  } = spec;

  // Progressive disclosure: core sections start open, detail sections
  // start collapsed. Collapsed headers still echo their values.
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    style: true,
    paint: true,
    rims: true,
    stance: false,
    glass: false,
    lights: false,
    mods: true,
    notes: false,
  });
  const sectionProps = (id: string) => ({
    open: Boolean(openSections[id]),
    onToggle: () =>
      setOpenSections((s) => ({ ...s, [id]: !s[id] })),
  });

  // Every single-select control toggles: tap the active option to clear it.
  const toggle = <K extends keyof ModOptions>(
    key: K,
    current: { id?: string; name?: string } | null,
    next: ModOptions[K] & { id?: string; name?: string }
  ) => {
    const same =
      current !== null &&
      (current.id !== undefined
        ? current.id === next.id
        : current.name === next.name);
    onPatch({ [key]: same ? null : next } as Partial<ModOptions>);
  };

  const paintValue =
    color && finish
      ? `${color.name} · ${finish.label}`
      : color?.name ?? finish?.label ?? "—";

  const rimValue =
    [rim?.label, rimColor?.label, rimSize?.label].filter(Boolean).join(" · ") ||
    "—";

  const lightsValue =
    [headlights?.label, underglow ? `${underglow.label} glow` : null]
      .filter(Boolean)
      .join(" · ") || "—";

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-panel">
      <Section
        {...sectionProps("style")}
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
                className={`rounded border px-3 py-2 text-left transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
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

      <Section {...sectionProps("paint")} label="Paint" value={paintValue}>
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map((c) => (
            <Swatch
              key={c.name}
              hex={c.hex}
              label={c.name}
              active={color?.name === c.name}
              onClick={() => toggle("color", color, c)}
            />
          ))}
        </div>
        <SubLabel>Finish</SubLabel>
        <div className="flex flex-wrap gap-1.5">
          {FINISHES.map((f) => (
            <Chip
              key={f.id}
              label={f.label}
              active={finish?.id === f.id}
              onClick={() => toggle("finish", finish, f)}
            />
          ))}
        </div>
      </Section>

      <Section {...sectionProps("rims")} label="Rims" value={rimValue}>
        <SubLabel>Style</SubLabel>
        <div className="grid grid-cols-2 gap-1.5">
          {RIMS.map((r) => {
            const active = rim?.id === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => toggle("rim", rim, r)}
                aria-pressed={active}
                className={`rounded border px-3 py-2 text-left text-sm transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
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
        <SubLabel>Color</SubLabel>
        <div className="flex flex-wrap gap-2">
          {RIM_COLORS.map((c) => (
            <Swatch
              key={c.id}
              hex={c.hex}
              background={c.swatch}
              label={c.label}
              active={rimColor?.id === c.id}
              onClick={() => toggle("rimColor", rimColor, c)}
              size="h-7 w-7"
            />
          ))}
        </div>
        <SubLabel>Size</SubLabel>
        <div className="flex flex-wrap gap-1.5">
          {RIM_SIZES.map((s) => (
            <Chip
              key={s.id}
              label={s.label}
              active={rimSize?.id === s.id}
              onClick={() => toggle("rimSize", rimSize, s)}
            />
          ))}
        </div>
      </Section>

      <Section {...sectionProps("stance")} label="Stance" value={stance?.label ?? "—"}>
        <div className="grid grid-cols-3 gap-1.5">
          {STANCES.map((s) => (
            <Chip
              key={s.id}
              label={s.label}
              active={stance?.id === s.id}
              onClick={() => toggle("stance", stance, s)}
            />
          ))}
        </div>
      </Section>

      <Section
        {...sectionProps("glass")}
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
                onClick={() => toggle("tint", tint, t)}
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

      <Section {...sectionProps("lights")} label="Lights" value={lightsValue}>
        <SubLabel>Headlights</SubLabel>
        <div className="flex flex-wrap gap-1.5">
          {HEADLIGHTS.map((h) => (
            <Chip
              key={h.id}
              label={h.label}
              active={headlights?.id === h.id}
              onClick={() => toggle("headlights", headlights, h)}
            />
          ))}
        </div>
        <SubLabel>Underglow</SubLabel>
        <div className="flex flex-wrap gap-2">
          {UNDERGLOWS.map((u) => (
            <Swatch
              key={u.id}
              hex={u.hex}
              label={u.label}
              active={underglow?.id === u.id}
              onClick={() => toggle("underglow", underglow, u)}
              size="h-7 w-7"
              glow
            />
          ))}
        </div>
      </Section>

      <Section
        {...sectionProps("mods")}
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
                onClick={() =>
                  onPatch({
                    mods: active
                      ? mods.filter((x) => x !== m)
                      : [...mods, m],
                  })
                }
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

      <Section {...sectionProps("notes")} label="Notes">
        <textarea
          value={freeText}
          onChange={(e) => onPatch({ freeText: e.target.value })}
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
