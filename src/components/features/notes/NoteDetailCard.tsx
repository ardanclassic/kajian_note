/**
 * NoteDetailCard Component
 * Wrapper card for note detail view with actions
 * Path: src/components/features/notes/NoteDetailCard.tsx
 */

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit3, Trash2, ArrowLeft, Share2, Download, Pin, Eye, Loader2, Check } from "lucide-react";
import type { Note } from "@/types/notes.types";

interface NoteDetailCardProps {
  note: Note;
  isOwner?: boolean;
  isPinnable?: boolean;
  onBack?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onTogglePin?: (isPinned: boolean) => void;
  onShare?: () => void;
  onExport?: () => void;
  children: React.ReactNode;
}

export function NoteDetailCard({
  note,
  isOwner = false,
  isPinnable = false,
  onBack,
  onEdit,
  onDelete,
  onTogglePin,
  onShare,
  onExport,
  children,
}: NoteDetailCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [copied, setCopied] = useState(false);

  // Handle delete
  const handleDelete = async () => {
    const confirmed = window.confirm("Yakin ingin menghapus catatan ini? Tindakan ini tidak dapat dibatalkan.");
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await onDelete?.();
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Gagal menghapus catatan");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle toggle pin
  const handleTogglePin = async () => {
    try {
      setIsPinning(true);
      await onTogglePin?.(!note.isPinned);
    } catch (error) {
      console.error("Error toggling pin:", error);
      alert("Gagal mengubah status pin");
    } finally {
      setIsPinning(false);
    }
  };

  // Handle share (copy link)
  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // Default: copy URL
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Back Button */}
        {onBack && (
          <Button variant="ghost" onClick={onBack} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Pin (Admin/Panitia) */}
          {isPinnable && onTogglePin && (
            <Button variant="outline" size="sm" onClick={handleTogglePin} disabled={isPinning}>
              {isPinning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Pin className={`w-4 h-4 ${note.isPinned ? "fill-current" : ""}`} />
              )}
            </Button>
          )}

          {/* Share */}
          {note.isPublic && (
            <Button variant="outline" size="sm" onClick={handleShare}>
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Tersalin
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Bagikan
                </>
              )}
            </Button>
          )}

          {/* Export */}
          {isOwner && onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}

          {/* Edit (Owner) */}
          {isOwner && onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}

          {/* Delete (Owner/Admin) */}
          {(isOwner || isPinnable) && onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Pinned Badge */}
      {note.isPinned && (
        <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <Pin className="w-4 h-4 text-blue-500 fill-current" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Catatan ini di-pin oleh admin</span>
        </div>
      )}

      {/* Main Content Card */}
      <Card className="border-2">
        <CardContent className="p-6 md:p-8 lg:p-12">{children}</CardContent>
      </Card>

      {/* Bottom Stats (optional) */}
      {note.isPublic && (
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span>Catatan publik</span>
          </div>
        </div>
      )}
    </div>
  );
}
