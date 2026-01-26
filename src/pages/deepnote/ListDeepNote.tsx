/**
 * Deep Note List Page
 * Path: src/pages/deepnote/ListDeepNote.tsx
 */

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DeepNoteList } from "@/components/features/deep-note/DeepNoteList";
import { NoteSearch } from "@/components/features/notes/list/NoteSearch";
import { SubscriptionLimitBanner } from "@/components/features/notes/common/SubscriptionLimitBanner";
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton";
import { TopHeader } from "@/components/layout/TopHeader";
import {
  Plus,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNotesStore } from "@/store/notesStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import Loading, { PageLoading } from "@/components/common/Loading";
import { toast } from "sonner";
import type { NoteSummary, NoteFilterOptions, NoteSortOptions } from "@/types/notes.types";

export default function ListDeepNote() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    userNotes,
    isLoading,
    error,
    currentPage,
    totalPages,
    fetchUserNotes,
    deleteNote,
    fetchStatistics,
    fetchUserTags,
    setPage,
  } = useNotesStore();
  const { usage, fetchUsage } = useSubscriptionStore();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Local state for client-side filtering (if needed) or passing to search component
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch initial data
  useEffect(() => {
    if (user?.id) {
      fetchUserNotes(user.id);
      fetchStatistics(user.id);
      fetchUserTags(user.id);
      fetchUsage(user.id);
    }
  }, [user?.id]);

  // Handle Search & Filter - mirroring the logic in Notes page but relying on fetchUserNotes
  const handleSearch = useCallback(
    (filters: NoteFilterOptions, sort: NoteSortOptions) => {
      if (user?.id) {
        fetchUserNotes(user.id, 1, filters, sort);
        if (filters.search) setSearchQuery(filters.search);
      }
    },
    [user?.id, fetchUserNotes]
  );

  const handleClearSearch = useCallback(() => {
    if (user?.id) {
      setSearchQuery("");
      fetchUserNotes(user.id, 1);
    }
  }, [user?.id, fetchUserNotes]);


  // Filter ONLY Deep Notes from the fetched result
  const deepNotes = userNotes.filter((note) => {
    return note.sourceMetadata?.has_deep_note === true;
  });

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
  const handleCreateDeepNote = () => {
    navigate("/deep-note/create");
  };

  // Handle view note
  const handleViewNote = (note: NoteSummary) => {
    navigate(`/deep-note/${note.id}`);
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
      toast.success("Deep Note dihapus");
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus note");
    }
  };

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

  if (!user) return <Loading fullscreen />;

  // Action buttons for TopHeader
  const headerActions = (
    <>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 hover:border-purple-500/50 text-gray-400 hover:text-purple-400 transition-all disabled:opacity-50 text-sm font-medium"
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        <span className="hidden sm:inline">Refresh</span>
      </button>
      <Button
        onClick={handleCreateDeepNote}
        className="bg-purple-600 text-white border border-purple-400/50 hover:bg-purple-500 shadow-lg shadow-purple-500/20 transition-all"
      >
        <Plus className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">Buat Deep Note</span>
      </Button>
    </>
  );

  return (
    <div className="min-h-screen bg-black">
      <TopHeader
        backButton
        backTo="/dashboard"
        actions={headerActions}
      // Title is rendered in Page Header below for consistency with design, 
      // but TopHeader supports title if we want to move it there.
      />

      {/* Page Header (Hero style) */}
      <div className="relative border-b border-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-purple-900/10 to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="relative container mx-auto px-4 py-6">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-900 border border-purple-500/50 flex items-center justify-center shadow-lg shadow-purple-500/10 shrink-0">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                  Deep Notes
                </h1>
                <p className="text-sm text-gray-400">Kumpulan catatan mendalam hasil analisis AI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {usage && <SubscriptionLimitBanner usage={usage} compact />}

          {/* Search & Filter */}
          <NoteSearch availableTags={userNotes.flatMap(n => n.tags)} onSearch={handleSearch} onClear={handleClearSearch} />

          {/* Loading State */}
          {isLoading && !deepNotes.length && (
            <PageLoading text="Memuat Deep Notes..." />
          )}

          {/* Deep Notes List */}
          {(!isLoading || deepNotes.length > 0) && (
            <DeepNoteList
              notes={deepNotes}
              currentUserId={user.id}
              showActions
              onClick={handleViewNote}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      <ScrollToTopButton />
    </div>
  );
}
