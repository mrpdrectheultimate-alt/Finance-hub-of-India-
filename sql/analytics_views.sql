-- ============================================================
-- FinanceHub Phase 9: Analytics, Scale and Launch
-- Run AFTER sql/phase8/community_career.sql
-- ============================================================

-- ============================================================
-- VIEW 1: Daily active users (DAU)
-- ============================================================
CREATE OR REPLACE VIEW v_dau AS
SELECT
  last_active_date AS date,
  COUNT(*) AS dau,
  COUNT(*) FILTER (WHERE role = 'free') AS free_users,
  COUNT(*) FILTER (WHERE role = 'pro') AS pro_users,
  COUNT(*) FILTER (WHERE role = 'expert') AS expert_users
FROM profiles
WHERE last_active_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY last_active_date
ORDER BY last_active_date DESC;

-- ============================================================
-- VIEW 2: Lesson performance
-- ============================================================
CREATE OR REPLACE VIEW v_lesson_performance AS
SELECT
  l.id,
  l.title,
  l.is_free,
  l.duration_minutes,
  t.title AS track_title,
  lv.title AS level_title,
  COUNT(DISTINCT up.id) AS total_completions,
  ROUND(AVG(up.quiz_score) FILTER (WHERE up.quiz_score IS NOT NULL), 1) AS avg_quiz_score,
  ROUND(AVG(up.time_spent_secs) / 60.0, 1) AS avg_time_mins,
  COUNT(DISTINCT lc.id) AS comment_count
FROM lessons l
JOIN levels lv ON l.level_id = lv.id
JOIN tracks t ON lv.track_id = t.id
LEFT JOIN user_progress up ON up.lesson_id = l.id
LEFT JOIN lesson_comments lc ON lc.lesson_id = l.id AND lc.is_deleted = FALSE
WHERE l.is_published = TRUE
GROUP BY l.id, l.title, l.is_free, l.duration_minutes, t.title, lv.title
ORDER BY total_completions DESC;

-- ============================================================
-- VIEW 3: Revenue summary
-- ============================================================
CREATE OR REPLACE VIEW v_revenue_summary AS
SELECT
  COUNT(*) FILTER (WHERE role = 'pro') AS pro_count,
  COUNT(*) FILTER (WHERE role = 'expert') AS expert_count,
  COUNT(*) FILTER (WHERE role != 'free') AS paying_users,
  COUNT(*) AS total_users,
  ROUND(COUNT(*) FILTER (WHERE role != 'free')::DECIMAL / NULLIF(COUNT(*), 0) * 100, 1) AS conversion_rate_pct,
  (COUNT(*) FILTER (WHERE role = 'pro') * 499) +
    (COUNT(*) FILTER (WHERE role = 'expert') * 999) AS estimated_mrr_inr,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS new_users_30d,
  COUNT(*) FILTER (WHERE role != 'free' AND created_at >= NOW() - INTERVAL '30 days') AS new_paying_30d
FROM profiles;

-- ============================================================
-- VIEW 4: User cohort retention (D7, D30)
-- ============================================================
CREATE OR REPLACE VIEW v_cohort_retention AS
WITH cohorts AS (
  SELECT
    DATE_TRUNC('week', created_at)::DATE AS cohort_week,
    id AS user_id
  FROM profiles
  WHERE created_at >= NOW() - INTERVAL '12 weeks'
),
activity AS (
  SELECT DISTINCT
    user_id,
    DATE_TRUNC('week', completed_at)::DATE AS active_week
  FROM user_progress
  WHERE completed_at >= NOW() - INTERVAL '12 weeks'
)
SELECT
  c.cohort_week,
  COUNT(DISTINCT c.user_id) AS cohort_size,
  COUNT(DISTINCT a1.user_id) FILTER (WHERE a1.active_week = c.cohort_week + 7) AS retained_d7,
  COUNT(DISTINCT a2.user_id) FILTER (WHERE a2.active_week = c.cohort_week + 28) AS retained_d30,
  ROUND(
    COUNT(DISTINCT a1.user_id) FILTER (WHERE a1.active_week = c.cohort_week + 7)::DECIMAL /
      NULLIF(COUNT(DISTINCT c.user_id), 0) * 100,
    1
  ) AS d7_retention_pct,
  ROUND(
    COUNT(DISTINCT a2.user_id) FILTER (WHERE a2.active_week = c.cohort_week + 28)::DECIMAL /
      NULLIF(COUNT(DISTINCT c.user_id), 0) * 100,
    1
  ) AS d30_retention_pct
