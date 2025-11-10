# Kajian Note - Project Summary (Part 2) - UPDATED

## Implementation Guide

**Version:** 3.1 - MVP + Subscription (Lynk.id Webhook Integration)  
**Date:** November 9, 2025  
**Prerequisite:** Read Part 1 first

---

## 🔍 Lynk.id Architecture

### **Konsep:**

1. Merchant create digital product di dashboard Lynk.id
2. Setiap product dapat permanent payment link
3. User klik link → landing page Lynk.id → checkout → bayar
4. Lynk.id send webhook `payment.received` ke server merchant

### **Authentication Method:**

- **Webhook verification**: `X-Lynk-Signature` header
- **Merchant key**: Untuk verify signature dengan HMAC SHA256
- **No API Key**: Tidak ada API untuk create payment

---

## 🚀 Development Instructions

### Step 1: Environment Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env from template
cp .env.example .env

# 3. Edit .env
nano .env
```

**Environment Variables (.env):**

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# App
VITE_APP_NAME=Kajian Note
VITE_APP_URL=http://localhost:5173
VITE_ENV=development

# Lynk.id Payment Configuration
VITE_LYNK_MERCHANT_KEY=your-merchant-key
VITE_LYNK_PREMIUM_LINK=https://lynk.id/username/premium-subscription
VITE_LYNK_ADVANCE_LINK=https://lynk.id/username/advance-subscription

# Webhook Endpoint (Supabase Edge Function)
VITE_WEBHOOK_URL=https://your-project.supabase.co/functions/v1/lynk-webhook
```

### Step 2: Setup Lynk.id Account

#### A. Register & Create Products

1. **Register di Lynk.id**

   - Buka https://lynk.id
   - Daftar sebagai merchant
   - Verifikasi akun (1-3 hari)

2. **Create Digital Products**

   **Product 1: Premium Subscription**

   - Name: `Premium Subscription - Kajian Note (1 Month)`
   - Type: Digital Product
   - Price: Rp 50.000
   - Description:
     ```
     Upgrade ke Premium:
     - Max 100 notes
     - Max 10 tags
     - Public notes
     - Export PDF
     - Berlaku 30 hari
     ```
   - Get payment link: `https://lynk.id/username/premium-subscription`

   **Product 2: Advance Subscription**

   - Name: `Advance Subscription - Kajian Note (1 Month)`
   - Type: Digital Product
   - Price: Rp 100.000
   - Description:
     ```
     Upgrade ke Advance:
     - Unlimited notes
     - Unlimited tags
     - Public notes
     - Export PDF & Word
     - Berlaku 30 hari
     ```
   - Get payment link: `https://lynk.id/username/advance-subscription`

#### B. Get Merchant Key

1. Login ke dashboard Lynk.id
2. Go to **Settings** → **Integrations** → **Webhook**
3. Copy **merchant_key** (untuk verify signature)
4. Save ke `.env` sebagai `VITE_LYNK_MERCHANT_KEY`

#### C. Configure Webhook URL

1. Di halaman Webhook settings
2. Input **URL Webhook**:
   ```
   https://your-project.supabase.co/functions/v1/lynk-webhook
   ```
3. Click **Save URL**
4. Click **Test URL** untuk test connection

---

### Step 3: File Generation Order (UPDATED)

#### **Batch 1: Config & Types (19 files)**

```
1.  .env.example
2.  src/config/env.ts
3.  src/lib/utils.ts
4.  src/lib/supabase.ts
5.  src/config/permissions.ts
6.  src/types/auth.types.ts
7.  src/types/user.types.ts
8.  src/types/subscription.types.ts
9.  src/types/payment.types.ts
10. src/types/notes.types.ts
11. src/schemas/auth.schema.ts
12. src/schemas/user.schema.ts
13. src/schemas/subscription.schema.ts
14. src/schemas/notes.schema.ts
15. src/services/supabase/auth.service.ts
16. src/services/supabase/database.service.ts
17. src/services/supabase/user.service.ts
18. src/services/supabase/subscription.service.ts
19. src/services/supabase/notes.service.ts
```

#### **Batch 2: State & Utils (5 files)**

```
20. src/store/authStore.ts
21. src/store/userStore.ts
22. src/store/subscriptionStore.ts
23. src/store/notesStore.ts
24. src/utils/subscriptionLimits.ts
```

#### **Batch 3: UI Base (7 files)**

