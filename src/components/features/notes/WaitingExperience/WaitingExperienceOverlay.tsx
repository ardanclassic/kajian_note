/**
 * WaitingExperienceOverlay Component - UPDATED
 * Fullscreen overlay with mode selection during YouTube import
 *
 * PATH: src/components/features/notes/WaitingExperience/WaitingExperienceOverlay.tsx
 *
 * UPDATED FLOW:
 * 1. Mode Selector (Story/Quiz/Wait)
 * 2. Category Selector (if Story or Quiz selected)
 * 3. Content (StoryMode or QuizMode with selected category)
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Brain, Loader2, CheckCircle2, Sparkles, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import CatLoading from "@/components/common/CatLoading";
import { ContentSelector } from "./ContentSelector";
import { StoryMode } from "./StoryMode";
import { QuizMode } from "./QuizMode";

// ============================================
// TYPES
// ============================================

type WaitingMode = "selector" | "story-list" | "quiz-category" | "story" | "quiz" | "wait";

interface WaitingExperienceOverlayProps {
  open: boolean;
  onClose: () => void;
  isComplete: boolean;
  onViewResult: () => void;
}

// ============================================
// ANIMATION VARIANTS
// ============================================

const overlayVariants: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const containerVariants: any = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const cardVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
  hover: {
    scale: 1.02,
    y: -4,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.98,
  },
};

const completionVariants: any = {
  hidden: { opacity: 0, y: -50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    y: -50,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

// ============================================
// COMPONENT
// ============================================

export function WaitingExperienceOverlay({ open, onClose, isComplete, onViewResult }: WaitingExperienceOverlayProps) {
  const [currentMode, setCurrentMode] = useState<WaitingMode>("selector");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStoryId, setSelectedStoryId] = useState<string>("");
  const [showCompletion, setShowCompletion] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Show completion notification when import done
  useEffect(() => {
    if (isComplete && currentMode !== "selector") {
      setShowCompletion(true);
      console.log("[WaitingExperience] Import complete, showing notification");
    }
  }, [isComplete, currentMode]);

  // CRITICAL: Prevent overlay from auto-closing
  // Overlay should ONLY close when user explicitly clicks button
  useEffect(() => {
    if (open) {
      console.log("[WaitingExperience] Overlay opened, mode:", currentMode);
    }
  }, [open, currentMode]);

  // Handle mode selection from main selector
  const handleModeSelect = (mode: WaitingMode) => {
    if (mode === "story") {
      setCurrentMode("story-list");
    } else if (mode === "quiz") {
      setCurrentMode("quiz-category");
    } else {
      setCurrentMode(mode);
    }
  };

  // Handle story selection
  const handleStorySelect = (storyId: string) => {
    console.log("[WaitingExperience] Story selected:", storyId);
    setSelectedStoryId(storyId);
    setCurrentMode("story");
  };

  // Handle category selection (for quiz)
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentMode("quiz");
  };

  // Handle back to selector
  const handleBackToSelector = () => {
    setCurrentMode("selector");
    setSelectedCategory("");
    setSelectedStoryId("");
    setShowCompletion(false);
  };

  // Handle back to story list
  const handleBackToStoryList = () => {
    setCurrentMode("story-list");
    setSelectedStoryId("");
  };

  // Handle back to category selector (for quiz)
  const handleBackToCategorySelector = () => {
    setCurrentMode("quiz-category");
    setSelectedCategory("");
  };

  // Handle view result
  const handleViewResult = () => {
    console.log('[WaitingExperience] User clicked "Lihat Sekarang"');
    setShowCompletion(false);
    onViewResult();
  };

  // Handle continue (dismiss completion notice)
  const handleContinue = () => {
    console.log('[WaitingExperience] User clicked "Lanjut Dulu"');
    setShowCompletion(false);
    // Don't close overlay, let user continue story/quiz
  };

  // Handle close attempt (show confirmation if not complete)
  const handleCloseAttempt = () => {
    if (isComplete) {
      // If already complete, just close
      onClose();
    } else {
      // Show confirmation dialog
      setShowCancelConfirm(true);
    }
  };

  // Handle confirmed cancel
  const handleConfirmedCancel = () => {
    console.log("[WaitingExperience] User confirmed cancel");
    setShowCancelConfirm(false);
    onClose(); // This will trigger abort in parent component
  };

  // Handle cancel dismiss
  const handleCancelDismiss = () => {
    setShowCancelConfirm(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
        >
          {/* Main Content */}
          <div className="relative h-full w-full overflow-y-auto">
            {/* Close Button (only in selector mode) */}
            {currentMode === "selector" && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={handleCloseAttempt}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                title="Tutup"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            )}

            {/* Content Container */}
            <div className="flex items-center justify-center min-h-full p-4 sm:p-6">
              <AnimatePresence mode="wait">
                {currentMode === "selector" ? (
                  <ModeSelector key="selector" onSelectMode={handleModeSelect} />
                ) : currentMode === "story-list" ? (
                  <div key="story-list" className="w-full">
                    <ContentSelector mode="story" onBack={handleBackToSelector} onSelect={handleStorySelect} />
                  </div>
                ) : currentMode === "quiz-category" ? (
                  <div key="quiz-category" className="w-full">
                    <ContentSelector mode="quiz" onBack={handleBackToSelector} onSelect={handleCategorySelect} />
                  </div>
                ) : currentMode === "story" ? (
                  <div key="story" className="w-full">
                    <StoryMode storyId={selectedStoryId} onBack={handleBackToStoryList} />
                  </div>
                ) : currentMode === "quiz" ? (
                  <div key="quiz" className="w-full">
                    <QuizMode categoryId={selectedCategory} onBack={handleBackToCategorySelector} />
                  </div>
                ) : (
                  <WaitMode key="wait" onBack={handleBackToSelector} onClose={handleCloseAttempt} />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Completion Notification (Floating) */}
          <AnimatePresence>
            {showCompletion && (
              <motion.div
                variants={completionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed top-4 left-1/2 -translate-x-1/2 z-60 w-[90%] max-w-md"
              >
                <div className="bg-linear-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-4 shadow-2xl">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                        🎉 Yeay! Catatanmu Udah Jadi!
                      </h3>
                      <p className="text-sm text-emerald-200/80">Mau lihat sekarang atau lanjut dulu nih?</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleViewResult}
                      className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors text-sm"
                    >
                      Lihat Sekarang
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleContinue}
                      className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors text-sm"
                    >
                      Lanjut Dulu
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cancel Confirmation Dialog */}
          <AnimatePresence>
            {showCancelConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={handleCancelDismiss}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  className="bg-linear-to-br from-gray-900 to-gray-800 border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Title & Message */}
                  <h3 className="text-xl font-bold text-white text-center mb-2">Yakin Mau Batalkan?</h3>
                  <p className="text-sm text-gray-300 text-center mb-6 leading-relaxed">
                    Proses summary masih jalan nih. Kalau dibatalin, nanti harus ulang dari awal lagi. Yakin mau stop?
                  </p>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCancelDismiss}
                      className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                    >
                      Gak Jadi
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirmedCancel}
                      className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                    >
                      Ya, Batalkan
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// MODE SELECTOR
// ============================================

