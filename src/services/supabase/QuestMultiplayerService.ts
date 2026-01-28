import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { toast } from "sonner";
import type { Player, QuestSession, QuestSessionState } from "@/types/quest.types";

/**
 * Supabase Multiplayer Service
 * Handles Lobby & Game Session using Supabase Realtime
 * Stores game state inside 'questions_data' JSONB column to avoid schema changes.
 */

// ------------------------------------------------------------------
// HELPER: Generate Room Code
// ------------------------------------------------------------------
const generateRoomCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// ------------------------------------------------------------------
// HELPER: Adapters
// ------------------------------------------------------------------
// Convert DB Row to Application QuestSession Object
const mapRowToSession = (row: any): QuestSession => {
  const state = (row.questions_data || {}) as QuestSessionState;

  return {
    id: row.id,
    room_code: state.room_code || "", // Fallback if missing
    host_uid: row.user_id,
    status: state.status || "WAITING",
    topic_config: state.topic_config || { topic: null, subtopic: null, totalQuestions: 0 },
    players: state.players || [],
    current_question_idx: state.current_question_idx || 0,
    created_at: row.created_at,
    // Add answer logs to state wrapper if needed, for now implied in state
    answer_logs: state.answer_logs || {},

    // Team Mode Mapping
    game_mode: state.game_mode || "SOLO",
    teams: state.teams || [],
  };
};

/**
 * TEAM MODE: Recalculate Team Scores from Player Scores
 * Helper function used by multiple methods
 */
const recalculateTeamScores = (state: QuestSessionState): QuestSessionState => {
  if (state.game_mode !== "TEAM" || !state.teams) return state;

  const updatedTeams = state.teams.map((team) => {
    const teamMembers = state.players.filter((p) => p.team_id === team.id);
    const totalScore = teamMembers.reduce((sum, p) => sum + (p.score || 0), 0);
    return {
      ...team,
      total_score: totalScore,
      member_count: teamMembers.length,
    };
  });

  return { ...state, teams: updatedTeams };
};

