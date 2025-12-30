// Slide Navigator - Thumbnails, add/remove/reorder slides

import { useState } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/store/contentStudioStore';
import {
  Plus,
  Trash2,
  Copy,
  LayoutTemplate,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { cn } from "@/lib/utils";

export function SlideNavigator() {
  const {
    slides,
    currentSlideIndex,
    setCurrentSlide,
    addSlide,
    removeSlide,
    reorderSlides
  } = useEditorStore();


  const handleReorder = (newOrder: typeof slides) => {
    const currentSlideId = slides[currentSlideIndex].id;
    const oldIndex = slides.findIndex(s => s.id === currentSlideId);
    const newIndex = newOrder.findIndex(s => s.id === currentSlideId);

    if (oldIndex !== newIndex) {
      reorderSlides(oldIndex, newIndex);
    }
  };

  const duplicateSlide = (index: number) => {
    const slide = slides[index];
    // Duplicate (add new slide)
    addSlide();
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-black border-t border-white/10 z-20 relative">
      {/* Slides Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-2">
        <Reorder.Group
          axis="x"
          values={slides}
          onReorder={handleReorder}
          className="flex gap-3 list-none m-0 p-1"
        >
          {slides.map((slide, index) => (
            <Reorder.Item
              key={slide.id}
              value={slide}
              className={cn(
                "relative shrink-0 cursor-grab active:cursor-grabbing group",
                index === currentSlideIndex && "active" // State indicator for logic if needed elsewhere, but visual is handled via cn below
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={cn(
                  "relative w-20 h-[100px] bg-white/20 border-2 border-transparent rounded-lg overflow-hidden cursor-pointer transition-all",
                  "group-hover:border-white/50",
                  index === currentSlideIndex && "border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.5)] group-hover:border-blue-500"
                )}
                onClick={() => setCurrentSlide(index)}
              >
                {/* Thumbnail preview placeholder */}
                <div
                  className="flex items-center justify-center w-full h-full text-white/50"
                  style={{ backgroundColor: slide.backgroundColor }}
                >
                  <FileText size={20} />
                </div>

                {/* Slide number */}
                <div className="absolute top-1 left-1 text-[10px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded">
                  {index + 1}
                </div>

                {/* Slide type badge */}
                {/* 
                <div className={cn(
                  "absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded text-white/80 bg-black/50",
                  "text-blue-400 bg-blue-500/30" // Default content style
                )}>
                  CONTENT
                </div> 
                */}

              </div>

              {/* Actions (visible on hover) */}
              <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateSlide(index);
                  }}
                  title="Duplicate"
                  className="flex items-center justify-center w-6 h-6 bg-[#2a2a2a] border border-white/10 rounded-md text-white/60 cursor-pointer transition-colors hover:bg-white/20 hover:text-white"
                >
                  <Copy size={14} />
                </button>
                {slides.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSlide(index);
                    }}
                    className="flex items-center justify-center w-6 h-6 bg-[#2a2a2a] border border-white/10 rounded-md text-white/60 cursor-pointer transition-colors hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      {/* Add Slide Button */}
      <div className="relative">
        <motion.button
          className="flex items-center justify-center w-12 h-[60px] bg-blue-500/15 border-2 border-dashed border-blue-500/40 rounded-lg text-blue-400 cursor-pointer transition-all hover:bg-blue-500/25 hover:border-blue-500/60"
          onClick={() => addSlide()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
        </motion.button>
      </div>
    </div>
  );
}
