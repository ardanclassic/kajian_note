/**
 * Payment Type Definitions
 * Types for payment-related operations
 */

import type { SubscriptionTier } from "@/config/subscriptionLimits";

/**
 * Payment method
 */
export type PaymentMethod = "qris" | "bank_transfer" | "e_wallet" | "credit_card";

/**
 * Payment status
 */
export type PaymentStatus = "pending" | "success" | "failed" | "cancelled" | "expired";

/**
 * Create payment request
 */
export interface CreatePaymentRequest {
  userId: string;
  tier: SubscriptionTier;
  amount: number;
  paymentMethod?: PaymentMethod;
  returnUrl?: string;
  callbackUrl?: string;
}

/**
 * Payment response from Lynk.id
 */
export interface PaymentResponse {
  paymentId: string;
  paymentUrl: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  expiresAt: string;
  qrCode?: string;
}

/**
 * Payment webhook payload
 */
export interface PaymentWebhook {
  id: string;
  paymentId: string;
  eventType: "payment.success" | "payment.failed" | "payment.expired" | "payment.cancelled";
  payload: {
    paymentId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    paymentMethod: string;
    paidAt?: string;
    metadata?: {
      userId: string;
      tier: SubscriptionTier;
    };
  };
  processed: boolean;
  processedAt: string | null;
  errorMessage: string | null;
  receivedAt: string;
}

/**
 * Payment verification request
 */
export interface PaymentVerificationRequest {
  paymentId: string;
}

/**
 * Payment verification response
 */
export interface PaymentVerificationResponse {
  paymentId: string;
  status: PaymentStatus;
  amount: number;
  paidAt: string | null;
  isVerified: boolean;
}

/**
 * Payment details
 */
export interface PaymentDetails {
  paymentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string | null;
  tier: SubscriptionTier;
  userId: string;
  createdAt: string;
  paidAt: string | null;
  expiresAt: string | null;
}

/**
 * Payment history item
 */
export interface PaymentHistoryItem {
  id: string;
  paymentId: string;
  tier: SubscriptionTier;
  amount: number;
  currency: string;
  paymentMethod: string | null;
  status: PaymentStatus;
  createdAt: string;
  paidAt: string | null;
}

/**
 * Payment history
 */
export interface PaymentHistory {
  payments: PaymentHistoryItem[];
  total: number;
}

/**
 * Payment callback data
 */
export interface PaymentCallbackData {
  paymentId: string;
  status: PaymentStatus;
  message?: string;
}

/**
 * Lynk.id API error
 */
export interface LynkAPIError {
  code: string;
  message: string;
  details?: any;
}
