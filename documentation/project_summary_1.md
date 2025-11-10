# Kajian Note - Project Summary (Part 1)

## Architecture & Specifications

**Version:** 3.1 - MVP Focus (Lynk.id Webhook Integration)  
**Date:** November 10, 2025  
**Features:** Auth System, User Management, Subscription System, Notes Management, Settings

---

## 📖 Project Overview

**Kajian Note** - Aplikasi catatan kajian dengan sistem auth yang user-friendly untuk orang tua yang tidak familiar dengan email, dilengkapi sistem subscription untuk monetisasi.

### MVP Features

1. **Authentication System** - Username + PIN (6 digit)
2. **User Role Management** - Admin, Panitia, Ustadz, Jamaah
3. **Subscription System** - Free, Premium, Advance tiers dengan Lynk.id payment gateway (webhook-based)
4. **Notes Management** - Create, read, update, delete notes (dengan subscription limits)
5. **Settings** - User preferences & app configuration

### Target Users & Challenges

- **Target**: Jamaah masjid/kajian (termasuk orang tua yang tidak paham email)
- **Challenge**: Beberapa user share 1 nomor HP, tidak punya email
- **Solution**: Username + PIN auth, phone number optional & non-unique
- **Monetization**: Subscription tiers dengan payment gateway Lynk.id (webhook-based, **email required**)

---

## 🛠 Tech Stack

### Frontend:

- React 19.1.1 + Vite 7.1.7 + TypeScript 5.9.3
- Tailwind CSS 4.1.16 + shadcn/ui
- Zustand 5.0.8 (State)
- React Hook Form 7.66.0 + Zod 4.1.12

### Backend:

- Supabase 2.78.0 (Auth + PostgreSQL + Edge Functions)
- Lynk.id (Payment webhook-based, no API)

---

## 📁 Project Structure

```
kajian_note/
├── public/
│   ├── favicon.ico
│   └── images/
│
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── fonts/
│   │   └── icons/
│   │
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   └── label.tsx
│   │   │
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx
│   │   │   ├── AuthLayout.tsx
│   │   │   └── DashboardLayout.tsx
│   │   │
│   │   └── features/
│   │       ├── auth/
│   │       │   ├── LoginForm.tsx
│   │       │   └── RegisterForm.tsx
│   │       ├── profile/
│   │       │   ├── EditProfileForm.tsx
│   │       │   └── ChangePINForm.tsx
│   │       ├── subscription/
│   │       │   ├── SubscriptionCard.tsx
│   │       │   ├── PricingTable.tsx
│   │       │   ├── PaymentButton.tsx     # RENAMED: redirect only
│   │       │   └── UpgradeModal.tsx
│   │       ├── notes/
│   │       │   ├── NoteCard.tsx
│   │       │   ├── NoteForm.tsx
│   │       │   ├── NoteList.tsx
│   │       │   ├── NoteSearch.tsx
│   │       │   └── SubscriptionLimitBanner.tsx
│   │       └── settings/
│   │           ├── UserSettings.tsx
│   │           └── AppSettings.tsx
│   │
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Profile.tsx
│   │   ├── Subscription.tsx
│   │   ├── Notes.tsx
│   │   ├── NoteDetail.tsx
│   │   ├── Settings.tsx
│   │   ├── NotFound.tsx
│   │   └── admin/
│   │       └── UserManagement.tsx
│   │
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── axios.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   │
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── userStore.ts
│   │   ├── subscriptionStore.ts
│   │   └── notesStore.ts
│   │
│   ├── services/
│   │   └── supabase/
│   │       ├── auth.service.ts
│   │       ├── database.service.ts
│   │       ├── user.service.ts
│   │       ├── subscription.service.ts
│   │       └── notes.service.ts
│   │   # NOTE: No payment/lynk.service.ts (webhook-based)
│   │
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── subscription.types.ts
│   │   ├── payment.types.ts
│   │   └── notes.types.ts
│   │
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   ├── user.schema.ts
│   │   ├── subscription.schema.ts
│   │   └── notes.schema.ts
│   │
│   ├── routes/
│   │   ├── index.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── RoleBasedRoute.tsx
│   │
│   ├── config/
│   │   ├── env.ts
│   │   ├── payment.ts              # NEW: Static payment links
│   │   ├── permissions.ts
│   │   └── app.config.ts
│   │
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── subscriptionLimits.ts
│   │   ├── paymentMatching.ts      # NEW: Email matching
│   │   └── helpers.ts
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── supabase/
│   └── functions/
│       └── lynk-webhook/            # UPDATED: Webhook handler
│           └── index.ts
│
├── .env
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🔐 Authentication System

### Design Decisions

- **Primary Auth**: Username + PIN (6 digit)
- **Email**: Dummy `{username}@kajiannote.local` (Supabase requirement)
- **Phone**: Optional, non-unique (display only)
- **Password Reset**: Admin/Panitia assisted (manual)
- **Default Role**: member

### Key Flows

**Register:**

```
Input → Validate → Create Auth + Profile → Set free tier → Auto-login
```

**Login:**

```
Username + PIN → Validate → Fetch profile + role + subscription → Dashboard
```

**Password Reset:**

```
Contact Admin → Verify offline → Reset PIN → Temporary PIN + force_change flag
```

---

## 💳 Subscription System

### Tiers

| Tier    | Price   | Max Notes | Max Tags  | Public | PDF | Word |
| ------- | ------- | --------- | --------- | ------ | --- | ---- |
| Free    | Rp 0    | 10        | 3         | ❌     | ❌  | ❌   |
| Premium | Rp 50K  | 100       | 10        | ✅     | ✅  | ❌   |
| Advance | Rp 100K | Unlimited | Unlimited | ✅     | ✅  | ✅   |

### Payment Flow (Webhook-Based)

```
1. Admin creates products in Lynk.id dashboard (one-time)
   → Get static payment links

