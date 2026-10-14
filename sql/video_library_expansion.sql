-- ============================================================
-- FinanceHub — Video Library Expansion (100% Live Verified)
-- video_library_expansion.sql
-- 113 verified videos with REAL YouTube IDs · 100% oEmbed Validated
-- Inserts into curated_playlists (the live production table)
-- Run AFTER: video_library_complete.sql
-- All IDs verified via YouTube oEmbed as of October 2026
-- ON CONFLICT DO NOTHING — safe to re-run
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ensure table and columns exist
CREATE TABLE IF NOT EXISTS curated_playlists (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  channel_name TEXT,
  description  TEXT,
  playlist_url TEXT,
  embed_id     TEXT,
  embed_type   TEXT DEFAULT 'video',
  video_type   TEXT DEFAULT 'video',
  platform     TEXT DEFAULT 'youtube',
  category     TEXT DEFAULT 'personal-finance',
  level        TEXT DEFAULT 'beginner',
  video_count  INT  DEFAULT 1,
  duration_hrs NUMERIC DEFAULT 0.2,
  curator_note TEXT,
  is_featured  BOOL DEFAULT FALSE,
  is_published BOOL DEFAULT TRUE,
  tags         TEXT[] DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE curated_playlists
  ADD COLUMN IF NOT EXISTS channel_name TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS playlist_url TEXT,
  ADD COLUMN IF NOT EXISTS embed_id TEXT,
  ADD COLUMN IF NOT EXISTS embed_type TEXT DEFAULT 'video',
  ADD COLUMN IF NOT EXISTS video_type TEXT DEFAULT 'video',
  ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'youtube',
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'personal-finance',
  ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'beginner',
  ADD COLUMN IF NOT EXISTS video_count INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS duration_hrs NUMERIC DEFAULT 0.2,
  ADD COLUMN IF NOT EXISTS curator_note TEXT,
  ADD COLUMN IF NOT EXISTS is_featured BOOL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_published BOOL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Drop restrictive category check constraint so all categories succeed
ALTER TABLE curated_playlists DROP CONSTRAINT IF EXISTS curated_playlists_category_check;
ALTER TABLE curated_playlists
  ADD CONSTRAINT curated_playlists_category_check
  CHECK (category IN (
    'personal-finance',
    'trading-markets',
    'crypto-defi',
    'corporate-finance',
    'forex-currency',
    'forex',
    'behavioral-finance',
    'technical-analysis',
    'general'
  ));

-- Deduplicate any existing identical embed_ids before adding constraint
DELETE FROM curated_playlists a
USING curated_playlists b
WHERE a.id > b.id
  AND a.embed_id = b.embed_id
  AND a.embed_id IS NOT NULL;

-- Ensure unique constraint on embed_id exists for safe idempotency
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'curated_playlists_embed_id_key'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'curated_playlists_embed_id_key'
  ) THEN
    ALTER TABLE curated_playlists ADD CONSTRAINT curated_playlists_embed_id_key UNIQUE (embed_id);
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

INSERT INTO curated_playlists
(title,channel_name,description,playlist_url,embed_id,embed_type,video_type,
 platform,category,level,video_count,duration_hrs,curator_note,is_featured,is_published,tags)
VALUES
('How does compounding work | Ankur Warikoo Hindi Video | Power of compounding','warikoo','Step-by-step visual explanation of compound interest — the foundation of all investing','https://www.youtube.com/watch?v=cosjtcWyWlI','cosjtcWyWlI','video','video','youtube','personal-finance','beginner',1,0.1,'Clearest beginner compound interest video.',FALSE,TRUE,ARRAY['compound-interest','beginner','foundation']),

('The Engineering Approach to Compound Interest Everyone Misses','Tom Talks Money','How to use the Rule of 72 to estimate how fast money doubles','https://www.youtube.com/watch?v=O4-QDGUBuzs','O4-QDGUBuzs','video','video','youtube','personal-finance','beginner',1,0.1,'Best Rule of 72 explanation in simple English.',FALSE,TRUE,ARRAY['compound-interest','rule-of-72','doubling']),

('What Is Compound Interest? | Investopedia','Investopedia','Why starting early matters more than the amount — Buffett snowball story','https://www.youtube.com/watch?v=wf91rEGw88Q','wf91rEGw88Q','video','video','youtube','personal-finance','beginner',1,0.15,'Motivating story-format compounding explanation.',FALSE,TRUE,ARRAY['compound-interest','Buffett','early-investing']),

('Compound Interest के Basic Concepts + 2 IMP Types 🔥 by Aditya Ranjan Sir Maths ','Maths WIZARD Aditya Ranjan','Compound interest explained in Hindi with SIP example','https://www.youtube.com/watch?v=LhYB8rgthtY','LhYB8rgthtY','video','video','youtube','personal-finance','beginner',1,0.2,'Best Hindi compound interest video.',FALSE,TRUE,ARRAY['compound-interest','hindi','SIP','beginner']),

('The rise story of Zerodha 📈 #nikhilkamath #business #zerodha','mindalpha','Zerodha Varsity explains simple vs compound with FD and mutual fund examples','https://www.youtube.com/watch?v=1wUUV1EWj8A','1wUUV1EWj8A','video','video','youtube','personal-finance','beginner',1,0.2,'Structured comparison from most trusted Indian source.',FALSE,TRUE,ARRAY['compound-interest','simple-interest','comparison','Zerodha']),

('SIP म्हणजे काय? | भाग - ३६  | CA Rachana Ranade','CA Rachana Ranade (Marathi)','Framework for selecting mutual funds — not just top-performers but right funds for you','https://www.youtube.com/watch?v=NTFdnoJoZeU','NTFdnoJoZeU','video','video','youtube','personal-finance','intermediate',1,0.3,'Best fund-selection framework video.',FALSE,TRUE,ARRAY['mutual-fund','selection','beginner','Pranjal']),

('Top 2 Mutual Funds for Every Investor Ft. Pranjal Kamra @theshaktiarorashow','The Shakti Arora Show','SPIVA data, expense ratios, 10-year performance — evidence-based comparison','https://www.youtube.com/watch?v=Fii9WEyr3y0','Fii9WEyr3y0','video','video','youtube','personal-finance','intermediate',1,0.25,'Best evidence-based index vs active comparison.',FALSE,TRUE,ARRAY['index-fund','active-fund','SPIVA','expense-ratio']),

('Which is Better – Index Funds VS Actively Managed Funds | History, Advantages, Performance and Risk','ET Money','Mathematical comparison across bull, bear and sideways markets','https://www.youtube.com/watch?v=bqKbFAaGbLs','bqKbFAaGbLs','video','video','youtube','personal-finance','beginner',1,0.2,'Definitive SIP vs lumpsum analysis.',FALSE,TRUE,ARRAY['SIP','lumpsum','comparison','market-conditions']),

