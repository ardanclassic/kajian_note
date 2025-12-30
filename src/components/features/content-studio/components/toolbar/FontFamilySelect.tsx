import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const FONT_FAMILIES = [
  'Inter',
  'Nunito',
  'Poppins',
  'Montserrat',
  'Roboto',
  'Open Sans',
  'Lato',
  'Playfair Display',
  'Merriweather',
  'Raleway'
];

interface FontFamilySelectProps {
  value: string;
  onChange: (val: string) => void;
}

export function FontFamilySelect({ value, onChange }: FontFamilySelectProps) {
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
    <div className="relative w-full" ref={wrapperRef}>
      <button
        className="flex h-7 w-full items-center justify-between rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm ring-offset-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate mr-2" style={{ fontFamily: value }}>
          {value}
        </span>
        <ChevronDown size={12} className="opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 max-h-[300px] w-[180px] overflow-y-auto rounded-md border bg-popover p-1 shadow-md z-50">
          {FONT_FAMILIES.map(font => (
            <div
              key={font}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                font === value && "bg-accent text-accent-foreground"
              )}
              onClick={() => {
                onChange(font);
                setIsOpen(false);
              }}
              style={{ fontFamily: font }}
            >
              {font}
              {font === value && <Check size={12} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
