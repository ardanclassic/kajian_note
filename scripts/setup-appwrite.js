#!/usr/bin/env node

/**
 * Appwrite Quest Database Setup (FINAL JSON STRUCTURE SCHEMA + SPARE)
 * Optimized for Stability (Reduced sizes & Increased delays)
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- ENV SETUP ---
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
  console.error('❌ Error: APPWRITE_API_KEY not found in .env');
  process.exit(1);
}

async function appwriteRequest(method, path, body = null) {
  const url = `${ENDPOINT}${path}`;
  const headers = { 'Content-Type': 'application/json', 'X-Appwrite-Project': PROJECT_ID, 'X-Appwrite-Key': API_KEY };
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const response = await fetch(url, options);
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) {
    if (method === 'DELETE' && response.status === 404) return null;
    throw { message: data.message, code: response.status, details: data };
  }
  return data;
}

// Utility delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function wipeDatabase() {
  console.log('🗑️  Wiping existing collections...');
  const collections = [COL_QUESTIONS, COL_SUBTOPICS, COL_TOPICS];
  for (const colId of collections) {
    try {
      await appwriteRequest('DELETE', `/databases/${DATABASE_ID}/collections/${colId}`);
      console.log(`  ✓ Deleted ${colId}`);
    } catch (err) { }
  }
  console.log('✨ Cleanup complete. Waiting 5s for backend cleanup...');
  await delay(5000); // 5s delay for safety
}

async function createCollections() {
  console.log('🏗️  Building NEW Schema...');

  // 1. TOPICS
  console.log('  Creating Topics...');
  await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections`, { collectionId: COL_TOPICS, name: 'Topics', documentSecurity: false, permissions: ['read("any")'] });
  await delay(500);
  await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_TOPICS}/attributes/string`, { key: 'name', size: 100, required: true });
  await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_TOPICS}/attributes/string`, { key: 'slug', size: 100, required: true });
  await delay(1000);
  await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_TOPICS}/indexes`, { key: 'idx_slug', type: 'unique', attributes: ['slug'] });

  // 2. SUBTOPICS
  console.log('  Creating Subtopics...');
  await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections`, { collectionId: COL_SUBTOPICS, name: 'Subtopics', documentSecurity: false, permissions: ['read("any")'] });
  await delay(500);
  await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_SUBTOPICS}/attributes/string`, { key: 'title', size: 200, required: true });
  await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_SUBTOPICS}/attributes/string`, { key: 'slug', size: 100, required: true });
  await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_SUBTOPICS}/attributes/string`, { key: 'description', size: 1000, required: false });
  await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_SUBTOPICS}/attributes/string`, { key: 'topic_id', size: 100, required: true });
  await delay(1000);
  await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_SUBTOPICS}/indexes`, { key: 'idx_slug', type: 'unique', attributes: ['slug'] });
  await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_SUBTOPICS}/indexes`, { key: 'idx_topic', type: 'key', attributes: ['topic_id'] });

  // 3. QUESTIONS
  console.log('  Creating Questions...');
  await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections`, { collectionId: COL_QUESTIONS, name: 'Questions', documentSecurity: false, permissions: ['read("any")'] });
  await delay(500);

  // Use slightly optimized sizes to be safe
  await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_QUESTIONS}/attributes/string`, { key: 'text', size: 1000, required: true });
  await delay(200);
  await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_QUESTIONS}/attributes/string`, { key: 'options', size: 5000, required: true }); // Reduced to 5k
  await delay(200);
  await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_QUESTIONS}/attributes/string`, { key: 'correct', size: 10, required: true });
  await delay(200);
  await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_QUESTIONS}/attributes/string`, { key: 'explanation', size: 3000, required: false }); // Reduced to 3k
  await delay(200);
  await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_QUESTIONS}/attributes/integer`, { key: 'points', required: false, default: 10 });
  await delay(200);
  await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_QUESTIONS}/attributes/string`, { key: 'subtopic_id', size: 100, required: true });
  await delay(200);
  // NEW: Spare Attribute
  await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_QUESTIONS}/attributes/string`, { key: 'spare', size: 2000, required: false });

  await delay(1000);
  await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_QUESTIONS}/indexes`, { key: 'idx_subtopic', type: 'key', attributes: ['subtopic_id'] });

  console.log('  ✓ Questions setup done.');
}

async function main() {
  try {
    await wipeDatabase();
    await createCollections();
    console.log('\n🎉 Database Schema Complete (with spare attribute)!');
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
    if (err.details) console.error(JSON.stringify(err.details, null, 2));
  }
}

main();
