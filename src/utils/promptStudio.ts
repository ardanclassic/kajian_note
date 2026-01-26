import {
  type ImagePromptConfigExtended as ImagePromptConfig,
  PROMPT_SECTIONS,
  DESIGN_CONCEPTS,
  STYLE_OPTIONS,
  COLOR_SCHEMES,
  MOOD_OPTIONS,
  LIGHTING_OPTIONS,
  PERSPECTIVE_OPTIONS,
  BACKGROUND_OPTIONS,
} from "@/types/promptStudio.types";

const getLabelByValue = <T extends { value: string; label: string }>(options: readonly T[], value: string): string => {
  return options.find((opt) => opt.value === value)?.label || value;
};

export const generateImagePrompt = (cfg: ImagePromptConfig): string => {
  const parts: string[] = [];

  // Get labels
  const conceptLabel = getLabelByValue(DESIGN_CONCEPTS, cfg.designConcept);
  const styleLabel = getLabelByValue(STYLE_OPTIONS, cfg.style);
  const colorLabel = getLabelByValue(COLOR_SCHEMES, cfg.colorScheme);
  const moodLabel = getLabelByValue(MOOD_OPTIONS, cfg.mood);
  const lightingLabel = getLabelByValue(LIGHTING_OPTIONS, cfg.lighting);
  const perspectiveLabel = getLabelByValue(PERSPECTIVE_OPTIONS, cfg.perspective);
  const bgComplexityLabel = getLabelByValue(BACKGROUND_OPTIONS, cfg.backgroundComplexity);

  // 1. HEADER
  parts.push(PROMPT_SECTIONS.HEADER);
  parts.push("");

  // 2. ROLE & EXPERTISE ASSIGNMENT
  parts.push(PROMPT_SECTIONS.ROLE);
  parts.push("");
  // Determine role based on context flag
  if (cfg.isIslamic) {
    parts.push(
      `You are an **expert Islamic-compliant ${styleLabel.toLowerCase()} designer** with specialized knowledge in:`,
    );
  } else {
    parts.push(
      `You are an **expert ethical ${styleLabel.toLowerCase()} designer** prioritizing modest and respectful representation:`,
    );
  }
  parts.push("");
  parts.push(`- Modern ${conceptLabel.toLowerCase()} design${cfg.isIslamic ? " with deep cultural sensitivity" : ""}`);

  // These core rules apply to ALL modes now
  parts.push("- Faceless character design and silhouette-based visual storytelling");

  if (cfg.isIslamic) {
    parts.push("- Southeast Asian Muslim lifestyle and cultural representation");
    parts.push("- Balancing contemporary aesthetics with strict Islamic modesty guidelines");
  } else {
    parts.push("- Universal modesty and dignified character representation");
    parts.push("- Contemporary aesthetics with ethical visual standards");
  }

  parts.push("- Creating emotionally resonant imagery through composition, color, and body language");
  parts.push("- Professional-grade artwork for digital and print publications");
  parts.push("");

  if (cfg.isIslamic) {
    parts.push(
      "Your portfolio includes successful projects for Islamic publishers, educational institutions, parenting platforms, and lifestyle brands across Indonesia, Malaysia, and the broader Muslim world.",
    );
  } else {
    parts.push(
      "Your portfolio includes successful projects for top-tier publishers, tech companies, ethical lifestyle brands, and creative agencies.",
    );
  }
  parts.push("");

  // 3. PROJECT CONTEXT & PURPOSE
  parts.push(PROMPT_SECTIONS.CONTEXT);
  parts.push("");
  if (cfg.targetAudience) {
    parts.push(`**Target Audience:** ${cfg.targetAudience}`);
  } else {
    parts.push(`**Target Audience:** ${cfg.isIslamic ? "Muslim communities in Southeast Asia" : "General Audience"}`);
  }
  parts.push("**Use Case:** Social media content, Educational materials, Marketing collateral, Blog featured images");
  parts.push(
    `**Emotional Goal:** Create visually compelling, shareable content that resonates deeply with the audience.`,
  );
  parts.push("");

  // 4. CREATIVE BRIEF
  parts.push(PROMPT_SECTIONS.BRIEF);
  parts.push("");
  parts.push(cfg.topic);
  parts.push("");

  // 5. SCENE COMPOSITION
  parts.push(PROMPT_SECTIONS.COMPOSITION);
  parts.push("");
  parts.push(`**Perspective & Framing:**`);
  parts.push(`- ${perspectiveLabel} perspective for balanced visual impact`);
  parts.push("- Composition following rule of thirds for professional appeal");
  parts.push("- Adequate breathing room and negative space around subjects");
  parts.push("");
  parts.push(`**Mood & Atmosphere:**`);
  parts.push(`- Overall mood: ${moodLabel}`);
  parts.push("- Emotionally engaging and atmospheric");
  parts.push("- Conveys warmth and positive energy appropriate to the subject");
  parts.push("");
  parts.push(`**Lighting:**`);
  parts.push(`- ${lightingLabel} creating depth and dimension`);
  parts.push("- Soft, flattering illumination enhancing the overall mood");
  parts.push("- Balanced highlights and shadows for visual interest");
  parts.push("");
  parts.push(`**Background:**`);
  parts.push(`- Complexity level: ${bgComplexityLabel}`);
  parts.push("- Contextual environment supporting the main subject");
  parts.push("- Clear visual hierarchy ensuring subject remains focal point");
  parts.push("");

  // 6. VISUAL STYLE SPECIFICATIONS
  parts.push(PROMPT_SECTIONS.VISUAL_STYLE);
  parts.push("");
  parts.push(`**Design Concept:**`);
  parts.push(`- ${conceptLabel} design approach`);
  parts.push("- Clean, contemporary aesthetics with timeless appeal");
  parts.push("");
  parts.push(`**Rendering Style:**`);
  parts.push(`- Primary style: ${styleLabel}`);
  if (cfg.style === "photorealistic") {
    parts.push("- Highly detailed, 8k quality, realistic textures and lighting");
    parts.push("- Depth of field and cinematic composition");
  } else if (cfg.style === "flat-design") {
    parts.push("- Vector-style with clean lines and simplified shapes");
    parts.push("- Flat colors with minimal gradients");
  } else {
    parts.push("- Medium detail level - engaging yet clean");
    parts.push("- Professional illustration quality with artistic flair");
  }
  parts.push("");
  parts.push(`**Color Palette:**`);
  parts.push(`- Scheme: ${colorLabel}`);
  parts.push("- Harmonious color relationships and balanced saturation");
  parts.push("- Colors supporting the emotional tone and context");
  parts.push("- High contrast between subjects and background for clarity");
  parts.push("");

  // 7. TECHNICAL SPECIFICATIONS
  parts.push(PROMPT_SECTIONS.TECHNICAL);
  parts.push("");
  parts.push(`**Dimensions & Format:**`);
  parts.push(`- Aspect Ratio: ${cfg.aspectRatio}`);
  parts.push("- Resolution: High resolution (minimum 2048px on longest side)");
  parts.push("- DPI: 300 DPI (print-ready quality)");
  parts.push("- Format: PNG with transparency support or high-quality JPEG");
  parts.push("");
  parts.push(`**Quality Requirements:**`);
  parts.push("- Crisp, clean edges and sharp details");
  parts.push("- Professional-grade suitable for publication");
  parts.push("- Optimized file size while maintaining quality");
  parts.push("- Scalable without loss of quality");
  parts.push("");

  // 8. ISLAMIC COMPLIANCE (ALWAYS INCLUDED NOW)
  parts.push(PROMPT_SECTIONS.ISLAMIC);
  parts.push("");
  parts.push("### ⚠️ ABSOLUTE REQUIREMENTS - NO EXCEPTIONS:");
  parts.push("");
  parts.push("**Human Subjects:**");
  parts.push("- **COMPLETELY FACELESS** - no facial features whatsoever (no eyes, nose, mouth, face outline)");
  parts.push("- Use silhouettes, back views, or shadowed/obscured faces");
  parts.push("- Head shape should be simplified and fully covered");
  parts.push("- Emotion conveyed through body language, posture, and gestures");
  parts.push("");
  parts.push("**Clothing - Women:**");
  parts.push("- Full hijab completely covering hair, neck, and chest");
  parts.push("- Long, loose-fitting dress/abaya reaching ankles");
  parts.push("- Long sleeves covering to wrists");
  parts.push("- Modest, non-form-fitting silhouette");
  parts.push("- Opaque fabric (no transparency or tight clothing)");
  parts.push("");
  parts.push("**Clothing - Men:**");
  parts.push("- Area between navel and knees must be fully covered");
  parts.push("- Modest, dignified clothing appropriate to context");
  parts.push("");
  parts.push("**Animals (if present):**");
  parts.push("- Must be faceless or NO EYES visible");
  parts.push("- Prefer silhouette, back view, or stylized representation");
  parts.push("");
  parts.push("**Overall Approach:**");
  parts.push("- Dignified, respectful portrayal celebrating Islamic values");
  parts.push("- Focus on beauty of modesty and family bonds");
  parts.push("- Culturally authentic representation");
  parts.push("");

  // 9. DESIGN ELEMENTS & ADDITIONAL DETAILS
  if (cfg.additionalDetails && cfg.additionalDetails.trim()) {
    parts.push(PROMPT_SECTIONS.DESIGN_ELEMENTS);
    parts.push("");
    parts.push(cfg.additionalDetails);
    parts.push("");
  }

  // 10. QUALITY STANDARDS
  parts.push(PROMPT_SECTIONS.QUALITY);
  parts.push("");
  parts.push("✅ Publication-grade illustration quality");
  parts.push("✅ Emotionally resonant storytelling");
  if (cfg.isIslamic) {
    parts.push("✅ Culturally authentic and respectful");
  }
  parts.push("✅ Balanced composition with clear visual hierarchy");
  parts.push("✅ Accessible color contrast (WCAG AA minimum)");
  parts.push("✅ Optimized for both digital and print media");
  parts.push("✅ Suitable for professional marketing and educational use");
  parts.push("");

  // 11. REFERENCE KEYWORDS
  parts.push(PROMPT_SECTIONS.KEYWORDS);
  parts.push("");
  const keywords = [
    styleLabel,
    conceptLabel,
    // Compliance keywords are now always included
    "Islamic modest compliance",
    "faceless character design",
    colorLabel.toLowerCase(),
    moodLabel.toLowerCase(),
    "high quality",
    "professional illustration",
    // Only add specific cultural keyword if flag is active
    cfg.isIslamic ? "Southeast Asian Muslim culture" : "",
    "culturally authentic",
  ]
    .filter(Boolean)
    .join(", ");
  parts.push(keywords);
  parts.push("");

  parts.push("---");
  parts.push("");
  parts.push(
    `**End of Brief** - Create something beautiful${cfg.isIslamic ? " that Muslim audiences would be proud to share" : ""}! 🎨`,
  );

  return parts.join("\n");
};

export const validateConfig = (cfg: ImagePromptConfig): string[] => {
  const errors: string[] = [];

  if (!cfg.topic.trim()) {
    errors.push("Topik/Tema wajib diisi");
  } else if (cfg.topic.trim().length < 20) {
    errors.push("Topic too short (minimum 20 characters for quality results)");
  }

  if (cfg.targetAudience && cfg.targetAudience.length > 100) {
    errors.push("Target audience too long (maximum 100 characters)");
  }

  return errors;
};

export const fallbackCopyToClipboard = (text: string): boolean => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();

  try {
    document.execCommand("copy");
    document.body.removeChild(textArea);
    return true;
  } catch (err) {
    document.body.removeChild(textArea);
    return false;
  }
};
