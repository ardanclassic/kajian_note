import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Wallet, ShieldCheck, Zap } from "lucide-react";

interface CTASectionProps {
  isAuthenticated: boolean;
  onNavigate: (path: string) => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ isAuthenticated, onNavigate }) => {
  return (
    <section className="relative py-32 overflow-hidden bg-black selection:bg-emerald-500/30">

      {/* Dynamic Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="relative container mx-auto px-4 max-w-5xl text-center">

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 p-8 md:p-12 rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl"
        >
          {/* Floating Badge */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-black border border-emerald-500/50 rounded-full flex items-center gap-2 shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">Join The Movement</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight mt-4">
            Jangan Biarkan Ilmu <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Hilang Begitu Saja.</span>
          </h2>

          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Bergabunglah dengan ribuan penuntut ilmu yang menggunakan Alwaah untuk mencatat,
            berkarya, dan bertumbuh setiap harinya.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => onNavigate(isAuthenticated ? "/dashboard" : "/register")}
              className="px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-2"
            >
              {isAuthenticated ? "Buka Dashboard Saya" : "Mulai Gratis Sekarang"}
              <ArrowRight className="w-5 h-5" />
            </button>

            {!isAuthenticated && (
              <button
                onClick={() => onNavigate("/login")}
                className="px-10 py-5 bg-transparent border border-white/20 text-white font-semibold text-lg rounded-full hover:bg-white/10 transition-all"
              >
                Sudah Punya Akun?
              </button>
            )}
          </div>

          {/* Trust Footnotes */}
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap justify-center gap-8 md:gap-12">
            <div className="flex items-center gap-3 text-gray-400">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span className="font-medium">Data Privasi Terjamin</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <Wallet className="w-5 h-5 text-emerald-500" />
              <span className="font-medium">Tanpa Kartu Kredit</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <Zap className="w-5 h-5 text-emerald-500" />
              <span className="font-medium">Setup dalam 1 Menit</span>
            </div>
          </div>

        </motion.div>

      </div>
    </section>
  );
};
