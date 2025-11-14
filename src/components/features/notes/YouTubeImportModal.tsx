/**
 * YouTubeImportModal Component - UPDATED
 * Modal dialog for importing YouTube videos
 * NEW: Added optional reference fields (material title, speaker, channel)
 */

import { useState } from "react";
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
import { Loader2, Youtube, Sparkles, FileText, AlertCircle, CheckCircle, Info } from "lucide-react";
import { isValidYouTubeUrl } from "@/utils/youtubeHelpers";
import { importYouTubeVideo } from "@/services/youtube/transcript.service";
import { isAISummaryAvailable } from "@/config/youtube";
import type { YouTubeImportResult, YouTubeReferenceInfo } from "@/types/youtube.types";

interface YouTubeImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: (result: YouTubeImportResult) => void;
}

export function YouTubeImportModal({ open, onOpenChange, onImportSuccess }: YouTubeImportModalProps) {
  const [url, setUrl] = useState("");
  const [useAISummary, setUseAISummary] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  // NEW: Reference info fields
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

    // Validate URL on change
    if (value && !isValidYouTubeUrl(value)) {
      setUrlError("URL YouTube tidak valid");
    }
  };

  // Handle import
  const handleImport = async () => {
    // Validate URL
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
      // Prepare reference info
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
        useAISummary: useAISummary && aiAvailable,
        referenceInfo,
      });

      if (result.success) {
        // Success - pass result to parent
        onImportSuccess(result);

        // Reset form
        setUrl("");
        setUseAISummary(false);
        setMaterialTitle("");
        setSpeaker("");
        setChannelName("");
        setError(null);
        setUrlError(null);

        // Close modal
        onOpenChange(false);
      } else {
        // Import failed
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
      setUseAISummary(false);
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
    // Block closing if loading
    if (isLoading) {
      return;
    }

    // Allow closing if not loading
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
          if (isLoading) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          if (isLoading) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          if (isLoading) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-500" />
            Import dari YouTube
          </DialogTitle>
          <DialogDescription>Masukkan URL video YouTube untuk mengimpor transcript sebagai catatan</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="youtube-url">
              URL YouTube <span className="text-destructive">*</span>
            </Label>
            <Input
              id="youtube-url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={handleUrlChange}
              disabled={isLoading}
              className={urlError ? "border-destructive" : ""}
            />
            {urlError && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {urlError}
              </p>
            )}
            <p className="text-xs text-muted-foreground">Contoh: youtube.com/watch?v=... atau youtu.be/...</p>
          </div>

          {/* NEW: Reference Info Section */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              <Label className="text-sm font-semibold">Informasi Sumber (Opsional)</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Isi informasi ini untuk ditampilkan sebagai kutipan sumber di awal catatan
            </p>

            {/* Material Title */}
            <div className="space-y-1.5">
              <Label htmlFor="material-title" className="text-sm">
                Judul
              </Label>
              <Input
                id="material-title"
                placeholder="Contoh: Adab Menuntut Ilmu"
                value={materialTitle}
                onChange={(e) => setMaterialTitle(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Speaker */}
            <div className="space-y-1.5">
              <Label htmlFor="speaker" className="text-sm">
                Narasumber
              </Label>
              <Input
                id="speaker"
                placeholder="Contoh: Ustadz Khalid Basalamah"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Channel Name */}
            <div className="space-y-1.5">
              <Label htmlFor="channel-name" className="text-sm">
                Nama Channel
              </Label>
              <Input
                id="channel-name"
                placeholder="Contoh: KHB Official"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* AI Summary Option */}
          {aiAvailable && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="use-ai-summary"
                  checked={useAISummary}
                  onChange={(e) => setUseAISummary(e.target.checked)}
                  disabled={isLoading}
                  className="cursor-pointer disabled:cursor-not-allowed"
                />
                <Label htmlFor="use-ai-summary" className="cursor-pointer flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  Gunakan AI untuk meringkas
                </Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                {useAISummary
                  ? "Transcript akan diringkas menggunakan AI (lebih cepat dibaca)"
                  : "Transcript lengkap dengan timestamps akan diimpor"}
              </p>
            </div>
          )}

          {/* Info Box */}
          <Alert>
            <FileText className="w-4 h-4" />
            <AlertDescription className="text-sm">
              <strong>Yang akan diimpor:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Judul otomatis dari video</li>
                <li>
                  {useAISummary && aiAvailable
                    ? "Ringkasan AI dari transcript"
                    : "Transcript lengkap dengan timestamps"}
                </li>
                {(materialTitle || speaker || channelName) && <li>Kutipan sumber referensi di awal catatan</li>}
                <li>Link sumber video YouTube</li>
              </ul>
              <p className="mt-2 text-muted-foreground">Anda dapat mengedit catatan setelah diimpor</p>
            </AlertDescription>
          </Alert>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading Info Alert */}
          {isLoading && (
            <Alert className="border-blue-500/50 bg-blue-500/10">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <AlertDescription className="text-sm text-blue-500">
                <strong>Sedang memproses...</strong> Mohon tunggu.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
            Batal
          </Button>
          <Button type="button" onClick={handleImport} disabled={isLoading || !!urlError || !url.trim()}>
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
