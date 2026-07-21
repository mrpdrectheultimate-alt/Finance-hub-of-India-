-- ============================================================
-- FinanceHub - Base Supabase Schema
-- Safe to run multiple times.
--
-- Run order:
-- 1. sql/supabase_schema_safe.sql
-- 2. supabase/seed_lessons_personal_finance_beginner.sql
-- 3. sql/phase1_critical_fixes.sql
-- 4. sql/phase2_production_hardening.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- Core learning tables
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'free' CHECK (role IN ('free', 'pro', 'expert')),
  goal TEXT,
  current_track_id UUID,
  current_level_id UUID,
  xp_total INT NOT NULL DEFAULT 0,
  streak_current INT NOT NULL DEFAULT 0,
  streak_longest INT NOT NULL DEFAULT 0,
  last_active_date DATE,
  onboarding_done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color_hex TEXT NOT NULL DEFAULT '#1D9E75',
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  order_index INT NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT TRUE,
  xp_reward INT NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(track_id, slug)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_current_track_fk'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_current_track_fk
      FOREIGN KEY (current_track_id) REFERENCES tracks(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_current_level_fk'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_current_level_fk
      FOREIGN KEY (current_level_id) REFERENCES levels(id) ON DELETE SET NULL;
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content_mdx TEXT,
  video_url TEXT,
  duration_minutes INT NOT NULL DEFAULT 5,
  order_index INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_free BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(level_id, slug)
);

CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  passing_score INT NOT NULL DEFAULT 70,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::JSONB,
  correct_index INT NOT NULL DEFAULT 0,
  explanation TEXT,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- User progress, XP, badges, subscriptions, AI
-- ============================================================
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  quiz_score INT,
  time_spent_secs INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_xp_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  xp_amount INT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  trigger_event TEXT
);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan TEXT NOT NULL CHECK (plan IN ('pro', 'expert')),
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  messages JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin allowlist for Supabase RLS.
-- After running this file, add your admin email in Supabase SQL Editor:
-- INSERT INTO admin_users (email) VALUES ('you@example.com') ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS admin_users (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_users
    WHERE lower(email) = lower(auth.jwt()->>'email')
  );
$$;

-- ============================================================
-- Auto profile creation on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Updated-at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON profiles;
CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS ai_conversations_set_updated_at ON ai_conversations;
CREATE TRIGGER ai_conversations_set_updated_at
BEFORE UPDATE ON ai_conversations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Prevent browser/client updates from changing protected account fields.
-- Client code may update profile preferences such as name, goal, onboarding,
-- current track/level, and last_active_date. XP, streaks, and role must only
-- be changed by service-role API routes or SECURITY DEFINER RPCs.
CREATE OR REPLACE FUNCTION protect_profile_server_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF auth.role() <> 'service_role' AND NOT is_admin() THEN
    NEW.role := OLD.role;
    NEW.xp_total := OLD.xp_total;
    NEW.streak_current := OLD.streak_current;
    NEW.streak_longest := OLD.streak_longest;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_server_fields ON profiles;
