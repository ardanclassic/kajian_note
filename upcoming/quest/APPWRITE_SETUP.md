# Panduan Setup Appwrite untuk Quest Feature

## 📋 Ringkasan

Panduan ini akan membantu Anda mengatur Appwrite untuk fitur Quest (Islamic Knowledge Quiz) di aplikasi Alwaah.

## ✅ Prerequisites

- Node.js 18+ terinstal
- Akun Appwrite Cloud (sudah ada)
- Project Appwrite sudah dibuat: `alwaah-scopes`
- API Key sudah tersedia

## 🚀 Langkah Setup

### 1. Verifikasi Konfigurasi .env

File `.env` Anda sudah diupdate dengan konfigurasi berikut:

```env
# Appwrite Configuration (Quest Feature)
VITE_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=alwaah-scopes
VITE_APPWRITE_DATABASE_ID=alwaah-quest
VITE_APPWRITE_COLLECTION_TOPICS=topics
VITE_APPWRITE_COLLECTION_QUESTIONS=questions

# Appwrite API Secret (Server-side Only - For Setup Scripts)
APPWRITE_API_KEY=standard_3f0d...
```

### 2. Jalankan Setup Script

Script otomatis akan membuat database dan collections yang diperlukan:

```bash
node scripts/setup-appwrite.js
```

Script ini akan:

- ✅ Membuat database `alwaah-quest`
- ✅ Membuat collection `topics` dengan schema lengkap
- ✅ Membuat collection `questions` dengan schema lengkap
- ✅ Membuat indexes untuk performa optimal

### 3. Verifikasi di Appwrite Console

