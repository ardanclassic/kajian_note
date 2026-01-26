// Supporting Box Generator - Pre-designed grouped elements

import { v4 as uuidv4 } from "uuid";
import type { TextElement, ShapeElement } from "@/types/contentStudio.types";
import { RATIO_DIMENSIONS, type Ratio } from "@/types/contentStudio.types";

export type SupportingBoxType = "important_note" | "wisdom_box" | "reminder" | "action_box" | "dalil_box";

interface SupportingBoxConfig {
  type: SupportingBoxType;
  title: string;
  content: string;
  icon?: string;
}

export function createSupportingBox(
  config: SupportingBoxConfig,
  ratio: Ratio,
  colorPalette: any
): (TextElement | ShapeElement)[] {
  const dimensions = RATIO_DIMENSIONS[ratio];

  // Responsive calculations
  const scale = dimensions.width / 540;

  // Box dimensions - compact size
  const boxWidth = dimensions.width * 0.8;
  const boxHeight = 120 * scale;

  // Box position (centered)
  const boxLeft = (dimensions.width - boxWidth) / 2;
  const boxTop = dimensions.height / 2 - boxHeight / 2;

  // Layout measurements (all relative to box top-left)
  const topPadding = 15 * scale;
  const leftPadding = 15 * scale;
  const iconSize = 35 * scale;
  const gapBetweenIconAndTitle = 12 * scale;
  const gapBetweenRowAndContent = 8 * scale;

  // Font sizes
  const titleFontSize = Math.round(18 * scale);
  const contentFontSize = Math.round(14 * scale);

  const elements: (TextElement | ShapeElement)[] = [];

  // 1. Background Box
  const bgBox: ShapeElement = {
    id: uuidv4(),
    type: "shape",
    shapeType: "rect",
    position: { x: boxLeft, y: boxTop },
    size: { width: boxWidth, height: boxHeight },
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 0,
    fill: getBoxColor(config.type, colorPalette),
    stroke: getStrokeColor(config.type, colorPalette),
    strokeWidth: 2 * scale,
    cornerRadius: 12 * scale,
    metadata: { groupType: "supporting_box", boxType: config.type, hover: false },
  };
  elements.push(bgBox);

  // 2. Icon (top-left inside box)
  const iconText: TextElement = {
    id: uuidv4(),
    type: "text",
    position: {
      x: boxLeft + leftPadding,
      y: boxTop + topPadding,
    },
    size: { width: iconSize, height: iconSize },
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 1,
    content: config.icon || getDefaultIcon(config.type),
    fontFamily: "Inter",
    fontSize: Math.round(28 * scale),
    fontWeight: 600,
    fontStyle: "normal",
    textAlign: "center",
    lineHeight: 1,
    letterSpacing: 0,
    fill: getTextColor(config.type, colorPalette),
    metadata: { groupType: "supporting_box", boxType: config.type, hover: false },
  };
  elements.push(iconText);

  // 3. Title (next to icon, same row)
  const titleLeft = boxLeft + leftPadding + iconSize + gapBetweenIconAndTitle;
  const titleText: TextElement = {
    id: uuidv4(),
    type: "text",
    position: {
      x: titleLeft,
      y: boxTop + topPadding + 3 * scale, // Slight adjustment for optical alignment
    },
    size: {
      width: boxWidth - (titleLeft - boxLeft) - leftPadding,
      height: 30 * scale,
    },
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 1,
    content: config.title,
    fontFamily: "Inter",
    fontSize: titleFontSize,
    fontWeight: 700,
    fontStyle: "normal",
    textAlign: "left",
    lineHeight: 1.2,
    letterSpacing: 0,
    fill: getTextColor(config.type, colorPalette),
    metadata: { groupType: "supporting_box", boxType: config.type, hover: false },
  };
  elements.push(titleText);

  // 4. Content (below icon/title row, full width)
  const firstRowHeight = iconSize; // Row occupied by icon and title
  const contentTop = boxTop + topPadding + firstRowHeight + gapBetweenRowAndContent;

  const contentText: TextElement = {
    id: uuidv4(),
    type: "text",
    position: {
      x: boxLeft + leftPadding,
      y: contentTop,
    },
    size: {
      width: boxWidth - leftPadding * 2,
      height: boxHeight - (contentTop - boxTop) - leftPadding,
    },
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 1,
    content: config.content,
    fontFamily: "Inter",
    fontSize: contentFontSize,
    fontWeight: 400,
    fontStyle: "normal",
    textAlign: "left",
    lineHeight: 1.4,
    letterSpacing: 0,
    fill: getTextColor(config.type, colorPalette),
    metadata: { groupType: "supporting_box", boxType: config.type, hover: false },
  };
  elements.push(contentText);

  return elements;
}

function getBoxColor(type: SupportingBoxType, palette: any): string {
  switch (type) {
    case "important_note":
      return "rgba(239, 68, 68, 0.15)"; // Red tint
    case "wisdom_box":
      return "rgba(168, 85, 247, 0.15)"; // Purple tint
    case "reminder":
      return "rgba(59, 130, 246, 0.15)"; // Blue tint
    case "action_box":
      return "rgba(34, 197, 94, 0.15)"; // Green tint
    case "dalil_box":
      return "rgba(251, 191, 36, 0.15)"; // Amber tint
    default:
      return palette?.colors?.primary || "rgba(59, 130, 246, 0.15)";
  }
}

function getStrokeColor(type: SupportingBoxType, palette: any): string {
  switch (type) {
    case "important_note":
      return "#EF4444";
    case "wisdom_box":
      return "#A855F7";
    case "reminder":
      return "#3B82F6";
    case "action_box":
      return "#22C55E";
    case "dalil_box":
      return "#FBBF24";
    default:
      return palette?.colors?.accent_1 || "#3B82F6";
  }
}

function getTextColor(type: SupportingBoxType, palette: any): string {
  switch (type) {
    case "important_note":
      return "#991B1B";
    case "wisdom_box":
      return "#6B21A8";
    case "reminder":
      return "#1E40AF";
    case "action_box":
      return "#15803D";
    case "dalil_box":
      return "#92400E";
    default:
      return palette?.colors?.text_dark || "#1a1a1a";
  }
}

function getDefaultIcon(type: SupportingBoxType): string {
  switch (type) {
    case "important_note":
      return "⚠️";
    case "wisdom_box":
      return "💡";
    case "reminder":
      return "🔔";
    case "action_box":
      return "🎯";
    case "dalil_box":
      return "📜";
    default:
      return "📌";
  }
}
