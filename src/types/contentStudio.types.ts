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
  scaleX?: number;
  scaleY?: number;
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
  shadow?: any;
}

export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  cropX?: number;
  cropY?: number;
  filters?: string[];
  cornerRadius?: number;
  cornerRadii?: number[]; // [tl, tr, br, bl]
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
  shapeType: "rect" | "circle" | "line" | "triangle" | "polygon";
  fill: string | GradientFill;
  stroke: string;
  strokeWidth: number;
  strokeDashArray?: number[] | null; // For dashed/dotted strokes
  cornerRadius?: number;
  cornerRadii?: number[]; // [tl, tr, br, bl] for rect, [t, bl, br] for triangle
  points?: number; // For star shape
  // Text properties (for text-on-shape feature)
  textContent?: string;
  textFontFamily?: string;
  textFontSize?: number;
  textFontWeight?: number;
  textFill?: string;
  textAlign?: "left" | "center" | "right"; // Reverted justify
  lineStart?: "none" | "arrow" | "circle" | "square" | "diamond" | "bar";
  lineEnd?: "none" | "arrow" | "circle" | "square" | "diamond" | "bar";
}

// Frame element - dropzone for images

export type CanvasElement = TextElement | ImageElement | ShapeElement;

// Slide types
export interface Slide {
  id: string;
  // type removed
  elements: CanvasElement[];
  backgroundColor: string;
  backgroundImage?: string;
  thumbnail?: string;
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

// =====================
// Blueprint Types (JSON Import)
// =====================

export interface BlueprintAuthor {
  name: string;
  hashtag?: string;
  avatar_url?: string;
}

export interface BlueprintMetadata {
  title: string;
  source?: string;
  author: BlueprintAuthor;
  aspect_ratio: Ratio;
  total_slides: number;
  description?: string;
  tags?: string[];
}

export interface BlueprintDecorativeLine {
  enabled: boolean;
  color: string;
  width: string;
  thickness: string;
}

export interface BlueprintDesign {
  background_color: string;
  text_color: string;
  accent_color: string;
  font_family: string;
  decorative_line: BlueprintDecorativeLine;
  text_alignment?: "left" | "center" | "right";
  author_color?: string;
  // Color Variants (Palette)
  background_color_1?: string;
  background_color_2?: string;
  background_color_3?: string;
  text_color_1?: string;
  text_color_2?: string;
  text_color_3?: string;
  accent_color_1?: string;
  accent_color_2?: string;
  accent_color_3?: string;
}

export interface BlueprintCoverContent {
  title: string;
  subtitle?: string;
}

// Defines a rich text block for content slides
export interface BlueprintContentBlock {
  text: string;
  // Specific style overrides for this block
  style?: {
    fontSize?: string | number;
    fontWeight?: string | number;
    color?: string;
    align?: "left" | "center" | "right";
    fontFamily?: string;
    lineHeight?: number;
    spacing?: number; // Spacing after this block
    textTransform?: "none" | "uppercase" | "lowercase";
    backgroundColor?: string; // Optional text background
    width?: string; // e.g. "100%" or "50%"
    highlight?: boolean; // simple flag for emphasis logic if needed
  };
}

export interface BlueprintContentContent {
  slide_title?: string;
  paragraphs?: string[]; // Legacy support
  blocks?: BlueprintContentBlock[]; // New rich content system
}

export interface BlueprintSlideLayout {
  title_position?: string;
  title_size?: string;
  title_weight?: string;
  subtitle_position?: string;
  subtitle_size?: string;
  subtitle_weight?: string;
  content_alignment?: string;
  paragraph_spacing?: string;
  text_size?: string;
  line_height?: string;
  spacing?: string;
  author_position_override?: string;
  author_variant_override?: "stacked" | "inline" | "split" | "split-line";
  author_swap_override?: boolean;
}

export interface BlueprintSlideImage {
  url: string;
  position: "top" | "bottom" | "center" | "left" | "right";
  opacity?: number;
}

export interface BlueprintSlide {
  slide_number: number;
  type: "cover" | "content" | "closing";
  content: BlueprintCoverContent | BlueprintContentContent;
  layout: BlueprintSlideLayout;
  image?: BlueprintSlideImage; // Optional image support
  design_override?: Partial<BlueprintDesign>; // Slide-specific design overrides
}

export interface BlueprintAuthorDisplayAvatar {
  enabled: boolean;
  size: string;
  border_radius: string;
}

export interface BlueprintAuthorDisplayText {
  username: string;
  hashtag: string;
  spacing: string;
  size: string;
}

export interface BlueprintAuthorDisplay {
  enabled: boolean;
  position: string;
  variant?: "stacked" | "inline" | "split" | "split-line";
  swap_elements?: boolean;
  content: {
    avatar: BlueprintAuthorDisplayAvatar;
    text: BlueprintAuthorDisplayText;
  };
}

export interface Blueprint {
  metadata: BlueprintMetadata;
  design: BlueprintDesign;
  slides: BlueprintSlide[];
  author_display: BlueprintAuthorDisplay;
  caption?: string;
  hashtags?: string[];
}
