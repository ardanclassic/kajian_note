import { v4 as uuidv4 } from "uuid";
import type { CanvasElement } from "@/types/contentStudio.types";
import type { GeneratorContext, GeneratorOptions } from "./types";

const createText = (
  content: string,
  x: number,
  y: number,
  width: number,
  fontSize: number,
  options: Partial<CanvasElement> = {}
): CanvasElement => {
  const { type: _type, id: _id, ...rest } = options;
  const textOpts = rest as Partial<CanvasElement>;

  return {
    id: uuidv4(),
    type: "text",
    content: content || "",
    position: { x, y },
    size: { width, height: fontSize * 1.5 },
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 1,
    fontFamily: "Inter",
    fontSize,
    fontWeight: 400,
    fill: "#000000",
    lineHeight: 1.2,
    letterSpacing: 0,
    ...textOpts,
    fontStyle: (textOpts as any).fontStyle || "normal",
    textAlign: (textOpts as any).textAlign || "left",
  } as CanvasElement;
};

const createShape = (
  type: "rect" | "circle" | "triangle" | "star",
  x: number,
  y: number,
  width: number,
  height: number,
  options: Partial<CanvasElement> = {}
): CanvasElement => {
  const { type: _type, id: _id, ...rest } = options;

  return {
    id: uuidv4(),
    type: "shape",
    shapeType: type,
    position: { x, y },
    size: { width, height },
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 0,
    fill: "#CCCCCC",
    stroke: "transparent",
    strokeWidth: 0,
    ...rest,
  } as CanvasElement;
};

export const generateSequentialProcess = (
  ctx: GeneratorContext,
  data: { judul: string; stages: { stage: string; description: string }[] },
  options: GeneratorOptions = {}
): CanvasElement[] => {
  const elements: CanvasElement[] = [];
  const { width, height } = ctx.dimensions;
  const padding = width * 0.08;
  const contentWidth = width - padding * 2;

  // Title
  elements.push(
    createText(data.judul, padding, height * 0.08, contentWidth, 32, {
      fontWeight: 700,
      fill: ctx.palette.colors.text_dark,
      metadata: { role: "title" },
    })
  );

  const startY = height * 0.22;
  const itemHeight = 100;

  // Variant A: Vertical Timeline (Default)
  // Vertical line
  const lineX = padding + 15;
  const lineLength = Math.min(data.stages.length, 5) * itemHeight - 20;

  elements.push(createShape("rect", lineX, startY, 4, lineLength, { fill: ctx.palette.colors.secondary }));

  data.stages.slice(0, 5).forEach((item, index) => {
    const yPos = startY + index * itemHeight;

    // Dot
    elements.push(
      createShape("circle", lineX - 8, yPos, 20, 20, {
        fill: ctx.palette.colors.primary,
        stroke: "#FFFFFF",
        strokeWidth: 2,
      })
    );

    // Stage Title
    elements.push(
      createText(item.stage, padding + 40, yPos - 5, contentWidth - 40, 18, {
        fontWeight: 700,
        fill: ctx.palette.colors.text_dark,
        metadata: { role: "stage_title", index },
      })
    );

    // Stage Desc
    elements.push(
      createText(item.description, padding + 40, yPos + 25, contentWidth - 40, 14, {
        fill: ctx.palette.colors.text_dark,
        opacity: 0.8,
        metadata: { role: "stage_desc", index },
      })
    );
  });

  return elements;
};

export const generateDetailedBreakdown = (
  ctx: GeneratorContext,
  data: { judul: string; main_point: string; breakdown_sections: { subtitle: string; items: string[] }[] },
  options: GeneratorOptions = {}
): CanvasElement[] => {
  const elements: CanvasElement[] = [];
  const { width, height } = ctx.dimensions;
  const padding = width * 0.08;
  const contentWidth = width - padding * 2;

  elements.push(
    createText(data.judul, padding, height * 0.08, contentWidth, 32, {
      fontWeight: 700,
      fill: ctx.palette.colors.text_dark,
      metadata: { role: "title" },
    })
  );

  elements.push(
    createText(data.main_point, padding, height * 0.18, contentWidth, 18, {
      fontStyle: "italic",
      fill: ctx.palette.colors.primary,
      metadata: { role: "main_point" },
    })
  );

  const startY = height * 0.3;

  // Variant A: Accordion Style (Stacked) (Default)
  let currentY = startY;

  data.breakdown_sections.slice(0, 3).forEach((section, index) => {
    // Header Bar
    elements.push(
      createShape("rect", padding, currentY, contentWidth, 35, { fill: ctx.palette.colors.secondary, cornerRadius: 6 })
    );

    elements.push(
      createText(section.subtitle, padding + 15, currentY + 5, contentWidth - 30, 18, {
        fontWeight: 600,
        fill: "#FFFFFF",
        metadata: { role: "section_title", index },
      })
    );

    currentY += 45;

    // Items
    section.items.forEach((item, i) => {
      elements.push(
        createText(`• ${item.replace(/^[•\s]+/, "")}`, padding + 10, currentY, contentWidth - 10, 16, {
          fill: ctx.palette.colors.text_dark,
          metadata: { role: "section_item", sectionIndex: index, itemIndex: i },
        })
      );
      currentY += 30;
    });

    currentY += 20; // Spacer
  });

  return elements;
};
