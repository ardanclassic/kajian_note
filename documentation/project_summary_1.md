# Kajian Note - Project Summary (Part 1)

## Architecture & Specifications

**Version:** 3.3 - MVP Focus + YouTube Integration  
**Date:** November 13, 2025  
**Features:** Auth System, User Management, Subscription System, Notes Management, Settings, **YouTube Import**

---

## 📖 Project Overview

**Kajian Note** - Aplikasi catatan kajian dengan sistem auth yang user-friendly untuk orang tua yang tidak familiar dengan email, dilengkapi sistem subscription untuk monetisasi, dan **fitur import otomatis dari YouTube**.

### MVP Features

1. **Authentication System** - Username + PIN (6 digit)
2. **User Role Management** - Admin, Panitia, Ustadz, Member
3. **Subscription System** - Free, Premium, Advance tiers dengan Lynk.id payment gateway (webhook-based)
4. **Notes Management** - Create, read, update, delete notes (dengan subscription limits)
5. **YouTube Import** - 🆕 Import transcript dari video YouTube (dengan/tanpa AI summary)
6. **Settings** - User preferences & app configuration

### Target Users & Challenges

- **Target**: Member masjid/kajian (termasuk orang tua yang tidak paham email)
- **Challenge**: Beberapa user share 1 nomor HP, tidak punya email
- **Solution**: Username + PIN auth, phone number optional & non-unique
- **Monetization**: Subscription tiers dengan payment gateway Lynk.id (webhook-based, **email required**)
- **Value Add**: 🆕 Import catatan dari kajian YouTube secara otomatis

---

## �  Tech Stack

### Frontend:

- React 19.1.1 + Vite 7.1.7 + TypeScript 5.9.3
- Tailwind CSS 4.1.16 + shadcn/ui
- Zustand 5.0.8 (State)
- React Hook Form 7.66.0 + Zod 4.1.12
- Axios 1.13.1 (HTTP Client)

### Backend:

- Supabase 2.78.0 (Auth + PostgreSQL + Edge Functions)
- Lynk.id (Payment webhook-based, no API)
- **YouTube Transcript API** 🆕 (FastAPI + Docker)

### External APIs:

- **YouTube Transcript API** - Fetch video transcripts
- **OpenRouter API** - AI summarization (Optional)

---

## 📁 Project Structure