```
25. src/components/ui/button.tsx (shadcn)
26. src/components/ui/input.tsx (shadcn)
27. src/components/ui/label.tsx (shadcn)
28. src/components/ui/card.tsx (shadcn)
29. src/components/ui/form.tsx (shadcn)
30. src/components/ui/badge.tsx (shadcn)
31. src/components/common/Loading.tsx
```

#### **Batch 4: Auth (9 files)**

```
32. src/components/features/auth/RegisterForm.tsx
33. src/components/features/auth/LoginForm.tsx
34. src/pages/Register.tsx
35. src/pages/Login.tsx
36. src/pages/Home.tsx
37. src/pages/Dashboard.tsx
38. src/routes/ProtectedRoute.tsx
39. src/routes/RoleBasedRoute.tsx
40. src/App.tsx
```

#### **Batch 5: Profile & User Management (4 files)**

```
41. src/pages/Profile.tsx
42. src/components/features/profile/EditProfileForm.tsx
43. src/components/features/profile/ChangePINForm.tsx
44. src/pages/admin/UserManagement.tsx
```

#### **Batch 6: Subscription (8 files)**

```
45. src/config/payment.ts                                      # NEW: Payment links config
46. src/utils/paymentMatching.ts                               # NEW: Match user with webhook
47. src/components/features/subscription/SubscriptionCard.tsx
48. src/components/features/subscription/PricingTable.tsx
49. src/components/features/subscription/PaymentButton.tsx     # RENAMED from PaymentForm
50. src/components/features/subscription/UpgradeModal.tsx
51. src/pages/Subscription.tsx
52. supabase/functions/lynk-webhook/index.ts                   # UPDATED webhook handler
```

**REMOVED:**

- ❌ `src/services/payment/lynk.service.ts` (tidak ada API create payment)
- ❌ `src/pages/PaymentCallback.tsx` (optional, bisa ditambah nanti)

#### **Batch 7: Notes (7 files)**

```
53. src/components/features/notes/NoteCard.tsx
54. src/components/features/notes/NoteForm.tsx
55. src/components/features/notes/NoteList.tsx
56. src/components/features/notes/NoteSearch.tsx
57. src/components/features/notes/SubscriptionLimitBanner.tsx
58. src/pages/Notes.tsx
59. src/pages/NoteDetail.tsx
```

#### **Batch 8: Settings (3 files)**

```
60. src/components/features/settings/UserSettings.tsx
61. src/components/features/settings/AppSettings.tsx
62. src/pages/Settings.tsx
```

**Total: 62 files untuk MVP + Subscription (Lynk.id)**

---

## 🚀 Deployment Guide

### **Step 1: Deploy Webhook Handler**

```bash
# Deploy to production
supabase functions deploy lynk-webhook --no-verify-jwt

# Get production webhook URL
https://your-project.supabase.co/functions/v1/lynk-webhook
```

### **Step 2: Configure Lynk.id Production**

1. Switch Lynk.id from sandbox → production mode
2. Update webhook URL to production
3. Copy production payment links
4. Update `.env.production`

### **Step 3: Deploy Frontend**

```bash
# Build production
npm run build

# Deploy to Vercel
vercel --prod

# Or Netlify
netlify deploy --prod
```

### **Step 4: Setup Cron Job for Expiry Check**

**Option A: Supabase pg_cron**

```sql
-- Run daily at midnight
SELECT cron.schedule(
  'check-subscription-expiry',
  '0 0 * * *',
  $SELECT check_subscription_expired()$
);
```

**Option B: External Cron Service**

```bash
# Setup cron job to call edge function
curl -X POST https://your-project.supabase.co/functions/v1/check-expiry
```

### **Step 5: Monitoring**

**A. Webhook Logs**

```sql
-- Check recent webhooks
SELECT * FROM payment_webhooks
ORDER BY received_at DESC
LIMIT 10;

-- Check failed webhooks
SELECT * FROM payment_webhooks
WHERE processed = false
ORDER BY received_at DESC;
```

**B. Subscription Status**

```sql
-- Active subscriptions
SELECT COUNT(*) FROM users
WHERE subscription_status = 'active'
AND subscription_tier != 'free';

-- Expiring soon (next 7 days)
SELECT * FROM users
WHERE subscription_end_date BETWEEN NOW() AND NOW() + INTERVAL '7 days'
AND subscription_status = 'active';
```

---

## 🔄 Migration from Old Design

### **Changes Summary:**

