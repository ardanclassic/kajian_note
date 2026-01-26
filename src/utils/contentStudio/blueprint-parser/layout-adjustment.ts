import type { Slide, Ratio, CanvasElement, TextElement, ImageElement } from "@/types/contentStudio.types";
import { RATIO_DIMENSIONS } from "@/types/contentStudio.types";
import { LAYOUT_DEFAULTS, PADDING_RATIO } from "./constants";
import { estimateTextLines, calculateSlideImageCoordinates, calculateAuthorDisplayCoordinates } from "./utils";
import { generatePlaceholderSvg } from "../placeholderGenerator";

export function adjustSlideLayout(slide: Slide, targetRatio: Ratio): Slide {
  const dims = RATIO_DIMENSIONS[targetRatio];
  if (!dims) return slide;

  const { width: newWidth, height: newHeight } = dims;
  const baseWidth = 540;
  const scaleFactor = Math.min(1, newWidth / baseWidth);
  const DEFAULTS = LAYOUT_DEFAULTS;

  const elements = JSON.parse(JSON.stringify(slide.elements)) as CanvasElement[];

  const padding = newWidth * PADDING_RATIO;
  const safeWidth = newWidth - padding * 2;

  const titleEl = elements.find((e) => e.metadata?.role === "slide_title" || e.metadata?.role === "title");
  const subEl = elements.find((e) => e.metadata?.role === "subtitle");
  const paras = elements
    .filter((e) => e.metadata?.role === "paragraph")
    .sort((a, b) => (a.metadata?.index || 0) - (b.metadata?.index || 0));

  const isCover = !!elements.find((e) => e.metadata?.role === "title");

  // --- Detect Layout Type ---
  const originalLayout = (slide.originalContent as any)?.layout;
  const isSplit = originalLayout?.type === "split";

  if (isSplit) {
    const halfH = newHeight / 2;
    const isFullBleed = originalLayout?.variant === "full-bleed" || originalLayout?.padding === false;
    const imgPad = isFullBleed ? 0 : padding;
    const imgW = newWidth - imgPad * 2;
    const imgH = halfH - imgPad * 2;

    // Reflow Top Layout
    const topImage = elements.find((e) => e.metadata?.role === "slide_image" && e.metadata?.zone === "top");
    const topGradient = elements.find((e) => e.metadata?.role === "gradient_overlay_top");

    if (topImage && topImage.type === "image") {
      topImage.position.x = imgPad;
      topImage.position.y = imgPad;
      topImage.size.width = imgW;
      topImage.size.height = imgH;
      if (topImage.src.startsWith("data:image/svg+xml") && topImage.src.includes("Placeholder")) {
        topImage.src = generatePlaceholderSvg(imgW, imgH);
      }
    } else {
      // --- Reflow Text Zones ---
      const topType = originalLayout?.top_content || "image";
      const bottomType = originalLayout?.bottom_content || "text";

      // helper to center a block of elements in a zone
      const centerBlockInZone = (els: CanvasElement[], startY: number, zoneHeight: number) => {
        if (els.length === 0) return;

        // Calculate current total height of the block
        // We probably want to re-measure lines as width might have changed
        let currentBlockH = 0;
        const spacing = 15; // default spacing

        // Update font sizes and measure new heights
        els.forEach((el, i) => {
          if (el.type === "text") {
            const isTitle = el.metadata?.role === "split_title";
            const roleSize = isTitle ? LAYOUT_DEFAULTS.CONTENT.TITLE_SIZE : LAYOUT_DEFAULTS.CONTENT.TEXT_SIZE;

            // Scale font size
            const newFontSize = Math.max(12, Math.floor(roleSize * scaleFactor));
            (el as TextElement).fontSize = newFontSize;

            const lines = estimateTextLines((el as TextElement).content, newFontSize, safeWidth);
            const lh = (el as TextElement).lineHeight || 1.3;
            const h = lines * newFontSize * lh; // + buffer?

            el.size.width = safeWidth;
            el.size.height = h; // update height

            currentBlockH += h;
            if (i < els.length - 1) currentBlockH += spacing;
          }
        });

        let writeY = startY + (zoneHeight - currentBlockH) / 2;
        if (writeY < startY + padding) writeY = startY + padding;

        els.forEach((el, i) => {
          el.position.x = padding;
          el.position.y = writeY;
          if (el.type === "text") {
            (el as TextElement).textAlign = "center";
          }
          writeY += el.size.height + spacing;
        });
      };

      // Collect Text Elements
      // We strictly filter for split_title and paragraph.
      // We intentionally exclude 'overlay_text' (handled separately) and 'username'/'hashtag' (author).
      const allTextEls = elements
        .filter((e) => e.type === "text" && (e.metadata?.role === "split_title" || e.metadata?.role === "paragraph"))
        .sort((a, b) => a.position.y - b.position.y);

      if (topType === "text" && bottomType === "text") {
        // Split by old midpoint.
        // We can estimate old midpoint by the gap.
        // Or simply: top half of array -> top, bottom half -> bottom? No.
        // Let's use the average Y.
        if (allTextEls.length > 0) {
          const minY = allTextEls[0].position.y;
          const maxY = allTextEls[allTextEls.length - 1].position.y;
          const midY = (minY + maxY) / 2;

          const topTextEls = allTextEls.filter((e) => e.position.y <= midY);
          const bottomTextEls = allTextEls.filter((e) => e.position.y > midY);

          centerBlockInZone(topTextEls, 0, halfH);
          centerBlockInZone(bottomTextEls, halfH, halfH);
        }
      } else if (topType === "text") {
        // All text belongs to top
        centerBlockInZone(allTextEls, 0, halfH);
      } else if (bottomType === "text") {
        // All text belongs to bottom (most common case)
        centerBlockInZone(allTextEls, halfH, halfH);
      }
    }

    // Resize Gradients
    const gradH = 150;
    if (topGradient) {
      topGradient.position.y = halfH - gradH;
      topGradient.size.width = newWidth;
      topGradient.size.height = gradH;
    }
    const bottomGradient = elements.find((e) => e.metadata?.role === "gradient_overlay_bottom");
    if (bottomGradient) {
      bottomGradient.position.y = halfH;
      bottomGradient.size.width = newWidth;
      bottomGradient.size.height = gradH;
    }

    // Reflow Bottom Layout
    const bottomImage = elements.find((e) => e.metadata?.role === "slide_image" && e.metadata?.zone === "bottom");
    if (bottomImage && bottomImage.type === "image") {
      bottomImage.position.x = imgPad;
      bottomImage.position.y = halfH + imgPad;
      bottomImage.size.width = imgW;
      bottomImage.size.height = imgH;
      if (bottomImage.src.startsWith("data:image/svg+xml") && bottomImage.src.includes("Placeholder")) {
        bottomImage.src = generatePlaceholderSvg(imgW, imgH);
      }
    }

    // Handle Overlay Text on Image (if any)
    const overlays = elements.filter((e) => e.metadata?.role === "overlay_text");
    overlays.forEach((ov) => {
      // Simple heuristic: If currently in top half -> keep in top half.
      // We use the element's current center to decide.
      const centerY = ov.position.y + ov.size.height / 2;
      const oldHReference =
        elements.find((e) => e.metadata?.role === "gradient_overlay_bottom")?.position.y ||
        (topImage ? topImage.size.height : 1000);

      // If we can't find reference, assume top if y < 300?
      // Actually, just checking if it's "above" the bottom image or "below" the top image?
      // Let's use the new halfH as a split line for the *target* position based on *relative* old position.
      // Since we don't know old height easily, let's assume if y < current canvas height / 2.

      // Wait, 'slide' has current elements. If we are traversing 4:5 -> 9:16.
      // The elements are still in 4:5 positions.
      // We can just check if y < (max_y_of_all_elements / 2).

      // Safest: check if there is a top image and if this text overlaps it?
      // Simpler: Just check if y is roughly in the top part.

      const isTop = ov.position.y < elements.reduce((max, e) => Math.max(max, e.position.y), 0) / 2; // simplistic

      const zoneY = isTop ? 0 : halfH;

      ov.position.x = newWidth / 2; // Center horizontally
      ov.position.y = zoneY + halfH / 2; // Center vertically in zone

      // Ensure standard overlay style updates if needed
      (ov as any).originX = "center";
      (ov as any).originY = "center";
    });
  } else if (isCover) {
    let currentY = newHeight * 0.25;

    if (titleEl && titleEl.type === "text") {
      const newSize = Math.max(24, Math.floor(DEFAULTS.COVER.TITLE_SIZE * scaleFactor));
      (titleEl as TextElement).fontSize = newSize;
      const tLines = estimateTextLines((titleEl as TextElement).content, newSize, safeWidth);
      const tHeight = tLines * newSize * 1.2;

      const coverPad = newWidth * 0.1;
      titleEl.position.x = coverPad;
      titleEl.position.y = currentY;
      titleEl.size.width = newWidth - coverPad * 2;
      titleEl.size.height = tHeight;

      const spacingBase = DEFAULTS.COVER.SPACING;
      const spacing = spacingBase * 2 * scaleFactor;

      currentY += tHeight + spacing;
    }

    if (subEl && subEl.type === "text") {
      const newSize = Math.max(16, Math.floor(DEFAULTS.COVER.SUBTITLE_SIZE * scaleFactor));
      (subEl as TextElement).fontSize = newSize;
      const sLines = estimateTextLines((subEl as TextElement).content, newSize, safeWidth);
      const sHeight = sLines * newSize * 1.4;

      const coverPad = newWidth * 0.1;
      subEl.position.x = coverPad;
      subEl.position.y = currentY;
      subEl.size.width = newWidth - coverPad * 2;
      subEl.size.height = sHeight;
    }
  } else {
    let totalH = 0;
    let titleHeight = 0;
    const titleMarginBottom = 30 * scaleFactor;

    if (titleEl && titleEl.type === "text") {
      const newSize = Math.max(18, Math.floor(DEFAULTS.CONTENT.TITLE_SIZE * scaleFactor));
      (titleEl as TextElement).fontSize = newSize;
      const tLines = estimateTextLines((titleEl as TextElement).content, newSize, safeWidth);
      titleHeight = tLines * newSize * 1.3;
      totalH += titleHeight + titleMarginBottom;
    }

    const isTallVertical = newHeight / newWidth > 1.5; // Only dampen for 9:16 or very tall
    const verticalDampener = isTallVertical ? 0.85 : 1.0;

    const baseSize = DEFAULTS.CONTENT.TEXT_SIZE;
    const newSize = Math.max(12, Math.floor(baseSize * scaleFactor * verticalDampener));
    const baseSpacing = DEFAULTS.CONTENT.PARAGRAPH_SPACING;
    // Reduce vertical spacing between items (User Feedback)
    const newSpacing = baseSpacing * scaleFactor * 0.6;
    const lh = DEFAULTS.CONTENT.LINE_HEIGHT;

    if (paras.length > 0) {
      paras.forEach((p, idx) => {
        if (p.type === "text") {
          (p as TextElement).fontSize = newSize;
          const pLines = estimateTextLines((p as TextElement).content, newSize, safeWidth);
          // Tighten line height calculation slightly
          const pHeight = pLines * newSize * lh;
          totalH += pHeight;
          if (idx < paras.length - 1) totalH += newSpacing;
        }
      });
    }

    // -- Improved Dynamic Vertical Centering for Reflow --
    const authorDisplayEl = elements.find((e) => e.metadata?.role === "username");
    const imageEl = elements.find((e) => e.metadata?.role === "slide_image");

    const isTopAD = authorDisplayEl?.metadata?.authorDisplayPosition?.includes("top");

    // Initial Buffers (Author/Page Edges)
    let topBuf = isTopAD ? 110 * scaleFactor : 60 * scaleFactor;
    let bottomBuf = authorDisplayEl && !isTopAD ? 120 * scaleFactor : 60 * scaleFactor;

    // Image Reflow Logic & Buffer Adjustment
    if (imageEl && imageEl.type === "image") {
      const imgPosition = imageEl.metadata?.imagePosition || "bottom";

      const {
        x,
        y,
        width: imgW,
        height: imgH,
        padding: imgPad,
      } = calculateSlideImageCoordinates(imgPosition, newWidth, newHeight);

      // Update size
      imageEl.size.width = imgW;
      imageEl.size.height = imgH;
      imageEl.position.x = x;
      imageEl.position.y = y;
      (imageEl as ImageElement).cornerRadius = 8;

      if (imageEl.src.startsWith("data:image/svg+xml") && imageEl.src.includes("Placeholder")) {
        imageEl.src = generatePlaceholderSvg(imgW, imgH);
      }

      // Update buffer with explict Safe Gap to prevent overlap
      // User reported overlap -> we force a gap
      const safeGap = 40 * scaleFactor;

      if (imgPosition === "top") {
        // Text is below image
        topBuf = y + imgH + safeGap;
      } else if (imgPosition === "bottom") {
        // Text is above image
        // Image Y is the top edge of image.
        // So bottom buffer must be height - imageY + gap.
        bottomBuf = newHeight - y + safeGap;
      }
    }

    // Calculate Available Height for Text
    let availH = newHeight - topBuf - bottomBuf;

    // Safety check: if availH is too small, we might need to shrink spacing or just clamp
    if (availH < 0) availH = 0;

    // Center content within the *Available* space
    let startY = topBuf + (availH - totalH) / 2;

    // Clamp StartY: Never start higher than topBuf
    if (startY < topBuf) startY = topBuf;

    // Overflow Check: If totalH > availH, text will naturally overflow bottom buffer.
    // We stick to topBuf start in that case.

    if (titleEl) {
      titleEl.position.y = startY;
      titleEl.position.x = padding;
      titleEl.size.width = safeWidth;
      titleEl.size.height = titleHeight;

      startY += titleHeight + titleMarginBottom;
    }

    if (paras.length > 0) {
      paras.forEach((p) => {
        if (p.type === "text") {
          const pLines = estimateTextLines(p.content, newSize, safeWidth);
          const pHeight = pLines * newSize * lh;
          p.position.y = startY;
          p.position.x = padding;
          p.size.width = safeWidth;
          p.size.height = pHeight;
          startY += pHeight + newSpacing;
        }
      });
    }
  }

  // --- Author Display Reflow with Persistence ---
  // Read persistent author display position from Metadata
  const userEl = elements.find((e) => e.metadata?.role === "username");
  const hashEl = elements.find((e) => e.metadata?.role === "hashtag");

  // Fallback to what's in element metadata or default
  const position = userEl?.metadata?.authorDisplayPosition || "bottom-center";
  const variant = userEl?.metadata?.authorDisplayVariant || "stacked";
  const swap = !!userEl?.metadata?.authorDisplaySwap;

  // Calculate Layout using Helper
  const scaleText = Math.min(1, newWidth / 540);

  // Re-apply dampener logic for author text
  const isTall = newHeight / newWidth > 1.5;
  const vertDamp = isTall ? 0.9 : 1.0;

  // Avatar removed
  const authorDisplayTextSize = Math.max(10, LAYOUT_DEFAULTS.AUTHOR_DISPLAY.TEXT_SIZE * scaleText * vertDamp);

  const layout = calculateAuthorDisplayCoordinates(
    position,
    newWidth,
    newHeight,
    authorDisplayTextSize,
    variant,
    swap,
    (userEl as TextElement)?.content,
    (hashEl as TextElement)?.content
  );

  // Avatar block removed

  if (userEl && userEl.type === "text") {
    (userEl as TextElement).fontSize = authorDisplayTextSize;
    (userEl as TextElement).textAlign = layout.username.align;
    userEl.position.x = layout.username.x;
    userEl.position.y = layout.username.y;
    userEl.size.width = layout.username.w;
  }

  if (hashEl && hashEl.type === "text") {
    (hashEl as TextElement).fontSize = authorDisplayTextSize;
    (hashEl as TextElement).textAlign = layout.hashtag.align;
    hashEl.position.x = layout.hashtag.x;
    hashEl.position.y = layout.hashtag.y;
    hashEl.size.width = layout.hashtag.w;
  }

  // Handle Separator Reflow
  const sepEl = elements.find((e) => e.metadata?.role === "author_separator");
  if (sepEl && layout.separator.show) {
    sepEl.position.x = layout.separator.x;
    sepEl.position.y = layout.separator.y;

    if (sepEl.type === "shape") {
      sepEl.size.width = layout.separator.w;
      // height stays?
    } else if (sepEl.type === "text") {
      // Pipe separator text
      // Update font size or position
      (sepEl as TextElement).fontSize = authorDisplayTextSize;
      sepEl.position.y = layout.username.y; // Align with username
    }
    sepEl.visible = true;
  } else if (sepEl && !layout.separator.show) {
    sepEl.visible = false;
  }

  return { ...slide, elements };
}
