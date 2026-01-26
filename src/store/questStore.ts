import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { QuestStore, Topic, Subtopic, QuizSessionState, UserAnswer, Question } from "@/types/quest.types";
import { questAppwriteService } from "@/services/appwrite";

// Helper function to shuffle array
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const useQuestStore = create<QuestStore>()(
  devtools(
    (set, get) => ({
      // State
      topics: [],
      subtopics: {},
      isLoadingTopics: false,
      isLoadingSubtopics: false,
      isLoadingQuiz: false,
      error: null,
      activeSession: null,

      // Actions
      fetchTopics: async () => {
        set({ isLoadingTopics: true, error: null });
        try {
          const topics = await questAppwriteService.getTopics();
          set({ topics, isLoadingTopics: false });
        } catch (error) {
          console.error("Error fetching topics:", error);
          set({ isLoadingTopics: false, error: "Failed to load topics" });
        }
      },

      fetchSubtopics: async (topicSlug: string) => {
        set({ isLoadingSubtopics: true, error: null });
        try {
          const fetchedSubtopics = await questAppwriteService.getSubtopicsByTopic(topicSlug);

          set((state) => ({
            subtopics: {
              ...state.subtopics,
              [topicSlug]: fetchedSubtopics,
            },
            isLoadingSubtopics: false,
          }));
        } catch (error) {
          console.error("Error fetching subtopics:", error);
          set({ isLoadingSubtopics: false, error: "Failed to load subtopics" });
        }
      },

      startQuiz: async (subtopic: Subtopic) => {
        set({ isLoadingQuiz: true, error: null });
        try {
          const questions = await questAppwriteService.getQuestionsBySubtopic(subtopic.slug);

          if (!questions || questions.length === 0) {
            throw new Error("No questions found for this topic.");
          }

          const shuffledQuestions = shuffleArray(questions).map((q) => ({
            ...q,
            options: shuffleArray(q.options),
          }));

          const session: QuizSessionState = {
            topicSlug: subtopic.topic_id,
            subtopicSlug: subtopic.slug,
            questions: shuffledQuestions,
            currentQuestionIndex: 0,
            userAnswers: [],
            startedAt: Date.now(),
            isCompleted: false,
            score: 0,
          };

          set({ activeSession: session, isLoadingQuiz: false });
        } catch (error) {
          console.error("Error starting quiz:", error);
          set({ isLoadingQuiz: false, error: "Failed to start quiz" });
        }
      },

      submitAnswer: (questionId: string, optionId: string) => {
        const { activeSession } = get();
        if (!activeSession || activeSession.isCompleted) return;

        const currentQ = activeSession.questions[activeSession.currentQuestionIndex];

        // Safety check
        if (currentQ.id !== questionId) {
          console.warn("Question ID mismatch ignored");
        }

        // Robust comparison logic
        const dbCorrect = String(currentQ.correct || "")
          .trim()
          .toUpperCase();
        const userSelected = String(optionId || "")
          .trim()
          .toUpperCase();
        const isCorrect = dbCorrect === userSelected;

        const points = isCorrect ? Number(currentQ.points) || 10 : 0;

        const newAnswer: UserAnswer = {
          questionId: currentQ.id,
          selectedOptionId: optionId,
          isCorrect,
          pointsEarned: points,
          timeSpentMs: 0,
        };

        const updatedAnswers = [...activeSession.userAnswers, newAnswer];
        const newScore = activeSession.score + points;

        set({
          activeSession: {
            ...activeSession,
            userAnswers: updatedAnswers,
            score: newScore,
          },
        });
      },

      nextQuestion: () => {
        const { activeSession } = get();
        if (!activeSession) return;

        const nextIndex = activeSession.currentQuestionIndex + 1;

        if (nextIndex >= activeSession.questions.length) {
          set({
            activeSession: {
              ...activeSession,
              isCompleted: true,
              completedAt: Date.now(),
            },
          });
        } else {
          set({
            activeSession: {
              ...activeSession,
              currentQuestionIndex: nextIndex,
            },
          });
        }
      },

      resetQuiz: () => {
        set({ activeSession: null, error: null });
      },
    }),
    { name: "QuestStore" },
  ),
);
