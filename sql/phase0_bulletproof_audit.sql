-- ============================================================
-- FinanceHub — Phase 0: 100% Parse-Safe Master Reality Audit
-- Guaranteed 0 Parse Errors: Uses Dynamic SQL (EXECUTE) for optional tables
-- Safe to run directly in Supabase SQL Editor on ANY instance
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- AUDIT 1: LESSON COUNT BY TRACK
-- ─────────────────────────────────────────────────────────────
SELECT
  t.title                                         AS track,
  t.slug                                          AS track_slug,
  COUNT(l.id)                                     AS total_lessons,
  COUNT(CASE WHEN l.is_free    = TRUE THEN 1 END) AS free_lessons,
  COUNT(CASE WHEN l.is_free    = FALSE THEN 1 END) AS paid_lessons,
  COUNT(CASE WHEN l.is_published = TRUE THEN 1 END) AS published,
  COUNT(CASE WHEN l.is_published = FALSE THEN 1 END) AS draft
FROM tracks t
LEFT JOIN levels lv  ON lv.track_id = t.id
LEFT JOIN lessons l  ON l.level_id  = lv.id
GROUP BY t.id, t.title, t.slug, t.order_index
ORDER BY t.order_index;

-- ─────────────────────────────────────────────────────────────
-- AUDIT 2: TOTAL LESSON COUNT
-- ─────────────────────────────────────────────────────────────
SELECT
  COUNT(*)                                              AS total_lessons,
  COUNT(CASE WHEN is_published = TRUE  THEN 1 END)      AS published,
  COUNT(CASE WHEN is_published = FALSE THEN 1 END)      AS draft,
  COUNT(CASE WHEN is_free = TRUE       THEN 1 END)      AS free,
  COUNT(CASE WHEN is_free = FALSE      THEN 1 END)      AS premium
FROM lessons;

-- ─────────────────────────────────────────────────────────────
-- AUDIT 3: QUIZ COVERAGE
-- ─────────────────────────────────────────────────────────────
SELECT
  COUNT(DISTINCT q.id)  AS total_quizzes,
  COUNT(DISTINCT qq.id) AS total_questions,
  COUNT(DISTINCT q.lesson_id) AS lessons_with_quizzes,
  (SELECT COUNT(*) FROM lessons WHERE is_published=TRUE) -
  COUNT(DISTINCT q.lesson_id) AS lessons_without_quizzes
FROM quizzes q
LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id;

-- ─────────────────────────────────────────────────────────────
-- AUDIT 4: LESSONS WITHOUT QUIZZES
-- ─────────────────────────────────────────────────────────────
SELECT
  t.title  AS track,
  l.title  AS lesson,
  l.slug,
  l.order_index
FROM lessons l
JOIN levels lv ON l.level_id = lv.id
JOIN tracks t  ON lv.track_id = t.id
LEFT JOIN quizzes q ON q.lesson_id = l.id
WHERE l.is_published = TRUE
  AND q.id IS NULL
ORDER BY t.title, l.order_index;

-- ─────────────────────────────────────────────────────────────
-- AUDIT 5 & 6: VIDEO LIBRARY AUDIT (Dynamic EXECUTE - Parse Safe)
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS temp_video_audit;
CREATE TEMP TABLE temp_video_audit (
  status TEXT,
  total_videos BIGINT,
  published BIGINT,
  individual_videos BIGINT,
  playlists BIGINT,
  categories BIGINT
);

DO $$
BEGIN
  IF to_regclass('public.curated_playlists') IS NOT NULL THEN
    EXECUTE 'INSERT INTO temp_video_audit SELECT ''Table Installed'', COUNT(*), COUNT(CASE WHEN is_published = TRUE THEN 1 END), COUNT(CASE WHEN video_type = ''video'' THEN 1 END), COUNT(CASE WHEN video_type = ''playlist'' THEN 1 END), COUNT(DISTINCT category) FROM curated_playlists';
  ELSE
    INSERT INTO temp_video_audit VALUES ('Table Pending (Run complete_video_library.sql)', 0, 0, 0, 0, 0);
  END IF;
END $$;

SELECT * FROM temp_video_audit;

-- ─────────────────────────────────────────────────────────────
-- AUDIT 7: USER STATS
-- ─────────────────────────────────────────────────────────────
SELECT
  COUNT(*)                                               AS total_profiles,
  COUNT(CASE WHEN role='free'   THEN 1 END)              AS free_users,
  COUNT(CASE WHEN role='pro'    THEN 1 END)              AS pro_users,
  COUNT(CASE WHEN role='expert' THEN 1 END)              AS expert_users,
  COUNT(CASE WHEN created_at > NOW()-INTERVAL '7 days'  THEN 1 END) AS new_last_7_days,
  COUNT(CASE WHEN created_at > NOW()-INTERVAL '30 days' THEN 1 END) AS new_last_30_days
