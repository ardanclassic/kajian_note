import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, LayoutDashboard, Rocket, BookOpen, Zap, Crown } from "lucide-react";

interface CTASectionProps {
  isAuthenticated: boolean;
  onNavigate: (path: string) => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ isAuthenticated, onNavigate }) => {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-black">
      {/* Large Glow Orbs */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl" />

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

      {/* Content */}
      <div className="relative container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto text-center space-y-10"
        >
          {/* Icon Badge */}
          <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="inline-flex">
            <div className="relative w-20 h-20 rounded-2xl bg-gray-900 border border-emerald-500/50 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl" />
              <Sparkles className="relative h-10 w-10 text-emerald-400" />
            </div>
          </motion.div>

          {/* Headline */}
          <div className="space-y-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-tight"
            >
              {isAuthenticated ? (
                <>
                  Lanjutkan Perjalanan
                  <br />
                  <span className="text-emerald-400">Menuntut Ilmu Anda</span>
                </>
              ) : (
                <>
                  Siap Mencatat
                  <br />
                  <span className="text-emerald-400">Kajian Anda?</span>
                </>
              )}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              {isAuthenticated
                ? "Akses dashboard Anda dan mulai kelola catatan kajian dengan lebih efisien"
                : "Bergabunglah dengan jamaah yang sudah merasakan kemudahan mencatat kajian"}
            </motion.p>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate(isAuthenticated ? "/dashboard" : "/register")}
              className="group relative px-10 py-5 bg-gray-900 text-white rounded-xl font-bold text-lg border border-emerald-500/50 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-3">
                {isAuthenticated ? (
                  <>
                    <LayoutDashboard className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                    Buka Dashboard
                  </>
                ) : (
                  <>
                    <Rocket className="h-6 w-6 group-hover:-translate-y-1 transition-transform" />
                    Daftar Gratis Sekarang
                  </>
                )}
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>

            {!isAuthenticated && (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate("/login")}
                className="px-10 py-5 bg-transparent text-white border-2 border-gray-800 rounded-xl font-bold text-lg hover:bg-gray-900/50 hover:border-gray-700 transition-all"
              >
                Sudah Punya Akun? Login
              </motion.button>
            )}
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="pt-12 flex flex-wrap justify-center items-center gap-8 text-gray-400"
          >
            <TrustBadge icon={BookOpen} text="Mudah Digunakan" delay={0} />
            <div className="w-1 h-1 bg-emerald-500/50 rounded-full" />
            <TrustBadge icon={Zap} text="Tanpa Email" delay={0.1} />
            <div className="w-1 h-1 bg-emerald-500/50 rounded-full" />
            <TrustBadge icon={Crown} text="Premium Features" delay={0.2} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Trust Badge Component
const TrustBadge: React.FC<{ icon: React.ElementType; text: string; delay: number }> = ({
  icon: Icon,
  text,
  delay,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.1, y: -5 }}
      className="flex items-center gap-2 cursor-default"
    >
      <Icon className="h-5 w-5 text-emerald-400" />
      <span className="font-semibold text-gray-300">{text}</span>
    </motion.div>
  );
};
