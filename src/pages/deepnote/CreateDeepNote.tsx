/**
 * CreateDeepNote Page
 * - Hanya YouTube import (no manual mode)
 * - Text editor muncul setelah hasil generate
 * - Menggunakan cleanup-task API
 * - Support 100K characters
 *
 * PATH: src/pages/deepnote/CreateDeepNote.tsx
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { NoteForm } from "@/components/features/note-workspace/NoteForm";
import { DeepNoteImportModal } from "@/components/features/deep-note/DeepNoteImportModal";
import { TopHeader } from "@/components/layout/TopHeader";
import { BackgroundTaskBanner } from "@/components/features/note-workspace/BackgroundTaskBanner";
import { WaitingExperienceOverlay } from "@/components/features/note-workspace/WaitingExperience/WaitingExperienceOverlay";
import { Button } from "@/components/ui/button";
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
import type { DeepNoteImportResult } from "@/types/youtube.types";
import { convertTextToHtml } from "@/utils/textToHtml";
import {
  loadBackgroundTask,
  updateTaskStatus,
  updatePollingAttempts,
  clearBackgroundTask,
  hasActiveBackgroundTask,
  getTaskProgress,
  saveBackgroundTask,
} from "@/utils/backgroundTaskPersistence";
import { pollCleanupTaskStatus } from "@/services/youtube/transcript.service";
import type { BackgroundTaskData } from "@/utils/backgroundTaskPersistence";
import { ChevronLeft, Sparkles, Youtube } from "lucide-react";
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton";

// Polling config for Deep Note (longer)
const POLLING_INTERVAL = 3000; // 3 seconds
const MAX_POLLING_ATTEMPTS = 200; // 10 minutes

/**
 * Generate reference block from Deep Note import result
 */
