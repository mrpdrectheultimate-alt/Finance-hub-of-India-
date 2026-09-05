-- ============================================================
-- FinanceHub — Lesson Expansion Phase 2 (Part 1 / Core Batch)
-- Focus: Options, Derivatives, SGBs, REITs, Cap Tables,
--        Quant Basics, Corporate Finance & Tax Mastery
-- Run AFTER lesson_expansion_phase1.sql
-- Uses WHERE NOT EXISTS to be safely idempotent
-- ============================================================

DO $$
DECLARE
  tm_id      UUID;
  crypto_id  UUID;
  corp_id    UUID;
  beh_id     UUID;
  forex_id   UUID;
  ta_id      UUID;
  pf_int_id  UUID;
  pf_beg_id  UUID;
  v_total    INT;
BEGIN
  -- Resilient ID lookups
  SELECT lv.id INTO tm_id     FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug IN ('trading-markets', 'trading', 'stock-market') AND lv.slug IN ('markets-101', 'beginner') LIMIT 1;
  SELECT lv.id INTO crypto_id FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug IN ('crypto-defi', 'crypto') AND lv.slug IN ('crypto-basics', 'what-is-crypto', 'beginner') LIMIT 1;
  SELECT lv.id INTO corp_id   FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug = 'corporate-finance' AND lv.slug IN ('business-basics', 'beginner') LIMIT 1;
  SELECT lv.id INTO beh_id    FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug = 'behavioral-finance' AND lv.slug IN ('money-psychology', 'beginner') LIMIT 1;
  SELECT lv.id INTO forex_id  FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug IN ('forex-currency', 'forex') AND lv.slug IN ('forex-basics', 'beginner') LIMIT 1;
  SELECT lv.id INTO ta_id     FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug = 'technical-analysis' AND lv.slug IN ('chart-reading-fundamentals', 'beginner') LIMIT 1;
  SELECT lv.id INTO pf_int_id FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug = 'personal-finance' AND lv.slug IN ('personal-finance-intermediate', 'intermediate') LIMIT 1;
  SELECT lv.id INTO pf_beg_id FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug = 'personal-finance' AND lv.slug IN ('beginner', 'absolute-beginner') LIMIT 1;

-- ═══════════════════════════════════════════════════════════
-- TRADING MARKETS — 12 new lessons
-- ═══════════════════════════════════════════════════════════

IF tm_id IS NOT NULL THEN
  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT tm_id,
    'Options trading — calls puts and why they are not as scary as you think',
    'options-trading-calls-puts',
  '# Options trading — calls and puts

## What is an option?

An option is a contract that gives you the **right, but not the obligation**, to buy or sell an asset at a specific price (called the strike price) before or on a specific date (called the expiry).

The key word is **right** — not obligation. If the option is unfavourable, you simply let it expire. Your maximum loss is the premium you paid.

## The two types

### Call option
Gives you the right to **buy** the underlying asset at the strike price.

You buy a call when you expect the price to **rise**.

**Example**: NIFTY is at 22,000. You buy a 22,500 Call at ₹150 premium (expiry: 1 month).
- If NIFTY rises to 23,000: Your call is worth ₹500. Profit = ₹500 − ₹150 = ₹350 (233% return)
- If NIFTY stays below 22,500: Call expires worthless. Loss = ₹150 premium only.

### Put option
Gives you the right to **sell** the underlying asset at the strike price.

You buy a put when you expect the price to **fall**.

**Example**: NIFTY is at 22,000. You buy a 21,500 Put at ₹120 premium.
- If NIFTY falls to 21,000: Your put is worth ₹500. Profit = ₹500 − ₹120 = ₹380
- If NIFTY stays above 21,500: Put expires worthless. Loss = ₹120 only.

## Key option terminology

**Strike price (K)**: The price at which you can buy/sell the underlying.
**Premium**: The price you pay for the option contract. Your maximum loss as a buyer.
**Expiry**: Date the option ceases to exist. Indian options expire on the last Thursday of each month (monthly) or every Thursday (weekly Bank NIFTY).
**Lot size**: NSE options trade in lots. NIFTY: 50 units per lot. Bank NIFTY: 25 per lot.

**In the money (ITM)**: Option has intrinsic value. Call ITM when underlying > strike. Put ITM when underlying < strike.
**At the money (ATM)**: Strike ≈ current price.
**Out of the money (OTM)**: Option has no intrinsic value but has time value.

## Why options are powerful (and dangerous)

**As a buyer**: Maximum loss = premium paid. Potential gain = unlimited (calls) or until asset → 0 (puts). Leverage without margin calls.

**As a seller**: Maximum gain = premium received. Potential loss = unlimited (calls) or large (puts). High win rate (70%+ of options expire worthless) but catastrophic losses possible.

**The statistic**: SEBI data shows ~89% of individual F&O traders lost money over a 3-year period. Most losses came from option selling without proper risk management, and option buying on expiry day (excessive time decay).

## The right way to use options for most people

**Portfolio protection (buying puts)**: Own ₹10 lakh of equities. Buy put options as insurance against market crash. Small cost, large protection.

**Covered calls**: You own shares. Sell call options against them to generate monthly income. Limited downside to this strategy.

**Avoid**: Naked option selling, buying far OTM options on expiry day, using borrowed money for options.',
  9, 24, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = tm_id AND slug = 'options-trading-calls-puts');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT tm_id,
    'The Greeks — Delta, Gamma, Theta, Vega explained simply',
    'options-greeks-explained',
  '# The Options Greeks

## Why Greeks matter

Options prices are not just driven by whether the stock goes up or down. Four forces simultaneously affect an option''s price:

1. Direction of underlying (Delta)
2. Rate of change of direction (Gamma)
3. Passage of time (Theta)
4. Changes in volatility (Vega)

The Greeks measure these sensitivities. Understanding them separates educated options traders from gamblers.

## Delta (Δ) — the direction measure

Delta measures how much an option''s price changes for a ₹1 move in the underlying.

**Call delta**: 0 to +1
**Put delta**: -1 to 0

ATM option: Delta ≈ 0.5 (option moves ₹0.50 for every ₹1 in the underlying)
Deep ITM option: Delta approaches 1 (moves nearly 1:1 with underlying)
Far OTM option: Delta approaches 0 (barely moves with underlying)

**Practical use**: If you buy a NIFTY call with delta 0.5 and NIFTY rises 100 points, your call gains approximately ₹50 (× lot size = ₹2,500 per lot).

**Delta as probability proxy**: An option with delta 0.3 has approximately 30% probability of expiring ITM.

## Theta (Θ) — the time decay enemy

Theta measures how much an option loses value each day purely from the passage of time.

Theta is always negative for option buyers. Every single day, even if the underlying does not move, your option loses value.

ATM option with 30 days to expiry: Theta ≈ -₹50/day (loses ₹50 value each day)

**Theta acceleration**: Time decay is not linear. It accelerates sharply in the last 7-10 days before expiry. An ATM option that was losing ₹20/day with 30 days remaining may lose ₹100+/day in the final week.

This is why buying OTM options on expiry day is extremely dangerous — theta is destroying their value by the hour.

**For option sellers**: Theta is your friend. You earn theta every day you hold a short option position.

## Vega (ν) — the volatility sensitivity

Vega measures how much an option''s price changes for a 1% change in implied volatility (IV).

Higher volatility = more expensive options (more uncertainty = more value to the option).

**Practical implication**: Buy options before volatility spikes (events like budget, election results, earnings). Sell options after volatility spikes (IV crush).

When NIFTY VIX (volatility index) is high (>20), option premiums are expensive. Buying expensive options requires a large move to be profitable.

## Gamma (Γ) — the acceleration

Gamma measures the rate of change of Delta. It tells you how quickly your Delta exposure changes.

ATM options have the highest Gamma. Deep ITM/OTM have low Gamma.

High Gamma = your position''s risk changes rapidly with price moves. Important for risk management, especially for sellers.

## The practical takeaway

**Option buyers need**: Large, fast price moves (high Delta) before time decay destroys value (Theta). Buy options when IV is low.

**Option sellers need**: Time to pass (earn Theta), volatility to fall (earn Vega), and careful Gamma management. Sell options when IV is high.',
  9, 25, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = tm_id AND slug = 'options-greeks-explained');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT tm_id,
    'Options strategies — Covered Call, Bull Call Spread, and Iron Condor',
    'options-strategies-basics',
  '# Options strategies for beginners

## Why use strategies instead of simple calls/puts?

Buying a simple call or put exposes you to unlimited theta decay and requires a large, fast move to profit.

Multi-leg strategies define your maximum profit AND maximum loss upfront, reduce theta exposure, and allow you to profit in sideways markets.

## Strategy 1: Covered Call (income generation)

**Who it''s for**: Long-term equity investors who want monthly income.

**Setup**:
- Own 50+ shares of a stock (or 1 NIFTY ETF lot)
- Sell 1 OTM call against your position

