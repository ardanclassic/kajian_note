/**
 * ImageKit Delete Helper
 * Functions for deleting and managing files in ImageKit
 */

import { env } from "@/config/env";

/**
 * ImageKit File Object
 */
export interface ImageKitFile {
  fileId: string;
  name: string;
  filePath: string;
  url: string;
  thumbnailUrl: string;
  height: number;
  width: number;
  size: number;
  fileType: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  customMetadata?: Record<string, any>;
}

/**
 * ImageKit List Response
 */
export interface ImageKitListResponse {
  files: ImageKitFile[];
  hasMore: boolean;
}

/**
 * ImageKit Delete Response
 */
export interface ImageKitDeleteResponse {
  message: string;
  fileId?: string;
}

/**
 * ImageKit API Configuration
 */
const imagekitConfig = {
  privateKey: env.imagekit.privateKey,
  baseUrl: "https://api.imagekit.io/v1",
};

/**
 * Safe base64 encode (handles special characters)
 */
function safeBase64Encode(str: string): string {
  try {
    return btoa(str);
  } catch (e) {
    return btoa(unescape(encodeURIComponent(str)));
  }
}

/**
 * Get ImageKit Authorization header
 */
function getAuthHeader(): string {
  return "Basic " + safeBase64Encode(`${imagekitConfig.privateKey}:`);
}

/**
 * Check if ImageKit is configured
 */
export function isImageKitConfigured(): boolean {
  return !!imagekitConfig.privateKey;
}

/**
 * Delete a single file from ImageKit
 *
 * @param fileId - ImageKit file ID
 * @returns Delete response
 */
export async function deleteFileFromImageKit(fileId: string): Promise<ImageKitDeleteResponse> {
  if (!isImageKitConfigured()) {
    throw new Error("ImageKit is not configured");
  }

  try {
    console.log(`[ImageKit Delete] Deleting file: ${fileId}`);

    const response = await fetch(`${imagekitConfig.baseUrl}/files/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to delete file: ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`[ImageKit Delete] ✅ File deleted: ${fileId}`);

    return {
      message: data.message || "File deleted successfully",
      fileId,
    };
  } catch (error) {
    console.error(`[ImageKit Delete] ❌ Error deleting file ${fileId}:`, error);
    throw error instanceof Error ? error : new Error("Unknown error occurred while deleting file");
  }
}

/**
 * Delete multiple files from ImageKit (batch delete)
 *
 * @param fileIds - Array of ImageKit file IDs
 * @returns Number of files deleted
 */
export async function deleteMultipleFiles(fileIds: string[]): Promise<number> {
  if (!isImageKitConfigured()) {
    throw new Error("ImageKit is not configured");
  }

  if (fileIds.length === 0) {
    return 0;
  }

  try {
    console.log(`[ImageKit Delete] Batch deleting ${fileIds.length} files...`);

    const response = await fetch(`${imagekitConfig.baseUrl}/files/batch/delete`, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileIds: fileIds,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to batch delete: ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`[ImageKit Delete] ✅ Batch deleted:`, data);

    // ImageKit returns array of successfully deleted file IDs
    return data.successfullyDeletedFileIds?.length || fileIds.length;
  } catch (error) {
    console.error(`[ImageKit Delete] ❌ Error batch deleting:`, error);
    throw error instanceof Error ? error : new Error("Unknown error occurred while batch deleting files");
  }
}

/**
 * List files in a specific folder
 *
 * @param folder - Folder path (e.g., "temp-pdfs")
 * @param limit - Maximum number of files to return (default: 1000)
 * @param skip - Number of files to skip (for pagination)
 * @returns List of files
 */
export async function listFilesInFolder(
  folder: string,
  limit: number = 1000,
  skip: number = 0
): Promise<ImageKitFile[]> {
  if (!isImageKitConfigured()) {
    throw new Error("ImageKit is not configured");
  }

  try {
    console.log(`[ImageKit List] Listing files in folder: ${folder}`);

    // Build query parameters
    const params = new URLSearchParams({
      path: folder,
      limit: limit.toString(),
      skip: skip.toString(),
    });

    const response = await fetch(`${imagekitConfig.baseUrl}/files?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to list files: ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`[ImageKit List] ✅ Found ${data.length} files in ${folder}`);

    return data as ImageKitFile[];
  } catch (error) {
    console.error(`[ImageKit List] ❌ Error listing files:`, error);
    throw error instanceof Error ? error : new Error("Unknown error occurred while listing files");
  }
}

/**
 * Get details of a specific file
 *
 * @param fileId - ImageKit file ID
 * @returns File details
 */
export async function getFileDetails(fileId: string): Promise<ImageKitFile> {
  if (!isImageKitConfigured()) {
    throw new Error("ImageKit is not configured");
  }

  try {
    console.log(`[ImageKit Details] Getting details for: ${fileId}`);

    const response = await fetch(`${imagekitConfig.baseUrl}/files/${fileId}/details`, {
      method: "GET",
      headers: {
        Authorization: getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to get file details: ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`[ImageKit Details] ✅ File details:`, data);

    return data as ImageKitFile;
  } catch (error) {
    console.error(`[ImageKit Details] ❌ Error getting file details:`, error);
    throw error instanceof Error ? error : new Error("Unknown error occurred while getting file details");
  }
}

/**
 * Get files older than specified hours
 *
 * @param folder - Folder path
 * @param hours - Hours threshold (e.g., 1 for files older than 1 hour)
 * @returns Array of old files
 */
export async function getOldFiles(folder: string, hours: number = 1): Promise<ImageKitFile[]> {
  const files = await listFilesInFolder(folder);
  const now = Date.now();
  const threshold = now - hours * 60 * 60 * 1000;

  return files.filter((file) => {
    const createdAt = new Date(file.createdAt).getTime();
    return createdAt < threshold;
  });
}

/**
 * Cleanup old files in folder
 * Deletes files older than specified hours
 *
 * @param folder - Folder path (e.g., "temp-pdfs")
 * @param hours - Delete files older than this (default: 1 hour)
 * @returns Number of files deleted
 */
export async function cleanupOldFiles(folder: string, hours: number = 1): Promise<number> {
  try {
    console.log(`[ImageKit Cleanup] Starting cleanup for folder: ${folder}`);
    console.log(`[ImageKit Cleanup] Threshold: ${hours} hour(s)`);

    // Get old files
    const oldFiles = await getOldFiles(folder, hours);

    if (oldFiles.length === 0) {
      console.log(`[ImageKit Cleanup] ✅ No old files found`);
      return 0;
    }

    console.log(`[ImageKit Cleanup] Found ${oldFiles.length} old files to delete`);

    // Batch delete
    const fileIds = oldFiles.map((f) => f.fileId);
    const deletedCount = await deleteMultipleFiles(fileIds);

    console.log(`[ImageKit Cleanup] ✅ Deleted ${deletedCount} files`);

    return deletedCount;
  } catch (error) {
    console.error(`[ImageKit Cleanup] ❌ Error during cleanup:`, error);
    throw error instanceof Error ? error : new Error("Unknown error occurred during cleanup");
  }
}

/**
 * Format file size to human readable
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = Date.now();
  const diff = now - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}
