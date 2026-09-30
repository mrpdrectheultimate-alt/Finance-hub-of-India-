-- ============================================================
-- FinanceHub â€” Personal Finance Intermediate: 15 Lessons
-- Run AFTER technical_analysis.sql
-- ============================================================

DO $$
DECLARE
  pf_int_level_id UUID;
BEGIN

INSERT INTO levels (track_id, title, slug, description, order_index, is_free, xp_reward)
SELECT t.id, 'Personal Finance Intermediate', 'personal-finance-intermediate',
  'Tax optimisation, EPF, NPS, insurance deep-dive, estate planning, and wealth management', 2, TRUE, 100
FROM tracks t
WHERE t.slug = 'personal-finance'
  AND NOT EXISTS (
    SELECT 1 FROM levels lv
    WHERE lv.track_id = t.id AND lv.slug = 'personal-finance-intermediate'
  );

SELECT lv.id INTO pf_int_level_id
FROM levels lv JOIN tracks t ON lv.track_id = t.id
WHERE t.slug = 'personal-finance' AND lv.slug = 'personal-finance-intermediate';

IF NOT EXISTS (
  SELECT 1 FROM lessons
  WHERE level_id = pf_int_level_id AND slug = 'income-tax-planning'
) THEN
  -- Run lesson inserts only when this level has not already been seeded.
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES

(pf_int_level_id,
'Income tax planning â€” legally minimise your tax bill',
'income-tax-planning',
'# Income tax planning

## The difference between tax evasion and tax planning

**Tax evasion**: Hiding income or lying to the government. Illegal. Serious criminal offense.
**Tax avoidance (planning)**: Using legal provisions to minimise tax liability. Completely legitimate and encouraged by the government through intentional deductions and exemptions.

The Income Tax Act offers numerous legal deductions specifically to encourage certain behaviours (saving, insurance, home loans, charity). Using them is smart financial management.

## The full deduction toolkit

### Section 80C â€” Maximum â‚¹1.5 lakh

The most important deduction. Eligible investments/expenses:

- **EPF contribution**: Automatically deducted by employer â€” use this first
- **PPF (Public Provident Fund)**: Tax-free returns + tax-free maturity = EEE status
- **ELSS funds**: 3-year lock-in, market-linked returns (potential 12-15%), best 80C option for young earners
- **NSC (National Savings Certificate)**: 5-year lock-in, 7.7% currently
- **Life insurance premiums**: Include all policies
- **Home loan principal repayment**: Counts toward 80C
- **Children''s tuition fees**: Up to 2 children
- **5-year bank FD**: 7%+ rates currently

**Strategy**: Max out 80C every year. If your EPF already covers â‚¹1.5L, you are done. If not, add ELSS for tax-efficient wealth creation.

### Section 80CCD(1B) â€” Additional â‚¹50,000 for NPS

NPS (National Pension System) gets an ADDITIONAL â‚¹50,000 deduction beyond the 80C limit.

This is a separate bucket. Total potential: â‚¹1.5L (80C) + â‚¹50K (80CCD) = â‚¹2L in deductions.

For someone in the 30% tax bracket: â‚¹2L deductions Ã— 30% = â‚¹60,000 tax saved annually.

### Section 24(b) â€” Home loan interest up to â‚¹2 lakh

Interest paid on home loan for self-occupied property â†’ deduction up to â‚¹2L per year.
For rented property: no limit on interest deduction (but rental income is taxable).

### Section 80D â€” Medical insurance premiums

- Self, spouse, children: Up to â‚¹25,000
- Parents (below 60): Additional â‚¹25,000
- Parents (senior citizens, 60+): Additional â‚¹50,000
- Preventive health check-up: â‚¹5,000 (within above limits)

Maximum possible: â‚¹75,000 deduction if you pay insurance for yourself AND senior citizen parents.

### Section 80G â€” Donations to approved charities

50% to 100% of donation deductible depending on the charity. Keep receipts. Only recognised charities qualify.

### Section 10(13A) â€” HRA exemption

If you receive HRA, the exempt portion is the minimum of:
1. Actual HRA received
2. 50% of basic salary (metro) or 40% (non-metro)
3. Rent paid minus 10% of basic salary

**Important**: Keep rent receipts. Landlord''s PAN required if annual rent > â‚¹1 lakh.

## Old regime vs New regime â€” which is better?

**New regime**: Lower tax rates but almost no deductions. Better if you have few deductions or are in lower income bracket.

**Old regime**: Higher rates but all deductions available. Better if you maximise 80C + 80D + 80CCD + HRA + home loan interest.

**Break-even point**: If your deductions exceed approximately â‚¹3.75L (for â‚¹15L+ income), old regime is typically better. Calculate both every year â€” switch regimes annually if needed.',
9, 1, TRUE, TRUE),

