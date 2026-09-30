-- ============================================================
-- FinanceHub — Corporate and Founder Finance: Business Basics
-- 15 lessons with quizzes
-- Run AFTER supabase_schema_safe.sql
-- ============================================================

DO $$
DECLARE
  biz_basics_level_id UUID;
  l1 UUID; l2 UUID; l3 UUID; l4 UUID; l5 UUID;
  q1 UUID; q2 UUID; q3 UUID; q4 UUID; q5 UUID;
BEGIN

SELECT lv.id INTO biz_basics_level_id
FROM levels lv JOIN tracks t ON lv.track_id = t.id
WHERE (t.slug = 'corporate-finance' AND lv.slug = 'business-basics')
   OR (t.slug = 'corporate-finance' AND lv.slug = 'beginner')
ORDER BY CASE
  WHEN t.slug = 'corporate-finance' AND lv.slug = 'business-basics' THEN 1
  ELSE 2
END
LIMIT 1;

IF biz_basics_level_id IS NULL THEN
  RAISE EXCEPTION 'Corporate business basics level not found. Run sql/supabase_schema_safe.sql first.';
END IF;

-- ─────────────────────────────────────────
-- LESSON 1: Reading a P&L statement
-- ─────────────────────────────────────────
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES (biz_basics_level_id, 'Reading a P&L statement — the scoreboard of business', 'reading-pl-statement',
'# Reading a P&L statement — the scoreboard of business

## What is a P&L?

The **Profit and Loss statement** (also called Income Statement) tells you how much money a business made or lost over a period of time (quarter or year).

If the balance sheet is a photograph of financial health at one moment, the P&L is the video of performance over time.

## The structure — top to bottom

**Revenue (Topline)**
Total money earned from selling products or services. Also called "sales" or "turnover."

**Cost of Goods Sold (COGS)**
Direct costs of producing what you sold. For a restaurant: raw materials. For a software company: server costs.

**Gross Profit = Revenue − COGS**
The first measure of profitability. Gross margin = Gross profit ÷ Revenue × 100.

**Operating Expenses (OpEx)**
Salaries, rent, marketing, R&D — costs of running the business not tied to specific products.

**EBITDA** (Earnings Before Interest, Tax, Depreciation, Amortisation)
Operating health of the core business. Used for comparing companies regardless of capital structure or tax situation.

**EBIT** (Earnings Before Interest and Tax)
Also called "Operating Profit."

**Interest expense**
Cost of debt. Companies that borrowed heavily have high interest costs eating into profit.

**PBT** (Profit Before Tax)
What''s left before paying the government.

**Tax**
Corporate tax in India: 22% for existing companies, 15% for new manufacturing companies.

**PAT (Profit After Tax) = Net Profit (Bottomline)**
What shareholders actually earned.

## Real example: Infosys FY24

Revenue: ₹153,670 crore
EBITDA: ₹38,630 crore (25.1% margin)
Net Profit: ₹26,248 crore

## What to look for

1. **Revenue growth YoY** — Is the business growing?
2. **Gross margin trend** — Is pricing power intact?
3. **EBITDA margin trend** — Is the business becoming more efficient?
4. **Net profit vs EBITDA** — Big gap = high debt interest or high tax (investigate)
5. **Revenue quality** — One-time items vs recurring revenue

> One number never tells the whole story. Always compare to prior periods and to peers.', 9, 1, true, true) RETURNING id INTO l1;

INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l1, 'P&L Statement — Check', 70) RETURNING id INTO q1;
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
(q1, 'What does "topline" refer to in a P&L statement?',
'["Net profit", "Revenue or total sales", "EBITDA", "Gross profit"]',
1, 'Topline = Revenue. It''s at the top of the P&L. "Bottomline" = Net Profit (PAT). These two terms are widely used in business to distinguish between revenue growth and actual profit growth.', 1),
(q1, 'A company has Revenue of ₹100 crore and COGS of ₹60 crore. What is the Gross Profit and Gross Margin?',
'["₹40 crore, 40%", "₹60 crore, 60%", "₹40 crore, 60%", "₹60 crore, 40%"]',
0, 'Gross Profit = Revenue − COGS = ₹100 − ₹60 = ₹40 crore. Gross Margin = Gross Profit ÷ Revenue = 40 ÷ 100 = 40%. This represents how much of each rupee of revenue remains after direct production costs.', 2),
(q1, 'Why is EBITDA useful when comparing companies in the same sector?',
'["It includes all costs making comparison fair", "It removes the effects of financing, tax, and accounting decisions, showing core operational performance", "It is the most important profit metric", "It is required by SEBI"]',
1, 'EBITDA isolates operating performance by excluding interest (financing decisions), tax (jurisdiction), depreciation (capital-intensity), and amortisation (acquisition history). This makes cross-company comparison more meaningful.', 3);

