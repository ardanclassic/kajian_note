import type { PromptConfig } from "@/types/promptGenerator.types";

// --- Configuration Constants ---

const RATIO_SPECS = {
  "4:5": {
    coverTitle: "42-56",
    coverSub: "28-36",
    contentSize: "16-24",
    contentCap: "85 words",
  },
  "9:16": {
    coverTitle: "36-48",
    coverSub: "24-32",
    contentSize: "16-24",
    contentCap: "85 words",
  },
  "3:4": {
    coverTitle: "42-56",
    coverSub: "28-36",
    contentSize: "16-24",
    contentCap: "85 words",
  },
};

export function generateVisualistPrompt(config: PromptConfig): string {
  const specs = RATIO_SPECS[config.aspectRatio];
  if (!specs) throw new Error(`Invalid configuration`);

  // --- Context Logic ---
  const isIslamic = config.domain !== "general";
  const isIndonesian = config.language === "id";

  const roleText = isIslamic
    ? "Creative Director & Islamic Content Specialist"
    : "Creative Director & Visual Storyteller";
  const langText = isIndonesian ? "BAHASA INDONESIA" : "ENGLISH";

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

  // --- Subcategory Logic ---
  const isVignette = config.subcategory === "vignette";

  const layoutRules = isVignette
    ? `- **NO HEADLINES:** Content slides must **NOT** have a dedicated Title/Headline block. The text should just be the body content.
- **FOCUS:** Image + Body Text Only. Pure visual storytelling.`
    : `- **HEADLINES:** Content slides **MUST** have a bold Title/Headline block followed by body text.
- **FOCUS:** Image + Headline + Body Text. Magazine editorial style.`;

  // --- Image Dimensions ---
  const imgDims =
    config.aspectRatio === "9:16"
      ? "width=1080&height=1920"
      : config.aspectRatio === "3:4"
        ? "width=1080&height=1440"
        : "width=1080&height=1350"; // 4:5 default

  return `# PROMPT: Visualist Content Blueprint v1.0 - (${config.subcategory.toUpperCase()})
  
## Role & Objective
Act as a ${roleText} specializing in **Visualist/Magazine Style Layouts**.
**Goal:** Create a VISUALLY RICH blueprint combining meaningful imagery with concise text.
**LANGUAGE:** ${langText} (Strict).

## Input Data
\`\`\`text
${config.topic || "[TOPIC / ARTICLE / CONTEXT GOES HERE]"}
\`\`\`
**Author:** ${config.authorName} | **Hashtag:** ${config.authorHashtag} | **Target:** ${config.slideCount} Slides

## Design Rules (Visualist - ${config.subcategory})
- **Concept:** Professional, Magazine-like, Story-driven.
- **Palette:** Rich, sophisticated colors. Deep darks (Navy, Emerald, Charcoal) paired with Vibrant Accents (Gold, Cyan, Orange).
- **Typography:** Clean Sans Serif (Inter/Roboto). High readability.
- **Visuals:** EVERY slide (except References) MUST include an image logic.

## Critical Logic
1. **Context & Adab:**
   - **Language:** ${isIndonesian ? "BAHASA INDONESIA (No English)." : "ENGLISH (Professional)."}
   ${isIslamic ? "- **Islamic Topic:** STRICTLY follow 'Taswib' rules below." : ""}
2. **Slide Count & Content:**
   - **Target:** ${config.slideCount} Slides.
   - **Density:** Text length MUST be **70-90%** of the limit (${specs.contentCap} words). Avoid very short text.
3. **Layout Structure:**
   ${layoutRules}
   - **IMAGES:** MANDATORY on ALL Slides (including Cover).
   - **Cover Image:** Must be **Opacity 0.3** (Background layer).
   - **Content Positioning:** Vary the layout.
     - Type A: Image TOP (40%), Text BOTTOM.
     - Type B: Image BOTTOM (40%), Text TOP.
   - **ALTERNATE** these layouts to create rhythm.
4. **Typography Specs:**
   - **Cover:** Title ${specs.coverTitle}px, Subtitle ${specs.coverSub}px. Line Height **1.1**.
   - **Align:** **Left** or **Right** (Avoid Center). **CRITICAL:** \`title_position\` and \`subtitle_position\` MUST be the same (both left OR both right).
   - **Content:** ${specs.contentSize}px range.
5. **Cover Image Position (CRITICAL):**
   - **Cover Slide ONLY**: Image position MUST be \`"left"\` or \`"right"\`. DO NOT use \`"center"\`.
   - **Content Slides**: Can use \`"top"\`, \`"bottom"\`, or \`"center"\` as needed.
6. **Last Slide Rule:**
   - Slide ${config.slideCount} is **STRICTLY RESERVED** for REFERENCES.
   - No image required on Reference slide.
7. **Author Display:**
   - Position: \`bottom-center\` or \`bottom-right\`.
   - Style: \`inline\` or \`stacked\`.
8. **Image Source Strategy:**
   - **Source:** Use high-quality **Unsplash** URLs (\`https://images.unsplash.com/photo-...\`).
   - **Relevance:** The image MUST be **contextually accurate** and directly relate to the specific discussion in the slide. Avoid generic/random stock photos if possible.
   - **Method:** Select photos that visually explain the text (e.g., specific objects, metaphors, moods).
   - **Strictness:** Real Unsplash images only.
9. **JSON Formatting (TAGS):**
   - **CRITICAL:** In the \`"tags"\` array, the hash sign \`#\` MUST be **inside** the double quotes (e.g., \`"#Topic"\`).
   - **ERROR AVOIDANCE**: Never write \`#"Topic"\` as it breaks JSON syntax.

${taswibSection}

## Output Format (STRICT JSON ONLY)
**CRITICAL:** Return output ONLY as a valid JSON object.
**CORE INSTRUCTION:** 
- Use a **Dedicated Workspace** (Artifact, Canvas, or File Block).
- **STRICT PROHIBITION**: No React code, no UI components, and no conversational text.
- Output MUST be a single, raw, and syntactically perfect JSON object that follows the structure below.

\`\`\`json
{
  "metadata": {
    "title": "Headline",
    "description": "Short social media caption",
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
    "background_color": "#DARK_HEX", "text_color": "#LIGHT_HEX", "accent_color": "#VIBRANT_HEX",
    "background_color_1": "#DARK_HEX", "text_color_1": "#LIGHT_HEX",
    "background_color_2": "#ALT_DARK_HEX", "text_color_2": "#LIGHT_HEX"
  },
  "slides": [
    {
      "slide_number": 1,
      "type": "cover",
      "design_override": { "background_color": "#DARK_HEX", "text_color": "#ACCENT_HEX" },
      "image": {
        "url": "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1080&q=80",
        "position": "left",
        "opacity": 0.3
      },
      "content": { "title": "IMPACTFUL TITLE", "subtitle": "Compelling Subtitle" },
      "layout": { "line_height": 1.1, "title_size": ${parseInt(specs.coverTitle)}, "subtitle_size": ${parseInt(specs.coverSub)}, "title_weight": 900, "title_position": "left", "subtitle_position": "left" }
    },
    {
      "slide_number": 2,
      "type": "content",
      "design_override": { "background_color": "#HEX_VAR_1" },
      "image": {
        "url": "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?w=1080&q=80",
        "position": "top"
      },
      "content": {
        "blocks": [
          \${!isVignette ? \`{ "text": "OPENING HOOK", "style": { "fontSize": 32, "fontWeight": 700, "align": "left", "color": "#ACCENT_HEX" } },\` : ""}
          { "text": "Introduction text that sets the context. Keep it short and engaging.", "style": { "fontSize": 20, "fontWeight": 400, "align": "left", "color": "#TEXT_HEX" } }
        ]
      },
      "layout": { "content_alignment": "left" }
    },
    {
      "slide_number": 3,
      "type": "content",
      "design_override": { "background_color": "#HEX_VAR_2" },
      "image": {
        "url": "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1080&q=80",
        "position": "bottom"
      },
      "content": {
        "blocks": [
          \${!isVignette ? \`{ "text": "CORE CONCEPT", "style": { "fontSize": 32, "fontWeight": 700, "align": "left", "color": "#ACCENT_HEX" } },\` : ""}
          { "text": "Explanation of the core concept. Ensure it flows well with the image below.", "style": { "fontSize": 20, "fontWeight": 400, "align": "left", "color": "#TEXT_HEX" } }
        ]
      },
      "layout": { "content_alignment": "left" }
    },
    {
      "slide_number": ${config.slideCount},
      "type": "content",
      "design_override": { "background_color": "#DARK_HEX" },
      "content": {
        "blocks": [
          { "text": "${refTitle}", "style": { "fontSize": 24, "fontWeight": 700, "align": "left" } },
          { "text": "${refContent.replace(/\\\\n/g, "\\n")}", "style": { "fontSize": 16, "fontWeight": 400, "align": "left" } }
        ]
      },
      "layout": { "content_alignment": "left" }
    }
  ]
}
\`\`\`
`;
}

export function generateVisualistFilename(config: PromptConfig): string {
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  return `prompt-visualist-${config.subcategory || "gen"}-${config.domain || "gen"}-${config.aspectRatio.replace(":", "x")}-${config.language || "id"}-${date}.md`;
}
