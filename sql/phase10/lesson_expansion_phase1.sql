-- ============================================================
-- FinanceHub — Lesson Expansion Phase 1
-- Adds comprehensive new lessons across tracks
-- Safe and idempotent (No unique constraint required)
-- ============================================================

-- Ensure unique constraint exists if possible (safe fallback)
DO $$
BEGIN
  ALTER TABLE lessons ADD CONSTRAINT lessons_level_id_slug_key UNIQUE (level_id, slug);
EXCEPTION
  WHEN duplicate_table OR duplicate_object OR SQLSTATE '42P07' OR SQLSTATE '42710' OR SQLSTATE '23505' THEN
    NULL;
END $$;

DO $$
DECLARE
  pf_beg_id  UUID;  -- Personal Finance Beginner
  pf_int_id  UUID;  -- Personal Finance Intermediate
  tm_id      UUID;  -- Trading Markets 101
  crypto_id  UUID;  -- Crypto Basics
  corp_id    UUID;  -- Corporate Business Basics
  beh_id     UUID;  -- Behavioral Finance
  forex_id   UUID;  -- Forex Basics
  ta_id      UUID;  -- Technical Analysis
  v_total    INT;

BEGIN
  -- Resilient level ID lookups across all schema slug conventions
  SELECT lv.id INTO pf_beg_id 
  FROM levels lv JOIN tracks t ON lv.track_id = t.id 
  WHERE t.slug = 'personal-finance' AND lv.slug IN ('beginner', 'absolute-beginner') 
  LIMIT 1;

  SELECT lv.id INTO pf_int_id 
  FROM levels lv JOIN tracks t ON lv.track_id = t.id 
  WHERE t.slug = 'personal-finance' AND lv.slug IN ('personal-finance-intermediate', 'intermediate') 
  LIMIT 1;

  SELECT lv.id INTO tm_id     
  FROM levels lv JOIN tracks t ON lv.track_id = t.id 
  WHERE t.slug IN ('trading-markets', 'stock-market', 'trading') AND lv.slug IN ('markets-101', 'beginner') 
  LIMIT 1;

  SELECT lv.id INTO crypto_id 
  FROM levels lv JOIN tracks t ON lv.track_id = t.id 
  WHERE t.slug IN ('crypto-defi', 'crypto') AND lv.slug IN ('crypto-basics', 'what-is-crypto', 'beginner') 
  LIMIT 1;

  SELECT lv.id INTO corp_id   
  FROM levels lv JOIN tracks t ON lv.track_id = t.id 
  WHERE t.slug = 'corporate-finance' AND lv.slug IN ('business-basics', 'beginner') 
  LIMIT 1;

  SELECT lv.id INTO beh_id    
  FROM levels lv JOIN tracks t ON lv.track_id = t.id 
  WHERE t.slug = 'behavioral-finance' AND lv.slug IN ('money-psychology', 'beginner') 
  LIMIT 1;

  SELECT lv.id INTO forex_id  
  FROM levels lv JOIN tracks t ON lv.track_id = t.id 
  WHERE t.slug IN ('forex-currency', 'forex') AND lv.slug IN ('forex-basics', 'beginner') 
  LIMIT 1;

  SELECT lv.id INTO ta_id     
  FROM levels lv JOIN tracks t ON lv.track_id = t.id 
  WHERE t.slug = 'technical-analysis' AND lv.slug IN ('chart-reading-fundamentals', 'beginner') 
  LIMIT 1;

  IF pf_beg_id IS NULL OR tm_id IS NULL OR crypto_id IS NULL OR corp_id IS NULL OR beh_id IS NULL OR forex_id IS NULL OR ta_id IS NULL THEN
    RAISE NOTICE 'Notice: Some level IDs were not found. Continuing with available levels.';
  END IF;

