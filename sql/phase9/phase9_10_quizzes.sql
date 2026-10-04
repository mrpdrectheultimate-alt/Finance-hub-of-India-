-- ============================================================
-- FinanceHub — Phase 9 & 10 Quizzes
-- phase9_10_quizzes.sql
-- 200+ questions across 24 new lesson quizzes
-- Run AFTER: phase9_lessons.sql, phase10_cases_hindi.sql
-- ============================================================

DO $QUIZZES$
DECLARE
  q_id UUID;
BEGIN

-- ═══════════════════════════════════════════════════════════
-- HELPER: create quiz + insert questions
-- ═══════════════════════════════════════════════════════════

-- QUIZ 1: Futures and Options Basics
INSERT INTO quizzes (lesson_id, title, passing_score, xp_reward)
SELECT id, 'F&O Basics Quiz', 70, 25
FROM lessons WHERE slug = 'futures-options-basics'
AND NOT EXISTS (SELECT 1 FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='futures-options-basics');

SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='futures-options-basics' LIMIT 1;

IF q_id IS NOT NULL THEN
INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
VALUES
(q_id,'What does "derivative" mean in financial markets?',
'A share that pays dividends','A financial contract whose value is derived from an underlying asset',
'A type of mutual fund','A government bond',
'b','A derivative derives its value from an underlying asset like a stock, index, or commodity. You buy a contract ABOUT the asset, not the asset itself.',1),

(q_id,'What is the key difference between a futures contract and an options contract?',
'Futures are cheaper than options',
'Futures obligate both parties; options give the buyer a right but not obligation',
'Options are traded on exchanges; futures are not',
'Futures expire monthly; options do not expire',
'b','Futures = obligation for both parties. Options = right (not obligation) for the buyer. The buyer of an option can let it expire worthless — maximum loss is the premium paid.',2),

(q_id,'What is the maximum loss for an option buyer?',
'Unlimited','Equal to the underlying asset value',
'The premium paid','50% of the premium paid',
'c','The maximum loss for an option BUYER is the premium paid. This is why buying options is considered limited-risk for the buyer (though premium can still be a significant amount).',3),

(q_id,'According to SEBI''s 2023 study, what percentage of individual F&O traders lost money?',
'45%','62%','75%','89%',
'd','SEBI''s 2023 study of 1 crore F&O traders found 89% made losses, with average loss of ₹1.1 lakh per year. Only 3.5% were consistently profitable.',4),

(q_id,'NIFTY futures lot size is 50. You buy 1 lot at 22,000 and NIFTY rises to 22,500. What is your profit?',
'₹500','₹5,000','₹25,000','₹22,500',
'c','Profit = (22,500 - 22,000) × 50 lot size = 500 × 50 = ₹25,000.',5),

(q_id,'What is a "Call Option"?',
'Right to sell at a fixed price','Right to buy at a fixed price',
'Obligation to buy at a fixed price','A type of futures contract',
'b','A Call option gives the BUYER the RIGHT (not obligation) to BUY the underlying asset at the strike price on or before expiry.',6),

(q_id,'When does an NSE options contract typically expire?',
'First Monday of the month','Last Thursday of the month',
'15th of the month','First Friday of the month',
'b','NSE options (and futures) expire on the last Thursday of each month. Weekly expiries also exist on Thursdays.',7),

(q_id,'What is "margin" in futures trading?',
'The profit from a trade',
'A deposit required to hold a futures position',
'The difference between buy and sell price',
'The brokerage commission',
'b','Margin is a good-faith deposit (typically 10-15% of contract value) required to hold a futures position. Daily mark-to-market adjusts this based on price movements.',8);
END IF;

-- QUIZ 2: Options Greeks
SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='options-greeks-explained' LIMIT 1;
IF q_id IS NULL THEN
  INSERT INTO quizzes (lesson_id, title, passing_score, xp_reward)
  SELECT id, 'Options Greeks Quiz', 70, 25 FROM lessons WHERE slug='options-greeks-explained';
  SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='options-greeks-explained' LIMIT 1;
END IF;
IF q_id IS NOT NULL THEN
INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
VALUES
(q_id,'A call option has Delta = 0.6. If the underlying stock rises by ₹10, how much does the option price change approximately?',
'₹10','₹6','₹0.6','₹60',
'b','Delta × Price change = 0.6 × ₹10 = ₹6 approximate change in option premium.',1),

(q_id,'Which Greek measures how much an option loses value each day purely from time passing?',
'Delta','Gamma','Theta','Vega',
'c','Theta measures time decay — the daily erosion of option premium due to passage of time. It is always negative for option buyers.',2),

(q_id,'An option has Vega = ₹40. If Implied Volatility rises by 1%, the option price changes by:',
'₹0.40','₹4','₹40','₹400',
'c','Vega of ₹40 means a 1% rise in Implied Volatility increases option premium by approximately ₹40.',3),

(q_id,'Which option typically has the HIGHEST Gamma?',
'Deep in-the-money option with 90 days to expiry',
'Far out-of-the-money option with 90 days to expiry',
'At-the-money option with 1 day to expiry',
'At-the-money option with 30 days to expiry',
'c','ATM options near expiry have the highest Gamma — Delta changes very rapidly. This is why weekly expiry options on Thursday can move explosively.',4),

(q_id,'What does it mean for an option buyer when Theta is -₹20/day?',
'The option gains ₹20 per day automatically',
'The option loses ₹20 per day purely from time passing',
'The option''s delta changes by ₹20 per day',
'The option needs ₹20 extra margin per day',
'b','Negative Theta means the option premium erodes by ₹20 per day as time passes, all else equal. Option sellers benefit from this (positive Theta).',5),

(q_id,'When should you generally BUY options according to Vega strategy?',
'When Implied Volatility is very high',
'When Implied Volatility is very low, before an expected high-volatility event',
'When the stock is not moving at all',
'After the earnings announcement has passed',
'b','Buy options when IV is low (cheaper) and before expected volatility events. Buying when IV is already high means you pay a premium for volatility that may not materialize.',6);
END IF;

-- QUIZ 3: Ratio Analysis
SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='ratio-analysis-complete' LIMIT 1;
IF q_id IS NULL THEN
  INSERT INTO quizzes (lesson_id, title, passing_score, xp_reward)
  SELECT id, 'Ratio Analysis Quiz', 70, 25 FROM lessons WHERE slug='ratio-analysis-complete';
  SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='ratio-analysis-complete' LIMIT 1;
