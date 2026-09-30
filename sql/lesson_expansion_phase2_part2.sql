-- ============================================================
-- FinanceHub — Lesson Expansion Phase 2 (Part 2 / Advanced Batch)
-- Adds 27 advanced lessons across Crypto, Behavioral, Forex & TA
-- Brings total platform curriculum to ~224+ published lessons
-- Safe and idempotent (WHERE NOT EXISTS)
-- ============================================================

DO $PHASE2_BATCH2$
DECLARE
  tm_id      UUID;
  crypto_id  UUID;
  corp_id    UUID;
  beh_id     UUID;
  forex_id   UUID;
  ta_id      UUID;
  pf_int_id  UUID;
  pf_beg_id  UUID;
  v_total    INT;
BEGIN
  -- Resilient ID lookups
  SELECT lv.id INTO tm_id     FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug IN ('trading-markets', 'trading', 'stock-market') AND lv.slug IN ('markets-101', 'beginner') LIMIT 1;
  SELECT lv.id INTO crypto_id FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug IN ('crypto-defi', 'crypto') AND lv.slug IN ('crypto-basics', 'what-is-crypto', 'beginner') LIMIT 1;
  SELECT lv.id INTO corp_id   FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug = 'corporate-finance' AND lv.slug IN ('business-basics', 'beginner') LIMIT 1;
  SELECT lv.id INTO beh_id    FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug = 'behavioral-finance' AND lv.slug IN ('money-psychology', 'beginner') LIMIT 1;
  SELECT lv.id INTO forex_id  FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug IN ('forex-currency', 'forex') AND lv.slug IN ('forex-basics', 'beginner') LIMIT 1;
  SELECT lv.id INTO ta_id     FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug = 'technical-analysis' AND lv.slug IN ('chart-reading-fundamentals', 'beginner') LIMIT 1;
  SELECT lv.id INTO pf_int_id FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug = 'personal-finance' AND lv.slug IN ('personal-finance-intermediate', 'intermediate') LIMIT 1;
  SELECT lv.id INTO pf_beg_id FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug = 'personal-finance' AND lv.slug IN ('beginner', 'absolute-beginner') LIMIT 1;

-- ═══════════════════════════════════════════════════════════
-- CRYPTO & DEFI ADVANCED — 8 new lessons (23 → 31)
-- ═══════════════════════════════════════════════════════════

IF crypto_id IS NOT NULL THEN
  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT crypto_id,
    'Layer 2 scaling — Optimistic vs ZK rollups explained',
    'layer-2-rollups-explained',
  '# Layer 2 Scaling — Optimistic vs ZK Rollups

## The Ethereum scalability trilemma

Ethereum is secure and decentralized, but slow and expensive. At peak traffic, executing a transaction can cost $50+ in gas fees and take minutes to confirm.

The solution: **Layer 2 (L2) rollups**. L2 networks process hundreds of transactions off-chain, bundle ("roll up") them into a single cryptographic batch, and post the final proof back to Ethereum Layer 1.

## How Rollups work

Instead of Ethereum processing 1,000 separate transactions, an L2 sequencer executes them off-chain and posts a compressed summary to Layer 1. This reduces fees by 90-99% while inheriting Ethereum''s underlying security.

## Optimistic Rollups (Arbitrum, Optimism, Base)

**Philosophy**: "Assume transactions are valid unless proven otherwise."

- **Execution**: Instant and cheap.
- **Fraud Proofs**: If a sequencer submits a malicious batch, any validator can submit a "fraud proof" within a 7-day challenge window.
- **Trade-off**: Fast deposits, but withdrawals from L2 back to Ethereum L1 take 7 days (unless using third-party liquidity bridges).

## Zero-Knowledge Rollups (zkSync, Starknet, Polygon zkEVM)

**Philosophy**: "Prove cryptographic correctness upfront."

- **Execution**: Uses complex mathematics (ZK-SNARKs or ZK-STARKs) to generate a cryptographic proof of validity.
- **Instant Finality**: Once the validity proof is verified by Ethereum L1, the transaction is irreversibly final. No 7-day challenge period.
- **Trade-off**: Higher computational power required to generate zero-knowledge proofs.

## Comparing the ecosystems

| Feature | Optimistic Rollups (Arbitrum/Base) | ZK-Rollups (zkSync/Starknet) |
| :--- | :--- | :--- |
| Technology Maturity | Highly battle-tested (EVM equivalent) | Rapidly evolving |
| Withdrawal to L1 | 7 days challenge period | Minutes to hours |
| Gas Cost | Very low | Extremely low at scale |
| Best For | DeFi, Gaming, General DApps | Payments, High-Frequency Trading |

## How to use Layer 2s safely

1. Bridge assets using official canonical bridges or trusted protocols (Hop, Across).
2. Add the L2 network to MetaMask via Chainlist.org.
3. Keep a small amount of ETH on the L2 to pay for transaction fees.',
  9, 24, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = crypto_id AND slug = 'layer-2-rollups-explained');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT crypto_id,
    'Cross-chain bridges — how they work and why they get hacked',
    'cross-chain-bridges-security',
  '# Cross-Chain Bridges and Security Risks

## Why bridges exist

Different blockchains cannot natively communicate with each other. Ethereum cannot read Solana''s state, and Bitcoin knows nothing about Avalanche.

Cross-chain bridges allow users to transfer value and data across disconnected blockchain ecosystems.

## How bridges work: Lock and Mint

The most common bridge architecture is **Lock-and-Mint**:

1. You deposit 1 ETH on Ethereum into a bridge smart contract (it gets locked).
2. An off-chain relayer or validator set observes the deposit.
3. The bridge mints 1 "Wrapped ETH" (WETH) on the destination chain (e.g., Polygon or Avalanche).
4. When moving back, the wrapped token is burned, and the original asset is unlocked.

## Why bridges are the #1 hacker target

Over **$2.5 billion** has been stolen from cross-chain bridges (Ronin $625M, Wormhole $320M, Nomad $190M).

### Common Vulnerabilities:

1. **Validator Key Compromise**: Bridges often rely on a small multisig set (e.g., 5 out of 9 validators). If hackers compromise key holder servers, they can authorize fraudulent withdrawals.
2. **Smart Contract Bugs**: Flaws in withdrawal validation logic allow attackers to claim tokens without locking real collateral.
3. **Liquidity Pool Drainage**: Exploiting oracle delays or pricing imbalances in decentralized bridge pools.

## Safety rules for bridging

- Never store large balances in wrapped assets on non-native chains for long periods.
- Prefer **native burn-and-mint bridges** (like Circle''s CCTP for USDC) over third-party lock-and-mint wrappers.
- Revoke smart contract allowances immediately after completing bridge transactions using tools like Revoke.cash.',
  8, 25, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = crypto_id AND slug = 'cross-chain-bridges-security');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT crypto_id,
    'Smart contract audits — reading security reports and spotting red flags',
    'smart-contract-audits',
  '# Smart Contract Audits & Security Due Diligence

