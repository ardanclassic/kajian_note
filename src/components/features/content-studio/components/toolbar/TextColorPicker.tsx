import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check, Pipette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#F3F4F6', '#9CA3AF', '#4B5563', '#1F2937',
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#D946EF', '#F43F5E'
];

interface TextColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export function TextColorPicker({ color, onChange }: TextColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Clean the color string to ensure it's a valid hex for the native input
  const safeColor = typeof color === 'string' && color.startsWith('#') ? color : '#000000';
  const displayColor = typeof color === 'string' ? color.toUpperCase() : '#000000';

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
        type="button"
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card transition-all hover:bg-accent hover:shadow-sm active:scale-95",
          isOpen && "bg-accent border-primary/50 shadow-inner"
        )}
        onClick={() => setIsOpen(!isOpen)}
        title="Text Color"
      >
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-sm font-black leading-none text-foreground">A</span>
          <div
            className="h-1 w-5 rounded-full shadow-sm"
            style={{ backgroundColor: safeColor }}
          />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-64 rounded-xl border border-border bg-card p-4 shadow-2xl z-[100]"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Text Color</span>
                <div className="h-6 w-6 rounded-md border border-border overflow-hidden shadow-sm" style={{ backgroundColor: safeColor }} />
              </div>

              {/* HEX Input Section */}
              <div className="group relative flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2 transition-colors focus-within:border-primary/50 focus-within:bg-muted/50">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-card shadow-sm relative overflow-hidden">
                  <Pipette size={14} className="text-muted-foreground absolute z-10 pointer-events-none" />
                  <input
                    type="color"
                    value={safeColor}
                    onChange={(e) => onChange(e.target.value.toUpperCase())}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    title="Pick a color from spectrum"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase px-0.5">Hex Code</span>
                  <input
                    type="text"
                    value={displayColor}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      if (/^#[0-9A-F]{0,6}$/i.test(val)) {
                        onChange(val.startsWith('#') ? val.toUpperCase() : `#${val.toUpperCase()}`);
                      }
                    }}
                    className="w-full bg-transparent text-sm font-bold font-mono outline-none text-foreground"
                    placeholder="#000000"
                    maxLength={7}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block px-0.5">Presets</span>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((presetColor) => (
                    <button
                      key={presetColor}
                      type="button"
                      className={cn(
                        "aspect-square w-full rounded-md border border-border/50 ring-offset-background transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 relative group",
                        displayColor === presetColor.toUpperCase() && "ring-2 ring-primary border-transparent"
                      )}
                      style={{ backgroundColor: presetColor }}
                      onClick={() => onChange(presetColor.toUpperCase())}
                      title={presetColor}
                    >
                      {displayColor === presetColor.toUpperCase() && (
                        <Check size={10} className={cn(
                          "absolute inset-0 m-auto",
                          ['#FFFFFF', '#F3F4F6'].includes(presetColor) ? "text-black" : "text-white"
                        )} />
                      )}
                      <span className="sr-only">{presetColor}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
