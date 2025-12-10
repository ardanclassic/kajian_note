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
      <div className="space-y-4 print:px-8">
        {/* Main Title */}
        <h1 className="text-[32px] md:text-[36px] font-bold leading-tight print:!text-[36pt] print:!font-bold print:!text-black print:!mb-6 print:!mt-[40%]">
          {note.title}
        </h1>

        {/* Metadata Bar - Screen Version */}
        {showMetadata && (
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground no-print">
            {/* Author */}
            {showAuthor && authorName && (
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>{authorName}</span>
                {authorUsername && <span className="text-xs">@{authorUsername}</span>}
              </div>
            )}

            {/* Created Date */}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{createdDate}</span>
            </div>

            {/* Updated */}
            {note.updatedAt !== note.createdAt && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Diperbarui {updatedRelative}</span>
              </div>
            )}
          </div>
        )}

        {/* Metadata Grid - Print Version */}
        <div className="hidden print:flex print:flex-col print:gap-2 print:text-[14pt] print:text-gray-600">
          {/* Created Date */}
          <div className="print:flex print:items-center print:gap-2">
            <span className="print:font-medium">📅</span>
            <span>{createdDate}</span>
          </div>

          {/* Author (if shown) */}
          {showAuthor && authorName && (
            <div className="print:flex print:items-center print:gap-2">
              <span className="print:font-medium">👤</span>
              <span>{authorName}</span>
              {authorUsername && <span className="print:text-[10pt] print:text-gray-500">@{authorUsername}</span>}
            </div>
          )}

          {/* YouTube Source (if exists) */}
          {isFromYouTube && (
            <div className="print:flex print:items-center print:justify-items-start print:gap-2">
              <span className="print:font-medium">🎥</span>
              <span className="print:text-[13pt]">
                <a
                  href={note.sourceUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-2 print:text-[13px] text-blue-300 print:!text-blue-400 dark:text-blue-300 hover:underline"
                ></a>
              </span>
            </div>
          )}
        </div>

        {/* YouTube Source Badge - Screen Version */}
        {isFromYouTube && (
          <div className="flex items-center gap-4 p-3 px-6 bg-gray-400/10 rounded-lg no-print">
            <TvMinimalPlay className="w-8 h-8 text-red-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-rose-200 dark:text-rose-300">Diimpor dari YouTube</p>
              <a
                href={note.sourceUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] font-normal text-sky-300! dark:text-sky-300! hover:underline"
              >
                Lihat video sumber
              </a>
            </div>
            {note.sourceMetadata?.has_ai_summary && (
              <Badge
                variant="outline"
                className="hidden md:block text-xs border-teal-300/50 text-teal-400 dark:text-teal-400"
              >
                AI Summary
              </Badge>
            )}
          </div>
        )}

        {/* Tags - Both Screen & Print */}
        {note.tags.length > 0 && (
          <div className="flex items-start gap-2 print:justify-center print:mt-3">
            <TagIcon className="w-4 h-4 text-muted-foreground mt-1 shrink-0 print:hidden" />
            <div className="flex flex-wrap gap-2 print:justify-center">
              {note.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="gap-1 print:px-3 print:py-1 print:bg-gray-100 print:text-gray-700 print:border-gray-300 print:rounded-full print:text-[10pt]"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Divider - Screen Only */}
      <div className="border-t print:hidden" />

      {/* Content Section - PRINT OPTIMIZED */}
      <Card className="border-none shadow-none bg-transparent print:!shadow-none print:!bg-transparent print:!border-none">
        <CardContent className="p-0 print:!p-0 print:!border-none">
          <div className="prose-editor">
            <div className="ProseMirror" dangerouslySetInnerHTML={{ __html: processedContent }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
