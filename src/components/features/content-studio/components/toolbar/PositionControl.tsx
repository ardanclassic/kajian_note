import { useState, useRef, useEffect } from "react";
import {
  AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
  AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd,
  Move, Minimize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RATIO_DIMENSIONS } from "@/types/contentStudio.types";
import type { Ratio } from "@/types/contentStudio.types";
import { motion, AnimatePresence } from "framer-motion";

interface PositionControlProps {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  ratio: Ratio;
  onChange: (updates: { position?: { x: number; y: number }; size?: { width: number; height: number }; rotation?: number }) => void;
  // Optional flag to show/hide size controls (e.g. for some shapes we might lock size)
  showSizeResults?: boolean;
}

export function PositionControl({
  x, y, width, height, rotation = 0, scaleX = 1, scaleY = 1, ratio, onChange, showSizeResults = true
}: PositionControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const canvasDimensions = RATIO_DIMENSIONS[ratio];
  const actualWidth = width * scaleX;
  const actualHeight = height * scaleY;

  // Alignment Helpers
  const align = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    let newX = x;
    let newY = y;

    switch (type) {
      case 'left': newX = 0; break;
      case 'center': newX = (canvasDimensions.width - actualWidth) / 2; break;
      case 'right': newX = canvasDimensions.width - actualWidth; break;
      case 'top': newY = 0; break;
      case 'middle': newY = (canvasDimensions.height - actualHeight) / 2; break;
      case 'bottom': newY = canvasDimensions.height - actualHeight; break;
    }

    onChange({ position: { x: newX, y: newY } });
  };

  // Input Handlers
  const handleXChange = (val: string) => onChange({ position: { x: parseFloat(val) || 0, y } });
  const handleYChange = (val: string) => onChange({ position: { x, y: parseFloat(val) || 0 } });

  // Size Handlers (Takes scaling into account implicitly by updating base size or just visual if scale=1)
  // For width/height updates, we typically update the 'size' property proper.
  // Note: changing width/height might affect position if origin is center, but here we assume top-left origin logic or handled by caller?
  // Fabric default is mostly top-left or center. Our app seems to sync position x/y (top/left).

  const handleWChange = (val: string) => {
    const newW = parseFloat(val) || 0;
    // If we have scale, we might want to reset scale to 1 and set width? Or keep scale?
    // Usually clearer to update the 'base' width if scale is 1. 
    // For simplicity, we pass size. UseEditorStore/Fabric handlers usually handle the rest.
    onChange({ size: { width: newW / scaleX, height } });
  };

  const handleHChange = (val: string) => {
    const newH = parseFloat(val) || 0;
    onChange({ size: { width, height: newH / scaleY } });
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        className={cn(
          "flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground",
          isOpen && "border-border bg-muted text-foreground shadow-sm"
        )}
        onClick={() => setIsOpen(!isOpen)}
        title="Position & Size"
      >
        <div className="flex items-center justify-center w-6 h-6 rounded bg-background/50 border border-border/50">
          <Move size={12} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-3 w-[240px] rounded-xl border border-border bg-popover p-4 shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-foreground">Transform</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">X: {Math.round(x)}, Y: {Math.round(y)}</span>
            </div>

            {/* Alignment Grid */}
            <div className="mb-4 space-y-2">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Align to Page</span>
              <div className="grid grid-cols-3 gap-1">
                <button onClick={() => align('left')} className="p-1.5 rounded hover:bg-accent flex justify-center text-muted-foreground hover:text-accent-foreground" title="Align Left">
                  <AlignHorizontalJustifyStart size={16} />
                </button>
                <button onClick={() => align('center')} className="p-1.5 rounded hover:bg-accent flex justify-center text-muted-foreground hover:text-accent-foreground" title="Align Center">
                  <AlignHorizontalJustifyCenter size={16} />
                </button>
                <button onClick={() => align('right')} className="p-1.5 rounded hover:bg-accent flex justify-center text-muted-foreground hover:text-accent-foreground" title="Align Right">
                  <AlignHorizontalJustifyEnd size={16} />
                </button>
                <button onClick={() => align('top')} className="p-1.5 rounded hover:bg-accent flex justify-center text-muted-foreground hover:text-accent-foreground" title="Align Top">
                  <AlignVerticalJustifyStart size={16} />
                </button>
                <button onClick={() => align('middle')} className="p-1.5 rounded hover:bg-accent flex justify-center text-muted-foreground hover:text-accent-foreground" title="Align Middle">
                  <AlignVerticalJustifyCenter size={16} />
                </button>
                <button onClick={() => align('bottom')} className="p-1.5 rounded hover:bg-accent flex justify-center text-muted-foreground hover:text-accent-foreground" title="Align Bottom">
                  <AlignVerticalJustifyEnd size={16} />
                </button>
              </div>
            </div>

            <div className="h-px bg-border my-3" />

            {/* Manual Coordinates */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">X Position</label>
                <div className="relative">
                  <span className="absolute left-2 top-1.5 text-xs text-muted-foreground">X</span>
                  <input
                    type="number"
                    value={Math.round(x)}
                    onChange={(e) => handleXChange(e.target.value)}
                    className="w-full h-8 pl-6 pr-2 bg-background border border-input rounded-md text-xs focus:ring-1 focus:ring-ring focus:border-ring"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Y Position</label>
                <div className="relative">
                  <span className="absolute left-2 top-1.5 text-xs text-muted-foreground">Y</span>
                  <input
                    type="number"
                    value={Math.round(y)}
                    onChange={(e) => handleYChange(e.target.value)}
                    className="w-full h-8 pl-6 pr-2 bg-background border border-input rounded-md text-xs focus:ring-1 focus:ring-ring focus:border-ring"
                  />
                </div>
              </div>
            </div>

            {/* Dimensions */}
            {showSizeResults && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Width</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-xs text-muted-foreground">W</span>
                    <input
                      type="number"
                      value={Math.round(actualWidth)}
                      onChange={(e) => handleWChange(e.target.value)}
                      className="w-full h-8 pl-6 pr-2 bg-background border border-input rounded-md text-xs focus:ring-1 focus:ring-ring focus:border-ring"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Height</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-xs text-muted-foreground">H</span>
                    <input
                      type="number"
                      value={Math.round(actualHeight)}
                      onChange={(e) => handleHChange(e.target.value)}
                      className="w-full h-8 pl-6 pr-2 bg-background border border-input rounded-md text-xs focus:ring-1 focus:ring-ring focus:border-ring"
                    />
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
