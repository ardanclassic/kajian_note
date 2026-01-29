import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Youtube,
  Sparkles,
  Palette,
  Gamepad2,
  Wand2,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  gradient: string;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, color, gradient, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Gradient Blob */}
      <div
        className={cn(
          "absolute inset-0 rounded-3xl blur-2xl opacity-0 transition-opacity duration-500",
          gradient,
          isHovered ? "opacity-20" : "opacity-0"
        )}
      />

      <div className="relative h-full bg-[#0A0A0A] rounded-3xl p-8 border border-gray-800 transition-all duration-500 hover:border-gray-700 hover:translate-y-[-4px] overflow-hidden flex flex-col z-10">

        {/* Header Icon */}
        <div className="mb-6 flex justify-between items-start">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
            "bg-gray-900 border border-gray-800",
            isHovered ? "scale-110 rotate-3" : ""
          )}>
            <Icon className={cn("w-7 h-7 transition-colors duration-300", color)} />
          </div>

          <div className={cn(
            "text-2xl font-bold opacity-10 transition-all duration-500 select-none font-mono",
            isHovered ? "opacity-20 scale-125" : ""
          )}>
            0{index + 1}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-50 transition-colors">
          {title}
        </h3>
        <p className="text-gray-400 leading-relaxed mb-6 flex-grow">
          {description}
        </p>

        {/* Footer Link */}
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 group-hover:text-white transition-colors mt-auto">
          <span>Explore Feature</span>
          <ArrowRight className={cn(
            "w-4 h-4 transition-transform duration-300",
            isHovered ? "translate-x-1" : ""
          )} />
        </div>
      </div>
    </motion.div>
  );
};

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Youtube,
      title: "Smart Summary",
      description: "Import kajian YouTube dan biarkan AI merangkum intisarinya. Dapatkan poin, dalil, dan kesimpulan tanpa perlu menonton ulang berjam-jam.",
      color: "text-red-500",
      gradient: "bg-red-500",
    },
    {
      icon: Palette,
      title: "Content Studio",
      description: "Ubah catatanmu menjadi poster atau slide dakwah yang estetik dengan editor drag-and-drop. Dakwah visual jadi lebih mudah.",
      color: "text-purple-500",
      gradient: "bg-purple-500",
    },
    {
      icon: Wand2,
      title: "Prompt Studio",
      description: "Buntu ide? Gunakan generator prompt kami untuk membuat gambar AI, biodata Ta'aruf, atau cerita anak islami yang berkualitas.",
      color: "text-blue-400",
      gradient: "bg-blue-500",
    },
    {
      icon: Gamepad2,
      title: "Quest & Multiplayer",
      description: "Uji wawasan keislamanmu lewat kuis interaktif. Tantang teman di mode Multiplayer untuk pengalaman belajar yang seru.",
      color: "text-emerald-400",
      gradient: "bg-emerald-500",
    },
    {
      icon: BookOpen,
      title: "Digital Library",
      description: "Simpan dan organisir semua ilmu yang kamu dapatkan. Cari kembali catatan lama dengan mudah kapanpun dibutuhkan.",
      color: "text-yellow-400",
      gradient: "bg-yellow-500",
    },
    {
      icon: Sparkles,
      title: "Premium Experience",
      description: "Nikmati fitur eksklusif seperti unlimited summary, export PDF, dan akses prioritas ke update fitur terbaru.",
      color: "text-pink-400",
      gradient: "bg-pink-500",
    },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-black overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[100px]" />

      <div className="relative container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-full text-xs font-semibold text-gray-300 uppercase tracking-widest">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            Fitur Unggulan
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
            Ecosystem for <span className="text-emerald-500">Growth</span>
          </h2>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Kami menyediakan toolset lengkap untuk menemani perjalanan menuntut ilmu Anda,
            dari mencatat hingga berbagi.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
