/**
 * User Service
 * Handles user-related operations
 */

import { supabase } from "@/lib/supabase";
import { generateDummyEmail } from "@/lib/utils";
import * as db from "./database.service";
import type {
  User,
  UserSummary,
  UpdateProfileData,
  UpdateUserData,
  CreateUserData,
  UserStats,
  UserWithStats,
  ProfileChange,
  UserFilterOptions,
  UserSortOptions,
  PaginatedUsers,
} from "@/types/user.types";

/**
 * Map database user to User type
 */
const mapDbUserToUser = (dbUser: any): User => {
  return {
    id: dbUser.id,
    email: dbUser.email,
    authUserId: dbUser.auth_user_id,
    username: dbUser.username,
    fullName: dbUser.full_name,
    phone: dbUser.phone,
    paymentEmail: dbUser.payment_email,
    role: dbUser.role,
    subscriptionTier: dbUser.subscription_tier,
    subscriptionStatus: dbUser.subscription_status,
    subscriptionStartDate: dbUser.subscription_start_date,
    subscriptionEndDate: dbUser.subscription_end_date,
    avatarUrl: dbUser.avatar_url,
    bio: dbUser.bio,
    authType: dbUser.auth_type,
    isVerified: dbUser.is_verified,
    isActive: dbUser.is_active,
    forcePasswordChange: dbUser.force_password_change,
    passwordResetByAdmin: dbUser.password_reset_by_admin,
    passwordResetAt: dbUser.password_reset_at,
    passwordChangedAt: dbUser.password_changed_at,
    createdBy: dbUser.created_by,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
    lastLoginAt: dbUser.last_login_at,
    telegramChatId: dbUser.telegram_chat_id,
    telegramVerifiedAt: dbUser.telegram_verified_at,
  };
};

/**
 * Log profile change (audit trail)
 */
const logProfileChange = async (
  userId: string,
  field: string,
  oldValue: string | null,
  newValue: string | null,
  changedBy: string
): Promise<void> => {
  try {
    // Get changed by user role
    const changedByUser = await db.getById("users", changedBy);

    await db.create("profile_changes", {
      user_id: userId,
      field_changed: field,
      old_value: oldValue,
      new_value: newValue,
      changed_by: changedBy,
      changed_by_role: changedByUser?.role || null,
      ip_address: null,
      user_agent: null,
    });
  } catch (error: any) {
    console.error("Error logging profile change:", error);
  }
};

/**
 * Get user by ID
 */
const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const user = await db.getById("users", userId);
    if (!user) return null;

    return mapDbUserToUser(user);
  } catch (error: any) {
    console.error("Error getting user by ID:", error);
    return null;
  }
};

/**
 * Get user by username
 */
const getUserByUsername = async (username: string): Promise<User | null> => {
  try {
    const users = await db.getWhere("users", { username });
    if (users.length === 0) return null;

    return mapDbUserToUser(users[0]);
  } catch (error: any) {
    console.error("Error getting user by username:", error);
    return null;
  }
};

/**
 * Get user by auth user ID
 */
const getUserByAuthId = async (authUserId: string): Promise<User | null> => {
  try {
    const users = await db.getWhere("users", { auth_user_id: authUserId });
    if (users.length === 0) return null;

    return mapDbUserToUser(users[0]);
  } catch (error: any) {
    console.error("Error getting user by auth ID:", error);
    return null;
  }
};

/**
 * Update user profile (by user themselves)
 */
const updateProfile = async (userId: string, data: UpdateProfileData): Promise<User> => {
  try {
    const updateData: any = {};

    if (data.fullName !== undefined) updateData.full_name = data.fullName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.paymentEmail !== undefined) updateData.payment_email = data.paymentEmail; // NEW
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;

    const updated = await db.update("users", userId, updateData);
    if (!updated) throw new Error("Gagal mengubah profil");

    // Log profile change
    await logProfileChange(userId, "profile", null, null, userId);

    return mapDbUserToUser(updated);
  } catch (error: any) {
    console.error("Error updating profile:", error);
    throw new Error(error.message || "Gagal mengubah profil");
  }
};

/**
 * Update username
 */
