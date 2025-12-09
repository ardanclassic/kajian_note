/**
 * NoteCard Component - Dark Mode with Emerald Glow
 * Refactored: Following design-guidelines.md
 * ✅ Pure black background
 * ✅ Emerald glow on hover
 * ✅ Sharp corner highlights
 *
 * Note: This component uses date-fns which is available in the main project
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Pin, Trash2, Edit, Calendar, Lock, Globe } from "lucide-react";

// Types (akan diimport dari project)
interface NoteSummary {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPublic: boolean;
  isPinned: boolean;
  createdAt: string;
  userId: string;
}

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

// Helper functions (akan diimport dari project)
const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "");
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "hari ini";
  if (days === 1) return "kemarin";
  if (days < 7) return `${days} hari yang lalu`;
  if (days < 30) return `${Math.floor(days / 7)} minggu yang lalu`;
  return `${Math.floor(days / 30)} bulan yang lalu`;
};

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formattedDate = formatDate(note.createdAt);
  const plainTextContent = stripHtml(note.content);

  const handleCardClick = () => {
    if (onClick) {
      onClick(note);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

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

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(note);
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="group relative bg-black rounded-2xl p-6 border border-gray-800 hover:border-emerald-500/30 cursor-pointer transition-all duration-500 hover:-translate-y-1 overflow-hidden h-full flex flex-col"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-emerald-500/5 blur-xl" />
        </div>

        {/* Pinned Indicator */}
        {note.isPinned && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-emerald-500 via-emerald-400 to-emerald-500" />
        )}

        {/* Content */}
        <div className="relative z-10 flex-1 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold text-white line-clamp-2 flex-1 group-hover:text-emerald-400 transition-colors">
              {note.title}
            </h3>

            {note.isPinned && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-900 border border-emerald-500/50 text-emerald-400 rounded-lg text-xs font-bold shrink-0">
                <Pin className="w-3 h-3 fill-current" />
                PIN
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Visibility */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                note.isPublic
                  ? "bg-green-500/20 border border-green-500/50 text-green-400"
                  : "bg-orange-500/20 border border-orange-500/50 text-orange-400"
              }`}
            >
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
            </div>

            {/* Tags */}
            {note.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {note.tags.slice(0, 2).map((tag) => (
                  <div
                    key={tag}
                    className="px-2.5 py-1 bg-gray-900 border border-gray-800 text-gray-400 rounded-lg text-xs font-medium"
                  >
                    #{tag}
                  </div>
                ))}
                {note.tags.length > 2 && (
                  <div className="px-2.5 py-1 bg-gray-900 border border-gray-800 text-gray-400 rounded-lg text-xs font-medium">
                    +{note.tags.length - 2}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview */}
          <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">{plainTextContent}</p>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between gap-3 pt-4 mt-4 border-t border-gray-800">
          {/* Date */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>

          {/* Actions */}
          {showActions && (isOwner || isPinnable) && (
            <div className="flex items-center gap-1">
              {isOwner && onEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEdit}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}

              {isPinnable && onTogglePin && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleTogglePin}
                  disabled={isPinning}
                  className={`h-8 w-8 p-0 ${
                    note.isPinned
                      ? "text-emerald-400 hover:bg-emerald-500/10"
                      : "text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                  }`}
                >
                  <Pin className={`w-4 h-4 ${note.isPinned ? "fill-current" : ""}`} />
                </Button>
              )}

              {isOwner && onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Corner Highlights */}
        <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-0 right-0 w-px h-12 bg-linear-to-b from-emerald-500/50 to-transparent" />
          <div className="absolute top-0 right-0 h-px w-12 bg-linear-to-l from-emerald-500/50 to-transparent" />
        </div>
      </div>

      {/* Delete Dialog */}
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