END IF;
IF q_id IS NOT NULL THEN
INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
VALUES
(q_id,'A stock trades at ₹200 and EPS is ₹10. What is the P/E ratio?',
'10','20','200','2',
'b','P/E = Price / EPS = ₹200 / ₹10 = 20x. This means investors pay ₹20 for each ₹1 of annual earnings.',1),

(q_id,'Company PAT = ₹100 crore, Shareholders Equity = ₹500 crore. What is ROE?',
'5%','10%','20%','25%',
'c','ROE = PAT / Equity × 100 = 100/500 × 100 = 20%. Generally, ROE > 15% consistently indicates a quality business.',2),

(q_id,'Why is EV/EBITDA considered better than P/E for comparing companies?',
'It is always a lower number, making companies look cheaper',
'It accounts for debt differences between companies being compared',
'It uses future earnings instead of past earnings',
'It is simpler to calculate',
'b','EV includes debt, making EV/EBITDA capital-structure neutral. P/E ignores debt, so a company with heavy borrowings appears cheaper on P/E but may not be.',3),

(q_id,'What does a high Debt-to-Equity ratio above 3 generally indicate?',
'Extremely efficient capital use','High financial risk',
'Strong profitability','Conservative management',
'b','D/E > 3 indicates high leverage. One bad year can cause distress. Exceptions: banks and NBFCs have inherently high D/E by business model.',4),

(q_id,'Interest Coverage Ratio = EBIT / Interest Expense. A ratio of 1.2 suggests:',
'Very safe — easily covering interest','Moderately safe',
'Danger zone — barely covering interest','Excellent financial health',
'c','ICR of 1.2 means EBIT is only 1.2x the interest expense. A small revenue decline could make the company unable to service debt. ICR > 3 is generally considered safe.',5),

(q_id,'A company''s Operating Cash Flow is ₹50 crore but Net Profit is ₹80 crore. What does this suggest?',
'The company is doing exceptionally well',
'Profits may be inflated — investigate why cash flow lags profit',
'The company has excellent working capital management',
'This is normal and nothing to worry about',
'b','OCF < PAT is a red flag. Profit can be inflated through accounting choices, but cash flow is harder to fake. Consistently lower OCF vs PAT warrants investigation.',6),

(q_id,'Which free resource provides all key financial ratios for Indian listed companies?',
'Bloomberg Terminal','Screener.in',
'Moneycontrol (premium)','SEBI website',
'b','Screener.in is a free platform that provides 10 years of financial data, ratios, and screening tools for all NSE/BSE listed Indian companies.',7);
END IF;

-- QUIZ 4: Chart Patterns
SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='chart-patterns-complete' LIMIT 1;
IF q_id IS NULL THEN
  INSERT INTO quizzes (lesson_id, title, passing_score, xp_reward)
  SELECT id, 'Chart Patterns Quiz', 70, 25 FROM lessons WHERE slug='chart-patterns-complete';
  SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='chart-patterns-complete' LIMIT 1;
END IF;
IF q_id IS NOT NULL THEN
INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
VALUES
(q_id,'A Head and Shoulders pattern is a:',
'Bullish continuation pattern','Bearish reversal pattern',
'Bullish reversal pattern','Neutral consolidation pattern',
'b','Head and Shoulders is one of the most reliable BEARISH REVERSAL patterns. It signals the end of an uptrend and the beginning of a downtrend.',1),

(q_id,'In a Cup and Handle pattern, what does the "handle" represent?',
'The beginning of the uptrend',
'A brief pullback/consolidation before the breakout',
'The lowest point of the pattern',
'The resistance level being tested',
'b','The handle is a brief downward drift/consolidation after the cup forms. It shakes out weak holders before the final breakout above the cup rim.',2),

(q_id,'For a breakout above resistance to be considered reliable, volume should:',
'Be lower than average (quiet breakout is better)',
'Be equal to the 20-day average',
'Expand significantly — ideally 1.5-2x average or more',
'Not matter — price action is what counts',
'c','Volume confirmation is non-negotiable. A breakout on high volume shows conviction. Low volume breakouts frequently fail and reverse.',3),

(q_id,'A Double Top pattern is confirmed when:',
'Price reaches the second top','Price falls below the valley between the two tops',
'Price rises above the first top','Volume doubles',
'b','The Double Top is confirmed (and becomes a valid sell signal) only when price breaks below the "neckline" — the valley between the two tops.',4),

(q_id,'Which of these is a CONTINUATION pattern (trend continues after)?',
'Head and Shoulders','Double Top',
'Bull Flag','Ascending Wedge',
'c','A Bull Flag is a continuation pattern. Price makes a sharp move up (the flagpole), consolidates in a downward channel (the flag), then breaks out continuing upward.',5),

(q_id,'What is the typical price target for a Head and Shoulders breakdown?',
'The height of the left shoulder projected down',
'The height from head to neckline projected below the neckline',
'50% of the prior uptrend',
'The 200-day moving average',
'b','Standard H&S target = distance from the head to the neckline, projected downward from the neckline breakdown point.',6);
END IF;

-- QUIZ 5: Value Investing India
SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='value-investing-india' LIMIT 1;
IF q_id IS NULL THEN
  INSERT INTO quizzes (lesson_id, title, passing_score, xp_reward)
  SELECT id, 'Value Investing Quiz', 70, 25 FROM lessons WHERE slug='value-investing-india';
  SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='value-investing-india' LIMIT 1;
END IF;
IF q_id IS NOT NULL THEN
INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
VALUES
(q_id,'What is the "margin of safety" concept in value investing?',
'Always buying stocks below ₹100',
'Buying stocks at a significant discount to estimated intrinsic value',
'Holding cash equal to 50% of your portfolio',
'Never investing more than 10% in one stock',
'b','Margin of safety = buying at 30-50% below estimated intrinsic value. This protects against errors in your valuation assumptions and unexpected events.',1),

(q_id,'Which of these is a RED FLAG for management quality in an Indian company?',
'High promoter stake with no pledging',
'20+ years of consistent dividend history',
'High promoter pledge percentage (>20%)',
'Auditor unchanged for 10+ years',
'c','High promoter pledge means promoters borrowed money using their shares as collateral. If share price falls, forced selling can cause catastrophic price collapse.',2),

