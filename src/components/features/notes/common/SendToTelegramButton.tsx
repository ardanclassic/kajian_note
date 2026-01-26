/**
 * SendToTelegramButton Component
 * Button to send PDF to user's Telegram via bot
 * ✅ FIXED: Proper success notification dialog
 */

import { useState } from "react";
import { Send, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useAuthStore } from "@/store/authStore";
import { uploadNotePDFWithRetry } from "@/services/storage/imagekitStorage";
import type { Note } from "@/types/notes.types";
import { env } from "@/config/env";

interface SendToTelegramButtonProps {
  note: Note;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
  onSuccess?: () => void;
  onExit?: () => void;
  onError?: (error: string) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export function SendToTelegramButton({
  note,
  variant = "default",
  size = "default",
  className = "",
  onSuccess,
  onExit,
  onError,
  onLoadingChange,
}: SendToTelegramButtonProps) {
  const { user }: any = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Check if user has verified Telegram
  const isVerified = user?.telegramChatId && user?.telegramVerifiedAt;

  const handleSendToTelegram = async () => {
    if (!user) {
      setError("Sesi berakhir. Silakan login kembali.");
      return;
    }

    if (!isVerified) {
      setError("Telegram belum terverifikasi. Silakan verifikasi dulu.");
      return;
    }

    setIsLoading(true);
    if (onLoadingChange) onLoadingChange(true);
    setError(null);

    try {
      // Step 1: Upload PDF to ImageKit
      console.log("[Telegram] Uploading PDF to ImageKit...");
      const uploadResult = await uploadNotePDFWithRetry(note, {
        ttl: 3600, // 1 hour
        folder: "temp-pdfs",
        tags: ["telegram", "kajian-note"],
      });

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Gagal mengupload PDF");
      }

      console.log("[Telegram] PDF uploaded:", uploadResult.url);

      // Step 2: Send to Telegram via Edge Function
      console.log("[Telegram] Sending to Telegram bot...");
      const response = await fetch(`${env.supabase.url}/functions/v1/send-telegram`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.supabase.anonKey}`,
        },
        body: JSON.stringify({
          chat_id: user.telegramChatId,
          pdf_url: uploadResult.url,
          note_title: note.title,
          note_id: note.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal mengirim ke Telegram");
      }

      const result = await response.json();
      console.log("[Telegram] Sent successfully:", result);

      // Show success dialog (no auto-close)
      setShowSuccessDialog(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal mengirim ke Telegram";
      console.error("[Telegram] Error:", errorMessage);
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  };

  // If not verified, show verification needed message
  if (!isVerified) {
    return (
      <div className="space-y-2">
        <Button variant="outline" size={size} className={className} disabled>
          <Send className="w-4 h-4 mr-2" />
          Send to Telegram
        </Button>
        <Alert variant="default" className="border-yellow-500/50 bg-yellow-500/10">
          <AlertCircle className="w-4 h-4 text-yellow-300" />
          <AlertDescription className="text-sm">
            <strong className="text-yellow-300">Verifikasi Telegram diperlukan</strong>
            <p className="mt-1 text-muted-foreground">
              1. Buka Telegram dan cari bot:{" "}
              <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">@alwaah_bot</code>
            </p>
            <p className="text-muted-foreground">
              2. Kirim: <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">/start</code>
            </p>
            <p className="text-muted-foreground">3. Ikuti instruksi verifikasi dari bot</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {!isLoading && (
          <Button
            variant={variant}
            size={size}
            className="w-full h-12 text-base bg-blue-600/80 hover:bg-blue-600 text-white border-0"
            onClick={handleSendToTelegram}
            disabled={isLoading}
          >
            <Send className="w-4 h-4 mr-2" />
            Send to Telegram
          </Button>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading Info */}
        {isLoading && (
          <Alert className="border-blue-500/50 bg-blue-500/10">
            <Loader2 className="w-4 h-4 animate-spin text-blue-300" />
            <AlertDescription className="text-sm text-blue-300">
              <strong>Sedang memproses...</strong> Generating PDF dan mengirim ke Telegram (±10-15 detik).
            </AlertDescription>
          </Alert>
        )}

        {/* Info Alert - Cara Kerja */}
        {!isLoading && !error && (
          <Alert className="border-blue-500/30 bg-blue-500/5">
            <AlertDescription className="text-xs text-muted-foreground">
              <strong className="text-blue-300">Cara kerja:</strong>
              <div className="mt-1 space-y-1">
                <p>1. Pastikan Anda sudah start bot <strong>@alwaah_bot</strong></p>
                <p>2. Klik tombol "Send to Telegram" di atas</p>
                <p>3. Tunggu proses generate PDF selesai</p>
                <p>4. PDF akan dikirim otomatis ke chat Telegram Anda</p>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Success Dialog */}
      <ConfirmDialog
        open={showSuccessDialog}
        onOpenChange={(open) => {
          setShowSuccessDialog(open);
          // Call onSuccess when user closes the dialog
          if (!open && onSuccess) {
            onSuccess();
          }
        }}
        title="Berhasil Terkirim!"
        description={
          <>
            <div className="text-base text-gray-300 mb-4 leading-relaxed">
              Catatan <strong>"{note.title}"</strong> telah berhasil dikonversi menjadi PDF dan dikirimkan ke akun Telegram Anda.
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-100">
                  Silakan periksa chat dengan <strong>Alwaah Bot</strong> di Telegram untuk mengunduh file PDF Anda.
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              *Jika pesan tidak masuk, pastikan Anda tidak memblokir bot kami.
            </p>
          </>
        }
        confirmText="Oke, Mengerti"
        variant="success"
        showCancel={false}
      />
    </>
  );
}
