/**
 * Authentication Type Definitions - FIXED
 * Types for auth-related operations
 */

import type { Session } from "@supabase/supabase-js"; // ✅ Import Supabase Session type
import type { UserRole } from "@/config/permissions";
import type { SubscriptionTier } from "@/config/subscriptionLimits";

/**
 * Login credentials
 */
export interface LoginCredentials {
  username: string;
  pin: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  fullName: string;
  username: string;
  pin: string;
  phone?: string;
}

/**
 * Change PIN data
 */
export interface ChangePINData {
  oldPin: string;
  newPin: string;
  confirmPin: string;
}

/**
 * Reset PIN data (by admin)
 */
export interface ResetPINData {
  userId: string;
  newPin: string;
  tempPin?: boolean;
}

/**
 * User profile (from users table)
 */
export interface UserProfile {
  id: string;
  email: string;
  authUserId: string;
  username: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: "active" | "expired" | "cancelled";
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  avatarUrl: string | null;
  bio: string | null;
  authType: string;
  isVerified: boolean;
  isActive: boolean;
  forcePasswordChange: boolean;
  passwordResetByAdmin: boolean;
  passwordResetAt: string | null;
  passwordChangedAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  paymentEmail: any;
}

/**
 * Auth state
 */
export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Auth response
 */
export interface AuthResponse {
  user: UserProfile | null;
  error: string | null;
}

/**
 * Login response
 * ✅ Use Supabase Session type instead of custom SessionData
 */
export interface LoginResponse {
  user: UserProfile;
  session: Session; // ✅ Supabase Session type
}

/**
 * Register response
 * ✅ Use Supabase Session type instead of custom SessionData
 */
export interface RegisterResponse {
  user: UserProfile;
  session: Session; // ✅ Supabase Session type
}

/**
 * Auth error types
 */
export type AuthErrorType =
  | "invalid_credentials"
  | "user_not_found"
  | "username_taken"
  | "account_inactive"
  | "force_password_change"
  | "network_error"
  | "unknown_error";

/**
 * Auth error
 */
export interface AuthError {
  type: AuthErrorType;
  message: string;
  details?: any;
}
