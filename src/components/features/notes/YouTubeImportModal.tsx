/**
 * YouTubeImportModal Component - ENHANCED UI/UX
 * Compact, clean, beautiful modal for YouTube import
 * With smooth animations & mobile responsive
 *
 * DEFAULT MODE: AI Summary (useTimestampMode = false)
 */

import { useState } from "react";
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
import { Loader2, Youtube, Sparkles, FileText, AlertCircle, CheckCircle, Info, Clock } from "lucide-react";
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

  const aiAvailable = isAISummaryAvailable();

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
      });

      if (result.success) {
        onImportSuccess(result);
        setUrl("");
        setUseTimestampMode(false); // Reset to default (AI mode)
        setMaterialTitle("");
        setSpeaker("");
        setChannelName("");
        setError(null);
        setUrlError(null);
        onOpenChange(false);
      } else {
        setError(result.error || "Gagal mengimpor video YouTube");
      }
    } catch (err) {
      console.error("Import error:", err);
      setError(err instanceof Error ? err.message : "Gagal mengimpor video YouTube");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (!isLoading) {
      setUrl("");
      setUseTimestampMode(false); // Reset to default (AI mode)
      setMaterialTitle("");
      setSpeaker("");
      setChannelName("");
      setError(null);
      setUrlError(null);
      onOpenChange(false);
    }
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

          {/* Loading Info Alert */}
          <AnimatePresence>
            {isLoading && (
              <motion.div variants={fadeInVariants} initial="initial" animate="animate" exit="exit">
                <Alert className="border-blue-500/50 bg-blue-500/5">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <AlertDescription className="text-sm text-blue-600">
                    <strong>Sedang memproses...</strong> Mohon tunggu sebentar.
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
            disabled={isLoading}
            className="flex-1 sm:flex-initial"
          >
            Batal
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
