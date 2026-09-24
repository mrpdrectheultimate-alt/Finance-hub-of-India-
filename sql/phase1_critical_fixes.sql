-- ============================================================
-- FinanceHub - Phase 1 Critical Fixes
-- Atomic RPC functions for tamper-proof game loop
-- Run in Supabase SQL Editor after the base schema.
-- ============================================================

-- Required for ON CONFLICT (user_id, lesson_id) in quiz/progress RPCs.
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_progress_unique_user_lesson
ON user_progress(user_id, lesson_id);

-- ============================================================
-- Fix 1: Atomic lesson completion + XP + streak + badge check
-- Called from /api/complete-lesson instead of client JS.
-- ============================================================
DROP FUNCTION IF EXISTS complete_lesson(UUID, UUID, INT);
DROP FUNCTION IF EXISTS complete_lesson(UUID, UUID);
CREATE OR REPLACE FUNCTION complete_lesson(
  p_user_id UUID,
  p_lesson_id UUID,
  p_time_spent INT DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_xp_earned INT := 25;
  v_new_xp INT;
  v_streak INT;
  v_last_active DATE;
  v_badge_earned TEXT := NULL;
  v_lesson_count INT;
  v_level_id UUID;
  v_track_id UUID;
  v_level_complete BOOL := FALSE;
  v_track_complete BOOL := FALSE;
  v_total_in_level INT;
  v_done_in_level INT;
  v_total_in_track INT;
  v_done_in_track INT;
BEGIN
  IF EXISTS (
    SELECT 1 FROM user_progress
    WHERE user_id = p_user_id AND lesson_id = p_lesson_id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'already_completed',
      'xp_earned', 0
    );
  END IF;

  SELECT xp_total, streak_current, last_active_date
  INTO v_new_xp, v_streak, v_last_active
  FROM profiles
  WHERE id = p_user_id;

  IF v_last_active IS NULL OR v_last_active < CURRENT_DATE - INTERVAL '1 day' THEN
    v_streak := 1;
  ELSIF v_last_active = CURRENT_DATE - INTERVAL '1 day' THEN
    v_streak := v_streak + 1;
  END IF;

  INSERT INTO user_progress (user_id, lesson_id, completed_at, time_spent_secs)
  VALUES (p_user_id, p_lesson_id, NOW(), p_time_spent);

  INSERT INTO user_xp_log (user_id, xp_amount, reason)
  VALUES (p_user_id, v_xp_earned, 'lesson_complete');

  UPDATE profiles
  SET
    xp_total = xp_total + v_xp_earned,
    streak_current = v_streak,
    streak_longest = GREATEST(streak_longest, v_streak),
    last_active_date = CURRENT_DATE
  WHERE id = p_user_id
  RETURNING xp_total INTO v_new_xp;

  IF v_streak >= 30 THEN
    INSERT INTO user_badges (user_id, badge_id)
    SELECT p_user_id, id FROM badges WHERE slug = 'streak-30'
    ON CONFLICT DO NOTHING;
  ELSIF v_streak >= 7 THEN
    INSERT INTO user_badges (user_id, badge_id)
    SELECT p_user_id, id FROM badges WHERE slug = 'streak-7'
    ON CONFLICT DO NOTHING;
  ELSIF v_streak >= 3 THEN
    INSERT INTO user_badges (user_id, badge_id)
    SELECT p_user_id, id FROM badges WHERE slug = 'streak-3'
    ON CONFLICT DO NOTHING;
  END IF;

  SELECT COUNT(*) INTO v_lesson_count
  FROM user_progress
  WHERE user_id = p_user_id;

  IF v_lesson_count = 1 THEN
    INSERT INTO user_badges (user_id, badge_id)
    SELECT p_user_id, id FROM badges WHERE slug = 'first-step'
    ON CONFLICT DO NOTHING;
    v_badge_earned := 'First Step';
  END IF;

  SELECT level_id INTO v_level_id FROM lessons WHERE id = p_lesson_id;
  SELECT track_id INTO v_track_id FROM levels WHERE id = v_level_id;

  SELECT COUNT(*) INTO v_total_in_level
  FROM lessons
  WHERE level_id = v_level_id AND is_published = TRUE;

  SELECT COUNT(*) INTO v_done_in_level
  FROM user_progress up
  JOIN lessons l ON up.lesson_id = l.id
  WHERE up.user_id = p_user_id AND l.level_id = v_level_id;

  IF v_done_in_level >= v_total_in_level AND v_total_in_level > 0 THEN
    v_level_complete := TRUE;

    INSERT INTO user_xp_log (user_id, xp_amount, reason)
    VALUES (p_user_id, 100, 'level_complete');

    UPDATE profiles SET xp_total = xp_total + 100 WHERE id = p_user_id;

    INSERT INTO user_badges (user_id, badge_id)
    SELECT p_user_id, id FROM badges WHERE slug = 'level-up'
    ON CONFLICT DO NOTHING;

    SELECT COUNT(*) INTO v_total_in_track
    FROM lessons l
    JOIN levels lv ON l.level_id = lv.id
    WHERE lv.track_id = v_track_id AND l.is_published = TRUE;

    SELECT COUNT(*) INTO v_done_in_track
    FROM user_progress up
    JOIN lessons l ON up.lesson_id = l.id
    JOIN levels lv ON l.level_id = lv.id
    WHERE up.user_id = p_user_id AND lv.track_id = v_track_id;

    IF v_done_in_track >= v_total_in_track AND v_total_in_track > 0 THEN
      v_track_complete := TRUE;

      INSERT INTO user_xp_log (user_id, xp_amount, reason)
      VALUES (p_user_id, 500, 'track_complete');

      UPDATE profiles SET xp_total = xp_total + 500 WHERE id = p_user_id;

      INSERT INTO user_badges (user_id, badge_id)
      SELECT p_user_id, id FROM badges WHERE slug = 'track-master'
      ON CONFLICT DO NOTHING;

      IF v_badge_earned IS NULL THEN
        v_badge_earned := 'Track Master';
      END IF;
    END IF;
  END IF;

  SELECT xp_total INTO v_new_xp FROM profiles WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'xp_earned', v_xp_earned,
    'new_xp_total', v_new_xp,
    'new_streak', v_streak,
    'badge_earned', v_badge_earned,
    'level_complete', v_level_complete,
    'track_complete', v_track_complete
  );
