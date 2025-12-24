/**
 * YouTube Type Definitions
 * Types for YouTube Transcript API integration
 *
 * UPDATED: Added Video Metadata types for auto-fetch feature
 */

/**
 * YouTube URL to ID Request
 */
export interface YouTubeUrlToIdRequest {
  url: string;
}

/**
 * YouTube URL to ID Response
 */
export interface YouTubeUrlToIdResponse {
  video_id: string;
  original_url: string;
}

/**
 * ========================================
 * VIDEO METADATA TYPES (NEW)
 * ========================================
 */

/**
 * Video Metadata Request
 */
export interface VideoMetadataRequest {
  url: string;
  extract_speaker?: boolean; // Whether to extract speaker name using LLM (optional, defaults to True)
  model?: string; // Model to use for speaker extraction (optional, defaults to "qwen/qwen3-8b")
}

/**
 * Video Metadata Response
 */
export interface VideoMetadataResponse {
  video_id: string;
  video_url: string;
  title: string;
  channel_name: string;
  description: string;
  duration: number; // in seconds
  upload_date: string; // ISO format
  view_count: number;
  thumbnail_url: string;
  speaker_name: string; // Extracted by LLM or "unknown"
  speaker_extraction_method: string; // e.g., "llm" or "none"
}

/**
 * ========================================
 * END VIDEO METADATA TYPES
 * ========================================
 */

/**
 * Transcript Request (with body)
 */
export interface TranscriptRequest {
  video_id: string;
  languages?: string; // e.g., "id,en"
}

/**
 * Transcript Segment
 */
export interface TranscriptSegment {
  start_time: number;
  duration: number;
  text: string;
  formatted_time: string; // e.g., "00:00"
}

/**
 * Transcript Response (detailed JSON)
 */
export interface TranscriptResponse {
  video_id: string;
  video_url: string;
  language_used: string;
  total_segments: number;
  transcript: TranscriptSegment[];
}

/**
 * Transcript Text Request
 */
export interface TranscriptTextRequest {
  video_id: string;
  languages?: string;
  include_timestamps?: boolean;
}

/**
 * Transcript Text Response
 */
export interface TranscriptTextResponse {
  message: string;
  data: string; // Plain text transcript
}

/**
 * Transcript Summarize Request (SYNC - OLD)
 */
export interface TranscriptSummarizeRequest {
  video_id: string;
  languages?: string;
  model?: string;
  max_tokens?: number;
}

/**
 * Transcript Summarize Response (SYNC - OLD)
 */
export interface TranscriptSummarizeResponse {
  video_id: string;
  video_url: string;
  language_used: string;
  model_used: string;
  summary: string;
  original_transcript_length: number;
}

/**
 * ========================================
 * ASYNC TASK TYPES (NEW)
 * ========================================
 */

/**
 * Task Status
 */
export type TaskStatus = "pending" | "processing" | "completed" | "failed";

/**
 * Submit Summarize Task Request (ASYNC)
 */
export interface SubmitSummarizeTaskRequest {
  video_id: string;
  languages?: string;
  model?: string;
  max_tokens?: number;
}

/**
 * Submit Summarize Task Response (ASYNC)
 */
export interface SubmitSummarizeTaskResponse {
  task_id: string;
  status: TaskStatus;
  message: string;
}

/**
 * Poll Task Status Response (ASYNC)
 */
export interface PollTaskStatusResponse {
  task_id: string;
  status: TaskStatus;
  result?: TranscriptSummarizeResponse; // Available when status is "completed"
  error?: string; // Available when status is "failed"
}

/**
 * ========================================
 * END ASYNC TASK TYPES
 * ========================================
 */

/**
 * ========================================
 * DEEP NOTE (CLEANUP TASK) TYPES
 * ========================================
 */

/**
 * Submit Cleanup Task Request (Deep Note - ASYNC)
 */
