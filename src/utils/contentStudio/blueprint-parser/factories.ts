import { v4 as uuidv4 } from "uuid";
import type { TextElement, ImageElement, BlueprintSlideImage } from "@/types/contentStudio.types";
import { DEFAULT_FONT_FAMILY, DEFAULT_TEXT_COLOR, LAYOUT_DEFAULTS } from "./constants";
import { generatePlaceholderSvg } from "../placeholderGenerator";
import { calculateSlideImageCoordinates } from "./utils";

export const createText = (
  content: string,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: Partial<TextElement> = {},
): TextElement => ({
  id: uuidv4(),
  type: "text",
  content,
  position: { x, y },
  size: { width: w, height: h },
  rotation: 0,
  opacity: 1,
  locked: false,
  visible: true,
  zIndex: 10,
  fontFamily: DEFAULT_FONT_FAMILY,
  fontSize: 18,
  fontWeight: 400,
  fontStyle: "normal",
  textAlign: "left",
  lineHeight: LAYOUT_DEFAULTS.CONTENT.LINE_HEIGHT,
  letterSpacing: 0,
  fill: DEFAULT_TEXT_COLOR,
  ...opts,
});

export const createAvatar = (
  x: number,
  y: number,
  size: number,
  url?: string,
  opts: Partial<ImageElement> = {},
): ImageElement => {
  const isDummy = !url || url.includes("example.com");
  const src = isDummy
    ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23E0E0E0'/%3E%3Ccircle cx='50' cy='35' r='18' fill='%23BDBDBD'/%3E%3Cellipse cx='50' cy='75' rx='30' ry='20' fill='%23BDBDBD'/%3E%3C/svg%3E"
    : url || "";

  return {
    id: uuidv4(),
    type: "image",
    src,
    position: { x, y },
    size: { width: size, height: size },
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 15,
    scaleX: 1,
    scaleY: 1,
    cornerRadius: size / 2,
    ...opts,
  };
};

export const createSlideImage = (
  imageData: BlueprintSlideImage | undefined,
  dims: { width: number; height: number },
  position: "top" | "bottom" | "center" | "left" | "right",
  offsetY: number = 0,
): ImageElement | null => {
  if (!imageData?.url) return null;

  const { width, height } = dims;

  // Calculate layout coordinates
  const { x, y, width: imageWidth, height: imageHeight } = calculateSlideImageCoordinates(position, width, height);

  // Use placeholder for invalid/missing URLs
  const isInvalidUrl = !imageData.url || imageData.url.includes("example.com");
  const src = isInvalidUrl ? generatePlaceholderSvg(imageWidth, imageHeight) : imageData.url;

  // Position calculation handled by helper
  let yPos = y;

  // Apply offset if needed (for layout adjustments)
  yPos += offsetY;

  return {
    id: uuidv4(),
    type: "image",
    src,
    position: { x, y: yPos },
    size: { width: imageWidth, height: imageHeight },
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 5, // Below text elements (10) but above background
    scaleX: 1,
    scaleY: 1,
    cornerRadius: 8, // Slight rounding for aesthetics
    metadata: { role: "slide_image", imagePosition: position },
  };
};
