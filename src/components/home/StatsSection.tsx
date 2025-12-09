/**
 * StatsSection.tsx
 * Animated statistics section dengan counter effect
 */

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { Users, BookOpen, Award, TrendingUp } from "lucide-react";

interface StatItemProps {
  icon: React.ElementType;
  value: number;
  label: string;
  suffix?: string;
  color: string;
  delay: number;
}

const StatItem: React.FC<StatItemProps> = ({ icon: Icon, value, label, suffix = "", color, delay }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 2000 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, motionValue, value]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      setDisplayValue(Math.floor(latest));
    });
  }, [springValue]);

  const colorClasses: any = {
    emerald: "from-emerald-500 to-teal-500",
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
    orange: "from-orange-500 to-red-500",
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="relative group"
    >
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Background Gradient on Hover */}
        <div
          className={`absolute inset-0 bg-linear-to-br ${colorClasses[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
        />

        {/* Icon */}
        <div
          className={`relative mb-4 inline-flex items-center justify-center w-16 h-16 rounded-xl bg-linear-to-br ${colorClasses[color]} shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="h-8 w-8 text-white" />
        </div>

        {/* Counter */}
        <div className="relative">
          <motion.h3
            className={`text-5xl md:text-6xl font-black bg-linear-to-r ${colorClasses[color]} bg-clip-text text-transparent mb-2`}
          >
            {displayValue}
            {suffix}
          </motion.h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">{label}</p>
        </div>

        {/* Decorative Element */}
        <motion.div
          className={`absolute -right-4 -bottom-4 w-24 h-24 bg-linear-to-br ${colorClasses[color]} rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500`}
        />
      </div>
    </motion.div>
  );
};

export const StatsSection: React.FC = () => {
  const stats = [
    {
      icon: Users,
      value: 500,
      suffix: "+",
      label: "Jamaah Aktif",
      color: "emerald" as const,
      delay: 0.1,
    },
    {
      icon: BookOpen,
      value: 2000,
      suffix: "+",
      label: "Catatan Tersimpan",
      color: "blue" as const,
      delay: 0.2,
    },
    {
      icon: Award,
      value: 50,
      suffix: "+",
      label: "Ustadz Bergabung",
      color: "purple" as const,
      delay: 0.3,
    },
    {
      icon: TrendingUp,
      value: 98,
      suffix: "%",
      label: "Kepuasan Pengguna",
      color: "orange" as const,
      delay: 0.4,
    },
  ];

  return (
    <section className="relative py-20 md:py-32 bg-linear-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-semibold mb-4">
            <TrendingUp className="h-4 w-4" />
            Dipercaya Ribuan Pengguna
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white">
            Statistik Platform
          </h2>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan jamaah yang sudah merasakan manfaat Kajian Note
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatItem key={index} {...stat} />
          ))}
        </div>

        {/* Bottom Decoration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-linear-to-r from-emerald-600 to-blue-600 text-white rounded-full shadow-2xl">
            <Award className="h-6 w-6" />
            <span className="text-lg font-semibold">Platform #1 Catatan Kajian di Indonesia</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
