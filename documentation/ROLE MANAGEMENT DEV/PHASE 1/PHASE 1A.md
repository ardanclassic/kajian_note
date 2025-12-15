# Multi-Role Authentication Migration Guide

## 📋 Overview

This guide will walk you through the complete migration process for implementing multi-role authentication system in Kajian Note.

**Migration includes:**

- ✅ Multi-role auth (Admin, Panitia, Ustadz, Member)
- ✅ Approval workflow for role requests
- ✅ Admin invite system
- ✅ Bulk note sharing infrastructure
- ✅ Role-based feature flags
- ✅ Extended ImageKit retention

**Estimated time:** 30-60 minutes (including testing)  
**Downtime:** Minimal (5-10 minutes for migration execution)

---

## ⚠️ Pre-Migration Checklist

### 1. Backup Database (CRITICAL!)

**Option A: Via Supabase Dashboard**

```
1. Go to Supabase Dashboard
2. Database → Backups
3. Click "Backup Now"
4. Wait for completion
5. Download backup file (optional but recommended)
```

**Option B: Via Command Line**

```bash
# If you have Supabase CLI installed
supabase db dump > backup_$(date +%Y%m%d_%H%M%S).sql

# Or via pg_dump (if you have direct access)
pg_dump -h your-host -U postgres -d postgres > backup.sql
```

**✅ VERIFY:** Backup file exists and is non-empty

---

### 2. Verify Current State

Run these queries in Supabase SQL Editor:

```sql
-- Check existing users count
SELECT role, COUNT(*) FROM users GROUP BY role;
-- Expected: 3 members

-- Check existing tables
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- Should NOT include: role_requests, admin_invites, note_shares, etc.

-- Check users table columns
SELECT column_name FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
-- Should NOT include: approval_status, approved_by, etc.
```

**✅ VERIFY:** Results match expected state

---

### 3. Notify Team (if applicable)

```
Subject: Database Migration - Multi-Role Auth
Time: [Your scheduled time]
Duration: 10 minutes
Impact: Brief downtime for schema changes
Action needed: None (will notify when complete)
```

---

### 4. Prepare Environment

- [ ] Supabase Dashboard open
- [ ] SQL Editor tab ready
- [ ] Migration SQL file ready to copy
- [ ] Rollback SQL file ready (just in case)
- [ ] This guide open for reference
- [ ] Coffee ready ☕ (optional but recommended)

---

## 🚀 Migration Execution

### Step 1: Open SQL Editor

```
1. Go to Supabase Dashboard
2. Click "SQL Editor" in left sidebar
3. Click "New query"
4. Name it: "Multi-Role Auth Migration"
```

### Step 2: Copy Migration SQL

```
1. Open file: 20250113_multi_role_complete.sql
2. Select ALL (Ctrl+A / Cmd+A)
3. Copy (Ctrl+C / Cmd+C)
4. Paste into SQL Editor (Ctrl+V / Cmd+V)
```

### Step 3: Review Before Running

**Quick checks:**

- [ ] SQL starts with `BEGIN;`
- [ ] SQL ends with `COMMIT;`
- [ ] No obvious typos
- [ ] File size looks right (~850 lines)

### Step 4: Execute Migration

```
1. Click "Run" button (or F5)
2. Wait for execution (30-60 seconds)
3. Watch for NOTICE messages in output
4. Look for "MIGRATION COMPLETED SUCCESSFULLY!"
```

**Expected output (last lines):**

```
MIGRATION COMPLETED SUCCESSFULLY!
Summary:
- ✅ Altered users table (5 new columns)
- ✅ Added panitia subscription tiers
- ✅ Created 5 new tables
- ✅ Created 23 indexes
- ✅ Created 3 triggers
- ✅ Inserted role_features data
- ✅ Updated existing users
- ✅ Created 18 RLS policies
- ✅ Granted permissions
```

### Step 5: Handle Errors (if any)

**If you see an error:**

1. **DON'T PANIC** - Transaction will auto-rollback
2. Copy the error message
3. Check common issues below
4. Fix the issue
5. Re-run migration

**Common errors:**

**Error:** `relation "role_requests" already exists`  
**Cause:** Migration was run before  
**Solution:** Skip this section or drop table first

**Error:** `column "approval_status" already exists`  
**Cause:** Partial migration ran before  
**Solution:** Run rollback.sql first, then retry

**Error:** `constraint "users_subscription_tier_check" already exists`  
**Cause:** Constraint conflict  
**Solution:** Check existing constraint, adjust migration

---

## ✅ Post-Migration Verification

### Verification Queries

Run these queries to verify migration success:

#### 1. Check New Tables Created

```sql
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('role_requests', 'admin_invites', 'note_shares',
                  'note_share_batches', 'role_features')
ORDER BY tablename;
```

**Expected:** 5 rows

---

#### 2. Check New Columns in Users Table

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('approval_status', 'approved_by', 'approved_at',
                    'invite_code', 'status')
