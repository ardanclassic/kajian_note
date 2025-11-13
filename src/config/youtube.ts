/**
 * YouTube API Configuration
 * Settings for YouTube Transcript API integration
 */

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
 * Get environment variable with fallback
 */
const getEnvVar = (key: string, fallback: string = ""): string => {
  return import.meta.env[key] || fallback;
};

/**
 * YouTube API Configuration
 */
export const youtubeConfig: YouTubeConfig = {
  // YouTube Transcript API URL
  apiUrl: getEnvVar("VITE_YOUTUBE_API_URL", "http://localhost:8001"),

  // OpenRouter for AI Summary
  openRouter: {
    apiKey: getEnvVar("VITE_OPENROUTER_API_KEY", ""),
    defaultModel: getEnvVar("VITE_OPENROUTER_DEFAULT_MODEL", "qwen/qwen3-8b"),
    maxTokens: 1000,
  },

  // Default transcript settings
  transcript: {
    defaultLanguages: "id,en", // Try Indonesian first, then English
    includeTimestamps: true,
  },

  // Feature flags (all enabled for testing)
  features: {
    enableAISummary: true,
    enableBatchImport: false, // Future feature
  },
};

/**
 * YouTube API Endpoints
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
