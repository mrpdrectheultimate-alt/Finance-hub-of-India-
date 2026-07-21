-- ============================================================
-- FinanceHub - Trading and Markets: Markets 101 (15 lessons)
-- Run AFTER supabase_schema_safe.sql and seed_lessons.sql
-- ============================================================

DO $$
DECLARE
  markets_101_level_id UUID;
  l1  UUID; l2  UUID; l3  UUID; l4  UUID; l5  UUID;
  l6  UUID; l7  UUID; l8  UUID; l9  UUID; l10 UUID;
  l11 UUID; l12 UUID; l13 UUID; l14 UUID; l15 UUID;
  q1  UUID; q2  UUID; q3  UUID; q4  UUID; q5  UUID;
  q6  UUID; q7  UUID; q8  UUID; q9  UUID; q10 UUID;
BEGIN

SELECT lv.id INTO markets_101_level_id
FROM levels lv JOIN tracks t ON lv.track_id = t.id
WHERE (t.slug = 'trading-markets' AND lv.slug = 'markets-101')
   OR (t.slug = 'stock-market' AND lv.slug = 'beginner')
   OR (t.slug = 'trading' AND lv.slug = 'beginner')
ORDER BY CASE
  WHEN t.slug = 'trading-markets' AND lv.slug = 'markets-101' THEN 1
  WHEN t.slug = 'stock-market' AND lv.slug = 'beginner' THEN 2
  ELSE 3
END
LIMIT 1;

IF markets_101_level_id IS NULL THEN
  RAISE EXCEPTION 'Markets 101 level not found. Run sql/supabase_schema_safe.sql first.';
END IF;

-- -----------------------------------------
-- LESSON 1: What is the stock market?
-- -----------------------------------------
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES (markets_101_level_id, 'What is the stock market and why does it exist?', 'what-is-stock-market',
'# What is the stock market and why does it exist?

## The simple idea

A stock market is a place where people buy and sell small pieces of companies. When a company needs money to grow, it sells pieces of itself to the public. Each piece is called a **share** or **stock**. In return, investors get part ownership and the hope of making money if the company grows.

## Why companies go public

Imagine you run a small restaurant and want to open 100 more. You need Rs. 50 crore. You have three options:

- **Take a loan**: Pay interest, risk bankruptcy if things go wrong
- **Find a few rich investors**: Give them control over your company
- **Go public (IPO)**: Sell small pieces to thousands of investors

Most large companies choose the third option. This is called an **Initial Public Offering (IPO)**.

## India''s stock markets

India has two main stock exchanges:

**NSE (National Stock Exchange)** - Launched in 1992. India''s largest by trading volume. Home of the NIFTY 50 index.

**BSE (Bombay Stock Exchange)** - The oldest in Asia, founded in 1875. Home of the SENSEX index.

> Both NSE and BSE are regulated by SEBI (Securities and Exchange Board of India) - the watchdog that protects investors.

## What actually happens when you buy a share

When you buy 1 share of Reliance Industries:
- You own a tiny fraction of Reliance
- If Reliance makes profits, you may get a **dividend** (cash payment)
- If Reliance grows, your share price may rise
- If Reliance shrinks, your share price may fall

You never become responsible for Reliance''s debts. The most you can lose is what you invested.

## Who participates in the stock market?

- **Retail investors**: Individuals like you
- **Mutual funds**: Pool money from many investors
- **FIIs (Foreign Institutional Investors)**: Global funds investing in India
- **DIIs (Domestic Institutional Investors)**: Indian banks, insurance companies
- **HNIs (High Net Worth Individuals)**: Wealthy individuals

## The primary vs secondary market

**Primary market**: Company sells NEW shares directly to investors (IPO)
**Secondary market**: Investors trade EXISTING shares with each other

When you buy shares on Zerodha or Groww, you are in the secondary market - the company gets no new money from this transaction.', 7, 1, true, true) RETURNING id INTO l1;

INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l1, 'Stock Market Basics - Check', 70) RETURNING id INTO q1;
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
(q1, 'What does it mean to own a share of a company?',
'["You own the company''s building", "You are a part-owner of the company", "You have lent money to the company", "You work for the company"]',
1, 'A share represents part ownership. You become a fractional owner, entitled to a portion of profits (dividends) and a say in major decisions through voting rights.', 1),
(q1, 'What is an IPO?',
'["A type of mutual fund", "When a company first sells shares to the public", "A government bond", "A trading strategy"]',
1, 'IPO stands for Initial Public Offering - the first time a company sells shares to the general public to raise capital for growth.', 2),
(q1, 'Which body regulates stock markets in India?',
'["RBI", "SEBI", "IRDA", "AMFI"]',
1, 'SEBI - Securities and Exchange Board of India - regulates all stock market activity. It protects investor interests and ensures fair markets.', 3);

