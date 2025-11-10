/**
 * NoteViewer Component
 * Read-only note display with beautiful formatting
 * Path: src/components/features/notes/NoteViewer.tsx
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Globe, Lock, Tag as TagIcon, Clock } from "lucide-react";
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

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">{note.title}</h1>

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

      {/* Content Section */}
      <Card className="border-none shadow-none">
        <CardContent className="p-0">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-base leading-relaxed">{note.content}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
