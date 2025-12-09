import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Youtube, Sparkles, Download, Send, Share2, Shield } from "lucide-react";

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, color, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative"
    >
      <div className="relative h-full bg-black rounded-2xl p-8 border border-gray-800 hover:border-emerald-500/50 transition-all duration-500 overflow-hidden">
        {/* Neon Glow Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className={`absolute inset-0 ${color} blur-2xl opacity-20`} />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Icon with Glow */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="relative inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gray-900 mb-6 group-hover:shadow-2xl transition-shadow"
          >
            <div
              className={`absolute inset-0 ${color} blur-xl opacity-0 group-hover:opacity-60 transition-opacity rounded-xl`}
            />
            <Icon className={`relative h-8 w-8 ${color.replace("bg-", "text-")}`} />
          </motion.div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">{title}</h3>

          {/* Description */}
          <p className="text-gray-400 leading-relaxed">{description}</p>
        </div>

        {/* Sharp Edge Highlight */}
        <div className="absolute top-0 right-0 w-24 h-24">
          <div className="absolute top-0 right-0 w-px h-12 bg-gradient-to-b from-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-0 right-0 h-px w-12 bg-gradient-to-l from-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </motion.div>
  );
};

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Youtube,
      title: "Import dari YouTube",
      description: "Ambil transcript video kajian dari YouTube secara otomatis. Lengkap dengan metadata dan timestamp.",
      color: "bg-red-500",
    },
    {
      icon: Sparkles,
      title: "AI Summary",
      description: "Ringkas catatan panjang menjadi poin-poin penting dengan teknologi AI. Hemat waktu membaca.",
      color: "bg-yellow-500",
    },
    {
      icon: Download,
      title: "Export PDF",
      description: "Unduh catatan dalam format PDF untuk dibaca offline atau dicetak. Tersedia untuk tier Premium.",
      color: "bg-purple-500",
    },
    {
      icon: Send,
      title: "Kirim ke Telegram",
      description: "Kirim catatan langsung ke Telegram Anda. Akses catatan dari mana saja dengan mudah.",
      color: "bg-cyan-500",
    },
    {
      icon: Share2,
      title: "Bagikan via WhatsApp",
      description: "Berbagi catatan bermanfaat dengan jamaah lain lewat WhatsApp. Sebarkan ilmu dengan mudah.",
      color: "bg-green-500",
    },
    {
      icon: Shield,
      title: "Auth Tanpa Email",
      description: "Daftar hanya dengan username dan PIN 6 digit. Mudah diingat, tidak perlu email rumit.",
      color: "bg-indigo-500",
    },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-black overflow-hidden">
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

      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-emerald-500/50 text-emerald-400 rounded-full text-sm font-semibold shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-4 w-4" />
            Fitur Lengkap & Powerful
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white">Semua yang Anda Butuhkan</h2>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Dirancang khusus untuk memudahkan jamaah mencatat, mengelola, dan berbagi ilmu dari kajian-kajian yang
            diikuti
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
