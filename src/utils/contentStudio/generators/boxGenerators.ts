
import { v4 as uuidv4 } from 'uuid';
import type { CanvasElement } from '@/types/contentStudio.types';
import type { GeneratorContext, GeneratorOptions } from './types';

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
    type: 'text',
    content: content || "",
    position: { x, y },
    size: { width, height: fontSize * 1.5 },
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 1,
    fontFamily: 'Inter',
    fontSize,
    fontWeight: 400,
    fill: '#000000',
    lineHeight: 1.2,
    letterSpacing: 0,
    ...textOpts,
    fontStyle: (textOpts as any).fontStyle || 'normal',
    textAlign: (textOpts as any).textAlign || 'left',
  } as CanvasElement;
};

const createShape = (
  type: 'rect' | 'circle' | 'triangle' | 'star',
  x: number,
  y: number,
  width: number,
  height: number,
  options: Partial<CanvasElement> = {}
): CanvasElement => {
  const { type: _type, id: _id, ...rest } = options;

  return {
    id: uuidv4(),
    type: 'shape',
    shapeType: type,
    position: { x, y },
    size: { width, height },
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 0,
    fill: '#CCCCCC',
    stroke: 'transparent',
    strokeWidth: 0,
    ...rest
  } as CanvasElement;
};

export const generateDefinitionBox = (
  ctx: GeneratorContext,
  data: { judul: string; term?: string; definition: string; content_text?: string },
  options: GeneratorOptions = { variant: 'A' }
): CanvasElement[] => {
  const elements: CanvasElement[] = [];
  const { width, height } = ctx.dimensions;
  const padding = width * 0.1;
  const contentWidth = width - (padding * 2);

  const term = data.term || data.judul;

  if (options.variant === 'A') {
    // Variant A: Dictionary Style
    const startY = height * 0.25;

    elements.push(createText(
      term,
      padding,
      startY,
      contentWidth,
      48,
      { fontFamily: 'Georgia', fontWeight: 700, fill: ctx.palette.colors.text_dark, metadata: { role: 'term' } }
    ));

     elements.push(createText(
      "noun",
      padding,
      startY + 60,
      contentWidth,
      18,
      { fontFamily: 'Georgia', fontStyle: 'italic', fill: ctx.palette.colors.secondary }
    ));

    // Divider
    elements.push(createShape(
      'rect',
      padding,
      startY + 90,
      contentWidth,
      2,
      { fill: ctx.palette.colors.text_dark, opacity: 0.2 }
    ));

    elements.push(createText(
      data.definition,
      padding,
      startY + 110,
      contentWidth,
      24,
      { fontFamily: 'Georgia', lineHeight: 1.6, fill: ctx.palette.colors.text_dark, metadata: { role: 'definition' } }
    ));

  } else {
    // Variant B: Modern Quote
    const startY = height * 0.2;
    
    // Quote Icon
    elements.push(createText(
      "“",
      padding - 20,
      startY,
      100,
      120,
      { fontFamily: 'Georgia', fill: ctx.palette.colors.accent_1, opacity: 0.3 }
    ));

    elements.push(createText(
      term,
      padding + 20,
      startY + 40,
      contentWidth - 20,
      32,
      { fontWeight: 800, fill: ctx.palette.colors.primary, metadata: { role: 'term' } }
    ));

    // Box
    elements.push(createShape(
      'rect',
      padding,
      startY + 100,
      contentWidth,
      height * 0.4,
      { 
         fill: 'transparent', 
         stroke: ctx.palette.colors.primary, 
         strokeWidth: 4,
         cornerRadius: 0
      }
    ));

    elements.push(createText(
      data.definition,
      padding + 20,
      startY + 130,
      contentWidth - 40,
      22,
      { fontWeight: 500, lineHeight: 1.5, fill: ctx.palette.colors.text_dark, metadata: { role: 'definition' } }
    ));
  }

  return elements;
};

export const generateChecklist = (
  ctx: GeneratorContext,
  data: { judul: string; checklist_items: any[] },
  options: GeneratorOptions = { variant: 'A' }
): CanvasElement[] => {
  const elements: CanvasElement[] = [];
  const { width, height } = ctx.dimensions;
  const padding = width * 0.08;
  const contentWidth = width - (padding * 2);

  // Parse items (handle nested categories or flat strings)
  let flatItems: string[] = [];
  if (data.checklist_items && data.checklist_items.length > 0) {
      if (typeof data.checklist_items[0] === 'string') {
          flatItems = data.checklist_items;
      } else {
          // Flatten categories
          flatItems = data.checklist_items.flatMap(c => 
             Array.isArray(c.items) ? c.items : [c.items || c]
          );
      }
  }

  elements.push(createText(
    data.judul,
    padding,
    height * 0.1,
    contentWidth,
    32,
    { fontWeight: 700, textAlign: 'center', fill: ctx.palette.colors.text_dark, metadata: { role: 'title' } }
  ));

  const startY = height * 0.2;
  const itemHeight = 60;

  if (options.variant === 'A') {
    // Variant A: Paper Checklist
    // Background paper texture simulation? Just white/yellow box
    elements.push(createShape(
      'rect',
      padding - 10,
      startY - 20,
      contentWidth + 20,
      (flatItems.slice(0, 8).length * itemHeight) + 40,
      { fill: '#FEF9C3', stroke: '#E5E7EB', strokeWidth: 1, cornerRadius: 2 }
    ));

    flatItems.slice(0, 8).forEach((item, index) => {
      const y = startY + (index * itemHeight);

      // Checkbox square
      elements.push(createShape(
        'rect',
        padding + 10,
        y + 5,
        24,
        24,
        { fill: '#FFFFFF', stroke: '#000000', strokeWidth: 2, cornerRadius: 4 }
      ));

      // Line
      elements.push(createText(
        item.replace(/[□\[\]]/g, '').trim(),
        padding + 50,
        y + 5,
        contentWidth - 60,
        18,
        { fill: '#000000', fontFamily: 'Courier New', metadata: { role: 'checklist_item', index } }
      ));
    });

  } else {
    // Variant B: Digital Progress
    // Progress Bar
    elements.push(createShape(
      'rect',
      padding, startY - 20, contentWidth, 8,
      { fill: '#E5E7EB', cornerRadius: 4 }
    ));
    // 30% filled
    elements.push(createShape(
      'rect',
      padding, startY - 20, contentWidth * 0.3, 8,
      { fill: ctx.palette.colors.primary, cornerRadius: 4 }
    ));

    flatItems.slice(0, 8).forEach((item, index) => {
      const y = startY + 20 + (index * itemHeight);

      // Toggle Switch track
      elements.push(createShape(
        'rect',
        padding,
        y + 8,
        40,
        20,
        { fill: ctx.palette.colors.secondary, cornerRadius: 10 }
      ));
      // Toggle circle
      elements.push(createShape(
        'circle',
        padding + 22,
        y + 10,
        16,
        16,
        { fill: '#FFFFFF' }
      ));

      elements.push(createText(
        item.replace(/[□\[\]]/g, '').trim(),
        padding + 60,
        y + 6,
        contentWidth - 70,
        18,
        { fill: ctx.palette.colors.text_dark, fontWeight: 500, metadata: { role: 'checklist_item', index } }
      ));
    });
  }

  return elements;
};
