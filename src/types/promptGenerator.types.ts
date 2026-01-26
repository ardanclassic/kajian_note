export interface PromptConfig {
  topic: string;
  authorName: string;
  authorHashtag: string;
  aspectRatio: "4:5" | "9:16" | "3:4";
  category: "minimalist" | "visualist" | "split";
  subcategory: "flat" | "accent" | "dynamic" | "vignette" | "editorial" | "";
  slideCount: number;
  filename: string;
  domain: "islamic" | "general";
  language: "id" | "en";
}

export const DEFAULT_PROMPT_CONFIG: PromptConfig = {
  topic: "",
  authorName: "alwaah.project",
  authorHashtag: "ContentStudio",
  aspectRatio: "4:5",
  category: "minimalist",
  subcategory: "flat",
  slideCount: 10,
  filename: "",
  domain: "general",
  language: "id",
};

export const LANGUAGE_OPTIONS = [
  { value: "id", label: "Indonesia" },
  { value: "en", label: "English" },
] as const;

export const DOMAIN_OPTIONS = [
  { value: "islamic", label: "Konten Islami" },
  { value: "general", label: "Topik Umum" },
] as const;

export const CATEGORY_OPTIONS = [
  { value: "minimalist", label: "Minimalist", hasSubcategories: true },
  { value: "visualist", label: "Visualist", hasSubcategories: true },
  { value: "split", label: "Split", hasSubcategories: false },
] as const;

export const SUBCATEGORY_OPTIONS = {
  minimalist: [
    { value: "flat", label: "Flat" },
    { value: "accent", label: "Accent" },
    { value: "dynamic", label: "Dynamic" },
  ],
  visualist: [
    { value: "vignette", label: "Vignette (No Title)" },
    { value: "editorial", label: "Editorial (With Title)" },
  ],
  split: [],
} as const;

export const ASPECT_RATIO_OPTIONS = [
  { value: "4:5", label: "4:5 (IG Feed)" },
  { value: "9:16", label: "9:16 (Story/Reels)" },
  { value: "3:4", label: "3:4 (Potrait)" },
] as const;
