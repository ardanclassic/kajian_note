import type { CanvasElement, ColorPalette, Ratio, Size } from "@/types/contentStudio.types";

export interface ContentZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GeneratorContext {
  ratio: Ratio;
  dimensions: Size;
  palette: ColorPalette;
}

export interface ImageLayoutResult {
  elements: CanvasElement[];
  contentZone: ContentZone;
}

export type ImageLayoutGenerator = (context: GeneratorContext) => ImageLayoutResult;

export type ContentTypeGenerator = (
  context: GeneratorContext,
  contentZone: ContentZone,
  contentData?: any
) => CanvasElement[];

export interface TemplatePreset {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
}
