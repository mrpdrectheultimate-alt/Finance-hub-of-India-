-- ============================================================
-- FinanceHub — Phase 9: 45 Critical Missing Lessons
-- Covers: F&O basics · Ratio Analysis · Chart Patterns ·
--         Behavioral Biases · Crypto Advanced · PF Gaps ·
--         Corporate Finance Gaps · Forex Gaps
-- Run AFTER: phase8_lessons.sql
-- All inserts idempotent with WHERE NOT EXISTS
-- ============================================================

DO $PHASE9$
DECLARE
  pf_id   UUID; tm_id   UUID; ta_id   UUID;
  cr_id   UUID; cf_id   UUID; bf_id   UUID;
  fx_id   UUID;
BEGIN
  SELECT id INTO pf_id FROM levels WHERE track_id=(SELECT id FROM tracks WHERE slug='personal-finance')       ORDER BY order_index LIMIT 1;
  SELECT id INTO tm_id FROM levels WHERE track_id=(SELECT id FROM tracks WHERE slug='trading-markets')        ORDER BY order_index LIMIT 1;
  SELECT id INTO ta_id FROM levels WHERE track_id=(SELECT id FROM tracks WHERE slug='technical-analysis')     ORDER BY order_index LIMIT 1;
  SELECT id INTO cr_id FROM levels WHERE track_id=(SELECT id FROM tracks WHERE slug='crypto-defi')            ORDER BY order_index LIMIT 1;
  SELECT id INTO cf_id FROM levels WHERE track_id=(SELECT id FROM tracks WHERE slug='corporate-finance')      ORDER BY order_index LIMIT 1;
  SELECT id INTO bf_id FROM levels WHERE track_id=(SELECT id FROM tracks WHERE slug='behavioral-finance')     ORDER BY order_index LIMIT 1;
  SELECT id INTO fx_id FROM levels WHERE track_id=(SELECT id FROM tracks WHERE slug='forex-currency')         ORDER BY order_index LIMIT 1;

  IF pf_id IS NULL THEN SELECT id INTO pf_id FROM levels LIMIT 1; END IF;
  IF tm_id IS NULL THEN tm_id := pf_id; END IF;
  IF ta_id IS NULL THEN ta_id := pf_id; END IF;
  IF cr_id IS NULL THEN cr_id := pf_id; END IF;
  IF cf_id IS NULL THEN cf_id := pf_id; END IF;
  IF bf_id IS NULL THEN bf_id := pf_id; END IF;
  IF fx_id IS NULL THEN fx_id := pf_id; END IF;

-- ═══════════════════════════════════════════════════════════
-- TRADING & MARKETS — F&O (CRITICAL GAP — India's most traded)
-- ═══════════════════════════════════════════════════════════

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT tm_id,'Futures and Options explained — the complete beginner guide','futures-options-basics',
'# Futures and Options — India''s Most Traded Instruments

## Why F&O matters in India

The NSE is the world''s largest derivatives exchange by contract volume. Every day, ₹50,000+ crore of F&O contracts are traded — dwarfing cash equity volumes.

Yet most retail investors enter F&O without understanding the basics. 89% of individual F&O traders lose money (SEBI study, 2023). This lesson explains what you are actually buying and selling.

## What is a Derivative?

A derivative is a financial contract whose value is **derived** from an underlying asset — a stock, index, currency, or commodity.

You are not buying the underlying asset. You are buying a **contract** about the asset''s future price.

Two main types in India: Futures and Options.

## Futures — The Obligation Contract

A futures contract is an agreement to buy or sell an asset at a **predetermined price on a future date**.

Both parties are **obligated** to complete the transaction.

**Example:**
NIFTY 50 is at 22,000 today (spot price).
You buy 1 NIFTY futures contract for ₹22,200 (futures price), expiring next month.

- If NIFTY rises to 23,000 at expiry → you profit (23,000 − 22,200) × 50 lots = ₹40,000
- If NIFTY falls to 21,000 at expiry → you lose (22,200 − 21,000) × 50 lots = ₹60,000

**Lot size:** NIFTY futures = 50 units per lot. 1 contract controls ₹11 lakh notional.
**Margin required:** ~₹1 lakh (margin = ~9% of notional).

This is leverage. Small moves = large profits OR large losses.

## Options — The Right, Not Obligation

An option gives the **buyer the right (not obligation)** to buy or sell at a predetermined price before expiry.

The buyer pays a **premium** upfront. The seller receives the premium.

**Call Option:** Right to BUY at a fixed price (Strike price)
**Put Option:** Right to SELL at a fixed price (Strike price)

## Call Option Example

RELIANCE is at ₹2,800.
You buy 1 RELIANCE 2900 Call Option, expiry next month, premium = ₹40/share.
Lot size = 250 shares.
You pay: ₹40 × 250 = ₹10,000 premium.

**At expiry:**
- RELIANCE at ₹3,000: You exercise. Profit = (3,000 − 2,900 − 40) × 250 = ₹15,000
- RELIANCE at ₹2,850: Option expires worthless. Loss = ₹10,000 (premium paid)
- RELIANCE at ₹2,800: Option expires worthless. Loss = ₹10,000

**Key:** Maximum loss for option buyer = Premium paid.
Maximum gain = theoretically unlimited (for calls).

## Put Option Example

TCS is at ₹3,500.
You buy 1 TCS 3400 Put Option, premium = ₹50/share, lot = 150 shares.
You pay: ₹50 × 150 = ₹7,500.

**At expiry:**
- TCS at ₹3,200: You profit. Gain = (3,400 − 3,200 − 50) × 150 = ₹22,500
- TCS at ₹3,450: Option worthless. Loss = ₹7,500

## Key F&O terminology

**Strike price (K):** The agreed price in the option contract.
**Spot price (S):** Current market price of the underlying.
**Premium:** Price paid by option buyer to seller.
**Expiry:** Date when contract settles. NSE: last Thursday of each month.
**Lot size:** Minimum units in one contract. Fixed by NSE.
**ITM/ATM/OTM:**
- In-the-money (ITM): Exercise is profitable
- At-the-money (ATM): Strike ≈ Spot
- Out-of-the-money (OTM): Exercise is not profitable

## Who uses F&O and why?

**Hedgers:** Airlines buy crude oil futures to lock in fuel costs. Importers buy USD futures to hedge currency risk.

**Speculators:** Traders take directional bets. High risk, high reward.

**Arbitrageurs:** Exploit price differences between cash and futures markets.

**Option sellers (Writers):** Collect premium by selling options. High win rate but unlimited risk without hedging.

## The SEBI warning — take it seriously

SEBI''s 2023 study of 1 crore F&O traders:
- 89% of individual traders made losses
- Average loss per trader: ₹1.1 lakh per year
- Only top 3.5% were consistently profitable

F&O is not a way to "make quick money." It is a sophisticated instrument for hedging and trading with a rigorous edge.

**Eligibility in India:** SEBI requires minimum ₹10 lakh net worth for F&O trading. Brokers must complete KYC and risk profiling.

*Source: SEBI Study on F&O Trading — "Analysis of Profit and Loss of Individual Traders dealing in Equity F&O Segment" (2023)*',
12,200,TRUE,TRUE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='futures-options-basics');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT tm_id,'Options Greeks — Delta, Gamma, Theta, Vega explained simply','options-greeks-explained',
'# Options Greeks — What They Actually Mean

## Why Greeks matter

If you buy an option and hold it overnight, its price can change even if the stock price does not move. That is because options have multiple dimensions of risk. The Greeks measure each dimension.

Understanding Greeks separates serious options traders from gamblers.

## Delta (Δ) — Sensitivity to Price Movement

Delta measures how much an option''s price changes when the underlying moves ₹1.

**Call options:** Delta ranges from 0 to 1.
**Put options:** Delta ranges from -1 to 0.

**Example:**
NIFTY 22,000 Call with Delta = 0.5.
NIFTY moves up 100 points → Call premium rises approximately ₹50.
NIFTY moves down 100 points → Call premium falls approximately ₹50.

**Delta as probability:**
Delta ≈ Probability of expiring in-the-money.
ATM options: Delta ≈ 0.5 (50% chance ITM)
Deep ITM options: Delta ≈ 0.9 (90% chance ITM)
Far OTM options: Delta ≈ 0.1 (10% chance ITM)

**Delta for position sizing:**
100 shares of NIFTY = Delta of 100.
2 ATM call contracts (lot size 50 each, delta 0.5) = Delta of 50.
Options give you "delta exposure" with less capital.

## Gamma (Γ) — Rate of Change of Delta

Gamma measures how fast Delta changes as the underlying moves.

High Gamma = Delta changes rapidly = position becomes more sensitive quickly.

**When Gamma is highest:** ATM options near expiry have the highest Gamma. This is why weekly expiry options (especially Thursday morning) move explosively even on small NIFTY moves.

**Gamma risk for sellers:**
Option sellers (writers) have negative Gamma. If the market moves sharply, their Delta changes rapidly against them — losses accelerate.

## Theta (Θ) — Time Decay

Theta measures how much an option''s premium erodes with each passing day, all else equal.

**Example:**
NIFTY 22,000 Call, 30 days to expiry, Theta = -₹15/day.
If NIFTY stays flat, this option loses ₹15 in premium every single day.

**Theta is always negative for option buyers.**
Theta is always positive for option sellers.

This is why option sellers love selling options 30+ days out — they collect premium that decays every day. It is also called "theta decay."

**Theta accelerates near expiry:**
With 30 days left: option loses 0.5% per day.
With 7 days left: option loses 1.5% per day.
With 1 day left: option loses 5-10% per day.

This is why buying far OTM options just before expiry is extremely risky.

## Vega (ν) — Sensitivity to Volatility

Vega measures how much an option''s price changes when implied volatility (IV) moves 1%.

**Example:**
NIFTY 22,000 Call, Vega = ₹30.
IV increases 1% → Call premium increases ₹30.
IV decreases 1% → Call premium decreases ₹30.

**Implied Volatility (IV):**
IV is the market''s expectation of future price movement, priced into the option.
India VIX = NSE''s measure of near-term volatility expectations.

