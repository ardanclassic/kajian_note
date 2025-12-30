/**
 * Dalil Card Component
 * Displays Quranic verses with Arabic text and translation
 */

import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Dalil } from '@/types/memory-journey.types';

interface DalilCardProps {
  dalil: Dalil | Dalil[];
  className?: string;
}

export function DalilCard({ dalil, className = '' }: DalilCardProps) {
  const dalilArray = Array.isArray(dalil) ? dalil : [dalil];

  return (
    <div className={`space-y-4 ${className}`}>
      {dalilArray.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-linear-to-br from-emerald-500/5 to-emerald-500/10 rounded-xl p-4 md:p-6 border border-emerald-500/20"
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400" />
            </div>
            <span className="text-xs md:text-sm font-medium text-emerald-400">
              Dalil
            </span>
          </div>

          {/* Arabic Text */}
          <div className="mb-4 md:mb-6 text-right" dir="rtl">
            <p className="text-xl md:text-3xl leading-loose text-white font-arabic">
              {item.arabic}
            </p>
          </div>

          {/* Translation */}
          <div className="mb-3 md:mb-4">
            <p className="text-sm md:text-lg leading-relaxed text-gray-300 italic">
              "{item.translation}"
            </p>
          </div>

          {/* Source */}
          <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-emerald-500/20">
            <span className="text-[10px] md:text-sm font-semibold text-emerald-400">
              {item.source}
            </span>
            {item.context && (
              <span className="text-[10px] text-gray-500 line-clamp-1 max-w-[50%]">
                {item.context}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
