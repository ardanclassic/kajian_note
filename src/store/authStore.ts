/**
 * Auth Store (Zustand) - FIXED
 * Global state management for authentication
 */

import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import * as authService from "@/services/supabase/auth.service";
import type { LoginCredentials, RegisterData, ChangePINData, UserProfile, AuthState } from "@/types/auth.types";

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  changePIN: (data: ChangePINData) => Promise<void>;
  clearError: () => void;
  setUser: (user: UserProfile | null) => void;
  initialize: () => Promise<void>; // ✅ NEW: Initialize auth state
}

/**
 * Auth store
 */
export const useAuthStore = create<AuthStore>()((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: true, // ✅ FIX: Start with loading = true
  error: null,

  // ✅ NEW: Initialize auth state from Supabase session
  initialize: async () => {
    try {
      set({ isLoading: true });

      // Get current session from Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Session exists, get user profile
        const user = await authService.getCurrentUserProfile();

        if (user) {
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          // Session exists but profile not found
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } else {
        // No session
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }

      // ✅ Setup auth state listener
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth state changed:", event);

        if (event === "SIGNED_IN" && session?.user) {
          // User signed in
          const user = await authService.getCurrentUserProfile();
          set({
            user,
            isAuthenticated: true,
            error: null,
          });
        } else if (event === "SIGNED_OUT") {
          // User signed out
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        } else if (event === "TOKEN_REFRESHED") {
          // Token refreshed, update user data
          const user = await authService.getCurrentUserProfile();
          set({ user });
        }
      });
    } catch (error: any) {
      console.error("Initialize error:", error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message,
      });
    }
  },

  // Login
  login: async (credentials: LoginCredentials) => {
    try {
      set({ isLoading: true, error: null });

      const { user, session } = await authService.login(credentials);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || "Gagal login",
      });
      throw error;
    }
  },

  // Register
  register: async (data: RegisterData) => {
    try {
      set({ isLoading: true, error: null });

      const { user, session } = await authService.register(data);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || "Gagal mendaftar",
      });
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      set({ isLoading: true });

      await authService.logout();

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal logout",
      });
      throw error;
    }
  },

  // Refresh user data
  refreshUser: async () => {
    try {
      set({ isLoading: true, error: null });

      const user = await authService.getCurrentUserProfile();

      if (user) {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal memuat user",
      });
    }
  },

  // Change PIN
  changePIN: async (data: ChangePINData) => {
    try {
      set({ isLoading: true, error: null });

      await authService.changePIN(data);

      // Refresh user data
      await get().refreshUser();

      set({ isLoading: false, error: null });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal mengubah PIN",
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Set user manually (for updates from other stores)
  setUser: (user: UserProfile | null) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },
}));

/**
 * Selectors
 */
export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
export const selectError = (state: AuthStore) => state.error;
export const selectUserRole = (state: AuthStore) => state.user?.role;
export const selectSubscriptionTier = (state: AuthStore) => state.user?.subscriptionTier;
export const selectForcePasswordChange = (state: AuthStore) => state.user?.forcePasswordChange;
