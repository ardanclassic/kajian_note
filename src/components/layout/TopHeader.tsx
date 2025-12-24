/**
 * TopHeader Component
 * Simplified header for App Layout with Sidebar support.
 * Features: Sidebar Trigger, Back Navigation (mobile only), and Custom Actions.
 * Menu logic is now handled by AppSidebar.
 */

import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

interface TopHeaderProps {
  title?: string;
  backButton?: boolean;
  backTo?: string;
  onBackClick?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export function TopHeader({
  title,
  backButton = false,
  backTo,
  onBackClick,
  actions,
  className
}: TopHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
      return;
    }

    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={cn("sticky top-0 z-40 w-full border-b border-gray-800 bg-black/95 backdrop-blur px-4 flex h-16 items-center justify-between gap-4 transition-all", className)}>
      <div className="flex items-center">
        <SidebarTrigger className="-ml-2 text-gray-400 hover:text-white" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-gray-700" />

        {/* Back button - only visible on mobile */}
        {backButton && (
          <button
            onClick={handleBack}
            className="md:hidden group flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 hover:border-emerald-500/50 text-gray-400 hover:text-emerald-400 transition-all text-sm font-medium mr-2"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Kembali</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {actions}
      </div>
    </header>
  );
}
