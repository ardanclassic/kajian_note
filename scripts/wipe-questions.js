import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
const COLLECTION_ID = env.VITE_APPWRITE_COLLECTION_QUESTIONS || 'questions';

async function appwriteRequest(method, path, body = null) {
  const url = `${ENDPOINT}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': PROJECT_ID,
    'X-Appwrite-Key': API_KEY
  };
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const response = await fetch(url, options);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API Error ${response.status}: ${text}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

async function wipe() {
  console.log("Wiping all documents in collection:", COLLECTION_ID);

  let hasMore = true;
  let count = 0;

  while (hasMore) {
    // We use a small limit and keep fetching the first page because as we delete, 
    // the next 100 become the "first" 100.
    const url = `/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents?limit=100`;
    const response = await appwriteRequest('GET', url);

    if (response.documents.length === 0) {
      hasMore = false;
      break;
    }

    console.log(`Found ${response.documents.length} documents. Deleting...`);

    for (const doc of response.documents) {
      await appwriteRequest('DELETE', `/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents/${doc.$id}`);
      count++;
      if (count % 10 === 0) process.stdout.write('.');
    }
    console.log(`\nDeleted ${count} so far...`);
  }

  console.log(`\nFinished! Total deleted: ${count}`);
}

wipe().catch(err => console.error(err));
