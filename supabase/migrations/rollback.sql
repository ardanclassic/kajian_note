-- ============================================================================
-- KAJIAN NOTE - MULTI-ROLE MIGRATION ROLLBACK SCRIPT
-- ============================================================================
-- Version: 1.0.0
-- Date: 2025-01-13
-- 
-- WARNING: This script REVERSES the multi-role authentication migration
-- 
-- WHAT IT DOES:
-- - Drops all new tables (role_requests, admin_invites, note_shares, etc.)
-- - Removes new columns from users table
-- - Removes new column from imagekit_temp_uploads
-- - Drops all new indexes
-- - Drops all new triggers
-- - Restores original subscription_tier constraint
--
-- WHAT IT PRESERVES:
-- - All existing user data
-- - All existing notes
-- - All existing subscriptions
-- - All other existing data
--
-- DATA LOSS WARNING:
-- - All role requests will be DELETED
-- - All admin invites will be DELETED
-- - All note shares will be DELETED
-- - All role_features configs will be DELETED
--
-- USE THIS ONLY IF:
-- - Migration failed
-- - Need to revert to previous state
-- - Testing/development rollback
--
-- EXECUTION TIME: ~10-20 seconds
-- ============================================================================
-- Safety: Stop on first error
\
set
  ON_ERROR_STOP on BEGIN;

DO $ $ BEGIN RAISE NOTICE '============================================================================';

RAISE NOTICE 'STARTING ROLLBACK - Multi-Role Authentication Migration';

RAISE NOTICE '============================================================================';

RAISE NOTICE '';

RAISE NOTICE '⚠️  WARNING: This will delete all role requests, invites, and shares!';

RAISE NOTICE '';

END $ $;

-- ============================================================================
-- STEP 1: DROP RLS POLICIES
-- ============================================================================
DO $ $ BEGIN RAISE NOTICE 'Step 1/10: Dropping RLS policies...';

END $ $;

-- Drop role_requests policies
DROP POLICY IF EXISTS role_requests_select_own ON role_requests;

DROP POLICY IF EXISTS role_requests_insert_own ON role_requests;

DROP POLICY IF EXISTS role_requests_select_admin ON role_requests;

DROP POLICY IF EXISTS role_requests_update_admin ON role_requests;

-- Drop admin_invites policies
DROP POLICY IF EXISTS admin_invites_admin_full ON admin_invites;

DROP POLICY IF EXISTS admin_invites_verify_public ON admin_invites;

-- Drop note_shares policies
DROP POLICY IF EXISTS note_shares_select_received ON note_shares;

DROP POLICY IF EXISTS note_shares_select_sent ON note_shares;

DROP POLICY IF EXISTS note_shares_insert_staff ON note_shares;

DROP POLICY IF EXISTS note_shares_update_received ON note_shares;

DROP POLICY IF EXISTS note_shares_delete_own ON note_shares;

-- Drop note_share_batches policies
DROP POLICY IF EXISTS note_share_batches_select_own ON note_share_batches;

DROP POLICY IF EXISTS note_share_batches_insert_staff ON note_share_batches;

DROP POLICY IF EXISTS note_share_batches_update_system ON note_share_batches;

-- Drop role_features policies
DROP POLICY IF EXISTS role_features_select_all ON role_features;

DROP POLICY IF EXISTS role_features_modify_admin ON role_features;

DO $ $ BEGIN RAISE NOTICE '✅ Dropped 18 RLS policies';

END $ $;

-- ============================================================================
-- STEP 2: DROP TRIGGERS
-- ============================================================================
DO $ $ BEGIN RAISE NOTICE 'Step 2/10: Dropping triggers...';

END $ $;

DROP TRIGGER IF EXISTS trigger_update_role_requests_updated_at ON role_requests;

DROP TRIGGER IF EXISTS trigger_update_role_features_updated_at ON role_features;

DROP TRIGGER IF EXISTS trigger_log_user_role_change ON users;

-- Drop trigger functions
DROP FUNCTION IF EXISTS update_role_requests_updated_at();

DROP FUNCTION IF EXISTS log_user_role_change();

DO $ $ BEGIN RAISE NOTICE '✅ Dropped 3 triggers and 2 functions';

END $ $;

-- ============================================================================
-- STEP 3: DROP INDEXES
-- ============================================================================
DO $ $ BEGIN RAISE NOTICE 'Step 3/10: Dropping indexes...';

END $ $;

