import React from "react";
import { motion } from "framer-motion";
import { Sparkles, LayoutDashboard, ArrowRight, NotebookPen, Palette, Gamepad2, Wand2 } from "lucide-react";
import logo from "@/assets/images/logo.png";

interface HeroSectionProps {
  isAuthenticated: boolean;
  onNavigate: (path: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ isAuthenticated, onNavigate }) => {
  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-black selection:bg-emerald-500/30">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />

      {/* Dynamic Grid */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 md:py-32 max-w-7xl">
        <div className="text-center space-y-8 max-w-5xl mx-auto">

          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-lg shadow-emerald-500/10 hover:border-emerald-500/30 transition-colors cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs md:text-sm font-medium text-gray-300">
                The Ultimate Islamic Learning Ecosystem
              </span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="relative inline-block group">
              <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img
                src={logo}
                alt="Alwaah Logo"
                className="relative w-24 h-24 md:w-32 md:h-32 mx-auto object-contain mb-4 drop-shadow-2xl"
              />
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] md:leading-[0.9]">
              <span className="block text-white mb-2">Belajar. Berkarya.</span>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-teal-200 to-emerald-400 bg-[length:200%_auto] animate-gradient">
                Bertumbuh.
              </span>
            </h1>

            <p className="text-lg md:text-2xl text-gray-400 font-light leading-relaxed max-w-3xl mx-auto px-4">
              Satu platform untuk mencatat kajian dengan AI, membuat konten dakwah visual,
              hingga menguji wawasan keislamanmu.
            </p>
          </motion.div>

          {/* Interactive Pills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 pt-4"
          >
            <FeaturePill icon={NotebookPen} text="Smart Notes" color="text-yellow-400" bgColor="bg-yellow-400/10" />
            <FeaturePill icon={Palette} text="Content Studio" color="text-purple-400" bgColor="bg-purple-400/10" />
            <FeaturePill icon={Wand2} text="Prompt Magic" color="text-blue-400" bgColor="bg-blue-400/10" />
            <FeaturePill icon={Gamepad2} text="Quest & play" color="text-red-400" bgColor="bg-red-400/10" />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
          >
            {isAuthenticated ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate("/dashboard")}
                className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-2 group"
              >
                <LayoutDashboard className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                Buka Dashboard
              </motion.button>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate("/register")}
                  className="w-full sm:w-auto px-8 py-4 bg-emerald-500 text-black rounded-full font-bold text-lg hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 group"
                >
                  Mulai Sekarang
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate("/login")}
                  className="w-full sm:w-auto px-8 py-4 bg-black border border-gray-800 text-white rounded-full font-semibold text-lg hover:bg-gray-900 transition-all"
                >
                  Masuk Akun
                </motion.button>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Decorative Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
};

// Feature Pill Component
interface FeaturePillProps {
  icon: React.ElementType;
  text: string;
  color: string;
  bgColor: string;
}

const FeaturePill: React.FC<FeaturePillProps> = ({ icon: Icon, text, color, bgColor }) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.05 }}
      className={`px-5 py-2.5 rounded-2xl border border-white/5 backdrop-blur-sm flex items-center gap-2.5 cursor-default transition-all hover:border-white/20 hover:shadow-lg ${bgColor}`}
    >
      <Icon className={`h-4 w-4 ${color}`} />
      <span className="text-sm font-semibold text-gray-200">{text}</span>
    </motion.div>
  );
};
