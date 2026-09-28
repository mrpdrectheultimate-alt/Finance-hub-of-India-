-- ============================================================
-- FinanceHub — Phase 8: 30 More Lessons
-- Forex +6, Technical Analysis +7, Crypto +5, Corporate +4, Hindi +5
-- Run AFTER phase7_lessons.sql
-- Idempotent: WHERE NOT EXISTS on every insert
-- ============================================================

DO $PHASE8_LESSONS$
DECLARE
  fx_id   UUID;
  ta_id   UUID;
  cr_id   UUID;
  cf_id   UUID;
  hi_id   UUID;
BEGIN
  SELECT id INTO fx_id FROM levels WHERE track_id=(SELECT id FROM tracks WHERE slug='forex-currency')   LIMIT 1;
  SELECT id INTO ta_id FROM levels WHERE track_id=(SELECT id FROM tracks WHERE slug='technical-analysis') LIMIT 1;
  SELECT id INTO cr_id FROM levels WHERE track_id=(SELECT id FROM tracks WHERE slug='crypto-defi')       LIMIT 1;
  SELECT id INTO cf_id FROM levels WHERE track_id=(SELECT id FROM tracks WHERE slug='corporate-finance') LIMIT 1;
  SELECT id INTO hi_id FROM levels WHERE slug='absolute-beginner' LIMIT 1;

  IF fx_id IS NULL THEN SELECT id INTO fx_id FROM levels LIMIT 1; END IF;
  IF ta_id IS NULL THEN ta_id := fx_id; END IF;
  IF cr_id IS NULL THEN cr_id := fx_id; END IF;
  IF cf_id IS NULL THEN cf_id := fx_id; END IF;

-- ═══════════════════════════════════════════════════════════════
-- FOREX & CURRENCIES — +6 lessons
-- ═══════════════════════════════════════════════════════════════

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT fx_id,'How currency exchange rates work — and what moves them','currency-exchange-rates-explained',
'# How Currency Exchange Rates Work

## What is an exchange rate?

An exchange rate is the price of one currency expressed in terms of another.

USD/INR = 83.50 means 1 US Dollar costs ₹83.50.

The first currency (USD) is the base currency. The second (INR) is the quote currency. The rate tells you how much of the quote currency you need to buy one unit of the base.

## How exchange rates are determined

In modern markets, exchange rates for major currencies float freely — supply and demand determines the price. The RBI intervenes occasionally but India has a managed float, not a fully fixed rate.

**Supply of USD in India comes from:**
- IT/software export earnings (India earns ~$200B+ annually in IT exports)
- FDI (foreign companies investing in India)
- FII/FPI inflows (foreign portfolio investors buying Indian stocks/bonds)
- NRI remittances (~$100B+ annually — largest in the world)
- Tourism receipts

**Demand for USD in India comes from:**
- Oil imports (India imports ~85% of crude oil needs, paid in USD)
- Gold imports
- Electronics and machinery imports
- Indian companies paying for foreign services
- FII outflows (when foreign investors sell Indian assets)

## The key factors that move USD/INR

**1. Interest rate differentials:**
If RBI raises rates while Fed holds, Indian bonds become more attractive → foreign investors buy INR → rupee strengthens.
If Fed raises rates while RBI holds → capital flows to US → rupee weakens.

**2. Inflation differential:**
Higher Indian inflation vs US inflation → Indian goods become more expensive → exports fall → rupee weakens.
Purchasing Power Parity (PPP) theory: currencies adjust to equalise purchasing power over time.

**3. Current account deficit:**
India typically runs a current account deficit (imports > exports). Larger deficit → more USD needed → rupee pressure.

**4. Oil prices:**
Every $10 rise in crude oil price adds ~$12-15 billion to India''s import bill → rupee weakens.
Rule of thumb: $10 oil rise = ₹1-2 rupee depreciation pressure.

**5. Risk sentiment:**
Global risk-off events (pandemics, wars, financial crises) → investors flee to USD (safe haven) → all EM currencies including rupee weaken.

**6. RBI intervention:**
RBI buys USD when rupee strengthens too fast (to protect exporters). Sells USD when rupee weakens sharply. India''s forex reserves (~$620B as of 2024) give RBI significant intervention capacity.

## Spot vs forward rates

**Spot rate:** The current exchange rate for immediate delivery (T+2 settlement).

**Forward rate:** Agreed rate for future delivery. Reflects interest rate differentials between countries.

Forward premium/discount = (Forward - Spot) / Spot × 12/months × 100

Since Indian interest rates are typically higher than US rates, the rupee typically trades at a forward discount — meaning USD is more expensive in the forward market.

## How this affects you

**Studying abroad:** A weaker rupee makes foreign education more expensive. ₹83/USD vs ₹70/USD means a $50,000 degree costs ₹41.5 lakh instead of ₹35 lakh.

**NRI remittances:** Send money when rupee is relatively strong (lower USD/INR) — your dollars buy fewer rupees.

**Foreign travel:** Plan trips when rupee is stronger. A ₹5 move in USD/INR = ₹5,000 per $1,000 spent abroad.

**Import-dependent businesses:** Weaker rupee = higher input costs for businesses importing raw materials.

*Source: Reserve Bank of India (rbi.org.in/currency), FEMA regulations*',
9,70,TRUE,TRUE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='currency-exchange-rates-explained');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT fx_id,'RBI''s role in currency management — intervention and forex reserves','rbi-forex-intervention',
'# RBI and Forex Reserves — How India Manages its Currency

## What are forex reserves?

Foreign exchange reserves are assets held by a central bank in foreign currencies — used to back liabilities, influence monetary policy, and defend the currency.

India''s forex reserves as of mid-2024: approximately $620 billion — among the top 5 globally.

**Composition of India''s forex reserves:**
- Foreign currency assets (FCAs): ~90% — mainly USD, EUR, GBP, JPY
- Gold: ~8%
- SDRs (IMF Special Drawing Rights): ~1%
- Reserve tranche with IMF: ~1%

## How RBI manages the rupee

India operates a **managed float** — the rupee''s value is primarily determined by market forces, but RBI intervenes to prevent excessive volatility.

**RBI does NOT target a specific USD/INR level.** It targets orderly market conditions.

**When rupee depreciates too fast:**
RBI sells USD from its reserves → increases USD supply in market → slows rupee fall.

**When rupee appreciates too fast:**
RBI buys USD → increases demand for USD → slows rupee rise. These purchases add to forex reserves.

## Why RBI wants to prevent sharp moves

**Too-fast depreciation is bad because:**
- Oil import bill rises sharply (India imports 85% of crude)
- Inflationary pressure (imported inflation)
- Corporate and government foreign debt becomes more expensive to service
- Capital flight — foreign investors may exit

**Too-fast appreciation is bad because:**
- IT exports become expensive for foreign clients
- Other export sectors lose competitiveness
- Can disrupt businesses'' hedging strategies

## India''s forex reserve build-up strategy

RBI consistently buys dollars during capital inflow periods (when FIIs invest in Indian markets, when IT exports are strong) to build reserves as a buffer.

This is why India''s reserves have grown from ~$100B in 2004 to ~$620B in 2024 — a strategic accumulation over 20 years.

## Import cover — the key metric

**Import cover = Forex reserves / Monthly imports**

India''s import cover: ~11-12 months (as of 2024).
This means India can pay for 11-12 months of imports even if all foreign exchange earnings stopped.

Standard threshold: 3 months is considered minimum safe. India is very comfortable.

## RBI tools beyond spot intervention

**Forward market operations:** RBI can buy/sell forward contracts to influence future exchange rates.

**Currency swap:** RBI can swap rupees for dollars with banks temporarily (provides dollar liquidity without reducing reserves permanently).

**Interest rate signals:** Higher repo rate → more attractive for foreign investors → rupee support.

**FCNR (B) scheme:** Special deposits for NRIs to attract foreign currency — used notably in 2013 rupee crisis.

## The 2013 rupee crisis — a case study

In May-August 2013, the rupee fell from 54 to 69 per USD — one of the sharpest depreciations in Indian history. Causes: Fed tapering fears (capital flight from EMs), India''s high current account deficit, oil prices.

RBI response: Emergency FCNR(B) scheme raised $34 billion from NRIs. Repo rate raised 75 basis points. Import restrictions on gold (most imported commodity after oil).

Result: Rupee stabilised, eventually recovered to low 60s.

Lesson: Even with large reserves, external shocks can cause sharp rupee moves. RBI cannot fully insulate the currency.

*Source: Reserve Bank of India Annual Report; RBI''s Statement on Developmental and Regulatory Policies*',
9,71,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='rbi-forex-intervention');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT fx_id,'Currency hedging for Indian businesses and individuals','currency-hedging-india',
'# Currency Hedging in India

## Why hedge currency risk?

If you have a future foreign currency obligation or receivable, exchange rate movements can significantly change the rupee value.

**Without hedging (example):**
An Indian IT company wins a $1M project. Contract signed at USD/INR = 82. By delivery date (6 months), rate is 78. Revenue = ₹78 lakh instead of expected ₹82 lakh. Loss: ₹4 lakh due to rupee appreciation.

Hedging eliminates this uncertainty.

## Hedging instruments available in India

### 1. Forward contracts
Agree today to buy/sell USD at a fixed rate on a future date.

**Example:** Export receivable of $100,000 in 3 months. Forward rate: 83.50. Lock in ₹83.5 lakh regardless of where spot rate moves.

**Available through:** Any authorised dealer bank. Minimum typically $5,000-10,000. No upfront premium.
**Risk:** If spot moves in your favour, you cannot benefit. Locked in regardless.

### 2. Currency futures (NSE/BSE)
Standardised contracts traded on exchange. USD/INR, EUR/INR, GBP/INR, JPY/INR futures available on NSE.