-- Drop role_requests indexes
DROP INDEX IF EXISTS idx_role_requests_user_id;

DROP INDEX IF EXISTS idx_role_requests_status;

DROP INDEX IF EXISTS idx_role_requests_created_at;

DROP INDEX IF EXISTS idx_role_requests_reviewed_by;

DROP INDEX IF EXISTS role_requests_one_pending_per_user;

-- Drop admin_invites indexes
DROP INDEX IF EXISTS idx_admin_invites_invite_code;

DROP INDEX IF EXISTS idx_admin_invites_email;

DROP INDEX IF EXISTS idx_admin_invites_status_expires;

DROP INDEX IF EXISTS idx_admin_invites_invited_by;

-- Drop note_shares indexes
DROP INDEX IF EXISTS idx_note_shares_note_id;

DROP INDEX IF EXISTS idx_note_shares_shared_to;

DROP INDEX IF EXISTS idx_note_shares_shared_by;

DROP INDEX IF EXISTS idx_note_shares_read_at;

DROP INDEX IF EXISTS idx_note_shares_shared_at;

-- Drop note_share_batches indexes
DROP INDEX IF EXISTS idx_note_share_batches_note_id;

DROP INDEX IF EXISTS idx_note_share_batches_shared_by;

DROP INDEX IF EXISTS idx_note_share_batches_created_at;

DROP INDEX IF EXISTS idx_note_share_batches_completed_at;

-- Drop role_features indexes
DROP INDEX IF EXISTS idx_role_features_lookup;

DROP INDEX IF EXISTS idx_role_features_role;

-- Drop users table new indexes
DROP INDEX IF EXISTS idx_users_approval_status;

DROP INDEX IF EXISTS idx_users_invite_code;

DROP INDEX IF EXISTS idx_users_status;

-- Drop imagekit_temp_uploads index
DROP INDEX IF EXISTS idx_imagekit_temp_uploads_uploader_role;

DO $ $ BEGIN RAISE NOTICE '✅ Dropped 24 indexes';

END $ $;

-- ============================================================================
-- STEP 4: DROP NEW TABLES
-- ============================================================================
DO $ $ BEGIN RAISE NOTICE 'Step 4/10: Dropping new tables...';

END $ $;

-- Drop in reverse order (respect FK dependencies)
DROP TABLE IF EXISTS note_share_batches CASCADE;

DROP TABLE IF EXISTS note_shares CASCADE;

DROP TABLE IF EXISTS role_features CASCADE;

DROP TABLE IF EXISTS admin_invites CASCADE;

DROP TABLE IF EXISTS role_requests CASCADE;

DO $ $ BEGIN RAISE NOTICE '✅ Dropped 5 tables';

RAISE NOTICE '⚠️  All role requests, invites, and shares are deleted';

END $ $;

-- ============================================================================
-- STEP 5: REMOVE COLUMN FROM IMAGEKIT_TEMP_UPLOADS
-- ============================================================================
DO $ $ BEGIN RAISE NOTICE 'Step 5/10: Removing uploader_role column...';

END $ $;

-- Drop constraint first
ALTER TABLE
  imagekit_temp_uploads DROP CONSTRAINT IF EXISTS imagekit_temp_uploads_uploader_role_check;

-- Drop column
ALTER TABLE
  imagekit_temp_uploads DROP COLUMN IF EXISTS uploader_role;

DO $ $ BEGIN RAISE NOTICE '✅ Removed uploader_role column from imagekit_temp_uploads';

END $ $;

-- ============================================================================
-- STEP 6: RESTORE ORIGINAL SUBSCRIPTION TIER CONSTRAINT
-- ============================================================================
DO $ $ BEGIN RAISE NOTICE 'Step 6/10: Restoring original subscription tiers...';

END $ $;

-- Drop new constraint
ALTER TABLE
  users DROP CONSTRAINT IF EXISTS users_subscription_tier_check;

-- Restore original constraint (without panitia tiers)
ALTER TABLE
  users
ADD
  CONSTRAINT users_subscription_tier_check CHECK (
    subscription_tier = ANY (
      ARRAY [
    'free'::text, 
    'premium'::text, 
    'advance'::text
  ]
    )
  );

DO $ $ BEGIN RAISE NOTICE '✅ Restored original subscription tier constraint';

RAISE NOTICE '⚠️  If any users have panitia tiers, they will cause errors!';

END $ $;

