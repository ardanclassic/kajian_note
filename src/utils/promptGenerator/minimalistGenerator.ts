import type { PromptConfig } from "@/types/promptGenerator.types";

// --- Configuration Constants ---

const RATIO_SPECS = {
  "4:5": {
    coverTitle: "42-56",
    coverSub: "32-42",
    flatSize: "16",
    flatCap: "180 words",
    accentSize: "20-32",
    accentCap: "110 words",
    dynamicSize: "22-48",
    dynamicCap: "60 words",
  },
  "9:16": {
    coverTitle: "36-48",
    coverSub: "28-36",
    flatSize: "14",
    flatCap: "220 words",
    accentSize: "20-32",
    accentCap: "140 words",
    dynamicSize: "22-48",
    dynamicCap: "80 words",
  },
  "3:4": {
    coverTitle: "42-56",
    coverSub: "32-42",
    flatSize: "16",
    flatCap: "200 words",
    accentSize: "20-32",
    accentCap: "120 words",
    dynamicSize: "22-48",
    dynamicCap: "65 words",
  },
};

const SUBCATEGORY_SPECS = {
  flat: {
    label: "Minimalist Flat",
    profile: "Narrative, calm, detail-oriented.",
    design_rule: "Single Color Text. High Contrast Backgrounds (2 variants).",
    typography_rule: "UNIFORM Size. Weight 400 (Body).",
    layout_rule: `
    - **STRUCTURE:** MUST use **3-5 BLOCKS** per slide.
    - **LENGTH:** Short blocks (~30 words). SPLIT long paragraphs.
    - **ALIGNMENT:** Varied (Left/Right). Avoid Center.
    - **DENSITY:** High. Focus on readability.`,
  },
  accent: {
    label: "Minimalist Accent",
    profile: "Educational, flowy, structured.",
    design_rule:
      "Dual-Color Text. RANDOM SPECTRUM. Define 2-3 Slide Background Color Variants (Max) and ROTATE them sequentially.",
    typography_rule: "MILD VARIATION (20-32px). 2 Sizes per slide.",
    layout_rule: `
    - **STRUCTURE:** MUST use **2-3 BLOCKS** per slide.
    - **LENGTH:** Medium (~40 words).
    - **ALIGNMENT:** Prioritize Left/Right.
    - **DENSITY:** Moderate. Clean spacing.`,
  },
  dynamic: {
    label: "Minimalist Dynamic",
    profile: "Motivational, impactful, bold.",
    design_rule: "High Vibrancy. Define 3-5 Slide Background Color Variants and ROTATE them strictly.",
    typography_rule: "HIGH CONTRAST (22-48px). Big/Mid/Small mixed.",
    layout_rule: `
    - **STRUCTURE:** Flexible (1-4 blocks).
    - **VARIATION:** Extreme contrast in Size & Weight.
    - **ALIGNMENT:** Left/Right/Center mix.
    - **DENSITY:** Variable. Mix single words with punchy phrases.`,
  },
};

