/**
 * App Component - MINIMAL VERSION
 * Only handle auth initialization, no data loading
 */

import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Loading } from "@/components/common/Loading";
import { AppRoutes } from "@/routes";

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
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
