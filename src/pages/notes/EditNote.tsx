/**
 * EditNote Page
 * Edit existing note with full-screen focus
 * Path: src/pages/EditNote.tsx
 * Route: /notes/:id/edit
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NoteForm } from "@/components/features/notes/NoteForm";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuthStore } from "@/store/authStore";
import { useNotesStore } from "@/store/notesStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { Edit3, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CreateNoteData, UpdateNoteData } from "@/types/notes.types";

export default function EditNote() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentNote,
    isLoading,
    error,
    fetchNoteById,
    updateNote,
    fetchUserTags,
    fetchStatistics,
    clearCurrentNote,
    clearError,
  } = useNotesStore();
  const { fetchUsage } = useSubscriptionStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Handle back
  const handleBack = () => {
    if (id) {
      navigate(`/notes/${id}`);
    } else {
      navigate("/notes");
    }
  };

  // Handle cancel
  const handleCancel = () => {
    const hasUnsavedChanges = window.confirm("Anda memiliki perubahan yang belum disimpan. Yakin ingin keluar?");
    if (hasUnsavedChanges) {
      handleBack();
    }
  };

  // Handle update note
  const handleUpdateNote = async (data: CreateNoteData) => {
    if (!user?.id || !id || !currentNote) {
      alert("Terjadi kesalahan. Silakan coba lagi.");
      return;
    }

    try {
      setIsSubmitting(true);

      const updateData: UpdateNoteData = {
        title: data.title,
        content: data.content,
        isPublic: data.isPublic,
        tags: data.tags,
      };

      await updateNote(id, user.id, updateData);

      // Refresh data
      await Promise.all([fetchUserTags(user.id), fetchStatistics(user.id), fetchUsage(user.id)]);

      // Navigate to detail view
      navigate(`/notes/${id}`, { replace: true });
    } catch (error: any) {
      console.error("Error updating note:", error);
      alert(error.message || "Gagal mengubah catatan");
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading && !currentNote) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader
          badgeIcon={Edit3}
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
              <Button onClick={() => navigate("/notes")}>Kembali ke Daftar Catatan</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Access denied (not owner)
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader
          badgeIcon={AlertCircle}
          badgeText="Access Denied"
          title="Akses Ditolak"
          description="Anda tidak memiliki akses untuk mengedit catatan ini"
        />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="w-16 h-16 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Akses Ditolak</h3>
              <p className="text-muted-foreground mb-6">Hanya pemilik catatan yang dapat mengeditnya.</p>
              <Button onClick={handleBack}>Kembali</Button>
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
        badgeIcon={Edit3}
        badgeText="Edit Note"
        title="Edit Catatan"
        description="Perbarui catatan kajian Anda"
        actions={
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        }
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Edit Form */}
          <div className="bg-linear-to-br from-blue-500/5 to-card border-2 border-blue-500/20 rounded-lg p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Edit3 className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold">Edit Catatan</h2>
                <p className="text-sm text-muted-foreground truncate">{currentNote.title}</p>
              </div>
            </div>

            <NoteForm
              note={currentNote}
              onSubmit={handleUpdateNote}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          </div>

          {/* Info Card */}
          <div className="bg-muted/50 border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-3">ℹ️ Informasi</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Perubahan akan langsung tersimpan setelah Anda klik "Simpan"</li>
              <li>• Tag yang dihapus tidak dapat dikembalikan</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
