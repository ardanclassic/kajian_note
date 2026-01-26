import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LucideIcon } from "lucide-react";

// ==========================================
// Types
// ==========================================

export type ThemeColor = "pink" | "emerald" | "green" | "blue" | "purple" | "slate" | "cyan" | "amber" | "orange" | "teal" | "violet" | "rose";

// ==========================================
// Color Helper
// ==========================================

const getColorClasses = (color: ThemeColor = "slate") => {
  const map: Record<string, string> = {
    pink: "border-pink-500/30 focus-within:border-pink-400 focus:border-pink-400",
    emerald: "border-emerald-500/30 focus-within:border-emerald-400 focus:border-emerald-400",
    green: "border-green-500/30 focus-within:border-green-400 focus:border-green-400",
    blue: "border-blue-500/30 focus-within:border-blue-400 focus:border-blue-400",
    purple: "border-purple-500/30 focus-within:border-purple-400 focus:border-purple-400",
    slate: "border-slate-700/50 focus-within:border-slate-500 focus:border-slate-500",
    cyan: "border-cyan-500/30 focus-within:border-cyan-400 focus:border-cyan-400",
    amber: "border-amber-500/30 focus-within:border-amber-400 focus:border-amber-400",
    orange: "border-orange-500/30 focus-within:border-orange-400 focus:border-orange-400",
    teal: "border-teal-500/30 focus-within:border-teal-400 focus:border-teal-400",
    violet: "border-violet-500/30 focus-within:border-violet-400 focus:border-violet-400",
    rose: "border-rose-500/30 focus-within:border-rose-400 focus:border-rose-400",
  };
  return map[color] || map.slate;
};

// ==========================================
// Components
// ==========================================

export function SectionHeader({ icon: Icon, title, colorClass = "text-slate-200" }: { icon: LucideIcon; title: string, colorClass?: string }) {
  return (
    <div className="flex items-center gap-2 pt-4 pb-2 border-b border-slate-700/50">
      <Icon className={`w-4 h-4 ${colorClass.replace('text-slate-200', 'text-pink-400')}`} />
      <h3 className={`text-lg! font-bold ${colorClass}`}>{title}</h3>
    </div>
  );
}

interface CommonFieldProps {
  label: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
}

interface InputFieldProps extends CommonFieldProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
}

export function PromptInput({
  label,
  required = false,
  value,
  onChange,
  placeholder,
  type = "text",
  className
}: InputFieldProps) {
  // Determine border color based on focus (done via CSS classes usually, but here we hardcode generic active state or just slate)
  // For simplicity allowing parent to pass color theme classes if needed, or default to nice styles
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs font-medium text-slate-300">
        {label} {required && <span className="text-rose-400">*</span>}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-slate-900/50 border-2 border-slate-700/50 focus:border-opacity-100 text-slate-100 text-sm h-9 placeholder:text-slate-500 transition-colors"
      />
    </div>
  );
}

interface TextareaFieldProps extends CommonFieldProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}

export function PromptTextarea({
  label,
  required = false,
  value,
  onChange,
  placeholder,
  rows = 3,
  className
}: TextareaFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs font-medium text-slate-300">
        {label} {required && <span className="text-rose-400">*</span>}
      </Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="bg-slate-900/50 border-2 border-slate-700/50 focus:border-opacity-100 text-slate-100 text-sm resize-y placeholder:text-slate-500 transition-colors"
      />
    </div>
  );
}

interface SelectFieldProps extends CommonFieldProps {
  value: string;
  onChange: (val: string) => void;
  options: readonly { value: string; label: string }[];
  color?: ThemeColor;
}

export function PromptSelect({
  label,
  required = false,
  value,
  onChange,
  options,
  color = "slate",
  className
}: SelectFieldProps) {
  const borderClass = getColorClasses(color);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs font-medium text-slate-300">
        {label} {required && <span className="text-rose-400">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className={`bg-slate-900/50 border-2 ${borderClass} text-slate-100 text-sm h-9 transition-colors`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-slate-700 z-[10000] max-h-60">
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="text-slate-200 text-xs hover:bg-slate-800"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