// ------------------------------------------------------------------
// CORE SERVICE
// ------------------------------------------------------------------
export const questMultiplayerService = {
  /**
   * Create a new Room
   * Uses 'quest_sessions' table, storing transient state in 'questions_data'
   */
  createRoom: async (
    host: { uid: string; name: string; avatar: string; tier?: "FREE" | "PREMIUM" },
    config: any,
    enableTeamMode: boolean = false, // NEW: Team Mode toggle
  ): Promise<QuestSession> => {
    const roomCode = generateRoomCode();

    // ⚠️ TEMPORARY: Disabled for Development/Testing Phase
    // TODO: Re-enable tier-based limits before production
    // Determine Max Players based on Host Tier
    // const tier = host.tier || "FREE";
    // const limit = tier === "PREMIUM" ? 10 : 2;

    // TESTING: Allow all users (free & premium) to have 10 players
    const limit = 10;

    // Initial State
    const hostPlayer: Player = {
      id: host.uid,
      username: host.name,
      avatar_url: host.avatar,
      score: 0,
      status: "ready",
      is_host: true,
      current_question_idx: 0, // NEW: Indivdual Progress
      is_finished: false, // NEW: Indivdual Progress
      streak: 0,
      inventory: { STREAK_SAVER: 1, DOUBLE_POINTS: 1, FIFTY_FIFTY: 1, TIME_FREEZE: 1 },
      active_effects: [],
      team_id: null, // Host starts without team (will choose in lobby)
    };

    // Initialize Teams if Team Mode enabled
    const initialTeams: any[] = enableTeamMode
      ? [
          { id: "TEAM_A", name: "Tim A", emoji: "🔵", color: "#3b82f6", total_score: 0, member_count: 0 }, // Blue
          { id: "TEAM_B", name: "Tim B", emoji: "🔴", color: "#ef4444", total_score: 0, member_count: 0 }, // Red
        ]
      : [];

    const initialState: QuestSessionState = {
      room_code: roomCode,
      status: "WAITING",
      topic_config: { ...config, max_players: limit }, // Store limit in config
      players: [hostPlayer],
      current_question_idx: 0, // Keep global for host sync or other uses
      answer_logs: {}, // NEW: Track who answered what and when
      game_mode: enableTeamMode ? "TEAM" : "SOLO",
      teams: initialTeams,
    };

    // DB Insert
    const { data, error } = await supabase
      .from("quest_sessions")
      .insert({
        user_id: host.uid,
        topic_slug: config.topic?.id || "unknown",
        subtopic_slug: config.subtopic?.id || "unknown",
        total_questions: config.totalQuestions || 10,
        game_mode: initialState.game_mode, // Use dynamic game_mode (SOLO or TEAM)
        match_id: roomCode,
        started_at: new Date().toISOString(),
        questions_data: initialState,
      })
      .select()
      .single();

    if (error) {
      console.error("Create Room Error:", error);
      throw error;
    }

    return mapRowToSession(data);
  },

  /**
   * Join existing Room
   */
  joinRoom: async (roomCode: string, user: { uid: string; name: string; avatar: string }): Promise<QuestSession> => {
    // 1. Find Room by room_code inside JSONB
    const { data: rooms, error: fetchError } = await supabase
      .from("quest_sessions")
      .select("*")
      .eq("questions_data->>room_code", roomCode)
      .limit(1);

    if (fetchError || !rooms || rooms.length === 0) {
      throw new Error("Room tidak ditemukan atau kode salah");
    }

    const row = rooms[0];
    const session = mapRowToSession(row);

    // READ LIMIT FROM CONFIG
    // Default 2 if not set (backward compatibility)
    const maxPlayers = (session.topic_config as any).max_players || 2;

    // 2. Validations
    if (session.status !== "WAITING") {
      throw new Error("Game sudah berjalan atau selesai");
    }

    // Check Idempotency FIRST (If already joined, allow re-join logic or just return it)
    const existingPlayer = session.players.find((p) => p.id === user.uid);
    if (existingPlayer) {
      return session; // Allow re-entering lobby
    }

    // THEN Check Max Players
    if (session.players.length >= maxPlayers) {
      throw new Error(`Room penuh (Maksimal ${maxPlayers} pemain untuk Host ${maxPlayers === 2 ? "Free" : "Premium"})`);
    }

    // 4. Add Player
    const newPlayer: Player = {
      id: user.uid,
      username: user.name,
      avatar_url: user.avatar,
      score: 0,
      status: "ready",
      is_host: false,
      current_question_idx: 0,
      is_finished: false,
      streak: 0,
      inventory: { STREAK_SAVER: 1, DOUBLE_POINTS: 1, FIFTY_FIFTY: 1, TIME_FREEZE: 1 },
      active_effects: [],
    };

    const updatedPlayers = [...session.players, newPlayer];

    // Construct new state to save
    const updatedState: QuestSessionState = {
      ...((row.questions_data as any) || {}),
      players: updatedPlayers,
    };

    // 5. Update DB
    const { data: updatedRow, error: updateError } = await supabase
      .from("quest_sessions")
      .update({ questions_data: updatedState })
      .eq("id", row.id)
      .select()
      .single();

    if (updateError) {
      console.error("Join Room Error:", updateError);
      throw new Error("Gagal join room");
    }

    return mapRowToSession(updatedRow);
  },

  /**
   * Get Room Details (One-time fetch)
   */
  getRoom: async (roomId: string): Promise<QuestSession | null> => {
    const { data, error } = await supabase.from("quest_sessions").select("*").eq("id", roomId).single();
    if (error) return null;
    return mapRowToSession(data);
  },

  /**
   * Subscribe to Room Updates (Realtime)
   */
  subscribeToRoom: (roomId: string, onUpdate: (room: QuestSession) => void, onDelete?: () => void) => {
    const channelName = `room:${roomId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "quest_sessions",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            if (onDelete) onDelete();
            return;
          }
          const newRow = payload.new;
          if (newRow) {
            onUpdate(mapRowToSession(newRow));
          }
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`✅ Subscribed to Supabase channel: ${channelName}`);
        }
      });

    return channel;
  },

  unsubscribe: (channel: RealtimeChannel) => {
    supabase.removeChannel(channel);
  },

  /**
   * Start Game
   */
  startGame: async (roomId: string) => {
    const { data } = await supabase.from("quest_sessions").select("questions_data").eq("id", roomId).single();
    if (!data) return;

    const currentState = data.questions_data as QuestSessionState;
    const newState = {
      ...currentState,
      status: "PLAYING" as const,
      current_question_idx: 0,
    };

    await supabase.from("quest_sessions").update({ questions_data: newState }).eq("id", roomId);
  },

  /**
   * TEAM MODE: Join a Team
   */
  joinTeam: async (roomId: string, playerId: string, teamId: string) => {
    const { data } = await supabase.from("quest_sessions").select("questions_data").eq("id", roomId).single();
    if (!data) return;

    const currentState = data.questions_data as QuestSessionState;

    // Validate team mode
    if (currentState.game_mode !== "TEAM") {
      console.warn("Cannot join team: Room is not in TEAM mode");
      return;
    }

    // Validate team exists
    if (!currentState.teams?.find((t) => t.id === teamId)) {
      console.warn(`Team ${teamId} does not exist`);
      return;
    }

    // Update player's team
    const updatedPlayers = currentState.players.map((p) => {
      if (p.id === playerId) {
        return { ...p, team_id: teamId };
      }
      return p;
    });

    let newState: QuestSessionState = { ...currentState, players: updatedPlayers };

    // Recalculate team member counts
    newState = recalculateTeamScores(newState);

    await supabase.from("quest_sessions").update({ questions_data: newState }).eq("id", roomId);
  },

  /**
   * TEAM MODE: Auto Balance Teams
   * Randomly distributes players into available teams
   */
  autoBalanceTeams: async (roomId: string) => {
    const { data } = await supabase.from("quest_sessions").select("questions_data").eq("id", roomId).single();
    if (!data) return;

    const currentState = data.questions_data as QuestSessionState;

    if (currentState.game_mode !== "TEAM" || !currentState.teams || currentState.teams.length < 2) {
      return;
    }

    const players = [...currentState.players];
    const teamIds = currentState.teams.map((t) => t.id);

    // Shuffle players (Fisher-Yates)
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j], players[i]];
    }

    // Distribute
    const updatedPlayers = players.map((p, idx) => {
      // Round robin assignment
      const teamId = teamIds[idx % teamIds.length];
      return { ...p, team_id: teamId };
    });

    let newState: QuestSessionState = { ...currentState, players: updatedPlayers };

    // Recalculate stats
    newState = recalculateTeamScores(newState);

    await supabase.from("quest_sessions").update({ questions_data: newState }).eq("id", roomId);
  },

  /**
   * Use Power Up
   * Updates inventory immediately. Adds to active_effects if persistent (e.g. Double Points).
   */
  usePowerUp: async (
    roomId: string,
    playerId: string,
    powerUp: "STREAK_SAVER" | "DOUBLE_POINTS" | "FIFTY_FIFTY" | "TIME_FREEZE",
  ) => {
    const { data } = await supabase.from("quest_sessions").select("questions_data").eq("id", roomId).single();
    if (!data) return;

    const currentState = data.questions_data as QuestSessionState;
    const players = currentState.players || [];

    const updatedPlayers = players.map((p) => {
      if (p.id === playerId) {
        const inv = p.inventory || {};
        const count = inv[powerUp] || 0;

        if (count > 0) {
          // Decrement
          const newInv = { ...inv, [powerUp]: count - 1 };

          // Add to effects if persistent
          let newEffects = p.active_effects || [];
          if (powerUp === "DOUBLE_POINTS" || powerUp === "STREAK_SAVER") {
            // Only add if not already active to avoid waste? Or stack? Let's say unique (Set)
            if (!newEffects.includes(powerUp)) {
              newEffects = [...newEffects, powerUp];
            }
          }

          return { ...p, inventory: newInv, active_effects: newEffects };
        }
      }
      return p;
    });

    await supabase
      .from("quest_sessions")
      .update({ questions_data: { ...currentState, players: updatedPlayers } })
      .eq("id", roomId);
  },

  /**
   * Submit Answer with Tiered Scoring Logic (Decay 50%)
   * Also Handles Self-paced Progression
   */
  submitAnswer: async (
    roomId: string,
    playerId: string,
    questionIdx: number,
    isCorrect: boolean,
    basePoints: number,
    timeSpentMs: number = 0,
    isRedemption: boolean = false,
  ) => {
    // 1. Fetch Latest State
    const { data } = await supabase.from("quest_sessions").select("questions_data").eq("id", roomId).single();
    if (!data) return;

    const currentState = data.questions_data as QuestSessionState;
    const logs = currentState.answer_logs || {}; // { "q_0": [ {uid, correct} ] }
    const players = currentState.players || [];
    const questionKey = `q_${questionIdx}`;

    // Get log for this specific question
    const currentQuestionLog = logs[questionKey] || [];

    // --- VALIDATION & DUPLICATE CHECK ---
    const previousAnswer = currentQuestionLog.find((l) => l.uid === playerId);
    const player = players.find((p) => p.id === playerId);

    if (!player) return;

    if (isRedemption) {
      // Redemption Rules:
      // 1. Must have answered previously AND served WRONG
      if (!previousAnswer || previousAnswer.correct) {
        console.warn("Invalid redemption attempt: No wrong answer found.");
        return;
      }
      // 2. Must NOT have used redemption before (One-time use)
      if (player.redemption_used) {
        console.warn("Invalid redemption attempt: Already used.");
        return;
      }
    } else {
      // Normal Mode: Prevent double submit
      if (previousAnswer) return;
    }

    // --- POWER UP CHECKS ---
    const activeEffects = player.active_effects || [];
    const hasDoublePoints = activeEffects.includes("DOUBLE_POINTS");
    const hasStreakSaver = activeEffects.includes("STREAK_SAVER");

    // --- DYNAMIC SCORING LOGIC ---
    const BASE_SCORE = 1000;
    const MAX_TIME_BONUS = 500;
    const MAX_TIME_MS = 20000;

    let pointsEarned = 0;
    let newStreak = player.streak || 0;

    if (isRedemption) {
      // REDEMPTION SCORING:
      // - Correct: Flat 50% of Base Score. No Time Bonus. No Streak Inc.
      // - Wrong: 0
      if (isCorrect) {
        pointsEarned = Math.round(BASE_SCORE * 0.5);
      }
      // Redemption doesn't break or build streak
    } else {
      // NORMAL SCORING
      if (isCorrect) {
        newStreak = newStreak + 1;

        // Time Bonus
        const timeFactor = Math.max(0, 1 - timeSpentMs / MAX_TIME_MS);
        const timeBonus = Math.round(MAX_TIME_BONUS * timeFactor);

        let points = BASE_SCORE + timeBonus;

        // Streak Multiplier
        let multiplier = 1.0;
        if (newStreak >= 10) multiplier = 2.0;
        else if (newStreak >= 5) multiplier = 1.5;
        else if (newStreak >= 3) multiplier = 1.2;

        pointsEarned = Math.round(points * multiplier);

        // Apply Power Up: Double Points
        if (hasDoublePoints) {
          pointsEarned *= 2;
        }
      } else {
        // WRONG ANSWER
        if (hasStreakSaver) {
          // Protect streak!
          // newStreak remains = player.streak (don't reset to 0)
          console.log("Streak Saver Protected!");
        } else {
          newStreak = 0;
        }
        pointsEarned = 0;
      }
    }

    // --- UPDATE STATE ---

    // 1. Add to Log
    const newLogEntry = {
      uid: playerId,
      correct: isCorrect,
      timestamp: Date.now(),
      is_redemption: isRedemption, // Mark log
    };
    const newQuestionLog = [...currentQuestionLog, newLogEntry];
    const newLogs = { ...logs, [questionKey]: newQuestionLog };

    // 2. Update Player Score & Progress
    const updatedPlayers = players.map((p) => {
      if (p.id === playerId) {
        const updates: Partial<Player> = {
          score: (p.score || 0) + pointsEarned,
        };

        // Consume One-Time Effects (remove from active_effects)
        let nextEffects = p.active_effects || [];
        if (hasDoublePoints) nextEffects = nextEffects.filter((e) => e !== "DOUBLE_POINTS");
        if (hasStreakSaver && !isCorrect && !isRedemption)
          nextEffects = nextEffects.filter((e) => e !== "STREAK_SAVER"); // Consume on usage

        updates.active_effects = nextEffects;

        if (isRedemption) {
          updates.redemption_used = true;
          // Do not advance question index or changing streak
        } else {
          updates.current_question_idx = questionIdx + 1; // Advance
          updates.streak = newStreak;
        }

        return { ...p, ...updates };
      }
      return p;
    });

    let newState: QuestSessionState = {
      ...currentState,
      players: updatedPlayers,
      answer_logs: newLogs,
    };

    // Recalculate team scores if in TEAM mode
    newState = recalculateTeamScores(newState);

    await supabase.from("quest_sessions").update({ questions_data: newState }).eq("id", roomId);
  },

  /**
   * Mark Player as Finished (Self-paced)
   */
  finishPlayer: async (roomId: string, playerId: string, totalQuestions: number) => {
    const { data } = await supabase.from("quest_sessions").select("questions_data").eq("id", roomId).single();
    if (!data) return;

    const currentState = data.questions_data as QuestSessionState;
    const players = currentState.players || [];

    const updatedPlayers = players.map((p) => {
      if (p.id === playerId) {
        return { ...p, is_finished: true, current_question_idx: totalQuestions };
      }
      return p;
    });

    // Check if ALL players are finished
    const allFinished = updatedPlayers.every((p) => p.is_finished);
    let status = currentState.status;

    if (allFinished) {
      status = "FINISHED";
      // Trigger permanent DB updates (finishGame logic) here or separately?
      // Let's call finishGame logic here if all finished to be safe
    }

    const newState = {
      ...currentState,
      players: updatedPlayers,
      status: status,
    };

    const updatePayload: any = { questions_data: newState };

    // If everyone finished, also update top-level columns
    if (allFinished) {
      updatePayload.completed_at = new Date().toISOString();
      // We might want to sum totals here but let's do it in a separate cleanup or just store raw data
    }

    await supabase.from("quest_sessions").update(updatePayload).eq("id", roomId);
  },

  deleteRoom: async (roomId: string) => {
    await supabase.from("quest_sessions").delete().eq("id", roomId);
  },
};
