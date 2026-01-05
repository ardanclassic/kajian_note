// Editor Type Definitions

export type Ratio = "4:5" | "9:16" | "3:4";

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// Element types
export type ElementType = "text" | "image" | "shape" | "group";

export interface BaseElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  zIndex: number;
  metadata?: Record<string, any>;
}

export interface TextElement extends BaseElement {
  type: "text";
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  textAlign: "left" | "center" | "right";
  lineHeight: number;
  letterSpacing: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  textDecoration?: "none" | "underline" | "line-through";
  textTransform?: "none" | "uppercase" | "lowercase";
}

export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  scaleX: number;
  scaleY: number;
  cropX?: number;
  cropY?: number;
  filters?: string[];
  cornerRadius?: number;
}

// Gradient type definition
export interface GradientFill {
  type: "linear" | "radial";
  startColor: string;
  endColor: string;
  angle: number; // For linear (in degrees)
}

export interface ShapeElement extends BaseElement {
  type: "shape";
  shapeType: "rect" | "circle" | "line" | "triangle" | "star" | "polygon";
  fill: string | GradientFill;
  stroke: string;
  strokeWidth: number;
  strokeDashArray?: number[] | null; // For dashed/dotted strokes
  cornerRadius?: number;
  points?: number; // For star shape
  // Text properties (for text-on-shape feature)
  textContent?: string;
  textFontFamily?: string;
  textFontSize?: number;
  textFontWeight?: number;
  textFill?: string;
  textAlign?: "left" | "center" | "right";
  lineStart?: "none" | "arrow" | "circle" | "square" | "diamond" | "bar";
  lineEnd?: "none" | "arrow" | "circle" | "square" | "diamond" | "bar";
}

export type CanvasElement = TextElement | ImageElement | ShapeElement;

// Slide types
export interface Slide {
  id: string;
  // type removed
  elements: CanvasElement[];
  backgroundColor: string;
  backgroundImage?: string;
  thumbnail?: string;
  styleVariant?: "A" | "B";
  originalContent?: any;
  title?: string;
  isHidden?: boolean;
  isLocked?: boolean;
  metadata?: Record<string, any>;
}

// Template types
export type ContentType =
  | "paragraph"
  | "content_points"
  | "sequential_process"
  | "infographic_style"
  | "detailed_breakdown"
  | "narrative_with_points"
  | "practical_checklist"
  | "definition_box"
  | "myth_vs_fact"
  | "misconception_clarification";

export type ImageLayout =
  | "header_illustration"
  | "background_image"
  | "side_illustration"
  | "center_focal_illustration"
  | "bottom_illustration"
  | "split_screen"
  | "floating_illustration"
  | "text_on_shape_with_bg_illustration"
  | "icon_grid_with_text"
  | "illustration_behind_text";

export interface Template {
  id: string;
  name: string;
  contentType?: ContentType;
  imageLayout?: ImageLayout;
  preview: string;
  elements: Partial<CanvasElement>[];
}

// Color palette
export interface ColorPalette {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent_1: string;
    background: string;
    text_dark: string;
  };
}

// History for undo/redo
export interface HistoryEntry {
  slides: Slide[];
  currentSlideIndex: number;
  timestamp: number;
}

// Canvas dimensions
export const RATIO_DIMENSIONS: Record<Ratio, Size> = {
  "4:5": { width: 540, height: 675 },
  "9:16": { width: 405, height: 720 },
  "3:4": { width: 540, height: 720 },
};

// Display dimensions (scaled for UI)
export const DISPLAY_DIMENSIONS: Record<Ratio, Size> = {
  "4:5": { width: 600, height: 750 },
  "9:16": { width: 600, height: 1067 },
  "3:4": { width: 600, height: 800 },
};
