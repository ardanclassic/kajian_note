/**
 * Memory Journey Store - State Management for Memory Journey
 * Uses Zustand with localStorage persistence
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Journey, JourneySummary, Blueprint, SceneAnswer, JourneyProgress } from "@/types/memory-journey.types";

// ============================================
// STORE STATE INTERFACE
// ============================================

interface MemoryJourneyState {
  // Current active journey
  currentJourney: Journey | null;
  currentSceneIndex: number;

  // All journeys (stored in localStorage)
  journeys: Journey[];

  // UI State
  isLoading: boolean;
  error: string | null;

  // Actions
  loadJourney: (journeyId: string) => void;
  createJourney: (blueprint: Blueprint) => string;
  updateProgress: (sceneNumber: number, answer: SceneAnswer) => void;
  completeScene: (sceneNumber: number, xp: number) => void;
  unlockNextScene: () => void;
  resetJourney: (journeyId: string) => void;
  deleteJourney: (journeyId: string) => void;
  getAllJourneys: () => JourneySummary[];
  setCurrentScene: (sceneIndex: number) => void;
  clearCurrentJourney: () => void;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const generateJourneyId = (): string => {
  return `journey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const calculateProgress = (journey: Journey): number => {
  const completed = journey.progress.completedScenes.length;
  const total = journey.blueprint.scenes.length;
  return Math.round((completed / total) * 100);
};

const initializeProgress = (blueprint: Blueprint): JourneyProgress => {
  return {
    completedScenes: [],
    currentScene: 1,
    totalXP: 0,
    sceneAnswers: {},
    startedAt: new Date().toISOString(),
    completedAt: null,
    isCompleted: false,
    totalTime: 0,
  };
};

// ============================================
// ZUSTAND STORE
// ============================================

export const useMemoryJourneyStore = create<MemoryJourneyState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentJourney: null,
      currentSceneIndex: 0,
      journeys: [],
      isLoading: false,
      error: null,

      // ========================================
      // CREATE JOURNEY
      // ========================================
      createJourney: (blueprint: Blueprint) => {
        const journeyId = generateJourneyId();

        const newJourney: Journey = {
          id: journeyId,
          blueprint,
          progress: initializeProgress(blueprint),
          metadata: {
            title: blueprint.story.title,
            totalScenes: blueprint.scenes.length,
            totalXP: blueprint.story.total_xp,
            difficulty: blueprint.story.difficulty,
            themes: blueprint.story.themes,
            uploadedAt: new Date().toISOString(),
          },
        };

        set((state) => ({
          journeys: [...state.journeys, newJourney],
          currentJourney: newJourney,
          currentSceneIndex: 0,
        }));

        return journeyId;
      },

      // ========================================
      // LOAD JOURNEY
      // ========================================
      loadJourney: (journeyId: string) => {
        const { journeys } = get();
        const journey = journeys.find((j) => j.id === journeyId);

        if (journey) {
          const currentSceneIndex = journey.progress.currentScene - 1;
          set({
            currentJourney: journey,
            currentSceneIndex,
            error: null,
          });
        } else {
          set({
            error: `Journey dengan ID ${journeyId} tidak ditemukan`,
          });
        }
      },

      // ========================================
      // UPDATE PROGRESS
      // ========================================
      updateProgress: (sceneNumber: number, answer: SceneAnswer) => {
        set((state) => {
          if (!state.currentJourney) return state;

          const updatedJourney = {
            ...state.currentJourney,
            progress: {
              ...state.currentJourney.progress,
              sceneAnswers: {
                ...state.currentJourney.progress.sceneAnswers,
                [sceneNumber]: answer,
              },
            },
          };

          // Update in journeys array
          const updatedJourneys = state.journeys.map((j) => (j.id === state.currentJourney!.id ? updatedJourney : j));

          return {
            currentJourney: updatedJourney,
            journeys: updatedJourneys,
          };
        });
      },

      // ========================================
      // COMPLETE SCENE
      // ========================================
      completeScene: (sceneNumber: number, xp: number) => {
        set((state) => {
          if (!state.currentJourney) return state;

          const completedScenes = [...state.currentJourney.progress.completedScenes, sceneNumber];

          const totalXP = state.currentJourney.progress.totalXP + xp;
          const totalScenes = state.currentJourney.blueprint.scenes.length;
          const isCompleted = completedScenes.length === totalScenes;

          const updatedJourney = {
            ...state.currentJourney,
            progress: {
              ...state.currentJourney.progress,
              completedScenes,
              totalXP,
              isCompleted,
              completedAt: isCompleted ? new Date().toISOString() : null,
            },
          };

          // Update in journeys array
          const updatedJourneys = state.journeys.map((j) => (j.id === state.currentJourney!.id ? updatedJourney : j));

          return {
            currentJourney: updatedJourney,
            journeys: updatedJourneys,
          };
        });
      },

      // ========================================
      // UNLOCK NEXT SCENE
      // ========================================
      unlockNextScene: () => {
        set((state) => {
          if (!state.currentJourney) return state;

          const nextScene = state.currentJourney.progress.currentScene + 1;
          const totalScenes = state.currentJourney.blueprint.scenes.length;

          if (nextScene > totalScenes) return state;

          const updatedJourney = {
            ...state.currentJourney,
            progress: {
              ...state.currentJourney.progress,
              currentScene: nextScene,
            },
          };

          // Update in journeys array
          const updatedJourneys = state.journeys.map((j) => (j.id === state.currentJourney!.id ? updatedJourney : j));

          return {
            currentJourney: updatedJourney,
            journeys: updatedJourneys,
            currentSceneIndex: nextScene - 1,
          };
        });
      },

      // ========================================
      // SET CURRENT SCENE
      // ========================================
      setCurrentScene: (sceneIndex: number) => {
        set({ currentSceneIndex: sceneIndex });
      },

      // ========================================
      // RESET JOURNEY
      // ========================================
      resetJourney: (journeyId: string) => {
        set((state) => {
          const journey = state.journeys.find((j) => j.id === journeyId);
          if (!journey) return state;

          const resetJourney = {
            ...journey,
            progress: initializeProgress(journey.blueprint),
          };

          const updatedJourneys = state.journeys.map((j) => (j.id === journeyId ? resetJourney : j));

          return {
            journeys: updatedJourneys,
            currentJourney: state.currentJourney?.id === journeyId ? resetJourney : state.currentJourney,
            currentSceneIndex: 0,
          };
        });
      },

      // ========================================
      // DELETE JOURNEY
      // ========================================
      deleteJourney: (journeyId: string) => {
        set((state) => ({
          journeys: state.journeys.filter((j) => j.id !== journeyId),
          currentJourney: state.currentJourney?.id === journeyId ? null : state.currentJourney,
          currentSceneIndex: 0,
        }));
      },

      // ========================================
      // GET ALL JOURNEYS (as summaries)
      // ========================================
      getAllJourneys: () => {
        const { journeys } = get();

        return journeys
          .map(
            (journey): JourneySummary => ({
              id: journey.id,
              title: journey.metadata.title,
              description: journey.blueprint.story.description,
              totalScenes: journey.metadata.totalScenes,
              completedScenes: journey.progress.completedScenes.length,
              totalXP: journey.metadata.totalXP,
              earnedXP: journey.progress.totalXP,
              difficulty: journey.metadata.difficulty,
              themes: journey.metadata.themes,
              estimatedTime: journey.blueprint.story.estimated_time,
              progress: calculateProgress(journey),
              isCompleted: journey.progress.isCompleted,
              startedAt: journey.progress.startedAt,
              completedAt: journey.progress.completedAt,
              lastAccessedAt: journey.metadata.uploadedAt,
            })
          )
          .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
      },

      // ========================================
      // CLEAR CURRENT JOURNEY
      // ========================================
      clearCurrentJourney: () => {
        set({
          currentJourney: null,
          currentSceneIndex: 0,
        });
      },
    }),
    {
      name: "kajian-note-memory-journey",
      partialize: (state) => ({
        journeys: state.journeys,
        currentJourney: state.currentJourney,
        currentSceneIndex: state.currentSceneIndex,
      }),
    }
  )
);
