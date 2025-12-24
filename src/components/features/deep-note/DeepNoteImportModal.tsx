/**
 * DeepNoteImportModal Component
 * Modal untuk import YouTube video untuk Deep Note
 * - Hanya YouTube import (no timestamp mode)
 * - Menggunakan cleanup-task API
 * - Model: google/gemini-2.5-flash
 *
 * PATH: src/components/features/deepnote/DeepNoteImportModal.tsx
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
import { Loader2, Youtube, AlertCircle, CheckCircle, Clock, User, Eye, Calendar, Sparkles } from "lucide-react";
import { isValidYouTubeUrl } from "@/utils/youtubeHelpers";
import {
  fetchVideoMetadata,
  submitCleanupTask,
  extractVideoId,
} from "@/services/youtube/transcript.service";
import { debounce } from "@/lib/utils";
import type { VideoMetadataResponse, DeepNoteImportResult } from "@/types/youtube.types";
import { saveBackgroundTask } from "@/utils/backgroundTaskPersistence";
import type { BackgroundTaskData } from "@/utils/backgroundTaskPersistence";
import CatLoading from "@/components/common/CatLoading";

interface DeepNoteImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBackgroundTaskCreated?: (task: BackgroundTaskData) => void;
  onShowWaitingOverlay?: () => void;
}

const fadeInVariants = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export function DeepNoteImportModal({
  open,
  onOpenChange,
  onBackgroundTaskCreated,
  onShowWaitingOverlay,
}: DeepNoteImportModalProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadataResponse | null>(null);
  const [manualSpeaker, setManualSpeaker] = useState("");

  const metadataAbortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
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
    []
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
  };

  // Handle manual speaker change
  const handleManualSpeakerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualSpeaker(e.target.value);
  };

  // Handle import - Submit cleanup task
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

    // Extract video ID first
    let videoId: string;
    try {
      videoId = await extractVideoId(url.trim());
    } catch (err) {
      setError("Gagal mengekstrak video ID");
      setIsLoading(false);
      return;
    }

    // Submit cleanup task
    try {
      const taskResponse = await submitCleanupTask(videoId);

      // Save to background task storage
      const backgroundTask: BackgroundTaskData = {
        taskId: taskResponse.task_id,
        videoUrl: url.trim(),
        videoId,
        metadata,
        manualSpeaker: manualSpeaker.trim() || undefined,
        status: "processing",
        timestamp: Date.now(),
        startedAt: Date.now(),
        pollingAttempts: 0,
        maxPollingAttempts: 200, // 10 minutes for Deep Note
      };
      
      // Persist to localStorage
      saveBackgroundTask(backgroundTask);

      // Close modal
      onOpenChange(false);
      setIsLoading(false);

      // Trigger overlay in parent
      setTimeout(() => {
        if (onShowWaitingOverlay) {
          onShowWaitingOverlay();
        }
        if (onBackgroundTaskCreated) {
          onBackgroundTaskCreated(backgroundTask);
        }
      }, 300);
    } catch (err) {
      console.error("Error submitting cleanup task:", err);
      setError(err instanceof Error ? err.message : "Gagal memulai proses Deep Note");
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-full h-full sm:max-w-[600px] sm:h-fit sm:max-h-[90vh] overflow-y-auto"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="h-fit">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Import Deep Note dari YouTube
          </DialogTitle>
          <DialogDescription className="text-sm text-left">
            Generate catatan komprehensif dengan AI dari video YouTube
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <>
            <CatLoading />
            <AnimatePresence>
              {isLoading && (
                <motion.div variants={fadeInVariants} initial="initial" animate="animate" exit="exit">
                  <div className="max-w-[350px] mx-auto text-center space-y-2 mb-8">
                    <div className="title-load text-lg flex gap-2 items-center justify-center text-purple-400 font-semibold">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      Memproses Deep Note...
                    </div>
                    <p className="text-[14px] text-emerald-300">Ini akan memakan waktu lebih lama (~2-5 menit)</p>
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
                      urlError ? "border-red-500 focus:border-red-500" : "focus:border-purple-500"
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
                    <Card className="p-4 border-none bg-purple-500/10">
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
                              className="text-xs gap-1 bg-purple-500/10 text-purple-300 border-purple-500/20"
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
            className="flex-initial bg-purple-500 hover:bg-purple-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Deep Note
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