2. User clicks "Upgrade" → Frontend redirects to Lynk.id

3. User enters email + pays → Lynk.id sends webhook

4. Backend webhook:
   - Verify signature (HMAC SHA256)
   - Match user by email
   - Update subscription
   - Log webhook

5. User returns → Auto-updated subscription
```

### 🔑 Key Changes from Old Design

| Aspect           | Old               | New                |
| ---------------- | ----------------- | ------------------ |
| Payment Creation | API call          | Manual dashboard   |
| Payment Link     | Dynamic           | Static per tier    |
| User Matching    | Metadata          | **Email required** |
| API Service      | `lynk.service.ts` | ❌ Removed         |
| Flow             | Complex API       | Simple redirect    |

### Email Requirement

**CRITICAL:** Users **MUST** provide real email before upgrading.

```typescript
// Check before showing payment button
if (!user.email || user.email.endsWith("@kajiannote.local")) {
  showEmailPrompt(); // Force email input
  return;
}
```

**Why:** Lynk.id webhook only provides `customer_email` for matching.

---

## 🗄 Database Schema

### Key Tables

**users** (UPDATED)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'member',
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  payment_email TEXT,                    -- NEW: For webhook matching
  -- ... other fields
);

CREATE INDEX idx_users_payment_email ON users(payment_email);
```

**subscriptions** (UPDATED)

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  tier TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_id TEXT UNIQUE,
  amount DECIMAL(10, 2),
  customer_email TEXT,                   -- NEW: From webhook
  customer_name TEXT,                    -- NEW: From webhook
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  -- ... other fields
);
```

**payment_webhooks** (UPDATED)

```sql
CREATE TABLE payment_webhooks (
  id UUID PRIMARY KEY,
  payment_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  customer_email TEXT,                   -- NEW: For matching
  matched_user_id UUID REFERENCES users(id), -- NEW: Matched user
  received_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_webhooks_customer_email ON payment_webhooks(customer_email);
```

**notes**

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 👥 Roles & Permissions

### Hierarchy

```
Admin → Panitia → Ustadz → Jamaah
```

### Matrix (Simplified)

| Feature            | Admin | Panitia | Ustadz | Jamaah   |
| ------------------ | ----- | ------- | ------ | -------- |
| User CRUD          | ✅    | ❌      | ❌     | ❌       |
| View All Users     | ✅    | ✅      | ✅     | ❌       |
| Reset Password     | ✅    | ✅      | ❌     | ❌       |
| Grant Subscription | ✅    | ❌      | ❌     | ❌       |
| Create Note        | ✅    | ✅      | ✅     | ✅\*     |
| Public Note        | ✅    | ✅      | ✅     | Premium+ |
| Export PDF         | ✅    | ✅      | ✅     | Premium+ |
| Export Word        | ✅    | ✅      | ✅     | Advance  |

\*Subject to limits

---

## 🎯 Development Priority (62 Files Total)

### Batch 1: Config & Types (19 files)

```
1-5:   .env.example, env.ts, supabase.ts, utils.ts, permissions.ts
6-10:  auth.types, user.types, subscription.types, payment.types, notes.types
11-15: auth.schema, user.schema, subscription.schema, notes.schema, auth.service
16-19: database.service, user.service, subscription.service, notes.service
```

### Batch 2: State & Utils (5 files)

```
20-24: authStore, userStore, subscriptionStore, notesStore, subscriptionLimits
```

### Batch 3: UI Base (7 files)

```
25-31: button, input, label, card, form, badge, Loading
```

### Batch 4: Auth (9 files)

```
32-40: RegisterForm, LoginForm, Register, Login, Home, Dashboard,
       ProtectedRoute, RoleBasedRoute, App
```

### Batch 5: Profile (4 files)

```
41-44: Profile, EditProfileForm, ChangePINForm, UserManagement
```

### Batch 6: Subscription (8 files) - UPDATED

```
45. src/config/payment.ts              # NEW: Static links
46. src/utils/paymentMatching.ts       # NEW: Email matching
47. SubscriptionCard.tsx
48. PricingTable.tsx
49. PaymentButton.tsx                  # RENAMED: Simple redirect
50. UpgradeModal.tsx
51. Subscription.tsx
52. supabase/functions/lynk-webhook/index.ts  # UPDATED
```

**REMOVED:**

- ❌ `src/services/payment/lynk.service.ts`
- ❌ `src/pages/PaymentCallback.tsx`

### Batch 7: Notes (7 files)

```
53-59: NoteCard, NoteForm, NoteList, NoteSearch,
       SubscriptionLimitBanner, Notes, NoteDetail
```

### Batch 8: Settings (3 files)

```
60-62: UserSettings, AppSettings, Settings
```

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

### Cost Estimation

- Supabase: Free tier (50K MAU)
- Lynk.id: 2.9% + Rp 1K per transaction
- Example: Rp 50K → Fee Rp 2,450 → Net Rp 47,550
- Target: 100 premium users = Rp 4.755.000/bln

---

## 📌 Important Notes

**Security:**

- RLS enabled for all tables
- Webhook signature verification (HMAC SHA256)
- Audit trail for critical changes
- PIN minimal 6 digit

**UX for Elderly:**

- Large fonts (min 16px)
- High contrast colors
- Simple forms
- Clear subscription benefits
- Easy payment (QRIS scan)

**Scalability:**

- Database indexed properly
- Ready for 1000+ users
- Permission system extensible
- Subscription limits configurable

---

**Continue to Part 2 for implementation guide, webhook setup, and deployment.**

_Version: 3.1 | MVP + Subscription (Webhook) | Nov 10, 2025_
