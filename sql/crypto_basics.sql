-- ============================================================
-- FinanceHub - Crypto and DeFi: What is Crypto (15 lessons)
-- Run AFTER supabase_schema_safe.sql
-- ============================================================

DO $$
DECLARE
  crypto_basics_level_id UUID;
  l1 UUID; l2 UUID; l3 UUID; l4 UUID; l5 UUID;
  l6 UUID; l7 UUID; l8 UUID; l9 UUID; l10 UUID;
  l11 UUID; l12 UUID; l13 UUID; l14 UUID; l15 UUID;
  q1 UUID; q2 UUID; q3 UUID; q4 UUID; q5 UUID;
BEGIN

SELECT lv.id INTO crypto_basics_level_id
FROM levels lv JOIN tracks t ON lv.track_id = t.id
WHERE (t.slug = 'crypto-defi' AND lv.slug = 'crypto-basics')
   OR (t.slug = 'crypto' AND lv.slug = 'beginner')
ORDER BY CASE
  WHEN t.slug = 'crypto-defi' AND lv.slug = 'crypto-basics' THEN 1
  ELSE 2
END
LIMIT 1;

IF crypto_basics_level_id IS NULL THEN
  RAISE EXCEPTION 'Crypto basics level not found. Run sql/supabase_schema_safe.sql first.';
END IF;

-- -----------------------------------------
-- LESSON 1: What is blockchain?
-- -----------------------------------------
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES (crypto_basics_level_id, 'What is blockchain - the technology behind crypto', 'what-is-blockchain',
'# What is blockchain - the technology behind crypto

## The core problem blockchain solves

Imagine sending Rs. 10,000 to a friend. Today this works through banks:
1. You trust your bank to debit your account
2. Your bank trusts their bank to credit your friend
3. Both banks trust RBI to settle between them

**What if you could transfer value without trusting any middleman?** That is the problem blockchain solves.

## What is a blockchain?

A blockchain is a **shared database** that is:
- **Distributed**: Thousands of computers hold identical copies
- **Immutable**: Once data is written, it cannot be changed
- **Transparent**: Everyone can see all transactions
- **Trustless**: No single entity controls it

Think of it as a Google Sheet that thousands of people have a copy of, where no one can edit old rows - only add new ones - and everyone can verify the sheet is identical.

## How a transaction works

When you send Bitcoin to someone:

1. You broadcast the transaction to the network
2. Thousands of computers (nodes) receive it
3. Miners/validators verify it is legitimate (you own the Bitcoin, you have not already spent it)
4. Verified transactions are grouped into a **block**
5. The block is added to the chain - permanently
6. All nodes update their copy

## The chain part

Each block contains:
- Transaction data
- A timestamp
- A **hash** of the previous block (a unique fingerprint)

This linking of hashes is why it is called a blockchain - changing one block would break every subsequent block''s hash, making tampering immediately obvious.

## Why it matters

Before blockchain, digital assets could be copied infinitely (like copying an MP3). Blockchain solves the **double-spend problem** - ensuring you cannot send the same digital money to two people.

## Public vs private blockchains

**Public blockchain**: Anyone can join, verify, and transact. Bitcoin, Ethereum. No permission needed.
**Private blockchain**: Only authorised participants. Used by banks and enterprises for internal systems.

The innovation of public blockchains is the truly permissionless, trustless nature.', 8, 1, true, true) RETURNING id INTO l1;

INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l1, 'Blockchain Basics - Check', 70) RETURNING id INTO q1;
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
(q1, 'What key problem does blockchain solve that makes digital money possible?',
'["Making transactions faster", "The double-spend problem - preventing the same digital money being sent twice", "Reducing bank fees", "Replacing physical cash"]',
1, 'Before blockchain, digital files could be copied infinitely. Blockchain''s distributed consensus mechanism ensures a unit of digital currency can only be spent once - solving the double-spend problem without a central authority.', 1),
(q1, 'Why is it practically impossible to alter data already recorded on a public blockchain?',
'["Governments protect it", "Changing one block breaks the hash link to every subsequent block, requiring re-computation of the entire chain", "The data is encrypted with military-grade security", "Blockchain companies prevent changes"]',
1, 'Each block contains a hash of the previous block. Altering any block changes its hash, breaking the link to the next block. An attacker would need to redo the computation for all subsequent blocks faster than the entire honest network - practically impossible for established chains.', 2),
(q1, 'What makes a public blockchain "trustless"?',
'["You must trust the company that created it", "No single entity controls it - rules are enforced by code and distributed consensus", "Governments regulate it carefully", "All participants know each other"]',
1, 'Trustless means you do not need to trust any individual or institution. The protocol''s rules are enforced mathematically by thousands of independent computers, not by a company or government.', 3);

