/**
 * Supabase Client Configuration - MINIMAL & CORRECT
 * Back to basics with proper configuration
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "@/config/env";

/**
 * Create Supabase client with proper session persistence
 */
export const supabase = createClient(env.supabase.url, env.supabase.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Bind to window for debugging
if (typeof window !== "undefined") {
  (window as any).supabase = supabase;
}

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error getting user:", error);
    return null;
  }

  return user;
};

/**
 * Get current session
 */
export const getCurrentSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Error getting session:", error);
    return null;
  }

  return session;
};

/**
 * Sign out
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

/**
 * Database Types
 */
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          auth_user_id: string;
          username: string;
          full_name: string;
          phone: string | null;
          role: "admin" | "panitia" | "ustadz" | "member";
          subscription_tier: "free" | "premium" | "advance";
          subscription_status: "active" | "expired" | "cancelled";
          subscription_start_date: string | null;
          subscription_end_date: string | null;
          avatar_url: string | null;
          bio: string | null;
          auth_type: string;
          is_verified: boolean;
          is_active: boolean;
          force_password_change: boolean;
          password_reset_by_admin: boolean;
          password_reset_at: string | null;
          password_changed_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      notes: {
        Row: {
          id: string;
          title: string;
          content: string;
          user_id: string;
          is_public: boolean;
          is_pinned: boolean;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notes"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["notes"]["Insert"]>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          tier: "free" | "premium" | "advance";
          status: "active" | "expired" | "cancelled" | "pending";
          payment_method: string | null;
          payment_id: string | null;
          payment_status: "pending" | "success" | "failed" | "cancelled" | null;
          amount: number | null;
          currency: string | null;
          start_date: string;
          end_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["subscriptions"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
      };
      payment_webhooks: {
        Row: {
          id: string;
          payment_id: string;
          event_type: string;
          payload: any;
          processed: boolean;
          processed_at: string | null;
          error_message: string | null;
          received_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payment_webhooks"]["Row"], "id" | "received_at">;
        Update: Partial<Database["public"]["Tables"]["payment_webhooks"]["Insert"]>;
      };
      profile_changes: {
        Row: {
          id: string;
          user_id: string;
          field_changed: string;
          old_value: string | null;
          new_value: string | null;
          changed_by: string | null;
          changed_by_role: string | null;
          changed_at: string;
          ip_address: string | null;
          user_agent: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["profile_changes"]["Row"], "id" | "changed_at">;
        Update: Partial<Database["public"]["Tables"]["profile_changes"]["Insert"]>;
      };
      quest_sessions: {
        Row: {
          id: string;
          room_code: string;
          host_uid: string;
          status: "WAITING" | "PLAYING" | "FINISHED";
          topic_config: any; // JSON
          players: any[]; // JSON
          current_question_idx: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["quest_sessions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["quest_sessions"]["Insert"]>;
      };
    };
  };
};