When volatility spikes (election results, RBI policy, budget day), options become more expensive — even if the stock price has not moved yet.

**Key insight for Indian traders:**
- Buy options BEFORE expected high-volatility events (budget, results day, elections)
- Avoid buying options when IV is already very high — you are paying a premium for volatility that may not materialise

## Using Greeks Together

**The typical situation:**
You buy a 1-month ATM NIFTY Call.
- Delta: 0.5 (gains if NIFTY rises)
- Gamma: Moderate (delta will change as NIFTY moves)
- Theta: -₹25/day (loses ₹25 daily from time decay)
- Vega: +₹40 (gains if volatility rises)

You are fighting Theta every day. You need NIFTY to move enough, fast enough, to offset daily time decay.

This is why most option buyers lose — they are right directionally but not fast enough.

**Option sellers have the opposite:**
Positive Theta, negative Gamma, negative Vega.
They collect time decay daily but face blow-up risk on sharp moves.

*Source: NSE India Derivatives Education; CBOE Options Institute*',
11,201,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='options-greeks-explained');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT tm_id,'Value investing in India — the Buffett framework applied to Indian stocks','value-investing-india',
'# Value Investing in India

## What is value investing?

Value investing is buying stocks at a price significantly below their intrinsic value, then holding until the market recognises that value.

Popularised by Benjamin Graham, perfected by Warren Buffett. The core idea: Mr Market is occasionally irrational and offers good businesses at bad prices.

## The Indian value investing landscape

India has unique characteristics that make value investing both rewarding and challenging:

**Rewards:**
- Faster GDP growth than developed markets (6-7% vs 2-3%)
- Large informal economy transitioning to formal — creating multi-decade growth stories
- Family-promoted businesses with alignment between promoters and shareholders
- Less institutional coverage in small/mid caps = more mispricing opportunities

**Challenges:**
- Accounting quality varies widely — more creative accounting than in US/UK
- Promoter pledging can destroy value suddenly
- Related-party transactions can extract value from minority shareholders
- Corporate governance standards improving but not yet world-class

## The 4-step framework for Indian value investors

### Step 1: Business Quality

Before valuation, ask: is this a business worth owning at ANY price?

**Look for:**
- Pricing power (can they raise prices without losing customers?)
- High Return on Capital Employed (ROCE > 15% consistently)
- Low capex requirements (generates free cash flow without constant investment)
- Moat: switching costs, network effects, cost advantages, brand

**Indian examples of strong moats:**
- Asian Paints: dealers trained on Asian Paints tools = switching costs
- HDFC Bank: massive branch network + trust = strong deposit franchise
- Pidilite (Fevicol): brand so strong it became a verb

### Step 2: Management Quality

In India, the promoter is often the key variable. A great business with a bad promoter is a bad investment.

**Red flags:**
- High promoter pledge (% of shares pledged as loan collateral)
- Related-party transactions at unfair prices
- History of capital allocation failures (acquisitions at terrible prices)
- Frequent auditor changes
- Cash on balance sheet but no dividends/buybacks + constant equity dilution

**Green flags:**
- Promoters buying stock in open market
- Clear capital allocation policy
- Conservative guidance (underpromise, overdeliver)
- Long-serving CFO and auditor

### Step 3: Financial Analysis

**Key ratios for value investing:**

| Ratio | Formula | What it means | Good threshold |
|-------|---------|--------------|----------------|
| P/E | Market Cap / PAT | Price per ₹1 of earnings | < Sector average |
| P/B | Market Cap / Book Value | Price per ₹1 of assets | < 3x for most sectors |
| EV/EBITDA | Enterprise Value / EBITDA | Cleaner than P/E (debt-adjusted) | < 15x for most |
| ROCE | EBIT / Capital Employed | Return on all capital | > 15% |
| FCF Yield | FCF / Market Cap | Cash earned per ₹ invested | > 4% |
| Debt/Equity | Total Debt / Equity | Leverage | < 1x preferred |

### Step 4: Margin of Safety

Buy significantly below intrinsic value. Typical target: 30-50% discount to estimated fair value.

Why? Your DCF assumptions will be wrong. Markets can stay irrational longer than you expect. The margin of safety protects you.

**Intrinsic value calculation:**
Use DCF (discounted cash flow) as a base, cross-check with:
- Comparable company multiples (what similar businesses trade at)
- Replacement cost (what would it cost to build this business from scratch?)
- Private market value (what would a strategic buyer pay?)

## Common value traps in India

A value trap looks cheap but never recovers.

- **PSU banks:** Cheap for decades due to NPA cycles and government interference
- **Telecom companies (pre-Jio consolidation):** Structural decline destroyed value
- **Low-margin commodity businesses:** Cheap P/E but zero pricing power
- **Promoter-pledged stocks:** Cheap until a margin call forces distress selling

*Before buying because something looks "cheap," ask: why is it cheap?*

*Source: Benjamin Graham, "The Intelligent Investor" (1949); Sanjay Bakshi, "Fundoo Professor" — widely read Indian value investing resource*',
10,202,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='value-investing-india');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT tm_id,'Ratio analysis — how to evaluate any Indian stock in 15 minutes','ratio-analysis-complete',
'# Ratio Analysis — Evaluating Any Stock in 15 Minutes

## Why ratios matter

A stock at ₹1,000 is not cheap or expensive by itself. The price means nothing without context.

Ratios provide that context — comparing price to earnings, assets, cash flow and growth.

## Category 1: Valuation Ratios (Is the stock cheap or expensive?)

### Price-to-Earnings (P/E)
P/E = Market Price per Share / EPS

**What it means:** How much are investors paying per ₹1 of earnings?
P/E of 20 = investors pay ₹20 for ₹1 of annual profit.

**Indian market averages (2024):**
NIFTY 50 P/E: 20-24x historically.
Sector averages vary widely:
- FMCG: 40-60x (high quality, slow growth accepted)
- IT: 20-30x
- Banking: 10-18x
- Capital goods: 25-35x
- Metals/commodities: 5-12x (cyclical, not valued on earnings)

**Limitation:** Backward-looking. Earnings can be manipulated.

### Price-to-Book (P/B)
P/B = Market Cap / Book Value of Equity

**What it means:** How much are investors paying per ₹1 of net assets?
P/B < 1: Buying assets at a discount (rare for quality companies)
P/B > 5: Investors paying large premium for intangibles and brand

**Best for:** Banks and financial companies (assets = loans = value)
**Less useful for:** Asset-light businesses (software, consumer brands)

### EV/EBITDA
EV = Market Cap + Debt − Cash
EV/EBITDA = Enterprise Value / EBITDA

**Why it is better than P/E:**
- Includes debt (useful when comparing companies with different capital structures)
- EBITDA ignores depreciation and tax (cleaner operating picture)
- Cannot be gamed as easily as reported earnings

**What is normal:** 10-20x for most Indian companies. Below 8x often signals a value opportunity.

## Category 2: Profitability Ratios (Is it a good business?)

### Return on Equity (ROE)
ROE = PAT / Shareholders Equity × 100

**What it means:** How much profit does the company earn on every ₹100 of shareholder money?
ROE > 15%: Generally good.
ROE > 20%: Very good — sign of a quality business.

**DuPont breakdown (why ROE is high or low):**
ROE = Profit Margin × Asset Turnover × Leverage

High ROE via high leverage is dangerous. High ROE via high margins is valuable.

### Return on Capital Employed (ROCE)
ROCE = EBIT / (Total Assets − Current Liabilities) × 100

**Why ROCE > ROE:**
ROCE measures return on ALL capital (equity + debt), not just equity.
ROCE > cost of capital = company creates shareholder value.
ROCE < cost of capital = company destroys value even if it shows profits.

**Benchmark:** ROCE > 15% over 5+ years = sign of a genuine moat.

### Net Profit Margin
Margin = PAT / Revenue × 100

**Sector benchmarks (India):**
- FMCG: 15-25%
- IT/Software: 20-30%
- Banking: ROA 1-2% (different metric)
- Auto: 5-10%
- Pharma: 15-25%
- Retail: 3-8%

A declining margin over 3+ years is a warning sign.

## Category 3: Financial Health (Will it survive?)

### Debt-to-Equity (D/E)
D/E = Total Debt / Shareholders Equity

D/E < 1: Conservative. Company can absorb shocks.
D/E 1-2: Moderate leverage. Acceptable in capital-intensive sectors.
D/E > 3: High risk. One bad year could cause distress.

**Exception:** Banks and NBFCs have high D/E by nature (they borrow to lend). Use Capital Adequacy Ratio for banks instead.

### Interest Coverage Ratio
ICR = EBIT / Interest Expense

ICR > 3: Company earns 3x its interest obligations. Safe.
ICR < 1.5: Danger zone. One revenue fall could trigger default.

### Current Ratio
Current Ratio = Current Assets / Current Liabilities

> 1.5: Sufficient short-term liquidity.
< 1: Company may struggle to pay near-term obligations.

## Category 4: Efficiency Ratios

### Asset Turnover
Asset Turnover = Revenue / Total Assets

Measures how efficiently a company uses assets to generate revenue.
High asset turnover (>1.5) = capital-efficient business model.

### Receivables Days
= (Debtors / Revenue) × 365

How many days does it take to collect payment from customers?
Rising receivable days = customers paying slower = cash flow stress.

## The 15-minute stock check

1. **P/E vs sector average** — is it above or below? Why?
2. **ROCE over 5 years** — consistently above 15%?
3. **Revenue + profit growth** — 10%+ per year?
4. **D/E** — below 1 (or justified)?
5. **Promoter holding** — above 50%? Pledged shares?
6. **FCF** — is operating cash flow consistently > net profit?

Use Screener.in (free) to get all these numbers instantly for any NSE/BSE listed company.

*Source: Screener.in; NSE India corporate filings; Damodaran (NYU Stern) valuation databases*',
11,203,TRUE,TRUE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='ratio-analysis-complete');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT tm_id,'Demat account — how it actually works, what you own and don''t own','demat-account-complete',
'# Demat Account — What You Actually Own

## What is a Demat account?

Demat = Dematerialised. Before 1996, shares existed as physical paper certificates. Demat accounts replaced physical shares with electronic records.

