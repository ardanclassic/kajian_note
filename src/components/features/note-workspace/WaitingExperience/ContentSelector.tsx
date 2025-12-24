/**
 * ContentSelector Component (Universal) - MOBILE OPTIMIZED
 * Handles both Story selection and Quiz category selection
 *
 * PATH: src/components/features/notes/WaitingExperience/ContentSelector.tsx
 *
 * MOBILE IMPROVEMENTS:
 * - Story list: Simplified to title & subtitle only (no icon, meta, chevron)
 * - Cleaner, more compact design for small screens
 */

import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllStories, QUIZ_CATEGORIES, type Story, type CategoryMeta } from "@/data/waiting-experience";

// ============================================
// TYPES
// ============================================

interface ContentSelectorProps {
  mode: "story" | "quiz";
  onBack: () => void;
  onSelect: (id: string) => void;
}

// ============================================
// ANIMATION VARIANTS
// ============================================

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
  exit: { opacity: 0 },
};

const cardVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
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

// ============================================
// COMPONENT
// ============================================

export function ContentSelector({ mode, onBack, onSelect }: ContentSelectorProps) {
  // Get content based on mode
  const isStoryMode = mode === "story";
  const stories = isStoryMode ? getAllStories() : [];
  const categories = isStoryMode ? [] : QUIZ_CATEGORIES;

  const title = isStoryMode ? "Pilih Kisah" : "Pilih Kategori";
  const subtitle = isStoryMode ? "Mau baca yang mana nih?" : "Pilih topik yang kamu suka!";
  const emoji = isStoryMode ? "📖" : "🎯";

  // Render story card (SIMPLIFIED FOR MOBILE)
  const renderStoryCard = (story: Story, index: number) => (
    <motion.button
      key={story.id}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      onClick={() => onSelect(story.id)}
      className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-xl transition-all text-left"
    >
      {/* Title & Subtitle Only - Clean & Compact */}
      <h3 className="text-base font-semibold text-white mb-1 leading-tight">{story.title}</h3>
      {story.subtitle && <p className="text-sm text-gray-400 leading-snug">{story.subtitle}</p>}
    </motion.button>
  );

  // Render category card (unchanged for quiz)
  const renderCategoryCard = (category: CategoryMeta, index: number) => (
    <motion.button
      key={category.id}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      onClick={() => onSelect(category.id)}
      className={cn(
        "w-full p-5 rounded-2xl border backdrop-blur-xl transition-all",
        "bg-linear-to-br",
        category.gradient,
        category.borderColor,
        "hover:shadow-xl",
        "group"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="shrink-0 w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <span className="text-3xl">{category.emoji}</span>
        </div>

        {/* Content */}
        <div className="flex-1 text-left">
          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-white/90 transition-colors">
            {category.name}
          </h3>
          <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{category.description}</p>
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
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </motion.button>

        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            {emoji} {title}
          </h2>
          <p className="text-sm sm:text-base text-gray-400 mt-1">{subtitle}</p>
        </div>
      </div>

      {/* Content List */}
      {isStoryMode ? (
        stories.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Belum ada cerita tersedia</p>
          </div>
        ) : (
          <div className="space-y-3 px-2 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {stories.map((story, index) => renderStoryCard(story, index))}
          </div>
        )
      ) : (
        <div className="space-y-3">{categories.map((category, index) => renderCategoryCard(category, index))}</div>
      )}

      {/* Footer Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-gray-500 mt-6"
      >
        Proses lagi jalan di background kok, <br /> santai aja~ 🌟
      </motion.p>
    </motion.div>
  );
}
