/**
 * StoryMode Component - UPDATED
 * Interactive story reader with auto-scroll and smooth animations
 *
 * PATH: src/components/features/notes/WaitingExperience/StoryMode.tsx
 *
 * CHANGES:
 * - Removed skip button (cerita dipilih dari category, jadi gak perlu skip)
 * - Only back and pause/play buttons
 * - Load story by category (not random)
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Pause, Play, BookOpen, Lightbulb } from "lucide-react";
import { getRandomStoryByCategory, type Story, type StoryParagraph } from "@/data/waiting-experience";

// ============================================
// TYPES
// ============================================

interface StoryModeProps {
  categoryId: string; // Category selected by user
  onBack: () => void;
}

type StoryState = "reading" | "completed";

// ============================================
// ANIMATION VARIANTS
// ============================================

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
  exit: { opacity: 0 },
};

const paragraphVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const lessonVariants: any = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

// ============================================
// COMPONENT
// ============================================

export function StoryMode({ categoryId, onBack }: StoryModeProps) {
  const [story, setStory] = useState<Story | null>(null);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [displayedParagraphs, setDisplayedParagraphs] = useState<StoryParagraph[]>([]);
  const [state, setState] = useState<StoryState>("reading");
  const [isPaused, setIsPaused] = useState(false);

  // const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load story by category on mount
  useEffect(() => {
    console.log("[StoryMode] Loading story for category:", categoryId);
    const categoryStory = getRandomStoryByCategory(categoryId as Story["category"]);
    console.log("[StoryMode] Story loaded:", categoryStory);

    if (categoryStory) {
      setStory(categoryStory);
    } else {
      console.error("[StoryMode] No story found for category:", categoryId);
    }
  }, [categoryId]);

  // Auto-scroll paragraphs
  useEffect(() => {
    if (!story || isPaused || state === "completed") return;

    if (currentParagraphIndex < story.paragraphs.length) {
      const currentParagraph = story.paragraphs[currentParagraphIndex];

      // Add current paragraph to displayed list
      setDisplayedParagraphs((prev) => [...prev, currentParagraph]);

      // Schedule next paragraph
      timeoutRef.current = setTimeout(() => {
        setCurrentParagraphIndex((prev) => prev + 1);
      }, currentParagraph.duration);

      // Auto-scroll to bottom
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTo({
            top: containerRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100);
    } else {
      // Story completed
      setState("completed");
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [story, currentParagraphIndex, isPaused, state]);

  // Handle pause/resume
  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  if (!story) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] relative">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="absolute top-4 left-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </motion.button>

        {/* Loading State */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto animate-pulse">
            <BookOpen className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-gray-400 text-sm">Memuat cerita...</p>
          <p className="text-xs text-gray-500">Kalau kelamaan, coba kembali & pilih lagi</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between gap-4">
          {/* Back Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex-shrink-0 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{story.emoji}</span>
              <h2 className="text-lg font-semibold text-white truncate">{story.title}</h2>
            </div>
            {story.subtitle && <p className="text-xs text-gray-400 truncate">{story.subtitle}</p>}
          </div>

          {/* Pause/Resume Control */}
          {state === "reading" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTogglePause}
              className="flex-shrink-0 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              {isPaused ? <Play className="w-5 h-5 text-emerald-400" /> : <Pause className="w-5 h-5 text-yellow-400" />}
            </motion.button>
          )}
        </div>

        {/* Progress Bar */}
        {state === "reading" && (
          <div className="mt-3">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{
                  width: `${(displayedParagraphs.length / story.paragraphs.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                Paragraf {displayedParagraphs.length} / {story.paragraphs.length}
              </p>
              {isPaused && (
                <span className="text-xs text-yellow-400 flex items-center gap-1">
                  <Pause className="w-3 h-3" />
                  Dipause
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Story Content */}
      <div
        ref={containerRef}
        className="px-4 sm:px-6 py-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        {/* Paragraphs */}
        <AnimatePresence mode="sync">
          {displayedParagraphs.map((paragraph, index) => (
            <motion.div
              key={index}
              variants={paragraphVariants}
              initial="hidden"
              animate="visible"
              className="text-base sm:text-lg leading-relaxed text-gray-200"
            >
              {paragraph.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Lessons (Show when completed) */}
        {state === "completed" && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">💡 Pelajaran dari Kisah Ini</h3>
            </div>

            <div className="space-y-3">
              {story.lessons.map((lesson, index) => (
                <motion.div
                  key={index}
                  custom={index}
                  variants={lessonVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5">
                    <span className="text-xs font-semibold text-emerald-400">{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">{lesson}</p>
                </motion.div>
              ))}
            </div>

            {/* Back to Categories Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBack}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali ke Kategori
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Floating Pause Indicator */}
      <AnimatePresence>
        {isPaused && state === "reading" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-yellow-500/20 backdrop-blur-xl border border-yellow-500/30 rounded-full shadow-lg"
          >
            <div className="flex items-center gap-2 text-yellow-300">
              <Pause className="w-4 h-4" />
              <span className="text-sm font-medium">Cerita Dipause</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
