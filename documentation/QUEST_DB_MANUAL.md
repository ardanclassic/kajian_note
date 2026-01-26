# Quest Database Management Guide

This guide explains how to manage the **Quest (Quiz)** data in Appwrite using the local JSON files as the source of truth.

## Overview

The Quest data is stored in **local JSON files** located in `src/data/quest/`. These files are the "Master Data". To update the Appwrite Database (Live App), you simply edit these files and run the **Sync Script**.

### Data Structure

1.  **Topics & Subtopics**: `src/data/quest/topics.json`
    - Defines the hierarchy (e.g. Akidah -> Tauhid).
    - Defines metadata (Title, Color, Icon).
2.  **Questions**: `src/data/quest/*.json` (e.g. `akidah-tauhid.json`)
    - Contains the actual questions for each subtopic.
    - Matched to subtopic by `subtopic_id` inside the JSON.

---

## The Universal Sync Script

We provides a single universal script to handle **Create**, **Update**, and **Delete** operations.
This script replaces all previous granular scripts.

**Script Path**: `scripts/quest-sync.js`

### Basic Usage

To sync **EVERYTHING** (Topics, Subtopics, and Questions):

```bash
node scripts/quest-sync.js
```

### Options

| Flag          | Description                                                                                                                   |
| :------------ | :---------------------------------------------------------------------------------------------------------------------------- |
| `--topics`    | Sync only Topics and Subtopics.                                                                                               |
| `--questions` | Sync only Questions.                                                                                                          |
| `--prune`     | **Destructive**: Deletes items in DB that are NOT in your JSON files. Use this if you deleted a question or subtopic locally. |
| `--dry-run`   | Simulation mode. Shows what _would_ happen without changing the DB.                                                           |
| `--verbose`   | Shows detailed API logs.                                                                                                      |

### ⚠️ Important Notice on Limits

The script presently fetches the default page of documents (25 items) per collection to avoid API complexity.

- If you have **more than ~25 questions total** in the DB, the script might warn you.
- In "Playground" mode, this is usually sufficient.
- **Pruning is disabled** automatically if the script detects it hasn't fetched all items, to prevent accidental deletion.

---

## Common Workflows

### 1. Updating a Title (Topic/Subtopic)

1.  Open `src/data/quest/topics.json`.
2.  Find the item (e.g. "Tauhid").
3.  Change `"name": "Tauhid & Iman"`.
4.  Run:
    ```bash
    node scripts/quest-sync.js --topics
    ```

### 2. Adding a New Question

1.  Open the relevant JSON file (e.g. `src/data/quest/akidah-tauhid.json`).
2.  Add a new question object to the array.
3.  Run:
    ```bash
    node scripts/quest-sync.js --questions
    ```
    _Tip: You can just run `node scripts/quest-sync.js` to sync all._

### 3. Fixing a Typo in a Question

1.  Open the JSON file.
2.  Edit the `question_text` or `options`.
3.  Run:
    ```bash
    node scripts/quest-sync.js --questions
    ```
    _Note: The script matches questions by Text and Subtopic ID. If you change the text significantly, it might be seen as a new question._

### 4. Deleting a Question

1.  Remove the question block from the JSON file.
2.  Run with prune to remove it from DB:
    ```bash
    node scripts/quest-sync.js --questions --prune
    ```

### 5. Adding a New Subtopic

1.  Add entry to `topics.json`.
2.  Create a new file `src/data/quest/new-subtopic.json`.
3.  Add questions to that file (make sure `subtopic_id` matches the slug in `topics.json`).
4.  Run:
    ```bash
    node scripts/quest-sync.js
    ```
