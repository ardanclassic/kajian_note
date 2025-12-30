/**
 * YouTube Transcript Service
 * Handles YouTube Transcript API operations
 *
 * UPDATED: Added video metadata fetching for auto-reference
 */

import { AxiosError } from "axios";
import { youtubeAPI } from "@/lib/axios";
import type {
  YouTubeUrlToIdRequest,
  YouTubeUrlToIdResponse,
  VideoMetadataRequest,
  VideoMetadataResponse,
  TranscriptRequest,
  TranscriptResponse,
  TranscriptTextRequest,
  TranscriptTextResponse,
  TranscriptSummarizeRequest,
  TranscriptSummarizeResponse,
  SubmitSummarizeTaskRequest,
  SubmitSummarizeTaskResponse,
  PollTaskStatusResponse,
  YouTubeImportOptions,
  YouTubeImportResult,
  YouTubeReferenceInfo,
  YouTubeAPIError,
  // Deep Note types
  SubmitCleanupTaskRequest,
  SubmitCleanupTaskResponse,
  PollCleanupTaskStatusResponse,
  CleanupTaskResult,
  DeepNoteImportResult,
} from "@/types/youtube.types";
import { env } from "@/config/env";

/**
 * YouTube API Endpoints (relative paths)
 */
const endpoints = {
  urlToId: "/url-to-id",
  videoMetadata: "/video-metadata", // NEW
  transcript: "/transcript",
  transcriptText: "/transcript/text",
  transcriptSummarize: "/transcript/summarize", // OLD - Sync
  transcriptSummarizeTask: "/transcript/summarize-task", // NEW - Async (Note Summary)
  transcriptCleanupTask: "/transcript/cleanup-task", // NEW - Async (Deep Note)
  taskStatus: "/tasks", // NEW - Polling endpoint
  health: "/health",
} as const;

/**
 * Default configuration
 */
const defaultConfig = {
  languages: "id,en", // Try Indonesian first, then English
  maxTokens: 50000,
  polling: {
    interval: 2000, // 2 seconds
    maxAttempts: 150, // 150 * 2s = 300s = 5 minutes
    retryDelay: 3000, // Initial retry delay: 3s
    maxRetries: 3, // Max retry attempts on error
  },
  metadata: {
    extractSpeaker: true, // Extract speaker using LLM by default
    defaultModel: "qwen/qwen3-8b", // Default model for speaker extraction
  },
};

/**
 * Default configuration for Deep Note
 */
const defaultConfigDeepNote = {
  languages: "id,en",
  maxTokensPerChunk: 3000,
  outputLanguage: "Indonesian",
  polling: {
    interval: 3000, // 3 seconds (longer processing)
    maxAttempts: 200, // 200 * 3s = 600s = 10 minutes
    retryDelay: 3000,
    maxRetries: 3,
  },
};

/**
 * ========================================
 * VIDEO METADATA FUNCTIONS (NEW)
 * ========================================
 */

/**
 * Fetch video metadata including title, channel, speaker, thumbnail
 * NEW: Auto-fetch metadata for reference citation
 */
export const fetchVideoMetadata = async (
  url: string,
  extractSpeaker: boolean = defaultConfig.metadata.extractSpeaker,
  model: string = defaultConfig.metadata.defaultModel
): Promise<VideoMetadataResponse> => {
  try {
    const response = await youtubeAPI.post<VideoMetadataResponse>(endpoints.videoMetadata, {
      url,
      extract_speaker: extractSpeaker,
      model,
    } as VideoMetadataRequest);

    return response.data;
  } catch (error) {
    console.error("Error fetching video metadata:", error);
    throw handleAPIError(error);
  }
};

/**
 * ========================================
 * END VIDEO METADATA FUNCTIONS
 * ========================================
 */

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
 * Fetch transcript with AI summarization (OLD - SYNC)
 * @deprecated Use fetchTranscriptSummaryAsync instead
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
 * ========================================
 * ASYNC TASK FUNCTIONS (NEW)
 * ========================================
 */

/**
 * Submit summarize task (NEW - ASYNC)
 * Returns task_id for polling
 */
