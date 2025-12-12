# Kajian Note - Project Documentation

> **Version:** 1.0.0  
> **Last Updated:** December 9, 2024  
> **Status:** Active Development (MVP Stage)  
> **Production URL:** https://kajian-note.vercel.app/

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Core Features](#core-features)
5. [Authentication System](#authentication-system)
6. [Notes Management](#notes-management)
7. [AI Integration](#ai-integration)
8. [Export & Sharing](#export--sharing)
9. [Subscription System](#subscription-system)
10. [User Roles](#user-roles)
11. [External Integrations](#external-integrations)
12. [Supabase Edge Functions](#supabase-edge-functions)
13. [Database Schema](#database-schema)
14. [API Endpoints](#api-endpoints)
15. [Development Roadmap](#development-roadmap)

---

## Overview

**Kajian Note** adalah aplikasi catatan kajian berbasis web yang dirancang khusus untuk memudahkan jamaah masjid/kajian dalam mencatat dan mengelola ilmu dari kajian-kajian yang diikuti.

### Key Highlights
- ✅ **User-Friendly Auth** - Tanpa email, cukup Username + PIN 6 digit
- ✅ **AI-Powered** - Import & summarize dari YouTube transcript
- ✅ **Export & Share** - PDF export via API2PDF, Telegram bot, WhatsApp link
- ✅ **Subscription Tiers** - Free, Premium, Advance
- ✅ **Cloud Storage** - Supabase (BE + DB) + ImageKit (temporary files)
- ✅ **Auto Cleanup** - ImageKit files auto-deleted after 1 hour

### Target Users
- Jamaah masjid (terutama orang tua/awam yang tidak familiar dengan teknologi)
- Panitia kajian
- Ustadz/pengisi kajian
- Admin komunitas

### Production Info
- **URL:** https://kajian-note.vercel.app/
- **Hosting:** Vercel
- **Backend:** Supabase
- **Database:** PostgreSQL (Supabase)

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.1 | UI Framework |
| TypeScript | 5.9.3 | Type Safety |
| Vite | 7.1.7 | Build Tool |
| Tailwind CSS | 4.1.16 | Styling |
| shadcn/ui | Latest | UI Components |
| Zustand | 5.0.8 | State Management |
| React Hook Form | 7.66.0 | Form Handling |
| Zod | 4.1.12 | Schema Validation |
| Axios | 1.13.1 | HTTP Client |

### Backend
| Service | Purpose |
|---------|---------|
| Supabase | Backend as a Service (Auth + PostgreSQL + Edge Functions) |
| YouTube Transcript API | Fetch video transcripts (FastAPI + Docker) |
| OpenRouter API | AI Summarization (Optional) |

### External Services
| Service | Purpose |
|---------|---------|
| Lynk.id | Payment Gateway (webhook-based) |
| ImageKit.io | Temporary file storage (1 hour lifetime) |
| API2PDF | PDF Generation |
| Telegram Bot API | Send notes via Telegram |
| WhatsApp API | Share notes via WhatsApp link |
| Vercel | Hosting & Deployment |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              CLIENT (React App - Vercel)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │   Auth   │  │  Notes   │  │   Sub    │  │ Profile  │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE (Backend)                         │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐     │
│  │   Auth   │  │   PgSQL  │  │   Edge Functions       │     │
│  │ Service  │  │ Database │  │ ─ imagekit-cleanup     │     │
│  │          │  │          │  │ ─ lynk-webhook         │     │
│  │          │  │          │  │ ─ send-telegram        │     │
│  │          │  │          │  │ ─ telegram-webhook     │     │
│  └──────────┘  └──────────┘  └────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                                 │
             ┌───────────────────┼───────────────────┐
             ▼                   ▼                   ▼
     ┌──────────────┐   ┌──────────────┐     ┌──────────────┐
     │  YouTube API │   │  OpenRouter  │     │  ImageKit.io │
     │ (Transcript) │   │ (AI Summary) │     │ (Temp Files) │
     └──────────────┘   └──────────────┘     └──────────────┘
             │                   │                   │
             ▼                   ▼                   ▼
     ┌──────────────┐    ┌──────────────┐     ┌──────────────┐
     │   API2PDF    │    │   Lynk.id    │     │   Telegram   │
     │ (PDF Gen)    │    │  (Payment)   │     │   Bot API    │
     └──────────────┘    └──────────────┘     └──────────────┘
```

---

## Core Features

### 1. Authentication System ✅
**Mekanisme User-Friendly untuk Orang Tua/Awam**

#### Registration Flow
User hanya perlu mengisi:
- **Nama Lengkap** (contoh: Ahmad Zaki)
- **Username** (auto-generated dari nama, contoh: ahmad-zaki)
- **Nomor HP** (opsional, untuk WhatsApp)
- **PIN** (6 digit)

#### Backend Auto-Generation
Saat user register, Supabase akan otomatis:
1. Generate email: `<username>@kajiannote.com`
2. Hash PIN menggunakan Supabase Auth
3. Insert data ke table `users`:
   - `full_name`
   - `username` (untuk Telegram)
   - `phone` (untuk WhatsApp)
   - `email` (auto-generated)
   - `role` (default: member)
   - `subscription_tier` (default: free)

#### Login Flow
- Input: Username + PIN
- Backend verify via Supabase Auth
- Return: JWT token + user data

#### Security Features
- ✅ PIN hashing via Supabase Auth
- ✅ JWT token dengan expiry
- ✅ Session management via Zustand
- ✅ Protected routes
- ✅ Role-based access control

---

## Notes Management

### CRUD Operations

#### 1. **Create Note** ✅
**Manual Creation:**
- Title (required)
- Content (rich text editor)
- Tags (max 5 per note)

**AI-Powered Creation:**
- Input YouTube URL
- System fetch transcript via YouTube Transcript API
- Optional: Summarize via OpenRouter AI
- User dapat edit hasil summary
- Save as note

#### 2. **Read/List Notes** ✅
**List View:**
- Grid/List layout
- Filter by tags
- Search by title/content
- Sort by: date created, updated, pinned
- Pagination

**Detail View:**
- Full content display
- Rich text rendering
- Metadata: author, date, tags
- Action buttons: Edit, Delete, Export, Share

#### 3. **Update Note** ✅
- Edit title, content, tags
- Pin/Unpin note (admin feature)
- Auto-save draft (future feature)

#### 4. **Delete Note** ✅
- Soft delete (moved to trash)
- Permanent delete after 30 days (future feature)
- Bulk delete (future feature)

### Subscription Limits
| Tier | Max Notes |
|------|-----------|
| Free | 10 |
| Premium | 100 |
| Advance | Unlimited |

---

## AI Integration

### YouTube Transcript Import

#### Architecture
```
User Input (YouTube URL)
         │
         ▼
Extract Video ID
         │
         ▼
Fetch Video Metadata (Title, Channel, Speaker)
         │
         ▼
Call YouTube Transcript API (FastAPI + Docker)
         │
         ▼
Fetch Transcript (Text + Timestamps)
         │
         ▼
Optional: Send to OpenRouter AI for Summarization
         │
         ▼
Return Formatted Note Content
         │
         ▼
User Reviews & Edits
         │
         ▼
Save as Note
```

#### Features
- ✅ Automatic video ID extraction
- ✅ Auto-fetch video metadata (title, channel, speaker)
- ✅ Multi-language transcript support (ID, EN)
- ✅ Timestamp preservation
- ✅ AI summarization (async with polling)
- ✅ Editable output
- ✅ Progress tracking during summarization
- ⏳ Batch import (future)
- ⏳ Playlist support (future)

#### API Endpoints
**YouTube Transcript API:** https://kajian-note-api.derrylab.com

```
POST /url-to-id              # Extract video ID
POST /video-metadata         # Fetch metadata (NEW)
POST /transcript             # Fetch transcript (JSON)
POST /transcript/text        # Fetch transcript (plain text)
POST /transcript/summarize-task  # Submit AI summary task (async)
GET  /tasks/{task_id}        # Poll task status
```

---

## Export & Sharing

### 1. PDF Export (Premium/Advance) ✅
**Flow:**
```
Note Content
     │
     ▼
Send to API2PDF
     │
     ▼
Generate PDF
     │
     ▼
Upload to ImageKit.io (temporary)
     │
     ▼
Get public URL (expires in 1 hour)
     │
     ▼
Return URL for download/sharing
     │
     ▼
Cronjob: Delete file after 1 hour
```

**Features:**
- Clean, printable layout
- Include metadata (title, author, date, tags)
- Include YouTube reference if from import
- Automatic filename: `{note-title}-{date}.pdf`

**API2PDF Config:**
```env
VITE_API2PDF_API_KEY=3a9086b0-1bc4-4c08-a955-0c1ab3374608
```

### 2. Send to Telegram (Premium/Advance) ✅
**Flow:**
```
Note Content
     │
     ▼
Generate PDF via API2PDF
     │
     ▼
Upload to ImageKit.io (temporary)
     │
     ▼
Get public URL (expires in 1 hour)
     │
     ▼
Send via Telegram Bot API to verified chat_id
     │
     ▼
User receives PDF in Telegram
     │
     ▼
Cronjob: Delete file after 1 hour
```

**Features:**
- Automatic chat_id detection from database
- File size optimization
- Error handling & retry
- Delivery confirmation
- User must verify Telegram first via bot

**Telegram Bot:**
```env
VITE_TELEGRAM_BOT_TOKEN=8450659075:AAHWO31BNR4Ny1yrpUA5RB-v9LUR_6sjlH0
```

**Edge Function:** `send-telegram`

### 3. Share to WhatsApp (Premium/Advance) ✅
**Flow:**
```
Note Content
     │
     ▼
Generate PDF via API2PDF
     │
     ▼
Upload to ImageKit.io
     │
     ▼
Get shareable link
     │
     ▼
Open WhatsApp with pre-filled message
     │
     ▼
User selects contact & sends
```

**Format:**
```
Catatan Kajian: {title}

Download PDF:
{imagekit_url}

Via Kajian Note App
```

---

## Subscription System

### Payment Gateway: Lynk.id (Webhook-based)

#### Subscription Tiers

| Feature | Free | Premium | Advance |
|---------|------|---------|---------|
| **Price** | Rp 0 | Rp 50.000/bulan | Rp 100.000/bulan |
| **Max Notes** | 10 | 100 | Unlimited |
| **Export PDF** | ❌ | ✅ | ✅ |
| **Send to Telegram** | ❌ | ✅ | ✅ |
| **Send to WhatsApp** | ❌ | ✅ | ✅ |
| **AI Summary** | ❌ | ✅ | ✅ |

#### Payment Configuration

```env
VITE_LYNK_MERCHANT_KEY=q1UUHQZZTcW2sKpEBpJrYLAREye1XUX0
VITE_LYNK_PREMIUM_LINK=http://lynk.id/bitlab/2q632wo7mk03/checkout
VITE_LYNK_ADVANCE_LINK=http://lynk.id/bitlab/3eq319m81nev/checkout
VITE_WEBHOOK_URL=https://rewtyutkcixrmporoomn.supabase.co/functions/v1/lynk-webhook
```

#### Payment Flow
```
User clicks "Upgrade" on /subscription page
         │
         ▼
Select subscription tier (Premium/Advance)
         │
         ▼
Redirect to Lynk.id payment page
         │
         ▼
User completes payment
         │
         ▼
Lynk.id sends webhook to Supabase Edge Function
         │
         ▼
Edge Function: lynk-webhook
         │
         ▼
Verify payment signature
         │
         ▼
Match payment with user (via payment_email)
         │
         ▼
Update user subscription in database
         │
         ▼
Create record in subscriptions table
         │
         ▼
User access upgraded features
```

#### Edge Function: `lynk-webhook`
**Purpose:** Handle payment notifications from Lynk.id

**Workflow:**
1. Receive webhook POST from Lynk.id
2. Verify signature/authenticity
3. Extract payment data
4. Match with user via `payment_email`
5. Update `users` table:
   - `subscription_tier`
   - `subscription_status`
   - `subscription_end_date`
6. Create record in `subscriptions` table
7. Create record in `payment_webhooks` table for audit

**Matching Logic:**
- User must set `payment_email` in profile settings
- Webhook contains `customer_email` from Lynk.id
- Match `customer_email` with `payment_email` in database

---

## User Roles

### Current Implementation: Member ✅

| Role | Description | Status |
|------|-------------|--------|
| **Member** | Regular user dengan subscription tiers | ✅ Implemented |
| **Admin** | Full access, user management, content moderation | ⏳ Planned |
| **Ustadz** | Can create featured/highlighted notes, access analytics | ⏳ Planned |
| **Panitia** | Event organizer, can manage kajian schedules | ⏳ Planned |

### Permissions Matrix (Planned)

| Feature | Member | Panitia | Ustadz | Admin |
|---------|--------|---------|--------|-------|
| Create Notes | ✅ | ✅ | ✅ | ✅ |
| Edit Own Notes | ✅ | ✅ | ✅ | ✅ |
| Delete Own Notes | ✅ | ✅ | ✅ | ✅ |
| Pin Notes | ❌ | ❌ | ✅ | ✅ |
| Feature Notes | ❌ | ❌ | ✅ | ✅ |
| View All Users | ❌ | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ |
| Manage Kajian Schedule | ❌ | ✅ | ✅ | ✅ |
| View Analytics | ❌ | ✅ | ✅ | ✅ |

---

## External Integrations

### 1. Supabase
**Purpose:** Backend as a Service

**Configuration:**
```env
VITE_SUPABASE_URL=https://rewtyutkcixrmporoomn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Services Used:**
- **Authentication:** User auth dengan custom PIN system
- **PostgreSQL:** Main database
- **Edge Functions:** 
  - `imagekit-cleanup` - Auto-delete temp files
  - `lynk-webhook` - Payment webhook handler
  - `send-telegram` - Send PDF to Telegram
  - `telegram-webhook` - Verify Telegram username

### 2. ImageKit.io
**Purpose:** Temporary file storage untuk PDF yang dikirim via Telegram/WhatsApp

**Configuration:**
```env
VITE_IMAGEKIT_PUBLIC_KEY=public_NMlNnC0IL2hHUTS7FNjRbyimApU=
VITE_IMAGEKIT_PRIVATE_KEY=private_vCXAfYGvN3f2sw8DJLQiH5/pJe0=
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/worksmeai
```

**Lifecycle:**
```
Upload PDF → Get URL (expires 1 hour) → Send to Telegram/WhatsApp → (1 hour) → Auto Delete
```

**Edge Function:** `imagekit-cleanup`
- Runs every hour
- Query files older than 1 hour from `imagekit_temp_uploads` table
- Delete from ImageKit
- Update `deleted_at` in database

### 3. YouTube Transcript API
**Purpose:** Fetch video transcripts & metadata

**Configuration:**
```env
VITE_YOUTUBE_API_URL=https://kajian-note-api.derrylab.com
VITE_API_HEADER_KEY=Bearer kullubid'atindholaalah
```

**Repository:** Separate Git repository (FastAPI + Docker)

**Endpoints:**
```
POST /url-to-id              # Extract video ID
POST /video-metadata         # Fetch metadata (title, channel, speaker)
POST /transcript             # Fetch transcript (JSON)
POST /transcript/text        # Fetch text
POST /transcript/summarize-task  # Submit AI task (async)
GET  /tasks/{task_id}        # Poll task status
```

### 4. OpenRouter API
**Purpose:** AI Summarization

**Configuration:**
```env
VITE_OPENROUTER_API_KEY=your_key_here
VITE_OPENROUTER_DEFAULT_MODEL=qwen/qwen3-8b
```

**Usage:**
- Summarize YouTube transcript
- Extract key points
- Generate structured notes

### 5. API2PDF
**Purpose:** PDF Generation

**Configuration:**
```env
VITE_API2PDF_API_KEY=3a9086b0-1bc4-4c08-a955-0c1ab3374608
```

**Flow:**
1. Send HTML content to API2PDF
2. Receive PDF file URL
3. Upload to ImageKit
4. Return public URL

### 6. Lynk.id Payment Gateway
**Purpose:** Subscription payment processing

**Configuration:**
```env
VITE_LYNK_MERCHANT_KEY=q1UUHQZZTcW2sKpEBpJrYLAREye1XUX0
VITE_LYNK_PREMIUM_LINK=http://lynk.id/bitlab/2q632wo7mk03/checkout
VITE_LYNK_ADVANCE_LINK=http://lynk.id/bitlab/3eq319m81nev/checkout
```

**Integration Type:** Webhook-based

**Flow:**
1. User redirected to Lynk.id payment page
2. Payment completed
3. Webhook sent to `lynk-webhook` Edge Function
4. Subscription updated

### 7. Telegram Bot API
**Purpose:** Send notes & verify username

**Configuration:**
```env
VITE_TELEGRAM_BOT_TOKEN=8450659075:AAHWO31BNR4Ny1yrpUA5RB-v9LUR_6sjlH0
```

**Edge Functions:**
- `send-telegram` - Send PDF document
- `telegram-webhook` - Verify user's Telegram username

**Verification Flow:**
1. User starts bot in Telegram
2. Bot receives `/start` command with user_id
3. Webhook updates `telegram_chat_id` in database
4. User can now receive notes

### 8. WhatsApp API
**Purpose:** Share notes via WhatsApp

**Implementation:**
- Generate PDF via API2PDF
- Upload to ImageKit
- Create shareable link
- Format: `https://wa.me/?text={encoded_message_with_link}`

---

## Supabase Edge Functions

### 1. `imagekit-cleanup` ✅
**Purpose:** Auto-delete temporary files from ImageKit after 1 hour

**Schedule:** Runs every hour (cron job)

**Workflow:**
```typescript
1. Query imagekit_temp_uploads table
   WHERE expires_at < NOW() AND deleted_at IS NULL

2. For each file:
   - Delete from ImageKit using API
   - Update deleted_at in database

3. Log results
```

**Database Table:** `imagekit_temp_uploads`
```sql
- file_id (imagekit file ID)
- file_url (public URL)
- expires_at (timestamp, 1 hour after upload)
- deleted_at (timestamp, when deleted)
- user_id (owner)
- note_id (related note)
```

### 2. `lynk-webhook` ✅
**Purpose:** Handle payment notifications from Lynk.id

**Trigger:** Webhook POST from Lynk.id

**Workflow:**
```typescript
1. Receive webhook payload
2. Verify signature/authenticity
3. Extract payment data:
   - transaction_id
   - customer_email
   - amount
   - status
4. Match customer_email with payment_email in users table
5. Update user subscription:
   - subscription_tier (premium/advance)
   - subscription_status (active)
   - subscription_end_date (30 days from now)
6. Create record in subscriptions table
7. Create record in payment_webhooks table (audit)
8. Return success response
```

**Database Tables:**
- `users` - Update subscription info
- `subscriptions` - Create subscription record
- `payment_webhooks` - Audit trail

**Matching Logic:**
- User must set `payment_email` in profile (new field)
- Lynk.id sends `customer_email` in webhook
- Match and update subscription

### 3. `send-telegram` ✅
**Purpose:** Send PDF notes to user's Telegram

**Trigger:** User clicks "Send to Telegram" button

**Workflow:**
```typescript
1. Receive request:
   - user_id
   - note_id
   
2. Get user's telegram_chat_id from database
3. If not verified, return error: "Verify Telegram first"

4. Generate PDF via API2PDF
5. Upload to ImageKit (temp, expires 1 hour)
6. Get public URL

7. Send document via Telegram Bot API:
   POST https://api.telegram.org/bot{token}/sendDocument
   {
     chat_id: user.telegram_chat_id,
     document: imagekit_url,
     caption: "Catatan: {note_title}"
   }

8. Record in imagekit_temp_uploads table
9. Return success
```

**Requirements:**
- User must verify Telegram first (via bot)
- Premium/Advance subscription required

### 4. `telegram-webhook` ✅
**Purpose:** Verify user's Telegram username and save chat_id

**Trigger:** User starts bot in Telegram

**Workflow:**
```typescript
1. User starts bot: /start {user_id}
2. Telegram sends webhook to this function
3. Extract:
   - chat_id (Telegram chat ID)
   - username (Telegram username)
   - user_id (from /start parameter)
   
4. Update users table:
   - telegram_chat_id = chat_id
   - telegram_verified_at = NOW()
   
5. Send confirmation message:
   "✅ Telegram berhasil diverifikasi! 
   Sekarang Anda bisa menerima catatan."
```

**Bot Commands:**
```
/start {user_id}  - Verify account
/help             - Show help
```

**Database Update:**
```sql
UPDATE users 
SET telegram_chat_id = '{chat_id}',
    telegram_verified_at = NOW()
WHERE id = '{user_id}'
```

---

## Database Schema

### Complete Schema (from `alltable.sql`)

#### 1. `users`
```sql
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  auth_user_id uuid UNIQUE REFERENCES auth.users(id),
  username text NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'panitia', 'ustadz', 'member')),
  subscription_tier text NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'advance')),
  subscription_status text NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'expired', 'cancelled')),
  subscription_start_date timestamptz,
  subscription_end_date timestamptz,
  payment_email text, -- NEW: untuk matching Lynk.id payment
  avatar_url text,
  bio text,
  auth_type text NOT NULL DEFAULT 'phone',
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  force_password_change boolean DEFAULT false,
  password_reset_by_admin boolean DEFAULT false,
  password_reset_at timestamptz,
  password_changed_at timestamptz,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login_at timestamptz,
  telegram_chat_id text UNIQUE, -- Telegram chat ID for bot
  telegram_verified_at timestamp, -- When Telegram was verified
);
```

**Key Fields:**
- `payment_email` - Used for matching Lynk.id payments
- `telegram_chat_id` - Telegram chat ID for sending notes
- `telegram_verified_at` - Verification timestamp

#### 2. `notes`
```sql
CREATE TABLE public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  user_id uuid NOT NULL REFERENCES public.users(id),
  is_pinned boolean DEFAULT false,
  tags text[], -- Array of tags (max 5 per note)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  source_type varchar DEFAULT 'manual' CHECK (source_type IN ('manual', 'youtube')),
  source_url text,
  source_metadata jsonb, -- YouTube metadata (title, channel, speaker, etc)
);
```

**Notes:**
- `tags` - Max 5 per note (validated in frontend)
- No limit on total unique tags (unlimited for all tiers)

#### 3. `subscriptions`
```sql
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  tier text NOT NULL CHECK (tier IN ('free', 'premium', 'advance')),
  status text NOT NULL CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  payment_method text DEFAULT 'lynk_id',
  payment_id text UNIQUE,
  payment_status text CHECK (payment_status IN ('pending', 'success', 'failed', 'cancelled')),
  amount numeric,
  currency text DEFAULT 'IDR',
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  customer_email text,
  customer_name text,
  customer_phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
);
```

#### 4. `payment_webhooks`
```sql
CREATE TABLE public.payment_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  processed_at timestamptz,
  error_message text,
  customer_email text,
  matched_user_id uuid REFERENCES public.users(id),
  received_at timestamptz DEFAULT now(),
);
```

**Purpose:** Audit trail for Lynk.id webhooks

#### 5. `imagekit_temp_uploads`
```sql
CREATE TABLE public.imagekit_temp_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id text NOT NULL UNIQUE, -- ImageKit file ID
  file_url text NOT NULL, -- Public URL
  file_name text NOT NULL,
  file_size integer NOT NULL,
  folder text NOT NULL DEFAULT 'temp-pdfs',
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL, -- 1 hour after upload
  deleted_at timestamptz, -- When deleted by cleanup
  note_id uuid REFERENCES public.notes(id),
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
);
```

**Purpose:** Track temporary PDF files for auto-cleanup

**Cleanup Logic:**
- `imagekit-cleanup` Edge Function runs every hour
- Deletes files where `expires_at < NOW() AND deleted_at IS NULL`

#### 6. `profile_changes`
```sql
CREATE TABLE public.profile_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  field_changed text NOT NULL,
  old_value text,
  new_value text,
  changed_by uuid REFERENCES public.users(id),
  changed_by_role text,
  changed_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text,
);
```

**Purpose:** Audit trail for profile/subscription changes

### Indexes
```sql
-- Performance optimization
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_tags ON notes USING gin(tags);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_subscription_user_id ON subscriptions(user_id);
CREATE INDEX idx_imagekit_expires_at ON imagekit_temp_uploads(expires_at);
CREATE INDEX idx_payment_webhooks_customer_email ON payment_webhooks(customer_email);
```

### Row Level Security (RLS)
```sql
-- Users can only read/update their own notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes" ON notes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notes" ON notes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE USING (user_id = auth.uid());
```

---

## API Endpoints

### Authentication
```
POST   /auth/register      # Register new user
POST   /auth/login         # Login with username + PIN
POST   /auth/logout        # Logout user
GET    /auth/me            # Get current user info
PUT    /auth/change-pin    # Change user PIN
```

### Notes
```
GET    /notes              # List user's notes (with filters, pagination)
POST   /notes              # Create new note
GET    /notes/:id          # Get note detail
PUT    /notes/:id          # Update note
DELETE /notes/:id          # Delete note
POST   /notes/import       # Import from YouTube
```

### Export & Sharing
```
POST   /notes/:id/export-pdf    # Generate PDF via API2PDF
POST   /notes/:id/telegram      # Send to Telegram
POST   /notes/:id/whatsapp      # Get WhatsApp share link
```

### Subscription
```
GET    /subscription              # Get current subscription info
GET    /subscription/tiers        # Get available tiers
GET    /subscription/usage        # Get usage statistics
GET    /subscription/history      # Get subscription history
```

### Users (Admin)
```
GET    /users              # List all users (admin only)
GET    /users/:id          # Get user detail (admin only)
PUT    /users/:id          # Update user (admin only)
DELETE /users/:id          # Delete user (admin only)
POST   /users/:id/reset-pin  # Reset PIN (admin only)
```

### Profile
```
GET    /profile            # Get current user profile
PUT    /profile            # Update profile (name, phone, payment_email, bio)
PUT    /profile/username   # Update username
POST   /profile/verify-telegram  # Get Telegram bot link
```

---

## Profile Page Features

### Edit Profile Form ✅
**Fields:**
- **Nama Lengkap** (editable)
- **Nomor Telepon / WhatsApp** (editable)
  - Hint: "Nomor ini digunakan untuk fitur 'Send to WhatsApp'"
- **📧 Email untuk Pembayaran** (NEW, editable)
  - Label: "Email untuk Pembayaran"
  - Hint: "Email ini digunakan untuk mencocokkan pembayaran Lynk.id dengan akun Anda."
  - Placeholder: "email@contoh.com"
- **Bio** (editable, optional)
  - Max 200 characters

**Save Button:** Updates `full_name`, `phone`, `payment_email`, `bio`

### Change PIN Form ✅
**Fields:**
- **PIN Lama** (6 digit, password input)
- **PIN Baru** (6 digit, password input)
- **Konfirmasi PIN Baru** (6 digit, password input)

**Validation:**
- PIN must be 6 digits
- New PIN must match confirmation
- Old PIN must be correct

### Telegram Verification ✅
**Section:** "Verifikasi Telegram"

**Status:**
- ❌ Not Verified: Show "Verify Now" button
- ✅ Verified: Show "Verified at {date}" with green checkmark

**Button:** Opens Telegram bot link
```
https://t.me/{bot_username}?start={user_id}
```

**Flow:**
1. User clicks "Verify Telegram"
2. Opens Telegram bot
3. User sends `/start {user_id}`
4. Bot calls `telegram-webhook` Edge Function
5. Updates `telegram_chat_id` and `telegram_verified_at`
6. User can now receive notes

---

## Settings Page (Future)

### Planned Features ⏳
- Theme settings (light/dark mode)
- Language preferences (ID/EN)
- Notification preferences
- Export format defaults
- Privacy settings
- Account deletion

**Current Status:** Page exists but features not yet implemented

---

## Subscription Page

### Current Features ✅

1. **Subscription Info Card**
   - Current tier (Free/Premium/Advance)
   - Status (Active/Expired/Cancelled)
   - End date (if Premium/Advance)
   - Days remaining

2. **Pricing Table**
   - Show all 3 tiers (Free, Premium, Advance)
   - Highlight current tier
   - "Upgrade" button for higher tiers
   - "Current Plan" badge for active tier

3. **Usage Statistics**
   - Notes used / limit
   - Progress bar visualization
   - Available features checklist

4. **Payment Links**
   - Premium: Redirect to Lynk.id premium checkout
   - Advance: Redirect to Lynk.id advance checkout

5. **Payment Matching Alert**
   - Show alert if `payment_email` not set
   - Link to profile page to set email
   - Warning: "Set payment email to receive subscription after payment"

### Upgrade Flow
```
User clicks "Upgrade to Premium/Advance"
         │
         ▼
Check if payment_email is set
         │
         ├─ Not set → Show alert, redirect to profile
         │
         └─ Set → Redirect to Lynk.id payment page
                  │
                  ▼
              User completes payment
                  │
                  ▼
              Lynk.id webhook → lynk-webhook function
                  │
                  ▼
              Match via payment_email
                  │
                  ▼
              Update subscription
                  │
                  ▼
              User sees updated tier on /subscription
```

---

## Development Roadmap

### Phase 1: MVP ✅ (Current)
- [x] Authentication system (Username + PIN)
- [x] Auto-generated email system
- [x] CRUD Notes
- [x] YouTube transcript import
- [x] AI summarization (async with polling)
- [x] Video metadata fetching
- [x] Export to PDF (API2PDF)
- [x] Send to Telegram (with verification)
- [x] Share to WhatsApp
- [x] Subscription system (Free/Premium/Advance)
- [x] Lynk.id payment integration (webhook)
- [x] ImageKit integration with auto-cleanup
- [x] Profile page (edit info + change PIN)
- [x] Telegram verification system
- [x] Payment email matching

### Phase 2: Settings & Admin Panel (Next)
- [ ] Settings page implementation
  - [ ] Theme settings
  - [ ] Notification preferences
  - [ ] Export defaults
- [ ] Admin panel untuk user management
- [ ] Role-based permissions (Admin, Ustadz, Panitia)
- [ ] Pin notes feature (admin)
- [ ] User analytics dashboard
- [ ] Bulk operations

### Phase 3: Advanced Features
- [ ] Note templates
- [ ] Auto-save drafts
- [ ] Version history
- [ ] Batch YouTube import
- [ ] Playlist support
- [ ] Advanced search with filters
- [ ] Export to Word/Notion
- [ ] Auto-backup to Google Drive

### Phase 4: Community Features
- [ ] Public notes feed (if needed)
- [ ] Comments on notes
- [ ] Like & bookmark
- [ ] Kajian schedule management
- [ ] Event reminders
- [ ] Group notes (for specific kajian)
- [ ] Attendance tracking

---

## Environment Variables

### Complete `.env` Configuration

```env
# ================================
# SUPABASE
# ================================
VITE_SUPABASE_URL=https://xxxxxxcixrmporoomn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxXBLyLabo

# ================================
# APP CONFIGURATION
# ================================
VITE_APP_NAME=Kajian Note
VITE_APP_URL=http://localhost:5173
VITE_ENV=development

# ================================
# LYNK.ID PAYMENT
# ================================
VITE_LYNK_MERCHANT_KEY=q1UUHQZZTcW2sKpEBpJrYLAREye1XUX0
VITE_LYNK_PREMIUM_LINK=http://lynk.id/bitlab/2q632wo7mk03/checkout
VITE_LYNK_ADVANCE_LINK=http://lynk.id/bitlab/3eq319m81nev/checkout
VITE_WEBHOOK_URL=https://rewtyutkcixrmporoomn.supabase.co/functions/v1/lynk-webhook

# ================================
# YOUTUBE TRANSCRIPT API
# ================================
VITE_YOUTUBE_API_URL=https://kajian-note-api.derrylab.com
VITE_API_HEADER_KEY=Bearer kullubid'atindholaalah

# ================================
# OPENROUTER (AI SUMMARY)
# ================================
VITE_OPENROUTER_API_KEY=your_key_here
VITE_OPENROUTER_DEFAULT_MODEL=qwen/qwen3-8b

# ================================
# TELEGRAM BOT
# ================================
VITE_TELEGRAM_BOT_TOKEN=8450659075:zxxxxxxxxxxxx-v9LUR_6sjlH0

# ================================
# API2PDF (PDF GENERATION)
# ================================
VITE_API2PDF_API_KEY=3a9086b0-xxxx-xxxx-xxxx-0c1ab3374608

# ================================
# IMAGEKIT (TEMP FILE STORAGE)
# ================================
VITE_IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxxxxxxxxxxxxximApU=
VITE_IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxxxxxxxxxxxxiH5/pJe0=
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/worksmeai
```

### Backend (Supabase Edge Functions)
```env
# Edge Functions need these in Supabase Secrets
SUPABASE_SERVICE_ROLE_KEY={service_key}
IMAGEKIT_PRIVATE_KEY={private_key}
LYNK_WEBHOOK_SECRET={webhook_secret}
TELEGRAM_BOT_TOKEN={bot_token}
API2PDF_API_KEY={api_key}
```

---

## Deployment

### Frontend (Vercel) ✅
**Production URL:** https://kajian-note.vercel.app/

**Deployment Steps:**
```bash
# Build production
npm run build

# Deploy to Vercel (auto via Git push)
git push origin main

# Or manual deploy
vercel --prod
```

**Vercel Configuration:**
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables: Set in Vercel dashboard

### Backend (Supabase) ✅
**Project:** rewtyutkcixrmporoomn

**Edge Functions:**
```bash
# Deploy all functions
supabase functions deploy imagekit-cleanup
supabase functions deploy lynk-webhook
supabase functions deploy send-telegram
supabase functions deploy telegram-webhook
```

**Cron Jobs:**
- `imagekit-cleanup`: Runs every hour

### YouTube Transcript API
**URL:** https://kajian-note-api.derrylab.com

**Deployment:** Railway/Render/Fly.io (Docker)