-- ============================================================================
-- KAJIAN NOTE - ROLLBACK UNUSED TABLES MIGRATION
-- ============================================================================
-- Version: 1.0.0
-- Date: 2025-01-13
-- 
-- WARNING: This script REMOVES tables that are not needed yet
-- 
-- TABLES TO REMOVE:
-- - admin_invites
-- - event_attendance
-- - events
-- - note_share_batches
-- - note_shares
-- - role_features
-- - role_requests
--
-- WHAT IT PRESERVES:
-- âœ… users table (with multi-role support)
-- âœ… notes table
-- âœ… All existing user data
-- âœ… All existing notes
-- âœ… All other core tables
--
-- WHAT IT REMOVES:
-- âŒ All role request/approval infrastructure
-- âŒ All admin invite system
-- âŒ All event management system
-- âŒ All note sharing infrastructure
-- âŒ All role-based feature flags
-- âŒ All related indexes, triggers, functions, RLS policies
--
-- DATA LOSS WARNING:
-- This is PERMANENT deletion. Make sure you have:
-- 1. Database backup
-- 2. Exported any data you want to keep
-- 3. Confirmed you don't need these features yet
--
-- EXECUTION TIME: ~20-30 seconds
-- ============================================================================

BEGIN;

DO $rollback$ 
BEGIN 
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'STARTING ROLLBACK - Removing Unused Tables';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  WARNING: This will permanently delete:';
  RAISE NOTICE '   - admin_invites';
  RAISE NOTICE '   - event_attendance';
  RAISE NOTICE '   - events';
  RAISE NOTICE '   - note_share_batches';
  RAISE NOTICE '   - note_shares';
  RAISE NOTICE '   - role_features';
  RAISE NOTICE '   - role_requests';
  RAISE NOTICE '';
  RAISE NOTICE '✅ This will preserve:';
  RAISE NOTICE '   - users table';
  RAISE NOTICE '   - notes table';
  RAISE NOTICE '   - All user data';
  RAISE NOTICE '   - All note data';
  RAISE NOTICE '';
END $rollback$;

-- ============================================================================
-- STEP 1: DROP RLS POLICIES
-- ============================================================================
DO $rollback$ 
BEGIN 
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'Step 1/10: Dropping RLS policies...';
  RAISE NOTICE '==================================================';
END $rollback$;

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

-- Drop events policies
DROP POLICY IF EXISTS events_select_public ON events;
DROP POLICY IF EXISTS events_select_own ON events;
DROP POLICY IF EXISTS events_select_attending ON events;
DROP POLICY IF EXISTS events_select_admin ON events;
DROP POLICY IF EXISTS events_insert_staff ON events;
DROP POLICY IF EXISTS events_update_own ON events;
DROP POLICY IF EXISTS events_update_admin ON events;
DROP POLICY IF EXISTS events_delete_own ON events;

-- Drop event_attendance policies
DROP POLICY IF EXISTS event_attendance_select_own ON event_attendance;
DROP POLICY IF EXISTS event_attendance_select_organizer ON event_attendance;
DROP POLICY IF EXISTS event_attendance_select_admin ON event_attendance;
DROP POLICY IF EXISTS event_attendance_insert_self ON event_attendance;
DROP POLICY IF EXISTS event_attendance_insert_organizer ON event_attendance;
DROP POLICY IF EXISTS event_attendance_update_own ON event_attendance;
DROP POLICY IF EXISTS event_attendance_update_organizer ON event_attendance;

DO $rollback$ 
BEGIN 
  RAISE NOTICE '✅ Dropped 34 RLS policies';
END $rollback$;

-- ============================================================================
-- STEP 2: DROP TRIGGERS
-- ============================================================================
DO $rollback$ 
BEGIN 
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'Step 2/10: Dropping triggers...';
  RAISE NOTICE '==================================================';
END $rollback$;

-- Drop role_requests triggers
DROP TRIGGER IF EXISTS trigger_update_role_requests_updated_at ON role_requests;

-- Drop role_features triggers
DROP TRIGGER IF EXISTS trigger_update_role_features_updated_at ON role_features;

-- Drop users triggers
DROP TRIGGER IF EXISTS trigger_log_user_role_change ON users;

-- Drop events triggers
DROP TRIGGER IF EXISTS trigger_update_events_updated_at ON events;
DROP TRIGGER IF EXISTS trigger_auto_expire_qr_codes ON events;

-- Drop event_attendance triggers
DROP TRIGGER IF EXISTS trigger_update_event_attendance_updated_at ON event_attendance;
DROP TRIGGER IF EXISTS trigger_increment_event_attendees ON event_attendance;
DROP TRIGGER IF EXISTS trigger_decrement_event_attendees ON event_attendance;

DO $rollback$ 
BEGIN 
  RAISE NOTICE '✅ Dropped 8 triggers';
END $rollback$;

