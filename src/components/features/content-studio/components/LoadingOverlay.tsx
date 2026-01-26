import Lottie from 'lottie-react';
import { motion, AnimatePresence } from 'framer-motion';
import catAnimation from '@/assets/lottie/cats.json';

interface LoadingOverlayProps {
  isVisible: boolean;
  targetRatio: string | null;
  message?: string;
}

export function LoadingOverlay({ isVisible, targetRatio, message }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative h-80 w-80 flex items-center justify-center">
              <Lottie animationData={catAnimation} loop={true} className="w-full h-full" />
            </div>

            <div className="flex flex-col items-center gap-2 relative bottom-16">
              <h3 className="text-2xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                {message || "Lagi Ngerapihin Layout..."}
              </h3>
              {targetRatio && (
                <p className="text-sm text-blue-400/80 font-medium tracking-wide uppercase">
                  Menyesuaikan ke {targetRatio.replace(':', ' : ')}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
