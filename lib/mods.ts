// Shared domain data + types for Pimp My Vehicle.
// Imported by both client components (ControlPanel) and the API route.

export type ColorOption = { name: string; hex: string };
export type RimOption = { id: string; label: string };
export type FinishOption = { id: string; label: string };
export type TintOption = { id: string; label: string; vlt: number };

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

export const RIMS: RimOption[] = [
  { id: "stock", label: "Stock" },
  { id: "sport", label: "Sport spoke" },
  { id: "mesh", label: "Mesh flow" },
  { id: "deepdish", label: "Deep dish" },
  { id: "chrome", label: "Chrome split" },
];

export const FINISHES: FinishOption[] = [
  { id: "gloss", label: "Gloss" },
  { id: "satin", label: "Satin" },
  { id: "matte", label: "Matte" },
  { id: "metallic", label: "Metallic" },
  { id: "pearl", label: "Pearl" },
];

// vlt = visible light transmission (lower = darker glass).
export const TINTS: TintOption[] = [
  { id: "light", label: "Light", vlt: 50 },
  { id: "medium", label: "Medium", vlt: 35 },
  { id: "dark", label: "Dark", vlt: 20 },
  { id: "limo", label: "Limo", vlt: 5 },
];

// "Tinted windows" left out — tint has a dedicated control.
export const MODS: string[] = [
  "Lowered stance",
  "Body kit",
  "Carbon hood",
  "Roof spoiler",
  "Side skirts",
  "Diffuser",
  "Widebody",
  "Racing stripes",
  "Clean & detail",
];

// ── Preset build styles ──────────────────────────────────────────
// One-tap specs that fill the whole sheet. Values reference the
// option lists above so the UI stays a single source of truth.

export type PresetOption = {
  id: string;
  label: string;
  description: string;
  spec: {
    color: ColorOption | null;
    finish: FinishOption | null;
    rim: RimOption | null;
    tint: TintOption | null;
    mods: string[];
    freeText: string;
  };
};

const colorByName = (name: string): ColorOption =>
  COLORS.find((c) => c.name === name)!;
const rimById = (id: string): RimOption => RIMS.find((r) => r.id === id)!;
const finishById = (id: string): FinishOption =>
  FINISHES.find((f) => f.id === id)!;
const tintById = (id: string): TintOption => TINTS.find((t) => t.id === id)!;

export const PRESETS: PresetOption[] = [
  {
    id: "jdm",
    label: "JDM Street",
    description: "Pearl white, mesh rims, dropped and tucked",
    spec: {
      color: colorByName("Pearl white"),
      finish: finishById("gloss"),
      rim: rimById("mesh"),
      tint: tintById("medium"),
      mods: ["Lowered stance", "Side skirts", "Roof spoiler"],
      freeText: "Clean JDM street style",
    },
  },
  {
    id: "murdered",
    label: "Murdered Out",
    description: "Matte black on black, limo glass",
    spec: {
      color: colorByName("Midnight black"),
      finish: finishById("matte"),
      rim: rimById("sport"),
      tint: tintById("limo"),
      mods: ["Lowered stance", "Diffuser"],
      freeText: "Black out all badges, trim, and rims",
    },
  },
  {
    id: "trackday",
    label: "Track Day",
    description: "Race-prepped: aero, stripes, carbon",
    spec: {
      color: colorByName("Racing red"),
      finish: finishById("gloss"),
      rim: rimById("sport"),
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
      color: colorByName("Gunmetal gray"),
      finish: finishById("satin"),
      rim: rimById("deepdish"),
      tint: tintById("dark"),
      mods: ["Lowered stance", "Widebody", "Diffuser"],
      freeText: "Slammed stance with flush wheel fitment",
    },
  },
  {
    id: "lowrider",
    label: "Lowrider",
    description: "Candy paint, chrome, classic cruiser",
    spec: {
      color: colorByName("Deep purple"),
      finish: finishById("pearl"),
      rim: rimById("chrome"),
      tint: tintById("medium"),
      mods: ["Lowered stance", "Clean & detail"],
      freeText: "Classic lowrider style with candy paint depth",
    },
  },
  {
    id: "overlander",
    label: "Overlander",
    description: "Matte green, lifted, ready for dirt",
    spec: {
      color: colorByName("British green"),
      finish: finishById("matte"),
      rim: rimById("stock"),
      tint: tintById("light"),
      mods: ["Clean & detail"],
      freeText:
        "Slight suspension lift, all-terrain tires, roof rack with light bar",
    },
  },
];

// Payload shared between the client request and the prompt builder.
export type ModOptions = {
  color: ColorOption | null;
  finish: FinishOption | null;
  rim: RimOption | null;
  tint: TintOption | null;
  mods: string[];
  freeText: string;
};

export type GenerateRequest = {
  image: string; // data URL: data:image/...;base64,....
} & ModOptions;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
export const DAILY_LIMIT = 10;
