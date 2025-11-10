/**
 * Protected Route Component - ENHANCED
 * Wrapper for routes that require authentication
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Loading } from "@/components/common/Loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  // ✅ Show loading while checking auth session
  if (isLoading) {
    return <Loading fullscreen text="Memeriksa autentikasi..." />;
  }

  // ✅ Redirect to login if not authenticated
  // Save current location to redirect back after login
  if (!isAuthenticated || !user) {
    console.log("ProtectedRoute: Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ Check if user account is active
  if (!user.isActive) {
    console.log("ProtectedRoute: User account is inactive");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Akun Tidak Aktif</h1>
          <p className="text-muted-foreground mb-4">
            Akun Anda telah dinonaktifkan. Hubungi admin untuk informasi lebih lanjut.
          </p>
          <Navigate to="/login" replace />
        </div>
      </div>
    );
  }

  // ✅ Check if user needs to change password (force password change)
  if (user.forcePasswordChange && location.pathname !== "/profile") {
    console.log("ProtectedRoute: User must change password");
    return <Navigate to="/profile?force_change_pin=true" replace />;
  }

  // ✅ All checks passed, render protected content
  return <>{children}</>;
};
