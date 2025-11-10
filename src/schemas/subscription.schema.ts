/**
 * Subscription Validation Schemas
 * Zod schemas for subscription form validation
 */

import { z } from "zod";

/**
 * Subscription tier validation
 */
export const subscriptionTierSchema = z.enum(["free", "premium", "advance"]);

/**
 * Subscription status validation
 */
export const subscriptionStatusSchema = z.enum(["active", "expired", "cancelled", "pending"]);

/**
 * Payment method validation
 */
export const paymentMethodSchema = z.enum(["qris", "bank_transfer", "e_wallet", "credit_card"]);

/**
 * Upgrade subscription form schema
 */
export const upgradeSubscriptionSchema = z.object({
  tier: subscriptionTierSchema.refine((tier) => tier !== "free", { message: "Tier harus premium atau advance" }),
  paymentMethod: paymentMethodSchema.optional().default("qris"),
});

export type UpgradeSubscriptionFormData = z.infer<typeof upgradeSubscriptionSchema>;

/**
 * Cancel subscription form schema
 */
export const cancelSubscriptionSchema = z.object({
  reason: z.string().min(10, "Alasan minimal 10 karakter").max(500, "Alasan maksimal 500 karakter").optional(),
  confirmCancel: z.boolean().refine((val) => val === true, { message: "Anda harus mengkonfirmasi pembatalan" }),
});

export type CancelSubscriptionFormData = z.infer<typeof cancelSubscriptionSchema>;

/**
 * Manual grant subscription form schema (admin only)
 */
export const manualGrantSubscriptionSchema = z.object({
  userId: z.string().uuid("User ID tidak valid"),
  tier: subscriptionTierSchema.refine((tier) => tier !== "free", { message: "Tier harus premium atau advance" }),
  duration: z.number().min(1, "Durasi minimal 1 hari").max(365, "Durasi maksimal 365 hari"),
  reason: z.string().min(10, "Alasan minimal 10 karakter").max(500, "Alasan maksimal 500 karakter"),
});

export type ManualGrantSubscriptionFormData = z.infer<typeof manualGrantSubscriptionSchema>;
