# Quest Questions Enhancement - Prompt Templates Guide

## 📋 Overview

Dokumen ini berisi template prompt yang telah dioptimalkan untuk membuat dan menambahkan soal-soal kuis berkualitas tinggi. Setiap template dirancang untuk menghasilkan pertanyaan yang memenuhi standar kualitas yang telah ditetapkan.

---

## 🎯 Standar Kualitas Pertanyaan

Setiap soal yang dibuat **HARUS** memenuhi kriteria berikut:

### 1. **Analitis**

- Membutuhkan pemikiran kritis dan analisa mendalam
- Tidak sekadar hafalan fakta
- Mendorong pemahaman konsep yang lebih dalam

### 2. **Konseptual**

- Fokus pada pemahaman prinsip dan konsep
- Menghubungkan berbagai ide dan gagasan
- Mengeksplorasi "mengapa" dan "bagaimana", bukan hanya "apa"

### 3. **Kontekstual**

- Relevan dengan kehidupan sehari-hari
- Dapat diterapkan dalam situasi nyata
- Mempertimbangkan konteks budaya dan sosial

### 4. **Relevan dengan Zaman**

- Menyinggung isu-isu kontemporer (media sosial, teknologi, tren modern)
- Menghubungkan ajaran Islam dengan realitas kehidupan milenial/Gen Z
- Contoh: smartphone addiction, social media etiquette, digital privacy, fandom culture, dll.

### 5. **Socratic (Sokratik)**

- Menggunakan metode pertanyaan yang memancing refleksi
- Mendorong user untuk berpikir lebih dalam tentang keyakinan mereka
- Menggunakan pertanyaan terbuka yang menantang asumsi

### 6. **Sejalan dengan Manhaj Salaf**

- Berdasarkan Al-Qur'an dan As-Sunnah yang shahih
- Sesuai dengan pemahaman Ahlussunnah wal Jama'ah
- Tidak menyimpang dari akidah yang benar
- Menghindari bid'ah dan pemahaman menyimpang

### 7. **Penulisan Taswib yang Benar**

Gunakan Unicode ligature yang tepat untuk istilah Arab:

