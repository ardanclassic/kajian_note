# Alwaah - Project Documentation (Part 1)

> **Version:** 2.0.0  
> **Last Updated:** December 24, 2024  
> **Status:** MVP Production  
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
9. [Deep Note Feature](#deep-note-feature)
10. [Memory Cards Feature](#memory-cards-feature)
11. [Knowledge Quiz Feature](#knowledge-quiz-feature)
12. [Content Studio Feature](#content-studio-feature)
13. [External Integrations](#external-integrations)
14. [User Journey](#user-journey)
15. [Development Roadmap](#development-roadmap)

---

## Overview

**Alwaah** adalah platform AI-powered untuk mengolah konten kajian video YouTube menjadi berbagai format pembelajaran yang efektif.

### Key Features

- ✅ Simple Auth: Username + PIN (6 digit)
- ✅ YouTube Import: Auto-fetch transcript & AI summarization
- ✅ Export & Share: PDF, Telegram, WhatsApp
- ✅ Freemium Model: Free tier dengan Premium upgrade
- ✅ Cloud-Based: Supabase backend + ImageKit storage

### Target Users

- Jamaah masjid (terutama orang tua/awam)
- Mahasiswa & pelajar
- Content creator & da'i
- Pengelola kajian

---

## Product Vision

### Problem

1. Video kajian panjang sulit di-review
2. Note-taking manual tidak efektif
3. Poin penting sulit diingat
4. Ilmu sulit disebarkan dalam format menarik

### Solution

AI transforms video kajian menjadi multiple learning formats:

- **Smart Summary** - Ringkasan terstruktur
- **Deep Note** - Catatan lengkap (coming soon)
- **Memory Cards** - Flashcards muroja'ah (coming soon)
- **Knowledge Quiz** - Interactive test (planned)
- **Content Studio** - Visual social media (planned)

### Value Proposition

**"Transform Islamic Learning Content into Multiple Formats with AI"**

Dari 1 input (video) → Multiple outputs untuk berbagai kebutuhan pembelajaran.

---

## Core Features

| Feature            | Status  | Description                       | Tier Access             |
| ------------------ | ------- | --------------------------------- | ----------------------- |
| **Smart Summary**  | ✅ Live | Ringkasan AI dari video kajian    | Free (10), Premium (75) |
| **Deep Note**      | 🔜 Soon | Catatan komprehensif & lengkap    | Premium only            |
| **Memory Cards**   | 🔜 Soon | Flashcards untuk muroja'ah        | Premium only            |
| **Knowledge Quiz** | 📋 Next | Interactive quiz & test           | Premium only            |
| **Content Studio** | 🎨 Next | Visual content untuk social media | Premium only            |

### Feature Comparison: Smart Summary vs Deep Note

| Aspect     | Smart Summary   | Deep Note            |
| ---------- | --------------- | -------------------- |
| Length     | 500-1000 words  | 2000-5000 words      |
| Detail     | Key points only | Comprehensive        |
| Processing | 10-30s          | 30-90s               |
| Use Case   | Quick reference | Deep study, research |
| Format     | Bullets, brief  | Full paragraphs      |

---

## Tech Stack

### Frontend

| Tech            | Version | Purpose          |
| --------------- | ------- | ---------------- |
| React           | 19.1.1  | UI Framework     |
| TypeScript      | 5.9.3   | Type Safety      |
| Vite            | 7.1.7   | Build Tool       |
| Tailwind CSS    | 4.1.16  | Styling          |
| shadcn/ui       | Latest  | UI Components    |
| Zustand         | 5.0.8   | State Management |
| React Hook Form | 7.66.0  | Forms            |
| Zod             | 4.1.12  | Validation       |
| Axios           | 1.13.1  | HTTP Client      |

### Backend & Services

| Service                | Purpose                              |
| ---------------------- | ------------------------------------ |
| Supabase               | Auth + PostgreSQL + Edge Functions   |
| YouTube Transcript API | Fetch transcripts (FastAPI + Docker) |
| OpenRouter             | AI summarization                     |
| Lynk.id                | Payment gateway (webhook)            |
| ImageKit.io            | Temp file storage (auto-cleanup)     |
| API2PDF                | PDF generation                       |
| Telegram Bot           | Send notes                           |
| Vercel                 | Hosting                              |

---

## System Architecture

```
┌────────────────────────────────────────────┐
│         CLIENT (React - Vercel)            │
│  Auth | Notes | Subscription | Profile     │
└────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────┐
│           SUPABASE BACKEND                 │
│  Auth | PostgreSQL | Edge Functions        │
└────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   YouTube API  OpenRouter  ImageKit
   (Transcript)    (AI)    (Storage)
        │           │           │
        ▼           ▼           ▼
    API2PDF     Lynk.id    Telegram
   (PDF Gen)   (Payment)   Bot API
```

**Data Flow:**

1. User input → Frontend validation
2. API call → Supabase Auth Layer
3. Business logic → External APIs
4. Data persistence → PostgreSQL (with RLS)
5. Output → User

---

## Authentication System

### Design: User-Friendly untuk Orang Tua

**Registration (4 fields only):**

1. Nama Lengkap → "Ahmad Zaki"
2. Username → Auto-generated: `ahmad-zaki` (editable)
3. Nomor HP → Optional (untuk WhatsApp)
4. PIN → 6 digits (replace password)

**Backend Auto-Processing:**

- Generate email: `ahmad-zaki@kajiannote.com`
- Hash PIN via Supabase Auth
- Create user with default: `role=member`, `tier=free`

### Login Flow

```
Username Input → PIN Input → Verify → JWT Token → Session
```

### Security

- PIN hashing: Supabase Auth bcrypt
- JWT tokens with expiry
- Session: Zustand with persistence
- Protected routes: React Router guards
- RLS policies: Database-level

### PIN Change

Profile → Input old PIN → New PIN → Confirm → Verify → Update hash → Force re-login

---

## Subscription System

### Pricing Tiers

| Feature            | Free       | Premium         |
| ------------------ | ---------- | --------------- |
| **Price**          | Rp 0       | Rp 50.000/bulan |
| **Smart Summary**  | 10 notes   | 75 notes        |
| **Deep Note**      | ❌         | ✅ Limited      |
| **Memory Cards**   | ✅ Limited | ✅              |
| **Quiz**           | ✅ Limited | ✅              |
| **Export PDF**     | ❌         | ✅              |
| **Send Telegram**  | ❌         | ✅              |
| **Share WhatsApp** | ❌         | ✅              |

### Payment: Lynk.id (Webhook-based)

**Why Lynk.id?**

- Simple webhook integration (no SDK)
- Local payment methods
- Email-based matching

**Payment Flow:**

```
User clicks Upgrade
    ↓
Check payment_email set?
    ├─ ❌ Alert + redirect to Profile
    └─ ✅ Redirect to Lynk.id
        ↓
    User pays
        ↓
    Lynk.id webhook → Supabase Edge Function
        ↓
    Match via email
        ↓
    Update subscription
        ↓
    User sees upgraded features
```

**Email Matching:**

1. User sets `payment_email` in Profile
2. User checkout with same email
3. Webhook contains `customer_email`
4. Backend matches & upgrades

**Configuration:**

```env
VITE_LYNK_MERCHANT_KEY=q1UUHQZZTcW2sKpEBpJrYLAREye1XUX0
VITE_LYNK_PREMIUM_LINK=http://lynk.id/bitlab/2q632wo7mk03/checkout
```

### Subscription Management

**User Dashboard:**

- Current tier & status
- End date & days remaining
- Usage stats (notes used/limit)
- Feature checklist
- Upgrade button
- Payment history (planned)

---

## Smart Summary Feature

### Complete Workflow

```
YouTube URL Input
    ↓
Extract Video ID
    ↓
Fetch Metadata (title, channel, duration)
    ↓
Fetch Transcript
    ↓
User Choice: AI Summary?
    ├─ NO → Manual edit
    └─ YES → Submit AI task (async)
        ↓
    Waiting Experience (Story/Quiz)
        ↓
    Poll task status (every 3s)
        ↓
    AI processing complete
        ↓
User review & edit
    ↓
Save as note
    ↓
Available actions: View | Edit | Export | Share | Delete
```

### Key Features

**YouTube Import:**

- Auto-extract video ID from various URL formats
- Fetch metadata: title, channel, speaker, duration
- Multi-language transcript (ID/EN)
- Preserve timestamps

**AI Summarization (Async):**

- Submit task → Get task_id
- Poll status every 3 seconds
- Processing time: 10-60 seconds
- Structured output with headings

**Waiting Experience:**

- **Story Mode**: Random Islamic stories
- **Quiz Mode**: Interactive Islamic quiz
- Progress indicator with status
- Can skip to see progress

**Manual Creation:**

- Create without YouTube import
- Rich text editor (TipTap)
- Add tags (max 5 per note)
- Save & edit anytime

### Export & Share (Premium Only)

**Export to PDF:**

```
Note → HTML with styling → API2PDF → PDF → ImageKit (temp 1h) → Public URL
```

**Send to Telegram:**

```
Note → Generate PDF → Upload ImageKit → Send via Bot API → User receives PDF
```

_Requires Telegram verification first_

**Share to WhatsApp:**

```
Note → PDF → ImageKit → Get link → Format message → Open WhatsApp
```

### CRUD Operations

| Action | Free   | Premium |
| ------ | ------ | ------- |
| Create | 10 max | 75 max  |
| Read   | ✅ Own | ✅ Own  |
| Update | ✅ Own | ✅ Own  |
| Delete | ✅ Own | ✅ Own  |
| Export | ❌     | ✅      |
| Share  | ❌     | ✅      |

**Limit Checking:**

- Banner when approaching limit (8/10)
- Disabled create button at limit
- Upgrade modal with CTA

**List Features:**

- Grid/List view toggle
- Search by title/content
- Filter by tags
- Sort: date, title
- Pagination (20/page)

---

## Deep Note Feature

### Status: 🔜 Coming Soon

### Concept

Evolution dari Smart Summary - memberikan catatan komprehensif hampir seperti transkrip penuh dengan struktur yang sangat baik.

### Smart Summary vs Deep Note

| Aspect   | Smart Summary     | Deep Note                    |
| -------- | ----------------- | ---------------------------- |
| Length   | ~500-1000 words   | ~2000-5000 words             |
| Detail   | Key points        | Comprehensive                |
| Time     | 10-30s            | 30-90s                       |
| Use Case | Quick reference   | Deep study, research         |
| Content  | Bullets, brief    | Full paragraphs with context |
| Examples | Mentioned briefly | Detailed with explanation    |

### Workflow

```
YouTube URL → Fetch transcript → User selects "Deep Note"
    ↓
Enhanced waiting experience (multiple stories/quizzes)
    ↓
AI processing (longer duration, detailed prompt)
    ↓
Generate comprehensive output with full structure
    ↓
User review & edit → Save as Deep Note
```

### Output Structure

- **Executive Summary** (2-3 paragraphs)
- **Complete Discussion** (with sections & sub-sections)
- **Dalil & References** (full ayat/hadits with explanation)
- **Examples & Illustrations** (detailed)
- **Lessons & Applications** (practical takeaways)
- **Conclusion** (comprehensive summary)
- **Additional Notes**

### Subscription Access

- Free: ❌ Not available
- Premium: ✅ 10 per month

---

## Memory Cards Feature

### Status: 🔜 Coming Soon

### Concept

Transform existing notes menjadi flashcards digital untuk effective memorization dan muroja'ah.

### Workflow

```
Open note → Click "Generate Memory Cards"
    ↓
AI extracts: key concepts, terms, Q&A, dalil
    ↓
Generate flashcards (auto)
    ↓
User preview & edit (add/delete/reorder)
    ↓
Save as card deck → Study mode available
```

### Card Types

| Type              | Front                 | Back                    |
| ----------------- | --------------------- | ----------------------- |
| **Definition**    | Term/Concept          | Definition/Explanation  |
| **Q&A**           | Question              | Answer with explanation |
| **Dalil**         | Ayat/Hadits text      | Translation + context   |
| **Fill-in-Blank** | Statement with \_\_\_ | Complete statement      |

### Study Modes

1. **Classic Mode**: Flip cards, mark mastered
2. **Shuffle Mode**: Random order for variety
3. **Spaced Repetition**: Algorithm-based scheduling
4. **Quiz Mode**: Hide answer, rate difficulty

### Features

- Create deck from note
- Edit/add/delete cards
- Multiple study modes
- Progress tracking (mastered/in-progress/need-review)
- Study statistics & streaks
- Daily study reminders (planned)

### Mastery Indicators

- 🟢 Mastered (90%+ accuracy)
- 🟡 In Progress (50-89%)
- 🔴 Need Review (<50%)
- ⚪ Not Studied Yet

### Subscription Access

- Free: ❌ Not available
- Premium: ✅ Unlimited cards & decks

---

## Knowledge Quiz Feature

### Status: 📋 Next Feature

### Concept

AI-generated interactive quiz untuk test dan reinforce pemahaman materi kajian.

### Workflow

```
Open note → Click "Generate Quiz"
    ↓
Configure: # of questions, difficulty, types
    ↓
AI generates questions with explanations
    ↓
User takes quiz interactively
    ↓
Submit → Instant feedback → Review wrong answers
    ↓
Save to history → Retake option
```

### Question Types

**1. Multiple Choice** (4 options, 1 correct)
**2. True/False** (binary choice)
**3. Fill in the Blank** (type answer)

### Difficulty Levels

| Level      | Characteristics                                            |
| ---------- | ---------------------------------------------------------- |
| **Easy**   | Direct recall, obvious answers, 4 distinct options         |
| **Medium** | Application, understanding, some similar options           |
| **Hard**   | Complex scenarios, critical thinking, very similar options |

### Features

**Quiz Generation:**

- Customizable: 5-50 questions
- Mix of question types
- Difficulty selection
- Time limit (optional)
- Preview before start

**Quiz Taking:**

- Clean interface
- Progress indicator
- Save progress (pause/resume)
- Instant or end-of-quiz feedback

**Scoring & Feedback:**

- Percentage score
- Time taken
- Detailed explanations
- Identify weak areas
- Suggest related notes

**Gamification:**

- Achievement badges (Perfect Score, Study Streak, etc.)
- Leaderboard (optional)
- Points system
- Study streaks

### Subscription Access

- Free: ❌ Not available
- Premium: ✅ Unlimited quizzes

---

## Content Studio Feature

### Status: 🎨 Next Feature

### COMING SOON . . . .

---

## External Integrations

### Integration Summary

| Service                    | Purpose                              | Key Info                            |
| -------------------------- | ------------------------------------ | ----------------------------------- |
| **Supabase**               | Backend (Auth + DB + Edge Functions) | All-in-one BaaS with RLS            |
| **YouTube Transcript API** | Fetch transcripts & metadata         | FastAPI + Docker, custom deployment |
| **OpenRouter**             | AI summarization                     | Multiple model support              |
| **Lynk.id**                | Payment gateway                      | Webhook-based, email matching       |
| **ImageKit.io**            | Temp file storage                    | Auto-cleanup after 1 hour           |
| **API2PDF**                | PDF generation                       | HTML to PDF conversion              |
| **Telegram Bot**           | Send notes & verification            | Webhook for chat_id capture         |
| **WhatsApp**               | Share notes                          | Pre-filled message link             |
| **Vercel**                 | Frontend hosting                     | Auto-deploy from Git                |

### Supabase Edge Functions

| Function             | Purpose                      | Trigger            |
| -------------------- | ---------------------------- | ------------------ |
| **imagekit-cleanup** | Delete temp files >1h old    | Cron (hourly)      |
| **lynk-webhook**     | Handle payment notifications | Webhook POST       |
| **send-telegram**    | Send PDF to Telegram         | User action        |
| **telegram-webhook** | Verify chat_id               | Bot /start command |

### YouTube Transcript API

**Base URL:** `https://kajian-note-api.derrylab.com`

**Key Endpoints:**

```
POST /url-to-id                    # Extract video ID
POST /video-metadata               # Fetch title, channel, duration
POST /transcript                   # Fetch full transcript (JSON)
POST /transcript/text              # Plain text transcript
POST /transcript/summarize-task    # Submit AI task (async)
GET  /tasks/{task_id}              # Poll task status
```

### ImageKit Storage

**Lifecycle:**

```
Upload PDF → Get URL (expires 1h) → Send via Telegram/WhatsApp
    ↓
After 1 hour → imagekit-cleanup Edge Function → Delete from ImageKit
```

**Database Tracking:** `imagekit_temp_uploads` table

---

## User Journey

### Scenario 1: New User Registration & First Note

```
1. Visit landing page → Click "Mulai Gratis"
2. Register: Name, Username (auto-gen), Phone (optional), PIN
3. Auto-login → Dashboard welcome
4. Click "Buat Catatan Baru"
5. Choose "Import dari YouTube"
6. Paste URL → Fetch transcript
7. Click "Rangkum dengan AI"
8. Waiting experience (Story/Quiz)
9. Review AI summary → Edit if needed
10. Add tags → Save
11. Note saved → View in list
12. Try export → See "Premium only" → Upgrade prompt
```

### Scenario 2: Premium Upgrade

```
1. User at 8/10 notes → See limit warning
2. Click "Upgrade" or visit /subscription
3. Check payment_email set → Not set
4. Alert: "Set payment email first"
5. Redirect to Profile → Set email
6. Return to subscription → Click "Upgrade to Premium"
7. Redirect to Lynk.id → Complete payment
8. Lynk.id webhook → Match email → Update subscription
9. User sees "Premium Active" on dashboard
10. Create more notes (75 limit)
11. Export PDF → Success
12. Send to Telegram → Verify first → Send → Receive
```

### Scenario 3: Daily Usage Flow

```
1. Login with Username + PIN
2. Dashboard → View recent notes
3. Click note → Read content
4. Export to PDF → Download
5. Send to Telegram → Receive immediately
6. Share to WhatsApp → Select contact → Send
7. Create new note → YouTube import → AI summary
8. Edit content → Add tags → Save
9. Search notes by tag/keyword
10. Logout
```

### Scenario 4: Telegram Verification

```
1. Profile page → See "Telegram not verified"
2. Click "Verify Now" → Opens Telegram bot
3. Send /start {user_id} to bot
4. Bot confirms: "✅ Verified!"
5. Profile page updates: "Verified at {date}"
6. Now can send notes to Telegram
```

---

## Development Roadmap

### Phase 1: MVP ✅ (Completed)

**Authentication & Core:**

- [x] Username + PIN auth system
- [x] Auto-generated email
- [x] Role management (member default)

**Notes:**

- [x] CRUD operations with RLS
- [x] YouTube import & transcript
- [x] AI summarization (async)
- [x] Rich text editor (TipTap)
- [x] Tags system (max 5/note)

**Subscription:**

- [x] Free/Premium tiers
- [x] Lynk.id payment integration
- [x] Webhook handler
- [x] Usage limits & tracking

**Export & Share:**

- [x] PDF export via API2PDF
- [x] Send to Telegram (with verification)
- [x] Share to WhatsApp
- [x] Temp file storage with auto-cleanup

**Profile & Settings:**

- [x] Edit profile (name, phone, payment_email)
- [x] Change PIN
- [x] Telegram verification

### Phase 2: Advanced Features 🔜 (Q1 2025)

**New Features:**

- [ ] Deep Note (comprehensive notes)
- [ ] Memory Cards (flashcards + spaced repetition)
- [ ] Knowledge Quiz (interactive testing)
- [ ] Content Studio (visual content generator)

**Enhancements:**

- [ ] Settings page implementation (theme, notifications)
- [ ] Note templates
- [ ] Auto-save drafts
- [ ] Version history
- [ ] Batch YouTube import
- [ ] Playlist support

### Phase 3: Admin & Community 📋 (Q2 2025)

**Admin Panel:**

- [ ] User management dashboard
- [ ] Role-based permissions (Admin, Ustadz, Panitia)
- [ ] Pin/feature notes
- [ ] Content moderation
- [ ] Analytics dashboard

**Community Features:**

- [ ] Public notes feed (optional)
- [ ] Comments on notes
- [ ] Like & bookmark
- [ ] Share to community
- [ ] Kajian schedule management

### Phase 4: Enterprise 🎯 (Q3-Q4 2025)

**Advanced Features:**

- [ ] Multi-language support
- [ ] API for third-party integrations
- [ ] White-label solution
- [ ] Mobile app (React Native)
- [ ] Offline mode
- [ ] Advanced analytics
- [ ] Custom branding for organizations

---

## Environment Variables

### Required Variables

```env
# Supabase
VITE_SUPABASE_URL=https://rewtyutkcixrmporoomn.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# YouTube Transcript API
VITE_YOUTUBE_API_URL=https://kajian-note-api.derrylab.com
VITE_API_HEADER_KEY=Bearer your_api_key

# OpenRouter (AI)
VITE_OPENROUTER_API_KEY=your_key
VITE_OPENROUTER_DEFAULT_MODEL=qwen/qwen3-8b

# Lynk.id Payment
VITE_LYNK_MERCHANT_KEY=your_merchant_key
VITE_LYNK_PREMIUM_LINK=your_premium_checkout_link
VITE_WEBHOOK_URL=your_webhook_url

# Telegram Bot
VITE_TELEGRAM_BOT_TOKEN=your_bot_token

# API2PDF
VITE_API2PDF_API_KEY=your_api_key

# ImageKit
VITE_IMAGEKIT_PUBLIC_KEY=your_public_key
VITE_IMAGEKIT_PRIVATE_KEY=your_private_key
VITE_IMAGEKIT_URL_ENDPOINT=your_endpoint

# App Config
VITE_APP_NAME=Alwaah
VITE_APP_URL=https://kajian-note.vercel.app
VITE_ENV=production
```

---
