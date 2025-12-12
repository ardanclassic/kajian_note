/**
 * CategorySelector Component
 * Selector untuk memilih kategori Story atau Quiz sebelum masuk ke konten
 *
 * PATH: src/components/features/notes/WaitingExperience/CategorySelector.tsx
 *
 * Features:
 * - Pilih kategori story (Sirah/Shahabat/Salaf)
 * - Pilih kategori quiz (Sirah/Fiqih/Aqidah)
 * - Animated cards with gradient backgrounds
 * - Back button to return to mode selector
 */

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { STORY_CATEGORIES, QUIZ_CATEGORIES, type CategoryMeta } from "@/data/waiting-experience";

// ============================================
// TYPES
// ============================================

interface CategorySelectorProps {
  mode: "story" | "quiz";
  onBack: () => void;
  onSelectCategory: (categoryId: string) => void;
}

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

// ============================================
// COMPONENT
// ============================================

export function CategorySelector({ mode, onBack, onSelectCategory }: CategorySelectorProps) {
  const categories = mode === "story" ? STORY_CATEGORIES : QUIZ_CATEGORIES;
  const modeTitle = mode === "story" ? "Baca Kisah" : "Main Kuis";
  const modeEmoji = mode === "story" ? "📖" : "🎯";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-lg mx-auto"
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
            {modeEmoji} {modeTitle}
          </h2>
          <p className="text-sm sm:text-base text-gray-400 mt-1">Pilih topik yang kamu suka nih!</p>
        </div>
      </div>

      {/* Category Cards */}
      <div className="space-y-3">
        {categories.map((category: any, index: any) => (
          <motion.button
            key={category.id}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            whileTap="tap"
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "w-full p-5 rounded-2xl border backdrop-blur-xl transition-all",
              "bg-gradient-to-br",
              category.gradient,
              category.borderColor,
              "hover:shadow-xl",
              "group"
            )}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-3xl">{category.emoji}</span>
              </div>

              {/* Content */}
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-white/90 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  {category.description}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
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
        className="text-center text-sm text-gray-500 mt-6"
      >
        Proses import masih jalan kok, santai aja~ 🌟
      </motion.p>
    </motion.div>
  );
}