END;
$$;

-- ============================================================
-- Fix 2: Atomic quiz completion + score save + XP + badges
-- ============================================================
DROP FUNCTION IF EXISTS complete_quiz(UUID, UUID, UUID, INT, BOOL);
CREATE OR REPLACE FUNCTION complete_quiz(
  p_user_id UUID,
  p_lesson_id UUID,
  p_quiz_id UUID,
  p_score INT,
  p_passed BOOL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_xp_earned INT;
  v_badge_earned TEXT := NULL;
BEGIN
  v_xp_earned := CASE
    WHEN p_score = 100 THEN 100
    WHEN p_passed THEN 50
    ELSE 10
  END;

  INSERT INTO user_progress (user_id, lesson_id, quiz_score, completed_at)
  VALUES (p_user_id, p_lesson_id, p_score, NOW())
  ON CONFLICT (user_id, lesson_id)
  DO UPDATE SET quiz_score = p_score;

  INSERT INTO user_xp_log (user_id, xp_amount, reason)
  VALUES (p_user_id, v_xp_earned, 'quiz_pass');

  UPDATE profiles
  SET xp_total = xp_total + v_xp_earned
  WHERE id = p_user_id;

  IF p_score = 100 THEN
    INSERT INTO user_badges (user_id, badge_id)
    SELECT p_user_id, id FROM badges WHERE slug = 'quiz-ace'
    ON CONFLICT DO NOTHING;
    v_badge_earned := 'Quiz Ace';
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'xp_earned', v_xp_earned,
    'badge_earned', v_badge_earned,
    'passed', p_passed
  );
END;
$$;

-- ============================================================
-- Fix 3: Atomic AI question tracking per user per day
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_usage_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INT DEFAULT 0,
  UNIQUE(user_id, date)
);

ALTER TABLE ai_usage_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_usage_own" ON ai_usage_daily;
CREATE POLICY "ai_usage_own"
ON ai_usage_daily
FOR ALL
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_usage_admin_read" ON ai_usage_daily;
CREATE POLICY "ai_usage_admin_read"
ON ai_usage_daily
FOR SELECT
USING (is_admin() OR auth.role() = 'service_role');

