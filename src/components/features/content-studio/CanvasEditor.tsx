import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEditorStore } from '@/store/contentStudioStore';
import { useCanvas } from './hooks/useCanvas';
import { RATIO_DIMENSIONS, DISPLAY_DIMENSIONS } from '@/types/contentStudio.types';
import {
  Plus, Grid, Monitor, ChevronDown, ChevronUp,
  Trash2, Copy, Eye, EyeOff, Undo2, Redo2
} from 'lucide-react';
import type { Ratio } from '@/types/contentStudio.types';
import { cn } from "@/lib/utils";

interface SlideCanvasProps {
  slide: any; // Ideally this should be the specific Slide type
  index: number;
  totalSlides: number;
  zoomLevel: number;
  ratio: Ratio;
  isActive: boolean;
  onRemove: () => void;
  onDuplicate: () => void;
  onInsertAfter: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpdate: (updates: any) => void;
}

/**
 * SlideCanvas
 * 
 * Represents a single slide's canvas rendering context within the editor list.
 * Wraps the `useCanvas` hook to initialize Fabric.js for this specific slide.
 * Handles the slide's "frame" UI controls (title, move up/down, delete, etc).
 */
const SlideCanvas = ({
  slide, index, totalSlides, zoomLevel, ratio, isActive,
  onRemove, onDuplicate, onInsertAfter, onMoveUp, onMoveDown, onUpdate
}: SlideCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const canvasId = `slide-canvas-${slide.id}`;

  const displayDimensions = DISPLAY_DIMENSIONS[ratio];
  const scaledWidth = (displayDimensions.width * zoomLevel) / 100;

  // Icon settings for better visibility
  const iconSize = 18;
  const iconStrokeWidth = 2;

  // Initialize canvas management hook for this specific slide
  useCanvas(
    containerRef,
    { ratio, zoom: zoomLevel },
    canvasElRef,
    slide,  // Directly pass slide data to ensure hook has latest state
    index   // Index needed for active slide checks
  );

  /**
   * Layout Reflow Fix:
   * When slides are reordered, the container might not naturally reflow its height
   * correctly in some browser engines. This forces a reflow to ensure the layout
   * stays robust.
   */
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const currentHeight = container.style.height;
      container.style.height = 'auto';
      void container.offsetHeight; // Trigger Reflow
      container.style.height = currentHeight;
    }
  }, [index, slide.id]);

  return (
    <div
      className={cn(
        "flex flex-col items-center slide-wrapper-outer",
        isActive && "active-slide"
      )}
      data-index={index}
    >

      {/* SLIDE CONTROL TOOLBAR */}
      <div
        className="flex items-center justify-between px-1 py-2 mb-1.5 text-white text-sm opacity-100 box-border"
        style={{ width: scaledWidth }}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white whitespace-nowrap drop-shadow-md">
            Page {index + 1}
          </span>
          <span className="w-px h-4 bg-white/10 mx-1"></span>
          <input
            className="bg-transparent border-none text-white text-sm font-inherit w-[180px] drop-shadow-md focus:outline-none focus:text-white focus:border-b focus:border-gray-500 placeholder:text-gray-400 placeholder:italic"
            value={slide.title || ''}
            placeholder="Add page title"
            onChange={(e) => onUpdate({ title: e.target.value })}
            // Stops canvas keyboard shortcuts when typing
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            className="bg-transparent border-none text-gray-300 cursor-pointer p-1.5 rounded flex items-center justify-center transition-all hover:text-white hover:bg-white/15 hover:-translate-y-px active:translate-y-0 disabled:opacity-30 disabled:cursor-default disabled:transform-none"
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            disabled={index === 0}
            title="Move Up"
          >
            <ChevronUp size={iconSize} strokeWidth={iconStrokeWidth} />
          </button>
          <button
            className="bg-transparent border-none text-gray-300 cursor-pointer p-1.5 rounded flex items-center justify-center transition-all hover:text-white hover:bg-white/15 hover:-translate-y-px active:translate-y-0 disabled:opacity-30 disabled:cursor-default disabled:transform-none"
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            disabled={index === totalSlides - 1}
            title="Move Down"
          >
            <ChevronDown size={iconSize} strokeWidth={iconStrokeWidth} />
          </button>
          <button
            className="bg-transparent border-none text-gray-300 cursor-pointer p-1.5 rounded flex items-center justify-center transition-all hover:text-white hover:bg-white/15 hover:-translate-y-px active:translate-y-0 disabled:opacity-30 disabled:cursor-default disabled:transform-none"
            onClick={(e) => { e.stopPropagation(); onUpdate({ isHidden: !slide.isHidden }); }}
            title={slide.isHidden ? "Show Page" : "Hide Page"}
          >
            {slide.isHidden ? <EyeOff size={iconSize} strokeWidth={iconStrokeWidth} /> : <Eye size={iconSize} strokeWidth={iconStrokeWidth} />}
          </button>
          <button
            className="bg-transparent border-none text-gray-300 cursor-pointer p-1.5 rounded flex items-center justify-center transition-all hover:text-white hover:bg-white/15 hover:-translate-y-px active:translate-y-0 disabled:opacity-30 disabled:cursor-default disabled:transform-none"
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            title="Duplicate Page"
          >
            <Copy size={iconSize} strokeWidth={iconStrokeWidth} />
          </button>
          <button
            className="bg-transparent border-none text-gray-300 cursor-pointer p-1.5 rounded flex items-center justify-center transition-all hover:text-red-500 hover:bg-red-500/15 hover:-translate-y-px active:translate-y-0 disabled:opacity-30 disabled:cursor-default disabled:transform-none"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            title="Delete Page"
            disabled={totalSlides <= 1}
          >
            <Trash2 size={iconSize} strokeWidth={iconStrokeWidth} />
          </button>
          <button
            className="bg-transparent border-none text-gray-300 cursor-pointer p-1.5 rounded flex items-center justify-center transition-all hover:text-white hover:bg-white/15 hover:-translate-y-px active:translate-y-0 disabled:opacity-30 disabled:cursor-default disabled:transform-none"
            onClick={(e) => { e.stopPropagation(); onInsertAfter(); }}
            title="Add Page Below"
          >
            <Plus size={iconSize} strokeWidth={iconStrokeWidth} />
          </button>
        </div>
      </div>

      <div
        key={`canvas-container-${slide.id}-${index}`}
        ref={containerRef}
        className={cn(
          "bg-white rounded",
          "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3),0_10px_20px_-2px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.1)]",
          isActive && "shadow-[0_0_0_2px_#3B82F6,0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)]"
        )}
        style={{
          width: scaledWidth,
          height: (displayDimensions.height * zoomLevel) / 100,
          marginBottom: '40px',
          opacity: slide.isHidden ? 0.5 : 1,
          position: 'relative',
          overflow: 'visible'
        }}
      >
        <canvas
          ref={canvasElRef}
          id={canvasId}
          style={{
            width: '100%',
            height: '100%',
            display: 'block'
          }}
        />
        {/* Overlay for Hidden Page */}
        {slide.isHidden && (
          <div className="absolute top-0 left-0 w-full h-full bg-black/5 flex items-center justify-center pointer-events-none">
            <EyeOff size={48} className="text-black/20" />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * CanvasEditor
 * 
 * The central workspace component that renders the list of slides.
 * Manages global editor interactions including:
 * - Scroll synchronization (Scroll Spy)
 * - Global keyboard shortcuts (Delete, Arrows)
 * - Browser zoom override (Ctrl+Scroll)
 */
export function CanvasEditor() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const {
    ratio,
    zoomLevel,
    setZoom,
    currentSlideIndex,
    slides,
    addSlide,
    insertSlide,
    duplicateSlide,
    updateSlide,
    removeSlide,
    reorderSlides,
    selectElement,
    updateElements,
    removeElements,
    selectedElementIds,
    setCurrentSlide,
    undo,
    redo
  } = useEditorStore();

  const dimensions = RATIO_DIMENSIONS[ratio];

  /**
   * Browser Zoom Override:
   * Intercepts Ctrl+Wheel events to zoom the CANVAS instead of the browser page.
   * This provides a more native app-like experience.
   */
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const preventBrowserZoom = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        const delta = e.deltaY;
        const currentZoom = zoomLevel;
        const zoomStep = 5;
        let newZoom = delta < 0 ? currentZoom + zoomStep : currentZoom - zoomStep;
        newZoom = Math.max(25, Math.min(200, newZoom));
        setZoom(newZoom);
      }
    };

    viewport.addEventListener('wheel', preventBrowserZoom, { passive: false, capture: true });
    return () => viewport.removeEventListener('wheel', preventBrowserZoom, { capture: true } as any);
  }, [zoomLevel, setZoom]);

  /**
   * Global Keyboard Shortcuts:
   * - Delete/Backspace: Remove selected elements
   * - Arrow Keys: Nudge selected elements (Shift + Arrow for larger steps)
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      // Ignore if user is typing in an input text field
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementIds.length > 0) {
          removeElements(selectedElementIds);
        }
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        // Prevent default scrolling for up/down keys
        if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
          e.preventDefault();
        }

        const step = e.shiftKey ? 10 : 1;
        const currentSlide = slides[currentSlideIndex];

        if (selectedElementIds.length > 0) {
          const updates = selectedElementIds.map(id => {
            const el = currentSlide.elements.find(e => e.id === id);
            if (!el) return null;
            let newX = el.position.x;
            let newY = el.position.y;
            if (e.key === 'ArrowLeft') newX -= step;
            if (e.key === 'ArrowRight') newX += step;
            if (e.key === 'ArrowUp') newY -= step;
            if (e.key === 'ArrowDown') newY += step;
            return { id, changes: { position: { x: newX, y: newY } } };
          }).filter(Boolean);
          if (updates.length > 0) {
            useEditorStore.getState().updateElements(updates as any);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementIds, currentSlideIndex, slides, removeElements]);


  const scrollToSlide = (index: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    setTimeout(() => {
      const slideElements = viewport.getElementsByClassName('slide-wrapper-outer');
      const target = slideElements[index] as HTMLElement;
      if (target) {
        // Enable smooth scrolling
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  /**
   * Scroll Spy:
   * Detects which slide is currently most visible in the viewport and updates 
   * the `currentSlideIndex` in the store. This allows the sidebar and tools 
   * to contextually update based on what the user is looking at.
   */
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let timeoutId: any;
    const handleScroll = () => {
      // Throttle scroll events
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        const viewportRect = viewport.getBoundingClientRect();
        // Check center of viewport
        const centerY = viewportRect.top + viewportRect.height / 2;

        const slideElements = viewport.getElementsByClassName('slide-wrapper-outer');
        let foundIndex = -1;

        for (let i = 0; i < slideElements.length; i++) {
          const el = slideElements[i] as HTMLElement;
          const rect = el.getBoundingClientRect();

          // If slide covers the center point
          if (rect.top <= centerY && rect.bottom >= centerY) {
            foundIndex = i;
            break;
          }
        }

        // If found and different from current, update
        const currentIndex = useEditorStore.getState().currentSlideIndex;
        if (foundIndex !== -1 && foundIndex !== currentIndex) {
          setCurrentSlide(foundIndex);
        }

        timeoutId = null;
      }, 100); // Check every 100ms
    };

    viewport.addEventListener('scroll', handleScroll, { passive: true });
    // Also run once on mount
    handleScroll();

    return () => {
      viewport.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []); // Run once on mount


  return (
    <div className="flex flex-1 flex-col h-full bg-black relative">

      {/* Main Scrollable Viewport */}
      <div
        ref={viewportRef}
        className="flex-1 flex flex-col items-start overflow-auto pt-[120px] bg-[#050505] custom-scrollbar"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #1a1a1a 10%, transparent 10%),
            linear-gradient(-45deg, #1a1a1a 10%, transparent 10%),
            linear-gradient(45deg, transparent 90%, #1a1a1a 90%),
            linear-gradient(-45deg, transparent 90%, #1a1a1a 90%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}
        onClick={(e) => {
          if (e.target === viewportRef.current) {
            selectElement(null);
          }
        }}
      >
        <div
          className="flex flex-col items-center w-auto mx-auto pb-[100px] min-w-min"
        >
          {slides.map((slide, index) => (
            <SlideCanvas
              key={slide.id} // STABLE KEY: Prevent remounting to avoid Fabric.js dispose bugs
              slide={slide}
              index={index}
              totalSlides={slides.length}
              zoomLevel={zoomLevel}
              ratio={ratio}
              isActive={index === currentSlideIndex}

              /* Pass Actions */
              onRemove={() => removeSlide(index)}
              onDuplicate={() => {
                duplicateSlide(index);
                scrollToSlide(index + 1);
              }}
              onInsertAfter={() => {
                insertSlide(index);
                scrollToSlide(index + 1);
              }}
              onMoveUp={() => {
                if (index > 0) {
                  reorderSlides(index, index - 1);
                  scrollToSlide(index - 1);
                }
              }}
              onMoveDown={() => {
                if (index < slides.length - 1) {
                  reorderSlides(index, index + 1);
                  scrollToSlide(index + 1);
                }
              }}
              onUpdate={(updates) => updateSlide(index, updates)}
            />
          ))}

          {/* Add Page Button */}
          <motion.button
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-lg text-white cursor-pointer mt-5 text-sm font-medium w-[400px] hover:bg-white/10"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => addSlide()}
          >
            <Plus size={16} />
            Add page
          </motion.button>

          {/* Spacer for bottom bar */}
          <div className="h-[60px]"></div>
        </div>
      </div>

      {/* Footer */}
      <div className="h-12 bg-black border-t border-white/10 flex items-center justify-between px-5 text-white text-[13px] z-10 relative">
        <div className="flex items-center gap-4">
          <button
            className="bg-transparent border-none text-gray-400 cursor-pointer p-1 flex items-center justify-center hover:text-white"
            onClick={undo}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            className="bg-transparent border-none text-gray-400 cursor-pointer p-1 flex items-center justify-center hover:text-white"
            onClick={redo}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={16} />
          </button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="25"
              max="200"
              value={zoomLevel}
              onChange={(e) => setZoom(parseInt(e.target.value))}
              className="w-[100px] h-1 bg-white/20 rounded-sm appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
            <span className="min-w-[40px] text-right">{zoomLevel}%</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="page-count">
            {/* Clamp Logic for Bug Fix */}
            Page {Math.min(currentSlideIndex + 1, slides.length || 1)} / {slides.length}
          </div>
        </div>
      </div>
    </div>
  );
}