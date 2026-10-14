-- ============================================================
-- FinanceHub — Content Freshness Audits Table
-- content_freshness_audits.sql
-- Used by: /api/content-health
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS content_freshness_audits (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  status         TEXT NOT NULL DEFAULT 'PASS',
  audited_count  INT DEFAULT 0,
  report_json    JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_freshness_date ON content_freshness_audits(audit_date DESC);

ALTER TABLE content_freshness_audits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "content_freshness_public_read" ON content_freshness_audits;
CREATE POLICY "content_freshness_public_read" ON content_freshness_audits FOR SELECT USING (TRUE);
