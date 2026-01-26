import type { Blueprint, BlueprintSlide, CanvasElement, BlueprintContentContent } from "@/types/contentStudio.types";
import { LAYOUT_DEFAULTS, DEFAULT_TEXT_COLOR, PADDING_RATIO } from "../constants";
import { parsePixel, parseWeight, resolveTextAlign, estimateTextLines } from "../utils";
import { createText, createSlideImage } from "../factories";
import { generateAuthorDisplay } from "./author-display";

export const generateContentSlide = (
  data: BlueprintSlide,
  bp: Blueprint,
  dims: { width: number; height: number },
): CanvasElement[] => {
  const els: CanvasElement[] = [];
  const { width, height } = dims;
  const content = data.content as BlueprintContentContent;
  const design = bp.design;
  const layout = data.layout || {};

  const padding = width * PADDING_RATIO;
  const safeWidth = width - padding * 2;

  const DEFAULTS = LAYOUT_DEFAULTS.CONTENT;

  const titleAlign = resolveTextAlign(layout.title_position, design.text_alignment, "center");
  const contentAlign = resolveTextAlign(layout.content_alignment, design.text_alignment, "left");

  // -- Improved Dynamic Vertical Centering & Overlap Protection --
  // 1. First, establish the SAFE AREA (Buffers) based on Author Display and Image
  const posOverride = layout.author_position_override;
  const varOverride = layout.author_variant_override;
  const swapOverride = layout.author_swap_override;

  const adConfig = bp.author_display
    ? {
        ...bp.author_display,
        ...(posOverride && { position: posOverride }),
        ...(varOverride && { variant: varOverride }),
        ...(swapOverride !== undefined && { swap_elements: swapOverride }),
      }
    : undefined;

  const isTopAuthorDisplay = adConfig?.enabled && adConfig.position?.includes("top");

  // Increased buffers for safety against overlap - Optimized for 540px width
  let topBuffer = isTopAuthorDisplay ? 80 : 40;
  let bottomBuffer = adConfig?.enabled && !isTopAuthorDisplay ? 90 : 50;

  // -- Image Layout Adjustment --
  if (data.image) {
    const imageHeight = height * 0.4;
    const imgPadding = width * PADDING_RATIO;
    const imgPosition = data.image.position || "bottom";

    if (imgPosition === "top") {
      topBuffer += imageHeight + imgPadding;
    } else {
      bottomBuffer += imageHeight + imgPadding + 40; // Reduced extra padding from 60 to 40
    }
  }

  const availableContentHeight = height - topBuffer - bottomBuffer;

  const is9_16 = height / width > 1.6;
  const defaultTextSize = is9_16 ? 12 : 14; // Explicitly 14 for 4:5 as requested

  // 2. Iterative Auto-Fit System
  // We calculate content height. If it exceeds availableContentHeight, we scale down and retry.

  // Ensure variables needed for calculation are defined BEFORE the loop
  const titleWeight = parseWeight(layout.title_weight, DEFAULTS.TITLE_WEIGHT);
  const lineHeight = parseFloat(layout.line_height || String(DEFAULTS.LINE_HEIGHT));

  let scaleFactor = 1.0;
  let titleSize = 0;
  let textSize = 0;
  let paraSpacing = 0;
  let totalContentHeight = 0;
  let titleHeight = 0;
  let titleMarginBottom = 0;
  let hasTitle = false;
  let titleLines = 0;

  const MAX_ATTEMPTS = 6;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Apply current scale factor
    titleSize = parsePixel(layout.title_size, DEFAULTS.TITLE_SIZE) * scaleFactor;
    textSize = parsePixel(layout.text_size, defaultTextSize) * scaleFactor;
    paraSpacing = parsePixel(layout.paragraph_spacing, DEFAULTS.PARAGRAPH_SPACING) * scaleFactor;

    // Clamp minimum sizes to remain readable
    const minSize = is9_16 ? 10 : 11;
    if (titleSize < 16) titleSize = 16;
    if (textSize < minSize) textSize = minSize; // Dynamic clamp based on ratio
    if (paraSpacing < 4) paraSpacing = 4;

    // Recalculate Heights
    hasTitle = !!content.slide_title;
    titleLines = hasTitle ? estimateTextLines(content.slide_title!, titleSize, safeWidth) : 0;
    titleHeight = titleLines * titleSize * 1.3;

    let loopTotalParaHeight = 0;

    // Logic duped from original to calculate block/para height
    if (content.blocks && content.blocks.length > 0) {
      const isMultiBlock = content.blocks.length > 1;
      // Boost gap significantly: 32px for clear paragraph separation (reduced from 64 which was too large for 540px)
      const dynamicGap = isMultiBlock ? 48 : DEFAULTS.PARAGRAPH_SPACING;

      content.blocks.forEach((block) => {
        const bStyle = block.style || {};
        // CORRECT SCALING: Get raw base size then multiply by scaleFactor
        // Fallback to defaultTextSize, not scaled textSize, to avoid double scaling issues or mismatch
        const rawBSize = parsePixel(bStyle.fontSize, defaultTextSize);
        const bSize = rawBSize * scaleFactor;

        const bLineHeight = bStyle.lineHeight || lineHeight;

        // Use dynamicGap if block spacing is not explicitly set
        const resolvedSpacing = bStyle.spacing !== undefined ? bStyle.spacing : dynamicGap;
        // Scale the spacing
        const bSpacing = resolvedSpacing * scaleFactor;

        const pLines = estimateTextLines(block.text, bSize, safeWidth);
        const pHeight = pLines * bSize * bLineHeight + 2;
        loopTotalParaHeight += pHeight + bSpacing;
      });
    } else if (content.paragraphs) {
      const paras = content.paragraphs;
      paras.forEach((p, idx) => {
        const pLines = estimateTextLines(p, textSize, safeWidth);
        const pHeight = pLines * textSize * lineHeight + 2;
        loopTotalParaHeight += pHeight;
        if (idx < paras.length - 1) {
          loopTotalParaHeight += paraSpacing;
        }
      });
    }

    const isMultiBlock = content.blocks && content.blocks.length > 1;
    // Increase title margin slightly more than content gap (64 -> 75) -> Reduced to 40 for compactness
    const baseTitleMargin = isMultiBlock ? 64 : 64;
    titleMarginBottom = hasTitle ? baseTitleMargin * scaleFactor : 0;
    totalContentHeight = titleHeight + titleMarginBottom + loopTotalParaHeight;

    // Check if it fits
    if (totalContentHeight <= availableContentHeight) {
      break; // It fits!
    }

    // Reduce scale for next iteration
    scaleFactor *= 0.95;
  }

  let startY = topBuffer + (availableContentHeight - totalContentHeight) / 2;

  // Safety clamp
  if (startY < topBuffer) startY = topBuffer;
  // If top author display is present, ensure we really don't go below it
  if (isTopAuthorDisplay && startY < 120) startY = 120;

  // Only add title element if slide_title exists
  if (hasTitle) {
    els.push(
      createText(content.slide_title!, padding, startY, safeWidth, titleHeight, {
        fontSize: titleSize,
        fontWeight: titleWeight,
        textAlign: titleAlign,
        fill: design?.text_color || DEFAULT_TEXT_COLOR,
        lineHeight: 1.2,
        metadata: { role: "slide_title" },
      }),
    );
  }

  let currentY = startY + titleHeight + titleMarginBottom;

  // -- Resolve Colors with overrides --
  const textColor = data.design_override?.text_color || design.text_color || DEFAULT_TEXT_COLOR;
  const accentColor = data.design_override?.accent_color || design.accent_color;

  // Process Content (Blocks or Paragraphs)
  if (content.blocks && content.blocks.length > 0) {
    const isMultiBlock = content.blocks.length > 1;
    const dynamicGap = isMultiBlock ? 48 : DEFAULTS.PARAGRAPH_SPACING;

    content.blocks.forEach((block, idx) => {
      // Resolve block styles
      const bStyle = block.style || {};

      // FIX: Apply same scaling logic as loop
      const rawBSize = parsePixel(bStyle.fontSize, defaultTextSize);
      const bSize = rawBSize * scaleFactor;

      const bWeight = parseWeight(bStyle.fontWeight, 400);
      const bColor = bStyle.color || textColor;
      const bAlign = resolveTextAlign(bStyle.align, contentAlign, "left");
      const bLineHeight = bStyle.lineHeight || lineHeight;

      const resolvedSpacing = bStyle.spacing !== undefined ? bStyle.spacing : dynamicGap;
      const bSpacing = resolvedSpacing * scaleFactor;

      // const bFont = bStyle.fontFamily || design.font_family; // not yet supported in createText factory fully but passed in opts

      const pLines = estimateTextLines(block.text, bSize, safeWidth);
      const pHeight = pLines * bSize * bLineHeight + 2;

      els.push(
        createText(block.text, padding, currentY, safeWidth, pHeight, {
          fontSize: bSize,
          fontWeight: bWeight,
          textAlign: bAlign,
          fill: bColor,
          lineHeight: bLineHeight,
          fontFamily: bStyle.fontFamily || design.font_family || "Inter",
          metadata: { role: "content_block", index: idx },
        }),
      );

      currentY += pHeight + bSpacing;
    });
  } else if (content.paragraphs) {
    content.paragraphs.forEach((p, idx) => {
      const pLines = estimateTextLines(p, textSize, safeWidth);
      const pHeight = pLines * textSize * lineHeight + 2;

      els.push(
        createText(p, padding, currentY, safeWidth, pHeight, {
          fontSize: textSize,
          fontWeight: 400,
          textAlign: contentAlign,
          fill: textColor,
          lineHeight,
          metadata: { role: "paragraph", index: idx },
        }),
      );

      // Smart Spacing for render
      if (idx < content.paragraphs!.length - 1) {
        currentY += pHeight + paraSpacing;
      } else {
        currentY += pHeight + paraSpacing;
      }
    });
  }

  // Add slide image if present
  if (data.image) {
    const imageEl = createSlideImage(data.image, dims, data.image.position || "bottom");
    if (imageEl) els.push(imageEl);
  }

  if (adConfig?.enabled) {
    const mergedDesign = { ...design, ...data.design_override };
    els.push(...generateAuthorDisplay(adConfig, bp.metadata.author, dims, mergedDesign));
  }

  return els;
};
