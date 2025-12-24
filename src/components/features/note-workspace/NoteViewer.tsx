/**
 * NoteViewer Component - PRINT OPTIMIZED
 * Read-only note display with HTML & Markdown support
 * Optimized for native print/PDF export
 */

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Globe, Lock, Tag as TagIcon, Clock, TvMinimalPlay } from "lucide-react";
import type { Note } from "@/types/notes.types";
import { formatDistanceToNow, format } from "date-fns";
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
  const updatedRelative = formatDistanceToNow(new Date(note.updatedAt), {
    addSuffix: true,
    locale: idLocale,
  });

  // Process content: detect HTML or convert markdown
  const processedContent = useMemo(() => {
    if (!note.content) return "";

    // If already HTML (from Tiptap), sanitize and use directly
    if (isHtmlContent(note.content)) {
      return sanitizeHtml(note.content);
    }

    // If plain text or markdown, convert to HTML
    return convertMarkdownToHtml(note.content);
  }, [note.content]);

  // Check if note is from YouTube
  const isFromYouTube = note.sourceType === "youtube" && note.sourceUrl;

  return (
    <div className="space-y-6 print:space-y-0">
      {/* Title Section - Adaptive for Screen & Print */}
      <div className="space-y-4 print:px-0 pdf-title-page">
        {/* Main Title */}
        <h1 className="text-[32px] md:text-[36px] font-bold leading-tight print:!text-[36pt] print:!font-bold print:!text-black print:!mb-6 print:!mt-[40%]">
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

        {/* Print Metadata - Left Aligned */}
        <div className="hidden print:flex flex-col gap-2 mt-4 text-[12pt] text-black font-semibold">
          <div className="flex items-center gap-2">
            <span>📅 Tanggal:</span>
            <span>{createdDate}</span>
          </div>
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


