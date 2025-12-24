SET
    statement_timeout = 0;

SET
    lock_timeout = 0;

SET
    idle_in_transaction_session_timeout = 0;

SET
    client_encoding = 'UTF8';

SET
    standard_conforming_strings = on;

SELECT
    pg_catalog.set_config('search_path', '', false);

SET
    check_function_bodies = false;

SET
    xmloption = content;

SET
    client_min_messages = warning;

SET
    row_security = off;

CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE
OR REPLACE FUNCTION "public"."check_subscription_expired"() RETURNS "void" LANGUAGE "plpgsql" SECURITY DEFINER AS $ $ BEGIN
UPDATE
    users
SET
    subscription_status = 'expired',
    subscription_tier = 'free'
WHERE
    subscription_end_date < NOW()
    AND subscription_status = 'active'
    AND subscription_tier != 'free';

END;

$ $;

ALTER FUNCTION "public"."check_subscription_expired"() OWNER TO "postgres";

CREATE
OR REPLACE FUNCTION "public"."match_user_by_email"("p_email" "text") RETURNS "uuid" LANGUAGE "plpgsql" SECURITY DEFINER AS $ $ DECLARE v_user_id UUID;

BEGIN -- Try payment_email first (if user set it)
SELECT
    id INTO v_user_id
FROM
    users
WHERE
    payment_email = p_email
LIMIT
    1;

-- Fallback to main email
IF v_user_id IS NULL THEN
SELECT
    id INTO v_user_id
FROM
    users
WHERE
    email = p_email
LIMIT
    1;

END IF;

RETURN v_user_id;

END;

$ $;

ALTER FUNCTION "public"."match_user_by_email"("p_email" "text") OWNER TO "postgres";

CREATE
OR REPLACE FUNCTION "public"."update_imagekit_temp_uploads_updated_at"() RETURNS "trigger" LANGUAGE "plpgsql" AS $ $ BEGIN NEW.updated_at = NOW();

RETURN NEW;

END;

$ $;

ALTER FUNCTION "public"."update_imagekit_temp_uploads_updated_at"() OWNER TO "postgres";

CREATE
OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger" LANGUAGE "plpgsql" AS $ $ BEGIN NEW.updated_at = NOW();

RETURN NEW;

END;

$ $;

ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET
    default_tablespace = '';

SET
    default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."admin_alerts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "type" "text" NOT NULL,
    "severity" "text" NOT NULL,
    "message" "text" NOT NULL,
    "data" "jsonb",
    "resolved" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE
    "public"."admin_alerts" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."imagekit_temp_uploads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "file_id" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_size" integer NOT NULL,
    "folder" "text" DEFAULT 'temp-pdfs' :: "text" NOT NULL,
    "uploaded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "deleted_at" timestamp with time zone,
    "note_id" "uuid",
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "uploader_role" "text" DEFAULT 'member' :: "text",
    CONSTRAINT "imagekit_temp_uploads_uploader_role_check" CHECK (
        (
            "uploader_role" = ANY (
                ARRAY ['admin'::"text", 'panitia'::"text", 'ustadz'::"text", 'member'::"text"]
            )
        )
    )
);

ALTER TABLE
    "public"."imagekit_temp_uploads" OWNER TO "postgres";

COMMENT ON TABLE "public"."imagekit_temp_uploads" IS 'Tracks temporary PDF uploads to ImageKit for automatic cleanup';

COMMENT ON COLUMN "public"."imagekit_temp_uploads"."file_id" IS 'ImageKit file ID (unique identifier from ImageKit API)';

COMMENT ON COLUMN "public"."imagekit_temp_uploads"."expires_at" IS 'When the file should be deleted (typically uploaded_at + 1 hour)';

COMMENT ON COLUMN "public"."imagekit_temp_uploads"."deleted_at" IS 'When the file was deleted from ImageKit (NULL = not yet deleted)';

