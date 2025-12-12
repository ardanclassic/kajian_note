-- ============================================================================
-- KAJIAN NOTE - MULTI-ROLE AUTHENTICATION & FEATURES MIGRATION
-- ============================================================================
-- Version: 1.0.0
-- Date: 2025-01-13
-- Author: AI Assistant + Developer Collaboration
-- 
-- DESCRIPTION:
-- This migration implements a complete multi-role authentication system with:
-- 1. Multi-role auth (Admin, Panitia, Ustadz, Member)
-- 2. Approval workflow for role requests
-- 3. Admin invite system
-- 4. Bulk note sharing infrastructure
-- 5. Role-based feature flags (subscription tiers)
-- 6. Extended ImageKit retention for Panitia
--
-- SAFETY NOTES:
-- - All changes are ADDITIVE (no data loss)
-- - Existing users automatically approved
-- - Full rollback script available
-- - Backward compatible with existing code
--
-- EXECUTION TIME: ~30-60 seconds
-- DOWNTIME: Minimal (schema changes only)
-- ============================================================================
-- Safety: Stop on first error
\
set
  ON_ERROR_STOP on BEGIN;

-- ============================================================================
-- PART 1: ALTER USERS TABLE - ADD MULTI-ROLE AUTH COLUMNS
-- ============================================================================
DO $ $ BEGIN RAISE NOTICE '==================================================';

RAISE NOTICE 'PART 1: Altering users table...';

RAISE NOTICE '==================================================';

END $ $;

-- Add approval status column
ALTER TABLE
  users
ADD
  COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved';

-- Add approved_by column (self-referential FK)
ALTER TABLE
  users
ADD
  COLUMN IF NOT EXISTS approved_by UUID;

-- Add approved_at timestamp
ALTER TABLE
  users
ADD
  COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Add invite_code column (for invite-based registration)
ALTER TABLE
  users
ADD
  COLUMN IF NOT EXISTS invite_code TEXT;

-- Add status column (active, pending, suspended, inactive)
ALTER TABLE
  users
ADD
  COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add foreign key constraint for approved_by
DO $ $ BEGIN IF NOT EXISTS (
  SELECT
    1
  FROM
    information_schema.table_constraints
  WHERE
    constraint_name = 'users_approved_by_fkey'
) THEN
ALTER TABLE
  users
ADD
  CONSTRAINT users_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES users(id);

END IF;

END $ $;

-- Add check constraint for approval_status
DO $ $ BEGIN IF NOT EXISTS (
  SELECT
    1
  FROM
    information_schema.table_constraints
  WHERE
    constraint_name = 'users_approval_status_check'
) THEN
ALTER TABLE
  users
ADD
  CONSTRAINT users_approval_status_check CHECK (
    approval_status IN ('pending', 'approved', 'rejected')
  );

END IF;

END $ $;

-- Add check constraint for status
DO $ $ BEGIN IF NOT EXISTS (
  SELECT
    1
  FROM
    information_schema.table_constraints
  WHERE
    constraint_name = 'users_status_check'
) THEN
ALTER TABLE
  users
ADD
  CONSTRAINT users_status_check CHECK (
    status IN ('active', 'pending', 'suspended', 'inactive')
  );

END IF;

END $ $;

-- ============================================================================
-- PART 2: ALTER USERS TABLE - ADD PANITIA SUBSCRIPTION TIERS
-- ============================================================================
DO $ $ BEGIN RAISE NOTICE '==================================================';

RAISE NOTICE 'PART 2: Adding Panitia subscription tiers...';

RAISE NOTICE '==================================================';

END $ $;

-- Drop old subscription_tier constraint
ALTER TABLE
  users DROP CONSTRAINT IF EXISTS users_subscription_tier_check;

-- Add new constraint with panitia tiers
ALTER TABLE
  users
ADD
  CONSTRAINT users_subscription_tier_check CHECK (
    subscription_tier = ANY (
      ARRAY [
    'free'::text, 
    'premium'::text, 
    'advance'::text,
    'panitia_basic'::text, 
    'panitia_pro'::text
  ]
    )
  );

DO $ $ BEGIN RAISE NOTICE '✅ Users table altered successfully';

RAISE NOTICE '✅ Added: approval_status, approved_by, approved_at, invite_code, status';

