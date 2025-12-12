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
     - Export PDF
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