-- ═══════════════════════════════════════════════════════════
-- PERSONAL FINANCE BEGINNER — 7 new lessons
-- ═══════════════════════════════════════════════════════════
IF pf_beg_id IS NOT NULL THEN
  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT val.level_id, val.title, val.slug, val.content_mdx, val.duration_minutes, val.order_index, val.is_published, val.is_free
  FROM (
    VALUES
    (pf_beg_id, 'What is money — and why understanding it changes everything',
    'what-is-money',
    '# What is money?

## Money is a technology

Before money existed, people traded directly. A farmer who wanted shoes had to find a cobbler who wanted food. This double coincidence of wants made trade extremely difficult.

Money solved this by creating a universal medium of exchange. It is a technology — one of humanity''s most important inventions.

## The three functions of money

**1. Medium of exchange**: Accepted by everyone for buying goods and services. You do not need to find someone who wants what you have.

**2. Store of value**: You can save money and use it later. Unlike food, money does not spoil (though inflation erodes its value over time).

**3. Unit of account**: Money gives us a common language for pricing everything. We compare the value of vastly different things — a car, an hour of work, a meal — all in rupees.

## What gives money its value?

Modern money (like Indian Rupees) is **fiat currency** — its value comes from government decree and public trust, not from gold or silver backing.

The Reserve Bank of India manages the rupee''s supply and value. If RBI prints too much money without a corresponding increase in goods and services, money loses value — this is inflation.

## The time value of money

₹100 today is worth more than ₹100 one year from now. Why?

1. **Inflation**: Prices rise, so ₹100 buys less in the future
2. **Opportunity cost**: ₹100 today can be invested to become ₹107 next year
3. **Risk**: The future is uncertain

This principle — that money available now is worth more than the same amount later — is the foundation of all finance.

## Why financial literacy matters

Most schools teach us science, history, and languages. Almost none teach us about money — the thing that affects nearly every major life decision:

- Where to live
- What career to choose
- When to start a family
- How to retire

Financial literacy is not about getting rich. It is about having the knowledge to make informed decisions about your own life.',
    7, 11, TRUE, TRUE),

    (pf_beg_id, 'The 50/30/20 rule — the simplest budget that actually works',
    'fifty-thirty-twenty-rule',
    '# The 50/30/20 rule

## Why most budgets fail

Most budgets fail because they are too complicated. Tracking every rupee across 30 categories creates anxiety and is abandoned within weeks.

The 50/30/20 rule is different — it is simple enough to actually use.

## The rule

Divide your after-tax income into three buckets:

**50% — Needs**: Essential expenses you cannot avoid
**30% — Wants**: Lifestyle choices you enjoy but could live without
**20% — Savings and debt repayment**: Future security

## What counts as a need?

Needs are expenses required for basic functioning:
- Rent or home loan EMI
- Groceries and cooking gas
- Electricity, water, internet
- Basic clothing
- Essential medicines
- Minimum loan repayments
- Commute to work

## What counts as a want?

Wants are things that improve your life but are not essential:
- Dining out and food delivery
- Entertainment (OTT, movies, events)
- Gym membership
- New clothes beyond basics
- Gadgets and electronics
- Holidays and travel
- Premium apps and subscriptions

## The 20% savings bucket

This is the most important bucket — and most people get it backwards by saving what is left after spending. Instead:

**Pay yourself first**: Transfer the 20% to savings immediately after salary credit. Then live on the remaining 80%.

The 20% should cover:
- Emergency fund (until you have 3-6 months of expenses)
- SIP investments (for long-term goals)
- Debt repayment above minimum payments
- Saving for near-term goals

## Applying it to your income

Monthly take-home: ₹60,000
- Needs (50%): ₹30,000 — rent ₹15K, groceries ₹5K, commute ₹3K, utilities ₹2K, medicines ₹1K, EMI ₹4K
- Wants (30%): ₹18,000 — dining out ₹5K, OTT/entertainment ₹2K, clothing ₹3K, social ₹5K, misc ₹3K
- Savings (20%): ₹12,000 — SIP ₹8K, emergency fund top-up ₹4K

## Adjusting for your reality

If you live in a metro with high rent, needs might be 60% and wants might be 10%. That is fine — the principle matters more than the exact percentages.

The rule gives you a framework. Adjust it to your situation while keeping savings non-negotiable.',
    7, 12, TRUE, TRUE),

    (pf_beg_id, 'How inflation silently eats your money',
    'inflation-explained',
    '# Inflation — the silent thief

## What is inflation?

Inflation is the general rise in prices over time. When inflation is 6%, something that cost ₹100 last year costs ₹106 this year.

This sounds small. Compounded over decades, it is devastating.

₹10 lakh in savings today at 6% annual inflation:
- After 10 years: buys what ₹5.58 lakh buys today
- After 20 years: buys what ₹3.12 lakh buys today
- After 30 years: buys what ₹1.74 lakh buys today

**Your money loses more than half its purchasing power in a decade of 6% inflation.**

## How is inflation measured in India?

India uses two main inflation measures:

**CPI (Consumer Price Index)**: Tracks prices of a basket of goods and services that a typical Indian household buys. This is the primary inflation measure. Recent CPI: 4-6%.

**WPI (Wholesale Price Index)**: Tracks prices at the wholesale level, before reaching consumers.

**Education and healthcare inflation**: Both run at 10-12% annually — far above general CPI. This is why planning for these costs is critical.

## What causes inflation?

**1. Demand-pull**: Too much money chasing too few goods. When RBI prints more money or the economy grows rapidly, spending increases faster than production.

**2. Cost-push**: Production costs rise (oil prices, wages, raw materials), pushing prices higher.

**3. Monetary inflation**: When money supply grows faster than economic output, each rupee becomes worth less.

## How inflation affects different assets

| Asset | Inflation effect |
|-------|-----------------|
| Cash under mattress | Loses value at rate of inflation |
| Savings account (3.5%) | Loses value if inflation > 3.5% |
| FD (7%) | Slightly ahead of inflation after tax |
| Equity (12-15% historical) | Significantly beats inflation |
| Real estate | Broadly tracks inflation + location premium |
| Gold | Long-term inflation hedge |

## The real return concept

**Real return = Nominal return − Inflation**

Your FD gives 7%. Inflation is 6%. Real return = 1%.

After paying 30% tax on FD interest: Post-tax return = 4.9%. Real post-tax return = -1.1%.

Your FD is **losing purchasing power in real terms**. This is why parking all savings in FDs is not truly safe.',
    7, 13, TRUE, TRUE),

    (pf_beg_id, 'Understanding your salary slip — every line explained',
    'understanding-salary-slip',
    '# Understanding your salary slip

## Why your salary slip matters

Your salary slip is more than just a number. It tells you exactly what you earn, what is deducted, and what you take home. Understanding it helps you optimise your tax, negotiate better, and plan your budget accurately.

## The components of a salary slip

### Earnings side

**Basic salary**: The foundation of your salary structure. Usually 40-50% of CTC. Everything else is calculated as a percentage of basic. Higher basic = higher PF, higher gratuity, but also higher tax.

**HRA (House Rent Allowance)**: Helps you save tax if you pay rent. Typically 40-50% of basic salary.

**Special allowance**: Fully taxable. The "catch-all" component.

**LTA (Leave Travel Allowance)**: For travel expenses. Tax-exempt if you claim actual travel expenses twice in 4 years.

**Medical allowance**: ₹15,000 per year tax-exempt with bills (older regime).

**Performance bonus / Variable pay**: Usually paid quarterly or annually. Fully taxable.

### Deductions side

**EPF (Employee Provident Fund)**: 12% of basic salary. Mandatory. Goes to your PF account — your retirement fund.

**Professional tax**: Small state-imposed tax. Varies by state (Maharashtra: ₹200/month).

**TDS (Tax Deducted at Source)**: Income tax deducted by employer based on your projected annual tax liability. Submit Form 12BB to declare investments and reduce TDS.

**Health insurance premium**: If employer provides group health insurance, premium may be deducted.

## CTC vs Gross salary vs Net salary

**CTC (Cost to Company)**: Total what your employer spends on you annually. Includes employer PF contribution, gratuity provisioning, etc. The number in your offer letter.

**Gross salary**: All earnings before deductions. CTC minus employer PF and other employer-side costs.

**Net salary (take-home)**: Gross salary minus all deductions. What actually hits your bank account.

**CTC ₹12 lakh example**:
- Gross monthly: ₹85,000 (after removing employer PF ₹5,400/month)
- Minus employee PF: ₹5,400
- Minus professional tax: ₹200
- Minus TDS: ₹8,000
- Take-home: ₹71,400

## Action items

1. Get your salary slip every month
2. Verify all deductions are correct
3. Submit investment declarations to HR before March to reduce TDS
4. Ensure your UAN (PF number) is linked to Aadhaar and bank account',
    7, 14, TRUE, FALSE),

    (pf_beg_id, 'Banking basics — savings accounts, current accounts, and FDs',
    'banking-basics',
    '# Banking basics

## Types of bank accounts

### Savings account
The most common account. Designed for individuals to deposit and withdraw money.

**Interest**: 2.5-4% per year (private banks often offer 4-7% for higher balances).
**Minimum balance**: Zero-balance accounts available at public sector banks and small finance banks.
**Best for**: Day-to-day transactions, emergency fund, short-term savings.

**Best savings accounts in India (2024)**:
- SBI: Zero balance, wide ATM network, government-backed safety
- HDFC: Better digital experience, 3.5% on balances above ₹50L
- Kotak 811: 4% interest, full zero balance, excellent app
- Fi Money / Jupiter: Up to 7% interest, modern interface

### Current account
Designed for businesses with high transaction volumes.
- No interest paid
- Unlimited transactions allowed
- Higher minimum balance required
- Not suitable for individuals

### Fixed Deposit (FD)
You deposit a lump sum for a fixed period at a fixed interest rate.

**Interest rates (2024)**: 6.5-8.5% depending on bank, tenure, and amount.
**Tenure**: 7 days to 10 years.
**Premature withdrawal**: Allowed with a penalty (typically 0.5-1% below applicable rate).
**TDS**: 10% TDS if interest exceeds ₹40,000/year (₹50,000 for seniors).

**Senior citizen FDs**: 0.25-0.5% additional interest. Significant benefit.

## DICGC insurance — your money is protected

All deposits in Indian banks are insured up to ₹5 lakh per depositor per bank by DICGC (Deposit Insurance and Credit Guarantee Corporation).

This means if your bank fails, you are guaranteed to get back up to ₹5 lakh. For amounts above ₹5 lakh, spread across multiple banks.

## Digital banking safety rules

1. Never share OTP with anyone — banks never ask for it
2. Do not click links in SMS or email claiming to be your bank
3. Use official apps only (download from App Store / Play Store)
4. Enable transaction SMS alerts
5. Set spending limits on debit card for online transactions',
    7, 15, TRUE, FALSE),

    (pf_beg_id, 'The power of starting early — why time beats everything in investing',
    'power-of-starting-early',
    '# Why starting early beats everything

## The most powerful force in finance

Einstein (allegedly) called compound interest the eighth wonder of the world.

Whether or not he said it, the mathematics are genuinely extraordinary.

## Three friends — the most important comparison in personal finance

**Aisha** starts investing ₹5,000/month at age 22. She invests for 10 years (₹6L total invested) then stops completely.

**Bharath** starts at age 32 and invests ₹5,000/month for 30 years (₹18L total invested).

**Chetan** starts at age 42 and invests ₹10,000/month for 20 years (₹24L total invested).

All three earn 12% annual returns. At age 60:

- **Aisha**: ₹2.89 crore (invested only ₹6 lakh)
- **Bharath**: ₹1.76 crore (invested ₹18 lakh)
- **Chetan**: ₹1.00 crore (invested ₹24 lakh)

**Aisha wins by a landslide — despite investing the least money and stopping decades ago.**

## Why this happens

Compound interest means you earn returns on your returns.

₹5,000 invested at 12%:
- Year 1: ₹5,000 → ₹5,600 (earned ₹600)
- Year 10: ₹5,000 → ₹15,529 (earned ₹10,529)
- Year 20: ₹5,000 → ₹48,231 (earned ₹43,231)
- Year 30: ₹5,000 → ₹1,49,797 (earned ₹1,44,797)

The same ₹5,000 earns ₹600 in year 1 and ₹1,44,797 by year 30. **Time is the key ingredient.**

## The cost of waiting

Every year you delay costs far more than you think.

Waiting 5 years to start a ₹5,000/month SIP (12% returns, 30-year horizon):
- Start at 25: Corpus at 55 = ₹1.76 crore
- Start at 30: Corpus at 60 = ₹1.76 crore
- Start at 30: Corpus at 55 = ₹97.6 lakh

**5 years of delay costs ₹78 lakh in this example.**

## The action you should take today

1. Open a mutual fund account (Zerodha Coin, Groww, or ET Money)
2. Start a SIP of whatever you can afford — even ₹500/month
3. Choose a NIFTY 50 index fund or large-cap equity fund
4. Set it to auto-debit on salary date
5. Do not touch it for 10+ years

You can always increase the amount later. The most important step is starting.',
    7, 16, TRUE, TRUE),

    (pf_beg_id, 'Setting financial goals — short, medium, and long term',
    'setting-financial-goals',
    '# Setting financial goals

## Why vague goals fail

"I want to save more money" is not a goal. It is a wish.

"I want to save ₹3 lakh for a down payment on a car by December 2026 by saving ₹8,000/month" is a goal.

The difference: specificity, timeline, and a clear action. Vague intentions produce no results. Clear goals with numbers and deadlines produce results.

## Three time horizons

### Short-term goals (0-3 years)
Goals you need to fund within 3 years. Use low-risk instruments because you cannot afford to lose capital.

Examples:
- Emergency fund: 6 months of expenses
- Vacation: ₹1.5 lakh in 18 months
- Phone or laptop: ₹80,000 in 8 months
- Down payment on two-wheeler: ₹50,000 in 6 months

Instruments: High-yield savings account, liquid funds, short-term FD

### Medium-term goals (3-7 years)
Goals with enough time to take moderate risk for better returns.

Examples:
- Car down payment: ₹5 lakh in 5 years
- Wedding fund: ₹8 lakh in 4 years
- Home down payment: ₹20 lakh in 7 years
- Higher education fund: ₹15 lakh in 5 years

Instruments: Balanced/hybrid mutual funds, ELSS (if 80C benefit needed), large-cap equity

### Long-term goals (7+ years)
Goals far enough away to ride out market volatility. Equity is almost always the right choice.

Examples:
- Retirement corpus: ₹5 crore in 25 years
- Child''s higher education: ₹50 lakh in 15 years
- Financial independence: ₹3 crore in 20 years

Instruments: Equity mutual funds (index + flexi-cap), EPF, PPF, NPS

## The goal worksheet

For each goal, define:
1. **Name**: "Goa trip with family"
2. **Target amount** (today''s rupees): ₹1,50,000
3. **Timeline**: 18 months
4. **Inflation-adjusted amount**: ₹1,50,000 × 1.06^1.5 = ₹1,63,500
5. **Monthly saving needed**: ₹1,63,500 / 18 = ₹9,083/month
6. **Instrument**: Liquid fund (short timeline)
7. **SIP start date**: 1st of next month

## Prioritising multiple goals

Most people have multiple goals competing for the same rupee.

Priority order:
1. Emergency fund first (3 months minimum before investing for other goals)
2. Essential insurance (health + term life)
3. Retirement (non-negotiable — no loan available for retirement)
4. Children''s education (next most important)
5. Other goals in order of importance',
    7, 17, TRUE, FALSE)
  ) AS val(level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  WHERE NOT EXISTS (
    SELECT 1 FROM lessons l WHERE l.level_id = val.level_id AND l.slug = val.slug
  );
END IF;

-- ═══════════════════════════════════════════════════════════
-- TRADING MARKETS — 8 new lessons
-- ═══════════════════════════════════════════════════════════
IF tm_id IS NOT NULL THEN
  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT val.level_id, val.title, val.slug, val.content_mdx, val.duration_minutes, val.order_index, val.is_published, val.is_free
  FROM (
    VALUES
    (tm_id, 'How to read an annual report — finding gems others miss',
    'how-to-read-annual-report',
    '# How to read an annual report

## Why annual reports matter

Quarterly results tell you what happened in 3 months. Annual reports tell you the whole story — the chairman''s vision, management''s strategy, risk factors, and the complete financial picture.

Most retail investors never read annual reports. This is exactly why reading them creates an edge.

## The sections that matter most

### 1. Chairman''s letter / MD&A
This is management''s narrative. Read it critically:
- Are they honest about failures or only celebrating wins?
- Do they explain setbacks clearly or bury them in jargon?
- Is the language specific or full of vague promises?
- Does guidance match reality from previous years?

Honest management is the most underrated quality in a company.

### 2. Business overview
Understand exactly what the company does:
- Revenue streams — where does money come from?
- Customer segments — who buys?
- Geographic mix — India only or global?
- Competition — how strong is the moat?

### 3. Financial statements (pages you must read)
- **Profit and loss**: Revenue growth, margin trends, one-time items
- **Balance sheet**: Debt levels, cash position, asset quality
- **Cash flow statement**: Is profit converting to real cash? (Most important)
- **Notes to accounts**: The details buried here often reveal the most

### 4. Auditor''s report
Qualified opinion = serious concern. Read why the auditor qualified.
Emphasis of matter = something unusual to note.
Clean opinion = no issues found.

### 5. Risk factors
Companies are required to list genuine business risks. Read these seriously. They reveal what management is actually worried about.

### 6. Related party transactions
Are promoters taking money out of the company through related party deals? Compare quantum of related party transactions to total revenue.

## Red flags to watch for

- Revenue growing but cash flow falling year after year
- Receivables growing faster than revenue (customers not paying)
- Frequent changes in accounting policies
- Auditor resigned or changed
- Promoter pledging shares (borrowing against their own stake)
- Goodwill that never gets impaired despite business problems',
    9, 16, TRUE, FALSE),

    (tm_id, 'Mutual fund categories — which fund for which goal',
    'mutual-fund-categories-guide',
    '# Mutual fund categories — the complete guide

## Why SEBI categorised funds

Before 2018, fund houses could name funds anything they wanted. "Aggressive growth fund" at one AMC meant something completely different at another.

SEBI''s 2018 categorisation defined exactly what each category must invest in. Now you can compare like with like.

## Equity fund categories

### Large cap funds
Must invest minimum 80% in top 100 companies by market cap.
- Stable, less volatile
- Will closely track NIFTY 100 performance
- **Recommendation**: Choose a NIFTY 100 index fund instead — cheaper, same exposure

### Mid cap funds
Must invest minimum 65% in companies ranked 101-250 by market cap.
- Higher growth potential than large cap
- Higher volatility — can fall 40-50% in bear markets
- 7+ year time horizon required

### Small cap funds
Must invest minimum 65% in companies ranked 251 and below.
- Highest return potential in bull markets
- Highest risk — can fall 60%+ in downturns
- Low liquidity in crisis
- 10+ year time horizon required

### Large and mid cap funds
Minimum 35% each in large cap and mid cap.
- Good balance of stability and growth
- Most recommended for 7+ year goals

### Flexi cap funds
No market cap restriction. Fund manager decides allocation.
- Most freedom — can move to safety in downturns
- Parag Parikh Flexi Cap and HDFC Flexi Cap are widely respected

### ELSS (Equity Linked Savings Scheme)
Minimum 80% in equity. 3-year lock-in.
- Tax deduction under Section 80C
- Shortest lock-in among 80C options
- Can generate superior returns vs PPF if held long term

## Debt fund categories (post April 2023 — taxed at slab rate)

### Liquid funds: 1-90 day maturity instruments. Near-zero risk. Better than savings account.
### Short duration: 1-3 year maturity. Higher return than liquid. Some credit risk.
### Arbitrage funds: Equity-classified. 15% STCG, 10% LTCG. FD-like returns. Tax-efficient.

## Hybrid categories

### Balanced Advantage / Dynamic Asset Allocation
Dynamically shifts between equity and debt based on valuations.
Best for: conservative equity investors, 3-5 year goals

### Aggressive Hybrid
65-80% equity, 20-35% debt. Automatically rebalances.
Best for: moderate risk investors, 5+ year goals

## The simple portfolio for most investors

- NIFTY 50 index fund: 40%
- NIFTY Next 50 or Large & Mid Cap fund: 30%
- Flexi cap fund: 20%
- Liquid fund (emergency): 10%',
    8, 17, TRUE, FALSE),

    (tm_id, 'Demat and trading account — how to buy your first stock',
    'demat-trading-account-guide',
    '# Buying your first stock — step by step

## What is a demat account?

Demat (dematerialised) account is where your shares are stored electronically. Think of it like a bank account, but for shares instead of money.

Before demat accounts, shares were physical paper certificates. Demat accounts eliminated the risk of physical certificates being lost, forged, or damaged.

## Trading account vs demat account

**Demat account**: Holds your shares (storage)
**Trading account**: Used to buy and sell shares (transactions)

You need both. Most brokers open them together.

## How to open a demat account

**Online process (takes 15-30 minutes)**:
1. Go to broker website (Zerodha, Upstox, Groww, Angel One)
2. Enter mobile number, verify OTP
3. Enter PAN and Aadhaar details
4. Complete video KYC (show PAN card, sign on paper)
5. Account activated within 1-2 days

**Documents needed**: PAN card, Aadhaar, bank account details, signature

**Choosing a broker**:
| Broker | Brokerage | Best for |
|--------|-----------|----------|
| Zerodha | ₹20/order flat | All investors — best platform |
| Upstox | ₹20/order flat | Budget-conscious |
| Groww | ₹20/order (stocks), ₹0 (MF) | Beginners |
| ICICI Direct | % based | Full-service, research |

## Placing your first order

**Market order**: Buy at current price immediately. Simplest.

**Limit order**: Set maximum price you will pay. Order executes only at that price or lower.
Better for most investors — you control the price.

**Step by step**:
1. Log into broker app
2. Search for the company (e.g., "Infosys" → NSE: INFY)
3. Tap Buy
4. Enter quantity (number of shares)
5. Select order type (start with Limit)
6. Enter price (current price is shown)
7. Confirm order

**Important**: Ensure sufficient funds in your trading account. Transfer from your bank account first.

## Delivery vs intraday

**Delivery (CNC)**: You buy and hold shares in your demat account. Safe for beginners. No margin needed.

**Intraday (MIS)**: Buy and sell within the same day. Higher risk. Leverage available. Not recommended for beginners.

Always use Delivery until you fully understand intraday risks.

## SEBI investor registration

Every demat account holder is automatically registered in SEBI''s investor database. Keep your email and mobile updated to receive important regulatory communications.',
    8, 18, TRUE, TRUE),

    (tm_id, 'Dividend investing — income from stocks without selling',
    'dividend-investing',
    '# Dividend investing

## What is a dividend?

When a profitable company decides to share its profits with shareholders, it pays a **dividend** — a cash payment per share.

If you hold 100 shares of Infosys and it declares ₹34/share dividend, you receive ₹3,400 directly to your bank account.

## Key dividend terms

**Dividend per share (DPS)**: Cash paid per share

**Dividend yield**: Annual dividend / Current stock price × 100
If Infosys pays ₹34/share annually and trades at ₹1,700: Dividend yield = 2%

**Payout ratio**: Dividends paid / Net profit × 100
High payout ratio (80%+) means company returns most profit. Low ratio means company reinvests profits for growth.

**Dividend record date**: You must hold shares on this date to receive the dividend.
**Ex-dividend date**: Day the stock starts trading without the dividend right. Buy before this date.

## Taxation on dividends

**Indian dividends**: Taxed at your income slab rate (30% for highest bracket). Added to income and taxed.

**TDS**: 10% TDS if dividend exceeds ₹5,000/year per company.

## Best dividend-paying Indian companies (consistent track record)

High dividend yield Indian stocks (2024):
- Vedanta: 15%+ yield (but inconsistent business)
- Coal India: 8-10% yield (government company)
- Power Grid: 5-6% yield (stable utility)
- ITC: 3-4% yield (consistent growth)
- TCS, Infosys: 2-3% yield (growth + dividend)

## Dividend investing strategy

**For income investors**: Focus on dividend yield and payout consistency. PSUs often offer high yields.

**For growth investors**: Low yield companies that reinvest profits may create more wealth. ₹34 dividend from Infosys would have grown to thousands if reinvested.

**For most investors**: Dividend reinvestment is the optimal strategy. Reinvesting dividends in the same stock creates powerful compounding.

## The dividend trap

High dividend yield can be a trap. Sometimes yield is high because the stock price fell (not because dividends increased).

Always check:
- Is the dividend sustainable? (Payout ratio reasonable?)
- Is the business generating growing free cash flow?
- Has dividend been consistent for 5+ years?',
    8, 19, TRUE, FALSE),

    (tm_id, 'Stock market psychology — why emotions destroy returns',
    'stock-market-psychology',
    '# Stock market psychology

## The gap between market returns and investor returns

NIFTY 50 has returned approximately 14% CAGR over 20 years.

Studies of actual Indian retail investor returns show averages significantly lower — often 6-8% CAGR or less.

The gap exists almost entirely because of psychological mistakes: panic selling at bottoms, chasing momentum at tops, and overtrading.

## The market cycle of emotions

Markets move through predictable emotional phases:

**Rising market** (bottom to peak):
Hope → Relief → Optimism → Excitement → Thrill → Euphoria (PEAK)

**Falling market** (peak to bottom):
Anxiety → Denial → Fear → Desperation → Panic → Capitulation → Depression (BOTTOM)

**The cruel irony**: Most investors buy near the peak (maximum euphoria) and sell near the bottom (maximum fear). This is the exact opposite of profitable investing.

## The four most expensive emotions

**1. Fear of loss (loss aversion)**
Pain of losing ₹10,000 is twice the pleasure of gaining ₹10,000. This leads to:
- Selling good stocks at small losses
- Holding bad stocks hoping to "get back to zero"

**2. FOMO (Fear of Missing Out)**
When a stock or sector is rising strongly and everyone is talking about it, you feel compelled to buy. This is usually near the top.

**3. Overconfidence**
After 3-4 good decisions, investors believe they have special skill. They take larger positions and less diversified bets. Eventually regression to mean punishes them.

**4. Herd mentality**
Safety in numbers feels rational but is financially destructive. The crowd is usually wrong at extremes.

## Practical solutions

**Pre-commit your rules**: Write down your sell criteria before you buy. "I will sell if earnings growth falls below 10% for 2 consecutive years or if the thesis changes."

**Automate**: SIPs remove emotional timing decisions entirely.

**Limit news consumption**: Financial news is designed to be alarming. More news consumption = more emotional reaction = worse decisions.

**Keep a decision journal**: Record every significant investment decision and the emotion driving it. Review quarterly.

**Think in time frames**: "This stock fell 15% today" is terrifying. "This stock fell 15% in one day of a 10-year investment" is noise.',
    8, 20, TRUE, FALSE),

    (tm_id, 'What is a stock market index — NIFTY 50 and SENSEX explained',
    'stock-market-index-explained',
    '# Stock market indices

## What is a stock market index?

A stock market index is a statistical measure that tracks the performance of a group of stocks. It gives you a single number representing the overall direction of the market or a specific segment of it.

**NIFTY 50**: Tracks the 50 largest and most liquid companies on NSE (National Stock Exchange).

**SENSEX (S&P BSE Sensex)**: Tracks 30 of the largest and most established companies on BSE (Bombay Stock Exchange).

Both represent the health of India''s large-cap corporate sector.

## How is NIFTY 50 calculated?

NIFTY 50 uses a **free-float market capitalisation weighted** methodology:

1. Take the free-float market cap of all 50 companies (shares available for trading × price)
2. Sum them up
3. Divide by a base value and multiply by 1,000

This means larger companies (Reliance, TCS, HDFC Bank) influence the index more than smaller ones.

## Which companies are in NIFTY 50?

NIFTY 50 is reviewed every 6 months. Companies enter if they meet criteria (liquidity, market cap, listing history). Companies exit if they no longer qualify.

Top 10 constituents (roughly 55% of the index weight):
Reliance Industries, TCS, HDFC Bank, ICICI Bank, Infosys, Larsen & Toubro, Hindustan Unilever, Axis Bank, Bajaj Finance, State Bank of India

## Why does the index matter to you?

**1. Performance benchmark**: Your portfolio''s returns should be compared to NIFTY, not just absolute numbers.

**2. Market health indicator**: When NIFTY rises, it means large Indian businesses are collectively doing well.

**3. Index funds**: You can invest directly in NIFTY 50 through index funds, which replicate the index at very low cost.

**4. Derivatives**: Futures and options on NIFTY are the most actively traded derivatives in India.

## Sector indices

NSE also publishes sector-specific indices:
- Bank NIFTY: 12 largest banking stocks
- NIFTY IT: Technology companies
- NIFTY Pharma: Pharmaceutical companies
- NIFTY Auto: Automobile companies

These help you track specific sectors and trade them via futures and options.',
    7, 21, TRUE, TRUE),

    (tm_id, 'Bull market vs bear market — how to invest through each',
    'bull-bear-market-investing',
    '# Bull markets and bear markets

## Definitions

**Bull market**: A period of rising stock prices, typically defined as a 20%+ rise from recent lows. Accompanied by economic growth, high employment, and investor optimism.

**Bear market**: A period of falling stock prices, typically a 20%+ decline from recent highs. Often accompanied by economic slowdown and widespread pessimism.

## How long do they last?

Historical data from Indian markets:

**Bull markets**:
- 2003-2008: 534% gain over 5 years
- 2009-2015: 177% gain over 6 years
- 2017-2020 (pre-COVID): 44% gain
- 2020-2021 (COVID recovery): 120% in 18 months
- 2022-2024: 50%+ gain

**Bear markets**:
- 2008 financial crisis: -62% in 14 months
- COVID crash: -38% in 5 weeks (fastest ever)
- 2015-2016 correction: -23% over 12 months

**Key insight**: Bull markets last much longer than bear markets. Time in the market beats timing the market.

## How to invest in a bull market

In a bull market, almost everything rises. The temptation is to concentrate in high-flyers and use leverage.

Disciplined approach:
- Continue regular SIPs — do not increase dramatically at highs
- Rebalance portfolio if equity has drifted well above target allocation
- Resist chasing recent top performers
- Build some cash reserve for the inevitable correction

## How to invest in a bear market

Bear markets feel terrible but create the best opportunities.

Disciplined approach:
- Continue SIPs without pause (each investment buys more units at lower prices)
- If you have surplus cash, increase investment amount
- Do not sell fundamentally sound investments
- Avoid looking at portfolio value daily — it worsens fear

**The best investment decisions in history were made during bear markets**: Buying quality companies during the 2008 crash, 2020 COVID crash, etc.

## The correction vs crash distinction

**Correction**: 10-20% decline from peak. Common and healthy. Happens several times per decade.
**Bear market**: 20%+ decline. Rarer. Associated with economic slowdown.
**Crash**: Rapid, severe decline (30%+ in weeks). COVID March 2020 was a crash.

All three have historically been followed by recovery and new highs in broad Indian market indices.',
    7, 22, TRUE, FALSE),

    (tm_id, 'Portfolio diversification — why not to put all eggs in one basket',
    'portfolio-diversification',
    '# Portfolio diversification

## Why diversification matters

In 2008, Lehman Brothers stock fell 99% in weeks. In 2020, aviation stocks fell 70%+. In 2021-22, crypto fell 70-80%.

Investors with 100% of their portfolio in any of these were financially devastated. Investors with diversified portfolios across asset classes were painful but survivable.

**Diversification does not maximise returns. It maximises the probability of achieving your financial goals by limiting catastrophic loss.**

## Three levels of diversification

### Level 1: Asset class diversification
Spread across different types of assets that do not move together:

| Asset class | Expected return | Risk | Correlation to equity |
|-------------|----------------|------|----------------------|
| Equity | 12-15% | High | 1.0 (baseline) |
| Debt/bonds | 6-8% | Low | -0.2 to 0.2 |
| Gold | 7-10% | Medium | -0.1 to 0.3 |
| Real estate | 8-12% | Medium-High | 0.3-0.5 |
| International equity | 10-14% | High | 0.5-0.7 |

Low correlation between assets means when one falls, others may not. This reduces overall portfolio volatility.

### Level 2: Within equity diversification
Do not concentrate in:
- One stock (company-specific risk)
- One sector (sector-specific risk)
- One market cap (size-specific risk)

Healthy equity portfolio:
- 15-20+ stocks or use funds (single stock risk eliminated)
- Multiple sectors
- Mix of large, mid, small cap

### Level 3: Geographic diversification
India represents ~3% of global market cap. Limiting investing to India means missing 97% of global businesses.

International diversification through US-focused funds (NASDAQ funds, S&P 500 funds, global multi-cap funds) reduces home country risk.

## The optimal asset allocation

Age-based rule of thumb:
**Equity % = 100 − Age** (with adjustments)

Age 25: 75% equity, 25% debt+gold
Age 40: 60% equity, 30% debt, 10% gold
Age 55: 40% equity, 40% debt, 20% gold

Adjust based on your risk tolerance, income stability, and goals.',
    8, 23, TRUE, FALSE)
  ) AS val(level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  WHERE NOT EXISTS (
    SELECT 1 FROM lessons l WHERE l.level_id = val.level_id AND l.slug = val.slug
  );
END IF;

-- ═══════════════════════════════════════════════════════════
-- CRYPTO & DEFI — 8 new lessons
-- ═══════════════════════════════════════════════════════════
IF crypto_id IS NOT NULL THEN
  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT val.level_id, val.title, val.slug, val.content_mdx, val.duration_minutes, val.order_index, val.is_published, val.is_free
  FROM (
    VALUES
    (crypto_id, 'How to buy crypto in India — legal exchanges and step-by-step process',
    'how-to-buy-crypto-india',
    '# Buying crypto in India — the legal way

## The regulatory landscape

Crypto in India is legal to buy and hold as an asset. It is NOT legal tender (you cannot use it to pay for goods/services in India).

SEBI does not regulate crypto. It currently falls under the Finance Ministry''s oversight.

**Tax status**: Gains are taxed at 30% flat regardless of holding period. 1% TDS on every transaction above ₹10,000 (₹50,000 for specified persons).

## Indian crypto exchanges

**CoinDCX**: Largest Indian exchange by volume. Clean app. Wide coin selection. KYC required.

**WazirX**: Popular. Peer-to-peer INR trading. Owned by Binance until 2023 split. Safety concerns after 2024 hack — approach with caution.

**Zebpay**: One of India''s oldest. More conservative coin selection. Strong compliance track record.

**Coinbase India**: US exchange with Indian presence. Strong security standards.

**Recommendation**: CoinDCX or Zebpay for beginners. Use established exchanges only — smaller exchanges have higher rug-pull risk.

## Step-by-step: Buying Bitcoin on CoinDCX

1. Download CoinDCX app
2. Register with email and mobile
3. Complete KYC: PAN + Aadhaar + selfie + bank account
4. Wait 24-48 hours for KYC approval
5. Deposit INR via UPI or bank transfer
6. Go to Markets → BTC/INR
7. Enter amount in INR you want to spend
8. Review order — check price and fees
9. Confirm purchase
10. Bitcoin credited to your CoinDCX wallet

## Exchange wallet vs hardware wallet

**Exchange wallet** (custodial): Exchange holds your crypto. Convenient but risky — if exchange is hacked or fails, you may lose funds.

**Hardware wallet** (non-custodial): You hold the private keys. Your crypto. Examples: Ledger Nano X, Trezor. Expensive (₹8,000-15,000) but safest for significant holdings.

**"Not your keys, not your coins"** — for amounts above ₹50,000, consider a hardware wallet.

## Tracking your portfolio and taxes

Keep records of every transaction (date, amount, price paid, amount sold, price received) for tax purposes.

Tools: Koinly, CoinTracker, or simple Excel sheet.

For your ITR, crypto gains are reported under "Income from Virtual Digital Assets" — Schedule VDA.',
    8, 16, TRUE, TRUE),

    (crypto_id, 'Understanding blockchain technology — how it actually works',
    'blockchain-technology-explained',
    '# How blockchain actually works

## The problem blockchain solves

Traditional databases have a single point of control. A bank''s database is controlled by the bank — they can modify entries, freeze accounts, or be hacked.

Blockchain solves this with **decentralisation**: thousands of computers hold identical copies of the database. No single point of control or failure.

## The three core concepts

### 1. Distributed ledger
Instead of one database on one server, blockchain is a database copied across thousands of computers (called nodes) worldwide.

Every node has the complete transaction history from the very first transaction. If one node is hacked or fails, the others continue with the correct record.

### 2. Blocks and chains
Transactions are grouped into blocks. Each block contains:
- A batch of verified transactions
- A timestamp
- The cryptographic hash of the previous block (this is the "chain")
- Its own cryptographic hash

Linking each block to the previous block''s hash creates a chain. If you try to alter an old block, its hash changes — which breaks the link to the next block, and every block after. The tampering is instantly detectable.

### 3. Consensus mechanism
Since no single authority controls the blockchain, how do thousands of nodes agree on which transactions are valid?

**Proof of Work (Bitcoin)**: Computers compete to solve a complex mathematical puzzle. The winner adds the next block and receives a Bitcoin reward. The puzzle is intentionally hard to solve but easy to verify. Changing history would require re-solving all puzzles — computationally impossible.

**Proof of Stake (Ethereum)**: Instead of computing power, validators stake (lock up) their cryptocurrency. They are randomly selected to validate blocks proportional to their stake. Much more energy-efficient than Proof of Work.

## What makes it trustworthy

1. **Immutability**: Recorded transactions cannot be altered without detection
2. **Transparency**: All transactions visible to all participants
3. **Decentralisation**: No single point of failure or control
4. **Cryptographic security**: Each block secured by mathematics

## What blockchain cannot do

Blockchain guarantees accuracy of the chain''s own records. It cannot guarantee that the real-world data entered into it is accurate. A blockchain certificate of land ownership is only as valid as the original recording process.',
    8, 17, TRUE, TRUE),

    (crypto_id, 'DeFi — decentralised finance explained simply',
    'defi-explained',
    '# DeFi — decentralised finance

## What is DeFi?

Traditional finance (TradFi) requires intermediaries: banks to hold your money, brokers to trade stocks, insurance companies to cover risk. Each intermediary takes a fee and adds friction.

**DeFi** replaces these intermediaries with smart contracts — self-executing code on a blockchain. When conditions are met, the contract executes automatically. No human needed.

Example: A DeFi lending protocol automatically matches borrowers and lenders, processes collateral, calculates interest, and executes liquidation — all without any employee or bank involved.

## Core DeFi applications

### 1. Decentralised exchanges (DEX)
Trade crypto without a centralised exchange.

**Uniswap** (Ethereum): Largest DEX. Uses automated market makers (AMM) instead of order books. Liquidity providers earn fees.

**How it works**: Instead of matching buyers and sellers, AMMs use liquidity pools. Anyone can add funds to a pool and earn a share of trading fees.

### 2. Lending and borrowing
**Aave, Compound**: Deposit crypto to earn interest. Borrow against your crypto collateral.

Key difference from banks: No credit check, no KYC, no approval. Smart contract handles everything. But collateral must exceed loan value (overcollateralised) — usually 150%+ collateral for 100% loan.

### 3. Yield farming
Provide liquidity to DeFi protocols in exchange for rewards (often the protocol''s own governance token).

**The catch**: High yields attract capital, driving yields down. Protocol tokens used as rewards can lose value. Yield farming rewards often do not compensate for the risks (smart contract bugs, impermanent loss, token price collapse).

### 4. Stablecoins
Crypto pegged to fiat currency value. Used within DeFi to avoid volatility.
- USDT, USDC: Centralised, backed by actual dollars
- DAI: Decentralised, over-collateralised by crypto

## DeFi risks

**Smart contract risk**: Bugs in code can be exploited. $3+ billion lost to DeFi hacks in 2021-22 alone.

**Impermanent loss**: Providing liquidity to a pool can result in a worse outcome than simply holding the assets.

**Regulatory risk**: DeFi operates without KYC. Regulators are examining this carefully.

**Rug pulls**: Developers launch a project, attract liquidity, then drain the funds and disappear.',
    8, 18, TRUE, FALSE),

    (crypto_id, 'Crypto portfolio management — position sizing and risk control',
    'crypto-portfolio-management',
    '# Managing a crypto portfolio

## The volatility reality

Bitcoin has fallen 50%+ multiple times in its history and recovered each time to new highs. Altcoins have fallen 90%+ and never recovered.

Crypto requires different portfolio management rules than equity investing because:
- Volatility is 5-10x higher than equities
- Many assets go to zero
- 24/7 markets with no circuit breakers
- Regulatory risk can hit suddenly

## Portfolio allocation framework

**Conservative crypto investor (5% of total portfolio in crypto)**:
- 70% Bitcoin
- 20% Ethereum
- 10% other established altcoins
- 0% speculative micro-cap

**Moderate crypto investor (10% of total portfolio)**:
- 50% Bitcoin
- 30% Ethereum
- 15% established altcoins (SOL, BNB, etc.)
- 5% speculative (accept this may go to zero)

**Maximum suggested crypto allocation**: 20% of total investment portfolio for most people. Higher allocations expose you to devastating losses during crypto winters.

## Position sizing rules

**Never invest more than you can afford to lose completely** — not just a loss, total loss. Regulatory crackdowns or exchange failures can wipe out crypto holdings.

For individual altcoins:
- Tier 1 (BTC, ETH): Up to your full crypto allocation
- Tier 2 (SOL, BNB, ADA): Maximum 20-30% of crypto portfolio
- Tier 3 (smaller altcoins): Maximum 5-10% each, strict total limit 20-30%
- Tier 4 (new/speculative): Maximum 1-2% each, accept full loss is possible

## Dollar cost averaging in crypto

Given crypto''s volatility, lump sum investing is higher risk than in equities. Monthly DCA (systematic buying) smooths entry price over market cycles.

₹5,000/month in Bitcoin over 3 years regardless of price tends to outperform trying to time the market for most retail investors.

## Tax record keeping

Every buy, sell, and swap is a taxable event in India.

Keep records:
- Date of transaction
- Amount of crypto bought/sold
- INR value at time of transaction
- Exchange fees paid

Use Koinly or similar software to auto-calculate your tax liability from exchange transaction history.',
    8, 19, TRUE, FALSE),

    (crypto_id, 'Stablecoins — what they are and why they matter',
    'stablecoins-explained',
    '# Stablecoins

## The problem they solve

Bitcoin''s price can move 10% in a day. This makes it unusable as a medium of exchange — the merchant you pay today might receive 10% less (or more) by tomorrow.

Stablecoins solve this by creating a cryptocurrency pegged to a stable asset, usually the US dollar.

₹ equivalent: 1 USDT is always worth approximately ₹83-84 (current USD/INR rate). The crypto aspect provides blockchain benefits; the peg provides price stability.

## Types of stablecoins

### 1. Fiat-backed (centralised)
Backed 1:1 by actual dollars held in a bank.

**USDT (Tether)**: Largest by volume. Controversy around whether reserves are fully backed. Use with caution.
**USDC (Circle)**: Regulated, audited monthly. More transparent. Preferred by institutions.
**BUSD**: Binance''s stablecoin — being discontinued due to regulatory pressure.

**Risk**: Centralised — the company behind it can freeze accounts, and if reserves are insufficient, the peg can break.

### 2. Crypto-backed (decentralised)
Backed by other cryptocurrencies held in smart contracts, over-collateralised to absorb price drops.

**DAI (MakerDAO)**: To mint 100 DAI, you lock up 150%+ worth of ETH. If ETH price falls, the position is automatically liquidated.

**Risk**: If collateral falls faster than liquidation can occur (flash crash), the system can become undercollateralised.

### 3. Algorithmic (unbacked)
No real collateral — maintains peg through algorithms and token issuance/burning.

**UST (Terra/Luna)**: The most famous example. Promised stable $1 peg. In May 2022, the peg broke. UST fell to $0.02 in days. Luna fell 99.99%. $40+ billion in value destroyed. Thousands of retail investors wiped out.

**Verdict**: Avoid algorithmic stablecoins. This category has failed repeatedly.

## Use cases

- Trading without converting to INR (avoiding tax events)
- DeFi lending and yield farming
- Sending money internationally without bank fees
- Storing value in USD without a US bank account

## Risks

- Regulatory: Stablecoins are under intense global regulatory scrutiny
- De-pegging: Even USDT briefly fell to $0.96 during the 2022 crisis
- Counterparty: Centralised stablecoins depend on the issuer''s solvency',
    7, 20, TRUE, FALSE),

    (crypto_id, 'NFTs — what they actually are and why most failed',
    'nfts-deep-dive',
    '# NFTs — the honest assessment

## What an NFT actually is

NFT stands for Non-Fungible Token. "Non-fungible" means unique and not interchangeable (unlike Bitcoin, where every coin is identical).

An NFT is a token on a blockchain that certifies ownership of a unique digital item.

**What it is**: A record on the blockchain saying "this wallet address owns this specific item."
**What it is NOT**: A copy of the file. The image, video, or music is usually stored off-chain. The NFT is just a pointer and ownership record.

## The 2021 NFT bubble

NFTs exploded in 2021:
- Beeple''s digital artwork sold for $69 million
- CryptoPunks sold for millions each
- Board Ape Yacht Club NFTs: average sale $200,000+
- NBA Top Shot: digital basketball highlights selling for $100,000+

Total NFT volume 2021: $25 billion

## The crash

By 2023, most NFTs had lost 95%+ of peak value.

CryptoPunks: Average sale $200,000+ in 2021 → $50,000-80,000 in 2024
Most NFT collections: Effectively worthless

**Why the crash happened**:
- No intrinsic utility — most NFTs were speculation on greater fool theory
- Artificial demand driven by wash trading (buying your own NFTs to inflate prices)
- No scarcity of supply — anyone can create infinite NFT collections
- Most "holders" were speculators, not genuine collectors

## Where NFTs have genuine utility

**Gaming**: In-game items as NFTs allow true ownership — you can sell items outside the game. Axie Infinity was the first major example. The model works in theory.

**Ticketing**: NFT tickets prevent counterfeiting and allow verified resale with royalties to organisers.

**Digital art with established artists**: Genuine collectors paying for provably authentic digital works from recognised artists. Small market.

**Proof of ownership**: Real estate, intellectual property, legal certificates on blockchain.

## The lesson

NFTs as a technology have legitimate applications. NFTs as speculative investments in 2021 were a bubble driven by cheap money, social media hype, and celebrity endorsements.

Approach any NFT investment with the same question: "What is the genuine utility or demand for this beyond speculation?"',
    7, 21, TRUE, FALSE),

    (crypto_id, 'Crypto security — protecting your assets from hackers and scams',
    'crypto-security-advanced',
    '# Crypto security — protecting your assets

## Why crypto security is different

If someone steals your bank password, the bank can reverse fraudulent transactions. If someone steals your crypto private key, the transaction is irreversible. No central authority can recover it.

Crypto security is entirely your responsibility.

## The biggest threats

### 1. Phishing
Fake websites, emails, and social media accounts mimicking legitimate platforms.

**How it works**: You receive an urgent email saying your exchange account is compromised. The link goes to a fake site that looks identical to the real one. You enter your credentials. Stolen.

**Defence**: Bookmark official websites. Never click links in emails or SMS. Always type the URL directly. Check for HTTPS and the correct domain (coinbase.com not coinbase-support.com).

### 2. Sim swapping
Attacker calls your mobile carrier pretending to be you, gets a new SIM issued with your number. Now they receive your OTPs.

**Defence**: Avoid SMS-based 2FA. Use authenticator apps (Google Authenticator, Authy) instead.

### 3. Social engineering scams
"Crypto experts" on social media, Telegram, or WhatsApp promising to double your money, offering "signals," or requesting you send crypto for "verification."

**Rule**: Anyone offering guaranteed crypto returns or asking you to send crypto to receive more is a scammer. 100% of the time.

### 4. Exchange hacks
Centralised exchanges can be hacked. WazirX lost $235 million in a 2024 hack. Customers lost funds they had not withdrawn.

**Defence**: Do not keep large amounts on exchanges. Withdraw to personal wallets. Only keep what you plan to trade.

### 5. Seed phrase theft
Your wallet''s seed phrase (12-24 words) gives complete access to all funds. Anyone with these words controls your crypto.

**Defence**: Never photograph your seed phrase. Never enter it into any website or app. Store it offline on paper in a secure, fireproof location. Consider a metal backup.

## Security checklist

- Use unique, strong passwords for each exchange
- Enable 2FA using authenticator app (not SMS)
- Whitelist withdrawal addresses
- Keep seed phrases offline and secure
- Use hardware wallet for holdings above ₹1 lakh
- Never share seed phrases with anyone, ever',
    7, 22, TRUE, FALSE),

    (crypto_id, 'Crypto vs gold vs equity — which belongs in your portfolio?',
    'crypto-vs-gold-vs-equity',
    '# Crypto vs gold vs equity — the honest comparison

## Understanding what you own

**Equity (stocks)**: Ownership in a business that generates revenue and profit. Value is ultimately linked to earnings. Claim on real assets.

**Gold**: Physical commodity with 5,000 years of history as a store of value. No earnings, but no counterparty risk. Widely accepted globally as value store.

**Crypto (Bitcoin)**: Digital scarcity secured by mathematics and energy. No earnings, no physical backing. Relies entirely on network adoption and trust. 15-year track record.

## Risk and return comparison (10-year view)

| Asset | 10-year CAGR (India) | Max drawdown | Volatility |
|-------|---------------------|--------------|------------|
| NIFTY 50 | 12-15% | -62% (2008) | Medium |
| Gold (INR) | 10-12% | -30% | Low-medium |
| Bitcoin | 50%+ (variable) | -84% | Very high |
| FD | 6-7% | 0% | Zero |

## Correlation — the key to diversification

**Gold vs equity**: Low to negative correlation. Gold often rises when equity falls (risk-off). Adds genuine diversification.

**Bitcoin vs equity**: In 2017-2019, correlation was low. In 2020-2022, Bitcoin increasingly moved with equity, especially NASDAQ. During COVID crash: Bitcoin fell alongside equity. Diversification benefit reduced.

## The role of each in a portfolio

**Equity** (core holding — 50-80%): Primary wealth creation vehicle. Hold for 7+ years. Expected to generate 12-15% CAGR in India.

**Gold** (hedge — 5-15%): Insurance against currency devaluation and geopolitical crisis. Does not generate income but holds value over centuries. Sovereign gold bonds offer 2.5% annual interest plus gold returns.

**Crypto** (speculative allocation — 0-10% for risk-tolerant investors): High-risk, high-potential-return speculation. Not a portfolio necessity. Only invest what you can afford to lose completely.

**FD/Debt** (stability — varies by age): Capital preservation. Emergency fund. Short-term goals. Should earn above inflation on post-tax basis.

## The verdict

For most Indian investors building long-term wealth:
- Equity (index funds) is the primary vehicle
- Gold (5-10%) adds genuine portfolio diversification
- Crypto is optional and speculative — treat as venture-style allocation
- Never replace equity with crypto — they serve different purposes',
    8, 23, TRUE, FALSE)
  ) AS val(level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  WHERE NOT EXISTS (
    SELECT 1 FROM lessons l WHERE l.level_id = val.level_id AND l.slug = val.slug
  );
END IF;

-- ═══════════════════════════════════════════════════════════
-- CORPORATE FINANCE — 7 new lessons
-- ═══════════════════════════════════════════════════════════
IF corp_id IS NOT NULL THEN
  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT val.level_id, val.title, val.slug, val.content_mdx, val.duration_minutes, val.order_index, val.is_published, val.is_free
  FROM (
    VALUES
    (corp_id, 'Financial ratios — the 10 most important numbers in any business',
    'financial-ratios-explained',
    '# Financial ratios — the 10 numbers that matter most

## Why ratios matter

Absolute numbers tell you little without context. Revenue of ₹1,000 crore sounds impressive — but is the company profitable? Is it growing? Is it drowning in debt?

Ratios give context by comparing numbers to each other, to the company''s own history, and to industry peers.

## Profitability ratios

### 1. Gross Margin
(Revenue − Cost of Goods Sold) / Revenue × 100

What percentage of revenue remains after direct production costs.
High gross margin = strong pricing power or low production costs.
IT services companies: 40-70%. Steel companies: 10-20%.

### 2. EBITDA Margin
EBITDA / Revenue × 100

Earnings before interest, taxes, depreciation, and amortisation as a % of revenue.
Removes financing structure and non-cash charges. Best for comparing operational efficiency across companies.

### 3. PAT Margin (Net profit margin)
Profit After Tax / Revenue × 100

The bottom line — what percentage of every rupee of revenue becomes actual profit for shareholders.

### 4. Return on Equity (ROE)
Net Profit / Shareholders'' Equity × 100

How much profit the company generates on the money shareholders have invested. Warren Buffett''s favourite metric. Look for 15%+ consistently.

### 5. Return on Capital Employed (ROCE)
EBIT / (Total Assets − Current Liabilities) × 100

How efficiently the company uses all capital (both debt and equity). More comprehensive than ROE.

## Liquidity ratios

### 6. Current ratio
Current Assets / Current Liabilities

Can the company pay its short-term obligations? Ratio above 1 = assets exceed near-term liabilities. Below 1 = potential liquidity stress.

### 7. Quick ratio (Acid test)
(Current Assets − Inventory) / Current Liabilities

Stricter version — excludes inventory (hard to liquidate quickly).

## Leverage ratios

### 8. Debt to Equity ratio
Total Debt / Shareholders'' Equity

How much of the business is funded by debt vs equity. High D/E = higher financial risk. Capital-intensive industries (cement, steel) naturally have higher D/E.

### 9. Interest coverage ratio
EBIT / Interest Expense

How many times can earnings cover interest payments. Below 1.5 = serious concern. Above 5 = comfortable.

## Valuation ratios

### 10. Price to Earnings (P/E)
Market Price per Share / Earnings per Share

How much investors pay for each rupee of earnings. High P/E = growth expectations. Low P/E = value or value trap. Always compare to peers and historical average.',
    8, 16, TRUE, FALSE),

    (corp_id, 'What is working capital — and why it kills businesses',
    'working-capital-explained',
    '# Working capital — the lifeblood of business

## The profitable company that went bankrupt

Imagine a manufacturing company with ₹100 crore in annual revenue and 10% profit margin — ₹10 crore in net profit. Sound healthy?

Now imagine: they have to pay suppliers in 30 days but their customers pay them only after 90 days. To fund 60 days of operations, they need ₹16 crore of cash tied up in working capital permanently.

If this company is growing rapidly, working capital needs grow too. The profitable company runs out of cash and goes bankrupt — despite being profitable on paper.

This is the working capital trap that has killed thousands of businesses.

## What is working capital?

**Working Capital = Current Assets − Current Liabilities**

More practically:
- **Cash** (available immediately)
- **Receivables** (customers owe you — cash you will receive)
- **Inventory** (goods you own but have not sold yet)
- MINUS
- **Payables** (you owe suppliers — cash you will pay out)

## The cash conversion cycle

**Cash conversion cycle = Days Inventory Outstanding + Days Sales Outstanding − Days Payable Outstanding**

Days Inventory Outstanding (DIO): How long inventory sits before being sold
Days Sales Outstanding (DSO): How long before customers pay you
Days Payable Outstanding (DPO): How long before you pay suppliers

**Shorter cash conversion cycle = better**. You want to sell inventory quickly, collect from customers fast, and pay suppliers slowly.

**Amazon''s genius**: Customers pay instantly (DSO near 0). Amazon pays suppliers in 45-60 days. They collect cash before paying for goods — negative working capital. Business self-finances growth.

**Retail horror story**: Customer pays 30 days later (DSO 30). Goods sit in warehouse 45 days (DIO 45). Pay suppliers in 20 days (DPO 20). Cash cycle = 30 + 45 − 20 = 55 days. Every rupee of revenue requires 55 days of cash tied up.

## Working capital analysis for investors

When analysing a company:
- Is DSO growing? (Customers taking longer to pay — potential collection issues)
- Is inventory growing faster than revenue? (Demand may be falling)
- Is DPO shrinking? (Losing bargaining power with suppliers)

All three are early warning signs before problems show up in reported profit.',
    8, 17, TRUE, FALSE),

    (corp_id, 'Mergers and acquisitions — why companies buy each other',
    'mergers-acquisitions-explained',
    '# Mergers and acquisitions (M&A)

## Why do companies merge or acquire?

Companies spend billions acquiring others. The strategic reasons:

**1. Market share and scale**
Bigger companies have more pricing power, lower costs, and stronger competitive position. HDFC Bank + HDFC Ltd merger created India''s most valuable bank.

**2. Acquiring capabilities**
Faster to buy than build. Tech companies acquire startups to get technology, talent, or customer base. Reliance acquired JioMart, Hamleys, Milkbasket to expand retail capabilities.

**3. Geographic expansion**
Enter new markets quickly. Tata Motors acquired Jaguar Land Rover to gain premium global brands and UK manufacturing.

**4. Eliminating competition**
Acquire a competitor to reduce market pressure. Facebook acquiring Instagram (2012, $1B) and WhatsApp (2014, $19B) eliminated potential threats.

**5. Vertical integration**
Control more of the supply chain. Reliance acquiring multiple oil-to-chemicals businesses to control everything from crude oil to consumer products.

## The M&A process

### For listed companies (takeover)
1. Acquirer makes an offer to buy shares (at a premium to market price)
2. SEBI regulations require minimum 26% open offer if acquirer crosses 25% stake
3. Board approves (or rejects hostile takeover)
4. Regulatory approvals (CCI for competition concerns)
5. Completion and delisting (if full acquisition)

### Due diligence
Before acquisition, the buyer investigates everything:
- Financial statements and audit reports
- Customer contracts and concentration
- Legal cases and liabilities
- Employee agreements and retention risk
- Technology and IP ownership

## Why most M&A destroys value

Studies consistently show 60-70% of acquisitions destroy shareholder value for the acquirer.

Reasons:
- Overpaying (winner''s curse — the winner paid the most)
- Integration failure — merging cultures and systems is harder than expected
- Synergies overestimated, costs underestimated
- Key people leave post-acquisition

## For investors

When a company you own makes a large acquisition:
- Is the price reasonable? (What multiple of EBITDA?)
- Are the synergies realistic or just justification for overpaying?
- Does the acquisition fit the core competency?
- How is it being financed? (Cash = less dilution, stock = potential value transfer)
- What is management''s track record with past acquisitions?',
    8, 18, TRUE, FALSE),

    (corp_id, 'Understanding EBITDA and free cash flow — what really matters',
    'ebitda-free-cash-flow',
    '# EBITDA and free cash flow — what really matters

## The profit problem

Net profit (PAT) is the number most investors focus on. It is also one of the most manipulated metrics in financial reporting.

Why? Because net profit includes:
- Depreciation (non-cash expense — no cash leaves the company)
- Amortisation (non-cash)
- Interest (which depends on capital structure, not business quality)
- Tax (which depends on jurisdiction and tax planning)
- One-time items that management can classify creatively

## EBITDA — stripping out the noise

EBITDA = Earnings Before Interest, Tax, Depreciation and Amortisation

By removing interest, tax, depreciation, and amortisation, EBITDA:
- Removes capital structure effects (useful when comparing leveraged vs unleveraged companies)
- Removes accounting non-cash charges
- Gives a proxy for operating cash generation

EBITDA margin = EBITDA / Revenue × 100

**Use EBITDA for**: Comparing operational efficiency between companies in the same industry. Valuing businesses (EV/EBITDA multiple).

**Do not use EBITDA for**: Determining if a business is actually generating cash. A highly capital-intensive business (requires constant investment in new equipment) can have great EBITDA but poor actual cash generation.

## Free Cash Flow — the most honest metric

**Free Cash Flow = Operating Cash Flow − Capital Expenditure**

Or alternatively:
**FCF = Net Profit + Depreciation − Change in Working Capital − Capex**

FCF is what is truly left for the company after:
- Running the business
- Replacing/expanding assets
- Funding working capital

FCF can be used for: dividends, buybacks, debt repayment, acquisitions, or cash buildup.

**The FCF test**: Is the company''s reported profit translating into actual cash? If PAT is consistently ₹500 crore but FCF is only ₹100 crore, investigate why.

Common reasons for low FCF despite high profits:
- Aggressive revenue recognition (booking revenue before cash collected)
- High capital expenditure requirements
- Growing receivables (customers not paying)

## The ideal company

High EBITDA margin (strong operations) + High FCF conversion (profit becomes real cash) + Low capex requirements (does not need constant reinvestment) = Exceptional business quality.',
    8, 19, TRUE, FALSE),

    (corp_id, 'How to analyse a business model — the five questions',
    'how-to-analyse-business-model',
    '# Analysing a business model

## The five questions that reveal everything

Before evaluating any financial metric, understand the business itself. Numbers without business understanding lead to wrong conclusions.

### Question 1: How does the company make money?

Sounds obvious — rarely answered precisely.

Revenue model types:
- **Product sales**: Sell goods once (smartphones, FMCG)
- **Service revenue**: Ongoing engagement (consulting, IT services)
- **Subscription**: Recurring revenue (Netflix, SaaS, insurance)
- **Transaction fee**: Take a cut of each transaction (payment gateways, marketplaces)
- **Advertising**: Users are the product (social media, search)
- **Licensing**: Charge for right to use IP (pharma patents, software)

Subscription and licensing models are most valuable — predictable, recurring, high margins.

### Question 2: What is the competitive moat?

Warren Buffett''s concept: what protects this business from competition?

Types of moats:
- **Switching costs**: Customers cannot easily switch (enterprise software, banking)
- **Network effects**: More users make the product more valuable (WhatsApp, Uber, stock exchanges)
- **Cost advantages**: Lower cost than competitors (scale, geography, proprietary processes)
- **Intangibles**: Brand, patents, regulatory licenses
- **Efficient scale**: Natural monopoly in a niche (toll roads, water utilities)

No moat = competitors will enter and erode margins → avoid or price accordingly.

### Question 3: Who are the customers and how concentrated is revenue?

If one customer is 30% of revenue and leaves — disaster.
If 1,000 customers each are 0.1% of revenue — one departure barely noticed.

Customer concentration risk is underappreciated. Always check top customer as % of revenue.

### Question 4: What are the unit economics?

**CAC (Customer Acquisition Cost)**: How much does it cost to acquire one customer?
**LTV (Lifetime Value)**: How much revenue does one customer generate over their lifetime?

LTV / CAC ratio should be 3:1 or higher for a sustainable business.

**Contribution margin**: Revenue minus variable costs per unit. Must be positive to have a viable business. Some businesses scale with negative contribution margins hoping to reach profitability through scale — this almost never works.

### Question 5: What are the key risks?

- Regulatory risk (banking, pharma, telecom are heavily regulated)
- Technological disruption risk (how long before this business model is obsolete?)
- Customer concentration risk
- Key person risk (founder-dependent businesses)
- Input cost risk (commodity exposure)',
    8, 20, TRUE, FALSE),

    (corp_id, 'Corporate governance — why it protects you as an investor',
    'corporate-governance',
    '# Corporate governance

## What is corporate governance?

Corporate governance is the system of rules, practices, and processes by which a company is directed and controlled.

For investors, it answers: **Are management and board acting in shareholders'' best interests, or their own?**

Poor corporate governance has destroyed more investor wealth than poor business quality. Satyam, IL&FS, DHFL — all were companies where governance failure wiped out investors.

## The board of directors

The board''s job is to represent shareholders and oversee management.

**Independent directors**: Not employed by the company, not related to promoters. SEBI requires at least one-third of the board to be independent. They are supposed to ask hard questions and protect minority shareholders.

**Red flag**: Board stacked with friends and family of promoters. Independent directors who attend every meeting and vote with management 100% of the time.

## Promoter holding and pledging

**Promoter holding**: The founding family''s stake in the company.

High promoter holding (60%+) generally indicates confidence in the business. Low and declining promoter holding is a warning sign.

**Pledging**: Promoters borrowing money against their shares as collateral.

High promoter pledging is a serious red flag:
- If the stock falls, lenders can sell pledged shares (crashing the price further)
- It suggests promoters needed cash that the company could not provide
- Pledging creates pressure to maintain or raise stock price through any means necessary

Always check promoter pledge percentage in shareholding data.

## Related party transactions

Related party transactions (RPT) are dealings between the company and entities connected to promoters (their other companies, family).

Some RPTs are legitimate (group company synergies). Others are mechanisms for extracting value from the listed company.

Red flags in RPTs:
- Large value relative to company revenue
- Above-market rates paid to related parties
- Loans given to related parties that are not repaid
- Promoter companies as major customers or suppliers

## Remuneration

Are promoters paying themselves excessively?

SEBI allows promoters to take remuneration up to 10% of net profit. Some promoters take maximum remuneration regardless of company performance.

Compare promoter remuneration to:
- Company profitability trends
- Peer companies
- Value created for shareholders

## SEBI''s shareholder protection rules

SEBI has strengthened minority shareholder protections:
- Mandatory e-voting on all resolutions
- Related party transactions above threshold require majority of non-promoter shareholders to approve
- Quarterly disclosure requirements
- Insider trading restrictions

As a minority investor, exercise your voting rights through the e-voting platform.',
    8, 21, TRUE, FALSE),

    (corp_id, 'Financial modeling basics — building a simple 3-statement model',
    'financial-modeling-basics',
    '# Financial modeling basics

## What is a financial model?

A financial model is a mathematical representation of a company''s financial performance — past, present, and projected future.

The foundation of all financial modeling is the **3-statement model**: linking the income statement, balance sheet, and cash flow statement so that changes flow logically through all three.

## The 3 statements and how they connect

### Income Statement (P&L)
Revenue → Gross Profit → EBITDA → EBIT → PBT → PAT

**Key outputs**:
- Net profit flows to retained earnings on balance sheet
- Depreciation from income statement feeds into cash flow statement

### Balance Sheet
Assets = Liabilities + Equity (always must balance)

**Key outputs**:
- Opening cash + changes = closing cash (links to cash flow)
- Net debt changes link to interest expense on income statement

### Cash Flow Statement
Operating cash flow + Investing cash flow + Financing cash flow = Net change in cash

**Key linkages**:
- Starts with PAT from income statement
- Adds back depreciation (non-cash)
- Accounts for working capital changes
- Capex links to asset changes on balance sheet

## Building a simple revenue forecast

**Step 1**: Identify revenue drivers
Example for a retail company:
- Number of stores × Revenue per store

**Step 2**: Project each driver
- Number of stores: Open 10 new stores per year (based on management guidance)
- Revenue per store: Grow 8% per year (based on historical same-store growth)

**Step 3**: Build bottom-up revenue projection
Year 1: 50 stores × ₹5 crore = ₹250 crore
Year 2: 60 stores × ₹5.4 crore = ₹324 crore
Year 3: 70 stores × ₹5.83 crore = ₹408 crore

**Step 4**: Project margins and expenses
- Gross margin: assume 35% (based on history)
- EBITDA margin: assume 18%
- Depreciation: 5% of revenue (capital-intensive retail)
- Interest: based on projected debt level

**Step 5**: Derive cash flow
- Operating cash = EBITDA − taxes − working capital changes
- Investing cash = capex for new stores
- Financing cash = debt drawn / repaid, dividends

## What models reveal

The value of a model is not the output — it is the process. Building a model forces you to understand:
- What actually drives this business?
- What are the key assumptions?
- How sensitive is value to changes in assumptions?

A sensitivity table showing how equity value changes based on different revenue growth and margin scenarios is often more valuable than the central case number.',
    9, 22, TRUE, FALSE)
  ) AS val(level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  WHERE NOT EXISTS (
    SELECT 1 FROM lessons l WHERE l.level_id = val.level_id AND l.slug = val.slug
  );
END IF;

-- ═══════════════════════════════════════════════════════════
-- BEHAVIORAL FINANCE — 3 additional lessons
-- ═══════════════════════════════════════════════════════════
IF beh_id IS NOT NULL THEN
  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT val.level_id, val.title, val.slug, val.content_mdx, val.duration_minutes, val.order_index, val.is_published, val.is_free
  FROM (
    VALUES
    (beh_id, 'The psychology of debt — why we borrow more than we should',
    'psychology-of-debt',
    '# The psychology of debt

## Why debt is psychologically different

Money in your account feels concrete. Money you owe feels abstract — especially for credit cards and BNPL where payments are deferred.

This psychological distance between spending and payment is deliberately engineered by lenders. It causes people to spend more than they would with cash.

## Pain of paying

Research shows we experience "pain of paying" when handing over cash. The physical act of giving money triggers loss aversion.

Credit cards, UPI, and BNPL reduce this pain dramatically. The spending feels free in the moment; the pain arrives weeks later when the bill comes.

**Studies show people spend 12-18% more with credit cards than cash for identical purchases.** This is why every restaurant, hotel, and retailer prefers card payments.

## Debt normalisation

Indian society has shifted dramatically in one generation. In the 1990s, debt was considered shameful — reserved for emergencies. Today, EMI is how most people buy everything from phones to furniture.

EMI culture changes psychology:
- "Can I afford this?" becomes "What is the EMI?"
- ₹60,000 phone feels impossible; ₹2,000/month for 24 months feels manageable
- The actual ₹48,000 interest cost (at 24% PA) is invisible until it is paid

## The debt trap psychology

Once in debt, cognitive biases make it harder to escape:

**Ostrich effect**: Avoiding thinking about debt because it is unpleasant. Not opening credit card statements. Checking balance only once a month.

**Minimum payment trap**: Credit card companies deliberately set minimum payments low to keep you in debt longer. The full balance feels too large; minimum feels achievable. The result is years of interest payments.

**Debt consolidation cycle**: Taking a new loan to pay old loans feels like progress but often makes things worse (longer tenure, more total interest, and the freed-up credit gets used again).

## Healthier relationship with debt

1. **Track all debts**: List every debt, balance, rate, and minimum payment
2. **Calculate true cost**: How much interest will you pay total?
3. **Pay in cash when possible**: Feel the pain of spending
4. **Sleep on large purchases**: 48-hour rule prevents impulse buying on credit
5. **Treat credit card as debit card**: Only spend what you already have in your account
6. **Set autopay for full balance**: Never carry credit card balance if you can avoid it',
    7, 16, TRUE, FALSE),

    (beh_id, 'How social media and news distort your financial decisions',
    'social-media-financial-decisions',
    '# Social media and financial decisions

## The information environment has changed

In 1990, your financial reference group was people you knew personally — colleagues, neighbours, family. You compared your financial situation to maybe 100-200 people you actually knew.

Today, you are exposed to the curated highlight reels of thousands of people through Instagram, LinkedIn, and YouTube. Every day you see:
- Friends'' new cars and holidays
- LinkedIn posts about early retirement at 35
- YouTube thumbnails of people making ₹1 lakh/day trading
- Instagram of luxury lifestyles funded by "passive income"

This creates an artificial comparison set that is wildly unrepresentative — you only see the successful outcomes, never the failures.

## Survivorship bias on social media

For every person documenting their crypto trading profits, there are 20 who lost money and are not posting about it.

For every YouTube channel showing ₹1 crore passive income, there are hundreds of failed attempts you never see.

**Survivorship bias**: Judging a strategy by successful examples while ignoring the much larger number of failures.

Applied to investing, it makes high-risk strategies appear more reliable than they are.

## FOMO engineering

Social media platforms are designed to maximise engagement. FOMO (Fear of Missing Out) is one of the most powerful engagement drivers — if everyone is doing something, you feel left out.

This is weaponised against investors:
- "Everyone is getting rich in crypto" (seen at peak 2021)
- "My friend made 5x in penny stocks"
- "Market is crashing — sell everything" (seen at every correction)

Social media amplifies extreme narratives because they generate more engagement than boring, accurate advice ("invest in index funds for 20 years").

## News cycle distortion

24/7 financial news requires constant content. "Market rose 0.5% today" is not compelling. "MARKETS IN TURMOIL: Recession Warning" drives clicks.

Research shows:
- Investors who check portfolios daily have worse returns than those who check annually
- Market news consumption is negatively correlated with investment returns
- Investors who disconnected from news during COVID crash were less likely to panic-sell

## Practical protection

1. **Curate your feed**: Unfollow accounts that trigger FOMO or anxiety. Follow evidence-based finance accounts.
2. **Limit financial news**: Once per week is sufficient for long-term investors.
3. **Create an investment policy**: Written rules prevent impulse decisions driven by news.
4. **Mute portfolio apps**: Remove from home screen. Check quarterly, not daily.
5. **Find your reference group**: Discuss finances with actual friends at similar life stages, not influencers.',
    7, 17, TRUE, FALSE),

    (beh_id, 'The psychological cost of financial stress — and how to reduce it',
    'psychological-cost-financial-stress',
    '# Financial stress and mental health

## The bidirectional relationship

Financial stress causes mental health problems. Mental health problems worsen financial decisions. This creates a destructive cycle that is hard to break.

Research consistently shows financial stress is one of the leading causes of:
- Anxiety and depression
- Relationship problems (money is the #1 cause of divorce)
- Sleep disorders
- Physical health problems (stress hormones cause measurable physiological harm)
- Reduced cognitive capacity (financial worry consumes mental bandwidth)

## How financial stress impairs decision-making

A landmark Princeton study gave Indian sugar cane farmers cognitive tests before harvest (low cash, high financial stress) and after harvest (cash received, low stress).

Finding: Financial stress caused the equivalent of a 13-point drop in IQ and a significant reduction in executive function — similar to losing a full night of sleep.

When worried about money, there is less mental bandwidth available for careful decision-making. This is not a character flaw — it is a measurable cognitive effect.

This explains why people in financial stress sometimes make decisions that seem irrational from outside: payday loans at 400% APR, lottery tickets, impulse spending on small pleasures as psychological relief.

## The stress spiral

Financial stress → poor sleep → impaired judgment → worse financial decisions → more financial stress.

Breaking this cycle requires addressing both the financial situation AND the psychological response.

## Practical steps to reduce financial stress

**1. Get clear on your actual situation**
Anxiety thrives on uncertainty. Listing all debts, assets, income, and expenses precisely — however bad the picture — reduces anxiety by replacing vague dread with concrete reality.

**2. One action at a time**
Overwhelming financial problems feel impossible to solve. Breaking into specific actions (open this account, cancel this subscription, call this creditor) creates progress and momentum.

**3. Build the emergency fund first**
Research shows even a small financial buffer (₹10,000-₹25,000) significantly reduces financial stress. Knowing you have resources to handle a car repair or medical expense is psychologically calming.

**4. Separate self-worth from net worth**
Your financial situation is not your identity. Financial mistakes do not make you a bad person. Many people build strong financial health after periods of financial difficulty.

**5. Seek support**
Talking to a trusted friend, financial counsellor, or therapist about financial stress reduces its psychological burden. Financial shame thrives in silence.',
    7, 18, TRUE, FALSE)
  ) AS val(level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  WHERE NOT EXISTS (
    SELECT 1 FROM lessons l WHERE l.level_id = val.level_id AND l.slug = val.slug
  );
END IF;

-- ═══════════════════════════════════════════════════════════
-- FOREX BASICS — 3 additional lessons
-- ═══════════════════════════════════════════════════════════
IF forex_id IS NOT NULL THEN
  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT val.level_id, val.title, val.slug, val.content_mdx, val.duration_minutes, val.order_index, val.is_published, val.is_free
  FROM (
    VALUES
    (forex_id, 'Central bank interventions — how RBI manages the rupee',
    'central-bank-forex-intervention',
    '# Central bank interventions in forex

## Why central banks intervene

Free-floating exchange rates can be volatile. Extreme currency moves can:
- Cause imported inflation (weak currency = expensive imports)
- Hurt export competitiveness (too strong = exports become expensive abroad)
- Create financial instability (rapidly moving rates cause business planning chaos)

Central banks intervene to smooth excessive volatility — not to fix the rate, but to limit speed and magnitude of moves.

## How RBI manages the rupee

### Direct intervention — buying and selling USD

When INR weakens too fast, RBI sells USD from its reserves and buys INR.
This increases INR supply of dollars (reducing dollar price) and reduces supply of rupees (increasing rupee value).

When INR strengthens excessively, RBI buys USD and sells INR (building reserves).

India''s forex reserves: $600+ billion (April 2024) — among the largest globally.
These reserves are the ammunition for intervention.

### Interest rate policy

Higher interest rates attract foreign capital seeking better returns.
Investors buy INR to invest in Indian bonds → INR strengthens.

RBI rate hikes during high USD/INR periods serve dual purpose: control inflation AND support INR.

### Communication (jawboning)

Sometimes RBI simply signals its intentions. If the market believes RBI will intervene at 84 USD/INR, speculative positions against INR become risky.

RBI has successfully stabilised INR in periods just by communicating intervention intent.

## The limits of intervention

RBI cannot fight fundamental forces indefinitely:
- India''s chronic current account deficit creates structural INR selling pressure
- Higher inflation vs US means INR should depreciate over time (PPP)
- Capital outflows (FII selling) create selling pressure RBI cannot fully offset

**RBI''s goal**: Prevent disorderly moves. Not prevent all moves. INR has depreciated from ₹45 (2010) to ₹83 (2024) despite continuous RBI presence.

## How to trade around RBI interventions

For currency traders:
- USD/INR approaching 84-85 = expect heavy RBI intervention (resistance zone)
- Very sharp INR falls = high probability of RBI selling USD (mean reversion opportunity)
- Post-RBI meeting volatility = trade with caution around rate decisions
- Monitor India''s forex reserve levels: falling rapidly = RBI has been selling USD heavily to defend INR',
    8, 16, TRUE, FALSE),

    (forex_id, 'Carry trade — how global investors move currencies',
    'carry-trade-explained',
    '# The carry trade — a powerful currency force

## What is a carry trade?

A carry trade involves borrowing in a low-interest-rate currency and investing in a high-interest-rate currency, profiting from the interest rate differential.

**Simple example**:
- Borrow in Japanese Yen at 0.1% interest rate
- Convert to Indian Rupees
- Invest in Indian government bonds at 7.25%
- Net carry: 7.15% (minus currency risk)

This sounds like free money — and when it works, it is extremely profitable. When it unwinds, it is catastrophic.

## Why carry trades matter for INR

India typically has higher interest rates than developed markets (US, Japan, Europe). This attracts carry trade inflows:

- Foreign investors borrow cheap (USD, JPY, CHF)
- Buy INR
- Invest in Indian bonds or equities
- Earn the interest differential

This creates buying pressure on INR → INR strengthens.

## The carry trade unwind — why it causes crises

Carry trades depend on two things:
1. Interest rate differential remaining attractive
2. Exchange rate stability (currency risk not exceeding carry)

When global uncertainty rises (recession fears, geopolitical events, financial crises), carry traders rush for the exit simultaneously:

- They sell Indian assets
- They sell INR
- They repay their USD/JPY borrowings

This creates massive, sudden INR selling pressure.

## The 2013 taper tantrum

When the US Fed announced it would reduce bond purchases (tapering QE) in 2013, global interest rate expectations shifted.

Carry trades into emerging markets (India, Indonesia, Brazil) unwound rapidly.

INR fell from ₹55 to ₹68 in weeks (24% depreciation in 3 months).

India''s current account deficit and dependence on foreign capital made it particularly vulnerable.

## Implications for Indian investors

When global carry trades are unwinding (risk-off environment):
- FIIs sell Indian equities and bonds
- INR weakens rapidly
- Indian markets fall disproportionately

This is why Indian markets are sensitive to US Fed policy — even changes in US interest rate expectations affect carry trade dynamics and therefore INR and Indian asset prices.',
    7, 17, TRUE, FALSE),

    (forex_id, 'Hedging currency risk — how companies and investors protect themselves',
    'hedging-currency-risk',
    '# Hedging currency risk

## Why currency risk matters to everyone

You may never trade forex, but currency risk affects you:

**IT employee**: Your company earns USD. INR strengthening cuts profit margins and may lead to slower salary growth.

**Investor in international funds**: Rupee strengthening while investing in US markets = lower returns in INR terms.

**Importer**: Raw materials priced in USD. INR weakening raises your costs.

**Exporter**: Revenue in USD. INR strengthening reduces your rupee revenue.

**Education abroad**: Fee in GBP/USD. INR weakening makes education more expensive.

## How Indian companies hedge

### Forward contracts
An agreement to buy or sell a specific amount of foreign currency at a predetermined rate on a future date.

Example: IT company will receive $10M in 3 months. They lock in today''s rate of ₹83 via a forward contract. Even if INR strengthens to ₹80 by then, they receive ₹83 per dollar.

Cost: The forward rate includes a risk premium (typically forward rate = spot rate + interest rate differential).

### Currency options
Buy the right (not obligation) to exchange currency at a specific rate.

Exporter buys a USD put option: If USD falls below ₹80, the option protects at ₹80. If USD stays above ₹80, the option expires and they benefit from the higher rate.

**Advantage over forward**: Protects downside while preserving upside. Higher cost than forward.

### Natural hedging
Match revenue and cost currencies.

IT company earning USD hires US-based staff, takes US dollar loans → reduces net USD exposure.

Importer of USD goods sells products in USD internationally → USD revenue offsets USD costs.

## How individual investors can hedge

**For investments in US markets**: Some international mutual funds offer hedged versions that eliminate currency risk. However, hedging costs 1-1.5% per year — consider if this is worth it given your view on INR/USD.

**For upcoming USD expenses** (education, travel): Buy some USD in advance or use NSE currency futures to lock in your exchange rate.

**Practical approach**: If you have large upcoming foreign currency expenses (college fees, emigration), hedge 50-70% of the amount rather than 100%. You protect against the worst case while allowing some benefit if rates move in your favour.',
    7, 18, TRUE, FALSE)
  ) AS val(level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  WHERE NOT EXISTS (
    SELECT 1 FROM lessons l WHERE l.level_id = val.level_id AND l.slug = val.slug
  );
END IF;

-- ═══════════════════════════════════════════════════════════
-- TECHNICAL ANALYSIS — 4 additional lessons
-- ═══════════════════════════════════════════════════════════
IF ta_id IS NOT NULL THEN
  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT val.level_id, val.title, val.slug, val.content_mdx, val.duration_minutes, val.order_index, val.is_published, val.is_free
  FROM (
    VALUES
    (ta_id, 'Price action trading — reading markets without indicators',
    'price-action-trading',
    '# Price action trading

## What is price action?

Price action trading means reading the market purely through price movement — without any indicators. No RSI, no MACD, no moving averages. Just candlesticks, support/resistance, and trend structure.

Advocates argue indicators are all derived from price anyway — why look at a delayed derivative when you can read the primary source?

## The building blocks of price action

### Swing highs and swing lows
A **swing high** is a candle with a higher high than both the candle before and after it.
A **swing low** is a candle with a lower low than both the candle before and after it.

Trend identification:
- Uptrend: Higher swing highs AND higher swing lows
- Downtrend: Lower swing highs AND lower swing lows
- Sideways: Swing highs and lows at similar levels

### Market structure
**Break of structure (BOS)**: Price breaks beyond the last swing high (in uptrend) or swing low (in downtrend). Confirms trend continuation.

**Change of character (CHoCH)**: Price breaks beyond the previous swing in the opposite direction. First sign of potential trend reversal.

### Key levels
Price action traders mark:
- Previous swing highs and lows (obvious to all traders)
- Equal highs/lows (liquidity pools — likely areas for stops)
- Consolidation zones (price spent time here — strong memory)

## Price action entry setups

### Pin bar (hammer/shooting star)
Long wick showing rejection of a price level. At support: bullish pin bar = buyers rejected lower prices. At resistance: bearish pin bar = sellers rejected higher prices.

Entry: Next candle open after the pin bar
Stop: Beyond the wick of the pin bar
Target: Next significant level

### Inside bar
A candle completely contained within the previous candle''s range. Represents consolidation and indecision.

After a strong move, an inside bar signals pause. Breakout of the inside bar in trend direction = continuation entry.

### Engulfing candle
A candle that completely engulfs the previous candle''s body.

Bullish engulfing at support after downtrend = high probability reversal signal
Bearish engulfing at resistance after uptrend = high probability reversal signal

## Price action vs indicators

**Arguments for price action**:
- No lag (indicators are always delayed)
- Forces you to understand market structure, not just signals
- Works across all markets and timeframes
- Fewer variables, clearer thinking

**Arguments for indicators**:
- More objective (less interpretation required)
- Easier to backtest systematically
- Better for beginners who need structure

**Practical recommendation**: Learn price action first to understand market structure. Then add 1-2 indicators for confirmation if needed.',
    8, 16, TRUE, FALSE),

    (ta_id, 'Trading journals — why the best traders obsessively track every trade',
    'trading-journals',
    '# The trading journal — your most important tool

## Why most traders skip journals

Journaling feels like homework. After a trading session — especially a bad one — the last thing you want to do is document your mistakes in detail.

This is exactly why most traders never improve. They repeat the same mistakes because they have not honestly analysed them.

Professional traders treat the journal as seriously as the trading itself. It is the only way to distinguish skill from luck and identify genuine edge.

## What to record for every trade

### Before entering
- **Date and time**
- **Instrument** (NIFTY, EURUSD, Reliance, etc.)
- **Direction** (long/short)
- **Entry price** and **entry rationale** (what is the setup?)
- **Stop loss price** and **why here?**
- **Target price** and **why here?**
- **Position size** and **% of account at risk**
- **Market condition** (trending, ranging, news pending?)
- **My mental state** (calm? anxious? tired? overconfident?)

### After closing
- **Exit price** and **exit reason** (hit target? hit stop? manual exit? why?)
- **Result** in R multiples (e.g., +1.5R, -1R, +0R = break-even)
- **What went right?**
- **What went wrong?**
- **What would I do differently?**
- **Trade screenshot** (before and after)

## Weekly and monthly review

**Weekly questions**:
- What was my win rate this week?
- What was my average R multiple?
- Did I follow my trading rules?
- Which setups worked best?
- Did emotional state affect decisions?

**Monthly questions**:
- Is my expectancy positive? (Win rate × Avg win) − (Loss rate × Avg loss)
- Which market conditions suit my strategy?
- Am I overtrading? (Too many trades)
- Am I undersizing when scared, oversizing when confident?

## What the journal reveals over time

After 50-100 documented trades, patterns emerge that are invisible without records:

- "I lose money when I trade NIFTY on Mondays"
- "My best setups are 9:30-11am, not afternoon"
- "I exit winners too early when the position is profitable by 1R"
- "I ignore stop losses when I''ve had 3 losses in a row"

These insights are gold. They cannot be found any other way.

## Journal formats

**Simple**: Spreadsheet with one row per trade and all fields above.

**Detailed**: Trading journal software (Tradervue, TradesViz) with automatic P&L calculation, risk metrics, and visualisations.

**Photo journal**: Screenshot every trade on entry and exit. Review them weekly.',
    7, 17, TRUE, FALSE),

    (ta_id, 'Sector rotation — how to identify which sectors lead the market',
    'sector-rotation',
    '# Sector rotation — following the money

## What is sector rotation?

Different sectors of the economy perform better at different stages of the economic cycle. Smart money (institutions) rotate from outperforming sectors to underperforming sectors as the cycle shifts.

By identifying which stage of the cycle we are in, technical analysts can position in sectors before they outperform.

## The economic cycle and sector performance

### Early recovery (recession → expansion)
- Economy beginning to recover
- Interest rates falling
- **Outperforming sectors**: Consumer discretionary, financials, real estate, technology
- **Reason**: Falling rates benefit borrowing; pent-up consumer demand returns

### Mid cycle (expansion)
- Economy growing steadily
- Corporate earnings rising
- **Outperforming sectors**: Technology, industrials, materials
- **Reason**: Business investment increases; commodity demand rises

### Late cycle (peak)
- Economy near peak growth
- Inflation rising; interest rates rising
- **Outperforming sectors**: Energy, materials, healthcare, consumer staples
- **Reason**: Commodities benefit from demand; defensives attract safety-seeking capital

### Recession
- Economy contracting
- Earnings falling
- **Outperforming sectors**: Utilities, consumer staples, healthcare
- **Reason**: These sectors have stable demand regardless of economic conditions

## Technical indicators of sector rotation

### Relative strength comparison
Compare a sector''s chart to the broad market (NIFTY). If sector is rising faster than NIFTY, it is showing relative strength.

Plot: Bank NIFTY / NIFTY 50 ratio. If the ratio is rising, banking is outperforming the broader market.

### Sector breadth
More stocks within a sector making new 52-week highs than lows = sector strength.
Declining breadth (fewer stocks participating in rally) = sector losing momentum.

### Volume confirmation
Sector ETF or index rising on above-average volume = genuine rotation into sector.
Rising prices on declining volume = rotation may not be sustainable.

## India-specific sector observations

**Monsoon cycle**: Agricultural, FMCG, and two-wheeler stocks often follow monsoon patterns.

**Rate cycle**: Bank NIFTY closely tracks RBI rate expectations. Rate cut cycle = strong banking sector.

**Global commodity cycle**: Metal stocks (Tata Steel, Hindalco, JSW) track global steel and aluminium prices.

**IT sector**: Closely linked to US economic health and USD/INR. Strong US economy + weak rupee = strong IT sector.',
    8, 18, TRUE, FALSE),

    (ta_id, 'Algorithmic trading — what it is and how it affects retail traders',
    'algorithmic-trading-retail-impact',
    '# Algorithmic trading and the retail trader

## What is algorithmic trading?

Algorithmic trading uses computer programs to execute trades based on predefined rules — automatically, without human intervention, often in milliseconds.

In India, SEBI data shows approximately 50-60% of NSE turnover is algorithmic. In US markets, it is 70-80%.

This means most of your trades are being executed against computers, not other humans.

## Types of algorithms you trade against

### Market making algorithms
Continuously provide buy and sell quotes. Profit from the bid-ask spread.

**Impact on you**: Tighter spreads (good) but the algorithm will pull quotes during volatility (the spread widens exactly when you most need to trade).

### Statistical arbitrage
Exploit tiny mispricings between related instruments. Keeps markets efficient.

**Impact on you**: Ensures the NIFTY futures price stays close to fair value. You can trade futures knowing the price is efficient.

### Trend following algorithms
Trade breakouts, moving average crossovers, momentum. Similar to what many retail traders do, but faster and more systematic.

**Impact on you**: Breakouts often fail because algorithms trigger immediately on breakout signals, causing a spike that reverses quickly as profit-taking begins. This is one reason breakout trading has become harder.

### High frequency trading (HFT)
Exploit latency advantages — react to market information faster than any human can.

**Impact on you**: Minimal direct impact for most retail traders unless you are trying to scalp very short timeframes.

## How to compete as a retail trader

You cannot beat algorithms on speed. You can beat them on:

**Longer timeframes**: HFT has no advantage on daily, weekly charts. Algorithms trading on milliseconds do not care about daily chart patterns.

**Fundamental information**: Algorithms trading on technical patterns cannot process qualitative information — management quality, industry dynamics, competitive changes.

**Patience**: Algorithms optimize for short-term profit. Patient investors holding quality businesses 5-10 years face no algorithmic disadvantage.

**Avoiding their hunting grounds**: Do not scalp. Do not front-run obvious breakout levels with tiny stops — algos hunt these stops deliberately.',
    7, 19, TRUE, FALSE)
  ) AS val(level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  WHERE NOT EXISTS (
    SELECT 1 FROM lessons l WHERE l.level_id = val.level_id AND l.slug = val.slug
  );
END IF;

-- Final count summary
SELECT COUNT(*) INTO v_total FROM lessons WHERE is_published = TRUE;
RAISE NOTICE 'Expansion completed! Total published lessons: %', v_total;

END $$;
