
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { PromptDialogLayout } from "../components/common/PromptDialogLayout";
import {
  type ImagePromptConfigExtended as ImagePromptConfig,
  type SavedPrompt,
  DEFAULT_IMAGE_PROMPT_CONFIG,
  PROMPT_PRESETS
} from "@/types/promptStudio.types";
import { generateImagePrompt, validateConfig, fallbackCopyToClipboard } from "@/utils/promptStudio";
import { ImagePromptConfigForm } from "../components/ImagePromptConfigForm";
import { PromptPreview } from "../components/PromptPreview";
import { ImagePromptGuide } from "../components/ImagePromptGuide";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ImagePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

import { PresetSelectionDialog } from "./PresetSelectionDialog";

export default function ImagePromptDialog({ open, onOpenChange }: ImagePromptDialogProps) {
  const [config, setConfig] = useState<ImagePromptConfig>(DEFAULT_IMAGE_PROMPT_CONFIG);
  const [activeTab, setActiveTab] = useState<"configure" | "guide">("configure");
  const [copied, setCopied] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [showPresetDialog, setShowPresetDialog] = useState(false);

  // Load saved prompts from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('saved-prompts');
      if (saved) {
        setSavedPrompts(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load saved prompts:', error);
    }
  }, []);

  // Validate config on change
  useEffect(() => {
    setValidationErrors(validateConfig(config));
  }, [config]);

  // Handle body overflow
  useEffect(() => {
    if (open) {
      setActiveTab("configure");
      setCopied(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      // Ctrl/Cmd + Enter to copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleCopyToClipboard();
      }

      // ESC to close
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Generate prompt with useMemo
  const generatedPrompt = useMemo(() => {
    if (!config.topic.trim()) {
      return "Masukkan topik untuk membuat prompt...";
    }
    return generateImagePrompt(config);
  }, [config]);

  const handleCopyToClipboard = async () => {
    // Basic validation check before copy
    if (!config.topic.trim() || config.topic.length < 20) {
      toast.warning("Masukkan topik yang valid (minimal 20 karakter)");
      return;
    }

    if (!generatedPrompt || generatedPrompt.includes("Masukkan topik")) {
      toast.warning("Konfigurasi prompt terlebih dahulu");
      return;
    }

    try {
      if (!navigator.clipboard) {
        const success = fallbackCopyToClipboard(generatedPrompt);
        if (success) {
          setCopied(true);
          toast.success("Prompt tersalin ke clipboard!");
          setTimeout(() => setCopied(false), 2000);
        } else {
          toast.error("Gagal menyalin. Silakan salin secara manual.");
        }
        return;
      }

      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      toast.success("Prompt tersalin! (Tekan Ctrl+V untuk menempel)");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error("Gagal menyalin. Silakan coba lagi.");
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_IMAGE_PROMPT_CONFIG);
    toast.info("Konfigurasi direset ke default");
  };

  const handleSavePrompt = () => {
    if (!config.topic.trim() || validationErrors.length > 0) {
      toast.error("Konfigurasi prompt yang valid terlebih dahulu");
      return;
    }

    const saved: SavedPrompt = {
      id: Date.now(),
      name: config.topic.slice(0, 50) + (config.topic.length > 50 ? '...' : ''),
      config: { ...config },
      timestamp: new Date().toISOString(),
    };

    const updated = [...savedPrompts, saved];
    setSavedPrompts(updated);

    try {
      localStorage.setItem('saved-prompts', JSON.stringify(updated));
      toast.success("Prompt berhasil disimpan!");
    } catch (error) {
      toast.error("Gagal menyimpan prompt");
    }
  };

  const handleLoadPreset = (presetKey: string) => {
    const preset = PROMPT_PRESETS[presetKey];
    if (preset) {
      // Merge with default config to ensure all fields are present
      setConfig({ ...DEFAULT_IMAGE_PROMPT_CONFIG, ...preset });
      setShowPresetDialog(false);
      toast.success(`Berhasil memuat preset: ${presetKey.replace(/-/g, ' ')}`);
    }
  };

  const presetItems = Object.entries(PROMPT_PRESETS).map(([key, preset]) => ({
    key,
    label: key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    description: preset.topic || "",
    icon: <Wand2 className="w-5 h-5" />,
    tags: [preset.style || "", preset.designConcept || ""].filter(Boolean),
  }));

  return (
    <>
      <AnimatePresence>
        <PromptDialogLayout
          open={open}
          onOpenChange={onOpenChange}
          title="Image Prompt"
          icon={Wand2}
          iconColorClass="text-purple-400"
          iconBgClass="from-purple-500/10 to-pink-500/10"
          titleGradientClass="from-purple-400 to-pink-400"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
          {activeTab === "configure" ? (
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5 h-full">
              {/* LEFT COLUMN: Configuration */}
              <ImagePromptConfigForm
                config={config}
                setConfig={setConfig}
                onOpenPresets={() => setShowPresetDialog(true)}
              />

              {/* RIGHT COLUMN: Preview Section */}
              <aside className="lg:sticky lg:top-0 h-fit w-full">
                <PromptPreview
                  generatedPrompt={generatedPrompt}
                  onCopy={handleCopyToClipboard}
                  onSave={handleSavePrompt}
                  onReset={handleReset}
                  copied={copied}
                  validationErrors={validationErrors}
                />
              </aside>
            </div>
          ) : (
            <ImagePromptGuide />
          )}
        </PromptDialogLayout>
      </AnimatePresence>

      <PresetSelectionDialog
        open={showPresetDialog}
        onOpenChange={setShowPresetDialog}
        title="Pilih Template Gambar"
        presets={presetItems}
        onSelect={handleLoadPreset}
      />
    </>
  );
}