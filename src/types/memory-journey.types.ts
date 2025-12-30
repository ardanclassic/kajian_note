/**
 * Memory Journey Types
 * Story-based learning journey with gamification
 */

// ============================================
// CHALLENGE TYPES
// ============================================

export type ChallengeType =
  | "multiple_choice"
  | "true_false"
  | "fill_in_blank"
  | "scenario_decision"
  | "sequence_ordering";

export interface BaseChallenge {
  type: ChallengeType;
  question: string;
  explanation: string;
}

export interface MultipleChoiceChallenge extends BaseChallenge {
  type: "multiple_choice";
  options: string[];
  correct_index: number;
}

export interface TrueFalseChallenge extends BaseChallenge {
  type: "true_false";
  correct_answer: boolean;
}

export interface FillInBlankChallenge extends BaseChallenge {
  type: "fill_in_blank";
  blanks: Record<string, string>;
  correct_answer: string;
}

export interface ScenarioDecisionChallenge extends BaseChallenge {
  type: "scenario_decision";
  options: string[];
  correct_index: number;
}

export interface SequenceOrderingChallenge extends BaseChallenge {
  type: "sequence_ordering";
  items: string[];
  correct_order: number[];
}

export type Challenge =
  | MultipleChoiceChallenge
  | TrueFalseChallenge
  | FillInBlankChallenge
  | ScenarioDecisionChallenge
  | SequenceOrderingChallenge;

// ============================================
// LEARNING CONTENT
// ============================================

export interface Dalil {
  arabic: string;
  translation: string;
  source: string;
  context?: string;
}

export interface Hadith {
  arabic: string;
  translation: string;
  source: string;
  context?: string;
}

export interface LearningContent {
  concept: string;
  key_points: string[];
  dalil?: Dalil | Dalil[];
  hadith?: Hadith;
}

// ============================================
// SCENE STRUCTURE
// ============================================

export interface Scene {
  scene_number: number;
  title: string;
  location: string;
  characters: string[];
  story_text: string;
  learning_content: LearningContent;
  challenge: Challenge;
  xp_reward: number;
  bonus_challenge?: {
    type: "reflection_essay";
    title: string;
    instruction: string;
    guiding_questions: string[];
    bonus_xp: number;
  };
  final_reflection?: {
    title: string;
    intro: string;
    key_lessons: Array<{
      lesson: string;
      explanation: string;
    }>;
    action_items: {
      title: string;
      items: Array<{
        action: string;
        how: string;
      }>;
    };
    closing_message: string;
  };
  storytelling_notes?: {
    emotional_arc?: string;
    key_emotional_moments?: string[];
    teaching_techniques?: string[];
    cultural_authenticity?: string[];
  };
  educator_notes?: {
    learning_objectives?: string[];
    discussion_prompts?: string[];
    assessment_criteria?: string[];
  };
}

// ============================================
// BLUEPRINT STRUCTURE
// ============================================

export interface BlueprintMeta {
  recommended_scenes: number;
  complexity_analysis: {
    section_count: number;
    concept_count: number;
    dalil_count: number;
    reasoning: string;
  };
}

export interface StoryMetadata {
  title: string;
  description: string;
  themes: string[];
  difficulty: "mudah" | "sedang" | "sedang-tinggi" | "tinggi";
  estimated_time: string;
  total_xp: number;
}

export interface Blueprint {
  meta: BlueprintMeta;
  story: StoryMetadata;
  scenes: Scene[];
}

// ============================================
// PROGRESS TRACKING
// ============================================

export interface SceneAnswer {
  sceneNumber: number;
  answer: string | number | number[] | boolean;
  isCorrect: boolean;
  attempts: number;
  xpEarned: number;
  completedAt: string;
}

export interface JourneyProgress {
  completedScenes: number[];
  currentScene: number;
  totalXP: number;
  sceneAnswers: Record<number, SceneAnswer>;
  startedAt: string;
  completedAt: string | null;
  isCompleted: boolean;
  totalTime?: number; // in seconds
}

// ============================================
// JOURNEY DATA
// ============================================

export interface Journey {
  id: string;
  blueprint: Blueprint;
  progress: JourneyProgress;
  metadata: {
    title: string;
    totalScenes: number;
    totalXP: number;
    difficulty: string;
    themes: string[];
    uploadedAt: string;
  };
}

// ============================================
// JOURNEY SUMMARY (for list view)
// ============================================

export interface JourneySummary {
  id: string;
  title: string;
  description: string;
  totalScenes: number;
  completedScenes: number;
  totalXP: number;
  earnedXP: number;
  difficulty: string;
  themes: string[];
  estimatedTime: string;
  progress: number; // percentage
  isCompleted: boolean;
  startedAt: string;
  completedAt: string | null;
  lastAccessedAt: string;
}

// ============================================
// VALIDATION RESULT
// ============================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: string[];
}

// ============================================
// COMPLETION STATS
// ============================================

export interface CompletionStats {
  totalXP: number;
  totalTime: number; // in seconds
  accuracy: number; // percentage
  scenesCompleted: number;
  totalScenes: number;
  badges: string[];
  startedAt: string;
  completedAt: string;
}