const updateUsername = async (userId: string, newUsername: string): Promise<User> => {
  try {
    // Check if username already exists
    const exists = await db.exists("users", { username: newUsername });
    if (exists) {
      throw new Error("Username sudah digunakan");
    }

    // Get old username for audit
    const oldUser = await db.getById("users", userId);
    const oldUsername = oldUser?.username;

    // Update username
    const updated = await db.update("users", userId, { username: newUsername });
    if (!updated) throw new Error("Gagal mengubah username");

    // Log profile change
    await logProfileChange(userId, "username", oldUsername || null, newUsername, userId);

    return mapDbUserToUser(updated);
  } catch (error: any) {
    console.error("Error updating username:", error);
    throw new Error(error.message || "Gagal mengubah username");
  }
};

/**
 * Update user (by admin)
 */
const updateUser = async (userId: string, data: UpdateUserData, changedBy: string): Promise<User> => {
  try {
    const updateData: any = {};

    if (data.fullName !== undefined) updateData.full_name = data.fullName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.paymentEmail !== undefined) updateData.payment_email = data.paymentEmail; // NEW
    if (data.role !== undefined) updateData.role = data.role;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    // Handle username change
    if (data.username !== undefined) {
      const exists = await db.exists("users", { username: data.username });
      if (exists) {
        throw new Error("Username sudah digunakan");
      }
      updateData.username = data.username;
    }

    const updated = await db.update("users", userId, updateData);
    if (!updated) throw new Error("Gagal mengubah user");

    // Log profile changes
    if (data.role !== undefined) {
      await logProfileChange(userId, "role", null, data.role, changedBy);
    }
    if (data.username !== undefined) {
      await logProfileChange(userId, "username", null, data.username, changedBy);
    }
    if (data.isActive !== undefined) {
      await logProfileChange(userId, "is_active", null, String(data.isActive), changedBy);
    }

    return mapDbUserToUser(updated);
  } catch (error: any) {
    console.error("Error updating user:", error);
    throw new Error(error.message || "Gagal mengubah user");
  }
};

/**
 * Create user (by admin)
 */
const createUser = async (data: CreateUserData, createdBy: string): Promise<User> => {
  try {
    // Check if username exists
    const exists = await db.exists("users", { username: data.username });
    if (exists) {
      throw new Error("Username sudah digunakan");
    }

    // Generate dummy email
    const dummyEmail = generateDummyEmail(data.username);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: dummyEmail,
      password: data.pin,
      options: {
        data: {
          username: data.username,
          full_name: data.fullName,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Gagal membuat user");

    // Create user profile
    const userProfile = await db.create("users", {
      email: dummyEmail,
      auth_user_id: authData.user.id,
      username: data.username,
      full_name: data.fullName,
      phone: data.phone || null,
      payment_email: data.paymentEmail || null, // NEW
      role: data.role || "member",
      subscription_tier: "free",
      subscription_status: "active",
      subscription_start_date: null,
      subscription_end_date: null,
      avatar_url: null,
      bio: data.bio || null,
      auth_type: "phone",
      is_verified: false,
      is_active: true,
      force_password_change: true,
      password_reset_by_admin: true,
      password_reset_at: null,
      password_changed_at: null,
      last_login_at: null,
      created_by: createdBy,
    } as any);

    if (!userProfile) throw new Error("Gagal membuat profil user");

    return mapDbUserToUser(userProfile);
  } catch (error: any) {
    console.error("Error creating user:", error);
    throw new Error(error.message || "Gagal membuat user");
  }
};

/**
 * Delete user (by admin)
 */
const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    // Soft delete (set is_active = false)
    await db.softDelete("users", userId);
    return true;
  } catch (error: any) {
    console.error("Error deleting user:", error);
    throw new Error(error.message || "Gagal menghapus user");
  }
};

/**
 * Restore user (by admin)
 */
const restoreUser = async (userId: string): Promise<boolean> => {
  try {
    await db.restore("users", userId);
    return true;
  } catch (error: any) {
    console.error("Error restoring user:", error);
    throw new Error(error.message || "Gagal mengembalikan user");
  }
};

/**
 * Reset user PIN (by admin)
 */
