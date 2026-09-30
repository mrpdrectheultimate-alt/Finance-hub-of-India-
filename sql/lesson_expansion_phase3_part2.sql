-- ============================================================
-- FinanceHub — Lesson Expansion Phase 3 Part 2
-- 6 Advanced Crypto & DeFi lessons
-- Target: ~271 → ~277 total published lessons
-- Run AFTER lesson_expansion_phase3.sql
-- Idempotent: WHERE NOT EXISTS on every insert
-- ============================================================

DO $PHASE3_PART2$
DECLARE
  crypto_id UUID;
  v_total   INT;
BEGIN
  SELECT lv.id INTO crypto_id FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug IN ('crypto-defi', 'crypto') AND lv.slug IN ('what-is-crypto', 'beginner') LIMIT 1;
  IF crypto_id IS NULL THEN SELECT id INTO crypto_id FROM levels WHERE slug = 'what-is-crypto' LIMIT 1; END IF;

-- ═══════════════════════════════════════════════════════════
-- CRYPTO & DEFI ADVANCED — +6 lessons (31 → 37)
-- ═══════════════════════════════════════════════════════════

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT crypto_id,
'Web3 identity — DIDs, ENS, and soulbound tokens',
'web3-identity-dids',
'# Web3 identity — owning who you are

## The identity problem in Web2

In Web2, your identity is controlled by platforms. Google, Facebook, and Twitter hold the keys to your online presence. They can ban, suspend, or delete your account at will. Your reputation, connections, and history disappear.

Web3 proposes a different model: self-sovereign identity — where you control your identity cryptographically, without dependence on any company.

## Decentralised Identifiers (DIDs)

A DID is a globally unique identifier that you create and control, not issued by any central authority.

**Structure**: `did:method:identifier`
Example: `did:ethr:0x742d35Cc6634C0532925a3b8D4C9B3432D4c5E0D`

**How it works**:
1. You generate a cryptographic key pair (public + private key)
2. Your DID is derived from your public key
3. You prove control by signing with your private key
4. No company, government, or platform can revoke it

**DID Documents**: Each DID has an associated DID document stored on a blockchain or distributed ledger. Contains public keys, authentication methods, and service endpoints.

**W3C Standard**: DIDs are a W3C standard — meaning they are designed to work across different blockchain systems and applications.

## Ethereum Name Service (ENS)

ENS replaces cryptographic wallet addresses (0x742d...E0D) with human-readable names (vitalik.eth).

**How it works**: ENS is a smart contract system on Ethereum. You register a .eth name, pay an annual fee (in ETH), and it maps to your wallet address.

**Benefits**:
- Send ETH to "yourname.eth" instead of a 42-character address
- Attach metadata: website, Twitter handle, avatar, bio
- Can point to multiple crypto addresses (BTC, SOL, etc.)
- Decentralised — you own it for the registration period

**India context**: ENS is purely Ethereum infrastructure. No regulatory restrictions on registering .eth names. Useful for anyone building a Web3 presence.

**Cost**: Currently 5+ character names: $5/year. 4 character: $160/year. 3 character: $640/year (premium for shorter, more memorable names).

## Soulbound Tokens (SBTs)

Proposed by Vitalik Buterin in 2022, Soulbound Tokens are non-transferable NFTs — tokens tied permanently to a specific wallet ("soul").

Unlike regular NFTs that can be bought and sold, SBTs cannot be transferred. They represent:

**Credentials and achievements**:
- University degrees
- Professional certifications
- Event attendance
- Work history

**Reputation**:
- Proof of participation in a DAO
- History of loan repayment in DeFi
- Community contributions

**Why non-transferable matters**: A transferable credential is meaningless — you could buy someone else''s degree. A non-transferable credential is genuine proof.

**Current state**: SBTs are conceptually powerful but implementation is early. Some protocols use "soul" wallets for governance and reputation. Large-scale adoption not yet achieved.

## Practical implications for Indian users

**ENS**: If building a Web3 business, brand, or community — register an .eth name. Costs $5-160/year. Provides professional Web3 presence.

**DIDs for KYC**: Indian regulators are exploring DID-based KYC that would let users share verified credentials without re-doing KYC at every service. ONDC (Open Network for Digital Commerce) and NPCI have explored this space.

