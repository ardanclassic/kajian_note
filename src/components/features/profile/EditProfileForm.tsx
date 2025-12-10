/**
 * Edit Profile Form Component - Clean Modern Design
 * UPDATED: Added Telegram verification section
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/supabase/user.service";
import { updateProfileSchema, type UpdateProfileFormData } from "@/schemas/user.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle, Mail, Send, ExternalLink, Copy, Check } from "lucide-react";
import { isTelegramConfigured } from "@/config/env";

export default function EditProfileForm() {
  const { user, setUser }: any = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      paymentEmail: (user as any)?.paymentEmail || "",
      bio: user?.bio || "",
    },
  });

  const onSubmit = async (data: UpdateProfileFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedUser = await userService.updateProfile(user.id, data);
      setUser(updatedUser);
      setSuccess(true);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy username to clipboard
  const handleCopyUsername = () => {
    if (user?.username) {
      navigator.clipboard.writeText(user.username);
      setCopiedUsername(true);
      setTimeout(() => setCopiedUsername(false), 2000);
    }
  };

  // Check Telegram verification status
  const isTelegramVerified = user?.telegramChatId && user?.telegramVerifiedAt;
  const telegramConfigured = isTelegramConfigured();

  return (
    <div className="space-y-6">
      {/* Main Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Success Alert */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <p className="text-sm font-medium">Profil berhasil diperbarui!</p>
          </motion.div>
        )}

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">
            Nama Lengkap <span className="text-destructive">*</span>
          </Label>
          <Input id="fullName" {...register("fullName")} placeholder="Nama lengkap Anda" disabled={isSubmitting} />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Nomor Telepon / WhatsApp</Label>
          <Input
            id="phone"
            type="tel"
            {...register("phone")}
            placeholder="+62812345678 atau 08123456789"
            disabled={isSubmitting}
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          <p className="text-xs text-muted-foreground">💡 Nomor ini digunakan untuk fitur "Send to WhatsApp"</p>
        </div>

        {/* Payment Email */}
        <div className="space-y-2">
          <Label htmlFor="paymentEmail" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email untuk Pembayaran
          </Label>
          <Input
            id="paymentEmail"
            type="email"
            {...register("paymentEmail")}
            placeholder="email@contoh.com"
            disabled={isSubmitting}
          />
          {errors.paymentEmail && <p className="text-xs text-destructive">{errors.paymentEmail.message}</p>}
          <p className="text-xs text-muted-foreground">
            💡 Email ini digunakan untuk mencocokkan pembayaran Lynk.id dengan akun Anda.
          </p>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            {...register("bio")}
            placeholder="Ceritakan sedikit tentang diri Anda (opsional)"
            disabled={isSubmitting}
            className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          />
          {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
          <p className="text-xs text-muted-foreground">Maksimal 200 karakter</p>
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
      </form>

      {/* Telegram Verification Section */}
      {telegramConfigured && (
        <Card className="md:p-6 border-none bg-transparent md:border-2 md:border-dashed">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-2 items-start justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-lg">Verifikasi Telegram</h3>
              </div>
              {isTelegramVerified ? (
                <Badge variant="default" className="gap-1 bg-sky-500">
                  <CheckCircle2 className="w-3 h-3" />
                  Terverifikasi
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Belum Verifikasi
                </Badge>
              )}
            </div>

            {isTelegramVerified ? (
              // Verified State
              <Alert className="border-sky-500/50 bg-sky-500/10">
                <AlertDescription className="text-sm">
                  <strong className="text-sky-300">Telegram Anda sudah terverifikasi!</strong>
                  <p className="mt-1 text-muted-foreground">
                    Anda dapat menggunakan fitur "Send to Telegram" untuk menerima PDF catatan langsung di Telegram.
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Chat ID: <code className="bg-muted px-1 py-0.5 rounded">{user?.telegramChatId}</code>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Diverifikasi:{" "}
                    {user?.telegramVerifiedAt ? new Date(user.telegramVerifiedAt).toLocaleDateString("id-ID") : "-"}
                  </p>
                </AlertDescription>
              </Alert>
            ) : (
              // Unverified State - Instructions
              <div className="space-y-4">
                <Alert className="border-blue-500/50 bg-blue-500/10">
                  <AlertCircle className="w-4 h-4 text-blue-300" />
                  <AlertDescription className="text-sm">
                    <strong className="text-blue-300">
                      Verifikasi Telegram untuk menggunakan fitur Send to Telegram
                    </strong>
                    <p className="mt-1 text-muted-foreground">
                      Ikuti langkah-langkah di bawah untuk menghubungkan akun Telegram Anda.
                    </p>
                  </AlertDescription>
                </Alert>

                {/* Step-by-step Instructions */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Cara Verifikasi:</h4>

                  {/* Step 1: Username */}
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Catat username Anda:</p>
                      <div className="mt-2 flex items-center gap-2">
                        <code className="flex-1 bg-muted px-3 py-2 rounded-lg font-mono text-sm">{user?.username}</code>
                        <Button variant="outline" size="sm" onClick={handleCopyUsername} className="shrink-0">
                          {copiedUsername ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Open Telegram */}
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Buka Telegram bot:</p>
                      <a
                        href="https://t.me/kajian_note_bot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white! rounded-lg text-sm font-medium transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        Buka @kajian_note_bot
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Step 3: Start Bot */}
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Kirim pesan ke bot:</p>
                      <code className="mt-2 block bg-muted px-3 py-2 rounded-lg font-mono text-sm">/start</code>
                    </div>
                  </div>

                  {/* Step 4: Verify */}
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                      4
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Verifikasi dengan username Anda:</p>
                      <code className="mt-2 block bg-muted px-3 py-2 rounded-lg font-mono text-sm">
                        /verify {user?.username}
                      </code>
                    </div>
                  </div>

                  {/* Step 5: Done */}
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 text-green-600 font-bold text-sm shrink-0">
                      ✓
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-600">
                        Selesai! Bot akan mengkonfirmasi verifikasi Anda.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Refresh halaman ini setelah verifikasi berhasil.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
