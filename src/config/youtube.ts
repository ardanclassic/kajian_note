/**
 * YouTube API Configuration
 * Settings for YouTube Transcript API integration
 *
 * UPDATED: Uses centralized env config instead of hardcoded values
 */

import { env } from "@/config/env";

interface YouTubeConfig {
  // API Base URL
  apiUrl: string;

  // OpenRouter Settings (for AI summarization)
  openRouter: {
    apiKey: string;
    defaultModel: string;
    maxTokens: number;
  };

  // Transcript Settings
  transcript: {
    defaultLanguages: string; // "id,en"
    includeTimestamps: boolean;
  };

  // Feature Flags
  features: {
    enableAISummary: boolean;
    enableBatchImport: boolean;
  };
}

/**
 * YouTube API Configuration
 */
export const youtubeConfig: YouTubeConfig = {
  // YouTube Transcript API URL (from env)
  apiUrl: env.youtube.apiUrl,

  // OpenRouter for AI Summary (from env)
  openRouter: {
    apiKey: env.openRouter.apiKey,
    defaultModel: env.openRouter.defaultModel,
    maxTokens: 50000,
  },

  // Default transcript settings
  transcript: {
    defaultLanguages: "id,en", // Try Indonesian first, then English
    includeTimestamps: true,
  },

  // Feature flags
  features: {
    enableAISummary: true,
    enableBatchImport: false, // Future feature
  },
};

/**
 * YouTube API Endpoints
 * Note: These are now handled by the axios instance in @/lib/axios
 * Keep this for backward compatibility only
 */
export const youtubeEndpoints = {
  urlToId: `${youtubeConfig.apiUrl}/url-to-id`,
  transcript: `${youtubeConfig.apiUrl}/transcript`,
  transcriptText: `${youtubeConfig.apiUrl}/transcript/text`,
  transcriptSummarize: `${youtubeConfig.apiUrl}/transcript/summarize`,
  health: `${youtubeConfig.apiUrl}/health`,
} as const;

/**
 * Check if AI summarization is available
 */
export const isAISummaryAvailable = (): boolean => {
  return youtubeConfig.features.enableAISummary && youtubeConfig.openRouter.apiKey !== "";
};

/**
 * Check if YouTube API is configured
 */
export const isYouTubeAPIConfigured = (): boolean => {
  return youtubeConfig.apiUrl !== "";
};
