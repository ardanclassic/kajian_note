/**
 * ImageKit Storage Service
 * High-level service for managing temporary PDF uploads to ImageKit
 * ✅ UPDATED: Now tracks uploads in database for auto-cleanup
 */

import {
  uploadToImageKit,
  generateUniqueFileName,
  sanitizeFileName,
  type ImageKitUploadResponse,
} from "@/lib/imagekit";
import { generatePDFFromNote, generatePDFFileName } from "@/utils/pdfGenerator";
import { supabase } from "@/lib/supabase";
import type { Note } from "@/types/notes.types";

/**
 * PDF Upload Result
 */
export interface PDFUploadResult {
  success: boolean;
  url: string;
  fileId: string;
  fileName: string;
  size: number;
  expiresAt: string;
  error?: string;
}

/**
 * Upload options for PDF
 */
export interface PDFUploadOptions {
  ttl?: number; // Time to live in seconds (default: 3600 = 1 hour)
  folder?: string;
  tags?: string[];
}

/**
 * ✅ NEW: Insert tracking record to database
 */
async function insertTrackingRecord(
  uploadResponse: ImageKitUploadResponse,
  note: Note,
  options: PDFUploadOptions,
  expiresAt: string
): Promise<void> {
  try {
    // Get current user ID
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.warn("[ImageKit Storage] No user found, skipping database tracking");
      return;
    }

    // Insert tracking record
    const { error } = await supabase.from("imagekit_temp_uploads").insert({
      file_id: uploadResponse.fileId,
      file_url: uploadResponse.url,
      file_name: uploadResponse.name,
      file_size: uploadResponse.size,
      folder: options.folder || "temp-pdfs",
      expires_at: expiresAt,
      note_id: note.id,
      user_id: user.id,
    });

    if (error) {
      // Don't throw error - tracking is optional
      // File upload was successful, so we still return success to user
      console.error("[ImageKit Storage] Failed to insert tracking record:", error);
      console.warn("[ImageKit Storage] File uploaded but not tracked in database");
    } else {
      console.log("[ImageKit Storage] ✅ Database tracking record created");
    }
  } catch (error) {
    // Don't throw - tracking failure shouldn't fail the entire upload
    console.error("[ImageKit Storage] Error inserting tracking record:", error);
  }
}

/**
 * Upload note as PDF to ImageKit
 * Complete flow: Generate PDF → Upload to ImageKit → Track in DB → Return URL
 *
 * @param note - Note to convert and upload
 * @param options - Upload options
 * @returns Upload result with URL
 */
