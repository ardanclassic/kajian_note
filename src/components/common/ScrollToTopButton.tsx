/**
 * ScrollToTopButton Component
 * Reusable floating button for smooth scroll to top
 * Dark mode with emerald accent theme
 */

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

interface ScrollToTopButtonProps {
  /**
   * Scroll threshold in pixels before button appears
   * @default 400
   */
  threshold?: number;
  /**
   * Position from bottom in Tailwind units
   * @default "bottom-6"
   */
  bottomPosition?: string;
  /**
   * Position from right in Tailwind units
   * @default "right-6"
   */
  rightPosition?: string;
  /**
   * Custom className for additional styling
   */
  className?: string;
}

export function ScrollToTopButton({
  threshold = 400,
  bottomPosition = "bottom-6",
  rightPosition = "right-6",
  className = "",
}: ScrollToTopButtonProps) {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!showButton) return null;

  return (
    <button
      onClick={scrollToTop}
      className={`fixed ${bottomPosition} ${rightPosition} z-50 w-12 h-12 rounded-full! bg-gray-900/20! border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:scale-110 flex items-center justify-center group p-2! ${className}`}
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
}