When you buy shares on NSE or BSE, the shares are held in your Demat account — like how a bank account holds money electronically.

## The ecosystem — 4 entities involved

**1. Stock Exchange (NSE/BSE):** Where buy and sell orders are matched.

**2. Depository (CDSL or NSDL):** Holds the actual electronic records of your shares. Think of them as the "bank" for shares.
- CDSL (Central Depository Services Ltd): More retail-facing. Backed by BSE.
- NSDL (National Securities Depository Ltd): Older, larger. Backed by NSE.

**3. Depository Participant (DP):** Your broker acts as a DP — the intermediary between you and the depository. Zerodha, Groww, Upstox, HDFC Securities etc.

**4. You:** Hold a Demat account number (BO ID — Beneficial Owner ID) with your broker/DP.

## The account structure

**Trading account:** Where you place buy/sell orders. Active during market hours.
**Demat account:** Where your shares are held. Passive — just holds your securities.
**Bank account:** Linked for money transfers in and out.

These are 3 separate accounts that work together. All reputable brokers set up all three simultaneously when you sign up.

## What gets held in a Demat account?

- Equity shares (NSE/BSE listed)
- Mutual fund units (some — others held with AMC)
- Bonds and government securities
- ETFs
- Sovereign Gold Bonds (SGBs)
- REIT and InvIT units
- IPO allotments

## What does NOT go in Demat?

- Physical gold, real estate, fixed deposits
- Unlisted shares (held differently)
- NPS (held with CRA — Central Recordkeeping Agency)
- PPF/EPF (held with banks/EPFO)

## How a trade works (T+1 settlement)

India switched to T+1 (trade plus 1 day) settlement in 2023.

1. You place a buy order for 10 shares of Infosys at ₹1,500.
2. Order is matched on NSE within milliseconds.
3. Your bank account is debited ₹15,000 (+ brokerage + taxes).
4. **Next trading day:** 10 Infosys shares appear in your Demat account.
5. Infosys''s record shows you as a registered shareholder.

For selling: reverse — shares leave Demat, money arrives in bank account next day.

## Charges to know

**Account opening:** Most discount brokers (Zerodha, Groww, Upstox) offer free account opening.

**Demat Annual Maintenance Charge (AMC):**
- CDSL/NSDL charge ₹250-400/year (charged by your broker)
- Zerodha: ₹300/year. Groww: Free for first year.

**Transaction charges (per debit — when you sell):**
- CDSL/NSDL: ₹5.5/debit instruction
- Broker may add their own charge

**Brokerage:**
- Discount brokers (Zerodha, Upstox): ₹20 flat per order or 0.03% for delivery trades
- Full-service brokers (ICICI Direct, HDFC Securities): 0.3-0.5% per trade

**Other taxes on every trade:**
- STT (Securities Transaction Tax): 0.1% of transaction value
- GST: 18% on brokerage
- Exchange transaction charge: ~0.00345% on NSE
- SEBI turnover fee: ₹10 per crore
- Stamp duty: 0.015% on buys

## Nomination — mandatory from 2024

SEBI made nomination mandatory for all Demat accounts from March 2024. Add a nominee. If you die without a nominee, your heirs must go through court proceedings to claim shares — a lengthy, expensive process.

## CDSL CAS — know your holdings anywhere

CDSL Easiest and NSDL SPEED-e allow you to view all your holdings across all Demat accounts in one place, using your PAN. Use this quarterly to audit your holdings.

*Source: SEBI, CDSL (cdslindia.com), NSDL (nsdl.co.in)*',
9,204,TRUE,TRUE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='demat-account-complete');

-- ═══════════════════════════════════════════════════════════
-- TECHNICAL ANALYSIS — CHART PATTERNS (critical missing)
-- ═══════════════════════════════════════════════════════════

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT ta_id,'Head and Shoulders, Double Top, Cup and Handle — chart patterns that work','chart-patterns-complete',
'# Chart Patterns That Actually Work

## Why chart patterns exist

Chart patterns reflect human psychology. The same mass emotions — greed, fear, hope, capitulation — create similar price formations repeatedly across different markets and time periods.

Patterns work because enough traders recognise and act on them, creating self-fulfilling prophecies.

## Reversal Patterns — Trend is changing

### Head and Shoulders (Most Reliable Reversal Pattern)

**Structure:** Three peaks — left shoulder, head (highest), right shoulder. Connected by a neckline.

**Psychology:** 
- Left shoulder: Buyers push price up, then profit-take
- Head: Another push to new highs — buyers still optimistic
- Right shoulder: Last attempt by buyers fails at lower level than the head
- Neckline break: Sellers take control — confirmed reversal

**How to trade it:**
1. Wait for neckline to break on high volume
2. Enter short (or exit longs) on retest of neckline from below
3. Target = distance from head to neckline, projected downward from break
4. Stop loss = above the right shoulder

**Inverse Head and Shoulders:** Same pattern upside down = bullish reversal. Works identically.

**NSE context:** The NIFTY 50 formed a textbook Head and Shoulders in early 2022 (Jan-Feb 2022 top), correctly signalling the extended correction that followed.

### Double Top (Bearish)

**Structure:** Price makes high, pulls back, retests same high, fails, and breaks previous low.

**Confirmation:** Break of the middle trough (the "valley" between the two tops) on volume.

**Target:** Distance between the top and the trough, projected downward.

**Reality check:** The two tops should be at approximately the same price level (within 2-3%). Wide separation reduces reliability.

### Double Bottom (Bullish)

Mirror image of Double Top. Two lows at the same level → bullish reversal.

**Most important rule:** Do NOT trade a double top or bottom until the confirmation break. Many stocks test a level twice and then continue the original trend.

## Continuation Patterns — Trend is continuing

### Cup and Handle (Very Reliable Bullish)

**Structure:** Price makes a rounded bottom (the "cup") then a brief pullback (the "handle"), then breaks out.

**Psychology:** Selling exhaustion → gradual recovery → weak hands shake out in handle → strong buyers break out.

**Timeframe:** Cup typically forms over weeks to months. Works best on weekly charts.

**Entry:** Buy on breakout above the handle resistance with volume expansion.

**Target:** Depth of the cup, added to the breakout level.

**Indian context:** Infosys formed a classic cup and handle in 2013-2014 before a major bull run.

### Ascending Triangle (Bullish)

Horizontal resistance above + rising support = buyers increasingly aggressive = bullish breakout likely.

**Volume:** Should dry up during consolidation, then expand on breakout.

### Descending Triangle (Bearish)

Horizontal support below + falling resistance = sellers increasingly aggressive = bearish breakdown likely.

### Flag and Pennant (Short-term continuation)

**Flag:** Sharp move up or down, then a brief rectangular consolidation against the trend. 
**Pennant:** Same sharp move, then symmetrical triangle consolidation.

Both should resolve in the direction of the original move.

**Trading flags:** Enter on breakout from the flag/pennant with stop below the lowest point of the pattern.

## The honest truth about chart patterns

1. **No pattern works 100% of the time.** Best patterns work 60-70% of the time.
2. **Volume confirmation is non-negotiable.** Breakout without volume = likely false.
3. **Wait for confirmation.** Anticipating a pattern before it completes = gambling.
4. **Context matters.** A Head and Shoulders in an established uptrend is more significant than one in a sideways market.
5. **Larger timeframes = more reliable.** Weekly pattern > daily pattern > hourly pattern.

*Source: Thomas Bulkowski, "Encyclopedia of Chart Patterns" — the definitive statistical study*',
9,300,TRUE,TRUE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='chart-patterns-complete');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT ta_id,'Fibonacci retracement — the most widely used support and resistance tool','fibonacci-retracement-guide',
'# Fibonacci Retracement

## Where Fibonacci comes from

Leonardo Fibonacci was a 13th-century Italian mathematician. The Fibonacci sequence: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89...

Each number is the sum of the two preceding numbers.

**Key ratio:** 21/34 = 0.618. 34/55 = 0.618. This ratio (approximately 0.618) appears throughout nature and — traders believe — in financial markets.

## The Fibonacci retracement levels

When a stock moves significantly in one direction, it tends to retrace a portion of that move before resuming. The Fibonacci ratios predict where these retracements may pause:

- **23.6%** — shallow retracement (strong trend)
- **38.2%** — moderate retracement
- **50.0%** — not strictly Fibonacci but widely watched (Dow theory)
- **61.8%** — the "golden ratio" — most important Fibonacci level
- **78.6%** — deep retracement (trend still intact but weakening)

## How to draw Fibonacci retracements

1. Identify a significant swing: a clear low to a clear high (for uptrend) or high to low (for downtrend)
2. Draw from the swing low to the swing high
3. The tool automatically plots the retracement levels

On Zerodha Kite / TradingView: Drawing tools → Fibonacci Retracement.

## Trading with Fibonacci

**In an uptrend:**
Price rallies from ₹100 to ₹150. Then pulls back.
- 23.6% level: ₹138 (shallow pull back, strong trend)
- 38.2% level: ₹130 (normal healthy retracement)
- 61.8% level: ₹119 (deep retracement, but uptrend still intact)

Traders often look to buy at these levels expecting the trend to resume.

**Confluence is everything:**
A Fibonacci level becomes highly significant when it coincides with:
- A previous support/resistance level
- A moving average (50 or 200 SMA)
- A round number
- A high-volume price node

Two or more factors at the same level = strong expected support/resistance.

## Extension levels (for profit targets)

Fibonacci extensions project where price may go BEYOND the original move.

**Common extension levels:**
- 127.2%, 161.8%, 200%, 261.8%

If a stock rallied from ₹100 to ₹150 (the base move) and then pulled back to ₹130, the 161.8% extension target = ₹130 + (50 × 1.618) = ₹211.

Extensions are used by swing traders to set profit targets.

## Does Fibonacci actually work?

Fibonacci levels work because enough traders watch them — they become self-fulfilling.

The 61.8% retracement is the most reliable because it is the most widely watched.

However:
- Price does not always respect Fibonacci levels
- In strong trends, it may not retrace at all
- In weak trends, it may break all levels

Use Fibonacci as one tool among many, not as the sole basis for a trade.

