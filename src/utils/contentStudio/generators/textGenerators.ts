
import { v4 as uuidv4 } from 'uuid';
import type { CanvasElement } from '@/types/contentStudio.types';
import type { GeneratorContext, GeneratorOptions } from './types';

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

// Helper to create shape
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

export const generateParagraph = (
  ctx: GeneratorContext,
  data: { judul: string; content_text: string },
  options: GeneratorOptions = { variant: 'A' }
): CanvasElement[] => {
  const elements: CanvasElement[] = [];
  const { width, height } = ctx.dimensions;
  const padding = width * 0.1;
  const contentWidth = width - (padding * 2);

  if (options.variant === 'A') {
    // Variant A: Minimalist Center
    // Title
    elements.push(createText(
      data.judul,
      padding,
      height * 0.15,
      contentWidth,
      32,
      { 
        fontWeight: 700, 
        textAlign: 'center', 
        fill: ctx.palette.colors.text_dark,
        metadata: { role: 'title' }
      }
    ));

    // Content
    elements.push(createText(
      data.content_text,
      padding,
      height * 0.35,
      contentWidth,
      18,
      { 
        textAlign: 'center', 
        lineHeight: 1.6,
        fill: ctx.palette.colors.text_dark,
        metadata: { role: 'content_text' }
      }
    ));
    
    // Decorative line
    elements.push(createShape(
      'rect',
      width / 2 - 40,
      height * 0.28,
      80,
      4,
      { fill: ctx.palette.colors.primary }
    ));

  } else {
    // Variant B: Editorial Left
    // Accent Line
    elements.push(createShape(
      'rect',
      padding,
      height * 0.15,
      8,
      height * 0.7,
      { fill: ctx.palette.colors.accent_1 }
    ));

    const leftOffset = padding + 25;
    const adjustWidth = contentWidth - 25;

    // Title
    elements.push(createText(
      data.judul,
      leftOffset,
      height * 0.15,
      adjustWidth,
      42,
      { 
        fontWeight: 800, 
        textAlign: 'left', 
        fill: ctx.palette.colors.text_dark,
        lineHeight: 1.1,
        metadata: { role: 'title' }
      }
    ));

    // Content
    elements.push(createText(
      data.content_text,
      leftOffset,
      height * 0.35,
      adjustWidth,
      20,
      { 
        textAlign: 'left', 
        lineHeight: 1.5,
        fill: ctx.palette.colors.primary, // Using primary for editorial feel
        metadata: { role: 'content_text' }
      }
    ));
  }

  return elements;
};

export const generateContentPoints = (
  ctx: GeneratorContext,
  data: { judul: string; content_points: string[] },
  options: GeneratorOptions = { variant: 'A' }
): CanvasElement[] => {
  const elements: CanvasElement[] = [];
  const { width, height } = ctx.dimensions;
  const padding = width * 0.08;
  const contentWidth = width - (padding * 2);

  // Title always present but styled differently
  elements.push(createText(
    data.judul,
    padding,
    height * 0.1,
    contentWidth,
    36,
    { 
      fontWeight: 700, 
      textAlign: options.variant === 'A' ? 'left' : 'center',
      fill: ctx.palette.colors.text_dark,
      metadata: { role: 'title' }
    }
  ));

  const startY = height * 0.25;
  const spacing = 60; // Space between points

  data.content_points.slice(0, 7).forEach((point, index) => {
    const yPos = startY + (index * spacing);

    if (options.variant === 'A') {
      // Variant A: Classic Bullets (Simple dots)
      // Bullet
      elements.push(createShape(
        'circle',
        padding,
        yPos + 8,
        10,
        10,
        { fill: ctx.palette.colors.secondary }
      ));
      
      // Text
      elements.push(createText(
        point.replace(/^[•\s]+/, ''), // Remove existing bullet if any
        padding + 25,
        yPos,
        contentWidth - 25,
        18,
        { 
          fill: ctx.palette.colors.text_dark,
          metadata: { role: 'content_point', index }
        }
      ));
    } else {
      // Variant B: Icon List (Cards/Boxes)
      // Background strip for item
      elements.push(createShape(
        'rect',
        padding,
        yPos - 5,
        contentWidth,
        50,
        { 
          fill: ctx.palette.colors.background === '#FFFFFF' ? '#F3F4F6' : '#FFFFFF20', // Subtle contrast
          cornerRadius: 8
        }
      ));

      // Icon placeholder (check)
      elements.push(createText(
        "✅",
        padding + 10,
        yPos + 5,
        30,
        20,
        { textAlign: 'center', metadata: { role: 'icon', index } }
      ));

      // Text
      elements.push(createText(
        point.replace(/^[•\s]+/, ''),
        padding + 50,
        yPos + 8,
        contentWidth - 60,
        18,
        { 
          fill: ctx.palette.colors.text_dark,
          fontWeight: 500,
          metadata: { role: 'content_point', index } 
        }
      ));
    }
  });

  return elements;
};

