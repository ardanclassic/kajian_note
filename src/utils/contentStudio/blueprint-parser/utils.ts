import { PADDING_RATIO, LAYOUT_DEFAULTS } from "./constants";

// Helper: Convert hex to gradient stops (solid to transparent)
export const hexToGradientStops = (hex: string) => {
  let c = hex.replace("#", "");
  if (c.length === 3)
    c = c
      .split("")
      .map((x) => x + x)
      .join("");
  if (c.length !== 6) return { start: "rgba(255,255,255,1)", end: "rgba(255,255,255,0)" };

  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);

  return { start: `rgba(${r},${g},${b},1)`, end: `rgba(${r},${g},${b},0)` };
};

// Helper: Check if color is dark
export const isDarkColor = (hex: string) => {
  if (hex === "black") return true;
  if (hex === "white") return false;
  let c = hex.replace("#", "");
  if (c.length === 3)
    c = c
      .split("")
      .map((x) => x + x)
      .join("");
  if (c.length !== 6) return false;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
};

export const parsePixel = (val: string | number | undefined, def: number): number => {
  if (val === undefined || val === null) return def;
  if (typeof val === "number") return val;
  const match = String(val).match(/^(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : def;
};

export const parseWeight = (val: string | number | undefined, def: number = 400): number => {
  if (val === "bold") return 700;
  if (val === "normal") return 400;
  if (typeof val === "number") return val;
  return val ? parseInt(String(val), 10) || def : def;
};

export const resolveTextAlign = (
  specific: string | undefined,
  global: string | undefined,
  def: "left" | "center" | "right",
): "left" | "center" | "right" => {
  if (specific) {
    if (specific.includes("left")) return "left";
    if (specific.includes("center")) return "center";
    if (specific.includes("right")) return "right";
  }
  if (global) {
    if (global.includes("left")) return "left";
    if (global.includes("center")) return "center";
    if (global.includes("right")) return "right";
  }
  return def;
};

export const estimateTextLines = (text: string, fontSize: number, width: number): number => {
  if (!text) return 0;
  const avgCharWidth = fontSize * 0.55;
  const charsPerLine = Math.floor(width / avgCharWidth);
  return Math.ceil(text.length / Math.max(1, charsPerLine));
};

export const estimateTextWidth = (text: string, fontSize: number): number => {
  if (!text) return 0;
  // A slightly more conservative estimate for mixed case text to ensure we don't under-allocate
  const avgCharWidth = fontSize * 0.75;
  return Math.ceil(text.length * avgCharWidth);
};

export const calculateAuthorDisplayCoordinates = (
  position: string,
  width: number,
  height: number,
  textSize: number,
  variant: "stacked" | "inline" | "split" | "split-line" = "stacked",
  swap: boolean = false,
  usernameText: string = "Author",
  hashtagText: string = "",
) => {
  const isTop = position.includes("top");
  const isMiddle = position.includes("middle");
  const isLeft = position.includes("left");
  const isRight = position.includes("right");
  const isBetween = position.includes("between") || position.includes("justify");
  const isCenter = !isLeft && !isRight && !isBetween;

  // Infer variant if not explicitly set but position implies split
  const mode = isBetween ? (variant === "stacked" ? "split" : variant) : variant;

  // Dynamic Padding for Narrow Widths (e.g., 9:16)
  const isNarrow = width < 400;
  const currentPadRatio = isNarrow ? 0.05 : PADDING_RATIO;
  const pad = width * currentPadRatio;

  // Dimensions
  const gap = 12; // Gap between elements
  const nameH = textSize * 1.5;
  const hashH = hashtagText ? textSize : 0;
  const textStackH = nameH + hashH;

  // Base Y Calculation - Responsive to Height
  let blockH = 0;
  if (mode === "stacked") {
    blockH = textStackH;
  } else {
    // Inline / Split modes
    blockH = textSize * 1.5;
  }

  let baseY = 0;
  if (isTop) baseY = 32;
  else if (isMiddle) baseY = (height - blockH) / 2;
  else baseY = height - blockH - 40;

  // Initialize Layout Return Object
  const layout = {
    // Avatar removed
    username: { x: 0, y: baseY, w: 0, align: "left" as "left" | "center" | "right" },
    hashtag: { x: 0, y: baseY, w: 0, align: "left" as "left" | "center" | "right" },
    separator: { x: 0, y: 0, w: 0, show: false, type: "none" },
  };

  if (mode === "split" || mode === "split-line") {
    // Split Layout (Justify Between)

    const leftContentStart = pad;
    const rightContentEnd = width - pad;
    const availableW = rightContentEnd - leftContentStart;

    const leftItem = swap ? "hashtag" : "username";
    const rightItem = swap ? "username" : "hashtag";

    const leftKey = leftItem as "username" | "hashtag";
    const rightKey = rightItem as "username" | "hashtag";

    // Estimate widths with safety buffer
    const leftText = swap ? hashtagText : usernameText;
    const rightText = swap ? usernameText : hashtagText;

    // Minimum width is decent, but maximum shouldn't exceed 45% of available space to prevent overlap
    const maxItemW = availableW * 0.45;

    const estLeftW = Math.min(estimateTextWidth(leftText, textSize) + 20, maxItemW);
    const estRightW = Math.min(estimateTextWidth(rightText, textSize) + 20, maxItemW);

    layout[leftKey].x = leftContentStart;
    layout[leftKey].align = "left";
    layout[leftKey].w = estLeftW; // Dynamic width
    layout[leftKey].y = baseY + (blockH - textSize * 1.5) / 2;

    layout[rightKey].w = estRightW; // Dynamic width
    layout[rightKey].x = rightContentEnd - layout[rightKey].w;
    layout[rightKey].align = "right";
    layout[rightKey].y = layout[leftKey].y;

    if (mode === "split-line") {
      layout.separator.show = true;
      layout.separator.type = "line";
      // Position line between the actual text elements
      // Reduced gap to make line longer
      const lineGap = 8;
      layout.separator.x = leftContentStart + estLeftW + lineGap;
      layout.separator.w = layout[rightKey].x - lineGap - layout.separator.x;

      // Move line up slightly.
      // User aligns it with text visual center.
      layout.separator.y = baseY + textSize * 0.65;

      // Safety: if line width is negative (overlap), hide or shrink?
      if (layout.separator.w < 10) {
        layout.separator.show = false;
      }
    }
  } else if (mode === "inline") {
    // Inline: Text1 [Sep] Text2
    // We strive for balance: Text1 (Right Aligned to sep) | Text2 (Left Aligned to sep)
    // Actually, normally: Text1 (Align Right) | Text2 (Align Left) looks best if centered.
    // If Left Aligned: Text1 (Left) | Text2 (Left)
    // If Right Aligned: Text1 (Right) | Text2 (Right)

    const firstItem = swap ? "hashtag" : "username";
    const secondItem = swap ? "username" : "hashtag";

    const k1 = firstItem as "username" | "hashtag";
    const k2 = secondItem as "username" | "hashtag";

    const sepWidth = 24; // Space reserved for separator
    const itemWidth = (width - pad * 2 - sepWidth) / 2; // Split remaining space equally?
    // Or closer to content?
    // Let's stick to a robust approach: Use predefined widths for the blocks to ensure the separator is exactly where expected.

    // Total block width concept
    const totalBlockW = width - pad * 2;

    let blockStartX = pad;

    layout.separator.show = true;
    layout.separator.type = "pipe";
    layout.separator.w = sepWidth; // Effective width for the pipe slot

    if (isCenter) {
      layout.username.align = "center";
      layout.username.w = width - pad * 2;
      layout.username.x = pad;
      layout.username.y = baseY + (blockH - textSize * 1.5) / 2;
    } else if (isRight) {
      layout.username.align = "right";
      layout.username.w = width - pad * 2;
      layout.username.x = pad;
      layout.username.y = baseY + (blockH - textSize * 1.5) / 2;
    } else {
      // Left
      layout.username.align = "left";
      layout.username.w = width - pad * 2;
      layout.username.x = pad;
      layout.username.y = baseY + (blockH - textSize * 1.5) / 2;
    }

    // Disable separate hashtag/separator to signal "Single Block Mode"
    layout.hashtag.w = 0;
    layout.hashtag.x = 0;
    layout.separator.show = false;

    // Vertical Center (already set above, but ensuring consistency)
    layout[k2].y = layout.username.y; // Ensure hashtag y is also set just in case, though usually ignored if merged
  } else {
    // Stacked (Classic)
    if (isCenter) {
      layout.username.align = "center";
      layout.username.w = width - pad * 2;
      layout.username.x = pad;
      layout.hashtag.align = "center";
      layout.hashtag.w = width - pad * 2;
      layout.hashtag.x = pad;

      layout.username.y = baseY + (blockH - textStackH) / 2;
      layout.hashtag.y = layout.username.y + nameH;
    } else if (isRight) {
      layout.username.align = "right";
      layout.hashtag.align = "right";

      layout.username.x = pad;
      layout.username.w = width - pad * 2;
      layout.hashtag.x = pad;
      layout.hashtag.w = width - pad * 2;

      const textY = baseY + (blockH - textStackH) / 2;
      layout.username.y = textY;
      layout.hashtag.y = textY + nameH;
    } else {
      // Left Stacked
      layout.username.align = "left";
      layout.hashtag.align = "left";

      layout.username.x = pad;
      layout.username.w = width - pad * 2;
      layout.hashtag.x = pad;
      layout.hashtag.w = width - pad * 2;

      const textY = baseY + (blockH - textStackH) / 2;
      layout.username.y = textY;
      layout.hashtag.y = textY + nameH;
    }
  }

  return layout;
};

export const calculateSlideImageCoordinates = (
  position: "top" | "bottom" | "center" | "left" | "right",
  width: number,
  height: number,
) => {
  const padding = width * PADDING_RATIO;

  // Back to standard size: width minus padding
  const imageWidth = width - padding * 2;
  const imageHeight = height * 0.4;

  let yPos = (height - imageHeight) / 2; // Default: centered
  let xPos = padding; // Default: centered

  if (position === "top") {
    yPos = padding;
  } else if (position === "bottom") {
    // Extra offset to avoid overlapping with author/footer (approx 80px extra)
    yPos = height - imageHeight - (padding + 80);
  } else if (position === "left") {
    xPos = 0; // Flush left
  } else if (position === "right") {
    xPos = width - imageWidth; // Flush right
  }

  return { x: xPos, y: yPos, width: imageWidth, height: imageHeight, padding };
};
