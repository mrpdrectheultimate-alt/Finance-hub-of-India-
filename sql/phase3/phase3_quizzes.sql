-- ============================================================
-- FinanceHub — Phase 3 Quiz Expansion
-- 150+ questions across all 50 Phase 3 lessons
-- 3-5 questions per lesson, 4 options each
-- Run AFTER lesson_expansion_phase3_part2.sql
-- Idempotent: uses INSERT ... WHERE NOT EXISTS
-- ============================================================

DO $PHASE3_QUIZZES$
DECLARE
  -- Lesson IDs
  l_wills           UUID;
  l_joint           UUID;
  l_credit          UUID;
  l_women           UUID;
  l_money_rel       UUID;
  l_home            UUID;
  l_nps             UUID;
  l_education       UUID;
  l_freelancer      UUID;
  l_at40            UUID;
  l_sector          UUID;
  l_screeners       UUID;
  l_etf             UUID;
  l_mgmt            UUID;
  l_buybacks        UUID;
  l_swing           UUID;
  l_position        UUID;
  l_ipo_inv         UUID;
  l_wacc            UUID;
  l_lbo             UUID;
  l_distress        UUID;
  l_ipo_proc        UUID;
  l_conglom         UUID;
  l_moat            UUID;
  l_scripts         UUID;
  l_couples         UUID;
  l_trauma          UUID;
  l_identity        UUID;
  l_environ         UUID;
  l_interbank       UUID;
  l_fx_opt          UUID;
  l_algo_fx         UUID;
  l_em_curr         UUID;
  l_geo             UUID;
  l_fx_plan         UUID;
  l_vwap            UUID;
  l_smc             UUID;
  l_opt_flow        UUID;
  l_mkt_profile     UUID;
  l_seasonal        UUID;
  l_gaps            UUID;
  l_risk_mgmt       UUID;
  l_backtest        UUID;
  l_trading_sys     UUID;
  l_web3            UUID;
  l_rwa             UUID;
  l_crypto_reg      UUID;
  l_defi_risk       UUID;
  l_onchain         UUID;
  l_zkp             UUID;

  -- Quiz IDs & Counters
  q_id              UUID;
  v_q               INT;
  v_qqs             INT;

BEGIN
  -- Fetch all lesson IDs
  SELECT id INTO l_wills       FROM lessons WHERE slug='wills-and-nominations';
  SELECT id INTO l_joint       FROM lessons WHERE slug='joint-accounts-couples';
  SELECT id INTO l_credit      FROM lessons WHERE slug='credit-cards-done-right';
  SELECT id INTO l_women       FROM lessons WHERE slug='financial-planning-for-women';
  SELECT id INTO l_money_rel   FROM lessons WHERE slug='money-and-relationships';
  SELECT id INTO l_home        FROM lessons WHERE slug='home-buying-guide-india';
  SELECT id INTO l_nps         FROM lessons WHERE slug='nps-deep-dive';
  SELECT id INTO l_education   FROM lessons WHERE slug='childs-education-planning';
  SELECT id INTO l_freelancer  FROM lessons WHERE slug='freelancer-finances';
  SELECT id INTO l_at40        FROM lessons WHERE slug='financial-planning-at-40';
  SELECT id INTO l_sector      FROM lessons WHERE slug='sector-analysis';
  SELECT id INTO l_screeners   FROM lessons WHERE slug='stock-screeners-guide';
  SELECT id INTO l_etf         FROM lessons WHERE slug='etf-investing-guide';
  SELECT id INTO l_mgmt        FROM lessons WHERE slug='reading-management-commentary';
  SELECT id INTO l_buybacks    FROM lessons WHERE slug='buybacks-rights-issues';
  SELECT id INTO l_swing       FROM lessons WHERE slug='swing-trading-system';
  SELECT id INTO l_position    FROM lessons WHERE slug='position-trading';
  SELECT id INTO l_ipo_inv     FROM lessons WHERE slug='ipo-investing-guide';
  SELECT id INTO l_wacc        FROM lessons WHERE slug='cost-of-capital-wacc';
  SELECT id INTO l_lbo         FROM lessons WHERE slug='lbo-modeling-basics';
  SELECT id INTO l_distress    FROM lessons WHERE slug='financial-distress-indicators';
  SELECT id INTO l_ipo_proc    FROM lessons WHERE slug='ipo-process-complete';
  SELECT id INTO l_conglom     FROM lessons WHERE slug='conglomerates-holding-companies';
  SELECT id INTO l_moat        FROM lessons WHERE slug='competitive-moat-analysis';
  SELECT id INTO l_scripts     FROM lessons WHERE slug='money-scripts';
  SELECT id INTO l_couples     FROM lessons WHERE slug='couples-money-conflicts';
  SELECT id INTO l_trauma      FROM lessons WHERE slug='overcoming-financial-trauma';
  SELECT id INTO l_identity    FROM lessons WHERE slug='wealth-identity';
  SELECT id INTO l_environ     FROM lessons WHERE slug='financial-environment-design';
  SELECT id INTO l_interbank   FROM lessons WHERE slug='interbank-forex-market';
  SELECT id INTO l_fx_opt      FROM lessons WHERE slug='fx-options-basics';
  SELECT id INTO l_algo_fx     FROM lessons WHERE slug='algorithmic-forex-trading';
  SELECT id INTO l_em_curr     FROM lessons WHERE slug='emerging-market-currencies';
  SELECT id INTO l_geo         FROM lessons WHERE slug='geopolitics-and-currencies';
  SELECT id INTO l_fx_plan     FROM lessons WHERE slug='forex-trading-plan';
  SELECT id INTO l_vwap        FROM lessons WHERE slug='vwap-mastery';
  SELECT id INTO l_smc         FROM lessons WHERE slug='smart-money-concepts';
  SELECT id INTO l_opt_flow    FROM lessons WHERE slug='options-flow-unusual-activity';
  SELECT id INTO l_mkt_profile FROM lessons WHERE slug='market-profile-basics';
  SELECT id INTO l_seasonal    FROM lessons WHERE slug='market-seasonality';
  SELECT id INTO l_gaps        FROM lessons WHERE slug='gap-analysis-trading';
  SELECT id INTO l_risk_mgmt   FROM lessons WHERE slug='risk-management-masterclass';
  SELECT id INTO l_backtest    FROM lessons WHERE slug='backtesting-strategies';
  SELECT id INTO l_trading_sys FROM lessons WHERE slug='complete-trading-system';
  SELECT id INTO l_web3        FROM lessons WHERE slug='web3-identity-dids';
  SELECT id INTO l_rwa         FROM lessons WHERE slug='rwa-tokenization-real-world-assets';
  SELECT id INTO l_crypto_reg  FROM lessons WHERE slug='global-crypto-regulations';
  SELECT id INTO l_defi_risk   FROM lessons WHERE slug='defi-risk-management';
  SELECT id INTO l_onchain     FROM lessons WHERE slug='on-chain-analytics-mastery';
  SELECT id INTO l_zkp         FROM lessons WHERE slug='zkp-zero-knowledge-crypto';

-- ─────────────────────────────────────────────────────────────
-- HELPER: create quiz + questions in one block
-- ─────────────────────────────────────────────────────────────

-- 1. WILLS AND NOMINATIONS
IF l_wills IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_wills) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_wills,'Wills and Nominations Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'What happens to assets when someone dies without a will in India?',
   '["Assets are equally split between spouse and children","Intestate succession laws apply based on religious personal law","All assets go to the government","The eldest child inherits everything"]',
   1,'When someone dies without a will (intestate), succession laws apply — for Hindus, the Hindu Succession Act determines distribution among spouse, children, and mother.',1),

  (q_id,'What is the PRIMARY advantage of registering a will over keeping it unregistered?',
   '["It costs less to register","A registered will is much harder to legally challenge","Registration makes it valid in other countries","Only registered wills can name an executor"]',
   1,'An unregistered will is valid in India but can be challenged. A registered will is far harder to contest, providing stronger legal protection for your wishes.',2),

  (q_id,'If your will says your flat goes to your son but your wife is the home loan insurance nominee, what happens?',
   '["The will always overrides the nomination","The nomination always overrides the will","Insurance goes to wife (nominee), creating a potential dispute that courts resolve","Son gets the flat and wife gets nothing"]',
   2,'Nomination determines who receives the asset immediately. The insurance proceeds go to the nominee (wife), while the will controls other aspects. This mismatch creates disputes, which is why aligning nominations and will is critical.',3),

  (q_id,'Which statement about EPF nomination is MOST accurate?',
   '["EPF nomination is optional and rarely matters","EPF corpus is often the largest asset for salaried employees — nomination is critical","EPF automatically goes to the legal heir without any nomination","EPF nomination can only be done at the time of joining"]',
   1,'EPF corpus is often the largest financial asset for salaried employees. A valid nomination ensures the corpus reaches your intended beneficiary quickly without legal delays.',4),

  (q_id,'What does a residuary clause in a will accomplish?',
   '["It lists all your assets in detail","It catches any assets not specifically mentioned, preventing them from being disputed","It names backup executors if the primary executor refuses","It specifies funeral arrangements"]',
   1,'A residuary clause directs that everything not specifically mentioned goes to a named person. This prevents assets you forgot to include from becoming disputed.',5);
END IF;

-- 2. JOINT ACCOUNTS AND COUPLES
IF l_joint IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_joint) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_joint,'Joint Accounts and Couples Finance Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'Which joint account operation mode is MOST practical for day-to-day transactions?',
   '["Jointly — both must sign","Former or Survivor — primary holder transacts","Either or Survivor — either partner can transact independently","Sequentially — partners take turns"]',
   2,'"Either or Survivor" allows either partner to transact independently, making it most practical for daily use. Both partners have full access during their lifetimes.',1),

  (q_id,'In the "Yours, Mine, Ours" financial structure, what is the joint account used for?',
   '["All income from both partners","Only the higher earner''s salary","Shared expenses like rent, groceries, and EMIs","Investment and savings only"]',
   2,'In this structure, each partner maintains an individual account while a joint account covers shared household expenses. Personal spending comes from individual accounts.',2),

  (q_id,'Why should a non-working partner still maintain their own bank account and investments?',
   '["It is required by law in India","To avoid tax on joint income","Financial independence protects against vulnerability if the relationship ends or spouse dies","To get better interest rates"]',
   2,'Financial dependence without individual accounts creates extreme vulnerability. A non-working partner with no accounts, credit history, or investments faces catastrophic risk if the partner dies, becomes disabled, or if the relationship ends.',3),

  (q_id,'What does the monthly money meeting primarily help couples achieve?',
   '["Maximise tax savings","Track spending and prevent 90% of money-related conflicts through regular communication","Decide who controls the finances","Apply for joint loans"]',
   1,'Regular monthly financial conversations prevent most money conflicts by creating shared visibility, accountability for goals, and a neutral forum for financial decisions before they become emotional.',4);
END IF;

