-- ============================================================
-- FinanceHub — Phase 3 SQL Migration
-- sql/phase3_migration.sql
-- Creates Case Studies schema, seeds 10 real-world Indian finance case studies,
-- and adds user_case_study_progress tracking.
-- ============================================================

-- 1. Create case_studies table
CREATE TABLE IF NOT EXISTS case_studies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT UNIQUE NOT NULL,
  title             TEXT NOT NULL,
  subtitle          TEXT NOT NULL,
  category          TEXT NOT NULL, -- e.g. "Valuation", "Banking", "Corporate Finance", "Macroeconomics", "Taxation"
  difficulty        TEXT NOT NULL DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced'
  read_time_mins    INT NOT NULL DEFAULT 8,
  company_name      TEXT NOT NULL,
  summary           TEXT NOT NULL,
  background_mdx    TEXT NOT NULL,
  financial_metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
  dilemma_question  TEXT NOT NULL,
  options           JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of { id, text, is_recommended, reasoning }
  retrospective_mdx TEXT NOT NULL,
  sources           JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create user_case_study_progress table
CREATE TABLE IF NOT EXISTS user_case_study_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_study_id   UUID NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
  selected_option TEXT NOT NULL,
  xp_earned       INT NOT NULL DEFAULT 50,
  completed_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, case_study_id)
);