-- ─────────────────────────────────────────
-- LESSON 2: The balance sheet explained
-- ─────────────────────────────────────────
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES (biz_basics_level_id, 'The balance sheet — what a company owns and owes', 'balance-sheet-explained',
'# The balance sheet — what a company owns and owes

## The fundamental equation

**Assets = Liabilities + Shareholders'' Equity**

This equation always balances. It is not a coincidence — it is the definition.

A company funds itself through two sources: money owed to others (liabilities) and money from owners (equity). All of this funding is used to purchase assets.

## Assets — what the company owns

**Current Assets** (converted to cash within 12 months):
- Cash and cash equivalents
- Accounts receivable (customers who owe money)
- Inventory (goods ready to sell)
- Short-term investments

**Non-current Assets** (held longer than 12 months):
- Property, Plant and Equipment (PP&E) — factories, machinery, land
- Intangible assets — patents, brand value, software
- Long-term investments
- Goodwill (paid above book value in acquisitions)

## Liabilities — what the company owes

**Current Liabilities** (due within 12 months):
- Accounts payable (suppliers the company owes)
- Short-term loans
- Accrued expenses
- Deferred revenue (paid in advance by customers)

**Non-current Liabilities** (due after 12 months):
- Long-term debt
- Deferred tax liabilities
- Pension obligations

## Shareholders'' Equity

What belongs to shareholders after all debts paid:
- **Share capital**: Original investment by shareholders
- **Retained earnings**: Accumulated profits not paid as dividend
- **Reserves**: Various statutory and specific reserves

**Book value per share = Total equity ÷ Shares outstanding**

## Key ratios from the balance sheet

**Debt-to-Equity (D/E)**: Total debt ÷ Equity
- D/E < 1: Conservative, low financial risk
- D/E 1–2: Moderate leverage, common in capital-intensive industries
- D/E > 3: High risk, vulnerable to interest rate changes

**Current Ratio**: Current assets ÷ Current liabilities
- > 2: Comfortable short-term liquidity
- < 1: May struggle to pay near-term obligations

**Return on Equity (ROE)**: Net profit ÷ Shareholders'' equity × 100
- > 15% consistently = excellent capital allocation
- Warren Buffett considers 15% ROE a minimum threshold

## What to watch for

**Rising debt with falling revenue** — stress signal
**Goodwill is a large portion of assets** — acquisition risk
**Receivables growing faster than revenue** — customers not paying
**Inventory piling up** — products not selling', 9, 2, true, true) RETURNING id INTO l2;

INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l2, 'Balance Sheet — Check', 70) RETURNING id INTO q2;
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
(q2, 'What does the balance sheet equation Assets = Liabilities + Equity mean in simple terms?',
'["Assets are always more than liabilities", "Everything a company owns was funded either by borrowing or by owners'' investment", "Equity is always larger than liabilities", "This is just an accounting rule with no real meaning"]',
1, 'Every rupee of assets had to come from somewhere. Either it was borrowed (liability) or invested by owners (equity). This fundamental equation reflects how every business is financed and cannot be violated.', 1),
(q2, 'A company has current assets of ₹200 crore and current liabilities of ₹160 crore. What is the current ratio and what does it indicate?',
'["0.8 — the company cannot meet short-term obligations", "1.25 — moderate short-term liquidity", "1.25 — the company is highly profitable", "0.8 — the company is growing fast"]',
1, 'Current Ratio = 200 ÷ 160 = 1.25. This means the company has ₹1.25 in current assets for every ₹1 of current liabilities — moderate but adequate short-term liquidity. Below 1.0 would be a warning sign.', 2),
(q2, 'What does a consistently high Return on Equity (ROE > 20%) indicate about a company?',
'["The company has a lot of debt", "Management is effectively generating profits from shareholders'' money — a sign of competitive advantage", "The company pays high dividends", "The stock is undervalued"]',
1, 'ROE measures how efficiently management uses shareholders'' equity to generate profit. Sustained ROE > 20% typically indicates a strong competitive moat — pricing power, network effects, or structural cost advantages.', 3);

