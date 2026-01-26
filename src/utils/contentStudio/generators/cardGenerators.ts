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

export const generateInfographicStyle = (
  ctx: GeneratorContext,
  data: { judul: string; items: { title: string; description: string; icon?: string }[] },
  options: GeneratorOptions = {}
): CanvasElement[] => {
  const elements: CanvasElement[] = [];
  const { width, height } = ctx.dimensions;
  const padding = width * 0.08;
  const contentWidth = width - padding * 2;

  elements.push(
    createText(data.judul, padding, height * 0.08, contentWidth, 30, {
      fontWeight: 700,
      fill: ctx.palette.colors.text_dark,
      textAlign: "center",
      metadata: { role: "title" },
    })
  );

  const startY = height * 0.2;

  // Variant A: Grid System (2 cols) (Default)
  const colWidth = contentWidth / 2 - 10;
  const rowHeight = 140;

  data.items.slice(0, 6).forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);

    const x = padding + col * (colWidth + 20);
    const y = startY + row * rowHeight;

    // Card BG
    elements.push(createShape("rect", x, y, colWidth, rowHeight - 15, { fill: "#F3F4F6", cornerRadius: 8 }));

    // Icon Circle
    elements.push(createShape("circle", x + colWidth / 2 - 20, y + 15, 40, 40, { fill: ctx.palette.colors.primary }));

    // Icon Text (Emoji placeholder usually)
    if (item.icon) {
      // In real app we might map icon string to actual icon
    }

    // Title
    elements.push(
      createText(item.title, x + 5, y + 60, colWidth - 10, 14, {
        fontWeight: 700,
        textAlign: "center",
        fill: ctx.palette.colors.text_dark,
        metadata: { role: "item_title", index },
      })
    );

    // Desc
    elements.push(
      createText(item.description, x + 5, y + 85, colWidth - 10, 12, {
        textAlign: "center",
        fill: ctx.palette.colors.text_dark,
        opacity: 0.8,
        metadata: { role: "item_desc", index },
      })
    );
  });

  return elements;
};

export const generateMythVsFact = (
  ctx: GeneratorContext,
  data: { judul: string; items: { myth: string; fact: string; explanation?: string }[] },
  options: GeneratorOptions = {}
): CanvasElement[] => {
  const elements: CanvasElement[] = [];
  const { width, height } = ctx.dimensions;
  const padding = width * 0.08;
  const contentWidth = width - padding * 2;

  elements.push(
    createText(data.judul, padding, height * 0.08, contentWidth, 30, {
      fontWeight: 700,
      fill: ctx.palette.colors.text_dark,
      textAlign: "center",
      metadata: { role: "title" },
    })
  );

  // Only take first item for clarity usually, or stack 2
  const item = data.items[0];
  if (!item) return elements;

  const startY = height * 0.2;
  const boxHeight = height * 0.25;

  // Variant A: Split Comparison (Red vs Green) (Default)

  // MYTH BOX
  elements.push(
    createShape("rect", padding, startY, contentWidth, boxHeight, {
      fill: "#FFEAEA",
      stroke: "#FF4444",
      strokeWidth: 2,
      cornerRadius: 10,
    })
  );

  elements.push(
    createText("❌ MYTH", padding + 20, startY + 15, contentWidth - 40, 14, { fontWeight: 800, fill: "#FF4444" })
  );

  elements.push(
    createText(item.myth.replace("❌", ""), padding + 20, startY + 40, contentWidth - 40, 18, {
      fontWeight: 600,
      fill: "#991B1B",
      metadata: { role: "myth_content" },
    })
  );

  // FACT BOX
  const factY = startY + boxHeight + 20;
  elements.push(
    createShape("rect", padding, factY, contentWidth, boxHeight, {
      fill: "#EAFFEA",
      stroke: "#22C55E",
      strokeWidth: 2,
      cornerRadius: 10,
    })
  );

  elements.push(
    createText("✅ FACT", padding + 20, factY + 15, contentWidth - 40, 14, { fontWeight: 800, fill: "#22C55E" })
  );

  elements.push(
    createText(item.fact.replace("✅", ""), padding + 20, factY + 40, contentWidth - 40, 18, {
      fontWeight: 600,
      fill: "#166534",
      metadata: { role: "fact_content" },
    })
  );

  return elements;
};

export const generateMisconceptionClarification = (
  ctx: GeneratorContext,
  data: { judul: string; misconception_section: { wrong: string; right: string; title: string; example?: string } },
  options: GeneratorOptions = {}
): CanvasElement[] => {
  return generateMythVsFact(
    ctx,
    {
      judul: data.judul,
      items: [
        {
          myth: data.misconception_section.wrong,
          fact: data.misconception_section.right,
          explanation: data.misconception_section.example,
        },
      ],
    },
    options
  );
};
