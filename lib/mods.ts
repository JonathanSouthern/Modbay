// Shared domain data + types for Modbay.
// Imported by both client components (ControlPanel) and the API route.

export type ColorOption = { name: string; hex: string };
export type RimOption = { id: string; label: string };
export type FinishOption = { id: string; label: string };
export type TintOption = { id: string; label: string; vlt: number };
export type SwatchOption = { id: string; label: string; hex: string };
export type ChipOption = { id: string; label: string };

export const COLORS: ColorOption[] = [
  { name: "Midnight black", hex: "#1a1a1a" },
  { name: "Pearl white", hex: "#f5f5f5" },
  { name: "Racing red", hex: "#c0121a" },
  { name: "Electric blue", hex: "#1a56db" },
  { name: "British green", hex: "#1d3b2a" },
  { name: "Gunmetal gray", hex: "#4b5563" },
  { name: "Sunset orange", hex: "#ea580c" },
  { name: "Deep purple", hex: "#5b21b6" },
  { name: "Metallic gold", hex: "#c9a227" },
  { name: "Rose gold", hex: "#b76e79" },
];

export const FINISHES: FinishOption[] = [
  { id: "gloss", label: "Gloss" },
  { id: "satin", label: "Satin" },
  { id: "matte", label: "Matte" },
  { id: "metallic", label: "Metallic" },
  { id: "pearl", label: "Pearl" },
];

export const RIMS: RimOption[] = [
  { id: "stock", label: "Stock" },
  { id: "sport", label: "Sport spoke" },
  { id: "mesh", label: "Mesh flow" },
  { id: "deepdish", label: "Deep dish" },
  { id: "chrome", label: "Chrome split" },
];

export const RIM_COLORS: SwatchOption[] = [
  { id: "black", label: "Gloss black", hex: "#0b0b0d" },
  { id: "bronze", label: "Bronze", hex: "#8c6a3f" },
  { id: "gunmetal", label: "Gunmetal", hex: "#55595f" },
  { id: "chrome", label: "Chrome", hex: "#c8ccd2" },
  { id: "gold", label: "Gold", hex: "#c9a227" },
  { id: "red", label: "Red", hex: "#c0121a" },
  { id: "white", label: "White", hex: "#eef0f2" },
];

export const RIM_SIZES: ChipOption[] = [
  { id: "18", label: "18″" },
  { id: "19", label: "19″" },
  { id: "20", label: "20″" },
  { id: "22", label: "22″" },
];

export const STANCES: ChipOption[] = [
  { id: "lowered", label: "Lowered" },
  { id: "slammed", label: "Slammed" },
  { id: "lifted", label: "Lifted" },
];

// How each stance should read in the edit prompt.
export const STANCE_PROMPTS: Record<string, string> = {
  lowered: "moderately lowered suspension, reduced wheel gap",
  slammed: "aggressively low, nearly no wheel gap",
  lifted: "raised off-road suspension with taller ride height",
};

// vlt = visible light transmission (lower = darker glass).
export const TINTS: TintOption[] = [
  { id: "light", label: "Light", vlt: 50 },
  { id: "medium", label: "Medium", vlt: 35 },
  { id: "dark", label: "Dark", vlt: 20 },
  { id: "limo", label: "Limo", vlt: 5 },
];

export const HEADLIGHTS: ChipOption[] = [
  { id: "smoked", label: "Smoked" },
  { id: "blacked", label: "Blacked out" },
  { id: "halo", label: "LED halo" },
];

export const HEADLIGHT_PROMPTS: Record<string, string> = {
  smoked: "smoked/tinted headlight and taillight lenses",
  blacked: "fully blacked-out headlight and taillight lenses",
  halo: "LED halo ring daytime running lights in the headlights",
};

export const UNDERGLOWS: SwatchOption[] = [
  { id: "purple", label: "Purple", hex: "#a855f7" },
  { id: "blue", label: "Electric blue", hex: "#3b82f6" },
  { id: "green", label: "Acid green", hex: "#84cc16" },
  { id: "pink", label: "Hot pink", hex: "#ec4899" },
  { id: "red", label: "Red", hex: "#ef4444" },
  { id: "white", label: "Ice white", hex: "#e0f2fe" },
];

// "Lowered stance" and "Tinted windows" left out — stance and tint
// have dedicated controls now.
export const MODS: string[] = [
  "Body kit",
  "Carbon hood",
  "Roof spoiler",
  "Side skirts",
  "Diffuser",
  "Widebody",
  "Racing stripes",
  "Clean & detail",
];

// Payload shared between the client request and the prompt builder.
export type ModOptions = {
  color: ColorOption | null;
  finish: FinishOption | null;
  rim: RimOption | null;
  rimColor: SwatchOption | null;
  rimSize: ChipOption | null;
  stance: ChipOption | null;
  tint: TintOption | null;
  headlights: ChipOption | null;
  underglow: SwatchOption | null;
  mods: string[];
  freeText: string;
};

