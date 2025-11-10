/**
 * ViewNote Page
 * View note detail in read-only mode
 * Path: src/pages/ViewNote.tsx
 * Route: /notes/:id
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NoteViewer } from "@/components/features/notes/NoteViewer";
import { NoteDetailCard } from "@/components/features/notes/NoteDetailCard";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuthStore } from "@/store/authStore";
import { useNotesStore } from "@/store/notesStore";
import { BookOpen, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ViewNote() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentNote, isLoading, error, fetchNoteById, deleteNote, clearCurrentNote, clearError } = useNotesStore();

  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch note on mount
  useEffect(() => {
    if (id) {
      fetchNoteById(id);
    }

    // Cleanup on unmount
    return () => {
      clearCurrentNote();
      clearError();
    };
  }, [id]);

  // Check if user is owner
  const isOwner = user?.id === currentNote?.userId;
  const isPanitia = user?.role === "panitia";
  const isAdmin = user?.role === "admin";

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

    try {
      setIsDeleting(true);
      await deleteNote(id, user.id);
      navigate("/notes", { replace: true });
    } catch (error: any) {
      alert(error.message || "Gagal menghapus catatan");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle share
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert("Link disalin ke clipboard!");
  };

  // Handle export (placeholder)
  const handleExport = () => {
    alert("Fitur export akan segera hadir!");
  };

  // Loading state
  if (isLoading && !currentNote) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader
          badgeIcon={BookOpen}
          badgeText="Loading"
          title="Memuat Catatan..."
          description="Mohon tunggu sebentar"
        />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Memuat catatan...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !currentNote) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader
          badgeIcon={AlertCircle}
          badgeText="Error"
          title="Catatan Tidak Ditemukan"
          description="Catatan yang Anda cari tidak ada atau sudah dihapus"
        />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="w-16 h-16 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Catatan Tidak Ditemukan</h3>
              <p className="text-muted-foreground mb-6">
                {error || "Catatan yang Anda cari tidak ada atau Anda tidak memiliki akses."}
              </p>
              <Button onClick={handleBack}>Kembali ke Daftar Catatan</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check access (private notes)
  if (!currentNote.isPublic && !isOwner && !isAdmin && !isPanitia) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader
          badgeIcon={AlertCircle}
          badgeText="Access Denied"
          title="Akses Ditolak"
          description="Anda tidak memiliki akses ke catatan ini"
        />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="w-16 h-16 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Akses Ditolak</h3>
              <p className="text-muted-foreground mb-6">
                Catatan ini bersifat pribadi. Hanya pemilik yang dapat mengaksesnya.
              </p>
              <Button onClick={handleBack}>Kembali ke Daftar Catatan</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <PageHeader
        badgeIcon={BookOpen}
        badgeText="View Note"
        title="Detail Catatan"
        description="Baca catatan kajian dengan nyaman"
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <NoteDetailCard
            note={currentNote}
            isOwner={isOwner}
            isPinnable={isAdmin || isPanitia}
            onBack={handleBack}
            onEdit={isOwner ? handleEdit : undefined}
            onDelete={isOwner || isAdmin || isPanitia ? handleDelete : undefined}
            onShare={currentNote.isPublic ? handleShare : undefined}
            onExport={isOwner ? handleExport : undefined}
          >
            <NoteViewer
              note={currentNote}
              showMetadata={true}
              showAuthor={!isOwner}
              authorName={isOwner ? undefined : "Anonymous"}
              authorUsername={isOwner ? undefined : undefined}
            />
          </NoteDetailCard>
        </div>
      </div>
    </div>
  );
}