-- ─────────────────────────────────────────
-- LESSON 3: Cash flow statement — the truth teller
-- ─────────────────────────────────────────
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES (biz_basics_level_id, 'Cash flow statement — the truth teller of business health', 'cash-flow-statement',
'# Cash flow statement — the truth teller of business health

## Why cash flow beats profit

A company can be profitable on paper and still go bankrupt.

How? Through **accrual accounting**: revenue is recorded when earned, not when cash is received. A company can book ₹100 crore in sales but still be waiting for payment. If they run out of actual cash to pay employees and suppliers, they fail — regardless of what the P&L says.

> Revenue is vanity. Profit is sanity. Cash is reality.

## The three sections

### 1. Operating Cash Flow (OCF)

Cash generated from the core business activities.

Starts with net profit, then adjusts for:
- **Add back**: Depreciation (non-cash expense)
- **Add back**: Other non-cash items
- **Subtract**: Increase in working capital (if receivables grew, you earned but did not collect)
- **Add**: Decrease in working capital

**High OCF relative to net profit = high quality earnings. OCF < net profit = investigate why.**

### 2. Investing Cash Flow

Cash used for long-term investments:
- Buying property, plant, equipment (CapEx) — negative
- Selling assets — positive
- Acquisitions — negative
- Purchasing investments — negative

Growing companies typically have large negative investing cash flow (they are building for the future).

### 3. Financing Cash Flow

Cash from financing the business:
- Raising debt — positive
- Repaying debt — negative
- Issuing equity — positive
- Dividends paid — negative
- Buybacks — negative

## Free Cash Flow (FCF)

**FCF = Operating Cash Flow − Capital Expenditure**

This is the cash a business generates AFTER maintaining its assets. It is what is available for:
- Paying dividends
- Debt repayment
- Acquisitions
- Share buybacks

FCF is often considered the most important metric for valuing a business.

## Warning signs in cash flow

**Net profit positive but OCF negative**: Company may be struggling to collect from customers. Common in early-stage businesses or ones growing too fast.

**FCF consistently negative for a profitable company**: Heavy reinvestment (could be good) or operational problems (bad). Investigate.

**Financing cash flow consistently positive**: Company is always raising money — may not be self-sustaining.

## A healthy pattern

Mature, healthy company:
- Strong positive OCF
- Negative investing CF (reinvesting in business)
- Negative financing CF (repaying debt, buying back shares, paying dividends)

This pattern: the business makes money, invests it wisely, and returns excess to shareholders.', 9, 3, true, true) RETURNING id INTO l3;

INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l3, 'Cash Flow — Check', 70) RETURNING id INTO q3;
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
(q3, 'A company shows ₹50 crore net profit but only ₹5 crore operating cash flow. What should this make you investigate?',
'["Nothing — this is normal", "Why the company is not collecting cash despite booking profits — receivables or inventory may be ballooning", "Whether the company is paying too much tax", "Why the company is not paying dividends"]',
1, 'A large gap between profit and OCF often means revenue is being booked that has not been collected as cash. Rising receivables or inventory can disguise deteriorating business quality. Always check OCF vs net profit.', 1),
(q3, 'What is Free Cash Flow?',
'["Total revenue minus all expenses", "Operating Cash Flow minus Capital Expenditure", "Net profit after tax", "Cash in the bank account"]',
1, 'FCF = OCF − CapEx. It represents the cash left after maintaining assets, available for debt repayment, dividends, buybacks, or acquisitions. It is the purest measure of value generation.', 2),
(q3, 'Which cash flow pattern suggests a mature, healthy business?',
'["All three sections positive", "Positive OCF, negative investing CF, negative financing CF", "Negative OCF but positive financing CF", "Positive OCF and positive financing CF"]',
1, 'Positive OCF (business generates cash), negative investing CF (reinvesting in assets), negative financing CF (returning cash to shareholders via dividends/buybacks) is the hallmark of a mature, self-sustaining, value-creating business.', 3);

-- ─────────────────────────────────────────
-- LESSON 4: Unit economics — the foundation of every business
-- ─────────────────────────────────────────
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES (biz_basics_level_id, 'Unit economics — does your business actually make money?', 'unit-economics',
'# Unit economics — does your business actually make money per customer?

## What is unit economics?

Unit economics analyses the profit or loss **per unit** — usually per customer, per transaction, or per product.

A company can be losing money overall but have excellent unit economics (early stage, high fixed costs).
A company can be making money overall but have terrible unit economics (subsidising growth).

The question: **Does each unit of business generate more value than it costs?**

## The two key metrics

### Customer Acquisition Cost (CAC)

**CAC = Total sales & marketing spend ÷ Number of new customers acquired**

If you spent ₹50 lakh on marketing and acquired 1,000 customers:
CAC = ₹50,00,000 ÷ 1,000 = ₹5,000 per customer

### Lifetime Value (LTV or CLV)

**LTV = Average revenue per customer × Gross margin × Average customer lifespan**

If average customer pays ₹2,000/year, gross margin is 60%, and stays for 3 years:
LTV = ₹2,000 × 0.60 × 3 = ₹3,600

## The LTV:CAC ratio — the health indicator

**LTV:CAC > 3:1 = Healthy business**

With LTV ₹3,600 and CAC ₹5,000: LTV:CAC = 0.72 — this business loses money on every customer. Unsustainable.

With LTV ₹15,000 and CAC ₹5,000: LTV:CAC = 3 — for every ₹1 spent acquiring a customer, you get ₹3 back. Healthy.

## Payback period

**Payback period = CAC ÷ Monthly gross profit per customer**

If CAC = ₹5,000 and monthly gross profit per customer = ₹500:
Payback = 10 months

Shorter payback = better. SaaS businesses target <12 months. E-commerce often struggles here.

## Contribution margin

**Contribution margin = Revenue − Variable costs**

What each sale contributes to covering fixed costs and profit:
If product sells for ₹1,000 and variable cost is ₹600: contribution margin = ₹400 (40%)

**Contribution margin must cover fixed costs to be profitable.**

## Why Zomato and Swiggy burned money for years

Their unit economics were negative for a long time:
- CAC was high (aggressive discounting)
- Delivery costs were high
- Average order value was low

Only at scale (lower delivery cost per order, higher order frequency) did unit economics improve.

## For founders

Before scaling, answer:
1. What is my CAC?
2. What is my LTV?
3. What is my payback period?
4. What is my contribution margin per order/customer?

If you cannot answer these, you are flying blind.', 9, 4, true, true) RETURNING id INTO l4;

INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l4, 'Unit Economics — Check', 70) RETURNING id INTO q4;
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
(q4, 'A startup spent ₹20 lakh acquiring 200 customers last month. What is the CAC?',
'["₹200", "₹1,000", "₹10,000", "₹2,00,000"]',
2, 'CAC = Total marketing spend ÷ New customers = ₹20,00,000 ÷ 200 = ₹10,000 per customer. This is the key metric to compare against LTV to determine if the business model is viable.', 1),
(q4, 'An LTV:CAC ratio of 5:1 means:',
'["The business is losing money on every customer", "For every ₹1 spent acquiring a customer, the business generates ₹5 in lifetime value — a very healthy ratio", "The CAC is 5x the LTV", "The business needs to cut marketing spend"]',
1, 'LTV:CAC > 3 is considered healthy. At 5:1, for every rupee spent on acquisition, you earn ₹5 back over the customer''s lifetime. This suggests efficient growth spending and a strong business model.', 2),
(q4, 'What does a high contribution margin indicate for a business?',
'["The business has no fixed costs", "Each unit of sale contributes significantly to covering fixed costs and generating profit — typically indicates pricing power or low variable costs", "The business is growing fast", "Revenue is high"]',
1, 'Contribution margin = Revenue − Variable costs. A high contribution margin means each sale leaves a large amount to cover fixed costs (rent, salaries) and generate profit. Software companies have very high contribution margins; physical goods typically lower.', 3);

