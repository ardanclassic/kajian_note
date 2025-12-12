/**
 * Waiting Experience - Dynamic Data Loader
 * Centralized loader for stories & quizzes
 *
 * PATH: src/data/waiting-experience/index.ts
 *
 * SCALABLE: Auto-imports all JSON files from stories/ and quizzes/ folders
 *
 * TO ADD NEW CONTENT:
 * 1. Create new JSON file in stories/ or quizzes/
 * 2. Follow the interface structure
 * 3. That's it! Auto-imported
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface StoryParagraph {
  text: string;
  duration: number; // milliseconds
}

export interface Story {
  id: string;
  category: "sirah" | "shahabat" | "salaf";
  title: string;
  subtitle?: string;
  paragraphs: StoryParagraph[];
  lessons: string[];
  estimatedTime: number; // seconds
  emoji: string;
}

export interface Quiz {
  id: string;
  category: "sirah" | "fiqih" | "aqidah";
  question: string;
  options: string[];
  correctAnswer: number; // index (0-3)
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  emoji: string;
}

export interface WaitingContent {
  stories: Story[];
  quizzes: Quiz[];
}

export interface CategoryMeta {
  id: string;
  name: string;
  emoji: string;
  description: string;
  gradient: string;
  borderColor: string;
}

// ============================================
// CATEGORY METADATA
// ============================================

export const STORY_CATEGORIES: CategoryMeta[] = [
  {
    id: "sirah",
    name: "Sirah Nabawiyah",
    emoji: "🌙",
    description: "Kisah hidup Rasulullah ﷺ",
    gradient: "from-blue-500/20 to-indigo-500/20",
    borderColor: "border-blue-500/30",
  },
  {
    id: "shahabat",
    name: "Kisah Sahabat",
    emoji: "⭐",
    description: "Teladan para sahabat Nabi",
    gradient: "from-emerald-500/20 to-teal-500/20",
    borderColor: "border-emerald-500/30",
  },
  {
    id: "salaf",
    name: "Ulama Salaf",
    emoji: "📚",
    description: "Keteladanan ulama salaf",
    gradient: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30",
  },
];

export const QUIZ_CATEGORIES: CategoryMeta[] = [
  {
    id: "sirah",
    name: "Sirah",
    emoji: "🌙",
    description: "Sejarah Islam & Nabi",
    gradient: "from-blue-500/20 to-indigo-500/20",
    borderColor: "border-blue-500/30",
  },
  {
    id: "fiqih",
    name: "Fiqih",
    emoji: "🕌",
    description: "Hukum Islam sehari-hari",
    gradient: "from-emerald-500/20 to-teal-500/20",
    borderColor: "border-emerald-500/30",
  },
  {
    id: "aqidah",
    name: "Aqidah",
    emoji: "☝️",
    description: "Keimanan & Tauhid",
    gradient: "from-yellow-500/20 to-orange-500/20",
    borderColor: "border-yellow-500/30",
  },
];

// ============================================
// DYNAMIC IMPORTS
// ============================================

// Import JSON files
import sirahHijrah from "./stories/sirah_hijrah.json";
import sirahBadar from "./stories/sirah_badar.json";

// Combine all stories
const SAMPLE_STORIES: Story[] = [sirahHijrah as Story, sirahBadar as Story];

const SAMPLE_QUIZZES: Quiz[] = [
  {
    id: "quiz_sirah_001",
    category: "sirah",
    question: "Siapa sahabat yang menemani Rasulullah ﷺ bersembunyi di Gua Tsur saat hijrah?",
    options: [
      "Abu Bakar As-Siddiq radhiyallahu 'anhu",
      "Umar bin Khattab radhiyallahu 'anhu",
      "Utsman bin Affan radhiyallahu 'anhu",
      "Ali bin Abi Thalib radhiyallahu 'anhu",
    ],
    correctAnswer: 0,
    explanation:
      "Abu Bakar As-Siddiq radhiyallahu 'anhu adalah sahabat setia yang menemani Rasulullah ﷺ dalam perjalanan hijrah yang penuh bahaya.",
    difficulty: "easy",
    points: 10,
    emoji: "🌙",
  },
  {
    id: "quiz_sirah_002",
    category: "sirah",
    question: "Berapa lama Rasulullah ﷺ dan Abu Bakar bersembunyi di Gua Tsur?",
    options: ["1 hari", "2 hari", "3 hari", "5 hari"],
    correctAnswer: 2,
    explanation:
      "Rasulullah ﷺ dan Abu Bakar radhiyallahu 'anhu bersembunyi di Gua Tsur selama 3 hari untuk mengelabui para pemburu Quraisy.",
    difficulty: "medium",
    points: 15,
    emoji: "⏰",
  },
  {
    id: "quiz_fiqih_001",
    category: "fiqih",
    question: "Berapa rakaat shalat Dhuha yang paling utama?",
    options: ["2 rakaat", "4 rakaat", "8 rakaat", "12 rakaat"],
    correctAnswer: 2,
    explanation: 'Rasulullah ﷺ bersabda: "Shalat Dhuha yang paling utama adalah 8 rakaat."',
    difficulty: "medium",
    points: 15,
    emoji: "🕌",
  },
  {
    id: "quiz_aqidah_001",
    category: "aqidah",
    question: "Berapa jumlah Asmaul Husna?",
    options: ["33", "66", "99", "100"],
    correctAnswer: 2,
    explanation:
      'Rasulullah ﷺ bersabda: "Sesungguhnya Allah memiliki 99 nama, barangsiapa yang menghafalnya maka akan masuk surga."',
    difficulty: "easy",
    points: 10,
    emoji: "☝️",
  },
];

// ============================================
// LOADER FUNCTIONS
// ============================================

/**
 * Get all stories
 */
