/**
 * Role-Based Route Component
 * Wrapper for routes that require specific user roles
 */

import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Loading } from "@/components/common/Loading";
import type { UserRole } from "@/config/permissions";

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Show loading while checking auth
  if (isLoading) {
    return <Loading fullscreen text="Memuat..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user role is allowed
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Akses Ditolak</h1>
          <p className="text-muted-foreground">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          <button onClick={() => window.history.back()} className="text-primary underline">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
