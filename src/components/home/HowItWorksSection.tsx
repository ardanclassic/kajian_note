import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { UserPlus, Youtube, Gamepad2, ArrowRight } from "lucide-react";

interface StepCardProps {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
  isLast?: boolean;
}
interface HowItWorksSectionProps {
  isAuthenticated: boolean;
}

const StepCard: React.FC<StepCardProps> = ({ number, icon: Icon, title, description, index, isLast = false }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="relative flex-1">
      {/* Connecting Line (Desktop) */}
      {!isLast && (
        <div className="hidden lg:block absolute top-[2.5rem] left-[50%] right-[-50%] h-[2px]">
          <div className="w-full h-full bg-gray-800" />
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute inset-0 bg-emerald-500 origin-left"
          />
        </div>
      )}

      {/* Connecting Line (Mobile) */}
      {!isLast && (
        <div className="lg:hidden absolute left-[2.5rem] top-[50%] bottom-[-50%] w-[2px]">
          <div className="w-full h-full bg-gray-800" />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: index * 0.2 }}
        className="relative z-10 flex lg:flex-col items-start lg:items-center gap-6 lg:gap-8 lg:text-center p-4"
      >
        {/* Icon Circle */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-full bg-black border border-gray-800 flex items-center justify-center shadow-2xl relative z-10 group hover:border-emerald-500/50 transition-colors">
            <Icon className="w-8 h-8 text-gray-300 group-hover:text-emerald-400 transition-colors" />
          </div>
          {/* Glow under icon */}
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full z-0" />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3 pb-8 lg:pb-0">
          <h3 className="text-xl font-bold text-white">
            {title}
          </h3>
          <p className="text-gray-400 leading-relaxed text-sm lg:text-base">
            {description}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ isAuthenticated }) => {
  const steps = [
    {
      number: "1",
      icon: UserPlus,
      title: "Daftar Cepat",
      description:
        "Buat akun hanya dengan Username & PIN. Privasi terjaga, tanpa email ribet.",
    },
    {
      number: "2",
      icon: Youtube,
      title: "Import Kajian",
      description:
        "Paste link YouTube favoritmu, biarkan AI merangkum poin-poin pentingnya.",
    },
    {
      number: "3",
      icon: Gamepad2,
      title: "Explore & Play",
      description:
        "Uji pemahaman lewat Quest, atau buat karya visual dengan Content Studio.",
    },
  ];

  return (
    <section className="relative py-24 bg-gray-950 overflow-hidden">

      <div className="relative container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Mulai dalam Hitungan Detik</h2>
          <p className="text-xl text-gray-400">
            Kami desain Alwaah agar ramah untuk siapa saja, bahkan yang gaptek sekalipun.
          </p>
        </div>

        {/* Steps Horizontal Flow */}
        <div className="flex flex-col lg:flex-row justify-between gap-8 relative max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <StepCard key={index} {...step} index={index} isLast={index === steps.length - 1} />
          ))}
        </div>

        {isAuthenticated ? null : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-white text-black rounded-full font-bold text-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all flex items-center gap-2 mx-auto"
            >
              Coba Gratis Sekarang
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
};
