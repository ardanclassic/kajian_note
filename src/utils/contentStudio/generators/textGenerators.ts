import { v4 as uuidv4 } from "uuid";
import type { CanvasElement } from "@/types/contentStudio.types";
import type { GeneratorContext, GeneratorOptions } from "./types";

// Helper to create basic text element
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

// Helper to create shape
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

export const generateParagraph = (
  ctx: GeneratorContext,
  data: { judul: string; content_text: string },
  options: GeneratorOptions = {}
): CanvasElement[] => {
  const elements: CanvasElement[] = [];
  const { width, height } = ctx.dimensions;
  const padding = width * 0.1;
  const contentWidth = width - padding * 2;

  // Variant A: Minimalist Center (Default)
  // Title
  elements.push(
    createText(data.judul, padding, height * 0.15, contentWidth, 32, {
      fontWeight: 700,
      textAlign: "center",
      fill: ctx.palette.colors.text_dark,
      metadata: { role: "title" },
    })
  );

  // Content
  elements.push(
    createText(data.content_text, padding, height * 0.35, contentWidth, 18, {
      textAlign: "center",
      lineHeight: 1.6,
      fill: ctx.palette.colors.text_dark,
      metadata: { role: "content_text" },
    })
  );

  // Decorative line
  elements.push(createShape("rect", width / 2 - 40, height * 0.28, 80, 4, { fill: ctx.palette.colors.primary }));

  return elements;
};

export const generateContentPoints = (
  ctx: GeneratorContext,
  data: { judul: string; content_points: string[] },
  options: GeneratorOptions = {}
): CanvasElement[] => {
  const elements: CanvasElement[] = [];
  const { width, height } = ctx.dimensions;
  const padding = width * 0.08;
  const contentWidth = width - padding * 2;

  // Title always present but styled differently
  elements.push(
    createText(data.judul, padding, height * 0.1, contentWidth, 36, {
      fontWeight: 700,
      textAlign: "left",
      fill: ctx.palette.colors.text_dark,
      metadata: { role: "title" },
    })
  );

  const startY = height * 0.25;
  const spacing = 60; // Space between points

  data.content_points.slice(0, 7).forEach((point, index) => {
    const yPos = startY + index * spacing;

    // Variant A: Classic Bullets (Simple dots)
    // Bullet
    elements.push(createShape("circle", padding, yPos + 8, 10, 10, { fill: ctx.palette.colors.secondary }));

    // Text
    elements.push(
      createText(
        point.replace(/^[•\s]+/, ""), // Remove existing bullet if any
        padding + 25,
        yPos,
        contentWidth - 25,
        18,
        {
          fill: ctx.palette.colors.text_dark,
          metadata: { role: "content_point", index },
        }
      )
    );
  });

  return elements;
};

export const generateNarrativeWithPoints = (
  ctx: GeneratorContext,
  data: { judul: string; intro_text: string; content_points: string[] },
  options: GeneratorOptions = {}
): CanvasElement[] => {
  const elements: CanvasElement[] = [];
  const { width, height } = ctx.dimensions;
  const padding = width * 0.08;
  const contentWidth = width - padding * 2;

  // Variant A: Split Top/Bottom (High contrast box) (Default)

  // Top Half Background (Title + Intro)
  elements.push(createShape("rect", 0, 0, width, height * 0.4, { fill: ctx.palette.colors.primary }));

  // Title (White on color)
  elements.push(
    createText(data.judul, padding, height * 0.08, contentWidth, 32, {
      fontWeight: 700,
      fill: "#FFFFFF",
      textAlign: "center",
      metadata: { role: "title" },
    })
  );

  // Intro (White on color)
  elements.push(
    createText(data.intro_text, padding, height * 0.18, contentWidth, 18, {
      fill: "#FFFFFF",
      textAlign: "center",
      lineHeight: 1.4,
      metadata: { role: "intro_text" },
    })
  );

  // Points area (Bottom)
  const startY = height * 0.45;
  data.content_points.slice(0, 5).forEach((point, index) => {
    elements.push(
      createText(point, padding, startY + index * 50, contentWidth, 18, {
        fill: ctx.palette.colors.text_dark,
        metadata: { role: "content_point", index },
      })
    );
  });

  return elements;
};
