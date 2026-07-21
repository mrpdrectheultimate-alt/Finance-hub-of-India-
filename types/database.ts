export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          role: "free" | "pro" | "expert";
          goal: string | null;
          current_track_id: string | null;
          current_level_id: string | null;
          xp_total: number;
          streak_current: number;
          streak_longest: number;
          last_active_date: string | null;
          onboarding_done: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      tracks: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          icon: string | null;
          color_hex: string;
          order_index: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tracks"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["tracks"]["Insert"]>;
        Relationships: [];
      };
      levels: {
        Row: {
          id: string;
          track_id: string;
          title: string;
          slug: string;
          description: string | null;
          order_index: number;
          is_free: boolean;
          xp_reward: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["levels"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["levels"]["Insert"]>;
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          level_id: string;
          title: string;
          slug: string;
          content_mdx: string | null;
          video_url: string | null;
          duration_minutes: number;
          order_index: number;
          is_published: boolean;
          is_free: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["lessons"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["lessons"]["Insert"]>;
        Relationships: [];
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed_at: string;
          quiz_score: number | null;
          time_spent_secs: number;
        };
        Insert: Omit<Database["public"]["Tables"]["user_progress"]["Row"], "id" | "completed_at">;
        Update: Partial<Database["public"]["Tables"]["user_progress"]["Insert"]>;
        Relationships: [];
      };
      user_xp_log: {
        Row: {
          id: string;
          user_id: string;
          xp_amount: number;
          reason: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_xp_log"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["user_xp_log"]["Insert"]>;
        Relationships: [];
      };
      badges: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          icon: string | null;
          trigger_event: string | null;
        };
        Insert: Database["public"]["Tables"]["badges"]["Row"];
        Update: Partial<Database["public"]["Tables"]["badges"]["Insert"]>;
        Relationships: [];
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_badges"]["Row"], "id" | "earned_at">;
        Update: Partial<Database["public"]["Tables"]["user_badges"]["Insert"]>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string | null;
          stripe_customer_id: string | null;
          plan: "pro" | "expert";
          status: string;
          current_period_end: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["subscriptions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
        Relationships: [];
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string | null;
          messages: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ai_conversations"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["ai_conversations"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Track = Database["public"]["Tables"]["tracks"]["Row"];
export type Level = Database["public"]["Tables"]["levels"]["Row"];
export type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
export type Badge = Database["public"]["Tables"]["badges"]["Row"];
export type UserBadge = Database["public"]["Tables"]["user_badges"]["Row"];
export type UserProgress = Database["public"]["Tables"]["user_progress"]["Row"];
