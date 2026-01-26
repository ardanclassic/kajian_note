// Element Toolbar - Add Text, Image, Shape elements

import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { useEditorStore, DEFAULT_COLOR_PALETTE } from '@/store/contentStudioStore';
import type { TextElement, ShapeElement } from '@/types/contentStudio.types';
import { RATIO_DIMENSIONS } from '@/types/contentStudio.types';
import {
  Type,
  Image,
  Square,
  Circle,
  Triangle,
  Minus,
} from 'lucide-react';
import { useRef } from 'react';
import type { ImageElement } from '@/types/contentStudio.types';
import { cn } from "@/lib/utils";

export function ElementToolbar() {
  const { ratio, addElement } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dimensions = RATIO_DIMENSIONS[ratio];

  const createTextElement = (): TextElement => ({
    id: uuidv4(),
    type: 'text',
    position: { x: dimensions.width / 2 - 80, y: dimensions.height / 2 - 16 },
    size: { width: 160, height: 32 },
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 0,
    scaleX: 1,
    scaleY: 1,
    content: 'Double click to edit',
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: 600,
    fontStyle: 'normal',
    textAlign: 'center',
    lineHeight: 1.4,
    letterSpacing: 0,
    fill: DEFAULT_COLOR_PALETTE.colors.text_dark,
    textDecoration: 'none',
    textTransform: 'none'
  });

  const createHeadingElement = (): TextElement => ({
    id: uuidv4(),
    type: 'text',
    position: { x: dimensions.width / 2 - 120, y: 60 },
    size: { width: 240, height: 48 },
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 0,
    scaleX: 1,
    scaleY: 1,
    content: 'Heading Text',
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: 700,
    fontStyle: 'normal',
    textAlign: 'center',
    lineHeight: 1.2,
    letterSpacing: 0,
    fill: DEFAULT_COLOR_PALETTE.colors.text_dark,
    textDecoration: 'none',
    textTransform: 'none'
  });

  const createShapeElement = (shapeType: 'rect' | 'circle' | 'triangle' | 'line'): ShapeElement => {
    const baseShape = {
      id: uuidv4(),
      type: 'shape' as const,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 0,
      scaleX: 1,
      scaleY: 1,
      shapeType: shapeType as any, // Cast to any to satisfy 'polygon' union mismatch if any
      fill: DEFAULT_COLOR_PALETTE.colors.primary,
      stroke: DEFAULT_COLOR_PALETTE.colors.accent_1,
      strokeWidth: 2,
      cornerRadius: shapeType === 'rect' ? 8 : 0
    };

    // Different sizes for different shapes
    if (shapeType === 'line') {
      return {
        ...baseShape,
        shapeType: 'line', // Explicitly set
        position: { x: dimensions.width / 2 - 60, y: dimensions.height / 2 },
        size: { width: 120, height: 0 },
        fill: 'transparent'
      };
    }

    /* Star logic removed as it's not supported in types */

    return {
      ...baseShape,
      position: { x: dimensions.width / 2 - 50, y: dimensions.height / 2 - 40 },
      size: { width: 100, height: 80 }
    };
  };

  const createImageElement = (src: string, width = 300, height = 200): ImageElement => ({
    id: uuidv4(),
    type: 'image',
    position: {
      x: dimensions.width / 2 - width / 2,
      y: dimensions.height / 2 - height / 2
    },
    size: { width, height },
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 0,
    src,
    scaleX: 1,
    scaleY: 1
  });


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;

      const img = new window.Image();
      img.onload = () => {
        addElement(createImageElement(src, img.naturalWidth, img.naturalHeight));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const tools = [
    {
      icon: Type,
      label: 'Text',
      action: () => addElement(createTextElement())
    },
    {
      icon: Type,
      label: 'Heading',
      action: () => addElement(createHeadingElement()),
      className: 'heading-icon'
    },
    {
      icon: Image,
      label: 'Image',
      action: () => fileInputRef.current?.click()
    },
    {
      icon: Square,
      label: 'Rectangle',
      action: () => addElement(createShapeElement('rect'))
    },
    {
      icon: Circle,
      label: 'Circle',
      action: () => addElement(createShapeElement('circle'))
    },
    {
      icon: Triangle,
      label: 'Triangle',
      action: () => addElement(createShapeElement('triangle'))
    },
    {
      icon: Minus,
      label: 'Line',
      action: () => addElement(createShapeElement('line'))
    }
  ];

  return (
    <div className="px-5 pb-5">
      <div className="grid grid-cols-2 gap-2">
        {tools.map((tool, index) => (
          <motion.button
            key={tool.label + index}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg bg-white/5 border border-white/[0.08] text-white/80 cursor-pointer transition-all hover:bg-blue-500/20 hover:border-blue-500/40 hover:text-white",
              tool.className === 'heading-icon' && "[&_svg]:scale-125"
            )}
            onClick={tool.action}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <tool.icon size={20} />
            <span className="text-[11px] font-medium">{tool.label}</span>
          </motion.button>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
    </div>
  );
}
