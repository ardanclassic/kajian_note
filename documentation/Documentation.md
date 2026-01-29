# Alwaah - Project Documentation (Part 1)

> **Version:** 2.5.0  
> **Last Updated:** January 29, 2026  
> **Status:** Production Ready  
> **URL:** https://kajian-note.vercel.app/

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Product Vision](#product-vision)
3. [Core Features](#core-features)
4. [Tech Stack](#tech-stack)
5. [System Architecture](#system-architecture)
6. [Authentication System](#authentication-system)
7. [Subscription System](#subscription-system)
8. [Smart Summary Feature](#smart-summary-feature)
9. [Content Studio Feature](#content-studio-feature)
10. [Prompt Studio Feature](#prompt-studio-feature)
11. [Quest (Knowledge Quiz) Feature](#quest-knowledge-quiz-feature)
12. [Deep Note Feature](#deep-note-feature)
13. [Memory Cards Feature](#memory-cards-feature)
14. [External Integrations](#external-integrations)
15. [User Journey](#user-journey)
16. [Development Roadmap](#development-roadmap)

---

## Overview

**Alwaah** adalah platform "Islamic Productivity Suite" yang mengintegrasikan pencatatan kajian, pembuatan konten dakwah, dan gamifikasi pembelajaran agama dalam satu ekosistem.

### Key Features

- ✅ **Smart Note**: YouTube Import + AI Summarization
- ✅ **Creation Suite**: Content Studio & Prompt Studio untuk kreator dakwah
- ✅ **Quest Multiplayer**: Kuis cerdas cermat Islami (Real-time Team Mode)
- ✅ **Simple Auth**: Username + PIN (6 digit) + Dicebear Avatar
- ✅ **Freemium Model**: Free tier dengan Premium upgrade
- ✅ **Cloud-Based**: Supabase backend + ImageKit storage

### Target Users

- Jamaah masjid (pencatat kajian)
- Content Creator & Da'i (pembuat konten)
- Pelajar & Santri (peserta kuis)
- Pengelola kajian

---

## Product Vision

### Problem

1. Video kajian panjang sulit di-review
2. Membuat konten dakwah visual itu sulit & lama
3. Metode muraja'ah (mengulang ilmu) sering membosankan
4. Note-taking manual tidak efektif

### Solution

Alwaah menyediakan teknologi untuk **"Mengikat Ilmu"**:

- **Smart Summary** - Mengikat ilmu dari video kajian
- **Content Studio** - Menyebarkan ilmu lewat visual (Carousel/Slide)
- **Quest** - Menguji hafalan & pemahaman lewat gamifikasi
- **Prompt Studio** - Menyimpan "resep" instruksi AI terbaik

### Value Proposition

**"Teknologi untuk Mengikat Ilmu."**

Kami percaya teknologi tidak seharusnya mendistraksi, melainkan membantu menjaga keberkahan dan kekekalan ilmu yang dipelajari.

---

## Core Features

| Feature            | Status  | Description                       | Tier Access             |
| ------------------ | ------- | --------------------------------- | ----------------------- |
| **Smart Summary**  | ✅ Live | Ringkasan AI dari video kajian    | Free (10), Premium (75) |
| **Content Studio** | ✅ Live | Visual content creator (Carousel) | Premium only            |
| **Prompt Studio**  | ✅ Live | Library prompt AI terstruktur     | Free & Premium          |
| **Quest (Quiz)**   | ✅ Live | Multiplayer Islamic Quiz          | All Users               |
| **Deep Note**      | 🔜 Soon | Catatan komprehensif & lengkap    | Premium only            |
| **Memory Cards**   | 🔜 Soon | Flashcards untuk muroja'ah        | Premium only            |

---

## Tech Stack

### Frontend

| Tech              | Version | Purpose          |
| ----------------- | ------- | ---------------- |
| React             | 19.1.1  | UI Framework     |
| TypeScript        | 5.9.3   | Type Safety      |
| Vite              | 7.1.7   | Build Tool       |
| Tailwind CSS      | 4.1.16  | Styling          |
| shadcn/ui         | Latest  | UI Components    |
| Zustand           | 5.0.8   | State Management |
| **Framer Motion** | Latest  | Animations       |
| **Dicebear**      | API     | Robots Avatars   |

### Backend & Services

| Service                | Purpose                              |
| ---------------------- | ------------------------------------ |
| Supabase               | Auth + PostgreSQL + Edge Functions   |
| **Supabase Realtime**  | Multiplayer Game Sync (Quest)        |
| YouTube Transcript API | Fetch transcripts (FastAPI + Docker) |
| OpenRouter             | AI summarization                     |
| Lynk.id                | Payment gateway (webhook)            |
| ImageKit.io            | Temp file storage (auto-cleanup)     |

---

## System Architecture

_(Updated with Multiplayer & Content Studio)_

```
┌────────────────────────────────────────────┐
│         CLIENT (React - Vercel)            │
│  Auth | Content Studio | Quest | Dashboard │
│       (Creation Suite) (Multiplayer)       │
└────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────┐
│           SUPABASE BACKEND                 │
│  Auth | PostgreSQL | Edge Functions        │
│          Realtime Channels (Game)          │
└────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────┼───────────┐
   YouTube API  OpenRouter  ImageKit
   (Transcript)    (AI)    (Storage)
```

**Data Flow:**

1. User input → Frontend validation
2. API call → Supabase Auth Layer
3. Game State → Supabase Realtime Channels (WebSocket)
4. Business logic → Edge Functions / External APIs
5. Output → User

---

## Authentication System

### Design: User-Friendly untuk Orang Tua

**Registration (4 fields only):**

1. Nama Lengkap → "Ahmad Zaki"
2. Username → Auto-generated: `ahmad-zaki` (editable)
3. Nomor HP → Optional (untuk WhatsApp)
4. PIN → 6 digits (replace password)
5. **Auto Avatar** → Dicebear Bottts generated from Username

**Backend Auto-Processing:**

- Generate email: `ahmad-zaki@kajiannote.com`
- Hash PIN via Supabase Auth
- Create user with default: `role=member`, `tier=free`

---

## Subscription System

### Pricing Tiers

| Feature            | Free     | Premium         |
| ------------------ | -------- | --------------- |
| **Price**          | Rp 0     | Rp 50.000/bulan |
| **Smart Summary**  | 10 notes | 75 notes        |
| **Content Studio** | ❌       | ✅ Unlimited    |
| **Quest**          | ✅ User  | ✅ Host         |
| **Export PDF**     | ❌       | ✅              |
| **Send Telegram**  | ❌       | ✅              |

### Payment: Lynk.id (Webhook-based)

Using webhook integration to handle local payments via Lynk.id.

---

## Smart Summary Feature

_(As documented in previous versions)_

**Workflow:**
YouTube URL → Transcript → AI Summary → Rich Text Editor.

**Key Features:**

- Async processing with polling
- Waiting experience (Mini Quiz/Story)
- Export to PDF, Telegram, WhatsApp

---

## Content Studio Feature

### Status: ✅ Live

### Concept

Generator konten visual (slide/carousel) berbasis AI Blueprint. Memungkinkan pengguna mengubah teks kajian atau prompt menjadi desain slide profesional dalam hitungan detik.

### Workflow

1.  **Prompt Generator**: User menjawab beberapa pertanyaan dasar di dialog.
2.  **AI Generation**: User copy prompt ke Chatbot AI (Claude/Deepseek) -> AI menghasilkan output JSON Blueprint.
3.  **Import Blueprint**:
    - **Tab Text**: Copy-Paste kode JSON langsung.
    - **Tab File**: Upload file .json yang didownload dari AI.
4.  **Editing Canvas**: User mengedit teks/gambar di canvas "WYSYWIG" Content Studio.
5.  **Export**: Download sebagai image sequence (PNG/JPG) untuk Instagram/TikTok.

### UI Features

- **Sidebar**: Navigasi tools editing (Design, Text, Image, Background).
- **Canvas**: Area preview slide responsif.
- **Import Dialog**: Interface modern untuk input blueprint.

---

## Prompt Studio Feature

### Status: ✅ Live

### Concept

Perpustakaan template prompt yang dikurasi untuk kebutuhan produktivitas Muslim.

### Features

1.  **Preset Libraries**: Kumpulan prompt siap pakai (Image Gen, Biodata Taaruf, Storybook, Kajian Resume).
2.  **Variable Inputs**: Form dinamis untuk mengisi variabel dalam prompt.
3.  **One-Click Copy**: Copy prompt yang sudah terisi variabel ke clipboard.

---

## Quest (Knowledge Quiz) Feature

### Status: ✅ Live (Multiplayer Beta)

### Concept

Platform cerdas cermat Islami _real-time_ yang memungkinkan pengguna bermain secara _solo_ atau _team_ (Multiplayer).

### Multiplayer Features

1.  **Lobby System**: Host membuat Room, pemain lain Join via Room Code.
2.  **Real-time Sync**: Pertanyaan muncul bersamaan di semua layar pemain (Supabase Realtime).
3.  **Team Mode**:
    - Pemain bergabung ke Tim Merah atau Tim Biru.
    - Jawaban individu dihitung sebagai skor tim.
4.  **Live Leaderboard**: Klasemen sementara muncul setiap selesai ronde pertanyaan.

### Architecture

Menggunakan **Supabase Realtime Channels** untuk sinkronisasi state game (Score, Countdown, Current Question) antar client dengan latency rendah.

---

## Deep Note Feature

### Status: 🔜 Coming Soon

Evolution dari Smart Summary - memberikan catatan komprehensif hampir seperti transkrip penuh dengan struktur yang sangat baik (2000-5000 kata).

---

## External Integrations

| Service                    | Purpose                              | Key Info                 |
| -------------------------- | ------------------------------------ | ------------------------ |
| **Supabase**               | Backend (Auth + DB + Edge Functions) | All-in-one BaaS with RLS |
| **Supabase Realtime**      | Multiplayer Game Engine              | WebSocket Sync           |
| **YouTube Transcript API** | Fetch transcripts & metadata         | FastAPI + Docker         |
| **Dicebear API**           | Avatar Generation                    | Style: Bottts (Robots)   |
| **OpenRouter**             | AI summarization                     | Multiple model support   |
| **Lynk.id**                | Payment gateway                      | Webhook-based            |

---

## User Journey

### Scenario: Content Creator Workflow

```
1. Login → Menu "Creation Suite" → Content Studio
2. Buka "Prompt Generator" → Pilih topik
3. Copy Prompt → Paste ke Deepseek/Claude
4. Copy JSON Result → Import ke Content Studio
5. Edit Visual di Canvas
6. Export → Upload ke Instagram Dakwah
```

### Scenario: Main Quest Multiplayer

```
1. Host (Guru/Ortu) buka Menu "Quest"
2. Create Room → Share Room Code
3. Peserta Join Room menggunakan HP masing-masing
4. Peserta otomatis mendapatkan Avatar Robot (Bottts)
5. Host Start Game → Soal muncul serentak
6. Skor dihitung Real-time → Tim Pemenang dirayakan
```

---

## Development Roadmap

### Phase 2: Creation & Gamification ✅ (Completed)

- [x] **Content Studio** (Blueprint System)
- [x] **Prompt Studio** (Template Library)
- [x] **Quest Multiplayer** (Real-time Latency < 100ms)
- [x] **Team Mode** in Quest
- [x] **Dicebear Avatar Integration**

### Phase 3: Engagement & Polish 🔜 (Q2 2026)

- [ ] **Quest Power-ups** (Shield, 2x Score)
- [ ] **Redemption Question** (Kesempatan menjawab ulang)
- [ ] **Deep Note** (Comprehensive analysis)
- [ ] **Mobile App** (PWA Polish / React Native)

---

## Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# YouTube Transcript API
VITE_YOUTUBE_API_URL=...

# OpenRouter (AI)
VITE_OPENROUTER_API_KEY=...

# Lynk.id Payment
VITE_LYNK_MERCHANT_KEY=...
```
