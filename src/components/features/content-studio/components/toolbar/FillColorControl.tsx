import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { GradientFill } from "@/types/contentStudio.types";
import { Check } from "lucide-react";

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#FF5733', '#FFC300', '#DAF7A6',
  '#33FF57', '#33FFF5', '#3380FF', '#7D33FF', '#FF33F5',
  'transparent'
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
          className="h-[18px] w-[18px] rounded-full border border-border shadow-sm overflow-hidden"
        >
          {isGradient ? (
            <div className="w-full h-full" style={{
              background: `linear-gradient(${(fill as GradientFill).angle}deg, ${(fill as GradientFill).startColor}, ${(fill as GradientFill).endColor})`
            }} />
          ) : (
            <div className="w-full h-full" style={{ backgroundColor: fill as string }} />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[280px] rounded-md border bg-popover p-3 shadow-md z-50">

          {/* Tabs */}
          <div className="flex w-full mb-3 border-b">
            <button
              className={cn("flex-1 pb-2 text-sm font-medium border-b-2", tab === 'solid' ? "border-primary text-primary" : "border-transparent text-muted-foreground")}
              onClick={() => {
                setTab('solid');
                // Revert to a solid color if switching back (e.g. start color of gradient)
                if (isGradient) handleSolidChange(gradientConfig.startColor);
              }}
            >
              Solid
            </button>
            <button
              className={cn("flex-1 pb-2 text-sm font-medium border-b-2", tab === 'gradient' ? "border-primary text-primary" : "border-transparent text-muted-foreground")}
              onClick={() => {
                setTab('gradient');
                onChange(gradientConfig);
              }}
            >
              Gradient
            </button>
          </div>

          <div className="space-y-3">

            {tab === 'solid' ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground w-16">Color</span>
                  <div className="flex-1 flex items-center justify-end gap-2">
                    {/* Native Picker */}
                    <div className="relative w-full h-8 rounded border flex items-center px-2 bg-accent/20">
                      <span className="text-xs flex-1 truncate">{(fill as string) || 'Transparent'}</span>
                      <input
                        type="color"
                        value={typeof fill === 'string' && fill !== 'transparent' ? fill : '#ffffff'}
                        onChange={(e) => handleSolidChange(e.target.value)}
                        className="h-6 w-6 cursor-pointer rounded border-none p-0 opacity-0 absolute inset-0"
                      />
                      <div className="h-4 w-4 rounded-full border shadow-sm pointer-events-none" style={{ background: fill as string }} />
                    </div>
                    <button
                      className={cn("p-1.5 rounded border hover:bg-accent", fill === 'transparent' && "bg-accent")}
                      title="Transparent"
                      onClick={() => handleSolidChange('transparent')}
                    >
                      <div className="w-4 h-4 rounded-sm border relative overflow-hidden">
                        <div className="absolute inset-0 bg-white" />
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNjY2MiLz48cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIi8+PC9zdmc+')] opacity-40" />
                      </div>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Start Color */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-12">Start</span>
                  <div className="flex-1 flex items-center gap-1">
                    <input
                      type="color"
                      className="h-6 w-6 rounded cursor-pointer border-none p-0"
                      value={gradientConfig.startColor === 'transparent' ? '#ffffff' : gradientConfig.startColor}
                      onChange={(e) => handleGradientChange({ startColor: e.target.value })}
                    />
                    <button
                      onClick={() => handleGradientChange({ startColor: 'transparent' })}
                      className={cn("text-[10px] px-1.5 py-0.5 border rounded hover:bg-accent", gradientConfig.startColor === 'transparent' ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                    >
                      Transp.
                    </button>
                  </div>
                </div>

                {/* End Color */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-12">End</span>
                  <div className="flex-1 flex items-center gap-1">
                    <input
                      type="color"
                      className="h-6 w-6 rounded cursor-pointer border-none p-0"
                      value={gradientConfig.endColor === 'transparent' ? '#ffffff' : gradientConfig.endColor}
                      onChange={(e) => handleGradientChange({ endColor: e.target.value })}
                    />
                    <button
                      onClick={() => handleGradientChange({ endColor: 'transparent' })}
                      className={cn("text-[10px] px-1.5 py-0.5 border rounded hover:bg-accent", gradientConfig.endColor === 'transparent' ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                    >
                      Transp.
                    </button>
                  </div>
                </div>

                {/* Angle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-12">Angle</span>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={gradientConfig.angle}
                    onChange={(e) => handleGradientChange({ angle: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs w-8 text-right">{gradientConfig.angle}°</span>
                </div>
              </>
            )}

            {/* Presets Grid */}
            <div className="grid grid-cols-5 gap-2 pt-2 border-t">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className="aspect-square w-full rounded-full border border-gray-200 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 relative overflow-hidden"
                  style={{ backgroundColor: color === 'transparent' ? 'transparent' : color }}
                  onClick={() => {
                    if (tab === 'solid') {
                      handleSolidChange(color);
                    } else {
                      // For gradient, applying a preset sets the end color, or creates a simple gradient? 
                      // Let's make it set the 'End' color for fun, or maybe set both to make it 'almost' solid but gradient
                      // Better: Set Start=Color, End=Transparent (common usecase)
                      handleGradientChange({ startColor: color, endColor: 'transparent' });
                    }
                  }}
                  title={color}
                >
                  {color === 'transparent' && (
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNjY2MiLz48cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIi8+PC9zdmc+')] opacity-40" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