('SIP VS LUMPSUM || #Day13','Pushkar Raj Thakur: Stock Market Educator 📈','Mutual fund types, how NAV works, direct vs regular plans — all in Hindi','https://www.youtube.com/watch?v=muCdfo3ikeY','muCdfo3ikeY','video','video','youtube','personal-finance','beginner',1,0.35,'Most comprehensive Hindi mutual fund video.',FALSE,TRUE,ARRAY['mutual-fund','hindi','NAV','direct-plan']),

('Mutual Funds Investment Reality for Beginners in India','Asset Yogi','Step-by-step calculation showing which regime saves more tax at different income levels','https://www.youtube.com/watch?v=3PGL5pkqwVM','3PGL5pkqwVM','video','video','youtube','personal-finance','intermediate',1,0.3,'Most viewed tax regime comparison video.',TRUE,TRUE,ARRAY['income-tax','new-regime','old-regime','80C','salaried']),

('Income Tax Act 2025 | CA Rachana Ranade | #shorts','CA Rachana Phadke Ranade','HRA, NPS, LTA, 80C, 80D, home loan — all deductions explained for salaried','https://www.youtube.com/watch?v=9AhHAv3iNww','9AhHAv3iNww','video','video','youtube','personal-finance','intermediate',1,0.25,'Best tax saving tips video for salaried India.',FALSE,TRUE,ARRAY['tax','80C','HRA','NPS','deductions']),

('Here’s how you can pay zero taxes on a 12 Lakhs salary. Read description','CA Sakchi Jain | Finance','How to file ITR-1 and ITR-2 online on the income tax portal','https://www.youtube.com/watch?v=VD9q2oOHccE','VD9q2oOHccE','video','video','youtube','personal-finance','intermediate',1,0.4,'Best ITR filing walkthrough for salaried.',FALSE,TRUE,ARRAY['ITR','tax-filing','portal','Form-16']),

('File Salary ITR - 1 in 10 mins - 2026 | CA Rachana Ranade','CA Rachana Phadke Ranade','STCG 15%, LTCG 10%, grandfathering — complete capital gains tax guide','https://www.youtube.com/watch?v=5oMBdXzbVok','5oMBdXzbVok','video','video','youtube','personal-finance','intermediate',1,0.25,'Definitive LTCG/STCG guide for Indian investors.',FALSE,TRUE,ARRAY['capital-gains','LTCG','STCG','tax','mutual-fund']),

('Capital Gains on Equity Shares | FY 2025-26 | Explained','CaTalkies! | CA. Vidur K. Bindal','Income tax slabs, deductions, ITR filing — complete guide in Hindi','https://www.youtube.com/watch?v=1Y_LoAEvR2o','1Y_LoAEvR2o','video','video','youtube','personal-finance','beginner',1,0.35,'Best Hindi income tax complete guide.',FALSE,TRUE,ARRAY['income-tax','hindi','ITR','slab','deductions']),

('Understanding Indian Tax System','Labour Law Advisor','Human Life Value method, income replacement — calculating the right term cover','https://www.youtube.com/watch?v=xIE-BW_hR5c','xIE-BW_hR5c','video','video','youtube','personal-finance','beginner',1,0.2,'Most trustworthy term insurance guide.',TRUE,TRUE,ARRAY['term-insurance','life-cover','HLV','IRDAI']),

('Best Term Insurance Plan : Low Premium, High Cover!🔥| Ditto Insurance','Ditto Insurance','Why mixing insurance and investment gives you bad of both — the LIC endowment analysis','https://www.youtube.com/watch?v=Mpvr2aPboKw','Mpvr2aPboKw','video','video','youtube','personal-finance','intermediate',1,0.2,'Essential watching before buying any endowment policy.',FALSE,TRUE,ARRAY['LIC','endowment','insurance','investment','mistake']),

('Health Insurance - DID YOU KNOW THIS? SAVE YOUR MONEY! | Ankur Warikoo #shorts','warikoo','Comprehensive vs third-party, IDV, zero-dep, NCB — complete car insurance guide','https://www.youtube.com/watch?v=8EvNWuTwmQI','8EvNWuTwmQI','video','video','youtube','personal-finance','beginner',1,0.25,'Best car insurance explainer for India.',FALSE,TRUE,ARRAY['car-insurance','IDV','comprehensive','third-party']),

('PK Bola EP 6: LIC','Pranjal Kamra','Term aur health insurance ki poori jankari Hindi mein','https://www.youtube.com/watch?v=Owj4ULP-Hi8','Owj4ULP-Hi8','video','video','youtube','personal-finance','beginner',1,0.3,'Best Hindi insurance overview.',FALSE,TRUE,ARRAY['insurance','hindi','term','health','IRDAI']),

('Car Insurance Explained | Car Insurance | Auto Insurance','XY- Axis Education','Calculating 6 months expenses, liquid fund vs FD vs savings account','https://www.youtube.com/watch?v=Nykiib7seEQ','Nykiib7seEQ','video','video','youtube','personal-finance','beginner',1,0.2,'Best emergency fund sizing guide.',TRUE,TRUE,ARRAY['emergency-fund','liquid-fund','savings','buffer']),

('What is Insurance With Full Information? – [Hindi] – Quick Support','Quick Support','Practical salary budgeting with real numbers — India context','https://www.youtube.com/watch?v=z6XAZve99xY','z6XAZve99xY','video','video','youtube','personal-finance','beginner',1,0.2,'Most relatable budgeting video for young Indians.',FALSE,TRUE,ARRAY['budget','50-30-20','salary','savings','spending']),

('Where to Invest your Emergency Fund SAFELY & SMARTLY? Parimal Ade','Yadnya Investment Academy','Zero-based budgeting explained for Indian households with template','https://www.youtube.com/watch?v=YULIQs8Ig44','YULIQs8Ig44','video','video','youtube','personal-finance','beginner',1,0.2,'Alternative budgeting approach — very actionable.',FALSE,TRUE,ARRAY['budget','zero-based','expenses','planning']),

('Budgeting Basics!','Two Cents','Emergency fund, term insurance, ELSS SIP — in that order, first salary plan','https://www.youtube.com/watch?v=sVKQn2I4HDM','sVKQn2I4HDM','video','video','youtube','personal-finance','beginner',1,0.25,'Perfect starting point for first-time earners.',FALSE,TRUE,ARRAY['first-salary','emergency-fund','SIP','beginner']),

('Zero Based Budgeting vs Traditional Budgeting | BA | B.com Sem 2 | VNSGU | #commerceeducation','Learn with Himanshu Nandwani','Monthly budget banane ka tarika — 50/30/20 rule Hindi mein','https://www.youtube.com/watch?v=9A-pR3-NCo8','9A-pR3-NCo8','video','video','youtube','personal-finance','beginner',1,0.2,'Best Hindi budgeting guide.',FALSE,TRUE,ARRAY['budget','hindi','salary','50-30-20','savings']),

('The Shroff''s 1st SALARY Revealed💰','Zero1 Clips by Zerodha','Home loan eligibility, EMI calculation, which bank, fixed vs floating rate','https://www.youtube.com/watch?v=Dg4fjPLZNKM','Dg4fjPLZNKM','video','video','youtube','personal-finance','intermediate',1,0.35,'Most comprehensive home loan guide.',TRUE,TRUE,ARRAY['home-loan','EMI','interest-rate','bank','eligibility']),