**Contract size:** $1,000 (USD/INR). Minimum retail-accessible.
**Advantage:** No credit risk (exchange guarantees), transparent pricing, smaller sizes.
**Disadvantage:** Only standardised sizes and dates. Basis risk (futures price ≠ exact spot).

### 3. Currency options
Right (not obligation) to buy/sell currency at a predetermined rate. Pay a premium upfront.

**Call option on USD:** Right to buy USD at ₹84. If USD goes to ₹87, exercise. If USD falls to ₹80, let lapse (lose only premium).

**Advantage:** Protection from adverse moves + participation in favourable moves.
**Disadvantage:** Premium cost (typically 0.5-2% of notional).

### 4. Natural hedge
The best hedge is a natural one — matching foreign currency revenues with foreign currency expenses.

IT company with USD revenues: Hire foreign employees or rent foreign office space in USD → natural hedge.

Importer with USD payables: If they also export and earn USD → natural hedge.

## RBI regulations on hedging

Under FEMA, Indian residents can hedge genuine underlying exposures. Speculation in foreign exchange for non-hedging purposes by individuals is restricted.

**Companies:** Can hedge up to 100% of underlying exposure.
**Individuals:** Hedging permitted for genuine exposures (travel, education, loan repayment, import/export).
**Authorized dealers:** Banks approved by RBI to offer forex products.

## Small business hedging — practical approach

For SME importers/exporters:
1. Identify your net forex exposure (USD payables minus USD receivables)
2. Hedge 50-70% of exposure using forward contracts (leaves room to benefit if rates move favorably)
3. Review and adjust quarterly
4. Use your bank''s treasury desk — they advise on hedging structures

*Source: FEMA 1999; RBI Master Direction on Risk Management and Interbank Dealings*',
8,72,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='currency-hedging-india');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT fx_id,'Carry trade — earning from interest rate differentials across currencies','carry-trade-explained',
'# The Carry Trade — Profiting from Rate Differentials

## What is a carry trade?

A carry trade borrows money in a low-interest-rate currency and invests it in a high-interest-rate currency, profiting from the interest rate differential.

**Classic example:**
- Borrow Japanese Yen at 0.1% interest
- Convert to Indian Rupee
- Invest in Indian government bonds at 7%
- Net profit: ~6.9% (minus currency risk and transaction costs)

## Why carry trades exist

Interest rate parity theory says exchange rates should adjust to eliminate this arbitrage. In practice, it often does not — creating persistent carry trade opportunities.

The currency of the high-interest-rate country often does not depreciate as fast as theory predicts, especially during stable periods.

## Popular carry trade pairs involving INR

**JPY/INR:** Borrow Yen (ultra-low rates 0-0.5%), invest in India (7-8%). Popular with hedge funds.

**CHF/INR:** Borrow Swiss Franc (near-zero rates), invest in India.

**USD/INR:** Less attractive as US rates have risen significantly (2022-2024).

## The carry trade risk — sudden unwind

Carry trades work beautifully in calm markets. They collapse violently when risk sentiment turns.

**What happens during carry unwind:**
1. Global risk-off event (financial crisis, pandemic, geopolitical shock)
2. Traders rush to close positions
3. Everyone sells INR simultaneously → sharp rupee depreciation
4. Those who borrowed in JPY need to buy JPY back → JPY surges
5. Double loss: INR falls, JPY rises → both legs move against the trade

**2008 crisis:** Massive carry trade unwind. INR fell 25% in months. JPY surged 30%.
**2013 taper tantrum:** INR fell 15% in 3 months as carry trades unwound.
**August 2024:** JPY carry trade unwind caused sharp global market volatility.

## Why this matters for Indian retail investors

**You are not doing carry trades — but you feel the effects:**
- When global carry trades unwind → FII sell Indian assets → Sensex falls → rupee weakens
- Understanding carry trade dynamics helps you understand why Indian markets sometimes fall with no obvious India-specific reason

**For NRIs and Indian corporates:**
Understanding carry trades helps in timing of forex transactions. When carry unwind risk is high → hedge more aggressively.

## The Indian government bond carry trade

Foreign portfolio investors (FPIs) regularly do carry trades in Indian government bonds:
- Buy Indian G-secs (7%+) funded by borrowing in low-rate currencies
- Hedge some currency risk, leave some open
- Profitable in stable periods

RBI monitors FPI flows in Indian bonds because large carry positions create sudden exit risk.

*Source: BIS Quarterly Review on carry trades; RBI Working Papers on capital flows*',
8,73,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='carry-trade-explained');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT fx_id,'FEMA regulations — what Indian residents can and cannot do with foreign currency','fema-regulations-india',
'# FEMA — Foreign Exchange Management Act

## What is FEMA?

The Foreign Exchange Management Act (FEMA) 1999 regulates all foreign exchange transactions by Indian residents. It replaced the stricter FERA (Foreign Exchange Regulation Act) which treated forex violations as criminal offences.

FEMA violations are civil offences — penalties, not imprisonment (in most cases).

## Current account vs capital account

**Current account transactions (liberal):**
These are relatively free — related to trade, services, remittances.
- Import/export payments: Allowed freely
- Travel expenses abroad: Allowed with limits
- Education fees: Allowed with documentation
- Medical treatment abroad: Allowed
- Software/IT services payments: Allowed

**Capital account transactions (more regulated):**
These involve investment flows.
- Outward FDI by Indian companies: Allowed with RBI approval for large amounts
- Indians buying foreign stocks: Allowed via LRS (see below)
- Borrowing in foreign currency: Regulated by ECB (External Commercial Borrowing) guidelines

## Liberalised Remittance Scheme (LRS) — what you can send abroad

RBI''s LRS allows resident Indians to remit up to **$250,000 per financial year** per person for permissible purposes:

**Allowed under LRS:**
- Opening and maintaining foreign bank accounts
- Purchasing property abroad
- Investing in foreign stocks, bonds, mutual funds
- Education abroad (fees, living expenses)
- Medical treatment abroad
- Travel and leisure

**Not allowed under LRS:**
- Purchasing foreign currency for trading in forex markets (speculation)
- Remitting to countries on FATF blacklist
- Purchasing lottery tickets or other speculative instruments

**TCS on LRS:** Since 2023, Tax Collected at Source (TCS) applies:
- Education/medical: 5% TCS above ₹7 lakh
- Other purposes: 20% TCS above ₹7 lakh
TCS is adjustable against income tax liability — not an additional tax, but affects cash flow.

## What NRIs can do vs resident Indians

NRIs have more flexibility:
- NRE accounts: Rupee accounts with full repatriability, interest tax-free in India
- FCNR accounts: Foreign currency accounts maintained in India, fully repatriable
- NRO accounts: For Indian income (rent, dividends) — restricted repatriation (up to $1M/year with CA certificate)

When NRI returns to India permanently: becomes Resident Indian, accounts must be reclassified within specified time.

## Common FEMA violations to avoid

- Receiving payments for export services in INR from a foreign party (must be in forex for export benefits)
- Holding foreign currency beyond permitted limits after returning from abroad (must deposit within 180 days)
- Investing in foreign assets beyond LRS limit without approval
- Accepting gifts in foreign currency beyond prescribed limits

**Penalty for FEMA violation:** Up to 3x the amount involved, or ₹2 lakh (whichever is higher) plus confiscation.

*Source: FEMA 1999; RBI Master Directions on LRS (rbi.org.in); Ministry of Finance TCS circulars*',
9,74,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='fema-regulations-india');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT fx_id,'Investing in foreign stocks from India — the complete guide','investing-foreign-stocks-india',
'# Investing in Foreign Stocks from India

## Why invest internationally?

**Diversification:** Indian markets are ~3% of global market cap. Missing the other 97% concentrates risk.

**Access to global leaders:** Apple, Google, Microsoft, NVIDIA — these companies dominate their industries globally. Indian equivalents do not exist at the same scale.

**Currency diversification:** USD assets benefit when rupee weakens (historically, rupee has depreciated ~4-5% annually vs USD over long periods).

**Sector access:** India lacks global leaders in semiconductors, electric vehicles, and aerospace. US markets provide this.

## Methods to invest in foreign stocks

### 1. Direct investment via Indian brokers (LRS route)

Brokers like ICICI Direct, HDFC Securities, Motilal Oswal, and dedicated platforms like Vested, Stockal, INDmoney, and Winvesta allow direct US stock purchase.

**Process:** Open account → Complete LRS documentation → Wire USD (within $250,000/year LRS limit) → Buy stocks on NYSE/NASDAQ.

**Costs:** Currency conversion spread (typically 0.5-1.5%), brokerage (some platforms zero-commission), annual maintenance fees.

**Tax:** Gains taxed as capital gains. Short-term (< 24 months): slab rate. Long-term (24+ months): 20% with indexation. Dividends: taxed as income. US withholds 25% TDS on dividends (India-US DTAA reduces to 15% for some).

### 2. International mutual funds (simplest)

SEBI-registered Indian mutual funds that invest in foreign stocks. No LRS paperwork, no forex hassle.

**Types:**
- **Fund of Funds (FoF):** Indian fund investing in international funds. Example: Parag Parikh Flexi Cap Fund (35-40% international), Motilal Oswal S&P 500 Index Fund.
- **Direct international funds:** Franklin India Feeder - Franklin US Opportunities Fund, DSP BlackRock US Flexible Equity Fund.

**Advantage:** Treated as debt fund for taxation (20% LTCG with indexation after 3 years for non-equity FoFs). No LRS limit applies.

**Disadvantage:** TER (expense ratio) + underlying fund fees = higher total cost.

### 3. ETFs listed in India

NSE/BSE-listed ETFs tracking international indices.
- Motilal Oswal Nasdaq 100 ETF (tracks Nasdaq 100)
- Mirae Asset NYSE FANG+ ETF (Apple, Amazon, Meta, Netflix, Google, etc.)
- Edelweiss MSCI World ETF

