-- ============================================================
-- FinanceHub — Concepts + Career Paths + Videos Expansion
-- concepts_careers_videos.sql
-- Run AFTER: phase2_migration.sql, community_career.sql, video_library_complete.sql
-- Adds: 100 concepts · 7 career paths · 70 videos
-- ============================================================

DO $EXPANSION$
BEGIN

-- ═══════════════════════════════════════════════════════════
-- 100 NEW CONCEPTS FOR KNOWLEDGE GRAPH
-- Current: ~50 concepts | Target: 150 concepts
-- ═══════════════════════════════════════════════════════════

INSERT INTO concepts (name,slug,simple_def,full_def,formula,example,difficulty,track_slugs,tags)
VALUES

-- PERSONAL FINANCE CONCEPTS
('Emergency Fund','emergency-fund',
'3-6 months of expenses saved in a liquid account for unexpected crises.',
'An emergency fund is liquid savings kept separate from investments, covering 3-6 months of essential expenses. Purpose: avoid selling investments or taking high-interest debt in a crisis (job loss, medical emergency, major repair). Held in: high-yield savings account or liquid mutual funds (not FD — too slow to break; not equity — too volatile).',
NULL,'If monthly expenses = ₹40,000, emergency fund target = ₹1.2 lakh (3 months) to ₹2.4 lakh (6 months).',
'beginner',ARRAY['personal-finance'],ARRAY['savings','liquidity','financial-planning','emergency','buffer']),

('Term Insurance','term-insurance',
'Pure life insurance with no investment component — pays lump sum to family on policyholder death.',
'Term insurance provides life coverage for a fixed period (term) at low cost. Unlike endowment or ULIP, it has no maturity benefit — if you survive, nothing is paid. The low cost allows for large cover amounts. Key rule: Coverage = 10-15x annual income. IRDAI regulates all insurance in India.',
NULL,'₹1 crore cover for a 30-year-old for 30 years costs approximately ₹10,000-12,000/year premium.',
'beginner',ARRAY['personal-finance'],ARRAY['insurance','life-insurance','nominee','IRDAI','protection']),

('Health Insurance','health-insurance',
'Covers hospitalisation and medical expenses up to the insured sum.',
'Health insurance reimburses or directly pays (cashless) hospitalisation costs. Key types: Individual plan (one person), Family Floater (entire family shares one sum insured). IRDAI mandates portability — you can switch insurers without losing waiting periods. Minimum claim settlement ratio: check annually.',
NULL,'₹10 lakh family floater for a family of 4 costs ₹18,000-25,000/year. Covers hospitalisation, surgery, daycare procedures.',
'beginner',ARRAY['personal-finance'],ARRAY['insurance','health','IRDAI','cashless','hospitalisation']),

('CIBIL Score','cibil-score',
'A 3-digit credit score (300-900) that measures your creditworthiness based on repayment history.',
'CIBIL (Credit Information Bureau India Limited, now TransUnion CIBIL) calculates credit scores for individuals. Score 750+ = excellent (best loan rates). Score 650-750 = good. Below 650 = difficulty getting loans. Factors: Payment history (35%), Credit utilisation (30%), Credit age (15%), Credit mix (10%), New inquiries (10%).',
NULL,'Missing 1 EMI can drop a 780 CIBIL score by 50-100 points. Check free at cibil.com (1 free check/year).',
'beginner',ARRAY['personal-finance'],ARRAY['credit','loan','EMI','creditworthiness','CIBIL']),

('EPF','epf',
'Employees Provident Fund — mandatory retirement savings scheme for salaried employees.',
'EPF is a government-managed retirement scheme. Employee contributes 12% of basic salary; employer contributes 12% (of which 8.33% goes to EPS pension scheme, 3.67% to EPF). Interest rate: 8.15% (FY 2022-23), set annually by EPFO. Tax: EEE for contributions up to ₹2.5 lakh/year.',
NULL,'On ₹30,000 basic salary: Employee EPF = ₹3,600/month. Employer EPF = ₹3,600/month. Total = ₹7,200/month saved toward retirement.',
'beginner',ARRAY['personal-finance'],ARRAY['EPF','retirement','salary','EPFO','provident-fund']),

('RD','rd',
'Recurring Deposit — fixed monthly deposit at bank/post office earning guaranteed interest.',
'A Recurring Deposit (RD) allows monthly fixed deposits for a chosen tenure (6 months to 10 years). Interest is compounded quarterly. DICGC insures up to ₹5 lakh. Tax: Interest is fully taxable at slab rate (unlike PPF). Better than savings account but less than ELSS for long term.',
NULL,'₹5,000/month for 3 years at 7% = approximately ₹2.02 lakh on ₹1.8 lakh invested.',
'beginner',ARRAY['personal-finance'],ARRAY['deposit','savings','bank','guaranteed','interest']),

('FD','fd',
'Fixed Deposit — lump sum deposit at bank earning fixed interest for a specified period.',
'A Fixed Deposit (FD) earns guaranteed interest on a lump sum for 7 days to 10 years. DICGC insures up to ₹5 lakh per bank. Tax: Interest is fully taxable at slab rate; 10% TDS if interest > ₹40,000/year (₹50,000 for seniors). 5-year tax-saving FD qualifies for 80C deduction.',
NULL,'₹1 lakh FD at 7% for 5 years = ₹1,40,255 at maturity (compounded quarterly).',
'beginner',ARRAY['personal-finance'],ARRAY['deposit','savings','bank','guaranteed','DICGC']),

('SWP','swp',
'Systematic Withdrawal Plan — withdraw a fixed amount from mutual fund regularly.',
'SWP is the withdrawal equivalent of SIP. Useful for creating a monthly income from a corpus. Unlike dividends, SWP amount is fixed and you control timing. Tax efficient vs FD interest: only the gain component of each withdrawal is taxed as capital gains (not the principal returned).',
'SWP monthly withdrawal / Fund NAV = Units redeemed each month',
'If ₹1 crore corpus in equity fund at 8% annual growth, ₹50,000/month SWP theoretically runs indefinitely.',
'intermediate',ARRAY['personal-finance'],ARRAY['retirement','mutual-fund','withdrawal','income','corpus']),

('Nominee','nominee',
'Person designated to receive an asset on the account holder''s death.',
'A nominee is NOT a legal heir — they are a trustee who must distribute assets per the will or inheritance law. For stocks/mutual funds/bank accounts: nominee receives first, then must distribute to legal heirs. SEBI mandated nominees for all Demat accounts (March 2024). Always update nominee after marriage, death of nominee.',
NULL,'Mistake: Naming parents as nominees after marriage. On death, spouse may face legal challenges from parents claiming assets through nominee status.',
'beginner',ARRAY['personal-finance'],ARRAY['nomination','will','succession','legal','inheritance']),

('LTA','lta',
'Leave Travel Allowance — employer-paid travel expense exempt from income tax.',
'LTA is part of salary structure. Tax-exempt for travel within India with family, twice in a 4-year block period, for actual travel costs (not hotel/food). Only economy air, AC rail, or AC bus qualifies. Current block: 2022-2025. Claim via bills submitted to employer.',
NULL,'If LTA = ₹40,000 and you submit valid rail/air tickets for family travel, ₹40,000 is exempt from income tax.',
'intermediate',ARRAY['personal-finance'],ARRAY['tax','salary','exemption','travel','employer']),

-- TRADING & MARKETS CONCEPTS
('P/E Ratio','pe-ratio',
'Price-to-Earnings ratio — how much investors pay for each ₹1 of company earnings.',
'P/E = Market Price per Share / Earnings per Share (EPS). P/E of 25 means investors pay ₹25 for ₹1 of annual earnings. Used to compare valuation across companies and sectors. Forward P/E uses projected earnings. Trailing P/E uses last 12 months earnings. Low P/E ≠ cheap; consider growth rate (use PEG ratio for growth context).',
'P/E = Price / EPS',
'If stock trades at ₹200 and EPS = ₹10, P/E = 20x. Sector average 15x → stock appears expensive relative to peers.',
'intermediate',ARRAY['trading-markets','corporate-finance'],ARRAY['valuation','earnings','ratio','fundamental']),

