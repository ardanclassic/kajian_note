import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CornerControlProps {
  cornerRadius: number;
  shapeType: string;
  onChange: (updates: { cornerRadius?: number }) => void;
}

export function CornerControl({
  cornerRadius,
  shapeType,
  onChange
}: CornerControlProps) {
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

  // Only show for rect shapes
  // Note: TypeScript check might be needed if shapeType is restricted type
  if (shapeType !== 'rect') return null;

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          isOpen && "bg-accent text-accent-foreground"
        )}
        onClick={() => setIsOpen(!isOpen)}
        title="Corner Rounding"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
            stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[200px] rounded-md border bg-popover p-4 shadow-md z-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Corner Radius</span>
              <span className="text-xs font-mono text-muted-foreground">{cornerRadius}px</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={cornerRadius}
                onChange={(e) => onChange({ cornerRadius: parseInt(e.target.value) })}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={cornerRadius}
                onChange={(e) => onChange({ cornerRadius: parseInt(e.target.value) || 0 })}
                className="h-7 w-12 rounded-md border border-input bg-transparent px-2 text-center text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