-- -----------------------------------------
-- LESSON 2: How share prices move
-- -----------------------------------------
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES (markets_101_level_id, 'How share prices move - supply, demand and sentiment', 'how-prices-move',
'# How share prices move - supply, demand and sentiment

## The core mechanism: auction

A stock exchange is essentially a continuous auction. Every second, buyers say what they will pay and sellers say what they will accept. The price is wherever they agree.

If more people want to buy than sell -> price rises
If more people want to sell than buy -> price falls

## What drives buying and selling?

**Company performance**
- Strong profits -> more buyers -> price up
- Missed earnings -> more sellers -> price down
- New product launch -> excitement -> buyers pile in

**Macroeconomic factors**
- RBI cuts interest rates -> cheaper loans -> businesses grow -> prices up
- Inflation rises -> costs increase -> profits shrink -> prices fall
- GDP growth strong -> confidence high -> investors buy

**Sentiment and news**
- Positive news about a sector -> entire sector rises
- CEO scandal -> company stock crashes
- Global crisis (COVID, war) -> fear -> mass selling

> Short term: prices are driven by sentiment and news
> Long term: prices follow actual business performance

## The bid-ask spread

**Bid price**: What buyers are willing to pay (e.g., Rs. 2,840)
**Ask price**: What sellers are willing to accept (e.g., Rs. 2,842)
**Spread**: The difference (Rs. 2) - income for market makers

When you click "Buy" at market price, you pay the ask. When you click "Sell", you receive the bid.

## Circuit breakers - when markets hit limits

SEBI has circuit breakers to prevent panic crashes:

- **10% move in NIFTY** -> 45 minute trading halt
- **15% move** -> 1 hour 45 minute halt
- **20% move** -> market closes for the day

Individual stocks also have upper and lower circuit limits (typically Â±5%, Â±10%, or Â±20% per day).

## Market capitalisation

**Market cap = Share price x Total shares outstanding**

Reliance at Rs. 2,847 x 675 crore shares = ~Rs. 19 lakh crore market cap

This makes Reliance one of India''s largest companies by market cap.

- **Large cap**: Top 100 companies - stable, lower risk
- **Mid cap**: 101-250 - higher growth potential, more volatile
- **Small cap**: Below 250 - highest risk and reward', 8, 2, true, true) RETURNING id INTO l2;

INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l2, 'Price Movement - Check', 70) RETURNING id INTO q2;
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
(q2, 'If more people want to sell a stock than buy it, what happens to the price?',
'["Price rises", "Price falls", "Price stays the same", "Trading is halted"]',
1, 'Basic supply and demand. Excess supply (sellers) relative to demand (buyers) pushes the price down until a level where buyers are willing to step in.', 1),
(q2, 'What is the "bid" price?',
'["What sellers are asking for", "What buyers are willing to pay", "The last traded price", "The opening price"]',
1, 'The bid is the highest price a buyer is currently willing to pay. The ask is the lowest price a seller will accept. Trades happen when bid meets ask.', 2),
(q2, 'What triggers a market-wide circuit breaker in India?',
'["Any stock falling 5%", "NIFTY moving 10% in one direction", "A company going bankrupt", "FII selling"]',
1, 'SEBI mandates a 45-minute halt when NIFTY moves 10% from the previous close, to prevent panic-driven crashes.', 3);