*Source: John Murphy, "Technical Analysis of the Financial Markets"; TradingView Fibonacci tutorial*',
8,301,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='fibonacci-retracement-guide');

-- ═══════════════════════════════════════════════════════════
-- PERSONAL FINANCE — CRITICAL GAPS
-- ═══════════════════════════════════════════════════════════

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT pf_id,'Gold as an investment — physical, ETF, SGB and digital gold compared','gold-investment-complete',
'# Gold Investment in India — Every Option Compared

## Why Indians buy gold

India is the world''s second-largest gold consumer. Indians hold an estimated 25,000 tonnes of gold — more than the combined reserves of the IMF, US, Germany and Switzerland.

Gold is cultural (weddings, festivals), emotional (family heirloom), and financial (inflation hedge, crisis insurance) for Indian families.

This lesson focuses on gold as an investment decision.

## The 4 ways to invest in gold

### 1. Physical Gold (Jewellery, coins, bars)

**Jewellery:**
- Making charges: 15-30% on top of gold price. Wasted immediately.
- Purity uncertainty: Unless hallmarked (BIS Hallmark 916 = 22 karat), you may not get what you pay for.
- Storage risk: Theft, loss.
- Selling difficulty: Jewellers deduct 5-15% when buying back.

**Verdict for investors:** Jewellery is terrible as investment. Buy it for wearing, not returns.

**Gold coins/bars:**
- Better than jewellery (no making charges, pure 24K)
- Still has storage risk and spread when buying/selling
- Banks sell gold coins but do not buy them back — you need a jeweller

**Verdict:** Better than jewellery but still suboptimal for investment.

### 2. Gold ETF

An Exchange Traded Fund that holds physical gold. Each unit = approximately 1 gram of 24K gold. Traded on NSE/BSE like shares.

**Advantages:**
- No storage, no theft risk
- Pure gold exposure (backed by physical gold held by custodian)
- Easy to buy/sell any trading day
- Minimum investment = 1 unit (≈ 1 gram ≈ ₹6,000-7,000)
- Can hold in Demat account

**Disadvantages:**
- Expense ratio: 0.5-1% per year (fund management cost)
- No interest/dividend
- Need Demat account

**Tax:** Held ≥ 24 months → LTCG at 20% with indexation. Under 24 months → slab rate.

**Top Gold ETFs in India:** Nippon India Gold BeES, HDFC Gold ETF, SBI Gold ETF.

### 3. Sovereign Gold Bond (SGB) ← Best for most investors

Issued by Reserve Bank of India (backed by Government of India). Linked to gold price.

**Features:**
- Tenure: 8 years (5-year early exit at gilt window)
- Interest: 2.5% per annum on issue price (paid semi-annually) — guaranteed by GOI
- No storage risk
- No making charges or GST
- At maturity: redeemed at prevailing gold market price

**Tax advantages (significant):**
- If held to maturity (8 years): Capital gains are **completely tax-free**
- Interest income: Taxable at slab rate
- Early exit after 5 years: LTCG at 20% with indexation

**Why SGB > Gold ETF for long-term:**
- 2.5% annual interest (Gold ETF gives 0%)
- Tax-free capital gains at maturity
- RBI-backed, zero counterparty risk

**Limitation:** Not always available. RBI issues in tranches. Check RBI.org.in for upcoming tranches. Can also buy from secondary market (NSE) if available.

### 4. Digital Gold

Sold by apps like Google Pay, PhonePe, Paytm, Jar. Minimum ₹1 investment. Backed by physical gold stored by MMTC-PAMP or Augmont.

**Convenient but caution:**
- Not regulated by SEBI, RBI or any regulator
- Storage charges after some period
- No interest
- Tax treatment unclear (treated as physical gold)
- Counter-party risk (if app/operator fails)

**Verdict:** For very small, casual amounts only. Not for serious investment.

## The verdict — what to buy

| Situation | Recommendation |
|-----------|---------------|
| Long-term (8 years) | SGB |
| Medium-term (2-5 years) | Gold ETF |
| Immediate need / cultural use | Physical (hallmarked coins) |
| Small casual amounts | Gold ETF (not digital gold) |

**Allocation:** Most financial planners recommend 5-10% of portfolio in gold for diversification. Gold typically does well when equities struggle.

*Source: RBI SGB scheme details (rbi.org.in); SEBI AMFI data on Gold ETFs; BIS Hallmarking guidelines*',
9,400,TRUE,TRUE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='gold-investment-complete');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT pf_id,'ITR filing in India — step by step for salaried employees','itr-filing-guide',
'# Filing Your Income Tax Return (ITR) in India

## Who must file ITR?

**Mandatory for:**
- Income above basic exemption limit (₹3 lakh under new regime, ₹2.5 lakh under old)
- Anyone with foreign assets, foreign income or foreign travel expense > ₹2 lakh
- Deposited > ₹1 crore in current account or > ₹50 lakh in savings account in a year
- Electricity bill > ₹1 lakh in a year

**Even if income is below limit, file if you want to:**
- Claim TDS refund (most salaried people have TDS deducted — filing gets it back)
- Apply for visa (embassies ask for ITRs)
- Get a bank loan (ITRs are income proof)
- Carry forward capital losses to offset future gains

## Which ITR form to use?

**ITR-1 (Sahaj):** Salaried employees with income only from salary, one house property, and interest. Income < ₹50 lakh.

**ITR-2:** Same as above but income > ₹50 lakh, or capital gains from stocks/mutual funds, or foreign assets.

**ITR-3:** Business/profession income in addition to other sources.

**ITR-4 (Sugam):** For those opting for presumptive taxation scheme (small businesses, freelancers).

**Most salaried employees use ITR-1 or ITR-2.**

## Step-by-step: Filing ITR-1 online

### Step 1: Gather documents
- Form 16 (from employer — salary certificate with TDS details)
- Form 26AS (from income tax portal — all TDS deducted against your PAN)
- AIS/TIS (Annual Information Statement — income tax portal now pre-fills from multiple sources)
- Bank interest certificates (for all savings accounts and FDs)
- Investment proofs (if claiming 80C, 80D, HRA deductions)

### Step 2: Log in to Income Tax Portal
Go to incometax.gov.in → Login with PAN and password.

### Step 3: Select "File Income Tax Return"
Assessment Year: For FY 2024-25 income, select AY 2025-26.
Filing Status: Individual.
ITR Form: ITR-1 (or appropriate form).
Filing Type: Original return (if filing for first time this year).

### Step 4: Verify pre-filled data
The portal pre-fills many fields from Form 26AS and AIS. Verify:
- Salary details match Form 16
- TDS deducted matches Form 26AS
- Other income (interest, dividends) is captured

Correct any discrepancies — the portal may miss income or have errors.

### Step 5: Enter deductions
Under the old regime, claim eligible deductions:
- Section 80C: Up to ₹1.5 lakh (EPF, PPF, ELSS, LIC premium, home loan principal, children tuition)
- Section 80D: Health insurance premium (₹25,000 self/family, ₹50,000 parents 60+)
- Section 80TTA/TTB: Savings interest (₹10,000 for <60, ₹50,000 for 60+)
- HRA exemption (if claimed at employer level, just verify)
- Home loan interest under Section 24(b) (up to ₹2 lakh for self-occupied)

Under the new regime: Most deductions are not available (except NPS 80CCD(2), standard deduction ₹75,000 for FY 2024-25).

### Step 6: Compute and pay tax (if any)
Portal calculates tax payable automatically.
If tax is due: Pay via Challan 280 (online) and enter BSR code and challan number in ITR.
If you get a refund: Verify bank account details (IFSC + account number).

### Step 7: Submit and verify
After submission, verify immediately using:
- Aadhaar OTP (fastest, instant)
- Net banking
- Demat EVC

**Do NOT wait for paper ITR-V** (only if no other verification method is available).

## Key deadlines (FY 2024-25)
- 31 July 2025: Original ITR for individuals (no audit required)
- 31 October 2025: If accounts need audit
- 31 December 2025: Belated return (penalty + interest)
- 31 March 2026: Updated return (with penalty)

**Late filing penalty:**
Below ₹5 lakh income: ₹1,000.
Above ₹5 lakh income: ₹5,000.

*Source: Income Tax Act 1961; incometax.gov.in official portal documentation; CBDT circulars*',
11,401,TRUE,TRUE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='itr-filing-guide');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT pf_id,'REIT investing in India — earn rental income without owning property','reit-investing-india',
'# REIT Investing in India

## What is a REIT?

A Real Estate Investment Trust (REIT) lets you invest in large commercial real estate — office buildings, malls, warehouses — without buying property yourself.

REITs pool money from many investors to buy and manage income-generating real estate. They are required to distribute at least 90% of net distributable cash flows to investors as dividends.

India''s SEBI introduced REIT regulations in 2014. First listing: Embassy Office Parks REIT (2019).

## India''s listed REITs (as of 2024)

**Embassy Office Parks REIT:**
- Assets: 45 million sq ft of office space across Bengaluru, Mumbai, NCR, Pune
- Tenants: Google, JP Morgan, IBM, WeWork
- Yield: ~6-7% annually
- Listed on NSE/BSE

**Mindspace Business Parks REIT:**
- Assets: Office parks in Hyderabad, Mumbai, Chennai, Pune
- Tenants: Accenture, Microsoft, Qualcomm, Schlumberger
- Yield: ~6-7%

**Brookfield India Real Estate Trust:**
- Assets: Office parks in Mumbai, NCR, Bengaluru, Kolkata
- Tenants: Cognizant, Barclays, RBS, Bosch
- Yield: ~7-8%

**Nexus Select Trust (first retail REIT):**
- Assets: 17 grade-A retail malls across India
- Tenants: Zara, H&M, Marks & Spencer, PVR, Big Bazaar

## How REITs generate returns

**1. Distributions (like dividends):**
Paid quarterly. Derived from rental income of properties.
Taxability: Complex (partly interest income, partly dividend, partly capital gains return).

**2. Capital appreciation:**
If the value of underlying properties rises, REIT unit price rises.

**Total return = Yield (6-8%) + Capital appreciation**

## REIT structure in India

REIT units are traded on NSE/BSE like shares. Minimum investment = 1 unit (price varies: ₹300-500 typically).