FROM profiles;

-- ─────────────────────────────────────────────────────────────
-- AUDIT 8: LESSON COMPLETION DATA
-- ─────────────────────────────────────────────────────────────
SELECT
  COUNT(DISTINCT user_id)              AS users_with_progress,
  COUNT(*)                             AS total_completions,
  COUNT(CASE WHEN quiz_score IS NOT NULL THEN 1 END) AS quiz_attempts,
  ROUND(AVG(quiz_score), 1)              AS avg_quiz_score,
  ROUND(AVG(time_spent_secs)/60.0, 1)    AS avg_time_spent_minutes,
  MAX(completed_at)                      AS last_completion
FROM user_progress;

-- ─────────────────────────────────────────────────────────────
-- AUDIT 9: TOP 10 MOST COMPLETED LESSONS
-- ─────────────────────────────────────────────────────────────
SELECT
  l.title,
  t.title AS track,
  COUNT(up.id) AS completions
FROM user_progress up
JOIN lessons l  ON up.lesson_id = l.id
JOIN levels lv  ON l.level_id   = lv.id
JOIN tracks t   ON lv.track_id  = t.id
GROUP BY l.title, t.title
ORDER BY completions DESC
LIMIT 10;

-- ─────────────────────────────────────────────────────────────
-- AUDIT 10: QUIZ PERFORMANCE METRICS
-- ─────────────────────────────────────────────────────────────
SELECT
  COUNT(CASE WHEN quiz_score IS NOT NULL THEN 1 END)      AS total_quiz_attempts,
  COUNT(CASE WHEN quiz_score >= 70 THEN 1 END)           AS passed,
  COUNT(CASE WHEN quiz_score < 70 THEN 1 END)            AS failed,
  ROUND(AVG(quiz_score), 1)                              AS avg_score,
  ROUND(100.0 * COUNT(CASE WHEN quiz_score >= 70 THEN 1 END)
    / NULLIF(COUNT(CASE WHEN quiz_score IS NOT NULL THEN 1 END), 0), 1) AS pass_rate_pct
FROM user_progress;

-- ─────────────────────────────────────────────────────────────
-- AUDIT 11: DIGITAL NOTES USAGE (Dynamic EXECUTE - Parse Safe)
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS temp_notes_audit;
CREATE TEMP TABLE temp_notes_audit (
  status TEXT,
  total_notes BIGINT,
  users_with_notes BIGINT,
  pinned_notes BIGINT,
  archived_notes BIGINT
);

DO $$
BEGIN
  IF to_regclass('public.user_notes') IS NOT NULL THEN
    EXECUTE 'INSERT INTO temp_notes_audit SELECT ''Table Installed'', COUNT(*), COUNT(DISTINCT user_id), COUNT(CASE WHEN is_pinned = TRUE THEN 1 END), COUNT(CASE WHEN is_archived = TRUE THEN 1 END) FROM user_notes';
  ELSE
    INSERT INTO temp_notes_audit VALUES ('Table Pending (Run digital_notes_schema.sql)', 0, 0, 0, 0);
  END IF;
END $$;

SELECT * FROM temp_notes_audit;

-- ─────────────────────────────────────────────────────────────
-- AUDIT 12: GAMIFICATION HEALTH (Dynamic EXECUTE - Parse Safe)
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS temp_xp_audit;
CREATE TEMP TABLE temp_xp_audit (
  status TEXT,
  total_xp_events BIGINT,
  total_xp_awarded NUMERIC
);

DO $$
BEGIN
  IF to_regclass('public.user_xp_log') IS NOT NULL THEN
    EXECUTE 'INSERT INTO temp_xp_audit SELECT ''Table Installed'', COUNT(*), COALESCE(SUM(xp_amount), 0) FROM user_xp_log';
  ELSE
    INSERT INTO temp_xp_audit VALUES ('Table Pending (Run gamification.sql)', 0, 0);
  END IF;
END $$;

SELECT * FROM temp_xp_audit;

-- Streak health (Guaranteed Profiles Table)
SELECT
  COUNT(*)                                               AS users_tracked,
  ROUND(AVG(streak_current),1)                           AS avg_streak,
  MAX(streak_current)                                    AS longest_streak,
  MAX(streak_longest)                                    AS all_time_longest
FROM profiles
WHERE streak_current > 0;

-- ─────────────────────────────────────────────────────────────
-- AUDIT 13: LEVEL STRUCTURE HEALTH
-- ─────────────────────────────────────────────────────────────
SELECT
  t.title  AS track,
  t.slug  AS track_slug,
  COUNT(DISTINCT lv.id) AS levels,
  COUNT(DISTINCT l.id)  AS lessons
