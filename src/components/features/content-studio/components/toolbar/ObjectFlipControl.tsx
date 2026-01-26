import { useState, useRef, useEffect } from "react";
import { FlipHorizontal, FlipVertical, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ObjectFlipControlProps {
  onFlip: (direction: 'horizontal' | 'vertical') => void;
}

export function ObjectFlipControl({ onFlip }: ObjectFlipControlProps) {
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
          "flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground",
          isOpen && "border-border bg-muted text-foreground shadow-sm"
        )}
        onClick={() => setIsOpen(!isOpen)}
        title="Flip Object"
      >
        <div className="flex items-center justify-center w-6 h-6 rounded bg-background/50 border border-border/50">
          <FlipHorizontal size={14} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-3 w-40 rounded-xl border border-border bg-popover p-2 shadow-xl z-50 overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-1">
              <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => handleFlip('horizontal')}
              >
                <FlipHorizontal size={16} />
                <span>Horizontal</span>
              </button>
              <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => handleFlip('vertical')}
              >
                <FlipVertical size={16} />
                <span>Vertical</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
