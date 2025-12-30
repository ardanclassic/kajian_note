/**
 * Content Studio Page - Main Editor
 * Canvas-based content creation tool
 */

import { motion } from "framer-motion";
import { Editor } from "@/components/features/content-studio/Editor";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function ContentStudio() {
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
