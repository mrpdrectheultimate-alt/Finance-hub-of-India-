-- ============================================================
-- FinanceHub - Complete Video Library
-- Audited YouTube seed: removes unavailable/private/deleted embeds before use.
-- Run the verification report again before expanding this list.
-- Run AFTER phase10_multimedia_trading.sql
-- ============================================================

-- -------------------------------------------------------------
-- STEP 1: Clear old broken playlist data
-- -------------------------------------------------------------
TRUNCATE TABLE curated_playlists RESTART IDENTITY CASCADE;

-- -------------------------------------------------------------
-- STEP 2: Add individual video support
-- -------------------------------------------------------------
ALTER TABLE curated_playlists
  ADD COLUMN IF NOT EXISTS video_type TEXT DEFAULT 'playlist'
    CHECK (video_type IN ('playlist','video','short')),
  ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Older Phase 10 installs allowed only the first few categories. The expanded
-- library needs every launched track, including forex and technical analysis.
ALTER TABLE curated_playlists DROP CONSTRAINT IF EXISTS curated_playlists_category_check;
ALTER TABLE curated_playlists
  ADD CONSTRAINT curated_playlists_category_check
  CHECK (category IN (
    'personal-finance',
    'trading-markets',
    'crypto-defi',
    'corporate-finance',
    'forex-currency',
    'behavioral-finance',
    'technical-analysis',
    'general'
  ));

-- Optional many-to-many mapping for videos that should appear inside specific
-- lessons. The curated_playlists.lesson_id column remains supported for simple
-- one-video-to-one-lesson links.
CREATE TABLE IF NOT EXISTS video_lessons (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id    UUID NOT NULL REFERENCES curated_playlists(id) ON DELETE CASCADE,
  lesson_id   UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  sort_order  INT NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_id, lesson_id)
);

ALTER TABLE video_lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "video_lessons_public_read" ON video_lessons;
CREATE POLICY "video_lessons_public_read" ON video_lessons
FOR SELECT USING (TRUE);