**Soulbound credentials**: Future possibility where your CFA certification, university degree, or SEBI registration exists as an SBT on-chain, instantly verifiable by any employer or counterparty globally.',
8,32,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='web3-identity-dids');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT crypto_id,
'Real world asset tokenization — bringing stocks, property, and bonds on-chain',
'rwa-tokenization-real-world-assets',
'# Real world asset (RWA) tokenization

## What is RWA tokenization?

Real World Asset (RWA) tokenization is the process of creating a digital token on a blockchain that represents ownership or a claim on a real-world asset — property, stocks, bonds, commodities, or even cash flows.

The token inherits the blockchain''s properties: programmable, 24/7 tradeable, globally accessible, composable with DeFi.

In 2024, RWA tokenization is one of the fastest-growing segments in crypto, driven by institutional adoption and the high interest rate environment making tokenised US Treasury yields attractive.

## Why tokenize real assets?

**Fractionalization**: A ₹50 crore commercial property can be tokenized into 500,000 tokens at ₹1,000 each. Retail investors access commercial real estate returns previously requiring crore-scale investment.

**24/7 liquidity**: Traditional real estate takes months to sell. A tokenized real estate asset can be sold in seconds on a secondary market.

**Global accessibility**: US Treasury bonds normally require US brokerage accounts and complex paperwork for non-US residents. Tokenized T-bills are accessible to anyone with a crypto wallet.

**Programmability**: Tokenized assets can automatically distribute income (rent, dividends, coupon payments) to token holders via smart contracts. No manual process.

**Composability**: Tokenized assets can be used as collateral in DeFi protocols, borrowed against, or combined with other financial instruments.

## Major RWA categories and examples

### Tokenized government bonds (largest category — $1B+ on-chain)

**Why it grew in 2023-2024**: US Treasury yields hit 5%+. DeFi yields compressed. Investors wanted on-chain yield backed by the safest asset: US government bonds.

**Protocols**:
- **Ondo Finance**: OUSG (Blackrock''s iShares Treasury ETF tokenized), USDY (tokenized short-term US Treasuries). Available to non-US accredited investors.
- **Franklin Templeton**: FOBXX — a US money market fund on the Stellar and Polygon blockchains. $360M+ in assets.
- **MakerDAO**: Allocates significant portion of DAI collateral to real-world assets including US Treasuries.

### Tokenized private credit

**Traditional private credit**: Loans to businesses, typically accessible only to institutional investors (pension funds, insurance companies) with $10M+ minimums.

**Tokenized private credit**: Fractionalised, allowing smaller investors to participate in business lending at 8-15% yields.

**Protocols**: Centrifuge (pools invoice financing, real estate loans), Maple Finance (institutional crypto lending).

**Risks**: Illiquid, default risk, smart contract risk on top of credit risk.

### Tokenized real estate

**India context**: SEBI is exploring tokenization of REITs and real estate assets. A few startups (RealX, Strata''s tokenization experiments) are building India-specific real estate tokenization.

**Global**: RealT (US residential properties in tokens), Propy (real estate transactions on blockchain).

### Commodity tokenization

**Gold**: PAXG (Paxos Gold) — each token represents 1 troy ounce of physical gold stored in Brinks vaults. Redeemable for physical delivery.

**Carbon credits**: Toucan Protocol tokenizes voluntary carbon credits, making them tradeable on-chain.

## The regulatory reality in India

RWA tokenization occupies a regulatory grey area in India. SEBI has issued consultation papers on tokenization of securities. The framework is evolving.

**Current status**: Most RWA tokenization accessible to Indian investors involves non-Indian assets (US Treasuries, US real estate). These fall under LRS limits ($250,000/year) for investment abroad.

Investing in Indian assets through tokenization protocols is legally unclear — consult a legal expert before participating.

## Risks of RWA tokenization

**Legal enforceability**: Does the token actually give you legal rights to the underlying asset? The smart contract says yes — but will an Indian court enforce it?

**Custodian risk**: The real-world asset must be held by a custodian. If the custodian fails or commits fraud, token holders face losses despite the token being "valid."

**Regulatory risk**: Regulators could classify tokens as securities, requiring compliance that may not be possible for early protocols.

**Smart contract risk**: Bugs in the tokenization smart contract could result in loss of funds.',
9,33,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='rwa-tokenization-real-world-assets');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT crypto_id,
'Global crypto regulations — MiCA, FATF, SEC vs CFTC, and India''s framework',
'global-crypto-regulations',
'# Global crypto regulations