## What is a smart contract audit?

An audit is an extensive line-by-line security review conducted by specialized cybersecurity firms (e.g., OpenZeppelin, Trail of Bits, CertiK, ConsenSys Diligence) to find bugs, logic flaws, and economic attack vectors before code is deployed.

**Critical reality**: An audit does **not** guarantee 100% safety. It only proves that the auditors did not find known vulnerabilities during their review period.

## Anatomy of an audit report

A professional audit report categorizes issues by severity:

- **Critical**: Direct loss of user funds or protocol takeover (must be resolved immediately).
- **High**: Loss of funds under specific edge cases or temporary freezing of assets.
- **Medium**: Suboptimal access control, unexpected state changes, or gas griefing.
- **Low / Informational**: Code styling, minor gas optimizations, or documentation gaps.

## Common attack vectors you must understand

### 1. Reentrancy
An attacker contract calls an external protocol function, and before the protocol updates its internal balance sheet, the attacker recursively calls the withdraw function repeatedly until the vault is emptied (famous The DAO hack).

### 2. Flash Loan Price Manipulation
Attackers borrow $100M+ uncollateralized via flash loans, manipulate a low-liquidity DEX price oracle, borrow all collateral from a lending protocol at distorted prices, and repay the flash loan in a single block.

### 3. Centralized Admin Keys (Rug Pull Risk)
Smart contracts with un-timelocked `onlyOwner` functions that allow developers to arbitrarily mint infinite tokens, change fees to 100%, or upgrade contract logic to malicious code.

## Red flags when evaluating projects

- No public audit report or audit performed by an unknown pseudonym.
- Audit report shows unresolved "Critical" or "High" findings.
- No Multi-Sig governance (single private key controls contract upgrades).
- No Time-Lock delay on protocol modifications (changes should require a 48-72 hour notice window).',
  9, 26, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = crypto_id AND slug = 'smart-contract-audits');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT crypto_id,
    'DAO governance — voting tokenomics and decentralized coordination',
    'dao-governance-mechanics',
  '# Decentralized Autonomous Organizations (DAOs)

## What is a DAO?

A DAO is an organization represented by rules encoded as transparent computer programs (smart contracts) controlled by organization members rather than a centralized board of directors or executive hierarchy.

Prominent DAOs manage billions in treasury assets (e.g., Uniswap DAO, MakerDAO, Arbitrum DAO, Aave Governance).

## How DAO governance functions

1. **Temperature Check**: Community members discuss ideas on Discord or governance forums (Discourse).
2. **Formal Proposal (RFC / EIP)**: A structured proposal is drafted detailing code changes, treasury allocations, or parameter tweaks.
3. **Snapshot Voting**: Off-chain token signaling using gasless signatures to gauge consensus.
4. **On-Chain Execution**: If passed, the proposal enters an on-chain smart contract voting queue. Once approved and the timelock expires, code executes automatically.

## Governance models

- **1 Token = 1 Vote**: The standard model. Advantage: Simple. Disadvantage: Plutocracy (whales and VCs control every outcome).
- **Quadratic Voting**: The cost of each vote scales quadratically (1 vote = 1 token, 2 votes = 4 tokens, 10 votes = 100 tokens). Amplifies community voice over pure capital concentration.
- **Delegated Voting**: Token holders delegate their voting weight to active, knowledgeable community delegates.

## Major vulnerabilities in DAOs

- **Governance Attacks**: Borrowing tokens via flash loans or market purchases to push malicious proposals that drain treasury funds.
- **Voter Apathy**: Less than 5% of token holders typically participate in governance votes.
- **Legal Liability**: In many jurisdictions, unincorporated DAOs may be treated as general partnerships, exposing individual members to unlimited liability.',
  8, 27, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = crypto_id AND slug = 'dao-governance-mechanics');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT crypto_id,
    'Tokenomics design — supply schedules FDV and inflation traps',
    'tokenomics-design',
  '# Tokenomics — Analyzing Supply, Demand, and Value Capture

## What is Tokenomics?

Tokenomics (token economics) is the study of the supply, demand, distribution, incentive mechanisms, and utility of cryptocurrency tokens.

Great technology with terrible tokenomics almost always fails as an investment.

## Key supply metrics to inspect

### 1. Circulating Supply vs. Fully Diluted Valuation (FDV)
- **Circulating Market Cap**: Current Price × Tokens currently available in the market.
- **Fully Diluted Valuation (FDV)**: Current Price × Total maximum tokens that will ever exist.

**The Low-Float High-FDV Trap**: A project with a $1B market cap but a $15B FDV means 93% of the token supply has yet to be unlocked. As early investors and team tokens unlock, massive structural selling pressure crushes retail investors.

### 2. Cliff and Vesting Schedules
- **Cliff**: Initial period (e.g., 12 months) where no investor tokens can be sold.
- **Vesting**: Linear or monthly unlocking over 2–4 years.

Always check unlock schedules on platforms like TokenUnlocks.app before investing.

## Token utility & value accrual models

- **Fee Sharing / Staking (Real Yield)**: Staking tokens to receive a portion of platform revenue in ETH or USDC (e.g., GMX, MakerDAO).
- **Governance Only**: Tokens that grant voting rights without direct cash flow claims (e.g., Uniswap UNI). Often underperform long-term.
- **Buyback and Burn**: Protocol uses fees to buy back its own token and permanently remove it from circulation (deflationary pressure).

## Tokenomics evaluation checklist

1. Is the FDV less than 3x the circulating market cap?
2. What percentage of supply is held by insiders/VCs vs. public community?
3. When is the next massive token unlock event?
4. Does holding the token entitle you to real protocol revenue or just speculative governance?',
  8, 28, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = crypto_id AND slug = 'tokenomics-design');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT crypto_id,
    'MEV and Flashbots — how invisible bots frontrun your crypto trades',
    'mev-flashbots-explained',
  '# Maximal Extractable Value (MEV) & Flashbots

## What is MEV?

Maximal Extractable Value (formerly Miner Extractable Value) is the maximum profit a blockchain validator or searcher bot can extract by including, excluding, or reordering transactions within a block.

When you submit a transaction to Ethereum, it enters the public **Mempool** (the waiting room for unconfirmed transactions). Sophisticated automated bots continuously monitor the mempool to exploit retail orders.

## Types of MEV attacks

