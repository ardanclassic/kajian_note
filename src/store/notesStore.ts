/**
 * Notes Store (Zustand)
 * Global state management for notes operations
 */

import { create } from "zustand";
import * as notesService from "@/services/supabase/notes.service";
import type {
  Note,
  NoteSummary,
  CreateNoteData,
  UpdateNoteData,
  NoteFilterOptions,
  NoteSortOptions,
  PaginatedNotes,
  NoteStatistics,
} from "@/types/notes.types";

interface NotesStore {
  // State - User Notes
  userNotes: NoteSummary[];
  publicNotes: NoteSummary[];
  currentNote: Note | null;
  statistics: NoteStatistics | null;
  tags: string[];
  isLoading: boolean;
  error: string | null;

  // Pagination - User Notes
  currentPage: number;
  pageSize: number;
  totalNotes: number;
  totalPages: number;

  // Pagination - Public Notes
  publicCurrentPage: number;
  publicPageSize: number;
  publicTotalNotes: number;
  publicTotalPages: number;

  // Filters & Sort
  filters: NoteFilterOptions;
  sort: NoteSortOptions;

  // Actions - User Notes
  fetchUserNotes: (userId: string, page?: number, filters?: NoteFilterOptions, sort?: NoteSortOptions) => Promise<void>;
  fetchNoteById: (noteId: string) => Promise<void>;
  createNote: (userId: string, data: CreateNoteData) => Promise<void>;
  updateNote: (noteId: string, userId: string, data: UpdateNoteData) => Promise<void>;
  deleteNote: (noteId: string, userId: string) => Promise<void>;
  fetchUserTags: (userId: string) => Promise<void>;
  fetchStatistics: (userId: string) => Promise<void>;

  // Actions - Public Notes
  fetchPublicNotes: (page?: number, filters?: NoteFilterOptions, sort?: NoteSortOptions) => Promise<void>;

  // Actions - Search
  searchNotes: (userId: string, query: string, includePublic?: boolean) => Promise<NoteSummary[]>;
  getNotesByTag: (tag: string, userId?: string, includePublic?: boolean) => Promise<NoteSummary[]>;

  // Actions - Admin
  deleteNoteByAdmin: (noteId: string) => Promise<void>;
  togglePinNote: (noteId: string, isPinned: boolean) => Promise<void>;

  // Utilities
  setFilters: (filters: NoteFilterOptions) => void;
  setSort: (sort: NoteSortOptions) => void;
  setPage: (page: number) => void;
  setPublicPage: (page: number) => void;
  clearCurrentNote: () => void;
  clearError: () => void;
}

/**
 * Notes store
 */
