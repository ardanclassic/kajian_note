/**
 * ConfirmDialog Component - Dark Mode with Emerald Glow
 * Refactored: Following design-guidelines.md
 * ✅ Pure black background
 * ✅ Color-coded variants with glow
 * ✅ Modern dialog design
 *
 * Note: Uses shadcn/ui dialog components available in main project
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Info, Loader2, AlertTriangle } from "lucide-react";

type DialogVariant = "default" | "success" | "warning" | "danger" | "info";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  variant?: DialogVariant;
  isLoading?: boolean;
  showCancel?: boolean;
}

const variantConfig = {
  default: {
    icon: Info,
    iconBg: "bg-blue-500/20",
    iconBorder: "border-blue-500/50",
    iconColor: "text-blue-400",
    glowColor: "bg-blue-500/5",
    confirmVariant: "default" as const,
  },
  success: {
    icon: CheckCircle2,
    iconBg: "bg-green-500/20",
    iconBorder: "border-green-500/50",
    iconColor: "text-green-400",
    glowColor: "bg-green-500/5",
    confirmVariant: "default" as const,
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-yellow-500/20",
    iconBorder: "border-yellow-500/50",
    iconColor: "text-yellow-400",
    glowColor: "bg-yellow-500/5",
    confirmVariant: "default" as const,
  },
  danger: {
    icon: AlertCircle,
    iconBg: "bg-red-500/20",
    iconBorder: "border-red-500/50",
    iconColor: "text-red-400",
    glowColor: "bg-red-500/5",
    confirmVariant: "destructive" as const,
  },
  info: {
    icon: Info,
    iconBg: "bg-blue-500/20",
    iconBorder: "border-blue-500/50",
    iconColor: "text-blue-400",
    glowColor: "bg-blue-500/5",
    confirmVariant: "default" as const,
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  onConfirm,
  onCancel,
  variant = "default",
  isLoading = false,
  showCancel = true,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black border-gray-800">
        <div className="relative overflow-hidden">
          {/* Glow Background */}
          <div className={`absolute inset-0 ${config.glowColor}`} />

          {/* Content */}
          <div className="relative z-10">
            <DialogHeader>
              <div className="flex items-center gap-4 mb-2">
                <div
                  className={`w-12 h-12 rounded-xl ${config.iconBg} border ${config.iconBorder} flex items-center justify-center shrink-0`}
                >
                  <Icon className={`w-6 h-6 ${config.iconColor}`} />
                </div>
                <div className="flex-1 pt-1">
                  <DialogTitle className="text-left text-white text-lg font-bold">{title}</DialogTitle>
                </div>
              </div>
            </DialogHeader>

            {typeof description === "string" ? (
              <DialogDescription className="text-left pt-2 text-gray-300 text-base leading-relaxed">{description}</DialogDescription>
            ) : (
              <div className="text-left pt-2 text-base text-gray-300 leading-relaxed">{description}</div>
            )}

            <DialogFooter className="gap-3 sm:gap-3 mt-6">
              {showCancel && (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="bg-transparent border-gray-800 text-white hover:bg-gray-900 hover:border-gray-700"
                >
                  {cancelText}
                </Button>
              )}
              <Button
                variant={config.confirmVariant}
                onClick={handleConfirm}
                disabled={isLoading}
                className={
                  variant === "danger"
                    ? "bg-red-600 hover:bg-red-700 text-white border-0"
                    : variant === "success"
                      ? "bg-green-600/80 hover:bg-green-600 text-white border-0"
                      : variant === "warning"
                        ? "bg-yellow-600/80 hover:bg-yellow-600 text-white border-0"
                        : "bg-blue-600/80 hover:bg-blue-600 text-white border-0"
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  confirmText
                )}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
