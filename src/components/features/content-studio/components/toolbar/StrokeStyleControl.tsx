import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const STROKE_STYLES = [
  { value: 'none', label: 'None', icon: '⊘' },
  { value: 'solid', label: 'Solid', dashArray: null },
  { value: 'dashed', label: 'Dashed', dashArray: [10, 5] },
  { value: 'dashed-long', label: 'Long Dash', dashArray: [20, 10] },
  { value: 'dotted', label: 'Dotted', dashArray: [2, 4] },
];

interface StrokeStyleControlProps {
  strokeWidth: number;
  strokeDashArray?: number[] | null | undefined;
  stroke: string;
  onChange: (updates: { strokeWidth?: number, strokeDashArray?: number[] | null, stroke?: string }) => void;
}

export function StrokeStyleControl({
  strokeWidth,
  strokeDashArray,
  stroke,
  onChange
}: StrokeStyleControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCurrentStyle = () => {
    if (strokeWidth === 0) return 'none';
    if (!strokeDashArray || strokeDashArray.length === 0) return 'solid';
    if (strokeDashArray[0] === 2) return 'dotted';
    if (strokeDashArray[0] === 20) return 'dashed-long';
    return 'dashed';
  };

  const handleStyleChange = (styleValue: string) => {
    const style = STROKE_STYLES.find(s => s.value === styleValue);
    if (!style) return;

    if (styleValue === 'none') {
      onChange({ strokeWidth: 0 });
    } else {
      onChange({
        strokeWidth: strokeWidth === 0 ? 2 : strokeWidth,
        strokeDashArray: style.dashArray
      });
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md p-1 hover:bg-accent",
          isOpen && "bg-accent"
        )}
        onClick={() => setIsOpen(!isOpen)}
        title="Stroke Style"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="2" />
          <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
          <line x1="2" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="2" strokeDasharray="1 2" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[260px] rounded-md border bg-popover p-4 shadow-md z-50">
          {/* Style Grid */}
          <div className="mb-4 grid grid-cols-5 gap-2">
            {STROKE_STYLES.map((style) => (
              <button
                key={style.value}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-md border border-input transition-colors hover:bg-accent hover:text-accent-foreground",
                  getCurrentStyle() === style.value && "bg-accent text-accent-foreground border-primary ring-1 ring-primary"
                )}
                onClick={() => handleStyleChange(style.value)}
                title={style.label}
              >
                {style.value === 'none' ? (
                  <span className="text-lg font-bold">⊘</span>
                ) : (
                  <svg width="24" height="4" viewBox="0 0 24 4">
                    <line
                      x1="0" y1="2" x2="24" y2="2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={style.dashArray?.join(' ') || 'none'}
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Weight Slider */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Stroke Weight</label>
              <span className="text-xs font-mono text-muted-foreground">{strokeWidth}px</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={strokeWidth}
                onChange={(e) => onChange({ strokeWidth: parseInt(e.target.value) })}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
              />
              <input
                type="number"
                min="0"
                max="50"
                value={strokeWidth}
                onChange={(e) => onChange({ strokeWidth: parseInt(e.target.value) || 0 })}
                className="h-7 w-12 rounded-md border border-input bg-transparent px-2 text-center text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Stroke Color</label>
            <div className="flex items-center gap-2 rounded-md border border-input p-2">
              <div
                className="h-6 w-6 rounded border border-gray-200"
                style={{ backgroundColor: stroke }}
              />
              <input
                type="color"
                value={stroke}
                onChange={(e) => onChange({ stroke: e.target.value })}
                className="flex-1 cursor-pointer bg-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
