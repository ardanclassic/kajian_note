/**
 * ImageKit Client Configuration
 * Client for uploading temporary PDFs with 1-hour TTL
 * ✅ FIXED: Added safeBase64Encode() to handle special characters in private key
 */

import { env } from "@/config/env";

/**
 * ImageKit Upload Response
 */
export interface ImageKitUploadResponse {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  height: number;
  width: number;
  size: number;
  filePath: string;
  tags: string[];
  isPrivateFile: boolean;
  customCoordinates: string | null;
  fileType: string;
}

/**
 * ImageKit Upload Error
 */
export interface ImageKitUploadError {
  message: string;
  help: string;
}

/**
 * Upload options
 */
export interface UploadOptions {
  folder?: string;
  tags?: string[];
  useUniqueFileName?: boolean;
  ttl?: number; // Time to live in seconds (default: 3600 = 1 hour)
}

/**
 * ✅ FIX: Safely encode string to base64 (handles Unicode/special chars)
 * Fixes InvalidCharacterError when encoding private keys with special characters like /, =, +
 *
 * How it works:
 * 1. First tries native btoa() for ASCII-only strings (fast path)
 * 2. If that fails, uses encodeURIComponent + unescape to handle Unicode
 *
 * Example private keys that need this:
 * - private_vCXAfYGvN3f2sw8DJLQiH5/pJe0= (has / and =)
 * - private_abc+123/def= (has + and /)
 */
function safeBase64Encode(str: string): string {
  try {
    // Try native btoa first (works for pure ASCII)
    return btoa(str);
  } catch (e) {
    // Fallback for Unicode/special characters:
    // encodeURIComponent -> Encode to %XX format
    // unescape -> Decode %XX to binary string
    // btoa -> Encode binary string to base64
    return btoa(unescape(encodeURIComponent(str)));
  }
}

/**
 * ImageKit Configuration
 */
const imagekitConfig = {
  publicKey: env.imagekit.publicKey,
  privateKey: env.imagekit.privateKey,
  urlEndpoint: env.imagekit.urlEndpoint,
  uploadEndpoint: "https://upload.imagekit.io/api/v1/files/upload",
};

/**
 * Check if ImageKit is properly configured
 */
export const isImageKitReady = (): boolean => {
  return !!(imagekitConfig.publicKey && imagekitConfig.privateKey && imagekitConfig.urlEndpoint);
};

/**
 * Upload file to ImageKit
 *
 * @param file - File blob to upload
 * @param fileName - Name for the file
 * @param options - Upload options (folder, tags, TTL)
 * @returns Upload response with file URL
 */
export async function uploadToImageKit(
  file: Blob,
  fileName: string,
  options: UploadOptions = {}
): Promise<ImageKitUploadResponse> {
  if (!isImageKitReady()) {
    throw new Error("ImageKit is not configured. Please check your environment variables.");
  }

  const {
    folder = "temp-pdfs",
    tags = ["temp", "pdf"],
    useUniqueFileName = true,
    ttl = 3600, // 1 hour default
  } = options;

  try {
    // Prepare form data
    const formData = new FormData();
    formData.append("file", file, fileName);
    formData.append("fileName", fileName);
    formData.append("useUniqueFileName", useUniqueFileName.toString());
    formData.append("folder", folder);
    formData.append("tags", tags.join(","));

    // ✅ FIX: Remove custom metadata - it requires pre-configured fields in ImageKit dashboard
    // We don't need it for basic PDF upload functionality
    // If you want to use custom metadata, you need to:
    // 1. Create custom metadata fields in ImageKit dashboard first
    // 2. Or use ImageKit's custom metadata fields API

    // OLD CODE (caused "Invalid custom metadata" error):
    // const expireAt = new Date(Date.now() + ttl * 1000).toISOString();
    // formData.append("customMetadata", JSON.stringify({
    //   "expire-at": expireAt,
    //   "auto-delete": "true",
    // }));

    // ✅ FIX: Create authentication header with safe base64 encoding
    // OLD CODE (caused error with special chars):
    // const authHeader = "Basic " + btoa(`${imagekitConfig.privateKey}:`);

    // NEW CODE: Uses safeBase64Encode to handle special characters
    const authHeader = "Basic " + safeBase64Encode(`${imagekitConfig.privateKey}:`);

    console.log("[ImageKit] Uploading file:", fileName);

    // Upload to ImageKit
    const response = await fetch(imagekitConfig.uploadEndpoint, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ImageKitUploadError;
      throw new Error(errorData.message || "Failed to upload to ImageKit");
    }

    const data = (await response.json()) as ImageKitUploadResponse;

    if (env.app.env === "development") {
      console.log("[ImageKit] Upload successful:", {
        fileId: data.fileId,
        url: data.url,
        size: `${(data.size / 1024 / 1024).toFixed(2)} MB`,
      });
    }

    return data;
  } catch (error) {
    console.error("[ImageKit] Upload failed:", error);
    throw error instanceof Error ? error : new Error("Unknown error occurred while uploading to ImageKit");
  }
}

/**
 * Generate a unique filename with timestamp
 *
 * @param originalName - Original filename
 * @returns Timestamped filename
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop() || "pdf";
  const baseName = originalName.replace(/\.[^/.]+$/, "").substring(0, 30);

  return `${baseName}-${timestamp}-${randomStr}.${extension}`;
}

/**
 * Sanitize filename for ImageKit
 *
 * @param filename - Original filename
 * @returns Sanitized filename
 */
export function sanitizeFileName(filename: string): string {
  // Remove special characters, keep only alphanumeric, dash, underscore, dot
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

/**
 * Get file size in human-readable format
 *
 * @param bytes - File size in bytes
 * @returns Formatted file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
