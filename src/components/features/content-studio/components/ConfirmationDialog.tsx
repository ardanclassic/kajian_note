import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  description?: React.ReactNode;
  confirmLabel?: string;
}

export function ConfirmationDialog({
  isOpen,
  onCancel,
  onConfirm,
  title = "Ganti Ukuran Canvas?",
  description,
  confirmLabel = "Ganti Aja"
}: ConfirmationDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="w-full max-w-[400px] rounded-2xl border border-white/10 bg-[#1A1A1A] p-6 shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500 ring-1 ring-yellow-500/20">
                <AlertTriangle size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl! font-semibold text-white leading-tight">{title}</h3>
            </div>

            <div className="mb-8 ml-[60px] -mt-2 text-[15px] text-gray-400 leading-relaxed">
              {description || (
                <p>
                  Desain kamu bakal <span className="text-white font-medium">reset total</span> ke design layout awal loh. Perubahan manual yg udah dibuat bakal hilang. Yakin mau ganti?
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-8 border-t border-white/5 pt-4">
              <button
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                onClick={onCancel}
              >
                Gajadi deh
              </button>
              <button
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 hover:shadow-blue-500/30 transition-all active:scale-95"
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
