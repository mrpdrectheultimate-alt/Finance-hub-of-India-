-- ============================================================
-- FinanceHub Phase 10: Multimedia Learning + Paper Trading
-- Run AFTER sql/phase9/analytics_views.sql
-- ============================================================

-- =============================================================
-- TABLE 1: Curated YouTube playlists and free resource links
-- =============================================================
CREATE TABLE IF NOT EXISTS curated_playlists (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  description  TEXT,
  channel_name TEXT NOT NULL,
  playlist_url TEXT NOT NULL,          -- Full YouTube URL
  embed_id     TEXT NOT NULL,          -- YouTube playlist ID (PLxxx) or video ID
  embed_type   TEXT DEFAULT 'playlist' CHECK (embed_type IN ('playlist','video','channel')),
  platform     TEXT DEFAULT 'youtube'  CHECK (platform IN ('youtube','khanacademy','investopedia','coursera','other')),
  category     TEXT NOT NULL           CHECK (category IN ('personal-finance','trading-markets','crypto-defi','corporate-finance','forex','behavioral-finance','general')),
  level        TEXT DEFAULT 'beginner' CHECK (level IN ('beginner','intermediate','advanced','all')),
  video_count  INT  DEFAULT 0,
  duration_hrs DECIMAL(4,1),           -- approximate total hours
  language     TEXT DEFAULT 'english',
  is_free      BOOL DEFAULT TRUE,
  is_featured  BOOL DEFAULT FALSE,
  is_published BOOL DEFAULT TRUE,
  curator_note TEXT,                   -- Why this playlist is recommended
  lesson_id    UUID REFERENCES lessons(id) ON DELETE SET NULL,   -- link to specific lesson
  track_id     UUID REFERENCES tracks(id) ON DELETE SET NULL,    -- link to entire track
  view_count   INT  DEFAULT 0,         -- track engagement
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE curated_playlists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "playlists_public_read" ON curated_playlists;
CREATE POLICY "playlists_public_read" ON curated_playlists FOR SELECT USING (is_published = TRUE);

-- =============================================================
-- TABLE 2: Finance book library
-- =============================================================
CREATE TABLE IF NOT EXISTS books (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title          TEXT NOT NULL,
  author         TEXT NOT NULL,
  cover_url      TEXT,
  description    TEXT NOT NULL,
  key_takeaways  JSONB DEFAULT '[]',   -- array of 5-7 bullet points
  why_read       TEXT,                 -- one paragraph on who should read it
  best_for       TEXT[],              -- ['beginner', 'investor', 'founder']
  category       TEXT NOT NULL,
  difficulty     TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','advanced')),
  amazon_url     TEXT,                -- affiliate/purchase link
  free_pdf_url   TEXT,               -- only if legally free (public domain / author-released)
  summary_pdf_url TEXT,              -- our own generated summary PDF
  goodreads_url  TEXT,
  isbn           TEXT,
  pages          INT,
  year_published INT,
  is_published   BOOL DEFAULT TRUE,
  is_free_legal  BOOL DEFAULT FALSE, -- true only if legally free to download
  track_id       UUID REFERENCES tracks(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "books_public_read" ON books;
CREATE POLICY "books_public_read" ON books FOR SELECT USING (is_published = TRUE);

-- =============================================================
-- TABLE 3: User book interactions
-- =============================================================
CREATE TABLE IF NOT EXISTS user_book_reads (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  book_id     UUID REFERENCES books(id) ON DELETE CASCADE,
  status      TEXT DEFAULT 'want_to_read' CHECK (status IN ('want_to_read','reading','completed')),
  xp_awarded  BOOL DEFAULT FALSE,
  started_at  TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, book_id)
);

ALTER TABLE user_book_reads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "book_reads_own" ON user_book_reads;
CREATE POLICY "book_reads_own" ON user_book_reads FOR ALL USING (auth.uid() = user_id);

-- =============================================================
-- TABLE 4: Paper trading portfolios (Forex + Crypto)
-- =============================================================
CREATE TABLE IF NOT EXISTS paper_portfolios (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  market_type   TEXT NOT NULL CHECK (market_type IN ('forex','crypto')),
  cash_balance  NUMERIC(16,4) DEFAULT 100000.00,   -- Rs 1 lakh fake money
  total_pnl     NUMERIC(16,4) DEFAULT 0.00,
  realized_pnl  NUMERIC(16,4) DEFAULT 0.00,
  trades_count  INT DEFAULT 0,
  wins_count    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, market_type)
);

ALTER TABLE paper_portfolios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "portfolios_own" ON paper_portfolios;
CREATE POLICY "portfolios_own" ON paper_portfolios FOR ALL USING (auth.uid() = user_id);

-- =============================================================
-- TABLE 5: Paper trading orders
-- =============================================================
CREATE TABLE IF NOT EXISTS paper_orders (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id  UUID REFERENCES paper_portfolios(id) ON DELETE CASCADE,
  symbol        TEXT NOT NULL,          -- 'EURUSD', 'BTCUSDT', 'GBPUSD'
  order_type    TEXT NOT NULL CHECK (order_type IN ('buy','sell')),
  quantity      NUMERIC(18,8) NOT NULL,
  entry_price   NUMERIC(18,8) NOT NULL,
  exit_price    NUMERIC(18,8),
  stop_loss     NUMERIC(18,8),
  take_profit   NUMERIC(18,8),
  leverage      INT DEFAULT 1,
  margin_used   NUMERIC(16,4),
  status        TEXT DEFAULT 'open' CHECK (status IN ('open','closed','cancelled')),
  pnl           NUMERIC(16,4),
  pnl_pct       NUMERIC(8,2),
  lesson_context TEXT,                 -- which lesson triggered this trade
  opened_at     TIMESTAMPTZ DEFAULT NOW(),
  closed_at     TIMESTAMPTZ
);

ALTER TABLE paper_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orders_own" ON paper_orders;
CREATE POLICY "orders_own" ON paper_orders FOR ALL USING (
  portfolio_id IN (SELECT id FROM paper_portfolios WHERE user_id = auth.uid())
);

-- =============================================================
-- TABLE 6: User downloaded lesson PDFs
-- =============================================================
CREATE TABLE IF NOT EXISTS user_downloads (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id   UUID REFERENCES lessons(id) ON DELETE CASCADE,
  file_type   TEXT DEFAULT 'pdf' CHECK (file_type IN ('pdf','notes','worksheet')),
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id, file_type)
);

