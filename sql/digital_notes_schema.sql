-- ============================================================
-- FinanceHub — Digital Notes / Rough Book (Safe & Idempotent)
-- Run AFTER lesson_expansion_phase2.sql
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- TABLE 1: User notes (the rough book)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_notes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL DEFAULT 'Untitled note',
  content       TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist even if user_notes was created in an earlier migration
ALTER TABLE user_notes
  ADD COLUMN IF NOT EXISTS title         TEXT NOT NULL DEFAULT 'Untitled note',
  ADD COLUMN IF NOT EXISTS content       TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS content_html  TEXT,
  ADD COLUMN IF NOT EXISTS note_type     TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS tags          TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS color         TEXT    DEFAULT 'yellow',
  ADD COLUMN IF NOT EXISTS is_pinned     BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_archived   BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS lesson_id     UUID REFERENCES lessons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS lesson_title  TEXT,
  ADD COLUMN IF NOT EXISTS track_slug    TEXT,
  ADD COLUMN IF NOT EXISTS track_icon    TEXT,
  ADD COLUMN IF NOT EXISTS created_at    TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_notes' AND policyname = 'notes_own_all'
  ) THEN
    CREATE POLICY "notes_own_all"
      ON user_notes FOR ALL
      USING  (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- TABLE 2: Note highlights (text highlighted in lessons)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_highlights (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id     UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  selected_text TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist for user_highlights
ALTER TABLE user_highlights
  ADD COLUMN IF NOT EXISTS note_text     TEXT,
  ADD COLUMN IF NOT EXISTS color         TEXT DEFAULT 'yellow',
  ADD COLUMN IF NOT EXISTS position_data JSONB,
  ADD COLUMN IF NOT EXISTS created_at    TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE user_highlights ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_highlights' AND policyname = 'highlights_own_all'
  ) THEN
    CREATE POLICY "highlights_own_all"
      ON user_highlights FOR ALL
      USING  (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- TABLE 3: Formula / key concepts saved by user
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_flashcards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  front         TEXT NOT NULL,
  back          TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist for user_flashcards
ALTER TABLE user_flashcards
  ADD COLUMN IF NOT EXISTS lesson_id     UUID REFERENCES lessons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS track_slug    TEXT,
  ADD COLUMN IF NOT EXISTS difficulty    TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS next_review   DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS review_count  INT  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at    TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE user_flashcards ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_flashcards' AND policyname = 'flashcards_own_all'
  ) THEN
    CREATE POLICY "flashcards_own_all"
      ON user_flashcards FOR ALL
      USING  (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_notes_user_updated
  ON user_notes (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_notes_lesson
  ON user_notes (lesson_id) WHERE lesson_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notes_pinned
  ON user_notes (user_id, is_pinned) WHERE is_pinned = TRUE;

CREATE INDEX IF NOT EXISTS idx_highlights_lesson
  ON user_highlights (lesson_id, user_id);

CREATE INDEX IF NOT EXISTS idx_flashcards_review
  ON user_flashcards (user_id, next_review);

-- ─────────────────────────────────────────────────────────────
-- FUNCTION: Auto-update updated_at
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN 
  NEW.updated_at = NOW(); 
  RETURN NEW; 
END; 
$$;

DROP TRIGGER IF EXISTS notes_updated_at ON user_notes;
CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON user_notes
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ─────────────────────────────────────────────────────────────
-- FUNCTION: Get notes summary for dashboard
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_notes_summary(p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_notes',      COALESCE((SELECT COUNT(*) FROM user_notes WHERE user_id=p_user_id AND is_archived=FALSE), 0),
    'pinned_notes',     COALESCE((SELECT COUNT(*) FROM user_notes WHERE user_id=p_user_id AND is_pinned=TRUE), 0),
    'total_highlights', COALESCE((SELECT COUNT(*) FROM user_highlights WHERE user_id=p_user_id), 0),
    'total_flashcards', COALESCE((SELECT COUNT(*) FROM user_flashcards WHERE user_id=p_user_id), 0),
    'due_flashcards',   COALESCE((SELECT COUNT(*) FROM user_flashcards WHERE user_id=p_user_id AND next_review <= CURRENT_DATE), 0),
    'recent_notes',     COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id',          n.id,
        'title',       n.title,
        'note_type',   n.note_type,
        'color',       n.color,
        'lesson_title',n.lesson_title,
        'track_icon',  n.track_icon,
        'updated_at',  n.updated_at
      ))
      FROM (
        SELECT * FROM user_notes
        WHERE user_id=p_user_id AND is_archived=FALSE
        ORDER BY updated_at DESC LIMIT 5
      ) n
    ), '[]'::jsonb),
    'tags', COALESCE((
      SELECT jsonb_agg(DISTINCT tag)
      FROM user_notes, unnest(tags) AS tag
      WHERE user_id=p_user_id
    ), '[]'::jsonb)
  ) INTO v_result;
  RETURN v_result;
END; $$;