### 1. Sandwich Attacks (DEX Frontrunning)
1. You place an order to swap $10,000 USDT for ETH on Uniswap with high slippage tolerance.
2. An MEV bot sees your pending transaction.
3. The bot submits a buy order with higher gas right before yours (frontrunning), driving the price up.
4. Your transaction executes at the worse price.
5. The bot submits a sell order right after yours (backrunning) to lock in an instant risk-free profit.

### 2. Arbitrage
Bots equalize price discrepancies between decentralized exchanges (e.g., Uniswap vs. Sushiswap) in milliseconds.

### 3. Liquidations
When collateral ratios fall on lending platforms (Aave, Compound), searcher bots race to trigger liquidations and claim bonus liquidation fees.

## Flashbots and Private Mempools

To protect against malicious frontrunning and reduce network congestion, **Flashbots** created a private communication channel between searchers and block builders.

Transactions sent via Flashbots bypass the public mempool and cannot be frontrun or sandwiched.

## How retail traders protect themselves

1. **Set Low Slippage**: Keep slippage tolerance below 0.5% on DEX swaps.
2. **Use MEV-Protected RPCs**: Switch your wallet RPC to MEV Blocker (mevblocker.io) or Flashbots Protect.
3. **Use DEX Aggregators**: Platforms like 1inch or CowSwap use batch auctions and private solvers that neutralize sandwich attacks.',
  8, 29, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = crypto_id AND slug = 'mev-flashbots-explained');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT crypto_id,
    'Decentralized perpetual DEXs — trading leverage on-chain',
    'perpetual-dexs-explained',
  '# Decentralized Perpetual DEXs (dYdX, GMX, Hyperliquid)

## What is a Perpetual Contract?

A perpetual contract ("perp") is a derivative contract similar to a traditional futures contract, but with **no expiry date**. Traders can hold leveraged long or short positions indefinitely as long as margin requirements are met.

To keep the perpetual contract price anchored to the spot market index, perpetuals use a **Funding Rate** mechanism:
- If perp price > spot price: Longs pay shorts.
- If perp price < spot price: Shorts pay longs.

## Centralized vs Decentralized Perps

Following the collapse of centralized exchanges like FTX, trading on decentralized perpetual platforms surged.

- **Non-Custodial**: You retain full ownership of private keys and funds.
- **Transparent Liquidation Logic**: Liquidations are verifiable on-chain via smart contracts.
- **Global Access**: Connect with MetaMask with no KYC verification.

## Two architectural models

### 1. Order Book Model (dYdX, Hyperliquid)
Uses off-chain matching engines with on-chain settlement. Provides high speed, deep liquidity, and institutional order execution (limit orders, stop losses).

### 2. Liquidity Pool / Multi-Asset Vault Model (GMX)
Traders execute against a shared multi-asset liquidity pool (GLP / GM pools). Liquidity providers earn 70% of platform trading fees in exchange for acting as the counterparty to traders.

## Risks of On-Chain Leverage

- **High Liquidation Risk**: Crypto volatility + high leverage (10x-50x) can wipe out margin in minutes.
- **Oracle Latency & Frontrunning**: Extreme volatility can cause price feed desynchronization.
- **Smart Contract Exploit Risk**: Leveraged vaults hold hundreds of millions in user funds, making them primary attack targets.',
  8, 30, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = crypto_id AND slug = 'perpetual-dexs-explained');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT crypto_id,
    'Crypto options and structured products — earning yield on digital assets',
    'crypto-derivatives-options',
  '# Crypto Options & Structured Financial Products

## The evolution of crypto derivatives

While spot and perpetual swaps dominate retail crypto volume, institutional participation has accelerated the growth of **Crypto Options** (primarily on Deribit and decentralized protocols like Lyra, Aevo, and Ribbon/Aevo).

## Crypto Options mechanics

- **Bitcoin & Ethereum Options**: European-style cash-settled contracts.
- **Implied Volatility in Crypto**: Crypto IV typically trades between 40% (calm periods) and 120%+ (bull run mania / regulatory panics).
- **High Premiums**: Because crypto volatility is 3-5x higher than traditional equity markets, option sellers collect substantially higher premiums.

## Decentralized Option Vaults (DOVs)

DOVs automated options strategies for retail investors through smart contracts:

### Automated Covered Call Vaults:
1. Users deposit ETH.
2. The vault automatically sells out-of-the-money (OTM) call options on a weekly basis.
3. Users earn 15-30% APY in options premiums.
4. **Risk**: If ETH rallies aggressively past the strike price, the vault is forced to sell at the strike, capping upside gains.

### Cash-Secured Put Vaults:
1. Users deposit USDC.
2. The vault sells OTM put options.
3. If market stays flat or rises, earn high APY yield in stablecoins.
4. If market crashes, you buy crypto at a discount strike.

## Structured Notes in Crypto

Platforms now package options into principal-protected notes, dual-currency investments, and volatility range-bound products.

## Risk Warning

Derivatives amplify complexity. Yield is never free — high APY in options vaults represents compensation for taking catastrophic tail risk during market crashes.',
  8, 31, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = crypto_id AND slug = 'crypto-derivatives-options');
END IF;

-- ═══════════════════════════════════════════════════════════
-- BEHAVIORAL FINANCE PART 2 — 6 new lessons (18 → 24)
-- ═══════════════════════════════════════════════════════════

IF beh_id IS NOT NULL THEN
  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT beh_id,
    'The disposition effect — why we cut winners early and hold losers forever',
    'disposition-effect',
  '# The Disposition Effect

## The most expensive bias in active trading

The **Disposition Effect** is the anomaly where investors prematurely sell assets that have increased in value (to lock in small gains) while stubbornly holding onto assets that have dropped in value (hoping they will rebound to break-even).

Studies across millions of brokerage accounts prove that the sold "winning" stocks outperform the held "losing" stocks over the following 12 months.

## Why psychology forces this mistake

1. **Pride and Regret Avoidance**: Selling a winner triggers a dopamine surge of being "right." Selling a loser admits defeat and crystallizes psychological pain.
2. **Loss Aversion (Kahneman & Tversky)**: The psychological pain of losing ₹10,000 is twice as intense as the joy of making ₹10,000. When facing a loss, investors become extreme risk-seekers, gambling that a failing stock will miraculously recover.
3. **The Break-Even Fallacy**: "I will sell as soon as I get my purchase price back." The market has zero memory or care for what price you paid.

## The devastating mathematical cost

Imagine two stocks in your portfolio:
- **Stock A**: Up +30%, business growing 25% annually. (You sell to lock in ₹30,000 profit).
- **Stock B**: Down -40%, lost major clients, debt increasing. (You hold hoping to break even).

Outcome: You pruned your best flower and watered your worst weed. Over a decade, this single habit destroys portfolio compounding.

## How to defeat the disposition effect