## Why regulations matter for crypto investors

Regulatory clarity — or its absence — is one of the most significant drivers of crypto prices and adoption. The SEC lawsuit against Coinbase, the EU''s MiCA framework, and India''s 30% tax regime each had measurable market impact.

Understanding the regulatory landscape helps you assess risk, ensure compliance, and anticipate market-moving events.

## The EU — MiCA (Markets in Crypto-Assets Regulation)

The EU''s MiCA is the world''s most comprehensive crypto regulatory framework, fully effective December 2024.

**What MiCA covers**:
- Crypto-asset service providers (exchanges, wallet providers, advisors) must be licensed in the EU
- Stablecoin issuers face strict reserve requirements (fully backed, regular audits)
- Market manipulation and insider trading rules apply to crypto
- Consumer protection requirements for disclosures

**Impact**: EU-regulated exchanges must comply. Stablecoins like USDT faced challenges meeting reserve requirements. Tether (USDT) briefly delisted from some EU exchanges.

**Significance**: MiCA provides a template other jurisdictions are studying. It represents the first major jurisdiction treating crypto like traditional financial services.

## FATF Travel Rule

The Financial Action Task Force (FATF) is an intergovernmental body that sets global standards for anti-money laundering (AML) and countering terrorist financing (CTF).

**The Travel Rule for crypto**: Requires Virtual Asset Service Providers (VASPs — exchanges, wallet providers) to collect and transmit information about the sender and recipient for crypto transactions above $1,000.

Similar to the banking "travel rule" where wire transfers above $3,000 include sender/recipient information.

**Implementation status**: Adopted by 30+ countries. India''s FIU (Financial Intelligence Unit) requires exchanges to comply. This is why KYC is mandatory on Indian exchanges and why many exchanges restrict sending crypto to unverified wallets.

## US — The SEC vs CFTC jurisdictional battle

The US has no comprehensive crypto framework (as of 2024). Instead, two regulators fight over jurisdiction:

**SEC (Securities and Exchange Commission)**: Claims most crypto tokens are securities (investment contracts under the Howey Test). Has sued Ripple (XRP), Coinbase, Kraken, Binance.US.

**CFTC (Commodity Futures Trading Commission)**: Claims Bitcoin and Ethereum are commodities (not securities). Has oversight of crypto derivatives markets.

**The fundamental question**: Is a crypto token a security (SEC jurisdiction) or a commodity (CFTC jurisdiction)?

**Ripple case ruling (2023)**: XRP sold directly to institutions = security. XRP sold on exchanges = not security. Created nuanced but confusing precedent.

**Impact on Indian investors**: US regulatory actions affect global market prices and liquidity. An SEC enforcement action against a major exchange can trigger 20-30% crypto market drops.

## India — the current framework

**Tax regime (Budget 2022 onwards)**:
- 30% flat tax on crypto gains (no deduction for losses from other crypto trades)
- 1% TDS on every crypto transaction above ₹10,000 (₹50,000 for specified persons)
- Loss from one crypto cannot be offset against gain from another crypto

**Regulatory classification**: Crypto is not legal tender. VDAs (Virtual Digital Assets) are the legal term. Not classified as securities (SEBI) or commodities (FMC) — in a grey zone.

**FIU registration**: All Indian crypto exchanges must register with India''s Financial Intelligence Unit. Unregistered exchanges can be blocked.

**9 exchanges blocked (2023)**: Binance, KuCoin, OKX and others blocked by India for operating without FIU registration. Some later registered and were unblocked.

**Foreign exchange rules**: Using crypto to move money outside India (beyond LRS limits) is illegal. Peer-to-peer crypto-to-foreign-currency trades may violate FEMA.

## The global trend

The world is moving toward regulation, not prohibition. Most major economies are:
1. Requiring KYC/AML compliance from exchanges
2. Taxing crypto gains as income or capital gains
3. Developing stablecoin frameworks
4. Exploring CBDCs (Central Bank Digital Currencies) as regulated digital money

**India''s CBDC (Digital Rupee)**: RBI launched the digital rupee pilot in 2022. Distinct from crypto — centralised, government-issued, not blockchain-based in the decentralised sense. Growing adoption through bank partnerships.',
8,34,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='global-crypto-regulations');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT crypto_id,
'DeFi risk management — how to assess protocol safety before investing',
'defi-risk-management',
'# DeFi risk management

## DeFi is a high-risk environment