COMMENT ON COLUMN "public"."imagekit_temp_uploads"."uploader_role" IS 'Role of uploader for retention logic (synced from users table)';

CREATE
OR REPLACE VIEW "public"."imagekit_expired_files" AS
SELECT
    "id",
    "file_id",
    "file_url",
    "file_name",
    "file_size",
    "folder",
    "uploaded_at",
    "expires_at",
    "note_id",
    "user_id",
    (
        EXTRACT(
            epoch
            FROM
                ("now"() - "expires_at")
        ) / (3600) :: numeric
    ) AS "hours_expired"
FROM
    "public"."imagekit_temp_uploads"
WHERE
    (
        ("expires_at" < "now"())
        AND ("deleted_at" IS NULL)
    )
ORDER BY
    "expires_at";

ALTER VIEW "public"."imagekit_expired_files" OWNER TO "postgres";

COMMENT ON VIEW "public"."imagekit_expired_files" IS 'View of all expired files that need to be deleted from ImageKit';

CREATE TABLE IF NOT EXISTS "public"."notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "is_public" boolean DEFAULT false,
    "is_pinned" boolean DEFAULT false,
    "tags" "text" [],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "source_type" character varying(20) DEFAULT 'manual' :: character varying,
    "source_url" "text",
    "source_metadata" "jsonb",
    CONSTRAINT "check_notes_source_type" CHECK (
        (
            ("source_type") :: "text" = ANY (
                (
                    ARRAY ['manual'::character varying, 'youtube'::character varying]
                ) :: "text" []
            )
        )
    )
);

ALTER TABLE
    "public"."notes" OWNER TO "postgres";

COMMENT ON COLUMN "public"."notes"."source_type" IS 'Type of note source: manual or youtube';

COMMENT ON COLUMN "public"."notes"."source_url" IS 'Source URL (YouTube video URL if imported)';

COMMENT ON COLUMN "public"."notes"."source_metadata" IS 'JSON metadata for source (YouTube video info, AI summary info, etc)';

CREATE TABLE IF NOT EXISTS "public"."payment_attempts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "reference_id" "text" NOT NULL,
    "email" "text" NOT NULL,
    "tier" "text" NOT NULL,
    "amount" integer NOT NULL,
    "payment_url" "text",
    "status" "text" DEFAULT 'pending' :: "text",
    "processed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE
    "public"."payment_attempts" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."payment_webhooks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "payment_id" "text" NOT NULL,
    "event_type" "text" NOT NULL,
    "payload" "jsonb" NOT NULL,
    "processed" boolean DEFAULT false,
    "processed_at" timestamp with time zone,
    "error_message" "text",
    "customer_email" "text",
    "matched_user_id" "uuid",
    "received_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE
    "public"."payment_webhooks" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."profile_changes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "field_changed" "text" NOT NULL,
    "old_value" "text",
    "new_value" "text",
    "changed_by" "uuid",
    "changed_by_role" "text",
    "changed_at" timestamp with time zone DEFAULT "now"(),
    "ip_address" "text",
    "user_agent" "text"
);

ALTER TABLE
    "public"."profile_changes" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tier" "text" NOT NULL,
    "status" "text" NOT NULL,
    "payment_method" "text" DEFAULT 'lynk_id' :: "text",
    "payment_id" "text",
    "payment_status" "text",
    "amount" numeric(10, 2),
    "currency" "text" DEFAULT 'IDR' :: "text",
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone NOT NULL,
    "customer_email" "text",
    "customer_name" "text",
    "customer_phone" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "subscriptions_payment_status_check" CHECK (
        (
            "payment_status" = ANY (
                ARRAY ['pending'::"text", 'success'::"text", 'failed'::"text", 'cancelled'::"text"]
            )
        )
    ),
    CONSTRAINT "subscriptions_status_check" CHECK (
        (
            "status" = ANY (
                ARRAY ['active'::"text", 'expired'::"text", 'cancelled'::"text", 'pending'::"text"]
            )
        )
    ),
    CONSTRAINT "subscriptions_tier_check" CHECK (
        (
            "tier" = ANY (
                ARRAY ['free'::"text", 'premium'::"text", 'advance'::"text"]
            )
        )
    )
);

