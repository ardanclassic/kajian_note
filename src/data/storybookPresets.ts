import type { StorybookPromptConfig } from "@/types/promptStudio.types";

export const CUSTOM_PRESETS: Record<string, Partial<StorybookPromptConfig>> = {
  "muslim-kids-daily": {
    topic: "Belajar Adab Makan Bersama Keluarga",
    genre: "modern-muslim",
    targetAudience: "preschool",
    moralValue: "Adab Makan & Minum (Bismillah, Tangan Kanan, Duduk)",
    artStyle: "flat-vector",
    characterConcept: "faceless",
    setting: "modern-home",
    colorPalette: "pastel",
    pageCount: 10,
  },
  "prophet-story-creation": {
    topic: "Kisah Penciptaan Alam Semesta (Langit & Bumi)",
    genre: "prophets-story",
    targetAudience: "early-reader",
    moralValue: "Kekuasaan Allah menciptakan alam semesta yang indah",
    artStyle: "watercolor",
    characterConcept: "nature",
    setting: "nature",
    colorPalette: "earth-tones",
    pageCount: 12,
  },
  "bedtime-dhikr": {
    topic: "Petualangan Bintang Kecil yang Selalu Berdzikir",
    genre: "bedtime",
    targetAudience: "toddler",
    moralValue: "Ketenangan hati dengan mengingat Allah sebelum tidur",
    artStyle: "textured-collage",
    characterConcept: "silhouette",
    setting: "fantasy",
    colorPalette: "cool",
    pageCount: 8,
  },
  "quran-fables": {
    topic: "Kisah Ikan Paus yang Menyelamatkan Nabi Yunus a.s.",
    genre: "quran-fables",
    targetAudience: "preschool",
    moralValue: "Kesabaran dan taubat kepada Allah SWT",
    artStyle: "digital-painting",
    characterConcept: "objects",
    setting: "underwater",
    colorPalette: "cool",
    pageCount: 10,
  },
  "nature-adventure": {
    topic: "Petualangan Mendaki Gunung Sambil Bertasbih",
    genre: "adventure",
    targetAudience: "pre-teen",
    moralValue: "Tadabbur Alam & Mengagumi Ciptaan Allah",
    artStyle: "watercolor",
    characterConcept: "faceless",
    setting: "nature",
    colorPalette: "vibrant",
    pageCount: 14,
  },
  "mosque-manners": {
    topic: "Hari Pertama Ali Shalat Jumat di Masjid",
    genre: "islamic-moral",
    targetAudience: "early-reader",
    moralValue: "Cinta Masjid & Adab Shalat Berjamaah",
    artStyle: "flat-vector",
    characterConcept: "faceless",
    setting: "mosque",
    colorPalette: "warm",
    pageCount: 10,
  },
  "ramadan-joy": {
    topic: "Puasa Pertama Sarah yang Penuh Berkah",
    genre: "modern-muslim",
    targetAudience: "early-reader",
    moralValue: "Kesabaran & Kegembiraan menyambut Ramadhan",
    artStyle: "crayon",
    characterConcept: "faceless",
    setting: "modern-home",
    colorPalette: "vibrant",
    pageCount: 12,
  },
  "honest-trader": {
    topic: "Pedagang Jujur dan Timbangan Ajaib",
    genre: "islamic-moral",
    targetAudience: "pre-teen",
    moralValue: "Kejujuran dalam bermuamalah membawa keberkahan",
    artStyle: "pencil-sketch",
    characterConcept: "objects",
    setting: "city",
    colorPalette: "vintage",
    pageCount: 14,
  },
  "kindness-animals": {
    topic: "Kucing Haus dan Sepatu Butut",
    genre: "islamic-moral",
    targetAudience: "preschool",
    moralValue: "Kasih sayang kepada mahluk ciptaan Allah",
    artStyle: "watercolor",
    characterConcept: "nature",
    setting: "village",
    colorPalette: "earth-tones",
    pageCount: 8,
  },
};

export const STORYBOOK_PRESET_METADATA: Record<string, { label: string; description: string }> = {
  "muslim-kids-daily": {
    label: "Muslim Kids Daily Life",
    description: "Cerita rutinitas anak muslim (adab makan, tidur) dengan visual modern.",
  },
  "prophet-story-creation": {
    label: "Prophet Story (Nature Focus)",
    description: "Kisah Nabi fokus pada alam & visual watercolor, tanpa visual manusia.",
  },
  "bedtime-dhikr": {
    label: "Bedtime Dhikr & Sleep",
    description: "Cerita pengantar tidur yang menenangkan dengan visual siluet & fantasi.",
  },
  "quran-fables": {
    label: "Fables from Quran (Hewan)",
    description: "Kisah hewan dalam Al-Quran (Paus, Semut, Lebah) dengan visual emosional.",
  },
  "nature-adventure": {
    label: "Tadabbur Alam Adventure",
    description: "Petualangan alam penuh warna untuk mengajarkan rasa syukur.",
  },
  "mosque-manners": {
    label: "Love the Mosque",
    description: "Cerita tentang keindahan masjid dan shalat berjamaah untuk anak.",
  },
  "ramadan-joy": {
    label: "Ramadan First Fast",
    description: "Kisah semangat puasa pertama bagi anak-anak.",
  },
  "honest-trader": {
    label: "The Honest Trader",
    description: "Pelajaran tentang kejujuran dan amanah dalam berdagang.",
  },
  "kindness-animals": {
    label: "Kindness to Animals",
    description: "Kisah inspiratif tentang berbuat baik kepada hewan.",
  },
};

export function getStorybookPreset(key: string): Partial<StorybookPromptConfig> | null {
  return CUSTOM_PRESETS[key] || null;
}