(q_id,'What is typically considered a "value trap" in Indian markets?',
'A stock that looks cheap on P/E but has fundamental structural problems',
'A stock that has fallen 20% from its 52-week high',
'A stock trading below book value',
'A stock with dividend yield above 4%',
'a','Value traps appear cheap but never recover because they have structural problems: PSU banks with NPA cycles, declining industries, or chronic governance issues.',3),

(q_id,'ROCE stands for:',
'Return on Capital Employed','Revenue on Capital Expenditure',
'Risk of Capital Erosion','Return on Current Equity',
'a','ROCE = EBIT / Capital Employed. It measures how efficiently a company uses ALL its capital (debt + equity) to generate profits.',4),

(q_id,'Which of these is NOT a typical moat (competitive advantage) for an Indian company?',
'High switching costs (customers can''t easily leave)',
'Network effects (more users = more valuable)',
'Currently trading at a low P/E ratio',
'Strong brand recognized as a category leader',
'c','A low P/E is a valuation metric, not a moat. Moats are structural advantages that protect a business from competition: switching costs, network effects, cost advantages, brands.',5);
END IF;

-- QUIZ 6: Gold Investment
SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='gold-investment-complete' LIMIT 1;
IF q_id IS NULL THEN
  INSERT INTO quizzes (lesson_id, title, passing_score, xp_reward)
  SELECT id, 'Gold Investment Quiz', 70, 25 FROM lessons WHERE slug='gold-investment-complete';
  SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='gold-investment-complete' LIMIT 1;
END IF;
IF q_id IS NOT NULL THEN
INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
VALUES
(q_id,'What is the annual interest rate paid on Sovereign Gold Bonds (SGB) in addition to gold price appreciation?',
'0%','1%','2.5%','5%',
'c','SGBs pay 2.5% per annum on the issue price, paid semi-annually. This is in addition to any gold price appreciation.',1),

(q_id,'Which gold investment option offers completely tax-free capital gains at maturity?',
'Physical gold coins','Gold ETF',
'Sovereign Gold Bond (SGB) held to 8-year maturity','Digital Gold',
'c','SGB capital gains are completely tax-free if held to maturity (8 years). This is a unique tax advantage not available with any other gold investment form.',2),

(q_id,'BIS Hallmark 916 on gold jewellery indicates:',
'The jewellery is 999% pure (24 karat)',
'The jewellery is 91.6% pure gold (22 karat)',
'The jewellery has been insured by BIS',
'The jewellery was made in 2016',
'b','BIS 916 Hallmark means 91.6% gold purity = 22 karat gold. Always look for this when buying gold jewellery to ensure you get what you pay for.',3),

(q_id,'What is the main disadvantage of Digital Gold compared to Gold ETF?',
'Digital Gold has higher returns',
'Digital Gold is not regulated by SEBI and carries counterparty risk',
'Digital Gold cannot be sold easily',
'Digital Gold requires a Demat account',
'b','Digital Gold sold on apps is NOT regulated by SEBI, RBI, or any financial regulator. If the operator fails, investor protections are unclear. Gold ETFs are SEBI-regulated.',4),

(q_id,'For most investors with a medium-term (2-5 year) horizon, which gold option is most practical?',
'Gold jewellery','Sovereign Gold Bond',
'Gold ETF','Physical gold bars from bank',
'c','Gold ETF is best for 2-5 year horizon: low cost, no storage risk, SEBI-regulated, liquid (can sell any trading day), and tracks gold price accurately.',5);
END IF;

-- QUIZ 7: ITR Filing
SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='itr-filing-guide' LIMIT 1;
IF q_id IS NULL THEN
  INSERT INTO quizzes (lesson_id, title, passing_score, xp_reward)
  SELECT id, 'ITR Filing Quiz', 70, 25 FROM lessons WHERE slug='itr-filing-guide';
  SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='itr-filing-guide' LIMIT 1;
END IF;
IF q_id IS NOT NULL THEN
INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
VALUES
(q_id,'Which ITR form should a salaried employee with only salary income and one house property typically use?',
'ITR-3','ITR-4',
'ITR-1 (Sahaj)','ITR-6',
'c','ITR-1 (Sahaj) is for salaried individuals with income from salary, one house property, and interest. Income must be below ₹50 lakh with no capital gains.',1),

(q_id,'What is the deadline for filing original ITR for salaried individuals (without audit requirement) for FY 2024-25?',
'31 March 2025','30 September 2025',
'31 July 2025','31 December 2025',
'c','The standard deadline for salaried individuals (no audit required) is 31 July of the assessment year. For FY 2024-25, it is 31 July 2025.',2),

(q_id,'What is Form 26AS?',
'Your employer''s salary certificate',
'A document showing all TDS deducted against your PAN from all sources',
'The income tax return acknowledgement form',
'A form for claiming HRA exemption',
'b','Form 26AS is a tax credit statement showing all TDS deducted and deposited against your PAN number from all sources — employer, bank, property transactions, etc.',3),

(q_id,'If you miss the 31 July deadline but file before 31 December, what is the late filing penalty for income above ₹5 lakh?',
'₹500','₹1,000','₹5,000','₹10,000',
'c','Late filing penalty (Section 234F): ₹1,000 if income below ₹5 lakh; ₹5,000 if income above ₹5 lakh. Filing after 31 December but before 31 March attracts the same penalty.',4),

(q_id,'The fastest way to verify your ITR after submission is:',
'Sending signed ITR-V by post','Physical submission at IT office',
'Net banking EVC','Aadhaar OTP verification',
'd','Aadhaar OTP verification is the fastest method — instant verification. All other methods take longer. Always verify ITR within 30 days of submission.',5),

(q_id,'Standard deduction for salaried employees under the new tax regime (FY 2024-25) is:',
'₹50,000','₹40,000','₹75,000','No standard deduction in new regime',
'c','From FY 2024-25, the standard deduction under the new regime increased to ₹75,000 (from ₹50,000 previously). This is one of the few deductions available in the new regime.',6);
END IF;

-- QUIZ 8: REIT Investing
SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='reit-investing-india' LIMIT 1;
IF q_id IS NULL THEN
  INSERT INTO quizzes (lesson_id, title, passing_score, xp_reward)
  SELECT id, 'REIT Investing Quiz', 70, 25 FROM lessons WHERE slug='reit-investing-india';
  SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='reit-investing-india' LIMIT 1;
END IF;
IF q_id IS NOT NULL THEN
INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
VALUES
(q_id,'What percentage of net distributable cash flow must Indian REITs distribute to investors?',
'50%','75%','90%','100%',
'c','SEBI requires Indian REITs to distribute at least 90% of net distributable cash flows to unitholders. This is what makes REITs income-generating investments.',1),