**Advantage:** Buy/sell like Indian stocks. No LRS. Taxed as equity if >65% in Indian equity (check fund structure).

## SEBI''s international mutual fund pause

In 2022, SEBI asked international mutual funds to stop accepting new money (due to aggregate industry-level $7B overseas investment limit being breached). The limit has been revised — check current status before investing.

## The 20% TCS reality check

From October 2023, remitting money abroad via LRS for investment in foreign stocks attracts 20% TCS. On ₹1 lakh remitted, ₹20,000 is collected as TCS upfront.

TCS is refundable when you file ITR, but the cash flow impact is significant. International mutual funds and ETFs listed in India avoid this TCS.

**For most retail investors:** International mutual funds and ETFs listed in India are more practical than direct stock purchase via LRS.

*Source: FEMA LRS guidelines; SEBI circular on overseas investments; Income Tax Act Section 206C(1G)*',
10,75,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='investing-foreign-stocks-india');

-- ═══════════════════════════════════════════════════════════════
-- TECHNICAL ANALYSIS — +7 lessons
-- ═══════════════════════════════════════════════════════════════

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT ta_id,'Moving averages — SMA, EMA and how to use them','moving-averages-sma-ema',
'# Moving Averages — The Foundation of Technical Analysis

## What is a moving average?

A moving average smooths out price data by creating a constantly updated average price. It removes short-term noise and shows the underlying trend.

**Simple Moving Average (SMA):**
Average of closing prices over N periods.

20-day SMA on Day 20 = (P1 + P2 + ... + P20) / 20

Each new day: drop the oldest price, add the newest.

**Exponential Moving Average (EMA):**
Gives more weight to recent prices. Responds faster to price changes.

EMA = (Price × Multiplier) + (Previous EMA × (1 - Multiplier))
Multiplier = 2 / (N + 1)

For 20-day EMA: Multiplier = 2/21 = 0.0952 (9.52% weight on today''s price)

## Key moving averages used by Indian traders

**Short-term:** 20 EMA (1 month of trading days)
**Medium-term:** 50 SMA (approximately 2.5 months)
**Long-term:** 200 SMA (approximately 10 months)

These are the most-watched MAs on NSE charts. When many traders watch the same levels, they become self-fulfilling support/resistance.

## How to read moving averages

**Price above MA = Bullish.** Price below MA = Bearish.

**MA slope:** Rising MA = uptrend. Falling MA = downtrend. Flat MA = sideways market.

**MA as dynamic support/resistance:**
In an uptrend, price often pulls back to the 20 EMA or 50 SMA before resuming higher. These become support levels.

## The Golden Cross and Death Cross

**Golden Cross:** 50 SMA crosses above 200 SMA → bullish signal. Indicates long-term trend turning up.

**Death Cross:** 50 SMA crosses below 200 SMA → bearish signal. Indicates long-term trend turning down.

These are lagging signals (confirmed after the trend has already changed) but are widely watched by institutional investors.

**NIFTY historical Golden/Death Crosses:**
- Death Cross in late 2008 (crisis)
- Golden Cross in mid-2009 (recovery)
- Death Cross in 2011, 2015 corrections
- Death Cross in early 2020 (COVID)
- Golden Cross in June 2020 (recovery)

## MA crossover strategy

**Signal:** Buy when 20 EMA crosses above 50 SMA. Sell when 20 EMA crosses below 50 SMA.

**Backtesting reality:** MA crossover strategies work in trending markets. They generate many false signals (whipsaws) in sideways markets.

No MA strategy works in isolation. Combine with volume, RSI, or price action for confirmation.

## EMA ribbon

Multiple EMAs (8, 13, 21, 34, 55, 89) plotted together. When all are aligned upward and price is above all — strong trend. When ribbons cross and tangle — choppy market.

*Source: John Murphy, "Technical Analysis of the Financial Markets"; NSE India technical analysis education*',
8,80,TRUE,TRUE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='moving-averages-sma-ema');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT ta_id,'RSI — Relative Strength Index trading guide','rsi-trading-guide',
'# RSI — Relative Strength Index

## What is RSI?

RSI is a momentum oscillator that measures the speed and change of price movements. Developed by J. Welles Wilder Jr. in 1978. Range: 0 to 100.

**RSI Formula:**
RSI = 100 - (100 / (1 + RS))
RS = Average Gain / Average Loss (over 14 periods, typically)

## Reading RSI values

**Above 70 = Overbought.** Price has risen too fast — potential reversal or pause.
**Below 30 = Oversold.** Price has fallen too fast — potential bounce or reversal.
**50 line = Trend identifier.** RSI above 50 = bullish momentum. Below 50 = bearish.

## RSI divergence — the most powerful signal

**Bullish divergence:** Price makes lower lows, but RSI makes higher lows. Momentum weakening despite falling price — often precedes reversal up.

**Bearish divergence:** Price makes higher highs, but RSI makes lower highs. Momentum weakening despite rising price — often precedes reversal down.

**Example (NIFTY 2022 top):** NIFTY reached new highs in October 2021 and January 2022, but RSI made lower highs each time. Classic bearish divergence before the 2022 correction.

## RSI for Indian stock traders

**Best use cases:**
- Identifying short-term oversold conditions in quality stocks for entry
- Confirming trends (trade only in direction of RSI > 50 for longs)
- Spotting exhaustion at extremes

**Common mistakes:**
- Selling just because RSI hits 70: In strong trends, RSI can stay above 70 for weeks. RSI 70 in a bull market is continuation, not reversal.
- Buying just because RSI hits 30: In a strong downtrend, RSI can stay below 30 for extended periods.

## RSI settings adjustment

Default: 14 periods (standard).
9-period RSI: More sensitive, more signals, more false signals. Used by active traders.
21-period RSI: Smoother, fewer false signals. Used by swing traders.

## Combining RSI with moving averages

**Setup:** Use 50 SMA to determine trend. Only take RSI signals in direction of trend.

- Stock above 50 SMA (uptrend): Buy only when RSI dips to 40-50 (pullback in uptrend), not at 30.
- Stock below 50 SMA (downtrend): Sell/short only when RSI rises to 50-60 (bounce in downtrend), not at 70.

This filters out countertrend trades that have lower win rates.

*Source: J. Welles Wilder Jr., "New Concepts in Technical Trading Systems" (1978)*',
8,81,TRUE,TRUE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='rsi-trading-guide');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT ta_id,'MACD — Moving Average Convergence Divergence explained','macd-indicator-guide',
'# MACD — The Complete Guide

## What is MACD?

MACD (Moving Average Convergence Divergence) combines trend-following and momentum into one indicator. Developed by Gerald Appel in the late 1970s.

**Components:**
- **MACD Line:** 12-period EMA minus 26-period EMA
- **Signal Line:** 9-period EMA of the MACD Line
- **Histogram:** MACD Line minus Signal Line (visualises the difference)

## Reading MACD

**Above zero line:** Bullish (12 EMA above 26 EMA — short-term momentum stronger)
**Below zero line:** Bearish (26 EMA above 12 EMA — long-term momentum stronger)

**MACD crossover signals:**
- MACD line crosses above signal line → bullish crossover → buy signal
- MACD line crosses below signal line → bearish crossover → sell signal

**Histogram:**
- Bars growing (getting taller positive) → momentum increasing upward
- Bars shrinking (getting smaller positive) → momentum weakening
- Bars crossing zero → momentum changing direction

## MACD divergence

Like RSI, MACD divergence is powerful:

**Bullish:** Price falling to new lows, MACD making higher lows → bearish momentum weakening.
**Bearish:** Price rising to new highs, MACD making lower highs → bullish momentum weakening.

## Practical use on NSE stocks

**Most reliable in:** Trending stocks with clear directional bias.
**Least reliable in:** Sideways/ranging stocks (generates many whipsaws).

**Standard settings:** 12, 26, 9 (built into every charting platform).

**Weekly MACD for position traders:** Apply MACD on weekly chart for longer-term trend signals. Fewer signals, but higher reliability.

## MACD on Zerodha Kite / TradingView

Both platforms have MACD built-in under indicators. Default settings (12, 26, 9) are standard starting point. The histogram is the most visually clear signal — watch for histogram crossings from negative to positive territory.

*No indicator works alone. MACD signals are confirmed by price action (breakouts, support/resistance) and volume.*

*Source: Gerald Appel, "Technical Analysis: Power Tools for Active Investors" (2005)*',
7,82,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='macd-indicator-guide');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT ta_id,'Bollinger Bands — volatility and breakout signals','bollinger-bands-guide',
'# Bollinger Bands

## What are Bollinger Bands?

Developed by John Bollinger in the 1980s. Three lines plotted on a price chart:
- **Middle band:** 20-period SMA
- **Upper band:** Middle band + (2 × 20-period standard deviation)
- **Lower band:** Middle band − (2 × 20-period standard deviation)

The bands expand when volatility is high and contract when volatility is low.

## Key Bollinger Band concepts

**The Squeeze:**
When bands contract to an unusually narrow range — volatility is very low. Low volatility precedes high volatility. A squeeze signals an impending large move (direction unknown until breakout occurs).

**Band walk:**
During strong trends, price "walks" along the upper or lower band. Touching the upper band in a strong uptrend is not a sell signal — it is confirmation of strength.

**Mean reversion:**
In ranging markets, price tends to revert to the middle band (20 SMA) after touching either upper or lower band. Can be used for mean-reversion trades.

## Trading strategies

**Bollinger Band squeeze breakout:**
1. Identify a squeeze (bands very narrow, historically tight)
2. Wait for price to break convincingly above upper band or below lower band
3. Trade in direction of breakout with stop below/above the middle band