ORDER BY column_name;
```

**Expected:** 5 rows

---

#### 3. Check Existing Users Updated

```sql
SELECT
  username,
  role,
  approval_status,
  status,
  approved_at IS NOT NULL as has_approved_at
FROM users
ORDER BY created_at;
```

**Expected:** All 3 users with `approval_status = 'approved'` and `status = 'active'`

---

#### 4. Check Role Features Populated

```sql
SELECT
  role,
  subscription_tier,
  COUNT(*) as feature_count
FROM role_features
GROUP BY role, subscription_tier
ORDER BY role, subscription_tier;
```

**Expected:** Multiple rows showing feature configs for each role+tier combination

---

#### 5. Check Indexes Created

```sql
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('role_requests', 'admin_invites', 'note_shares',
                  'note_share_batches', 'role_features', 'users')
AND indexname LIKE 'idx_%'
ORDER BY indexname;
```

**Expected:** 23+ indexes

---

#### 6. Check RLS Policies Active

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  cmd as command
FROM pg_policies
WHERE tablename IN ('role_requests', 'admin_invites', 'note_shares',
                    'note_share_batches', 'role_features')
ORDER BY tablename, policyname;
```

**Expected:** 18 policies across 5 tables

---

#### 7. Check Triggers Created

```sql
SELECT
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name IN (
  'trigger_update_role_requests_updated_at',
  'trigger_update_role_features_updated_at',
  'trigger_log_user_role_change'
)
ORDER BY event_object_table;
```

**Expected:** 3 triggers

---

### Quick Sanity Test

```sql
-- Test 1: Can query new tables
SELECT COUNT(*) FROM role_requests;
SELECT COUNT(*) FROM admin_invites;
SELECT COUNT(*) FROM note_shares;
SELECT COUNT(*) FROM role_features;

-- Test 2: Role features lookup works
SELECT feature_value
FROM role_features
WHERE role = 'member'
  AND subscription_tier = 'free'
  AND feature_key = 'max_notes';
-- Expected: {"limit": 10}

-- Test 3: Users approval status set
SELECT approval_status, COUNT(*)
FROM users
GROUP BY approval_status;
-- Expected: 3 users with 'approved'
```

---

## 🧪 Functional Testing

### Test 1: Member Registration (Existing Flow)

This should still work unchanged:

```
1. Go to register page
2. Enter: Full Name, Username, PIN
3. Submit
4. Should auto-create account
5. Verify in database:
```

```sql
SELECT username, role, approval_status, status
FROM users
WHERE username = 'testuser123';
-- Expected: role='member', approval_status='approved', status='active'
```

---

### Test 2: Role Request Creation

**Scenario:** Member requests Panitia role

```sql
-- First, get a test user ID
SELECT id FROM users WHERE role = 'member' LIMIT 1;

-- Create role request (replace USER_ID with actual ID)
INSERT INTO role_requests (user_id, requested_role, reason)
VALUES ('USER_ID', 'panitia', 'Saya ingin menjadi panitia untuk berbagi catatan');

-- Verify created
SELECT * FROM role_requests ORDER BY created_at DESC LIMIT 1;
```

**Expected:** Request created with `status = 'pending'`

---

### Test 3: Admin Invite Creation

**Scenario:** Admin creates invite for new Panitia

```sql
-- Get admin user (you might need to create one first)
UPDATE users SET role = 'admin' WHERE username = 'derrypratama';

-- Create invite (replace ADMIN_ID with actual admin user ID)
INSERT INTO admin_invites (email, role, invited_by)
VALUES ('newpanitia@example.com', 'panitia', 'ADMIN_ID');

-- Verify created
SELECT invite_code, email, role, status, expires_at
FROM admin_invites
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:** Invite created with `status = 'pending'` and 7-day expiry

---

### Test 4: Note Sharing

**Scenario:** Panitia shares note to member

```sql
-- First, ensure you have a panitia user
UPDATE users SET role = 'panitia' WHERE id = 'SOME_USER_ID';

-- Get note ID and user IDs
SELECT id FROM notes LIMIT 1; -- Get a note
SELECT id FROM users WHERE role = 'member' LIMIT 1; -- Get a member

-- Create share (replace IDs)
INSERT INTO note_shares (note_id, shared_by, shared_to)
VALUES ('NOTE_ID', 'PANITIA_USER_ID', 'MEMBER_USER_ID');

-- Verify
SELECT * FROM note_shares ORDER BY shared_at DESC LIMIT 1;
```

**Expected:** Share created successfully

---

### Test 5: Role Features Lookup

**Scenario:** Check feature limits for different roles

```sql
-- Member free tier
SELECT feature_key, feature_value
FROM role_features
WHERE role = 'member' AND subscription_tier = 'free';

-- Panitia free tier
SELECT feature_key, feature_value
FROM role_features
WHERE role = 'panitia' AND subscription_tier = 'free';

-- Compare max_notes
SELECT
  role,
  subscription_tier,
  feature_value->>'limit' as max_notes
