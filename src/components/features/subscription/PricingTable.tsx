// src/components/features/subscription/PricingTable.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PAYMENT_CONFIG, formatPrice, type SubscriptionTier } from "@/config/payment";
import { Check, Sparkles } from "lucide-react";

interface PricingTableProps {
  currentTier: SubscriptionTier;
  onSelectPlan: (tier: SubscriptionTier) => void;
}

export function PricingTable({ currentTier, onSelectPlan }: PricingTableProps) {
  const plans = [
    {
      tier: "free" as SubscriptionTier,
      name: "Gratis",
      description: "Untuk memulai mencatat",
      price: PAYMENT_CONFIG.prices.free,
      popular: false,
    },
    {
      tier: "premium" as SubscriptionTier,
      name: "Premium",
      description: "Untuk pengguna aktif",
      price: PAYMENT_CONFIG.prices.premium,
      popular: true,
    },
    {
      tier: "advance" as SubscriptionTier,
      name: "Advance",
      description: "Untuk pengguna profesional",
      price: PAYMENT_CONFIG.prices.advance,
      popular: false,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => {
        const features = PAYMENT_CONFIG.features[plan.tier];
        const isCurrent = currentTier === plan.tier;

        return (
          <Card
            key={plan.tier}
            className={`relative ${plan.popular ? "border-primary shadow-lg scale-105" : ""} ${
              isCurrent ? "bg-muted" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Paling Populer
                </Badge>
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                {plan.tier !== "free" && <span className="text-muted-foreground"> / bulan</span>}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Features */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">
                    {features.maxNotes === -1 ? "Unlimited notes" : `Maksimal ${features.maxNotes} catatan`}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <Check
                    className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                      features.publicNotes ? "text-green-500" : "text-gray-300"
                    }`}
                  />
                  <span className={`text-sm ${features.publicNotes ? "" : "text-muted-foreground"}`}>
                    Catatan publik
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <Check
                    className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                      features.exportPdf ? "text-green-500" : "text-gray-300"
                    }`}
                  />
                  <span className={`text-sm ${features.exportPdf ? "" : "text-muted-foreground"}`}>
                    Export PDF & Markdown
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => onSelectPlan(plan.tier)}
                disabled={isCurrent}
                variant={plan.popular ? "default" : "outline"}
                className="w-full"
              >
                {isCurrent ? "Paket Saat Ini" : plan.tier === "free" ? "Paket Gratis" : "Pilih Paket"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
