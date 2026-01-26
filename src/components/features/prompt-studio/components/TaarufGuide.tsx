import { Heart, CheckCircle2, XCircle, Lightbulb, AlertTriangle } from "lucide-react";
import { GuideSection } from "./common/GuideComponents";

export function TaarufGuide() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="text-left md:text-center space-y-2 pb-4 border-b border-slate-800">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-rose-400">
            Panduan Biodata Ta'aruf Generator
          </h2>
        </div>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Panduan lengkap untuk membuat Biodata Ta'aruf yang profesional, autentik, dan sesuai dengan adab Islami
        </p>
      </div>

      {/* Purpose Section */}
      <GuideSection
        icon={Heart}
        title="Tujuan Biodata Ta'aruf"
        color="pink"
      >
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Memfasilitasi proses perkenalan halal (ta'aruf) untuk tujuan pernikahan</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Menyajikan diri secara autentik dan profesional kepada calon pasangan dan keluarganya</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Memungkinkan komunikasi yang bermakna dan terarah menuju pernikahan</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Menunjukkan keseriusan dan kesiapan untuk komitmen pernikahan</span>
          </li>
        </ul>
      </GuideSection>

      {/* DO's Section */}
      <GuideSection
        icon={CheckCircle2}
        title="✅ Yang HARUS Dilakukan"
        color="emerald"
      >
        <div className="space-y-4">
          <div>
            <h4 className="text-[20px]! font-semibold text-emerald-300 mb-2!">Keaslian & Kejujuran:</h4>
            <ul className="space-y-1.5 text-sm text-slate-300 ml-4">
              <li>• Jadilah diri sendiri - keaslian menarik jodoh yang cocok</li>
              <li>• Sampaikan kelebihan dengan jujur tanpa berlebihan</li>
              <li>• Akui area pengembangan dengan dewasa dan sadar diri</li>
              <li>• Bagikan minat dan passion yang nyata, bukan yang terdengar mengesankan</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[20px]! font-semibold text-emerald-300 mb-2!">Adab Islami:</h4>
            <ul className="space-y-1.5 text-sm text-slate-300 ml-4">
              <li>• Gunakan bahasa yang sopan dan modest sesuai audiens Muslim</li>
              <li>• Bingkai semua hal dalam konteks dan nilai-nilai Islam</li>
              <li>• Ekspresikan niat menikah dengan tulus dan serius</li>
              <li>• Tunjukkan pemahaman bahwa pernikahan adalah ibadah dan tanggung jawab</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[20px]! font-semibold text-emerald-300 mb-2!">Kejelasan & Spesifisitas:</h4>
            <ul className="space-y-1.5 text-sm text-slate-300 ml-4">
              <li>• Spesifik tentang praktik keagamaan (misal: "Sholat 5x berjamaah" vs "religius")</li>
              <li>• Berikan contoh konkret dari sifat kepribadian</li>
              <li>• Kriteria yang jelas membantu menghindari ketidakcocokan</li>
              <li>• Cukup spesifik untuk menonjol, cukup umum untuk memungkinkan percakapan</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[20px]! font-semibold text-emerald-300 mb-2!">Presentasi Profesional:</h4>
            <ul className="space-y-1.5 text-sm text-slate-300 ml-4">
              <li>• Bagian yang terorganisir dengan heading yang jelas</li>
              <li>• Tata bahasa dan ejaan yang benar (menunjukkan perhatian dan keseriusan)</li>
              <li>• Panjang yang sesuai (2-3 halaman, detail tapi tidak overwhelming)</li>
              <li>• Format yang mudah dibaca</li>
            </ul>
          </div>
        </div>
      </GuideSection>

      {/* DON'Ts Section */}
      <GuideSection
        icon={XCircle}
        title="❌ Yang HARUS Dihindari"
        color="rose"
      >
        <div className="space-y-2 text-sm text-slate-300">
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>Deskripsi generik ("orang baik," "religius," "nice")</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>Bahasa negatif atau mengeluh tentang pengalaman masa lalu</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>Detail berlebihan tentang kekayaan/status (terkesan materialistis)</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>Kriteria duniawi yang tidak realistis atau terlalu kaku yang mengabaikan prioritas agama</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>Menyalin template kata per kata (kurang keaslian)</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>Terlalu singkat (tampak tidak berkomitmen) atau terlalu panjang (overwhelming)</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>Humor yang tidak pantas atau bahasa kasual</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>Berbagi detail pribadi yang terlalu personal untuk tahap awal</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>Ketidakjujuran atau embellishment (fondasi pernikahan adalah kejujuran)</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>Fokus utama pada penampilan fisik atau kekayaan (bertentangan dengan tuntunan Nabi)</span>
          </div>
        </div>
      </GuideSection>

      {/* Islamic Compliance */}
      <GuideSection
        icon={AlertTriangle}
        title="⚠️ Adab Islami yang KRUSIAL"
        color="amber"
      >
        <div className="space-y-4">
          <div>
            <h4 className="text-[20px]! font-semibold text-amber-300 mb-2!">Tawadhu' (Kerendahan Hati):</h4>
            <ul className="space-y-1.5 text-sm text-slate-300 ml-4">
              <li>• Sampaikan kelebihan dengan rendah hati, akui bahwa semua dari Allah</li>
              <li>• Hindari kesombongan atau pamer tentang pencapaian</li>
              <li>• Seimbangkan kepercayaan diri dengan pengakuan ketidaksempurnaan</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[20px]! font-semibold text-amber-300 mb-2!">Shiddiq (Kejujuran):</h4>
            <ul className="space-y-1.5 text-sm text-slate-300 ml-4">
              <li>• Kejujuran mutlak dalam semua informasi yang diberikan</li>
              <li>• Transparan tentang hal-hal penting (pernikahan sebelumnya, kesehatan, dll)</li>
              <li>• Tidak ada penipuan atau menyembunyikan informasi yang relevan</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[20px]! font-semibold text-amber-300 mb-2!">Batasan yang Tepat:</h4>
            <ul className="space-y-1.5 text-sm text-slate-300 ml-4">
              <li>• Tidak ada foto yang tidak pantas atau deskripsi fisik di luar fakta dasar</li>
              <li>• Hindari bahasa yang terlalu romantis atau emosional</li>
              <li>• Pertahankan gaya komunikasi yang sesuai gender</li>
              <li>• Tidak ada informasi kontak yang melewati jalur ta'aruf yang benar</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[20px]! font-semibold text-amber-300 mb-2!">Perspektif Islami tentang Pernikahan:</h4>
            <ul className="space-y-1.5 text-sm text-slate-300 ml-4">
              <li>• Bingkai pernikahan sebagai ibadah dan menyempurnakan separuh deen</li>
              <li>• Ekspresikan pemahaman tentang hak dan tanggung jawab pernikahan</li>
              <li>• Tunjukkan komitmen membangun sakinah, mawaddah, wa rahmah</li>
              <li>• Selaraskan tujuan dengan visi Islam tentang keluarga</li>
            </ul>
          </div>
        </div>
      </GuideSection>

      {/* Hadith Reference */}
      <div className="p-4 bg-linear-to-br from-emerald-900/20 to-green-900/20 border border-emerald-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <Lightbulb className="hidden md:block w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-2!">
            <h4 className="text-lg! md:text-xl! font-bold text-emerald-300">Tuntunan Rasulullah ﷺ:</h4>
            <p className="text-sm text-slate-300 italic">
              "Wanita dinikahi karena empat hal: hartanya, keturunannya, kecantikannya, dan agamanya.
              Maka pilihlah yang beragama, niscaya engkau beruntung."
            </p>
            <p className="text-sm text-slate-400">(HR. Bukhari & Muslim)</p>
            <p className="text-sm text-emerald-200 mt-2">
              <strong>Catatan:</strong> Agama dan akhlak mulia harus menjadi kriteria utama.
              Kecantikan, harta, dan keturunan adalah bonus, bukan penentu utama.
            </p>
          </div>
        </div>
      </div>

      {/* Recommended AI Chatbots */}
      <GuideSection
        icon={Lightbulb}
        title="🤖 AI Chatbot yang Direkomendasikan"
        color="purple"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300 mb-3!">
            Setelah copy prompt, paste ke salah satu AI chatbot berikut untuk generate Biodata Ta'aruf Anda:
          </p>

          {/* Claude - Priority #1 */}
          <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="shrink-0 w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 text-xs font-bold">
                1
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <h5 className="text-sm font-bold text-purple-300">Claude (Anthropic) - PRIORITAS UTAMA ⭐</h5>
                  <p className="text-xs text-slate-400 mt-0.5">Paling direkomendasikan untuk konten panjang & terstruktur</p>
                </div>
                <a
                  href="https://claude.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
                >
                  → Buka Claude.ai
                </a>
              </div>
            </div>
          </div>

          {/* ChatGPT - Alternative #1 */}
          <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="shrink-0 w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-300 text-xs font-bold">
                2
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <h5 className="text-sm font-bold text-blue-300">ChatGPT (OpenAI) - Alternatif Bagus</h5>
                  <p className="text-xs text-slate-400 mt-0.5">Pilihan kedua yang juga sangat baik</p>
                </div>
                <a
                  href="https://chat.openai.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  → Buka ChatGPT
                </a>
              </div>
            </div>
          </div>

          {/* Gemini - Alternative #2 */}
          <div className="p-3 bg-slate-800/50 border border-slate-600/30 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="shrink-0 w-6 h-6 rounded-full bg-slate-600/20 border border-slate-500/40 flex items-center justify-center text-slate-300 text-xs font-bold">
                3
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <h5 className="text-sm font-bold text-slate-300">Gemini (Google) - Opsi Tambahan</h5>
                  <p className="text-xs text-slate-400 mt-0.5">Bisa digunakan sebagai alternatif</p>
                </div>
                <a
                  href="https://gemini.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-300 transition-colors"
                >
                  → Buka Gemini
                </a>
              </div>
            </div>
          </div>
        </div>
      </GuideSection>

      {/* Disclaimer Section */}
      <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800/50 text-center">
        <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Disclaimer
        </h4>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto">
          Prompt AI hanyalah alat bantu untuk menyusun kalimat awal. Anda <strong>WAJIB</strong> mereview dan mengedit ulang isi biodata agar 100% jujur, akurat, dan sesuai dengan kondisi nyata Anda sebelum dikirimkan.
        </p>
      </div>
    </div>
  );
}

