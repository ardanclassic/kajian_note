/**
 * Typeform Step Component
 * Improved with smooth fade + slide transitions
 *
 * Filepath: src/components/features/auth/TypeformStep.tsx
 */

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ReactNode } from "react";

interface TypeformStepProps {
  isActive: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isLoading?: boolean;
  error?: string;
  direction?: "forward" | "backward";
  stepKey?: string; // Unique key per step
}

export const TypeformStep: React.FC<TypeformStepProps> = ({
  isActive,
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextLabel = "Lanjut",
  nextDisabled = false,
  isLoading = false,
  error,
  direction = "forward",
  stepKey = "step",
}) => {
  // Kombinasi fade + subtle slide untuk transisi yang smooth
  const variants: any = {
    initial: (dir: string) => ({
      opacity: 0,
      x: dir === "forward" ? 30 : -30,
      scale: 0.96,
    }),
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: (dir: string) => ({
      opacity: 0,
      x: dir === "forward" ? -30 : 30,
      scale: 0.96,
      transition: {
        duration: 0.4, // Exit lebih lama - biar bener-bener hilang dulu
        ease: [0.4, 0, 0.2, 1],
      },
    }),
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isActive && (
        <motion.div
          key={stepKey} // Unique key per step - PENTING untuk force proper exit/enter
          custom={direction}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0 space-y-6" // Absolute positioning untuk prevent stacking
        >
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight">{title}</h2>
            {subtitle && <p className="text-sm text-gray-400 leading-relaxed">{subtitle}</p>}
          </div>

          {/* Content */}
          <div className="space-y-4">
            {children}

            {/* Error message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3 pt-2">
            {onBack && (
              <Button
                type="button"
                onClick={onBack}
                disabled={isLoading}
                variant="ghost"
                className="text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-colors disabled:opacity-50 px-3 py-2 h-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Kembali
              </Button>
            )}

            <div className="flex-1" />

            {onNext && (
              <Button
                type="button"
                onClick={onNext}
                disabled={nextDisabled || isLoading}
                className="h-10 px-6 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-0 group"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    {nextLabel}
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TypeformStep;
