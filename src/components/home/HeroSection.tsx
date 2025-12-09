import React from "react";
import { motion } from "framer-motion";
import { Sparkles, LayoutDashboard, ArrowRight, Youtube, Download, Zap, BookOpen } from "lucide-react";

interface HeroSectionProps {
  isAuthenticated: boolean;
  onNavigate: (path: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ isAuthenticated, onNavigate }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

      {/* Subtle Grid */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 md:py-32 max-w-7xl">
        <div className="text-center space-y-8 max-w-5xl mx-auto">
          {/* Top Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 border border-emerald-500/50 shadow-lg shadow-emerald-500/20">
              <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold text-emerald-400">
                Platform Catatan Kajian Terbaik
              </span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight">
              <span className="block text-white">Kajian Note</span>
            </h1>

            <p className="text-xl md:text-2xl lg:text-3xl text-gray-300 font-light leading-relaxed">
              Catat, Kelola, dan Bagikan Ilmu dari Kajian
            </p>

            <p className="text-2xl md:text-3xl font-bold text-emerald-400">Tanpa Ribet, Tanpa Email!</p>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 text-sm font-medium"
          >
            <FeaturePill icon={Youtube} text="Import dari YouTube" />
            <FeaturePill icon={Sparkles} text="AI Summary" />
            <FeaturePill icon={Download} text="Export PDF" />
            <FeaturePill icon={Zap} text="Username + PIN Only" />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex gap-4 justify-center flex-wrap pt-6"
          >
            {isAuthenticated ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate("/dashboard")}
                  className="group relative px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold text-lg border border-emerald-500/50 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                    Buka Dashboard
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate("/notes")}
                  className="px-8 py-4 bg-transparent text-white rounded-xl font-semibold text-lg border border-gray-800 hover:border-gray-700 hover:bg-gray-900/50 transition-all"
                >
                  Lihat Catatan Saya
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate("/register")}
                  className="group relative px-10 py-4 bg-gray-900 text-white rounded-xl font-semibold text-lg border border-emerald-500/50 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center gap-2">
                    Daftar Gratis Sekarang
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate("/login")}
                  className="px-10 py-4 bg-transparent text-white rounded-xl font-semibold text-lg border border-gray-800 hover:border-gray-700 hover:bg-gray-900/50 transition-all"
                >
                  Login
                </motion.button>
              </>
            )}
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="pt-12 text-sm text-gray-400"
          >
            <p className="mb-4 text-gray-500">Dipercaya oleh jamaah di seluruh Indonesia</p>
            <div className="flex flex-wrap justify-center gap-8 items-center">
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <span className="font-semibold text-gray-300">Mudah Digunakan</span>
              </span>
              <span className="text-gray-600">•</span>
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-400" />
                <span className="font-semibold text-gray-300">Tanpa Email</span>
              </span>
              <span className="text-gray-600">•</span>
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span className="font-semibold text-gray-300">AI Powered</span>
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-emerald-500 rounded-full flex justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-1 h-3 bg-emerald-500 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

// Feature Pill Component
interface FeaturePillProps {
  icon: React.ElementType;
  text: string;
}

const FeaturePill: React.FC<FeaturePillProps> = ({ icon: Icon, text }) => {
  return (
    <motion.span
      whileHover={{ scale: 1.05, y: -2 }}
      className="group px-5 py-2.5 bg-gray-900 rounded-full border border-gray-800 flex items-center gap-2 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10 transition-all cursor-default"
    >
      <Icon className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
      <span className="text-gray-300">{text}</span>
    </motion.span>
  );
};
