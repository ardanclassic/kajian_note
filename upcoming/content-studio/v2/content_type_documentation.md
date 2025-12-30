# 📘 Dokumentasi Content Types - Blueprint Carousel

## 🎯 Overview
Dokumen ini adalah pedoman standar untuk membuat blueprint carousel content yang kompatibel dengan berbagai ratio (9:16, 4:5, 3:4). Content types yang tercantum sudah diseleksi untuk memastikan readability optimal di semua format.

---

## 📐 Supported Ratios
- **9:16** - Instagram/TikTok Story, Reels (Mobile-first, vertical)
- **4:5** - Instagram Feed Portrait (Versatile, balanced)
- **3:4** - Pinterest, Presentasi (Slightly vertical, content-rich)

---

## 📋 Universal Content Types

### 1. `paragraph`
**Deskripsi:** Konten dalam bentuk paragraf narasi, cocok untuk penjelasan detail atau storytelling.

**Struktur:**
```json
{
  "type": "content",
  "judul": "string",
  "content_type": "paragraph",
  "content_text": "string (max 60-80 kata per slide)"
}
```

**Kapan digunakan:**
- Penjelasan konsep yang membutuhkan narasi panjang
- Storytelling atau case study
- Elaborasi detail yang tidak bisa dalam bullet points

**Best practices:**
- Max 80 kata per slide
- Gunakan line break untuk readability
- Hindari wall of text - pecah jadi 2-3 paragraf pendek

---

### 2. `content_points`
**Deskripsi:** Daftar poin dalam format bullet points, cocok untuk informasi terstruktur.

**Struktur:**
```json
{
  "type": "content",
  "judul": "string",
  "content_type": "content_points",
  "content_points": [
    "• Poin pertama (max 15 kata)",
    "• Poin kedua (max 15 kata)",
    "• Poin ketiga (max 15 kata)"
  ]
}
```

**Kapan digunakan:**
- List fitur, manfaat, atau karakteristik
- Tips atau langkah-langkah praktis
- Ringkasan poin-poin penting

**Best practices:**
- Max 6-8 bullets per slide
- Max 15 kata per bullet
- Gunakan emoji/icon untuk visual interest
- Konsisten dalam struktur kalimat (parallel structure)

---

### 3. `sequential_process`
**Deskripsi:** Proses atau tahapan berurutan, cocok untuk step-by-step guide atau timeline.

**Struktur:**
```json
{
  "type": "content",
  "judul": "string",
  "content_type": "sequential_process",
  "intro_text": "string (optional)",
  "stages": [
    {
      "stage": "1. Tahap pertama",
      "description": "Penjelasan singkat (max 20 kata)"
    },
    {
      "stage": "2. Tahap kedua",
      "description": "Penjelasan singkat (max 20 kata)"
    }
  ]
}
```

**Kapan digunakan:**
- Tutorial atau how-to guide
- Timeline atau kronologi peristiwa
- Proses workflow atau journey

**Best practices:**
- Max 5-6 stages per slide
- Gunakan numbering yang jelas
- Description singkat dan actionable
- Bisa tambahkan arrow/connector visual

---

### 4. `infographic_style`
**Deskripsi:** Informasi dalam format card-based dengan icon, cocok untuk multiple items dengan kategori.

**Struktur:**
```json
{
  "type": "content",
  "judul": "string",
  "content_type": "infographic_style",
  "intro_text": "string (optional)",
  "items": [
    {
      "title": "Item 1",
      "description": "Penjelasan singkat",
      "icon": "icon_name (optional)"
    }
  ]
}
```

**Kapan digunakan:**
- Kategorisasi informasi
- Menampilkan multiple concepts dalam satu slide
- Data yang butuh visualisasi icon/image

**Best practices:**
- Max 4-6 items per slide
- Setiap item max 25 kata
- Gunakan icon konsisten
- Layout bisa 2x2 grid atau vertical cards

---

### 5. `detailed_breakdown`
**Deskripsi:** Breakdown konsep dengan subsections dan hierarchy, cocok untuk penjelasan mendalam terstruktur.

**Struktur:**
```json
{
  "type": "content",
  "judul": "string",
  "content_type": "detailed_breakdown",
  "main_point": "string",
  "breakdown_sections": [
    {
      "subtitle": "Subsection title",
      "items": [
        "• Item 1",
        "• Item 2"
      ]
    }
  ]
}
```

**Kapan digunakan:**
- Konsep kompleks yang butuh kategorisasi
- Penjelasan dengan multiple aspects
- Content dengan clear hierarchy

