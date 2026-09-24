-- ============================================================
-- FinanceHub — Phase 3 SQL Migration
-- Net Worth Snapshots · Goal Tracking · AI Logs · Case Studies
-- Run AFTER phase2_migration.sql
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. NET WORTH SNAPSHOTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS net_worth_snapshots (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  snapshot_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  total_assets      NUMERIC DEFAULT 0,
  total_liabilities NUMERIC DEFAULT 0,
  net_worth         NUMERIC GENERATED ALWAYS AS (total_assets - total_liabilities) STORED,
  assets_json       JSONB DEFAULT '[]',
  liabilities_json  JSONB DEFAULT '[]',
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, snapshot_date)
);

ALTER TABLE net_worth_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "networth_own" ON net_worth_snapshots;
CREATE POLICY "networth_own" ON net_worth_snapshots FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_networth_user_date
  ON net_worth_snapshots (user_id, snapshot_date DESC);

-- ─────────────────────────────────────────────────────────────
-- 2. FINANCIAL GOALS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_financial_goals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  target_amount   NUMERIC NOT NULL,
  current_saved   NUMERIC DEFAULT 0,
  target_year     INT NOT NULL,
  expected_return NUMERIC DEFAULT 10,
  inflation_rate  NUMERIC DEFAULT 6,
  priority        TEXT DEFAULT 'should' CHECK (priority IN ('must','should','nice')),
  is_achieved     BOOLEAN DEFAULT FALSE,
  achieved_at     DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_financial_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "goals_own" ON user_financial_goals;
CREATE POLICY "goals_own" ON user_financial_goals FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_goals_user ON user_financial_goals (user_id);

-- ─────────────────────────────────────────────────────────────
-- 3. AI QUESTION LOGS (analytics + safety monitoring)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_question_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  question        TEXT NOT NULL,
  intent          TEXT,
  lesson_context  TEXT,
  track_context   TEXT,
  flagged         BOOLEAN DEFAULT FALSE,
  flag_reason     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_question_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ai_logs_service" ON ai_question_logs;
CREATE POLICY "ai_logs_service" ON ai_question_logs FOR ALL
  USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "ai_logs_own_read" ON ai_question_logs;
CREATE POLICY "ai_logs_own_read" ON ai_question_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ai_logs_user    ON ai_question_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_intent  ON ai_question_logs (intent);
CREATE INDEX IF NOT EXISTS idx_ai_logs_flagged ON ai_question_logs (flagged) WHERE flagged = TRUE;

-- ─────────────────────────────────────────────────────────────
-- 4. CASE STUDIES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS case_studies (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  subtitle        TEXT,
  category        TEXT NOT NULL,        -- personal-finance/investing/corporate/crypto etc
  difficulty      TEXT DEFAULT 'intermediate',
  content_mdx     TEXT NOT NULL,
  protagonist     TEXT,                 -- e.g. "Priya, 28, software engineer in Bengaluru"
  key_lesson      TEXT,                 -- 1-line takeaway
  tags            TEXT[] DEFAULT '{}',
  related_lessons UUID[] DEFAULT '{}',
  duration_minutes INT DEFAULT 10,
  is_published    BOOLEAN DEFAULT FALSE,
  is_free         BOOLEAN DEFAULT TRUE,
  view_count      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  last_reviewed   TIMESTAMPTZ,
  next_review     DATE
);

ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cases_public_read" ON case_studies;
CREATE POLICY "cases_public_read" ON case_studies FOR SELECT USING (is_published = TRUE);
DROP POLICY IF EXISTS "cases_service_all" ON case_studies;
CREATE POLICY "cases_service_all" ON case_studies FOR ALL USING (auth.role() = 'service_role');

CREATE UNIQUE INDEX IF NOT EXISTS idx_cases_slug_unique ON case_studies (slug);
CREATE INDEX IF NOT EXISTS idx_cases_slug     ON case_studies (slug);
CREATE INDEX IF NOT EXISTS idx_cases_category ON case_studies (category);

