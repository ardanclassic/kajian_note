/**
 * UpgradeModal Component - CLEANED UP VERSION
 * Removed redundant email alert (already handled in PaymentButton)
 * More compact, focus on features and pricing
 */

import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentButton } from "./PaymentButton";
import { PAYMENT_CONFIG, formatPrice, type SubscriptionTier } from "@/config/payment";
import { Check, X, Sparkles, Crown, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  selectedTier: SubscriptionTier;
  userEmail: string;
  paymentEmail: string;
}

// Animation variants
const modalVariants: any = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 35,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    },
  }),
};

export function UpgradeModal({ open, onClose, selectedTier, userEmail, paymentEmail }: UpgradeModalProps) {
  const tierConfig = {
    free: {
      label: "Free",
      icon: FileText,
      color: "gray",
    },
    premium: {
      label: "Premium",
      icon: Crown,
      color: "emerald",
    },
    advance: {
      label: "Advance",
      icon: Sparkles,
      color: "emerald",
    },
  };

  const config = tierConfig[selectedTier];
  const features = PAYMENT_CONFIG.features[selectedTier];
  const price = PAYMENT_CONFIG.prices[selectedTier];

  // Feature list - COMPACT dengan info essential saja
  const featuresList = [
    {
      text: features.maxNotes === -1 ? "Unlimited catatan" : `${features.maxNotes} catatan`,
      enabled: true,
    },
    {
      text: "AI Summary YouTube",
      enabled: true,
    },
    {
      text: "Export PDF",
      enabled: features.exportPdf,
    },
    {
      text: "Kirim Telegram & WhatsApp",
      enabled: features.exportPdf,
    },
    {
      text: selectedTier === "advance" ? "Custom export format" : "Berlaku 30 hari",
      enabled: selectedTier !== "free",
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onClose}>
          <DialogContent
            className="max-w-md md:max-w-lg p-0 gap-0 bg-black border border-gray-800 
                       h-screen md:h-auto md:max-h-[90vh] 
                       w-screen md:w-[calc(100%-2rem)]
                       flex flex-col overflow-hidden"
            showCloseButton={false}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
              className="flex flex-col h-full min-h-0"
            >
              {/* Compact Header */}
              <div className="relative bg-black border-b border-gray-800 p-5 shrink-0">
                {/* Subtle Glow */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClose();
                  }}
                  className="absolute top-3 right-3 z-50 h-8 w-8 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </Button>

                <DialogHeader className="relative space-y-4">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="mx-auto"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gray-900 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <config.icon className="h-7 w-7 text-emerald-400" />
                    </div>
                  </motion.div>

                  {/* Title */}
                  <div className="text-center space-y-1.5">
                    <DialogTitle className="text-2xl font-black text-white">{config.label}</DialogTitle>
                    <DialogDescription className="text-gray-400 text-sm">Tingkatkan pengalaman Anda</DialogDescription>
                  </div>

                  {/* Price */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="flex justify-center"
                  >
                    <div className="inline-flex items-baseline gap-1.5 px-5 py-2.5 bg-gray-900 border border-emerald-500/30 rounded-xl">
                      <span className="text-3xl font-black text-emerald-400">{formatPrice(price)}</span>
                      {selectedTier !== "free" && <span className="text-sm text-gray-400">/bln</span>}
                    </div>
                  </motion.div>
                </DialogHeader>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 min-h-0 overflow-y-auto bg-black">
                <div className="px-5 py-4 space-y-4">
                  {/* Features List */}
                  <div className="space-y-2.5">
                    {featuresList.map((feature, index) => (
                      <motion.div
                        key={index}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={itemVariants}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                          feature.enabled
                            ? "bg-black border-gray-800 hover:border-emerald-500/30"
                            : "bg-black border-gray-800 opacity-40"
                        }`}
                      >
                        <div
                          className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                            feature.enabled ? "bg-emerald-500/20" : "bg-gray-800"
                          }`}
                        >
                          {feature.enabled ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <X className="h-3 w-3 text-gray-600" />
                          )}
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            feature.enabled ? "text-gray-300" : "text-gray-600 line-through"
                          }`}
                        >
                          {feature.text}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Payment Button Component - Handles email display */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    <PaymentButton
                      tier={selectedTier}
                      userEmail={userEmail}
                      paymentEmail={paymentEmail}
                      className="w-full h-12 text-sm font-bold bg-gray-900 border border-emerald-500/50 text-white hover:bg-gray-800 shadow-lg shadow-emerald-500/20"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Lanjutkan Pembayaran
                    </PaymentButton>
                  </motion.div>

                  {/* Footer Info */}
                  <div className="pt-2 space-y-2 border-t border-gray-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
                      <Shield className="h-3 w-3 text-emerald-400" />
                      Info Penting
                    </div>
                    <div className="space-y-1.5 pb-4">
                      {["Pembayaran via Lynk.id", "Aktif otomatis setelah bayar", "Berlaku 30 hari sejak aktivasi"].map(
                        (note, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <span className="text-xs text-gray-400">{note}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