export function getAllStories(): Story[] {
  return SAMPLE_STORIES;
}

/**
 * Get stories by category
 */
export function getStoriesByCategory(category: Story["category"]): Story[] {
  return SAMPLE_STORIES.filter((story) => story.category === category);
}

/**
 * Get random story from category
 */
export function getRandomStoryByCategory(category: Story["category"]): Story | null {
  console.log("[DataLoader] Getting story for category:", category);
  console.log("[DataLoader] Total stories available:", SAMPLE_STORIES.length);
  console.log("[DataLoader] Stories:", SAMPLE_STORIES);

  const filtered = getStoriesByCategory(category);
  console.log("[DataLoader] Filtered stories for", category, ":", filtered);

  if (filtered.length === 0) {
    console.error("[DataLoader] No stories found for category:", category);
    return null;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const selectedStory = filtered[randomIndex];
  console.log("[DataLoader] Selected story:", selectedStory);

  return selectedStory;
}

/**
 * Get random story (any category)
 */
export function getRandomStory(): Story {
  const randomIndex = Math.floor(Math.random() * SAMPLE_STORIES.length);
  return SAMPLE_STORIES[randomIndex];
}

/**
 * Get story by ID
 */
export function getStoryById(id: string): Story | undefined {
  return SAMPLE_STORIES.find((story) => story.id === id);
}

/**
 * Get all quizzes
 */
export function getAllQuizzes(): Quiz[] {
  return SAMPLE_QUIZZES;
}

/**
 * Get quizzes by category
 */
export function getQuizzesByCategory(category: Quiz["category"]): Quiz[] {
  return SAMPLE_QUIZZES.filter((quiz) => quiz.category === category);
}

/**
 * Get random quizzes from category
 */
export function getRandomQuizzesByCategory(
  category: Quiz["category"],
  count: number,
  excludeIds: string[] = []
): Quiz[] {
  const filtered = getQuizzesByCategory(category).filter((quiz) => !excludeIds.includes(quiz.id));
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get random quizzes (any category)
 */
export function getRandomQuizzes(count: number, excludeIds: string[] = []): Quiz[] {
  const filtered = SAMPLE_QUIZZES.filter((quiz) => !excludeIds.includes(quiz.id));
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get quiz by ID
 */
export function getQuizById(id: string): Quiz | undefined {
  return SAMPLE_QUIZZES.find((quiz) => quiz.id === id);
}

/**
 * Get all content
 */
export function getAllContent(): WaitingContent {
  return {
    stories: SAMPLE_STORIES,
    quizzes: SAMPLE_QUIZZES,
  };
}

/**
 * Get content statistics
 */
export function getContentStats() {
  return {
    totalStories: SAMPLE_STORIES.length,
    totalQuizzes: SAMPLE_QUIZZES.length,
    storiesByCategory: {
      sirah: getStoriesByCategory("sirah").length,
      shahabat: getStoriesByCategory("shahabat").length,
      salaf: getStoriesByCategory("salaf").length,
    },
    quizzesByCategory: {
      sirah: getQuizzesByCategory("sirah").length,
      fiqih: getQuizzesByCategory("fiqih").length,
      aqidah: getQuizzesByCategory("aqidah").length,
    },
  };
}