**%B indicator:**
%B = (Price - Lower Band) / (Upper Band - Lower Band)
- %B > 1.0: Price above upper band (extreme)
- %B = 0.5: Price at middle band
- %B < 0: Price below lower band (extreme)

**Bollinger Band width:**
Measures band width. Low bandwidth = squeeze forming. Rising bandwidth = volatility expanding.

## Application on Indian markets

NIFTY and individual stocks regularly form squeezes before major moves. Notable recent examples:
- NIFTY squeeze in March 2020 before the crash
- Multiple squeezes in mid-cap stocks before 30-50% moves

Combine Bollinger Band squeeze with volume: Low volume during squeeze + high volume on breakout = high-probability setup.

*Source: John Bollinger, "Bollinger on Bollinger Bands" (2001)*',
7,83,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='bollinger-bands-guide');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT ta_id,'Support and resistance — identifying key price levels','support-resistance-levels',
'# Support and Resistance

## The core concept

**Support:** A price level where buying is expected to be strong enough to prevent further decline. The "floor."
**Resistance:** A price level where selling is expected to be strong enough to halt an advance. The "ceiling."

These levels exist because of shared price memory — many market participants remember significant price points and act when price returns to them.

## Why support and resistance work

**Previous highs and lows:** If a stock previously found support at ₹200 three times, many traders have their buy orders waiting there again.

**Round numbers:** ₹100, ₹500, ₹1,000 — humans place orders at round numbers. These act as natural S/R.

**Previous breakout levels:** A level that was resistance, once broken, often becomes support (role reversal). And former support becomes resistance after a breakdown.

**Moving averages:** Dynamic S/R. The 50 SMA and 200 SMA regularly act as support in uptrends.

## Identifying high-quality support/resistance

**Tested multiple times:** A level touched 3+ times is stronger than one touched once.
**Associated with high volume:** More trading at a level = more market memory = stronger S/R.
**Significant time horizon:** A 52-week high is stronger resistance than a 1-week high.
**Confluence:** Multiple S/R factors aligning (e.g., 200 SMA + previous high + round number at the same level) = very strong level.

## The false breakout trap

Price briefly breaks above resistance, sucks in breakout buyers, then reverses below it. One of the most common traps in technical analysis.

**Confirmation rules:**
- Wait for a candle close above/below the level (not just an intraday spike)
- Volume should expand on the breakout
- Give it 1-3 days to confirm — do not chase the first candle

## Support/resistance zones vs exact levels

S/R are best treated as zones (±0.5-1%) rather than exact prices. A stock that "bounces off ₹500" might actually reverse at ₹497 or ₹503.

Drawing lines as zones (rectangle bands) is more realistic than single lines.

## Practical application on NSE stocks

1. Open the weekly chart of any large-cap stock
2. Mark the most recent 52-week high and low
3. Mark previous consolidation zones (where price traded sideways for weeks)
4. Mark round numbers (₹100 increments for most stocks)
5. Note where multiple factors align — those are your key levels

*Source: Thomas Bulkowski, "Encyclopedia of Chart Patterns" (2005); NSE charting tools*',
8,84,TRUE,TRUE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='support-resistance-levels');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT ta_id,'Volume analysis — what trading volume tells you','volume-analysis-trading',
'# Volume Analysis in Trading

## Why volume matters

Price shows what happened. Volume shows how much conviction was behind it.

A 2% rally on 10x normal volume is very different from a 2% rally on 0.5x normal volume.

**High volume confirms price moves.** Low volume questions them.

## Key volume principles

**Volume confirmation:**
Breakouts from consolidation on high volume are more reliable. Breakouts on low volume often fail.
Rule: Volume should be at least 1.5-2x the 20-day average on a breakout day.

**Volume divergence:**
Price making new highs but volume declining — buyers are becoming less enthusiastic. Often precedes a reversal.
Price falling but volume declining — sellers are losing conviction. Often precedes a bounce.

**Climactic volume:**
Extremely high volume spike (5-10x average) at a price extreme often signals exhaustion. Panic selling on massive volume = potential capitulation (market bottom). Euphoric buying on massive volume = potential blow-off top.

## Volume indicators

**On-Balance Volume (OBV):**
Cumulative running total: add volume on up days, subtract on down days.

OBV trending up (even if price flat) = accumulation. Smart money buying quietly.
OBV trending down (even if price flat) = distribution. Smart money selling quietly.

OBV divergence from price = powerful signal.

**Volume Profile:**
Shows volume traded at each price level (horizontal bars). High volume nodes = areas of price acceptance. Low volume nodes = areas of rapid price transit (price moves fast through here).

Available on TradingView as a study. Very useful for identifying support/resistance based on actual volume distribution.

## NSE/BSE volume data

**Pre-market volume:** Thin, not representative.
**9:15-9:30 AM:** Opening auction volume — first signal of day''s sentiment.
**11 AM - 1 PM:** Mid-day volume often lightest — avoid reading too much into small moves.
**2:30-3:30 PM:** End of day volume picks up — institutional activity often visible.
**F&O expiry days:** Higher than usual volume in index options — creates price volatility.

## Delivery volume vs total volume

NSE shows delivery percentage for each stock — the proportion of traded volume that was actual delivery (not intraday squared off).

High delivery % (>60-70%) = conviction buying/selling, not just intraday speculation.
Low delivery % (<20%) = mostly intraday activity, less meaningful for position traders.

*Source: Richard Arms, "Volume Cycles in the Stock Market"; NSE India market data (nseindia.com)*',
8,85,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='volume-analysis-trading');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT ta_id,'Candlestick patterns that actually work — evidence-based guide','candlestick-patterns-guide',
'# Candlestick Patterns — The Evidence-Based Guide

## What candlesticks show

Each candle shows 4 data points: Open, High, Low, Close.

- **Body:** Distance between open and close. Wide body = strong move. Narrow body = indecision.
- **Upper wick:** Distance between body top and high. Long upper wick = rejection of higher prices.
- **Lower wick:** Distance between body bottom and low. Long lower wick = rejection of lower prices.
- **Green/White body:** Close > Open (bullish candle)
- **Red/Black body:** Close < Open (bearish candle)

## Patterns with the strongest evidence

Not all candlestick patterns are created equal. Bulkowski''s research on thousands of candles shows these have the highest predictive value:

**1. Hammer (bullish reversal at support)**
Small body at top, long lower wick (2x+ body length), little/no upper wick.
Meaning: Bulls rejected the intraday lows. Bullish if appears at a support level.
Confirmation: Next candle closes above hammer high on high volume.
Reliability: 60-65% bullish in backtests.

**2. Shooting Star (bearish reversal at resistance)**
Small body at bottom, long upper wick, little/no lower wick.
Meaning: Bears rejected the intraday highs. Bearish at resistance.
Reliability: 58-62%.

**3. Engulfing patterns**
Bullish engulfing: Large green candle fully engulfs the prior red candle.
Bearish engulfing: Large red candle fully engulfs the prior green candle.
Most reliable when at significant S/R levels with high volume on the engulfing candle.
Reliability: 62-68%.

**4. Doji**
Open and close are nearly equal. Long wicks on both sides = indecision.
Standalone doji means little. A doji after a trend suggests potential reversal.
**Gravestone Doji:** Long upper wick, no lower wick — bearish at tops.
**Dragonfly Doji:** Long lower wick, no upper wick — bullish at bottoms.

**5. Morning Star / Evening Star (3-candle patterns)**
Morning Star: Large red candle → small doji/indecision candle → large green candle.
Evening Star: Large green candle → small doji → large red candle.
More reliable than single candles. Reliable at clear S/R levels.

## The honest truth about candlestick patterns

Candlestick patterns alone should never be the sole basis for a trade. In isolation, most patterns have 50-55% reliability — barely better than a coin flip.

They are powerful as confirmation tools when combined with:
- Clear support/resistance level
- Momentum indicators (RSI, MACD) agreeing
- Volume expansion on the pattern candle
- Overall trend alignment

A hammer at major support + RSI oversold + high volume = high-quality setup.
A hammer in the middle of a chart with no context = noise.

*Source: Thomas Bulkowski, "Encyclopedia of Candlestick Charts" (2008) — the most comprehensive statistical study of candlestick patterns*',
9,86,TRUE,TRUE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='candlestick-patterns-guide');

-- ═══════════════════════════════════════════════════════════════
-- CRYPTO & DEFI — +5 lessons
-- ═══════════════════════════════════════════════════════════════

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT cr_id,'How Bitcoin works — blockchain, mining, and halving explained','bitcoin-how-it-works',
'# How Bitcoin Works

## The problem Bitcoin solves

Before Bitcoin: If you send a digital file, you can keep a copy. This is fine for emails or photos, but a disaster for digital money — you could spend the same digital coin twice.

Banks solved this with centralised ledgers. Bitcoin solved it with a decentralised one — the blockchain.

## The blockchain

A blockchain is a public ledger of all Bitcoin transactions, copied identically on thousands of computers worldwide.

When you send 0.01 BTC to someone:
1. You broadcast the transaction to the Bitcoin network
2. Nodes (computers) verify you actually have 0.01 BTC (by checking the blockchain history)
3. Miners group your transaction with others into a "block"
4. Miners compete to add this block to the chain (mining)
5. Once added, the transaction is confirmed — immutable

## Mining — securing the network

Miners are computers that compete to add the next block. They must find a number (nonce) that, when added to block data and hashed, produces an output below a target difficulty.

This requires enormous computational work — called Proof of Work. The winner adds the block and earns the block reward: newly created Bitcoin.

**Why this secures the network:** To rewrite history (reverse a transaction), an attacker would need 51% of all mining power — prohibitively expensive with Bitcoin''s current hash rate.

## Bitcoin halving — the supply schedule

