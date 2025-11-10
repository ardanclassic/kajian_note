/**
 * Notes Page - FIXED TYPE ERRORS
 * List notes only - create/edit/view in separate pages
 * Path: src/pages/Notes.tsx
 * Route: /notes
 */

import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/PageHeader";
import { NoteList } from "@/components/features/notes/NoteList";
import { NoteSearch } from "@/components/features/notes/NoteSearch";
import { SubscriptionLimitBanner } from "@/components/features/notes/SubscriptionLimitBanner";
import { Plus, FileText, Loader2, X, Sparkles, BookOpen, Globe, Lock, Tag as TagIcon } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNotesStore } from "@/store/notesStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import type { NoteFilterOptions, NoteSortOptions, NoteSummary } from "@/types/notes.types";

export default function Notes() {
  const navigate = useNavigate();
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
    deleteNote,
    fetchStatistics,
    fetchUserTags,
    setPage,
    clearError,
  } = useNotesStore();

  const { usage, fetchUsage } = useSubscriptionStore();

  // Fetch initial data
  useEffect(() => {
    if (user?.id) {
      fetchUserNotes(user.id);
      fetchStatistics(user.id);
      fetchUserTags(user.id);
      fetchUsage(user.id);
    }
  }, [user?.id]);

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

  // Handle create note - navigate to create page
  const handleCreateNote = () => {
    navigate("/notes/new");
  };

  // Handle view note - navigate to detail page
  const handleViewNote = (note: NoteSummary) => {
    navigate(`/notes/${note.id}`);
  };

  // Handle edit note - navigate to edit page
  const handleEditNote = (note: NoteSummary) => {
    navigate(`/notes/${note.id}/edit`);
  };

  // Handle delete note
  const handleDeleteNote = async (noteId: string) => {
    if (!user?.id) return;

    try {
      await deleteNote(noteId, user.id);

      // Refresh data
      await Promise.all([fetchUserTags(user.id), fetchStatistics(user.id), fetchUsage(user.id)]);
    } catch (error: any) {
      alert(error.message || "Gagal menghapus catatan");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header with Stats */}
      <PageHeader
        badgeIcon={BookOpen}
        badgeText="Notes Management"
        title="Catatan Saya"
        description="Kelola dan organisir catatan kajian Anda dengan mudah"
        actions={
          <Button onClick={handleCreateNote} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Buat Catatan
          </Button>
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
                onClick={handleViewNote}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                emptyMessage="Belum ada catatan. Klik tombol 'Buat Catatan' untuk memulai!"
              />
            </div>
          ) : null}

          {/* Empty State - First Time User */}
          {userNotes.length === 0 && !isLoading && (
            <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-card">
              <CardContent className="p-8 text-center">
                <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Mulai Mencatat!</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Belum ada catatan. Klik tombol "Buat Catatan" di atas untuk membuat catatan kajian pertama Anda.
                </p>
                <Button onClick={handleCreateNote} size="lg" className="mb-6">
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Catatan Pertama
                </Button>
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
