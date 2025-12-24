/**
 * SubscriptionLimitBanner Component
 * Compact & Beautiful Design - Dark Mode with Emerald Accents
 */

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileText, ArrowRight, Sparkles } from "lucide-react";
import type { SubscriptionUsage } from "@/types/subscription.types";
import {
  getUsagePercentage,
  getUsageColor,
  formatLimitText,
  shouldShowUpgradePrompt,
} from "@/utils/subscriptionLimits";

interface SubscriptionLimitBannerProps {
  usage: SubscriptionUsage;
  compact?: boolean;
}

export function SubscriptionLimitBanner({ usage, compact = false }: SubscriptionLimitBannerProps) {
  const notesPercentage = getUsagePercentage(usage.notesCount, usage.notesLimit);
  const notesColor = getUsageColor(notesPercentage);
  const shouldUpgrade = shouldShowUpgradePrompt(usage.tier, usage.notesCount);

  // Don't show if advance tier or no warning needed
  if (usage.tier === "advance" || (!shouldUpgrade && compact)) {
    return null;
  }

  // Progress bar colors with emerald theme
  const getColorClass = (color: string) => {
    switch (color) {
      case "red":
        return "bg-red-500";
      case "orange":
        return "bg-orange-500";
      case "yellow":
        return "bg-yellow-500";
      default:
        return "bg-emerald-500";
    }
  };

  const getTextColor = (color: string) => {
    switch (color) {
      case "red":
        return "text-red-400";
      case "orange":
        return "text-orange-400";
      case "yellow":
        return "text-yellow-400";
      default:
        return "text-emerald-400";
    }
  };

  const getBorderColor = (color: string) => {
    switch (color) {
      case "red":
        return "border-red-500/50";
      case "orange":
        return "border-orange-500/50";
      case "yellow":
        return "border-yellow-500/50";
      default:
        return "border-emerald-500/50";
    }
  };

  // Compact version - Ultra streamlined
  if (compact) {
    return (
      <div
        className={`relative bg-gray-900/50 backdrop-blur-sm rounded-xl border ${getBorderColor(
          notesColor
        )} overflow-hidden`}
      >
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent" />

        <div className="relative z-10 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Usage Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <AlertCircle className={`w-4 h-4 ${getTextColor(notesColor)} flex-shrink-0`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-3.5 h-3.5 text-gray-500" />
                  <span className={`text-sm font-bold ${getTextColor(notesColor)}`}>
                    {usage.notesCount}/{formatLimitText(usage.notesLimit)}
                  </span>
                  <span className="text-xs text-gray-500">catatan</span>
                </div>

                {/* Compact Progress Bar */}
                {usage.notesLimit !== Infinity && (
                  <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getColorClass(notesColor)} transition-all`}
                      style={{ width: `${notesPercentage}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right: Upgrade Button */}
            <Button
              size="sm"
              asChild
              className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/20 hover:border-emerald-500 shadow-lg shadow-emerald-500/10 flex-shrink-0"
            >
              <Link to="/subscription">
                <Sparkles className="w-3.5 h-3.5 md:mr-1.5" />
                <span className="hidden md:inline">Upgrade</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 hidden md:inline" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Full version - Still compact but with more info
  return (
    <div
      className={`relative bg-gray-900/50 backdrop-blur-sm rounded-xl border ${getBorderColor(
        notesColor
      )} overflow-hidden`}
    >
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 p-4 md:p-5">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-base">Tingkatkan Kapasitas</h3>
                <p className="text-sm text-gray-400 mt-0.5">Upgrade untuk lebih banyak catatan & fitur premium</p>
              </div>
            </div>

            <div className="px-2.5 py-1 bg-gray-800 border border-gray-700 rounded-md text-xs font-semibold text-gray-400 flex-shrink-0">
              {usage.tier === "free" ? "Free" : usage.tier === "premium" ? "Premium" : "Advance"}
            </div>
          </div>

          {/* Usage Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium text-gray-300">
                <FileText className="w-4 h-4 text-gray-500" />
                Catatan
              </span>
              <span className={`font-bold ${getTextColor(notesColor)}`}>
                {usage.notesCount}/{formatLimitText(usage.notesLimit)}
              </span>
            </div>

            {usage.notesLimit !== Infinity && (
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getColorClass(notesColor)} transition-all`}
                  style={{ width: `${notesPercentage}%` }}
                />
              </div>
            )}

            {notesPercentage >= 80 && (
              <p className={`text-xs ${getTextColor(notesColor)} font-medium`}>
                {usage.notesRemaining === 0
                  ? "⚠️ Batas catatan tercapai!"
                  : `⚠️ Sisa ${usage.notesRemaining} catatan lagi`}
              </p>
            )}
          </div>

          {/* CTA Button */}
          <Button
            className="w-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/20 hover:border-emerald-500 shadow-lg shadow-emerald-500/20"
            asChild
          >
            <Link to="/subscription">
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade Sekarang
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
