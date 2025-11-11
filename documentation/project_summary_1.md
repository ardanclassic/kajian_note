# Kajian Note - Project Summary (Part 1)

## Architecture & Specifications

**Version:** 3.2 - MVP Focus (Lynk.id Webhook Integration)  
**Date:** November 10, 2025  
**Features:** Auth System, User Management, Subscription System, Notes Management, Settings

---

## 📖 Project Overview

**Kajian Note** - Aplikasi catatan kajian dengan sistem auth yang user-friendly untuk orang tua yang tidak familiar dengan email, dilengkapi sistem subscription untuk monetisasi.

### MVP Features

1. **Authentication System** - Username + PIN (6 digit)
2. **User Role Management** - Admin, Panitia, Ustadz, Member
3. **Subscription System** - Free, Premium, Advance tiers dengan Lynk.id payment gateway (webhook-based)
4. **Notes Management** - Create, read, update, delete notes (dengan subscription limits)
5. **Settings** - User preferences & app configuration

### Target Users & Challenges

- **Target**: Member masjid/kajian (termasuk orang tua yang tidak paham email)
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
│   │   │   │   └── 📄 SubscriptionLimitBanner.tsx
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
│   │   ├── 📄 payment.ts              # NEW: Static payment links
│   │   ├── 📄 permissions.ts
│   │   └── 📄 theme.ts
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
│   │   │   ├── 📄 CreateNote.tsx
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
│   │   └── 📁 supabase/
│   │       ├── 📄 auth.service.ts
│   │       ├── 📄 database.service.ts
│   │       ├── 📄 notes.service.ts
│   │       ├── 📄 subscription.service.ts
│   │       └── 📄 user.service.ts
│   │   # NOTE: No payment/lynk.service.ts (webhook-based)
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
│   │   ├── 📄 notes.types.ts
│   │   ├── 📄 payment.types.ts
│   │   ├── 📄 subscription.types.ts
│   │   ├── 📄 supabase.types.ts
│   │   └── 📄 user.types.ts
│   │
│   ├── 📁 utils/
│   │   ├── 📄 paymentMatching.ts      # NEW: Email matching
│   │   └── 📄 subscriptionLimits.ts
│   │
│   ├── 📄 App.tsx
│   └── 📄 main.tsx
│
├── 📁 supabase/
│   └── 📁 functions/
│       └── 📁 lynk-webhook/            # UPDATED: Webhook handler
│           └── 📄 index.ts
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

### notes

- **Primary Key**: id (UUID)
- **Foreign Key**: user_id → users(id)
- **Content**: title, content (text)
- **Settings**: is_public, is_pinned
- **Tags**: tags (text array)
- **Timestamps**: created_at, updated_at
- **RLS**: User can only access their own notes (unless public)

---

## 👥 Roles & Permissions

### Hierarchy

```
Admin → Panitia → Ustadz → Member
```

### Matrix (Simplified)

| Feature            | Admin | Panitia | Ustadz | Member   |
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

## 🎯 Development Priority (58 Files Total)

### Batch 1: Config & Types (18 files)

```
1-5:   .env.example, env.ts, supabase.ts, utils.ts, permissions.ts
6-10:  auth.types, user.types, subscription.types, payment.types, notes.types
11-15: auth.schema, user.schema, subscription.schema, notes.schema, auth.service
16-18: database.service, user.service, subscription.service, notes.service
```

### Batch 2: State & Utils (6 files)

```
19-24: authStore, userStore, subscriptionStore, notesStore,
       subscriptionLimits, paymentMatching
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

### Batch 6: Subscription (7 files) - UPDATED

```
45. src/config/payment.ts              # NEW: Static links
46. SubscriptionCard.tsx
47. PricingTable.tsx
48. PaymentButton.tsx                  # RENAMED: Simple redirect
49. UpgradeModal.tsx
50. Subscription.tsx
51. supabase/functions/lynk-webhook/index.ts  # UPDATED
```

**REMOVED:**

- ❌ `src/services/payment/lynk.service.ts`
- ❌ `src/pages/PaymentCallback.tsx`

### Batch 7: Notes (7 files)

```
52-58: NoteCard, NoteForm, NoteList, NoteSearch,
       SubscriptionLimitBanner, Notes, NoteDetail
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

_Version: 3.2 | MVP + Subscription (Webhook) | Nov 10, 2025_