export const EMPTY_OPTIONS: ModOptions = {
  color: null,
  finish: null,
  rim: null,
  rimColor: null,
  rimSize: null,
  stance: null,
  tint: null,
  headlights: null,
  underglow: null,
  mods: [],
  freeText: "",
};

// ── Preset build styles ──────────────────────────────────────────
// One-tap specs that fill the whole sheet. Values reference the
// option lists above so the UI stays a single source of truth.

export type PresetOption = {
  id: string;
  label: string;
  description: string;
  spec: ModOptions;
};

const colorByName = (name: string): ColorOption =>
  COLORS.find((c) => c.name === name)!;
const rimById = (id: string): RimOption => RIMS.find((r) => r.id === id)!;
const finishById = (id: string): FinishOption =>
  FINISHES.find((f) => f.id === id)!;
const tintById = (id: string): TintOption => TINTS.find((t) => t.id === id)!;
const rimColorById = (id: string): SwatchOption =>
  RIM_COLORS.find((c) => c.id === id)!;
const rimSizeById = (id: string): ChipOption =>
  RIM_SIZES.find((s) => s.id === id)!;
const stanceById = (id: string): ChipOption =>
  STANCES.find((s) => s.id === id)!;
const headlightsById = (id: string): ChipOption =>
  HEADLIGHTS.find((h) => h.id === id)!;
const underglowById = (id: string): SwatchOption =>
  UNDERGLOWS.find((u) => u.id === id)!;

export const PRESETS: PresetOption[] = [
  {
    id: "jdm",
    label: "JDM Street",
    description: "Pearl white, bronze mesh, dropped and tucked",
    spec: {
      ...EMPTY_OPTIONS,
      color: colorByName("Pearl white"),
      finish: finishById("gloss"),
      rim: rimById("mesh"),
      rimColor: rimColorById("bronze"),
      rimSize: rimSizeById("19"),
      stance: stanceById("lowered"),
      tint: tintById("medium"),
      mods: ["Side skirts", "Roof spoiler"],
      freeText: "Clean JDM street style",
    },
  },
  {
    id: "murdered",
    label: "Murdered Out",
    description: "Matte black, black rims, limo glass",
    spec: {
      ...EMPTY_OPTIONS,
      color: colorByName("Midnight black"),
      finish: finishById("matte"),
      rim: rimById("sport"),
      rimColor: rimColorById("black"),
      rimSize: rimSizeById("20"),
      stance: stanceById("lowered"),
      tint: tintById("limo"),
      headlights: headlightsById("blacked"),
      mods: ["Diffuser"],
      freeText: "Black out all badges and trim",
    },
  },
  {
    id: "trackday",
    label: "Track Day",
    description: "Race-prepped: aero, stripes, carbon",
    spec: {
      ...EMPTY_OPTIONS,
      color: colorByName("Racing red"),
      finish: finishById("gloss"),
      rim: rimById("sport"),
      rimColor: rimColorById("gunmetal"),
      rimSize: rimSizeById("19"),
      stance: stanceById("lowered"),
      tint: tintById("light"),
      mods: ["Carbon hood", "Roof spoiler", "Diffuser", "Racing stripes"],
      freeText: "Race-prepped track look",
    },
  },
  {
    id: "stanced",
    label: "Stanced",
    description: "Slammed, widebody, deep dish flush",
    spec: {
      ...EMPTY_OPTIONS,
      color: colorByName("Gunmetal gray"),
      finish: finishById("satin"),
      rim: rimById("deepdish"),
      rimColor: rimColorById("chrome"),
      rimSize: rimSizeById("19"),
      stance: stanceById("slammed"),
      tint: tintById("dark"),
      headlights: headlightsById("smoked"),
      mods: ["Widebody", "Diffuser"],
      freeText: "Slammed stance with flush wheel fitment",
    },
  },
  {
    id: "lowrider",
    label: "Lowrider",
    description: "Candy paint, chrome, purple glow",
    spec: {
      ...EMPTY_OPTIONS,
      color: colorByName("Deep purple"),
      finish: finishById("pearl"),
      rim: rimById("chrome"),
      rimColor: rimColorById("chrome"),
      stance: stanceById("slammed"),
      tint: tintById("medium"),
      underglow: underglowById("purple"),
      mods: ["Clean & detail"],
      freeText: "Classic lowrider style with candy paint depth",
    },
  },
  {
    id: "overlander",
    label: "Overlander",
    description: "Matte green, lifted, ready for dirt",
    spec: {
      ...EMPTY_OPTIONS,
      color: colorByName("British green"),
      finish: finishById("matte"),
      rim: rimById("stock"),
      rimColor: rimColorById("black"),
      stance: stanceById("lifted"),
      tint: tintById("light"),
      mods: ["Clean & detail"],
      freeText: "All-terrain tires, roof rack with light bar",
    },
  },
];

export type GenerateRequest = {
  image: string; // data URL: data:image/...;base64,....
} & ModOptions;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
export const DAILY_LIMIT = 10;
