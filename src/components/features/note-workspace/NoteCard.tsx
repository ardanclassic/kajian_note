/**
 * NoteCard Component - Pinterest-Style Card
 * Natural height variation based on content
 * ✨ Dark mode with emerald glow
 * ✨ Smooth hover lift effect
 * ✨ Minimal action buttons
 * ✨ Better visual hierarchy
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Pin, Trash2, Edit, Calendar, Youtube } from "lucide-react";
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Format date
  const formattedDate = formatDistanceToNow(new Date(note.createdAt), {
    addSuffix: true,
    locale: idLocale,
  });

  // Strip HTML tags from content for preview
  const plainTextContent = stripHtml(note.content);

  // Calculate preview length based on content (natural variation)
  const getPreviewLength = () => {
    const contentLength = plainTextContent.length;
    if (contentLength < 100) return contentLength;
    if (contentLength < 200) return 150;
    if (contentLength < 300) return 200;
    return 250; // Max preview
  };

  const previewContent = plainTextContent.slice(0, getPreviewLength());
  const hasMoreContent = plainTextContent.length > previewContent.length;

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
      <motion.div
        whileHover={{
          y: -8,
          transition: { duration: 0.3, ease: "easeOut" },
        }}
        whileTap={{ scale: 0.98 }}
        className="h-full"
      >
        <Card
          className="group h-full flex flex-col cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-500/50 relative overflow-hidden bg-black border-gray-900 px-0 py-3 gap-0 md:gap-6"
          onClick={handleCardClick}
        >
          {/* Hover gradient overlay */}
          <motion.div
            className="absolute inset-0 bg-linear-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Pinned indicator stripe */}
          {note.isPinned && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-emerald-500 via-emerald-500/80 to-emerald-500/60" />
          )}

          <CardHeader className="space-y-2 sm:space-y-3 relative pb-2 sm:pb-3">
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <CardTitle className="text-base md:text-lg line-clamp-2 flex-1 group-hover:text-emerald-400 transition-colors duration-300 text-white font-bold leading-tight">
                {note.title}
              </CardTitle>

              {/* Pinned Badge */}
              {note.isPinned && (
                <Badge
                  variant="default"
                  className="shrink-0 shadow-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 text-xs"
                >
                  <Pin className="w-3 h-3 mr-1 fill-current" />
                  Pin
                </Badge>
              )}
            </div>

            {/* Tags */}
            {note.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {note.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs border-gray-800 hover:border-emerald-500/50 transition-colors text-gray-400 bg-gray-900/50"
                  >
                    #{tag}
                  </Badge>
                ))}
                {note.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs border-gray-800 text-gray-500 bg-gray-900/50">
                    +{note.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </CardHeader>

          {/* Content - Hidden on mobile, visible on tablet+ */}
          <CardContent className="hidden sm:block flex-1 relative pb-4">
            <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap break-words">
              {previewContent}
              {hasMoreContent && <span className="text-emerald-400 font-medium ml-1">... baca selengkapnya</span>}
            </p>
          </CardContent>

          <CardFooter className="flex items-center justify-between gap-2 border-t border-gray-900 pt-3! mt-auto">
            {/* Left side: Date & Source */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
              </div>

              {/* YouTube Badge */}
              {note.sourceType === "youtube" && (
                <Badge variant="outline" className="text-xs border-gray-800 text-gray-500 bg-gray-900/50">
                  <Youtube className="w-3 h-3 mr-1" />
                  YT
                </Badge>
              )}
            </div>

            {/* Right side: Actions */}
            {showActions && (isOwner || isPinnable) && (
              <div className="flex items-center gap-1">
                {/* Edit (Owner only) */}
                {isOwner && onEdit && (
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleEdit}
                      className="h-7 w-7 p-0 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all text-gray-500"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                  </motion.div>
                )}

                {/* Pin (Admin/Panitia only) */}
                {isPinnable && onTogglePin && (
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleTogglePin}
                      disabled={isPinning}
                      className={`h-7 w-7 p-0 transition-all ${
                        note.isPinned
                          ? "text-emerald-400 hover:bg-emerald-500/10"
                          : "text-gray-500 hover:bg-emerald-500/10 hover:text-emerald-400"
                      }`}
                      title={note.isPinned ? "Unpin" : "Pin"}
                    >
                      <Pin className={`w-3.5 h-3.5 ${note.isPinned ? "fill-current" : ""}`} />
                    </Button>
                  </motion.div>
                )}

                {/* Delete */}
                {isOwner && onDelete && (
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDeleteClick}
                      disabled={isDeleting}
                      className="h-7 w-7 p-0 text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-all"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </motion.div>
                )}
              </div>
            )}
          </CardFooter>
        </Card>
      </motion.div>

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