(q_id,'Typical annual distribution yield from Indian REITs (office space REITs) as of 2024 is approximately:',
'1-2%','3-4%','6-8%','12-15%',
'c','Indian office REITs (Embassy, Mindspace, Brookfield) typically offer 6-8% annual yields from rental distributions, significantly higher than residential real estate yields of 2-3%.',2),

(q_id,'India''s first REIT to list on NSE/BSE was:',
'Mindspace Business Parks REIT','Brookfield India Real Estate Trust',
'Embassy Office Parks REIT','Nexus Select Trust',
'c','Embassy Office Parks REIT was India''s first REIT, listing in April 2019. It marked the start of India''s REIT market.',3),

(q_id,'What is the major advantage of REITs over buying a physical flat for rental income?',
'REITs have lower taxes than property',
'REITs offer 6-8% yields vs 2-3% for residential properties, plus much higher liquidity',
'REITs are backed by government guarantee',
'REITs have no maintenance costs',
'b','Residential real estate in India yields only 2-3% (rent/property value). REITs yield 6-8%, plus you can sell units on NSE anytime — unlike property which takes months to sell.',4),

(q_id,'Nexus Select Trust is India''s first REIT focused on:',
'Office buildings','Warehouses',
'Retail malls','Residential apartments',
'c','Nexus Select Trust, listed in 2023, is India''s first retail REIT focused on grade-A malls across India.',5);
END IF;

-- QUIZ 9: Porter's Five Forces
SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='porters-five-forces' LIMIT 1;
IF q_id IS NULL THEN
  INSERT INTO quizzes (lesson_id, title, passing_score, xp_reward)
  SELECT id, 'Porter''s Five Forces Quiz', 70, 25 FROM lessons WHERE slug='porters-five-forces';
  SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='porters-five-forces' LIMIT 1;
END IF;
IF q_id IS NOT NULL THEN
INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
VALUES
(q_id,'Porter''s Five Forces framework helps analyze:',
'A company''s financial statements','The competitive intensity and profitability potential of an industry',
'A country''s economic strength','Individual investor behavior',
'b','Five Forces is an industry analysis framework — it tells you whether an industry is structurally attractive (high profit potential) or unattractive before analyzing individual companies.',1),

(q_id,'Indian aviation (pre-consolidation) is a classic example of:',
'An industry with low rivalry and high margins',
'An industry with all five forces being unfavorable',
'An industry with very high barriers to entry',
'A monopoly business',
'b','Indian aviation faces: high rivalry (price wars), high supplier power (aircraft makers, fuel), low switching costs for customers, threat from trains as substitutes. Classic Five Forces nightmare.',2),

(q_id,'CRISIL and ICRA (credit rating agencies) have LOW buyer power because:',
'They charge very low fees','Companies voluntarily choose to get rated',
'Companies MUST get rated and there are only 7 licensed agencies',
'The government subsidizes their services',
'c','With only 7 SEBI-licensed rating agencies and mandatory ratings for public debt issuances, buyers (companies needing ratings) have little negotiating power. This gives agencies pricing power.',3),

(q_id,'What creates a HIGH threat of new entrants in an industry?',
'Very high capital requirements','Strong existing brand loyalty',
'Low startup costs and no switching costs for customers',
'Government licensing requirements',
'c','Low barriers to entry (low capital, no brand required, easy distribution, no regulatory approval) create a high threat of new entrants — bad for existing players.',4),

(q_id,'WhatsApp has extremely LOW threat of substitution because:',
'It charges no fees','It has government protection',
'Network effects — you need to be where your contacts are (switching costs)',
'It is the fastest messaging app',
'c','WhatsApp''s primary moat is the network effect. Your contacts are already there. Even if a better app exists, switching has a high social cost — all your contacts must switch too.',5);
END IF;

-- QUIZ 10: Ethereum Proof of Stake
SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='ethereum-proof-of-stake' LIMIT 1;
IF q_id IS NULL THEN
  INSERT INTO quizzes (lesson_id, title, passing_score, xp_reward)
  SELECT id, 'Ethereum & PoS Quiz', 70, 25 FROM lessons WHERE slug='ethereum-proof-of-stake';
  SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='ethereum-proof-of-stake' LIMIT 1;
END IF;
IF q_id IS NOT NULL THEN
INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
VALUES
(q_id,'What happened to Ethereum''s energy consumption after "The Merge" in September 2022?',
'It doubled','It remained the same',
'It increased by 50%','It dropped by approximately 99.95%',
'd','The Merge switched Ethereum from energy-intensive Proof of Work to Proof of Stake. Energy consumption dropped by ~99.95% — from Finland''s entire electricity usage to a tiny fraction.',1),

(q_id,'To become a standalone validator on Ethereum Proof of Stake, you need to stake:',
'1 ETH','10 ETH','32 ETH','100 ETH',
'c','The minimum stake to run a solo validator node is 32 ETH. Most retail investors use liquid staking protocols like Lido to stake any amount.',2),

(q_id,'What does "slashing" mean in Ethereum PoS?',
'Cutting transaction fees','Partial destruction of a validator''s staked ETH as punishment for misbehavior',
'The process of creating new blocks','Removing inactive validators',
'b','Slashing is the penalty mechanism. If a validator tries to cheat (double signing, etc.), a portion of their staked ETH is "slashed" (destroyed). This creates strong financial incentives for honest behavior.',3),

(q_id,'What are Layer 2 solutions like Polygon and Arbitrum designed to do?',
'Replace Ethereum entirely','Create new cryptocurrencies',
'Process transactions off the main chain to reduce gas fees','Provide faster internet connections',
'c','L2s process transactions off Ethereum mainnet, batch them, and settle on Ethereum. This reduces gas fees from $5-50 on mainnet to $0.01-0.10 on L2s.',4),

(q_id,'What is "Liquid Staking" (e.g., through Lido Finance)?',
'Selling ETH for stablecoins','Converting ETH to physical gold',
'Staking ETH through a protocol and receiving liquid tokens representing your staked position',
'Buying ETH on margin',
'c','Liquid staking allows you to stake ETH (minimum any amount) through protocols like Lido and receive stETH tokens. These tokens earn staking rewards but can still be used in DeFi.',5);
END IF;