**Manager:** Manages the REIT and its properties.
**Trustee:** SEBI-registered trustee oversees the REIT for unitholders.
**Sponsor:** Original promoter who set up the REIT (e.g., Embassy Group for Embassy REIT).

SEBI requires:
- At least 80% of REIT assets in income-generating properties
- At least 90% of net distributable cash flow distributed to investors
- Listed on stock exchange

## Tax treatment of REIT income

REIT distributions have 3 components with different tax treatment:

| Component | Tax treatment |
|-----------|-------------|
| Interest income | Slab rate |
| Dividend | Exempt if DDT paid by REIT |
| Capital returns (SPV repayment) | Exempt up to cost base |
| Capital gains on unit sale | LTCG 20% / STCG 15% |

Overall effective yield after tax: ~5-6% for most investors in 30% bracket.

## REIT vs buying property

| | REIT | Direct property |
|-|------|----------------|
| Minimum investment | ₹300-500 | ₹50 lakh+ |
| Liquidity | Sell on NSE any day | Months to sell |
| Rental income | 6-8% yield | 2-3% yield in Indian cities |
| Diversification | Hundreds of tenants | 1 property, 1 tenant |
| Management | Professional | Self-managed |
| Black money | No | Rampant |
| Loan against | Margin funding | Loan against property |

**The yield advantage of REITs is significant.** Indian residential real estate rental yields are typically 2-3% — far below REIT yields of 6-8%.

## Who should invest in REITs?

Good for:
- Income seekers who want regular distributions (quarterly payouts)
- Diversified exposure to commercial real estate
- Investors who cannot afford direct property

Not ideal for:
- Those seeking capital appreciation only (equity is better)
- Very short time horizons

*Source: SEBI REIT Regulations 2014; Embassy REIT annual report; Mindspace REIT filings with NSE*',
9,402,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='reit-investing-india');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT pf_id,'Salary structuring in India — how to legally reduce your tax','salary-structure-tax-india',
'# Salary Structuring — Legally Reduce Your Tax

## The difference between CTC and take-home

Many employees focus on CTC (Cost to Company) without understanding that the structure of that CTC determines how much tax they pay.

Two employees with identical ₹15 lakh CTC can have very different take-home pay depending on how the salary is structured.

## Key salary components and their tax treatment

### Basic Salary
Fully taxable. Also forms the base for:
- HRA calculation (usually 40-50% of basic)
- EPF contribution (12% of basic, up to ₹15,000/month)
- Gratuity calculation (15 days × basic/26 per year of service)

**Higher basic = higher EPF, higher gratuity entitlement, but also higher tax.**

### HRA (House Rent Allowance)
Partially tax-exempt for those paying rent.

**HRA exemption = MINIMUM of:**
1. Actual HRA received
2. Actual rent paid − 10% of basic salary
3. 50% of basic salary (metro cities: Delhi, Mumbai, Kolkata, Chennai) OR 40% (others)

**Example:** Basic = ₹6 lakh/year. HRA = ₹3 lakh/year. Rent paid = ₹2.4 lakh/year.
- Option 1: ₹3,00,000
- Option 2: ₹2,40,000 − ₹60,000 = ₹1,80,000
- Option 3: ₹3,00,000 (50% of basic, metro)
**HRA exempt = ₹1,80,000 (minimum of all three)**

**Note:** HRA exemption is ONLY available under the old tax regime, not the new regime.

### LTA (Leave Travel Allowance)
Travel expenses for you and family within India, twice in 4 years, are exempt.

**Conditions:**
- Only travel costs (not hotel, food)
- Travel by economy air, AC train, or AC bus
- Block period (2022-2025 = current block)

### Children''s Education Allowance
₹100/month per child for up to 2 children = ₹2,400/year. Minor but tax-free.

### Food/Meal Allowance
Up to ₹2,200/month (meal vouchers: Sodexo, Zeta) can be tax-free.

### Mobile and Internet Reimbursement
Actual bills for work purpose: fully tax-exempt with bills.

### Car/Vehicle Allowance
If provided with fuel reimbursement for business use: partially exempt.

## NPS Employer Contribution — The biggest underused benefit

Under Section 80CCD(2):
Employer contribution to NPS (National Pension System) up to 10% of basic salary is fully tax-exempt — **this is in addition to the ₹1.5 lakh 80C limit**.

**Example:**
Basic = ₹8 lakh/year.
Employer NPS contribution = 10% = ₹80,000.
This ₹80,000 is completely exempt from tax, not even counted in 80C limit.

In 30% bracket: tax saving = ₹24,000 per year on this alone.

**Ask your HR to restructure salary to include this. Most employees don''t know about it.**

## Standard Deduction (New Regime)
From FY 2024-25: ₹75,000 standard deduction for salaried employees under the new tax regime. No need to submit bills.

## Quick comparison: Old vs New Regime for ₹15 LPA

| Income Component | Old Regime (with optimisation) | New Regime |
|-----------------|-------------------------------|-----------|
| Basic salary | ₹6L | ₹6L |
| HRA exemption | −₹1.5L | Not available |
| 80C investments | −₹1.5L | Not available |
| 80D premium | −₹25K | Not available |
| NPS 80CCD(2) | −₹60K | −₹60K (still available) |
| Standard deduction | −₹50K | −₹75K |
| Net taxable | ₹10.65L | ₹13.65L |
| Tax | ≈₹1.4L | ≈₹1.8L |

Old regime saves ₹40,000 for this person — **only if they actually invest in 80C and pay rent**.

*Source: Income Tax Act 1961 Sections 10, 80C, 80CCD; CBDT guidelines on salary components*',
10,403,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='salary-structure-tax-india');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT pf_id,'UPI, digital payments and how to protect yourself from fraud','upi-digital-payments-fraud',
'# UPI and Digital Payments — The Complete Safety Guide

## How UPI works

Unified Payments Interface (UPI) is India''s real-time payment system built by NPCI (National Payments Corporation of India). Launched in 2016. In 2024, India processes 13+ billion UPI transactions per month — the largest real-time payment volume in the world.

**How a UPI transfer works:**
1. You open your UPI app (Google Pay, PhonePe, Paytm, BHIM, etc.)
2. Enter payee''s UPI ID or scan QR code
3. Enter amount and UPI PIN
4. NPCI routes the instruction to both banks
5. Money moves immediately, 24x7, 365 days

**UPI ID:** Your unique payment address (like abc@okicici or mobilenumber@ybl)
**UPI PIN:** 4 or 6-digit secret PIN you set when registering. **Never share this.**

## Understanding UPI payment types

**Pay:** You initiate sending money. You enter PIN. ✅ Safe (you are in control)

**Collect request:** Someone sends you a request to pay. You must enter PIN to confirm. ⚠️ Verify before approving — fraud happens here.

**UPI AutoPay:** Recurring mandates (Netflix, electricity bills). Review periodically.

## The fraud ecosystem — how scammers operate

### Fraud Type 1: Fake Collect Requests
Scammer sends a COLLECT request (you send them money) disguised as "receiving money."

**Real scenario:** You''re selling something on OLX. Buyer says "I''m sending you ₹5,000." You receive a collect request on PhonePe. You enter PIN to "receive" money. You actually SEND ₹5,000.

**Rule:** You NEVER need to enter your PIN to RECEIVE money. If someone says enter PIN to receive, it is 100% fraud.

### Fraud Type 2: Screen Sharing
Scammer calls claiming to be your bank. Asks you to install AnyDesk or TeamViewer for "verification." With screen access, they see your banking apps, OTP, PIN.

**Rule:** No legitimate bank ever asks you to install screen-sharing apps.

### Fraud Type 3: SIM Swap
Fraudster obtains a duplicate SIM of your number from a telecom store using fake documents. Your SIM stops working. They now receive all your OTPs.

**Protect yourself:** Register for SIM swap alerts with your telecom provider. Set SIM card lock (PIN for SIM).

### Fraud Type 4: Vishing (Voice Phishing)
Calls claiming bank helpline, KYC expiry, lottery, government refunds. Pressure to share OTP, card number, CVV.

**Rule:** Your bank will never call and ask for OTP, CVV, card number, or UPI PIN. Never. If they ask, disconnect.

### Fraud Type 5: Fake QR Codes
Fake QR at shops, parking lots, restaurants — replaced over the merchant''s real QR. You pay the fraudster.

**Rule:** Verify merchant name displayed after scanning before paying. If it shows an unknown name, do not pay.

## What to do if you are defrauded

**Immediate steps (speed matters):**
1. Call your bank''s 24x7 helpline immediately to block account
2. File complaint at cybercrime.gov.in (National Cyber Crime Reporting Portal)
3. Call 1930 (Cyber Crime Helpline) immediately — funds can be frozen in transit
4. File FIR at police station (get acknowledgement)
5. Inform NPCI: complaint at npci.org.in

**RBI rules:** Banks must resolve fraud complaints within 7-10 business days. You may be eligible for full refund if reported within 3 days (limited liability norms — RBI Circular 2017).

## Quick safety checklist
- ✅ Never share UPI PIN, OTP, CVV, card number with anyone — ever
- ✅ Verify payee name before every UPI transfer
- ✅ Remember: you never need PIN to RECEIVE money
- ✅ Keep UPI apps and banking apps updated
- ✅ Enable transaction alerts on your phone (SMS + app notifications)
- ✅ Set daily transaction limits on your UPI app
- ✅ Register at safedriving.npci.org.in for alerts

*Source: NPCI (npci.org.in); RBI Circular on Limited Liability of Customers (2017); Cybercrime.gov.in*',
9,404,TRUE,TRUE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='upi-digital-payments-fraud');

-- ═══════════════════════════════════════════════════════════
-- CORPORATE FINANCE — MISSING CRITICAL TOPICS
-- ═══════════════════════════════════════════════════════════

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT cf_id,'Porter''s Five Forces — analysing any industry competitiveness','porters-five-forces',
'# Porter''s Five Forces — Industry Analysis Framework

## What is Porter''s Five Forces?

Developed by Harvard Business School professor Michael Porter in 1979. A framework to analyse the competitive intensity and profitability potential of any industry.

