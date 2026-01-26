import { v4 as uuidv4 } from "uuid";
import type { Blueprint, BlueprintSlide, CanvasElement } from "@/types/contentStudio.types";
import { LAYOUT_DEFAULTS, DEFAULT_TEXT_COLOR, PADDING_RATIO } from "../constants";
import { parsePixel } from "../utils";
import { hexToGradientStops, isDarkColor, estimateTextLines } from "../utils";
import { createText } from "../factories";
import { generatePlaceholderSvg } from "../../placeholderGenerator"; // Fixing relative import to outside
import { generateAuthorDisplay } from "./author-display";

export const generateSplitSlide = (
  data: BlueprintSlide,
  bp: Blueprint,
  dims: { width: number; height: number }
): CanvasElement[] => {
  const els: CanvasElement[] = [];
  const { width, height } = dims;
  const design = bp.design;
  const layout = (data.layout as any) || {};

  // Content Types: "image" or "text"
  const topType = layout.top_content || "image";
  const bottomType = layout.bottom_content || "text";

  const halfH = height / 2;
  const padding = width * PADDING_RATIO;
  const safeW = width - padding * 2;

  const isFullBleed = layout.variant === "full-bleed" || layout.padding === false;

  // -- Helper: Render Image in Zone --
  const renderImage = (y: number, h: number, imgOverride?: any) => {
    const imgData = imgOverride || data.image;
    if (!imgData) return;

    const imgPad = isFullBleed ? 0 : padding;
    const imgW = width - imgPad * 2;
    const imgH = h - imgPad * 2;
    const imgX = imgPad;
    const imgY = y + imgPad;

    // Smart Placeholder Logic
    const src = !imgData.url || imgData.url.includes("example.com") ? generatePlaceholderSvg(imgW, imgH) : imgData.url;

    els.push({
      id: uuidv4(),
      type: "image",
      src,
      position: { x: imgX, y: imgY },
      size: { width: imgW, height: imgH },
      rotation: 0,
      opacity: 1,
      // Full Bleed images act as background -> Locked
      locked: isFullBleed,
      visible: true,
      zIndex: 5,
      scaleX: 1,
      scaleY: 1,
      cornerRadius: isFullBleed ? 0 : 12,
      metadata: { role: "slide_image", zone: y === 0 ? "top" : "bottom" },
    });

    // Render Overlay Text if present
    if (imgData.overlay_text) {
      const overlay = createText(imgData.overlay_text, width / 2, y + h / 2, imgW - 60, 0, {
        fontSize: 36,
        fontWeight: 700,
        fill: "#ffffff",
        textAlign: "center",
        fontFamily: "Inter",
        metadata: { role: "overlay_text" },
        zIndex: 7,
      });
      // Force center origin
      (overlay as any).originX = "center";
      (overlay as any).originY = "center";
      els.push(overlay);
    }
  };

  // -- Helper: Render Text in Zone --
  const renderText = (y: number, h: number) => {
    const content = data.content as any;
    if (!content) return;

    // Use Defaults
    const defaults = LAYOUT_DEFAULTS.CONTENT;
    const titleSize = parsePixel(layout.title_size, defaults.TITLE_SIZE);
    const textSize = parsePixel(layout.text_size, defaults.TEXT_SIZE);
    const lh = 1.3;
    const textColor = design?.text_color || DEFAULT_TEXT_COLOR;

    // Calculate Vertical Centering
    let totalContentHeight = 0;
    const showTitle = !!content.slide_title || !!content.title;
    const titleTxt = content.slide_title || content.title;

    let titleHeight = 0;
    if (showTitle) {
      const lines = estimateTextLines(titleTxt, titleSize, safeW);
      titleHeight = lines * titleSize * 1.3;
      totalContentHeight += titleHeight + 20;
    }

    const paragraphs = content.paragraphs || [];
    const paraHeights = paragraphs.map((p: string) => {
      const lines = estimateTextLines(p, textSize, safeW);
      return lines * textSize * lh;
    });

    const parasTotalH = paraHeights.reduce((a: number, b: number) => a + b + 15, 0);
    totalContentHeight += parasTotalH;

    let currentY = y + (h - totalContentHeight) / 2;
    if (currentY < y + padding) currentY = y + padding;

    if (showTitle) {
      els.push(
        createText(titleTxt, padding, currentY, safeW, titleHeight, {
          fontSize: titleSize,
          fontWeight: 700,
          textAlign: "center",
          fill: textColor,
          metadata: { role: "split_title" },
        })
      );
      currentY += titleHeight + 20;
    }

    paragraphs.forEach((p: string, i: number) => {
      const pH = paraHeights[i];
      els.push(
        createText(p, padding, currentY, safeW, pH, {
          fontSize: textSize,
          textAlign: "center",
          fill: textColor,
          lineHeight: lh,
          metadata: { role: "paragraph", index: i },
        })
      );
      currentY += pH + 15;
    });
  };

  // Render Top Zone
  if (topType === "image") {
    const images = (data as any).images;
    let imgData = data.image;
    // If 'images' array exists, prefer finding explicit 'top' position
    if (images && Array.isArray(images)) {
      imgData = images.find((img: any) => img.position === "top") || images[0];
    }
    renderImage(0, halfH, imgData);
  } else {
    renderText(0, halfH);
  }

  // Render Bottom Zone
  if (bottomType === "image") {
    const images = (data as any).images;
    let imgData = data.image;
    // If 'images' array exists, prefer finding explicit 'bottom' position
    if (images && Array.isArray(images)) {
      imgData = images.find((img: any) => img.position === "bottom") || images[images.length > 1 ? 1 : 0];
    }
    renderImage(halfH, halfH, imgData);
  } else {
    renderText(halfH, halfH);
  }

  // -- Gradient Overlays for Author Legibility --
  // Optional based on layout.gradient_divider
  const gradDiv = (layout as any).gradient_divider;

  if (gradDiv && gradDiv.enabled !== false) {
    const gradH = 150;
    const inputColor = gradDiv.color || "#ffffff";
    const { start: baseColor, end: fadeColor } = hexToGradientStops(inputColor);

    // Top Zone Gradient (Bottom-Up)
    if (topType === "image") {
      els.push({
        id: uuidv4(),
        type: "shape",
        shapeType: "rect",
        position: { x: 0, y: halfH - gradH },
        size: { width: width, height: gradH },
        rotation: 0,
        fill: {
          startColor: baseColor,
          endColor: fadeColor,
          angle: -90, // Upwards
        } as any,
        stroke: "transparent",
        strokeWidth: 0,
        opacity: 1,
        locked: true,
        visible: true,
        zIndex: 6,
        metadata: { role: "gradient_overlay_top" },
      });
    }

    // Bottom Zone Gradient (Top-Down)
    if (bottomType === "image") {
      els.push({
        id: uuidv4(),
        type: "shape",
        shapeType: "rect",
        position: { x: 0, y: halfH },
        size: { width: width, height: gradH },
        rotation: 0,
        fill: {
          startColor: baseColor,
          endColor: fadeColor,
          angle: 90, // Downwards
        } as any,
        stroke: "transparent",
        strokeWidth: 0,
        opacity: 1,
        locked: true,
        visible: true,
        zIndex: 6,
        metadata: { role: "gradient_overlay_bottom" },
      });
    }
  }

  // Render Author Display (Middle Band)
  if (bp.author_display?.enabled) {
    const posOverride = layout.author_position_override;
    const adConfig = posOverride
      ? { ...bp.author_display, position: posOverride }
      : { ...bp.author_display, position: "middle-center" };

    // Smart Contrast for Author Text
    let contrastColor: string | undefined = undefined;
    if (gradDiv && gradDiv.enabled !== false) {
      const divColor = gradDiv.color || "#ffffff";
      if (isDarkColor(divColor)) {
        contrastColor = "#ffffff";
      } else {
        contrastColor = "#1a1a1a";
      }
    }

    els.push(...generateAuthorDisplay(adConfig, bp.metadata.author, dims, design, contrastColor));
  }

  return els;
};