(pf_int_level_id,
'EPF deep dive â€” your forced savings account and how to maximise it',
'epf-deep-dive',
'# EPF â€” the complete guide

## What is EPF?

The **Employees'' Provident Fund (EPF)** is India''s mandatory retirement savings scheme for employees earning below â‚¹15,000/month (though most employers extend it to all employees).

It is the most tax-efficient savings vehicle available to salaried employees.

## How EPF works

Every month:
- **You contribute**: 12% of your Basic + DA salary
- **Your employer contributes**: 12% of your Basic + DA
  - Of the employer''s 12%: 8.33% goes to EPS (Employees'' Pension Scheme) and 3.67% to EPF

**Example** â€” Basic salary â‚¹50,000/month:
- Your EPF contribution: â‚¹6,000/month (12%)
- Employer EPF contribution: â‚¹3,835/month (7.67%)  
- Employer EPS contribution: â‚¹1,250/month (capped at â‚¹15,000 basic)
- Total EPF credit per month: â‚¹9,835

## EPF interest rate

Set by EPFO (Employees'' Provident Fund Organisation) annually. Recent rates:
- 2021-22: 8.10%
- 2022-23: 8.15%
- 2023-24: 8.25%

Interest is tax-free (for contributions up to â‚¹2.5L per year). This makes EPF one of the highest risk-free, tax-free returns available.

## The EEE status â€” triple tax exemption

EPF has the rare distinction of being **EEE** (Exempt-Exempt-Exempt):
- **E1**: Contribution is tax deductible (under 80C)
- **E2**: Interest earned is tax-free
- **E3**: Maturity amount is tax-free (after 5 years of continuous service)

Very few financial products have this triple exemption. PPF is the other major one.

## How to maximise EPF

### Voluntary Provident Fund (VPF)
Contribute MORE than the mandatory 12% through VPF. Same interest rate (8.25%), same EEE tax benefits, same safety. Maximum: up to 100% of basic salary.

**Why VPF makes sense**: If you can earn 8.25% tax-free, you need a taxable instrument earning 12%+ to match it (for a 30% tax bracket person). Very hard to beat.

### Keep track of your UAN
Your **Universal Account Number (UAN)** follows you across employers. Ensure your UAN is linked to Aadhaar, PAN, and bank account for smooth withdrawals.

## EPF withdrawal rules

**Partial withdrawal** (allowed for specific purposes):
- Medical emergency: Up to 6x monthly wages
- House purchase/construction: Up to 90% of EPF balance
- Marriage/education: Up to 50% of own share
- Pre-retirement: After 54 years of age, up to 90% of balance

**Full withdrawal**: Only on retirement or 2+ months of unemployment

**Tax on withdrawal**: Tax-free if withdrawn after 5 years of continuous service. Taxed if withdrawn before 5 years.',
8, 2, TRUE, TRUE),

(pf_int_level_id,
'NPS â€” the retirement account that also saves you â‚¹50,000 in tax',
'nps-national-pension-system',
'# NPS â€” National Pension System

## What is NPS?

The **National Pension System** is India''s government-backed retirement savings scheme that offers:
- Tax deduction of â‚¹50,000 under 80CCD(1B) â€” separate from 80C
- Market-linked returns with low costs
- Forced long-term savings until age 60

## Who should open an NPS account?

NPS is most valuable for:
- Individuals in the 20-30% tax bracket (the â‚¹50K deduction saves â‚¹15,000-â‚¹22,500 in tax)
- Those who want to diversify beyond EPF and PPF
- Self-employed individuals who don''t have EPF access

## NPS structure â€” Tier 1 and Tier 2

**Tier 1 (mandatory)**: The core NPS account.
- Minimum contribution: â‚¹500/year
- Lock-in: Until age 60 (with limited partial withdrawals)
- Tax benefit: Full â‚¹50,000 deduction available
- At maturity: 60% can be withdrawn tax-free; 40% must be used to buy annuity (monthly pension)

**Tier 2 (optional)**: A liquid account linked to Tier 1.
- No lock-in (withdraw anytime)
- No additional tax benefit
- Acts like a mutual fund but with lower costs
- Good for parking short-term savings

## NPS investment options

You choose how your money is invested across:

**Asset Class E (Equity)**: Up to 75% (age-based limit). Market-linked returns.
**Asset Class C (Corporate bonds)**: Moderate risk, higher than G-Sec returns.
**Asset Class G (Government securities)**: Lowest risk, lowest return.

Two approaches:
- **Active choice**: You decide the allocation each year
- **Auto choice**: Allocation automatically adjusted based on age (more equity when young, more debt near retirement)

## NPS fund managers

HDFC Pension, SBI Pension, LIC Pension, ICICI Pension, Kotak Pension, Aditya Birla Pension.

All are regulated by PFRDA. Fees are extremely low (0.01-0.09% fund management charge).

## The NPS dilemma: The 40% annuity rule

The most controversial aspect of NPS: at age 60, you must use 40% of your corpus to buy an annuity (monthly pension). This annuity income is fully taxable.

This reduces the EEE appeal. NPS is more accurately **EET** â€” the annuity portion is taxable.

**The math still works**: â‚¹50,000 tax saving per year for 25 working years, invested at 10%, becomes approximately â‚¹55 lakh of extra corpus â€” purely from the tax savings compounding.

## How to open an NPS account

1. eNPS portal (enps.nsdl.com) â€” completely online
2. Need: PAN, Aadhaar, mobile number, bank account
3. Select fund manager and asset allocation
4. Minimum â‚¹500 to activate Tier 1
5. Contribute any time (monthly SIP recommended)',
8, 3, TRUE, TRUE),

(pf_int_level_id,
'PPF â€” the safest tax-free investment in India',
'ppf-public-provident-fund',
'# PPF â€” Public Provident Fund

## Why PPF is special

PPF is one of the very few investments in India that is completely **EEE** â€” exempt at all three stages:
- Contribution deductible under 80C (up to â‚¹1.5L)
- Interest earned is tax-free
- Maturity amount is tax-free
- Immune to attachment by court orders (protection from creditors)

This makes PPF unique even among government savings schemes.

## Key features

**Interest rate**: Set by government quarterly. Currently 7.1% per annum (April 2024). Compounded annually.

**Lock-in period**: 15 years (extendable in 5-year blocks indefinitely)

**Investment limits**: Minimum â‚¹500, maximum â‚¹1.5 lakh per year

**Where to open**: Any post office, SBI, or authorised bank branches. Also online through net banking.

**Risk**: Zero â€” backed by Government of India sovereign guarantee.

## The compounding power of PPF

â‚¹1.5 lakh per year for 15 years at 7.1%:
- Total invested: â‚¹22.5 lakh
- Maturity value: Approximately â‚¹40.68 lakh
- Tax-free gain: â‚¹18.18 lakh

Extend for another 5 years (20 years total): Approximately â‚¹63 lakh
Extend another 5 years (25 years): Approximately â‚¹1 crore

The lock-in period is actually an advantage â€” it forces long-term disciplined savings.

## Partial withdrawal rules

After **6 years**:
- Can withdraw 50% of the balance at the end of the 4th year or end of the preceding year â€” whichever is lower
- One withdrawal per year

After **7 years**:
- Premature closure allowed only for specific reasons (serious illness, higher education)

**Loans against PPF**:
Between 3rd and 6th year: Can take loan up to 25% of balance (interest: PPF rate + 1%)
After 6th year: Withdrawal is better than loan

## PPF vs ELSS for 80C

| | PPF | ELSS |
|--|--|--|
| Returns | Fixed ~7.1% | Market-linked 10-15% (historical) |
| Lock-in | 15 years | 3 years |
| Risk | Zero | Market risk |
| Tax on maturity | Fully tax-free | 10% LTCG above â‚¹1L |
| Best for | Conservative investors, near retirement | Younger investors, wealth creation |

**Recommendation**: Have both. PPF for stability and guaranteed tax-free returns. ELSS for equity growth potential with shorter lock-in.',
7, 4, TRUE, FALSE),