interface ModeSelectorProps {
  onSelectMode: (mode: WaitingMode) => void;
}

function ModeSelector({ onSelectMode }: ModeSelectorProps) {
  const modes = [
    {
      id: "story" as WaitingMode,
      icon: BookOpen,
      emoji: "📖",
      title: "Baca Kisah Seru",
      description: "Cerita menarik tentang Nabi & Sahabat",
      gradient: "from-blue-500/20 to-purple-500/20",
      borderColor: "border-blue-500/30",
      hoverGlow: "hover:shadow-blue-500/20",
    },
    {
      id: "quiz" as WaitingMode,
      icon: Brain,
      emoji: "🎯",
      title: "Main Kuis Asik",
      description: "Test seberapa jago kamu!",
      gradient: "from-emerald-500/20 to-teal-500/20",
      borderColor: "border-emerald-500/30",
      hoverGlow: "hover:shadow-emerald-500/20",
    },
    {
      id: "wait" as WaitingMode,
      icon: Loader2,
      emoji: "⏳",
      title: "Santai Aja Dulu",
      description: "Stay di sini, nonton loading cantik",
      gradient: "from-gray-500/20 to-slate-500/20",
      borderColor: "border-gray-500/30",
      hoverGlow: "hover:shadow-gray-500/20",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-lg space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 mb-2">
          <Sparkles className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white">🌙 Eh, Sambil Nungguin Nih...</h2>
        <p className="text-base sm:text-lg text-gray-400">Pilih salah satu biar gak bosen nunggu!</p>
      </motion.div>

      {/* Mode Cards */}
      <div className="space-y-3">
        {modes.map((mode, index) => (
          <motion.button
            key={mode.id}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            whileTap="tap"
            onClick={() => onSelectMode(mode.id)}
            className={cn(
              "w-full p-5 rounded-2xl border backdrop-blur-xl transition-all",
              "bg-linear-to-br",
              mode.gradient,
              mode.borderColor,
              "hover:shadow-xl",
              mode.hoverGlow,
              "group"
            )}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl">{mode.emoji}</span>
              </div>

              {/* Content */}
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-white/90 transition-colors">
                  {mode.title}
                </h3>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{mode.description}</p>
              </div>

              {/* Arrow */}
              <div className="shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <svg
                  className="w-4 h-4 text-white/60 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Footer Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-gray-500"
      >
        Proses lagi jalan di background kok, santai aja~ 🌟
      </motion.p>
    </motion.div>
  );
}

// ============================================
// WAIT MODE (Loading Animation)
// ============================================

interface WaitModeProps {
  onBack: () => void;
  onClose: () => void;
}

function WaitMode({ onBack, onClose }: WaitModeProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="text-center space-y-6 max-w-md relative"
    >
      {/* Close & Back Buttons */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          title="Kembali ke pilihan"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          title="Tutup"
        >
          <X className="w-5 h-5 text-white" />
        </motion.button>
      </div>

      <div className="pt-12">
        <CatLoading />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="text-xl font-semibold text-white mb-2 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
          Bentar Ya, Lagi Proses...
        </h2>
        <p className="text-sm text-gray-400">Santai aja, AI-nya lagi baca & meringkas catatanmu nih 🌙</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs text-blue-300">Proses berjalan di background</span>
        </div>
      </motion.div>

      {/* Helper Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-xs text-gray-500 pt-4"
      >
        💡 Tip: Bosen nungguin? Balik aja ke menu & pilih Kisah atau Kuis!
      </motion.p>
    </motion.div>
  );
}
