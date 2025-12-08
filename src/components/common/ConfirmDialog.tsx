/**
 * ConfirmDialog Component
 * Reusable confirmation dialog with different variants
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
    iconClass: "text-blue-400",
    bgClass: "bg-blue-500/10",
    confirmVariant: "default" as const,
  },
  success: {
    icon: CheckCircle2,
    iconClass: "text-white-400",
    bgClass: "bg-white-500/10",
    confirmVariant: "default" as const,
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-yellow-400",
    bgClass: "bg-yellow-500/10",
    confirmVariant: "default" as const,
  },
  danger: {
    icon: AlertCircle,
    iconClass: "text-red-400",
    bgClass: "bg-red-500/10",
    confirmVariant: "destructive" as const,
  },
  info: {
    icon: Info,
    iconClass: "text-blue-400",
    bgClass: "bg-blue-500/10",
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${config.bgClass} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${config.iconClass}`} />
            </div>
            <div className="flex-1 pt-1">
              <DialogTitle className="text-left">{title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {typeof description === "string" ? (
          <DialogDescription className="text-left pt-2">{description}</DialogDescription>
        ) : (
          <div className="text-left pt-2 text-sm text-muted-foreground">{description}</div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          {showCancel && (
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              {cancelText}
            </Button>
          )}
          <Button variant={config.confirmVariant} onClick={handleConfirm} disabled={isLoading}>
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
      </DialogContent>
    </Dialog>
  );
}
