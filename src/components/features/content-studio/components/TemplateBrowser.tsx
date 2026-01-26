import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAvailableContentTypes,
  getAvailableImageLayouts,
  composeTemplate,
  extractContentFromSlide
} from '@/utils/contentStudio/templateUtils';
import { useEditorStore, DEFAULT_COLOR_PALETTE } from '@/store/contentStudioStore';
import {
  LayoutTemplate,
  Type,
  Check
} from 'lucide-react';
import { cn } from "@/lib/utils";

export function TemplateBrowser() {
  const {
    currentSlideIndex,
    slides,
    ratio,
    updateSlide
  } = useEditorStore();

  const colorPalette = DEFAULT_COLOR_PALETTE;

  const [activeTab, setActiveTab] = useState<'content' | 'layout'>('content');
  const [selectedContentType, setSelectedContentType] = useState<string>('paragraph');
  const [selectedImageLayout, setSelectedImageLayout] = useState<string>('header_illustration');

  const contentTypes = getAvailableContentTypes();
  const imageLayouts = getAvailableImageLayouts();

  const applyTemplate = (cId: string, lId: string) => {
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide) return;

    // Extract existing content to preserve it
    const contentData = extractContentFromSlide(currentSlide.elements);

    // Generate new elements
    const newElements = composeTemplate({
      contentTypeId: cId,
      imageLayoutId: lId,
      ratio,
      palette: colorPalette,
      contentData
    });

    // Update slide
    updateSlide(currentSlideIndex, { elements: newElements });
  };

  const handleContentSelect = (id: string) => {
    setSelectedContentType(id);
    applyTemplate(id, selectedImageLayout);
  };

  const handleLayoutSelect = (id: string) => {
    setSelectedImageLayout(id);
    applyTemplate(selectedContentType, id);
  };

  const getLayoutPreviewClass = (id: string) => {
    const base = "w-full h-full relative before:absolute before:bg-blue-500/50";
    switch (id) {
      case 'header_illustration': return `${base} before:top-0 before:left-0 before:right-0 before:h-[30%]`;
      case 'bottom_illustration': return `${base} before:bottom-0 before:left-0 before:right-0 before:h-[30%]`;
      case 'side_illustration': return `${base} before:top-0 before:right-0 before:bottom-0 before:w-[40%]`;
      case 'split_screen': return `${base} before:top-0 before:left-0 before:right-0 before:h-[50%]`;
      case 'background_image': return `w-full h-full relative before:absolute before:inset-0 before:bg-blue-500/30`;
      case 'center_focal_illustration': return `${base} before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-[40%] before:h-[40%] before:rounded-full`;
      case 'floating_illustration': return `${base} before:top-[10%] before:right-[10%] before:w-[30%] before:h-[30%] before:rounded-full`;
      default: return base;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 px-4 py-2 border-b border-white/10">
        <button
          className={cn(
            "flex-1 flex items-center justify-center gap-2 p-2 bg-transparent border-none text-white/50 cursor-pointer rounded-lg transition-all text-[13px] font-medium hover:bg-white/5 hover:text-white/80",
            activeTab === 'content' && "bg-blue-500/15 text-blue-500 hover:bg-blue-500/20 hover:text-blue-500"
          )}
          onClick={() => setActiveTab('content')}
        >
          <Type size={16} />
          <span>Content</span>
        </button>
        <button
          className={cn(
            "flex-1 flex items-center justify-center gap-2 p-2 bg-transparent border-none text-white/50 cursor-pointer rounded-lg transition-all text-[13px] font-medium hover:bg-white/5 hover:text-white/80",
            activeTab === 'layout' && "bg-blue-500/15 text-blue-500 hover:bg-blue-500/20 hover:text-blue-500"
          )}
          onClick={() => setActiveTab('layout')}
        >
          <LayoutTemplate size={16} />
          <span>Layout</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'content' ? (
            <motion.div
              key="content-list"
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {contentTypes.map((type) => (
                <button
                  key={type.id}
                  className={cn(
                    "relative flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer transition-all text-center hover:bg-white/10 hover:border-white/20",
                    selectedContentType === type.id && "bg-blue-500/10 border-blue-500 hover:bg-blue-500/20"
                  )}
                  onClick={() => handleContentSelect(type.id)}
                >
                  <div className="w-full h-[60px] bg-black/20 rounded overflow-hidden p-2 flex flex-col gap-1 relative">
                    {/* Simplified visual representation */}
                    <div className="h-1 w-[70%] bg-white/40 rounded-sm mb-1 self-center"></div>
                    <div className="h-1 w-full bg-white/20 rounded-sm"></div>
                    <div className="h-1 w-full bg-white/20 rounded-sm"></div>
                  </div>
                  <span className="text-[11px] text-white/70 leading-tight">{type.label}</span>
                  {selectedContentType === type.id && (
                    <div className="absolute top-2 right-2 p-[1px] bg-black/50 rounded-full text-blue-500">
                      <Check size={14} />
                    </div>
                  )}
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="layout-list"
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {imageLayouts.map((layout) => (
                <button
                  key={layout.id}
                  className={cn(
                    "relative flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer transition-all text-center hover:bg-white/10 hover:border-white/20",
                    selectedImageLayout === layout.id && "bg-blue-500/10 border-blue-500 hover:bg-blue-500/20"
                  )}
                  onClick={() => handleLayoutSelect(layout.id)}
                >
                  <div className="w-full h-[60px] bg-black/20 rounded overflow-hidden relative flex items-center justify-center">
                    {/* Simplified visual representation of layout */}
                    <div className={getLayoutPreviewClass(layout.id)}></div>
                  </div>
                  <span className="text-[11px] text-white/70 leading-tight">{layout.label}</span>
                  {selectedImageLayout === layout.id && (
                    <div className="absolute top-2 right-2 p-[1px] bg-black/50 rounded-full text-blue-500">
                      <Check size={14} />
                    </div>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