-- ─────────────────────────────────────────────────────────────
-- 5. CASE STUDY COMPLETIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_case_study_completions (
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_study_id UUID NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
  completed_at  TIMESTAMPTZ DEFAULT NOW(),
  decisions     JSONB DEFAULT '{}',   -- user's choices in interactive case studies
  xp_earned     INT DEFAULT 20,
  PRIMARY KEY (user_id, case_study_id)
);

ALTER TABLE user_case_study_completions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "case_completions_own" ON user_case_study_completions;
CREATE POLICY "case_completions_own" ON user_case_study_completions FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 6. SEED: 5 LAUNCH CASE STUDIES
-- ─────────────────────────────────────────────────────────────
INSERT INTO case_studies (title, slug, subtitle, category, difficulty, content_mdx, protagonist, key_lesson, tags, duration_minutes, is_published, is_free)
VALUES

(
'The ₹50,000 Mistake: What Priya Learned About Emergency Funds',
'priya-emergency-fund-mistake',
'How one unexpected expense derailed a year of careful saving — and what she did next',
'personal-finance', 'beginner',
'# The ₹50,000 Mistake

## Meet Priya

Priya, 28, is a UX designer in Bengaluru earning ₹85,000/month. She has been saving diligently for two years, building up ₹3 lakh in a NIFTY 50 index fund through monthly SIPs.

She is proud of her financial discipline. She barely touches her savings account.

## The Crisis

In March 2024, Priya''s laptop — essential for her work — dies. Repair: impossible. Replacement: ₹65,000.

Priya has ₹8,000 in her savings account.

## The Decision

**Option A**: Redeem ₹65,000 from her index fund.

**Option B**: Take a personal loan at 18% interest from her bank.

**Option C**: Ask her parents for money.

**Option D**: Buy on a credit card and pay minimum balance.

## What Priya Did

She redeemed from her index fund. The money was there, the interest rate was zero, and she avoided debt. Logical choice, right?

## The Hidden Cost

What Priya did not realise:

1. **Tax**: She had invested ₹65,000 worth of units over 18 months. Average purchase price was ₹180/unit. Redemption price was ₹220. She had a ₹14,500 capital gain — taxed at 15% (STCG, held under 1 year for some units) = ₹2,175 tax.

2. **Timing**: She redeemed in a market dip (March 2024 had a brief correction). Her units were down 8% from their peak. She locked in a loss she didn''t need to take.

3. **Compounding break**: ₹65,000 reinvested at 12% for 15 years = ₹3.6 lakh. The real cost of this emergency wasn''t ₹65,000 — it was ₹3.6 lakh in future wealth.

## The Lesson

**Priya needed an emergency fund she didn''t have.**

The purpose of an emergency fund is precisely to avoid touching investments in unplanned situations.

## What She Should Have Had

**Emergency Fund Rule**: 3-6 months of expenses in a liquid, accessible account.

Priya''s monthly expenses: ₹45,000.
Emergency fund target: ₹1.35 lakh (3 months) to ₹2.7 lakh (6 months).
Ideal location: Liquid mutual fund (6-7% returns, next-day withdrawal) or high-yield savings account.

## What Priya Did Next

She rebuilt her emergency fund first (before resuming SIP). It took 4 months. She now keeps ₹2 lakh in a liquid fund and ₹30,000 in her savings account. Her SIPs resumed.

She also set up a reminder to check: "Do I have enough liquid money to handle an emergency without touching investments?"

## Your Turn

Looking at your own finances:
1. Do you have 3 months of expenses in liquid form?
2. If your salary stopped today, how many months could you survive?
3. What would you have done in Priya''s situation?

**Key takeaway**: Investing is only step 2. Step 1 is building a financial safety net.',
'Priya, 28, UX designer in Bengaluru earning ₹85,000/month',
'Always build your emergency fund BEFORE starting SIP investments',
ARRAY['emergency-fund','sip','liquid-fund','financial-planning','beginner'],
10, TRUE, TRUE
),

