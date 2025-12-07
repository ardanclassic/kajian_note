/**
 * SendToTelegramButton Component
 * Button to send PDF to user's Telegram via bot
 */

import { useState } from "react";
import { Send, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  onError?: (error: string) => void;
}

export function SendToTelegramButton({
  note,
  variant = "default",
  size = "default",
  className = "",
  onSuccess,
  onError,
}: SendToTelegramButtonProps) {
  const { user }: any = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check if user has verified Telegram
  const isVerified = user?.telegramChatId && user?.telegramVerifiedAt;
  const botUsername = env.telegram.botToken.split(":")[0]; // Extract bot ID from token

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
    setError(null);
    setSuccess(false);

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

      // Success!
      setSuccess(true);
      if (onSuccess) onSuccess();

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal mengirim ke Telegram";
      console.error("[Telegram] Error:", errorMessage);
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
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
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <AlertDescription className="text-sm">
            <strong className="text-yellow-600">Verifikasi Telegram diperlukan</strong>
            <p className="mt-1 text-muted-foreground">
              1. Buka Telegram dan cari bot:{" "}
              <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">@kajian_note_bot</code>
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
    <div className="space-y-2">
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleSendToTelegram}
        disabled={isLoading || success}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Mengirim...
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Terkirim!
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Send to Telegram
          </>
        )}
      </Button>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-sm text-green-600">
            PDF berhasil dikirim ke Telegram Anda! Silakan cek aplikasi Telegram.
          </AlertDescription>
        </Alert>
      )}

      {/* Loading Info */}
      {isLoading && (
        <Alert className="border-blue-500/50 bg-blue-500/10">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <AlertDescription className="text-sm text-blue-600">
            <strong>Sedang memproses...</strong> Generating PDF dan mengirim ke Telegram (±10-15 detik).
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
