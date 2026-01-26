/**
 * PaymentButton - REDESIGNED WITH CONFIRMATION DIALOG
 * Focus: Email tracking + clear instructions + modern confirmation dialog
 * Uses framer-motion for smooth animations instead of shadcn AlertDialog
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { type SubscriptionTier, getPrice } from "@/config/payment";
import { Loader2, ExternalLink, Copy, CheckCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface PaymentButtonProps {
  tier: SubscriptionTier;
  userEmail: string;
  userName?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PaymentButton({ tier, userEmail, userName, className, children }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    userId: string;
    refId: string;
    paymentUrl: string;
    amount: number;
  } | null>(null);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(userEmail);
      setEmailCopied(true);
      toast.success("Email disalin ke clipboard!", {
        description: "Paste email ini saat checkout di Lynk.id",
        duration: 3000,
      });

      setTimeout(() => setEmailCopied(false), 2000);
    } catch (error) {
      toast.error("Gagal menyalin email");
    }
  };

  const handlePaymentClick = async () => {
    if (tier === "free") {
      toast.error("Tidak dapat melakukan pembayaran untuk paket gratis");
      return;
    }

    try {
      setLoading(true);

      // 1. Validasi user exists
      const { data: userExists, error: userError } = await supabase
        .from("users")
        .select("id, email, username")
        .eq("email", userEmail)
        .single();

      if (userError || !userExists) {
        toast.error("Email tidak ditemukan dalam sistem. Silakan login ulang.");
        setLoading(false);
        return;
      }

      // 2. (Removed) Update payment_email karena sekarang pakai email utama

      // 3. Generate unique reference untuk tracking
      const refId = `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // 4. Get payment link dari config
      const baseLink =
        tier === "premium" ? import.meta.env.VITE_LYNK_PREMIUM_LINK : import.meta.env.VITE_LYNK_ADVANCE_LINK;

      if (!baseLink) {
        toast.error("Payment link tidak tersedia");
        setLoading(false);
        return;
      }

      // 5. (Deferred) Simpan payment attempt dipindah ke handleConfirmPayment

      // 6. Auto-copy email to clipboard
      try {
        await navigator.clipboard.writeText(userEmail);
      } catch (e) {
        console.log("Auto-copy failed, user will copy manually");
      }

      // 7. Store payment data and show confirmation dialog
      setPaymentData({
        userId: userExists.id,
        refId,
        paymentUrl: baseLink,
        amount: getPrice(tier),
      });
      setShowConfirmDialog(true);
      setLoading(false);
    } catch (error: any) {
      console.error("Payment preparation error:", error);
      toast.error("Gagal mempersiapkan pembayaran");
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!paymentData) return;

    // Insert payment attempt here
    const { error: insertError } = await supabase.from("payment_attempts").insert({
      user_id: paymentData.userId,
      reference_id: paymentData.refId,
      email: userEmail,
      tier,
      amount: paymentData.amount,
      payment_url: paymentData.paymentUrl,
      status: "pending",
    });

    if (insertError) {
      console.error("Failed to save payment attempt:", insertError);
      // Continue anyway as we want to allow payment
    }

    setShowConfirmDialog(false);

    // Show instruction toast
    toast.success("Membuka halaman pembayaran...", {
      description: `Email Anda sudah disalin. Paste saat checkout!`,
      duration: 5000,
    });

    // Redirect ke Lynk.id
    setTimeout(() => {
      window.open(paymentData.paymentUrl, "_blank");

      // Show reminder after redirect
      setTimeout(() => {
        toast.warning("📋 Gunakan email ini saat checkout:", {
          description: (
            <div className="flex items-center gap-2 mt-2">
              <code className="text-xs bg-white/10 px-2 py-1 rounded">{userEmail}</code>
            </div>
          ),
          duration: 10000,
        });
      }, 2000);
    }, 500);
  };

  const handleCancelPayment = () => {
    setShowConfirmDialog(false);
    setPaymentData(null);
    toast.info("Pembayaran dibatalkan");
  };

  return (
    <>
      <div className="space-y-3">
        {/* Email Display with Copy Button */}
        <div className="p-4 bg-gray-900 border border-emerald-500/30 rounded-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-emerald-400 mb-1.5 uppercase tracking-wide">Email Terdaftar</div>
              <code className="text-sm font-mono font-bold text-white break-all">{userEmail}</code>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyEmail}
              className="shrink-0 h-8 w-8 p-0 hover:bg-emerald-500/10"
            >
              {emailCopied ? (
                <CheckCheck className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-400 mt-2">Gunakan email ini saat checkout di Lynk.id</p>
        </div>

        {/* Payment Button */}
        <Button onClick={handlePaymentClick} disabled={loading} className={className}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Mempersiapkan...
            </>
          ) : (
            <>
              {children || "Lanjutkan ke Pembayaran"}
              <ExternalLink className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Confirmation Dialog - Framer Motion Style */}
      <AnimatePresence>
        {showConfirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleCancelPayment}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-linear-to-br from-gray-900 to-gray-800 border border-emerald-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-emerald-400" />
                </div>
              </div>

              {/* Title & Message */}
              <h3 className="text-xl font-bold text-white text-center mb-2">Siap ke Halaman Pembayaran?</h3>
              <p className="text-sm text-gray-300 text-center mb-4 leading-relaxed">
                Pastikan Anda menggunakan email berikut saat checkout:
              </p>

              {/* Email Highlight */}
              <div className="p-4 bg-black/50 border border-emerald-500/30 rounded-xl mb-6">
                <code className="text-sm font-mono font-bold text-emerald-400 break-all block text-center">
                  {userEmail}
                </code>
              </div>

              {/* Warning Note */}
              <div className="flex items-start gap-2 mb-6 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-300 leading-relaxed">
                  <strong className="text-orange-400">Penting:</strong> Email sudah otomatis disalin. Paste di form
                  email Lynk.id agar subscription aktif otomatis.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancelPayment}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                >
                  Batal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmPayment}
                  className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
                >
                  Lanjutkan
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
