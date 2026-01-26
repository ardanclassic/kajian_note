/**
 * Editor Component
 * 
 * The main layout container for the Content Studio.
 * Orchestrates the Sidebar, TopToolbar, and the main CanvasEditor workspace.
 * Manages the collapsible sidebar state.
 */

import { motion } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { CanvasEditor } from './CanvasEditor';
import { TopToolbar } from './components/TopToolbar';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { ImageCropper } from './components/ImageCropper';
import { DragDropOverlay } from './components/DragDropOverlay';
import { LoadingOverlay } from './components/LoadingOverlay';
import { useEditorStore } from '@/store/contentStudioStore';
import { RATIO_DIMENSIONS } from '@/types/contentStudio.types';
import { v4 as uuidv4 } from 'uuid';
import type { ImageElement } from '@/types/contentStudio.types';

export function Editor() {
  useKeyboardShortcuts();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { addElement, loadBlueprint, ratio } = useEditorStore();

  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'image' | 'blueprint' | 'invalid' | null>(null);

  // Loading state for blueprint import
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>(undefined);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isDragging) {
      setIsDragging(true);
      const items = Array.from(e.dataTransfer.items);
      const hasImage = items.some(item => item.type.startsWith('image/'));
      // Loose check for JSON as type is not always reliable during drag
      const hasFile = items.some(item => item.kind === 'file');

      if (hasImage) {
        setDragType('image');
      } else if (hasFile) {
        setDragType('blueprint');
      } else {
        setDragType('invalid');
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if we are really leaving the window
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;

    setIsDragging(false);
    setDragType(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragType(null);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const dimensions = RATIO_DIMENSIONS[ratio];
          const element: ImageElement = {
            id: uuidv4(),
            type: 'image',
            position: {
              x: dimensions.width / 2 - img.naturalWidth / 2,
              y: dimensions.height / 2 - img.naturalHeight / 2
            },
            size: { width: img.naturalWidth, height: img.naturalHeight },
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            zIndex: 0,
            src,
            scaleX: 1,
            scaleY: 1
          };
          addElement(element);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    } else if (file.name.endsWith('.json') || file.type === 'application/json') {
      // Start loading state
      setLoadingMessage("Lagi Import Blueprint...");
      setIsLoading(true);

      const reader = new FileReader();
      reader.onload = (event) => {
        // Artificial delay for UX (matching Sidebar behavior)
        setTimeout(() => {
          try {
            const json = JSON.parse(event.target?.result as string);
            loadBlueprint(json);
          } catch (err) {
            console.error('Failed to load blueprint', err);
          }

          // Artificial delay for premium feel
          setTimeout(() => {
            setIsLoading(false);
            setLoadingMessage(undefined);
          }, 3500);
        }, 600);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div
      className="relative flex w-screen h-screen overflow-hidden bg-black text-white font-sans"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Collapsible Sidebar Container */}
      <div className="relative flex h-full z-10">
        <motion.div
          className="overflow-hidden bg-[#0a0a0a] border-right border-white/10"
          initial={false}
          animate={{ width: isSidebarOpen ? 400 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="w-[400px] h-full">
            <Sidebar />
          </div>
        </motion.div>

        <button
          className="absolute right-[-24px] top-1/2 -translate-y-1/2 w-6 h-12 bg-[#0a0a0a] border border-l-0 border-white/10 rounded-r-lg flex items-center justify-center color-gray-400 cursor-pointer z-20 transition-all hover:bg-white/5 hover:text-white"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Main Workspace: Toolbar + Canvas */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <TopToolbar />

        {/* Canvas Scrollable Area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <CanvasEditor />
        </div>
      </div>
      <ImageCropper />
      <DragDropOverlay isDragging={isDragging} dragType={dragType} />
      <LoadingOverlay isVisible={isLoading} message={loadingMessage} targetRatio={null} />
    </div>
  );
}

export default Editor;