-- -----------------------------------------
-- LESSON 3: NIFTY 50 and SENSEX explained
-- -----------------------------------------
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES (markets_101_level_id, 'NIFTY 50 and SENSEX - what indices really mean', 'nifty-sensex-explained',
'# NIFTY 50 and SENSEX - what indices really mean

## What is a stock market index?

An index is a number that represents the overall performance of a group of selected stocks. Instead of tracking all 5,000+ listed companies, you track the top ones as a proxy for the whole market.

Think of it like a "temperature reading" for the economy.

## NIFTY 50

- Managed by NSE
- Contains the 50 largest and most liquid companies listed on NSE
- Includes companies from 13 sectors: financials, IT, energy, consumer goods, auto, etc.
- Base value: 1,000 points on November 3, 1995
- Current level (2024): ~22,000 - meaning it has grown 22x in ~30 years

**NIFTY 50 top components include:**
Reliance, HDFC Bank, Infosys, ICICI Bank, TCS, Kotak Bank, Bharti Airtel, L&T, Bajaj Finance, Axis Bank

## SENSEX

- Managed by BSE
- Contains 30 companies - the "Sensitive Index"
- Base year: 1978-79 with a value of 100
- Current level: ~73,000+ - 730x growth

## How are index values calculated?

Both use **free-float market cap weighted methodology**:

1. Calculate free-float market cap of each company (shares available for trading x price)
2. Give each company a weight based on its market cap
3. Larger companies have more impact on the index

If Reliance rises 5%, it moves NIFTY more than a smaller company rising 5%.

## Why indices matter to you

**As an investor:**
- "The market fell 2%" = NIFTY or SENSEX fell 2%
- Benchmark for your portfolio: did you beat the index?
- Index funds simply replicate the NIFTY 50 - zero stock-picking needed

**As an Indian:**
- Rising markets often reflect economic confidence
- Falling markets can signal economic stress

## Other important Indian indices

- **NIFTY Bank**: Top banking stocks
- **NIFTY IT**: Technology companies
- **NIFTY Midcap 150**: Mid-sized companies
- **NIFTY Smallcap 250**: Smaller companies
- **India VIX**: Volatility index - fear gauge', 7, 3, true, true) RETURNING id INTO l3;

INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l3, 'Indices - Check', 70) RETURNING id INTO q3;
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
(q3, 'How many companies does the NIFTY 50 index contain?',
'["30", "50", "100", "500"]',
1, 'NIFTY 50 contains exactly 50 of the largest and most liquid companies listed on NSE, across 13 sectors of the Indian economy.', 1),
(q3, 'If NIFTY rose from 1,000 (1995) to 22,000 today, by how much has it grown?',
'["2.2x", "22x", "220x", "2,200x"]',
1, '22,000 / 1,000 = 22x growth. This is why long-term equity investing is powerful - the NIFTY has returned roughly 12-14% annually over 30 years.', 2),
(q3, 'Which method is used to calculate NIFTY 50''s value?',
'["Equal weight of all 50 stocks", "Free-float market cap weighted", "Price weighted like Dow Jones", "Randomly selected stocks"]',
1, 'Free-float market cap weighting means larger companies (by market cap) have more influence on the index. This is more representative than equal weighting.', 3);

-- -----------------------------------------
-- LESSON 4: How to open a Demat account
-- -----------------------------------------
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES (markets_101_level_id, 'How to open a Demat account and start investing', 'open-demat-account',
'# How to open a Demat account and start investing

## What is a Demat account?

Just as a bank account holds your money, a **Demat (Dematerialised) account** holds your shares in digital form. Before 1996, shares were physical paper certificates - Demat eliminated this.

You need three things to invest in stocks:
1. **Bank account** - for money transfers
2. **Demat account** - to hold your shares
3. **Trading account** - to place buy/sell orders

Most brokers provide the Demat and Trading accounts together.

## Who are the depositories?

India has two depositories that actually hold all shares:
- **CDSL** (Central Depository Services Limited)
- **NSDL** (National Securities Depository Limited)

Your broker connects you to one of these. All are SEBI-regulated.

## Choosing a broker

**Discount brokers** (recommended for beginners):
- **Zerodha**: India''s largest, Rs. 0 delivery brokerage, Rs. 20 per intraday trade
- **Groww**: Simplest UI, popular with first-time investors
- **Upstox**: Low cost, backed by Ratan Tata
- **Angel One**: Good research tools, slightly higher fees

**Full-service brokers**:
- ICICI Direct, HDFC Securities, Kotak Securities
- Higher fees but include research reports and advisory

## Documents needed

- PAN card (mandatory)
- Aadhaar card (for e-KYC)
- Bank account details (cancelled cheque or bank statement)
- Mobile number linked to Aadhaar (for OTP verification)

## Step-by-step: Open on Zerodha

1. Go to zerodha.com -> Open an account
2. Enter mobile number -> verify OTP
3. Enter PAN and Aadhaar details
4. Complete video KYC (30 seconds on camera)
5. Sign documents digitally with Aadhaar OTP
6. Wait 24-48 hours for activation

**Cost**: Rs. 200 one-time account opening fee

## Your first trade

Once activated:
1. Transfer money from bank to trading account
2. Search for a stock (e.g., "NIFTY BEES" - NIFTY 50 ETF)
3. Enter quantity
4. Place a market or limit order
5. Shares appear in your Demat within T+1 day

> Start with an index ETF - not individual stocks. Learn the mechanics before picking companies.', 8, 4, true, true) RETURNING id INTO l4;

INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l4, 'Demat Account - Check', 70) RETURNING id INTO q4;
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
(q4, 'What does a Demat account hold?',
'["Cash and currency", "Your shares in digital form", "Mutual fund units", "Physical gold"]',
1, 'Demat (Dematerialised) account holds your shares digitally. Before Demat, investors held physical paper share certificates - cumbersome and risky to lose.', 1),
(q4, 'Which PAN card is mandatory for opening a Demat account in India?',
'["PAN card is optional", "PAN card is mandatory", "Aadhaar is sufficient", "Passport works instead"]',
1, 'PAN (Permanent Account Number) is mandatory for all stock market transactions in India. SEBI requires it to prevent tax evasion and money laundering.', 2),
(q4, 'What is recommended for a complete beginner making their first stock market investment?',
'["Pick the hottest stock in the news", "Start with an index ETF like NIFTY BEES", "Buy penny stocks for high returns", "Trade intraday on day one"]',
1, 'An index ETF (like NIFTY BEES) tracks the NIFTY 50 automatically. It is the lowest-risk, lowest-cost way to get market exposure while learning the mechanics.', 3);

