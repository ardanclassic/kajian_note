import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Clock, AlertCircle } from "lucide-react";
import {
  type ImagePromptConfigExtended as ImagePromptConfig,
  PROMPT_PRESETS,
  DESIGN_CONCEPTS,
  STYLE_OPTIONS,
  COLOR_SCHEMES,
  MOOD_OPTIONS,
  LIGHTING_OPTIONS,
  PERSPECTIVE_OPTIONS,
  BACKGROUND_OPTIONS,
  ASPECT_RATIOS
} from "@/types/promptStudio.types";
import { PromptSelect, PromptInput, PromptTextarea, type ThemeColor } from "./common/PromptFormFields";

interface PromptConfigFormProps {
  config: ImagePromptConfig;
  setConfig: React.Dispatch<React.SetStateAction<ImagePromptConfig>>;
  onOpenPresets: () => void;
}

export function ImagePromptConfigForm({
  config,
  setConfig,
  onOpenPresets
}: PromptConfigFormProps) {
  const characterCount = config.topic.length;
  const isTopicValid = characterCount >= 20;

  return (
    <div className="space-y-3">
      {/* Top Row: Quick Presets + Islamic Toggle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
        {/* Islamic Compliance Toggle - Moved Here */}
        <div className="p-2.5 bg-linear-to-r from-emerald-900/20 to-green-900/20 border border-emerald-500/30 rounded-lg flex items-center justify-between px-4">
          <div className="space-y-0">
            <Label className="text-sm font-medium text-emerald-100">Tema Islami</Label>
          </div>
          <Switch
            checked={config.isIslamic}
            onCheckedChange={(checked: any) => setConfig((prev: any) => ({ ...prev, isIslamic: checked }))}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>
        <Button
          variant="outline"
          size="lg"
          onClick={onOpenPresets}
          className="bg-linear-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50 text-purple-200 hover:bg-purple-500/20 transition-all h-full min-h-9"
        >
          <Clock className="w-3.5 h-3.5 mr-2" />
          Pilih Preset Template
        </Button>

      </div>

      {/* Topic Input - Keeping custom logic here for specifics */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="topic" className="text-sm font-medium text-slate-200">
            Topik / Tema <span className="text-rose-400">*</span>
          </Label>
          <span className={`text-xs font-medium ${isTopicValid ? 'text-emerald-400' : characterCount > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
            {characterCount}/20 min
          </span>
        </div>
        <Textarea
          id="topic"
          placeholder="Contoh: Pemandangan kota masa depan di malam hari dengan lampu neon..."
          value={config.topic}
          onChange={(e) => setConfig((prev) => ({ ...prev, topic: e.target.value }))}
          className={`bg-slate-900/50 border-2 focus:border-purple-400 text-slate-100 text-sm min-h-[100px] max-h-[300px] resize-y placeholder:text-slate-500 ${!isTopicValid && characterCount > 0
            ? 'border-amber-500/40 focus:border-amber-400'
            : isTopicValid
              ? 'border-emerald-500/40'
              : 'border-slate-700/50'
            }`}
        />
        {!isTopicValid && characterCount > 0 && (
          <p className="text-xs text-amber-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Butuh minimal 20 karakter untuk hasil terbaik
          </p>
        )}
      </div>



      {/* Select Fields Grid - 3 columns for main fields */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
        <PromptSelect
          label="Konsep Desain"
          value={config.designConcept}
          onChange={(val) => setConfig(prev => ({ ...prev, designConcept: val }))}
          options={DESIGN_CONCEPTS}
          color="purple"
        />
        <PromptSelect
          label="Style Visual"
          value={config.style}
          onChange={(val) => setConfig(prev => ({ ...prev, style: val }))}
          options={STYLE_OPTIONS}
          color="blue"
        />
        <PromptSelect
          label="Skema Warna"
          value={config.colorScheme}
          onChange={(val) => setConfig(prev => ({ ...prev, colorScheme: val }))}
          options={COLOR_SCHEMES}
          color="pink"
        />
        <PromptSelect
          label="Pencahayaan"
          value={config.lighting}
          onChange={(val) => setConfig(prev => ({ ...prev, lighting: val }))}
          options={LIGHTING_OPTIONS}
          color="orange"
        />
        <PromptSelect
          label="Perspektif"
          value={config.perspective}
          onChange={(val) => setConfig(prev => ({ ...prev, perspective: val }))}
          options={PERSPECTIVE_OPTIONS}
          color="teal"
        />
        <PromptSelect
          label="Aspect Ratio"
          value={config.aspectRatio}
          onChange={(val) => setConfig(prev => ({ ...prev, aspectRatio: val }))}
          options={ASPECT_RATIOS}
          color="cyan"
        />
      </div>

      {/* Mood and Background - Separate Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-6">
        <PromptSelect
          label="Mood"
          value={config.mood}
          onChange={(val) => setConfig(prev => ({ ...prev, mood: val }))}
          options={MOOD_OPTIONS}
          color="amber"
        />
        <PromptSelect
          label="Background"
          value={config.backgroundComplexity}
          onChange={(val) => setConfig(prev => ({ ...prev, backgroundComplexity: val }))}
          options={BACKGROUND_OPTIONS}
          color="violet"
        />
      </div>

      {/* Target Audience - Full Width */}
      <PromptInput
        label="Target Audiens"
        value={config.targetAudience || ""}
        onChange={(val) => setConfig((prev) => ({ ...prev, targetAudience: val }))}
        placeholder="Contoh: Profesional muda, Mahasiswa, dll."
        className="mb-6"
      />

      {/* Additional Details - Full Width */}
      <PromptTextarea
        label="Detail Tambahan"
        value={config.additionalDetails || ""}
        onChange={(val) => setConfig((prev) => ({ ...prev, additionalDetails: val }))}
        placeholder="Detail spesifik, elemen tertentu yang ingin dimasukkan..."
        rows={2}
      />
    </div>
  );
}
