/**
 * SendToWhatsAppButton Component
 * Button to share PDF via WhatsApp link (FREE method)
 * ✅ FIXED v4: Proper confirmation dialog before redirect
 */

import { useState } from "react";
import { MessageCircle, Loader2, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/common/confirmDialog";
import { useAuthStore } from "@/store/authStore";
import { uploadNotePDFWithRetry } from "@/services/storage/imagekitStorage";
import { isValidPhoneNumber, getExpiryTimeText } from "@/utils/whatsappHelper";
import type { Note } from "@/types/notes.types";

interface SendToWhatsAppButtonProps {
  note: Note;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
  onSuccess?: () => void;
  onExit?: () => void;
  onError?: (error: string) => void;
}

/**
 * ✅ Format phone to international format (62xxx)
 */
function ensureInternationalFormat(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  } else if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned;
  } else if (cleaned.startsWith("+62")) {
    cleaned = cleaned.substring(1);
  } else if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }

  return cleaned;
}

/**
 * ✅ Build WhatsApp message
 */
function buildWhatsAppMessage(noteTitle: string, pdfUrl: string, noteId?: string): string {
  const lines: string[] = [];
  lines.push(`*${noteTitle}*`);
  lines.push("");
  lines.push("Link Download PDF:");
  lines.push(pdfUrl);
  lines.push("");
  lines.push("_Link akan kedaluwarsa dalam 1 jam_");
  lines.push("");
  lines.push("──────────────────────────");
  lines.push("by Kajian Note");
  if (noteId) {
    lines.push(`ID: ${noteId}`);
  }
  return lines.join("\n");
}

/**
 * ✅ Build wa.me link
 */
function buildWhatsAppLink(phone: string, message: string): string {
  const formattedPhone = ensureInternationalFormat(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

export function SendToWhatsAppButton({
  note,
  variant = "default",
  size = "default",
  className = "",
  onSuccess,
  onExit,
  onError,
}: SendToWhatsAppButtonProps) {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState<string>("");
  const [previewMessage, setPreviewMessage] = useState<string>("");

  // Check if user has phone number
  const hasPhone = user?.phone && isValidPhoneNumber(user.phone);

  const handleSendToWhatsApp = async () => {
    if (!user) {
      setError("Sesi berakhir. Silakan login kembali.");
      return;
    }

    if (!hasPhone) {
      setError("Nomor WhatsApp belum diisi. Silakan lengkapi profil Anda.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // ✅ Format phone number
    const formattedPhone = ensureInternationalFormat(user.phone!);

    console.log("╔══════════════════════════════════╗");
    console.log("[WhatsApp] Starting PDF generation...");
    console.log("  Phone:", user.phone, "→", formattedPhone);
    console.log("╚══════════════════════════════════╝");

    try {
      // ✅ STEP 1: Generate & Upload PDF FIRST
      console.log("[WhatsApp] Generating PDF...");
      const uploadResult = await uploadNotePDFWithRetry(note, {
        ttl: 3600, // 1 hour
        folder: "temp-pdfs",
        tags: ["whatsapp", "kajian-note"],
      });

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Gagal mengupload PDF");
      }

      console.log("[WhatsApp] PDF ready:", uploadResult.url);

      // ✅ STEP 2: Build WhatsApp link and message
      const finalMessage = buildWhatsAppMessage(note.title, uploadResult.url, note.id);
      const finalLink = buildWhatsAppLink(user.phone!, finalMessage);

      // ✅ STEP 3: Store and show confirmation dialog
      setWhatsappLink(finalLink);
      setPreviewMessage(finalMessage);
      setShowConfirmDialog(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal membuat link WhatsApp";
      console.error("[WhatsApp] ❌ Error:", errorMessage);
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmRedirect = () => {
    console.log("[WhatsApp] Opening WhatsApp...");
    window.open(whatsappLink, "_blank", "noopener,noreferrer");
    setShowConfirmDialog(false);

    // Call onSuccess after user confirms and redirects
    if (onSuccess) onSuccess();
  };

  // If no phone number, show message
  if (!hasPhone) {
    return (
      <div className="space-y-2">
        <Button variant="outline" size={size} className={className} disabled>
          <MessageCircle className="w-4 h-4 mr-2" />
          Send to WhatsApp
        </Button>
        <Alert variant="default" className="border-yellow-500/50 bg-yellow-500/10">
          <AlertCircle className="w-4 h-4 text-yellow-300" />
          <AlertDescription className="text-sm">
            <strong className="text-yellow-300">Nomor WhatsApp diperlukan</strong>
            <p className="mt-1 text-muted-foreground">
              Silakan lengkapi nomor WhatsApp Anda di halaman profil untuk menggunakan fitur ini.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {!isLoading && (
          <div className="flex items-center justify-between gap-2">
            <Button
              variant={variant}
              size={size}
              className={"w-[80%] text-green-300"}
              onClick={handleSendToWhatsApp}
              disabled={isLoading}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Send to WhatsApp
            </Button>
            <Button variant={variant} size={size} className={"w-[20%]"} onClick={() => onExit?.()} disabled={isLoading}>
              ×
            </Button>
          </div>
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
          <Alert className="border-green-500/50 bg-green-500/10">
            <Loader2 className="w-4 h-4 animate-spin text-green-300" />
            <AlertDescription className="text-sm text-green-300">
              <strong>Sedang memproses PDF Anda...</strong>
              <div className="mt-2 space-y-1 text-xs">
                <p>⏳ Mohon tunggu, proses ini memakan waktu 5-10 detik</p>
                <p>📄 Generating PDF dari catatan</p>
                <p>☁️ Uploading ke cloud storage</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Info Alert */}
        {!isLoading && !error && (
          <Alert className="border-green-500/30 bg-green-500/5">
            <AlertDescription className="text-xs text-muted-foreground">
              <strong className="text-green-300">Cara kerja:</strong>
              <div className="mt-1 space-y-1">
                <p>1. Klik tombol "Send to WhatsApp"</p>
                <p>2. Tunggu proses generate PDF (5-10 detik)</p>
                <p>3. Konfirmasi untuk membuka WhatsApp</p>
                <p>4. Klik "Send" di WhatsApp untuk mengirim PDF</p>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="PDF Siap Dikirim!"
        description={
          <>
            <div className="text-sm mb-3">
              PDF telah berhasil dibuat dan siap dikirim ke WhatsApp. Klik tombol "Buka WhatsApp" untuk melanjutkan.
            </div>

            <div className="rounded-lg bg-muted p-3 text-xs mb-3">
              <div className="font-medium mb-2">Preview Pesan:</div>
              <pre className="whitespace-pre-wrap text-muted-foreground font-mono text-[11px]">
                {previewMessage.split("\n").slice(0, 8).join("\n")}
                {previewMessage.split("\n").length > 8 && "\n..."}
              </pre>
            </div>

            <Alert className="border-yellow-500/50 bg-yellow-500/10">
              <AlertCircle className="w-4 h-4 text-yellow-300" />
              <AlertDescription className="text-xs text-yellow-300">
                Link akan kedaluwarsa pukul {getExpiryTimeText()} WIB
              </AlertDescription>
            </Alert>
          </>
        }
        confirmText="Buka WhatsApp"
        cancelText="Batal"
        onConfirm={handleConfirmRedirect}
        variant="success"
        showCancel={true}
      />
    </>
  );
}
