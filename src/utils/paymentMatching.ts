// src/utils/paymentMatching.ts

import { supabase } from "@/lib/supabase";

interface PaymentMatchResult {
  success: boolean;
  userId?: string;
  error?: string;
}

/**
 * Match payment webhook with user by email
 * Used by webhook handler to find user based on payment email
 */
export async function matchUserByEmail(email: string): Promise<PaymentMatchResult> {
  try {
    // Try payment_email first (if user set it)
    const { data: userByPaymentEmail, error: paymentEmailError } = await supabase
      .from("users")
      .select("id, username, email, payment_email")
      .eq("payment_email", email)
      .single();

    if (userByPaymentEmail) {
      return {
        success: true,
        userId: userByPaymentEmail.id,
      };
    }

    // Fallback to main email
    const { data: userByEmail, error: emailError } = await supabase
      .from("users")
      .select("id, username, email, payment_email")
      .eq("email", email)
      .single();

    if (userByEmail) {
      return {
        success: true,
        userId: userByEmail.id,
      };
    }

    return {
      success: false,
      error: `User not found for email: ${email}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update user payment email
 * Allow users to set a different email for payment notifications
 */
export async function updatePaymentEmail(
  userId: string,
  paymentEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("users").update({ payment_email: paymentEmail }).eq("id", userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update payment email",
    };
  }
}

/**
 * Get user's payment email (or fallback to main email)
 */
export async function getUserPaymentEmail(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.from("users").select("email, payment_email").eq("id", userId).single();

    if (error) throw error;

    return data.payment_email || data.email;
  } catch (error) {
    console.error("Error getting payment email:", error);
    return null;
  }
}
