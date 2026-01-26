import type { Blueprint, CanvasElement } from "@/types/contentStudio.types";
import { LAYOUT_DEFAULTS, DEFAULT_TEXT_COLOR } from "../constants";
import { parsePixel } from "../utils";
import { calculateAuthorDisplayCoordinates } from "../utils";
import { createAvatar, createText } from "../factories";

export const generateAuthorDisplay = (
  authorDisplay: Blueprint["author_display"],
  author: Blueprint["metadata"]["author"],
  dims: { width: number; height: number },
  design: Blueprint["design"],
  textColorOverride?: string,
): CanvasElement[] => {
  const els: CanvasElement[] = [];
  const { width, height } = dims;

  // Use Defaults
  const avatarSize = parsePixel(authorDisplay?.content?.avatar?.size, LAYOUT_DEFAULTS.AUTHOR_DISPLAY.AVATAR_SIZE);
  const textSize = parsePixel(authorDisplay?.content?.text?.size, LAYOUT_DEFAULTS.AUTHOR_DISPLAY.TEXT_SIZE);

  const position = authorDisplay?.position || "bottom-center";

  const rawUrl = author?.avatar_url;
  const isInvalidUrl = !rawUrl || rawUrl.includes("example.com");
  const showAvatar = authorDisplay?.content?.avatar?.enabled !== false && !isInvalidUrl;

  const username = authorDisplay?.content?.text?.username || author?.name || "Author";
  const hashtag = authorDisplay?.content?.text?.hashtag || author?.hashtag;

  // Calc Layout (No longer using avatar params)
  const layout = calculateAuthorDisplayCoordinates(
    position,
    width,
    height,
    textSize,
    authorDisplay?.variant,
    authorDisplay?.swap_elements,
    username,
    hashtag,
  );

  // Avatar generation removed as per user request

  // Render Separator if needed
  if (layout.separator?.show) {
    const sepColor = textColorOverride || design?.author_color || design?.accent_color || DEFAULT_TEXT_COLOR;
    if (layout.separator.type === "line") {
      // Render a Line Shape
      els.push({
        id: `sep-${Math.random()}`,
        type: "shape",
        shapeType: "rect", // using rect as line for thickness control
        position: { x: layout.separator.x, y: layout.separator.y },
        size: { width: layout.separator.w, height: 2 }, // 2px thick
        rotation: 0,
        fill: sepColor,
        stroke: "transparent",
        strokeWidth: 0,
        opacity: 0.6,
        locked: false,
        visible: true,
        zIndex: 10,
        metadata: { role: "author_separator" },
      });
    } else if (layout.separator.type === "pipe") {
      // Render Pipe Text
      els.push(
        createText("|", layout.separator.x, layout.username.y, 20, textSize * 1.5, {
          fontSize: textSize,
          textAlign: "center",
          fill: sepColor,
          fontWeight: 300,
          metadata: { role: "author_separator" },
        }),
      );
    }
  }

  // Check for Inline (Merged) Mode: flagged by hashtag width 0
  if (hashtag && layout.hashtag.w === 0 && authorDisplay?.variant === "inline") {
    const isSwap = authorDisplay?.swap_elements;
    const combinedText = isSwap ? `${hashtag} | ${username}` : `${username} | ${hashtag}`;

    els.push(
      createText(combinedText, layout.username.x, layout.username.y, layout.username.w, textSize * 1.5, {
        fontSize: textSize,
        fontWeight: 400,
        fill: textColorOverride || design?.author_color || design?.accent_color || DEFAULT_TEXT_COLOR,
        textAlign: layout.username.align,
        metadata: {
          role: "username",
          authorDisplayPosition: position,
          authorDisplayVariant: authorDisplay?.variant,
          authorDisplaySwap: authorDisplay?.swap_elements,
          isCombined: true,
        },
      }),
    );
    // Skip separate hashtag rendering
  } else {
    // Standard separate rendering
    els.push(
      createText(username, layout.username.x, layout.username.y, layout.username.w, textSize * 1.5, {
        fontSize: textSize,
        fontWeight: 400,
        fill: textColorOverride || design?.author_color || design?.accent_color || DEFAULT_TEXT_COLOR,
        textAlign: layout.username.align,
        metadata: {
          role: "username",
          authorDisplayPosition: position,
          authorDisplayVariant: authorDisplay?.variant,
          authorDisplaySwap: authorDisplay?.swap_elements,
        },
      }),
    );

    if (hashtag && layout.hashtag.w > 0) {
      els.push(
        createText(hashtag, layout.hashtag.x, layout.hashtag.y, layout.hashtag.w, textSize * 1.5, {
          fontSize: textSize,
          fontWeight: 400,
          fill: textColorOverride || design?.author_color || design?.accent_color || DEFAULT_TEXT_COLOR,
          textAlign: layout.hashtag.align,
          metadata: {
            role: "hashtag",
            authorDisplayPosition: position,
            authorDisplayVariant: authorDisplay?.variant,
            authorDisplaySwap: authorDisplay?.swap_elements,
          },
        }),
      );
    }
  }

  return els;
};