-- QUIZ 11: UPI and Digital Payments Safety
SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='upi-digital-payments-fraud' LIMIT 1;
IF q_id IS NULL THEN
  INSERT INTO quizzes (lesson_id, title, passing_score, xp_reward)
  SELECT id, 'UPI Safety Quiz', 70, 25 FROM lessons WHERE slug='upi-digital-payments-fraud';
  SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='upi-digital-payments-fraud' LIMIT 1;
END IF;
IF q_id IS NOT NULL THEN
INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
VALUES
(q_id,'You receive a UPI collect request from someone claiming to SEND you money. Do you need to enter your UPI PIN?',
'Yes, to verify your identity','Yes, to authorize receipt',
'No — you NEVER need PIN to receive money. This is a fraud attempt.',
'Only if amount is above ₹10,000',
'c','This is the most important UPI safety rule. You NEVER enter UPI PIN to receive money. A collect request asking for PIN is always someone trying to TAKE money from you.',1),

(q_id,'A person calls claiming to be from your bank and asks you to install AnyDesk for "account verification." You should:',
'Install AnyDesk as requested','Share OTP if they ask',
'Immediately hang up — no legitimate bank asks for screen sharing apps',
'Answer all their questions to verify your account',
'c','No legitimate bank, SEBI, RBI, or any financial institution asks you to install screen sharing apps. This is a classic fraud to steal your banking credentials.',2),

(q_id,'If you are defrauded via UPI, what is the FIRST thing to do?',
'Wait 24 hours to see if money returns','Post on social media',
'Call cyber crime helpline 1930 immediately — funds can be frozen in transit',
'Visit police station tomorrow',
'c','Speed is critical. Calling 1930 (National Cyber Crime Helpline) immediately can freeze funds in transit before the fraudster withdraws them. Every hour of delay reduces recovery chances.',3),

(q_id,'What is a SIM swap fraud?',
'Buying a new SIM card yourself',
'Fraudster gets a duplicate SIM of your number using fake documents, receiving your OTPs',
'Swapping bank accounts between family members',
'Using the same SIM for multiple UPI apps',
'b','In SIM swap fraud, criminals obtain a duplicate SIM using forged documents. Your SIM stops working. They receive all your OTPs and can take over bank accounts.',4),

(q_id,'Before completing any QR code payment, you should:',
'Scan quickly to avoid queues',
'Verify the merchant name displayed on screen before approving',
'Enter the amount without checking merchant name',
'Only verify for amounts above ₹1,000',
'b','Always verify the merchant name shown after scanning. Fraudsters replace real QR codes with fake ones. If the name shown doesn''t match the business, do not pay.',5);
END IF;

-- QUIZ 12: Anchoring and Mental Accounting
SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='anchoring-mental-accounting' LIMIT 1;
IF q_id IS NULL THEN
  INSERT INTO quizzes (lesson_id, title, passing_score, xp_reward)
  SELECT id, 'Cognitive Biases Quiz', 70, 25 FROM lessons WHERE slug='anchoring-mental-accounting';
  SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='anchoring-mental-accounting' LIMIT 1;
END IF;
IF q_id IS NOT NULL THEN
INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
VALUES
(q_id,'An investor holds a stock that fell from ₹500 to ₹200, refusing to sell because "it was ₹500." This is an example of:',
'Smart contrarian investing','Anchoring bias to the historical high',
'Value investing principle','Loss aversion combined with good research',
'b','Anchoring to the ₹500 historical high is irrational. The relevant question is: what is the stock worth TODAY based on current fundamentals? The past price is irrelevant.',1),

(q_id,'Mental accounting leads investors to:',
'Always make rational decisions','Treat bonus money more carelessly than earned salary',
'Diversify their portfolio properly','Always reinvest dividends',
'b','Mental accounting means treating money differently based on its source. Bonus money feels like "found money" and gets spent impulsively. But ₹1,000 is ₹1,000 regardless of source.',2),

(q_id,'The "house money effect" in trading refers to:',
'Buying real estate with investment profits',
'Taking more risk with trading profits because it feels like the market''s money',
'Hedging stock positions with property',
'Investing conservatively after a big win',
'b','After making profits, traders feel the gains are "house money" and take larger risks. But trading profits are real money — the same risk rules should apply.',3),

(q_id,'How does availability heuristic affect stock market decisions?',
'It helps investors find undervalued stocks',
'Recent vivid events (crashes, rallies) are overweighted in probability estimates',
'It improves portfolio diversification',
'It reduces transaction costs',
'b','Availability heuristic makes recently-seen events feel more probable than base rates suggest. Recent market crash → overestimate crash probability. Recent bull run → underestimate risks.',4),

(q_id,'The best cure for anchoring bias when evaluating a stock you own is:',
'Calculate the stock''s original purchase price more precisely',
'Ask: "Would I buy this stock today at today''s price if I didn''t already own it?"',
'Wait for the stock to return to your purchase price before deciding',
'Look at the stock''s 52-week high instead',
'b','The "fresh eyes" test: Would you buy it today at today''s price? If no, the only rational reason to hold is a well-reasoned thesis that the current price undervalues future fundamentals — not the purchase price anchor.',5);
END IF;

-- QUIZ 13: Herding and FOMO
SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='herding-fomo-media' LIMIT 1;
IF q_id IS NULL THEN
  INSERT INTO quizzes (lesson_id, title, passing_score, xp_reward)
  SELECT id, 'Herding & FOMO Quiz', 70, 25 FROM lessons WHERE slug='herding-fomo-media';
  SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='herding-fomo-media' LIMIT 1;
END IF;
IF q_id IS NOT NULL THEN
INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
VALUES
(q_id,'An IPO is subscribed 80x and you apply because "so many people can''t be wrong." This is:',
'Smart due diligence','Herding behavior based on social proof rather than analysis',
'A rational decision based on demand signals','Contrarian investing',
'b','High subscription is a demand signal for allocation — it doesn''t indicate future stock performance. Paytm (barely subscribed at 1.89x) crashed while some highly subscribed IPOs also crashed.',1),

(q_id,'What is the DALBAR study famous for showing?',
'Mutual funds always beat the index',
'Average investors significantly underperform the market due to behavioral mistakes',
'Markets are perfectly efficient','Index funds always outperform',
'b','DALBAR''s annual studies consistently show the average equity mutual fund investor earns 3-4% annually while the market earns 10%+. The gap is explained by buy-high/sell-low behavior driven by emotions.',2),

