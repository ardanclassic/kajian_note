/**
 * Auth Store - SIMPLE VERSION
 * Back to basics, minimal complexity
 */

import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import * as authService from "@/services/supabase/auth.service";
import type { LoginCredentials, RegisterData, ChangePINData, UserProfile, AuthState } from "@/types/auth.types";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  changePIN: (data: ChangePINData) => Promise<void>;
  clearError: () => void;
  setUser: (user: UserProfile | null) => void;
  initialize: () => Promise<void>;
}

let authListenerUnsubscribe: (() => void) | null = null;

/**
 * Setup auth listener - SIMPLE
 */
const setupAuthListener = (set: any) => {
  if (authListenerUnsubscribe) {
    authListenerUnsubscribe();
    authListenerUnsubscribe = null;
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
    // console.log("🔔 Auth event:", event);

    if (event === "SIGNED_OUT") {
      set({ user: null, isAuthenticated: false });
    } else if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
      // Silently update user data
      const user = await authService.getCurrentUserProfile();
      if (user) {
        set({ user });
      }
    }
  });

  authListenerUnsubscribe = () => subscription.unsubscribe();
};

/**
 * Auth Store
 */
export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  /**
   * Initialize - Check session once
   */
  initialize: async () => {
    // console.log("🚀 Initializing auth...");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const user = await authService.getCurrentUserProfile();

        if (user) {
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          // Setup listener AFTER successful init
          setupAuthListener(set);

          console.log("✅ Auth initialized:", user.username);
          return;
        }
      }

      // No session or no user
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      console.log("ℹ️ No active session");
    } catch (error: any) {
      console.error("❌ Init error:", error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message,
      });
    }
  },

  /**
   * Login
   */
  login: async (credentials: LoginCredentials) => {
    try {
      set({ isLoading: true, error: null });

      const { user } = await authService.login(credentials);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      // Setup listener after login
      setupAuthListener(set);

      console.log("✅ Login:", user.username);
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message,
      });
      throw error;
    }
  },

  /**
   * Register
   */
  register: async (data: RegisterData) => {
    try {
      set({ isLoading: true, error: null });

      const { user } = await authService.register(data);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      // Setup listener after register
      setupAuthListener(set);

      console.log("✅ Register:", user.username);
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message,
      });
      throw error;
    }
  },

  /**
   * Logout
   */
  logout: async () => {
    try {
      await authService.logout();

      // Cleanup listener
      if (authListenerUnsubscribe) {
        authListenerUnsubscribe();
        authListenerUnsubscribe = null;
      }

      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });

      console.log("✅ Logout");
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Refresh user
   */
  refreshUser: async () => {
    try {
      const user = await authService.getCurrentUserProfile();

      if (user) {
        set({ user, isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch (error: any) {
      console.error("Refresh error:", error);
      set({ error: error.message });
    }
  },

  /**
   * Change PIN
   */
  changePIN: async (data: ChangePINData) => {
    try {
      set({ isLoading: true, error: null });

      await authService.changePIN(data);
      await get().refreshUser();

      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  setUser: (user: UserProfile | null) => set({ user, isAuthenticated: !!user }),
}));

export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
export const selectError = (state: AuthStore) => state.error;
