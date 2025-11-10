/**
 * Change PIN Form Component
 * Form for changing user PIN
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { changePINSchema } from "@/schemas/auth.schema";
import type { ChangePINFormData } from "@/schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

interface ChangePINFormProps {
  forced?: boolean;
}

export default function ChangePINForm({ forced = false }: ChangePINFormProps) {
  const navigate = useNavigate();
  const { changePIN, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show/hide PIN states
  const [showOldPIN, setShowOldPIN] = useState(false);
  const [showNewPIN, setShowNewPIN] = useState(false);
  const [showConfirmPIN, setShowConfirmPIN] = useState(false);

  const form = useForm<ChangePINFormData>({
    resolver: zodResolver(changePINSchema),
    defaultValues: {
      oldPin: "",
      newPin: "",
      confirmPin: "",
    },
  });

  const onSubmit = async (data: ChangePINFormData) => {
    if (!user?.username) return;

    try {
      setIsLoading(true);
      setSuccess(false);
      setError(null);

      // Map form data to auth service format
      await changePIN({
        oldPin: data.oldPin,
        newPin: data.newPin,
        confirmPin: data.confirmPin,
      });

      setSuccess(true);

      // If forced, redirect to dashboard after 2 seconds
      if (forced) {
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        // Reset form
        form.reset();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Gagal mengubah PIN");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Forced Change Warning */}
      {forced && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="text-sm font-medium">PIN Anda telah direset</p>
            <p className="text-xs">Silakan buat PIN baru untuk melanjutkan</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800">
          <CheckCircle className="h-5 w-5" />
          <p className="text-sm font-medium">
            {forced ? "PIN berhasil diubah! Mengalihkan ke dashboard..." : "PIN berhasil diubah!"}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Old PIN */}
          <FormField
            control={form.control}
            name="oldPin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PIN Lama</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showOldPIN ? "text" : "password"}
                      placeholder="Masukkan PIN lama (6 digit)"
                      maxLength={6}
                      {...field}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowOldPIN(!showOldPIN)}
                      disabled={isLoading}
                    >
                      {showOldPIN ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* New PIN */}
          <FormField
            control={form.control}
            name="newPin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PIN Baru</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showNewPIN ? "text" : "password"}
                      placeholder="Masukkan PIN baru (6 digit)"
                      maxLength={6}
                      {...field}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPIN(!showNewPIN)}
                      disabled={isLoading}
                    >
                      {showNewPIN ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>PIN harus 6 digit angka</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm New PIN */}
          <FormField
            control={form.control}
            name="confirmPin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Konfirmasi PIN Baru</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPIN ? "text" : "password"}
                      placeholder="Masukkan ulang PIN baru"
                      maxLength={6}
                      {...field}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPIN(!showConfirmPIN)}
                      disabled={isLoading}
                    >
                      {showConfirmPIN ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengubah PIN...
              </>
            ) : (
              "Ubah PIN"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