**The core insight:** Long-term profitability of an industry depends on 5 structural forces.

Understanding these forces tells you whether an industry is fundamentally attractive or fundamentally difficult — before you analyse any individual company.

## Force 1: Threat of New Entrants

How easy is it for new competitors to enter this industry?

**Low threat (good for incumbents) when:**
- High capital requirements (airlines, steel, telecom)
- Strong brand loyalty (consumers don''t switch easily)
- Network effects (WhatsApp — you need to be where your contacts are)
- Regulatory barriers (banking licenses, pharma approvals, spectrum)
- Economies of scale already achieved by incumbents

**High threat (bad for incumbents) when:**
- Low startup costs
- No differentiation required
- Easy access to distribution
- No switching costs for customers

**Indian example:** Indian banking has high entry barriers (RBI license, capital requirements) = low threat of new entrants. Advantage for existing banks.

## Force 2: Bargaining Power of Suppliers

How much leverage do suppliers have over companies in this industry?

**High supplier power (bad) when:**
- Few suppliers, many buyers
- No substitute for the supply
- Supplier can integrate forward (do what you do)
- Suppliers'' products are a large cost component

**Indian example:** Maruti Suzuki''s suppliers (auto parts) have LOW power — Maruti is so large it dictates terms. Contrast with small textile companies buying cotton — they have little power over large commodity suppliers.

## Force 3: Bargaining Power of Buyers

How much leverage do customers have?

**High buyer power (bad) when:**
- Buyers purchase large volumes
- Products are undifferentiated (easy to switch brands)
- Buyers can integrate backward (make what you sell)
- Many competing products available
- Low switching costs

**Indian example:** Indian grocery retail — consumers have very HIGH power. Multiple stores, brands, platforms (BigBasket, Blinkit, local kirana) compete for the same purchase. Very hard to have pricing power. 

Contrast: CRISIL/ICRA (credit rating agencies) — companies must get rated; there are only 7 licensed agencies. Buyers have low power.

## Force 4: Threat of Substitutes

Can customers meet the same need in a different way?

Substitutes are different products/services that serve the same purpose.

**High substitute threat when:**
- Substitute offers similar value at lower cost
- Low switching cost
- Substitute''s quality is improving

**Indian examples:**
- OTT platforms (Netflix, Hotstar) substituted multiplex cinema for casual viewing
- UPI substituted credit cards for small payments
- Electric scooters substituting petrol 2-wheelers (emerging)

## Force 5: Industry Rivalry

Intensity of competition among existing players.

**High rivalry (bad) when:**
- Many equally-balanced competitors
- Slow industry growth (everyone fights for market share)
- High fixed costs (need to maintain volume)
- Low differentiation (price wars)
- High exit barriers (can''t shut down cheaply)

**Indian examples:**
- Telecom post-Jio: Extreme rivalry. Reliance Jio forced Vodafone-Idea, Airtel into massive losses.
- Aviation: Very high rivalry, low margins, frequent bankruptcies (Kingfisher, Jet Airways, Go First).
- FMCG: Moderate rivalry — established brands compete but each has niches.

## Applying Five Forces to Indian stock analysis

**Industries to favour (favourable forces):**
- Monopoly/duopoly businesses (credit bureaus, exchanges, specialized infrastructure)
- High switching cost businesses (banking software, ERP, industrial gases)
- Network effects businesses (payment networks, marketplaces at scale)

**Industries to be cautious (unfavourable forces):**
- Airlines (all 5 forces are unfavourable — textbook case)
- Commodity chemicals (price-taking, no differentiation, many substitutes)
- Entry-level retail (anyone can open a shop)

*Before buying any stock, spend 15 minutes mapping the Five Forces for its industry. This alone will save you from many bad investments.*

*Source: Michael Porter, "Competitive Strategy" (1980); Porter, "What is Strategy?" Harvard Business Review (1996)*',
10,500,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='porters-five-forces');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT cf_id,'ESG investing and BRSR — what every Indian investor needs to know','esg-brsr-india',
'# ESG Investing and BRSR in India

## What is ESG?

ESG = Environmental, Social, Governance.

ESG investing considers non-financial factors in addition to traditional financial analysis when making investment decisions.

**Environmental:** Carbon emissions, water usage, waste management, climate risk
**Social:** Employee treatment, supply chain labour practices, community impact, data privacy
**Governance:** Board independence, promoter accountability, executive compensation, audit quality

## Why ESG matters for Indian investors

**Risk management:** Companies with poor ESG practices carry hidden risks.
- Environmental: Carbon taxes, pollution fines, resource scarcity
- Social: Labour strikes, brand damage from poor practices
- Governance: Promoter fraud, related-party transactions, accounting fraud

Poor governance in Indian context has destroyed enormous shareholder value: IL&FS, Satyam, Amtek Auto, Sintex, DHFL — all had governance red flags before collapse.

**Return potential:** Studies show high-ESG companies show better long-term financial performance in many markets.

## BRSR — India''s ESG framework

**Business Responsibility and Sustainability Report (BRSR):**
SEBI mandated BRSR for the top 1,000 listed companies (by market cap) from FY 2022-23.

BRSR requires companies to disclose:
- Energy consumption and GHG emissions
- Water withdrawal and consumption
- Waste generated and managed
- Employee well-being indicators
- CSR activities and spending
- Governance structure and practices
- Supply chain sustainability

**Where to find BRSR:** Company annual report, NSE/BSE filing section.

## ESG funds in India

Several SEBI-registered ESG mutual funds:

- SBI Magnum ESG Fund
- Mirae Asset ESG Sector Leaders ETF
- ICICI Prudential ESG Fund
- Axis ESG Equity Fund
- Kotak ESG Opportunities Fund
- Quantum India ESG Equity Fund

**Performance note:** ESG funds in India are young (2019+). Insufficient track record to make strong claims. In the US, ESG funds roughly matched broad market returns over 10 years.

## How to evaluate governance (the G in ESG)

For Indian stocks, governance is the most important ESG component.

**Quick governance checklist:**

| Factor | Green | Red |
|--------|-------|-----|
| Promoter stake | > 50% (skin in game) | Falling rapidly |
| Promoter pledge | 0% | > 20% |
| Related party transactions | Small, disclosed | Large, complex |
| Auditor | Big 4 or reputed | Small/frequent change |
| Board independence | Genuinely independent | All promoter-appointed |
| Executive pay | Reasonable, tied to performance | Excessive, unrelated to results |

**One heuristic:** If a company''s promoters are buying shares in the open market from their own money, it is one of the strongest signals that they believe in the business. Check BSE insider trading filings.

## The limitations of ESG in India

- BRSR is self-reported — no independent verification yet
- Rating agencies (MSCI ESG, Sustainalytics) have limited India coverage
- Definitions vary widely — a company can be "ESG" by one rater and not by another
- Risk of "greenwashing" — marketing sustainability without substance

Treat ESG as one additional lens, not a replacement for fundamental analysis.

*Source: SEBI BRSR Framework Circular (2021); SEBI Annual Report on Sustainability; MSCI ESG Research India coverage*',
9,501,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='esg-brsr-india');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT cf_id,'ESOPs — how employee stock options work and how to value them','esop-guide-india',
'# ESOPs — Employee Stock Options Explained

## What is an ESOP?

ESOP = Employee Stock Ownership Plan. It gives employees the right to buy company shares at a pre-determined price (grant price or exercise price) after a vesting period.

ESOPs are how startups and public companies attract and retain talent without paying higher cash salaries.

If the company grows and its share price rises, ESOPs become very valuable.

## The ESOP lifecycle

### Step 1: Grant
Company offers you X options at a grant price (usually current market price or fair market value at time of grant).

Example: Startup grants you 10,000 options at ₹10/share.

### Step 2: Vesting
You don''t own the options immediately. They vest (become yours) over time.

Most common vesting schedule in India:
- **4-year vest with 1-year cliff**
- After 1 year: 25% of options vest (the "cliff")
- Months 13-48: Remaining 75% vest monthly or quarterly

Example: 10,000 options, 4-year vest, 1-year cliff.
- Month 0-11: 0 options vested
- Month 12: 2,500 options vest immediately
- Month 13-48: ~208 options vest per month
- Month 48: Fully vested (10,000 options)

If you leave before the cliff: you lose all options.
If you leave after the cliff but before full vesting: you keep vested options.

### Step 3: Exercise
Once vested, you can exercise — pay the exercise price to buy shares.

10,000 options at ₹10 exercise price = you pay ₹1,00,000 to receive 10,000 shares.

### Step 4: Exit
You can realise value at:
- Company IPO: Sell shares in open market
- Acquisition: Acquirer buys your shares
- Secondary sale: Sell to investor on secondary market (for pre-IPO companies)
- Buyback: Company buys back ESOP shares

## Tax on ESOPs in India — two taxable events

**Event 1: At Exercise (Perquisite tax)**
When you exercise options, the difference between fair market value (FMV) at exercise date and exercise price is treated as perquisite income — taxed at your slab rate (up to 30%).

FMV at exercise: ₹100. Exercise price: ₹10. Difference: ₹90/share.
10,000 shares × ₹90 = ₹9,00,000 taxable as salary. Tax at 30% = ₹2,70,000.

**Event 2: At Sale (Capital gains)**
When you sell shares later, any appreciation from FMV at exercise date is taxed as capital gains.

Sale price: ₹200. FMV at exercise: ₹100. Gain: ₹100/share.
10,000 shares × ₹100 = ₹10,00,000 capital gain.
Held > 24 months: LTCG at 20%. Held < 24 months: STCG at 15%.

**ESOP Deferral for startup employees:**
Finance Act 2020 allowed employees of eligible startups (DPIIT-registered) to defer the perquisite tax for 5 years or until they sell or leave the company — whichever is earliest. This was a major relief for startup employees who don''t have cash to pay tax without selling.

## How to evaluate an ESOP offer

Ask these questions before accepting:

1. **What is the current valuation?** What was the last funding round price?
2. **What is the exercise price?** Is it at last round price, below, or above?
3. **What is the liquidation preference?** Do investors get paid before employees?
4. **Is there a secondary market?** Can you sell if company doesn''t IPO?
5. **What is the vesting cliff?** What happens to unvested options if company is acquired?
6. **Post-termination exercise window?** How long do you have to exercise after leaving? (30-90 days is common, but short windows force you to pay tax or lose options)

