/**
 * PageHeader Component
 * Reusable header component for pages with gradient background and back button
 */

import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  // Badge props
  badgeIcon?: LucideIcon;
  badgeText?: string;

  // Title & description
  title: string;
  description?: string;

  // Actions
  actions?: ReactNode;

  // Back button
  showBackButton?: boolean;
  backTo?: string; // URL path to go back to (default: -1 / previous page)
  backLabel?: string; // Label for back button

  // Stats cards (optional)
  stats?: Array<{
    icon: LucideIcon;
    value: string | number;
    label: string;
    color?: string; // e.g., "blue", "green", "purple", "orange"
  }>;

  // Styling
  className?: string;
  showGradient?: boolean;
}

const colorClasses = {
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-500",
  },
  green: {
    bg: "bg-green-500/10",
    text: "text-green-500",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-500",
  },
  orange: {
    bg: "bg-orange-500/10",
    text: "text-orange-500",
  },
  red: {
    bg: "bg-red-500/10",
    text: "text-red-500",
  },
  yellow: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-500",
  },
};

export function PageHeader({
  badgeIcon: BadgeIcon,
  badgeText,
  title,
  description,
  actions,
  showBackButton = false,
  backTo,
  backLabel = "Kembali",
  stats,
  className,
  showGradient = true,
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div
      className={cn(
        "border-b",
        showGradient && "bg-linear-to-br from-primary/10 via-primary/5 to-background",
        className
      )}
    >
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          {showBackButton && (
            <div className="mb-4">
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2 hover:gap-3 transition-all">
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
              </Button>
            </div>
          )}

          {/* Title Section */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              {/* Badge */}
              {(BadgeIcon || badgeText) && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-0">
                  {BadgeIcon && <BadgeIcon className="h-3.5 w-3.5 text-primary" />}
                  {badgeText && <span className="text-xs font-medium">{badgeText}</span>}
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>

              {/* Description */}
              {description && <p className="text-muted-foreground max-w-2xl">{description}</p>}
            </div>

            {/* Actions */}
            {actions && <div className="shrink-0">{actions}</div>}
          </div>

          {/* Stats Grid */}
          {stats && stats.length > 0 && (
            <div
              className={cn(
                "grid gap-3 md:gap-4",
                stats.length === 2 && "grid-cols-2",
                stats.length === 3 && "grid-cols-2 md:grid-cols-3",
                stats.length === 4 && "grid-cols-2 md:grid-cols-4",
                stats.length > 4 && "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              )}
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                const colors = stat.color
                  ? colorClasses[stat.color as keyof typeof colorClasses]
                  : { bg: "bg-primary/10", text: "text-primary" };

                return (
                  <div key={index} className="bg-card/50 backdrop-blur border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", colors.bg)}>
                        <Icon className={cn("w-5 h-5", colors.text)} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simplified version without stats
export function SimplePageHeader({
  badgeIcon: BadgeIcon,
  badgeText,
  title,
  description,
  actions,
  showBackButton = false,
  backTo,
  backLabel = "Kembali",
  className,
  showGradient = true,
}: Omit<PageHeaderProps, "stats">) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div
      className={cn(
        "border-b",
        showGradient && "bg-linear-to-br from-primary/10 via-primary/5 to-background",
        className
      )}
    >
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          {showBackButton && (
            <div className="mb-4">
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2 hover:gap-3 transition-all">
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
              </Button>
            </div>
          )}

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              {/* Badge */}
              {(BadgeIcon || badgeText) && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                  {BadgeIcon && <BadgeIcon className="h-3.5 w-3.5 text-primary" />}
                  {badgeText && <span className="text-xs font-medium">{badgeText}</span>}
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>

              {/* Description */}
              {description && <p className="text-muted-foreground max-w-2xl">{description}</p>}
            </div>

            {/* Actions */}
            {actions && <div className="shrink-0">{actions}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