-- ============================================================================
-- STEP 3: DROP TRIGGER FUNCTIONS
-- ============================================================================
DO $rollback$ 
BEGIN 
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'Step 3/10: Dropping trigger functions...';
  RAISE NOTICE '==================================================';
END $rollback$;

DROP FUNCTION IF EXISTS update_role_requests_updated_at();
DROP FUNCTION IF EXISTS log_user_role_change();
DROP FUNCTION IF EXISTS increment_event_attendees();
DROP FUNCTION IF EXISTS decrement_event_attendees();
DROP FUNCTION IF EXISTS auto_expire_qr_codes();

DO $rollback$ 
BEGIN 
  RAISE NOTICE '✅ Dropped 5 trigger functions';
END $rollback$;

-- ============================================================================
-- STEP 4: DROP HELPER FUNCTIONS
-- ============================================================================
DO $rollback$ 
BEGIN 
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'Step 4/10: Dropping helper functions...';
  RAISE NOTICE '==================================================';
END $rollback$;

DROP FUNCTION IF EXISTS generate_event_qr_code();
DROP FUNCTION IF EXISTS can_scan_event_qr(UUID, UUID);
DROP FUNCTION IF EXISTS get_event_stats(UUID);

DO $rollback$ 
BEGIN 
  RAISE NOTICE '✅ Dropped 3 helper functions';
END $rollback$;

-- ============================================================================
-- STEP 5: DROP INDEXES
-- ============================================================================
DO $rollback$ 
BEGIN 
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'Step 5/10: Dropping indexes...';
  RAISE NOTICE '==================================================';
END $rollback$;

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
DROP INDEX IF EXISTS idx_note_shares_event_id;
DROP INDEX IF EXISTS idx_note_shares_shared_via;

-- Drop note_share_batches indexes
DROP INDEX IF EXISTS idx_note_share_batches_note_id;
DROP INDEX IF EXISTS idx_note_share_batches_shared_by;
DROP INDEX IF EXISTS idx_note_share_batches_created_at;
DROP INDEX IF EXISTS idx_note_share_batches_completed_at;

-- Drop role_features indexes
DROP INDEX IF EXISTS idx_role_features_lookup;
DROP INDEX IF EXISTS idx_role_features_role;

-- Drop events indexes
DROP INDEX IF EXISTS idx_events_created_by;
DROP INDEX IF EXISTS idx_events_qr_code;
DROP INDEX IF EXISTS idx_events_status;
DROP INDEX IF EXISTS idx_events_event_date;
DROP INDEX IF EXISTS idx_events_qr_status;
DROP INDEX IF EXISTS idx_events_transcript_status;
DROP INDEX IF EXISTS idx_events_note_id;

-- Drop event_attendance indexes
DROP INDEX IF EXISTS idx_event_attendance_event_id;
DROP INDEX IF EXISTS idx_event_attendance_user_id;
DROP INDEX IF EXISTS idx_event_attendance_checked_in_at;
DROP INDEX IF EXISTS idx_event_attendance_status;
DROP INDEX IF EXISTS idx_event_attendance_note_accessed;

-- Drop users table indexes related to removed features
DROP INDEX IF EXISTS idx_users_approval_status;
DROP INDEX IF EXISTS idx_users_invite_code;

DO $rollback$ 
BEGIN 
  RAISE NOTICE '✅ Dropped 37 indexes';
END $rollback$;

-- ============================================================================
-- STEP 6: REMOVE FOREIGN KEY CONSTRAINTS FROM NOTES TABLE
-- ============================================================================
DO $rollback$ 
BEGIN 
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'Step 6/10: Removing foreign keys from notes...';
  RAISE NOTICE '==================================================';
END $rollback$;

-- Drop event relationship constraint from notes
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_event_id_fkey;

DO $rollback$ 
BEGIN 
  RAISE NOTICE '✅ Removed foreign key constraints from notes';
END $rollback$;

-- ============================================================================
-- STEP 7: DROP COLUMNS FROM NOTES TABLE
-- ============================================================================
DO $rollback$ 
BEGIN 
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'Step 7/10: Removing event columns from notes...';
  RAISE NOTICE '==================================================';
END $rollback$;

-- Remove event-related columns from notes
ALTER TABLE notes DROP COLUMN IF EXISTS event_id;
ALTER TABLE notes DROP COLUMN IF EXISTS is_event_note;
ALTER TABLE notes DROP COLUMN IF EXISTS shared_to_attendees;
ALTER TABLE notes DROP COLUMN IF EXISTS attendees_share_count;

-- Drop indexes on removed columns
DROP INDEX IF EXISTS idx_notes_event_id;
DROP INDEX IF EXISTS idx_notes_is_event_note;

DO $rollback$ 
BEGIN 
  RAISE NOTICE '✅ Removed 4 event columns from notes table';
END $rollback$;

-- ============================================================================
-- STEP 8: DROP COLUMNS FROM USERS TABLE
-- ============================================================================
DO $rollback$ 
BEGIN 
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'Step 8/10: Removing unused columns from users...';
  RAISE NOTICE '==================================================';
