/**
 * Change PIN Form Component - Improved UI/UX
 * ✅ Better PIN input design with toggle visibility
 * ✅ Enhanced security visual feedback
 * ✅ Smooth animations & transitions
 * ✅ Mobile-optimized layout
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { changePINSchema } from "@/schemas/auth.schema";
import type { ChangePINFormData } from "@/schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff, Lock, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChangePINFormProps {
  forced?: boolean;
}

export default function ChangePINForm({ forced = false }: ChangePINFormProps) {
  const navigate = useNavigate();
  const { changePIN, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      await changePIN({
        oldPin: data.oldPin,
        newPin: data.newPin,
        confirmPin: data.confirmPin,
      });

      setSuccess(true);

      if (forced) {
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
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
    <div className="space-y-6">
      {/* Forced Change Warning */}
      {forced && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Alert className="border-yellow-500/50 bg-yellow-500/10">
            <Shield className="h-5 w-5 text-yellow-400" />
            <AlertDescription className="space-y-1">
              <p className="text-sm font-semibold text-yellow-400">PIN Anda telah direset oleh admin</p>
              <p className="text-xs text-yellow-500 leading-relaxed">
                Untuk keamanan akun, silakan buat PIN baru sekarang. Anda akan diarahkan ke dashboard setelah berhasil.
              </p>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Success Message */}
      <AnimatePresence mode="wait">
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Alert className="border-emerald-500/50 bg-emerald-500/10">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <AlertDescription className="space-y-1">
                <p className="text-sm font-semibold text-emerald-400">
                  {forced ? "PIN berhasil diubah! Mengalihkan ke dashboard..." : "PIN berhasil diubah!"}
                </p>
                {!forced && <p className="text-xs text-emerald-500">PIN baru Anda telah tersimpan dengan aman.</p>}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <AlertDescription>
                <p className="text-sm font-semibold text-red-400">{error}</p>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Old PIN */}
          <FormField
            control={form.control}
            name="oldPin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  PIN Lama
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showOldPIN ? "text" : "password"}
                      placeholder="••••••"
                      maxLength={6}
                      {...field}
                      disabled={isLoading}
                      className="h-11 pr-11 bg-black/50 border-gray-800 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20 font-mono text-lg tracking-widest"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-gray-800"
                      onClick={() => setShowOldPIN(!showOldPIN)}
                      disabled={isLoading}
                    >
                      {showOldPIN ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                {form.formState.errors.oldPin && (
                  <FormMessage className="text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{form.formState.errors.oldPin.message}</span>
                  </FormMessage>
                )}
              </FormItem>
            )}
          />

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-gray-900 px-3 text-gray-500">PIN Baru</span>
            </div>
          </div>

          {/* New PIN */}
          <FormField
            control={form.control}
            name="newPin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  PIN Baru
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showNewPIN ? "text" : "password"}
                      placeholder="••••••"
                      maxLength={6}
                      {...field}
                      disabled={isLoading}
                      className="h-11 pr-11 bg-black/50 border-gray-800 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20 font-mono text-lg tracking-widest"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-gray-800"
                      onClick={() => setShowNewPIN(!showNewPIN)}
                      disabled={isLoading}
                    >
                      {showNewPIN ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormDescription className="text-xs text-gray-500 flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">💡</span>
                  <span>PIN harus 6 digit angka</span>
                </FormDescription>
                {form.formState.errors.newPin && (
                  <FormMessage className="text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{form.formState.errors.newPin.message}</span>
                  </FormMessage>
                )}
              </FormItem>
            )}
          />

          {/* Confirm New PIN */}
          <FormField
            control={form.control}
            name="confirmPin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Konfirmasi PIN Baru
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPIN ? "text" : "password"}
                      placeholder="••••••"
                      maxLength={6}
                      {...field}
                      disabled={isLoading}
                      className="h-11 pr-11 bg-black/50 border-gray-800 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20 font-mono text-lg tracking-widest"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-gray-800"
                      onClick={() => setShowConfirmPIN(!showConfirmPIN)}
                      disabled={isLoading}
                    >
                      {showConfirmPIN ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                {form.formState.errors.confirmPin && (
                  <FormMessage className="text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{form.formState.errors.confirmPin.message}</span>
                  </FormMessage>
                )}
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengubah PIN...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Ubah PIN
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Security Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="pt-4 border-t border-gray-800"
      >
        <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-blue-400">Tips Keamanan PIN</p>
            <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
              <li>Gunakan kombinasi angka yang tidak mudah ditebak</li>
              <li>Jangan gunakan tanggal lahir atau nomor telepon</li>
              <li>Ubah PIN secara berkala untuk keamanan maksimal</li>
              <li>Jangan bagikan PIN Anda kepada siapapun</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