-- 3. CREDIT CARDS DONE RIGHT
IF l_credit IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_credit) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_credit,'Credit Cards Done Right Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'What is the ONE rule that makes credit cards net positive for your finances?',
   '["Always pay the minimum amount due","Never spend on a credit card what you do not already have in your bank account","Only use credit cards for online purchases","Spend as much as possible to earn maximum rewards"]',
   1,'Treating a credit card like a debit card — only spending what you already have — prevents the 36-42% interest trap while still earning rewards.',1),

  (q_id,'What is the "minimum payment trap"?',
   '["Credit card annual fees that are hard to avoid","Paying only the minimum keeps you in debt for years and costs massive interest","Minimum spend requirements for airport lounge access","The minimum credit limit on starter cards"]',
   1,'Credit card companies deliberately set minimum payments low (2-5%) to maximize interest income. Paying only the minimum on a ₹50,000 balance at 36% could take years and cost more than the original balance in interest.',2),

  (q_id,'To optimise your CIBIL credit score through credit card use, you should keep credit utilisation below:',
   '["80% of limit","50% of limit","30% of limit (ideally below 10%)","100% of limit is fine if you pay on time"]',
   2,'High utilisation signals financial stress to lenders. Keeping utilisation below 30% (ideally under 10%) demonstrates responsible credit management and improves CIBIL score.',3),

  (q_id,'Converting a credit card purchase to EMI typically costs:',
   '["0% since EMI is interest-free","3-5% processing fee only","13-18% interest rate","Same as the credit card standard rate of 36-42%"]',
   2,'EMI conversion charges 13-18% interest, which is lower than the 36-42% standard credit card rate, but still significant. Use only for genuine emergencies, not lifestyle purchases.',4),

  (q_id,'Which action BEST builds your CIBIL score through credit card usage?',
   '["Apply for many cards in the same month to get more credit","Pay full statement balance every month and keep oldest card active","Spend close to your credit limit every month","Close unused old credit cards"]',
   1,'Paying the full balance every month demonstrates responsible usage. Keeping your oldest card active maintains credit history length. Never closing old cards avoids reducing your available credit.',5);
END IF;

-- 4. FINANCIAL PLANNING FOR WOMEN
IF l_women IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_women) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_women,'Financial Planning for Women Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'Why do women statistically need a larger retirement corpus than men?',
   '["Women have higher living expenses","Women live 3-5 years longer on average and the corpus must last longer","Women retire earlier by law","Women pay higher taxes on withdrawals"]',
   1,'Indian women live 3-5 years longer than men on average. The same retirement corpus must fund more years of living expenses, requiring either a larger corpus or higher-yielding investments.',1),

  (q_id,'Which government savings scheme is specifically designed for daughters and offers 8.2% tax-free returns?',
   '["PPF (Public Provident Fund)","Mahila Samman Savings Certificate","Sukanya Samriddhi Yojana","Senior Citizen Savings Scheme"]',
   2,'Sukanya Samriddhi Yojana (SSY) is specifically for daughters below 10 years. It offers 8.2% guaranteed return, tax-free maturity, and can be partially withdrawn at age 18 for education.',2),

  (q_id,'Under the Hindu Succession Act 2005 amendment, what rights do married daughters have?',
   '["No rights in father''s property after marriage","Equal rights in father''s Hindu Undivided Family (HUF) ancestral property","Rights only if the father dies intestate","Rights only to personal property, not ancestral"]',
   1,'The 2005 amendment to the Hindu Succession Act gave daughters equal rights as sons in ancestral Hindu property, regardless of their marital status.',3),

  (q_id,'What is the MOST important financial action for a woman planning a career break?',
   '["Stop all investments during the break to preserve cash","Before the break, maximise EPF contributions, build personal investment portfolio, and ensure adequate term insurance on the spouse","Surrender all insurance policies to reduce expenses","Withdraw EPF before the break begins"]',
   1,'Before a career break, maximising savings, building a personal portfolio, and securing insurance creates a financial buffer. During the break, even small SIPs maintain the investing habit.',4);
END IF;

-- 5. MONEY AND RELATIONSHIPS
IF l_money_rel IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_money_rel) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_money_rel,'Money and Relationships Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'When couples fight about money, what are they USUALLY actually fighting about?',
   '["The specific amount spent","Values, control, security, and fear — not money itself","Poor financial literacy","Who earns more"]',
   1,'Money conflicts are almost never purely about money. They reflect deeper conflicts about values (security vs freedom), control, trust, identity, and fear of the future.',1),

  (q_id,'Which money personality struggles most with enjoying money or being generous?',
   '["The Spender","The Money Monk","The Saver","The Avoider"]',
   2,'The Saver derives security from accumulation. Spending causes anxiety even when affordable. They struggle to enjoy present consumption or be generous despite having sufficient funds.',2),

  (q_id,'What is "financial infidelity"?',
   '["Spending money on a secret romantic partner","Hiding financial information from a partner — secret accounts, hidden debt, undisclosed income","Filing taxes separately without informing the spouse","Lending money to family without consulting the partner"]',
   1,'Financial infidelity means hiding financial information from a partner. Studies show it is as damaging to relationships as physical infidelity and is a leading cause of divorce.',3),

  (q_id,'What is the "24-hour rule" for money conversations?',
   '["Always wait 24 hours before making any financial decision","If a money conversation escalates, pause and continue in 24 hours after emotions settle","Review bank statements every 24 hours","Spend 24 hours researching before any purchase above ₹5,000"]',
   1,'Immediate resolution of heated financial arguments rarely produces good outcomes. The 24-hour pause allows emotions to settle and enables more rational problem-solving.',4);
END IF;

-- 6. HOME BUYING GUIDE
IF l_home IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_home) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_home,'Home Buying Guide Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'According to the 5% rule for rent vs buy, when might renting be financially better?',
   '["Annual rent is above 5% of property price","Annual rent is below 5% of property price","When EMI is less than rent","Always — renting is always better"]',
   1,'Annual ownership cost is approximately 5% of property value. If annual rent is less than 5% of the property price, renting saves money — the investment opportunity of the down payment also earns returns.',1),

  (q_id,'One-time costs beyond the property purchase price typically add how much to the total cost?',
   '["1-2% of property value","3-5% of property value","8-15% of property value","20-25% of property value"]',
   2,'Stamp duty (4-7%), registration (1%), GST for under-construction (5-12%), brokerage (1-2%), legal costs, loan processing fees, and interior work add 8-15% on top of the property price.',2),

  (q_id,'For a ₹50 lakh home loan at 8.5%, choosing a 25-year tenure over 15 years results in:',
   '["Lower total interest — you pay for longer","Higher total interest of about ₹31 lakh more","The same total interest","Lower EMI AND lower total interest"]',
   1,'15-year tenure: Total interest ₹38.7 lakh. 25-year tenure: Total interest ₹70.4 lakh. Longer tenure = more total interest despite lower monthly EMI.',3),

  (q_id,'What is the PRIMARY purpose of RERA (Real Estate Regulatory Authority)?',
   '["Set home loan interest rates","Regulate builder conduct, ensure project completion, and protect homebuyer rights","Provide subsidies for affordable housing","Tax real estate transactions"]',
   1,'RERA was established to protect homebuyers from builder fraud, project delays, and misleading area claims. It mandates registration, carpet area disclosure, and penalties for delays.',4),

  (q_id,'Which is a major RED FLAG when buying a property?',
   '["Builder offering a small discount on early payment","RERA registration not available for the project","Seller asking for independent legal title verification","Agent providing comparison with similar properties"]',
   1,'Any residential project above 500 sqm or 8 apartments MUST be RERA-registered. An unregistered project removes crucial legal protections for buyers.',5);
END IF;

-- 7. NPS DEEP DIVE
IF l_nps IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_nps) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_nps,'NPS Deep Dive Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'What makes Section 80CCD(1B) the UNIQUE advantage of NPS?',
   '["It replaces the standard 80C deduction","It provides an additional ₹50,000 deduction OVER AND ABOVE the ₹1.5 lakh 80C limit","It exempts the entire NPS corpus from tax","It allows contribution beyond age 60"]',
   1,'Section 80CCD(1B) allows ₹50,000 additional deduction beyond the ₹1.5 lakh 80C ceiling. For someone in the 30% bracket, this saves ₹15,000 annually in tax — uniquely available through NPS.',1),

  (q_id,'At age 60, what percentage of NPS corpus MUST be used to purchase an annuity?',
   '["20% minimum","40% minimum","60% minimum","80% minimum"]',
   1,'At retirement (age 60), NPS rules require a minimum 40% of the corpus to be used for purchasing an annuity (monthly pension). The remaining 60% can be withdrawn as a tax-free lump sum.',2),

  (q_id,'For a private sector employee under 45, what is the RECOMMENDED NPS equity (E) allocation?',
   '["25% maximum — too risky","50% to balance growth and safety","Maximum 75% — for highest long-term returns","0% — use only government securities (G)"]',
   2,'With a 15-20 year horizon, maximising equity (75%) provides the best growth potential. The long time horizon allows recovery from market volatility, maximising the compounding benefit.',3),

  (q_id,'How does NPS compare to PPF for liquidity?',
   '["NPS is more liquid — withdraw anytime","Both have the same 15-year lock-in","NPS is locked until age 60 (less liquid than PPF''s 15-year)","PPF has no withdrawal restrictions after 5 years"]',
   2,'NPS locks funds until age 60 (longer than PPF''s 15 years). PPF allows partial withdrawals from year 7 and complete withdrawal at 15 years, making it more liquid than NPS.',4);
END IF;

-- 8. CHILD EDUCATION PLANNING
IF l_education IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_education) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_education,'Child Education Planning Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'Education costs in India are rising at approximately what annual rate?',
   '["3-5% (same as CPI inflation)","6-8% (slightly above inflation)","10-12% (nearly double CPI)","15-20% (triple CPI)"]',
   2,'Education inflation in India runs at 10-12% annually — nearly double general CPI. This means education costs double every 6-7 years, making early planning critical.',1),

  (q_id,'For a 3-year-old with engineering plans at age 18, which monthly SIP is needed (12% returns)?',
   '["₹3,000/month","₹8,000/month","₹12,800/month","₹25,000/month"]',
   2,'₹15 lakh today inflated at 10% for 15 years = ₹62.7 lakh target. To reach ₹63 lakh at 12% returns in 15 years requires approximately ₹12,800/month.',2),

  (q_id,'Why are child insurance-linked education plans generally NOT recommended?',
   '["They are illegal in India","High charges, inflexibility, and lower returns vs pure term insurance + mutual fund SIP","They cannot be claimed as 80C deduction","They have a minimum age requirement of 10 years"]',
   1,'Insurance-linked plans combine insurance and investment inefficiently, with high charges eating into returns. Pure term insurance + SIP in mutual funds provides better protection and higher returns.',3),

  (q_id,'What is the BEST instrument for the equity portion of a long-term (10+ year) education corpus?',
   '["Bank FD for safety","PPF for guaranteed returns","Equity mutual funds (index fund + mid-cap) targeting 12% returns","Sukanya Samriddhi only"]',
   2,'For 7+ year goals, equity mutual funds provide the best expected returns (12%+ historically). The long horizon allows recovery from volatility while compounding creates significant wealth.',4);
END IF;

