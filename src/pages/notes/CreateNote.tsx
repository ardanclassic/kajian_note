/**
 * CreateNote Page - ENHANCED UI/UX
 * Compact, clean, beautiful, interactive design
 * With Framer Motion animations & mobile responsive
 *
 * UPDATED: Auto-fill materialTitle from reference info to title field
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { NoteForm } from "@/components/features/notes/NoteForm";
import { YouTubeImportModal } from "@/components/features/notes/YouTubeImportModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { createNote } from "@/services/supabase/notes.service";
import type { CreateNoteFormData } from "@/schemas/notes.schema";
import type { YouTubeImportResult } from "@/types/youtube.types";
import { convertTextToHtml } from "@/utils/textToHtml";
import { PenLine, Youtube, Sparkles, FileText, Clock, Video, ChevronLeft, Info, CheckCircle2 } from "lucide-react";

type InputMode = "manual" | "youtube";

/**
 * Generate reference quote block from YouTube import result
 */
const generateReferenceQuote = (result: YouTubeImportResult): string => {
  const { referenceInfo } = result;
  if (!referenceInfo) return "";

  const parts: string[] = ["<p><strong>📚 Sumber Referensi:</strong></p>", "<p>"];

  if (referenceInfo.materialTitle) {
    parts.push(`<strong>Judul:</strong> ${referenceInfo.materialTitle}<br>`);
  }
  if (referenceInfo.speaker) {
    parts.push(`<strong>Narasumber:</strong> ${referenceInfo.speaker}<br>`);
  }
  if (referenceInfo.channelName) {
    parts.push(`<strong>Channel:</strong> ${referenceInfo.channelName}<br>`);
  }
  parts.push(
    `<strong>Link:</strong> <a href="${referenceInfo.videoUrl}" target="_blank" rel="noopener noreferrer">${referenceInfo.videoUrl}</a>`
  );
  parts.push("</p>", "<p></p>");

  return parts.join("");
};

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
};