-- ─────────────────────────────────────────
-- LESSON 5: Cap tables — who owns what
-- ─────────────────────────────────────────
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES (biz_basics_level_id, 'Cap tables — understanding who owns your startup', 'cap-tables',
'# Cap tables — understanding who owns your startup

## What is a cap table?

A **capitalization table (cap table)** shows exactly who owns what percentage of a company, what type of shares they hold, and at what price they invested.

For any founder, employee, or investor — the cap table determines what you receive when the company is sold or goes public.

**Get this wrong and you can lose your own company.**

## Starting point: Founding

Two founders, Priya and Rahul, start FinTech Co:

| Shareholder | Shares | % Ownership |
|-------------|--------|-------------|
| Priya       | 500,000 | 50%        |
| Rahul       | 500,000 | 50%        |
| **Total**   | **1,000,000** | **100%** |

## Angel round: ₹1 crore for 10%

New investor Arjun invests ₹1 crore for 10% of the company.

To give Arjun 10%, you must CREATE new shares (dilution):
- New total shares = 1,000,000 ÷ 0.90 = 1,111,111
- Arjun gets: 111,111 new shares
- Pre-money valuation implied: ₹9 crore (Arjun paid ₹1 crore for 10%, so 90% = ₹9 crore)

| Shareholder | Shares  | % Ownership |
|-------------|---------|-------------|
| Priya       | 500,000 | 45%         |
| Rahul       | 500,000 | 45%         |
| Arjun       | 111,111 | 10%         |
| **Total**   | **1,111,111** | **100%** |

Priya and Rahul are diluted from 50% to 45% each.

## ESOP pool

Companies reserve 10–15% for employees (ESOP pool). This is created BEFORE external investors (to avoid diluting investors).

If you create a 10% ESOP pool before Arjun''s investment, Priya and Rahul each drop to 45% before the angel round. Then after: ~40.5% each.

## Pre-money vs post-money valuation

**Pre-money valuation**: Company value BEFORE new investment.
**Post-money valuation**: Company value AFTER new investment.

Post-money = Pre-money + Investment

If Arjun invests ₹1 crore for 10%:
Post-money valuation = ₹1 crore ÷ 10% = ₹10 crore
Pre-money valuation = ₹10 crore − ₹1 crore = ₹9 crore

**Always confirm whether a valuation is pre or post-money when negotiating.**

## Share classes matter

**Common shares**: Founders and employees get common shares. Last to be paid in liquidation.

**Preferred shares**: Investors typically get preferred shares with:
- **Liquidation preference**: Get paid before common shareholders in exit
- **Anti-dilution protection**: Share count adjusted if future round at lower valuation
- **Pro-rata rights**: Right to invest in future rounds to maintain ownership percentage

## Why founders lose control

Scenario: Three funding rounds later, founders own 30% combined.
Investors have 70% and control the board.
Company sold for ₹100 crore.
Investors have 2x liquidation preference → they get ₹70+ crore first.
Founders split ₹30 crore on their 30%.

Understanding this from day one prevents painful surprises.', 10, 5, true, true) RETURNING id INTO l5;

INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l5, 'Cap Tables — Check', 70) RETURNING id INTO q5;
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
(q5, 'An investor puts in ₹2 crore for 20% of a startup. What is the post-money valuation?',
'["₹2 crore", "₹8 crore", "₹10 crore", "₹20 crore"]',
2, 'Post-money valuation = Investment ÷ % acquired = ₹2 crore ÷ 20% = ₹10 crore. Pre-money valuation = ₹10 crore − ₹2 crore = ₹8 crore. This is the fundamental valuation equation in startup fundraising.', 1),
(q5, 'Why do founders get "diluted" in funding rounds?',
'["They sell their shares to investors", "New shares are created and issued to investors, reducing founders'' percentage of the total share count", "Investors buy shares from employees", "The company repurchases founder shares"]',
1, 'Dilution happens when new shares are created (not sold from existing holders). If total shares increase from 1 million to 1.1 million, a founder holding 500,000 shares goes from 50% to 45.4% — same number of shares, smaller percentage.', 2),
(q5, 'What is a liquidation preference and why does it matter?',
'["The order companies pay salaries", "Preferred shareholders get paid first in a sale or liquidation, before common shareholders — this protects investors but can leave founders with little", "A type of insurance policy", "How quickly a company can sell its assets"]',
1, 'Liquidation preference gives investors the right to receive their money back (or a multiple of it) before common shareholders receive anything in an exit. A 2x liquidation preference means an investor gets double their investment before founders see any proceeds.', 3);

