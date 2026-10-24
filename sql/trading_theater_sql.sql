-- ============================================================
-- FinanceHub — Trading Theater Schema
-- trading_theater_sql.sql
-- Run AFTER: gamification.sql
-- Tables: trading_scenarios · theater_progress · theater_badges
-- ============================================================

-- ── Scenarios master table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS trading_scenarios (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT    UNIQUE NOT NULL,
  title           TEXT    NOT NULL,
  subtitle        TEXT    NOT NULL,
  category        TEXT    NOT NULL,
  difficulty      TEXT    NOT NULL DEFAULT 'beginner',
  duration_mins   INT     NOT NULL DEFAULT 4,
  instrument      TEXT    NOT NULL,
  timeframe       TEXT    NOT NULL,
  data_source     TEXT    NOT NULL,
  total_steps     INT     NOT NULL DEFAULT 0,
  total_checkpoints INT   NOT NULL DEFAULT 0,
  is_free         BOOL    NOT NULL DEFAULT TRUE,
  is_published    BOOL    NOT NULL DEFAULT TRUE,
  is_hindi        BOOL    NOT NULL DEFAULT FALSE,
  xp_reward       INT     NOT NULL DEFAULT 50,
  order_index     INT     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── User progress per scenario ────────────────────────────────
CREATE TABLE IF NOT EXISTS theater_progress (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID    NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scenario_id     UUID    NOT NULL REFERENCES trading_scenarios(id) ON DELETE CASCADE,
  steps_completed INT     NOT NULL DEFAULT 0,
  checkpoints_correct INT NOT NULL DEFAULT 0,
  checkpoints_total   INT NOT NULL DEFAULT 0,
  is_completed    BOOL    NOT NULL DEFAULT FALSE,
  score_pct       INT     NOT NULL DEFAULT 0,
  xp_awarded      BOOL    NOT NULL DEFAULT FALSE,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  UNIQUE(user_id, scenario_id)
);

CREATE INDEX IF NOT EXISTS idx_theater_progress_user     ON theater_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_theater_progress_scenario ON theater_progress(scenario_id);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE trading_scenarios  ENABLE ROW LEVEL SECURITY;
ALTER TABLE theater_progress   ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-running
DROP POLICY IF EXISTS "Scenarios are public" ON trading_scenarios;
DROP POLICY IF EXISTS "Users own their theater progress" ON theater_progress;

CREATE POLICY "Scenarios are public"
  ON trading_scenarios FOR SELECT TO anon, authenticated USING (is_published = TRUE);

CREATE POLICY "Users own their theater progress"
  ON theater_progress FOR ALL TO authenticated USING (auth.uid() = user_id);

-- ── Seed scenario metadata ────────────────────────────────────
INSERT INTO trading_scenarios
(slug, title, subtitle, category, difficulty, duration_mins, instrument, timeframe,
 data_source, total_steps, total_checkpoints, is_free, is_hindi, xp_reward, order_index)
VALUES
('support-resistance-breakout','Support & Resistance Breakout',
 'Identify zones, wait for close, calculate risk, enter and trail',
 'Price Action','beginner',4,'NIFTY 50','15-minute',
 'Historical — March 2024',8,1,TRUE,FALSE,50,1),

('rsi-oversold-bounce','RSI Oversold Bounce Strategy',
 'RSI divergence + trigger candle + 1:2 risk reward',
 'Momentum','intermediate',5,'RELIANCE Industries','15-minute',
 'Historical — February 2024',5,1,TRUE,FALSE,75,2),

('stop-loss-mastery','Stop-Loss Placement Mastery',
 'Why most traders place stops wrong — and the correct method',
 'Risk Management','beginner',4,'BANKNIFTY','5-minute',
 'Historical — January 2024',4,1,TRUE,FALSE,50,3),

('risk-reward-master','Risk-Reward Ratio — The Math',
 'Why 40% win rate + 1:3 RR beats 70% win rate + 1:1',
 'Risk Management','beginner',3,'Conceptual','Concept',
 'Mathematical demonstration',3,1,TRUE,FALSE,50,4),

('options-call-buying','Call Option Buying — Entry to Exit',
 'Strike selection, Greeks, Theta decay, premium targets',
 'Derivatives','advanced',6,'NIFTY 50 Options','Weekly expiry',
 'Historical — April 2024',5,1,FALSE,FALSE,100,5),

('moving-average-crossover','Moving Average Crossover Strategy',
 '9 EMA and 21 EMA crossover with volume confirmation',
 'Trend Following','intermediate',4,'NIFTY 50','15-minute',
 'Historical — May 2024',6,1,TRUE,FALSE,75,6),

('macd-entry-exit','MACD Crossover Entry and Exit',
 'MACD histogram, signal line cross, divergence — complete walkthrough',
 'Momentum','intermediate',5,'TCS','Daily',
 'Historical — June 2024',6,2,TRUE,FALSE,75,7),

('fibonacci-trade','Fibonacci Retracement Entry',
 '0.618 golden ratio level entry with confluence confirmation',
 'Price Action','intermediate',5,'HDFC Bank','Daily',
 'Historical — July 2024',5,1,FALSE,FALSE,75,8),

('intraday-nifty','Intraday NIFTY Trade — Full Walkthrough',
 'Pre-market prep, opening range, entry, trail, exit by 3:15 PM',
 'Intraday','advanced',7,'NIFTY 50','5-minute',
 'Historical — August 2024',8,2,FALSE,FALSE,100,9),

('discipline-no-trade','The Disciplined No-Trade Day',
 'The most important scenario: when NOT to trade and why',
 'Psychology','beginner',3,'NIFTY 50','15-minute',
 'Historical — September 2024',4,1,TRUE,FALSE,50,10),

-- Additional Core Scenarios
('bullish-hammer-demand','Bullish Hammer at Key Demand Zone',
 'Catching liquidity grabs and institutional accumulation sweeps',
 'Price Action','beginner',4,'NIFTY 50','Daily',
 'Historical — October 2024',4,1,TRUE,FALSE,50,11),

('trailing-stop-atr','ATR Trailing Stop & Trend Riding',
 'Letting winners run without giving back profits using mathematical volatility',
 'Risk Management','intermediate',4,'BANKNIFTY','15-minute',
 'Historical — November 2024',3,1,TRUE,FALSE,75,12),

('options-iron-condor','Iron Condor Range-Bound Strategy',
 'Collecting theta time decay when you expect markets to remain sideways',
 'Derivatives','advanced',6,'NIFTY 50 Options','Weekly expiry',
 'Historical — December 2024',3,1,FALSE,FALSE,100,13),

('moving-average-golden-cross','20/50 Moving Average Golden Cross',
 'Trading intermediate momentum and institutional trend continuations',
 'Trend Following','intermediate',4,'NIFTY 50','15-minute',
 'Historical — May 2024',4,1,TRUE,FALSE,75,14),

('macd-bearish-divergence','MACD Bearish Divergence Short Trade',
 'Spotting exhaustion in tech rallies and profiting from the reversal',
 'Momentum','intermediate',5,'TCS','Daily',
 'Historical — June 2024',4,1,TRUE,FALSE,75,15),

-- Hindi scenarios
('sip-kya-hai-hindi','SIP Kya Hai — Hindi Animation',
 'Compound interest aur SIP ka jadu — step by step',
 'Personal Finance','beginner',4,'Mutual Fund SIP','Monthly',
 'Educational demonstration',5,1,TRUE,TRUE,50,16),

('support-resistance-hindi','Support Resistance Hindi Walkthrough',
 'Support aur resistance kaise identify karein — Hindi mein',
 'Price Action','beginner',4,'NIFTY 50','15-minute',
 'Historical — Hindi narration',6,1,TRUE,TRUE,50,17),

-- ── 8 New Advanced Scenarios ──────────────────────────────────
('candlestick-pattern-trade','Candlestick Pattern Trade',
 'Hammer and Engulfing live trade',
 'Price Action','beginner',5,'HDFC Bank','15-minute',
 'Historical Oct 2024',5,1,TRUE,FALSE,50,18),

('vwap-intraday-strategy','VWAP Intraday Strategy',
 'Institutional reference line for high-prob entries',
 'Intraday','intermediate',5,'NIFTY 50','5-minute',
 'Historical Oct 2024',4,1,TRUE,FALSE,75,19),

('short-selling-basics','Short Selling',
 'Profiting from falling markets',
 'Advanced Strategies','intermediate',5,'Nifty IT Futures','Daily',
 'Historical 2024',4,1,TRUE,FALSE,75,20),

('gap-up-gap-down-strategy','Gap Up Gap Down Strategy',
 'Reading and trading the opening gap',
 'Intraday','beginner',4,'NIFTY 50','5-minute',
 'Historical Oct 2024',4,1,TRUE,FALSE,50,21),

('fo-expiry-day-strategy','F&O Expiry Day Strategy',
 'Theta decay and Iron Condor on Thursday',
 'Derivatives','advanced',6,'NIFTY Options','5-minute',
 'Historical Oct 2024',4,1,FALSE,FALSE,100,22),

('stop-loss-hunt-operator-trap','Stop-Loss Hunt',
 'How operators trap retail and how to avoid it',
 'Market Mechanics','intermediate',4,'Mid-cap','5-minute',
 'Educational demo',3,1,TRUE,FALSE,75,23),

('crypto-bitcoin-breakout','Bitcoin Breakout Trade',
 'Technical breakout on BTC with India tax context',
 'Crypto','intermediate',4,'Bitcoin','Daily',
 'Historical 2024',4,1,FALSE,FALSE,75,24),

('trade-journal-review','Trade Journal Review',
 'Post-trade analysis — the missing skill',
 'Psychology','beginner',4,'Portfolio','Weekly',
 'Demonstration',4,1,TRUE,FALSE,50,25),

-- Legacy alias slugs (for backwards-compatibility)
('short-selling-strategy','Short Selling (Legacy Slug)',
 'Profiting from falling markets',
 'Advanced Strategies','intermediate',5,'Nifty IT Futures','Daily',
 'Historical 2024',4,1,TRUE,FALSE,75,120),

('gap-trading-strategy','Gap Trading Strategy (Legacy Slug)',
 'Reading and trading the opening gap',
 'Intraday','beginner',4,'NIFTY 50','5-minute',
 'Historical Oct 2024',4,1,TRUE,FALSE,50,121),

('fno-expiry-day-strategy','F&O Expiry Day (Legacy Slug)',
 'Theta decay and Iron Condor on Thursday',
 'Derivatives','advanced',6,'NIFTY Options','5-minute',
 'Historical Oct 2024',4,1,FALSE,FALSE,100,122),

('bull-trap-liquidity-hunt','Bull Trap Liquidity Hunt (Legacy Slug)',
 'How operators trap retail and how to avoid it',
 'Market Mechanics','intermediate',4,'Mid-cap','5-minute',
 'Educational demo',3,1,TRUE,FALSE,75,123),

('crypto-btc-breakout','Crypto BTC Breakout (Legacy Slug)',
 'Technical breakout on BTC with India tax context',
 'Crypto','intermediate',4,'Bitcoin','Daily',
 'Historical 2024',4,1,FALSE,FALSE,75,124)

ON CONFLICT (slug) DO NOTHING;

-- ── Function: complete_theater_scenario (by UUID) ────────────
CREATE OR REPLACE FUNCTION complete_theater_scenario(
  p_user_id     UUID,
  p_scenario_id UUID,
  p_score       INT DEFAULT 100
) RETURNS JSONB AS $$
DECLARE
  v_scenario  trading_scenarios%ROWTYPE;
  v_progress  theater_progress%ROWTYPE;
  v_xp        INT;
  v_free_done INT;
  v_free_total INT;
BEGIN
  SELECT * INTO v_scenario FROM trading_scenarios WHERE id = p_scenario_id;
  IF v_scenario.id IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Scenario not found');
  END IF;

  -- Upsert progress
  INSERT INTO theater_progress
    (user_id, scenario_id, is_completed, score_pct, completed_at)
  VALUES
    (p_user_id, p_scenario_id, TRUE, p_score, NOW())
  ON CONFLICT (user_id, scenario_id)
  DO UPDATE SET
    is_completed = TRUE,
    score_pct    = GREATEST(theater_progress.score_pct, p_score),
    completed_at = NOW();

  -- Award XP (once per scenario)
  SELECT * INTO v_progress
  FROM theater_progress
  WHERE user_id = p_user_id AND scenario_id = p_scenario_id;

  IF NOT v_progress.xp_awarded THEN
    v_xp := v_scenario.xp_reward;

    UPDATE profiles
    SET xp_total = xp_total + v_xp, updated_at = NOW()
    WHERE id = p_user_id;

    BEGIN
      INSERT INTO user_xp_log (user_id, xp_amount, action, description)
      VALUES (p_user_id, v_xp, 'trading_theater',
              'Completed: ' || v_scenario.title);
    EXCEPTION WHEN OTHERS THEN
      -- Table user_xp_log may not exist in some environments
      NULL;
    END;

    BEGIN
      PERFORM add_weekly_xp(p_user_id, v_xp, 'trading_theater');
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;

    UPDATE theater_progress
    SET xp_awarded = TRUE
    WHERE user_id = p_user_id AND scenario_id = p_scenario_id;
  END IF;

  -- Check if all free scenarios done → award badge
  SELECT COUNT(*) INTO v_free_done
  FROM theater_progress tp
  JOIN trading_scenarios ts ON tp.scenario_id = ts.id
  WHERE tp.user_id = p_user_id AND tp.is_completed = TRUE AND ts.is_free = TRUE;

  SELECT COUNT(*) INTO v_free_total
  FROM trading_scenarios WHERE is_free = TRUE AND is_published = TRUE;

  IF v_free_done >= v_free_total AND v_free_total > 0 THEN
    BEGIN
      INSERT INTO user_badges (user_id, badge_id)
      SELECT p_user_id, id FROM badges WHERE slug = 'trading-theater-complete'
      ON CONFLICT DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE, 'xp_awarded', v_xp, 'score', p_score
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Function: complete_theater_scenario (by Slug overload) ───
CREATE OR REPLACE FUNCTION complete_theater_scenario(
  p_user_id       UUID,
  p_scenario_slug TEXT,
  p_score         INT DEFAULT 100
) RETURNS JSONB AS $$
DECLARE
  v_scenario_id UUID;
BEGIN
  SELECT id INTO v_scenario_id FROM trading_scenarios WHERE slug = p_scenario_slug;
  IF v_scenario_id IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Scenario slug not found: ' || p_scenario_slug);
  END IF;
  RETURN complete_theater_scenario(p_user_id, v_scenario_id, p_score);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Badge for completing all scenarios ───────────────────────
INSERT INTO badges
  (slug, name, description, icon_emoji, category, threshold, xp_reward)
VALUES
  ('trading-theater-complete', 'Trading Theater Graduate',
   'Completed all free Trading Academy scenarios',
   '🎬', 'special', 1, 200),
  ('trading-theater-pro', 'Trading Academy Pro',
   'Completed all Trading Academy scenarios including advanced',
   '🏆', 'special', 1, 500)
ON CONFLICT (slug) DO NOTHING;

-- ── View: theater leaderboard ────────────────────────────────
CREATE OR REPLACE VIEW theater_leaderboard AS
SELECT
  tp.user_id,
  p.full_name,
  p.avatar_url,
  COUNT(*) FILTER (WHERE tp.is_completed)   AS scenarios_completed,
  AVG(tp.score_pct) FILTER (WHERE tp.is_completed) AS avg_score,
  SUM(CASE WHEN tp.is_completed THEN ts.xp_reward ELSE 0 END) AS xp_from_theater
FROM theater_progress tp
JOIN profiles p         ON tp.user_id = p.id
JOIN trading_scenarios ts ON tp.scenario_id = ts.id
GROUP BY tp.user_id, p.full_name, p.avatar_url
ORDER BY scenarios_completed DESC, avg_score DESC;

DO $$
BEGIN
  RAISE NOTICE '✅ Trading Theater schema complete';
  RAISE NOTICE '   Tables: trading_scenarios, theater_progress';
  RAISE NOTICE '   Scenarios seeded: 17 total (15 English + 2 Hindi)';
  RAISE NOTICE '   Function: complete_theater_scenario (UUID & Slug overloads)';
  RAISE NOTICE '   Badges: trading-theater-complete, trading-theater-pro';
END $$;
