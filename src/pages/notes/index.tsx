/**
 * Notes Page - IMPROVED UI/UX
 * Modern, clean, interactive, and mobile-responsive
 */

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/PageHeader";
import { NoteList } from "@/components/features/notes/NoteList";
import { NoteSearch } from "@/components/features/notes/NoteSearch";
import { SubscriptionLimitBanner } from "@/components/features/notes/SubscriptionLimitBanner";
import { Plus, FileText, Loader2, X, Sparkles, BookOpen, Globe, Lock, Tag as TagIcon, TrendingUp } from "lucide-react";
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
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Handle create note
  const handleCreateNote = () => {
    navigate("/notes/new");
  };

  // Handle view note
  const handleViewNote = (note: NoteSummary) => {
    navigate(`/notes/${note.id}`);
  };

  // Handle edit note
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

  // Handle refresh
  const handleRefresh = async () => {
    if (!user?.id || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchUserNotes(user.id),
        fetchStatistics(user.id),
        fetchUserTags(user.id),
        fetchUsage(user.id),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-primary/5">
      {/* Page Header with Stats */}
      <PageHeader
        badgeIcon={BookOpen}
        badgeText="Notes Management"
        title="Catatan Kajian"
        description="Kelola dan organisir catatan kajian Anda dengan mudah"
        showBackButton
        backTo="/dashboard"
        backLabel="Dashboard"
        actions={
          <Button onClick={handleCreateNote} size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Buat Catatan</span>
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
                  icon: Lock,
                  value: statistics.totalNotes - statistics.publicNotes,
                  label: "Pribadi",
                  color: "orange",
                },
                {
                  icon: TagIcon,
                  value: statistics.totalTags,
                  label: "Total Tag",
                  color: "purple",
                },
              ]
            : undefined
        }
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Usage Banner */}
          {usage && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <SubscriptionLimitBanner usage={usage} compact />
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <NoteSearch availableTags={tags} onSearch={handleSearch} onClear={handleClearSearch} />
              </CardContent>
            </Card>
          </div>

          {/* Error Message */}
          {error && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-destructive/10 rounded-full">
                        <X className="w-5 h-5 text-destructive" />
                      </div>
                      <p className="text-sm font-medium text-destructive">{error}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearError}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !userNotes.length && (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                <Loader2 className="w-12 h-12 animate-spin text-primary relative" />
              </div>
              <p className="text-muted-foreground mt-6 font-medium">Memuat catatan...</p>
            </div>
          )}

          {/* Notes List */}
          {!isLoading || userNotes.length > 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
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
            <div className="animate-in fade-in zoom-in-95 duration-700 delay-300">
              <Card className="border-2 border-dashed border-primary/30 bg-linear-to-br from-primary/5 via-background to-primary/10 shadow-lg hover:shadow-xl transition-all hover:border-primary/50">
                <CardContent className="p-8 md:p-12 text-center">
                  <div className="inline-flex p-6 bg-linear-to-br from-primary/20 to-primary/10 rounded-full mb-6 animate-pulse">
                    <Sparkles className="w-12 h-12 text-primary" />
                  </div>

                  <h3 className="text-2xl font-bold mb-3 bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Mulai Mencatat!
                  </h3>

                  <p className="text-muted-foreground mb-8 max-w-md mx-auto text-base">
                    Belum ada catatan. Klik tombol "Buat Catatan" di atas untuk membuat catatan kajian pertama Anda.
                  </p>

                  <Button
                    onClick={handleCreateNote}
                    size="xl"
                    className="mb-8 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    <Plus className="w-5 h-5" />
                    Buat Catatan Pertama
                  </Button>

                  <div className="flex flex-wrap gap-3 justify-center pt-6 border-t border-primary/10">
                    <Badge variant="secondary" className="gap-2 px-4 py-2 text-sm">
                      <TagIcon className="w-4 h-4" />
                      Gunakan tags
                    </Badge>
                    <Badge variant="secondary" className="gap-2 px-4 py-2 text-sm">
                      <Globe className="w-4 h-4" />
                      Bagikan publik
                    </Badge>
                    <Badge variant="secondary" className="gap-2 px-4 py-2 text-sm">
                      <FileText className="w-4 h-4" />
                      Export PDF
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Stats - Show when has notes */}
          {userNotes.length > 0 && statistics && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
              <Card className="bg-linear-to-r from-primary/5 to-primary/10 py-3">
                <CardContent>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">
                        Total {statistics.totalNotes} catatan dengan {statistics.totalTags} tag
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                      <Loader2 className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
