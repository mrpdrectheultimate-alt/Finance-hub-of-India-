-- ============================================================
-- FinanceHub Phase 8: Community and Career Hub
-- Run AFTER sql/phase7/gamification.sql
-- ============================================================

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