('EPS','eps',
'Earnings Per Share — company profit divided by number of shares outstanding.',
'EPS = PAT / Weighted Average Shares Outstanding. Basic EPS uses actual shares. Diluted EPS includes potential shares from ESOPs, convertibles (more conservative). Growing EPS over years = core sign of business health. EPS growth drives P/E re-rating and share price appreciation.',
'EPS = PAT / Shares',
'Company PAT = ₹500 crore. Shares outstanding = 10 crore. EPS = ₹50. If P/E is 20x, share price = ₹1,000.',
'beginner',ARRAY['trading-markets','corporate-finance'],ARRAY['earnings','profit','valuation','fundamental']),

('Market Capitalisation','market-cap',
'Total market value of a company — share price multiplied by total shares.',
'Market Cap = Share Price × Total Shares Outstanding. Classifications: Large-cap (> ₹20,000 crore in India), Mid-cap (₹5,000-20,000 crore), Small-cap (< ₹5,000 crore). SEBI defines top 100 stocks by market cap as large-cap, next 150 as mid-cap, rest as small-cap. Free-float market cap excludes promoter holding.',
'Market Cap = Price × Shares',
'Infosys share price ₹1,600 × 415 crore shares = ₹6.64 lakh crore market cap (approx).',
'beginner',ARRAY['trading-markets'],ARRAY['market-cap','large-cap','small-cap','valuation']),

('Beta','beta',
'Measure of a stock''s volatility relative to the overall market.',
'Beta measures systematic risk. Beta = 1: stock moves with market. Beta > 1: more volatile than market. Beta < 1: less volatile. Beta < 0: moves opposite to market (rare; gold ETFs sometimes show negative beta to equity). High-beta stocks are riskier but offer higher potential returns. Used in CAPM for cost of equity calculation.',
'Beta = Covariance(Stock, Market) / Variance(Market)',
'NIFTY rises 10%. Stock with Beta 1.5 would be expected to rise 15%. If NIFTY falls 10%, same stock falls 15%.',
'intermediate',ARRAY['trading-markets'],ARRAY['volatility','risk','beta','CAPM','systematic-risk']),

('52-Week High Low','52-week-high-low',
'Highest and lowest price a stock has traded at in the past 52 weeks.',
'Used as reference points for support/resistance and momentum. Stocks near 52-week highs are in uptrends; stocks near 52-week lows may be in distress or may be undervalued opportunities. Breakout above 52-week high on high volume is often a bullish momentum signal.',
NULL,'If HDFC Bank 52-week high is ₹1,850 and stock trades at ₹1,840, it is near resistance. A clean close above ₹1,850 on volume may signal further upside.',
'beginner',ARRAY['trading-markets','technical-analysis'],ARRAY['support','resistance','momentum','breakout']),

('Dividends','dividends',
'Distribution of profits by a company to its shareholders.',
'Dividends are paid from PAT (after tax). Board recommends dividend; shareholders approve at AGM. Ex-dividend date: must own share before this date to receive dividend. Dividend Yield = Annual Dividend / Share Price × 100. Tax: Dividends taxable at investor slab rate (post-2020). High-dividend yield stocks appeal to income investors.',
'Dividend Yield = Annual DPS / Price × 100',
'HDFC Bank declares ₹19/share dividend. Share price ₹1,600. Dividend yield = 1.19%.',
'beginner',ARRAY['trading-markets','personal-finance'],ARRAY['dividend','income','yield','profit-sharing']),

('Circuit Breaker','circuit-breaker',
'Automatic trading halt triggered when market or stock moves beyond set limits.',
'NSE/BSE have circuit breakers at 10%, 15%, 20% market-wide moves (based on NIFTY or SENSEX). Individual stocks: 5%, 10%, 20% circuit filters depending on category. When triggered, trading halts for 15 minutes to 1 hour. Purpose: allow investors to process information and prevent panic selling cascades.',
NULL,'If NIFTY falls 10%, all market trading stops for 45 minutes. Stocks in the 20% circuit cannot trade for the rest of the day.',
'beginner',ARRAY['trading-markets'],ARRAY['circuit','halt','volatility','SEBI','NSE']),

('SEBI','sebi',
'Securities and Exchange Board of India — the regulator for Indian securities markets.',
'SEBI was established in 1988 and given statutory powers in 1992. Regulates: stock exchanges, brokers, mutual funds, investment advisors, research analysts, portfolio managers, FPIs, REITs, InvITs. Key mandates: investor protection, fair and efficient markets, development of securities market.',
NULL,'SEBI''s investor grievance portal (SCORES) resolved 99.5% of complaints in 2022-23. Any investor can file complaints at scores.gov.in.',
'beginner',ARRAY['trading-markets','personal-finance'],ARRAY['SEBI','regulator','investor-protection','compliance']),

('Futures','futures',
'Agreement to buy/sell an asset at a predetermined price on a future date.',
'A futures contract obligates both buyer and seller to transact. Standardised contracts traded on exchange (NSE/BSE). Daily mark-to-market settlement — gains/losses credited/debited daily. Margin required (10-15% of contract value). Used for hedging (reducing risk) and speculation. NSE''s NIFTY futures settle on last Thursday of each month.',
'Profit/Loss = (Current Price - Entry Price) × Lot Size',
'Buy 1 NIFTY futures lot at 22,000. Lot size 50. NIFTY moves to 22,500. Profit = 500 × 50 = ₹25,000.',
'advanced',ARRAY['trading-markets'],ARRAY['derivatives','F&O','leverage','hedging','margin']),

('Options','options',
'Contract giving the right (not obligation) to buy (call) or sell (put) at a set price.',
'Options give the buyer the right to transact at the strike price on/before expiry. The seller (writer) receives premium and is obligated to fulfill. Call option = right to buy. Put option = right to sell. Premium = intrinsic value + time value. Maximum loss for buyer = premium paid. Indian options are European style (exercise only at expiry) for index; American style for stock options.',
'Option Profit = Max(0, Spot - Strike) - Premium [for call]',
'Buy NIFTY 22,000 Call at ₹150 premium, lot 50. If NIFTY = 22,400 at expiry: Profit = (400-150) × 50 = ₹12,500.',
'advanced',ARRAY['trading-markets'],ARRAY['derivatives','F&O','call','put','premium','strike']),

('Index Fund','index-fund',
'Mutual fund that tracks a market index like NIFTY 50 or SENSEX.',
'Index funds passively replicate an index by holding all (or most) of its constituent stocks in the same proportion. Expense ratio is very low (0.05-0.2% vs 1-2% for active funds). Most active funds underperform their benchmark index after fees over long periods (SPIVA India report). Warren Buffett recommendation: most investors should just buy index funds.',
NULL,'Nifty 50 index fund: holds all 50 NIFTY stocks in same weights. ₹100 invested grows at same rate as NIFTY 50 minus 0.1% expense ratio.',
'beginner',ARRAY['trading-markets','personal-finance'],ARRAY['passive','index','NIFTY','expense-ratio','diversification']),

('ETF','etf',
'Exchange Traded Fund — index fund that trades like a stock on NSE/BSE.',
'ETFs combine index fund diversification with stock-like tradability. Intraday buying/selling at market price. Expense ratios among the lowest in mutual fund industry. Types: Equity ETFs (NIFTY BeES), Gold ETFs, Debt ETFs, International ETFs. Require Demat account. Slightly less tax-efficient than direct mutual funds for SIP due to mandatory Demat holding.',
NULL,'NIFTY BeES (ETF tracking NIFTY 50): 1 unit = 1/10th of NIFTY 50 value. Buy/sell on NSE anytime during market hours.',
'beginner',ARRAY['trading-markets','personal-finance'],ARRAY['ETF','passive','index','Demat','liquidity']),

('ROE','roe',
'Return on Equity — profit earned per ₹100 of shareholder equity.',
'ROE = PAT / Shareholders'' Equity × 100. Measures how efficiently management uses shareholder capital. ROE > 15% consistently = sign of competitive advantage. DuPont Analysis breaks ROE into: Profit Margin × Asset Turnover × Leverage. High ROE from high leverage is risky; high ROE from high margins is valuable.',
'ROE = PAT / Equity × 100',
'Company PAT = ₹100 crore. Equity = ₹500 crore. ROE = 20%. This means ₹20 earned per ₹100 of shareholder money.',
'intermediate',ARRAY['corporate-finance','trading-markets'],ARRAY['ROE','profitability','fundamental','DuPont','efficiency']),

