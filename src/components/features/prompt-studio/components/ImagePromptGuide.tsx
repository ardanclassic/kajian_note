
export function ImagePromptGuide() {
  return (
    <div className="mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT: Feature Description */}
        <div className="space-y-5">
          <div>
            <h3 className="text-lg! md:text-xl! font-bold mb-3! text-slate-100">Apa itu Image Prompt Generator?</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Fitur ini membantu Anda membuat prompt yang terstruktur dan optimal untuk pembuatan gambar AI,
              lengkap dengan kepatuhan syar'i (faceless & pakaian sopan) yang diterapkan di semua mode.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="p-3.5 rounded-lg bg-linear-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
              <div className="text-purple-300 font-bold text-md mb-1.5 flex items-center gap-2">
                ⚡ Cepat & Efisien
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">Buat prompt dalam hitungan detik. Hemat waktu dibanding menulis manual.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-linear-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
              <div className="text-blue-300 font-bold text-md mb-1.5 flex items-center gap-2">
                🎨 Konsisten & Profesional
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">Prompt mengikuti aturan terbaik, memastikan hasil berkualitas tinggi.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-linear-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
              <div className="text-green-300 font-bold text-md mb-1.5 flex items-center gap-2">
                ☪️ Selalu Sesuai Syariat
                <span className="text-[10px] bg-green-500/20 px-1.5 py-0.5 rounded border border-green-500/30">!</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">SEMUA prompt menyertakan panduan tanpa wajah (faceless) dan pakaian sopan. Kontrol toggle mengatur spesifisitas konteks budaya.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-linear-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
              <div className="text-amber-300 font-bold text-md mb-1.5 flex items-center gap-2">
                ✨ Aturan Terbaik Terintegrasi
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">Penentuan peran, konteks, komposisi adegan detail - semuanya otomatis!</p>
            </div>
          </div>
        </div>

        {/* RIGHT: How To Use */}
        <div className="p-5 rounded-lg border border-slate-700/50 bg-linear-to-br from-slate-900/50 to-slate-950/50">
          <h3 className="text-xl! font-bold mb-5! text-slate-100">Cara Menggunakan</h3>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-none w-7 h-7 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                1
              </div>
              <div className="flex-1">
                <h4 className="text-[16px]! font-bold text-slate-100 mb-1.5!">Isi Konfigurasi</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Di tab "Konfigurasi", isi field yang diperlukan. "Topik/Tema" wajib diisi (minimal 20 karakter).
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-none w-7 h-7 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                2
              </div>
              <div className="flex-1">
                <h4 className="text-[16px]! font-bold text-slate-100 mb-1.5!">Tinjau Preview</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Lihat pratampilan prompt yang dibuat secara real-time. Periksa jika ada error validasi.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-none w-7 h-7 rounded-full bg-linear-to-br from-emerald-500 to-green-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                3
              </div>
              <div className="flex-1">
                <h4 className="text-[16px]! font-bold text-slate-100 mb-1.5!">Salin & Tempel</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Klik "Salin Prompt" (atau tekan Ctrl+Enter) dan tempel ke AI chatbot untuk mulai membuat gambar.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-700/50">
            <h4 className="text-xl! font-bold text-slate-100 mb-3! flex items-center gap-2">
              💡 Pro Tip
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">!</span>
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed mb-2">
              Setelah menyalin prompt, tempelkan ke chatbot AI favorit Anda (Gemini, ChatGPT, Midjourney, DALL-E) untuk menghasilkan gambar yang optimal. Tekan <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400">Ctrl+Enter</kbd> untuk menyalin dengan cepat!
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer Section */}
      <div className="mt-8 p-4 rounded-lg bg-slate-950/50 border border-slate-800/50 text-center">
        <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center justify-center gap-2">
          Disclaimer
        </h4>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto">
          AI hanyalah alat bantu yang terkadang bisa menghasilkan output yang tidak 100% akurat atau sesuai syariat (terutama visual manusia).
          Jika hasil belum memuaskan, silakan <strong>Generate Ulang</strong> dengan spesifikasi yang lebih detail.
        </p>
      </div>
    </div>
  );
}
