// Prompt Studio Types

export interface ImagePromptConfigExtended {
  topic: string;
  targetAudience: string;
  designConcept: string;
  style: string;
  colorScheme: string;
  aspectRatio: string;
  mood: string;
  lighting: string;
  perspective: string;
  backgroundComplexity: string;
  additionalDetails: string;
  isIslamic: boolean; // New flag for optional Islamic compliance
}

export interface SavedPrompt {
  id: number;
  name: string;
  config: ImagePromptConfigExtended;
  timestamp: string;
}

export const PROMPT_SECTIONS = {
  HEADER: "# Professional Image Generation Prompt",
  ROLE: "## Role & Expertise Assignment",
  CONTEXT: "## Project Context & Purpose",
  BRIEF: "## Creative Brief",
  COMPOSITION: "## Scene Composition",
  VISUAL_STYLE: "## Visual Style Specifications",
  TECHNICAL: "## Technical Specifications",
  ISLAMIC: "## CRITICAL REQUIREMENT: Islamic Compliance",
  DESIGN_ELEMENTS: "## Design Elements & Additional Details",
  QUALITY: "## Quality Standards",
  KEYWORDS: "## Reference Keywords",
} as const;

export const DESIGN_CONCEPTS = [
  { value: "modern", label: "Modern" },
  { value: "minimalist", label: "Minimalist" },
  { value: "classic", label: "Classic" },
  { value: "contemporary", label: "Contemporary" },
  { value: "elegant", label: "Elegant" },
  { value: "futuristic", label: "Futuristic" },
  { value: "retro", label: "Retro/Vintage" },
  { value: "abstract", label: "Abstract" },
] as const;

export const STYLE_OPTIONS = [
  { value: "illustration", label: "Illustration" },
  { value: "flat-design", label: "Flat Design" },
  { value: "photorealistic", label: "Photorealistic" },
  { value: "vector-art", label: "Vector Art" },
  { value: "watercolor", label: "Watercolor" },
  { value: "3d-render", label: "3D Render" },
  { value: "line-art", label: "Line Art" },
  { value: "oil-painting", label: "Oil Painting" },
  { value: "cyberpunk", label: "Cyberpunk" },
] as const;

export const COLOR_SCHEMES = [
  { value: "vibrant", label: "Vibrant" },
  { value: "pastel", label: "Pastel" },
  { value: "monochrome", label: "Monochrome" },
  { value: "warm-tones", label: "Warm Tones" },
  { value: "cool-tones", label: "Cool Tones" },
  { value: "earth-tones", label: "Earth Tones" },
  { value: "emerald-gold", label: "Emerald & Gold (Islamic)" },
  { value: "cyber-neon", label: "Cyber Neon" },
  { value: "black-white", label: "Black & White" },
] as const;

export const ASPECT_RATIOS = [
  { value: "1:1", label: "1:1 (Square)" },
  { value: "16:9", label: "16:9 (Landscape)" },
  { value: "9:16", label: "9:16 (Portrait)" },
  { value: "4:3", label: "4:3" },
  { value: "3:4", label: "3:4" },
  { value: "21:9", label: "21:9 (Ultrawide)" },
] as const;

export const MOOD_OPTIONS = [
  { value: "warm-inviting", label: "Warm & Inviting" },
  { value: "peaceful-calm", label: "Peaceful & Calm" },
  { value: "energetic-vibrant", label: "Energetic & Vibrant" },
  { value: "professional-serious", label: "Professional & Serious" },
  { value: "joyful-cheerful", label: "Joyful & Cheerful" },
  { value: "contemplative", label: "Contemplative" },
  { value: "mysterious", label: "Mysterious" },
  { value: "dramatic", label: "Dramatic" },
] as const;

export const LIGHTING_OPTIONS = [
  { value: "soft-natural", label: "Soft Natural" },
  { value: "golden-hour", label: "Golden Hour" },
  { value: "studio", label: "Studio Lighting" },
  { value: "dramatic", label: "Dramatic" },
  { value: "bright-even", label: "Bright Even" },
  { value: "cinematic", label: "Cinematic" },
  { value: "neon-glow", label: "Neon Glow" },
] as const;