- **The Overnight Test**: "If I woke up today with 100% cash and owned none of this stock, would I buy it at current prices today?" If the answer is no, sell immediately.
- **Pre-Determined Stop Losses**: Define exact exit rules before clicking buy.
- **Trailing Stops**: Let winning positions ride with trailing stops that protect accumulated gains.',
  8, 19, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = beh_id AND slug = 'disposition-effect');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT beh_id,
    'Mental accounting — how arbitrary buckets sabotage financial decisions',
    'mental-accounting-budgets',
  '# Mental Accounting & The House Money Effect

## Money is fungible — but your brain doesn''t think so

**Mental Accounting** is the cognitive bias (identified by Nobel laureate Richard Thaler) where people treat money differently depending on its origin or intended use, rather than treating all money as identical.

## Common examples of mental accounting traps

### 1. The Tax Refund / Bonus Fallacy
When people receive an annual bonus, tax refund, or inheritance, they treat it as "free money" or a "windfall" and spend it on luxury splurges. In reality, a tax refund is simply your own hard-earned money that you overpaid to the government interest-free.

### 2. Low-Yield Savings vs High-Interest Debt
Someone keeps ₹2,00,000 in a fixed deposit earning 6.5% interest while simultaneously carrying a ₹1,00,000 credit card balance charging 42% APR. Logically, using the savings to eliminate the credit card saves ₹35,000+ in annual interest, but mental accounting classifies the FD as "sacred emergency savings."

### 3. The House Money Effect
After winning ₹50,000 in the stock market or a casino, an investor takes reckless high-risk bets because "I''m just playing with the house''s money." Once profit is in your account, it is **your money**—losing it is identical to losing your hard-earned salary.

## How to use mental accounting to your advantage

While mental accounting can be destructive, you can deliberately harness it for positive financial habits:

- **Automated Sub-Accounts**: Separate bank accounts for Emergency Fund, Taxes, and Long-Term Investing prevent accidental leakage into lifestyle spending.
- **24-Hour Rule on Windfalls**: Place all bonuses and refunds into a liquid fund for 30 days before making any purchase decisions.',
  7, 20, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = beh_id AND slug = 'mental-accounting-budgets');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT beh_id,
    'Gambler''s fallacy and the hot hand illusion in trading',
    'gamblers-fallacy-trading',
  '# Gambler''s Fallacy & The Hot Hand Illusion

## The random sequence illusion

The human brain is an evolved pattern-recognition engine. It struggles to accept randomness and constantly fabricates causal narratives where none exist.

## The Gambler''s Fallacy

**The belief that a streak of independent events makes the opposite outcome "due."**

- *Coin Toss*: If a coin lands on Heads 6 times in a row, people intuitively believe Tails is "due" on the 7th flip. In reality, the probability remains exactly 50%.
- *In Trading*: "NIFTY has fallen for 5 consecutive sessions, so tomorrow MUST be a green bounce day." The market owes you nothing; each trading day is driven by current liquidity and incoming data.

## The Hot Hand Fallacy

**The opposite belief: that a streak of success will automatically continue indefinitely.**

- After 4 winning swing trades, a trader feels infallible, doubles their position size, abandons risk rules, and gives back all profits on trade #5.
- Investors flood capital into the top-performing mutual fund of the previous year, precisely when mean reversion is about to hit its sector holdings.

## Realities of probabilities in trading

Even with a verified 60% win-rate trading edge:
- In a sample of 100 trades, there is a **99% mathematical probability** of experiencing 5 consecutive losses in a row.
- Emotional traders abandon proven strategies during normal losing streaks and over-leverage during winning streaks.

## Antidotes to probability biases

1. **Fixed Risk Per Trade**: Never risk more than 1-2% of total capital on any single setup, regardless of how confident you feel.
2. **Systematic Rules**: Use checklists that eliminate emotional intuition.
3. **Accept Variance**: Understand that small samples are noisy; edge reveals itself over hundreds of trades.',
  7, 21, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = beh_id AND slug = 'gamblers-fallacy-trading');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT beh_id,
    'Present bias and hyperbolic discounting — why saving feels so hard',
    'hyperbolic-discounting',
  '# Present Bias & Hyperbolic Discounting

## Why we choose instant gratification

**Hyperbolic Discounting** is the cognitive bias where humans place a disproportionately high value on immediate rewards compared to future rewards.

Given the choice between:
- ₹10,000 today vs. ₹11,000 tomorrow → Most choose ₹10,000 today.
- ₹10,000 in 12 months vs. ₹11,000 in 12 months + 1 day → Most choose ₹11,000.

Mathematically, the delay is identical (1 day for ₹1,000), but the human brain values the "present moment" with an irrational multiplier.

## Evolution vs. modern wealth creation

For 200,000 years, human ancestors survived in environments where food spoiled quickly and lifespan was uncertain. Prioritizing immediate consumption was an evolutionary survival advantage.

In modern finance, wealth creation requires the exact opposite behavior: suppressing immediate consumption today to invest for compound returns 20 years in the future.

## How present bias ruins financial futures

1. **Retirement Procrastination**: "I will start saving for retirement next year when I get promoted."
2. **EMI & BNPL Addiction**: Buying a ₹1,20,000 phone on 12-month EMI feels free today because the pain of payment is pushed to the future.
3. **Lifestyle Creep**: Immediate salary raises are immediately absorbed by better dining, cars, and gadgets.

## How to outsmart your own brain

- **Remove Willpower from the Equation**: Automate SIPs and investments to deduct directly on salary day before money can be spent.
- **Commitment Devices**: Lock retirement funds in instruments with penalties for early withdrawal (PPF, EPF, NPS).
- **Visualize Future Self**: Research shows people who view age-progressed digital renderings of themselves save up to 30% more for retirement.',
  7, 22, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = beh_id AND slug = 'hyperbolic-discounting');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT beh_id,
    'Regret aversion and analysis paralysis — overcoming the fear of starting',
    'regret-aversion-paralysis',
  '# Regret Aversion and Analysis Paralysis

## The fear of making the wrong choice

**Regret Aversion** is the psychological phenomenon where people avoid making decisions because they fear experiencing guilt and regret if the outcome turns out poorly.

## The two forms of financial regret

1. **Regret of Commission (Doing something)**: You buy a stock at ₹500 and it falls to ₹400. You feel intense regret for clicking buy.
2. **Regret of Omission (Doing nothing)**: You watch NIFTY rally 30% while keeping all money in cash. You feel regret for missing out.

Human psychology feels **regret of commission significantly more painfully** than regret of omission. As a result, millions of people keep all their savings in 3.5% bank accounts for decades, suffering silent losses to inflation.

## Analysis Paralysis

To avoid the possibility of regret, people obsessively over-research:
- Reading 50 mutual fund comparison articles without ever starting a ₹500 SIP.
- Waiting for the "perfect market dip" to invest a lump sum (market timing trap).
- Comparing 20 credit cards or term insurance policies for 6 months.

