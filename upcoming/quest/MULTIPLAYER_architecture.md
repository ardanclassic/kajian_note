# Arsitektur Multiplayer Quest (Hybrid Strategy)

Dokumen ini menjelaskan rancangan teknis untuk fitur Multiplayer pada modul Quest, menggabungkan **Supabase** (User Identity & Persistent Stats) dan **Appwrite** (Realtime Gameplay & Hot State).

## 1. Konsep Utama (The Hybrid Approach)

- **Identity Layer (Supabase)**: Memegang "Single Source of Truth" untuk data User, Profile, dan Statistik Jangka Panjang (Level, XP, History).
- **Gameplay Layer (Appwrite)**: Bertindak sebagai "Game Server" serverless. Menangani Room Management, Realtime State Sync, dan Ephemeral Data (data sementara selama game berlangsung).

---

## 2. Struktur Database

### A. Supabase (Persistent Data)

Hanya satu tabel yang perlu dimodifikasi untuk mendukung tracking multiplayer.

**Table: `quest_sessions`** (Update)
Tabel ini mencatat riwayat permainan yang **sudah selesai**.

| Column          | Type     | Description                                                                     | Status   |
| :-------------- | :------- | :------------------------------------------------------------------------------ | :------- |
| `id`            | uuid     | Primary Key                                                                     | Existing |
| `user_id`       | uuid     | Reference to `users.id`                                                         | Existing |
| ...             | ...      | (Existing columns: score, answers, time)                                        | Existing |
| **`game_mode`** | **text** | Enum: `'SOLO'`, `'MULTIPLAYER'`, `'RANKED'`                                     | **NEW**  |
| **`match_id`**  | **text** | Kode Room/Match ID (e.g., `'X9A2'`). Berguna untuk query leaderboard per match. | **NEW**  |

> **SQL Migration Snippet:**
>
> ```sql
> ALTER TABLE quest_sessions
> ADD COLUMN game_mode text DEFAULT 'SOLO',
> ADD COLUMN match_id text;
> ```

---

### B. Appwrite (Realtime Game State)

Membutuhkan Database & Collection baru khusus untuk sesi aktif. Data di sini bersifat sementara (bisa dihapus setelah game selesai).

**Database ID:** `quest_engine` (New)
**Collection:** `active_sessions` (New)

| Attribute          | Type   | Size  | Required | Description                                                             |
| :----------------- | :----- | :---- | :------- | :---------------------------------------------------------------------- |
| `room_code`        | String | 10    | Yes      | Kode unik room (Index Unique).                                          |
| `host_uid`         | String | 36    | Yes      | ID Host (dari Supabase User ID).                                        |
| `status`           | String | 20    | Yes      | `WAITING`, `PLAYING`, `FINISHED`.                                       |
| `topic_config`     | String | 5000  | Yes      | **JSON**: Setting kuis (Topic, Subtopic, Question Count).               |
| `players`          | String | 10000 | Yes      | **JSON Array**: Snapshot data pemain & skor realtime.                   |
| `current_question` | String | 5000  | No       | **JSON**: Data soal yang sedang aktif (disembunyikan jawaban kuncinya). |
| `timer_end_at`     | String | 50    | No       | ISO Timestamp kapan soal aktif berakhir.                                |

**Struktur JSON `players`:**

```json
[
  {
    "supabase_id": "uuid-user-1",
    "username": "Zaky",
    "avatar_url": "https://...",
    "score": 120,
    "streak": 2,
    "last_answer_status": "CORRECT", // 'CORRECT', 'WRONG', 'PENDING'
    "connection_status": "ONLINE"
  },
  { "supabase_id": "uuid-user-2", ... }
]
```

---

## 3. Workflow & Data Flow

### Phase 1: INITIAL (Lobby & Preparation)

**Trigger**: User klik "Create Room" atau "Join Room".

1.  **Client** mengambil data user yang sedang login dari auth state Supabase.
2.  **Client** membuat objek `PlayerSnapshot` (ID, Name, Avatar, Score:0).
3.  **Client -> Appwrite**:
    - _Host_: Create Document di `active_sessions` dengan `players: [HostSnapshot]`.
    - _Guest_: Get Document by `room_code` -> Update Document `players.push(GuestSnapshot)`.
4.  **Appwrite Realtime**: Semua client subscribe ke dokumen ini. UI Lobby otomatis update saat ada player baru masuk.

### Phase 2: GAME (Realtime Loop)

**Trigger**: Host klik "Start Game".

1.  **Host Client** (sebagai Game Master) mengambil soal dari koleksi `Questions` (Appwrite).
2.  **Host** update dokumen Room:
    - Set `status` = `PLAYING`
    - Set `current_question` = Soal No. 1
    - Set `timer_end_at` = Now + 30s
3.  **Clients (Host & Guests)**:
    - Mendeteksi perubahan `current_question`.
    - Menampilkan layar soal.
    - User menjawab -> Client update `players` di Appwrite (tambah score jika benar).
    - _Security Note_: Validasi jawaban dilakukan di client (simple) atau via Appwrite Function (secure). Untuk MVP, client-side validation cukup.

### Phase 3: END (Sync & Persistence)

**Trigger**: Semua soal selesai atau Host mengakhiri game.

1.  **Appwrite** room status berubah jadi `FINISHED`.
2.  Tampilan "Game Over / Leaderboard" muncul berdasarkan data `players` terakhir di Appwrite.
3.  **Sync Back to Supabase**:
    - Setiap Client (secara mandiri) mengirim data performa mereka sendiri ke Supabase.
    - **Insert** ke table `quest_sessions` dengan `game_mode: 'MULTIPLAYER'` dan `match_id: 'ROOM_CODE'`.
    - **RPC Update** ke table `quest_stats` (Increment total score, questions answered, etc).
4.  **Cleanup**: Host (atau system timer) menghapus dokumen room di Appwrite agar tidak menumpuk.

---

## 4. Next Implementation Steps

1.  **Migrasi DB Supabase**: Jalankan SQL untuk menambah kolom baru.
2.  **Setup Appwrite**: Buat database & collection `active_sessions`.
3.  **Service Update**: Update `questService` untuk handle logic Create/Join Room.
4.  **UI Components**: Buat `LobbyView` dan `MultiplayerGameView`.
