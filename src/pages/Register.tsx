/**
 * Register Page
 * Page for new user registration
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { RegisterForm } from "@/components/features/auth/RegisterForm";

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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Brand */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Kajian Note</h1>
          <p className="text-muted-foreground">Aplikasi Catatan Kajian</p>
        </div>

        {/* Register Form */}
        <RegisterForm />

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 Kajian Note. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
