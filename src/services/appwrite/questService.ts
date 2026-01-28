/**
 * Quest Appwrite Service
 * Handles all Appwrite operations for Quest content (topics & questions)
 */

import { appwriteDatabases, APPWRITE_DATABASE_ID, COLLECTIONS, Query } from "./client";
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
    type: (doc.type as any) || "multiple_choice",
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

/**
 * Quest Appwrite Service Public API
 */
export const questAppwriteService = {
  getTopics,
  getSubtopicsByTopic,
  getSubtopicBySlug,
  getQuestionsBySubtopic,
};
