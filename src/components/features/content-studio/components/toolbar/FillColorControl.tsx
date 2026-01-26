import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { GradientFill } from "@/types/contentStudio.types";
import { Check, Pipette, MoveHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#F3F4F6', '#9CA3AF', '#4B5563', '#1F2937',
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#D946EF', '#F43F5E'
];

interface FillColorControlProps {
  fill: string | GradientFill;
  onChange: (color: string | GradientFill) => void;
}

export function FillColorControl({
  fill,
  onChange
}: FillColorControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isGradient = typeof fill !== 'string';
  const [tab, setTab] = useState<'solid' | 'gradient'>(isGradient ? 'gradient' : 'solid');

  // Default gradient state for when switching from solid to gradient
  const [gradientConfig, setGradientConfig] = useState<GradientFill>(
    isGradient ? (fill as GradientFill) : {
      type: 'linear',
      startColor: typeof fill === 'string' && fill !== 'transparent' ? fill : '#FFFFFF',
      endColor: 'transparent',
      angle: 90
    }
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isGradient) {
      setTab('gradient');
      setGradientConfig(fill as GradientFill);
    } else {
      setTab('solid');
    }
  }, [fill, isGradient]);

  const handleSolidChange = (color: string) => {
    onChange(color);
  };

  const handleGradientChange = (updates: Partial<GradientFill>) => {
    const newConfig = { ...gradientConfig, ...updates };
    setGradientConfig(newConfig);
    onChange(newConfig);
  };

  const safeSolidColor = typeof fill === 'string' && fill !== 'transparent' ? fill : '#FFFFFF';
  const displaySolidColor = typeof fill === 'string' ? fill.toUpperCase() : (fill as GradientFill)?.startColor?.toUpperCase() || '#FFFFFF';

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card transition-all hover:bg-accent hover:shadow-sm active:scale-95",
          isOpen && "bg-accent border-primary/50 shadow-inner"
        )}
        title="Fill Color"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="h-5 w-5 rounded-md border border-border shadow-sm overflow-hidden transform group-hover:scale-110 transition-transform">
          {isGradient ? (
            <div className="w-full h-full" style={{
              background: `linear-gradient(${(fill as GradientFill).angle}deg, ${(fill as GradientFill).startColor}, ${(fill as GradientFill).endColor})`
            }} />
          ) : (
            <div className="w-full h-full relative" style={{ backgroundColor: fill as string === 'transparent' ? 'transparent' : fill as string }}>
              {fill === 'transparent' && (
                <div className="absolute inset-0 bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNjY2MiLz48cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIi8+PC9zdmc+')] opacity-40" />
              )}
            </div>
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-72 rounded-xl border border-border bg-card p-4 shadow-2xl z-[100]"
          >

            {/* Tabs */}
            <div className="flex p-0.5 mb-4 rounded-lg bg-muted/50 border border-border">
              <button
                className={cn(
                  "flex-1 py-1.5 text-xs font-bold rounded-md transition-all",
                  tab === 'solid' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => {
                  setTab('solid');
                  if (isGradient) handleSolidChange(gradientConfig.startColor);
                }}
              >
                Solid
              </button>
              <button
                className={cn(
                  "flex-1 py-1.5 text-xs font-bold rounded-md transition-all",
                  tab === 'gradient' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => {
                  setTab('gradient');
                  onChange(gradientConfig);
                }}
              >
                Gradient
              </button>
            </div>

            <div className="space-y-4">

              {tab === 'solid' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Solid Color</span>
                    <div className="flex gap-2">
                      <div className="h-5 w-5 rounded border border-border overflow-hidden shadow-sm" style={{ backgroundColor: safeSolidColor }} />
                      <button
                        className={cn(
                          "h-5 w-5 rounded border border-border relative overflow-hidden transition-transform hover:scale-110",
                          fill === 'transparent' && "ring-2 ring-primary border-transparent"
                        )}
                        title="Transparent"
                        onClick={() => handleSolidChange('transparent')}
                      >
                        <div className="absolute inset-0 bg-white" />
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNjY2MiLz48cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIi8+PC9zdmc+')] opacity-40" />
                        {fill === 'transparent' && <Check size={8} className="absolute inset-0 m-auto text-black" />}
                      </button>
                    </div>
                  </div>

                  {/* HEX Input Section */}
                  <div className="group relative flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2 transition-colors focus-within:border-primary/50 focus-within:bg-muted/50">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-card shadow-sm relative overflow-hidden">
                      <Pipette size={14} className="text-muted-foreground absolute z-10 pointer-events-none" />
                      <input
                        type="color"
                        value={safeSolidColor}
                        onChange={(e) => handleSolidChange(e.target.value.toUpperCase())}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                      <span className="text-[10px] text-muted-foreground font-medium uppercase px-0.5">Hex Code</span>
                      <input
                        type="text"
                        value={displaySolidColor}
                        onChange={(e) => {
                          const val = e.target.value.trim();
                          if (/^#[0-9A-F]{0,6}$/i.test(val)) {
                            handleSolidChange(val.startsWith('#') ? val.toUpperCase() : `#${val.toUpperCase()}`);
                          }
                        }}
                        className="w-full bg-transparent text-sm font-bold font-mono outline-none text-foreground"
                        placeholder="#000000"
                        maxLength={7}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {/* Start Color Row */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block px-0.5">Start Color</span>
                    <div className="relative flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2 transition-colors focus-within:border-primary/50">
                      <div className="h-7 w-7 rounded border border-border bg-card shrink-0 relative overflow-hidden shadow-sm">
                        <input
                          type="color"
                          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer z-10"
                          value={gradientConfig.startColor === 'transparent' ? '#FFFFFF' : gradientConfig.startColor}
                          onChange={(e) => handleGradientChange({ startColor: e.target.value.toUpperCase() })}
                        />
                        <div className="w-full h-full" style={{ backgroundColor: gradientConfig.startColor === 'transparent' ? 'transparent' : gradientConfig.startColor }}>
                          {gradientConfig.startColor === 'transparent' && <div className="w-full h-full bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNjY2MiLz48cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIi8+PC9zdmc+')] opacity-20" />}
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <input
                          type="text"
                          className="w-full bg-transparent text-xs font-bold font-mono outline-none uppercase text-foreground"
                          value={gradientConfig.startColor}
                          onChange={(e) => handleGradientChange({ startColor: e.target.value })}
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* End Color Row */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block px-0.5">End Color</span>
                    <div className="relative flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2 transition-colors focus-within:border-primary/50">
                      <div className="h-7 w-7 rounded border border-border bg-card shrink-0 relative overflow-hidden shadow-sm">
                        <input
                          type="color"
                          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer z-10"
                          value={gradientConfig.endColor === 'transparent' ? '#FFFFFF' : gradientConfig.endColor}
                          onChange={(e) => handleGradientChange({ endColor: e.target.value.toUpperCase() })}
                        />
                        <div className="w-full h-full" style={{ backgroundColor: gradientConfig.endColor === 'transparent' ? 'transparent' : gradientConfig.endColor }}>
                          {gradientConfig.endColor === 'transparent' && <div className="w-full h-full bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNjY2MiLz48cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIi8+PC9zdmc+')] opacity-20" />}
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <input
                          type="text"
                          className="w-full bg-transparent text-xs font-bold font-mono outline-none uppercase text-foreground"
                          value={gradientConfig.endColor}
                          onChange={(e) => handleGradientChange({ endColor: e.target.value })}
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Angle Row */}
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center px-0.5">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Angle</span>
                      <span className="text-[10px] font-mono bg-muted/50 px-1.5 py-0.5 rounded border border-border font-bold">{gradientConfig.angle}°</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={gradientConfig.angle}
                        onChange={(e) => handleGradientChange({ angle: parseInt(e.target.value) })}
                        className="flex-1 h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                      />
                      <button
                        onClick={() => handleGradientChange({ angle: (gradientConfig.angle + 90) % 360 })}
                        className="p-1.5 hover:bg-muted rounded-lg border border-border transition-all shadow-sm active:scale-90"
                        title="Rotate 90°"
                      >
                        <MoveHorizontal size={14} className="rotate-45 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Presets Grid */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block px-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Presets</span>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.filter(c => c !== 'transparent').map((presetColor) => (
                    <button
                      key={presetColor}
                      type="button"
                      className={cn(
                        "aspect-square w-full rounded-md border border-border/50 ring-offset-background transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 relative group",
                        (tab === 'solid' && typeof fill === 'string' && fill.toUpperCase() === presetColor.toUpperCase()) && "ring-2 ring-primary border-transparent"
                      )}
                      style={{ backgroundColor: presetColor }}
                      onClick={() => {
                        if (tab === 'solid') {
                          handleSolidChange(presetColor.toUpperCase());
                        } else {
                          handleGradientChange({ startColor: presetColor.toUpperCase(), endColor: 'transparent' });
                        }
                      }}
                      title={presetColor}
                    >
                      {(tab === 'solid' && typeof fill === 'string' && fill.toUpperCase() === presetColor.toUpperCase()) && (
                        <Check size={10} className={cn(
                          "absolute inset-0 m-auto",
                          ['#FFFFFF', '#F3F4F6'].includes(presetColor) ? "text-black" : "text-white"
                        )} />
                      )}
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