(q_id,'Financial media is structurally incentivized to:',
'Provide calm, balanced long-term investing advice',
'Create excitement and urgency — "markets crash" gets more clicks than "markets flat"',
'Recommend index funds over active funds','Discourage short-term trading',
'b','Financial media profits from engagement. Dramatic crash headlines and exciting rally stories generate more clicks/views than "boring" long-term compounding stories.',3),

(q_id,'The best protection against herding behavior is:',
'Following what billionaire investors do','Written investment rules decided BEFORE market events',
'Watching financial news daily','Following analyst consensus',
'b','A written investment policy statement (created when you are calm) gives you a rational anchor during emotional market events. "I will increase SIP if markets fall 20%" is more actionable than vague good intentions.',4),

(q_id,'Warren Buffett''s famous quote about investor psychology is:',
'"Buy what you know"',
'"Be greedy when others are fearful, and fearful when others are greedy"',
'"Diversification is protection against ignorance"',
'"The stock market is a device for transferring money from the impatient to the patient"',
'b','Buffett''s quote captures the contrarian anti-herding strategy. When everyone is fearful (market crash, pessimistic news), assets are cheap — opportunity. When everyone is greedy (bubble), assets are expensive — danger.',5);
END IF;

-- QUIZ 14: Forex Trading Sessions
SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='forex-trading-sessions' LIMIT 1;
IF q_id IS NULL THEN
  INSERT INTO quizzes (lesson_id, title, passing_score, xp_reward)
  SELECT id, 'Forex Sessions Quiz', 70, 25 FROM lessons WHERE slug='forex-trading-sessions';
  SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='forex-trading-sessions' LIMIT 1;
END IF;
IF q_id IS NOT NULL THEN
INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
VALUES
(q_id,'Which forex session has the HIGHEST volume globally?',
'Sydney session','Tokyo session','London session','New York session',
'c','London is the world''s largest forex market, handling approximately 38% of global daily forex volume. The London session (1:30 PM - 9:30 PM IST) sees the most activity.',1),

(q_id,'The London-New York overlap (approximately 6:30-9:30 PM IST) is important because:',
'It is when RBI intervenes most','It has the lowest spreads',
'Both the two largest forex markets are simultaneously active — highest volume and tightest spreads',
'It is when Asian currencies are most active',
'c','The overlap of London and New York creates the highest-volume period in forex. EUR/USD, GBP/USD pairs have tightest spreads and biggest moves during this window.',2),

(q_id,'Under FEMA, Indian residents can legally trade forex derivatives on:',
'Any international online forex broker','Only Forex.com and OANDA',
'NSE/BSE currency futures and options (USD/INR and select cross-currency pairs)',
'They cannot trade forex at all',
'c','Indian residents can only legally trade currency derivatives on SEBI-regulated exchanges (NSE/BSE). Using offshore forex platforms violates FEMA.',3),

(q_id,'Which currency pair is most traded globally with the lowest spreads?',
'USD/INR','GBP/JPY','EUR/USD','USD/ZAR',
'c','EUR/USD is the most traded currency pair globally, accounting for ~23% of daily forex volume. It has the lowest spreads and highest liquidity.',4),

(q_id,'"Exotic" currency pairs differ from "major" pairs because:',
'They are more profitable to trade',
'They involve at least one emerging market currency and have higher spreads and lower liquidity',
'They are only available on NSE','They involve three currencies',
'b','Exotic pairs (USD/INR, USD/ZAR, etc.) include at least one emerging market currency. They have much higher spreads and lower liquidity than major pairs, increasing trading costs.',5);
END IF;

-- QUIZ 15: Salary Structuring and Tax
SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='salary-structure-tax-india' LIMIT 1;
IF q_id IS NULL THEN
  INSERT INTO quizzes (lesson_id, title, passing_score, xp_reward)
  SELECT id, 'Salary & Tax Optimization Quiz', 70, 25 FROM lessons WHERE slug='salary-structure-tax-india';
  SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='salary-structure-tax-india' LIMIT 1;
END IF;
IF q_id IS NOT NULL THEN
INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
VALUES
(q_id,'HRA exemption is calculated as the MINIMUM of three amounts. Which of these is NOT one of them?',
'Actual HRA received',
'Actual rent paid minus 10% of basic salary',
'Total CTC of the employee',
'50% of basic salary (metro) or 40% (non-metro)',
'c','HRA exemption = minimum of: (1) Actual HRA, (2) Actual rent - 10% basic, (3) 50%/40% of basic. CTC is not part of the calculation.',1),

(q_id,'Employer NPS contribution under Section 80CCD(2) is beneficial because:',
'It reduces the employee''s take-home salary',
'It is tax-free in addition to the normal ₹1.5 lakh 80C limit',
'It is available only for government employees',
'It can only be 5% of basic salary',
'b','Employer NPS contribution under 80CCD(2) (up to 10% of basic) is FULLY tax-exempt AND is in ADDITION to the ₹1.5 lakh 80C + ₹50K 80CCD(1B) limits. Most employees miss this.',2),

(q_id,'LTA (Leave Travel Allowance) is tax-exempt for:',
'Any international travel with family','Domestic travel within India (actual travel costs only)',
'Hotel accommodation during travel','Food expenses during travel',
'b','LTA exemption covers only ACTUAL travel costs (airfare, train, bus) for domestic travel within India. Hotel, food, and entertainment are NOT covered.',3),

(q_id,'Standard deduction of ₹75,000 (FY 2024-25) under the new tax regime:',
'Requires you to submit bills and receipts',
'Is automatically available to all salaried employees without documentation',
'Is only for government employees','Replaced the HRA exemption',
'b','Standard deduction is a flat deduction given automatically to all salaried employees without any documentation or bills. One of the few deductions available in the new tax regime.',4),

(q_id,'For a person in 30% tax bracket, HRA exemption is only available:',
'Under both old and new tax regime',
'Only under the old tax regime',
'Only under the new tax regime',
'HRA exemption has been abolished',
'b','HRA exemption is only available under the OLD tax regime. Under the new regime, there is no HRA exemption — this is a key factor when choosing between regimes for those paying high rent.',5);
END IF;

-- QUIZ 16: Demat Account
SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='demat-account-complete' LIMIT 1;
IF q_id IS NULL THEN
  INSERT INTO quizzes (lesson_id, title, passing_score, xp_reward)
  SELECT id, 'Demat Account Quiz', 70, 25 FROM lessons WHERE slug='demat-account-complete';
  SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='demat-account-complete' LIMIT 1;
