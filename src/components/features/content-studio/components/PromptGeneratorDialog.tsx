import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Download, Wand2, FileText, Settings2, X } from "lucide-react";
import {
  DEFAULT_PROMPT_CONFIG,
  CATEGORY_OPTIONS,
  SUBCATEGORY_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  DOMAIN_OPTIONS,
  LANGUAGE_OPTIONS,
  type PromptConfig,
} from "@/types/promptGenerator.types";
import { generateMinimalistPrompt, generateMinimalistFilename } from "@/utils/promptGenerator/minimalistGenerator";
import { generateVisualistPrompt, generateVisualistFilename } from "@/utils/promptGenerator/visualistGenerator";
import { toast } from "sonner";

export function PromptGeneratorDialog() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<PromptConfig>(DEFAULT_PROMPT_CONFIG);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<"configure" | "guide">("configure");

  useEffect(() => {
    if (open) setActiveTab("configure");
  }, [open]);

  useEffect(() => {
    let filename = "";
    if (config.category === "minimalist") {
      filename = generateMinimalistFilename(config);
    } else if (config.category === "visualist") {
      filename = generateVisualistFilename(config);
    }
    setConfig((prev) => ({ ...prev, filename }));
  }, [config.aspectRatio, config.subcategory, config.category, config.domain, config.language]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        let prompt = "";
        if (config.category === "minimalist") {
          if (!config.subcategory) {
            setGeneratedPrompt("Silakan pilih subkategori.");
            return;
          }
          prompt = generateMinimalistPrompt(config);
        } else if (config.category === "visualist") {
          if (!config.subcategory) {
            setGeneratedPrompt("Silakan pilih subkategori.");
            return;
          }
          prompt = generateVisualistPrompt(config);
        }
        setGeneratedPrompt(prompt);
      } catch (error) {
        console.error("Error generating prompt:", error);
        setGeneratedPrompt(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [config]);

  const handleCategoryChange = (category: string) => {
    const newCategory = category as PromptConfig["category"];
    const categoryOption = CATEGORY_OPTIONS.find((opt) => opt.value === newCategory);
    setConfig((prev) => ({
      ...prev,
      category: newCategory,
      subcategory: newCategory === "minimalist" ? "flat" : newCategory === "visualist" ? "vignette" : "",
    }));
  };

  const handleDownload = () => {
    const blob = new Blob([generatedPrompt], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const timestamp = Date.now();
    const filename = config.filename?.endsWith(".md") ? config.filename.replace(".md", "") : config.filename || "prompt";
    a.download = `${filename}-${timestamp}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Prompt berhasil diunduh!");
  };

  const selectedCategory = CATEGORY_OPTIONS.find((opt) => opt.value === config.category);
  const hasSubcategories = selectedCategory?.hasSubcategories ?? false;

  return (
    <>
      <Button
        variant="outline"
        className="w-full gap-2 bg-linear-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 hover:border-purple-400/50 hover:from-purple-600/30 hover:to-pink-600/30 text-purple-300 hover:text-purple-200 transition-all duration-300"
        size="icon-lg"
        onClick={() => setOpen(true)}
      >
        <Wand2 className="w-4 h-4" />
        Prompt Generator
      </Button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[9990] flex items-center justify-center isolate">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-[95vw] max-w-6xl h-[85vh] overflow-hidden flex flex-col bg-slate-950 border border-slate-800 shadow-2xl rounded-xl z-[9995]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-3! border-b border-slate-800/50 bg-linear-to-b from-slate-900/30 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-linear-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                      <Wand2 className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold text-lg!">
                        Prompt Generator
                      </span>
                      <span className="text-sm! text-slate-500">Buat prompt AI untuk konten Anda</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex gap-1 p-1 bg-slate-900/50 rounded-lg border border-slate-800/30">
                      <button
                        onClick={() => setActiveTab("configure")}
                        className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md text-lg font-medium transition-all ${activeTab === "configure"
                          ? "bg-slate-800 text-purple-300 shadow-sm"
                          : "text-slate-500 hover:text-slate-300"
                          }`}
                      >
                        <Settings2 className="w-4 h-4" />
                        Konfigurasi
                      </button>
                      <button
                        onClick={() => setActiveTab("guide")}
                        className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md text-lg font-medium transition-all ${activeTab === "guide"
                          ? "bg-slate-800 text-purple-300 shadow-sm"
                          : "text-slate-500 hover:text-slate-300"
                          }`}
                      >
                        <FileText className="w-4 h-4" />
                        Panduan
                      </button>
                    </div>

                    <button
                      onClick={() => setOpen(false)}
                      className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-red-500/20 transition-all"
                      title="Tutup"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 hover:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:bg-slate-800/50 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent">
                {activeTab === "configure" ? (
                  <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-full p-1">
                    {/* LEFT COLUMN: INPUTS (Span 7) */}
                    <div className="lg:col-span-7 flex flex-col gap-4 h-full">
                      {/* 1. Branding (Compact Row) */}
                      <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/50 flex items-start gap-4">
                        <div className="flex-none p-2 rounded-lg bg-pink-500/10 text-pink-400">
                          <Wand2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="authorName" className="text-xs! text-slate-400">Nama Penulis / Brand</Label>
                            <Input
                              id="authorName"
                              placeholder="alwaah.project"
                              value={config.authorName}
                              onChange={(e) => setConfig((prev) => ({ ...prev, authorName: e.target.value }))}
                              className="bg-slate-950/50 border-slate-800/50 focus:border-pink-500/50 text-slate-200 h-9 text-sm!"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="authorHashtag" className="text-xs! text-slate-400">Hashtag Utama</Label>
                            <Input
                              id="authorHashtag"
                              placeholder="ContentStudio"
                              value={config.authorHashtag}
                              onChange={(e) => setConfig((prev) => ({ ...prev, authorHashtag: e.target.value }))}
                              className="bg-slate-950/50 border-slate-800/50 focus:border-pink-500/50 text-slate-200 h-9 text-sm!"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 2. Topic (Fills remaining height) */}
                      <div className="flex-1 p-5 rounded-xl bg-slate-900/30 border border-slate-800/50 flex flex-col hover:border-purple-500/20 transition-colors">
                        <Label htmlFor="topic" className="text-base! font-medium! text-slate-300 flex items-center gap-2 mb-3!">
                          Topik & Konten
                          <span className="text-xs! text-slate-500 ml-auto bg-slate-800/50 px-2 py-0.5 rounded-full">Wajib diisi</span>
                        </Label>
                        <Textarea
                          id="topic"
                          placeholder="Tempel artikel, materi kajian, atau teks topik di sini..."
                          value={config.topic}
                          onChange={(e) => setConfig((prev) => ({ ...prev, topic: e.target.value }))}
                          className="flex-1 resize-none bg-slate-950/50 border-slate-800/50 focus:border-purple-500/50 focus:ring-purple-500/10 text-slate-200 text-sm! placeholder:text-slate-600 leading-relaxed p-4"
                        />
                      </div>
                    </div>

                    {/* RIGHT COLUMN: CONTROLS (Span 5) */}
                    <div className="lg:col-span-5 flex flex-col gap-4 h-full">
                      {/* 1. Configuration Grid */}
                      <div className="p-5 rounded-xl bg-slate-900/30 border border-slate-800/50 hover:border-blue-500/20 transition-colors space-y-5">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          <h3 className="text-sm! font-medium! text-slate-300">Konfigurasi Output</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs! text-slate-500">Domain Topik</Label>
                            <Select
                              value={config.domain || "islamic"}
                              onValueChange={(value) => setConfig((prev) => ({ ...prev, domain: value as any }))}
                            >
                              <SelectTrigger className="bg-slate-950/50 border-slate-800/50 text-slate-200 h-9 text-xs!">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900 border-slate-800 z-[10000]">
                                {DOMAIN_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value} className="text-slate-200 text-xs!">
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs! text-slate-500">Bahasa</Label>
                            <Select
                              value={config.language || "id"}
                              onValueChange={(value) => setConfig((prev) => ({ ...prev, language: value as any }))}
                            >
                              <SelectTrigger className="bg-slate-950/50 border-slate-800/50 text-slate-200 h-9 text-xs!">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900 border-slate-800 z-[10000]">
                                {LANGUAGE_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value} className="text-slate-200 text-xs!">
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs! text-slate-500">Rasio</Label>
                            <Select
                              value={config.aspectRatio}
                              onValueChange={(value) => setConfig((prev) => ({ ...prev, aspectRatio: value as any }))}
                            >
                              <SelectTrigger className="bg-slate-950/50 border-slate-800/50 text-slate-200 h-9 text-xs!">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900 border-slate-800 z-[10000]">
                                {ASPECT_RATIO_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value} className="text-slate-200 text-xs!">
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs! text-slate-500">Konsep Desain</Label>
                            <Select value={config.category} onValueChange={handleCategoryChange}>
                              <SelectTrigger className="bg-slate-950/50 border-slate-800/50 text-slate-200 h-9 text-xs!">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900 border-slate-800 z-[10000]">
                                {CATEGORY_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value} className="text-slate-200 text-xs!">
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="col-span-2 space-y-1.5">
                            <Label className="text-xs! text-slate-500">Kategori</Label>
                            {hasSubcategories ? (
                              <Select
                                value={config.subcategory}
                                onValueChange={(value) => setConfig((prev) => ({ ...prev, subcategory: value as any }))}
                              >
                                <SelectTrigger className="bg-slate-950/50 border-slate-800/50 text-slate-200 h-9 text-xs!">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 z-[10000]">
                                  {SUBCATEGORY_OPTIONS[config.category as keyof typeof SUBCATEGORY_OPTIONS].map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-slate-200 text-xs!">
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="flex items-center justify-center h-9 border border-slate-800/50 bg-slate-950/30 rounded-md opacity-50">
                                <span className="text-[10px] text-slate-500">Coming Soon ...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 2. Slide Count (Compact) */}
                      <div className="p-5 rounded-xl bg-slate-900/30 border border-slate-800/50 flex flex-col gap-4">
                        <div className="flex items-center justify-between pointer-events-none">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            <h3 className="text-sm! font-medium! text-slate-300">Jumlah Slide</h3>
                          </div>
                          <span className="text-2xl! font-bold! text-green-400 font-mono">{config.slideCount}</span>
                        </div>
                        <Slider
                          value={[config.slideCount]}
                          onValueChange={(vals) => setConfig((prev) => ({ ...prev, slideCount: vals[0] }))}
                          max={20}
                          min={5}
                          step={1}
                          className="[&_.range-thumb]:bg-green-500 [&_.range-thumb]:border-green-400"
                        />
                      </div>

                      {/* 3. Download (Bottom) */}
                      <div className="mt-auto p-5 rounded-xl bg-linear-to-br from-slate-900/50 to-purple-900/10 border border-slate-800/50 flex flex-col gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="filename" className="text-xs! text-slate-500">Nama File Output</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="filename"
                              value={config.filename}
                              onChange={(e) => setConfig((prev) => ({ ...prev, filename: e.target.value }))}
                              placeholder="prompt-islamic-flat"
                              className="bg-slate-950/50 border-slate-800/50 text-slate-200 font-mono h-9 text-xs!"
                            />
                            <div className="px-2 py-2 bg-slate-800/50 rounded border border-slate-700/50 text-slate-400 text-[10px] font-mono whitespace-nowrap">
                              .md
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={handleDownload}
                          className="w-full gap-2 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-900/20 text-sm! h-10 font-medium!"
                        >
                          <Download className="w-4 h-4" />
                          Unduh Prompt
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* LEFT: Feature Description */}
                      <div className="space-y-5">
                        <div>
                          <h3 className="text-xl! font-semibold! text-slate-200 mb-3!">Apa itu Prompt Generator?</h3>
                          <p className="text-sm! text-slate-400 leading-relaxed">
                            Fitur ini membantu Anda membuat prompt AI yang terstruktur dan optimal untuk menghasilkan blueprint layout slide secara otomatis.
                            Dengan menggunakan AI seperti Claude, Deepseek, atau Qwen, Anda dapat mengubah materi teks menjadi desain slide profesional dalam hitungan menit.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/10">
                            <div className="text-purple-400 font-semibold text-base mb-1.5">⚡ Cepat & Efisien</div>
                            <p className="text-sm! text-slate-500 leading-normal!">Generate blueprint 10+ slide dalam 2-3 menit. Hemat waktu dibanding desain manual yang bisa memakan waktu berjam-jam.</p>
                          </div>
                          <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                            <div className="text-blue-400 font-semibold text-base mb-1.5">🎨 Konsisten & Profesional</div>
                            <p className="text-sm! text-slate-500 leading-normal!">Desain otomatis mengikuti aturan style yang telah ditentukan, memastikan konsistensi visual di setiap slide.</p>
                          </div>
                          <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10">
                            <div className="text-green-400 font-semibold text-base mb-1.5">🔄 Fleksibel & Customizable</div>
                            <p className="text-sm! text-slate-500 leading-normal!">Hasil blueprint dapat diedit dan disesuaikan sepenuhnya di Content Studio sesuai kebutuhan Anda.</p>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT: How To Use */}
                      <div className="p-6 rounded-lg border border-slate-800/50 bg-slate-950/20">
                        <h3 className="text-xl! font-semibold! text-slate-200 mb-3!">Cara Menggunakan</h3>
                        <p className="text-sm! text-slate-400 mb-5">Ikuti langkah mudah berikut untuk menghasilkan layout konten:</p>

                        <div className="space-y-4 mt-6!">
                          <div className="flex gap-4">
                            <div className="flex-none w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-semibold text-sm!">1</div>
                            <div className="flex-1">
                              <h4 className="text-base! font-medium! text-slate-200 mb-1!">Unduh File Prompt</h4>
                              <p className="text-sm! text-slate-500 leading-normal!">
                                Klik tombol "Unduh Prompt (.MD)" di tab Config untuk menyimpan file prompt.
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <div className="flex-none w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-semibold text-sm!">2</div>
                            <div className="flex-1">
                              <h4 className="text-base! font-medium! text-slate-200 mb-1!">Upload ke AI Chatbot</h4>
                              <p className="text-sm! text-slate-500 leading-normal!">
                                Kirim file tersebut ke AI chatbot pilihan Anda. Rekomendasi kami: <span className="text-slate-400 font-medium">Deepseek, Claude, atau Qwen</span>.
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <div className="flex-none w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 font-semibold text-sm!">3</div>
                            <div className="flex-1">
                              <h4 className="text-base! font-medium! text-slate-200 mb-1!">Tunggu Blueprint</h4>
                              <p className="text-sm! text-slate-500 leading-normal!">
                                AI akan membaca prompt dan menghasilkan struktur slide lengkap dalam format JSON.
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <div className="flex-none w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 font-semibold text-sm!">4</div>
                            <div className="flex-1">
                              <h4 className="text-base! font-medium! text-slate-200 mb-1!">Unduh Blueprint JSON</h4>
                              <p className="text-sm! text-slate-500 leading-normal!">
                                Download file <code className="px-1.5 py-0.5 bg-slate-900/50 rounded border border-slate-800/50 text-green-300 text-xs!">JSON</code> (Artifact) yang dihasilkan AI.
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <div className="flex-none w-8 h-8 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 font-semibold text-sm!">5</div>
                            <div className="flex-1">
                              <h4 className="text-base! font-medium! text-slate-200 mb-1!">Import di Content Studio</h4>
                              <p className="text-sm! text-slate-500 leading-normal!">
                                Kembali ke Editor ini, klik tombol Import JSON, dan pilih file tersebut untuk mulai mengedit.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
