/**
 * Background Task Persistence Utility
 * Handles YouTube summarize tasks that persist across page reloads
 *
 * PATH: src/utils/backgroundTaskPersistence.ts
 */

import type { VideoMetadataResponse } from "@/types/youtube.types";

// Storage configuration
const TASK_STORAGE_KEY = "kajian_note_bg_task";
const TASK_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Task Status Types
 */
export type BackgroundTaskStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";

/**
 * Background Task Data Structure
 */
export interface BackgroundTaskData {
  taskId: string;
  videoUrl: string;
  videoId: string;
  metadata: VideoMetadataResponse | null;
  manualSpeaker?: string;
  status: BackgroundTaskStatus;
  timestamp: number;
  startedAt: number;
  completedAt?: number;
  error?: string;
  // Polling metadata
  pollingAttempts: number;
  maxPollingAttempts: number;
}

/**
 * Storage Manager with fallback
 */
class TaskStorageManager {
  private storage: Storage | Map<string, string>;
  private useMemory: boolean;

  constructor() {
    this.useMemory = false;

    try {
      const testKey = "__task_storage_test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      this.storage = localStorage;
    } catch {
      console.warn("[BackgroundTask] LocalStorage unavailable, using memory storage");
      this.storage = new Map<string, string>();
      this.useMemory = true;
    }
  }

  setItem(key: string, value: string): void {
    if (this.useMemory) {
      (this.storage as Map<string, string>).set(key, value);
    } else {
      try {
        (this.storage as Storage).setItem(key, value);
      } catch (e) {
        console.error("[BackgroundTask] Failed to save task:", e);
      }
    }
  }

  getItem(key: string): string | null {
    if (this.useMemory) {
      return (this.storage as Map<string, string>).get(key) || null;
    }
    return (this.storage as Storage).getItem(key);
  }

  removeItem(key: string): void {
    if (this.useMemory) {
      (this.storage as Map<string, string>).delete(key);
    } else {
      (this.storage as Storage).removeItem(key);
    }
  }
}

const taskStorage = new TaskStorageManager();

/**
 * Save background task to storage
 */
export const saveBackgroundTask = (task: BackgroundTaskData): void => {
  try {
    taskStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(task));
    console.log("[BackgroundTask] Task saved:", task.taskId);
  } catch (e) {
    console.error("[BackgroundTask] Error saving task:", e);
  }
};

/**
 * Load background task from storage
 * Returns null if expired, invalid, or completed/failed
 */
export const loadBackgroundTask = (): BackgroundTaskData | null => {
  try {
    const stored = taskStorage.getItem(TASK_STORAGE_KEY);
    if (!stored) return null;

    const task = JSON.parse(stored) as BackgroundTaskData;

    // Check TTL
    if (Date.now() - task.timestamp > TASK_TTL) {
      console.log("[BackgroundTask] Task expired, clearing...");
      clearBackgroundTask();
      return null;
    }

    // Only return if task is pending/processing
    if (task.status === "pending" || task.status === "processing") {
      console.log("[BackgroundTask] Active task found:", task.taskId);
      return task;
    }

    // Task already completed/failed, don't return it
    console.log("[BackgroundTask] Task already finished, clearing...");
    clearBackgroundTask();
    return null;
  } catch (e) {
    console.error("[BackgroundTask] Error loading task:", e);
    clearBackgroundTask();
    return null;
  }
};

/**
 * Update task status
 */
export const updateTaskStatus = (status: BackgroundTaskStatus, additionalData?: Partial<BackgroundTaskData>): void => {
  try {
    const task = loadBackgroundTask();
    if (!task) return;

    const updated: BackgroundTaskData = {
      ...task,
      status,
      timestamp: Date.now(),
      ...additionalData,
    };

    // Set completedAt if finished
    if (status === "completed" || status === "failed" || status === "cancelled") {
      updated.completedAt = Date.now();
    }

    saveBackgroundTask(updated);
    console.log("[BackgroundTask] Task status updated:", status);
  } catch (e) {
    console.error("[BackgroundTask] Error updating task status:", e);
  }
};

/**
 * Update polling attempts
 */
export const updatePollingAttempts = (attempts: number): void => {
  try {
    const task = loadBackgroundTask();
    if (!task) return;

    task.pollingAttempts = attempts;
    task.timestamp = Date.now();
    saveBackgroundTask(task);
  } catch (e) {
    console.error("[BackgroundTask] Error updating polling attempts:", e);
  }
};

/**
 * Clear background task from storage
 */
export const clearBackgroundTask = (): void => {
  try {
    taskStorage.removeItem(TASK_STORAGE_KEY);
    console.log("[BackgroundTask] Task cleared");
  } catch (e) {
    console.error("[BackgroundTask] Error clearing task:", e);
  }
};

/**
 * Check if there is an active background task
 */
export const hasActiveBackgroundTask = (): boolean => {
  const task = loadBackgroundTask();
  return task !== null && (task.status === "pending" || task.status === "processing");
};

/**
 * Get task duration in seconds
 */
export const getTaskDuration = (): number | null => {
  const task = loadBackgroundTask();
  if (!task) return null;

  const endTime = task.completedAt || Date.now();
  return Math.floor((endTime - task.startedAt) / 1000);
};

/**
 * Get task progress percentage (based on polling attempts)
 */
export const getTaskProgress = (): number => {
  const task = loadBackgroundTask();
  if (!task) return 0;

  return Math.min(Math.round((task.pollingAttempts / task.maxPollingAttempts) * 100), 99);
};

/**
 * Export for testing/debugging
 */
export const BackgroundTaskPersistence = {
  save: saveBackgroundTask,
  load: loadBackgroundTask,
  updateStatus: updateTaskStatus,
  updatePollingAttempts,
  clear: clearBackgroundTask,
  hasActive: hasActiveBackgroundTask,
  getDuration: getTaskDuration,
  getProgress: getTaskProgress,
};
