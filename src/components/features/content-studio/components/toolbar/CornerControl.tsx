import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CornerControlProps {
  cornerRadius: number;
  cornerRadii?: number[];
  shapeType: string;
  onChange: (updates: { cornerRadius?: number; cornerRadii?: number[] | undefined }) => void;
}

export function CornerControl({
  cornerRadius,
  cornerRadii,
  shapeType,
  onChange
}: CornerControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showIndividual, setShowIndividual] = useState(false);
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

  // Show only for rect and triangle (and potentially image)
  if (!['rect', 'triangle', 'image'].includes(shapeType)) return null;

  const numCorners = shapeType === 'triangle' ? 3 : 4;

  // Logic to determine current values
  const currentRadii = cornerRadii && cornerRadii.length === numCorners
    ? cornerRadii
    : Array(numCorners).fill(cornerRadius);

  const isUniform = currentRadii.every(r => r === currentRadii[0]);
  const masterValue = isUniform ? currentRadii[0] : ''; // Empty string represents "Mixed" state

  // Update ALL corners (Master control)
  const handleMasterChange = (val: number) => {
    // If we are showing individual controls, we probably want to update the array
    if (showIndividual || cornerRadii) {
      onChange({
        cornerRadius: val, // Fallback
        cornerRadii: Array(numCorners).fill(val)
      });
    } else {
      // Simple uniform update
      onChange({
        cornerRadius: val,
        cornerRadii: undefined
      });
    }
  };

  // Update SINGLE corner
  const handleIndividualChange = (index: number, val: number) => {
    const newRadii = [...currentRadii];
    newRadii[index] = val;
    onChange({
      cornerRadii: newRadii
    });
  };

  // Helper Custom Icons for Corners
  const CornerIcon = ({ corner, className }: { corner: 'tl' | 'tr' | 'bl' | 'br', className?: string }) => {
    const d = {
      tl: "M 8 13 V 6 Q 6 6 6 8 H 13", // Top-Left-ish (simplified for 16x16 grid) - actually lets draw a box with one rounded corner
      tr: "", bl: "", br: ""
    };
    // Let's use simpler tailored SVGs
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={className}>
        <rect width="11" height="11" x="0.5" y="0.5" rx="0" stroke="currentColor" strokeOpacity="0.2" />
        {corner === 'tl' && <path d="M 0.5 6 V 3 A 3 3 0 0 1 3.5 0.5 H 6" stroke="currentColor" strokeWidth="1.5" />}
        {corner === 'tr' && <path d="M 6 0.5 H 8.5 A 3 3 0 0 1 11.5 3 V 6" stroke="currentColor" strokeWidth="1.5" />}
        {corner === 'br' && <path d="M 11.5 6 V 8.5 A 3 3 0 0 1 8.5 11.5 H 6" stroke="currentColor" strokeWidth="1.5" />}
        {corner === 'bl' && <path d="M 6 11.5 H 3.5 A 3 3 0 0 1 0.5 8.5 V 6" stroke="currentColor" strokeWidth="1.5" />}
      </svg>
    )
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card transition-all hover:bg-accent hover:shadow-sm active:scale-95",
          isOpen && "bg-accent border-primary/50 shadow-inner"
        )}
        onClick={() => setIsOpen(!isOpen)}
        title="Corner Rounding"
      >
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
          <path d="M4 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
            stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
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
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-xs font-bold text-foreground">Corner Radius</span>
                <button
                  onClick={() => setShowIndividual(!showIndividual)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors",
                    showIndividual ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {showIndividual ? "Hide Details" : "Independent"}
                  {showIndividual ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
              </div>

              {/* Master Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    {isUniform ? "Uniform Radius" : "Mixed Radius"}
                  </span>
                  <span className={cn(
                    "text-[10px] font-mono font-bold px-2 py-0.5 rounded border",
                    !isUniform ? "text-muted-foreground border-border bg-muted/20" : "text-primary bg-primary/5 border-primary/10"
                  )}>
                    {!isUniform ? 'MIXED' : `${masterValue}px`}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={typeof masterValue === 'number' ? masterValue : 0} // visual reset if mixed
                    onChange={(e) => handleMasterChange(parseInt(e.target.value))}
                    className={cn(
                      "flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-primary",
                      !isUniform ? "bg-muted-foreground/20" : "bg-muted"
                    )}
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder={!isUniform ? "-" : undefined}
                    value={typeof masterValue === 'number' ? masterValue : ''}
                    onChange={(e) => handleMasterChange(parseInt(e.target.value) || 0)}
                    className="h-8 w-12 rounded-lg border border-input bg-transparent text-center text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Individual Controls (Collapsible) */}
              <AnimatePresence>
                {showIndividual && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50 mt-2">
                      {currentRadii.map((radius, idx) => {
                        let label: 'tl' | 'tr' | 'bl' | 'br' = 'tl';
                        if (shapeType === 'triangle') {
                          // Triangle mapping approx
                          label = idx === 0 ? 'tl' : (idx === 1 ? 'bl' : 'br');
                        } else {
                          label = idx === 0 ? 'tl' : (idx === 1 ? 'tr' : (idx === 2 ? 'br' : 'bl'));
                          // Fabric Rect default corner order: TL, TR, BR, BL
                          // Careful check order from standard: usually TL, TR, BR, BL
                          // My previous code map: 0,1,2,3 -> TL, TR, BL, BR? 
                          // Actually Fabric format is usually [tl, tr, br, bl].
                          // Let's ensure label matches visual.
                          // standard CSS/Fabric: TL, TR, BR, BL.
                          label = idx === 0 ? 'tl' : (idx === 1 ? 'tr' : (idx === 2 ? 'br' : 'bl'));
                        }

                        return (
                          <div key={idx} className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-lg border border-border/50 focus-within:border-primary/50 transition-colors">
                            <div className="flex items-center justify-center w-6 h-6 rounded bg-card border border-border text-muted-foreground shadow-sm">
                              <CornerIcon corner={label} className={cn(
                                label === 'tl' && "", // normal
                                label === 'tr' && "",
                                // SVG paths above are hardcoded, so just pass the type
                                "text-primary/70"
                              )} />
                            </div>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={radius}
                              onChange={(e) => handleIndividualChange(idx, parseInt(e.target.value) || 0)}
                              className="w-full bg-transparent text-xs font-bold outline-none text-right pr-1"
                            />
                            <span className="text-[9px] text-muted-foreground font-bold pointer-events-none">px</span>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
