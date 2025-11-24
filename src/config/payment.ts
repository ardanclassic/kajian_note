// src/config/payment.ts

export const PAYMENT_CONFIG = {
  lynkId: {
    premiumLink: import.meta.env.VITE_LYNK_PREMIUM_LINK || "",
    advanceLink: import.meta.env.VITE_LYNK_ADVANCE_LINK || "",
    merchantKey: import.meta.env.VITE_LYNK_MERCHANT_KEY || "",
  },
  prices: {
    free: 0,
    premium: 50000,
    advance: 100000,
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

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

export const getPaymentLink = (tier: SubscriptionTier): string => {
  if (tier === "premium") return PAYMENT_CONFIG.lynkId.premiumLink;
  if (tier === "advance") return PAYMENT_CONFIG.lynkId.advanceLink;
  return "";
};