const resetUserPIN = async (userId: string, newPin: string, resetBy: string): Promise<void> => {
  try {
    // Get user
    const user = await db.getById("users", userId);
    if (!user) throw new Error("User tidak ditemukan");

    // Update password in Supabase Auth
    const { error } = await supabase.auth.admin.updateUserById(user.auth_user_id, {
      password: newPin,
    });

    if (error) throw error;

    // Update user record
    await db.update("users", userId, {
      force_password_change: true,
      password_reset_by_admin: true,
      password_reset_at: new Date().toISOString(),
    });

    // Log profile change
    await logProfileChange(userId, "password_reset", null, "PIN direset oleh admin", resetBy);
  } catch (error: any) {
    console.error("Error resetting PIN:", error);
    throw new Error(error.message || "Gagal mereset PIN");
  }
};

/**
 * Get all users with pagination and filters
 */
const getUsers = async (
  page: number = 1,
  pageSize: number = 10,
  filters?: UserFilterOptions,
  sort?: UserSortOptions
): Promise<PaginatedUsers> => {
  try {
    const dbFilters: any = {};

    if (filters?.role) dbFilters.role = filters.role;
    if (filters?.subscriptionTier) dbFilters.subscription_tier = filters.subscriptionTier;
    if (filters?.isActive !== undefined) dbFilters.is_active = filters.isActive;

    const result = await db.paginate("users", {
      page,
      pageSize,
      filters: dbFilters,
      orderBy: sort?.field === "fullName" ? "full_name" : sort?.field || "created_at",
      ascending: sort?.order === "asc",
    });

    const users: UserSummary[] = result.data.map((user) => ({
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      role: user.role as any,
      subscriptionTier: user.subscription_tier as any,
      avatarUrl: user.avatar_url,
      isActive: user.is_active,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
    }));

    // Apply search filter if provided
    let filteredUsers = users;
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredUsers = users.filter(
        (user) => user.username.toLowerCase().includes(searchLower) || user.fullName.toLowerCase().includes(searchLower)
      );
    }

    return {
      users: filteredUsers,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    };
  } catch (error: any) {
    console.error("Error getting users:", error);
    return {
      users: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }
};

/**
 * Get user statistics
 */
const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    const totalNotes = await db.count("notes", { user_id: userId });
    const publicNotes = await db.count("notes", { user_id: userId, is_public: true });

    // Get all user notes to count unique tags
    const notes = await db.getWhere("notes", { user_id: userId });
    const allTags = notes.flatMap((note) => note.tags || []);
    const uniqueTags = [...new Set(allTags)];

    // Get last note created
    const lastNote = await db.getWhere(
      "notes",
      { user_id: userId },
      { orderBy: "created_at", ascending: false, limit: 1 }
    );

    return {
      totalNotes,
      publicNotes,
      totalTags: uniqueTags.length,
      lastNoteCreated: lastNote.length > 0 ? lastNote[0].created_at : null,
    };
  } catch (error: any) {
    console.error("Error getting user stats:", error);
    return {
      totalNotes: 0,
      publicNotes: 0,
      totalTags: 0,
      lastNoteCreated: null,
    };
  }
};

/**
 * Get user with stats
 */
const getUserWithStats = async (userId: string): Promise<UserWithStats | null> => {
  try {
    const user = await getUserById(userId);
    if (!user) return null;

    const stats = await getUserStats(userId);

    return {
      ...user,
      stats,
    };
  } catch (error: any) {
    console.error("Error getting user with stats:", error);
    return null;
  }
};

/**
 * Get profile changes (audit trail)
 */
const getProfileChanges = async (userId: string): Promise<ProfileChange[]> => {
  try {
    const changes = await db.getWhere(
      "profile_changes",
      { user_id: userId },
      { orderBy: "changed_at", ascending: false }
    );

    return changes.map((change) => ({
      id: change.id,
      userId: change.user_id,
      fieldChanged: change.field_changed,
      oldValue: change.old_value,
      newValue: change.new_value,
      changedBy: change.changed_by,
      changedByRole: change.changed_by_role,
      changedAt: change.changed_at,
      ipAddress: change.ip_address,
      userAgent: change.user_agent,
    }));
  } catch (error: any) {
    console.error("Error getting profile changes:", error);
    return [];
  }
};

// Export as service object
export const userService = {
  getUserById,
  getUserByUsername,
  getUserByAuthId,
  updateProfile,
  updateUsername,
  updateUser,
  createUser,
  deleteUser,
  restoreUser,
  resetUserPIN,
  getUsers,
  getUserStats,
  getUserWithStats,
  getProfileChanges,
};