Bitcoin''s supply is capped at 21 million coins. New Bitcoin is created as mining rewards.

**Halving:** Every 210,000 blocks (~4 years), the block reward halves.
- 2009: 50 BTC per block
- 2012 halving: 25 BTC
- 2016 halving: 12.5 BTC
- 2020 halving: 6.25 BTC
- 2024 halving: 3.125 BTC
- ~2140: Last Bitcoin mined

After all 21M Bitcoin are mined, miners earn only transaction fees.

**Historical pattern:** Bitcoin price has typically appreciated significantly in the 12-18 months following each halving as supply issuance drops while demand continues. This correlation is widely discussed but not guaranteed to continue.

## Bitcoin in India — legal and tax status

**Legal:** Buying, selling, and holding Bitcoin is legal in India. Not a legal tender.

**Tax (from FY 2022-23):**
- 30% flat tax on all Virtual Digital Asset (VDA) gains
- No deduction for losses (cannot offset crypto losses against crypto gains or any other income)
- 1% TDS on every transaction above ₹10,000 (deducted by exchange)
- TDS is adjustable against income tax liability

**Exchanges:** WazirX, CoinDCX, Zebpay, CoinSwitch are major Indian exchanges. Regulated reporting requirements with income tax department.

*Source: Income Tax Act Section 115BBH (VDA taxation); CBDT guidelines; Bitcoin.org for technical explanation*',
10,90,TRUE,TRUE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='bitcoin-how-it-works');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT cr_id,'DeFi — Decentralised Finance explained simply','defi-explained-simply',
'# DeFi — Decentralised Finance

## What is DeFi?

DeFi (Decentralised Finance) refers to financial services built on blockchain networks — primarily Ethereum — that operate without traditional intermediaries like banks, brokers, or exchanges.

Instead of trusting a company, you trust code (smart contracts).

## Smart contracts — the engine of DeFi

A smart contract is self-executing code on a blockchain. When conditions are met, it executes automatically.

**Example:** A smart contract loan:
- You deposit 1 ETH as collateral
- The contract automatically releases $1,000 USDC to you
- If ETH price falls below a threshold, contract automatically liquidates your collateral
- No bank, no loan officer, no paperwork — all automated

## Core DeFi applications

**1. Decentralised Exchanges (DEX)**
Trade cryptocurrencies directly with other users — no company in the middle.
Example: Uniswap, SushiSwap.
Use Automated Market Maker (AMM) model — pricing determined by algorithm and liquidity pools, not order books.

**2. Lending and borrowing**
Supply crypto to earn interest. Borrow crypto against collateral.
Example: Aave, Compound.
Interest rates set algorithmically by supply and demand.

**3. Stablecoins**
Cryptocurrencies designed to maintain stable value (typically $1).
- **Fiat-backed:** USDC, USDT — backed by actual USD reserves
- **Crypto-backed:** DAI — backed by over-collateralised crypto
- **Algorithmic:** UST (Terra) — failed spectacularly in 2022

**4. Yield farming**
Providing liquidity to DeFi protocols in exchange for rewards. Can be lucrative but involves complex risks.

**5. Liquid staking**
Stake Ethereum to secure the network, receive staking rewards (~4-5% APY), while keeping tokens liquid.
Example: Lido Finance.

## DeFi risks — be aware before participating

**Smart contract risk:** Bugs in code can be exploited. $3B+ has been lost in DeFi hacks since 2020.

**Liquidation risk:** If collateral value falls, automated liquidation occurs immediately — no grace period.

**Impermanent loss:** Liquidity providers in AMM pools can suffer losses relative to simply holding the assets.

**Rug pulls:** Developers abandon a project after taking investor funds.

**Regulatory risk:** DeFi is in a regulatory grey area globally and in India specifically.

## DeFi and Indian regulations

Currently, the VDA tax (30% on gains, 1% TDS) applies to any crypto transactions in India, including DeFi activities. RBI has expressed concerns about crypto but has not specifically addressed DeFi. The regulatory situation continues to evolve.

*Source: Ethereum.org DeFi overview; DeFiLlama.com for TVL data; CBDT guidelines on VDA*',
9,91,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='defi-explained-simply');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT cr_id,'NFTs — what they are, what happened, and what remains','nfts-explained-honest',
'# NFTs — The Honest Explanation

## What is an NFT?

NFT = Non-Fungible Token. A unique digital asset recorded on a blockchain.

"Non-fungible" means each token is unique and not interchangeable. A Bitcoin is fungible — one BTC is identical to another. An NFT represents something specific — this digital artwork, this specific virtual land plot, this particular game item.

## The technical reality

When you buy an NFT, you are not buying the image or file itself. You buy a token on the blockchain that says "this wallet owns this token that points to this URL."

The underlying asset (image, video) is typically stored off-chain (not on the blockchain) — often on IPFS or a centralised server. If that server goes offline, the NFT still exists on-chain but the content it points to is gone.

## The 2021 NFT mania and collapse

**2021:** NFT trading volume exploded. CryptoPunks selling for $10M+. Bored Ape Yacht Club NFTs peaking at $300,000+. NBA Top Shot, digital art, virtual real estate — everything was an NFT.

Total NFT market: $25 billion in 2021.

**2022-2024:** 99% price collapse for most NFTs. Floor prices of most collections dropped 95-99%. Trading volume collapsed.

**Why it collapsed:**
- Speculative mania driven by easy money (low interest rates, COVID stimulus)
- No fundamental utility for most NFTs — pure speculation on greater fool theory
- Wash trading (buying your own NFTs to inflate volume/price)
- Rate hikes in 2022 killed speculative assets
- Influencer pump-and-dump schemes damaged trust

## What remains legitimate

**Gaming NFTs:** In-game items with genuine utility. Still early — most game NFT implementations failed, but the concept has potential.

**Real-world asset tokenisation:** Using blockchain to represent ownership of real assets (real estate, art, bonds). This is the serious use case attracting institutional interest.

**Music royalties:** Artists tokenising future royalty streams. Legitimate concept with growing adoption.

**Proof of membership/credentials:** NFTs as non-transferable credentials (POAPs, attendance proofs, academic certificates). Utility-based NFTs.

## India and NFTs

NFTs are treated as Virtual Digital Assets under Indian tax law — same 30% tax on gains, 1% TDS. No specific regulatory framework exists as of 2024.

Indian exchanges like WazirX had NFT marketplaces but saw sharp volume declines post-2022.

## The honest takeaway

Most 2021 NFT collections have no fundamental value and most will go to zero. The underlying blockchain technology for provenance and ownership is real and has legitimate applications — but required enormous cleaning out of speculation before genuine utility can emerge.

*Source: CBDT VDA guidelines; Chainalysis NFT Market Report 2022; Dune Analytics NFT data*',
8,92,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='nfts-explained-honest');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT cr_id,'Crypto portfolio management — allocation, rebalancing, cold storage','crypto-portfolio-management',
'# Managing a Crypto Portfolio Safely

## The allocation question

How much of your portfolio should be in crypto? The honest answer: for most Indian retail investors, 0-5% of investable assets.

**Why so conservative?**
- Crypto has 80%+ drawdowns (Bitcoin fell 83% from peak in 2022)
- Regulatory risk in India is unresolved
- 30% flat tax makes profitable trading even harder
- Volatility is extreme and difficult for most people to handle emotionally

If you choose to invest, treat it as the highest-risk allocation of your portfolio — money you can afford to lose entirely.

## Building a crypto portfolio for Indians

**Conservative approach (lower risk):**
- 70-80% Bitcoin (most established, largest market cap, "digital gold" narrative)
- 20-30% Ethereum (second largest, smart contract platform, staking yield)

**Moderate approach:**
- 50% Bitcoin
- 30% Ethereum
- 20% other established large-caps (BNB, SOL, etc.)

**Never:** 100% in altcoins, meme coins, or new tokens promising high returns.

## Buying crypto in India — practical steps

1. Choose a SEBI/FIU-registered exchange: CoinDCX, WazirX, Zebpay, CoinSwitch
2. Complete full KYC (mandatory under PMLA regulations)
3. Start with small amounts (<₹10,000) to learn the mechanics
4. Record every transaction with date, amount, purchase price (needed for tax filing)

## Storage — hot wallet vs cold storage

**Hot wallet (exchange account):** Convenient but risky. If exchange is hacked, funds may be lost.

**Software wallet:** App on your phone/computer. Your private keys, your crypto. Examples: MetaMask, Trust Wallet.

**Hardware wallet (cold storage):** Physical device (Ledger, Trezor) that stores private keys offline. Safest for large amounts.

**The golden rule:** "Not your keys, not your coins." Long-term holdings > ₹50,000 should be moved off exchanges to a hardware wallet.

**Seed phrase security:** When you create a software or hardware wallet, you get a 12-24 word seed phrase. Write it on paper. Store in a safe place. Never photograph it, never store it digitally. This phrase gives complete access to all funds — if lost, your crypto is gone forever.

## Tax record-keeping for India

With 30% tax and 1% TDS on every transaction, detailed records are essential:

Keep records of:
- Date of every purchase/sale
- Amount in INR at time of transaction
- Exchange rate used
- TDS deducted (Form 26AS will show TDS from registered exchanges)
- Wallet transfers (these are not taxable events but need documentation)

Tax software: Cleartax, Taxnodes, and Koinly support Indian crypto tax calculations.

*Source: CBDT Circular on VDA taxation; FIU India registration requirements for VDA exchanges*',
9,93,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='crypto-portfolio-management');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT cr_id,'Understanding stablecoins — USDT, USDC and the risks','stablecoins-explained',
'# Stablecoins — What They Are and Why They Matter

## What is a stablecoin?

A stablecoin is a cryptocurrency designed to maintain a stable value — typically $1 USD.