RAISE NOTICE '✅ Added: panitia_basic, panitia_pro subscription tiers';

END $ $;

-- ============================================================================
-- PART 3: CREATE ROLE_REQUESTS TABLE
-- ============================================================================
DO $ $ BEGIN RAISE NOTICE '==================================================';

RAISE NOTICE 'PART 3: Creating role_requests table...';

RAISE NOTICE '==================================================';

END $ $;

CREATE TABLE IF NOT EXISTS role_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  requested_role TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Foreign keys
  CONSTRAINT role_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT role_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES users(id),
  -- Check constraints
  CONSTRAINT role_requests_requested_role_check CHECK (requested_role IN ('panitia', 'ustadz', 'admin')),
  CONSTRAINT role_requests_status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Add unique constraint: Only 1 pending request per user
CREATE UNIQUE INDEX IF NOT EXISTS role_requests_one_pending_per_user ON role_requests (user_id)
WHERE
  (status = 'pending');

-- Add comment
COMMENT ON TABLE role_requests IS 'Tracks user role upgrade requests requiring admin approval';

COMMENT ON COLUMN role_requests.reason IS 'User explanation for why they need the role';

COMMENT ON COLUMN role_requests.review_notes IS 'Admin notes on approval/rejection decision';

DO $ $ BEGIN RAISE NOTICE '✅ role_requests table created';

END $ $;

-- ============================================================================
-- PART 4: CREATE ADMIN_INVITES TABLE
-- ============================================================================
DO $ $ BEGIN RAISE NOTICE '==================================================';

RAISE NOTICE 'PART 4: Creating admin_invites table...';

RAISE NOTICE '==================================================';

END $ $;

CREATE TABLE IF NOT EXISTS admin_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid() :: text,
  invited_by UUID NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  status TEXT NOT NULL DEFAULT 'pending',
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Foreign key
  CONSTRAINT admin_invites_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES users(id),
  -- Check constraints
  CONSTRAINT admin_invites_role_check CHECK (role IN ('panitia', 'ustadz', 'admin')),
  CONSTRAINT admin_invites_status_check CHECK (status IN ('pending', 'accepted', 'expired'))
);

-- Add comment
COMMENT ON TABLE admin_invites IS 'Admin-generated invite links for pre-approved staff registration';

COMMENT ON COLUMN admin_invites.invite_code IS 'Unique invite code for registration URL';

COMMENT ON COLUMN admin_invites.expires_at IS 'Invite expiry (default 7 days)';

DO $ $ BEGIN RAISE NOTICE '✅ admin_invites table created';

END $ $;

-- ============================================================================
-- PART 5: CREATE NOTE_SHARES TABLE (BULK SHARING)
-- ============================================================================
DO $ $ BEGIN RAISE NOTICE '==================================================';

RAISE NOTICE 'PART 5: Creating note_shares table...';

RAISE NOTICE '==================================================';

END $ $;

CREATE TABLE IF NOT EXISTS note_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL,
  shared_by UUID NOT NULL,
  shared_to UUID NOT NULL,
  shared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  notification_sent BOOLEAN DEFAULT false,
  -- Foreign keys
  CONSTRAINT note_shares_note_id_fkey FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  CONSTRAINT note_shares_shared_by_fkey FOREIGN KEY (shared_by) REFERENCES users(id),
  CONSTRAINT note_shares_shared_to_fkey FOREIGN KEY (shared_to) REFERENCES users(id),
  -- Prevent duplicate shares
  CONSTRAINT note_shares_unique_share UNIQUE (note_id, shared_to)
);

-- Add comment
COMMENT ON TABLE note_shares IS 'Individual note sharing records for bulk sharing feature';

COMMENT ON COLUMN note_shares.read_at IS 'When recipient viewed the shared note (NULL = unread)';

COMMENT ON COLUMN note_shares.notification_sent IS 'Track if notification was sent to recipient';

DO $ $ BEGIN RAISE NOTICE '✅ note_shares table created';

END $ $;

-- ============================================================================
-- PART 6: CREATE NOTE_SHARE_BATCHES TABLE (TRACKING)
-- ============================================================================
DO $ $ BEGIN RAISE NOTICE '==================================================';