**The Reality**: The opportunity cost of waiting 1 year in cash almost always exceeds the difference between the #1 best fund and the #5 fund.

## Breaking through paralysis

- **The "Good Enough" Principle**: A simple NIFTY 50 index fund started today beats the "perfect" active fund started 3 years late.
- **Start Ridiculously Small**: Invest just ₹500/month. Once the habit and identity are formed, increasing capital is easy.
- **Decouple Process from Outcome**: You can make a 100% rational decision that results in a temporary loss due to market randomness. Judge your decisions by logic, not short-term price fluctuations.',
  7, 23, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = beh_id AND slug = 'regret-aversion-paralysis');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT beh_id,
    'Architecting your personal financial environment to defeat bias',
    'behavioral-architecture-investing',
  '# Designing Your Personal Financial Architecture

## Why discipline is overrated

Most financial advice tells you to "be more disciplined" and "control your emotions." This advice fails because human emotions will always overpower willpower under stress.

Professional institutional investors do not rely on willpower; they build **friction, systems, and constraints** that make bad financial decisions impossible.

## The 4 Pillars of Behavioral Architecture

### 1. Friction for Harmful Actions
- Delete trading and portfolio tracking apps from your phone''s home screen.
- Unlink credit cards from food delivery and e-commerce shopping apps.
- Implement a mandatory 48-hour cooling-off rule for any non-essential purchase exceeding ₹5,000.

### 2. Zero Friction for Beneficial Actions
- Auto-debit SIP investments on the 1st or 2nd day after salary credit.
- Auto-escalate investments: set SIPs to automatically increase by 10% each year.

### 3. The Investment Policy Statement (IPS)
Write a one-page contract with yourself that defines:
- Target asset allocation (e.g., 70% Equity, 20% Debt, 10% Gold).
- Exact rebalancing trigger thresholds (e.g., when equity drifts by >5%).
- Sell criteria for individual stocks.
- Rules for market crashes: *"During any 20%+ market correction, I am legally forbidden from selling equity and must deploy emergency cash tranches."*

### 4. Information Diets
- Check portfolio net worth quarterly or semi-annually, never daily.
- Mute sensationalist business news channels and hype-driven YouTube influencers.

**The Golden Rule**: Design a financial environment where your future, emotional, panicked self is physically prevented from ruining your long-term wealth.',
  8, 24, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = beh_id AND slug = 'behavioral-architecture-investing');
END IF;

-- ═══════════════════════════════════════════════════════════
-- FOREX BASICS ADVANCED — 6 new lessons (18 → 24)
-- ═══════════════════════════════════════════════════════════

IF forex_id IS NOT NULL THEN
  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT forex_id,
    'Purchasing Power Parity and REER — valuing currencies fundamentally',
    'purchasing-power-parity-reer',
  '# Purchasing Power Parity (PPP) & Real Effective Exchange Rate (REER)

## Is a currency overvalued or undervalued?

In everyday news, people celebrate when the Rupee strengthens and worry when it weakens. But how do economists and central banks determine if a currency is trading at its true fair value?

Two primary macroeconomic metrics: **Purchasing Power Parity (PPP)** and the **Real Effective Exchange Rate (REER)**.

## Purchasing Power Parity (The Law of One Price)

PPP states that in the absence of trade barriers and transaction costs, identical goods in different countries should cost the exact same amount when converted into a common currency.

Formula:
Exchange Rate = (Price of Basket in Country A) / (Price of Basket in Country B)

### The Big Mac Index:
If a Big Mac costs $5.80 in the US and ₹190 ($2.28) in India, PPP theory suggests the Indian Rupee is significantly undervalued relative to the US Dollar based on consumer purchasing power.

**Long-term dynamic**: Currencies of countries with higher inflation rates must structurally depreciate over time to equalize purchasing power. (India inflation ~5% vs. US ~2.5% = ~2.5% annual structural INR depreciation).

## Real Effective Exchange Rate (REER)

While Nominal Exchange Rate looks at just USD/INR, the **REER** measures the Rupee against a trade-weighted basket of 40 major global trading partners, adjusted for inflation differentials.

- **REER > 100**: The Rupee is overvalued relative to historical trade competitiveness. (Indian exports become expensive; imports become cheap).
- **REER < 100**: The Rupee is undervalued. (Boosts export competitiveness).

RBI closely monitors the 40-currency trade-weighted REER to decide when to intervene in forex markets.',
  8, 19, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = forex_id AND slug = 'purchasing-power-parity-reer');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT forex_id,
    'Trading high-impact economic news — NFP, CPI, and central bank FOMC',
    'trading-economic-releases',
  '# Trading Major Economic Releases in Forex

## The market-moving catalysts

While technical analysis provides price levels, major currency volatility is sparked by macroeconomic news releases.

Institutional traders and algorithms align positions around the global economic calendar.

## The Big Three news events

### 1. US Non-Farm Payrolls (NFP)
- **Release**: First Friday of every month (8:30 AM EST / 6:00 PM IST).
- **What it measures**: Net change in US employment excluding farm workers.
- **Market Impact**: Massive volatility in USD pairs (EURUSD, USDJPY, GBPUSD). Stronger jobs data = higher interest rate expectations = USD rallies.

### 2. Consumer Price Index (CPI / Inflation)
- **What it measures**: Headline and Core inflation rate.
- **Market Impact**: High CPI numbers force central banks to maintain restrictive monetary policy, strengthening the domestic currency.

### 3. Central Bank Rate Decisions (FOMC, RBI, ECB, BOJ)
- **What it measures**: Interest rate announcements + Policy Statement + Press Conference.
- **Focus**: Forward guidance and "Dot Plot" projections matter more than the rate decision itself if the hike/cut was already priced in.

## The three strategies for news releases

1. **The Pre-News Straddle**: Dangerous for retail due to spread widening and slippage.
2. **The Fade Strategy**: Waiting for initial algorithmic spike to hit major support/resistance and fading the overreaction.
3. **The Post-News Trend Continuation**: Waiting 15-30 minutes for volatility to settle, observing the true daily directional trend, and entering on pullbacks with defined risk.

## Risk rules during high-impact news

- Spreads can widen from 0.5 pips to 15+ pips in seconds.
- Stop losses may experience severe slippage.
- Conservative traders close short-term intraday positions 10 minutes prior to Tier-1 releases.',
  8, 20, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = forex_id AND slug = 'trading-economic-releases');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT forex_id,
    'Currency swaps and cross-currency basis — the plumbing of global finance',
    'currency-swaps-cross-currency',
  '# Currency Swaps & Cross-Currency Basis

## How global corporations access foreign currencies

