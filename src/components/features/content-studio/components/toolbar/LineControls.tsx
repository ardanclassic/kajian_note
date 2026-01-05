import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Circle,
  Square,
  Diamond,
  Minus,
} from "lucide-react";

interface LineControlsProps {
  lineStart?: string;
  lineEnd?: string;
  onChange: (updates: any) => void;
}

export function LineControls({
  lineStart = 'none',
  lineEnd = 'none',
  onChange
}: LineControlsProps) {
  const [activeMenu, setActiveMenu] = useState<'start' | 'end' | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const MARKERS = [
    { value: 'none', label: 'None', icon: Minus },
    { value: 'arrow', label: 'Arrow', icon: ArrowRight },
    { value: 'circle', label: 'Circle', icon: Circle },
    { value: 'square', label: 'Square', icon: Square },
    { value: 'diamond', label: 'Diamond', icon: Diamond },
  ];

  const renderMarkerMenu = (isStart: boolean) => (
    <div className="absolute top-full left-0 mt-2 w-48 rounded-md border bg-popover p-2 shadow-md z-50">
      <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
        Line {isStart ? 'Start' : 'End'}
      </div>
      <div className="grid grid-cols-3 gap-1">
        {MARKERS.map((marker) => (
          <button
            key={marker.value}
            className={cn(
              "flex flex-col items-center justify-center rounded-sm p-2 text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground gap-1",
              (isStart ? lineStart : lineEnd) === marker.value && "bg-accent text-accent-foreground ring-1 ring-primary"
            )}
            onClick={() => {
              onChange(isStart ? { lineStart: marker.value } : { lineEnd: marker.value });
              setActiveMenu(null);
            }}
            title={marker.label}
          >
            <marker.icon size={16} className={isStart && marker.value === 'arrow' ? "rotate-180" : ""} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex items-center gap-1" ref={wrapperRef}>
      {/* Line Start */}
      <div className="relative">
        <button
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md p-1 hover:bg-accent text-muted-foreground transition-colors",
            activeMenu === 'start' && "bg-accent text-accent-foreground"
          )}
          onClick={() => setActiveMenu(activeMenu === 'start' ? null : 'start')}
          title="Line Start"
        >
          <div className="flex items-center">
            <span className="text-[10px] mr-0.5">├</span>
            <div className="w-3 h-0.5 bg-current" />
          </div>
        </button>
        {activeMenu === 'start' && renderMarkerMenu(true)}
      </div>

      <div className="w-px h-4 bg-border mx-1" />

      {/* Line End */}
      <div className="relative">
        <button
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md p-1 hover:bg-accent text-muted-foreground transition-colors",
            activeMenu === 'end' && "bg-accent text-accent-foreground"
          )}
          onClick={() => setActiveMenu(activeMenu === 'end' ? null : 'end')}
          title="Line End"
        >
          <div className="flex items-center">
            <div className="w-3 h-0.5 bg-current" />
            <span className="text-[10px] ml-0.5">┤</span>
          </div>
        </button>
        {activeMenu === 'end' && renderMarkerMenu(false)}
      </div>
    </div>
  );
}