DROP FUNCTION IF EXISTS increment_ai_usage(UUID);
CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT;
BEGIN
  INSERT INTO ai_usage_daily (user_id, date, count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET count = ai_usage_daily.count + 1
  RETURNING count INTO v_count;

  IF v_count = 1 THEN
    INSERT INTO user_badges (user_id, badge_id)
    SELECT p_user_id, id FROM badges WHERE slug = 'ai-explorer'
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN v_count;
END;
$$;

-- ============================================================
-- Fix 4: Get AI usage count for today
-- ============================================================
DROP FUNCTION IF EXISTS get_ai_usage_today(UUID);
CREATE OR REPLACE FUNCTION get_ai_usage_today(p_user_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT := 0;
BEGIN
  SELECT count INTO v_count
  FROM ai_usage_daily
  WHERE user_id = p_user_id AND date = CURRENT_DATE;

  RETURN COALESCE(v_count, 0);
END;
$$;

-- ============================================================
-- Fix 5: Get next lesson in level for unlock logic
-- ============================================================
DROP FUNCTION IF EXISTS get_next_lesson(UUID, UUID);
CREATE OR REPLACE FUNCTION get_next_lesson(
  p_user_id UUID,
  p_level_id UUID
)
RETURNS TABLE (
  lesson_id UUID,
  title TEXT,
  order_index INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT l.id, l.title, l.order_index
  FROM lessons l
  WHERE l.level_id = p_level_id
    AND l.is_published = TRUE
    AND NOT EXISTS (
      SELECT 1 FROM user_progress up
      WHERE up.user_id = p_user_id AND up.lesson_id = l.id
    )
  ORDER BY l.order_index
  LIMIT 1;
END;
$$;

-- ============================================================
-- Fix 6: Check if level is complete and expose next level
-- ============================================================
DROP FUNCTION IF EXISTS check_level_completion(UUID, UUID);
CREATE OR REPLACE FUNCTION check_level_completion(
  p_user_id UUID,
  p_level_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total INT;
  v_completed INT;
  v_next_level RECORD;
  v_track_id UUID;
BEGIN
  SELECT COUNT(*) INTO v_total
  FROM lessons
  WHERE level_id = p_level_id AND is_published = TRUE;

  SELECT COUNT(*) INTO v_completed
  FROM user_progress up
  JOIN lessons l ON up.lesson_id = l.id
  WHERE up.user_id = p_user_id AND l.level_id = p_level_id;

  SELECT track_id INTO v_track_id FROM levels WHERE id = p_level_id;

  SELECT * INTO v_next_level
  FROM levels
  WHERE track_id = v_track_id
    AND order_index > (SELECT order_index FROM levels WHERE id = p_level_id)
  ORDER BY order_index
  LIMIT 1;

  RETURN jsonb_build_object(
    'total_lessons', v_total,
    'completed_lessons', v_completed,
    'is_complete', v_completed >= v_total AND v_total > 0,
    'next_level_id', v_next_level.id,
    'next_level_title', v_next_level.title,
    'next_level_slug', v_next_level.slug
  );
END;
$$;

-- ============================================================
-- Fix 7: Streak health check called on dashboard load
-- ============================================================
DROP FUNCTION IF EXISTS check_and_update_streak(UUID);
CREATE OR REPLACE FUNCTION check_and_update_streak(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_active DATE;
  v_streak INT;
BEGIN
  SELECT last_active_date, streak_current
  INTO v_last_active, v_streak
  FROM profiles
  WHERE id = p_user_id;

  IF v_last_active IS NOT NULL AND v_last_active < CURRENT_DATE - INTERVAL '1 day' THEN
    UPDATE profiles SET streak_current = 0 WHERE id = p_user_id;
    v_streak := 0;
  END IF;

  RETURN jsonb_build_object(
    'streak', v_streak,
    'last_active', v_last_active,
    'at_risk', v_last_active = CURRENT_DATE - INTERVAL '1 day'
  );
END;
$$;

-- ============================================================
-- Fix 8: Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_lesson ON user_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_lessons_level_id ON lessons(level_id);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON lessons(is_published, level_id);
CREATE INDEX IF NOT EXISTS idx_levels_track_id ON levels(track_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active_date);
CREATE INDEX IF NOT EXISTS idx_user_xp_log_user_id ON user_xp_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON ai_usage_daily(user_id, date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