export default function CreateNote() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("manual");
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedData, setImportedData] = useState<YouTubeImportResult | null>(null);

  const handleImportSuccess = (result: YouTubeImportResult) => {
    setImportedData(result);
    setInputMode("youtube");

    toast.success("Video berhasil diimpor!", {
      description: result.metadata.has_ai_summary
        ? "Ringkasan AI siap untuk ditinjau"
        : "Transcript lengkap siap untuk diedit",
    });
  };

  const handleSubmit = async (data: CreateNoteFormData) => {
    if (!user?.id) {
      toast.error("Sesi berakhir. Silakan login kembali.");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const noteData = {
        title: data.title,
        content: data.content,
        isPublic: data.isPublic,
        tags: data.tags || [],
      };

      if (importedData && inputMode === "youtube") {
        Object.assign(noteData, {
          sourceType: "youtube" as const,
          sourceUrl: importedData.videoUrl,
          sourceMetadata: importedData.metadata,
        });
      }

      const note = await createNote(user.id, noteData);

      toast.success("Catatan berhasil dibuat!", {
        description: importedData ? "Catatan dari YouTube berhasil disimpan" : "Catatan Anda berhasil disimpan",
      });

      navigate(`/notes/${note.id}`);
    } catch (error: any) {
      console.error("Error creating note:", error);
      toast.error("Gagal membuat catatan", {
        description: error.message || "Terjadi kesalahan saat membuat catatan",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/notes");
  };

  const getInitialFormValues = () => {
    if (!importedData || inputMode === "manual") {
      return undefined;
    }

    const formattedContent = convertTextToHtml(importedData.content);
    const referenceQuote = generateReferenceQuote(importedData);
    const finalContent = referenceQuote ? `${formattedContent}${referenceQuote}` : formattedContent;

    // Priority: materialTitle → importedData.title → empty string
    const title = importedData.referenceInfo?.materialTitle || importedData.title || "";

    return {
      title,
      content: finalContent,
      isPublic: false,
    };
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-background to-muted/20"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
    >
      {/* Compact Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <Button variant="ghost" size="sm" onClick={() => navigate("/notes")} className="gap-2 hover:bg-muted/50">
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Kembali</span>
            </Button>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1.5 bg-primary/10 text-primary border-primary/20">
                <PenLine className="w-3 h-3" />
                <span className="hidden sm:inline">Buat Catatan</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Input Mode Selector - Compact */}
          <motion.div variants={cardVariants} transition={{ delay: 0.1 }}>
            <div className="backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row gap-2">
                {/* YouTube Tab */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!importedData) {
                      setShowImportModal(true);
                    } else {
                      setInputMode("youtube");
                    }
                  }}
                  className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                    inputMode === "youtube"
                      ? "border-red-500/50 bg-red-500/10 shadow-sm shadow-red-500/20"
                      : "border-border hover:border-red-500/30 hover:bg-red-500/5"
                  }`}
                >
                  <div className={`p-2 rounded-md ${inputMode === "youtube" ? "bg-red-500/20" : "bg-muted"}`}>
                    <Youtube
                      className={`w-4 h-4 ${inputMode === "youtube" ? "text-red-500" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div className="text-left">
                    <p
                      className={`text-sm font-semibold ${
                        inputMode === "youtube" ? "text-red-500" : "text-foreground"
                      }`}
                    >
                      Import YouTube
                    </p>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {importedData ? "Video diimpor ✓" : "Import video"}
                    </p>
                  </div>
                </motion.button>
              </div>

              {/* Import Button - Compact */}
              {inputMode === "youtube" && !importedData && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 pt-3 border-t border-border"
                >
                  <Button
                    onClick={() => setShowImportModal(true)}
                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                    size="sm"
                  >
                    <Youtube className="w-4 h-4 mr-2" />
                    Pilih Video YouTube
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* YouTube Import Info - Compact */}
          <AnimatePresence>
            {importedData && inputMode === "youtube" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-4 border-red-500/20 bg-gradient-to-br from-red-500/5 to-orange-500/5">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                      <Video className="w-5 h-5 text-red-500" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold flex items-center gap-2">
                            Video Diimpor
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Konten siap ditinjau</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowImportModal(true)}
                          className="text-xs h-7 px-2"
                        >
                          Ganti
                        </Button>
                      </div>

                      {/* Compact Metadata */}
                      <div className="flex flex-wrap gap-1.5">
                        {importedData.metadata.has_ai_summary ? (
                          <Badge
                            variant="secondary"
                            className="text-xs gap-1 bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                          >
                            <Sparkles className="w-3 h-3" />
                            AI Summary
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <FileText className="w-3 h-3" />
                            Transcript
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Clock className="w-3 h-3" />
                          {importedData.metadata.total_segments} segmen
                        </Badge>
                      </div>

                      {/* Reference Info - Compact */}
                      {importedData.referenceInfo && (
                        <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-md">
                          <p className="text-xs font-medium text-green-600 mb-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Referensi ditambahkan
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {importedData.referenceInfo.materialTitle ||
                              importedData.referenceInfo.speaker ||
                              "Info lengkap"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Note Form */}
          <motion.div variants={cardVariants} transition={{ delay: 0.2 }}>
            <NoteForm
              key={importedData?.videoId || "new"}
              note={importedData && inputMode === "youtube" ? (getInitialFormValues() as any) : undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          </motion.div>

          {/* Tips - Collapsible & Compact */}
          <motion.div variants={cardVariants} transition={{ delay: 0.3 }}>
            <Card className="p-4 border-dashed bg-muted/30">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold mb-2">Tips Singkat</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Gunakan tag untuk organisir catatan (max 5 per catatan)</li>
                    <li>• Aktifkan publik untuk berbagi</li>
                    <li>• Import YouTube untuk hemat waktu</li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* YouTube Import Modal */}
      <YouTubeImportModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onImportSuccess={handleImportSuccess}
      />
    </motion.div>
  );
}