When a large Indian conglomerate (e.g., Reliance Industries) needs $1 billion to purchase oil equipment, or an American tech company needs Japanese Yen, they do not simply buy spot currency on an exchange.

They use **FX Swaps** and **Cross-Currency Basis Swaps**—the foundational plumbing of global institutional liquidity ($7+ trillion daily turnover).

## How an FX Swap works

An FX swap is a simultaneous two-legged transaction:
1. **Spot Leg**: Party A exchanges USD for INR with Party B at today''s spot rate.
2. **Forward Leg**: Party A agrees to return the INR and buy back USD at a fixed forward exchange rate on a specified future date.

**Why use swaps?** It provides short-term foreign currency liquidity without taking directional currency risk on the balance sheet.

## The Cross-Currency Basis

According to financial theory (Covered Interest Parity), borrowing USD directly in the US should cost the same as borrowing EUR in Europe and swapping it into USD.

In reality, especially after the 2008 financial crisis, there is a persistent premium or discount known as the **Cross-Currency Basis**:

Basis = Synthetic USD Borrowing Cost - Direct USD Borrowing Cost

When global financial stress rises, everyone scrambles for US Dollars. The USD cross-currency basis becomes deeply negative, indicating severe dollar shortages in global banking systems.

## Why this matters for traders and investors

- Central bank currency swap lines (e.g., US Fed swap lines with ECB, Bank of Japan) act as emergency global liquidity backstops.
- Widening negative cross-currency basis is a leading indicator of global risk-off sentiment and tightening credit markets.',
  8, 21, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = forex_id AND slug = 'currency-swaps-cross-currency');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT forex_id,
    'Commodity currencies — trading correlations between oil gold and forex',
    'commodity-currencies-correlation',
  '# Commodity Currencies — Trading Correlations

## The link between natural resources and exchange rates

Certain national economies are heavily reliant on the export of raw commodities. As global commodity prices rise and fall, foreign capital flows directly alter the demand for their domestic currencies.

Understanding these macro correlations gives forex and stock market traders a powerful analytical edge.

## The 4 Primary Commodity Currency Pairs

### 1. Canadian Dollar (CAD) & Crude Oil
- Canada is one of the world''s largest crude oil exporters.
- **Correlation**: Strong positive correlation with WTI Crude Oil. Rising oil prices = higher Canadian export revenue = CAD strengthens (USDCAD falls).

### 2. Australian Dollar (AUD) & Iron Ore / Gold
- Australia is the premier global exporter of iron ore, coal, and gold.
- Strong Chinese industrial demand for iron ore drives AUDUSD higher.

### 3. New Zealand Dollar (NZD) & Dairy / Agriculture
- New Zealand''s largest export is dairy products (Fonterra). Global dairy trade auctions directly impact NZDUSD volatility.

### 4. Safe Haven vs Commodity: Gold & USD / JPY
- Gold is priced in USD. In geopolitical crises, Gold and the Japanese Yen (JPY) / Swiss Franc (CHF) act as safe-haven assets, while commodity currencies sell off.

## India''s commodity vulnerability: Oil vs INR

India imports over 85% of its crude oil requirements.

- When crude oil spikes (e.g., from $75 to $95/barrel), India''s trade deficit balloons.
- Oil marketing companies (IOCL, BPCL) must buy massive quantities of USD to pay foreign suppliers.
- **Result**: Spiking crude oil prices creates direct structural selling pressure on the Indian Rupee (USDINR rises).',
  7, 22, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = forex_id AND slug = 'commodity-currencies-correlation');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT forex_id,
    'Multi-currency risk parity and international portfolio hedging',
    'risk-parity-currency-hedging',
  '# Multi-Currency Portfolio Hedging & Risk Parity

## The hidden risk in international investing

When you invest in US stocks (e.g., S&P 500 ETF), your total rupee return consists of two components:

Total Return (INR) = ((1 + Asset Return in USD) * (1 + USD/INR Change)) - 1

If the S&P 500 rises 10% in USD, but the Rupee strengthens 5% against the Dollar, your actual rupee return is only ~4.5%. Conversely, Rupee depreciation boosts your returns.

## Hedged vs. Unhedged international funds

- **Unhedged Funds**: You are fully exposed to USD/INR fluctuations. Historically beneficial for Indian investors because INR depreciates 2-4% annually against USD.
- **Currency-Hedged Funds**: The fund manager uses FX forward contracts to lock in exchange rates, removing currency volatility. (Costs 1-1.5% in annual forward premium drag).

## Risk Parity Framework for Currencies

Ray Dalio''s Bridgewater popularized **Risk Parity**: allocating portfolio weights based on the volatility contribution of each asset class rather than pure capital percentage.

In multi-currency portfolios:
- High-volatility emerging market currencies (BRL, ZAR, TRY) are weighted lower.
- Reserve currencies (USD, CHF, JPY) provide ballast during global equity drawdowns.

## Hedging rules for individuals

1. **Long-Term Investments (>7 years)**: Keep unhedged. Currency depreciation generally aids long-term returns for emerging market residents.
2. **Specific Future Liabilities (Education / Emigration in 1-3 years)**: Hedge 70-100% of the target amount using currency futures or sovereign forward locks to eliminate exchange rate surprises.',
  8, 23, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = forex_id AND slug = 'risk-parity-currency-hedging');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT forex_id,
    'Central bank forward guidance and yield curve control',
    'central-bank-forward-guidance',
  '# Central Bank Forward Guidance & Yield Curve Control

## Modern monetary policy beyond interest rates

In the past, central banks only adjusted the overnight policy rate. In modern financial markets, central banks manage market expectations through **Forward Guidance** and balance sheet interventions like **Yield Curve Control (YCC)**.

## What is Forward Guidance?

Forward guidance is clear communication from a central bank regarding the anticipated future path of interest rates and monetary policy based on its economic assessment.

- **Dovish Guidance**: Signaling rates will stay low for an extended period to stimulate lending and equity markets (weakens currency).
- **Hawkish Guidance**: Signaling upcoming rate hikes or balance sheet quantitative tightening to combat inflation (strengthens currency).

## Yield Curve Control (YCC)

Pioneered by the Bank of Japan (BOJ) and used during crises:

Instead of just targeting overnight rates, the central bank commits to buying unlimited amounts of 10-year government bonds to pin the 10-year yield at a specific ceiling (e.g., 0.25% or 1.0%).

**Impact on Forex**: YCC requires printing unlimited domestic currency to purchase bonds. When other global central banks are hiking rates, this creates massive interest rate differentials, causing rapid currency depreciation (seen in the Yen falling from 115 to 160 per USD in 2022-2024).

## How traders read central bank statements