-- -----------------------------------------
-- LESSON 2: Bitcoin explained simply
-- -----------------------------------------
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES (crypto_basics_level_id, 'Bitcoin explained - digital gold or currency?', 'bitcoin-explained',
'# Bitcoin explained - digital gold or currency?

## The origin

In October 2008, a person (or group) using the pseudonym **Satoshi Nakamoto** published a whitepaper: "Bitcoin: A Peer-to-Peer Electronic Cash System."

In January 2009, the first Bitcoin block (the "genesis block") was mined. Satoshi''s identity remains unknown. They hold approximately 1 million Bitcoin which has never been moved.

## What is Bitcoin?

Bitcoin is:
- A **digital currency** that can be sent peer-to-peer without banks
- A **store of value** with a hard cap of 21 million coins ever
- A **network** of computers maintaining the shared ledger
- The **native asset** of the Bitcoin blockchain

## The 21 million limit - why it matters

Unlike rupees or dollars (which central banks can print in unlimited quantities), Bitcoin''s code permanently limits supply to 21 million coins. Approximately 19.5 million have been mined already.

This **hard cap** is the foundation of Bitcoin''s "digital gold" narrative:
- Gold is scarce and cannot be printed
- Bitcoin is more scarce and provably finite
- Increasing demand + fixed supply = price appreciation over long term

## How Bitcoin is created: Mining

New Bitcoin is created through **mining**:
1. Miners use powerful computers to solve complex mathematical problems
2. The winner adds the next block to the blockchain
3. They receive newly created Bitcoin as reward (currently 3.125 BTC per block)
4. This reward halves every 210,000 blocks (~4 years) - called the **halving**

## The halving

Every ~4 years, the Bitcoin reward for miners is cut in half:
- 2009: 50 BTC per block
- 2012: 25 BTC
- 2016: 12.5 BTC
- 2020: 6.25 BTC
- 2024: 3.125 BTC

Halvings reduce new supply entering the market. Historically, each halving has preceded a significant price increase.

## Bitcoin in India

Bitcoin is legal to own and trade in India. Gains are taxed at 30% (flat) + 1% TDS on each transaction above Rs. 50,000. This is covered in the taxation lesson.

## Digital gold vs currency debate

**As gold**: Store of value, hedge against inflation, held long-term
**As currency**: Can be used for payments, but volatile and slow for daily use

Most investors today treat Bitcoin as digital gold - a long-term store of value, not daily currency.', 9, 2, true, true) RETURNING id INTO l2;

INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l2, 'Bitcoin - Check', 70) RETURNING id INTO q2;
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
(q2, 'What is the maximum number of Bitcoin that will ever exist?',
'["100 million", "21 million", "1 billion", "Unlimited"]',
1, '21 million is permanently hardcoded into Bitcoin''s protocol. This hard cap cannot be changed without breaking consensus across the entire network. It is the foundation of Bitcoin''s scarcity value proposition.', 1),
(q2, 'What is a Bitcoin halving?',
'["Bitcoin price falls by half", "The reward for mining new blocks is cut in half approximately every 4 years", "Bitcoin supply doubles", "Trading fees are reduced"]',
1, 'Every 210,000 blocks (~4 years), the mining reward halves. This reduces the rate of new Bitcoin entering circulation, historically creating supply shocks that have preceded major price increases.', 2),
(q2, 'At what rate are Bitcoin gains currently taxed in India?',
'["10% long-term capital gains", "15% short-term capital gains", "30% flat rate", "Not taxed"]',
1, 'India taxes crypto gains at a flat 30% regardless of holding period. Additionally, 1% TDS applies on transactions above Rs. 50,000. This is among the highest crypto tax rates globally.', 3);

