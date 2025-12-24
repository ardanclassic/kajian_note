/**
 * CreateNote Page - REFACTORED with Overlay Control
 * - Form persistence with localStorage
 * - Mobile back button handling (keyboard detection)
 * - Reset functionality with confirmation
 * - Auto-restore data on mount
 * - 🆕 BACKGROUND TASK POLLING (survives page reload)
 * - 🆕 SMART RESULT INJECTION (auto or confirmation dialog)
 * - ✅ REFACTORED: WaitingExperienceOverlay controlled here
 * - ✅ Overlay shows completion notification when task done
 * - ✅ BANNER CLICK shows fullscreen overlay
 *
 * PATH: src/pages/notes/CreateNote.tsx
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { NoteForm } from "@/components/features/note-workspace/NoteForm";
import { YouTubeImportModal } from "@/components/features/smart-summary/YouTubeImportModal";
import { BackgroundTaskBanner } from "@/components/features/note-workspace/BackgroundTaskBanner";
import { WaitingExperienceOverlay } from "@/components/features/note-workspace/WaitingExperience/WaitingExperienceOverlay";
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
import {
  loadBackgroundTask,
  updateTaskStatus,
  updatePollingAttempts,
  clearBackgroundTask,
  hasActiveBackgroundTask,
  getTaskProgress,
} from "@/utils/backgroundTaskPersistence";
import { pollTaskStatus } from "@/services/youtube/transcript.service";
import type { BackgroundTaskData } from "@/utils/backgroundTaskPersistence";
import { PenLine, Youtube, Sparkles, FileText, ChevronLeft, RotateCcw, AlertTriangle, CheckCircle } from "lucide-react";
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton";
import { TopHeader } from "@/components/layout/TopHeader";

type InputMode = "manual" | "youtube";

// Polling config
const POLLING_INTERVAL = 2000; // 2 seconds
const MAX_POLLING_ATTEMPTS = 150; // 5 minutes

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

  // ✅ Waiting Experience Overlay states
  const [showWaitingOverlay, setShowWaitingOverlay] = useState(false);
  const [overlayComplete, setOverlayComplete] = useState(false);
  const [overlayResult, setOverlayResult] = useState<YouTubeImportResult | null>(null);

  // Background task states
  const [backgroundTask, setBackgroundTask] = useState<BackgroundTaskData | null>(null);
  const [taskProgress, setTaskProgress] = useState(0);
  const [showResultConfirmation, setShowResultConfirmation] = useState(false);
  const [pendingResult, setPendingResult] = useState<YouTubeImportResult | null>(null);

  // Refs for polling
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPollingRef = useRef(false);
  const overlayOpenRef = useRef(false); // ✅ NEW: Track overlay state reliably

  // Load persisted data on mount
  useEffect(() => {
    const persisted = loadFormData();
    if (persisted && hasPersistedData()) {
      const timeSince = getTimeSinceLastSave();

      if (persisted.importResult) {
        setImportedData(persisted.importResult);
        setInputMode("youtube");
        console.log("[CreateNote] Import data dipulihkan");
      }

      toast.info("Data dipulihkan", {
        description: timeSince
          ? `Data terakhir disimpan ${timeSince} menit yang lalu`
          : "Data sebelumnya berhasil dipulihkan",
        duration: 4000,
      });
    }
  }, []);

  // ✅ CHECK & RESUME BACKGROUND TASK
  useEffect(() => {
    if (hasActiveBackgroundTask()) {
      const task = loadBackgroundTask();
      if (task) {
        console.log("[CreateNote] Resuming background task:", task.taskId);
        setBackgroundTask(task);
        setTaskProgress(getTaskProgress());
        startPolling(task);

        toast.info("Melanjutkan proses summarize", {
          description: "Proses yang sebelumnya berjalan akan dilanjutkan",
          duration: 3000,
        });
      }
    }

    return () => {
      stopPolling();
    };
  }, []);

  // ✅ START POLLING
  const startPolling = (task: BackgroundTaskData) => {
    if (isPollingRef.current) {
      console.log("[CreateNote] Polling already running");
      return;
    }

    isPollingRef.current = true;
    console.log("[CreateNote] Starting polling for task:", task.taskId);

    pollTask(task);

    pollingIntervalRef.current = setInterval(() => {
      const currentTask = loadBackgroundTask();
      if (!currentTask) {
        console.log("[CreateNote] Task cleared, stopping polling");
        stopPolling();
        return;
      }
      pollTask(currentTask);
    }, POLLING_INTERVAL);
  };

  // ✅ STOP POLLING
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    isPollingRef.current = false;
    console.log("[CreateNote] Polling stopped");
  };

  // ✅ POLL TASK STATUS
  const pollTask = async (task: BackgroundTaskData) => {
    try {
      const newAttempts = task.pollingAttempts + 1;
      updatePollingAttempts(newAttempts);
      setTaskProgress(getTaskProgress());

      if (newAttempts >= MAX_POLLING_ATTEMPTS) {
        console.error("[CreateNote] Max polling attempts reached");
        updateTaskStatus("failed", { error: "Timeout: Proses memakan waktu terlalu lama" });
        setBackgroundTask(null);
        stopPolling();

        toast.error("Proses timeout", {
          description: "Proses summarize memakan waktu terlalu lama. Silakan coba lagi.",
        });
        return;
      }

      const status = await pollTaskStatus(task.taskId);

      if (status.status === "completed") {
        console.log("[CreateNote] Task completed!");

        stopPolling();
        updateTaskStatus("completed");

        if (!status.result) {
          throw new Error("Result tidak ditemukan");
        }

        if (!status.result.summary || status.result.summary.trim().length === 0) {
          throw new Error("Summary kosong dari API");
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

        const result: YouTubeImportResult = {
          success: true,
          videoId: task.videoId,
          videoUrl,
          title: task.metadata?.title || status.result.summary.substring(0, 50) + "...",
          content: status.result.summary,
          language: status.result.language_used,
          referenceInfo,
          metadata: {
            source_type: "youtube",
            source_url: videoUrl,
            video_id: task.videoId,
            language_used: status.result.language_used,
            total_segments: status.result.original_transcript_length,
            has_ai_summary: true,
            model_used: status.result.model_used,
            imported_at: new Date().toISOString(),
            video_metadata: task.metadata || undefined,
          },
        };

        clearBackgroundTask();
        setBackgroundTask(null);

        // ✅ ALWAYS set overlay result first (even if closed)
        setOverlayResult(result);

        // ✅ Use REF instead of state to avoid race condition
        console.log("[CreateNote] Checking overlay state, overlayOpenRef.current:", overlayOpenRef.current);

        if (overlayOpenRef.current) {
          console.log("[CreateNote] Overlay IS OPEN, showing completion notification");
          setOverlayComplete(true);
        } else {
          console.log("[CreateNote] Overlay is closed, checking form data");
          const hasFormData = checkIfFormHasData();
          console.log("[CreateNote] Has form data:", hasFormData);

          if (hasFormData) {
            console.log("[CreateNote] Showing result confirmation dialog");
            setPendingResult(result);
            setShowResultConfirmation(true);
          } else {
            console.log("[CreateNote] Auto-injecting result to form");
            handleImportSuccess(result);
            toast.success("Summarize selesai!", {
              description: "Hasil telah dimasukkan ke form",
            });
          }
        }
      } else if (status.status === "failed") {
        console.error("[CreateNote] Task failed:", status.error);

        stopPolling();
        updateTaskStatus("failed", { error: status.error });
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
      console.error("[CreateNote] Polling error:", error);

      if (error instanceof Error && error.message.includes("network")) {
        console.log("[CreateNote] Network error, will retry...");
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

  // ✅ CHECK IF FORM HAS DATA
  const checkIfFormHasData = (): boolean => {
    const persisted = loadFormData();
    if (!persisted) return false;

    const { formData } = persisted;
    return formData.title.trim().length > 0 || formData.content.trim().length > 0 || formData.tags.length > 0;
  };

  // ✅ HANDLE SHOW WAITING OVERLAY (triggered by modal)
  const handleShowWaitingOverlay = () => {
    console.log("[CreateNote] Opening waiting overlay");
    setShowWaitingOverlay(true);
    overlayOpenRef.current = true; // ✅ Update ref
    setOverlayComplete(false);
    setOverlayResult(null);
  };

  // ✅ HANDLE BACKGROUND TASK CREATED (from modal)
  const handleBackgroundTaskCreated = (task: BackgroundTaskData) => {
    console.log("[CreateNote] New background task created:", task.taskId);
    setBackgroundTask(task);
    setTaskProgress(0);
    startPolling(task);

    toast.info("Proses dimulai", {
      description: "Summarize berjalan di background",
      duration: 3000,
    });
  };

  // ✅ HANDLE CANCEL BACKGROUND TASK
  const handleCancelBackgroundTask = () => {
    stopPolling();
    updateTaskStatus("cancelled");
    clearBackgroundTask();
    setBackgroundTask(null);

    toast.success("Proses dibatalkan", {
      description: "Proses summarize telah dibatalkan",
    });
  };

  // ✅ HANDLE BANNER CLICK - Show overlay
  const handleBannerClick = () => {
    console.log("[CreateNote] Banner clicked, opening overlay");
    setShowWaitingOverlay(true);
    overlayOpenRef.current = true; // ✅ Update ref
  };

  // ✅ HANDLE CLOSE WAITING OVERLAY
  const handleCloseWaitingOverlay = () => {
    console.log("[CreateNote] Closing waiting overlay");
    setShowWaitingOverlay(false);

    // ✅ If completed while overlay was open, handle result
    if (overlayComplete && overlayResult) {
      const hasFormData = checkIfFormHasData();

      if (hasFormData) {
        setPendingResult(overlayResult);
        setShowResultConfirmation(true);
      } else {
        handleImportSuccess(overlayResult);
        toast.success("Summarize selesai!", {
          description: "Hasil telah dimasukkan ke form",
        });
      }

      setOverlayComplete(false);
      setOverlayResult(null);
    }
  };

  // ✅ HANDLE VIEW RESULT FROM OVERLAY
  const handleViewResultFromOverlay = () => {
    console.log("[CreateNote] User clicked view result from overlay");

    if (overlayResult) {
      setShowWaitingOverlay(false);

      setTimeout(() => {
        const hasFormData = checkIfFormHasData();

        if (hasFormData) {
          setPendingResult(overlayResult);
          setShowResultConfirmation(true);
        } else {
          handleImportSuccess(overlayResult);
          toast.success("Summarize selesai!", {
            description: "Hasil telah dimasukkan ke form",
          });
        }

        setOverlayComplete(false);
        setOverlayResult(null);
      }, 300);
    }
  };

  // ✅ HANDLE RESULT CONFIRMATION - ACCEPT
  const handleAcceptResult = () => {
    console.log("[CreateNote] User accepted result, injecting to form");
    if (pendingResult) {
      handleImportSuccess(pendingResult);
      setShowResultConfirmation(false);
      setPendingResult(null);

      toast.success("Result diterapkan", {
        description: "Form telah diisi dengan hasil summarize",
      });
    }
  };

  // ✅ HANDLE RESULT CONFIRMATION - REJECT
  const handleRejectResult = () => {
    console.log("[CreateNote] User rejected result");
    setShowResultConfirmation(false);
    setPendingResult(null);

    toast.info("Result diabaikan", {
      description: "Anda dapat melanjutkan mengisi form secara manual",
    });
  };

  // Keyboard detection
  useEffect(() => {
    if (!isMobile()) return;

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

    let initialWindowHeight = window.innerHeight;

    const handleWindowResize = () => {
      const currentHeight = window.innerHeight;
      const heightDiff = initialWindowHeight - currentHeight;
      setIsKeyboardOpen(heightDiff > 150);
    };

    window.addEventListener("resize", handleWindowResize);

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

  // Handle orientation change
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

    window.history.pushState({ preventBack: true }, "");

    const handlePopState = (e: PopStateEvent) => {
      if (isKeyboardOpen) {
        console.log("[CreateNote] Keyboard open, allowing native close");
        return;
      }

      if (showImportModal) {
        e.preventDefault();
        window.history.pushState({ preventBack: true }, "");
        setShowImportModal(false);
        console.log("[CreateNote] Modal closed via back button");
        return;
      }

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

    saveImportResult(result);

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

  // Handle back button
  const handleCancel = () => {
    navigate(-1);
  };

  // Handle confirmed back
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

    window.location.reload();
  };

  // Get initial form values
  const getInitialFormValues = () => {
    if (!importedData || inputMode === "manual") {
      const persisted = loadFormData();
      if (persisted?.formData) {
        return persisted.formData;
      }
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
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Smart Summary</span>
            </Badge>
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

          {/* Input Mode Selector - Disabled when background task running */}
          <motion.div
            variants={cardVariants}
            transition={{ delay: 0.1 }}
            className={`${!importedData ? "block" : "hidden"}`}
          >
            <div className="backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row gap-2">
                <motion.button
                  whileHover={!backgroundTask ? { scale: 1.02 } : {}}
                  whileTap={!backgroundTask ? { scale: 0.98 } : {}}
                  onClick={() => {
                    if (backgroundTask) return;
                    if (!importedData) {
                      setShowImportModal(true);
                    } else {
                      setInputMode("youtube");
                    }
                  }}
                  disabled={!!backgroundTask}
                  className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                    backgroundTask
                      ? "border-gray-500/30 bg-gray-500/10 opacity-50 cursor-not-allowed"
                      : inputMode === "youtube"
                      ? "border-red-500/50 bg-red-500/10 shadow-sm shadow-red-500/20"
                      : "border-border hover:border-red-500/30 hover:bg-red-500/5"
                  }`}
                >
                  <div
                    className={`p-2 rounded-md ${
                      backgroundTask ? "bg-gray-500/20" : inputMode === "youtube" ? "bg-red-500/20" : "bg-muted"
                    }`}
                  >
                    <Youtube
                      className={`w-4 h-4 ${
                        backgroundTask
                          ? "text-gray-500"
                          : inputMode === "youtube"
                          ? "text-red-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="text-left">
                    <p
                      className={`text-sm font-semibold ${
                        backgroundTask ? "text-gray-500" : inputMode === "youtube" ? "text-red-500" : "text-foreground"
                      }`}
                    >
                      Import YouTube
                    </p>
                    <p
                      className={`text-xs hidden sm:block ${
                        backgroundTask ? "text-gray-500" : "text-muted-foreground"
                      }`}
                    >
                      {backgroundTask ? "Proses berjalan..." : importedData ? "Video diimpor ✓" : "Import video"}
                    </p>
                  </div>
                </motion.button>
              </div>

              {inputMode === "youtube" && !importedData && !backgroundTask && (
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
                          disabled={!!backgroundTask}
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
        onBackgroundTaskCreated={handleBackgroundTaskCreated}
        onShowWaitingOverlay={handleShowWaitingOverlay}
      />

      {/* ✅ Waiting Experience Overlay (controlled here) */}
      <WaitingExperienceOverlay
        open={showWaitingOverlay}
        onClose={handleCloseWaitingOverlay}
        isComplete={overlayComplete}
        onViewResult={handleViewResultFromOverlay}
      />

      {/* Back Confirmation Dialog */}
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

      {/* ✅ Result Confirmation Dialog */}
      <Dialog open={showResultConfirmation} onOpenChange={setShowResultConfirmation}>
        <DialogContent className="max-w-[90%] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-500">
              <CheckCircle className="w-5 h-5" />
              Summarize Selesai!
            </DialogTitle>
            <DialogDescription>
              Proses summarize telah selesai. Apakah Anda ingin mengisi form dengan hasil summarize? Data yang sudah ada
              akan ditimpa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleRejectResult} className="flex-1 sm:flex-initial">
              Tidak, Abaikan
            </Button>
            <Button
              onClick={handleAcceptResult}
              className="flex-1 sm:flex-initial bg-green-500 hover:bg-green-600 text-white"
            >
              Ya, Terapkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Scroll to Top Button */}
      <ScrollToTopButton bottomPosition="bottom-20" />
    </motion.div>
  );
}
