import { Save, AlertCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PromptPreviewProps {
  generatedPrompt: string;
  onCopy: () => void;
  onSave: () => void;
  onReset: () => void;
  copied: boolean;
  validationErrors: string[];
  mode?: "image" | "taaruf" | "storybook";
  // Backward compatibility or for convenience if we still use checks
  isTaaruf?: boolean;
  filledRequired?: number;
  totalRequired?: number;
}

export function PromptPreview({
  generatedPrompt,
  onCopy,
  onSave,
  onReset,
  copied,
  validationErrors,
  mode = "image",
  isTaaruf = false, // Deprecated, but used as fallback if mode not set properly or for backward compat
  filledRequired,
  totalRequired
}: PromptPreviewProps) {
  // Normalize mode if isTaaruf is passed but mode is default
  const effectiveMode = isTaaruf ? "taaruf" : mode;

  const hasErrors = validationErrors.length > 0;
  // Progress is shown for Ta'aruf and Storybook (if passed)
  const showProgress = (effectiveMode === "taaruf" || effectiveMode === "storybook") && filledRequired !== undefined && totalRequired !== undefined;

  return (
    <div className="space-y-2.5 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-base! font-semibold text-slate-100">Preview Prompt</h3>
        <div className="flex gap-2">
          <button
            onClick={onSave}
            className="text-sm text-slate-400 hover:text-purple-300 transition-colors flex items-center gap-1"
            title="Save to history"
          >
            <Save className="w-3.5 h-3.5" />
            Simpan
          </button>
          <button
            onClick={onReset}
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Progress Indicator (Ta'aruf only) */}
      {showProgress && (
        <div className="p-3 bg-linear-to-r from-pink-900/20 to-rose-900/20 border border-pink-500/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-pink-200">Progress Pengisian</span>
            <span className="text-xs font-bold text-pink-300">
              {filledRequired}/{totalRequired} Wajib
            </span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-pink-500 to-rose-500 transition-all duration-300 shadow-[0_0_10px_rgba(236,72,153,0.3)]"
              style={{ width: `${(filledRequired / totalRequired) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {hasErrors && (
        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
          {validationErrors.map((error, idx) => (
            <p key={idx} className="text-xs text-amber-300 flex items-center gap-2 mb-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Preview Box */}
      <div className="flex-1 p-3.5 rounded-lg bg-linear-to-br from-slate-900/80 to-slate-950/80 border-2 border-slate-700/50 overflow-y-auto h-[450px] max-h-[450px]">
        <pre className="text-xs text-slate-200 whitespace-pre-wrap font-mono leading-relaxed">
          {generatedPrompt}
        </pre>
      </div>

      {/* Pro Tip */}
      <div className={`p-2.5 rounded-lg border bg-linear-to-r ${effectiveMode === "storybook"
        ? "from-emerald-500/10 to-teal-500/10 border-emerald-500/20"
        : "from-blue-500/10 to-cyan-500/10 border-blue-500/20"
        }`}>
        <p className="text-xs text-slate-300 leading-relaxed">
          <span className={`font-semibold ${effectiveMode === "storybook" ? "text-emerald-300" : "text-blue-300"}`}>
            💡 Pro Tip:
          </span>{" "}
          {effectiveMode === "storybook" ? (
            <>
              Untuk hasil terbaik, kami <span className="text-emerald-300 font-semibold">sangat merekomendasikan Google Gemini (Fitur Storybook)</span>.
            </>
          ) : effectiveMode === "taaruf" ? (
            <>
              Tempelkan prompt ke chatbot AI favorit Anda (Claude, ChatGPT, Gemini) untuk membuat Biodata Ta'aruf Anda.
            </>
          ) : (
            <>
              Tempelkan ke AI Image Generator (Midjourney, DALL-E, Bing Image Creator) untuk menghasilkan gambar yang optimal.
            </>
          )}
        </p>
      </div>

      {/* Copy Button */}
      <Button
        onClick={onCopy}
        className={`w-full gap-2 transition-all h-11 text-sm font-bold ${copied
          ? "bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white"
          : "bg-linear-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:via-pink-500 hover:to-rose-500 text-white shadow-lg shadow-purple-500/20"
          }`}
        disabled={hasErrors}
        title={hasErrors ? "Perbaiki error untuk menyalin" : "Salin ke clipboard"}
      >
        {copied ? (
          <>
            <Check className="w-5 h-5" />
            Tersalin!
          </>
        ) : (
          <>
            <Copy className="w-5 h-5" />
            Salin Prompt
          </>
        )}
      </Button>
    </div>
  );
}
