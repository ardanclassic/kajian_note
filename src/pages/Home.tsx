/**
 * Home.tsx - REFACTORED
 * Auto scroll to top on mount/reload
 */

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { HeroSection, FeaturesSection, HowItWorksSection, PricingSection, CTASection, Footer } from "@/components/home";
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton";

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Auto scroll to top on mount/page reload
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <HeroSection isAuthenticated={isAuthenticated} onNavigate={handleNavigate} />

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works Section - REFACTORED */}
      <HowItWorksSection isAuthenticated={isAuthenticated} />

      {/* Pricing Section */}
      <PricingSection isAuthenticated={isAuthenticated} onNavigate={handleNavigate} />

      {/* CTA Section */}
      <CTASection isAuthenticated={isAuthenticated} onNavigate={handleNavigate} />

      {/* Footer - REFACTORED */}
      <Footer onNavigate={handleNavigate} />

      {/* Floating Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
};

export default Home;