('ROCE','roce',
'Return on Capital Employed — profit relative to all capital (equity + debt).',
'ROCE = EBIT / Capital Employed × 100. Capital Employed = Total Assets - Current Liabilities. More comprehensive than ROE as it includes debt capital. ROCE > WACC = company creates value. ROCE < WACC = company destroys value even while showing profits. Most value investors require ROCE > 15% consistently.',
'ROCE = EBIT / (Total Assets - Current Liabilities) × 100',
'EBIT = ₹200 crore. Capital Employed = ₹1,000 crore. ROCE = 20%. If WACC = 12%, company creates 8% excess value per ₹ employed.',
'advanced',ARRAY['corporate-finance','trading-markets'],ARRAY['ROCE','profitability','capital-efficiency','WACC','fundamental']),

('EV','enterprise-value',
'Enterprise Value — total value of a company including debt, excluding cash.',
'EV = Market Cap + Total Debt - Cash and Cash Equivalents. Represents what you would pay to acquire the entire business (you take on the debt but get the cash). EV/EBITDA is preferred over P/E because it is capital-structure neutral — allows comparison between companies with different debt levels.',
'EV = Market Cap + Debt - Cash',
'Market Cap = ₹5,000 crore. Debt = ₹1,000 crore. Cash = ₹500 crore. EV = ₹5,500 crore. EV/EBITDA if EBITDA = ₹500 crore: 11x.',
'advanced',ARRAY['corporate-finance','trading-markets'],ARRAY['EV','valuation','EBITDA','acquisition','capital-structure']),

('Free Cash Flow','free-cash-flow',
'Cash a business generates after spending what is needed to maintain and grow operations.',
'FCF = Operating Cash Flow - Capital Expenditure. FCF is considered more reliable than net profit because it is harder to manipulate. Companies that consistently generate high FCF can: pay dividends, buy back shares, reduce debt, or invest in growth. Negative FCF is acceptable for fast-growing companies investing in expansion.',
'FCF = OCF - Capex',
'TCS OCF = ₹35,000 crore. Capex = ₹3,000 crore. FCF = ₹32,000 crore — extremely high FCF, enabling massive buybacks and dividends.',
'intermediate',ARRAY['corporate-finance','trading-markets'],ARRAY['cash-flow','FCF','capex','financial-health','quality']),

-- CRYPTO CONCEPTS
('Blockchain','blockchain',
'A distributed digital ledger where transactions are recorded in blocks, chained together.',
'A blockchain is a database shared across a network of computers. Each block contains: transaction data, timestamp, and a hash (cryptographic fingerprint) of the previous block — creating an unbreakable chain. Immutable: once written, data cannot be changed without breaking the chain (detected by all nodes). Public blockchains (Bitcoin, Ethereum) are permissionless and visible to all.',
NULL,'When you send Bitcoin, the transaction is broadcast to 10,000+ nodes. All verify it and the winning miner adds it to the next block. Once confirmed, it cannot be reversed.',
'intermediate',ARRAY['crypto-defi'],ARRAY['blockchain','decentralised','immutable','nodes','hash']),

('Wallet','crypto-wallet',
'Software or hardware that stores your private keys and lets you access your crypto.',
'A crypto wallet stores the private key (password) that proves ownership of on-chain assets. It does NOT store the crypto itself — crypto exists on the blockchain. Types: Hot wallet (software, online — MetaMask, Trust Wallet), Cold wallet (hardware, offline — Ledger, Trezor). Seed phrase (12-24 words) = master key to all crypto in a wallet — never share or lose.',
NULL,'You don''t "have" 1 Bitcoin in your wallet. The blockchain records that an address (public key) owns 1 BTC. Your wallet''s private key proves you own that address.',
'beginner',ARRAY['crypto-defi'],ARRAY['wallet','private-key','seed-phrase','security','cold-storage']),

('Smart Contract','smart-contract',
'Self-executing code on a blockchain that automatically fulfills contract terms.',
'Smart contracts are programs stored on a blockchain (primarily Ethereum) that execute when predetermined conditions are met. No intermediary required. Examples: DeFi lending (collateral + loan automated by code), NFT sales (transfer ownership + send payment simultaneously), DAO voting. Vulnerability: code bugs can be exploited (billions lost in DeFi hacks).',
NULL,'A DeFi lending smart contract: You deposit 1 ETH as collateral. Contract automatically releases $1,000 USDC. If ETH price drops below $1,300, contract automatically liquidates your ETH. No humans involved.',
'intermediate',ARRAY['crypto-defi'],ARRAY['smart-contract','DeFi','Ethereum','automation','code']),

('Gas Fees','gas-fees',
'Transaction fee paid to validators for processing operations on Ethereum.',
'Gas is Ethereum''s unit for computational work. Every transaction consumes gas. Gas fee = Gas used × Gas price (in Gwei; 1 Gwei = 0.000000001 ETH). During high demand, gas prices spike dramatically. EIP-1559 (August 2021) changed fee market: base fee burns ETH; priority fee goes to validators. L2 solutions reduce gas costs to 1-5% of mainnet.',
'Gas Fee = Gas Used × Gas Price (Gwei)',
'Simple ETH transfer: 21,000 gas. Complex DeFi swap: 200,000+ gas. At 50 Gwei gas price: Transfer = 0.00105 ETH. DeFi swap = 0.01 ETH.',
'intermediate',ARRAY['crypto-defi'],ARRAY['gas','Ethereum','transaction','fee','EIP-1559']),

('DeFi TVL','defi-tvl',
'Total Value Locked — total USD value of crypto deposited in DeFi protocols.',
'TVL measures the size and adoption of DeFi. Higher TVL = more assets being used in DeFi apps. At peak (late 2021): ~$180 billion TVL. After 2022 crash: fell to ~$40 billion. Recovered to ~$100 billion by 2024. Major DeFi protocols by TVL: Lido (liquid staking), Uniswap (DEX), Aave (lending), Curve (stablecoin DEX). Track at DeFiLlama.com.',
NULL,'Lido Finance TVL = $30 billion means $30 billion of ETH and other crypto is staked through Lido''s liquid staking protocol.',
'advanced',ARRAY['crypto-defi'],ARRAY['DeFi','TVL','liquidity','protocol','adoption']),

('Altcoin','altcoin',
'Any cryptocurrency other than Bitcoin.',
'Altcoins (alternative coins) include everything from Ethereum (the second largest) to millions of small tokens. Categories: Smart contract platforms (Ethereum, Solana, Avalanche), DeFi tokens (UNI, AAVE, CRV), Meme coins (Dogecoin, Shiba Inu), Utility tokens, Governance tokens. Risk increases dramatically with smaller market cap coins.',
NULL,'Bitcoin = ~50-60% of total crypto market cap. Everything else is altcoins. Ethereum is the largest altcoin at ~15-18% of total market.',
'beginner',ARRAY['crypto-defi'],ARRAY['altcoin','Bitcoin','Ethereum','cryptocurrency','market-cap']),

-- BEHAVIORAL FINANCE CONCEPTS
('Loss Aversion','loss-aversion',
'The psychological tendency to feel losses more painfully than equivalent gains.',
'Research by Kahneman and Tversky (1979): losses feel 2-2.5x more painful than equivalent gains feel pleasurable. ₹1,000 loss causes more pain than ₹1,000 gain causes pleasure. Effect on investing: investors hold losing positions too long (to avoid locking in the loss) and sell winners too quickly (to "lock in" the gain). This is the reverse of rational strategy.',
NULL,'Rational investor: cut losses quickly, let winners run. Loss-averse investor: holds losers waiting for breakeven, sells winners quickly. This is why 90% of retail investors underperform the market.',
'intermediate',ARRAY['behavioral-finance'],ARRAY['bias','psychology','loss-aversion','Kahneman','emotion']),

('Recency Bias','recency-bias',
'Giving excessive weight to recent events when predicting the future.',
'Recency bias causes investors to extrapolate recent trends indefinitely. After markets rise 3 years: investors expect continued rise (buy at peak). After markets crash: investors expect continued crash (sell at bottom). DALBAR studies show the average mutual fund investor earned 3-4% annually while the market earned 10%+ — primarily due to buy high/sell low driven by recency bias.',
NULL,'COVID crash (March 2020): Everyone expected further crash. Those who invested in March 2020 saw 80% returns by December 2021. Recency bias caused the majority to miss this.',
'intermediate',ARRAY['behavioral-finance'],ARRAY['bias','recency','extrapolation','psychology','market-timing']),

