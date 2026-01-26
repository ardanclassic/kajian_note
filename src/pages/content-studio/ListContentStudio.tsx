/**
 * List Content Studio Page
 * Shows list of saved projects (placeholder for now)
 */

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, Palette, Wand2, Share2, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopHeader } from "@/components/layout/TopHeader";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const features = [
  {
    icon: Wand2,
    title: "Desain Smart AI",
    description: "Ubah catatan jadi slide cantik instan dengan smart layout.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Palette,
    title: "Kanvas Kreatif",
    description: "Kontrol penuh kreativitas dengan editor drag-and-drop.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Share2,
    title: "Siap Sosmed",
    description: "Export gambar presisi untuk Instagram, WA, dan Telegram.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
];

export default function ListContentStudio() {
  const navigate = useNavigate();

  const headerActions = (
    <Button
      onClick={() => navigate("/content-studio/create")}
      className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 transition-all"
      size="sm"
    >
      <Plus className="w-4 h-4 sm:mr-2" />
      <span className="hidden sm:inline">Buat Project</span>
    </Button>
  );

  return (
    <div className="min-h-screen bg-black">
      <TopHeader
        backButton
        backTo="/dashboard"
        actions={headerActions}
        className="bg-black/50 backdrop-blur-md border-b border-gray-800/50"
      />

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 md:px-6 py-6 md:py-10"
      >
        {/* Background Decor - Responsive Size */}
        <div className="absolute top-0 right-0 -z-10 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-emerald-500/5 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -z-10 w-[200px] md:w-[500px] h-[200px] md:h-[500px] bg-blue-500/5 rounded-full blur-3xl opacity-50 pointer-events-none" />

        {/* Hero Section - Mobile Stacked */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10 md:mb-16">
          <div className="space-y-3 md:space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-extrabold tracking-tight"
            >
              <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-blue-500 to-purple-600">
                Content Studio
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base md:text-lg text-gray-400 max-w-xl leading-relaxed"
            >
              Ruang kreasi visual untuk konten dakwah Anda. Ubah catatan kajian menjadi poster, slide, dan quote yang menginspirasi.
            </motion.p>
          </div>

          {/* Mobile Only CTA - Hidden on Desktop */}
          <div className="flex items-center w-full md:hidden">
            <Button
              onClick={() => navigate("/content-studio/create")}
              size="lg"
              className="w-full h-12 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all group"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              Buat Project
            </Button>
          </div>
        </div>

        {/* Feature Grids - Catchy & Interactive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-xs hover:bg-gray-800/80 hover:border-emerald-500/30 transition-all duration-300 group cursor-default"
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h3 className="text-sm md:text-xl font-bold text-gray-100 mb-2! md:mb-3! group-hover:text-emerald-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-xs md:text-sm text-gray-400 leading-normal!">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

      </motion.div>
    </div>
  );
}