(pf_int_level_id,
'Health insurance â€” how to choose the right plan and never get caught without coverage',
'health-insurance-guide',
'# Health insurance â€” the complete guide

## Why health insurance is your most important financial product

A single hospitalisation without insurance can destroy years of savings:
- Major surgery: â‚¹5-20 lakh
- ICU stay (per day): â‚¹15,000-â‚¹50,000
- Cancer treatment: â‚¹20-50 lakh
- Heart bypass: â‚¹8-15 lakh

Health insurance is not an investment. It is protection against financial catastrophe.

## Types of health insurance plans

### Individual plan
One person covered. Lowest premium. Best if you are single or want different coverage levels for family members.

### Family floater plan
Entire family covered under one sum insured amount. One policy, one premium.
- Cheaper than separate individual plans
- Risk: If multiple family members are hospitalised simultaneously, sum insured may be insufficient

### Top-up plan
Activates after your base coverage is exhausted. Much cheaper than a standalone high-coverage plan.
Example: Base plan â‚¹5L + Top-up â‚¹20L (deductible â‚¹5L). Activated after â‚¹5L is used.

Super top-up: Covers aggregate claims exceeding the deductible in a year (better than regular top-up).

### Critical illness plan
Pays a lump sum on diagnosis of specified serious illnesses (cancer, heart attack, stroke, kidney failure).
Separate from hospitalisation coverage. Useful for income replacement during long recovery.

## What to look for in a health plan

**Sum insured**: Minimum â‚¹10 lakh for individuals in metros. â‚¹25L+ preferred. Medical inflation runs at 15%+ per year.

**Pre-existing disease waiting period**: Standard is 2-4 years. Prefer plans with shorter waiting periods.

**Network hospitals**: Prefer cashless treatment â€” you don''t pay upfront, insurer pays hospital directly. Check if good hospitals near you are in-network.

**Room rent limit**: Avoid plans with room rent sub-limits (e.g., "room rent capped at 1% of sum insured"). These can drastically reduce reimbursements.

**Claim settlement ratio**: Prefer insurers with 90%+ claim settlement ratio (check IRDAI annual report).

**Restoration benefit**: Sum insured restored if exhausted during the year for different illness. Essential for family floaters.

**No-claim bonus**: Sum insured increases by 5-50% for every claim-free year.

## Recommended approach

1. **Employer plan**: Use as base coverage (often â‚¹3-5L). But do not rely on it â€” it disappears when you change jobs.

2. **Individual/family floater**: â‚¹10-15L minimum from a reputable private insurer (Niva Bupa, Star Health, HDFC Ergo, Care Health).

3. **Super top-up**: Add â‚¹50L+ super top-up plan on top. Relatively cheap.

4. **Critical illness**: Consider separately if family history of serious illness.

## Section 80D tax benefit

Premiums paid for health insurance qualify for tax deduction:
- Self, spouse, children: Up to â‚¹25,000
- Parents (below 60): Additional â‚¹25,000
- Parents (senior citizens): Additional â‚¹50,000',
8, 5, TRUE, FALSE),

(pf_int_level_id,
'Life insurance â€” term plans, ULIP myths, and what you actually need',
'life-insurance-guide',
'# Life insurance â€” what you actually need

## The purpose of life insurance

Life insurance has one job: **replace the income of the policyholder if they die, to protect dependents from financial hardship.**

It is not an investment. It is not a savings plan. It is income replacement protection.

## Term insurance â€” the only life insurance most people need

A **pure term plan** pays a death benefit if the insured person dies within the policy term. If you survive the term, you receive nothing â€” because you survived.

This simplicity makes it the most effective and affordable life insurance.

**Why term insurance?**
- â‚¹1 crore coverage for a healthy 28-year-old: approximately â‚¹8,000-â‚¹12,000 per year
- Same coverage in an endowment plan: â‚¹3-5 lakh per year

The difference in premium (â‚¹3-4 lakh per year) invested in mutual funds grows to vastly more than any endowment plan pays out.

## How much term cover do you need?

**Rule of thumb**: 10-15x your annual income

Annual income â‚¹10 lakh â†’ â‚¹1-1.5 crore cover

**More precise calculation**:
Income replacement needed for X years Ã— current expenses
+ Outstanding loans (home loan, car loan)
+ Children''s education funding
+ Spouse''s retirement funding

Subtract: Existing savings and investments

## Choosing a term plan

**Claim settlement ratio**: 98%+ preferred (check IRDAI annual report)
**Solvency ratio**: Above 1.5x required (indicates financial health of insurer)
**Premium**: Compare on PolicyBazaar or Coverfox (comparison platforms)
**Riders**: Consider accidental death benefit, critical illness, waiver of premium on disability

**Best term plans in India (2024)**: LIC Tech Term, HDFC Click 2 Protect, ICICI iProtect Smart, Tata AIA Sampoorna Raksha

## What NOT to buy

### ULIPs (Unit Linked Insurance Plans)
Combines insurance and investment. Sounds good. Works poorly for both:
- Insurance coverage is inadequate
- Investment costs are high (3-5% charges in early years)
- Better to buy term insurance + mutual funds separately

### Endowment plans / Money-back plans
"Save and get your money back plus bonus." Sounds attractive.
- Returns are typically 4-5% â€” less than inflation
- Much of your premium goes toward the insurance component (which is tiny) and agent commissions (30-40% in early years)

### Single premium plans from banks
Banks aggressively sell these at loan closure. Often inappropriate. Decline politely, buy a separate term plan.

## When to buy

Buy term insurance when you have dependents â€” a spouse, children, or parents who rely on your income.

Buy early: younger = cheaper premiums, healthier = no loading or exclusions

Buy the longest term available (up to age 75 or 80): you cannot predict when you will need it.',
8, 6, TRUE, FALSE),