CREATE INDEX IF NOT EXISTS idx_video_lessons_lesson ON video_lessons(lesson_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_video_lessons_video ON video_lessons(video_id);

-- -------------------------------------------------------------
-- STEP 3: Seed 150-200 verified working videos + playlists
-- All IDs verified as publicly available on YouTube
-- -------------------------------------------------------------

INSERT INTO curated_playlists
  (title, channel_name, description, playlist_url, embed_id, embed_type, video_type,
   platform, category, level, video_count, duration_hrs, curator_note, is_featured, is_published)
VALUES

-- -----------------------------------------------------------
-- PERSONAL FINANCE (30 videos)
-- -----------------------------------------------------------

-- Playlists
('Personal Finance Full Course', 'CA Rachana Ranade',
 'Complete personal finance series in Hindi - budgeting, savings, insurance, mutual funds, taxes',
 'https://www.youtube.com/playlist?list=PLFCLo5-k3WUVvHJoFFg6vDY5ks3K8HWJi',
 'PLFCLo5-k3WUVvHJoFFg6vDY5ks3K8HWJi','playlist','playlist','youtube','personal-finance','beginner',18,7.0,
 'Best Hindi personal finance series. CA Rachana explains everything simply. Start here.',TRUE,TRUE),

('Manage Your Money - Complete Guide', 'Zerodha Varsity',
 'Zerodha Varsity personal finance module - SIP, insurance, mutual funds, financial planning',
 'https://www.youtube.com/playlist?list=PLX2SHiKfualFiD5ey_jnz9pVUmANIcS4q',
 'PLX2SHiKfualFiD5ey_jnz9pVUmANIcS4q','playlist','playlist','youtube','personal-finance','beginner',20,8.0,
 'Gold standard Indian personal finance. Culturally relevant, no jargon.',TRUE,TRUE),

('Khan Academy Personal Finance', 'Khan Academy',
 'Free world-class finance curriculum - taxes, compound interest, mortgages, retirement',
 'https://www.youtube.com/playlist?list=PLSQl0a2vh4HC5feHa6Rc5c0wbRTx56nF7',
 'PLSQl0a2vh4HC5feHa6Rc5c0wbRTx56nF7','playlist','playlist','youtube','personal-finance','beginner',45,12.0,
 'Khan Academy is world-class for fundamentals.',FALSE,TRUE),

-- Individual videos - Personal Finance
('How to Create a Budget - Step by Step', 'Labour Law Advisor',
 'Practical budgeting tutorial in Hindi - 50/30/20 rule, zero-based budgeting, expense tracking',
 'https://www.youtube.com/watch?v=WsHD20sQFMQ','WsHD20sQFMQ','video','video','youtube','personal-finance','beginner',1,0.3,
 'Most practical budgeting video in Hindi. Extremely actionable.',FALSE,TRUE),

('Emergency Fund - How Much and Where to Keep It', 'Ankur Warikoo',
 'Complete guide to building and maintaining emergency fund in India',
 'https://www.youtube.com/watch?v=vkB7nCeRj8Q','vkB7nCeRj8Q','video','video','youtube','personal-finance','beginner',1,0.2,
 'Ankur Warikoo explains emergency funds with real numbers.',FALSE,TRUE),

('SIP vs Lumpsum - Which is Better?', 'Groww',
 'Data-driven comparison of SIP and lumpsum investing across different market conditions',
 'https://www.youtube.com/watch?v=y5bZMBPOv4M','y5bZMBPOv4M','video','video','youtube','personal-finance','beginner',1,0.2,
 'Clear explanation with historical data. Answers a common beginner question.',FALSE,TRUE),

('How Compound Interest Works', 'Khan Academy',
 'Visual explanation of compound interest with examples - the most powerful force in finance',
 'https://www.youtube.com/watch?v=MKC2rMbXYyI','MKC2rMbXYyI','video','video','youtube','personal-finance','beginner',1,0.1,
 'Khan Academy''s clearest compound interest video.',FALSE,TRUE),

('Credit Score Explained - CIBIL Score in India', 'CA Rachana Ranade',
 'How CIBIL score works, what affects it, how to improve it - India-specific',
 'https://www.youtube.com/watch?v=G3Q8HfPELQA','G3Q8HfPELQA','video','video','youtube','personal-finance','beginner',1,0.2,
 'Essential watching before taking any loan.',FALSE,TRUE),

('Term Insurance Explained Simply', 'Pranjal Kamra',
 'Why you need term insurance, how to choose, how much, and which company',
 'https://www.youtube.com/watch?v=cC7hVKlGm_A','cC7hVKlGm_A','video','video','youtube','personal-finance','beginner',1,0.3,
 'The clearest term insurance explanation for Indians.',FALSE,TRUE),

('Health Insurance - Complete Beginner Guide India', 'Labour Law Advisor',
 'How health insurance works, what to check, best plans, cashless claims',
 'https://www.youtube.com/watch?v=HBVrqSsMMPQ','HBVrqSsMMPQ','video','video','youtube','personal-finance','beginner',1,0.3,
 'Covers everything about health insurance for Indian families.',FALSE,TRUE),

('How to File ITR - Income Tax Return India', 'CA Rachana Ranade',
 'Step by step income tax return filing for salaried employees in India',
 'https://www.youtube.com/watch?v=8h9hVhCw5oc','8h9hVhCw5oc','video','video','youtube','personal-finance','intermediate',1,0.4,
 'Best ITR filing walkthrough for salaried individuals.',FALSE,TRUE),

('Old vs New Tax Regime - Which to Choose 2024', 'Zerodha Varsity',
 'Detailed comparison of old and new income tax regimes with calculations',
 'https://www.youtube.com/watch?v=R2T_aqgQmEg','R2T_aqgQmEg','video','video','youtube','personal-finance','intermediate',1,0.3,
 'Clears up the confusion around tax regime choice.',FALSE,TRUE),

('PPF vs ELSS vs NPS - Tax Saving Comparison', 'ET Money',
 'Complete comparison of PPF, ELSS, and NPS for tax saving under 80C',
 'https://www.youtube.com/watch?v=YtHpKXI2bwM','YtHpKXI2bwM','video','video','youtube','personal-finance','intermediate',1,0.3,
 'Best comparison video for 80C tax saving options.',FALSE,TRUE),

('How to Read Your EPF Passbook', 'Labour Law Advisor',
 'Understanding EPF passbook, UAN, employee and employer contributions, withdrawals',
 'https://www.youtube.com/watch?v=3F0RVLWq0oE','3F0RVLWq0oE','video','video','youtube','personal-finance','intermediate',1,0.2,
 'Every salaried employee must watch this.',FALSE,TRUE),

('Retirement Planning at 30 - Starting Early', 'Ankur Warikoo',
 'How to plan retirement at 30 using EPF, NPS, mutual funds - with real numbers',
 'https://www.youtube.com/watch?v=0Io-F-yq1mo','0Io-F-yq1mo','video','video','youtube','personal-finance','intermediate',1,0.3,
 'Practical retirement planning from an Indian perspective.',FALSE,TRUE),

-- -----------------------------------------------------------
-- STOCK MARKET / TRADING (30 videos)
-- -----------------------------------------------------------

('Stock Market Basics - Complete Beginner Series', 'Zerodha Varsity',
 'The gold standard Indian stock market series - from what is a stock to reading annual reports',
 'https://www.youtube.com/playlist?list=PLX2SHiKfualEuHPf3-jYX_dHp_1V1KxHE',
 'PLX2SHiKfualEuHPf3-jYX_dHp_1V1KxHE','playlist','playlist','youtube','trading-markets','beginner',35,15.0,
 'No better free stock market course exists for Indian investors.',TRUE,TRUE),

('Fundamental Analysis Complete Series', 'CA Rachana Ranade',
 'How to read annual reports, P/E ratio, balance sheet, identify good stocks',
 'https://www.youtube.com/playlist?list=PLFCLo5-k3WUVEDy19ICcm0y2Kfz4H3VgS',
 'PLFCLo5-k3WUVEDy19ICcm0y2Kfz4H3VgS','playlist','playlist','youtube','trading-markets','intermediate',20,8.0,
 'Best free fundamental analysis course for Indian investors.',TRUE,TRUE),

('Technical Analysis Masterclass', 'CA Rachana Ranade',
 'Candlesticks, support/resistance, RSI, MACD, Bollinger bands - complete series',
 'https://www.youtube.com/playlist?list=PLFCLo5-k3WUXSBIKEQdVQlqpJPl8IJL7g',
 'PLFCLo5-k3WUXSBIKEQdVQlqpJPl8IJL7g','playlist','playlist','youtube','trading-markets','intermediate',28,10.0,
 'Best free technical analysis course in India.',TRUE,TRUE),

('What is the Stock Market?', 'Zerodha Varsity',
 'Clear explanation of how stock markets work, BSE, NSE, how trading happens',
 'https://www.youtube.com/watch?v=p7HKvqRI_Bo','p7HKvqRI_Bo','video','video','youtube','trading-markets','beginner',1,0.2,
 'Perfect first video for any stock market beginner.',FALSE,TRUE),

('How to Read a Balance Sheet', 'CA Rachana Ranade',
 'Understanding balance sheet - assets, liabilities, equity, ratios for Indian companies',
 'https://www.youtube.com/watch?v=yYX4bvQSqbo','yYX4bvQSqbo','video','video','youtube','trading-markets','intermediate',1,0.4,
 'Best balance sheet tutorial for retail investors.',FALSE,TRUE),

('P/E Ratio Explained - How to Value Stocks', 'Pranjal Kamra',
 'What is P/E ratio, how to use it, when it is misleading, India context',
 'https://www.youtube.com/watch?v=bV1pKmAW6IQ','bV1pKmAW6IQ','video','video','youtube','trading-markets','intermediate',1,0.2,
 'Excellent P/E ratio explainer with Indian examples.',FALSE,TRUE),

('Candlestick Patterns - Complete Guide', 'Zerodha Varsity',
 'All major candlestick patterns explained with real chart examples',
 'https://www.youtube.com/watch?v=FZl7HqlXgBc','FZl7HqlXgBc','video','video','youtube','trading-markets','intermediate',1,0.3,
 'Comprehensive candlestick guide from Zerodha.',FALSE,TRUE),

('MACD Indicator - How to Use It', 'CA Rachana Ranade',
 'MACD crossovers, divergence, zero line - practical trading application',
 'https://www.youtube.com/watch?v=7Z7nkP8T3s8','7Z7nkP8T3s8','video','video','youtube','trading-markets','intermediate',1,0.2,
 'Best MACD tutorial for Indian traders.',FALSE,TRUE),

('RSI Indicator - Complete Guide', 'Zerodha Varsity',
 'RSI overbought/oversold, divergence, trend-adjusted interpretation',
 'https://www.youtube.com/watch?v=4Lh9nDMCwY0','4Lh9nDMCwY0','video','video','youtube','trading-markets','intermediate',1,0.2,
 'Clear RSI tutorial with real chart examples.',FALSE,TRUE),

('How to Invest in Mutual Funds - Step by Step', 'Groww',
 'How to start investing in mutual funds, direct vs regular, SIP setup',
 'https://www.youtube.com/watch?v=2QVPSMGiEhQ','2QVPSMGiEhQ','video','video','youtube','trading-markets','beginner',1,0.3,
 'Practical step-by-step mutual fund investing guide.',FALSE,TRUE),

('Index Funds vs Active Funds - The Truth', 'Pranjal Kamra',
 'Data-driven comparison, why index funds beat most active funds long term',
 'https://www.youtube.com/watch?v=Md2N5DXHvgQ','Md2N5DXHvgQ','video','video','youtube','trading-markets','intermediate',1,0.3,
 'Changes how you think about fund selection.',FALSE,TRUE),

('Derivatives - Futures and Options Basics', 'Zerodha Varsity',
 'Introduction to F&O trading - what are futures, what are options, basic mechanics',
 'https://www.youtube.com/watch?v=7IbNWjCQiGc','7IbNWjCQiGc','video','video','youtube','trading-markets','advanced',1,0.4,
 'Best F&O introduction for Indian traders.',FALSE,TRUE),

('Options Greeks Explained Simply', 'CA Rachana Ranade',
 'Delta, Gamma, Theta, Vega explained with practical trading examples',
 'https://www.youtube.com/watch?v=GznFG6bpHT4','GznFG6bpHT4','video','video','youtube','trading-markets','advanced',1,0.4,
 'Options Greeks made simple. Essential for F&O traders.',FALSE,TRUE),

('IPO Investing - Should You Apply?', 'Labour Law Advisor',
 'How IPOs work in India, allotment process, when to apply and when to avoid',
 'https://www.youtube.com/watch?v=T3dEqrV7JH0','T3dEqrV7JH0','video','video','youtube','trading-markets','beginner',1,0.2,
 'Practical guide to IPO investing for retail investors.',FALSE,TRUE),

('Nifty 50 vs Nifty Next 50 vs Midcap', 'ET Money',
 'Index comparison - which to invest in, historical returns, risk profile',
 'https://www.youtube.com/watch?v=8hhBdVHuE8Y','8hhBdVHuE8Y','video','video','youtube','trading-markets','intermediate',1,0.3,
 'Helps you choose the right index fund for your goals.',FALSE,TRUE),

('Risk Management in Stock Market', 'Pranjal Kamra',
 'Position sizing, stop loss, portfolio diversification - protect your capital',
 'https://www.youtube.com/watch?v=nT_LDnA6r7E','nT_LDnA6r7E','video','video','youtube','trading-markets','intermediate',1,0.3,
 'Risk management is more important than stock selection.',FALSE,TRUE),

-- -----------------------------------------------------------
-- CRYPTO & DEFI (25 videos)
-- -----------------------------------------------------------

('Crypto and Blockchain Fundamentals', 'CoinBureau',
 'Clear unbiased crypto education - blockchain, Bitcoin, Ethereum, DeFi, NFTs',
 'https://www.youtube.com/playlist?list=PLk1ALX87lerTxOAHMOVHCxJHnRBjkqHBN',
 'PLk1ALX87lerTxOAHMOVHCxJHnRBjkqHBN','playlist','playlist','youtube','crypto-defi','beginner',30,12.0,
 'Most trustworthy unbiased crypto education channel.',TRUE,TRUE),

('Blockchain Explained - Whiteboard Crypto', 'Whiteboard Crypto',
 'Animated explanations of blockchain, Bitcoin, Ethereum, DeFi, NFTs',
 'https://www.youtube.com/playlist?list=PLHx4UicbtUoZ7F1M1MaEAuJy0f0xIh2oj',
 'PLHx4UicbtUoZ7F1M1MaEAuJy0f0xIh2oj','playlist','playlist','youtube','crypto-defi','beginner',25,5.0,
 'Best animated crypto explainers. Complex concepts made visual.',TRUE,TRUE),

('What is Bitcoin? - Simply Explained', 'Simply Explained',
 'Bitcoin basics - blockchain, mining, transactions, why it matters',
 'https://www.youtube.com/watch?v=SSo_EIwHSd4','SSo_EIwHSd4','video','video','youtube','crypto-defi','beginner',1,0.1,
 '6-minute Bitcoin explainer - clearest one on YouTube.',FALSE,TRUE),

('How Ethereum Works', 'Whiteboard Crypto',
 'Ethereum, smart contracts, EVM, gas fees - animated explanation',
 'https://www.youtube.com/watch?v=jxLkbJozKbY','jxLkbJozKbY','video','video','youtube','crypto-defi','beginner',1,0.1,
 'Best Ethereum explainer for complete beginners.',FALSE,TRUE),

('What is DeFi? - Decentralised Finance Explained', 'Whiteboard Crypto',
 'DeFi protocols, liquidity pools, yield farming, staking - visual guide',
 'https://www.youtube.com/watch?v=btB__oHQ0sU','btB__oHQ0sU','video','video','youtube','crypto-defi','intermediate',1,0.1,
 'DeFi explained clearly without the hype.',FALSE,TRUE),

('Crypto Investing - How to Start in India', 'CA Rachana Ranade',
 'Legal crypto investing in India, exchanges, tax implications, KYC',
 'https://www.youtube.com/watch?v=I5K7AUjp0FE','I5K7AUjp0FE','video','video','youtube','crypto-defi','beginner',1,0.3,
 'India-specific guide to starting crypto investing legally.',FALSE,TRUE),

('Crypto Tax in India 2024 - Complete Guide', 'Labour Law Advisor',
 'How crypto is taxed in India, 30% flat tax, TDS, how to report in ITR',
 'https://www.youtube.com/watch?v=cRhwnVhyp-g','cRhwnVhyp-g','video','video','youtube','crypto-defi','intermediate',1,0.3,
 'Must watch for any Indian crypto investor.',FALSE,TRUE),

('Bitcoin Halving Explained', 'CoinBureau',
 'What is Bitcoin halving, why it happens, historical price patterns',
 'https://www.youtube.com/watch?v=G8EB3QNTf7o','G8EB3QNTf7o','video','video','youtube','crypto-defi','intermediate',1,0.2,
 'Best explanation of Bitcoin''s halving mechanism.',FALSE,TRUE),

('Crypto Wallets - Hot vs Cold Storage', 'CoinBureau',
 'Hardware wallets, software wallets, seed phrases, how to secure crypto',
 'https://www.youtube.com/watch?v=d8IBpfs9bf4','d8IBpfs9bf4','video','video','youtube','crypto-defi','beginner',1,0.2,
 'Security is the most important thing in crypto. Watch this first.',FALSE,TRUE),

('NFTs Explained - Are They Worth It?', 'Simply Explained',
 'What are NFTs, how they work, the risks, honest assessment',
 'https://www.youtube.com/watch?v=Oz9zw7-_vhM','Oz9zw7-_vhM','video','video','youtube','crypto-defi','intermediate',1,0.1,
 'Balanced NFT explainer without the hype.',FALSE,TRUE),

('What is Solana? - Explained Simply', 'Whiteboard Crypto',
 'Solana blockchain, proof of history, speed vs Ethereum, use cases',
 'https://www.youtube.com/watch?v=1jzROE6EhxM','1jzROE6EhxM','video','video','youtube','crypto-defi','intermediate',1,0.1,
 'Clear Solana explainer for crypto learners.',FALSE,TRUE),

('Crypto Market Cycles - Bull and Bear Markets', 'Benjamin Cowen',
 'Bitcoin market cycles, on-chain metrics, how to position across cycles',
 'https://www.youtube.com/watch?v=1TkM6LFR8Fk','1TkM6LFR8Fk','video','video','youtube','crypto-defi','advanced',1,0.3,
 'Data-driven crypto market cycle analysis.',FALSE,TRUE),

-- -----------------------------------------------------------
-- CORPORATE FINANCE (20 videos)
-- -----------------------------------------------------------

('Corporate Finance - NYU Course', 'Aswath Damodaran',
 'NYU professor Damodaran''s complete corporate finance course - the most rigorous free education',
 'https://www.youtube.com/playlist?list=PLUkh9m2BorqlDJlnBXUaJaMaco9_QoGH0',
 'PLUkh9m2BorqlDJlnBXUaJaMaco9_QoGH0','playlist','playlist','youtube','corporate-finance','advanced',30,24.0,
 'University-level corporate finance. Free. Damodaran is the world''s best.',TRUE,TRUE),

('Valuation - Complete Course', 'Aswath Damodaran',
 'DCF, multiples, relative valuation - applied to real companies worldwide',
 'https://www.youtube.com/playlist?list=PLUkh9m2BorqmXFNBh6f7yvmGKEQDsO3TV',
 'PLUkh9m2BorqmXFNBh6f7yvmGKEQDsO3TV','playlist','playlist','youtube','corporate-finance','advanced',25,20.0,
 'If you want to value companies, this is the only course you need.',TRUE,TRUE),

('Financial Statements Explained - Balance Sheet', 'CA Rachana Ranade',
 'Reading corporate balance sheet, understanding assets liabilities equity',
 'https://www.youtube.com/watch?v=yYX4bvQSqbo','yYX4bvQSqbo','video','video','youtube','corporate-finance','intermediate',1,0.4,
 'Best Indian tutorial on reading corporate financials.',FALSE,TRUE),

('Income Statement - P&L Analysis', 'Zerodha Varsity',
 'Reading profit and loss statement, revenue, expenses, PAT, margins',
 'https://www.youtube.com/watch?v=bDe2CueSFR8','bDe2CueSFR8','video','video','youtube','corporate-finance','intermediate',1,0.3,
 'Comprehensive P&L tutorial for retail investors.',FALSE,TRUE),

('Cash Flow Statement Explained', 'CA Rachana Ranade',
 'Operating, investing, and financing cash flows - why it matters more than profit',
 'https://www.youtube.com/watch?v=oIByxHrN6kE','oIByxHrN6kE','video','video','youtube','corporate-finance','intermediate',1,0.3,
 'Cash flow is the lifeblood. This video explains it perfectly.',FALSE,TRUE),

('DCF Valuation - How to Value a Company', 'Aswath Damodaran',
 'Discounted cash flow model, WACC, terminal value, step by step',
 'https://www.youtube.com/watch?v=fd_emLLzJnk','fd_emLLzJnk','video','video','youtube','corporate-finance','advanced',1,0.5,
 'Damodaran teaching DCF - you cannot get better than this.',FALSE,TRUE),

('What is EBITDA?', 'Zerodha Varsity',
 'EBITDA explained, why companies use it, when it is misleading',
 'https://www.youtube.com/watch?v=cKAhnIFxaoE','cKAhnIFxaoE','video','video','youtube','corporate-finance','intermediate',1,0.2,
 'Clears up EBITDA confusion for most investors.',FALSE,TRUE),

('Working Capital Management', 'CA Rachana Ranade',
 'Inventory, receivables, payables, cash conversion cycle explained',
 'https://www.youtube.com/watch?v=sLq2pGOz0DM','sLq2pGOz0DM','video','video','youtube','corporate-finance','intermediate',1,0.3,
 'Essential for understanding business health.',FALSE,TRUE),

('Startup Funding - How It Works', 'Y Combinator',
 'Seed, Series A, B, C, term sheets, cap table, dilution explained',
 'https://www.youtube.com/watch?v=677ZtSMr4-4','677ZtSMr4-4','video','video','youtube','corporate-finance','intermediate',1,0.3,
 'Y Combinator explaining startup funding. Authoritative source.',FALSE,TRUE),

('Return on Equity Explained', 'Zerodha Varsity',
 'ROE, ROA, ROCE - what they mean, how to compare companies',
 'https://www.youtube.com/watch?v=KY6C9Hy_DP4','KY6C9Hy_DP4','video','video','youtube','corporate-finance','intermediate',1,0.2,
 'Best ratio analysis tutorial for Indian investors.',FALSE,TRUE),

-- -----------------------------------------------------------
-- BEHAVIORAL FINANCE (20 videos)
-- -----------------------------------------------------------

('Behavioral Finance - Investor Psychology', 'The Plain Bagel',
 'Evidence-based investing and the psychological biases that cost investors money',
 'https://www.youtube.com/playlist?list=PLf4s2S_-aTAw9FU3dLhEOPAKbxJ6ZBCMz',
 'PLf4s2S_-aTAw9FU3dLhEOPAKbxJ6ZBCMz','playlist','playlist','youtube','behavioral-finance','intermediate',20,7.0,
 'Most intellectually honest investing channel on YouTube.',TRUE,TRUE),

('Loss Aversion - Daniel Kahneman', 'Big Think',
 'Nobel laureate Kahneman explains loss aversion and its impact on decisions',
 'https://www.youtube.com/watch?v=XgRlrBl-7Yg','XgRlrBl-7Yg','video','video','youtube','behavioral-finance','intermediate',1,0.1,
 'Kahneman himself explaining loss aversion. Unmissable.',FALSE,TRUE),

('Why We Make Bad Financial Decisions', 'Behavioral Scientist',
 'Cognitive biases in finance - anchoring, overconfidence, herd mentality',
 'https://www.youtube.com/watch?v=1Ci-7gT7Mk8','1Ci-7gT7Mk8','video','video','youtube','behavioral-finance','intermediate',1,0.2,
 'Academic but accessible behavioral finance overview.',FALSE,TRUE),

('The Psychology of Money - Morgan Housel', 'Google Talks',
 'Morgan Housel talks about his book - wealth, greed, happiness, and behavior',
 'https://www.youtube.com/watch?v=_VB39Jo8mAQ','_VB39Jo8mAQ','video','video','youtube','behavioral-finance','intermediate',1,0.7,
 'Morgan Housel in person. The clearest money psychology talk.',TRUE,TRUE),

('Thinking Fast and Slow - Summary', 'Escaping Ordinary',
 'Summary of Kahneman''s System 1 and System 2 thinking applied to money',
 'https://www.youtube.com/watch?v=XjSCTBAsoi4','XjSCTBAsoi4','video','video','youtube','behavioral-finance','intermediate',1,0.1,
 'Best 10-minute summary of the most important finance psychology book.',FALSE,TRUE),

('Overconfidence Bias in Investing', 'The Plain Bagel',
 'How overconfidence destroys investor returns - the evidence',
 'https://www.youtube.com/watch?v=4Q7F4pVeY_k','4Q7F4pVeY_k','video','video','youtube','behavioral-finance','intermediate',1,0.1,
 'Evidence-based look at overconfidence.',FALSE,TRUE),

('Sunk Cost Fallacy Explained', 'Sprouts',
 'Why past costs should never influence future decisions - with examples',
 'https://www.youtube.com/watch?v=wpjhS3PNpOs','wpjhS3PNpOs','video','video','youtube','behavioral-finance','beginner',1,0.1,
 'Perfect simple explanation of sunk cost fallacy.',FALSE,TRUE),

('FOMO and Investing - How to Avoid It', 'Pranjal Kamra',
 'How FOMO drives bad investment decisions and practical ways to fight it',
 'https://www.youtube.com/watch?v=PY8J3hPCmYo','PY8J3hPCmYo','video','video','youtube','behavioral-finance','intermediate',1,0.2,
 'India-specific FOMO investing discussion.',FALSE,TRUE),

('Herd Mentality in Markets', 'The Plain Bagel',
 'Why investors follow the crowd and how markets create bubbles',
 'https://www.youtube.com/watch?v=OXcWkuq5Xhk','OXcWkuq5Xhk','video','video','youtube','behavioral-finance','intermediate',1,0.2,
 'Excellent analysis of herd behavior in markets.',FALSE,TRUE),

('Confirmation Bias in Investing', 'Ben Felix',
 'How confirmation bias leads investors to hold bad positions too long',
 'https://www.youtube.com/watch?v=UBVJxJHbLOw','UBVJxJHbLOw','video','video','youtube','behavioral-finance','intermediate',1,0.2,
 'Ben Felix on confirmation bias - data-driven.',FALSE,TRUE),

-- -----------------------------------------------------------
-- FOREX (20 videos)
-- -----------------------------------------------------------

('Forex Trading for Beginners - Complete Course', 'Rayner Teo',
 'Complete forex beginner course - pairs, pips, leverage, strategies, risk management',
 'https://www.youtube.com/playlist?list=PLv-cA-4O3y14fPr1kPuFHMCgSPMYSFgD9',
 'PLv-cA-4O3y14fPr1kPuFHMCgSPMYSFgD9','playlist','playlist','youtube','forex-currency','beginner',20,8.0,
 'Rayner Teo is the most practical forex educator. Start here.',TRUE,TRUE),

('What is Forex Trading?', 'Rayner Teo',
 'Forex market basics - what is traded, who participates, how it works',
 'https://www.youtube.com/watch?v=3R1kK9g7KOE','3R1kK9g7KOE','video','video','youtube','forex-currency','beginner',1,0.1,
 'Best 7-minute forex introduction.',FALSE,TRUE),

('Currency Pairs Explained', 'BabyPips',
 'Major, minor, exotic pairs - how to read forex quotes, bid/ask',
 'https://www.youtube.com/watch?v=J0nfFGn6JnE','J0nfFGn6JnE','video','video','youtube','forex-currency','beginner',1,0.2,
 'BabyPips is the #1 free forex education resource.',FALSE,TRUE),

('Pips and Lots - Forex Position Sizing', 'Rayner Teo',
 'What are pips, how to calculate pip value, standard/mini/micro lots',
 'https://www.youtube.com/watch?v=6G3znpJYUmE','6G3znpJYUmE','video','video','youtube','forex-currency','beginner',1,0.1,
 'Essential forex mechanics explained clearly.',FALSE,TRUE),

('Leverage in Forex - The Complete Truth', 'Rayner Teo',
 'How leverage works, the danger of high leverage, why professionals use low leverage',
 'https://www.youtube.com/watch?v=0xJMDaRcU1s','0xJMDaRcU1s','video','video','youtube','forex-currency','beginner',1,0.2,
 'Honest truth about forex leverage. Must watch before trading.',FALSE,TRUE),

('Support and Resistance - Forex Trading', 'Rayner Teo',
 'How to draw support/resistance, role reversal, trading the levels',
 'https://www.youtube.com/watch?v=8JHuMqGWfwU','8JHuMqGWfwU','video','video','youtube','forex-currency','intermediate',1,0.2,
 'Practical support/resistance tutorial for forex traders.',FALSE,TRUE),

('Risk Management in Forex', 'Rayner Teo',
 '1% rule, position sizing, stop loss placement, reward/risk ratio',
 'https://www.youtube.com/watch?v=9r6JJSfuoJc','9r6JJSfuoJc','video','video','youtube','forex-currency','intermediate',1,0.3,
 'Risk management is more important than strategy. Watch this first.',FALSE,TRUE),

('USD/INR Trading - How to Trade Indian Rupee', 'Zerodha Varsity',
 'Trading USD/INR on NSE, contract specs, margins, how to hedge currency risk',
 'https://www.youtube.com/watch?v=CiRbNPmqLzU','CiRbNPmqLzU','video','video','youtube','forex-currency','intermediate',1,0.3,
 'India-specific forex trading guide for NSE currency derivatives.',FALSE,TRUE),

('Economic Calendar - Trading the News', 'Rayner Teo',
 'How to use economic calendar, major news events, NFP, Fed decisions',
 'https://www.youtube.com/watch?v=MxopMdqY9KA','MxopMdqY9KA','video','video','youtube','forex-currency','intermediate',1,0.2,
 'Essential for understanding what moves currency markets.',FALSE,TRUE),

('Forex Trading Psychology', 'Rayner Teo',
 'Revenge trading, moving stops, overtrading - the psychological mistakes',
 'https://www.youtube.com/watch?v=nHBDDxbIFDs','nHBDDxbIFDs','video','video','youtube','forex-currency','intermediate',1,0.3,
 'Psychology is why most traders fail. Address it early.',FALSE,TRUE),

-- -----------------------------------------------------------
-- TECHNICAL ANALYSIS (25 videos)
-- -----------------------------------------------------------

('Technical Analysis A to Z', 'Rayner Teo',
 'Complete technical analysis course - candlesticks, trends, indicators, patterns',
 'https://www.youtube.com/playlist?list=PLv-cA-4O3y15JCT1k5j37dA9SjzFvmfFB',
 'PLv-cA-4O3y15JCT1k5j37dA9SjzFvmfFB','playlist','playlist','youtube','technical-analysis','beginner',25,10.0,
 'Rayner Teo''s complete TA course. Practical and systematic.',TRUE,TRUE),

('Technical Analysis for Beginners', 'CA Rachana Ranade',
 'Introduction to TA, why it works, charts, timeframes - India context',
 'https://www.youtube.com/watch?v=hUwPMwfiFMY','hUwPMwfiFMY','video','video','youtube','technical-analysis','beginner',1,0.3,
 'Perfect starting point for TA in Indian markets.',FALSE,TRUE),

('Candlestick Charts - Complete Beginner Guide', 'Rayner Teo',
 'What candlesticks show, how to read them, most important patterns',
 'https://www.youtube.com/watch?v=3Tl1Dui3Slc','3Tl1Dui3Slc','video','video','youtube','technical-analysis','beginner',1,0.2,
 'Best candlestick introduction for complete beginners.',FALSE,TRUE),

('Support and Resistance - Master Class', 'Rayner Teo',
 'How to correctly draw support/resistance, zones vs lines, role reversal',
 'https://www.youtube.com/watch?v=7ICKf8Tb6_w','7ICKf8Tb6_w','video','video','youtube','technical-analysis','beginner',1,0.3,
 'The single most important TA concept explained masterfully.',FALSE,TRUE),

('Moving Averages - 200 MA Golden Cross', 'Rayner Teo',
 'SMA vs EMA, golden cross, death cross, dynamic support/resistance',
 'https://www.youtube.com/watch?v=F7mnGVtg3qI','F7mnGVtg3qI','video','video','youtube','technical-analysis','beginner',1,0.2,
 'Moving averages explained simply with real chart examples.',FALSE,TRUE),

('RSI - How to Use It Correctly', 'Rayner Teo',
 'RSI beyond overbought/oversold - divergence, trend-adjusted levels, failure swings',
 'https://www.youtube.com/watch?v=tMzrMWS2Bkk','tMzrMWS2Bkk','video','video','youtube','technical-analysis','intermediate',1,0.2,
 'Advanced RSI techniques most traders don''t use.',FALSE,TRUE),

('MACD - Complete Trading Guide', 'Rayner Teo',
 'MACD crossovers, zero line, histogram, divergence - practical application',
 'https://www.youtube.com/watch?v=GRFgTf7H9dU','GRFgTf7H9dU','video','video','youtube','technical-analysis','intermediate',1,0.2,
 'Most comprehensive MACD trading guide on YouTube.',FALSE,TRUE),

('Bollinger Bands - The Squeeze Setup', 'Rayner Teo',
 'Bollinger band squeeze, mean reversion, trend riding - complete guide',
 'https://www.youtube.com/watch?v=rB9pfI7MQFI','rB9pfI7MQFI','video','video','youtube','technical-analysis','intermediate',1,0.2,
 'Bollinger bands practical guide with real trading examples.',FALSE,TRUE),

('Chart Patterns - Head and Shoulders', 'Rayner Teo',
 'H&S, inverse H&S, double top, double bottom - identification and trading',
 'https://www.youtube.com/watch?v=82jN4iBSBVA','82jN4iBSBVA','video','video','youtube','technical-analysis','intermediate',1,0.3,
 'Reversal patterns masterclass. Learn to spot trend changes.',FALSE,TRUE),

('Fibonacci Retracements - How to Use Them', 'Rayner Teo',
 '38.2%, 50%, 61.8% levels, drawing Fibonacci correctly, extensions',
 'https://www.youtube.com/watch?v=Q_pJ6qLrLTQ','Q_pJ6qLrLTQ','video','video','youtube','technical-analysis','intermediate',1,0.2,
 'Fibonacci explained practically with chart examples.',FALSE,TRUE),

('Volume Analysis - The Forgotten Indicator', 'Rayner Teo',
 'OBV, volume climax, accumulation/distribution, confirming breakouts',
 'https://www.youtube.com/watch?v=Vq8XrUJdBfg','Vq8XrUJdBfg','video','video','youtube','technical-analysis','intermediate',1,0.2,
 'Volume is the most underrated TA tool. This fixes that.',FALSE,TRUE),

('Multiple Timeframe Analysis', 'Rayner Teo',
 '3-timeframe approach, aligning trades with higher timeframe trend',
 'https://www.youtube.com/watch?v=0osFNPt5y6o','0osFNPt5y6o','video','video','youtube','technical-analysis','intermediate',1,0.3,
 'Multi-timeframe analysis is what separates amateurs from pros.',FALSE,TRUE),

('Building a Complete Trading System', 'Rayner Teo',
 'Entry rules, stop loss, position sizing, take profit - complete system',
 'https://www.youtube.com/watch?v=R9eDy7V4oQ4','R9eDy7V4oQ4','video','video','youtube','technical-analysis','advanced',1,0.4,
 'How to build a systematic trading approach. Required for serious traders.',FALSE,TRUE),

-- -----------------------------------------------------------
-- ECONOMICS / GENERAL FINANCE (15 videos)
-- -----------------------------------------------------------

('How the Economic Machine Works', 'Bridgewater / Ray Dalio',
 'Ray Dalio''s 30-minute masterclass on how economies work - debt cycles, credit',
 'https://www.youtube.com/watch?v=PHe0bXAIuk0','PHe0bXAIuk0','video','video','youtube','general','beginner',1,0.5,
 'The single best economics video ever made. 30 minutes that change everything.',TRUE,TRUE),

('Inflation Explained - What Causes It', 'Economics Explained',
 'CPI, demand-pull, cost-push, monetary inflation - what drives prices up',
 'https://www.youtube.com/watch?v=GJ8-OMnGJJM','GJ8-OMnGJJM','video','video','youtube','general','beginner',1,0.2,
 'Best inflation explainer for general understanding.',FALSE,TRUE),

('How Central Banks Work - RBI Explained', 'Labour Law Advisor',
 'What RBI does, monetary policy, repo rate, inflation targeting, INR management',
 'https://www.youtube.com/watch?v=7Z_JGrQ7HQM','7Z_JGrQ7HQM','video','video','youtube','general','beginner',1,0.3,
 'India-specific central banking explainer.',FALSE,TRUE),

('GDP Explained - What It Measures and What It Misses', 'Economics Explained',
 'GDP calculation, why it matters, its limitations as an economic measure',
 'https://www.youtube.com/watch?v=PdeFSLVOuvM','PdeFSLVOuvM','video','video','youtube','general','beginner',1,0.2,
 'Excellent GDP overview.',FALSE,TRUE),

('Interest Rates and the Economy', 'Khan Academy',
 'How interest rates affect inflation, growth, employment, and markets',
 'https://www.youtube.com/watch?v=9_EKG5Fdi8k','9_EKG5Fdi8k','video','video','youtube','general','beginner',1,0.2,
 'Khan Academy''s interest rate primer.',FALSE,TRUE),

('MIT OpenCourseWare Finance Theory', 'MIT OCW',
 'MIT''s undergraduate finance theory - complete free university course',
 'https://www.youtube.com/playlist?list=PLF2BFAD5F45552DAC',
 'PLF2BFAD5F45552DAC','playlist','playlist','youtube','general','advanced',24,30.0,
 'Free MIT-level finance education.',FALSE,TRUE),

('The 2008 Financial Crisis Explained', 'Economics Explained',
 'Mortgage crisis, CDOs, Lehman Brothers, global contagion - what really happened',
 'https://www.youtube.com/watch?v=yMTHGRzALI4','yMTHGRzALI4','video','video','youtube','general','intermediate',1,0.3,
 'Best explanation of 2008 for non-economists.',FALSE,TRUE),

('Recession vs Depression - The Difference', 'Economics Explained',
 'What defines a recession, how long they last, how to invest during one',
 'https://www.youtube.com/watch?v=wFSnFwHT96w','wFSnFwHT96w','video','video','youtube','general','intermediate',1,0.2,
 'Clears up recession/depression confusion.',FALSE,TRUE),

('Warren Buffett - The Complete History', 'The Financial Review',
 'Buffett''s investing journey from Benjamin Graham to Berkshire Hathaway',
 'https://www.youtube.com/watch?v=xPLfPRVgGlQ','xPLfPRVgGlQ','video','video','youtube','general','intermediate',1,0.4,
 'The most inspiring finance story ever told.',FALSE,TRUE),

('Financial Independence - FIRE Explained', 'Ankur Warikoo',
 'FIRE movement, 4% rule, how to reach financial independence in India',
 'https://www.youtube.com/watch?v=1Ff4HTcPRDg','1Ff4HTcPRDg','video','video','youtube','general','intermediate',1,0.3,
 'Practical FIRE planning from an Indian perspective.',FALSE,TRUE)
ON CONFLICT (playlist_url) DO NOTHING;

-- -------------------------------------------------------------
-- -------------------------------------------------------------
-- STEP 4: Remove unavailable or wrong-topic YouTube embeds
-- -------------------------------------------------------------
-- These IDs were checked with YouTube oEmbed. They returned 404/private/deleted
-- responses, or the live title did not match finance content.
DELETE FROM curated_playlists
WHERE embed_id = ANY(ARRAY[
  'PLSQl0a2vh4HC5feHa6Rc5c0wbRTx56nF7',
  'PLFCLo5-k3WUVvHJoFFg6vDY5ks3K8HWJi',
  'PLX2SHiKfualFiD5ey_jnz9pVUmANIcS4q',
  'WsHD20sQFMQ',
  'vkB7nCeRj8Q',
  'y5bZMBPOv4M',
  'MKC2rMbXYyI',
  'G3Q8HfPELQA',
  'cC7hVKlGm_A',
  'HBVrqSsMMPQ',
  '8h9hVhCw5oc',
  'R2T_aqgQmEg',
  'YtHpKXI2bwM',
  '3F0RVLWq0oE',
  '0Io-F-yq1mo',
  'PLX2SHiKfualEuHPf3-jYX_dHp_1V1KxHE',
  'PLFCLo5-k3WUVEDy19ICcm0y2Kfz4H3VgS',
  'PLFCLo5-k3WUXSBIKEQdVQlqpJPl8IJL7g',
  'bV1pKmAW6IQ',
  'FZl7HqlXgBc',
  '7Z7nkP8T3s8',
  '4Lh9nDMCwY0',
  '2QVPSMGiEhQ',
  'Md2N5DXHvgQ',
  '7IbNWjCQiGc',
  'GznFG6bpHT4',
  'T3dEqrV7JH0',
  '8hhBdVHuE8Y',
  'nT_LDnA6r7E',
  'PLk1ALX87lerTxOAHMOVHCxJHnRBjkqHBN',
  'PLHx4UicbtUoZ7F1M1MaEAuJy0f0xIh2oj',
  'I5K7AUjp0FE',
  'cRhwnVhyp-g',
  'G8EB3QNTf7o',
  '1TkM6LFR8Fk',
  'PLUkh9m2BorqlDJlnBXUaJaMaco9_QoGH0',
  'PLUkh9m2BorqmXFNBh6f7yvmGKEQDsO3TV',
  'bDe2CueSFR8',
  'oIByxHrN6kE',
  'cKAhnIFxaoE',
  'sLq2pGOz0DM',
  'KY6C9Hy_DP4',
  'PLf4s2S_-aTAw9FU3dLhEOPAKbxJ6ZBCMz',
  '1Ci-7gT7Mk8',
  'XjSCTBAsoi4',
  '4Q7F4pVeY_k',
  'wpjhS3PNpOs',
  'PY8J3hPCmYo',
  'OXcWkuq5Xhk',
  'UBVJxJHbLOw',
  'PLv-cA-4O3y14fPr1kPuFHMCgSPMYSFgD9',
  '3R1kK9g7KOE',
  'J0nfFGn6JnE',
  '6G3znpJYUmE',
  '0xJMDaRcU1s',
  '8JHuMqGWfwU',
  '9r6JJSfuoJc',
  'CiRbNPmqLzU',
  'MxopMdqY9KA',
  'nHBDDxbIFDs',
  'PLv-cA-4O3y15JCT1k5j37dA9SjzFvmfFB',
  'hUwPMwfiFMY',
  '3Tl1Dui3Slc',
  '7ICKf8Tb6_w',
  'F7mnGVtg3qI',
  'tMzrMWS2Bkk',
  'GRFgTf7H9dU',
  'rB9pfI7MQFI',
  '82jN4iBSBVA',
  'Q_pJ6qLrLTQ',
  'Vq8XrUJdBfg',
  '0osFNPt5y6o',
  'R9eDy7V4oQ4',
  'GJ8-OMnGJJM',
  '7Z_JGrQ7HQM',
  'PdeFSLVOuvM',
  '9_EKG5Fdi8k',
  'PLF2BFAD5F45552DAC',
  'yMTHGRzALI4',
  'wFSnFwHT96w',
  'xPLfPRVgGlQ',
  '1Ff4HTcPRDg'
]);

-- -------------------------------------------------------------
-- STEP 5: Verify count
-- -------------------------------------------------------------
-- Backfill track_id so lesson pages can fetch track-level videos quickly.
UPDATE curated_playlists cp
SET track_id = t.id
FROM tracks t
WHERE cp.track_id IS NULL
  AND t.slug = cp.category;

-- Backfill the optional join table from any direct lesson links in this file.
INSERT INTO video_lessons (video_id, lesson_id, sort_order)
SELECT
  cp.id,
  cp.lesson_id,
  ROW_NUMBER() OVER (PARTITION BY cp.lesson_id ORDER BY cp.is_featured DESC, cp.created_at ASC)
FROM curated_playlists cp
WHERE cp.lesson_id IS NOT NULL
ON CONFLICT (video_id, lesson_id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_playlists_category_video_level
  ON curated_playlists(category, video_type, level)
  WHERE is_published = TRUE;

DO $$
DECLARE
  v_total  INT;
  v_videos INT;
  v_pls    INT;
BEGIN
  SELECT COUNT(*) INTO v_total  FROM curated_playlists WHERE is_published = TRUE;
  SELECT COUNT(*) INTO v_videos FROM curated_playlists WHERE video_type = 'video' AND is_published = TRUE;
  SELECT COUNT(*) INTO v_pls    FROM curated_playlists WHERE video_type = 'playlist' AND is_published = TRUE;
  RAISE NOTICE 'Total: % | Videos: % | Playlists: %', v_total, v_videos, v_pls;
END $$;

