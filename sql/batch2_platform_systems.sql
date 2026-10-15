-- ============================================================
-- FinanceHub: Batch 2 - Platform Systems & Gamification
-- Combined idempotent migration
-- ============================================================


-- ── START OF gamification.sql ──
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
DROP VIEW IF EXISTS weekly_leaderboard CASCADE;
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
-- ── END OF gamification.sql ──

-- ── START OF community_career.sql ──
-- ============================================================
-- FinanceHub — Community Extensions + Career Schema
-- community_career.sql
-- Run AFTER: phase5_migration.sql
-- Tables: community_reports · career_paths · user_roadmaps
--         community_reactions · featured_answers
-- ============================================================

-- ── Community content reports (moderation) ───────────────────
CREATE TABLE IF NOT EXISTS community_reports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'question' | 'answer'
  content_id   UUID NOT NULL,
  reason       TEXT NOT NULL, -- 'spam','misinformation','inappropriate','off_topic','other'
  details      TEXT,
  status       TEXT NOT NULL DEFAULT 'pending', -- 'pending','reviewed','actioned','dismissed'
  reviewed_by  UUID REFERENCES profiles(id),
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status  ON community_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_content ON community_reports(content_type, content_id);

-- ── Community reactions (upvotes on answers) ─────────────────
CREATE TABLE IF NOT EXISTS community_reactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  answer_id  UUID NOT NULL REFERENCES community_answers(id) ON DELETE CASCADE,
  type       TEXT NOT NULL DEFAULT 'helpful', -- 'helpful','insightful','thanks'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, answer_id)
);

CREATE INDEX IF NOT EXISTS idx_reactions_answer ON community_reactions(answer_id);

-- ── Featured/pinned answers ───────────────────────────────────
ALTER TABLE community_answers
  ADD COLUMN IF NOT EXISTS is_staff_answer BOOL    NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_ai_answer    BOOL    NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS helpful_count   INT     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_pinned       BOOL    NOT NULL DEFAULT FALSE;

-- ── Career paths ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS career_paths (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_emoji  TEXT NOT NULL DEFAULT '💼',
  color_hex   TEXT NOT NULL DEFAULT '#0E6163',
  skills      TEXT[] NOT NULL DEFAULT '{}',
  salary_range TEXT,
  demand_level TEXT NOT NULL DEFAULT 'high', -- 'low','medium','high','very_high'
  required_tracks TEXT[] NOT NULL DEFAULT '{}', -- track slugs
  order_index INT  NOT NULL DEFAULT 0,
  is_published BOOL NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── User roadmaps (personalised learning plans) ───────────────
CREATE TABLE IF NOT EXISTS user_roadmaps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  goal        TEXT NOT NULL,
  target_date DATE,
  track_order TEXT[] NOT NULL DEFAULT '{}', -- ordered track slugs
  is_active   BOOL NOT NULL DEFAULT TRUE,
  progress_pct INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, is_active) -- one active roadmap per user
);

