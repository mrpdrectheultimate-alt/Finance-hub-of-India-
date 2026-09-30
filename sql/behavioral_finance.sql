-- ============================================================
-- FinanceHub â€” Behavioral Finance: 15 Lessons
-- Run AFTER phase1_critical_fixes.sql
-- ============================================================

DO $$
DECLARE
  behavioral_level_id UUID;
BEGIN

-- Get or create the behavioral finance track and level
-- First ensure track exists
INSERT INTO tracks (title, slug, description, icon, color_hex, order_index, is_active)
VALUES ('Behavioral Finance', 'behavioral-finance', 'Understand the psychology behind financial decisions and how emotions sabotage wealth creation', 'ðŸ§ ', '#7C3AED', 5, TRUE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO levels (track_id, title, slug, description, order_index, is_free, xp_reward)
SELECT t.id, 'Money Psychology', 'money-psychology',
  'Why smart people make terrible financial decisions â€” and how to stop', 1, TRUE, 100
FROM tracks t
WHERE t.slug = 'behavioral-finance'
  AND NOT EXISTS (
    SELECT 1 FROM levels lv
    WHERE lv.track_id = t.id AND lv.slug = 'money-psychology'
  );

SELECT lv.id INTO behavioral_level_id
FROM levels lv JOIN tracks t ON lv.track_id = t.id
WHERE t.slug = 'behavioral-finance' AND lv.slug = 'money-psychology';

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- LESSON 1: Introduction to behavioral finance
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
IF NOT EXISTS (
  SELECT 1 FROM lessons
  WHERE level_id = behavioral_level_id AND slug = 'what-is-behavioral-finance'
) THEN
  -- Run lesson inserts only when this level has not already been seeded.
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES (behavioral_level_id,
'What is behavioral finance â€” why smart people make dumb money decisions',
'what-is-behavioral-finance',
'# What is behavioral finance?

## The rational investor myth

Classical economics assumes you are a rational actor. You gather all available information, calculate probabilities correctly, and make decisions that maximise your financial wellbeing.

**This is completely wrong.**

Decades of research by psychologists Daniel Kahneman and Amos Tversky â€” and their followers â€” has proven that humans are systematically irrational when it comes to money. We make predictable mistakes, driven by emotions, cognitive shortcuts, and mental biases.

**Behavioral finance** is the study of how psychology affects financial decisions.

## Why it matters

Understanding behavioral biases does not just make you a better investor. It explains:

- Why markets crash even when fundamentals are fine (panic selling)
- Why people buy high and sell low (following the crowd)
- Why lottery tickets outsell index funds (overweighting small probabilities)
- Why most traders lose money even in bull markets (overconfidence)
- Why people keep money in savings at 4% while paying credit card debt at 36%

## The two systems (Kahneman)

Nobel Prize winner Daniel Kahneman describes two thinking systems:

**System 1** â€” Fast, automatic, emotional. Runs most of your day. Makes instant judgements. Susceptible to biases.

**System 2** â€” Slow, deliberate, rational. Requires effort. Most financial analysis should use this â€” but System 1 often hijacks it.

> Most investing mistakes happen when System 1 is running financial decisions that should belong to System 2.

## The core biases you will learn

This level covers the 14 most important behavioral biases:

1. Loss aversion â€” losses hurt twice as much as gains feel good
2. Anchoring â€” first numbers you see distort all future judgements
3. Overconfidence â€” you know less than you think
4. Herd mentality â€” following the crowd into disaster
5. Recency bias â€” overweighting recent events
6. Confirmation bias â€” only seeking information that agrees with you
7. Mental accounting â€” treating money differently based on where it came from
8. Status quo bias â€” inaction feels safer than action
9. FOMO â€” fear of missing out drives terrible decisions
10. Sunk cost fallacy â€” past losses should not drive future decisions
11. Availability heuristic â€” vivid memories distort probability
12. Framing effect â€” how a choice is presented changes what you choose
13. Gambler''s fallacy â€” past random events affect future probabilities
14. Disposition effect â€” selling winners too early, holding losers too long

## The goal

You will never eliminate these biases â€” they are hardwired into human psychology. But by naming them, you can catch yourself and pause before System 1 makes an expensive mistake.

> "The investor''s chief problem â€” and even his worst enemy â€” is likely to be himself." â€” Benjamin Graham',
8, 1, TRUE, TRUE),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- LESSON 2: Loss aversion
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(behavioral_level_id,
'Loss aversion â€” why losses hurt twice as much as gains feel good',
'loss-aversion',
'# Loss aversion

## The most powerful force in behavioral finance

Kahneman and Tversky''s research found that **losses hurt approximately twice as much as equivalent gains feel good**.

Gaining â‚¹10,000 produces a certain level of happiness.
Losing â‚¹10,000 produces approximately **twice** that level of pain.

This asymmetry is called **loss aversion** and it drives more financial mistakes than any other bias.

## The experiment

Participants were given this choice:
- Option A: Guaranteed â‚¹30,000
- Option B: 80% chance of â‚¹45,000, 20% chance of nothing

Mathematically, Option B has a higher expected value (â‚¹36,000 vs â‚¹30,000). Yet most people chose Option A.

Then they were given:
- Option A: Guaranteed loss of â‚¹30,000
- Option B: 80% chance of losing â‚¹45,000, 20% chance of losing nothing

Now most people chose Option B â€” the riskier option â€” to avoid the certain loss.

**We become risk-averse to protect gains and risk-seeking to avoid losses.**

## How it destroys investor returns

**1. Selling winners too early**
You bought a stock at â‚¹100. It rises to â‚¹130. You sell to "lock in profits." The stock continues to â‚¹200. Loss aversion made you sell â€” you feared giving back your gain more than you wanted more gain.

**2. Holding losers too long**
Same stock. It falls to â‚¹70. You hold it â€” selling would make the loss "real." You wait, hoping to "get back to even." The stock falls to â‚¹30. The pain of realising the loss was worse than the pain of watching it fall further.

**3. Avoiding the market after crashes**
After a 40% market crash, loss aversion keeps investors in cash â€” missing the recovery. They wait until the market has recovered (paying higher prices) before re-entering.

## The solution: reframe losses

**Reframe #1**: Think in percentage terms, not rupees. A 10% loss on â‚¹1 lakh is the same decision as a 10% loss on â‚¹10 lakh â€” but feels very different.

**Reframe #2**: Think in portfolio terms, not individual stocks. One position losing 20% in a diversified portfolio may mean your total portfolio is down 2%.

**Reframe #3**: Pre-commit your sell rules. Write them down before you buy: "I will sell if the stock falls 15% from my buy price, regardless of emotion." Follow the rule.

**Reframe #4**: Think probabilistically. A loss today does not predict future losses. Price and value are different things.',
8, 2, TRUE, TRUE),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- LESSON 3: Anchoring bias
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(behavioral_level_id,
'Anchoring bias â€” why the first number you see controls everything after',
'anchoring-bias',
'# Anchoring bias

## The experiment that changed everything

Kahneman and Tversky spun a wheel of fortune in front of participants. The wheel was rigged to land on either 10 or 65. They then asked: "What percentage of African countries are in the United Nations?"

People who saw 10 on the wheel guessed an average of 25%.
People who saw 65 on the wheel guessed an average of 45%.

A completely random, irrelevant number powerfully distorted their estimates.

This is **anchoring** â€” the human tendency to rely too heavily on the first piece of information encountered.

## Anchoring in investing

**Stock price anchoring**
You bought a stock at â‚¹500. It falls to â‚¹300. You refuse to buy more â€” your brain is anchored to â‚¹500 as the "right" price. But â‚¹500 is just where you happened to buy. The real question is: what is the stock worth today?

**52-week high anchoring**
A stock trading at â‚¹200 used to trade at â‚¹800. Investors say "it''s cheap." But why is â‚¹800 the anchor? The company may have deteriorated fundamentally.

**IPO price anchoring**
If a stock IPOs at â‚¹200 and falls to â‚¹150, investors feel it is "discounted." But the IPO price was arbitrary â€” set by bankers to maximise proceeds for the seller.

**Salary anchoring**
The first salary number mentioned in a negotiation heavily influences the final offer. Whoever names the number first sets the anchor.

## Anchoring in real estate

Real estate agents show clients "overpriced" properties first. This sets a high anchor. When they later show the actual target property, it feels like good value by comparison.

Asking prices anchor buyers even when completely unjustified by fundamentals.

## How to counteract anchoring

**Rule 1**: Always ask â€” "What would I pay if I had no idea what this cost before?"

**Rule 2**: Generate your own estimate independently before looking at market price.

**Rule 3**: For stocks, value the business (DCF, peer multiples) before looking at the current share price.

**Rule 4**: When negotiating, anchor first with a reasoned, confident opening.

**Rule 5**: Actively seek information that contradicts your anchor to test whether it holds.',
7, 3, TRUE, TRUE),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- LESSON 4: Overconfidence bias
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(behavioral_level_id,
'Overconfidence â€” the most expensive bias in investing',
'overconfidence-bias',
'# Overconfidence bias

## The Lake Wobegon effect

In the fictional town of Lake Wobegon, "all the children are above average." This is statistically impossible â€” but studies show:

- 93% of American drivers think they are above-average drivers
- 85% of fund managers believe they will outperform the market
- 74% of people believe they are more ethical than average
- Most investors believe their portfolios will outperform

This is **overconfidence** â€” a systematic overestimation of one''s own knowledge, skills, and ability to predict outcomes.

## Three types of overconfidence

**Overprecision**: Believing your estimates are more accurate than they are.
Investor: "This stock will reach â‚¹500 in 12 months." (How confident are you? You should be very uncertain.)

**Overplacement**: Believing you are better than average at investing.
Reality: 80%+ of active fund managers underperform their index over 10+ years. Individual investors do even worse.

**Overestimation**: Overestimating your absolute ability.
Thinking you can consistently predict market movements is overestimation. Almost no one can.

## The trading study

Professors Brad Barber and Terrance Odean studied 66,465 US investor accounts from 1991â€“1996. Key findings:

- The average investor underperformed the market by 1.1% annually
- **Men** underperformed by 2.65% annually (overconfident trading)
- **Women** underperformed by only 1.72% (less overconfidence)
- The more actively an investor traded, the worse they performed

**The more you trade, the more overconfidence you are demonstrating â€” and the worse your returns.**

## Why overconfidence is so expensive

1. **Over-trading**: You think you can time the market. Each trade costs brokerage and taxes.
2. **Under-diversification**: Concentrated bets in stocks you "know" will win.
3. **Ignoring base rates**: Assuming your situation is exceptional rather than typical.
4. **Insufficient hedging**: Not buying insurance (stop-losses, options) because you expect to be right.

## The calibration solution

A well-calibrated investor says: "I think there''s a 60% chance this stock outperforms over 3 years." Not "this stock will definitely go up."

Practice probabilistic thinking. Keep a record of your predictions with confidence levels. Review it annually. You will quickly see where your confidence exceeds your accuracy.',
8, 4, TRUE, TRUE),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- LESSON 5: Herd mentality
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(behavioral_level_id,
'Herd mentality â€” why we follow the crowd into financial disaster',
'herd-mentality',
'# Herd mentality

## The social animal problem

Humans evolved to follow the group. In prehistoric times, if your tribe ran from something, you ran too â€” or you died. The instinct to follow the crowd was survival.

In financial markets, this instinct becomes catastrophic.

**Herd mentality** is the tendency to follow and copy what other investors are doing, driven by social pressure, FOMO, and the assumption that the crowd must know something you do not.

## Famous herds

**Dot-com bubble (1999-2000)**: Every loss-making internet company was worth billions because "everyone" was buying tech. People quit jobs to day-trade. Valuations were completely divorced from fundamentals. The NASDAQ fell 78% from peak to trough.

**US Housing Crisis (2007-2008)**: Everyone was buying property because "property prices never fall." Banks lent to anyone. $8 trillion in household wealth was destroyed.

**Crypto 2021**: Bitcoin reached $69,000. Everyone''s cousin was making money in crypto. Retail investors poured in near the peak. Bitcoin fell 77% from peak.

**Indian Smallcap Frenzy (2017)**: Small-cap stocks rose 50%+ in 18 months. Retail SIPs poured into small-cap funds. The BSE Smallcap index then fell 60% from peak.

## Why herds form

1. **Informational cascade**: If many smart people are buying, maybe they know something. You follow.
2. **Social proof**: "Everyone'' is doing it, so it must be right."
3. **Fear of being wrong alone**: Being wrong with the crowd feels less painful than being wrong alone.
4. **Media amplification**: News covers what is already happening, amplifying momentum.

## The contrarian advantage

Warren Buffett: "Be fearful when others are greedy, and greedy when others are fearful."

The best time to buy is usually when sentiment is most negative and the herd has sold. The best time to sell is usually when sentiment is most positive and the herd is buying.

This is psychologically very difficult. Selling when everyone is euphoric feels wrong. Buying when the news is terrible feels wrong.

## Practical herd-detection

Ask yourself before any investment:
- Is this being covered enthusiastically on mainstream news and social media?
- Are people who normally ignore investing suddenly excited about this?
- Have prices already risen substantially to reflect current enthusiasm?
- Am I buying because of genuine analysis or because everyone else is?

If yes to the first three â€” extreme caution is warranted.',
8, 5, TRUE, TRUE);

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- LESSONS 6-15: Remaining behavioral finance lessons
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES
(behavioral_level_id,
'Recency bias â€” why recent events distort your financial judgement',
'recency-bias',
'# Recency bias

## What is recency bias?

**Recency bias** is the tendency to give disproportionate weight to recent events when making predictions about the future.

Whatever happened recently feels like it will continue forever. Bull markets feel like they will never end. Bear markets feel like permanent catastrophe.

## How it damages investors

**After bull markets**: Investors extrapolate recent gains. "The market has returned 20% for 3 years â€” this is the new normal." They increase equity allocation near market tops. When the correction comes, they are overweight equities at exactly the wrong time.

**After bear markets**: Investors extrapolate recent losses. "Markets always fall. Equity investing is dangerous." They reduce equity allocation near market bottoms. They miss the recovery.

**The SIP stopping problem**: Investors start SIPs during bull markets (recent good returns). When markets fall 30%, they stop SIPs (recent bad returns). This is exactly backwards â€” a falling market means each SIP buys more units at lower prices.

## The data

Studies of mutual fund flows consistently show:
- Maximum inflows to equity funds occur near market tops
- Maximum outflows from equity funds occur near market bottoms

Individual investors buy high and sell low â€” driven primarily by recency bias.

## The solution

**Base rate thinking**: Instead of "markets have been falling recently," ask "what has been the historical return of Indian equities over any 10-year period?" The answer (almost always positive) grounds your expectations in long-term data rather than recent events.

**Automate**: SIPs that run automatically remove recency bias from the decision. The system invests regardless of recent market direction.

**Review your investment thesis, not recent prices**: Did the original reason you invested change? If not, recent price movements are irrelevant noise.',
7, 6, TRUE, FALSE),

(behavioral_level_id,
'Confirmation bias â€” why you only hear what you already believe',
'confirmation-bias',
'# Confirmation bias

## The echo chamber problem

**Confirmation bias** is the tendency to search for, interpret, favour, and recall information in a way that confirms your pre-existing beliefs.

Once you believe something about a stock, company, or market, your brain automatically filters information to confirm that belief and ignores contradictory evidence.

## In practice

You bought shares of a company. Now:
- You read bullish articles about the company and find them convincing
- You dismiss bearish articles as "the author doesn''t understand the business"
- You join online communities of other holders of the same stock
- You interpret ambiguous news positively

Meanwhile, the fundamental business is deteriorating â€” but your confirmation bias filters it out.

## The social media amplification

Social media algorithms show you more content you engaged with positively. If you engaged with bullish content about a stock, you will see more bullish content. Your feed becomes an echo chamber confirming your existing views.

## Famous cases

**Satyam (2009)**: Many analysts maintained buy ratings on Satyam right up to the accounting fraud revelation. They had built a bullish thesis and kept confirming it despite warning signs.

**Retail investors in penny stocks**: Once someone believes a penny stock has "hidden value," every piece of ambiguous information gets interpreted as confirmation.

## The solution: Red team your investments

Before buying any investment, spend 30 minutes looking specifically for reasons you are WRONG.

Ask: "If this investment fails, what will the reason be?"
Find the best argument against your thesis.
Read the most credible bear cases.

If you cannot find good bear arguments, you are not looking hard enough â€” or you have already fallen into confirmation bias.

Also: follow analysts who disagree with you. Their arguments will either strengthen your thesis (if you can counter them) or save you from a mistake.',
7, 7, TRUE, FALSE),

(behavioral_level_id,
'Mental accounting â€” why you treat money differently based on where it came from',
'mental-accounting',
'# Mental accounting

## The fungibility problem

Money is fungible â€” â‚¹1,000 is â‚¹1,000 regardless of where it came from. But humans do not treat it that way.

**Mental accounting** is the tendency to treat money differently based on its source, intended purpose, or arbitrary categorisation â€” even when doing so leads to irrational decisions.

## Classic examples

**Bonus money**: You receive a â‚¹50,000 year-end bonus. You spend it on a luxury holiday without guilt. But if you received â‚¹50,000 as part of your salary, you would carefully invest it. The money is identical â€” only the label differs.

**Winning at a casino**: Someone wins â‚¹5,000 at a casino. They then gamble it recklessly because "it''s house money." But â‚¹5,000 is â‚¹5,000 â€” it is now your money, earned through luck.

**Tax refunds**: People treat tax refunds as a windfall and splurge. But a tax refund is your own money that was over-withheld. It should be treated the same as any other income.

**Salary vs trading profits**: Investors take more risk with trading profits than with salary. "I can afford to lose this because I made it in the market." But your net worth is your net worth regardless of source.

## The household budget problem

Many Indians keep money in separate mental buckets:
- "This FD is for emergency only" (earning 6%)
- "This loan is for education" (paying 10%)

Rationally, they should use the FD to partially repay the loan. But mentally, the buckets feel separate.

## The opportunity cost trap

Mental accounting leads to ignoring opportunity costs. Someone might spend 3 hours driving to a different petrol station to save â‚¹200. That same person would not take 3 hours of freelance work for â‚¹200. But the time cost is identical.

## The solution

**Treat all money as interchangeable**. Before any financial decision, ask: "Would I make this same decision if this money came from a different source?"

**Use total net worth as your measuring stick**, not individual account balances.

**Think in opportunity costs**: "What else could this â‚¹10,000 do for me?"',
7, 8, TRUE, FALSE),

(behavioral_level_id,
'FOMO and status quo bias â€” the twin forces that paralyse investors',
'fomo-status-quo-bias',
'# FOMO and status quo bias

## Two opposing forces that both hurt you

These two biases seem contradictory â€” but they both damage investment returns in different market environments.

## Fear of Missing Out (FOMO)

**FOMO** is the anxiety that others are experiencing rewarding opportunities from which you are absent.

In investing: when markets are rising and everyone around you is making money, FOMO drives you to invest at exactly the wrong time â€” near market tops.

FOMO triggers:
- WhatsApp groups full of people sharing their gains
- News articles about people getting rich in crypto / real estate / IPOs
- Colleagues buying new cars and taking holidays from "investing profits"
- Social media posts about overnight wealth

The FOMO investor buys at peak valuation. They have paid the highest price for the most-talked-about assets. Returns are almost always disappointing.

## Status quo bias

**Status quo bias** is the preference for the current state of affairs. Change feels risky. Inaction feels safe.

In investing, status quo bias causes:
- Keeping money in a savings account at 4% for years because "switching feels complicated"
- Not rebalancing a portfolio even when asset allocation has drifted significantly
- Keeping a losing stock because selling requires active decision
- Not starting a SIP because "I''ll do it next month"

The status quo investor loses through inaction â€” inflation erodes savings while they wait for the "right time."

## The paradox

FOMO and status quo bias alternate depending on market conditions:

**Bull market**: FOMO is strong â†’ over-investment at high prices
**Bear market**: Status quo kicks in â†’ no action, missing recovery
**Long flat market**: Status quo â†’ not investing at all

## The systematic solution

The answer to both biases is the same: **automation**.

A SIP that runs automatically on the 1st of every month removes:
- FOMO (you invest regardless of whether markets are exciting)
- Status quo bias (the investment happens without active decision)

Set up automatic investments once and let the system override your psychological biases.',
7, 9, TRUE, FALSE),

(behavioral_level_id,
'The sunk cost fallacy â€” why past losses should never drive future decisions',
'sunk-cost-fallacy',
'# The sunk cost fallacy

## The most rational rule in finance

> **Past costs that cannot be recovered should have zero influence on future decisions.**

This is the principle of sunk costs. It is mathematically correct. It is also one of the hardest things for humans to follow.

## What is a sunk cost?

A **sunk cost** is any cost that has already been incurred and cannot be recovered â€” regardless of what you do next.

Money already spent. Time already invested. Emotional energy already committed.

The rational rule: **ignore sunk costs entirely when making future decisions.**

## Classic examples

**The bad stock**: You bought a stock at â‚¹500. It falls to â‚¹200. You hold it because you "cannot afford to lose â‚¹300." But the â‚¹300 is already gone whether you sell or hold. The correct question is: "Given current information, is â‚¹200 a good price for this company?" Not: "Will it get back to â‚¹500?"

**The unused gym membership**: You paid â‚¹12,000 for an annual gym membership. After 2 months, you realise you hate going to this gym. You keep forcing yourself to go to "get your money''s worth." But the â‚¹12,000 is gone. The question is: "Does going to this gym add value to my life now?" Not: "How do I recover the â‚¹12,000?"

**The failed business**: An entrepreneur has invested â‚¹50 lakh into a failing business. Revenue is declining. Every month loses money. They keep investing to "not waste what they''ve already put in." But the â‚¹50 lakh is gone. The correct question is: "Will future investment create a viable business?" evaluated with fresh eyes.

## Why we fall for it

Admitting a sunk cost means admitting a mistake. Our brains protect our ego by continuing to justify past decisions. Selling the bad stock "makes the loss real." Closing the business "means I failed."

But the loss is already real â€” whether or not you acknowledge it.

## The clean-slate test

For any investment decision, ask: "If I had no prior history with this investment â€” if I were evaluating it with fresh eyes for the first time today â€” would I choose it?"

If no â€” sell. Past cost is irrelevant.
If yes â€” hold. But for the right reason.',
7, 10, TRUE, FALSE),

(behavioral_level_id,
'The disposition effect â€” selling winners too soon, holding losers too long',
'disposition-effect',
'# The disposition effect

## The most documented pattern in investor behaviour

The **disposition effect** is the tendency to sell investments that have increased in value (winners) too early, while holding investments that have decreased in value (losers) too long.

It is the combination of loss aversion (holding losers to avoid realising losses) and the desire to lock in gains (selling winners to feel smart).

## The data

Terrance Odean studied 10,000 investor accounts and found:
- Investors were 50% more likely to sell a winning stock than a losing stock
- Stocks they sold outperformed by 3.4% over the next year
- Stocks they held (losers) underperformed by 1% over the next year

The net result: their decisions consistently destroyed value. They sold the stocks that would have made them money and held the stocks that cost them money.

## The tax consequence

In India, this bias is especially expensive. Long-term capital gains (held >1 year) are taxed at 10% above â‚¹1 lakh. Short-term gains (held <1 year) are taxed at 15%.

Investors who sell winners early (disposition effect) often sell within 12 months, converting long-term gains into short-term gains â€” paying 50% more tax unnecessarily.

Meanwhile, holding losers prevents them from harvesting tax losses that could offset gains.

## The correct approach

**For winners**: Do not sell because a stock has risen. Sell if the original thesis is broken, the stock is significantly overvalued, or you need to rebalance. Rising price is not a sell signal.

**For losers**: Do not hold because a stock has fallen. Hold if the original thesis is intact and the stock is now better value. Falling price is not a hold signal.

**Reframe the question**: Instead of "This stock is up 40% â€” should I lock in profits?" ask "If I had cash today, would I buy this stock at the current price?"

If yes â€” hold. If no â€” sell. The prior purchase price is irrelevant.',
7, 11, TRUE, FALSE),

(behavioral_level_id,
'Availability heuristic â€” why vivid memories distort probability',
'availability-heuristic',
'# The availability heuristic

## Probability by memory

The **availability heuristic** is a mental shortcut where the probability you assign to an event is based on how easily an example comes to mind â€” not on actual statistical frequency.

Events that are recent, vivid, emotionally charged, or heavily covered by media feel more likely than they actually are.

## In finance

**Plane crashes vs car accidents**: After a highly publicised plane crash, demand for air travel drops significantly. But statistically, driving to the airport is more dangerous than flying. The crash was vivid and available in memory; car accidents are ordinary and not.

**Stock market crashes**: After the 2008 financial crisis, many investors left equities permanently â€” convinced the market would crash again immediately. The 2008 crash was vivid and available. The historical data showing 10%+ annual long-term returns was statistical and abstract.

**COVID crash (March 2020)**: Many investors sold equities during the COVID crash â€” convinced we were entering a prolonged depression. Markets recovered within months. The vivid disaster narrative overwhelmed the statistical base rate of market recoveries.

**Rare but vivid risks**: Investors over-insure against dramatic but unlikely events (plane crashes, terrorism, nuclear power accidents) and under-insure against common but boring risks (job loss, illness, inflation).

## The media amplification problem

News media covers dramatic, unusual events â€” not boring statistical reality. A 1-in-10,000 event that kills 10 people gets front-page coverage. Heart disease that kills 17 lakh Indians per year gets a small mention.

Your assessment of risk is therefore distorted by what the media shows you â€” not what is actually likely.

## The solution: base rates

Before estimating any probability, ask:
"What is the historical base rate for this type of event?"

- "Will this company''s earnings grow?" â†’ What % of Indian companies grow earnings over 5 years?
- "Will this market crash last more than 2 years?" â†’ What % of bear markets lasted more than 2 years historically?
- "Will this new business succeed?" â†’ What % of startups in this sector survive 5 years?

Ground your probability estimates in data, not vivid memories.',
7, 12, TRUE, FALSE),

(behavioral_level_id,
'Framing effect and gambler''s fallacy â€” how presentation and patterns fool you',
'framing-gambler-fallacy',
'# Framing effect and gambler''s fallacy

## Part 1: The framing effect

**Definition**: The same information presented differently leads to different decisions.

**The classic experiment**:
Group A was told: "This surgery has a 90% survival rate."
Group B was told: "This surgery has a 10% mortality rate."

These are identical statements. Group A chose surgery far more often than Group B.

The frame â€” survival vs mortality â€” completely changed the decision.

## Framing in finance

**Fund performance framing**:
- "This fund lost only 15% when the market fell 25%" â†’ sounds like success
- "This fund lost 15% of your money" â†’ sounds like failure
Same fact, different emotional response.

**Product fee framing**:
- "Only â‚¹999/month" â†’ sounds small
- "â‚¹11,988/year" â†’ sounds large
- "â‚¹1.2 lakh over 10 years" â†’ sounds large

Insurance companies, subscription services, and financial product sellers expertly use framing to make costs seem smaller.

**Return framing**:
- "Returns of 12% p.a." â†’ impressive
- "Your â‚¹1 lakh becomes â‚¹3.1 lakh in 10 years" â†’ sounds the same but feel different

## Counteracting framing

Before making any financial decision, **reframe it yourself**:
- Convert monthly to annual to lifetime costs
- Convert survival rates to mortality rates and back
- Calculate absolute rupee amounts, not just percentages

## Part 2: The gambler''s fallacy

**Definition**: The mistaken belief that if something happens more frequently than normal during a given period, it will happen less frequently in the future (or vice versa) â€” even when events are independent.

**Classic case**: A coin has landed heads 5 times in a row. Many people believe tails is now "due." But each coin flip is independent. The probability of tails is always 50%.

**In markets**: "The market has fallen 3 months in a row â€” it must bounce next month." Markets are not coins, but month-to-month returns are largely independent. Past consecutive losses do not make a recovery more likely.

**The hot hand fallacy** (opposite error): "This fund manager has outperformed for 3 years â€” they must be skilled." But most outperformance is luck. Past performance does not predict future performance for most active managers.',
7, 13, TRUE, FALSE),

(behavioral_level_id,
'Overcoming biases â€” building a system that protects you from yourself',
'overcoming-biases',
'# Overcoming behavioral biases â€” a practical system

## The bad news

You cannot eliminate behavioral biases. They are evolutionarily hardwired and deeply unconscious. Even professional fund managers who know these biases intimately fall victim to them.

## The good news

You can **design systems** that protect you from your own psychology.

## The 8-part investor protection system

**1. Automate everything**
- Set up SIPs that invest automatically on a fixed date
- Set up automatic rebalancing (or review quarterly with a rule: "If any asset class moves more than 5% from target, rebalance")
- Remove manual decision points wherever possible

**2. Write an investment policy statement**
Before buying anything, write down:
- Why you are buying it
- What would make you sell it (price drop % OR thesis broken)
- How much of your portfolio it should be
- Time horizon

Refer to this document, not your emotions, when markets move.

**3. Create a waiting period**
Never make a major financial decision the same day you encounter the idea. Minimum 48 hours for any investment over â‚¹50,000. One week for any investment over â‚¹5 lakh.

**4. Seek disconfirming evidence**
Before every investment, spend 30 minutes finding the strongest case AGAINST your thesis. If you cannot find good counter-arguments, search harder.

**5. Keep a decision journal**
Record every significant financial decision with your reasoning and confidence level. Review annually. You will discover your pattern of mistakes.

**6. Limit financial media consumption**
Financial news is designed to provoke emotional reactions. Checking your portfolio daily or reading financial news constantly increases emotional decision-making. Weekly or monthly reviews are enough for long-term investors.

**7. Use a financial advisor as an emotional buffer**
A good advisor''s primary value is not stock-picking â€” it is preventing you from making panic decisions during market crashes. Having to explain your reasoning to another person catches many bias-driven decisions.

**8. Pre-commit your rules**
Write down specific rules before emotional situations arise:
- "I will not sell more than 20% of my equity holdings in any single month, regardless of market conditions"
- "I will continue SIPs even if markets fall 40%"
- "I will rebalance when equity exceeds my target allocation by 5%"

Rules made in advance, outside emotional moments, protect you from rules made in the heat of panic or euphoria.',
8, 14, TRUE, FALSE),

(behavioral_level_id,
'Behavioral finance recap â€” the 14 biases and how to beat them',
'behavioral-finance-recap',
'# Behavioral finance recap

## What you have learned

You now understand the 14 most important psychological biases that destroy investor returns â€” and practical systems to counteract them.

## The 14 biases â€” quick reference

| Bias | What it makes you do | The antidote |
|------|---------------------|--------------|
| Loss aversion | Hold losers, sell winners too early | Pre-commit sell rules |
| Anchoring | Fixate on irrelevant first numbers | Independent valuation first |
| Overconfidence | Trade too much, diversify too little | Track record keeping |
| Herd mentality | Buy high, sell low with the crowd | Contrarian checklist |
| Recency bias | Extrapolate recent trends forever | Base rate thinking |
| Confirmation bias | Only seek agreeing evidence | Red team your thesis |
| Mental accounting | Treat money differently by source | One net worth view |
| Status quo bias | Inaction even when action is needed | Automation |
| FOMO | Buy at market tops | Systematic SIP |
| Sunk cost fallacy | Hold bad investments to recover losses | Clean-slate test |
| Disposition effect | Sell winners, hold losers | Thesis-based decisions |
| Availability heuristic | Overweight vivid recent events | Historical base rates |
| Framing effect | Decide based on presentation, not facts | Reframe every decision |
| Gambler''s fallacy | Believe past random events predict future | Independence reminder |

## The core insight

**Your biggest financial enemy is yourself.**

Not the market. Not the economy. Not inflation. Not bad luck.

The systematic, predictable mistakes driven by your own psychology consistently destroy more wealth than any external force.

**The best investors are not those with the highest IQ or best information â€” they are those with the best emotional discipline.**

Warren Buffett, Charlie Munger, and Howard Marks consistently emphasise psychology over intelligence as the key to long-term investment success.

## Your action list

1. Set up automatic SIPs if you have not already
2. Write an investment policy statement for your portfolio
3. Create a 48-hour waiting rule for all investments above â‚¹50,000
4. Start a decision journal â€” record every significant financial decision
5. Identify your personal dominant bias (loss aversion? overconfidence? herd mentality?) and design a specific system to counteract it

## What comes next

Understanding behavioral finance makes you a better investor in every other track. Apply these insights to:
- Trading: avoid overtrading, revenge trading, FOMO entries
- Crypto: recognise herd behavior and recency bias in crypto cycles
- Corporate finance: avoid sunk cost traps in business decisions
- Personal finance: overcome status quo bias that keeps money in low-yield accounts

Take the final quiz to complete this level and earn your Behavioral Finance certificate.',
7, 15, TRUE, FALSE);

END IF;

END $$;

-- Add quizzes for first 5 lessons
DO $$
DECLARE
  l1_id UUID; l2_id UUID; l3_id UUID; l4_id UUID; l5_id UUID;
  q1 UUID; q2 UUID; q3 UUID; q4 UUID; q5 UUID;
BEGIN
  SELECT id INTO l1_id FROM lessons WHERE slug = 'what-is-behavioral-finance';
  SELECT id INTO l2_id FROM lessons WHERE slug = 'loss-aversion';
  SELECT id INTO l3_id FROM lessons WHERE slug = 'anchoring-bias';
  SELECT id INTO l4_id FROM lessons WHERE slug = 'overconfidence-bias';
  SELECT id INTO l5_id FROM lessons WHERE slug = 'herd-mentality';

  IF l1_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM quizzes WHERE lesson_id = l1_id
  ) THEN
    -- Run quiz inserts only when the first quiz has not already been seeded.
  INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l1_id, 'Behavioral Finance Intro', 70) RETURNING id INTO q1;
  INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
  (q1, 'What did Kahneman and Tversky discover about human financial decision-making?',
  '["Humans are perfectly rational with money", "Humans make predictable, systematic mistakes driven by psychology", "Humans always maximise expected value", "Emotions have no effect on financial decisions"]',
  1, 'Kahneman and Tversky proved through decades of research that humans make systematic, predictable irrational decisions â€” the foundation of behavioral finance.', 1),
  (q1, 'Which system of thinking is most likely to cause investment mistakes?',
  '["System 2 â€” slow, deliberate thinking", "System 1 â€” fast, automatic, emotional thinking", "Both systems equally", "Neither â€” investment decisions are always rational"]',
  1, 'System 1 is fast and emotional â€” it makes snap judgements based on feelings and shortcuts. When it hijacks financial decisions that need System 2''s careful analysis, mistakes follow.', 2),
  (q1, 'What is the practical goal of studying behavioral finance?',
  '["Eliminating all emotions from investing", "Naming your biases so you can pause before acting on them", "Predicting market crashes", "Beating the market consistently"]',
  1, 'You cannot eliminate biases â€” they are hardwired. But by naming them and recognising them, you can pause before acting on emotion and give System 2 a chance to evaluate the decision.', 3);

  INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l2_id, 'Loss Aversion', 70) RETURNING id INTO q2;
  INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
  (q2, 'According to Kahneman and Tversky, how much more painful is a loss compared to an equivalent gain?',
  '["Equal â€” losses and gains feel the same", "About twice as painful", "About 10 times as painful", "Losses actually feel better than gains"]',
  1, 'Loss aversion research shows losses hurt approximately twice as much as equivalent gains feel good. This asymmetry drives most investor mistakes.', 1),
  (q2, 'An investor bought a stock at â‚¹1,000. It falls to â‚¹600. They refuse to sell because "selling makes the loss real." What bias is this?',
  '["Overconfidence", "Anchoring", "Loss aversion â€” holding a loser to avoid realising the loss", "Herd mentality"]',
  2, 'This is classic loss aversion combined with the sunk cost fallacy. The investor is avoiding the psychological pain of realising a loss, even though the loss already exists in their portfolio.', 2),
  (q2, 'What is the best pre-commitment strategy to counteract loss aversion?',
  '["Never sell any stock", "Write sell rules before buying: sell if thesis breaks or stock falls X%", "Sell every stock that falls 5%", "Ignore losses and focus on gains"]',
  1, 'Pre-committing to specific sell rules â€” defined before emotional involvement â€” removes the decision from the moment of maximum emotional pain.', 3);

  INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l3_id, 'Anchoring Bias', 70) RETURNING id INTO q3;
  INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
  (q3, 'In Kahneman''s wheel-of-fortune experiment, what did participants use as an anchor for their UN membership estimate?',
  '["Their general knowledge", "A completely random number from a wheel spin", "Recent news they had read", "Official statistics they were given"]',
  1, 'Participants used the random wheel number (10 or 65) as an anchor for their estimate of UN membership. This proved that completely irrelevant numbers distort subsequent judgements.', 1),
  (q3, 'An investor refuses to buy more of a stock at â‚¹300 because they bought it at â‚¹500. What is the correct approach?',
  '["Never average down", "Always buy more when a stock falls", "Evaluate whether â‚¹300 is a good price based on current fundamentals, ignoring the â‚¹500 purchase price", "Wait until it returns to â‚¹500"]',
  2, 'The â‚¹500 purchase price is an anchor â€” an irrelevant historical fact. The correct question is: is â‚¹300 a good price for this business today? Past purchase prices should not influence current decisions.', 2),
  (q3, 'How can you counteract anchoring when valuing a stock?',
  '["Look at the current price first to get context", "Generate your own valuation estimate before looking at market price", "Follow analyst price targets", "Use the 52-week high as your anchor"]',
  1, 'By forming your own independent valuation before seeing market price, you anchor to your own analysis rather than the current price. This protects against price-anchoring distortions.', 3);

  INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l4_id, 'Overconfidence', 70) RETURNING id INTO q4;
  INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
  (q4, 'What did Barber and Odean find about investors who traded most actively?',
  '["They earned the highest returns", "They had the worst returns â€” overconfident trading destroys performance", "They broke even on average", "Active trading had no effect on returns"]',
  1, 'Barber and Odean''s landmark study found that the most active traders had the worst returns. Overconfident trading generated higher costs (brokerage, taxes) while producing no additional alpha.', 1),
  (q4, 'What does "calibration" mean in the context of investing?',
  '["Being 100% confident in your predictions", "Having your confidence level accurately match your actual accuracy rate", "Always predicting 50/50 outcomes", "Only investing in certain outcomes"]',
  1, 'A calibrated investor says "I think there''s a 60% chance this works" and is right about 60% of the time when they say that. Most investors are overconfident â€” right far less often than they believe.', 2),
  (q4, 'Which finding from investor studies best demonstrates overconfidence?',
  '["85% of fund managers believe they will outperform the market", "Most investors lose money", "Diversification reduces risk", "Markets go up over time"]',
  0, 'Only about 20% of active fund managers actually outperform their benchmark over 10 years â€” yet 85% believe they will. This massive gap between belief and reality is the definition of overconfidence.', 3);

  INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l5_id, 'Herd Mentality', 70) RETURNING id INTO q5;
  INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
  (q5, 'Why did humans evolve herd mentality behavior?',
  '["To make better financial decisions", "Social following was a survival mechanism â€” the tribe runs, you run", "To help markets function efficiently", "It was a cultural development, not evolutionary"]',
  1, 'Herd mentality evolved because following the group was genuinely a survival advantage in prehistoric times. The instinct is deeply wired and transfers destructively to financial markets.', 1),
  (q5, 'What do mutual fund inflow and outflow data consistently show about retail investor timing?',
  '["Investors buy at market bottoms and sell at tops", "Maximum inflows occur near market tops; maximum outflows near market bottoms", "Investors time the market well", "There is no pattern in investor flows"]',
  1, 'Studies consistently show that maximum money flows INTO equity funds near market tops (peak optimism) and OUT of equity funds near market bottoms (peak fear) â€” the classic herd pattern of buying high and selling low.', 2),
  (q5, 'Warren Buffett''s famous advice directly addresses herd mentality. What is it?',
  '["Follow the crowd â€” they are usually right", "Be fearful when others are greedy, and greedy when others are fearful", "Never invest in stocks", "Always hold cash during uncertainty"]',
  1, 'Buffett''s advice is the antidote to herd mentality â€” buy when fear is maximum (when the herd is selling at the bottom) and be cautious when euphoria is maximum (when the herd is buying at the top).', 3);
  END IF;
END $$;



