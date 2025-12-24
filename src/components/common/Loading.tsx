/**
 * Loading Component - Premium Redesign
 * Featuring smooth Framer Motion animations and Alwaah branding
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/images/logo.png";

interface LoadingProps {
  /**
   * Size of the spinner
   */
  size?: "sm" | "md" | "lg" | "xl";

  /**
   * Loading text to display
   */
  text?: string;

  /**
   * Show as fullscreen overlay
   */
  fullscreen?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

/**
 * Elegant Spinner Component
 * A double-ring spinner with a pulsating core
 */
export const ElegantSpinner: React.FC<{ size?: "sm" | "md" | "lg" | "xl"; className?: string }> = ({
  size = "md",
  className,
}) => {
  const pixelSize = sizeMap[size];
  const strokeWidth = size === "sm" ? 2 : 3;

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {/* Outer Ring (Background) */}
      <div className="absolute inset-0 rounded-full border border-emerald-500/20" />

      {/* Spinning Ring */}
      <motion.span
        className="absolute inset-0 rounded-full border-t-transparent border-l-transparent border-r-transparent"
        style={{
          borderTopWidth: strokeWidth,
          borderColor: '#10b981' // emerald-500
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />

      {/* Reverse Spinning Inner Ring */}
      <motion.span
        className="absolute inset-1 rounded-full border-b-transparent border-l-transparent border-r-transparent"
        style={{
          borderBottomWidth: strokeWidth,
          borderColor: '#34d399' // emerald-400
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />

      {/* Pulsing Core */}
      <motion.div
        className="w-[30%] h-[30%] bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

/**
 * Fullscreen Loading Overlay
 * Premium branding experience with logo animation
 */
const FullscreenLoader: React.FC<{ text?: string }> = ({ text = "Memuat..." }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md"
    >
      {/* Ambient Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container */}
        <div className="relative mb-8">
          {/* Main Logo Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative w-24 h-24 rounded-full border border-emerald-500/30 shadow-2xl shadow-emerald-500/20"
          >
            <img src={logo} alt="Alwaah Logo" className="w-full h-full object-cover rounded-full" />
          </motion.div>

          {/* Orbiting Elements */}
          <motion.div
            className="absolute inset-[-10px] rounded-full border border-emerald-500/20"
            animate={{ rotate: 180, scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-[-20px] rounded-full border border-dashed border-emerald-500/10"
            animate={{ rotate: -360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Text Animation */}
        <div className="text-center space-y-2">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-white tracking-widest"
          >
            ALWAAH
          </motion.h3>

          {text && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2 justify-center"
            >
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-emerald-500/50" />
              <p className="text-emerald-400 text-sm font-medium tracking-wide uppercase">{text}</p>
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-emerald-500/50" />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Main Loading Component
 */
export const Loading: React.FC<LoadingProps> = ({ size = "md", text, fullscreen = false, className }) => {
  if (fullscreen) {
    return <FullscreenLoader text={text} />;
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <ElegantSpinner size={size} />
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn("text-muted-foreground font-medium", textSizeClasses[size])}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

/**
 * Centered Page Loading Helper
 */
export const PageLoading: React.FC<{ text?: string }> = ({ text = "Memuat data..." }) => {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <Loading size="lg" text={text} />
    </div>
  );
};

/**
 * Inline Button Loading Helper
 */
export const ButtonLoading: React.FC = () => {
  return <ElegantSpinner size="sm" />;
};

/**
 * Skeleton Loading - Enhanced
 */
export const SkeletonLoading: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="space-y-3 p-4 rounded-xl border border-gray-800 bg-gray-900/30"
        >
          <div className="h-4 w-3/4 bg-gray-800 rounded animate-pulse" />
          <div className="h-3 w-1/2 bg-gray-800/60 rounded animate-pulse" />
        </motion.div>
      ))}
    </div>
  );
};

/**
 * Card Skeleton Loading - Enhanced
 */
export const CardSkeletonLoading: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-xl border border-gray-800 bg-gray-900/30 p-6 space-y-4 overflow-hidden relative"
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

          <div className="h-8 w-3/4 bg-gray-800 rounded-lg" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-800/60 rounded" />
            <div className="h-4 w-5/6 bg-gray-800/60 rounded" />
          </div>
          <div className="flex gap-3 pt-2">
            <div className="h-8 w-20 bg-gray-800 rounded-full" />
            <div className="h-8 w-20 bg-gray-800 rounded-full" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

/**
 * Spinner export for direct usage
 */
export const Spinner = ElegantSpinner;

export default Loading;