export const submitSummarizeTask = async (
  videoId: string,
  languages: string = defaultConfig.languages,
  model: string = env.openRouter.defaultModel,
  maxTokens: number = defaultConfig.maxTokens
): Promise<SubmitSummarizeTaskResponse> => {
  try {
    const response = await youtubeAPI.post<SubmitSummarizeTaskResponse>(endpoints.transcriptSummarizeTask, {
      video_id: videoId,
      languages,
      model,
      max_tokens: maxTokens,
    } as SubmitSummarizeTaskRequest);

    return response.data;
  } catch (error) {
    console.error("Error submitting summarize task:", error);
    throw handleAPIError(error);
  }
};

/**
 * Poll task status (NEW - ASYNC)
 * Check if task is completed
 */
export const pollTaskStatus = async (taskId: string, signal?: AbortSignal): Promise<PollTaskStatusResponse> => {
  try {
    const response = await youtubeAPI.get<PollTaskStatusResponse>(`${endpoints.taskStatus}/${taskId}`, {
      signal,
    });

    return response.data;
  } catch (error) {
    // Don't log if request was aborted
    if (signal?.aborted) {
      throw new Error("Request dibatalkan");
    }
    console.error("Error polling task status:", error);
    throw handleAPIError(error);
  }
};

/**
 * Poll task with retry and exponential backoff (NEW - ASYNC)
 * Polls until completed/failed or timeout
 */
const pollWithRetry = async (
  taskId: string,
  signal?: AbortSignal,
  onProgress?: (attempt: number, maxAttempts: number) => void
): Promise<TranscriptSummarizeResponse> => {
  let attempts = 0;
  let retryCount = 0;

  while (attempts < defaultConfig.polling.maxAttempts) {
    // Check if aborted
    if (signal?.aborted) {
      throw new Error("Proses dibatalkan");
    }

    try {
      attempts++;

      // Call progress callback if provided
      if (onProgress) {
        onProgress(attempts, defaultConfig.polling.maxAttempts);
      }

      const status = await pollTaskStatus(taskId, signal);

      if (status.status === "completed") {
        if (!status.result) {
          throw new Error("Hasil summary tidak ditemukan");
        }

        // ✅ ADD THIS
        if (!status.result.summary || status.result.summary.trim().length === 0) {
          console.error("Empty summary:", status.result);
          throw new Error("Summary kosong dari API. Coba gunakan mode timestamp.");
        }

        return status.result;
      }

      if (status.status === "failed") {
        throw new Error(status.error || "Task gagal diproses");
      }

      // Reset retry count on successful poll
      retryCount = 0;

      // Wait before next poll
      await sleep(defaultConfig.polling.interval, signal);
    } catch (error) {
      // If aborted, throw immediately
      if (signal?.aborted || (error instanceof Error && error.message === "Proses dibatalkan")) {
        throw error;
      }

      // Retry with exponential backoff
      retryCount++;
      if (retryCount >= defaultConfig.polling.maxRetries) {
        throw new Error("Gagal mengecek status task setelah beberapa kali percobaan");
      }

      const backoffDelay = defaultConfig.polling.retryDelay * Math.pow(2, retryCount - 1);
      console.warn(`Retry attempt ${retryCount}/${defaultConfig.polling.maxRetries} after ${backoffDelay}ms`);
      await sleep(backoffDelay, signal);
    }
  }

  throw new Error("Timeout: Proses summarisasi memakan waktu terlalu lama (>5 menit)");
};

/**
 * Fetch transcript with AI summarization (NEW - ASYNC)
 * Complete flow: submit task → poll → return result
 */
export const fetchTranscriptSummaryAsync = async (
  videoId: string,
  languages: string = defaultConfig.languages,
  model: string = env.openRouter.defaultModel,
  maxTokens: number = defaultConfig.maxTokens,
  signal?: AbortSignal,
  onProgress?: (attempt: number, maxAttempts: number) => void
): Promise<TranscriptSummarizeResponse> => {
  try {
    // Step 1: Submit task
    const taskResponse = await submitSummarizeTask(videoId, languages, model, maxTokens);

    // Step 2: Poll until completed/failed
    const result = await pollWithRetry(taskResponse.task_id, signal, onProgress);

    return result;
  } catch (error) {
    console.error("Error fetching transcript summary (async):", error);
    throw error instanceof Error ? error : handleAPIError(error);
  }
};

/**
 * ========================================
 * END ASYNC TASK FUNCTIONS
 * ========================================
 */

/**
 * ========================================
 * DEEP NOTE (CLEANUP TASK) FUNCTIONS
 * ========================================
 */

