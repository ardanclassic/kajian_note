/**
 * YouTube Type Definitions
 * Types for YouTube Transcript API integration
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
 * Transcript Summarize Request
 */
export interface TranscriptSummarizeRequest {
  video_id: string;
  languages?: string;
  model?: string;
  max_tokens?: number;
}

/**
 * Transcript Summarize Response
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
 * YouTube Reference Info (NEW - Optional fields for source citation)
 */
export interface YouTubeReferenceInfo {
  materialTitle?: string; // Judul materi
  speaker?: string; // Narasumber/Ustadz
  channelName?: string; // Nama channel
  videoUrl: string; // YouTube URL
}

/**
 * YouTube Import Options
 */
export interface YouTubeImportOptions {
  url: string;
  useAISummary: boolean;
  languages?: string;
  model?: string;
  // NEW: Optional reference info
  referenceInfo?: YouTubeReferenceInfo;
}

/**
 * YouTube Import Result
 */
export interface YouTubeImportResult {
  success: boolean;
  videoId: string;
  videoUrl: string;
  title: string; // Generated from summary or first segment
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
  };
  // NEW: Reference info for citation
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
}

/**
 * API Error Response
 */
export interface YouTubeAPIError {
  detail: string;
  status?: number;
}
