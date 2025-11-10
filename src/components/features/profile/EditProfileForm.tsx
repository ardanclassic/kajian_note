/**
 * Edit Profile Form Component
 * Form for updating user profile information
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/supabase/user.service";
import { updateProfileSchema, type UpdateProfileFormData } from "@/schemas/user.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

      // Hide success message after 3 seconds
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
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Profil berhasil diperbarui!</AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName">
          Nama Lengkap <span className="text-red-500">*</span>
        </Label>
        <Input id="fullName" {...register("fullName")} placeholder="Nama lengkap Anda" />
        {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Nomor Telepon</Label>
        <Input id="phone" type="tel" {...register("phone")} placeholder="+62812345678 (opsional)" />
        {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
      </div>

      {/* Payment Email - NEW */}
      <div className="space-y-2">
        <Label htmlFor="paymentEmail" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email untuk Pembayaran
        </Label>
        <Input
          id="paymentEmail"
          type="email"
          {...register("paymentEmail")}
          placeholder="email@contoh.com (untuk verifikasi pembayaran)"
        />
        {errors.paymentEmail && <p className="text-sm text-red-500">{errors.paymentEmail.message}</p>}
        <p className="text-xs text-muted-foreground">
          💡 Email ini digunakan untuk mencocokkan pembayaran Lynk.id dengan akun Anda. Gunakan email yang sama saat
          checkout.
        </p>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          {...register("bio")}
          placeholder="Ceritakan sedikit tentang diri Anda (opsional)"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {errors.bio && <p className="text-sm text-red-500">{errors.bio.message}</p>}
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