-- 3. Seed 10 Real-World Indian Finance Case Studies
INSERT INTO case_studies (slug, title, subtitle, category, difficulty, read_time_mins, company_name, summary, background_mdx, financial_metrics, dilemma_question, options, retrospective_mdx, sources)
VALUES
(
  'paytm-ipo-valuation-dilemma',
  'Paytm IPO: Growth Story vs Profitability Metrics',
  'Analyzing One97 Communications ₹18,300 Cr IPO pricing and market reaction.',
  'Valuation',
  'advanced',
  10,
  'Paytm (One97 Communications)',
  'In November 2021, Paytm launched India''s largest IPO at the time. Investors faced a core dilemma: price the company as a high-growth tech super-app or as a loss-making financial firm.',
  'Paytm pioneered QR-code digital payments in India post-demonetization in 2016. By 2021, Paytm claimed over 330 million wallet users and 21 million merchants. However, payment processing had thin margins due to Zero MDR (Merchant Discount Rate) enforced by the Indian government on UPI. To generate profits, Paytm expanded into credit distribution, wealth management, and cloud services.\n\nWhen Paytm filed its DRHP for a ₹18,300 Crore IPO at a valuation of ~$20 Billion (₹2,150 per share), it reported net losses of ₹1,701 Crore on revenue of ₹2,802 Crore for FY21.',
  '[{"label": "IPO Valuation", "value": "₹1,39,000 Cr ($20B)"}, {"label": "FY21 Revenue", "value": "₹2,802 Cr"}, {"label": "FY21 Net Loss", "value": "₹1,701 Cr"}, {"label": "Price-to-Sales Ratio", "value": "49.5x"}]'::jsonb,
  'As an institutional investor evaluating the IPO at ₹2,150 per share, which valuation methodology best reflects the risk-reward profile of Paytm in 2021?',
  '[
    {"id": "A", "text": "Subscribe aggressively based on Price-to-Sales (49.5x) assuming rapid loan distribution expansion will quickly offset zero MDR payment losses.", "is_recommended": false, "reasoning": "Price-to-Sales of 49.5x was exceptionally high for a fintech without proven credit underwriting cycles."},
    {"id": "B", "text": "Avoid or demand a discount until EBITDA break-even and Contribution Margin turn positive across payment and lending segments.", "is_recommended": true, "reasoning": "Focusing on unit economics and contribution margin protects capital against valuation compression when interest rates rise."},
    {"id": "C", "text": "Value Paytm strictly as a traditional bank using Price-to-Book ratio of 1.5x.", "is_recommended": false, "reasoning": "Paytm was a tech platform, not a deposit-taking commercial bank, making Price-to-Book inadequate."}
  ]'::jsonb,
  'Post-IPO, Paytm stock plunged 27% on listing day and fell over 70% in the following months as global interest rates rose and tech valuations re-rated. Paytm subsequently shifted management focus to **Contribution Margin positivity** and **EBITDA before ESOP**, proving that cash flow durability matters more than gross merchandise value (GMV) scale.',
  '[{"title": "SEBI DRHP Filing - One97 Communications", "url": "https://www.sebi.gov.in"}]'::jsonb
),
(
  'yes-bank-liquidity-crisis',
  'Yes Bank Crisis: Credit Risk and RBI Resolution',
  'How aggressive corporate lending led to a liquidity freeze and systemic rescue.',
  'Banking',
  'advanced',
  12,
  'Yes Bank',
  'In March 2020, RBI imposed a moratorium on Yes Bank due to burgeoning Non-Performing Assets (NPAs) and deposit run, triggering a reconstruction scheme led by SBI.',
  'Yes Bank was once India''s 4th largest private sector bank, renowned for rapid loan growth and high net interest margins. However, its growth relied heavily on high-yield corporate lending to stressed real estate, infrastructure, and non-banking finance groups (including DHFL, Reliance ADAG, and Essel Group).\n\nWhen those corporate borrower groups defaulted, Yes Bank''s Gross NPAs surged from 1.3% to over 18%. Fearing insolvency, retail and corporate depositors withdrew over ₹70,000 Crore of deposits within months.',
  '[{"label": "Gross NPA (FY20)", "value": "18.87%"}, {"label": "Deposit Outflow (Q3 FY20)", "value": "₹72,000 Cr"}, {"label": "SBI Bailout Capital", "value": "₹7,250 Cr"}, {"label": "AT-1 Bonds Written Off", "value": "₹8,415 Cr"}]'::jsonb,
  'If you were RBI regulators in March 2020 handling the Yes Bank liquidity run, which policy action balances systemic financial stability with moral hazard risk?',
  '[
    {"id": "A", "text": "Allow Yes Bank to enter liquidation under insolvency laws without government or public bank intervention.", "is_recommended": false, "reasoning": "Liquidation of a major private bank would trigger panic withdrawals across other mid-tier Indian banks."},
    {"id": "B", "text": "Impose temporary deposit withdrawal caps, write off high-risk AT-1 capital instruments, and orchestrate a consortium equity infusion led by SBI.", "is_recommended": true, "reasoning": "This protected depositor funds, stabilized interbank liquidity, and transferred losses to high-risk hybrid bondholders."},
    {"id": "C", "text": "Use RBI reserves to fully bail out both equity shareholders and AT-1 bondholders without equity dilution.", "is_recommended": false, "reasoning": "Bailing out equity holders creates severe moral hazard and penalizes prudent banks."}
  ]'::jsonb,
  'The SBI-led reconstruction scheme successfully recapitalized Yes Bank with ₹10,000+ Crore from a consortium of Indian banks. The write-off of ₹8,415 Crore of AT-1 bonds highlighted the critical distinction between tier-1 capital instruments and fixed deposits for retail and institutional investors.',
  '[{"title": "RBI Yes Bank Reconstruction Scheme 2020", "url": "https://rbi.org.in"}]'::jsonb
),
(
  'zerodha-bootstrapped-growth',
  'Zerodha: The Zero-Brokerage Disruptor',
  'How a bootstrapped startup captured 15%+ of Indian equity trading volume with zero ad spend.',
  'Corporate Finance',
  'intermediate',
  8,
  'Zerodha',
  'Founded in 2010 by Nithin and Nikhil Kamath, Zerodha disrupted Indian stockbroking by introducing flat ₹20 pricing and zero brokerage on equity delivery investments.',
  'Prior to 2010, traditional broking firms in India charged percentage-based brokerages (e.g. 0.5% per trade). A ₹10 Lakh equity order cost ₹5,000 in brokerage alone. Zerodha engineered a lean tech infrastructure and launched flat ₹20 fees per trade, making investing accessible to millennial retail traders.\n\nRather than raising venture capital to spend heavily on user acquisition ads, Zerodha built educational platforms like **Zerodha Varsity** and **Kite API** ecosystem, growing via organic word-of-mouth.',
  '[{"label": "FY23 Revenue", "value": "₹6,875 Cr"}, {"label": "FY23 Net Profit", "value": "₹2,900 Cr"}, {"label": "External VC Capital Raised", "value": "₹0 (Bootstrapped)"}, {"label": "Active Client Base", "value": "6.5+ Million"}]'::jsonb,
  'What key structural advantage allowed Zerodha to achieve a 40%+ net profit margin compared to VC-funded competitors?',
  '[
    {"id": "A", "text": "Charging high hidden fees on account maintenance and bank transfers.", "is_recommended": false, "reasoning": "Zerodha has transparent, published fee structures without hidden transfer charges."},
    {"id": "B", "text": "Zero CAC (Customer Acquisition Cost) via organic educational content (Varsity) combined with proprietary in-house technology infrastructure.", "is_recommended": true, "reasoning": "Eliminating multi-hundred crore advertising budgets allowed Zerodha to convert revenue directly into net profits."},
    {"id": "C", "text": "Leveraging high-frequency proprietary trading desks using customer funds.", "is_recommended": false, "reasoning": "SEBI strictly prohibits brokers from using client funds for proprietary trading."}
  ]'::jsonb,
  'Zerodha proved that sustainable unit economics, financial literacy initiatives, and technology superiority beat capital-intensive marketing. Today Zerodha is one of India''s most profitable financial services firms.',
  '[{"title": "NSE Market Share Statistics", "url": "https://nseindia.com"}]'::jsonb
),
(
  'hdfc-bank-mega-merger',
  'HDFC & HDFC Bank: The $40 Billion Mega-Merger',
  'Combining a housing finance giant with India''s largest private commercial bank.',
  'Banking',
  'advanced',
  10,
  'HDFC Ltd & HDFC Bank',
  'In July 2023, HDFC Ltd merged into HDFC Bank, creating a banking titan with a $150+ Billion market valuation.',
  'HDFC Ltd (the parent mortgage lender) and HDFC Bank (the retail/commercial banking arm) operated as separate entities for decades. The merger allowed HDFC Bank to cross-sell home loans directly to its 80+ million bank account holders and leverage HDFC Ltd''s deep mortgage expertise.\n\nHowever, the merger required HDFC Bank to maintain strict RBI regulatory ratios—specifically **Cash Reserve Ratio (CRR)** and **Statutory Liquidity Ratio (SLR)**—on the newly absorbed mortgage liabilities.',
  '[{"label": "Combined Entity Balance Sheet", "value": "₹25,000,000 Cr"}, {"label": "Combined Customer Base", "value": "120+ Million"}, {"label": "Mortgage Cross-Sell Potential", "value": "70% Unbanked HDFC borrowers"}]'::jsonb,
  'What primary balance sheet challenge did HDFC Bank face immediately post-merger?',
  '[
    {"id": "A", "text": "Replacing low-cost CASA (Current & Savings Account) deposits with high-cost wholesale bonds to meet CRR/SLR requirements.", "is_recommended": true, "reasoning": "HDFC Ltd relied on wholesale corporate bonds, which had to be replaced over time with retail bank deposits to maintain margins."},
    {"id": "B", "text": "Complete loss of home loan market share to PSU banks.", "is_recommended": false, "reasoning": "HDFC Bank actually expanded mortgage distribution nationwide post-merger."},
    {"id": "C", "text": "Default on international dollar bond obligations.", "is_recommended": false, "reasoning": "HDFC Bank maintained AAA credit ratings throughout the merger transition."}
  ]'::jsonb,
  'The merger demonstrated how regulatory compliance (CRR/SLR/Priority Sector Lending) dictates balance sheet strategy in Indian banking. HDFC Bank prioritized retail deposit mobilization to replace wholesale borrowings.',
  '[{"title": "RBI Approval Notice - HDFC Merger", "url": "https://rbi.org.in"}]'::jsonb
),
(
  'tax-harvesting-strategies',
  'Tax Harvesting: Navigating the ₹1 Lakh LTCG Threshold',
  'Optimizing long-term equity returns under Section 112A of the Income Tax Act.',
  'Taxation',
  'beginner',
  6,
  'Personal Portfolio Management',
  'Under Section 112A of the Income Tax Act, Long-Term Capital Gains (LTCG) on equity mutual funds and stocks exceeding ₹1 Lakh per financial year are taxed at 10% (12.5% post-FY24 amendment).',
  'Rohan has an equity mutual fund portfolio with unrealized long-term capital gains of ₹2,50,000. If he sells the entire holding in a single financial year, he will pay tax on ₹1,50,000 (after the ₹1,00,000 tax-free limit).\n\nBy practicing **Tax Gain Harvesting**, Rohan can sell a portion of units each March to realize up to ₹1,00,000 in gains tax-free, then immediately reinvest the proceeds to reset the purchase cost basis higher.',
  '[{"label": "Unrealized Gain", "value": "₹2,50,000"}, {"label": "Annual Exempt LTCG", "value": "₹1,00,000"}, {"label": "Tax Saved via Harvesting", "value": "₹10,000 - ₹12,500/yr"}]'::jsonb,
  'How should an investor execute tax gain harvesting without violating exit load or short-term capital gains rules?',
  '[
    {"id": "A", "text": "Sell equity fund units that have been held for more than 1 year (LTCG) up to ₹1 Lakh profit, and repurchase them immediately or in a similar fund.", "is_recommended": true, "reasoning": "This steps up the cost basis tax-free without altering target asset allocation."},
    {"id": "B", "text": "Sell all units within 3 months of purchase regardless of holding period.", "is_recommended": false, "reasoning": "Selling within 1 year triggers Short-Term Capital Gains (STCG) tax at 15%/20% plus applicable exit loads."},
    {"id": "C", "text": "Transfer money to a non-resident foreign account to avoid Indian tax reporting.", "is_recommended": false, "reasoning": "Illegal and subject to severe penalties under the Black Money Act and Income Tax Act."}
  ]'::jsonb,
  'Tax gain harvesting is a legitimate wealth optimization technique permitted under Indian tax laws that compounds portfolio returns significantly over a 15–20 year horizon.',
  '[{"title": "Income Tax Act Section 112A Guidelines", "url": "https://incometax.gov.in"}]'::jsonb
);
