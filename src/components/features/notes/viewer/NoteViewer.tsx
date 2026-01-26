/**
 * NoteViewer Component - PRINT OPTIMIZED
 * Read-only note display with HTML & Markdown support
 * Optimized for native print/PDF export
 */

import { useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Tag as TagIcon, Mic } from "lucide-react";
import type { Note } from "@/types/notes.types";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { convertMarkdownToHtml } from "@/utils/exportUtils";

interface NoteViewerProps {
  note: Note;
  showMetadata?: boolean;
  showAuthor?: boolean;
  authorName?: string;
  authorUsername?: string;
}

/**
 * Detect if content is HTML (from Tiptap) or plain text/markdown
 */
const isHtmlContent = (content: string): boolean => {
  // Check if content has HTML tags (excluding simple br tags from markdown conversion)
  const htmlTagPattern = /<(?!br\s*\/?>)[^>]+>/;
  return htmlTagPattern.test(content);
};

/**
 * Sanitize HTML to prevent XSS (basic sanitization)
 * Note: Since content is user's own notes, risk is minimal
 */
const sanitizeHtml = (html: string): string => {
  // Remove script tags and event handlers
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  clean = clean.replace(/on\w+="[^"]*"/g, "");
  clean = clean.replace(/on\w+='[^']*'/g, "");
  return clean;
};

export function NoteViewer({
  note,
  showMetadata = true,
  showAuthor = false,
  authorName,
  authorUsername,
}: NoteViewerProps) {
  // Format dates
  const createdDate = format(new Date(note.createdAt), "dd MMMM yyyy, HH:mm", { locale: idLocale });

  // Derive teacher/speaker name from tags (heuristic)
  // 1. Process content FIRST: detect HTML or convert markdown
  const processedContent = useMemo(() => {
    if (!note.content) return "";

    let finalHtml = "";

    // If already HTML (from Tiptap), sanitize and use directly
    if (isHtmlContent(note.content)) {
      finalHtml = sanitizeHtml(note.content);
    } else {
      // If plain text or markdown, convert to HTML
      finalHtml = convertMarkdownToHtml(note.content);
    }

    return finalHtml;
  }, [note.content]);

  // 3. EFFECT: Detect "Sumber Referensi" in rendered DOM and force page break
  useEffect(() => {
    const timer = setTimeout(() => {
      // Target the specific container where content lives
      const contentDiv = document.querySelector('.prose-editor .ProseMirror') || document.querySelector('.prose-editor');
      if (!contentDiv) return;

      const elements = contentDiv.querySelectorAll('h1, h2, h3, h4, h5, h6, p, div');

      for (const el of elements) {
        // Check text content safely
        if (el.textContent && /Sumber Referensi/i.test(el.textContent)) {
          const element = el as HTMLElement;
          // Apply styles via style object to preserve other styles if any
          element.style.breakBefore = 'page';
          element.style.pageBreakBefore = 'always';
          element.style.marginTop = '2cm';
          element.style.display = 'block';

          // Add a marker class
          element.classList.add('pdf-ref-break');
          break;
        }
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [processedContent]);

  // 2. Derive teacher/speaker name from PROCESSED content or tags
  const teacherName = useMemo(() => {
    let name = "";

    // A. Try to extract from processed content (Visual text)
    if (processedContent) {
      // Strip HTML tags to get plain text
      const plainText = processedContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');

      // Regex to find specific keywords followed by colon and name
      // Matches: "Narasumber: Ustadz X", "Pemateri : Ustadz Y", "Oleh: Z"
      // Capture until newline or HTML tag char to avoid stopping at dots in titles
      const patterns = [
        /(?:Narasumber|Pemateri)\s*[:]\s*([^\n\r<]+)/i,
        /(?:Sumber)\s*[:]\s*([^\n\r<]+)/i
      ];

      for (const pattern of patterns) {
        const match = plainText.match(pattern);
        if (match && match[1]) {
          // Take the first part before any common punctuation that ends a name usually in this context
          // Or just take reasonable length
          let extracted = match[1].trim();

          // Cleanup: Stop at "Channel" word if present (case insensitive)
          const channelIndex = extracted.toLowerCase().indexOf('channel');
          if (channelIndex > -1) {
            extracted = extracted.substring(0, channelIndex).trim();
          }

          // Remove trailing punctuation like colons, dashes
          extracted = extracted.replace(/[:|-]+$/, '').trim();

          // Take max 50 chars to be safe
          if (extracted.length > 50) extracted = extracted.substring(0, 50);

          if (extracted.length > 2) {
            name = extracted;
            break;
          }
        }
      }
    }

    // B. Fallback to Tags if content extraction failed
    if (!name && note.tags && note.tags.length > 0) {
      const honourifics = ['ust', 'ustadz', 'syeikh', 'syaikh', 'buya', 'kyai', 'dr', 'prof'];
      const teacherTag = note.tags.find(tag =>
        honourifics.some(h => tag.toLowerCase().startsWith(h))
      );
      // Use found tag or first tag if none found
      name = teacherTag || note.tags[0];
    }

    return name || "-";
  }, [processedContent, note.tags]);

  return (
    <div className="space-y-6 print:space-y-0">
      {/* Title Section - Adaptive for Screen & Print */}
      <div className="space-y-4 print:px-0 pdf-title-page">
        {/* Main Title */}
        <h1 className="text-[32px] md:text-[36px] font-bold leading-tight print:!text-[40pt] print:!font-bold print:!text-black print:!mb-8 print:!mt-[15%]">
          {note.title}
        </h1>

        {/* Metadata Bar - Screen Version */}
        {showMetadata && (
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground no-print">
            {/* Author */}
            {showAuthor && authorName && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-500/10 rounded-full">
                <User className="w-3.5 h-3.5" />
                <span className="font-medium text-gray-300">{authorName}</span>
              </div>
            )}

            {/* Created Date */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-500/10 rounded-full">
              <Calendar className="w-3.5 h-3.5" />
              <span>{createdDate}</span>
            </div>

            {/* Tags - Screen Only (Mini version) */}
            <div className="flex gap-1">
              {note.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[10px] uppercase tracking-wider text-emerald-400/70">#{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Print Metadata - Left Aligned - SPEAKER NAME */}
        <div className="hidden print:flex flex-col gap-2 mt-8 text-[18pt] text-black">
          {teacherName && teacherName !== "-" && (
            <div className="flex items-start gap-3">
              <Mic className="w-6 h-6 mt-1 shrink-0" />
              <span className="font-bold text-black leading-snug">{teacherName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tags - Screen & Print Version */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {note.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="bg-emerald-500/5 border-emerald-500/20 text-emerald-400 print:border-black print:text-black print:font-bold"
            >
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Divider - Screen Only */}
      <div className="border-t print:hidden" />

      {/* Content Section - PRINT OPTIMIZED */}
      <Card className="border-none shadow-none bg-transparent print:!shadow-none print:!bg-transparent print:!border-none">
        <CardContent className="p-0 print:!p-0 print:!border-none">
          <div className="prose-editor pdf-content">
            <div className="ProseMirror" dangerouslySetInnerHTML={{ __html: processedContent }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


