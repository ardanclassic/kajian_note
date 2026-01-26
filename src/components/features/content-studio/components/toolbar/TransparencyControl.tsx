import { useState, useRef, useEffect } from "react";
import { Minus, Plus, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransparencyControlProps {
  opacity: number;
  onChange: (val: number) => void;
}

export function TransparencyControl({
  opacity,
  onChange
}: TransparencyControlProps) {
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

  const handleIncrement = () => {
    onChange(Math.min(1, parseFloat((opacity + 0.01).toFixed(2))));
  };

  const handleDecrement = () => {
    onChange(Math.max(0, parseFloat((opacity - 0.01).toFixed(2))));
  };

  const displayValue = Math.round((opacity || 0) * 100);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          isOpen && "bg-accent text-accent-foreground"
        )}
        onClick={() => setIsOpen(!isOpen)}
        title="Transparency"
      >
        <span className="text-xs font-bold opacity-70">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="12" x2="12" y2="12.01" />
            <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.48" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[240px] rounded-md border bg-popover p-4 shadow-md z-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Transparency</span>
              <span className="text-xs font-mono text-muted-foreground">{displayValue}%</span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={displayValue}
                onChange={(e) => onChange(parseInt(e.target.value) / 100)}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                className="flex h-7 w-7 items-center justify-center rounded-md border border-input hover:bg-accent"
                onClick={handleDecrement}
              >
                <Minus size={12} />
              </button>

              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={displayValue}
                  onChange={(e) => onChange(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) / 100)}
                  className="h-7 w-full rounded-md border border-input bg-transparent px-2 text-center text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">%</span>
              </div>

              <button
                className="flex h-7 w-7 items-center justify-center rounded-md border border-input hover:bg-accent"
                onClick={handleIncrement}
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
