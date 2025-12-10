/**
 * ViewNote Page - UPDATED WITH EXPORT ACTIONS DROPDOWN
 * Uses native browser print API for PDF export
 * Added Telegram & WhatsApp send features
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { NoteViewer } from "@/components/features/notes/NoteViewer";
import { ExportActionsDropdown } from "@/components/features/notes/ExportActionsDropdown";
import { useAuthStore } from "@/store/authStore";
import { useNotesStore } from "@/store/notesStore";
import { BookOpen, Loader2, AlertCircle, ArrowLeft, Edit, Trash2, Share2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ScrollToTopButton } from '@/components/common/ScrollToTopButton';

export default function ViewNote() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentNote, isLoading, error, fetchNoteById, deleteNote, clearCurrentNote, clearError } = useNotesStore();

  const [isDeleting, setIsDeleting] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Fetch note on mount
  useEffect(() => {
    if (id) {
      fetchNoteById(id);
    }

    return () => {
      clearCurrentNote();
      clearError();
    };
  }, [id]);

  // Check permissions
  const isOwner = user?.id === currentNote?.userId;
  const isPanitia = user?.role === "panitia";
  const isAdmin = user?.role === "admin";
  const canEdit = isOwner;
  const canDelete = isOwner || isAdmin || isPanitia;

  // Handle back
  const handleBack = () => {
    navigate("/notes");
  };

  // Handle edit
  const handleEdit = () => {
    if (id) {
      navigate(`/notes/${id}/edit`);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!id || !user?.id) return;

    const confirmed = window.confirm("Yakin ingin menghapus catatan ini?");
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deleteNote(id, user.id);
      toast.success("Catatan berhasil dihapus");
      navigate("/notes", { replace: true });
    } catch (error: any) {
      toast.error("Gagal menghapus catatan", {
        description: error.message || "Terjadi kesalahan",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle share
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link berhasil disalin!", {
      description: "Link catatan telah disalin ke clipboard",
    });
  };

  // Loading state
  if (isLoading && !currentNote) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat catatan...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !currentNote) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Catatan Tidak Ditemukan</h3>
          <p className="text-muted-foreground mb-6">
            {error || "Catatan yang Anda cari tidak ada atau Anda tidak memiliki akses."}
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </motion.div>
      </div>
    );
  }

  // Access denied
  if (!currentNote.isPublic && !isOwner && !isAdmin && !isPanitia) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Akses Ditolak</h3>
          <p className="text-muted-foreground mb-6">
            Catatan ini bersifat pribadi. Hanya pemilik yang dapat mengaksesnya.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Action Bar - Desktop - HIDDEN IN PRINT */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="no-print sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Back Button */}
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Kembali</span>
            </Button>

            {/* Center: Title Badge (hidden on mobile) */}
            <Badge variant="outline" className="hidden md:flex gap-2">
              <BookOpen className="w-4 h-4" />
              Detail Catatan
            </Badge>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Share Button (if public) */}
              {currentNote.isPublic && (
                <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 hidden sm:flex">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              )}

              {/* Export Actions Dropdown - NEW */}
              <ExportActionsDropdown note={currentNote} />

              {/* Edit Button (owner only) */}
              {canEdit && (
                <Button variant="default" size="sm" onClick={handleEdit} className="gap-2 hidden sm:flex">
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              )}

              {/* More Actions (Mobile) */}
              <div className="relative sm:hidden">
                <Button variant="outline" size="sm" onClick={() => setShowActions(!showActions)}>
                  <MoreVertical className="w-4 h-4" />
                </Button>

                <AnimatePresence>
                  {showActions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-background border rounded-lg shadow-lg overflow-hidden z-50"
                    >
                      {canEdit && (
                        <button
                          onClick={handleEdit}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-accent transition-colors text-left"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit Catatan</span>
                        </button>
                      )}
                      {currentNote.isPublic && (
                        <button
                          onClick={handleShare}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-accent transition-colors text-left border-t"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Share Link</span>
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-destructive/10 text-destructive transition-colors text-left border-t"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Hapus</span>
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Delete Button (Desktop, admin/owner only) */}
              {canDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="gap-2 hidden sm:flex"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? "Menghapus..." : "Hapus"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl print:px-0 print:py-0 print:max-w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="printable-content border-none md:border-2 p-0 overflow-hidden print:border-none! print:shadow-none! print:bg-white!">
            <div className="p-0 md:p-8 lg:p-12 bg-background print:bg-white! print:p-0! print:border-none!">
              <NoteViewer
                note={currentNote}
                showMetadata={true}
                showAuthor={!isOwner}
                authorName={isOwner ? undefined : "Anonymous"}
              />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Floating Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
}
