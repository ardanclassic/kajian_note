/**
 * Loading Component
 * Reusable loading indicator for various use cases
 */

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  /**
   * Size of the spinner
   */
  size?: "sm" | "md" | "lg" | "xl";

  /**
   * Loading text to display
   */
  text?: string;

  /**
   * Show as fullscreen overlay
   */
  fullscreen?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

/**
 * Loading component
 */
export const Loading: React.FC<LoadingProps> = ({ size = "md", text, fullscreen = false, className }) => {
  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <p className={cn("text-muted-foreground", textSizeClasses[size])}>{text}</p>}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

/**
 * Page loading (centered on page)
 */
export const PageLoading: React.FC<{ text?: string }> = ({ text = "Memuat..." }) => {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Loading size="lg" text={text} />
    </div>
  );
};

/**
 * Button loading (inline with button)
 */
export const ButtonLoading: React.FC = () => {
  return <Loader2 className="h-4 w-4 animate-spin" />;
};

/**
 * Skeleton loading for lists
 */
export const SkeletonLoading: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
};

/**
 * Card skeleton loading
 */
export const CardSkeletonLoading: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3">
          <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="flex gap-2 pt-2">
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Spinner only (no text)
 */
export const Spinner: React.FC<{ size?: "sm" | "md" | "lg" | "xl"; className?: string }> = ({
  size = "md",
  className,
}) => {
  return <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />;
};

export default Loading;
