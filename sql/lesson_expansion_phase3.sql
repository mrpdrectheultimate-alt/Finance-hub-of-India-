-- ============================================================
-- FinanceHub — Lesson Expansion Phase 3 (75% expansion)
-- Target: ~227 → ~277 total published lessons (+50)
-- Run AFTER lesson_expansion_phase2_part2.sql
-- Idempotent: WHERE NOT EXISTS on every insert
-- ============================================================

DO $PHASE3$
DECLARE
  pf_beg_id  UUID;
  pf_int_id  UUID;
  tm_id      UUID;
  corp_id    UUID;
  crypto_id  UUID;
  beh_id     UUID;
  forex_id   UUID;
  ta_id      UUID;
  v_total    INT;
BEGIN
  -- Resilient level lookups by level slug or track association
  SELECT lv.id INTO pf_beg_id  FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug IN ('personal-finance', 'personal-finance-beginner') AND lv.slug IN ('absolute-beginner', 'beginner', 'personal-finance-basics') LIMIT 1;
  IF pf_beg_id IS NULL THEN SELECT id INTO pf_beg_id FROM levels WHERE slug = 'absolute-beginner' LIMIT 1; END IF;

  SELECT lv.id INTO pf_int_id  FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug IN ('personal-finance', 'personal-finance-intermediate') AND lv.slug IN ('personal-finance-intermediate', 'intermediate') LIMIT 1;
  IF pf_int_id IS NULL THEN SELECT id INTO pf_int_id FROM levels WHERE slug = 'personal-finance-intermediate' LIMIT 1; END IF;

  SELECT lv.id INTO tm_id      FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug IN ('trading-markets', 'trading', 'stock-market') AND lv.slug IN ('markets-101', 'beginner') LIMIT 1;
  IF tm_id IS NULL THEN SELECT id INTO tm_id FROM levels WHERE slug = 'markets-101' LIMIT 1; END IF;

  SELECT lv.id INTO corp_id    FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug IN ('corporate-finance', 'corporate') AND lv.slug IN ('business-basics', 'beginner') LIMIT 1;
  IF corp_id IS NULL THEN SELECT id INTO corp_id FROM levels WHERE slug = 'business-basics' LIMIT 1; END IF;

  SELECT lv.id INTO crypto_id  FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug IN ('crypto-defi', 'crypto') AND lv.slug IN ('what-is-crypto', 'beginner') LIMIT 1;
  IF crypto_id IS NULL THEN SELECT id INTO crypto_id FROM levels WHERE slug = 'what-is-crypto' LIMIT 1; END IF;

  SELECT lv.id INTO beh_id     FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug IN ('behavioral-finance', 'behavioral') AND lv.slug IN ('money-psychology', 'beginner') LIMIT 1;
  IF beh_id IS NULL THEN SELECT id INTO beh_id FROM levels WHERE slug = 'money-psychology' LIMIT 1; END IF;

  SELECT lv.id INTO forex_id   FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug IN ('forex-currency', 'forex') AND lv.slug IN ('forex-basics', 'beginner') LIMIT 1;
  IF forex_id IS NULL THEN SELECT id INTO forex_id FROM levels WHERE slug = 'forex-basics' LIMIT 1; END IF;

  SELECT lv.id INTO ta_id      FROM levels lv JOIN tracks t ON lv.track_id = t.id WHERE t.slug IN ('technical-analysis', 'ta') AND lv.slug IN ('chart-reading-fundamentals', 'beginner') LIMIT 1;
  IF ta_id IS NULL THEN SELECT id INTO ta_id FROM levels WHERE slug = 'chart-reading-fundamentals' LIMIT 1; END IF;

-- ═══════════════════════════════════════════════════════════
-- PERSONAL FINANCE BEGINNER — +5 lessons (17 → 22)
-- ═══════════════════════════════════════════════════════════

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT pf_beg_id,
'Wills and nominations — protecting your family before it is too late',
'wills-and-nominations',
'# Wills and nominations

## The uncomfortable truth

Most Indians die without a will. Their families then spend years — sometimes decades — in legal disputes over assets. Courts, lawyers, estrangement between siblings.

A will takes 2-3 hours to write and costs ₹2,000-₹5,000 to register. It prevents incalculable family pain.

## What happens without a will

Intestate succession (dying without a will) follows the Hindu Succession Act (for Hindus, Buddhists, Sikhs, Jains) or Indian Succession Act (for others).

**For a married man dying intestate**: Assets split equally between wife, children, and mother. This often means the wife does not get the full estate — she must share with in-laws. Complications multiply if there are children from previous relationships.

**For unmarried individuals**: Assets go to parents and siblings in a specific legal order.

Legal costs + court time + family conflict = preventable disaster.

## What a will must include

1. **Declaration**: "I, [full name], residing at [address], being of sound mind, declare this to be my last will and testament."
2. **Executor**: Person you appoint to carry out the will. Choose someone trustworthy, younger than you, and ideally based in the same city as your assets.
3. **Beneficiaries**: Who gets what. Be specific — "my apartment at [address] to my wife [name]" not "my property to my family."
4. **Residuary clause**: "Everything not specifically mentioned above goes to [person]." Catches anything you forgot.
5. **Date and signature**: Must be signed by you in the presence of two adult witnesses who are not beneficiaries.

## Registration (strongly recommended)

An unregistered will is valid in India but can be challenged. A registered will is far harder to contest.

Register at the Sub-Registrar office in your area. Bring: draft will, Aadhaar, two witnesses with ID. Cost: ₹200 stamp duty + nominal fee.

## Nominations — separate from will, equally important

Nomination determines who receives the asset immediately on death without probate.

**Bank accounts**: Add nominee in bank settings (all major banks allow online nominee addition). Nominee receives the money directly.

**EPF**: Nominate via EPFO member portal. Critical — EPF corpus is often the largest asset for salaried employees.

**Mutual funds**: Add nominee via AMC portal or Groww/Zerodha.

**Insurance**: Nominee already added at purchase — review and update after marriage, divorce, or death of original nominee.

**Critical**: Nomination and will can conflict. If your will says "flat to son" but your wife is the nominee on the home loan insurance — the insurance goes to wife. Courts later reconcile this, but it creates disputes. Align your nominations and will.',
8,18,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='wills-and-nominations');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT pf_beg_id,
'Joint accounts and financial planning for couples',
'joint-accounts-couples',
'# Joint accounts and financial planning for couples

## The money conversation most couples avoid

Money is the number one cause of divorce in India. Yet most couples never have a structured conversation about finances before or after marriage.

A joint financial plan is not about control — it is about alignment. Couples who talk openly about money report higher relationship satisfaction and build significantly more wealth.

## Structuring finances as a couple

### Option 1: Fully joint
All income goes into a joint account. All expenses paid from it. Complete transparency.

Works best when: Both partners trust each other completely, similar financial values, no significant income disparity.

Challenge: One partner may feel they have less autonomy, especially if incomes are very different.

### Option 2: Yours, mine, ours (most practical)
Each partner maintains an individual account. A joint account is created for shared expenses (rent, groceries, EMIs, household).

Each contributes proportionally to joint account (equal or income-based split). Personal spending from individual accounts — no questions asked.

Works best for: Couples with income disparity, different spending styles, or who want some financial independence within the relationship.

### Option 3: Fully separate
Each pays specific bills. No joint account.

Works for some couples but creates complexity for shared goals (home, children) and unequal burden if one income drops.

## Joint accounts — practical setup

**Who to add**: Spouse, and consider adding a trusted family member (parent or sibling) as nominee.

**Operation mode**:
- Either or Survivor: Either partner can transact independently. Most practical.
- Former or Survivor: Primary holder must transact. Secondary only inherits.
- Jointly: Both must sign. Cumbersome for daily use.

**Recommended**: Either or Survivor for day-to-day joint account.

## Shared financial goals — the monthly money meeting

Once a month, 30 minutes:
1. Review last month spending vs budget
2. Check progress on shared goals (home down payment, vacation, child education)
3. Any upcoming large expenses?
4. Investments — are SIPs running?
5. Insurance — any renewals due?

This one conversation prevents 90% of money-related conflicts.

## Financial planning for the non-working partner

If one partner is not earning (by choice or circumstance), they must still have:
- Individual bank account in their name
- Their own health insurance (not just dependent on spouse)
- Nominee in all spouse accounts and insurance policies
- Understanding of household financial situation (where accounts are, what loans exist, what insurance is in place)

Financial dependence without financial literacy creates extreme vulnerability if the earning partner dies, becomes disabled, or the relationship ends.',
7,19,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='joint-accounts-couples');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT pf_beg_id,
'Credit cards done right — rewards, traps, and the rules that protect you',
'credit-cards-done-right',
'# Credit cards done right

## The fundamental rule

A credit card is a tool. Like any tool, used correctly it is tremendously useful. Used carelessly, it is destructive.

**The one rule that makes credit cards net positive**: Never spend on a credit card what you do not already have in your bank account.

Treat your credit card as a debit card that gives rewards. The moment you use it to buy something you cannot currently afford, it becomes a loan at 36-42% annual interest.

## Why credit cards are genuinely useful (when used correctly)

**Rewards**: 1-5% cashback or reward points on every transaction. Over a year of ₹50,000/month spending, 2% cashback = ₹12,000 earned.

**Purchase protection**: Many cards offer 90-day purchase protection (theft, damage). Some offer extended warranty.

**Fraud protection**: Disputed transactions are much easier to reverse on credit cards than debit cards.

**Credit score building**: Responsible credit card use is the fastest way to build a high CIBIL score.

**Grace period**: 20-50 days interest-free float on purchases.

**Travel benefits**: Airport lounge access, travel insurance, forex markup waivers on premium cards.

## The best credit cards in India (2024)

**Beginners (no annual fee)**:
- HDFC MoneyBack+: 2% cashback on online purchases
- Axis My Zone: Movie benefits, dining discounts
- SBI SimplyCLICK: Amazon and online shopping rewards

**Moderate spenders (₹2,000-5,000 annual fee)**:
- HDFC Regalia: Comprehensive travel and dining benefits, 4 lounge visits/quarter
- Axis Ace: 2% unlimited cashback via Google Pay

**High spenders (₹5,000+ annual fee, waived on spend)**:
- HDFC Infinia: 5 reward points/₹150, unlimited lounge, golf
- Amex Platinum Travel: Best travel rewards

## The traps to avoid

**Minimum payment trap**: Card companies show minimum payment (2-5% of balance) to keep you in debt. Always pay FULL STATEMENT BALANCE before due date. Never just the minimum.

**EMI conversion**: "Convert to EMI" sounds convenient but costs 13-18% interest. Use only for genuine emergencies, not lifestyle.

**Fuel surcharge**: Check your card — many charge 1% surcharge on fuel that wipes out rewards.

**Reward point expiry**: Most points expire in 2-3 years. Review and redeem annually.

**Annual fee trap**: Premium card with ₹5,000 fee and ₹1,000 in benefits = net loss. Calculate your actual benefit.

## Credit score optimisation through cards

- Pay full balance every month (most important)
- Keep utilisation below 30% of credit limit (ideally below 10%)
- Do not apply for multiple cards in short periods
- Keep oldest card active even if you get newer ones',
7,20,TRUE,TRUE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='credit-cards-done-right');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT pf_beg_id,
'Financial planning for women — unique challenges and strategies',
'financial-planning-for-women',
'# Financial planning for women

## Why women need a different financial playbook

Women in India face financial challenges that most personal finance advice does not address:

**The gender pay gap**: Women earn approximately 19-25% less than men for equivalent work in India. This compounds over a career.

**Career breaks**: Childbirth, elder care, relocation for spouse career — women statistically take more career breaks, reducing EPF accumulation, promotion velocity, and total earning years.

**Longevity**: Indian women live 3-5 years longer than men on average. The same retirement corpus must last longer.

**Financial dependence**: Many women delegate financial decisions to husbands or fathers, then find themselves completely unprepared after divorce or death.

The result: Women need to save more, start earlier, and be more financially literate — yet often start with less knowledge and fewer resources.

## The most important financial moves for women

### 1. Your own accounts, always
Every woman — married, unmarried, working, not working — must maintain a bank account solely in her own name, investments in her own name, and insurance in her own name.

This is not about distrust. It is about financial security. A woman who has never held an investment account has no credit history, no financial track record, and extreme vulnerability in any crisis.

### 2. Understand what you own
If you are married and your spouse manages finances, you still need to know:
- What bank accounts exist and where
- What investments, property, EPF you jointly own
- What insurance is in place (including nominees)
- What loans or liabilities exist

At minimum, this information protects you if your spouse dies or becomes incapacitated.

### 3. The career break financial plan
If you plan to take a career break for children or family:

Before the break: Max out EPF voluntary contributions, build personal investment portfolio, ensure adequate term insurance on spouse (primary earner), maintain professional skills and network.

During the break: Continue personal SIPs (even ₹500/month keeps the habit), maintain professional certifications, track job market in your field.

### 4. Retirement planning with longer horizon
A 30-year-old woman needs to plan for 35+ years of retirement (age 60 to 95+). This requires a larger corpus and more equity exposure for longer.

Women-specific schemes: Mahila Samman Savings Certificate (7.5% for 2 years), Sukanya Samriddhi for daughters (8.2%), Senior citizen savings (for 60+).

## Legal rights every woman should know
- Wife has equal right in matrimonial home (cannot be evicted)
- Married daughters have equal right in father''s Hindu ancestral property (2005 amendment)
- Divorced women can claim maintenance and share of matrimonial assets
- Women entrepreneurs get priority consideration in MUDRA loans',
8,21,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='financial-planning-for-women');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT pf_beg_id,
'Money and relationships — how to talk about finances without fighting',
'money-and-relationships',
'# Money and relationships

## Why money causes more conflict than almost anything else

Money is never just money. It represents security, freedom, power, love, and self-worth — all at the same time. When you argue about money with a partner, you are often actually arguing about values, control, and fear.

Understanding this changes how you approach financial conversations.

## The four money personalities

Research identifies four core money personalities:

**The Saver**: Security comes from accumulation. Spending causes anxiety even when affordable. Struggles to enjoy money or be generous.

**The Spender**: Money is for enjoying now. Delayed gratification is difficult. Generosity comes naturally. Can struggle with long-term planning.

**The Avoider**: Financial management causes anxiety. Avoids looking at bank statements. Difficulty with budgets and long-term planning.

**The Money Monk**: Believes money is corrupting or uncomfortable. May undercharge for services, resist wealth accumulation.

Most couples have different money personalities. Neither is right or wrong — but mismatches cause friction without understanding.

## The money conversation to have before marriage

Financial compatibility matters as much as personal compatibility. Before marriage, discuss:

