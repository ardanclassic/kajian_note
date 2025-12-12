/**
 * Edit Profile Form Component - Improved UI/UX
 * ✅ Better spacing & visual hierarchy
 * ✅ Enhanced input states & feedback
 * ✅ Modern Telegram verification section
 * ✅ Mobile-optimized layout
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/supabase/user.service";
import { updateProfileSchema, type UpdateProfileFormData } from "@/schemas/user.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Send,
  ExternalLink,
  Copy,
  Check,
  Phone,
  User,
  MessageSquare,
  Shield,
} from "lucide-react";
import { isTelegramConfigured } from "@/config/env";
import { FormLabel } from "@/components/ui/form";

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
    <div className="space-y-8">
      {/* Main Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Success Alert */}
        <AnimatePresence mode="wait">
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Alert className="border-emerald-500/50 bg-emerald-500/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <AlertDescription className="text-sm text-emerald-400 font-medium">
                  Profil berhasil diperbarui!
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Alert className="border-red-500/50 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-sm text-red-400 font-medium">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Fields */}
        <div className="space-y-5">
          {/* Full Name */}
          <div className="space-y-2.5">
            <Label htmlFor="fullName" className="text-sm font-semibold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              Nama Lengkap
              <span className="text-red-400">*</span>
            </Label>
            <Input
              id="fullName"
              {...register("fullName")}
              placeholder="Masukkan nama lengkap Anda"
              disabled={isSubmitting}
              className="h-11 bg-black/50 border-gray-800 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
            />
            {errors.fullName && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 flex items-center gap-1.5"
              >
                <AlertCircle className="w-3 h-3" />
                {errors.fullName.message}
              </motion.p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2.5">
            <Label htmlFor="phone" className="text-sm font-semibold text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              Nomor Telepon / WhatsApp
            </Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="+62812345678 atau 08123456789"
              disabled={isSubmitting}
              className="h-11 bg-black/50 border-gray-800 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
            />
            {errors.phone && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 flex items-center gap-1.5"
              >
                <AlertCircle className="w-3 h-3" />
                {errors.phone.message}
              </motion.p>
            )}
            <p className="text-xs text-gray-500 flex items-start gap-1.5">
              <span className="text-emerald-400 mt-0.5">💡</span>
              <span>Nomor ini digunakan untuk fitur "Send to WhatsApp"</span>
            </p>
          </div>

          {/* Payment Email */}
          <div className="space-y-2.5">
            <Label htmlFor="paymentEmail" className="text-sm font-semibold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              Email untuk Pembayaran
            </Label>
            <Input
              id="paymentEmail"
              type="email"
              {...register("paymentEmail")}
              placeholder="email@contoh.com"
              disabled={isSubmitting}
              className="h-11 bg-black/50 border-gray-800 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
            />
            {errors.paymentEmail && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 flex items-center gap-1.5"
              >
                <AlertCircle className="w-3 h-3" />
                {errors.paymentEmail.message}
              </motion.p>
            )}
            <p className="text-xs text-gray-500 flex items-start gap-1.5">
              <span className="text-emerald-400 mt-0.5">💡</span>
              <span>Email ini digunakan untuk mencocokkan pembayaran Lynk.id dengan akun Anda</span>
            </p>
          </div>

          {/* Bio */}
          <div className="space-y-2.5">
            <Label htmlFor="bio" className="text-sm font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Bio
              <span className="text-xs font-normal text-gray-500">(opsional)</span>
            </Label>
            <textarea
              id="bio"
              {...register("bio")}
              placeholder="Ceritakan sedikit tentang diri Anda..."
              disabled={isSubmitting}
              rows={4}
              className="flex min-h-[100px] w-full rounded-lg border border-gray-800 bg-black/50 px-4 py-3 text-sm text-white shadow-xs transition-all outline-none placeholder:text-gray-600 focus-visible:border-emerald-500/50 focus-visible:ring-[3px] focus-visible:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
            {errors.bio && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 flex items-center gap-1.5"
              >
                <AlertCircle className="w-3 h-3" />
                {errors.bio.message}
              </motion.p>
            )}
            <p className="text-xs text-gray-500">Maksimal 200 karakter</p>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Simpan Perubahan
            </>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-800"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-gray-900 px-3 text-gray-500">Telegram Status</span>
        </div>
      </div>

      {/* Telegram Verification Section */}
      {telegramConfigured && (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                <Send className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Verifikasi Telegram</h3>
                <p className="text-xs text-gray-500">Kirim catatan ke Telegram Anda</p>
              </div>
            </div>
            {isTelegramVerified ? (
              <Badge className="gap-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-3 py-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Terverifikasi
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Belum Verifikasi
              </Badge>
            )}
          </div>

          {isTelegramVerified ? (
            // Verified State
            <Alert className="border-emerald-500/30 bg-emerald-500/5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <AlertDescription className="space-y-2">
                <p className="text-sm font-semibold text-emerald-400">Telegram Anda sudah terverifikasi!</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Anda dapat menggunakan fitur "Send to Telegram" untuk menerima PDF catatan langsung di Telegram.
                </p>
                <div className="pt-2 space-y-1">
                  <p className="text-xs text-gray-500">
                    Chat ID:{" "}
                    <code className="bg-black/50 px-2 py-0.5 rounded text-gray-400">{user?.telegramChatId}</code>
                  </p>
                  <p className="text-xs text-gray-500">
                    Diverifikasi:{" "}
                    {user?.telegramVerifiedAt
                      ? new Date(user.telegramVerifiedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            // Unverified State - Instructions
            <div className="space-y-5">
              <Alert className="border-blue-500/30 bg-blue-500/5">
                <AlertCircle className="w-4 h-4 text-blue-400" />
                <AlertDescription className="space-y-1">
                  <p className="text-sm font-semibold text-blue-400">
                    Verifikasi Telegram untuk menggunakan fitur Send to Telegram
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Ikuti langkah-langkah di bawah untuk menghubungkan akun Telegram Anda.
                  </p>
                </AlertDescription>
              </Alert>

              {/* Step-by-step Instructions */}
              <div className="space-y-4">
                {/* Step 1: Username */}
                <div className="flex gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm shrink-0">
                    1
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-white">Catat username Anda:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-black/50 border border-gray-800 px-3 py-2.5 rounded-lg font-mono text-sm text-emerald-400">
                        {user?.username}
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleCopyUsername}
                        className="shrink-0 h-10 w-10 border-gray-800 hover:border-emerald-500/50 hover:bg-emerald-500/10"
                      >
                        {copiedUsername ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Step 2: Open Telegram */}
                <div className="flex gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm shrink-0">
                    2
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-white">Buka Telegram bot:</p>
                    <a
                      href="https://t.me/kajian_note_bot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-600/20"
                    >
                      <Send className="w-4 h-4" />
                      Buka @kajian_note_bot
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Step 3: Start Bot */}
                <div className="flex gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm shrink-0">
                    3
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-white">Kirim pesan ke bot:</p>
                    <code className="block bg-black/50 border border-gray-800 px-3 py-2.5 rounded-lg font-mono text-sm text-blue-400">
                      /start
                    </code>
                  </div>
                </div>

                {/* Step 4: Verify */}
                <div className="flex gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm shrink-0">
                    4
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-white">Verifikasi dengan username Anda:</p>
                    <code className="block bg-black/50 border border-gray-800 px-3 py-2.5 rounded-lg font-mono text-sm text-emerald-400">
                      /verify {user?.username}
                    </code>
                  </div>
                </div>

                {/* Step 5: Done */}
                <div className="flex gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-bold text-sm shrink-0">
                    ✓
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold text-emerald-400">
                      Selesai! Bot akan mengkonfirmasi verifikasi Anda.
                    </p>
                    <p className="text-xs text-gray-500">Refresh halaman ini setelah verifikasi berhasil.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