**Best practices:**
- Max 3 subsections per slide
- Max 4 items per subsection
- Clear visual hierarchy (heading > subheading > items)
- Gunakan spacing untuk pemisah sections

---

### 6. `narrative_with_points`
**Deskripsi:** Kombinasi narasi paragraf dengan bullet points, cocok untuk context + action items.

**Struktur:**
```json
{
  "type": "content",
  "judul": "string",
  "content_type": "narrative_with_points",
  "intro_text": "string (40-60 kata)",
  "content_points": [
    "• Poin 1",
    "• Poin 2"
  ]
}
```

**Kapan digunakan:**
- Penjelasan konsep + contoh praktis
- Context + actionable tips
- Theory + implementation

**Best practices:**
- Intro max 60 kata
- Bullets max 5 items
- Balance antara narasi dan list (60:40 atau 50:50)

---

### 7. `practical_checklist`
**Deskripsi:** Checklist actionable dengan checkbox, cocok untuk to-do list atau self-assessment.

**Struktur:**
```json
{
  "type": "content",
  "judul": "string",
  "content_type": "practical_checklist",
  "intro_text": "string (optional)",
  "checklist_items": [
    {
      "category": "Kategori (optional)",
      "items": [
        "□ Item yang bisa di-check (max 15 kata)",
        "□ Item kedua (max 15 kata)"
      ]
    }
  ]
}
```

**Kapan digunakan:**
- To-do list atau action plan
- Self-assessment atau evaluation
- Daily/weekly routine tracking

**Best practices:**
- Max 8-10 items total per slide
- Gunakan checkbox symbol (□ atau ☐)
- Bisa group by category jika banyak
- Action-oriented language (verb-first)

---

### 8. `definition_box`
**Deskripsi:** Definisi konsep dengan box khusus dan supporting information, cocok untuk istilah atau konsep baru.

**Struktur:**
```json
{
  "type": "content",
  "judul": "string",
  "content_type": "definition_box",
  "main_definition": "string (definisi utama, max 40 kata)",
  "content_text": "string (elaborasi, optional)",
  "supporting_box": {
    "title": "string (optional)",
    "text": "string"
  }
}
```

**Kapan digunakan:**
- Menjelaskan istilah atau konsep baru
- Educational content yang butuh clear definition
- Intro untuk topik kompleks

**Best practices:**
- Definition harus concise (max 40 kata)
- Gunakan visual box/border untuk highlight definition
- Supporting info untuk context atau contoh
- Bisa tambahkan quote, dalil, atau referensi

---

### 9. `myth_vs_fact`
**Deskripsi:** Membantah misconception dengan format mitos vs fakta yang jelas.

**Struktur:**
```json
{
  "type": "content",
  "judul": "string",
  "content_type": "myth_vs_fact",
  "items": [
    {
      "myth": "❌ Mitos: [statement]",
      "fact": "✅ Fakta: [correct statement]",
      "explanation": "string (optional, max 30 kata)"
    }
  ]
}
```

**Kapan digunakan:**
- Debunking common misconceptions
- Clarification content
- Educational correction

**Best practices:**
- Max 2-3 myth-fact pairs per slide
- Gunakan visual cues jelas (❌ vs ✅, red vs green)
- Explanation singkat untuk context
- Bisa vertical stack atau side-by-side layout

---

### 10. `misconception_clarification`
**Deskripsi:** Format khusus untuk meluruskan kesalahpahaman dengan contoh konkret.

**Struktur:**
```json
{
  "type": "content",
  "judul": "string",
  "content_type": "misconception_clarification",
  "intro_text": "string (optional)",
  "misconception_section": {
    "title": "string",
    "wrong": "❌ Statement yang salah",
    "right": "✅ Statement yang benar",
    "example": "string (contoh konkret, optional)"
  }
}
```

**Kapan digunakan:**
- Meluruskan misunderstanding yang spesifik
- Educational content dengan common errors
- Clarity pada topik yang sering disalahpahami

**Best practices:**
- Fokus pada 1 misconception per slide
- Gunakan contoh konkret untuk clarity
- Visual contrast antara wrong dan right
- Bisa tambahkan "mengapa salah" explanation

---

## 🎨 Optional Supporting Elements

### Supporting Boxes
Elemen tambahan yang bisa ditambahkan ke berbagai content types:

#### `important_note`
```json
"important_note": "⚠️ Catatan penting (max 40 kata)"
```
Untuk highlight informasi krusial.

#### `wisdom_box` / `insight_box`
```json
"wisdom_box": "💡 Insight atau hikmah (max 40 kata)"
```
Untuk takeaway atau lesson learned.