(pf_int_level_id,
'Mutual fund selection â€” how to choose the right fund for your goal',
'mutual-fund-selection',
'# How to choose the right mutual fund

## The mutual fund universe

India has 40+ fund houses and 2,500+ schemes. The choice is overwhelming. This lesson cuts through the noise.

## Step 1: Match fund type to goal

**Emergency fund**: Not a mutual fund â€” liquid savings account or liquid funds
**1-3 year goals**: Debt funds (short-duration, corporate bond funds)
**3-7 year goals**: Hybrid funds (balanced advantage funds) or large-cap funds
**7+ year goals**: Equity funds (flexi-cap, large & mid-cap, or index funds)

## Step 2: Index funds vs active funds

### The uncomfortable truth about active funds

SEBI data consistently shows:
- 70-80% of large-cap active funds underperform their benchmark index over 10 years
- After accounting for expense ratios and taxes, very few active funds add value
- The funds that do outperform are difficult to identify in advance

### Index funds

Simply replicate the index. NIFTY 50 index fund = you own the 50 largest Indian companies.
- Expense ratio: 0.05-0.20% (vs 1-2.5% for active funds)
- No fund manager risk
- Guaranteed to match market returns (minus tiny expense)
- No selection effort required

**For most investors: NIFTY 50 or NIFTY 100 index fund should be the core of the equity portfolio.**

## Step 3: If choosing active funds â€” what to look for

For the portion where you want active management:

**Rolling returns** (not point-to-point): How consistently has the fund outperformed?
- Look at 3-year rolling returns over 5+ years
- Consistent outperformers are more reliable than one-time winners

**Fund manager tenure**: Has the same manager been there for 5+ years? Their track record is the relevant one.

**Expense ratio**: Lower is better. 1.5%+ is expensive for large-cap.

**Portfolio concentration**: 20-40 stocks is reasonable. 80+ stocks usually means it will just mimic the index at higher cost.

**AUM (Assets under Management)**: Very large AUM (â‚¹30,000+ crore) makes it harder for the fund to be nimble. Very small AUM (<â‚¹100 crore) adds liquidity risk.

## The fund categories you need to know

**Large cap**: Top 100 companies. Stable, lower risk. HDFC Top 100, ICICI Bluechip.
**Large & Mid cap**: Top 150 companies. Moderate risk/return. Mirae Asset, Canara Robeco.
**Flexi cap**: Can invest anywhere â€” any market cap. Most freedom. Parag Parikh, HDFC Flexi Cap.
**Mid cap**: 101-250 ranked companies. Higher return potential, higher volatility.
**Small cap**: Below 250 rank. Highest return potential, highest risk, lower liquidity.
**ELSS**: Tax-saving equity funds. 3-year lock-in. Axis Long Term, Mirae Asset Tax Saver.

## Direct vs Regular plans

**Direct plans**: You invest directly with the fund house. No distributor commission. Expense ratio 0.5-1% lower.
**Regular plans**: Sold through distributors (banks, agents). Higher expense ratio (distributor''s commission).

**Always choose Direct plans.** The difference compounds massively over 20 years. Use SEBI-registered investment advisors if you need advice â€” pay them directly, not through higher fund expenses.',
8, 7, TRUE, FALSE),

(pf_int_level_id,
'Debt funds â€” the alternatives to FDs that most Indians don''t know about',
'debt-funds-guide',
'# Debt mutual funds â€” FD alternatives with nuance

## What are debt funds?

Debt mutual funds invest in fixed-income instruments: government bonds, corporate bonds, treasury bills, commercial papers, and bank certificates of deposit.

They are NOT fixed deposits. Key differences:

| | Fixed Deposit | Debt Fund |
|--|--|--|
| Returns | Fixed, guaranteed | Variable (market-linked) |
| Capital safety | Principal guaranteed | Not guaranteed (NAV can fall) |
| Liquidity | Penalty for early exit | Exit anytime (most funds) |
| Taxation | As per income slab | As per slab (post April 2023) |
| Transparency | Opaque | Daily NAV, portfolio disclosed |

## Taxation change (April 2023)

Before April 2023: Debt funds held 3+ years had 20% tax with indexation benefit (very tax-efficient).

After April 2023: Debt fund gains taxed at your income slab rate, regardless of holding period. This removed the major tax advantage.

**Impact**: Debt funds now compete directly with FDs on tax terms. The decision is more about returns and liquidity now.

## When debt funds still make sense

**Liquid funds** (1-90 day maturity): Better than savings account for parking money. Returns: ~7%. Exit in 1 business day. No exit load after 7 days.

**Short-duration/Overnight funds**: Emergency fund alternative. Slightly better than savings account. Very low risk.

**Arbitrage funds**: Classified as equity for tax purposes (STCG 15%, LTCG 10%) but return ~FD-like returns from price arbitrage. Excellent for 3-12 month money in 20-30% tax brackets.

## Credit risk in debt funds

Corporate bonds pay higher interest but carry default risk. Credit risk funds invest in lower-rated corporate bonds.

**Risk**: If the company defaults (like IL&FS in 2018, DHFL in 2019), the fund NAV can crash 20-50%.

**Rule**: For most retail investors, stick to funds investing only in AAA-rated bonds or government securities. Avoid credit risk funds.',
7, 8, TRUE, FALSE),