1. **Current debts**: Student loans, credit card debt, family loans — full disclosure
2. **Financial habits**: Saver or spender? How do you make large purchase decisions?
3. **Goals alignment**: Home ownership vs travel lifestyle vs early retirement — do your goals align?
4. **Family obligations**: Expected to support parents? Help siblings?
5. **Financial boundaries**: How much can each spend without consultation?
6. **Career plans**: Any expected breaks? Geographic flexibility?
7. **Prenuptial consideration**: Legal protection is not a lack of trust — it is clarity

## When money conversations become arguments — de-escalation

**Do not have money conversations when**: Stressed, tired, hungry, or immediately after a large purchase that caused surprise.

**The productive structure**:
- State the financial situation factually (no blame)
- Share how you feel about it ("I feel anxious when our savings drop below X")
- Ask about their perspective ("Help me understand your thinking")
- Solve together ("What can we each do to address this?")

**The 24-hour rule**: If a financial conversation escalates, pause and agree to continue in 24 hours. Immediate resolution of heated money arguments rarely produces good outcomes.

## Financial infidelity — the hidden threat

Financial infidelity means hiding financial information from a partner: secret accounts, hidden debt, undisclosed purchases, concealed income.

Studies show financial infidelity is as damaging to relationships as physical infidelity and is a leading cause of divorce.

Prevention: Monthly money meetings, joint visibility of all accounts, agreed individual discretionary spending limits with no questions asked.',
7,22,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='money-and-relationships');

-- ═══════════════════════════════════════════════════════════
-- PERSONAL FINANCE INTERMEDIATE — +5 lessons (20 → 25)
-- ═══════════════════════════════════════════════════════════

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT pf_int_id,
'Buying a home in India — the complete financial guide',
'home-buying-guide-india',
'# Buying a home in India — the complete guide

## Rent vs buy — the honest analysis

Buying a home is not always the right financial decision. Run the numbers for your situation.

**The 5% rule (rough guide)**:
Annual cost of owning = ~5% of property value (property tax + maintenance + opportunity cost of down payment + EMI interest)

If annual rent < 5% of property price: Renting may be better financially.

Example: ₹1 crore flat. Annual rent ₹2.4 lakh (₹20K/month) = 2.4%. Ownership cost ≈ ₹5 lakh/year. Renting saves ₹2.6 lakh/year.

This does not mean never buy — ownership provides stability, forced savings, and potential appreciation. But do not assume buying is always better.

## The true cost of a home purchase

Most buyers only think about the sticker price. The real costs:

**One-time costs**:
- Stamp duty: 4-7% of agreement value (varies by state)
- Registration: 1% of agreement value
- GST (under-construction only): 5% (affordable housing) or 12% (others)
- Brokerage: 1-2% if agent involved
- Home loan processing fee: 0.5-1% of loan amount
- Legal/documentation: ₹20,000-₹50,000
- Interior and furniture: ₹3-20 lakh depending on size and taste

Total one-time costs beyond property price: **8-15% of property value**

**Ongoing costs**:
- Property tax: ₹5,000-₹50,000/year depending on city and size
- Maintenance/society charges: ₹3,000-₹15,000/month
- Home insurance: ₹5,000-₹15,000/year
- Repairs and upkeep: Budget 1% of property value annually

## The home loan process

**Eligibility**: Banks typically lend up to 80-85% of property value (you fund 15-20% down payment). EMI should not exceed 40-50% of take-home salary.

**Best rates (2024)**: SBI, HDFC Bank, Kotak typically offer most competitive rates (check bankbazaar.com for current comparison). Women borrowers get 0.05% concession at most banks.

**Documents**: Last 3 years ITR, 6 months salary slips, 6 months bank statements, Form 16, employment letter, property documents.

**The loan tenure decision**: Longer tenure = lower EMI but more total interest.
₹50 lakh loan at 8.5%:
- 15 years: EMI ₹49,270, total interest ₹38.7 lakh
- 20 years: EMI ₹43,391, total interest ₹54.1 lakh
- 25 years: EMI ₹40,130, total interest ₹70.4 lakh

Choose shorter tenure if EMI is manageable. Prepay aggressively in early years (when interest component is highest).

## RERA — your legal protection

Real Estate Regulatory Authority (RERA) registration is mandatory for all residential projects above 500 sqm or 8 apartments.

Before buying:
1. Verify project is RERA-registered at your state RERA website
2. Check if builder has any RERA complaints filed
3. Verify carpet area (RERA mandates carpet area disclosure — not super built-up area)
4. Confirm possession date and penalty clauses

## Red flags when buying

- Builder does not have RERA registration
- Pressure to close "within 24 hours" or lose the deal
- Unclear title documents (insist on title search by your own lawyer)
- Pre-launch booking before RERA registration
- Payment schedule front-loaded (asking for 80% before construction is 50% complete)
- Too-good-to-be-true price in a premium location',
9,21,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='home-buying-guide-india');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT pf_int_id,
'NPS deep dive — is the National Pension System right for you?',
'nps-deep-dive',
'# NPS — National Pension System deep dive

## What is NPS?

The National Pension System is a government-regulated retirement savings scheme open to all Indian citizens aged 18-70. It combines market-linked returns with tax benefits and low cost.

## NPS account types

**Tier 1 (mandatory, retirement-focused)**:
- Minimum contribution: ₹1,000/year
- Lock-in: Until age 60
- Tax benefits: Yes (deductions under 80CCD)
- Partial withdrawal: Allowed after 3 years for specific reasons (child education, medical, home purchase — up to 25% of own contributions)

**Tier 2 (voluntary, flexible)**:
- Minimum contribution: ₹250
- No lock-in: Withdraw anytime
- Tax benefits: Only for government employees (3-year lock-in for deduction)
- For private sector: No tax benefit — use regular mutual funds instead

## The tax benefits — better than most realise

**Section 80CCD(1)**: Up to 10% of salary (or 20% of gross income for self-employed) within the ₹1.5 lakh 80C limit.

**Section 80CCD(1B)**: Additional ₹50,000 OVER AND ABOVE the 80C limit. This is the unique NPS advantage.

For a taxpayer in 30% bracket: ₹50,000 × 30% = ₹15,000 saved in tax annually, just from the additional NPS contribution. Over 30 years, this deduction alone adds significant value.

**Employer contribution (Section 80CCD(2))**: Employer can contribute up to 10% of basic+DA to NPS. This is tax-free for the employee (no upper limit). Highly beneficial if your employer offers this.

## Investment options within NPS

**Auto choice**: NPS allocates based on age — more equity when young, shifts to debt as you age. Aggressive (up to 75% equity), Moderate (up to 50%), Conservative (up to 25%).

**Active choice**: You decide allocation between:
- Equity (E): Market-linked returns, up to 75% cap (50% after 50)
- Corporate bonds (C): Investment-grade corporate debt
- Government securities (G): Government bonds — safest
- Alternative investments (A): REITs, AIFs — up to 5%

**Recommendation for those under 45**: Maximum equity allocation (75% E) given long horizon.

## The exit rules

At 60:
- Minimum 40% must be used to purchase an annuity (monthly pension)
- Remaining 60% can be withdrawn as lump sum — tax-free

Before 60 (premature exit):
- 80% must go to annuity
- 20% as lump sum — taxable

Death: Full corpus goes to nominee tax-free.

## NPS vs EPF vs PPF comparison

| | NPS | EPF | PPF |
|--|--|--|--|
| Returns | Market-linked (10-12% historically) | 8.15% (fixed) | 7.1% (fixed) |
| Tax on withdrawal | 60% tax-free | Fully tax-free (5yr+) | Fully tax-free |
| Liquidity | Low (locked to 60) | Moderate | Low (15yr) |
| Annuity requirement | Yes (40% minimum) | No | No |
| Best for | Additional tax saving beyond 80C | Mandatory, stable | Conservative 15yr savings |

**Verdict**: NPS is most valuable for the ₹50,000 additional deduction (80CCD(1B)) and for those seeking higher returns who can accept the annuity lock-in.',
8,22,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='nps-deep-dive');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT pf_int_id,
'Planning your child''s education — costs, timelines, and the right instruments',
'childs-education-planning',
'# Planning for your child''s education

## The education inflation problem

Education costs in India are rising at 10-12% annually — nearly double general CPI inflation. This makes education one of the most expensive financial goals to plan for.

What costs ₹10 lakh today for engineering will cost:
- In 5 years: ₹16.1 lakh
- In 10 years: ₹25.9 lakh
- In 15 years: ₹41.8 lakh

For international education (US, UK, Canada, Australia), multiply by 5-10x and add currency depreciation risk.

## The calculation framework

**Step 1**: Estimate today''s cost of the education you are planning for.
**Step 2**: Inflate at 10% for the years until your child needs it.
**Step 3**: Calculate the monthly SIP needed to reach that corpus.

**Example**: Child is 3 years old. Planning for engineering at age 18 (15 years away).
- Today''s cost: ₹15 lakh (good private college, 4 years)
- Inflated cost: ₹15 lakh × (1.10)^15 = ₹62.7 lakh
- Monthly SIP at 12% returns for 15 years to reach ₹63 lakh: **₹12,800/month**

Start earlier, need less:
- Start at child''s birth (18 years): ₹8,900/month
- Start at age 5 (13 years): ₹17,500/month
- Start at age 8 (10 years): ₹27,600/month

**Every year of delay roughly doubles the required monthly investment.**

## Instruments for education planning

**Sukanya Samriddhi Yojana (SSY)**: Only for daughters. 8.2% guaranteed return. Tax-free. Matures when daughter turns 21 (partial withdrawal at 18 for education). Maximum ₹1.5 lakh/year. Excellent for conservative part of education corpus.

**Equity mutual funds (best for 7+ year horizon)**: Recommended for the largest portion. Target 12% returns. NIFTY 50 index fund + mid-cap for the equity allocation.

**PPF (for conservative allocation)**: 15-year tenure aligns well with child education planning. 7.1% tax-free. Lock-in prevents impulsive withdrawal.

**Child education plans (insurance-linked)**: Usually not recommended — high charges, inflexible. Pure term insurance + mutual fund SIP delivers far better outcomes.

## The separate account rule

Maintain a separate investment account/portfolio exclusively for education. Never mix with retirement or other goals.

Psychological benefit: You will not dip into it for other needs.
Practical benefit: You can track progress against the specific target.

## For international education

Add currency risk: INR has depreciated ~3-4% annually against USD historically.

₹63 lakh corpus in 15 years may fund Indian education but will cover only 1-2 years of US tuition (current cost $50,000-80,000/year).

For international education planning: Either target a much larger corpus, plan for education loans (available up to ₹1.5 crore for premier institutions with 15-year repayment), or plan for scholarship opportunities.',
8,23,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='childs-education-planning');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT pf_int_id,
'Freelancer and self-employed finances — taxes GST and retirement without a company',
'freelancer-finances',
'# Freelancer and self-employed finances

## The financial challenges of self-employment

Freelancers and self-employed individuals face unique financial challenges salaried employees do not:

- No employer PF contribution (you must fund your own retirement completely)
- No group health insurance (you must buy your own)
- Irregular income makes budgeting harder
- Tax compliance is more complex
- No Form 16 — must handle taxes independently
- No salary slip for loan applications (need 2-3 years ITR)

These are solvable challenges. Here is the system.

## Income management for irregular earners

**The percentage allocation system** (works better than fixed budgets for variable income):

When money comes in, immediately split:
- 30% → Tax reserve account (separate savings account, do not touch)
- 20% → Investments (SIP, retirement)
- 50% → Living expenses

In a good month: More goes to investment/tax. Bad month: Less does. The ratios hold regardless of income amount.

**3-month expense buffer**: Maintain 3 months of expenses in a liquid fund as income buffer. This funds slow months without touching investments.

## Tax compliance for freelancers

**ITR form**: ITR-3 (business income) or ITR-4 (presumptive taxation under 44ADA for professionals).

**Section 44ADA (Presumptive taxation for professionals)**:
Available for doctors, lawyers, architects, consultants, CA, engineers with gross receipts up to ₹75 lakh.
Declare 50% of gross receipts as profit. No need to maintain detailed books.
Remaining 50% assumed to be expenses — no documentation needed.

Example: Gross receipts ₹40 lakh. Declared profit = ₹20 lakh. Tax on ₹20 lakh.

**GST**: Mandatory if annual turnover exceeds ₹20 lakh (₹10 lakh for some states). Services to foreign clients (export of services) are zero-rated — no GST charged.

**Advance tax**: If tax liability exceeds ₹10,000/year, pay advance tax quarterly (June 15, Sept 15, Dec 15, March 15). Penalty on shortfall.

**Business expenses you can deduct**: Home office (proportional), internet, phone, equipment, software subscriptions, professional development, travel for work, accountant fees.

## Retirement planning without employer

No EPF. No gratuity. You must build your entire retirement corpus.

**NPS is particularly valuable for self-employed**: 20% of gross income deductible under 80CCD(1) + additional ₹50,000 under 80CCD(1B). Large deduction for high earners.

**Suggested allocation**:
- NPS: Maximum eligible contribution (for tax benefit)
- PPF: ₹1.5 lakh/year (safe, tax-free)
- Equity mutual funds: Remaining investable surplus

Target: 30-40% of gross income into retirement savings (vs 15-20% for salaried, because you have no employer contribution).

## Health insurance is non-negotiable

Without employer group insurance, a hospitalisation can financially devastate a freelancer.

Minimum coverage: ₹10 lakh individual floater + ₹50 lakh super top-up. Annual premium ₹15,000-₹35,000 depending on age. Tax deductible under Section 80D.',
8,24,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='freelancer-finances');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT pf_int_id,
'Financial planning at 40 — course correction and catching up',
'financial-planning-at-40',
'# Financial planning at 40

## The 40-year-old financial reality check

Many Indians arrive at 40 with good income but insufficient savings. Career consumed the 30s. Home loan EMI is the biggest outflow. Retirement feels abstract.

The good news: 40 is not too late. The bad news: You have less time than you think. The solution: Urgency, not panic.

## The 40 at 40 rule

By age 40, target a net worth of at least 3x your annual income.

If annual income is ₹20 lakh, target ₹60 lakh in assets (home equity + investments + EPF + other).

Below this target? Aggressive course correction needed. At or above? On track — maintain or accelerate.

## The retirement math at 40

If you want to retire at 60 with ₹2 lakh/month (₹24 lakh/year) expenses:

Required corpus (4% rule): ₹24 lakh × 25 = ₹6 crore

Current corpus: ₹30 lakh (hypothetical)
Gap: ₹5.7 crore
Time: 20 years
Required monthly SIP at 12%: ₹57,000/month

This feels large. But at age 40 with reasonable income, ₹57,000/month in investments (aggressive but achievable for ₹20 lakh+ income) is the price of delayed action.

Alternatively: Extend working years to 65 reduces required corpus significantly (5 fewer years of retirement, 5 more years of accumulation).

## The 40s financial priorities in order

**1. Eliminate high-interest debt**: Any personal loans, credit card debt, or vehicle loans at 10%+ interest. Pay these before investing (guaranteed 10%+ return).

