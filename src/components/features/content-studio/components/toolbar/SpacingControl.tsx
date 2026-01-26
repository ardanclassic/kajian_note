import { useState, useRef, useEffect } from "react";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpacingControlProps {
  lineHeight: number;
  letterSpacing: number;
  onChange: (key: 'lineHeight' | 'letterSpacing', val: number) => void;
}

export function SpacingControl({
  lineHeight,
  letterSpacing,
  onChange
}: SpacingControlProps) {
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

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          isOpen && "bg-accent text-accent-foreground"
        )}
        onClick={() => setIsOpen(!isOpen)}
        title="Spacing"
      >
        <ArrowUpDown size={16} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 mt-2 w-[240px] -translate-x-1/2 rounded-md border bg-popover p-4 shadow-md z-50">
          {/* Letter Spacing */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Letter Spacing</span>
              <span className="text-xs font-mono text-muted-foreground">{letterSpacing}</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="-100"
                max="800"
                step="10"
                value={letterSpacing}
                onChange={(e) => onChange('letterSpacing', parseInt(e.target.value))}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
              />
              <input
                type="number"
                value={letterSpacing}
                onChange={(e) => onChange('letterSpacing', parseInt(e.target.value) || 0)}
                className="h-7 w-14 rounded-md border border-input bg-transparent px-2 text-center text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Line Height */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Line Height</span>
              <span className="text-xs font-mono text-muted-foreground">{lineHeight}</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.01"
                value={lineHeight}
                onChange={(e) => onChange('lineHeight', parseFloat(e.target.value))}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
              />
              <input
                type="number"
                min="0.5"
                max="3"
                step="0.1"
                value={lineHeight}
                onChange={(e) => onChange('lineHeight', parseFloat(e.target.value) || 1)}
                className="h-7 w-14 rounded-md border border-input bg-transparent px-2 text-center text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