ALTER TABLE
    "public"."subscriptions" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "auth_user_id" "uuid",
    "username" "text" NOT NULL,
    "full_name" "text" NOT NULL,
    "phone" "text",
    "role" "text" DEFAULT 'member' :: "text" NOT NULL,
    "subscription_tier" "text" DEFAULT 'free' :: "text" NOT NULL,
    "subscription_status" "text" DEFAULT 'active' :: "text" NOT NULL,
    "subscription_start_date" timestamp with time zone,
    "subscription_end_date" timestamp with time zone,
    "payment_email" "text",
    "avatar_url" "text",
    "bio" "text",
    "auth_type" "text" DEFAULT 'phone' :: "text" NOT NULL,
    "is_verified" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "force_password_change" boolean DEFAULT false,
    "password_reset_by_admin" boolean DEFAULT false,
    "password_reset_at" timestamp with time zone,
    "password_changed_at" timestamp with time zone,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "last_login_at" timestamp with time zone,
    "telegram_chat_id" "text",
    "telegram_verified_at" timestamp without time zone,
    "status" "text" DEFAULT 'active' :: "text",
    CONSTRAINT "users_role_check" CHECK (
        (
            "role" = ANY (
                ARRAY ['admin'::"text", 'panitia'::"text", 'ustadz'::"text", 'member'::"text"]
            )
        )
    ),
    CONSTRAINT "users_status_check" CHECK (
        (
            "status" = ANY (
                ARRAY ['active'::"text", 'pending'::"text", 'suspended'::"text", 'inactive'::"text"]
            )
        )
    ),
    CONSTRAINT "users_subscription_status_check" CHECK (
        (
            "subscription_status" = ANY (
                ARRAY ['active'::"text", 'expired'::"text", 'cancelled'::"text"]
            )
        )
    ),
    CONSTRAINT "users_subscription_tier_check" CHECK (
        (
            "subscription_tier" = ANY (
                ARRAY ['free'::"text", 'premium'::"text", 'advance'::"text", 'panitia_basic'::"text", 'panitia_pro'::"text"]
            )
        )
    )
);

ALTER TABLE
    "public"."users" OWNER TO "postgres";

ALTER TABLE
    ONLY "public"."admin_alerts"
ADD
    CONSTRAINT "admin_alerts_pkey" PRIMARY KEY ("id");

ALTER TABLE
    ONLY "public"."imagekit_temp_uploads"
ADD
    CONSTRAINT "imagekit_temp_uploads_file_id_key" UNIQUE ("file_id");

ALTER TABLE
    ONLY "public"."imagekit_temp_uploads"
ADD
    CONSTRAINT "imagekit_temp_uploads_pkey" PRIMARY KEY ("id");

ALTER TABLE
    ONLY "public"."notes"
ADD
    CONSTRAINT "notes_pkey" PRIMARY KEY ("id");

ALTER TABLE
    ONLY "public"."payment_attempts"
ADD
    CONSTRAINT "payment_attempts_pkey" PRIMARY KEY ("id");

ALTER TABLE
    ONLY "public"."payment_attempts"
ADD
    CONSTRAINT "payment_attempts_reference_id_key" UNIQUE ("reference_id");

ALTER TABLE
    ONLY "public"."payment_webhooks"
ADD
    CONSTRAINT "payment_webhooks_pkey" PRIMARY KEY ("id");

ALTER TABLE
    ONLY "public"."profile_changes"
ADD
    CONSTRAINT "profile_changes_pkey" PRIMARY KEY ("id");

ALTER TABLE
    ONLY "public"."subscriptions"
ADD
    CONSTRAINT "subscriptions_payment_id_key" UNIQUE ("payment_id");

ALTER TABLE
    ONLY "public"."subscriptions"