**Example**: Own TCS at ₹3,800. Sell ₹4,000 Call for ₹80 premium.
- Maximum profit: ₹80 premium + ₹200 capital gain (if TCS reaches ₹4,000) = ₹280
- Maximum loss: Offset by ₹80 premium received (reduces your downside by ₹80/share)
- Breakeven: ₹3,800 − ₹80 = ₹3,720

**When it fails**: Stock rallies far above ₹4,000 — you miss the upside above your strike.

**Best used**: In sideways to slightly bullish markets. Generates 1-3% monthly income on your equity holding.

## Strategy 2: Bull Call Spread (defined risk bullish bet)

**Setup**:
- Buy 1 lower-strike call (ATM or slightly ITM)
- Sell 1 higher-strike call (OTM)

**Example**: NIFTY at 22,000.
- Buy 22,000 Call at ₹300
- Sell 22,500 Call at ₹150
- Net debit: ₹150 (maximum loss)
- Maximum profit: ₹500 − ₹150 = ₹350 (if NIFTY ≥ 22,500 at expiry)

**Advantage over simple call**: Lower cost (₹150 vs ₹300), lower theta decay.
**Disadvantage**: Caps maximum profit at the spread width.

**Best used**: Moderately bullish view. Want cheaper entry than buying a call outright.

## Strategy 3: Iron Condor (profit from sideways markets)

**Setup**:
- Sell 1 OTM put + Buy 1 further OTM put (put credit spread)
- Sell 1 OTM call + Buy 1 further OTM call (call credit spread)

**Example**: NIFTY at 22,000. Expect NIFTY stays between 21,000 and 23,000.
- Sell 21,500 Put, Buy 21,000 Put
- Sell 22,500 Call, Buy 23,000 Call
- Net credit received: ₹200

Maximum profit: ₹200 (if NIFTY stays between 21,500 and 22,500)
Maximum loss: ₹500 − ₹200 = ₹300

**Best used**: Low volatility expected. Market stuck in a range.
**Risk**: A sharp breakout in either direction causes maximum loss.',
  9, 26, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = tm_id AND slug = 'options-strategies-basics');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT tm_id,
    'Sovereign Gold Bonds — the smartest way to own gold in India',
    'sovereign-gold-bonds',
  '# Sovereign Gold Bonds (SGBs)

## What are SGBs?

Sovereign Gold Bonds are government securities denominated in grams of gold. Issued by RBI on behalf of the Government of India.

They offer the returns of physical gold **plus** 2.5% annual interest — making them strictly superior to physical gold or gold ETFs for most investors.

## The triple advantage over physical gold

| Feature | Physical Gold | Gold ETF | Sovereign Gold Bond |
|---------|--------------|----------|-------------------|
| Making charges | 10-25% lost | None | None |
| Storage cost | Locker fees | 0.5-1% p.a. | None |
| Interest | None | None | **2.5% p.a. paid semi-annually** |
| Capital gains tax | 20% LTCG with indexation | 20% LTCG | **Zero tax if held to maturity** |
| Purity risk | Yes | None | None |
| Ease of purchase | Moderate | Easy | Easy (bank/post office/broker) |

## How SGBs work

**Issue price**: Linked to average gold price for the week before issue (IBJA rates). Small ₹50/gram discount if subscribing online.

**Tenure**: 8 years. Exit option from 5th year on interest payment dates.

**Interest**: 2.5% per annum on issue price (not current price). Paid semi-annually to your bank account.

**Redemption**: At prevailing gold price at the time. Capital gains on redemption after 8 years: **completely tax-free**.

**Minimum**: 1 gram. Maximum: 4 kg per financial year (individual).

## The mathematics

₹1 lakh invested in SGB when gold = ₹5,000/gram (20 grams):
- Annual interest: ₹2,500 (2.5% of ₹1 lakh)
- 8-year interest: ₹20,000 received tax-free
- If gold price doubles to ₹10,000/gram after 8 years: Redemption = ₹2,00,000
- Total return: ₹2,00,000 + ₹20,000 interest = ₹2,20,000 on ₹1 lakh
- Capital gain: Zero tax

Equivalent physical gold: ₹2,00,000 capital gain taxed at 20% = ₹40,000 tax. Net = ₹1,60,000.

**SGB advantage: ₹2,20,000 vs ₹1,60,000 for identical gold exposure.**

## When to buy SGBs

SGBs are issued in tranches (usually 6-8 per year). Subscribe during RBI issue windows for the discount. Alternatively, buy existing SGBs on NSE/BSE in the secondary market — sometimes at a discount to gold price.

**Check**: SGBs trade on NSE under names like SGBNOV28 (series, month, year of maturity). Secondary market liquidity is lower than ETFs.

## Who should hold SGBs

Everyone who wants gold exposure in their portfolio (recommended 5-15% of investments). Hold until 8-year maturity for zero tax. Do not invest gold you may need within 5 years — use Gold ETFs instead for flexibility.',
  8, 27, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = tm_id AND slug = 'sovereign-gold-bonds');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT tm_id,
    'REITs — how to invest in real estate without buying property',
    'reits-explained',
  '# REITs — Real Estate Investment Trusts

## What is a REIT?

A REIT is a company that owns and operates income-generating real estate — office buildings, malls, warehouses, hotels. It must distribute at least 90% of its income as dividends to unitholders.

REITs let you invest in commercial real estate with ₹10,000-₹15,000 (minimum one lot) instead of crores.

## Indian REITs (2024)

India currently has 4 listed REITs:

**Embassy REIT**: Largest. Owns 45+ million sq ft of office space in Bengaluru, Mumbai, Pune, NCR. Tenants: JP Morgan, Google, IBM, Microsoft.

**Mindspace Business Parks REIT**: Owns 31 million sq ft of office parks. Hyderabad, Mumbai, Chennai, Pune.

**Brookfield India REIT**: 51 million sq ft across Delhi-NCR, Mumbai, Kolkata, Pune.

**Nexus Select Trust** (Retail REIT): Owns shopping malls across India. First retail REIT.

## How REIT returns work

**Distributions (dividends)**: Minimum 90% of net distributable cash flow paid quarterly. Current yield: 6-8% annually for Indian REITs.

**Capital appreciation**: REIT unit price rises as property values increase and rental incomes grow.

**Total return**: Distribution yield + capital appreciation. Historical Indian REIT total returns: 10-14% annually.

## REITs vs direct real estate

| | Direct Real Estate | REIT |
|--|--|--|
| Minimum investment | ₹50 lakh+ | ₹10,000-15,000 |
| Liquidity | Months to sell | Sell on stock exchange instantly |
| Diversification | 1 property | 30-50 properties |
| Rental hassle | You manage | Professional management |
| Transparency | Opaque | SEBI-regulated, quarterly reports |
| Yield | 2-3% (residential) | 6-8% |
| Leverage risk | Your problem | Managed by REIT |

## Taxation of REIT distributions

REIT distributions have complex tax treatment:
- **Dividend component**: Taxed at your income slab
- **Interest component**: Taxed at your income slab
- **Return of capital**: Not taxed (reduces cost basis)
- **Capital gains on units**: 10% LTCG (held >3 years)

Always check the annual distribution breakdown in REIT reports for precise tax calculation.

## Who should invest in REITs

- Investors wanting real estate exposure without crores of capital
- Those wanting higher yield than savings accounts with some growth potential
- Investors building a diversified income portfolio (equity + debt + gold + REIT)
- Not suitable for those needing capital within 3 years (some price volatility)

## How to buy

REITs trade on NSE like regular stocks. Buy through any demat account. Minimum 1 unit (currently ₹250-400 per unit, but typically sold in lots).',
  8, 28, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = tm_id AND slug = 'reits-explained');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT tm_id,
    'Short selling — how to profit when stocks fall',
    'short-selling-explained',
  '# Short selling

## What is short selling?

Short selling is selling shares you do not own, with the intention of buying them back later at a lower price.

Normal investing: Buy low → sell high (profit from rising prices)
Short selling: Sell high → buy low (profit from falling prices)

## How short selling works mechanically

1. You borrow 100 shares of Reliance from your broker (broker lends from their inventory)
2. You sell them immediately at ₹2,800 each = receive ₹2,80,000
3. Reliance falls to ₹2,400 as you expected
4. You buy 100 shares at ₹2,400 = pay ₹2,40,000
5. Return borrowed shares to broker
6. Profit: ₹2,80,000 − ₹2,40,000 = ₹40,000 (minus borrowing cost)

## Short selling in India — two ways

### Intraday shorting (most common for retail)
Sell a stock in the morning, buy it back before market close (3:30 PM). Broker provides the shares automatically. Must close same day. Most retail short selling in India is intraday.

### Short via futures
Sell a futures contract (no share borrowing needed). Hold position for days or weeks. Used by more sophisticated traders for multi-day short positions.

### Securities Lending and Borrowing (SLB)
SEBI-approved mechanism to borrow actual shares for multi-day shorting. Complex, limited participation.

## The mathematics of short selling risk