FROM role_features
WHERE feature_key = 'max_notes'
ORDER BY role, subscription_tier;
```

**Expected:** Different limits per role/tier

---

## 🔧 Edge Cases to Test

### Test 6: Duplicate Role Request Prevention

```sql
-- Try to create second pending request for same user
INSERT INTO role_requests (user_id, requested_role, reason)
VALUES ('SAME_USER_ID', 'ustadz', 'Second request');
```

**Expected:** ERROR - unique constraint violation  
**Why:** Only 1 pending request allowed per user

---

### Test 7: Expired Invite Code

```sql
-- Create invite with past expiry
INSERT INTO admin_invites (email, role, invited_by, expires_at)
VALUES ('test@example.com', 'panitia', 'ADMIN_ID', NOW() - INTERVAL '1 day');

-- Try to use expired invite (should fail in app logic)
SELECT * FROM admin_invites
WHERE invite_code = 'SOME_CODE'
  AND status = 'pending'
  AND expires_at > NOW();
```

**Expected:** No results (invite expired)

---

### Test 8: RLS Policy Check

Test as non-admin user:

```sql
-- Set session to member user
SET request.jwt.claims = '{"role": "authenticated", "sub": "MEMBER_AUTH_USER_ID"}';

-- Try to view all role requests (should only see own)
SELECT * FROM role_requests;

-- Try to update role request (should fail)
UPDATE role_requests SET status = 'approved' WHERE id = 'SOME_ID';
```

**Expected:** Can only see own requests, cannot approve

---

## 🛠️ Troubleshooting

### Issue: Migration hangs/takes too long

**Possible causes:**

- Active connections blocking
- Large dataset
- Slow database

**Solution:**

1. Check active connections in Supabase Dashboard
2. Wait for migration to complete (up to 5 minutes is normal)
3. If >5 minutes, cancel and check logs

---

### Issue: RLS policies blocking queries

**Symptoms:** Queries return empty results unexpectedly

**Solution:**

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('role_requests', 'admin_invites');

-- Temporarily disable for testing (NOT in production!)
ALTER TABLE role_requests DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing
ALTER TABLE role_requests ENABLE ROW LEVEL SECURITY;
```

---

### Issue: Existing users not updated

**Symptoms:** Users still have NULL approval_status

**Solution:**

```sql
-- Manually update existing users
UPDATE users
SET
  approval_status = 'approved',
  status = 'active',
  approved_at = created_at
WHERE approval_status IS NULL;
```

---

### Issue: Constraint violation on subscription_tier

**Symptoms:** Cannot update user to panitia_basic tier

**Solution:**

```sql
-- Verify constraint allows panitia tiers
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'users_subscription_tier_check';

-- Should include 'panitia_basic' and 'panitia_pro'
```

---

## 🔄 Rollback Procedure

**If migration fails or you need to revert:**

### Step 1: Open Rollback Script

```
1. Open rollback.sql
2. Copy entire content
3. Paste into Supabase SQL Editor
```

### Step 2: Execute Rollback

```
1. Click "Run"
2. Wait for completion (10-20 seconds)
3. Verify success message
```

### Step 3: Verify Rollback

```sql
-- Check new tables are gone
SELECT tablename FROM pg_tables
WHERE tablename IN ('role_requests', 'admin_invites', 'note_shares');
-- Expected: 0 rows

-- Check columns removed from users
SELECT column_name FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('approval_status', 'status');
-- Expected: 0 rows
```

---

## 📝 Next Steps After Migration

### 1. Update Edge Functions

**Files to update:**

- `imagekit-cleanup.ts` - Add role-based retention logic
- (Others as needed based on your implementation)

See `service_updates.md` for details.

---

### 2. Update Frontend Code

**New TypeScript types needed:**

- `RoleRequest`
- `AdminInvite`
- `NoteShare`
- `NoteShareBatch`
- `RoleFeature`

See `typescript_types.ts` for complete definitions.

---

### 3. Implement New Features

**Priority order:**

1. ✅ Admin panel for role approvals
2. ✅ Role request form (member → panitia)
3. ✅ Invite link generation (admin)
4. ✅ Bulk note sharing UI (panitia)
5. ✅ Feature limits checking (subscription)

---

### 4. Create Admin User

```sql
-- Promote existing user to admin
UPDATE users
SET role = 'admin',
    approval_status = 'approved',
    status = 'active'
WHERE username = 'YOUR_USERNAME';
```

---

## ✅ Success Criteria

Migration is successful when:

- [x] All verification queries pass
- [x] No errors in SQL execution
- [x] 5 new tables created
- [x] 23+ indexes created
- [x] 18 RLS policies active
- [x] 3 triggers created
- [x] Role features data populated
- [x] Existing users updated to 'approved'
- [x] Existing app functionality still works
- [x] Backup is safe and accessible

---

## 📞 Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review error messages carefully
3. Check Supabase logs in Dashboard
4. Use rollback.sql if needed
5. Re-run migration after fixing issues

---

## 🎉 Congratulations!

If all checks pass, your database is now ready for multi-role authentication!

**Next steps:** Start implementing frontend features! 🚀