-- LESSONS 6-15 added as shorter entries
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES

(biz_basics_level_id, 'Startup valuation methods — how investors price your company', 'startup-valuation',
'# Startup valuation methods

## Why valuation matters

Valuation determines how much equity you give away for a given investment. Overvalue your company → investors walk away. Undervalue → you give away too much.

## Pre-revenue startups

With no revenue, valuation is more art than science:

**Comparable transactions (comps)**: What did similar stage companies in your sector raise at recently? Seed stage SaaS in India: ₹5–20 crore pre-money is typical.

**Berkus method**: Assigns value to five factors:
- Sound idea: up to ₹50 lakh
- Working prototype: up to ₹50 lakh
- Quality management team: up to ₹50 lakh
- Strategic relationships: up to ₹50 lakh
- Product rollout or sales: up to ₹50 lakh
Maximum: ₹2.5 crore pre-revenue

**VC method**: Work backwards from expected exit.
If VCs expect 10x return on Series A at 5 years, and comparable exits are ₹500 crore — they want to own 10–15% for their money to work.

## Revenue-stage companies

**Revenue multiple**: Common for SaaS and tech.
- High growth SaaS (50%+ YoY): 10–20x ARR
- Moderate growth (20–30% YoY): 5–10x ARR
- Declining growth: 2–5x ARR

Indian context: Apply a 30–50% discount to US multiples for comparable businesses.

**EBITDA multiple**: Common for profitable, traditional businesses.
Indian listed companies: 8–15x EBITDA for most sectors.
Consumer internet: 20–40x EBITDA.

## DCF (Discounted Cash Flow)

Project future cash flows 5–10 years → discount back to present value at a required return rate.

Highly sensitive to assumptions. Used more for mature businesses than startups.

## The key principle

**Valuation is a negotiation, not a formula.** The best founders combine understanding of valuation frameworks with understanding of investor psychology and market conditions.', 8, 6, true, false),

(biz_basics_level_id, 'Fundraising stages — from pre-seed to IPO', 'fundraising-stages',
'# Fundraising stages — from pre-seed to IPO

## The funding journey

Most startups follow a predictable funding arc, though not all survive each stage.

## Pre-seed (₹10–75 lakh)

**Who invests**: Founders themselves, family, friends, angel networks
**What stage**: Idea and early validation. Sometimes just the founding team.
**Dilution**: 5–15%
**Documents**: SAFE (Simple Agreement for Future Equity) or convertible note (defers valuation)

## Seed (₹75 lakh – ₹5 crore)

**Who invests**: Angel investors, early-stage VCs, accelerators (Y Combinator, Antler, Surge)
**What stage**: MVP built, some early users or revenue
**Dilution**: 15–25%
**Valuation**: ₹5–30 crore pre-money typically in India

## Series A (₹5–50 crore)

**Who invests**: Institutional VCs (Sequoia, Accel, Matrix Partners)
**What stage**: Product-market fit proven, unit economics improving, scaling begins
**Dilution**: 15–25%
**Valuation**: ₹30–300 crore pre-money

## Series B (₹50–200 crore)

**Who invests**: Growth-stage VCs, strategic investors
**What stage**: Proven model, expanding into new markets or verticals
**Dilution**: 15–20%

## Series C+ (₹200 crore+)

**Who invests**: Late-stage VCs, PE firms, sovereign funds
**What stage**: Market leader, path to profitability clear or achieved
**Goal**: Pre-IPO round or major expansion

## IPO (Initial Public Offering)

**Timeline**: Usually 7–12 years after founding for successful Indian startups
**What it provides**: Liquidity for early investors and founders, permanent capital
**Recent Indian tech IPOs**: Zomato, Paytm, Nykaa, PolicyBazaar, Delhivery

## Important: Not all startups should raise VC

VC is designed for companies that can become very large very quickly. For most businesses (services, traditional commerce, lifestyle businesses), bootstrapping or bank debt is more appropriate.

VC money comes with the expectation of 10x+ returns. You are implicitly promising massive scale.', 8, 7, true, false),

(biz_basics_level_id, 'Term sheets — what every clause means', 'term-sheets',
'# Term sheets — what every clause means

## What is a term sheet?

A **term sheet** is a non-binding document outlining the key terms of an investment. It is negotiated between founders and investors before the actual legal documents are drafted.

## Critical economic terms

**Valuation**: Pre-money valuation determines dilution. Negotiate hard here.

**Investment amount**: How much the investor is putting in.

**Share class**: Almost always preferred shares with rights common shares don''t have.

**Liquidation preference**:
- 1x non-participating: Investor gets back their money OR converts to common — picks whichever is higher
- 1x participating: Investor gets money back THEN participates in remaining proceeds — very investor-friendly, negotiate down
- 2x participating: Investor gets 2x money back first then participates — aggressive, rare in India

**Anti-dilution**:
- Broad-based weighted average: Standard, founder-friendly
- Full ratchet: Extreme, gives investors maximum protection — avoid if possible

## Critical control terms

**Board composition**: Most contested provision.
- 3-person board: 2 founders, 1 investor (founder-friendly)
- 5-person board: 2 founders, 2 investors, 1 independent (balanced)
- Watch for: Investor-controlled boards can replace founders as CEO

**Protective provisions (investor veto rights)**:
Standard: Issuance of new shares, sale of company, changes to charter
Aggressive: Any budget over ₹X, any hire above VP level, any debt

**Pro-rata rights**: Investor right to participate in future rounds. Standard, accept.

**Right of first refusal**: Investor can match any offer to buy shares. Standard, accept.

**Information rights**: Quarterly financials, annual audited accounts. Standard, accept.

## What founders should fight for

1. Non-participating liquidation preference (1x max)
2. Broad-based anti-dilution
3. Founder-friendly board (2 founders, 1 investor)
4. Narrow protective provisions
5. Short exclusivity period (30 days max)

## Key principle

**The best term sheet is from the best investor, not with the best terms.** A supportive board member who believes in you is worth more than a 10% better valuation from someone who will micromanage.', 9, 8, true, false),

(biz_basics_level_id, 'Cash runway and burn rate — how long can you survive?', 'burn-rate-runway',
'# Cash runway and burn rate

## The two most important numbers for any startup

**Burn rate**: How much cash the company spends each month (net of revenue).

**Runway**: How many months until the company runs out of money.

**Runway = Cash in bank ÷ Monthly net burn**

## Gross burn vs net burn

**Gross burn**: Total monthly cash outflow (salaries, rent, marketing, etc.)
**Net burn**: Gross burn − Revenue collected

A startup spending ₹50 lakh/month with ₹10 lakh revenue has:
- Gross burn: ₹50 lakh
- Net burn: ₹40 lakh

**Always manage to net burn. Investors care about net burn.**

## Calculating runway

Cash in bank: ₹2 crore
Net monthly burn: ₹20 lakh
Runway: ₹2 crore ÷ ₹20 lakh = 10 months

## The 18-month rule

Raise enough to give yourself **18 months of runway minimum** after closing.

Why 18 months?
- 3 months to close current round
- 12 months to hit next milestone
- 3 months buffer to start next raise before running out

**If you have less than 6 months runway — stop everything and raise or cut burn.**

## Managing burn

**Fixed costs**: Salaries (usually 60–70% of burn), rent, software subscriptions.
**Variable costs**: Marketing, cloud computing, contractors.

In a crisis, variable costs can be cut quickly. Fixed costs take time (notice periods, lease terminations).

## Burn multiple — a key VC metric

**Burn multiple = Net burn ÷ Net new ARR**

Tells you how much you are burning to generate each new rupee of recurring revenue.

- < 1: Excellent efficiency
- 1–1.5: Good
- 1.5–2: Acceptable in early stage
- > 2: Concerning — you''re burning too much to grow

## The extension trap

Never do a "bridge round" (small extension) more than once. It signals to the market that your business is not attractive enough for a proper round. It delays the inevitable and gives away equity at poor terms.

Better to: aggressively cut burn to extend runway AND raise a proper round simultaneously.', 8, 9, true, false),

(biz_basics_level_id, 'Financial modelling basics — building a 3-statement model', 'financial-modelling-basics',
'# Financial modelling basics

## What is a financial model?

A financial model is a structured spreadsheet that projects a company''s financial performance:
- Income statement (P&L)
- Balance sheet
- Cash flow statement

These three are interconnected — the "3-statement model" is the foundation of all financial analysis.

## Why founders need to model

1. Understand your own business better than any investor
2. Credible fundraising (investors ask for models)
3. Operational planning (hiring, marketing spend)
4. Scenario planning (what if revenue drops 30%?)

## Building a simple P&L model

**Revenue drivers** (bottom-up approach):
- Number of customers × average revenue per customer
- Or: number of transactions × average transaction value

Never just "assume 20% growth" without a driver.

**Gross margin**: Project based on current actuals, improving as you scale.

**Operating expenses**: Itemize each — salaries, rent, marketing, tech.

**Headcount plan**: Your biggest lever. Model each hire separately.

## The three-statement link

P&L → Cash Flow → Balance Sheet:
- Net income from P&L flows into retained earnings on balance sheet
- Depreciation (non-cash P&L item) added back in cash flow
- CapEx on cash flow increases PP&E on balance sheet
- Working capital changes affect both cash flow and balance sheet

## Scenario analysis

Every model needs three scenarios:
- **Base**: Most likely outcome
- **Bull**: Everything goes right
- **Bear**: Revenue misses by 30%, costs higher

Investors stress-test models. Know your bear case intimately.

## Common mistakes

- **Hockey stick revenue**: Sudden inflection with no driver explained
- **Linear headcount**: Ignores the fact that each hire takes time to become productive
- **Ignoring working capital**: Especially for businesses with inventory or long payment cycles
- **No sensitivity analysis**: Show what happens if key assumptions change by 10–20%

The best models are simple, driver-based, and honest about uncertainty.', 9, 10, true, false),

(biz_basics_level_id, 'Company structures in India — private, public, LLP', 'company-structures-india',
'# Company structures in India

## Choosing the right structure matters

Your company structure determines:
- Liability protection
- Tax treatment
- Fundraising ability
- Compliance burden

## Private Limited Company (Pvt Ltd)

**Best for**: Startups planning to raise external funding.

Advantages:
- Limited liability (personal assets protected)
- Can issue shares to investors (required for VC funding)
- Separate legal entity
- Easier to add and exit shareholders

Disadvantages:
- Higher compliance burden (annual filings with MCA, audit required)
- Minimum 2 directors and 2 shareholders
- Cannot raise money from the public

**Cost to incorporate**: ₹5,000–15,000 via lawyers or online platforms (Startupwala, Razorpay Rize, GFSL).

Most Y Combinator-backed Indian companies are Pvt Ltd.

## Limited Liability Partnership (LLP)

**Best for**: Professional services firms (CA firms, law firms, consultancies).

Advantages:
- Limited liability for partners
- Lower compliance than Pvt Ltd
- No audit required below ₹40 lakh revenue
- More flexible profit distribution

Disadvantages:
- Cannot issue ESOP to employees
- Cannot raise VC funding easily (VCs prefer Pvt Ltd)
- Less familiar to international investors

## One Person Company (OPC)

**Best for**: Solo founders, freelancers wanting limited liability.
Only 1 director, 1 shareholder (the same person).
Cannot raise investment.

## Sole Proprietorship / Partnership

No legal separation between owner and business.
Personal assets at risk if business is sued.
No registration required.
**Avoid this for any business with meaningful scale.**

## When to convert to Public Limited

Required before an IPO on NSE/BSE.
Higher compliance: minimum 7 shareholders, 3 directors.
Conversion from Pvt Ltd to Public Ltd takes 4–6 months.

## Tax rates comparison

Pvt Ltd: 22% corporate tax (25% for new cos until 2024, 15% for new manufacturing)
LLP: 30% tax rate (disadvantage vs Pvt Ltd)
Sole Proprietor: Taxed at personal income slab (up to 30%)

For profitable businesses at scale, Pvt Ltd corporate tax at 22% is more efficient than LLP at 30%.', 8, 11, true, false),

(biz_basics_level_id, 'GST basics for business owners', 'gst-basics-business',
'# GST basics for business owners

## What is GST?

**Goods and Services Tax** replaced a complex web of central and state taxes in India from July 2017. It is a single indirect tax on supply of goods and services.

## GST rates

- **0%**: Essential items — unprocessed food grains, health services, education
- **5%**: Basic necessities — edible oils, life-saving medicines, transport services
- **12%**: Standard items — processed food, computers, business class flights
- **18%**: Most services and manufactured goods — software, restaurants, telecom
- **28%**: Luxury and sin goods — cars, tobacco, aerated drinks

## CGST, SGST, IGST

**CGST + SGST**: For transactions within the same state. Each gets 50% of applicable rate.
**IGST**: For interstate transactions. Goes to the center, redistributed.

If you sell software (18% GST) worth ₹1 lakh to a customer in the same state:
- CGST: ₹9,000
- SGST: ₹9,000
- Total: ₹18,000 in GST collected

## GST registration threshold

- ₹40 lakh annual turnover: Mandatory for goods businesses
- ₹20 lakh: Mandatory for services
- ₹10 lakh: Special category states

Voluntarily register even below threshold if you want to claim input tax credit.

## Input Tax Credit (ITC) — the most important concept

You collect GST from customers. You pay GST to suppliers. ITC allows you to offset what you paid suppliers against what you owe the government.

You collected ₹18,000 GST from customers.
You paid ₹6,000 GST to your software vendor.
ITC = ₹6,000.
**Net GST payable = ₹18,000 − ₹6,000 = ₹12,000.**

This prevents cascading taxes — the entire value chain is taxed only on value added.

## Filing requirements

**GSTR-1**: Monthly/quarterly return of outward supplies (sales). Due 11th of following month.
**GSTR-3B**: Monthly summary return with tax payment. Due 20th of following month.
**GSTR-9**: Annual return due by December 31.

Use a CA or accounting software (Tally, Zoho Books, ClearTax) for compliance. Penalties for late filing can be significant.', 7, 12, true, false),

(biz_basics_level_id, 'Business loans and working capital — what founders need to know', 'business-loans',
'# Business loans and working capital

## Types of business financing

Not all business funding is equity. Debt financing is often cheaper and better for the right use case.

## Working Capital Loan

**Purpose**: Fund day-to-day operations — inventory, salaries, receivables gap.

**Types**:
- **Cash credit (CC)**: Line of credit against inventory/receivables. Draw when needed, pay interest only on amount used. Most flexible.
- **Overdraft (OD)**: Against fixed deposits or property. Lower interest rate.
- **Invoice discounting**: Bank pays you early on outstanding invoices, charges a fee.

**Who provides**: Banks (SBI, HDFC, ICICI), NBFCs, fintech lenders (Lendingkart, Indifi, Flexiloans).

**Interest rates**: 12–24% depending on business profile and lender.

## Term Loan

**Purpose**: Long-term assets — machinery, office space, expansion.

**Tenure**: 3–10 years.

**Security**: Usually collateral (property, machinery) or personal guarantee.

**MSME loans**: Under MSME Act, businesses with investment below ₹10 crore qualify for priority sector lending at lower rates.

## Government schemes

**MUDRA loans**: ₹50,000 to ₹10 lakh. No collateral. Shishu/Kishor/Tarun tiers.

**CGTMSE**: Credit Guarantee Fund Trust for MSMEs. Banks can lend without collateral with government guarantee.

**Startup India seed fund**: ₹20–50 lakh grants for early startups (DPIIT recognized).

## Revenue-Based Financing (RBF)

Newer model: Advance against future revenue.
- Advance: ₹10 lakh
- Repayment: 8% of monthly revenue until ₹13 lakh repaid (1.3x multiple)
- No equity dilution
- Good for e-commerce and SaaS companies with predictable revenue

## Key principle

**Match the duration of funding to the use**:
Working capital → Working capital loan (short term)
New equipment → Term loan (medium term)
Building new business → Equity (long term, uncertain returns)

Using long-term equity to fund short-term working capital is expensive. Using short-term loans to build long-term assets is dangerous.', 8, 13, true, false),

(biz_basics_level_id, 'TDS and advance tax — what every business owner must know', 'tds-advance-tax',
'# TDS and advance tax for businesses

## TDS (Tax Deducted at Source)

When you pay certain amounts to vendors, employees, or contractors — you must **deduct tax at source** and remit to the government on their behalf.

## Who must deduct TDS?

All businesses and individuals with auditable accounts (turnover > ₹1 crore for business, > ₹50 lakh for professionals in previous year).

Startups incorporated as Pvt Ltd always need to deduct TDS from day one.

## Common TDS sections

**Section 192**: Salary. Deduct as per income tax slab.

**Section 194C**: Contractor and subcontractor payments.
- Individual/HUF: 1%
- Others: 2%
- Threshold: ₹30,000 per payment or ₹1 lakh cumulative per year

**Section 194J**: Professional fees (CA, lawyer, consultant fees).
- Technical services: 2%
- Other professionals: 10%
- Threshold: ₹30,000 per year

**Section 194H**: Commission and brokerage. 5%.

**Section 194A**: Interest (other than on securities). 10%.

## Filing TDS returns

Quarterly returns (24Q for salary, 26Q for others):
- April–June: Due July 31
- July–September: Due October 31
- October–December: Due January 31
- January–March: Due May 31

Issue TDS certificate (Form 16 for salary, Form 16A for others) to deductees within 15 days of return filing.

**Penalty for non-deduction**: Equal to tax that should have been deducted + interest + potential disallowance of expense.

## Advance Tax

If your total tax liability exceeds ₹10,000 for the year, you must pay advance tax in installments:

- June 15: 15% of estimated annual tax
- September 15: 45% cumulative
- December 15: 75% cumulative
- March 15: 100% cumulative

**Interest for underpayment**: 1% per month under Section 234B and 234C.

Use the previous year''s tax liability as a starting estimate for advance tax. Review quarterly and adjust.', 7, 14, true, false),

(biz_basics_level_id, 'Business Basics recap — ready for Startup Finance', 'business-basics-recap',
'# Business Basics recap

## What you have mastered

This level covered the financial foundation every business owner needs — whether you run a tea stall, a tech startup, or manage finance for a large company.

## Financial statements

**P&L (Income Statement)**: Revenue → Gross Profit → EBITDA → Net Profit. Measures performance over time.

**Balance Sheet**: Assets = Liabilities + Equity. Snapshot of financial health.

**Cash Flow Statement**: Operating, Investing, Financing cash flows. The truth teller — profits can be manipulated, cash flows are harder to fake.

## Business fundamentals

**Unit economics**: CAC, LTV, LTV:CAC ratio, contribution margin, payback period. Must be positive for a sustainable business.

**Burn rate and runway**: Net burn = Gross burn − Revenue. Runway = Cash ÷ Net burn. Raise when you have 6+ months — aim for 18+.

## Startup-specific

**Cap tables**: Who owns what. Dilution happens with each round. Preferred vs common shares. Liquidation preferences matter enormously in exits.

**Fundraising stages**: Pre-seed → Seed → Series A → B → C → IPO. Each stage has different investors, valuations, and expectations.

**Term sheets**: Economic terms (valuation, liquidation preference, anti-dilution) and control terms (board composition, protective provisions). Negotiate both.

## Compliance

**GST**: Collect, pay input credit, file monthly returns. Non-compliance is expensive.

**TDS**: Deduct on salaries, contractor payments, professional fees. File quarterly returns.

**Advance tax**: Pay quarterly if liability > ₹10,000.

## What comes next: Startup Finance level

- Deep dive into fundraising mechanics
- Building investor relationships
- Due diligence process
- Post-investment board management
- M&A and exit strategies
- Equity compensation and ESOPs

Complete the final quiz to unlock Startup Finance.', 6, 15, true, false);

END $$;