```
kajian_note/
├── 📁 documentation/
│   ├── 📄 design_system.md
│   ├── 📄 project_summary_1.md
│   └── 📄 project_summary_2.md
│
├── 📁 public/
│
├── 📁 src/
│   │
│   ├── 📁 assets/
│   │   ├── 📁 icons/
│   │   │   └── 📄 react.svg
│   │   └── 📁 images/
│   │
│   ├── 📁 components/
│   │   │
│   │   ├── 📁 common/
│   │   │   ├── 📄 Loading.tsx
│   │   │   └── 📄 PageHeader.tsx
│   │   │
│   │   ├── 📁 features/
│   │   │   │
│   │   │   ├── 📁 auth/
│   │   │   │   ├── 📄 LoginForm.tsx
│   │   │   │   └── 📄 RegisterForm.tsx
│   │   │   │
│   │   │   ├── 📁 dashboard/
│   │   │   │   └── 📄 DashboardCard.tsx
│   │   │   │
│   │   │   ├── 📁 notes/
│   │   │   │   ├── 📄 NoteCard.tsx
│   │   │   │   ├── 📄 NoteDetailCard.tsx
│   │   │   │   ├── 📄 NoteForm.tsx
│   │   │   │   ├── 📄 NoteList.tsx
│   │   │   │   ├── 📄 NoteSearch.tsx
│   │   │   │   ├── 📄 NoteViewer.tsx
│   │   │   │   ├── 📄 SubscriptionLimitBanner.tsx
│   │   │   │   ├── 📄 YouTubeImportButton.tsx       # 🆕 NEW
│   │   │   │   └── 📄 YouTubeImportModal.tsx        # 🆕 NEW
│   │   │   │
│   │   │   ├── 📁 profile/
│   │   │   │   ├── 📄 ChangePINForm.tsx
│   │   │   │   └── 📄 EditProfileForm.tsx
│   │   │   │
│   │   │   ├── 📁 settings/
│   │   │   │   ├── 📄 AppSettings.tsx
│   │   │   │   └── 📄 UserSettings.tsx
│   │   │   │
│   │   │   └── 📁 subscription/
│   │   │       ├── 📄 PaymentButton.tsx
│   │   │       ├── 📄 PricingTable.tsx
│   │   │       ├── 📄 SubscriptionCard.tsx
│   │   │       └── 📄 UpgradeModal.tsx
│   │   │
│   │   └── 📁 ui/
│   │       ├── 📄 alert.tsx
│   │       ├── 📄 badge.tsx
│   │       ├── 📄 button.tsx
│   │       ├── 📄 card.tsx
│   │       ├── 📄 dialog.tsx
│   │       ├── 📄 form.tsx
│   │       ├── 📄 input.tsx
│   │       ├── 📄 label.tsx
│   │       └── 📄 table.tsx
│   │
│   ├── 📁 config/
│   │   ├── 📄 env.ts
│   │   ├── 📄 payment.ts
│   │   ├── 📄 permissions.ts
│   │   ├── 📄 theme.ts
│   │   └── 📄 youtube.ts                            # 🆕 NEW
│   │
│   ├── 📁 lib/
│   │   ├── 📄 axios.ts
│   │   ├── 📄 constants.ts
│   │   ├── 📄 supabase.ts
│   │   └── 📄 utils.ts
│   │
│   ├── 📁 pages/
│   │   │
│   │   ├── 📁 admin/
│   │   │   └── 📄 UserManagement.tsx
│   │   │
│   │   ├── 📁 notes/
│   │   │   ├── 📄 CreateNote.tsx                    # 🔄 UPDATED
│   │   │   ├── 📄 EditNote.tsx
│   │   │   ├── 📄 index.tsx
│   │   │   └── 📄 ViewNote.tsx
│   │   │
│   │   ├── 📄 Dashboard.tsx
│   │   ├── 📄 Home.tsx
│   │   ├── 📄 Login.tsx
│   │   ├── 📄 NoteDetail.tsx
│   │   ├── 📄 NotFound.tsx
│   │   ├── 📄 Profile.tsx
│   │   ├── 📄 Register.tsx
│   │   ├── 📄 Settings.tsx
│   │   └── 📄 Subscription.tsx
│   │
│   ├── 📁 routes/
│   │   ├── 📄 index.tsx
│   │   ├── 📄 ProtectedRoute.tsx
│   │   ├── 📄 RoleBasedRoute.tsx
│   │   └── 📄 route.config.ts
│   │
│   ├── 📁 schemas/
│   │   ├── 📄 auth.schema.ts
│   │   ├── 📄 notes.schema.ts
│   │   ├── 📄 subscription.schema.ts
│   │   └── 📄 user.schema.ts
│   │
│   ├── 📁 services/
│   │   ├── 📁 supabase/
│   │   │   ├── 📄 auth.service.ts
│   │   │   ├── 📄 database.service.ts
│   │   │   ├── 📄 notes.service.ts
│   │   │   ├── 📄 subscription.service.ts
│   │   │   └── 📄 user.service.ts
│   │   └── 📁 youtube/                              # 🆕 NEW
│   │       └── 📄 transcript.service.ts             # 🆕 NEW
│   │
│   ├── 📁 store/
│   │   ├── 📄 authStore.ts
│   │   ├── 📄 notesStore.ts
│   │   ├── 📄 subscriptionStore.ts
│   │   └── 📄 userStore.ts
│   │
│   ├── 📁 styles/
│   │   └── 📄 globals.css
│   │
│   ├── 📁 types/
│   │   ├── 📄 auth.types.ts
│   │   ├── 📄 index.ts
│   │   ├── 📄 notes.types.ts                        # 🔄 UPDATED
│   │   ├── 📄 payment.types.ts
│   │   ├── 📄 subscription.types.ts
│   │   ├── 📄 supabase.types.ts
│   │   ├── 📄 user.types.ts
│   │   └── 📄 youtube.types.ts                      # 🆕 NEW
│   │
│   ├── 📁 utils/
│   │   ├── 📄 paymentMatching.ts
│   │   ├── 📄 subscriptionLimits.ts
│   │   └── 📄 youtubeHelpers.ts                     # 🆕 NEW
│   │
│   ├── 📄 App.tsx
│   └── 📄 main.tsx
│
├── 📁 supabase/
│   └── 📁 functions/
│       └── 📁 lynk-webhook/
│           └── 📄 index.ts
│
├── 📁 migrations/                                    # 🆕 NEW
│   └── 📄 add_youtube_source_fields.sql             # 🆕 NEW
│
├── 📄 .env
├── 📄 .env.example
├── 📄 .gitignore
├── 📄 components.json
├── 📄 eslint.config.js
├── 📄 index.html
├── 📄 package-lock.json
├── 📄 package.json
├── 📄 README.md
├── 📄 tsconfig.app.json
├── 📄 tsconfig.json
├── 📄 tsconfig.node.json
└── 📄 vite.config.ts
```

