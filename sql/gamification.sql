-- ============================================================
-- FinanceHub — Gamification Schema
-- gamification.sql
-- Run AFTER: phase1_migration.sql
-- Tables: user_xp_log · badges · user_badges · weekly_xp_log
-- Functions: add_weekly_xp · generate_certificate · increment_xp
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── XP Log ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_xp_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  xp_amount   INT  NOT NULL DEFAULT 0,
  action      TEXT NOT NULL DEFAULT 'lesson',
  description TEXT,
  lesson_id   UUID REFERENCES lessons(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure schema evolution if user_xp_log was created in earlier migrations
ALTER TABLE user_xp_log
  ADD COLUMN IF NOT EXISTS action      TEXT DEFAULT 'lesson',
  ADD COLUMN IF NOT EXISTS reason      TEXT DEFAULT 'lesson',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS lesson_id   UUID REFERENCES lessons(id) ON DELETE SET NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_xp_log' AND column_name = 'reason' AND is_nullable = 'NO') THEN
    ALTER TABLE user_xp_log ALTER COLUMN reason DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_xp_log' AND column_name = 'action' AND is_nullable = 'NO') THEN
    ALTER TABLE user_xp_log ALTER COLUMN action DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_xp_log' AND column_name = 'reason') THEN
    UPDATE user_xp_log SET action = COALESCE(action, reason) WHERE action IS NULL;
    UPDATE user_xp_log SET reason = COALESCE(reason, action) WHERE reason IS NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_xp_log_user     ON user_xp_log(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_log_created  ON user_xp_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_log_action   ON user_xp_log(action);

-- ── Badges ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT,
  title       TEXT,
  description TEXT NOT NULL DEFAULT '',
  icon_emoji  TEXT NOT NULL DEFAULT '🏅',
  category    TEXT NOT NULL DEFAULT 'achievement',
  threshold   INT  NOT NULL DEFAULT 1,
  xp_reward   INT  NOT NULL DEFAULT 50,
  is_active   BOOL NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure schema evolution if badges was created in earlier migrations
ALTER TABLE badges
  ADD COLUMN IF NOT EXISTS name        TEXT,
  ADD COLUMN IF NOT EXISTS title       TEXT,
  ADD COLUMN IF NOT EXISTS icon_emoji  TEXT DEFAULT '🏅',
  ADD COLUMN IF NOT EXISTS icon        TEXT DEFAULT '🏅',
  ADD COLUMN IF NOT EXISTS category    TEXT DEFAULT 'achievement',
  ADD COLUMN IF NOT EXISTS threshold   INT  DEFAULT 1,
  ADD COLUMN IF NOT EXISTS xp_reward   INT  DEFAULT 50,
  ADD COLUMN IF NOT EXISTS is_active   BOOL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS created_at  TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'title' AND is_nullable = 'NO') THEN
    ALTER TABLE badges ALTER COLUMN title DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'name' AND is_nullable = 'NO') THEN
    ALTER TABLE badges ALTER COLUMN name DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'title') THEN
    UPDATE badges SET name = COALESCE(name, title) WHERE name IS NULL;
    UPDATE badges SET title = COALESCE(title, name) WHERE title IS NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'icon') THEN
    UPDATE badges SET icon_emoji = COALESCE(icon_emoji, icon) WHERE icon_emoji IS NULL;
    UPDATE badges SET icon = COALESCE(icon, icon_emoji) WHERE icon IS NULL;
  END IF;
