// src/components/features/subscription/SubscriptionCard.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PAYMENT_CONFIG, formatPrice, type SubscriptionTier } from "@/config/payment";
import { Calendar, Check } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface SubscriptionCardProps {
  tier: SubscriptionTier;
  status: "active" | "expired" | "cancelled";
  startDate?: string;
  endDate?: string;
  onUpgrade?: () => void;
  isCurrentTier?: boolean;
}

export function SubscriptionCard({
  tier,
  status,
  startDate,
  endDate,
  onUpgrade,
  isCurrentTier = false,
}: SubscriptionCardProps) {
  const features = PAYMENT_CONFIG.features[tier];
  const price = PAYMENT_CONFIG.prices[tier];

  const tierLabels = {
    free: "Gratis",
    premium: "Premium",
    advance: "Advance",
  };

  const statusLabels = {
    active: "Aktif",
    expired: "Kadaluarsa",
    cancelled: "Dibatalkan",
  };

  const statusColors = {
    active: "bg-green-500",
    expired: "bg-red-500",
    cancelled: "bg-gray-500",
  };

  return (
    <Card className={isCurrentTier ? "border-primary shadow-md" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">{tierLabels[tier]}</CardTitle>
          {isCurrentTier && <Badge className={statusColors[status]}>{statusLabels[status]}</Badge>}
        </div>
        <CardDescription className="text-xl font-semibold">
          {formatPrice(price)}
          {tier !== "free" && <span className="text-sm font-normal"> / bulan</span>}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Period Info */}
        {isCurrentTier && tier !== "free" && startDate && endDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(startDate), "dd MMM yyyy", { locale: id })} -{" "}
              {format(new Date(endDate), "dd MMM yyyy", { locale: id })}
            </span>
          </div>
        )}

        {/* Features List */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm">
              {features.maxNotes === -1 ? "Unlimited notes" : `Max ${features.maxNotes} notes`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm">
              {features.maxTags === -1 ? "Unlimited tags" : `Max ${features.maxTags} tags`}
            </span>
          </div>

          {features.publicNotes && (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">Public notes</span>
            </div>
          )}

          {features.exportPdf && (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">Export PDF</span>
            </div>
          )}

          {features.exportWord && (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">Export Word</span>
            </div>
          )}
        </div>

        {/* Upgrade Button */}
        {onUpgrade && !isCurrentTier && (
          <Button onClick={onUpgrade} className="w-full">
            Upgrade ke {tierLabels[tier]}
          </Button>
        )}

        {isCurrentTier && tier === "free" && onUpgrade && (
          <Button onClick={onUpgrade} className="w-full">
            Upgrade Sekarang
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
