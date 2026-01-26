import { useState, useRef, useEffect } from "react";
import { Layers, ChevronUp, ChevronsUp, ChevronDown, ChevronsDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayerOrderPopoverProps {
  elementId: string;
  onReorder: (id: string, direction: 'top' | 'up' | 'down' | 'bottom') => void;
}

export function LayerOrderPopover({ elementId, onReorder }: LayerOrderPopoverProps) {
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

  const handleAction = (direction: 'top' | 'up' | 'down' | 'bottom') => {
    onReorder(elementId, direction);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          isOpen && "bg-accent text-accent-foreground"
        )}
        onClick={() => setIsOpen(!isOpen)}
        title="Layer Order"
      >
        <Layers size={16} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-40 rounded-md border bg-popover p-1 shadow-md z-50">
          <button
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => handleAction('top')}
          >
            <ChevronsUp size={14} />
            <span>Bring to Front</span>
          </button>
          <button
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => handleAction('up')}
          >
            <ChevronUp size={14} />
            <span>Bring Forward</span>
          </button>
          <button
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => handleAction('down')}
          >
            <ChevronDown size={14} />
            <span>Send Backward</span>
          </button>
          <button
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => handleAction('bottom')}
          >
            <ChevronsDown size={14} />
            <span>Send to Back</span>
          </button>
        </div>
      )}
    </div>
  );
}
