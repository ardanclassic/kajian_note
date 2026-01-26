# Quick Start: Menambahkan Data Sample ke Appwrite

## ✅ Setup Selesai!

Collections sudah berhasil dibuat:

- ✅ `topics` - Untuk menyimpan kategori quiz
- ✅ `questions` - Untuk menyimpan soal-soal

## 📝 Langkah Selanjutnya

### 1. Buka Appwrite Console

1. Kunjungi: https://cloud.appwrite.io/console
2. Login dengan akun Anda
3. Pilih project: **alwaah-scopes**
4. Klik **Databases** di sidebar
5. Pilih database: **alwaah-quest**

### 2. Tambahkan Topic Pertama

1. Klik collection **topics**
2. Klik tombol **Create Document**
3. Copy-paste JSON berikut:

```json
{
  "slug": "fiqih-shalat",
  "topic": "Fiqih",
  "subtopic": "Shalat",
  "name": "Fiqih - Shalat",
  "description": "Pelajari hukum dan tata cara shalat dalam Islam",
  "icon": "🕌",
  "color": "#10b981",
  "order": 1,
  "question_count": 5,
  "is_active": true
}
```

4. Klik **Create**

### 3. Tambahkan Questions untuk Topic Tersebut

Klik collection **questions**, lalu tambahkan 5 soal berikut:

#### Soal 1

```json
{
  "topic_slug": "fiqih-shalat",
  "question_text": "Berapa rakaat shalat Subuh?",
  "options": ["2 rakaat", "3 rakaat", "4 rakaat", "5 rakaat"],
  "correct_answer_index": 0,
  "explanation": "Shalat Subuh terdiri dari 2 rakaat. Ini adalah shalat fardhu yang dikerjakan di waktu fajar sebelum matahari terbit.",
  "reference": "HR. Bukhari dan Muslim",
  "difficulty": "easy",
  "is_active": true
}
```

#### Soal 2

```json
{
  "topic_slug": "fiqih-shalat",
  "question_text": "Apa rukun shalat yang pertama?",
  "options": ["Takbiratul ihram", "Berdiri bagi yang mampu", "Niat", "Membaca Al-Fatihah"],
  "correct_answer_index": 2,
  "explanation": "Niat adalah rukun shalat yang pertama. Niat dilakukan di dalam hati sebelum takbiratul ihram.",
  "reference": "Kitab Fiqih Sunnah",
  "difficulty": "medium",
  "is_active": true
}
```

#### Soal 3

```json
{
  "topic_slug": "fiqih-shalat",
  "question_text": "Kapan waktu shalat Dzuhur dimulai?",
  "options": [
    "Setelah matahari tergelincir dari tengah langit",
    "Ketika bayangan sama panjang dengan bendanya",
    "Setelah matahari terbenam",
    "Sebelum fajar"
  ],
  "correct_answer_index": 0,
  "explanation": "Waktu shalat Dzuhur dimulai setelah matahari tergelincir dari tengah langit (zawal) hingga bayangan suatu benda sama panjang dengan bendanya.",
  "reference": "HR. Muslim",
  "difficulty": "medium",
  "is_active": true
}
```

#### Soal 4

```json
{
  "topic_slug": "fiqih-shalat",
  "question_text": "Apa yang dimaksud dengan sujud sahwi?",
  "options": [
    "Sujud karena lupa atau ragu dalam shalat",
    "Sujud syukur",
    "Sujud tilawah",
    "Sujud dalam shalat jenazah"
  ],
  "correct_answer_index": 0,
  "explanation": "Sujud sahwi adalah sujud yang dilakukan karena lupa atau ragu-ragu dalam melaksanakan shalat, seperti lupa jumlah rakaat atau lupa melakukan salah satu rukun shalat.",
  "reference": "HR. Bukhari dan Muslim",
  "difficulty": "hard",
  "is_active": true
}
```

#### Soal 5

