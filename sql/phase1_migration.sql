-- ============================================================
-- FinanceHub — Phase 1 Complete SQL Migration
-- Safe & Resilient: Aligned with Supabase schema (tracks.title, levels.title, profiles.role)
-- Safe to copy & run directly in Supabase SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. AI Rate Limiting & Onboarding columns on profiles
-- ─────────────────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ai_questions_today INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_reset_date      TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_goal       TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_level      TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_time       TEXT,
  ADD COLUMN IF NOT EXISTS primary_track         TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed  BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id   TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_order_id     TEXT,
  ADD COLUMN IF NOT EXISTS subscription_tier     TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status   TEXT,
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- ─────────────────────────────────────────────────────────────
-- 2. AI usage increment function (atomic, prevents race conditions)
-- ─────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS increment_ai_usage(UUID);
CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  today_ist TEXT;
BEGIN
  today_ist := TO_CHAR(NOW() AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD');
  UPDATE profiles SET
    ai_questions_today = CASE
      WHEN ai_reset_date = today_ist THEN COALESCE(ai_questions_today, 0) + 1
      ELSE 1
    END,
    ai_reset_date = today_ist
  WHERE id = p_user_id;
END; $$;

-- ─────────────────────────────────────────────────────────────
-- 3. Payment logs table (tracks all payment attempts)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  provider    TEXT NOT NULL CHECK (provider IN ('stripe','razorpay')),
  payment_id  TEXT,
  order_id    TEXT,
  amount      INT,
  currency    TEXT DEFAULT 'INR',
  plan        TEXT,
  tier        TEXT,
  status      TEXT,
  error_desc  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'payment_logs_own_read') THEN
    CREATE POLICY "payment_logs_own_read"
      ON payment_logs FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'payment_logs_service_all') THEN
    CREATE POLICY "payment_logs_service_all"
      ON payment_logs FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 4. Bookmarks table
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('lesson','video','book','simulator')),
  content_id   TEXT NOT NULL,
  content_title TEXT,
  content_url  TEXT,
  track_slug   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, content_type, content_id)
);

ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'bookmarks_own_all') THEN
    CREATE POLICY "bookmarks_own_all"
      ON user_bookmarks FOR ALL
      USING  (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bookmarks_user
  ON user_bookmarks (user_id, created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- 5. Search analytics table (track what users search for)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS search_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  query         TEXT NOT NULL,
  results_count INT DEFAULT 0,
  clicked_type  TEXT,
  clicked_title TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'search_logs_service') THEN
    CREATE POLICY "search_logs_service"
      ON search_logs FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 6. Onboarding analytics
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarding_responses (
  user_id       UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  goal          TEXT,
  level         TEXT,
  daily_time    TEXT,
  primary_track TEXT,
  completed_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'onboarding_own') THEN
    CREATE POLICY "onboarding_own"
      ON onboarding_responses FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 7. Lesson metadata columns (for SEO and content quality)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS meta_title       TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS key_takeaways    JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS common_mistakes  JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS last_reviewed    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by      TEXT,
  ADD COLUMN IF NOT EXISTS next_review      DATE,
  ADD COLUMN IF NOT EXISTS difficulty_score INT DEFAULT 5 CHECK (difficulty_score BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS has_visual       BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_calculator   BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_case_study   BOOLEAN DEFAULT FALSE;

-- Ensure tables referenced in admin_dashboard_metrics view exist
CREATE TABLE IF NOT EXISTS curated_playlists (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_published  BOOLEAN DEFAULT TRUE,
  play_count    INT DEFAULT 0,
  last_verified DATE,
  is_broken     BOOLEAN DEFAULT FALSE,
  broken_since  DATE
);

CREATE TABLE IF NOT EXISTS user_notes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title      TEXT DEFAULT 'Untitled note',
  content    TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 8. Video embed health tracking
-- ─────────────────────────────────────────────────────────────
ALTER TABLE curated_playlists
  ADD COLUMN IF NOT EXISTS last_verified  DATE,
  ADD COLUMN IF NOT EXISTS is_broken      BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS broken_since   DATE,
  ADD COLUMN IF NOT EXISTS play_count     INT DEFAULT 0;

-- Function to increment play count
DROP FUNCTION IF EXISTS increment_video_play(UUID);
CREATE OR REPLACE FUNCTION increment_video_play(p_video_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE curated_playlists SET play_count = COALESCE(play_count,0) + 1
  WHERE id = p_video_id;
END; $$;

-- ─────────────────────────────────────────────────────────────
-- 9. Admin analytics view (Resilient schema mapping)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW admin_dashboard_metrics AS
SELECT
  -- Content
  (SELECT COUNT(*) FROM lessons WHERE is_published=TRUE)        AS published_lessons,
  (SELECT COUNT(*) FROM quizzes)                                 AS total_quizzes,
  (SELECT COUNT(*) FROM quiz_questions)                          AS total_questions,
  (SELECT CASE WHEN to_regclass('public.curated_playlists') IS NULL THEN 0 ELSE (SELECT COUNT(*) FROM curated_playlists WHERE is_published=TRUE) END) AS published_videos,

  -- Users
  (SELECT COUNT(*) FROM profiles)                                AS total_users,
  (SELECT COUNT(*) FROM profiles WHERE COALESCE(role, subscription_tier) = 'pro')   AS pro_users,
  (SELECT COUNT(*) FROM profiles WHERE COALESCE(role, subscription_tier) = 'expert') AS expert_users,
  (SELECT COUNT(*) FROM profiles WHERE created_at > NOW()-INTERVAL '7 days') AS new_users_7d,
  (SELECT COUNT(*) FROM profiles WHERE created_at > NOW()-INTERVAL '30 days') AS new_users_30d,

  -- Engagement
  (SELECT COUNT(*) FROM user_progress)                           AS total_completions,
  (SELECT COUNT(DISTINCT user_id) FROM user_progress)            AS users_with_completions,
  (SELECT COUNT(CASE WHEN quiz_score IS NOT NULL THEN 1 END) FROM user_progress) AS quiz_attempts,
  (SELECT ROUND(AVG(quiz_score),1) FROM user_progress WHERE quiz_score IS NOT NULL) AS avg_quiz_score,
  (SELECT CASE WHEN to_regclass('public.user_notes') IS NULL THEN 0 ELSE (SELECT COUNT(*) FROM user_notes) END) AS total_notes,
  (SELECT CASE WHEN to_regclass('public.user_notes') IS NULL THEN 0 ELSE (SELECT COUNT(DISTINCT user_id) FROM user_notes) END) AS users_with_notes,

  -- Revenue proxy
  (SELECT COUNT(*) FROM payment_logs WHERE status='captured')    AS successful_payments,
  (SELECT COALESCE(SUM(amount)/100.0,0) FROM payment_logs WHERE status='captured') AS total_revenue_inr,

  -- AI usage
  (SELECT COALESCE(SUM(ai_questions_today),0) FROM profiles)    AS ai_questions_today,

  NOW() AS generated_at;

-- ─────────────────────────────────────────────────────────────
-- 10. Top content analytics view
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW top_lessons_analytics AS
SELECT
  l.title,
  l.slug,
  t.title AS track,
  COUNT(up.id) AS completions,
  COUNT(DISTINCT up.user_id) AS unique_learners,
  ROUND(AVG(up.quiz_score),1) AS avg_quiz_score,
  l.duration_minutes,
  l.is_free
FROM lessons l
LEFT JOIN levels lv ON l.level_id = lv.id
LEFT JOIN tracks t  ON lv.track_id = t.id
LEFT JOIN user_progress up ON up.lesson_id = l.id
WHERE l.is_published = TRUE
GROUP BY l.id, l.title, l.slug, t.title, l.duration_minutes, l.is_free
ORDER BY completions DESC;

-- ─────────────────────────────────────────────────────────────
-- 11. User journey funnel view
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW user_journey_funnel AS
SELECT
  COUNT(*)                                                           AS signed_up,
  COUNT(CASE WHEN onboarding_completed=TRUE THEN 1 END)             AS completed_onboarding,
  COUNT(CASE WHEN EXISTS(
    SELECT 1 FROM user_progress up WHERE up.user_id=p.id
  ) THEN 1 END)                                                      AS completed_first_lesson,
  COUNT(CASE WHEN (
    SELECT COUNT(*) FROM user_progress up WHERE up.user_id=p.id
  ) >= 5 THEN 1 END)                                                 AS completed_5_lessons,
  COUNT(CASE WHEN EXISTS(
    SELECT 1 FROM user_progress up WHERE up.user_id=p.id AND up.quiz_score >= 70
  ) THEN 1 END)                                                      AS passed_first_quiz,
  COUNT(CASE WHEN COALESCE(role, subscription_tier) IN ('pro','expert') THEN 1 END) AS converted_to_paid
FROM profiles p;

-- ─────────────────────────────────────────────────────────────
-- 12. Verify all migrations ran successfully
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_cols INT;
BEGIN
  -- Check new columns exist
  SELECT COUNT(*) INTO v_cols
  FROM information_schema.columns
  WHERE table_name='profiles'
    AND column_name IN ('ai_questions_today','ai_reset_date',
      'onboarding_goal','onboarding_completed','razorpay_payment_id');

  IF v_cols < 5 THEN
    RAISE EXCEPTION 'Missing profile columns — check migration';
  END IF;

  RAISE NOTICE '✅ Phase 1 migration complete!';
  RAISE NOTICE '   - AI rate limiting columns: ready';
  RAISE NOTICE '   - Onboarding columns: ready';
  RAISE NOTICE '   - Payment logs table: ready';
  RAISE NOTICE '   - Bookmarks table: ready';
  RAISE NOTICE '   - Search logs table: ready';
  RAISE NOTICE '   - Analytics views: ready';
  RAISE NOTICE '   - Lesson metadata columns: ready';
END $$;
