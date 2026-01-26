


import { BookOpen, Sparkles, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

export function StorybookGuide() {
  return (
    <div className="mx-auto space-y-6 md:space-y-8 pb-8">
      {/* Intro */}
      <div className="space-y-3 md:space-y-4">
        <h3 className="text-xl md:text-2xl font-bold text-emerald-100 flex items-start md:items-center gap-3">
          <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-emerald-400 mt-1 md:mt-0 shrink-0" />
          <span>Panduan Storybook Prompt Generator</span>
        </h3>
        <p className="text-slate-300 leading-relaxed text-sm md:text-lg">
          Generator ini dirancang khusus untuk membuat storyboard buku anak Islami yang berkualitas.
          <br className="hidden md:block" />
          <span className="inline-block mt-2 md:mt-0 md:ml-2 text-xs md:text-base text-emerald-300 font-semibold bg-emerald-900/30 px-2 py-1 md:py-0.5 rounded border border-emerald-500/30">
            Rekomendasi: Dioptimalkan untuk Google Gemini
          </span>
        </p>
      </div>

      {/* Why Gemini Section */}
      <div className="p-4 md:p-5 rounded-xl bg-linear-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/40 shadow-lg shadow-emerald-900/20">
        <div className="flex flex-col md:flex-row items-start gap-4">
          <div className="hidden md:block p-3 bg-emerald-500/20 rounded-full border border-emerald-500/30 shrink-0">
            <Lightbulb className="w-6 h-6 text-emerald-300" />
          </div>
          <div className="space-y-3 w-full">
            <div className="flex items-center gap-2 md:block">
              <div className="md:hidden p-1.5 bg-emerald-500/20 rounded-full border border-emerald-500/30 shrink-0">
                <Lightbulb className="w-4 h-4 text-emerald-300" />
              </div>
              <h4 className="text-lg md:text-xl font-bold text-emerald-200 leading-tight">Mengapa Merekomendasikan Gemini?</h4>
            </div>

            <p className="text-slate-300 leading-relaxed text-sm md:text-base">
              Google Gemini memiliki kapabilitas multimodal dan "Long Context" yang sangat baik untuk menjaga konsistensi cerita panjang. Prompt ini disusun agar kompatibel dengan logika struktur Gemini.
            </p>

            <div className="mt-4 p-3 md:p-4 bg-slate-950/50 rounded-lg border border-emerald-500/20">
              <h5 className="text-xs md:text-sm font-semibold text-emerald-300 mb-2 uppercase tracking-wide">Cara Menggunakan:</h5>
              <ol className="list-decimal list-inside space-y-1.5 text-xs md:text-sm text-slate-300">
                <li>Buka <strong className="text-white">Google Gemini</strong>.</li>
                <li>Cari/masuk fitur <strong className="text-white">"Storybook"</strong> (jika di Explore/Gems).</li>
                <li>Tempelkan (Paste) prompt yang sudah Anda copy.</li>
                <li>Gemini akan memproses storyboard per halaman.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-3 md:space-y-4">
          <h4 className="text-base md:text-lg font-semibold text-slate-200 border-b border-slate-700 pb-2">Fitur Utama</h4>
          <div className="space-y-2 md:space-y-3">
            <div className="p-3 md:p-4 rounded-lg bg-slate-900/50 border border-slate-800/50">
              <div className="flex items-center gap-2 mb-2 text-emerald-300 font-medium text-sm md:text-base">
                <Sparkles className="w-4 h-4" /> Sharia Compliance Engine
              </div>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">Otomatis menyisipkan aturan ketat: Karakter tanpa wajah (Faceless), pakaian menutup aurat, tanpa musik, dan nilai tauhid yang lurus.</p>
            </div>
            <div className="p-3 md:p-4 rounded-lg bg-slate-900/50 border border-slate-800/50">
              <div className="flex items-center gap-2 mb-2 text-blue-300 font-medium text-sm md:text-base">
                <BookOpen className="w-4 h-4" /> Full Storyboard Structure
              </div>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">Menghasilkan rincian halaman demi halaman: Teks Narasi, Deskripsi Visual, dan Prompt Gambar AI.</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          <h4 className="text-base md:text-lg font-semibold text-slate-200 border-b border-slate-700 pb-2">Tips & Larangan</h4>
          <div className="p-3 md:p-4 rounded-lg bg-slate-900/50 border border-slate-800/50 h-fit">
            <ul className="space-y-3 md:space-y-4">
              <li className="flex items-start gap-3">
                <div className="p-1 rounded bg-slate-800 text-blue-400 mt-0.5 shrink-0"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                <div className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  <strong className="text-slate-200 block md:inline mb-1 md:mb-0">Perjelas Nilai Moral.</strong>
                  Spesifikkan nilai moral. Contoh: gunakan "Keberanian mengakui kesalahan" daripada hanya "Jujur".
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-1 rounded bg-slate-800 text-purple-400 mt-0.5 shrink-0"><Sparkles className="w-3.5 h-3.5" /></div>
                <div className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  <strong className="text-slate-200 block md:inline mb-1 md:mb-0">Eksplorasi Gaya Bahasa.</strong>
                  Anda bisa meminta Gemini untuk "Ubah gaya bahasa menjadi berima" setelah storyboard awal dibuat.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-1 rounded bg-slate-800 text-emerald-400 mt-0.5 shrink-0"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                <div className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  <strong className="text-slate-200 block md:inline mb-1 md:mb-0">Visual Emotif.</strong>
                  Instruksikan AI untuk mendeskripsikan bahasa tubuh yang ekspresif (misal: "bahu merosot", "melompat").
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer Section */}
      <div className="p-3 md:p-4 rounded-lg bg-slate-950/50 border border-slate-800/50 text-center">
        <h4 className="text-xs md:text-sm font-semibold text-slate-400 mb-1 md:mb-2 uppercase tracking-wider flex items-center justify-center gap-2">
          <AlertTriangle className="w-3 h-3 md:w-4 md:h-4" /> Disclaimer
        </h4>
        <p className="text-xs md:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
          AI hanyalah alat bantu. Jika hasil belum memuaskan, silakan <strong>Generate Ulang</strong> dengan pengaturan yang lebih spesifik.
        </p>
      </div>
    </div>
  );
}