-- 9. FREELANCER FINANCES
IF l_freelancer IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_freelancer) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_freelancer,'Freelancer Finance Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'Under Section 44ADA presumptive taxation, a freelance consultant with ₹40 lakh gross receipts declares what as taxable profit?',
   '["₹40 lakh (full amount)","₹20 lakh (50% of receipts)","₹10 lakh (25%)","Only actual profit after deducting all expenses"]',
   1,'Under 44ADA, professionals declare 50% of gross receipts as profit. No need to maintain detailed books or prove actual expenses. ₹40 lakh receipts → ₹20 lakh taxable profit.',1),

  (q_id,'In the percentage allocation system for freelancers, what percentage is immediately set aside for taxes?',
   '["10%","20%","30%","40%"]',
   2,'The recommended split: 30% to a separate tax reserve account (untouched), 20% to investments, 50% for living expenses. This ensures tax money is always available when due.',2),

  (q_id,'GST is mandatory for freelancers when annual turnover exceeds:',
   '["₹10 lakh","₹20 lakh (₹10 lakh in some states)","₹50 lakh","₹1 crore"]',
   1,'GST registration is mandatory for service providers with annual turnover above ₹20 lakh (₹10 lakh in some North-Eastern and special category states). Services to foreign clients are zero-rated.',3),

  (q_id,'Why is NPS PARTICULARLY valuable for self-employed professionals?',
   '["Lower minimum contribution than EPF","20% of gross income deductible under 80CCD(1) + additional ₹50,000 under 80CCD(1B)","Employer also contributes 10%","No lock-in until age 60"]',
   1,'For self-employed, NPS allows deduction of 20% of gross income (vs 10% for salaried) under 80CCD(1), plus the additional ₹50,000 under 80CCD(1B). Significantly larger deduction than most alternatives.',4);
END IF;

-- 10. FINANCIAL PLANNING AT 40
IF l_at40 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_at40) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_at40,'Financial Planning at 40 Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'According to the "40 at 40" rule, what net worth target should someone with ₹20 lakh annual income aim for by age 40?',
   '["₹20 lakh (1x income)","₹40 lakh (2x income)","₹60 lakh (3x income)","₹1 crore (5x income)"]',
   2,'The 40 at 40 rule targets net worth of 3x annual income by age 40. For ₹20 lakh income: ₹60 lakh in total assets (home equity + investments + EPF + other).',1),

  (q_id,'Why is counter-intuitively INCREASING equity allocation recommended for someone behind on retirement savings at 40?',
   '["Equity is safer than debt at 40","With 20 years to retirement, you have time to weather volatility and equity''s higher returns are needed to catch up","Equity provides regular income through dividends","Equity is tax-free after 3 years"]',
   1,'If significantly behind on retirement savings, you need higher returns to reach the target. With 20 years to retirement, equity''s historical 12%+ returns outweigh short-term volatility risk.',2),

  (q_id,'At age 40, why is a 12-MONTH emergency fund recommended (rather than the usual 6 months)?',
   '["Lifestyle inflation makes 6 months insufficient","Risk of job disruption is more real at 40, and recovery time is longer","12 months earns more interest","Tax rules require 12 months from age 40"]',
   1,'At 40, job disruption risk is higher (management layers, industry changes, health). Recovery time — finding new employment at similar level and compensation — takes longer than at 30.',3);
END IF;

-- 11. SECTOR ANALYSIS
IF l_sector IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_sector) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_sector,'Sector Analysis Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'What percentage of a stock''s price movement typically comes from its sector and macro environment?',
   '["10-20%","30-40%","60-70%","90-100%"]',
   2,'Research shows 60-70% of a stock''s price movement comes from the sector and broader market, not the company itself. Sector selection often matters more than individual stock picking.',1),

  (q_id,'Which metric would BEST identify a sector showing relative strength vs NIFTY?',
   '["Absolute stock price","Sector ETF performance relative to NIFTY 50 index","Number of stocks in the sector","Sector P/E ratio"]',
   1,'Relative strength compares the sector''s performance to the benchmark. A sector ETF rising faster than NIFTY shows relative strength — outperformance regardless of absolute direction.',2),

  (q_id,'What is the MAIN input cost concern for paint companies like Asian Paints?',
   '["Steel prices","Oil prices (crude derivatives are key raw materials for paints)","Gold prices","Agricultural commodity prices"]',
   1,'Paints are primarily derived from petrochemicals and crude oil derivatives. Rising oil prices compress paint company margins significantly, making crude oil the key input cost to track.',3),

  (q_id,'Owning 5 stocks all from the banking sector represents what type of portfolio problem?',
   '["Appropriate sector concentration for conviction","Not diversification — it is concentrated sector betting with 5x the risk","Too little exposure to banking","Good practice if you understand banking well"]',
   1,'Owning multiple stocks in the same sector does not eliminate sector risk. All 5 will move similarly during a banking sector crisis. True diversification requires exposure across uncorrelated sectors.',4);
END IF;

-- 12. STOCK SCREENERS
IF l_screeners IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_screeners) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_screeners,'Stock Screeners Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'What is a stock screener''s PRIMARY purpose?',
   '["Generate definitive buy signals","Filter thousands of companies to a shortlist for further research","Replace fundamental analysis","Predict short-term price movements"]',
   1,'Screeners are idea-generation tools, not buy signals. Every screened result still requires fundamental analysis — reading annual reports, understanding the business, and valuation work.',1),

  (q_id,'Which of the following is a Screener.in query for a quality growth screen?',
   '["Dividend yield > 5","Market cap < 100","Return on equity > 15 AND Debt to equity < 0.3 AND Net profit growth 5Years > 12","Price to book < 0.5 AND Current ratio < 1"]',
   2,'Quality growth screens combine profitability (ROE > 15%), low leverage (D/E < 0.3), and earnings growth (profit growth > 12% over 5 years) — reflecting Buffett-style quality investing.',2),

  (q_id,'What is "overfitting" in the context of stock screens?',
   '["Using too many stocks in a portfolio","Creating a screen with so many conditions that it only matches historical winners that are already expensive","Not updating your screen regularly","Using only one financial metric"]',
   1,'Overfitting occurs when you add so many screening conditions that the result perfectly captures past winners — but the screen is actually identifying past performance, not future opportunity.',3),

  (q_id,'After a screener produces 15-20 results, what should your NEXT step be?',
   '["Buy all of them immediately","Eliminate obvious red flags, then read annual reports of the remaining 5-6","Sell your current holdings to make room","Search for even more stocks"]',
   1,'Screener output is a starting list. The next step is eliminating red flags (high promoter pledging, recent auditor changes), then doing deep fundamental work on the remaining candidates.',4);
END IF;

-- 13. ETF INVESTING
IF l_etf IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_etf) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_etf,'ETF Investing Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'What is the MAIN advantage of an index fund over an ETF for regular SIP investors?',
   '["Lower expense ratio","Better returns","Easier SIP automation without needing a demat account","More diversification"]',
   2,'ETFs require a demat account and manual order placement for each investment. Index funds support easy automated SIPs directly from bank accounts — ideal for systematic investing.',1),

  (q_id,'The MOST IMPORTANT factor to check before buying a sectoral ETF is:',
   '["The fund house reputation","Average daily trading volume and liquidity","The benchmark index name","The fund manager''s track record"]',
   1,'Illiquid ETFs have wide bid-ask spreads — the gap between buy and sell prices. This spread represents an immediate loss on entry and exit. Always verify average daily volume before buying sectoral ETFs.',2),

  (q_id,'Nippon NIFTYBEES is an ETF that tracks:',
   '["Gold prices","NIFTY Next 50","NIFTY 50 index","Bank NIFTY"]',
   2,'NIFTYBEES (Nippon India ETF Nifty BeES) is India''s oldest and most liquid ETF, tracking the NIFTY 50 index — the 50 largest companies on NSE by market cap.',3),

  (q_id,'What makes Bharat Bond ETF different from equity ETFs?',
   '["It tracks gold prices","It invests in AAA-rated public sector bonds with fixed maturity dates","It is only available to institutional investors","It trades only once a day like a mutual fund"]',
   1,'Bharat Bond ETF invests in AAA-rated government/public sector bonds with defined maturity dates. It is a debt instrument offering predictable returns, not equity.',4);
END IF;

-- 14. READING MANAGEMENT COMMENTARY
IF l_mgmt IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_mgmt) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_mgmt,'Management Commentary Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'Which is a GREEN FLAG indicating honest, capable management?',
   '["Vague guidance like ''we remain optimistic''","Specific numerical guidance with accountability","Blaming all failures on external factors","Using many adjusted metrics like ''adjusted EBITDA''"]',
   1,'Specific guidance ("We expect revenue of ₹2,200-2,400 crore next quarter") indicates confidence and accountability. Vague language often precedes disappointment.',1),

  (q_id,'What does "insider buying" (promoters buying shares in the open market) signal?',
   '["The stock has already peaked","Promoters believe the stock is undervalued — they are betting personal money","A mandatory regulatory disclosure with no investment signal","Management is trying to inflate the stock price artificially"]',
   1,'When promoters buy shares with their own money in the open market (disclosed in exchange filings), they are putting personal capital at risk — a genuine signal of confidence in undervaluation.',2),

  (q_id,'What is the best technique to evaluate management quality objectively?',
   '["Count how many awards the company has won","Pull the MD&A from 2 years ago and compare what was promised to what was delivered","Read the most recent press release","Check the management''s LinkedIn profiles"]',
   2,'The year-over-year comparison technique reveals the gap between management promises and actual delivery. Consistent over-delivery indicates honesty and competence; persistent under-delivery reveals the opposite.',3),

  (q_id,'Which pattern in management commentary is a RED FLAG?',
   '["Acknowledging a specific failed project with a remediation plan","Providing granular segment revenue data","Constant guidance downgrades — promise X, deliver 0.7X, reset to 0.7X, deliver 0.5X","Quarterly earnings calls with detailed Q&A"]',
   2,'A pattern of consistently missing guidance — even after resetting expectations lower — indicates poor forecasting, possible optimistic bias, or deliberate misdirection.',4);
END IF;

-- 15. BUYBACKS AND RIGHTS ISSUES
IF l_buybacks IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_buybacks) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_buybacks,'Buybacks and Rights Issues Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'When a company buys back its own shares, what is the PRIMARY effect on remaining shareholders?',
   '["Share count increases, diluting EPS","Share count decreases, increasing EPS for remaining shareholders","No effect on EPS","All shareholders receive cash immediately"]',
   1,'Buybacks reduce the number of shares outstanding. The same total earnings are now distributed among fewer shares, increasing earnings per share and typically the stock price.',1),

  (q_id,'Which type of buyback is a NEGATIVE red flag?',
   '["Buyback at a discount to fair value","Buyback funded by excess cash when stock is cheap","Buyback while simultaneously taking on new debt","Buyback when promoters also purchase shares alongside"]',
   2,'A buyback funded by taking on debt is financial engineering, not value creation. It leverages the company to return capital — which destroys value if the company does not have genuine excess cash.',2),

  (q_id,'In a rights issue, if you are long-term bullish on the stock but lack funds to exercise rights, what SHOULD you do?',
   '["Do nothing — rights expire worthless","Sell your existing shares to fund the rights","Sell your rights on the exchange (rights are tradeable)","Wait for the company to cancel the rights issue"]',
   2,'Rights are listed and tradeable on exchanges. If you cannot exercise them but do not want to lose their value, selling them on the exchange recovers the economic value.',3),

  (q_id,'What does a tender offer buyback at a 20% premium to market price mean for shareholders?',
   '["They must sell their shares","They can choose to tender shares at the premium price, or hold if they prefer the long-term upside","They automatically receive the premium in cash","It is mandatory participation for institutional shareholders only"]',
   1,'Tender offer buybacks give shareholders a choice: tender (sell) at the premium for immediate gain, or hold if they believe long-term value exceeds the buyback price.',4);
END IF;

