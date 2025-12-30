/**
 * YouTubeImportButton Component
 * Button to trigger YouTube import modal
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Youtube } from "lucide-react";
import { isYouTubeAPIConfigured } from "@/config/youtube";

interface YouTubeImportButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function YouTubeImportButton({
  onClick,
  disabled = false,
  variant = "outline",
  size = "default",
  className = "",
}: YouTubeImportButtonProps) {
  const [isAPIConfigured] = useState(isYouTubeAPIConfigured());

  // Don't render if API not configured
  if (!isAPIConfigured) {
    return null;
  }

  return (
    <Button type="button" variant={variant} size={size} onClick={onClick} disabled={disabled} className={className}>
      <Youtube className="w-4 h-4 mr-2" />
      Import dari YouTube
    </Button>
  );
}