ADD
    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");

ALTER TABLE
    ONLY "public"."users"
ADD
    CONSTRAINT "users_auth_user_id_key" UNIQUE ("auth_user_id");

ALTER TABLE
    ONLY "public"."users"
ADD
    CONSTRAINT "users_email_key" UNIQUE ("email");

ALTER TABLE
    ONLY "public"."users"
ADD
    CONSTRAINT "users_pkey" PRIMARY KEY ("id");

ALTER TABLE
    ONLY "public"."users"
ADD
    CONSTRAINT "users_telegram_chat_id_key" UNIQUE ("telegram_chat_id");

ALTER TABLE
    ONLY "public"."users"
ADD
    CONSTRAINT "users_username_key" UNIQUE ("username");

CREATE INDEX "idx_admin_alerts_unresolved" ON "public"."admin_alerts" USING "btree" ("resolved")
WHERE
    ("resolved" = false);

CREATE INDEX "idx_imagekit_temp_uploads_expires_at" ON "public"."imagekit_temp_uploads" USING "btree" ("expires_at")
WHERE
    ("deleted_at" IS NULL);

CREATE INDEX "idx_imagekit_temp_uploads_file_id" ON "public"."imagekit_temp_uploads" USING "btree" ("file_id");

CREATE INDEX "idx_imagekit_temp_uploads_note_id" ON "public"."imagekit_temp_uploads" USING "btree" ("note_id");

CREATE INDEX "idx_imagekit_temp_uploads_uploader_role" ON "public"."imagekit_temp_uploads" USING "btree" ("uploader_role");

CREATE INDEX "idx_imagekit_temp_uploads_user_id" ON "public"."imagekit_temp_uploads" USING "btree" ("user_id");

CREATE INDEX "idx_notes_created_at" ON "public"."notes" USING "btree" ("created_at" DESC);

CREATE INDEX "idx_notes_is_public" ON "public"."notes" USING "btree" ("is_public");

CREATE INDEX "idx_notes_source_metadata" ON "public"."notes" USING "gin" ("source_metadata");

CREATE INDEX "idx_notes_source_type" ON "public"."notes" USING "btree" ("source_type");

CREATE INDEX "idx_notes_source_url" ON "public"."notes" USING "btree" ("source_url");

CREATE INDEX "idx_notes_tags" ON "public"."notes" USING "gin" ("tags");

CREATE INDEX "idx_notes_user_id" ON "public"."notes" USING "btree" ("user_id");

CREATE INDEX "idx_notes_user_id_public" ON "public"."notes" USING "btree" ("user_id", "is_public");

CREATE INDEX "idx_payment_attempts_email" ON "public"."payment_attempts" USING "btree" ("email");

CREATE INDEX "idx_payment_attempts_ref" ON "public"."payment_attempts" USING "btree" ("reference_id");

CREATE INDEX "idx_payment_webhooks_customer_email" ON "public"."payment_webhooks" USING "btree" ("customer_email");

CREATE INDEX "idx_payment_webhooks_payment_id" ON "public"."payment_webhooks" USING "btree" ("payment_id");

CREATE INDEX "idx_payment_webhooks_processed" ON "public"."payment_webhooks" USING "btree" ("processed");

CREATE INDEX "idx_payment_webhooks_received_at" ON "public"."payment_webhooks" USING "btree" ("received_at" DESC);

CREATE INDEX "idx_profile_changes_changed_at" ON "public"."profile_changes" USING "btree" ("changed_at" DESC);

CREATE INDEX "idx_profile_changes_user_id" ON "public"."profile_changes" USING "btree" ("user_id");

CREATE INDEX "idx_subscriptions_end_date" ON "public"."subscriptions" USING "btree" ("end_date");

CREATE INDEX "idx_subscriptions_payment_id" ON "public"."subscriptions" USING "btree" ("payment_id");

CREATE INDEX "idx_subscriptions_status" ON "public"."subscriptions" USING "btree" ("status");

