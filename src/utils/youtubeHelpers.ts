/**
 * YouTube Helper Functions
 * Utility functions for YouTube URL validation and formatting
 */

/**
 * Validate YouTube URL format
 */
export const isValidYouTubeUrl = (url: string): boolean => {
  if (!url || typeof url !== "string") return false;

  // YouTube URL patterns
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/v\/[\w-]+/,
  ];

  return patterns.some((pattern) => pattern.test(url));
};

/**
 * Extract video ID from YouTube URL (client-side validation)
 */
export const extractVideoIdFromUrl = (url: string): string | null => {
  if (!url) return null;

  // Pattern: youtube.com/watch?v=VIDEO_ID
  const watchPattern = /[?&]v=([^&#]+)/;
  const watchMatch = url.match(watchPattern);
  if (watchMatch) return watchMatch[1];

  // Pattern: youtu.be/VIDEO_ID
  const shortPattern = /youtu\.be\/([^?&#]+)/;
  const shortMatch = url.match(shortPattern);
  if (shortMatch) return shortMatch[1];

  // Pattern: youtube.com/embed/VIDEO_ID
  const embedPattern = /\/embed\/([^?&#]+)/;
  const embedMatch = url.match(embedPattern);
  if (embedMatch) return embedMatch[1];

  // Pattern: youtube.com/v/VIDEO_ID
  const vPattern = /\/v\/([^?&#]+)/;
  const vMatch = url.match(vPattern);
  if (vMatch) return vMatch[1];

  return null;
};

/**
 * Format video ID to standard YouTube URL
 */
export const formatYouTubeUrl = (videoId: string): string => {
  return `https://www.youtube.com/watch?v=${videoId}`;
};

/**
 * Get YouTube thumbnail URL
 */
export const getYouTubeThumbnail = (
  videoId: string,
  quality: "default" | "medium" | "high" | "maxres" = "medium"
): string => {
  const qualityMap = {
    default: "default",
    medium: "mqdefault",
    high: "hqdefault",
    maxres: "maxresdefault",
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
};

/**
 * Format duration (seconds) to readable time
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Parse formatted time (HH:MM:SS or MM:SS) to seconds
 */
export const parseTimeToSeconds = (time: string): number => {
  const parts = time.split(":").map(Number);

  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  }

  return 0;
};

/**
 * Clean transcript text (remove timestamps, extra whitespace)
 */
export const cleanTranscriptText = (text: string): string => {
  return text
    .replace(/\[\d{2}:\d{2}\]\s*/g, "") // Remove timestamps
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
};

/**
 * Generate suggested tags from transcript text
 */
export const generateSuggestedTags = (text: string, maxTags: number = 5): string[] => {
  // Simple keyword extraction (can be improved with NLP)
  const commonWords = new Set([
    "dan",
    "yang",
    "di",
    "ke",
    "dari",
    "untuk",
    "pada",
    "dengan",
    "adalah",
    "ini",
    "itu",
    "atau",
    "juga",
    "akan",
    "telah",
    "sudah",
    "dapat",
    "the",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "a",
    "an",
    "is",
    "was",
    "are",
    "were",
    "be",
    "been",
    "have",
    "has",
    "had",
  ]);

  // Extract words
  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !commonWords.has(word));

  // Count frequency
  const frequency: Record<string, number> = {};
  words.forEach((word) => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Sort by frequency and take top N
  const tags = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTags)
    .map(([word]) => word);

  return tags;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

/**
 * Estimate reading time (words per minute)
 */
export const estimateReadingTime = (text: string, wpm: number = 200): string => {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wpm);

  if (minutes < 1) return "< 1 menit";
  if (minutes === 1) return "1 menit";
  return `${minutes} menit`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Validate video ID format
 */
export const isValidVideoId = (videoId: string): boolean => {
  // YouTube video IDs are 11 characters long
  return /^[\w-]{11}$/.test(videoId);
};

/**
 * Get error message from API error
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Terjadi kesalahan tidak diketahui";
};
