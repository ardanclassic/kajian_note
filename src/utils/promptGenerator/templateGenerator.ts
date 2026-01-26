import type { PromptConfig } from "@/types/promptGenerator.types";

// Aspect ratio specific configurations with Subcategory-specific limits
const RATIO_CONFIGS = {
  "4:5": {
    label: "4:5",
    coverTitleSize: "42-64",
    coverSubtitleSize: "36-48",
    flat: {
      contentFontSize: "16",
      maxCapacity: "~1,200 characters / 180 words",
    },
    accent: {
      contentFontSize: "20-32", // Changed to Range
      maxCapacity: "~700 characters / 110 words",
    },
    dynamic: {
      coverTitleSize: "48-64",
      contentFontSizeRange: "22-48",
      maxCapacity: "~400 characters / 60 words",
    },
  },
  "9:16": {
    label: "9:16",
    coverTitleSize: "42-56",
    coverSubtitleSize: "36-48",
    flat: {
      contentFontSize: "14",
      maxCapacity: "~1,500 characters / 220 words",
    },
    accent: {
      contentFontSize: "20-32",
      maxCapacity: "~900 characters / 140 words",
    },
    dynamic: {
      coverTitleSize: "40-56",
      contentFontSizeRange: "22-48",
      maxCapacity: "~500 characters / 80 words",
    },
  },
  "3:4": {
    label: "3:4",
    coverTitleSize: "42-64",
    coverSubtitleSize: "36-48",
    flat: {
      contentFontSize: "16",
      maxCapacity: "~1,300 characters / 200 words",
    },
    accent: {
      contentFontSize: "20-32",
      maxCapacity: "~770 characters / 120 words",
    },
    dynamic: {
      coverTitleSize: "48-60",
      contentFontSizeRange: "22-48",
      maxCapacity: "~440 characters / 65 words",
    },
  },
};

// Subcategory specific configurations
const SUBCATEGORY_CONFIGS = {
  flat: {
    label: "Minimalist Flat",
    description: "UNIFORM font size (16px). Single Color Text.",
    textColorRule: "Define `text_color_1` and `text_color_2` (High Contrast). Use ONLY 1 text color per slide.",
    backgroundRule:
      "Define 2 OPPOSING COLORS: `background_color_1` (e.g. White) & `background_color_2` (e.g. Navy). Max 2 Variants.",
    writingStyle: "Narrative, calm, detailed.",
    densityRule: "Content Density: HIGH (Target 65% - 90% of max capacity). Must have 3 PARAGRAPHS per slide.",
    specialRule:
      "**CRITICAL (FLAT RULES):**\n1. **Alignment:** VARY alignment (Left/Right). Avoid Center.\n2. **Structure:** Use 3-5 blocks per slide.\n3. **MAX LENGTH:** Limit each block to ~50 words. SPLIT long paragraphs into separate blocks.\n4. **Typography:** Uniform Font Size 16px. Weight 400 for Body.\n5. **Content Length:** Fill 150-220 words per slide (65% - 90% of capacity).",
  },
  accent: {
    label: "Minimalist Accent",
    description: "Dual-Color & Mild Size Variation (20-36px).",
    textColorRule:
      "Define `text_color_1`, `text_color_2`, `accent_color_1`. MUST use 2 distinct text colors PER SLIDE.",
    backgroundRule: "Define 2 HIGH CONTRAST COLORS. Alternate every 2-3 slides.",
    writingStyle: "Educational, flowy, clear.",
    densityRule: "Content Density: MODERATE (Target 55% - 90% of max capacity). Must have 2-3 PARAGRAPHS per slide.",
    specialRule:
      "**CRITICAL (ACCENT RULES):** \n1. **COLOR:** Every slide MUST have 2 text colors (Base + Accent). \n2. **SIZE:** Varied sizes (Range 20-32px). \n3. **STRUCTURE:** Use 2-4 blocks per slide. \n4. **MAX LENGTH:** Limit each block to ~40 words. SPLIT long paragraphs into separate blocks.\n5. **ALIGNMENT:** Prioritize LEFT & RIGHT alignment.\n6. **Content Length:** Fill 110-140 words per slide.",
  },
  dynamic: {
    label: "Minimalist Dynamic",
    description: "MULTI-SIZE (22-48px), 3-COLOR Palette.",
    textColorRule: "Define 3 VARIANTS: `text_color_1`, `_2`, `_3`. MUST use 3 Text Colors PER SLIDE.",
    backgroundRule: "Define 3 DISTINCT COLORS: `background_color_1`, `_2`, `_3`. Rotate strictly.",
    writingStyle: "Motivational, impactful, mixed phrases.",
    densityRule:
      "Content Density: VARIABLE (Target 55% - 90% of max capacity). Mix varied block counts - from 1 impactful word to multiple phrases.",
    specialRule:
      "**CRITICAL (DYNAMIC RULES):**\n1. **3 FONT SIZES:** Range 22-48px (Big/Mid/Small) in EACH slide.\n2. **3 COLORS:** Using 3 text colors in EACH slide is MANDATORY.\n3. **3 BACKGROUNDS:** Rotate between 3 background colors sequentially.\n4. **ALIGNMENT:** Prioritize LEFT & RIGHT.\n5. **Content Length:** Fill 60-80 words per slide (55% - 90% of capacity). Use flexible block structure.",
  },
};

