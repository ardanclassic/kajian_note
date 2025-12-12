/**
 * YouTubeImportModal Component - COMPLETE UPDATED VERSION
 * - Auto-fetch video metadata (title, speaker, channel, thumbnail)
 * - Form persistence with localStorage
 * - Prevent close outside in ALL conditions
 * - Auto-save modal data (debounced)
 * - INTEGRATED WITH WAITING EXPERIENCE (Story/Quiz/Wait modes)
 *
 * PATH: src/components/features/notes/YouTubeImportModal.tsx
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, Youtube, AlertCircle, CheckCircle, Clock, User, Eye, Calendar } from "lucide-react";
import { isValidYouTubeUrl } from "@/utils/youtubeHelpers";
import { importYouTubeVideo, fetchVideoMetadata } from "@/services/youtube/transcript.service";
import { isAISummaryAvailable } from "@/config/youtube";
import { debounce } from "@/lib/utils";
import { loadFormData, saveModalData } from "@/utils/formPersistence";
import type { YouTubeImportResult, VideoMetadataResponse } from "@/types/youtube.types";
import CatLoading from "@/components/common/CatLoading";
import { WaitingExperienceOverlay } from "./WaitingExperience/WaitingExperienceOverlay";

interface YouTubeImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: (result: YouTubeImportResult) => void;
}

const fadeInVariants = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export function YouTubeImportModal({ open, onOpenChange, onImportSuccess }: YouTubeImportModalProps) {
  const [url, setUrl] = useState("");
  const [useTimestampMode, setUseTimestampMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadataResponse | null>(null);
  const [manualSpeaker, setManualSpeaker] = useState("");

  // 👇 NEW STATE - Waiting Experience
  const [showWaitingExperience, setShowWaitingExperience] = useState(false);
  const [importComplete, setImportComplete] = useState(false);
  const [importResult, setImportResult] = useState<YouTubeImportResult | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const metadataAbortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const aiAvailable = isAISummaryAvailable();

  // Load persisted data on mount
  useEffect(() => {
    if (open) {
      // 👇 RESET COMPLETION STATE WHEN MODAL OPENS
      setImportComplete(false);
      setImportResult(null);
      setShowWaitingExperience(false);

      const persisted = loadFormData();
      if (persisted?.modalData) {
        const { url: savedUrl, metadata: savedMetadata, manualSpeaker: savedSpeaker } = persisted.modalData;

        if (savedUrl) {
          setUrl(savedUrl);
          console.log("[YouTubeModal] URL dipulihkan:", savedUrl);
        }

        if (savedMetadata) {
          setMetadata(savedMetadata);
          console.log("[YouTubeModal] Metadata dipulihkan");
        }

        if (savedSpeaker) {
          setManualSpeaker(savedSpeaker);
          console.log("[YouTubeModal] Manual speaker dipulihkan:", savedSpeaker);
        }
      }
    }
  }, [open]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (metadataAbortControllerRef.current) {
        metadataAbortControllerRef.current.abort();
        metadataAbortControllerRef.current = null;
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, []);

  // Debounced save to localStorage
  const debouncedSave = useCallback(
    debounce((url: string, metadata: VideoMetadataResponse | null, speaker: string) => {
      saveModalData(url, metadata, speaker);
    }, 500),
    []
  );

  // Auto-fetch metadata with debounce
  const fetchMetadataDebounced = useCallback(
    async (videoUrl: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      setMetadata(null);

      if (!isValidYouTubeUrl(videoUrl)) {
        return;
      }

      debounceTimerRef.current = setTimeout(async () => {
        setIsFetchingMetadata(true);
        setError(null);

        if (metadataAbortControllerRef.current) {
          metadataAbortControllerRef.current.abort();
        }
        metadataAbortControllerRef.current = new AbortController();

        try {
          const metadataResult = await fetchVideoMetadata(videoUrl, true);
          setMetadata(metadataResult);

          // Save to localStorage
          debouncedSave(videoUrl, metadataResult, manualSpeaker);
        } catch (err) {
          console.error("Failed to fetch metadata:", err);
          setError(
            err instanceof Error
              ? err.message
              : "Gagal mengambil informasi video. Coba lagi atau lanjutkan tanpa metadata."
          );
        } finally {
          setIsFetchingMetadata(false);
          metadataAbortControllerRef.current = null;
        }
      }, 800);
    },
    [manualSpeaker, debouncedSave]
  );

  // Handle URL change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    setUrlError(null);
    setError(null);

    if (value && !isValidYouTubeUrl(value)) {
      setUrlError("URL YouTube tidak valid");
      setMetadata(null);
    } else if (value) {
      fetchMetadataDebounced(value);
    } else {
      setMetadata(null);
    }

    // Save URL immediately
    debouncedSave(value, metadata, manualSpeaker);
  };

  // Handle manual speaker change
  const handleManualSpeakerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setManualSpeaker(value);

    // Save to localStorage
    debouncedSave(url, metadata, value);
  };

  // 👇 UPDATED - Handle import with Waiting Experience
  const handleImport = async () => {
    if (!url.trim()) {
      setUrlError("URL YouTube wajib diisi");
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      setUrlError("URL YouTube tidak valid");
      return;
    }

    setIsLoading(true);
    setError(null);

    // 👇 CLOSE MODAL FIRST, THEN SHOW WAITING EXPERIENCE
    onOpenChange(false); // Close modal

    // Wait for modal to close animation (300ms), then show overlay
    setTimeout(() => {
      setShowWaitingExperience(true);
      setImportComplete(false);
      setImportResult(null);
    }, 300);

    abortControllerRef.current = new AbortController();

    try {
      const result = await importYouTubeVideo({
        url: url.trim(),
        useAISummary: !useTimestampMode && aiAvailable,
        metadata: metadata || undefined,
        signal: abortControllerRef.current.signal,
      });

      if (result.success) {
        // Override speaker if manual input provided
        if (manualSpeaker.trim() && result.referenceInfo) {
          result.referenceInfo.speaker = manualSpeaker.trim();
        }

        console.log("[YouTubeImport] SUCCESS - Result:", result);

        // 👇 SAVE RESULT & MARK AS COMPLETE
        setImportResult(result);
        setImportComplete(true);

        console.log("[YouTubeImport] State updated - importComplete: true");

        // Don't call onImportSuccess yet - wait for user action
        // User will click "Lihat Sekarang" or close overlay
      } else {
        if (result.error === "Proses dibatalkan") {
          setError(null);
        } else {
          setError(result.error || "Gagal mengimpor video YouTube");
        }
        // 👇 CLOSE WAITING EXPERIENCE ON ERROR
        setShowWaitingExperience(false);
      }
    } catch (err) {
      console.error("Import error:", err);

      if (err instanceof Error && err.message === "Proses dibatalkan") {
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : "Gagal mengimpor video YouTube");
      }
      // 👇 CLOSE WAITING EXPERIENCE ON ERROR
      setShowWaitingExperience(false);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // 👇 NEW HANDLER - View Result (from completion notice)
  const handleViewResult = () => {
    if (importResult) {
      // Close waiting experience first
      setShowWaitingExperience(false);

      // Wait for overlay to close, then trigger success
      setTimeout(() => {
        // Call the original success handler
        onImportSuccess(importResult);

        // Reset form
        handleReset();
      }, 300);
    }
  };

  // 👇 NEW HANDLER - Close Waiting Experience
  const handleCloseWaitingExperience = () => {
    // CRITICAL: Only close if user explicitly wants to close
    // Don't auto-trigger success if user is still in story/quiz mode
    setShowWaitingExperience(false);

    // If import was completed AND user closed overlay, trigger success
    if (importComplete && importResult) {
      setTimeout(() => {
        onImportSuccess(importResult);
        handleReset();
      }, 300);
    } else if (!importComplete) {
      // User closed before completion - reset states
      handleReset();
    }
  };

  // Handle cancel
  const handleCancel = () => {
    handleModalClose();
  };

  // Reset form (but keep localStorage)
  const handleReset = () => {
    setUrl("");
    setUseTimestampMode(false);
    setMetadata(null);
    setManualSpeaker("");
    setError(null);
    setUrlError(null);
    setShowWaitingExperience(false);
    setImportComplete(false);
    setImportResult(null);
    setIsLoading(false); // 👈 Add this

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (metadataAbortControllerRef.current) {
      metadataAbortControllerRef.current.abort();
      metadataAbortControllerRef.current = null;
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    if (isLoading && abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }

    if (!isLoading) {
      onOpenChange(false);
    }
  };

  // CRITICAL: Prevent close outside, but allow close via X button
  const handleOpenChange = (newOpen: boolean) => {
    // Modal can ONLY be closed via explicit button click (Batal or X)
    // This is called by shadcn's Dialog when X is clicked
    if (!newOpen) {
      handleModalClose();
    } else {
      onOpenChange(newOpen);
    }
  };

  // Format helpers
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatUploadDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="max-w-full h-full sm:max-w-[600px] sm:h-fit sm:max-h-[90vh] overflow-y-auto"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className=" h-fit">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Youtube className="w-5 h-5 text-red-500" />
              Import dari YouTube
            </DialogTitle>
            <DialogDescription className="text-sm text-left">
              Link video youTube untuk membuat catatan secara otomatis
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <>
              <CatLoading />
              <AnimatePresence>
                {isLoading && (
                  <motion.div variants={fadeInVariants} initial="initial" animate="animate" exit="exit">
                    <div className="max-w-[350px] mx-auto text-center space-y-2 mb-8">
                      <div className="title-load text-lg flex gap-2 items-center justify-center text-[#87cefa] font-semibold">
                        <Loader2 className="w-4 h-4 animate-spin text-[#87cefa]" />
                        Bentar ya... Lagi Proses!
                      </div>
                      <p className="text-[14px] text-emerald-300">Memulai proses import...</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <>
              <div className="space-y-4 py-4 h-fit">
                {/* URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="youtube-url" className="text-sm font-medium">
                    URL YouTube <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="youtube-url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={url}
                      onChange={handleUrlChange}
                      disabled={isLoading || isFetchingMetadata}
                      className={cn(
                        "transition-colors pr-10",
                        urlError ? "border-red-500 focus:border-red-500" : "focus:border-indigo-500"
                      )}
                    />
                    {isFetchingMetadata && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <AnimatePresence>
                    {urlError && (
                      <motion.p
                        variants={fadeInVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="text-xs text-red-500 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {urlError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Fetching Metadata Alert */}
                <AnimatePresence>
                  {isFetchingMetadata && (
                    <motion.div
                      variants={fadeInVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.2 }}
                    >
                      <Alert className="border-blue-500/50 bg-blue-500/5">
                        <AlertDescription className="text-sm">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-300" />
                            <strong className="text-blue-300">Memuat informasi video...</strong>
                          </div>
                          <p className="text-xs text-blue-300 mt-1">
                            Sistem sedang memuat informasi dari YouTube. Mohon tunggu sebentar.
                          </p>
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Metadata Preview Card */}
                <AnimatePresence>
                  {metadata && !isFetchingMetadata && (
                    <motion.div
                      variants={fadeInVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="p-4 border-none bg-gray-500/20">
                        <div className="flex flex-col sm:flex-row items-start gap-3">
                          {metadata.thumbnail_url && (
                            <div className="shrink-0 w-full sm:w-24 sm:h-16 rounded-md overflow-hidden">
                              <img
                                src={metadata.thumbnail_url}
                                alt={metadata.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold line-clamp-2 leading-tight">{metadata.title}</h3>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Youtube className="w-3 h-3 shrink-0" />
                                <span className="truncate">{metadata.channel_name}</span>
                              </div>
                              {metadata.speaker_name && metadata.speaker_name !== "Unknown" && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <User className="w-3 h-3 shrink-0" />
                                  <span className="truncate">Pemateri: {metadata.speaker_name}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              <Badge
                                variant="secondary"
                                className="text-xs gap-1 bg-blue-500/10 text-blue-300 border-blue-500/20"
                              >
                                <Clock className="w-3 h-3" />
                                {formatDuration(metadata.duration)}
                              </Badge>
                              <Badge variant="secondary" className="text-xs gap-1">
                                <Eye className="w-3 h-3" />
                                {formatViewCount(metadata.view_count)}
                              </Badge>
                              <Badge variant="secondary" className="text-xs gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatUploadDate(metadata.upload_date)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Narasumber Input */}
                <AnimatePresence>
                  {metadata && !isFetchingMetadata && metadata.speaker_name === "Unknown" && (
                    <motion.div
                      variants={fadeInVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <Card className="p-4 border-gray-500/30 bg-gray-500/5">
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="manual-speaker" className="text-sm flex items-center gap-2">
                              <User className="w-3 h-3" />
                              Narasumber (Opsional)
                            </Label>
                            <Input
                              id="manual-speaker"
                              placeholder="Syaikh Abdurrahman As-Sudais"
                              value={manualSpeaker}
                              onChange={handleManualSpeakerChange}
                              disabled={isLoading || isFetchingMetadata}
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error Alert */}
                <AnimatePresence>
                  {error && (
                    <motion.div variants={fadeInVariants} initial="initial" animate="animate" exit="exit">
                      <Alert variant="destructive" className="border-yellow-300/50">
                        <AlertCircle className="w-4 h-4 text-yellow-300!" />
                        <AlertDescription className="text-sm text-yellow-300!">{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              size={"sm"}
              variant="outline"
              onClick={handleCancel}
              disabled={isFetchingMetadata}
              className="flex-initial"
            >
              {isLoading ? "Batalkan" : "Batal"}
            </Button>
            <Button
              type="button"
              size={"sm"}
              onClick={handleImport}
              disabled={isLoading || isFetchingMetadata || !!urlError || !url.trim()}
              className="flex-initial bg-red-500 hover:bg-red-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mohon Bersabar ...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Summarize
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 👇 WAITING EXPERIENCE OVERLAY */}
      <WaitingExperienceOverlay
        open={showWaitingExperience}
        onClose={handleCloseWaitingExperience}
        isComplete={importComplete}
        onViewResult={handleViewResult}
      />
    </>
  );
}