export const PERSPECTIVE_OPTIONS = [
  { value: "eye-level", label: "Eye Level" },
  { value: "bird-eye", label: "Bird's Eye" },
  { value: "low-angle", label: "Low Angle" },
  { value: "three-quarter", label: "3/4 Angle" },
  { value: "side-view", label: "Side View" },
  { value: "close-up", label: "Close Up / Macro" },
] as const;

export const BACKGROUND_OPTIONS = [
  { value: "minimal", label: "Minimal (Clean)" },
  { value: "moderate", label: "Moderate (Balanced)" },
  { value: "detailed", label: "Detailed (Environment)" },
  { value: "solid-color", label: "Solid Color" },
  { value: "gradient", label: "Gradient" },
] as const;

export const DEFAULT_IMAGE_PROMPT_CONFIG: ImagePromptConfigExtended = {
  topic: "",
  targetAudience: "",
  designConcept: "modern",
  style: "illustration",
  colorScheme: "vibrant",
  aspectRatio: "1:1",
  mood: "warm-inviting",
  lighting: "soft-natural",
  perspective: "eye-level",
  backgroundComplexity: "moderate",
  additionalDetails: "",
  isIslamic: true, // Default to true because of the app context, but user can toggle
};

export const PROMPT_PRESETS: Record<string, Partial<ImagePromptConfigExtended>> = {
  "islamic-poster": {
    topic: "Islamic motivational poster with beautiful Arabic calligraphy and Quran verse typography",
    designConcept: "minimalist",
    style: "flat-design",
    colorScheme: "emerald-gold",
    aspectRatio: "9:16",
    mood: "contemplative",
    backgroundComplexity: "minimal",
    isIslamic: true,
  },
  "family-illustration": {
    topic: "Muslim family enjoying quality time together at home, reading Quran after Maghrib prayer",
    designConcept: "modern",
    style: "illustration",
    colorScheme: "warm-tones",
    aspectRatio: "1:1",
    mood: "warm-inviting",
    lighting: "golden-hour",
    isIslamic: true,
  },
  "educational-infographic": {
    topic: "Infographic explaining the pillars of Islam with icons and simple illustrations",
    designConcept: "contemporary",
    style: "flat-design",
    colorScheme: "vibrant",
    aspectRatio: "9:16",
    mood: "professional-serious",
    backgroundComplexity: "detailed",
    isIslamic: true,
  },
  "generic-landscape": {
    topic: "Breathtaking mountain landscape at sunrise with a calm lake reflection",
    designConcept: "modern",
    style: "photorealistic",
    colorScheme: "earth-tones",
    aspectRatio: "16:9",
    mood: "peaceful-calm",
    lighting: "golden-hour",
    perspective: "wide-angle",
    isIslamic: false,
  },
  "tech-startup": {
    topic: "Modern tech office environment with diverse team collaborating on futuristic screens",
    designConcept: "modern",
    style: "illustration",
    colorScheme: "cool-tones",
    aspectRatio: "16:9",
    mood: "energetic-vibrant",
    lighting: "studio",
    isIslamic: false,
  },
  "coffee-shop-brand": {
    topic: "Cozy Islamic-themed coffee shop with arabic calligraphy wall art and warm lighting",
    designConcept: "modern",
    style: "photorealistic",
    colorScheme: "warm-tones",
    aspectRatio: "4:5",
    mood: "warm-inviting",
    lighting: "soft-natural",
    backgroundComplexity: "detailed",
    isIslamic: true,
  },
  "quran-study-group": {
    topic: "Diverse group of young muslims sitting in a circle reciting Quran in a mosque",
    designConcept: "classic",
    style: "illustration",
    colorScheme: "earth-tones",
    aspectRatio: "1:1",
    mood: "peaceful-calm",
    lighting: "soft-natural",
    perspective: "eye-level",
    isIslamic: true,
  },
  "ramadan-lanterns": {
    topic: "Magical Ramadan night atmosphere with glowing fanous lanterns and crescent moon",
    designConcept: "elegant",
    style: "3d-render",
    colorScheme: "emerald-gold",
    aspectRatio: "9:16",
    mood: "joyful-cheerful",
    lighting: "neon-glow",
    backgroundComplexity: "minimal",
    isIslamic: true,
  },
  "futuristic-mosque": {
    topic: "Futuristic sustainable eco-mosque concept with vertical gardens and solar geometric domes",
    designConcept: "futuristic",
    style: "digital-painting",
    colorScheme: "cool-tones",
    aspectRatio: "16:9",
    mood: "mysterious",
    lighting: "cinematic",
    perspective: "bird-eye",
    isIslamic: true,
  },
};