(
'Rahul''s F&O Story: When 10x Leverage Meets a Beginner',
'rahul-fno-beginner-mistake',
'The seductive math of options trading — and why 89% of individual traders lose money',
'trading-markets', 'intermediate',
'# Rahul''s F&O Story

## Meet Rahul

Rahul, 32, is a sales manager in Mumbai earning ₹1.2 lakh/month. He has been investing in mutual funds for 3 years. He is doing well — ₹8 lakh corpus, disciplined SIPs.

In late 2023, a colleague mentions making ₹40,000 in a day trading NIFTY options.

Rahul is intrigued.

## The Learning Phase

Rahul spends 2 months on YouTube, learning about options. He understands calls and puts. He learns about premiums, expiry dates, strike prices.

He opens an F&O segment with his broker. He deposits ₹1 lakh as trading capital — separate from his mutual fund corpus. Good discipline.

## The First Trade

NIFTY is at 21,500. RBI policy decision tomorrow. Rahul believes rates will stay unchanged → markets rally → he buys a 21,600 call option expiring in 3 days. Premium: ₹85/lot. 1 lot = 50 units = ₹4,250.

RBI keeps rates unchanged. Markets rally. NIFTY hits 21,800.

His call option is now worth ₹240. He sells. Profit: ₹155 × 50 = **₹7,750 in 2 days**. 182% return.

## The Escalation

Over the next 3 months:
- Trade 1: +₹7,750
- Trade 2: +₹12,000 (doubled lot size)
- Trade 3: -₹9,000 (wrong direction)
- Trade 4: +₹18,000 (recovered, increased size again)
- Trade 5: -₹31,000 (budget day, unexpected reaction)

Running total after 5 months: -₹2,250. Roughly breakeven.

But Rahul has now increased his position sizes significantly.

## The Blow-Up

Trade 6: Rahul is "sure" NIFTY will rally after quarterly GDP data. He buys calls worth ₹60,000 in premium. GDP disappoints. NIFTY falls 300 points in a day. His options expire worthless.

Loss: ₹60,000. In one day. 60% of his trading capital.

He deposits another ₹50,000 to "recover." Over the next month, he loses most of it chasing losses.

**Total loss: ₹87,000 over 8 months.**

## What SEBI Data Actually Shows

SEBI''s 2023 study of individual F&O traders found:
- **89% of individual traders lost money** in F&O between 2019-2022
- Average loss per trader: ₹1.1 lakh per year
- Only top 1% of traders made consistent profits over 3+ years
- Most profitable traders: institutions and proprietary desks with algorithms, risk systems, and years of data

This is not beginner-friendly territory.

## What Rahul Should Have Done

1. **Paper trade for minimum 6 months** before real money
2. **Maximum allocation to F&O**: 5-10% of investable surplus — never money he could not afford to lose entirely
3. **Study risk management first** — position sizing, stop losses — before strategy
4. **Understand that options are a zero-sum game** — for every rupee made, someone loses a rupee. Who is smarter: retail Rahul or institutional algorithms?

## The Recovery

Rahul stopped F&O. His ₹8 lakh mutual fund corpus (which he never touched) grew to ₹10.2 lakh in the same period. The boring SIPs quietly compounded while he was chasing excitement.

He now says: "I paid ₹87,000 for an education in humility. Mutual funds are boring but they work."',
'Rahul, 32, sales manager in Mumbai earning ₹1.2 lakh/month',
'89% of individual F&O traders lose money — options are not a shortcut to wealth',
ARRAY['fno','options','trading','risk','sebi','beginner-mistake'],
12, TRUE, TRUE
),