END IF;
IF q_id IS NOT NULL THEN
INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
VALUES
(q_id,'What does "T+1 settlement" mean for Indian stock markets?',
'Trade takes 1 hour to complete','Shares and money exchange hands 1 trading day after the trade',
'You have 1 day to cancel a trade','Brokerage is charged after 1 day',
'b','India switched to T+1 settlement in 2023. If you buy shares today, they appear in your Demat account the next trading day. T+1 is faster than T+2 used in most global markets.',1),

(q_id,'CDSL and NSDL are:',
'Stock exchanges','Mutual fund regulators',
'Depositories that hold electronic records of your shares','Brokers who execute trades',
'c','CDSL (Central Depository Services Ltd) and NSDL (National Securities Depository Ltd) are the two central depositories that hold electronic records of all securities. Your broker is a Depository Participant (DP).',2),

(q_id,'SEBI made nominee mandatory for Demat accounts from:',
'2020','2022','March 2024','2019',
'c','SEBI mandated nomination for all Demat accounts from March 2024. Without a nominee, legal heirs must go through court proceedings to claim shares after account holder death.',3),

(q_id,'When you "sell" shares in your Demat account, what happens to them?',
'They are deleted','They go into a waiting pool',
'They are transferred out of your Demat account to the buyer''s account',
'They remain in your account but are marked as sold',
'c','When you sell, shares are debited from your Demat account (T+1) and credited to the buyer''s Demat account. Money is simultaneously credited to your bank account.',4),

(q_id,'Beyond shares, what else can be held in an Indian Demat account?',
'Fixed deposits and PPF',
'ETFs, SGBs, bonds, REIT units, and IPO allotments',
'Cash and mutual fund units','Insurance policies',
'b','Demat accounts hold: equity shares, ETFs, Sovereign Gold Bonds, corporate bonds, government securities, REIT/InvIT units, and IPO allotments. Mutual fund units are technically held with AMCs (though some brokers show them).',5);
END IF;

-- QUIZ 17: ESG and BRSR
SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='esg-brsr-india' LIMIT 1;
IF q_id IS NULL THEN
  INSERT INTO quizzes (lesson_id, title, passing_score, xp_reward)
  SELECT id, 'ESG & BRSR Quiz', 70, 25 FROM lessons WHERE slug='esg-brsr-india';
  SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='esg-brsr-india' LIMIT 1;
END IF;
IF q_id IS NOT NULL THEN
INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
VALUES
(q_id,'BRSR (Business Responsibility and Sustainability Report) was mandated by SEBI for which companies?',
'All listed companies','Only PSU companies',
'Top 1,000 listed companies by market cap (from FY 2022-23)',
'Only companies with revenue above ₹1,000 crore',
'c','SEBI mandated BRSR for the top 1,000 listed companies by market cap from FY 2022-23. Other companies can voluntarily report.',1),

(q_id,'What does the "G" in ESG stand for, and why is it most important for Indian investors?',
'Growth — companies with high revenue growth',
'Governance — board independence, promoter accountability, and audit quality are critical in India',
'Geography — companies with global presence','Government — public sector alignment',
'b','Governance is most critical in India because poor governance (promoter fraud, related-party transactions, pledging) has destroyed enormous shareholder value: Satyam, IL&FS, DHFL, etc.',2),

(q_id,'A company''s promoters are buying shares in the open market from their own money. This is:',
'A red flag for governance',
'One of the strongest positive governance signals — they believe in the business',
'Required by SEBI regulations','Usually done to manipulate share prices',
'b','Open market purchases by promoters using their own money signal genuine confidence in the business. They are betting their personal wealth on the company''s future. Check BSE insider trading filings.',3),

(q_id,'High promoter pledging (shares pledged as loan collateral) is risky because:',
'It reduces dividends paid to shareholders',
'If share price falls, forced selling of pledged shares creates a spiral of further price decline',
'It prevents the company from issuing bonus shares',
'It increases the company''s debt',
'b','When pledged shares trigger a margin call, lenders force sell the shares. Forced selling drives the price down further, triggering more margin calls — a dangerous spiral.',4),

(q_id,'What is the key limitation of ESG ratings for Indian companies?',
'No ESG funds exist in India',
'BRSR is self-reported with no independent verification yet, and rating methodologies vary widely',
'ESG always leads to higher stock returns','SEBI has banned ESG investing',
'b','BRSR is currently self-reported by companies without mandatory independent verification. ESG ratings from different providers (MSCI, Sustainalytics) often disagree, and "greenwashing" is a real risk.',5);
END IF;

-- QUIZ 18: ESOP Guide
SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='esop-guide-india' LIMIT 1;
IF q_id IS NULL THEN
  INSERT INTO quizzes (lesson_id, title, passing_score, xp_reward)
  SELECT id, 'ESOPs Quiz', 70, 25 FROM lessons WHERE slug='esop-guide-india';
  SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='esop-guide-india' LIMIT 1;
END IF;
IF q_id IS NOT NULL THEN
INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
VALUES
(q_id,'In a "4-year vest with 1-year cliff" ESOP schedule, what happens at exactly 12 months?',
'All 25% vests','Nothing — cliff is at month 13',
'50% vests','12.5% vests',
'a','With a 1-year cliff: 0 options vest in months 1-11. At month 12 (the cliff), 25% (1 year''s worth) vest all at once. Then remaining 75% vest monthly/quarterly until month 48.',1),

(q_id,'When you exercise vested ESOP options (pay exercise price to get shares), the tax event is:',
'Capital gains tax on the difference','No tax at the time of exercise',
'Perquisite tax (salary tax) on FMV minus exercise price at your slab rate',
'GST on the transaction value',
'c','Exercise is a taxable event. The difference between Fair Market Value at exercise and exercise price is treated as perquisite income — taxed at your salary slab rate (up to 30%).',2),

(q_id,'The DPIIT startup ESOP deferral (Finance Act 2020) allows eligible startup employees to:',
'Pay zero tax on ESOPs ever',
'Defer perquisite tax for up to 5 years or until sale/departure — whichever is earlier',
'Receive ESOPs without any vesting period','Convert ESOPs to cash immediately',
'b','DPIIT-registered startups can allow employees to defer the perquisite tax liability for up to 5 years or until they leave/sell — whichever is earlier. This addresses the cash flow problem of paying tax before selling.',3),