export function generatePromptTemplate(config: PromptConfig): string {
  const ratioConfig = RATIO_CONFIGS[config.aspectRatio];
  const subcategoryConfig = SUBCATEGORY_CONFIGS[config.subcategory as keyof typeof SUBCATEGORY_CONFIGS];

  if (!subcategoryConfig) {
    throw new Error(`Invalid subcategory: ${config.subcategory}`);
  }

  // Get specs based on subcategory
  const isDynamic = config.subcategory === "dynamic";
  const isAccent = config.subcategory === "accent";
  const isFlat = config.subcategory === "flat";
  const isIslamic = config.domain !== "general"; // Default to Islamic if undefined
  const variantCount = isDynamic ? 3 : 2;

  const contentFontSpec = (() => {
    if (isDynamic)
      return `MIXED SIZES (Range: ${ratioConfig.dynamic.contentFontSizeRange}px). MUST use Large, Medium, Small in EACH slide.`;
    if (isAccent) return `MILD VARIATION (Range: ${ratioConfig.accent.contentFontSize}px). Use 2 sizes per slide.`;
    return `${ratioConfig.flat.contentFontSize}px (Uniform)`;
  })();

  const maxCapacity = (() => {
    if (isDynamic) return ratioConfig.dynamic.maxCapacity;
    if (isAccent) return ratioConfig.accent.maxCapacity;
    return ratioConfig.flat.maxCapacity;
  })();

  // Generate color palette example with HIGH CONTRAST
  const designExample = (() => {
    const base = `\n    "font_family": "Inter",\n    "background_color": "#0F172A",\n    "text_color": "#F8FAFC",\n    "accent_color": "#38BDF8",`;

    let variants = "";
    // V1: Dark Theme
    variants += `\n    "background_color_1": "#0F172A",`;
    variants += `\n    "text_color_1": "#F8FAFC",`;
    variants += `\n    "accent_color_1": "#38BDF8",`;

    // V2: Light Theme (Contrast)
    variants += `\n    "background_color_2": "#F8FAFC",`;
    variants += `\n    "text_color_2": "#0F172A",`;
    variants += `\n    "accent_color_2": "#F59E0B",`;

    if (variantCount > 2) {
      // V3: Brand/Color Theme
      variants += `\n    "background_color_3": "#EA580C",`;
      variants += `\n    "text_color_3": "#FFFFFF",`;
      variants += `\n    "accent_color_3": "#FEF3C7",`;
    }

    return `{${base}${variants}\n  },`;
  })();

  // Conditional Text Blocks
  const roleText = isIslamic ? `Content Designer & Islamic Writer` : `Expert Content Strategist & Visual Storyteller`;

  const taswibSection = isIslamic
    ? `\n## Taswib Rules (Islamic Content)\n\n-   **Allah:** Must use Unicode \`ﷻ\` (e.g., "Allah ﷻ").\n-   **Muhammad / Rasulullah:** Must use Unicode \`ﷺ\` (e.g., "Rasulullah ﷺ").\n-   **Prophets:** Use "'Alaihis Salam".\n-   **Companions:** Use "Radhiyallahu 'anhu/'anha".\n-   **NO ABBREVIATIONS** (SWT, SAW, AS, RA, PBUH -> FORBIDDEN).`
    : ``;

  const contextLogic = isIslamic
    ? `-   **Islamic Topic:** STRICTLY follow "Taswib" rules.`
    : `-   **Language:** Use professional, engaging grammar.`;

  const isIndonesian = config.language === "id";
  const languageInstruction = isIndonesian
    ? "All content MUST be written in BAHASA INDONESIA."
    : "All content MUST be written in ENGLISH (Professional Tone).";

  const referencePlaceholder = isIndonesian
    ? isIslamic
      ? "1. Judul Kitab/Buku (Penulis)\\n2. Referensi Ayat/Hadits\\n3. Sumber Artikel/Jurnal Kredibel"
      : "1. Judul Buku/Jurnal (Penulis)\\n2. Sumber Data/Artikel Valid\\n3. Link Referensi Tepercaya"
    : isIslamic
      ? "1. Book/Kitab Title (Author)\\n2. Quran/Hadith Reference\\n3. Credible Article Source"
      : "1. Book/Journal Title (Author)\\n2. Valid Data Source/Article\\n3. Trusted Reference Link";

  const template = `# PROMPT: Content Blueprint Generator - ${subcategoryConfig.label} (${config.aspectRatio})

## Role

Act as an ${roleText} specializing in "${subcategoryConfig.label}" aesthetics.
Your goal is to create a VISUALLY RICH content blueprint, not just summary text.
**IMPORTANT: ${languageInstruction}**

## Objective

Convert the INPUT provided into a detailed JSON Content Blueprint for Ratio ${config.aspectRatio}.
Maximize the depth of content. Do not create empty or "too short" slides.
**CRITICAL: Generate ALL slide content in ${isIndonesian ? "BAHASA INDONESIA (Indonesian language)" : "ENGLISH (English language)"}.**

## Input

${config.topic || "[PASTE YOUR TOPIC / ARTICLE / TEXT HERE]"}
[OPTIONAL: Author Name:${config.authorName}, Hashtag:${config.authorHashtag}, Slides:${config.slideCount}]

## Critical Logic

1.  **Context & Adab:**
    -   **Language:** ALL content MUST be in ${isIndonesian ? "BAHASA INDONESIA. Do NOT use English" : "ENGLISH. Do NOT use Indonesian"}.
    -   **General Topic:** Standard grammar/capitalization.
    ${contextLogic}
2.  **Slide Count & Depth:**
    -   Target: ${config.slideCount} Slides (Range: 5-20).
    -   **DON'T BE LAZY.** If input is long, create MORE slides.
    -   **FILL THE SLIDES.** target 60-90% of the Max Capacity per slide.
3.  **Author Identity:**
    -   Name: "${config.authorName}"
    -   Hashtag: "${config.authorHashtag}"
${taswibSection}

## Design Specifications (${subcategoryConfig.label})

- **Aspect Ratio:** ${config.aspectRatio}
- **Typography:** ${contentFontSpec}
- **Text Color:** ${subcategoryConfig.textColorRule}
- **Density:** ${subcategoryConfig.densityRule}
- **Background:** ${subcategoryConfig.backgroundRule}
${(subcategoryConfig as any).specialRule ? `\n${(subcategoryConfig as any).specialRule}` : ""}

## Content Constraints

- **Max Capacity:** ${maxCapacity} per slide.
- **Structure:**
  - **Slide 1 (COVER):**
    - **DESIGN GOAL:** STOP THE SCROLL. Make it catchy, bold, and elegant.
    - Title: ${ratioConfig.coverTitleSize}px. **MASSIVE, BOLD & HIGH CONTRAST.**
    - Subtitle: ${ratioConfig.coverSubtitleSize}px. Capitalized.
    - **Alignment:** Title & Subtitle MUST share the same alignment. Prioritize **LEFT** or **RIGHT** align. Avoid Center if possible.
    - **Color:** Ensure Title & Subtitle colors are **HIGH CONTRAST** against the background. Do not use spectrum neighbors (e.g. dont use blue on green).
    - **Author Color:** For the COVER slide, the Author Text Color MUST match the Title/Subtitle color.
    - **Line Height:** REDUCE line height. Use tight spacing (approx 1.0).
    - **Background:** USE A DIFFERENT COLOR than content slides. Make it pop! (e.g., use Accent color as background).
  - **Slide 2 to N-1 (CONTENT):**
    - ${
      isDynamic
        ? "**LAYOUT:** Magazine Style. Use 3 Font Sizes, 3 Colors per slide. ALIGNMENT: Left/Right."
        : "**LAYOUT:** Narrative flow. Focus on storytelling. ALIGNMENT: Left/Right."
    }
    - ${isAccent ? "**COLOR:** You MUST use 2 Text Colors per slide (Base + Accent)." : ""}
    - ${
      isFlat
        ? "**BLOCKS:** SPLIT content into Short Blocks (Max 50 words/block). Use 3-5 blocks per slide. Keep font weight uniform (400). Fill 150-220 words per slide."
        : isAccent
          ? "**BLOCKS:** SPLIT content into Short Blocks (Max 40 words/block). Use 2-4 blocks per slide. Use Mild Size variation (20-36px). Fill 110-140 words per slide."
          : "**BLOCKS:** Flexible structure (1-3 blocks). Fill 60-80 words per slide. Vary from single impactful words to multiple phrases."
    }
    - **DESIGN OVERRIDE:** For every slide, you MUST set \`design_override\` to use one of the defined palette colors (e.g. \`background_color_2\`). DO NOT invent new hex codes inside the slide.

  - **Last Slide (REFERENCES):**
    - **GOAL:** Credibility & Transparency.
    - **CONTENT:** List credible sources used to generate this content (Books, Quran Verses, Hadith, or Valid Articles).
    - **HEADER:** "${isIndonesian ? "Sumber Referensi" : "References"}"

## Output Format (STRICT JSON ONLY)

**CRITICAL INSTRUCTION - ARTIFACT:**
- Create an **ARTIFACT** containing the JSON code below.
- User needs to DOWNLOAD this file.
- **DO NOT** output markdown text only. Put it in a code block/artifact window.
- **NO COMMENTS** inside JSON.
- **LANGUAGE:** All text content (title, subtitle, blocks) MUST be in ${isIndonesian ? "BAHASA INDONESIA" : "ENGLISH"}.

Example Structure:
{
  "metadata": {
    "title": "...",
    "description": "Engaging caption...",
    "author": {
      "name": "${config.authorName}",
      "hashtag": "#${config.authorHashtag.replace("#", "")}"
    },
    "tags": ["#Tag1", "#Tag2"],
    "aspect_ratio": "${config.aspectRatio}"
  },
  "author_display": {
    "enabled": true,
    "variant": "inline",
    "position": "bottom-center"
  },
  "design": ${designExample}
  "slides": [
    {
      "slide_number": 1,
      "type": "cover",
      "design_override": { "background_color": "#VAR_2_HEX", "text_color": "#VAR_1_HEX", "author_color": "#VAR_1_HEX" },
      "content": { "title": "CATCHY HEADLINE", "subtitle": "Intriguing Subtitle" },
      "layout": { 
          "title_size": ${ratioConfig.coverTitleSize.split("-")[0]}, 
          "subtitle_size": ${ratioConfig.coverSubtitleSize.split("-")[0]}, 
          "title_weight": 900, 
          "title_position": "left",
          "subtitle_position": "left",
          "line_height": 1.0 
      }
    },
    {
      "slide_number": 2,
      "type": "content",
      "design_override": ${
        isDynamic ? `{ "background_color": "#VAR_1_HEX" }` : !isFlat ? `{ "background_color": "#VAR_2_HEX" }` : "null"
      },
      "content": {
        "blocks": [
          { 
             "text": "${isFlat ? "Judul Pembahasan" : isAccent ? "Poin Utama" : "BIG IMPACT WORD"}", 
             "style": { 
                "fontSize": ${isDynamic ? 42 : isAccent ? 32 : ratioConfig.flat.contentFontSize}, 
                "fontWeight": ${isFlat ? 400 : isDynamic ? 900 : 700}, 
                "color": "${isFlat ? "#TEXT_COLOR_1_HEX" : "#ACCENT_COLOR_1_HEX"}",
                "align": "left" 
             } 
          },
          { 
             "text": "${isFlat ? "Paragraf pertama berisi penjelasan detail tentang topik yang dibahas. Isi dengan kalimat yang panjang dan informatif untuk memaksimalkan kapasitas slide..." : isAccent ? "Penjelasan lengkap tentang poin utama. Gunakan kalimat yang jelas dan mudah dipahami untuk mencapai target 110-140 kata per slide..." : "Supporting phrase with medium size."}", 
             "style": { 
                "fontSize": ${isDynamic ? 28 : isAccent ? 22 : ratioConfig.flat.contentFontSize}, 
                "fontWeight": 400, 
                "color": "#TEXT_COLOR_1_HEX",
                "align": "left" 
             } 
          }${
            isFlat
              ? `,
          { 
             "text": "Paragraf kedua melanjutkan penjelasan dengan detail tambahan. Pastikan konten mencapai 150-220 kata per slide untuk memaksimalkan density...", 
             "style": { 
                "fontSize": ${ratioConfig.flat.contentFontSize}, 
                "fontWeight": 400, 
                "color": "#TEXT_COLOR_1_HEX",
                "align": "left" 
             } 
          }`
              : isDynamic
                ? `,
          { 
             "text": "small detail text", 
             "style": { 
                "fontSize": 24, 
                "fontWeight": 400, 
                "color": "#TEXT_COLOR_2_HEX",
                "align": "left" 
             } 
          }`
                : ""
          }
        ]
      },
      "layout": { "content_alignment": "left" }
    },
    {
      "slide_number": 3,
      "type": "content",
      "design_override": ${
        isDynamic ? `{ "background_color": "#VAR_2_HEX" }` : !isFlat ? `{ "background_color": "#VAR_1_HEX" }` : "null"
      },
      "content": {
        "blocks": [
          { 
             "text": "${isFlat ? "Poin Penting Berikutnya" : isAccent ? "Insight Kunci" : "KEY INSIGHT"}", 
             "style": { 
                "fontSize": ${isDynamic ? 48 : isAccent ? 36 : ratioConfig.flat.contentFontSize}, 
                "fontWeight": ${isFlat ? 400 : 800}, 
                "color": "${isFlat ? "#TEXT_COLOR_1_HEX" : isDynamic ? "#ACCENT_COLOR_2_HEX" : "#ACCENT_COLOR_1_HEX"}",
                "align": "right" 
             } 
          },
          { 
             "text": "${isFlat ? "Penjelasan detail dimulai di paragraf pertama dengan informasi yang komprehensif dan terstruktur..." : isAccent ? "Detail penjelasan yang mendukung insight utama dengan bahasa yang mudah dipahami..." : "Explanation text medium"}", 
             "style": { 
                "fontSize": ${isDynamic ? 32 : isAccent ? 24 : ratioConfig.flat.contentFontSize}, 
                "fontWeight": 400, 
                "color": "${isDynamic ? "#TEXT_COLOR_3_HEX" : "#TEXT_COLOR_1_HEX"}",
                "align": "right" 
             } 
          }${
            isFlat
              ? `,
          { 
             "text": "Paragraf kedua melengkapi penjelasan dengan contoh konkret dan detail tambahan yang relevan...", 
             "style": { 
                "fontSize": ${ratioConfig.flat.contentFontSize}, 
                "fontWeight": 400, 
                "color": "#TEXT_COLOR_1_HEX",
                "align": "right" 
             } 
          }`
              : ""
          }
        ]
      },
      "layout": { "content_alignment": "right" }
    },
    {
      "slide_number": 4,
      "type": "content",
      "design_override": ${
        isDynamic ? `{ "background_color": "#VAR_3_HEX" }` : !isFlat ? `{ "background_color": "#VAR_2_HEX" }` : "null"
      },
      "content": {
        "blocks": [
          { 
             "text": "${isFlat ? "Aspek Ketiga Pembahasan" : isAccent ? "Poin Penekanan" : "EMPHASIS"}", 
             "style": { 
                "fontSize": ${isDynamic ? 48 : isAccent ? 36 : ratioConfig.flat.contentFontSize}, 
                "fontWeight": ${isFlat ? 400 : 900}, 
                "color": "${isFlat ? "#TEXT_COLOR_1_HEX" : "#ACCENT_COLOR_1_HEX"}",
                "align": "${isDynamic ? "center" : "left"}" 
             } 
          },
          { 
             "text": "${isFlat ? "Konten paragraf pertama yang memberikan konteks dan penjelasan mendalam tentang aspek ini..." : isAccent ? "Penjelasan singkat namun padat untuk poin penekanan ini..." : "Short punchy text"}", 
             "style": { 
                "fontSize": ${isDynamic ? 28 : isAccent ? 28 : ratioConfig.flat.contentFontSize}, 
                "fontWeight": ${isDynamic ? 500 : 400}, 
                "color": "${isDynamic ? "#TEXT_COLOR_2_HEX" : "#TEXT_COLOR_1_HEX"}",
                "align": "${isDynamic ? "center" : "left"}" 
             } 
          }${
            isFlat
              ? `,
          { 
             "text": "Paragraf kedua memberikan elaborasi lebih lanjut dengan fakta dan argumen pendukung...", 
             "style": { 
                "fontSize": ${ratioConfig.flat.contentFontSize}, 
                "fontWeight": 400, 
                "color": "#TEXT_COLOR_1_HEX",
                "align": "left" 
             } 
          }`
              : ""
          }
        ]
      },
      "layout": { "content_alignment": "${isDynamic ? "center" : "left"}" }
    },
    {
      "slide_number": 5,
      "type": "content",
      "design_override": ${
        isDynamic ? `{ "background_color": "#VAR_1_HEX" }` : !isFlat ? `{ "background_color": "#VAR_1_HEX" }` : "null"
      },
      "content": {
        "blocks": [
          { 
             "text": "${isIndonesian ? "Sumber Referensi" : "References"}", 
             "style": { 
                "fontSize": ${isDynamic ? 36 : isAccent ? 32 : ratioConfig.flat.contentFontSize}, 
                "fontWeight": ${isFlat ? 400 : 700}, 
                "color": "${isFlat ? "#TEXT_COLOR_1_HEX" : "#ACCENT_COLOR_2_HEX"}",
                "align": "left" 
             } 
          },
          { 
             "text": "${referencePlaceholder}", 
             "style": { 
                "fontSize": ${isDynamic ? 24 : isAccent ? 20 : ratioConfig.flat.contentFontSize}, 
                "fontWeight": 400, 
                "color": "${isDynamic ? "#TEXT_COLOR_3_HEX" : "#TEXT_COLOR_1_HEX"}",
                "align": "left" 
             } 
          }${
            isFlat
              ? `,
          { 
             "text": "${isIndonesian ? "Pastikan sumber yang dicantumkan valid dan dapat dipertanggungjawabkan..." : "Ensure listed sources are valid and accountable..."}", 
             "style": { 
                "fontSize": ${ratioConfig.flat.contentFontSize}, 
                "fontWeight": 400, 
                "color": "#TEXT_COLOR_1_HEX",
                "align": "left" 
             } 
          }`
              : ""
          }
        ]
      },
      "layout": { "content_alignment": "left" }
    }
  ]
}
`;

  return template;
}

export function generateFilename(config: PromptConfig): string {
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const subcategory = config.subcategory || "general";
  const ratio = config.aspectRatio.replace(":", "x");
  const domain = config.domain || "islamic";
  const lang = config.language || "id";
  return `prompt-${domain}-${subcategory}-${ratio}-${lang}-${date}.md`;
}
