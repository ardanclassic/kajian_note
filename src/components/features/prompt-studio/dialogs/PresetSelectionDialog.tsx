import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BookOpen, User, Clock, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PresetItem {
  key: string;
  label: string;
  description: string;
  category?: string;
  tags?: string[];
  icon?: React.ReactNode;
}

interface PresetSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  presets: PresetItem[];
  onSelect: (key: string) => void;
}

export function PresetSelectionDialog({
  open,
  onOpenChange,
  title,
  presets,
  onSelect,
}: PresetSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPresets = presets.filter((preset) =>
    preset.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    preset.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-slate-950 border-slate-800 text-slate-100 p-0 overflow-hidden flex flex-col h-[90vh] sm:h-[80vh]">
        <DialogHeader className="p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 text-left">
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-100">{title}</DialogTitle>
              <p className="text-sm text-slate-400 mt-0.5">Pilih template untuk memulai dengan cepat</p>
            </div>
          </div>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Cari template..."
              className="pl-9 bg-slate-900 border-slate-800 focus:border-emerald-500 text-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </DialogHeader>

        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredPresets.map((preset) => (
              <button
                key={preset.key}
                onClick={() => {
                  onSelect(preset.key);
                  onOpenChange(false);
                }}
                className={cn(
                  "flex flex-col text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden",
                  "bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/60 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-900/10"
                )}
              >
                <div className="flex justify-between items-start mb-2 w-full">
                  <div className="p-2 rounded-lg bg-slate-800/50 text-emerald-400 group-hover:text-emerald-300 group-hover:bg-emerald-500/10 transition-colors">
                    {preset.icon || <BookOpen className="w-4 h-4" />}
                  </div>
                  {preset.tags && preset.tags.length > 0 && (
                    <div className="flex gap-1">
                      {preset.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-base md:text-lg text-slate-200 group-hover:text-emerald-300 transition-colors mb-1">
                  {preset.label}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed group-hover:text-slate-300">
                  {preset.description}
                </p>

                {/* Decoration gradient */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}

            {filteredPresets.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                <p>Tidak ada template yang cocok dengan pencarian Anda.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
