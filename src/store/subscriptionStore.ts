/**
 * Subscription Store (Zustand)
 * Global state management for subscription operations
 */

import { create } from "zustand";
import * as subscriptionService from "@/services/supabase/subscription.service";
import { useAuthStore } from "./authStore";
import type {
  UserSubscription,
  SubscriptionTierInfo,
  UpgradeSubscriptionData,
  CancelSubscriptionData,
  ManualGrantSubscriptionData,
  SubscriptionHistory,
  SubscriptionUsage,
  SubscriptionCheckResult,
} from "@/types/subscription.types";

interface SubscriptionStore {
  // State
  currentSubscription: UserSubscription | null;
  tiers: SubscriptionTierInfo[];
  usage: SubscriptionUsage | null;
  history: SubscriptionHistory | null;
  isLoading: boolean;
  error: string | null;

  // Payment
  paymentUrl: string | null;
  paymentLoading: boolean;

  // Actions - Current User
  fetchCurrentSubscription: (userId: string) => Promise<void>;
  fetchSubscriptionTiers: (userId: string) => Promise<void>;
  fetchUsage: (userId: string) => Promise<void>;
  fetchHistory: (userId: string) => Promise<void>;
  upgradeSubscription: (userId: string, data: UpgradeSubscriptionData) => Promise<string>;
  cancelSubscription: (userId: string, data?: CancelSubscriptionData) => Promise<void>;

  // Actions - Limit Checks
  checkCanCreateNote: (userId: string) => Promise<SubscriptionCheckResult>;
  checkCanCreatePublicNote: (userId: string) => Promise<SubscriptionCheckResult>;
  checkCanExport: (userId: string) => Promise<SubscriptionCheckResult>;

  // Actions - Admin
  manualGrantSubscription: (data: ManualGrantSubscriptionData, grantedBy: string) => Promise<void>;

  // Utilities
  clearPaymentUrl: () => void;
  clearError: () => void;
}

/**
 * Subscription store
 */
export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  // Initial state
  currentSubscription: null,
  tiers: [],
  usage: null,
  history: null,
  isLoading: false,
  error: null,

  // Payment
  paymentUrl: null,
  paymentLoading: false,

  // Fetch current subscription
  fetchCurrentSubscription: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      const subscription = await subscriptionService.getUserSubscription(userId);

      set({
        currentSubscription: subscription,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal memuat subscription",
      });
    }
  },

  // Fetch subscription tiers
  fetchSubscriptionTiers: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      const authUser = useAuthStore.getState().user;
      const currentTier = authUser?.subscriptionTier;

      const tiers = await subscriptionService.getSubscriptionTiers(currentTier);

      set({
        tiers,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal memuat tiers",
      });
    }
  },

  // Fetch usage
  fetchUsage: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      const usage = await subscriptionService.getSubscriptionUsage(userId);

      set({
        usage,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal memuat usage",
      });
    }
  },

  // Fetch history
  fetchHistory: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      const history = await subscriptionService.getSubscriptionHistory(userId);

      set({
        history,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal memuat riwayat",
      });
    }
  },

  // Upgrade subscription
  upgradeSubscription: async (userId: string, data: UpgradeSubscriptionData) => {
    try {
      set({ paymentLoading: true, error: null });

      const { paymentUrl } = await subscriptionService.upgradeSubscription(userId, data);

      set({
        paymentUrl,
        paymentLoading: false,
      });

      return paymentUrl;
    } catch (error: any) {
      set({
        paymentLoading: false,
        error: error.message || "Gagal upgrade subscription",
      });
      throw error;
    }
  },

  // Cancel subscription
  cancelSubscription: async (userId: string, data?: CancelSubscriptionData) => {
    try {
      set({ isLoading: true, error: null });

      await subscriptionService.cancelSubscription(userId, data);

      // Refresh subscription data
      await get().fetchCurrentSubscription(userId);

      // Update auth store
      const authUser = useAuthStore.getState().user;
      if (authUser) {
        useAuthStore.getState().setUser({
          ...authUser,
          subscriptionStatus: "cancelled",
        });
      }

      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal cancel subscription",
      });
      throw error;
    }
  },

  // Check can create note
  checkCanCreateNote: async (userId: string) => {
    try {
      return await subscriptionService.canCreateNote(userId);
    } catch (error: any) {
      return {
        allowed: false,
        message: error.message || "Gagal memeriksa limit",
      };
    }
  },

  // Check can create public note
  checkCanCreatePublicNote: async (userId: string) => {
    try {
      return await subscriptionService.canCreatePublicNote(userId);
    } catch (error: any) {
      return {
        allowed: false,
        message: error.message || "Gagal memeriksa limit",
      };
    }
  },

  // Check can export (PDF/Markdown)
  checkCanExport: async (userId: string) => {
    try {
      return await subscriptionService.canExport(userId);
    } catch (error: any) {
      return {
        allowed: false,
        message: error.message || "Gagal memeriksa limit",
      };
    }
  },

  // Manual grant subscription (admin)
  manualGrantSubscription: async (data: ManualGrantSubscriptionData, grantedBy: string) => {
    try {
      set({ isLoading: true, error: null });

      await subscriptionService.manualGrantSubscription(data, grantedBy);

      // Refresh if granting to current user
      const authUser = useAuthStore.getState().user;
      if (authUser?.id === data.userId) {
        await useAuthStore.getState().refreshUser();
        await get().fetchCurrentSubscription(data.userId);
      }

      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal grant subscription",
      });
      throw error;
    }
  },

  // Clear payment URL
  clearPaymentUrl: () => {
    set({ paymentUrl: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

/**
 * Selectors
 */
export const selectCurrentSubscription = (state: SubscriptionStore) => state.currentSubscription;
export const selectTiers = (state: SubscriptionStore) => state.tiers;
export const selectUsage = (state: SubscriptionStore) => state.usage;
export const selectHistory = (state: SubscriptionStore) => state.history;
export const selectIsLoading = (state: SubscriptionStore) => state.isLoading;
export const selectError = (state: SubscriptionStore) => state.error;
export const selectPaymentUrl = (state: SubscriptionStore) => state.paymentUrl;
export const selectPaymentLoading = (state: SubscriptionStore) => state.paymentLoading;
