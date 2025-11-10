/**
 * Register Form Component
 * Form for new user registration
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { registerSchema, type RegisterFormData } from "@/schemas/auth.schema";
import { generateUsername } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();

  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      pin: "",
      confirmPin: "",
      phone: "",
    },
  });

  const fullName = watch("fullName");

  // Auto-generate username from full name
  useEffect(() => {
    if (fullName) {
      const generatedUsername = generateUsername(fullName);
      setValue("username", generatedUsername);
    }
  }, [fullName, setValue]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        fullName: data.fullName,
        username: data.username,
        pin: data.pin,
        phone: data.phone || undefined,
      });

      // Redirect to dashboard on success
      navigate("/dashboard");
    } catch (error) {
      // Error is handled by store
      console.error("Registration failed:", error);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Daftar Akun Baru</CardTitle>
        <CardDescription>Isi form di bawah untuk membuat akun Kajian Note</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap *</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Contoh: Ahmad Zaki"
              {...register("fullName")}
              disabled={isLoading}
            />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
          </div>

          {/* Username (auto-generated) */}
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              type="text"
              placeholder="Otomatis dari nama"
              {...register("username")}
              disabled={isLoading}
            />
            {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
            <p className="text-xs text-muted-foreground">Username dibuat otomatis dari nama. Bisa diubah manual.</p>
          </div>

          {/* Phone (optional) */}
          <div className="space-y-2">
            <Label htmlFor="phone">Nomor HP (Opsional)</Label>
            <Input id="phone" type="tel" placeholder="08123456789" {...register("phone")} disabled={isLoading} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            <p className="text-xs text-muted-foreground">Nomor HP tidak wajib, hanya untuk kontak saja.</p>
          </div>

          {/* PIN */}
          <div className="space-y-2">
            <Label htmlFor="pin">PIN (6 Digit) *</Label>
            <div className="relative">
              <Input
                id="pin"
                type={showPin ? "text" : "password"}
                placeholder="123456"
                maxLength={6}
                inputMode="numeric"
                {...register("pin")}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPin(!showPin)}
                disabled={isLoading}
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.pin && <p className="text-sm text-destructive">{errors.pin.message}</p>}
          </div>

          {/* Confirm PIN */}
          <div className="space-y-2">
            <Label htmlFor="confirmPin">Konfirmasi PIN *</Label>
            <div className="relative">
              <Input
                id="confirmPin"
                type={showConfirmPin ? "text" : "password"}
                placeholder="123456"
                maxLength={6}
                inputMode="numeric"
                {...register("confirmPin")}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirmPin(!showConfirmPin)}
                disabled={isLoading}
              >
                {showConfirmPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.confirmPin && <p className="text-sm text-destructive">{errors.confirmPin.message}</p>}
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <Button type="submit" className="w-full text-white" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mendaftar...
              </>
            ) : (
              "Daftar"
            )}
          </Button>

          {/* Link to login */}
          <div className="text-center text-sm">
            Sudah punya akun?{" "}
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={() => navigate("/login")}
              disabled={isLoading}
            >
              Login di sini
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
