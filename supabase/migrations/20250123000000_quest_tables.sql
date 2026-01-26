-- ============================================================================
-- QUEST FEATURE MIGRATION
-- ============================================================================
-- Version: 1.0.0
-- Date: 2025-01-23
-- Author: Quest Feature Implementation
-- 
-- DESCRIPTION:
-- This migration creates the database structure for the Quest feature:
-- - Islamic knowledge quiz system with multiple choice questions
-- - User session tracking and statistics
-- - Question bookmarking to Notes integration
--
-- TABLES:
-- - quest_sessions: Individual quiz session records
-- - quest_stats: Aggregated statistics per user per topic
-- - quest_bookmarks: Saved questions to Notes tracking
--
-- SAFETY NOTES:
-- - All changes are ADDITIVE (no data loss)
-- - Uses IF NOT EXISTS for idempotency
-- - Full rollback script available separately
--
-- EXECUTION TIME: ~10-20 seconds
-- ============================================================================

BEGIN;

DO $quest_migration$ 
BEGIN 
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'QUEST FEATURE MIGRATION - Starting...';
  RAISE NOTICE '==================================================';
END $quest_migration$;

-- ============================================================================
-- TABLE 1: quest_sessions
-- ============================================================================
DO $quest_migration$ 
BEGIN 
  RAISE NOTICE '--------------------------------------------------';
  RAISE NOTICE 'Creating quest_sessions table...';
  RAISE NOTICE '--------------------------------------------------';
END $quest_migration$;

CREATE TABLE IF NOT EXISTS quest_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  topic_slug TEXT NOT NULL,
  
  -- Session configuration
  total_questions INTEGER NOT NULL,
  
  -- Results
  correct_answers INTEGER DEFAULT 0,
  wrong_answers INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  
  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Session data (for review/analytics)
  questions_data JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign keys
  CONSTRAINT quest_sessions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Check constraints
  CONSTRAINT quest_sessions_valid_answers_check 
    CHECK (correct_answers + wrong_answers <= total_questions),
  CONSTRAINT quest_sessions_valid_points_check 
    CHECK (total_points >= 0),
  CONSTRAINT quest_sessions_valid_timing_check 
    CHECK (completed_at IS NULL OR completed_at >= started_at)
);

-- Add comments
COMMENT ON TABLE quest_sessions IS 'Individual quiz session records with results and timing';
COMMENT ON COLUMN quest_sessions.topic_slug IS 'Reference to topic in Appwrite (e.g., fiqih-zakat)';
COMMENT ON COLUMN quest_sessions.questions_data IS 'JSONB array of question IDs and user answers for review';
COMMENT ON COLUMN quest_sessions.duration_seconds IS 'Total session duration, calculated on completion';

-- Indexes for quest_sessions
CREATE INDEX IF NOT EXISTS idx_quest_sessions_user_id 
  ON quest_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_quest_sessions_topic_slug 
  ON quest_sessions(topic_slug);

CREATE INDEX IF NOT EXISTS idx_quest_sessions_completed_at 
  ON quest_sessions(completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_quest_sessions_user_topic 
  ON quest_sessions(user_id, topic_slug);

CREATE INDEX IF NOT EXISTS idx_quest_sessions_created_at 
  ON quest_sessions(created_at DESC);

DO $quest_migration$ 
BEGIN 
  RAISE NOTICE '✅ quest_sessions table created with 5 indexes';
END $quest_migration$;

-- ============================================================================
-- TABLE 2: quest_stats
-- ============================================================================
DO $quest_migration$ 
BEGIN 
  RAISE NOTICE '--------------------------------------------------';
  RAISE NOTICE 'Creating quest_stats table...';
  RAISE NOTICE '--------------------------------------------------';
END $quest_migration$;

CREATE TABLE IF NOT EXISTS quest_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  topic_slug TEXT NOT NULL,
  
  -- Aggregated statistics
  total_sessions INTEGER DEFAULT 0,
  total_questions_answered INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  total_wrong INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  
  -- Calculated fields
  accuracy_percentage DECIMAL(5,2) DEFAULT 0.00,
  best_score INTEGER DEFAULT 0,
  average_score DECIMAL(10,2) DEFAULT 0.00,
  
  -- Timestamps
  first_attempt_at TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign keys
  CONSTRAINT quest_stats_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Unique constraint: one stat record per user per topic
  CONSTRAINT quest_stats_unique_user_topic 
    UNIQUE (user_id, topic_slug),
  
  -- Check constraints
  CONSTRAINT quest_stats_valid_accuracy_check 
    CHECK (accuracy_percentage >= 0 AND accuracy_percentage <= 100),
  CONSTRAINT quest_stats_valid_sessions_check 
    CHECK (total_sessions >= 0),
  CONSTRAINT quest_stats_valid_points_check 
    CHECK (total_points >= 0)
);

