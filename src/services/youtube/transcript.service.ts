/**
 * YouTube Transcript Service
 * Handles YouTube Transcript API operations
 *
 * UPDATED: Uses dedicated YouTube API axios instance with authentication
 */

import { AxiosError } from "axios";
import { youtubeAPI } from "@/lib/axios";
import type {
  YouTubeUrlToIdRequest,
  YouTubeUrlToIdResponse,
  TranscriptRequest,
  TranscriptResponse,
  TranscriptTextRequest,
  TranscriptTextResponse,
  TranscriptSummarizeRequest,
  TranscriptSummarizeResponse,
  YouTubeImportOptions,
  YouTubeImportResult,
  YouTubeAPIError,
} from "@/types/youtube.types";
import { env } from "@/config/env";

/**
 * YouTube API Endpoints (relative paths)
 */
const endpoints = {
  urlToId: "/url-to-id",
  transcript: "/transcript",
  transcriptText: "/transcript/text",
  transcriptSummarize: "/transcript/summarize",
  health: "/health",
} as const;

/**
 * Default configuration
 */
const defaultConfig = {
  languages: "id,en", // Try Indonesian first, then English
  maxTokens: 50000,
};

/**
 * Extract video ID from YouTube URL
 */
export const extractVideoId = async (url: string): Promise<string> => {
  try {
    const response = await youtubeAPI.post<YouTubeUrlToIdResponse>(endpoints.urlToId, {
      url,
    } as YouTubeUrlToIdRequest);

    return response.data.video_id;
  } catch (error) {
    console.error("Error extracting video ID:", error);
    throw handleAPIError(error);
  }
};

/**
 * Fetch transcript (detailed JSON with segments)
 */
export const fetchTranscript = async (
  videoId: string,
  languages: string = defaultConfig.languages
): Promise<TranscriptResponse> => {
  try {
    const response = await youtubeAPI.post<TranscriptResponse>(endpoints.transcript, {
      video_id: videoId,
      languages,
    } as TranscriptRequest);

    return response.data;
  } catch (error) {
    console.error("Error fetching transcript:", error);
    throw handleAPIError(error);
  }
};

/**
 * Fetch transcript as plain text
 */
export const fetchTranscriptText = async (
  videoId: string,
  languages: string = defaultConfig.languages,
  includeTimestamps: boolean = true
): Promise<string> => {
  try {
    const response = await youtubeAPI.post<TranscriptTextResponse>(endpoints.transcriptText, {
      video_id: videoId,
      languages,
      include_timestamps: includeTimestamps,
    } as TranscriptTextRequest);

    return response.data.data;
  } catch (error) {
    console.error("Error fetching transcript text:", error);
    throw handleAPIError(error);
  }
};

/**
 * Fetch transcript with AI summarization
 */
export const fetchTranscriptSummary = async (
  videoId: string,
  languages: string = defaultConfig.languages,
  model: string = env.openRouter.defaultModel,
  maxTokens: number = defaultConfig.maxTokens
): Promise<TranscriptSummarizeResponse> => {
  try {
    const response = await youtubeAPI.post<TranscriptSummarizeResponse>(endpoints.transcriptSummarize, {
      video_id: videoId,
      languages,
      model,
      max_tokens: maxTokens,
    } as TranscriptSummarizeRequest);

    return response.data;
  } catch (error) {
    console.error("Error fetching transcript summary:", error);
    throw handleAPIError(error);
  }
};

/**
 * Import YouTube video and prepare note data
 */
export const importYouTubeVideo = async (options: YouTubeImportOptions): Promise<YouTubeImportResult> => {
  try {
    // Step 1: Extract video ID
    const videoId = await extractVideoId(options.url);
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Step 2: Fetch transcript (with or without AI summary)
    if (options.useAISummary) {
      // Use AI summarization
      const summaryData = await fetchTranscriptSummary(videoId, options.languages, options.model);

      // Generate title from video URL or first part of summary
      const title = generateTitle(summaryData.summary, videoUrl);

      return {
        success: true,
        videoId,
        videoUrl,
        title,
        content: summaryData.summary,
        language: summaryData.language_used,
        referenceInfo: options.referenceInfo,
        metadata: {
          source_type: "youtube",
          source_url: videoUrl,
          video_id: videoId,
          language_used: summaryData.language_used,
          total_segments: summaryData.original_transcript_length,
          has_ai_summary: true,
          model_used: summaryData.model_used,
          imported_at: new Date().toISOString(),
        },
      };
    } else {
      // Use plain transcript
      const transcriptData = await fetchTranscript(videoId, options.languages);

      // Generate title from video URL
      const title = generateTitle(transcriptData.transcript[0]?.text || "", videoUrl);

      // Combine transcript segments into content
      const content = transcriptData.transcript.map((seg) => `[${seg.formatted_time}] ${seg.text}`).join("\n");

      return {
        success: true,
        videoId,
        videoUrl,
        title,
        content,
        transcript: transcriptData.transcript,
        language: transcriptData.language_used,
        referenceInfo: options.referenceInfo,
        metadata: {
          source_type: "youtube",
          source_url: videoUrl,
          video_id: videoId,
          language_used: transcriptData.language_used,
          total_segments: transcriptData.total_segments,
          has_ai_summary: false,
          imported_at: new Date().toISOString(),
        },
      };
    }
  } catch (error) {
    console.error("Error importing YouTube video:", error);

    return {
      success: false,
      videoId: "",
      videoUrl: options.url,
      title: "",
      content: "",
      language: "",
      referenceInfo: options.referenceInfo,
      metadata: {
        source_type: "youtube",
        source_url: options.url,
        video_id: "",
        language_used: "",
        total_segments: 0,
        has_ai_summary: false,
        imported_at: new Date().toISOString(),
      },
      error: error instanceof Error ? error.message : "Gagal mengimpor video YouTube",
    };
  }
};

/**
 * Generate title from content
 */
const generateTitle = (content: string, videoUrl: string): string => {
  if (!content) {
    return `Catatan dari ${videoUrl}`;
  }

  // Take first 50 characters
  const firstPart = content.substring(0, 50).trim();

  // Clean up timestamps if present
  const cleaned = firstPart.replace(/\[\d{2}:\d{2}\]\s*/g, "");

  // Add ellipsis if truncated
  return cleaned.length < content.length ? `${cleaned}...` : cleaned;
};

/**
 * Check if YouTube API is healthy
 */
export const checkAPIHealth = async (): Promise<boolean> => {
  try {
    const response = await youtubeAPI.get(endpoints.health, {
      timeout: 5000,
    });
    return response.status === 200;
  } catch (error) {
    console.error("YouTube API health check failed:", error);
    return false;
  }
};

/**
 * Handle API errors
 */
const handleAPIError = (error: unknown): Error => {
  // If error is already processed by axios interceptor
  if (error instanceof Error) {
    return error;
  }

  // Fallback for AxiosError
  if (error && typeof error === "object" && "isAxiosError" in error) {
    const axiosError = error as AxiosError<YouTubeAPIError>;

    if (axiosError.response) {
      const message = axiosError.response.data?.detail || axiosError.message;
      return new Error(message);
    } else if (axiosError.request) {
      return new Error("Tidak dapat terhubung ke server. Pastikan YouTube API berjalan.");
    }
  }

  // Generic error
  return new Error("Terjadi kesalahan tidak diketahui");
};
