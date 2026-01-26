#!/usr/bin/env node

/**
 * Appwrite Quest Multiplayer Setup
 * Creates 'active_sessions' collection and attributes
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

const COL_ACTIVE_SESSIONS = 'active_sessions';

if (!API_KEY) {
  console.error('❌ Error: APPWRITE_API_KEY not found in .env');
  process.exit(1);
}

// Helper for requests
async function appwriteRequest(method, path, body = null) {
  const url = `${ENDPOINT}${path}`;
  const headers = { 'Content-Type': 'application/json', 'X-Appwrite-Project': PROJECT_ID, 'X-Appwrite-Key': API_KEY };
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const response = await fetch(url, options);
  if (response.status === 204) return null;

  // Handle 404 gracefully for delete
  if (method === 'DELETE' && response.status === 404) return null;

  const data = await response.json();
  if (!response.ok) {
    // Ignore "Collection already exists" or "Attribute already exists" for idempotency
    if (response.status === 409) {
      console.log(`    ⚠️ Entity already exists (409), skipping creation...`);
      return null;
    }
    throw { message: data.message, code: response.status, details: data };
  }
  return data;
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function setupMultiplayer() {
  console.log('🎮 Setting up Appwrite for Multiplayer Quest...');
  console.log(`   Database: ${DATABASE_ID}`);
  console.log(`   Collection: ${COL_ACTIVE_SESSIONS}`);

  try {
    // 1. Create or Update Collection
    console.log('\n1. Creating Collection: active_sessions...');
    try {
      await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections`, {
        collectionId: COL_ACTIVE_SESSIONS,
        name: 'Active Sessions',
        documentSecurity: false,
        permissions: [
          'read("any")',
          'create("any")', // Allow anyone (host) to create room
          'update("any")', // Allow anyone (players) to join/update score
          'delete("any")'  // Allow clean up
        ]
      });
      console.log('   ✓ Collection created.');
    } catch (e) {
      console.log('   ✓ Collection valid (or already exists).');
    }
    await delay(1000);

    // 2. Create Attributes
    console.log('\n2. Creating Attributes...');

    // room_code (String, 16 chars)
    console.log('   - room_code');
    await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_ACTIVE_SESSIONS}/attributes/string`, { key: 'room_code', size: 16, required: true });
    await delay(500);

    // host_uid (String, 64 chars)
    console.log('   - host_uid');
    await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_ACTIVE_SESSIONS}/attributes/string`, { key: 'host_uid', size: 64, required: true });
    await delay(500);

    // status (String, 32 chars)
    console.log('   - status');
    await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_ACTIVE_SESSIONS}/attributes/string`, { key: 'status', size: 32, required: true });
    await delay(500);

    // topic_config (String, 5000 chars - JSON)
    console.log('   - topic_config (JSON)');
    await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_ACTIVE_SESSIONS}/attributes/string`, { key: 'topic_config', size: 5000, required: true });
    await delay(500);

    // players (String, 10000 chars - JSON)
    console.log('   - players (JSON)');
    await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_ACTIVE_SESSIONS}/attributes/string`, { key: 'players', size: 10000, required: true });
    await delay(500);

    // current_question_idx (Integer)
    console.log('   - current_question_idx');
    await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_ACTIVE_SESSIONS}/attributes/integer`, { key: 'current_question_idx', required: false, default: 0 });
    await delay(500);

    // timer_end_at (String, 64 chars)
    console.log('   - timer_end_at');
    await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_ACTIVE_SESSIONS}/attributes/string`, { key: 'timer_end_at', size: 64, required: false });
    await delay(500);

    // 3. Create Indexes
    console.log('\n3. Creating Indexes...');

    // Unique Index on room_code
    console.log('   - idx_room_code (Unique)');
    await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${COL_ACTIVE_SESSIONS}/indexes`, {
      key: 'idx_room_code',
      type: 'unique',
      attributes: ['room_code']
    });

    console.log('\n✅ Multiplayer Setup Completed Successfully!');

  } catch (err) {
    console.error('\n❌ Setup failed:', err.message);
    if (err.details) console.error(JSON.stringify(err.details, null, 2));
  }
}

setupMultiplayer();
