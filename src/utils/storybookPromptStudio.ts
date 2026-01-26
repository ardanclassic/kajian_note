import type { StorybookPromptConfig } from "@/types/promptStudio.types";
import {
  CHARACTER_CONCEPTS,
  STORY_ART_STYLES,
  STORY_GENRE_OPTIONS,
  STORY_TARGET_AUDIENCE,
} from "@/types/promptStudio.types";

export function generateStorybookPrompt(config: StorybookPromptConfig): string {
  const {
    topic,
    genre,
    targetAudience,
    moralValue,
    language,
    artStyle,
    characterConcept,
    setting,
    colorPalette,
    pageCount,
    includeIllustrationPrompts,
  } = config;

  const genreLabel = STORY_GENRE_OPTIONS.find((o) => o.value === genre)?.label || genre;
  const audienceLabel = STORY_TARGET_AUDIENCE.find((o) => o.value === targetAudience)?.label || targetAudience;
  const styleLabel = STORY_ART_STYLES.find((o) => o.value === artStyle)?.label || artStyle;
  const conceptLabel = CHARACTER_CONCEPTS.find((o) => o.value === characterConcept)?.label || characterConcept;

  const langInstruction =
    language === "id"
      ? "Bahasa Indonesia (Gunakan bahasa yang hangat, mendidik, dan sesuai usia anak)"
      : "English (Use warm, educational, and age-appropriate language)";

  const shariaRules = `
## STRICT SHARIA COMPLIANCE RULES (CRITICAL)
1.  **Visual Constraints**:
    *   **${conceptLabel.toUpperCase()}**: You must strictly adhere to this visual style.
    *   **NO FACIAL FEATURES**: If humans are depicted, they MUST be faceless (no eyes, nose, mouth) or silhouettes.
    *   **AURAT**: All human characters must be fully clothed according to Islamic modesty (Hijab/loose clothing for women/girls).
    *   **NO MUSIC**: Do not depict musical instruments.
    *   **NO SHIRK**: Avoid any magical elements that contradict Islamic Tawheed (unless it's a specific fantasy fable explicitly framed as fiction, but keep it grounded in Islamic values).
2.  **Content Constraints**:
    *   Values must align with Quran & Sunnah.
    *   No boyfriend/girlfriend relationships or immoral behavior.
    *   Respectful representation of Prophets and Sahaba (use "Alaihis Salam", "Radhiyallahu 'anhu", etc.).
  `;

  const illustrationInstruction = includeIllustrationPrompts
    ? `For each page, provide a detailed **AI Image Generation Prompt** describing the scene.
       - Style: ${styleLabel}
       - Character: ${conceptLabel}
       - Color Palette: ${colorPalette}
       - View: Cinematic, clean composition.`
    : "";

  return `# PROMPT: Islamic Storybook Generator (Gemini/Claude/GPT)

## ROLE
Act as a professional Islamic Children's Book Author and Illustrator. You are an expert in creating engaging, moral-driven stories for Muslim children that strictly adhere to Sharia guidelines.

## PROJECT CONTEXT
Create a storyboard for a children's book with the following specifications:

*   **Topic**: ${topic}
*   **Genre**: ${genreLabel}
*   **Target Audience**: ${audienceLabel}
*   **Moral Value/Lesson**: ${moralValue}
*   **Page Count**: Approx. ${pageCount} pages

## VISUAL DIRECTION
*   **Art Style**: ${styleLabel}
*   **Character Concept**: ${conceptLabel}
*   **Setting**: ${setting}
*   **Color Palette**: ${colorPalette}

${shariaRules}

## OUTPUT FORMAT
**Language**: ${langInstruction}

Please structure the response as a **Page-by-Page Storyboard**.
For each page (1 to ${pageCount}), provide:
1.  **Page Number**
2.  **Story Text**: The actual text to be read aloud (keep it rhythmic/engaging).
3.  **Visual Description**: Description of what is happening in the scene.
${includeIllustrationPrompts ? "4.  **Image Prompt**: A specific prompt optimized for Nano Banana to generate the illustration." : ""}

---

## EXECUTION
Start by outlining the **Plot Summary** (1 paragraph) and **Character List** (if any).
Then, proceed with the **Page-by-Page Storyboard**.
`;
}

export function validateStorybookConfig(config: StorybookPromptConfig): string[] {
  const errors: string[] = [];
  if (!config.topic.trim()) errors.push("Topik cerita wajib diisi");
  if (!config.moralValue.trim()) errors.push("Pesan moral wajib diisi");
  return errors;
}