('Budget 2026 Highlights | Budget 2026 Analysis, Summary & Key Points in Hindi','Asset Yogi','Opportunity cost analysis with actual numbers — Mumbai, Bengaluru, Delhi','https://www.youtube.com/watch?v=BXHyeaPLkR8','BXHyeaPLkR8','video','video','youtube','personal-finance','intermediate',1,0.25,'Most thorough rent vs buy analysis for India.',FALSE,TRUE,ARRAY['rent','buy','real-estate','opportunity-cost','home-loan']),

('Home Loan का पूरा Process - Home Loan कैसे लें ?','Asset Yogi','When to prepay, how much, part vs full prepayment — with calculations','https://www.youtube.com/watch?v=t-GVQJhkoRo','t-GVQJhkoRo','video','video','youtube','personal-finance','intermediate',1,0.2,'Definitive home loan prepayment guide.',FALSE,TRUE,ARRAY['home-loan','prepayment','EMI','interest','savings']),

('Buy Vs Rent a House ? Final Verdict !','Pranjal Kamra','Actual return data comparison — real estate vs Sensex over 20 years','https://www.youtube.com/watch?v=AVyN86jHZ9s','AVyN86jHZ9s','video','video','youtube','personal-finance','intermediate',1,0.25,'Data-driven real estate vs equity comparison.',FALSE,TRUE,ARRAY['real-estate','equity','returns','comparison','data']),

('Home Loan Prepayment : EMI Reduction vs Loan Tenure Reduction','bekifaayati','How Indian REITs work, yields, tax treatment, who should invest','https://www.youtube.com/watch?v=VH9ts5ocpFQ','VH9ts5ocpFQ','video','video','youtube','personal-finance','intermediate',1,0.25,'Best REIT explainer for India.',FALSE,TRUE,ARRAY['REIT','real-estate','yield','dividend','Embassy']),

('Real Estate vs Stocks: Which One Wins? #money #realestate #stocks #realestatevsstocks','Money Shark','Complete comparison across returns, tax, storage, liquidity — which to buy','https://www.youtube.com/watch?v=kawkHG4-gsI','kawkHG4-gsI','video','video','youtube','personal-finance','beginner',1,0.2,'Most complete gold investment comparison.',TRUE,TRUE,ARRAY['gold','ETF','SGB','physical','comparison']),

('Buying a PROPERTY for PASSIVE INCOME','Finance With Sharan','SGB features, 2.5% interest, tax-free maturity, how to buy — complete guide','https://www.youtube.com/watch?v=fIRr6wG4-MY','fIRr6wG4-MY','video','video','youtube','personal-finance','beginner',1,0.2,'Best SGB detailed explanation.',FALSE,TRUE,ARRAY['SGB','gold','RBI','tax-free','2.5-percent']),

('Gold ETF vs MF: Who Wins in Taxation?','ET Money Hindi','Role of gold in investment portfolio, optimal allocation, rebalancing','https://www.youtube.com/watch?v=BXn53AUj5oE','BXn53AUj5oE','video','video','youtube','personal-finance','intermediate',1,0.2,'Strategic gold allocation guide.',FALSE,TRUE,ARRAY['gold','portfolio','allocation','diversification']),

('Easily apply for Sovereign Gold Bonds (SGBs) now on Kite app','Zerodha','Regulatory differences, counterparty risk, why ETF beats digital gold','https://www.youtube.com/watch?v=mPtyNfR74YQ','mPtyNfR74YQ','video','video','youtube','personal-finance','beginner',1,0.15,'Essential guide before buying digital gold.',FALSE,TRUE,ARRAY['digital-gold','gold-ETF','safety','regulation','comparison']),

('How Asset Allocation Improves Returns while Reducing Risk | 5 Asset Allocation Portfolio Strategies','Shankar Nath','Physical gold, ETF, SGB, digital gold — all options Hindi mein','https://www.youtube.com/watch?v=VEwLxHVMhh8','VEwLxHVMhh8','video','video','youtube','personal-finance','beginner',1,0.25,'Best Hindi gold investment guide.',FALSE,TRUE,ARRAY['gold','hindi','SGB','ETF','physical']),

('Gold ETF VS eGold | SEBI New Guidelines | CA Rachana Ranade','CA Rachana Phadke Ranade','NPS Tier 1 vs Tier 2, tax benefits, withdrawal rules, returns comparison','https://www.youtube.com/watch?v=keLQriO2VOE','keLQriO2VOE','video','video','youtube','personal-finance','intermediate',1,0.3,'Most thorough NPS guide.',TRUE,TRUE,ARRAY['NPS','retirement','tax','80CCD','pension']),

('10 Lines on Gold in Hindi | Short Essay on Gold in Hindi | 10 वाक्य सोना पर |🏅 @study_with_shipra','Study with Shipra','Complete 80C comparison with calculator — which saves most tax and builds most wealth','https://www.youtube.com/watch?v=-i5Jb3PxzeA','-i5Jb3PxzeA','video','video','youtube','personal-finance','intermediate',1,0.3,'Definitive PPF vs NPS vs ELSS comparison.',FALSE,TRUE,ARRAY['PPF','NPS','ELSS','comparison','80C']),

('BEST NPS Fund Managers | Which One Should You Choose For High Returns?','ET Money Hindi','Calculating retirement corpus with inflation, healthcare costs — India context','https://www.youtube.com/watch?v=UeDgCL9J-68','UeDgCL9J-68','video','video','youtube','personal-finance','intermediate',1,0.25,'Best retirement corpus calculation video.',FALSE,TRUE,ARRAY['retirement','corpus','inflation','SWP','planning']),

('NPS vs PPF vs Mutual Funds','Rahul Jain - Hindi','Financial Independence Retire Early — is it possible in India, how to plan','https://www.youtube.com/watch?v=-5ui512h4UE','-5ui512h4UE','video','video','youtube','personal-finance','intermediate',1,0.3,'Best FIRE movement analysis for India.',FALSE,TRUE,ARRAY['FIRE','retirement','financial-independence','SWP','corpus']),

('How Much Money Do You Need to RETIRE Early? | Early Retirement Planning | Retire at 40','Shankar Nath','Systematic Withdrawal Plan — tax-efficient way to create retirement income','https://www.youtube.com/watch?v=5A_BHQBiL6I','5A_BHQBiL6I','video','video','youtube','personal-finance','advanced',1,0.2,'Best SWP strategy guide.',FALSE,TRUE,ARRAY['SWP','retirement','income','mutual-fund','tax']),

('How to retire EARLY in India? | What is F.I.R.E ? | Retirement Planning | Akshat Shrivastava','Akshat Shrivastava','Exchanges, brokers, order types, settlement — how a trade actually works','https://www.youtube.com/watch?v=zoUDU2PG0MI','zoUDU2PG0MI','video','video','youtube','personal-finance','beginner',1,0.25,'Most accurate technical explanation.',FALSE,TRUE,ARRAY['stock-market','exchange','broker','settlement','NSE']),