**Long position**: Buy 100 shares at ₹100. Maximum loss = ₹10,000 (if price → 0). Maximum gain = unlimited.

**Short position**: Sell 100 shares at ₹100. Maximum gain = ₹10,000 (if price → 0). **Maximum loss = UNLIMITED** (price could rise to ₹200, ₹300, ₹1,000...).

This asymmetric risk profile makes unhedged short selling dangerous. A stock can fall 100% at most but can rise infinitely.

## Short squeeze — the short seller''s nightmare

When a heavily shorted stock rises sharply, short sellers face mounting losses and are forced to buy to cover — which drives the price even higher, forcing more short sellers to cover.

GameStop (2021): Reddit retail investors identified heavily shorted stocks. Coordinated buying caused a short squeeze. GME rose from $20 to $480 in weeks. Hedge funds lost billions.

## Legitimate uses of short selling

**Hedging**: You own ₹10 lakh of equities. Sell NIFTY futures to hedge against market decline. Your long portfolio falls but your short position profits.

**Pairs trading**: Go long a strong stock, short a weak one in the same sector. Profit from relative performance regardless of market direction.

**Price discovery**: Short sellers provide a valuable function — they identify overvalued stocks and push prices toward fair value.',
  8, 29, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = tm_id AND slug = 'short-selling-explained');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT tm_id,
    'Futures trading — understanding leverage, margins, and contracts',
    'futures-trading-basics',
  '# Futures trading

## What is a futures contract?

A futures contract is an agreement to buy or sell an asset at a predetermined price on a specific future date.

Unlike options, futures create an **obligation** — both parties must fulfill the contract (or close the position before expiry).

## Indian equity futures

**NIFTY 50 Futures**: Most liquid. Lot size: 50 units. If NIFTY = 22,000, 1 lot = ₹11,00,000 contract value.
**Bank NIFTY Futures**: Banking sector index. Lot size: 25 units.
**Stock futures**: Available on ~200 large-cap stocks. Lot sizes vary.

Monthly expiry: Last Thursday of each month.
Weekly expiry: Every Thursday for Bank NIFTY and NIFTY.

## How leverage works in futures

You do not pay the full contract value. Instead, you pay an **initial margin** (approximately 10-15% of contract value).

NIFTY futures at 22,000:
- Contract value: 22,000 × 50 = ₹11,00,000
- Initial margin required: ~₹1,20,000 (≈ 11%)
- Effective leverage: ~9x

If NIFTY rises 1% (220 points): Profit = 220 × 50 = ₹11,000 on ₹1,20,000 margin = 9.2% return.
If NIFTY falls 1%: Loss = ₹11,000 = 9.2% of margin.

**Mark to market (MTM)**: Futures are settled daily. Profits credited to your account daily. Losses debited. If losses erode your margin below the maintenance margin level, you receive a margin call and must add funds immediately or the broker will square off your position.

## Futures vs options — key differences

| | Futures | Options (buying) |
|--|--|--|
| Obligation | Must fulfill | Right, not obligation |
| Premium | No premium | Premium paid upfront |
| Maximum loss | Unlimited (both sides) | Limited to premium |
| Theta decay | None | Hurts buyer daily |
| Margin call | Yes | No (premium fully paid) |

## Basis and convergence

**Spot price**: Current market price.
**Futures price**: Usually slightly above spot (due to cost of carry: interest + dividends).
**Basis**: Futures price − Spot price.

As expiry approaches, basis converges to zero. On expiry day, futures price = spot price.

## Rollover

If you want to maintain a position beyond expiry, you must "roll over" — close your expiring contract and open the next month''s contract. This involves a small cost (bid-ask spread + any basis change).

## Who should trade futures?

Futures are suitable for:
- Hedging an existing portfolio (selling index futures against equity holdings)
- Sophisticated traders with strong risk management
- Arbitrageurs exploiting price differences

Not suitable for:
- Beginners (complexity + leverage + margin calls)
- Anyone risking more than they can afford to lose
- Those who cannot monitor positions throughout the trading session',
  9, 30, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = tm_id AND slug = 'futures-trading-basics');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT tm_id,
    'Implied volatility — the market''s fear gauge explained',
    'implied-volatility-explained',
  '# Implied Volatility

## What is implied volatility?

Implied volatility (IV) is the market''s collective forecast of how much a security will move over the next year, expressed as an annualised percentage.

IV is "implied" because it is derived backwards from the current option price. If an option is expensive, IV is high. If options are cheap, IV is low.

**India VIX**: India''s fear gauge. Measures expected NIFTY volatility over the next 30 days. Available on NSE website. Watch it like you watch the thermometer.

- VIX below 12: Extreme complacency. Options cheap. Market expects calm.
- VIX 12-20: Normal market conditions.
- VIX 20-30: Elevated fear. Options more expensive.
- VIX above 30: High fear. Market expects large moves. Options very expensive.
- COVID peak (March 2020): India VIX hit 90.

## Why IV matters for options traders

**IV and option premium**: Higher IV = higher option prices. Lower IV = lower prices.

This is critically important: When VIX is high, you are paying a premium for fear. When fear subsides, options lose value even if the underlying moves in your direction.

**IV crush**: A stock announces earnings. Everyone is uncertain about the outcome. IV spikes. Options become expensive. Earnings release → uncertainty resolved → IV drops sharply → **options lose value even if earnings beat expectations**. This is IV crush.

Many traders buy options before earnings expecting the stock to move, and lose money even when they are right about direction, because IV collapse more than offsets the directional gain.

## Historical volatility vs implied volatility

**Historical volatility (HV)**: How much the stock actually moved in the past.
**Implied volatility (IV)**: How much the market expects it to move in the future.

When IV >> HV: Options are expensive relative to actual moves. Selling options may have edge.
When IV << HV: Options are cheap. Buying options may have edge.

## The volatility mean reversion tendency

IV tends to revert toward its mean over time. Extremely high IV tends to fall; extremely low IV tends to rise.

This creates strategies:
- **When VIX is very high**: Sell options (collect expensive premium). Expect IV to fall.
- **When VIX is very low**: Buy options (cheap insurance). Expect IV to rise.

## Practical rules

1. Always check India VIX before buying options. High VIX = expensive options = need large moves to profit.
2. Before earnings, consider if you are paying too much for the expected move.
3. For option sellers: prefer high-IV environments for selling.
4. For option buyers: prefer low-IV environments for buying.',
  8, 31, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = tm_id AND slug = 'implied-volatility-explained');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT tm_id,
    'Quantitative analysis basics — using data to find investment edge',
    'quantitative-analysis-basics',
  '# Quantitative analysis basics

## What is quantitative investing?

Quantitative investing uses mathematical models, statistical analysis, and computer-driven systems to make investment decisions.

Instead of "this company has great products and honest management" (qualitative), quant investing asks "across 3,000 stocks over 20 years, which measurable factors predict better-than-market returns?"

The answer, from decades of academic research and practitioner evidence: **value, quality, momentum, low volatility, and size** consistently predict returns.

## The five proven factors

**Value**: Cheap stocks (low P/E, low P/B, low EV/EBITDA) outperform expensive stocks over the long run. Benjamin Graham''s thesis proven statistically.

**Momentum**: Stocks that have risen over the past 12 months (excluding last month) tend to continue rising for the next few months. Counterintuitive but robust across markets and time periods.

**Quality**: Companies with high profitability (ROE, ROCE), low debt, and stable earnings outperform. Buffett''s core investing style, quantified.

**Low volatility**: Surprisingly, lower-volatility stocks have historically delivered similar or better returns than high-volatility stocks with less risk. The "low vol anomaly."

**Size**: Small-cap stocks have historically outperformed large-caps over very long periods (with higher risk).

## How to apply factor investing in India

**Nifty Alpha 50**: Index of 50 stocks with highest alpha (momentum-like factor). Available as index fund/ETF.

**Nifty Quality 30**: 30 high-quality stocks. Available as ETF.

**Nifty 200 Momentum 30**: Tracks momentum stocks within NIFTY 200. Growing ETF options.

**Smart beta funds**: Mutual funds that combine factors. Mirae Asset FANG+, Motilal Oswal S&P 500 (international quant).

## Backtesting — testing strategies on historical data

Before committing real money to any strategy, test it on historical data:

1. Define your rules precisely (e.g., "buy 20 stocks with lowest P/E in NIFTY 500, equal-weight, rebalance quarterly")
2. Apply these rules to historical data (use NSE data, Screener.in, or paid data services)
3. Measure: CAGR, max drawdown, Sharpe ratio, number of trades
4. Check for survivorship bias and look-ahead bias
5. Test in different market regimes (bull, bear, sideways)

**The overfitting trap**: A strategy tuned to historical data may not work going forward. More rules = more likely to be overfitted. Simpler, logically-grounded rules generalise better.

## Realistic expectations

Quant strategies are not magic. Factors go through long periods of underperformance. Momentum crashed in 2020. Value underperformed for a decade (2010-2020). 

