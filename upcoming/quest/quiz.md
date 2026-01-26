# Prompt Development: Quest (Fitur Kuis Islam)

## 📋 Overview

Buat fitur bernama **Quest** - sistem kuis Islamic knowledge dengan multiple choice questions.

---

## 🎯 Core Requirements

### 1. **Data Architecture**

**Appwrite (Quest Data Service):**

- Handle semua soal & metadata topik
- Collections:
  - `topics` → list topik & subtopik
  - `questions` → semua soal kuis
- Query soal by topic/subtopic dengan random sampling
- Public read access untuk fetch soal

**Supabase (User Data & Stats):**

- User management (existing)
- Tables:
  - `quest_sessions` → history setiap quiz session
  - `quest_stats` → aggregated stats per user per topic
  - `quest_bookmarks` → soal saved to Notes
- Private, user-specific data

**Data Flow:**

1. User pilih topik → fetch soal dari **Appwrite**
2. User jawab & selesai → save hasil ke **Supabase**
3. Stats & progress diambil dari **Supabase**
4. Soal content dari **Appwrite**

**Benefits:**

- Separation of concerns
- Scalable (soal & user data terpisah)
- Update soal tanpa touch main DB
- Each service optimized untuk purpose-nya

### 2. **Question Structure**

```json
{
  "id": "q001",
  "topic": "fiqih",
  "subtopic": "zakat",
  "question": "Apa syarat wajib zakat?",
  "options": [
    { "id": "A", "text": "Islam dan baligh" },
    { "id": "B", "text": "Mencapai nisab" },
    { "id": "C", "text": "Milik penuh" },
    { "id": "D", "text": "Semua benar" }
  ],
  "correct": "D",
  "explanation": {
    "text": "Syarat wajib zakat meliputi beragam aspek...",
    "dalil": "...",
    "resources": ["url1", "url2"]
  },
  "points": 10
}
```

### 3. **Quiz Mechanics (Phase 1 - Single User)**

**Shuffle System:**

- **Sistem** yang shuffle, bukan JSON
- Shuffle urutan soal setiap session
- Shuffle opsi jawaban setiap soal
- Setiap sesi di topik/subtopik sama = urutan berbeda
- User tidak bisa hafal posisi jawaban

**Scoring:**

- Setiap soal punya base points (default 10, bisa custom)
- Tidak ada level/tingkat kesulitan - semua soal sama
- Track total points per session

**Session Flow:**

1. Pilih topik/subtopik
2. Tentukan jumlah soal (default 10)
3. Mulai quiz - soal muncul satu per satu
4. Jawab → langsung tampilkan benar/salah
5. Tampilkan explanation & dalil
6. Button "Simpan ke Notes" (integrasi dengan fitur Notes existing)
7. Next soal
8. Summary hasil akhir

### 4. **Progress Tracking**

Display per topik:

- "12 dari 439 soal dijawab"
- Persentase benar: "75% (9/12)"
- Total points earned

**No complexity:**

- Tidak ada XP system
- Tidak ada badge/achievement
- Tidak ada public leaderboard
- Pure tracking angka

### 5. **Explanation & Resources**

Setiap setelah jawab:

- Penjelasan singkat
- Dalil (Quran/Hadits) jika ada
- Link resources untuk belajar lebih dalam
- Button "Simpan ke Notes" yang menyimpan:
  - Soal
  - Jawaban benar
  - Explanation
  - Dalil
  - Auto-tag berdasarkan topik

---

## 🎨 UI/UX Direction

**Design:**

- Clean, minimal, modern
- Calm color palette (tidak overwhelming)
- Smooth transitions dengan Framer Motion
- Mobile-first responsive

**Key Screens:**

1. Quest Home - list topik dengan progress
2. Topic Detail - subtopik + stats
3. Quiz Session - soal, opsi, explanation
4. Summary - hasil session

**Navigation:**

- Easy back navigation
- Progress indicator (soal ke-X dari Y)
- Pause/exit option

---

## 🔄 Phase 2 Prep (Multi-User - Future)

Struktur data sudah support:

- Room/Session ID
- Real-time sync via Supabase
- Multiple participants
- Live leaderboard

**Tapi sekarang fokus Phase 1 dulu.**

---

## 📦 Deliverables

1. Quest route/page structure
2. JSON schema & sample data (5-10 soal untuk testing)
3. Quiz engine (shuffle logic, scoring)
4. Progress tracking (localStorage atau Supabase)
5. Integration dengan fitur Notes
6. Responsive UI dengan smooth animations

---

## 🎯 Success Criteria

- User bisa pilih topik dan mulai quiz
- Soal & opsi ter-shuffle setiap session
- Explanation & dalil tampil dengan jelas
- Progress tersimpan dan ter-update
- Bisa simpan ke Notes dengan mudah
- UI smooth dan tidak membosankan

---

## 💡 Notes

- Prioritas: functionality > fancy animations
- Keep it simple untuk MVP
- Extensible untuk phase 2 multi-user
- Code quality: clean, typed, maintainable
