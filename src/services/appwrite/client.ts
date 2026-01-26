/**
 * Appwrite Client Configuration
 * Centralized Appwrite SDK setup for Quest feature
 */

import { Client, Databases, Query } from "appwrite";

// Environment variables
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || "";

// Initialize Appwrite client
export const appwriteClient = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);

// Initialize Databases service
export const appwriteDatabases = new Databases(appwriteClient);

// Export Query helper for service layer
export { Query };

// Collection and Database IDs (will be set after Appwrite setup)
export const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || "quest";
export const COLLECTIONS = {
  TOPICS: import.meta.env.VITE_APPWRITE_COLLECTION_TOPICS || "topics",
  SUBTOPICS: import.meta.env.VITE_APPWRITE_COLLECTION_SUBTOPICS || "subtopics",
  QUESTIONS: import.meta.env.VITE_APPWRITE_COLLECTION_QUESTIONS || "questions",
  ACTIVE_SESSIONS: "active_sessions",
} as const;