-- 16. SWING TRADING
IF l_swing IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_swing) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_swing,'Swing Trading Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'Swing trading is BEST suited for which type of person?',
   '["Someone who can watch screens all day","A person with a job who checks markets once daily and cannot monitor real-time","Someone who wants to hold investments for 5+ years","A person who prefers guaranteed returns"]',
   1,'Swing trading''s 2-10 day holding period requires only daily monitoring — checking once and setting orders. This makes it compatible with having a job, unlike intraday which requires full-time attention.',1),

  (q_id,'In a swing trading system, the market regime filter says to only take LONG swings in stocks:',
   '["Below their 200-day moving average","Above their 200-day moving average","With the highest recent momentum regardless of MA","With the lowest P/E ratio"]',
   1,'Only taking long swings in stocks above their 200-day MA aligns with the dominant uptrend. Trading against the long-term trend dramatically reduces win probability.',2),

  (q_id,'With 1% risk per trade, entry at ₹100, and stop at ₹96 (4% stop), what is the position size for a ₹5 lakh trading account?',
   '["₹50,000 (10% of account)","₹1,25,000 (25% of account)","₹2,00,000 (40% of account)","₹5,00,000 (100% of account)"]',
   1,'Position size = (Account × Risk%) / Stop% = (₹5L × 1%) / 4% = ₹5,000 / 0.04 = ₹1,25,000. At ₹100/share: 1,250 shares.',2),

  (q_id,'Without a trading journal review process, swing trading becomes:',
   '["More profitable as you rely on instinct","Expensive trial and error — the same mistakes repeat without feedback","Unnecessary — good traders just know what to do","More systematic because you trade freely"]',
   3,'The journal review creates the feedback loop essential for improvement. Without it, you repeat the same costly mistakes indefinitely with no mechanism for learning from them.',4);
END IF;

-- 17. POSITION TRADING
IF l_position IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_position) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_position,'Position Trading Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'Position trading typically holds trades for:',
   '["Minutes to hours (intraday)","2-10 days (swing)","Several weeks to several months","5-10 years (long-term investing)"]',
   2,'Position trading captures trend moves over weeks to months — longer than swing trading (days) but shorter than long-term investing (years).',1),

  (q_id,'What is the TOP-DOWN filtering process for position trading stock selection?',
   '["Screen for lowest P/E stocks in any sector","Identify strongest sectors → find strongest stocks within those sectors → narrow to 5-10 candidates","Only trade NIFTY 50 stocks regardless of sector","Use random selection with fundamental filters"]',
   1,'Top-down: First identify outperforming sectors (relative strength vs NIFTY), then find the strongest stocks within those sectors. Strong stock + strong sector = higher probability setup.',2),

  (q_id,'The "4% weekly rule" for exits states that you should exit when:',
   '["The stock falls 4% from your purchase price","The stock closes the week more than 4% below the prior week''s low","Weekly volume drops by 4%","The stock underperforms NIFTY by 4% weekly"]',
   1,'A weekly close more than 4% below the prior week''s low signals a significant breakdown of the trend structure. This simple rule catches most major trend reversals.',3);
END IF;

-- 18. IPO INVESTING GUIDE
IF l_ipo_inv IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_ipo_inv) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_ipo_inv,'IPO Investing Guide Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'What does SEBI data generally show about Indian IPO performance over long periods?',
   '["IPOs consistently outperform the market by 20%+","Most Indian IPOs underperform the broader market after listing","IPOs always list at exactly their issue price","IPO performance is impossible to predict"]',
   1,'SEBI studies show most Indian IPOs underperform the broader market after listing. Listing gains often go to those who flip immediately — long-term holders frequently lose.',1),

  (q_id,'In an IPO, "OFS" (Offer for Sale) means:',
   '["New shares are issued and money goes to the company","Existing shareholders sell their shares — money goes to them, not the company","A discounted price for retail investors","A special tranche for overseas investors"]',
   1,'In OFS, existing promoters or investors sell their shares. The IPO raises no capital for the company — it is essentially an exit for early investors. Warrants scrutiny, though not always negative.',2),

  (q_id,'Why is applying based on GMP (Grey Market Premium) alone risky?',
   '["GMP is not available before listing","GMP reflects fundamental value accurately","GMP is driven by speculative demand and can be artificially created by operators — not fundamental value","GMP is only relevant for large investors"]',
   2,'GMP is informal, unregulated, and can be manipulated. High GMP plus poor fundamentals often results in a strong listing followed by sharp decline as allottees sell.',3),

  (q_id,'For retail applicants (up to ₹2 lakh) in an oversubscribed IPO, how is allotment determined?',
   '["Proportional — larger application gets more shares","Random lottery — all successful applicants get minimum lot","First-come-first-served","Based on your CIBIL score"]',
   1,'Retail allotment in oversubscribed IPOs uses a lottery system where each successful applicant gets exactly one minimum lot regardless of application size — making larger applications pointless for retail.',4);
END IF;

-- 19. WACC
IF l_wacc IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_wacc) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_wacc,'WACC Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'In the WACC formula, why is the cost of debt multiplied by (1 - Tax rate)?',
   '["To account for currency risk","Because interest payments are tax-deductible, reducing the true cost of debt","To adjust for inflation","Because debt is riskier than equity"]',
   1,'Interest payments reduce taxable income, creating a tax shield. The true after-tax cost of 9% debt at 25% tax rate is 9% × (1-0.25) = 6.75% — this is what the company actually pays net of tax benefit.',1),

  (q_id,'According to CAPM, a stock with Beta of 1.5 (higher volatility than market) will have:',
   '["Lower cost of equity than the market","The same cost of equity as the market","Higher cost of equity than the market","Cost of equity equal to the risk-free rate only"]',
   2,'Higher beta means higher systematic risk. CAPM says: Re = Rf + β × (Rm-Rf). With β=1.5, the risk premium is amplified by 50% — investors demand higher returns for bearing more volatility.',2),

  (q_id,'When interest rates rise, what happens to company valuations via the WACC channel?',
   '["Valuations increase because companies earn more on cash","Valuations decrease because risk-free rate rises → WACC rises → DCF value falls","No effect — WACC is independent of interest rates","Valuations only change for debt-heavy companies"]',
   1,'Rising rates increase the risk-free rate (Rf) → raises the cost of equity via CAPM → raises WACC → higher discount rate → lower present value of future cash flows → lower valuation.',3),

  (q_id,'A company uses WACC of 11% as its hurdle rate. Which project should it ACCEPT?',
   '["Project A returning 9% — below WACC","Project B returning 11% — equals WACC","Project C returning 15% — above WACC","None — always use equity financing only"]',
   2,'Projects returning above WACC create value (earn more than the capital costs). Projects below WACC destroy value. Project C at 15% returns 4% above the 11% cost of capital — value creating.',4);
END IF;

-- 20. LBO
IF l_lbo IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_lbo) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_lbo,'LBO Basics Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'In a typical LBO structure, approximately what percentage of the acquisition price comes from equity (PE fund)?',
   '["70-80% equity","50-60% equity","20-40% equity","5-10% equity"]',
   2,'Typical LBO structure: 30% equity (PE fund), 50% senior debt, 20% subordinated debt. The high leverage amplifies returns but also risk.',1),

  (q_id,'The THREE value creation levers in an LBO are:',
   '["Revenue growth, cost cutting, new markets","Debt paydown, EBITDA improvement, and multiple expansion","IPO listing, dividend payments, and asset sales","Headcount reduction, price increases, and acquisitions"]',
   1,'LBO returns come from: (1) Debt paydown — as company cash flows reduce debt, equity value grows; (2) EBITDA improvement — operational gains; (3) Multiple expansion — selling at a higher valuation multiple than bought.',2),

  (q_id,'Why are businesses with STABLE, PREDICTABLE cash flows preferred as LBO targets?',
   '["They have lower acquisition price","Stable cash flows reliably service the large debt burden loaded onto the company post-acquisition","They require less PE firm involvement","They have higher growth rates"]',
   1,'LBO debt must be serviced from the acquired company''s cash flows. Cyclical or volatile cash flows risk missing debt payments, triggering default. Predictable cash flows (subscription businesses, utilities) ensure debt service.',3),

  (q_id,'Multiple expansion in an LBO means:',
   '["The company''s revenue grows at the same rate as the market","The PE firm sells the business at a higher EV/EBITDA multiple than it paid","The number of products offered increases","The acquisition price is increased after closing"]',
   1,'If a business is bought at 6x EBITDA and sold at 9x EBITDA (same or better EBITDA), the multiple expansion alone creates significant return — independent of operational improvement.',4);
END IF;

-- 21. FINANCIAL DISTRESS
IF l_distress IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_distress) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_distress,'Financial Distress Indicators Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'According to the Altman Z-Score, a score below 1.81 indicates:',
   '["Company is in the safe zone","Company is in the grey zone","High bankruptcy risk — distress zone","Excellent financial health"]',
   2,'Z-Score interpretation: >2.99 = safe, 1.81-2.99 = grey zone (caution), <1.81 = distress zone with high bankruptcy risk.',1),

  (q_id,'Revenue growing but operating cash flow consistently falling is a warning sign of:',
   '["Strong business performance","Earnings quality issues — revenue recognised without actual cash collection","A technology company reinvesting in growth","Normal seasonal variation"]',
   1,'The divergence between reported profit and actual cash generation indicates earnings quality problems. Revenue may be booked without actual cash received (channel stuffing, aggressive recognition).',2),

  (q_id,'Rapidly increasing promoter pledge percentage most likely indicates:',
   '["Promoters are confident and buying more shares","Promoters are borrowing against shares due to personal or group financial stress","The company is doing an ESOP","Promoters are reducing their shareholding"]',
   1,'When promoters pledge their shares to raise cash, it suggests they face financial pressure and cannot get the funds from other sources. High pledging creates forced selling risk if the stock falls.',3),

  (q_id,'Which of the following is the MOST reliable insider signal of potential financial distress?',
   '["CFO appearing on TV frequently","Systematic promoter open-market selling while publicly bullish","Company launching a new product line","Board adding independent directors"]',
   1,'Promoters systematically selling their shares while publicly expressing confidence in the company suggests they believe the public narrative is more positive than the private reality — the most reliable early warning signal.',4);
END IF;

-- 22. IPO PROCESS
IF l_ipo_proc IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_ipo_proc) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_ipo_proc,'IPO Process Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'What does SEBI''s review of the DRHP accomplish?',
   '["SEBI approves the business quality and certifies the IPO as a good investment","SEBI checks for completeness and regulatory compliance — NOT business quality approval","SEBI sets the IPO price","SEBI selects the investment bankers"]',
   1,'A common misconception: SEBI does NOT certify business quality. It only verifies the DRHP contains required disclosures and complies with regulations. The "SEBI-approved IPO" phrase can mislead investors.',1),

  (q_id,'Anchor investors in an IPO are required to hold their shares for:',
   '["1 week after listing","30 days after listing","6 months after listing","1 year after listing"]',
   1,'SEBI requires anchor investors (large institutions allocated pre-IPO) to hold shares for 30 days post-listing. This prevents immediate flipping and signals commitment.',2),

  (q_id,'An IPO that was heavily oversubscribed with high GMP often shows what listing day pattern?',
   '["Strong open and sustained rally throughout the day","Strong open then may fade as allottees sell their allotted shares","Unchanged from issue price","Always closes 20%+ above issue price"]',
   1,'High GMP and oversubscription create strong opening demand. However, as allottees who applied purely for listing gains sell, supply increases and the price often retreats from the opening high.',3);
