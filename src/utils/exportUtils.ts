/**
 * Export Utilities
 * Functions for exporting notes to PDF (native print) and Markdown formats
 */

import TurndownService from "turndown";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  sourceType?: string;
  sourceUrl?: string | null | undefined;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

/**
 * Export note to PDF using native browser print
 * This creates a vector PDF with selectable/searchable text
 * Mobile-optimized for reading on smartphones
 */
export async function exportNoteToPDF(note: Note): Promise<void> {
  // Save original title
  const originalTitle = document.title;

  // Set document title for PDF filename
  const sanitizedTitle = note.title.replace(/[^a-z0-9]/gi, "-");
  // const timestamp = format(new Date(), "yyyyMMdd");
  document.title = `${sanitizedTitle}`;

  // Trigger native print dialog
  // User will save as PDF from the print dialog
  window.print();

  // Restore original title after print dialog closes
  // Use setTimeout to ensure it runs after print dialog
  setTimeout(() => {
    document.title = originalTitle;
  }, 100);
}

/**
 * Export note to Markdown
 * Converts HTML content to markdown format
 */
export function exportNoteToMarkdown(note: Note): void {
  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  });

  // Convert HTML to Markdown
  const markdown = turndownService.turndown(note.content);

  // Build full markdown content
  let fullContent = `# ${note.title}\n\n`;

  // Add metadata
  fullContent += `**Dibuat:** ${format(new Date(note.createdAt), "dd MMMM yyyy, HH:mm", { locale: idLocale })}\n`;
  fullContent += `**Diperbarui:** ${format(new Date(note.updatedAt), "dd MMMM yyyy, HH:mm", { locale: idLocale })}\n`;

  if (note.tags.length > 0) {
    fullContent += `**Tags:** ${note.tags.map((t) => `#${t}`).join(", ")}\n`;
  }

  if (note.sourceType === "youtube" && note.sourceUrl) {
    fullContent += `**Sumber:** [YouTube](${note.sourceUrl})\n`;
  }

  fullContent += `\n---\n\n`;
  fullContent += markdown;

  // Create blob and download
  const blob = new Blob([fullContent], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${note.title.replace(/[^a-z0-9]/gi, "-")}-${format(new Date(), "yyyyMMdd")}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Convert markdown syntax to HTML
 * Supports: **bold**, *italic*, [link](url), etc
 */
export const convertMarkdownToHtml = (text: string): string => {
  let html = text;

  // Bold: **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");

  // Italic: *text* or _text_
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");

  // Strikethrough: ~~text~~
  html = html.replace(/~~(.+?)~~/g, "<s>$1</s>");

  // Links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Line breaks
  html = html.replace(/\n/g, "<br>");

  return html;
};