Between 2020 and 2024, over $5 billion was lost to DeFi hacks, exploits, and rug pulls. This is not a fringe risk — it is the baseline reality of interacting with immature, experimental financial infrastructure.

Smart investors in DeFi understand the risk landscape and apply systematic evaluation before depositing funds.

## The four categories of DeFi risk

### 1. Smart contract risk

The code is the law in DeFi. If there is a bug in the smart contract, there is no customer service to call. Funds are simply gone.

**Types of smart contract vulnerabilities**:

**Reentrancy attack**: A malicious contract calls back into the vulnerable contract before the first execution is complete, draining funds. The DAO hack (2016, $60M) was the first famous example.

**Flash loan attacks**: Uncollateralised loans that must be borrowed and repaid within a single transaction. Used to manipulate prices in liquidity pools, exploit oracle vulnerabilities, or trigger edge cases in protocol logic.

**Oracle manipulation**: DeFi protocols use oracles (price feeds) to get real-world asset prices. If the oracle can be manipulated (e.g., by moving a low-liquidity pool''s price in a flash loan), the protocol can be tricked into incorrect calculations.

**Integer overflow/underflow**: Mathematical errors in older Solidity contracts that allow attackers to wrap around numerical limits.

**How to assess smart contract risk**:
- Is the code open source? (If not: extreme red flag)
- Has it been audited? By whom? (Trail of Bits, Certik, OpenZeppelin, Halborn are respected)
- How old is the code? (Older, battle-tested code is generally safer)
- How much value is locked? (High TVL = more auditing scrutiny, but also bigger target)

### 2. Protocol/economic risk

Some DeFi protocols are mathematically unsound or rely on unsustainable tokenomics.

**Ponzi dynamics**: Protocols that pay high yields by printing their own governance token. Works while new money enters; collapses when it stops.

**Terra/Luna collapse (May 2022)**: UST stablecoin maintained its $1 peg via an algorithmic mechanism involving LUNA. When confidence broke and redemptions began, LUNA was minted faster than UST was burned, causing hyperinflationary collapse. $40B+ in value destroyed in days.

**Unsustainable yield sources**: Genuine yield comes from real economic activity (trading fees, loan interest). Yield funded by token emissions is temporary — and the emission creates selling pressure that erodes token value.

**Red flag yield question**: "Where does this 50% APY come from?" If the answer is "governance token rewards" — the yield is funded by inflation and will not persist.

### 3. Liquidity risk

**Liquidity pool concentration**: If a pool is dominated by one or two large liquidity providers, withdrawal of their liquidity can cause extreme slippage.

**Impermanent loss**: Providing liquidity to an AMM pool when prices move significantly can result in worse outcomes than simply holding the tokens. Underappreciated by most liquidity providers.

**Bank run scenarios**: In lending protocols, if many borrowers default simultaneously or many lenders withdraw, remaining lenders may not be able to exit.

### 4. Counterparty and custody risk

**Centralised components in "DeFi"**: Many DeFi protocols have admin keys, multisig governance, or upgradeability features that mean a small group of insiders can modify the protocol.

**Bridge risk**: Cross-chain bridges are among the most hacked targets in DeFi. Ronin bridge (Axie Infinity, $625M), Wormhole ($320M), Harmony Horizon ($100M) — all bridge hacks.

**Rug pull**: Developers retain control of funds (often via upgradeability or admin keys) and drain the protocol. Common in newer, unaudited protocols.

## DeFi safety checklist

Before depositing into any DeFi protocol:

- [ ] Smart contract audited by reputable firm? (Check audit reports publicly)
- [ ] Time-lock on admin functions? (Prevents immediate rug, gives community time to react)
- [ ] Protocol older than 6 months? (Newer = higher undetected bug risk)
- [ ] TVL reasonable relative to yield offered? (Very high yield on very low TVL = suspect)
- [ ] Team identity known? (Anonymous teams = higher rug risk)
- [ ] Protocol on established chain? (Ethereum, Arbitrum, Polygon — established security models)
- [ ] Governance token concentrated? (Check top 10 holders — whale concentration = centralisation risk)
- [ ] Bug bounty program? (Shows commitment to finding vulnerabilities before attackers do)

Start with the most battle-tested protocols (Aave, Compound, Uniswap, Curve) before exploring newer ones.',
9,35,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='defi-risk-management');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT crypto_id,
'On-chain analytics — reading the blockchain to find investment signals',
'on-chain-analytics-mastery',
'# On-chain analytics

