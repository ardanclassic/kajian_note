import { useState, useRef, useEffect } from "react";
import { AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd } from "lucide-react";
import { cn } from "@/lib/utils";
import { RATIO_DIMENSIONS } from "@/types/contentStudio.types";
import type { Ratio } from "@/types/contentStudio.types";

interface ImagePositionPopoverProps {
  currentPosition: { x: number; y: number };
  currentSize: { width: number; height: number };
  scaleX: number;
  scaleY: number;
  ratio: Ratio;
  onPositionChange: (position: { x: number; y: number }) => void;
}

export function ImagePositionPopover({
  currentPosition,
  currentSize,
  scaleX,
  scaleY,
  ratio,
  onPositionChange
}: ImagePositionPopoverProps) {
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

  const canvasDimensions = RATIO_DIMENSIONS[ratio];
  const actualWidth = currentSize.width * scaleX;
  const actualHeight = currentSize.height * scaleY;

  const positions = [
    {
      label: "Top",
      icon: AlignVerticalJustifyStart,
      getPosition: () => ({
        x: currentPosition.x, // Keep horizontal position
        y: 0 // Align to top edge
      })
    },
    {
      label: "Left",
      icon: AlignHorizontalJustifyStart,
      getPosition: () => ({
        x: 0, // Align to left edge
        y: currentPosition.y // Keep vertical position
      })
    },
    {
      label: "Middle",
      icon: AlignVerticalJustifyCenter,
      getPosition: () => ({
        x: currentPosition.x, // Keep horizontal position
        y: (canvasDimensions.height - actualHeight) / 2 // Center vertically
      })
    },
    {
      label: "Center",
      icon: AlignHorizontalJustifyCenter,
      getPosition: () => ({
        x: (canvasDimensions.width - actualWidth) / 2, // Center horizontally
        y: currentPosition.y // Keep vertical position
      })
    },
    {
      label: "Bottom",
      icon: AlignVerticalJustifyEnd,
      getPosition: () => ({
        x: currentPosition.x, // Keep horizontal position
        y: canvasDimensions.height - actualHeight // Align to bottom edge
      })
    },
    {
      label: "Right",
      icon: AlignHorizontalJustifyEnd,
      getPosition: () => ({
        x: canvasDimensions.width - actualWidth, // Align to right edge
        y: currentPosition.y // Keep vertical position
      })
    },
  ];

  const handlePosition = (getPosition: () => { x: number; y: number }) => {
    onPositionChange(getPosition());
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
        title="Align to page"
      >
        <AlignVerticalJustifyCenter size={14} />
        <span>Align</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 rounded-md border bg-popover p-2 shadow-md z-50">
          <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Align to page</div>
          <div className="grid grid-cols-2 gap-1">
            {positions.map((pos) => (
              <button
                key={pos.label}
                className="flex items-center gap-2 rounded-sm px-2 py-2 text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => handlePosition(pos.getPosition)}
              >
                <pos.icon size={14} />
                <span>{pos.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
