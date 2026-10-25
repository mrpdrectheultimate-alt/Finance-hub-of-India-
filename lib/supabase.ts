// ============================================================
// FinanceHub — Supabase Client Helpers
// lib/supabase.ts
// Three clients: browser · server (cookie-based) · service role
// Upgraded to @supabase/ssr for unified, robust cookie exchange
// ============================================================

import { createBrowserClient as createSSRBrowserClient, createServerClient as createSSRServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy_key";
const SUPABASE_SVC = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "dummy_svc_key";

let _browserClient: any = null;

export function getBrowserClient() {
  if (typeof window === "undefined") {
    return createClient<Database>(SUPABASE_URL, SUPABASE_ANON);
  }
  if (!_browserClient) {
    _browserClient = createSSRBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON, {
      cookieOptions: {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    });
  }
  return _browserClient;
}

// Dynamic proxy to guarantee that client-side calls always use createSSRBrowserClient
export const supabase = new Proxy({} as any, {
  get(_target, prop) {
    const client = typeof window !== "undefined"
      ? getBrowserClient()
      : createClient<Database>(SUPABASE_URL, SUPABASE_ANON);
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

// ─── Server client (for Server Components & Route Handlers) ──
// Reads/writes auth cookies — authenticated as current user
// Usage: const supabase = createServerClient();

export function createServerClient() {
  if (typeof window !== "undefined") {
    return getBrowserClient();
  }
  try {
    const { cookies } = require("next/headers");
    const cookieStore = cookies();
    return createSSRServerClient<Database>(SUPABASE_URL, SUPABASE_ANON, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                path: "/",
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
              });
            });
          } catch {
            // Next.js Server Components throw if set is called during render; safe to ignore
          }
        },
      },
    });
  } catch {
    return createServiceClient();
  }
}

// ─── Service role client (for admin operations & cron jobs) ──
// Bypasses RLS — use only in trusted server-side code
// Usage: const supabase = createServiceClient();

export function createServiceClient() {
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    SUPABASE_SVC;

  return createClient<Database>(SUPABASE_URL, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ─── Type helpers ─────────────────────────────────────────────

export type SupabaseClient = ReturnType<typeof getBrowserClient>;

export type Profile = {
  id:                    string;
  email:                 string;
  full_name:             string | null;
  avatar_url:            string | null;
  subscription_tier:     "free" | "pro" | "expert";
  xp_total:              number;
  current_streak:        number;
  longest_streak:        number;
  last_activity_date:    string | null;
  primary_track:         string | null;
  onboarding_goal:       string | null;
  onboarding_level:      string | null;
  ai_questions_today:    number;
  ai_reset_date:         string | null;
  theme:                 "light" | "dark" | "sepia" | "high_contrast";
  font_size:             "small" | "medium" | "large" | "xl";
  language_pref:         string;
  email_streak_reminder: boolean;
  email_weekly_digest:   boolean;
  email_marketing:       boolean;
  notification_push:     boolean;
  created_at:            string;
  updated_at:            string;
};

export type Lesson = {
  id:               string;
  level_id:         string;
  title:            string;
  slug:             string;
  content_mdx:      string;
  duration_minutes: number;
  order_index:      number;
  is_published:     boolean;
  is_free:          boolean;
  language:         string;
  difficulty_score: number;
  meta_title:       string | null;
  meta_description: string | null;
  key_takeaways:    string[];
  created_at:       string;
  updated_at:       string;
};

export type UserProgress = {
  user_id:         string;
  lesson_id:       string;
  completed:       boolean;
  completed_at:    string | null;
  time_spent_secs: number;
  quiz_score:      number | null;
  last_accessed:   string | null;
};