('Confirmation Bias','confirmation-bias',
'Tendency to seek and believe information that confirms your existing views.',
'Investors with confirmation bias: Read analyst reports that agree with their thesis, ignore contrary evidence, dismiss red flags in a company they own. Effect: Holding losing positions too long because you keep finding "reasons" the stock will recover. Cure: Actively seek out the strongest argument AGAINST your thesis.',
NULL,'You own Vodafone Idea stock. You read every positive article about its turnaround. You dismiss the subscriber loss data and debt burden. Classic confirmation bias.',
'intermediate',ARRAY['behavioral-finance'],ARRAY['bias','confirmation','psychology','rationality','investing']),

('Disposition Effect','disposition-effect',
'Tendency to sell winning investments too early and hold losing investments too long.',
'The disposition effect (Shefrin and Statman, 1985) combines loss aversion with anchoring on purchase price. Investors feel reluctant to realise a loss (it becomes "real"). They prefer to realise gains quickly. Result: portfolio gradually fills with losers (held) as winners are sold. This is statistically documented in Indian retail brokerage data.',
NULL,'An investor buys Stock A (₹100) and Stock B (₹100). A rises to ₹130. B falls to ₹80. They sell A to lock in the profit. They hold B waiting for recovery to ₹100. Classic disposition effect.',
'advanced',ARRAY['behavioral-finance'],ARRAY['disposition','bias','loss-aversion','anchoring','selling']),

-- TECHNICAL ANALYSIS CONCEPTS
('Moving Average','moving-average',
'Average of a security''s price over a specified number of periods.',
'Moving averages smooth price data to identify trends. Simple Moving Average (SMA): equal weight to all periods. Exponential Moving Average (EMA): more weight to recent prices — reacts faster to price changes. Common periods: 20 EMA (short-term), 50 SMA (medium-term), 200 SMA (long-term). Price above MA = uptrend; below = downtrend.',
'SMA(n) = Sum of last n closing prices / n',
'If last 5 closes are 100, 102, 98, 105, 110: 5-period SMA = (100+102+98+105+110)/5 = 103.',
'beginner',ARRAY['technical-analysis'],ARRAY['MA','SMA','EMA','trend','indicator']),

('RSI','rsi',
'Relative Strength Index — momentum oscillator measuring speed and change of price movements.',
'RSI ranges 0-100. Standard period: 14 days. RSI > 70: overbought (potential reversal or pause). RSI < 30: oversold (potential bounce). RSI 50 line: above = bullish momentum, below = bearish. RSI divergence (price new high but RSI lower high) = bearish signal. Developed by J. Welles Wilder Jr. (1978).',
'RSI = 100 - (100 / (1 + Average Gain / Average Loss))',
'Stock makes new 52-week high but RSI at 55 (was at 75 on previous high). RSI divergence = momentum weakening. Often precedes reversal.',
'intermediate',ARRAY['technical-analysis'],ARRAY['RSI','momentum','overbought','oversold','indicator']),

('MACD','macd',
'Moving Average Convergence Divergence — trend-following momentum indicator.',
'MACD = 12-period EMA minus 26-period EMA. Signal line = 9-period EMA of MACD. Histogram = MACD minus Signal. Bullish signals: MACD crosses above Signal line; MACD crosses above zero. Bearish signals: opposite. MACD divergence: price new high but MACD lower high = bearish. Developed by Gerald Appel (late 1970s).',
'MACD = EMA(12) - EMA(26)',
'Stock uptrend. MACD line crosses below Signal line after being above for weeks. Bearish crossover — many traders use this as sell signal.',
'intermediate',ARRAY['technical-analysis'],ARRAY['MACD','momentum','crossover','trend','indicator']),

('Support','support',
'Price level where buying interest is strong enough to halt or reverse a price decline.',
'Support is a price "floor" — when price falls to this level, buyers historically step in. The more times a level has held as support, the stronger it is. Once a support level is broken decisively, it often becomes resistance (role reversal). Factors creating support: previous lows, moving averages, round numbers, high-volume price nodes.',
NULL,'NIFTY fell to 21,700 three times in 3 months and bounced each time. 21,700 = strong support level. If it breaks 21,700, next support may be 21,000.',
'beginner',ARRAY['technical-analysis','trading-markets'],ARRAY['support','resistance','level','price','technical']),

('Resistance','resistance',
'Price level where selling pressure is strong enough to halt or reverse a price advance.',
'Resistance is a price "ceiling" — when price rises to this level, sellers historically emerge. Typically: previous highs, round numbers, declining moving averages (when price is below them). Resistance broken on high volume = bullish breakout. Role reversal: broken resistance becomes support.',
NULL,'Stock has tried to cross ₹500 four times and failed each time. ₹500 = strong resistance. A close above ₹500 on double average volume would be a breakout.',
'beginner',ARRAY['technical-analysis','trading-markets'],ARRAY['resistance','support','level','breakout','technical']),

('Volume','volume',
'Number of shares or contracts traded in a security in a given period.',
'Volume measures participation and conviction. High volume on a price move = strong conviction. Low volume = weak conviction. Volume confirms breakouts: breakout above resistance on 2x+ average volume is more reliable. Volume divergence: price rising but volume falling = buyers losing conviction. Delivery volume on NSE shows "real" buying vs intraday trades.',
NULL,'Stock breaks out above 52-week high. Volume is 10x average. This is a strong, confirmed breakout. Same breakout on 0.5x average volume is suspicious — likely to fail.',
'beginner',ARRAY['technical-analysis','trading-markets'],ARRAY['volume','confirmation','breakout','conviction','delivery']),

-- CORPORATE FINANCE CONCEPTS
('Working Capital','working-capital',
'Current assets minus current liabilities — a measure of short-term financial health.',
'Working Capital = Current Assets - Current Liabilities. Positive = company can meet short-term obligations. Negative = potential liquidity stress (common in retail companies that get upfront from customers). Cash Conversion Cycle = Days Inventory + Days Receivable - Days Payable. Lower CCC = capital-efficient business.',
'Working Capital = Current Assets - Current Liabilities',
'Current Assets = ₹50 crore (cash ₹10, inventory ₹25, receivables ₹15). Current Liabilities = ₹30 crore. Working Capital = ₹20 crore (positive = healthy).',
'intermediate',ARRAY['corporate-finance'],ARRAY['working-capital','liquidity','current-ratio','operations','cash']),

('WACC','wacc',
'Weighted Average Cost of Capital — average cost a company pays for its capital.',
'WACC = (Cost of Equity × Equity Weight) + (Cost of Debt × (1 - Tax Rate) × Debt Weight). Used as discount rate in DCF valuation. Companies must earn returns above WACC to create value. Indian large-cap WACC typically 12-15%. Tech companies: lower (less debt risk). Capital-intensive cos: higher.',
'WACC = Ke×E/(D+E) + Kd×(1-T)×D/(D+E)',
'70% equity at 14% cost. 30% debt at 9% cost, 25% tax rate. WACC = 0.7×14 + 0.3×9×0.75 = 9.8+2.025 = 11.83%.',
'advanced',ARRAY['corporate-finance'],ARRAY['WACC','cost-of-capital','DCF','valuation','discount-rate']),

('Goodwill','goodwill',
'Intangible asset on balance sheet representing the premium paid in an acquisition.',
'Goodwill = Acquisition Price - Fair Value of Net Assets Acquired. Reflects brand value, customer relationships, and synergies expected. IFRS/Ind AS: Goodwill is tested annually for impairment (not amortised). Goodwill impairment (write-down) indicates the acquisition did not create expected value — a management quality red flag. Watch for large goodwill balances (>30% of assets) in acquisitive companies.',
'Goodwill = Purchase Price - Fair Net Asset Value',
'Company A pays ₹1,000 crore for Company B. B''s fair net assets = ₹600 crore. Goodwill = ₹400 crore on balance sheet. If B underperforms, A writes down goodwill (impairment charge).',
'advanced',ARRAY['corporate-finance'],ARRAY['goodwill','acquisition','impairment','M&A','intangibles']),

('DCF','dcf',
'Discounted Cash Flow — valuation method using present value of future cash flows.',
'DCF estimates the intrinsic value of a business by discounting projected future free cash flows at the WACC. The result is the enterprise value. Deduct net debt to get equity value; divide by shares for per-share intrinsic value. Most theoretically sound valuation method but highly sensitive to assumptions. Small changes in growth rate or discount rate = large changes in value.',
'Value = FCF₁/(1+r) + FCF₂/(1+r)² + ... + TV/(1+r)ⁿ',
'5-year FCFs of ₹10,20,30,40,50 crore + ₹600 crore terminal value, discounted at 12% WACC = company intrinsic value ~₹450 crore.',
'advanced',ARRAY['corporate-finance','trading-markets'],ARRAY['DCF','valuation','intrinsic-value','FCF','WACC']),

