-- ============================================================
-- FinanceHub — Master 100/100 Pre-Live Reality Scorecard
-- File: sql/master_prelive_audit_scorecard.sql
-- Description: Dynamic, parse-safe diagnostic query that audits
--              every layer and table of the live Supabase database
-- ============================================================

DROP TABLE IF EXISTS temp_prelive_scorecard;
CREATE TEMP TABLE temp_prelive_scorecard (
  id               SERIAL PRIMARY KEY,
  category         TEXT,
  feature_or_table TEXT,
  table_status     TEXT,
  live_count       BIGINT,
  expected_target  TEXT,
  verdict          TEXT,
  action_needed    TEXT
);

DO $$
DECLARE
  v_count BIGINT;
BEGIN
  -- 1. Tracks
  IF to_regclass('public.tracks') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM tracks' INTO v_count;
    INSERT INTO temp_prelive_scorecard (category, feature_or_table, table_status, live_count, expected_target, verdict, action_needed)
    VALUES ('FOUNDATION', 'tracks', 'EXISTS', v_count, '8 - 10 tracks',
      CASE WHEN v_count >= 8 THEN '✅ COMPLETE' ELSE '⚠️ LOW' END,
      CASE WHEN v_count >= 8 THEN 'None' ELSE 'Check track seeds' END);
  ELSE
    INSERT INTO temp_prelive_scorecard VALUES (DEFAULT, 'FOUNDATION', 'tracks', 'MISSING ❌', 0, '8 - 10 tracks', '❌ MISSING', 'Run supabase_schema_safe.sql');
  END IF;

  -- 2. Published Lessons
  IF to_regclass('public.lessons') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM lessons WHERE is_published = TRUE' INTO v_count;
    INSERT INTO temp_prelive_scorecard (category, feature_or_table, table_status, live_count, expected_target, verdict, action_needed)
    VALUES ('CURRICULUM', 'lessons (published)', 'EXISTS', v_count, '300 - 375+ lessons',
      CASE WHEN v_count >= 290 THEN '✅ COMPLETE' ELSE '⚠️ PARTIAL' END,
      CASE WHEN v_count >= 290 THEN 'None' ELSE 'Run curriculum expansion batches' END);
  ELSE
    INSERT INTO temp_prelive_scorecard VALUES (DEFAULT, 'CURRICULUM', 'lessons (published)', 'MISSING ❌', 0, '300+ lessons', '❌ MISSING', 'Run schema migrations');
  END IF;

  -- 3. Hindi Lessons
  IF to_regclass('public.lessons') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM lessons WHERE language = ''hi'' OR slug LIKE ''%hindi%'' OR title ~ ''[\u0900-\u097F]''' INTO v_count;
    INSERT INTO temp_prelive_scorecard (category, feature_or_table, table_status, live_count, expected_target, verdict, action_needed)
    VALUES ('LOCALIZATION', 'Hindi Lessons', 'EXISTS', v_count, '20 - 30+ lessons',
      CASE WHEN v_count >= 20 THEN '✅ COMPLETE' WHEN v_count >= 8 THEN '⚡ PARTIAL LOADED' ELSE '⚠️ LOW' END,
      CASE WHEN v_count >= 20 THEN 'None' ELSE 'Run phase10_cases_hindi.sql' END);
  END IF;

  -- 4. Case Studies
  IF to_regclass('public.case_studies') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM case_studies' INTO v_count;
    INSERT INTO temp_prelive_scorecard (category, feature_or_table, table_status, live_count, expected_target, verdict, action_needed)
    VALUES ('CURRICULUM', 'case_studies', 'EXISTS', v_count, '15 - 25 case studies',
      CASE WHEN v_count >= 15 THEN '✅ COMPLETE' WHEN v_count >= 5 THEN '⚡ BASE BATCH (5+)' ELSE '⚠️ LOW' END,
      CASE WHEN v_count >= 15 THEN 'None' ELSE 'Run case_studies_expansion.sql' END);
  ELSE
    INSERT INTO temp_prelive_scorecard VALUES (DEFAULT, 'CURRICULUM', 'case_studies', 'MISSING ❌', 0, '15 - 25 case studies', '❌ MISSING', 'Run case_studies migrations');
  END IF;

  -- 5. Quizzes
  IF to_regclass('public.quizzes') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM quizzes' INTO v_count;
    INSERT INTO temp_prelive_scorecard (category, feature_or_table, table_status, live_count, expected_target, verdict, action_needed)
    VALUES ('ASSESSMENTS', 'quizzes', 'EXISTS', v_count, '50 - 86+ quizzes',
      CASE WHEN v_count >= 50 THEN '✅ 100% COMPLETE' ELSE '⚠️ PARTIAL' END, 'None');
  ELSE
    INSERT INTO temp_prelive_scorecard VALUES (DEFAULT, 'ASSESSMENTS', 'quizzes', 'MISSING ❌', 0, '50+ quizzes', '❌ MISSING', 'Run quiz migrations');
  END IF;

  -- 6. Quiz Questions
  IF to_regclass('public.quiz_questions') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM quiz_questions' INTO v_count;
    INSERT INTO temp_prelive_scorecard (category, feature_or_table, table_status, live_count, expected_target, verdict, action_needed)
    VALUES ('ASSESSMENTS', 'quiz_questions', 'EXISTS', v_count, '250 - 400+ questions',
      CASE WHEN v_count >= 250 THEN '✅ 100% COMPLETE' ELSE '⚡ BASE LOADED' END,
      CASE WHEN v_count >= 250 THEN 'None' ELSE 'Run phase9_10_quizzes.sql' END);
  ELSE
    INSERT INTO temp_prelive_scorecard VALUES (DEFAULT, 'ASSESSMENTS', 'quiz_questions', 'MISSING ❌', 0, '250+ questions', '❌ MISSING', 'Run quiz migrations');
  END IF;

  -- 7. Concepts (Knowledge Graph)
  IF to_regclass('public.concepts') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM concepts' INTO v_count;
    INSERT INTO temp_prelive_scorecard (category, feature_or_table, table_status, live_count, expected_target, verdict, action_needed)
    VALUES ('KNOWLEDGE GRAPH', 'concepts', 'EXISTS', v_count, '50 - 150+ concepts',
      CASE WHEN v_count >= 90 THEN '✅ 100% COMPLETE' WHEN v_count >= 50 THEN '⚡ 50+ LOADED' ELSE '⚠️ LOW' END,
      CASE WHEN v_count >= 90 THEN 'None' ELSE 'Run concepts_careers_videos.sql' END);
  ELSE
    INSERT INTO temp_prelive_scorecard VALUES (DEFAULT, 'KNOWLEDGE GRAPH', 'concepts', 'MISSING ❌', 0, '50+ concepts', '❌ MISSING', 'Run concepts migration');
  END IF;

  -- 8. Glossary
  IF to_regclass('public.glossary') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM glossary' INTO v_count;
    INSERT INTO temp_prelive_scorecard (category, feature_or_table, table_status, live_count, expected_target, verdict, action_needed)
    VALUES ('GLOSSARY', 'glossary', 'EXISTS', v_count, '35+ terms',
      CASE WHEN v_count >= 30 THEN '✅ COMPLETE' ELSE '⚠️ PARTIAL' END,
      CASE WHEN v_count >= 30 THEN 'None' ELSE 'Run phase2_migration.sql' END);
  ELSE
    INSERT INTO temp_prelive_scorecard VALUES (DEFAULT, 'GLOSSARY', 'glossary', 'MISSING ❌', 0, '35+ terms', '❌ MISSING', 'Run glossary migration');
  END IF;

  -- 9. Career Paths
  IF to_regclass('public.career_paths') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM career_paths' INTO v_count;
    INSERT INTO temp_prelive_scorecard (category, feature_or_table, table_status, live_count, expected_target, verdict, action_needed)
    VALUES ('CAREERS', 'career_paths', 'EXISTS', v_count, '8 - 15 careers',
      CASE WHEN v_count >= 8 THEN '✅ COMPLETE' ELSE '⚠️ LOW' END,
      CASE WHEN v_count >= 8 THEN 'None' ELSE 'Run community_career.sql & concepts_careers_videos.sql' END);
  ELSE
    INSERT INTO temp_prelive_scorecard VALUES (DEFAULT, 'CAREERS', 'career_paths', 'MISSING ❌', 0, '8 - 15 careers', '❌ MISSING', 'Run community_career.sql');
  END IF;

  -- 10. Interview Questions Bank
  IF to_regclass('public.interview_questions') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM interview_questions' INTO v_count;
    INSERT INTO temp_prelive_scorecard (category, feature_or_table, table_status, live_count, expected_target, verdict, action_needed)
    VALUES ('CAREERS', 'interview_questions', 'EXISTS', v_count, '15+ questions',
      CASE WHEN v_count >= 15 THEN '✅ COMPLETE' ELSE '⚠️ LOW' END, 'None');
  ELSE
    INSERT INTO temp_prelive_scorecard VALUES (DEFAULT, 'CAREERS', 'interview_questions', 'MISSING ❌', 0, '15+ questions', '❌ MISSING', 'Run community_career.sql');
  END IF;

  -- 11. Curated Playlists / Videos
  IF to_regclass('public.curated_playlists') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM curated_playlists WHERE is_published = TRUE' INTO v_count;
    INSERT INTO temp_prelive_scorecard (category, feature_or_table, table_status, live_count, expected_target, verdict, action_needed)
    VALUES ('MEDIA', 'curated_playlists', 'EXISTS', v_count, '80 - 150+ items',
      CASE WHEN v_count >= 80 THEN '✅ 100% COMPLETE' ELSE '⚠️ PARTIAL' END,
      CASE WHEN v_count >= 80 THEN 'None' ELSE 'Run video_library_expansion.sql' END);
  ELSE
    INSERT INTO temp_prelive_scorecard VALUES (DEFAULT, 'MEDIA', 'curated_playlists', 'MISSING ❌', 0, '80+ items', '❌ MISSING', 'Run video_library_expansion.sql');
  END IF;

  -- 12. Books
  IF to_regclass('public.books') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM books' INTO v_count;
    INSERT INTO temp_prelive_scorecard (category, feature_or_table, table_status, live_count, expected_target, verdict, action_needed)
    VALUES ('MEDIA', 'books', 'EXISTS', v_count, '15 - 30+ books',
      CASE WHEN v_count >= 15 THEN '✅ COMPLETE' ELSE '⚠️ LOW' END, 'None');
  ELSE
    INSERT INTO temp_prelive_scorecard VALUES (DEFAULT, 'MEDIA', 'books', 'MISSING ❌', 0, '15+ books', '❌ MISSING', 'Run phase10_multimedia_trading.sql');
  END IF;

  -- 13. Paper Portfolios
  IF to_regclass('public.paper_portfolios') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM paper_portfolios' INTO v_count;
    INSERT INTO temp_prelive_scorecard (category, feature_or_table, table_status, live_count, expected_target, verdict, action_needed)
    VALUES ('SIMULATIONS', 'paper_portfolios', 'EXISTS', v_count, 'Table Ready', '✅ COMPLETE', 'None');
  ELSE
    INSERT INTO temp_prelive_scorecard VALUES (DEFAULT, 'SIMULATIONS', 'paper_portfolios', 'MISSING ❌', 0, 'Table Ready', '❌ MISSING', 'Run phase3_migration.sql');
  END IF;

  -- 14. Seasons & Challenges (Gamification)
  IF to_regclass('public.seasons') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM seasons' INTO v_count;
    INSERT INTO temp_prelive_scorecard (category, feature_or_table, table_status, live_count, expected_target, verdict, action_needed)
    VALUES ('GAMIFICATION', 'seasons & challenges', 'EXISTS', v_count, 'Active Season',
      CASE WHEN v_count >= 1 THEN '✅ COMPLETE' ELSE '⚠️ SEED NEEDED' END,
      CASE WHEN v_count >= 1 THEN 'None' ELSE 'Run gamification.sql' END);
  ELSE
    INSERT INTO temp_prelive_scorecard VALUES (DEFAULT, 'GAMIFICATION', 'seasons & challenges', 'MISSING ❌', 0, 'Active Season', '❌ MISSING', 'Run gamification.sql');
  END IF;

  -- 15. Badges
  IF to_regclass('public.badges') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM badges' INTO v_count;
    INSERT INTO temp_prelive_scorecard (category, feature_or_table, table_status, live_count, expected_target, verdict, action_needed)
    VALUES ('GAMIFICATION', 'badges', 'EXISTS', v_count, '20 badges',
      CASE WHEN v_count >= 20 THEN '✅ COMPLETE' ELSE '⚠️ PARTIAL' END, 'None');
  ELSE
    INSERT INTO temp_prelive_scorecard VALUES (DEFAULT, 'GAMIFICATION', 'badges', 'MISSING ❌', 0, '20 badges', '❌ MISSING', 'Run gamification.sql');
  END IF;

  -- 16. User Notes (Rough Book)
  IF to_regclass('public.user_notes') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM user_notes' INTO v_count;
    INSERT INTO temp_prelive_scorecard (category, feature_or_table, table_status, live_count, expected_target, verdict, action_needed)
    VALUES ('TOOLS', 'user_notes (rough book)', 'EXISTS', v_count, 'Table Ready', '✅ COMPLETE', 'None');
  ELSE
    INSERT INTO temp_prelive_scorecard VALUES (DEFAULT, 'TOOLS', 'user_notes (rough book)', 'MISSING ❌', 0, 'Table Ready', '❌ MISSING', 'Run digital_notes_schema.sql');
  END IF;

  -- 17. Referral System
  IF to_regclass('public.referral_codes') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM referral_codes' INTO v_count;
    INSERT INTO temp_prelive_scorecard (category, feature_or_table, table_status, live_count, expected_target, verdict, action_needed)
    VALUES ('GROWTH', 'referral_codes', 'EXISTS', v_count, 'Table Ready', '✅ COMPLETE', 'None');
  ELSE
    INSERT INTO temp_prelive_scorecard VALUES (DEFAULT, 'GROWTH', 'referral_codes', 'MISSING ❌', 0, 'Table Ready', '❌ MISSING', 'Run referral_system.sql');
  END IF;

  -- 18. Feedback System
  IF to_regclass('public.feedback') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM feedback' INTO v_count;
    INSERT INTO temp_prelive_scorecard (category, feature_or_table, table_status, live_count, expected_target, verdict, action_needed)
    VALUES ('COMMUNITY', 'feedback', 'EXISTS', v_count, 'Table Ready', '✅ COMPLETE', 'None');
  ELSE
    INSERT INTO temp_prelive_scorecard VALUES (DEFAULT, 'COMMUNITY', 'feedback', 'MISSING ❌', 0, 'Table Ready', '❌ MISSING', 'Run feedback_schema.sql');
  END IF;

  -- 19. Community Questions
  IF to_regclass('public.community_questions') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM community_questions' INTO v_count;
    INSERT INTO temp_prelive_scorecard (category, feature_or_table, table_status, live_count, expected_target, verdict, action_needed)
    VALUES ('COMMUNITY', 'community_questions', 'EXISTS', v_count, 'Table Ready', '✅ COMPLETE', 'None');
  ELSE
    INSERT INTO temp_prelive_scorecard VALUES (DEFAULT, 'COMMUNITY', 'community_questions', 'MISSING ❌', 0, 'Table Ready', '❌ MISSING', 'Run community_career.sql');
  END IF;

  -- 20. Rate Limits
  IF to_regclass('public.api_rate_limits') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM api_rate_limits' INTO v_count;
    INSERT INTO temp_prelive_scorecard (category, feature_or_table, table_status, live_count, expected_target, verdict, action_needed)
    VALUES ('SECURITY', 'api_rate_limits', 'EXISTS', v_count, 'Table Ready', '✅ COMPLETE', 'None');
  ELSE
    INSERT INTO temp_prelive_scorecard VALUES (DEFAULT, 'SECURITY', 'api_rate_limits', 'MISSING ❌', 0, 'Table Ready', '❌ MISSING', 'Run phase6_migration.sql');
  END IF;

  -- 21. Content Freshness Audits
  IF to_regclass('public.content_freshness_audits') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM content_freshness_audits' INTO v_count;
    INSERT INTO temp_prelive_scorecard (category, feature_or_table, table_status, live_count, expected_target, verdict, action_needed)
    VALUES ('QUALITY', 'content_freshness_audits', 'EXISTS', v_count, 'Table Ready', '✅ COMPLETE', 'None');
  ELSE
    INSERT INTO temp_prelive_scorecard VALUES (DEFAULT, 'QUALITY', 'content_freshness_audits', 'MISSING ❌', 0, 'Table Ready', '❌ MISSING', 'Run content_freshness_audits.sql');
  END IF;

END $$;

-- DISPLAY FINAL 100/100 MASTER SCORECARD TABLE
SELECT
  category,
  feature_or_table,
  table_status,
  live_count,
  expected_target,
  verdict,
  action_needed
FROM temp_prelive_scorecard
ORDER BY id;
