/**
 * Notes Type Definitions
 * Types for notes-related operations
 */

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
}

/**
 * Create note data
 */
export interface CreateNoteData {
  title: string;
  content: string;
  isPublic?: boolean;
  tags?: string[];
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
export type NoteExportFormat = "pdf" | "word" | "markdown" | "text";

/**
 * Note export options
 */
export interface NoteExportOptions {
  format: NoteExportFormat;
  includeMetadata?: boolean;
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
}
