-- ============================================================================
-- SUPABASE MULTIPLAYER SETUP (REVISED)
-- Run this in Supabase SQL Editor
-- ============================================================================

-- 1. Enable Realtime for 'quest_sessions' table
--    Check if table is already in publication, if not, add it.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
    and schemaname = 'public' 
    and tablename = 'quest_sessions'
  ) then
    alter publication supabase_realtime add table public.quest_sessions;
  end if;
end $$;

-- 2. Configure RLS (Row Level Security) Policies
--    We need to allow Guests to update the Host's room row (to Join & Submit Score).

-- Enable RLS on the table (if not already)
alter table public.quest_sessions enable row level security;

-- Drop existing policies to ensure clean slate (safe to run multiple times)
drop policy if exists "Enable read access for all users" on public.quest_sessions;
drop policy if exists "Enable insert for authenticated users only" on public.quest_sessions;
drop policy if exists "Enable update for room participants" on public.quest_sessions;
drop policy if exists "Enable delete for host only" on public.quest_sessions;

-- New Policies Names (to avoid conflicts)
drop policy if exists "Enable read access for authenticated users" on public.quest_sessions;
drop policy if exists "Enable insert for authenticated users" on public.quest_sessions;
drop policy if exists "Enable update for authenticated users" on public.quest_sessions;

-- POLICY 1: SELECT (Read)
-- Allow anyone logged in to see active rooms (for joining).
create policy "Enable read access for authenticated users"
on public.quest_sessions for select
to authenticated
using (true);

-- POLICY 2: INSERT (Create Room)
-- Allow any logged in user to create a room.
create policy "Enable insert for authenticated users"
on public.quest_sessions for insert
to authenticated
with check (auth.uid() = user_id);

-- POLICY 3: UPDATE (Join & Play)
-- CRITICAL: Allow any authenticated user to UPDATE any room.
-- This is required because 'Guests' need to write their presence and score
-- into the 'questions_data' JSON column of the Host's row.
create policy "Enable update for authenticated users"
on public.quest_sessions for update
to authenticated
using (true)
with check (true);

-- POLICY 4: DELETE (Cleanup)
-- Only the Host (Creator) can delete/disband the room.
create policy "Enable delete for host only"
on public.quest_sessions for delete
to authenticated
using (auth.uid() = user_id);