(
'The Cost of Waiting: How Amit and Vijay Saved the Same Amount but Built Different Futures',
'amit-vijay-compounding-comparison',
'Two colleagues, identical salaries, identical savings — one 10-year difference in start date',
'personal-finance', 'beginner',
'# The Cost of Waiting

## Two Colleagues, One Company

Amit and Vijay joined the same company in different years. Both earn ₹80,000/month. Both invest ₹10,000/month in a NIFTY 50 index fund returning 12% annually.

The only difference: **Amit starts at age 25. Vijay starts at age 35.**

## The Numbers at Age 60

**Amit** (invests from 25 to 60 — 35 years):
- Total invested: ₹10,000 × 420 months = **₹42 lakh**
- Corpus at 60: **₹3.53 crore**

**Vijay** (invests from 35 to 60 — 25 years):
- Total invested: ₹10,000 × 300 months = **₹30 lakh**
- Corpus at 60: **₹1.32 crore**

Amit invested ₹12 lakh MORE than Vijay but ended up with **₹2.21 crore MORE**.

The 10-year head start was worth ₹2.21 crore.

## What Vijay Should Do

Vijay cannot go back in time. But he can:

1. **Increase his SIP aggressively**: To match Amit''s ₹3.53 crore by 60, Vijay needs ₹26,600/month (vs Amit''s ₹10,000). Possible on ₹80,000/month salary if lifestyle is controlled.

2. **Take more equity risk**: With 25 years, Vijay still has a long runway. 100% equity SIP is appropriate.

3. **Retire slightly later**: Working until 63 instead of 60 gives 3 more earning+investing years and 3 fewer retirement years to fund.

## The lesson that changes behaviour

This is not theoretical. Run your own numbers.

If you are 25: Starting today vs starting at 35 = difference of crores.
If you are 35: Starting today vs starting at 45 = still enormous difference.
If you are 45: Starting today vs never = the difference between dignity and dependence in old age.

**The best time to start was yesterday. The second best time is today.**',
'Amit (starts at 25) and Vijay (starts at 35) — colleagues at the same company',
'Starting 10 years earlier can mean 2.7x more wealth at retirement with the same monthly investment',
ARRAY['compound-interest','sip','retirement','early-start','time-value'],
8, TRUE, TRUE
),

(
'Meera''s Tax Planning: From Paying ₹1.8 Lakh to ₹31,000 in One Year',
'meera-tax-planning-transformation',
'A software engineer discovers that tax planning is not tax evasion — it is using the law correctly',
'personal-finance', 'intermediate',
'# Meera''s Tax Transformation

## The Starting Point

Meera, 30, is a senior developer at a Pune IT company.
Annual CTC: ₹18 lakh. Take-home: ~₹1.12 lakh/month after TDS.

In April 2023, she filed her ITR and discovered she owed ₹1.82 lakh in additional tax (after TDS already deducted). Her accountant said: "You have no investments."

Meera had been putting all her money in savings accounts and FDs, not thinking about tax planning.

## The Education

A friend introduced her to the concept of legal tax deductions. Meera spent two weekends learning.

What she discovered:

**Section 80C (₹1.5 lakh limit)**:
- ELSS mutual funds: Up to ₹1.5 lakh
- EPF (already being deducted by employer): ₹86,400 contributed
- Remaining 80C headroom: ₹63,600

**Section 80CCD(1B)** — NPS additional: ₹50,000 (separate from 80C)

**Section 80D** — Health insurance premium: ₹25,000 (self) + ₹50,000 (parents senior citizen)

**HRA** — She pays ₹18,000 rent in Pune. Exemption calculation:
- Actual HRA received: ₹22,000/month (₹2.64 lakh/year)
- 40% of basic (non-metro): ₹6.4 lakh × 40% = ₹2.56 lakh
- Rent paid minus 10% of basic: ₹2.16L - ₹64,000 = ₹1.52 lakh
- HRA exempt: ₹1.52 lakh (lowest of three)

## Meera''s Tax Planning for FY 2024-25

| Deduction | Amount | Action Taken |
|-----------|--------|------|
| Section 80C (EPF already) | ₹86,400 | - |
| Section 80C (ELSS top-up) | ₹63,600 | Started ELSS SIP |
| Section 80CCD(1B) — NPS | ₹50,000 | Opened NPS account |
| Section 80D — self health | ₹25,000 | Bought ₹10L health cover |
| Section 80D — parents | ₹50,000 | Bought senior citizen cover |
| HRA exemption | ₹1,52,000 | Started collecting rent receipts |
| **Total deductions** | **₹4,27,000** | |

## The Tax Calculation

**Without planning** (FY23):
Gross taxable income: ₹18,00,000
Standard deduction: -₹50,000
Net: ₹17,50,000
Old regime tax: ~₹3,67,500

**With planning** (FY24):
Gross: ₹18,00,000
Standard deduction: -₹50,000
80C: -₹1,50,000
80CCD(1B): -₹50,000
80D: -₹75,000
HRA: -₹1,52,000
Net taxable: ₹11,73,000
Old regime tax: ~₹1,78,500

Tax saved: **₹1,89,000 per year**.

## What She Did With the Savings

Meera redirected ₹15,000/month (₹1.8 lakh/year) to additional SIPs. The tax saving effectively paid for her investment — her lifestyle cost did not change.

## The New vs Old Regime Question

Meera calculated both:
- **Old regime**: Tax ₹1,78,500 (with all deductions above)
- **New regime**: Tax ₹1,56,000 (no deductions, but lower slabs)

New regime is slightly better for Meera — **but only because of the large HRA exemption**. Without HRA, old regime would have been better.

Lesson: Calculate both regimes every year. Do not assume one is always better.',
'Meera, 30, senior developer in Pune earning ₹18 lakh CTC',
'Legal tax planning through 80C, NPS, and health insurance can save lakhs annually',
ARRAY['tax','80c','nps','hra','health-insurance','income-tax','old-vs-new-regime'],
14, TRUE, FALSE
),

