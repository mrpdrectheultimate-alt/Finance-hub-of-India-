-- ============================================================
-- FinanceHub — Phase 5 SQL Migration
-- Community Q&A · PWA · Performance Indexes · Admin CMS
-- Run AFTER phase4_migration.sql
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. LESSON Q&A (community questions per lesson)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_questions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id     UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question      TEXT NOT NULL CHECK (LENGTH(question) BETWEEN 10 AND 1000),
  is_answered   BOOLEAN DEFAULT FALSE,
  is_pinned     BOOLEAN DEFAULT FALSE,  -- admin can pin best questions
  is_flagged    BOOLEAN DEFAULT FALSE,
  upvote_count  INT DEFAULT 0,
  answer_count  INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lesson_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "questions_public_read" ON lesson_questions;
CREATE POLICY "questions_public_read" ON lesson_questions
  FOR SELECT USING (NOT is_flagged);

DROP POLICY IF EXISTS "questions_own_insert" ON lesson_questions;
CREATE POLICY "questions_own_insert" ON lesson_questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "questions_own_update" ON lesson_questions;
CREATE POLICY "questions_own_update" ON lesson_questions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "questions_service_all" ON lesson_questions;
CREATE POLICY "questions_service_all" ON lesson_questions
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_questions_lesson
  ON lesson_questions (lesson_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_user
  ON lesson_questions (user_id);
CREATE INDEX IF NOT EXISTS idx_questions_unanswered
  ON lesson_questions (lesson_id, is_answered) WHERE is_answered = FALSE;

-- ─────────────────────────────────────────────────────────────
-- 2. QUESTION ANSWERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS question_answers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id   UUID NOT NULL REFERENCES lesson_questions(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  answer        TEXT NOT NULL CHECK (LENGTH(answer) BETWEEN 10 AND 2000),
  is_accepted   BOOLEAN DEFAULT FALSE,   -- question author marks best answer
  is_staff      BOOLEAN DEFAULT FALSE,   -- FinanceHub team answer
  is_ai         BOOLEAN DEFAULT FALSE,   -- AI-generated answer
  is_flagged    BOOLEAN DEFAULT FALSE,
  upvote_count  INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "answers_public_read" ON question_answers;
CREATE POLICY "answers_public_read" ON question_answers
  FOR SELECT USING (NOT is_flagged);

DROP POLICY IF EXISTS "answers_own_insert" ON question_answers;
CREATE POLICY "answers_own_insert" ON question_answers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "answers_own_update" ON question_answers;
CREATE POLICY "answers_own_update" ON question_answers
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "answers_service_all" ON question_answers;
CREATE POLICY "answers_service_all" ON question_answers
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_answers_question
  ON question_answers (question_id, is_accepted DESC, upvote_count DESC);

-- ─────────────────────────────────────────────────────────────
-- 3. UPVOTES (questions and answers)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_upvotes (
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type   TEXT NOT NULL CHECK (target_type IN ('question','answer')),
  target_id     UUID NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY   (user_id, target_type, target_id)
);

ALTER TABLE community_upvotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "upvotes_own_all" ON community_upvotes;
CREATE POLICY "upvotes_own_all" ON community_upvotes
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "upvotes_public_read" ON community_upvotes;
CREATE POLICY "upvotes_public_read" ON community_upvotes
  FOR SELECT USING (TRUE);

-- Function to toggle upvote and update count
CREATE OR REPLACE FUNCTION toggle_upvote(
  p_user_id   UUID,
  p_type      TEXT,
  p_target_id UUID
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_exists  BOOLEAN;
  v_delta   INT;
  v_count   INT;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM community_upvotes
    WHERE user_id=p_user_id AND target_type=p_type AND target_id=p_target_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM community_upvotes
    WHERE user_id=p_user_id AND target_type=p_type AND target_id=p_target_id;
    v_delta := -1;
  ELSE
    INSERT INTO community_upvotes (user_id, target_type, target_id)
    VALUES (p_user_id, p_type, p_target_id);
    v_delta := 1;
  END IF;

  IF p_type = 'question' THEN
    UPDATE lesson_questions SET upvote_count = GREATEST(0, upvote_count + v_delta)
    WHERE id = p_target_id RETURNING upvote_count INTO v_count;
  ELSE
    UPDATE question_answers SET upvote_count = GREATEST(0, upvote_count + v_delta)
    WHERE id = p_target_id RETURNING upvote_count INTO v_count;
  END IF;

  RETURN jsonb_build_object('upvoted', NOT v_exists, 'count', v_count);
END; $$;

-- ─────────────────────────────────────────────────────────────
-- 4. COMMUNITY CONTENT REPORTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_flags (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type   TEXT NOT NULL CHECK (target_type IN ('question','answer')),
  target_id     UUID NOT NULL,
  reason        TEXT NOT NULL CHECK (reason IN (
    'spam','misinformation','offensive','off_topic','other'
  )),
  description   TEXT,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending','reviewed','dismissed')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, target_type, target_id)
);

ALTER TABLE community_flags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "flags_own_insert" ON community_flags;
CREATE POLICY "flags_own_insert" ON community_flags
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "flags_service_all" ON community_flags;
CREATE POLICY "flags_service_all" ON community_flags
  FOR ALL USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────
-- 5. PERFORMANCE INDEXES (for scale)
-- ─────────────────────────────────────────────────────────────

-- Lessons — most-queried columns
CREATE INDEX IF NOT EXISTS idx_lessons_published_free
  ON lessons (is_published, is_free, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_level_published
  ON lessons (level_id, is_published, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_slug_published
  ON lessons (slug) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_lessons_language
  ON lessons (language, is_published);

-- Full text search on lessons
CREATE INDEX IF NOT EXISTS idx_lessons_fts
  ON lessons USING GIN (to_tsvector('english', title || ' ' || COALESCE(content_mdx,'')));

-- User progress — critical path
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_progress_user_completed
  ON user_progress (user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_user
  ON user_progress (lesson_id, user_id);

-- Quiz attempts
CREATE TABLE IF NOT EXISTS user_quiz_attempts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id     UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score       INT NOT NULL DEFAULT 0,
  passed      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_quiz_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "quiz_attempts_own" ON user_quiz_attempts;
CREATE POLICY "quiz_attempts_own" ON user_quiz_attempts FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user
  ON user_quiz_attempts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz
  ON user_quiz_attempts (quiz_id, passed);

-- XP log — dashboard queries
CREATE INDEX IF NOT EXISTS idx_xp_log_user_date
  ON user_xp_log (user_id, created_at DESC);

-- Notes — user's notes search
CREATE TABLE IF NOT EXISTS user_notes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id   UUID REFERENCES lessons(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_pinned   BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notes_own_all" ON user_notes;
CREATE POLICY "notes_own_all" ON user_notes FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notes_user_pinned
  ON user_notes (user_id, is_pinned DESC, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_lesson
  ON user_notes (lesson_id) WHERE lesson_id IS NOT NULL;

-- Glossary full-text search (only if table exists)
CREATE INDEX IF NOT EXISTS idx_glossary_fts
  ON glossary USING GIN (to_tsvector('english', term || ' ' || COALESCE(simple_def,'')));

-- Concepts full-text search (only if table exists)
CREATE INDEX IF NOT EXISTS idx_concepts_fts
  ON concepts USING GIN (to_tsvector('english', name || ' ' || COALESCE(simple_def,'')));

-- ─────────────────────────────────────────────────────────────
-- 6. ADMIN CMS TABLES
-- ─────────────────────────────────────────────────────────────

-- Lesson drafts (for CMS editor)
CREATE TABLE IF NOT EXISTS lesson_drafts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id      UUID REFERENCES lessons(id) ON DELETE CASCADE,  -- NULL = new lesson
  level_id       UUID REFERENCES levels(id),
  title          TEXT,
  slug           TEXT,
  content_mdx    TEXT,
  duration_minutes INT DEFAULT 7,
  order_index    INT DEFAULT 999,
  is_free        BOOLEAN DEFAULT FALSE,
  meta_title     TEXT,
  meta_description TEXT,
  key_takeaways  JSONB DEFAULT '[]',
  difficulty_score INT DEFAULT 5,
  language       TEXT DEFAULT 'en',
  draft_status   TEXT DEFAULT 'draft'
    CHECK (draft_status IN ('draft','review','approved','rejected')),
  created_by     TEXT,
  updated_by     TEXT,
  review_notes   TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lesson_drafts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "drafts_admin_all" ON lesson_drafts;
CREATE POLICY "drafts_admin_all" ON lesson_drafts FOR ALL
  USING (auth.jwt() ->> 'email' = ANY(
    string_to_array(current_setting('app.admin_emails', true), ',')
  ));
DROP POLICY IF EXISTS "drafts_service_all" ON lesson_drafts;
CREATE POLICY "drafts_service_all" ON lesson_drafts
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_drafts_lesson    ON lesson_drafts (lesson_id);
CREATE INDEX IF NOT EXISTS idx_drafts_status    ON lesson_drafts (draft_status);
CREATE INDEX IF NOT EXISTS idx_drafts_updated   ON lesson_drafts (updated_at DESC);

-- Quiz drafts
CREATE TABLE IF NOT EXISTS quiz_drafts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id    UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title        TEXT,
  questions    JSONB DEFAULT '[]',  -- array of question objects
  pass_score   INT DEFAULT 70,
  xp_reward    INT DEFAULT 25,
  draft_status TEXT DEFAULT 'draft',
  created_by   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quiz_drafts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "quiz_drafts_admin" ON quiz_drafts;
CREATE POLICY "quiz_drafts_admin" ON quiz_drafts FOR ALL
  USING (auth.jwt() ->> 'email' = ANY(
    string_to_array(current_setting('app.admin_emails', true), ',')
  ));

-- Admin activity log
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_email  TEXT NOT NULL,
  action       TEXT NOT NULL,
  target_type  TEXT,
  target_id    UUID,
  target_title TEXT,
  details      JSONB DEFAULT '{}',
  ip_address   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_log_service" ON admin_activity_log;
CREATE POLICY "admin_log_service" ON admin_activity_log
  FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "admin_log_read" ON admin_activity_log;
CREATE POLICY "admin_log_read" ON admin_activity_log
  FOR SELECT USING (auth.jwt() ->> 'email' = ANY(
    string_to_array(current_setting('app.admin_emails', true), ',')
  ));

CREATE INDEX IF NOT EXISTS idx_admin_log_date  ON admin_activity_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_log_admin ON admin_activity_log (admin_email, created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- 7. PWA — push notifications support
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint     TEXT NOT NULL UNIQUE,
  p256dh       TEXT NOT NULL,
  auth_key     TEXT NOT NULL,
  user_agent   TEXT,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  last_used    TIMESTAMPTZ
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "push_own_all" ON push_subscriptions;
CREATE POLICY "push_own_all" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 8. COMMUNITY ANALYTICS VIEW
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW community_health AS
SELECT
  COUNT(DISTINCT lq.id)   AS total_questions,
  COUNT(DISTINCT qa.id)   AS total_answers,
  COUNT(DISTINCT lq.user_id) AS users_asking,
  COUNT(DISTINCT qa.user_id) AS users_answering,
  COUNT(CASE WHEN lq.is_answered = FALSE THEN 1 END) AS unanswered_questions,
  ROUND(100.0 * COUNT(CASE WHEN lq.is_answered THEN 1 END)
    / NULLIF(COUNT(lq.id), 0), 1) AS answer_rate_pct,
  COUNT(CASE WHEN lq.created_at > NOW() - INTERVAL '7 days' THEN 1 END) AS questions_7d,
  COUNT(CASE WHEN qa.created_at > NOW() - INTERVAL '7 days' THEN 1 END) AS answers_7d
FROM lesson_questions lq
LEFT JOIN question_answers qa ON qa.question_id = lq.id
WHERE lq.is_flagged = FALSE;

-- ─────────────────────────────────────────────────────────────
-- 9. FULL-TEXT SEARCH FUNCTION (replaces basic ILIKE)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION search_lessons(
  p_query TEXT,
  p_limit INT DEFAULT 10
) RETURNS TABLE (
  id               UUID,
  title            TEXT,
  slug             TEXT,
  duration_minutes INT,
  is_free          BOOLEAN,
  language         TEXT,
  track_name       TEXT,
  rank             REAL
) LANGUAGE sql STABLE AS $$
  SELECT
    l.id, l.title, l.slug, l.duration_minutes, l.is_free, l.language,
    t.title AS track_name,
    ts_rank(
      to_tsvector('english', l.title || ' ' || COALESCE(l.content_mdx, '')),
      websearch_to_tsquery('english', p_query)
    ) AS rank
  FROM lessons l
  JOIN levels lv ON l.level_id = lv.id
  JOIN tracks t  ON lv.track_id = t.id
  WHERE
    l.is_published = TRUE
    AND to_tsvector('english', l.title || ' ' || COALESCE(l.content_mdx, ''))
        @@ websearch_to_tsquery('english', p_query)
  ORDER BY rank DESC
  LIMIT p_limit;
$$;

-- ─────────────────────────────────────────────────────────────
-- 10. VERIFY
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE v_tables INT; v_indexes INT;
BEGIN
  SELECT COUNT(*) INTO v_tables
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'lesson_questions','question_answers','community_upvotes',
      'community_flags','lesson_drafts','quiz_drafts',
      'admin_activity_log','push_subscriptions'
    );

  SELECT COUNT(*) INTO v_indexes
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
    AND tablename IN ('lessons','user_progress','user_quiz_attempts',
                      'user_xp_log','user_notes','glossary','concepts');

  RAISE NOTICE '✅ Phase 5 migration complete!';
  RAISE NOTICE '   New tables: %', v_tables;
  RAISE NOTICE '   Performance indexes added: %', v_indexes;
  RAISE NOTICE '   Community: lesson_questions, question_answers, community_upvotes';
  RAISE NOTICE '   Admin CMS: lesson_drafts, quiz_drafts, admin_activity_log';
  RAISE NOTICE '   PWA: push_subscriptions';
  RAISE NOTICE '   Functions: toggle_upvote(), search_lessons()';
  RAISE NOTICE '   Views: community_health';
END $$;
