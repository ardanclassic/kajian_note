// Blueprint Parser - Parse v2 blueprint JSON and generate slides with templates

import { v4 as uuidv4 } from "uuid";
import type { Slide, CanvasElement, Ratio, TextElement, ShapeElement } from "@/types/contentStudio.types";
import * as Generators from "./generators";
import { getDimensions } from "./generators";
import type { GeneratorContext } from "./generators";

// Helper for consistency
const createText = (
  content: string,
  x: number,
  y: number,
  width: number,
  fontSize: number,
  options: Partial<TextElement> = {}
): TextElement => {
  const base: TextElement = {
    id: uuidv4(),
    type: "text",
    content,
    position: { x, y },
    size: { width, height: fontSize * 1.5 },
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 1,
    fontFamily: "Inter",
    fontSize,
    fontWeight: 400,
    fontStyle: "normal",
    textAlign: "left",
    fill: "#000000",
    lineHeight: 1.2,
    letterSpacing: 0,
    ...options,
  };
  return base;
};

const createShape = (
  type: "rect" | "circle" | "line" | "triangle" | "star" | "polygon",
  x: number,
  y: number,
  width: number,
  height: number,
  options: Partial<ShapeElement> = {}
): ShapeElement => {
  const base: ShapeElement = {
    id: uuidv4(),
    type: "shape",
    shapeType: type,
    position: { x, y },
    size: { width, height },
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 0,
    fill: "#CCCCCC",
    stroke: "transparent",
    strokeWidth: 0,
    ...options,
  };
  return base;
};

interface BlueprintSlide {
  slide_number: number;
  type: "cover" | "content" | "closing";
  judul: string;
  subjudul?: string;
  content_type?: string;
  content_text?: string;
  content_points?: string[];
  [key: string]: any;
}

interface Blueprint {
  meta?: {
    author?: string;
    logo_url?: string;
    topic?: string;
  };
  captions?: string;
  slides: BlueprintSlide[];
  hashtags?: {
    primary?: string[];
    secondary?: string[];
    engagement?: string[];
  };
}

export function parseBlueprint(blueprint: Blueprint, ratio: Ratio, colorPalette: any): Slide[] {
  if (!blueprint.slides || !Array.isArray(blueprint.slides)) {
    throw new Error("Invalid blueprint: slides array is required");
  }

  return blueprint.slides.map((slideData) => {
    // Default to variant A
    const defaultVariant = "A";

    const slide: Slide = {
      id: uuidv4(),
      // type removed
      elements: [],
      backgroundColor: colorPalette.colors.background || "#FFFFFF",
      originalContent: slideData,
      styleVariant: defaultVariant,
    };

    // Generate elements based on slide type
    if (slideData.type === "cover") {
      slide.elements = generateCoverSlide(slideData, ratio, colorPalette, defaultVariant);
    } else if (slideData.type === "closing") {
      slide.elements = generateClosingSlide(slideData, ratio, colorPalette, defaultVariant);
    } else {
      slide.elements = generateContentSlide(slideData, ratio, colorPalette, defaultVariant);
    }

    return slide;
  });
}

export function reGenerateSlide(slide: Slide, variant: "A" | "B", ratio: Ratio, palette: any): Slide {
  if (!slide.originalContent) return slide; // Should fallback to extract content if needed, but for now blueprint driven.

  const slideType = slide.originalContent?.type || "content";
  const newElements =
    slideType === "cover"
      ? generateCoverSlide(slide.originalContent || {}, ratio, palette, variant)
      : slideType === "closing"
      ? generateClosingSlide(slide.originalContent || {}, ratio, palette, variant)
      : generateContentSlide(slide.originalContent || {}, ratio, palette, variant);

  return {
    ...slide,
    elements: newElements,
    styleVariant: variant,
    backgroundColor: palette.colors.background,
  };
}