*Source: Companies Act 2013 — ESOP provisions; SEBI SBEB regulations; Finance Act 2020 startup ESOP deferral provisions; DPIIT guidelines*',
10,502,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='esop-guide-india');

-- ═══════════════════════════════════════════════════════════
-- CRYPTO — ADVANCED MISSING TOPICS
-- ═══════════════════════════════════════════════════════════

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT cr_id,'Ethereum and Proof of Stake — how Ethereum 2.0 changed everything','ethereum-proof-of-stake',
'# Ethereum and Proof of Stake

## Ethereum''s original problem

Bitcoin uses Proof of Work (PoW) — computers compete to solve mathematical puzzles, using enormous amounts of electricity.

Ethereum originally also used PoW. By 2021, Ethereum''s energy consumption equalled Finland''s entire country.

## The Merge — September 2022

On September 15, 2022, Ethereum completed "The Merge" — switching from Proof of Work to Proof of Stake.

Energy consumption dropped by 99.95% overnight.

## How Proof of Stake works

Instead of competing with computational power, validators are chosen to create new blocks based on the amount of ETH they stake (lock up as collateral).

**To become a validator:** Stake 32 ETH (≈ $100,000+ at current prices).

**Validator selection:** Randomly chosen, with probability proportional to stake amount.

**If validators misbehave** (try to cheat): Their staked ETH is "slashed" (partially destroyed). This creates a strong financial disincentive to attack the network.

**Validators earn:** ETH rewards for each block they validate (currently ~4-5% APY on staked ETH).

## Liquid Staking — participating with less than 32 ETH

Most people cannot stake 32 ETH individually. Liquid staking protocols pool ETH from many users.

**Lido Finance:** The largest liquid staking protocol. You deposit any amount of ETH → receive stETH (staked ETH tokens). stETH earns staking rewards and can be used in DeFi.

**Rocket Pool, Coinbase (cbETH), Frax:** Other liquid staking options.

**Staking yield (2024):** ~3.5-4.5% APY (varies with network activity).

## The ETH supply dynamics after the Merge

**Pre-Merge:** New ETH was issued to miners as block reward (inflationary).

**Post-Merge:** 
- Block rewards are much lower (paid to validators, not miners)
- EIP-1559 (August 2021): A portion of every transaction fee is "burned" (destroyed)
- When network activity is high enough, ETH burned > ETH issued = deflation

During periods of high network usage, ETH supply actually decreases — the opposite of Bitcoin''s fixed inflation schedule.

## Ethereum''s role in the crypto ecosystem

Ethereum is the foundation most DeFi, NFTs, stablecoins and smart contracts are built on.

Key metrics to track:
- **Total Value Locked (TVL) in DeFi:** How much value sits in Ethereum smart contracts
- **Gas fees:** Cost of transactions on Ethereum (denominated in Gwei = 0.000000001 ETH)
- **Active addresses:** Network usage

**The central question for ETH investors:** Will demand for Ethereum block space (and therefore ETH for gas fees) grow enough to justify the price? It depends on whether DeFi, NFTs, stablecoins, and Layer 2 growth continues.

## Layer 2 scaling solutions

A key development for Ethereum: Layer 2 (L2) networks that process transactions off the main chain and batch-settle on Ethereum.

**Major L2s:** Polygon, Arbitrum, Optimism, Base (by Coinbase), zkSync, Starknet.

L2s have made Ethereum usable for small transactions (gas fees drop from $5-50 on Ethereum mainnet to $0.01-0.10 on L2s). This is enabling mainstream adoption of Ethereum-based apps.

*Source: Ethereum.org; Lido Finance documentation; Ultrasound.money (ETH supply tracker); L2Beat.com (L2 TVL tracker)*',
9,600,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='ethereum-proof-of-stake');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT cr_id,'India e-Rupee — CBDC explained and what it means for you','india-erupee-cbdc',
'# India''s e-Rupee — Central Bank Digital Currency

## What is a CBDC?

Central Bank Digital Currency (CBDC) = digital form of a country''s official currency, issued directly by the central bank.

It is NOT a cryptocurrency. There is no blockchain (or there may be a private permissioned ledger). It is NOT decentralised. It is NOT anonymous.

**e-Rupee = digital ₹, issued by RBI, as legal tender.**

## India''s e-Rupee: What has launched

**Wholesale e-Rupee (₹-W):** 
Launched October 2022. For inter-bank settlement. Banks use it for government securities transactions with RBI.

**Retail e-Rupee (₹-R):**
Pilot launched December 2022. For public use. Currently running in select cities with participating banks.

**Participating banks (pilot):** SBI, ICICI, HDFC, Axis, YES Bank, IDFC First, Kotak, IndusInd.

## How retail e-Rupee works

1. Download your bank''s e-Rupee wallet app
2. Convert regular bank balance to e-Rupee (1:1 with ₹)
3. Make payments via QR code scan (works offline too — unlike UPI, which needs internet)
4. Receive e-Rupee from others

**Key difference from UPI:**
UPI transfers money between bank accounts (with internet, within banking hours of the receiving bank).
e-Rupee transfers digital currency directly (like handing physical cash) — works offline, no intermediary.

## Why RBI launched e-Rupee

**Reduce cost of cash:** Printing, distributing and managing physical cash is expensive. e-Rupee reduces this.

**Financial inclusion:** Works offline — can reach areas without reliable internet.

**Compete with crypto:** Provide a state-controlled alternative to cryptocurrencies and private stablecoins.

**Programme money:** Government can distribute welfare payments directly as e-Rupee (prevents leakage and misuse, because spending can be tracked and restricted to specific categories).

**Cross-border payments:** India is exploring e-Rupee for international trade settlement (reducing dollar dependence).

## What this means for you

**As a consumer:**
- One more payment option alongside UPI and cards
- Offline capability in no-network areas
- Exact same value as ₹ — no conversion needed

**What changes:**
- Privacy: Unlike UPI (which has some privacy), e-Rupee transactions are visible to RBI
- No interest: e-Rupee held in wallet does not earn interest (unlike a bank savings account)
- Programmability: Government can potentially restrict what e-Rupee can be spent on (controversial aspect)

## Global CBDC landscape

- China''s digital yuan (e-CNY): Most advanced CBDC, 260M users by 2023
- EU: Digital Euro in development
- US: Fed studying a digital dollar
- Nigeria''s eNaira: First CBDC in Africa (2021) — low adoption so far

## CBDC vs Crypto — the key difference

| | e-Rupee (CBDC) | Cryptocurrency (Bitcoin/Ethereum) |
|-|----------------|----------------------------------|
| Issued by | RBI (central bank) | Algorithm (decentralised) |
| Privacy | Low (RBI can see everything) | Pseudonymous |
| Stability | Stable (= ₹) | Volatile |
| Supply | RBI controlled | Fixed or algorithm-determined |
| Legal tender | Yes | No (in India) |
| Programmable | Yes (by government) | Yes (by smart contracts, permissionlessly) |

*Source: RBI Concept Note on CBDC (October 2022); RBI Annual Report 2023-24; Bank for International Settlements CBDC research*',
8,601,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='india-erupee-cbdc');

-- ═══════════════════════════════════════════════════════════
-- BEHAVIORAL FINANCE — MISSING BIASES
-- ═══════════════════════════════════════════════════════════

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT bf_id,'Anchoring, mental accounting and availability bias — how they cost you money','anchoring-mental-accounting',
'# Three Biases That Cost Indian Investors the Most

## Bias 1: Anchoring

**What it is:** Anchoring is the tendency to rely too heavily on the first piece of information you see (the "anchor") when making decisions.

**How it shows up in investing:**

**The "it was ₹500 and now it''s ₹200" anchor:**
A stock fell from ₹500 to ₹200. An investor thinks "it''s cheap, it was ₹500!" The ₹500 price has NO relevance to whether ₹200 is cheap. The only question is: what is the stock worth at current fundamentals?

Companies that fall from high prices are often falling for real reasons. Anchoring to the old high causes investors to buy falling knives.

**The analyst price target anchor:**
An analyst sets a ₹500 target. Stock goes to ₹400. Investor holds because "target is ₹500." But the analyst''s model may be wrong, outdated, or the analyst is employed by the stock''s investment bank.

**The purchase price anchor:**
"I paid ₹300, I won''t sell until it comes back to ₹300." Your purchase price has NO bearing on where the stock will go. The market does not know or care what you paid.

**How to fight anchoring:**
- Always ask: "If I didn''t own this stock, would I buy it today at today''s price?"
- If the answer is no, you should probably sell.
- Base decisions on current fundamentals, not historical prices.

## Bias 2: Mental Accounting

**What it is:** Treating money differently based on its source or intended purpose, rather than treating all money as fungible.

Money is money. ₹1,000 from salary is identical to ₹1,000 from a bonus or a lottery win.

**How it shows up:**

**The "house money" effect:**
"I made ₹50,000 in the market this month, I can afford to take more risk with it."
But it is the same ₹50,000 as any other money. Why would you treat winnings differently from earned money?

This leads investors to take reckless risks with "found" money.

**Separate "investing" and "savings" accounts:**
"My FD is for my daughter''s education, I can''t touch it."
But you also have ₹2 lakh in a savings account earning 3.5%.
Rational decision: Use the savings account money for education (it''s the same money) and invest the FD money in better instruments.

**Windfall spending:**
A bonus is mentally coded as "extra" and spent on a vacation, while a salary raise would have been saved. Both are additional income.

**Mental accounting in F&O:**
Traders who make ₹20,000 profit on Monday often take bigger risks Tuesday with "the market''s money." They lose back their gains and often more.

**How to fight it:**
- Consolidate all money views. Your net worth is one number.
- Apply the same investment criteria to every rupee, regardless of source.
- Before spending a windfall, ask: "Would I take this money out of my savings account to spend on this?" If no, don''t spend the windfall either.

## Bias 3: Availability Heuristic

**What it is:** Judging probability based on how easily examples come to mind — not on actual statistical data.