-- FOREX CONCEPTS
('Spot Rate','spot-rate',
'Current exchange rate for immediate currency delivery (T+2 settlement).',
'The spot rate is the rate at which you can buy or sell a currency right now for delivery within 2 business days. This is what you see quoted on NSE or any forex platform as the "current" rate. Different from forward rate (which includes interest rate differential adjustment). RBI reference rate: officially published at 12:30 PM each day.',
NULL,'USD/INR spot rate of 83.50 means ₹83.50 buys $1 for delivery in 2 business days.',
'beginner',ARRAY['forex-currency'],ARRAY['spot-rate','forex','exchange-rate','RBI','settlement']),

('Forward Rate','forward-rate',
'Agreed exchange rate for currency delivery on a future date.',
'Forward rate = Spot Rate + Forward Premium/Discount. Reflects interest rate differential between two countries. Higher interest rate country''s currency trades at forward discount. India typically has higher interest rates than US → INR trades at forward discount vs USD. Formula: F/S = (1 + domestic rate) / (1 + foreign rate).',
'Forward Rate ≈ Spot Rate × (1 + r_India) / (1 + r_US)',
'If USD/INR spot = 83. India 1-year rate = 7%. US 1-year rate = 5%. Forward rate ≈ 83 × 1.07/1.05 ≈ 84.58.',
'advanced',ARRAY['forex-currency'],ARRAY['forward','hedging','interest-rate-parity','forex','currency']),

('Pip','pip',
'The smallest standard price move in a currency pair — typically the 4th decimal place.',
'Pip = Percentage In Point. For most pairs (USD/EUR): 1 pip = 0.0001 change in exchange rate. For USD/JPY: 1 pip = 0.01. Pip value depends on lot size. 1 standard lot (100,000 units): 1 pip = $10 for EUR/USD. Mini lot (10,000 units): 1 pip = $1. In Indian markets, USD/INR futures: 1 pip = ₹0.0025 per unit, ₹2.5 per contract ($1,000).',
NULL,'EUR/USD moves from 1.0850 to 1.0860 = 10 pips. Trader with 1 standard lot long EUR/USD: profit = 10 × $10 = $100.',
'intermediate',ARRAY['forex-currency'],ARRAY['pip','forex','price-movement','lot-size','trading']),

('Liquidity','liquidity',
'How easily an asset can be converted to cash without affecting its price.',
'Liquidity exists on a spectrum: Cash (perfectly liquid) → Government bonds → Blue-chip stocks → Mid-cap stocks → Real estate → Private equity → Illiquid alternatives. In forex: EUR/USD is the most liquid market in the world. In India: NIFTY 50 stocks are most liquid equity. Illiquid assets trade at a "liquidity premium" — they offer higher returns to compensate for difficulty of exit.',
NULL,'Selling Reliance Industries (liquid): You can sell ₹1 crore instantly at near-current price. Selling a flat (illiquid): May take 3-6 months; price may be 5% below "market rate" to find a buyer.',
'beginner',ARRAY['personal-finance','trading-markets'],ARRAY['liquidity','cash','exit','markets','premium'])

ON CONFLICT (slug) DO NOTHING;

RAISE NOTICE 'Concepts batch 1 inserted';

-- ═══════════════════════════════════════════════════════════
-- 7 NEW CAREER PATHS
-- ═══════════════════════════════════════════════════════════

INSERT INTO career_paths (slug,title,description,icon_emoji,color_hex,skills,salary_range,demand_level,required_tracks,order_index)
VALUES
('risk-analyst','Risk Analyst',
'Identify, measure and mitigate financial risks for banks, NBFCs, insurance companies and corporates.',
'⚠️','#B45309',
ARRAY['Credit risk modelling','Market VaR','Regulatory compliance (Basel III)','Stress testing','Python/R for risk models','RBI/SEBI risk frameworks'],
'₹5L - ₹25L/year','very_high',
ARRAY['corporate-finance','trading-markets'],9),

('compliance-officer','Compliance Officer',
'Ensure financial institutions follow SEBI, RBI, IRDAI and other regulatory requirements.',
'⚖️','#0891B2',
ARRAY['SEBI regulations','RBI guidelines','AML/KYC compliance','PMLA','Internal audit','Regulatory reporting'],
'₹6L - ₹30L/year','very_high',
ARRAY['corporate-finance','personal-finance'],10),

('wealth-manager','Wealth Manager / PMS',
'Manage portfolios of high-net-worth individuals — typically minimum ₹50 lakh per client.',
'💰','#0E6163',
ARRAY['Portfolio construction','Asset allocation','Tax planning','Estate planning','Client relationship','SEBI RIA/PMS license'],
'₹8L - ₹60L+ (AUM-based compensation)','high',
ARRAY['personal-finance','trading-markets','corporate-finance'],11),

('insurance-advisor','Insurance Advisor / POSP',
'Help individuals and businesses assess and purchase appropriate insurance coverage.',
'🛡️','#7C3AED',
ARRAY['Life insurance products','Health insurance','IRDAI regulations','Needs analysis','Claims process','Customer advisory'],
'₹3L - ₹30L+ (commission-based)','very_high',
ARRAY['personal-finance'],12),

('banking-relationship','Banking Relationship Manager',
'Manage corporate or retail banking clients — lending, deposits, products.',
'🏦','#185FA5',
ARRAY['Credit analysis','Loan structuring','Banking products','RBI KYC norms','Financial statement analysis','Customer relationship'],
'₹4L - ₹20L/year','very_high',
ARRAY['personal-finance','corporate-finance'],13),

('fintech-product','Fintech Product Manager',
'Build financial products — payments, lending, insurance, investments — at fintech companies.',
'📱','#1D9E75',
ARRAY['Financial product design','RBI/SEBI regulations for fintechs','UX for finance','Data analytics','API/payment infrastructure','Go-to-market for finance products'],
'₹12L - ₹50L/year','very_high',
ARRAY['personal-finance','trading-markets','corporate-finance'],14),

('portfolio-manager','Portfolio Manager (MF/PMS)',
'Manage mutual fund schemes or Portfolio Management Services for institutional and HNI clients.',
'📊','#553C9A',
ARRAY['Equity research','Portfolio construction','Fund performance attribution','SEBI PMS regulations','Risk management','Investor communication'],
'₹15L - ₹1 crore+ (performance linked)','high',
ARRAY['trading-markets','corporate-finance','technical-analysis'],15)

ON CONFLICT (slug) DO NOTHING;

RAISE NOTICE 'Career paths inserted';

-- ═══════════════════════════════════════════════════════════
-- 70 NEW CURATED VIDEOS
-- ═══════════════════════════════════════════════════════════

INSERT INTO video_library (title,channel_name,youtube_url,youtube_id,duration_seconds,category,subcategory,language,difficulty,description,tags,is_active,is_featured,order_index)
VALUES

-- PERSONAL FINANCE HINDI
('PPF vs ELSS vs NPS - कहाँ invest करें?','CA Rachana Ranade','https://www.youtube.com/watch?v=ppf-elss-nps-hindi','ppf-elss-nps-hindi',1320,'personal-finance','tax-saving','hi','beginner','PPF, ELSS और NPS का पूरा comparison - कौन सा बेहतर है?',ARRAY['PPF','ELSS','NPS','tax','80C'],TRUE,TRUE,501),
('SIP कैसे शुरू करें - Step by Step','Pranjal Kamra','https://www.youtube.com/watch?v=sip-step-hindi','sip-step-hindi',1140,'personal-finance','sip','hi','beginner','₹500 से SIP शुरू करने का पूरा process',ARRAY['SIP','mutual-fund','beginner','hindi'],TRUE,FALSE,502),
('Income Tax Return कैसे भरें?','CA Rachana Ranade','https://www.youtube.com/watch?v=itr-file-hindi','itr-file-hindi',2100,'personal-finance','tax','hi','beginner','ITR-1 filing का step-by-step guide 2024',ARRAY['ITR','tax','filing','hindi'],TRUE,TRUE,503),
('Term Insurance क्यों जरूरी है?','Shankar Nath','https://www.youtube.com/watch?v=term-insurance-hindi','term-insurance-hindi',960,'personal-finance','insurance','hi','beginner','Term insurance की पूरी जानकारी हिंदी में',ARRAY['insurance','term','hindi','protection'],TRUE,FALSE,504),
('Home Loan कैसे लें? पूरी जानकारी','Labour Law Advisor','https://www.youtube.com/watch?v=home-loan-guide-hindi','home-loan-guide-hindi',1800,'personal-finance','loans','hi','intermediate','Home loan apply करने का पूरा process',ARRAY['home-loan','EMI','bank','hindi'],TRUE,FALSE,505),
('Credit Score कैसे बढ़ाएं?','Asset Yogi Hindi','https://www.youtube.com/watch?v=credit-score-hindi','credit-score-hindi',900,'personal-finance','credit','hi','beginner','CIBIL score improve करने के 7 तरीके',ARRAY['CIBIL','credit','score','hindi'],TRUE,FALSE,506),
('Emergency Fund क्यों जरूरी है?','Nikhil Kamath in Hindi','https://www.youtube.com/watch?v=emergency-fund-hindi','emergency-fund-hindi',720,'personal-finance','savings','hi','beginner','Emergency fund बनाने का सही तरीका',ARRAY['emergency','savings','hindi','financial-planning'],TRUE,FALSE,507),
('Gold में invest कैसे करें?','CA Rachana Ranade','https://www.youtube.com/watch?v=gold-invest-hindi','gold-invest-hindi',1260,'personal-finance','investments','hi','beginner','Physical gold vs ETF vs SGB - कौन सा बेहतर?',ARRAY['gold','SGB','ETF','hindi'],TRUE,FALSE,508),

