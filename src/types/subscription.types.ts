/**
 * Subscription Type Definitions
 * Types for subscription-related operations
 */

import type { SubscriptionTier } from "@/config/subscriptionLimits";

/**
 * Subscription status
 */
export type SubscriptionStatus = "active" | "expired" | "cancelled" | "pending";

/**
 * Subscription record
 */
export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  paymentMethod: string | null;
  paymentId: string | null;
  paymentStatus: "pending" | "success" | "failed" | "cancelled" | null;
  amount: number | null;
  currency: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User subscription info
 */
export interface UserSubscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startDate: string | null;
  endDate: string | null;
  daysRemaining: number | null;
  isExpired: boolean;
  canUpgrade: boolean;
}

/**
 * Subscription tier info
 */
export interface SubscriptionTierInfo {
  tier: SubscriptionTier;
  name: string;
  description: string;
  price: number;
  priceFormatted: string;
  duration: number;
  features: string[];
  limits: {
    maxNotes: number;
    maxTags: number;
    canPublicNotes: boolean;
    canExportPDF: boolean;
    canExportWord: boolean;
  };
  isCurrent: boolean;
  isRecommended: boolean;
}

/**
 * Upgrade subscription data
 */
export interface UpgradeSubscriptionData {
  tier: SubscriptionTier;
  paymentMethod: "lynk_id";
}

/**
 * Cancel subscription data
 */
export interface CancelSubscriptionData {
  reason?: string;
}

/**
 * Manual grant subscription data (admin only)
 */
export interface ManualGrantSubscriptionData {
  userId: string;
  tier: SubscriptionTier;
  duration: number; // in days
  reason: string;
}

/**
 * Subscription history
 */
export interface SubscriptionHistory {
  subscriptions: Subscription[];
  total: number;
}

/**
 * Subscription usage
 */
export interface SubscriptionUsage {
  notesUsed: number;
  notesLimit: number;
  notesRemaining: number;
  tagsUsed: number;
  tagsLimit: number;
  tagsRemaining: number;
  publicNotesAllowed: boolean;
  pdfExportAllowed: boolean;
  wordExportAllowed: boolean;
  currentNotes?: any;
  maxNotes?: any;
  currentTags?: any;
  maxTags?: any;
  tier: "free" | "premium" | "advance";
  notesCount: any;
  tagsCount: any;
}

/**
 * Subscription check result
 */
export interface SubscriptionCheckResult {
  allowed: boolean;
  message?: string;
  upgradeRequired?: boolean;
  recommendedTier?: SubscriptionTier;
}