-- -----------------------------------------
-- LESSON 5: Types of orders
-- -----------------------------------------
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES (markets_101_level_id, 'Order types - market, limit, stop-loss and more', 'order-types',
'# Order types - market, limit, stop-loss and more

## Why order types matter

How you place an order determines the price you get. Using the wrong order type can cost you significantly - especially in volatile or illiquid stocks.

## Market Order

**What it does**: Buy/sell immediately at the current best available price.

**Use when**: You want immediate execution and the stock is highly liquid (Reliance, TCS, HDFC Bank).

**Risk**: In fast-moving markets or illiquid stocks, you may get a much worse price than expected (**slippage**).

> Example: HDFC Bank is trading at Rs. 1,623. You place a market buy. You get filled at Rs. 1,623.20 - close to expected.

## Limit Order

**What it does**: Buy at or below your specified price, or sell at or above your specified price.

**Use when**: You want price control and are patient enough to wait.

**Risk**: May not execute if the price never reaches your limit.

> Example: HDFC Bank at Rs. 1,623. You place a limit buy at Rs. 1,615. If price drops to Rs. 1,615, your order executes. If it never drops, nothing happens.

## Stop-Loss Order

**What it does**: Automatically sells if price falls to a specified level. Protects against large losses.

**Two types**:
- **SL-M (Stop-Loss Market)**: Triggers a market order at your stop price
- **SL (Stop-Loss Limit)**: Triggers a limit order at your stop price

> Example: You buy at Rs. 1,623. Place stop-loss at Rs. 1,590. If price falls to Rs. 1,590, your shares are sold automatically.

## After Market Orders (AMO)

Place orders outside trading hours (9:15am-3:30pm). Order executes at market open next day.

## Validity types

- **Day order**: Valid only for today''s session. Cancelled if not filled.
- **IOC (Immediate or Cancel)**: Execute immediately or cancel - no partial waits.
- **GTD (Good Till Date)**: Valid until a specific date (not all brokers offer this).

## The golden rule

**Never trade illiquid stocks with market orders.** A stock trading 1,000 shares per day could move 5% against you just from your own order.', 7, 5, true, true) RETURNING id INTO l5;

INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l5, 'Order Types - Check', 70) RETURNING id INTO q5;
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
(q5, 'What is the main advantage of a limit order over a market order?',
'["Faster execution", "Price control - you will never pay more than your limit", "Lower brokerage fees", "Guaranteed execution"]',
1, 'A limit order gives you price control. You specify the maximum price you will pay (buy) or minimum price you will accept (sell). The trade-off is it may not execute.', 1),
(q5, 'You bought a stock at Rs. 500 and want to limit your loss to 10%. Where should you set your stop-loss?',
'["Rs. 550", "Rs. 480", "Rs. 450", "Rs. 400"]',
1, '10% below Rs. 500 = Rs. 500 x 0.90 = Rs. 450. A stop-loss at Rs. 450 means if the stock falls to Rs. 450, it is automatically sold, limiting your loss to 10%.', 2),
(q5, 'Which order type is most dangerous when trading illiquid (low volume) stocks?',
'["Limit order", "Market order", "Stop-loss order", "AMO order"]',
1, 'Market orders in illiquid stocks can have severe slippage - your large buy order may move the price against you significantly before filling.', 3);

