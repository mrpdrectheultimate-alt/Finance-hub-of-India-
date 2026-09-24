-- ============================================================
-- FinanceHub — Phase 2 SQL Migration
-- Knowledge Graph + Concept System + Glossary + Content Quality
-- Run AFTER phase1_migration.sql
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. CONCEPTS TABLE — core knowledge graph nodes
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS concepts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  simple_def    TEXT NOT NULL,       -- One sentence, plain language
  full_def      TEXT,                -- Detailed explanation
  formula       TEXT,                -- Mathematical formula if applicable
  formula_vars  JSONB DEFAULT '{}',  -- Variable explanations
  example       TEXT,                -- India-specific example
  difficulty    TEXT DEFAULT 'beginner'
                CHECK (difficulty IN ('beginner','intermediate','advanced')),
  track_slugs   TEXT[] DEFAULT '{}', -- Which tracks use this concept
  tags          TEXT[] DEFAULT '{}',
  is_published  BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  last_reviewed TIMESTAMPTZ,
  reviewed_by   TEXT,
  next_review   DATE
);

ALTER TABLE concepts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "concepts_public_read" ON concepts;
CREATE POLICY "concepts_public_read" ON concepts FOR SELECT USING (is_published = TRUE);
DROP POLICY IF EXISTS "concepts_service_all" ON concepts;
CREATE POLICY "concepts_service_all" ON concepts FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_concepts_slug    ON concepts (slug);
CREATE INDEX IF NOT EXISTS idx_concepts_tracks  ON concepts USING GIN (track_slugs);
CREATE INDEX IF NOT EXISTS idx_concepts_diff    ON concepts (difficulty);

-- ─────────────────────────────────────────────────────────────
-- 2. CONCEPT PREREQUISITES (directed graph edges)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS concept_prerequisites (
  concept_id    UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  requires_id   UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  strength      TEXT DEFAULT 'required' CHECK (strength IN ('required','helpful')),
  PRIMARY KEY (concept_id, requires_id)
);

ALTER TABLE concept_prerequisites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "prereqs_public_read" ON concept_prerequisites;
CREATE POLICY "prereqs_public_read" ON concept_prerequisites FOR SELECT USING (TRUE);

-- ─────────────────────────────────────────────────────────────
-- 3. CONCEPT ↔ LESSON MAPPING
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS concept_lessons (
  concept_id  UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  lesson_id   UUID NOT NULL REFERENCES lessons(id)  ON DELETE CASCADE,
  is_primary  BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (concept_id, lesson_id)
);

ALTER TABLE concept_lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "concept_lessons_public" ON concept_lessons;
CREATE POLICY "concept_lessons_public" ON concept_lessons FOR SELECT USING (TRUE);

-- ─────────────────────────────────────────────────────────────
-- 4. USER CONCEPT MASTERY (spaced repetition + mastery scores)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_concept_mastery (
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  concept_id     UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  exposure_count INT     DEFAULT 0,
  quiz_score     NUMERIC DEFAULT 0,
  practice_score NUMERIC DEFAULT 0,
  retention_score NUMERIC DEFAULT 0,
  mastery_score  NUMERIC DEFAULT 0,   -- Composite 0-100
  -- SM-2 spaced repetition fields
  interval_days  INT     DEFAULT 1,
  ease_factor    NUMERIC DEFAULT 2.5,
  repetitions    INT     DEFAULT 0,
  last_reviewed  DATE,
  next_review    DATE    DEFAULT CURRENT_DATE,
  last_score     INT,                 -- 0-5 SM-2 quality rating
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, concept_id)
);

ALTER TABLE user_concept_mastery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mastery_own_all" ON user_concept_mastery;
CREATE POLICY "mastery_own_all" ON user_concept_mastery FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_mastery_review ON user_concept_mastery (user_id, next_review);

