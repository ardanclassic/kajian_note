// Element Inspector - Edit properties of selected element

import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useEditorStore } from '@/store/contentStudioStore';
import type { TextElement, ShapeElement, ImageElement, CanvasElement } from '@/types/contentStudio.types';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Copy,
  Upload
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from "@/lib/utils";

const FONT_FAMILIES = [
  'Inter',
  'Nunito',
  'Poppins',
  'Montserrat',
  'Roboto',
  'Open Sans',
  'Lato',
  'Playfair Display',
  'Merriweather',
  'Raleway'
];

export function ElementInspector() {
  const {
    slides,
    currentSlideIndex,
    selectedElementId,
    updateElement,
    removeElement,
    addElement,
    reorderElements,
    pushToHistory
  } = useEditorStore();

  const currentSlide = slides[currentSlideIndex];
  const selectedElement = currentSlide?.elements.find(el => el.id === selectedElementId);

  if (!selectedElement) {
    return (
      <div className="p-3 flex items-center justify-center min-h-[100px]">
        <div className="text-center text-white/40 text-[13px] p-2.5">
          <p>Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  const updateProp = <K extends keyof CanvasElement>(
    key: K,
    value: CanvasElement[K],
    pushHistory: boolean = true
  ) => {
    updateElement(selectedElementId!, { [key]: value } as Partial<CanvasElement>, pushHistory);
  };

  const duplicateElement = () => {
    const newElement = {
      ...selectedElement,
      id: uuidv4(),
      position: {
        x: selectedElement.position.x + 20,
        y: selectedElement.position.y + 20
      }
    };
    addElement(newElement);
  };

  const buttonBaseClass = "flex items-center justify-center w-6 h-6 bg-white/5 border-none rounded text-white/70 cursor-pointer transition-all hover:bg-white/15 hover:text-white";

  return (
    <motion.div
      className="p-3 px-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
        <h3 className="text-sm font-semibold text-white m-0">
          {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)}
        </h3>
        <div className="flex gap-1">
          <button onClick={() => updateProp('locked', !selectedElement.locked)} title="Lock/Unlock" className={buttonBaseClass}>
            {selectedElement.locked ? <Lock size={16} /> : <Unlock size={16} />}
          </button>
          <button onClick={() => updateProp('visible', !selectedElement.visible)} title="Show/Hide" className={buttonBaseClass}>
            {selectedElement.visible ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button onClick={duplicateElement} title="Duplicate" className={buttonBaseClass}>
            <Copy size={16} />
          </button>
          <button
            onClick={() => removeElement(selectedElementId!)}
            className={cn(buttonBaseClass, "hover:bg-red-500/20 hover:text-red-500")}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Layer Order */}
      <div className="mb-3">
        <label className="block text-[10px] font-semibold uppercase tracking-[0.5px] text-white/50 mb-1.5">Layer Order</label>
        <div className="flex gap-1">
          <button onClick={() => reorderElements(selectedElementId!, 'top')} title="Bring to Front" className="flex-1 flex items-center justify-center p-1.5 bg-white/5 border border-white/10 rounded text-white/70 cursor-pointer transition-all hover:bg-white/15 hover:text-white">
            <ChevronsUp size={16} />
          </button>
          <button onClick={() => reorderElements(selectedElementId!, 'up')} title="Bring Forward" className="flex-1 flex items-center justify-center p-1.5 bg-white/5 border border-white/10 rounded text-white/70 cursor-pointer transition-all hover:bg-white/15 hover:text-white">
            <ChevronUp size={16} />
          </button>
          <button onClick={() => reorderElements(selectedElementId!, 'down')} title="Send Backward" className="flex-1 flex items-center justify-center p-1.5 bg-white/5 border border-white/10 rounded text-white/70 cursor-pointer transition-all hover:bg-white/15 hover:text-white">
            <ChevronDown size={16} />
          </button>
          <button onClick={() => reorderElements(selectedElementId!, 'bottom')} title="Send to Back" className="flex-1 flex items-center justify-center p-1.5 bg-white/5 border border-white/10 rounded text-white/70 cursor-pointer transition-all hover:bg-white/15 hover:text-white">
            <ChevronsDown size={16} />
          </button>
        </div>
      </div>

      {/* Text Properties */}
      {selectedElement.type === 'text' && (
        <TextProperties
          element={selectedElement as TextElement}
          updateElement={(updates) => updateElement(selectedElementId!, updates)}
        />
      )}

      {/* Shape Properties */}
      {selectedElement.type === 'shape' && (
        <ShapeProperties
          element={selectedElement as ShapeElement}
          updateElement={(updates) => updateElement(selectedElementId!, updates)}
        />
      )}

      {/* Image Properties */}
      {selectedElement.type === 'image' && (
        <ImageProperties
          element={selectedElement as ImageElement}
          updateElement={(updates, pushHistory) => updateElement(selectedElementId!, updates, pushHistory)}
          pushToHistory={pushToHistory}
        />
      )}

      {/* Common Properties */}
      <div className="mb-3">
        <label className="block text-[10px] font-semibold uppercase tracking-[0.5px] text-white/50 mb-1.5">Opacity</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={selectedElement.opacity}
            onChange={(e) => updateProp('opacity', parseFloat(e.target.value), false)}
            onMouseUp={() => pushToHistory()}
            onTouchEnd={() => pushToHistory()}
            className="flex-1 h-1 bg-white/15 rounded appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full"
          />
          <input
            type="number"
            className="w-[42px] px-1 py-0.5 bg-white/5 border border-white/10 rounded text-white text-xs text-center focus:outline-none focus:border-blue-500 [&::-webkit-inner-spin-button]:appearance-none"
            value={Math.round(selectedElement.opacity * 100)}
            min="0"
            max="100"
            onChange={(e) => {
              const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
              updateProp('opacity', val / 100);
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function TextProperties({
  element,
  updateElement
}: {
  element: TextElement;
  updateElement: (updates: Partial<TextElement>) => void;
}) {
  const labelClass = "block text-[10px] font-semibold uppercase tracking-[0.5px] text-white/50 mb-1.5";
  const toggleBtnClass = "flex-1 flex items-center justify-center p-1.5 bg-white/5 border border-white/10 rounded text-white/70 cursor-pointer transition-all hover:bg-white/15 hover:text-white";
  const activeToggleBtnClass = "bg-blue-500/30 border-blue-500 text-blue-500";

  return (
    <>
      <div className="mb-3">
        <label className={labelClass}>Font Family</label>
        <select
          value={element.fontFamily}
          onChange={(e) => updateElement({ fontFamily: e.target.value })}
          className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-md text-white text-[13px] cursor-pointer focus:outline-none focus:border-blue-500 focus:bg-white/10 [&>option]:bg-[#1a1a2e] [&>option]:text-white"
        >
          {FONT_FAMILIES.map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className={labelClass}>Style</label>
        <div className="flex gap-0.5">
          <button
            className={cn(toggleBtnClass, element.fontWeight >= 700 && activeToggleBtnClass)}
            onClick={() => updateElement({ fontWeight: element.fontWeight >= 700 ? 400 : 700 })}
          >
            <Bold size={16} />
          </button>
          <button
            className={cn(toggleBtnClass, element.fontStyle === 'italic' && activeToggleBtnClass)}
            onClick={() => updateElement({ fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' })}
          >
            <Italic size={16} />
          </button>
        </div>
      </div>

      <div className="mb-3">
        <label className={labelClass}>Alignment</label>
        <div className="flex gap-0.5">
          <button
            className={cn(toggleBtnClass, element.textAlign === 'left' && activeToggleBtnClass)}
            onClick={() => updateElement({ textAlign: 'left' })}
          >
            <AlignLeft size={16} />
          </button>
          <button
            className={cn(toggleBtnClass, element.textAlign === 'center' && activeToggleBtnClass)}
            onClick={() => updateElement({ textAlign: 'center' })}
          >
            <AlignCenter size={16} />
          </button>
          <button
            className={cn(toggleBtnClass, element.textAlign === 'right' && activeToggleBtnClass)}
            onClick={() => updateElement({ textAlign: 'right' })}
          >
            <AlignRight size={16} />
          </button>
        </div>
      </div>

      <div className="mb-3">
        <label className={labelClass}>Text Color</label>
        <div className="flex gap-1.5">
          <input
            type="color"
            value={element.fill}
            onChange={(e) => updateElement({ fill: e.target.value })}
            className="bg-transparent w-7 h-7 p-0 border-none rounded-md cursor-pointer"
          />
          <input
            type="text"
            value={element.fill}
            onChange={(e) => updateElement({ fill: e.target.value })}
            className="flex-1 px-2.5 py-1.5 bg-white/5 border-none rounded-md text-white text-[13px] font-mono"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-white/5">
          {['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#ffffff', '#000000'].map(c => (
            <button
              key={c}
              className="w-5 h-5 rounded border border-white/10 cursor-pointer transition-transform hover:scale-110 hover:border-white"
              style={{ backgroundColor: c }}
              onClick={() => updateElement({ fill: c })}
              title={c}
            />
          ))}
        </div>
      </div>

      <div className="mb-3">
        <label className={labelClass}>Line Height</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0.8"
            max="3"
            step="0.1"
            value={element.lineHeight}
            onChange={(e) => updateElement({ lineHeight: parseFloat(e.target.value) })}
            className="flex-1 h-1 bg-white/15 rounded appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full"
          />
          <input
            type="number"
            className="w-[42px] px-1 py-0.5 bg-white/5 border border-white/10 rounded text-white text-xs text-center focus:outline-none focus:border-blue-500 [&::-webkit-inner-spin-button]:appearance-none"
            value={element.lineHeight.toFixed(1)}
            step="0.1"
            onChange={(e) => updateElement({ lineHeight: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      <div className="mb-3">
        <label className={labelClass}>Letter Spacing</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="-2"
            max="10"
            step="0.1"
            value={element.letterSpacing}
            onChange={(e) => updateElement({ letterSpacing: parseFloat(e.target.value) })}
            className="flex-1 h-1 bg-white/15 rounded appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full"
          />
          <input
            type="number"
            className="w-[42px] px-1 py-0.5 bg-white/5 border border-white/10 rounded text-white text-xs text-center focus:outline-none focus:border-blue-500 [&::-webkit-inner-spin-button]:appearance-none"
            value={element.letterSpacing.toFixed(1)}
            step="0.1"
            onChange={(e) => updateElement({ letterSpacing: parseFloat(e.target.value) })}
          />
        </div>
      </div>
    </>
  );
}

function ShapeProperties({
  element,
  updateElement
}: {
  element: ShapeElement;
  updateElement: (updates: Partial<ShapeElement>) => void;
}) {
  const labelClass = "block text-[10px] font-semibold uppercase tracking-[0.5px] text-white/50 mb-1.5";

  return (
    <>
      <div className="mb-3">
        <label className={labelClass}>Fill Color</label>
        <div className="flex gap-1.5">
          {typeof element.fill === 'string' ? (
            <>
              <input
                type="color"
                value={element.fill}
                style={{ backgroundColor: element.fill }}
                onChange={(e) => updateElement({ fill: e.target.value })}
                className="bg-transparent w-7 h-7 p-0 border-none rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={element.fill}
                onChange={(e) => updateElement({ fill: e.target.value })}
                className="flex-1 px-2.5 py-1.5 bg-white/5 border-none rounded-md text-white text-[13px] font-mono"
              />
            </>
          ) : (
            <div className="flex-1 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-md text-white/50 text-[13px]">
              Gradient (Edit in Toolbar)
            </div>
          )}
        </div>
      </div>

      <div className="mb-3">
        <label className={labelClass}>Stroke Color</label>
        <div className="flex gap-1.5">
          <input
            type="color"
            value={element.stroke}
            onChange={(e) => updateElement({ stroke: e.target.value })}
            className="bg-transparent w-7 h-7 p-0 border-none rounded-md cursor-pointer"
          />
          <input
            type="text"
            value={element.stroke}
            onChange={(e) => updateElement({ stroke: e.target.value })}
            className="flex-1 px-2.5 py-1.5 bg-white/5 border-none rounded-md text-white text-[13px] font-mono"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className={labelClass}>Stroke Width</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="20"
            value={element.strokeWidth}
            onChange={(e) => updateElement({ strokeWidth: parseInt(e.target.value) })}
            className="flex-1 h-1 bg-white/15 rounded appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full"
          />
          <span className="min-w-[40px] text-right text-xs text-white/70">{element.strokeWidth}px</span>
        </div>
      </div>

      {element.shapeType === 'rect' && (
        <div className="mb-3">
          <label className={labelClass}>Corner Radius</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="50"
              value={element.cornerRadius || 0}
              onChange={(e) => updateElement({ cornerRadius: parseInt(e.target.value) })}
              className="flex-1 h-1 bg-white/15 rounded appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full"
            />
            <span className="min-w-[40px] text-right text-xs text-white/70">{element.cornerRadius || 0}px</span>
          </div>
        </div>
      )}
    </>
  );
}

function ImageProperties({
  element,
  updateElement,
  pushToHistory
}: {
  element: ImageElement;
  updateElement: (updates: Partial<ImageElement>, pushHistory?: boolean) => void;
  pushToHistory: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      updateElement({ src });
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="mb-3">
        <label className="block text-[10px] font-semibold uppercase tracking-[0.5px] text-white/50 mb-1.5">Image Source</label>
        <button
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500/15 border border-blue-500/30 rounded-md text-blue-500 text-[13px] font-medium cursor-pointer transition-all hover:bg-blue-500/25 hover:border-blue-500 hover:text-white"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={16} />
          <span>Replace Image</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageReplace}
          style={{ display: 'none' }}
        />
      </div>

      <div className="mb-3">
        <label className="block text-[10px] font-semibold uppercase tracking-[0.5px] text-white/50 mb-1.5">Corner Radius</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="100"
            value={element.cornerRadius || 0}
            onChange={(e) => updateElement({ cornerRadius: parseInt(e.target.value) }, false)}
            onMouseUp={() => pushToHistory()}
            onTouchEnd={() => pushToHistory()}
            className="flex-1 h-1 bg-white/15 rounded appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full"
          />
          <input
            type="number"
            className="w-[42px] px-1 py-0.5 bg-white/5 border border-white/10 rounded text-white text-xs text-center focus:outline-none focus:border-blue-500 [&::-webkit-inner-spin-button]:appearance-none"
            value={element.cornerRadius || 0}
            onChange={(e) => updateElement({ cornerRadius: parseInt(e.target.value) })}
          />
        </div>
      </div>
    </>
  );
}
