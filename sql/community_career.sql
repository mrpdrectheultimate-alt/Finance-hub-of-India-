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
