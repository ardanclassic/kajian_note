/**
 * PaymentButton Component - REDESIGNED
 * Follows design system with proper loading states and animations
 */

import { Button } from "@/components/ui/button";
import { getPaymentLink, type SubscriptionTier } from "@/config/payment";
import { ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface PaymentButtonProps {
  tier: SubscriptionTier;
  userEmail: string;
  className?: string;
  children?: React.ReactNode;
}

export function PaymentButton({ tier, userEmail, className, children }: PaymentButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handlePayment = () => {
    if (tier === "free") {
      toast.error("Tidak perlu pembayaran untuk paket gratis", {
        icon: <AlertCircle className="h-5 w-5" />,
      });
      return;
    }

    const paymentLink = getPaymentLink(tier);

    if (!paymentLink) {
      toast.error("Link pembayaran tidak tersedia", {
        description: "Silakan hubungi admin untuk bantuan",
        icon: <AlertCircle className="h-5 w-5" />,
      });
      return;
    }

    // Validate email
    if (!userEmail) {
      toast.error("Email tidak ditemukan", {
        description: "Silakan lengkapi profil Anda terlebih dahulu",
        icon: <AlertCircle className="h-5 w-5" />,
      });
      return;
    }

    setIsRedirecting(true);

    // Show instruction toast with custom styling
    toast.info(
      <div className="space-y-2">
        <div className="font-bold">Langkah Pembayaran</div>
        <div className="text-sm">
          Pastikan menggunakan email: <span className="font-mono font-bold text-emerald-500">{userEmail}</span>
        </div>
        <div className="text-xs text-gray-400">Halaman pembayaran akan terbuka dalam tab baru</div>
      </div>,
      {
        duration: 6000,
        className: "bg-black border border-emerald-500/30",
      }
    );

    // Redirect to Lynk.id payment page
    setTimeout(() => {
      window.open(paymentLink, "_blank");
      setIsRedirecting(false);

      // Success feedback
      toast.success("Halaman pembayaran dibuka", {
        description: "Silakan lanjutkan proses pembayaran di tab baru",
      });
    }, 1000);
  };

  return (
    <motion.div whileHover={{ scale: isRedirecting ? 1 : 1.02 }} whileTap={{ scale: isRedirecting ? 1 : 0.98 }}>
      <Button onClick={handlePayment} disabled={isRedirecting} className={className}>
        {isRedirecting ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            <span>Membuka halaman pembayaran...</span>
          </>
        ) : (
          <>
            {children || (
              <>
                <span>Lanjutkan ke Pembayaran</span>
                <ExternalLink className="h-5 w-5 ml-2" />
              </>
            )}
          </>
        )}
      </Button>
    </motion.div>
  );
}
