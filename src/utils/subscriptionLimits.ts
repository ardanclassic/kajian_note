/**
 * Subscription Limits Utilities
 * Helper functions for checking subscription limits
 */

import type { SubscriptionTier } from "@/config/subscriptionLimits";
import { SUBSCRIPTION_LIMITS } from "@/config/subscriptionLimits";

/**
 * Check result interface
 */
export interface LimitCheckResult {
  allowed: boolean;
  message?: string;
  currentCount?: number;
  limit?: number;
  remaining?: number;
  upgradeRequired?: boolean;
  recommendedTier?: SubscriptionTier;
}

/**
 * Check if user can create note
 */
export const checkCanCreateNote = (tier: SubscriptionTier, currentNotesCount: number): LimitCheckResult => {
  const limits = SUBSCRIPTION_LIMITS[tier];

  if (currentNotesCount >= limits.maxNotes) {
    return {
      allowed: false,
      message: `Batas catatan tercapai (${limits.maxNotes} catatan). Upgrade untuk membuat lebih banyak.`,
      currentCount: currentNotesCount,
      limit: limits.maxNotes,
      remaining: 0,
      upgradeRequired: true,
      recommendedTier: tier === "free" ? "premium" : "advance",
    };
  }

  return {
    allowed: true,
    currentCount: currentNotesCount,
    limit: limits.maxNotes,
    remaining: limits.maxNotes === Infinity ? Infinity : limits.maxNotes - currentNotesCount,
  };
};

/**
 * Check if user can add tag
 */
export const checkCanAddTag = (
  tier: SubscriptionTier,
  currentTagsCount: number,
  newTagsCount: number = 1
): LimitCheckResult => {
  const limits = SUBSCRIPTION_LIMITS[tier];
  const totalAfterAdd = currentTagsCount + newTagsCount;

  if (totalAfterAdd > limits.maxTags) {
    return {
      allowed: false,
      message: `Batas tag tercapai (${limits.maxTags} tag). Upgrade untuk menambah lebih banyak.`,
      currentCount: currentTagsCount,
      limit: limits.maxTags,
      remaining: 0,
      upgradeRequired: true,
      recommendedTier: tier === "free" ? "premium" : "advance",
    };
  }

  return {
    allowed: true,
    currentCount: currentTagsCount,
    limit: limits.maxTags,
    remaining: limits.maxTags === Infinity ? Infinity : limits.maxTags - currentTagsCount,
  };
};

/**
 * Check if user can create public note
 */
export const checkCanCreatePublicNote = (tier: SubscriptionTier): LimitCheckResult => {
  const limits = SUBSCRIPTION_LIMITS[tier];

  if (!limits.canPublicNotes) {
    return {
      allowed: false,
      message: "Catatan publik hanya tersedia untuk Premium & Advance.",
      upgradeRequired: true,
      recommendedTier: "premium",
    };
  }

  return {
    allowed: true,
  };
};

/**
 * Check if user can export PDF
 */
export const checkCanExportPDF = (tier: SubscriptionTier): LimitCheckResult => {
  const limits = SUBSCRIPTION_LIMITS[tier];

  if (!limits.canExportPDF) {
    return {
      allowed: false,
      message: "Export PDF hanya tersedia untuk Premium & Advance.",
      upgradeRequired: true,
      recommendedTier: "premium",
    };
  }

  return {
    allowed: true,
  };
};

/**
 * Get usage percentage
 */
export const getUsagePercentage = (current: number, limit: number): number => {
  if (limit === Infinity) return 0;
  return Math.min(100, Math.round((current / limit) * 100));
};

/**
 * Get usage color (for UI)
 */
export const getUsageColor = (percentage: number): string => {
  if (percentage >= 90) return "red";
  if (percentage >= 70) return "orange";
  if (percentage >= 50) return "yellow";
  return "green";
};

/**
 * Get usage warning message
 */
