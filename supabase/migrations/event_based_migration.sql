-- ============================================================================
-- KAJIAN NOTE - EVENT-BASED ARCHITECTURE MIGRATION
-- ============================================================================
-- Version: 2.0.0
-- Date: 2025-01-13
-- 
-- DESCRIPTION:
-- This migration adds event-based architecture on top of multi-role system:
-- 1. Events table (kajian instances with QR codes)
-- 2. Event attendance table (QR scan tracking)
-- 3. Enhanced notes table (link to events)
-- 4. Enhanced note_shares table (event-scoped sharing)
-- 5. YouTube transcript polling system
--
-- PREREQUISITES:
-- - Multi-role migration (20250113_multi_role_complete.sql) must be run first
-- - All multi-role tables must exist: users, role_requests, admin_invites, etc.
--
-- SAFETY NOTES:
-- - All changes are ADDITIVE (no data loss)
-- - Existing notes remain unchanged
-- - Full rollback script available
-- - Backward compatible with existing code
--
-- EXECUTION TIME: ~30-60 seconds
-- DOWNTIME: Minimal (schema changes only)
-- ============================================================================

BEGIN;

DO $migration$ 
BEGIN 
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'STARTING EVENT-BASED ARCHITECTURE MIGRATION';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'This will add event management system on top of multi-role auth';
  RAISE NOTICE '';
END $migration$;

-- ============================================================================
-- PART 1: CREATE EVENTS TABLE
-- ============================================================================
DO $migration$ 
BEGIN 
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'PART 1: Creating events table...';
  RAISE NOTICE '==================================================';
