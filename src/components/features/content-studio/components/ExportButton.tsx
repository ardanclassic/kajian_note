// Export Button - Download slides as images

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Image as ImageIcon, FileArchive, Check, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

import { useEditorStore } from '@/store/contentStudioStore';

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExportCurrent = async () => {
    setIsExporting(true);
    setShowMenu(false);

    try {
      const { slides, currentSlideIndex } = useEditorStore.getState();
      const currentSlide = slides[currentSlideIndex];

      if (!currentSlide) throw new Error("No active slide");

      // Setup completion listener
      const handleCompletion = (e: CustomEvent) => {
        if (e.detail.success) {
          setExportSuccess(true);
          setTimeout(() => setExportSuccess(false), 2000);
        } else {
          console.error("Export error:", e.detail.error);
          alert('Export failed. Please try again.');
        }
        setIsExporting(false);
        window.removeEventListener('export-completed', handleCompletion as EventListener);
      };

      window.addEventListener('export-completed', handleCompletion as EventListener);

      // Trigger export via event (handled by useCanvas hook)
      window.dispatchEvent(new CustomEvent('CONTENT_STUDIO_EXPORT_SLIDE', {
        detail: {
          slideId: currentSlide.id,
          scale: 3 // Requested 3x Upscale (Best Practice)
        }
      }));

    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      alert('Export failed. Please try again.');
    }
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    setShowMenu(false);

    try {
      // Note: This is a simplified version
      // In production, you'd need to render each slide to canvas first
      alert('Export All feature requires rendering all slides. This will be implemented with proper slide rendering.');

      setIsExporting(false);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      alert('Export failed. Please try again.');
    }
  };

  return (
    <div className="relative">
      <motion.button
        className={cn(
          "flex items-center justify-center gap-2 p-3 h-[42px] bg-green-600/20 border border-green-600/40 rounded-lg text-green-400 text-[13px] font-medium cursor-pointer transition-all w-full hover:bg-green-600/40 hover:border-green-600/60 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed",
          exportSuccess && "bg-gradient-to-br from-blue-500 to-blue-600 border-none text-white shadow-lg"
        )}
        onClick={() => setShowMenu(!showMenu)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={isExporting}
      >
        {isExporting ? (
          <Loader2 size={18} className="animate-spin" />
        ) : exportSuccess ? (
          <Check size={18} />
        ) : (
          <Download size={18} />
        )}
        <span>
          {isExporting ? 'Exporting...' : exportSuccess ? 'Exported!' : 'Export'}
        </span>
      </motion.button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            className="absolute top-[calc(100%+8px)] right-0 bg-[#1a1a2e]/95 backdrop-blur-md border border-white/10 rounded-[10px] p-2 min-w-[200px] shadow-xl z-[1000] flex flex-col gap-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <button
              onClick={handleExportCurrent}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 bg-transparent border-none rounded-md text-white/80 text-[13px] font-medium cursor-pointer transition-all text-left hover:bg-white/10 hover:text-white"
            >
              <ImageIcon size={16} />
              <span>Current Slide</span>
            </button>
            <button
              onClick={handleExportAll}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 bg-transparent border-none rounded-md text-white/80 text-[13px] font-medium cursor-pointer transition-all text-left hover:bg-white/10 hover:text-white"
            >
              <FileArchive size={16} />
              <span>All Slides (ZIP)</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
