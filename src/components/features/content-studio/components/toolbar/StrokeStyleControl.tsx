import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Pipette } from "lucide-react";

const STROKE_STYLES = [
  { value: 'none', label: 'None', icon: '⊘' },
  { value: 'solid', label: 'Solid', dashArray: null },
  { value: 'dashed', label: 'Dashed', dashArray: [10, 5] },
  { value: 'dashed-long', label: 'Long Dash', dashArray: [20, 10] },
  { value: 'dotted', label: 'Dotted', dashArray: [2, 4] },
];

interface StrokeStyleControlProps {
  strokeWidth: number;
  strokeDashArray?: number[] | null | undefined;
  stroke: string;
  onChange: (updates: { strokeWidth?: number, strokeDashArray?: number[] | null, stroke?: string }) => void;
}

export function StrokeStyleControl({
  strokeWidth,
  strokeDashArray,
  stroke,
  onChange
}: StrokeStyleControlProps) {
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

  const getCurrentStyle = () => {
    if (strokeWidth === 0) return 'none';
    if (!strokeDashArray || strokeDashArray.length === 0) return 'solid';
    if (strokeDashArray[0] === 2) return 'dotted';
    if (strokeDashArray[0] === 20) return 'dashed-long';
    return 'dashed';
  };

  const currentStyleValue = getCurrentStyle();

  const handleStyleChange = (styleValue: string) => {
    const style = STROKE_STYLES.find(s => s.value === styleValue);
    if (!style) return;

    if (styleValue === 'none') {
      onChange({ strokeWidth: 0 });
    } else {
      onChange({
        strokeWidth: strokeWidth === 0 ? 2 : strokeWidth,
        strokeDashArray: style.dashArray
      });
    }
  };

  const currentStrokeColor = stroke || '#000000';

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card transition-all hover:bg-accent hover:shadow-sm active:scale-95",
          isOpen && "bg-accent border-primary/50 shadow-inner"
        )}
        onClick={() => setIsOpen(!isOpen)}
        title="Stroke Style"
      >
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-[280px] rounded-xl border border-border bg-card p-4 shadow-2xl z-[100]"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-xs font-bold text-foreground">Stroke Style</span>
              </div>

              {/* Style Grid */}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">Pattern</span>
                <div className="grid grid-cols-5 gap-2">
                  {STROKE_STYLES.map((style) => (
                    <button
                      key={style.value}
                      className={cn(
                        "flex aspect-square items-center justify-center rounded-lg border transition-all hover:scale-105 active:scale-95",
                        currentStyleValue === style.value
                          ? "bg-primary/10 border-primary text-primary shadow-sm"
                          : "bg-muted/30 border-transparent hover:bg-muted text-muted-foreground"
                      )}
                      onClick={() => handleStyleChange(style.value)}
                      title={style.label}
                    >
                      {style.value === 'none' ? (
                        <span className="text-lg font-bold">⊘</span>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" className="stroke-current">
                          <line
                            x1="2" y1="12" x2="22" y2="12"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={style.dashArray ? style.dashArray.map(n => n / 2).join(' ') : 'none'}
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Weight</span>
                  <span className="text-[10px] font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">{strokeWidth}px</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={strokeWidth}
                    onChange={(e) => onChange({ strokeWidth: parseInt(e.target.value) })}
                    className={cn(
                      "flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-primary",
                      strokeWidth === 0 ? "bg-muted" : "bg-muted"
                    )}
                    disabled={strokeWidth === 0 && currentStyleValue === 'none'}
                  />
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={strokeWidth}
                    onChange={(e) => onChange({ strokeWidth: parseInt(e.target.value) || 0 })}
                    className="h-8 w-12 rounded-lg border border-input bg-transparent text-center text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
                    disabled={strokeWidth === 0 && currentStyleValue === 'none'}
                  />
                </div>
              </div>

              {/* Color */}
              <div className="space-y-2 pt-1 border-t border-border/50">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block mt-2">Color</span>
                <div className="group relative flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2 transition-colors focus-within:border-primary/50 focus-within:bg-muted/50">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-card shadow-sm relative overflow-hidden">
                    <Pipette size={14} className="text-muted-foreground absolute z-10 pointer-events-none" />
                    <input
                      type="color"
                      value={currentStrokeColor}
                      onChange={(e) => onChange({ stroke: e.target.value.toUpperCase() })}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      disabled={strokeWidth === 0 && currentStyleValue === 'none'}
                    />
                    <div className="absolute inset-0 -z-10" style={{ backgroundColor: currentStrokeColor }} />
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <input
                      type="text"
                      value={currentStrokeColor}
                      onChange={(e) => onChange({ stroke: e.target.value })}
                      className="w-full bg-transparent text-xs font-bold font-mono outline-none text-foreground uppercase placeholder:text-muted-foreground/50"
                      placeholder="#000000"
                      maxLength={7}
                      disabled={strokeWidth === 0 && currentStyleValue === 'none'}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