**2. Max out tax-advantaged accounts**: EPF voluntary (VPF), NPS ₹50,000 additional, ELSS. Reduce tax bill aggressively — at 40 with peak income, marginal rate likely 30%.

**3. Increase equity exposure temporarily**: Counter-intuitive advice, but if you are behind on retirement savings, you need higher returns. Increase equity allocation to 70-80% of investment portfolio. You have 20 years — enough time to weather volatility.

**4. Build 12-month emergency fund**: At 40, risk of job disruption is real. 12 months (not 6) of expenses in liquid funds.

**5. Critical insurance review**:
- Term insurance: If not already done, last chance for affordable premiums. After 45-50, premiums spike dramatically.
- Health insurance: Review coverage — ₹10-20 lakh minimum at 40.
- Critical illness: High relevance as lifestyle diseases spike in 40s.

## The lifestyle inflation trap at 40

40s typically bring peak earnings AND peak lifestyle spending — premium cars, larger homes, international holidays, children in expensive schools.

Every lifestyle upgrade is a retirement delay. Be intentional: Which upgrades genuinely add quality of life vs which are status maintenance?

The family that drives a 5-year-old car and holidays domestically but retires at 58 with ₹6 crore has made a better trade than the family in an SUV with business class seats and ₹80 lakh retirement corpus.',
8,25,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='financial-planning-at-40');

-- ═══════════════════════════════════════════════════════════
-- TRADING & STOCK MARKETS — +8 lessons (35 → 43)
-- ═══════════════════════════════════════════════════════════

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT tm_id,
'Sector analysis — how to find the best sectors before the market does',
'sector-analysis',
'# Sector analysis

## Why sectors matter more than individual stocks

Individual stocks are driven by company-specific factors. But 60-70% of a stock''s price movement comes from the sector and macro environment, not the company itself.

Even the best-managed IT company underperforms in a sector downturn. A mediocre company in the right sector at the right time outperforms.

Understanding which sectors to be in — and when — is more impactful than individual stock picking for most investors.

## The four factors that drive sector performance

### 1. Economic cycle positioning
As covered in sector rotation: different sectors outperform at different economic stages. Banks and consumer discretionary lead early recovery. Energy and materials lead late cycle. Defensives (FMCG, healthcare, utilities) lead in recession.

### 2. Regulatory environment
Highly regulated sectors (banking, pharma, telecom, insurance) can be dramatically affected by regulatory changes.

**Examples**: RBI tightening regulations on unsecured lending crushed NBFC stocks in 2023. New drug pricing regulations hit pharma. 5G spectrum auction affected telecom capex cycles.

Always track the regulatory calendar for sectors you own.

### 3. Input cost dynamics
Manufacturing companies (steel, cement, auto, chemicals) have margins compressed when raw material costs rise. Margins expand when input costs fall.

Track: Oil prices (affects auto, aviation, chemicals, paints), steel prices (auto, real estate, capex), commodity indices (mining, agriculture).

### 4. Demand drivers specific to the sector

**IT services**: US and European IT budgets (check Infosys and TCS guidance for "demand environment"), USD/INR, visa policies.

**Banking**: Credit growth, NIM (net interest margin) trends, NPA (non-performing assets) direction, RBI rates.

**Auto**: Urban consumer sentiment, rural incomes (monsoon dependent), EV transition pace.

**Pharma**: US FDA approvals and import alerts, domestic pricing policy, API cost trends.

**Real estate**: Interest rate cycle (lower rates = more buyers), urban income growth, government housing schemes.

## Building a sector analysis process

**Monthly**: Review sector ETF performance relative to NIFTY. Which sectors are showing relative strength (beating index)? Which are lagging?

**Quarterly**: Read sector-wide commentary from top companies'' earnings calls. What are management teams saying about demand?

**Annually**: Review sector valuations (P/E, P/B) vs historical averages. Overvalued sectors tend to mean-revert.

## Sector concentration warning

Owning 5 stocks in the same sector is not diversification — it is concentrated sector betting. Genuine diversification means owning across multiple uncorrelated sectors.',
8,36,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='sector-analysis');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT tm_id,
'How to use stock screeners — finding ideas with Screener.in and Tickertape',
'stock-screeners-guide',
'# Using stock screeners effectively

## What is a stock screener?

A stock screener filters thousands of companies down to a shortlist matching specific criteria. Instead of manually reading 5,000 NSE-listed companies, you define rules and the screener shows only matching companies.

Screeners are idea-generation tools, not buy signals. Every screened result still requires fundamental analysis.

## Best free screeners for Indian stocks

**Screener.in**: Most powerful free screener for Indian stocks. 10+ years of financials, customisable queries, export to Excel. Industry standard for retail investors.

**Tickertape.in**: Modern interface, pre-built screens, peer comparison. Good for quick filtering.

**BSE/NSE screener**: Basic but free and authoritative.

**Trendlyne**: Detailed technical + fundamental data, consensus estimates, promoter holding history.

## Building useful screens on Screener.in

The query language is simple:

```
Sales growth 5Years > 15 AND
Net profit growth 5Years > 15 AND
Return on equity > 15 AND
Debt to equity < 0.5 AND
Current ratio > 1.5 AND
Price to earning < 25
```

This screens for: Consistent 15%+ revenue and profit growth, strong ROE, low debt, adequate liquidity, and reasonable valuation.

## Pre-built screens for different styles

**Quality growth (Buffett style)**:
ROE > 15 AND Net profit growth 5Years > 12 AND Debt to equity < 0.3 AND Market cap > 1000

**Dividend income**:
Dividend yield > 3 AND Payout ratio < 60 AND Profit growth 3Years > 5

**Deep value**:
Price to book < 1 AND Return on equity > 10 AND Debt to equity < 1

**Small cap momentum**:
Market cap < 5000 AND Market cap > 500 AND Sales growth > 20 AND Profit growth > 20 AND Price to earning < 30

## The right way to use screener results

1. Screen produces 15-20 companies
2. Eliminate any with obvious red flags (pledging > 30%, recent auditor change)
3. Read annual report of remaining 5-6
4. Build a watchlist — do not buy immediately
5. Study valuation — is it at a fair price?
6. Wait for a better entry point (correction in the stock or market)

## Common screener mistakes

**Overfitting**: Building a screen with too many conditions that only a few companies match. The screen may be capturing historical winners that are already expensive.

**Ignoring qualitative factors**: A screen cannot capture management quality, competitive moat strength, or industry tailwinds. These require reading and judgment.

**Buying directly from screen output**: Screeners find candidates, not investments. The work starts after the screen.',
8,37,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='stock-screeners-guide');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT tm_id,
'ETF investing — the complete guide to exchange traded funds in India',
'etf-investing-guide',
'# ETF investing in India

## What is an ETF?

An Exchange Traded Fund (ETF) is a basket of securities that tracks an underlying index (NIFTY 50, SENSEX, Gold, etc.) and holds exactly the same securities in the same proportion.

ETFs combine the diversification of mutual funds with the trading flexibility of stocks.

## ETFs vs Index funds — which to choose?

Both track indices at low cost. Key differences:

| | ETF | Index fund |
|--|--|--|
| Trading | Buy/sell anytime during market hours | Only at end-of-day NAV |
| Minimum investment | 1 unit (~₹200-250 for NIFTY ETFs) | ₹500 SIP |
| Expense ratio | 0.02-0.10% | 0.10-0.20% |
| Requires demat | Yes | No |
| Auto-invest (SIP) | Harder (need to place orders) | Easy (automated SIP) |
| Tracking error | Lower (usually) | Slightly higher |

**For SIP investors**: Index fund wins (easier automation).
**For lump sum investors**: ETF wins (lower cost, real-time pricing).

## Major ETF categories in India

### Equity ETFs
**NIFTY 50**: Nippon NIFTYBEES (oldest, most liquid), SBI NIFTY50, HDFC NIFTY50
**NIFTY Next 50**: UTI NIFTY Next 50 ETF
**Midcap**: NIFTY Midcap 150 ETF
**International**: Mirae Nasdaq 100 ETF, Kotak Nasdaq 100
**Sectoral**: Bank NIFTY ETF, IT ETF, Pharma ETF

### Gold ETFs
Physical gold held in demat form. Nippon Gold ETF, SBI Gold ETF, HDFC Gold ETF.
Advantages over physical: No making charges, no storage, exact gold price tracking.
Tax: 20% LTCG with indexation after 3 years.

### Debt ETFs
Bharat Bond ETF: Invests in AAA-rated public sector bonds. Fixed maturity dates. Tax-efficient for certain holding periods.

### Silver ETFs
New category (2021+). Tracks silver prices. ICICI Pru Silver ETF, Nippon Silver ETF.

## Liquidity — the most important ETF consideration

An ETF is only as useful as its liquidity. Illiquid ETFs have wide bid-ask spreads (difference between buy and sell price), meaning you lose money entering and exiting.

**Always check**: Average daily volume before buying an ETF.

For NIFTY 50 ETFs: Extremely liquid. Bid-ask spread is negligible.
For sectoral or thematic ETFs: Check volume. Some have very thin trading with 0.5-1% spread.

## The simple ETF portfolio

For most investors, 3 ETFs cover everything needed:

1. **NIFTY 50 ETF** (40%): Large-cap India core
2. **NIFTY Next 50 ETF** (30%): Mid-large cap growth
3. **Gold ETF** (10%): Inflation hedge
4. **Bharat Bond or Liquid ETF** (20%): Stability and rebalancing buffer

Annual rebalancing. Total annual cost: ~0.10%. Hard to beat.',
8,38,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='etf-investing-guide');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT tm_id,
'Reading management commentary — what executives reveal between the lines',
'reading-management-commentary',
'# Reading management commentary

## Why management communication matters

Financial statements tell you what happened. Management commentary tells you what will happen — or at least what management wants you to believe will happen.

Learning to distinguish confident, honest leadership from promotional spin is a critical skill for stock investors.

## Where to find management commentary

**Earnings calls**: Quarterly calls where management presents results and takes analyst questions. Transcripts available on company website, BSE/NSE filings, and Screener.in.

**Annual report (MD&A section)**: Management Discussion and Analysis — the narrative accompanying financials. Required by SEBI.

**Investor day presentations**: Less frequent, deep dives into strategy.

**Credit rating rationale**: Rating agencies explain the company''s financial health in plain language.

## Green flags — signs of honest, capable management

**Specific guidance**: "We expect revenue of ₹2,200-2,400 crore next quarter" vs "We expect to do well." Specificity indicates confidence and accountability.

**Acknowledging failures**: "We underperformed this quarter due to X — here is what we are doing about it." Honest about mistakes, specific about remediation.

**Consistent messaging**: What they said last year matches what they delivered. Check 2-year-old commentary against current results.

**Uses cash wisely**: Does management allocate capital to highest-return opportunities (buybacks when cheap, acquisitions when strategic, dividends when mature) or empire-build?

**Insider buying**: When promoters buy shares in the open market (disclosed in exchange filings), they are betting their personal money. Strong signal.

## Red flags — signs of promotional or evasive management

**Vague guidance**: "We remain optimistic about the future" with no specifics. Often precedes disappointment.

**Constant guidance downgrades**: Promises X, delivers 0.7X, resets to 0.7X for next year, delivers 0.5X. Pattern of missed guidance.

**Blame external factors always**: Every shortfall blamed on macro, competition, regulations — never internal execution.

**Excessive use of adjusted metrics**: "Adjusted EBITDA excluding one-time items" that somehow appears every quarter.

**Avoiding analyst questions**: Deflecting specific questions, giving non-answers, cutting off follow-ups.

**Promoter selling**: Promoters regularly selling shares while publicly bullish is a serious red flag.

## The year-over-year comparison technique

Pull the MD&A from 2 years ago. Compare what management said then about the business outlook to what actually materialised.

This single exercise reveals more about management quality than any financial metric.',
8,39,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='reading-management-commentary');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT tm_id,
'Share buybacks and rights issues — what they mean for shareholders',
'buybacks-rights-issues',
'# Buybacks and rights issues

## Share buybacks — when companies buy their own shares

A buyback (share repurchase) is when a company uses its cash to buy its own shares from the market and cancel them.

**Effect**: Number of shares outstanding decreases → Earnings per share (EPS) increases → Stock price typically rises.

## Why companies do buybacks

**Return excess cash**: Company has more cash than it can deploy productively. Rather than let it sit idle, it returns it to shareholders.

**Signal undervaluation**: Management believes the stock is cheap at current prices. Best signal when promoters also buy alongside the buyback.

**EPS improvement**: Fewer shares = same earnings distributed among fewer shares = higher EPS. This can improve valuation multiples.

**Alternative to dividend**: Buybacks are more tax-efficient than dividends for investors (buyback gains taxed as capital gains vs dividends taxed at slab rate).

## How to participate in a buyback

**Open market buyback**: Company buys from the market over time. No action needed from shareholders.

**Tender offer buyback**: Company offers to buy at a specific price (usually 15-25% premium). Shareholders can tender their shares.

**Participation decision**: Tender if you want to exit at the premium. Hold if you are long-term bullish and prefer the continuing EPS benefit.

**Tax**: Buyback gains taxed as capital gains (LTCG or STCG depending on holding period).

## Red flag buybacks

Not all buybacks are positive:
- Company doing buyback while taking on debt = financial engineering, not shareholder value
- Buyback at inflated price = destroying value
- Promoters selling while company buybacks = promoters using the buyback as exit liquidity

## Rights issues — when companies ask existing shareholders for money

A rights issue is when a company offers new shares to existing shareholders at a discount to market price, in proportion to their current holdings.

**Example**: TCS does a 1:10 rights issue at ₹3,000 (market price ₹3,500).
You hold 100 shares → you get the right to buy 10 additional shares at ₹3,000.

**Should you exercise your rights?**

If you are long-term bullish: YES. You are buying at a discount. Not exercising is equivalent to selling.

If you are not bullish or lack funds: Sell your rights (most rights are listed and tradeable on exchanges).

**Why companies do rights issues**: Need capital for expansion, debt repayment, or working capital. Rights issue is cheaper than external fundraising.

**Impact on existing price**: Rights issue causes theoretical ex-rights price drop (because new cheaper shares dilute value). Long-term impact depends on how wisely the raised capital is deployed.',
8,40,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='buybacks-rights-issues');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT tm_id,
'Swing trading — capturing multi-day moves with a systematic approach',
'swing-trading-system',
'# Swing trading — a systematic approach

## What is swing trading?

Swing trading captures price moves lasting 2-10 days. Unlike intraday (same-day close) or position trading (weeks to months), swing trading holds overnight and across a few sessions.

**The sweet spot**: Long enough for meaningful moves, short enough to avoid macro event risk that kills multi-month positions.

## Why swing trading suits certain personalities

Swing trading is better than intraday for:
- People with jobs (check once daily, set orders, move on)
- Those who cannot handle real-time P&L watching
- Traders who want larger moves per trade (intraday moves are small)

Swing trading is worse than position investing for:
- Those with transaction cost sensitivity (more trades = more cost)
- People who cannot hold overnight risk

