import { v4 as uuidv4 } from "uuid";
import type { Slide, CanvasElement, Blueprint } from "@/types/contentStudio.types";
import { RATIO_DIMENSIONS } from "@/types/contentStudio.types";
import type { ParseBlueprintOptions } from "./types";
import { generateCoverSlide, generateContentSlide, generateSplitSlide } from "./generators";

export { adjustSlideLayout } from "./layout-adjustment";
export * from "./types";

export function parseBlueprint({ blueprint, ratio: ratioOverride }: ParseBlueprintOptions): Slide[] {
  const ratio = ratioOverride || blueprint.metadata?.aspect_ratio || "4:5";
  const dims = RATIO_DIMENSIONS[ratio];

  if (!dims) throw new Error(`Unsupported ratio: ${ratio}`);

  return blueprint.slides.map((slideData) => {
    let els: CanvasElement[] = [];

    if ((slideData.layout as any)?.type === "split") {
      els = generateSplitSlide(slideData, blueprint, dims);
    } else if (slideData.type === "cover") {
      els = generateCoverSlide(slideData, blueprint, dims);
    } else {
      els = generateContentSlide(slideData, blueprint, dims);
    }

    // Handle partial originalContent for title fallback
    const title =
      slideData.type === "cover" ? (slideData.content as any)?.title : (slideData.content as any)?.slide_title;

    return {
      id: uuidv4(),
      elements: els,
      backgroundColor: slideData.design_override?.background_color || blueprint.design?.background_color || "#FFFFFF",
      originalContent: slideData,
      title: title || "Untitled Slide",
    };
  });
}

export function validateBlueprint(json: unknown): json is Blueprint {
  if (!json || typeof json !== "object") return false;
  const bp = json as any;
  // Lenient validation: minimal requirement is slides array
  return !!Array.isArray(bp.slides);
}
