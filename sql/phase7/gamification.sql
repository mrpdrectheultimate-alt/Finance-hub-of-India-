-- ============================================================
-- FinanceHub Phase 7: Advanced Gamification
-- Run AFTER sql/phase4/adaptive_learning_engine.sql
-- ============================================================

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