export async function uploadNotePDFToImageKit(note: Note, options: PDFUploadOptions = {}): Promise<PDFUploadResult> {
  const startTime = Date.now();

  try {
    // Step 1: Generate PDF from note
    console.log(`[ImageKit Storage] Generating PDF for note: ${note.id}`);
    const pdfBlob = await generatePDFFromNote(note);

    // Step 2: Generate filename
    const originalFileName = generatePDFFileName(note);
    const sanitizedFileName = sanitizeFileName(originalFileName);
    const uniqueFileName = generateUniqueFileName(sanitizedFileName);

    console.log(`[ImageKit Storage] Uploading PDF: ${uniqueFileName} (${(pdfBlob.size / 1024 / 1024).toFixed(2)} MB)`);

    // Step 3: Upload to ImageKit
    const uploadResponse = await uploadToImageKit(pdfBlob, uniqueFileName, {
      folder: options.folder || "temp-pdfs",
      tags: options.tags || ["temp", "pdf", "kajian-note"],
      useUniqueFileName: false, // Already unique
      ttl: options.ttl || 3600, // 1 hour default
    });

    // Step 4: Calculate expiry time
    const expiresAt = new Date(Date.now() + (options.ttl || 3600) * 1000).toISOString();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[ImageKit Storage] Upload successful in ${duration}s:`, {
      fileId: uploadResponse.fileId,
      url: uploadResponse.url,
      expiresAt,
    });

    // ✅ Step 5: NEW - Insert tracking record to database
    await insertTrackingRecord(uploadResponse, note, options, expiresAt);

    return {
      success: true,
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      fileName: uploadResponse.name,
      size: uploadResponse.size,
      expiresAt,
    };
  } catch (error) {
    console.error("[ImageKit Storage] Upload failed:", error);

    return {
      success: false,
      url: "",
      fileId: "",
      fileName: "",
      size: 0,
      expiresAt: "",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Upload existing PDF blob to ImageKit
 * Use this when PDF is already generated
 *
 * @param pdfBlob - PDF blob
 * @param fileName - File name
 * @param options - Upload options
 * @returns Upload result with URL
 */
export async function uploadPDFBlobToImageKit(
  pdfBlob: Blob,
  fileName: string,
  options: PDFUploadOptions = {}
): Promise<PDFUploadResult> {
  try {
    // Sanitize and make unique
    const sanitizedFileName = sanitizeFileName(fileName);
    const uniqueFileName = generateUniqueFileName(sanitizedFileName);

    console.log(`[ImageKit Storage] Uploading PDF blob: ${uniqueFileName}`);

    // Upload to ImageKit
    const uploadResponse = await uploadToImageKit(pdfBlob, uniqueFileName, {
      folder: options.folder || "temp-pdfs",
      tags: options.tags || ["temp", "pdf"],
      useUniqueFileName: false,
      ttl: options.ttl || 3600,
    });

    const expiresAt = new Date(Date.now() + (options.ttl || 3600) * 1000).toISOString();

    // ✅ NEW: Track in database (but we don't have note reference here)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("imagekit_temp_uploads").insert({
          file_id: uploadResponse.fileId,
          file_url: uploadResponse.url,
          file_name: uploadResponse.name,
          file_size: uploadResponse.size,
          folder: options.folder || "temp-pdfs",
          expires_at: expiresAt,
          note_id: null, // No note reference for blob uploads
          user_id: user.id,
        });
        console.log("[ImageKit Storage] ✅ Database tracking record created");
      }
    } catch (dbError) {
      console.error("[ImageKit Storage] Failed to track blob upload:", dbError);
    }

    return {
      success: true,
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      fileName: uploadResponse.name,
      size: uploadResponse.size,
      expiresAt,
    };
  } catch (error) {
    console.error("[ImageKit Storage] Upload failed:", error);

    return {
      success: false,
      url: "",
      fileId: "",
      fileName: "",
      size: 0,
      expiresAt: "",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Validate upload result
 *
 * @param result - Upload result to validate
 * @returns True if valid
 */
export function isValidUploadResult(result: PDFUploadResult): boolean {
  return result.success && result.url !== "" && result.fileId !== "";
}

/**
 * Get expiry time in human-readable format
 *
 * @param expiresAt - ISO date string
 * @returns Formatted time (e.g., "14:30 WIB")
 */
export function formatExpiryTime(expiresAt: string): string {
  const date = new Date(expiresAt);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

/**
 * Calculate remaining time until expiry
 *
 * @param expiresAt - ISO date string
 * @returns Remaining time in minutes
 */
export function getRemainingMinutes(expiresAt: string): number {
  const now = Date.now();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;
  return Math.max(0, Math.ceil(diff / 60000)); // Convert to minutes
}

/**
 * Check if upload is expired
 *
 * @param expiresAt - ISO date string
 * @returns True if expired
 */
export function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

/**
 * Retry upload with exponential backoff
 *
 * @param note - Note to upload
 * @param options - Upload options
 * @param maxRetries - Maximum retry attempts (default: 1)
 * @returns Upload result
 */
export async function uploadNotePDFWithRetry(
  note: Note,
  options: PDFUploadOptions = {},
  maxRetries: number = 1
): Promise<PDFUploadResult> {
  let lastError: Error | null = null;
  let retryDelay = 1000; // Start with 1 second

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[ImageKit Storage] Upload attempt ${attempt}/${maxRetries}`);
      const result = await uploadNotePDFToImageKit(note, options);

      if (result.success) {
        if (attempt > 1) {
          console.log(`[ImageKit Storage] Upload succeeded on retry ${attempt}`);
        }
        return result;
      }

      throw new Error(result.error || "Upload failed");
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");
      console.warn(`[ImageKit Storage] Attempt ${attempt} failed:`, lastError.message);

      // Don't retry on last attempt
      if (attempt < maxRetries) {
        console.log(`[ImageKit Storage] Retrying in ${retryDelay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        retryDelay *= 2; // Exponential backoff
      }
    }
  }

  // All retries failed
  console.error(`[ImageKit Storage] All ${maxRetries} attempts failed`);
  return {
    success: false,
    url: "",
    fileId: "",
    fileName: "",
    size: 0,
    expiresAt: "",
    error: lastError?.message || "Upload failed after multiple retries",
  };
}
