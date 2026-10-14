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
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own referral code"
  ON referral_codes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users see own referrals"
  ON referrals FOR SELECT TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- ── View: referral leaderboard ────────────────────────────────
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