-- ── Seed career paths ─────────────────────────────────────────
INSERT INTO career_paths (slug, title, description, icon_emoji, color_hex, skills, salary_range, demand_level, required_tracks, order_index)
VALUES
  (
    'financial-analyst',
    'Financial Analyst',
    'Analyse financial data, build models, and support investment and business decisions.',
    '📊', '#185FA5',
    ARRAY['Financial modelling','Excel','DCF valuation','Financial statements','Ratio analysis'],
    '₹5L - ₹20L/year', 'very_high',
    ARRAY['personal-finance','corporate-finance','technical-analysis'],
    1
  ),
  (
    'investment-advisor',
    'Investment Advisor / MFD',
    'Guide individuals on mutual funds, insurance and financial planning. AMFI/IRDAI registered.',
    '💰', '#0E6163',
    ARRAY['Mutual funds','Portfolio management','Client advisory','AMFI regulations','Tax planning'],
    '₹3L - ₹25L/year (AUM-based)', 'very_high',
    ARRAY['personal-finance','trading-markets'],
    2
  ),
  (
    'equity-research',
    'Equity Research Analyst',
    'Deep-dive analysis of listed companies — sector reports, earnings models and buy/sell recommendations.',
    '📈', '#553C9A',
    ARRAY['Fundamental analysis','Sector knowledge','Financial modelling','Report writing','Bloomberg'],
    '₹6L - ₹30L/year', 'high',
    ARRAY['trading-markets','corporate-finance','technical-analysis'],
    3
  ),
  (
    'startup-cfo',
    'Startup CFO / Finance Lead',
    'Own the financial function of a startup — cash flow, fundraising, unit economics, investor reporting.',
    '🚀', '#7C3AED',
    ARRAY['Cash flow management','Fundraising','Cap tables','Unit economics','Financial reporting'],
    '₹12L - ₹60L/year', 'high',
    ARRAY['corporate-finance','personal-finance'],
    4
  ),
  (
    'forex-trader',
    'Forex / Currency Trader',
    'Trade currency pairs using technical analysis, macroeconomics and risk management systems.',
    '💱', '#1D4ED8',
    ARRAY['Technical analysis','Currency markets','Risk management','FEMA regulations','MT4/MT5'],
    '₹4L - ₹∞ (performance-based)', 'medium',
    ARRAY['forex-currency','technical-analysis','behavioral-finance'],
    5
  ),
  (
    'crypto-analyst',
    'Crypto / Web3 Analyst',
    'Research blockchain projects, DeFi protocols and digital assets for investment or institutional clients.',
    '₿', '#0891B2',
    ARRAY['Blockchain fundamentals','DeFi protocols','Tokenomics','On-chain analysis','Smart contracts'],
    '₹6L - ₹40L/year', 'high',
    ARRAY['crypto-defi','technical-analysis'],
    6
  ),
  (
    'personal-finance-educator',
    'Finance Educator / Content Creator',
    'Teach finance through YouTube, courses, workshops or writing. Growing rapidly in India.',
    '🎓', '#B45309',
    ARRAY['Finance knowledge','Content creation','Communication','Social media','Curriculum design'],
    '₹2L - ₹unlimited (creator economy)', 'very_high',
    ARRAY['personal-finance','trading-markets','behavioral-finance'],
    7
  ),
  (
    'ca-cfa-aspirant',
    'CA / CFA / FRM Aspirant',
    'Structured preparation for India''s most respected finance credentials.',
    '📝', '#0F766E',
    ARRAY['Accounting standards','Financial analysis','Risk management','Ethics','Exam technique'],
    '₹8L - ₹50L/year (post-qualification)', 'very_high',
    ARRAY['personal-finance','corporate-finance','trading-markets'],
    8
  )
ON CONFLICT (slug) DO NOTHING;

-- ── View: community health dashboard ─────────────────────────
DROP VIEW IF EXISTS community_health CASCADE;
CREATE OR REPLACE VIEW community_health AS
SELECT
  COUNT(*)                                                   AS total_questions,
  COUNT(*) FILTER (WHERE answer_count > 0)                   AS answered_questions,
  COUNT(*) FILTER (WHERE answer_count = 0)                   AS unanswered_questions,
  ROUND(COUNT(*) FILTER (WHERE answer_count > 0)::NUMERIC
        / NULLIF(COUNT(*), 0) * 100, 1)                      AS answer_rate_pct,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS questions_7d,
  (SELECT COUNT(*) FROM community_answers
   WHERE created_at > NOW() - INTERVAL '7 days')             AS answers_7d,
  (SELECT COUNT(*) FROM community_answers)                   AS total_answers
FROM community_questions;

-- ── RLS policies ──────────────────────────────────────────────
ALTER TABLE community_reports    ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roadmaps        ENABLE ROW LEVEL SECURITY;

-- Reports: users can create, admins can read all
CREATE POLICY "Users can create reports"
  ON community_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Reactions: users own their reactions
