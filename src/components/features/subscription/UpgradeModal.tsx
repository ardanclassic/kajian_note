/**
 * UpgradeModal Component - MODERN REDESIGN WITH FRAMER MOTION
 * Beautiful, mobile-friendly upgrade modal with smooth animations
 * FIXED: Mobile responsiveness + close button double issue
 */

import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PaymentButton } from "./PaymentButton";
import { PAYMENT_CONFIG, formatPrice, type SubscriptionTier } from "@/config/payment";
import { Check, Info, Sparkles, Crown, Star, FileText, X, Zap, Shield, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  selectedTier: SubscriptionTier;
  userEmail: string;
}

// Animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants: any = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
    },
  }),
};

export function UpgradeModal({ open, onClose, selectedTier, userEmail }: UpgradeModalProps) {
  const tierConfig = {
    free: {
      label: "Gratis",
      icon: FileText,
      gradient: "from-gray-500 to-gray-600",
      color: "text-gray-500",
    },
    premium: {
      label: "Premium",
      icon: Star,
      gradient: "from-blue-500 to-purple-600",
      color: "text-blue-500",
    },
    advance: {
      label: "Advance",
      icon: Crown,
      gradient: "from-purple-600 to-pink-600",
      color: "text-purple-500",
    },
  };

  const config = tierConfig[selectedTier];
  const features = PAYMENT_CONFIG.features[selectedTier];
  const price = PAYMENT_CONFIG.prices[selectedTier];

  const featuresList = [
    {
      icon: FileText,
      text: features.maxNotes === -1 ? "Unlimited catatan" : `Maksimal ${features.maxNotes} catatan`,
      enabled: true,
    },
    {
      icon: Zap,
      text: features.maxTags === -1 ? "Unlimited tags" : `Maksimal ${features.maxTags} tags`,
      enabled: true,
    },
    {
      icon: Shield,
      text: "Bagikan catatan secara publik",
      enabled: features.publicNotes,
    },
    {
      icon: FileText,
      text: "Export ke PDF",
      enabled: features.exportPdf,
    },
    {
      icon: FileText,
      text: "Export ke Word",
      enabled: features.exportWord,
    },
    {
      icon: Calendar,
      text: "Berlaku selama 30 hari",
      enabled: true,
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onClose}>
          <DialogContent
            className="max-w-full md:max-w-lg p-0 gap-0 overflow-hidden md:max-h-[90vh] md:w-[calc(100%-2rem)]"
            showCloseButton={false}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
              className="relative flex flex-col max-h-[100vh]"
            >
              {/* Header with Gradient Background - OPTIMIZED FOR MOBILE */}
              <div className={`relative overflow-hidden bg-linear-to-br ${config.gradient} p-4 md:p-6 shrink-0`}>
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-grid-white/10 mask-[linear-gradient(0deg,transparent,black)]" />
                </div>

                {/* Close button - CUSTOM ONLY */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white"
                >
                  <X className="h-4 w-4" />
                </Button>

                <DialogHeader className="relative space-y-3 text-white">
                  {/* Animated Icon - SMALLER ON MOBILE */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-12 h-12 md:w-16 md:h-16 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl p-2.5 md:p-3 shadow-lg"
                  >
                    <config.icon className="w-full h-full" />
                  </motion.div>

                  <div className="text-center space-y-1.5">
                    <DialogTitle className="text-2xl md:text-3xl font-bold text-white">
                      Upgrade ke {config.label}
                    </DialogTitle>
                    <DialogDescription className="text-white/90 text-sm md:text-base">
                      Tingkatkan pengalaman mencatat Anda
                    </DialogDescription>
                  </div>

                  {/* Animated Price Badge - SMALLER ON MOBILE */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="flex justify-center"
                  >
                    <div className="inline-flex items-baseline gap-1.5 px-4 md:px-6 py-2 md:py-3 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/30">
                      <motion.span
                        animate={{ scale: [1, 1.05, 1] }}
                        className="text-3xl md:text-4xl font-bold"
                      >
                        {formatPrice(price)}
                      </motion.span>
                      <span className="text-sm md:text-lg text-white/90">/ bulan</span>
                    </div>
                  </motion.div>
                </DialogHeader>
              </div>

              {/* Content - SCROLLABLE WITH OPTIMIZED HEIGHT */}
              <div className="overflow-y-auto flex-1">
                {/* Features List - COMPACT ON MOBILE */}
                <div className="space-y-3 px-4 md:px-6 pt-4 md:pt-6">
                  <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                    Yang Anda Dapatkan
                  </div>

                  <div className="space-y-2">
                    {featuresList.map((feature, index) => (
                      <motion.div
                        key={index}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={itemVariants}
                        whileHover={{ x: 5, transition: { duration: 0.2 } }}
                        className={`flex items-start gap-2.5 p-2.5 md:p-3 rounded-lg transition-colors ${
                          feature.enabled ? "bg-green-500/5 hover:bg-green-500/10" : "bg-muted/50"
                        }`}
                      >
                        <div
                          className={`p-1 md:p-1.5 rounded-lg ${
                            feature.enabled ? "bg-green-500/10" : "bg-muted"
                          } shrink-0`}
                        >
                          {feature.enabled ? (
                            <Check className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-600" />
                          ) : (
                            <X className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <feature.icon
                            className={`h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 ${
                              feature.enabled ? "text-primary" : "text-muted-foreground"
                            }`}
                          />
                          <span
                            className={`text-xs md:text-sm ${
                              feature.enabled ? "font-medium" : "text-muted-foreground line-through"
                            }`}
                          >
                            {feature.text}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Email Alert - COMPACT ON MOBILE */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="px-4 md:px-6 pt-4 md:pt-6"
                >
                  <Alert className="border-2 border-blue-500/20 bg-blue-500/5">
                    <div className="flex gap-2.5">
                      <div className="p-1.5 md:p-2 bg-blue-500/10 rounded-lg shrink-0">
                        <Info className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600" />
                      </div>
                      <AlertDescription className="w-full text-sm space-y-1">
                        <div className="font-semibold text-foreground">Penting untuk Diperhatikan</div>
                        <div className="text-muted-foreground">
                          Gunakan email{" "}
                          <span className="font-mono font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded">
                            {userEmail}
                          </span>{" "}
                          saat checkout agar subscription otomatis aktif.
                        </div>
                      </AlertDescription>
                    </div>
                  </Alert>
                </motion.div>

                {/* Payment Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 md:px-6 pt-4 md:pt-6"
                >
                  <PaymentButton
                    tier={selectedTier}
                    userEmail={userEmail}
                    className={`w-full h-11 md:h-12 text-sm md:text-base font-semibold shadow-lg bg-linear-to-r ${config.gradient} hover:opacity-90 border-0`}
                  >
                    <Sparkles className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    Lanjutkan ke Pembayaran
                  </PaymentButton>
                </motion.div>

                {/* Footer Notes - COMPACT ON MOBILE */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-2 pt-3 md:pt-4 border-t mx-4 md:mx-6 px-4 md:px-6 pb-4 md:pb-6"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Shield className="h-3 w-3" />
                    Informasi Penting
                  </div>
                  <div className="space-y-1.5">
                    {[
                      "Pembayaran melalui Lynk.id (aman & terpercaya)",
                      "Subscription aktif otomatis setelah pembayaran",
                      "Berlaku 30 hari sejak tanggal pembayaran",
                    ].map((note, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