-- -----------------------------------------
-- LESSON 3: Ethereum and smart contracts
-- -----------------------------------------
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES (crypto_basics_level_id, 'Ethereum and smart contracts - programmable money', 'ethereum-smart-contracts',
'# Ethereum and smart contracts - programmable money

## Beyond digital currency

Bitcoin solved one problem: peer-to-peer digital money. Ethereum asked a bigger question:

**What if you could run any program on a decentralised network - not just currency transfers?**

Vitalik Buterin proposed Ethereum in 2013. It launched in 2015.

## What is Ethereum?

Ethereum is a **programmable blockchain** - a decentralised computer that anyone can use to build and run applications.

Bitcoin = digital gold (store of value)
Ethereum = decentralised world computer (programmable platform)

## Smart contracts

A **smart contract** is a program that:
- Lives on the Ethereum blockchain
- Executes automatically when conditions are met
- Cannot be stopped, changed, or censored once deployed
- Has no counterparty risk - the code is the contract

**Traditional contract**: "I will pay you Rs. 10 lakh when you deliver the product. Trust me."
**Smart contract**: The code automatically releases payment when delivery is confirmed. No trust needed.

## Real examples of smart contracts

**Lending**: Deposit ETH as collateral -> automatically borrow stablecoins -> interest accrues automatically -> repay to retrieve collateral. No bank, no approval, 24/7.

**Decentralised exchanges**: Swap one token for another directly, prices set algorithmically. No company in the middle.

**NFTs**: Ownership of digital assets enforced by smart contract. Royalties automatically paid to creators.

## Ether (ETH) - the fuel

**Ether** is Ethereum''s native currency. It has two roles:
1. **Store of value**: Investment asset, second largest crypto
2. **Gas**: Fuel to pay for computation on the network. Every transaction costs gas (paid in ETH).

## Ethereum vs Ethereum 2.0

In 2022, Ethereum switched from energy-intensive **Proof of Work** (like Bitcoin mining) to **Proof of Stake** (validators stake ETH to secure the network). This reduced energy use by 99.95%.

## Why ETH matters

Ethereum is the foundation for most of the crypto ecosystem:
- 90%+ of DeFi (Decentralised Finance) runs on Ethereum
- Most NFTs are on Ethereum
- Most stablecoins exist on Ethereum
- Thousands of tokens are built on Ethereum (ERC-20 standard)', 9, 3, true, true) RETURNING id INTO l3;

INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l3, 'Ethereum - Check', 70) RETURNING id INTO q3;
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
(q3, 'What makes Ethereum fundamentally different from Bitcoin?',
'["Ethereum is faster", "Ethereum is programmable - you can build applications with smart contracts", "Ethereum has more coins", "Ethereum was created first"]',
1, 'Bitcoin was designed purely as digital money. Ethereum added programmability - smart contracts allow developers to build any kind of decentralised application (dApp) on top of the blockchain.', 1),
(q3, 'What is a smart contract?',
'["A legal document stored digitally", "A self-executing program on a blockchain that runs automatically when conditions are met", "A contract between two crypto exchanges", "An agreement with Ethereum''s founders"]',
1, 'Smart contracts are programs that live on the blockchain. They execute automatically when pre-defined conditions are met, without needing any intermediary or trust between parties.', 2),
(q3, 'What is "gas" in the context of Ethereum?',
'["Ethereum''s environmental impact", "The fee paid in ETH to compensate for computing power used to process transactions", "A type of token", "The speed of transactions"]',
1, 'Gas is the unit measuring computational effort. Users pay gas fees (in ETH) to incentivise validators to process their transactions. Higher gas = faster processing.', 3);

-- -----------------------------------------
-- LESSONS 4-15: Remaining crypto basics
-- -----------------------------------------
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES

