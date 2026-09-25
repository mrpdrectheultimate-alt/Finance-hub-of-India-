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
          language?: string;
          created_at: string;
          updated_at?: string;
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
          id?: string;
          user_id: string;
          xp_earned?: number;
          xp_amount?: number;
          reason?: string;
          activity_type?: string;
          description?: string;
          created_at?: string;
        };
        Insert: Database["public"]["Tables"]["user_xp_log"]["Row"];
        Update: Partial<Database["public"]["Tables"]["user_xp_log"]["Insert"]>;
        Relationships: [];
      };
      lesson_questions: {
        Row: {
          id: string;
          lesson_id: string;
          user_id: string;
          question: string;
          is_answered: boolean;
          is_pinned: boolean;
          is_flagged: boolean;
          upvote_count: number;
          answer_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          user_id: string;
          question: string;
          is_answered?: boolean;
          is_pinned?: boolean;
          is_flagged?: boolean;
          upvote_count?: number;
          answer_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["lesson_questions"]["Insert"]>;
        Relationships: [];
      };
      question_answers: {
        Row: {
          id: string;
          question_id: string;
          user_id: string;
          answer: string;
          is_accepted: boolean;
          is_staff: boolean;
          is_ai: boolean;
          is_flagged: boolean;
          upvote_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          user_id: string;
          answer: string;
          is_accepted?: boolean;
          is_staff?: boolean;
          is_ai?: boolean;
          is_flagged?: boolean;
          upvote_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["question_answers"]["Insert"]>;
        Relationships: [];
      };
      community_upvotes: {
        Row: {
          user_id: string;
          target_type: string;
          target_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          target_type: string;
          target_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["community_upvotes"]["Insert"]>;
        Relationships: [];
      };
      community_flags: {
        Row: {
          id: string;
          user_id: string;
          target_type: string;
          target_id: string;
          reason: string;
          description?: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_type: string;
          target_id: string;
          reason: string;
          description?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["community_flags"]["Insert"]>;
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
      quizzes: {
        Row: {
          id: string;
          lesson_id: string;
          title: string;
          passing_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          title: string;
          passing_score?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quizzes"]["Insert"]>;
        Relationships: [];
      };
      quiz_questions: {
        Row: {
          id: string;
          quiz_id: string;
          question_text: string;
          options: Json;
          correct_index: number;
          explanation: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          question_text: string;
          options: Json;
          correct_index: number;
          explanation?: string;
          order_index?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quiz_questions"]["Insert"]>;
        Relationships: [];
      };
      case_studies: {
        Row: {
          id: string;
          title: string;
          slug: string;
          subtitle: string | null;
          category: string;
          difficulty: string;
          content_mdx: string;
          protagonist: string | null;
          key_lesson: string | null;
          tags: string[];
          related_lessons: string[];
          duration_minutes: number;
          is_published: boolean;
          is_free: boolean;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["case_studies"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["case_studies"]["Row"]>;
        Relationships: [];
      };
      user_case_study_completions: {
        Row: {
          user_id: string;
          case_study_id: string;
          completed_at: string;
          decisions: Json;
          xp_earned: number;
        };
        Insert: Partial<Database["public"]["Tables"]["user_case_study_completions"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["user_case_study_completions"]["Row"]>;
        Relationships: [];
      };
      glossary: {
        Row: {
          id: string;
          term: string;
          slug: string;
          simple_def: string;
          technical_def: string;
          example: string;
          category: string;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["glossary"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["glossary"]["Row"]>;
        Relationships: [];
      };
      concepts: {
        Row: {
          id: string;
          name: string;
          slug: string;
          simple_def: string;
          technical_def: string;
          category: string;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["concepts"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["concepts"]["Row"]>;
        Relationships: [];
      };
      sources: {
        Row: {
          id: string;
          title: string;
          author: string;
          publisher: string;
          url: string;
          is_verified: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["sources"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["sources"]["Row"]>;
        Relationships: [];
      };
      user_concept_mastery: {
        Row: {
          user_id: string;
          concept_id: string;
          mastery_score: number;
          quiz_score: number | null;
          exposure_count: number;
          next_review: string | null;
          repetitions: number;
          last_reviewed: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["user_concept_mastery"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["user_concept_mastery"]["Row"]>;
        Relationships: [];
      };
      [key: string]: any;
    };
    Views: Record<string, any>;
    Functions: Record<string, any>;
    Enums: Record<string, any>;
    CompositeTypes: Record<string, any>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Track = Database["public"]["Tables"]["tracks"]["Row"];
export type Level = Database["public"]["Tables"]["levels"]["Row"];
export type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
export type Badge = Database["public"]["Tables"]["badges"]["Row"];
export type UserBadge = Database["public"]["Tables"]["user_badges"]["Row"];
export type UserProgress = Database["public"]["Tables"]["user_progress"]["Row"];
export type LessonQuestion = Database["public"]["Tables"]["lesson_questions"]["Row"];
export type QuestionAnswer = Database["public"]["Tables"]["question_answers"]["Row"];