## Building a swing trading system

**Step 1: Market regime filter**
Only take long swings in stocks above their 200-day moving average.
Only take short swings in stocks below their 200-day moving average.
In bear markets (NIFTY below 200 MA): Trade short or stay in cash.

**Step 2: Sector strength filter**
Prefer longs in sectors showing relative strength vs NIFTY.
A great setup in a weak sector is a lower probability trade.

**Step 3: Entry setup (choose one, master it)**
- Pullback to support in an uptrend (most reliable)
- Breakout from consolidation on volume
- Reversal at key support/resistance

**Step 4: Position sizing**
Risk 1% of trading capital per trade.
Entry at ₹100, stop at ₹96 (4% stop) → position size = 1% capital / 4% stop = 25% of capital in this trade.

**Step 5: Stop loss placement**
Below last swing low for long trades. Above last swing high for shorts.
Never move stop against your position (wider to avoid getting stopped).

**Step 6: Target and exit**
Minimum 2:1 reward/risk. If stop is ₹4 away, target ₹8+ from entry.
Partial exit at 1:1 (take half off, move stop to break-even).
Final exit at target or when trend shows reversal signs.

## Stocks suitable for swing trading

- High liquidity (average daily volume > ₹10 crore)
- Mid-to-large cap (less manipulation risk)
- In active uptrend or clear downtrend (not sideways)
- Ideally in strong sector

## The journal review is everything

Review every completed swing trade:
- Did you follow the system?
- What worked? What failed?
- What was your emotion during the trade?

Without this feedback loop, swing trading is expensive trial and error.',
8,41,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='swing-trading-system');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT tm_id,
'Position trading — holding stocks for weeks to months',
'position-trading',
'# Position trading

## What is position trading?

Position trading holds trades for several weeks to several months — longer than swing trading (days) but shorter than long-term investing (years).

Position traders capture the larger trend moves within a market cycle. They are not concerned with daily noise but ride the directional trend until it shows signs of exhaustion.

## Why position trading can outperform

**Fewer trades**: Transaction costs and slippage are minimised.
**Larger moves**: Monthly trends generate much larger price moves than daily swings.
**Less screen time**: Monitoring once daily or even weekly is sufficient.
**Tax efficiency**: Positions held beyond 1 year qualify for LTCG (10%) vs STCG (15%).

## Position trading vs long-term investing

| | Position Trading | Long-term Investing |
|--|--|--|
| Holding period | Weeks to months | Years |
| Basis | Technical + fundamental | Fundamental primarily |
| Sell criteria | Technical breakdown | Fundamental deterioration |
| Tax | STCG or LTCG | Usually LTCG |
| Attention needed | Weekly | Quarterly |

## Building a position trading approach

**Universe selection**: Start with NIFTY 100 or NIFTY 200 stocks — sufficient liquidity, less manipulation.

**Top-down filter**:
1. Identify strong sectors (relative strength vs NIFTY)
2. Within strong sectors, find strongest stocks (highest relative strength within sector)
3. This narrows to 5-10 candidates

**Entry criteria**:
- Stock in clear uptrend (higher highs, higher lows on weekly chart)
- Pullback to 20-week or 50-week moving average
- Volume dries up during pullback (low supply = sellers exhausted)
- Entry as price resumes upward

**Stop loss**: Below the pullback low (weekly close basis to avoid intra-week noise triggering stop).

**Target**: Next major resistance from historical price action, or 2-3x the risk.

**Holding**: Continue holding as long as:
- Weekly uptrend structure intact (higher highs, higher lows)
- Price above key moving averages (20-week or 50-week)
- No fundamental deterioration in the business

**Exit signals**: Weekly close below key support, moving average crossover to downside, fundamental change (earnings miss, management change, competitive threat).

## The 4% weekly rule for exits

If a stock closes the week more than 4% below the prior week''s low, exit. This simple rule captures most major trend reversals.',
8,42,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='position-trading');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT tm_id,
'IPO investing — how to evaluate and apply for IPOs profitably',
'ipo-investing-guide',
'# IPO investing — a systematic approach

## The IPO opportunity and reality

IPOs can generate extraordinary listing gains — and catastrophic losses. Understanding how to evaluate them separates disciplined investors from FOMO-driven applicants.

**The data**: SEBI studies show that over long periods, most Indian IPOs underperform the broader market after listing. Grey market premium (GMP) often does not reflect fundamental value. The vast majority of listing-day gains go to retail investors who flip immediately — and subsequent holders often lose.

Yet some IPOs are genuinely good long-term investments. The skill is distinguishing between them.

## The pre-IPO checklist

Before applying, review the DRHP (Draft Red Herring Prospectus) — available on SEBI website and the lead manager''s site.

**Business quality**:
- [ ] Does the business have a clear, defensible moat?
- [ ] Is revenue growing consistently (30%+ for high-multiple IPOs)?
- [ ] Are margins improving or stable (not declining while scaling)?
- [ ] Is the company generating positive cash flow or at least improving?

**IPO use of proceeds**:
- [ ] Majority for business expansion (good) or promoter exit via OFS (caution)
- [ ] Offer for Sale (OFS) means existing shareholders are selling — not a negative itself, but warrants scrutiny
- [ ] Check promoter post-IPO holding — do they still have skin in the game?

**Valuation**:
- [ ] Compare P/E, P/S, EV/EBITDA to listed peers
- [ ] Justify premium to peers with growth differential
- [ ] A good business at a bad price is still a bad investment

**Promoter background**:
- [ ] Research promoter history — previous businesses, any regulatory actions
- [ ] Insider selling: Are promoters aggressively selling before IPO?

## Categories of applicants and allotment

**Retail (up to ₹2 lakh application)**:
- Allotment is by lottery if oversubscribed
- Apply from multiple family member accounts to increase probability
- The minimum lot application is most efficient for retail

**HNI (above ₹2 lakh)**:
- Proportional allotment — larger application = more shares
- Requires larger capital commitment

**QIB (institutional)**:
- Anchor investors (largest institutions) get early allocation
- Strong QIB subscription = validation signal (but not guarantee)

## The GMP (Grey Market Premium) trap

GMP shows expected listing premium based on informal trading before listing. GMP of 80% before listing sounds exciting but:

- GMP is driven by speculative demand, not fundamental value
- Artificial GMP can be created by market operators
- High GMP + poor fundamentals = sell immediately on listing day

**Rule**: Apply based on fundamentals. GMP can inform listing expectations but should never drive the investment decision.',
9,43,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='ipo-investing-guide');

-- ═══════════════════════════════════════════════════════════
-- CORPORATE FINANCE — +6 lessons (30 → 36)
-- ═══════════════════════════════════════════════════════════

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT corp_id,
'Cost of capital — WACC explained and why it drives all valuation',
'cost-of-capital-wacc',
'# Cost of capital and WACC

## What is the cost of capital?

Every business is funded by a combination of debt and equity. Both have a cost:

**Cost of debt**: The interest rate the company pays on its borrowings. Easy to calculate — it is in the financial statements.

**Cost of equity**: Harder to calculate. It is the return shareholders expect for the risk they are taking. No cash payment — but shareholders expect the stock to appreciate to compensate for risk.

**WACC (Weighted Average Cost of Capital)**: The blended cost of all capital sources, weighted by their proportion in the capital structure.

WACC = (E/V × Re) + (D/V × Rd × (1-T))

Where:
- E = Market value of equity
- D = Market value of debt
- V = E + D (total capital)
- Re = Cost of equity
- Rd = Cost of debt
- T = Tax rate (interest is tax-deductible)

## Calculating cost of equity — the CAPM model

Capital Asset Pricing Model (CAPM):

Re = Rf + β × (Rm − Rf)

- Rf = Risk-free rate (10-year Indian government bond yield ≈ 7%)
- β (Beta) = Stock''s sensitivity to market moves (available on NSE, Screener.in)
- Rm − Rf = Equity risk premium (historical premium of equity over bonds ≈ 5-6% in India)

**Example**: Stock with β = 1.3, Rf = 7%, ERP = 5.5%
Re = 7% + 1.3 × 5.5% = 7% + 7.15% = **14.15%**

High beta stocks (volatile, risky) have higher cost of equity. Low beta (utilities, FMCG) have lower cost of equity.

## Calculating WACC — worked example

Company: 60% equity funded, 40% debt funded.
Cost of equity: 14%
Cost of debt: 9% (interest rate)
Tax rate: 25%

WACC = (0.60 × 14%) + (0.40 × 9% × 0.75)
WACC = 8.4% + 2.7%
**WACC = 11.1%**

## Why WACC matters for valuation

In a DCF model, WACC is the discount rate used to bring future cash flows to present value.

Higher WACC = lower present value of future cash flows = lower valuation.

This is why:
- Rising interest rates lower stock valuations (Rf rises → WACC rises → DCF value falls)
- High-debt companies trade at lower multiples (debt amplifies financial risk → higher WACC)
- High-beta growth stocks are most sensitive to rate changes (their long-dated cash flows get discounted at higher rates)

## The hurdle rate

Companies use WACC as the minimum return threshold for investment decisions.

"We will only invest in projects that generate returns above our WACC of 11%."

Projects returning 15% → accept (creates value above cost of capital).
Projects returning 9% → reject (destroys value — costs more capital than it returns).',
9,31,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='cost-of-capital-wacc');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT corp_id,
'LBO — leveraged buyout modeling basics',
'lbo-modeling-basics',
'# Leveraged buyouts — LBO basics

## What is an LBO?

A leveraged buyout is the acquisition of a company using a significant amount of borrowed money (debt) to meet the purchase price.

The acquired company''s assets and cash flows serve as collateral for the debt. Private equity firms use LBOs to acquire companies with a small equity check, amplifying returns through leverage.

**Simple analogy**: Buying a ₹1 crore property with ₹20 lakh down payment and ₹80 lakh mortgage. If property appreciates to ₹1.4 crore, you''ve made ₹40 lakh on ₹20 lakh invested (200% return) — not the 40% the property actually appreciated.

This is leverage amplifying returns. It also amplifies losses.

## The LBO structure

**Transaction funding** (₹500 crore acquisition):
- Equity (PE fund): ₹150 crore (30%)
- Senior debt (banks): ₹250 crore (50%)
- Subordinated/mezzanine debt: ₹100 crore (20%)

The acquired company now carries ₹350 crore of debt on its balance sheet.

**How PE makes money**:
1. **Debt paydown**: Company''s cash flows repay debt over 5 years. Equity value grows as debt shrinks (without the business improving at all).
2. **EBITDA improvement**: Operational improvements increase EBITDA.
3. **Multiple expansion**: Buy at 6x EBITDA, sell at 8x EBITDA (market re-rating).

## The three value creation levers

**1. Debt paydown (financial engineering)**
Start: Company worth ₹500cr (₹350cr debt, ₹150cr equity).
After 5 years of debt paydown: Debt = ₹150cr. Same business = equity ₹350cr.
Return: ₹350cr / ₹150cr invested = 2.3x without any business improvement.

**2. EBITDA growth (operational improvement)**
PE firms add value by: professionalising management, cutting costs, expanding margins, making add-on acquisitions, entering new markets.

**3. Multiple expansion**
Business bought at 6x EBITDA with turnaround thesis. After improvement, public market values similar businesses at 9x.
If EBITDA also grew: Total return = EBITDA × multiple expansion × debt paydown.

## LBO candidates — what makes a good LBO target?

**Stable, predictable cash flows**: Essential for debt service. Asset-heavy businesses with long-term contracts (infrastructure, real estate) work well. Cyclical businesses are risky.

**Undervalued/underperforming**: PE firms want to buy cheap and improve.

**Limited existing debt**: A company already highly leveraged cannot take more.

**Defensible market position**: A moat prevents competitive pressure from disrupting the cash flow thesis.

**Non-core asset of a conglomerate**: Parent company may sell below intrinsic value to raise cash or simplify operations.',
9,32,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='lbo-modeling-basics');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT corp_id,
'Financial distress indicators — how to spot a company in trouble early',
'financial-distress-indicators',
'# Spotting financial distress early

## Why early detection matters

By the time a company''s troubles are obvious to the market (stock has fallen 60%, media is covering it), most of the damage to shareholders is already done.

Early detection — 12-18 months before a crisis — allows you to exit at better prices or avoid the investment entirely.

## The Altman Z-Score

The Altman Z-Score is a quantitative model that predicts corporate bankruptcy with reasonable accuracy.

Z = 1.2×X1 + 1.4×X2 + 3.3×X3 + 0.6×X4 + 1.0×X5

Where:
- X1 = Working capital / Total assets
- X2 = Retained earnings / Total assets
- X3 = EBIT / Total assets
- X4 = Market cap / Total liabilities
- X5 = Revenue / Total assets

**Interpretation**:
- Z > 2.99: Safe zone
- 1.81 < Z < 2.99: Grey zone (caution)
- Z < 1.81: Distress zone (high bankruptcy risk)

Calculate this annually for companies you hold. A declining Z-score trend is a warning even if still in safe zone.

## The 10 early warning signals

**1. Cash flow divergence**: Net profit growing but operating cash flow stagnating or falling. This gap indicates earnings quality issues — revenue being recognised without cash collection.

**2. Rising receivable days**: If DSO increases from 45 days to 75 days over 2 years, customers are paying slower. May indicate channel stuffing or customer financial stress.

**3. Inventory build-up**: Inventory growing faster than revenue for 2+ consecutive quarters indicates demand slowdown before management acknowledges it.

**4. Promoter pledge spike**: Sudden increase in promoter pledge percentage often means promoters are borrowing against shares due to personal or group-level financial stress.

**5. Frequent related-party transactions**: Large and growing related-party transactions (especially loans to promoter entities) can indicate cash extraction from the listed company.

**6. Declining interest coverage**: EBIT / Interest expense falling below 2 is concerning. Below 1.5 is dangerous.

**7. Auditor concerns**: Emphasis of matter, going concern note, qualification, or resignation. Read audit reports fully.

**8. Debt restructuring**: Any one-time restructuring, extension of repayment schedules, or NPA classification at lending banks.

**9. Management departures**: CFO resignation, sudden board changes, legal head departure — investigate the reason.

**10. Promoter selling**: Systematic promoter open-market selling while publicly bullish is the most reliable insider signal of distress.',
8,33,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='financial-distress-indicators');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT corp_id,
'The complete IPO process — from DRHP to listing day',
'ipo-process-complete',
'# The complete IPO process

## Why understanding the IPO process matters

As an investor, understanding the full IPO process helps you evaluate IPOs more critically, identify red flags in the prospectus, and make better subscription decisions.

As a professional, IPO knowledge is essential for finance careers.

## Phase 1: Decision and preparation (3-6 months before filing)

**Board approval**: Company board approves the IPO plan.

**Investment bank mandate**: Company appoints Book Running Lead Managers (BRLMs) — typically 2-4 investment banks. They conduct due diligence, value the company, prepare documents.