CREATE INDEX "idx_subscriptions_user_id" ON "public"."subscriptions" USING "btree" ("user_id");

CREATE INDEX "idx_users_auth_user_id" ON "public"."users" USING "btree" ("auth_user_id");

CREATE INDEX "idx_users_auth_user_id_fast" ON "public"."users" USING "btree" ("auth_user_id") INCLUDE ("id", "role");

CREATE INDEX "idx_users_payment_email" ON "public"."users" USING "btree" ("payment_email");

CREATE INDEX "idx_users_role" ON "public"."users" USING "btree" ("role");

CREATE INDEX "idx_users_status" ON "public"."users" USING "btree" ("status");

CREATE INDEX "idx_users_subscription_end_date" ON "public"."users" USING "btree" ("subscription_end_date");

CREATE INDEX "idx_users_subscription_tier" ON "public"."users" USING "btree" ("subscription_tier");

CREATE INDEX "idx_users_telegram_chat_id" ON "public"."users" USING "btree" ("telegram_chat_id");

CREATE INDEX "idx_users_username" ON "public"."users" USING "btree" ("username");

CREATE
OR REPLACE TRIGGER "trigger_update_imagekit_temp_uploads_updated_at" BEFORE
UPDATE
    ON "public"."imagekit_temp_uploads" FOR EACH ROW EXECUTE FUNCTION "public"."update_imagekit_temp_uploads_updated_at"();

CREATE
OR REPLACE TRIGGER "update_notes_updated_at" BEFORE
UPDATE
    ON "public"."notes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE
OR REPLACE TRIGGER "update_subscriptions_updated_at" BEFORE
UPDATE
    ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE
OR REPLACE TRIGGER "update_users_updated_at" BEFORE
UPDATE
    ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

ALTER TABLE
    ONLY "public"."imagekit_temp_uploads"
ADD
    CONSTRAINT "imagekit_temp_uploads_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE
SET
    NULL;

ALTER TABLE
    ONLY "public"."imagekit_temp_uploads"
ADD
    CONSTRAINT "imagekit_temp_uploads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE
    ONLY "public"."notes"
ADD
    CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE
    ONLY "public"."payment_attempts"
ADD
    CONSTRAINT "payment_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE
    ONLY "public"."payment_webhooks"
ADD
    CONSTRAINT "payment_webhooks_matched_user_id_fkey" FOREIGN KEY ("matched_user_id") REFERENCES "public"."users"("id");

ALTER TABLE
    ONLY "public"."profile_changes"
ADD
    CONSTRAINT "profile_changes_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id");

ALTER TABLE
    ONLY "public"."profile_changes"
ADD
    CONSTRAINT "profile_changes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE
    ONLY "public"."subscriptions"
ADD
    CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE
    ONLY "public"."users"
ADD
    CONSTRAINT "users_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE
    ONLY "public"."users"
ADD
    CONSTRAINT "users_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");

CREATE POLICY "Admin view all webhooks" ON "public"."payment_webhooks" FOR
SELECT
    USING (
        (
            EXISTS (
                SELECT
                    1
                FROM
                    "public"."users" "u"
                WHERE
                    (
                        ("u"."auth_user_id" = "auth"."uid"())
                        AND ("u"."role" = 'admin' :: "text")
                    )
            )
        )
    );

CREATE POLICY "Service role has full access" ON "public"."imagekit_temp_uploads" USING (
    (
        ("auth"."jwt"() ->> 'role' :: "text") = 'service_role' :: "text"
    )
);

CREATE POLICY "System insert webhooks" ON "public"."payment_webhooks" FOR
INSERT
    WITH CHECK (true);

CREATE POLICY "System update webhooks" ON "public"."payment_webhooks" FOR
UPDATE
    USING (true);

CREATE POLICY "Users can delete their own uploads" ON "public"."imagekit_temp_uploads" FOR DELETE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can insert their own uploads" ON "public"."imagekit_temp_uploads" FOR
INSERT
    WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can update their own uploads" ON "public"."imagekit_temp_uploads" FOR