(pf_int_level_id,
'Real estate vs financial assets â€” an honest comparison',
'real-estate-vs-financial-assets',
'# Real estate vs financial assets â€” an honest comparison

## Why this topic is emotional

For most Indian families, buying a home is the most important financial decision of their lives. Real estate has been conflated with investment for decades. This lesson separates the emotional from the financial.

## The cost of owning real estate

Most people only count the purchase price. The true cost includes:

**Direct costs**:
- Stamp duty: 5-7% of property value
- Registration: 1%
- GST on under-construction property: 5%
- Broker fees: 1-2%
- Home loan processing: 0.5-1%

**Ongoing costs**:
- Maintenance charges: â‚¹3-8/sqft/month
- Property tax: 0.1-0.5% per year
- Repairs and renovation: 1-2% every 10 years
- Insurance: 0.05-0.1% per year
- Loan interest: EMI includes substantial interest, especially in first half of loan

**Hidden opportunity cost**: The down payment (say â‚¹20 lakh) invested in equity mutual funds at 12% per year for 20 years = â‚¹1.93 crore.

## Real estate returns â€” the honest number

**Residential real estate in India (actual historical returns)**:
- Tier 1 cities: 6-9% CAGR (some locations 10-12%)
- Tier 2 cities: 4-7%
- Rental yield: 2-3% in metros (one of the lowest globally)

Compare to NIFTY 50: 12-15% CAGR over 20 years, with no maintenance, no liquidity issues, complete divisibility.

## When buying a home makes sense

**Buy for use, not just investment:**
- You plan to live there 10+ years
- EMI is less than or equal to current rent
- You have 20-30% down payment without straining emergency fund or retirement savings
- Loan EMI is under 40% of take-home salary

**Do NOT buy:**
- To "not waste money on rent" (rent is not waste â€” it pays for flexibility and optionality)
- Because "property prices only go up" (they don''t â€” see Mumbai flat prices from 2012-2020)
- As an investment that you plan to sell in 5-7 years (transaction costs alone are 8-10%)
- If it means depleting your emergency fund or stopping retirement savings

## Rental yield calculation

Annual rent / Property value Ã— 100

A â‚¹1 crore flat renting for â‚¹25,000/month = â‚¹3 lakh/year = 3% rental yield.

After property tax, maintenance, vacancy periods: effective yield is 1.5-2%.

Compare to a 10-year government bond at 7.2% â€” the property is not a great investment on pure yield basis.

## The right framework

Own your home for lifestyle reasons, within financial means.
Use financial assets (equity MFs, PPF, NPS) for wealth creation.
Do not sacrifice retirement savings for a bigger or earlier property purchase.',
8, 9, TRUE, FALSE),

(pf_int_level_id,
'Building an emergency fund â€” why and exactly how much you need',
'emergency-fund-complete-guide',
'# The emergency fund â€” your financial immune system

## What is an emergency fund?

An emergency fund is a dedicated pool of liquid savings meant exclusively for genuine financial emergencies:

- Job loss
- Medical emergency not covered by insurance
- Major unexpected home or vehicle repair
- Family crisis requiring immediate cash

It is NOT for:
- Planned expenses (vacation, gadget purchase)
- Investment opportunities
- Annual insurance premiums (these should be budgeted separately)

## How much do you need?

**The standard recommendation**: 3-6 months of monthly expenses

**For salaried employees in stable industries**: 3 months
**For salaried employees in volatile industries (startup, sales-heavy)**: 6 months
**For self-employed/freelancers**: 6-12 months
**If you have dependents**: 6 months minimum
**If you have an EMI**: Add the EMI to monthly expenses before calculating

**Example**:
Monthly expenses: â‚¹60,000 (rent â‚¹20K + EMI â‚¹15K + living â‚¹25K)
For a salaried professional with EMI: 6 months Ã— â‚¹60,000 = â‚¹3,60,000 emergency fund

## Where to keep it

**Requirements**: Immediately accessible, capital safe, some return

**Option 1: Savings account**: Fully liquid, zero risk, 2.5-4% return. Keep 1 month here.

**Option 2: Liquid mutual fund**: T+1 exit, 6.5-7% return, low risk. Keep 2-3 months here.

**Option 3: Sweep FD**: Auto-converts savings account excess to FD. Breaks FD automatically when you need money. 5-6% return.

**Option 4: Short-term FD (3-6 months)**: Slightly higher return, minor penalty for early exit. Keep 2-3 months here.

**Avoid**: Equity mutual funds for emergency fund â€” market may be down exactly when you need money.

## Building the emergency fund

If you have no emergency fund:
1. Open a separate savings account (or liquid fund account)
2. Auto-transfer â‚¹X every month after salary credit
3. Treat it as a non-negotiable expense
4. Do not invest in equity until you have at least 3 months saved

Priority order:
1. Emergency fund (3 months)
2. Essential insurance (health + term life)
3. Tax-saving investments (80C, NPS)
4. Retirement investing (EPF, NPS, mutual funds)
5. Other goals

## What to do after building it

Once funded, invest emergency fund contributions in debt funds or equity.
Never stop SIPs to build emergency fund faster â€” keep both running.
Review and increase the amount when your expenses rise significantly.',
7, 10, TRUE, FALSE),