The edge from factor investing is real but requires patience (often 5-10 year horizon) and discipline not to abandon the strategy when it underperforms.',
  9, 32, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = tm_id AND slug = 'quantitative-analysis-basics');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT tm_id,
    'Portfolio rebalancing — why and how to rebalance your investments',
    'portfolio-rebalancing',
  '# Portfolio rebalancing

## What is rebalancing?

Rebalancing means periodically buying and selling assets to restore your portfolio to its target allocation.

**Why it becomes necessary**: Different assets grow at different rates. If you start 60% equity/40% debt and equity rises 30%, your portfolio becomes 65% equity/35% debt. Rebalancing sells some equity and buys debt to restore the 60/40 target.

## The three approaches

### Calendar rebalancing
Rebalance on a fixed schedule — annually or semi-annually.
Simple, predictable, low transaction costs.
Best for most investors.

### Threshold rebalancing
Rebalance when any asset class drifts more than X% from target (e.g., 5%).
More responsive to market moves.
May trigger more frequent trading.

### Hybrid (calendar + threshold)
Review annually. Only rebalance if any allocation has drifted more than 5% from target.
Best of both approaches. Recommended.

## Why rebalancing works

**1. Systematic contrarian behaviour**: Rebalancing forces you to sell what has risen (sell high) and buy what has fallen (buy low) automatically. This enforces the discipline that emotions prevent.

**2. Risk control**: Without rebalancing, a bull market pushes your portfolio toward higher equity than you intended — making you more exposed to a crash than your risk tolerance warrants.

**3. Forced diversification**: Prevents any one winning asset from dominating your portfolio and creating concentration risk.

## The rebalancing math

₹10 lakh portfolio, target 60% equity/40% debt.
- Equity rises 20%: Equity = ₹7.2L (64%), Debt stays ₹4L (36%)
- Rebalance: Sell ₹0.55L of equity, buy ₹0.55L of debt
- Post-rebalance: Equity ₹6.65L (60%), Debt ₹4.55L (40%)

## Tax considerations for rebalancing in India

**Equity funds/stocks**: LTCG (held > 1 year) taxed at 10% above ₹1L. STCG at 15%.
**Debt funds**: Taxed at slab rate regardless of holding period (post April 2023).

**Tax-efficient rebalancing strategies**:
1. Rebalance using new money (salary, bonus) — direct new investments to underweighted assets without selling.
2. Use annual tax-loss harvesting to sell loss-making positions (to offset gains) and rebalance simultaneously.
3. In ELSS or EPF, rebalancing has no direct tax trigger.

## Rebalancing frequency for Indian investors

**Aggressive investors (80%+ equity)**: Annual review, rebalance if drifted >5%
**Balanced investors (50-60% equity)**: Semi-annual review
**Conservative investors (30-40% equity)**: Quarterly review

Do not over-rebalance. Transaction costs (brokerage, STT, exit loads) and tax drag from frequent rebalancing can exceed the benefit.',
  7, 33, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = tm_id AND slug = 'portfolio-rebalancing');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT tm_id,
    'Tax loss harvesting — legally reducing your tax bill through smart selling',
    'tax-loss-harvesting',
  '# Tax loss harvesting

## What is tax loss harvesting?

Tax loss harvesting means strategically selling investments at a loss to offset capital gains tax, then immediately reinvesting in similar assets to maintain your market exposure.

It is one of the few legal methods to reduce your tax bill without changing your investment outcome meaningfully.

## How it works in India

**Capital gains offset rule**: Short-term capital losses (STCL) can offset both STCG and LTCG. Long-term capital losses (LTCL) can only offset LTCG.

Unused losses can be carried forward for 8 years.

## A practical example

You have ₹50,000 of LTCG from selling appreciated equity mutual fund units.
Without harvesting: Tax = (₹50,000 − ₹1,00,000 exemption) = ₹0 (within exemption).

Better example: You have ₹1,50,000 of LTCG.
Tax without harvesting: (₹1,50,000 − ₹1,00,000) × 10% = ₹5,000.

You also hold a mid-cap fund that has lost ₹60,000 (LTCL).
Sell it: Realise ₹60,000 loss.
Net taxable gain: ₹1,50,000 − ₹60,000 = ₹90,000 − ₹1,00,000 exemption = ₹0 tax.

Tax saved: ₹5,000.

Immediately reinvest the proceeds in a similar but not identical fund to maintain exposure.

## The wash sale warning

India does not have an explicit "wash sale rule" like the US (which prevents buying the same security within 30 days of selling it for a loss).

However, to be safe and ensure the loss is genuine:
- Wait a reasonable time (even a few days) before reinvesting
- Reinvest in a different but similar fund (e.g., sell one NIFTY 50 index fund, buy another AMC''s NIFTY 50 index fund)

## Annual LTCG exemption harvesting

Even without losses to harvest, use the ₹1 lakh LTCG exemption annually:

Every year, sell enough equity to realise exactly ₹1 lakh of LTCG. Immediately reinvest. This resets your cost basis.

₹1L harvested annually, compounded benefit over 20 years is significant.

**Calendar**: Do this every March (before financial year end). Calculate your unrealised LTCG in Zerodha/Groww tax P&L section. Sell and rebuy optimally.

## Record keeping

Maintain complete records of:
- All purchase dates and prices
- All sale dates and prices
- Net gains/losses per transaction
- Carry-forward loss amounts

Use your broker''s tax P&L report and verify against Form 26AS.',
  7, 34, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = tm_id AND slug = 'tax-loss-harvesting');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT tm_id,
    'International investing — why and how to invest beyond India',
    'international-investing',
  '# International investing

## Why invest outside India?

India represents approximately 2-3% of global market capitalisation. Limiting investments to India means ignoring 97% of the world''s investable opportunities.

**Key reasons to diversify internationally**:

**1. Access to global leaders**: Apple, Microsoft, Google, Amazon — companies that dominate their global industries are not listed in India. These businesses earn revenue from billions of customers worldwide.

**2. Currency diversification**: INR has depreciated against USD consistently over decades. USD-denominated assets automatically increase in INR value as this depreciation continues.

**3. Different economic cycles**: When India is in a slowdown, other economies may be growing. International diversification reduces portfolio volatility.

**4. Technology exposure**: The US NASDAQ has delivered 15%+ annual returns over the last decade. Concentrated in global tech companies not available via Indian markets.

## How to invest internationally from India

### 1. Domestic international mutual funds
The simplest route. Indian AMCs managing funds that invest in foreign stocks.

**US-focused funds**:
- Motilal Oswal Nasdaq 100 FOF
- Mirae Asset NYSE FANG+ ETF
- ICICI Prudential US Bluechip Equity Fund
- Franklin India Feeder US Opportunities

**Global diversified**:
- Parag Parikh Flexi Cap (25-35% international, mainly US)
- DSP World Agriculture Fund

**Limitation**: RBI has capped overseas investment for mutual funds at $7 billion industry-wide. Some funds periodically close subscriptions when this limit is hit.

### 2. LRS (Liberalised Remittance Scheme)
You can remit up to $250,000 per financial year abroad and invest directly in foreign stocks and ETFs.

Platforms: Vested Finance, INDmoney, Winvesta, HDFC Securities (international)

**Tax on LRS investments**:
- TCS (Tax Collected at Source): 20% on remittances above ₹7 lakh/year (recoverable in ITR)
- Capital gains: Taxed as per Indian slab rates for foreign investments (no LTCG benefit)

### 3. International ETFs on NSE
Some global ETFs trade on Indian exchanges:
- Mirae Asset Hang Seng TECH ETF (Hong Kong tech)
- Kotak Nasdaq 100 ETF

## Taxation of international mutual funds

Post April 2023: All international mutual funds taxed at your income slab rate regardless of holding period. This reduced their attractiveness compared to equity funds.

**The Parag Parikh exception**: Since PPFCF holds >65% India equity, it qualifies for equity taxation (10% LTCG after 1 year) while still providing international exposure.

## How much to allocate internationally?

Suggested for Indian investors: 10-20% of total equity portfolio in international exposure.

More than 20% creates unnecessary complexity and removes the home-country advantage (understanding of Indian business context, regulatory environment).',
  8, 35, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = tm_id AND slug = 'international-investing');
END IF;

-- ═══════════════════════════════════════════════════════════
-- CORPORATE FINANCE — 8 new lessons
-- ═══════════════════════════════════════════════════════════

IF corp_id IS NOT NULL THEN
  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT corp_id,
    'Cap table — the document every founder and investor must understand',
    'cap-table-explained',
  '# The cap table — equity ownership decoded

## What is a cap table?

A capitalisation table (cap table) shows exactly who owns what percentage of a company — founders, investors, employees (ESOP pool), and advisors.

It is the single most important document in a startup''s financial life. Every funding round, employee hire with equity, or acquisition changes it.

## A simple founding cap table

Day 1: Two founders start a company. 10,000,000 shares authorised.