export function generateMinimalistPrompt(config: PromptConfig): string {
  const specs = RATIO_SPECS[config.aspectRatio];
  const subSpec = SUBCATEGORY_SPECS[config.subcategory as keyof typeof SUBCATEGORY_SPECS];

  if (!specs || !subSpec) throw new Error(`Invalid configuration`);

  // --- Context Logic ---
  const isDynamic = config.subcategory === "dynamic";
  const isAccent = config.subcategory === "accent";
  const isFlat = config.subcategory === "flat";
  const isIslamic = config.domain !== "general";
  const isIndonesian = config.language === "id";

  const roleText = isIslamic ? "Content Designer & Islamic Writer" : "Expert Content Strategist";
  const langText = isIndonesian ? "BAHASA INDONESIA" : "ENGLISH";

  // --- Capacity Logic ---
  const contentCap = isFlat ? specs.flatCap : isAccent ? specs.accentCap : specs.dynamicCap;

  // --- Ref Logic ---
  const refTitle = isIndonesian ? "Sumber Referensi" : "References";
  const refContent = isIndonesian
    ? isIslamic
      ? "1. Judul Kitab/Buku (Penulis)\\n2. Referensi Ayat/Hadits\\n3. Sumber Kredibel Lainnya"
      : "1. Judul Buku/Jurnal (Penulis)\\n2. Artikel Valid\\n3. Link Tepercaya"
    : isIslamic
      ? "1. Book/Kitab Title (Author)\\n2. Quran/Hadith Ref\\n3. Credible Source"
      : "1. Book/Journal Title (Author)\\n2. Valid Article\\n3. Trusted Link";

  // --- Taswib ---
  const taswibSection = isIslamic
    ? `\n## Taswib (Islamic Content Rules)\n- **Allah:** Must use Unicode \`ﷻ\` (e.g., "Allah ﷻ").\n- **Muhammad / Rasulullah:** Must use Unicode \`ﷺ\` (e.g., "Rasulullah ﷺ").\n- **Prophets:** Use "'Alaihis Salam".\n- **Companions:** Use "Radhiyallahu 'anhu/'anha".\n- **NO ABBREVIATIONS** (SWT, SAW, AS, RA, PBUH -> FORBIDDEN).`
    : "";

  return `# PROMPT: Minimalist Content Blueprint V2.2 - ${subSpec.label} (${config.aspectRatio})

## Role & Objective
Act as an ${roleText} specializing in **${subSpec.label}**.
**Goal:** Create a ${subSpec.profile.toUpperCase()} visual blueprint.
**LANGUAGE:** ${langText} (Strict).

## Input Data
\`\`\`text
${config.topic || "[TOPIC / ARTICLE / CONTEXT GOES HERE]"}
\`\`\`
**Author:** ${config.authorName} | **Hashtag:** ${config.authorHashtag} | **Target:** ${config.slideCount} Slides

## Design Rules (${subSpec.label})
- **Concept:** ${subSpec.profile}
- **Palette Logic:** ${subSpec.design_rule}
- **Typography:** ${subSpec.typography_rule}

## Critical Logic
1. **Context & Adab:**
   - **Language:** ${isIndonesian ? "BAHASA INDONESIA (No English)." : "ENGLISH (Professional)."}
   ${isIslamic ? "- **Islamic Topic:** STRICTLY follow 'Taswib' rules below." : ""}
2. **Slide Count & Depth:**
   - **Target:** ${config.slideCount} Slides (Range: 5-20).
   - **DON'T BE LAZY.** Create MORE slides for long input.
   - **FILL THE SLIDES.** Target 60-90% of Max Capacity (${contentCap} per slide).
3. **Typography Specs:**
   - **Cover:** Title ${specs.coverTitle}px, Subtitle ${specs.coverSub}px. **Line Height: 1.0 (TIGHT).**
   - **Content:** ${isFlat ? `${specs.flatSize}px` : isAccent ? `${specs.accentSize}px range` : `${specs.dynamicSize}px range`}.
4. **Layout Structure:**
${subSpec.layout_rule}
5. **Author Display:**
   - Position options: \`bottom-left\`, \`bottom-center\`, \`bottom-right\`.
   - Choose one that balances the layout.
6. **Last Slide Rule:**
   - Slide ${config.slideCount} is **STRICTLY RESERVED** for REFERENCES.
   - Do NOT put normal content on the last slide.
7. **Cover Design Rule:**
   - **CONTRAST IS KING.** Title must be readable.
   - **NEVER** use White Text on Light Background.
   - **NEVER** use Dark Text on Dark Background.
8. **Color Spectrum:**
   - **RANDOMIZE:** Use a BROAD SPECTRUM (Emerald, Rose, Violet, Amber, Cyan, Slate, etc.).
   - **AVOID:** Defaulting to Blue/White constantly. Be creative!
   - **CONTRAST:** Guarantee readability (Light Text on Dark BG, or vice versa).

${taswibSection}

## Output Format (STRICT JSON)
**CRITICAL:** Return ONLY valid JSON in an artifact.
**NO COMMENTS** inside JSON.

\`\`\`json
{
  "metadata": {
    "title": "Topic Title",
    "description": "Short description of the content",
    "author": { "name": "${config.authorName}", "hashtag": "${config.authorHashtag}" },
    "tags": ["#Tag1", "#Tag2"],
    "aspect_ratio": "${config.aspectRatio}"
  },
  "author_display": {
    "enabled": true,
    "variant": "inline",
    "position": "bottom-center"
  },
  "design": {
    "background_color": "#RANDOM_DARK_HEX", "text_color": "#RANDOM_LIGHT_HEX", "accent_color": "#RANDOM_VIBRANT_HEX",
    "background_color_1": "#RANDOM_DARK_HEX", "text_color_1": "#RANDOM_LIGHT_HEX",
    "background_color_2": "#RANDOM_LIGHT_HEX", "text_color_2": "#RANDOM_DARK_HEX"
  },
  "slides": [
    {
      "slide_number": 1,
      "type": "cover",
      "design_override": { "background_color": "#DARK_HEX", "text_color": "#LIGHT_HEX", "author_color": "#LIGHT_HEX" },
      "content": { "title": "CATCHY HEADLINE", "subtitle": "Intriguing Subtitle" },
      "layout": { "line_height": 1.0, "title_size": ${parseInt(specs.coverTitle)}, "subtitle_size": ${parseInt(specs.coverSub)}, "title_weight": 900, "title_position": "left", "subtitle_position": "left" }
    },
    {
      "slide_number": 2,
      "type": "content",
      "design_override": { "background_color": "#VAR_1_HEX" },
      "content": {
        "blocks": [
          { "text": "${isFlat ? "Headline / Main Point" : "BIG IMPACT WORD"}", "style": { "fontSize": ${isFlat ? specs.flatSize : 32}, "fontWeight": 700, "align": "left", "color": "#FULL_HEX" } },
          { "text": "Detailed explanation of the point. Keep it concise yet informative to reach the target density.", "style": { "fontSize": ${isFlat ? specs.flatSize : 24}, "fontWeight": 400, "align": "left", "color": "#FULL_HEX" } }
          ${isFlat ? `, { "text": "Additional context block...", "style": { "fontSize": ${specs.flatSize}, "fontWeight": 400 } }` : ""}
          ${isFlat ? `, { "text": "Final block for this slide...", "style": { "fontSize": ${specs.flatSize}, "fontWeight": 400 } }` : ""}
        ]
      },
      "layout": { "content_alignment": "left" }
    },
    {
      "slide_number": 3,
      "type": "content",
      "design_override": { "background_color": "#VAR_2_HEX" },
      "content": {
        "blocks": [
          { "text": "${isFlat ? "Next Key Insight" : "KEY INSIGHT"}", "style": { "fontSize": ${isFlat ? specs.flatSize : 36}, "fontWeight": 800, "align": "right", "color": "#FULL_HEX" } },
          { "text": "Explanation text block.", "style": { "fontSize": ${isFlat ? specs.flatSize : 20}, "fontWeight": 400, "align": "right", "color": "#FULL_HEX" } },
          { "text": "Another block.", "style": { "fontSize": ${isFlat ? specs.flatSize : 20}, "fontWeight": 400, "align": "right", "color": "#FULL_HEX" } }
        ]
      },
      "layout": { "content_alignment": "right" }
    },
    {
      "slide_number": ${config.slideCount},
      "type": "content",
      "design_override": { "background_color": "#VAR_1_HEX" },
      "content": {
        "blocks": [
          { "text": "${refTitle}", "style": { "fontSize": 24, "fontWeight": 700, "align": "left" } },
          { "text": "${refContent.replace(/\\n/g, "\n")}", "style": { "fontSize": 16, "fontWeight": 400, "align": "left" } }
        ]
      },
      "layout": { "content_alignment": "left" }
    }
  ]
}
\`\`\`
`;
}

export function generateMinimalistFilename(config: PromptConfig): string {
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  return `prompt-mineral-${config.subcategory}-${config.domain || "gen"}-${config.aspectRatio.replace(":", "x")}-${config.language || "id"}-${date}.md`;
}
