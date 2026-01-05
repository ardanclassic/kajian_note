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

export function Editor() {
  useKeyboardShortcuts();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="relative flex w-screen h-screen overflow-hidden bg-black text-white font-sans">
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
    </div>
  );
}

export default Editor;