UPDATE
    USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can view their own uploads" ON "public"."imagekit_temp_uploads" FOR
SELECT
    USING (("auth"."uid"() = "user_id"));

ALTER TABLE
    "public"."imagekit_temp_uploads" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    "public"."notes" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_delete_by_staff" ON "public"."notes" FOR DELETE USING (
    (
        ("auth"."jwt"() ->> 'role' :: "text") = ANY (ARRAY ['admin'::"text", 'panitia'::"text"])
    )
);

CREATE POLICY "notes_delete_own" ON "public"."notes" FOR DELETE USING (
    (
        "user_id" IN (
            SELECT
                "u"."id"
            FROM
                "public"."users" "u"
            WHERE
                ("u"."auth_user_id" = "auth"."uid"())
        )
    )
);

CREATE POLICY "notes_insert_own" ON "public"."notes" FOR
INSERT
    WITH CHECK (
        (
            "user_id" IN (
                SELECT
                    "u"."id"
                FROM
                    "public"."users" "u"
                WHERE
                    ("u"."auth_user_id" = "auth"."uid"())
            )
        )
    );

CREATE POLICY "notes_select_own_or_public" ON "public"."notes" FOR
SELECT
    USING (
        (
            (
                "user_id" IN (
                    SELECT
                        "u"."id"
                    FROM
                        "public"."users" "u"
                    WHERE
                        ("u"."auth_user_id" = "auth"."uid"())
                )
            )
            OR ("is_public" = true)
        )
    );

CREATE POLICY "notes_update_own" ON "public"."notes" FOR
UPDATE
    USING (
        (
            "user_id" IN (
                SELECT
                    "u"."id"
                FROM
                    "public"."users" "u"
                WHERE
                    ("u"."auth_user_id" = "auth"."uid"())
            )
        )
    );

ALTER TABLE
    "public"."payment_webhooks" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    "public"."profile_changes" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile_changes_insert_system" ON "public"."profile_changes" FOR
INSERT
    WITH CHECK (true);

CREATE POLICY "profile_changes_select_own" ON "public"."profile_changes" FOR
SELECT
    USING (
        (
            (
                "user_id" IN (
                    SELECT
                        "u"."id"
                    FROM
                        "public"."users" "u"
                    WHERE
                        ("u"."auth_user_id" = "auth"."uid"())
                )
            )
            OR (
                ("auth"."jwt"() ->> 'role' :: "text") = 'admin' :: "text"
            )
        )
    );

ALTER TABLE
    "public"."subscriptions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_insert_system" ON "public"."subscriptions" FOR
INSERT
    WITH CHECK (true);

CREATE POLICY "subscriptions_select_own" ON "public"."subscriptions" FOR
SELECT
    USING (
        (
            (
                "user_id" = (
                    SELECT
                        "users"."id"
                    FROM
                        "public"."users"
                    WHERE
                        ("users"."auth_user_id" = "auth"."uid"())
                    LIMIT
                        1
                )
            )
            OR (
                ("auth"."jwt"() ->> 'role' :: "text") = 'admin' :: "text"
            )
        )
    );

CREATE POLICY "subscriptions_update_system" ON "public"."subscriptions" FOR
UPDATE
    USING (true);

ALTER TABLE
    "public"."users" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_delete_by_admin" ON "public"."users" FOR DELETE USING (
    (
        (
            ("auth"."jwt"() ->> 'role' :: "text") = 'admin' :: "text"
        )
        AND ("auth"."uid"() <> "auth_user_id")
    )
);

CREATE POLICY "users_insert_own" ON "public"."users" FOR
INSERT
    WITH CHECK (("auth"."uid"() = "auth_user_id"));

