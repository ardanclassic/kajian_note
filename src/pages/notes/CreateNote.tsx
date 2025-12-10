/**
 * CreateNote Page - ENHANCED with Form Persistence & Mobile Back Button Handling
 * - Form persistence with localStorage
 * - Mobile back button handling (keyboard detection)
 * - Reset functionality with confirmation
 * - Auto-restore data on mount
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { NoteForm } from "@/components/features/notes/NoteForm";
import { YouTubeImportModal } from "@/components/features/notes/YouTubeImportModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { createNote } from "@/services/supabase/notes.service";
import type { CreateNoteFormData } from "@/schemas/notes.schema";
import type { YouTubeImportResult } from "@/types/youtube.types";
import { convertTextToHtml } from "@/utils/textToHtml";
import {
  loadFormData,
  clearFormData,
  saveImportResult,
  hasPersistedData,
  getTimeSinceLastSave,
} from "@/utils/formPersistence";
import { PenLine, Youtube, Sparkles, FileText, ChevronLeft, RotateCcw, AlertTriangle } from "lucide-react";

type InputMode = "manual" | "youtube";

/**
 * Generate reference block from YouTube import result
 */
const generateReferenceQuote = (result: YouTubeImportResult): string => {
  const { referenceInfo, metadata } = result;
  if (!referenceInfo) return "";

  const parts: string[] = [];

  parts.push("<hr>", "<br>");
  parts.push("<h2>📚 Sumber Referensi</h2>");
  parts.push('<div style="padding: 16px; margin-bottom: 16px;">');

  if (referenceInfo.thumbnailUrl) {
    parts.push(
      `<div style="margin-bottom: 12px;">`,
      `<img src="${referenceInfo.thumbnailUrl}" alt="${referenceInfo.title}" />`,
      `</div>`
    );
  }

  parts.push(`<p style="margin-bottom: 5px;"><strong>Judul:</strong> ${referenceInfo.title}</p>`);

  const speakerName = referenceInfo.speaker;
  if (speakerName && speakerName !== "Unknown") {
    parts.push(`<p style="margin-bottom: 5px;"><strong>Pemateri:</strong> ${speakerName}</p>`);
  }

  parts.push(`<p style="margin-bottom: 5px;"><strong>Channel:</strong> ${referenceInfo.channelName}</p>`);
  parts.push(
    `<p style="margin-bottom: 0;"><strong>Link:</strong> <a href="${referenceInfo.videoUrl}" target="_blank" rel="noopener noreferrer" style="color: #ef4444; text-decoration: underline;">${referenceInfo.videoUrl}</a></p>`
  );

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

// Detect mobile device
const isMobile = (): boolean => {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 768
  );
};

