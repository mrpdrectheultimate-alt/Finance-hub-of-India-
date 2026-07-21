-- ============================================================
-- FinanceHub â€” Forex Basics: 15 Lessons
-- Run AFTER behavioral_finance.sql
-- ============================================================

DO $$
DECLARE
  forex_level_id UUID;
BEGIN

INSERT INTO tracks (title, slug, description, icon, color_hex, order_index, is_active)
VALUES ('Forex and Currency', 'forex-currency', 'Master the world''s largest financial market â€” $7.5 trillion traded daily', 'ðŸ’±', '#0369A1', 6, TRUE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO levels (track_id, title, slug, description, order_index, is_free, xp_reward)
SELECT t.id, 'Forex Basics', 'forex-basics',
  'From currency pairs to your first paper trade â€” complete beginner foundation', 1, TRUE, 100
FROM tracks t
WHERE t.slug = 'forex-currency'
  AND NOT EXISTS (
    SELECT 1 FROM levels lv
    WHERE lv.track_id = t.id AND lv.slug = 'forex-basics'
  );

SELECT lv.id INTO forex_level_id
FROM levels lv JOIN tracks t ON lv.track_id = t.id
WHERE t.slug = 'forex-currency' AND lv.slug = 'forex-basics';

IF NOT EXISTS (
  SELECT 1 FROM lessons
  WHERE level_id = forex_level_id AND slug = 'what-is-forex'
) THEN
  -- Run lesson inserts only when this level has not already been seeded.
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES

-- LESSON 1
(forex_level_id, 'What is the forex market â€” the world''s largest financial market', 'what-is-forex',
'# What is the forex market?

## Scale that is hard to imagine

The foreign exchange (forex) market is the largest financial market in the world by a massive margin:

- **$7.5 trillion** traded every single day
- The entire US stock market trades approximately $400 billion per day
- Forex is 18 times larger than all global stock markets combined
- It operates 24 hours a day, 5 days a week across all time zones

## What forex actually is

Forex is the exchange of one currency for another. Every time a business imports goods, a tourist exchanges money, or a government buys foreign debt â€” that is a forex transaction.

**Example**: An Indian company buying US software pays in USD. They convert INR to USD. That is a forex trade.

## Who participates?

**Central banks**: RBI, US Fed, ECB â€” intervene to manage exchange rates
**Commercial banks**: Execute forex transactions for clients and themselves
**Corporations**: Hedge currency risk on international business
**Investment funds**: Speculate and hedge currency exposure in global portfolios
**Retail traders**: Individuals trading for profit (the smallest but fastest-growing segment)

## Major trading centres

London: 38% of global forex volume (largest)
New York: 19%
Singapore: 9%
Hong Kong: 7%
Tokyo: 6%

This global distribution means:
- **Sydney session**: 5:30amâ€“2:30pm IST (lowest volume)
- **Tokyo session**: 5:30amâ€“2:30pm IST (Asian currencies active)
- **London session**: 1:30pmâ€“10:30pm IST (highest volume)
- **New York session**: 6:30pmâ€“3:30am IST (USD most active)
- **London-New York overlap** (6:30pmâ€“10:30pm IST): maximum volatility

## Is forex legal in India?

Yes â€” with restrictions. SEBI and RBI regulate forex trading in India:

**Allowed**: Currency derivatives (futures and options) on NSE and BSE â€” USD/INR, EUR/INR, GBP/INR, JPY/INR.

**Restricted**: Retail margin trading on international platforms (like MT4/MT5) for Indian residents is in a legal grey area. Most serious Indian forex traders use currency derivatives on NSE.

## Why learn forex?

Even if you never trade forex, understanding it matters because:
- INR weakness increases import costs â†’ inflation
- Currency moves affect IT company earnings (export in USD, report in INR)
- Interest rate differentials between countries drive long-term currency trends
- Your mutual funds with international holdings have currency exposure',
8, 1, TRUE, TRUE),

-- LESSON 2
(forex_level_id, 'Currency pairs â€” how forex is quoted and what it means', 'currency-pairs',
'# Currency pairs â€” the language of forex

## Every forex trade involves two currencies

You never buy "a currency" in isolation. You always buy one currency by selling another. This is why currencies are always quoted in pairs.

**EUR/USD = 1.0856**

This means: 1 Euro buys 1.0856 US Dollars.

## The anatomy of a currency pair

**Base currency** (left): The currency being bought or sold. EUR in EUR/USD.
**Quote currency** (right): The currency used to price the base currency. USD in EUR/USD.

If EUR/USD rises from 1.0856 to 1.0900:
- The Euro has strengthened (buys more USD)
- The Dollar has weakened (takes more USD to buy 1 EUR)

## The three categories of pairs

### Major pairs
The most liquid, lowest spread pairs. All involve USD:
- **EUR/USD**: Euro vs Dollar (most traded in world, ~23% of volume)
- **USD/JPY**: Dollar vs Japanese Yen
- **GBP/USD**: British Pound vs Dollar (called "Cable")
- **USD/CHF**: Dollar vs Swiss Franc
- **AUD/USD**: Australian Dollar vs Dollar
- **USD/CAD**: Dollar vs Canadian Dollar
- **NZD/USD**: New Zealand Dollar vs Dollar

### Minor pairs (crosses)
Liquid pairs that do not include USD:
- EUR/GBP, EUR/JPY, GBP/JPY (called "the Dragon")

### Exotic pairs
Emerging market currencies paired with majors:
- USD/INR, USD/BRL, USD/TRY, EUR/INR
Higher spreads, lower liquidity, higher volatility

## Indian currency pairs on NSE

NSE offers four currency futures pairs:
- **USD/INR**: Most liquid Indian currency pair
- **EUR/INR**: Euro vs Rupee
- **GBP/INR**: Pound vs Rupee
- **JPY/INR**: Yen vs Rupee (lot size: â‚¹1,000 per JPY)

Contract size: $1,000 per lot for USD/INR
Expiry: Last business day of each month

## Reading a forex quote

USD/INR = 83.24
- Base currency: USD
- Quote currency: INR
- 1 USD buys 83.24 INR
- If this rises to 83.50: Rupee has weakened (takes more rupees to buy 1 dollar)
- If this falls to 83.00: Rupee has strengthened

## Direct vs indirect quote

**Direct quote** (India perspective): How many INR per 1 unit of foreign currency
USD/INR = 83.24 â†’ Direct quote (how many INR per dollar)

**Indirect quote**: How many units of foreign currency per 1 INR
1/83.24 = 0.01201 USD per INR',
8, 2, TRUE, TRUE),

-- LESSON 3
(forex_level_id, 'Pips, spreads and lots â€” the basic units of forex trading', 'pips-spreads-lots',
'# Pips, spreads and lots

## The pip â€” the atom of forex movement

**Pip** (Percentage in Point) is the smallest standard price movement in a currency pair.

For most pairs: 1 pip = 0.0001 (4th decimal place)
EUR/USD moves from 1.0856 to 1.0857 = 1 pip movement

For JPY pairs: 1 pip = 0.01 (2nd decimal place)
USD/JPY moves from 149.82 to 149.83 = 1 pip movement

For USD/INR on NSE: 1 pip = 0.25 paise (smallest contract tick)

## Calculating pip value

Pip value depends on your position size:

**Standard lot** = 100,000 units of base currency
1 pip on EUR/USD standard lot = $10

**Mini lot** = 10,000 units
1 pip on EUR/USD mini lot = $1

**Micro lot** = 1,000 units
1 pip on EUR/USD micro lot = $0.10

**NSE USD/INR**: 1 tick (0.25 paise) on 1 lot ($1,000) = â‚¹2.50

## The spread â€” your transaction cost

Every forex trade has two prices:
**Bid price**: What the market will pay you (lower price â€” you receive this when selling)
**Ask price**: What you pay to buy (higher price â€” you pay this when buying)

**Spread = Ask âˆ’ Bid**

EUR/USD: Bid 1.0854 / Ask 1.0856 â†’ Spread = 2 pips

The spread is the broker''s profit. You pay it on every trade entry.

Typical spreads:
- EUR/USD: 0.5â€“2 pips (major pair, most liquid)
- GBP/USD: 1â€“3 pips
- USD/INR (NSE): Minimal (exchange-regulated)
- Exotic pairs: 10â€“50+ pips

## What is a lot?

A **lot** is the standard unit of measurement for a forex trade.

| Lot type | Units | Approx value at EUR/USD |
|----------|-------|------------------------|
| Standard | 100,000 | ~$100,000 |
| Mini | 10,000 | ~$10,000 |
| Micro | 1,000 | ~$1,000 |
| Nano | 100 | ~$100 |

**NSE Currency futures**: 1 lot = $1,000 for USD/INR

## Why lot size matters

Larger lots = larger pip value = more profit AND more loss per pip movement.

Beginners should always start with the smallest available lot size. Master the mechanics before scaling up position size.

## Pipette â€” the 5th decimal

Many modern brokers quote to 5 decimal places:
EUR/USD = 1.08565

The 5th decimal (5 in this case) is a "pipette" â€” 1/10th of a pip. Allows more precise pricing.',
7, 3, TRUE, TRUE),

-- LESSON 4
(forex_level_id, 'Leverage and margin â€” why forex amplifies gains and losses', 'leverage-margin-forex',
'# Leverage and margin in forex

## The double-edged sword

Leverage is what makes forex trading both powerful and dangerous. It allows you to control a large position with a small amount of capital.

**Without leverage**: To buy $10,000 of EUR/USD, you need $10,000.
**With 10:1 leverage**: To control $10,000 of EUR/USD, you only need $1,000.

## How margin works

**Margin** is the deposit required to open a leveraged position. It is not a cost â€” it is collateral held while the trade is open.

**Margin requirement = Position size / Leverage**

Example:
- Trade: Buy 1 mini lot EUR/USD ($10,000)
- Leverage: 50:1
- Margin required: $10,000 / 50 = $200

Your $200 controls a $10,000 position.

## The mathematics of leverage

EUR/USD moves 100 pips in your favour.
1 mini lot = $1 per pip = $100 profit

**Without leverage**: You invested $10,000 for $100 profit = 1% return
**With 50:1 leverage**: You invested $200 for $100 profit = 50% return

This is why forex is appealing.

Now EUR/USD moves 100 pips AGAINST you:
**Without leverage**: -1% loss
**With 50:1 leverage**: -50% loss

If it moves 200 pips against you with 50:1 leverage: you have lost more than your margin. This triggers a **margin call**.

## Margin call

A margin call occurs when your losses reduce your account equity below the broker''s required minimum margin level. The broker automatically closes your positions to prevent further loss.

This can happen very quickly with high leverage during volatile market movements.

## SEBI leverage limits for Indian traders

On NSE currency futures:
- Initial margin: approximately 2-3% (effective leverage ~33-50x)
- Marked to market daily â€” losses debited, profits credited

On international platforms (regulatory grey area for Indians):
Leverage of 100:1, 200:1, or even 500:1 offered â€” extremely dangerous

## The golden rule

**Never use maximum available leverage.**

Professional forex traders typically use 5:1 to 10:1 effective leverage regardless of what is available. High leverage is the primary reason 70-80% of retail forex traders lose money.

Risk rule: Never risk more than 1-2% of your trading account on any single trade.',
8, 4, TRUE, TRUE),

-- LESSON 5
(forex_level_id, 'What moves currency prices â€” the fundamental drivers of forex', 'what-moves-forex',
'# What moves currency prices?

## The core principle

A currency''s value reflects the health, productivity, and desirability of its home economy relative to others.

Strong economy â†’ strong currency
Weak economy â†’ weak currency

But in the short term, expectations and sentiment matter more than current reality.

## The 8 major forex drivers

### 1. Interest rates (most important)

Higher interest rates â†’ more attractive for foreign capital â†’ currency strengthens

When RBI raises rates from 6% to 6.5% and the US Fed holds at 5.25%:
- Indian bonds now pay more relative to US bonds
- Foreign investors buy Indian bonds
- They must first buy INR â†’ INR strengthens

This is called the **interest rate differential**.

### 2. Inflation

Higher inflation â†’ currency weakens (purchasing power falls)

India''s inflation at 6% vs US at 3%: INR should weaken by approximately 3% annually to maintain purchasing power parity.

### 3. GDP growth

Stronger economic growth â†’ more investment demand â†’ currency strengthens

### 4. Trade balance (current account)

**Trade surplus** (exports > imports) â†’ more foreign demand for domestic currency â†’ strengthens
**Trade deficit** (imports > exports) â†’ more domestic demand for foreign currency â†’ weakens

India runs a persistent current account deficit â†’ structural pressure on INR

### 5. Political stability

Political uncertainty â†’ capital flight â†’ currency weakens
Elections, government instability, geopolitical conflict â†’ currency weakness

### 6. Central bank intervention

RBI directly buys or sells USD in the forex market to manage INR volatility.
India holds $600+ billion in forex reserves partly to defend INR during crises.

### 7. Capital flows (FII/FDI)

Foreign institutional investors buying Indian equities must buy INR first â†’ INR strengthens
When FIIs sell Indian stocks and repatriate, they sell INR â†’ INR weakens

### 8. Risk sentiment (global)

During global risk-off episodes (COVID, financial crises), investors flee to "safe haven" currencies:
- USD, JPY, CHF strengthen
- Emerging market currencies (INR, BRL, TRY) weaken

## The Rupee''s structural pressures

INR tends to weaken over time because:
- India imports more than it exports (trade deficit)
- India''s inflation is typically higher than developed markets
- Oil imports (priced in USD) create constant USD demand

RBI uses forex reserves to slow (not stop) this depreciation.',
8, 5, TRUE, TRUE),

-- LESSON 6
(forex_level_id, 'Technical analysis for forex â€” reading charts and price action', 'forex-technical-analysis',
'# Technical analysis in forex

## Why technical analysis is especially useful in forex

Fundamental analysis tells you WHAT to trade. Technical analysis tells you WHEN and WHERE.

In forex, technical analysis is widely used because:
- Currency prices reflect all public information quickly (highly efficient)
- Price action and chart patterns repeat across all time frames
- Support and resistance levels are watched by millions of traders simultaneously â€” creating self-fulfilling patterns
- Liquidity is so high that large moves are needed to absorb orders

## Key concepts

### Support and resistance

**Support**: A price level where buying demand has historically prevented further falls. Think of it as a floor.

**Resistance**: A price level where selling pressure has historically prevented further rises. Think of it as a ceiling.

USD/INR at 83.00 has been strong support. When it approaches 83.00, expect heavy RBI intervention buying and organic demand.

### Trend identification

**Uptrend**: Series of higher highs and higher lows. Trend is your friend â€” trade in the direction of the trend.
**Downtrend**: Series of lower highs and lower lows.
**Sideways/range**: Price oscillates between support and resistance.

### Candlestick patterns

Each candle shows: Open, High, Low, Close for that time period.

**Bullish engulfing**: Large bullish candle completely engulfs prior bearish candle â†’ reversal signal
**Doji**: Open and close almost equal â†’ indecision, possible reversal
**Hammer**: Small body, long lower wick â†’ buyers rejected lower prices â†’ bullish

### Moving averages

**50 MA**: Medium-term trend direction
**200 MA**: Long-term trend direction

When 50 MA crosses above 200 MA: "Golden Cross" â†’ bullish signal
When 50 MA crosses below 200 MA: "Death Cross" â†’ bearish signal

### RSI (Relative Strength Index)

Measures momentum on a 0-100 scale:
- Above 70: Overbought (potential reversal down)
- Below 30: Oversold (potential reversal up)
- Divergence between price and RSI: strong signal

### Key levels to watch in USD/INR

- 83.00: Strong RBI support
- 84.00: Psychological resistance
- 85.00+: Likely RBI intervention zone

## Time frames

**Daily chart**: Overall trend direction
**4-hour chart**: Entry timing
**1-hour chart**: Precise entry and stop placement

Multi-timeframe analysis: align the daily trend, find entry on 4-hour, execute on 1-hour.',
8, 6, TRUE, FALSE),

-- LESSON 7
(forex_level_id, 'Forex trading strategies â€” the most reliable approaches for beginners', 'forex-strategies',
'# Forex trading strategies for beginners

## The beginner mistake

New forex traders look for a "system" that tells them exactly when to buy and sell with high accuracy. Such systems do not exist. Professional forex traders aim for 50-60% win rates with strong risk management â€” not 90% win rates.

What matters is: **Average win > Average loss** over many trades.

## Strategy 1: Trend following

**Philosophy**: The trend is your friend. Trade in the direction of the established trend, buy pullbacks in uptrends, sell rallies in downtrends.

**Setup**:
1. Identify trend using 50 MA and 200 MA on daily chart (price above both = uptrend)
2. Wait for price to pull back to the 50 MA or a key support level
3. Enter when price shows a bullish reversal candle at support
4. Stop loss: below the recent swing low
5. Target: previous high or 2:1 reward/risk minimum

**Suited for**: Patient traders who can wait for clear setups.

## Strategy 2: Range trading

**Philosophy**: Most of the time (70%+), currency pairs trade in ranges. Buy at support, sell at resistance.

**Setup**:
1. Identify clear horizontal support and resistance on 4-hour chart
2. Wait for price to reach support
3. Confirm with RSI oversold (below 30) or bullish candle pattern
4. Enter long with stop below support, target at resistance
5. Reverse at resistance

**Suited for**: Lower volatility periods, less news-driven markets.

## Strategy 3: Breakout trading

**Philosophy**: When price breaks a significant level with volume/momentum, it often continues in the breakout direction.

**Setup**:
1. Identify consolidation (tight range) on 4-hour or daily chart
2. Mark the upper and lower boundaries
3. Wait for decisive break with strong momentum candle
4. Enter on close above resistance (or below support for shorts)
5. Stop: back inside the range
6. Target: measured move (height of the range, projected in breakout direction)

**Risk**: False breakouts â€” price breaks the level briefly then reverses. Wait for candle close, not just a wick.

## The risk management rules that matter more than strategy

1. **Never risk more than 1-2% of account per trade**
2. **Always have a stop loss before entering**
3. **Minimum 1.5:1 reward/risk ratio** (ideally 2:1 or 3:1)
4. **Do not move stop loss further away** when trade goes against you
5. **Journal every trade**: entry, exit, reason, result, lesson

Without these rules, no strategy works.',
8, 7, TRUE, FALSE),

-- LESSON 8
(forex_level_id, 'Risk management in forex â€” the difference between survival and blowup', 'forex-risk-management',
'# Risk management in forex â€” the most important lesson

## Why 70-80% of retail forex traders lose money

The primary reason is not bad strategy selection â€” it is poor risk management:
- Using too much leverage
- Not using stop losses
- Moving stop losses further away when trades go wrong
- Risking 10-20% of account on single trades
- Revenge trading after losses

## The 1% rule

**Never risk more than 1-2% of your trading account on any single trade.**

Account size: â‚¹1,00,000
Max risk per trade (1%): â‚¹1,000

If your stop loss is 30 pips away on USD/INR:
â‚¹1,000 / 30 pips = â‚¹33.33 per pip
At â‚¹2.50 per pip per lot: maximum position = 13 lots

This seems small. It is designed to be. The goal is to survive long enough to learn.

## Why the 1% rule works

With 2% risk per trade:
- You need to lose 50 consecutive trades to lose all capital
- A 50-trade losing streak is virtually impossible for any reasonable strategy
- You stay in the game long enough to improve

With 20% risk per trade:
- 5 consecutive losses wipes your account
- 5-loss streaks happen regularly even with good strategies

## Stop loss placement

**Never trade without a stop loss.** No exceptions.

Stop loss placement:
- **Below support** (long trades): Place stop just below a key support level
- **Above resistance** (short trades): Place stop just above a key resistance level
- **Fixed pips**: Some traders use fixed 20-30 pip stops on specific strategies
- **ATR-based**: Average True Range Ã— 1.5 below entry for dynamic volatility adjustment

## The reward/risk ratio

**Minimum acceptable reward/risk: 1.5:1**
**Target: 2:1 or 3:1**

If your stop loss is 30 pips, your take profit should be minimum 45 pips (1.5:1), ideally 60-90 pips.

This means even winning only 40% of trades can be profitable:
- 10 trades at 2:1 R/R with 40% win rate:
- 4 wins Ã— 2R = +8R
- 6 losses Ã— 1R = -6R
- Net: +2R profit

## Drawdown and recovery

A 50% loss requires a 100% gain to recover.
A 25% loss requires a 33% gain to recover.
A 10% loss requires an 11% gain to recover.

**Keep drawdowns small by keeping risk per trade small.**

## The trading journal

Record every trade:
- Date, pair, direction, entry price, stop, target
- Rationale for the trade
- Result (pips profit/loss, R multiple)
- What you learned

Review weekly. Your journal will reveal your patterns â€” which strategies work, which time frames suit you, which mistakes you repeat.',
9, 8, TRUE, FALSE),

-- LESSON 9
(forex_level_id, 'The USD/INR pair â€” understanding India''s most important currency', 'usd-inr-explained',
'# USD/INR â€” India''s most important currency pair

## Why USD/INR matters to every Indian

Even if you never trade forex, USD/INR affects your daily life:

**Petrol prices**: India imports 85% of its oil, priced in USD. Rupee weakens â†’ petrol gets more expensive.

**Electronics**: Phones, laptops, chips â€” mostly imported and priced in USD. Rupee weakens â†’ everything electronic costs more.

**Foreign education**: Paying for US/UK university? Rupee at 75 vs 85 is a 13% increase in cost.

**IT sector**: Infosys, TCS, Wipro earn revenue in USD. Rupee weakening = higher INR revenue for the same USD earnings. Good for IT stocks.

**Imports vs exports**: Weak rupee makes exports cheaper (better for exporters) and imports expensive (bad for importers).

## Historical USD/INR journey

- 1991: â‚¹17.9 per dollar (pre-liberalisation)
- 2000: â‚¹45
- 2008: â‚¹39 (temporary INR strength before crisis)
- 2013: â‚¹68 (taper tantrum)
- 2018: â‚¹74
- 2022: â‚¹83
- 2024: â‚¹83-84 range

**The long-term trend**: INR has depreciated steadily because India''s inflation has consistently exceeded US inflation. Purchasing power parity predicts this depreciation.

## What RBI does to manage INR

**Selling USD from reserves**: RBI sells USD, buys INR â†’ INR strengthens (limits depreciation speed)

**Interest rate adjustments**: Higher rates attract capital â†’ INR strengthens

**Capital controls**: Limits on how much INR can flow out of India

**Moral suasion**: RBI communicating intentions to markets

RBI does not try to fix USD/INR at a specific level â€” it tries to reduce excessive volatility.

## Trading USD/INR on NSE

**Product**: Currency futures and options
**Contract size**: $1,000 per lot
**Tick size**: 0.25 paise (â‚¹0.0025)
**Tick value**: â‚¹2.50 per lot per tick
**Trading hours**: 9:00amâ€“5:00pm IST (Monday-Friday)
**Settlement**: RBI reference rate on expiry date
**Margin**: ~2-3% of contract value (~â‚¹2,000-â‚¹2,500 per lot)

**Example trade**:
Buy 10 lots USD/INR at 83.2500
Target: 83.5000 (25 paise = 100 ticks)
Profit: 100 ticks Ã— â‚¹2.50 Ã— 10 lots = â‚¹2,500

## Factors that move USD/INR specifically

- **Oil prices**: Higher oil â†’ India imports more â†’ more USD demand â†’ INR weakens
- **FII flows**: Foreign investors buy/sell Indian equities/bonds
- **RBI policy**: Rate decisions and intervention
- **US Fed decisions**: Strong USD globally â†’ INR weakens relative to dollar
- **India''s current account deficit**: Structural INR weakness driver
- **Inflation differential**: India vs US inflation gap',
8, 9, TRUE, FALSE),

-- LESSON 10
(forex_level_id, 'Forex vs stocks â€” key differences every trader must understand', 'forex-vs-stocks',
'# Forex vs stocks â€” key differences

## The same skill set, very different markets

Many investors approach forex thinking it is like stock trading with currencies instead of companies. This leads to costly mistakes. The markets are fundamentally different.

## Key differences

### 1. What you are trading

**Stocks**: Ownership in a company. Value linked to business performance, earnings, growth.

**Forex**: Exchange rate between two economies. No "fundamentals" in the same sense â€” it is always relative. USD/INR going up does not mean the US is doing well â€” it could mean India is doing poorly.

### 2. Operating hours

**Stocks**: 9:15amâ€“3:30pm IST, Mondayâ€“Friday. Closed evenings, weekends, holidays.

**Forex**: 24 hours, 5 days. Opens Sunday 5am IST (Sydney), closes Friday 11:30pm IST (New York). Gaps can occur over weekends.

### 3. Leverage

**Stocks** (delivery): No leverage (pay full amount)
**Stocks** (intraday): Up to 5x leverage typically
**Forex**: 50xâ€“500x leverage available (dangerous)
**NSE Currency futures**: ~33-50x effective leverage

### 4. Shorting

**Stocks**: Shorting requires borrowing shares (complex, expensive, limited)

**Forex**: Selling a currency pair is as easy as buying. No borrowing required. Equal access to long and short.

### 5. Number of instruments

**Indian stocks**: 5,000+ listed companies. Research burden is high.

**Forex**: Focus on 7-8 major pairs. Much more concentrated market to follow.

### 6. Volatility source

**Stocks**: Company-specific events (earnings, management changes, products) + macro

**Forex**: Almost entirely macro (interest rates, inflation, GDP, geopolitics). No "quarterly results" for currencies.

### 7. Trend characteristics

**Stocks**: Can trend up for years (bull markets). Individual companies can fall to zero.

**Forex**: Currencies rarely go to zero. They tend to mean-revert over very long periods. Trends are powerful but eventually reverse.

### 8. Impact of news

**Stocks**: Company news affects one stock
**Forex**: Major economic data (US NFP, CPI, Fed decisions) can move entire currency markets violently within seconds

## Which is better for beginners?

Neither is inherently "better" â€” but forex beginners face:
- Higher leverage temptation
- Macro news volatility that can move markets 100+ pips in seconds
- Wider spread costs eating into small accounts
- 24-hour markets requiring discipline about not watching screens constantly

Many successful traders recommend starting with stocks (delivery investing first), learning market mechanics, then moving to currency derivatives.',
7, 10, TRUE, FALSE),

-- LESSON 11
(forex_level_id, 'Economic data that moves forex markets â€” the calendar every trader needs', 'forex-economic-calendar',
'# The forex economic calendar

## Why economic data releases are critical

Major economic data releases cause some of the largest and fastest forex movements. USD/INR can move 50+ paise within minutes of a US Federal Reserve decision.

Trading around these releases without preparation is extremely dangerous for beginners.

## The most important releases

### US Data (moves almost all pairs)

**Non-Farm Payrolls (NFP)**: Released first Friday of every month. Shows US job creation. Biggest single forex mover:
- Better than expected â†’ USD strengthens (economy is strong)
- Worse than expected â†’ USD weakens
- Typical movement: 50-150 pips on EUR/USD, 50+ paise on USD/INR

**CPI (Consumer Price Index)**: Monthly inflation data.
- Higher inflation â†’ Fed may raise rates â†’ USD strengthens
- Lower inflation â†’ Fed may cut rates â†’ USD weakens

**Federal Reserve decisions**: 8 times per year. The most important event for global forex.
- Rate hike â†’ USD strengthens dramatically
- Rate cut â†’ USD weakens
- Forward guidance (what the Fed says about future rates) often matters more than the decision itself

**GDP**: Quarterly. Less immediate impact than NFP or CPI.

### India-specific data

**RBI Monetary Policy Committee (MPC)**: 6 times per year.
- Rate hike â†’ INR strengthens, USD/INR falls
- Rate cut â†’ INR weakens, USD/INR rises

**India CPI**: Monthly. Higher inflation â†’ RBI may raise rates â†’ INR effect depends on context

**India GDP**: Quarterly. Beats expectations â†’ INR strengthens

**Trade deficit data**: Monthly. Higher deficit â†’ structural INR pressure

## How to use the economic calendar

1. Check **Investing.com economic calendar** every morning for that day''s releases
2. Note releases marked "High Impact" (red flag)
3. Decide BEFORE the release:
   - Am I going to trade this release? (High risk)
   - Am I going to close existing positions before this release? (Recommended for beginners)
   - Am I going to stay out of the market entirely? (Safest for beginners)

## The beginner''s rule

**Avoid trading 30 minutes before and 30 minutes after major news releases.** Spreads widen dramatically, moves are violent and unpredictable, and stop-losses can be skipped (gapping). After the initial volatility settles, new trends often emerge that are safer to trade.',
7, 11, TRUE, FALSE),

-- LESSON 12
(forex_level_id, 'Currency correlations â€” how pairs move together', 'currency-correlations',
'# Currency correlations in forex

## No currency pair is an island

Currency pairs do not move in isolation. Because many pairs share a common currency (USD, for example), they are mathematically correlated.

Understanding correlations prevents a critical beginner mistake: thinking you are diversified when you are actually doubling your risk.

## Positive and negative correlation

**Positive correlation**: Two pairs tend to move in the same direction.

**Negative correlation**: Two pairs tend to move in opposite directions.

Correlation ranges from -1.0 (perfect negative) to +1.0 (perfect positive).

## Key correlations to know

### EUR/USD and GBP/USD: Highly positive (~0.85)

Both have USD as quote currency. Both are sensitive to USD strength/weakness. When USD strengthens, both EUR and GBP typically fall against it.

**Risk**: Buying EUR/USD AND GBP/USD is nearly the same as a double position in EUR/USD. If USD strengthens, both positions lose.

### EUR/USD and USD/CHF: Strongly negative (~-0.90)

EUR/USD rising means USD is weak. USD weakness means USD/CHF falls too (USD as base). These pairs almost mirror each other.

### USD/INR and USD/JPY: Moderate positive

Both involve USD as base. When USD strengthens globally, both typically rise.

### Oil and USD/CAD: Negative correlation

Canada is a major oil exporter. Rising oil prices â†’ Canadian economy benefits â†’ CAD strengthens â†’ USD/CAD falls.
India is an oil importer. Rising oil â†’ more USD demand â†’ USD/INR rises.

## Practical application

**Portfolio risk**: If you trade USD/INR, EUR/INR, and GBP/INR simultaneously, you have three INR positions. All three will move similarly when there is a major RBI announcement or India-specific news. Your effective risk is 3x a single position.

**Confirmation**: If EUR/USD is rising AND GBP/USD is rising AND USD/CHF is falling â†’ USD weakness is confirmed across multiple pairs. Stronger signal.

**Divergence signal**: If EUR/USD rises but GBP/USD does not follow â†’ something specific to GBP is happening. Investigate.',
7, 12, TRUE, FALSE),

-- LESSON 13
(forex_level_id, 'Forex trading psychology â€” the mental game of currency trading', 'forex-psychology',
'# Forex trading psychology

## The statistics that should concern every forex trader

- 70-80% of retail forex traders lose money
- Most lose within the first 6 months
- The majority of losers have the same problem: psychology, not strategy

Many traders have a perfectly good strategy on paper that they destroy in execution through emotional decision-making.

## The six psychological traps in forex

### 1. Revenge trading
You lose a trade. You immediately enter another trade to "make it back," usually with larger size. This trade also loses. You keep escalating until the account is damaged.

**The rule**: After a loss, mandatory 30-minute break. No immediate re-entry.

### 2. Moving stop losses
Your stop loss is 30 pips away. Price reaches 28 pips against you. You move the stop to 50 pips to "give it more room." Price eventually hits the new stop. Loss is 67% larger than planned.

**The rule**: Stop losses are sacred. Never move them further from entry. You may move them in your favour (trailing stop) but never against.

### 3. Overtrading
You feel you must be in a trade constantly. You force entries in unclear market conditions. Frequency does not create profit â€” quality setups do.

**The rule**: Define your specific setup criteria in advance. Only enter when ALL criteria are met. No criteria = no trade.

### 4. P&L obsession
You check your open positions every 5 minutes. The P&L fluctuation creates anxiety that drives poor decisions.

**The rule**: Set your entry, stop, and target before entering. Then minimise screen watching. The market will do what it will do â€” watching it does not help.

### 5. Confirmation seeking after entry
Once in a trade, you search for news that confirms your position. You dismiss counter-evidence. (Confirmation bias specifically in trading.)

**The rule**: Your trading plan justifies the trade, not news you find after entering.

### 6. FOMO entries
You see a big move already underway. You enter late because you fear missing more. You buy the top. Reversal happens and you stop out.

**The rule**: If you missed the entry, you missed the trade. Wait for the next setup. The market will provide opportunities every day.

## The professional trader mindset

Professional traders:
- Think in probabilities, not certainties
- Accept losses as the cost of doing business (like shop rent)
- Follow their rules consistently without emotional deviation
- Focus on process (did I follow my system?) not just outcome (did I make money?)
- Do not need to be right â€” they need to manage risk correctly

> "The goal of a successful trader is to make the best trades. Money is secondary." â€” Alexander Elder',
8, 13, TRUE, FALSE),

-- LESSON 14
(forex_level_id, 'How to start trading forex in India â€” legal, practical, step by step', 'start-forex-india',
'# How to start forex trading in India â€” legally and practically

## The legal route: NSE currency derivatives

The clearest, safest, and most compliant way to trade forex in India is through currency futures and options on the NSE.

**Step 1: Open a brokerage account**

Brokers offering NSE currency derivatives:
- **Zerodha**: â‚¹20 flat fee per order, best platforms (Kite)
- **Upstox**: Competitive fees, clean interface
- **Angel One**: Research tools included
- **ICICI Direct / HDFC Securities**: Higher fees but full service

Documents needed: PAN, Aadhaar, bank account, 6 months bank statement

**Step 2: Enable currency segment**

Separately activate the currency derivatives segment (not automatically included with equity account). Takes 1-2 days.

**Step 3: Fund your account**

Transfer funds to your trading account. Start small â€” â‚¹25,000-â‚¹50,000 is enough to practice with small positions.

**Step 4: Learn the platform**

Spend 2 weeks paper trading on the platform before using real money. On Zerodha Kite, you can test the interface without placing real orders.

**Step 5: Start with USD/INR futures only**

This is the most liquid Indian currency pair. Master one pair before adding others.

**Step 6: Start with minimum position size**

1 lot = $1,000. Margin required: ~â‚¹2,000-â‚¹2,500. Start with 1 lot per trade maximum.

## Risk capital allocation

Start forex trading only with money you can afford to lose completely. Suggested starting capital: â‚¹25,000-â‚¹50,000.

Keep forex trading as a small percentage of your overall financial plan. Your equity SIPs, emergency fund, and insurance should be fully funded before allocating to forex speculation.

## The 3-month practice regime

**Month 1**: Paper trade on a simulated account. Learn platform, practice identifying setups, record in journal. Do not put real money in yet.

**Month 2**: Trade 1 lot real money. Execute exactly what you practised on paper. Journal every trade.

**Month 3**: Review journal. If profitable and consistent, consider slowly scaling. If not â€” return to paper trading and identify what needs improvement.

## What to avoid

- International retail forex platforms promising 500:1 leverage â†’ regulatory risk, often fraudulent
- Signals groups and "guaranteed" forex systems â†’ primarily scams
- Social media "forex gurus" showing profits â†’ survivorship bias, most are not profitable
- Starting with large account to "make it worth it" â†’ start small, prove the process',
8, 14, TRUE, FALSE),

-- LESSON 15
(forex_level_id, 'Forex basics recap â€” everything you need before your first real trade', 'forex-basics-recap',
'# Forex basics recap

## What you have mastered in Forex Basics

You now have a complete foundation in currency markets â€” from understanding what moves exchange rates to placing your first trade on NSE currency futures.

## Core knowledge

**The forex market**: $7.5 trillion daily volume. 24/5 operation across global time zones. Central banks, commercial banks, corporations, and retail traders all participate.

**Currency pairs**: Base currency / Quote currency. Majors (all involve USD), minors (crosses), exotics (emerging markets). In India: USD/INR, EUR/INR, GBP/INR, JPY/INR on NSE.

**Pip**: Smallest standard price movement (0.0001 for most pairs). Pip value depends on lot size.

**Spread**: Bid-ask difference = your transaction cost. Majors have lowest spreads.

**Leverage and margin**: Leverage amplifies both gains and losses. Never use maximum available leverage. 1-2% account risk per trade maximum.

## What moves currencies

Interest rate differentials, inflation, GDP growth, trade balance, political stability, central bank intervention, capital flows, and global risk sentiment.

For USD/INR specifically: oil prices, FII flows, RBI policy, India''s current account deficit.

## Technical analysis

Support and resistance, trend identification, moving averages (50 MA and 200 MA), RSI, candlestick patterns. Multi-timeframe analysis: daily trend â†’ 4-hour entry timing â†’ 1-hour execution.

## Strategies

Trend following, range trading, and breakout trading. All require strict risk management: 1-2% max risk per trade, minimum 1.5:1 reward/risk ratio, mandatory stop losses.

## Psychology

The six traps: revenge trading, moving stops, overtrading, P&L obsession, post-entry confirmation bias, FOMO entries. Professional traders follow rules, not emotions.

## Getting started in India

NSE currency derivatives â†’ Zerodha or Upstox â†’ enable currency segment â†’ start with USD/INR futures â†’ 1 lot minimum â†’ paper trade for 30 days first.

## What comes next

The Technical Analysis track will take your chart reading skills to the next level with advanced patterns, indicators, and systematic strategy development applicable to both forex and equity markets.

Complete the quiz to finish Forex Basics and unlock Technical Analysis.',
7, 15, TRUE, FALSE);

END IF;

END $$;

-- Add quizzes for first 5 forex lessons
DO $$
DECLARE
  l1 UUID; l2 UUID; l3 UUID; l4 UUID; l5 UUID;
  q1 UUID; q2 UUID; q3 UUID; q4 UUID; q5 UUID;
BEGIN
  SELECT id INTO l1 FROM lessons WHERE slug = 'what-is-forex';
  SELECT id INTO l2 FROM lessons WHERE slug = 'currency-pairs';
  SELECT id INTO l3 FROM lessons WHERE slug = 'pips-spreads-lots';
  SELECT id INTO l4 FROM lessons WHERE slug = 'leverage-margin-forex';
  SELECT id INTO l5 FROM lessons WHERE slug = 'what-moves-forex';

  IF l1 IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM quizzes WHERE lesson_id = l1
  ) THEN
    -- Run quiz inserts only when the first quiz has not already been seeded.
  INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l1, 'Forex Market Basics', 70) RETURNING id INTO q1;
  INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
  (q1, 'Approximately how much is traded in the forex market every day?', '["$400 billion", "$1 trillion", "$7.5 trillion", "$100 billion"]', 2, 'The forex market trades approximately $7.5 trillion daily â€” making it the largest financial market in the world by a massive margin, roughly 18x the size of all global stock markets combined.', 1),
  (q1, 'When is the highest volume period for forex trading (in IST)?', '["5:30am-2:30pm (Tokyo session)", "1:30pm-10:30pm (London session)", "6:30pm-3:30am (New York session)", "6:30pm-10:30pm (London-New York overlap)"]', 3, 'The London-New York overlap (6:30pm-10:30pm IST) has the highest trading volume and volatility because both of the world''s two largest forex centers are simultaneously active.', 2),
  (q1, 'What is the legal way for Indian retail investors to trade currencies?', '["Any international forex broker", "Currency derivatives on NSE (USD/INR, EUR/INR, GBP/INR, JPY/INR)", "Spot forex through any Indian bank", "WhatsApp signal groups"]', 1, 'SEBI and RBI permit currency derivatives trading on NSE and BSE. Trading forex on international retail platforms is in a regulatory grey area for Indian residents.', 3);

  INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l2, 'Currency Pairs', 70) RETURNING id INTO q2;
  INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
  (q2, 'In the pair EUR/USD = 1.0856, what does the rate tell you?', '["1 USD buys 1.0856 Euros", "1 Euro buys 1.0856 US Dollars", "The Euro has fallen 1.0856%", "USD is worth 1.0856 times EUR"]', 1, 'EUR is the base currency (left). USD is the quote currency (right). The rate tells you how many units of the quote currency (USD) are needed to buy 1 unit of the base currency (EUR). So 1 EUR = 1.0856 USD.', 1),
  (q2, 'USD/INR rises from 83.00 to 84.00. What has happened?', '["The Rupee has strengthened", "The Rupee has weakened â€” it now takes more Rupees to buy 1 Dollar", "The Dollar has weakened", "Nothing significant has changed"]', 1, 'USD/INR rising means it takes MORE Rupees to buy 1 Dollar â€” the Rupee has depreciated (weakened). This makes imports more expensive and exports cheaper.', 2),
  (q2, 'Which pair has the highest daily trading volume globally?', '["USD/INR", "GBP/USD", "EUR/USD", "USD/JPY"]', 2, 'EUR/USD accounts for approximately 23% of all global forex volume â€” making it the most traded currency pair in the world. Its high liquidity results in the tightest spreads.', 3);

  INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l3, 'Pips, Spreads and Lots', 70) RETURNING id INTO q3;
  INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
  (q3, 'EUR/USD moves from 1.0850 to 1.0870. How many pips has it moved?', '["2 pips", "20 pips", "0.2 pips", "200 pips"]', 1, '1 pip = 0.0001 for EUR/USD. Movement = 1.0870 - 1.0850 = 0.0020 = 20 pips. Count the 4th decimal place: 50 to 70 = 20 pips.', 1),
  (q3, 'EUR/USD has bid 1.0854 and ask 1.0856. What is the spread and what does it represent?', '["2 pips â€” your profit on the trade", "2 pips â€” your transaction cost paid to the broker", "0.0002% â€” an annual fee", "2 pips â€” the day''s range"]', 1, 'Spread = Ask - Bid = 1.0856 - 1.0854 = 0.0002 = 2 pips. This is what you pay to enter the trade â€” the broker''s profit. You start each trade 2 pips in the negative.', 2),
  (q3, 'On NSE USD/INR, 1 lot = $1,000 and 1 tick = â‚¹2.50. You buy 5 lots and it moves 40 ticks in your favour. What is your profit?', '["â‚¹100", "â‚¹500", "â‚¹1,000", "â‚¹200"]', 1, 'Profit = ticks Ã— tick value Ã— lots = 40 Ã— â‚¹2.50 Ã— 5 = â‚¹500. This is why understanding lot size and tick value before trading is essential for position sizing.', 3);

  INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l4, 'Leverage and Margin', 70) RETURNING id INTO q4;
  INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
  (q4, 'With 50:1 leverage, how much margin is required to control a $50,000 position?', '["$50,000", "$2,500", "$1,000", "$25,000"]', 1, 'Margin = Position size Ã· Leverage = $50,000 Ã· 50 = $1,000. This $1,000 controls a $50,000 position. A 2% move against you ($1,000 loss) could wipe your entire margin.', 1),
  (q4, 'What is a margin call?', '["A phone call from your broker asking you to trade more", "When your losses reduce account equity below minimum margin, positions are automatically closed", "When you make a profit and the broker takes their share", "A reminder to pay your monthly subscription"]', 1, 'A margin call occurs when losses reduce your equity below the broker''s required margin level. The broker automatically closes positions to prevent further losses â€” often at the worst possible prices during high volatility.', 2),
  (q4, 'Why do professionals typically use 5:1 to 10:1 leverage even when 500:1 is available?', '["Higher leverage is illegal for professionals", "Lower leverage keeps position sizes manageable and prevents a single bad trade from wiping the account", "Brokers charge more for higher leverage", "Lower leverage gives higher returns"]', 1, 'Available leverage and appropriate leverage are very different things. High leverage means a small adverse move triggers a margin call. Professionals prioritise survival (staying in the game) over maximum position size.', 3);

  INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l5, 'What Moves Forex', 70) RETURNING id INTO q5;
  INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
  (q5, 'Country A raises interest rates from 5% to 7%. Country B holds at 4%. What happens to Country A''s currency?', '["It weakens", "It strengthens â€” higher rates attract foreign capital seeking better returns", "Nothing changes", "It depends on inflation"]', 1, 'Higher interest rates make a country''s bonds more attractive to foreign investors seeking yield. They must buy the local currency to invest, increasing demand and strengthening the currency.', 1),
  (q5, 'Why does rising oil prices typically weaken the Indian Rupee?', '["India exports a lot of oil", "India imports 85% of its oil in USD â€” higher oil means more USD demand, weakening INR", "Oil prices and currencies are unrelated", "RBI intervenes when oil rises"]', 1, 'India is a major oil importer. Every dollar spent on oil requires converting INR to USD. Higher oil prices increase this USD demand, putting downward pressure on INR.', 2),
  (q5, 'What is meant by "safe haven" currencies?', '["Currencies that never lose value", "Currencies like USD, JPY, and CHF that investors buy during global crises as stores of value", "Currencies backed by gold", "Currencies with the highest interest rates"]', 1, 'Safe haven currencies (USD, JPY, CHF) tend to strengthen during global uncertainty because investors sell riskier assets and currencies (like emerging market currencies) and park funds in perceived safety.', 3);
  END IF;
END $$;