(crypto_basics_level_id, 'Crypto wallets - hot, cold, and custodial', 'crypto-wallets',
'# Crypto wallets - hot, cold, and custodial

## Not a wallet - a key holder

A crypto wallet does not store your cryptocurrency. The crypto always stays on the blockchain. What a wallet stores are your **private keys** - the passwords that prove ownership.

**Public key**: Like your bank account number. Share it to receive crypto.
**Private key**: Like your PIN. NEVER share it. Whoever has it owns your crypto.

> "Not your keys, not your coins." - The fundamental rule of crypto self-custody.

## Hot wallets (connected to internet)

**Software wallets** on your phone or computer:
- **MetaMask**: Browser extension, most popular for Ethereum/DeFi
- **Trust Wallet**: Mobile, supports 70+ blockchains
- **Phantom**: Popular for Solana

**Pros**: Convenient, free, instant access
**Cons**: Vulnerable to hacking if your device is compromised

Best for: Small amounts used regularly for DeFi and trading.

## Cold wallets (offline)

**Hardware wallets** - physical devices:
- **Ledger Nano X**: Most popular, Rs. 8,000-12,000
- **Trezor Model T**: Open source, Rs. 15,000+

Your private key is generated and stored offline. To transact, you physically connect and approve on the device.

**Pros**: Near-impossible to hack remotely
**Cons**: Cost money, can be lost/damaged physically

Best for: Large amounts you plan to hold long-term.

## Custodial wallets (exchanges hold keys)

When you hold crypto on WazirX, CoinDCX, Binance, or Coinbase - THEY hold your private keys, not you.

**Pros**: Convenient, can recover if you forget password
**Cons**: Exchange can be hacked (Mt. Gox 2014, FTX 2022) or freeze withdrawals

**Rule of thumb**: Only keep on exchange what you are actively trading. Move long-term holdings to self-custody.

## Seed phrase - your master backup

When you create a non-custodial wallet, you receive a **12 or 24-word seed phrase**. This is the master key to your wallet.

- Write it on paper
- Store in two separate physical locations
- NEVER type it online or share it with anyone - ever
- No legitimate service will ever ask for your seed phrase', 8, 4, true, true),

(crypto_basics_level_id, 'How to buy crypto safely in India', 'buying-crypto-india',
'# How to buy crypto safely in India

## Is crypto legal in India?

Yes - buying, selling, and holding cryptocurrency is legal in India. It is regulated under the Finance Ministry.

Key regulations (as of 2024):
- 30% flat tax on all crypto gains
- 1% TDS on transactions above Rs. 50,000 (deducted by exchange)
- No offsetting losses against gains
- No offsetting losses against gains from other crypto assets

## Indian exchanges

**Regulated and PMLA-compliant**:
- **CoinDCX**: Largest by users, good liquidity
- **WazirX**: Popular, owned by Binance (check current status)
- **Mudrex**: Good for auto-investing and index products
- **ZebPay**: One of India''s oldest, conservative

All registered Indian exchanges follow KYC and AML requirements.

## How to buy - step by step (CoinDCX example)

1. Download app -> Sign up with email
2. Complete KYC: PAN + Aadhaar + selfie (takes 24-48 hours)
3. Add bank account -> Deposit INR via UPI or NEFT
4. Go to Markets -> Search Bitcoin or ETH
5. Enter amount in INR (minimum Rs. 100 on most platforms)
6. Confirm purchase

You can buy fractions - 0.001 BTC is perfectly valid.

## Global exchanges

**Binance, Coinbase**: More liquidity, more coins, lower fees
Require KYC but may have withdrawal limits for Indian bank accounts
Tax reporting is your responsibility - track every transaction

## The 1% TDS trap

Every sale on Indian exchanges deducts 1% TDS. This reduces your working capital over time if you trade frequently.

Example: Buy Rs. 1 lakh of BTC. Sell all = Rs. 1,000 TDS deducted regardless of profit/loss. This is credited against your annual tax liability, but ties up cash.

**Implication**: Frequent trading is especially expensive in India due to TDS.

## Security checklist

- YES Enable 2FA (Google Authenticator, not SMS)
- YES Use a unique email for your exchange account
- YES Never click links in emails claiming to be from your exchange
- YES Bookmark the exchange URL - do not Google it each time
- YES Withdraw large amounts to self-custody wallet', 8, 5, true, true),

(crypto_basics_level_id, 'Stablecoins - crypto without the volatility', 'stablecoins',
'# Stablecoins - crypto without the volatility

## The volatility problem

Bitcoin can fall 20% in a day. This makes it impractical for everyday payments or as a store of "stable" value. Enter stablecoins.

A **stablecoin** is a cryptocurrency designed to maintain a stable value, usually pegged 1:1 to the US dollar.

## Types of stablecoins

### Fiat-backed (most common and safest)
- **USDT (Tether)**: Largest by volume. Claims to be backed 1:1 by USD reserves. Some controversy around reserve transparency.
- **USDC (USD Coin)**: Issued by Circle. More transparent, regular audits. Backed by cash and US Treasury bills.
- **BUSD**: Binance''s stablecoin (now being phased out)

### Crypto-backed
- **DAI**: Backed by overcollateralised ETH and other crypto. Maintained by algorithm and governance. More decentralised.

### Algorithmic (high risk)
- **UST (Terra Luna)**: Famous collapse in May 2022. Lost its peg and became worthless, wiping out $40 billion in value. A warning against algorithmic stablecoins.

## Why stablecoins matter

1. **Trading**: Move in and out of volatile crypto without converting to INR (and triggering TDS)
2. **DeFi**: Earn yield on stablecoins (4-15% APY in some protocols)
3. **Remittances**: Send dollars globally in seconds, far cheaper than SWIFT
4. **Emerging markets**: People in high-inflation countries use USDT to hold dollar value

## Stablecoin risks

- **Regulatory risk**: Governments may ban or restrict them
- **De-pegging risk**: If the issuer faces a bank run (USDC briefly de-pegged in 2023 Silicon Valley Bank crisis)
- **Counterparty risk**: You are trusting the issuer''s reserves

## In India

Stablecoins (USDT, USDC) are available on Indian exchanges. Gains in INR value are taxed at 30%. Holding USDT when rupee depreciates against dollar creates taxable gains.', 7, 6, true, true),

(crypto_basics_level_id, 'Altcoins - beyond Bitcoin and Ethereum', 'altcoins',
'# Altcoins - beyond Bitcoin and Ethereum

## What are altcoins?

"Altcoin" = any cryptocurrency that is not Bitcoin. There are over 20,000 altcoins. Most are worthless or speculative. A few solve real problems.

## Tier 1 - Established platforms

**Ethereum (ETH)**: The programmable blockchain. Most developer activity. Second largest by market cap.

**Solana (SOL)**: Extremely fast and cheap blockchain. Popular for NFTs, DeFi, and consumer apps. Had reliability issues but improved significantly.

**BNB (Binance Coin)**: Powers the Binance exchange and BNB Smart Chain. Useful within the Binance ecosystem.

## Tier 2 - Specialised networks

**Polygon (MATIC)**: Layer 2 solution for Ethereum. Makes ETH transactions faster and cheaper. Popular with Indian developers.

**Chainlink (LINK)**: Connects blockchains to real-world data (oracles). Critical infrastructure for DeFi.

**Uniswap (UNI)**: Governance token for the largest decentralised exchange.

## The altcoin market cycle

Historically:
1. Bitcoin rises first
2. Ethereum follows
3. Large altcoins follow ETH
4. Small altcoins/"sh*tcoins" pump last with extreme gains
5. Market peaks -> altcoins crash 90%+ -> Bitcoin dominance rises again

**Bitcoin dominance** (BTC market cap as % of total crypto market cap) is a useful indicator of where we are in the cycle.

## Research framework before buying any altcoin

Ask these questions:
- **What problem does it solve?** (If no clear answer - be very cautious)
- **Who built it?** (Anonymous team = higher risk)
- **Is there real usage?** (Check active wallets, transactions, total value locked)
- **Tokenomics**: How many coins, who holds them, when do they unlock?
- **Competition**: Is it better than existing solutions?

## The harsh reality

80%+ of altcoins that existed in 2017 no longer have significant value. Most altcoins are zero-sum speculation. Research extensively before putting money into anything outside the top 10 by market cap.', 8, 7, true, false),

(crypto_basics_level_id, 'NFTs - what they actually are and when they matter', 'nfts-explained',
'# NFTs - what they actually are and when they matter

## The hype and the reality

NFTs (Non-Fungible Tokens) became a cultural phenomenon in 2021. People paid millions for JPEGs. Then the market crashed 90%+.

But strip away the speculation, and NFTs are a genuinely useful technology with specific legitimate applications.

## What "non-fungible" means

**Fungible**: Identical and interchangeable. Rs. 100 note = any other Rs. 100 note. 1 BTC = any other 1 BTC.

**Non-fungible**: Unique, not interchangeable. A specific painting, a specific concert ticket, a specific piece of land.

An **NFT** is a token on a blockchain that represents ownership of a unique item - with the uniqueness verified by the blockchain.

## What NFTs actually prove

NFTs prove:
- That a specific digital item exists
- Who currently owns it
- The complete ownership history

NFTs do NOT:
- Prevent others from copying the image
- Give you copyright (unless explicitly stated)
- Guarantee the item has value

## Legitimate NFT use cases

**Event tickets**: NFT tickets cannot be counterfeited. Resale royalties automatically go to the artist. Already used by some Indian music events.

**Gaming items**: In-game weapons, skins, characters that you truly own and can sell. Axie Infinity pioneered this.

**Digital art**: Creators can receive royalties automatically on every resale. Unprecedented for digital artists.

**Real-world asset tokenisation**: A house, a piece of land, a company share represented as an NFT on a blockchain. This is where serious institutional interest lies.

**Domain names**: Blockchain domain names (e.g., .eth domains) that you truly own, not rent.

## The speculation vs utility divide

2021 NFTs (Bored Apes etc.) = pure speculation. Buying to sell to a higher bidder.
Utility NFTs (tickets, gaming, real assets) = genuine use case.

The technology is sound. Most current NFT projects are not.', 7, 8, true, false),

(crypto_basics_level_id, 'Crypto risks - what nobody tells you', 'crypto-risks',
'# Crypto risks - what nobody tells you

This lesson is the most important in this level. Every honest crypto educator will tell you these things.

## Risk 1: Extreme volatility

Bitcoin has fallen from peak to trough:
- 2011: -93%
- 2013-15: -85%
- 2017-18: -84%
- 2021-22: -77%

**Reality check**: If you invest Rs. 1 lakh in Bitcoin and it falls 80%, you have Rs. 20,000. Can you hold through that without panic-selling at the bottom?

## Risk 2: Regulatory risk

India''s crypto regulations can change. The 30% tax already reduced trading volumes significantly. A complete ban (unlikely but possible) would be devastating to holders.

## Risk 3: Smart contract bugs

Even audited code has bugs. Major DeFi hacks:
- Ronin Network (Axie): $625 million stolen
- Poly Network: $611 million (later returned)
- Wormhole: $320 million
- Nomad Bridge: $190 million

If you are in DeFi, only use well-established protocols with years of security audits.

## Risk 4: Scams (the biggest risk for retail Indians)

**Types of crypto scams**:
- **Pump and dump**: Influencers promote a coin, dump on followers
- **Rug pulls**: Developers launch project, raise money, disappear
- **Pig butchering**: Romance scam -> convince victim to invest in fake exchange
- **Fake giveaways**: "Send 1 ETH, get 2 back" - Elon Musk impersonators
- **Phishing**: Fake websites stealing your seed phrase

**Red flags**: Guaranteed returns, "secret strategy", pressure to invest quickly, requests for your seed phrase.

## Risk 5: Custody risk

- Exchange hack: FTX collapsed in 2022, billions lost
- Losing private keys: Estimated 20% of all Bitcoin is permanently lost
- Hardware wallet damage: Must have backup seed phrase

## Risk 6: Tax complexity

1% TDS on every transaction, 30% on gains, no loss offsetting - creates a complex record-keeping burden and potential surprise tax bills.

## The honest risk assessment

Crypto is a high-risk, high-reward asset class. Appropriate position sizing for most people: 1-5% of investment portfolio. Treat any amount you put in as potentially lost.', 8, 9, true, false),

(crypto_basics_level_id, 'Crypto taxation in India - complete guide', 'crypto-taxation-india',
'# Crypto taxation in India - complete guide

## The 2022 budget changed everything

Before April 1, 2022: Crypto taxation was ambiguous.
After: Crystal clear - and harsh.

## Tax rate: 30% flat

All crypto gains (Bitcoin, Ethereum, altcoins, NFTs, DeFi income) are taxed at **30%** - regardless of:
- How long you held it
- Whether you are in a lower tax slab
- Whether you made losses on other crypto

**No indexation benefit. No long-term rate. No exceptions.**

## TDS: 1% on every transaction

From July 1, 2022: **1% TDS** is deducted on:
- Selling crypto above Rs. 50,000 per transaction (Rs. 10,000 for specified persons)
- Crypto-to-crypto trades
- NFT sales

The exchange deducts this automatically and remits to government. You can claim it against your tax liability, but it ties up cash.

**Impact on traders**: If you make 100 trades of Rs. 1 lakh each, Rs. 1 lakh in TDS is locked up until you file your ITR. This kills high-frequency trading.

## No loss offsetting

This is the brutal part:

- **Cannot offset crypto losses against crypto gains** from other assets
- **Cannot offset crypto losses against income** from salary or business
- **Cannot carry forward losses** to next year

If you made Rs. 50,000 profit on Bitcoin and Rs. 80,000 loss on Solana - you STILL pay 30% tax on Rs. 50,000 profit (Rs. 15,000 tax), despite a net loss of Rs. 30,000.

## What is a taxable event?

- Selling crypto for INR YES
- Swapping one crypto for another (even BTC -> ETH) YES
- Using crypto to buy goods or services YES
- Receiving crypto as income (staking, mining, airdrop) YES
- NFT sales YES

## Record keeping is critical

Maintain records of:
- Date of purchase
- Purchase price in INR
- Date of sale
- Sale price in INR
- Exchange used

Tools: Koinly, CoinTracker, or manual spreadsheet. Download your transaction history from exchanges every quarter.

## Filing your return

Report crypto gains in ITR-2 (Schedule VDA - Virtual Digital Assets). Koinly and ClearTax can generate the required schedule automatically.', 8, 10, true, false),

(crypto_basics_level_id, 'How to track and manage a crypto portfolio', 'crypto-portfolio-tracking',
'# How to track and manage a crypto portfolio

## Why tracking matters

Without proper tracking:
- You do not know your actual returns
- Tax calculation becomes a nightmare
- You cannot make informed decisions

## Portfolio tracking tools

**CoinStats**: Best overall, connects to 300+ exchanges and wallets. Free tier sufficient for most.

**Delta**: Clean UI, popular in India. Good for mobile.

**Koinly**: Best for tax reporting. Automatically calculates gains and generates ITR-compatible reports.

**Zerion**: Best for DeFi portfolio - tracks positions across protocols automatically.

## What to track

For each position:
- **Asset**: BTC, ETH, etc.
- **Quantity**: Exact amount held
- **Average buy price**: Total invested / quantity
- **Current price**: Live
- **Current value**: Quantity x current price
- **P&L**: Current value - total invested
- **P&L %**: ((Current value - invested) / invested) x 100

## Portfolio allocation framework

**Conservative crypto portfolio** (for someone new):
- 60% Bitcoin
- 30% Ethereum
- 10% one established altcoin (e.g., Solana)

**Why Bitcoin-heavy**: Bitcoin has the longest track record, most liquidity, and lowest probability of going to zero among all cryptocurrencies.

## Rebalancing

If Bitcoin has a great run and now represents 80% of your crypto portfolio, consider rebalancing back to your target allocation. This forces you to "sell high" on outperformers.

Be careful: each rebalancing trade is a taxable event in India (30% on gains).

## Setting realistic expectations

Crypto is not a "get rich quick" scheme. It is a high-risk, speculative asset that has produced extraordinary returns over long periods but with terrifying drawdowns.

Approach: DCA (Dollar-Cost Average) monthly over years, not lump-sum timing attempts.', 7, 11, true, false),

(crypto_basics_level_id, 'Web3 - what it means and why it matters', 'what-is-web3',
'# Web3 - what it means and why it matters

## The evolution of the web

**Web1 (1990s-early 2000s)**: Read-only. Static websites. You consumed content. No interaction.

**Web2 (mid 2000s-now)**: Read-write. Social media, user-generated content. But centralised companies (Google, Facebook, Twitter) own your data and identity.

**Web3**: Read-write-own. Users own their data, identity, and digital assets. Powered by blockchain technology.

## The problem with Web2

On Web2:
- Your Google account is owned by Google (they can delete it)
- Your Instagram followers are owned by Instagram
- Your money on PayPal can be frozen
- Your data is sold without meaningful consent

**Web3 aims to give ownership back to users.**

## Web3 building blocks

**Digital identity**: Instead of logging in with Google/Facebook, you log in with your crypto wallet. You own your identity.

**Digital ownership**: NFTs prove you own digital items - not the platform.

**Decentralised finance (DeFi)**: Financial services (lending, trading, earning yield) without banks.

**DAOs (Decentralised Autonomous Organisations)**: Communities governed by token holders through voting, not by executives.

**Decentralised storage**: Filecoin, IPFS - store data without relying on AWS or Google Cloud.

## What Web3 looks like in practice

- You log into a game with your wallet (MetaMask)
- You earn in-game tokens for playing
- Your game items (NFTs) can be sold on any marketplace
- If the game company shuts down, you still own your items

- You borrow money from a DeFi protocol without a credit check
- Collateral is locked in a smart contract, not with a bank
- Repay anytime, retrieve collateral

## The honest Web3 assessment

Web3 is early, clunky, and often over-hyped. Most "Web3 apps" are not meaningfully better than Web2 equivalents today. But the underlying technology - ownership of digital assets, permissionless finance, user-controlled identity - solves genuine problems. The question is when, not if.', 7, 12, true, false),

(crypto_basics_level_id, 'Crypto security - protecting your assets', 'crypto-security',
'# Crypto security - protecting your assets

## The irreversibility problem

In traditional finance, fraud can often be reversed. Banks can freeze transactions. Credit card companies have chargeback protections.

In crypto: **transactions are final and irreversible**. If you send to the wrong address or get hacked, the money is gone. Forever.

This makes security non-negotiable.

## The seven commandments of crypto security

**1. Never share your seed phrase**
No exchange, no support agent, no Telegram admin, no friend ever needs your 12 or 24-word seed phrase. Anyone asking for it is trying to steal your crypto.

**2. Use hardware wallet for significant amounts**
Any amount you would not want to lose permanently should be on a Ledger or Trezor, not on an exchange.

**3. Enable 2FA on everything**
Use Google Authenticator or Authy - not SMS (SMS can be SIM-swapped). Every exchange, every email, every relevant account.

**4. Use a dedicated email for crypto**
Not your main Gmail. A separate email with a strong unique password, used only for crypto accounts.

**5. Verify addresses carefully**
Before confirming any transaction, check the first 6 and last 6 characters of the recipient address. Clipboard malware can swap addresses.

**6. Test with small amounts first**
Sending to a new wallet? Send Rs. 500 first. Confirm it arrives. Then send the rest.

**7. Beware of DeFi approvals**
When you interact with a DeFi protocol, you "approve" it to spend your tokens. Unlimited approvals are dangerous. Use revoke.cash to check and remove approvals you no longer need.

## Common attack vectors

- **Phishing websites**: Fake "Metamask.io" or "Uniswap" websites. Always verify URL.
- **Discord/Telegram scams**: Fake support, fake giveaways, fake investment opportunities.
- **Clipboard hijacking**: Malware that replaces copied wallet addresses with attacker''s address.
- **Fake apps**: Download only from official app stores, verify developer name.

## What to do if compromised

If you suspect your seed phrase is exposed:
1. Immediately create a new wallet on a clean device
2. Move ALL assets to the new wallet as fast as possible
3. Do not use the compromised wallet again for anything', 8, 13, true, false),

(crypto_basics_level_id, 'Crypto myths vs reality - separating facts from fiction', 'crypto-myths-reality',
'# Crypto myths vs reality

## Myth 1: "Crypto is anonymous - used only by criminals"

**Reality**: Most major blockchains are PSEUDONYMOUS, not anonymous. Every transaction is publicly visible on the blockchain forever. Law enforcement regularly traces and seizes crypto from criminals. Bitcoin is arguably LESS anonymous than cash for large transactions.

## Myth 2: "Crypto has no intrinsic value"

**Reality**: Value is what people agree it has. Gold''s "intrinsic value" is mostly jewellery demand and industrial use - a fraction of its financial value. Bitcoin''s value comes from its properties: scarcity, security, decentralisation, and increasingly its network effect as a store of value. Whether you believe this is sufficient value is a legitimate debate - but the "no intrinsic value" argument applies equally to fiat currencies.

## Myth 3: "You need to buy a whole Bitcoin"

**Reality**: Bitcoin is divisible to 8 decimal places. The smallest unit is a **satoshi** (0.00000001 BTC). You can buy Rs. 500 worth of Bitcoin on any Indian exchange.

## Myth 4: "Crypto is just gambling"

**Reality**: Speculating on volatile altcoins is close to gambling. But long-term Bitcoin or Ethereum investment, based on thesis about the technology, is closer to venture investment. The range within "crypto" is enormous.

## Myth 5: "The government will ban crypto and it will go to zero"

**Reality**: Multiple governments have tried. China banned crypto in 2021. Chinese citizens still hold crypto via VPN. No major government has successfully eliminated crypto adoption. India chose to tax it heavily instead of ban it - a strong signal it is here to stay.

## Myth 6: "DeFi is just for tech people"

**Reality**: DeFi interfaces are improving rapidly. Products like Mudrex make crypto investing as simple as a mutual fund SIP. The underlying technology is complex; the user experience is increasingly not.

## Myth 7: "If I miss Bitcoin, I should buy [new coin]"

**Reality**: Most "new Bitcoins" are not Bitcoin. The first mover advantage, network effect, security, and brand recognition of Bitcoin are not easily replicated. Be very sceptical of comparisons.', 7, 14, true, false),

(crypto_basics_level_id, 'Crypto level recap - what you know and what comes next', 'crypto-recap',
'# Crypto level recap - everything covered in What is Crypto

## Core technology

**Blockchain**: Distributed, immutable ledger solving the double-spend problem without central authority.

**Bitcoin**: Digital gold. Fixed 21 million supply. Mining creates new coins. Halving every 4 years reduces issuance.

**Ethereum**: Programmable blockchain. Smart contracts enable DeFi, NFTs, and Web3 applications.

## Practical knowledge

**Wallets**: Hot (convenient, less secure) vs Cold (hardware, more secure). Custodial (exchange holds keys) vs Non-custodial (you hold keys). Seed phrase is your master backup - protect it.

**Buying in India**: Legal, heavily taxed. KYC required. CoinDCX, WazirX, ZebPay for INR access.

**Stablecoins**: USDT, USDC - dollar-pegged. Useful for DeFi and avoiding conversion taxes between trades.

**Altcoins**: Most are speculative. Research tokenomics, team, use case, competition before any investment.

## Risk and security

**Major risks**: Volatility (77%+ drawdowns happen), regulatory changes, smart contract bugs, scams, custody failures.

**Security rules**: Never share seed phrase. Hardware wallet for significant amounts. 2FA everywhere. Verify addresses before sending.

## Taxation (India)

- 30% flat tax on all gains - no long-term benefit
- 1% TDS on each transaction
- No loss offsetting between assets or against income
- Record every transaction - date, amount, price in INR

## What comes next: DeFi Basics level

You now understand what crypto is. The DeFi Basics level covers:
- Decentralised exchanges (Uniswap, Jupiter)
- Lending and borrowing (Aave, Compound)
- Yield farming and liquidity provision
- Staking and liquid staking
- Risks specific to DeFi
- How to use a crypto wallet with DeFi protocols

Take the final quiz to complete this level and unlock DeFi Basics.', 6, 15, true, false);

END $$;