export const useNotesStore = create<NotesStore>((set, get) => ({
  // Initial state
  userNotes: [],
  publicNotes: [],
  currentNote: null,
  statistics: null,
  tags: [],
  isLoading: false,
  error: null,

  // Pagination - User Notes
  currentPage: 1,
  pageSize: 10,
  totalNotes: 0,
  totalPages: 0,

  // Pagination - Public Notes
  publicCurrentPage: 1,
  publicPageSize: 10,
  publicTotalNotes: 0,
  publicTotalPages: 0,

  // Filters & Sort
  filters: {},
  sort: { field: "createdAt", order: "desc" },

  // Fetch user notes
  fetchUserNotes: async (userId: string, page?: number, filters?: NoteFilterOptions, sort?: NoteSortOptions) => {
    try {
      set({ isLoading: true, error: null });

      const currentPage = page || get().currentPage;
      const currentFilters = filters || get().filters;
      const currentSort = sort || get().sort;

      const result = await notesService.getUserNotes(userId, currentPage, get().pageSize, currentFilters, currentSort);

      set({
        userNotes: result.notes,
        currentPage: result.page,
        totalNotes: result.total,
        totalPages: result.totalPages,
        filters: currentFilters,
        sort: currentSort,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal memuat catatan",
      });
    }
  },

  // Fetch note by ID
  fetchNoteById: async (noteId: string) => {
    try {
      set({ isLoading: true, error: null });

      const note = await notesService.getNoteById(noteId);

      set({
        currentNote: note,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal memuat catatan",
      });
    }
  },

  // Create note
  createNote: async (userId: string, data: CreateNoteData) => {
    try {
      set({ isLoading: true, error: null });

      await notesService.createNote(userId, data);

      // Refresh user notes
      await get().fetchUserNotes(userId);
      await get().fetchStatistics(userId);

      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal membuat catatan",
      });
      throw error;
    }
  },

  // Update note
  updateNote: async (noteId: string, userId: string, data: UpdateNoteData) => {
    try {
      set({ isLoading: true, error: null });

      await notesService.updateNote(noteId, userId, data);

      // Refresh user notes
      await get().fetchUserNotes(userId);

      // Update current note if viewing
      if (get().currentNote?.id === noteId) {
        await get().fetchNoteById(noteId);
      }

      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal mengubah catatan",
      });
      throw error;
    }
  },

  // Delete note
  deleteNote: async (noteId: string, userId: string) => {
    try {
      set({ isLoading: true, error: null });

      await notesService.deleteNote(noteId, userId);

      // Refresh user notes
      await get().fetchUserNotes(userId);
      await get().fetchStatistics(userId);

      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal menghapus catatan",
      });
      throw error;
    }
  },

  // Fetch user tags
  fetchUserTags: async (userId: string) => {
    try {
      const tags = await notesService.getUserTags(userId);

      set({ tags });
    } catch (error: any) {
      console.error("Error fetching tags:", error);
    }
  },

  // Fetch statistics
  fetchStatistics: async (userId: string) => {
    try {
      const statistics = await notesService.getNoteStatistics(userId);

      set({ statistics });
    } catch (error: any) {
      console.error("Error fetching statistics:", error);
    }
  },

  // Fetch public notes
  fetchPublicNotes: async (page?: number, filters?: NoteFilterOptions, sort?: NoteSortOptions) => {
    try {
      set({ isLoading: true, error: null });

      const currentPage = page || get().publicCurrentPage;
      const currentFilters = filters || {};
      const currentSort = sort || get().sort;

      const result = await notesService.getPublicNotes(currentPage, get().publicPageSize, currentFilters, currentSort);

      set({
        publicNotes: result.notes,
        publicCurrentPage: result.page,
        publicTotalNotes: result.total,
        publicTotalPages: result.totalPages,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal memuat catatan publik",
      });
    }
  },

  // Search notes
  searchNotes: async (userId: string, query: string, includePublic = false) => {
    try {
      const results = await notesService.searchNotes(userId, query, includePublic);
      return results;
    } catch (error: any) {
      console.error("Error searching notes:", error);
      return [];
    }
  },

  // Get notes by tag
  getNotesByTag: async (tag: string, userId?: string, includePublic = false) => {
    try {
      const results = await notesService.getNotesByTag(tag, userId, includePublic);
      return results;
    } catch (error: any) {
      console.error("Error getting notes by tag:", error);
      return [];
    }
  },

  // Delete note by admin
  deleteNoteByAdmin: async (noteId: string) => {
    try {
      set({ isLoading: true, error: null });

      await notesService.deleteNoteByAdmin(noteId);

      // Refresh public notes if viewing
      await get().fetchPublicNotes();

      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal menghapus catatan",
      });
      throw error;
    }
  },

  // Toggle pin note
  togglePinNote: async (noteId: string, isPinned: boolean) => {
    try {
      set({ isLoading: true, error: null });

      await notesService.togglePinNote(noteId, isPinned);

      // Refresh public notes
      await get().fetchPublicNotes();

      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Gagal mengubah pin status",
      });
      throw error;
    }
  },

  // Set filters
  setFilters: (filters: NoteFilterOptions) => {
    set({ filters });
  },

  // Set sort
  setSort: (sort: NoteSortOptions) => {
    set({ sort });
  },

  // Set page
  setPage: (page: number) => {
    set({ currentPage: page });
  },

  // Set public page
  setPublicPage: (page: number) => {
    set({ publicCurrentPage: page });
  },

  // Clear current note
  clearCurrentNote: () => {
    set({ currentNote: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

/**
 * Selectors
 */
export const selectUserNotes = (state: NotesStore) => state.userNotes;
export const selectPublicNotes = (state: NotesStore) => state.publicNotes;
export const selectCurrentNote = (state: NotesStore) => state.currentNote;
export const selectStatistics = (state: NotesStore) => state.statistics;
export const selectTags = (state: NotesStore) => state.tags;
export const selectIsLoading = (state: NotesStore) => state.isLoading;
export const selectError = (state: NotesStore) => state.error;
export const selectPagination = (state: NotesStore) => ({
  currentPage: state.currentPage,
  pageSize: state.pageSize,
  totalNotes: state.totalNotes,
  totalPages: state.totalPages,
});
export const selectPublicPagination = (state: NotesStore) => ({
  currentPage: state.publicCurrentPage,
  pageSize: state.publicPageSize,
  totalNotes: state.publicTotalNotes,
  totalPages: state.publicTotalPages,
});