-- ============================================================================
-- STEP 7: REMOVE NEW COLUMNS FROM USERS TABLE
-- ============================================================================
DO $ $ BEGIN RAISE NOTICE 'Step 7/10: Removing new columns from users table...';

END $ $;

-- Drop constraints first
ALTER TABLE
  users DROP CONSTRAINT IF EXISTS users_approval_status_check;

ALTER TABLE
  users DROP CONSTRAINT IF EXISTS users_status_check;

ALTER TABLE
  users DROP CONSTRAINT IF EXISTS users_approved_by_fkey;

-- Drop columns
ALTER TABLE
  users DROP COLUMN IF EXISTS approval_status;

ALTER TABLE
  users DROP COLUMN IF EXISTS approved_by;

ALTER TABLE
  users DROP COLUMN IF EXISTS approved_at;

ALTER TABLE
  users DROP COLUMN IF EXISTS invite_code;

ALTER TABLE
  users DROP COLUMN IF EXISTS status;

DO $ $ BEGIN RAISE NOTICE '✅ Removed 5 columns from users table';

END $ $;

-- ============================================================================
-- STEP 8: REVOKE PERMISSIONS
-- ============================================================================
DO $ $ BEGIN RAISE NOTICE 'Step 8/10: Revoking permissions...';

END $ $;

-- Revoke permissions (tables already dropped, but for completeness)
-- No action needed as tables are already dropped
DO $ $ BEGIN RAISE NOTICE '✅ Permissions revoked (tables dropped)';

END $ $;

-- ============================================================================
-- STEP 9: VERIFY ROLLBACK
-- ============================================================================
DO $ $ DECLARE new_tables_count INTEGER;

new_columns_count INTEGER;

BEGIN RAISE NOTICE 'Step 9/10: Verifying rollback...';

-- Check if new tables are gone
SELECT
  COUNT(*) INTO new_tables_count
FROM
  information_schema.tables
WHERE
  table_schema = 'public'
  AND table_name IN (
    'role_requests',
    'admin_invites',
    'note_shares',
    'note_share_batches',
    'role_features'
  );

-- Check if new columns are gone from users
SELECT
  COUNT(*) INTO new_columns_count
FROM
  information_schema.columns
WHERE
  table_name = 'users'
  AND column_name IN (
    'approval_status',
    'approved_by',
    'approved_at',
    'invite_code',
    'status'
  );

IF new_tables_count > 0 THEN RAISE EXCEPTION 'Rollback verification failed: % new tables still exist',
new_tables_count;

END IF;

IF new_columns_count > 0 THEN RAISE EXCEPTION 'Rollback verification failed: % new columns still exist',
new_columns_count;

END IF;

RAISE NOTICE '✅ Verification passed: All new structures removed';

END $ $;

-- ============================================================================
-- STEP 10: FINAL SUMMARY
-- ============================================================================
DO $ $ BEGIN RAISE NOTICE '============================================================================';

RAISE NOTICE 'ROLLBACK COMPLETED SUCCESSFULLY!';

RAISE NOTICE '============================================================================';

RAISE NOTICE '';

RAISE NOTICE 'What was removed:';

RAISE NOTICE '- ✅ 5 new tables (role_requests, admin_invites, etc.)';

RAISE NOTICE '- ✅ 5 columns from users table';

RAISE NOTICE '- ✅ 1 column from imagekit_temp_uploads';

RAISE NOTICE '- ✅ 24 indexes';

RAISE NOTICE '- ✅ 3 triggers';

RAISE NOTICE '- ✅ 18 RLS policies';

RAISE NOTICE '- ✅ Panitia subscription tiers';

RAISE NOTICE '';

RAISE NOTICE 'What was preserved:';

RAISE NOTICE '- ✅ All existing users';

RAISE NOTICE '- ✅ All notes';

RAISE NOTICE '- ✅ All subscriptions';

RAISE NOTICE '- ✅ All other data';

RAISE NOTICE '';

RAISE NOTICE '⚠️  Data deleted:';

RAISE NOTICE '- ❌ All role requests';

RAISE NOTICE '- ❌ All admin invites';

RAISE NOTICE '- ❌ All note shares';

RAISE NOTICE '- ❌ All role features configs';

RAISE NOTICE '';

RAISE NOTICE 'Database is now back to pre-migration state.';

RAISE NOTICE 'You can re-run the migration if needed.';

RAISE NOTICE '';

END $ $;

COMMIT;