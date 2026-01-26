# Appwrite Quest - Cara Kelola Topik & Soal

## 🎯 Collection Structure

### Collection: `topics`
```json
{
  "id": "auto-generated",
  "slug": "fiqih-zakat",
  "topic": "Fiqih",
  "subtopic": "Zakat",
  "name": "Zakat",
  "description": "Hukum dan tata cara zakat",
  "order": 1,
  "is_active": true
}
```

### Collection: `questions`
```json
{
  "id": "auto-generated",
  "topic_slug": "fiqih-zakat",
  "question": "Apa syarat wajib zakat?",
  "options": [
    { "id": "A", "text": "Islam dan baligh" },
    { "id": "B", "text": "Mencapai nisab" },
    { "id": "C", "text": "Milik penuh" },
    { "id": "D", "text": "Semua benar" }
  ],
  "correct": "D",
  "explanation": {
    "text": "Syarat wajib zakat meliputi...",
    "dalil": "Quran/Hadits reference",
    "resources": ["url1", "url2"]
  },
  "points": 10,
  "is_active": true
}
```

---

## ➕ Cara Create New Topic

### Via Appwrite Console:

1. **Buka Appwrite Console** → pilih project Quest
2. **Databases** → pilih database → collection `topics`
3. **Add Document**
4. **Isi fields:**
   - `slug`: kebab-case unique (ex: `tauhid-asmaul-husna`)
   - `topic`: kategori utama (ex: `Tauhid`)
   - `subtopic`: sub kategori (ex: `Asmaul Husna`)
   - `name`: display name (ex: `Asmaul Husna`)
   - `description`: deskripsi singkat
   - `order`: urutan tampil (angka)
   - `is_active`: `true`
5. **Create**

### Via Script/Code (Batch):

```javascript
// create-topic.js
const { Client, Databases, ID } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('your-project-id')
  .setKey('your-api-key');

const databases = new Databases(client);

const newTopic = {
  slug: 'tauhid-asmaul-husna',
  topic: 'Tauhid',
  subtopic: 'Asmaul Husna',
  name: 'Asmaul Husna',
  description: 'Memahami nama-nama Allah',
  order: 5,
  is_active: true
};

await databases.createDocument(
  'database-id',
  'topics-collection-id',
  ID.unique(),
  newTopic
);
```

---

## 📝 Cara Add Soal di Existing Topic

### Via Appwrite Console:

1. **Databases** → collection `questions`
2. **Add Document**
3. **Isi fields:**
   - `topic_slug`: sama dengan slug topic (ex: `fiqih-zakat`)
   - `question`: teks pertanyaan
   - `options`: JSON array dengan struktur `[{"id":"A","text":"..."}]`
   - `correct`: ID jawaban benar (ex: `"A"`)
   - `explanation`: JSON object dengan `text`, `dalil`, `resources`
   - `points`: angka (default 10)
   - `is_active`: `true`
4. **Create**

### Via Script (Bulk Import):

```javascript
// import-questions.js
const questions = [
  {
    topic_slug: 'fiqih-zakat',
    question: 'Berapa nisab zakat emas?',
    options: [
      { id: 'A', text: '85 gram' },
      { id: 'B', text: '90 gram' },
      { id: 'C', text: '95 gram' },
      { id: 'D', text: '100 gram' }
    ],
    correct: 'A',
    explanation: {
      text: 'Nisab zakat emas adalah 85 gram...',
      dalil: 'Hadits riwayat...',
      resources: []
    },
    points: 10,
    is_active: true
  },
  // ... more questions
];

for (const q of questions) {
  await databases.createDocument(
    'database-id',
    'questions-collection-id',
    ID.unique(),
    q
  );
}
```

### Via JSON Import:

1. Siapkan file JSON dengan format array questions
2. Buat script import yang read JSON & batch create
3. Run script untuk bulk insert

---

## 🔧 Tips Management

**Naming Convention:**
- Slug: `{topic}-{subtopic}` (lowercase, kebab-case)
- Consistent casing untuk topic/subtopic

**Indexing:**
- Index pada `topic_slug` untuk query cepat
- Index pada `is_active` untuk filter

**Versioning:**
- Jangan delete soal, set `is_active: false`
- Bisa add field `version` jika perlu track changes

**Batch Operations:**
- Untuk 100+ soal, gunakan script bulk insert
- Appwrite batching support up to 100 documents per request

**Validation:**
- Pastikan `correct` ID ada di `options`
- Pastikan `topic_slug` exist di collection `topics`
- Validate JSON structure untuk `options` & `explanation`

---

## 📊 Query Example

**Get all topics:**
```javascript
const topics = await databases.listDocuments(
  'database-id',
  'topics-collection-id',
  [Query.equal('is_active', true), Query.orderAsc('order')]
);
```

**Get questions by topic:**
```javascript
const questions = await databases.listDocuments(
  'database-id',
  'questions-collection-id',
  [
    Query.equal('topic_slug', 'fiqih-zakat'),
    Query.equal('is_active', true),
    Query.limit(10)
  ]
);
```