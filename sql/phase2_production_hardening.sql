-- ============================================================
-- FinanceHub - Phase 2 Production Hardening
-- Optional Supabase SQL for durable rate limits, cron logs,
-- security audit logs, and performance indexes.
--
-- Run after:
-- 1. Base schema
-- 2. Seed SQL
-- 3. sql/phase1_critical_fixes.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. Durable API rate-limit bucket store
-- The app currently uses memory-based rate limiting for MVP.
-- This table/function is ready when you switch to DB-backed limits.
-- ============================================================
CREATE TABLE IF NOT EXISTS api_rate_limits (
  key TEXT PRIMARY KEY,
  count INT NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  window_secs INT NOT NULL,
  reset_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_api_rate_limits" ON api_rate_limits;
CREATE POLICY "service_role_api_rate_limits"
ON api_rate_limits
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION check_rate_limit(
  p_key TEXT,
  p_limit INT,
  p_window_secs INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_row api_rate_limits%ROWTYPE;
  v_remaining INT;
BEGIN
  IF p_key IS NULL OR LENGTH(TRIM(p_key)) = 0 THEN
    RETURN jsonb_build_object(
      'allowed', FALSE,
      'remaining', 0,
      'error', 'missing_key'
    );
  END IF;

  INSERT INTO api_rate_limits (key, count, window_start, window_secs, reset_at, updated_at)
  VALUES (p_key, 1, v_now, p_window_secs, v_now + (p_window_secs || ' seconds')::INTERVAL, v_now)
  ON CONFLICT (key)
  DO UPDATE SET
    count = CASE
      WHEN api_rate_limits.reset_at <= v_now THEN 1
      ELSE api_rate_limits.count + 1
    END,
    window_start = CASE
      WHEN api_rate_limits.reset_at <= v_now THEN v_now
      ELSE api_rate_limits.window_start
    END,
    window_secs = p_window_secs,
    reset_at = CASE
      WHEN api_rate_limits.reset_at <= v_now THEN v_now + (p_window_secs || ' seconds')::INTERVAL
      ELSE api_rate_limits.reset_at
    END,
    updated_at = v_now
  RETURNING * INTO v_row;

  v_remaining := GREATEST(p_limit - v_row.count, 0);

  RETURN jsonb_build_object(
    'allowed', v_row.count <= p_limit,
    'count', v_row.count,
    'remaining', v_remaining,
    'reset_at', v_row.reset_at
  );
END;
$$;

REVOKE ALL ON FUNCTION check_rate_limit(TEXT, INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, INT, INT) TO service_role;

-- ============================================================
-- 2. Cron run logging
-- Useful for verifying Vercel cron health in production.
-- ============================================================
CREATE TABLE IF NOT EXISTS cron_run_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  details JSONB NOT NULL DEFAULT '{}'::JSONB,
  ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE cron_run_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_cron_run_logs" ON cron_run_logs;
CREATE POLICY "service_role_cron_run_logs"
ON cron_run_logs
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION log_cron_run(
  p_job_name TEXT,
  p_status TEXT,
  p_details JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO cron_run_logs (job_name, status, details)
  VALUES (p_job_name, p_status, COALESCE(p_details, '{}'::JSONB))
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION log_cron_run(TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION log_cron_run(TEXT, TEXT, JSONB) TO service_role;

-- ============================================================
-- 3. Security audit events
-- Store important backend security events without exposing them
-- to normal app users.
-- ============================================================
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_security_audit_logs" ON security_audit_logs;
CREATE POLICY "service_role_security_audit_logs"
ON security_audit_logs
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id UUID,
  p_event TEXT,
  p_ip TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO security_audit_logs (user_id, event, ip, user_agent, metadata)
  VALUES (p_user_id, p_event, p_ip, p_user_agent, COALESCE(p_metadata, '{}'::JSONB))
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION log_security_event(UUID, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION log_security_event(UUID, TEXT, TEXT, TEXT, JSONB) TO service_role;

-- ============================================================
-- 4. Production performance indexes
-- These support admin analytics, search, cron checks, and
-- dashboard/profile queries as the dataset grows.
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role_created_at ON profiles(role, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_streak_active ON profiles(last_active_date, streak_current);

CREATE INDEX IF NOT EXISTS idx_tracks_slug_active ON tracks(slug, is_active);
CREATE INDEX IF NOT EXISTS idx_levels_track_slug ON levels(track_id, slug);
CREATE INDEX IF NOT EXISTS idx_levels_track_order ON levels(track_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_slug_published ON lessons(slug, is_published);
CREATE INDEX IF NOT EXISTS idx_lessons_level_order ON lessons(level_id, order_index);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_xp_log_created_at ON user_xp_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_xp_log_reason ON user_xp_log(reason);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_created ON ai_conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_plan ON subscriptions(status, plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_reset_at ON api_rate_limits(reset_at);
CREATE INDEX IF NOT EXISTS idx_cron_run_logs_job_ran_at ON cron_run_logs(job_name, ran_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_event_created ON security_audit_logs(event, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_created ON security_audit_logs(user_id, created_at DESC);

-- ============================================================
-- 5. Cleanup helper for old operational logs
-- Suggested cron: run monthly once traffic grows.
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_operational_logs(
  p_keep_days INT DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rate_deleted INT := 0;
  v_cron_deleted INT := 0;
  v_audit_deleted INT := 0;
BEGIN
  DELETE FROM api_rate_limits
  WHERE reset_at < NOW() - (p_keep_days || ' days')::INTERVAL;
  GET DIAGNOSTICS v_rate_deleted = ROW_COUNT;

  DELETE FROM cron_run_logs
  WHERE ran_at < NOW() - (p_keep_days || ' days')::INTERVAL;
  GET DIAGNOSTICS v_cron_deleted = ROW_COUNT;

  DELETE FROM security_audit_logs
  WHERE created_at < NOW() - (p_keep_days || ' days')::INTERVAL;
  GET DIAGNOSTICS v_audit_deleted = ROW_COUNT;

  RETURN jsonb_build_object(
    'api_rate_limits_deleted', v_rate_deleted,
    'cron_logs_deleted', v_cron_deleted,
    'security_logs_deleted', v_audit_deleted
  );
END;
$$;

REVOKE ALL ON FUNCTION cleanup_operational_logs(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION cleanup_operational_logs(INT) TO service_role;

-- ============================================================
-- Done
-- ============================================================