(q_id,'When evaluating an ESOP offer from a startup, what is the most critical question?',
'How many options you''re getting in absolute numbers',
'What is the current valuation and what percentage of the company do your options represent',
'Whether options are in dollars or rupees','The name of the CEO',
'b','Absolute number of options is meaningless without context. 10,000 options at 0.01% equity in a small startup is very different from 1,000 options at 0.1% equity in a unicorn.',4),

(q_id,'What is a "post-termination exercise window"?',
'The time between resigning and last working day',
'How long you have to exercise vested options after leaving the company',
'The waiting period before your first options vest','The cooling-off period after IPO',
'b','Post-termination exercise window (typically 30-90 days) is how long you have to exercise your vested options after leaving. Short windows force you to either pay exercise price + tax immediately or lose your options.',5);
END IF;

-- QUIZ 19: India e-Rupee CBDC
SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='india-erupee-cbdc' LIMIT 1;
IF q_id IS NULL THEN
  INSERT INTO quizzes (lesson_id, title, passing_score, xp_reward)
  SELECT id, 'India e-Rupee Quiz', 70, 25 FROM lessons WHERE slug='india-erupee-cbdc';
  SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='india-erupee-cbdc' LIMIT 1;
END IF;
IF q_id IS NOT NULL THEN
INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
VALUES
(q_id,'The e-Rupee (digital rupee) is different from UPI because:',
'e-Rupee earns interest like a savings account',
'e-Rupee is a form of digital currency that works offline; UPI moves money between bank accounts',
'UPI is faster than e-Rupee',
'e-Rupee is only for international payments',
'b','Key difference: UPI moves money between bank accounts (needs internet and bank systems). e-Rupee IS digital money — like handing physical cash digitally. It can work offline.',1),

(q_id,'Who issues the Indian e-Rupee?',
'NPCI (UPI operator)','Government of India directly',
'RBI (Reserve Bank of India)','State Bank of India',
'c','The e-Rupee is a CBDC (Central Bank Digital Currency) issued directly by the Reserve Bank of India. It is legal tender — same as physical rupee notes.',2),

(q_id,'What is a key privacy difference between e-Rupee and UPI?',
'UPI is completely private; e-Rupee shares data publicly',
'e-Rupee transactions are fully visible to RBI; UPI has bank-level visibility',
'Both have identical privacy features','e-Rupee is completely anonymous like Bitcoin',
'b','e-Rupee transactions are visible to the RBI, which issues and manages it. This gives the central bank unprecedented visibility into transaction patterns — a significant privacy distinction from cash.',3),

(q_id,'Which country has the most advanced CBDC deployment globally as of 2024?',
'USA','India','China (e-CNY / Digital Yuan)','Nigeria',
'c','China''s e-CNY (digital yuan) is the most advanced CBDC globally, with 260 million users by 2023 and extensive real-world testing in multiple cities.',4),

(q_id,'Does e-Rupee held in a wallet earn interest like a savings account?',
'Yes, at the same rate as savings accounts',
'Yes, at a special CBDC interest rate','No, e-Rupee held in wallet earns no interest',
'Only Pro/Premium wallet holders earn interest',
'c','e-Rupee held in wallets earns NO interest. This is a deliberate design choice — unlike bank deposits. To earn interest, you keep money in a savings account and convert to e-Rupee only when transacting.',5);
END IF;

-- QUIZ 20: Fibonacci Retracement
SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='fibonacci-retracement-guide' LIMIT 1;
IF q_id IS NULL THEN
  INSERT INTO quizzes (lesson_id, title, passing_score, xp_reward)
  SELECT id, 'Fibonacci Retracement Quiz', 70, 25 FROM lessons WHERE slug='fibonacci-retracement-guide';
  SELECT q.id INTO q_id FROM quizzes q JOIN lessons l ON q.lesson_id=l.id WHERE l.slug='fibonacci-retracement-guide' LIMIT 1;
END IF;
IF q_id IS NOT NULL THEN
INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
VALUES
(q_id,'A stock rallies from ₹100 to ₹200. The 61.8% Fibonacci retracement level is at:',
'₹161.8','₹138.2','₹123.6','₹176.4',
'b','61.8% retracement from ₹200 back toward ₹100: ₹200 - (0.618 × 100) = ₹200 - ₹61.8 = ₹138.2. The 61.8% level is the "golden ratio" and the most watched Fibonacci level.',1),

(q_id,'Why does the 61.8% Fibonacci level tend to hold as support?',
'It is programmed into all trading algorithms',
'Mathematical laws of nature dictate it',
'Enough traders watch and act on this level that it becomes a self-fulfilling prophecy',
'The stock always bounces exactly at 61.8%',
'c','Fibonacci levels work because enough market participants watch and trade them. The self-fulfilling prophecy effect is strong at key levels like 38.2%, 50%, and 61.8%.',2),

(q_id,'Fibonacci extension levels (127.2%, 161.8%, etc.) are used to:',
'Find where a retracement will end','Set stop-loss orders',
'Project where price may go BEYOND the original move','Calculate moving averages',
'c','Extensions project price targets beyond the initial move. After a rally, pullback, and resumption, the 161.8% extension often acts as a price target for the next leg up.',3),

(q_id,'A Fibonacci retracement level becomes MORE significant when:',
'It is at a round number only',
'It coincides with other technical factors like a previous support level and a moving average',
'It is at exactly 50%','The stock has high volume',
'b','Confluence makes Fibonacci levels more significant. A 61.8% retracement that also happens to be a previous support level AND the 200-day SMA is a very strong expected support zone.',4),

(q_id,'How do you draw Fibonacci retracement in an uptrend?',
'From the current price down to zero',
'From the lowest recent swing low up to the highest recent swing high',
'From the highest price to the 200-day moving average',
'Randomly between any two points',
'b','In an uptrend: draw from the swing LOW to the swing HIGH. The tool then plots the key percentage levels (23.6%, 38.2%, 50%, 61.8%) between these two points as potential support levels during the pullback.',5);
END IF;

RAISE NOTICE '✅ Phase 9 & 10 quizzes complete!';
RAISE NOTICE '   Created 20 quizzes with 100+ questions';
RAISE NOTICE '   Covers: F&O, Greeks, Ratios, Chart Patterns, Value Investing,';
RAISE NOTICE '           Gold, ITR, REIT, Porter''s 5 Forces, Ethereum PoS,';
RAISE NOTICE '           UPI Safety, Biases, Herding, Forex, Salary Tax,';
RAISE NOTICE '           Demat, ESG, ESOPs, e-Rupee, Fibonacci';

END $QUIZZES$;