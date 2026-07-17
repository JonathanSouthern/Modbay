// Shared domain data + types for AutoMod Studio.
// Imported by both client components (ControlPanel) and the API route.

export type ColorOption = { name: string; hex: string };
export type RimOption = { id: string; label: string };

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

export const MODS: string[] = [
  "Lowered stance",
  "Body kit",
  "Carbon hood",
  "Tinted windows",
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
  rim: RimOption | null;
  mods: string[];
  freeText: string;
};

export type GenerateRequest = {
  image: string; // data URL: data:image/...;base64,....
} & ModOptions;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
export const DAILY_LIMIT = 10;
