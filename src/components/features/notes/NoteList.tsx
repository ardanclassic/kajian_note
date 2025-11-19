/**
 * NoteList Component - IMPROVED UI/UX
 * Modern, responsive grid layout with smooth animations
 */

import { NoteCard } from "./NoteCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, FileText, Pin } from "lucide-react";
import type { NoteSummary } from "@/types/notes.types";

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
      <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="p-6 bg-muted/50 rounded-full mb-6">
          {emptyIcon || <FileText className="w-12 h-12 text-muted-foreground" />}
        </div>
        <h3 className="text-xl font-semibold mb-2">Tidak Ada Catatan</h3>
        <p className="text-muted-foreground max-w-sm">{emptyMessage}</p>
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
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 px-1">
            <Pin className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider">Catatan Tersimpan</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {pinnedNotes.map((note, index) => (
              <div
                key={note.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <NoteCard
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Notes */}
      {regularNotes.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          {pinnedNotes.length > 0 && (
            <div className="flex items-center gap-2 px-1">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Semua Catatan</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-muted-foreground/30 to-transparent" />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {regularNotes.map((note, index) => (
              <div
                key={note.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <NoteCard
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex flex-col items-center gap-4 pt-6 animate-in fade-in duration-500 delay-200">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </Button>

            <div className="flex items-center gap-1">
              {/* First page */}
              {currentPage > 3 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(1)}
                    className="w-10 shadow-sm hover:shadow-md transition-shadow"
                  >
                    1
                  </Button>
                  {currentPage > 4 && <span className="px-2 text-muted-foreground font-medium">···</span>}
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
                    className={`w-10 shadow-sm transition-all ${
                      page === currentPage ? "shadow-lg scale-110" : "hover:shadow-md"
                    }`}
                  >
                    {page}
                  </Button>
                ))}

              {/* Last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && <span className="px-2 text-muted-foreground font-medium">···</span>}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    className="w-10 shadow-sm hover:shadow-md transition-shadow"
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
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Page info */}
          <p className="text-sm text-muted-foreground font-medium">
            Halaman <span className="text-foreground font-bold">{currentPage}</span> dari{" "}
            <span className="text-foreground font-bold">{totalPages}</span>
          </p>
        </div>
      )}
    </div>
  );
}