They solve a fundamental problem: crypto is too volatile to use for everyday transactions or as a store of value. A stablecoin acts as digital cash on the blockchain — usable in DeFi, tradeable 24/7, transferable globally within seconds, without exposure to Bitcoin''s price swings.

## Types of stablecoins

**1. Fiat-collateralised (safest)**
Backed by actual fiat currency held in reserve.

**USDT (Tether):** Largest by market cap (~$110B). Issued by Tether Ltd. Reserves have been controversial — not always 100% cash backed. Has maintained peg but questions remain about reserve quality.

**USDC (Circle):** Second largest. Issued by Circle. Reserves are 100% in US Treasury bills and cash. Monthly attestations by public accounting firms. Considered the "safer" major stablecoin.

**1:1 redemption:** Theoretically, 1 USDT or USDC = $1 redeemable. In practice, retail redemption is complex; most users buy/sell on exchanges.

**2. Crypto-collateralised**
Backed by cryptocurrency (over-collateralised to absorb price swings).

**DAI:** Created by MakerDAO. To mint 100 DAI, deposit $150+ worth of ETH. If ETH falls, position gets liquidated. Has maintained peg through multiple market cycles.

**3. Algorithmic (dangerous)**
Use algorithms to maintain peg — expanding/contracting supply.

**Terra/UST (2022):** The most catastrophic failure. $60 billion stablecoin went to zero in days — triggering a crypto market crash. No actual reserve backing — relied on circular logic between UST and its sister token LUNA.

Lesson: Algorithmic stablecoins without genuine backing are extremely high risk.

## How Indians use stablecoins

**On Indian exchanges:** Most pairs are crypto-to-INR. Stablecoins are less integrated in Indian exchange ecosystems due to regulatory uncertainty.

**OTC/P2P:** USDT is widely used in peer-to-peer trading, often to move money internationally in ways that may violate FEMA — high regulatory risk.

**DeFi access:** To participate in DeFi protocols, converting INR to USDT/USDC is the first step (most DeFi is USD-denominated).

## Risks of stablecoins

**Reserve risk:** If USDT/USDC reserves are insufficient → bank run → depeg.
**USDC depeg (March 2023):** Circle had $3.3B in Silicon Valley Bank. SVB collapsed. USDC temporarily fell to $0.87 before recovering when the US government backed SVB deposits.

**Regulatory risk:** US and global regulators are actively working on stablecoin regulation. SEBI/RBI have not specifically addressed stablecoins in Indian regulation.

**Smart contract risk:** Using stablecoins in DeFi exposes to protocol hacks.

*Source: Circle financial statements; Tether quarterly attestations; Federal Reserve working papers on stablecoins*',
8,94,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='stablecoins-explained');

-- ═══════════════════════════════════════════════════════════════
-- CORPORATE FINANCE — +4 key lessons
-- ═══════════════════════════════════════════════════════════════

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT cf_id,'Reading financial statements — P&L, Balance Sheet, Cash Flow','reading-financial-statements',
'# Reading Financial Statements

## The three financial statements

Every listed Indian company files quarterly and annual reports with BSE/NSE. Three documents tell the complete financial story:

1. **Profit & Loss (P&L) / Income Statement** — what the company earned and spent
2. **Balance Sheet** — what the company owns and owes at a point in time
3. **Cash Flow Statement** — how cash actually moved in and out

All three together → complete picture. Any one alone → incomplete and potentially misleading.

## The P&L Statement

**Revenue (Sales/Turnover):** Money received from selling goods/services. Top line.

**Cost of Goods Sold (COGS):** Direct costs of producing what was sold — raw materials, labour.

**Gross Profit = Revenue − COGS**
**Gross Margin = Gross Profit / Revenue × 100**

High gross margin businesses (software, pharma) have more flexibility. Low gross margin businesses (trading, metals) need scale.

**EBITDA:** Earnings Before Interest, Tax, Depreciation, and Amortisation. Shows operating profitability before financing decisions and accounting treatment.

**EBIT (Operating Profit):** EBITDA minus Depreciation. Actual operating earnings.

**PBT (Profit Before Tax):** After interest expenses.

**PAT (Profit After Tax):** The bottom line. What remains for shareholders.

**EPS = PAT / Total shares outstanding.** What each shareholder earns per share.

## The Balance Sheet

**Assets = Liabilities + Equity** (always balances — hence "balance sheet")

**Current assets (< 1 year life):** Cash, receivables, inventory, prepaid expenses.
**Non-current assets:** Property/plant/equipment, intangibles, investments.

**Current liabilities (due < 1 year):** Payables, short-term debt, advance from customers.
**Non-current liabilities:** Long-term debt, deferred tax.

**Equity:** Paid-up capital + reserves + retained earnings. What belongs to shareholders.

**Key ratios from balance sheet:**
- Debt-to-Equity = Total Debt / Shareholders'' Equity. >1 means more debt than equity.
- Current Ratio = Current Assets / Current Liabilities. <1 means short-term liquidity risk.

## The Cash Flow Statement

Divided into three sections:

**Operating Cash Flow (OCF):** Cash generated from core business. Most important section. OCF should ideally > PAT. If PAT is high but OCF is low → investigate why (possible accounting inflation of profits).

**Investing Cash Flow:** Cash spent on/received from investments — buying machinery, acquisitions, selling assets. Usually negative for growing companies (spending on expansion).

**Financing Cash Flow:** Cash from/to investors and lenders — new debt raised, debt repaid, dividends paid, shares issued/bought back.

**Free Cash Flow = OCF − Capital Expenditure.** What is left after maintaining/growing the business. Companies with consistently positive FCF are financially healthy.

## Where to find financial statements in India

- **BSE India:** bseindia.com → company page → financials
- **NSE India:** nseindia.com → company page → corporate governance
- **Company website:** Investor relations section
- **Screener.in:** Free, clean presentation of financial data for Indian companies (highly recommended)
- **Tickertape:** Similar to Screener with more visual presentation

*Source: ICAI (Institute of Chartered Accountants of India) accounting standards; SEBI LODR requirements for financial disclosure*',
11,95,TRUE,TRUE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='reading-financial-statements');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT cf_id,'DCF valuation — how to value any business','dcf-valuation-basics',
'# DCF Valuation — Pricing a Business

## What is DCF?

Discounted Cash Flow (DCF) is the most fundamental method of valuing a business. The idea: a business is worth the sum of all future cash flows it will generate, discounted to present value.

**Why discount?** ₹1,000 today is worth more than ₹1,000 in 5 years. Because today''s ₹1,000 can be invested and grow. The discount rate accounts for this time value of money.

## The DCF formula

**Business Value = FCF₁/(1+r)¹ + FCF₂/(1+r)² + ... + Terminal Value/(1+r)ⁿ**

Where:
- FCF = Free Cash Flow in each year
- r = Discount rate (typically WACC — Weighted Average Cost of Capital)
- Terminal Value = Value of all cash flows beyond the explicit forecast period

## Step-by-step DCF for an Indian company

**Step 1: Project Free Cash Flows (typically 5-10 years)**
Start with last year''s FCF. Apply a growth rate.

Example: Infosys FCF = ₹25,000 crore. Grow at 12% for 5 years.

| Year | FCF (₹ crore) |
|------|--------------|
| 1 | 28,000 |
| 2 | 31,360 |
| 3 | 35,123 |
| 4 | 39,338 |
| 5 | 44,058 |

**Step 2: Determine discount rate (WACC)**
For a large Indian IT company: approximately 12-14%
WACC = Cost of equity × (Equity/(Equity+Debt)) + Cost of debt × (1-Tax rate) × (Debt/(Equity+Debt))

Using 13% for this example.

**Step 3: Calculate Terminal Value**
Assumes the business continues growing at a stable rate (terminal growth rate) beyond year 5.

Terminal Value = FCF₅ × (1+g) / (WACC - g)
With g = 5% (conservative long-term growth): TV = 44,058 × 1.05 / (0.13 - 0.05) = ₹5,78,261 crore

**Step 4: Discount everything to present value**
PV of FCFs: ₹1,23,000 crore (using 13% discount)
PV of Terminal Value: ₹5,78,261 / (1.13)⁵ = ₹3,13,500 crore

**Total Enterprise Value: ₹4,36,500 crore**
Add cash, subtract debt → Equity Value → divide by shares = intrinsic value per share

## The sensitivity of DCF

DCF is extremely sensitive to assumptions. Change the discount rate by 1% or the terminal growth rate by 1% → value changes by 20-30%.

This is why DCF is always presented with sensitivity tables — showing values under different assumption scenarios.

**The lesson:** DCF is not precise. It gives a range of values based on assumptions. Use it to identify whether a stock is clearly cheap or clearly expensive, not to calculate an exact fair price.

## Indian adjustments to DCF

- **Higher risk premium:** India commands a higher equity risk premium than developed markets (~7-8% vs 5-6% for US)
- **Currency risk:** For Indian companies with significant foreign revenues, add a currency component
- **Inflation:** Use nominal cash flows with nominal discount rates (both in rupees)

*Source: Aswath Damodaran, "Damodaran on Valuation"; SEBI and NSE financial education resources*',
10,96,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='dcf-valuation-basics');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT cf_id,'Capital allocation — what makes a great CEO''s financial decisions','capital-allocation-ceo',
'# Capital Allocation — The CEO''s Most Important Job

## What is capital allocation?

Every rupee a business earns must be deployed somewhere. The CEO and board decide:
1. Reinvest in the business (organic growth)
2. Acquire other businesses (inorganic growth)
3. Pay dividends to shareholders
4. Buy back shares
5. Pay down debt
6. Keep as cash

This decision — capital allocation — determines long-term shareholder value more than almost any other factor.

## The hierarchy of capital uses

