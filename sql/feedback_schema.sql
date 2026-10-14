-- ============================================================
-- FinanceHub — Feedback Schema
-- feedback_schema.sql
-- Run AFTER: supabase_schema_safe.sql
-- Creates the feedback table used by /api/feedback
-- ============================================================

CREATE TABLE IF NOT EXISTS feedback (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID    REFERENCES profiles(id) ON DELETE SET NULL,  -- null for anonymous
  type        TEXT    NOT NULL DEFAULT 'other',  -- rating|bug|feature|question|content|other
  rating      INT     CHECK (rating BETWEEN 1 AND 5),
  page        TEXT,           -- which page they were on
  message     TEXT    NOT NULL CHECK (length(message) > 0 AND length(message) <= 1000),
  email       TEXT,           -- optional contact email (may differ from account email)
  url         TEXT,           -- full URL path at time of submission
  status      TEXT    NOT NULL DEFAULT 'new',  -- new|read|replied|resolved
  admin_note  TEXT,           -- internal note from admin
  ip_hash     TEXT,           -- hashed IP for spam detection (never store raw IP)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_type      ON feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_status    ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created   ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_user      ON feedback(user_id);

-- RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous feedback allowed)
DROP POLICY IF EXISTS "Anyone can submit feedback" ON feedback;
CREATE POLICY "Anyone can submit feedback"
  ON feedback FOR INSERT
  WITH CHECK (
    length(message) > 0 AND
    length(message) <= 1000
  );

-- Only admins can read all feedback
DROP POLICY IF EXISTS "Admins can read all feedback" ON feedback;
CREATE POLICY "Admins can read all feedback"
  ON feedback FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND email = ANY(
        string_to_array(current_setting('app.admin_emails', TRUE), ',')
      )
    )
  );

-- Admins can update status and notes
DROP POLICY IF EXISTS "Admins can update feedback" ON feedback;
CREATE POLICY "Admins can update feedback"
  ON feedback FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND email = ANY(
        string_to_array(current_setting('app.admin_emails', TRUE), ',')
      )
    )
  );

-- Users can see their own feedback
DROP POLICY IF EXISTS "Users see own feedback" ON feedback;
CREATE POLICY "Users see own feedback"
  ON feedback FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_feedback_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS feedback_updated_at ON feedback;
CREATE TRIGGER feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW EXECUTE FUNCTION update_feedback_timestamp();

-- Analytics view for admin
CREATE OR REPLACE VIEW feedback_summary AS
SELECT
  DATE_TRUNC('day', created_at)::DATE                              AS day,
  COUNT(*)                                                          AS total,
  COUNT(*) FILTER (WHERE type = 'bug')                             AS bugs,
  COUNT(*) FILTER (WHERE type = 'feature')                         AS features,
  COUNT(*) FILTER (WHERE type = 'rating')                          AS ratings,
  COUNT(*) FILTER (WHERE type = 'question')                        AS questions,
  ROUND(AVG(rating) FILTER (WHERE rating IS NOT NULL), 1)          AS avg_rating,
  COUNT(*) FILTER (WHERE status = 'new')                           AS unread
FROM feedback
GROUP BY DATE_TRUNC('day', created_at)::DATE
ORDER BY day DESC;

DO $$
BEGIN
  RAISE NOTICE '✅ Feedback schema complete';
  RAISE NOTICE '   Table: feedback';
  RAISE NOTICE '   View: feedback_summary';
  RAISE NOTICE '   RLS: anonymous insert, admin read/update, user own-read';
END $$;