---

## 🎬 YouTube Import Feature (NEW)

### Overview

Users can import video kajian dari YouTube sebagai catatan dengan dua mode:
1. **Plain Transcript** - Full transcript dengan timestamps
2. **AI Summary** - Ringkasan otomatis menggunakan AI (OpenRouter)

### Architecture

```
Frontend (React)
    ↓
YouTube Transcript API (FastAPI + Docker)
    ↓
[Optional] OpenRouter API (AI Summarization)
    ↓
Supabase (Save note with metadata)
```

### Flow Diagram

```
User clicks "Import YouTube"
    ↓
Modal opens → Input URL
    ↓
Choose: Plain Transcript OR AI Summary
    ↓
API call → Fetch transcript/summary
    ↓
Auto-fill NoteForm (title, content, tags)
    ↓
User review & edit (optional)
    ↓
Save note with metadata
```

### API Endpoints Used

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `/url-to-id` | Convert URL to video ID | video_id |
| `/transcript` | Get detailed transcript | segments array |
| `/transcript/text` | Get plain text | text with timestamps |
| `/transcript/summarize` | Get AI summary | summary text |

### Database Schema Changes

**Table: `notes`**

New columns added:

| Column | Type | Description |
|--------|------|-------------|
| `source_type` | VARCHAR(20) | 'manual' or 'youtube' |
| `source_url` | TEXT | YouTube video URL |
| `source_metadata` | JSONB | Video info & AI metadata |

**source_metadata structure:**
```json
{
  "video_id": "VIDEO_ID",
  "video_url": "https://youtube.com/watch?v=...",
  "language_used": "id",
  "total_segments": 1551,
  "has_ai_summary": true,
  "model_used": "qwen/qwen3-8b",
  "imported_at": "2025-11-13T10:30:00Z"
}
```

### Environment Variables

```bash
# YouTube Transcript API
VITE_YOUTUBE_API_URL=http://localhost:8001

# OpenRouter (Optional - for AI summary)
VITE_OPENROUTER_API_KEY=sk-or-v1-...
VITE_OPENROUTER_DEFAULT_MODEL=qwen/qwen3-8b
```

### Key Components

**1. YouTubeImportButton**
- Trigger button untuk buka modal
- Auto-hide jika API tidak configured

**2. YouTubeImportModal**
- Input YouTube URL
- Toggle AI summary
- Real-time validation
- Error handling

**3. CreateNote (Updated)**
- Integrated dengan YouTube import
- Auto-fill form dari import result
- Auto-generate tags dari content
- Display source info banner

### Features

✅ **URL Validation** - Support multiple YouTube URL formats  
✅ **Language Detection** - Auto-detect Indonesian/English  
✅ **AI Summarization** - Optional AI-powered summary  
✅ **Auto-tagging** - Generate suggested tags from content  
✅ **Metadata Tracking** - Full source tracking for transparency  
✅ **Error Handling** - Graceful fallback & user-friendly messages  

---

## 🗄 Database Schema (Updated)

### users

- **Primary Key**: id (UUID)
- **Unique Fields**: email, username
- **Auth Fields**: email, username, full_name
- **Contact**: phone (optional, non-unique)
- **Role**: role (admin/panitia/ustadz/member), default: member
- **Subscription**: tier, status, start_date, end_date
- **Payment**: payment_email (for webhook matching)
- **Indexes**: payment_email

### subscriptions

- **Primary Key**: id (UUID)
- **Foreign Key**: user_id → users(id)
- **Subscription**: tier, status, start_date, end_date
- **Payment**: payment_id (unique), amount, customer_email, customer_name
- **Tracking**: created_at, updated_at