-- Add comments
COMMENT ON TABLE quest_stats IS 'Aggregated quiz statistics per user per topic for performance tracking';
COMMENT ON COLUMN quest_stats.accuracy_percentage IS 'Overall accuracy: (total_correct / total_questions_answered) * 100';
COMMENT ON COLUMN quest_stats.best_score IS 'Highest score achieved in any single session';
COMMENT ON COLUMN quest_stats.average_score IS 'Average score across all sessions';

-- Indexes for quest_stats
CREATE INDEX IF NOT EXISTS idx_quest_stats_user_id 
  ON quest_stats(user_id);

CREATE INDEX IF NOT EXISTS idx_quest_stats_topic_slug 
  ON quest_stats(topic_slug);

CREATE INDEX IF NOT EXISTS idx_quest_stats_accuracy 
  ON quest_stats(accuracy_percentage DESC);

CREATE INDEX IF NOT EXISTS idx_quest_stats_last_attempt 
  ON quest_stats(last_attempt_at DESC);

DO $quest_migration$ 
BEGIN 
  RAISE NOTICE '✅ quest_stats table created with 4 indexes';
END $quest_migration$;

-- ============================================================================
-- TABLE 3: quest_bookmarks
-- ============================================================================
DO $quest_migration$ 
BEGIN 
  RAISE NOTICE '--------------------------------------------------';
  RAISE NOTICE 'Creating quest_bookmarks table...';
  RAISE NOTICE '--------------------------------------------------';
END $quest_migration$;

CREATE TABLE IF NOT EXISTS quest_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  note_id UUID NOT NULL,
  
  -- Question reference (from Appwrite)
  question_id TEXT NOT NULL,
  topic_slug TEXT NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign keys
  CONSTRAINT quest_bookmarks_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT quest_bookmarks_note_id_fkey 
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  
  -- Unique constraint: one bookmark per question per user
  CONSTRAINT quest_bookmarks_unique_user_question 
    UNIQUE (user_id, question_id)
);

-- Add comments
COMMENT ON TABLE quest_bookmarks IS 'Tracks questions saved to Notes for future reference';
COMMENT ON COLUMN quest_bookmarks.question_id IS 'Appwrite question document ID';
COMMENT ON COLUMN quest_bookmarks.note_id IS 'Reference to created note in notes table';

-- Indexes for quest_bookmarks
CREATE INDEX IF NOT EXISTS idx_quest_bookmarks_user_id 
  ON quest_bookmarks(user_id);

CREATE INDEX IF NOT EXISTS idx_quest_bookmarks_note_id 
  ON quest_bookmarks(note_id);

CREATE INDEX IF NOT EXISTS idx_quest_bookmarks_question_id 
  ON quest_bookmarks(question_id);

CREATE INDEX IF NOT EXISTS idx_quest_bookmarks_topic_slug 
  ON quest_bookmarks(topic_slug);

DO $quest_migration$ 
BEGIN 
  RAISE NOTICE '✅ quest_bookmarks table created with 4 indexes';
END $quest_migration$;

-- ============================================================================
-- TRIGGERS: Auto-update updated_at timestamps
-- ============================================================================
DO $quest_migration$ 
BEGIN 
  RAISE NOTICE '--------------------------------------------------';
  RAISE NOTICE 'Creating triggers...';
  RAISE NOTICE '--------------------------------------------------';
END $quest_migration$;

