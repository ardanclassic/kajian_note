/**
 * Edit Profile Form Component - Clean Modern Design
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
import { Loader2, CheckCircle2, AlertCircle, Mail } from "lucide-react";

export default function EditProfileForm() {
  const { user, setUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  return (
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
        <Label htmlFor="phone">Nomor Telepon</Label>
        <Input
          id="phone"
          type="tel"
          {...register("phone")}
          placeholder="+62812345678 (opsional)"
          disabled={isSubmitting}
        />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
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
  );
}
