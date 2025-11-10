/**
 * CreateNote Page
 * Create new note with full-screen focus
 * Path: src/pages/CreateNote.tsx
 * Route: /notes/new
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NoteForm } from "@/components/features/notes/NoteForm";
import { PageHeader } from "@/components/common/PageHeader";
import { SubscriptionLimitBanner } from "@/components/features/notes/SubscriptionLimitBanner";
import { useAuthStore } from "@/store/authStore";
import { useNotesStore } from "@/store/notesStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { PlusCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CreateNoteData } from "@/types/notes.types";

export default function CreateNote() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createNote, fetchUserTags, fetchStatistics } = useNotesStore();
  const { usage, fetchUsage, checkCanCreateNote } = useSubscriptionStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch usage on mount
  useEffect(() => {
    if (user?.id) {
      fetchUsage(user.id);
    }
  }, [user?.id]);

  // Handle back
  const handleBack = () => {
    navigate("/notes");
  };

  // Handle cancel
  const handleCancel = () => {
    const hasUnsavedChanges = window.confirm("Anda memiliki perubahan yang belum disimpan. Yakin ingin keluar?");
    if (hasUnsavedChanges) {
      navigate("/notes");
    }
  };

  // Handle create note
  const handleCreateNote = async (data: CreateNoteData) => {
    if (!user?.id) {
      alert("Anda harus login terlebih dahulu");
      navigate("/login");
      return;
    }

    try {
      setIsSubmitting(true);

      // Check if can create
      const canCreate = await checkCanCreateNote(user.id);
      if (!canCreate.allowed) {
        alert(canCreate.message);
        setIsSubmitting(false);
        return;
      }

      // Create note
      await createNote(user.id, data);

      // Refresh data
      await Promise.all([fetchUserTags(user.id), fetchStatistics(user.id), fetchUsage(user.id)]);

      // Navigate to notes list
      navigate("/notes", { replace: true });
    } catch (error: any) {
      console.error("Error creating note:", error);
      alert(error.message || "Gagal membuat catatan");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <PageHeader
        badgeIcon={PlusCircle}
        badgeText="Create Note"
        title="Buat Catatan Baru"
        description="Tulis catatan kajian Anda dengan fokus penuh"
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
          {/* Usage Banner */}
          {usage && <SubscriptionLimitBanner usage={usage} compact />}

          {/* Create Form */}
          <div className="bg-gradient-to-br from-primary/5 to-card border-2 border-primary/20 rounded-lg p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <PlusCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Form Catatan Baru</h2>
                <p className="text-sm text-muted-foreground">Isi form di bawah untuk membuat catatan</p>
              </div>
            </div>

            <NoteForm onSubmit={handleCreateNote} onCancel={handleCancel} isSubmitting={isSubmitting} />
          </div>

          {/* Tips Card */}
          <div className="bg-muted/50 border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-3">💡 Tips Menulis Catatan</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Gunakan judul yang jelas dan deskriptif</li>
              <li>• Tambahkan tag untuk memudahkan pencarian</li>
              <li>• Tandai sebagai publik jika ingin berbagi dengan jamaah lain</li>
              <li>• Tulis dengan detail agar mudah dipahami saat dibaca kembali</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