**Highest return (usually):** Reinvesting in the core business at high returns
**Next:** Acquisitions that create value (most destroy value)
**Then:** Buybacks when stock is undervalued
**Then:** Dividends
**Lowest:** Accumulating cash beyond what business needs

## Return on Invested Capital (ROIC) — the key metric

ROIC = NOPAT / Invested Capital

Where NOPAT = Net Operating Profit After Tax, Invested Capital = Equity + Debt - Cash

**High ROIC (>15%) businesses:** Create value when they reinvest. They should reinvest as much as possible at those high returns.

**Low ROIC (<10%) businesses:** Destroy value when they reinvest. They should return capital to shareholders (dividends, buybacks) rather than reinvesting poorly.

## Indian examples of capital allocation

**Good capital allocators:**
- **Asian Paints:** Consistently reinvested at 25%+ ROIC. Avoided unrelated diversification. Stayed in their core business.
- **Bajaj Finance:** Deployed capital into lending at very high returns. Built a franchise.
- **TCS:** High dividends + buybacks when cash flow exceeded growth reinvestment needs.

**Poor capital allocation examples:**
- Companies that diversify into unrelated businesses at poor returns (destroying shareholder value)
- Management that keeps growing balance sheet cash "for opportunities" without ever deploying it
- Acquisitions at 5-10x revenue multiples that never recover the purchase price

## Buybacks vs dividends — the Indian context

**Dividends:** Taxed at recipient''s slab rate in India (post-2020). Less tax-efficient for high-tax-bracket investors.

**Buybacks:** Reduce share count → each remaining share worth more. More tax-efficient — capital gains only when you sell, and only on the gain.

**Trend:** Indian companies increasingly prefer buybacks over dividends for tax efficiency.

## How to evaluate management''s capital allocation

**Questions to ask:**
1. What ROIC has the company earned over 5-10 years?
2. How has book value per share grown vs retained earnings?
3. Do acquisitions create or destroy value? (Check if acquired companies earned good returns post-acquisition)
4. Is management returning excess cash (buybacks/dividends) or hoarding it?
5. Do management incentives align with long-term capital allocation (ROIC-based pay)?

*Source: William Thorndike, "The Outsiders" (2012); Warren Buffett Annual Letters to Berkshire Shareholders*',
9,97,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='capital-allocation-ceo');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT cf_id,'IPO investing in India — how to analyse and apply for an IPO','ipo-investing-india',
'# IPO Investing in India

## What is an IPO?

An Initial Public Offering (IPO) is when a private company sells shares to the public for the first time and lists on a stock exchange. In India: NSE or BSE.

## The IPO process in India

**1. Filing DRHP (Draft Red Herring Prospectus):**
Company files detailed information document with SEBI. SEBI reviews for compliance (not an endorsement of the company''s quality or valuation).

**2. Price band and book building:**
Company sets a price band (e.g., ₹440-₹460 per share). Investors bid within this band.

**3. Subscription period:**
3-5 days. Investors apply through their broker or bank.

**4. Allotment:**
If oversubscribed, allotment is by lottery for retail investors (category up to ₹2 lakh).

**5. Listing:**
Typically 6 days after subscription closes. First-day trading can be volatile.

## IPO categories and reservations

**QIB (Qualified Institutional Buyers):** 50% reserved. Mutual funds, FIIs, insurance companies.
**NII/HNI (Non-Institutional Investors):** 15% reserved. Applications above ₹2 lakh.
**RII (Retail Individual Investors):** 35% reserved. Applications up to ₹2 lakh.

For heavily oversubscribed IPOs, retail allotment is by lot — one lot per successful applicant regardless of application size.

**Strategic insight:** For highly oversubscribed IPOs, applying for exactly 1 lot (minimum) vs. 5 lots has the same probability of getting 1 lot allotted.

## How to analyse an IPO

**The fundamental questions:**

1. **Why is the company raising money?** Fresh issue = growth capital (good). Offer for sale (OFS) = existing shareholders selling (not growth).

2. **Valuation relative to peers:** P/E, EV/EBITDA vs listed comparable companies. IPOs are often priced for perfection — pay a valuation premium for the privilege of listing.

3. **Financial history:** 3-5 years of revenue growth, profitability, cash flow. Beware of companies profitable only in the year before IPO.

4. **Business quality:** Competitive moat? Growing market? Strong management?

5. **Use of proceeds:** Specific use of IPO money stated in DRHP. "General corporate purposes" for a large portion is a red flag.

6. **Promoter credibility and dilution:** Is the promoter maintaining significant stake? Have they pledged shares?

## The "grey market premium" warning

Grey market premium (GMP) is the unofficial pre-listing price in unregulated markets. It reflects short-term listing gain expectations — not fundamental value.

High GMP attracts speculative applications. IPOs with 50x subscription are often priced for a first-day pop, not long-term value.

**Strategy:**
- List-and-sell (if allotted): Works for heavily oversubscribed IPOs with high GMP
- Long-term hold: Only for companies you would buy at the listing price even if you missed the IPO

*Source: SEBI ICDR (Issue of Capital and Disclosure Requirements) Regulations; NSE India IPO data*',
10,98,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='ipo-investing-india');

-- ═══════════════════════════════════════════════════════════════
-- HINDI — +5 more (making 13 total Hindi lessons)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free,language,translation_status)
SELECT hi_id,'PPF क्या है? — सरकारी गारंटी के साथ tax-free returns','ppf-kya-hai',
'# PPF — Public Provident Fund

## PPF क्यों खास है?

PPF (Public Provident Fund) एक सरकारी scheme है जो तीन बड़े फायदे एक साथ देती है:
- **Tax save** — Section 80C में ₹1.5 लाख तक
- **Tax-free returns** — interest पर कोई tax नहीं
- **Tax-free withdrawal** — maturity पर पूरा पैसा tax-free

इसे **EEE (Exempt-Exempt-Exempt)** कहते हैं — invest करो, कमाओ, निकालो — तीनों पर zero tax।

## PPF की मुख्य details

**Interest rate:** सरकार हर तिमाही तय करती है। FY 2024-25: **7.1% per annum**

**Tenure:** 15 साल (extend हो सकता है 5-5 साल के blocks में)

**Minimum deposit:** ₹500 per year (जरूरी वरना account dormant)

**Maximum deposit:** ₹1,50,000 per year

**Compounding:** Annual (हर साल के अंत में)

## PPF कहाँ खुलता है?

**Post Office** या **बड़े Banks** में:
SBI, HDFC, ICICI, Axis, Bank of Baroda — सभी PPF account खोलते हैं।

**Online भी खोल सकते हैं** — अपने bank की net banking से।

Documents: Aadhaar, PAN, Passport Photo, Initial deposit (minimum ₹500)

## 15 साल में कितना मिलेगा?

₹1,000/माह × 15 साल × 7.1% = लगभग **₹3.22 लाख**

Total investment: ₹1.80 लाख
Total interest (tax-free): ₹1.42 लाख

₹1,500/माह invest करें: **₹4.83 लाख** मिलेगा

## Partial withdrawal और loan

**Year 7 से:** Partial withdrawal allowed (कुछ conditions के साथ)
**Year 3-6:** PPF पर loan ले सकते हैं (1% extra interest)

## PPF vs FD — कौन बेहतर?

| | PPF | FD |
|--|-----|-----|
| Interest | 7.1% | 7-8% |
| Tax on interest | 0% ✅ | Slab rate ❌ |
| 30% bracket पर net return | 7.1% | 4.9-5.6% |
| Safety | Government ✅ | DICGC ₹5L |
| Liquidity | Low (15 year) | High |

30% tax bracket में PPF clearly बेहतर है।

*स्रोत: National Savings Institute — nsiindia.gov.in*',
8,9,TRUE,TRUE,'hi','human_reviewed'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='ppf-kya-hai');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free,language,translation_status)
SELECT hi_id,'Term Insurance — सबसे जरूरी insurance कौन सा है?','term-insurance-hindi',
'# Term Insurance — जीवन बीमा की असली जरूरत

## क्यों जरूरी है Term Insurance?

अगर आप आज नहीं रहे, तो आपके परिवार का क्या होगा?

- EMI कौन भरेगा?
- बच्चों की पढ़ाई कैसे होगी?
- घर चलेगा कैसे?

Term Insurance इन सवालों का जवाब है।

## Term Insurance क्या है?

Term Insurance सबसे simple life insurance है:
- आप हर साल premium भरते हैं
- अगर policy period में आपकी मृत्यु हो जाए → आपके nominee को **Sum Assured** (बीमा राशि) मिलती है
- अगर आप survive करें → कोई पैसा वापस नहीं

यही इसकी खूबी है — यह pure protection है, investment नहीं।

## कितना Term Insurance लेना चाहिए?

**Simple formula:** Annual income × 10-15

**Example:**
Annual income: ₹8 लाख
Term insurance needed: ₹80 लाख - ₹1.2 करोड़

**More accurate formula:**
- सारे loans + liabilities
+ बच्चों की education cost
+ 10 साल के family खर्च
= Minimum coverage

## Term Insurance कितने का होता है?

1 करोड़ का term insurance, 30 साल में, 30 साल age पर:
**₹8,000-12,000 per year** (monthly premium: ~₹700-1,000)

बहुत सस्ता। इतने में परिवार की पूरी सुरक्षा।

उम्र बढ़ने पर premium भी बढ़ता है — जल्दी लें।

## Common mistakes

❌ **LIC Endowment policy लेना** — insurance + investment mix करना = दोनों में नुकसान
❌ **Employer का group insurance काफी समझना** — job छूटने पर cover खत्म
❌ **Nominee update नहीं करना** — सही nominee डालें और update रखें
❌ **Smoker होकर non-smoker बताना** — claim reject हो सकता है

## Online Term Insurance लेने का तरीका