CREATE TRIGGER profiles_protect_server_fields
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION protect_profile_server_fields();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_xp_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_users_service_only" ON admin_users;
CREATE POLICY "admin_users_service_only" ON admin_users
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles
FOR SELECT USING (auth.uid() = id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
FOR UPDATE USING (auth.uid() = id OR auth.role() = 'service_role')
WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "profiles_service_insert" ON profiles;
CREATE POLICY "profiles_service_insert" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "profiles_admin_read" ON profiles;
CREATE POLICY "profiles_admin_read" ON profiles
FOR SELECT USING (is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;
CREATE POLICY "profiles_admin_update" ON profiles
FOR UPDATE USING (is_admin() OR auth.role() = 'service_role')
WITH CHECK (is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "tracks_read_active" ON tracks;
CREATE POLICY "tracks_read_active" ON tracks
FOR SELECT USING (is_active = TRUE OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "tracks_admin_write" ON tracks;
CREATE POLICY "tracks_admin_write" ON tracks
FOR ALL
USING (is_admin() OR auth.role() = 'service_role')
WITH CHECK (is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "levels_read" ON levels;
CREATE POLICY "levels_read" ON levels
FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "levels_admin_write" ON levels;
CREATE POLICY "levels_admin_write" ON levels
FOR ALL
USING (is_admin() OR auth.role() = 'service_role')
WITH CHECK (is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "lessons_read_published" ON lessons;
CREATE POLICY "lessons_read_published" ON lessons
FOR SELECT USING (is_published = TRUE OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "lessons_admin_write" ON lessons;
CREATE POLICY "lessons_admin_write" ON lessons
FOR ALL
USING (is_admin() OR auth.role() = 'service_role')
WITH CHECK (is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "quizzes_read" ON quizzes;
CREATE POLICY "quizzes_read" ON quizzes
FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "quizzes_admin_write" ON quizzes;
CREATE POLICY "quizzes_admin_write" ON quizzes
FOR ALL
USING (is_admin() OR auth.role() = 'service_role')
WITH CHECK (is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "quiz_questions_read" ON quiz_questions;
CREATE POLICY "quiz_questions_read" ON quiz_questions
FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "quiz_questions_admin_write" ON quiz_questions;
CREATE POLICY "quiz_questions_admin_write" ON quiz_questions
FOR ALL
USING (is_admin() OR auth.role() = 'service_role')
WITH CHECK (is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "user_progress_own" ON user_progress;
DROP POLICY IF EXISTS "user_progress_select_own" ON user_progress;
CREATE POLICY "user_progress_select_own" ON user_progress
FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "user_progress_service_write" ON user_progress;
CREATE POLICY "user_progress_service_write" ON user_progress
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "user_progress_admin_read" ON user_progress;
CREATE POLICY "user_progress_admin_read" ON user_progress
FOR SELECT USING (is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "user_xp_log_own" ON user_xp_log;
DROP POLICY IF EXISTS "user_xp_log_select_own" ON user_xp_log;
CREATE POLICY "user_xp_log_select_own" ON user_xp_log
FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "user_xp_log_service_write" ON user_xp_log;
CREATE POLICY "user_xp_log_service_write" ON user_xp_log
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "user_xp_log_admin_read" ON user_xp_log;
CREATE POLICY "user_xp_log_admin_read" ON user_xp_log
FOR SELECT USING (is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "badges_read" ON badges;
CREATE POLICY "badges_read" ON badges
FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "user_badges_own" ON user_badges;
DROP POLICY IF EXISTS "user_badges_select_own" ON user_badges;
CREATE POLICY "user_badges_select_own" ON user_badges
FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "user_badges_service_write" ON user_badges;
CREATE POLICY "user_badges_service_write" ON user_badges
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "user_badges_admin_read" ON user_badges;
CREATE POLICY "user_badges_admin_read" ON user_badges
FOR SELECT USING (is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "subscriptions_own" ON subscriptions;
CREATE POLICY "subscriptions_own" ON subscriptions
FOR ALL
USING (auth.uid() = user_id OR auth.role() = 'service_role')
WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "subscriptions_admin_read" ON subscriptions;
CREATE POLICY "subscriptions_admin_read" ON subscriptions
FOR SELECT USING (is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "ai_conversations_own" ON ai_conversations;
CREATE POLICY "ai_conversations_own" ON ai_conversations
FOR ALL
USING (auth.uid() = user_id OR auth.role() = 'service_role')
WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- Admin pages use the service role client through server routes where needed.
-- These permissive service-role policies keep public client access locked to
-- published/read-only data and each user's own rows.

-- ============================================================
-- Seed tracks, levels, badges
-- ============================================================
INSERT INTO tracks (slug, title, description, icon, color_hex, order_index, is_active)
VALUES
  ('personal-finance', 'Personal Finance', 'Budgeting, saving, investing, debt, and financial planning.', 'PF', '#1D9E75', 1, TRUE),
  ('stock-market', 'Stock Market', 'Understand stocks, mutual funds, ETFs, valuation, and risk.', 'SM', '#3B82F6', 2, TRUE),
  ('trading', 'Trading', 'Learn market structure, risk management, and trading psychology.', 'TR', '#F59E0B', 3, TRUE),
  ('crypto', 'Crypto', 'Blockchain, Bitcoin, DeFi, wallets, and crypto risk basics.', 'CR', '#8B5CF6', 4, TRUE),
  ('corporate-finance', 'Corporate Finance', 'Accounting, valuation, fundraising, and business finance.', 'CF', '#EF4444', 5, TRUE)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color_hex = EXCLUDED.color_hex,
  order_index = EXCLUDED.order_index,
  is_active = EXCLUDED.is_active;

INSERT INTO levels (track_id, title, slug, description, order_index, is_free, xp_reward)
SELECT t.id, v.title, v.slug, v.description, v.order_index, v.is_free, v.xp_reward
FROM tracks t
CROSS JOIN (
  VALUES
    ('Beginner', 'beginner', 'Start with the foundations.', 1, TRUE, 100),
    ('Intermediate', 'intermediate', 'Build practical confidence.', 2, FALSE, 150),
    ('Advanced', 'advanced', 'Go deeper with expert concepts.', 3, FALSE, 200)
) AS v(title, slug, description, order_index, is_free, xp_reward)
WHERE t.slug IN ('personal-finance', 'stock-market', 'trading', 'crypto', 'corporate-finance')
ON CONFLICT (track_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  is_free = EXCLUDED.is_free,
  xp_reward = EXCLUDED.xp_reward;

INSERT INTO badges (slug, title, description, icon, trigger_event)
VALUES
  ('first-step', 'First Step', 'Complete your first lesson.', 'first', 'lesson_complete'),
  ('level-up', 'Level Up', 'Complete a learning level or milestone.', 'level', 'lesson_complete'),
  ('track-master', 'Track Master', 'Complete a full track.', 'track', 'track_complete'),
  ('quiz-ace', 'Quiz Ace', 'Score 100% on a quiz.', 'quiz', 'quiz_perfect'),
  ('streak-3', '3-Day Streak', 'Learn for 3 days in a row.', 'streak3', 'streak_update'),
  ('streak-7', '7-Day Streak', 'Learn for 7 days in a row.', 'streak7', 'streak_update'),
  ('streak-30', '30-Day Streak', 'Learn for 30 days in a row.', 'streak30', 'streak_update'),
  ('ai-explorer', 'AI Explorer', 'Ask your first AI tutor question.', 'ai', 'ai_question'),
  ('crypto-curious', 'Crypto Curious', 'Complete a crypto lesson.', 'crypto', 'crypto_complete'),
  ('budget-master', 'Budget Master', 'Score 70 or higher in the budget simulator.', 'budget', 'budget_sim'),
  ('first-trade', 'First Trade', 'Place your first paper trade.', 'trade', 'paper_trade'),
  ('early-bird', 'Early Bird', 'Join during the early launch period.', 'early', 'signup')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  trigger_event = EXCLUDED.trigger_event;

-- ============================================================
-- Base indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tracks_order ON tracks(order_index);
CREATE INDEX IF NOT EXISTS idx_levels_track_order_base ON levels(track_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_level_order_base ON lessons(level_id, order_index);
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_order ON quiz_questions(quiz_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_lesson_base ON user_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_badge_base ON user_badges(user_id, badge_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_base ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_base ON ai_conversations(user_id, created_at DESC);

-- ============================================================
-- Done
-- ============================================================