// ============================================================================
// TA'ARUF CV GENERATOR TYPES
// ============================================================================

export interface TaarufPromptConfig {
  // Basic Information
  fullName: string;
  age: string;
  gender: "male" | "female" | "";
  currentResidence: string;
  ethnicity: string;
  height: string;
  weight: string;

  // Religious Background
  dailyPractices: string;
  islamicStudies: string;
  spiritualGoals: string;

  // Educational Background
  highestEducation: string;
  certifications: string;
  academicAchievements: string;

  // Professional Profile
  currentOccupation: string;
  careerLevel: string;
  professionalGoals: string;
  incomeRange: string;

  // Family Background
  familyStructure: string;
  parentsOccupation: string;
  familyValues: string;
  familyReligiousPractice: string;

  // Personality & Interests
  characterDescription: string;
  hobbies: string;
  strengths: string;
  growthAreas: string;

  // Vision for Marriage
  marriageGoals: string;
  idealFamilyVision: string;
  preferredChildrenCount: string;
  residencePlan: string;
  rolesResponsibilitiesView: string;

  // Criteria for Potential Spouse
  primaryCriteria: string;
  secondaryCriteria: string;
  worldlyPreferences: string;
  ageRangePreference: string;

  // Additional Information
  healthStatus: string;
  previousMarriage: string;
  availabilityForTaaruf: string;
  contactMethod: string;
}

export const GENDER_OPTIONS = [
  { value: "male", label: "Laki-laki" },
  { value: "female", label: "Perempuan" },
] as const;

export const CAREER_LEVEL_OPTIONS = [
  { value: "student", label: "Pelajar/Mahasiswa" },
  { value: "entry", label: "Entry Level (0-2 tahun)" },
  { value: "mid", label: "Mid Level (3-7 tahun)" },
  { value: "senior", label: "Senior Level (8+ tahun)" },
  { value: "entrepreneur", label: "Wirausaha/Pengusaha" },
  { value: "professional", label: "Profesional/Spesialis" },
] as const;

export const PREVIOUS_MARRIAGE_OPTIONS = [
  { value: "never", label: "Belum Pernah Menikah" },
  { value: "divorced", label: "Duda/Janda (Cerai)" },
  { value: "widowed", label: "Duda/Janda (Cerai Mati)" },
] as const;

export const ROLES_RESPONSIBILITY_OPTIONS = [
  { value: "traditional", label: "Tradisional (Suami Qawwam, Istri Pengatur Rumah)" },
  { value: "partnership", label: "Partnership (Musyawarah dalam Koridor Syariat)" },
  { value: "flexible", label: "Fleksibel (Disesuaikan Kondisi Keluarga)" },
] as const;

export const DEFAULT_TAARUF_PROMPT_CONFIG: TaarufPromptConfig = {
  fullName: "",
  age: "",
  gender: "",
  currentResidence: "",
  ethnicity: "",
  height: "",
  weight: "",
  dailyPractices: "",
  islamicStudies: "",
  spiritualGoals: "",
  highestEducation: "",
  certifications: "",
  academicAchievements: "",
  currentOccupation: "",
  careerLevel: "entry",
  professionalGoals: "",
  incomeRange: "",
  familyStructure: "",
  parentsOccupation: "",
  familyValues: "",
  familyReligiousPractice: "",
  characterDescription: "",
  hobbies: "",
  strengths: "",
  growthAreas: "",
  marriageGoals: "",
  idealFamilyVision: "",
  preferredChildrenCount: "",
  residencePlan: "",
  rolesResponsibilitiesView: "partnership",
  primaryCriteria: "",
  secondaryCriteria: "",
  worldlyPreferences: "",
  ageRangePreference: "",
  healthStatus: "",
  previousMarriage: "never",
  availabilityForTaaruf: "",
  contactMethod: "",
};