1. **Policybazaar, ACKO, Ditto** — compare करें
2. अपनी सही उम्र, income, health status declare करें (कभी झूठ नहीं बोलें)
3. **ICICI Prudential iProtect Smart, HDFC Click 2 Protect, Max Life Smart Secure** — popular options
4. Video medical करें अगर sum assured बड़ा हो

*स्रोत: IRDAI (Insurance Regulatory and Development Authority of India) — irdai.gov.in*',
8,10,TRUE,TRUE,'hi','human_reviewed'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='term-insurance-hindi');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free,language,translation_status)
SELECT hi_id,'Share Market क्या है? — BSE, NSE और Stock Exchange कैसे काम करता है?','share-market-hindi',
'# Share Market कैसे काम करता है?

## Share क्या होता है?

कोई भी company बड़ी होने के लिए पैसे की जरूरत होती है। वो publicly पैसे उठा सकती है — अपनी company के छोटे-छोटे हिस्से बेचकर। इन हिस्सों को **Share** या **Stock** कहते हैं।

**Example:** Reliance Industries के 10 shares खरीदे = Reliance में आपकी थोड़ी सी हिस्सेदारी।
Company का profit बढ़ा → share price बढ़ी → आपका पैसा बढ़ा।
Company को नुकसान → share price गिरी → आपका पैसा घटा।

## BSE और NSE क्या है?

**BSE (Bombay Stock Exchange):**
- India''s और Asia का सबसे पुराना stock exchange (1875 में शुरू)
- **SENSEX** BSE का index है (30 बड़ी companies का)
- Mumbai में स्थित

**NSE (National Stock Exchange):**
- Modern, technology-driven exchange (1992 में शुरू)
- **NIFTY 50** NSE का index है (50 बड़ी companies का)
- सबसे ज्यादा trading volume NSE पर

दोनों SEBI के under regulated हैं।

## SENSEX और NIFTY क्या है?

ये **Index** हैं — market का overall score।

**SENSEX:** BSE की 30 सबसे बड़ी companies का weighted average।
**NIFTY 50:** NSE की 50 सबसे बड़ी companies का weighted average।

SENSEX 80,000 = इन 30 companies की average value बहुत ज्यादा है।
SENSEX 10% गिरा = overall market में गिरावट।

## Share कैसे खरीदते हैं?

1. **Demat Account खोलें** — Zerodha, Upstox, Groww, Angel Broking
2. **Trading Account** — same broker पर होता है
3. **Bank account link करें** — पैसे add करें
4. **Share ढूंढें और buy करें** — market price पर या limit price पर

**Market hours:** Monday-Friday, 9:15 AM - 3:30 PM IST

## Demat Account क्या है?

आपके shares को digitally hold करने वाली जगह।

जैसे bank में पैसे रखते हैं, Demat में shares रखते हैं।

CDSL और NSDL — दो depositories हैं जो Demat accounts maintain करते हैं।

## Share market में risk

Share market में **risk है** — prices ऊपर-नीचे होती हैं। आपका invested पैसा घट सकता है।

इसीलिए:
- पहले emergency fund बनाएं
- Long term के लिए invest करें (7+ साल)
- SIP से gradually invest करें

*स्रोत: SEBI (sebi.gov.in), BSE India (bseindia.com), NSE India (nseindia.com)*',
9,11,TRUE,TRUE,'hi','human_reviewed'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='share-market-hindi');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free,language,translation_status)
SELECT hi_id,'Home Loan — गृह ऋण की पूरी जानकारी','home-loan-hindi',
'# Home Loan — पूरी जानकारी

## Home Loan क्या है?

घर खरीदने के लिए bank से लिया गया loan। आप property को collateral रखते हैं। Bank पैसे देता है, आप monthly EMI भरते हैं।

## कितना Loan मिलेगा?

**LTV (Loan-to-Value) ratio:**
- Property value ₹50 लाख तक: Maximum 90% loan (₹45 लाख)
- ₹50-75 लाख: Maximum 80% (₹60 लाख)
- ₹75 लाख से ज्यादा: Maximum 75%

**Income eligibility:**
Monthly EMI + सभी existing EMIs = Maximum 50-60% of monthly income

Example: ₹60,000 monthly income → max total EMI burden ₹30,000-36,000

## Interest Rate के प्रकार

**Floating Rate:** RBI के repo rate से linked। Repo rate बदले → आपका rate बदले।
- Advantage: अभी fixed से कम है। RBI rate cut → आपका EMI घटे।
- Risk: RBI rate बढ़ाए → EMI बढ़े।

**Fixed Rate:** कुछ बैंक offer करते हैं। Rate नहीं बदलती।
- Advantage: Certainty
- Disadvantage: Usually 1-2% ज्यादा

## EMI Calculate करें

**EMI Formula:** P × r × (1+r)ⁿ / ((1+r)ⁿ - 1)

Where P=Principal, r=monthly rate, n=months

**₹50 लाख loan, 8.5% rate, 20 साल:**
EMI ≈ **₹43,391**

Total interest paid: ₹54.1 लाख (almost same as principal!)

## Home Loan पर Tax Benefits

**Section 24(b):** Interest पर ₹2 लाख/year deduction (self-occupied property में)

**Section 80C:** Principal repayment ₹1.5 लाख/year में count होता है

**First-time buyer?** Section 80EEA में extra ₹1.5 लाख interest deduction (conditions apply)

## EMI Prepayment — Biggest Financial Decision

मान लीजिए आपके पास extra ₹1 लाख आए:

**Scenario:** ₹50 लाख loan, 8.5%, 20 years, 5 साल बाद ₹1 लाख prepay करें।

**Interest saved: ₹2.8 लाख** (2.8x का return!)

Prepayment बेहद powerful है। जब भी extra पैसा आए, home loan prepay करें।

**Note:** Floating rate loans में most banks free prepayment allow करते हैं।

## Bank चुनते समय क्या देखें?

- Interest rate (floating)
- Processing fee (₹10,000-50,000)
- Prepayment penalty (floating loans में नहीं होनी चाहिए)
- CIBIL requirement (750+ preferred)
- Disbursement speed

*स्रोत: RBI Master Direction on Housing Finance; NHB (National Housing Bank) — nhb.org.in*',
10,12,TRUE,FALSE,'hi','human_reviewed'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='home-loan-hindi');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free,language,translation_status)
SELECT hi_id,'Health Insurance — सही plan कैसे चुनें?','health-insurance-hindi',
'# Health Insurance — आज की सबसे जरूरी जरूरत

## क्यों जरूरी है?

India में एक serious illness या accident का hospital bill **₹5-20 लाख** या उससे ज्यादा हो सकता है।

बिना health insurance के:
- Savings खत्म हो जाती है
- Loan लेना पड़ता है
- Property बेचनी पड़ सकती है

एक सही health insurance plan इन सबसे बचाती है।

## Types of Health Insurance

**Individual Plan:** एक व्यक्ति के लिए। Premium कम।

**Family Floater:** पूरे परिवार के लिए एक sum insured। Example: ₹10 लाख floater — परिवार में किसी को भी, total ₹10 लाख तक।

**Senior Citizen Plan:** 60+ के लिए। Higher premium, pre-existing diseases cover after waiting period।

**Group Insurance:** Employer का। Job छूटने पर cover खत्म।
⚠️ Employer insurance काफी नहीं है — अपनी personal policy जरूर रखें।

## Sum Insured कितना?

**Minimum recommendation:**
- Metro city (Delhi, Mumbai, Bengaluru): ₹10-15 लाख
- Tier-2 city: ₹5-10 लाख
- Super top-up: Additional ₹15-20 लाख deductible के साथ (सस्ता होता है)

## सही Plan कैसे चुनें?

**Claim Settlement Ratio देखें:** Insurer कितने % claims settle करता है। 95%+ good।

**Network Hospitals:** आपके शहर में cashless hospitals हैं या नहीं।

**Waiting Period:**
- Pre-existing diseases: Generally 2-4 साल
- Specific diseases (hernia, cataract): 1-2 साल
- Day 1 coverage: Accidents, emergency।

**Room rent limit नहीं होनी चाहिए:** कुछ plans में room rent capped है — shared room लेना पड़ता है।

**Co-payment कम हो:** आप 10-20% खुद भरें, बाकी insurer। कम co-pay = बेहतर।

## Recommended Insurers (2024)

नाम नहीं लेंगे specifically (क्योंकि यह financial advice नहीं है), लेकिन:
- High claim settlement ratio (95%+) वाले
- Network hospitals जो आपके शहर में हों
- IRDAI-registered companies

Policybazaar, InsuranceDekho पर compare करें।

## Tax Benefit

**Section 80D:**
- Self/spouse/children health insurance premium: ₹25,000 deduction
- Parents की insurance (under 60): ₹25,000 extra
- Parents की insurance (60+): ₹50,000 extra

Maximum: ₹75,000 deduction per year।

*स्रोत: IRDAI (Insurance Regulatory and Development Authority of India) — irdai.gov.in*',
9,13,TRUE,FALSE,'hi','human_reviewed'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='health-insurance-hindi');

-- Final count
DO $$
DECLARE v_total INT; v_hindi INT;
BEGIN
  SELECT COUNT(*) INTO v_total FROM lessons WHERE is_published=TRUE;
  SELECT COUNT(*) INTO v_hindi FROM lessons WHERE is_published=TRUE AND language='hi';
  RAISE NOTICE '✅ Phase 8 lessons complete!';
  RAISE NOTICE '   Total published lessons: %', v_total;
  RAISE NOTICE '   Hindi lessons: %', v_hindi;
  RAISE NOTICE '   New in Phase 8: Forex (+6), Technical Analysis (+7), Crypto (+5), Corporate (+4), Hindi (+5) = 27 lessons';
END $$;

END $PHASE8_LESSONS$;
