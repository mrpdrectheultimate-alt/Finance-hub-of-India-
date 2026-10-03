-- ============================================================
-- FinanceHub — Gamification Schema
-- gamification.sql
-- Run AFTER: phase1_migration.sql
-- Tables: user_xp_log · badges · user_badges · weekly_xp_log
-- Functions: add_weekly_xp · generate_certificate · increment_xp
-- ============================================================

-- ── XP Log ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_xp_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  xp_amount   INT  NOT NULL DEFAULT 0,
  action      TEXT NOT NULL, -- 'lesson','quiz_pass','quiz_fail','streak','signup','review','simulator','note','subscription_upgrade','streak_milestone'
  description TEXT,
  lesson_id   UUID REFERENCES lessons(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_log_user     ON user_xp_log(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_log_created  ON user_xp_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_log_action   ON user_xp_log(action);

-- ── Badges ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_emoji  TEXT NOT NULL DEFAULT '🏅',
  category    TEXT NOT NULL DEFAULT 'achievement', -- 'streak','completion','quiz','community','special'
  threshold   INT  NOT NULL DEFAULT 1, -- numeric trigger value
  xp_reward   INT  NOT NULL DEFAULT 50,
  is_active   BOOL NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id   UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);

-- ── Weekly XP Log (for leaderboard) ──────────────────────────
CREATE TABLE IF NOT EXISTS weekly_xp_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_id    UUID REFERENCES leaderboard_weeks(id) ON DELETE CASCADE,
  xp_earned  INT  NOT NULL DEFAULT 0,
  xp_type    TEXT NOT NULL DEFAULT 'lesson', -- 'lesson','quiz','streak','review'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weekly_xp_user ON weekly_xp_log(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_xp_week ON weekly_xp_log(week_id);

-- ── Leaderboard weeks table (if not exists) ──────────────────
CREATE TABLE IF NOT EXISTS leaderboard_weeks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start  DATE UNIQUE NOT NULL,
  week_end    DATE NOT NULL,
  is_current  BOOL NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure only one current week
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_current
  ON leaderboard_weeks(is_current) WHERE is_current = TRUE;

-- Create initial week if none exists
INSERT INTO leaderboard_weeks (week_start, week_end, is_current)
SELECT
  date_trunc('week', CURRENT_DATE)::DATE,
  (date_trunc('week', CURRENT_DATE) + INTERVAL '6 days')::DATE,
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM leaderboard_weeks WHERE is_current = TRUE);

-- ── Weekly XP summary view ────────────────────────────────────
CREATE OR REPLACE VIEW weekly_leaderboard AS
SELECT
  wx.user_id,
  p.full_name,
  p.avatar_url,
  p.subscription_tier,
  SUM(wx.xp_earned)                        AS week_xp,
  RANK() OVER (ORDER BY SUM(wx.xp_earned) DESC) AS rank,
  lw.week_start,
  lw.week_end
FROM weekly_xp_log wx
JOIN leaderboard_weeks lw ON wx.week_id = lw.id
JOIN profiles p            ON wx.user_id = p.id
WHERE lw.is_current = TRUE
GROUP BY wx.user_id, p.full_name, p.avatar_url, p.subscription_tier, lw.week_start, lw.week_end;

-- ── Function: add_weekly_xp ───────────────────────────────────
CREATE OR REPLACE FUNCTION add_weekly_xp(
  p_user_id UUID,
  p_xp      INT,
  p_type    TEXT DEFAULT 'lesson'
) RETURNS VOID AS $$
DECLARE
  v_week_id UUID;
BEGIN
  SELECT id INTO v_week_id FROM leaderboard_weeks WHERE is_current = TRUE LIMIT 1;
  IF v_week_id IS NULL THEN RETURN; END IF;

  INSERT INTO weekly_xp_log (user_id, week_id, xp_earned, xp_type)
  VALUES (p_user_id, v_week_id, p_xp, p_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Function: increment_xp (used in complete-lesson route) ────
CREATE OR REPLACE FUNCTION increment_xp(amount INT)
RETURNS INT AS $$
BEGIN
  RETURN amount;
END;
$$ LANGUAGE plpgsql;

-- ── Function: generate_certificate ───────────────────────────
CREATE OR REPLACE FUNCTION generate_certificate(
  p_user_id  UUID,
  p_track_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_verify_id  TEXT;
  v_user_name  TEXT;
  v_track_name TEXT;
  v_lesson_cnt INT;
  v_avg_score  NUMERIC;
  v_exists     BOOLEAN;
BEGIN
  -- Check if certificate already exists
  SELECT EXISTS (
    SELECT 1 FROM certificates
    WHERE user_id = p_user_id AND track_id = p_track_id AND is_valid = TRUE
  ) INTO v_exists;

  IF v_exists THEN
    SELECT verification_id INTO v_verify_id
    FROM certificates WHERE user_id = p_user_id AND track_id = p_track_id AND is_valid = TRUE;
    RETURN v_verify_id;
  END IF;

  -- Get user name
  SELECT COALESCE(full_name, email, 'Learner') INTO v_user_name
  FROM profiles WHERE id = p_user_id;

  -- Get track name
  SELECT name INTO v_track_name FROM tracks WHERE id = p_track_id;

  -- Count completed lessons in track
  SELECT COUNT(*) INTO v_lesson_cnt
  FROM user_progress up
  JOIN lessons l ON up.lesson_id = l.id
  JOIN levels lv  ON l.level_id  = lv.id
  WHERE up.user_id = p_user_id AND lv.track_id = p_track_id AND up.completed = TRUE;

  -- Average quiz score
  SELECT COALESCE(AVG(quiz_score), 0) INTO v_avg_score
  FROM user_progress up
  JOIN lessons l ON up.lesson_id = l.id
  JOIN levels lv  ON l.level_id  = lv.id
  WHERE up.user_id = p_user_id AND lv.track_id = p_track_id AND up.quiz_score IS NOT NULL;

  -- Generate unique verification ID
  v_verify_id := lower(substring(gen_random_uuid()::TEXT, 1, 8)) || '-' ||
                 lower(substring(gen_random_uuid()::TEXT, 1, 8));

  -- Insert certificate
  INSERT INTO certificates (
    user_id, track_id, verification_id,
    user_name, track_name,
    lesson_count, quiz_avg_score,
    is_valid, issued_at
  ) VALUES (
    p_user_id, p_track_id, v_verify_id,
    v_user_name, v_track_name,
    v_lesson_cnt, v_avg_score,
    TRUE, NOW()
  );

  -- Award certificate XP
  INSERT INTO user_xp_log (user_id, xp_amount, action, description)
  VALUES (p_user_id, 500, 'certificate', 'Earned certificate: ' || v_track_name);

  UPDATE profiles
  SET xp_total = xp_total + 500, updated_at = NOW()
  WHERE id = p_user_id;

  RETURN v_verify_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Seed default badges ──────────────────────────────────────
INSERT INTO badges (slug, name, description, icon_emoji, category, threshold, xp_reward)
VALUES
  ('first-lesson',     'First Step',           'Complete your first lesson',                                         '🎯', 'completion', 1,    25),
  ('streak-7',         'Week Warrior',          '7-day learning streak',                                              '🔥', 'streak',     7,    50),
  ('streak-30',        'Monthly Master',        '30-day learning streak',                                             '🔥', 'streak',     30,   200),
  ('streak-100',       'Century Streak',        '100-day learning streak',                                            '💯', 'streak',     100,  500),
  ('lessons-10',       'Getting Serious',       'Complete 10 lessons',                                                '📚', 'completion', 10,   50),
  ('lessons-50',       'Half Century',          'Complete 50 lessons',                                                '🏅', 'completion', 50,   150),
  ('lessons-100',      'Centurion',             'Complete 100 lessons',                                               '🏆', 'completion', 100,  300),
  ('quiz-perfect',     'Perfect Score',         'Score 100% on any quiz',                                             '💎', 'quiz',       100,  75),
  ('quiz-10',          'Quiz Champion',         'Complete 10 quizzes',                                                '🎓', 'quiz',       10,   100),
  ('first-track',      'Track Complete',        'Complete all lessons in one track',                                  '🗺️', 'completion', 1,    500),
  ('ai-10',            'AI Explorer',           'Ask the AI Mentor 10 questions',                                     '🤖', 'special',    10,   50),
  ('community-answer', 'Helpful Member',        'Answer a community question',                                        '💬', 'community',  1,    30),
  ('hindi-learner',    'Hindi Learner',         'Complete 5 Hindi lessons',                                           '🇮🇳', 'special',    5,    75),
  ('silver-league',    'Silver League',         'Reach Silver league',                                                '🥈', 'special',    500,  0),
  ('gold-league',      'Gold League',           'Reach Gold league',                                                  '🥇', 'special',    2000, 0),
  ('diamond-league',   'Diamond League',        'Reach Diamond league',                                               '💎', 'special',    5000, 0),
  ('master-league',    'Master',                'Reach Master league',                                                '🏆', 'special',    10000,0),
  ('note-taker',       'Note Taker',            'Write 10 lesson notes',                                              '📝', 'special',    10,   50),
  ('pro-member',       'Pro Member',            'Upgrade to Pro plan',                                                '⭐', 'special',    1,    200),
  ('early-adopter',    'Early Adopter',         'Joined FinanceHub in its first year',                               '🌟', 'special',    1,    100)
ON CONFLICT (slug) DO NOTHING;

DO $$
BEGIN
  RAISE NOTICE '✅ Gamification schema complete';
  RAISE NOTICE '   Tables: user_xp_log, badges, user_badges, weekly_xp_log, leaderboard_weeks';
  RAISE NOTICE '   Functions: add_weekly_xp, generate_certificate, increment_xp';
  RAISE NOTICE '   Badges seeded: 20 badges';
END $$;
