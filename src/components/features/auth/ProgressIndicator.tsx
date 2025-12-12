/**
 * Progress Indicator Component
 * Minimal progress with step counter
 *
 * Filepath: src/components/features/auth/ProgressIndicator.tsx
 */

import { motion } from "framer-motion";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps, className = "" }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={`mb-4 ${className}`}>
      {/* Minimalist progress bar */}
      <div className="relative h-0.5 bg-gray-800/30 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </div>

      {/* Step counter - small & subtle */}
      <div className="flex justify-end mt-2">
        <span className="text-[10px] font-medium text-gray-600">
          {currentStep}/{totalSteps}
        </span>
      </div>
    </div>
  );
};

export default ProgressIndicator;