## What is on-chain analytics?

On-chain analytics is the analysis of data directly from the blockchain — transactions, wallet balances, exchange flows, miner/validator behaviour, smart contract interactions.

Unlike equity markets where insider activity is hidden, blockchains are public. Every Bitcoin transaction ever made is visible to anyone. On-chain analysts use this transparency to find investment signals.

## Key on-chain metrics for Bitcoin

### Exchange inflows and outflows

When large amounts of Bitcoin move to exchanges: potential selling pressure (people preparing to sell). When Bitcoin leaves exchanges: potential accumulation (people moving to cold storage, HODLing).

**Monitoring**: Glassnode, CryptoQuant track exchange balance changes daily.

**Signal**: Sustained exchange outflows during a bear market often precede price recovery. Sustained inflows during a bull market often precede corrections.

### SOPR (Spent Output Profit Ratio)

SOPR measures whether coins being transacted today are being sold at a profit or loss.

SOPR > 1: Coins sold in profit (sellers taking gains)
SOPR < 1: Coins sold at a loss (capitulation)
SOPR = 1: Breakeven

**Bear market signal**: When SOPR consistently drops below 1 and then bounces back above (weak hands have sold at a loss, strong hands remain), it often marks a market bottom.

### MVRV Ratio (Market Value to Realised Value)

**Market Value**: Current market cap (price × supply)
**Realised Value**: The value at which each coin last moved (sum of each coin valued at its last transaction price)

MVRV > 3.5: Historically overheated, significant correction risk
MVRV < 1: Historically extreme undervaluation, high long-term reward

**Historical**: MVRV above 3.5 in late 2017 (before 84% crash) and late 2021 (before 75% crash). MVRV below 1 in late 2018 and late 2022 (both preceded major recoveries).

### Whale wallet tracking

Large Bitcoin wallets (holding 1,000+ BTC) are tracked by analytics platforms. Movements of whale wallets can signal:

- Accumulation (buying at low prices) = bullish
- Distribution (selling into strength) = bearish
- Exchange deposits (preparing to sell) = near-term bearish pressure

**Limitation**: Not all large wallets are individual investors — exchanges, custodians, and ETFs hold large amounts.

## Ethereum-specific metrics

### Gas fees and network activity

High gas fees = high network demand = high real usage. Correlates with bull markets.
Low gas fees = low demand. Can precede price weakness.

**ETH burned**: EIP-1559 burns a portion of every gas fee. High burn rate = deflationary pressure on ETH supply.

### DeFi TVL (Total Value Locked)

Total value of assets deposited in DeFi protocols. Rising TVL = growing DeFi adoption. Falling TVL = capital exiting.

**DefiLlama.com**: Best free source for cross-chain TVL data.

### Stablecoin supply growth

When stablecoin supply grows rapidly, new money is entering the crypto ecosystem (people converting fiat to stablecoins to deploy in crypto). Bullish signal.

When stablecoin supply contracts, crypto money is converting back to fiat. Bearish signal.

## Tools for on-chain analysis

**Glassnode** (paid, best in class): Comprehensive Bitcoin and Ethereum on-chain metrics. Free tier limited.

**Dune Analytics** (partially free): Community-built dashboards querying raw blockchain data. Extremely powerful for custom analysis. Requires SQL knowledge for custom queries.

**Nansen** (paid): Wallet labelling and smart money tracking. Identifies when "smart money" wallets (early investors, successful traders) are buying or selling.

**CryptoQuant** (partially free): Exchange flows, miner data, derivatives data.

**Etherscan / BSCScan / Solscan**: Free block explorers for tracking specific transactions and wallets.

## A practical on-chain workflow for Indian investors

Given the complexity of full on-chain analysis, a simplified approach:

**Monthly**: Check Bitcoin MVRV ratio on Glassnode (free tier shows this). If MVRV < 1: strong buying signal. If MVRV > 3: reduce position.

**Weekly**: Check exchange BTC inflows on CryptoQuant. Sustained high inflows near price peaks = caution.

**Before major news events**: Check stablecoin supply growth. Growing stablecoin supply = more firepower entering the market.',
8,36,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='on-chain-analytics-mastery');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT crypto_id,
'Zero-knowledge proofs — the technology that could change finance and privacy',
'zkp-zero-knowledge-crypto',
'# Zero-knowledge proofs