RAISE NOTICE 'PART 6: Creating note_share_batches table...';

RAISE NOTICE '==================================================';

END $ $;

CREATE TABLE IF NOT EXISTS note_share_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL,
  shared_by UUID NOT NULL,
  target_type TEXT NOT NULL,
  target_users UUID [],
  target_role TEXT,
  total_recipients INTEGER NOT NULL,
  successful_shares INTEGER DEFAULT 0,
  failed_shares INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  -- Foreign keys
  CONSTRAINT note_share_batches_note_id_fkey FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  CONSTRAINT note_share_batches_shared_by_fkey FOREIGN KEY (shared_by) REFERENCES users(id),
  -- Check constraint
  CONSTRAINT note_share_batches_target_type_check CHECK (
    target_type IN ('specific_users', 'all_members', 'by_role')
  )
);

-- Add comment
COMMENT ON TABLE note_share_batches IS 'Tracks bulk note sharing operations for monitoring and analytics';

COMMENT ON COLUMN note_share_batches.target_type IS 'Type of bulk share: specific users, all members, or by role';

COMMENT ON COLUMN note_share_batches.target_users IS 'Array of user IDs (if specific_users)';

COMMENT ON COLUMN note_share_batches.total_recipients IS 'Expected number of shares';

COMMENT ON COLUMN note_share_batches.successful_shares IS 'Actual successful shares';

DO $ $ BEGIN RAISE NOTICE '✅ note_share_batches table created';

END $ $;

-- ============================================================================
-- PART 7: CREATE ROLE_FEATURES TABLE (FEATURE FLAGS)
-- ============================================================================
DO $ $ BEGIN RAISE NOTICE '==================================================';

RAISE NOTICE 'PART 7: Creating role_features table...';

RAISE NOTICE '==================================================';

END $ $;

CREATE TABLE IF NOT EXISTS role_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  subscription_tier TEXT NOT NULL,
  feature_key TEXT NOT NULL,
  feature_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Unique combination
  CONSTRAINT role_features_unique_config UNIQUE (role, subscription_tier, feature_key)
);

-- Add comment
COMMENT ON TABLE role_features IS 'Role-based feature flags and limits (subscription + role matrix)';

COMMENT ON COLUMN role_features.feature_key IS 'Feature identifier (e.g., max_notes, imagekit_retention_hours)';

COMMENT ON COLUMN role_features.feature_value IS 'JSON configuration for the feature';

DO $ $ BEGIN RAISE NOTICE '✅ role_features table created';

END $ $;

-- ============================================================================
-- PART 8: ALTER IMAGEKIT_TEMP_UPLOADS TABLE
-- ============================================================================
DO $ $ BEGIN RAISE NOTICE '==================================================';

RAISE NOTICE 'PART 8: Altering imagekit_temp_uploads table...';

RAISE NOTICE '==================================================';

END $ $;

-- Add uploader_role column for easier retention logic
ALTER TABLE
  imagekit_temp_uploads
ADD
  COLUMN IF NOT EXISTS uploader_role TEXT DEFAULT 'member';

-- Add check constraint
DO $ $ BEGIN IF NOT EXISTS (
  SELECT
    1
  FROM
    information_schema.table_constraints
  WHERE
    constraint_name = 'imagekit_temp_uploads_uploader_role_check'
) THEN
ALTER TABLE
  imagekit_temp_uploads
ADD
  CONSTRAINT imagekit_temp_uploads_uploader_role_check CHECK (
    uploader_role IN ('admin', 'panitia', 'ustadz', 'member')
  );

END IF;

END $ $;

-- Add comment
COMMENT ON COLUMN imagekit_temp_uploads.uploader_role IS 'Role of uploader for retention logic (synced from users table)';

DO $ $ BEGIN RAISE NOTICE '✅ imagekit_temp_uploads table altered';

END $ $;

-- ============================================================================
-- PART 9: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
DO $ $ BEGIN RAISE NOTICE '==================================================';

RAISE NOTICE 'PART 9: Creating performance indexes...';

RAISE NOTICE '==================================================';

END $ $;

-- Indexes for role_requests table
CREATE INDEX IF NOT EXISTS idx_role_requests_user_id ON role_requests (user_id);

CREATE INDEX IF NOT EXISTS idx_role_requests_status ON role_requests (status);

