/**
 * Notes Page - Dark Mode with Emerald Glow
 * Updated: Using TopHeader and Gallery Wall View
 * Path: src/pages/notes/index.tsx
 */

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SummaryList } from "@/components/features/note-summary/SummaryList";
import { SummarySearch } from "@/components/features/note-summary/SummarySearch";
import { SubscriptionLimitBanner } from "@/components/features/note-workspace/SubscriptionLimitBanner";
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton";
import { TopHeader } from "@/components/layout/TopHeader";
import {
  Plus,
  FileText,
  Loader2,
  X,
  Sparkles,
  BookOpen,
  Globe,
  Tag,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNotesStore } from "@/store/notesStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import Loading, { PageLoading } from "@/components/common/Loading";

// Types
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
  sourceMetadata?: any; // Added for filtering
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

  if (!user) {
    return <Loading fullscreen />;
  }

  // Header Actions
  const headerActions = (
    <>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 hover:border-emerald-500/50 text-gray-400 hover:text-emerald-400 transition-all disabled:opacity-50 text-sm font-medium"
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        <span className="hidden sm:inline">Refresh</span>
      </button>

      <Button
        onClick={handleCreateNote}
        className="bg-gray-900 text-white border border-emerald-500/50 hover:bg-emerald-500/10 shadow-lg shadow-emerald-500/20 transition-all hover:border-emerald-500"
      >
        <Plus className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">Buat Catatan</span>
      </Button>
    </>
  );

  return (
    <div className="min-h-screen bg-black">
      <TopHeader backButton backTo="/dashboard" actions={headerActions} />

      {/* Page Header */}
      <div className="relative border-b border-gray-900 overflow-hidden">
        {/* Subtle Background Effects */}
        <div className="absolute inset-0 bg-linear-to-b from-gray-900/10 to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/3 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 py-6">
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Title & Stats */}
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-gray-900 border border-emerald-500/50 flex items-center justify-center shadow-lg shadow-emerald-500/10 flex-shrink-0">
                <BookOpen className="w-5 h-5 text-emerald-400" />
              </div>

              {/* Title & Stats */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                  Catatan Kajian
                </h1>
                {statistics && (
                  <div className="flex items-center gap-2 mt-1">
                    <FileText className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-400">{statistics.totalNotes} catatan</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Compact Usage Banner */}
          {usage && <SubscriptionLimitBanner usage={usage} compact />}

          {/* Search & Filter Bar */}
          <SummarySearch availableTags={tags} onSearch={handleSearch} onClear={handleClearSearch} />

          {/* Error Message */}
          {error && (
            <div className="relative bg-black rounded-xl p-4 border border-red-500/50 overflow-hidden">
              <div className="absolute inset-0 bg-red-500/5" />
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center justify-center">
                    <X className="w-4 h-4 text-red-400" />
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
            <PageLoading text="Memuat catatan..." />
          )}

          {/* Notes Gallery Wall */}
          {!isLoading || userNotes.length > 0 ? (
            <div>
              <SummaryList
                notes={userNotes.filter((note) => !note.sourceMetadata?.has_deep_note)}
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
            <div className="relative bg-black rounded-xl p-12 md:p-16 border border-gray-800 border-dashed overflow-hidden">
              {/* Grid Pattern */}
              <div className="absolute inset-0 opacity-[0.015]">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                  }}
                />
              </div>

              {/* Glow Orbs */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/8 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/8 rounded-full blur-3xl" />

              {/* Content */}
              <div className="relative z-10 text-center">
                <div className="inline-flex w-16 h-16 bg-gray-900 border border-emerald-500/50 rounded-xl items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                  <Sparkles className="w-8 h-8 text-emerald-400" />
                </div>

                <h3 className="text-2xl md:text-3xl font-black text-white mb-2">Mulai Mencatat!</h3>

                <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">
                  Belum ada catatan. Klik tombol "Buat Catatan" untuk membuat catatan kajian pertama Anda.
                </p>

                <Button
                  onClick={handleCreateNote}
                  className="mb-6 bg-gray-900 text-white border border-emerald-500/50 hover:bg-emerald-500/10 shadow-lg shadow-emerald-500/20"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Catatan Pertama
                </Button>

                <div className="flex flex-wrap gap-2 justify-center pt-4 border-t border-gray-800">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-gray-800 text-gray-400 rounded-lg text-xs">
                    <Tag className="w-3.5 h-3.5" />
                    Gunakan tags
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-gray-800 text-gray-400 rounded-lg text-xs">
                    <Globe className="w-3.5 h-3.5" />
                    Bagikan publik
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-gray-800 text-gray-400 rounded-lg text-xs">
                    <FileText className="w-3.5 h-3.5" />
                    Export PDF
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ScrollToTopButton />
    </div>
  );
}
