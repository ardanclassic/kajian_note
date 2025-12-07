/**
 * PDF Generator Utility
 * Generate PDF from HTML using API2PDF (Headless Chrome)
 * 🔥 FIXED: Handle both base64 AND URL response from API2PDF
 */

import { env } from "@/config/env";
import type { Note } from "@/types/notes.types";
import printCSS from "@/styles/print.css?raw";

/**
 * API2PDF Response
 */
interface API2PDFResponse {
  success: boolean;
  pdf: string; // Can be base64 OR URL to PDF
  mbIn: number;
  mbOut: number;
  cost: number;
  responseId: string;
}

/**
 * API2PDF Error Response
 */
interface API2PDFError {
  error: string;
  errorDetails?: string;
}

/**
 * PDF Generation Options
 */
export interface PDFGenerationOptions {
  format?: "A4" | "Letter";
  orientation?: "portrait" | "landscape";
  margin?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  printBackground?: boolean;
}

/**
 * Default PDF options (matching print.css)
 */
const defaultPDFOptions: PDFGenerationOptions = {
  format: "A4",
  orientation: "portrait",
  margin: {
    top: "17mm",
    right: "8mm",
    bottom: "15mm",
    left: "8mm",
  },
  printBackground: true,
};

/**
 * 🔥 NEW: Check if string is URL
 */
function isUrl(str: string): boolean {
  return str.startsWith("http://") || str.startsWith("https://");
}

/**
 * 🔥 NEW: Fetch PDF from URL and convert to Blob
 */