**IPO team formation**: Company appoints: legal counsel, auditors (may need restatement of financials to meet SEBI standards), Registrar and Transfer Agent (RTA), PR firm.

**Financial restatement**: 3 years of audited financials required. SEBI-compliant restated accounts may differ from previously published accounts.

## Phase 2: DRHP filing and SEBI review (2-4 months)

**DRHP (Draft Red Herring Prospectus)**: The full disclosure document — business description, financials, risk factors, management, use of proceeds. Filed with SEBI.

**SEBI review**: SEBI examines the DRHP for completeness and regulatory compliance. Issues observations (not approval of the business quality — common misconception).

**Roadshow preparation**: Management prepares investor presentation, financial model, Q&A prep.

## Phase 3: Pre-IPO and anchor allocation

**Price band finalisation**: Based on valuation, comparable companies, investor feedback from pre-roadshow meetings.

**Anchor investor allocation (T-1 day)**: Up to 60% of QIB portion allocated to anchor investors (large institutions). SEBI requires anchors to hold for 30 days post-listing. Strong anchor book indicates institutional confidence.

## Phase 4: IPO subscription (3 days)

**Day 1-3**: Retail, HNI, and QIB applications open.

**Real-time tracking**: NSE/BSE websites show live subscription data — how many times each category is subscribed.

**Book building**: QIB and HNI apply at prices within the band. Final price determined by demand.

## Phase 5: Allotment and listing

**Allotment**: Typically 6 days after issue closes. Retail allotment by lottery (oversubscribed) or pro-rata (under).

**Refund**: Unallotted amounts refunded (ASBA: funds blocked in bank account, released if not allotted).

**Listing (T+6)**: First day of trading. Listing price = market-determined opening price (can be above, at, or below issue price).

## The listing day pattern

Heavily oversubscribed IPOs with GMP: Often open strongly and may fade during the day as allottees sell.
Moderately subscribed quality businesses: May list at a small premium and continue rising for months.
Poor quality IPOs: May list below issue price despite pre-listing hype.',
9,34,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='ipo-process-complete');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT corp_id,
'Conglomerates and holding companies — the discount problem',
'conglomerates-holding-companies',
'# Conglomerates and holding companies

## What is a conglomerate discount?

A conglomerate is a company that owns businesses across multiple unrelated industries. The Tata Group, Aditya Birla Group, and Mahindra Group are India''s largest conglomerates.

**The conglomerate discount**: The market typically values conglomerates at less than the sum of their individual parts. If Tata Motors + Tata Consultancy + Tata Steel + Tata Consumer were each valued independently and summed, the total would exceed the market cap of Tata Sons.

Why? Investors prefer to build their own portfolio of sector specialists. They don''t want management to allocate capital across industries — they can do it themselves. A "tax" for complexity.

## How holding companies trade

A holding company owns listed subsidiaries. Its stock often trades at a discount to the value of its holdings.

**Example**: Assume HoldCo owns 70% of Subsidiary (market cap ₹10,000 crore).
HoldCo''s holding value = 70% × ₹10,000 crore = ₹7,000 crore.
But HoldCo''s own market cap = ₹4,500 crore.
**Holding company discount = 36%**

This discount is normal (10-30% is typical) because:
- HoldCo has its own expenses (staff, offices)
- Dividend from subsidiary may face additional taxation
- Uncertainty about future capital allocation
- Liquidity premium for the subsidiary''s directly listed shares

## When holding company discounts narrow — opportunity

If a holding company''s discount widens beyond historical average (e.g., to 50% when it usually trades at 25%), it may represent an opportunity.

Catalysts that narrow discounts:
- Subsidiary IPO (crystallises value)
- Restructuring announcement (simplification)
- Dividend increase from HoldCo
- Activist investor pressure
- Buyback at HoldCo level

## Evaluating Tata, Birla, Mahindra investments

When investing in a conglomerate group company:
1. Identify which individual businesses you are getting exposure to
2. Is management capital allocation rational? (Best businesses getting investment, weak ones being divested)
3. Is the group simplifying (value-creative) or complexifying (value-destructive)?
4. What is the track record of the holding entity''s management vs the operating companies?

**Tata Sons-TCS relationship**: Tata Sons owns ~72% of TCS. TCS dividends fund Tata Sons'' philanthropic activities (Tata Trusts own ~66% of Tata Sons). Understanding this structure explains Tata Sons'' capital allocation logic.',
8,35,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='conglomerates-holding-companies');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT corp_id,
'Competitive moat analysis — identifying businesses that can compound for decades',
'competitive-moat-analysis',
'# Competitive moat analysis

## The compounding machine — what makes it work

The greatest wealth in equity investing comes from owning businesses that compound earnings at high rates for very long periods.

The constraint on compounding duration is competition. Without a protective moat, high-return businesses attract competitors who erode margins until returns normalise.

A strong moat allows a business to maintain high returns for 10, 20, or 30+ years — creating extraordinary compounding.

## The five sources of moat (with Indian examples)

### 1. Network effects
Product becomes more valuable as more people use it. Each new user adds value for all existing users.

**Pure network effects (strongest)**: More users → better product → more users → virtuous cycle.

India examples:
- NPCI/UPI: More merchants accept UPI because more customers use it. More customers use it because more merchants accept it.
- Zomato/Swiggy: More restaurants → more customers → more restaurants
- NSE: More traders means more liquidity, tighter spreads, attracting more traders

**Why it''s the strongest moat**: Exponentially harder to displace. Challenger needs to simultaneously match quality AND overcome the network advantage.

### 2. Switching costs
Customers face high cost, effort, or risk when switching to a competitor — keeping them loyal even if alternatives exist.

India examples:
- Banking/HDFC Bank: Changing salary account, all linked payments, insurance, loans → enormous friction
- TCS/Infosys: Replacing enterprise software after 10 years of customisation and integration costs crores
- Dr Reddy''s hospital management software: Clinical workflow embedded → hospitals don''t switch

### 3. Cost advantage
Structural cost advantage — lower costs than any competitor.

Sources:
- Scale (fixed costs spread over more units)
- Process innovation (proprietary manufacturing process)
- Location (captive raw material source)
- Labour (Narayana Health''s low-cost cardiac surgery model)

India examples:
- Dmart: Lower cost than peers via owned stores (no rent), cash-and-carry, rapid inventory turns
- Infosys/TCS: India labour arbitrage vs global IT companies

### 4. Intangible assets
Brand, patents, regulatory licences that competitors cannot replicate.

India examples:
- Asian Paints brand (75-year trust in Indian households)
- Sun Pharma ANDA portfolio (US patent filings)
- Airport operators (government licence — no competitor can legally build a competing airport nearby)
- HDFC Life/ICICI Prudential (insurance licence — limited new entrants)

### 5. Efficient scale
When a market is large enough for only one or two players to operate profitably — challenging any entrant.

India examples:
- Container Corporation of India (railway infrastructure, hard to replicate)
- Gas distribution companies (city gas distribution — regulator grants exclusive rights for 8 years)
- Stock exchanges (BSE and NSE dominate — third exchange cannot gain critical mass)

## Testing moat strength

For each business you evaluate, ask:
1. Has the ROCE stayed above cost of capital for 10+ years?
2. Have competitors tried to enter and failed? Why?
3. Is market share stable or growing despite competition?
4. Can the company raise prices without losing significant volume?

A yes to all four = strong moat. Invest for the long term.',
9,36,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='competitive-moat-analysis');

-- ═══════════════════════════════════════════════════════════
-- BEHAVIORAL FINANCE — +5 lessons (24 → 29)
-- ═══════════════════════════════════════════════════════════

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT beh_id,
'Money scripts — the childhood beliefs destroying your adult finances',
'money-scripts',
'# Money scripts

## What are money scripts?

Money scripts are the core beliefs about money formed in childhood — often before age 10 — that continue to drive adult financial behaviour unconsciously.

These scripts are rarely examined. They are simply absorbed from watching parents, hearing comments about money, and experiencing family financial events.

The problem: A belief useful for a 7-year-old in a specific family context may be actively harmful for a 35-year-old building wealth.

## The four money script categories

Developed by financial therapists Brad and Ted Klontz:

### 1. Money Avoidance
Core belief: "Money is bad" / "Rich people are greedy" / "I don''t deserve money"

Origins: Often from families where money was a source of conflict, where religion emphasised non-attachment to wealth, or where discussions about money were considered shameful.

Behaviours: Undearning (staying below earning potential), giving money away to feel worthy, financial self-sabotage (spending windfalls impulsively), neglecting financial management.

### 2. Money Worship
Core belief: "More money would solve all my problems" / "Money equals happiness" / "There will never be enough"

Origins: Often from families experiencing financial scarcity, or from observing wealthy people and assuming their happiness came from money.

Behaviours: Overworking at the cost of relationships and health, compulsive spending (retail therapy), hoarding, constant dissatisfaction regardless of current income.

### 3. Money Status
Core belief: "Net worth = self-worth" / "You are what you own" / "It is important to appear wealthy"

Origins: Families where financial success was heavily praised, social environments where status signalling was common.

Behaviours: Overspending on visible status symbols (car, clothes, phone beyond financial capacity), financial dishonesty with partners, excessive borrowing to maintain appearances.

### 4. Money Vigilance
Core belief: "Always save, never spend" / "You cannot trust others with your money" / "Financial security requires constant attention"

Origins: Often from families who lived through economic hardship, partition-era trauma, or business failures.

Behaviours: Excessive frugality that prevents enjoying life, secrecy about finances, excessive anxiety about normal financial risk, difficulty enjoying money.

## Identifying your money scripts

Reflection questions:
- What did your parents say about rich people? About debt? About spending vs saving?
- What was the emotional tone when money was discussed at home?
- What is your earliest money memory? What did you conclude from it?
- What beliefs about money do you hold that you have never questioned?

## Rewriting unhelpful scripts

Awareness → Challenge → Replace

**Money avoidance example**:
Old script: "Rich people are greedy."
Challenge: "Is this universally true? Can I think of wealthy people who are generous and ethical?"
New script: "Money is a tool. Its impact depends on what I do with it."

This rewriting process works, but takes time and often benefits from working with a financial therapist or coach.',
7,25,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='money-scripts');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT beh_id,
'Couples and money conflicts — the psychology of financial disagreements',
'couples-money-conflicts',
'# Couples and money conflicts

## Why money conflicts are really values conflicts

When couples fight about money, they are almost never actually fighting about money. They are fighting about:

- **Security vs freedom**: One partner wants a large emergency fund (security). The other wants to travel and experience life (freedom).
- **Present vs future**: One spends on current enjoyment. The other defers all pleasure for future security.
- **Control vs trust**: One partner wants joint visibility. The other feels surveilled.
- **Identity and worth**: For many people, their spending choices reflect who they are. Criticism of spending = criticism of identity.

Understanding this transforms how you approach money conversations.

## The most common money conflicts and their roots

**"You spend too much"**: Usually a mismatch in spending values (not amount). The frugal partner sees the spending as frivolous. The spending partner sees the frugal partner as joyless. Neither is objectively right.

**"You never want to spend"**: The spender feels punished and controlled. The saver feels their security is being threatened. Both reactions are legitimate.

**"You keep financial secrets"**: Often started as self-protection ("they''ll criticise my spending") but escalates to full financial infidelity. Trust becomes the real issue.

**"Your family takes too much"**: Financial obligations to parents or family of origin create conflict when one partner feels their nuclear family''s financial security is compromised for extended family.

## The structured money conversation

To have productive financial conversations:

**1. Choose the right time**: Not when stressed, not late at night, not immediately after a triggering purchase.

**2. Start with curiosity, not accusation**:
Instead of: "You spent ₹20,000 on clothes again."
Try: "Help me understand how you think about clothing spending. I want to understand your perspective."

**3. Share feelings, not judgments**:
Instead of: "That was irresponsible."
Try: "When our savings drop, I feel anxious about our future security."

**4. Separate financial facts from emotional interpretations**:
Fact: "We spent ₹1.2 lakh this month on lifestyle vs ₹80,000 budgeted."
Interpretation: "You don''t care about our future."
Stay in facts during the money meeting. Address interpretations separately.

**5. Agree on non-negotiables and flex zones**:
Non-negotiable: "We both agree that retirement savings and insurance are fixed."
Flex zone: "Within these bounds, we each have discretionary spending without explanation."

## The individual discretionary allowance

One of the most effective tools for couples: Each partner gets a fixed monthly amount (equal or proportional to income) that is entirely theirs with no questions asked.

₹5,000-₹15,000 depending on income. Spend it on anything. No explanation required.

This simple structure eliminates 70%+ of day-to-day money conflicts.',
7,26,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='couples-money-conflicts');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT beh_id,
'Overcoming financial trauma — rebuilding after loss bankruptcy or family financial disaster',
'overcoming-financial-trauma',
'# Overcoming financial trauma

## What is financial trauma?

Financial trauma is the lasting psychological impact of severe financial events: bankruptcy, major fraud victimisation, extreme poverty, business failure, or witnessing family financial collapse.

Unlike ordinary financial stress (which resolves when circumstances improve), financial trauma can persist long after financial circumstances improve — driving self-sabotaging behaviour, hypervigilance, avoidance, or shame that prevents financial recovery.

## Common sources of financial trauma in India

**Business failure**: India''s entrepreneurial culture means many families experience devastating business failures — often with personal guarantees on business loans making the failure personally catastrophic.

**Partition and displacement**: Multi-generational trauma from partition (1947) left many families with deep scarcity beliefs that persist generations later.

**Agricultural debt and farmer distress**: Rural families witnessing or experiencing the devastating cycle of crop failure, debt, and sometimes suicide.

**Job loss**: Sudden job loss, especially as a primary earner with family dependents, creates financial PTSD symptoms.

**Financial fraud victimisation**: Chit fund fraud, Ponzi scheme losses, real estate developer fraud — losing life savings to fraud leaves deep trust wounds.

## Recognising financial trauma symptoms

- Extreme anxiety when checking bank balances
- Avoidance of all financial matters (not opening bills, not tracking spending)
- Hypervigilance about money (checking multiple times daily, hoarding beyond reason)
- Flashbacks or intrusive thoughts when facing financial decisions
- Inability to make financial decisions despite cognitive understanding
- Physical symptoms (nausea, panic, dissociation) when discussing money
- Shame that prevents seeking help

## The recovery path

**Step 1: Name it**
Recognise that your relationship with money has been shaped by specific traumatic events — not by your inherent character or intelligence.

**Step 2: Separate past from present**
The financial reality that caused the trauma is (usually) no longer your current reality. Explicitly mapping current financial safety vs past threat is valuable.

**Step 3: Gradual exposure**
Financial avoidance maintains anxiety. Gradual, manageable engagement with finances (start with just checking one account balance once a week) reduces avoidance.

**Step 4: Rebuild from small wins**
Saving ₹500/month for 3 months creates evidence of competence. Small, consistent financial wins rebuild financial self-efficacy.

