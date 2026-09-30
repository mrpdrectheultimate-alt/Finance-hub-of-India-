-- ============================================================
-- FinanceHub â€” Technical Analysis: 15 Lessons
-- Run AFTER forex_basics.sql
-- ============================================================

DO $$
DECLARE
  ta_level_id UUID;
BEGIN

INSERT INTO tracks (title, slug, description, icon, color_hex, order_index, is_active)
VALUES ('Technical Analysis', 'technical-analysis', 'Read charts, spot patterns, and time trades with precision using the tools professional traders use', 'ðŸ“Š', '#0891B2', 7, TRUE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO levels (track_id, title, slug, description, order_index, is_free, xp_reward)
SELECT t.id, 'Chart Reading Fundamentals', 'chart-reading-fundamentals',
  'From your first candlestick to building a complete trading system', 1, TRUE, 100
FROM tracks t
WHERE t.slug = 'technical-analysis'
  AND NOT EXISTS (
    SELECT 1 FROM levels lv
    WHERE lv.track_id = t.id AND lv.slug = 'chart-reading-fundamentals'
  );

SELECT lv.id INTO ta_level_id
FROM levels lv JOIN tracks t ON lv.track_id = t.id
WHERE t.slug = 'technical-analysis' AND lv.slug = 'chart-reading-fundamentals';

IF NOT EXISTS (
  SELECT 1 FROM lessons
  WHERE level_id = ta_level_id AND slug = 'intro-technical-analysis'
) THEN
  -- Run lesson inserts only when this level has not already been seeded.
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES

(ta_level_id, 'Introduction to technical analysis â€” what it is and why it works', 'intro-technical-analysis',
'# Introduction to technical analysis

## What is technical analysis?

**Technical analysis (TA)** is the study of past price and volume data to forecast future price movements.

The core belief: **all available information is already reflected in price.** You do not need to analyse company financials or macroeconomics â€” the chart tells you everything you need to know about supply and demand at any moment.

## Technical vs Fundamental analysis

| | Technical Analysis | Fundamental Analysis |
|--|--|--|
| What it studies | Price, volume, charts | Earnings, P/E, balance sheet |
| Time horizon | Short to medium term | Medium to long term |
| Primary use | When to buy/sell | What to buy/sell |
| Works best for | Trading, timing entries | Investing, asset selection |

Many great investors use both: fundamental analysis to identify WHAT to buy, technical analysis to determine WHEN and WHERE to buy.

## The three assumptions of technical analysis

**1. The market discounts everything**
All known information â€” earnings, news, insider sentiment â€” is already reflected in the current price. You only need to study price itself.

**2. Prices move in trends**
Once a trend is established, it is more likely to continue than to reverse. This is the foundation of trend-following strategies.

**3. History repeats itself**
Price patterns recur because human psychology is consistent. Fear and greed create the same patterns across different markets, assets, and time periods.

## Does technical analysis work?

The honest answer: it works better than random chance but is not a crystal ball.

Evidence for TA:
- Momentum (trend continuation) is one of the most documented anomalies in finance
- Support and resistance levels create self-fulfilling patterns â€” because millions of traders watch the same levels
- Volume-price patterns have been studied extensively with positive results

Evidence against:
- Many patterns are identified in hindsight (survivorship bias)
- Markets have become more efficient as more traders use the same tools
- No TA signal works in all market conditions

The practical conclusion: TA is a useful tool for timing entries and exits, managing risk, and understanding market structure â€” not a prediction machine.

## What you will learn

This level covers the complete technical analysis toolkit:
- Candlestick charts and patterns
- Support and resistance
- Trend lines and channels
- Moving averages
- Volume analysis
- RSI, MACD, Bollinger Bands
- Chart patterns (head and shoulders, triangles, flags)
- How to build a complete trading system',
8, 1, TRUE, TRUE),

(ta_level_id, 'Candlestick charts â€” reading the language of price', 'candlestick-charts',
'# Candlestick charts

## Why candlesticks?

Candlestick charts were developed in Japan in the 18th century by rice trader Munehisa Homma. They show four crucial pieces of information in one visual element:

**Open, High, Low, Close (OHLC)**

A candlestick tells a complete story of the battle between buyers and sellers during any time period â€” whether 1 minute or 1 month.

## Anatomy of a candlestick

```
      â”‚  â† Upper wick (shadow) = highest price reached
    â”Œâ”€â”´â”€â”
    â”‚   â”‚ â† Body = range between open and close
    â”‚   â”‚
    â””â”€â”¬â”€â”˜
      â”‚  â† Lower wick = lowest price reached
```

**Bullish candle (green/white)**: Close > Open. Buyers won the period.
**Bearish candle (red/black)**: Close < Open. Sellers won the period.

**Large body**: Strong conviction â€” buyers or sellers dominated
**Small body**: Indecision â€” neither buyers nor sellers controlled
**Long upper wick**: Buyers tried to push higher but sellers rejected the move
**Long lower wick**: Sellers pushed lower but buyers stepped in strongly

## Key single candlestick patterns

### Doji
Open and close are almost equal. Very small body.
**Meaning**: Perfect indecision. Market at equilibrium. Potential reversal signal, especially after a strong trend.

### Hammer (bullish)
Small body at the top, long lower wick (at least 2x body), little or no upper wick.
**Meaning**: Sellers pushed price lower during the period but buyers recovered strongly. Found at bottoms â†’ bullish reversal signal.

### Shooting Star (bearish)
Small body at the bottom, long upper wick (at least 2x body), little or no lower wick.
**Meaning**: Buyers pushed price higher but sellers rejected the move strongly. Found at tops â†’ bearish reversal signal.

### Marubozu
Full body candle with no wicks (or very small wicks).
Bullish Marubozu: Strong buying throughout the period. Bearish Marubozu: Strong selling throughout.

## Key two-candlestick patterns

### Bullish Engulfing
A bearish candle followed by a larger bullish candle that completely engulfs the previous candle''s body.
**Meaning**: Strong reversal from bearish to bullish. Buyers overwhelmed sellers. Found at support levels â†’ high-probability bullish signal.

### Bearish Engulfing
A bullish candle followed by a larger bearish candle engulfing it.
**Meaning**: Sellers overwhelmed buyers. Found at resistance â†’ bearish signal.

### Harami (Inside Bar)
Large candle followed by a smaller candle whose body is completely inside the previous body.
**Meaning**: Indecision after a strong move. Potential pause or reversal.

## Context is everything

**No candlestick pattern works in isolation.** A Hammer at a key support level after a prolonged downtrend is a high-probability signal. The same Hammer in the middle of a range is noise.

Always confirm candle patterns with:
- Location (at support/resistance?)
- Trend context (continuation or reversal?)
- Volume (was the pattern accompanied by high volume?)',
8, 2, TRUE, TRUE),

(ta_level_id, 'Support and resistance â€” the most important concept in technical analysis', 'support-resistance',
'# Support and resistance

## The foundation of all technical analysis

If you only learn one concept from technical analysis, make it support and resistance. Every other TA tool ultimately tries to identify these levels.

## What is support?

**Support** is a price level where buying demand is historically strong enough to halt a decline and potentially reverse it.

Think of support as a floor. When price approaches this level, buyers step in, creating demand that prevents further falls.

**Why support forms**:
- Previous lows (price bounced here before)
- Round numbers (â‚¹100, â‚¹500, USD/INR 83.00)
- Moving averages (many traders buy when price hits the 200 MA)
- Previous resistance that has been broken (old ceiling becomes new floor)
- Fibonacci retracement levels

## What is resistance?

**Resistance** is a price level where selling pressure is historically strong enough to halt an advance and potentially reverse it.

Think of resistance as a ceiling. When price approaches this level, sellers step in, creating supply that prevents further rises.

## The key principle: Role reversal

When support breaks, it often becomes resistance.
When resistance breaks, it often becomes support.

**Example**: NIFTY 50 struggled to break 18,000 for months (resistance). Once it finally broke through, 18,000 became a strong support level on subsequent pullbacks.

This role reversal happens because:
- Traders who bought at the support level and held through the breakdown will sell when price returns to their entry (break-even selling)
- Traders who missed the original move wait for a "second chance" entry at the breakout level

## How to identify support and resistance

**Step 1**: Look at historical price chart (daily or weekly)
**Step 2**: Find levels where price has repeatedly turned
**Step 3**: Mark horizontal lines at those levels
**Step 4**: Note whether price has tested the level multiple times (more tests = stronger level)
**Step 5**: Note the time period between tests (more recent = more relevant)

## Zones, not lines

Support and resistance are better thought of as **zones** rather than precise price levels. Price rarely turns exactly at a level â€” it may overshoot slightly.

Instead of drawing a single line at 83.00 for USD/INR, consider a zone between 82.80 and 83.20.

## Strength indicators

A support/resistance level is stronger when:
- Price has tested it multiple times (3+ touches = very strong)
- The reaction at the level was sharp and large
- High volume occurred at the level
- Multiple timeframes confirm the same level (daily and weekly both show support)
- The level aligns with a round number or moving average',
8, 3, TRUE, TRUE),

(ta_level_id, 'Trend lines and channels â€” following the market''s direction', 'trendlines-channels',
'# Trend lines and channels

## Trend identification â€” the most profitable skill

"The trend is your friend" is the most repeated phrase in technical analysis â€” because it is true. Trading with the trend dramatically increases the probability of success.

**Uptrend**: Series of higher highs (HH) and higher lows (HL)
**Downtrend**: Series of lower highs (LH) and lower lows (LL)
**Sideways**: No clear pattern of highs and lows

## Drawing an uptrend line

An uptrend line connects a series of **higher lows**.

Rules:
1. Need minimum 2 points to draw a line (3 confirms it)
2. Connect the swing lows (the bottom of each pullback)
3. Price should not cut through the line â€” it should be a support
4. The more touches, the stronger the trend line

**Trading the uptrend line**:
- Wait for price to pull back and touch the trend line
- Look for a bullish candlestick pattern at the touch
- Enter long with stop below the trend line
- Target: previous high or next resistance

## Drawing a downtrend line

A downtrend line connects a series of **lower highs**.

Connect the swing highs (the top of each rally). Each touch of the line is a selling opportunity.

## Channels

A **channel** is formed when price moves between two parallel trend lines â€” one connecting highs, one connecting lows.

**Ascending channel**: Both lines slope upward. Trade: buy at lower channel line (support), sell at upper channel line (resistance).

**Descending channel**: Both lines slope downward. Bearish bias â€” sell rallies to the upper channel line.

**Horizontal channel (range)**: Both lines are horizontal. Equal-opportunity trading in both directions.

## Trend line breaks

When price breaks through a significant trend line with:
- Strong momentum candle
- High volume
- Close beyond the line (not just a wick)

...it signals a potential trend change.

**False breakouts**: Price briefly breaks the trend line then reverses back. Wait for a close beyond the line on the time frame you are trading. A close below an uptrend line on the daily chart is much more significant than a brief intraday wick through it.

## Time frames and trends

The trend on a longer time frame always takes priority.

A stock might be in a:
- Long-term (monthly) uptrend
- Medium-term (weekly) downtrend (pullback in the uptrend)
- Short-term (daily) uptrend (bounce within the pullback)

Trade in the direction of the dominant (longer) time frame for highest probability.',
7, 4, TRUE, TRUE),

(ta_level_id, 'Moving averages â€” the trend-following indicators every trader uses', 'moving-averages',
'# Moving averages

## What is a moving average?

A **moving average (MA)** smooths out price data by creating a constantly updated average price over a specific time period. This filters out random "noise" and reveals the underlying trend direction.

## Simple Moving Average (SMA)

The SMA is the average closing price over N periods.

**20-day SMA**: Sum of last 20 closing prices Ã· 20

When price is above the 20-day SMA â†’ short-term uptrend
When price is below the 20-day SMA â†’ short-term downtrend

## Exponential Moving Average (EMA)

The EMA gives more weight to recent prices, making it more responsive to new information.

EMA reacts faster to price changes than SMA.
EMA is generally preferred for trading (more timely signals).
SMA is generally preferred for identifying longer-term trends (less whipsawing).

## The key moving averages

**9 EMA / 13 EMA**: Very short-term. Used by intraday and swing traders for precise entries.

**20 SMA / 21 EMA**: Short-term trend. Most widely watched moving average by equity traders. Pullbacks to the 20 SMA in uptrends are common buy opportunities.

**50 SMA**: Medium-term trend. Major institutional level. Widely watched by fund managers. A break of the 50 SMA signals a potential trend change.

**200 SMA**: Long-term trend. The most important moving average. Price above 200 SMA = long-term bull market. Price below = bear market.

## Moving average signals

### Golden Cross (bullish)
The 50 SMA crosses ABOVE the 200 SMA.
Signals a long-term shift from bearish to bullish.
Major buy signal â€” often marks the beginning of extended bull runs.

**India example**: NIFTY 50 Golden Cross in February 2023 preceded a strong bull run.

### Death Cross (bearish)
The 50 SMA crosses BELOW the 200 SMA.
Signals a long-term shift from bullish to bearish.
Major sell/short signal.

### Price crossing MA
Price crosses above 200 SMA â†’ bullish signal
Price crosses below 200 SMA â†’ bearish signal

## Moving averages as dynamic support/resistance

In trending markets, moving averages act as dynamic support (in uptrends) or resistance (in downtrends).

In an uptrend, price often pulls back to the 20 or 50 EMA before continuing higher. These are high-probability buy zones.

## Multiple MA systems

Many traders use 3 MAs together:
- Fast (9 EMA)
- Medium (21 EMA)
- Slow (50 SMA)

When all three are aligned (fast above medium above slow) â†’ strong uptrend confirmed.

## Limitations

Moving averages are **lagging indicators** â€” they confirm what has already happened, not what will happen. They work well in trending markets and poorly in ranging, choppy markets where they generate many false signals.',
8, 5, TRUE, TRUE),

(ta_level_id, 'RSI â€” the momentum oscillator that reveals overbought and oversold conditions', 'rsi-indicator',
'# RSI â€” Relative Strength Index

## What is RSI?

The **Relative Strength Index (RSI)** was developed by J. Welles Wilder in 1978. It measures the speed and magnitude of price changes to identify overbought and oversold conditions.

RSI oscillates between 0 and 100.

## Calculation (simplified)

RSI = 100 - [100 / (1 + RS)]
Where RS = Average gain over N periods / Average loss over N periods

Standard period: 14 (14-day RSI)

## The classic interpretation

**RSI above 70**: Overbought â€” price has risen too fast, potential pullback or reversal
**RSI below 30**: Oversold â€” price has fallen too fast, potential bounce or reversal
**RSI at 50**: Neutral momentum. Price above 50 = bullish momentum; below 50 = bearish momentum.

## The problem with simple overbought/oversold

In strong trends, RSI can stay overbought for months. A stock in a powerful uptrend can have RSI above 70 for weeks while the price continues to rise. Simply selling because RSI > 70 is a common beginner mistake.

**Better approach**: RSI overbought/oversold signals work best in ranging markets, not trending markets.

## RSI Divergence â€” the most powerful RSI signal

**Bullish divergence**: Price makes a lower low, but RSI makes a higher low.
This signals that while price fell further, the momentum of the decline slowed. Buyers are stepping in. Potential reversal upward.

**Bearish divergence**: Price makes a higher high, but RSI makes a lower high.
Price rose further but momentum weakened. Sellers are gaining strength. Potential reversal downward.

Divergence is one of the highest-probability signals in technical analysis because it shows a disconnect between price and momentum â€” often before price reverses.

## RSI level adjustments for trend context

In a strong uptrend, adjust levels:
- Overbought: 80 (not 70)
- Oversold: 40 (not 30)
- RSI rarely falls below 40 in strong uptrends

In a strong downtrend:
- Overbought: 60
- Oversold: 20
- RSI rarely rises above 60 in strong downtrends

## RSI in Indian markets

RSI is extensively used by Indian technical analysts. Common application:

Weekly RSI of NIFTY 50:
- Weekly RSI below 30 has historically been an excellent long-term buying opportunity (2009, 2020)
- Weekly RSI above 80 has historically signalled caution (2007, 2021)

For individual stocks: Daily RSI divergence at key support levels is a widely used signal by NSE traders.',
8, 6, TRUE, FALSE),

(ta_level_id, 'MACD â€” the trend and momentum indicator combined', 'macd-indicator',
'# MACD â€” Moving Average Convergence Divergence

## What is MACD?

**MACD** (Moving Average Convergence Divergence) was developed by Gerald Appel in the 1970s. It combines trend-following and momentum into a single indicator.

MACD shows the relationship between two exponential moving averages of price.

## The three components

**MACD Line**: 12-period EMA minus 26-period EMA
**Signal Line**: 9-period EMA of the MACD Line
**Histogram**: MACD Line minus Signal Line (shows the distance between them)

Standard settings: (12, 26, 9) â€” used by most traders worldwide.

## The four main MACD signals

### 1. Signal line crossover (most common)

**Bullish crossover**: MACD Line crosses ABOVE Signal Line
â†’ Momentum turning bullish. Potential buy signal.

**Bearish crossover**: MACD Line crosses BELOW Signal Line
â†’ Momentum turning bearish. Potential sell signal.

Works best when confirmed by trend direction. A bullish MACD crossover below the zero line (while MACD is still negative) is a weaker signal than a crossover above zero.

### 2. Zero line crossover

**Bullish**: MACD Line crosses above zero
â†’ The 12 EMA is now above the 26 EMA. Trend has turned bullish.

**Bearish**: MACD Line crosses below zero
â†’ Trend has turned bearish.

Zero line crossovers are slower but more reliable than signal line crossovers.

### 3. MACD Divergence

Same logic as RSI divergence but applied to MACD:

**Bullish divergence**: Price makes lower low but MACD makes higher low â†’ weakening bearish momentum â†’ potential reversal.

**Bearish divergence**: Price makes higher high but MACD makes lower high â†’ weakening bullish momentum â†’ potential reversal.

MACD divergence on the weekly chart is one of the strongest technical signals available.

### 4. Histogram analysis

Growing histogram bars (positive) â†’ bullish momentum increasing
Shrinking histogram bars (positive but decreasing) â†’ bullish momentum weakening
Histogram crossing zero â†’ potential trend change

## MACD limitations

Like all lagging indicators, MACD works poorly in choppy, sideways markets. It generates many false crossovers when price is not trending.

## Combining RSI and MACD

Many traders use RSI and MACD together:
- RSI identifies overbought/oversold conditions and divergence
- MACD confirms the trend direction and provides entry timing
- When both agree â†’ stronger signal
- When they disagree â†’ wait or reduce position size',
7, 7, TRUE, FALSE),

(ta_level_id, 'Bollinger Bands â€” volatility, breakouts and mean reversion', 'bollinger-bands',
'# Bollinger Bands

## What are Bollinger Bands?

Developed by John Bollinger in the 1980s, **Bollinger Bands** consist of three lines:

1. **Middle Band**: 20-period Simple Moving Average
2. **Upper Band**: Middle Band + 2 standard deviations
3. **Lower Band**: Middle Band - 2 standard deviations

The bands expand when volatility increases and contract when volatility decreases.

**Statistical property**: Approximately 95% of price action occurs within the bands (2 standard deviations encompasses 95% of a normal distribution).

## The Bollinger Band Squeeze

When the bands narrow significantly (low volatility), it signals that a large move is coming â€” but the direction is not specified.

**The squeeze**: Bands contract to their narrowest point in months.
**The setup**: Wait for a decisive break out of the squeeze.
**The trade**: Enter in the direction of the breakout with a stop inside the squeeze range.

This is one of the highest probability setups in technical analysis because prolonged low volatility reliably precedes high volatility.

## Trading the bands

### Mean reversion (ranging markets)
In sideways markets, price tends to oscillate between the bands.

- Price touches upper band â†’ potential short or exit long
- Price touches lower band â†’ potential long or exit short
- Confirm with RSI (overbought at upper band, oversold at lower band)

### Trend trading (trending markets)
In strong trends, price "rides" one band.

- In strong uptrend, price stays near the upper band (bullish)
- Pullbacks to the middle band (20 SMA) are buy opportunities
- Breaking below the middle band in an uptrend = warning signal

### %B (Percent Bandwidth)
Measures where price is relative to the bands:
- %B = 1.0: Price at upper band
- %B = 0.5: Price at middle band
- %B = 0: Price at lower band
- %B > 1 or < 0: Price outside the bands (extreme)

## The "W" bottom and "M" top patterns

**W bottom (double bottom within bands)**:
1. Price touches lower band (first low)
2. Bounces to middle band
3. Falls again but does NOT touch or barely touches lower band (second low â€” higher than first)
4. %B higher on second low than first = bullish divergence
â†’ Strong buy signal

**M top (double top within bands)**: Mirror image â†’ strong sell signal

## Band width as volatility measure

Bandwidth = (Upper Band - Lower Band) / Middle Band Ã— 100

High bandwidth = high volatility (trending market)
Low bandwidth = low volatility (squeeze â€” move coming)',
7, 8, TRUE, FALSE),

(ta_level_id, 'Volume analysis â€” the fuel that drives price moves', 'volume-analysis',
'# Volume analysis

## Why volume matters

**Price tells you what is happening. Volume tells you why it is happening.**

Volume is the number of shares (or contracts) traded during a period. It represents the conviction behind price moves:

- Price rises on HIGH volume â†’ strong buying conviction â†’ move likely to continue
- Price rises on LOW volume â†’ weak buying â†’ move may be false or short-lived
- Price falls on HIGH volume â†’ strong selling conviction â†’ decline likely to continue
- Price falls on LOW volume â†’ weak selling â†’ support may hold, bounce likely

## The cardinal rule of volume analysis

**Volume should confirm price direction.**

When they disagree (divergence), be cautious â€” the price move may not be sustainable.

## Volume signals

### Breakout confirmation
When price breaks above resistance on high volume (2x+ average volume) â†’ genuine breakout, likely to continue.
When price breaks above resistance on low volume â†’ likely false breakout. Wait for volume confirmation.

### Volume climax (capitulation)
Extremely high volume after a prolonged downtrend often marks the bottom. This is panic selling â€” the last desperate sellers unloading. After a volume climax, the selling pressure has exhausted itself.

**Example**: During COVID crash (March 2020), NIFTY fell on massive volume for several weeks. The day of maximum volume marked the approximate bottom.

### Dry-up volume (no interest)
Very low volume after a decline suggests no selling pressure â€” sellers have left the market. This often precedes a reversal.

### Rising price + rising volume: Healthy uptrend
Rising price + falling volume: Uptrend losing momentum â€” potential reversal warning

## On-Balance Volume (OBV)

OBV is a cumulative volume indicator:
- Volume is added when price closes up
- Volume is subtracted when price closes down

**OBV rising while price is flat**: Accumulation â€” smart money buying quietly. Price likely to follow OBV higher.
**OBV falling while price is flat**: Distribution â€” smart money selling quietly. Price likely to follow OBV lower.

OBV divergence with price is one of the most reliable early warning signals.

## Volume in Indian markets

Indian traders watch:
- **Delivery percentage**: What % of total NSE volume resulted in actual delivery (not intraday). High delivery % during rallies signals genuine buying interest.
- **FII vs DII activity**: NSE publishes daily FII and DII buying/selling data. FII selling + price rally = potential weakness. DII buying + price decline = potential support.
- **NSE F&O open interest**: Rising open interest + rising price = bulls adding positions (bullish). Rising OI + falling price = bears adding shorts (bearish).',
7, 9, TRUE, FALSE),

(ta_level_id, 'Chart patterns â€” the formations that predict big moves', 'chart-patterns',
'# Chart patterns â€” formations that predict big moves

## Why chart patterns work

Chart patterns work because they represent recurring psychological dynamics:
- Accumulation (smart money quietly buying)
- Distribution (smart money quietly selling)
- Uncertainty resolved into new trends
- Failed breakouts trapping traders on the wrong side

## Reversal patterns â€” trend changes

### Head and Shoulders (bearish reversal)

The most reliable reversal pattern in technical analysis.

**Formation** (at market tops):
1. Left shoulder: Price rallies, then falls back
2. Head: Price rallies to a new high, then falls back to the neckline
3. Right shoulder: Price rallies to a lower high (same height as left shoulder), then falls
4. Neckline: The support level connecting the two troughs

**Trade**: Sell when price breaks below the neckline on high volume.
**Target**: Measure the distance from head to neckline, project downward from the neckline break.

**Inverse Head and Shoulders** (bullish reversal): Mirror image. Buy when price breaks above the neckline.

### Double Top (bearish)
Price reaches the same resistance level twice, fails to break through, and reverses.
**Trade**: Sell when price breaks below the trough between the two tops (neckline).

### Double Bottom (bullish)
Price falls to the same support level twice, bounces both times.
**Trade**: Buy when price breaks above the peak between the two bottoms (neckline).

## Continuation patterns â€” trend pauses

### Flags and Pennants

Flags and pennants are short-duration consolidation patterns that form after a strong price move (the "flagpole"). They represent a brief pause before the trend continues.

**Bull Flag**: After a sharp rise (flagpole), price consolidates in a downward-sloping channel (flag). When price breaks above the upper channel line, the trend continues.

**Target**: Add the flagpole height to the breakout point.

**Pennant**: Similar to a flag but consolidates in a symmetrical triangle rather than a channel.

### Ascending Triangle (bullish continuation)
- Horizontal resistance (sellers at fixed price)
- Rising support (buyers making higher lows)
- Buyers become more aggressive with each test of resistance
- **Break**: When price finally breaks above resistance on high volume â†’ bullish

### Descending Triangle (bearish continuation)
Mirror image of ascending triangle.

### Symmetrical Triangle
- Lower highs (descending resistance) + higher lows (ascending support)
- Neither buyers nor sellers dominating â€” standoff
- **Break**: In the direction of the prior trend (continuation) or against it (reversal)
- Wait for a decisive close beyond the triangle boundary

## Measuring targets

Most chart patterns have target measurements:

**Head and Shoulders**: Distance from head to neckline â†’ projected below neckline
**Double Top/Bottom**: Distance from top to neckline â†’ projected in breakout direction
**Triangle**: Width of the widest part of the triangle â†’ projected in breakout direction

These are minimum targets â€” price often travels further, but having a measured target helps set realistic take-profit levels.',
8, 10, TRUE, FALSE),

(ta_level_id, 'Fibonacci retracements â€” natural levels where trends pause and resume', 'fibonacci-retracements',
'# Fibonacci retracements

## The mathematics of nature in markets

The Fibonacci sequence (0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89...) and its ratios appear throughout nature â€” in the spiral of a nautilus shell, the arrangement of sunflower seeds, and the branching of trees.

These same ratios appear with surprising regularity in financial markets.

**Key Fibonacci ratios**:
- 0.236 (23.6%)
- 0.382 (38.2%)
- 0.500 (50%)
- 0.618 (61.8%) â† The golden ratio. Most important.
- 0.786 (78.6%)

## How to draw Fibonacci retracements

After identifying a significant swing move (from a clear swing low to a clear swing high, or vice versa):

1. Select the Fibonacci retracement tool
2. Click the swing low â†’ drag to the swing high (for uptrend pullbacks)
3. The tool automatically draws horizontal lines at each Fibonacci level

These levels act as potential support during pullbacks in an uptrend (or resistance during rallies in a downtrend).

## Why the levels work

When a trend pauses and retraces, traders debate: "Is this a healthy pullback or a reversal?"

The Fibonacci levels provide natural resting points for this uncertainty. So many traders watch the same levels that they become self-fulfilling:
- Buyers who missed the initial move place limit orders at 38.2% and 61.8% retracements
- Sellers who are short place stop losses just above these levels
- This concentration of orders creates natural support/resistance

## The three most important levels

**38.2% retracement**: Shallow pullback. Trend is very strong. Common in fast-moving bull markets.

**50% retracement**: The "halfway" level. Important psychological level even without Fibonacci mathematics.

**61.8% retracement**: The "golden ratio" retracement. The most watched level. Strong trends often retrace exactly to 61.8% before resuming.

## Fibonacci in Indian markets

NIFTY 50 bull market runs often provide textbook Fibonacci examples:
- NIFTY rally from 7,511 (2020 low) to 18,604 (2021 high)
- 61.8% retracement of this move = approximately 11,900
- NIFTY found support near this level during the 2022 correction

## Fibonacci extensions â€” targets for the next move

After a retracement, where does the trend go?

Fibonacci extensions project targets beyond the original high:
- 1.272 extension: First target after trend resumes
- 1.618 extension: Classic target â€” the golden ratio
- 2.618 extension: Extended target for powerful trends

These are widely used by swing traders to set take-profit levels.',
7, 11, TRUE, FALSE),

(ta_level_id, 'Multiple timeframe analysis â€” seeing the full picture', 'multiple-timeframe-analysis',
'# Multiple timeframe analysis

## The timeframe problem

A chart tells a completely different story depending on the timeframe.

NIFTY 50 on a 5-minute chart during a market crash: extreme bearish trend
NIFTY 50 on a monthly chart during the same crash: minor pullback in a long-term uptrend

Both are true simultaneously. Multiple timeframe analysis (MTFA) helps you understand where you are in the bigger picture.

## The three-timeframe approach

Professional traders typically analyse three timeframes simultaneously:

**Higher timeframe (HTF)**: Establishes the primary trend direction
**Intermediate timeframe (ITF)**: Identifies the specific entry opportunity
**Lower timeframe (LTF)**: Fine-tunes the precise entry point

## Common timeframe combinations

| Trading style | Higher TF | Intermediate TF | Lower TF |
|---|---|---|---|
| Position trader | Monthly | Weekly | Daily |
| Swing trader | Weekly | Daily | 4-hour |
| Day trader | Daily | 4-hour | 1-hour |
| Scalper | 1-hour | 15-min | 5-min |

## The process

**Step 1 (HTF)**: Identify the primary trend.
"On the weekly chart, NIFTY is in a clear uptrend â€” making higher highs and higher lows above the 50-week MA."

**Step 2 (ITF)**: Identify the opportunity within that trend.
"On the daily chart, NIFTY has pulled back to the 50-day MA and formed a bullish hammer."

**Step 3 (LTF)**: Execute precisely.
"On the 4-hour chart, price is showing a bullish engulfing at the 50 MA. RSI is turning from oversold. I will buy here with a stop below the recent swing low."

## The alignment principle

**Trade only when HTF and ITF align.**

If the weekly chart (HTF) is bearish but the daily chart (ITF) shows a potential bullish setup â€” this is a countertrend trade. Higher risk, lower probability.

If the weekly chart is bullish AND the daily chart is showing a bullish entry setup â€” this is a with-trend trade. Higher probability.

The best trades have 3 timeframes all agreeing:
- Monthly uptrend
- Weekly showing a pullback to support
- Daily showing a reversal candle at that support

## Practical example on USD/INR

**Monthly chart**: USD/INR in long-term uptrend (INR weakening trend over years)
**Daily chart**: USD/INR has pulled back to 83.00 support after reaching 84.50
**4-hour chart**: Bullish engulfing forming at 83.00 support zone, RSI at 35

This three-timeframe alignment gives a high-probability long trade on USD/INR.',
7, 12, TRUE, FALSE),

(ta_level_id, 'Building a complete trading system â€” rules, backtesting and execution', 'building-trading-system',
'# Building a complete trading system

## Why you need a system

A trading system is a set of complete, objective rules that tell you:
- When to enter a trade
- Where to place your stop loss
- Where to take profit
- How much to risk
- How to manage the trade once open

Without a system, you make emotional decisions in the heat of the market. With a system, you follow rules defined when you were calm and rational.

## The components of a trading system

### 1. Market and timeframe selection
What will you trade? (NIFTY futures, Reliance shares, USD/INR, Bank NIFTY options)
What timeframe? (Daily swing trades, 4-hour trades, 1-hour trades)

### 2. Trend filter
What defines the trend?
Example: "I only take long trades when price is above the 200-day SMA and the 50-day SMA is above the 200-day SMA."

### 3. Entry criteria
What specific conditions must be met before entering?
Example: "After the trend filter is bullish, I enter when:
- Price pulls back to the 50 EMA
- RSI falls to between 40-50 (pullback in uptrend)
- A bullish candlestick pattern forms at the 50 EMA
- The next candle opens higher than the pattern candle''s close"

### 4. Stop loss rules
Example: "Stop loss placed at 1 ATR (Average True Range) below the entry candle''s low."

### 5. Position sizing
Example: "Risk 1% of account per trade. Calculate position size: (Account Ã— 0.01) / (Entry - Stop loss) = number of shares."

### 6. Take profit rules
Example: "First target at 2x risk (2R). Move stop to break-even at 1R. Let remaining position run to next significant resistance."

### 7. Trade management rules
Example: "Do not check the trade more than twice per day. Do not move stop further from entry. Do not close early due to anxiety."

## Backtesting â€” testing your system on historical data

Before trading real money, test your system on historical charts.

**Manual backtesting**: Scroll back through historical charts and record every trade your system would have taken, then move forward candle by candle to see the result.

Record for each trade:
- Date, market, direction
- Entry price, stop loss, target
- Exit price and reason
- Result in R multiples (e.g. +2R, -1R)

After 50+ trades:
- Win rate (% of winning trades)
- Average win in R
- Average loss in R
- Expectancy = (Win rate Ã— Average win) - (Loss rate Ã— Average loss)
- Maximum drawdown

A system with expectancy > 0.5R per trade is worth forward testing with real money (starting very small).

## The system I am presenting: The 50 EMA Pullback System

**Market**: NIFTY 50 index (via futures or ETF)
**Timeframe**: Daily
**Trend filter**: Price above 200 SMA, 50 EMA above 200 SMA
**Entry**: Price pulls back to 50 EMA + RSI 40-50 + bullish candle
**Stop**: Below recent swing low
**Target**: Previous resistance or 2:1 R/R minimum
**Risk**: 1% per trade

This is a simple, well-documented system that has shown positive expectancy on Indian indices over multiple market cycles.',
9, 13, TRUE, FALSE),

(ta_level_id, 'Common technical analysis mistakes and how to avoid them', 'ta-mistakes',
'# Common technical analysis mistakes

## The pattern problem

Technical analysis is powerfully prone to misuse. Here are the mistakes that cost traders the most.

## Mistake 1: Finding patterns that are not there

The human brain is a pattern-recognition machine â€” it finds patterns even in random data.

Researchers have shown people charts of random price data and asked them to identify patterns. They confidently identify head and shoulders, flags, double tops â€” in completely random data.

**Solution**: Only trade patterns that are clear and obvious. If you have to squint to see the pattern, it is not there. Use a checklist: would another experienced technical analyst looking at this chart independently identify the same pattern?

## Mistake 2: Ignoring trend context

A "bullish reversal" signal in the middle of a strong downtrend is much less reliable than the same signal at a long-term support level in an overall uptrend.

**Solution**: Always establish the higher timeframe trend before looking for signals. Countertrend trades are much lower probability.

## Mistake 3: Using too many indicators

Adding more indicators does not add certainty â€” it adds confusion. When 5 indicators all say different things, paralysis follows.

The most productive traders use 2-3 indicators maximum: usually one trend indicator (moving average), one momentum indicator (RSI or MACD), and they confirm with volume.

**Solution**: Pick 2 indicators. Learn them deeply. Stick with them.

## Mistake 4: Ignoring stop losses because "I know it will come back"

Technical analysis is a probability tool, not a guarantee. Every setup fails sometimes. The only protection is proper stop loss placement.

**Solution**: If you cannot define where the trade is wrong, you should not be in the trade.

## Mistake 5: Changing the system after every loss

Every system has losing periods. A string of 5 losses does not mean the system is broken â€” it may just be a normal losing streak. The worst thing you can do is abandon a valid system after a normal drawdown and switch to a new system (which you will also abandon after its next losing streak).

**Solution**: Commit to a system for minimum 50 trades before evaluating it statistically.

## Mistake 6: Confusing timeframes

Seeing a bullish signal on a 5-minute chart while the daily chart is in a strong downtrend. The 5-minute signal is a counter-trend trade in a bearish environment.

**Solution**: Always establish trend on the higher timeframe first. Lower timeframe signals only valid when they align with higher timeframe direction.

## Mistake 7: Not accounting for upcoming news events

A perfect technical setup on Bank NIFTY the day before RBI''s monetary policy decision. The decision moves the market 3% against your trade, blowing through your stop.

**Solution**: Check the economic calendar. Reduce position size or avoid trading around major event risk.',
7, 14, TRUE, FALSE),

(ta_level_id, 'Technical analysis recap â€” your complete trading toolkit', 'ta-recap',
'# Technical analysis recap

## What you have mastered

You now have a complete technical analysis toolkit that professional traders use. Here is a reference guide for every concept.

## Price action foundations

**Candlesticks**: Hammer (bullish reversal at support), Shooting star (bearish reversal at resistance), Doji (indecision), Bullish/Bearish engulfing (reversal signals). Always confirm with location and volume.

**Support and resistance**: Horizontal levels where price has repeatedly reversed. Broken support becomes resistance and vice versa. Zones are more reliable than precise lines.

**Trend lines**: Connect swing highs (downtrend) or swing lows (uptrend). Minimum 2 touches. More touches = stronger line. Break of trend line signals potential change.

## Indicators

| Indicator | Type | Primary use |
|---|---|---|
| Moving averages (20, 50, 200) | Trend | Direction, dynamic S/R, crossover signals |
| RSI (14) | Momentum | Overbought/oversold, divergence |
| MACD (12,26,9) | Trend + Momentum | Crossovers, divergence, zero line |
| Bollinger Bands (20, 2) | Volatility | Squeeze breakouts, mean reversion |
| Volume | Confirmation | Confirm breakouts, spot accumulation/distribution |

## Patterns

**Reversal**: Head and Shoulders, Double Top, Double Bottom, Inverse H&S
**Continuation**: Bull Flag, Bear Flag, Pennant, Ascending Triangle, Descending Triangle, Symmetrical Triangle

**Pattern measurement**: All major patterns have measured targets. Height of pattern projected in breakout direction.

## Advanced tools

**Fibonacci**: 38.2%, 50%, 61.8% retracements as pullback targets. 1.618 extension as profit target.

**Multiple timeframe analysis**: HTF for trend â†’ ITF for setup â†’ LTF for execution. All three should align for highest probability.

## The trading system components

1. Market and timeframe selection
2. Trend filter
3. Entry criteria (specific, objective)
4. Stop loss (always)
5. Position sizing (1-2% account risk maximum)
6. Take profit rules
7. Trade management rules

## The 3 rules that matter most

**Rule 1**: Always trade with the higher timeframe trend.
**Rule 2**: Never trade without a stop loss.
**Rule 3**: Risk no more than 1-2% of your account per trade.

Everything else in technical analysis serves these three rules.

## Your immediate action steps

1. Open TradingView (tradingview.com) â€” free account is sufficient
2. Add NIFTY 50 (NSE:NIFTY) or USD/INR (NSE:USDINR)
3. Switch to daily chart
4. Identify the current trend (above or below 200 SMA?)
5. Draw support and resistance levels
6. Add RSI and MACD
7. Practice identifying the patterns covered in this level

Take the final quiz to complete this level and earn your Technical Analysis certificate. Then apply your skills in the Forex Paper Trading simulator.',
7, 15, TRUE, FALSE);

END IF;

END $$;

-- Quizzes for first 5 TA lessons
DO $$
DECLARE
  l1 UUID; l2 UUID; l3 UUID; l4 UUID; l5 UUID;
  q1 UUID; q2 UUID; q3 UUID; q4 UUID; q5 UUID;
BEGIN
  SELECT id INTO l1 FROM lessons WHERE slug = 'intro-technical-analysis';
  SELECT id INTO l2 FROM lessons WHERE slug = 'candlestick-charts';
  SELECT id INTO l3 FROM lessons WHERE slug = 'support-resistance';
  SELECT id INTO l4 FROM lessons WHERE slug = 'trendlines-channels';
  SELECT id INTO l5 FROM lessons WHERE slug = 'moving-averages';

  IF l1 IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM quizzes WHERE lesson_id = l1
  ) THEN
    -- Run quiz inserts only when the first quiz has not already been seeded.
  INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l1, 'TA Introduction', 70) RETURNING id INTO q1;
  INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
  (q1, 'What is the core assumption of technical analysis?',
  '["Company fundamentals predict price", "All known information is already reflected in the current price", "Only earnings matter to price", "Charts predict news events"]',
  1, 'The efficient market hypothesis in technical analysis states that all available information is already discounted in the current price. Therefore, studying price and volume is sufficient without needing to analyse fundamentals.', 1),
  (q1, 'Which statement best describes when technical analysis works best?',
  '["It works perfectly in all market conditions", "It works well in trending markets; less reliably in choppy, directionless markets", "It only works in bear markets", "It never actually works"]',
  1, 'Technical analysis tools like moving averages and trend-following strategies perform best in clearly trending markets. In choppy, sideways markets, they generate many false signals. Understanding the market environment is key to applying TA correctly.', 2),
  (q1, 'What is the main difference between technical analysis and fundamental analysis?',
  '["Technical analysis is more accurate", "Technical analysis studies price/volume for timing; fundamental analysis studies business health for selection", "Fundamental analysis is only for professionals", "They study the same things in different ways"]',
  1, 'Fundamental analysis answers "what to buy" (is this a good business?). Technical analysis answers "when and where to buy" (is now a good time? where is the entry?). The most complete approach uses both.', 3);

  INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l2, 'Candlestick Charts', 70) RETURNING id INTO q2;
  INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
  (q2, 'A candlestick has a small body at the top and a long lower wick (2x+ the body size) with almost no upper wick. It appears after a downtrend. What is this pattern called and what does it signal?',
  '["Shooting star â€” bearish reversal", "Doji â€” indecision", "Hammer â€” bullish reversal signal", "Marubozu â€” strong trend continuation"]',
  2, 'A Hammer has a small body at the top and a long lower wick, found after a downtrend. The long lower wick shows sellers pushed price down during the period, but buyers stepped in and drove it back up. This buyer strength is a bullish reversal signal.', 1),
  (q2, 'What does a Doji candlestick indicate?',
  '["Strong bullish momentum", "Perfect indecision â€” open and close are nearly equal, signalling potential reversal", "A breakdown in progress", "High volume confirmation"]',
  1, 'A Doji has almost no body because the opening and closing prices are virtually the same. This represents perfect equilibrium between buyers and sellers â€” neither won. It signals indecision and potential trend reversal, especially meaningful after a sustained trend.', 2),
  (q2, 'A Bullish Engulfing pattern appears at a key support level after a 3-week decline. What should a technical analyst do?',
  '["Immediately sell", "Look for confirmation (volume, next candle, RSI) and consider a long entry if confirmed", "Ignore it â€” single patterns are never reliable", "Wait 2 weeks before acting"]',
  1, 'A Bullish Engulfing at key support is a high-probability signal. But confirmation is essential: was volume high? Did the next candle open higher? Is RSI showing oversold or divergence? Location (key support) + pattern + volume confirmation = tradeable signal.', 3);

  INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l3, 'Support and Resistance', 70) RETURNING id INTO q3;
  INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
  (q3, 'NIFTY 50 has bounced from 21,000 three times over 6 months. What is 21,000?',
  '["A resistance level", "A support level that has been tested 3 times â€” stronger with each test", "An arbitrary number", "A Fibonacci level"]',
  1, '21,000 is a strong support level. Three successful bounces from the same level confirm that significant buying demand exists at this price. More touches = stronger support, because more traders have reinforced that level in their thinking.', 1),
  (q3, 'NIFTY finally breaks below 21,000 with strong momentum and high volume. What has likely happened to this level?',
  '["21,000 remains strong support", "21,000 has now become resistance (role reversal)", "The level is now irrelevant", "21,000 becomes stronger support"]',
  1, 'Role reversal: when support breaks, it typically becomes resistance. Traders who bought at 21,000 support are now holding losing positions and will sell when price returns to 21,000 to "get out at break-even." This selling pressure makes 21,000 a resistance level.', 2),
  (q3, 'What makes a support or resistance level stronger?',
  '["Being on a stock that is in the news", "Multiple touches over time, high volume reactions, alignment with moving averages, and round numbers", "Only very recent levels matter", "Levels are equally strong regardless of characteristics"]',
  1, 'Strong S&R levels have multiple characteristics: 3+ price tests, strong reactions (large moves) at the level, high volume at those reactions, alignment with a major moving average, and round number psychology. All these factors reflect concentrated trader attention at that level.', 3);

  INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l4, 'Trendlines and Channels', 70) RETURNING id INTO q4;
  INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
  (q4, 'How do you draw an uptrend line correctly?',
  '["Connect the highest points (swing highs)", "Connect the lowest points (swing lows) â€” each lower than the previous", "Connect the highest points (swing highs) in ascending order", "Connect a series of higher swing lows"]',
  3, 'An uptrend is defined by higher highs AND higher lows. The uptrend LINE connects the series of higher swing lows. This line acts as dynamic support â€” in an uptrend, pullbacks to this line are buying opportunities.', 1),
  (q4, 'What is an ascending channel and how would you trade it?',
  '["Two parallel horizontal lines â€” buy at bottom, sell at top", "Two parallel upward-sloping lines â€” buy at lower channel (support), sell at upper channel (resistance)", "Two converging lines pointing up â€” buy the breakout", "A single uptrend line â€” always buy"]',
  1, 'An ascending channel has two parallel upward-sloping trendlines. The lower line connects swing lows (support), the upper line connects swing highs (resistance). Trading: buy near the lower line with a target of the upper line. Trend direction is bullish.', 2),
  (q4, 'Price has been in an uptrend for months with a clear uptrend line. Today, price closes strongly below the uptrend line on 3x average volume. What does this signal?',
  '["Buy â€” it will bounce back quickly", "Continue holding â€” this is normal volatility", "Potential trend change â€” the uptrend may be breaking down, reduce or exit long positions", "The stock will recover tomorrow"]',
  2, 'A strong close below a major trendline on high volume is a significant bearish signal. The trendline support has broken with conviction. This signals a potential trend change. Risk management calls for reducing position or moving stop losses closer.', 3);

  INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l5, 'Moving Averages', 70) RETURNING id INTO q5;
  INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
  (q5, 'What is a Golden Cross and what does it signal?',
  '["The 50 SMA crossing below the 200 SMA â€” bearish", "The 50 SMA crossing above the 200 SMA â€” bullish long-term signal", "The price crossing above the 200 SMA", "The RSI reaching 70"]',
  1, 'A Golden Cross occurs when the 50-period SMA crosses above the 200-period SMA. Since the 200 SMA represents the long-term trend, this crossover signals a shift to a long-term bullish environment and has historically preceded extended bull runs.', 1),
  (q5, 'In a strong uptrend, a stock pulls back from its highs and touches the 50-day EMA for the second time. RSI is at 45. What would a trend-following trader consider doing?',
  '["Sell â€” the stock is falling", "Consider a long entry â€” 50 EMA is dynamic support in uptrend, RSI shows a healthy pullback not extreme oversold", "Wait for price to fall to 200 SMA", "This situation provides no information"]',
  1, 'In uptrends, the 50-day EMA acts as dynamic support. Pullbacks to the 50 EMA with RSI between 40-50 (healthy correction, not crash) are classic buying opportunities for trend-following traders. This is one of the highest-probability setups in technical analysis.', 2),
  (q5, 'Why are moving averages called "lagging indicators"?',
  '["They predict future prices", "They are calculated using past prices, so they confirm what has already happened rather than predicting the future", "They update once per week", "They are less accurate than other tools"]',
  1, 'Moving averages are based on past closing prices â€” they can only reflect what has already happened. A 50-day SMA turns bullish after 50 days of price data, not before the trend started. This lag is the trade-off for the noise-reduction benefit they provide.', 3);
  END IF;
END $$;