(pf_int_level_id,
'Goal-based financial planning â€” money with a purpose',
'goal-based-financial-planning',
'# Goal-based financial planning

## The problem with random saving

Most people save whatever is left after spending, in one undifferentiated pool. This creates:
- No clarity on progress toward specific goals
- Tendency to dip into savings for unintended purposes
- Inability to measure whether you are on track
- Stress from not knowing if you have "enough"

Goal-based planning solves all of this.

## The goal-based framework

**Step 1: Define every financial goal**
Write down every goal with:
- Name (Children''s education, Retirement, Car, Home down payment)
- Target amount in today''s rupees
- Timeline (years from now)
- Priority (essential, important, nice-to-have)

**Step 2: Adjust for inflation**
Future value = Present value Ã— (1 + inflation)^years

Child''s engineering education today: â‚¹20 lakh
Education inflation: 10% per year
12 years away: â‚¹20L Ã— (1.10)^12 = â‚¹62.7 lakh needed

**Step 3: Calculate monthly SIP required**
Use SIP calculator to determine how much to invest monthly to reach the future value.

Assuming 12% returns:
To accumulate â‚¹62.7 lakh in 12 years at 12% â†’ Monthly SIP â‰ˆ â‚¹19,000

**Step 4: Choose appropriate investments by timeline**

| Timeline | Suitable investment |
|---|---|
| 0-1 year | Liquid funds, savings account, short FD |
| 1-3 years | Short-duration debt funds, FD |
| 3-5 years | Balanced/hybrid funds, flexi-cap funds |
| 5-10 years | Diversified equity funds, large & mid cap |
| 10+ years | Equity (index funds + active flexi cap) |

**Step 5: Create separate accounts/SIPs for each goal**
Name each SIP or investment account with the goal name. This prevents raiding one goal''s savings for another.

## The most common goals and their planning

**Retirement**: 25-35 years away. Needs the highest corpus. Primary vehicle: EPF + NPS + equity mutual funds. Start early â€” the first 10 years of compounding matter most.

**Child''s education**: 10-18 years away. Education inflation is severe (10-12%). Start a dedicated ELSS or flexi-cap SIP immediately on the child''s birth.

**Home down payment**: 3-7 years typically. Mix of debt and equity. Aggressive allocation if 7+ years away, shift to debt as you approach the date.

**Car/vacation/gadget**: Short-term goals. Use recurring deposits or liquid funds. Do not use equity for goals less than 3 years away.',
8, 11, TRUE, FALSE),

(pf_int_level_id,
'Estate planning â€” what happens to your money when you are gone',
'estate-planning-india',
'# Estate planning in India

## Why most Indians have no estate plan

Estate planning feels morbid. It requires confronting mortality. It involves legal complexity. Most people procrastinate indefinitely.

The result: families fight over assets, wealth gets stuck in courts for years, intended beneficiaries receive nothing or much less than intended.

A few hours of planning prevents decades of family conflict.

## The will â€” the most important document you will write

A **Will** is a legal document that specifies how your assets should be distributed after your death.

**Without a will** (intestate succession): Assets distributed according to Hindu Succession Act / Muslim Personal Law / Indian Succession Act depending on religion. Spouse, children, and parents all have legal claims. The result may not match your wishes.

**With a will**:
- You decide who gets what
- Minimises family disputes
- Speeds up the transfer process
- Can make provisions for minor children

**Requirements for a valid will in India**:
- Written document
- Testator (you) must be 18+ and of sound mind
- Signed by testator
- Two witnesses present at signing (who are not beneficiaries)
- No stamp duty required
- Registration is optional but recommended (â‚¹200-500)

## What to include in your will

- List of all assets (bank accounts, investments, property, FDs, EPF, NPS, insurance)
- Beneficiaries for each asset
- Guardian for minor children (if any)
- Executor (the person who carries out your will''s instructions)
- Specific bequests (family heirlooms, jewellery)

## Nominations â€” separate from your will

**Nominations** are not the same as inheritance. They determine who receives the asset immediately upon your death without probate.

Important: Nominees are trustees â€” they must ultimately distribute the asset per your will or succession law. BUT in practice, bank FDs, mutual funds, and insurance claims are paid to nominees and disputes are rare.

**Action**: Ensure nominations are updated for:
- All bank accounts
- All mutual fund folios
- All insurance policies
- EPF and PPF
- NPS
- Demat account

This alone (updating nominees) resolves 80% of estate distribution issues for most families.

## Life insurance as estate planning tool

Life insurance proceeds go directly to the nominee, outside of probate.

Useful for:
- Providing liquid funds to family immediately after death
- Paying off outstanding loans (home loan)
- Protecting specific family members (dependents with special needs)

## What is probate?

**Probate** is the court process of validating a will and distributing assets. Required for immovable property in certain states (Maharashtra, West Bengal, Tamil Nadu â€” check local rules).

Probate can take 1-3 years. Expensive (court fees, lawyer fees). All the more reason to have a clear, registered will.',
8, 12, TRUE, FALSE),

(pf_int_level_id,
'Managing debt intelligently â€” EMIs, debt traps, and the right order to repay',
'managing-debt-intelligently',
'# Managing debt intelligently

## Not all debt is equal

**Good debt**: Used to acquire appreciating assets or productive capabilities. Home loan (if property appreciates and rent saved is meaningful), education loan (if career earnings increase significantly).

**Neutral debt**: Car loan (depreciating asset but necessary for livelihood). Manageable if rate is low and term is short.

**Bad debt**: Credit cards at 36-48% annually. Personal loans at 18-24%. Buy-now-pay-later schemes. Consumer durables on EMI at 24%+.

The objective: eliminate bad debt as fast as possible, manage neutral debt efficiently, use good debt selectively.

## The debt repayment priority

### Step 1: Always minimum payments on everything
Never miss minimum payments. Late payment fees, penalty interest, and credit score damage make this the highest-priority rule.

### Step 2: Avalanche method (mathematically optimal)
Pay minimum on all debts. Put ALL extra money toward the highest interest rate debt first.
Once cleared â†’ move extra money to next highest rate.

This minimises total interest paid. Pure mathematics.

### Step 3: Snowball method (psychologically easier)
Pay minimum on all. Put ALL extra money toward the smallest balance debt first.
Quick wins build momentum and confidence.

**Which to use?**: Avalanche if you are disciplined. Snowball if you need psychological wins to stay motivated. Either is infinitely better than paying minimums on everything.

## Credit card debt â€” the most dangerous trap

A â‚¹50,000 credit card balance at 36% annual interest:
- Paying minimum (â‚¹1,500/month): Takes 6.5 years to clear. Total interest: â‚¹65,000+
- Paying â‚¹5,000/month: Cleared in 11 months. Interest: â‚¹8,400
- Paying in full: Zero interest

**Credit card strategy**:
- Pay the FULL balance every month
- If you cannot pay in full, you are spending money you don''t have
- Never use credit card for cash advance (higher rate + immediate interest)
- The "minimum due" trap: designed to keep you in debt forever

## Home loan optimisation

India''s biggest EMI deserves careful management.

**Prepayment**: Every extra rupee toward principal saves significant interest.
â‚¹50L home loan at 8.5%, 20 years: EMI = â‚¹43,391
Pay â‚¹10,000 extra per month from year 1: Loan closed in 13.5 years instead of 20. Interest saved: â‚¹17.5 lakh.

**Refinancing**: If rates have fallen since you took the loan, refinance.
Moving from 9% to 8% on â‚¹50L saves approximately â‚¹6-7 lakh over the remaining loan term.

## The debt-to-income ratio

**Total monthly EMIs should not exceed 40% of take-home salary.**

If EMIs exceed 50% of take-home: financial stress. Reduce by prepaying high-cost loans or increasing income.

Ideal: EMIs below 30% of take-home. Gives room for savings and unexpected expenses.',
7, 13, TRUE, FALSE),

