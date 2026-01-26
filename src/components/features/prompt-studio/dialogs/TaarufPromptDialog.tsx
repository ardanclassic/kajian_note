import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { PromptDialogLayout } from "../components/common/PromptDialogLayout";
import {
  type TaarufPromptConfig,
  DEFAULT_TAARUF_PROMPT_CONFIG,
} from "@/types/promptStudio.types";
import { generateTaarufPrompt, validateTaarufConfig } from "@/utils/taarufPromptStudio";
import { fallbackCopyToClipboard } from "@/utils/promptStudio";
import { TAARUF_PRESET_METADATA, getTaarufPreset } from "@/data/taarufPresets";
import { TaarufConfigForm } from "../components/TaarufConfigForm";
import { PromptPreview } from "../components/PromptPreview";
import { TaarufGuide } from "../components/TaarufGuide";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface TaarufPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

import { PresetSelectionDialog } from "./PresetSelectionDialog";
import { UserCircle } from "lucide-react";

export default function TaarufPromptDialog({ open, onOpenChange }: TaarufPromptDialogProps) {
  const [config, setConfig] = useState<TaarufPromptConfig>(DEFAULT_TAARUF_PROMPT_CONFIG);
  const [activeTab, setActiveTab] = useState<"configure" | "guide">("configure");
  const [copied, setCopied] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showPresetDialog, setShowPresetDialog] = useState(false);

  // Validate config on change
  useEffect(() => {
    setValidationErrors(validateTaarufConfig(config));
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
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleCopyToClipboard();
      }

      // ESC to close
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Generate prompt with useMemo
  const generatedPrompt = useMemo(() => {
    if (!config.fullName.trim()) {
      return "Silakan isi informasi dasar untuk generate prompt...";
    }
    return generateTaarufPrompt(config);
  }, [config]);

  const handleLoadPreset = (presetKey: string) => {
    const preset = getTaarufPreset(presetKey);
    if (preset) {
      setConfig({ ...DEFAULT_TAARUF_PROMPT_CONFIG, ...preset } as TaarufPromptConfig);
      setShowPresetDialog(false);
      toast.success(`Template ${TAARUF_PRESET_METADATA[presetKey].label} berhasil dimuat!`);
    }
  };

  const handleCopyToClipboard = async () => {
    // Basic validation check before copy
    if (validationErrors.length > 0) {
      toast.warning("Mohon lengkapi kolom yang wajib diisi terlebih dahulu");
      return;
    }

    if (!generatedPrompt || generatedPrompt.includes("Silakan isi")) {
      toast.warning("Mohon konfigurasi prompt terlebih dahulu");
      return;
    }

    try {
      if (!navigator.clipboard) {
        const success = fallbackCopyToClipboard(generatedPrompt);
        if (success) {
          setCopied(true);
          toast.success("Prompt berhasil disalin!");
          setTimeout(() => setCopied(false), 2000);
        } else {
          toast.error("Gagal menyalin. Silakan salin secara manual.");
        }
        return;
      }

      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      toast.success("Prompt Biodata Ta'aruf berhasil disalin! (Ctrl+V untuk menempel)");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Gagal menyalin. Silakan coba lagi.");
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_TAARUF_PROMPT_CONFIG);
    toast.info("Konfigurasi direset ke default");
  };

  const handleSavePrompt = () => {
    if (validationErrors.length > 0) {
      toast.error("Mohon lengkapi kolom yang wajib diisi terlebih dahulu");
      return;
    }

    // Save to localStorage
    try {
      const saved = {
        id: Date.now(),
        name: `Biodata Ta'aruf - ${config.fullName}`,
        config: { ...config },
        timestamp: new Date().toISOString(),
      };

      const existing = localStorage.getItem("saved-taaruf-prompts");
      const prompts = existing ? JSON.parse(existing) : [];
      prompts.push(saved);
      localStorage.setItem("saved-taaruf-prompts", JSON.stringify(prompts));

      toast.success("Prompt Biodata Ta'aruf berhasil disimpan!");
    } catch (error) {
      toast.error("Gagal menyimpan prompt");
    }
  };

  // Calculate progress for required fields
  const requiredFields = [
    config.fullName,
    config.age,
    config.gender,
    config.currentResidence,
    config.dailyPractices,
    config.marriageGoals,
    config.primaryCriteria,
  ];
  const filledRequired = requiredFields.filter((f) => f && f.trim()).length;
  const totalRequired = requiredFields.length;

  const presetItems = Object.entries(TAARUF_PRESET_METADATA).map(([key, meta]) => ({
    key,
    label: meta.label,
    description: meta.description,
    icon: <UserCircle className={`w-5 h-5 ${meta.gender === "male" ? "text-blue-400" : "text-pink-400"}`} />,
    tags: [meta.gender === "male" ? "Laki-laki" : "Perempuan"],
  }));

  return (
    <>
      <AnimatePresence>
        <PromptDialogLayout
          open={open}
          onOpenChange={onOpenChange}
          title="Biodata Ta'aruf"
          icon={Heart}
          iconColorClass="text-pink-400"
          iconBgClass="from-pink-500/10 to-rose-500/10"
          titleGradientClass="from-pink-400 to-rose-400"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
          {activeTab === "configure" ? (
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative">
              {/* LEFT COLUMN: Configuration */}
              <div className="flex-1">
                <TaarufConfigForm
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
                  mode="taaruf"
                  filledRequired={filledRequired}
                  totalRequired={totalRequired}
                />
              </aside>
            </div>
          ) : (
            <TaarufGuide />
          )}
        </PromptDialogLayout>
      </AnimatePresence>

      <PresetSelectionDialog
        open={showPresetDialog}
        onOpenChange={setShowPresetDialog}
        title="Pilih Template Biodata"
        presets={presetItems}
        onSelect={handleLoadPreset}
      />
    </>
  );
}
