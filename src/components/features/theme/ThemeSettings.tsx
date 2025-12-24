/**
 * Theme Settings Component
 * UI for switching between themes and fonts
 */

import { motion, AnimatePresence } from "framer-motion";
import { Type, X, Check } from "lucide-react";
import { useThemeStore, fontConfigs, type FontFamily } from "@/store/themeStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeSettingsProps {
  open: boolean;
  onClose: () => void;
}

export function ThemeSettings({ open, onClose }: ThemeSettingsProps) {
  const { fontFamily, setFontFamily } = useThemeStore();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-background border-l border-border z-50 overflow-y-auto"
          >
            <div className="p-6 space-y-6 z-30">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <Type className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-foreground">Theme Settings</h2>
                    <p className="text-xs text-muted-foreground">Customize appearance</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-accent"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Font Family Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">Font Family</label>
                <div className="space-y-2">
                  {(Object.keys(fontConfigs) as FontFamily[]).map((font) => {
                    const config = fontConfigs[font];
                    const isSelected = fontFamily === font;

                    return (
                      <button
                        key={font}
                        onClick={() => setFontFamily(font)}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 transition-all text-left",
                          isSelected
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-border hover:border-emerald-500/50 bg-card"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className={cn(
                              "font-bold text-base mb-1",
                              isSelected ? "text-emerald-400" : "text-foreground"
                            )} style={{ fontFamily: config.css }}>
                              {config.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {config.description}
                            </div>
                            <div className="mt-2 text-sm" style={{ fontFamily: config.css }}>
                              The quick brown fox jumps over the lazy dog
                            </div>
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0"
                            >
                              <Check className="h-3 w-3 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview Text */}
              <div className="space-y-3 pt-4 border-t border-border">
                <label className="text-sm font-semibold text-foreground">Preview</label>
                <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                  <h1 className="text-3xl font-black text-foreground">Heading 1</h1>
                  <h2 className="text-2xl font-bold text-foreground">Heading 2</h2>
                  <p className="text-base text-foreground">
                    This is a paragraph with regular text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This is smaller text with muted color for secondary information.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
