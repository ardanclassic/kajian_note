# Panduan Membuat & Submit Data Quest (Topic & Quiz)

Dokumen ini menjelaskan cara membuat data topik dan kuis baru untuk fitur Quest, serta cara memasukkannya ke dalam database Appwrite.

## 1. Struktur Data JSON

Data untuk Quest disimpan dalam format JSON. File-file ini harus diletakkan di folder `src/data/quest/`.

### A. Topics (Topic)

File: `src/data/quest/topics.json` (atau nama lain yang relevan).
Berisi array object topik.

**Format Field:**

- `slug` (string, unique): ID unik untuk URL (contoh: `fiqh-shalat`, `sirah-nabawiyah`).
- `topic` (string): Kategori utama (contoh: `Fiqh`, `Sirah`, `Aqidah`).
- `subtopic` (string): Sub-kategori (contoh: `Ibadah`, `Sejarah`).
- `name` (string): Nama lengkap topik yang ditampilkan.
- `description` (string): Penjelasan singkat tentang topik.
- `icon` (string): Nama icon (dari Lucide React, e.g., `BookOpen`, `Users`).
- `color` (string): Tema warna (e.g., `emerald`, `amber`, `rose`, `blue`).
- `order` (number): Urutan tampilan.
- `question_count` (number): Total pertanyaan (untuk display, bisa diupdate otomatis nanti).
- `is_active` (boolean): `true` untuk menampilkan topik.

**Contoh:**

```json
[
  {
    "slug": "fiqh-shalat",
    "topic": "Fiqh",
    "subtopic": "Ibadah",
    "name": "Fiqh Shalat Dasar",
    "description": "Pelajari dasar-dasar shalat...",
    "icon": "Users",
    "color": "emerald",
    "order": 1,
    "question_count": 5,
    "is_active": true
  }
]
```

### B. Questions (Pertanyaan)

File: `src/data/quest/questions_[topik].json` (contoh: `questions_fiqh.json`).
Berisi array object pertanyaan.

**Format Field:**

- `topic_slug` (string): Harus sama persis dengan `slug` di data Topic.
- `question_text` (string): Pertanyaan.
- `question_context` (string | null): Penjelasan tambahan atau konteks sebelum pertanyaan (opsional).
- `options` (array string): Pilihan jawaban (disarankan 4 pilihan).
- `correct_answer_index` (number): Index jawaban yang benar dari array `options` (dimulai dari 0).
- `explanation` (string): Penjelasan jawaban yang benar (muncul setelah menjawab).
- `reference` (string | null): Sumber atau dalil (opsional).
- `difficulty` (enum): `easy`, `medium`, atau `hard`.
- `is_active` (boolean): `true`.

**Contoh:**

```json
[
  {
    "topic_slug": "fiqh-shalat",
    "question_text": "Apa hukum membaca Al-Fatihah dalam shalat?",
    "question_context": null,
    "options": ["Sunnah", "Wajib (Rukun)", "Makruh", "Mubah"],
    "correct_answer_index": 1,
    "explanation": "Membaca Al-Fatihah adalah rukun shalat bagi imam dan munfarid.",
    "reference": "HR. Bukhari Muslim",
    "difficulty": "easy",
    "is_active": true
  }
]
```

## 2. Cara Submit Data ke Appwrite

Setelah file JSON dibuat atau diupdate, jalankan script seeding untuk mengirim data ke Appwrite.

1.  Buka terminal.
2.  Pastikan file `.env` sudah berisi API Key Appwrite (`APPWRITE_API_KEY`).
3.  Jalankan perintah berikut:

```bash
node scripts/seed-quest-data.js
```

**Apa yang dilakukan script ini?**

- Membaca semua file JSON di `src/data/quest/`.
- Mengupload **Topics**:
  - Jika topik dengan slug yang sama sudah ada, akan di-**update**.
  - Jika belum ada, akan di-**bikin baru**.
- Mengupload **Questions**:
  - Script akan mengecek apakah pertanyaan sama (text sama) sudah ada di topik tersebut.
  - Jika sudah ada, akan di-**skip** (untuk mencegah duplikasi).
  - Jika belum ada, akan di-**tambahkan**.

## 3. Workflow Menambah Konten Baru

1.  Buat file JSON baru di `src/data/quest/` (misal: `questions_newtopic.json`).
2.  Pastikan Topik induknya sudah ada di `topics.json`. Jika belum, tambahkan.
3.  Isi pertanyaan sesuai format.
4.  Jalankan `node scripts/seed-quest-data.js`.
5.  Cek di aplikasi atau Appwrite Console untuk memverifikasi data masuk.