| Shareholder | Shares | % Ownership |
|-------------|--------|-------------|
| Founder A   | 4,500,000 | 45% |
| Founder B   | 4,500,000 | 45% |
| ESOP Pool   | 1,000,000 | 10% |
| **Total**   | **10,000,000** | **100%** |

## Dilution — what happens with each funding round

**Seed round**: VC invests ₹1 crore for 15% of the company.

To give 15% to new investor, existing shareholders are diluted. New shares are created (issued) to the investor.

If pre-money valuation = ₹6 crore, post-money = ₹7 crore.
Investor receives: ₹1 crore / ₹7 crore = 14.28% ≈ 15% (with ESOP pool refresh).

Post-seed cap table:

| Shareholder | Shares | % |
|-------------|--------|---|
| Founder A | 4,500,000 | 38.3% |
| Founder B | 4,500,000 | 38.3% |
| ESOP Pool | 1,000,000 | 8.5% |
| Seed VC | 1,764,706 | 15% (new shares) |
| **Total** | **11,764,706** | **100%** |

Founders went from 45% each to 38.3%. They were diluted but now own 38.3% of a ₹7 crore company instead of 45% of a ₹6 crore company. Dilution is not inherently bad — it depends on whether the new capital increases value more than proportionally.

## Key cap table concepts

**Pre-money valuation**: Company value before new investment.
**Post-money valuation**: Company value after investment = pre-money + new investment.
**Investor %** = Investment / Post-money valuation.

**ESOP pool**: Shares reserved for future employee grants. Typically refreshed at each round. Usually dilutes founders, not investors (this is a negotiating point).

**Liquidation preference**: VCs often get their money back first in acquisition (1x non-participating is standard; anything more is aggressive).

**Pro-rata rights**: Investor''s right to maintain their % in future rounds by investing proportionally.

**Anti-dilution**: Protects investors if future rounds are at lower valuations (down rounds).

## Why founders must track this carefully

At exit (acquisition or IPO), the cap table determines exactly how much each party receives.

A founder who accepted too many liquidation preferences or anti-dilution clauses may receive very little even in a successful exit. Always model out multiple exit scenarios with a lawyer before signing term sheets.',
  9, 23, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = corp_id AND slug = 'cap-table-explained');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT corp_id,
    'Startup valuation — how investors value companies with no profit',
    'startup-valuation-methods',
  '# How startups are valued

## The valuation paradox

A company with no revenue and no profit is worth ₹0 by traditional metrics. Yet early-stage startups routinely raise money at ₹50 crore, ₹500 crore, or even higher valuations.

How?

Startups are valued on **future potential**, not current reality. Investors are buying a share of the expected future business, discounted for risk and time.

## The 5 methods used at different stages

### 1. Berkus Method (pre-revenue)
Assigns value based on qualitative milestones:
- Sound idea: Up to $500K
- Working prototype: Up to $500K
- Quality management team: Up to $500K
- Strategic relationships: Up to $500K
- Product rollout or sales: Up to $500K
Maximum pre-money: $2.5M (~₹20-25 crore)

Simple, handles extreme uncertainty.

### 2. Comparable transactions (most common)
"What have similar companies raised at recently?"

If 5 Indian B2B SaaS companies raised their Series A at 8-12x ARR multiples, and your ARR is ₹2 crore, you can negotiate ₹16-24 crore pre-money valuation.

**India-specific multiples (2024)**:
- B2B SaaS: 5-12x ARR
- Consumer internet: 2-5x GMV or revenue
- Fintech: 3-8x revenue
- D2C brands: 1.5-4x revenue

### 3. Revenue multiple
Pre-money valuation = Revenue × Industry multiple

Simple and widely used for early-stage startups with revenue.

### 4. Discounted Cash Flow (DCF)
Project future cash flows for 5-10 years, discount back at a high rate (30-50% for early stage to reflect risk).

Used more for growth-stage and pre-IPO companies. Requires credible financial projections.

### 5. VC Method
Work backwards from expected exit:
- Expected exit value (IPO or acquisition) in 5 years = ₹500 crore
- Target return for VC: 10x
- Investment needed to achieve that: ₹500 crore / 10x = ₹50 crore "needed" at exit
- If VC invests ₹5 crore today, they want 10% of exit = ₹50 crore → target post-money = ₹50 crore

This gives the pre-money and % the VC needs.

## What actually drives startup valuations in India

**Team quality**: Tier 1 founders (IIT/IIM, prior exits, known operators) command premium.
**Market size**: TAM (Total Addressable Market) must be large enough for a ₹1,000 crore+ outcome.
**Traction metrics**: DAU, MAU, retention, NPS, revenue growth rate, unit economics.
**Investor competition**: Two competing term sheets dramatically increases valuation leverage.
**Market conditions**: 2021 was peak FOMO. 2022-23 saw 50-80% valuation corrections.',
  9, 24, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = corp_id AND slug = 'startup-valuation-methods');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT corp_id,
    'Unit economics — CAC LTV and contribution margin explained',
    'unit-economics-explained',
  '# Unit economics — the foundation of a sustainable business

## What are unit economics?

Unit economics measures the revenue and cost associated with a single unit of business — one customer, one transaction, one order, one subscriber.

A business that loses money on every unit will not become profitable by scaling. A business with strong unit economics gets more valuable with every additional unit.

## The three most important metrics

### Customer Acquisition Cost (CAC)

CAC = Total sales and marketing spend / Number of new customers acquired

Example: Spent ₹50 lakh on marketing in Q1. Acquired 1,000 new customers.
CAC = ₹50,000 per customer.

CAC must be compared to the value a customer brings.

### Customer Lifetime Value (LTV)

LTV = Average purchase value × Purchase frequency × Average customer lifetime

Or more precisely: LTV = (Revenue per customer − Cost to serve per customer) × Average retention period

Example: Customer pays ₹2,000/month subscription. Cost to serve = ₹500/month. Average customer stays 24 months.
LTV = (₹2,000 − ₹500) × 24 = ₹36,000

### LTV/CAC ratio

With CAC of ₹50,000 and LTV of ₹36,000: LTV/CAC = 0.72.

This business is destroying value — it spends more to acquire a customer than it earns from them. **Fundamentally broken unit economics.**

**Benchmarks**:
- LTV/CAC < 1: Business destroys value on every customer. Fatal.
- LTV/CAC 1-3: Break-even or marginal. Needs improvement.
- LTV/CAC 3-5: Good. Sustainable growth is possible.
- LTV/CAC > 5: Excellent. Strong competitive moat likely present.

### Payback period

How many months to recover the CAC from gross profit?

Payback period = CAC / Monthly gross profit per customer

If CAC = ₹50,000 and monthly gross profit per customer = ₹1,500:
Payback period = 33 months.

**Benchmarks**: < 12 months excellent; 12-24 months acceptable; > 24 months concerning.

## Contribution margin

Contribution margin = Revenue − Variable costs per unit

Variable costs: Cost of goods, packaging, delivery, payment processing.
Fixed costs: Salaries, rent, technology — do not change with each sale.

If you sell a product for ₹1,000, COGS is ₹400, delivery is ₹100:
Contribution margin = ₹1,000 − ₹400 − ₹100 = ₹500 (50%)

A positive contribution margin means each additional unit contributes to covering fixed costs.

**Negative contribution margin**: Each unit sold makes the loss bigger. No amount of scale fixes this — scale makes it worse.

## The D2C brand unit economics crisis (2022-23)

Many Indian D2C brands scaled aggressively on venture capital with negative unit economics. When funding dried up in 2022, they could not sustain.

The ones that survived had: positive contribution margin, CAC below 12-month payback, and repeat purchase rates above 30%.',
  8, 25, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = corp_id AND slug = 'unit-economics-explained');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT corp_id,
    'Investment banking — what bankers actually do all day',
    'investment-banking-explained',
  '# Investment banking — demystified

## What do investment banks actually do?

Investment banks act as intermediaries between companies that need capital and investors who have capital. They earn fees for facilitating these transactions.

The three core activities:

### 1. Capital markets (raising money for companies)

**IPO (Initial Public Offering)**: Taking a private company public. The bank underwrites the offering — guaranteeing to sell shares to investors. If they cannot place all shares, they buy the unsold portion themselves.

**Follow-on offerings (FPO)**: Existing listed companies raising additional equity capital.

**Debt capital markets**: Helping companies issue bonds to institutional investors.

Banks earn 2-7% of the total capital raised as fees. A ₹1,000 crore IPO generates ₹20-70 crore in fees.

### 2. Mergers and acquisitions (M&A) advisory

Banks advise on the buy side (advising acquirers) or sell side (advising companies being sold).

**Services**: Finding targets or buyers, valuing the deal, structuring the transaction, negotiating terms, facilitating due diligence, getting regulatory approvals.

Fee: 0.5-3% of deal value. A ₹5,000 crore acquisition could generate ₹25-150 crore in advisory fees.

### 3. Sales and trading

Banks trade securities for institutional clients (mutual funds, insurance companies, foreign investors). They earn bid-ask spreads.

## The Indian investment banking landscape

