/**
 * App Component - OPTIMIZED with Global Initializer
 * Main application component with routing
 */

import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useNotesStore } from "@/store/notesStore";
import { Loading } from "@/components/common/Loading";

// Pages
import { Home } from "@/pages/Home";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Subscription from "@/pages/Subscription";
import Settings from "@/pages/Settings";
import Notes from "@/pages/Notes";
import UserManagement from "@/pages/admin/UserManagement";

// Routes
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RoleBasedRoute } from "@/routes/RoleBasedRoute";

function App() {
  const { user, isAuthenticated, isLoading, initialize } = useAuthStore();
  const { fetchUsage } = useSubscriptionStore();
  const { fetchUserNotes, fetchStatistics, fetchUserTags } = useNotesStore();

  // ✅ Initialize auth state on mount (only once)
  useEffect(() => {
    initialize();
  }, []);

  // ✅ GLOBAL INITIALIZER: Fetch all user data once after auth
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log("🚀 Global Initializer: Fetching user data...");

      // Fetch all data in parallel (only once on mount)
      Promise.all([
        fetchUsage(user.id),
        fetchUserNotes(user.id, 1, undefined, { field: "createdAt", order: "desc" }),
        fetchStatistics(user.id),
        fetchUserTags(user.id),
      ])
        .then(() => {
          console.log("✅ Global Initializer: All data loaded");
        })
        .catch((error) => {
          console.error("❌ Global Initializer: Error loading data", error);
        });
    }
  }, [isAuthenticated, user?.id]); // Only run when auth state changes

  // Show loading while checking auth session
  if (isLoading) {
    return <Loading fullscreen text="Memuat..." />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              <Subscription />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Notes Routes */}
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <Notes />
            </ProtectedRoute>
          }
        />

        {/* Admin Only Routes */}
        <Route
          path="/admin/users"
          element={
            <RoleBasedRoute allowedRoles={["admin"]}>
              <UserManagement />
            </RoleBasedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