(
'The Startup Equity Trap: Why Rohan Chose Wrong in His ESOP Decision',
'rohan-esop-decision',
'When a startup employee must choose between exercising options and financial security',
'corporate-finance', 'advanced',
'# The Startup Equity Trap

## Meet Rohan

Rohan, 34, has worked at a Series B fintech startup for 4 years. He has 50,000 ESOPs (Employee Stock Options) with an exercise price of ₹10/share. Current valuation implies ₹80/share.

Paper value: 50,000 × (₹80 - ₹10) = **₹35 lakh profit** (on paper).

The company announces: **Exercise window opens for 90 days** — after which unvested options expire.

Rohan must decide.

## The Decision

**Exercise the options**: Pay ₹5 lakh (50,000 × ₹10 exercise price) to receive 50,000 shares of the startup. He would own shares worth ₹40 lakh (at current valuation) for a cost of ₹5 lakh.

**Let them lapse**: Walk away from ₹35 lakh of paper profit.

It seems obvious: exercise.

## The Complexity

Rohan''s savings: ₹8 lakh (his entire liquid savings).

Exercising costs ₹5 lakh = **62.5% of his liquid savings** going into illiquid, unquantified-risk startup shares.

**The Questions Rohan Should Ask:**

**1. What is the actual liquidity path?**
Startup shares are not publicly traded. He cannot sell them when he needs money. He must wait for: secondary sale (rare, needs company approval), acquisition (uncertain), or IPO (years away, if ever).

**2. What are the tax implications?**
In India, ESOP exercise creates a perquisite tax:
- At exercise: Tax on (Fair Market Value - Exercise Price) as salary income
- 50,000 shares × (₹80 - ₹10) = ₹35 lakh taxable as salary in the year of exercise
- Tax at 30% slab: **₹10.5 lakh tax due in FY of exercise**

Rohan would owe ₹10.5 lakh in tax — more than his total liquid savings — in the same year he spends ₹5 lakh exercising.

**3. What happens if the startup fails?**
Series B startups have a ~40-50% failure rate. His ₹5 lakh + tax liability could result in zero.

**4. What is the actual probability of a liquidity event?**
This particular startup has been Series B for 3 years with no Series C. That is a concern.

## What Rohan Did (and What He Should Have Done)

**Rohan exercised all 50,000 options** in excitement about the ₹35 lakh paper wealth.

Result:
- Paid ₹5 lakh exercise price (62% of liquid savings)
- Received tax demand of ₹9.2 lakh the following year (could not pay immediately, had to take personal loan)
- Company shut down 18 months later (Series C fell through)
- Shares worth: ₹0

Total damage: ₹14.2 lakh (exercise price + taxes) + interest on personal loan.

**What He Should Have Done:**
1. Calculated the full tax liability before deciding
2. Consulted a CA specialising in ESOPs
3. Exercised only a portion (enough to keep tax manageable)
4. Assessed the company''s financial health objectively, not emotionally
5. Understood that paper wealth ≠ real wealth until a liquidity event

## The Universal ESOP Lessons

1. **Paper value is not real value** until liquidity event
2. **Tax at exercise is real and immediate** — calculate before deciding
3. **Concentration risk**: Never put more than 10% of net worth into one illiquid asset
4. **Company health first**: Is there a clear path to liquidity in 2-3 years?
5. **Get professional tax advice** — ESOP taxation is complex and CA consultation (₹5,000-15,000) is worth every rupee on a ₹35 lakh decision',
'Rohan, 34, senior product manager at a Series B fintech startup',
'ESOP paper wealth is not real wealth — tax liability at exercise can exceed your liquid savings',
ARRAY['esop','startup','equity','tax','perquisite','corporate-finance','advanced'],
15, TRUE, FALSE
)
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 7. SIMULATOR TRACKING TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS simulator_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  simulator_name  TEXT NOT NULL,
  inputs          JSONB DEFAULT '{}',
  result_summary  JSONB DEFAULT '{}',
  duration_secs   INT,
  xp_awarded      INT DEFAULT 5,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE simulator_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sim_own_all" ON simulator_sessions;
