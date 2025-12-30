import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#FF5733', '#FFC300', '#DAF7A6',
  '#33FF57', '#33FFF5', '#3380FF', '#7D33FF', '#FF33F5'
];

interface FillColorControlProps {
  fill: string;
  onChange: (color: string) => void;
}

export function FillColorControl({
  fill,
  onChange
}: FillColorControlProps) {
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
          "flex h-8 w-8 items-center justify-center rounded-md p-1 hover:bg-accent",
          isOpen && "bg-accent"
        )}
        title="Fill Color"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          className="h-[18px] w-[18px] rounded-full border border-border shadow-sm"
          style={{ backgroundColor: fill }}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[240px] rounded-md border bg-popover p-3 shadow-md z-50">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground w-16">Fill Color</span>
              <div className="flex-1 flex items-center justify-end">
                <input
                  type="color"
                  value={fill}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-6 w-6 cursor-pointer rounded border-none p-0"
                  style={{ backgroundColor: 'transparent' }}
                />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className="aspect-square w-full rounded-full border border-gray-200 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onChange(color);
                    setIsOpen(false);
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
