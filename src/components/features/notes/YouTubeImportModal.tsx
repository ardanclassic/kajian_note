/**
 * YouTubeImportModal Component - ENHANCED UI/UX
 * Compact, clean, beautiful modal for YouTube import
 * With smooth animations & mobile responsive
 *
 * UPDATED: Async task support with AbortController cleanup
 * DEFAULT MODE: AI Summary (useTimestampMode = false)
 */

import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { isValidYouTubeUrl } from "@/utils/youtubeHelpers";
import { importYouTubeVideo } from "@/services/youtube/transcript.service";
import { isAISummaryAvailable } from "@/config/youtube";
import type { YouTubeImportResult, YouTubeReferenceInfo } from "@/types/youtube.types";

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
  const [error, setError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Reference info fields
  const [materialTitle, setMaterialTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [channelName, setChannelName] = useState("");

  // AbortController ref for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);

  const aiAvailable = isAISummaryAvailable();

  // Cleanup on unmount or modal close
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  // Handle URL change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    setUrlError(null);
    setError(null);

    if (value && !isValidYouTubeUrl(value)) {
      setUrlError("URL YouTube tidak valid");
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
      const referenceInfo: YouTubeReferenceInfo | undefined =
        materialTitle || speaker || channelName
          ? {
              materialTitle: materialTitle.trim() || undefined,
              speaker: speaker.trim() || undefined,
              channelName: channelName.trim() || undefined,
              videoUrl: url.trim(),
            }
          : undefined;

      const result = await importYouTubeVideo({
        url: url.trim(),
        useAISummary: !useTimestampMode && aiAvailable, // Invert logic: AI is default
        referenceInfo,
        signal: abortControllerRef.current.signal, // Pass abort signal
      });

      if (result.success) {
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
    setMaterialTitle("");
    setSpeaker("");
    setChannelName("");
    setError(null);
    setUrlError(null);
  };

  // Custom onOpenChange handler that blocks closing during loading
  const handleOpenChange = (newOpen: boolean) => {
    if (isLoading) return;
    if (!newOpen) {
      handleCancel();
    } else {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto"
        onEscapeKeyDown={(e) => {
          if (isLoading) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (isLoading) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (isLoading) e.preventDefault();
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
            <Input
              id="youtube-url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={handleUrlChange}
              disabled={isLoading}
              className={cn(
                "transition-colors",
                urlError ? "border-red-500 focus:border-red-500" : "focus:border-indigo-500"
              )}
            />
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
            <p className="text-xs text-muted-foreground">Contoh: youtube.com/watch?v=... atau youtu.be/...</p>
          </div>

          {/* Reference Info Section - Compact */}
          <Card className="p-3 bg-muted/30 border-muted">
            <div className="flex items-start gap-2 mb-3">
              <Info className="w-4 h-4 text-indigo-300 mt-0.5 shrink-0" />
              <div className="flex-1">
                <Label className="text-sm font-semibold">Informasi Sumber (Opsional)</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Isi untuk menambahkan referensi di catatan</p>
              </div>
            </div>

            <div className="space-y-2">
              {/* Material Title */}
              <div className="space-y-1">
                <Label htmlFor="material-title" className="text-xs">
                  Judul Materi
                </Label>
                <Input
                  id="material-title"
                  placeholder="Contoh: Adab Menuntut Ilmu"
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  disabled={isLoading}
                  className="h-9 text-sm"
                />
              </div>

              {/* Speaker */}
              <div className="space-y-1">
                <Label htmlFor="speaker" className="text-xs">
                  Narasumber
                </Label>
                <Input
                  id="speaker"
                  placeholder="Contoh: Ustadz Khalid Basalamah"
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                  disabled={isLoading}
                  className="h-9 text-sm"
                />
              </div>

              {/* Channel Name */}
              <div className="space-y-1">
                <Label htmlFor="channel-name" className="text-xs">
                  Nama Channel
                </Label>
                <Input
                  id="channel-name"
                  placeholder="Contoh: KHB Official"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  disabled={isLoading}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </Card>

          {/* Timestamp Mode Option - Compact (Only show if AI available) */}
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
                  disabled={isLoading}
                  className="mt-0.5 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Pakai mode timestamp</span>
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

          {/* Info Box - Compact */}
          <Alert className="border-indigo-500/20 bg-indigo-500/5">
            <FileText className="w-4 h-4 text-indigo-300" />
            <AlertDescription className="text-xs">
              <strong className="text-sm">Yang akan diimpor:</strong>
              <ul className="list-disc list-inside mt-1.5 space-y-0.5 text-muted-foreground">
                <li>Judul otomatis dari video</li>
                <li>
                  {useTimestampMode || !aiAvailable
                    ? "Transcript lengkap dengan timestamps"
                    : "Ringkasan AI dari transcript"}
                </li>
                {(materialTitle || speaker || channelName) && <li>Kutipan sumber referensi di awal catatan</li>}
                <li>Link sumber video YouTube</li>
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
                <Alert className="border-yellow-500/50 bg-yellow-500/5">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <AlertDescription className="text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
                        <strong className="text-yellow-600">Sedang memproses...</strong>
                      </div>
                      <p className="text-xs text-yellow-700">
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
            variant="outline"
            onClick={handleCancel}
            disabled={false} // Always enabled to allow cancellation
            className="flex-1 sm:flex-initial"
          >
            {isLoading ? "Batalkan" : "Batal"}
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={isLoading || !!urlError || !url.trim()}
            className="flex-1 sm:flex-initial bg-red-500 hover:bg-red-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mengimpor...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Import
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