function generateCoverSlide(
  slideData: BlueprintSlide,
  ratio: Ratio,
  colorPalette: any,
  variant: "A" | "B" = "A"
): CanvasElement[] {
  const elements: CanvasElement[] = [];
  const dimensions = getDimensions(ratio);
  const { width, height } = dimensions;

  // Responsive constants
  const padding = width * 0.1;
  const contentWidth = width - padding * 2;
  const centerY = height / 2;

  if (variant === "A") {
    // Variant A: Modern Center with Divider
    // Top decorative line
    elements.push(
      createShape("line", width * 0.2, centerY - 150, width * 0.6, 2, {
        fill: colorPalette.colors.accent_1,
        stroke: colorPalette.colors.accent_1,
        strokeWidth: 2,
      })
    );

    // Title
    elements.push(
      createText(slideData.judul || "Untitled", padding, centerY - 100, contentWidth, 42, {
        fontWeight: 800,
        textAlign: "center",
        fill: colorPalette.colors.text_dark,
        lineHeight: 1.1,
        metadata: { role: "title" },
      })
    );

    // Subtitle
    if (slideData.subjudul) {
      elements.push(
        createText(slideData.subjudul, padding, centerY + 20, contentWidth, 18, {
          textAlign: "center",
          fill: colorPalette.colors.primary,
          fontWeight: 500,
          metadata: { role: "subtitle" },
        })
      );
    }

    // Bottom shape
    elements.push(
      createShape("rect", width / 2 - 25, centerY + 100, 50, 50, {
        fill: colorPalette.colors.secondary,
        rotation: 45,
        opacity: 0.2,
      })
    );
  } else {
    // Variant B: Bold Typographic Left Align
    const leftPad = width * 0.12;
    const infoWidth = width * 0.8;

    // Large Background number or shape
    elements.push(
      createShape("circle", width - 100, -50, 200, 200, {
        fill: colorPalette.colors.primary,
        opacity: 0.1,
      })
    );

    // Title
    elements.push(
      createText((slideData.judul || "Untitled").toUpperCase(), leftPad, height * 0.35, infoWidth, 52, {
        fontWeight: 900,
        textAlign: "left",
        fill: colorPalette.colors.text_dark,
        lineHeight: 1,
        letterSpacing: -1,
        metadata: { role: "title" },
      })
    );

    // Accent Line
    elements.push(
      createShape("rect", leftPad, height * 0.35 - 30, 60, 8, {
        fill: colorPalette.colors.accent_1,
      })
    );

    // Subtitle
    if (slideData.subjudul) {
      elements.push(
        createText(slideData.subjudul, leftPad, height * 0.35 + 160, infoWidth, 20, {
          textAlign: "left",
          fill: colorPalette.colors.secondary,
          fontWeight: 600,
          metadata: { role: "subtitle" },
        })
      );
    }
  }

  return elements;
}

function generateClosingSlide(
  slideData: BlueprintSlide,
  ratio: Ratio,
  colorPalette: any,
  variant: "A" | "B" = "A"
): CanvasElement[] {
  const elements: CanvasElement[] = [];
  const dimensions = getDimensions(ratio);
  const { width, height } = dimensions;
  const padding = width * 0.1;

  if (variant === "A") {
    // Variant A: Rounded Box Highlight
    const boxWidth = width * 0.8;
    const boxHeight = height * 0.4;
    const boxX = (width - boxWidth) / 2;
    const boxY = (height - boxHeight) / 2;

    elements.push(
      createShape("rect", boxX, boxY, boxWidth, boxHeight, {
        fill: "#FFFFFF",
        stroke: colorPalette.colors.primary,
        strokeWidth: 2,
        cornerRadius: 20,
      })
    );

    // Title inside box
    elements.push(
      createText(slideData.judul || "Thank You!", boxX + 20, boxY + 40, boxWidth - 40, 36, {
        textAlign: "center",
        fontWeight: 800,
        fill: colorPalette.colors.primary,
      })
    );

    // Secondary Text
    const message = slideData.content_text || slideData.main_message;
    if (message) {
      elements.push(
        createText(message, boxX + 30, boxY + 100, boxWidth - 60, 16, {
          textAlign: "center",
          fill: colorPalette.colors.text_dark,
        })
      );
    }

    // Like Share Save icons placeholder (circles)
    const iconSize = 40;
    const iconGap = 20;
    const totalWidth = iconSize * 3 + iconGap * 2;
    const startX = (width - totalWidth) / 2;
    const iconsY = boxY + boxHeight - 70;

    ["♥", "✈", "📥"].forEach((icon, i) => {
      elements.push(
        createShape("circle", startX + i * (iconSize + iconGap), iconsY, iconSize, iconSize, {
          fill: colorPalette.colors.background,
        })
      );
      elements.push(
        createText(icon, startX + i * (iconSize + iconGap), iconsY + 5, iconSize, 20, {
          textAlign: "center",
          fill: colorPalette.colors.text_dark,
        })
      );
    });
  } else {
    // Variant B: Full Screen Minimal
    elements.push(
      createShape("rect", 0, 0, width, height, {
        fill: colorPalette.colors.primary, // Full color bg? maybe too much. Let's use accent.
      })
    );

    elements.push(
      createShape("rect", 20, 20, width - 40, height - 40, {
        fill: colorPalette.colors.background,
        cornerRadius: 0,
      })
    );

    elements.push(
      createText((slideData.judul || "THE END").toUpperCase(), 40, height / 2 - 40, width - 80, 48, {
        textAlign: "center",
        fontWeight: 900,
        letterSpacing: 2,
        fill: colorPalette.colors.text_dark,
      })
    );

    const message = slideData.content_text || slideData.main_message;
    if (message) {
      elements.push(
        createText(message, 50, height / 2 + 40, width - 100, 18, {
          textAlign: "center",
          fontStyle: "italic",
          fill: colorPalette.colors.secondary,
        })
      );
    }
  }

  return elements;
}

