/**
 * CreateNote Page - WITH REFERENCE INFO INJECTION
 * Modern UI/UX with tabs for Manual/YouTube import
 * NEW: Inject reference quote at the beginning of content
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { NoteForm } from "@/components/features/notes/NoteForm";
import { YouTubeImportModal } from "@/components/features/notes/YouTubeImportModal";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { createNote } from "@/services/supabase/notes.service";
import type { CreateNoteFormData } from "@/schemas/notes.schema";
import type { YouTubeImportResult } from "@/types/youtube.types";
import { generateSuggestedTags } from "@/utils/youtubeHelpers";
import { convertTextToHtml } from "@/utils/textToHtml";
import { PenLine, Youtube, Sparkles, FileText, Clock, CheckCircle2, Video, AlertTriangle } from "lucide-react";

type InputMode = "manual" | "youtube";

/**
 * Generate reference quote block from YouTube import result
 */
const generateReferenceQuote = (result: YouTubeImportResult): string => {
  const { referenceInfo } = result;

  if (!referenceInfo) return "";

  const parts: string[] = ["<p><strong>Sumber Referensi:</strong></p>", "<p>"];

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

  parts.push("</p>", "<p></p>"); // Add empty paragraph after quote

  return parts.join("");
};

export default function CreateNote() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { usage } = useSubscriptionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("manual");
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedData, setImportedData] = useState<YouTubeImportResult | null>(null);

  /**
   * Handle YouTube import success
   */
  const handleImportSuccess = (result: YouTubeImportResult) => {
    setImportedData(result);
    setInputMode("youtube"); // Switch to YouTube tab

    // Check if tags were stripped due to limit
    const suggestedTags = generateSuggestedTags(result.content, 3);
    const wasStripped = suggestedTags.length > 0 && usage && usage.tagsUsed >= usage.tagsLimit;

    toast.success("Video berhasil diimpor!", {
      description: result.metadata.has_ai_summary
        ? "Ringkasan AI siap untuk ditinjau"
        : "Transcript lengkap siap untuk diedit",
      duration: 4000,
    });

    // Warning if tags were stripped
    if (wasStripped) {
      toast.warning("Tag otomatis dinonaktifkan", {
        description: `Anda sudah mencapai batas ${usage.tagsLimit} tag. Upgrade untuk menambah lebih banyak tag.`,
        duration: 5000,
      });
    }
  };

  /**
   * Handle form submit
   */
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

      // Add YouTube source metadata if imported
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

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    navigate("/notes");
  };

  /**
   * Get initial form values - WITH REFERENCE QUOTE INJECTION
   */
  const getInitialFormValues = () => {
    if (!importedData || inputMode === "manual") {
      return undefined;
    }

    // Convert plain text content to HTML
    const formattedContent = convertTextToHtml(importedData.content);
    
    // Generate reference quote if available
    const referenceQuote = generateReferenceQuote(importedData);

    // Inject reference quote at the beginning
    const finalContent = referenceQuote ? `${formattedContent}${referenceQuote}` : formattedContent;

    // Don't auto-fill tags if user at tag limit
    let suggestedTags: string[] = [];

    if (usage && usage.tagsUsed < usage.tagsLimit) {
      suggestedTags = generateSuggestedTags(importedData.content, 3);
    }

    return {
      title: importedData.title,
      content: finalContent, // Content with reference quote injected
      isPublic: false,
    };
  };

  // Check if user is at tag limit
  const isAtTagLimit = usage ? usage.tagsUsed >= usage.tagsLimit : false;

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <PageHeader
        badgeIcon={PenLine}
        badgeText="Create New Note"
        title="Buat Catatan Baru"
        description="Tulis catatan manual atau import dari video YouTube"
        showBackButton
        backTo="/notes"
        backLabel="Kembali ke Daftar"
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Input Mode Selector - Tab Style */}
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Manual Tab */}
                <button
                  onClick={() => setInputMode("manual")}
                  className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg border-2 transition-all ${
                    inputMode === "manual"
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border hover:border-primary/50 hover:bg-accent"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${inputMode === "manual" ? "bg-primary/20" : "bg-accent"}`}>
                    <PenLine
                      className={`w-5 h-5 ${inputMode === "manual" ? "text-primary" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div className="text-left">
                    <p className={`font-semibold ${inputMode === "manual" ? "text-primary" : "text-foreground"}`}>
                      Tulis Manual
                    </p>
                    <p className="text-xs text-muted-foreground">Buat catatan dari awal</p>
                  </div>
                </button>

                {/* YouTube Tab */}
                <button
                  onClick={() => {
                    if (!importedData) {
                      setShowImportModal(true);
                    } else {
                      setInputMode("youtube");
                    }
                  }}
                  className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg border-2 transition-all ${
                    inputMode === "youtube"
                      ? "border-red-500 bg-red-500/10 shadow-sm"
                      : "border-border hover:border-red-500/50 hover:bg-red-500/5"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${inputMode === "youtube" ? "bg-red-500/20" : "bg-accent"}`}>
                    <Youtube
                      className={`w-5 h-5 ${inputMode === "youtube" ? "text-red-500" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div className="text-left">
                    <p className={`font-semibold ${inputMode === "youtube" ? "text-red-500" : "text-foreground"}`}>
                      Import YouTube
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {importedData ? "Video diimpor ✓" : "Import dari video"}
                    </p>
                  </div>
                </button>
              </div>

              {/* Import Button for YouTube Tab */}
              {inputMode === "youtube" && !importedData && (
                <div className="mt-4 pt-4 border-t">
                  <Button onClick={() => setShowImportModal(true)} className="w-full" size="lg">
                    <Youtube className="w-4 h-4 mr-2" />
                    Pilih Video YouTube
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* YouTube Import Info Card */}
          {importedData && inputMode === "youtube" && (
            <Card className="border-2 border-red-500/20 bg-gradient-to-br from-red-500/5 to-orange-500/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="shrink-0 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                    <Video className="w-6 h-6 text-red-500" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          Video YouTube Diimpor
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">Konten siap untuk ditinjau dan diedit</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setShowImportModal(true)}>
                        Ganti Video
                      </Button>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="gap-1.5">
                        <FileText className="w-3 h-3" />
                        Video ID: {importedData.videoId}
                      </Badge>

                      {importedData.metadata.has_ai_summary ? (
                        <Badge
                          variant="secondary"
                          className="gap-1.5 bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
                        >
                          <Sparkles className="w-3 h-3" />
                          AI Summary
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1.5">
                          <FileText className="w-3 h-3" />
                          Full Transcript
                        </Badge>
                      )}

                      <Badge variant="secondary" className="gap-1.5">
                        <Clock className="w-3 h-3" />
                        {importedData.metadata.total_segments} segmen
                      </Badge>

                      <Badge variant="secondary" className="gap-1.5">
                        🌐 {importedData.metadata.language_used.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Reference Info Display */}
                    {importedData.referenceInfo && (
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">
                          📚 Info Referensi ditambahkan di catatan
                        </p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          {importedData.referenceInfo.materialTitle && (
                            <div>• Judul: {importedData.referenceInfo.materialTitle}</div>
                          )}
                          {importedData.referenceInfo.speaker && (
                            <div>• Narasumber: {importedData.referenceInfo.speaker}</div>
                          )}
                          {importedData.referenceInfo.channelName && (
                            <div>• Channel: {importedData.referenceInfo.channelName}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tag Limit Warning */}
                    {isAtTagLimit && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-yellow-700">
                            <strong>Tag otomatis dinonaktifkan.</strong> Anda sudah mencapai batas {usage?.tagsLimit}{" "}
                            tag. Field tag akan disembunyikan. Upgrade untuk menambah lebih banyak tag.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Video URL */}
                    <div className="p-3 bg-background/50 rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">Video URL:</p>
                      <a
                        href={importedData.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline font-mono break-all"
                      >
                        {importedData.videoUrl}
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Note Form */}
          <Card className="border-2">
            <CardContent className="p-6">
              <NoteForm
                key={importedData?.videoId || "new"}
                note={importedData && inputMode === "youtube" ? (getInitialFormValues() as any) : undefined}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
              />
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card className="border-dashed border-2 border-muted bg-muted/30">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Tips Membuat Catatan
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>
                    Gunakan <strong>tag</strong> untuk organisir catatan (contoh: sholat, puasa, akhlak)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>
                    Aktifkan <strong>publik</strong> untuk berbagi dengan member lain
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>
                    Import dari <strong>YouTube</strong> untuk menghemat waktu mencatat
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>
                    Isi <strong>informasi referensi</strong> saat import untuk dokumentasi sumber yang lebih baik
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* YouTube Import Modal */}
      <YouTubeImportModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}