// ============================================================================
// STORYBOOK GENERATOR TYPES
// ============================================================================

export interface StorybookPromptConfig {
  // Core Story
  topic: string;
  genre: string;
  targetAudience: string;
  moralValue: string;
  language: "id" | "en";

  // Visual Direction
  artStyle: string;
  characterConcept: "faceless" | "silhouette" | "objects" | "nature"; // Enforce sharia compliance options
  setting: string;
  colorPalette: string;

  // Structure
  pageCount: number;
  includeIllustrationPrompts: boolean;
}

export const STORY_GENRE_OPTIONS = [
  { value: "islamic-moral", label: "Islamic Moral Story (Akhlaq)" },
  { value: "prophets-story", label: "Story of Prophets (Qisas Al-Anbiya)" },
  { value: "seerah", label: "Seerah (Life of Prophet Muhammad ﷺ)" },
  { value: "daily-dua", label: "Daily Dua & Adab" },
  { value: "quran-fables", label: "Fables from Quran (Hewan dalam Al-Quran)" },
  { value: "modern-muslim", label: "Modern Muslim Kid Life" },
  { value: "bedtime", label: "Calm Bedtime Story" },
  { value: "adventure", label: "Adventure & Discovery" },
] as const;

export const STORY_TARGET_AUDIENCE = [
  { value: "toddler", label: "Toddler (0-3 years)" },
  { value: "preschool", label: "Preschool (3-5 years)" },
  { value: "early-reader", label: "Early Reader (5-8 years)" },
  { value: "pre-teen", label: "Pre-teen (8-12 years)" },
] as const;

export const STORY_ART_STYLES = [
  { value: "watercolor", label: "Soft Watercolor (Pastel)" },
  { value: "flat-vector", label: "Clean Flat Vector (Modern)" },
  { value: "textured-collage", label: "Textured Paper Collage (Eric Carle Style)" },
  { value: "pencil-sketch", label: "Warm Pencil Sketch" },
  { value: "crayon", label: "Childlike Crayon/Chalk" },
  { value: "digital-painting", label: "Vibrant Digital Painting" },
  { value: "islamic-pattern", label: "Geometric/Floral Islamic Patterns" },
] as const;

export const CHARACTER_CONCEPTS = [
  { value: "faceless", label: "Faceless Humans" },
  { value: "silhouette", label: "Silhouette Only" },
  { value: "objects", label: "Inanimate Objects" },
  { value: "nature", label: "Nature & Scenery Only" },
] as const;

export const STORY_SETTING_OPTIONS = [
  { value: "modern-home", label: "Modern Home / Daily Life" },
  { value: "nature", label: "Nature / Forest / Garden" },
  { value: "school", label: "School / Playground" },
  { value: "mosque", label: "Mosque / Islamic Center" },
  { value: "city", label: "City / Urban" },
  { value: "village", label: "Village / Countryside" },
  { value: "fantasy", label: "Fantasy / Dream World" },
  { value: "historical", label: "Historical / Ancient (Prophet Stories)" },
  { value: "space", label: "Space / Cosmos" },
  { value: "underwater", label: "Underwater / Ocean" },
] as const;

export const STORY_COLOR_PALETTE_OPTIONS = [
  { value: "pastel", label: "Pastel (Soft & Gentle)" },
  { value: "vibrant", label: "Vibrant (Bright & Cheerful)" },
  { value: "earth-tones", label: "Earth Tones (Natural & Warm)" },
  { value: "monochromatic", label: "Monochromatic (Clean & Simple)" },
  { value: "warm", label: "Warm (Orange/Yellow/Red)" },
  { value: "cool", label: "Cool (Blue/Green/Teal)" },
  { value: "black-white", label: "Black & White (High Contrast)" },
  { value: "vintage", label: "Vintage / Sepia" },
] as const;

export const DEFAULT_STORYBOOK_CONFIG: StorybookPromptConfig = {
  topic: "",
  genre: "islamic-moral",
  targetAudience: "preschool",
  moralValue: "",
  language: "id",
  artStyle: "watercolor",
  characterConcept: "faceless",
  setting: "modern-home",
  colorPalette: "pastel",
  pageCount: 10,
  includeIllustrationPrompts: true,
};
