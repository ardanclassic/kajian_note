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

  correct: string; // "A", "B", etc
  points: number;
  spare?: any; // Future proofing field
}

// ============================================================================
// STATE & SESSION TYPES
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
  submitAnswer: (questionId: string, optionId: string) => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
}