function generateContentSlide(
  slideData: BlueprintSlide,
  ratio: Ratio,
  colorPalette: any,
  variant: "A" | "B" = "A"
): CanvasElement[] {
  const context: Generators.GeneratorContext = {
    ratio,
    palette: colorPalette,
    dimensions: getDimensions(ratio),
  };

  // Use provided variant
  const options: Generators.GeneratorOptions = { variant };

  try {
    switch (slideData.content_type) {
      case "paragraph":
        return Generators.generateParagraph(context, slideData as any, options);

      case "content_points":
        return Generators.generateContentPoints(context, slideData as any, options);

      case "narrative_with_points":
        return Generators.generateNarrativeWithPoints(context, slideData as any, options);

      case "sequential_process":
        return Generators.generateSequentialProcess(context, slideData as any, options);

      case "detailed_breakdown":
        return Generators.generateDetailedBreakdown(context, slideData as any, options);

      case "infographic_style":
        return Generators.generateInfographicStyle(context, slideData as any, options);

      case "myth_vs_fact":
        return Generators.generateMythVsFact(context, slideData as any, options);

      case "misconception_clarification":
        return Generators.generateMisconceptionClarification(context, slideData as any, options);

      case "definition_box":
        return Generators.generateDefinitionBox(context, slideData as any, options);

      case "practical_checklist":
        return Generators.generateChecklist(context, slideData as any, options);

      default:
        console.warn(`Unknown content_type: ${slideData.content_type}, using fallback.`);
        return generateFallbackLayout(slideData, ratio, colorPalette);
    }
  } catch (error) {
    console.error(`Error generating content for ${slideData.content_type}:`, error);
    return generateFallbackLayout(slideData, ratio, colorPalette);
  }
}

function generateFallbackLayout(slideData: BlueprintSlide, ratio: Ratio, colorPalette: any): CanvasElement[] {
  const elements: CanvasElement[] = [];
  const dimensions = getDimensions(ratio);

  // Title
  elements.push({
    id: uuidv4(),
    type: "text",
    position: { x: 40, y: 60 },
    size: { width: dimensions.width - 80, height: 60 },
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 1,
    content: slideData.judul || "Untitled",
    fontFamily: "Inter",
    fontSize: 32,
    fontWeight: 700,
    fontStyle: "normal",
    textAlign: "left",
    lineHeight: 1.2,
    letterSpacing: -0.5,
    fill: colorPalette.colors.text_dark,
    metadata: { role: "title" },
  } as CanvasElement);

  // Content extraction logic for fallback
  let contentText = "";
  if (slideData.content_text) {
    contentText = slideData.content_text;
  } else if (slideData.content_points) {
    contentText = slideData.content_points.join("\n\n");
  } else if (slideData.stages) {
    contentText = slideData.stages.map((s: any) => `${s.stage}: ${s.description}`).join("\n\n");
  } else if (slideData.items) {
    contentText = slideData.items.map((i: any) => `${i.title}: ${i.description}`).join("\n\n");
  } else if (slideData.checklist_items) {
    if (Array.isArray(slideData.checklist_items) && typeof slideData.checklist_items[0] === "string") {
      contentText = slideData.checklist_items.join("\n");
    } else {
      contentText = JSON.stringify(slideData.checklist_items);
    }
  }

  if (contentText) {
    elements.push({
      id: uuidv4(),
      type: "text",
      position: { x: 40, y: 140 },
      size: { width: dimensions.width - 80, height: dimensions.height - 200 },
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 1,
      content: contentText,
      fontFamily: "Inter",
      fontSize: 18,
      fontWeight: 400,
      fontStyle: "normal",
      textAlign: "left",
      lineHeight: 1.6,
      letterSpacing: 0,
      fill: colorPalette.colors.text_dark,
    } as CanvasElement);
  }

  return elements;
}