/**
 * Submit cleanup task (Deep Note - ASYNC)
 * Returns task_id for polling
 */
export const submitCleanupTask = async (
  videoId: string,
  languages: string = defaultConfigDeepNote.languages,
  model: string = env.openRouter.geminiModel,
  maxTokensPerChunk: number = defaultConfigDeepNote.maxTokensPerChunk,
  outputLanguage: string = defaultConfigDeepNote.outputLanguage
): Promise<SubmitCleanupTaskResponse> => {
  try {
    const response = await youtubeAPI.post<SubmitCleanupTaskResponse>(endpoints.transcriptCleanupTask, {
      video_id: videoId,
      languages,
      model,
      max_tokens_per_chunk: maxTokensPerChunk,
      output_language: outputLanguage,
    } as SubmitCleanupTaskRequest);

    return response.data;
  } catch (error) {
    console.error("Error submitting cleanup task:", error);
    throw handleAPIError(error);
  }
};

/**
 * Poll cleanup task status (Deep Note)
 * Reuses existing pollTaskStatus but with proper typing
 */
export const pollCleanupTaskStatus = async (
  taskId: string,
  signal?: AbortSignal
): Promise<PollCleanupTaskStatusResponse> => {
  try {
    const response = await youtubeAPI.get<PollCleanupTaskStatusResponse>(`${endpoints.taskStatus}/${taskId}`, {
      signal,
    });

    return response.data;
  } catch (error) {
    if (signal?.aborted) {
      throw new Error("Request dibatalkan");
    }
    console.error("Error polling cleanup task status:", error);
    throw handleAPIError(error);
  }
};

/**
 * Poll cleanup task with retry and exponential backoff (Deep Note)
 */
const pollCleanupWithRetry = async (
  taskId: string,
  signal?: AbortSignal,
  onProgress?: (attempt: number, maxAttempts: number) => void
): Promise<CleanupTaskResult> => {
  let attempts = 0;
  let retryCount = 0;

  while (attempts < defaultConfigDeepNote.polling.maxAttempts) {
    if (signal?.aborted) {
      throw new Error("Proses dibatalkan");
    }

    try {
      attempts++;

      if (onProgress) {
        onProgress(attempts, defaultConfigDeepNote.polling.maxAttempts);
      }

      const status = await pollCleanupTaskStatus(taskId, signal);

      if (status.status === "completed") {
        if (!status.result) {
          throw new Error("Hasil Deep Note tidak ditemukan");
        }

        if (!status.result.cleaned_text || status.result.cleaned_text.trim().length === 0) {
          console.error("Empty cleaned_text:", status.result);
          throw new Error("Cleaned text kosong dari API");
        }

        return status.result;
      }

      if (status.status === "failed") {
        throw new Error(status.error || "Deep Note task gagal diproses");
      }

      // Reset retry count on successful poll
      retryCount = 0;

      // Wait before next poll
      await sleep(defaultConfigDeepNote.polling.interval, signal);
    } catch (error) {
      if (signal?.aborted || (error instanceof Error && error.message === "Proses dibatalkan")) {
        throw error;
      }

      // Retry with exponential backoff
      retryCount++;
      if (retryCount >= defaultConfigDeepNote.polling.maxRetries) {
        throw new Error("Gagal mengecek status task setelah beberapa kali percobaan");
      }

      const backoffDelay = defaultConfigDeepNote.polling.retryDelay * Math.pow(2, retryCount - 1);
      console.warn(`Retry attempt ${retryCount}/${defaultConfigDeepNote.polling.maxRetries} after ${backoffDelay}ms`);
      await sleep(backoffDelay, signal);
    }
  }

  throw new Error("Timeout: Proses Deep Note memakan waktu terlalu lama (>10 menit)");
};

/**
 * Fetch Deep Note (cleanup) - Complete async flow
 * Submit task → poll → return result
 */
export const fetchDeepNoteAsync = async (
  videoId: string,
  languages: string = defaultConfigDeepNote.languages,
  model: string = env.openRouter.geminiModel,
  maxTokensPerChunk: number = defaultConfigDeepNote.maxTokensPerChunk,
  outputLanguage: string = defaultConfigDeepNote.outputLanguage,
  signal?: AbortSignal,
  onProgress?: (attempt: number, maxAttempts: number) => void
): Promise<CleanupTaskResult> => {
  try {
    // Step 1: Submit task
    const taskResponse = await submitCleanupTask(videoId, languages, model, maxTokensPerChunk, outputLanguage);

    // Step 2: Poll until completed/failed
    const result = await pollCleanupWithRetry(taskResponse.task_id, signal, onProgress);

    return result;
  } catch (error) {
    console.error("Error fetching Deep Note (async):", error);
    throw error instanceof Error ? error : handleAPIError(error);
  }
};

