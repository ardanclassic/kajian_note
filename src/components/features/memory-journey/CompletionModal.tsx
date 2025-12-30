/**
 * Completion Modal Component
 * Celebration screen when journey is completed
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Clock, Target, Award, RotateCcw, Home, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { CompletionStats } from '@/types/memory-journey.types';

interface CompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: CompletionStats;
  onRestart: () => void;
}

export function CompletionModal({ open, onOpenChange, stats, onRestart }: CompletionModalProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      // Trigger massive confetti celebration
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [open]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-black border-gray-800">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="flex justify-center mb-2 md:mb-4"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/30 blur-3xl rounded-full animate-pulse" />
              <Trophy className="w-16 h-16 md:w-24 md:h-24 text-emerald-500 relative" />
            </div>
          </motion.div>

          <DialogTitle className="text-2xl md:text-4xl font-bold text-center text-white">
            🎉 Journey Selesai!
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400 text-sm md:text-lg">
            Selamat! Kamu telah menyelesaikan perjalanan belajar ini dengan sukses
          </DialogDescription>
        </DialogHeader>

        {/* Stats Grid */}
        <div className="py-4 md:py-6 space-y-4 md:space-y-6">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {/* Total XP */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-linear-to-br from-emerald-500/10 to-emerald-500/5 rounded-xl p-4 md:p-6 border border-emerald-500/20"
            >
              <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Trophy className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
                </div>
                <div className="text-xs md:text-sm text-gray-400">Total XP</div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-emerald-400">
                {stats.totalXP}
              </div>
            </motion.div>

            {/* Accuracy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-linear-to-br from-blue-500/10 to-blue-500/5 rounded-xl p-4 md:p-6 border border-blue-500/20"
            >
              <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Target className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                </div>
                <div className="text-xs md:text-sm text-gray-400">Akurasi</div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-blue-400">
                {stats.accuracy}%
              </div>
            </motion.div>

            {/* Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-linear-to-br from-purple-500/10 to-purple-500/5 rounded-xl p-4 md:p-6 border border-purple-500/20"
            >
              <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                </div>
                <div className="text-xs md:text-sm text-gray-400">Waktu</div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-purple-400">
                {formatTime(stats.totalTime)}
              </div>
            </motion.div>

            {/* Scenes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-linear-to-br from-orange-500/10 to-orange-500/5 rounded-xl p-4 md:p-6 border border-orange-500/20"
            >
              <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
                </div>
                <div className="text-xs md:text-sm text-gray-400">Scene</div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-orange-400">
                {stats.scenesCompleted}/{stats.totalScenes}
              </div>
            </motion.div>
          </div>

          {/* Badges */}
          {stats.badges && stats.badges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-900/50 rounded-xl p-6 border border-gray-800"
            >
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-bold text-white">Badges Earned</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {stats.badges.map((badge, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 bg-yellow-500/10 text-yellow-400 rounded-lg text-sm font-medium border border-yellow-500/20"
                  >
                    🏆 {badge}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            onClick={onRestart}
            variant="outline"
            className="flex-1 border-gray-700 hover:bg-gray-800 gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Ulangi Journey
          </Button>
          <Button
            onClick={() => navigate('/memory-journey')}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
          >
            <Home className="w-4 h-4" />
            Kembali ke Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
