/**
 * NoteCard Component - UPDATED
 * Display note summary in card format with onClick support
 * Path: src/components/features/notes/NoteCard.tsx
 */

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pin, Trash2, Edit, Calendar, Lock, Globe } from "lucide-react";
import type { NoteSummary } from "@/types/notes.types";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface NoteCardProps {
  note: NoteSummary;
  showAuthor?: boolean;
  showActions?: boolean;
  isOwner?: boolean;
  isPinnable?: boolean; // Admin/panitia can pin
  onClick?: (note: NoteSummary) => void; // NEW: Handle card click for view
  onEdit?: (note: NoteSummary) => void;
  onDelete?: (noteId: string) => void;
  onTogglePin?: (noteId: string, isPinned: boolean) => void;
}

export function NoteCard({
  note,
  showAuthor = false,
  showActions = false,
  isOwner = false,
  isPinnable = false,
  onClick, // NEW
  onEdit,
  onDelete,
  onTogglePin,
}: NoteCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPinning, setIsPinning] = useState(false);

  // Format date
  const formattedDate = formatDistanceToNow(new Date(note.createdAt), {
    addSuffix: true,
    locale: idLocale,
  });

  // Handle card click - UPDATED
  const handleCardClick = () => {
    if (onClick) {
      onClick(note); // Use onClick for view if provided
    }
  };

  // Handle delete
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!onDelete) return;

    const confirmed = window.confirm("Yakin ingin menghapus catatan ini?");
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await onDelete(note.id);
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Gagal menghapus catatan");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle toggle pin
  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!onTogglePin) return;

    try {
      setIsPinning(true);
      await onTogglePin(note.id, !note.isPinned);
    } catch (error) {
      console.error("Error toggling pin:", error);
      alert("Gagal mengubah status pin");
    } finally {
      setIsPinning(false);
    }
  };

  // Handle edit
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onEdit) {
      onEdit(note);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col cursor-pointer" onClick={handleCardClick}>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2 flex-1">{note.title}</CardTitle>

          {/* Pinned Badge */}
          {note.isPinned && (
            <Badge variant="secondary" className="shrink-0">
              <Pin className="w-3 h-3 mr-1" />
              Pinned
            </Badge>
          )}
        </div>

        {/* Visibility & Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Visibility Badge */}
          <Badge variant="outline" className="shrink-0">
            {note.isPublic ? (
              <>
                <Globe className="w-3 h-3 mr-1" />
                Publik
              </>
            ) : (
              <>
                <Lock className="w-3 h-3 mr-1" />
                Pribadi
              </>
            )}
          </Badge>

          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {note.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {note.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{note.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 pt-4 border-t">
        {/* Date */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{formattedDate}</span>
        </div>

        {/* Actions */}
        {showActions && (isOwner || isPinnable) && (
          <div className="flex items-center gap-1">
            {/* Edit (Owner only) */}
            {isOwner && onEdit && (
              <Button size="sm" variant="ghost" onClick={handleEdit} className="h-8 w-8 p-0" title="Edit">
                <Edit className="w-4 h-4" />
              </Button>
            )}

            {/* Pin (Admin/Panitia only) */}
            {isPinnable && onTogglePin && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleTogglePin}
                disabled={isPinning}
                className="h-8 w-8 p-0"
                title={note.isPinned ? "Unpin" : "Pin"}
              >
                <Pin className={`w-4 h-4 ${note.isPinned ? "fill-current" : ""}`} />
              </Button>
            )}

            {/* Delete */}
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                title="Hapus"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