**Step 5: Professional support**
Financial therapists (emerging field in India) or psychologists familiar with money issues can accelerate recovery that self-help cannot achieve.',
7,27,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='overcoming-financial-trauma');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT beh_id,
'Building a wealth identity — the psychology of becoming financially successful',
'wealth-identity',
'# Building a wealth identity

## Identity drives behaviour, not the other way around

Most financial advice focuses on behaviour change: "spend less, save more, invest regularly." This works for a few weeks, then old patterns return.

Why? Because behaviour that conflicts with your identity is unsustainable. You can force yourself to eat salad when your identity is "someone who loves junk food" — but it requires constant willpower. Identity change removes the need for willpower.

The most durable financial transformation happens when you change how you see yourself.

## The identity-behaviour-outcome loop

Current identity: "I am bad with money." → Behaviour: Avoidant, impulsive spending → Outcome: Financial difficulty → Confirms identity: "See, I am bad with money."

New identity: "I am someone who is learning to build financial security." → Behaviour: Tracking spending, small savings → Outcome: Gradual improvement → Confirms new identity: "I am the kind of person who manages money responsibly."

The loop is self-reinforcing in either direction. Your job is to start the positive loop.

## How to shift financial identity

**1. Vote for your new identity with small actions**
Every time you track your spending, you cast a vote for "I am financially aware." Every SIP that runs is a vote for "I am an investor." Identity is built from accumulated evidence.

Small actions matter more for identity than large ones. Saving ₹500/month consistently for 2 years is more identity-changing than saving ₹50,000 once.

**2. Language shift**
"I cannot afford this" → "I am choosing to prioritise other financial goals right now."
"I am bad with money" → "I am developing my financial skills."
"I will never be wealthy" → "I am taking steps toward financial security."

Language shapes thinking. Thinking shapes identity.

**3. Environment design**
Surround yourself with evidence of your financial identity:
- Books about personal finance visible in your home
- Follow financially thoughtful people (not just wealthy ones)
- Automate savings so they happen without decision
- Join communities (online forums, investment clubs) where your new identity is the norm

**4. Find role models, not idols**
Identify 2-3 people (real or written) whose financial journey started from similar circumstances to yours. Their success becomes evidence that your success is possible.

Aspiring to Mukesh Ambani is not useful. Aspiring to a first-generation wealth builder who grew up in a middle-class family and built ₹3 crore by 45 is actionable.

## The patience paradox

Financial identity takes time to solidify. You will feel like an imposter before you feel like an investor. This is normal.

The feeling of financial competence follows the behaviour of financial competence by approximately 6-18 months. Keep acting, even before you feel it.',
7,28,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='wealth-identity');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT beh_id,
'Designing your financial environment — making good decisions automatic',
'financial-environment-design',
'# Financial environment design

## The environment is more powerful than willpower

Willpower is limited, variable, and depleted by daily decisions. Environment is permanent and effortless.

If healthy food is on the kitchen counter and junk is in a hard-to-reach cabinet, you eat healthier — not because of willpower but because the environment makes the healthy choice easier.

The same principle applies to money. Design your financial environment so that good financial behaviours happen automatically and bad ones require active effort.

## The four pillars of financial environment design

### 1. Automate good behaviour

**SIP automation**: Set up SIPs to debit on salary date. The money is invested before you can spend it. This is the single most effective personal finance intervention.

**Autopay for insurance and recurring expenses**: Premiums that lapse due to forgetting are expensive mistakes. Autopay eliminates this.

**Automatic credit card full payment**: Set autopay for full statement balance. Eliminates interest charges and builds credit score.

**Round-up savings**: Some apps (Fi, Jupiter) round up every transaction and save the difference. Invisible, painless savings accumulation.

### 2. Create friction for bad behaviour

**Remove credit card from saved payments**: Having to enter the card number manually for impulse online purchases creates a pause that prevents some.

**Keep investment apps on a less-accessed screen**: Make it slightly harder to impulsively redeem investments.

**Separate savings accounts**: Money in a separate account (especially at a different bank) is harder to spend impulsively than money in your main current account.

**Unsubscribe from brand emails**: Marketing emails are optimised to trigger spending. Fewer emails = fewer spending triggers.

### 3. Design for visibility and tracking

**Dashboard**: Use Moneycontrol, ET Money, or a simple spreadsheet to see all accounts, investments, and loans in one view. Visibility reduces the ostrich effect (avoiding looking at finances).

**Monthly net worth calculation**: Takes 20 minutes. Tracking net worth monthly creates accountability to your progress and makes the wealth-building journey visible.

**Spending visibility**: Knowing that you will see your spending categorised reduces impulsive purchases. The Hawthorne effect — being observed (even by yourself) changes behaviour.

### 4. Build accountability structures

**Commitment devices**: Tell a friend your savings goal. Human desire to maintain consistency and avoid embarrassment is a powerful force.

**Investment clubs**: Small groups who discuss investments together. Social accountability improves consistency.

**Public financial goals**: Sharing a savings milestone on social media or with family creates external accountability.

**Financial review calendar**: Block 30 minutes monthly for financial review. Treat it as a non-negotiable appointment.',
7,29,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='financial-environment-design');

-- ═══════════════════════════════════════════════════════════
-- FOREX — +6 lessons (24 → 30)
-- ═══════════════════════════════════════════════════════════

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT forex_id,
'Interbank forex market — how currency prices are actually made',
'interbank-forex-market',
'# The interbank forex market

## The market behind the market

When you exchange currency at a bank or trade USD/INR on NSE, the price you get traces back to the interbank forex market — a decentralised global network of the world''s largest banks trading currencies with each other.

Understanding this structure explains why currency prices behave the way they do.

## How the interbank market works

**Participants**: Central banks, commercial banks (Citi, HSBC, Goldman Sachs, SBI, HDFC), hedge funds, corporations hedging currency exposure.

**No central exchange**: Unlike NSE or NYSE, the interbank forex market has no physical location. It is a network of bilateral relationships between banks. Banks quote prices to each other electronically.

**Trading volume**: $7.5 trillion per day (2022 BIS survey). The largest financial market in the world by far. By comparison, NYSE daily volume is ~$25 billion.

**24-hour market**: Opens Monday morning in Sydney (5:30 AM IST), moves to Tokyo, London, New York, back to Sydney. Only closed weekends.

## Liquidity windows and Indian implications

**Asian session (5:30 AM - 11:30 AM IST)**: JPY, AUD, NZD active. Moderate USD/INR activity as Indian market opens.

**London session (1:30 PM - 6:00 PM IST)**: Highest global liquidity. EUR, GBP pairs most active. USD/INR often shows significant moves during London-New York overlap.

**New York session (6:30 PM - 11:30 PM IST)**: USD pairs most active. US economic data releases move all currency pairs.

**For NSE currency traders**: USD/INR futures trade 9 AM - 5 PM IST. Some price gaps may appear at open due to overnight interbank trading.

## Market makers and price discovery

Banks act as market makers — they continuously quote bid (price they buy) and ask (price they sell) prices.

Bid-ask spread: The difference is the market maker''s profit. For USD/INR spot at major banks: 5-10 paise spread. For retail customers: 50-100 paise spread (why exchanging cash at airports is expensive).

**Price discovery**: When economic news hits (US employment data, RBI decision), market makers immediately adjust quotes. Price moves happen in milliseconds across the global interbank network before reaching retail.

## The RBI''s role in interbank USD/INR

RBI participates in the interbank market to smooth excessive volatility. When RBI sells USD (to support INR), it transacts with Indian banks who are interbank participants. Effect is felt quickly across all USD/INR markets.',
7,25,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='interbank-forex-market');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT forex_id,
'FX options basics — protection and speculation in currency markets',
'fx-options-basics',
'# FX options basics

## What are FX options?

FX options give the buyer the right (not obligation) to exchange one currency for another at a pre-agreed rate (strike price) on or before a specified date.

They function identically to equity options but on currency pairs instead of stocks.

## Who uses FX options and why

**Importers (protective put equivalent)**:
An Indian IT company must pay $1 million for servers in 3 months. Current USD/INR: 83. They fear INR will weaken (dollar becomes more expensive).

They buy a USD call option (right to buy USD at ₹84). If INR weakens to ₹87, they exercise — effective rate ₹84. If INR strengthens to ₹80, they let option expire and buy dollars at ₹80 spot.

Cost: Option premium (say 0.5% of notional = ₹4.15 lakh). This is their insurance cost.

**Exporters (protective call equivalent)**:
An IT exporter will receive $1 million in 3 months. Fears INR strengthening (fewer rupees per dollar).

They buy a USD put option (right to sell USD at ₹82). If INR strengthens to ₹79, they exercise at ₹82. If INR weakens to ₹86, they sell at spot ₹86.

**Speculators**:
View on INR: Will weaken to ₹87 in 3 months. Buy USD call options. Leverage + defined risk (only lose premium).

## FX options in India

**Exchange-traded**: USD/INR, EUR/INR, GBP/INR, JPY/INR options on NSE/BSE. Retail accessible. Monthly expiry (last Thursday).

**OTC (over-the-counter)**: Banks offer custom FX options for corporates with large exposures. More flexible (any strike, any tenor) but minimum size typically $500K+.

## Key concepts for FX options

**Delta hedging**: Option sellers (usually banks) hedge their delta exposure by buying/selling spot currency. This is why large option strikes cause visible price levels — hedging activity clusters around them.

**Implied volatility in FX**: India VIX equivalent for USD/INR is 1M implied volatility (typically 4-6%). Spikes before budget, elections, RBI decisions. Option premiums inflate accordingly.

**At-the-money forward (ATMF)**: Strike is set at the forward rate (spot + interest rate differential), not spot. Forward rate for USD/INR always slightly above spot (Indian rates > US rates).

## Risk management with FX options for retail

Unless you have specific currency exposure (international investments, foreign income, planned foreign education), FX options are speculative instruments. High leverage, complex pricing, requires active monitoring.',
7,26,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='fx-options-basics');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT forex_id,
'Algorithmic forex trading — how systematic strategies work',
'algorithmic-forex-trading',
'# Algorithmic forex trading

## What is algo trading in forex?

Algorithmic trading uses computer programs to execute trades based on pre-defined rules, without manual intervention. In forex, algorithms can react to price movements, economic data, and technical signals in milliseconds.

Retail algorithmic forex trading has become accessible in India through platforms and APIs, though it remains more complex than manual trading.

## Types of forex algorithms

### Trend following
Identifies and follows directional price moves using indicators (MA crossovers, breakouts).

Logic: "When 20-period MA crosses above 50-period MA on hourly chart, buy USD/INR. Exit when MA crosses back."

Simple, robust over long periods, large drawdowns in sideways markets.

### Mean reversion
Identifies when price has moved too far from its average and trades the return.

Logic: "When USD/INR''s 2-hour RSI falls below 30 and price is at lower Bollinger Band, buy. Exit at middle band."

Works in ranging markets. Dangerous in strong trends.

### Statistical arbitrage
Identifies statistical relationships between correlated pairs.

Example: USD/INR and EUR/INR are correlated (both include USD and are impacted by global risk sentiment). When the correlation breaks (EUR/INR rises but USD/INR doesn''t), trade the expected convergence.

Requires sophisticated statistical modelling.

### News trading algorithms
React to economic data releases before human traders can process them.

"NFP beats expectations → USD strengthens → Buy USD/INR within 50ms of release."

Requires proximity to data feeds (co-location) and ultra-fast execution. Not practical for retail.

## Building a basic forex algorithm (conceptual)

**Step 1: Define rules precisely**
"Buy when 20 EMA crosses above 50 EMA on 1-hour chart. Sell when it crosses back. Stop loss at 2× ATR(14) from entry."

**Step 2: Backtest on historical data**
Apply the rules to 3-5 years of historical 1-hour USD/INR data. Measure: win rate, average R, max drawdown, Sharpe ratio.

**Step 3: Walk-forward test**
Optimise on first 3 years. Test (without re-optimising) on the subsequent 2 years. If performance collapses in out-of-sample period: overfitted strategy.

**Step 4: Paper trade**
Run the algorithm in paper trading for 3-6 months. Verify execution matches backtest assumptions.

**Step 5: Live trading with small size**
Start with minimum lot sizes. Scale up only after consistent live results.

## Platforms for algorithmic forex trading in India

**Zerodha Streak**: No-code algo builder for NSE currency derivatives. Visual rule builder, backtesting included.

**Zerodha Kite API / Upstox API**: Python/JavaScript API for custom algorithmic strategies.

**MetaTrader 4/5**: Popular globally for forex algo, but note Indian residents can only legally trade currency derivatives on NSE/BSE (not offshore brokers offering MT4/5 with INR pairs via illegal platforms).',
8,27,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='algorithmic-forex-trading');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT forex_id,
'Emerging market currencies — why EM currencies behave differently',
'emerging-market-currencies',
'# Emerging market currencies

## What makes an emerging market currency?

Emerging market (EM) currencies belong to developing economies with growing but less mature financial markets. They include INR, BRL (Brazil), ZAR (South Africa), MXN (Mexico), TRY (Turkey), IDR (Indonesia), PHP (Philippines).

EM currencies share distinct characteristics that set them apart from G10 currencies (USD, EUR, JPY, GBP, CHF, CAD, AUD, NZD, NOK, SEK).

## Why EM currencies are more volatile

**External vulnerability**:
EM economies often run current account deficits (importing more than exporting) and rely on foreign capital inflows to fund them. When global risk sentiment turns negative, foreign capital exits → EM currencies weaken.

**Dollar dependency**:
Much of EM international trade and debt is denominated in USD. When USD strengthens, EM debt burden increases → stress on EM economies → further currency weakness.

**Thinner liquidity**:
USD/INR average daily volume ≈ $25 billion. EUR/USD ≈ $1.2 trillion. Thinner markets amplify moves.

**Political and institutional risk**:
Less stable institutions, more potential for sudden policy changes → higher risk premium embedded in EM currencies.

## The "risk-on / risk-off" dynamic

**Risk-on** (global investors willing to take risk):
Capital flows to EM for higher returns. EM currencies strengthen. USD weakens.

**Risk-off** (global stress — recession fears, geopolitical crisis):
Capital flies to safety (USD, JPY, CHF). EM currencies weaken regardless of domestic fundamentals.

This explains why USD/INR often rises (INR weakens) during global events like: US recession fears, Fed rate hike cycles, European banking crises, Ukraine war escalation.

## INR compared to EM peers

**Relative stability**: INR is more stable than many EM currencies. RBI''s active management and India''s improving current account have provided support.

**Brazil (BRL)**: Highly volatile. Sensitive to commodity prices (iron ore, soybeans), political events, Petrobras oil.

**Turkey (TRY)**: Extreme case of EM currency stress. 90%+ depreciation against USD in 10 years due to unorthodox monetary policy.

**South Africa (ZAR)**: Highly correlated with gold prices and China growth (mining exports). Political uncertainty amplifies volatility.

## Trading EM currencies — Indian perspective

