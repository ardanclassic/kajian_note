// src/components/features/subscription/UpgradeModal.tsx

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PaymentButton } from "./PaymentButton";
import { PAYMENT_CONFIG, formatPrice, type SubscriptionTier } from "@/config/payment";
import { Check, Info } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  selectedTier: SubscriptionTier;
  userEmail: string;
}

export function UpgradeModal({ open, onClose, selectedTier, userEmail }: UpgradeModalProps) {
  const tierLabels = {
    free: "Gratis",
    premium: "Premium",
    advance: "Advance",
  };

  const features = PAYMENT_CONFIG.features[selectedTier];
  const price = PAYMENT_CONFIG.prices[selectedTier];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Upgrade ke {tierLabels[selectedTier]}</DialogTitle>
          <DialogDescription>Tingkatkan pengalaman mencatat Anda dengan fitur premium</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Price */}
          <div className="text-center py-4 bg-muted rounded-lg">
            <p className="text-3xl font-bold">{formatPrice(price)}</p>
            <p className="text-sm text-muted-foreground">per bulan</p>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <p className="font-semibold text-sm">Yang Anda dapatkan:</p>

            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">
                {features.maxNotes === -1 ? "Unlimited catatan" : `Maksimal ${features.maxNotes} catatan`}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">
                {features.maxTags === -1 ? "Unlimited tags" : `Maksimal ${features.maxTags} tags`}
              </span>
            </div>

            {features.publicNotes && (
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Bagikan catatan secara publik</span>
              </div>
            )}

            {features.exportPdf && (
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Export ke PDF</span>
              </div>
            )}

            {features.exportWord && (
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Export ke Word</span>
              </div>
            )}

            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Berlaku selama 30 hari</span>
            </div>
          </div>

          {/* Email Info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Penting:</strong> Gunakan email <strong>{userEmail}</strong> saat checkout di halaman pembayaran
              agar subscription otomatis aktif.
            </AlertDescription>
          </Alert>

          {/* Payment Button */}
          <PaymentButton tier={selectedTier} userEmail={userEmail} className="w-full">
            Lanjutkan ke Pembayaran
          </PaymentButton>

          {/* Notes */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Pembayaran melalui Lynk.id (aman & terpercaya)</p>
            <p>• Subscription aktif otomatis setelah pembayaran</p>
            <p>• Berlaku 30 hari sejak tanggal pembayaran</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