/**
 * ========================================
 * END DEEP NOTE FUNCTIONS
 * ========================================
 */

/**
 * Import YouTube video and prepare note data
 * UPDATED: Auto-fetch metadata and generate reference
 */
export const importYouTubeVideo = async (options: YouTubeImportOptions): Promise<YouTubeImportResult> => {
  try {
    // Step 1: Extract video ID
    const videoId = await extractVideoId(options.url);
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Step 2: Fetch metadata (NEW - auto-fetch)
    let metadata: VideoMetadataResponse | undefined;
    let referenceInfo: YouTubeReferenceInfo | undefined;

    if (options.metadata) {
      // Use provided metadata if available
      metadata = options.metadata;
    } else {
      // Fetch metadata automatically
      try {
        metadata = await fetchVideoMetadata(options.url);
      } catch (error) {
        console.warn("Failed to fetch video metadata, continuing without it:", error);
        // Continue without metadata
      }
    }

    // Build reference info from metadata
    if (metadata) {
      referenceInfo = {
        title: metadata.title,
        speaker: metadata.speaker_name !== "unknown" ? metadata.speaker_name : "Tidak diketahui",
        channelName: metadata.channel_name,
        videoUrl: metadata.video_url,
        thumbnailUrl: metadata.thumbnail_url,
        duration: metadata.duration,
        uploadDate: metadata.upload_date,
        viewCount: metadata.view_count,
      };
    }

    // Step 3: Fetch transcript (with or without AI summary)
    if (options.useAISummary) {
      // Use AI summarization (ASYNC)
      const summaryData = await fetchTranscriptSummaryAsync(
        videoId,
        options.languages,
        options.model,
        undefined,
        options.signal
      );

      // Use metadata title, fallback to generated title
      const title = metadata?.title || generateTitle(summaryData.summary, videoUrl);

      return {
        success: true,
        videoId,
        videoUrl,
        title,
        content: summaryData.summary,
        language: summaryData.language_used,
        referenceInfo,
        metadata: {
          source_type: "youtube",
          source_url: videoUrl,
          video_id: videoId,
          language_used: summaryData.language_used,
          total_segments: summaryData.original_transcript_length,
          has_ai_summary: true,
          model_used: summaryData.model_used,
          imported_at: new Date().toISOString(),
          video_metadata: metadata,
        },
      };
    } else {
      // Use plain transcript
      const transcriptData = await fetchTranscript(videoId, options.languages);

      // Use metadata title, fallback to generated title
      const title = metadata?.title || generateTitle(transcriptData.transcript[0]?.text || "", videoUrl);

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
        referenceInfo,
        metadata: {
          source_type: "youtube",
          source_url: videoUrl,
          video_id: videoId,
          language_used: transcriptData.language_used,
          total_segments: transcriptData.total_segments,
          has_ai_summary: false,
          imported_at: new Date().toISOString(),
          video_metadata: metadata,
        },
      };
    }
  } catch (error) {
    console.error("Error importing YouTube video:", error);

    // Check if error is abort
    if (error instanceof Error && error.message === "Proses dibatalkan") {
      return {
        success: false,
        videoId: "",
        videoUrl: options.url,
        title: "",
        content: "",
        language: "",
        referenceInfo: undefined,
        metadata: {
          source_type: "youtube",
          source_url: options.url,
          video_id: "",
          language_used: "",
          total_segments: 0,
          has_ai_summary: false,
          imported_at: new Date().toISOString(),
        },
        error: "Proses dibatalkan",
      };
    }

    return {
      success: false,
      videoId: "",
      videoUrl: options.url,
      title: "",
      content: "",
      language: "",
      referenceInfo: undefined,
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
 * Generate title from content (fallback)
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

/**
 * Sleep utility with abort signal support
 */
const sleep = (ms: number, signal?: AbortSignal): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("Proses dibatalkan"));
      return;
    }

    const timeout = setTimeout(resolve, ms);

    // Listen for abort
    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new Error("Proses dibatalkan"));
      });
    }
  });
};
