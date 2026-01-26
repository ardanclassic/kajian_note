import { motion } from "framer-motion";
import { useState } from "react";
import { Wand2, Image as ImageIcon, Heart, Sparkles } from "lucide-react";
import { TopHeader } from "@/components/layout/TopHeader";
import ImagePromptDialog from "./dialogs/ImagePromptDialog";
import TaarufPromptDialog from "./dialogs/TaarufPromptDialog";
import StorybookPromptDialog from "./dialogs/StorybookPromptDialog";
import { BookOpen } from "lucide-react";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const generatorTypes = [
  {
    id: "image",
    title: "Image & Poster",
    description: "Generate AI prompts untuk membuat gambar, poster, dan visual content yang menarik.",
    icon: ImageIcon,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    hoverBg: "hover:bg-purple-500/20",
    available: true,
  },
  {
    id: "taaruf",
    title: "Biodata Ta'aruf",
    description: "Generate AI prompts untuk membuat biodata Ta'aruf yang profesional dan Islami.",
    icon: Heart,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
    hoverBg: "hover:bg-pink-500/20",
    available: true,
  },
  {
    id: "storybook",
    title: "Islamic Storybook",
    description: "Generate AI prompts untuk membuat storyboard buku anak islami.",
    icon: BookOpen,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    hoverBg: "hover:bg-emerald-500/20",
    available: true,
  },
];

export function PromptStudioPage() {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const handleGeneratorClick = (id: string) => {
    const generator = generatorTypes.find((g) => g.id === id);
    if (generator?.available) {
      setOpenDialog(id);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <TopHeader
        backButton
        backTo="/dashboard"
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
        {/* Background Decor */}
        <div className="absolute top-0 right-0 -z-10 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-500/5 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -z-10 w-[200px] md:w-[500px] h-[200px] md:h-[500px] bg-pink-500/5 rounded-full blur-3xl opacity-50 pointer-events-none" />

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 md:mb-12">
          <div className="space-y-3 md:space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-extrabold tracking-tight"
            >
              <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-pink-500 to-purple-600">
                Prompt Studio
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base md:text-lg text-gray-400 max-w-2xl leading-relaxed"
            >
              Buat prompt AI yang profesional dan efisien untuk berbagai kebutuhan konten Anda.
              Dari image generation hingga artikel berkualitas tinggi.
            </motion.p>
          </div>
        </div>

        {/* Generator Type Cards */}
        <div className="space-y-3 mb-6">
          <h2 className="text-xl! md:text-2xl! font-bold text-white">Pilih Generator</h2>
          <p className="text-sm md:text-base text-gray-400">
            Pilih tipe konten yang ingin Anda buat dengan AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-12">
          {generatorTypes.map((generator, index) => (
            <motion.div
              key={generator.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              onClick={() => handleGeneratorClick(generator.id)}
              className={`relative p-5 md:p-6 rounded-2xl border ${generator.borderColor} ${generator.bg} backdrop-blur-xs transition-all duration-300 group ${generator.available
                ? `${generator.hoverBg} hover:border-opacity-60 cursor-pointer hover:shadow-xl hover:shadow-${generator.color}/10 hover:-translate-y-1`
                : "opacity-60 cursor-not-allowed"
                }`}
            >
              {/* Coming Soon Badge */}
              {!generator.available && (
                <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-gray-800/80 border border-gray-700/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Coming Soon
                </div>
              )}

              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl ${generator.bg} ${generator.color} flex items-center justify-center mb-4 ${generator.available ? "group-hover:scale-110" : ""
                } transition-transform duration-300`}>
                <generator.icon className="w-6 h-6 md:w-7 md:h-7" />
              </div>

              <h3 className={`text-lg font-bold text-gray-100 mb-2! ${generator.available ? "group-hover:text-white" : ""
                } transition-colors`}>
                {generator.title}
              </h3>

              <p className="text-xs md:text-sm text-gray-400 leading-normal! mb-4!">
                {generator.description}
              </p>

              {generator.available && (
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 group-hover:text-purple-300 transition-colors uppercase tracking-wide">
                  <span>Mulai Generate</span>
                  <Wand2 className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* About Section - NOW AT BOTTOM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-5 md:p-6 rounded-2xl bg-linear-to-br from-gray-900/50 to-gray-900/10 border border-gray-800/30 backdrop-blur-sm"
        >
          <div className="flex items-start gap-4">
            <div className="flex-none p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-lg! md:text-xl! font-bold text-white mb-3!">Mengapa Prompt Studio?</h2>
              <p className="text-sm text-gray-400 leading-relaxed max-w-4xl">
                Banyak pengguna mengalami kendala dalam merancang prompt yang efektif. Prompt Studio hadir untuk membantu Anda menyusun prompt yang <span className="text-purple-400 font-semibold">terstruktur</span>,{" "}
                <span className="text-pink-400 font-semibold">detail</span>, dan{" "}
                <span className="text-blue-400 font-semibold">best practice</span> — memastikan hasil output AI yang akurat dan sesuai harapan.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Dialogs */}
      <ImagePromptDialog
        open={openDialog === "image"}
        onOpenChange={(open: any) => setOpenDialog(open ? "image" : null)}
      />
      <TaarufPromptDialog
        open={openDialog === "taaruf"}
        onOpenChange={(open: any) => setOpenDialog(open ? "taaruf" : null)}
      />
      <StorybookPromptDialog
        open={openDialog === "storybook"}
        onOpenChange={(open: any) => setOpenDialog(open ? "storybook" : null)}
      />
    </div >
  );
}
