/**
 * Content Studio Page - Main Editor
 * Canvas-based content creation tool
 */

import { motion } from "framer-motion";
import { Editor } from "@/components/features/content-studio/Editor";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function ContentStudio() {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // Tablet/Mobile check (lg breakpoint)
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-black/95 text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto ring-1 ring-emerald-500/30">
            <Smartphone className="w-10 h-10 text-emerald-500" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-emerald-400 to-blue-500">
              Mobile Version Coming Soon
            </h1>
            <p className="text-gray-400 my-5!">
              Content Studio saat ini dioptimalkan untuk Desktop agar memberikan pengalaman desain terbaik. Versi mobile sedang dalam tahap pengembangan.
            </p>
          </div>

          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="rounded-full border-gray-700 hover:bg-gray-800 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="content-studio-page"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: 'var(--background)'
      }}
    >
      <Editor />
    </motion.div>
  );
}