| Aspect                | Old Design              | New Design               |
| --------------------- | ----------------------- | ------------------------ |
| **Payment Creation**  | API call to Lynk.id     | Manual product creation  |
| **Payment Link**      | Dynamic per user        | Static per product       |
| **User Matching**     | Metadata in API         | Email matching           |
| **API Service**       | `lynk.service.ts`       | ❌ Removed               |
| **Payment Flow**      | Complex API integration | Simple redirect          |
| **Email Requirement** | Optional (dummy)        | **Required for payment** |

### **Files to Remove:**

```
❌ src/services/payment/lynk.service.ts
❌ src/pages/PaymentCallback.tsx (optional)
```

### **Files to Add:**

```
✅ src/config/payment.ts
✅ src/utils/paymentMatching.ts
✅ Updated: supabase/functions/lynk-webhook/index.ts
```

### **Database Changes:**

```sql
-- Add payment_email column
ALTER TABLE users ADD COLUMN payment_email TEXT;
CREATE INDEX idx_users_payment_email ON users(payment_email);

-- Add customer info to subscriptions
ALTER TABLE subscriptions ADD COLUMN customer_email TEXT;
ALTER TABLE subscriptions ADD COLUMN customer_name TEXT;
ALTER TABLE subscriptions ADD COLUMN customer_phone TEXT;

-- Add matching to webhooks
ALTER TABLE payment_webhooks ADD COLUMN customer_email TEXT;
ALTER TABLE payment_webhooks ADD COLUMN matched_user_id UUID REFERENCES users(id);
CREATE INDEX idx_payment_webhooks_customer_email ON payment_webhooks(customer_email);
```

---

## 🐛 Common Issues & Solutions

### **Issue 1: User Not Found in Webhook**

**Cause:** Email mismatch between Lynk.id and database

**Solution:**

```typescript
// Add logging in webhook
console.log('Looking for user with email:', customerEmail);

// Check database manually
SELECT id, email, payment_email FROM users
WHERE email = 'customer@email.com'
OR payment_email = 'customer@email.com';

// Ask user to verify email in profile
```

### **Issue 2: Webhook Not Received**

**Cause:** Webhook URL not configured or incorrect

**Solution:**

```bash
# Test webhook URL manually
curl -X POST https://your-project.supabase.co/functions/v1/lynk-webhook

# Check Supabase logs
supabase functions logs lynk-webhook

# Verify URL in Lynk.id dashboard
# Click "Test URL" button
```

### **Issue 3: Payment Processed but User Not Upgraded**

**Cause:** Webhook processed but update failed

**Solution:**

```sql
-- Check webhook logs
SELECT * FROM payment_webhooks
WHERE payment_id = 'LYNK-12345';

-- Check if user exists
SELECT * FROM users WHERE email = 'customer@email.com';

-- Manually upgrade user (admin action)
UPDATE users
SET subscription_tier = 'premium',
    subscription_status = 'active',
    subscription_start_date = NOW(),
    subscription_end_date = NOW() + INTERVAL '30 days'
WHERE id = 'user-id';
```

### **Issue 4: Duplicate Subscription**

**Cause:** User paid twice or webhook sent twice

**Solution:**

```typescript
// Add idempotency check in webhook
const { data: existing } = await supabase.from("subscriptions").select("id").eq("payment_id", refId).single();

if (existing) {
  console.log("Payment already processed:", refId);
  return { success: true, message: "Already processed" };
}
```

---

## 🎉 Ready to Implement!

You now have:

- ✅ Complete understanding of Lynk.id integration
- ✅ Updated database schema with email matching
- ✅ Webhook handler implementation
- ✅ Payment configuration & utilities
- ✅ Testing strategy
- ✅ Deployment guide
- ✅ Troubleshooting guide

**Kesimpulan:**

Flow Lynk.id **LEBIH SIMPLE** dari desain awal karena:

- ❌ Tidak perlu API create payment
- ✅ Lynk.id handle payment UI
- ✅ Webhook straightforward
- ✅ Perfect untuk MVP

**Perubahan utama:**

1. Email **wajib** untuk payment matching
2. Payment links **static** (dari dashboard)
3. **Tidak ada** `lynk.service.ts`
4. Webhook **match by email**

---

**Mau mulai generate code untuk Batch 6?** 🚀

_Version: 3.1 | MVP + Subscription (Lynk.id Webhook) | Nov 9, 2025_