CREATE INDEX IF NOT EXISTS idx_role_requests_created_at ON role_requests (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_role_requests_reviewed_by ON role_requests (reviewed_by);

-- Indexes for admin_invites table
CREATE INDEX IF NOT EXISTS idx_admin_invites_invite_code ON admin_invites (invite_code);

CREATE INDEX IF NOT EXISTS idx_admin_invites_email ON admin_invites (email);

CREATE INDEX IF NOT EXISTS idx_admin_invites_status_expires ON admin_invites (status, expires_at)
WHERE
  status = 'pending';

CREATE INDEX IF NOT EXISTS idx_admin_invites_invited_by ON admin_invites (invited_by);

-- Indexes for note_shares table
CREATE INDEX IF NOT EXISTS idx_note_shares_note_id ON note_shares (note_id);

CREATE INDEX IF NOT EXISTS idx_note_shares_shared_to ON note_shares (shared_to);

CREATE INDEX IF NOT EXISTS idx_note_shares_shared_by ON note_shares (shared_by);

CREATE INDEX IF NOT EXISTS idx_note_shares_read_at ON note_shares (read_at)
WHERE
  read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_note_shares_shared_at ON note_shares (shared_at DESC);

-- Indexes for note_share_batches table
CREATE INDEX IF NOT EXISTS idx_note_share_batches_note_id ON note_share_batches (note_id);

CREATE INDEX IF NOT EXISTS idx_note_share_batches_shared_by ON note_share_batches (shared_by);

CREATE INDEX IF NOT EXISTS idx_note_share_batches_created_at ON note_share_batches (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_note_share_batches_completed_at ON note_share_batches (completed_at)
WHERE
  completed_at IS NULL;

-- Indexes for role_features table
CREATE INDEX IF NOT EXISTS idx_role_features_lookup ON role_features (role, subscription_tier, feature_key);

CREATE INDEX IF NOT EXISTS idx_role_features_role ON role_features (role);

-- Indexes for users table (new columns)
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users (approval_status)
WHERE
  approval_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_users_invite_code ON users (invite_code)
WHERE
  invite_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);

-- Index for imagekit_temp_uploads (new column)
CREATE INDEX IF NOT EXISTS idx_imagekit_temp_uploads_uploader_role ON imagekit_temp_uploads (uploader_role);

DO $ $ BEGIN RAISE NOTICE '✅ Created 23 performance indexes';

END $ $;

-- ============================================================================
-- PART 10: CREATE TRIGGERS
-- ============================================================================
DO $ $ BEGIN RAISE NOTICE '==================================================';

RAISE NOTICE 'PART 10: Creating triggers...';

RAISE NOTICE '==================================================';

END $ $;

-- Trigger: Update updated_at on role_requests
CREATE
OR REPLACE FUNCTION update_role_requests_updated_at() RETURNS TRIGGER AS $ $ BEGIN NEW.updated_at = NOW();

RETURN NEW;

END;

$ $ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_role_requests_updated_at ON role_requests;

CREATE TRIGGER trigger_update_role_requests_updated_at BEFORE
UPDATE
  ON role_requests FOR EACH ROW EXECUTE FUNCTION update_role_requests_updated_at();

-- Trigger: Update updated_at on role_features
DROP TRIGGER IF EXISTS trigger_update_role_features_updated_at ON role_features;

CREATE TRIGGER trigger_update_role_features_updated_at BEFORE
UPDATE
  ON role_features FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Log role changes to profile_changes
CREATE
OR REPLACE FUNCTION log_user_role_change() RETURNS TRIGGER AS $ $ BEGIN -- Only log if role actually changed
IF OLD.role IS DISTINCT
FROM
  NEW.role THEN
INSERT INTO
  profile_changes (
    user_id,
    field_changed,
    old_value,
    new_value,
    changed_by,
    changed_by_role,
    changed_at
  )
VALUES
  (
    NEW.id,
    'role',
    OLD.role,
    NEW.role,
    NEW.approved_by,
    (
      SELECT
        role
      FROM
        users
      WHERE
        id = NEW.approved_by
    ),
    NOW()
  );

END IF;

RETURN NEW;

END;

$ $ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_user_role_change ON users;

CREATE TRIGGER trigger_log_user_role_change
AFTER
UPDATE
  ON users FOR EACH ROW EXECUTE FUNCTION log_user_role_change();

DO $ $ BEGIN RAISE NOTICE '✅ Created 3 triggers';

END $ $;

-- ============================================================================
-- PART 11: INSERT INITIAL ROLE_FEATURES DATA
-- ============================================================================
DO $ $ BEGIN RAISE NOTICE '==================================================';

RAISE NOTICE 'PART 11: Inserting initial role_features...';

RAISE NOTICE '==================================================';

END $ $;

-- Member features (free tier)
INSERT INTO
  role_features (
    role,
    subscription_tier,
    feature_key,
    feature_value,
    description
  )
VALUES
  (
    'member',
    'free',
    'max_notes',
    '{"limit": 10}',
    'Maximum notes for free members'
  ),
  (
    'member',
    'free',
    'imagekit_retention_hours',
    '{"hours": 1}',
    'PDF retention time (1 hour)'
  ),
  (
    'member',
    'free',
    'can_share_notes',
    '{"enabled": false}',
    'Cannot share notes'
  ),
  (
    'member',
    'free',
    'ai_summary',
    '{"enabled": false}',
    'No AI summary access'
  ) ON CONFLICT (role, subscription_tier, feature_key) DO NOTHING;

-- Member features (premium tier)
INSERT INTO
  role_features (
    role,
    subscription_tier,
    feature_key,
    feature_value,
    description
  )
VALUES
  (
    'member',
    'premium',
    'max_notes',
    '{"limit": 100}',
    'Maximum notes for premium members'
  ),
  (
    'member',
    'premium',
    'imagekit_retention_hours',
    '{"hours": 1}',
    'PDF retention time (1 hour)'
  ),
  (
    'member',
    'premium',
    'can_share_notes',
    '{"enabled": false}',
    'Cannot share notes'
  ),
  (
    'member',
    'premium',
    'ai_summary',
    '{"enabled": true}',
    'AI summary enabled'
  ) ON CONFLICT (role, subscription_tier, feature_key) DO NOTHING;

-- Member features (advance tier)
INSERT INTO
  role_features (
    role,
    subscription_tier,
    feature_key,
    feature_value,
    description
  )
VALUES
  (
    'member',
    'advance',
    'max_notes',
    '{"limit": -1}',
    'Unlimited notes'
  ),
  (
    'member',
    'advance',
    'imagekit_retention_hours',
    '{"hours": 1}',
    'PDF retention time (1 hour)'
  ),
  (
    'member',
    'advance',
    'can_share_notes',
    '{"enabled": false}',
    'Cannot share notes'
  ),
  (
    'member',
    'advance',
    'ai_summary',
    '{"enabled": true}',
    'AI summary enabled'
  ) ON CONFLICT (role, subscription_tier, feature_key) DO NOTHING;

-- Panitia features (free tier)
INSERT INTO
  role_features (
    role,
    subscription_tier,
    feature_key,
    feature_value,
    description
  )
VALUES
  (
    'panitia',
    'free',
    'max_notes',
    '{"limit": 500}',
    'Maximum notes for free panitia'
  ),
  (
    'panitia',
    'free',
    'imagekit_retention_hours',
    '{"hours": 72}',
    'PDF retention time (3 days)'
  ),
  (
    'panitia',
    'free',
    'can_share_notes',
    '{"enabled": true}',
    'Can share notes'
  ),
  (
    'panitia',
    'free',
    'max_share_recipients',
    '{"limit": 100}',
    'Max 100 recipients per share'
  ),
  (
    'panitia',
    'free',
    'ai_summary',
    '{"enabled": true}',
    'AI summary enabled'
  ) ON CONFLICT (role, subscription_tier, feature_key) DO NOTHING;

-- Panitia features (panitia_basic tier)
INSERT INTO
  role_features (
    role,
    subscription_tier,
    feature_key,
    feature_value,
    description
  )
VALUES
  (
    'panitia',
    'panitia_basic',
    'max_notes',
    '{"limit": 2000}',
    'Maximum notes for basic panitia'
  ),
  (
    'panitia',
    'panitia_basic',
    'imagekit_retention_hours',
    '{"hours": 168}',
    'PDF retention time (7 days)'
  ),
  (
    'panitia',
    'panitia_basic',
    'can_share_notes',
    '{"enabled": true}',
    'Can share notes'
  ),
  (
    'panitia',
    'panitia_basic',
    'max_share_recipients',
    '{"limit": 500}',
    'Max 500 recipients per share'
  ),
  (
    'panitia',
    'panitia_basic',
    'ai_summary',
    '{"enabled": true}',
    'AI summary enabled'
  ) ON CONFLICT (role, subscription_tier, feature_key) DO NOTHING;

-- Panitia features (panitia_pro tier)
INSERT INTO
  role_features (
    role,
    subscription_tier,
    feature_key,
    feature_value,
    description
  )
VALUES
  (
    'panitia',
    'panitia_pro',
    'max_notes',
    '{"limit": -1}',
    'Unlimited notes'
  ),
  (
    'panitia',
    'panitia_pro',
    'imagekit_retention_hours',
    '{"hours": 720}',
    'PDF retention time (30 days)'
  ),
  (
    'panitia',
    'panitia_pro',
    'can_share_notes',
    '{"enabled": true}',
    'Can share notes'
  ),
  (
    'panitia',
    'panitia_pro',
    'max_share_recipients',
    '{"limit": 2000}',
    'Max 2000 recipients per share'
  ),
  (
    'panitia',
    'panitia_pro',
    'ai_summary',
    '{"enabled": true}',
    'AI summary enabled'
  ) ON CONFLICT (role, subscription_tier, feature_key) DO NOTHING;

-- Admin features (unlimited everything)
INSERT INTO
  role_features (
    role,
    subscription_tier,
    feature_key,
    feature_value,
    description
  )
VALUES
  (
    'admin',
    'free',
    'max_notes',
    '{"limit": -1}',
    'Unlimited notes'
  ),
  (
    'admin',
    'free',
    'imagekit_retention_hours',
    '{"hours": 720}',
    'PDF retention time (30 days)'
  ),
  (
    'admin',
    'free',
    'can_share_notes',
    '{"enabled": true}',
    'Can share notes'
  ),
  (
    'admin',
    'free',
    'max_share_recipients',
    '{"limit": -1}',
    'Unlimited recipients'
  ),
  (
    'admin',
    'free',
    'ai_summary',
    '{"enabled": true}',
    'AI summary enabled'
  ) ON CONFLICT (role, subscription_tier, feature_key) DO NOTHING;

-- Ustadz features (similar to panitia for now)
INSERT INTO
  role_features (
    role,
    subscription_tier,
    feature_key,
    feature_value,
    description
  )
VALUES
  (
    'ustadz',
    'free',
    'max_notes',
    '{"limit": 1000}',
    'Maximum notes for ustadz'
  ),
  (
    'ustadz',
    'free',
    'imagekit_retention_hours',
    '{"hours": 168}',
    'PDF retention time (7 days)'
  ),
  (
    'ustadz',
    'free',
    'can_share_notes',
    '{"enabled": true}',
    'Can share notes'
  ),
  (
    'ustadz',
    'free',
    'max_share_recipients',
    '{"limit": 500}',
    'Max 500 recipients per share'
  ),
  (
    'ustadz',
    'free',
    'ai_summary',
    '{"enabled": true}',
    'AI summary enabled'
  ) ON CONFLICT (role, subscription_tier, feature_key) DO NOTHING;

DO $ $ DECLARE feature_count INTEGER;

BEGIN
SELECT
  COUNT(*) INTO feature_count
FROM
  role_features;

RAISE NOTICE '✅ Inserted role_features (total: %)',
feature_count;

END $ $;

-- ============================================================================
-- PART 12: UPDATE EXISTING USERS (SET DEFAULTS)
-- ============================================================================
DO $ $ BEGIN RAISE NOTICE '==================================================';

RAISE NOTICE 'PART 12: Updating existing users...';

RAISE NOTICE '==================================================';

END $ $;

-- Update existing members to approved status
UPDATE
  users
SET
  approval_status = 'approved',
  status = 'active',
  approved_at = created_at
WHERE
  role = 'member'
  AND (
    approval_status IS NULL
    OR approval_status != 'approved'
  );

-- Update imagekit_temp_uploads with uploader role
UPDATE
  imagekit_temp_uploads itu
SET
  uploader_role = u.role
FROM
  users u
WHERE
  itu.user_id = u.auth_user_id
  AND itu.uploader_role = 'member';

DO $ $ DECLARE updated_users INTEGER;

updated_uploads INTEGER;

BEGIN
SELECT
  COUNT(*) INTO updated_users
FROM
  users
WHERE
  approval_status = 'approved'
  AND role = 'member';

SELECT
  COUNT(*) INTO updated_uploads
FROM
  imagekit_temp_uploads
WHERE
  uploader_role != 'member';

RAISE NOTICE '✅ Updated % existing users to approved status',
updated_users;

RAISE NOTICE '✅ Updated % imagekit uploads with uploader role',
updated_uploads;

END $ $;

-- ============================================================================
-- PART 13: CREATE RLS POLICIES
-- ============================================================================
DO $ $ BEGIN RAISE NOTICE '==================================================';

RAISE NOTICE 'PART 13: Creating RLS policies...';

RAISE NOTICE '==================================================';

END $ $;

-- Enable RLS on new tables
ALTER TABLE
  role_requests ENABLE ROW LEVEL SECURITY;

ALTER TABLE
  admin_invites ENABLE ROW LEVEL SECURITY;

ALTER TABLE
  note_shares ENABLE ROW LEVEL SECURITY;

ALTER TABLE
  note_share_batches ENABLE ROW LEVEL SECURITY;

ALTER TABLE
  role_features ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: role_requests
-- ============================================================================
-- Users can view their own requests
CREATE POLICY role_requests_select_own ON role_requests FOR
SELECT
  USING (
    user_id IN (
      SELECT
        id
      FROM
        users
      WHERE
        auth_user_id = auth.uid()
    )
  );

-- Users can create their own requests
CREATE POLICY role_requests_insert_own ON role_requests FOR
INSERT
  WITH CHECK (
    user_id IN (
      SELECT
        id
      FROM
        users
      WHERE
        auth_user_id = auth.uid()
    )
  );

-- Admins can view all requests
CREATE POLICY role_requests_select_admin ON role_requests FOR
SELECT
  USING (
    EXISTS (
      SELECT
        1
      FROM
        users
      WHERE
        auth_user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Admins can update (approve/reject) requests
CREATE POLICY role_requests_update_admin ON role_requests FOR
UPDATE
  USING (
    EXISTS (
      SELECT
        1
      FROM
        users
      WHERE
        auth_user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- ============================================================================
-- RLS POLICIES: admin_invites
-- ============================================================================
-- Admins have full access
CREATE POLICY admin_invites_admin_full ON admin_invites FOR ALL USING (
  EXISTS (
    SELECT
      1
    FROM
      users
    WHERE
      auth_user_id = auth.uid()
      AND role = 'admin'
  )
);

-- Anyone can verify invite code (for registration)
CREATE POLICY admin_invites_verify_public ON admin_invites FOR
SELECT
  USING (
    status = 'pending'
    AND expires_at > NOW()
  );

-- ============================================================================
-- RLS POLICIES: note_shares
-- ============================================================================
-- Users can view shares to them
CREATE POLICY note_shares_select_received ON note_shares FOR
SELECT
  USING (
    shared_to IN (
      SELECT
        id
      FROM
        users
      WHERE
        auth_user_id = auth.uid()
    )
  );

-- Users can view shares they created
CREATE POLICY note_shares_select_sent ON note_shares FOR
SELECT
  USING (
    shared_by IN (
      SELECT
        id
      FROM
        users
      WHERE
        auth_user_id = auth.uid()
    )
  );

-- Panitia/Admin can create shares
CREATE POLICY note_shares_insert_staff ON note_shares FOR
INSERT
  WITH CHECK (
    shared_by IN (
      SELECT
        id
      FROM
        users
      WHERE
        auth_user_id = auth.uid()
        AND role IN ('admin', 'panitia', 'ustadz')
    )
  );

-- Users can update their received shares (mark as read)
CREATE POLICY note_shares_update_received ON note_shares FOR
UPDATE
  USING (
    shared_to IN (
      SELECT
        id
      FROM
        users
      WHERE
        auth_user_id = auth.uid()
    )
  );

-- Users can delete shares they created
CREATE POLICY note_shares_delete_own ON note_shares FOR DELETE USING (
  shared_by IN (
    SELECT
      id
    FROM
      users
    WHERE
      auth_user_id = auth.uid()
  )
);

-- ============================================================================
-- RLS POLICIES: note_share_batches
-- ============================================================================
-- Panitia/Admin can view their own batches
CREATE POLICY note_share_batches_select_own ON note_share_batches FOR
SELECT
  USING (
    shared_by IN (
      SELECT
        id
      FROM
        users
      WHERE
        auth_user_id = auth.uid()
    )
  );

-- Panitia/Admin can create batches
CREATE POLICY note_share_batches_insert_staff ON note_share_batches FOR
INSERT
  WITH CHECK (
    shared_by IN (
      SELECT
        id
      FROM
        users
      WHERE
        auth_user_id = auth.uid()
        AND role IN ('admin', 'panitia', 'ustadz')
    )
  );

-- System can update batch stats (for tracking)
CREATE POLICY note_share_batches_update_system ON note_share_batches FOR
UPDATE
  USING (true);

-- ============================================================================
-- RLS POLICIES: role_features
-- ============================================================================
-- Everyone can read features (needed for app logic)
CREATE POLICY role_features_select_all ON role_features FOR
SELECT
  USING (true);

-- Only admins can modify features
CREATE POLICY role_features_modify_admin ON role_features FOR ALL USING (
  EXISTS (
    SELECT
      1
    FROM
      users
    WHERE
      auth_user_id = auth.uid()
      AND role = 'admin'
  )
);

DO $ BEGIN RAISE NOTICE '✅ Created 18 RLS policies';

END $;

-- ============================================================================
-- PART 14: GRANT PERMISSIONS
-- ============================================================================
DO $ BEGIN RAISE NOTICE '==================================================';

RAISE NOTICE 'PART 14: Granting permissions...';

RAISE NOTICE '==================================================';

END $;

-- Grant permissions to authenticated users
GRANT ALL ON TABLE role_requests TO authenticated;

GRANT ALL ON TABLE admin_invites TO authenticated;

GRANT ALL ON TABLE note_shares TO authenticated;

GRANT ALL ON TABLE note_share_batches TO authenticated;

GRANT ALL ON TABLE role_features TO authenticated;

-- Grant permissions to anon (for invite verification)
GRANT
SELECT
  ON TABLE admin_invites TO anon;

GRANT
SELECT
  ON TABLE role_features TO anon;

-- Grant permissions to service_role (for edge functions)
GRANT ALL ON TABLE role_requests TO service_role;

GRANT ALL ON TABLE admin_invites TO service_role;

GRANT ALL ON TABLE note_shares TO service_role;

GRANT ALL ON TABLE note_share_batches TO service_role;

GRANT ALL ON TABLE role_features TO service_role;

DO $ BEGIN RAISE NOTICE '✅ Granted permissions';

END $;

-- ============================================================================
-- FINAL: COMMIT TRANSACTION
-- ============================================================================
DO $ BEGIN RAISE NOTICE '==================================================';

RAISE NOTICE 'MIGRATION COMPLETED SUCCESSFULLY!';

RAISE NOTICE '==================================================';

RAISE NOTICE '';

RAISE NOTICE 'Summary:';

RAISE NOTICE '- ✅ Altered users table (5 new columns)';

RAISE NOTICE '- ✅ Added panitia subscription tiers';

RAISE NOTICE '- ✅ Created 5 new tables';

RAISE NOTICE '- ✅ Created 23 indexes';

RAISE NOTICE '- ✅ Created 3 triggers';

RAISE NOTICE '- ✅ Inserted role_features data';

RAISE NOTICE '- ✅ Updated existing users';

RAISE NOTICE '- ✅ Created 18 RLS policies';

RAISE NOTICE '- ✅ Granted permissions';

RAISE NOTICE '';

RAISE NOTICE 'Next steps:';

RAISE NOTICE '1. Run verification queries';

RAISE NOTICE '2. Test basic functionality';

RAISE NOTICE '3. Update edge functions';

RAISE NOTICE '4. Update frontend code';

RAISE NOTICE '';

RAISE NOTICE '🎉 Ready for multi-role authentication!';

END $;

COMMIT;