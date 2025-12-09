/**
 * CreateNote Page - ENHANCED UI/UX
 * Compact, clean, beautiful, interactive design
 * With Framer Motion animations & mobile responsive
 *
 * UPDATED:
 * - Fixed content not appearing in Tiptap (convertTextToHtml issue)
 * - Added manual speaker input when speaker_name is "unknown"
 * - Better content + reference combination
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
import { PenLine, Youtube, Sparkles, FileText, ChevronLeft, Info } from "lucide-react";

type InputMode = "manual" | "youtube";

/**
 * Generate enhanced reference block from YouTube import result
 * Speaker already included from modal input if it was unknown
 */
const generateReferenceQuote = (result: YouTubeImportResult): string => {
  const { referenceInfo, metadata } = result;
  if (!referenceInfo) return "";

  const parts: string[] = [];

  // Start reference section with horizontal line separator
  parts.push("<hr>", "<br>");

  // Header
  parts.push('<h2>📚 Sumber Referensi</h2>');

  // Create card-like container
  parts.push(
    '<div style="padding: 16px; margin-bottom: 16px;">'
  );

  // Thumbnail (if available)
  if (referenceInfo.thumbnailUrl) {
    parts.push(
      `<div style="margin-bottom: 12px;">`,
      `<img src="${referenceInfo.thumbnailUrl}" alt="${referenceInfo.title}" />`,
      `</div>`
    );
  }

  // Video Title
  parts.push(
    `<p style="margin-bottom: 5px;"><strong>Judul:</strong> ${referenceInfo.title}</p>`
  );

  // Speaker/Pemateri - Already processed from modal
  const speakerName = referenceInfo.speaker;
  if (speakerName && speakerName !== "Unknown") {
    parts.push(`<p style="margin-bottom: 5px;"><strong>Pemateri:</strong> ${speakerName}</p>`);
  }

  // Channel
  parts.push(
    `<p style="margin-bottom: 5px;"><strong>Channel:</strong> ${referenceInfo.channelName}</p>`
  );

  // Link
  parts.push(
    `<p style="margin-bottom: 0;"><strong>Link:</strong> <a href="${referenceInfo.videoUrl}" target="_blank" rel="noopener noreferrer" style="color: #ef4444; text-decoration: underline;">${referenceInfo.videoUrl}</a></p>`
  );

  // Close container
  parts.push("</div>");

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

  const handleImportSuccess = async (result: YouTubeImportResult) => {
    // Validate content
    if (!result.content || result.content.trim().length < 10) {
      toast.error("Content kosong dari API");
      console.error("Empty content:", result);
      return;
    }

    setImportedData(result);
    setInputMode("youtube");

    // Force re-render dengan small delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    toast.success("Video berhasil diimpor!");
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

    // FIXED: Handle content properly
    let formattedContent = "";

    // Check if content is already HTML or plain text
    if (importedData.content.includes("<p>") || importedData.content.includes("<br>")) {
      // Already HTML, use as-is
      formattedContent = importedData.content;
    } else {
      // Plain text, convert to HTML
      formattedContent = convertTextToHtml(importedData.content);
    }

    // Generate reference block (at the end)
    const referenceQuote = generateReferenceQuote(importedData);

    // FIXED: Ensure both content and reference are included
    // Add double line break between content and reference
    const finalContent = referenceQuote ? `${formattedContent}<br><br>${referenceQuote}` : formattedContent;

    // Priority: metadata title → fallback title
    const title = importedData.referenceInfo?.title || importedData.title || "";

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
      {/* Header */}
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
          {/* Input Mode Selector */}
          <motion.div
            variants={cardVariants}
            transition={{ delay: 0.1 }}
            className={`${!importedData ? "block" : "hidden"}`}
          >
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

              {/* Import Button */}
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

          {/* YouTube Import Info */}
          <AnimatePresence>
            {importedData && inputMode === "youtube" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-4 border-none bg-gray-500/20">
                  <div className="flex flex-col sm:flex-row items-start gap-3">
                    {/* Thumbnail */}
                    {importedData.referenceInfo?.thumbnailUrl && (
                      <div className="shrink-0 w-full sm:w-24 sm:h-16 rounded-md overflow-hidden">
                        <img
                          src={importedData.referenceInfo.thumbnailUrl}
                          alt={importedData.referenceInfo.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                        <div>
                          <p className="mt-0.5 text-[14px] sm:text-base font-semibold leading-tight">
                            {importedData.referenceInfo?.title || "Konten siap ditinjau"}
                          </p>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-1.5">
                        {importedData.metadata.has_ai_summary ? (
                          <Badge
                            variant="secondary"
                            className="text-xs gap-1 bg-yellow-500/10 text-teal-300 border-yellow-500/20"
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
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setShowImportModal(true)}
                          className="border-yellow-500! text-yellow-300 text-[14px]! h-7 px-2 rounded-full!"
                        >
                          Ganti
                        </Button>
                      </div>
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

          {/* Tips */}
          <motion.div variants={cardVariants} transition={{ delay: 0.3 }}>
            <Card className="p-4 border-dashed bg-muted/30 gap-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                Tips Singkat
              </h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Gunakan tag untuk organisir catatan (max 5 per catatan)</li>
                <li>• Aktifkan publik untuk berbagi (Premium/Advance)</li>
                <li>• Import YouTube dengan auto-metadata untuk hemat waktu</li>
                <li>• Referensi video akan otomatis muncul di akhir catatan</li>
              </ul>
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