CREATE POLICY "Users manage own reactions"
  ON community_reactions FOR ALL TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read reactions"
  ON community_reactions FOR SELECT TO anon, authenticated
  USING (TRUE);

-- Roadmaps: private to each user
CREATE POLICY "Users own their roadmaps"
  ON user_roadmaps FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Career paths: public read
ALTER TABLE career_paths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Career paths are public"
  ON career_paths FOR SELECT TO anon, authenticated
  USING (is_published = TRUE);

DO $$
BEGIN
  RAISE NOTICE '✅ Community + Career schema complete';
  RAISE NOTICE '   Tables: community_reports, community_reactions, career_paths, user_roadmaps';
  RAISE NOTICE '   Career paths seeded: 8 paths';
  RAISE NOTICE '   Views: community_health';
END $$;

-- ─────────────────────────────────────────────────────────────
-- LESSON COMMENTS & INTERVIEW QUESTIONS BANK
-- ─────────────────────────────────────────────────────────────

-- TABLE 1: Lesson comments
CREATE TABLE IF NOT EXISTS lesson_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) < 2000),
  parent_id UUID REFERENCES lesson_comments(id) ON DELETE CASCADE,
  upvotes INT DEFAULT 0,
  is_pinned BOOL DEFAULT FALSE,
  is_deleted BOOL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lesson_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "comments_read_all" ON lesson_comments;
DROP POLICY IF EXISTS "comments_own_write" ON lesson_comments;
DROP POLICY IF EXISTS "comments_own_update" ON lesson_comments;
CREATE POLICY "comments_read_all" ON lesson_comments
FOR SELECT
USING (NOT is_deleted);
CREATE POLICY "comments_own_write" ON lesson_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_own_update" ON lesson_comments
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- TABLE 2: Comment upvotes
CREATE TABLE IF NOT EXISTS comment_upvotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES lesson_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

ALTER TABLE comment_upvotes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "upvotes_own" ON comment_upvotes;
CREATE POLICY "upvotes_own" ON comment_upvotes
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- TABLE 3: Finance interview Q&A bank
CREATE TABLE IF NOT EXISTS interview_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium',
  company_type TEXT,
  tags TEXT[],
  is_published BOOL DEFAULT TRUE,
  upvotes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'interview_questions_question_key'
  ) THEN
    ALTER TABLE interview_questions
    ADD CONSTRAINT interview_questions_question_key UNIQUE (question);
  END IF;
END $$;

ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "iq_read" ON interview_questions;
CREATE POLICY "iq_read" ON interview_questions
FOR SELECT
USING (is_published = TRUE);

