import { motion } from "framer-motion";
import { X, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface PromptDialogLayoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  icon: LucideIcon;
  iconColorClass: string; // e.g. "text-purple-400"
  iconBgClass: string;    // e.g. "bg-purple-500/10"
  titleGradientClass: string; // e.g. "from-purple-400 to-pink-400"
  activeTab: "configure" | "guide";
  setActiveTab: (tab: "configure" | "guide") => void;
  children: ReactNode;
}

export function PromptDialogLayout({
  open,
  onOpenChange,
  title,
  icon: Icon,
  iconColorClass,
  iconBgClass,
  titleGradientClass,
  activeTab,
  setActiveTab,
  children
}: PromptDialogLayoutProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center isolate">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full h-full sm:w-[95vw] sm:max-w-6xl sm:max-h-[90vh] sm:h-auto overflow-hidden flex flex-col bg-slate-950 border-0 sm:border border-slate-800 shadow-none sm:shadow-2xl rounded-none sm:rounded-xl z-[9995]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3 border-b border-slate-800/50 bg-linear-to-b from-slate-900/30 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg border bg-linear-to-br ${iconBgClass}`}>
                <Icon className={`w-4 h-4 ${iconColorClass}`} />
              </div>
              <div className="flex flex-col">
                <span className={`bg-linear-to-r ${titleGradientClass} bg-clip-text text-transparent font-semibold text-lg`}>
                  {title}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex gap-1 p-0.5 bg-slate-900/50 rounded-lg border border-slate-800/30">
                <button
                  onClick={() => setActiveTab("configure")}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${activeTab === "configure"
                    ? `bg-slate-800 ${iconColorClass.replace("text-", "text-").replace("400", "300")} shadow-sm`
                    : "text-slate-500 hover:text-slate-300"
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  Konfigurasi
                </button>
                <button
                  onClick={() => setActiveTab("guide")}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${activeTab === "guide"
                    ? `bg-slate-800 ${iconColorClass.replace("text-", "text-").replace("400", "300")} shadow-sm`
                    : "text-slate-500 hover:text-slate-300"
                    }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Panduan
                </button>
              </div>

              <button
                onClick={() => onOpenChange(false)}
                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-red-500/20 transition-all"
                title="Tutup (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Tab Selector */}
          <div className="flex sm:hidden gap-1 p-0.5 bg-slate-900/50 rounded-lg border border-slate-800/30 mt-2">
            <button
              onClick={() => setActiveTab("configure")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${activeTab === "configure"
                ? `bg-slate-800 ${iconColorClass.replace("text-", "text-").replace("400", "300")} shadow-sm`
                : "text-slate-500 hover:text-slate-300"
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              Konfigurasi
            </button>
            <button
              onClick={() => setActiveTab("guide")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${activeTab === "guide"
                ? `bg-slate-800 ${iconColorClass.replace("text-", "text-").replace("400", "300")} shadow-sm`
                : "text-slate-500 hover:text-slate-300"
                }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Panduan
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-4 hover:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:bg-slate-800/50 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
