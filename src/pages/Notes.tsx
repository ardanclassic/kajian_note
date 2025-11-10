/**
 * Notes Page - ENHANCED UI/UX with PageHeader Component
 * Modern note management with inline editing and beautiful design
 */

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/PageHeader";
import { NoteList } from "@/components/features/notes/NoteList";
import { NoteSearch } from "@/components/features/notes/NoteSearch";
import { NoteForm } from "@/components/features/notes/NoteForm";
import { SubscriptionLimitBanner } from "@/components/features/notes/SubscriptionLimitBanner";
import { Plus, FileText, Loader2, X, Edit3, Sparkles, BookOpen, Globe, Lock, Tag as TagIcon } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNotesStore } from "@/store/notesStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import type { CreateNoteData, UpdateNoteData, NoteSummary } from "@/types/notes.types";
import type { NoteFilterOptions, NoteSortOptions } from "@/types/notes.types";

export default function Notes() {
  const { user } = useAuthStore();
  const {
    userNotes,
    isLoading,
    error,
    currentPage,
    totalPages,
    statistics,
    tags,
    fetchUserNotes,
    createNote,
    updateNote,
    deleteNote,
    fetchStatistics,
    fetchUserTags,
    setPage,
    clearError,
  } = useNotesStore();

  const { usage, fetchUsage, checkCanCreateNote } = useSubscriptionStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteSummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle search/filter
  const handleSearch = useCallback(
    (filters: NoteFilterOptions, sort: NoteSortOptions) => {
      if (user?.id) {
        fetchUserNotes(user.id, 1, filters, sort);
      }
    },
    [user?.id, fetchUserNotes]
  );

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    if (user?.id) {
      fetchUserNotes(user.id, 1);
    }
  }, [user?.id, fetchUserNotes]);

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      setPage(page);
      if (user?.id) {
        fetchUserNotes(user.id, page);
      }
    },
    [user?.id, fetchUserNotes, setPage]
  );

  // Handle create note
  const handleCreateNote = async (data: CreateNoteData) => {
    if (!user?.id) return;

    try {
      setIsSubmitting(true);

      // Check if can create
      const canCreate = await checkCanCreateNote(user.id);
      if (!canCreate.allowed) {
        alert(canCreate.message);
        return;
      }

      await createNote(user.id, data);
      setShowCreateForm(false);

      // Refresh data
      await fetchUserTags(user.id);
      await fetchUsage(user.id);
    } catch (error: any) {
      alert(error.message || "Gagal membuat catatan");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit note
  const handleEditNote = (note: NoteSummary) => {
    setEditingNote(note);
    setShowCreateForm(false);
  };

  // Handle update note
  const handleUpdateNote = async (data: CreateNoteData) => {
    if (!user?.id || !editingNote) return;

    try {
      setIsSubmitting(true);

      const updateData: UpdateNoteData = {
        title: data.title,
        content: data.content,
        isPublic: data.isPublic,
        tags: data.tags,
      };

      await updateNote(editingNote.id, user.id, updateData);
      setEditingNote(null);

      // Refresh data
      await fetchUserTags(user.id);
      await fetchUsage(user.id);
    } catch (error: any) {
      alert(error.message || "Gagal mengubah catatan");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingNote(null);
  };

  // Handle delete note
  const handleDeleteNote = async (noteId: string) => {
    if (!user?.id) return;

    const confirmed = window.confirm("Yakin ingin menghapus catatan ini?");
    if (!confirmed) return;

    try {
      await deleteNote(noteId, user.id);

      // Close edit form if deleting currently edited note
      if (editingNote?.id === noteId) {
        setEditingNote(null);
      }

      // Refresh data
      await fetchUserTags(user.id);
      await fetchUsage(user.id);
    } catch (error: any) {
      alert(error.message || "Gagal menghapus catatan");
    }
  };

  // Convert NoteSummary to Note format for edit form
  const noteForEdit = editingNote
    ? {
        id: editingNote.id,
        title: editingNote.title,
        content: editingNote.content,
        userId: editingNote.userId,
        isPublic: editingNote.isPublic,
        isPinned: editingNote.isPinned,
        tags: editingNote.tags,
        createdAt: editingNote.createdAt,
        updatedAt: editingNote.updatedAt,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header with Stats */}
      <PageHeader
        badgeIcon={BookOpen}
        badgeText="Notes Management"
        title="Catatan Saya"
        description="Kelola dan organisir catatan kajian Anda dengan mudah"
        actions={
          !showCreateForm && !editingNote ? (
            <Button onClick={() => setShowCreateForm(true)} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Buat Catatan
            </Button>
          ) : undefined
        }
        stats={
          statistics
            ? [
                {
                  icon: FileText,
                  value: statistics.totalNotes,
                  label: "Total Catatan",
                  color: "blue",
                },
                {
                  icon: Globe,
                  value: statistics.publicNotes,
                  label: "Publik",
                  color: "green",
                },
                {
                  icon: TagIcon,
                  value: statistics.totalTags,
                  label: "Total Tag",
                  color: "purple",
                },
                {
                  icon: Lock,
                  value: statistics.totalNotes - statistics.publicNotes,
                  label: "Pribadi",
                  color: "orange",
                },
              ]
            : undefined
        }
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Usage Banner */}
          {usage && <SubscriptionLimitBanner usage={usage} compact />}

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <NoteSearch availableTags={tags} onSearch={handleSearch} onClear={handleClearSearch} />
            </div>

            {/* Toggle Form Button */}
            {(showCreateForm || editingNote) && (
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingNote(null);
                }}
                size="lg"
              >
                <X className="w-4 h-4 mr-2" />
                Tutup Form
              </Button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center justify-between">
              <p className="text-sm">{error}</p>
              <Button variant="ghost" size="sm" onClick={clearError}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Create Form */}
          {showCreateForm && !editingNote && (
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Buat Catatan Baru</h3>
                    <p className="text-xs text-muted-foreground">Tulis catatan kajian Anda</p>
                  </div>
                </div>
                <NoteForm
                  onSubmit={handleCreateNote}
                  onCancel={() => setShowCreateForm(false)}
                  isSubmitting={isSubmitting}
                />
              </CardContent>
            </Card>
          )}

          {/* Edit Form */}
          {editingNote && (
            <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Edit3 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Edit Catatan</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{editingNote.title}</p>
                  </div>
                </div>
                <NoteForm
                  note={noteForEdit}
                  onSubmit={handleUpdateNote}
                  onCancel={handleCancelEdit}
                  isSubmitting={isSubmitting}
                />
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoading && !userNotes.length && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Memuat catatan...</p>
            </div>
          )}

          {/* Notes List */}
          {!isLoading || userNotes.length > 0 ? (
            <div className="mt-6">
              <NoteList
                notes={userNotes}
                currentUserId={user?.id}
                showActions
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                emptyMessage={
                  showCreateForm
                    ? "Belum ada catatan. Buat catatan pertama Anda di form di atas!"
                    : "Belum ada catatan. Klik tombol 'Buat Catatan' untuk memulai!"
                }
              />
            </div>
          ) : null}

          {/* Help Card */}
          {userNotes.length === 0 && !isLoading && !showCreateForm && (
            <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-card">
              <CardContent className="p-8 text-center">
                <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Mulai Mencatat!</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Belum ada catatan. Klik tombol "Buat Catatan" di atas untuk membuat catatan kajian pertama Anda.
                </p>
                <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
                  <Badge variant="secondary" className="gap-1">
                    <TagIcon className="w-3 h-3" />
                    Gunakan tags
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Globe className="w-3 h-3" />
                    Bagikan publik
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <FileText className="w-3 h-3" />
                    Export PDF
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