## What is a zero-knowledge proof?

A zero-knowledge proof (ZKP) is a cryptographic method that allows one party (the prover) to prove to another party (the verifier) that a statement is true, without revealing any information beyond the truth of the statement itself.

The classic example: Alice wants to prove to Bob that she knows the password to a system, without actually revealing the password.

**Everyday analogy**: Proving you are over 18 to enter a venue. Currently, you show your Aadhaar card, revealing your name, exact date of birth, address, and photo — far more than needed. With ZKP, you could prove "this person is 18+" with a cryptographic proof that reveals nothing else.

## Why ZKPs matter for blockchain

Blockchains are transparent by design — everyone can see every transaction. This is great for auditability and trust, but terrible for privacy.

ZKPs allow transactions to be verified (correct, legitimate) without revealing the transaction details. This enables:

**Private financial transactions**: Prove you have enough funds without revealing your balance. Prove a payment was made without revealing the amount.

**Scalability (ZK-Rollups)**: Prove that thousands of transactions were valid, without publishing every transaction on the main chain. Dramatically increases throughput and reduces costs.

## ZK-Rollups — the scaling breakthrough

ZK-Rollups are Layer 2 solutions that process transactions off the main chain and submit a mathematical proof (validity proof) that all transactions were valid.

**How it works**:
1. Thousands of transactions processed off-chain in a batch
2. A ZK proof is generated proving all transactions in the batch are valid
3. The proof (tiny in size) is submitted to Ethereum mainchain
4. Mainchain verifies the proof (fast and cheap) — if valid, all batched transactions are finalised

**Key property**: The proof is verified, not the individual transactions. Ethereum does not need to re-execute every transaction — just verify the proof. This is what makes it scalable.

**ZK-Rollup projects**:
- **zkSync Era**: Full EVM-compatible ZK-Rollup. Major DeFi protocols deployed here.
- **StarkNet**: Uses STARKs (a type of ZK proof). Developed by StarkWare. Different VM than Ethereum.
- **Polygon zkEVM**: Polygon''s ZK-Rollup aiming for full EVM equivalence.
- **Scroll**: Another EVM-compatible ZK-Rollup.

## ZK-SNARKs vs ZK-STARKs

**ZK-SNARKs (Succinct Non-interactive ARguments of Knowledge)**:
- Very small proof size (fast to verify)
- Require a "trusted setup" ceremony (a potential centralisation/trust concern)
- Used by: Zcash, Groth16 proofs in many rollups

**ZK-STARKs (Scalable Transparent ARguments of Knowledge)**:
- Larger proofs than SNARKs
- No trusted setup required (more decentralised)
- Quantum-resistant (SNARKs are not)
- Used by: StarkNet, StarkEx

## ZK proofs for privacy — real-world applications

**Identity and KYC**:
Prove you are a resident of India (for regulatory compliance) without revealing your name, Aadhaar number, or address. The verifier gets a "yes, this person is KYC compliant" without getting any personal data.

NPCI and Aadhaar are exploring ZK-based selective disclosure for this purpose.

**Financial compliance**:
Prove your transaction does not involve sanctioned counterparties, without revealing who you transacted with or how much.

Banks could verify AML/CTF compliance without exposing customer transaction history.

**Voting and governance**:
Prove your vote was counted correctly without revealing what you voted for. Eliminates vote manipulation while preserving ballot secrecy.

**Credit scoring**:
Prove your credit score is above a threshold (e.g., 750) without revealing your actual score or income data.

## Investment implications of ZK technology

ZK-Rollup tokens represent a significant sector in crypto with strong technical fundamentals:

- **zkSync (ZK token)**: Governance token of zkSync Era. Airdropped to early users.
- **StarkNet (STRK)**: Governance and fee token for StarkNet.
- **Polygon (MATIC/POL)**: Transitioning to include zkEVM as core product.

As Ethereum scales, ZK-Rollups capturing transaction volume are expected to capture significant value. This is a genuine technological moat — ZK cryptography is mathematically difficult to replicate quickly, providing competitive barriers.',
9,37,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='zkp-zero-knowledge-crypto');

  -- Final count check
  SELECT COUNT(*) INTO v_total FROM lessons WHERE is_published = TRUE;
  RAISE NOTICE 'Phase 3 Part 2 complete! Total published lessons: %', v_total;

END $PHASE3_PART2$;