export interface SubmitCleanupTaskRequest {
  video_id: string;
  languages?: string;
  model?: string; // defaults to gemini-2.5-flash
  max_tokens_per_chunk?: number; // defaults to 3000
  output_language?: string; // defaults to "Indonesian"
}

/**
 * Submit Cleanup Task Response (Deep Note)
 */
export interface SubmitCleanupTaskResponse {
  task_id: string;
  status: TaskStatus;
  message: string;
}

/**
 * Cleanup Task Result (when completed)
 */
export interface CleanupTaskResult {
  video_id: string;
  video_url: string;
  language_used: string;
  model_used: string;
  original_transcript_length: number;
  cleaned_text: string; // Different from summary
  chunks_processed: number; // New field
  total_characters: number; // New field
}

/**
 * Poll Cleanup Task Status Response (Deep Note)
 */
export interface PollCleanupTaskStatusResponse {
  task_id: string;
  status: TaskStatus;
  created_at?: string;
  completed_at?: string;
  result?: CleanupTaskResult;
  error?: string | null;
}

/**
 * Deep Note Import Result
 */
export interface DeepNoteImportResult {
  success: boolean;
  videoId: string;
  videoUrl: string;
  title: string;
  content: string; // cleaned_text mapped here
  language: string;
  chunksProcessed: number;
  totalCharacters: number;
  metadata: {
    source_type: "youtube";
    source_url: string;
    video_id: string;
    language_used: string;
    total_segments: number;
    has_deep_note: boolean;
    model_used?: string;
    imported_at: string;
    video_metadata?: VideoMetadataResponse;
  };
  referenceInfo?: YouTubeReferenceInfo;
  error?: string;
}

/**
 * ========================================
 * END DEEP NOTE TYPES
 * ========================================
 */

/**
 * YouTube Reference Info (Auto-fetched from metadata)
 * UPDATED: Now auto-populated from VideoMetadataResponse
 */
export interface YouTubeReferenceInfo {
  title: string; // Video title
  speaker: string; // Speaker/Ustadz name
  channelName: string; // Channel name
  videoUrl: string; // YouTube URL
  thumbnailUrl: string; // Video thumbnail
  duration?: number; // Video duration in seconds
  uploadDate?: string; // Upload date
  viewCount?: number; // View count
}

/**
 * YouTube Import Options
 * UPDATED: referenceInfo now auto-fetched, not manually entered
 */
export interface YouTubeImportOptions {
  url: string;
  useAISummary: boolean;
  languages?: string;
  model?: string;
  // Auto-fetched metadata (no longer manual input)
  metadata?: VideoMetadataResponse;
  // Optional abort signal for cancellation
  signal?: AbortSignal;
}

/**
 * YouTube Import Result
 * UPDATED: includes metadata
 */
export interface YouTubeImportResult {
  success: boolean;
  videoId: string;
  videoUrl: string;
  title: string; // Generated from metadata.title
  content: string; // Full transcript or AI summary
  transcript?: TranscriptSegment[]; // Raw transcript (optional)
  language: string;
  metadata: {
    source_type: "youtube";
    source_url: string;
    video_id: string;
    language_used: string;
    total_segments: number;
    has_ai_summary: boolean;
    model_used?: string;
    imported_at: string;
    // Video metadata
    video_metadata?: VideoMetadataResponse;
  };
  // Reference info for citation (auto-generated from metadata)
  referenceInfo?: YouTubeReferenceInfo;
  error?: string;
}

/**
 * YouTube Source Metadata (stored in DB)
 */
export interface YouTubeSourceMetadata {
  video_id: string;
  video_url: string;
  language_used: string;
  total_segments: number;
  has_ai_summary: boolean;
  model_used?: string;
  imported_at: string;
  // Video metadata
  video_metadata?: VideoMetadataResponse;
}

/**
 * API Error Response
 */
export interface YouTubeAPIError {
  detail: string;
  status?: number;
}
