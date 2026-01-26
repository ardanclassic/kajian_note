/**
 * Quest Appwrite Service
 * Handles all Appwrite operations for Quest content (topics & questions)
 * AND Multiplayer Sessions
 */

import { ID } from "appwrite"; // Import ID helper
import { appwriteClient, appwriteDatabases, APPWRITE_DATABASE_ID, COLLECTIONS, Query } from "./client";
import type { Topic, Subtopic, Question, QuestionOption, QuestionExplanation } from "@/types/quest.types";

/**
 * Helper to parse Appwrite Document to Question type
 */
const mapToQuestion = (doc: any): Question => {
  let options: QuestionOption[] = [];
  try {
    options = JSON.parse(doc.options || "[]");
  } catch (e) {
    console.warn("Failed to parse options JSON for question:", doc.$id);
  }

  let explanation: QuestionExplanation | null = null;
  try {
    if (doc.explanation) {
      explanation = JSON.parse(doc.explanation);
    }
  } catch (e) {
    console.warn("Failed to parse explanation JSON for question:", doc.$id);
  }

  return {
    id: doc.$id,
    subtopic_id: doc.subtopic_id,
    text: doc.text,
    options: options,
    explanation: explanation,
    correct: doc.correct,
    points: doc.points || 10,
    spare: doc.spare,
  };
};

/**
 * Fetch all Topics (Categories)
 */
const getTopics = async (): Promise<Topic[]> => {
  try {
    const response = await appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.TOPICS, [
      Query.limit(100),
    ]);

    return response.documents.map((doc) => ({
      id: doc.$id,
      name: doc.name,
      slug: doc.slug,
    }));
  } catch (error) {
    console.error("Error fetching topics:", error);
    throw new Error("Failed to fetch topics");
  }
};

/**
 * Fetch Subtopics by Topic slug
 */
const getSubtopicsByTopic = async (topicIdOrSlug: string): Promise<Subtopic[]> => {
  try {
    const response = await appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.SUBTOPICS, [
      Query.equal("topic_id", topicIdOrSlug),
      Query.limit(100),
    ]);

    return response.documents.map((doc) => ({
      id: doc.$id,
      topic_id: doc.topic_id,
      title: doc.title,
      slug: doc.slug,
      description: doc.description,
    }));
  } catch (error) {
    console.error("Error fetching subtopics:", error);
    throw new Error("Failed to fetch subtopics");
  }
};

/**
 * Get Subtopic by Slug
 */
const getSubtopicBySlug = async (slug: string): Promise<Subtopic | null> => {
  try {
    const response = await appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.SUBTOPICS, [
      Query.equal("slug", slug),
      Query.limit(1),
    ]);

    if (response.documents.length === 0) return null;
    const doc = response.documents[0];

    return {
      id: doc.$id,
      topic_id: doc.topic_id,
      title: doc.title,
      slug: doc.slug,
      description: doc.description,
    };
  } catch (error) {
    console.error("Error fetching subtopic by slug:", error);
    return null;
  }
};

/**
 * Get questions by Subtopic ID/Slug
 */
const getQuestionsBySubtopic = async (subtopicIdOrSlug: string, limit: number = 20): Promise<Question[]> => {
  try {
    const response = await appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.QUESTIONS, [
      Query.equal("subtopic_id", subtopicIdOrSlug),
      Query.limit(limit),
    ]);

    return response.documents.map(mapToQuestion);
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw new Error("Failed to fetch questions");
  }
};

// ============================================================================
// MULTIPLAYER SERVICES
// ============================================================================

/**
 * Generate simple Room Code (4 chars alphanumeric)
 * e.g. "A9X2"
 */
const generateRoomCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude I, 1, O, 0 for clarity
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result; // e.g. "XK9A"
};

/**
 * Create a new Multiplayer Room
 */
