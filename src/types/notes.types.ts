/**
 * Notes Type Definitions
 * Types for notes-related operations
 */

/**
 * Note source type
 */
export type NoteSourceType = "manual" | "youtube";

/**
 * Note source metadata (for YouTube imports)
 */
export interface NoteSourceMetadata {
  video_id?: string;
  video_url?: string;
  language_used?: string;
  total_segments?: number;
  has_ai_summary?: boolean;
  model_used?: string;
  imported_at?: string;
}

/**
 * Note
 */
export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  isPublic: boolean;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  // YouTube source fields
  sourceType: NoteSourceType;
  sourceUrl?: string | null;
  sourceMetadata?: NoteSourceMetadata | null;
}

/**
 * Note with user info
 */
export interface NoteWithUser extends Note {
  user: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
  };
}

/**
 * Note summary (for lists)
 */
export interface NoteSummary {
  id: string;
  title: string;
  content: string; // Truncated
  userId: string;
  isPublic: boolean;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  // YouTube source fields
  sourceType: NoteSourceType;
  sourceUrl?: string | null;
  sourceMetadata?: NoteSourceMetadata | null;
}

/**
 * Create note data
 */
export interface CreateNoteData {
  title: string;
  content: string;
  isPublic?: boolean;
  tags?: string[];
  // YouTube source fields
  sourceType?: NoteSourceType;
  sourceUrl?: string;
  sourceMetadata?: NoteSourceMetadata;
}

/**
 * Update note data
 */
export interface UpdateNoteData {
  title?: string;
  content?: string;
  isPublic?: boolean;
  isPinned?: boolean;
  tags?: string[];
  // YouTube source fields (rarely updated)
  sourceType?: NoteSourceType;
  sourceUrl?: string;
  sourceMetadata?: NoteSourceMetadata;
}

/**
 * Note filter options
 */
export interface NoteFilterOptions {
  userId?: string;
  isPublic?: boolean;
  isPinned?: boolean;
  tags?: string[];
  search?: string;
  sourceType?: NoteSourceType; // Filter by source
}

/**
 * Note sort options
 */
export type NoteSortField = "title" | "createdAt" | "updatedAt";
export type NoteSortOrder = "asc" | "desc";

export interface NoteSortOptions {
  field: NoteSortField;
  order: NoteSortOrder;
}

/**
 * Paginated notes response
 */
export interface PaginatedNotes {
  notes: NoteSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Note export format
 */
export type NoteExportFormat = "pdf" | "markdown" | "text";

/**
 * Note export options
 */
export interface NoteExportOptions {
  format: NoteExportFormat;
  includeMetadata?: boolean;
  includeSourceUrl?: boolean; // Include YouTube source if available
}

/**
 * Note statistics
 */
export interface NoteStatistics {
  totalNotes: number;
  publicNotes: number;
  privateNotes: number;
  pinnedNotes: number;
  totalTags: number;
  uniqueTags: string[];
  // Source statistics
  manualNotes: number;
  youtubeNotes: number;
  aiSummaryNotes: number;
}