CREATE POLICY "users_select_unified" ON "public"."users" FOR
SELECT
    USING (
        (
            ("auth"."uid"() = "auth_user_id")
            OR (
                ("auth"."jwt"() ->> 'role' :: "text") = ANY (
                    ARRAY ['admin'::"text", 'panitia'::"text", 'ustadz'::"text"]
                )
            )
        )
    );

CREATE POLICY "users_update_by_admin" ON "public"."users" FOR
UPDATE
    USING (
        (
            (
                ("auth"."jwt"() ->> 'role' :: "text") = 'admin' :: "text"
            )
            AND ("auth"."uid"() <> "auth_user_id")
        )
    );

CREATE POLICY "users_update_own" ON "public"."users" FOR
UPDATE
    USING (("auth"."uid"() = "auth_user_id"));

CREATE POLICY "webhooks_insert_system" ON "public"."payment_webhooks" FOR
INSERT
    WITH CHECK (true);

CREATE POLICY "webhooks_select_admin" ON "public"."payment_webhooks" FOR
SELECT
    USING (
        (
            ("auth"."jwt"() ->> 'role' :: "text") = 'admin' :: "text"
        )
    );

CREATE POLICY "webhooks_update_system" ON "public"."payment_webhooks" FOR
UPDATE
    USING (true);

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "anon";

GRANT USAGE ON SCHEMA "public" TO "authenticated";

GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."check_subscription_expired"() TO "anon";

GRANT ALL ON FUNCTION "public"."check_subscription_expired"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."check_subscription_expired"() TO "service_role";

GRANT ALL ON FUNCTION "public"."match_user_by_email"("p_email" "text") TO "anon";

GRANT ALL ON FUNCTION "public"."match_user_by_email"("p_email" "text") TO "authenticated";

GRANT ALL ON FUNCTION "public"."match_user_by_email"("p_email" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."update_imagekit_temp_uploads_updated_at"() TO "anon";

GRANT ALL ON FUNCTION "public"."update_imagekit_temp_uploads_updated_at"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."update_imagekit_temp_uploads_updated_at"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";

GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";

GRANT ALL ON TABLE "public"."admin_alerts" TO "anon";

GRANT ALL ON TABLE "public"."admin_alerts" TO "authenticated";

GRANT ALL ON TABLE "public"."admin_alerts" TO "service_role";

GRANT ALL ON TABLE "public"."imagekit_temp_uploads" TO "anon";

GRANT ALL ON TABLE "public"."imagekit_temp_uploads" TO "authenticated";

GRANT ALL ON TABLE "public"."imagekit_temp_uploads" TO "service_role";

GRANT ALL ON TABLE "public"."imagekit_expired_files" TO "anon";

GRANT ALL ON TABLE "public"."imagekit_expired_files" TO "authenticated";

GRANT ALL ON TABLE "public"."imagekit_expired_files" TO "service_role";

GRANT ALL ON TABLE "public"."notes" TO "anon";

GRANT ALL ON TABLE "public"."notes" TO "authenticated";

GRANT ALL ON TABLE "public"."notes" TO "service_role";

GRANT ALL ON TABLE "public"."payment_attempts" TO "anon";

GRANT ALL ON TABLE "public"."payment_attempts" TO "authenticated";

GRANT ALL ON TABLE "public"."payment_attempts" TO "service_role";

GRANT ALL ON TABLE "public"."payment_webhooks" TO "anon";

GRANT ALL ON TABLE "public"."payment_webhooks" TO "authenticated";

GRANT ALL ON TABLE "public"."payment_webhooks" TO "service_role";

GRANT ALL ON TABLE "public"."profile_changes" TO "anon";

GRANT ALL ON TABLE "public"."profile_changes" TO "authenticated";

GRANT ALL ON TABLE "public"."profile_changes" TO "service_role";

GRANT ALL ON TABLE "public"."subscriptions" TO "anon";

GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";

GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";

GRANT ALL ON TABLE "public"."users" TO "anon";

GRANT ALL ON TABLE "public"."users" TO "authenticated";

GRANT ALL ON TABLE "public"."users" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";