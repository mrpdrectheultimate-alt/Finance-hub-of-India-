-- ============================================================
-- FinanceHub — Phase 6 SQL Migration
-- Email Sequences · Weekly Leagues · Certificate Verification
-- Run AFTER phase5_migration.sql
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. EMAIL SEQUENCES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_sequences (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL UNIQUE,
  description  TEXT,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_sequence_steps (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sequence_id  UUID NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
  step_number  INT NOT NULL,
  delay_hours  INT NOT NULL DEFAULT 0,
  subject      TEXT NOT NULL,
  template_key TEXT NOT NULL,
  condition    TEXT,  -- e.g. 'lessons_completed < 1', 'is_pro = false'
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (sequence_id, step_number)
);

CREATE TABLE IF NOT EXISTS user_email_sequence_state (
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sequence_id  UUID NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
  current_step INT DEFAULT 0,
  enrolled_at  TIMESTAMPTZ DEFAULT NOW(),
  last_sent_at TIMESTAMPTZ,
  next_send_at TIMESTAMPTZ,
  completed    BOOLEAN DEFAULT FALSE,
  unsubscribed BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (user_id, sequence_id)
);

CREATE TABLE IF NOT EXISTS email_sends (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email        TEXT NOT NULL,
  sequence_id  UUID REFERENCES email_sequences(id),
  step_id      UUID REFERENCES email_sequence_steps(id),
  subject      TEXT NOT NULL,
  resend_id    TEXT,
  status       TEXT DEFAULT 'sent' CHECK (status IN ('sent','delivered','opened','clicked','bounced','failed')),
  sent_at      TIMESTAMPTZ DEFAULT NOW(),
  opened_at    TIMESTAMPTZ,
  clicked_at   TIMESTAMPTZ
);

ALTER TABLE email_sequences        ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequence_steps   ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_email_sequence_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends            ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_seq_service"   ON email_sequences            FOR ALL USING (auth.role()='service_role');
CREATE POLICY "email_steps_service" ON email_sequence_steps       FOR ALL USING (auth.role()='service_role');
CREATE POLICY "email_state_own"     ON user_email_sequence_state  FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "email_sends_service" ON email_sends                FOR ALL USING (auth.role()='service_role');
CREATE POLICY "email_sends_own"     ON email_sends FOR SELECT      USING (auth.uid()=user_id);

CREATE INDEX IF NOT EXISTS idx_email_state_next
  ON user_email_sequence_state (next_send_at, completed, unsubscribed)
  WHERE completed=FALSE AND unsubscribed=FALSE;

-- ─────────────────────────────────────────────────────────────
-- 2. SEED: EMAIL SEQUENCES
-- ─────────────────────────────────────────────────────────────
INSERT INTO email_sequences (id, name, description) VALUES
  ('11111111-0001-0001-0001-000000000001', 'welcome_sequence',   'Onboarding emails for new users (7 days)'),
  ('11111111-0001-0001-0001-000000000002', 'streak_reminder',    'Daily streak reminder when user has not visited'),
  ('11111111-0001-0001-0001-000000000003', 'win_back_7d',        'Re-engagement for users inactive 7+ days'),
  ('11111111-0001-0001-0001-000000000004', 'upgrade_nurture',    'Nurture free users toward Pro upgrade'),
  ('11111111-0001-0001-0001-000000000005', 'certificate_series', 'Celebrate track completion and upsell next track')
ON CONFLICT (name) DO NOTHING;

-- Welcome sequence steps
INSERT INTO email_sequence_steps (sequence_id, step_number, delay_hours, subject, template_key)
VALUES
  ('11111111-0001-0001-0001-000000000001', 1,  0,   'Welcome to FinanceHub 📚 — Your first lesson awaits',           'welcome_day0'),
  ('11111111-0001-0001-0001-000000000001', 2,  24,  'Day 2: The one money rule that changes everything',              'welcome_day1'),
  ('11111111-0001-0001-0001-000000000001', 3,  72,  'Day 3: Have you started yet? Here is your personalised path',   'welcome_day3'),
  ('11111111-0001-0001-0001-000000000001', 4,  120, 'Day 5: 5 Indian finance mistakes to avoid in your 20s-30s',     'welcome_day5'),
  ('11111111-0001-0001-0001-000000000001', 5,  168, 'Day 7: Your first week summary + what is next',                  'welcome_day7')
ON CONFLICT DO NOTHING;

-- Streak reminder steps
INSERT INTO email_sequence_steps (sequence_id, step_number, delay_hours, subject, template_key, condition)
VALUES
  ('11111111-0001-0001-0001-000000000002', 1, 20, '🔥 Your streak is at risk — 1 lesson keeps it alive',       'streak_risk',  'current_streak > 0'),
  ('11111111-0001-0001-0001-000000000002', 2, 20, 'Your {streak} day streak ended. Start a new one today →',   'streak_broken','current_streak = 0')
ON CONFLICT DO NOTHING;

-- Win-back sequence
INSERT INTO email_sequence_steps (sequence_id, step_number, delay_hours, subject, template_key)
VALUES
  ('11111111-0001-0001-0001-000000000003', 1,  168, 'We miss you at FinanceHub 👋 — Here is what you missed',      'winback_7d'),
  ('11111111-0001-0001-0001-000000000003', 2,  336, '14 days away — Your finance knowledge is getting rusty 📉',   'winback_14d'),
  ('11111111-0001-0001-0001-000000000003', 3,  720, 'One month gap — We saved your progress. Come back?',          'winback_30d')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 3. WEEKLY LEADERBOARD LEAGUES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leaderboard_weeks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_start   DATE NOT NULL UNIQUE,
  week_end     DATE NOT NULL,
  is_current   BOOLEAN DEFAULT FALSE,
  total_users  INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weekly_xp_log (
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_id      UUID NOT NULL REFERENCES leaderboard_weeks(id) ON DELETE CASCADE,
  xp_earned    INT DEFAULT 0,
  lessons_done INT DEFAULT 0,
  quizzes_done INT DEFAULT 0,
  streak_days  INT DEFAULT 0,
  league       TEXT DEFAULT 'bronze' CHECK (league IN ('bronze','silver','gold','diamond','master')),
  rank_in_league INT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY  (user_id, week_id)
);

ALTER TABLE leaderboard_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_xp_log     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lb_weeks_public"   ON leaderboard_weeks FOR SELECT USING (TRUE);
CREATE POLICY "lb_weeks_service"  ON leaderboard_weeks FOR ALL   USING (auth.role()='service_role');
CREATE POLICY "weekly_xp_public"  ON weekly_xp_log    FOR SELECT USING (TRUE);
CREATE POLICY "weekly_xp_own"     ON weekly_xp_log    FOR ALL    USING (auth.uid()=user_id);
CREATE POLICY "weekly_xp_service" ON weekly_xp_log    FOR ALL    USING (auth.role()='service_role');

CREATE INDEX IF NOT EXISTS idx_weekly_xp_week_league
  ON weekly_xp_log (week_id, league, xp_earned DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_xp_user
  ON weekly_xp_log (user_id, week_id DESC);

-- Seed current week
INSERT INTO leaderboard_weeks (week_start, week_end, is_current)
VALUES (
  DATE_TRUNC('week', CURRENT_DATE)::DATE,
  (DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '6 days')::DATE,
  TRUE
) ON CONFLICT (week_start) DO UPDATE SET is_current = TRUE;

-- Function: determine league from XP total
CREATE OR REPLACE FUNCTION get_league(p_total_xp INT) RETURNS TEXT AS $$
BEGIN
  IF p_total_xp >= 10000 THEN RETURN 'master';
  ELSIF p_total_xp >= 5000 THEN RETURN 'diamond';
  ELSIF p_total_xp >= 2000 THEN RETURN 'gold';
  ELSIF p_total_xp >= 500 THEN RETURN 'silver';
  ELSE RETURN 'bronze';
  END IF;
END; $$ LANGUAGE plpgsql IMMUTABLE;

-- Function: add weekly XP and update log
CREATE OR REPLACE FUNCTION add_weekly_xp(
  p_user_id UUID,
  p_xp      INT,
  p_type    TEXT DEFAULT 'lesson'  -- 'lesson','quiz','streak'
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_week_id UUID;
  v_total   INT;
BEGIN
  SELECT id INTO v_week_id FROM leaderboard_weeks WHERE is_current = TRUE LIMIT 1;
  IF v_week_id IS NULL THEN RETURN; END IF;

  INSERT INTO weekly_xp_log (user_id, week_id, xp_earned,
    lessons_done, quizzes_done, streak_days, league)
  VALUES (p_user_id, v_week_id, p_xp,
    CASE WHEN p_type='lesson' THEN 1 ELSE 0 END,
    CASE WHEN p_type='quiz'   THEN 1 ELSE 0 END,
    CASE WHEN p_type='streak' THEN 1 ELSE 0 END,
    get_league(p_xp))
  ON CONFLICT (user_id, week_id) DO UPDATE SET
    xp_earned    = weekly_xp_log.xp_earned    + p_xp,
    lessons_done = weekly_xp_log.lessons_done  + CASE WHEN p_type='lesson' THEN 1 ELSE 0 END,
    quizzes_done = weekly_xp_log.quizzes_done  + CASE WHEN p_type='quiz'   THEN 1 ELSE 0 END,
    streak_days  = weekly_xp_log.streak_days   + CASE WHEN p_type='streak' THEN 1 ELSE 0 END,
    updated_at   = NOW();

  -- Update profile total XP
  UPDATE profiles SET
    xp_total   = COALESCE(xp_total, 0) + p_xp,
    updated_at = NOW()
  WHERE id = p_user_id;
END; $$;

-- ─────────────────────────────────────────────────────────────
-- 4. CERTIFICATE VERIFICATION SYSTEM
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_id TEXT NOT NULL UNIQUE,  -- Short code e.g. "FH-2024-A3B9"
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  track_id        UUID REFERENCES tracks(id),
  track_name      TEXT NOT NULL,
  user_name       TEXT NOT NULL,
  issued_at       DATE NOT NULL DEFAULT CURRENT_DATE,
  expires_at      DATE,                  -- NULL = never expires
  skills          TEXT[] DEFAULT '{}',   -- Skills demonstrated
  lesson_count    INT DEFAULT 0,
  quiz_avg_score  NUMERIC DEFAULT 0,
  is_valid        BOOLEAN DEFAULT TRUE,
  revoked_at      TIMESTAMPTZ,
  revoke_reason   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certs_own_read"    ON certificates FOR SELECT USING (auth.uid()=user_id);
CREATE POLICY "certs_public_verify" ON certificates FOR SELECT USING (TRUE);  -- needed for verification page
CREATE POLICY "certs_service_all" ON certificates FOR ALL USING (auth.role()='service_role');

CREATE INDEX IF NOT EXISTS idx_certs_user      ON certificates (user_id, issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_certs_verify_id ON certificates (verification_id);
CREATE INDEX IF NOT EXISTS idx_certs_track     ON certificates (track_id, issued_at DESC);

-- Function: generate certificate on track completion
CREATE OR REPLACE FUNCTION generate_certificate(
  p_user_id   UUID,
  p_track_id  UUID
) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_track_name   TEXT;
  v_user_name    TEXT;
  v_verify_id    TEXT;
  v_lesson_count INT;
  v_quiz_avg     NUMERIC;
  v_skills       TEXT[];
BEGIN
  -- Check if already exists
  IF EXISTS (SELECT 1 FROM certificates WHERE user_id=p_user_id AND track_id=p_track_id AND is_valid=TRUE) THEN
    SELECT verification_id INTO v_verify_id FROM certificates
    WHERE user_id=p_user_id AND track_id=p_track_id AND is_valid=TRUE LIMIT 1;
    RETURN v_verify_id;
  END IF;

  -- Get details
  SELECT title INTO v_track_name FROM tracks WHERE id=p_track_id;
  IF v_track_name IS NULL THEN
    SELECT name INTO v_track_name FROM tracks WHERE id=p_track_id;
  END IF;
  SELECT full_name INTO v_user_name FROM profiles WHERE id=p_user_id;

  -- Count lessons completed in this track
  SELECT COUNT(*) INTO v_lesson_count
  FROM user_progress up
  JOIN lessons l  ON up.lesson_id=l.id
  JOIN levels lv  ON l.level_id=lv.id
  WHERE up.user_id=p_user_id AND lv.track_id=p_track_id AND up.completed=TRUE;

  -- Average quiz score for this track
  SELECT COALESCE(AVG(uqa.score),0) INTO v_quiz_avg
  FROM user_quiz_attempts uqa
  JOIN quizzes q ON uqa.quiz_id=q.id
  JOIN lessons l ON q.lesson_id=l.id
  JOIN levels lv ON l.level_id=lv.id
  WHERE uqa.user_id=p_user_id AND lv.track_id=p_track_id;

  -- Skills by track
  v_skills := CASE v_track_name
    WHEN 'Personal Finance'     THEN ARRAY['Budgeting','Emergency Fund','Tax Planning','Insurance','Retirement Planning']
    WHEN 'Trading & Markets'    THEN ARRAY['Fundamental Analysis','Technical Analysis','Portfolio Management','Risk Management']
    WHEN 'Corporate Finance'    THEN ARRAY['Financial Modeling','Valuation','M&A Basics','Capital Structure']
    WHEN 'Crypto & DeFi'        THEN ARRAY['Blockchain Fundamentals','DeFi Protocols','Crypto Risk Management']
    WHEN 'Technical Analysis'   THEN ARRAY['Chart Reading','Indicator Analysis','Trading Systems','Risk Management']
    WHEN 'Behavioral Finance'   THEN ARRAY['Cognitive Bias Recognition','Behavioral Investing','Decision Frameworks']
    WHEN 'Forex & Currencies'   THEN ARRAY['Currency Markets','Forex Trading','Risk Management','Macro Analysis']
    ELSE ARRAY['Financial Literacy','Investment Fundamentals']
  END;

  -- Generate verification ID: FH-YEAR-XXXXXX
  v_verify_id := 'FH-' || TO_CHAR(CURRENT_DATE,'YYYY') || '-' ||
    UPPER(SUBSTRING(MD5(p_user_id::TEXT || p_track_id::TEXT || NOW()::TEXT) FOR 6));

  INSERT INTO certificates (
    verification_id, user_id, track_id, track_name, user_name,
    skills, lesson_count, quiz_avg_score
  ) VALUES (
    v_verify_id, p_user_id, p_track_id, COALESCE(v_track_name, 'Financial Literacy'), COALESCE(v_user_name, 'Learner'),
    v_skills, v_lesson_count, ROUND(v_quiz_avg, 1)
  );

  -- Award bonus XP
  INSERT INTO user_xp_log (user_id, xp_amount, action, description)
  VALUES (p_user_id, 500, 'track_complete', 'Completed ' || COALESCE(v_track_name, 'Financial Literacy') || ' track');

  UPDATE profiles SET xp_total=COALESCE(xp_total,0)+500 WHERE id=p_user_id;

  RETURN v_verify_id;
END; $$;

-- ─────────────────────────────────────────────────────────────
-- 5. LESSON EXPANSION — 50 more lessons (Phase 6)
-- Additional tables to support richer lesson metadata
-- ─────────────────────────────────────────────────────────────

-- Lesson prerequisites (cross-lesson)
CREATE TABLE IF NOT EXISTS lesson_prerequisites (
  lesson_id    UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  requires_id  UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  is_strict    BOOLEAN DEFAULT FALSE,  -- must complete vs recommended
  PRIMARY KEY  (lesson_id, requires_id)
);

ALTER TABLE lesson_prerequisites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prereqs_public" ON lesson_prerequisites FOR SELECT USING (TRUE);

-- Lesson resources (PDFs, templates, cheat sheets)
CREATE TABLE IF NOT EXISTS lesson_resources (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id    UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('pdf','template','cheatsheet','worksheet','calculator','external')),
  url          TEXT,
  file_size_kb INT,
  is_free      BOOLEAN DEFAULT FALSE,
  download_count INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lesson_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "resources_public" ON lesson_resources FOR SELECT
  USING (is_free = TRUE OR auth.uid() IN (SELECT id FROM profiles WHERE subscription_tier IN ('pro','expert')));
CREATE POLICY "resources_service" ON lesson_resources FOR ALL USING (auth.role()='service_role');

-- ─────────────────────────────────────────────────────────────
-- 6. USER PREFERENCES (dark mode, font, theme)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS theme          TEXT DEFAULT 'light'
    CHECK (theme IN ('light','dark','sepia','high_contrast')),
  ADD COLUMN IF NOT EXISTS font_size      TEXT DEFAULT 'medium'
    CHECK (font_size IN ('small','medium','large','xl')),
  ADD COLUMN IF NOT EXISTS language_pref  TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS email_streak_reminder  BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS email_weekly_digest    BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS email_marketing        BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notification_push      BOOLEAN DEFAULT FALSE;

-- ─────────────────────────────────────────────────────────────
-- 7. PLATFORM METRICS SNAPSHOT (daily cron)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS platform_metrics_daily (
  snapshot_date    DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  total_users      INT DEFAULT 0,
  new_users        INT DEFAULT 0,
  active_users_dau INT DEFAULT 0,
  active_users_wau INT DEFAULT 0,
  active_users_mau INT DEFAULT 0,
  pro_users        INT DEFAULT 0,
  expert_users     INT DEFAULT 0,
  total_completions INT DEFAULT 0,
  completions_today INT DEFAULT 0,
  ai_questions_today INT DEFAULT 0,
  total_notes      INT DEFAULT 0,
  total_revenue_inr NUMERIC DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE platform_metrics_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "metrics_service" ON platform_metrics_daily FOR ALL USING (auth.role()='service_role');

-- ─────────────────────────────────────────────────────────────
-- 8. VERIFY
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_tables  INT;
  v_seqs    INT;
  v_week_id UUID;
BEGIN
  SELECT COUNT(*) INTO v_tables
  FROM information_schema.tables
  WHERE table_schema='public'
    AND table_name IN (
      'email_sequences','email_sequence_steps','user_email_sequence_state',
      'email_sends','leaderboard_weeks','weekly_xp_log',
      'certificates','lesson_prerequisites','lesson_resources',
      'platform_metrics_daily'
    );

  SELECT COUNT(*) INTO v_seqs FROM email_sequences;
  SELECT id       INTO v_week_id FROM leaderboard_weeks WHERE is_current=TRUE LIMIT 1;

  RAISE NOTICE '✅ Phase 6 migration complete!';
  RAISE NOTICE '   New tables: %', v_tables;
  RAISE NOTICE '   Email sequences seeded: %', v_seqs;
  RAISE NOTICE '   Current week ID: %', v_week_id;
END $$;
