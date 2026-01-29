// Sidebar Component - Blueprint loader, ratio selector, color palettes

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/store/contentStudioStore';
import { ElementToolbar } from './ElementToolbar';
import { SupportingBoxesToolbar } from './SupportingBoxesToolbar';
import { ConfirmationDialog } from './ConfirmationDialog';
import { LoadingOverlay } from './LoadingOverlay';

import { CaptionDisplay } from './CaptionDisplay';
import { ExportButton } from './ExportButton';
import { ContentPromptGeneratorDialog } from '@/components/features/content-studio/components/ContentPromptGeneratorDialog';
import { BlueprintImportDialog } from '@/components/features/content-studio/components/BlueprintImportDialog';
import type { Ratio, ColorPalette } from '@/types/contentStudio.types';
import {
  Upload,
  FileJson,
  Ratio as RatioIcon,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

const RATIOS: { value: Ratio; label: string; icon: string }[] = [
  { value: '4:5', label: 'Instagram Feed', icon: '📱' },
  { value: '9:16', label: 'Story / Reels', icon: '📲' },
  { value: '3:4', label: 'Pinterest', icon: '📌' }
];

export function Sidebar() {
  const navigate = useNavigate();
  // const fileInputRef = useRef<HTMLInputElement>(null); // Removed, handled in Dialog
  const [expandedSections, setExpandedSections] = useState({
    ratio: true,
    elements: true,
    supportingBoxes: true,
    captionHashtags: true,
  });

  const [showImportDialog, setShowImportDialog] = useState(false);

  const {
    ratio,
    setRatio,
    loadBlueprint,
    reset,
    slides,
    currentSlideIndex,
    currentBlueprint
  } = useEditorStore();

  // Check if canvas is empty
  const currentSlide = slides[currentSlideIndex];
  const isCanvasEmpty = !currentSlide || currentSlide.elements.length === 0;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const [pendingRatio, setPendingRatio] = useState<Ratio | null>(null);
  const [isChangingLayout, setIsChangingLayout] = useState(false);
  const [loadingRatio, setLoadingRatio] = useState<Ratio | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>(undefined);
  const [pendingReset, setPendingReset] = useState(false);

  const handleImportBlueprint = (json: any) => {
    setLoadingMessage("Lagi Import Blueprint...");
    setIsChangingLayout(true);
    setLoadingRatio(null);

    // Artificial delay for UX
    setTimeout(() => {
      try {
        loadBlueprint(json);
      } catch (error) {
        console.error('Failed to load blueprint:', error);
        alert('Invalid Blueprint Data');
      }

      setTimeout(() => {
        setIsChangingLayout(false);
        setLoadingMessage(undefined);
      }, 1500);
    }, 600);
  };

  const handleResetConfirm = () => {
    setPendingReset(false);
    setLoadingMessage("Lagi Reset Design...");
    setIsChangingLayout(true);

    setTimeout(() => {
      reset(); // Use store reset
      setTimeout(() => {
        setIsChangingLayout(false);
        setLoadingMessage(undefined);
      }, 300); // Reduced for faster reset
    }, 200); // Reduced for faster reset
  };

  const handleRatioConfirm = () => {
    if (!pendingRatio) return;

    setLoadingRatio(pendingRatio);
    setIsChangingLayout(true);
    setPendingRatio(null);

    // Smooth transition delay
    setTimeout(() => {
      setRatio(pendingRatio);
      if (currentBlueprint) {
        setTimeout(() => loadBlueprint(currentBlueprint), 0);
      }

      // Artificial delay for premium feel
      setTimeout(() => {
        setIsChangingLayout(false);
        setLoadingRatio(null);
      }, 3500); // Increased for premium feel transition
    }, 400);
  };

  return (
    <div
      className="min-w-[340px] h-full bg-transparent border-r border-[#ffffff1a] flex flex-col overflow-y-auto custom-scrollbar"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-6 border-b border-[#ffffff1a]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            title="Back to Apps"
            className="flex items-center p-1 -ml-2 bg-transparent border-none text-gray-400 cursor-pointer rounded hover:text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-bold text-white m-0">Content Studio</h2>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-xl">v2.0</span>
      </div>

      {/* AI Tools Section */}
      <div className="px-5 py-4 border-b border-white/[0.08]">
        <ContentPromptGeneratorDialog />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2.5 px-5 py-4 border-b border-white/[0.08]">
        <motion.button
          className="flex-1 flex items-center justify-center gap-2 p-3 h-[42px] bg-blue-800/20 border border-blue-800/40 rounded-lg text-blue-400 cursor-pointer text-[13px] font-medium transition-all hover:bg-blue-800/40 hover:border-blue-800/60 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => setShowImportDialog(true)}
          title="Import Blueprint (JSON)"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Upload size={18} />
          <span>Import</span>
        </motion.button>

        <BlueprintImportDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
          onImport={handleImportBlueprint}
          isLoading={isChangingLayout}
        />

        <ExportButton />
        <button
          className="flex-1 flex items-center justify-center gap-2 p-3 h-[42px] bg-red-700/20 border border-red-700/40 rounded-lg text-red-400 cursor-pointer text-[13px] font-medium transition-all hover:bg-red-700/40 hover:border-red-700/60 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => setPendingReset(true)}
          title={isCanvasEmpty ? "Canvas kosong" : "Reset All"}
          disabled={isCanvasEmpty}
        >
          <Trash2 size={18} />
          <span>Reset</span>
        </button>
      </div>



      {/* Ratio Section */}
      <CollapsibleSection
        title="Aspect Ratio"
        icon={<RatioIcon size={16} />}
        expanded={expandedSections.ratio}
        onToggle={() => toggleSection('ratio')}
      >
        <div className="flex flex-row gap-2.5 px-5 pb-5">
          {RATIOS.map((r) => (
            <motion.button
              key={r.value}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 p-2.5 bg-white/5 border border-white/10 rounded-lg text-white/80 cursor-pointer text-center transition-all hover:bg-white/10 hover:border-white/20",
                ratio === r.value && "bg-blue-500/20 border-blue-500"
              )}
              onClick={() => {
                if (currentBlueprint) {
                  setPendingRatio(r.value);
                } else {
                  setRatio(r.value);
                }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title={r.label}
            >
              <span className="text-lg">{r.icon}</span>
              <span className="text-sm font-semibold text-white">{r.value}</span>
            </motion.button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Elements Section */}
      <CollapsibleSection
        title="Elements"
        icon={<span>✨</span>}
        expanded={expandedSections.elements}
        onToggle={() => toggleSection('elements')}
      >
        <ElementToolbar />
      </CollapsibleSection>

      {/* Supporting Boxes Section */}
      <CollapsibleSection
        title="Supporting Boxes"
        icon={<span>📦</span>}
        expanded={expandedSections.supportingBoxes}
        onToggle={() => toggleSection('supportingBoxes')}
      >
        <SupportingBoxesToolbar />
      </CollapsibleSection>

      {/* Caption & Hashtags Section */}
      <CollapsibleSection
        title="Caption & Hashtags"
        icon={<span>💬</span>}
        expanded={expandedSections.captionHashtags}
        onToggle={() => toggleSection('captionHashtags')}
      >
        <CaptionDisplay />
      </CollapsibleSection>

      <ConfirmationDialog
        isOpen={!!pendingRatio || pendingReset}
        onCancel={() => {
          setPendingRatio(null);
          setPendingReset(false);
        }}
        onConfirm={pendingRatio ? handleRatioConfirm : handleResetConfirm}
        title={pendingReset ? "Reset Desain Total?" : undefined}
        description={pendingReset ? (
          <p>
            Semua design dan perubahan kamu bakal <span className="text-white font-medium">dihapus total</span> dan balik ke awal banget. Yakin mau hapus semua?
          </p>
        ) : undefined}
        confirmLabel={pendingReset ? "Reset Aja" : undefined}
      />

      <LoadingOverlay
        isVisible={isChangingLayout}
        targetRatio={loadingRatio}
        message={loadingMessage}
      />
    </div>
  );
}

function CollapsibleSection({
  title,
  icon,
  expanded,
  onToggle,
  children
}: {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-white/[0.08]">
      <button
        className="flex items-center justify-between w-full px-5 py-[18px] bg-transparent border-none text-white cursor-pointer transition-colors hover:bg-white/5"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 text-base font-semibold">
          {icon}
          <span>{title}</span>
        </div>
        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