END IF;

-- 23. CONGLOMERATES
IF l_conglom IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_conglom) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_conglom,'Conglomerates and Holding Companies Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'Why do conglomerates typically trade at a DISCOUNT to the sum of their parts?',
   '["Conglomerates have higher debt than standalone companies","Investors prefer to build their own diversified portfolio and pay a premium for simplicity; management allocates capital across unrelated industries","Conglomerates always have worse management","Regulatory rules require conglomerate discounts"]',
   1,'The conglomerate discount reflects investor preference for pure-play sector specialists and scepticism about management allocating capital across unrelated industries — investors can build their own diversified portfolio more cheaply.',1),

  (q_id,'A holding company owns 70% of a subsidiary with ₹10,000 crore market cap. If HoldCo itself trades at ₹4,500 crore market cap, what is the holding company discount?',
   '["10%","20%","36%","50%"]',
   2,'HoldCo''s holding value = 70% × ₹10,000 crore = ₹7,000 crore. HoldCo market cap = ₹4,500 crore. Discount = (7,000 - 4,500) / 7,000 = 35.7% ≈ 36%.',2),

  (q_id,'Which event would MOST likely narrow a holding company''s discount?',
   '["The subsidiary''s stock falling 20%","HoldCo announcing a large acquisition","A subsidiary IPO that crystallises the value of unlisted assets","HoldCo issuing new shares"]',
   2,'A subsidiary IPO gives the market a clear, liquid valuation of previously unlisted assets — crystallising value that was previously uncertain and priced at a discount.',3);
END IF;

-- 24. COMPETITIVE MOAT
IF l_moat IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_moat) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_moat,'Competitive Moat Analysis Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'UPI''s competitive moat is BEST described as:',
   '["Cost advantage — NPCI runs UPI cheaply","Network effects — more merchants and users make UPI more valuable for everyone","Intangible assets — UPI is a government-licensed brand","Efficient scale — only NPCI can run payments"]',
   1,'UPI exhibits classic network effects: more merchants accept UPI because more customers use it; more customers use it because more merchants accept it. The value grows exponentially with scale.',1),

  (q_id,'Which type of moat is GENERALLY considered the strongest and most durable?',
   '["Cost advantage (lower production costs)","Switching costs","Network effects","Intangible assets (brand)"]',
   2,'Network effects create exponentially increasing advantages — the product improves for every user as the network grows. Challengers must simultaneously match product quality AND overcome the network advantage.',2),

  (q_id,'TCS and Infosys enjoy strong switching costs because:',
   '["They have government contracts that cannot be changed","Replacing enterprise software after years of customisation and integration costs crores","Their products are legally patented","They employ the most engineers"]',
   1,'Once enterprise software is deeply integrated into business processes after years of customisation, the cost, time, and risk of switching to a competitor is enormous — creating powerful lock-in.',3),

  (q_id,'To TEST whether a moat is genuine, you should ask:',
   '["Does the company have a famous CEO?","Has ROCE stayed above cost of capital for 10+ years, and have competitors failed to displace it?","Is the company in a technology sector?","Does it have many employees?"]',
   1,'A real moat is evidenced by sustained high returns on capital despite competition. If ROCE has been above cost of capital for 10+ years and competitors have tried and failed, the moat is genuine.',4),

  (q_id,'Dmart''s competitive moat is PRIMARILY based on:',
   '["Network effects — more stores attract more customers","Cost advantage from owned stores (no rent), cash-and-carry model, and rapid inventory turns","Intangible assets — the Dmart brand is irreplaceable","Switching costs — customers cannot shop elsewhere"]',
   1,'Dmart''s model of owning stores (eliminating rent), cash-and-carry with no credit to vendors, and fast inventory turns creates structurally lower costs than competitors — a genuine cost advantage moat.',5);
END IF;

-- 25. MONEY SCRIPTS
IF l_scripts IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_scripts) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_scripts,'Money Scripts Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'Money scripts are typically formed:',
   '["In adulthood through financial education","In childhood, often before age 10, through observation and experience","Only after financial hardship","Through formal school education"]',
   1,'Money scripts form in childhood — often before age 10 — by watching parents, absorbing family attitudes about money, and experiencing financial events. They are rarely consciously examined.',1),

  (q_id,'A person with "Money Avoidance" script tends to:',
   '["Obsessively track every rupee","Underearning, giving money away to feel worthy, and financial self-sabotage","Spend heavily on status symbols","Save aggressively at the expense of relationships"]',
   1,'Money Avoidance stems from believing "money is bad" or "I don''t deserve money." It manifests as unconsciously staying below earning potential, giving money away, or sabotaging financial success.',2),

  (q_id,'The three-step process for rewriting unhelpful money scripts is:',
   '["Save, invest, retire","Earn more, spend less, give more","Awareness → Challenge → Replace","Budget, track, optimise"]',
   2,'First become aware of the script (name it). Then challenge it with evidence ("Is this universally true?"). Finally replace it with a more accurate, helpful belief that serves your adult financial life.',3),

  (q_id,'Which money script is associated with excessive frugality that prevents enjoying life?',
   '["Money Worship","Money Status","Money Avoidance","Money Vigilance"]',
   3,'Money Vigilance ("always save, never spend," "you cannot trust others with money") often comes from families that experienced hardship. It manifests as excessive frugality, financial secrecy, and anxiety about normal risk.',4);
END IF;

-- 26. COUPLES MONEY CONFLICTS
IF l_couples IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_couples) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_couples,'Couples Money Conflicts Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'When a couple fights about one partner spending "too much," the UNDERLYING conflict is usually about:',
   '["The actual amount of money spent","A mismatch in spending values — what each considers worthwhile vs wasteful","Poor financial education","Not having a joint account"]',
   1,'Spending conflicts are rarely about the absolute amount. They reflect different values about what makes life meaningful — experiences vs security, present vs future, autonomy vs shared control.',1),

  (q_id,'The individual discretionary allowance tool works because:',
   '["It forces both partners to spend equally","Each partner gets personal spending money with no questions asked, eliminating most day-to-day financial conflicts","It creates complete financial transparency","It reduces total household spending"]',
   1,'When each partner has personal money with no accountability attached, the vast majority of small spending conflicts disappear. Both partners maintain autonomy within an agreed structure.',2),

  (q_id,'During a productive couple money meeting, you should:',
   '["Make accusations about past financial mistakes","State financial facts without blame, share feelings using ''I'' statements, then solve together","Immediately resolve all disagreements in one session","Avoid discussing investments and focus only on spending"]',
   1,'Productive money meetings separate facts from emotional interpretations, use "I feel" rather than "you always," and focus on collaborative problem-solving rather than blame or past grievances.',3);
END IF;

-- 27. OVERCOMING FINANCIAL TRAUMA
IF l_trauma IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_trauma) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_trauma,'Overcoming Financial Trauma Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'What distinguishes financial trauma from ordinary financial stress?',
   '["Financial trauma only comes from bankruptcy","Financial trauma persists and drives self-sabotaging behaviour long after circumstances improve","Ordinary stress is more severe","Financial trauma only affects people in poverty"]',
   1,'Ordinary financial stress resolves when circumstances improve. Financial trauma persists psychologically — driving avoidance, hypervigilance, or self-sabotage even when current finances are stable.',1),

  (q_id,'The first step in recovering from financial trauma is:',
   '["Immediately investing in the stock market","Taking out a large loan to rebuild financial confidence","Naming and recognising that the money relationship was shaped by specific traumatic events","Hiring a financial advisor immediately"]',
   2,'Awareness is the foundation. Recognising that your financial behaviour patterns are responses to specific past events — not inherent character flaws — begins the process of change.',2),

  (q_id,'Why does gradual exposure to financial tasks help with financial avoidance?',
   '["It builds savings faster","Financial avoidance maintains anxiety. Gradual engagement reduces the fear response over time","It avoids all financial mistakes","It creates automatic saving habits"]',
   1,'Avoidance maintains anxiety because it prevents the experience of successfully handling financial tasks. Gradual engagement — starting with very small steps — proves competence and reduces fear.',3);
END IF;

-- 28. WEALTH IDENTITY
IF l_identity IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_identity) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_identity,'Building a Wealth Identity Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'Why does focusing on behaviour change alone ("spend less, save more") often fail long-term?',
   '["People are lazy","Behaviour that conflicts with your identity requires constant willpower — which is limited and depleted","Financial advice is too complicated","People need external rewards to maintain habits"]',
   1,'Identity drives sustainable behaviour. Forcing behaviour that conflicts with your self-image requires willpower — which depletes. When identity shifts, good financial behaviour becomes natural and effortless.',1),

  (q_id,'Saving ₹500/month consistently for 2 years is MORE identity-changing than saving ₹50,000 once because:',
   '["₹500/month accumulates more total savings","Small regular actions create more evidence of the new identity through consistency","Large one-time savings are tax-inefficient","Monthly savings get better compound returns"]',
   1,'Identity is built from accumulated evidence of consistent behaviour. Each SIP running is a vote for "I am an investor." Hundreds of votes create a strong identity; one vote (even large) does not.',2),

  (q_id,'The "patience paradox" of wealth identity means:',
   '["You must wait until rich to feel financially capable","The feeling of financial competence follows the behaviour of financial competence by 6-18 months — keep acting before you feel it","You must be patient with compound interest","Patience in financial decisions always pays off"]',
   1,'You will feel like an imposter before you feel like an investor. Continue acting like an investor (tracking, saving, investing) for 6-18 months before the identity solidifies. Do not wait to feel ready.',3);
END IF;

-- 29. FINANCIAL ENVIRONMENT DESIGN
IF l_environ IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_environ) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_environ,'Financial Environment Design Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'Why is automating SIPs to debit on salary date the MOST effective personal finance intervention?',
   '["SIPs earn higher returns than manual investments","Money is invested before it can be spent, eliminating the willpower required to save","It creates tax benefits","Banks give lower charges on automated investments"]',
   1,'Pay yourself first. Money invested before you see it in your account cannot be spent impulsively. This removes the daily decision to save — which is subject to emotions and rationalisation.',1),

  (q_id,'The Hawthorne Effect explains why tracking spending reduces impulsive purchases. It states:',
   '["Spending tracked on apps earns cashback","Being observed (even by yourself) changes behaviour — visibility creates accountability","Hawthorne''s law of diminishing returns on spending","Tracking creates tax records automatically"]',
   1,'The Hawthorne Effect: people modify behaviour when they know they are being observed. Knowing your spending will be categorised and reviewed (by yourself) creates internal accountability.',2),

  (q_id,'Which of the following CREATES FRICTION for bad financial behaviour?',
   '["Adding credit card to all saved payment methods","Keeping investment apps on your phone home screen","Keeping all savings in the same account as spending money","Removing saved credit card from online shopping sites"]',
   3,'Removing a saved credit card from online shopping means manually entering card details for impulse purchases — a small friction that causes many people to pause and reconsider.',3),

  (q_id,'A commitment device for savings works because:',
   '["It earns guaranteed returns","Human desire to maintain consistency and avoid embarrassment drives follow-through","It is legally binding","It creates better compound interest"]',
   1,'Telling others your savings goal, joining an investment club, or public commitment leverages the powerful human desire for consistency and social approval — enforcing financial discipline without willpower.',4);
