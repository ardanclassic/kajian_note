/**
 * WhatsApp Helper Utility
 * Generate wa.me links for sharing PDFs via WhatsApp
 */

import type { Note } from "@/types/notes.types";

/**
 * WhatsApp Link Options
 */
export interface WhatsAppLinkOptions {
  phone: string;
  pdfUrl: string;
  noteTitle: string;
  noteId?: string;
}

/**
 * Format phone number for WhatsApp
 * Converts various formats to international format without + or spaces
 *
 * @param phone - Phone number in any format
 * @returns Formatted phone number (e.g., 628123456789)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, "");

  // Handle Indonesian numbers
  if (cleaned.startsWith("0")) {
    // 08xxx -> 628xxx
    cleaned = "62" + cleaned.substring(1);
  } else if (cleaned.startsWith("8")) {
    // 8xxx -> 628xxx
    cleaned = "62" + cleaned;
  } else if (cleaned.startsWith("+62")) {
    // +62xxx -> 62xxx
    cleaned = cleaned.substring(1);
  } else if (!cleaned.startsWith("62")) {
    // If not starting with 62, assume Indonesian
    cleaned = "62" + cleaned;
  }

  return cleaned;
}

/**
 * Generate WhatsApp message text
 *
 * @param noteTitle - Title of the note
 * @param pdfUrl - URL to the PDF file
 * @param noteId - Optional note ID for reference
 * @returns Formatted message text
 */
export function generateWhatsAppMessage(noteTitle: string, pdfUrl: string, noteId?: string): string {
  const lines: string[] = [];

  // Header
  lines.push("📚 *Catatan Kajian*");
  lines.push("");

  // Note title
  lines.push(`*${noteTitle}*`);
  lines.push("");

  // Download link
  lines.push("📄 Download PDF:");
  lines.push(pdfUrl);
  lines.push("");

  // Footer
  lines.push("_Link akan kedaluwarsa dalam 1 jam_");
  lines.push("");
  lines.push("━━━━━━━━━━━━━━━");
  lines.push("by Kajian Note");

  if (noteId) {
    lines.push(`ID: ${noteId}`);
  }

  return lines.join("\n");
}

/**
 * Generate wa.me link
 *
 * @param options - WhatsApp link options
 * @returns Complete wa.me URL
 */
export function generateWhatsAppLink(options: WhatsAppLinkOptions): string {
  const { phone, pdfUrl, noteTitle, noteId } = options;

  // Format phone number
  const formattedPhone = formatPhoneForWhatsApp(phone);

  // Generate message
  const message = generateWhatsAppMessage(noteTitle, pdfUrl, noteId);

  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);

  // Build wa.me link
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

/**
 * Open WhatsApp link in new tab
 *
 * @param link - wa.me URL
 */
export function openWhatsAppLink(link: string): void {
  window.open(link, "_blank", "noopener,noreferrer");
}

/**
 * Validate phone number
 *
 * @param phone - Phone number to validate
 * @returns True if valid
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone || phone.trim() === "") {
    return false;
  }

  // Remove all non-numeric characters for validation
  const cleaned = phone.replace(/\D/g, "");

  // Indonesian phone numbers: 10-13 digits after country code
  // Minimum: 628xxxxxxxx (11 digits)
  // Maximum: 628xxxxxxxxxxxx (15 digits)
  if (cleaned.length < 10 || cleaned.length > 15) {
    return false;
  }

  // Must start with valid prefix
  const validPrefixes = ["62", "0", "8", "+62"];
  const hasValidPrefix = validPrefixes.some((prefix) => phone.trim().startsWith(prefix));

  return hasValidPrefix;
}

/**
 * Get WhatsApp share URL with pre-filled message
 * (Alternative method using wa.me without phone number)
 *
 * @param noteTitle - Note title
 * @param pdfUrl - PDF URL
 * @returns WhatsApp share URL
 */
export function getWhatsAppShareLink(noteTitle: string, pdfUrl: string): string {
  const message = generateWhatsAppMessage(noteTitle, pdfUrl);
  const encodedMessage = encodeURIComponent(message);

  // This opens WhatsApp with pre-filled message
  // User can choose recipient
  return `https://wa.me/?text=${encodedMessage}`;
}

/**
 * Generate shareable message for note (without PDF)
 * Useful for sharing note links
 *
 * @param note - Note object
 * @param noteUrl - URL to the note page
 * @returns Formatted message
 */
export function generateNoteShareMessage(note: Note, noteUrl: string): string {
  const lines: string[] = [];

  lines.push("📚 *Catatan Kajian*");
  lines.push("");
  lines.push(`*${note.title}*`);
  lines.push("");

  if (note.tags.length > 0) {
    lines.push(`Tags: ${note.tags.map((t) => `#${t}`).join(", ")}`);
    lines.push("");
  }

  lines.push("🔗 Lihat catatan:");
  lines.push(noteUrl);
  lines.push("");
  lines.push("━━━━━━━━━━━━━━━");
  lines.push("by Kajian Note");

  return lines.join("\n");
}

/**
 * Format expiry time (1 hour from now)
 *
 * @returns Human-readable expiry time
 */
export function getExpiryTimeText(): string {
  const expiryDate = new Date(Date.now() + 3600000); // +1 hour
  return expiryDate.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
