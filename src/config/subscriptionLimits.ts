/**
 * Subscription Limits Configuration
 * Defines limits for each subscription tier
 */

export type SubscriptionTier = "free" | "premium" | "advance";

export interface SubscriptionLimits {
  maxNotes: number;
  maxTags: number;
  canPublicNotes: boolean;
  canExportPDF: boolean;
  canExportWord: boolean;
}

/**
 * Limits for each subscription tier
 */
export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    maxNotes: 10,
    maxTags: 3,
    canPublicNotes: false,
    canExportPDF: false,
    canExportWord: false,
  },

  premium: {
    maxNotes: 100,
    maxTags: 10,
    canPublicNotes: true,
    canExportPDF: true,
    canExportWord: false,
  },

  advance: {
    maxNotes: Infinity,
    maxTags: Infinity,
    canPublicNotes: true,
    canExportPDF: true,
    canExportWord: true,
  },
};

/**
 * Subscription pricing (in IDR)
 */
export const SUBSCRIPTION_PRICING: Record<SubscriptionTier, number> = {
  free: 0,
  premium: 50000,
  advance: 100000,
};

/**
 * Subscription duration (in days)
 */
export const SUBSCRIPTION_DURATION: Record<SubscriptionTier, number> = {
  free: 0, // Unlimited
  premium: 30, // 30 days
  advance: 30, // 30 days
};

/**
 * Get limits for a subscription tier
 */
export const getSubscriptionLimits = (tier: SubscriptionTier): SubscriptionLimits => {
  return SUBSCRIPTION_LIMITS[tier] || SUBSCRIPTION_LIMITS.free;
};

/**
 * Check if user can create more notes
 */
export const canCreateNote = (tier: SubscriptionTier, currentNotesCount: number): boolean => {
  const limits = getSubscriptionLimits(tier);
  return currentNotesCount < limits.maxNotes;
};

/**
 * Check if user can add more tags
 */
export const canAddTag = (tier: SubscriptionTier, currentTagsCount: number): boolean => {
  const limits = getSubscriptionLimits(tier);
  return currentTagsCount < limits.maxTags;
};

/**
 * Check if user can create public notes
 */
export const canCreatePublicNote = (tier: SubscriptionTier): boolean => {
  const limits = getSubscriptionLimits(tier);
  return limits.canPublicNotes;
};

/**
 * Check if user can export to PDF
 */
export const canExportPDF = (tier: SubscriptionTier): boolean => {
  const limits = getSubscriptionLimits(tier);
  return limits.canExportPDF;
};

/**
 * Check if user can export to Word
 */
export const canExportWord = (tier: SubscriptionTier): boolean => {
  const limits = getSubscriptionLimits(tier);
  return limits.canExportWord;
};

/**
 * Get remaining notes quota
 */
export const getRemainingNotes = (tier: SubscriptionTier, currentNotesCount: number): number => {
  const limits = getSubscriptionLimits(tier);
  if (limits.maxNotes === Infinity) return Infinity;
  return Math.max(0, limits.maxNotes - currentNotesCount);
};

/**
 * Get remaining tags quota
 */
export const getRemainingTags = (tier: SubscriptionTier, currentTagsCount: number): number => {
  const limits = getSubscriptionLimits(tier);
  if (limits.maxTags === Infinity) return Infinity;
  return Math.max(0, limits.maxTags - currentTagsCount);
};

/**
 * Get subscription tier display name
 */
export const getTierDisplayName = (tier: SubscriptionTier): string => {
  const displayNames: Record<SubscriptionTier, string> = {
    free: "Gratis",
    premium: "Premium",
    advance: "Advance",
  };

  return displayNames[tier] || tier;
};

/**
 * Get subscription tier description
 */
export const getTierDescription = (tier: SubscriptionTier): string => {
  const descriptions: Record<SubscriptionTier, string> = {
    free: "Fitur dasar untuk pengguna baru",
    premium: "Fitur lengkap untuk kebutuhan sehari-hari",
    advance: "Fitur premium tanpa batas untuk power user",
  };

  return descriptions[tier] || "";
};

/**
 * Get subscription tier color for UI
 */
export const getTierColor = (tier: SubscriptionTier): string => {
  const colors: Record<SubscriptionTier, string> = {
    free: "gray",
    premium: "blue",
    advance: "purple",
  };

  return colors[tier] || "gray";
};

/**
 * Format price to IDR
 */
export const formatPrice = (price: number): string => {
  if (price === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Get upgrade message based on action
 */
export const getUpgradeMessage = (action: "notes" | "tags" | "public" | "pdf" | "word"): string => {
  const messages = {
    notes: "Anda telah mencapai batas maksimal catatan. Upgrade untuk menambah catatan lebih banyak.",
    tags: "Anda telah mencapai batas maksimal tag. Upgrade untuk menambah tag lebih banyak.",
    public: "Fitur catatan publik hanya tersedia untuk pengguna Premium dan Advance.",
    pdf: "Fitur export PDF hanya tersedia untuk pengguna Premium dan Advance.",
    word: "Fitur export Word hanya tersedia untuk pengguna Advance.",
  };

  return messages[action];
};

/**
 * Get recommended tier for upgrade
 */
export const getRecommendedTier = (currentTier: SubscriptionTier): SubscriptionTier => {
  if (currentTier === "free") return "premium";
  if (currentTier === "premium") return "advance";
  return "advance";
};
