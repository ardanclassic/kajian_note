/**
 * List Content Studio Page
 * Shows list of saved projects (placeholder for now)
 */

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function ListContentStudio() {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Content Studio
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create stunning visual content with our canvas editor
          </p>
        </div>
        <Button
          onClick={() => navigate("/content-studio/create")}
          size="lg"
          className="gap-2"
        >
          <Plus className="w-5 h-5" />
          New Project
        </Button>
      </div>

      {/* Empty State */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6">
          <Palette className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Start Creating
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
          Design beautiful slides, social media posts, and visual content with our powerful canvas editor
        </p>
        <Button
          onClick={() => navigate("/content-studio/create")}
          size="lg"
          className="gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Your First Project
        </Button>
      </motion.div>

      {/* Future: Project Grid will go here */}
    </motion.div>
  );
}
