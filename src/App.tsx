/**
 * App Component - CLEAN VERSION
 * Only handle auth initialization, no extra monitoring
 */

import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Loading } from "@/components/common/Loading";
import { AppRoutes } from "@/routes";
import { ScrollToTop } from "@/components/common/ScrollToTop";

function App() {
  const { isLoading, initialize } = useAuthStore();

  // Initialize auth ONCE on mount
  useEffect(() => {
    initialize();
  }, []); // Empty deps = run once

  // Show loading only during initial auth check
  if (isLoading) {
    return <Loading fullscreen text="Memuat..." />;
  }

  // Render app routes
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;