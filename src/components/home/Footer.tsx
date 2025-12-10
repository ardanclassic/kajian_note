import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Twitter, Instagram, Mail, Heart, Quote } from "lucide-react";
import "@/styles/arabic-font.css";

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  // Array hadist/quote tentang menuntut ilmu
  const islamicQuotes = [
    {
      arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
      translation:
        "Barangsiapa menempuh jalan untuk mencari ilmu, maka Allah akan memudahkan baginya jalan menuju surga",
      source: "HR. Muslim",
    },
    {
      arabic: "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ",
      translation: "Menuntut ilmu adalah kewajiban bagi setiap muslim",
      source: "HR. Ibnu Majah",
    },
  ];

  // Random quote on each render
  const [selectedQuote] = React.useState(() => islamicQuotes[Math.floor(Math.random() * islamicQuotes.length)]);

  return (
    <footer className="relative bg-black border-t border-gray-800 py-16 overflow-hidden">
      {/* Glow Orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

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

      <div className="relative container mx-auto px-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <motion.div
              className="flex items-center gap-3 group cursor-pointer"
              whileHover={{ x: 5 }}
              onClick={() => onNavigate("/")}
            >
              <div className="w-12 h-12 rounded-xl bg-gray-900 border border-emerald-500/30 flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/30 transition-shadow">
                <BookOpen className="h-7 w-7 text-emerald-400" />
              </div>
              <span className="text-2xl font-bold text-emerald-400">Kajian Note</span>
            </motion.div>

            <p className="text-gray-400 leading-relaxed max-w-md">
              Platform catatan kajian terbaik untuk jamaah masjid di Indonesia. Mudah, cepat, dan powerful untuk
              mencatat ilmu bermanfaat.
            </p>

            {/* Social Media */}
            {/* <div className="flex gap-3 pt-2">
              <SocialIcon icon={Twitter} href="#" delay={0} />
              <SocialIcon icon={Instagram} href="#" delay={0.1} />
              <SocialIcon icon={Mail} href="#" delay={0.2} />
            </div> */}
          </motion.div>

          {/* Islamic Quote Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative"
          >
            <div className="relative bg-black rounded-2xl p-8 border border-gray-800 hover:border-emerald-500/30 transition-all hover:-translate-y-1 overflow-hidden">
              {/* Glow on Hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-emerald-500/5 blur-xl" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Quote Icon */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gray-900 border border-emerald-500/30 flex items-center justify-center">
                    <Quote className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">Tentang Menuntut Ilmu</span>
                </div>

                {/* Arabic Text */}
                <p className="text-2xl text-white arabic-tajawal leading-loose mb-4 text-right" dir="rtl">
                  {selectedQuote.arabic}
                </p>

                {/* Translation */}
                <p className="text-gray-300 leading-relaxed mb-3 italic">"{selectedQuote.translation}"</p>

                {/* Source */}
                <p className="text-sm text-emerald-400 font-semibold">— {selectedQuote.source}</p>
              </div>

              {/* Sharp Corner Highlights */}
              <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute top-0 right-0 w-px h-12 bg-linear-to-b from-emerald-500/50 to-transparent" />
                <div className="absolute top-0 right-0 h-px w-12 bg-linear-to-l from-emerald-500/50 to-transparent" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="h-px bg-linear-to-r from-transparent via-gray-800 to-transparent mb-8"
        />

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-sm text-gray-500">© 2025 Kajian Note. All rights reserved.</p>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Made with</span>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Heart className="h-4 w-4 text-emerald-500 fill-current" />
            </motion.div>
            <span>in Indonesia</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

// Social Icon Component
interface SocialIconProps {
  icon: React.ElementType;
  href: string;
  delay: number;
}

const SocialIcon: React.FC<SocialIconProps> = ({ icon: Icon, href, delay }) => {
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.9 }}
      className="w-10 h-10 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
    >
      <Icon className="h-5 w-5" />
    </motion.a>
  );
};
