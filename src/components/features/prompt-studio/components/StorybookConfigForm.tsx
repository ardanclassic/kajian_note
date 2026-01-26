
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, Palette, Layers, Clock, BookText } from "lucide-react";
import type { StorybookPromptConfig } from "@/types/promptStudio.types";
import {
  STORY_GENRE_OPTIONS,
  STORY_TARGET_AUDIENCE,
  STORY_ART_STYLES,
  CHARACTER_CONCEPTS,
  STORY_SETTING_OPTIONS,
  STORY_COLOR_PALETTE_OPTIONS,
} from "@/types/promptStudio.types";
import { STORYBOOK_PRESET_METADATA } from "@/data/storybookPresets";
import { SectionHeader, PromptInput, PromptTextarea, PromptSelect } from "./common/PromptFormFields";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface StorybookConfigFormProps {
  config: StorybookPromptConfig;
  setConfig: React.Dispatch<React.SetStateAction<StorybookPromptConfig>>;
  onOpenPresets: () => void;
}

export function StorybookConfigForm({ config, setConfig, onOpenPresets }: StorybookConfigFormProps) {
  return (
    <div className="space-y-4">
      {/* Quick Templates Button */}
      <Button
        variant="outline"
        size="lg"
        onClick={onOpenPresets}
        className="w-full bg-linear-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30 hover:border-emerald-500/50 text-emerald-200 hover:bg-emerald-500/20 transition-all"
      >
        <Clock className="w-3.5 h-3.5 mr-2" />
        Preset Template
      </Button>

      {/* SECTION 1: STORY CORE */}
      <SectionHeader icon={BookText} title="Inti Cerita" colorClass="text-emerald-200" />

      <PromptTextarea
        label="Topik / Ide Cerita"
        required
        value={config.topic}
        onChange={(val) => setConfig((prev) => ({ ...prev, topic: val }))}
        placeholder="Contoh: Petualangan seekor kucing yang belajar berbagi..."
        rows={2}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PromptSelect
          label="Genre"
          value={config.genre}
          onChange={(val) => setConfig((prev) => ({ ...prev, genre: val }))}
          options={STORY_GENRE_OPTIONS}
          color="emerald"
        />
        <PromptSelect
          label="Bahasa"
          value={config.language}
          onChange={(val) => setConfig((prev) => ({ ...prev, language: val as "id" | "en" }))}
          options={[
            { value: "id", label: "Indonesia" },
            { value: "en", label: "English" },
          ]}
          color="slate"
        />
        <PromptSelect
          label="Target Pembaca"
          value={config.targetAudience}
          onChange={(val) => setConfig((prev) => ({ ...prev, targetAudience: val }))}
          options={STORY_TARGET_AUDIENCE}
          color="blue"
        />
      </div>

      {/* SECTION 2: VISUAL STYLE */}
      <SectionHeader icon={Palette} title="Gaya Visual" colorClass="text-emerald-200" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PromptSelect
          label="Gaya Ilustrasi"
          value={config.artStyle}
          onChange={(val) => setConfig((prev) => ({ ...prev, artStyle: val }))}
          options={STORY_ART_STYLES}
          color="purple"
        />
        <PromptSelect
          label="Konsep Karakter (Sharia Compliance)"
          value={config.characterConcept}
          onChange={(val) => setConfig((prev) => ({ ...prev, characterConcept: val as any }))}
          options={CHARACTER_CONCEPTS}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PromptSelect
          label="Setting / Latar Tempat"
          value={config.setting}
          onChange={(val) => setConfig((prev) => ({ ...prev, setting: val }))}
          options={STORY_SETTING_OPTIONS}
          color="emerald"
        />
        <PromptSelect
          label="Palet Warna"
          value={config.colorPalette}
          onChange={(val) => setConfig((prev) => ({ ...prev, colorPalette: val }))}
          options={STORY_COLOR_PALETTE_OPTIONS}
          color="amber"
        />
      </div>

      {/* SECTION 3: STRUCTURE */}
      <SectionHeader icon={Layers} title="Struktur & Format" colorClass="text-emerald-200" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PromptInput
          label="Estimasi Jumlah Halaman"
          value={config.pageCount.toString()}
          onChange={(val) => setConfig((prev) => ({ ...prev, pageCount: parseInt(val) || 10 }))}
          placeholder="10"
          type="number"
        />

        <div className="flex flex-col space-y-3 p-1">
          <Label className="text-xs text-slate-400">Opsi Tambahan</Label>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800/50">
            <Switch
              id="include-prompts"
              checked={config.includeIllustrationPrompts}
              onCheckedChange={(checked: boolean) => setConfig((prev) => ({ ...prev, includeIllustrationPrompts: checked }))}
            />
            <Label htmlFor="include-prompts" className="text-sm text-slate-300 cursor-pointer">
              Include Image Prompts
            </Label>
          </div>
        </div>
      </div>

    </div>
  );
}