const createRoom = async (
  host: { uid: string; name: string; avatar: string },
  config: { topic: Topic; subtopic: Subtopic; totalQuestions: number },
) => {
  const roomCode = generateRoomCode();

  const hostPlayer = {
    supabase_id: host.uid,
    username: host.name,
    avatar_url: host.avatar,
    score: 0,
    status: "ready",
    is_host: true,
  };

  try {
    const doc = await appwriteDatabases.createDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.ACTIVE_SESSIONS,
      ID.unique(), // Document ID
      {
        room_code: roomCode,
        host_uid: host.uid,
        status: "WAITING",
        topic_config: JSON.stringify(config),
        players: JSON.stringify([hostPlayer]), // Initial player is host
        current_question_idx: 0,
      },
    );
    return doc;
  } catch (error) {
    console.error("Error creating room:", error);
    throw new Error("Failed to create room");
  }
};

/**
 * Join an existing Room
 */
const joinRoom = async (roomCode: string, user: { uid: string; name: string; avatar: string }) => {
  try {
    // 1. Find Room by Code
    const list = await appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.ACTIVE_SESSIONS, [
      Query.equal("room_code", roomCode),
      Query.limit(1),
    ]);

    if (list.documents.length === 0) {
      throw new Error("Room not found");
    }

    const room = list.documents[0];

    // 2. Check if already joined (Idempotency)
    const players = JSON.parse(room.players || "[]");
    const existingPlayer = players.find((p: any) => p.supabase_id === user.uid);

    if (existingPlayer) {
      return room; // Already joined, just return room
    }

    if (room.status !== "WAITING") {
      throw new Error("Game already started");
    }

    // 3. Add Player
    const newPlayer = {
      supabase_id: user.uid,
      username: user.name,
      avatar_url: user.avatar,
      score: 0,
      status: "ready",
      is_host: false,
    };

    const updatedRoom = await appwriteDatabases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.ACTIVE_SESSIONS,
      room.$id,
      {
        players: JSON.stringify([...players, newPlayer]),
      },
    );

    return updatedRoom;
  } catch (error: any) {
    console.error("Error joining room:", error);
    throw new Error(error.message || "Failed to join room");
  }
};

/**
 * Subscribe to Realtime Updates for a specific Room
 */
const subscribeToRoom = (roomId: string, callback: (payload: any) => void) => {
  const channel = `databases.${APPWRITE_DATABASE_ID}.collections.${COLLECTIONS.ACTIVE_SESSIONS}.documents.${roomId}`;
  return appwriteClient.subscribe(channel, (response) => {
    callback(response.payload);
  });
};

/**
 * Start Game (Host Only)
 * - Changes status to PLAYING
 * - Sets first question? (logic can be here or in component)
 */
const startGame = async (roomId: string) => {
  try {
    return await appwriteDatabases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.ACTIVE_SESSIONS, roomId, {
      status: "PLAYING",
      current_question_idx: 0,
      // Optional: Set timer_end_at here
    });
  } catch (error) {
    console.error("Error starting game:", error);
    throw error;
  }
};

/**
 * Update Player Score (Submit Answer)
 */
const submitAnswer = async (roomId: string, playerId: string, newScore: number) => {
  // Note: This implementation is naive (read-modify-write).
  // Ideally use Appwrite Functions for atomicity to avoid race conditions.
  // But for MVP this works if traffic is low.

  try {
    const room = await appwriteDatabases.getDocument(APPWRITE_DATABASE_ID, COLLECTIONS.ACTIVE_SESSIONS, roomId);
    const players = JSON.parse(room.players || "[]");

    const updatedPlayers = players.map((p: any) => {
      if (p.supabase_id === playerId) {
        return { ...p, score: newScore };
      }
      return p;
    });

    return await appwriteDatabases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.ACTIVE_SESSIONS, roomId, {
      players: JSON.stringify(updatedPlayers),
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
  }
};

/**
 * Delete Room (Host Cancel)
 */
const deleteRoom = async (roomId: string) => {
  try {
    await appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTIONS.ACTIVE_SESSIONS, roomId);
  } catch (error) {
    console.error("Error deleting room:", error);
    throw error;
  }
};

/**
 * Quest Appwrite Service Public API
 */
export const questAppwriteService = {
  getTopics,
  getSubtopicsByTopic,
  getSubtopicBySlug,
  getQuestionsBySubtopic,
  // Multiplayer
  createRoom,
  joinRoom,
  subscribeToRoom,
  startGame,

  submitAnswer,
  deleteRoom,
};