export default function CreateNote() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("manual");
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedData, setImportedData] = useState<YouTubeImportResult | null>(null);
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Load persisted data on mount
  useEffect(() => {
    const persisted = loadFormData();
    if (persisted && hasPersistedData()) {
      const timeSince = getTimeSinceLastSave();

      // Restore import result if available
      if (persisted.importResult) {
        setImportedData(persisted.importResult);
        setInputMode("youtube");
        console.log("[CreateNote] Import data dipulihkan");
      }

      // Show toast notification
      toast.info("Data dipulihkan", {
        description: timeSince
          ? `Data terakhir disimpan ${timeSince} menit yang lalu`
          : "Data sebelumnya berhasil dipulihkan",
        duration: 4000,
      });
    }
  }, []);

  // Keyboard detection (multiple methods for cross-browser compatibility)
  useEffect(() => {
    if (!isMobile()) return;

    // Method 1: Visual Viewport API (Modern browsers)
    if ("visualViewport" in window && window.visualViewport) {
      const viewport = window.visualViewport!;
      let initialHeight = viewport.height;

      const handleResize = () => {
        const currentHeight = viewport.height;
        const heightDiff = initialHeight - currentHeight;
        setIsKeyboardOpen(heightDiff > 150);
      };

      viewport.addEventListener("resize", handleResize);

      return () => {
        viewport.removeEventListener("resize", handleResize);
      };
    }

    // Method 2: Window resize (Safari & fallback)
    let initialWindowHeight = window.innerHeight;

    const handleWindowResize = () => {
      const currentHeight = window.innerHeight;
      const heightDiff = initialWindowHeight - currentHeight;
      setIsKeyboardOpen(heightDiff > 150);
    };

    window.addEventListener("resize", handleWindowResize);

    // Method 3: Focus events (Additional reliability)
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        setTimeout(() => {
          const heightDiff = initialWindowHeight - window.innerHeight;
          if (heightDiff > 150) {
            setIsKeyboardOpen(true);
          }
        }, 300);
      }
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        const heightDiff = initialWindowHeight - window.innerHeight;
        if (heightDiff < 150) {
          setIsKeyboardOpen(false);
        }
      }, 300);
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  // Handle orientation change (reset keyboard detection)
  useEffect(() => {
    if (!isMobile()) return;

    const handleOrientationChange = () => {
      setIsKeyboardOpen(false);
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    window.screen?.orientation?.addEventListener("change", handleOrientationChange);

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.screen?.orientation?.removeEventListener("change", handleOrientationChange);
    };
  }, []);

  // Mobile back button handling
  useEffect(() => {
    if (!isMobile()) return;

    // Push dummy state to history
    window.history.pushState({ preventBack: true }, "");

    const handlePopState = (e: PopStateEvent) => {
      // PRIORITY 1: If keyboard is open, allow native behavior (close keyboard)
      if (isKeyboardOpen) {
        console.log("[CreateNote] Keyboard open, allowing native close");
        return;
      }

      // PRIORITY 2: If modal is open, close modal
      if (showImportModal) {
        e.preventDefault();
        window.history.pushState({ preventBack: true }, "");
        setShowImportModal(false);
        console.log("[CreateNote] Modal closed via back button");
        return;
      }

      // PRIORITY 3: Show confirmation for page navigation
      e.preventDefault();
      window.history.pushState({ preventBack: true }, "");
      setShowBackConfirmation(true);
      console.log("[CreateNote] Back confirmation shown");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [showImportModal, isKeyboardOpen]);

  // Handle import success
  const handleImportSuccess = async (result: YouTubeImportResult) => {
    if (!result.content || result.content.trim().length < 10) {
      toast.error("Content kosong dari API");
      console.error("Empty content:", result);
      return;
    }

    setImportedData(result);
    setInputMode("youtube");

    // Save to localStorage
    saveImportResult(result);

    // Force re-render
    await new Promise((resolve) => setTimeout(resolve, 50));

    toast.success("Video berhasil diimpor!");
  };

  // Handle form submit
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

      // Clear localStorage after successful save
      clearFormData();

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

  // Handle cancel (from UI button - no confirmation)
  const handleCancel = () => {
    navigate("/notes");
  };

  // Handle confirmed back (from confirmation dialog)
  const handleConfirmedBack = () => {
    setShowBackConfirmation(false);
    navigate("/notes");
  };

  // Handle reset form
  const handleResetForm = () => {
    setShowResetConfirmation(true);
  };

  const handleConfirmedReset = () => {
    clearFormData();
    setImportedData(null);
    setInputMode("manual");
    setShowResetConfirmation(false);

    toast.success("Form direset", {
      description: "Semua field berhasil dikosongkan",
    });

    // Force page reload to reset NoteForm
    window.location.reload();
  };

  // Get initial form values
  const getInitialFormValues = () => {
    if (!importedData || inputMode === "manual") {
      // Load from localStorage if available
      const persisted = loadFormData();
      if (persisted?.formData) {
        return persisted.formData;
      }
      return undefined;
    }

    // Format content
    let formattedContent = "";
    if (importedData.content.includes("<p>") || importedData.content.includes("<br>")) {
      formattedContent = importedData.content;
    } else {
      formattedContent = convertTextToHtml(importedData.content);
    }

    // Generate reference
    const referenceQuote = generateReferenceQuote(importedData);
    const finalContent = referenceQuote ? `${formattedContent}<br><br>${referenceQuote}` : formattedContent;

    const title = importedData.referenceInfo?.title || importedData.title || "";

    return {
      title,
      content: finalContent,
      isPublic: false,
    };
  };

  return (
    <motion.div
      className="min-h-screen bg-linear-to-b from-background to-muted/20"
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
            <Button variant="ghost" size="sm" onClick={handleCancel} className="gap-2 hover:bg-muted/50">
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Kembali</span>
            </Button>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1.5 bg-primary/10 text-primary border-primary/20">
                <PenLine className="w-3 h-3" />
                <span className="hidden sm:inline">Buat Catatan</span>
              </Badge>
              {/* Reset Form */}
              {hasPersistedData() && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button variant="ghost" size="sm" onClick={handleResetForm} className="gap-2 hover:bg-muted/50">
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Reset Form</span>
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Input Mode Selector & Reset Button */}
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
        </div>
      </div>

      {/* YouTube Import Modal */}
      <YouTubeImportModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onImportSuccess={handleImportSuccess}
      />

      {/* Back Confirmation Dialog (Mobile) */}
      <Dialog open={showBackConfirmation} onOpenChange={setShowBackConfirmation}>
        <DialogContent className="max-w-[90%] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="w-5 h-5" />
              Kembali ke halaman sebelumnya?
            </DialogTitle>
            <DialogDescription>Data yang sudah diisi akan tersimpan dan dapat dipulihkan nanti.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowBackConfirmation(false)} className="flex-1 sm:flex-initial">
              Batal
            </Button>
            <Button
              onClick={handleConfirmedBack}
              className="flex-1 sm:flex-initial bg-amber-500 hover:bg-amber-600 text-white"
            >
              Ya, Kembali
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetConfirmation} onOpenChange={setShowResetConfirmation}>
        <DialogContent className="max-w-[90%] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="w-5 h-5" />
              Reset semua field?
            </DialogTitle>
            <DialogDescription>
              Semua data yang sudah diisi akan dihapus. Aksi ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowResetConfirmation(false)}
              className="flex-1 sm:flex-initial"
            >
              Batal
            </Button>
            <Button
              onClick={handleConfirmedReset}
              className="flex-1 sm:flex-initial bg-amber-500 hover:bg-amber-600 text-white"
            >
              Ya, Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
