/**
 * NoteCard Component - IMPROVED UI/UX
 * Modern card design with hover effects and smooth interactions
 * ✅ FIXED: Proper delete confirmation dialog
 */

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Pin, Trash2, Edit, Calendar, Lock, Globe, Eye } from "lucide-react";
import type { NoteSummary } from "@/types/notes.types";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { stripHtml } from "@/utils/textToHtml";

interface NoteCardProps {
  note: NoteSummary;
  showAuthor?: boolean;
  showActions?: boolean;
  isOwner?: boolean;
  isPinnable?: boolean;
  onClick?: (note: NoteSummary) => void;
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
  onClick,
  onEdit,
  onDelete,
  onTogglePin,
}: NoteCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Format date
  const formattedDate = formatDistanceToNow(new Date(note.createdAt), {
    addSuffix: true,
    locale: idLocale,
  });

  // Strip HTML tags from content for preview
  const plainTextContent = stripHtml(note.content);

  // Handle card click
  const handleCardClick = () => {
    if (onClick) {
      onClick(note);
    }
  };

  // Handle delete - Show dialog first
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!onDelete) return;

    try {
      setIsDeleting(true);
      await onDelete(note.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Gagal menghapus catatan");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle toggle pin
  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
    e.stopPropagation();
    if (onEdit) {
      onEdit(note);
    }
  };

  return (
    <>
      <Card
        className="group h-full flex flex-col cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50 relative overflow-hidden p-3"
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Pinned indicator stripe */}
        {note.isPinned && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-primary/80 to-primary/60" />
        )}

        <CardHeader className="space-y-3 relative px-2">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg line-clamp-2 flex-1 group-hover:text-primary transition-colors">
              {note.title}
            </CardTitle>

            {/* Pinned Badge */}
            {note.isPinned && (
              <Badge variant="default" className="shrink-0 shadow-sm bg-primary/90">
                <Pin className="w-3 h-3 mr-1 fill-current" />
                Pin
              </Badge>
            )}
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Tags */}
            {note.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {note.tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs border-primary/30 hover:border-primary/60 transition-colors"
                  >
                    #{tag}
                  </Badge>
                ))}
                {note.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs border-primary/30">
                    +{note.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="hidden md:block flex-1 relative">
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{plainTextContent}</p>

          {/* Read more indicator on hover */}
          {isHovered && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-card to-transparent flex items-end justify-center pb-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-1 text-xs text-primary font-medium">
                <Eye className="w-3 h-3" />
                Klik untuk baca
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between gap-2 border-t relative px-2 pt-2!">
          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>

          {/* Actions */}
          {showActions && (isOwner || isPinnable) && (
            <div className="flex items-center gap-1">
              {/* Edit (Owner only) */}
              {isOwner && onEdit && (
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={handleEdit}
                  className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}

              {/* Pin (Admin/Panitia only) */}
              {isPinnable && onTogglePin && (
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={handleTogglePin}
                  disabled={isPinning}
                  className={`h-8 w-8 transition-all ${
                    note.isPinned ? "text-primary hover:bg-primary/10" : "hover:bg-primary/10 hover:text-primary"
                  }`}
                  title={note.isPinned ? "Unpin" : "Pin"}
                >
                  <Pin className={`w-4 h-4 ${note.isPinned ? "fill-current" : ""}`} />
                </Button>
              )}

              {/* Delete */}
              {isOwner && onDelete && (
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Hapus Catatan?"
        description={
          <div className="space-y-2">
            <div>
              Apakah Anda yakin ingin menghapus catatan "<strong>{note.title}</strong>"?
            </div>
            <div className="text-sm text-muted-foreground">
              Tindakan ini tidak dapat dibatalkan. Semua data catatan akan hilang secara permanen.
            </div>
          </div>
        }
        confirmText="Ya, Hapus"
        cancelText="Batal"
        onConfirm={handleConfirmDelete}
        variant="danger"
        isLoading={isDeleting}
        showCancel={true}
      />
    </>
  );
}
