
import { useState, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";
import { PromptDialogLayout } from "../components/common/PromptDialogLayout";
import type { StorybookPromptConfig } from "@/types/promptStudio.types";
import { DEFAULT_STORYBOOK_CONFIG } from "@/types/promptStudio.types";
import { generateStorybookPrompt, validateStorybookConfig } from "@/utils/storybookPromptStudio";
import { fallbackCopyToClipboard } from "@/utils/promptStudio";
import { STORYBOOK_PRESET_METADATA, getStorybookPreset } from "@/data/storybookPresets";
import { PresetSelectionDialog } from "./PresetSelectionDialog";
import { StorybookConfigForm } from "../components/StorybookConfigForm";
import { PromptPreview } from "../components/PromptPreview";
import { StorybookGuide } from "../components/StorybookGuide";

interface StorybookPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StorybookPromptDialog({ open, onOpenChange }: StorybookPromptDialogProps) {
  const [config, setConfig] = useState<StorybookPromptConfig>(DEFAULT_STORYBOOK_CONFIG);
  const [activeTab, setActiveTab] = useState<"configure" | "guide">("configure");
  const [copied, setCopied] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showPresetDialog, setShowPresetDialog] = useState(false);

  // Validate config on change
  useEffect(() => {
    setValidationErrors(validateStorybookConfig(config));
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
    return () => { document.body.style.overflow = "unset"; };
  }, [open]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleCopyToClipboard();
      }
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const generatedPrompt = useMemo(() => {
    if (!config.topic.trim()) return "Silakan isi topik cerita untuk mulai generate...";
    return generateStorybookPrompt(config);
  }, [config]);

  const handleLoadPreset = (presetKey: string) => {
    const preset = getStorybookPreset(presetKey);
    if (preset) {
      setConfig({ ...DEFAULT_STORYBOOK_CONFIG, ...preset } as StorybookPromptConfig);
      setShowPresetDialog(false);
      toast.success(`Template ${STORYBOOK_PRESET_METADATA[presetKey].label} berhasil dimuat!`);
    }
  };

  const handleCopyToClipboard = async () => {
    if (validationErrors.length > 0) {
      toast.warning("Mohon lengkapi data wajib (Topik & Moral Value)");
      return;
    }

    try {
      if (!navigator.clipboard) {
        if (fallbackCopyToClipboard(generatedPrompt)) {
          setCopied(true);
          toast.success("Prompt berhasil disalin!");
          setTimeout(() => setCopied(false), 2000);
        } else {
          toast.error("Gagal menyalin.");
        }
        return;
      }
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      toast.success("Prompt Storybook berhasil disalin! (Ctrl+V)");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Gagal menyalin.");
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_STORYBOOK_CONFIG);
    toast.info("Konfigurasi direset");
  };

  const handleSavePrompt = () => {
    if (validationErrors.length > 0) {
      toast.error("Lengkapi data wajib dulu");
      return;
    }
    // Mock save
    toast.success("Prompt Storybook disimpan!");
  };

  // Progress logic (simplified for Storybook)
  const requiredFields = [config.topic, config.moralValue];
  const filledRequired = requiredFields.filter(Boolean).length;
  const totalRequired = requiredFields.length;

  const presetItems = Object.entries(STORYBOOK_PRESET_METADATA).map(([key, meta]) => ({
    key,
    label: meta.label,
    description: meta.description,
    icon: <BookOpen className="w-5 h-5" />,
    tags: ["Storybook"],
  }));

  return (
    <>
      <AnimatePresence>
        <PromptDialogLayout
          open={open}
          onOpenChange={onOpenChange}
          title="Islamic Storybook"
          icon={BookOpen}
          iconColorClass="text-emerald-400"
          iconBgClass="from-emerald-500/10 to-teal-500/10"
          titleGradientClass="from-emerald-400 to-teal-400"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
          {activeTab === "configure" ? (
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative">
              {/* LEFT COLUMN: Configuration */}
              <div className="flex-1">
                <StorybookConfigForm
                  config={config}
                  setConfig={setConfig}
                  onOpenPresets={() => setShowPresetDialog(true)}
                />
              </div>

              {/* RIGHT COLUMN: Preview Section (Sticky) */}
              <aside className="lg:sticky lg:top-0 h-fit w-full">
                <PromptPreview
                  generatedPrompt={generatedPrompt}
                  onCopy={handleCopyToClipboard}
                  onSave={handleSavePrompt}
                  onReset={handleReset}
                  copied={copied}
                  validationErrors={validationErrors}
                  mode="storybook"
                  filledRequired={filledRequired}
                  totalRequired={totalRequired}
                />
              </aside>
            </div>
          ) : (
            <StorybookGuide />
          )}
        </PromptDialogLayout>
      </AnimatePresence>

      <PresetSelectionDialog
        open={showPresetDialog}
        onOpenChange={setShowPresetDialog}
        title="Pilih Template Cerita"
        presets={presetItems}
        onSelect={handleLoadPreset}
      />
    </>
  );
}
