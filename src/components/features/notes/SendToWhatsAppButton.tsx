/**
 * SendToWhatsAppButton Component
 * Button to share PDF via WhatsApp link (FREE method)
 * ✅ FIXED v3: Better UX - Single tab, no double redirect
 */

import { useState } from "react";
import { MessageCircle, Loader2, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  lines.push("📚 *Catatan Kajian*");
  lines.push("");
  lines.push(`*${noteTitle}*`);
  lines.push("");
  lines.push("📄 Download PDF:");
  lines.push(pdfUrl);
  lines.push("");
  lines.push("_Link akan kedaluwarsa dalam 1 jam_");
  lines.push("");
  lines.push("─────────────");
  lines.push("Dibuat dengan Kajian Note");
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
  onError,
}: SendToWhatsAppButtonProps) {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    setSuccess(false);

    // ✅ Format phone number
    const formattedPhone = ensureInternationalFormat(user.phone!);

    console.log("═══════════════════════════════════");
    console.log("[WhatsApp] Starting PDF generation...");
    console.log("  Phone:", user.phone, "→", formattedPhone);
    console.log("═══════════════════════════════════");

    try {
      // ✅ STEP 1: Generate & Upload PDF FIRST (user waits on current page)
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

      // ✅ STEP 2: Build final WhatsApp link with PDF
      const finalMessage = buildWhatsAppMessage(note.title, uploadResult.url, note.id);
      const finalLink = buildWhatsAppLink(user.phone!, finalMessage);

      console.log("[WhatsApp] Opening WhatsApp with PDF link...");
      console.log("  URL:", finalLink.substring(0, 80) + "...");

      // ✅ STEP 3: Open WhatsApp ONLY ONCE with complete data
      window.open(finalLink, "_blank", "noopener,noreferrer");

      // Success!
      setSuccess(true);
      if (onSuccess) onSuccess();

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal membuat link WhatsApp";
      console.error("[WhatsApp] ❌ Error:", errorMessage);
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <AlertDescription className="text-sm">
            <strong className="text-yellow-600">Nomor WhatsApp diperlukan</strong>
            <p className="mt-1 text-muted-foreground">
              Silakan lengkapi nomor WhatsApp Anda di halaman profil untuk menggunakan fitur ini.
            </p>
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
        onClick={handleSendToWhatsApp}
        disabled={isLoading || success}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Memproses...
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Berhasil!
          </>
        ) : (
          <>
            <MessageCircle className="w-4 h-4 mr-2" />
            Send to WhatsApp
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
          <AlertDescription className="text-sm">
            <strong className="text-green-600">WhatsApp terbuka!</strong>
            <p className="mt-1 text-muted-foreground">
              Pesan sudah disiapkan dengan link PDF. Klik tombol "Send" di WhatsApp untuk mengirim.
            </p>
            <p className="mt-1 text-xs text-yellow-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Link akan kedaluwarsa pukul {getExpiryTimeText()} WIB
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading Info - Show detailed progress */}
      {isLoading && (
        <Alert className="border-blue-500/50 bg-blue-500/10">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <AlertDescription className="text-sm text-blue-600">
            <strong>Sedang memproses PDF Anda...</strong>
            <div className="mt-2 space-y-1 text-xs">
              <p>⏳ Mohon tunggu, proses ini memakan waktu 5-10 detik</p>
              <p>📄 Generating PDF dari catatan</p>
              <p>☁️ Uploading ke cloud storage</p>
              <p className="mt-2 text-muted-foreground">
                💡 <strong>WhatsApp akan terbuka otomatis</strong> setelah selesai
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Info Alert - Always show when not loading */}
      {!isLoading && !success && !error && (
        <Alert className="border-blue-500/30 bg-blue-500/5">
          <ExternalLink className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-xs text-muted-foreground">
            <strong className="text-blue-600">Cara kerja:</strong>
            <div className="mt-1 space-y-1">
              <p>1. Klik tombol "Send to WhatsApp"</p>
              <p>2. Tunggu proses generate PDF (5-10 detik)</p>
              <p>3. WhatsApp akan terbuka dengan pesan siap kirim</p>
              <p>4. Klik "Send" di WhatsApp untuk mengirim PDF</p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