async function fetchPdfFromUrl(url: string): Promise<Blob> {
  console.log("[PDF Generator] Fetching PDF from URL:", url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch PDF from URL: ${response.statusText}`);
  }

  const blob = await response.blob();

  console.log("[PDF Generator] PDF fetched from URL:", {
    size: `${(blob.size / 1024 / 1024).toFixed(2)} MB`,
    type: blob.type,
  });

  return blob;
}

/**
 * ✅ FIX: Safely decode base64 to Blob (handles data URL prefix)
 * Only used if API2PDF returns base64 instead of URL
 */
function base64ToBlob(base64Data: string, contentType: string = "application/pdf"): Blob {
  // Step 1: Remove data URL prefix if exists
  const base64Clean = base64Data.replace(/^data:[^;]+;base64,/, "");

  // Step 2: Decode base64 to binary string
  const binaryString = atob(base64Clean);

  // Step 3: Convert binary string to Uint8Array
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Step 4: Create and return Blob
  return new Blob([bytes], { type: contentType });
}

/**
 * Check if API2PDF is configured
 */
export const isAPI2PDFConfigured = (): boolean => {
  return env.pdf.api2pdfKey !== "";
};

/**
 * Extract clean HTML content from note
 * Wraps content with proper HTML structure and print CSS
 */
function prepareHTMLForPDF(note: Note): string {
  // Format dates
  const createdDate = new Date(note.createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Check if from YouTube
  const isFromYouTube = note.sourceType === "youtube" && note.sourceUrl;

  // Build metadata
  let metadataHTML = `
    <div class="print:flex print:flex-col print:gap-2 print:text-[14pt] print:text-gray-600" style="margin-bottom: 20px; color: #666; font-size: 14pt;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-weight: 500;">📅</span>
        <span>${createdDate}</span>
      </div>
  `;

  if (isFromYouTube && note.sourceUrl) {
    metadataHTML += `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-weight: 500;">🎥</span>
        <span style="font-size: 13pt;">
          <a href="${note.sourceUrl}" target="_blank" style="color: #3b82f6;">${note.sourceUrl}</a>
        </span>
      </div>
    `;
  }

  metadataHTML += `</div>`;

  // Build tags HTML
  let tagsHTML = "";
  if (note.tags.length > 0) {
    tagsHTML = `
      <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 12pt; margin-bottom: 24pt;">
        ${note.tags
          .map(
            (tag) => `
          <span style="display: inline-block; padding: 4pt 12pt; background: #f3f4f6; color: #374151; border: 1pt solid #d1d5db; border-radius: 999px; font-size: 10pt;">
            #${tag}
          </span>
        `
          )
          .join("")}
      </div>
    `;
  }

  // Complete HTML structure
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${note.title}</title>
  <style>
    /* Inline print CSS */
    ${printCSS}
    
    /* Additional PDF-specific styles */
    body {
      margin: 0;
      padding: 0;
    }
    
    .printable-content {
      margin-top: 17mm !important;
      padding: 0 !important;
    }
  </style>
</head>
<body>
  <div class="printable-content">
    <!-- Title -->
    <h1 style="font-size: 36pt; font-weight: bold; color: #000; margin-bottom: 16pt; line-height: 1.3;">
      ${note.title}
    </h1>
    
    <!-- Metadata -->
    ${metadataHTML}
    
    <!-- Tags -->
    ${tagsHTML}
    
    <!-- Content -->
    <div class="prose-editor">
      <div class="ProseMirror">
        ${note.content}
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate PDF from Note using API2PDF
 *
 * @param note - Note to convert to PDF
 * @param options - PDF generation options
 * @returns PDF as Blob
 */
export async function generatePDFFromNote(note: Note, options: PDFGenerationOptions = {}): Promise<Blob> {
  if (!isAPI2PDFConfigured()) {
    throw new Error("API2PDF is not configured. Please check your API key.");
  }

  const finalOptions = { ...defaultPDFOptions, ...options };

  try {
    // Prepare HTML
    const html = prepareHTMLForPDF(note);

    console.log("[PDF Generator] Calling API2PDF...");

    // Call API2PDF
    const response = await fetch("https://v2.api2pdf.com/chrome/html", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: env.pdf.api2pdfKey,
      },
      body: JSON.stringify({
        html: html,
        inlinePdf: true, // Request base64, but API2PDF might return URL anyway
        options: {
          displayHeaderFooter: false,
          printBackground: finalOptions.printBackground,
          format: finalOptions.format,
          landscape: finalOptions.orientation === "landscape",
          margin: finalOptions.margin,
        },
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as API2PDFError;
      throw new Error(errorData.error || "Failed to generate PDF via API2PDF");
    }

    const data = (await response.json()) as API2PDFResponse;

    if (!data.success || !data.pdf) {
      throw new Error("API2PDF returned unsuccessful response");
    }

    // 🔥 DEBUG: Log what we received
    console.log("[PDF Generator] API2PDF response:", {
      success: data.success,
      pdfLength: data.pdf?.length,
      pdfPrefix: data.pdf?.substring(0, 50),
      hasPdfField: !!data.pdf,
      isUrl: isUrl(data.pdf),
    });

    let blob: Blob;

    // 🔥 CRITICAL FIX: Check if response is URL or base64
    if (isUrl(data.pdf)) {
      // Response is URL - fetch the PDF
      console.log("[PDF Generator] PDF is URL, fetching from:", data.pdf);
      blob = await fetchPdfFromUrl(data.pdf);
    } else {
      // Response is base64 - decode it
      console.log("[PDF Generator] PDF is base64, converting to Blob...");
      blob = base64ToBlob(data.pdf, "application/pdf");
    }

    if (env.app.env === "development") {
      console.log("[PDF Generator] PDF generated successfully:", {
        noteId: note.id,
        size: `${(blob.size / 1024 / 1024).toFixed(2)} MB`,
        cost: data.cost,
      });
    }

    return blob;
  } catch (error) {
    console.error("[PDF Generator] Failed to generate PDF:", error);
    throw error instanceof Error ? error : new Error("Unknown error occurred while generating PDF");
  }
}

/**
 * Generate filename for PDF
 *
 * @param note - Note object
 * @returns Sanitized filename
 */
export function generatePDFFileName(note: Note): string {
  // Sanitize title
  const sanitized = note.title
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .substring(0, 50);

  const timestamp = new Date().toISOString().split("T")[0];

  return `${sanitized}-${timestamp}.pdf`;
}

/**
 * Estimate PDF generation time based on content length
 *
 * @param note - Note object
 * @returns Estimated time in seconds
 */
export function estimatePDFGenerationTime(note: Note): number {
  const contentLength = note.content.length;

  // Base time: 2 seconds
  // Add 0.5 seconds per 1000 characters
  const baseTime = 2;
  const additionalTime = Math.ceil(contentLength / 1000) * 0.5;

  return Math.min(baseTime + additionalTime, 10); // Max 10 seconds
}
