/**
 * User Store (Zustand)
 * Global state management for user operations
 */

import { create } from "zustand";
import * as userService from "@/services/supabase/user.service";
import { useAuthStore } from "./authStore";
import type {
  User,
  UserSummary,
  UpdateProfileData,
  UpdateUserData,
  CreateUserData,
  UserStats,
  UserFilterOptions,
  UserSortOptions,
  PaginatedUsers,
  ProfileChange,
} from "@/types/user.types";

interface UserStore {
  // State
  users: UserSummary[];
  currentUserStats: UserStats | null;
  profileChanges: ProfileChange[];
  isLoading: boolean;
  error: string | null;

  // Pagination
  currentPage: number;
  pageSize: number;
  totalUsers: number;
  totalPages: number;

  // Filters & Sort
  filters: UserFilterOptions;
  sort: UserSortOptions;

  // Actions - Profile
  updateProfile: (userId: string, data: UpdateProfileData) => Promise<void>;
  updateUsername: (userId: string, newUsername: string) => Promise<void>;
  fetchUserStats: (userId: string) => Promise<void>;
  fetchProfileChanges: (userId: string) => Promise<void>;

  // Actions - User Management (Admin)
  fetchUsers: (page?: number, filters?: UserFilterOptions, sort?: UserSortOptions) => Promise<void>;
  createUser: (data: CreateUserData, createdBy: string) => Promise<void>;
  updateUser: (userId: string, data: UpdateUserData, changedBy: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  restoreUser: (userId: string) => Promise<void>;
  resetUserPIN: (userId: string, newPin: string, resetBy: string) => Promise<void>;

  // Actions - Utilities
  setFilters: (filters: UserFilterOptions) => void;
  setSort: (sort: UserSortOptions) => void;
  setPage: (page: number) => void;
  clearError: () => void;
}

/**
 * User store
 */
export const useUserStore = create<UserStore>((set, get) => ({
  // Initial state
  users: [],
  currentUserStats: null,
  profileChanges: [],
  isLoading: false,
  error: null,

  // Pagination
  currentPage: 1,
  pageSize: 10,
  totalUsers: 0,
  totalPages: 0,

  // Filters & Sort
  filters: {},
  sort: { field: "createdAt", order: "desc" },

  // Update profile
  updateProfile: async (userId: string, data: UpdateProfileData) => {
    try {
      set({ isLoading: true, error: null });

      const updatedUser = await userService.updateProfile(userId, data);

      // Update auth store if updating current user
      const authUser = useAuthStore.getState().user;
      if (authUser?.id === userId) {
        useAuthStore.getState().setUser({
          ...authUser,
          fullName: updatedUser.fullName,
          phone: updatedUser.phone,
          bio: updatedUser.bio,
          avatarUrl: updatedUser.avatarUrl,
        });
      }

      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal mengubah profil",
      });
      throw error;
    }
  },

  // Update username
  updateUsername: async (userId: string, newUsername: string) => {
    try {
      set({ isLoading: true, error: null });

      const updatedUser = await userService.updateUsername(userId, newUsername);

      // Update auth store if updating current user
      const authUser = useAuthStore.getState().user;
      if (authUser?.id === userId) {
        useAuthStore.getState().setUser({
          ...authUser,
          username: updatedUser.username,
        });
      }

      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal mengubah username",
      });
      throw error;
    }
  },

  // Fetch user stats
  fetchUserStats: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      const stats = await userService.getUserStats(userId);

      set({
        currentUserStats: stats,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal memuat statistik",
      });
    }
  },

  // Fetch profile changes
  fetchProfileChanges: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      const changes = await userService.getProfileChanges(userId);

      set({
        profileChanges: changes,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal memuat riwayat perubahan",
      });
    }
  },

  // Fetch users (admin)
  fetchUsers: async (page?: number, filters?: UserFilterOptions, sort?: UserSortOptions) => {
    try {
      set({ isLoading: true, error: null });

      const currentPage = page || get().currentPage;
      const currentFilters = filters || get().filters;
      const currentSort = sort || get().sort;

      const result = await userService.getUsers(currentPage, get().pageSize, currentFilters, currentSort);

      set({
        users: result.users,
        currentPage: result.page,
        totalUsers: result.total,
        totalPages: result.totalPages,
        filters: currentFilters,
        sort: currentSort,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal memuat user",
      });
    }
  },

  // Create user (admin)
  createUser: async (data: CreateUserData, createdBy: string) => {
    try {
      set({ isLoading: true, error: null });

      await userService.createUser(data, createdBy);

      // Refresh users list
      await get().fetchUsers();

      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal membuat user",
      });
      throw error;
    }
  },

  // Update user (admin)
  updateUser: async (userId: string, data: UpdateUserData, changedBy: string) => {
    try {
      set({ isLoading: true, error: null });

      await userService.updateUser(userId, data, changedBy);

      // Refresh users list
      await get().fetchUsers();

      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal mengubah user",
      });
      throw error;
    }
  },

  // Delete user (admin)
  deleteUser: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      await userService.deleteUser(userId);

      // Refresh users list
      await get().fetchUsers();

      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal menghapus user",
      });
      throw error;
    }
  },

  // Restore user (admin)
  restoreUser: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      await userService.restoreUser(userId);

      // Refresh users list
      await get().fetchUsers();

      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal mengembalikan user",
      });
      throw error;
    }
  },

  // Reset user PIN (admin)
  resetUserPIN: async (userId: string, newPin: string, resetBy: string) => {
    try {
      set({ isLoading: true, error: null });

      await userService.resetUserPIN(userId, newPin, resetBy);

      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal mereset PIN",
      });
      throw error;
    }
  },

  // Set filters
  setFilters: (filters: UserFilterOptions) => {
    set({ filters });
  },

  // Set sort
  setSort: (sort: UserSortOptions) => {
    set({ sort });
  },

  // Set page
  setPage: (page: number) => {
    set({ currentPage: page });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

/**
 * Selectors
 */
export const selectUsers = (state: UserStore) => state.users;
export const selectCurrentUserStats = (state: UserStore) => state.currentUserStats;
export const selectProfileChanges = (state: UserStore) => state.profileChanges;
export const selectIsLoading = (state: UserStore) => state.isLoading;
export const selectError = (state: UserStore) => state.error;
export const selectPagination = (state: UserStore) => ({
  currentPage: state.currentPage,
  pageSize: state.pageSize,
  totalUsers: state.totalUsers,
  totalPages: state.totalPages,
});