### payment_webhooks

- **Primary Key**: id (UUID)
- **Webhook Data**: payment_id, event_type, payload (JSONB)
- **Processing**: processed (boolean), customer_email
- **Matching**: matched_user_id → users(id)
- **Timestamp**: received_at
- **Indexes**: customer_email

### notes (Updated) 🔄

- **Primary Key**: id (UUID)
- **Foreign Key**: user_id → users(id)
- **Content**: title, content (text)
- **Settings**: is_public, is_pinned
- **Tags**: tags (text array)
- **Timestamps**: created_at, updated_at
- **Source Tracking**: 🆕
  - `source_type` (VARCHAR) - 'manual' or 'youtube'
  - `source_url` (TEXT) - YouTube video URL if imported
  - `source_metadata` (JSONB) - Video & AI info
- **RLS**: User can only access their own notes (unless public)
- **Indexes**: 🆕 source_type, source_url, source_metadata (GIN)

---

## 💡 Key Design Decisions

### Why Username + PIN?

- Orang tua tidak paham email
- PIN lebih mudah diingat (6 digit)
- 100% gratis (no SMS)

### Why Email Required for Payment?

- Lynk.id webhook only provides `customer_email`
- **Only way** to match payment with user account
- No user_id or metadata in webhook payload

### Why Webhook-Based?

- **Simpler** than API integration
- Lynk.id handles payment UI
- No need for `lynk.service.ts`
- Static links (created once in dashboard)
- Perfect for MVP

### Why YouTube Import? 🆕

- **Target audience**: Kajian di YouTube sangat populer
- **Time saver**: Auto-import transcript vs manual typing
- **AI value**: Summarization adds premium value
- **Transparency**: Full source tracking & attribution
- **Scalability**: Easy to add more video platforms later

### Why Optional AI Summary? 🆕

- **Flexibility**: Users choose based on need
- **Cost control**: AI API calls optional
- **Quality**: Some prefer full transcript, some prefer summary
- **Testing**: Can test both approaches

---

## 📊 Cost Estimation

### Current Setup

- **Supabase**: Free tier (50K MAU)
- **Lynk.id**: 2.9% + Rp 1K per transaction
- **YouTube API**: Self-hosted (Docker) - FREE
- **OpenRouter**: Pay-per-use (optional)
  - Qwen 3 8B: ~$0.06 per 1M tokens
  - Average summary: ~2000 tokens = $0.00012 per video

### Revenue Model

- Target: 100 premium users = Rp 4.755.000/bln
- AI cost: ~Rp 200 per summary (if used)
- Net profit margin: >95%

---

## 🔐 Security Considerations

### YouTube Import

- ✅ URL validation before API call
- ✅ Rate limiting on import endpoint
- ✅ Source attribution (prevent plagiarism)
- ✅ User owns imported notes
- ✅ API key hidden in backend (OpenRouter)

### General

- ✅ RLS enabled for all tables
- ✅ Webhook signature verification (HMAC SHA256)
- ✅ Audit trail for critical changes
- ✅ PIN minimal 6 digit

---

## 🎨 UX Considerations

### For Elderly Users

- ✅ Large fonts (min 16px)
- ✅ High contrast colors
- ✅ Simple forms
- ✅ Clear subscription benefits
- ✅ Easy payment (QRIS scan)

### YouTube Import UX

- ✅ **One-click import** - Minimal steps
- ✅ **Preview before save** - Review imported content
- ✅ **Clear source indicator** - Show YouTube badge
- ✅ **Edit anytime** - Imported notes fully editable
- ✅ **Error recovery** - Helpful error messages

---

## 📝 Important Notes

**Testing Mode:**
- All YouTube features available in FREE tier
- Subscription logic ignored for testing
- AI summary available to all users
- Production: Move AI to Premium/Advance

**Deployment Requirements:**
- YouTube API must be running (Docker)
- OpenRouter API key optional (for AI)
- Database migration must be executed
- CORS configuration if needed

**Scalability:**
- Database indexed properly
- Ready for 1000+ users
- YouTube API stateless (easy to scale)
- Consider caching for popular videos

---

**Version: 3.3 | MVP + YouTube Integration | Nov 13, 2025**

_Next: Continue to Part 2 for implementation guide, webhook setup, and deployment._
