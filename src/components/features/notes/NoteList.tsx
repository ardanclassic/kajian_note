/**
 * NoteList Component - Dark Mode with Emerald Glow
 * Refactored: Following design-guidelines.md
 * ✅ Pure black background
 * ✅ Emerald glow accents
 * ✅ Smooth animations
 */

import { NoteCard } from "./NoteCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, FileText, Pin } from "lucide-react";

// Types (akan diimport dari project)
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

interface NoteListProps {
  notes: NoteSummary[];
  currentUserId?: string;
  showAuthor?: boolean;
  showActions?: boolean;
  isPinnable?: boolean;
  onClick?: (note: NoteSummary) => void;
  onEdit?: (note: NoteSummary) => void;
  onDelete?: (noteId: string) => void;
  onTogglePin?: (noteId: string, isPinned: boolean) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

export function NoteList({
  notes,
  currentUserId,
  showAuthor = false,
  showActions = false,
  isPinnable = false,
  onClick,
  onEdit,
  onDelete,
  onTogglePin,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  emptyMessage = "Belum ada catatan",
  emptyIcon,
}: NoteListProps) {
  // Empty state
  if (notes.length === 0) {
    return (
      <div className="relative bg-black rounded-2xl p-16 border border-gray-800 overflow-hidden">
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

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center mb-6">
            {emptyIcon || <FileText className="w-10 h-10 text-gray-600" />}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Tidak Ada Catatan</h3>
          <p className="text-gray-400 max-w-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Separate pinned and regular notes
  const pinnedNotes = notes.filter((note) => note.isPinned);
  const regularNotes = notes.filter((note) => !note.isPinned);

  return (
    <div className="space-y-8">
      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 border border-emerald-500/50 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Pin className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Catatan Tersimpan</h2>
              <div className="h-px bg-linear-to-r from-emerald-500/50 to-transparent mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                showAuthor={showAuthor}
                showActions={showActions}
                isOwner={currentUserId === note.userId}
                isPinnable={isPinnable}
                onClick={onClick}
                onEdit={onEdit}
                onDelete={onDelete}
                onTogglePin={onTogglePin}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Notes */}
      {regularNotes.length > 0 && (
        <div className="space-y-4">
          {pinnedNotes.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Semua Catatan</h2>
                <div className="h-px bg-linear-to-r from-gray-800 to-transparent mt-1" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                showAuthor={showAuthor}
                showActions={showActions}
                isOwner={currentUserId === note.userId}
                isPinnable={isPinnable}
                onClick={onClick}
                onEdit={onEdit}
                onDelete={onDelete}
                onTogglePin={onTogglePin}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex flex-col items-center gap-4 pt-8">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-transparent border-gray-800 text-white hover:bg-gray-900 hover:border-emerald-500/30 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Prev</span>
            </Button>

            <div className="flex items-center gap-1">
              {/* First page */}
              {currentPage > 3 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(1)}
                    className="w-10 bg-transparent border-gray-800 text-white hover:bg-gray-900 hover:border-emerald-500/30"
                  >
                    1
                  </Button>
                  {currentPage > 4 && <span className="px-2 text-gray-600 font-bold">···</span>}
                </>
              )}

              {/* Pages around current */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return page === currentPage || Math.abs(page - currentPage) <= 1;
                })
                .map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className={`w-10 transition-all ${
                      page === currentPage
                        ? "bg-gray-900 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/20 scale-110"
                        : "bg-transparent border-gray-800 text-white hover:bg-gray-900 hover:border-emerald-500/30"
                    }`}
                  >
                    {page}
                  </Button>
                ))}

              {/* Last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && <span className="px-2 text-gray-600 font-bold">···</span>}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    className="w-10 bg-transparent border-gray-800 text-white hover:bg-gray-900 hover:border-emerald-500/30"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-transparent border-gray-800 text-white hover:bg-gray-900 hover:border-emerald-500/30 disabled:opacity-30"
            >
              <span className="hidden sm:inline mr-1">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Page info */}
          <p className="text-sm text-gray-500 font-medium">
            Halaman <span className="text-emerald-400 font-bold">{currentPage}</span> dari{" "}
            <span className="text-white font-bold">{totalPages}</span>
          </p>
        </div>
      )}
    </div>
  );
}
