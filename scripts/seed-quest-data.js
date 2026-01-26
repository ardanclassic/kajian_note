#!/usr/bin/env node

/**
 * Script Seeding Data Quest (JSON-RICH Version)
 * 
 * Adapts to new schema:
 * - Questions.options stored as JSON String
 * - Questions.explanation stored as JSON String
 */

import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- SETUP ---
function loadEnv() {
  const envPath = join(__dirname, '..', '.env');
  try {
    const envContent = readFileSync(envPath, 'utf-8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) env[key.trim()] = valueParts.join('=').trim();
      }
    });
    return env;
  } catch (err) { return process.env; }
}

const env = loadEnv();
const ENDPOINT = env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
const PROJECT_ID = env.VITE_APPWRITE_PROJECT_ID || 'alwaah-scopes';
const API_KEY = env.APPWRITE_API_KEY;
const DATABASE_ID = env.VITE_APPWRITE_DATABASE_ID || 'alwaah-quest';

const COL_TOPICS = 'topics';
const COL_SUBTOPICS = 'subtopics';
const COL_QUESTIONS = 'questions';

if (!API_KEY) {
  console.error('❌ Error: APPWRITE_API_KEY not found');
  process.exit(1);
}

async function appwriteRequest(method, path, body = null) {
  const url = `${ENDPOINT}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': PROJECT_ID,
    'X-Appwrite-Key': API_KEY,
  };
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 409) return data;
    throw { message: data.message, code: response.status, details: data };
  }
  return data;
}

// --- HELPERS ---
function loadData() {
  const dataDir = join(__dirname, '..', 'src', 'data', 'quest');
  const items = readdirSync(dataDir, { withFileTypes: true });

  let rawSubtopics = [];
  let rawQuestions = [];

  // 1. Root files (topics.json)
  const rootFiles = items.filter(i => i.isFile() && i.name.endsWith('.json'));
  rootFiles.forEach(f => {
    const content = JSON.parse(readFileSync(join(dataDir, f.name), 'utf-8'));
    if (f.name === 'topics.json') rawSubtopics = content;
  });

  // 2. Subfolders
  const folders = items.filter(i => i.isDirectory());
  folders.forEach(folder => {
    const subPath = join(dataDir, folder.name);
    const subFiles = readdirSync(subPath).filter(f => f.endsWith('.json'));

    subFiles.forEach(f => {
      const content = JSON.parse(readFileSync(join(subPath, f), 'utf-8'));
      if (Array.isArray(content) && content.length > 0) {
        rawQuestions = [...rawQuestions, ...content];
      }
    });
  });

  return { rawSubtopics, rawQuestions };
}

// --- SEEDING ---
async function main() {
  const { rawSubtopics, rawQuestions } = loadData();
  console.log(`📂 Loaded ${rawSubtopics.length} subtopics and ${rawQuestions.length} questions.\n`);

  // 1. SEED TOPICS
  const mainTopicsMap = new Map();
  rawSubtopics.forEach(t => {
    if (!mainTopicsMap.has(t.topic)) {
      mainTopicsMap.set(t.topic, {
        name: t.topic,
        slug: t.topic.toLowerCase().replace(/\s+/g, '-')
      });
    }
  });

  console.log(`🌱 Seeding ${mainTopicsMap.size} Topics...`);
  for (const topic of mainTopicsMap.values()) {
    try {
      await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_TOPICS}/documents`, {
        documentId: topic.slug,
        data: topic
      });
      console.log(`  ✓ Topic: ${topic.name}`);
    } catch (e) { /* ignore dupe */ }
  }

  // 2. SEED SUBTOPICS
  console.log(`\n🌱 Seeding ${rawSubtopics.length} Subtopics...`);
  for (const item of rawSubtopics) {
    const topicSlug = item.topic.toLowerCase().replace(/\s+/g, '-');
    const subData = {
      title: item.name,
      slug: item.slug,
      description: item.description,
      topic_id: topicSlug
    };
    try {
      await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_SUBTOPICS}/documents`, {
        documentId: subData.slug,
        data: subData
      });
      console.log(`  ✓ Subtopic: ${subData.title}`);
    } catch (e) {
      // Try update
      try { await appwriteRequest('PATCH', `/databases/${DATABASE_ID}/collections/${COL_SUBTOPICS}/documents/${subData.slug}`, { data: subData }); } catch (err) { }
    }
  }

  // 3. SEED QUESTIONS (JSON RICH)
  console.log(`\n🌱 Seeding ${rawQuestions.length} Questions...`);
  let qCount = 0;

  for (const q of rawQuestions) {
    // Normalisasi structure (handle legacy structure if any mixed)

    // Check is it new structure?
    const isNewStruct = Array.isArray(q.options) && typeof q.options[0] === 'object';

    let dbOptions = "";
    let dbExplanation = "";
    let dbCorrect = "";

    if (isNewStruct) {
      // NEW STRUCTURE
      dbOptions = JSON.stringify(q.options); // Store as JSON String
      dbExplanation = typeof q.explanation === 'object' ? JSON.stringify(q.explanation) : JSON.stringify({ text: q.explanation });
      dbCorrect = q.correct;
    } else {
      // LEGACY STRUCTURE CONVERSION (Auto-migrate if file not updated)
      const newOpts = q.options.map((opt, i) => ({
        id: String.fromCharCode(65 + i), // A, B, C...
        text: opt
      }));
      dbOptions = JSON.stringify(newOpts);

      const correctChar = String.fromCharCode(65 + (q.correct_answer_index || 0));
      dbCorrect = correctChar;

      dbExplanation = JSON.stringify({
        text: q.explanation || "",
        dalil: q.reference || "",
        resources: []
      });
    }

    const questionData = {
      text: q.question_text,
      options: dbOptions,
      correct: dbCorrect,
      explanation: dbExplanation,
      points: q.points || 10,
      subtopic_id: q.topic_slug
    };

    try {
      await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_QUESTIONS}/documents`, {
        documentId: 'unique()',
        data: questionData
      });
      process.stdout.write('.');
      qCount++;
    } catch (err) {
      // console.error(err);
    }
  }
  console.log(`\nDone. Created ${qCount} questions.`);
}

main();
