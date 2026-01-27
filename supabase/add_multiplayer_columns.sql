-- ============================================================================
-- ADD MISSING COLUMNS FOR MULTIPLAYER
-- ============================================================================

-- Add columns to quest_sessions if they don't exist
do $$
begin
    -- 1. game_mode
    if not exists (select 1 from information_schema.columns where table_name='quest_sessions' and column_name='game_mode') then
        alter table public.quest_sessions add column game_mode text default 'SOLO';
    end if;

    -- 2. match_id (Room Code / Room ID grouping)
    if not exists (select 1 from information_schema.columns where table_name='quest_sessions' and column_name='match_id') then
        alter table public.quest_sessions add column match_id text;
    end if;
    
    -- 3. subtopic_slug (Ensure it exists or use subtopic_id)
    if not exists (select 1 from information_schema.columns where table_name='quest_sessions' and column_name='subtopic_slug') then
        alter table public.quest_sessions add column subtopic_slug text;
    end if;

end $$;