**Bulge bracket** (global): Goldman Sachs, Morgan Stanley, JP Morgan, Bank of America, Citi — active in India for large deals.

**Local full-service banks**: Kotak Mahindra Bank, ICICI Securities, Axis Capital, HDFC Bank — dominate mid-market M&A and domestic IPOs.

**Boutique banks**: JM Financial, Edelweiss, IIFL — specialty focus on specific sectors or deal sizes.

## A typical IPO process timeline

**Month 1-3**: DRHP preparation (draft red herring prospectus). Financial restatements, business narrative, risk factors.

**Month 4-5**: SEBI filing and review. SEBI has 30 days to comment.

**Month 6**: Roadshow — management presents to institutional investors across cities and via video calls globally.

**IPO week**: 3-day subscription window. Price discovery through book building. Allotment and listing.

**Total timeline**: 6-12 months from mandate to listing.

## What investment banking careers involve

Analyst (0-3 years): Financial modelling, presentation preparation, data analysis. 80-100 hour weeks.
Associate (3-6 years): Managing analyst work, client communication.
VP/Director: Client relationships, deal execution.
MD/Partner: Origination (finding new deals), senior client management.

Compensation in India: ₹15-25 lakh at analyst level at top firms, scaling to crores at senior levels with bonus.',
  8, 26, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = corp_id AND slug = 'investment-banking-explained');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT corp_id,
    'Private equity and venture capital — how PE/VC funds work',
    'private-equity-venture-capital',
  '# Private equity and venture capital

## The asset class overview

Private equity (PE) and venture capital (VC) are forms of investment in private (non-listed) companies.

Both raise money from institutional investors (pension funds, endowments, family offices, HNIs) into a fund, then deploy that capital into private companies, targeting a 3-10x return over 5-10 years.

## Venture capital vs private equity

| | Venture Capital | Private Equity |
|--|--|--|
| Stage | Early (seed, Series A-C) | Late (growth, buyout) |
| Company revenue | Zero to small | Established |
| Stake | Minority (10-25%) | Often majority (50%+) |
| Value addition | Mentorship, network | Operational improvement |
| India examples | Sequoia India, Accel, Nexus | KKR, Blackstone, Warburg Pincus |
| Typical fund size | ₹500-5,000 crore | ₹5,000-50,000 crore+ |
| Return target | 3-10x on winners, 0x on losers | 2.5-4x overall |
| Hold period | 5-8 years | 3-7 years |

## How a VC fund works

**Fund life**: Typically 10 years. First 3-5 years: investing. Last 5-7 years: managing and exiting.

**Investment thesis**: Each fund has a focus — sector (fintech, healthcare, SaaS), stage (seed, Series A), or geography (Tier 2 cities).

**Portfolio construction**: A VC fund makes 15-25 investments expecting 50-60% to lose money, 30-40% to return capital, and 5-10% to generate most of the returns (power law).

**2/20 model**: Management fee = 2% of committed capital annually. Carried interest = 20% of profits above a hurdle rate (typically 8%).

Example: ₹500 crore fund.
- Annual management fees: ₹10 crore/year × 10 years = ₹100 crore
- If fund generates ₹1,500 crore returns (3x): Carry = 20% × (₹1,500 − ₹500) = ₹200 crore for the GPs

## The Indian VC ecosystem

**Seed stage**: Blume Ventures, Kalaari Capital, India Quotient — ₹50-500 lakh tickets.
**Series A/B**: Peak XV (Sequoia India), Accel, Elevation Capital — ₹5-50 crore tickets.
**Growth**: Tiger Global, SoftBank Vision Fund, General Atlantic — ₹100+ crore tickets.

**Hot sectors 2024**: Climate tech, AI/ML, health-tech, fintech, B2B SaaS.

## How PE creates value

**Operational improvement**: Install professional management. Implement best practices.
**Leverage (LBO)**: Buy company with significant debt. Interest payments create tax shield. Pay down debt over time.
**Multiple expansion**: Buy at 6x EBITDA, operational improvement + market sentiment → sell at 8x.
**Add-on acquisitions**: Buy smaller competitors to build scale.

**Blackstone in India**: Has deployed $50+ billion in Indian real estate and PE over 25 years. One of the largest foreign investors in India.',
  9, 27, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = corp_id AND slug = 'private-equity-venture-capital');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT corp_id,
    'Financial statement fraud — how companies cook the books',
    'financial-statement-fraud',
  '# Financial statement fraud

## Why learn about fraud?

The best protection against investing in fraudulent companies is knowing what to look for. Satyam, IL&FS, Cafe Coffee Day, DHFL, Religare — each destroyed investor wealth through accounting manipulation.

Understanding the red flags is as important as understanding the legitimate financial statements.

## The major types of manipulation

### 1. Revenue recognition fraud (most common)

**Channel stuffing**: Shipping excess inventory to distributors before they need it. Distributors get return rights. Revenue is booked now, but products come back next quarter.

**Bill and hold**: Recording revenue for goods not yet shipped. Often involves fictitious purchase orders.

**Round-tripping**: Company A sells to Company B. Company B sells back to Company A. Both record revenue. No real economic activity.

**Red flags**:
- Revenue growing much faster than industry peers
- Receivables growing faster than revenue (customers not actually paying)
- High revenue but consistently negative operating cash flow

### 2. Expense manipulation

**Capitalising operating expenses**: Converting current year expenses (which reduce profit) into assets (which are amortised over years). Inflates current period profit.

**Related party expenses**: Paying excessive amounts to promoter-controlled entities for services. Extracts value from the listed company.

**Understating provisions**: Not fully provisioning for bad loans (common in banks), warranty liabilities, or legal contingencies.

### 3. Balance sheet manipulation

**Inflated assets**: Goodwill that never gets impaired despite deteriorating acquired businesses. Receivables that will never be collected but have not been written off.

**Off-balance sheet liabilities**: Keeping debt off the formal balance sheet through special purpose vehicles, guarantees to subsidiaries, or operating leases (pre-Ind AS 116).

## The Satyam case study

Ramalinga Raju manipulated Satyam''s books for years:
- Cash and bank balances were fictitious (₹5,040 crore "cash" did not exist)
- Revenue and profits were inflated
- Fictitious fixed assets

**How he got away with it so long**:
- Auditors (PwC) failed due diligence
- Board was not independent in practice
- Complex corporate structure obscured relationships

**The catch**: He wanted to acquire Maytas (promoter-owned company) using Satyam cash — but the cash did not exist. The acquisition announcement revealed the fraud.

## Red flag checklist

- Frequent auditor changes
- Qualified audit opinion
- Audit fee much lower than peers
- Promoter pledge > 50%
- Related party transactions > 20% of revenue
- Operating cash flow consistently < net profit
- High receivable days vs peers
- Complex corporate structure with many subsidiaries
- Key management leaving suddenly',
  9, 28, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = corp_id AND slug = 'financial-statement-fraud');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT corp_id,
    'ESG investing — what it is and whether it actually works',
    'esg-investing',
  '# ESG investing

## What is ESG?

ESG stands for Environmental, Social, and Governance — three categories of non-financial factors used to evaluate companies alongside traditional financial metrics.

**Environmental**: Carbon emissions, water usage, waste management, renewable energy adoption, supply chain sustainability.

**Social**: Employee treatment, supply chain labour standards, diversity and inclusion, community impact, data privacy.

**Governance**: Board independence, executive compensation, shareholder rights, transparency, anti-corruption policies.

## Why ESG investing has grown

**Institutional pressure**: Large pension funds (CalPERS, Norway''s sovereign wealth fund) have incorporated ESG into investment mandates. This capital represents trillions of dollars.

**Risk management**: Companies with poor ESG practices face growing regulatory, reputational, and operational risks. ESG is partly about identifying future financial risks not captured in current financial statements.

**Consumer demand**: Younger consumers prefer sustainable products. Companies with strong ESG may have growing addressable markets.

## The evidence on ESG performance

**The optimistic view**: Companies with strong ESG tend to have higher quality governance and management. These correlate with long-term outperformance.

**The sceptical view**: Most ESG outperformance in studies reflects the growth vs value tilt (tech companies score high ESG; energy/banks score low). When growth underperforms, ESG funds underperform. The ESG premium may not be real.

**The evidence**: Mixed. Some periods ESG funds outperform. Others they underperform. No clear evidence of consistent alpha from ESG as a standalone factor over long periods.

## ESG in India

SEBI mandates Business Responsibility and Sustainability Reporting (BRSR) for top 1,000 listed companies. India is building its ESG disclosure infrastructure.

**Indian ESG funds**: Mirae Asset ESG Sector Leaders ETF, Quantum India ESG Equity Fund, Axis ESG Equity Fund.

**Criticism of Indian ESG**: Scoring is heavily dependent on data availability and reporting quality. Companies that report more data score higher regardless of actual ESG practice.

## The greenwashing problem

Many companies and funds exaggerate their ESG credentials to attract capital without making meaningful changes. "Greenwashing" — presenting a sustainability facade over business as usual.