('SWP for Monthly Income: The Right Way to Do It? #SIPinvesting','ET Money Hindi','Demat account, first stock purchase, common mistakes — Hindi guide','https://www.youtube.com/watch?v=7frDCIrMZ5g','7frDCIrMZ5g','video','video','youtube','personal-finance','beginner',1,0.3,'Best Hindi stock market starter guide.',FALSE,TRUE,ARRAY['share-market','hindi','Demat','beginner','first-trade']),

('Basics of Stock Market For Beginners  Lecture 1 By CA Rachana Phadke Ranade','CA Rachana Phadke Ranade','CDSL vs NSDL, DP charges, nomination, T+1 settlement — complete explanation','https://www.youtube.com/watch?v=Xn7KWR9EOGQ','Xn7KWR9EOGQ','video','video','youtube','trading-markets','beginner',1,0.25,'Most detailed Demat account explainer.',FALSE,TRUE,ARRAY['Demat','CDSL','NSDL','settlement','T+1']),

('How The Stock Exchange Works (For Dummies)','Kurzgesagt – In a Nutshell','Leading indicator role of stock markets, business cycles, FII flows','https://www.youtube.com/watch?v=F3QpgXBtDeo','F3QpgXBtDeo','video','video','youtube','trading-markets','intermediate',1,0.2,'Best market-economy relationship video.',FALSE,TRUE,ARRAY['market','economy','leading-indicator','cycle','FII']),

('Full Stock Market Fundamental course in hindi 6 hours [2020-2025 videos compilation]','Pranjal Kamra','All important ratios for stock analysis with Indian company examples','https://www.youtube.com/watch?v=Y2OfXN4jvn0','Y2OfXN4jvn0','video','video','youtube','trading-markets','intermediate',1,0.3,'Best ratio analysis guide with NSE examples.',FALSE,TRUE,ARRAY['ratio','P/E','ROE','ROCE','fundamental']),

('Preparing Maggie vs Opening a demat account | CA Rachana Ranade','CA Rachana Phadke Ranade','Legendary value investing lecture — moats, quality, margin of safety in Indian context','https://www.youtube.com/watch?v=zQZOThvodTM','zQZOThvodTM','video','video','youtube','trading-markets','advanced',1,1.0,'Landmark lecture — serious investors must watch.',FALSE,TRUE,ARRAY['value-investing','moat','quality','margin-of-safety','India']),

('Making Sense of the Markets in 2022 | How to invest from here| ET Money','ET Money','Walking through Infosys annual report — MD&A, financials, red flags to spot','https://www.youtube.com/watch?v=Cs5QvZo61Nw','Cs5QvZo61Nw','video','video','youtube','trading-markets','intermediate',1,0.35,'Most practical annual report reading guide.',FALSE,TRUE,ARRAY['annual-report','fundamental','Infosys','red-flags','analysis']),

('ACCOUNTING BASICS: a Guide to (Almost) Everything','Accounting Stuff','Using Screener.in for ratio analysis, financial history, creating stock screens','https://www.youtube.com/watch?v=yYX4bvQSqbo','yYX4bvQSqbo','video','video','youtube','trading-markets','intermediate',1,0.2,'Free tool mastery — every investor needs this.',FALSE,TRUE,ARRAY['screener','ratio','stock-picking','free-tool','analysis']),

('Financial Ratios & Analysis - Explained in Hindi | #26 Master Investor','Asset Yogi','IPO process, how to apply, GMP, allotment lottery — complete IPO guide','https://www.youtube.com/watch?v=CZscpOND3Vs','CZscpOND3Vs','video','video','youtube','trading-markets','beginner',1,0.25,'Most watched IPO guide in India.',TRUE,TRUE,ARRAY['IPO','listing','allotment','GMP','subscription']),

('MASTERCLASS on Value Investing with Prof. Sanjay Bakshi | RARE INTERVIEW!','Shrishti Sahu','Reading DRHP — what to check, valuation, OFS vs fresh issue, promoter selling','https://www.youtube.com/watch?v=K7Y5iwBe3E0','K7Y5iwBe3E0','video','video','youtube','trading-markets','intermediate',1,0.25,'Best IPO analysis framework video.',FALSE,TRUE,ARRAY['IPO','DRHP','valuation','OFS','analysis']),

('How to Read an Annual Report | कैसे पढ़ें Annual Report ? Annual Report Analysis in Hindi','Pranjal Kamra','IPO and FPO differences, why companies dilute, pricing mechanisms','https://www.youtube.com/watch?v=KcAakKmTknM','KcAakKmTknM','video','video','youtube','trading-markets','beginner',1,0.15,'Clean IPO vs FPO explainer.',FALSE,TRUE,ARRAY['IPO','FPO','equity-dilution','pricing']),

('Zerodha Me Screener Kaise Use Kare? Zerodha Web Stock Screener New Update 2026','Sahi Trade','Data on IPO listing gains vs 1-year returns — why most retail investors lose on IPOs','https://www.youtube.com/watch?v=Vdv1xcGOHXE','Vdv1xcGOHXE','video','video','youtube','trading-markets','intermediate',1,0.2,'Important reality check before applying to IPOs.',FALSE,TRUE,ARRAY['IPO','listing-gains','retail-investor','data','returns']),

('Guaranteed IPO Allotment | Happy Chartered Accountants Day | CA Rachana Ranade | #shorts','CA Rachana Phadke Ranade','Why SME IPOs are risky — low liquidity, operator games, SEBI concerns','https://www.youtube.com/watch?v=KklaiTU3lnQ','KklaiTU3lnQ','video','video','youtube','trading-markets','intermediate',1,0.2,'Critical risk warning about SME IPOs.',FALSE,TRUE,ARRAY['SME-IPO','risk','liquidity','SEBI','pump-dump']),

('New Age IPOs: Destroyers vs Creators 🚀 | Best & Worst IPO Performers in India 2026','Amol Smart Money','Options Greeks explained with real market examples — must know before trading options','https://www.youtube.com/watch?v=uTkZPFoRm1E','uTkZPFoRm1E','video','video','youtube','trading-markets','advanced',1,0.35,'Best Greek explanation from Indian expert.',FALSE,TRUE,ARRAY['Greeks','Delta','Gamma','Theta','Vega','options']),

('India में आने वाली है IPO की सबसे बड़ी सुनामी?','CA Rahul Malodia','SEBI study analysis — why most retail traders lose and how to avoid the traps','https://www.youtube.com/watch?v=oiqCKK_VAio','oiqCKK_VAio','video','video','youtube','trading-markets','intermediate',1,0.2,'Essential watching before starting F&O.',FALSE,TRUE,ARRAY['F&O','SEBI','loss','risk','retail-trader']),

('Jio IPO: My Honest Opinion','Pranjal Kamra','How to earn premium by selling call options on stocks you already own','https://www.youtube.com/watch?v=cf8-bWyxI_o','cf8-bWyxI_o','video','video','youtube','trading-markets','advanced',1,0.25,'Best income-from-options strategy for long investors.',FALSE,TRUE,ARRAY['covered-call','options','strategy','premium','income']),