CREATE POLICY "sim_own_all" ON simulator_sessions FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "sim_service" ON simulator_sessions;
CREATE POLICY "sim_service"  ON simulator_sessions FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_sim_user ON simulator_sessions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sim_name ON simulator_sessions (simulator_name);

-- ─────────────────────────────────────────────────────────────
-- 8. ADMIN CONTENT FRESHNESS VIEW (updated for Phase 3)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW content_freshness_report AS
SELECT
  'lesson'     AS content_type,
  l.title      AS name,
  l.slug,
  l.updated_at AS last_updated,
  lq.last_reviewed,
  lq.next_review,
  CASE
    WHEN lq.next_review IS NULL            THEN '🔴 Never reviewed'
    WHEN lq.next_review < CURRENT_DATE     THEN '🔴 Overdue'
    WHEN lq.next_review < CURRENT_DATE+30  THEN '🟡 Due soon'
    ELSE                                       '🟢 Current'
  END AS freshness_status,
  lq.overall  AS quality_score,
  t.name      AS track
FROM lessons l
LEFT JOIN levels lv  ON l.level_id  = lv.id
LEFT JOIN tracks t   ON lv.track_id = t.id
LEFT JOIN lesson_quality_scores lq ON lq.lesson_id = l.id
WHERE l.is_published = TRUE

UNION ALL

SELECT
  'case_study',
  cs.title,
  cs.slug,
  cs.updated_at,
  cs.last_reviewed,
  cs.next_review,
  CASE
    WHEN cs.next_review IS NULL            THEN '🔴 Never reviewed'
    WHEN cs.next_review < CURRENT_DATE     THEN '🔴 Overdue'
    WHEN cs.next_review < CURRENT_DATE+30  THEN '🟡 Due soon'
    ELSE                                       '🟢 Current'
  END,
  NULL,
  cs.category
FROM case_studies cs
WHERE cs.is_published = TRUE

ORDER BY freshness_status, last_reviewed NULLS FIRST;

-- ─────────────────────────────────────────────────────────────
-- 9. VERIFY
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_cases INT; v_goals INT; v_snapshots INT;
BEGIN
  SELECT COUNT(*) INTO v_cases     FROM case_studies  WHERE is_published=TRUE;
  SELECT COUNT(*) INTO v_goals     FROM information_schema.tables WHERE table_name='user_financial_goals';
  SELECT COUNT(*) INTO v_snapshots FROM information_schema.tables WHERE table_name='net_worth_snapshots';

  RAISE NOTICE '✅ Phase 3 migration complete!';
  RAISE NOTICE '   Published case studies: %', v_cases;
  RAISE NOTICE '   New tables: net_worth_snapshots, user_financial_goals,';
  RAISE NOTICE '               ai_question_logs, case_studies, simulator_sessions';
  RAISE NOTICE '   Content freshness view: content_freshness_report';
END $$;
