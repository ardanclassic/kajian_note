/**
 * Login Form Component
 * Form for user authentication
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [showPin, setShowPin] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      pin: "",
    },
  });

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);

      // Redirect to dashboard on success
      navigate("/dashboard");
    } catch (error) {
      // Error is handled by store
      console.error("Login failed:", error);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Masuk dengan username dan PIN Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Masukkan username"
              autoComplete="username"
              {...register("username")}
              disabled={isLoading}
            />
            {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
          </div>

          {/* PIN */}
          <div className="space-y-2">
            <Label htmlFor="pin">PIN (6 Digit)</Label>
            <div className="relative">
              <Input
                id="pin"
                type={showPin ? "text" : "password"}
                placeholder="Masukkan PIN"
                maxLength={6}
                inputMode="numeric"
                autoComplete="current-password"
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
                Masuk...
              </>
            ) : (
              "Masuk"
            )}
          </Button>

          {/* Help text */}
          <div className="space-y-2 text-center text-sm text-muted-foreground">
            <p>Lupa PIN? Hubungi Admin atau Panitia untuk reset</p>
            <div className="border-t pt-2">
              Belum punya akun?{" "}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto font-normal"
                onClick={() => navigate("/register")}
                disabled={isLoading}
              >
                Daftar di sini
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