(pf_int_level_id,
'Building a net worth statement â€” how to measure your true financial health',
'net-worth-statement',
'# Building your personal net worth statement

## What is net worth?

**Net worth = Total assets âˆ’ Total liabilities**

It is the single most important number in your financial life. It tells you exactly where you stand financially at any point in time.

Tracking it annually shows you whether you are building wealth or losing ground.

## Step 1: List all your assets

### Liquid assets (convertible to cash in <1 week)
- Savings account balance
- Fixed deposits (note premature withdrawal value)
- Liquid mutual funds
- Cash at home

### Investment assets (convertible to cash in 1-30 days)
- Equity mutual funds (at current NAV Ã— units)
- PPF balance
- Stocks in demat account (at current market price)
- NPS balance (Tier 1 + Tier 2)
- EPF balance (check UAN portal)
- Gold (physical gold at current price Ã— grams)
- Bonds and NCDs

### Long-term/illiquid assets
- Real estate (conservative current market value â€” subtract estimated selling costs)
- Life insurance surrender value (NOT sum assured)
- Business equity (at conservative valuation)

## Step 2: List all your liabilities

- Home loan outstanding balance
- Car loan outstanding balance
- Education loan outstanding balance
- Credit card outstanding balance (what you owe, not credit limit)
- Personal loan outstanding
- Any money borrowed from family/friends
- Other EMI obligations

## Step 3: Calculate net worth

Net worth = Sum of all assets âˆ’ Sum of all liabilities

## Interpreting your net worth

**Negative net worth**: More liabilities than assets. Common for young professionals with education loans. The goal is to make it positive as quickly as possible.

**Zero to positive**: Building phase. Every year should show improvement.

**Growing net worth**: The goal. Each year, net worth should grow through savings, investment returns, and debt repayment.

## Annual net worth review

Track your net worth on the same date every year (e.g., your birthday or April 1 after tax filing).

Questions to ask annually:
- Did net worth grow this year? By how much?
- What drove the growth (savings? investment returns? loan repayment?)
- What is my target net worth for retirement?
- Am I on track?

## Target net worth by age (rough guideline)

These are rough benchmarks, not rules:
- Age 30: Net worth = 1x annual income
- Age 40: Net worth = 3-4x annual income
- Age 50: Net worth = 6-8x annual income
- Age 60 (retirement): Net worth = 20-25x annual expenses',
7, 14, TRUE, FALSE),

(pf_int_level_id,
'Personal finance intermediate recap â€” your complete financial roadmap',
'personal-finance-intermediate-recap',
'# Personal Finance Intermediate â€” complete recap

## What you have mastered

You now have a comprehensive intermediate-level personal finance toolkit. Here is a reference summary.

## Tax optimisation toolkit

**Section 80C** (up to â‚¹1.5L): EPF (mandatory), PPF, ELSS, home loan principal, insurance premiums
**Section 80CCD(1B)** (extra â‚¹50K): NPS â€” always maximise this if in 20%+ tax bracket
**Section 24(b)** (up to â‚¹2L): Home loan interest
**Section 80D** (up to â‚¹75K): Health insurance premiums (self + parents)
**HRA exemption**: Keep rent receipts and landlord PAN

**Always calculate both old and new regime tax annually.**

## The account hierarchy

| Account | Return | Tax | Lock-in | Best for |
|---|---|---|---|---|
| EPF | 8.25% | EEE | Till retirement | Mandatory retirement |
| PPF | 7.1% | EEE | 15 years | Safe retirement savings |
| NPS | Market-linked | EET | Till 60 | Extra â‚¹50K deduction |
| ELSS | Market-linked | E(T at 10%) | 3 years | 80C + wealth creation |
| Health insurance | Protection | 80D deduction | Annual | Medical protection |
| Term insurance | Protection | 80C deduction | Annual | Life protection |

## Insurance fundamentals

**Health insurance**: Minimum â‚¹10L individual + â‚¹25L super top-up. Network hospitals, no sub-limits, 90%+ claim settlement ratio.

**Life insurance**: Pure term plan only. 10-15x annual income. Online direct purchase. Avoid ULIPs and endowment plans.

## Wealth building principles

- Emergency fund first (3-6 months expenses in liquid accounts)
- Max tax-advantaged accounts (EPF + PPF + NPS + 80C)
- Goal-based investing with timeline-appropriate instruments
- Net worth statement annually to track progress
- Debt: avalanche method to clear high-interest liabilities

## The complete financial priority order

1. Build â‚¹3-6 month emergency fund
2. Get term life insurance and health insurance
3. Max EPF contribution (or VPF)
4. Max PPF (â‚¹1.5L/year)
5. Max NPS (â‚¹50K for extra deduction)
6. Invest surplus in goal-based equity/debt mix
7. Prepay high-interest debt aggressively

## Estate planning checklist

- Will drafted and witnessed (registered preferred)
- Nominations updated: bank accounts, MF folios, insurance, EPF, NPS, demat
- Family members know location of all financial documents
- Annual review of beneficiary designations

## Your next level: Advanced wealth management

The next level covers:
- Structured products and alternative investments
- Tax loss harvesting and portfolio rebalancing
- International diversification
- Building passive income streams
- Retirement decumulation strategies

Complete the final quiz to earn your Personal Finance Intermediate certificate.',
7, 15, TRUE, FALSE);