-- Trigger for quest_sessions
DROP TRIGGER IF EXISTS trigger_update_quest_sessions_updated_at ON quest_sessions;
CREATE TRIGGER trigger_update_quest_sessions_updated_at
  BEFORE UPDATE ON quest_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for quest_stats
DROP TRIGGER IF EXISTS trigger_update_quest_stats_updated_at ON quest_stats;
CREATE TRIGGER trigger_update_quest_stats_updated_at
  BEFORE UPDATE ON quest_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $quest_migration$ 
BEGIN 
  RAISE NOTICE '✅ Created 2 triggers for timestamp management';
END $quest_migration$;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
DO $quest_migration$ 
BEGIN 
  RAISE NOTICE '--------------------------------------------------';
  RAISE NOTICE 'Setting up RLS policies...';
  RAISE NOTICE '--------------------------------------------------';
END $quest_migration$;

-- Enable RLS
ALTER TABLE quest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_bookmarks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: quest_sessions
-- ============================================================================

-- Users can view their own sessions
CREATE POLICY quest_sessions_select_own ON quest_sessions
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Users can create their own sessions
CREATE POLICY quest_sessions_insert_own ON quest_sessions
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Users can update their own sessions
CREATE POLICY quest_sessions_update_own ON quest_sessions
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Users can delete their own sessions
CREATE POLICY quest_sessions_delete_own ON quest_sessions
  FOR DELETE USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Admins can view all sessions
CREATE POLICY quest_sessions_select_admin ON quest_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- RLS POLICIES: quest_stats
-- ============================================================================

-- Users can view their own stats
CREATE POLICY quest_stats_select_own ON quest_stats
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Users can insert their own stats
CREATE POLICY quest_stats_insert_own ON quest_stats
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Users can update their own stats
CREATE POLICY quest_stats_update_own ON quest_stats
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Admins can view all stats
CREATE POLICY quest_stats_select_admin ON quest_stats
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- RLS POLICIES: quest_bookmarks
-- ============================================================================

-- Users can view their own bookmarks
CREATE POLICY quest_bookmarks_select_own ON quest_bookmarks
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Users can create their own bookmarks
CREATE POLICY quest_bookmarks_insert_own ON quest_bookmarks
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Users can delete their own bookmarks
CREATE POLICY quest_bookmarks_delete_own ON quest_bookmarks
  FOR DELETE USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

DO $quest_migration$ 
BEGIN 
  RAISE NOTICE '✅ Created 13 RLS policies (5 sessions + 4 stats + 3 bookmarks + 1 admin)';
END $quest_migration$;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
DO $quest_migration$ 
BEGIN 
  RAISE NOTICE '--------------------------------------------------';
  RAISE NOTICE 'Granting permissions...';
  RAISE NOTICE '--------------------------------------------------';
END $quest_migration$;

-- Grant permissions to authenticated users
GRANT ALL ON TABLE quest_sessions TO authenticated;
GRANT ALL ON TABLE quest_stats TO authenticated;
GRANT ALL ON TABLE quest_bookmarks TO authenticated;

-- Grant permissions to service_role (for edge functions)
GRANT ALL ON TABLE quest_sessions TO service_role;
GRANT ALL ON TABLE quest_stats TO service_role;
GRANT ALL ON TABLE quest_bookmarks TO service_role;

DO $quest_migration$ 
BEGIN 
  RAISE NOTICE '✅ Granted permissions to authenticated and service_role';
END $quest_migration$;

-- ============================================================================
-- FINAL SUMMARY
-- ============================================================================
DO $quest_migration$ 
BEGIN 
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'QUEST FEATURE MIGRATION COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '==================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Summary:';
  RAISE NOTICE '- ✅ Created 3 tables (quest_sessions, quest_stats, quest_bookmarks)';
  RAISE NOTICE '- ✅ Created 13 indexes for optimal query performance';
  RAISE NOTICE '- ✅ Created 2 triggers for auto-timestamp updates';
  RAISE NOTICE '- ✅ Created 13 RLS policies for data security';
  RAISE NOTICE '- ✅ Granted appropriate permissions';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables are ready for use!';
  RAISE NOTICE 'Next: Setup Appwrite collections and SDK integration';
  RAISE NOTICE '';
END $quest_migration$;

COMMIT;