FROM tracks t
LEFT JOIN levels  lv ON lv.track_id = t.id
LEFT JOIN lessons l  ON l.level_id  = lv.id
  AND l.is_published = TRUE
GROUP BY t.id, t.title, t.slug, t.order_index
ORDER BY t.order_index;

-- ─────────────────────────────────────────────────────────────
-- AUDIT 14: BROKEN LESSON SLUGS
-- ─────────────────────────────────────────────────────────────
SELECT slug, COUNT(*) AS count
FROM lessons
GROUP BY slug
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- ─────────────────────────────────────────────────────────────
-- AUDIT 15: CONTENT GAPS BY LEVEL
-- ─────────────────────────────────────────────────────────────
SELECT
  t.title  AS track,
  lv.title AS level,
  lv.slug AS level_slug,
  COUNT(l.id) AS lesson_count
FROM levels lv
JOIN tracks t ON lv.track_id = t.id
LEFT JOIN lessons l ON l.level_id = lv.id AND l.is_published = TRUE
GROUP BY t.title, lv.title, lv.slug, t.order_index
HAVING COUNT(l.id) < 5
ORDER BY lesson_count, t.order_index;

-- ─────────────────────────────────────────────────────────────
-- AUDIT 16: RLS POLICY CHECK
-- ─────────────────────────────────────────────────────────────
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ─────────────────────────────────────────────────────────────
-- AUDIT 17: SUBSCRIPTION STATUS
-- ─────────────────────────────────────────────────────────────
SELECT
  role AS subscription_tier,
  COUNT(*) AS users
FROM profiles
GROUP BY role
ORDER BY users DESC;

-- ─────────────────────────────────────────────────────────────
-- AUDIT 18: COMPLETE MASTER SUMMARY REPORT (100% Dynamic - Parse Safe)
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS temp_master_report;
CREATE TEMP TABLE temp_master_report (
  section TEXT,
  metric TEXT,
  value TEXT
);

DO $$
DECLARE
  v_pub_lessons BIGINT;
  v_quizzes BIGINT;
  v_questions BIGINT;
  v_videos TEXT := '0 (Table Pending)';
  v_users BIGINT;
  v_pro_users BIGINT;
  v_completions BIGINT;
  v_attempts BIGINT;
  v_notes TEXT := '0 (Table Pending)';
  v_xp TEXT := '0 (Table Pending)';
BEGIN
  -- Core table queries (Guaranteed)
  SELECT COUNT(*) INTO v_pub_lessons FROM lessons WHERE is_published = TRUE;
  SELECT COUNT(*) INTO v_quizzes FROM quizzes;
  SELECT COUNT(*) INTO v_questions FROM quiz_questions;
  SELECT COUNT(*) INTO v_users FROM profiles;
  SELECT COUNT(*) INTO v_pro_users FROM profiles WHERE role IN ('pro', 'expert');
  SELECT COUNT(*) INTO v_completions FROM user_progress;
  SELECT COUNT(CASE WHEN quiz_score IS NOT NULL THEN 1 END) INTO v_attempts FROM user_progress;

  -- Optional table queries (Dynamic EXECUTE string prevents parse-time relation lookup)
  IF to_regclass('public.curated_playlists') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*)::TEXT FROM curated_playlists WHERE is_published = TRUE' INTO v_videos;
  END IF;

  IF to_regclass('public.user_notes') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*)::TEXT FROM user_notes' INTO v_notes;
  END IF;

  IF to_regclass('public.user_xp_log') IS NOT NULL THEN
    EXECUTE 'SELECT COALESCE(SUM(xp_amount), 0)::TEXT FROM user_xp_log' INTO v_xp;
  END IF;

  -- Insert section content
  INSERT INTO temp_master_report VALUES
    ('CONTENT', 'Published Lessons', v_pub_lessons::TEXT),
    ('CONTENT', 'Total Quizzes', v_quizzes::TEXT),
    ('CONTENT', 'Total Quiz Questions', v_questions::TEXT),
    ('CONTENT', 'Published Videos', v_videos),
    ('USERS', 'Total Registered Profiles', v_users::TEXT),
    ('USERS', 'Pro / Expert Users', v_pro_users::TEXT),
    ('ENGAGEMENT', 'Total Lesson Completions', v_completions::TEXT),
    ('ENGAGEMENT', 'Total Quiz Attempts', v_attempts::TEXT),
    ('ENGAGEMENT', 'Total User Notes Created', v_notes),
    ('ENGAGEMENT', 'Total XP Awarded', v_xp);
END $$;

SELECT * FROM temp_master_report;
