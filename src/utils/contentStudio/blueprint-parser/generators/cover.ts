import type { Blueprint, BlueprintSlide, CanvasElement, BlueprintCoverContent } from "@/types/contentStudio.types";
import { LAYOUT_DEFAULTS, DEFAULT_TEXT_COLOR } from "../constants";
import { parsePixel, parseWeight, resolveTextAlign, estimateTextLines } from "../utils";
import { createText, createSlideImage } from "../factories";
import { generateAuthorDisplay } from "./author-display";

export const generateCoverSlide = (
  data: BlueprintSlide,
  bp: Blueprint,
  dims: { width: number; height: number },
): CanvasElement[] => {
  const els: CanvasElement[] = [];
  const { width, height } = dims;
  const content = data.content as BlueprintCoverContent;
  const design = bp.design;
  const layout = data.layout || {};

  const padding = width * 0.1;
  const safeWidth = width - padding * 2;

  const DEFAULTS = LAYOUT_DEFAULTS.COVER;

  const titleAlign = resolveTextAlign(layout.title_position, design.text_alignment, "center");
  const subAlign = resolveTextAlign(layout.subtitle_position, design.text_alignment, "center");

  const titleSize = parsePixel(layout.title_size, DEFAULTS.TITLE_SIZE);
  const titleWeight = parseWeight(layout.title_weight, DEFAULTS.TITLE_WEIGHT);
  const titleY = height * 0.25;
  const titleLines = estimateTextLines(content.title || "Untitled", titleSize, safeWidth);
  const titleHeight = titleLines * titleSize * 1.2;

  els.push(
    createText(content.title || "Untitled", padding, titleY, safeWidth, titleHeight, {
      fontSize: titleSize,
      fontWeight: titleWeight,
      textAlign: titleAlign,
      fill: design?.text_color || DEFAULT_TEXT_COLOR,
      lineHeight: layout.line_height ? parseFloat(String(layout.line_height)) : 1.1,
      metadata: { role: "title" },
    }),
  );

  if (content.subtitle) {
    const subSize = parsePixel(layout.subtitle_size, DEFAULTS.SUBTITLE_SIZE);
    const subWeight = parseWeight(layout.subtitle_weight, DEFAULTS.SUBTITLE_WEIGHT);
    const spacing = parsePixel(layout.spacing, DEFAULTS.SPACING) * 2;

    const subY = titleY + titleHeight + spacing;
    const subLines = estimateTextLines(content.subtitle, subSize, safeWidth);
    const subHeight = subLines * subSize * 1.4;

    els.push(
      createText(content.subtitle, padding, subY, safeWidth, subHeight, {
        fontSize: subSize,
        fontWeight: subWeight,
        textAlign: subAlign,
        fill: design?.text_color || DEFAULT_TEXT_COLOR,
        lineHeight: layout.line_height ? parseFloat(String(layout.line_height)) : 1,
        metadata: { role: "subtitle" },
      }),
    );
  }

  // Add slide image if present (with cover-specific defaults)
  if (data.image) {
    // For cover slides, randomly choose left or right (avoid center)
    let imagePosition = data.image.position;
    if (!imagePosition || imagePosition === "center") {
      imagePosition = Math.random() > 0.5 ? "left" : "right";
    }

    const imageEl = createSlideImage(data.image, dims, imagePosition);
    if (imageEl) {
      // Apply cover-specific defaults
      imageEl.opacity = data.image.opacity !== undefined ? data.image.opacity : 0.3;
      imageEl.zIndex = 1; // Ensure image is behind text
      els.push(imageEl);
    }
  }

  if (bp.author_display?.enabled) {
    const mergedDesign = { ...design, ...data.design_override };
    els.push(...generateAuthorDisplay(bp.author_display, bp.metadata.author, dims, mergedDesign));
  }

  return els;
};