END $$;

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
INSERT INTO badges (slug, name, title, description, icon_emoji, category, threshold, xp_reward)
VALUES
  ('first-lesson',     'First Step', 'First Step',           'Complete your first lesson',                                         '🎯', 'completion', 1,    25),
  ('streak-7',         'Week Warrior', 'Week Warrior',          '7-day learning streak',                                              '🔥', 'streak',     7,    50),
  ('streak-30',        'Monthly Master', 'Monthly Master',        '30-day learning streak',                                             '🔥', 'streak',     30,   200),
  ('streak-100',       'Century Streak', 'Century Streak',        '100-day learning streak',                                            '💯', 'streak',     100,  500),
  ('lessons-10',       'Getting Serious', 'Getting Serious',       'Complete 10 lessons',                                                '📚', 'completion', 10,   50),
  ('lessons-50',       'Half Century', 'Half Century',          'Complete 50 lessons',                                                '🏅', 'completion', 50,   150),
  ('lessons-100',      'Centurion', 'Centurion',             'Complete 100 lessons',                                               '🏆', 'completion', 100,  300),
  ('quiz-perfect',     'Perfect Score', 'Perfect Score',         'Score 100% on any quiz',                                             '💎', 'quiz',       100,  75),
  ('quiz-10',          'Quiz Champion', 'Quiz Champion',         'Complete 10 quizzes',                                                '🎓', 'quiz',       10,   100),
  ('first-track',      'Track Complete', 'Track Complete',        'Complete all lessons in one track',                                  '🗺️', 'completion', 1,    500),
  ('ai-10',            'AI Explorer', 'AI Explorer',           'Ask the AI Mentor 10 questions',                                     '🤖', 'special',    10,   50),
  ('community-answer', 'Helpful Member', 'Helpful Member',        'Answer a community question',                                        '💬', 'community',  1,    30),
  ('hindi-learner',    'Hindi Learner', 'Hindi Learner',         'Complete 5 Hindi lessons',                                           '🇮🇳', 'special',    5,    75),
  ('silver-league',    'Silver League', 'Silver League',         'Reach Silver league',                                                '🥈', 'special',    500,  0),
  ('gold-league',      'Gold League', 'Gold League',           'Reach Gold league',                                                  '🥇', 'special',    2000, 0),
  ('diamond-league',   'Diamond League', 'Diamond League',        'Reach Diamond league',                                               '💎', 'special',    5000, 0),
  ('master-league',    'Master', 'Master',                'Reach Master league',                                                '🏆', 'special',    10000,0),
  ('note-taker',       'Note Taker', 'Note Taker',            'Write 10 lesson notes',                                              '📝', 'special',    10,   50),
  ('pro-member',       'Pro Member', 'Pro Member',            'Upgrade to Pro plan',                                                '⭐', 'special',    1,    200),
  ('early-adopter',    'Early Adopter', 'Early Adopter',         'Joined FinanceHub in its first year',                               '🌟', 'special',    1,    100)
ON CONFLICT (slug) DO NOTHING;

DO $$
BEGIN
  RAISE NOTICE '✅ Gamification schema complete';
  RAISE NOTICE '   Tables: user_xp_log, badges, user_badges, weekly_xp_log, leaderboard_weeks';
  RAISE NOTICE '   Functions: add_weekly_xp, generate_certificate, increment_xp';
  RAISE NOTICE '   Badges seeded: 20 badges';
END $$;

-- ─────────────────────────────────────────────────────────────
-- ADVANCED GAMIFICATION (SEASONS, MISSIONS, DAILY CHALLENGES)
-- ─────────────────────────────────────────────────────────────

-- TABLE 1: Daily challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date           DATE NOT NULL DEFAULT CURRENT_DATE,
  challenge_type TEXT NOT NULL,
  title          TEXT NOT NULL,
  description    TEXT NOT NULL,
  xp_reward      INT DEFAULT 50,
  lesson_id      UUID REFERENCES lessons(id) ON DELETE SET NULL,
  quiz_id        UUID REFERENCES quizzes(id) ON DELETE SET NULL,
  target_count   INT DEFAULT 1,
  is_active      BOOL DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, challenge_type)
);

-- TABLE 2: User daily challenge completions
CREATE TABLE IF NOT EXISTS user_daily_challenges (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  xp_earned    INT DEFAULT 0,
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE user_daily_challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "daily_ch_own" ON user_daily_challenges;
CREATE POLICY "daily_ch_own" ON user_daily_challenges
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- TABLE 3: Weekly missions
CREATE TABLE IF NOT EXISTS weekly_missions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_start    DATE NOT NULL,
  theme         TEXT NOT NULL,
  description   TEXT NOT NULL,
  missions      JSONB NOT NULL,
  xp_multiplier DECIMAL(3,1) DEFAULT 1.5,
  is_active     BOOL DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_start)
);

-- TABLE 4: User weekly mission progress
CREATE TABLE IF NOT EXISTS user_weekly_missions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mission_id   UUID REFERENCES weekly_missions(id) ON DELETE CASCADE,
  progress     JSONB DEFAULT '{}',
  completed    BOOL DEFAULT FALSE,
  xp_earned    INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, mission_id)
);

