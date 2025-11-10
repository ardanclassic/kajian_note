/**
 * NoteList Component - UPDATED
 * Display list of notes with pagination and onClick support
 * Path: src/components/features/notes/NoteList.tsx
 */

import { NoteCard } from "./NoteCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import type { NoteSummary } from "@/types/notes.types";

interface NoteListProps {
  notes: NoteSummary[];
  currentUserId?: string;
  showAuthor?: boolean;
  showActions?: boolean;
  isPinnable?: boolean;
  onClick?: (note: NoteSummary) => void; // NEW: Handle card click
  onEdit?: (note: NoteSummary) => void;
  onDelete?: (noteId: string) => void;
  onTogglePin?: (noteId: string, isPinned: boolean) => void;

  // Pagination
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;

  // Empty state
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

export function NoteList({
  notes,
  currentUserId,
  showAuthor = false,
  showActions = false,
  isPinnable = false,
  onClick, // NEW
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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        {emptyIcon || <FileText className="w-12 h-12 text-muted-foreground mb-4" />}
        <h3 className="text-lg font-semibold mb-2">Tidak Ada Catatan</h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  // Separate pinned and regular notes
  const pinnedNotes = notes.filter((note) => note.isPinned);
  const regularNotes = notes.filter((note) => !note.isPinned);

  return (
    <div className="space-y-6">
      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Pinned Notes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">All Notes</h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                showAuthor={showAuthor}
                showActions={showActions}
                isOwner={currentUserId === note.userId}
                isPinnable={isPinnable}
                onClick={onClick} // NEW: Pass onClick
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
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </Button>

          <div className="flex items-center gap-1">
            {/* First page */}
            {currentPage > 3 && (
              <>
                <Button variant="outline" size="sm" onClick={() => onPageChange(1)} className="w-9">
                  1
                </Button>
                {currentPage > 4 && <span className="px-2 text-muted-foreground">...</span>}
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
                  className="w-9"
                >
                  {page}
                </Button>
              ))}

            {/* Last page */}
            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && <span className="px-2 text-muted-foreground">...</span>}
                <Button variant="outline" size="sm" onClick={() => onPageChange(totalPages)} className="w-9">
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
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Page info */}
      {totalPages > 1 && (
        <p className="text-center text-sm text-muted-foreground">
          Halaman {currentPage} dari {totalPages}
        </p>
      )}
    </div>
  );
}
