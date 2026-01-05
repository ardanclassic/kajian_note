import { useState, useRef, useEffect } from "react";
import { FlipHorizontal, FlipVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageFlipControlProps {
  onFlip: (direction: 'horizontal' | 'vertical') => void;
}

export function ImageFlipControl({ onFlip }: ImageFlipControlProps) {
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

  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    onFlip(direction);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        className={cn(
          "flex items-center gap-1.5 rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground",
          isOpen && "bg-muted/80 text-foreground"
        )}
        onClick={() => setIsOpen(!isOpen)}
        title="Flip"
      >
        <FlipHorizontal size={14} />
        <span>Flip</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-40 rounded-md border bg-popover p-1 shadow-md z-50">
          <button
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => handleFlip('horizontal')}
          >
            <FlipHorizontal size={14} />
            <span>Horizontal</span>
          </button>
          <button
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => handleFlip('vertical')}
          >
            <FlipVertical size={14} />
            <span>Vertical</span>
          </button>
        </div>
      )}
    </div>
  );
}