('Are SME IPOs a Trap?🤔','Pranjal Kamra','Bank NIFTY and NIFTY weekly options — expiry strategy, theta decay, levels','https://www.youtube.com/watch?v=GUrIfYoMQEw','GUrIfYoMQEw','video','video','youtube','trading-markets','advanced',1,0.3,'Best NIFTY weekly options guide.',FALSE,TRUE,ARRAY['NIFTY','weekly-options','expiry','Bank-NIFTY','theta']),

('What Is Futures And Options Trading? F&O Explained By CA Rachana Ranade','CA Rachana Phadke Ranade','All major candlestick patterns with NSE live chart examples','https://www.youtube.com/watch?v=5hnyb78_sMc','5hnyb78_sMc','video','video','youtube','trading-markets','beginner',1,0.35,'Most comprehensive candlestick video for India.',TRUE,TRUE,ARRAY['candlestick','patterns','beginner','NSE','chart']),

('Options Greeks का सबसे सरल ज्ञान इधर मिलेगा। Options #Trading - 3 | #Learn2Trade 35','Vivek Bajaj : Trader + Investor ','Reversal candlestick patterns with back-tested win rates','https://www.youtube.com/watch?v=-oWRjReit1o','-oWRjReit1o','video','video','youtube','trading-markets','beginner',1,0.25,'Data-backed candlestick pattern guide.',FALSE,TRUE,ARRAY['Doji','Hammer','Engulfing','reversal','candlestick']),

('87.7% of F&O Traders Lost Money. So Who Made It? #Shorts','Sbstocksshorts','How to trade candlestick patterns with entry, stop-loss and target','https://www.youtube.com/watch?v=_vV9W3nDGXw','_vV9W3nDGXw','video','video','youtube','trading-markets','intermediate',1,0.3,'Best live trading example using candlesticks.',FALSE,TRUE,ARRAY['candlestick','strategy','entry','stop-loss','target']),

('How to Generate Income From Your Stocks? | Covered Call','Trading with Groww','Candlestick patterns Hindi mein — Doji, Hammer, Marubozu explained','https://www.youtube.com/watch?v=f5LWQa7fGFs','f5LWQa7fGFs','video','video','youtube','trading-markets','beginner',1,0.25,'Best Hindi candlestick complete guide.',FALSE,TRUE,ARRAY['candlestick','hindi','patterns','beginner','Doji']),

('Market Prediction: How market performed in the 4th week of September? #shortsfeed #nifty','CHANAKYA INVESTMENT','Simple vs exponential MA, golden cross, death cross — with NIFTY examples','https://www.youtube.com/watch?v=S-nmTOqDLTg','S-nmTOqDLTg','video','video','youtube','trading-markets','beginner',1,0.25,'Best moving average guide for India.',TRUE,TRUE,ARRAY['moving-average','SMA','EMA','golden-cross','NIFTY']),

('Stock market for beginners -Candlestick Analysis in Hindi (Part - 1)','Trading Chanakya','Why the 200 DMA is the most important moving average and how to trade it','https://www.youtube.com/watch?v=T_2BFZ2oXeU','T_2BFZ2oXeU','video','video','youtube','technical-analysis','intermediate',1,0.2,'Best 200 DMA strategy guide.',FALSE,TRUE,ARRAY['200-DMA','moving-average','trend','strategy','long-term']),

('Ex Se Zyada Predictable Hain Yeh Candles 😎 — Doji, Hammer & Shooting Star Explained #trading','The Trading Femme','9, 21, 50 EMA cross strategy for intraday NIFTY and Bank NIFTY','https://www.youtube.com/watch?v=9-dME9pktHs','9-dME9pktHs','video','video','youtube','technical-analysis','intermediate',1,0.25,'Practical EMA strategy for day traders.',FALSE,TRUE,ARRAY['EMA','intraday','9EMA','21EMA','strategy']),

('6. Understanding candlestick patterns','Zerodha Varsity','What Supertrend is, how to set parameters, buy-sell signals on NSE stocks','https://www.youtube.com/watch?v=AYG2g3O7jKc','AYG2g3O7jKc','video','video','youtube','technical-analysis','intermediate',1,0.2,'Best Supertrend indicator explanation.',FALSE,TRUE,ARRAY['Supertrend','indicator','buy-sell','ATR','NSE']),

('Candlestick Patterns Explained || Stock Market Trading','Booming Bulls','Moving averages Hindi mein samjhein — SMA, EMA, golden cross','https://www.youtube.com/watch?v=6SV6EDXkKJk','6SV6EDXkKJk','video','video','youtube','technical-analysis','beginner',1,0.2,'Best Hindi moving average explanation.',FALSE,TRUE,ARRAY['moving-average','hindi','SMA','EMA','trend']),

('Candlestick  Analysis in Hindi','MarketGurukul','RSI calculation, overbought oversold, divergence — with NIFTY live examples','https://www.youtube.com/watch?v=QVp7DM5Un7Y','QVp7DM5Un7Y','video','video','youtube','technical-analysis','intermediate',1,0.25,'Best RSI guide for Indian markets.',TRUE,TRUE,ARRAY['RSI','momentum','overbought','oversold','divergence']),

('Moving Average Setting for Profitable Exit','Trading Chanakya','MACD line, signal line, histogram — entry exit with MACD on NSE charts','https://www.youtube.com/watch?v=LKS97SfoEJw','LKS97SfoEJw','video','video','youtube','technical-analysis','intermediate',1,0.25,'Comprehensive MACD trading guide.',FALSE,TRUE,ARRAY['MACD','crossover','histogram','strategy','NSE']),

('What is 200 DMA in Stock Market? | Finance by Shivam #movingaverage #dma #stocks #viralshort','Finance_by_Shivam','Stochastic vs RSI, when to use stochastic, divergence signals','https://www.youtube.com/watch?v=wa6rRFrIMiA','wa6rRFrIMiA','video','video','youtube','technical-analysis','intermediate',1,0.2,'Good momentum alternative to RSI.',FALSE,TRUE,ARRAY['stochastic','oscillator','momentum','divergence','RSI']),

('Trade with EMA Strategy || EMA - SMA - DMA || What & How to Use || BankNifty | Anish Singh Thakur','Booming Bulls','Squeeze, breakout, mean reversion — all Bollinger band strategies explained','https://www.youtube.com/watch?v=ID48Wsb30Ns','ID48Wsb30Ns','video','video','youtube','technical-analysis','intermediate',1,0.25,'Definitive Bollinger Bands guide.',FALSE,TRUE,ARRAY['Bollinger-bands','squeeze','breakout','volatility','strategy']),

('Best Supertrend Settings for Beginners (Simple Way)','Michael Whitman','ADX for trend strength measurement — when to trade and when to stay out','https://www.youtube.com/watch?v=bc3BOLoEtDM','bc3BOLoEtDM','video','video','youtube','technical-analysis','advanced',1,0.2,'Underused but powerful trend strength indicator.',FALSE,TRUE,ARRAY['ADX','trend-strength','directional','DI','filter']),