ALTER TABLE user_weekly_missions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "weekly_own" ON user_weekly_missions;
CREATE POLICY "weekly_own" ON user_weekly_missions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- TABLE 5: Seasons
CREATE TABLE IF NOT EXISTS seasons (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_number INT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  theme         TEXT,
  starts_at     TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ NOT NULL,
  is_active     BOOL DEFAULT FALSE,
  rewards       JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 6: User season stats
CREATE TABLE IF NOT EXISTS user_season_stats (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  season_id     UUID REFERENCES seasons(id) ON DELETE CASCADE,
  season_xp     INT DEFAULT 0,
  rank          TEXT DEFAULT 'Bronze',
  lessons_done  INT DEFAULT 0,
  quizzes_done  INT DEFAULT 0,
  streak_best   INT DEFAULT 0,
  UNIQUE(user_id, season_id)
);

ALTER TABLE user_season_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "season_stats_own" ON user_season_stats;
CREATE POLICY "season_stats_own" ON user_season_stats
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- TABLE 7: Leaderboard snapshots (cached daily)
CREATE TABLE IF NOT EXISTS leaderboard_cache (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scope       TEXT NOT NULL,
  period_key  TEXT NOT NULL,
  entries     JSONB NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(scope, period_key)
);

-- RLS FOR ADVANCED GAMIFICATION TABLES
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "daily_challenges_read" ON daily_challenges;
CREATE POLICY "daily_challenges_read" ON daily_challenges FOR SELECT USING (true);

ALTER TABLE weekly_missions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "weekly_missions_read" ON weekly_missions;
CREATE POLICY "weekly_missions_read" ON weekly_missions FOR SELECT USING (true);

ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "seasons_read" ON seasons;
CREATE POLICY "seasons_read" ON seasons FOR SELECT USING (true);

ALTER TABLE leaderboard_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "leaderboard_cache_read" ON leaderboard_cache;
CREATE POLICY "leaderboard_cache_read" ON leaderboard_cache FOR SELECT USING (true);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(date);
CREATE INDEX IF NOT EXISTS idx_user_daily_ch_user ON user_daily_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_weekly_missions_user ON user_weekly_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_season_stats_user ON user_season_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_season_stats_xp ON user_season_stats(season_xp DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_scope ON leaderboard_cache(scope, period_key);

-- FUNCTION 1: Get today's challenges for a user
CREATE OR REPLACE FUNCTION get_daily_challenges(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenges JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', dc.id,
      'title', dc.title,
      'description', dc.description,
      'type', dc.challenge_type,
      'xp_reward', dc.xp_reward,
      'completed', (udc.id IS NOT NULL),
      'lesson_id', dc.lesson_id,
      'quiz_id', dc.quiz_id
    )
    ORDER BY dc.challenge_type
  )
  INTO v_challenges
  FROM daily_challenges dc
  LEFT JOIN user_daily_challenges udc
    ON udc.challenge_id = dc.id
   AND udc.user_id = p_user_id
  WHERE dc.date = CURRENT_DATE
    AND dc.is_active = TRUE;

  RETURN COALESCE(v_challenges, '[]'::JSONB);
END;
$$;

-- FUNCTION 2: Complete a daily challenge
CREATE OR REPLACE FUNCTION complete_daily_challenge(
  p_user_id UUID,
  p_challenge_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge daily_challenges%ROWTYPE;
  v_xp INT;
BEGIN
  SELECT *
  INTO v_challenge
  FROM daily_challenges
  WHERE id = p_challenge_id
    AND date = CURRENT_DATE
    AND is_active = TRUE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Challenge not found');
  END IF;

  IF EXISTS (
    SELECT 1
    FROM user_daily_challenges
    WHERE user_id = p_user_id
      AND challenge_id = p_challenge_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Already completed');
  END IF;

  v_xp := v_challenge.xp_reward;

  INSERT INTO user_daily_challenges (user_id, challenge_id, xp_earned)
  VALUES (p_user_id, p_challenge_id, v_xp);

  UPDATE profiles
  SET xp_total = xp_total + v_xp
  WHERE id = p_user_id;

  INSERT INTO user_xp_log (user_id, xp_amount, reason)
  VALUES (p_user_id, v_xp, 'daily_challenge');

  UPDATE user_season_stats uss
  SET season_xp = season_xp + v_xp,
      rank = get_season_rank(season_xp + v_xp)
  FROM seasons s
  WHERE s.is_active = TRUE
    AND uss.season_id = s.id
    AND uss.user_id = p_user_id;

  RETURN jsonb_build_object('success', true, 'xp_earned', v_xp);
END;
$$;

-- FUNCTION 3: Update season rank based on XP
CREATE OR REPLACE FUNCTION get_season_rank(p_season_xp INT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN CASE
    WHEN p_season_xp >= 10000 THEN 'Diamond'
    WHEN p_season_xp >= 5000 THEN 'Platinum'
    WHEN p_season_xp >= 2000 THEN 'Gold'
    WHEN p_season_xp >= 500 THEN 'Silver'
    ELSE 'Bronze'
  END;
END;
$$;

-- FUNCTION 4: Get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(
  p_scope TEXT DEFAULT 'global',
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  rank INT,
  user_id UUID,
  display_name TEXT,
  xp_total INT,
  streak_current INT,
  badge_count INT,
  role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_scope = 'weekly' THEN
    RETURN QUERY
    SELECT
      ROW_NUMBER() OVER (ORDER BY SUM(xl.xp_amount) DESC)::INT,
      p.id,
      p.full_name,
      p.xp_total,
      p.streak_current,
      (SELECT COUNT(*)::INT FROM user_badges ub WHERE ub.user_id = p.id),
      p.role::TEXT
    FROM profiles p
    JOIN user_xp_log xl ON xl.user_id = p.id
    WHERE xl.created_at >= DATE_TRUNC('week', NOW())
    GROUP BY p.id, p.full_name, p.xp_total, p.streak_current, p.role
    ORDER BY SUM(xl.xp_amount) DESC
    LIMIT p_limit;
  ELSE
    RETURN QUERY
    SELECT
      ROW_NUMBER() OVER (ORDER BY p.xp_total DESC)::INT,
      p.id,
      p.full_name,
      p.xp_total,
      p.streak_current,
      (SELECT COUNT(*)::INT FROM user_badges ub WHERE ub.user_id = p.id),
      p.role::TEXT
    FROM profiles p
    WHERE p.xp_total > 0
    ORDER BY p.xp_total DESC
    LIMIT p_limit;
  END IF;
END;
$$;

-- SEED: Season 1
INSERT INTO seasons (season_number, title, theme, starts_at, ends_at, is_active, rewards)
VALUES (
  1,
  'Foundation Season',
  'Build your financial foundation',
  NOW(),
  NOW() + INTERVAL '90 days',
  TRUE,
  '{
    "ranks": [
      {"name": "Bronze", "min_xp": 0, "badge": "bronze-pioneer"},
      {"name": "Silver", "min_xp": 500, "badge": "silver-learner"},
      {"name": "Gold", "min_xp": 2000, "badge": "gold-scholar"},
      {"name": "Platinum", "min_xp": 5000, "badge": "platinum-expert"},
      {"name": "Diamond", "min_xp": 10000, "badge": "diamond-master"}
    ]
  }'::JSONB
)
ON CONFLICT (season_number) DO NOTHING;

-- SEED: Daily challenges for today
INSERT INTO daily_challenges (date, challenge_type, title, description, xp_reward, target_count)
VALUES
  (CURRENT_DATE, 'lesson', 'Daily Read', 'Complete any lesson today to earn bonus XP', 50, 1),
  (CURRENT_DATE, 'quiz', 'Quiz Champion', 'Pass any quiz with a score of 70% or higher', 75, 1),
  (CURRENT_DATE, 'streak', 'Streak Keeper', 'Log in and complete one activity to keep your streak alive', 25, 1),
  (CURRENT_DATE, 'simulator', 'Finance Lab', 'Use any Finance Lab simulator today', 40, 1)
ON CONFLICT (date, challenge_type) DO NOTHING;

-- SEED: This week's mission
INSERT INTO weekly_missions (week_start, theme, description, missions, xp_multiplier)
VALUES (
  DATE_TRUNC('week', CURRENT_DATE)::DATE,
  'Personal Finance Week',
  'Master the fundamentals of personal finance this week',
  '[
    {"id": "m1", "title": "Complete 3 Personal Finance lessons", "target": 3, "type": "lessons", "track": "personal-finance", "xp": 150},
    {"id": "m2", "title": "Pass 2 quizzes with 80%+", "target": 2, "type": "quiz_pass", "min_score": 80, "xp": 100},
    {"id": "m3", "title": "Try the SIP Calculator", "target": 1, "type": "simulator", "sim_id": "sip", "xp": 75},
    {"id": "m4", "title": "Maintain 5-day streak", "target": 5, "type": "streak", "xp": 200}
  ]'::JSONB,
  1.5
)
ON CONFLICT (week_start) DO NOTHING;