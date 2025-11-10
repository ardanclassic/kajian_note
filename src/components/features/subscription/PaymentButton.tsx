// src/components/features/subscription/PaymentButton.tsx

import { Button } from "@/components/ui/button";
import { getPaymentLink, type SubscriptionTier } from "@/config/payment";
import { ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
      toast.error("Tidak perlu pembayaran untuk paket gratis");
      return;
    }

    const paymentLink = getPaymentLink(tier);

    if (!paymentLink) {
      toast.error("Link pembayaran tidak tersedia");
      return;
    }

    // Validate email
    if (!userEmail) {
      toast.error("Email tidak ditemukan. Silakan lengkapi profil Anda.");
      return;
    }

    setIsRedirecting(true);

    // Show instruction toast
    toast.info(`Pastikan menggunakan email: ${userEmail} saat checkout di Lynk.id`, { duration: 5000 });

    // Redirect to Lynk.id payment page
    setTimeout(() => {
      window.open(paymentLink, "_blank");
      setIsRedirecting(false);
    }, 1000);
  };

  return (
    <Button onClick={handlePayment} disabled={isRedirecting} className={className}>
      {isRedirecting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Membuka halaman pembayaran...
        </>
      ) : (
        <>
          {children || "Lanjutkan ke Pembayaran"}
          <ExternalLink className="h-4 w-4 ml-2" />
        </>
      )}
    </Button>
  );
}
