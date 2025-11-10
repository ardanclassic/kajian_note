/**
 * User Type Definitions
 * Types for user-related operations
 */

import type { UserRole } from "@/config/permissions";
import type { SubscriptionTier } from "@/config/subscriptionLimits";

/**
 * User (full profile)
 */
export interface User {
  id: string;
  email: string;
  authUserId: string;
  username: string;
  fullName: string;
  phone: string | null;
  paymentEmail: string | null; // NEW: Email for Lynk.id payment matching
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
}

/**
 * User summary (for lists)
 */
export interface UserSummary {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

/**
 * Update user profile data
 */
export interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  paymentEmail?: string; // NEW: Allow updating payment email
  bio?: string;
  avatarUrl?: string;
  resolver?: any;
}

/**
 * Update user data (by admin)
 */
export interface UpdateUserData {
  fullName?: string;
  username?: string;
  phone?: string;
  paymentEmail?: string; // NEW: Admin can update payment email
  role?: UserRole;
  bio?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

/**
 * Create user data (by admin)
 */
export interface CreateUserData {
  fullName: string;
  username: string;
  pin: string;
  phone?: string;
  paymentEmail?: string; // NEW: Optional payment email on creation
  role?: UserRole;
  bio?: string;
}

/**
 * User statistics
 */
export interface UserStats {
  totalNotes: number;
  publicNotes: number;
  totalTags: number;
  lastNoteCreated: string | null;
}

/**
 * User with stats
 */
export interface UserWithStats extends User {
  stats: UserStats;
}

/**
 * Profile change record
 */
export interface ProfileChange {
  id: string;
  userId: string;
  fieldChanged: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: string | null;
  changedByRole: string | null;
  changedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
}

/**
 * User filter options
 */
export interface UserFilterOptions {
  role?: UserRole;
  subscriptionTier?: SubscriptionTier;
  isActive?: boolean;
  search?: string;
}

/**
 * User sort options
 */
export type UserSortField = "fullName" | "username" | "createdAt" | "lastLoginAt";
export type UserSortOrder = "asc" | "desc";

export interface UserSortOptions {
  field: UserSortField;
  order: UserSortOrder;
}

/**
 * Paginated users response
 */
export interface PaginatedUsers {
  users: UserSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