**Indian residents**: Can legally trade USD/INR, EUR/INR, GBP/INR, JPY/INR derivatives on NSE/BSE. Cannot legally trade other EM currencies (BRL, ZAR, etc.) through Indian brokers.

**International exposure**: Investors wanting EM currency exposure can access some through international mutual funds that hold EM assets.',
7,28,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='emerging-market-currencies');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT forex_id,
'Geopolitical events and currency markets — how war sanctions and politics move FX',
'geopolitics-and-currencies',
'# Geopolitics and currency markets

## The direct link between politics and exchange rates

Currencies are claims on a country''s economic future. Anything that threatens that future — war, sanctions, political instability, sovereign debt crisis — immediately affects exchange rates.

Unlike equity markets where some companies can thrive even in political turmoil, currency markets directly price country-level risk.

## Major geopolitical FX mechanisms

### 1. Sanctions and reserve currency weaponisation

**Russia-Ukraine war (2022) case study**:
Within days of invasion, Western sanctions froze Russia''s $630 billion in foreign currency reserves held in Western banks and payment systems. Russia was cut off from SWIFT.

Russian Ruble: Fell 50% against USD in days. Then recovered as Russia forced ruble payment for energy exports.

**Global implication**: Central banks around the world began diversifying reserves away from USD dominance. China accelerated de-dollarisation efforts. Gold purchases by central banks surged to 50-year highs.

**India impact**: India bought Russian oil at discounts (rupee-ruble trade). Partially drove the push for non-dollar trade settlement. Impacted RBI reserve strategy.

### 2. War and capital flight

When conflict risk rises in a region, capital exits. Domestic currency weakens.

**Middle East tensions**: Oil price spikes (affect India''s import bill → INR weakens). USD demand rises as safe haven.

**Ukraine war impact on INR**: FII outflows from Indian markets + higher oil prices → INR fell from ₹75 to ₹82 in months.

### 3. Political uncertainty

Elections, government crises, and constitutional uncertainty cause investors to demand higher risk premiums.

**India example**: INR often shows elevated volatility (but not necessarily direction) around general elections. Policy uncertainty = higher forex risk premium.

**Turkey lesson**: Erdogan''s unorthodox monetary policy (keeping rates low despite high inflation, firing central bank governors) destroyed institutional credibility. TRY depreciated 90%+ in 10 years.

### 4. Trade wars and tariffs

Trade wars affect currency through current account (trade balance) and confidence channels.

US-China trade war (2018-2019): Chinese Yuan allowed to weaken past 7.0/USD for first time (partially absorbing tariff impact). Emerging market currencies weakened on global trade uncertainty.

## For Indian investors and traders

**INR sensitivity factors** (monitor these):
- Oil prices (India imports ~85% of oil needs)
- FII equity and debt flows (check daily NSE FII data)
- US Fed policy (drives global dollar strength)
- India-Pakistan relations (direct geopolitical risk premium)
- India''s current account deficit (monthly merchandise trade data)

**Practical rule**: Major global geopolitical events almost always trigger INR weakness initially, regardless of India''s direct involvement. This is the risk-off mechanism at work.',
7,29,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='geopolitics-and-currencies');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT forex_id,
'Forex trading plan — building a complete system from scratch',
'forex-trading-plan',
'# Building a complete forex trading plan

## Why a written trading plan is non-negotiable

Emotional trading decisions made in the heat of the market are almost always wrong. A written plan created when calm and rational is your protection against the impulsive decisions made under adrenaline.

Professional traders treat the plan as law. Deviation from the plan — not just losses — is the real failure.

## The complete forex trading plan template

### Section 1: Market and timeframe
- **Markets traded**: USD/INR (NSE futures) only — mastery over one pair beats mediocrity in ten
- **Primary timeframe**: 1-hour charts for analysis, 15-minute for entry timing
- **Session focus**: Indian market hours (9 AM - 5 PM IST) only — avoid off-hours low liquidity

### Section 2: Strategy rules

**Setup**: Trend continuation pullback
1. Identify dominant trend on 4-hour chart (higher highs and lows = uptrend)
2. Price pulls back to 20-period EMA on 1-hour chart
3. RSI(14) on 1-hour between 40-60 (not overbought/oversold)
4. Look for bullish price action candle (pin bar, engulfing) at the EMA
5. Enter on next candle open

**No trade conditions**:
- Within 30 minutes of major economic release
- When VIX is above 25 (high volatility = wider stops, worse R:R)
- On Monday open (gap risk)
- Friday after 2 PM (weekend gap risk)

### Section 3: Risk management

**Position sizing**:
- Maximum risk per trade: 1% of trading capital
- Calculation: (Account size × 1%) / (stop loss in paise) = lot size

**Stop loss placement**:
- Below the swing low of the pullback for longs
- Minimum 15 paise stop (smaller = too noise-sensitive)
- No moving stops to accommodate hope

**Target**:
- Primary target: 2:1 reward/risk
- Partial exit (50%): At 1:1, move stop to break-even
- Final exit: At 2:1 target or at end of session

### Section 4: Maximum loss rules

- **Daily loss limit**: If down 3% in one day, stop trading for the day
- **Weekly loss limit**: If down 6% in one week, stop for the rest of the week
- **Monthly drawdown limit**: If down 12% in one month, take a week off and review the system

### Section 5: Review process

**Daily**: Record every trade (entry, exit, reason, emotion, followed plan Y/N)
**Weekly**: Review journal, calculate metrics (win rate, average R, maximum drawdown)
**Monthly**: Review system performance, assess whether rules need adjustment (minimum 50 trades before changing any rule)

### Section 6: Mental state protocol

**Pre-market checklist**:
- Am I well-rested? (No trading on less than 6 hours sleep)
- Am I emotionally settled? (Major personal events = reduce size by 50% or sit out)
- Have I reviewed yesterday''s trades?

**During trading**:
- No social media or news while positions are open
- One trade at a time (no simultaneous positions until profitable for 3 months)
- If experiencing 2 consecutive losses: take 30-minute break before next trade',
8,30,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='forex-trading-plan');

-- ═══════════════════════════════════════════════════════════
-- TECHNICAL ANALYSIS — +9 lessons (26 → 35)
-- ═══════════════════════════════════════════════════════════

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT ta_id,
'VWAP — the institutional trader''s benchmark',
'vwap-mastery',
'# VWAP — Volume Weighted Average Price

## What is VWAP?

VWAP (Volume Weighted Average Price) is the average price of a security weighted by volume traded at each price level throughout the day.

VWAP = Cumulative (Price × Volume) / Cumulative Volume

It resets at the start of each trading day and is calculated continuously through the session.

## Why VWAP matters — the institutional angle

Large institutional orders (mutual funds, FIIs) are typically benchmarked against VWAP. A fund manager who buys ₹100 crore of Reliance below VWAP has "outperformed" relative to the benchmark. Above VWAP = underperformed.

This creates predictable behaviour:
- Institutions buy when price dips below VWAP (buying at a discount to their benchmark)
- Institutions sell when price rises above VWAP (selling at a premium)
- This creates a magnetic effect — price gravitates toward VWAP

## Reading VWAP on charts

**Price above VWAP**: Buyers are in control. Bullish intraday bias. Dips toward VWAP may be support.

**Price below VWAP**: Sellers are in control. Bearish intraday bias. Rallies toward VWAP may be resistance.

**VWAP as intraday S/R**: Price tests VWAP from above → potential bounce (buy). Price tests from below → potential rejection (short).

**VWAP slope**: Rising VWAP (price consistently above) = strong uptrend. Flat VWAP = consolidation. Falling VWAP = downtrend.

## VWAP bands (standard deviation bands)

Most charting platforms add 1, 2, and 3 standard deviation bands around VWAP (similar to Bollinger Bands but volume-weighted).

Price at +2σ band: Significantly overbought relative to today''s volume-weighted activity. High probability of mean reversion.
Price at -2σ band: Significantly oversold. High probability of bounce.

Strong trending days: Price can ride the +1σ or -1σ band for hours.

## Anchored VWAP

Anchored VWAP calculates the VWAP from a specific starting point (earnings date, breakout day, major swing point) rather than from the day''s open.

**Use case**: If a stock gapped up strongly on earnings, anchored VWAP from that gap day shows the average price everyone who bought the move paid. This becomes significant support/resistance.

## Practical VWAP strategy

**Entry**: Price dips to VWAP during an uptrend (price was above VWAP for most of the morning). Look for bullish candle at VWAP + volume drying up on the dip.

**Stop**: Below the dip low (usually 0.2-0.5% below VWAP).

**Target**: Prior highs or VWAP + 1σ band.

**Do not use VWAP**: On low-volume stocks (VWAP is unreliable when volume is thin), on expiry days (distorted by option-related trading), and on gap-open days (VWAP starts far from prior close, loses normal meaning).',
8,27,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='vwap-mastery');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT ta_id,
'Smart money concepts — order blocks and market structure',
'smart-money-concepts',
'# Smart money concepts

## What are smart money concepts?

Smart money concepts (SMC) is a trading approach that attempts to analyse the market from the perspective of large institutional participants ("smart money") — banks, hedge funds, and central banks — rather than retail traders.

The core premise: Institutional participants leave footprints in the price action that can be identified and traded with.

## Key SMC concepts

### Market structure
SMC uses a specific definition of trend:

**Bullish market structure**: Price makes a Break of Structure (BOS) to the upside — takes out a previous swing high. Confirmed uptrend.

**Bearish market structure**: Price makes a BOS to the downside — takes out a previous swing low. Confirmed downtrend.

**Change of Character (ChoCH)**: In a downtrend, price takes out the most recent swing high for the first time — potential reversal signal. Vice versa in uptrend.

### Order blocks
An order block is the last bullish candle before a bearish move, or the last bearish candle before a bullish move. The theory: institutional orders were placed in this zone. Price often returns to these zones to fill remaining orders.

**Bullish order block**: The last bearish candle before a significant bullish move. When price returns to this zone, watch for bullish reversal.

**Bearish order block**: The last bullish candle before a significant bearish decline. When price returns, watch for bearish reversal.

The strength of an order block is proportional to the move that came after it — a strong explosive move from an order block indicates significant institutional order flow.

### Fair value gaps (FVG)
A three-candle pattern where the wicks of the first and third candles do not overlap — creating a gap that price often returns to fill.

Bullish FVG: Gap between first candle''s high and third candle''s low (in an uptrend). Price often returns to this zone before continuing up.

### Liquidity
SMC emphasises that institutions need liquidity to fill large orders. Retail stop losses and breakout orders cluster above swing highs (buy stops) and below swing lows (sell stops).

Institutions deliberately push price to these liquidity pools to trigger stops, providing them counterparty liquidity for their large orders. This appears as:
- Stop hunts above previous highs before reversing lower
- Sweeps below previous lows before reversing higher

## Critical perspective

SMC has become extremely popular in 2022-2024, particularly in social media trading communities. Legitimate observations (institutions do place large orders, price does often return to key zones) are mixed with unfalsifiable interpretations.

**What SMC does well**: Focuses on price action structure, institutional perspectives, and liquidity dynamics.

**Limitations**: Highly subjective (identifying "the" order block from many candles is ambiguous), often retrofitted to explain moves after the fact, not rigorously backtested.

Use SMC concepts as a framework for thinking about price, but always combine with measurable rules and backtesting.',
8,28,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='smart-money-concepts');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT ta_id,
'Options flow and unusual activity — reading the market''s smart money',
'options-flow-unusual-activity',
'# Options flow and unusual activity

## What is options flow?

Options flow refers to tracking large, unusual options transactions — specifically large institutional orders that may signal informed market participants'' expectations.

When a large institution buys a large number of options contracts — especially out-of-the-money ones with near-term expiry — it may indicate they have a strong directional view (and sometimes material non-public information, which they cannot act on in stocks but can through options — a grey area legally).

## Types of notable options activity

### Unusual volume
When options volume in a specific contract is significantly above its average (e.g., 10x normal volume), it signals unusual interest.

Example: Stock ABC normally trades 500 call contracts daily. Today 8,000 calls at the 1,200 strike (stock at 1,050) trade with 2-week expiry. Unusual. Someone is betting on a 15%+ move in 2 weeks.

### Large block trades
Single transactions of 500+ contracts (representing ₹50+ lakh in premium) executed at once. These are institutional-size trades that retail does not place.

### Sweeping
Aggressive buying across multiple strikes and expiries — buyer is not price-sensitive, wants maximum size immediately. Suggests urgency and conviction.

### Put/Call ratio (PCR)
Total put volume / Total call volume.

PCR > 1: More puts than calls. Bearish sentiment.
PCR < 0.7: More calls than puts. Bullish sentiment (or complacency).
Extreme PCR readings (>1.5 or <0.5) are contrarian signals — when everyone is positioned one way, the move often goes the other way.

**India VIX and PCR**: NIFTY PCR is available on NSE website daily. Widely followed by Indian traders.

## Limitations — the insider trading risk

Unusual options activity before earnings announcements, M&A, or regulatory decisions has sometimes preceded material news. This is why the SEC (US) and SEBI monitor options activity.

But: Most unusual options activity has innocent explanations (hedging, portfolio protection, systematic strategies). Do not assume every unusual print signals insider knowledge.

## Practical application for Indian traders

**NIFTY options OI (Open Interest)**: Track on NSE website. Where is the maximum OI? This is often where price gravitates near expiry (the "max pain" theory).

**Bank NIFTY OI analysis**: Check put and call OI at various strikes. Heavy call OI at 45,000 = potential resistance (call sellers defend). Heavy put OI at 44,000 = potential support.

**Sector ETF options**: Limited liquidity in India currently, but growing.

**Tools**: Sensibull.com provides excellent options analytics for Indian markets including OI charts, PCR, and unusual activity screens.',
8,29,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='options-flow-unusual-activity');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT ta_id,
'Market profile — understanding value areas and price acceptance',
'market-profile-basics',
'# Market profile

## What is market profile?

Market profile is a method of analysing markets by organising price and time data to show where the market spent the most time trading — revealing where participants found "fair value."

Developed by J. Peter Steidlmayer at the CBOT (Chicago Board of Trade) in the 1980s.

## The key concepts

### TPO (Time Price Opportunity)
Market profile plots price on the vertical axis and time on the horizontal. Each letter represents 30 minutes of trading. Where the letters stack up = where the market spent the most time.

### Value Area
The range of prices where approximately 70% of the day''s trading volume occurred.

**Value Area High (VAH)**: Upper boundary of value area.
**Value Area Low (VAL)**: Lower boundary of value area.
**Point of Control (POC)**: The single price level with the highest volume for the day.

### Understanding acceptance and rejection

**Price acceptance**: When price spends considerable time at a level, market participants are comfortable (trading = acceptance).

**Price rejection**: When price quickly moves away from a level (long wick, small TPO count), it was "rejected" — not fair value.

## How to trade with market profile

