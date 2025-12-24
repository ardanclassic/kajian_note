/**
 * NoteList Component - Pinterest-Style Gallery
 * Pure CSS Grid Layout (NO external masonry library)
 * ✨ Responsive: 1 → 2 → 3 columns
 * ✨ Natural height variation
 * ✨ Smooth Framer Motion animations
 * ✨ Dark mode with Emerald glow
 */

import { motion, AnimatePresence } from "framer-motion";
import { NoteCard } from "@/components/features/note-workspace/NoteCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, FileText, Pin } from "lucide-react";
import type { NoteSummary } from "@/types/notes.types";

interface SummaryListProps {
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

export function SummaryList({
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
}: SummaryListProps) {
  // Empty state
  if (notes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mb-6">
          {emptyIcon || <FileText className="w-8 h-8 text-gray-600" />}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Tidak Ada Catatan</h3>
        <p className="text-gray-400 max-w-sm">{emptyMessage}</p>
      </motion.div>
    );
  }

  // Separate pinned and regular notes
  const pinnedNotes = notes.filter((note) => note.isPinned);
  const regularNotes = notes.filter((note) => !note.isPinned);

  // Animation variants
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const itemVariants: any = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-5">
          {/* Section Header */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-8 h-8 rounded-lg bg-gray-900 border border-emerald-500/50 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Pin className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Catatan Tersimpan</h2>
            <div className="h-px flex-1 bg-linear-to-r from-emerald-500/50 to-transparent" />
          </motion.div>

          {/* Pure CSS Grid - Pinterest Style */}
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-auto">
            <AnimatePresence mode="popLayout">
              {pinnedNotes.map((note) => (
                <motion.div key={note.id} variants={itemVariants} layout layoutId={`pinned-${note.id}`}>
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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Regular Notes Section */}
      {regularNotes.length > 0 && (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-5">
          {/* Section Header (only if there are pinned notes) */}
          {pinnedNotes.length > 0 && (
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center">
                <FileText className="w-4 h-4 text-gray-500" />
              </div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Semua Catatan</h2>
              <div className="h-px flex-1 bg-linear-to-r from-gray-800 to-transparent" />
            </motion.div>
          )}

          {/* Pure CSS Grid - Pinterest Style */}
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-auto">
            <AnimatePresence mode="popLayout">
              {regularNotes.map((note) => (
                <motion.div key={note.id} variants={itemVariants} layout layoutId={`regular-${note.id}`}>
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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col items-center gap-4 pt-8 border-t border-gray-900"
        >
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* Previous Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="shadow-sm hover:shadow-lg hover:border-emerald-500/50 transition-all bg-gray-900 border-gray-800 text-gray-400 hover:text-emerald-400 disabled:opacity-30 disabled:hover:border-gray-800"
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
                    className="w-10 shadow-sm hover:shadow-lg hover:border-emerald-500/50 transition-all bg-gray-900 border-gray-800 text-gray-400 hover:text-emerald-400"
                  >
                    1
                  </Button>
                  {currentPage > 4 && <span className="px-2 text-gray-600 font-medium">···</span>}
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
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/20 scale-110"
                        : "bg-gray-900 border-gray-800 text-gray-400 hover:border-emerald-500/50 hover:text-emerald-400 shadow-sm hover:shadow-lg"
                    }`}
                  >
                    {page}
                  </Button>
                ))}

              {/* Last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && <span className="px-2 text-gray-600 font-medium">···</span>}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    className="w-10 shadow-sm hover:shadow-lg hover:border-emerald-500/50 transition-all bg-gray-900 border-gray-800 text-gray-400 hover:text-emerald-400"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>

            {/* Next Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="shadow-sm hover:shadow-lg hover:border-emerald-500/50 transition-all bg-gray-900 border-gray-800 text-gray-400 hover:text-emerald-400 disabled:opacity-30 disabled:hover:border-gray-800"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Page info */}
          <p className="text-sm text-gray-500 font-medium">
            Halaman <span className="text-emerald-400 font-bold">{currentPage}</span> dari{" "}
            <span className="text-emerald-400 font-bold">{totalPages}</span>
          </p>
        </motion.div>
      )}
    </div>
  );
}