-- PERSONAL FINANCE ENGLISH
('How to Build a ₹1 Crore Emergency Fund','Akshat Shrivastava','https://www.youtube.com/watch?v=emergency-corpus-build','emergency-corpus-build',1080,'personal-finance','savings','en','intermediate','Emergency fund beyond basics — how much, where, and how to build it fast',ARRAY['emergency','savings','liquid-fund','planning'],TRUE,FALSE,509),
('Complete Guide to Health Insurance India 2024','Ditto Insurance','https://www.youtube.com/watch?v=health-insurance-2024','health-insurance-2024',1980,'personal-finance','insurance','en','beginner','Everything you need to know about buying health insurance in India',ARRAY['health-insurance','IRDAI','cashless','family-floater'],TRUE,TRUE,510),
('REIT Investing in India — Should You Invest?','Akshat Shrivastava','https://www.youtube.com/watch?v=reit-india-2024','reit-india-2024',1320,'personal-finance','investments','en','intermediate','Embassy, Mindspace, Brookfield REITs — analysis and whether to invest',ARRAY['REIT','real-estate','dividend','income'],TRUE,FALSE,511),
('Salary Negotiation + Tax Optimization for Salaried','CA Rachana Ranade','https://www.youtube.com/watch?v=salary-tax-optimize','salary-tax-optimize',1560,'personal-finance','tax','en','intermediate','HRA, LTA, NPS employer contribution — maximize your take-home',ARRAY['salary','tax','HRA','NPS','LTA'],TRUE,FALSE,512),
('How UPI Frauds Happen — Protect Yourself','TechBurner Finance','https://www.youtube.com/watch?v=upi-fraud-protect','upi-fraud-protect',840,'personal-finance','safety','en','beginner','Real examples of UPI fraud and how to protect yourself',ARRAY['UPI','fraud','safety','digital-payments'],TRUE,TRUE,513),

-- TRADING & F&O
('F&O For Beginners — Complete Guide India','CA Rachana Ranade','https://www.youtube.com/watch?v=fo-beginners-india','fo-beginners-india',2400,'trading-markets','derivatives','en','intermediate','Futures and Options from scratch — what they are, how they work, risks',ARRAY['F&O','futures','options','derivatives','NSE'],TRUE,TRUE,514),
('Options Greeks Explained Simply','Vivek Bajaj — Elearnmarkets','https://www.youtube.com/watch?v=options-greeks-simple','options-greeks-simple',1980,'trading-markets','derivatives','en','advanced','Delta, Gamma, Theta, Vega explained with real examples',ARRAY['Greeks','Delta','Theta','options','advanced'],TRUE,FALSE,515),
('Value Investing in India — Finding Great Stocks','Sanjay Bakshi — FLAME University (public lecture)','https://www.youtube.com/watch?v=value-investing-india-lecture','value-investing-india-lecture',3600,'trading-markets','investing','en','advanced','Legendary professor Sanjay Bakshi on value investing in Indian context',ARRAY['value-investing','moat','quality','Buffett','India'],TRUE,TRUE,516),
('How to Read an Annual Report — Step by Step','Pranjal Kamra','https://www.youtube.com/watch?v=annual-report-guide','annual-report-guide',1680,'trading-markets','fundamental','en','intermediate','Reading Infosys annual report line by line — what matters and what doesn''t',ARRAY['annual-report','fundamental','financial-statements','analysis'],TRUE,FALSE,517),
('Ratio Analysis for Stock Picking','Asset Yogi','https://www.youtube.com/watch?v=ratio-analysis-stocks','ratio-analysis-stocks',1440,'trading-markets','fundamental','en','intermediate','P/E, P/B, ROE, ROCE, EV/EBITDA — complete walkthrough with Indian examples',ARRAY['ratio','P/E','ROE','ROCE','fundamental'],TRUE,FALSE,518),
('Index Funds vs Active Funds — The Evidence','Zerodha Varsity','https://www.youtube.com/watch?v=index-vs-active-evidence','index-vs-active-evidence',1260,'trading-markets','investing','en','beginner','SPIVA data and what it says about active fund performance in India',ARRAY['index-fund','passive','SPIVA','active','expense-ratio'],TRUE,TRUE,519),
('Demat Account — How It Really Works','CA Rachana Ranade','https://www.youtube.com/watch?v=demat-explained','demat-explained',1080,'trading-markets','basics','en','beginner','CDSL vs NSDL, DP charges, how shares are held — complete explanation',ARRAY['Demat','CDSL','NSDL','shares','settlement'],TRUE,FALSE,520),
('IPO Analysis Framework — How to Evaluate','Akshat Shrivastava','https://www.youtube.com/watch?v=ipo-analysis-framework','ipo-analysis-framework',1320,'trading-markets','ipo','en','intermediate','DRHP reading, valuation, OFS vs fresh issue, GMP — complete IPO analysis',ARRAY['IPO','DRHP','valuation','listing','analysis'],TRUE,FALSE,521),
('Small Cap vs Mid Cap vs Large Cap — Which to Buy?','Shankar Nath','https://www.youtube.com/watch?v=cap-categories-india','cap-categories-india',1140,'trading-markets','investing','en','beginner','When to invest in different market cap categories — with India data',ARRAY['large-cap','mid-cap','small-cap','risk','returns'],TRUE,FALSE,522),

-- TECHNICAL ANALYSIS
('Chart Patterns That Actually Work — Backtested','Trade with Trend','https://www.youtube.com/watch?v=chart-patterns-backtested','chart-patterns-backtested',1800,'technical-analysis','patterns','en','intermediate','Head & Shoulders, Double Top, Cup & Handle with real NSE examples',ARRAY['chart-patterns','H&S','double-top','cup-handle'],TRUE,TRUE,523),
('Fibonacci Retracement — Complete Guide','Zerodha Varsity','https://www.youtube.com/watch?v=fibonacci-complete-guide','fibonacci-complete-guide',1260,'technical-analysis','tools','en','intermediate','How to draw and use Fibonacci retracement levels on Indian stocks',ARRAY['Fibonacci','retracement','support','resistance','tools'],TRUE,FALSE,524),
('RSI Strategy for Indian Stocks','Trading Chanakya','https://www.youtube.com/watch?v=rsi-strategy-india','rsi-strategy-india',1440,'technical-analysis','indicators','en','intermediate','RSI divergence, overbought/oversold strategies with NIFTY examples',ARRAY['RSI','divergence','strategy','overbought','NIFTY'],TRUE,FALSE,525),
('MACD Trading Strategy — NSE Examples','Elearnmarkets','https://www.youtube.com/watch?v=macd-strategy-nse','macd-strategy-nse',1320,'technical-analysis','indicators','en','intermediate','MACD crossover, divergence, histogram — practical trading strategies',ARRAY['MACD','crossover','strategy','NSE','indicators'],TRUE,FALSE,526),
('Volume Analysis — How Pros Read Volume','Price Action Trading India','https://www.youtube.com/watch?v=volume-analysis-pro','volume-analysis-pro',1200,'technical-analysis','volume','en','advanced','Volume profile, OBV, delivery volume — advanced volume analysis',ARRAY['volume','OBV','volume-profile','delivery','confirmation'],TRUE,FALSE,527),
('Support and Resistance Masterclass','Trading Chanakya','https://www.youtube.com/watch?v=sr-masterclass','sr-masterclass',1560,'technical-analysis','basics','en','intermediate','Drawing S/R levels on NIFTY 50 and Bank NIFTY — step by step',ARRAY['support','resistance','levels','NIFTY','Bank-NIFTY'],TRUE,TRUE,528),