#### `reminder`
```json
"reminder": "🔔 Pengingat singkat (max 30 kata)"
```
Untuk gentle reminder atau call-back.

#### `action_box` / `call_to_action`
```json
"action_box": "🎯 Action yang harus dilakukan (max 30 kata)"
```
Untuk actionable next steps.

#### `dalil_box` / `reference_box`
```json
"dalil_box": {
  "title": "📜 Sumber:",
  "text": "Kutipan atau referensi"
}
```
Untuk quote, dalil, atau citation.

---

## 📏 Content Guidelines

### Text Length Limits:
- **Judul (Heading):** 6-8 kata max
- **Subjudul (Subheading):** 10-12 kata max
- **Paragraf:** 60-80 kata max per slide
- **Bullet point:** 15 kata max per item
- **Total bullets:** 6-8 items max per slide
- **Supporting box:** 30-40 kata max

### Visual Guidelines:
- **Padding:** Minimum 5-10% dari width di semua sisi
- **Font hierarchy:** Jelas (heading > subheading > body)
- **Line spacing:** 1.4-1.6 untuk readability
- **Max characters per line:** 50-70 karakter
- **Icon size:** Proporsional, tidak dominan dari text

### Accessibility:
- Contrast ratio minimum 4.5:1 untuk text
- Font size minimum untuk body: 14-16pt (equivalent)
- Hindari text on busy background
- Gunakan bold untuk emphasis, bukan warna saja

---

## 📝 Slide Types

### `cover`
**Deskripsi:** Slide pembuka/cover
```json
{
  "slide_number": 1,
  "type": "cover",
  "judul": "string (6-10 kata)",
  "subjudul": "string (10-15 kata, optional)",
  "visual_elements": {
    "illustration": "string (deskripsi visual)",
    "decorative_elements": ["array", "of", "elements"]
  }
}
```

### `content`
**Deskripsi:** Slide konten utama (gunakan salah satu content_type di atas)
```json
{
  "slide_number": 2,
  "type": "content",
  "judul": "string",
  "content_type": "pilih salah satu dari 10 types",
  // ... fields sesuai content_type
}
```

### `closing`
**Deskripsi:** Slide penutup dengan CTA
```json
{
  "slide_number": 10,
  "type": "closing",
  "judul": "string",
  "main_message": "string (pesan utama, max 80 kata)",
  "call_to_action": [
    "string (action 1)",
    "string (action 2)"
  ],
  "visual_elements": {
    "illustration": "string",
    "decorative_elements": ["array"]
  }
}
```

---

## 🔧 Blueprint Structure Template

```json
{
  "meta": {
    "author": "string",
    "logo_url": "string (URL)",
    "content_type": "carousel",
    "topic": "string (topik konten)"
  },
  "captions": "string (caption untuk social media post)",
  "slides": [
    {
      "slide_number": 1,
      "type": "cover",
      // ... cover fields
    },
    {
      "slide_number": 2,
      "type": "content",
      // ... content fields
    },
    // ... more slides
    {
      "slide_number": 10,
      "type": "closing",
      // ... closing fields
    }
  ],
  "hashtags": {
    "primary": ["array", "of", "main", "hashtags"],
    "secondary": ["array", "of", "secondary", "hashtags"],
    "engagement": ["array", "of", "engagement", "hashtags"]
  }
}
```

---

## ✅ Checklist Kualitas Blueprint

Sebelum finalisasi blueprint, pastikan:

- [ ] Setiap slide memiliki `slide_number` berurutan
- [ ] `judul` tidak melebihi 8 kata
- [ ] Content text mengikuti word limit yang ditentukan
- [ ] Content type yang dipilih sesuai dengan tujuan konten
- [ ] Supporting boxes (jika ada) relevan dan tidak berlebihan
- [ ] Visual elements terdeskripsi dengan jelas
- [ ] Caption mencakup hook, value, dan CTA
- [ ] Hashtags relevan dan tidak spam (max 20-25 total)
- [ ] Total slides 8-12 (ideal untuk engagement)
- [ ] Flow antar slides logical dan kohesif

---

## 📚 Contoh Penggunaan

Lihat file blueprint contoh:
- `blueprint-parenting.json` - Topic: Parent Burnout
- `blueprint-akidah.json` - Topic: Rukun Iman

---

## 🔄 Version History
- v1.0 - Initial documentation (Current)

---

**Catatan:** Dokumentasi ini adalah living document dan akan di-update sesuai kebutuhan dan best practices yang berkembang.