export const generateNarrativeWithPoints = (
  ctx: GeneratorContext,
  data: { judul: string; intro_text: string; content_points: string[] },
  options: GeneratorOptions = { variant: 'A' }
): CanvasElement[] => {
  const elements: CanvasElement[] = [];
  const { width, height } = ctx.dimensions;
  const padding = width * 0.08;
  const contentWidth = width - (padding * 2);

  if (options.variant === 'A') {
    // Variant A: Split Top/Bottom (High contrast box)
    
    // Top Half Background (Title + Intro)
    elements.push(createShape(
      'rect',
      0, 0, width, height * 0.4,
      { fill: ctx.palette.colors.primary }
    ));

    // Title (White on color)
    elements.push(createText(
      data.judul,
      padding,
      height * 0.08,
      contentWidth,
      32,
      { 
        fontWeight: 700, 
        fill: '#FFFFFF',
        textAlign: 'center',
        metadata: { role: 'title' }
      }
    ));

    // Intro (White on color)
    elements.push(createText(
      data.intro_text,
      padding,
      height * 0.18,
      contentWidth,
      18,
      { 
        fill: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 1.4,
        metadata: { role: 'intro_text' }
      }
    ));

    // Points area (Bottom)
    const startY = height * 0.45;
    data.content_points.slice(0, 5).forEach((point, index) => {
      elements.push(createText(
        point,
        padding,
        startY + (index * 50),
        contentWidth,
        18,
        { 
          fill: ctx.palette.colors.text_dark,
          metadata: { role: 'content_point', index }
        }
      ));
    });

  } else {
    // Variant B: Integrated Flow (Continuous, clean)
    
    // Title
    elements.push(createText(
      data.judul,
      padding,
      height * 0.1,
      contentWidth,
      36,
      { 
        fontWeight: 700, 
        fill: ctx.palette.colors.text_dark,
        metadata: { role: 'title' }
      }
    ));

    // Intro text
    elements.push(createText(
      data.intro_text,
      padding,
      height * 0.22,
      contentWidth,
      18,
      { 
        fill: ctx.palette.colors.text_dark,
        metadata: { role: 'intro_text' }
      }
    ));

    // Divider
    elements.push(createShape(
      'rect',
      padding,
      height * 0.35,
      50,
      3,
      { fill: ctx.palette.colors.accent_1 }
    ));

    // Points
    const startY = height * 0.4;
    data.content_points.slice(0, 5).forEach((point, index) => {
      // Small dash
      elements.push(createShape(
        'rect',
        padding,
        startY + (index * 60) + 12,
        10,
        2,
        { fill: ctx.palette.colors.secondary }
      ));
      
      elements.push(createText(
        point.replace(/^[•\s]+/, ''),
        padding + 20,
        startY + (index * 60),
        contentWidth - 20,
        18,
        { 
          fill: ctx.palette.colors.text_dark,
          metadata: { role: 'content_point', index }
        }
      ));
    });
  }

  return elements;
};