-- TABLE 4: User saved interview questions
CREATE TABLE IF NOT EXISTS user_saved_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID REFERENCES interview_questions(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

ALTER TABLE user_saved_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "saved_q_own" ON user_saved_questions;
CREATE POLICY "saved_q_own" ON user_saved_questions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_comments_lesson ON lesson_comments(lesson_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON lesson_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_interview_q_cat ON interview_questions(category, difficulty);
CREATE INDEX IF NOT EXISTS idx_interview_q_tags ON interview_questions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_saved_q_user ON user_saved_questions(user_id);

-- FUNCTION: Toggle upvote on a comment
CREATE OR REPLACE FUNCTION toggle_comment_upvote(
  p_user_id UUID,
  p_comment_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existed BOOL;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM comment_upvotes
    WHERE user_id = p_user_id
      AND comment_id = p_comment_id
  )
  INTO v_existed;

  IF v_existed THEN
    DELETE FROM comment_upvotes
    WHERE user_id = p_user_id
      AND comment_id = p_comment_id;

    UPDATE lesson_comments
    SET upvotes = GREATEST(0, upvotes - 1)
    WHERE id = p_comment_id;

    RETURN jsonb_build_object('action', 'removed', 'upvoted', false);
  ELSE
    INSERT INTO comment_upvotes(user_id, comment_id)
    VALUES(p_user_id, p_comment_id);

    UPDATE lesson_comments
    SET upvotes = upvotes + 1
    WHERE id = p_comment_id;

    RETURN jsonb_build_object('action', 'added', 'upvoted', true);
  END IF;
END;
$$;

-- SEED: Interview Questions across categories
INSERT INTO interview_questions (question, answer, category, difficulty, company_type, tags) VALUES
('Walk me through a DCF model.',
'A DCF values a company by projecting its free cash flows over a forecast period, typically 5-10 years, then adding a terminal value representing value beyond the forecast period. Both are discounted back to present value using WACC. Steps: 1) Project revenue and EBIT. 2) Calculate unlevered free cash flow = EBIT(1-tax) + D&A - CapEx - change in working capital. 3) Calculate terminal value using Gordon Growth Model or exit multiple. 4) Discount all cash flows at WACC. 5) Add back cash, subtract debt to get equity value.',
'investment-banking', 'hard', 'bank', ARRAY['dcf', 'valuation', 'technical']),

('What is WACC and how do you calculate it?',
'WACC is the blended cost of a company''s capital, weighted by the proportion of debt and equity. Formula: WACC = (E/V x Re) + (D/V x Rd x (1-Tc)). E is equity market value, D is debt market value, V is E plus D, Re is cost of equity, Rd is cost of debt, and Tc is corporate tax rate. WACC is used as the discount rate in DCF models. A higher WACC means higher risk and lower valuation.',
'investment-banking', 'hard', 'bank', ARRAY['wacc', 'cost-of-capital', 'technical']),

('What are the three main valuation methodologies and when do you use each?',
'1) DCF, or intrinsic value, is best for stable, cash-generative businesses with predictable cash flows. 2) Comparable Company Analysis values a company based on multiples of similar public companies and is fast and market-based. 3) Precedent Transaction Analysis values a company based on multiples paid in similar M&A deals and includes a control premium. Bankers usually use all three to build a valuation range.',
'investment-banking', 'medium', 'bank', ARRAY['valuation', 'dcf', 'comps']),

('What is the difference between enterprise value and equity value?',
'Enterprise value represents the total value of the business to all capital providers. EV = market cap + total debt + preferred equity + minority interest - cash. Equity value represents value to equity holders only. Use EV multiples for metrics available to all capital providers, such as EV/EBITDA. Use equity value multiples for metrics after interest, such as P/E.',
'investment-banking', 'medium', 'bank', ARRAY['ev', 'equity-value', 'valuation']),

('Why would you use EV/EBITDA instead of P/E?',
'EV/EBITDA is preferred when comparing companies with different capital structures, tax rates, or depreciation policies. EBITDA ignores interest, taxes, depreciation, and amortisation, making it more comparable across firms. P/E is better for financial companies and mature companies with similar capital structures. EBITDA can be misleading for companies with large capex needs.',
'investment-banking', 'medium', 'bank', ARRAY['ev-ebitda', 'pe-ratio', 'multiples']),

('How do you build an LBO model?',
'An LBO model determines the purchase price a private equity firm can afford given target returns. Steps: estimate purchase price using entry multiple, define financing mix, build operating forecast and debt schedule, estimate exit enterprise value using exit multiple, subtract remaining debt to get exit equity value, then calculate IRR and MOIC. Key drivers are entry multiple, exit multiple, EBITDA growth, and debt paydown.',
'pe-vc', 'hard', 'vc', ARRAY['lbo', 'private-equity', 'returns']),

('What metrics do VCs use to evaluate early-stage startups?',
'Early-stage VCs focus on team, market size, product differentiation, traction, retention, unit economics, and business model quality. Important metrics include month-over-month growth, retention, NPS, LTV:CAC, CAC payback period, gross margin, and evidence of network effects or switching costs. Early-stage investing is often a bet on the founder as much as the current business.',
'pe-vc', 'medium', 'vc', ARRAY['vc', 'startup-evaluation', 'metrics']),

('What is a cap table and why does it matter in VC?',
'A cap table shows ownership structure: who owns what percentage, at what price, and with what rights. It matters because it determines payouts in exits, dilution in future rounds, option pool impact, liquidation preferences, pro-rata rights, and control. VCs model cap tables to understand whether a future exit can deliver target returns after all preferences.',
'pe-vc', 'medium', 'vc', ARRAY['cap-table', 'equity', 'term-sheet']),

('What is the difference between systematic and discretionary trading?',
'Systematic trading uses predefined rules and algorithms to generate and execute trades. It reduces emotional bias and can be backtested. Discretionary trading relies on a trader''s judgment, incorporating charts, news, fundamentals, and market context. Many modern funds use hybrid approaches: systematic signal generation with discretionary risk management.',
'trading', 'medium', 'hedge-fund', ARRAY['trading', 'systematic', 'discretionary']),

('What is Value at Risk (VaR) and what are its limitations?',
'VaR estimates the maximum loss a portfolio could suffer over a given period at a given confidence level. For example, a 1-day 95% VaR of Rs. 1 crore means daily loss should not exceed Rs. 1 crore with 95% confidence. Limitations: it says little about losses beyond the threshold, assumes distribution stability, can underestimate tail risk, and correlations often rise during crises.',
'trading', 'hard', 'hedge-fund', ARRAY['var', 'risk-management', 'quant']),

('Explain options Greeks and how traders use them.',
'Delta measures option price sensitivity to the underlying. Gamma measures delta sensitivity. Theta measures time decay. Vega measures sensitivity to implied volatility. Rho measures sensitivity to interest rates. Traders use Greeks to hedge risk, understand exposure, and structure option trades around volatility, time, and directional views.',
'trading', 'hard', 'hedge-fund', ARRAY['options', 'greeks', 'derivatives']),

('What is the difference between budgeting and forecasting?',
'A budget is an annual financial plan set at the beginning of the year and used for targets and performance measurement. A forecast is an updated estimate of where results are expected to land based on actual performance. Budgets support accountability, while rolling forecasts support better operating decisions.',
'fpa', 'medium', 'corporate', ARRAY['budgeting', 'forecasting', 'fpa']),

('How do you analyse a company''s working capital?',
'Working capital = current assets - current liabilities. Key metrics include DSO, DIO, DPO, and cash conversion cycle. Rising DSO can indicate collection issues, rising DIO can indicate slow-moving inventory, and falling DPO can signal tighter supplier terms. A shorter cash conversion cycle generally means better cash efficiency.',
'fpa', 'medium', 'corporate', ARRAY['working-capital', 'cash-flow', 'analysis']),

('What is the time value of money?',
'A rupee today is worth more than a rupee tomorrow because today''s rupee can be invested, inflation reduces future purchasing power, and future cash flows carry risk. This idea underpins bond pricing, equity valuation, loan amortisation, capital budgeting, and DCF models. Present Value = Future Value / (1+r)^n.',
'general', 'easy', NULL, ARRAY['time-value', 'fundamentals', 'basics']),

('What is EBITDA and why do analysts use it?',
'EBITDA means earnings before interest, taxes, depreciation, and amortisation. Analysts use it to compare operating performance before financing choices, tax differences, and accounting depreciation policies. It is useful but imperfect because it ignores capex and working capital needs.',
'general', 'easy', NULL, ARRAY['ebitda', 'fundamentals', 'metrics']),

('Explain the concept of diversification.',
'Diversification reduces portfolio risk by combining assets whose returns are not perfectly correlated. Company-specific risk can be reduced by holding multiple assets, while market-wide risk cannot be fully diversified away. Practical diversification combines stocks, bonds, gold, cash, and sometimes international exposure depending on the investor''s goals.',
'general', 'medium', NULL, ARRAY['diversification', 'portfolio', 'risk'])
ON CONFLICT (question) DO NOTHING;

-- ── END OF community_career.sql ──

-- ── START OF feedback_schema.sql ──
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
-- Only admins can read all feedback
DROP POLICY IF EXISTS "Admins can read all feedback" ON feedback;
CREATE POLICY "Admins can read all feedback"
  ON feedback FOR SELECT TO authenticated
  USING (
    (auth.jwt() ->> 'email') = ANY(
      string_to_array(current_setting('app.admin_emails', TRUE), ',')
    )
    OR auth.role() = 'service_role'
  );

-- Admins can update status and notes
DROP POLICY IF EXISTS "Admins can update feedback" ON feedback;
CREATE POLICY "Admins can update feedback"
  ON feedback FOR UPDATE TO authenticated
  USING (
    (auth.jwt() ->> 'email') = ANY(
      string_to_array(current_setting('app.admin_emails', TRUE), ',')
    )
    OR auth.role() = 'service_role'
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
DROP VIEW IF EXISTS feedback_summary CASCADE;
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

-- ── END OF feedback_schema.sql ──

-- ── START OF referral_system.sql ──
-- ============================================================
-- FinanceHub — Referral System
-- referral_system.sql
-- Run AFTER: gamification.sql
-- Tables: referrals · referral_rewards
-- Functions: generate_referral_code · apply_referral
-- ============================================================

-- ── Referral codes table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS referral_codes (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID    NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code         TEXT    UNIQUE NOT NULL,                  -- e.g. "RAHUL42"
  uses_count   INT     NOT NULL DEFAULT 0,
  max_uses     INT     NOT NULL DEFAULT 50,             -- cap per user
  is_active    BOOL    NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);

-- Ensure one code per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_referral_one_per_user
  ON referral_codes(user_id);

-- ── Referrals tracking ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS referrals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referee_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',   -- pending|rewarded|expired
  referrer_xp   INT  NOT NULL DEFAULT 0,
  referee_xp    INT  NOT NULL DEFAULT 0,
  rewarded_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(referee_id)   -- one referrer per new user
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code     ON referrals(code);

-- ── Referral reward config ───────────────────────────────────
CREATE TABLE IF NOT EXISTS referral_rewards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_event   TEXT NOT NULL UNIQUE,   -- 'signup'|'first_lesson'|'first_paid'
  referrer_xp     INT  NOT NULL DEFAULT 0,
  referee_xp      INT  NOT NULL DEFAULT 0,
  referrer_days   INT  NOT NULL DEFAULT 0,  -- bonus Pro days (future)
  referee_days    INT  NOT NULL DEFAULT 0,
  is_active       BOOL NOT NULL DEFAULT TRUE
);

-- Seed reward tiers
INSERT INTO referral_rewards (trigger_event, referrer_xp, referee_xp, referrer_days, referee_days)
VALUES
  ('signup',       100,  150, 0, 0),   -- both get XP on signup
  ('first_lesson', 200,  100, 0, 0),   -- referrer gets more when friend starts learning
  ('first_paid',   500,  0,   7, 7)    -- both get 7 days Pro when friend pays
ON CONFLICT (trigger_event) DO NOTHING;

-- ── Function: generate unique referral code ───────────────────
CREATE OR REPLACE FUNCTION generate_referral_code(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_name    TEXT;
  v_code    TEXT;
  v_attempt INT := 0;
BEGIN
  -- Get first name
  SELECT UPPER(LEFT(COALESCE(SPLIT_PART(full_name,' ',1),'USER'), 5))
  INTO v_name
  FROM profiles WHERE id = p_user_id;

  -- Try name + random number
  LOOP
    v_code := v_name || LPAD((FLOOR(RANDOM()*9000+1000))::TEXT, 4, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM referral_codes WHERE code = v_code);
    v_attempt := v_attempt + 1;
    IF v_attempt > 10 THEN
      v_code := UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 8));
      EXIT;
    END IF;
  END LOOP;

  INSERT INTO referral_codes (user_id, code)
  VALUES (p_user_id, v_code)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Function: apply referral on signup ───────────────────────
CREATE OR REPLACE FUNCTION apply_referral(
  p_referee_id  UUID,
  p_code        TEXT
) RETURNS JSONB AS $$
DECLARE
  v_referrer_id   UUID;
  v_reward        referral_rewards%ROWTYPE;
  v_ref_code_id   UUID;
BEGIN
  -- Find referrer
  SELECT user_id, id INTO v_referrer_id, v_ref_code_id
  FROM referral_codes
  WHERE code = UPPER(TRIM(p_code))
    AND is_active = TRUE
    AND uses_count < max_uses;

  IF v_referrer_id IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Invalid or expired referral code');
  END IF;

  -- Cannot refer yourself
  IF v_referrer_id = p_referee_id THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Cannot use your own referral code');
  END IF;

  -- Already referred
  IF EXISTS (SELECT 1 FROM referrals WHERE referee_id = p_referee_id) THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Already used a referral code');
  END IF;

  -- Get signup reward
  SELECT * INTO v_reward FROM referral_rewards
  WHERE trigger_event = 'signup' AND is_active = TRUE LIMIT 1;

  -- Record referral
  INSERT INTO referrals (referrer_id, referee_id, code, status, referrer_xp, referee_xp, rewarded_at)
  VALUES (v_referrer_id, p_referee_id, UPPER(TRIM(p_code)), 'rewarded',
          v_reward.referrer_xp, v_reward.referee_xp, NOW());

  -- Increment code uses
  UPDATE referral_codes SET uses_count = uses_count + 1 WHERE id = v_ref_code_id;

  -- Award XP to referee
  UPDATE profiles
  SET xp_total = xp_total + v_reward.referee_xp, updated_at = NOW()
  WHERE id = p_referee_id;

  INSERT INTO user_xp_log (user_id, xp_amount, action, description)
  VALUES (p_referee_id, v_reward.referee_xp, 'referral_joined',
          'Joined via referral code ' || UPPER(TRIM(p_code)));

  -- Award XP to referrer
  UPDATE profiles
  SET xp_total = xp_total + v_reward.referrer_xp, updated_at = NOW()
  WHERE id = v_referrer_id;

  INSERT INTO user_xp_log (user_id, xp_amount, action, description)
  VALUES (v_referrer_id, v_reward.referrer_xp, 'referral_earned',
          'Friend joined using your referral code');

  RETURN jsonb_build_object(
    'success',       TRUE,
    'referrer_xp',   v_reward.referrer_xp,
    'referee_xp',    v_reward.referee_xp
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── RLS policies ─────────────────────────────────────────────
ALTER TABLE referral_codes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own referral code"
  ON referral_codes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users see own referrals"
  ON referrals FOR SELECT TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "Anyone can view active referral rewards"
  ON referral_rewards FOR SELECT TO authenticated, anon
  USING (is_active = TRUE);

-- ── View: referral leaderboard ────────────────────────────────
DROP VIEW IF EXISTS referral_leaderboard CASCADE;
CREATE OR REPLACE VIEW referral_leaderboard AS
SELECT
  r.referrer_id,
  p.full_name,
  p.avatar_url,
  COUNT(*)              AS total_referrals,
  SUM(r.referrer_xp)   AS total_xp_earned,
  MAX(r.created_at)    AS last_referral_at
FROM referrals r
JOIN profiles p ON r.referrer_id = p.id
WHERE r.status = 'rewarded'
GROUP BY r.referrer_id, p.full_name, p.avatar_url
ORDER BY total_referrals DESC;

DO $$
BEGIN
  RAISE NOTICE '✅ Referral system complete';
  RAISE NOTICE '   Tables: referral_codes, referrals, referral_rewards';
  RAISE NOTICE '   Functions: generate_referral_code, apply_referral';
  RAISE NOTICE '   Rewards: signup (+100/+150 XP), first_lesson (+200/+100), first_paid (+500 XP + 7 Pro days)';
END $$;

-- ── END OF referral_system.sql ──

-- ── START OF content_freshness_audits.sql ──
-- ============================================================
-- FinanceHub — Content Freshness Audits Table
-- content_freshness_audits.sql
-- Used by: /api/content-health
-- ============================================================

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

-- ── END OF content_freshness_audits.sql ──
