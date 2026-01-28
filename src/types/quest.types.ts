/**
 * Quest Feature Type Definitions
 * Islamic knowledge quiz system types
 * Updated for Appwrite (Topics -> Subtopics -> Questions)
 */

// ============================================================================
// APPWRITE DATA TYPES (Content)
// ============================================================================

/**
 * Main Topic (Category)
 * e.g. Fiqih, Akidah, Sirah
 */
export interface Topic {
  id: string; // Document ID ($id)
  name: string; // e.g. "Fiqih"
  slug: string; // e.g. "fiqih"

  // Virtual / Relations
  subtopics?: Subtopic[];
}

/**
 * Subtopic (Quiz Set)
 * e.g. Fiqih Shalat, Sirah Nabawiyah
 */
export interface Subtopic {
  id: string; // Document ID ($id)
  topic_id: string; // Parent Topic ID (slug)
  title: string;
  slug: string;
  description?: string;

  // Virtual / Relations
  questions?: Question[];
}

/**
 * Question Option Structure (Stored as JSON)
 */
export interface QuestionOption {
  id: string; // "A", "B", "C", "D"
  text: string;
}

/**
 * Detailed Explanation Structure (Stored as JSON)
 */
export interface QuestionExplanation {
  text: string;
  dalil?: string;
  resources?: string[];
}

/**
 * Quiz Question
 */
export interface Question {
  id: string; // Document ID ($id)
  subtopic_id: string; // Parent Subtopic ID (slug)

  text: string; // The question

  // Stored as JSON strings in DB, parsed in app
  options: QuestionOption[];
  explanation: QuestionExplanation | null;

  correct: string; // "A", "B"... OR JSON Array string for Puzzles
  points: number;
  type?: "multiple_choice" | "true_false" | "puzzle_order"; // NEW: Variety Types
  spare?: any; // Future proofing field
}

// ============================================================================
// STATE & SESSION TYPES (SINGLE PLAYER)
// ============================================================================

export interface QuizSessionState {
  topicSlug: string; // Main Topic Slug
  subtopicSlug: string; // Current Subtopic Slug

  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: UserAnswer[]; // Track answers

  startedAt: number; // Timestamp
  completedAt?: number;
  isCompleted: boolean;

  score: number; // Current accumulated score
}

export interface UserAnswer {
  questionId: string;
  selectedOptionId: string; // "A", "B"...
  isCorrect: boolean;
  pointsEarned: number;
  timeSpentMs: number;
}

// ============================================================================
// STORE INTERFACE
// ============================================================================

export interface QuestStore {
  // Data
  topics: Topic[];
  subtopics: Record<string, Subtopic[]>; // Map topic_slug -> subtopics

  // Loading States
  isLoadingTopics: boolean;
  isLoadingSubtopics: boolean;
  isLoadingQuiz: boolean;
  error: string | null;

  // Active Session
  activeSession: QuizSessionState | null;

  // Actions
  fetchTopics: () => Promise<void>;
  fetchSubtopics: (topicSlug: string) => Promise<void>;
  startQuiz: (subtopic: Subtopic) => Promise<void>;
  submitAnswer: (questionId: string, optionId: string | string[]) => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
}

// ============================================================================
// MULTIPLAYER (SUPABASE REALTIME) TYPES
// ============================================================================

export interface Player {
  id: string; // Supabase Auth ID
  username: string;
  avatar_url: string;
  score: number;
  status: "ready" | "playing" | "disconnected";
  is_host: boolean;

  // NEW: Individual Pace
  current_question_idx: number;
  is_finished: boolean;
  streak: number; // NEW: Consecutive correct answers
  redemption_used?: boolean; // NEW: Track if player used their one-time redemption

  // NEW: Power-Ups
  inventory: PowerUpInventory;
  active_effects: PowerUpType[];

  // NEW: Team Mode
  team_id?: string | null; // "TEAM_A", "TEAM_B", or null for solo mode
}

// NEW: Team Information
export interface TeamInfo {
  id: string; // "TEAM_A", "TEAM_B"
  name: string; // "Tim A", "Tim B" or custom names
  color: string; // Hex color for UI
  total_score: number; // Accumulated from all members
  member_count: number;
}

export type PowerUpType = "STREAK_SAVER" | "DOUBLE_POINTS" | "FIFTY_FIFTY" | "TIME_FREEZE";

export type PowerUpInventory = {
  [key in PowerUpType]?: number; // Count of specific powerup
};

// NEW: Answer Log for Scoring Calculation
export interface AnswerLogEntry {
  uid: string;
  correct: boolean;
  timestamp: number;
  is_redemption?: boolean; // NEW: Mark if this was a redemption answer
}

/**
 * Structure stored in 'questions_data' JSONB column in Supabase
 */
export interface QuestSessionState {
  room_code: string;
  status: "WAITING" | "PLAYING" | "FINISHED";
  topic_config: {
    topic: Partial<Topic> | null;
    subtopic: Partial<Subtopic> | null;
    totalQuestions: number;
  };
  players: Player[];
  current_question_idx: number; // Global index (maybe for reference or forced sync)
  answer_logs?: Record<string, AnswerLogEntry[]>; // NEW: Map "q_0" -> logs

  // NEW: Team Mode
  game_mode?: "SOLO" | "TEAM"; // Default: SOLO
  teams?: TeamInfo[]; // Active teams in this session
}

/**
 * Full Session Object (DB Row + Parsed JSON)
 */
export interface QuestSession extends QuestSessionState {
  id: string;
  host_uid: string;
  created_at?: string;
}
