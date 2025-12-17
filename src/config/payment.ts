// src/config/payment.ts

export const PAYMENT_CONFIG = {
  prices: {
    free: 0,
    premium: 50000,
    advance: 100000,
  },
  baseLinks: {
    premium: import.meta.env.VITE_LYNK_PREMIUM_LINK || "",
    advance: import.meta.env.VITE_LYNK_ADVANCE_LINK || "",
  },
  features: {
    free: {
      maxNotes: 10,
      maxTags: 3,
      publicNotes: false,
      exportPdf: false,
    },
    premium: {
      maxNotes: 100,
      publicNotes: true,
      exportPdf: true,
    },
    advance: {
      maxNotes: -1, // unlimited
      publicNotes: true,
      exportPdf: true,
    },
  },
  duration: {
    days: 30,
    label: "1 Bulan",
  },
};

export type SubscriptionTier = "free" | "premium" | "advance";

export interface PaymentConfig {
  prices: Record<Exclude<SubscriptionTier, "free">, number>;
  baseLinks: Record<Exclude<SubscriptionTier, "free">, string>;
  features: Record<SubscriptionTier, string[]>;
}

/**
 * Get base payment link for tier
 * NOTE: Lynk.id DOES NOT support URL parameters for pre-filling
 * User must manually enter email during checkout
 */
export function getPaymentLink(tier: Exclude<SubscriptionTier, "free">): string {
  const baseLink = PAYMENT_CONFIG.baseLinks[tier];

  if (!baseLink) {
    throw new Error(`Payment link tidak tersedia untuk tier: ${tier}`);
  }

  // Return base link only - no query parameters
  // Email matching handled via webhook + payment_email field
  return baseLink;
}

/**
 * Get price for subscription tier
 */
export function getPrice(tier: SubscriptionTier): number {
  if (tier === "free") return 0;
  return PAYMENT_CONFIG.prices[tier];
}

/**
 * Format price to Indonesian Rupiah
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

/**
 * Get payment link with validation
 * Throws error if tier is invalid or link not configured
 */
export function getValidatedPaymentLink(tier: SubscriptionTier): string {
  // Type guard for free tier
  if (tier === "free") {
    throw new Error("Cannot generate payment link for free tier");
  }

  // Now TypeScript knows tier is "premium" | "advance"
  const link = getPaymentLink(tier);

  if (!link || link.trim() === "") {
    throw new Error(`Payment link not configured for ${tier} tier. Check environment variables.`);
  }

  return link;
}
