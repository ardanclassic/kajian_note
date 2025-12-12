/**
 * Typeform-style Login Form Component
 * Improved multi-step login with smooth animations
 *
 * Filepath: src/components/features/auth/TypeformLoginForm.tsx
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { AtSign, Lock, Eye, EyeOff, Home } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TypeformStep } from "./TypeformStep";
import { ProgressIndicator } from "./ProgressIndicator";

export const TypeformLoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [showPin, setShowPin] = useState(false);

  const totalSteps = 2;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    getValues,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      pin: "",
    },
  });

  const username = watch("username");
  const pin = watch("pin");

  // Auto-focus on step change
  useEffect(() => {
    const timeout = setTimeout(() => {
      const fieldName = currentStep === 1 ? "username" : "pin";
      const element = document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement;
      element?.focus();
    }, 500); // Perpanjang jadi 500ms - sinkron dengan animation duration

    return () => clearTimeout(timeout);
  }, [currentStep]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // Handle next step
  const handleNext = async () => {
    if (currentStep === 1) {
      const isValid = await trigger("username");
      if (isValid) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      const isValid = await trigger("pin");
      if (isValid) {
        await onSubmit(getValues());
      }
    }
  };

  // Handle back step
  const handleBack = () => {
    setCurrentStep(1);
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      e.preventDefault();
      handleNext();
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress Indicator */}
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

      {/* Step wrapper dengan relative positioning untuk prevent height jump */}
      <div className="relative min-h-80">
        {/* Step 1: Username */}
        <TypeformStep
          isActive={currentStep === 1}
          stepKey="login-step-1"
          title="Halo! Senang ketemu lagi 👋"
          subtitle="Yuk masukkan username-mu dulu"
          onNext={handleNext}
          nextDisabled={!username || !!errors.username}
          error={errors.username?.message}
        >
          <div className="space-y-3">
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                type="text"
                placeholder="username kamu"
                autoComplete="username"
                {...register("username")}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="h-12 pl-11 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-lg transition-all"
              />
            </div>
            <p className="text-xs text-gray-500">
              Tekan <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-gray-400">Enter</kbd>{" "}
              atau klik Lanjut ya~
            </p>
          </div>
        </TypeformStep>

        {/* Step 2: PIN */}
        <TypeformStep
          isActive={currentStep === 2}
          stepKey="login-step-2"
          title={`Oke ${username}, satu langkah lagi! 🔐`}
          subtitle="Masukin PIN-mu dong biar bisa lanjut"
          onNext={handleNext}
          onBack={handleBack}
          nextLabel="Masuk"
          nextDisabled={!pin || !!errors.pin}
          isLoading={isLoading}
          error={errors.pin?.message || error || undefined}
        >
          <div className="space-y-3">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                type={showPin ? "text" : "password"}
                placeholder="••••••"
                maxLength={6}
                inputMode="numeric"
                autoComplete="current-password"
                {...register("pin")}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="h-12 pl-11 pr-11 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-lg tracking-widest transition-all"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-gray-700/50"
                onClick={() => setShowPin(!showPin)}
              >
                {showPin ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500">Lupa PIN? Tenang, chat Admin atau Panitia aja ya 💬</p>
          </div>
        </TypeformStep>
      </div>

      {/* Back to Home */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center pt-2"
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          disabled={isLoading}
          className="group text-muted-foreground hover:text-emerald-400 transition-colors"
        >
          <Home className="mr-2 h-4 w-4" />
          Kembali ke Beranda
        </Button>
      </motion.div>

      {/* Register Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-gray-400 pt-6"
      >
        Belum punya akun?{" "}
        <Button
          type="button"
          variant="link"
          className="p-0 h-auto font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
          onClick={() => navigate("/register")}
          disabled={isLoading}
        >
          Daftar di sini
        </Button>
      </motion.div>
    </div>
  );
};

export default TypeformLoginForm;
