# Panduan Update Schema Database (Multiplayer Quest)

Dokumen ini berisi langkah-langkah manual untuk mengupdate database Supabase dan Appwrite guna mendukung fitur Multiplayer.

---

## 1. SUPABASE (Update `quest_sessions`)

Tujuan: Menambahkan kolom untuk mencatat mode permainan dan ID Room.

**Langkah-langkah:**

1. Buka Dashboard Supabase project Anda.
2. Masuk ke menu **SQL Editor**.
3. Klik "New Query".
4. Copy & Paste kode SQL berikut, lalu klik **RUN**:

```sql
-- Menambahkan kolom game_mode (Default 'SOLO')
ALTER TABLE "quest_sessions"
ADD COLUMN "game_mode" TEXT NOT NULL DEFAULT 'SOLO';

-- Menambahkan kolom match_id (Untuk menyimpan Room Code)
ALTER TABLE "quest_sessions"
ADD COLUMN "match_id" TEXT;

-- (Opsional) Tambahkan Index agar pencarian history per room cepat
CREATE INDEX idx_quest_sessions_match_id ON quest_sessions(match_id);
```

5. Verifikasi: Buka **Table Editor** > `quest_sessions`, pastikan kolom `game_mode` dan `match_id` sudah muncul.

---

## 2. APPWRITE (Collection Baru)

Tujuan: Membuat wadah untuk data sesi permainan yang sedang berlangsung (Realtime).

**Langkah-langkah:**

### A. Buat Database (Jika belum ada)

Jika Anda sudah punya database untuk Quest (misal `quest_db`), gunakan itu. Jika belum:

1. Buka Appwrite Console > **Databases**.
2. Klik **Create Database**.
   - Name: `Quest Data`
   - ID: `quest_data` (atau sesuaikan dengan env variable Anda)

### B. Buat Collection: `Active Sessions`

1. Di dalam database tadi, klik **Create Collection**.
   - Name: `Active Sessions`
   - ID: `active_sessions` (atau biarkan auto-generate, tapi update constant di code).
   - **Permissions**:
     - Klik tab "Settings" / "Permissions".
     - Tambahkan Role `Any` -> Centang: `Read`, `create`, `update`, `delete`.
     - _(Note: Untuk Production nanti, ganti `Any` dengan `Users` dan gunakan Document Security, tapi untuk dev `Any` lebih mudah)._

2. Masuk ke tab **Attributes**, lalu tambahkan attribute berikut satu per satu:

| Attribute Key          | Type    | Size  | Required | Array? | Keterangan                          |
| :--------------------- | :------ | :---- | :------- | :----- | :---------------------------------- |
| `room_code`            | String  | 16    | **Yes**  | No     | Kode unik room (misal: "A9X2").     |
| `host_uid`             | String  | 64    | **Yes**  | No     | Supabase User ID milik Host.        |
| `status`               | String  | 32    | **Yes**  | No     | Status game (`WAITING`, `PLAYING`). |
| `topic_config`         | String  | 5000  | **Yes**  | No     | JSON string config kuis.            |
| `players`              | String  | 10000 | **Yes**  | No     | JSON string list pemain.            |
| `current_question_idx` | Integer | -     | No       | No     | Index soal aktif (0, 1, 2...).      |
| `timer_end_at`         | String  | 64    | No       | No     | Timestamp ISO kapan timer habis.    |

### C. Buat Index (Penting untuk Query)

Masuk ke tab **Indexes**, buat index baru:

1. **Index Key**: `idx_room_code` (atau bebas)
   - Type: `Unique`
   - Attributes: `room_code`
   - (Agar tidak ada 2 room dengan kode yang sama).

---

## Selesai!

Setelah Anda menyelesaikan langkah di atas, environment database sudah siap untuk coding fitur Multiplayer.
