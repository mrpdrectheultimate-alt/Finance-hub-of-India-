-- ============================================================
-- FinanceHub — Community Extensions + Career Schema
-- community_career.sql
-- Run AFTER: phase5_migration.sql
-- Tables: community_reports · career_paths · user_roadmaps
--         community_reactions · featured_answers
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Ensure community base tables exist ─────────────────────────
CREATE TABLE IF NOT EXISTS community_questions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL DEFAULT '',
  content      TEXT NOT NULL DEFAULT '',
  answer_count INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id     UUID,
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL DEFAULT '',
  is_staff_answer BOOL NOT NULL DEFAULT FALSE,
  is_ai_answer    BOOL NOT NULL DEFAULT FALSE,
  helpful_count   INT NOT NULL DEFAULT 0,
  is_pinned       BOOL NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
DROP POLICY IF EXISTS "Users can create reports" ON community_reports;
CREATE POLICY "Users can create reports"
  ON community_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Reactions: users own their reactions
DROP POLICY IF EXISTS "Users manage own reactions" ON community_reactions;
CREATE POLICY "Users manage own reactions"
  ON community_reactions FOR ALL TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can read reactions" ON community_reactions;
CREATE POLICY "Anyone can read reactions"
  ON community_reactions FOR SELECT TO anon, authenticated
  USING (TRUE);

-- Roadmaps: private to each user
DROP POLICY IF EXISTS "Users own their roadmaps" ON user_roadmaps;
CREATE POLICY "Users own their roadmaps"
  ON user_roadmaps FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Career paths: public read
ALTER TABLE career_paths ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Career paths are public" ON career_paths;
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
