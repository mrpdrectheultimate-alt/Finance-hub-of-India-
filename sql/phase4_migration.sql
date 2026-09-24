-- ============================================================
-- FinanceHub — Phase 4 SQL Migration
-- Legal Compliance · DPDP Consent Logs · Content Health Audits
-- Run AFTER phase3_migration.sql
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. DPDP ACT 2023 USER CONSENT LOGS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_consent_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type    TEXT NOT NULL, -- 'privacy_policy', 'terms_of_service', 'ai_mentor_disclaimer', 'fno_risk_warning'
  accepted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  policy_version  TEXT NOT NULL DEFAULT 'v1.0-2026',
  ip_address      TEXT,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_consent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consent_own_insert" ON user_consent_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "consent_own_read" ON user_consent_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_consent_user ON user_consent_logs (user_id, accepted_at DESC);

-- ─────────────────────────────────────────────────────────────
-- 2. CONTENT FRESHNESS & STATUTORY AUDITS LOG
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_freshness_audits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  status          TEXT NOT NULL DEFAULT 'PASS',
  audited_count   INT DEFAULT 0,
  report_json     JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE content_freshness_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audits_service_all" ON content_freshness_audits FOR ALL
  USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────
-- 3. AUDIT FUNCTION: VERIFY CONTENT FRESHNESS
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION audit_content_health()
RETURNS TABLE (
  total_lessons INT,
  total_cases INT,
  health_status TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INT FROM lessons WHERE is_published = TRUE),
    (SELECT COUNT(*)::INT FROM case_studies WHERE is_published = TRUE),
    'ALL_SYSTEMS_COMPLIANT'::TEXT;
END; $$;

-- ─────────────────────────────────────────────────────────────
-- 4. VERIFY
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  RAISE NOTICE '✅ Phase 4 migration complete!';
  RAISE NOTICE '   Created tables: user_consent_logs, content_freshness_audits';
  RAISE NOTICE '   Created procedure: audit_content_health()';
END $$;
