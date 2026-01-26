/**
 * App Routes Component
 * Centralized route configuration
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

// Layouts
import MainLayout from "@/components/layout/MainLayout";

// Pages
import { LandingPage } from "@/pages/landing/Landing";
import { Login } from "@/pages/authentication/Login";
import { Register } from "@/pages/authentication/Register";
import Dashboard from "@/pages/dashboard/Dashboard";
import Profile from "@/pages/profile/Profile";
import Subscription from "@/pages/subscription/Subscription";
import Settings from "@/pages/setting/Settings";
import Notes from "@/pages/notes";
import CreateNote from "@/pages/notes/CreateNote";
import ViewNote from "@/pages/notes/ViewNote";
import EditNote from "@/pages/notes/EditNote";
import CreateDeepNote from "@/pages/deepnote/CreateDeepNote";
import ListDeepNote from "@/pages/deepnote/ListDeepNote";

// Content Studio Routes
import ListContentStudio from "@/pages/content-studio/ListContentStudio";
import ContentStudio from "@/pages/content-studio/ContentStudio";
// Prompt Studio Routes
import PromptStudio from "@/pages/prompt-studio";
// Quest Routes
import { QuestPage } from "@/components/features/quest";
import UserManagement from "@/pages/admin/UserManagement";
import APITest from "@/pages/APITest";
import { ManualPaymentRecovery } from '@/pages/admin/ManualPaymentRecovery';
import Donation from "@/pages/donation/Donation";
import About from "@/pages/about/About";


// Route Guards
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleBasedRoute } from "./RoleBasedRoute";

export const AppRoutes = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* Protected Routes (Wrapped in MainLayout) */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/donation" element={<Donation />} />
        <Route path="/about" element={<About />} />
        <Route path="/settings" element={<Settings />} />

        {/* Notes Routes */}
        <Route path="/notes" element={<Notes />} />
        <Route path="/notes/new" element={<CreateNote />} />
        <Route path="/notes/:id" element={<ViewNote />} />
        <Route path="/notes/:id/edit" element={<EditNote />} />

        {/* Deep Note Routes */}
        <Route path="/deep-note" element={<ListDeepNote />} />
        <Route path="/deep-note/create" element={<CreateDeepNote />} />
        <Route path="/deep-note/:id" element={<ViewNote />} />



        {/* Content Studio Routes */}
        <Route path="/content-studio" element={<ListContentStudio />} />
        <Route path="/content-studio/create" element={<ContentStudio />} />

        {/* Prompt Studio Routes */}
        <Route path="/prompt-studio" element={<PromptStudio />} />

        {/* Quest Routes */}
        <Route path="/quest" element={<QuestPage />} />

        {/* Tools */}
        <Route path="/api-test" element={<APITest />} />
        <Route path="/recovery" element={<ManualPaymentRecovery />} />

        {/* Admin Only Routes */}
        <Route
          path="/admin/users"
          element={
            <RoleBasedRoute allowedRoles={["member", "admin"]}>
              <UserManagement />
            </RoleBasedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
