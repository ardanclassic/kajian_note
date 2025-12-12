/**
 * Typeform-style Register Form Component
 * Compact multi-step registration
 *
 * Filepath: src/components/features/auth/TypeformRegisterForm.tsx
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { registerSchema, type RegisterFormData } from "@/schemas/auth.schema";
import { generateUsername } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TypeformStep } from "./TypeformStep";
import { ProgressIndicator } from "./ProgressIndicator";

export const TypeformRegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const totalSteps = 5;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    getValues,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      username: "",
      pin: "",
      confirmPin: "",
      phone: "",
    },
  });

  const fullName = watch("fullName");
  const username = watch("username");
  const phone = watch("phone");
  const pin = watch("pin");
  const confirmPin = watch("confirmPin");

  useEffect(() => {
    if (fullName) {
      setValue("username", generateUsername(fullName));
    }
  }, [fullName, setValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const fieldNames = ["fullName", "username", "phone", "pin", "confirmPin"];
      const element = document.querySelector(`input[name="${fieldNames[currentStep - 1]}"]`) as HTMLInputElement;
      element?.focus();
    }, 250);
    return () => clearTimeout(timeout);
  }, [currentStep]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleNext = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = await trigger("fullName");
        break;
      case 2:
        isValid = await trigger("username");
        break;
      case 3:
        isValid = phone ? await trigger("phone") : true;
        break;
      case 4:
        isValid = await trigger("pin");
        break;
      case 5:
        isValid = await trigger("confirmPin");
        if (isValid) await onSubmit(getValues());
        return;
    }

    if (isValid) setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      e.preventDefault();
      handleNext();
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        fullName: data.fullName,
        username: data.username,
        pin: data.pin,
        phone: data.phone || undefined,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      {/* Step wrapper dengan relative positioning untuk prevent height jump */}
      <div className="relative min-h-80">
        {/* Step 1: Name */}
        <TypeformStep
          isActive={currentStep === 1}
          title="Halo! Siapa namamu? 👋"
          subtitle="Tulis nama lengkapmu ya"
          onNext={handleNext}
          nextDisabled={!fullName || !!errors.fullName}
          error={errors.fullName?.message}
        >
          <Input
            type="text"
            placeholder="cth: Ahmad Zaki"
            {...register("fullName")}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="h-11 bg-gray-900/40 border-gray-800/50 text-white placeholder-gray-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 rounded-lg"
          />
        </TypeformStep>

        {/* Step 2: Username */}
        <TypeformStep
          isActive={currentStep === 2}
          title={`Salam kenal, ${fullName.split(" ")[0]}! 😊`}
          subtitle="Username ini otomatis dibuat, bisa diubah kok"
          onNext={handleNext}
          onBack={handleBack}
          nextDisabled={!username || !!errors.username}
          error={errors.username?.message}
        >
          <Input
            type="text"
            placeholder="username"
            {...register("username")}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="h-11 bg-gray-900/40 border-gray-800/50 text-white placeholder-gray-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 rounded-lg"
          />
          <p className="text-xs text-gray-600">Huruf kecil & angka aja ya (3-20 karakter)</p>
        </TypeformStep>

        {/* Step 3: Phone */}
        <TypeformStep
          isActive={currentStep === 3}
          title="Nomor HP-mu? 📱"
          subtitle="Opsional kok, buat jaga-jaga aja"
          onNext={handleNext}
          onBack={handleBack}
          nextLabel={phone ? "Lanjut" : "Lewati"}
          nextDisabled={!!errors.phone}
          error={errors.phone?.message}
        >
          <Input
            type="tel"
            placeholder="08123456789 (opsional)"
            {...register("phone")}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="h-11 bg-gray-900/40 border-gray-800/50 text-white placeholder-gray-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 rounded-lg"
          />
        </TypeformStep>

        {/* Step 4: PIN */}
        <TypeformStep
          isActive={currentStep === 4}
          title="Bikin PIN yuk 🔒"
          subtitle="6 angka buat login nanti"
          onNext={handleNext}
          onBack={handleBack}
          nextDisabled={!pin || !!errors.pin}
          error={errors.pin?.message}
        >
          <div className="relative">
            <Input
              type={showPin ? "text" : "password"}
              placeholder="••••••"
              maxLength={6}
              inputMode="numeric"
              {...register("pin")}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="h-11 bg-gray-900/40 border-gray-800/50 text-white placeholder-gray-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 rounded-lg tracking-widest pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-800/50"
            >
              {showPin ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
            </Button>
          </div>
          <p className="text-xs text-gray-600">Yang gampang diingat tapi aman ya</p>
        </TypeformStep>

        {/* Step 5: Confirm PIN */}
        <TypeformStep
          isActive={currentStep === 5}
          title="Ulangi PIN-nya dong ✓"
          subtitle="Biar gak lupa nanti"
          onNext={handleNext}
          onBack={handleBack}
          nextLabel="Daftar"
          nextDisabled={!confirmPin || !!errors.confirmPin}
          isLoading={isLoading}
          error={errors.confirmPin?.message || error || undefined}
        >
          <div className="relative">
            <Input
              type={showConfirmPin ? "text" : "password"}
              placeholder="••••••"
              maxLength={6}
              inputMode="numeric"
              {...register("confirmPin")}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="h-11 bg-gray-900/40 border-gray-800/50 text-white placeholder-gray-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 rounded-lg tracking-widest pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirmPin(!showConfirmPin)}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-800/50"
            >
              {showConfirmPin ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          </div>
        </TypeformStep>
      </div>

      {/* Footer link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-xs text-gray-600 pt-8"
      >
        Udah punya akun?{" "}
        <button
          onClick={() => navigate("/login")}
          disabled={isLoading}
          className="text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Masuk aja
        </button>
      </motion.div>
    </div>
  );
};

export default TypeformRegisterForm;