export const getUsageWarningMessage = (
  type: "notes" | "tags",
  current: number,
  limit: number,
  tier: SubscriptionTier
): string | null => {
  if (limit === Infinity) return null;

  const percentage = getUsagePercentage(current, limit);
  const remaining = limit - current;

  if (percentage >= 90) {
    return `⚠️ Hampir penuh! Sisa ${remaining} ${type} lagi. Upgrade untuk lebih banyak.`;
  }

  if (percentage >= 70) {
    return `ℹ️ Sisa ${remaining} ${type} dari ${limit}. Pertimbangkan upgrade jika membutuhkan lebih.`;
  }

  return null;
};

/**
 * Format limit text (handle Infinity)
 */
export const formatLimitText = (limit: number): string => {
  if (limit === Infinity) return "Unlimited";
  return limit.toString();
};

/**
 * Get feature comparison data (for pricing table)
 */
export const getFeatureComparison = () => {
  return {
    features: [
      {
        name: "Jumlah Catatan",
        free: formatLimitText(SUBSCRIPTION_LIMITS.free.maxNotes),
        premium: formatLimitText(SUBSCRIPTION_LIMITS.premium.maxNotes),
        advance: formatLimitText(SUBSCRIPTION_LIMITS.advance.maxNotes),
      },
      {
        name: "Jumlah Tag",
        free: formatLimitText(SUBSCRIPTION_LIMITS.free.maxTags),
        premium: formatLimitText(SUBSCRIPTION_LIMITS.premium.maxTags),
        advance: formatLimitText(SUBSCRIPTION_LIMITS.advance.maxTags),
      },
      {
        name: "Catatan Publik",
        free: SUBSCRIPTION_LIMITS.free.canPublicNotes ? "✓" : "✗",
        premium: SUBSCRIPTION_LIMITS.premium.canPublicNotes ? "✓" : "✗",
        advance: SUBSCRIPTION_LIMITS.advance.canPublicNotes ? "✓" : "✗",
      },
      {
        name: "Export PDF",
        free: SUBSCRIPTION_LIMITS.free.canExportPDF ? "✓" : "✗",
        premium: SUBSCRIPTION_LIMITS.premium.canExportPDF ? "✓" : "✗",
        advance: SUBSCRIPTION_LIMITS.advance.canExportPDF ? "✓" : "✗",
      },
    ],
  };
};

/**
 * Get upgrade benefits based on current tier
 */
export const getUpgradeBenefits = (currentTier: SubscriptionTier): string[] => {
  if (currentTier === "free") {
    return [
      "90 catatan lebih banyak (total 100)",
      "7 tag lebih banyak (total 10)",
      "Buat catatan publik",
      "Export catatan ke PDF",
      "Prioritas support",
    ];
  }

  if (currentTier === "premium") {
    return [
      "Catatan unlimited (tidak terbatas)",
      "Tag unlimited (tidak terbatas)",
      "Fitur premium eksklusif",
      "Prioritas support tertinggi",
    ];
  }

  return ["Anda sudah menggunakan tier tertinggi! 🎉"];
};

/**
 * Calculate days until subscription expires
 */
export const getDaysUntilExpiry = (endDate: string | null): number | null => {
  if (!endDate) return null;

  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Get subscription expiry warning
 */
export const getExpiryWarning = (endDate: string | null, tier: SubscriptionTier): string | null => {
  if (tier === "free") return null;

  const daysRemaining = getDaysUntilExpiry(endDate);
  if (daysRemaining === null) return null;

  if (daysRemaining <= 0) {
    return "⚠️ Subscription Anda telah expired. Perpanjang sekarang!";
  }

  if (daysRemaining <= 3) {
    return `⚠️ Subscription akan berakhir dalam ${daysRemaining} hari. Perpanjang sekarang!`;
  }

  if (daysRemaining <= 7) {
    return `ℹ️ Subscription akan berakhir dalam ${daysRemaining} hari.`;
  }

  return null;
};

/**
 * Check if should show upgrade prompt
 */
export const shouldShowUpgradePrompt = (tier: SubscriptionTier, notesCount: number, tagsCount: number): boolean => {
  if (tier === "advance") return false;

  const limits = SUBSCRIPTION_LIMITS[tier];

  // Show if close to limits
  const notesPercentage = getUsagePercentage(notesCount, limits.maxNotes);
  const tagsPercentage = getUsagePercentage(tagsCount, limits.maxTags);

  return notesPercentage >= 80 || tagsPercentage >= 80;
};