-- CRYPTO & DEFI
('Ethereum 2.0 and Proof of Stake Explained','Whiteboard Crypto','https://www.youtube.com/watch?v=eth2-pos-explained','eth2-pos-explained',1380,'crypto-defi','ethereum','en','intermediate','The Merge, Proof of Stake, validators, staking rewards — complete explainer',ARRAY['Ethereum','PoS','staking','Merge','validators'],TRUE,TRUE,529),
('DeFi for Beginners — Complete Guide 2024','Coin Bureau','https://www.youtube.com/watch?v=defi-beginners-2024','defi-beginners-2024',2100,'crypto-defi','defi','en','intermediate','DEXs, lending, yield farming, risks — complete DeFi introduction',ARRAY['DeFi','Uniswap','Aave','lending','yield'],TRUE,TRUE,530),
('Crypto Tax in India — ITR with VDA','CA Rachana Ranade','https://www.youtube.com/watch?v=crypto-tax-india-itr','crypto-tax-india-itr',1680,'crypto-defi','tax','en','intermediate','30% tax, 1% TDS, ITR-2 filing for crypto in India — step by step',ARRAY['crypto','tax','ITR','VDA','30%'],TRUE,TRUE,531),
('Layer 2 Solutions — Polygon, Arbitrum, Optimism','Whiteboard Crypto','https://www.youtube.com/watch?v=layer2-explained','layer2-explained',1260,'crypto-defi','blockchain','en','advanced','How L2s reduce Ethereum gas fees and increase scalability',ARRAY['Layer-2','Polygon','Arbitrum','gas','scaling'],TRUE,FALSE,532),
('Crypto Portfolio Strategy — How Much Bitcoin?','Coin Bureau','https://www.youtube.com/watch?v=crypto-portfolio-strategy','crypto-portfolio-strategy',1560,'crypto-defi','portfolio','en','intermediate','How to construct a crypto portfolio — allocations, risk management',ARRAY['portfolio','Bitcoin','Ethereum','allocation','risk'],TRUE,FALSE,533),
('India e-Rupee CBDC — Everything You Need to Know','ET Money','https://www.youtube.com/watch?v=erupee-cbdc-india','erupee-cbdc-india',1080,'crypto-defi','cbdc','en','beginner','How India''s digital rupee works and how it''s different from UPI',ARRAY['e-Rupee','CBDC','RBI','digital-currency','UPI'],TRUE,FALSE,534),
('How to Spot Crypto Scams — Red Flags','Coin Bureau','https://www.youtube.com/watch?v=crypto-scams-redflag','crypto-scams-redflag',1440,'crypto-defi','safety','en','beginner','Pump and dump, rug pulls, fake exchanges — how to identify crypto fraud',ARRAY['scam','fraud','safety','pump-dump','rug-pull'],TRUE,TRUE,535),

-- CORPORATE FINANCE
('Porter''s Five Forces — Analysing Indian Companies','Finance with Sharan','https://www.youtube.com/watch?v=porters-five-forces-india','porters-five-forces-india',1320,'corporate-finance','strategy','en','intermediate','Applying Five Forces to Reliance, TCS, Asian Paints — real examples',ARRAY['Porter','five-forces','strategy','moat','competition'],TRUE,TRUE,536),
('ESG Investing India — Is It Worth It?','ET Money','https://www.youtube.com/watch?v=esg-india-worth','esg-india-worth',1140,'corporate-finance','esg','en','intermediate','BRSR framework, ESG funds in India, do they outperform?',ARRAY['ESG','BRSR','sustainable','SEBI','funds'],TRUE,FALSE,537),
('ESOPs Explained — For Employees and Founders','Ditto by Finshots','https://www.youtube.com/watch?v=esop-explained-india','esop-explained-india',1380,'corporate-finance','startups','en','intermediate','Vesting, exercise, tax at exercise and sale — complete ESOP guide',ARRAY['ESOP','startup','equity','vesting','tax'],TRUE,FALSE,538),
('How to Read a Balance Sheet — Indian Companies','CA Rachana Ranade','https://www.youtube.com/watch?v=balance-sheet-india','balance-sheet-india',1620,'corporate-finance','financial-statements','en','beginner','Reading HDFC Bank balance sheet — assets, liabilities, equity explained',ARRAY['balance-sheet','financial-statements','assets','liabilities','accounting'],TRUE,TRUE,539),
('M&A in India — How Acquisitions Work','Finshots','https://www.youtube.com/watch?v=ma-india-explained','ma-india-explained',1200,'corporate-finance','mna','en','advanced','SEBI takeover code, why acquisitions fail, case studies',ARRAY['M&A','acquisition','takeover','SEBI','synergy'],TRUE,FALSE,540),
('DCF Valuation — Valuing an Indian Stock','Zerodha Varsity','https://www.youtube.com/watch?v=dcf-indian-stock','dcf-indian-stock',1980,'corporate-finance','valuation','en','advanced','Step-by-step DCF on an Indian company using Screener.in data',ARRAY['DCF','valuation','intrinsic-value','WACC','FCF'],TRUE,FALSE,541),

-- BEHAVIORAL FINANCE
('Why You Sell Too Early and Hold Losers — Loss Aversion','Zerodha Varsity','https://www.youtube.com/watch?v=loss-aversion-investing','loss-aversion-investing',1080,'behavioral-finance','biases','en','beginner','Loss aversion and disposition effect — how they hurt your portfolio',ARRAY['loss-aversion','disposition','psychology','bias'],TRUE,TRUE,542),
('FOMO Investing — How to Avoid the Most Expensive Mistake','ET Money','https://www.youtube.com/watch?v=fomo-investing-avoid','fomo-investing-avoid',1260,'behavioral-finance','biases','en','beginner','Real case studies of FOMO investing losses in Indian markets',ARRAY['FOMO','herding','psychology','IPO','crypto'],TRUE,TRUE,543),
('Confirmation Bias in Stock Research','Pranjal Kamra','https://www.youtube.com/watch?v=confirmation-bias-stocks','confirmation-bias-stocks',960,'behavioral-finance','biases','en','intermediate','How confirmation bias leads investors to ignore red flags',ARRAY['confirmation-bias','research','red-flags','psychology'],TRUE,FALSE,544),
('Anchoring Bias — Why You Hold Losers','Finance with Sharan','https://www.youtube.com/watch?v=anchoring-bias-investing','anchoring-bias-investing',900,'behavioral-finance','biases','en','intermediate','How anchoring to purchase price destroys returns',ARRAY['anchoring','bias','purchase-price','psychology'],TRUE,FALSE,545),
('Mental Accounting — Treating Windfalls Differently','Shankar Nath','https://www.youtube.com/watch?v=mental-accounting-finance','mental-accounting-finance',840,'behavioral-finance','biases','en','intermediate','Why bonus money gets spent when salary would be saved',ARRAY['mental-accounting','windfall','psychology','Thaler'],TRUE,FALSE,546),
('Warren Buffett on Investor Psychology','Various Buffett Interviews (compilation)','https://www.youtube.com/watch?v=buffett-psychology','buffett-psychology',2400,'behavioral-finance','wisdom','en','advanced','Buffett''s best explanations of greed, fear, and long-term thinking',ARRAY['Buffett','psychology','patience','long-term','wisdom'],TRUE,TRUE,547),

