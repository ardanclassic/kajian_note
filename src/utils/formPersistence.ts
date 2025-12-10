/**
 * Form Persistence Utility
 * Handles localStorage with fallback for private mode & quota exceeded
 * Auto-cleanup expired data (TTL: 24 hours)
 */

import type { YouTubeImportResult, VideoMetadataResponse } from "@/types/youtube.types";

// Storage configuration
const STORAGE_KEY = "kajian_note_create_form";
const STORAGE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Persisted Form Data Structure
 */
export interface PersistedFormData {
  // YouTubeImportModal data
  modalData: {
    url: string;
    metadata: VideoMetadataResponse | null;
    manualSpeaker: string;
  };

  // NoteForm data
  formData: {
    title: string;
    content: string;
    tags: string[];
    isPublic: boolean;
  };

  // Import result (from successful import)
  importResult: YouTubeImportResult | null;

  // Timestamp for TTL
  timestamp: number;
}

/**
 * Storage Manager Class
 * Handles localStorage with memory fallback
 */
class StorageManager {
  private storage: Storage | Map<string, string>;
  private useMemory: boolean;

  constructor() {
    this.useMemory = false;

    try {
      // Test localStorage availability (fails in private mode)
      const testKey = "__storage_test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      this.storage = localStorage;
    } catch {
      // Fallback to memory storage
      console.warn("[FormPersistence] LocalStorage tidak tersedia, menggunakan memory storage");
      this.storage = new Map<string, string>();
      this.useMemory = true;
    }
  }

  /**
   * Set item in storage
   */
  setItem(key: string, value: string): void {
    if (this.useMemory) {
      (this.storage as Map<string, string>).set(key, value);
      return;
    }

    try {
      (this.storage as Storage).setItem(key, value);
    } catch (e) {
      // Quota exceeded - try clearing old data
      console.warn("[FormPersistence] Quota exceeded, mencoba clear data lama...");
      this.clearOldData();

      try {
        (this.storage as Storage).setItem(key, value);
      } catch {
        console.error("[FormPersistence] Gagal menyimpan ke localStorage setelah cleanup");
        // Last resort: switch to memory
        this.useMemory = true;
        this.storage = new Map<string, string>();
        (this.storage as Map<string, string>).set(key, value);
      }
    }
  }

  /**
   * Get item from storage
   */
  getItem(key: string): string | null {
    if (this.useMemory) {
      return (this.storage as Map<string, string>).get(key) || null;
    }
    return (this.storage as Storage).getItem(key);
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): void {
    if (this.useMemory) {
      (this.storage as Map<string, string>).delete(key);
    } else {
      (this.storage as Storage).removeItem(key);
    }
  }

  /**
   * Clear old expired data from localStorage
   */
  private clearOldData(): void {
    if (this.useMemory) return;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith("kajian_note_")) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const parsed = JSON.parse(data);
              if (parsed.timestamp && Date.now() - parsed.timestamp > STORAGE_TTL) {
                localStorage.removeItem(key);
                console.log(`[FormPersistence] Cleared expired data: ${key}`);
              }
            } catch {
              // Invalid JSON, remove it
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (e) {
      console.error("[FormPersistence] Error clearing old data:", e);
    }
  }

  /**
   * Check if using memory storage (private mode)
   */
  isUsingMemory(): boolean {
    return this.useMemory;
  }
}

// Initialize storage manager
const storage = new StorageManager();

/**
 * Get default/empty form data
 */
const getDefaultFormData = (): PersistedFormData => ({
  modalData: {
    url: "",
    metadata: null,
    manualSpeaker: "",
  },
  formData: {
    title: "",
    content: "",
    tags: [],
    isPublic: false,
  },
  importResult: null,
  timestamp: Date.now(),
});

/**
 * Load persisted form data
 * Returns null if expired or invalid
 */
export const loadFormData = (): PersistedFormData | null => {
  try {
    const stored = storage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored) as PersistedFormData;

    // Check TTL
    if (Date.now() - data.timestamp > STORAGE_TTL) {
      console.log("[FormPersistence] Data expired, clearing...");
      storage.removeItem(STORAGE_KEY);
      return null;
    }

    // console.log("[FormPersistence] Data loaded successfully");
    return data;
  } catch (e) {
    console.error("[FormPersistence] Error loading data:", e);
    storage.removeItem(STORAGE_KEY);
    return null;
  }
};

/**
 * Save form data to storage
 */
export const saveFormData = (data: Partial<PersistedFormData>): void => {
  try {
    const existing = loadFormData() || getDefaultFormData();
    const updated: PersistedFormData = {
      ...existing,
      ...data,
      timestamp: Date.now(),
    };

    storage.setItem(STORAGE_KEY, JSON.stringify(updated));
    console.log("[FormPersistence] Data saved successfully");
  } catch (e) {
    console.error("[FormPersistence] Error saving data:", e);
  }
};

/**
 * Save modal data (URL, metadata, manual speaker)
 */
export const saveModalData = (url: string, metadata: VideoMetadataResponse | null, manualSpeaker: string): void => {
  saveFormData({
    modalData: {
      url,
      metadata,
      manualSpeaker,
    },
  });
};

/**
 * Save form fields (title, content, tags, isPublic)
 */
export const saveFormFields = (title: string, content: string, tags: string[], isPublic: boolean): void => {
  saveFormData({
    formData: {
      title,
      content,
      tags,
      isPublic,
    },
  });
};

/**
 * Save import result
 */
export const saveImportResult = (result: YouTubeImportResult): void => {
  saveFormData({
    importResult: result,
  });
};

/**
 * Clear all persisted data
 */
export const clearFormData = (): void => {
  try {
    storage.removeItem(STORAGE_KEY);
    console.log("[FormPersistence] Data cleared successfully");
  } catch (e) {
    console.error("[FormPersistence] Error clearing data:", e);
  }
};

/**
 * Check if there is any persisted data
 */
export const hasPersistedData = (): boolean => {
  const data = loadFormData();
  if (!data) return false;

  // Check if any field has meaningful data
  const hasModalData = data.modalData.url.length > 0 || data.modalData.metadata !== null;
  const hasFormData =
    data.formData.title.length > 0 || data.formData.content.length > 0 || data.formData.tags.length > 0;
  const hasImportResult = data.importResult !== null;

  return hasModalData || hasFormData || hasImportResult;
};

/**
 * Get time since last save (in minutes)
 */
export const getTimeSinceLastSave = (): number | null => {
  const data = loadFormData();
  if (!data) return null;

  const elapsedMs = Date.now() - data.timestamp;
  return Math.floor(elapsedMs / (1000 * 60)); // Convert to minutes
};

/**
 * Check if storage is using memory fallback
 */
export const isUsingMemoryStorage = (): boolean => {
  return storage.isUsingMemory();
};

/**
 * Export for testing/debugging
 */
export const FormPersistence = {
  load: loadFormData,
  save: saveFormData,
  clear: clearFormData,
  saveModalData,
  saveFormFields,
  saveImportResult,
  hasPersistedData,
  getTimeSinceLastSave,
  isUsingMemoryStorage,
};