ALTER TABLE user_downloads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "downloads_own" ON user_downloads;
CREATE POLICY "downloads_own" ON user_downloads FOR ALL USING (auth.uid() = user_id);

-- =============================================================
-- INDEXES
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_playlists_category   ON curated_playlists(category, level);
CREATE INDEX IF NOT EXISTS idx_playlists_track      ON curated_playlists(track_id);
CREATE INDEX IF NOT EXISTS idx_playlists_lesson     ON curated_playlists(lesson_id);
CREATE INDEX IF NOT EXISTS idx_books_category       ON books(category, difficulty);
CREATE INDEX IF NOT EXISTS idx_books_track          ON books(track_id);
CREATE INDEX IF NOT EXISTS idx_paper_portfolios_user ON paper_portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_orders_portfolio ON paper_orders(portfolio_id, status);

-- Duplicate-safe seed constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'books_title_author_key'
  ) THEN
    ALTER TABLE books ADD CONSTRAINT books_title_author_key UNIQUE (title, author);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'curated_playlists_playlist_url_key'
  ) THEN
    ALTER TABLE curated_playlists ADD CONSTRAINT curated_playlists_playlist_url_key UNIQUE (playlist_url);
  END IF;
END;
$$;

-- =============================================================
-- FUNCTION: Initialize paper portfolio for new user
-- =============================================================
CREATE OR REPLACE FUNCTION init_paper_portfolio(
  p_user_id    UUID,
  p_market_type TEXT
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_id UUID;
BEGIN
  INSERT INTO paper_portfolios (user_id, market_type, cash_balance)
  VALUES (p_user_id, p_market_type, 100000.00)
  ON CONFLICT (user_id, market_type) DO NOTHING
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    SELECT id INTO v_id FROM paper_portfolios WHERE user_id=p_user_id AND market_type=p_market_type;
  END IF;
  RETURN v_id;
END; $$;

-- =============================================================
-- FUNCTION: Close paper trade and calculate P&L
-- =============================================================
CREATE OR REPLACE FUNCTION close_paper_trade(
  p_order_id   UUID,
  p_exit_price NUMERIC
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_order      paper_orders%ROWTYPE;
  v_portfolio  paper_portfolios%ROWTYPE;
  v_pnl        NUMERIC;
  v_pnl_pct    NUMERIC;
BEGIN
  SELECT * INTO v_order FROM paper_orders WHERE id = p_order_id AND status = 'open';
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'reason', 'Order not found or already closed'); END IF;

  SELECT * INTO v_portfolio FROM paper_portfolios WHERE id = v_order.portfolio_id;
  IF NOT (auth.uid() = v_portfolio.user_id) THEN RETURN jsonb_build_object('success', false, 'reason', 'Unauthorised'); END IF;

  -- Calculate P&L based on market type
  IF v_order.order_type = 'buy' THEN
    v_pnl := (p_exit_price - v_order.entry_price) * v_order.quantity;
  ELSE
    v_pnl := (v_order.entry_price - p_exit_price) * v_order.quantity;
  END IF;

  v_pnl_pct := CASE WHEN v_order.entry_price > 0
    THEN ROUND(((v_pnl / (v_order.entry_price * v_order.quantity)) * 100)::NUMERIC, 2)
    ELSE 0 END;

  -- Update order
  UPDATE paper_orders SET
    status = 'closed', exit_price = p_exit_price, pnl = ROUND(v_pnl, 4),
    pnl_pct = v_pnl_pct, closed_at = NOW()
  WHERE id = p_order_id;

  -- Update portfolio
  UPDATE paper_portfolios SET
    cash_balance  = cash_balance + COALESCE(v_order.margin_used, 0) + v_pnl,
    total_pnl     = total_pnl + v_pnl,
    realized_pnl  = realized_pnl + v_pnl,
    trades_count  = trades_count + 1,
    wins_count    = wins_count + CASE WHEN v_pnl > 0 THEN 1 ELSE 0 END,
    updated_at    = NOW()
  WHERE id = v_order.portfolio_id;

  RETURN jsonb_build_object('success', true, 'pnl', v_pnl, 'pnl_pct', v_pnl_pct, 'exit_price', p_exit_price);
END; $$;

-- =============================================================
-- SEED: 30 Top Finance Books
-- =============================================================
INSERT INTO books (title, author, description, key_takeaways, why_read, best_for, category, difficulty, amazon_url, is_free_legal) VALUES

('The Psychology of Money', 'Morgan Housel', 'Financial success is about behaviour, not intelligence. Housel uses 19 short stories to show how people think about money in ways that are often irrational but deeply human.',
'["Wealth is what you do not spend - it is invisible by definition", "Room for error is the most underappreciated force in finance", "Getting rich and staying rich are different skills requiring different behaviours", "Reasonable beats rational - a plan you can stick to beats a theoretically optimal one", "You are not a spreadsheet. You are a person with emotions and a family", "Compounding works best when you do not interrupt it", "Save without a specific goal - savings is a hedge against life surprises"]'::JSONB,
'The single most important finance book for anyone starting out. It reframes money decisions as human behaviour, not maths.',
ARRAY['beginner','investor','professional'],'behavioral-finance','easy',
'https://www.amazon.in/Psychology-Money-Morgan-Housel/dp/9390166268', FALSE),

('The Intelligent Investor', 'Benjamin Graham', 'The definitive guide to value investing, written by Warren Buffett''s mentor. Teaches the principles of investing with a margin of safety, controlling emotions, and understanding market volatility.',
'["The stock market is a voting machine in the short term but a weighing machine in the long term", "Margin of safety is the three most important words in investing", "Mr Market is your servant, not your guide", "The investor''s chief problem - and even his worst enemy - is likely to be himself", "Never buy a stock immediately after a substantial rise or sell one immediately after a substantial drop"]'::JSONB,
'Required reading for anyone who wants to invest in stocks rather than speculate. Dense but transformative.',
ARRAY['investor','advanced'],'investing','advanced',
'https://www.amazon.in/Intelligent-Investor-Benjamin-Graham/dp/0062312685', FALSE),

('Rich Dad Poor Dad', 'Robert T. Kiyosaki', 'Contrasts the financial philosophies of two fathers - one highly educated but financially poor, one a dropout who became rich - to teach the difference between working for money vs making money work for you.',
'["The rich do not work for money - money works for them", "Financial literacy is more important than academic education for wealth", "Your house is a liability, not an asset, if it takes money out of your pocket", "The rich acquire assets; the poor and middle class acquire liabilities", "Taxes and inflation consistently reduce the wealth of employees", "Corporations protect wealth better than personal income"]'::JSONB,
'Despite debate around some ideas, this is the most-read financial book globally because it changes how people think about income, expenses, and assets.',
ARRAY['beginner','entrepreneur'],'personal-finance','easy',
'https://www.amazon.in/Rich-Dad-Poor-Middle-Anniversary/dp/1612681131', FALSE),

('Zero to One', 'Peter Thiel', 'Notes on startups and how to build the future. Thiel argues that the next big innovation is not copying existing ideas but creating truly new ones - going from zero to one.',
'["Competition is for losers - monopoly is the engine of business profit", "Every great business is built around a secret that others don''t see", "The most contrarian thing is not to oppose the crowd but to think for yourself", "A startup messed up at its foundation cannot be fixed later", "Sales and distribution are as important as the product", "Technology is about doing more with less - it multiplies human will"]'::JSONB,
'Essential for anyone building a startup or evaluating early-stage investments.',
ARRAY['founder','investor'],'corporate-finance','medium',
'https://www.amazon.in/Zero-One-Notes-Startups-Future/dp/0804139296', FALSE),

('One Up on Wall Street', 'Peter Lynch', 'Lynch, one of the most successful fund managers in history, explains how ordinary investors can beat Wall Street professionals by investing in companies they understand in daily life.',
'["Invest in what you know - your everyday observations are valuable", "Everyone has the edge to outperform experts if they use it", "The P/E ratio is important but context matters - compare it to growth", "Never invest in any idea you can''t illustrate with a crayon", "Long-term investing beats short-term trading for most people", "Know why you own a stock - be able to explain it in 2 minutes"]'::JSONB,
'A practical guide to stock picking from one of history''s greatest investors. More accessible than Graham.',
ARRAY['investor','intermediate'],'investing','medium',
'https://www.amazon.in/One-Up-Wall-Street-Already/dp/0743200403', FALSE),

('The Almanack of Naval Ravikant', 'Eric Jorgenson', 'Compiled wisdom of Naval Ravikant on wealth, happiness, and building leverage. Covers how to get rich without getting lucky - through code, media, capital, and people.',
'["Seek wealth, not money or status. Wealth is assets that earn while you sleep", "Learn to sell, learn to build. Do both and you will be unstoppable", "Specific knowledge cannot be taught - it comes from following your genuine curiosity", "Give society what it wants but doesn''t know how to get - at scale", "Reading is the foundation - read what you love until you love to read", "Compound yourself - your rate of learning matters more than your salary"]'::JSONB,
'Modern essential reading for founders, builders, and anyone thinking about wealth creation in the internet age.',
ARRAY['founder','entrepreneur','investor'],'corporate-finance','easy',
'https://www.navalmanack.com/', TRUE),

('Let''s Talk Money', 'Monika Halan', 'India''s most practical personal finance book. Halan explains how to protect your money, grow it, and plan for your future specifically in the Indian financial context - without jargon.',
'["Get adequate term insurance and health insurance before investing a single rupee", "A money box system - spend, invest, and contingency accounts - simplifies financial life", "Mutual funds are the best vehicle for most Indian retail investors", "Index funds beat most active funds over the long term", "Real estate is not always a good investment when you account for cost, taxes, and opportunity cost", "Start with a goal before choosing a product - never the other way around"]'::JSONB,
'The best personal finance book specifically for India. Practical, honest, and India-specific throughout.',
ARRAY['beginner','professional'],'personal-finance','easy',
'https://www.amazon.in/Lets-Talk-Money-Monika-Halan/dp/0008302820', FALSE),

('Thinking, Fast and Slow', 'Daniel Kahneman', 'Nobel Prize winner Kahneman describes the two systems of thinking - the fast, emotional System 1 and the slow, rational System 2 - and how they affect financial decisions and judgements.',
'["System 1 thinking causes most investment mistakes - overconfidence, anchoring, loss aversion", "Loss aversion: we feel losses twice as strongly as equivalent gains", "The planning fallacy consistently leads to underestimating time and cost", "Availability heuristic makes us overweight recent and dramatic events", "Regression to the mean is often misattributed to something we did", "Hindsight bias makes the past look more predictable than it was"]'::JSONB,
'Understanding your psychological biases is as important as understanding valuation. Required for serious investors.',
ARRAY['investor','professional'],'behavioral-finance','advanced',
'https://www.amazon.in/Thinking-Fast-Slow-Daniel-Kahneman/dp/0141033576', FALSE),

('The Warren Buffett Way', 'Robert G. Hagstrom', 'Analyses Buffett''s investment philosophy through his actual investments - Coca-Cola, American Express, Wells Fargo - explaining the business tenets, management tenets, and financial tenets he applies.',
'["Only invest in businesses you thoroughly understand", "Demand companies with consistent earning power and high return on equity", "Look for businesses with durable competitive advantages - economic moats", "Price is what you pay, value is what you get", "Be fearful when others are greedy, and greedy when others are fearful", "Time in the market beats timing the market - the best holding period is forever"]'::JSONB,
'The clearest explanation of how Buffett actually picks stocks, with real portfolio examples.',
ARRAY['investor','advanced'],'investing','medium',
'https://www.amazon.in/Warren-Buffett-Way-Robert-Hagstrom/dp/1118503252', FALSE),

('Flash Boys', 'Michael Lewis', 'Lewis exposes how high-frequency trading firms exploit tiny speed advantages to front-run ordinary investors, and follows a group of Wall Street rebels who tried to build a fairer exchange.',
'["Markets can be rigged in ways that are technically legal but economically harmful", "Speed is the primary weapon in modern equity markets", "Information asymmetry between institutions and retail investors is systemic", "The solution to unfair markets is transparency and aligned incentives", "Complexity in financial systems often serves insiders at the expense of ordinary participants"]'::JSONB,
'A gripping read for anyone interested in how modern stock markets actually work behind the screens.',
ARRAY['trader','investor','advanced'],'trading-markets','medium',
'https://www.amazon.in/Flash-Boys-Michael-Lewis/dp/0393351599', FALSE),

('The Lean Startup', 'Eric Ries', 'The framework for building startups efficiently using validated learning, Build-Measure-Learn feedback loops, and minimum viable products to reduce waste.',
'["Build-Measure-Learn: ship fast, measure honestly, learn quickly", "A startup is a human institution designed to deliver a new product under extreme uncertainty", "Validated learning is more valuable than following a plan", "Pivot or persevere - the discipline to change direction based on data", "Vanity metrics vs actionable metrics - focus only on what changes behaviour", "Innovation accounting: define progress in terms of validated learning"]'::JSONB,
'Required reading for any founder before spending significant time or money building a product.',
ARRAY['founder','entrepreneur'],'corporate-finance','easy',
'https://www.amazon.in/Lean-Startup-Eric-Ries/dp/0670921602', FALSE),

('Poor Charlie''s Almanack', 'Charles T. Munger', 'The wit and wisdom of Warren Buffett''s partner Charlie Munger - covering mental models, latticework thinking, and a multidisciplinary approach to investing and life.',
'["Invert, always invert - to solve a problem, first think about what would cause failure", "A latticework of mental models from multiple disciplines beats deep expertise in one", "All I want to know is where I will die, so I never go there", "The big money is not in the buying and the selling but in the waiting", "It is remarkable how much long-term advantage we have gotten by trying to be consistently not stupid", "Incentives are the most powerful force in the world - follow them to predict behaviour"]'::JSONB,
'Munger is the most intellectually rigorous investor of the 20th century. His mental models apply far beyond investing.',
ARRAY['investor','founder','advanced'],'investing','advanced',
'https://www.amazon.in/Poor-Charlies-Almanack-Charles-Munger/dp/1578645018', FALSE),

('Shoe Dog', 'Phil Knight', 'Nike founder Phil Knight''s memoir of building Nike from a $50 import business into a $30B+ global brand - covering the financial near-death experiences, debt crises, and unconventional decisions along the way.',
'["Cash flow is everything - Knight nearly lost Nike repeatedly because of it", "The need to keep growing creates constant financial stress even in successful companies", "Build genuine relationships with your bank before you need them", "Revenue is vanity, profit is sanity, cash is reality", "Perseverance through repeated failure is more important than any single decision", "Culture and values become financial assets that cannot be replicated"]'::JSONB,
'Best finance memoir for founders - shows the real financial terror of building a great company.',
ARRAY['founder','entrepreneur'],'corporate-finance','easy',
'https://www.amazon.in/Shoe-Dog-Memoir-Creator-NIKE/dp/1471146723', FALSE),

('A Random Walk Down Wall Street', 'Burton Malkiel', 'The classic argument for passive index investing - Malkiel argues that stock prices follow a random walk and that most active fund managers cannot consistently beat the market.',
'["Stock prices are essentially random in the short term - technical analysis cannot predict them", "Efficient markets make it nearly impossible to consistently outperform through stock picking", "Index funds beat the majority of active funds over the long term after fees", "The best investment strategy for most people is low-cost index fund investing", "Diversification reduces risk without necessarily reducing expected returns", "Start investing early - the mathematics of compounding reward time above all else"]'::JSONB,
'The intellectual foundation for why index funds and passive investing make sense for most people.',
ARRAY['investor','beginner','professional'],'investing','medium',
'https://www.amazon.in/Random-Walk-Down-Wall-Street/dp/0393358380', FALSE),

('Security Analysis', 'Benjamin Graham & David Dodd', 'The foundational text of fundamental analysis and value investing - the basis of Warren Buffett''s entire investment philosophy. Dense, detailed, and definitive.',
'["Intrinsic value is the bedrock of rational investing", "A bond or stock has value independent of its market price", "Quantitative analysis of financial statements reveals true business health", "Margin of safety protects against errors of judgement and market volatility", "Distinguish between enterprise value and liquidation value", "Earnings power is the most important single measure of value"]'::JSONB,
'For serious investors who want the complete intellectual foundation of value investing. Not for beginners.',
ARRAY['investor','advanced'],'investing','advanced',
'https://www.amazon.in/Security-Analysis-Foreword-Buffett-Editions/dp/0071592539', FALSE)

ON CONFLICT (title, author) DO NOTHING;

-- =============================================================
-- SEED: 25 Curated YouTube Playlists
-- =============================================================
INSERT INTO curated_playlists (title, channel_name, description, playlist_url, embed_id, embed_type, platform, category, level, video_count, duration_hrs, curator_note, is_featured) VALUES

-- Personal Finance
('Personal Finance Basics - Complete Playlist', 'Zerodha Varsity', 'The most comprehensive Indian personal finance series - covers savings, insurance, investing basics, and goal planning.',
'https://www.youtube.com/playlist?list=PLX2SHiKfualFiD5ey_jnz9pVUmANIcS4q', 'PLX2SHiKfualFiD5ey_jnz9pVUmANIcS4q', 'playlist', 'youtube', 'personal-finance', 'beginner', 20, 8.0, 'Best Indian personal finance series. Culturally relevant, no jargon, covers everything you need to start.', TRUE),

('Personal Finance in Hindi - Basics', 'CA Rachana Ranade', 'Complete personal finance basics explained in Hindi. Covers budgeting, savings, insurance, mutual funds, and taxes in simple language.',
'https://www.youtube.com/playlist?list=PLFCLo5-k3WUVvHJoFFg6vDY5ks3K8HWJi', 'PLFCLo5-k3WUVvHJoFFg6vDY5ks3K8HWJi', 'playlist', 'youtube', 'personal-finance', 'beginner', 18, 7.0, 'Excellent for Hindi-speaking learners. CA Rachana''s style is simple, reliable, and India-specific.', TRUE),

('Khan Academy - Personal Finance', 'Khan Academy', 'Free world-class finance curriculum covering taxes, compound interest, mortgages, retirement, and insurance.',
'https://www.youtube.com/playlist?list=PLSQl0a2vh4HC5feHa6Rc5c0wbRTx56nF7', 'PLSQl0a2vh4HC5feHa6Rc5c0wbRTx56nF7', 'playlist', 'youtube', 'personal-finance', 'beginner', 45, 12.0, 'Khan Academy is world-class for fundamentals. Even though US-focused, principles apply everywhere.', FALSE),

-- Stock Market / Trading
('Stock Market Basics - Zerodha Varsity', 'Zerodha Varsity', 'The gold standard Indian stock market education series. From what is a stock to reading annual reports - complete for beginners.',
'https://www.youtube.com/playlist?list=PLX2SHiKfualEuHPf3-jYX_dHp_1V1KxHE', 'PLX2SHiKfualEuHPf3-jYX_dHp_1V1KxHE', 'playlist', 'youtube', 'trading-markets', 'beginner', 35, 15.0, 'No better free stock market course exists for Indian investors. Start here before anything else.', TRUE),

('Technical Analysis Masterclass', 'CA Rachana Ranade', 'Complete technical analysis series - candlesticks, support/resistance, moving averages, RSI, MACD, Bollinger bands, and chart patterns.',
'https://www.youtube.com/playlist?list=PLFCLo5-k3WUXSBIKEQdVQlqpJPl8IJL7g', 'PLFCLo5-k3WUXSBIKEQdVQlqpJPl8IJL7g', 'playlist', 'youtube', 'trading-markets', 'intermediate', 28, 10.0, 'Best free technical analysis course in India. Covers every major indicator with real chart examples.', TRUE),

('Trading for Beginners', 'Warrior Trading', 'Comprehensive trading education from zero - covers momentum trading, risk management, level 2 data, and trading psychology.',
'https://www.youtube.com/playlist?list=PLgOLrSVBFkdxN5S8MaFwHOBKlSo9s3Gq0', 'PLgOLrSVBFkdxN5S8MaFwHOBKlSo9s3Gq0', 'playlist', 'youtube', 'trading-markets', 'beginner', 22, 6.0, 'US-focused but excellent for trading psychology and risk management principles.', FALSE),

('Options Trading Basics', 'Zerodha Varsity', 'Complete options trading series - calls, puts, Greeks, strategies, payoff diagrams, and risk management for Indian options market.',
'https://www.youtube.com/playlist?list=PLX2SHiKfualHOVS2OhKj2z7nLQ9JTJ6Dy', 'PLX2SHiKfualHOVS2OhKj2z7nLQ9JTJ6Dy', 'playlist', 'youtube', 'trading-markets', 'advanced', 40, 18.0, 'The definitive free options course for Indian traders. Do not touch F&O without watching this first.', FALSE),

('Fundamental Analysis Complete Series', 'CA Rachana Ranade', 'How to read annual reports, analyse P&L and balance sheets, calculate key ratios, and identify good stocks from bad ones.',
'https://www.youtube.com/playlist?list=PLFCLo5-k3WUVEDy19ICcm0y2Kfz4H3VgS', 'PLFCLo5-k3WUVEDy19ICcm0y2Kfz4H3VgS', 'playlist', 'youtube', 'trading-markets', 'intermediate', 20, 8.0, 'If you want to invest in individual stocks, you must understand fundamentals. This is where to learn.', FALSE),

-- Crypto
('Crypto and Blockchain Basics', 'CoinBureau', 'Clear, unbiased crypto education - blockchain, Bitcoin, Ethereum, DeFi, NFTs, and how to stay safe in crypto.',
'https://www.youtube.com/playlist?list=PLk1ALX87lerTxOAHMOVHCxJHnRBjkqHBN', 'PLk1ALX87lerTxOAHMOVHCxJHnRBjkqHBN', 'playlist', 'youtube', 'crypto-defi', 'beginner', 30, 12.0, 'CoinBureau is the most trustworthy and unbiased crypto education channel. Start here before investing a rupee.', TRUE),

('Blockchain and Web3 Explained', 'Whiteboard Crypto', 'Animated explanations of blockchain concepts - how Bitcoin works, what Ethereum does, what DeFi is, and how NFTs function.',
'https://www.youtube.com/playlist?list=PLHx4UicbtUoZ7F1M1MaEAuJy0f0xIh2oj', 'PLHx4UicbtUoZ7F1M1MaEAuJy0f0xIh2oj', 'playlist', 'youtube', 'crypto-defi', 'beginner', 25, 5.0, 'Best animated crypto explainers on YouTube. Complex concepts made visually simple.', TRUE),

('Crypto Investing and Trading', 'Benjamin Cowen', 'Data-driven crypto market analysis, on-chain metrics, market cycles, and long-term investing strategy.',
'https://www.youtube.com/playlist?list=PLJ9-KktB7LBopfRKKFKN0n5-hmGVi_5fZ', 'PLJ9-KktB7LBopfRKKFKN0n5-hmGVi_5fZ', 'playlist', 'youtube', 'crypto-defi', 'intermediate', 50, 20.0, 'The most analytical approach to crypto markets. Based on data, not hype.', FALSE),

-- Corporate Finance
('Corporate Finance Basics', 'Aswath Damodaran', 'NYU professor Damodaran''s complete corporate finance course - the most rigorous and respected free corporate finance education available anywhere.',
'https://www.youtube.com/playlist?list=PLUkh9m2BorqlDJlnBXUaJaMaco9_QoGH0', 'PLUkh9m2BorqlDJlnBXUaJaMaco9_QoGH0', 'playlist', 'youtube', 'corporate-finance', 'intermediate', 30, 24.0, 'Damodaran is the world''s most respected valuation professor. This is university-level education for free.', TRUE),

('Valuation and Financial Modelling', 'Aswath Damodaran', 'Complete valuation course - DCF, multiples, relative valuation, and applying it to real companies. Used by investment bankers globally.',
'https://www.youtube.com/playlist?list=PLUkh9m2BorqmXFNBh6f7yvmGKEQDsO3TV', 'PLUkh9m2BorqmXFNBh6f7yvmGKEQDsO3TV', 'playlist', 'youtube', 'corporate-finance', 'advanced', 25, 20.0, 'If you want to value companies, this is the only course you need. Free, complete, world-class.', TRUE),

('Startup Finance and Fundraising', 'Y Combinator', 'Y Combinator founders explain startup finance, fundraising, term sheets, cap tables, and unit economics.',
'https://www.youtube.com/playlist?list=PLQ-uHSnFig5NVnJ_cLjM7om3RkUZgBsco', 'PLQ-uHSnFig5NVnJ_cLjM7om3RkUZgBsco', 'playlist', 'youtube', 'corporate-finance', 'intermediate', 20, 8.0, 'Straight from the world''s best startup accelerator. Essential for founders and VC-track professionals.', FALSE),

-- Behavioral Finance
('Behavioral Finance and Investing Psychology', 'The Plain Bagel', 'Evidence-based investing and the psychological biases that lead investors to make costly mistakes.',
'https://www.youtube.com/playlist?list=PLf4s2S_-aTAw9FU3dLhEOPAKbxJ6ZBCMz', 'PLf4s2S_-aTAw9FU3dLhEOPAKbxJ6ZBCMz', 'playlist', 'youtube', 'behavioral-finance', 'intermediate', 20, 7.0, 'The most intellectually honest investing channel on YouTube. Evidence-based, unbiased, excellent.', TRUE),

-- General
('MIT OpenCourseWare - Finance Theory', 'MIT OpenCourseWare', 'MIT''s complete undergraduate finance theory course - covers capital markets, portfolio theory, derivatives, and corporate finance at university level.',
'https://www.youtube.com/playlist?list=PLF2BFAD5F45552DAC', 'PLF2BFAD5F45552DAC', 'playlist', 'youtube', 'general', 'advanced', 24, 30.0, 'Free MIT-level finance education. For those who want the deepest possible understanding.', FALSE),

('Economics Explained', 'Economics Explained', 'Clear explanations of how economies work - inflation, central banks, recessions, currency crises, and how macro affects your money.',
'https://www.youtube.com/playlist?list=PLItlyBhfd1cKfnMDrBNFYLcQgvB3F3_E2', 'PLItlyBhfd1cKfnMDrBNFYLcQgvB3F3_E2', 'playlist', 'youtube', 'general', 'beginner', 60, 15.0, 'Best macro economics channel on YouTube. Beautifully explained with real country examples.', FALSE)

ON CONFLICT (playlist_url) DO NOTHING;
