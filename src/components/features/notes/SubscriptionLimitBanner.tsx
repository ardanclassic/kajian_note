/**
 * SubscriptionLimitBanner Component
 * Display subscription usage and limits warning
 */

import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, FileText, Tag, ArrowRight, Sparkles } from "lucide-react";
import type { SubscriptionUsage } from "@/types/subscription.types";
import {
  getUsagePercentage,
  getUsageColor,
  formatLimitText,
  shouldShowUpgradePrompt,
  getUpgradeBenefits,
} from "@/utils/subscriptionLimits";

interface SubscriptionLimitBannerProps {
  usage: SubscriptionUsage;
  compact?: boolean;
}

export function SubscriptionLimitBanner({ usage, compact = false }: SubscriptionLimitBannerProps) {
  const notesPercentage = getUsagePercentage(usage.notesCount, usage.notesLimit);
  const tagsPercentage = getUsagePercentage(usage.tagsCount, usage.tagsLimit);

  const notesColor = getUsageColor(notesPercentage);
  const tagsColor = getUsageColor(tagsPercentage);

  const shouldUpgrade = shouldShowUpgradePrompt(usage.tier, usage.notesCount, usage.tagsCount);

  // Don't show if advance tier or no warning needed
  if (usage.tier === "advance" || (!shouldUpgrade && compact)) {
    return null;
  }

  // Progress bar colors
  const getColorClass = (color: string) => {
    switch (color) {
      case "red":
        return "bg-red-500";
      case "orange":
        return "bg-orange-500";
      case "yellow":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  // Compact version
  if (compact) {
    return (
      <Card className="py-2 bg-orange-800 dark:bg-orange-950/20 text-white">
        <CardContent className="px-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">
                    {usage.notesCount}/{formatLimitText(usage.notesLimit)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span className="font-medium">
                    {usage.tagsCount}/{formatLimitText(usage.tagsLimit)}
                  </span>
                </div>
              </div>
            </div>

            <Button size="sm" asChild>
              <Link to="/subscription">
                Upgrade
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full version with progress bars
  return (
    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
      <CardContent className="py-4 px-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-900 dark:text-orange-100">Penggunaan Mendekati Batas</h3>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  Upgrade untuk mendapatkan lebih banyak catatan dan fitur premium
                </p>
              </div>
            </div>

            <Badge variant="secondary" className="shrink-0">
              {usage.tier === "free" ? "Free" : usage.tier === "premium" ? "Premium" : "Advance"}
            </Badge>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Notes Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Catatan
                </span>
                <span className="font-medium">
                  {usage.notesCount}/{formatLimitText(usage.notesLimit)}
                </span>
              </div>
              {usage.notesLimit !== Infinity && (
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getColorClass(notesColor)} transition-all`}
                    style={{ width: `${notesPercentage}%` }}
                  />
                </div>
              )}
            </div>

            {/* Tags Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tag
                </span>
                <span className="font-medium">
                  {usage.tagsCount}/{formatLimitText(usage.tagsLimit)}
                </span>
              </div>
              {usage.tagsLimit !== Infinity && (
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getColorClass(tagsColor)} transition-all`}
                    style={{ width: `${tagsPercentage}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Benefits Preview */}
          <div className="pt-3 border-t border-orange-200 dark:border-orange-800">
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Keuntungan Upgrade:
            </p>
            <ul className="text-sm space-y-1 text-orange-800 dark:text-orange-200">
              {getUpgradeBenefits(usage.tier)
                .slice(0, 3)
                .map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
            </ul>
          </div>

          {/* CTA */}
          <Button className="w-full" size="lg" asChild>
            <Link to="/subscription">
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade Sekarang
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