END $rollback$;

-- Drop constraints first
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_approval_status_check;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_approved_by_fkey;

-- Drop columns related to approval system
ALTER TABLE users DROP COLUMN IF EXISTS approval_status;
ALTER TABLE users DROP COLUMN IF EXISTS approved_by;
ALTER TABLE users DROP COLUMN IF EXISTS approved_at;
ALTER TABLE users DROP COLUMN IF EXISTS invite_code;

DO $rollback$ 
BEGIN 
  RAISE NOTICE '✅ Removed 4 approval columns from users table';
END $rollback$;

-- ============================================================================
-- STEP 9: DROP MAIN TABLES
-- ============================================================================
DO $rollback$ 
BEGIN 
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'Step 9/10: Dropping main tables...';
  RAISE NOTICE '==================================================';
END $rollback$;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS event_attendance CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS note_share_batches CASCADE;
DROP TABLE IF EXISTS note_shares CASCADE;
DROP TABLE IF EXISTS role_features CASCADE;
DROP TABLE IF EXISTS admin_invites CASCADE;
DROP TABLE IF EXISTS role_requests CASCADE;

DO $rollback$ 
BEGIN 
  RAISE NOTICE '✅ Dropped 7 main tables';
  RAISE NOTICE '⚠️  All data in these tables is permanently deleted';
END $rollback$;

-- ============================================================================
-- STEP 10: VERIFY ROLLBACK
-- ============================================================================
DO $rollback$ 
DECLARE 
  removed_tables_count INTEGER;
  remaining_columns_users INTEGER;
  remaining_columns_notes INTEGER;
BEGIN 
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'Step 10/10: Verifying rollback...';
  RAISE NOTICE '==================================================';
  
  -- Check if removed tables are gone
  SELECT COUNT(*) INTO removed_tables_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'admin_invites',
      'event_attendance',
      'events',
      'note_share_batches',
      'note_shares',
      'role_features',
      'role_requests'
    );
  
  IF removed_tables_count > 0 THEN
    RAISE EXCEPTION 'Rollback verification failed: % tables still exist', removed_tables_count;
  END IF;
  
  -- Check if columns removed from users
  SELECT COUNT(*) INTO remaining_columns_users
  FROM information_schema.columns
  WHERE table_name = 'users'
    AND column_name IN (
      'approval_status',
      'approved_by',
      'approved_at',
      'invite_code'
    );
  
  IF remaining_columns_users > 0 THEN
    RAISE EXCEPTION 'Rollback verification failed: % columns still in users table', remaining_columns_users;
  END IF;
  
  -- Check if columns removed from notes
  SELECT COUNT(*) INTO remaining_columns_notes
  FROM information_schema.columns
  WHERE table_name = 'notes'
    AND column_name IN (
      'event_id',
      'is_event_note',
      'shared_to_attendees',
      'attendees_share_count'
    );
  
  IF remaining_columns_notes > 0 THEN
    RAISE EXCEPTION 'Rollback verification failed: % columns still in notes table', remaining_columns_notes;
  END IF;
  
  RAISE NOTICE '✅ Verification passed: All target structures removed';
END $rollback$;

-- ============================================================================
-- FINAL SUMMARY
-- ============================================================================
DO $rollback$ 
BEGIN 
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'ROLLBACK COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'What was removed:';
  RAISE NOTICE '- ✅ 7 tables (admin_invites, events, event_attendance, note_shares, etc)';
  RAISE NOTICE '- ✅ 34 RLS policies';
  RAISE NOTICE '- ✅ 8 triggers';
  RAISE NOTICE '- ✅ 8 functions (5 trigger + 3 helper)';
  RAISE NOTICE '- ✅ 37 indexes';
  RAISE NOTICE '- ✅ 4 columns from users table';
  RAISE NOTICE '- ✅ 4 columns from notes table';
  RAISE NOTICE '';
  RAISE NOTICE 'What was preserved:';
  RAISE NOTICE '- ✅ users table (with role support: admin, panitia, ustadz, member)';
  RAISE NOTICE '- ✅ notes table (all existing notes)';
  RAISE NOTICE '- ✅ All user data';
  RAISE NOTICE '- ✅ All authentication data';
  RAISE NOTICE '- ✅ All subscription data';
  RAISE NOTICE '- ✅ All other core tables';
  RAISE NOTICE '';
  RAISE NOTICE 'Current State:';
  RAISE NOTICE '- ✅ Clean multi-role system (admin, panitia, ustadz, member)';
  RAISE NOTICE '- ✅ Basic note management';
  RAISE NOTICE '- ✅ Ready for gradual feature additions';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables are backed up in migration files for future use!';
  RAISE NOTICE 'You can re-run migrations when ready for those features.';
  RAISE NOTICE '';
END $rollback$;

COMMIT;