END IF;

-- 30. INTERBANK FOREX MARKET
IF l_interbank IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_interbank) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_interbank,'Interbank Forex Market Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'The global forex market''s daily trading volume is approximately:',
   '["$100 billion","$500 billion","$7.5 trillion","$25 billion (same as NYSE)"]',
   2,'The forex market trades approximately $7.5 trillion per day (2022 BIS survey) — by far the largest financial market in the world. NYSE daily volume is comparatively tiny at ~$25 billion.',1),

  (q_id,'During which session does USD/INR typically show the most significant moves?',
   '["Sydney session (2:30 AM IST)","London-New York overlap (6:30-9:30 PM IST)","Asian session (5:30-11:30 AM IST)","NSE closing session (3-4 PM IST)"]',
   1,'The London-New York overlap sees maximum global liquidity and the highest participation of USD pairs. Major US economic data releases during this period often trigger significant USD/INR moves.',2),

  (q_id,'Why do retail customers pay a 50-100 paise spread on USD/INR while interbank trades at 5-10 paise?',
   '["Retail transactions are smaller and more expensive to process","Banks add their profit margin on top of the interbank spread when dealing with retail customers","RBI mandates wider spreads for retail","Retail requires more regulatory compliance"]',
   1,'Banks quote interbank prices to each other at very tight spreads. When dealing with retail customers, they widen the spread to cover costs and generate profit — this is why airport currency exchange is so expensive.',3);
END IF;

-- 31. FX OPTIONS
IF l_fx_opt IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_fx_opt) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_fx_opt,'FX Options Basics Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'An Indian IT exporter expecting $1 million in 3 months who fears INR strengthening should buy:',
   '["A USD call option (right to buy USD)","A USD put option (right to sell USD at a fixed rate)","A forward contract to buy USD","Nothing — just accept the market rate"]',
   1,'The exporter will receive USD and wants to convert to INR. Fear of INR strengthening means fear of getting fewer rupees. A USD put option protects the floor rate for selling USD.',1),

  (q_id,'FX implied volatility for USD/INR typically SPIKES before:',
   '["Weekend trading","Union Budget announcements, elections, and RBI policy decisions","NIFTY option expiry","Festival holidays"]',
   1,'Uncertainty about major events increases demand for currency options (protection). Higher option demand drives up implied volatility. Post-event clarity causes IV to collapse — "IV crush."',2),

  (q_id,'The forward rate for USD/INR is typically ABOVE the spot rate because:',
   '["INR is expected to strengthen","Indian interest rates are higher than US rates — the interest rate differential is priced into the forward","The forward market is less efficient","SEBI requires a minimum premium on forwards"]',
   1,'Interest rate parity: currencies with higher interest rates trade at a forward discount. Since India''s rates exceed US rates, USD/INR forward > USD/INR spot.',3);
END IF;

-- 32. ALGORITHMIC FOREX
IF l_algo_fx IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_algo_fx) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_algo_fx,'Algorithmic Forex Trading Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'A mean reversion forex algorithm performs BEST in:',
   '["Strong trending markets","Ranging, sideways markets where price oscillates around an average","Volatile news-driven markets","Bear markets only"]',
   1,'Mean reversion strategies assume price will return to its average after deviating. This works well in ranging markets. In strong trends, the "average" keeps moving — mean reversion strategies lose money.',1),

  (q_id,'What is a "walk-forward test" in backtesting?',
   '["Testing the strategy in live markets","Optimising on early data, then testing (without re-optimising) on later out-of-sample data to check real-world performance","Testing on forward price projections","Walking through each trade manually"]',
   1,'Walk-forward testing reveals overfitting. If a strategy optimised on 2018-2021 data fails dramatically on 2022-2024 data, it was fitted to historical noise rather than genuine market patterns.',2),

  (q_id,'Indian residents can legally trade algorithmic forex strategies on:',
   '["MT4/MT5 platforms with offshore forex brokers","NSE/BSE currency derivatives (USD/INR, EUR/INR, GBP/INR, JPY/INR) using SEBI-registered platforms","OTC spot forex through any global broker","Any currency pair on any platform"]',
   1,'Indian residents are legally permitted to trade currency derivatives only on Indian exchanges (NSE/BSE) through SEBI-registered brokers. Offshore forex trading through unregulated platforms violates FEMA.',3);
END IF;

-- 33. EMERGING MARKET CURRENCIES
IF l_em_curr IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_em_curr) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_em_curr,'Emerging Market Currencies Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'In a "risk-off" global environment, EM currencies like INR typically:',
   '["Strengthen as investors seek EM yields","Weaken as capital flows to safe havens like USD and JPY","Stay unchanged — INR is independent of global sentiment","Strengthen because India is a growing economy"]',
   1,'Risk-off means investors flee to safety (USD, JPY, CHF). EM currencies weaken as capital exits regardless of domestic fundamentals — INR is not immune to this global dynamic.',1),

  (q_id,'Turkey''s Lira (TRY) depreciated 90%+ in 10 years primarily because:',
   '["Turkey had very high inflation only","President Erdogan''s unorthodox monetary policy (keeping rates low despite high inflation) destroyed institutional credibility","Turkey was sanctioned by the EU","Turkey had massive trade deficits"]',
   1,'Erdogan''s insistence on keeping interest rates low (contradicting standard monetary economics) while firing central bank governors who disagreed destroyed institutional credibility — a textbook case of political risk destroying a currency.',2),

  (q_id,'What makes INR more stable than many other EM currencies?',
   '["India has no trade deficit","India never received FII flows","RBI''s active management of INR and India''s improving current account","India has the highest interest rates in the world"]',
   2,'RBI actively intervenes using large forex reserves to smooth volatility. India''s improving current account balance has also reduced structural selling pressure on INR compared to peers.',3);
END IF;

-- 34. GEOPOLITICS AND CURRENCIES
IF l_geo IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_geo) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_geo,'Geopolitics and Currencies Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'The Russia-Ukraine war''s MOST significant global forex impact was:',
   '["Strengthening the EUR dramatically","Demonstrating that USD reserves can be weaponised, accelerating central bank reserve diversification","Collapsing the USD","Strengthening all EM currencies"]',
   1,'Freezing Russia''s $630B in Western reserves showed other countries their dollar-denominated reserves could be weaponised. This accelerated de-dollarisation efforts globally and drove record central bank gold purchases.',1),

  (q_id,'Rising oil prices primarily impact INR by:',
   '["Strengthening INR as India is an oil exporter","Weakening INR as India imports ~85% of oil, increasing USD demand for oil payment","No effect — India uses rupee for all oil imports","Strengthening INR as Indian companies benefit"]',
   1,'India imports ~85% of its oil needs and pays in USD. Higher oil prices mean India needs more USD → more INR selling to buy USD → INR weakens.',2),

  (q_id,'Major global geopolitical events (war, sanctions) typically have what INITIAL effect on INR?',
   '["INR always strengthens as a safe haven","No effect — India is geographically isolated","INR typically weakens initially due to risk-off capital outflows from all EM markets","INR effect is impossible to predict"]',
   2,'India participates in global risk-off dynamics. Any major global uncertainty triggers FII selling of Indian assets (stocks and bonds) and capital flight to USD — weakening INR regardless of India''s direct involvement.',3);
END IF;

-- 35. FOREX TRADING PLAN
IF l_fx_plan IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_fx_plan) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_fx_plan,'Forex Trading Plan Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'Why should a forex trader avoid trading within 30 minutes of a major economic release?',
   '["Markets are closed during economic releases","Spreads widen dramatically and price moves are unpredictable — not your systematic edge","Brokers charge higher commissions","Regulations prohibit it"]',
   1,'Economic releases create extreme short-term volatility where technical analysis loses effectiveness. Wide spreads and whipsaw moves turn a valid systematic strategy into a gamble.',1),

  (q_id,'If the daily loss limit of 3% is hit, what should a trader do?',
   '["Double position size to recover losses","Switch to a different currency pair","Stop trading for the entire day","Continue with reduced size"]',
   2,'The daily loss limit exists precisely to prevent revenge trading — the emotional escalation of trying to recover losses by taking more risk. A 3% daily loss means stop, not escalate.',2),

  (q_id,'What is the purpose of the "mental state pre-market checklist"?',
   '["To remind you to check economic calendars","To ensure you are in an optimal psychological state before risking real money — eliminating compromised-state trading","To review yesterday''s profits","To set up automated trading algorithms"]',
   1,'Trading while tired, stressed, or emotionally compromised is one of the most common causes of account blowup. The pre-market checklist creates a systematic gate before entering markets.',3);
END IF;

-- 36. VWAP
IF l_vwap IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_vwap) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_vwap,'VWAP Mastery Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'Why does institutional activity create a "magnetic effect" pulling price toward VWAP?',
   '["VWAP is programmed into all trading algorithms","Institutions buy below VWAP (getting discount vs benchmark) and sell above it (getting premium) — creating consistent support and resistance","SEBI rules require prices to revert to VWAP","VWAP is the official RBI reference rate"]',
   1,'Fund managers are benchmarked against VWAP. Buying below VWAP is outperformance; above is underperformance. This creates consistent institutional buying below and selling above — the magnetic effect.',1),

  (q_id,'Price reaching the +2 standard deviation VWAP band typically signals:',
   '["Strong trend continuation — buy more","Significantly overbought relative to today''s volume-weighted activity — high probability of mean reversion","Institutional accumulation beginning","The start of a new uptrend"]',
   1,'The +2σ band represents two standard deviations above the volume-weighted average — statistically extreme. In normal conditions, prices revert toward the mean (VWAP). Only in very strong trend days does price ride the 1σ band.',2),

  (q_id,'When should you NOT use VWAP as a reference?',
   '["On high-volume days in large-cap stocks","On low-volume stocks, on expiry days, and on large gap-open days","When trading intraday","During the first hour of trading"]',
   1,'VWAP is unreliable on low-volume stocks (insufficient data), distorted by expiry-day option-related flows, and loses context on gap days where VWAP starts far from prior close.',3),

  (q_id,'Anchored VWAP differs from regular daily VWAP because:',
   '["Anchored VWAP uses closing prices only","It calculates VWAP from a specific significant event (earnings, breakout) rather than from the day''s open","Anchored VWAP excludes after-hours trading","It is only available for NIFTY"]',
   1,'Anchored VWAP shows the average price since a specific important event — the average paid by everyone who bought since that event. These become significant S/R levels as participants reference their break-even.',4);
END IF;

-- 37. SMART MONEY CONCEPTS
IF l_smc IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_smc) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_smc,'Smart Money Concepts Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'In SMC, a "Change of Character (ChoCH)" occurs when:',
   '["Volume suddenly increases","In a downtrend, price breaks above the most recent swing high for the first time — potential reversal signal","A new trend begins with a gap","Moving averages cross over"]',
   1,'ChoCH is the first sign a trend may be reversing. In a downtrend, every rally fails below the prior swing high. When price finally breaks above the most recent swing high, character has changed — possible trend reversal beginning.',1),

  (q_id,'What is a "bullish order block" in SMC?',
   '["Any bullish candlestick","The last bearish candle before a significant bullish move — price often returns here before continuing up","A consolidation zone","A candle with very high volume"]',
   1,'SMC theory holds that institutions placed large buy orders in the zone of the last bearish candle before a strong rally. When price returns to this zone, remaining institutional buy orders create support.',2),

  (q_id,'SMC''s "liquidity hunt" concept explains stop hunting because:',
   '["Retail traders have small accounts","Institutions need counterparty orders to fill large positions — they push price to retail stop-loss clusters to access that liquidity","SEBI rules require price to hit all stop losses","Market makers are required to test all levels"]',
   1,'Large institutions cannot fill massive orders at one price without moving the market. They push price to where retail stops cluster — triggering those stops provides the buy/sell flow needed to fill large institutional orders.',3);