```json
{
  "topic_slug": "fiqih-shalat",
  "question_text": "Berapa kali bacaan 'Subhanallah' minimal dalam ruku?",
  "options": ["1 kali", "3 kali", "7 kali", "11 kali"],
  "correct_answer_index": 1,
  "explanation": "Minimal bacaan tasbih dalam ruku adalah 3 kali 'Subhana Rabbiyal Adzim'. Namun lebih utama jika dibaca lebih banyak.",
  "reference": "Kitab Fiqih Islam",
  "difficulty": "easy",
  "is_active": true
}
```

### 4. Tambahkan Topic Kedua (Opsional)

```json
{
  "slug": "fiqih-zakat",
  "topic": "Fiqih",
  "subtopic": "Zakat",
  "name": "Fiqih - Zakat",
  "description": "Pelajari hukum dan ketentuan zakat dalam Islam",
  "icon": "💰",
  "color": "#f59e0b",
  "order": 2,
  "question_count": 0,
  "is_active": true
}
```

### 5. Test di Aplikasi

1. **Restart dev server** (jika belum):

   ```bash
   # Stop server (Ctrl+C di terminal yang menjalankan npm run dev)
   # Lalu jalankan lagi:
   npm run dev
   ```

2. **Buka aplikasi**:
   - Navigate ke: http://localhost:5173/quest
   - Anda akan melihat topic "Fiqih - Shalat"

3. **Mulai Quiz**:
   - Klik card "Fiqih - Shalat"
   - Pilih jumlah soal (5 soal)
   - Klik "Start Quiz"
   - Jawab pertanyaan!

## 🎯 Tips Menambahkan Lebih Banyak Konten

### Format Options

- Options adalah **array of strings**
- Setiap string adalah satu pilihan jawaban
- Tidak perlu menambahkan "A.", "B.", dll - aplikasi akan otomatis menambahkannya

### Correct Answer Index

- Index dimulai dari 0
- `0` = Pilihan pertama (A)
- `1` = Pilihan kedua (B)
- `2` = Pilihan ketiga (C)
- `3` = Pilihan keempat (D)

### Difficulty Levels

- `easy` - Soal mudah
- `medium` - Soal sedang
- `hard` - Soal sulit

### Topic Slugs

Gunakan format: `{kategori}-{subkategori}`

- `fiqih-shalat`
- `fiqih-zakat`
- `fiqih-puasa`
- `aqidah-tauhid`
- `akhlak-adab`
- dll

## 📚 Contoh Topic Lainnya

### Aqidah - Tauhid

```json
{
  "slug": "aqidah-tauhid",
  "topic": "Aqidah",
  "subtopic": "Tauhid",
  "name": "Aqidah - Tauhid",
  "description": "Pelajari dasar-dasar tauhid dan keimanan",
  "icon": "☪️",
  "color": "#3b82f6",
  "order": 3,
  "question_count": 0,
  "is_active": true
}
```

### Akhlak - Adab

```json
{
  "slug": "akhlak-adab",
  "topic": "Akhlak",
  "subtopic": "Adab",
  "name": "Akhlak - Adab",
  "description": "Pelajari adab dan akhlak mulia dalam Islam",
  "icon": "🤝",
  "color": "#8b5cf6",
  "order": 4,
  "question_count": 0,
  "is_active": true
}
```

## ✅ Checklist

- [ ] Database `alwaah-quest` terverifikasi
- [ ] Collection `topics` dibuat
- [ ] Collection `questions` dibuat
- [ ] Minimal 1 topic ditambahkan
- [ ] Minimal 5 questions ditambahkan
- [ ] Dev server di-restart
- [ ] Aplikasi bisa menampilkan topics
- [ ] Quiz bisa dimulai dan berjalan

---

**Selamat! Quest feature siap digunakan! 🎉**

Untuk pertanyaan atau bantuan lebih lanjut, silakan hubungi developer.
