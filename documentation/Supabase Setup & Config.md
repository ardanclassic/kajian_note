# Alwaah - Supabase Setup & SQL Schema

> **Version:** 2.0.0  
> **Last Updated:** December 24, 2024  
> **Supabase Project:** rewtyutkcixrmporoomn

---

## 📖 Table of Contents

1. [Supabase Configuration](#supabase-configuration)
2. [Database Schema](#database-schema)
3. [Row Level Security (RLS)](#row-level-security-rls)
4. [Database Functions](#database-functions)
5. [Edge Functions](#edge-functions)
6. [Setup Instructions](#setup-instructions)

---

## Supabase Configuration

### Project Details

```env
SUPABASE_URL=https://rewtyutkcixrmporoomn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=[admin_key_in_secrets]
```

### Services Used

| Service            | Purpose              | Notes                       |
| ------------------ | -------------------- | --------------------------- |
| **Auth**           | User authentication  | Custom PIN system via email |
| **Database**       | PostgreSQL storage   | With RLS policies           |
| **Edge Functions** | Serverless functions | Webhooks & automation       |
| **Realtime**       | Live updates         | Planned for future features |

---

## Database Schema

### 1. `users` Table

**Purpose:** Store user profiles & subscription info

```sql
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  auth_user_id uuid UNIQUE REFERENCES auth.users(id),
  username text NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'member'
    CHECK (role IN ('admin', 'panitia', 'ustadz', 'member')),
  subscription_tier text NOT NULL DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'premium', 'advance')),
  subscription_status text NOT NULL DEFAULT 'active'
    CHECK (subscription_status IN ('active', 'expired', 'cancelled')),
  subscription_start_date timestamptz,
  subscription_end_date timestamptz,
  payment_email text,
  avatar_url text,
  bio text,
  telegram_chat_id text UNIQUE,
  telegram_verified_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login_at timestamptz
);
```

**Key Fields:**

- `email` - Auto-generated: `{username}@kajiannote.com`
- `payment_email` - For Lynk.id payment matching
- `telegram_chat_id` - For sending notes via bot
- `subscription_tier` - Access level (free/premium/advance)

**Indexes:**

```sql
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_telegram_chat_id ON users(telegram_chat_id);
CREATE INDEX idx_users_payment_email ON users(payment_email);
```

---

### 2. `notes` Table

**Purpose:** Store user notes & kajian content

```sql
CREATE TABLE public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_pinned boolean DEFAULT false,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  source_type text DEFAULT 'manual'
    CHECK (source_type IN ('manual', 'youtube')),
  source_url text,
  source_metadata jsonb
);
```

**Key Fields:**

- `tags` - Array of tags (max 5 per note, validated in frontend)
- `source_type` - 'manual' or 'youtube'
- `source_metadata` - JSON: `{title, channel, speaker, duration, thumbnail}`
- `deleted_at` - Soft delete timestamp

**Indexes:**

```sql
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_tags ON notes USING gin(tags);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_notes_source_type ON notes(source_type);
```

---

### 3. `subscriptions` Table

**Purpose:** Track subscription history & payments

```sql
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
  updated_at timestamptz DEFAULT now()
);
```

**Indexes:**

```sql
CREATE INDEX idx_subscription_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscription_payment_id ON subscriptions(payment_id);
CREATE INDEX idx_subscription_status ON subscriptions(status);
```

---

### 4. `payment_webhooks` Table

**Purpose:** Audit trail for Lynk.id payment webhooks

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
  received_at timestamptz DEFAULT now()
);
```

**Usage:** Every webhook from Lynk.id is logged here for debugging & audit.

**Indexes:**

```sql
CREATE INDEX idx_payment_webhooks_payment_id ON payment_webhooks(payment_id);
CREATE INDEX idx_payment_webhooks_customer_email ON payment_webhooks(customer_email);
CREATE INDEX idx_payment_webhooks_processed ON payment_webhooks(processed);
```

---

### 5. `imagekit_temp_uploads` Table

**Purpose:** Track temporary PDF files for auto-cleanup

```sql
CREATE TABLE public.imagekit_temp_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id text NOT NULL UNIQUE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size integer NOT NULL,
  folder text NOT NULL DEFAULT 'temp-pdfs',
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  deleted_at timestamptz,
  note_id uuid REFERENCES public.notes(id) ON DELETE SET NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**Lifecycle:**

- `expires_at` = `uploaded_at + 1 hour`
- `imagekit-cleanup` Edge Function runs hourly
- Deletes files where `expires_at < NOW() AND deleted_at IS NULL`

**Indexes:**

```sql
CREATE INDEX idx_imagekit_expires_at ON imagekit_temp_uploads(expires_at);
CREATE INDEX idx_imagekit_deleted_at ON imagekit_temp_uploads(deleted_at);
CREATE INDEX idx_imagekit_file_id ON imagekit_temp_uploads(file_id);
```

---

### 6. `profile_changes` Table

**Purpose:** Audit trail for profile/subscription changes

```sql
CREATE TABLE public.profile_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  field_changed text NOT NULL,
  old_value text,
  new_value text,
  changed_by uuid REFERENCES public.users(id),
  changed_by_role text,
  changed_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text
);
```

**Usage:** Log important changes (subscription upgrades, profile edits, etc.)

**Indexes:**

```sql
CREATE INDEX idx_profile_changes_user_id ON profile_changes(user_id);
CREATE INDEX idx_profile_changes_changed_at ON profile_changes(changed_at DESC);
```

---

## Row Level Security (RLS)

### Enable RLS

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE imagekit_temp_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_changes ENABLE ROW LEVEL SECURITY;
```

### RLS Policies

#### `users` Table

```sql
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = auth_user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- Admin can view all users
CREATE POLICY "Admin can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );
```

#### `notes` Table

```sql
-- Users can view own notes
CREATE POLICY "Users can view own notes" ON notes
  FOR SELECT USING (user_id IN (
    SELECT id FROM users WHERE auth_user_id = auth.uid()
  ));

-- Users can insert own notes
CREATE POLICY "Users can insert own notes" ON notes
  FOR INSERT WITH CHECK (user_id IN (
    SELECT id FROM users WHERE auth_user_id = auth.uid()
  ));

-- Users can update own notes
CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (user_id IN (
    SELECT id FROM users WHERE auth_user_id = auth.uid()
  ));

-- Users can delete own notes (soft delete)
CREATE POLICY "Users can delete own notes" ON notes
  FOR UPDATE USING (user_id IN (
    SELECT id FROM users WHERE auth_user_id = auth.uid()
  ));
```

#### `subscriptions` Table

```sql
-- Users can view own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (user_id IN (
    SELECT id FROM users WHERE auth_user_id = auth.uid()
  ));

-- Only service role can insert/update
-- (via Edge Functions)
```

#### `payment_webhooks` Table

```sql
-- Only service role can access
-- (via Edge Functions only)
```

#### `imagekit_temp_uploads` Table

```sql
-- Users can view own files
CREATE POLICY "Users can view own files" ON imagekit_temp_uploads
  FOR SELECT USING (user_id = auth.uid());

-- Service role can manage all
-- (via Edge Functions)
```

---

## Database Functions

### 1. Auto-Update Timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Check Subscription Limit

```sql
CREATE OR REPLACE FUNCTION check_notes_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_tier text;
  note_count integer;
  max_notes integer;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO user_tier
  FROM users
  WHERE id = NEW.user_id;

  -- Count existing notes
  SELECT COUNT(*) INTO note_count
  FROM notes
  WHERE user_id = NEW.user_id AND deleted_at IS NULL;

  -- Set max based on tier
  max_notes := CASE user_tier
    WHEN 'free' THEN 10
    WHEN 'premium' THEN 75
    WHEN 'advance' THEN 999999
    ELSE 10
  END;

  -- Check limit
  IF note_count >= max_notes THEN
    RAISE EXCEPTION 'Note limit reached for tier: %', user_tier;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
CREATE TRIGGER check_notes_limit_trigger
  BEFORE INSERT ON notes
  FOR EACH ROW EXECUTE FUNCTION check_notes_limit();
```

### 3. Soft Delete Notes

```sql
CREATE OR REPLACE FUNCTION soft_delete_note()
RETURNS TRIGGER AS $$
BEGIN
  NEW.deleted_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Usage: UPDATE notes SET deleted_at = NOW() WHERE id = '...'
```

---

## Edge Functions

### 1. `imagekit-cleanup`

**Purpose:** Auto-delete expired temp files from ImageKit

**Schedule:** Cron every hour

**Complete Code:**

```typescript
/**
 * Supabase Edge Function: imagekit-cleanup
 *
 * Purpose: Automatically delete expired PDF files from ImageKit
 * Trigger: Called by cron job every hour
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Types
interface ExpiredFile {
  id: string;
  file_id: string;
  file_url: string;
  file_name: string;
  expires_at: string;
}

interface CleanupStats {
  foundExpired: number;
  deleted: number;
  failed: number;
  duration: string;
}

interface CleanupResponse {
  success: boolean;
  message: string;
  stats: CleanupStats;
  errors?: string[];
}

/**
 * Safe base64 encode (handles special characters in private key)
 */
function safeBase64Encode(str: string): string {
  try {
    return btoa(str);
  } catch {
    return btoa(unescape(encodeURIComponent(str)));
  }
}

/**
 * Delete file from ImageKit
 */
async function deleteFromImageKit(fileId: string, privateKey: string): Promise<boolean> {
  try {
    const authHeader = "Basic " + safeBase64Encode(`${privateKey}:`);

    const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[ImageKit] Delete failed for ${fileId}:`, errorData);
      return false;
    }

    console.log(`[ImageKit] ✅ Deleted: ${fileId}`);
    return true;
  } catch (error) {
    console.error(`[ImageKit] Error deleting ${fileId}:`, error);
    return false;
  }
}

/**
 * Main cleanup handler
 */
serve(async (req) => {
  const startTime = Date.now();

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("[Cleanup] Starting ImageKit cleanup job...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const imagekitPrivateKey = Deno.env.get("IMAGEKIT_PRIVATE_KEY");
    if (!imagekitPrivateKey) {
      throw new Error("IMAGEKIT_PRIVATE_KEY not configured");
    }

    // Query expired files
    const { data: expiredFiles, error: queryError } = await supabase
      .from("imagekit_temp_uploads")
      .select("id, file_id, file_url, file_name, expires_at")
      .lt("expires_at", new Date().toISOString())
      .is("deleted_at", null)
      .order("expires_at", { ascending: true });

    if (queryError) {
      throw new Error(`Database query failed: ${queryError.message}`);
    }

    console.log(`[Cleanup] Found ${expiredFiles?.length || 0} expired files`);

    if (!expiredFiles || expiredFiles.length === 0) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      return new Response(
        JSON.stringify({
          success: true,
          message: "No expired files to clean up",
          stats: {
            foundExpired: 0,
            deleted: 0,
            failed: 0,
            duration: `${duration}s`,
          },
        } as CleanupResponse),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Delete files from ImageKit
    let deletedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];
    const deletedFileIds: string[] = [];

    for (const file of expiredFiles as ExpiredFile[]) {
      const deleted = await deleteFromImageKit(file.file_id, imagekitPrivateKey);

      if (deleted) {
        deletedCount++;
        deletedFileIds.push(file.id);
      } else {
        failedCount++;
        errors.push(`Failed to delete ${file.file_name}`);
      }
    }

    // Update database
    if (deletedFileIds.length > 0) {
      const { error: updateError } = await supabase
        .from("imagekit_temp_uploads")
        .update({ deleted_at: new Date().toISOString() })
        .in("id", deletedFileIds);

      if (updateError) {
        errors.push(`Database update failed: ${updateError.message}`);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const response: CleanupResponse = {
      success: failedCount === 0,
      message: `Cleanup completed: ${deletedCount} deleted, ${failedCount} failed`,
      stats: {
        foundExpired: expiredFiles.length,
        deleted: deletedCount,
        failed: failedCount,
        duration: `${duration}s`,
      },
    };

    if (errors.length > 0) {
      response.errors = errors;
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[Cleanup] Fatal error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: `Cleanup failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
```

**Deployment:**

```bash
supabase functions deploy imagekit-cleanup
```

---

### 2. `lynk-webhook`

**Purpose:** Handle payment notifications from Lynk.id

**Complete Code:**

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-lynk-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Webhook received:", {
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
    });

    // Parse body
    let payload;
    try {
      const text = await req.text();
      console.log("Raw body:", text);
      payload = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error("Parse error:", e);
      payload = {};
    }

    console.log("Parsed payload:", payload);

    // Handle test/ping request
    if (!payload.data || !payload.data.message_data) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Webhook endpoint ready",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

    const { event, data } = payload;
    const { message_action, message_data } = data;
    const { refId, customer, items, totals } = message_data;

    // Log webhook
    const { data: log, error: logError } = await supabase
      .from("payment_webhooks")
      .insert({
        payment_id: refId,
        event_type: event,
        payload: payload,
        customer_email: customer?.email,
        processed: false,
      })
      .select()
      .single();

    if (logError) {
      console.error("Log error:", logError);
    }

    // Process payment
    if (event === "payment.received" && message_action === "SUCCESS") {
      const productTitle = items?.[0]?.title?.toLowerCase() || "";
      const tier = productTitle.includes("advance") ? "advance" : "premium";

      // Find user
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .or(`email.eq.${customer?.email},payment_email.eq.${customer?.email}`)
        .single();

      if (!user) {
        if (log) {
          await supabase
            .from("payment_webhooks")
            .update({ processed: true, error_message: "User not found" })
            .eq("id", log.id);
        }

        throw new Error("User not found");
      }

      // Update subscription
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      await supabase
        .from("users")
        .update({
          subscription_tier: tier,
          subscription_status: "active",
          subscription_start_date: startDate.toISOString(),
          subscription_end_date: endDate.toISOString(),
        })
        .eq("id", user.id);

      await supabase.from("subscriptions").insert({
        user_id: user.id,
        tier: tier,
        status: "active",
        payment_method: "lynk_id",
        payment_id: refId,
        payment_status: "success",
        amount: totals?.grandTotal || 0,
        currency: "IDR",
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        customer_email: customer?.email,
        customer_name: customer?.name,
        customer_phone: customer?.phone,
      });

      if (log) {
        await supabase
          .from("payment_webhooks")
          .update({
            processed: true,
            processed_at: new Date().toISOString(),
            matched_user_id: user.id,
          })
          .eq("id", log.id);
      }

      return new Response(JSON.stringify({ success: true, user_id: user.id, tier }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Webhook received" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200, // Return 200 to prevent Lynk.id retry
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
```

**Deployment:**

```bash
supabase functions deploy lynk-webhook
```

---

### 3. `send-telegram`

**Purpose:** Send PDF notes to user's Telegram

**Complete Code:**

```typescript
/**
 * Supabase Edge Function: send-telegram
 * Send PDF file to user's Telegram via Telegram Bot API
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendTelegramRequest {
  chat_id: string;
  pdf_url: string;
  note_title: string;
  note_id?: string;
}

interface TelegramResponse {
  ok: boolean;
  result?: {
    message_id: number;
    chat: {
      id: number;
      type: string;
    };
    document?: {
      file_id: string;
      file_name: string;
      file_size: number;
    };
  };
  description?: string;
  error_code?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN is not configured");
    }

    const body: SendTelegramRequest = await req.json();
    const { chat_id, pdf_url, note_title, note_id } = body;

    if (!chat_id || !pdf_url || !note_title) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: chat_id, pdf_url, note_title",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[Telegram] Sending PDF to chat_id: ${chat_id}`);
    console.log(`[Telegram] Note: ${note_title}`);

    // Download PDF from ImageKit
    const pdfResponse = await fetch(pdf_url);
    if (!pdfResponse.ok) {
      throw new Error(`Failed to download PDF: ${pdfResponse.statusText}`);
    }

    const pdfBlob = await pdfResponse.blob();
    const pdfSize = pdfBlob.size;

    // Check file size limit (50 MB)
    if (pdfSize > 50 * 1024 * 1024) {
      throw new Error("PDF file size exceeds Telegram limit (50 MB)");
    }

    // Prepare form data
    const formData = new FormData();
    formData.append("chat_id", chat_id);
    formData.append("document", pdfBlob, `${sanitizeFilename(note_title)}.pdf`);

    const caption = generateCaption(note_title, note_id);
    formData.append("caption", caption);
    formData.append("parse_mode", "Markdown");

    // Send to Telegram
    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`;
    const telegramResponse = await fetch(telegramApiUrl, {
      method: "POST",
      body: formData,
    });

    const telegramData: TelegramResponse = await telegramResponse.json();

    if (!telegramData.ok) {
      throw new Error(`Telegram API error: ${telegramData.description || "Unknown error"}`);
    }

    console.log("[Telegram] PDF sent successfully!");

    return new Response(
      JSON.stringify({
        success: true,
        message: "PDF sent to Telegram successfully",
        message_id: telegramData.result?.message_id,
        file_size: pdfSize,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[Telegram] Error:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function generateCaption(noteTitle: string, noteId?: string): string {
  const lines: string[] = [];
  lines.push("📚 *Catatan Kajian*");
  lines.push("");
  lines.push(`*${escapeMarkdown(noteTitle)}*`);
  lines.push("");
  if (noteId) {
    lines.push(`ID: \`${noteId}\``);
    lines.push("");
  }
  lines.push("━━━━━━━━━━━━━━━");
  lines.push("_by Alwaah_");
  return lines.join("\n");
}

function escapeMarkdown(text: string): string {
  return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, "\\$1");
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .substring(0, 50);
}
```

**Deployment:**

```bash
supabase functions deploy send-telegram
```

---

### 4. `telegram-webhook`

**Purpose:** Handle Telegram bot commands and verify users

**Complete Code:**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const update = await req.json();

    const message = update.message;
    if (!message || !message.text) {
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    const chatId = message.chat.id;
    const text = message.text;

    // Handle /start command
    if (text === "/start") {
      await sendTelegramMessage(chatId, getStartMessage());
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    // Handle /verify command
    if (text.startsWith("/verify ")) {
      const kajianUsername = text.replace("/verify ", "").trim();

      const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

      const { data: user, error } = await supabase
        .from("users")
        .select("id, username, full_name")
        .eq("username", kajianUsername)
        .single();

      if (error || !user) {
        await sendTelegramMessage(
          chatId,
          `❌ Username "${kajianUsername}" tidak ditemukan.\n\nPastikan username Anda benar.`
        );
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      const { error: updateError } = await supabase
        .from("users")
        .update({
          telegram_chat_id: chatId.toString(),
          telegram_verified_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        await sendTelegramMessage(chatId, "❌ Gagal verifikasi. Silakan coba lagi.");
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      await sendTelegramMessage(
        chatId,
        `✅ Verifikasi Berhasil!\n\n` +
          `Username: ${user.username}\n` +
          `Nama: ${user.full_name}\n` +
          `Chat ID: ${chatId}\n\n` +
          `Anda sekarang dapat menerima PDF catatan dari Alwaah!`
      );

      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    // Handle /help command
    if (text === "/help") {
      await sendTelegramMessage(chatId, getHelpMessage());
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    // Handle /status command
    if (text === "/status") {
      const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

      const { data: user } = await supabase
        .from("users")
        .select("username, full_name, telegram_verified_at")
        .eq("telegram_chat_id", chatId.toString())
        .single();

      if (!user) {
        await sendTelegramMessage(chatId, "❌ Anda belum verifikasi.\n\nGunakan /verify username_anda");
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      await sendTelegramMessage(
        chatId,
        `📊 Status Verifikasi\n\n` +
          `✅ Status: Terverifikasi\n` +
          `👤 Username: ${user.username}\n` +
          `💬 Chat ID: ${chatId}\n` +
          `📅 Diverifikasi: ${new Date(user.telegram_verified_at).toLocaleDateString("id-ID")}`
      );

      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function sendTelegramMessage(chatId: number, text: string) {
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
    }),
  });
}

function getStartMessage(): string {
  return (
    `👋 Selamat datang di Alwaah Bot!\n\n` +
    `Bot ini digunakan untuk menerima PDF catatan kajian Anda langsung di Telegram.\n\n` +
    `📝 Cara Verifikasi:\n` +
    `1. Login ke Alwaah (kajiannote.com)\n` +
    `2. Buka halaman Profil\n` +
    `3. Catat username Anda\n` +
    `4. Kirim perintah:\n` +
    `   /verify username_anda\n\n` +
    `Contoh:\n` +
    `/verify derrypratama\n\n` +
    `💡 Butuh bantuan? Kirim /help`
  );
}

function getHelpMessage(): string {
  return (
    `📖 Panduan Penggunaan Alwaah Bot\n\n` +
    `📝 Verifikasi Akun:\n` +
    `/verify username_anda\n\n` +
    `📊 Cek Status:\n` +
    `/status\n\n` +
    `❓ FAQ:\n\n` +
    `Q: Kenapa harus verifikasi?\n` +
    `A: Untuk menghubungkan akun Alwaah Anda dengan Telegram.\n\n` +
    `Q: Apakah aman?\n` +
    `A: Ya! Kami hanya menyimpan Chat ID Telegram Anda.\n\n` +
    `━━━━━━━━━━━━━━━\n` +
    `Butuh bantuan lebih lanjut?\n` +
    `Hubungi: support@kajiannote.com`
  );
}
```

**Deployment:**

```bash
supabase functions deploy telegram-webhook

# Set webhook URL
curl -X POST https://api.telegram.org/bot{BOT_TOKEN}/setWebhook \
  -d url=https://rewtyutkcixrmporoomn.supabase.co/functions/v1/telegram-webhook
```

**Test Manually:**

1. Open Telegram and search for your bot
2. Send `/start` - should receive welcome message
3. Send `/verify your_username` - should verify and confirm
4. Send `/status` - should show verification status
5. Send `/help` - should show help message

---

## Setup Instructions

### 1. Create Supabase Project

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref rewtyutkcixrmporoomn
```

### 2. Run Migrations

```bash
# Create tables
supabase db push

# Or run SQL directly in Supabase Dashboard
# Copy from schema sections above
```

### 3. Set Secrets

```bash
# Set Edge Function secrets
supabase secrets set TELEGRAM_BOT_TOKEN=your_token
supabase secrets set IMAGEKIT_PRIVATE_KEY=your_key
supabase secrets set LYNK_WEBHOOK_SECRET=your_secret
supabase secrets set API2PDF_API_KEY=your_key
```

### 4. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy imagekit-cleanup
supabase functions deploy lynk-webhook
supabase functions deploy send-telegram
supabase functions deploy telegram-webhook
```

### 5. Setup Cron Jobs

In Supabase Dashboard → Database → Cron:

```sql
-- Run imagekit-cleanup every hour
SELECT cron.schedule(
  'imagekit-cleanup',
  '0 * * * *', -- Every hour at :00
  $$
  SELECT net.http_post(
    url := 'https://rewtyutkcixrmporoomn.supabase.co/functions/v1/imagekit-cleanup',
    headers := '{"Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
  ) AS request_id;
  $$
);
```

### 6. Test Setup

```bash
# Test database connection
supabase db ping

# Test Edge Function
curl -X POST https://rewtyutkcixrmporoomn.supabase.co/functions/v1/imagekit-cleanup \
  -H "Authorization: Bearer YOUR_SERVICE_KEY"

# Test webhook
curl -X POST https://rewtyutkcixrmporoomn.supabase.co/functions/v1/lynk-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

## Backup & Recovery

### Backup Database

```bash
# Export schema + data
supabase db dump -f backup.sql

# Export schema only
supabase db dump --schema-only -f schema.sql
```

### Restore Database

```bash
# Restore from backup
supabase db reset --db-url "postgresql://..." < backup.sql
```

---

## Monitoring & Maintenance

### Database Monitoring

- **Dashboard:** Supabase → Database → Performance
- **Metrics:** Query performance, table sizes, index usage
- **Logs:** Supabase → Logs → Database

### Edge Function Logs

```bash
# View logs
supabase functions logs imagekit-cleanup
supabase functions logs lynk-webhook
```

### Health Checks

- Check expired files cleanup: Query `imagekit_temp_uploads` where `deleted_at IS NOT NULL`
- Check webhook processing: Query `payment_webhooks` where `processed = true`
- Check subscription status: Query `users` where `subscription_status = 'active'`

---

## Troubleshooting

### Common Issues

**1. RLS Policy Blocking Query**

```sql
-- Temporarily disable for testing
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
-- Re-enable after testing
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
```

**2. Edge Function Timeout**

- Increase timeout in function config
- Optimize database queries
- Use pagination for large datasets

**3. Webhook Not Received**

- Check webhook URL in Lynk.id dashboard
- Verify Edge Function is deployed
- Check Edge Function logs for errors

**4. Telegram Bot Not Responding**

- Verify bot token in secrets
- Check webhook URL is set correctly
- Test bot manually with `/start` command

---

## Security Best Practices

1. **Never expose service role key** in frontend
2. **Always use RLS policies** for user data
3. **Validate webhook signatures** from external services
4. **Use prepared statements** to prevent SQL injection
5. **Rotate secrets regularly** (bot tokens, API keys)
6. **Monitor Edge Function logs** for suspicious activity
7. **Implement rate limiting** on public endpoints
8. **Use HTTPS only** for all API calls

---

**End of Supabase Setup & SQL Schema Documentation**