const generateReferenceQuote = (result: DeepNoteImportResult): string => {
  const { referenceInfo } = result;
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
    `<p style="margin-bottom: 0;"><strong>Link:</strong> <a href="${referenceInfo.videoUrl}" target="_blank" rel="noopener noreferrer" style="color: #a855f7; text-decoration: underline;">${referenceInfo.videoUrl}</a></p>`
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

export default function CreateDeepNote() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedData, setImportedData] = useState<DeepNoteImportResult | null>(null);
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);

  // Waiting Experience Overlay states
  const [showWaitingOverlay, setShowWaitingOverlay] = useState(false);
  const [overlayComplete, setOverlayComplete] = useState(false);
  const [overlayResult, setOverlayResult] = useState<DeepNoteImportResult | null>(null);

  // Background task states
  const [backgroundTask, setBackgroundTask] = useState<BackgroundTaskData | null>(null);
  const [taskProgress, setTaskProgress] = useState(0);
  const [showResultConfirmation, setShowResultConfirmation] = useState(false);
  const [pendingResult, setPendingResult] = useState<DeepNoteImportResult | null>(null);

  // Refs for polling
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPollingRef = useRef(false);
  const overlayOpenRef = useRef(false);

  // CHECK & RESUME BACKGROUND TASK
  useEffect(() => {
    if (hasActiveBackgroundTask()) {
      const task = loadBackgroundTask();
      if (task) {
        console.log("[CreateDeepNote] Resuming background task:", task.taskId);
        setBackgroundTask(task);
        setTaskProgress(getTaskProgress());
        startPolling(task);

        toast.info("Melanjutkan proses Deep Note", {
          description: "Proses yang sebelumnya berjalan akan dilanjutkan",
          duration: 3000,
        });
      }
    }

    return () => {
      stopPolling();
    };
  }, []);

  // START POLLING
  const startPolling = (task: BackgroundTaskData) => {
    if (isPollingRef.current) {
      console.log("[CreateDeepNote] Polling already running");
      return;
    }

    isPollingRef.current = true;
    console.log("[CreateDeepNote] Starting polling for task:", task.taskId);

    pollTask(task);

    pollingIntervalRef.current = setInterval(() => {
      const currentTask = loadBackgroundTask();
      if (!currentTask) {
        console.log("[CreateDeepNote] Task cleared, stopping polling");
        stopPolling();
        return;
      }
      pollTask(currentTask);
    }, POLLING_INTERVAL);
  };

  // STOP POLLING
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    isPollingRef.current = false;
    console.log("[CreateDeepNote] Polling stopped");
  };

  // POLL TASK STATUS
  const pollTask = async (task: BackgroundTaskData) => {
    try {
      const newAttempts = task.pollingAttempts + 1;
      updatePollingAttempts(newAttempts);
      setTaskProgress(getTaskProgress());

      if (newAttempts >= MAX_POLLING_ATTEMPTS) {
        console.error("[CreateDeepNote] Max polling attempts reached");
        updateTaskStatus("failed", { error: "Timeout: Proses memakan waktu terlalu lama" });
        setBackgroundTask(null);
        stopPolling();

        toast.error("Proses timeout", {
          description: "Proses Deep Note memakan waktu terlalu lama. Silakan coba lagi.",
        });
        return;
      }

      const status = await pollCleanupTaskStatus(task.taskId);

      if (status.status === "completed") {
        console.log("[CreateDeepNote] Task completed!");

        stopPolling();
        updateTaskStatus("completed");

        if (!status.result) {
          throw new Error("Result tidak ditemukan");
        }

        if (!status.result.cleaned_text || status.result.cleaned_text.trim().length === 0) {
          throw new Error("Cleaned text kosong dari API");
        }

        const videoUrl = `https://www.youtube.com/watch?v=${task.videoId}`;

        let referenceInfo = undefined;
        if (task.metadata) {
          referenceInfo = {
            title: task.metadata.title,
            speaker:
              task.manualSpeaker ||
              (task.metadata.speaker_name !== "unknown" ? task.metadata.speaker_name : "Tidak diketahui"),
            channelName: task.metadata.channel_name,
            videoUrl: task.metadata.video_url,
            thumbnailUrl: task.metadata.thumbnail_url,
            duration: task.metadata.duration,
            uploadDate: task.metadata.upload_date,
            viewCount: task.metadata.view_count,
          };
        }

        const result: DeepNoteImportResult = {
          success: true,
          videoId: task.videoId,
          videoUrl,
          title: task.metadata?.title || status.result.cleaned_text.substring(0, 50) + "...",
          content: status.result.cleaned_text,
          language: status.result.language_used,
          chunksProcessed: status.result.chunks_processed,
          totalCharacters: status.result.total_characters,
          referenceInfo,
          metadata: {
            source_type: "youtube",
            source_url: videoUrl,
            video_id: task.videoId,
            language_used: status.result.language_used,
            total_segments: status.result.original_transcript_length,
            has_deep_note: true,
            model_used: status.result.model_used,
            imported_at: new Date().toISOString(),
            video_metadata: task.metadata || undefined,
          },
        };

        clearBackgroundTask();
        setBackgroundTask(null);

        setOverlayResult(result);

        console.log("[CreateDeepNote] Checking overlay state, overlayOpenRef.current:", overlayOpenRef.current);

        if (overlayOpenRef.current) {
          console.log("[CreateDeepNote] Overlay IS OPEN, showing completion notification");
          setOverlayComplete(true);
        } else {
          console.log("[CreateDeepNote] Overlay is closed, auto-injecting result");
          handleImportSuccess(result);
          toast.success("Deep Note selesai!", {
            description: `Generated ${result.totalCharacters.toLocaleString()} karakter`,
          });
        }
      } else if (status.status === "failed") {
        console.error("[CreateDeepNote] Task failed:", status.error);

        stopPolling();
        updateTaskStatus("failed", { error: status.error || undefined });
        setBackgroundTask(null);

        toast.error("Proses gagal", {
          description: status.error || "Terjadi kesalahan saat memproses video",
        });
      }

      const updatedTask = loadBackgroundTask();
      if (updatedTask) {
        setBackgroundTask(updatedTask);
      }
    } catch (error) {
      console.error("[CreateDeepNote] Polling error:", error);

      if (error instanceof Error && error.message.includes("network")) {
        console.log("[CreateDeepNote] Network error, will retry...");
        return;
      }

      stopPolling();
      updateTaskStatus("failed", {
        error: error instanceof Error ? error.message : "Terjadi kesalahan",
      });
      setBackgroundTask(null);

      toast.error("Proses gagal", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan tidak diketahui",
      });
    }
  };

  // HANDLE SHOW WAITING OVERLAY
  const handleShowWaitingOverlay = () => {
    console.log("[CreateDeepNote] Opening waiting overlay");
    setShowWaitingOverlay(true);
    overlayOpenRef.current = true;
    setOverlayComplete(false);
    setOverlayResult(null);
  };

  // HANDLE BACKGROUND TASK CREATED
  const handleBackgroundTaskCreated = (task: BackgroundTaskData) => {
    console.log("[CreateDeepNote] New background task created:", task.taskId);
    setBackgroundTask(task);
    setTaskProgress(0);
    startPolling(task);

    toast.info("Proses dimulai", {
      description: "Deep Note generation berjalan di background (~2-5 menit)",
      duration: 3000,
    });
  };

  // HANDLE CANCEL BACKGROUND TASK
  const handleCancelBackgroundTask = () => {
    stopPolling();
    updateTaskStatus("cancelled");
    clearBackgroundTask();
    setBackgroundTask(null);

    toast.success("Proses dibatalkan", {
      description: "Proses Deep Note telah dibatalkan",
    });
  };

  // HANDLE BANNER CLICK
  const handleBannerClick = () => {
    console.log("[CreateDeepNote] Banner clicked, opening overlay");
    setShowWaitingOverlay(true);
    overlayOpenRef.current = true;
  };

  // HANDLE CLOSE WAITING OVERLAY
  const handleCloseWaitingOverlay = () => {
    console.log("[CreateDeepNote] Closing waiting overlay");
    setShowWaitingOverlay(false);
    overlayOpenRef.current = false;

    if (overlayComplete && overlayResult) {
      handleImportSuccess(overlayResult);
      toast.success("Deep Note selesai!", {
        description: `Generated ${overlayResult.totalCharacters.toLocaleString()} karakter`,
      });

      setOverlayComplete(false);
      setOverlayResult(null);
    }
  };

  // HANDLE VIEW RESULT FROM OVERLAY
  const handleViewResultFromOverlay = () => {
    console.log("[CreateDeepNote] User clicked view result from overlay");

    if (overlayResult) {
      setShowWaitingOverlay(false);
      overlayOpenRef.current = false;

      setTimeout(() => {
        handleImportSuccess(overlayResult);
        toast.success("Deep Note selesai!", {
          description: `Generated ${overlayResult.totalCharacters.toLocaleString()} karakter`,
        });

        setOverlayComplete(false);
        setOverlayResult(null);
      }, 300);
    }
  };

  // Handle import success
  const handleImportSuccess = (result: DeepNoteImportResult) => {
    if (!result.content || result.content.trim().length < 10) {
      toast.error("Content kosong dari API");
      console.error("Empty content:", result);
      return;
    }

    setImportedData(result);
    toast.success("Deep Note berhasil digenerate!", {
      description: `${result.chunksProcessed} chunks, ${result.totalCharacters.toLocaleString()} karakter`,
    });
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
        sourceType: "youtube" as const,
        sourceUrl: importedData?.videoUrl,
        sourceMetadata: {
          ...importedData?.metadata,
          has_deep_note: true,
        },
      };

      const note = await createNote(user.id, noteData);

      toast.success("Deep Note berhasil disimpan!", {
        description: "Catatan komprehensif Anda telah tersimpan",
      });

      navigate(`/notes/${note.id}`);
    } catch (error: any) {
      console.error("Error creating Deep Note:", error);
      toast.error("Gagal menyimpan Deep Note", {
        description: error.message || "Terjadi kesalahan saat menyimpan catatan",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle back button
  const handleCancel = () => {
    if (importedData) {
      setShowBackConfirmation(true);
    } else {
      navigate(-1);
    }
  };

  // Handle confirmed back
  const handleConfirmedBack = () => {
    setShowBackConfirmation(false);
    navigate("/notes");
  };

  // Get initial form values
  const getInitialFormValues = () => {
    if (!importedData) {
      return undefined;
    }

    let formattedContent = "";
    if (importedData.content.includes("<p>") || importedData.content.includes("<br>")) {
      formattedContent = importedData.content;
    } else {
      formattedContent = convertTextToHtml(importedData.content);
    }

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
      <TopHeader
        backButton
        onBackClick={handleCancel}
        actions={
          <Badge variant="secondary" className="gap-1.5 bg-purple-500/10 text-purple-400 border-purple-500/20">
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">Deep Note</span>
          </Badge>
        }
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Background Task Banner */}
          <AnimatePresence>
            {backgroundTask && (
              <BackgroundTaskBanner
                task={backgroundTask}
                progress={taskProgress}
                onCancel={handleCancelBackgroundTask}
                onClick={handleBannerClick}
              />
            )}
          </AnimatePresence>

          {/* Import Button (show when no data) */}
          {!importedData && !backgroundTask && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 mx-auto bg-purple-500/10 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold">Generate Deep Note</h2>
                <p className="text-muted-foreground">
                  Import video YouTube untuk membuat catatan komprehensif dengan AI
                </p>
                <Button
                  size="lg"
                  onClick={() => setShowImportModal(true)}
                  className="bg-purple-500 hover:bg-purple-600 text-white gap-2"
                >
                  <Youtube className="w-5 h-5" />
                  Import dari YouTube
                </Button>
              </div>
            </motion.div>
          )}

          {/* Note Form (show when data imported) */}
          {importedData && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <NoteForm
                initialValues={getInitialFormValues()}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
                mode="create"
                maxLength={100000} // 100K characters for Deep Note
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTopButton />

      {/* Deep Note Import Modal */}
      <DeepNoteImportModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onBackgroundTaskCreated={handleBackgroundTaskCreated}
        onShowWaitingOverlay={handleShowWaitingOverlay}
      />

      {/* Waiting Experience Overlay */}
      <WaitingExperienceOverlay
        open={showWaitingOverlay}
        onClose={handleCloseWaitingOverlay}
        isComplete={overlayComplete}
        onViewResult={handleViewResultFromOverlay}
      />

      {/* Back Confirmation Dialog */}
      <Dialog open={showBackConfirmation} onOpenChange={setShowBackConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keluar dari halaman ini?</DialogTitle>
            <DialogDescription>Deep Note yang belum disimpan akan hilang.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBackConfirmation(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleConfirmedBack}>
              Ya, Keluar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