END IF;

-- 38. OPTIONS FLOW
IF l_opt_flow IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_opt_flow) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_opt_flow,'Options Flow and Unusual Activity Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'A Put/Call Ratio (PCR) of 1.8 (very high) is typically interpreted as:',
   '["Extremely bullish — everyone is buying calls","A contrarian bullish signal — extreme pessimism often precedes reversals","A sell signal — exit all positions","Neutral — balanced market"]',
   1,'Extreme PCR readings are contrarian. PCR of 1.8 means 80% more puts than calls — extreme pessimism. When everyone is positioned bearishly, the market often reverses upward as the anticipated decline fails to materialise.',1),

  (q_id,'Heavy call open interest at a specific NIFTY strike price typically acts as:',
   '["Strong support — will push price higher","Potential resistance — call sellers defend this level","A guaranteed breakout level","Irrelevant to price action"]',
   1,'Call sellers (who collected premium at that strike) suffer losses if price rises above it. They hedge by selling futures — creating selling pressure near that strike. Heavy OI levels thus often act as resistance.',2),

  (q_id,'Why does most unusual options activity have innocent explanations?',
   '["Options markets are too small for institutional use","Most large trades are hedging, portfolio protection, or systematic strategies — not insider trading","Regulators prevent institutional options trading","Options are too complex for institutions"]',
   1,'The vast majority of large options trades are legitimate hedging (protecting existing equity positions), systematic strategies (volatility selling programmes), or institutional portfolio management — not insider trading.',3);
END IF;

-- 39. MARKET PROFILE
IF l_mkt_profile IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_mkt_profile) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_mkt_profile,'Market Profile Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'The Value Area in market profile represents:',
   '["The highest and lowest prices of the day","The range where approximately 70% of the day''s trading volume occurred","The opening and closing prices","The area above VWAP only"]',
   1,'The Value Area contains approximately 70% of volume — the price range where most participants agreed to transact. It represents "fair value" for that session.',1),

  (q_id,'The Point of Control (POC) is:',
   '["The midpoint between VAH and VAL","The single price level with the highest volume for the day","The opening auction price","The level where price spent the least time"]',
   1,'POC is the high-volume node — the price where most trading activity occurred. It acts as a magnet because it represents where the most participants are positioned and where price gravitates.',2),

  (q_id,'If today''s price opens below yesterday''s Value Area Low (VAL), what does market profile theory suggest?',
   '["Continue selling — this confirms a breakdown","Price should be pulled back into the value area — potential long opportunity targeting VAL and POC","Ignore it — open price is irrelevant","Wait for a new trend to establish"]',
   1,'Opening below VAL suggests price moved to a zone the market previously rejected as "too cheap." Market profile theory predicts mean reversion — price being pulled back into the established value area.',3);
END IF;

-- 40. SEASONALITY
IF l_seasonal IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_seasonal) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_seasonal,'Market Seasonality Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'In Indian markets, what typically happens just before the Union Budget (February 1)?',
   '["Markets are always calm and flat","Elevated volatility as markets often rally on hope then sell on the event","Markets always fall 10% before budget","No consistent seasonal pattern exists around budget"]',
   1,'Pre-budget, markets often rally on expectation of fiscal stimulus or positive measures. Post-budget, "sell the event" is common as uncertainty resolves — direction then depends on actual fiscal policy content.',1),

  (q_id,'Good monsoon progress (June-September) is MOST directly positive for which sector?',
   '["IT services","Banking and financial services","Agri stocks, fertilisers, rural FMCG, and two-wheelers","IT hardware and electronics"]',
   2,'Good monsoon improves agricultural output → rural incomes rise → consumption of rural products (two-wheelers, tractors, fertilisers, FMCG staples) increases. IT and banking benefit indirectly at best.',2),

  (q_id,'Seasonality should be used as:',
   '["The primary reason to enter or exit a trade","A tiebreaker — confirming when trend and fundamentals already suggest a direction","An exact predictor of market direction","A replacement for technical analysis"]',
   1,'Seasonality is a tailwind or headwind, not the engine. Use it to increase conviction when your primary analysis already points in a direction, not as a standalone trading reason.',3);
END IF;

-- 41. GAP ANALYSIS
IF l_gaps IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_gaps) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_gaps,'Gap Analysis Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'A large gap UP on very high volume, breaking out of a long consolidation, is a:',
   '["Common gap — will fill quickly","Breakaway gap — trend continuation, do NOT fade it","Exhaustion gap — sell immediately","Runaway gap — look for reversal"]',
   1,'Breakaway gaps on high volume signal strong institutional conviction. They typically do not fill for weeks or months and represent the start of significant directional moves.',1),

  (q_id,'When is it DANGEROUS to trade the gap fill (buy a gap down hoping it fills)?',
   '["When the gap is larger than 2%","When the gap occurred on bad news — earnings miss, fraud, regulatory action","When NIFTY gapped down too","When the gap occurred on a Monday"]',
   1,'Bad news gaps (earnings miss, scandal, regulatory action) reflect fundamental deterioration — the stock deserves to be lower. Fading these gaps expecting a quick fill often results in catching a falling knife.',2),

  (q_id,'Historically, NIFTY gaps under 0.5% fill (reverse) on the same day approximately:',
   '["20% of the time","40% of the time","70% of the time","100% of the time"]',
   2,'Small gaps on average-volume days without news catalysts are "common gaps" that fill within 1-3 sessions approximately 70% of the time — providing a higher-probability mean reversion setup.',3);
END IF;

-- 42. RISK MANAGEMENT MASTERCLASS
IF l_risk_mgmt IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_risk_mgmt) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_risk_mgmt,'Risk Management Masterclass Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'In the hierarchy of trading success, what is the MOST important component?',
   '["Entry rules — finding the perfect entry","Exit rules — knowing when to take profits","Position sizing and risk management","Chart pattern identification"]',
   2,'Research and practitioner experience consistently show that risk management (how much to bet) matters more than entry or even exits. Good risk management can make a mediocre strategy profitable; poor risk management destroys good strategies.',1),

  (q_id,'If you suffer a 50% loss, what return is needed to return to breakeven?',
   '["50%","75%","100%","25%"]',
   2,'The mathematics of loss: lose 50% of ₹1 lakh = ₹50,000 remaining. To get back to ₹1 lakh, you need to double your money — a 100% return. This asymmetry is why capital preservation is paramount.',2),

  (q_id,'The Full Kelly Criterion says bet 32.5% per trade (for a specific strategy). What do most professional traders actually use?',
   '["Full Kelly — 32.5%","Double Kelly — 65%","Half Kelly or less — 16% or lower","1% only — ignore Kelly entirely"]',
   2,'Full Kelly is mathematically optimal for long-run geometric growth but creates extreme volatility and large drawdowns. Most practitioners use Half Kelly (50% of Kelly) or lower for psychological manageability.',3),

  (q_id,'Maximum correlated exposure means:',
   '["Maximum total portfolio exposure","No more than 3 positions in highly correlated instruments simultaneously","Exposure only in uncorrelated assets","Maximum drawdown allowed"]',
   1,'If all your positions move together (all IT stocks, all banking), one sector event causes simultaneous losses across all. Limiting to 3 correlated positions caps sector-level risk.',4);
END IF;

-- 43. BACKTESTING
IF l_backtest IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_backtest) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_backtest,'Backtesting Strategies Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'What is "survivorship bias" in the context of backtesting on current NIFTY 50 stocks?',
   '["Only testing strategies that have survived previous backtests","Only testing stocks that exist in the CURRENT index — ignoring companies that were in it but failed and were removed","Testing only the best-performing historical period","Using only winning trades in the backtest"]',
   1,'Current NIFTY 50 contains only survivors — companies that grew and maintained size. Backtesting only on these ignores the companies that were removed due to decline or failure, overstating historical strategy performance.',1),

  (q_id,'A profitable backtest result on 2018-2021 data that fails completely on 2022-2024 walk-forward test indicates:',
   '["The strategy is correct but markets changed","Overfitting — the strategy was fitted to historical noise rather than genuine market patterns","The backtest data was incorrect","The walk-forward period was too volatile"]',
   1,'Overfitted strategies look great on in-sample data but fail out-of-sample. This is the most common backtesting trap — adding conditions until historical results look perfect, but they only explain the past.',2),

  (q_id,'A strategy with 40% win rate but 3:1 reward/risk ratio has what expectancy?',
   '["Negative — 40% win rate is too low","Zero — wins and losses cancel out","Positive — wins are 3x larger than losses, so 40% winners beats 60% losers","Cannot be determined without more data"]',
   2,'Expectancy = (0.40 × 3R) - (0.60 × 1R) = 1.2R - 0.6R = +0.6R per trade. Positive expectancy — this is a profitable strategy despite losing 60% of trades.',3),

  (q_id,'How many trades is the MINIMUM recommended before making significant changes to a trading system?',
   '["10 trades","25 trades","100 trades","500 trades"]',
   2,'Small samples produce misleading conclusions. 100 trades is the minimum for statistical significance. With fewer trades, a losing streak looks like system failure and a winning streak looks like genius — both misleading.',4);
END IF;

-- 44. COMPLETE TRADING SYSTEM
IF l_trading_sys IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_trading_sys) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_trading_sys,'Complete Trading System Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'Why does systematic trading typically outperform discretionary trading for most retail traders?',
   '["Systematic traders have access to better data","Systematic rules are followed mechanically, removing emotional decision-making under market pressure","Algorithms trade faster","Systems require less capital"]',
   1,'Discretionary trading requires real-time emotional judgment under pressure — when fear and greed are strongest. Systematic rules are designed calmly and followed mechanically, eliminating emotion from execution.',1),

  (q_id,'In a complete trading system, what should you do while in an active trade?',
   '["Monitor every tick for optimal exit","Check once per session, do not move stop against position, let target or stop be hit","Actively trade around the position","Watch financial news for updates on your holding"]',
   1,'Constant monitoring leads to premature exits and emotional decisions. Checking once per session, having pre-set stops and targets, and letting the system play out removes intraday emotional interference.',2),

  (q_id,'The principle "breadth before depth is a trap" means:',
   '["Do not diversify investments","Master one market completely before adding another — trading multiple markets simultaneously before mastering one leads to mediocrity in all","Trade broad market indices only","Never specialise in one sector"]',
   1,'Adding more markets before mastering the first creates divided attention, inconsistent execution, and superficial understanding of each market''s character. Deep expertise in one market produces better results.',3),

  (q_id,'Quarterly system review should assess:',
   '["Only profit and loss","Whether the edge is still working, what has changed in market conditions, and whether execution errors are recurring","Only entry and exit points","Only position sizing"]',
   1,'Markets evolve. An edge that worked in 2021 bull market may not work in 2022 bear market. Quarterly review checks if the underlying logic still holds, not just recent P&L.',4);
END IF;

