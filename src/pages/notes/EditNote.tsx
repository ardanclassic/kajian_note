/**
 * EditNote Page
 * Edit existing note with full-screen focus
 * Path: src/pages/EditNote.tsx
 * Route: /notes/:id/edit
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NoteForm } from "@/components/features/notes/editor/NoteForm";
import { TopHeader } from "@/components/layout/TopHeader";
import { useAuthStore } from "@/store/authStore";
import { useNotesStore } from "@/store/notesStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { Edit3, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CreateNoteData, UpdateNoteData } from "@/types/notes.types";
import Loading from "@/components/common/Loading";

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
    return <Loading fullscreen text="Memuat catatan..." />;
  }

  // Error state
  if (error || !currentNote) {
    return (
      <div className="min-h-screen bg-background">
        <TopHeader
          backButton
          onBackClick={() => navigate("/notes")}
          title="Error"
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
        <TopHeader
          backButton
          onBackClick={handleBack}
          title="Akses Ditolak"
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
      <TopHeader
        backButton
        onBackClick={handleBack}
        title="Edit Catatan"
        actions={
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">Updating: {currentNote.title}</span>
          </div>
        }
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Edit Form */}
          <NoteForm
            note={currentNote}
            onSubmit={handleUpdateNote}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