**Signs of greenwashing**: Vague, unquantified ESG claims. No third-party verification. Scope 3 emissions (supply chain) not reported. Token diversity statistics without structural change.

## Honest conclusion

ESG investing is valuable as a risk management tool and aligns investments with personal values. As a source of excess returns, the evidence is ambiguous. Invest in ESG if it matches your values — but do not expect it to significantly outperform or underperform a broad market index over long periods.',
  7, 29, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = corp_id AND slug = 'esg-investing');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT corp_id,
    'Corporate restructuring — what happens when companies reorganise',
    'corporate-restructuring',
  '# Corporate restructuring

## What is restructuring?

Corporate restructuring involves significant changes to a company''s financial structure, operations, or ownership — usually to improve financial health, create focus, or respond to a crisis.

Restructuring is not inherently negative — some of the most value-creating corporate actions involve proactive restructuring.

## Types of restructuring

### Financial restructuring

**Debt restructuring**: When a company cannot service its debt, it negotiates with lenders to extend tenure, reduce interest, convert debt to equity, or take haircuts.

**India-specific**: Insolvency and Bankruptcy Code (IBC) 2016 transformed debt resolution. Creditors can now initiate Corporate Insolvency Resolution Process (CIRP) against defaulting companies. Resolution must complete within 180 days (extendable to 330 days).

**Rights issue**: Existing shareholders offered new shares at a discount. Raises equity capital without diluting existing holders (who exercise rights).

**QIP (Qualified Institutional Placement)**: Fast-track capital raising from institutional investors. No SEBI approval needed (unlike FPO).

### Operational restructuring

**Divestiture**: Selling a business unit or subsidiary to focus on core operations. Tata Group has systematically divested non-core businesses (Tata Motors sold Tata Finance; Reliance divested retail businesses).

**Spin-off**: Creating a separate listed company from a division. Parent company shareholders receive shares in the new entity. Allows pure-play valuation.

**Merger**: Two companies combining. Regulatory approval (NCLT, CCI) required.

**Demerger**: A company splitting into two or more entities. Shareholders receive proportional shares in all entities.

**India example**: Reliance demerged its financial services businesses. Shareholders received shares in Jio Financial Services (listed separately in 2023).

## The bankruptcy process in India (IBC)

1. Creditor files application with NCLT
2. NCLT admits and appoints Resolution Professional (RP)
3. Committee of Creditors (CoC) formed — secured creditors with majority
4. Resolution applicants submit resolution plans
5. CoC votes on plan (66% approval needed)
6. NCLT approves successful resolution plan
7. If no resolution: Liquidation

**Real outcomes**: Jet Airways → Liquidation (failed resolution). Essar Steel → Acquired by Arcelor Mittal. Bhushan Steel → Acquired by Tata Steel.

## What restructuring means for investors

**As an equity holder**: Debt restructuring where debt converts to equity dilutes existing shareholders heavily. You may emerge with a tiny fraction of your original holding.

**As an investor studying restructuring opportunities**: Post-restructuring companies often have clean balance sheets and motivated new management. Essar Steel (now Tata Steel) and Bhushan Steel acquisitions created significant value for Tata and JSW respectively.',
  8, 30, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = corp_id AND slug = 'corporate-restructuring');
END IF;

-- ═══════════════════════════════════════════════════════════
-- PERSONAL FINANCE INTERMEDIATE — 5 new lessons
-- ═══════════════════════════════════════════════════════════

IF pf_int_id IS NOT NULL THEN
  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT pf_int_id,
    'Building passive income — dividends rental income and more',
    'building-passive-income',
  '# Building passive income

## What is passive income?

Passive income is money earned with minimal ongoing active effort. The "passive" in passive income is relative — almost all passive income requires significant upfront effort or capital.

**The big three** that actually work:
1. Investment income (dividends, interest, capital gains)
2. Rental income (property)
3. Business income that runs without you (royalties, licensing, digital products)

## Investment income — the most accessible

### Dividend income

Build a portfolio of dividend-paying Indian companies and receive quarterly or annual dividends.

A ₹1 crore portfolio at 3% average dividend yield generates ₹3 lakh/year (₹25,000/month) before tax.

**Tax**: Dividends taxed at your income slab rate. At 30% bracket: effective yield = 2.1%.

**Best dividend stocks in India**: ITC, Coal India, Power Grid, NHPC, HDFC Bank, Infosys (for sustainable, growing dividends).

### Debt fund interest

Systematic Withdrawal Plan (SWP) from debt mutual funds allows periodic withdrawal while corpus remains invested.

₹50 lakh in short-duration debt fund at 7% yield → withdraw ₹29,167/month. Corpus grows at ~7% while you withdraw 7%. Effectively perpetual income.

Tax on debt fund withdrawals at slab rate (post April 2023).

### Sovereign Gold Bond interest

2.5% per annum on face value, paid semi-annually. Tax-free.

### Post Office Monthly Income Scheme (POMIS)

7.4% annually (2024), paid monthly. Maximum ₹9 lakh (individual). Government-backed safety. For conservative investors.

## Rental income

₹1 crore residential property in metro: Typical rent ₹20,000-₹30,000/month = 2.4-3.6% yield.

After property tax, maintenance, vacancy: Effective yield 1.5-2.5%.

**Commercial property (office, shop)**: 5-9% rental yield. Requires much larger capital but generates significantly more income.

**REITs** (discussed earlier): 6-8% distribution yield without hassles of direct ownership.

## The FIRE calculation

Financial Independence, Retire Early (FIRE) requires:

Annual expenses × 25 = Required corpus (based on 4% safe withdrawal rate)

If annual expenses = ₹12 lakh:
Required corpus = ₹12 lakh × 25 = ₹3 crore

This corpus invested at 12% grows by ₹36 lakh/year.
Withdraw ₹12 lakh/year for expenses.
Portfolio keeps growing (at 12% with 4% withdrawal = 8% net growth).

## The realistic timeline

Starting at 25 with ₹5,000/month SIP at 12% returns:
- ₹3 crore corpus reached at approximately age 46 (21 years)

At ₹20,000/month SIP:
- ₹3 crore corpus at approximately age 38 (13 years)

FIRE is achievable. It requires extraordinary savings discipline in your 20s and 30s.',
  8, 16, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = pf_int_id AND slug = 'building-passive-income');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT pf_int_id,
    'Insurance planning deep dive — how much cover do you actually need?',
    'insurance-planning-deep-dive',
  '# Insurance planning deep dive

## The three questions for every insurance decision

1. What risk am I transferring?
2. How catastrophic is the risk if uninsured?
3. Is the premium worth the protection?

Insurance makes sense only when the potential loss is catastrophic AND the premium is reasonable relative to coverage.

## Term insurance — the precise calculation

"Buy 10-15x annual income" is a rough rule. Here is the precise approach:

**Income replacement needed**:
- Annual expenses: ₹6 lakh
- Years until youngest dependent is financially independent: 20 years
- Present value factor at 7% (real return): 10.6
- Income replacement corpus needed: ₹6 lakh × 10.6 = ₹63.6 lakh

**Debt coverage**:
- Home loan outstanding: ₹35 lakh
- Other loans: ₹5 lakh

**Future goals**:
- Children''s education: ₹20 lakh (in today''s money, inflation-adjusted ₹30 lakh for 10 years)
- Spouse''s retirement (if applicable): ₹25 lakh

**Existing assets** (subtract these):
- EPF + PPF + mutual funds: ₹15 lakh

**Total cover needed**:
₹63.6 + ₹40 + ₹30 + ₹25 − ₹15 = **₹1.44 crore**

Round up: **₹1.5 crore term cover** is appropriate.

Review this calculation every 3-5 years and when major life events occur (marriage, child, home purchase, salary increase).

## Health insurance — what sub-limits destroy your claims

**Room rent limit**: Policy says ₹10,000/day room rent. You are hospitalised in a semi-private room at ₹15,000/day. Not only does the insurer cap room at ₹10,000 — they proportionally reduce ALL other expenses (ICU, doctor fees, medicines).

Impact: ₹5 lakh claim becomes ₹3.3 lakh after proportional reduction. The remaining ₹1.7 lakh comes from your pocket.

**Always check**: Room rent limit, disease-specific sub-limits (e.g., cataract surgery capped at ₹40,000), co-payment clauses, and pre-existing disease waiting periods.

**Recommended**: Policies without room rent sub-limits and without disease-specific caps.

## Critical illness insurance — when to buy it

Critical illness (CI) insurance pays a lump sum on diagnosis of specified serious illnesses (cancer, heart attack, stroke, kidney failure, organ transplant).

Buy CI if:
- Family history of any covered illness
- Your income would stop during treatment and recovery
- Your health insurance covers hospitalisation but not the income gap during long recovery

**Claim trigger**: Usually requires 30-90 day survival period after diagnosis. Read the policy document carefully.

## Life stage insurance audit

**Age 25-30 (single, no dependents)**: Health insurance ✓. Term insurance: Optional (if parents are financially dependent). Skip everything else.