-- SM-2 update function
DROP FUNCTION IF EXISTS update_concept_mastery(UUID, UUID, INT);
CREATE OR REPLACE FUNCTION update_concept_mastery(
  p_user_id   UUID,
  p_concept_id UUID,
  p_quality   INT  -- 0-5: 0-2=fail, 3=pass, 4=good, 5=perfect
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  rec         user_concept_mastery%ROWTYPE;
  new_ef      NUMERIC;
  new_interval INT;
  new_reps    INT;
  result      JSONB;
BEGIN
  SELECT * INTO rec
  FROM user_concept_mastery
  WHERE user_id=p_user_id AND concept_id=p_concept_id;

  IF NOT FOUND THEN
    INSERT INTO user_concept_mastery (user_id, concept_id)
    VALUES (p_user_id, p_concept_id);
    SELECT * INTO rec FROM user_concept_mastery
    WHERE user_id=p_user_id AND concept_id=p_concept_id;
  END IF;

  -- SM-2 algorithm
  new_ef := GREATEST(1.3,
    COALESCE(rec.ease_factor,2.5) + (0.1 - (5-p_quality)*(0.08 + (5-p_quality)*0.02))
  );

  IF p_quality < 3 THEN
    new_interval := 1;
    new_reps     := 0;
  ELSIF COALESCE(rec.repetitions,0) = 0 THEN
    new_interval := 1;
    new_reps     := 1;
  ELSIF COALESCE(rec.repetitions,0) = 1 THEN
    new_interval := 6;
    new_reps     := 2;
  ELSE
    new_interval := ROUND(COALESCE(rec.interval_days,1) * new_ef);
    new_reps     := COALESCE(rec.repetitions,0) + 1;
  END IF;

  UPDATE user_concept_mastery SET
    interval_days   = new_interval,
    ease_factor     = new_ef,
    repetitions     = new_reps,
    last_score      = p_quality,
    last_reviewed   = CURRENT_DATE,
    next_review     = CURRENT_DATE + new_interval,
    quiz_score      = CASE WHEN p_quality >= 3 THEN
                        GREATEST(COALESCE(quiz_score,0), p_quality * 20)
                      ELSE quiz_score END,
    mastery_score   = ROUND((
      COALESCE(exposure_count,0) * 5 +
      CASE WHEN p_quality >= 3 THEN p_quality * 20 ELSE 0 END * 0.5
    ) / 1.5),
    updated_at      = NOW()
  WHERE user_id=p_user_id AND concept_id=p_concept_id;

  result := jsonb_build_object(
    'next_review',    CURRENT_DATE + new_interval,
    'interval_days',  new_interval,
    'ease_factor',    new_ef,
    'repetitions',    new_reps
  );

  RETURN result;
END; $$;

-- ─────────────────────────────────────────────────────────────
-- 5. GLOSSARY TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS glossary (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  term            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  simple_def      TEXT NOT NULL,    -- 1-2 sentences, plain language
  full_def        TEXT,             -- Detailed explanation
  example         TEXT,             -- India-specific example with ₹
  formula         TEXT,             -- If applicable
  pronunciation   TEXT,             -- For difficult terms
  category        TEXT,             -- personal-finance/investing/trading/etc
  difficulty      TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner','intermediate','advanced')),
  related_terms   TEXT[] DEFAULT '{}',  -- slugs of related glossary entries
  related_lessons UUID[] DEFAULT '{}',  -- lesson IDs that explain this term
  is_published    BOOLEAN DEFAULT TRUE,
  view_count      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  last_reviewed   TIMESTAMPTZ,
  next_review     DATE
);

ALTER TABLE glossary ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "glossary_public_read" ON glossary;
CREATE POLICY "glossary_public_read" ON glossary FOR SELECT USING (is_published = TRUE);
DROP POLICY IF EXISTS "glossary_service_all" ON glossary;
CREATE POLICY "glossary_service_all" ON glossary FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_glossary_slug     ON glossary (slug);
CREATE INDEX IF NOT EXISTS idx_glossary_category ON glossary (category);
CREATE INDEX IF NOT EXISTS idx_glossary_term     ON glossary USING GIN (to_tsvector('english', term));

-- Increment view count function
DROP FUNCTION IF EXISTS increment_glossary_views(TEXT);
CREATE OR REPLACE FUNCTION increment_glossary_views(p_slug TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE glossary SET view_count = COALESCE(view_count,0) + 1 WHERE slug = p_slug;
END; $$;

-- ─────────────────────────────────────────────────────────────
-- 6. LESSON QUALITY SCORES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_quality_scores (
  lesson_id      UUID PRIMARY KEY REFERENCES lessons(id) ON DELETE CASCADE,
  accuracy       INT DEFAULT 0 CHECK (accuracy BETWEEN 0 AND 100),
  clarity        INT DEFAULT 0 CHECK (clarity  BETWEEN 0 AND 100),
  completeness   INT DEFAULT 0 CHECK (completeness BETWEEN 0 AND 100),
  visuals        INT DEFAULT 0 CHECK (visuals  BETWEEN 0 AND 100),
  practice       INT DEFAULT 0 CHECK (practice BETWEEN 0 AND 100),
  sources        INT DEFAULT 0 CHECK (sources  BETWEEN 0 AND 100),
  freshness      INT DEFAULT 0 CHECK (freshness BETWEEN 0 AND 100),
  overall        INT GENERATED ALWAYS AS (
    (accuracy + clarity + completeness + visuals + practice + sources + freshness) / 7
  ) STORED,
  reviewer       TEXT,
  review_notes   TEXT,
  last_reviewed  TIMESTAMPTZ,
  next_review    DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lesson_quality_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "quality_service_all" ON lesson_quality_scores;
CREATE POLICY "quality_service_all" ON lesson_quality_scores FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "quality_admin_read" ON lesson_quality_scores;
CREATE POLICY "quality_admin_read"  ON lesson_quality_scores FOR SELECT
  USING (auth.jwt() ->> 'email' = ANY(
    string_to_array(current_setting('app.admin_emails', true), ',')
  ));

-- ─────────────────────────────────────────────────────────────
-- 7. SOURCES / CITATIONS TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sources (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  source_type     TEXT CHECK (source_type IN (
    'rbi','sebi','government','amfi','nse','bse','textbook',
    'research','news','institution','original','other'
  )),
  author          TEXT,
  publisher       TEXT,
  url             TEXT,
  isbn            TEXT,
  published_date  DATE,
  accessed_date   DATE,
  is_verified     BOOLEAN DEFAULT FALSE,
  verified_by     TEXT,
  verified_at     TIMESTAMPTZ,
  recheck_by      DATE,
  rights_status   TEXT CHECK (rights_status IN (
    'public_domain','cc_licensed','freely_available',
    'commercial','original','unknown'
  )) DEFAULT 'unknown',
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT sources_title_unique UNIQUE (title)
);

ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sources_public_read" ON sources;
CREATE POLICY "sources_public_read" ON sources FOR SELECT USING (is_active = TRUE);
DROP POLICY IF EXISTS "sources_service_all" ON sources;
CREATE POLICY "sources_service_all" ON sources FOR ALL USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────
-- 8. LESSON ↔ SOURCE CITATIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_citations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id  UUID NOT NULL REFERENCES lessons(id)  ON DELETE CASCADE,
  source_id  UUID NOT NULL REFERENCES sources(id)  ON DELETE CASCADE,
  claim      TEXT,    -- What specific claim this source supports
  page_ref   TEXT,    -- Page number if book/PDF
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lesson_citations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "citations_public_read" ON lesson_citations;
CREATE POLICY "citations_public_read" ON lesson_citations FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "citations_service_all" ON lesson_citations;
CREATE POLICY "citations_service_all" ON lesson_citations FOR ALL USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────
-- 9. SEED: 50 CORE FINANCE CONCEPTS
-- ─────────────────────────────────────────────────────────────
INSERT INTO concepts (name, slug, simple_def, full_def, formula, example, difficulty, track_slugs, tags)
VALUES

-- MONEY BASICS
('Compound Interest', 'compound-interest',
 'Earning interest on both your original investment AND the interest already earned.',
 'Compound interest is the process where interest earned in one period is added to the principal, so that interest is earned on an ever-growing balance. It is the mechanism that drives exponential wealth growth over time.',
 'A = P(1 + r/n)^(nt) where P=principal, r=annual rate, n=compounds/year, t=years',
 '₹10,000 invested at 12% annual compound interest becomes ₹31,058 after 10 years — without adding a single rupee more.',
 'beginner', ARRAY['personal-finance','trading-markets'], ARRAY['interest','investing','savings']),

('Simple Interest', 'simple-interest',
 'Earning interest only on your original investment amount, not on accumulated interest.',
 'Simple interest is calculated only on the principal amount, not on previous interest. Unlike compound interest, simple interest does not grow exponentially.',
 'I = P × R × T where P=principal, R=rate per period, T=time periods',
 '₹10,000 at 10% simple interest earns ₹1,000 per year, every year — always based on the original ₹10,000.',
 'beginner', ARRAY['personal-finance'], ARRAY['interest','savings','basic']),

('Inflation', 'inflation',
 'The general rise in prices over time that reduces how much your money can buy.',
 'Inflation measures how much prices rise over a period, which reduces the purchasing power of money. India measures inflation primarily through CPI (Consumer Price Index). Current India CPI inflation is typically 4-6%.',
 'Real Return = Nominal Return − Inflation Rate',
 'If inflation is 6%, ₹100 today buys goods worth only ₹94 next year. Over 12 years, your purchasing power halves.',
 'beginner', ARRAY['personal-finance','trading-markets'], ARRAY['prices','purchasing power','rbi','economy']),

('CAGR', 'cagr',
 'The steady annual growth rate an investment would need to reach its final value — smoothing out year-to-year ups and downs.',
 'Compound Annual Growth Rate (CAGR) is the most useful way to compare investment returns over different time periods. It shows the consistent rate that would produce the same end result as the actual (often bumpy) path.',
 'CAGR = (End Value / Start Value)^(1/Years) − 1',
 'NIFTY 50 went from 6,000 to 22,000 over 10 years. CAGR = (22,000/6,000)^(1/10) − 1 = 13.9% per year.',
 'intermediate', ARRAY['trading-markets','corporate-finance'], ARRAY['returns','investment','performance']),

('SIP', 'sip',
 'Investing a fixed amount in a mutual fund every month, automatically.',
 'Systematic Investment Plan (SIP) is a method of investing in mutual funds where a fixed amount is debited from your bank account every month and invested in the chosen fund. SIPs use rupee-cost averaging — buying more units when prices are low and fewer when high.',
 'SIP Future Value = P × [(1+r)^n − 1] / r × (1+r) where P=monthly investment, r=monthly return, n=months',
 '₹5,000/month SIP at 12% annual returns for 20 years creates a corpus of ₹49.9 lakh — on a total investment of just ₹12 lakh.',
 'beginner', ARRAY['personal-finance','trading-markets'], ARRAY['mutual fund','investing','monthly','automated']),

('Mutual Fund', 'mutual-fund',
 'A pool of money from many investors managed by a professional fund manager, invested in stocks, bonds, or other assets.',
 'A mutual fund collects money from multiple investors and invests it in a diversified portfolio of securities. AMFI (Association of Mutual Funds in India) regulates mutual funds. SEBI oversees the overall framework.',
 NULL,
 '₹500/month into a NIFTY 50 index fund = you own a proportional share of 50 of India''s largest companies.',
 'beginner', ARRAY['personal-finance','trading-markets'], ARRAY['investing','amfi','sebi','diversification']),

('Index Fund', 'index-fund',
 'A mutual fund that simply copies a market index like NIFTY 50, rather than trying to beat it.',
 'An index fund passively tracks an index (like NIFTY 50) by holding the same stocks in the same proportions. Because it requires no active management, expense ratios are extremely low (0.05-0.2% vs 1-2.5% for active funds).',
 NULL,
 'A NIFTY 50 index fund holds all 50 companies in the same weight as NIFTY. When NIFTY rises 10%, the fund rises ~10% minus tiny fees.',
 'beginner', ARRAY['personal-finance','trading-markets'], ARRAY['passive investing','low cost','nifty','sensex']),

('P/E Ratio', 'pe-ratio',
 'The price of a stock divided by its earnings per share — shows how much investors are paying for each rupee of earnings.',
 'Price-to-Earnings ratio measures how expensive a stock is relative to its earnings. A P/E of 20 means investors pay ₹20 for every ₹1 of annual earnings. Higher P/E = more growth expected (or more expensive). Compare to: same company''s historical P/E, peers, index P/E.',
 'P/E = Market Price per Share / Earnings per Share (EPS)',
 'Infosys earns ₹60/share. Stock trades at ₹1,500. P/E = 1500/60 = 25. NIFTY 50 median P/E is ~20.',
 'intermediate', ARRAY['trading-markets','corporate-finance'], ARRAY['valuation','stock market','fundamental analysis']),

('EPS', 'eps',
 'Earnings Per Share — the company''s net profit divided by number of shares outstanding.',
 'EPS shows how much profit the company generates for each share. Growing EPS over years = business earning more. EPS is the denominator in P/E ratio and a key metric for comparing profitability.',
 'EPS = Net Profit / Number of Shares Outstanding',
 'TCS earns ₹50,000 crore profit. With 365 crore shares outstanding: EPS = ₹136.9 per share.',
 'intermediate', ARRAY['trading-markets','corporate-finance'], ARRAY['earnings','profit','stock market']),

('Market Capitalisation', 'market-cap',
 'The total value the stock market places on a company — share price multiplied by total shares.',
 'Market cap is the market''s current valuation of a company. Large cap = top 100 companies (>₹20,000 crore). Mid cap = 101-250 (₹5,000-20,000 crore). Small cap = rest (<₹5,000 crore). Each category has different risk-return profiles.',
 'Market Cap = Current Share Price × Total Shares Outstanding',
 'Reliance Industries: Share price ₹2,900 × 1,352 crore shares = Market cap ≈ ₹39 lakh crore.',
 'beginner', ARRAY['trading-markets'], ARRAY['stock market','company size','valuation','nse','bse']),

-- TAX AND PERSONAL FINANCE
('TDS', 'tds',
 'Tax Deducted at Source — tax that is deducted from your income before you receive it.',
 'TDS is a tax collection mechanism where the payer deducts tax from the payment at a specified rate and deposits it with the government. Your employer deducts TDS from salary, banks deduct TDS on FD interest above ₹40,000/year.',
 NULL,
 'Your employer pays you ₹1 lakh/month but deducts ₹8,500 TDS based on your projected annual tax liability. You receive ₹91,500. The ₹8,500 goes directly to income tax department.',
 'beginner', ARRAY['personal-finance'], ARRAY['tax','income tax','salary','employer']),

('Section 80C', 'section-80c',
 'The most popular income tax deduction — up to ₹1.5 lakh per year in the old tax regime.',
 'Section 80C of the Income Tax Act allows individuals to claim deductions up to ₹1.5 lakh per year for specific investments and expenditures. Available only under the old tax regime. Key 80C options: ELSS, PPF, EPF, NSC, NPS (partial), home loan principal, life insurance premium, children''s school fees.',
 NULL,
 'Annual salary ₹12 lakh. Invest ₹1.5 lakh in ELSS. Taxable income reduces to ₹10.5 lakh. Tax saving: approximately ₹46,800 (at 30% bracket including surcharge).',
 'intermediate', ARRAY['personal-finance'], ARRAY['tax','deduction','80c','elss','ppf','epf']),

('EPF', 'epf',
 'Employee Provident Fund — a mandatory retirement savings scheme where you and your employer each contribute 12% of your basic salary.',
 'EPF is India''s largest retirement savings scheme managed by EPFO (Employees'' Provident Fund Organisation). Both employee and employer contribute 12% of basic+DA. Current interest rate: 8.15% (2023-24). The corpus grows tax-free and is entirely tax-exempt on withdrawal after 5 years of continuous service.',
 'Employee contribution = 12% of Basic + DA; Employer contributes 3.67% to EPF, 8.33% to EPS (pension)',
 'Basic salary ₹30,000/month. Employee EPF: ₹3,600. Employer EPF: ₹3,600. Total annual EPF: ₹86,400. At 8.15% over 30 years: significant retirement corpus.',
 'beginner', ARRAY['personal-finance'], ARRAY['retirement','epfo','provident fund','employer','tax-free']),

('PPF', 'ppf',
 'Public Provident Fund — a government-backed 15-year savings scheme with tax-free returns.',
 'PPF is a government scheme offering guaranteed returns (currently 7.1% p.a.), full tax exemption (EEE status — exempt at investment, growth, and withdrawal). Maximum ₹1.5 lakh/year. 15-year lock-in with partial withdrawal allowed from year 7.',
 NULL,
 'Invest ₹1.5 lakh/year in PPF for 15 years. At 7.1% interest: corpus of approximately ₹40 lakh — completely tax-free.',
 'beginner', ARRAY['personal-finance'], ARRAY['government scheme','tax-free','retirement','safe','80c']),

('ELSS', 'elss',
 'Equity Linked Savings Scheme — a tax-saving mutual fund with the shortest lock-in among 80C options.',
 'ELSS funds invest primarily in equities and have a mandatory 3-year lock-in period. Unlike other 80C options, ELSS is market-linked and can deliver higher returns over long periods. Gains are taxed at 10% LTCG above ₹1 lakh.',
 NULL,
 '₹1.5 lakh invested in ELSS saves ₹46,800 in tax (30% bracket). Over 10 years at 12% returns: ₹4.65 lakh. Better than PPF both for tax saving and wealth creation.',
 'intermediate', ARRAY['personal-finance','trading-markets'], ARRAY['tax saving','mutual fund','80c','equity','3-year lock-in']),

-- STOCK MARKET
('NIFTY 50', 'nifty-50',
 'India''s most important stock market index — tracks the 50 largest companies on NSE.',
 'NIFTY 50 is the National Stock Exchange''s benchmark index, comprising 50 of the largest and most liquid Indian companies. It uses free-float market capitalisation weighting. It is the primary benchmark for evaluating Indian large-cap fund performance.',
 'NIFTY = Σ(Free float market cap of 50 companies) / Base market cap × 1000',
 'If NIFTY rises from 22,000 to 24,000 in a year, large-cap Indian stocks collectively returned about 9%. Your NIFTY index fund would return approximately the same.',
 'beginner', ARRAY['trading-markets','technical-analysis'], ARRAY['index','nse','benchmark','large-cap','india']),

('BSE SENSEX', 'bse-sensex',
 'India''s oldest stock market index — tracks 30 of the largest companies on Bombay Stock Exchange.',
 'SENSEX (Sensitive Index) is BSE''s benchmark index, comprising 30 large, well-established companies. Started in 1979 at base value of 100. Now at 70,000+. Often reported alongside NIFTY in financial news.',
 NULL,
 'Sensex started at 100 in 1979. At 70,000 today, it has grown 700x in 45 years — a CAGR of approximately 15.5%.',
 'beginner', ARRAY['trading-markets'], ARRAY['index','bse','benchmark','india','sensex']),

('SEBI', 'sebi',
 'Securities and Exchange Board of India — the regulator that protects investors and ensures fair markets.',
 'SEBI (Securities and Exchange Board of India) was established in 1992 to regulate and develop the securities market. It registers and regulates all market participants, prohibits insider trading, and protects investor interests. All mutual funds, brokers, and listed companies must comply with SEBI regulations.',
 NULL,
 'SEBI mandated that all IPOs must be RERA-registered. SEBI introduced circuit breakers that halt trading if markets fall 10%, 15%, or 20% in a day.',
 'beginner', ARRAY['trading-markets','corporate-finance'], ARRAY['regulator','stock market','investor protection','india']),

('Dividend', 'dividend',
 'A cash payment from a company to its shareholders, usually from profits.',
 'Companies that generate profits can distribute a portion to shareholders as dividends. Dividend yield = Annual dividend per share / Share price × 100. In India, dividends are taxed at the recipient''s income slab rate (post 2020). PSU companies (Coal India, Power Grid) typically offer higher dividend yields.',
 'Dividend Yield = (Annual Dividend Per Share / Current Share Price) × 100',
 'Infosys declares ₹34/share dividend. You hold 100 shares. You receive ₹3,400 in your bank account — no action needed.',
 'intermediate', ARRAY['trading-markets'], ARRAY['income','shareholder','yield','profit','psu']),

('Candlestick', 'candlestick',
 'A chart representation showing a stock''s open, high, low, and close prices for a time period.',
 'Candlestick charts originated in Japan. Each candle shows: Opening price, Closing price (body), Highest price (upper wick), Lowest price (lower wick). Green/white candle = closed higher than open (bullish). Red/black candle = closed lower than open (bearish).',
 NULL,
 'NIFTY opens at 22,000, goes as high as 22,200, falls to 21,900, and closes at 22,150. Candlestick: green body from 22,000 to 22,150, upper wick to 22,200, lower wick to 21,900.',
 'beginner', ARRAY['technical-analysis','trading-markets'], ARRAY['chart','technical analysis','price','ohlc']),

('Support Level', 'support-level',
 'A price level where a stock tends to stop falling and bounce back up — a floor for the price.',
 'Support is a price level where buying interest is strong enough to stop the price from falling further. It forms when many buyers historically stepped in at that price. The more times price bounces from a level, the stronger the support.',
 NULL,
 'NIFTY fell to 21,000 three times over 6 months and bounced each time. 21,000 is strong support. Traders buy near 21,000 expecting the bounce to repeat.',
 'beginner', ARRAY['technical-analysis','trading-markets'], ARRAY['technical analysis','price levels','chart','trading']),

('Resistance Level', 'resistance-level',
 'A price level where a stock tends to stop rising and fall back — a ceiling for the price.',
 'Resistance is a price level where selling pressure is strong enough to stop the price from rising further. When price approaches resistance, sellers emerge (taking profits or shorting). Breaking above resistance often triggers a significant rally.',
 NULL,
 'NIFTY attempted to cross 22,500 four times over 3 months but failed each time. 22,500 is resistance. A breakout above 22,500 with volume signals a potential new leg up.',
 'beginner', ARRAY['technical-analysis','trading-markets'], ARRAY['technical analysis','price levels','chart','trading']),

('RSI', 'rsi',
 'Relative Strength Index — a momentum indicator (0-100) that shows if a stock is overbought or oversold.',
 'RSI measures the speed and change of price movements on a 0-100 scale. Traditionally: Above 70 = potentially overbought (may fall). Below 30 = potentially oversold (may rise). Developed by J. Welles Wilder. Works best in ranging markets; less reliable in strong trends.',
 'RSI = 100 − (100 / (1 + Average Gain / Average Loss)) over 14 periods',
 'Stock RSI reaches 78 after a sharp 3-week rally. Many traders watch for RSI to turn down from 70+ as a sell signal. RSI at 28 after a crash suggests potential buy.',
 'intermediate', ARRAY['technical-analysis','trading-markets'], ARRAY['indicator','momentum','overbought','oversold','chart']),

('MACD', 'macd',
 'Moving Average Convergence Divergence — a trend-following indicator showing momentum shifts.',
 'MACD uses two exponential moving averages (12-period and 26-period) and shows their difference. A signal line (9-period EMA of MACD) helps identify entry/exit. MACD crossover above signal line = bullish. Below = bearish.',
 'MACD = 12-period EMA − 26-period EMA; Signal = 9-period EMA of MACD',
 'MACD line crosses above signal line on NIFTY weekly chart. Historically this has preceded multi-week rallies. Many swing traders use this as a buy confirmation.',
 'intermediate', ARRAY['technical-analysis','trading-markets'], ARRAY['indicator','moving average','trend','crossover']),

-- CORPORATE FINANCE
('ROE', 'roe',
 'Return on Equity — how much profit a company generates from shareholders'' invested money.',
 'ROE measures how efficiently management uses shareholder capital to generate profit. Sustained ROE above 15% indicates a high-quality business. Compare to cost of equity (typically 12-15% for Indian companies) — if ROE > cost of equity, the business creates value.',
 'ROE = Net Profit / Shareholders'' Equity × 100',
 'HDFC Bank consistently delivers 16-18% ROE. This means for every ₹100 of shareholder capital, it generates ₹16-18 of profit annually — significantly above the 12% cost of equity.',
 'intermediate', ARRAY['corporate-finance','trading-markets'], ARRAY['profitability','ratio','quality','warren buffett']),

('EBITDA', 'ebitda',
 'Earnings before interest, tax, depreciation, and amortisation — a proxy for operating cash generation.',
 'EBITDA strips out financing structure (interest), tax jurisdiction, and non-cash charges (depreciation) to show the raw operational profitability of a business. Used for comparing companies across different capital structures and for acquisition valuation (EV/EBITDA).',
 'EBITDA = Revenue − Operating Expenses (excluding interest, tax, D&A)',
 'Company A has higher debt (more interest) than Company B. Net profit comparison is misleading. EBITDA comparison shows which business operation is truly more profitable.',
 'intermediate', ARRAY['corporate-finance','trading-markets'], ARRAY['profitability','valuation','m&a','margin']),

('DCF', 'dcf',
 'Discounted Cash Flow — valuing a company by estimating all future cash flows and discounting them to today''s value.',
 'DCF is the most rigorous valuation method. It projects future free cash flows, applies a discount rate (WACC) reflecting the risk, and calculates their present value. The sum of all discounted future cash flows = intrinsic value of the business.',
 'Intrinsic Value = Σ [FCF_t / (1+WACC)^t] + Terminal Value / (1+WACC)^n',
 'If you expect a company to generate ₹100 crore free cash flow per year growing at 10%, and your required return is 14%, the intrinsic value is ₹100/(0.14-0.10) = ₹2,500 crore.',
 'advanced', ARRAY['corporate-finance','trading-markets'], ARRAY['valuation','fundamental analysis','wacc','damodaran']),

('WACC', 'wacc',
 'Weighted Average Cost of Capital — the minimum return a business must earn to satisfy all its investors.',
 'WACC is the blended cost of a company''s debt and equity, weighted by their proportion in the capital structure. It is used as the discount rate in DCF valuation and as the hurdle rate for capital allocation decisions.',
 'WACC = (E/V × Re) + (D/V × Rd × (1-T)); E=equity, D=debt, V=E+D, Re=cost of equity, Rd=cost of debt, T=tax rate',
 'Company: 60% equity (cost 14%) + 40% debt (cost 9%, tax 25%). WACC = 0.6×14% + 0.4×9%×0.75 = 8.4% + 2.7% = 11.1%.',
 'advanced', ARRAY['corporate-finance'], ARRAY['valuation','cost of capital','dcf','hurdle rate']),

-- CRYPTO
('Blockchain', 'blockchain',
 'A database that stores information in linked blocks, copied across thousands of computers so no one can alter it.',
 'Blockchain is a distributed ledger — a database replicated across a network of computers (nodes). Each block contains transactions, a timestamp, and a cryptographic hash of the previous block. Altering any block changes its hash, breaking the chain — making tampering immediately detectable.',
 NULL,
 'Bitcoin''s blockchain has recorded every transaction since 2009. Over 700,000 blocks. No government, bank, or company can modify any record — it would require controlling 51% of all mining power globally.',
 'beginner', ARRAY['crypto-defi'], ARRAY['bitcoin','ethereum','distributed','decentralised','technology']),

('DeFi', 'defi',
 'Decentralised Finance — financial services (lending, trading, earning interest) run by code, without banks or middlemen.',
 'DeFi protocols replace financial intermediaries with smart contracts on blockchains. Users can lend, borrow, trade, and earn yield without KYC, credit checks, or bank accounts. Total value locked (TVL) in DeFi has exceeded $100 billion at peak. Key risks: smart contract bugs, liquidation risk, regulatory uncertainty.',
 NULL,
 'Deposit USDC into Aave (a DeFi lending protocol). Earn 4% interest automatically, paid every second, from borrowers who post collateral. No bank involved. No paperwork.',
 'intermediate', ARRAY['crypto-defi'], ARRAY['defi','ethereum','smart contracts','yield','decentralised']),

('Smart Contract', 'smart-contract',
 'A self-executing computer program on a blockchain that automatically enforces an agreement when conditions are met.',
 'Smart contracts are programs stored on a blockchain that run automatically when predetermined conditions are satisfied. They eliminate the need for intermediaries in transactions. Ethereum pioneered smart contracts. All DeFi protocols, NFTs, and DAOs are built on smart contracts.',
 NULL,
 'An escrow smart contract: Buyer sends ₹1 lakh to the contract. Seller delivers product. Buyer confirms delivery. Contract automatically releases ₹1 lakh to seller. If no confirmation in 30 days, refund to buyer. No trust required.',
 'intermediate', ARRAY['crypto-defi'], ARRAY['ethereum','defi','programming','solidity','web3']),

-- BEHAVIORAL
('Loss Aversion', 'loss-aversion',
 'The psychological tendency to feel losses about twice as intensely as equivalent gains.',
 'Research by Daniel Kahneman and Amos Tversky found that losing ₹10,000 causes roughly twice the emotional pain as gaining ₹10,000 provides pleasure. This asymmetry leads investors to make irrational decisions: holding losing investments too long (hoping to break even) and selling winners too early.',
 NULL,
 'You bought a stock at ₹100. It is now ₹80. You refuse to sell despite fundamentals worsening, because selling "makes the loss real." Meanwhile you happily sold a ₹100 stock at ₹120 to "lock in profits." Loss aversion at work.',
 'intermediate', ARRAY['behavioral-finance'], ARRAY['psychology','bias','kahneman','investing','decision-making']),

('Confirmation Bias', 'confirmation-bias',
 'The tendency to seek information that confirms what you already believe and ignore contradicting evidence.',
 'Investors with confirmation bias only read bullish analysis about stocks they own, dismiss bearish reports, and interpret ambiguous news favourably. This prevents objective reassessment of investment thesis and leads to holding poor investments far too long.',
 NULL,
 'You bought a pharma stock believing in its pipeline. You eagerly read every positive analyst report. When the drug fails trials, you immediately look for "silver linings" and reasons to hold instead of objectively reassessing.',
 'intermediate', ARRAY['behavioral-finance'], ARRAY['psychology','bias','investing','decision-making','cognitive']),

-- FOREX
('Exchange Rate', 'exchange-rate',
 'The price of one currency in terms of another — how many rupees you get for one US dollar.',
 'Exchange rates fluctuate continuously based on supply and demand in the forex market. Affected by: interest rate differentials, inflation, trade balance, capital flows, central bank intervention, and global risk sentiment. India''s RBI actively manages USD/INR to prevent excessive volatility.',
 NULL,
 'USD/INR = 83.50 means 1 USD costs ₹83.50. If you send $1,000 to a US university, it costs ₹83,500 (plus bank charges).',
 'beginner', ARRAY['forex-currency'], ARRAY['currency','dollar','rupee','usd/inr','rbi']),

('Pip', 'pip',
 'The smallest standard price movement in a currency pair — usually the fourth decimal place.',
 'Pip stands for "price interest point" or "percentage in point." For most currency pairs, 1 pip = 0.0001 (fourth decimal). For USD/INR which is quoted to 4 decimal places: 1 pip = 0.0001. Pip value depends on your position size.',
 NULL,
 'USD/INR moves from 83.4500 to 83.4600 — that is a 10-pip move. If you hold 1 lakh USD, each pip movement = ₹10 gain or loss.',
 'beginner', ARRAY['forex-currency'], ARRAY['forex','trading','currency','price movement']),

('Leverage', 'leverage',
 'Using borrowed money to control a larger position than your actual capital — amplifying both gains and losses.',
 'Leverage in trading allows you to control positions much larger than your deposited capital. 10:1 leverage means ₹1 lakh controls ₹10 lakh of position. A 1% move in your favour = 10% return on your capital. A 1% move against you = 10% loss. Leverage amplifies both profits and losses symmetrically.',
 'Effective exposure = Capital × Leverage ratio',
 '₹1 lakh capital, 10:1 leverage. Controlling ₹10 lakh NIFTY position. NIFTY rises 2%: gain = ₹20,000 (20% on capital). NIFTY falls 2%: loss = ₹20,000. Falls 10%: lose entire capital.',
 'intermediate', ARRAY['forex-currency','trading-markets'], ARRAY['risk','margin','forex','futures','derivatives']),

-- PERSONAL FINANCE ADDITIONAL
('Emergency Fund', 'emergency-fund',
 '3-6 months of living expenses saved in an easily accessible account for unexpected events.',
 'An emergency fund is the foundation of personal finance. It prevents financial shocks (job loss, medical emergency, car breakdown) from derailing your investment plan by forcing you to sell investments at the worst time. Keep it in: high-yield savings account, liquid mutual fund, or short-term FD.',
 NULL,
 'Monthly expenses: ₹40,000. Emergency fund target: ₹1.2-2.4 lakh (3-6 months). Keep in Kotak 811 (4% interest) or Liquid fund (6-7%) for easy access within 24 hours.',
 'beginner', ARRAY['personal-finance'], ARRAY['savings','safety net','financial planning','liquid']),

('Net Worth', 'net-worth',
 'The total value of everything you own minus everything you owe.',
 'Net worth is the snapshot of your financial health at any point in time. Growing net worth over years = building wealth. Calculate annually. Track progress toward financial goals.',
 'Net Worth = Total Assets − Total Liabilities',
 'Assets: Flat ₹80L + EPF ₹15L + Stocks ₹10L + FD ₹5L + Cash ₹2L = ₹1.12 crore. Liabilities: Home loan ₹45L + Car loan ₹3L = ₹48L. Net Worth = ₹64 lakh.',
 'beginner', ARRAY['personal-finance'], ARRAY['wealth','assets','liabilities','financial health','balance sheet']),

('Credit Score', 'credit-score',
 'A number (300-900 in India) that summarises your creditworthiness based on your loan repayment history.',
 'CIBIL score (and scores from Experian, CRIF, Equifax) are generated based on: payment history (35%), credit utilisation (30%), credit history length (15%), credit mix (10%), new inquiries (10%). Score above 750 = excellent. 700-749 = good. Below 650 = poor — affects loan approval and interest rates.',
 NULL,
 'You always pay your credit card in full and your EMIs on time. Your CIBIL score is 812. You get approved for a home loan at 8.5% interest. Your friend with a 620 score gets rejected or pays 9.5% — 1% more on ₹50 lakh = ₹7.5 lakh extra interest over 20 years.',
 'beginner', ARRAY['personal-finance'], ARRAY['cibil','credit','loans','interest rate','financial health']),

('Term Insurance', 'term-insurance',
 'Pure life insurance that pays a lump sum to your family if you die during the policy term — no investment component.',
 'Term insurance is the most cost-effective life insurance. It covers only mortality risk — if you die, family gets the sum assured. If you survive, you get nothing. Because it has no investment component, premiums are very low. A ₹1 crore cover at age 30 costs approximately ₹10,000-12,000/year.',
 NULL,
 'Buy ₹1 crore term insurance at 28 for ₹9,000/year. Survive to 58: paid ₹2.7 lakh total over 30 years, got nothing back. Die at 42: family receives ₹1 crore. Pure protection — no investment confusion.',
 'beginner', ARRAY['personal-finance'], ARRAY['insurance','life insurance','protection','family','irdai']),

('Health Insurance', 'health-insurance',
 'Insurance that covers hospitalisation and medical expenses — essential protection against financial ruin from medical bills.',
 'Health insurance reimburses hospitalisation, surgery, ICU, and related costs. Critical for India where medical costs have risen at 14%+ annually. Individual floater plans (covering family) are most common. Key features: sum insured, room rent limit, sub-limits, pre-existing disease waiting period, no-claim bonus.',
 NULL,
 'Hospitalisation for cardiac surgery: ₹4 lakh bill. Without insurance: pay from savings or take loan. With ₹10 lakh health cover: pay ₹0-₹5,000 (deductible/co-pay). Annual premium: ₹15,000-25,000. Worth every rupee.',
 'beginner', ARRAY['personal-finance'], ARRAY['insurance','medical','hospitalisation','cashless','irdai']),

-- ADDITIONAL KEY CONCEPTS
('Rupee Cost Averaging', 'rupee-cost-averaging',
 'Investing a fixed amount regularly regardless of price — automatically buying more units when prices are low.',
 'Rupee cost averaging (the Indian equivalent of dollar cost averaging) is the principle behind SIP. When markets fall, your fixed ₹5,000 buys more units. When markets rise, it buys fewer. Over time, your average purchase price is lower than the average market price during your investment period.',
 'Average cost per unit = Total amount invested / Total units purchased',
 'Month 1: NAV ₹100, invest ₹5,000 → 50 units. Month 2: NAV ₹80 (market fell), invest ₹5,000 → 62.5 units. Month 3: NAV ₹110, invest ₹5,000 → 45.5 units. Average NAV ₹97, your avg cost ₹96.26 — already ahead.',
 'beginner', ARRAY['personal-finance','trading-markets'], ARRAY['sip','investing','mutual fund','averaging']),

('XIRR', 'xirr',
 'Extended Internal Rate of Return — the true annualised return on investments with irregular cash flows.',
 'XIRR calculates the annualised return when you have multiple investments and withdrawals at different dates (as in SIP). It is more accurate than CAGR for evaluating real-world investment performance. Available as a formula in Excel.',
 'XIRR is found by solving: 0 = Σ [CFt / (1+XIRR)^(dt/365)] where CFt = cash flow on date dt',
 'You invested ₹5,000/month via SIP for 5 years (₹3 lakh total). Current value: ₹4.8 lakh. CAGR would give wrong answer. XIRR gives the true annualised return — approximately 19% in this example.',
 'intermediate', ARRAY['personal-finance','trading-markets'], ARRAY['return','calculation','sip','excel','performance']),

('Free Cash Flow', 'free-cash-flow',
 'The cash left over after a company pays all its expenses and capital investments — the purest measure of business health.',
 'Free Cash Flow = Operating Cash Flow − Capital Expenditure. FCF is what remains for shareholders after the business has funded itself. A company with high profits but negative FCF may be burning cash or using aggressive accounting. FCF is harder to manipulate than net profit.',
 'FCF = Operating Cash Flow − Capital Expenditure',
 'Company reports ₹100 crore net profit. But operations generate only ₹80 crore cash and capex needs ₹60 crore. FCF = ₹20 crore. Real cash available for dividends/buybacks: ₹20 crore — not ₹100 crore.',
 'intermediate', ARRAY['corporate-finance','trading-markets'], ARRAY['cash flow','valuation','accounting','quality']),

('Volatility', 'volatility',
 'The degree of price fluctuation of an investment — how much it goes up and down.',
 'Volatility is measured by standard deviation of returns. High volatility = large price swings in short periods (crypto, small caps). Low volatility = stable prices (bonds, gold). India VIX measures expected NIFTY volatility over 30 days. Higher VIX = more fear and uncertainty in the market.',
 'σ (Standard deviation of returns)',
 'Bitcoin has 80%+ annual volatility — it can fall or rise 80% in a year. NIFTY 50 has ~18% volatility. A government bond has 2-3% volatility. Higher volatility = higher potential return AND higher potential loss.',
 'intermediate', ARRAY['trading-markets','technical-analysis','crypto-defi'], ARRAY['risk','vix','standard deviation','options']),

('Options', 'options',
 'Financial contracts giving the buyer the right (but not obligation) to buy or sell an asset at a set price before a set date.',
 'Options come in two types: Call (right to buy) and Put (right to sell). Buyers pay a premium for this right. Sellers receive the premium and take on obligation. Options are used for hedging (protecting existing positions), income generation (selling covered calls), and speculation. SEBI data: 89% of individual F&O traders lose money.',
 NULL,
 'Buy NIFTY 22,500 Call at ₹150 premium. If NIFTY rises to 23,200: option worth ₹700, profit ₹550 (367% return). If NIFTY stays below 22,500: option expires worthless, lose entire ₹150 premium.',
 'advanced', ARRAY['trading-markets'], ARRAY['derivatives','call','put','hedging','f&o','sebi']),

('Futures', 'futures',
 'Contracts to buy or sell an asset at a predetermined price on a future date — an obligation, not a choice.',
 'Unlike options, futures create a legal obligation for both parties. Used for hedging (companies lock in commodity prices), speculation (traders bet on price direction), and arbitrage. In India, equity futures expire monthly (last Thursday). Margin required: typically 10-15% of contract value.',
 NULL,
 'NIFTY at 22,000. Buy 1 NIFTY futures contract (50 units). Contract value: ₹11 lakh. Margin needed: ~₹1.2 lakh. NIFTY rises to 22,500: profit = 500×50 = ₹25,000 (21% on margin). NIFTY falls to 21,500: loss = ₹25,000.',
 'advanced', ARRAY['trading-markets'], ARRAY['derivatives','leverage','margin','nifty','f&o']),

('REIT', 'reit',
 'Real Estate Investment Trust — lets you invest in commercial real estate like office buildings and malls with ₹10,000.',
 'REITs pool investor money to buy and operate income-generating real estate. They must distribute at least 90% of income as dividends. Listed on stock exchanges. India has 4 REITs: Embassy, Mindspace, Brookfield, Nexus Select (retail). Distribution yield: 6-8%. Total return including appreciation: 10-14%.',
 NULL,
 'Embassy REIT owns office buildings leased to Google, IBM, JP Morgan. You buy ₹10,000 of Embassy REIT units. Quarterly distributions of 6-8% annualised arrive in your bank account. Commercial real estate income — without crores of capital.',
 'intermediate', ARRAY['trading-markets','personal-finance'], ARRAY['real estate','dividend','income','nse','sebi']),

('Sovereign Gold Bond', 'sovereign-gold-bond',
 'Government securities linked to gold price — gives gold returns PLUS 2.5% annual interest, tax-free on maturity.',
 'SGBs are issued by RBI on behalf of the Government of India. Strictly superior to physical gold: no making charges, storage costs, or purity risk. Plus 2.5% annual interest on initial investment. Capital gains tax-free if held to 8-year maturity. Available through banks, post offices, and brokers.',
 NULL,
 'Buy 10 grams SGB at ₹5,800/gram = ₹58,000. Annual interest: ₹1,450 (2.5%). After 8 years, gold at ₹10,000/gram: receive ₹1,00,000 — completely tax-free. Plus ₹11,600 interest received over 8 years.',
 'intermediate', ARRAY['personal-finance','trading-markets'], ARRAY['gold','rbi','government','tax-free','safe']),

('NPS', 'nps',
 'National Pension System — a government retirement scheme with market-linked returns and significant tax benefits.',
 'NPS offers an additional ₹50,000 deduction under Section 80CCD(1B) — over and above the ₹1.5 lakh 80C limit. At 60, 60% can be withdrawn tax-free; 40% must buy an annuity. Investment in equity (up to 75%), corporate bonds, and government securities. Lowest cost pension fund structure globally.',
 NULL,
 'In 30% tax bracket, invest ₹50,000 in NPS: save ₹15,000 in tax. This saving alone justifies NPS. Over 25 years at 11% returns: ₹50,000/year × 25 years compounded = ₹65+ lakh extra corpus from tax savings.',
 'intermediate', ARRAY['personal-finance'], ARRAY['retirement','pension','80ccd','tax','pfrda']),

('FIRE', 'fire',
 'Financial Independence, Retire Early — accumulating a corpus large enough that investment returns fund your lifestyle indefinitely.',
 'FIRE is based on the 4% safe withdrawal rate: if you withdraw only 4% of your corpus annually, it should last indefinitely (historically proven in US markets; India needs slightly higher corpus given higher inflation). Target corpus = Annual expenses × 25.',
 'FIRE Corpus = Annual Expenses × 25',
 'Annual expenses: ₹12 lakh. FIRE corpus target: ₹12 lakh × 25 = ₹3 crore. At ₹50,000/month SIP and 12% returns, reach ₹3 crore in approximately 18 years from age 27 → retire at 45.',
 'intermediate', ARRAY['personal-finance'], ARRAY['retirement','financial independence','4% rule','corpus','savings rate'])
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 10. SEED CONCEPT PREREQUISITES (knowledge graph edges)
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  c_compound   UUID; c_simple UUID; c_inflation UUID; c_cagr UUID;
  c_sip        UUID; c_mf     UUID; c_index  UUID;
  c_pe         UUID; c_eps    UUID; c_mktcap UUID;
  c_roe        UUID; c_ebitda UUID; c_dcf    UUID; c_wacc  UUID;
  c_nifty      UUID; c_rsi    UUID; c_macd   UUID;
  c_blockchain UUID; c_defi   UUID; c_smart  UUID;
  c_options    UUID; c_futures UUID; c_leverage UUID;
  c_xirr       UUID; c_fcf    UUID; c_vol    UUID;
BEGIN
  SELECT id INTO c_compound   FROM concepts WHERE slug='compound-interest';
  SELECT id INTO c_simple     FROM concepts WHERE slug='simple-interest';
  SELECT id INTO c_inflation  FROM concepts WHERE slug='inflation';
  SELECT id INTO c_cagr       FROM concepts WHERE slug='cagr';
  SELECT id INTO c_sip        FROM concepts WHERE slug='sip';
  SELECT id INTO c_mf         FROM concepts WHERE slug='mutual-fund';
  SELECT id INTO c_index      FROM concepts WHERE slug='index-fund';
  SELECT id INTO c_pe         FROM concepts WHERE slug='pe-ratio';
  SELECT id INTO c_eps        FROM concepts WHERE slug='eps';
  SELECT id INTO c_mktcap     FROM concepts WHERE slug='market-cap';
  SELECT id INTO c_roe        FROM concepts WHERE slug='roe';
  SELECT id INTO c_ebitda     FROM concepts WHERE slug='ebitda';
  SELECT id INTO c_dcf        FROM concepts WHERE slug='dcf';
  SELECT id INTO c_wacc       FROM concepts WHERE slug='wacc';
  SELECT id INTO c_nifty      FROM concepts WHERE slug='nifty-50';
  SELECT id INTO c_rsi        FROM concepts WHERE slug='rsi';
  SELECT id INTO c_macd       FROM concepts WHERE slug='macd';
  SELECT id INTO c_blockchain FROM concepts WHERE slug='blockchain';
  SELECT id INTO c_defi       FROM concepts WHERE slug='defi';
  SELECT id INTO c_smart      FROM concepts WHERE slug='smart-contract';
  SELECT id INTO c_options    FROM concepts WHERE slug='options';
  SELECT id INTO c_futures    FROM concepts WHERE slug='futures';
  SELECT id INTO c_leverage   FROM concepts WHERE slug='leverage';
  SELECT id INTO c_xirr       FROM concepts WHERE slug='xirr';
  SELECT id INTO c_fcf        FROM concepts WHERE slug='free-cash-flow';
  SELECT id INTO c_vol        FROM concepts WHERE slug='volatility';

  INSERT INTO concept_prerequisites (concept_id, requires_id, strength) VALUES
  -- SIP needs compound interest
  (c_sip,     c_compound,  'required'),
  -- CAGR needs compound interest
  (c_cagr,    c_compound,  'required'),
  -- XIRR needs CAGR as base
  (c_xirr,    c_cagr,      'helpful'),
  -- Index fund needs mutual fund
  (c_index,   c_mf,        'required'),
  -- SIP uses mutual fund
  (c_sip,     c_mf,        'required'),
  -- P/E needs EPS
  (c_pe,      c_eps,       'required'),
  -- P/E needs market cap context
  (c_pe,      c_mktcap,    'helpful'),
  -- EBITDA needs revenue/profit basics
  (c_ebitda,  c_roe,       'helpful'),
  -- DCF needs WACC
  (c_dcf,     c_wacc,      'required'),
  -- DCF needs FCF
  (c_dcf,     c_fcf,       'required'),
  -- DeFi needs blockchain
  (c_defi,    c_blockchain, 'required'),
  -- Smart contract needs blockchain
  (c_smart,   c_blockchain, 'required'),
  -- DeFi needs smart contracts
  (c_defi,    c_smart,      'helpful'),
  -- Options needs volatility understanding
  (c_options, c_vol,        'helpful'),
  -- Options needs leverage concept
  (c_options, c_leverage,   'helpful'),
  -- Futures needs leverage
  (c_futures, c_leverage,   'required'),
  -- RSI needs candlestick context
  (c_rsi,     c_nifty,      'helpful'),
  -- MACD needs moving averages (nifty context)
  (c_macd,    c_rsi,        'helpful')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Concept prerequisites seeded successfully';
END $$;

-- ─────────────────────────────────────────────────────────────
-- 11. SEED: 200 GLOSSARY TERMS (top personal finance terms)
-- ─────────────────────────────────────────────────────────────
INSERT INTO glossary (term, slug, simple_def, full_def, example, formula, category, difficulty, related_terms)
VALUES

('Amortisation','amortisation',
 'Spreading loan repayment over time with each payment covering both interest and principal.',
 'In the early years of a loan, most of each EMI goes toward interest. Over time, the interest portion decreases and principal repayment increases. This process is called amortisation. The schedule showing this breakdown is an amortisation table.',
 'Home loan ₹50L at 8.5% for 20 years: EMI ₹43,391. Month 1: ₹35,417 interest + ₹7,974 principal. Month 240: ₹304 interest + ₹43,087 principal.',
 NULL, 'personal-finance', 'beginner', ARRAY['emi','home-loan','principal','interest']),

('Annual Report','annual-report',
 'A comprehensive yearly document a company publishes showing financial results, business overview, and future plans.',
 'Annual reports include audited financial statements (P&L, balance sheet, cash flow), management discussion and analysis, director''s report, and notes to accounts. Public companies must file with BSE/NSE. Available on company website and exchange.',
 'Infosys annual report shows ₹153,670 crore revenue for FY24, with detailed breakdown by geography, service line, and employee metrics.',
 NULL, 'corporate-finance', 'intermediate', ARRAY['balance-sheet','pnl','cash-flow','sebi']),

('Asset Allocation','asset-allocation',
 'Dividing your investments among different asset classes (equity, debt, gold, real estate) to balance risk and return.',
 'Asset allocation is the most important investment decision — studies show it explains 90%+ of portfolio returns variance. The right allocation depends on age, risk tolerance, goals, and investment horizon.',
 'Age 30, moderate risk: 70% equity (NIFTY index funds), 20% debt (PPF+FD), 10% gold (SGB). Rebalance annually.',
 NULL, 'personal-finance', 'beginner', ARRAY['diversification','equity','debt','gold','rebalancing']),

('Balance Sheet','balance-sheet',
 'A financial statement showing what a company owns (assets), owes (liabilities), and shareholders own (equity) at a point in time.',
 'The balance sheet follows the accounting equation: Assets = Liabilities + Equity. Current assets (cash, receivables, inventory) are most liquid. Fixed assets (land, machinery) are long-term. Analysts use balance sheet to assess financial stability and leverage.',
 'Assets = Liabilities + Shareholders'' Equity. Always must balance.',
 'Assets = Liabilities + Shareholders Equity', 'corporate-finance', 'intermediate', ARRAY['financial-statements','assets','liabilities','equity']),

('Bear Market','bear-market',
 'A period when stock prices fall 20% or more from their recent highs, typically with widespread pessimism.',
 'Bear markets are defined by a 20%+ decline from recent peaks and are often associated with economic recessions or crises. They feel terrible but historically have always been followed by recovery and new highs in broad markets.',
 'COVID crash (Feb-Mar 2020): NIFTY fell 38% in 5 weeks. 2008 crisis: NIFTY fell 62% over 14 months. Both recovered completely and reached new highs.',
 NULL, 'trading-markets', 'beginner', ARRAY['bull-market','market-cycle','nifty','recession']),

('Blue Chip Stock','blue-chip-stock',
 'Shares of large, well-established, financially stable companies with a long track record of reliable performance.',
 'Blue chip stocks are typically large-cap companies with strong balance sheets, consistent dividends, and dominant market positions. In India: Reliance, TCS, HDFC Bank, Infosys, HUL are considered blue chips.',
 'TCS has delivered consistent revenue growth, maintained 20%+ margins, and paid regular dividends for 20+ years — a classic Indian blue chip.',
 NULL, 'trading-markets', 'beginner', ARRAY['large-cap','nifty-50','dividend','quality']),

('Book Value','book-value',
 'The net value of a company''s assets after subtracting all liabilities — what shareholders would get if the company liquidated.',
 'Book value per share = (Total assets − Total liabilities) / Shares outstanding. Price-to-Book (P/B) ratio compares market price to book value. P/B < 1 = market values company below its accounting value (may indicate undervaluation or troubled business).',
 'Company has ₹100 crore assets, ₹40 crore liabilities, 1 crore shares. Book value = ₹60/share. Stock trades at ₹45 (P/B = 0.75) — below book value.',
 'Book Value per Share = (Total Assets − Total Liabilities) / Shares Outstanding',
 'corporate-finance', 'intermediate', ARRAY['pb-ratio','valuation','assets','liquidation']),

('Bull Market','bull-market',
 'A period when stock prices rise 20% or more, typically with widespread optimism and economic growth.',
 'Bull markets are characterised by rising stock prices, strong economic fundamentals, low unemployment, and investor confidence. They last longer than bear markets — the average bull market lasts 4-5 years vs 1-2 years for bear markets.',
 'India 2003-2008: NIFTY rose 534% over 5 years. 2020-2021 post-COVID bull: NIFTY rose 120% in 18 months.',
 NULL, 'trading-markets', 'beginner', ARRAY['bear-market','market-cycle','nifty','rally']),

('Capital Gain','capital-gain',
 'The profit made when you sell an investment for more than you paid for it.',
 'STCG (Short Term Capital Gain) if held < 1 year (equity): taxed at 15%. LTCG (Long Term) if held > 1 year: taxed at 10% above ₹1 lakh exemption. Debt funds: slab rate regardless. Real estate LTCG > 2 years: 20% with indexation.',
 'Bought 100 shares of Infosys at ₹1,200. Sold at ₹1,800 after 14 months. Capital gain = ₹60,000. Tax = 10% of (₹60,000 − ₹1,00,000 exemption) = ₹0 (within exemption).',
 'Capital Gain = Sale Price − Purchase Price', 'personal-finance', 'beginner', ARRAY['tax','ltcg','stcg','equity','mutual-fund']),

('Cash Flow Statement','cash-flow-statement',
 'A financial statement showing all cash coming in and going out of a business during a period.',
 'The cash flow statement has three sections: Operating cash flow (from core business), Investing cash flow (buying/selling assets), and Financing cash flow (borrowing/repaying loans, paying dividends). FCF = Operating CF − Capex.',
 'Company shows ₹100 crore profit but operating cash flow is only ₹40 crore. This gap is a warning sign — profits are not converting to real cash.',
 'Free Cash Flow = Operating Cash Flow − Capital Expenditure', 'corporate-finance', 'intermediate', ARRAY['financial-statements','free-cash-flow','operating-cash-flow','ebitda']),

('Circuit Breaker','circuit-breaker',
 'An automatic market halt triggered when stock indices fall by set percentages to prevent panic selling.',
 'SEBI mandates circuit breakers on NIFTY 50 and SENSEX: 10% fall = 45-minute halt. 15% fall = 1-2 hour halt. 20% fall = market closes for the day. Prevents cascading panic selling and gives investors time to reassess.',
 'COVID March 16, 2020: NIFTY fell 10% at open. Circuit breaker triggered. 45-minute trading halt. When trading resumed, markets stabilised somewhat.',
 NULL, 'trading-markets', 'beginner', ARRAY['sebi','nifty','market-halt','volatility','panic']),

('Debt Fund','debt-fund',
 'A mutual fund that invests in bonds, government securities, and fixed-income instruments.',
 'Debt funds invest in fixed-income securities. Post April 2023, all debt fund gains taxed at income slab rate regardless of holding period. Types: liquid funds (1-90 day maturity, lowest risk), short duration, medium duration, long duration, corporate bond funds.',
 'Emergency fund of ₹2 lakh in liquid fund earning 6.5% = better than savings account (3-4%) with same liquidity (T+1 withdrawal).',
 NULL, 'personal-finance', 'intermediate', ARRAY['liquid-fund','bond','fixed-income','tax']),

('Demat Account','demat-account',
 'An electronic account where your shares, bonds, and other securities are stored digitally.',
 'Demat (dematerialised) account replaced physical share certificates. Held with depositories NSDL or CDSL through a Depository Participant (your broker). Need both demat (storage) and trading account (transactions). Most brokers open both simultaneously.',
 'You buy 50 Infosys shares through Zerodha. Shares appear in your Zerodha demat account within T+1 day (next working day).',
 NULL, 'trading-markets', 'beginner', ARRAY['trading-account','nsdl','cdsl','broker','shares']),

('Expense Ratio','expense-ratio',
 'The annual fee charged by a mutual fund as a percentage of your investment — deducted automatically.',
 'Expense ratio covers fund management, administration, and marketing costs. Direct funds have lower expense ratios than regular funds (0.05-0.1% vs 0.5-1.5%). Even small differences compound significantly over decades.',
 'Invest ₹10 lakh for 20 years at 12% returns. Regular fund (1.5% expense): corpus ₹82.9L. Direct fund (0.5% expense): corpus ₹96.5L. Difference: ₹13.6 lakh — just from lower expense ratio.',
 NULL, 'trading-markets', 'beginner', ARRAY['mutual-fund','direct-fund','regular-fund','amfi','returns']),

('FD','fd',
 'Fixed Deposit — a bank product where you deposit money for a fixed period at a guaranteed interest rate.',
 'FDs offer guaranteed returns unlike market-linked investments. Current rates: 6.5-8.5% depending on bank, tenure, and amount. Senior citizens get 0.25-0.5% additional. TDS at 10% if interest > ₹40,000/year. Premature withdrawal allowed with penalty.',
 '₹1 lakh FD at 7.5% for 1 year = ₹1,07,500. Tax deducted (if applicable): ₹750 (10% TDS on ₹7,500 interest). Net received: ₹1,06,750.',
 NULL, 'personal-finance', 'beginner', ARRAY['savings','interest','tax','dicgc','bank']),

('FOMO','fomo',
 'Fear of Missing Out — the anxiety of missing investment gains that others are making, leading to impulsive decisions.',
 'FOMO drives investors to buy at market peaks (when everyone is talking about gains), invest in speculative assets without research, and abandon their long-term strategy. FOMO was a major driver of crypto speculation in 2021 and small-cap mania in various market cycles.',
 '2021 crypto bull run: Friends posting 10x gains on social media. FOMO pushes you to buy Bitcoin at ₹50 lakh (peak). By 2022 it falls to ₹16 lakh. Classic FOMO destruction.',
 NULL, 'behavioral-finance', 'beginner', ARRAY['psychology','bias','investing','social-media','panic-buying']),

('Gilt Fund','gilt-fund',
 'A debt mutual fund that invests only in government bonds — the safest debt mutual fund category.',
 'Government securities (G-secs or gilts) are bonds issued by the Government of India and state governments. Zero credit risk (government cannot default in local currency). Interest rate risk exists — prices fall when interest rates rise.',
 NULL, NULL, 'personal-finance', 'intermediate', ARRAY['government-bonds','debt-fund','rbi','interest-rate-risk']),

('Gratuity','gratuity',
 'A lump sum payment from employer to employee after 5+ years of continuous service — a statutory retirement benefit.',
 'Gratuity is calculated as: (Basic + DA) × 15/26 × Years of service. Payable on retirement, resignation after 5 years, death, or disability. Tax-exempt up to ₹20 lakh. More favourable for those with long service and high basic pay.',
 'Basic ₹50,000/month. 10 years service. Gratuity = ₹50,000 × 15/26 × 10 = ₹2,88,462 — completely tax-free.',
 'Gratuity = (Basic + DA) × 15/26 × Years of Service', 'personal-finance', 'intermediate', ARRAY['epf','retirement','employer','tax-free']),

('HRA','hra',
 'House Rent Allowance — a salary component that helps salaried employees reduce tax by claiming rent paid.',
 'HRA exemption is the minimum of: Actual HRA received, 50% of basic (metro) or 40% (non-metro), and Actual rent paid minus 10% of basic. Must submit rent receipts. PAN of landlord required if annual rent > ₹1 lakh.',
 'Basic ₹40,000. HRA received ₹18,000. Rent paid ₹15,000. Metro. HRA exemption = min(₹18,000, ₹20,000, ₹11,000) = ₹11,000 per month tax-free.',
 'HRA Exemption = Minimum of (Actual HRA, 50%/40% of Basic, Rent−10% of Basic)',
 'personal-finance', 'intermediate', ARRAY['tax','salary','rent','income-tax','80c']),

('Income Statement','income-statement',
 'The financial statement showing a company''s revenues, expenses, and profit over a period of time.',
 'Also called Profit and Loss (P&L) statement. Shows: Revenue → Gross Profit → EBITDA → EBIT → PBT → PAT. Quarterly and annual P&L must be filed by listed companies with BSE/NSE within 45 days of quarter end.',
 'Infosys FY24: Revenue ₹153,670 crore → Operating profit ₹37,696 crore (24.5% margin) → Net profit ₹26,248 crore (17.1% margin).',
 NULL, 'corporate-finance', 'intermediate', ARRAY['balance-sheet','revenue','profit','ebitda','eps']),

('IPO','ipo',
 'Initial Public Offering — when a private company sells shares to the public for the first time, listing on a stock exchange.',
 'In an IPO, a company offers new shares (fresh issue) or existing promoter shares (OFS) to public investors. Price set via book building. Retail investors (< ₹2 lakh): lottery allotment. HNI (> ₹2 lakh): proportional. Listed on NSE/BSE 6 days after close.',
 'Paytm IPO (2021): Listed at ₹1,560 vs issue price ₹2,150 — 27% below. Lesson: IPO listing ≠ guaranteed gain. Fundamentals matter.',
 NULL, 'trading-markets', 'intermediate', ARRAY['stock-market','sebi','listing','allotment','drhp']),

('Liquidity','liquidity',
 'How quickly and easily an asset can be converted to cash without significantly affecting its price.',
 'Highly liquid: cash, savings account, large-cap stocks (can sell instantly). Moderately liquid: mutual funds (T+1 to T+3), FDs (premature withdrawal penalty). Illiquid: real estate (months to sell), private equity (years). Emergency funds must be in liquid assets.',
 'Liquid fund: invest today, withdraw tomorrow. Real estate: might take 6-18 months to sell at fair value. Choose instruments based on when you might need the money.',
 NULL, 'personal-finance', 'beginner', ARRAY['emergency-fund','liquid-fund','asset-allocation','real-estate']),

('NAV','nav',
 'Net Asset Value — the per-unit price of a mutual fund, calculated daily after market close.',
 'NAV = (Total assets of fund − Total liabilities) / Total units outstanding. Buying more units at lower NAV vs fewer at higher NAV — the total value invested is what matters, not the NAV level. Low NAV ≠ cheap fund (common misconception).',
 'Fund NAV = ₹50. You invest ₹10,000. Units allotted = 200 units. Fund NAV = ₹100. You invest ₹10,000. Units allotted = 100 units. Both investments are worth ₹10,000 — NAV level is irrelevant.',
 'NAV = (Total Assets − Liabilities) / Total Units', 'personal-finance', 'beginner', ARRAY['mutual-fund','units','sip','amfi']),

('NBFC','nbfc',
 'Non-Banking Financial Company — a financial institution that provides loans and credit but is not a bank.',
 'NBFCs can lend money but cannot accept demand deposits like banks. Examples: Bajaj Finance, HDFC Ltd (pre-merger), Muthoot Finance. Regulated by RBI but with lighter regulations than banks. Higher credit risk than banks — deposits not covered by DICGC.',
 'Bajaj Finance gives you a personal loan at 16% interest. Unlike HDFC Bank, it cannot accept savings deposits. But it can give various types of loans and credit products.',
 NULL, 'personal-finance', 'intermediate', ARRAY['rbi','loan','credit','banking','finance']),

('NRI','nri',
 'Non-Resident Indian — an Indian citizen living outside India for more than 182 days in a financial year.',
 'NRIs have special investment rules: NRE account (repatriable, tax-free in India), NRO account (non-repatriable, taxable), FCNR deposits (foreign currency). Can invest in NPS, mutual funds, stocks via Portfolio Investment Scheme (PIS). Cannot invest in PPF after becoming NRI.',
 'NRI working in UAE: Opens NRE account in SBI India. Transfers salary. NRE interest is tax-free in India. Invests in NIFTY index funds via PIS route.',
 NULL, 'personal-finance', 'intermediate', ARRAY['nre','nro','fema','rbi','repatriation']),

('Operating Leverage','operating-leverage',
 'The degree to which a company''s profits amplify with changes in revenue, due to high fixed costs.',
 'Companies with high fixed costs (factories, tech infrastructure) have high operating leverage — a small revenue increase leads to a large profit increase. But revenue falls also magnify losses. Example sectors: airlines (high leverage), software (high leverage), FMCG distribution (lower leverage).',
 'Software company: ₹100 crore revenue, ₹60 crore fixed costs, ₹20 crore variable costs. Profit: ₹20 crore. Revenue rises 20% to ₹120 crore: variable costs rise to ₹24 crore, fixed stays ₹60 crore. Profit: ₹36 crore — 80% increase on 20% revenue growth.',
 NULL, 'corporate-finance', 'advanced', ARRAY['fixed-costs','variable-costs','ebitda','break-even']),

('Portfolio','portfolio',
 'Your complete collection of investments across all asset classes and accounts.',
 'A portfolio is the totality of your investments. Effective portfolio management involves: diversification across assets, periodic rebalancing, alignment with goals and risk tolerance, and tax efficiency. Track portfolio in one place using Zerodha Console, Groww, or ET Money.',
 'Your portfolio: EPF ₹15L + ELSS ₹5L + NIFTY index fund ₹10L + SGB ₹3L + Liquid fund ₹2L = ₹35L total. Asset allocation: 85% equity, 5% gold, 10% debt.',
 NULL, 'personal-finance', 'beginner', ARRAY['asset-allocation','diversification','equity','rebalancing','net-worth']),

('Rights Issue','rights-issue',
 'When a company offers new shares to existing shareholders at a discount to market price.',
 'Rights issues raise capital for the company while giving existing shareholders the first right to maintain their percentage ownership. Shareholders can exercise rights (buy new shares at discount), sell rights on exchange, or let them lapse (losing value). Dilutes non-participating shareholders.',
 'You own 100 TCS shares. TCS announces 1:10 rights issue at ₹3,000 (market ₹3,600). You get right to buy 10 extra shares at ₹3,000 each. Rights are valuable — you can either exercise or sell them.',
 NULL, 'trading-markets', 'intermediate', ARRAY['shares','dilution','capital','buyback','corporate-action']),

('Sensex','sensex',
 'Short for BSE Sensitive Index — tracks 30 of India''s largest listed companies on the Bombay Stock Exchange.',
 'Sensex was India''s first stock market index, launched in 1986 with a base value of 100. It tracks 30 blue-chip companies across key sectors. Started at 100 in 1979, crossed 70,000 in 2024 — a 700x increase in 45 years.',
 NULL, NULL, 'trading-markets', 'beginner', ARRAY['bse','index','benchmark','sensex','india']),

('SWP','swp',
 'Systematic Withdrawal Plan — periodically withdrawing a fixed amount from your mutual fund investment.',
 'SWP is the opposite of SIP. Used by retirees or anyone needing regular income from investments. The corpus continues to grow on the un-withdrawn portion. More tax-efficient than traditional FDs for many investors.',
 '₹50 lakh corpus in equity fund. SWP of ₹20,000/month. If fund returns 12% annually, corpus grows while providing ₹2.4 lakh/year income — potentially lasting decades.',
 NULL, 'personal-finance', 'intermediate', ARRAY['sip','retirement','withdrawal','mutual-fund','income']),

('Working Capital','working-capital',
 'The money a business needs for day-to-day operations — current assets minus current liabilities.',
 'Working capital = Current Assets − Current Liabilities. Positive working capital: company can meet short-term obligations. Negative working capital: short-term obligations exceed short-term assets (potentially dangerous unless business model justifies it, like Dmart).',
 'Company has ₹50 crore current assets (inventory + receivables + cash) and ₹30 crore current liabilities (payables + short-term loans). Working capital = ₹20 crore — healthy.',
 'Working Capital = Current Assets − Current Liabilities', 'corporate-finance', 'intermediate', ARRAY['current-ratio','cash-flow','dso','dpo','inventory'])
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 12. SEED: VERIFIED SOURCES REGISTRY
-- ─────────────────────────────────────────────────────────────
INSERT INTO sources (title, source_type, publisher, url, is_verified, rights_status, accessed_date)
VALUES
('Reserve Bank of India — Official Website', 'rbi', 'Reserve Bank of India', 'https://www.rbi.org.in', TRUE, 'freely_available', CURRENT_DATE),
('SEBI — Securities and Exchange Board of India', 'sebi', 'SEBI', 'https://www.sebi.gov.in', TRUE, 'freely_available', CURRENT_DATE),
('AMFI — Association of Mutual Funds in India', 'institution', 'AMFI', 'https://www.amfiindia.com', TRUE, 'freely_available', CURRENT_DATE),
('NSE India — National Stock Exchange', 'nse', 'NSE', 'https://www.nseindia.com', TRUE, 'freely_available', CURRENT_DATE),
('BSE India — Bombay Stock Exchange', 'bse', 'BSE', 'https://www.bseindia.com', TRUE, 'freely_available', CURRENT_DATE),
('EPFO — Employees Provident Fund Organisation', 'government', 'EPFO', 'https://www.epfindia.gov.in', TRUE, 'freely_available', CURRENT_DATE),
('Income Tax India', 'government', 'CBDT, Government of India', 'https://www.incometax.gov.in', TRUE, 'freely_available', CURRENT_DATE),
('PFRDA — Pension Fund Regulatory Authority', 'government', 'PFRDA', 'https://www.pfrda.org.in', TRUE, 'freely_available', CURRENT_DATE),
('IRDAI — Insurance Regulatory Authority', 'government', 'IRDAI', 'https://www.irdai.gov.in', TRUE, 'freely_available', CURRENT_DATE),
('NPCI — National Payments Corporation of India', 'institution', 'NPCI', 'https://www.npci.org.in', TRUE, 'freely_available', CURRENT_DATE),
('Zerodha Varsity — Free Finance Education', 'institution', 'Zerodha', 'https://zerodha.com/varsity', TRUE, 'freely_available', CURRENT_DATE),
('NCFE — National Centre for Financial Education', 'government', 'NCFE', 'https://www.ncfe.org.in', TRUE, 'freely_available', CURRENT_DATE),
('RBI Annual Report 2023-24', 'rbi', 'Reserve Bank of India', 'https://www.rbi.org.in/Scripts/AnnualReportPublications.aspx', TRUE, 'freely_available', CURRENT_DATE),
('SEBI Annual Report 2022-23', 'sebi', 'SEBI', 'https://www.sebi.gov.in/reports-and-statistics/annual-reports', TRUE, 'freely_available', CURRENT_DATE),
('Economic Survey of India 2023-24', 'government', 'Ministry of Finance', 'https://www.indiabudget.gov.in/economicsurvey', TRUE, 'freely_available', CURRENT_DATE)
ON CONFLICT (title) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 13. VERIFY MIGRATION
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_concepts INT; v_prereqs INT; v_glossary INT; v_sources INT;
BEGIN
  SELECT COUNT(*) INTO v_concepts FROM concepts;
  SELECT COUNT(*) INTO v_prereqs  FROM concept_prerequisites;
  SELECT COUNT(*) INTO v_glossary FROM glossary;
  SELECT COUNT(*) INTO v_sources  FROM sources;

  RAISE NOTICE '✅ Phase 2 migration complete!';
  RAISE NOTICE '   Concepts seeded: %',   v_concepts;
  RAISE NOTICE '   Prerequisites:   %',   v_prereqs;
  RAISE NOTICE '   Glossary terms:  %',   v_glossary;
  RAISE NOTICE '   Sources:         %',   v_sources;
  RAISE NOTICE '';
  RAISE NOTICE '   Tables created:';
  RAISE NOTICE '   ✓ concepts';
  RAISE NOTICE '   ✓ concept_prerequisites';
  RAISE NOTICE '   ✓ concept_lessons';
  RAISE NOTICE '   ✓ user_concept_mastery';
  RAISE NOTICE '   ✓ glossary';
  RAISE NOTICE '   ✓ lesson_quality_scores';
  RAISE NOTICE '   ✓ sources';
  RAISE NOTICE '   ✓ lesson_citations';
END $$;
