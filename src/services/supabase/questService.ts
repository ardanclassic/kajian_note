/**
 * Quest Supabase Service
 * Handles all Supabase operations for Quest user data (sessions, stats, bookmarks)
 *
 * TEMPORARILY DISABLED due to schema migration.
 * Focusing on Appwrite content delivery first.
 */

// import { supabase } from "@/lib/supabase";
// import type { QuizSession, QuestStats, QuestBookmark, QuestSupabaseService } from "@/types";

export const questSupabaseService = {
  // Mock implementations to satisfy type checker for now
  createSession: async () => ({}),
  updateSession: async () => ({}),
  getSessionById: async () => null,
  getSessionsByUser: async () => [],
  getRecentSessions: async () => [],
  deleteSession: async () => {},

  getStatsByTopic: async () => null,
  getAllStats: async () => [],
  upsertStats: async () => ({}),

  createBookmark: async () => ({}),
  getBookmarksByUser: async () => [],
  deleteBookmark: async () => {},
  isQuestionBookmarked: async () => false,
};
