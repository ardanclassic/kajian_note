/**
 * NoteDetail Page
 * View and edit single note
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NoteForm } from "@/components/features/notes/NoteForm";
import { ArrowLeft, Edit, Trash2, Globe, Lock, Pin, Calendar, Clock, Loader2, FileDown } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNotesStore } from "@/store/notesStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import type { UpdateNoteData } from "@/types/notes.types";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentNote, isLoading, error, fetchNoteById, updateNote, deleteNote, clearCurrentNote, clearError } =
    useNotesStore();
  const { usage, fetchUsage, checkCanExportPDF, checkCanExportWord } = useSubscriptionStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user?.id === currentNote?.userId;

  // Fetch note on mount
  useEffect(() => {
    if (id) {
      fetchNoteById(id);
    }

    return () => {
      clearCurrentNote();
    };
  }, [id, fetchNoteById, clearCurrentNote]);

  // Fetch usage
  useEffect(() => {
    if (user?.id) {
      fetchUsage(user.id);
    }
  }, [user?.id, fetchUsage]);

  // Handle update note
  const handleUpdateNote = async (data: UpdateNoteData) => {
    if (!user?.id || !id) return;

    try {
      setIsUpdating(true);
      await updateNote(id, user.id, data);
      setIsEditing(false);
    } catch (error: any) {
      alert(error.message || "Gagal mengubah catatan");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete note
  const handleDeleteNote = async () => {
    if (!user?.id || !id) return;

    const confirmed = window.confirm("Yakin ingin menghapus catatan ini?");
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deleteNote(id, user.id);
      navigate("/notes");
    } catch (error: any) {
      alert(error.message || "Gagal menghapus catatan");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle export
  const handleExport = async (format: "pdf" | "word") => {
    if (!user?.id) return;

    try {
      if (format === "pdf") {
        const canExport = await checkCanExportPDF(user.id);
        if (!canExport.allowed) {
          alert(canExport.message);
          return;
        }
      } else if (format === "word") {
        const canExport = await checkCanExportWord(user.id);
        if (!canExport.allowed) {
          alert(canExport.message);
          return;
        }
      }

      // TODO: Implement actual export functionality
      alert(`Export ${format.toUpperCase()} akan segera tersedia`);
    } catch (error: any) {
      alert(error.message || "Gagal export catatan");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !currentNote) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Catatan Tidak Ditemukan</h2>
          <p className="text-muted-foreground mb-6">{error || "Catatan yang Anda cari tidak ada"}</p>
          <Button asChild>
            <Link to="/notes">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Catatan
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Edit mode
  if (isEditing && isOwner) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setIsEditing(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Batal Edit
          </Button>
        </div>

        <NoteForm
          note={currentNote}
          onSubmit={handleUpdateNote}
          onCancel={() => setIsEditing(false)}
          isSubmitting={isUpdating}
        />
      </div>
    );
  }

  // View mode
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link to="/notes">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Link>
        </Button>
      </div>

      {/* Note Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 mb-4">
            <CardTitle className="text-3xl flex-1">{currentNote.title}</CardTitle>

            {/* Actions (Owner only) */}
            {isOwner && (
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" onClick={handleDeleteNote} disabled={isDeleting}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus
                </Button>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {/* Visibility */}
            <Badge variant="outline">
              {currentNote.isPublic ? (
                <>
                  <Globe className="w-3 h-3 mr-1" />
                  Publik
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 mr-1" />
                  Pribadi
                </>
              )}
            </Badge>

            {/* Pinned */}
            {currentNote.isPinned && (
              <Badge variant="secondary">
                <Pin className="w-3 h-3 mr-1" />
                Pinned
              </Badge>
            )}

            {/* Created */}
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(currentNote.createdAt), "dd MMMM yyyy", { locale: idLocale })}
            </span>

            {/* Updated */}
            {currentNote.updatedAt !== currentNote.createdAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Diubah {format(new Date(currentNote.updatedAt), "dd MMM yyyy", { locale: idLocale })}
              </span>
            )}
          </div>

          {/* Tags */}
          {currentNote.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {currentNote.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Content */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="whitespace-pre-wrap">{currentNote.content}</div>
          </div>

          {/* Export Options (Owner only) */}
          {isOwner && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-sm font-semibold mb-3">Export Catatan</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("pdf")}
                  disabled={usage?.tier === "free"}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Export PDF
                  {usage?.tier === "free" && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Premium
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("word")}
                  disabled={usage?.tier !== "advance"}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Export Word
                  {usage?.tier !== "advance" && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Advance
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