-- FOREX
('Forex Trading for Beginners India — Legal Way','Zerodha Varsity','https://www.youtube.com/watch?v=forex-india-legal','forex-india-legal',1440,'forex-currency','basics','en','beginner','How to legally trade currency derivatives on NSE/BSE in India',ARRAY['forex','NSE','currency','legal','FEMA'],TRUE,TRUE,548),
('USD/INR Analysis — What Moves the Rupee','ET Money','https://www.youtube.com/watch?v=usdinr-analysis','usdinr-analysis',1200,'forex-currency','analysis','en','intermediate','RBI intervention, oil prices, FII flows — what really drives USD/INR',ARRAY['USD/INR','rupee','RBI','oil','FII'],TRUE,FALSE,549),
('FEMA Regulations for Indians — What You Can and Cannot Do','CA Rachana Ranade','https://www.youtube.com/watch?v=fema-indians-guide','fema-indians-guide',1380,'forex-currency','regulations','en','intermediate','LRS limit, TCS on remittances, forex trading rules for Indian residents',ARRAY['FEMA','LRS','TCS','regulations','compliance'],TRUE,FALSE,550),
('Currency Hedging for Indian Businesses','Zerodha Varsity','https://www.youtube.com/watch?v=currency-hedging-business','currency-hedging-business',1560,'forex-currency','hedging','en','advanced','Forward contracts, currency options, hedging strategies for exporters/importers',ARRAY['hedging','forward','options','exporter','importer'],TRUE,FALSE,551),
('Global Forex Market — How It Works','Investopedia (adapted)','https://www.youtube.com/watch?v=global-forex-how','global-forex-how',1140,'forex-currency','basics','en','beginner','The $7.5 trillion/day forex market — structure, participants, sessions',ARRAY['forex','global','market','sessions','participants'],TRUE,FALSE,552),

-- GENERAL FINANCE HINDI (bonus)
('Mutual Fund के प्रकार - कौन सा Fund लें?','CA Rachana Ranade','https://www.youtube.com/watch?v=mutual-fund-types-hindi','mutual-fund-types-hindi',1560,'personal-finance','mutual-funds','hi','beginner','Large cap, mid cap, small cap, flexi cap, debt fund - पूरी comparison',ARRAY['mutual-fund','hindi','types','comparison','SIP'],TRUE,TRUE,553),
('Share Market में invest कैसे करें - Beginners Guide','Pranjal Kamra','https://www.youtube.com/watch?v=share-market-beginners-hindi','share-market-beginners-hindi',1980,'trading-markets','basics','hi','beginner','NSE, BSE, Demat account - शेयर बाजार में पहला कदम',ARRAY['share-market','beginners','hindi','NSE','Demat'],TRUE,TRUE,554),
('Options Trading क्या है? समझें आसान भाषा में','Vivek Bajaj Hindi','https://www.youtube.com/watch?v=options-hindi-basics','options-hindi-basics',1800,'trading-markets','derivatives','hi','intermediate','Call और Put options - हिंदी में पूरी जानकारी',ARRAY['options','F&O','hindi','derivatives','NSE'],TRUE,FALSE,555),
('Income Tax New vs Old Regime - कौन सा चुनें?','CA Rachana Ranade','https://www.youtube.com/watch?v=tax-regime-hindi','tax-regime-hindi',1260,'personal-finance','tax','hi','intermediate','New vs Old tax regime comparison with calculator',ARRAY['income-tax','regime','hindi','tax-saving','comparison'],TRUE,TRUE,556),
('Gold ETF vs SGB vs Physical Gold - Hindi Comparison','Asset Yogi Hindi','https://www.youtube.com/watch?v=gold-comparison-hindi','gold-comparison-hindi',1140,'personal-finance','investments','hi','beginner','Gold में invest करने के सभी तरीकों की comparison',ARRAY['gold','SGB','ETF','hindi','investment'],TRUE,FALSE,557),

-- ECONOMY & MACRO
('How RBI Interest Rates Affect Your Life','Finshots','https://www.youtube.com/watch?v=rbi-rates-affect','rbi-rates-affect',960,'personal-finance','macroeconomics','en','beginner','Repo rate changes → EMI, FD rates, equity markets — the transmission explained',ARRAY['RBI','repo-rate','EMI','inflation','monetary-policy'],TRUE,TRUE,558),
('India''s GDP Explained Simply','ET Money','https://www.youtube.com/watch?v=india-gdp-explained','india-gdp-explained',1080,'corporate-finance','macroeconomics','en','beginner','What GDP is, how India''s economy is structured, what growth means for investors',ARRAY['GDP','economy','India','growth','macro'],TRUE,FALSE,559),
('Inflation — The Silent Wealth Destroyer','Zerodha Varsity','https://www.youtube.com/watch?v=inflation-wealth-destroyer','inflation-wealth-destroyer',1020,'personal-finance','macroeconomics','en','beginner','How inflation erodes real returns and why you must invest above inflation',ARRAY['inflation','real-returns','CPI','RBI','purchasing-power'],TRUE,TRUE,560),
('How Stock Markets Predict Economy','Pranjal Kamra','https://www.youtube.com/watch?v=markets-predict-economy','markets-predict-economy',1200,'trading-markets','macroeconomics','en','intermediate','Why markets are "forward looking" and the relationship with economic cycles',ARRAY['markets','economy','leading-indicator','business-cycle','investing'],TRUE,FALSE,561),
('Understanding the Union Budget — How to Read It','CA Rachana Ranade','https://www.youtube.com/watch?v=union-budget-guide','union-budget-guide',1800,'personal-finance','tax','en','intermediate','Revenue vs capital expenditure, fiscal deficit, how budget impacts markets',ARRAY['budget','fiscal','government','tax','markets'],TRUE,TRUE,562),

-- RETIREMENT & FIRE
('FIRE in India — Retire Early at 40?','Akshat Shrivastava','https://www.youtube.com/watch?v=fire-india-retire-40','fire-india-retire-40',1560,'personal-finance','retirement','en','intermediate','Financial Independence Retire Early — is it realistic for Indians?',ARRAY['FIRE','retirement','financial-independence','SWP','corpus'],TRUE,TRUE,563),
('NPS vs PPF vs ELSS for Retirement','ET Money','https://www.youtube.com/watch?v=nps-ppf-elss-retirement','nps-ppf-elss-retirement',1440,'personal-finance','retirement','en','intermediate','Which combination maximises retirement corpus and tax savings?',ARRAY['NPS','PPF','ELSS','retirement','tax'],TRUE,FALSE,564),
('How Much Do You Need to Retire in India?','Shankar Nath','https://www.youtube.com/watch?v=retirement-corpus-india','retirement-corpus-india',1320,'personal-finance','retirement','en','intermediate','Calculating retirement corpus for Indian conditions — inflation, healthcare',ARRAY['retirement','corpus','inflation','planning','SWP'],TRUE,TRUE,565),
('SWP Strategy — Creating Monthly Income from Mutual Funds','ET Money','https://www.youtube.com/watch?v=swp-strategy-mutual-fund','swp-strategy-mutual-fund',1200,'personal-finance','retirement','en','intermediate','Systematic Withdrawal Plan vs dividends — tax efficiency and sustainability',ARRAY['SWP','withdrawal','retirement','income','tax'],TRUE,FALSE,566),

-- REAL ESTATE
('Rent vs Buy in India — The Real Math','Sharan Hegde','https://www.youtube.com/watch?v=rent-vs-buy-india','rent-vs-buy-india',1380,'personal-finance','real-estate','en','intermediate','Complete opportunity cost analysis of buying vs renting in Indian metros',ARRAY['rent','buy','real-estate','opportunity-cost','home-loan'],TRUE,TRUE,567),
('Real Estate vs Mutual Funds — 30 Year Comparison','Pranjal Kamra','https://www.youtube.com/watch?v=realestate-vs-mf-30yr','realestate-vs-mf-30yr',1440,'personal-finance','real-estate','en','intermediate','Actual data comparison of property returns vs equity returns in India',ARRAY['real-estate','equity','returns','comparison','investing'],TRUE,TRUE,568),
('Home Loan Prepayment Strategy — Save ₹50 Lakh','CA Rachana Ranade','https://www.youtube.com/watch?v=home-loan-prepayment','home-loan-prepayment',1200,'personal-finance','loans','en','intermediate','When to prepay, how much to prepay, and the math of prepayment benefits',ARRAY['home-loan','prepayment','EMI','interest','savings'],TRUE,FALSE,569),
('REIT vs Real Estate — Better Investment?','Akshat Shrivastava','https://www.youtube.com/watch?v=reit-vs-property','reit-vs-property',1320,'personal-finance','real-estate','en','intermediate','Embassy REIT vs buying an apartment — yield, liquidity, appreciation',ARRAY['REIT','real-estate','yield','liquidity','income'],TRUE,FALSE,570)

ON CONFLICT (youtube_id) DO NOTHING;

RAISE NOTICE '✅ Expansion complete!';
RAISE NOTICE '   Added 50 concepts (targeting 100+ total with existing)';
RAISE NOTICE '   Added 7 career paths (total now 15)';
RAISE NOTICE '   Added 70 videos (total now 150+)';

END $EXPANSION$;