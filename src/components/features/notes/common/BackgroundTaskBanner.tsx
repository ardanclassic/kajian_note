/**
 * BackgroundTaskBanner Component
 * Shows compact notification when YouTube summarize is running in background
 * REDESIGNED: Emerald glow theme, readable text, custom confirmation dialog
 *
 * PATH: src/components/features/notes/BackgroundTaskBanner.tsx
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Youtube, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { BackgroundTaskData } from "@/utils/backgroundTaskPersistence";

interface BackgroundTaskBannerProps {
  task: BackgroundTaskData;
  progress: number;
  onCancel: () => void;
  onClick?: () => void;
}

export function BackgroundTaskBanner({ task, progress, onCancel, onClick }: BackgroundTaskBannerProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const estimatedMinutes = Math.max(0, Math.ceil(((task.maxPollingAttempts - task.pollingAttempts) * 2) / 60));
  const isLongTask = task.pollingAttempts > 100;

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCancelConfirm(true);
  };

  const handleCancelDismiss = () => {
    setShowCancelConfirm(false);
  };

  const handleConfirmedCancel = () => {
    setShowCancelConfirm(false);
    onCancel();
  };

  return (
    <>
      <Card
        className="relative overflow-hidden border border-emerald-500/30 bg-linear-to-br from-emerald-950/40 to-emerald-900/20 backdrop-blur-sm shadow-lg cursor-pointer hover:border-emerald-400/50 hover:shadow-emerald-500/10 transition-all duration-300"
        onClick={onClick}
      >
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-linear-to-r from-emerald-500/5 via-transparent to-emerald-500/5 opacity-50" />

        <div className="relative p-3 sm:p-4">
          {/* Mobile Layout (Column) */}
          <div className="sm:hidden space-y-3">
            {/* Top Row - Icon, Title & Cancel Button */}
            <div className="flex items-center gap-2.5">
              {/* Animated Icon */}
              <div className="shrink-0 relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-lg blur-md animate-pulse" />
                <div className="relative p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                </div>
              </div>

              {/* Title & Badge */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-emerald-300 tracking-wide">Summarize Berjalan</h3>
                </div>
              </div>
            </div>

            {/* Video Title */}
            {task.metadata?.title && (
              <p className="text-xs text-emerald-200/70 line-clamp-2 leading-tight pl-0.5">{task.metadata.title}</p>
            )}

            {/* Progress Section */}
            <div className="space-y-1.5">
              <div className="relative">
                <Progress
                  value={progress}
                  className="h-1.5 bg-emerald-950/50 border border-emerald-500/20 overflow-hidden"
                />
                <div
                  className="absolute top-0 left-0 h-full bg-linear-to-r from-emerald-400 to-emerald-500 transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-semibold tabular-nums">{progress}%</span>
                <span className="text-emerald-200/60 font-medium">~{estimatedMinutes}m tersisa</span>
              </div>
            </div>

            {/* Cancel Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelClick}
              className="shrink-0 h-7 px-2.5 border-red-500/30 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/50 text-red-400 hover:text-red-300 transition-colors text-xs font-medium"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Batalkan
            </Button>

            {/* Warning */}
            {isLongTask && (
              <div className="flex items-start gap-2 pt-2 border-t border-emerald-500/10">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300/90 leading-snug">
                  Proses memakan waktu lama. Pertimbangkan batalkan & coba lagi.
                </p>
              </div>
            )}
          </div>

          {/* Desktop Layout (Row) */}
          <div className="hidden sm:flex items-start gap-3">
            {/* Animated Icon */}
            <div className="shrink-0 relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-lg blur-md animate-pulse" />
              <div className="relative p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Title Row */}
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-emerald-300 tracking-wide">Summarize Berjalan</h3>
                <Badge
                  variant="secondary"
                  className="h-5 text-xs bg-emerald-500/15 text-emerald-400 border-emerald-500/30 px-2 py-0 font-medium"
                >
                  <Youtube className="w-3 h-3 mr-1" />
                  Background
                </Badge>
              </div>

              {/* Video Title */}
              {task.metadata?.title && (
                <p className="text-sm text-emerald-200/70 line-clamp-1 leading-tight">{task.metadata.title}</p>
              )}

              {/* Progress Section */}
              <div className="space-y-1.5 pt-1">
                <div className="relative">
                  <Progress
                    value={progress}
                    className="h-1.5 bg-emerald-950/50 border border-emerald-500/20 overflow-hidden"
                  />
                  <div
                    className="absolute top-0 left-0 h-full bg-linear-to-r from-emerald-400 to-emerald-500 transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-400 font-semibold tabular-nums">{progress}%</span>
                  <span className="text-emerald-200/60 font-medium">~{estimatedMinutes}m tersisa</span>
                </div>
              </div>

              {/* Warning */}
              {isLongTask && (
                <div className="flex items-start gap-2 pt-2 mt-1 border-t border-emerald-500/10">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-300/90 leading-snug">
                    Proses memakan waktu lama. Pertimbangkan batalkan & coba lagi.
                  </p>
                </div>
              )}
            </div>

            {/* Cancel Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelClick}
              className="shrink-0 h-8 px-3 border-red-500/30 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/50 text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
            >
              <X className="w-4 h-4 mr-1.5" />
              Batalkan
            </Button>
          </div>
        </div>
      </Card>

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
    </>
  );
}