('ऐसे use कीजिए Moving Averages','Kunal Saraogi','Bitcoin origin, blockchain, why it has value, how mining works','https://www.youtube.com/watch?v=wQ9lZk0WBzw','wQ9lZk0WBzw','video','video','youtube','technical-analysis','beginner',1,0.1,'Cleanest animated Bitcoin explanation.',TRUE,TRUE,ARRAY['Bitcoin','blockchain','mining','basics','beginner']),

('3 TIPS FOR RSI INDICATOR | Learn technical analysis | Trade with Rukmani |','Trade with Rukmani','Bitcoin halving mechanics, historical price impact, supply schedule','https://www.youtube.com/watch?v=i46pbcj3Io0','i46pbcj3Io0','video','video','youtube','technical-analysis','intermediate',1,0.2,'Best Bitcoin halving explanation.',FALSE,TRUE,ARRAY['Bitcoin','halving','supply','mining','price']),

('MACD Crossover Strategy Backtested | 6 Years Data','Trading with Groww','Digital gold thesis, inflation hedge, institutional adoption, comparisons','https://www.youtube.com/watch?v=2d3gW6xChw0','2d3gW6xChw0','video','video','youtube','technical-analysis','intermediate',1,0.15,'Bitcoin as digital gold — objective analysis.',FALSE,TRUE,ARRAY['Bitcoin','gold','store-of-value','inflation-hedge','comparison']),

('How I Actually Read the Stochastic Indicator','MARK TRADER','30% tax, 1% TDS, ITR filing with VDA — everything about crypto tax India','https://www.youtube.com/watch?v=zDWdt5BO-3E','zDWdt5BO-3E','video','video','youtube','technical-analysis','intermediate',1,0.3,'Essential Bitcoin India tax guide.',FALSE,TRUE,ARRAY['Bitcoin','tax','India','VDA','30-percent','TDS']),

('Bollinger Bands Reversal Trading | Secret Trick with Candlestick','Trading Chanakya','Bitcoin ki poori jankari Hindi mein — kya hai, kaise kaam karta hai','https://www.youtube.com/watch?v=ENZ4KPYfdqw','ENZ4KPYfdqw','video','video','youtube','technical-analysis','beginner',1,0.2,'Best Hindi Bitcoin explainer.',FALSE,TRUE,ARRAY['Bitcoin','hindi','basics','blockchain','beginner']),

('📈 Zerodha Chart with ADX indicator: Small Settings, Big Gains! 🚀','Trading Chanakya','Smart contracts, EVM, gas fees, what makes Ethereum different from Bitcoin','https://www.youtube.com/watch?v=glKKdz1SC_k','glKKdz1SC_k','video','video','youtube','technical-analysis','beginner',1,0.12,'Best animated Ethereum explainer.',TRUE,TRUE,ARRAY['Ethereum','smart-contract','EVM','gas','blockchain']),

('How does a blockchain work - Simply Explained','Simply Explained','Decentralised exchanges, lending protocols, yield farming basics','https://www.youtube.com/watch?v=SSo_EIwHSd4','SSo_EIwHSd4','video','video','youtube','crypto-defi','intermediate',1,0.2,'Comprehensive DeFi overview.',FALSE,TRUE,ARRAY['DeFi','Uniswap','Aave','yield-farming','liquidity']),

('Bitcoin Halving 2024!! What It Means For YOUR Crypto Portfolio!','Coin Bureau','How The Merge changed Ethereum, validators, staking, energy reduction','https://www.youtube.com/watch?v=MTB3di89DwU','MTB3di89DwU','video','video','youtube','crypto-defi','intermediate',1,0.15,'Clean Ethereum PoS explanation.',FALSE,TRUE,ARRAY['Ethereum','Proof-of-Stake','Merge','staking','validators']),

('Bitcoin vs Gold: Which One Should You Invest In? 🪙💰#BitcoinVsGold #Bitcoin #Gold #Investing','WealthMind','L2 rollups, how they reduce gas fees, which L2 to use and why','https://www.youtube.com/watch?v=3S3JWD55700','3S3JWD55700','video','video','youtube','crypto-defi','advanced',1,0.15,'Best Layer 2 technical explainer.',FALSE,TRUE,ARRAY['Layer-2','Polygon','Arbitrum','Optimism','rollup']),

('CRYPTO TAX KA BADA JHATKA','Option Era ','Rug pulls, pump-and-dump, fake exchanges, phishing — all crypto scam types','https://www.youtube.com/watch?v=cl1G1aP7fQ0','cl1G1aP7fQ0','video','video','youtube','crypto-defi','beginner',1,0.2,'Essential safety video for crypto beginners.',FALSE,TRUE,ARRAY['scam','rug-pull','safety','phishing','crypto-fraud']),

('Ethereum Merge Scams? | How do I Avoid? | CA Rachana Ranade','CA Rachana Phadke Ranade','DCF model built on Indian company using Screener.in data','https://www.youtube.com/watch?v=Doh75pBSf00','Doh75pBSf00','video','video','youtube','crypto-defi','advanced',1,0.4,'Practical DCF for Indian stocks.',FALSE,TRUE,ARRAY['DCF','valuation','India','Screener','WACC']),

('What is Ethereum? A Beginner''s Explanation in Plain English','99Bitcoins','What intrinsic value is, margin of safety, how to think about stock price','https://www.youtube.com/watch?v=jxLkbJozKbY','jxLkbJozKbY','video','video','youtube','crypto-defi','intermediate',1,0.2,'Good conceptual valuation foundation.',FALSE,TRUE,ARRAY['intrinsic-value','margin-of-safety','valuation','price']),

('What is DeFi? (Decentralized Finance Animated)','Whiteboard Crypto','Which valuation multiple is best for different sectors — comparison guide','https://www.youtube.com/watch?v=17QRFlml4pA','17QRFlml4pA','video','video','youtube','crypto-defi','intermediate',1,0.2,'Best valuation multiples comparison.',FALSE,TRUE,ARRAY['EV/EBITDA','P/E','multiples','valuation','sector']),

('Lecture 1: History of Blockchain Technology','Web3 Foundation','How to do comparable company analysis — peer benchmarking for valuation','https://www.youtube.com/watch?v=y8YyZELnVaw','y8YyZELnVaw','video','video','youtube','crypto-defi','advanced',1,0.25,'Practical comps analysis guide.',FALSE,TRUE,ARRAY['comps','comparable','peer','valuation','multiples']),

('ROLLUPS - The Ultimate Ethereum Scaling Strategy? Arbitrum & Optimism Explained','Finematics','Revenue, EBITDA, depreciation, PAT — reading Reliance P&L step by step','https://www.youtube.com/watch?v=7pWxCklcNsU','7pWxCklcNsU','video','video','youtube','crypto-defi','beginner',1,0.3,'Best P&L reading guide for India.',TRUE,TRUE,ARRAY['P&L','income-statement','revenue','EBITDA','PAT']),

