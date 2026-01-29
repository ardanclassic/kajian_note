import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BookOpen, Crown, Sparkles, CheckCircle2, X, Zap, ArrowRight, Infinity } from "lucide-react";

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  notIncluded?: string[];
  popular?: boolean;
  icon: React.ElementType;
  index: number;
  isAuthenticated?: boolean;
  onNavigate?: (path: string) => void;
}

const PricingCard: React.FC<PricingCardProps> = ({
  name,
  price,
  period,
  description,
  features,
  notIncluded = [],
  popular = false,
  icon: Icon,
  index,
  isAuthenticated = false,
  onNavigate = () => { },
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative h-full"
    >
      {/* Popular Badge */}
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="px-6 py-1.5 bg-emerald-600 rounded-full text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            Most Popular
          </div>
        </div>
      )}

      <div
        className={`group relative h-full bg-[#0A0A0A] rounded-3xl p-8 border transition-all duration-500 flex flex-col ${popular
            ? "border-emerald-500/50 shadow-[0_0_40px_-10px_rgba(16,185,129,0.15)]"
            : "border-gray-800 hover:border-gray-700 hover:bg-gray-900/40"
          }`}
      >
        {/* Header */}
        <div className="mb-8">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${popular ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-900 text-gray-400'}`}>
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
          <p className="text-gray-400 text-sm h-10">{description}</p>
        </div>

        {/* Price */}
        <div className="mb-8 p-4 rounded-2xl bg-gray-900/50 border border-gray-800/50">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white tracking-tight">{price}</span>
            <span className="text-gray-500 text-sm">{period}</span>
          </div>
        </div>

        {/* Features List */}
        <div className="flex-1 space-y-4 mb-8">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Includes:</p>
          {features.map((feature, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle2 className={`w-5 h-5 shrink-0 ${popular ? 'text-emerald-400' : 'text-gray-400'}`} />
              <span className="text-gray-300 text-sm">{feature}</span>
            </div>
          ))}
          {notIncluded.map((feature, i) => (
            <div key={`not-${i}`} className="flex items-start gap-3 opacity-40">
              <X className="w-5 h-5 shrink-0 text-gray-600" />
              <span className="text-gray-500 text-sm line-through">{feature}</span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate(isAuthenticated ? "/subscription" : "/register")}
          className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${popular
              ? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              : "bg-white text-black hover:bg-gray-200"
            }`}
        >
          {name === "Free" ? "Mulai Gratis" : "Upgrade Sekarang"}
        </motion.button>

      </div>
    </motion.div>
  );
};

export const PricingSection: React.FC<{ isAuthenticated: boolean; onNavigate: (path: string) => void }> = ({
  isAuthenticated,
  onNavigate,
}) => {
  const tiers = [
    {
      name: "Starter",
      price: "Rp 0",
      period: "/selamanya",
      description: "Akses dasar ke ekosistem Alwaah untuk pemula.",
      features: [
        "10 Smart Summary / bulan",
        "Akses dasar Content Studio",
        "Bermain Quest (Limit harian)",
        "Pencarian & filter catatan",
        "100MB Cloud Storage",
      ],
      notIncluded: ["Export PDF High-Res", "Kirim ke Telegram", "Prompt Studio Access"],
      icon: BookOpen,
      popular: false,
    },
    {
      name: "Scholar",
      price: "Rp 50K",
      period: "/bulan",
      description: "Untuk penuntut ilmu yang serius ingin bertumbuh.",
      features: [
        "100 Smart Summary / bulan",
        "Full Akses Content Studio",
        "Full Akses Prompt Studio",
        "Unlimited Quest & Multiplayer",
        "Export ke PDF & Telegram",
        "Prioritas Support"
      ],
      icon: Crown,
      popular: true,
    },
    {
      name: "Visionary",
      price: "Rp 100K",
      period: "/bulan",
      description: "Fitur tanpa batas untuk creator & komunitas.",
      features: [
        "Unlimited Smart Summary",
        "Semua fitur Scholar",
        "4K Export Content Studio",
        "Multiplayer Host Mode",
        "Early Access Fitur Baru",
        "Verified Badge",
      ],
      icon: Infinity,
      popular: false,
    },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-black overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />

      <div className="relative container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16 space-y-4 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white">Investasi Terbaikmu</h2>
          <p className="text-xl text-gray-400">
            Pilih paket yang sesuai dengan kebutuhan belajarmu. <br className="hidden md:block" />
            Upgrade kapan saja, batalkan kapan saja.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
          {tiers.map((tier, index) => (
            <PricingCard
              key={index}
              {...tier}
              index={index}
              isAuthenticated={isAuthenticated}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Pembayaran Aman via QRIS</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Garansi 7 Hari Uang Kembali</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Bebas Iklan Mengganggu</span>
          </div>
        </div>

      </div>
    </section>
  );
};