1. Compare previous statement text side-by-side with new statement (look for altered adjectives: "modest" vs "robust").
2. Inspect the **Dot Plot** (individual committee member rate forecasts).
3. Monitor the 2-year government bond yield—it represents the market''s pure pricing of central bank policy over the near horizon.',
  8, 24, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = forex_id AND slug = 'central-bank-forward-guidance');
END IF;

-- ═══════════════════════════════════════════════════════════
-- TECHNICAL ANALYSIS ADVANCED — 7 new lessons (19 → 26)
-- ═══════════════════════════════════════════════════════════

IF ta_id IS NOT NULL THEN
  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT ta_id,
    'Volume profile and order flow — reading institutional liquidity',
    'volume-profile-order-flow',
  '# Volume Profile & Order Flow Trading

## Moving beyond time-based charts

Standard volume indicators show volume over *time* (vertical bars at the bottom of the chart). **Volume Profile** displays trading volume across specific *price levels* (horizontal histogram).

This reveals exactly where institutional buyers and sellers conducted the most business.

## Core Volume Profile concepts

### 1. Point of Control (POC)
The exact price level with the highest traded volume during the specified timeframe. Acts as an institutional magnet and strong future support/resistance.

### 2. Value Area (VA)
The price range where **70% of total volume** was transacted:
- **Value Area High (VAH)**: Top boundary of fair value.
- **Value Area Low (VAL)**: Bottom boundary of fair value.

### 3. High Volume Nodes (HVN) vs Low Volume Nodes (LVN)
- **HVN**: Fair value zones where price spends significant time consolidating.
- **LVN**: Liquidity voids where price moved aggressively with low volume. Price slices through LVN zones quickly during retests.

## Order Flow (Footprint Charts)

Order flow inspects the actual market depth and executed market orders (bids vs asks):
- **Cumulative Delta**: Net difference between market buyers (aggressive) and market sellers.
- **Absorption**: Large limit orders absorbing aggressive market orders at key levels (institutional accumulation).

## Practical trade setup: Value Area Reversal

1. Price opens outside previous day''s Value Area.
2. Price fails to find acceptance and re-enters the Value Area.
3. Target: Opposite side of Value Area (e.g., enter at VAH re-entry, target VAL) with an 80% statistical rule.',
  9, 20, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = ta_id AND slug = 'volume-profile-order-flow');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT ta_id,
    'Divergence trading masterclass — regular and hidden divergences',
    'divergence-trading-masterclass',
  '# Divergence Trading Masterclass (RSI & MACD)

## What is a divergence?

A divergence occurs when the price of an asset and a technical momentum oscillator (such as RSI or MACD) move in opposite directions.

It is one of the highest-probability leading indicators in technical analysis because it signals that the underlying momentum driving a trend is exhausting before price actually reverses.

## The Two Classes of Divergence

### 1. Regular Divergence (Trend Reversal Signal)

- **Regular Bullish Divergence**:
  - Price makes **Lower Lows**
  - RSI makes **Higher Lows**
  - *Meaning*: Selling momentum is drying up; buyers ready to take control.
- **Regular Bearish Divergence**:
  - Price makes **Higher Highs**
  - RSI makes **Lower Highs**
  - *Meaning*: Buying momentum is exhausting at the top.

### 2. Hidden Divergence (Trend Continuation Signal)

- **Hidden Bullish Divergence**:
  - Price makes **Higher Lows** (healthy pullback in uptrend)
  - RSI makes **Lower Lows**
  - *Meaning*: Momentum reset without price breaking structure; trend continuation likely.
- **Hidden Bearish Divergence**:
  - Price makes **Lower Highs**
  - RSI makes **Higher Highs**
  - *Meaning*: Bearish trend continuation setup.

## Step-by-step entry protocol

1. Identify clean multi-candle divergence on Higher Timeframe (4H or Daily).
2. Wait for confirmation: Break of local market structure or candlestick reversal pattern (e.g., Pin bar or Engulfing).
3. Place stop loss beyond the swing extreme.
4. Target minimum 2:1 Reward-to-Risk ratio.',
  8, 21, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = ta_id AND slug = 'divergence-trading-masterclass');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT ta_id,
    'Ichimoku cloud complete system — all five lines explained',
    'ichimoku-cloud-complete-system',
  '# The Ichimoku Kinko Hyo Masterclass

## A complete standalone trading system

Developed in Japan by journalist Goichi Hosoda, **Ichimoku Kinko Hyo** ("Equilibrium chart at a glance") provides trend direction, momentum, support/resistance, and trading signals in one comprehensive visual overlay.

## The Five Core Components

### 1. Tenkan-sen (Conversion Line — Blue)
- Formula: (9-period High + 9-period Low) / 2
- Acts as short-term momentum indicator.

### 2. Kijun-sen (Base Line — Red)
- Formula: (26-period High + 26-period Low) / 2
- Measures medium-term trend and equilibrium price.

### 3. Senkou Span A (Leading Span A)
- Formula: (Tenkan-sen + Kijun-sen) / 2, plotted 26 periods ahead.

### 4. Senkou Span B (Leading Span B)
- Formula: (52-period High + 52-period Low) / 2, plotted 26 periods ahead.

### 5. Kumo (The Cloud)
- The shaded area between Span A and Span B.
- Price above Cloud = Bullish trend.
- Price below Cloud = Bearish trend.
- Thick cloud = Strong support/resistance; Thin cloud = Easy breakout zone.

### 6. Chikou Span (Lagging Span)
- Current closing price plotted 26 periods backwards. Confirms momentum.

## The High-Probability "Kumo Breakout" Strategy

1. **Trend**: Price closes decisively above the Kumo Cloud.
2. **Cross**: Tenkan-sen crosses above Kijun-sen.
3. **Confirmation**: Chikou Span is clear of previous price candles.
4. **Future Cloud**: Future Span A is above Future Span B (green cloud).
5. **Entry**: Open long on candle close; stop loss below Kijun-sen.',
  9, 22, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = ta_id AND slug = 'ichimoku-cloud-complete-system');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT ta_id,
    'Elliott Wave theory basics — impulse waves and corrective cycles',
    'elliott-wave-basics',
  '# Elliott Wave Theory — Market Fractality

## The rhythm of crowd psychology

Developed by Ralph Nelson Elliott in the 1930s, Elliott Wave Theory proposes that market price movements unfold in repetitive, fractal patterns driven by collective human psychology (optimism and pessimism cycles).

## The 5-3 Wave Cycle

Market trends move in an 8-wave complete cycle:
- **5-Wave Motive/Impulse Phase (1-2-3-4-5)**: Moves in the direction of the larger trend.
- **3-Wave Corrective Phase (A-B-C)**: Moves against the main trend.

## The 3 Unbreakable Rules of Impulse Waves

If any of these 3 rules is broken, the wave count is invalid:

