// Loading Overlay - Show loading state during operations

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-[4px] flex items-center justify-center z-[9999]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center text-white">
        <Loader2 size={48} className="animate-spin mx-auto mb-4 text-blue-500" />
        <p className="text-base font-medium m-0">{message}</p>
      </div>
    </motion.div>
  );
}
