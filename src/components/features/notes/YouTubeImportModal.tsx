/**
 * YouTubeImportModal Component - ENHANCED with Auto-Metadata Fetch
 * Compact, clean, beautiful modal for YouTube import
 * With automatic metadata fetching and preview
 *
 * UPDATED:
 * - Auto-fetch video metadata (title, speaker, channel, thumbnail)
 * - Removed manual "Informasi Sumber" fields
 * - Added metadata preview card
 * - Debounced URL input for better UX
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
import {
  Loader2,
  Youtube,
  Sparkles,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  AlertTriangle,
  User,
  Video,
  Eye,
  Calendar,
} from "lucide-react";
import { isValidYouTubeUrl } from "@/utils/youtubeHelpers";
import { importYouTubeVideo, fetchVideoMetadata } from "@/services/youtube/transcript.service";
import { isAISummaryAvailable } from "@/config/youtube";
import type { YouTubeImportResult, VideoMetadataResponse } from "@/types/youtube.types";

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

export function YouTubeImportModal({ open, onOpenChange, onImportSuccess }: YouTubeImportModalProps) {
  const [url, setUrl] = useState("");
  const [useTimestampMode, setUseTimestampMode] = useState(false); // Default: AI Summary mode
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadataResponse | null>(null);
  const [manualSpeaker, setManualSpeaker] = useState(""); // NEW: Manual speaker input

  // AbortController ref for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);
  const metadataAbortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const aiAvailable = isAISummaryAvailable();

  // Cleanup on unmount or modal close
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

  // Auto-fetch metadata with debounce
  const fetchMetadataDebounced = useCallback(async (videoUrl: string) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Clear previous metadata
    setMetadata(null);

    // Validate URL first
    if (!isValidYouTubeUrl(videoUrl)) {
      return;
    }

    // Debounce: wait 800ms before fetching
    debounceTimerRef.current = setTimeout(async () => {
      setIsFetchingMetadata(true);
      setError(null);

      // Create new AbortController for metadata fetch
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
    }, 800); // 800ms debounce
  }, []);

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
      // Auto-fetch metadata
      fetchMetadataDebounced(value);
    } else {
      // Clear metadata if URL is empty
      setMetadata(null);
    }
  };

  // Handle import
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

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const result = await importYouTubeVideo({
        url: url.trim(),
        useAISummary: !useTimestampMode && aiAvailable, // Invert logic: AI is default
        metadata: metadata || undefined, // Pass fetched metadata
        signal: abortControllerRef.current.signal, // Pass abort signal
      });

      if (result.success) {
        // Override speaker if manual input provided
        if (manualSpeaker.trim() && result.referenceInfo) {
          result.referenceInfo.speaker = manualSpeaker.trim();
        }

        onImportSuccess(result);
        handleReset();
        onOpenChange(false);
      } else {
        // Check if cancelled
        if (result.error === "Proses dibatalkan") {
          setError(null); // Don't show error for cancellation
        } else {
          setError(result.error || "Gagal mengimpor video YouTube");
        }
      }
    } catch (err) {
      console.error("Import error:", err);

      // Don't show error if aborted
      if (err instanceof Error && err.message === "Proses dibatalkan") {
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : "Gagal mengimpor video YouTube");
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (isLoading && abortControllerRef.current) {
      // Abort ongoing request
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }

    if (!isLoading) {
      handleReset();
      onOpenChange(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setUrl("");
    setUseTimestampMode(false); // Reset to default (AI mode)
    setMetadata(null);
    setManualSpeaker(""); // Reset manual speaker
    setError(null);
    setUrlError(null);

    // Clear timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Abort metadata fetch if in progress
    if (metadataAbortControllerRef.current) {
      metadataAbortControllerRef.current.abort();
      metadataAbortControllerRef.current = null;
    }
  };

  // Custom onOpenChange handler that blocks closing during loading OR metadata fetch
  const handleOpenChange = (newOpen: boolean) => {
    if (isLoading || isFetchingMetadata) return; // Block if loading or fetching metadata
    if (!newOpen) {
      handleCancel();
    } else {
      onOpenChange(newOpen);
    }
  };

  // Format duration (seconds to MM:SS or HH:MM:SS)
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Format view count (e.g., 1.2K, 1.5M)
  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Format upload date
  const formatUploadDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-full h-full sm:max-w-[600px] sm:h-fit sm:max-h-[90vh] overflow-y-auto"
        onEscapeKeyDown={(e) => {
          if (isLoading || isFetchingMetadata) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (isLoading || isFetchingMetadata) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (isLoading || isFetchingMetadata) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Youtube className="w-5 h-5 text-red-500" />
            Import dari YouTube
          </DialogTitle>
          <DialogDescription className="text-sm">
            Masukkan URL video YouTube untuk mengimpor transcript sebagai catatan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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

          {/* Fetching Metadata Info Alert */}
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
                    {/* Thumbnail */}
                    {metadata.thumbnail_url && (
                      <div className="shrink-0 w-full sm:w-24 sm:h-16 rounded-md overflow-hidden">
                        <img src={metadata.thumbnail_url} alt={metadata.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Metadata Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold line-clamp-2 leading-tight">{metadata.title}</h3>
                        </div>
                      </div>

                      {/* Channel & Speaker */}
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

                      {/* Stats */}
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

          {/* Manual Speaker Input (Show if speaker is Unknown) */}
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
                        onChange={(e) => setManualSpeaker(e.target.value)}
                        disabled={isLoading || isFetchingMetadata}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timestamp Mode Option (Only show if AI available) */}
          {aiAvailable && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2"
            >
              <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-blue-500/30 hover:bg-blue-500/5 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={useTimestampMode}
                  onChange={(e) => setUseTimestampMode(e.target.checked)}
                  disabled={isLoading || isFetchingMetadata}
                  className="mt-0.5 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Mode Timestamp</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {useTimestampMode
                      ? "Transcript lengkap dengan timestamps akan diimpor"
                      : "Transcript akan diringkas menggunakan AI (lebih cepat dibaca)"}
                  </p>
                </div>
              </label>
            </motion.div>
          )}

          {/* Info Box */}
          <Alert className="border-indigo-500/20 bg-indigo-500/5">
            <FileText className="w-4 h-4 text-indigo-300" />
            <AlertDescription className="text-xs">
              <strong className="text-sm">Yang akan diimpor:</strong>
              <ul className="list-disc list-inside mt-1.5 space-y-0.5 text-muted-foreground">
                <li>Judul dari video YouTube</li>
                <li>
                  {useTimestampMode || !aiAvailable
                    ? "Transcript lengkap dengan timestamps"
                    : "Ringkasan AI dari transcript"}
                </li>
                {metadata && <li>Sumber Referensi</li>}
                <li>Link video YouTube</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div variants={fadeInVariants} initial="initial" animate="animate" exit="exit">
                <Alert variant="destructive" className="border-red-500/50">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Warning Alert - ENHANCED */}
          <AnimatePresence>
            {isLoading && (
              <motion.div variants={fadeInVariants} initial="initial" animate="animate" exit="exit">
                <Alert className="border-none bg-yellow-500/10">
                  <AlertDescription className="text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#87cefa]" />
                        <strong className="text-[#87cefa]">Sedang memproses...</strong>
                      </div>
                      <p className="text-xs text-[#87cefa]">
                        {useTimestampMode || !aiAvailable
                          ? "Mengambil transcript..."
                          : "Meringkas transcript menggunakan AI... Proses ini bisa memakan waktu 1-3 menit. Jangan refresh atau tutup halaman ini! ⚠️"}
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            size={"sm"}
            variant="outline"
            onClick={handleCancel}
            disabled={isFetchingMetadata} // Disabled during metadata fetch, but allow cancel during import
            className="flex-1 sm:flex-initial"
          >
            {isLoading ? "Batalkan" : "Batal"}
          </Button>
          <Button
            type="button"
            size={"sm"}
            onClick={handleImport}
            disabled={isLoading || isFetchingMetadata || !!urlError || !url.trim()}
            className="flex-1 sm:flex-initial bg-red-500 hover:bg-red-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memproses...
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
  );
}

// Helper function for className utility
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
