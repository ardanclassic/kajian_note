import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BookOpen, Crown, Sparkles, CheckCircle2, X, Zap, ArrowRight } from "lucide-react";

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
  onNavigate = () => {},
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
          <div className="px-6 py-2 bg-gray-900 border border-emerald-500/50 rounded-full text-emerald-400 font-bold text-sm shadow-lg shadow-emerald-500/30 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Terpopuler
          </div>
        </div>
      )}

      <div
        className={`group relative h-full bg-black rounded-2xl p-8 border transition-all duration-500 hover:-translate-y-1 overflow-hidden ${
          popular
            ? "border-emerald-500/50 shadow-xl shadow-emerald-500/20"
            : "border-gray-800 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10"
        }`}
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-emerald-500/5 blur-xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Icon with Glow */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            className={`relative inline-flex w-14 h-14 rounded-xl ${
              popular ? "bg-gray-900 border border-emerald-500/30" : "bg-gray-900 border border-gray-800"
            } items-center justify-center mb-6 shadow-lg group-hover:shadow-emerald-500/30 transition-shadow`}
          >
            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            <Icon className={`relative h-7 w-7 ${popular ? "text-emerald-400" : "text-emerald-400"}`} />
          </motion.div>

          {/* Tier Info */}
          <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
          <p className="text-gray-400 text-sm mb-4">{description}</p>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-black ${popular ? "text-emerald-400" : "text-white"}`}>{price}</span>
              <span className="text-gray-400">{period}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-linear-to-r from-transparent via-gray-800 to-transparent mb-6" />

          {/* Features */}
          <div className="flex-1 space-y-3 mb-8">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
              </div>
            ))}

            {notIncluded.map((feature, i) => (
              <div key={`not-${i}`} className="flex items-start gap-3 opacity-40">
                <div className="shrink-0 w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center mt-0.5">
                  <X className="h-3.5 w-3.5 text-gray-600" />
                </div>
                <span className="text-gray-500 text-sm leading-relaxed line-through">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (name === "Free") {
                onNavigate(isAuthenticated ? "/subscription" : "/register");
              } else {
                onNavigate(isAuthenticated ? "/subscription" : "/register");
              }
            }}
            className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              popular
                ? "bg-gray-900 border border-emerald-500/50 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
                : "bg-transparent text-white border border-gray-800 hover:bg-gray-900/50 hover:border-gray-700"
            }`}
          >
            {name === "Free"
              ? isAuthenticated
                ? "Paket Aktif"
                : "Mulai Gratis"
              : isAuthenticated
              ? "Upgrade Sekarang"
              : "Daftar & Upgrade"}
            {name !== "Free" && <ArrowRight className="h-5 w-5" />}
          </motion.button>
        </div>

        {/* Sharp Corner Highlights */}
        <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute top-0 right-0 w-px h-12 bg-linear-to-b from-emerald-500/50 to-transparent" />
          <div className="absolute top-0 right-0 h-px w-12 bg-linear-to-l from-emerald-500/50 to-transparent" />
        </div>
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
      name: "Free",
      price: "Rp 0",
      period: "/selamanya",
      description: "Untuk mencoba platform",
      features: [
        "10 note maksimal",
        "Pencarian & filter catatan",
        "Organisasi dengan tag",
        "Username + PIN login",
        "Akses via web & mobile",
        "AI Summary",
        "Import dari YouTube",
      ],
      notIncluded: ["Export PDF", "Kirim ke Telegram", "Bagikan via WhatsApp"],
      icon: BookOpen,
      popular: false,
    },
    {
      name: "Premium",
      price: "Rp 50K",
      period: "/bulan",
      description: "Paling populer",
      features: ["Semua fitur Free", "100 note maksimal", "Export ke PDF", "Kirim ke Telegram", "Bagikan via WhatsApp"],
      icon: Crown,
      popular: true,
    },
    {
      name: "Advance",
      price: "Rp 100K",
      period: "/bulan",
      description: "Untuk power user",
      features: [
        "Semua fitur Premium",
        "Unlimited note",
        "Unlimited AI Summary",
        "Custom export format",
        "Early access fitur baru",
      ],
      icon: Sparkles,
      popular: false,
    },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-black overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

      {/* Subtle Grid */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `radial-gradient(circle at center, rgba(16,185,129,0.5) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="relative container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-emerald-500/50 text-emerald-400 rounded-full text-sm font-semibold shadow-lg shadow-emerald-500/20">
            <Zap className="h-4 w-4" />
            Harga Terjangkau
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white">Pilih Paket yang Sesuai</h2>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Mulai gratis, upgrade kapan saja. Tidak ada biaya tersembunyi.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
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

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center space-y-6"
        >
          <div className="flex flex-wrap justify-center gap-6 items-center">
            <div className="flex items-center gap-2 px-6 py-3 bg-black rounded-full border border-gray-800 shadow-lg">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span className="font-semibold text-gray-300">Cancel kapan saja</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-black rounded-full border border-gray-800 shadow-lg">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span className="font-semibold text-gray-300">Pembayaran aman</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