- `ﷺ` untuk Nabi Muhammad (shallallahu 'alaihi wasallam)
- `ﷻ` untuk Allah (subhanahu wa ta'ala / jalla jalaluhu)
- `عليه السلام` untuk para Nabi lainnya ('alaihissalam)
- Tulis nama-nama dengan ejaan yang benar (tidak disingkat): Rasulullah, Al-Qur'an, Hadits
- Format sitasi dalil: `QS. Nama Surah: Ayat` atau `HR. Perawi`

### 8. **Distribusi Tipe Soal**

- 75% soal konseptual/analitis/kontekstual
- 25% soal hafalan dasar (untuk fondasi pengetahuan)
- Variasi tipe: `multiple_choice`, `true_false`, `puzzle_order`

---

## 📝 Template Prompt

### Template 1: Membuat Topik Baru

````
Saya ingin membuat topik baru untuk kuis aplikasi pembelajaran Islam.

**TOPIK**: [Nama Topik, contoh: "Fiqih Muamalat"]

**INSTRUKSI**:
1. Buatkan struktur data JSON untuk topic baru ini di file `src/data/quest/topics.json`
2. Ikuti format yang sudah ada (lihat contoh topik lain)
3. Tentukan slug yang SEO-friendly (lowercase, dash-separated)
4. Berikan deskripsi yang menarik dan informatif
5. Pastikan topik ini sejalan dengan manhaj salaf

**FORMAT JSON** yang diharapkan:
```json
{
  "topic": "Nama Topik",
  "slug": "nama-topik",
  "name": "Nama Subtopik Detail",
  "description": "Deskripsi menarik tentang topik ini..."
}
````

**OUTPUT**:

- Update file `topics.json` dengan menambahkan entry baru
- Buat folder baru di `src/data/quest/[topic-slug]/` jika diperlukan

```

---

### Template 2: Membuat Subtopik Baru

```

Saya ingin menambahkan subtopik baru ke dalam topik yang sudah ada.

**TOPIK INDUK**: [Nama Topik, contoh: "Akidah"]
**SUBTOPIK BARU**: [Nama Subtopik, contoh: "Akidah Rukun Iman kepada Kitab-Kitab Allah"]

**INSTRUKSI**:

1. Tambahkan entry subtopik baru ke file `src/data/quest/topics.json`
2. Buat file JSON baru di folder topik terkait: `src/data/quest/[topic-slug]/[subtopic-slug].json`
3. Gunakan slug yang deskriptif dan SEO-friendly
4. Berikan deskripsi yang jelas dan menarik

**FORMAT ENTRY di topics.json**:

```json
{
  "topic": "Nama Topik",
  "slug": "nama-subtopik",
  "name": "Nama Lengkap Subtopik",
  "description": "Deskripsi lengkap tentang subtopik ini yang menjelaskan apa yang akan dipelajari..."
}
```

**OUTPUT**:

- Update `topics.json`
- Buat file kosong `[subtopic-slug].json` dengan array kosong `[]`

```

---

### Template 3: Membuat Data Soal Baru (dari Awal)

```

Saya ingin membuat data soal untuk subtopik baru dari awal.

**SUBTOPIK**: [Nama Subtopik, contoh: "Akidah Hari Akhir"]
**SLUG FILE**: [nama file, contoh: "akidah-hari-akhir.json"]
**JUMLAH SOAL**: [angka, contoh: 50, 75, 100]

**STANDAR KUALITAS** (WAJIB DIPENUHI):
✅ **Analitis**: Pertanyaan memerlukan analisa dan pemikiran kritis
✅ **Konseptual**: Fokus pada pemahaman konsep, bukan hafalan semata
✅ **Kontekstual**: Bisa diterapkan dalam kehidupan sehari-hari
✅ **Relevan Zaman**: Menyinggung isu kontemporer yang relate dengan kehidupan milenial/Gen Z

- Contoh isu: smartphone addiction, social media ethics, digital privacy, streaming culture,
  online gaming, influencer culture, cancel culture, mental health awareness,
  environmental issues, K-pop fandom, flexing culture, ghosting, FOMO, dll.
  ✅ **Socratic**: Menggunakan metode pertanyaan yang memancing refleksi mendalam
  ✅ **Manhaj Salaf**: Sesuai dengan pemahaman Ahlussunnah wal Jama'ah
  ✅ **Taswib Benar**: Gunakan `ﷺ`, `ﷻ`, `عليه السلام` dengan benar

**DISTRIBUSI SOAL**:

- 75% soal konseptual/analitis/skenario/kontekstual
- 25% soal hafalan dasar (nama, definisi, istilah penting)

**VARIASI TIPE PERTANYAAN**:

- Scenario-based (contoh: "Bayangkan seorang Muslim yang...")
- Case study (contoh: "Ahmad sering scroll medsos hingga lupa waktu shalat...")
- Comparative analysis (contoh: "Apa perbedaan mendasar antara...")
- Philosophical reasoning (contoh: "Mengapa Allah ﷻ menciptakan...")
- Contemporary application (contoh: "Bagaimana hukum Islam memandang fenomena...")

**FORMAT JSON**:
Setiap soal harus mengikuti struktur:

```json
{
  "subtopic_id": "slug-subtopik",
  "topic_slug": "slug-subtopik",
  "type": "multiple_choice" | "true_false" | "puzzle_order",
  "question_text": "Pertanyaan lengkap...",
  "options": [
    { "id": "A", "text": "Opsi A" },
    { "id": "B", "text": "Opsi B" },
    ...
  ],
  "correct": "A" | "true" | ["STEP_1", "STEP_2", ...],
  "explanation": {
    "text": "Penjelasan lengkap yang mendidik...",
    "dalil": "QS. Nama Surah: Ayat atau HR. Perawi"
  },
  "points": 10 | 15 | 20 | 25
}
```

**INSTRUKSI KHUSUS**:

1. Buat [JUMLAH SOAL] pertanyaan berkualitas tinggi
2. Pastikan SETIAP soal memenuhi SEMUA standar kualitas di atas
3. Gunakan bahasa Indonesia yang baik, lugas, dan mudah dipahami
4. Setiap explanation harus mendidik dan memberikan insight baru
5. Hindari pertanyaan yang terlalu mudah atau terlalu sulit
6. Buat pertanyaan yang engaging dan menarik minat user untuk belajar

**OUTPUT**:
Buat file JSON lengkap di: `src/data/quest/[topic-folder]/[subtopic-slug].json`

```

---

### Template 4: Menambahkan Soal ke Subtopik yang Sudah Ada

```

Saya ingin menambahkan soal ke subtopik yang sudah ada.

**FILE TARGET**: [path file, contoh: "src/data/quest/akidah/akidah-hari-akhir.json"]
**JUMLAH SOAL SAAT INI**: [angka, contoh: 20]
**TARGET TOTAL SOAL**: [angka, contoh: 50, 75, 100]
**JUMLAH SOAL YANG DITAMBAHKAN**: [TARGET - SAAT INI]

**KONTEKS**:
Saya sudah memiliki [JUMLAH SOAL SAAT INI] soal di file ini. Tolong review dulu soal-soal yang sudah ada, lalu tambahkan [JUMLAH SOAL YANG DITAMBAHKAN] soal baru yang:

1. TIDAK mengulangi konsep yang sudah dibahas
2. Melengkapi dan memperdalam materi yang sudah ada
3. Menambah variasi sudut pandang dan konteks

**STANDAR KUALITAS** (WAJIB DIPENUHI):
✅ **Analitis**: Pertanyaan memerlukan analisa dan pemikiran kritis
✅ **Konseptual**: Fokus pada pemahaman konsep, bukan hafalan semata
✅ **Kontekstual**: Bisa diterapkan dalam kehidupan sehari-hari
✅ **Relevan Zaman**: Menyinggung isu kontemporer yang relate dengan kehidupan milenial/Gen Z

- Contoh isu: smartphone addiction, social media ethics, digital privacy, streaming culture,
  online gaming, influencer culture, cancel culture, mental health awareness,
  environmental issues, K-pop fandom, flexing culture, ghosting, FOMO, dll.
  ✅ **Socratic**: Menggunakan metode pertanyaan yang memancing refleksi mendalam
  ✅ **Manhaj Salaf**: Sesuai dengan pemahaman Ahlussunnah wal Jama'ah
  ✅ **Taswib Benar**: Gunakan `ﷺ`, `ﷻ`, `عليه السلام` dengan benar

**DISTRIBUSI SOAL KESELURUHAN** (setelah penambahan):

- 75% soal konseptual/analitis/skenario/kontekstual
- 25% soal hafalan dasar

**INSTRUKSI**:

1. Baca dan pahami semua soal yang sudah ada di file
2. Identifikasi gap atau area yang belum tercover
3. Buat [JUMLAH SOAL YANG DITAMBAHKAN] soal baru yang melengkapi
4. Pastikan tidak ada duplikasi konsep atau pertanyaan yang mirip
5. Maintain konsistensi kualitas dengan soal-soal yang sudah ada
6. Tambahkan variasi konteks kontemporer yang berbeda

**FORMAT**:
Tambahkan soal baru ke dalam array JSON yang sudah ada, pastikan:

- Format JSON valid (comma, bracket, quote)
- Setiap soal mengikuti struktur yang sama dengan soal existing
- Unicode ligature diterapkan dengan benar

**OUTPUT**:
Update file JSON dengan menambahkan soal-soal baru ke bagian akhir array.

````

---

### Template 5: Replace Soal Secara Random

```
Saya ingin mereplace beberapa soal secara random di subtopik yang sudah ada.

**FILE TARGET**: [path file, contoh: "src/data/quest/akidah/akidah-hari-akhir.json"]
**JUMLAH SOAL SAAT INI**: [angka, contoh: 100]
**JUMLAH SOAL YANG AKAN DIREPLACE**: [angka, contoh: 30]

**KONTEKS**:
Saya ingin mereplace [JUMLAH SOAL YANG AKAN DIREPLACE] soal secara RANDOM dari total [JUMLAH SOAL SAAT INI] soal yang ada. Tujuannya adalah untuk:
1. Refresh konten dengan perspektif baru
2. Menambah variasi konteks kontemporer
3. Meningkatkan kualitas soal yang kurang engaging
4. Update dengan isu-isu terkini

**INSTRUKSI**:
1. Baca dan review SEMUA soal yang ada di file
2. Pilih [JUMLAH SOAL YANG AKAN DIREPLACE] soal secara RANDOM untuk direplace
3. JANGAN pilih soal yang sudah sangat baik kualitasnya
4. Prioritaskan replace soal yang:
   - Terlalu sederhana/basic
   - Kurang relevan dengan konteks modern
   - Tidak cukup analitis/konseptual
   - Tidak memiliki konteks kontemporer
5. Buat soal pengganti yang LEBIH BAIK dari soal yang direplace

**STANDAR KUALITAS** (WAJIB DIPENUHI):
✅ **Analitis**: Pertanyaan memerlukan analisa dan pemikiran kritis
✅ **Konseptual**: Fokus pada pemahaman konsep, bukan hafalan semata
✅ **Kontekstual**: Bisa diterapkan dalam kehidupan sehari-hari
✅ **Relevan Zaman**: Menyinggung isu kontemporer yang relate dengan kehidupan milenial/Gen Z
   - Contoh isu: smartphone addiction, social media ethics, digital privacy, streaming culture,
     online gaming, influencer culture, cancel culture, mental health awareness,
     environmental issues, K-pop fandom, flexing culture, ghosting, FOMO, dll.
✅ **Socratic**: Menggunakan metode pertanyaan yang memancing refleksi mendalam
✅ **Manhaj Salaf**: Sesuai dengan pemahaman Ahlussunnah wal Jama'ah
✅ **Taswib Benar**: Gunakan `ﷺ`, `ﷻ`, `عليه السلام` dengan benar
✅ **Point Sesuai Difficulty**: Gunakan sistem scoring yang tepat (lihat panduan Point System)

**DISTRIBUSI SOAL KESELURUHAN** (tetap maintain):
- 75% soal konseptual/analitis/skenario/kontekstual
- 25% soal hafalan dasar

**FORMAT OUTPUT**:
1. List nomor urut soal yang akan direplace (contoh: #5, #12, #23, #47, #89)
2. Buat soal pengganti untuk masing-masing nomor tersebut
3. Replace soal lama dengan soal baru pada posisi yang sama
4. Pastikan total jumlah soal tetap sama
5. Maintain format JSON yang valid

**CATATAN PENTING**:
- Jangan ubah struktur file atau urutan soal lainnya
- Hanya replace soal pada index yang ditentukan
- Pastikan soal baru LEBIH BAIK dari soal lama
- Jaga konsistensi tema dengan subtopik
```

---

## 🔍 Contoh Penerapan

### Contoh 1: Soal Kontemporer + Analitis

```json
{
  "subtopic_id": "akidah-hari-akhir",
  "topic_slug": "akidah-hari-akhir",
  "type": "multiple_choice",
  "question_text": "Seseorang sangat hobi mengunggah foto pribadinya (selfie) ke sosial media demi mendapatkan pujian (likes). Di akhirat, perbuatan ini bisa berisiko menghapus pahala karena penyakit...",
  "options": [
    { "id": "A", "text": "Ujub (bangga diri) dan Riya (ingin dipuji)" },
    { "id": "B", "text": "Hasad (dengki)" },
    { "id": "C", "text": "Kikir (pelit)" },
    { "id": "D", "text": "Ghibah (gosip)" }
  ],
  "correct": "A",
  "explanation": {
    "text": "Mengharap pujian manusia (Riya) dan merasa diri hebat (Ujub) adalah syirik ashghar (kecil) yang dapat membatalkan pahala amal shaleh.",
    "dalil": "HR. Ahmad"
  },
  "points": 15
}
````

**Analisis**: Soal ini menggabungkan isu kontemporer (selfie culture) dengan konsep akidah (riya & ujub), bersifat analitis karena membutuhkan pemahaman kaitan antara perilaku digital dan akhlak Islam.

---

### Contoh 2: Soal Socratic + Filosofis

```json
{
  "subtopic_id": "akidah-hari-akhir",
  "topic_slug": "akidah-hari-akhir",
  "type": "multiple_choice",
  "question_text": "Jika Allah ﷻ Maha Pengampun, apa fungsi utama 'Mizan' (Timbangan Amal) yang dicatatkan dengan sangat detail?",
  "options": [
    { "id": "A", "text": "Untuk mempersulit manusia masuk surga" },
    { "id": "B", "text": "Menunjukkan Keadilan Mutlak Allah ﷻ sehingga tak ada yang dizalimi sekecil biji sawi pun" },
    { "id": "C", "text": "Sebagai formalitas prosedur akhirat saja" },
    { "id": "D", "text": "Untuk membandingkan antar manusia satu dengan lainnya" }
  ],
  "correct": "B",
  "explanation": {
    "text": "Mizan adalah bukti keadilan Allah ﷻ yang maha teliti. Setiap amal, baik maupun buruk, akan diperlihatkan timbangannya secara adil.",
    "dalil": "QS. Al-Anbiya: 47"
  },
  "points": 15
}
```

**Analisis**: Pertanyaan ini bersifat Socratic karena memancing pemikiran tentang hubungan antara sifat Pengampun dan Keadilan Allah ﷻ, mendorong refleksi filosofis.

---

### Contoh 3: Soal Scenario-Based + Kontekstual

```json
{
  "subtopic_id": "akidah-hari-akhir",
  "topic_slug": "akidah-hari-akhir",
  "type": "multiple_choice",
  "question_text": "Banyak pemuda Muslim rela mengantre lama dan membayar mahal demi konser atau artis idola (Fandom), namun berat untuk melangkah ke masjid. Fenomena ini menunjukkan lemahnya pemahaman tentang...",
  "options": [
    { "id": "A", "text": "Konsep 'Al-Mar'u ma'a man ahabba' (Seseorang akan dikumpulkan bersama yang dicintainya)" },
    { "id": "B", "text": "Cara berniaga yang baik" },
    { "id": "C", "text": "Sejarah peradaban manusia" },
    { "id": "D", "text": "Rukun Islam yang pertama" }
  ],
  "correct": "A",
  "explanation": {
    "text": "Kecintaan yang berlebihan pada sosok idola kafir atau pelaku maksiat sangat berbahaya bagi akidah, karena seseorang akan dikumpulkan bersama yang dicintainya di akhirat kelak.",
    "dalil": "HR. Bukhari & Muslim"
  },
  "points": 20
}
```

**Analisis**: Soal ini mengangkat fenomena K-pop/fandom culture yang sangat relevan dengan generasi muda, lalu menghubungkannya dengan konsep iman kepada hari akhir.

---

## ⚠️ Hal yang HARUS DIHINDARI

### ❌ Soal Hafalan Murni Tanpa Konteks

```json
// BURUK - Terlalu menghafal
{
  "question_text": "Berapa jumlah pintu surga?",
  "correct": "8"
}
```

### ✅ Perbaikan dengan Konteks

```json
// BAIK - Ada konteks dan hikmah
{
  "question_text": "Surga memiliki 8 pintu yang masing-masing memiliki keistimewaan. Pintu 'Ar-Rayyan' khusus untuk golongan manakah?",
  "options": [
    { "id": "A", "text": "Orang yang berpuasa" },
    { "id": "B", "text": "Orang yang shalat malam" },
    { "id": "C", "text": "Orang yang bersedekah" },
    { "id": "D", "text": "Orang yang berjihad" }
  ],
  "correct": "A",
  "explanation": {
    "text": "Ar-Rayyan adalah pintu khusus bagi ahli puasa. Ini menunjukkan betapa mulianya ibadah puasa di sisi Allah ﷻ.",
    "dalil": "HR. Bukhari & Muslim"
  }
}
```

---

### ❌ Soal yang Tidak Relevan dengan Zaman

```json
// BURUK - Kurang relevan
{
  "question_text": "Apa nama kuda Nabi Muhammad ﷺ?",
  "correct": "Al-Qaswa"
}
```

### ✅ Perbaikan dengan Relevansi Modern

```json
// BAIK - Aplikatif ke konteks modern
{
  "question_text": "Nabi ﷺ sangat menyayangi hewan tunggangannya. Dalam konteks modern, bagaimana seharusnya sikap seorang Muslim terhadap kendaraannya (mobil/motor)?",
  "options": [
    { "id": "A", "text": "Merawatnya dengan baik dan tidak ugal-ugalan di jalan raya" },
    { "id": "B", "text": "Memamerkannya di sosial media agar dapat pujian" },
    { "id": "C", "text": "Digunakan untuk balapan liar" },
    { "id": "D", "text": "Tidak perlu dirawat karena bisa beli baru" }
  ],
  "correct": "A",
  "explanation": {
    "text": "Merawat amanah (termasuk kendaraan) dan menjaga keselamatan di jalan adalah bagian dari akhlak Islam yang mencerminkan tanggung jawab.",
    "dalil": "QS. An-Nisa: 58"
  }
}
```

---

## 🚀 Tips Membuat Soal Berkualitas Tinggi

1. **Mulai dari Isu Kontemporer**
   - Identifikasi tren/isu yang viral di kalangan Muslim muda
   - Hubungkan dengan konsep Islam yang relevan

2. **Gunakan Bahasa yang Relatable**
   - Gunakan istilah yang familiar (ghosting, flexing, FOMO, dll)
   - Jangan terlalu formal atau kaku

3. **Buat Explanation yang Mendidik**
   - Jangan hanya jawab benar/salah
   - Berikan insight tambahan yang memperkaya pemahaman
   - Sertakan dalil yang kuat

4. **Sesuaikan Point dengan Difficulty Level**
   - Gunakan sistem scoring berbasis kesulitan (lihat Point System Guide)
   - Base point: 10 untuk soal basic
   - Maksimal point: 30 untuk soal sangat sulit/komprehensif

5. **Pastikan Akurasi Syar'i**
   - Cross-check dengan referensi yang valid
   - Hindari pendapat yang kontroversial atau lemah
   - Berpegang pada Manhaj Salaf

---

## 🎯 Point System & Difficulty Level Guide

### Panduan Pemberian Point Berdasarkan Kesulitan

Setiap soal HARUS diberi point yang sesuai dengan tingkat kesulitannya. Berikut adalah panduan lengkap:

#### **Level 1: Basic (10 Point)**

**Karakteristik:**

- Soal hafalan dasar (nama, istilah, definisi)
- Jawaban bisa ditemukan langsung dari teks/dalil
- Tidak memerlukan analisa mendalam
- Cocok untuk foundational knowledge

**Contoh:**

```json
{
  "question_text": "Apa yang dimaksud dengan 'Al-Qari'ah'?",
  "options": [
    { "id": "A", "text": "Pembaca Al-Qur'an wanita" },
    { "id": "B", "text": "Hari Kiamat yang mengetuk/mengguncang hati manusia" },
    { "id": "C", "text": "Kota di pinggir gurun" },
    { "id": "D", "text": "Pintu masuk surga" }
  ],
  "correct": "B",
  "points": 10
}
```

---

#### **Level 2: Intermediate (15 Point)**

**Karakteristik:**

- Memerlukan pemahaman konsep dasar
- Menghubungkan antara teori dan praktik
- Ada konteks sederhana yang relevan
- Membutuhkan sedikit analisa

**Contoh:**

```json
{
  "question_text": "Mengapa taubat tidak lagi diterima setelah matahari terbit dari barat?",
  "options": [
    { "id": "A", "text": "Karena waktu dunia sudah habis" },
    { "id": "B", "text": "Karena iman pada saat itu menjadi 'terpaksa' setelah bukti nyata" },
    { "id": "C", "text": "Karena Malaikat maut sudah turun" },
    { "id": "D", "text": "Karena setan sudah dibinasakan" }
  ],
  "correct": "B",
  "points": 15
}
```

---

#### **Level 3: Advanced (20 Point)**

**Karakteristik:**

- Memerlukan analisa mendalam
- Scenario-based atau case study
- Menghubungkan konsep Islam dengan realitas kontemporer
- Membutuhkan critical thinking

**Contoh:**

```json
{
  "question_text": "Banyak pemuda Muslim rela mengantre lama demi konser artis idola, namun berat ke masjid. Fenomena ini menunjukkan lemahnya pemahaman tentang...",
  "options": [
    { "id": "A", "text": "Konsep 'Al-Mar'u ma'a man ahabba' (dikumpulkan bersama yang dicintai)" },
    { "id": "B", "text": "Cara berniaga yang baik" },
    { "id": "C", "text": "Sejarah peradaban" },
    { "id": "D", "text": "Rukun Islam pertama" }
  ],
  "correct": "A",
  "points": 20
}
```

---

#### **Level 4: Expert (25 Point)**

**Karakteristik:**

- Soal Socratic yang memancing refleksi mendalam
- Memerlukan pemahaman komprehensif multiple concepts
- Philosophical reasoning atau comparative analysis
- Aplikasi konsep ke konteks yang kompleks

**Contoh:**

```json
{
  "question_text": "Jika Allah ﷻ Maha Pengampun, apa fungsi utama 'Mizan' yang dicatatkan sangat detail?",
  "options": [
    { "id": "A", "text": "Untuk mempersulit manusia masuk surga" },
    { "id": "B", "text": "Menunjukkan Keadilan Mutlak Allah ﷻ" },
    { "id": "C", "text": "Formalitas prosedur saja" },
    { "id": "D", "text": "Membandingkan antar manusia" }
  ],
  "correct": "B",
  "points": 25
}
```

---

#### **Level 5: Master (30 Point)**

**Karakteristik:**

- Puzzle/urutan dengan banyak langkah
- Multi-layered reasoning
- Synthesis dari berbagai konsep
- Membutuhkan pemahaman mendalam dan aplikasi praktis yang kompleks

**Contoh:**

```json
{
  "type": "puzzle_order",
  "question_text": "Urutkan prioritas respons mukmin saat menghadapi fitnah akhir zaman:",
  "options": [
    { "id": "P_1", "text": "Memperkuat ilmu & tauhid" },
    { "id": "P_2", "text": "Menjauhi sumber fitnah" },
    { "id": "P_3", "text": "Bergaul dengan ulama rabbani" },
    { "id": "P_4", "text": "Perbanyak istighfar & doa" },
    { "id": "P_5", "text": "Sabar & istiqamah" }
  ],
  "correct": ["P_1", "P_2", "P_3", "P_4", "P_5"],
  "points": 30
}
```

---

### 📊 Distribusi Point yang Direkomendasikan

Untuk set 100 soal, gunakan distribusi berikut:

- **10 Point** (Basic): 20-25 soal (20-25%)
- **15 Point** (Intermediate): 30-35 soal (30-35%)
- **20 Point** (Advanced): 25-30 soal (25-30%)
- **25 Point** (Expert): 15-20 soal (15-20%)
- **30 Point** (Master/Puzzle): 5-10 soal (5-10%)

**Total Point Range**: 1,500 - 1,800 point untuk 100 soal

---

### ✅ Checklist Penentuan Point

Sebelum assign point, tanyakan:

1. ✓ Apakah soal ini hanya menguji hafalan? → **10 point**
2. ✓ Apakah butuh pemahaman konsep sederhana? → **15 point**
3. ✓ Apakah ada skenario kontemporer + analisa? → **20 point**
4. ✓ Apakah Socratic/philosophical reasoning? → **25 point**
5. ✓ Apakah puzzle/multi-step/sangat komprehensif? → **30 point**

---

## 📚 Referensi Format JSON

### Structure File topics.json

```json
[
  {
    "topic": "Nama Topik Utama",
    "slug": "slug-subtopik-unik",
    "name": "Nama Detail Subtopik",
    "description": "Deskripsi lengkap yang menjelaskan apa yang akan dipelajari dalam subtopik ini..."
  }
]
```

### Structure File Soal (per subtopik)

```json
[
  {
    "subtopic_id": "slug-subtopik",
    "topic_slug": "slug-subtopik",
    "type": "multiple_choice",
    "question_text": "Pertanyaan lengkap...",
    "options": [
      { "id": "A", "text": "Opsi pertama" },
      { "id": "B", "text": "Opsi kedua" },
      { "id": "C", "text": "Opsi ketiga" },
      { "id": "D", "text": "Opsi keempat" }
    ],
    "correct": "A",
    "explanation": {
      "text": "Penjelasan lengkap yang mendidik...",
      "dalil": "QS. Nama Surah: Ayat atau HR. Nama Perawi",
      "resources": []
    },
    "points": 10,
    "spare": null
  }
]
```

### Tipe-tipe Soal

#### 1. Multiple Choice

```json
{
  "type": "multiple_choice",
  "options": [
    { "id": "A", "text": "..." },
    { "id": "B", "text": "..." },
    { "id": "C", "text": "..." },
    { "id": "D", "text": "..." }
  ],
  "correct": "B"
}
```

#### 2. True/False

```json
{
  "type": "true_false",
  "options": [
    { "id": "true", "text": "Benar" },
    { "id": "false", "text": "Salah" }
  ],
  "correct": "true"
}
```

#### 3. Puzzle Order (Urutan)

```json
{
  "type": "puzzle_order",
  "question_text": "Urutkan peristiwa berikut...",
  "options": [
    { "id": "STEP_1", "text": "Langkah pertama" },
    { "id": "STEP_2", "text": "Langkah kedua" },
    { "id": "STEP_3", "text": "Langkah ketiga" },
    { "id": "STEP_4", "text": "Langkah keempat" }
  ],
  "correct": ["STEP_1", "STEP_2", "STEP_3", "STEP_4"]
}
```

---

## 🔄 Workflow Setelah Membuat Soal

1. **Validasi JSON**
   - Pastikan format JSON valid (gunakan JSON validator)
   - Check syntax: comma, bracket, quote

2. **Run Quest Sync Script**

   ```bash
   node scripts/quest-sync.js --questions --verbose
   ```

3. **Test di Aplikasi**
   - Jalankan aplikasi di development mode
   - Test soal-soal yang baru ditambahkan
   - Pastikan tidak ada bug atau error

4. **Quality Check**
   - Review kembali apakah semua standar terpenuhi
   - Pastikan tidak ada typo atau kesalahan ejaan
   - Verifikasi dalil dan referensi

---

## 📞 Contact & Support

Jika ada pertanyaan atau butuh bantuan lebih lanjut terkait pembuatan soal kuis, silakan hubungi tim development.

---

**Terakhir diupdate**: 28 Januari 2026  
**Versi**: 1.1.0  
**Changelog**:

- Added Template 5: Replace Soal Secara Random
- Added comprehensive Point System & Difficulty Level Guide
- Enhanced scoring guidelines with examples per level