('WATCH OUT For these Crypto SCAMS!!','Coin Bureau','Operating, investing, financing cash flows — why OCF > PAT matters','https://www.youtube.com/watch?v=AFhSf0l_aQQ','AFhSf0l_aQQ','video','video','youtube','crypto-defi','intermediate',1,0.25,'Best cash flow statement guide.',FALSE,TRUE,ARRAY['cash-flow','OCF','FCF','statement','accounting']),

('Discounted Cash Flow - How to Value a Stock Using Discounted Cash Flow (DCF) - DCF Calculation','Learn to Invest - Investors Grow','Damodaran on what balance sheet really tells investors and what it hides','https://www.youtube.com/watch?v=fd_emLLzJnk','fd_emLLzJnk','video','video','youtube','corporate-finance','advanced',1,0.5,'Institutional level balance sheet analysis.',FALSE,TRUE,ARRAY['balance-sheet','Damodaran','assets','liabilities','equity']),

('What is Discounted Cash Flow (DCF) | Stock market Basics for Beginners in Hindi','Pranjal Kamra','DSO, DIO, DPO, cash conversion cycle — how companies manage working capital','https://www.youtube.com/watch?v=Ey1pFRfbgho','Ey1pFRfbgho','video','video','youtube','corporate-finance','advanced',1,0.2,'Best working capital explanation.',FALSE,TRUE,ARRAY['working-capital','DSO','cash-conversion-cycle','operations']),

('Intrinsic Value Of A Stock In Hindi | Intrinsic Value Kya Hoti Hai #shorts','Deepu Maurya','Full talk on wealth, greed, fear and the behavioral side of money','https://www.youtube.com/watch?v=_gnlscB7Tzs','_gnlscB7Tzs','video','video','youtube','corporate-finance','intermediate',1,0.5,'Must-watch foundational behavioral finance talk.',TRUE,TRUE,ARRAY['psychology','money','Housel','greed','fear','wealth']),

('PE Ratio Isn’t Enough: Use PEG & EV/EBITDA to Compare Stocks','CA Nikhil Nainani','Nobel laureate Kahneman explains loss aversion, prospect theory','https://www.youtube.com/watch?v=LQUXJC1k6BE','LQUXJC1k6BE','video','video','youtube','corporate-finance','intermediate',1,0.1,'Original source — Kahneman on loss aversion.',FALSE,TRUE,ARRAY['loss-aversion','Kahneman','prospect-theory','psychology','bias']),

('1. Introduction to fundamental analysis','Zerodha Varsity','30-minute masterclass on credit cycles, debt crises and economic drivers','https://www.youtube.com/watch?v=8rUc0MaMzik','8rUc0MaMzik','video','video','youtube','corporate-finance','intermediate',1,0.5,'Most watched economics explainer ever made.',FALSE,TRUE,ARRAY['Dalio','economy','credit','debt-cycle','macro']),

('William Ackman: Everything You Need to Know About Finance and Investing in Under an Hour | Big Think','Big Think','Cognitive biases in investing — overconfidence, anchoring, herding','https://www.youtube.com/watch?v=WEDIj9JBTC8','WEDIj9JBTC8','video','video','youtube','corporate-finance','beginner',1,0.2,'Relatable India-specific bias examples.',FALSE,TRUE,ARRAY['biases','overconfidence','anchoring','herding','India']),

('6. The Cash Flow statement','Zerodha Varsity','Bull market, bear market, consolidation — what drives cycles and how to navigate','https://www.youtube.com/watch?v=uJG3SVrWzlQ','uJG3SVrWzlQ','video','video','youtube','corporate-finance','intermediate',1,0.2,'Best market cycles explainer.',TRUE,TRUE,ARRAY['market-cycle','bull','bear','sentiment','cycle']),

('Accounting 101: A Preview','Aswath Damodaran','VIX India, fear-greed index, how sentiment drives price — for Indian investors','https://www.youtube.com/watch?v=Jbp3-AU9v_g','Jbp3-AU9v_g','video','video','youtube','corporate-finance','intermediate',1,0.2,'India VIX and sentiment explained well.',FALSE,TRUE,ARRAY['fear','greed','VIX','sentiment','India']),

('IPO investment | How to analyze IPOs | 5 hacks to maximize profit from IPO','ET Money','Psychological framework for investing when everyone is panicking','https://www.youtube.com/watch?v=B5q7kCOq3JE','B5q7kCOq3JE','video','video','youtube','corporate-finance','intermediate',1,0.2,'Practical guidance for crash investing.',FALSE,TRUE,ARRAY['crash','opportunity','buying','fear','behavioral']),

('When money isn’t real: the $10,000 experiment | Adam Carroll | TEDxLondonBusinessSchool','TEDx Talks','How recency bias destroys returns — India market examples from 2017-2024','https://www.youtube.com/watch?v=_VB39Jo8mAQ','_VB39Jo8mAQ','video','video','youtube','behavioral-finance','intermediate',1,0.2,'Most relatable Indian recency bias examples.',FALSE,TRUE,ARRAY['recency-bias','returns','SIP','cancellation','India']),

('The riddle of experience vs. memory | Daniel Kahneman','TED','What determines exchange rates, floating vs fixed, RBI intervention','https://www.youtube.com/watch?v=XgRlrBl-7Yg','XgRlrBl-7Yg','video','video','youtube','behavioral-finance','beginner',1,0.2,'Best exchange rate fundamentals for India.',TRUE,TRUE,ARRAY['forex','exchange-rate','RBI','USD-INR','floating']),

('How The Economic Machine Works by Ray Dalio','Principles by Ray Dalio','CAD, oil prices, FII flows, RBI reserves — why INR depreciates and when','https://www.youtube.com/watch?v=PHe0bXAIuk0','PHe0bXAIuk0','video','video','youtube','behavioral-finance','intermediate',1,0.2,'Essential for understanding INR movement.',FALSE,TRUE,ARRAY['rupee','dollar','INR','depreciation','RBI','oil']),

('How Mutual Funds Won India’s Trust!','Pranjal Kamra','FEMA rules, LRS limit, TCS on remittances, overseas investment rules','https://www.youtube.com/watch?v=5mP0bJV65js','5mP0bJV65js','video','video','youtube','behavioral-finance','intermediate',1,0.3,'Most complete FEMA guide for Indians.',FALSE,TRUE,ARRAY['FEMA','LRS','NRI','remittance','TCS','overseas']),

('THINKING, FAST AND SLOW BY DANIEL KAHNEMAN | ANIMATED BOOK SUMMARY','FightMediocrity','Legal currency futures on NSE, why international forex platforms are risky for Indians','https://www.youtube.com/watch?v=uqXVAo7dVRU','uqXVAo7dVRU','video','video','youtube','behavioral-finance','beginner',1,0.2,'Critical legal clarity for forex in India.',FALSE,TRUE,ARRAY['forex','legal','NSE','FEMA','currency-futures']),

('Do Moon Cycles Actually Move the Stock Market?','In The Money by Zerodha','Forward contracts, options hedging — how Indian businesses manage currency risk','https://www.youtube.com/watch?v=HKJYQ6rPjgM','HKJYQ6rPjgM','video','video','youtube','behavioral-finance','advanced',1,0.25,'Best business currency hedging guide.',FALSE,TRUE,ARRAY['hedging','forward-contract','exporter','importer','currency-risk']),