-- 45. WEB3 IDENTITY
IF l_web3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_web3) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_web3,'Web3 Identity Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'What is the KEY advantage of a Decentralised Identifier (DID) over a username on a platform like Twitter?',
   '["DIDs are anonymous","You cryptographically control your DID — no company can ban, suspend, or delete it","DIDs earn crypto rewards","DIDs are faster to create"]',
   1,'DIDs are self-sovereign. You generate the key pair; you control the identifier. No platform, government, or company can revoke it — unlike platform usernames that can be banned.',1),

  (q_id,'What makes Soulbound Tokens DIFFERENT from regular NFTs?',
   '["Soulbound Tokens are more expensive","Soulbound Tokens are non-transferable — permanently tied to a specific wallet, making them genuine credentials","Soulbound Tokens are issued by governments only","Soulbound Tokens are stored on Bitcoin"]',
   1,'Non-transferability is the key feature. A transferable credential (diploma NFT you can sell) is meaningless as a credential. A non-transferable SBT proves you actually earned or attended something.',2),

  (q_id,'ENS (.eth names) primarily solves what problem?',
   '["High gas fees on Ethereum","Human-readable addresses — replacing 42-character wallet addresses with names like yourname.eth","Cross-chain interoperability","Reducing Ethereum energy consumption"]',
   1,'ENS maps human-readable .eth names to wallet addresses, simplifying crypto payments and providing a Web3 identity layer — similar to how DNS maps domain names to IP addresses.',3);
END IF;

-- 46. RWA TOKENIZATION
IF l_rwa IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_rwa) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_rwa,'RWA Tokenization Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'Why did tokenized US Treasury bonds grow rapidly in 2023-2024?',
   '["US Treasury rates fell to near zero","US Treasury yields hit 5%+ while DeFi yields compressed — tokenized T-bills offered attractive on-chain yield","US government mandated Treasury tokenization","Tokenized Treasuries were tax-free"]',
   1,'When US rates rose sharply while DeFi native yields fell, tokenized Treasuries offered a compelling proposition: safe, regulated 5%+ yield accessible on-chain without requiring a US brokerage account.',1),

  (q_id,'What is the PRIMARY legal risk of RWA tokenization for Indian investors?',
   '["Token prices can fall","Smart contract bugs only","Whether the token gives legally enforceable rights to the underlying asset — and whether Indian courts would recognise it","Currency conversion costs"]',
   2,'The smart contract says you own the asset. But does Indian law recognise this? If the custodian fails or frauds, will Indian courts uphold your token as a valid property claim? This legal enforceability gap is the core risk.',2),

  (q_id,'PAXG token represents:',
   '["1% ownership in a gold mining company","1 troy ounce of physical gold stored in Brinks vaults — redeemable for delivery","A promise to deliver gold in 1 year","Gold price exposure without physical gold backing"]',
   1,'PAXG (Paxos Gold) is a fully-backed gold token. Each PAXG = 1 troy oz of allocated physical gold in Brinks vaults. Unlike synthetic exposure, it is redeemable for physical delivery.',3);
END IF;

-- 47. GLOBAL CRYPTO REGULATIONS
IF l_crypto_reg IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_crypto_reg) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_crypto_reg,'Global Crypto Regulations Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'The EU''s MiCA framework is significant because:',
   '["It bans all crypto trading in Europe","It is the world''s most comprehensive crypto regulatory framework — licensing exchanges, setting stablecoin rules, and applying market manipulation laws to crypto","It only applies to Bitcoin and Ethereum","It reduces taxes on crypto gains in Europe"]',
   1,'MiCA provides a comprehensive, harmonised framework across all EU countries — licensing VASPs, setting strict stablecoin reserve requirements, and applying securities law-equivalent protections to crypto markets.',1),

  (q_id,'Under India''s crypto tax rules, can a loss from Bitcoin be offset against a gain from Ethereum?',
   '["Yes — all crypto losses offset all crypto gains","No — losses from one Virtual Digital Asset cannot offset gains from another under current rules","Yes, but only within the same financial year","Only for professional traders with audit"]',
   1,'India''s VDA tax rules (Budget 2022) explicitly prohibit offsetting losses from one VDA against gains from another. Each token is taxed separately at 30% on any gain.',2),

  (q_id,'FATF''s Travel Rule requires crypto exchanges to:',
   '["Travel to verify customer identity in person","Collect and transmit sender/recipient information for transactions above $1,000","Freeze all accounts from high-risk countries","Report all crypto transactions to government"]',
   1,'The Travel Rule for crypto (mirroring bank wire transfer requirements) mandates VASPs share sender and recipient information for transactions above $1,000 — enabling AML tracing across exchanges.',3),

  (q_id,'Why were 9 offshore crypto exchanges including Binance blocked by India''s FIU in 2023?',
   '["They refused to pay Indian taxes","They operated in India without FIU registration — violating India''s AML compliance requirements","They offered leverage trading","They were not compliant with SEBI rules"]',
   2,'India requires all crypto exchanges serving Indian users to register with the Financial Intelligence Unit (FIU) for AML compliance. Operating without registration is illegal — leading to blocking.',4);
END IF;

-- 48. DEFI RISK MANAGEMENT
IF l_defi_risk IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_defi_risk) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_defi_risk,'DeFi Risk Management Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'A DeFi protocol offering 150% APY funded by its own governance token emissions is MOST LIKELY:',
   '["A sustainable yield from real economic activity","Unsustainable — yield funded by token inflation creates selling pressure, eventually collapsing returns","Guaranteed by the protocol''s insurance fund","Equivalent to a bank FD at that rate"]',
   1,'High yields funded by token emissions are temporary and self-defeating: emissions create selling pressure on the token, reducing its value (and thus the yield) over time. Genuine yield comes from real activity (fees, interest).',1),

  (q_id,'The Terra/Luna collapse demonstrated the PRIMARY risk of:',
   '["Centralised stablecoins","Algorithmic stablecoins with no real collateral backing","Bitcoin''s volatility","Ethereum gas fees"]',
   1,'UST maintained its peg via algorithm and LUNA minting — no real collateral. When confidence broke, the mint/burn mechanism entered a death spiral. $40B+ destroyed in days — the definitive algorithmic stablecoin failure.',2),

  (q_id,'Which DeFi safety factor is a REQUIRED first check before depositing funds?',
   '["The project''s Twitter follower count","Number of team members","Whether the smart contract has been audited by a reputable firm (Trail of Bits, Certik, OpenZeppelin)","The project''s token price history"]',
   2,'Smart contract audits are the minimum safety requirement. Unaudited code can contain bugs exploited immediately after launch. Even audited code can have issues, but unaudited code is irresponsible to use.',3),

  (q_id,'What is a "rug pull" in DeFi?',
   '["A sudden price decline due to market conditions","Developers drain the protocol funds using retained admin keys, then disappear","A smart contract upgrade that benefits users","A coordinated short-selling attack"]',
   1,'Rug pulls occur when developers retain the ability to withdraw user funds (through admin keys, upgradeability, or direct contract access) and exploit this after attracting sufficient liquidity.',4);
END IF;

-- 49. ON-CHAIN ANALYTICS
IF l_onchain IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_onchain) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_onchain,'On-Chain Analytics Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'Bitcoin exchange inflows consistently increasing typically signals:',
   '["Long-term accumulation by strong hands","Potential selling pressure — holders moving Bitcoin TO exchanges to sell","Institutional buying","Mining activity increasing"]',
   1,'Moving Bitcoin to an exchange is typically preparation for selling. Sustained high exchange inflows while price is near highs is a warning sign — supply coming to market.',1),

  (q_id,'MVRV ratio below 1 historically indicates:',
   '["Bitcoin is overvalued","Bitcoin is fairly valued","Extreme undervaluation — aggregate holders are at a loss, often marking cycle bottoms","High exchange activity"]',
   2,'MVRV < 1 means total market value is below the realised value (aggregate cost basis). Aggregate investors are at a loss — extreme capitulation. Historically, this has marked major cycle bottoms.',2),

  (q_id,'SOPR (Spent Output Profit Ratio) consistently below 1 followed by a bounce above 1 signals:',
   '["Continued bear market","Capitulation may be complete — weak hands sold at losses, potential bottom","More selling to come","Bullish momentum"]',
   1,'SOPR < 1 means coins are being sold at a loss — weak hands capitulating. When this subsides and SOPR returns above 1 (coins sold in profit again), it suggests the market has absorbed the selling and potentially found a bottom.',3),

  (q_id,'Rapidly growing stablecoin supply on-chain indicates:',
   '["Declining interest in crypto","New money entering the ecosystem (fiat → stablecoins to deploy in crypto) — generally bullish","Investors fleeing crypto for safety","Stablecoin depegging risk"]',
   1,'When stablecoin supply grows (USDT/USDC minted), it represents fresh capital entering the ecosystem and sitting ready to buy. This "dry powder" is generally a bullish signal for crypto markets.',4);
END IF;

-- 50. ZERO-KNOWLEDGE PROOFS
IF l_zkp IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=l_zkp) THEN
  INSERT INTO quizzes (lesson_id,title,passing_score)
  VALUES (l_zkp,'Zero-Knowledge Proofs Quiz',70)
  RETURNING id INTO q_id;

  INSERT INTO quiz_questions (quiz_id,question_text,options,correct_index,explanation,order_index) VALUES
  (q_id,'A zero-knowledge proof allows you to:',
   '["Prove you know something without revealing what you know","Make anonymous transactions on any blockchain","Create tokens without smart contracts","Store data privately on-chain"]',
   0,'ZKP is fundamentally about proving knowledge of a fact without revealing the fact itself. Example: prove you are over 18 without revealing your exact birth date or any personal data.',1),

  (q_id,'How do ZK-Rollups increase Ethereum''s throughput?',
   '["By replacing Ethereum''s validators with faster ones","By processing transactions off-chain in batches and submitting a single validity proof to Ethereum — which verifies the proof, not every individual transaction","By sharding the Ethereum blockchain","By reducing transaction size"]',
   1,'The key insight: Ethereum verifies one small proof (cheap) rather than thousands of individual transactions (expensive). The validity proof mathematically guarantees all batched transactions were valid.',2),

  (q_id,'What is the KEY advantage of ZK-STARKs over ZK-SNARKs?',
   '["STARKs produce smaller proofs","STARKs are faster to verify","STARKs require no trusted setup — more decentralised, and are quantum-resistant","STARKs cost less in gas fees"]',
   2,'SNARKs require a "trusted setup" ceremony (a potential centralisation concern — if setup is compromised, fake proofs could be created). STARKs are transparent (no trusted setup) and quantum-resistant.',3),

  (q_id,'A practical ZKP application for India''s Aadhaar system could be:',
   '["Replace Aadhaar with blockchain IDs entirely","Prove you are KYC-compliant or a resident without revealing your Aadhaar number, name, or address to the service provider","Store Aadhaar data on the blockchain publicly","Eliminate KYC requirements entirely"]',
   1,'ZKP enables selective disclosure — prove specific facts ("this person is KYC-compliant") without revealing underlying data (Aadhaar number, DOB, address). NPCI and Aadhaar have explored this for privacy-preserving verification.',3);
END IF;

  -- Final count check
  SELECT COUNT(*) INTO v_q   FROM quizzes;
  SELECT COUNT(*) INTO v_qqs FROM quiz_questions;
  RAISE NOTICE 'Phase 3 Quizzes complete! Total quizzes: % | Total questions: %', v_q, v_qqs;

END $PHASE3_QUIZZES$;
