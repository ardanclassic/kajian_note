import { readFileSync, readdirSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, basename } from 'path';

/**
 * QUEST DATA SYNC SCRIPT
 * 
 * Usage:
 *   node scripts/quest-sync.js [options]
 * 
 * Options:
 *   --topics      Sync Topics and Subtopics only
 *   --questions   Sync Questions only
 *   --all         Sync Everything (default if no args)
 *   --prune       Delete items in DB that are missing in JSON (Destructive!)
 *   --dry-run     Simulate actions without writing to DB
 *   --verbose     Show detailed logs
 */

// --- CONFIGURATION ---

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'src', 'data', 'quest');

// Helper to load .env
function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env');
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
const ENDPOINT = env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = env.VITE_APPWRITE_PROJECT_ID;
const API_KEY = env.APPWRITE_API_KEY;
const DATABASE_ID = env.VITE_APPWRITE_DATABASE_ID || 'quest';
const COLLECTIONS = {
  TOPICS: env.VITE_APPWRITE_COLLECTION_TOPICS || 'topics',
  SUBTOPICS: env.VITE_APPWRITE_COLLECTION_SUBTOPICS || 'subtopics',
  QUESTIONS: env.VITE_APPWRITE_COLLECTION_QUESTIONS || 'questions',
};

// --- ARGS PARSER ---
const args = process.argv.slice(2);
const FLAGS = {
  topics: args.includes('--topics'),
  questions: args.includes('--questions'),
  all: args.includes('--all') || (!args.includes('--topics') && !args.includes('--questions')),
  prune: args.includes('--prune'),
  dryRun: args.includes('--dry-run'),
  verbose: args.includes('--verbose')
};

if (!API_KEY) {
  console.error("ERROR: APPWRITE_API_KEY is missing in .env file.");
  process.exit(1);
}

// --- APPWRITE API CLIENT ---

async function appwriteRequest(method, path, body = null) {
  const url = `${ENDPOINT}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': PROJECT_ID,
    'X-Appwrite-Key': API_KEY
  };
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  if (FLAGS.verbose) console.log(`API ${method} ${path}`);

  const response = await fetch(url, options);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API Error ${response.status}: ${text}`);
  }
  return response.json();
}

// --- SYNC LOGIC ---

async function syncTopicsAndSubtopics() {
  console.log(`\n=== SYNCING TOPICS & SUBTOPICS ===`);
  const topicsJsonPath = join(DATA_DIR, 'topics.json');
  const rawData = readFileSync(topicsJsonPath, 'utf-8');
  const items = JSON.parse(rawData);

  // 1. UNIQUE PARENT TOPICS
  const uniqueTopics = {};
  items.forEach(item => {
    const slug = item.topic.toLowerCase();
    uniqueTopics[slug] = {
      name: item.topic,
      id: slug
    };
  });

  // SYNC TOPICS
  for (const slug in uniqueTopics) {
    const t = uniqueTopics[slug];
    await upsertDocument(COLLECTIONS.TOPICS, slug, {
      name: t.name,
      slug: slug
    }, slug);
  }

  // 2. SYNC SUBTOPICS
  for (const item of items) {
    await upsertDocument(COLLECTIONS.SUBTOPICS, item.slug, {
      topic_id: item.topic.toLowerCase(),
      slug: item.slug,
      title: item.name,
      description: item.description
    }, item.slug);
  }

  // 3. PRUNE SUBTOPICS
  if (FLAGS.prune) {
    // Need to fetch ALL existing to prune effectively
    const { documents: allDocs, total } = await listAll(COLLECTIONS.SUBTOPICS);
    if (allDocs.length < total) {
      console.warn(`[WARN] Skipping Prune: Not all subtopics fetched (${allDocs.length}/${total}).`);
    } else {
      const validSlugs = items.map(i => i.slug);
      for (const doc of allDocs) {
        if (!validSlugs.includes(doc.slug)) {
          await deleteDocument(COLLECTIONS.SUBTOPICS, doc.$id, doc.slug);
        }
      }
    }
  }
}

