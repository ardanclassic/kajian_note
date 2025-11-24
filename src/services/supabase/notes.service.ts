/**
 * Notes Service
 * Handles notes-related operations
 */

import { supabase } from "@/lib/supabase";
import * as db from "./database.service";
import * as subscriptionService from "./subscription.service";
import type {
  Note,
  NoteWithUser,
  NoteSummary,
  CreateNoteData,
  UpdateNoteData,
  NoteFilterOptions,
  NoteSortOptions,
  PaginatedNotes,
  NoteStatistics,
} from "@/types/notes.types";

/**
 * Map camelCase field to snake_case column name
 */
const mapSortFieldToColumn = (field: string): string => {
  const fieldMap: Record<string, string> = {
    createdAt: "created_at",
    updatedAt: "updated_at",
    title: "title",
  };
  return fieldMap[field] || "created_at";
};

/**
 * Get note by ID
 */
export const getNoteById = async (noteId: string): Promise<Note | null> => {
  try {
    const note = await db.getById("notes", noteId);
    if (!note) return null;

    return mapDbNoteToNote(note);
  } catch (error: any) {
    console.error("Error getting note by ID:", error);
    return null;
  }
};

/**
 * Get note with user info
 */
export const getNoteWithUser = async (noteId: string): Promise<NoteWithUser | null> => {
  try {
    const { data, error } = await supabase
      .from("notes")
      .select(
        `
        *,
        users (
          id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .eq("id", noteId)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      userId: data.user_id,
      isPublic: data.is_public,
      isPinned: data.is_pinned,
      tags: data.tags || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      sourceType: data.source_type || "manual",
      sourceUrl: data.source_url || null,
      sourceMetadata: data.source_metadata || null,
      user: {
        id: (data.users as any).id,
        username: (data.users as any).username,
        fullName: (data.users as any).full_name,
        avatarUrl: (data.users as any).avatar_url,
      },
    };
  } catch (error: any) {
    console.error("Error getting note with user:", error);
    return null;
  }
};

/**
 * Create note
 */
export const createNote = async (userId: string, data: CreateNoteData): Promise<Note> => {
  try {
    // Check if user can create note
    const canCreate = await subscriptionService.canCreateNote(userId);
    if (!canCreate.allowed) {
      throw new Error(canCreate.message);
    }

    // Check if user can create public note
    if (data.isPublic) {
      const canPublic = await subscriptionService.canCreatePublicNote(userId);
      if (!canPublic.allowed) {
        throw new Error(canPublic.message);
      }
    }

    // Tags validation is handled by Zod schema (max 5 tags per note)
    // No need to check total tags limit as it's unlimited for all tiers

    // Prepare note data with proper snake_case mapping
    const noteData: any = {
      title: data.title,
      content: data.content,
      user_id: userId,
      is_public: data.isPublic || false,
      is_pinned: false,
      tags: data.tags || [],
    };

    // Add YouTube source fields mapping (camelCase → snake_case)
    if (data.sourceType) {
      noteData.source_type = data.sourceType;
    }
    if (data.sourceUrl) {
      noteData.source_url = data.sourceUrl;
    }
    if (data.sourceMetadata) {
      noteData.source_metadata = data.sourceMetadata;
    }

    // Create note
    const note = await db.create("notes", noteData);

    if (!note) throw new Error("Gagal membuat catatan");

    return mapDbNoteToNote(note);
  } catch (error: any) {
    console.error("Error creating note:", error);
    throw new Error(error.message || "Gagal membuat catatan");
  }
};

/**
 * Update note
 */
export const updateNote = async (noteId: string, userId: string, data: UpdateNoteData): Promise<Note> => {
  try {
    // Get existing note
    const existingNote = await db.getById("notes", noteId);
    if (!existingNote) throw new Error("Catatan tidak ditemukan");
    if (existingNote.user_id !== userId) throw new Error("Tidak memiliki akses");

    // Check if updating to public
    if (data.isPublic && !existingNote.is_public) {
      const canPublic = await subscriptionService.canCreatePublicNote(userId);
      if (!canPublic.allowed) {
        throw new Error(canPublic.message);
      }
    }

    // Tags validation is handled by Zod schema (max 5 tags per note)
    // No need to check total tags limit as it's unlimited for all tiers

    // Update note with proper snake_case mapping
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.isPublic !== undefined) updateData.is_public = data.isPublic;
    if (data.isPinned !== undefined) updateData.is_pinned = data.isPinned;
    if (data.tags !== undefined) updateData.tags = data.tags;

    // Add YouTube source fields mapping (camelCase → snake_case)
    if (data.sourceType !== undefined) updateData.source_type = data.sourceType;
    if (data.sourceUrl !== undefined) updateData.source_url = data.sourceUrl;
    if (data.sourceMetadata !== undefined) updateData.source_metadata = data.sourceMetadata;

    const updated = await db.update("notes", noteId, updateData);
    if (!updated) throw new Error("Gagal mengubah catatan");

    return mapDbNoteToNote(updated);
  } catch (error: any) {
    console.error("Error updating note:", error);
    throw new Error(error.message || "Gagal mengubah catatan");
  }
};

/**
 * Delete note
 */
export const deleteNote = async (noteId: string, userId: string): Promise<boolean> => {
  try {
    const note = await db.getById("notes", noteId);
    if (!note) throw new Error("Catatan tidak ditemukan");
    if (note.user_id !== userId) throw new Error("Tidak memiliki akses");

    await db.deleteById("notes", noteId);
    return true;
  } catch (error: any) {
    console.error("Error deleting note:", error);
    throw new Error(error.message || "Gagal menghapus catatan");
  }
};

/**
 * Delete note (by admin/panitia)
 */
export const deleteNoteByAdmin = async (noteId: string): Promise<boolean> => {
  try {
    await db.deleteById("notes", noteId);
    return true;
  } catch (error: any) {
    console.error("Error deleting note by admin:", error);
    throw new Error(error.message || "Gagal menghapus catatan");
  }
};

/**
 * Pin/unpin note (admin/panitia only)
 */
export const togglePinNote = async (noteId: string, isPinned: boolean): Promise<Note> => {
  try {
    const updated = await db.update("notes", noteId, { is_pinned: isPinned });
    if (!updated) throw new Error("Gagal mengubah pin status");

    return mapDbNoteToNote(updated);
  } catch (error: any) {
    console.error("Error toggling pin note:", error);
    throw new Error(error.message || "Gagal mengubah pin status");
  }
};

/**
 * Get user notes
 */
export const getUserNotes = async (
  userId: string,
  page: number = 1,
  pageSize: number = 10,
  filters?: Omit<NoteFilterOptions, "userId">,
  sort?: NoteSortOptions
): Promise<PaginatedNotes> => {
  try {
    const dbFilters: any = { user_id: userId };

    if (filters?.isPublic !== undefined) dbFilters.is_public = filters.isPublic;
    if (filters?.isPinned !== undefined) dbFilters.is_pinned = filters.isPinned;
    if (filters?.sourceType !== undefined) dbFilters.source_type = filters.sourceType;

    // Map sort field to database column
    const sortField = sort?.field ? mapSortFieldToColumn(sort.field) : "created_at";

    let result = await db.paginate("notes", {
      page,
      pageSize,
      filters: dbFilters,
      orderBy: sortField,
      ascending: sort?.order === "asc",
    });

    let notes = result.data.map(mapDbNoteToNoteSummary);

    // Apply tag filter
    if (filters?.tags && filters.tags.length > 0) {
      notes = notes.filter((note) => filters.tags!.some((tag) => note.tags.includes(tag)));
    }

    // Apply search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      notes = notes.filter(
        (note) => note.title.toLowerCase().includes(searchLower) || note.content.toLowerCase().includes(searchLower)
      );
    }

    return {
      notes,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    };
  } catch (error: any) {
    console.error("Error getting user notes:", error);
    return {
      notes: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }
};

/**
 * Get public notes
 */
export const getPublicNotes = async (
  page: number = 1,
  pageSize: number = 10,
  filters?: Omit<NoteFilterOptions, "isPublic">,
  sort?: NoteSortOptions
): Promise<PaginatedNotes> => {
  try {
    const dbFilters: any = { is_public: true };

    if (filters?.isPinned !== undefined) dbFilters.is_pinned = filters.isPinned;
    if (filters?.userId) dbFilters.user_id = filters.userId;
    if (filters?.sourceType !== undefined) dbFilters.source_type = filters.sourceType;

    // Map sort field to database column
    const sortField = sort?.field ? mapSortFieldToColumn(sort.field) : "created_at";

    let result = await db.paginate("notes", {
      page,
      pageSize,
      filters: dbFilters,
      orderBy: sortField,
      ascending: sort?.order === "asc",
    });

    let notes = result.data.map(mapDbNoteToNoteSummary);

    // Apply tag filter
    if (filters?.tags && filters.tags.length > 0) {
      notes = notes.filter((note) => filters.tags!.some((tag) => note.tags.includes(tag)));
    }

    // Apply search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      notes = notes.filter(
        (note) => note.title.toLowerCase().includes(searchLower) || note.content.toLowerCase().includes(searchLower)
      );
    }

    return {
      notes,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    };
  } catch (error: any) {
    console.error("Error getting public notes:", error);
    return {
      notes: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }
};

/**
 * Search notes
 */
export const searchNotes = async (
  userId: string,
  query: string,
  includePublic: boolean = false
): Promise<NoteSummary[]> => {
  try {
    let allNotes: any[] = [];

    // Search user's own notes
    const userNotes = await db.search("notes", "title", query, { limit: 50 });
    allNotes = userNotes.filter((note) => note.user_id === userId);

    // Search in content too
    const contentNotes = await db.search("notes", "content", query, { limit: 50 });
    const contentUserNotes = contentNotes.filter((note) => note.user_id === userId);
    allNotes = [...allNotes, ...contentUserNotes];

    // Include public notes if requested
    if (includePublic) {
      const publicNotes = userNotes.filter((note) => note.is_public && note.user_id !== userId);
      const publicContentNotes = contentNotes.filter((note) => note.is_public && note.user_id !== userId);
      allNotes = [...allNotes, ...publicNotes, ...publicContentNotes];
    }

    // Remove duplicates
    const uniqueNotes = Array.from(new Map(allNotes.map((note) => [note.id, note])).values());

    return uniqueNotes.map(mapDbNoteToNoteSummary);
  } catch (error: any) {
    console.error("Error searching notes:", error);
    return [];
  }
};

/**
 * Get notes by tag
 */
export const getNotesByTag = async (
  tag: string,
  userId?: string,
  includePublic: boolean = false
): Promise<NoteSummary[]> => {
  try {
    let query = supabase.from("notes").select("*").contains("tags", [tag]);

    if (userId && !includePublic) {
      query = query.eq("user_id", userId);
    } else if (userId && includePublic) {
      query = query.or(`user_id.eq.${userId},is_public.eq.true`);
    } else if (includePublic) {
      query = query.eq("is_public", true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(mapDbNoteToNoteSummary);
  } catch (error: any) {
    console.error("Error getting notes by tag:", error);
    return [];
  }
};

/**
 * Get all tags used by user
 */
export const getUserTags = async (userId: string): Promise<string[]> => {
  try {
    const notes = await db.getWhere("notes", { user_id: userId });
    const allTags = notes.flatMap((note) => note.tags || []);
    const uniqueTags = [...new Set(allTags)].sort();

    return uniqueTags;
  } catch (error: any) {
    console.error("Error getting user tags:", error);
    return [];
  }
};

/**
 * Get note statistics
 */
export const getNoteStatistics = async (userId: string): Promise<NoteStatistics> => {
  try {
    const totalNotes = await db.count("notes", { user_id: userId });
    const publicNotes = await db.count("notes", { user_id: userId, is_public: true });
    const privateNotes = totalNotes - publicNotes;
    const pinnedNotes = await db.count("notes", { user_id: userId, is_pinned: true });

    // YouTube statistics
    const manualNotes = await db.count("notes", { user_id: userId, source_type: "manual" });
    const youtubeNotes = await db.count("notes", { user_id: userId, source_type: "youtube" });

    // Get AI summary count
    const allNotes = await db.getWhere("notes", { user_id: userId });
    const aiSummaryNotes = allNotes.filter(
      (note) => (note as any).source_metadata && ((note as any).source_metadata as any).has_ai_summary === true
    ).length;

    return {
      totalNotes,
      publicNotes,
      privateNotes,
      pinnedNotes,
      manualNotes,
      youtubeNotes,
      aiSummaryNotes,
    };
  } catch (error: any) {
    console.error("Error getting note statistics:", error);
    return {
      totalNotes: 0,
      publicNotes: 0,
      privateNotes: 0,
      pinnedNotes: 0,
      manualNotes: 0,
      youtubeNotes: 0,
      aiSummaryNotes: 0,
    };
  }
};

/**
 * Map database note to Note type
 */
const mapDbNoteToNote = (dbNote: any): Note => {
  return {
    id: dbNote.id,
    title: dbNote.title,
    content: dbNote.content,
    userId: dbNote.user_id,
    isPublic: dbNote.is_public,
    isPinned: dbNote.is_pinned,
    tags: dbNote.tags || [],
    createdAt: dbNote.created_at,
    updatedAt: dbNote.updated_at,
    // Map YouTube fields (snake_case → camelCase)
    sourceType: dbNote.source_type || "manual",
    sourceUrl: dbNote.source_url || null,
    sourceMetadata: dbNote.source_metadata || null,
  };
};

/**
 * Map database note to NoteSummary type
 */
const mapDbNoteToNoteSummary = (dbNote: any): NoteSummary => {
  const note = mapDbNoteToNote(dbNote);

  // Truncate content for summary
  const maxLength = 200;
  const content = note.content.length > maxLength ? note.content.substring(0, maxLength) + "..." : note.content;

  return {
    ...note,
    content,
  };
};
