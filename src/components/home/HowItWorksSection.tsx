import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { UserPlus, BookOpen, Share2, ArrowRight } from "lucide-react";

interface StepCardProps {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
  isLast?: boolean;
}

const StepCard: React.FC<StepCardProps> = ({ number, icon: Icon, title, description, index, isLast = false }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="relative">
      {/* Connecting Line */}
      {!isLast && (
        <div className="hidden lg:block absolute left-1/2 top-full h-16 w-px -translate-x-1/2 mt-8">
          <motion.div
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : {}}
            transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
            className="h-full w-full bg-linear-to-b from-emerald-500 to-transparent origin-top"
          />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: index * 0.15 }}
        className="group"
      >
        <div className="relative bg-black rounded-2xl p-8 border border-gray-800 hover:border-emerald-500/50 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
          {/* Glow Effect on Hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-emerald-500/5 blur-xl" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Number Badge & Icon */}
            <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
              <div className="relative shrink-0">
                {/* Number Circle with Glow */}
                <div className="relative w-16 h-16 rounded-xl bg-gray-900 flex items-center justify-center border border-emerald-500/30 group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-shadow">
                  <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  <span className="relative text-2xl font-black text-emerald-400">{number}</span>
                </div>

                {/* Icon Badge */}
                <div className="absolute -bottom-2 -right-5 w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center border-2 border-black">
                  <Icon className="h-5 w-5 text-emerald-400" />
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1 pt-2">
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                  {title}
                </h3>
                <p className="text-gray-400 leading-relaxed">{description}</p>
              </div>
            </div>
          </div>

          {/* Sharp Corner Highlights */}
          <div className="absolute top-0 right-0 w-24 h-24">
            <div className="absolute top-0 right-0 w-px h-12 bg-linear-to-b from-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 h-px w-12 bg-linear-to-l from-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: "1",
      icon: UserPlus,
      title: "Daftar dengan Mudah",
      description:
        "Buat akun hanya dengan username dan PIN 6 digit. Tidak perlu email, tidak perlu verifikasi rumit. Langsung bisa digunakan!",
    },
    {
      number: "2",
      icon: BookOpen,
      title: "Mulai Catat Kajian",
      description:
        "Tulis catatan kajian dengan editor yang mudah digunakan. Bisa manual atau import langsung dari video YouTube dengan AI Summary.",
    },
    {
      number: "3",
      icon: Share2,
      title: "Bagikan & Export",
      description:
        "Upgrade ke Premium untuk export PDF, kirim ke Telegram, atau bagikan via WhatsApp. Sebarkan ilmu dengan mudah!",
    },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-black overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

      {/* Minimal Grid Pattern */}
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

      <div className="relative container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-emerald-500/50 text-emerald-400 rounded-full text-sm font-semibold shadow-lg shadow-emerald-500/20">
            <ArrowRight className="h-4 w-4" />
            Cara Kerja
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white">Mudah dan Sederhana</h2>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Hanya 3 langkah untuk mulai mencatat dan mengelola catatan kajian Anda
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto space-y-8">
          {steps.map((step, index) => (
            <StepCard key={index} {...step} index={index} isLast={index === steps.length - 1} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex flex-col items-center gap-6 p-10 bg-black rounded-2xl border border-gray-800 max-w-2xl hover:border-emerald-500/30 transition-colors">
            <h3 className="text-2xl md:text-3xl font-bold text-white">Siap Memulai?</h3>
            <p className="text-gray-400">Bergabunglah dengan jamaah yang sudah merasakan kemudahan mencatat kajian</p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gray-900 border border-emerald-500/50 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center gap-2"
            >
              Daftar Gratis Sekarang
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
