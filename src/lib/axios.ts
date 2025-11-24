/**
 * Axios Configuration
 * Configured axios instances for different APIs
 *
 * UPDATED: Conditional auth header based on environment
 */

import axios, { AxiosError, type AxiosInstance } from "axios";
import { env } from "@/config/env";

/**
 * YouTube API Axios Instance
 * Configured with authentication header and base URL
 *
 * Development: No auth header (localhost:8001)
 * Production: With auth header (kajian-note-api.derrylab.com)
 */
export const youtubeAPI: AxiosInstance = axios.create({
  baseURL: env.youtube.apiUrl,
  timeout: 60000, // 60 seconds for AI summary processing
  headers: {
    "Content-Type": "application/json",
    // Only add Authorization header if apiHeaderKey is present (production)
    ...(env.youtube.apiHeaderKey && { Authorization: env.youtube.apiHeaderKey }),
  },
});

/**
 * YouTube API Request Interceptor
 * Logs requests in development mode
 */
youtubeAPI.interceptors.request.use(
  (config) => {
    if (env.app.env === "development") {
      console.log(`[YouTube API Request] ${config.method?.toUpperCase()} ${config.url}`);
      console.log(`[YouTube API] Auth Header: ${config.headers.Authorization ? "✓ Present" : "✗ Not Set"}`);
    }
    return config;
  },
  (error) => {
    console.error("[YouTube API Request Error]", error);
    return Promise.reject(error);
  }
);

/**
 * YouTube API Response Interceptor
 * Handles errors and logs responses
 */
youtubeAPI.interceptors.response.use(
  (response) => {
    if (env.app.env === "development") {
      console.log(
        `[YouTube API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
        response.data
      );
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle specific error cases
    if (error.response) {
      const status = error.response.status;
      const message = (error.response.data as any)?.detail || error.message;

      // Log error in development
      if (env.app.env === "development") {
        console.error(`[YouTube API Error ${status}]`, message);
      }

      // Handle authentication errors
      if (status === 401 || status === 403) {
        console.error("[YouTube API] Authentication failed. Check API header key.");
        return Promise.reject(new Error("Autentikasi gagal. Periksa konfigurasi API key."));
      }

      // Handle not found
      if (status === 404) {
        return Promise.reject(new Error("Video tidak ditemukan atau transcript tidak tersedia."));
      }

      // Handle rate limiting
      if (status === 429) {
        return Promise.reject(new Error("Terlalu banyak permintaan. Silakan coba lagi nanti."));
      }

      // Handle server errors
      if (status >= 500) {
        return Promise.reject(new Error("Server error. Silakan coba lagi nanti."));
      }

      return Promise.reject(new Error(message));
    }

    // Network error
    if (error.request) {
      console.error("[YouTube API] Network error - no response received");
      return Promise.reject(new Error("Tidak dapat terhubung ke server. Periksa koneksi internet Anda."));
    }

    // Other errors
    return Promise.reject(error);
  }
);

/**
 * Default export for backward compatibility
 */
export default axios;