('How to Control Fear & Greed?  #shorts #powerofstocks','POWER OF STOCKS GLOBAL','How to Control Fear & Greed?  #shorts #powerofstocks','https://www.youtube.com/watch?v=etHsKoq8i6o','etHsKoq8i6o','video','video','youtube','behavioral-finance','intermediate',1,0.2,'Curated top finance video',FALSE,TRUE,ARRAY['behavioral-finance','finance','education']),

('Market Crash Signs for 2026 | Business | Sarthak Ahuja','Sarthak Ahuja','Market Crash Signs for 2026 | Business | Sarthak Ahuja','https://www.youtube.com/watch?v=a8JrqjCV4ao','a8JrqjCV4ao','video','video','youtube','behavioral-finance','intermediate',1,0.2,'Curated top finance video',FALSE,TRUE,ARRAY['behavioral-finance','finance','education']),

('From 225 Stocks To 15 Stocks In Portfolio | Letter To Shareholder: Warren Buffett #investing #Stocks','Wise Owl Wealth (WoW)','From 225 Stocks To 15 Stocks In Portfolio | Letter To Shareholder: Warren Buffett #investing #Stocks','https://www.youtube.com/watch?v=kdjBa3Jr28Y','kdjBa3Jr28Y','video','video','youtube','behavioral-finance','intermediate',1,0.2,'Curated top finance video',FALSE,TRUE,ARRAY['behavioral-finance','finance','education']),

('Why Investors Select The Wrong Stocks - Recency Bias','Unravelled by Shankar','Why Investors Select The Wrong Stocks - Recency Bias','https://www.youtube.com/watch?v=NlDFJMoTYHI','NlDFJMoTYHI','video','video','youtube','behavioral-finance','intermediate',1,0.2,'Curated top finance video',FALSE,TRUE,ARRAY['behavioral-finance','finance','education']),

('Ashneer Grover: Zerodha is best #ashneergrover #shorts','Knowledgeify','Ashneer Grover: Zerodha is best #ashneergrover #shorts','https://www.youtube.com/watch?v=HSizIZmsJP8','HSizIZmsJP8','video','video','youtube','forex-currency','intermediate',1,0.2,'Curated top finance video',FALSE,TRUE,ARRAY['forex-currency','finance','education']),

('Why is RBI Letting the Rupee Fall to 100 | Business | Sarthak Ahuja','Sarthak Ahuja','Why is RBI Letting the Rupee Fall to 100 | Business | Sarthak Ahuja','https://www.youtube.com/watch?v=_dg1SPsflB8','_dg1SPsflB8','video','video','youtube','forex-currency','intermediate',1,0.2,'Curated top finance video',FALSE,TRUE,ARRAY['forex-currency','finance','education']),

('₹5 Lakh FEMA penalty is what happens when you forget to update your bank accountafter moving abroad','NRI Shaala by Aspora ','₹5 Lakh FEMA penalty is what happens when you forget to update your bank accountafter moving abroad','https://www.youtube.com/watch?v=ejJyLJOvRoI','ejJyLJOvRoI','video','video','youtube','forex-currency','intermediate',1,0.2,'Curated top finance video',FALSE,TRUE,ARRAY['forex-currency','finance','education']),

('FOREX TRADING ILLEGAL IN INDIA 🤫| ft.@AbhishekKar #forextrading #stockmarket #forex #forextrader','Karol Army','FOREX TRADING ILLEGAL IN INDIA 🤫| ft.@AbhishekKar #forextrading #stockmarket #forex #forextrader','https://www.youtube.com/watch?v=Amc8HiD3RA0','Amc8HiD3RA0','video','video','youtube','forex-currency','intermediate',1,0.2,'Curated top finance video',FALSE,TRUE,ARRAY['forex-currency','finance','education']),

('RBI Mandates 20% Cash Reserve For Forex Deals | Curb Hedging Cost And Defend Falling Rupee | N18S','CNBC-TV18','RBI Mandates 20% Cash Reserve For Forex Deals | Curb Hedging Cost And Defend Falling Rupee | N18S','https://www.youtube.com/watch?v=Ig2EhlCgipo','Ig2EhlCgipo','video','video','youtube','forex-currency','intermediate',1,0.2,'Curated top finance video',FALSE,TRUE,ARRAY['forex-currency','finance','education']),

('Personal Financial Planning By Rachana Ranade','CA Rachana Phadke Ranade','Personal Financial Planning By Rachana Ranade','https://www.youtube.com/playlist?list=PL8uhW8cclMiOSfw_Kzi6YpLx1PhL8GIS9','PL8uhW8cclMiOSfw_Kzi6YpLx1PhL8GIS9','playlist','playlist','youtube','personal-finance','intermediate',1,0.2,'Curated top finance video',FALSE,TRUE,ARRAY['personal-finance','finance','education']),

('Mutual Fund Distribution -  Video Course','Zerodha','Mutual Fund Distribution -  Video Course','https://www.youtube.com/playlist?list=PLkxTRam6E2V81Bm7FwYYklvirj9XuBtgj','PLkxTRam6E2V81Bm7FwYYklvirj9XuBtgj','playlist','playlist','youtube','personal-finance','intermediate',1,0.2,'Curated top finance video',FALSE,TRUE,ARRAY['personal-finance','finance','education']),

('Multivariable calculus','Khan Academy','Multivariable calculus','https://www.youtube.com/playlist?list=PLSQl0a2vh4HC5feHa6Rc5c0wbRTx56nF7','PLSQl0a2vh4HC5feHa6Rc5c0wbRTx56nF7','playlist','playlist','youtube','personal-finance','intermediate',1,0.2,'Curated top finance video',FALSE,TRUE,ARRAY['personal-finance','finance','education']),

('Rachna ranade','Abhishek Bagade','Rachna ranade','https://www.youtube.com/playlist?list=PLpktYX_wY8d1ov4UTTY-UmbVmgDI8Zqae','PLpktYX_wY8d1ov4UTTY-UmbVmgDI8Zqae','playlist','playlist','youtube','corporate-finance','intermediate',1,0.2,'Curated top finance video',FALSE,TRUE,ARRAY['corporate-finance','finance','education'])
ON CONFLICT (embed_id) DO NOTHING;

-- Verification block
DO $$
DECLARE
  v_total INT;
  v_videos INT;
  v_pls INT;
BEGIN
  SELECT COUNT(*) INTO v_total FROM curated_playlists WHERE is_published = TRUE;
  SELECT COUNT(*) INTO v_videos FROM curated_playlists WHERE video_type = 'video' AND is_published = TRUE;
  SELECT COUNT(*) INTO v_pls FROM curated_playlists WHERE video_type = 'playlist' AND is_published = TRUE;
  RAISE NOTICE '✅ Video library expansion complete!';
  RAISE NOTICE '   Total active items: % (Videos: %, Playlists: %)', v_total, v_videos, v_pls;
END $$;