1. **Rule 1**: Wave 2 never retraces more than 100% of Wave 1.
2. **Rule 2**: Wave 3 is **never the shortest** among waves 1, 3, and 5 (often the longest and strongest).
3. **Rule 3**: Wave 4 never enters the price territory of Wave 1 (no overlap in standard impulse).

## Wave Personalities

- **Wave 1**: Skeptical breakout from bear market bottom.
- **Wave 2**: Sharp corrective pullback testing conviction (often 50-61.8% Fibonacci retracement).
- **Wave 3**: Explosive institutional buying, heavy volume, widest price extension.
- **Wave 4**: Complex consolidation/flag pattern.
- **Wave 5**: Retail FOMO blow-off top with momentum divergence.

## Corrective Patterns (A-B-C)

- **Zigzags (5-3-5)**: Sharp deep corrections.
- **Flats (3-3-5)**: Sideways range-bound consolidations.
- **Triangles (3-3-3-3-3)**: Contracting volatility before final Wave 5 breakout.',
  8, 23, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = ta_id AND slug = 'elliott-wave-basics');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT ta_id,
    'Fibonacci confluence and extension targets — precision exits',
    'fibonacci-confluence-extensions',
  '# Fibonacci Confluence & Extension Targets

## Why Fibonacci ratios work in financial markets

Fibonacci retracements (23.6%, 38.2%, 50.0%, 61.8%, 78.6%) and extensions (127.2%, 161.8%, 261.8%) are mathematical proportions derived from the golden ratio (phi ≈ 1.618).

In financial markets, millions of algorithmic programs and institutional traders set limit orders and profit targets at these exact mathematical ratios.

## Fibonacci Retracements vs Extensions

- **Retracements (Pullbacks)**: Identify where a corrective dip will find support in an uptrend (38.2% for strong trends, 61.8% for deep pullbacks).
- **Extensions (Targets)**: Project where the next expansion leg will terminate after breaking previous swing highs.

## The Power of Fibonacci Confluence

A single Fibonacci line has moderate reliability. **Confluence** occurs when multiple independent technical indicators intersect at the exact same price zone:

1. A 61.8% Fibonacci retracement from a major swing.
2. Prior broken horizontal resistance acting as new support.
3. The 200-day exponential moving average.
4. Volume Profile Point of Control (POC).

When 3 or 4 independent tools align at a single price zone, the probability of a sharp, high-volume bounce exceeds 75%.

## Trend-Based Fibonacci Extension Formula

To project price targets on breakouts:
1. Anchor point 1: Swing Low
2. Anchor point 2: Swing High
3. Anchor point 3: Pullback Low
- **Target 1**: 1.000 (100% measured move)
- **Target 2**: 1.618 (Golden Extension — primary profit taking target)
- **Target 3**: 2.618 (Blow-off trend extension)',
  8, 24, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = ta_id AND slug = 'fibonacci-confluence-extensions');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT ta_id,
    'ATR position sizing and dynamic volatility stop losses',
    'atr-position-sizing',
  '# Average True Range (ATR) & Volatility Sizing

## The flaw with fixed percentage stops

Most novice traders place arbitrary stop losses (e.g., "always 2% below my entry" or "always 20 points").

This is fatal because different stocks have wildly different volatility regimes. A 2% stop on a calm large-cap like HDFC Bank gives the trade room to breathe, while a 2% stop on a high-beta stock like Adani Enterprises will get stopped out by normal market noise within 5 minutes.

## What is Average True Range (ATR)?

Developed by J. Welles Wilder, ATR measures market volatility by decomposing the entire range of an asset for a given period (typically 14 periods).

**True Range (TR)** is the greatest of:
1. Current High - Current Low
2. Absolute value of (Current High - Previous Close)
3. Absolute value of (Current Low - Previous Close)

## Volatility-Adjusted Stop Losses (Chandelier Exits)

Instead of a fixed rupee or percentage stop, set your stop loss based on ATR multiples:

Stop Loss = Entry Price - (2 * ATR14)

In calm markets (low ATR), your stop is tighter. In volatile markets (high ATR), your stop is wider, keeping you in winning trends.

## Mathematical Position Sizing Formula

To guarantee you never lose more than your account risk limit (e.g., 1% of account = ₹10,000):

Position Size (Shares) = Account Risk (₹) / Distance to Stop Loss (₹)

Shares = ₹10,000 / (2 * ATR)

By using ATR position sizing, every trade automatically risks the exact same monetary amount regardless of the volatility of the asset.',
  8, 25, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = ta_id AND slug = 'atr-position-sizing');

  INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
  SELECT ta_id,
    'Trading expectancy and Monte Carlo simulation of drawdowns',
    'trading-expectancy-math',
  '# Trading Expectancy & Monte Carlo Risk Simulation

## The mathematical definition of an edge

A trading strategy is not defined by its win rate. A trader with a 90% win rate can go bankrupt, while a trend-follower with a 35% win rate can generate hundreds of percent in compounded returns.

The true metric of a trading system is **Expectancy**:

Expectancy = (Win Rate * Average Win) - (Loss Rate * Average Loss)

### Example A: High Win Rate Trap
- Win Rate = 80%, Average Win = ₹1,000
- Loss Rate = 20%, Average Loss = ₹5,000
- Expectancy = (0.80 * 1,000) - (0.20 * 5,000) = ₹800 - ₹1,000 = -₹200
- **Result**: Negative edge. Guaranteed bankruptcy over time.

### Example B: Trend Following Edge
- Win Rate = 40%, Average Win = ₹4,000 (4R)
- Loss Rate = 60%, Average Loss = ₹1,000 (1R)
- Expectancy = (0.40 * 4,000) - (0.60 * 1,000) = ₹1,600 - ₹600 = +₹1,000
- **Result**: Positive edge. Generates ₹1,000 on average for every trade executed.

## Monte Carlo Simulation of Drawdowns

Even with a positive expectancy, trade outcomes occur in random sequence.

A **Monte Carlo Simulation** reshuffles 1,000 historical trades into 10,000 random order variations:
- It reveals that even with a 50% win rate and 2:1 R:R, there is a **65% chance of experiencing a 15% drawdown** at some point in your first 200 trades.
- If you risk 5% per trade, your probability of total account ruin is near 100%. If you risk 1% per trade, probability of ruin drops to 0%.

## The Golden Takeaway

Trade execution is simply pulling the lever on a positive-expectancy casino machine where you are the house. Keep risk small enough to survive unavoidable losing streaks.',
  9, 26, TRUE, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE level_id = ta_id AND slug = 'trading-expectancy-math');
END IF;

-- Final count
SELECT COUNT(*) INTO v_total FROM lessons WHERE is_published = TRUE;
RAISE NOTICE 'Phase 2 Batch 2 complete! Total published lessons across platform: %', v_total;

END $PHASE2_BATCH2$;