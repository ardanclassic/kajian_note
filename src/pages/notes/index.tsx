/**
 * Notes Page - Dark Mode with Emerald Glow
 * Refactored: Following design-guidelines.md
 * ✅ Pure black background
 * ✅ Emerald glow accents
 * ✅ Modern, clean interface
 */

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { NoteList } from "@/components/features/notes/NoteList";
import { NoteSearch } from "@/components/features/notes/NoteSearch";
import { SubscriptionLimitBanner } from "@/components/features/notes/SubscriptionLimitBanner";
import { Plus, FileText, Loader2, X, Sparkles, BookOpen, Globe, Lock, Tag, TrendingUp, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNotesStore } from "@/store/notesStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";

// Types (akan diimport dari project)
interface NoteFilterOptions {
  search?: string;
  tags?: string[];
  isPublic?: boolean;
  isPinned?: boolean;
}

interface NoteSortOptions {
  field: string;
  order: "asc" | "desc";
}

interface NoteSummary {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPublic: boolean;
  isPinned: boolean;
  createdAt: string;
  userId: string;
}

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
    <div className="min-h-screen bg-black">
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
          <Button
            onClick={handleCreateNote}
            className="bg-gray-900 text-white border border-emerald-500/50 hover:bg-emerald-500/10 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
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
              ]
            : undefined
        }
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Usage Banner */}
          {usage && (
            <div>
              <SubscriptionLimitBanner usage={usage} compact />
            </div>
          )}

          {/* Search & Filter Bar */}
          <div>
            <NoteSearch availableTags={tags} onSearch={handleSearch} onClear={handleClearSearch} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="relative bg-black rounded-2xl p-6 border border-red-500/50 overflow-hidden">
              <div className="absolute inset-0 bg-red-500/5" />
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center justify-center">
                    <X className="w-5 h-5 text-red-400" />
                  </div>
                  <p className="text-sm font-medium text-red-400">{error}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !userNotes.length && (
            <div className="relative bg-black rounded-2xl p-20 border border-gray-800 overflow-hidden">
              {/* Glow Orb */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />

              <div className="relative z-10 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-400 mb-6" />
                <p className="text-gray-400 font-medium">Memuat catatan...</p>
              </div>
            </div>
          )}

          {/* Notes List */}
          {!isLoading || userNotes.length > 0 ? (
            <div>
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
            <div className="relative bg-black rounded-2xl p-12 md:p-16 border border-gray-800 border-dashed overflow-hidden">
              {/* Grid Pattern */}
              <div className="absolute inset-0 opacity-[0.015]">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)",
                    backgroundSize: "80px 80px",
                  }}
                />
              </div>

              {/* Glow Orbs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

              {/* Content */}
              <div className="relative z-10 text-center">
                <div className="inline-flex w-20 h-20 bg-gray-900 border border-emerald-500/50 rounded-2xl items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                  <Sparkles className="w-10 h-10 text-emerald-400" />
                </div>

                <h3 className="text-3xl font-black text-white mb-3">Mulai Mencatat!</h3>

                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Belum ada catatan. Klik tombol "Buat Catatan" di atas untuk membuat catatan kajian pertama Anda.
                </p>

                <Button
                  onClick={handleCreateNote}
                  className="mb-8 bg-gray-900 text-white border border-emerald-500/50 hover:bg-emerald-500/10 shadow-lg shadow-emerald-500/20 px-8 py-6 text-base"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Buat Catatan Pertama
                </Button>

                <div className="flex flex-wrap gap-3 justify-center pt-6 border-t border-gray-800">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 text-gray-400 rounded-lg text-sm">
                    <Tag className="w-4 h-4" />
                    Gunakan tags
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 text-gray-400 rounded-lg text-sm">
                    <Globe className="w-4 h-4" />
                    Bagikan publik
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 text-gray-400 rounded-lg text-sm">
                    <FileText className="w-4 h-4" />
                    Export PDF
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          {userNotes.length > 0 && statistics && (
            <div className="relative bg-gray-900 rounded-2xl p-6 border border-gray-800 overflow-hidden">
              {/* Content */}
              <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black border border-emerald-500/50 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Total {statistics.totalNotes} catatan</p>
                    <p className="text-xs text-gray-500">Terus berkembang</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
