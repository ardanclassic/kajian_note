/**
 * Export Utilities
 * Functions for exporting notes to PDF and Markdown formats
 */

import jsPDF from "jspdf";
import * as domtoimage from "dom-to-image-more";
import TurndownService from "turndown";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  sourceType?: string;
  sourceUrl?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

/**
 * Export note to PDF
 */
export async function exportNoteToPDF(note: Note): Promise<void> {
  // Create a temporary container for rendering
  const tempContainer = document.createElement("div");
  tempContainer.style.position = "absolute";
  tempContainer.style.left = "-9999px";
  tempContainer.style.width = "210mm"; // A4 width
  tempContainer.style.padding = "20mm";
  tempContainer.style.backgroundColor = "#ffffff";
  tempContainer.style.fontFamily = "system-ui, -apple-system, sans-serif";
  tempContainer.style.fontSize = "12pt";
  tempContainer.style.lineHeight = "1.6";
  tempContainer.style.color = "#000000";

  // Build styled HTML content
  let htmlContent = `
    <div style="margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px;">
      <h1 style="font-size: 24pt; font-weight: bold; margin: 0 0 15px 0; color: #111827;">
        ${note.title}
      </h1>
      <div style="font-size: 10pt; color: #6b7280; margin-bottom: 10px;">
        <div style="margin-bottom: 5px;">
          <strong>Dibuat:</strong> ${format(new Date(note.createdAt), "dd MMMM yyyy, HH:mm", { locale: idLocale })}
        </div>
        <div style="margin-bottom: 5px;">
          <strong>Diperbarui:</strong> ${format(new Date(note.updatedAt), "dd MMMM yyyy, HH:mm", { locale: idLocale })}
        </div>
  `;

  if (note.tags.length > 0) {
    htmlContent += `
        <div style="margin-bottom: 5px;">
          <strong>Tags:</strong> ${note.tags.map((t) => `#${t}`).join(", ")}
        </div>
    `;
  }

  if (note.sourceType === "youtube" && note.sourceUrl) {
    htmlContent += `
        <div>
          <strong>Sumber:</strong> ${note.sourceUrl}
        </div>
    `;
  }

  htmlContent += `
      </div>
    </div>
    <div style="font-size: 11pt; line-height: 1.8;">
      ${note.content}
    </div>
  `;

  // Add CSS styles for better formatting
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    h1, h2, h3, h4, h5, h6 {
      margin: 20px 0 10px 0;
      font-weight: bold;
      color: #111827;
    }
    h1 { font-size: 20pt; }
    h2 { font-size: 18pt; }
    h3 { font-size: 16pt; }
    h4 { font-size: 14pt; }
    p { margin: 10px 0; }
    ul, ol { margin: 10px 0; padding-left: 25px; }
    li { margin: 5px 0; }
    blockquote {
      border-left: 4px solid #e5e7eb;
      padding-left: 15px;
      margin: 15px 0;
      color: #6b7280;
      font-style: italic;
    }
    code {
      background-color: #f3f4f6;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
      font-size: 10pt;
    }
    pre {
      background-color: #f3f4f6;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      margin: 15px 0;
    }
    pre code {
      background-color: transparent;
      padding: 0;
    }
    strong { font-weight: 600; }
    em { font-style: italic; }
    a { color: #2563eb; text-decoration: underline; }
  `;

  tempContainer.appendChild(styleElement);
  tempContainer.innerHTML += htmlContent;
  document.body.appendChild(tempContainer);

  // Wait a bit for styles to apply
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Capture with dom-to-image-more
  const dataUrl = await domtoimage.toPng(tempContainer, {
    quality: 0.95,
    bgcolor: "#ffffff",
    width: tempContainer.scrollWidth,
    height: tempContainer.scrollHeight,
  });

  // Remove temporary container
  document.body.removeChild(tempContainer);

  // Create image to get dimensions
  const img = new Image();
  img.src = dataUrl;

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const imgWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const imgHeight = (img.height * imgWidth) / img.width;
  let heightLeft = imgHeight;
  let position = 0;

  // Add first page
  pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  // Add additional pages if needed
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  // Generate filename
  const filename = `${note.title.replace(/[^a-z0-9]/gi, "-")}-${format(new Date(), "yyyyMMdd")}.pdf`;
  pdf.save(filename);
}

/**
 * Export note to Markdown
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
