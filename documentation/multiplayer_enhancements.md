# Multiplayer Quest Enhancements Plan

Dokumen ini merangkum rencana pengembangan fitur lanjutan untuk modul Multiplayer Quest di aplikasi Kajian Note (Alwaah). Fokus pengembangan adalah meningkatkan _user engagement_, variasi permainan, dan mekanisme _collaborative learning_.

## 📚 Context & Codebase References

Untuk memahami sistem Quest & Multiplayer yang berjalan saat ini, berikut adalah peta kode dan file referensi kritikal yang **WAJIB dianalisis sebelum melakukan perubahan**:

### 1. Multiplayer Logic & State (Supabase)

- **Service:** `src/services/supabase/multiplayerService.ts`
  - _Core Backend Logic:_ Mengatur pembuatan room, real-time subscription, logic scoring (Dynamic Scoring System), dan state management.
- **Database Schema:** `supabase/new/all-table-schema.json`
  - _Reference:_ Cek tabel `quest_sessions`. Kolom `questions_data` (JSONB) menyimpan flow permainan, sedangkan `match_id`, `game_mode` tracking history.
- **Type Definitions:** `src/types/quest.types.ts`
  - _Contracts:_ Tempat definisi interface `Player` (termasuk streak, is_finished), `QuestSession`, `Question` (termasuk Explanation). Modifikasi struktur data dimulai dari sini.

### 2. Content Provider (Appwrite)

- **Service:** `src/services/appwrite/questService.ts`
  - _Content Fetcher:_ Mengambil data statis soa (Topic -> Subtopic -> Questions).
- **Automation Scripts (Migration):**
  - `scripts/setup-appwrite.js`: Script utama untuk membuat Database, Collection, dan Attributes. **Wajib dicek jika ingin mengubah struktur data soal (misal tambah kolom 'type' untuk Puzzle).**
  - `scripts/quest-sync.js`: Script utility untuk seeding data dummy atau sync data soal.

### 3. Frontend Gameplay (React Components)

- **Game Core:** `src/components/features/quest/multiplayer/MultiplayerGame.tsx`
  - _In-Game Logic:_ Menangani timer, action button placement, tampilan soal, dan feedback explanation.
- **Lobby System:** `src/components/features/quest/multiplayer/LobbyRoom.tsx`
  - _Pre-Game:_ Menangani list player, logic minimum/maximum player, dan premium tier upsell.
- **View Controller:** `src/components/features/quest/multiplayer/QuestMultiplayerView.tsx`
  - _Flow Manager:_ Menangani navigasi antar state (Menu -> Create -> Lobby -> Game -> Result) dan mitigasi refresh page.

---

## 1. Fitur Utama yang Direncanakan

### A. Redemption Question (Kesempatan Kedua) 🔄

Memberikan kesempatan kepada pemain untuk menjawab ulang satu soal yang salah di akhir sesi permainan.

- **Tujuan:** Memberikan harapan bagi pemain yang tertinggal dan memperkuat proses belajar lewat perbaikan kesalahan.
- **Mekanisme:**
  - Sistem mencatat soal-soal yang dijawab salah oleh pemain.
  - Sebelum Final Leaderboard, pemain ditawari "Redemption Round".
  - Jika benar, poin bertambah (biasanya parsial, misal 50%).
- **Kompleksitas:** **Low - Medium**.
- **Database Impact:**
  - **Appwrite:** Tidak ada.
  - **Supabase:** Perlu update logic validasi di `submitAnswer` untuk mengizinkan input ganda pada `question_id` yang sama khusus sesi redemption.

### B. Power-Ups (Defense & Boost) 🔥

Item khusus yang bisa digunakan pemain untuk memodifikasi jalannya permainan.

- **Konsep:** Fokus pada _Self-Boost_ dan _Defense_ (bukan menyerang pemain lain), sesuai nilai _fastabiqul khairat_.
- **Contoh Item:**
  - **Streak Saver:** Melindungi streak agar tidak hilang jika salah menjawab 1x.
  - **Double Points:** Menggandakan poin untuk satu soal berikutnya.
  - **50-50:** Menghilangkan 2 jawaban yang salah.
  - **Time Freeze:** Menghentikan durasi waktu (untuk time bonus maskimal) selama beberapa detik.
- **Kompleksitas:** **Medium - High**.
- **Database Impact:**
  - **Appwrite:** Tidak ada.
  - **Supabase:** Perlu field `inventory` pada objek player dan logic validasi skor tambahan di backend.

### C. Team Mode 🤝

Mode permainan berbasis tim (misal: Ikhwan vs Akhwat, Tim A vs Tim B).

- **Tujuan:** Mendorong kolaborasi dan semangat kebersamaan (ukhuwah).
- **Mekanisme:**
  - Pemain memilih tim di Lobby.
  - Skor individu diakumulasi menjadi Skor Tim.
  - Leaderboard menampilkan ranking Tim terlebih dahulu.
- **Kompleksitas:** **Medium - High**.
- **Database Impact:**
  - **Appwrite:** Tidak ada.
  - **Supabase:** Perlu field `team_id` pada objek Player. Logic Leaderboard dan kalkulasi skor perlu disesuaikan.

### D. Question Types Variety 🧩

Variasi tipe soal selain Multiple Choice standar.

- **Tipe Baru:**
  - **True / False:** Variasi sederhana dari multiple choice (2 opsi).
  - **Puzzle / Order:** Mengurutkan jawaban (misal: Urutkan Rukun Islam, Urutkan Ayat).
  - _(Note: Type Answer ditiadakan untuk simplifikasi UX mobile)_.
- **Kompleksitas:** **Very High**.
- **Database Impact:**
  - **Appwrite (High Impact):**
    - Tabel `Questions` butuh kolom `type` (Enum).
    - Struktur kolom `correct` harus diubah/disesuaikan untuk mendukung Array urutan (JSON), bukan string tunggal.
  - **Supabase (High Impact):**
    - Logic validasi jawaban `submitAnswer` harus dinamis mengikuti tipe soal.
    - Frontend butuh UI component baru (Drag & Drop list).

---

## 2. Matriks Prioritas & Teknis

| Fitur                   | Complexity | Appwrite Change  | Supabase Change |    Priority Rec.     |
| :---------------------- | :--------: | :--------------: | :-------------: | :------------------: |
| **Redemption Question** |    ⭐⭐    |        -         |   Logic Only    | **High** (Quick Win) |
| **Power-Ups**           |   ⭐⭐⭐   |        -         |  Schema (JSON)  |      **Medium**      |
| **Team Mode**           |   ⭐⭐⭐   |        -         |  Schema (JSON)  |      **Medium**      |
| **Question Types**      | ⭐⭐⭐⭐⭐ | **Yes (Schema)** |   Logic + UI    |  **Low** (Big Task)  |

## 3. Catatan Implementasi

### Untuk Sesi Berikutnya:

1.  **Mulai dengan Redemption Question**: Ini paling aman karena tidak mengubah struktur data secara fundamental.
2.  **Power-Ups State Management**: Pikirkan cara menyimpan state inventory power-up di `QuestSessionState` secara efisien.
3.  **UI Challenge**: Question Types (Order/Puzzle) akan membutuhkan library drag-and-drop (`dnd-kit` atau `react-beautiful-dnd`) yang harus kompatibel dengan mobile touch.

---

_Dibuat otomatis oleh AI Assistant - 27 Januari 2025_