END $migration$;

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,
  organization_name TEXT NOT NULL,
  
  -- Schedule
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  speaker_name TEXT,
  
  -- Event Type
  event_type TEXT NOT NULL DEFAULT 'one_time',
  
  -- QR Code System
  qr_code TEXT UNIQUE NOT NULL,
  qr_code_url TEXT NOT NULL,
  qr_status TEXT NOT NULL DEFAULT 'active',
  qr_expires_at TIMESTAMPTZ NOT NULL,
  
  -- Poster (manually uploaded by panitia)
  poster_url TEXT,
  poster_file_id TEXT,
  
  -- Attendance Management
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  check_in_opens_at TIMESTAMPTZ NOT NULL,
  check_in_closes_at TIMESTAMPTZ NOT NULL,
  
  -- YouTube Integration
  youtube_video_id TEXT,
  youtube_video_url TEXT,
  transcript_status TEXT DEFAULT 'none',
  transcript_checked_at TIMESTAMPTZ,
  transcript_ready_at TIMESTAMPTZ,
  transcript_poll_count INTEGER DEFAULT 0,
  
  -- Note Link
  note_id UUID,
  note_shared BOOLEAN DEFAULT false,
  note_shared_at TIMESTAMPTZ,
  note_shared_count INTEGER DEFAULT 0,
  
  -- Organizer
  created_by UUID NOT NULL,
  organizer_role TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign Keys
  CONSTRAINT events_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT events_note_id_fkey 
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE SET NULL,
  
  -- Check Constraints
  CONSTRAINT events_event_type_check 
    CHECK (event_type IN ('weekly', 'monthly', 'special', 'one_time')),
  CONSTRAINT events_qr_status_check 
    CHECK (qr_status IN ('active', 'expired', 'cancelled')),
  CONSTRAINT events_transcript_status_check 
    CHECK (transcript_status IN ('none', 'pending', 'ready', 'failed')),
  CONSTRAINT events_status_check 
    CHECK (status IN ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled')),
  CONSTRAINT events_organizer_role_check 
    CHECK (organizer_role IN ('admin', 'panitia', 'ustadz')),
  CONSTRAINT events_time_check 
    CHECK (end_time > start_time),
  CONSTRAINT events_attendees_check 
    CHECK (current_attendees >= 0 AND (max_attendees IS NULL OR current_attendees <= max_attendees))
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events (created_by);
CREATE INDEX IF NOT EXISTS idx_events_qr_code ON events (qr_code);
CREATE INDEX IF NOT EXISTS idx_events_status ON events (status);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events (event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_qr_status ON events (qr_status) WHERE qr_status = 'active';
CREATE INDEX IF NOT EXISTS idx_events_transcript_status ON events (transcript_status) WHERE transcript_status = 'pending';
CREATE INDEX IF NOT EXISTS idx_events_note_id ON events (note_id);

-- Add comments
COMMENT ON TABLE events IS 'Kajian events with QR code attendance tracking';
COMMENT ON COLUMN events.qr_code IS 'Unique code for QR scanning (format: EVT-timestamp-random)';
COMMENT ON COLUMN events.qr_code_url IS 'Full shareable URL for QR code';
COMMENT ON COLUMN events.qr_status IS 'QR code status: active (scannable), expired (event ended), cancelled';
COMMENT ON COLUMN events.poster_url IS 'URL to manually uploaded poster image (ImageKit)';
COMMENT ON COLUMN events.transcript_status IS 'YouTube transcript availability status';
COMMENT ON COLUMN events.transcript_poll_count IS 'Number of times system checked for transcript';
COMMENT ON COLUMN events.check_in_opens_at IS 'When attendees can start scanning QR (typically event creation time)';
COMMENT ON COLUMN events.check_in_closes_at IS 'When QR expires (typically event end_time)';

DO $migration$ 
BEGIN 
  RAISE NOTICE '✅ events table created';
END $migration$;

-- ============================================================================
-- PART 2: CREATE EVENT_ATTENDANCE TABLE
-- ============================================================================
DO $migration$ 
BEGIN 
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'PART 2: Creating event_attendance table...';
  RAISE NOTICE '==================================================';
END $migration$;

CREATE TABLE IF NOT EXISTS event_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core Relationship
  event_id UUID NOT NULL,
  user_id UUID NOT NULL,
  
  -- Check-in Details
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_in_method TEXT NOT NULL DEFAULT 'qr_scan',
  check_in_source TEXT,
  
  -- Device Info (for analytics & security)
  device_info JSONB,
  ip_address INET,
  user_agent TEXT,
  
  -- Attendance Status
  attendance_status TEXT NOT NULL DEFAULT 'registered',
  
  -- Note Access Tracking
  note_shared BOOLEAN DEFAULT false,
  note_shared_at TIMESTAMPTZ,
  note_accessed BOOLEAN DEFAULT false,
  note_accessed_at TIMESTAMPTZ,
  
  -- Manual Verification (if added by panitia)
  verified_by UUID,
  verification_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign Keys
  CONSTRAINT event_attendance_event_id_fkey 
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT event_attendance_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT event_attendance_verified_by_fkey 
    FOREIGN KEY (verified_by) REFERENCES users(id),
  
  -- Check Constraints
  CONSTRAINT event_attendance_check_in_method_check 
    CHECK (check_in_method IN ('qr_scan', 'manual_add')),
  CONSTRAINT event_attendance_check_in_source_check 
    CHECK (check_in_source IN ('mobile_app', 'web_app', 'manual')),
  CONSTRAINT event_attendance_attendance_status_check 
    CHECK (attendance_status IN ('registered', 'attended', 'no_show', 'cancelled')),
  
  -- Prevent Duplicate Attendance
  CONSTRAINT event_attendance_unique_attendance 
    UNIQUE (event_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_attendance_event_id ON event_attendance (event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_user_id ON event_attendance (user_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_checked_in_at ON event_attendance (checked_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_attendance_status ON event_attendance (attendance_status);
CREATE INDEX IF NOT EXISTS idx_event_attendance_note_accessed ON event_attendance (note_accessed) WHERE note_accessed = false;

-- Add comments
COMMENT ON TABLE event_attendance IS 'Tracks who attended events via QR code scanning';
COMMENT ON COLUMN event_attendance.check_in_method IS 'How attendance was recorded: qr_scan (user scanned) or manual_add (panitia added)';
COMMENT ON COLUMN event_attendance.check_in_source IS 'Where scan happened: mobile_app, web_app, or manual';
COMMENT ON COLUMN event_attendance.device_info IS 'JSON with device details for analytics';
COMMENT ON COLUMN event_attendance.attendance_status IS 'registered (scanned QR), attended (confirmed present), no_show, cancelled';
COMMENT ON COLUMN event_attendance.note_accessed IS 'Track if user opened the shared note';

DO $migration$ 
BEGIN 
  RAISE NOTICE '✅ event_attendance table created';
END $migration$;

-- ============================================================================
-- PART 3: UPDATE NOTES TABLE (ADD EVENT RELATIONSHIP)
-- ============================================================================
DO $migration$ 
BEGIN 
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'PART 3: Updating notes table...';
  RAISE NOTICE '==================================================';
END $migration$;

-- Add event relationship columns
ALTER TABLE notes ADD COLUMN IF NOT EXISTS event_id UUID;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_event_note BOOLEAN DEFAULT false;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS shared_to_attendees BOOLEAN DEFAULT false;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS attendees_share_count INTEGER DEFAULT 0;

-- Add foreign key constraint
DO $migration$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'notes_event_id_fkey'
  ) THEN
    ALTER TABLE notes ADD CONSTRAINT notes_event_id_fkey 
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL;
  END IF;
END $migration$;

-- Add index
CREATE INDEX IF NOT EXISTS idx_notes_event_id ON notes (event_id);
CREATE INDEX IF NOT EXISTS idx_notes_is_event_note ON notes (is_event_note) WHERE is_event_note = true;

-- Add comments
COMMENT ON COLUMN notes.event_id IS 'Link to event if this note is from a kajian';
COMMENT ON COLUMN notes.is_event_note IS 'true = note created for event distribution';
COMMENT ON COLUMN notes.shared_to_attendees IS 'true = already shared to event attendees';
COMMENT ON COLUMN notes.attendees_share_count IS 'Number of attendees note was shared to';

DO $migration$ 
BEGIN 
  RAISE NOTICE '✅ notes table updated with event relationship';
END $migration$;

-- ============================================================================
-- PART 4: UPDATE NOTE_SHARES TABLE (ADD EVENT CONTEXT)
-- ============================================================================
DO $migration$ 
BEGIN 
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'PART 4: Updating note_shares table...';
  RAISE NOTICE '==================================================';
END $migration$;

-- Add event context columns
ALTER TABLE note_shares ADD COLUMN IF NOT EXISTS event_id UUID;
ALTER TABLE note_shares ADD COLUMN IF NOT EXISTS shared_via TEXT DEFAULT 'direct';

-- Add foreign key constraint
DO $migration$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'note_shares_event_id_fkey'
  ) THEN
    ALTER TABLE note_shares ADD CONSTRAINT note_shares_event_id_fkey 
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
  END IF;
END $migration$;

-- Add check constraint
DO $migration$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'note_shares_shared_via_check'
  ) THEN
    ALTER TABLE note_shares ADD CONSTRAINT note_shares_shared_via_check 
    CHECK (shared_via IN ('direct', 'event_attendees', 'bulk_role', 'bulk_all'));
  END IF;
END $migration$;

-- Add index
CREATE INDEX IF NOT EXISTS idx_note_shares_event_id ON note_shares (event_id);
CREATE INDEX IF NOT EXISTS idx_note_shares_shared_via ON note_shares (shared_via);

-- Add comments
COMMENT ON COLUMN note_shares.event_id IS 'Link to event if share was through event distribution';
COMMENT ON COLUMN note_shares.shared_via IS 'How note was shared: direct (1-to-1), event_attendees (event share), bulk_role, bulk_all';

DO $migration$ 
BEGIN 
  RAISE NOTICE '✅ note_shares table updated with event context';
END $migration$;

-- ============================================================================
-- PART 5: CREATE TRIGGERS FOR EVENTS
-- ============================================================================
DO $migration$ 
BEGIN 
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'PART 5: Creating event triggers...';
  RAISE NOTICE '==================================================';
END $migration$;

-- Trigger: Update updated_at on events
DROP TRIGGER IF EXISTS trigger_update_events_updated_at ON events;
CREATE TRIGGER trigger_update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on event_attendance
DROP TRIGGER IF EXISTS trigger_update_event_attendance_updated_at ON event_attendance;
CREATE TRIGGER trigger_update_event_attendance_updated_at
  BEFORE UPDATE ON event_attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-increment current_attendees when QR scanned
CREATE OR REPLACE FUNCTION increment_event_attendees()
RETURNS TRIGGER AS $func$
BEGIN
  -- Only increment for new registrations
  IF TG_OP = 'INSERT' AND NEW.attendance_status = 'registered' THEN
    UPDATE events 
    SET current_attendees = current_attendees + 1 
    WHERE id = NEW.event_id;
  END IF;
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_event_attendees ON event_attendance;
CREATE TRIGGER trigger_increment_event_attendees
  AFTER INSERT ON event_attendance
  FOR EACH ROW EXECUTE FUNCTION increment_event_attendees();

-- Trigger: Auto-decrement current_attendees when attendance cancelled
CREATE OR REPLACE FUNCTION decrement_event_attendees()
RETURNS TRIGGER AS $func$
BEGIN
  -- Decrement when status changed to cancelled
  IF OLD.attendance_status != 'cancelled' AND NEW.attendance_status = 'cancelled' THEN
    UPDATE events 
    SET current_attendees = GREATEST(current_attendees - 1, 0)
    WHERE id = NEW.event_id;
  END IF;
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_decrement_event_attendees ON event_attendance;
CREATE TRIGGER trigger_decrement_event_attendees
  AFTER UPDATE ON event_attendance
  FOR EACH ROW EXECUTE FUNCTION decrement_event_attendees();

-- Trigger: Auto-expire QR codes when event ends
CREATE OR REPLACE FUNCTION auto_expire_qr_codes()
RETURNS TRIGGER AS $func$
BEGIN
  -- When status changes to 'completed', expire QR code
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    NEW.qr_status := 'expired';
  END IF;
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_expire_qr_codes ON events;
CREATE TRIGGER trigger_auto_expire_qr_codes
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION auto_expire_qr_codes();

DO $migration$ 
BEGIN 
  RAISE NOTICE '✅ Created 4 event triggers';
END $migration$;

-- ============================================================================
-- PART 6: CREATE RLS POLICIES FOR EVENTS
-- ============================================================================
DO $migration$ 
BEGIN 
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'PART 6: Creating RLS policies...';
  RAISE NOTICE '==================================================';
END $migration$;

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: events
-- ============================================================================

-- Anyone can view upcoming/ongoing events (for discovery)
CREATE POLICY events_select_public ON events
  FOR SELECT USING (
    status IN ('upcoming', 'ongoing')
  );

-- Organizers can view their own events (any status)
CREATE POLICY events_select_own ON events
  FOR SELECT USING (
    created_by IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Attendees can view events they're registered for
CREATE POLICY events_select_attending ON events
  FOR SELECT USING (
    id IN (
      SELECT event_id FROM event_attendance 
      WHERE user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    )
  );

-- Admins can view all events
CREATE POLICY events_select_admin ON events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

-- Panitia/Ustadz/Admin can create events
CREATE POLICY events_insert_staff ON events
  FOR INSERT WITH CHECK (
    created_by IN (
      SELECT id FROM users 
      WHERE auth_user_id = auth.uid() 
        AND role IN ('admin', 'panitia', 'ustadz')
    )
  );

-- Organizers can update their own events
CREATE POLICY events_update_own ON events
  FOR UPDATE USING (
    created_by IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Admins can update any event
CREATE POLICY events_update_admin ON events
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

-- Organizers can delete their own events (soft delete via status)
CREATE POLICY events_delete_own ON events
  FOR DELETE USING (
    created_by IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- ============================================================================
-- RLS POLICIES: event_attendance
-- ============================================================================

-- Users can view their own attendance records
CREATE POLICY event_attendance_select_own ON event_attendance
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Event organizers can view attendees of their events
CREATE POLICY event_attendance_select_organizer ON event_attendance
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events 
      WHERE created_by IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    )
  );

-- Admins can view all attendance
CREATE POLICY event_attendance_select_admin ON event_attendance
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

-- Users can register themselves (QR scan)
CREATE POLICY event_attendance_insert_self ON event_attendance
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Organizers can manually add attendees
CREATE POLICY event_attendance_insert_organizer ON event_attendance
  FOR INSERT WITH CHECK (
    event_id IN (
      SELECT id FROM events 
      WHERE created_by IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    )
  );

-- Users can update their own attendance (cancel registration)
CREATE POLICY event_attendance_update_own ON event_attendance
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Organizers can update attendance of their events
CREATE POLICY event_attendance_update_organizer ON event_attendance
  FOR UPDATE USING (
    event_id IN (
      SELECT id FROM events 
      WHERE created_by IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    )
  );

DO $migration$ 
BEGIN 
  RAISE NOTICE '✅ Created 16 RLS policies for events & event_attendance';
END $migration$;

-- ============================================================================
-- PART 7: GRANT PERMISSIONS
-- ============================================================================
DO $migration$ 
BEGIN 
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'PART 7: Granting permissions...';
  RAISE NOTICE '==================================================';
END $migration$;

-- Grant permissions to authenticated users
GRANT ALL ON TABLE events TO authenticated;
GRANT ALL ON TABLE event_attendance TO authenticated;

-- Grant select to anon for event discovery
GRANT SELECT ON TABLE events TO anon;

-- Grant permissions to service_role (for edge functions)
GRANT ALL ON TABLE events TO service_role;
GRANT ALL ON TABLE event_attendance TO service_role;

DO $migration$ 
BEGIN 
  RAISE NOTICE '✅ Granted permissions';
END $migration$;

-- ============================================================================
-- PART 8: CREATE HELPER FUNCTIONS
-- ============================================================================
DO $migration$ 
BEGIN 
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'PART 8: Creating helper functions...';
  RAISE NOTICE '==================================================';
END $migration$;

-- Function: Generate unique QR code
CREATE OR REPLACE FUNCTION generate_event_qr_code()
RETURNS TEXT AS $func$
DECLARE
  qr_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate code format: EVT-YYYYMMDD-RANDOM6
    qr_code := 'EVT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
               UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM events WHERE events.qr_code = qr_code) INTO code_exists;
    
    -- Exit loop if unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN qr_code;
END;
$func$ LANGUAGE plpgsql;

-- Function: Check if user can scan QR (validation)
CREATE OR REPLACE FUNCTION can_scan_event_qr(
  p_event_id UUID,
  p_user_id UUID
)
RETURNS JSONB AS $func$
DECLARE
  v_event RECORD;
  v_already_registered BOOLEAN;
  v_result JSONB;
BEGIN
  -- Get event details
  SELECT * INTO v_event FROM events WHERE id = p_event_id;
  
  -- Event not found
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'can_scan', false,
      'reason', 'event_not_found',
      'message', 'Event tidak ditemukan'
    );
  END IF;
  
  -- Check if already registered
  SELECT EXISTS(
    SELECT 1 FROM event_attendance 
    WHERE event_id = p_event_id AND user_id = p_user_id
  ) INTO v_already_registered;
  
  IF v_already_registered THEN
    RETURN jsonb_build_object(
      'can_scan', false,
      'reason', 'already_registered',
      'message', 'Anda sudah terdaftar di event ini'
    );
  END IF;
  
  -- Check QR status
  IF v_event.qr_status != 'active' THEN
    RETURN jsonb_build_object(
      'can_scan', false,
      'reason', 'qr_expired',
      'message', 'QR Code sudah tidak aktif'
    );
  END IF;
  
  -- Check if event cancelled
  IF v_event.status = 'cancelled' THEN
    RETURN jsonb_build_object(
      'can_scan', false,
      'reason', 'event_cancelled',
      'message', 'Event telah dibatalkan'
    );
  END IF;
  
  -- Check if event completed
  IF v_event.status = 'completed' THEN
    RETURN jsonb_build_object(
      'can_scan', false,
      'reason', 'event_ended',
      'message', 'Event sudah selesai'
    );
  END IF;
  
  -- Check capacity
  IF v_event.max_attendees IS NOT NULL 
     AND v_event.current_attendees >= v_event.max_attendees THEN
    RETURN jsonb_build_object(
      'can_scan', false,
      'reason', 'event_full',
      'message', 'Event sudah penuh'
    );
  END IF;
  
  -- All checks passed
  RETURN jsonb_build_object(
    'can_scan', true,
    'event_id', v_event.id,
    'event_title', v_event.title,
    'event_date', v_event.event_date,
    'organization', v_event.organization_name
  );
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get event statistics
CREATE OR REPLACE FUNCTION get_event_stats(p_event_id UUID)
RETURNS JSONB AS $func$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_attendees', COUNT(*),
    'registered', COUNT(*) FILTER (WHERE attendance_status = 'registered'),
    'attended', COUNT(*) FILTER (WHERE attendance_status = 'attended'),
    'no_show', COUNT(*) FILTER (WHERE attendance_status = 'no_show'),
    'note_shared', COUNT(*) FILTER (WHERE note_shared = true),
    'note_accessed', COUNT(*) FILTER (WHERE note_accessed = true),
    'access_rate', 
      CASE 
        WHEN COUNT(*) FILTER (WHERE note_shared = true) > 0 
        THEN ROUND(
          (COUNT(*) FILTER (WHERE note_accessed = true)::NUMERIC / 
           COUNT(*) FILTER (WHERE note_shared = true)::NUMERIC) * 100, 
          2
        )
        ELSE 0
      END
  ) INTO v_stats
  FROM event_attendance
  WHERE event_id = p_event_id;
  
  RETURN v_stats;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

DO $migration$ 
BEGIN 
  RAISE NOTICE '✅ Created 3 helper functions';
END $migration$;

-- ============================================================================
-- FINAL: COMMIT TRANSACTION
-- ============================================================================
DO $migration$ 
BEGIN 
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'EVENT-BASED MIGRATION COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Summary:';
  RAISE NOTICE '- ✅ Created events table (with QR code system)';
  RAISE NOTICE '- ✅ Created event_attendance table (QR scan tracking)';
  RAISE NOTICE '- ✅ Updated notes table (event relationship)';
  RAISE NOTICE '- ✅ Updated note_shares table (event context)';
  RAISE NOTICE '- ✅ Created 4 triggers (auto-increment, auto-expire)';
  RAISE NOTICE '- ✅ Created 16 RLS policies (events + attendance)';
  RAISE NOTICE '- ✅ Created 3 helper functions (QR validation, stats)';
  RAISE NOTICE '- ✅ Granted permissions';
  RAISE NOTICE '';
  RAISE NOTICE 'Event System Features:';
  RAISE NOTICE '- ✅ QR code generation & validation';
  RAISE NOTICE '- ✅ Attendance tracking (auto-increment)';
  RAISE NOTICE '- ✅ Auto-expire QR codes after event';
  RAISE NOTICE '- ✅ YouTube transcript polling support';
  RAISE NOTICE '- ✅ Event-scoped note sharing';
  RAISE NOTICE '- ✅ Attendance analytics';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create event services (TypeScript)';
  RAISE NOTICE '2. Build event management UI';
  RAISE NOTICE '3. Implement QR scanner';
  RAISE NOTICE '4. Setup transcript polling edge function';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Ready for event-based architecture!';
END $migration$;

COMMIT;