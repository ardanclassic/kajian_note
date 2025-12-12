/**
 * Register Page
 * Page for new user registration with Typeform-style UX
 *
 * Filepath: src/pages/Register.tsx
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { TypeformRegisterForm } from "@/components/features/auth/TypeformRegisterForm";
import { motion } from "framer-motion";

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 overflow-hidden relative">
      {/* Static emerald glow background - mobile friendly */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-emerald-300/8 rounded-full blur-[80px]" />
      </div>

      <div className="w-full max-w-3xl space-y-8 relative z-10">
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-2"
        >
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-linear-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            Kajian Note
          </h1>
          <p className="text-muted-foreground text-lg">Aplikasi Catatan Kajian untuk Pembelajaran Lebih Terorganisir</p>
        </motion.div>

        {/* Register Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <TypeformRegisterForm />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-sm text-muted-foreground"
        >
          <p>© 2025 Kajian Note. All rights reserved.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
