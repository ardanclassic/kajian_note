/**
 * Typography Components
 * Reusable typography components with consistent styling
 */

import { cn } from "@/lib/utils";
import { type ReactNode, type ElementType } from "react";

interface TypographyProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

// Display - Extra large headings for hero sections
export function Display({ children, className, as: Component = "h1" }: TypographyProps) {
  return (
    <Component
      className={cn("font-black text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tighter text-white", className)}
    >
      {children}
    </Component>
  );
}

// H1 - Main page headings
export function H1({ children, className, as: Component = "h1" }: TypographyProps) {
  return (
    <Component className={cn("font-black text-4xl md:text-5xl leading-tight tracking-tight text-white", className)}>
      {children}
    </Component>
  );
}

// H2 - Section headings
export function H2({ children, className, as: Component = "h2" }: TypographyProps) {
  return (
    <Component className={cn("font-black text-3xl md:text-4xl leading-tight tracking-tight text-white", className)}>
      {children}
    </Component>
  );
}

// H3 - Subsection headings
export function H3({ children, className, as: Component = "h3" }: TypographyProps) {
  return (
    <Component className={cn("font-bold text-2xl md:text-3xl leading-snug text-white", className)}>
      {children}
    </Component>
  );
}

// H4 - Card/Component headings
export function H4({ children, className, as: Component = "h4" }: TypographyProps) {
  return (
    <Component className={cn("font-bold text-xl md:text-2xl leading-snug text-white", className)}>{children}</Component>
  );
}

// Body - Regular paragraph text
export function Body({ children, className, as: Component = "p" }: TypographyProps) {
  return <Component className={cn("text-base leading-relaxed text-gray-300", className)}>{children}</Component>;
}

// Body Large - Emphasized paragraph
export function BodyLarge({ children, className, as: Component = "p" }: TypographyProps) {
  return <Component className={cn("text-lg leading-relaxed text-gray-300", className)}>{children}</Component>;
}

// Body Small - Secondary text
export function BodySmall({ children, className, as: Component = "p" }: TypographyProps) {
  return <Component className={cn("text-sm leading-normal text-gray-400", className)}>{children}</Component>;
}

// Caption - Very small text for labels, metadata
export function Caption({ children, className, as: Component = "span" }: TypographyProps) {
  return <Component className={cn("text-xs leading-normal text-gray-500", className)}>{children}</Component>;
}

// Label - Form labels, UI labels
export function Label({ children, className, as: Component = "label" }: TypographyProps) {
  return <Component className={cn("text-sm font-medium leading-none text-white", className)}>{children}</Component>;
}

// Lead - Large intro paragraph
export function Lead({ children, className, as: Component = "p" }: TypographyProps) {
  return (
    <Component className={cn("text-xl md:text-2xl leading-relaxed text-gray-300 font-light", className)}>
      {children}
    </Component>
  );
}

// Muted - De-emphasized text
export function Muted({ children, className, as: Component = "p" }: TypographyProps) {
  return <Component className={cn("text-sm leading-normal text-gray-500", className)}>{children}</Component>;
}

// Code - Inline code
export function InlineCode({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <code
      className={cn(
        "relative rounded bg-gray-900 px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-emerald-400 border border-gray-800",
        className
      )}
    >
      {children}
    </code>
  );
}

// Blockquote
export function Blockquote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <blockquote className={cn("mt-6 border-l-4 border-emerald-500 pl-6 italic text-gray-300", className)}>
      {children}
    </blockquote>
  );
}

// Arabic Text - Special styling for Arabic content
export function ArabicText({ children, className, as: Component = "p" }: TypographyProps) {
  return (
    <Component
      className={cn("font-arabic text-xl md:text-2xl leading-loose text-white text-right", className)}
      dir="rtl"
    >
      {children}
    </Component>
  );
}

// Badge Text - Small uppercase labels
export function BadgeText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center text-xs font-bold uppercase tracking-wider", className)}>
      {children}
    </span>
  );
}