**How it shows up:**

**Recency bias in markets:**
A stock fell 40% recently. It was on the news. It comes to mind easily. Investor vastly overestimates probability of further crash.

Or: Markets went up 25% last year. Feels like markets always go up. Investor underestimates risk.

**The Harshad Mehta effect:**
Every few years, a market scam appears on news/OTT (Harshad Mehta, Nirav Modi). Investors become very afraid of fraud in legitimate companies — overestimating the probability of fraud because recent examples are vivid.

**The hot sector effect:**
When crypto/small caps/EVs dominate news headlines, investors overestimate their future returns and overweight them in portfolios.

**How to fight it:**
- Use base rates. "What has the historical return of this asset class been over 10-20 years?"
- Separate vividness from probability. Plane crashes are vivid but rare. Road accidents are common but not vivid.
- Before making a decision based on recent news, ask: "Am I reacting to the statistical reality, or to what I keep seeing on the news?"

*Source: Kahneman & Tversky, "Judgment under Uncertainty: Heuristics and Biases" (1974); Thaler, "Mental Accounting Matters" (1999); Jason Zweig, "Your Money and Your Brain" (2007)*',
9,700,TRUE,TRUE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='anchoring-mental-accounting');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT bf_id,'Herding, FOMO and media influence — how the crowd leads you astray','herding-fomo-media',
'# Herding, FOMO and Media Influence in Investing

## The herding instinct

Humans evolved to follow the crowd. In prehistoric times, if everyone ran, you should probably run too — a predator might be coming.

In financial markets, this instinct is destructive.

**Herding:** Following what other investors are doing simply because they are doing it, not because of your own analysis.

## How herding manifests in Indian markets

**The IPO mania herding:**
When Zomato, Nykaa or Paytm had 50x subscription, millions applied simply because millions were applying. The logic: "If this many people want it, it must be good."

Reality: Paytm listed at ₹2,150 and fell to ₹450 within 18 months.
Oversubscription is not a signal of future performance — it is a signal of demand for allocation, not for the stock.

**The penny stock herding:**
A penny stock (sub-₹50) trends on social media. 10,000 people buy it. Operators who own the stock sell into the buying pressure. Price crashes. Late entrants lose everything.

This is a textbook pump-and-dump — enabled by herding.

**The mutual fund herding:**
When NIFTY is at all-time highs and Sensex makes front-page news, SIP inflows reach record highs. When markets crash and negative news dominates, SIP cancellations spike.

Herding causes investors to buy at peaks and cancel SIPs in crashes — the exact opposite of what builds wealth.

## FOMO — Fear of Missing Out

FOMO is a specific form of herding driven by emotion: the dread of being left behind while others profit.

**The 2021 crypto FOMO:**
Bitcoin went from $20,000 to $60,000 in 2020-2021. Friends were making money. YouTube was full of crypto millionaires. Fear of missing out drove millions of Indian retail investors into crypto at or near the peak.

Bitcoin fell from $60,000 to $16,000 in 2022. The FOMO buyers, who bought at $40,000-60,000, lost 60-75%.

**The 2020-2021 small cap FOMO:**
Everyone on Twitter was showing multibagger returns. People with no prior investing experience opened Zerodha accounts and bought small-cap stocks at 30-40x PE.

When the correction came, these stocks fell 60-80% from peaks.

## Media and the news cycle

Financial media is structurally incentivised to create excitement.

**"Markets crash" gets more clicks than "Markets flat."**

This creates a systematic distortion:
- Crises are dramatised (amplifies fear)
- Bull runs are celebrated (amplifies greed)
- Long boring periods of compounding are invisible (because they are boring)

**The coverage effect:**
Sectors that dominate news coverage tend to attract retail money → drive prices up → justify more news coverage → attract more money. This creates bubbles.

India 2007: Real estate and infrastructure stocks. Covered extensively. Then crashed 70-80%.
India 2017: Small and mid-caps. Covered extensively. Then fell 35-60% in 2018-2019.
Global 2020-2021: Growth stocks/crypto. Then fell 50-90%.

## Building a system to avoid herding

**1. Define your investment thesis before reading the news.**
What criteria do you use to buy/sell? Write them down. Decisions that match the criteria = execute. Decisions that deviate from criteria because of news or crowd behaviour = do not execute.

**2. Track your reasons, not just your positions.**
Write down WHY you bought every investment. Review quarterly. Has the thesis changed? If yes, the decision to hold/sell should be based on the thesis, not the price.

**3. Be contrarian when required.**
"When others are greedy, be fearful. When others are fearful, be greedy." — Warren Buffett.
This is hard to follow emotionally. The system helps: if your criteria say a stock is cheap, buy it regardless of negative sentiment.

**4. Reduce financial media consumption.**
The average financial news consumer makes worse decisions than the average passive index fund investor. This is statistically documented.

*Source: Shiller, "Irrational Exuberance" (2000); DALBAR annual study of investor behaviour vs market returns; Kahneman, "Thinking, Fast and Slow" (2011)*',
9,701,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='herding-fomo-media');

-- ═══════════════════════════════════════════════════════════
-- FOREX — MISSING SESSIONS AND MECHANICS
-- ═══════════════════════════════════════════════════════════

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT fx_id,'Forex trading sessions — when to trade and which pairs to follow','forex-trading-sessions',
'# Forex Trading Sessions and Market Hours

## The 24-hour forex market

Unlike stock markets (which have fixed open/close times), forex markets operate 24 hours a day, 5 days a week (Sunday 5 PM New York time to Friday 5 PM New York time).

This is because currency trading spans global time zones. When one market closes, another opens.

## The four major forex sessions

### 1. Sydney Session (Pacific)
**Opens:** 5:00 AM IST (when adjusted for daylight saving, 3:30-4:00 AM)
**Closes:** 2:00 PM IST
**Characteristics:** Lowest liquidity, relatively calm. AUD and NZD most active.

### 2. Tokyo Session (Asian)
**Opens:** 4:30 AM IST
**Closes:** 1:30 PM IST
**Characteristics:** JPY, AUD, NZD pairs most active. More volume than Sydney but still quiet compared to London/NY.
**Key pairs:** USD/JPY, AUD/JPY, EUR/JPY

### 3. London Session (European) ← Most important for most pairs
**Opens:** 1:30 PM IST (2:30 PM IST when UK on BST)
**Closes:** 9:30 PM IST
**Characteristics:** Highest volume session. London is the world''s largest forex market (38% of daily volume). Major moves often start here.
**Key pairs:** EUR/USD, GBP/USD, USD/CHF, EUR/GBP

### 4. New York Session (American)
**Opens:** 6:30 PM IST (7:30 PM IST during US EST)
**Closes:** 3:30 AM IST
**Characteristics:** High volume. USD pairs very active. US economic data releases (NFP, CPI, Fed statements) create massive moves.
**Key pairs:** EUR/USD, USD/JPY, USD/CAD, GBP/USD

## The overlap periods — highest volatility and opportunity

### London + New York Overlap (Most Active)
**IST: 6:30 PM — 9:30 PM**
When both London and New York are simultaneously open, volume is highest. EUR/USD, GBP/USD, USD/CHF have tightest spreads and biggest moves.

For most forex traders, this is the optimal trading window.

### Tokyo + London Overlap
**IST: 1:30 PM — 2:30 PM (brief)**
Brief but can see increased EUR/JPY and GBP/JPY activity.

## What time is best for Indian forex traders?

**For active day trading:** 6:30 PM — 9:30 PM IST (London-New York overlap)

**For position traders (holding days-weeks):** Time of day matters less. Enter on your analysis, not the clock.

**Avoid:** Very early morning (3-6 AM IST) — Sydney session. Low liquidity, higher spreads, unpredictable moves.

## Major, Minor and Exotic Currency Pairs

### Major Pairs (Most traded, lowest spreads)
All include USD:
- EUR/USD (most traded pair in the world)
- USD/JPY
- GBP/USD ("Cable")
- USD/CHF
- AUD/USD ("Aussie")
- USD/CAD ("Loonie")
- NZD/USD ("Kiwi")

### Minor Pairs (No USD, sometimes called "crosses")
- EUR/GBP, EUR/JPY, GBP/JPY
- Higher spreads than majors but still liquid

### Exotic Pairs (One major currency + emerging market)
- USD/INR, EUR/INR (for Indian businesses)
- USD/SGD, USD/HKD, USD/ZAR
- Very high spreads, lower liquidity, more volatile

**For beginners:** Only trade major pairs. Smallest spread = lowest transaction cost.

## Indian forex trading regulations (important)

**Retail forex trading in India:**
Indian residents can ONLY legally trade currency derivatives on NSE/BSE:
- USD/INR, EUR/INR, GBP/INR, JPY/INR futures and options
- Cross currency futures: EUR/USD, GBP/USD, USD/JPY

**Trading on international platforms (Forex.com, OANDA, etc.):** NOT permitted for Indian residents under FEMA. Offshore forex trading in India is illegal.

**Many apps advertise forex trading in India — verify they are SEBI-registered and offer only INR-paired derivatives. Offshore platforms operating in India are not legally compliant.**

*Source: RBI Master Direction on FEMA; SEBI circular on currency derivatives; NSE currency futures product specifications*',
9,800,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='forex-trading-sessions');

-- Final count
DO $$
DECLARE v_total INT;
BEGIN
  SELECT COUNT(*) INTO v_total FROM lessons WHERE is_published=TRUE;
  RAISE NOTICE '✅ Phase 9 lessons complete!';
  RAISE NOTICE '   Total published lessons: %', v_total;
  RAISE NOTICE '   Added: F&O basics, Options Greeks, Value Investing, Ratio Analysis,';
  RAISE NOTICE '          Demat account, Chart Patterns, Fibonacci, Gold investment,';
  RAISE NOTICE '          ITR filing, REITs, Salary structuring, UPI fraud,';
  RAISE NOTICE '          Porter''s Five Forces, ESG/BRSR, ESOPs, Ethereum PoS,';
  RAISE NOTICE '          e-Rupee, Anchoring biases, Herding/FOMO, Forex sessions';
END $$;

END $PHASE9$;
