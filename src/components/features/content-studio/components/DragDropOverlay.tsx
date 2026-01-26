
import { motion, AnimatePresence } from 'framer-motion';
import { FileJson, Image, Upload } from 'lucide-react';
import { cn } from "@/lib/utils";

interface DragDropOverlayProps {
  isDragging: boolean;
  dragType: 'image' | 'blueprint' | 'invalid' | null;
}

export function DragDropOverlay({ isDragging, dragType }: DragDropOverlayProps) {
  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/80 pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className={cn(
              "flex flex-col items-center gap-6 p-12 rounded-2xl border-2 transition-colors",
              dragType === 'blueprint'
                ? "border-blue-500 bg-blue-500/10"
                : dragType === 'image'
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-white/20 bg-white/5"
            )}
          >
            {dragType === 'blueprint' && (
              <>
                <div className="p-6 rounded-full bg-blue-500/20 text-blue-400">
                  <FileJson size={64} strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Import Blueprint</h3>
                  <p className="text-blue-200/60 text-lg">Lepaskan file JSON untuk load blueprint konten</p>
                </div>
              </>
            )}

            {dragType === 'image' && (
              <>
                <div className="p-6 rounded-full bg-purple-500/20 text-purple-400">
                  <Image size={64} strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Add Image</h3>
                  <p className="text-purple-200/60 text-lg">Lepaskan gambar untuk memasukkan ke canvas</p>
                </div>
              </>
            )}

            {dragType === 'invalid' && (
              <>
                <div className="p-6 rounded-full bg-red-500/20 text-red-400">
                  <Upload size={64} strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">File Tidak Didukung</h3>
                  <p className="text-red-200/60 text-lg">Hanya mendukung file JSON atau Gambar</p>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
