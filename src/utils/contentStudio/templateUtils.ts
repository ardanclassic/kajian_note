import type { CanvasElement, ColorPalette, Ratio, Size, TextElement } from "@/types/contentStudio.types";
import { RATIO_DIMENSIONS } from "@/types/contentStudio.types";
import { imageLayouts } from "./templates/imageLayouts";
import { contentTypes } from "./templates/contentTypes";
import type { GeneratorContext, ImageLayoutGenerator, ContentTypeGenerator } from "./templates/types";

interface CompositionOptions {
  contentTypeId: string;
  imageLayoutId: string;
  ratio: Ratio;
  palette: ColorPalette;
  contentData?: any;
}

export function extractContentFromSlide(elements: CanvasElement[]): any {
  const data: any = {};

  // 1. Try to extract from metadata
  const titleEl = elements.find((el) => el.type === "text" && el.metadata?.role === "title") as TextElement;
  if (titleEl) data.judul = titleEl.content;

  // Subtitle (for cover slides)
  const subtitleEl = elements.find((el) => el.type === "text" && el.metadata?.role === "subtitle") as TextElement;
  if (subtitleEl) data.subjudul = subtitleEl.content;

  const contentTextEl = elements.find(
    (el) => el.type === "text" && el.metadata?.role === "content_text"
  ) as TextElement;
  if (contentTextEl) data.content_text = contentTextEl.content;

  const introTextEl = elements.find((el) => el.type === "text" && el.metadata?.role === "intro_text") as TextElement;
  if (introTextEl) data.intro_text = introTextEl.content;

  // Content Points
  const pointEls = elements.filter(
    (el) => el.type === "text" && el.metadata?.role === "content_point"
  ) as TextElement[];
  if (pointEls.length > 0) {
    data.content_points = pointEls
      .sort((a, b) => (a.metadata?.index || 0) - (b.metadata?.index || 0))
      .map((el) => el.content);
  }

  // Checklist Items
  const checklistEls = elements.filter(
    (el) => el.type === "text" && el.metadata?.role === "checklist_item"
  ) as TextElement[];
  if (checklistEls.length > 0) {
    data.checklist_items = checklistEls
      .sort((a, b) => (a.metadata?.index || 0) - (b.metadata?.index || 0))
      .map((el) => el.content);
  }

  // Stages (Sequential Process)
  const stageTitles = elements.filter(
    (el) => el.type === "text" && el.metadata?.role === "stage_title"
  ) as TextElement[];
  if (stageTitles.length > 0) {
    data.stages = stageTitles
      .sort((a, b) => (a.metadata?.index || 0) - (b.metadata?.index || 0))
      .map((titleEl) => {
        const index = titleEl.metadata?.index;
        const descEl = elements.find(
          (el) => el.type === "text" && el.metadata?.role === "stage_desc" && el.metadata?.index === index
        ) as TextElement;
        return {
          stage: titleEl.content,
          description: descEl ? descEl.content : "",
        };
      });
  }

  // Items (Infographic Style)
  const itemTitles = elements.filter((el) => el.type === "text" && el.metadata?.role === "item_title") as TextElement[];
  if (itemTitles.length > 0) {
    data.items = itemTitles
      .sort((a, b) => (a.metadata?.index || 0) - (b.metadata?.index || 0))
      .map((titleEl) => {
        const index = titleEl.metadata?.index;
        const descEl = elements.find(
          (el) => el.type === "text" && el.metadata?.role === "item_desc" && el.metadata?.index === index
        ) as TextElement;
        return {
          title: titleEl.content,
          description: descEl ? descEl.content : "",
        };
      });
  }

  // Breakdown Sections (Detailed Breakdown)
  const sectionTitles = elements.filter(
    (el) => el.type === "text" && el.metadata?.role === "section_title"
  ) as TextElement[];
  if (sectionTitles.length > 0) {
    data.breakdown_sections = sectionTitles
      .sort((a, b) => (a.metadata?.index || 0) - (b.metadata?.index || 0))
      .map((titleEl) => {
        const sIdx = titleEl.metadata?.index;
        const itemEls = elements.filter(
          (el) => el.type === "text" && el.metadata?.role === "section_item" && el.metadata?.sectionIndex === sIdx
        ) as TextElement[];
        return {
          subtitle: titleEl.content,
          items: itemEls.map((el) => el.content),
        };
      });
  }

  // Myth/Fact
  const mythEl = elements.find((el) => el.type === "text" && el.metadata?.role === "myth_content") as TextElement;
  if (mythEl) data.myth = mythEl.content;
  const factEl = elements.find((el) => el.type === "text" && el.metadata?.role === "fact_content") as TextElement;
  if (factEl) data.fact = factEl.content;

  // Definition
  const termEl = elements.find((el) => el.type === "text" && el.metadata?.role === "term") as TextElement;
  if (termEl) data.term = termEl.content;
  const defEl = elements.find((el) => el.type === "text" && el.metadata?.role === "definition") as TextElement;
  if (defEl) data.definition = defEl.content;

  // Main point (Detailed Breakdown)
  const mainPointEl = elements.find((el) => el.type === "text" && el.metadata?.role === "main_point") as TextElement;
  if (mainPointEl) data.main_point = mainPointEl.content;

  // Misconception
  const miscEl = elements.find(
    (el) => el.type === "text" && el.metadata?.role === "misconception_content"
  ) as TextElement;
  if (miscEl) data.misconception = miscEl.content;
  const clarEl = elements.find(
    (el) => el.type === "text" && el.metadata?.role === "clarification_content"
  ) as TextElement;
  if (clarEl) data.clarification = clarEl.content;

  // --- CROSS-POPULATION / FALLBACKS ---
  // Ensure data is available in multiple formats for template switching

  // 1. Populate content_points from various sources
  if (!data.content_points) {
    if (data.checklist_items) data.content_points = [...data.checklist_items];
    else if (data.stages) data.content_points = data.stages.map((s: any) => `${s.stage}: ${s.description}`);
    else if (data.items) data.content_points = data.items.map((i: any) => `${i.title}: ${i.description}`);
    else if (data.breakdown_sections) {
      data.content_points = data.breakdown_sections.flatMap((s: any) => [s.subtitle, ...s.items]);
    } else if (data.content_text)
      data.content_points = data.content_text.split(". ").filter((s: string) => s.length > 5);
  }

  // 2. Populate stages from content_points (for sequential_process)
  if (!data.stages && data.content_points) {
    data.stages = data.content_points.map((point: string, idx: number) => {
      // Try to parse "Stage: Description" format, otherwise use as stage name
      const colonIndex = point.indexOf(":");
      if (colonIndex > 0 && colonIndex < 30) {
        return {
          stage: point.substring(0, colonIndex).trim(),
          description: point.substring(colonIndex + 1).trim(),
        };
      }
      return { stage: `Step ${idx + 1}`, description: point };
    });
  }

  // 3. Populate items from content_points (for infographic_style)
  if (!data.items && data.content_points) {
    data.items = data.content_points.map((point: string, idx: number) => {
      const colonIndex = point.indexOf(":");
      if (colonIndex > 0 && colonIndex < 30) {
        return {
          title: point.substring(0, colonIndex).trim(),
          description: point.substring(colonIndex + 1).trim(),
        };
      }
      return { title: `Item ${idx + 1}`, description: point };
    });
  }

  // 4. Populate checklist_items from content_points
  if (!data.checklist_items && data.content_points) {
    data.checklist_items = [...data.content_points];
  }

  // 5. Populate breakdown_sections from content_points (for detailed_breakdown)
  if (!data.breakdown_sections && data.content_points) {
    // Group points into sections - every 3 points becomes a section
    const sections = [];
    for (let i = 0; i < data.content_points.length; i += 3) {
      sections.push({
        subtitle: `Section ${Math.floor(i / 3) + 1}`,
        items: data.content_points.slice(i, i + 3),
      });
    }
    data.breakdown_sections = sections;
  }

  // 6. Populate content_text from content_points
  if (!data.content_text && data.content_points) {
    data.content_text = data.content_points.join(". ");
  }

  // Generic fallback if no metadata found (for migrated legacy slides)
  if (!data.judul) {
    // Assume text with largest font size is title
    const textElements = elements.filter((el) => el.type === "text") as TextElement[];
    if (textElements.length > 0) {
      const sorted = [...textElements].sort((a, b) => b.fontSize - a.fontSize);
      data.judul = sorted[0].content;

      // Second largest might be content_text or subtitle
      if (sorted.length > 1 && !data.content_text && !data.subjudul) {
        data.content_text = sorted[1].content;
      }
    }
  }

  return data;
}

export function composeTemplate(options: CompositionOptions): CanvasElement[] {
  const { contentTypeId, imageLayoutId, ratio, palette, contentData } = options;

  const dimensions: Size = RATIO_DIMENSIONS[ratio];

  const context: GeneratorContext = {
    ratio,
    dimensions,
    palette,
  };

  // 1. Generate Image Layout
  const layoutGenerator: ImageLayoutGenerator = imageLayouts[imageLayoutId] || imageLayouts["header_illustration"];
  const layoutResult = layoutGenerator(context);

  // 2. Generate Content
  const contentGenerator: ContentTypeGenerator = contentTypes[contentTypeId] || contentTypes["paragraph"];
  const contentElements = contentGenerator(context, layoutResult.contentZone, contentData);

  // 3. Combine
  // Ensure content elements are above layout elements (unless layout specifies zIndex)
  // We'll rely on the generators setting zIndex appropriately, or normalize here.

  return [...layoutResult.elements, ...contentElements];
}

export function getAvailableContentTypes() {
  return Object.keys(contentTypes).map((id) => ({
    id,
    label: id
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
  }));
}

export function getAvailableImageLayouts() {
  return Object.keys(imageLayouts).map((id) => ({
    id,
    label: id
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
  }));
}
