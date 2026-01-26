/**
 * Authentication Service - FIXED (JWT Metadata)
 * Handles all auth-related operations with Supabase
 */

import { supabase } from "@/lib/supabase";
import { generateDummyEmail, generateUsername } from "@/lib/utils";
import type {
  LoginCredentials,
  RegisterData,
  ChangePINData,
  UserProfile,
  LoginResponse,
  RegisterResponse,
} from "@/types/auth.types";

/**
 * Register new user
 */
export const register = async (data: RegisterData): Promise<RegisterResponse> => {
  try {
    // Use provided email or generate dummy email
    const emailToUse = data.email || generateDummyEmail(data.username);

    // 1. Check if username already exists
    // ✅ FIX: Use .maybeSingle() instead of .single() to avoid PGRST116 error
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("username")
      .eq("username", data.username)
      .maybeSingle(); // Returns null if not found, no error

    // Ignore "PGRST116" error (expected when username not found)
    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    if (existingUser) {
      throw new Error("Username sudah digunakan");
    }

    // 2. Create auth user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailToUse,
      password: data.pin, // PIN used as password
      options: {
        data: {
          username: data.username,
          full_name: data.fullName,
          role: "member", // ✅ Store role in JWT metadata
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Gagal membuat user");

    // 3. Create user profile in users table
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .insert({
        email: emailToUse,
        auth_user_id: authData.user.id,
        username: data.username,
        full_name: data.fullName,
        phone: data.phone || null,
        role: "member",
        subscription_tier: "free",
        subscription_status: "active",
        auth_type: "phone",
        is_verified: false,
        is_active: true,
      })
      .select()
      .single();

    if (profileError) throw profileError;
    if (!userProfile) throw new Error("Gagal membuat profil user");

    return {
      user: {
        id: userProfile.id,
        email: userProfile.email,
        paymentEmail: userProfile.payment_email,
        authUserId: userProfile.auth_user_id,
        username: userProfile.username,
        fullName: userProfile.full_name,
        phone: userProfile.phone,
        role: userProfile.role as any,
        subscriptionTier: userProfile.subscription_tier as any,
        subscriptionStatus: userProfile.subscription_status as any,
        subscriptionStartDate: userProfile.subscription_start_date,
        subscriptionEndDate: userProfile.subscription_end_date,
        avatarUrl: userProfile.avatar_url,
        bio: userProfile.bio,
        authType: userProfile.auth_type,
        isVerified: userProfile.is_verified,
        isActive: userProfile.is_active,
        forcePasswordChange: userProfile.force_password_change,
        passwordResetByAdmin: userProfile.password_reset_by_admin,
        passwordResetAt: userProfile.password_reset_at,
        passwordChangedAt: userProfile.password_changed_at,
        createdBy: userProfile.created_by,
        createdAt: userProfile.created_at,
        updatedAt: userProfile.updated_at,
        lastLoginAt: userProfile.last_login_at,
        telegramChatId: userProfile.telegram_chat_id,
        telegramVerifiedAt: userProfile.telegram_verified_at,
      },
      session: authData.session!,
    };
  } catch (error: any) {
    console.error("Register error:", error);
    throw new Error(error.message || "Gagal mendaftar");
  }
};

/**
 * Login user
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    // Generate dummy email from username
    const dummyEmail = generateDummyEmail(credentials.username);

    // 1. Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: dummyEmail,
      password: credentials.pin,
    });

    if (authError) throw new Error("Username atau PIN salah");
    if (!authData.user) throw new Error("Gagal login");

    // 2. Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", authData.user.id)
      .single();

    if (profileError) throw profileError;
    if (!userProfile) throw new Error("Profil user tidak ditemukan");

    // 3. Check if account is active
    if (!userProfile.is_active) {
      await supabase.auth.signOut();
      throw new Error("Akun tidak aktif. Hubungi admin.");
    }

    // 4. ✅ Update JWT metadata with current role
    await supabase.auth.updateUser({
      data: {
        role: userProfile.role,
        username: userProfile.username,
        full_name: userProfile.full_name,
      },
    });

    // 5. Update last login
    await supabase.from("users").update({ last_login_at: new Date().toISOString() }).eq("id", userProfile.id);
    return {
      user: {
        id: userProfile.id,
        email: userProfile.email,
        paymentEmail: userProfile.payment_email,
        authUserId: userProfile.auth_user_id,
        username: userProfile.username,
        fullName: userProfile.full_name,
        phone: userProfile.phone,
        role: userProfile.role as any,
        subscriptionTier: userProfile.subscription_tier as any,
        subscriptionStatus: userProfile.subscription_status as any,
        subscriptionStartDate: userProfile.subscription_start_date,
        subscriptionEndDate: userProfile.subscription_end_date,
        avatarUrl: userProfile.avatar_url,
        bio: userProfile.bio,
        authType: userProfile.auth_type,
        isVerified: userProfile.is_verified,
        isActive: userProfile.is_active,
        forcePasswordChange: userProfile.force_password_change,
        passwordResetByAdmin: userProfile.password_reset_by_admin,
        passwordResetAt: userProfile.password_reset_at,
        passwordChangedAt: userProfile.password_changed_at,
        createdBy: userProfile.created_by,
        createdAt: userProfile.created_at,
        updatedAt: userProfile.updated_at,
        lastLoginAt: new Date().toISOString(),
        telegramChatId: userProfile.telegram_chat_id,
        telegramVerifiedAt: userProfile.telegram_verified_at,
      },
      session: authData.session,
    };
  } catch (error: any) {
    console.error("Login error:", error);
    throw new Error(error.message || "Gagal login");
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error: any) {
    console.error("Logout error:", error);
    throw new Error(error.message || "Gagal logout");
  }
};

/**
 * Get current user profile
 */
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    // ✅ FIX: Use .maybeSingle() to avoid PGRST116 error
    const { data: profile, error } = await supabase.from("users").select("*").eq("auth_user_id", user.id).maybeSingle();

    // Ignore "PGRST116" error (happens during registration race condition)
    if (error && error.code !== "PGRST116") {
      throw error;
    }
    if (!profile) return null;

    // ✅ Sync JWT metadata if outdated
    const jwtRole = user.user_metadata?.role;
    if (jwtRole !== profile.role) {
      await supabase.auth.updateUser({
        data: {
          role: profile.role,
          username: profile.username,
          full_name: profile.full_name,
        },
      });
    }

    return {
      id: profile.id,
      email: profile.email,
      paymentEmail: profile.payment_email,
      authUserId: profile.auth_user_id,
      username: profile.username,
      fullName: profile.full_name,
      phone: profile.phone,
      role: profile.role as any,
      subscriptionTier: profile.subscription_tier as any,
      subscriptionStatus: profile.subscription_status as any,
      subscriptionStartDate: profile.subscription_start_date,
      subscriptionEndDate: profile.subscription_end_date,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      authType: profile.auth_type,
      isVerified: profile.is_verified,
      isActive: profile.is_active,
      forcePasswordChange: profile.force_password_change,
      passwordResetByAdmin: profile.password_reset_by_admin,
      passwordResetAt: profile.password_reset_at,
      passwordChangedAt: profile.password_changed_at,
      createdBy: profile.created_by,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      lastLoginAt: profile.last_login_at,
      telegramChatId: profile.telegram_chat_id,
      telegramVerifiedAt: profile.telegram_verified_at,
    };
  } catch (error: any) {
    console.error("Get current user error:", error);
    return null;
  }
};

/**
 * Change PIN
 */
export const changePIN = async (data: ChangePINData): Promise<void> => {
  try {
    // Update password in Supabase Auth
    const { error } = await supabase.auth.updateUser({
      password: data.newPin,
    });

    if (error) throw error;

    // Update password_changed_at in users table
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("users")
        .update({
          password_changed_at: new Date().toISOString(),
          force_password_change: false,
        })
        .eq("auth_user_id", user.id);
    }
  } catch (error: any) {
    console.error("Change PIN error:", error);
    throw new Error(error.message || "Gagal mengubah PIN");
  }
};
