import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming cn utility exists in standard shadcn project

const FONT_SIZES = [6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 120, 144];

interface FontSizeComboboxProps {
  value: number;
  onChange: (val: number) => void;
}

export function FontSizeCombobox({ value, onChange }: FontSizeComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    const num = parseInt(e.target.value);
    if (!isNaN(num)) onChange(num);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div className="relative flex items-center" ref={wrapperRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="h-7 w-[50px] rounded-md border border-input bg-transparent px-2 text-center text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          className="absolute right-1 text-muted-foreground hover:text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          tabIndex={-1}
        >
          <ChevronDown size={12} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 max-h-[300px] w-[80px] overflow-y-auto rounded-md border bg-popover p-1 shadow-md z-50">
          {FONT_SIZES.map(size => (
            <div
              key={size}
              className={cn(
                "flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                size === value && "bg-accent text-accent-foreground"
              )}
              onClick={() => {
                onChange(size);
                setIsOpen(false);
              }}
            >
              {size} px
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
