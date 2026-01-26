/**
 * DeepNoteList Component
 * Gallery view specifically for Deep Notes
 */

import { motion, AnimatePresence } from "framer-motion";
import { NoteCard } from "@/components/features/notes/common/NoteCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, FileText, Pin, Sparkles } from "lucide-react";
import type { NoteSummary } from "@/types/notes.types";

interface DeepNoteListProps {
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

export function DeepNoteList({
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
  emptyMessage = "Belum ada Deep Note",
  emptyIcon,
}: DeepNoteListProps) {
  // Empty state
  if (notes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
          {emptyIcon || <Sparkles className="w-8 h-8 text-purple-400" />}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Tidak Ada Deep Note</h3>
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
            <div className="w-8 h-8 rounded-lg bg-gray-900 border border-purple-500/50 flex items-center justify-center shadow-lg shadow-purple-500/10">
              <Pin className="w-4 h-4 text-purple-400" />
            </div>
            <h2 className="text-sm font-bold text-purple-400 uppercase tracking-wider">Deep Note Pilihan</h2>
            <div className="h-px flex-1 bg-linear-to-r from-purple-500/50 to-transparent" />
          </motion.div>

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
          {/* Section Header */}
          {pinnedNotes.length > 0 && (
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-gray-500" />
              </div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Semua Deep Note</h2>
              <div className="h-px flex-1 bg-linear-to-r from-gray-800 to-transparent" />
            </motion.div>
          )}

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

      {/* Pagination (Same as List) */}
      {totalPages > 1 && onPageChange && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col items-center gap-4 pt-8 border-t border-gray-900"
        >
          {/* Simple pagination for brevity - can copy full pagination if needed */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-400">Page {currentPage} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