async function syncQuestions() {
  console.log(`\n=== SYNCING QUESTIONS ===`);

  const getJsonFiles = (dir) => {
    let results = [];
    const list = readdirSync(dir);
    list.forEach(file => {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getJsonFiles(filePath));
      } else if (file.endsWith('.json') && file !== 'topics.json') {
        results.push(filePath);
      }
    });
    return results;
  };

  const files = getJsonFiles(DATA_DIR);
  console.log(`Found ${files.length} question files in subdirectories.`);

  // FETCH ALL QUESTIONS ONCE (Up to limitation)
  // To handle prune and update correctly, we need the DB state.
  // If we can't filter, we just fetch default page.
  const { documents: cachedQuestions, total: totalQuestions } = await listAll(COLLECTIONS.QUESTIONS);

  if (totalQuestions > cachedQuestions.length) {
    console.warn(`\n[WARNING] DB has ${totalQuestions} questions, but I only fetched ${cachedQuestions.length}.`);
    console.warn(`Duplicate creation is possible if I don't see existing questions.`);
    console.warn(`Pruning is DISABLED.`);
  }

  for (const filePath of files) {
    const fileName = basename(filePath);
    console.log(`Processing ${fileName}...`);
    const content = readFileSync(filePath, 'utf-8');
    const questions = JSON.parse(content);

    for (const q of questions) {
      const optionsString = JSON.stringify(q.options || []);
      const explanationString = JSON.stringify(q.explanation || {});

      const payload = {
        subtopic_id: q.subtopic_id,
        type: q.type || 'multiple_choice',
        text: q.question_text || q.text,
        options: optionsString,
        correct: (typeof q.correct === 'object') ? JSON.stringify(q.correct) : q.correct,
        explanation: explanationString,
        points: q.points || 10,
        spare: JSON.stringify(q.spare || {})
      };

      // Find in cached fetch
      // Filter by subtopic to ensure uniqueness within context
      const existing = cachedQuestions.find(d => d.text === payload.text && d.subtopic_id === payload.subtopic_id);

      if (existing) {
        await updateDocument(COLLECTIONS.QUESTIONS, existing.$id, payload);
      } else {
        await createDocument(COLLECTIONS.QUESTIONS, payload);
      }
    }

    if (FLAGS.prune) {
      if (totalQuestions > cachedQuestions.length) {
        // Skip prune
      } else {
        const currentSubtopicId = questions[0]?.subtopic_id;
        if (currentSubtopicId) {
          const validTexts = questions.map(q => q.question_text || q.text);
          // Filter cached DB docs for this subtopic
          const dbDocs = cachedQuestions.filter(d => d.subtopic_id === currentSubtopicId);
          for (const doc of dbDocs) {
            if (!validTexts.includes(doc.text)) {
              await deleteDocument(COLLECTIONS.QUESTIONS, doc.$id, `Question: ${doc.text.substring(0, 15)}...`);
            }
          }
        }
      }
    }
  }
}

// --- CORE CRUD HELPERS ---

async function listAll(collectionId) {
  // Fetches default page (25 items) to avoid Query Syntax Errors.
  // For universal support (pagination), this needs 'queries[]=limit/offset' which is error-prone in this env.
  const url = `/databases/${DATABASE_ID}/collections/${collectionId}/documents`;
  const response = await appwriteRequest('GET', url);
  return { documents: response.documents, total: response.total };
}

async function upsertDocument(collectionId, uniqueKey, data, customId = null) {
  let docId = null;
  let exists = false;

  // 1. Try Fetch by Custom ID
  if (customId) {
    try {
      const doc = await appwriteRequest('GET', `/databases/${DATABASE_ID}/collections/${collectionId}/documents/${customId}`);
      docId = doc.$id;
      exists = true;
    } catch (e) { /* 404 */ }
  }

  // 2. Try Find in List (if loaded) logic is handled elsewhere for Questions, 
  // but for Topics/Subtopics we usually rely on ID.
  // If not found by ID, we assume Create.

  if (FLAGS.dryRun) {
    console.log(`[DRY-RUN] ${exists ? 'UPDATE' : 'CREATE'} ${collectionId} [${uniqueKey}]`);
    return;
  }

  const payload = { data: data };

  if (exists) {
    process.stdout.write(`Updating ${uniqueKey}... `);
    await appwriteRequest('PATCH', `/databases/${DATABASE_ID}/collections/${collectionId}/documents/${docId}`, payload);
    console.log("OK");
  } else {
    process.stdout.write(`Creating ${uniqueKey}... `);
    const newId = customId || 'unique()';
    await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${collectionId}/documents`, {
      documentId: newId,
      data: data
    });
    console.log("OK");
  }
}

async function updateDocument(collectionId, docId, data) {
  if (FLAGS.dryRun) { console.log(`[DRY-RUN] UPDATE ${docId}`); return; }
  const payload = { data: data };
  await appwriteRequest('PATCH', `/databases/${DATABASE_ID}/collections/${collectionId}/documents/${docId}`, payload);
}

async function createDocument(collectionId, data) {
  if (FLAGS.dryRun) { console.log(`[DRY-RUN] CREATE NEW`); return; }
  process.stdout.write(`Creating New Question... `);
  await appwriteRequest('POST', `/databases/${DATABASE_ID}/collections/${collectionId}/documents`, {
    documentId: 'unique()',
    data: data
  });
  console.log("OK");
}

async function deleteDocument(collectionId, docId, label) {
  if (FLAGS.dryRun) { console.log(`[DRY-RUN] DELETE ${label}`); return; }
  process.stdout.write(`Deleting ${label}... `);
  await appwriteRequest('DELETE', `/databases/${DATABASE_ID}/collections/${collectionId}/documents/${docId}`);
  console.log("DELETED");
}


// --- MAIN EXECUTION ---

(async () => {
  try {
    console.log(`Quest Data Sync Tool`);
    console.log(`--------------------`);
    console.log(`Mode: ${FLAGS.dryRun ? 'DRY RUN (No changes)' : 'LIVE'}`);
    console.log(`Prune: ${FLAGS.prune ? 'ENABLED' : 'DISABLED'}`);

    if (FLAGS.topics || FLAGS.all) await syncTopicsAndSubtopics();
    if (FLAGS.questions || FLAGS.all) await syncQuestions();

    console.log(`\nSync Complete!`);
  } catch (e) {
    console.error("\nFATAL ERROR:", e.message);
    if (FLAGS.verbose) console.error(e);
    process.exit(1);
  }
})();