-- -----------------------------------------
-- LESSONS 6-15: Additional Markets 101 lessons
-- -----------------------------------------
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES
(markets_101_level_id, 'What moves stock prices - earnings, news and macro', 'what-moves-prices',
'# What moves stock prices - earnings, news and macro

## Earnings reports - the most important driver

Every listed company in India reports quarterly results. The key numbers:

**Revenue**: Total money earned from business
**Net profit (PAT)**: What''s left after all expenses and taxes
**EPS (Earnings Per Share)**: Net profit / total shares
**EBITDA**: Earnings before interest, taxes, depreciation - operational health

> Markets react to SURPRISES, not absolutes. A company that earns Rs. 100 crore when Rs. 80 crore was expected rises sharply - even if Rs. 100 crore seems small.

## Analyst estimates and beats

Analysts from Goldman Sachs, Morgan Stanley, Motilal Oswal publish earnings estimates before results. When actual results:
- **Beat estimates**: Stock rises (positive surprise)
- **Miss estimates**: Stock falls (disappointment)
- **In-line**: Muted reaction

## Corporate actions that affect price

**Dividend**: Company pays cash to shareholders. Stock price typically falls by dividend amount on ex-date.
**Bonus shares**: Company issues extra shares (e.g., 1:1 bonus = double your shares, price halves)
**Stock split**: Shares divided (e.g., 10:1 split = 10 shares at Rs. 100 each instead of 1 at Rs. 1,000)
**Rights issue**: Company raises money by offering existing shareholders new shares at a discount

## Macro factors

**RBI policy**: Rate cuts -> cheaper credit -> business growth -> stocks up
**Inflation**: High inflation -> margin pressure -> stocks down
**Currency**: Rupee weakening -> IT companies (export in USD) benefit
**Global cues**: US Fed policy, China GDP, oil prices - all affect Indian markets

## The Nifty 50 earnings season

Earnings season in India: results declared in April, July, October, January (within 45 days of quarter end). This is when maximum volatility occurs.', 7, 6, true, true),

(markets_101_level_id, 'IPOs - should you apply?', 'ipos-explained',
'# IPOs - should you apply?

## What happens in an IPO

A company that wants to raise money from the public:
1. Hires merchant bankers (SEBI-registered)
2. Files a DRHP (Draft Red Herring Prospectus) with SEBI - full disclosure document
3. Sets a price band (e.g., Rs. 180-190 per share)
4. Opens subscription window for 3 days
5. Allots shares to successful applicants
6. Lists on NSE/BSE - trading begins

## How to apply for an IPO

**Via UPI (ASBA - Application Supported by Blocked Amount)**:
1. Open your broker app -> IPO section
2. Select the IPO you want
3. Enter bid quantity and price
4. Approve UPI mandate
5. Money stays in your bank until allotment - not actually deducted

## The allotment lottery

If an IPO is oversubscribed (more applications than shares):
- Retail quota is allotted by lottery
- Minimum lot size applies (e.g., 1 lot = 78 shares)
- No one gets more than 1 lot in retail category

## Listing gains - the hype vs reality

Popular IPOs often list at a premium (e.g., Zomato listed 66% above issue price). But:
- High-hype IPOs are often overpriced
- Many IPOs trade below issue price 6 months later
- Short-term listing gain strategy is gambling, not investing

## GMP (Grey Market Premium)

Before listing, an unofficial market trades IPO shares. The GMP shows expected listing premium. **Do not rely on GMP** - it is unregulated and manipulated.

## Who really benefits from IPOs?

Early investors (VCs, PE funds) who invested before the IPO at much lower prices. They are often selling their shares to YOU in the IPO. Read the DRHP carefully - if founders/early investors are selling most shares, be cautious.', 7, 7, true, true),

(markets_101_level_id, 'Dividends, buybacks and bonus shares', 'dividends-buybacks',
'# Dividends, buybacks and bonus shares

## Dividends

A **dividend** is a company''s way of sharing profits with shareholders.

**Dividend yield** = Annual dividend / Share price x 100

If a company pays Rs. 20 dividend and the share is Rs. 400, yield = 5%

**Important dates**:
- **Announcement date**: Company declares dividend
- **Record date**: You must own shares by this date to receive dividend
- **Ex-dividend date**: One day before record date. Buy BEFORE this to qualify.
- **Payment date**: When dividend hits your account

> Share price typically falls by approximately the dividend amount on ex-date. You haven''t gained anything - money moved from company to your account.

## Dividend taxation in India

Dividends are taxed as per your income tax slab. Received in your bank account directly.

## Buybacks

A **buyback** is when a company repurchases its own shares from the open market. This:
- Reduces total shares outstanding
- Increases EPS (same profit / fewer shares)
- Often signals management confidence
- Tax-efficient vs dividend (buyback proceeds taxed at 20% vs income slab)

## Bonus shares

Company issues free additional shares to existing shareholders.

**1:1 bonus** = For every 1 share you hold, you get 1 more free
**Share price adjusts**: If you had 10 shares at Rs. 1,000, after 1:1 bonus you have 20 shares at Rs. 500. Total value unchanged.

## Stock splits

Similar to bonus shares but different accounting treatment.

**10:1 split**: Rs. 10,000 share becomes 10 shares at Rs. 1,000 each. Makes expensive shares more accessible to retail investors.', 6, 8, true, true),

(markets_101_level_id, 'Reading a stock quote - all the numbers explained', 'reading-stock-quote',
'# Reading a stock quote - all the numbers explained

## The key numbers on a stock page

Open any stock on Zerodha, Groww, or NSE''s website and you will see these numbers. Here is what each means:

**LTP (Last Traded Price)**: The most recent price at which the stock changed hands.

**Open**: First trade price when market opened at 9:15 AM.

**High**: Highest price traded today.

**Low**: Lowest price traded today.

**Close (Previous Close)**: Yesterday''s closing price (market close at 3:30 PM).

**Change**: LTP minus Previous Close. Can be positive or negative.

**% Change**: Change as a percentage of previous close.

**Volume**: Number of shares traded today. Low volume = illiquid = dangerous.

**52-week High/Low**: Highest and lowest prices in the past 52 weeks. Context for current valuation.

## Valuation metrics

**P/E Ratio (Price to Earnings)**: Share price / EPS.
- P/E of 20 = you are paying Rs. 20 for every Rs. 1 of annual earnings
- Compare with sector average - not absolute numbers
- Low P/E can mean undervalued OR poor growth prospects

**P/B Ratio (Price to Book)**: Market price / Book value per share. Important for banks and financial companies.

**Market Cap**: Total value of all shares. Small/Mid/Large cap classification.

**Dividend Yield**: Annual dividend / current price. Relevant for income investors.

**EPS (Earnings Per Share)**: Net profit / shares outstanding. Growing EPS = healthy company.

## The 52-week range context

A stock near its 52-week HIGH:
- Could be momentum - strong business
- Could be overvalued - buy with caution

A stock near its 52-week LOW:
- Could be value opportunity
- Could be a falling knife - research before buying

Never buy or sell based on 52-week range alone.', 8, 9, true, true),

(markets_101_level_id, 'Delivery vs intraday - what is the difference?', 'delivery-vs-intraday',
'# Delivery vs intraday - what is the difference?

## Delivery trading (CNC - Cash and Carry)

You buy shares and HOLD them in your Demat account overnight or for as long as you want.

**Brokerage**: Rs. 0 on most platforms for delivery (Zerodha, Groww)
**Settlement**: Shares credited to your Demat in T+1 (next trading day)
**Risk**: Limited to amount invested. Maximum loss = what you paid.
**Tax**: Long-term (>1 year) capital gains at 10% above Rs. 1 lakh. Short-term (<1 year) at 15%.

**Best for**: Long-term investors building wealth over months or years.

## Intraday trading (MIS - Margin Intraday Square-off)

You buy AND sell on the SAME day. You do not take delivery - position must be closed before 3:20 PM or broker auto-squares off.

**Brokerage**: Rs. 20 per order (Zerodha)
**Leverage**: Brokers offer up to 5x leverage. You control Rs. 1 lakh with Rs. 20,000.
**Risk**: With 5x leverage, a 20% move against you = 100% loss. More dangerous.
**Tax**: Profits taxed as business income (standard income slab).

**Best for**: Experienced traders who understand technical analysis and risk.

## F&O (Futures and Options)

A separate segment beyond delivery and intraday:
- **Futures**: Agreement to buy/sell at a future date
- **Options**: Right (not obligation) to buy/sell at a specific price

F&O requires separate approval from broker. Much higher risk. Covered in Advanced Strategies level.

## The beginner''s rule

**Never do intraday trading for at least the first 6 months.** Master delivery investing first. Learn how businesses work. Then consider intraday if you have specific reasons.

Most intraday traders lose money. SEBI data shows 89% of F&O traders lose money.', 7, 10, true, true),

(markets_101_level_id, 'Mutual funds vs direct stocks - what should you choose?', 'mf-vs-stocks',
'# Mutual funds vs direct stocks - what should you choose?

## The fundamental question

Should you pick individual stocks or let a fund manager do it?

**The honest answer**: Most investors (including professionals) fail to consistently beat the market index. Understanding why helps you choose correctly.

## Direct stock investing

**Pros**:
- Full control over what you own
- No fund management fees
- Can outperform the market if you are skilled
- Tax efficient - only pay tax when you sell

**Cons**:
- Requires significant research time (10+ hours per week minimum to do it properly)
- Concentration risk - small portfolio is vulnerable to any one company failing
- Emotional decision-making leads to costly mistakes
- Transaction costs add up

**Who it suits**: Investors with time, interest in business analysis, and long time horizons (10+ years)

## Mutual funds

**Active funds**: Fund manager picks stocks trying to beat the index
- Expense ratio: 0.5-2.5% per year (deducted from returns)
- Most active funds underperform their benchmark index over 10+ years

**Passive/Index funds**: Simply replicate an index (NIFTY 50 etc.)
- Expense ratio: 0.05-0.2% - very low
- Guaranteed to match market returns (minus tiny fee)
- No fund manager risk

## The verdict for most people

For the majority of investors, a SIP in a **NIFTY 50 index fund** is the best starting strategy:
- Instant diversification (50 companies)
- Very low cost
- No time required for research
- Historically returns 12-14% annually

Once you understand markets deeply, you can add direct stocks to a portion of your portfolio.

## ETF vs Index Fund

Both track the same index. Key differences:
- **ETF**: Trades like a stock on exchange. Buy/sell anytime. Minimum: 1 unit.
- **Index Fund**: Transact with the fund house daily at NAV. SIP is easy to set up.

For SIPs: use index fund. For lump sum flexibility: ETF.', 8, 11, true, false),

(markets_101_level_id, 'How to read an annual report - the basics', 'annual-report-basics',
'# How to read an annual report - the basics

## Why annual reports matter

Every listed company must publish an annual report. It contains everything you need to evaluate whether the company is worth investing in. Serious investors read annual reports - serious traders use them for context.

## Key sections to focus on

### 1. Chairman''s letter or MD&A (Management Discussion and Analysis)

This is where management explains:
- What happened this year
- What challenges they faced
- What their strategy is for the future

Read this critically. Optimistic language about bad results is a red flag.

### 2. Financial statements (three core reports)

**Profit and Loss Statement (P&L)**:
- Revenue -> Cost of goods -> Gross profit -> Operating expenses -> EBITDA -> Net profit
- Look for: Revenue growth trend, margin trends, exceptional items

**Balance Sheet**:
- Assets (what the company owns) = Liabilities (what it owes) + Equity (shareholders'' stake)
- Look for: Debt levels, cash position, receivables growth

**Cash Flow Statement**:
- Operating cash flow: Cash generated from core business
- Investing cash flow: Money spent on capex and acquisitions
- Financing cash flow: Loans taken, dividends paid, buybacks

> A company can show profit but have negative operating cash flow - this is a serious red flag.

### 3. Key ratios to calculate

**Return on Equity (ROE)** = Net profit / Shareholders'' equity x 100
A ROE above 15% consistently = excellent management

**Debt to Equity** = Total debt / Equity. Below 1 is generally safe.

**Interest Coverage** = EBIT / Interest expense. Above 3x = comfortable.

## Where to find annual reports

NSE website -> Company -> Annual Reports
BSE website -> Company -> Annual Reports
Company''s investor relations page', 9, 12, true, false),

(markets_101_level_id, 'Taxation of stock market profits in India', 'stock-market-taxation',
'# Taxation of stock market profits in India

## The two types of capital gains

**STCG (Short-Term Capital Gains)**: Profits from stocks held LESS than 12 months
Tax rate: **15%** (flat, regardless of your income slab)

**LTCG (Long-Term Capital Gains)**: Profits from stocks held MORE than 12 months
Tax rate: **10%** on gains ABOVE Rs. 1 lakh per year (no indexation benefit)

> Example: You sell shares after 2 years with Rs. 3 lakh profit. First Rs. 1 lakh is exempt. You pay 10% on the remaining Rs. 2 lakh = Rs. 20,000 tax.

## Securities Transaction Tax (STT)

STT is automatically deducted by your broker on every trade:
- **Delivery buy**: 0.1% of trade value
- **Delivery sell**: 0.1% of trade value
- **Intraday sell**: 0.025% of trade value
- **F&O sell (options)**: 0.0625% of premium

You cannot avoid STT - it is built into every transaction.

## Intraday trading tax

Intraday profits are treated as **business income**, taxed at your income tax slab rate (up to 30% for higher incomes). You can deduct trading expenses (brokerage, internet, etc.).

## F&O trading tax

Also treated as business income. If turnover exceeds Rs. 10 crore, tax audit is required.

## Dividends

Taxed as per your income slab (added to your total income and taxed accordingly).

## How to file

Your broker provides a **Tax P&L Report** at year end. Use this to fill ITR-2 (for capital gains). If you have business income (intraday/F&O), use ITR-3.

Most tax filing platforms (ClearTax, Quicko) support automatic import from Zerodha and other brokers.', 8, 13, true, false),

(markets_101_level_id, 'Common beginner mistakes and how to avoid them', 'beginner-mistakes',
'# Common beginner mistakes and how to avoid them

## Mistake 1: Buying on tips and rumours

"My cousin said this penny stock will 10x" -> This is how most retail investors lose money.

**The fix**: Never act on a tip you cannot verify yourself. If you cannot explain why a company is worth investing in, do not invest.

## Mistake 2: Averaging down on losing stocks

"The stock fell 30%, I''ll buy more to reduce my average cost" - Only valid if your original thesis still holds. Most beginners average down on bad businesses.

**The fix**: Before buying more of a losing position, ask: "Would I buy this stock for the first time today, at this price?" If no, do not average down.

## Mistake 3: Confusing trading with investing

Checking your portfolio every hour, selling at the first sign of a dip - this is reactive trading, not investing.

**The fix**: If you are investing for wealth creation, check your portfolio monthly at most. Volatility is normal. A long-term SIP does not need daily monitoring.

## Mistake 4: Over-diversification (diworsification)

Owning 40 stocks does not mean 40x protection. It means you have diluted your returns and cannot track any of them properly.

**The fix**: 8-15 stocks if you pick directly. Or just one index fund.

## Mistake 5: Ignoring valuation

"This is a great company" != "This is a great investment." A great company at 100x P/E can be a terrible investment.

**The fix**: Always check valuation metrics (P/E, P/B) against sector peers and historical averages.

## Mistake 6: Selling winners, holding losers

Psychological tendency: take profits quickly (feels good), avoid realising losses (feels bad). This is the opposite of what works.

**The fix**: Let winners run if the business is still strong. Cut losers when the thesis breaks, not when it temporarily falls.

## Mistake 7: Investing money you need in 1-2 years

Markets can fall 40% and stay down for years. Never invest money you might need soon.

**The fix**: Emergency fund first. Only invest truly long-term money.', 7, 14, true, false),

(markets_101_level_id, 'Markets 101 recap - everything you need before moving to technical analysis', 'markets-101-recap',
'# Markets 101 recap - everything you need to know

## What you have learned in this level

Congratulations on completing Markets 101. Here is a complete summary of every concept covered, for quick revision.

## Core concepts

**Stock market**: A marketplace where company ownership (shares) is bought and sold. Regulated by SEBI in India.

**Exchanges**: NSE and BSE. NIFTY 50 tracks top 50 NSE companies. SENSEX tracks top 30 BSE companies.

**Demat account**: Digital vault for your shares. Needed along with a trading account. Open with Zerodha, Groww, or Upstox.

**Price movement**: Driven by supply/demand, earnings, macro factors, and sentiment. Short term = emotion. Long term = fundamentals.

## Trading mechanics

**Order types**: Market (instant, price risk), Limit (price control, may not fill), Stop-loss (automatic protection).

**Delivery vs Intraday**: Delivery = hold overnight (lower risk, 0 brokerage). Intraday = same-day, leveraged (higher risk).

**Settlement**: Shares credited T+1. Cash debited immediately.

## Corporate actions

**Dividend**: Cash payment from company profits. Taxed as income.
**Bonus**: Free additional shares. Total value unchanged.
**Buyback**: Company repurchases shares. Reduces count, raises EPS.
**IPO**: First public sale of shares. Apply via ASBA/UPI.

## Taxation

- STCG (<12 months): 15%
- LTCG (>12 months): 10% above Rs. 1 lakh exempt
- STT: Automatic on every trade
- Intraday/F&O: Business income, slab rate

## Key mistakes to avoid

1. Acting on tips without research
2. Averaging down on broken businesses
3. Over-diversification
4. Ignoring valuation
5. Investing short-term money
6. Selling winners too early, holding losers too long

## What comes next

**Technical Analysis level**: You will learn to read charts, identify patterns, use indicators (RSI, MACD, moving averages), and understand support/resistance. This level is where you start to understand HOW to time entries and exits.

Take the final quiz for this level to earn your XP and unlock Technical Analysis.', 6, 15, true, false);

END $$;

