import type { CanvasElement, Ratio, ColorPalette } from "@/types/contentStudio.types";

export interface GeneratorContext {
  ratio: Ratio;
  palette: ColorPalette;
  dimensions: { width: number; height: number };
}

export interface GeneratorOptions {
  // Empty for now, simplified
}

export type ContentGenerator = (context: GeneratorContext, data: any, options?: GeneratorOptions) => CanvasElement[];

export function getDimensions(ratio: Ratio) {
  const dimensions: Record<Ratio, { width: number; height: number }> = {
    "4:5": { width: 540, height: 675 },
    "9:16": { width: 405, height: 720 },
    "3:4": { width: 540, height: 720 },
  };
  return dimensions[ratio];
}