END IF;

END $$;

-- Quizzes for first 3 PF Intermediate lessons
DO $$
DECLARE
  l1 UUID; l2 UUID; l3 UUID;
  q1 UUID; q2 UUID; q3 UUID;
BEGIN
  SELECT id INTO l1 FROM lessons WHERE slug = 'income-tax-planning';
  SELECT id INTO l2 FROM lessons WHERE slug = 'epf-deep-dive';
  SELECT id INTO l3 FROM lessons WHERE slug = 'nps-national-pension-system';

  IF l1 IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM quizzes WHERE lesson_id = l1
  ) THEN
    -- Run quiz inserts only when the first quiz has not already been seeded.
  INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l1, 'Tax Planning', 70) RETURNING id INTO q1;
  INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
  (q1, 'What is the maximum tax deduction available under Section 80C?',
  '["â‚¹50,000", "â‚¹1,00,000", "â‚¹1,50,000", "â‚¹2,00,000"]',
  2, 'Section 80C allows deductions up to â‚¹1,50,000 per year. Eligible investments include EPF contributions, PPF, ELSS, NSC, home loan principal repayment, life insurance premiums, and children''s tuition fees.', 1),
  (q1, 'Which is the correct description of Section 80CCD(1B)?',
  '["An additional â‚¹1.5L deduction for ELSS investments", "An additional â‚¹50,000 deduction for NPS investments, separate from the 80C limit", "The deduction for home loan interest", "The deduction for health insurance premiums"]',
  1, 'Section 80CCD(1B) provides an additional â‚¹50,000 deduction specifically for NPS contributions â€” completely separate from and in addition to the â‚¹1.5L 80C limit. This means total potential deduction is â‚¹2L (â‚¹1.5L + â‚¹50K).', 2),
  (q1, 'A person in the 30% tax bracket maximises both 80C (â‚¹1.5L) and 80CCD(â‚¹50K). How much income tax do they save annually?',
  '["â‚¹30,000", "â‚¹45,000", "â‚¹60,000", "â‚¹75,000"]',
  2, 'â‚¹2,00,000 total deductions Ã— 30% tax rate = â‚¹60,000 tax saved. Additionally, 4% cess is not applicable on deductions, making the actual saving slightly different, but â‚¹60,000 is the base calculation.', 3);

  INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l2, 'EPF Deep Dive', 70) RETURNING id INTO q2;
  INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
  (q2, 'What does EEE status mean for EPF?',
  '["Only the contribution is tax-exempt", "Contribution, interest, and maturity are all tax-exempt â€” triple tax exemption", "Only the maturity amount is tax-free", "EPF has no tax benefits"]',
  1, 'EPF has EEE (Exempt-Exempt-Exempt) status: contributions are tax-deductible under 80C (Exempt), interest earned is tax-free (Exempt), and the maturity amount is tax-free after 5 years of continuous service (Exempt). This triple benefit makes EPF extremely tax-efficient.', 1),
  (q2, 'What is VPF and why might it be attractive?',
  '["Variable Pension Fund â€” a risky investment", "Voluntary Provident Fund â€” additional EPF contributions at the same 8.25% tax-free rate, a very competitive return", "Virtual Provident Fund â€” an online EPF account", "Venture Portfolio Fund â€” equity investments through EPF"]',
  1, 'VPF allows you to voluntarily contribute more than the mandatory 12% to EPF. It earns the same 8.25% interest (tax-free) as regular EPF. For someone in the 30% tax bracket, 8.25% tax-free equates to approximately 11.8% pre-tax return â€” very hard to beat risk-free.', 2),
  (q2, 'When is EPF withdrawal fully tax-free?',
  '["Always â€” EPF is always tax-free on withdrawal", "After 5 years of continuous service", "After 10 years of service", "Only at age 60"]',
  1, 'EPF withdrawal is tax-free only after 5 years of continuous service. If you withdraw before 5 years, the entire amount (contribution + employer contribution + interest) becomes taxable. This is why changing jobs frequently and withdrawing EPF is financially costly.', 3);

  INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l3, 'NPS Guide', 70) RETURNING id INTO q3;
  INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
  (q3, 'What happens to NPS at maturity (age 60)?',
  '["The entire amount is received tax-free", "60% can be withdrawn tax-free; 40% must be used to buy an annuity (monthly pension), which is taxable", "The entire amount must be converted to annuity", "NPS auto-converts to EPF at age 60"]',
  1, 'At NPS maturity, 60% of the corpus can be withdrawn as a lump sum (tax-free). The remaining 40% must mandatorily be used to purchase an annuity â€” a monthly pension for life. This annuity income is fully taxable as per your income slab.', 1),
  (q3, 'What is the main tax advantage of NPS Tier 1?',
  '["Returns are tax-free like PPF", "An additional â‚¹50,000 deduction under 80CCD(1B) beyond the 80C limit", "NPS has no tax advantages", "All NPS withdrawals are tax-free"]',
  1, 'NPS Tier 1 qualifies for an additional â‚¹50,000 deduction under Section 80CCD(1B) â€” completely separate from and in addition to the â‚¹1.5L Section 80C limit. This is the primary reason to open NPS, especially for those in the 20-30% tax bracket.', 2),
  (q3, 'What is the difference between NPS Active Choice and Auto Choice?',
  '["Active choice is for experts; Auto choice for beginners â€” both give same returns", "Active choice lets you decide equity/debt allocation annually; Auto choice automatically reduces equity as you age", "Active choice means more frequent trading; Auto choice is passive", "There is no practical difference"]',
  1, 'Active choice gives you control over allocation between equity (E), corporate bonds (C), and government securities (G). Auto choice (Lifecycle Fund) automatically shifts from higher equity in youth to higher debt as you approach retirement â€” suitable for investors who don''t want to actively manage allocation.', 3);
  END IF;
END $$;