FROM cohorts c
LEFT JOIN activity a1 ON a1.user_id = c.user_id
LEFT JOIN activity a2 ON a2.user_id = c.user_id
GROUP BY c.cohort_week
ORDER BY c.cohort_week DESC;

-- ============================================================
-- VIEW 5: XP leaderboard for dashboard
-- ============================================================
CREATE OR REPLACE VIEW v_leaderboard_global AS
SELECT
  ROW_NUMBER() OVER (ORDER BY xp_total DESC)::INT AS rank,
  id,
  full_name,
  xp_total,
  streak_current,
  role,
  (SELECT COUNT(*) FROM user_badges ub WHERE ub.user_id = profiles.id)::INT AS badge_count
FROM profiles
WHERE xp_total > 0
ORDER BY xp_total DESC
LIMIT 100;

-- ============================================================
-- FUNCTION: Get full admin analytics in one call
-- ============================================================
CREATE OR REPLACE FUNCTION get_admin_analytics(p_days INT DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_since TIMESTAMPTZ := NOW() - (p_days || ' days')::INTERVAL;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'new_users', (SELECT COUNT(*) FROM profiles WHERE created_at >= v_since),
    'dau_today', (SELECT COUNT(*) FROM profiles WHERE last_active_date = CURRENT_DATE),
    'dau_7d_avg', (SELECT ROUND(AVG(cnt)) FROM (
      SELECT COUNT(*) cnt
      FROM profiles
      WHERE last_active_date >= CURRENT_DATE - 7
      GROUP BY last_active_date
    ) sub),
    'pro_users', (SELECT COUNT(*) FROM profiles WHERE role = 'pro'),
    'expert_users', (SELECT COUNT(*) FROM profiles WHERE role = 'expert'),
    'conversion_rate', (SELECT ROUND(COUNT(*) FILTER (WHERE role != 'free')::DECIMAL / NULLIF(COUNT(*), 0) * 100, 1) FROM profiles),
    'mrr_estimate', (SELECT (COUNT(*) FILTER (WHERE role = 'pro') * 499) + (COUNT(*) FILTER (WHERE role = 'expert') * 999) FROM profiles),
    'total_completions', (SELECT COUNT(*) FROM user_progress WHERE completed_at >= v_since),
    'avg_lessons_per_user', (SELECT ROUND(AVG(cnt), 1) FROM (
      SELECT COUNT(*) cnt
      FROM user_progress
      WHERE completed_at >= v_since
      GROUP BY user_id
    ) sub),
    'quiz_attempts', (SELECT COUNT(*) FROM user_progress WHERE quiz_score IS NOT NULL AND completed_at >= v_since),
    'avg_quiz_score', (SELECT ROUND(AVG(quiz_score), 1) FROM user_progress WHERE quiz_score IS NOT NULL AND completed_at >= v_since),
    'ai_questions', (SELECT COALESCE(SUM(count), 0) FROM ai_usage_daily WHERE date >= CURRENT_DATE - p_days),
    'total_comments', (SELECT COUNT(*) FROM lesson_comments WHERE created_at >= v_since AND is_deleted = FALSE),
    'published_lessons', (SELECT COUNT(*) FROM lessons WHERE is_published = TRUE),
    'total_quizzes', (SELECT COUNT(*) FROM quizzes),
    'total_tracks', (SELECT COUNT(*) FROM tracks WHERE is_active = TRUE),
    'top_lessons', (SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::JSONB) FROM (
      SELECT title, total_completions, avg_quiz_score
      FROM v_lesson_performance
      LIMIT 5
    ) t),
    'users_with_streak', (SELECT COUNT(*) FROM profiles WHERE streak_current > 0),
    'avg_streak', (SELECT ROUND(AVG(streak_current), 1) FROM profiles WHERE streak_current > 0),
    'max_streak', (SELECT MAX(streak_longest) FROM profiles)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ============================================================
-- INDEX additions for analytics performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_user_progress_completed_at ON user_progress(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role_xp ON profiles(role, xp_total DESC);
CREATE INDEX IF NOT EXISTS idx_lesson_comments_lesson ON lesson_comments(lesson_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_date ON ai_usage_daily(date DESC);