**Buying below Value Area Low**: If today''s price is below yesterday''s VAL, and the market was bullish yesterday, expect mean reversion — price should be "pulled back" into the value area. Trade: Enter long below VAL, target VAL and POC.

**Selling above Value Area High**: If price opens above yesterday''s VAH and cannot sustain (fails to build new value above), expect return to value area. Short opportunity.

**POC as magnet**: POC often acts as magnet — price gravitates toward it, especially during trending sessions that later consolidate.

**Trending day vs balancing day**:
Trending: Market builds value at progressively higher (or lower) prices. Wide profile.
Balancing: Market oscillates in a narrow range. Tight, symmetrical profile.

Identifying which type of day is developing (usually clearer by 11-11:30 AM IST) helps choose the right strategy: trend-following for trending days, mean-reversion for balancing days.

## Market profile for NSE/NIFTY trading

Market profile works on any liquid market. For NIFTY:
- Use 30-minute NIFTY charts
- Identify previous day''s VAH, VAL, POC
- These become key levels for the next day

**Tools**: Tradingview (paid plans include volume profile), Amibroker with data feeds, some Indian brokers like Fyers and Dhan provide volume profile overlays.',
8,30,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='market-profile-basics');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT ta_id,
'Seasonality in markets — patterns that repeat year after year',
'market-seasonality',
'# Seasonality in markets

## What is market seasonality?

Seasonality refers to recurring price patterns that tend to occur at the same time each year, driven by consistent underlying factors: corporate reporting cycles, tax calendars, agricultural cycles, weather, consumer behaviour, and institutional portfolio management.

Understanding seasonality does not predict the future — but it tells you which way the wind historically blows, improving the odds of any directional trade.

## Major seasonal patterns in Indian markets

### January effect (small and mid cap)
Historically, small and mid-cap stocks outperform in January as institutional investors rotate into positions after year-end tax-loss selling.

Tax-loss selling pressure in December (especially post-March 2023 when debt fund LTCG rules changed) → relief rally in January.

**Evidence in India**: Less consistent than US markets due to different financial year (April-March), but some pattern exists.

### Budget season (January-February)
Markets show elevated volatility in January-February leading up to the Union Budget (typically February 1).

**Historical pattern**:
- Markets often rally into budget on hope
- Sell on the event after clarity (whether positive or negative)
- Post-budget direction depends on fiscal deficit and tax changes

### Quarterly expiry patterns (NIFTY futures and options)
Monthly expiry (last Thursday) shows:
- Volatility increase in final week as option sellers manage positions
- "Expiry pinning": Price gravitates toward max pain (highest open interest strike) in the final 2-3 days

Quarterly expiry (March, June, September, December) shows larger moves due to bigger positions being rolled.

### Monsoon and agricultural stocks
**June-September**: Monsoon progress directly affects:
- Agri stocks (seed companies, fertilisers, tractors)
- Rural FMCG consumption
- Two-wheeler sales (rural income proxy)
- Power demand

**Good monsoon signal**: Buy rural consumption theme in pre-monsoon period (April-May).

### FII activity patterns
**January-March**: FII flows often positive as global asset allocation begins fresh year
**May-June**: "Sell in May" effect less pronounced in India than globally but some FII trimming occurs
**October-December**: FII often sell to book year-end gains; creates NIFTY weakness that can be buying opportunity

### Pre-election seasonality
In years before Indian general elections, markets historically perform well in Q3 and Q4 as government spending accelerates (populist fiscal measures pre-election).

Post-election: Depends on result and policy continuity expectations.

## Using seasonality in trading

Never trade seasonality alone. Use it as a tiebreaker:

When trend analysis and fundamentals are bullish AND seasonality is supportive: Higher conviction long.
When seasonality is negative but everything else is positive: Reduce position size but don''t fight the primary trend.

Seasonality is tailwind or headwind, not the engine.',
7,31,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='market-seasonality');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT ta_id,
'Gap analysis — how to trade opening gaps profitably',
'gap-analysis-trading',
'# Gap analysis — trading opening gaps

## What is a price gap?

A gap occurs when a stock or index opens significantly higher or lower than the previous day''s close, with no trading in between.

Types of gaps:
- **Gap up**: Opens above previous day''s high
- **Gap down**: Opens below previous day''s low
- **Inside open**: Opens within previous day''s range (not a true gap)

## Why gaps occur

**Overnight news**: Earnings announcements, management changes, regulatory decisions, global events — all release outside market hours and create gaps at open.

**Global market moves**: US markets move overnight. NIFTY often gaps up or down based on US market performance (S&P 500 correlation ~0.6).

**Futures premium/discount**: NIFTY SGX (Singapore exchange) trades 24 hours and often indicates likely Indian gap.

## The four types of gaps and how they behave

### 1. Common gaps
Small gaps (0.3-1%) on average volume days. No significant news catalyst.

**Behaviour**: Fill quickly. Usually within 1-3 sessions. Fade strategy works: trade toward the gap fill.

### 2. Breakaway gaps
Large gap on high volume, breaking out of a consolidation pattern or key resistance.

**Behaviour**: Do NOT fill quickly. Gap remains open for weeks or months. Trend continuation — trade in direction of gap.

### 3. Runaway (continuation) gaps
Gap occurring in the middle of an existing strong trend, on high volume.

**Behaviour**: Confirms trend strength. Hold positions in trend direction. Filling this gap would suggest trend reversal.

### 4. Exhaustion gaps
Gap in the direction of an existing trend, but on declining volume. Occurs near the end of a move.

**Behaviour**: Often filled within days. Signal trend exhaustion. Potential reversal trade.

## The gap fill trade — rules and risks

**Setup**: Stock gaps down significantly (2%+) with no fundamental reason (earnings fine, sector fine).

**Entry**: Buy if price stabilises in first 15-30 minutes and shows reversal candle.

**Stop**: Below the gap open price (if it cannot hold open, gap fill is not happening today).

**Target**: Previous day''s close (gap fill).

**Risk**: Gap downs on bad news should NOT be faded. Always check: why did it gap? If earnings miss, company-specific bad news → gap may not fill for weeks.

## NIFTY gap statistics (historical)

Gaps under 0.5%: Fill same day ~70% of the time.
Gaps 0.5-1%: Fill same week ~55% of the time.
Gaps over 1.5% on high volume: Less than 40% fill within a week.',
7,32,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='gap-analysis-trading');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT ta_id,
'Risk management masterclass — position sizing Kelly criterion and drawdown management',
'risk-management-masterclass',
'# Risk management masterclass

## The hierarchy of trading success

Most traders spend 90% of their time on entries (when to buy, which indicator to use). The evidence suggests entries are the least important component of long-term trading success.

Order of importance:
1. Position sizing and risk management (most important)
2. Exits (when to take profit, when to cut losses)
3. Entries (least important — you can be consistently profitable with random entries if risk management is excellent)

## The Kelly Criterion

The Kelly Criterion calculates the optimal position size to maximise long-term geometric growth.

**Kelly % = (bp - q) / b**

Where:
- b = odds (net profit / net loss per trade = reward/risk ratio)
- p = probability of winning
- q = probability of losing (1 - p)

**Example**: Strategy with 55% win rate, 2:1 reward/risk.
Kelly % = (2 × 0.55 - 0.45) / 2 = (1.1 - 0.45) / 2 = 0.65 / 2 = **32.5%**

This suggests betting 32.5% of capital per trade. This is the full Kelly — mathematically optimal but practically too aggressive (one bad run wipes out large portions of capital).

**Half Kelly**: Most practitioners use 25-50% of Kelly. In this case: 16%.

For a ₹10 lakh account: Risk 16% = ₹1.6 lakh per trade.

**For beginners**: Ignore Kelly. Use 1-2% risk per trade until you have 200+ trade sample to calculate your actual p and b values.

## The mathematics of drawdown

Understanding drawdown mathematically changes how you manage risk.

If you lose 50% of your capital, you need 100% return to get back to breakeven. This asymmetry is the core reason capital preservation matters more than maximum return.

**Drawdown math**:
- 10% loss requires 11.1% gain to recover
- 20% loss requires 25% gain
- 30% loss requires 42.9% gain
- 50% loss requires 100% gain
- 70% loss requires 233% gain

A strategy with 20% annual returns but 50% maximum drawdown will underperform a strategy with 15% annual returns and 15% maximum drawdown over a 10-year period.

## Maximum drawdown limits — the rules that save accounts

**Daily stop**: Maximum loss per day = 3% of account. Hit it → stop for the day.
**Weekly stop**: Maximum loss per week = 6% of account.
**Monthly stop**: Maximum loss per month = 12% of account.

When monthly stop is hit: Stop trading for one week. Review every trade. Identify the systematic mistake. Only return with smaller position sizes.

## Correlation and portfolio-level risk

If you hold 5 positions all in IT stocks, you have 5x your single position risk. In a sector-wide sell-off, all 5 move against you simultaneously.

True diversification in trading: Not just different stocks, but uncorrelated setups. Long IT + Short banking = lower correlation than Long IT + Long software.

**Maximum correlated exposure**: No more than 3 positions in highly correlated instruments simultaneously.',
8,33,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='risk-management-masterclass');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT ta_id,
'Backtesting your strategy — building statistical confidence before risking money',
'backtesting-strategies',
'# Backtesting — building statistical confidence

## Why backtesting matters

A strategy that looks good on 10 recent trades may be lucky. A strategy that has been tested on 500 historical trades across bull markets, bear markets, and sideways markets has statistical evidence behind it.

Backtesting converts "I think this works" into "I have evidence this has worked under these conditions."

It does not guarantee future performance. But it is vastly better than no evidence.

## The backtesting process

### Step 1: Define rules precisely
Every rule must be objective and unambiguous.

Bad rule: "Buy when the trend looks strong and there is a pullback."
Good rule: "Buy when price is above 200 EMA on daily chart AND RSI(14) has pulled back below 50 AND bounces back above 50 AND the previous candle is bullish."

If a second person reading your rules produces identical signals, they are objective enough.

### Step 2: Choose your data
- Minimum 3 years, ideally 5-10 years
- Include multiple market regimes: bull (2014-2017, 2020-2021), bear (2008, 2020 crash), sideways (2015-2016)
- For Indian markets: NSE data available through Zerodha Kite, Amibroker, TradingView

### Step 3: Test the rules
**Manual backtest**: Go through charts historically, apply rules, record signals. Time-intensive but you learn the strategy deeply.

**Automated backtest**: Code the strategy (Python with backtesting.py, or TradingView Pine Script). Faster, handles large datasets.

### Step 4: Record every trade
For each historical signal, record:
- Date and price of entry
- Date and price of exit (stop or target)
- Profit/loss in R multiples
- Market condition (trending/ranging)

### Step 5: Calculate key metrics

**Win rate**: Winning trades / Total trades. (A 40% win rate can be profitable with 3:1 R:R)

**Average R**: Mean profit/loss per trade in R multiples.

**Expectancy**: Win rate × Average win - Loss rate × Average loss. Must be positive.

**Maximum drawdown**: Largest peak-to-trough loss in the test period. Can you psychologically and financially handle this?

**Profit factor**: Gross profit / Gross loss. Above 1.5 is reasonable. Above 2.0 is excellent.

**Sharpe ratio**: Return / Standard deviation of returns. Above 1.0 is acceptable.

## The biases that destroy backtests

**Look-ahead bias**: Using information in your rules that would not have been available at the time of the signal. Common mistake: using the closing price to determine an intrabar signal.

**Survivorship bias**: Only testing stocks that exist today (all had to survive to be in the current index). Backtesting on current NIFTY 50 ignores companies that were in the index but failed and were removed.

**Overfitting**: Optimising parameters until they fit historical data perfectly. The more parameters, the more likely you are fitting noise rather than signal. Simpler strategies generalise better.

**The forward test rule**: After backtesting, paper trade for 3-6 months. If live results differ significantly from backtest, the strategy is over-fitted or implementation issues exist.',
9,34,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='backtesting-strategies');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT ta_id,
'Complete trading system — putting it all together into a repeatable process',
'complete-trading-system',
'# Building a complete, repeatable trading system

## Why systematic beats discretionary for most traders

Discretionary trading relies on real-time judgment calls in high-emotion environments. Most people make poor decisions under stress.

Systematic trading converts analysis into rules, executes rules mechanically, and reserves judgment for system design (done calmly) rather than trade execution (done under market pressure).

The goal: A system you can execute consistently regardless of how you feel that day.

## The complete trading system framework

### Level 1: Market selection
What markets will you trade? Why?

For most retail Indian traders:
- NIFTY 50 or Bank NIFTY options (high liquidity, many resources available)
- Top 50-100 stocks by volume (enough liquidity to execute without slippage)
- One currency pair: USD/INR

Rule: Master one market completely before adding another. Breadth before depth is a trap.

### Level 2: Strategy and edge

Clearly define your edge — the statistical reason your strategy should make money.

Examples of genuine edges:
- "Stocks in strong trends that pull back to their 20-day MA tend to continue trending (momentum + mean reversion)"
- "IV compression post-earnings provides edge for option sellers who time their entry correctly"
- "NIFTY above VWAP with volume divergence suggests intraday exhaustion at extension (mean reversion)"

No identified edge = gambling.

### Level 3: Entry system
Specific, objective entry rules (as covered in backtesting module).

One strategy, documented fully, not more. Strategies should complement each other if you have multiple (e.g., trend-following + mean-reversion for different market conditions, not two similar trend strategies).

### Level 4: Exit system
**Stop loss rules**: Where exactly? (Below swing low? Percentage from entry? ATR-based?)

**Profit target rules**: Fixed target? Trailing stop? Time-based exit?

**Partial exit rules**: Exit 50% at 1R, trail the rest?

Exits determine profitability more than entries.

### Level 5: Position sizing
Risk per trade: 1% (or whatever you have defined based on your Kelly calculation and psychological comfort).

Never size up after wins (confidence bias) or down after losses (fear). Consistent sizing only.

### Level 6: Trade management

**What to do while in a trade**:
- Check once per session (not more)
- Do not move stop unless it is to protect profits (never move against position)
- Do not exit early because price is stalling (let target be hit or stop be hit)

### Level 7: Review system

**Daily**: Journal entry (filled out within 2 hours of close)
**Weekly**: Calculate win rate, average R, total P&L, largest winner, largest loser
**Monthly**: System performance review. Are edge conditions still valid? Are execution errors recurring?

**Quarterly**: Major system review. Is the edge still working? What has changed in the market?

### Level 8: Continuous improvement

Improvement only comes from the review process. Without disciplined journaling and review, you will repeat mistakes indefinitely.

Set a minimum of 100 trades before making any significant system change. Small samples produce misleading conclusions.

The trading system is not built once — it is refined continuously through evidence from your own trading results.',
9,35,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='complete-trading-system');

  -- Final count check
  SELECT COUNT(*) INTO v_total FROM lessons WHERE is_published = TRUE;
  RAISE NOTICE 'Phase 3 complete! Total published lessons: %', v_total;

END $PHASE3$;