1. Buka [Appwrite Console](https://cloud.appwrite.io/console)
2. Pilih project: **alwaah-scopes**
3. Buka **Databases** → **alwaah-quest**
4. Pastikan ada 2 collections:
   - ✅ `topics`
   - ✅ `questions`

## 📊 Schema Database

### Collection: `topics`

Menyimpan daftar topik/kategori quiz.

| Field            | Type        | Required | Description                             |
| ---------------- | ----------- | -------- | --------------------------------------- |
| `slug`           | string(100) | ✅       | Unique identifier (e.g., "fiqih-zakat") |
| `topic`          | string(100) | ✅       | Kategori utama (e.g., "Fiqih")          |
| `subtopic`       | string(100) | ✅       | Sub-kategori (e.g., "Zakat")            |
| `name`           | string(200) | ✅       | Nama tampilan (e.g., "Fiqih - Zakat")   |
| `description`    | string(500) | ✅       | Deskripsi singkat                       |
| `icon`           | string(50)  | ❌       | Emoji atau icon name                    |
| `color`          | string(20)  | ❌       | Hex color untuk UI                      |
| `order`          | integer     | ✅       | Urutan tampilan (default: 0)            |
| `question_count` | integer     | ✅       | Jumlah soal tersedia (default: 0)       |
| `is_active`      | boolean     | ✅       | Status aktif (default: true)            |

**Indexes:**

- `slug_index` (unique) - untuk pencarian cepat berdasarkan slug

### Collection: `questions`

Menyimpan soal-soal quiz.

| Field                  | Type            | Required | Description                         |
| ---------------------- | --------------- | -------- | ----------------------------------- |
| `topic_slug`           | string(100)     | ✅       | Reference ke topics.slug            |
| `question_text`        | string(1000)    | ✅       | Teks pertanyaan                     |
| `question_context`     | string(500)     | ❌       | Konteks/skenario tambahan           |
| `options`              | string[](10000) | ✅       | Array pilihan jawaban (JSON)        |
| `correct_answer_index` | integer         | ✅       | Index jawaban benar (0-based)       |
| `explanation`          | string(2000)    | ❌       | Penjelasan jawaban                  |
| `reference`            | string(500)     | ❌       | Referensi (dalil/sumber)            |
| `difficulty`           | enum            | ❌       | Tingkat kesulitan: easy/medium/hard |
| `is_active`            | boolean         | ✅       | Status aktif (default: true)        |

**Indexes:**

- `topic_slug_index` - untuk filter soal berdasarkan topik

## 📝 Menambahkan Data Sample

### Contoh Topic

Buka Appwrite Console → Database → Topics → Create Document:

```json
{
  "slug": "fiqih-zakat",
  "topic": "Fiqih",
  "subtopic": "Zakat",
  "name": "Fiqih - Zakat",
  "description": "Pelajari hukum dan ketentuan zakat dalam Islam",
  "icon": "💰",
  "color": "#10b981",
  "order": 1,
  "question_count": 10,
  "is_active": true
}
```

### Contoh Question

Buka Appwrite Console → Database → Questions → Create Document:

```json
{
  "topic_slug": "fiqih-zakat",
  "question_text": "Berapa nisab zakat emas?",
  "question_context": null,
  "options": ["85 gram", "90 gram", "95 gram", "100 gram"],
  "correct_answer_index": 0,
  "explanation": "Nisab zakat emas adalah 85 gram emas murni (24 karat). Jika seseorang memiliki emas seberat 85 gram atau lebih dan telah mencapai haul (satu tahun), maka wajib mengeluarkan zakat sebesar 2.5%.",
  "reference": "Hadits Riwayat Abu Dawud",
  "difficulty": "medium",
  "is_active": true
}
```

## 🔧 Format Data Options

Field `options` adalah array of strings. Setiap option adalah teks pilihan jawaban.

**Contoh:**

```json
"options": [
  "Pilihan A - Teks jawaban pertama",
  "Pilihan B - Teks jawaban kedua",
  "Pilihan C - Teks jawaban ketiga",
  "Pilihan D - Teks jawaban keempat"
]
```

**Index jawaban benar:**

- `correct_answer_index: 0` → Pilihan A (index pertama)
- `correct_answer_index: 1` → Pilihan B (index kedua)
- dst.

## 🎯 Tips Membuat Konten

### Topics

1. Gunakan `slug` yang konsisten (lowercase, dash-separated)
2. Isi `question_count` sesuai jumlah soal yang ada
3. Gunakan emoji untuk `icon` agar lebih menarik
4. Pilih warna yang sesuai tema untuk `color`

### Questions

1. Buat pertanyaan yang jelas dan tidak ambigu
2. Berikan 4 pilihan jawaban (A, B, C, D)
3. Selalu sertakan `explanation` untuk pembelajaran
4. Tambahkan `reference` jika ada dalil/sumber
5. Set `difficulty` sesuai tingkat kesulitan

## 🔄 Update Question Count

Setelah menambahkan soal, jangan lupa update `question_count` di topic terkait:

1. Buka Topics collection
2. Edit document topic yang bersangkutan
3. Update field `question_count` sesuai jumlah soal aktual

## 🚨 Troubleshooting

### Error: "Database already exists"

✅ Normal - database sudah dibuat sebelumnya, script akan skip

### Error: "Collection already exists"

✅ Normal - collection sudah ada, script akan skip

### Error: "Attribute already exists"

✅ Normal - attribute sudah dibuat, script akan skip

### Error: "Invalid API Key"

❌ Periksa `APPWRITE_API_KEY` di file `.env`

### Error: "Project not found"

❌ Pastikan `VITE_APPWRITE_PROJECT_ID` benar

## 📱 Testing di Aplikasi

Setelah setup selesai:

1. **Restart dev server:**

   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Buka aplikasi:**
   - Navigate ke `/quest`
   - Anda akan melihat daftar topics yang sudah dibuat

3. **Test quiz:**
   - Klik salah satu topic
   - Pilih jumlah soal
   - Mulai quiz!

## 🎓 Struktur Data di Frontend

Frontend akan otomatis mapping data dari Appwrite:

```typescript
// Appwrite Response → Frontend Type
{
  "$id": "...",
  "topic_slug": "fiqih-zakat",
  "question_text": "...",
  "options": ["A", "B", "C", "D"],
  "correct_answer_index": 0
}

// Mapped to:
{
  id: "...",
  topic_slug: "fiqih-zakat",
  question_text: "...",
  options: [
    { id: "A", option_text: "...", is_correct: true },
    { id: "B", option_text: "...", is_correct: false },
    { id: "C", option_text: "...", is_correct: false },
    { id: "D", option_text: "...", is_correct: false }
  ]
}
```

## 📚 Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Console](https://cloud.appwrite.io/console)
- [REST API Reference](https://appwrite.io/docs/references)

## ✅ Checklist

- [ ] Setup script berhasil dijalankan
- [ ] Database `alwaah-quest` terlihat di console
- [ ] Collection `topics` ada dan memiliki attributes
- [ ] Collection `questions` ada dan memiliki attributes
- [ ] Minimal 1 topic sudah ditambahkan
- [ ] Minimal 5 questions untuk topic tersebut sudah ditambahkan
- [ ] Dev server sudah di-restart
- [ ] Aplikasi bisa menampilkan topics di `/quest`
- [ ] Quiz bisa dimulai dan berjalan normal

---

**Selamat! Quest feature siap digunakan! 🎉**

Jika ada pertanyaan atau masalah, silakan hubungi developer.
