/**
 * NoteViewer Component - FIXED
 * Read-only note display with HTML & Markdown support
 * FIX: Render HTML from Tiptap + Convert markdown syntax
 */

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Globe, Lock, Tag as TagIcon, Clock, Youtube } from "lucide-react";
import type { Note } from "@/types/notes.types";
import { formatDistanceToNow, format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface NoteViewerProps {
  note: Note;
  showMetadata?: boolean;
  showAuthor?: boolean;
  authorName?: string;
  authorUsername?: string;
}

/**
 * Convert markdown syntax to HTML
 * Supports: **bold**, *italic*, [link](url), etc
 */
const convertMarkdownToHtml = (text: string): string => {
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
    <div className="space-y-6">
      {/* Title Section */}
      <div className="space-y-4">
        <h1 className="text-3xl! md:text-[36px]! font-bold leading-tight">{note.title}</h1>

        {/* Metadata Bar */}
        {showMetadata && (
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
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

            {/* Visibility */}
            <Badge variant={note.isPublic ? "default" : "secondary"} className="gap-1.5">
              {note.isPublic ? (
                <>
                  <Globe className="w-3 h-3" />
                  Publik
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3" />
                  Pribadi
                </>
              )}
            </Badge>
          </div>
        )}

        {/* YouTube Source Badge */}
        {isFromYouTube && (
          <div className="flex items-center gap-4 p-3 px-6 bg-green-500/10 rounded-lg">
            <Youtube className="w-8 h-8 text-red-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-500 dark:text-green-400">Diimpor dari YouTube</p>
              <a
                href={note.sourceUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] font-normal! text-blue-300! dark:text-blue-300! hover:underline!"
              >
                Lihat video sumber
              </a>
            </div>
            {note.sourceMetadata?.has_ai_summary && (
              <Badge variant="outline" className="hidden md:block text-xs border-yellow-300/50 text-yellow-500 dark:text-yellow-400">
                AI Summary
              </Badge>
            )}
          </div>
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex items-start gap-2">
            <TagIcon className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="gap-1">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t" />

      {/* Content Section - FIXED: Render HTML */}
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          <div className="prose-editor">
            <div className="ProseMirror" dangerouslySetInnerHTML={{ __html: processedContent }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