**Age 30-40 (married, young children)**: Term insurance ✓ (critical!). Health insurance ✓. Critical illness: Consider if family history. Home loan protection: No — term insurance covers this.

**Age 40-55 (children adolescent)**: Review and increase term cover. Add super top-up health insurance. Consider personal accident policy if risky profession.

**Age 55+ (children independent, retirement approaching)**: Term insurance may not be necessary. Senior citizen health insurance critical. Focus on corpus, not new insurance products.',
  8, 17, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = pf_int_id AND slug = 'insurance-planning-deep-dive');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT pf_int_id,
    'Gratuity and leave encashment — your hidden employee benefits',
    'gratuity-leave-encashment',
  '# Gratuity and leave encashment

## Gratuity — money for your loyalty

Gratuity is a statutory payment made by employers to employees who have completed 5+ years of continuous service.

**Eligibility**: 5 years continuous employment (4 years 240 days acceptable in some interpretations). In case of death or disability, gratuity is payable irrespective of service period.

**Formula**:
Gratuity = (Basic salary + DA) × 15/26 × Number of years of service

15 = 15 days per year
26 = working days in a month

**Example**:
Basic + DA = ₹60,000/month
Service = 10 years
Gratuity = ₹60,000 × 15/26 × 10 = ₹3,46,154

**Tax exemption**: Minimum of three amounts is exempt:
1. Actual gratuity received
2. ₹20 lakh (statutory limit as of 2024)
3. Formula amount

For most employees: Gratuity fully tax-free up to ₹20 lakh.

## How gratuity is funded

**Gratuity trust**: Better employers create a gratuity trust and fund it annually. Employees are more protected.

**Unfunded**: Many smaller companies pay gratuity from current funds when needed. Risk if company faces financial stress.

**Group gratuity policies**: Insurance companies offer group gratuity products that provide funding and life cover.

## Leave encashment — your earned leaves are money

Most companies allow accumulation of Earned Leave (EL) up to a limit (typically 30-60 days annually, 300 days over career).

**At resignation/retirement**: Unused EL is paid out at your daily salary rate.

**Calculation**: Daily rate × Number of accumulated EL days

At salary ₹1 lakh/month:
Daily rate = ₹1,00,000/26 = ₹3,846
60 days accumulated leave = ₹3,846 × 60 = ₹2,30,769

**Tax treatment**:
- Leave encashment at retirement: Tax-exempt up to ₹25 lakh (government employees: fully exempt)
- Leave encashment during service (if company allows surrender): Taxable

## Practical tips

1. **Track your gratuity**: Most companies show gratuity accrual in CTC. Ensure it matches the statutory formula.
2. **Do not resign just before 5 years**: You forfeit gratuity. Wait 1-2 months if needed.
3. **Keep leave records**: Do not let accumulated leave lapse. Know your company''s carry-forward policy.
4. **Gratuity on resignation vs retirement**: Same formula and same tax treatment.
5. **EPFO claim**: Gratuity claim is separate from EPF. Follow company-specific process — usually HR provides Form I for gratuity claim.',
  7, 18, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = pf_int_id AND slug = 'gratuity-leave-encashment');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT pf_int_id,
    'How to negotiate salary — the financial skill most people avoid',
    'salary-negotiation',
  '# Salary negotiation

## Why negotiation matters more than you think

Most people accept the first offer or negotiate weakly. The cost of not negotiating compounds dramatically over a career.

If you earn ₹10 lakh instead of ₹12 lakh because you did not negotiate:
- Year 1 gap: ₹2 lakh
- With 10% annual increments for 20 years, cumulative gap: **₹1.1 crore**
- If invested at 12%: **₹4+ crore** in retirement corpus

One uncomfortable 30-minute conversation. ₹4 crore lifetime impact.

## The research phase (before the conversation)

**Know your market value**:
- LinkedIn Salary Insights
- Glassdoor.in
- AmbitionBox (best for Indian companies)
- Speak to recruiters in your domain — they know current market rates precisely
- Peers at other companies (people share salary data more than you expect when asked directly and privately)

**Know your own number**: What is your minimum acceptable offer? What would make you immediately say yes? What is your target?

**Know the company**: Is the company growing or cost-cutting? Recent funding round = more flexibility. Recent layoffs = less flexibility.

## The conversation framework

**Rule 1: Never name your number first.**
"What is your current salary?" → "I''d rather not anchor the conversation to my current compensation — I''m looking for a role at market rate for this level of experience."

"What are your expectations?" → "Based on my research and the scope of this role, I''m targeting the ₹18-22 lakh range. Does that align with what you have budgeted?"

**Rule 2: Give a range, anchor the top.**
Name a range where even the low end is acceptable and the high end is your true target. Counteroffers typically land in the middle.

**Rule 3: After the offer, pause.**
"Thank you. I''m very interested. Can I have 24-48 hours to review it carefully?"

**Rule 4: Negotiate in writing (email).**
"I''m very excited about the role. Based on our discussion, I was expecting ₹20 lakh. Is there flexibility to reach ₹19 lakh + performance bonus?"

## Beyond base salary

If base cannot move, negotiate:
- Variable pay / performance bonus
- Joining bonus (one-time)
- Extra days of leave
- Work from home flexibility
- Learning and development budget
- ESOP vesting acceleration
- Title (affects next negotiation)

## Internal salary negotiation

Once employed, annual increments are easier to negotiate than most think.

Before appraisal season: Document your impact in numbers (revenue generated, cost saved, projects delivered, team size managed).

Research: "For someone at my level in this industry, ₹X-Y is the range. My contributions this year include A, B, and C, which have delivered Z impact. I''d like to discuss closing the gap to market rate."

The worst answer is always no. The cost of asking is zero.',
  7, 19, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = pf_int_id AND slug = 'salary-negotiation');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT pf_int_id,
    'Advanced tax planning — HUF, capital gains, and overlooked deductions',
    'advanced-tax-planning',
  '# Advanced tax planning

## HUF — Hindu Undivided Family

A Hindu Undivided Family (HUF) is a separate legal entity for tax purposes. A family of Hindus, Sikhs, Jains, or Buddhists can form an HUF.

**Tax advantage**: HUF is taxed as a separate individual — it gets its own ₹3 lakh basic exemption, its own 80C deduction (₹1.5 lakh), its own NPS deduction.

**How it works**:
1. Form an HUF (need PAN, declaration, bank account)
2. Family members contribute assets to HUF (ancestral property, gifts from outsiders)
3. HUF invests and earns income (rental, dividend, business)
4. HUF files its own ITR and pays tax on its income

**Example savings**:
Individual salary: ₹15 lakh → Tax: ~₹2.2 lakh (old regime)
HUF rental income: ₹5 lakh → Tax after HUF deductions: ~₹15,000

Total family tax drops by ₹1+ lakh annually.

**Limitations**: HUF cannot claim deductions available to individuals (like HRA). Business income in HUF has compliance costs. Not suitable for everyone — assess with a CA.

## Capital gains tax optimisation

**LTCG on equity (>1 year)**: 10% above ₹1 lakh exemption.

**Annual harvesting**: Every March, sell enough equity to realise exactly ₹1 lakh LTCG. Immediately rebuy. No tax paid, cost basis reset. Over 20 years, this saves lakhs in eventual tax.

**Indexation on debt funds** (lost in April 2023): Taxed at slab rate now. But indexation benefit remains for physical gold, property, and pre-April 2023 debt fund investments.

**Real estate LTCG**: After 2 years, 20% with indexation (original regime) or 12.5% without indexation (new option from Budget 2024 for new purchases). Calculate both to determine which is lower.

## Overlooked deductions (old regime)

**Section 80EEA**: Additional ₹1.5 lakh for first-time home buyers on interest (on loans sanctioned before March 2022).

**Section 80GG**: Rent paid deduction for those without HRA (self-employed or employers not providing HRA). Up to ₹5,000/month.

**Section 80TTA**: ₹10,000 deduction on savings account interest. 80TTB: ₹50,000 for senior citizens on all interest income.

**Section 80U / 80DD**: Deductions for disabled individuals or family members with disabilities.

**Section 80G**: Charitable donations. 50-100% deduction. PM CARES, CRY, Akshaya Patra, etc. Give to good causes, get tax benefit.

## Structuring compensation for tax efficiency

If you are self-employed or have control over your compensation structure:

- Pay yourself salary + expenses rather than just profit
- Business expenses (office, equipment, internet, travel, professional development) are deductible
- Create an HUF and have it own business assets
- Contribute maximum to NPS (deductible under 80CCD)
- Ensure you have professional indemnity or business insurance (deductible)

Always work with a registered CA for individual tax planning.',
  8, 20, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = pf_int_id AND slug = 'advanced-tax-planning');
END IF;

-- Final count
SELECT COUNT(*) INTO v_total FROM lessons WHERE is_published = TRUE;
RAISE NOTICE 'Phase 2 Batch 1 complete. Total published lessons: %', v_total;

END $$;
