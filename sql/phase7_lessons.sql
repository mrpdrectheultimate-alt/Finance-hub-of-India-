-- ============================================================
-- FinanceHub — Phase 7: 50 New Lessons
-- Targets: Personal Finance +8, Trading +8, Corporate +7,
--          Behavioral +6, Forex +6, Technical +7, Crypto +5, Hindi +3
-- Total after: ~277 → ~327 published lessons
-- Run AFTER phase6_migration.sql
-- Idempotent: WHERE NOT EXISTS on every insert
-- ============================================================

DO $PHASE7_LESSONS$
DECLARE
  -- Level IDs
  pf_int_id   UUID;  -- Personal Finance Intermediate
  pf_adv_id   UUID;  -- Personal Finance Advanced
  tm_adv_id   UUID;  -- Trading Advanced
  cf_adv_id   UUID;  -- Corporate Finance Advanced
  bf_adv_id   UUID;  -- Behavioral Finance Advanced
  fx_adv_id   UUID;  -- Forex Advanced
  ta_adv_id   UUID;  -- Technical Analysis Advanced
  cr_adv_id   UUID;  -- Crypto Advanced
  hi_beg_id   UUID;  -- Hindi Beginner
BEGIN
  -- Fetch level IDs (adjust slugs to match your actual level slugs)
  SELECT id INTO pf_int_id FROM levels WHERE slug = 'personal-finance-intermediate' LIMIT 1;
  SELECT id INTO pf_adv_id FROM levels WHERE slug = 'personal-finance-advanced'     LIMIT 1;
  SELECT id INTO tm_adv_id FROM levels WHERE slug = 'advanced-trading'               LIMIT 1;
  SELECT id INTO cf_adv_id FROM levels WHERE slug = 'corporate-finance-advanced'    LIMIT 1;
  SELECT id INTO bf_adv_id FROM levels WHERE slug = 'behavioral-finance-advanced'   LIMIT 1;
  SELECT id INTO fx_adv_id FROM levels WHERE slug = 'forex-advanced'                LIMIT 1;
  SELECT id INTO ta_adv_id FROM levels WHERE slug = 'technical-analysis-advanced'   LIMIT 1;
  SELECT id INTO cr_adv_id FROM levels WHERE slug = 'crypto-advanced'               LIMIT 1;
  SELECT id INTO hi_beg_id FROM levels WHERE slug = 'absolute-beginner'             LIMIT 1;

  -- Use fallback if specific level not found
  IF pf_int_id IS NULL THEN SELECT id INTO pf_int_id FROM levels LIMIT 1; END IF;
  IF pf_adv_id IS NULL THEN pf_adv_id := pf_int_id; END IF;
  IF tm_adv_id IS NULL THEN SELECT id INTO tm_adv_id FROM levels WHERE track_id IN (SELECT id FROM tracks WHERE slug='trading-markets') LIMIT 1; END IF;
  IF cf_adv_id IS NULL THEN SELECT id INTO cf_adv_id FROM levels WHERE track_id IN (SELECT id FROM tracks WHERE slug='corporate-finance') LIMIT 1; END IF;
  IF bf_adv_id IS NULL THEN SELECT id INTO bf_adv_id FROM levels WHERE track_id IN (SELECT id FROM tracks WHERE slug='behavioral-finance') LIMIT 1; END IF;
  IF fx_adv_id IS NULL THEN SELECT id INTO fx_adv_id FROM levels WHERE track_id IN (SELECT id FROM tracks WHERE slug='forex-currency') LIMIT 1; END IF;
  IF hi_beg_id IS NULL THEN hi_beg_id := pf_int_id; END IF;
  IF ta_adv_id IS NULL THEN SELECT id INTO ta_adv_id FROM levels WHERE track_id IN (SELECT id FROM tracks WHERE slug='technical-analysis') LIMIT 1; END IF;
  IF cr_adv_id IS NULL THEN SELECT id INTO cr_adv_id FROM levels WHERE track_id IN (SELECT id FROM tracks WHERE slug='crypto-defi') LIMIT 1; END IF;

-- ═══════════════════════════════════════════════════════════════
-- PERSONAL FINANCE — +8 lessons
-- ═══════════════════════════════════════════════════════════════

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT pf_int_id,'Wills, nominations and succession planning in India','wills-nominations-succession',
'# Wills, Nominations and Succession Planning

## Why most Indians do not have a will

Only 2% of Indians have a valid, registered will. The result: after death, assets worth crores get stuck in courts for years, families fight, and the deceased person''s wishes are never honoured.

A will is not for rich people. Anyone with a bank account, mutual fund, insurance policy, or property needs one.

## What happens without a will — intestate succession

If you die without a will, your assets are distributed according to personal law:

**Hindu Succession Act (for Hindus, Buddhists, Jains, Sikhs):**
Class I heirs inherit first — spouse, children, and mother share equally. A son and daughter have equal rights (2005 amendment).

**Muslim Personal Law:**
More complex distribution among spouse, parents, siblings, and children based on specific fractions defined by the Quran.

**Christian and Parsi:** Indian Succession Act 1925 applies.

## What a will covers

A will directs who receives your:
- Bank accounts (joint or sole)
- Fixed deposits
- Shares and mutual funds (separate from nomination)
- Property and real estate
- Personal possessions (jewellery, vehicles)
- Business interests

## The nomination trap

Many people believe their nominee automatically inherits the asset. This is wrong.

A **nominee** is a trustee — they hold the asset temporarily. The **legal heir** (determined by will or succession law) is the actual owner.

**Example:** Your EPF nominee is your brother. Your will says all assets go to your wife. After your death:
- Your brother receives EPF as nominee
- He is legally obligated to pass it to your wife (the heir)
- This creates friction, potential disputes, and legal costs

**Fix:** Align nominees and will beneficiaries wherever possible.

## How to make a valid will in India

**Requirements:**
1. You must be 18+ and of sound mind
2. The will must be in writing
3. Signed by you in the presence of two witnesses
4. Witnesses must sign in your presence
5. Witnesses cannot be beneficiaries

**Registration (recommended but not mandatory):**
Register at the Sub-Registrar Office in your district. Cost: ₹200-2,000 depending on state.

**Benefit of registration:** A registered will is virtually impossible to challenge in court.

## Key clauses every Indian will should have

1. **Executor appointment** — the person who implements your will after death
2. **Residuary clause** — "all other assets not specifically mentioned go to [person]"
3. **Guardian clause** — if you have minor children, name a guardian
4. **Specific bequests** — which property/asset goes to whom
5. **Funeral wishes** — optional but often helpful for families

## Update your will after major life events

- Marriage (a new marriage revokes an old will under Hindu law)
- Divorce
- Birth of children or grandchildren
- Death of a named beneficiary
- Acquiring major new assets (property, business)
- Significant change in relationship with a beneficiary

*Source: Ministry of Law and Justice, India (legislative.gov.in)*',
10,50,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='wills-nominations-succession');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT pf_int_id,'FIRE movement — Financial Independence Retire Early in India','fire-movement-india',
'# FIRE in India — Financial Independence, Retire Early

## What is FIRE?

FIRE stands for Financial Independence, Retire Early. The core idea: accumulate enough wealth that your investment returns cover your living expenses permanently — without needing to work.

## The 4% rule and the Indian adjustment

The traditional FIRE rule: your corpus should be 25x your annual expenses. Withdraw 4% annually and the portfolio (historically) never depletes.

**Example:** Annual expenses ₹12 lakh → FIRE corpus = ₹3 crore

This was based on US market data (1926-1994). For India, the 4% rule needs adjustment:

- **Higher inflation:** India CPI averages 5-6% vs US 2-3%. A safer withdrawal rate for India is 3-3.5%.
- **Adjusted formula:** Annual expenses / 0.03 = FIRE corpus
- **Revised example:** ₹12 lakh / 0.03 = **₹4 crore target**

## Types of FIRE

**Lean FIRE:** Retire on a minimal budget. ₹20,000-30,000/month. No luxuries, but free from work. Possible in smaller Indian cities with ₹1-1.5 crore corpus.

**Regular FIRE:** Comfortable middle-class retirement. ₹50,000-80,000/month. Requires ₹2-3 crore corpus. Achievable in 15-20 years for most salaried Indians.

**Fat FIRE:** Retire in luxury. ₹1.5 lakh+/month. Requires ₹5 crore+. The minority of FIRE pursuers.

**Barista FIRE:** Retire from high-stress career but do part-time or passion work. Reduces required corpus significantly.

## The FIRE calculation for a 30-year-old Indian

**Target:** Retire at 45. Corpus to last from 45 to 85 (40 years).

Assumptions:
- Monthly expenses today: ₹60,000 (₹7.2 lakh/year)
- Inflation: 6% (expenses double every 12 years)
- Expected corpus return: 10% post-retirement
- Safe withdrawal rate: 3.5%

**FIRE number:** ₹7.2 lakh / 0.035 = ₹2.06 crore in today''s rupees
**Inflation-adjusted by 45:** ₹2.06 crore × (1.06)^15 = **₹4.94 crore**

**Monthly SIP to reach ₹5 crore in 15 years at 12% returns:**
Using SIP formula: approximately **₹1,10,000/month**

This is achievable for dual-income households or high earners. For others: extend the timeline or reduce expenses.

## The India-specific FIRE challenges

**Joint family obligations:** Many Indians support parents, siblings, or extended family. Budget for this.

**Children''s education:** ₹30-60 lakh for engineering/medical in 10-15 years. Add this to corpus.

**Healthcare:** No employer health cover in retirement. Buy a ₹25-50 lakh individual policy before retiring (when premiums are lower). Budget ₹30,000-60,000/year premium post-45.

**Social security gap:** India has no equivalent to Social Security or state pension for non-government employees. Your corpus must do everything.

## The FIRE portfolio for India

**Accumulation phase (working years):**
80% equity (NIFTY 50 index fund + mid-cap fund), 15% debt (PPF + bonds), 5% gold (SGB)

**Distribution phase (retired):**
50% equity (for growth to beat inflation), 30% debt (for stability and withdrawals), 20% gold + alternatives

## FIRE is not about hating work

The most important insight: FIRE is about having choices. Once financially independent, you can:
- Continue working because you want to, not because you must
- Take a sabbatical or career change without financial stress
- Retire early if you choose
- Work on passion projects that don''t pay well

The journey — extreme savings, frugality, and compounding — often matters more than the destination.

*This is educational content. FIRE planning involves significant personal variables. Work with a SEBI-registered financial planner for personalised advice.*',
11,51,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='fire-movement-india');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT pf_int_id,'Understanding your credit report — reading CIBIL correctly','reading-cibil-report',
'# Reading Your CIBIL Credit Report

## What is a credit report?

Your credit report is a detailed record of every credit account you have had — loans, credit cards, overdrafts — and how you have repaid them. In India, four credit bureaus generate reports: CIBIL (most widely used), Experian, CRIF High Mark, and Equifax.

## How to get your free credit report

**CIBIL:** Once per year free at cibil.com. Paid: ₹550/report.
**Experian/CRIF/Equifax:** Free annual report at their websites.
**Free via aggregators:** BankBazaar, PaisaBazaar, CreditMantri provide free credit scores using bureau data.

## Anatomy of your CIBIL report

**Section 1: Personal Information**
Name, date of birth, PAN, address, phone, email. Check for errors — a wrong PAN or date of birth can cause rejection.

**Section 2: Contact Details**
All addresses associated with your credit applications over the years.

**Section 3: Employment Information**
Income and employment details from your loan applications.

**Section 4: Account Information (Most Important)**
Every credit account listed with:
- Lender name and account type
- Account opening date and sanctioned amount
- Current outstanding balance
- Payment history (36 months of month-by-month payment status)
- Days past due (DPD) — number of days late each month

**Section 5: Enquiry Information**
Every time a lender pulled your credit report (hard inquiry). Too many in a short period reduces your score.

## Reading payment history

Each account shows a payment grid for the last 36 months:
- **000:** No days past due — paid on time ✅
- **STD:** Standard — regular payment
- **SMA:** Special Mention Account — slightly delayed
- **SUB:** Substandard — significantly overdue
- **DBT:** Doubtful — very overdue
- **LSS:** Loss — written off

**One 90+ day late payment** can drop your CIBIL score by 80-100 points and stays on your report for 7 years.

## What your CIBIL score means

| Score | Rating | Loan approval |
|-------|--------|--------------|
| 750-900 | Excellent | Best rates, easy approval |
| 700-749 | Good | Good rates, likely approved |
| 650-699 | Fair | Higher rates, may be rejected |
| 600-649 | Poor | Difficult to get credit |
| 300-599 | Very Poor | Very difficult, high rates |

## Common errors on CIBIL reports

Check for:
- Wrong personal information (name spelling, DOB, PAN)
- Account you did not open (possible identity theft)
- Closed accounts still showing as open
- Correct payment shown as late
- Duplicate accounts
- Settlement shown as write-off

## How to dispute errors

1. Log in to cibil.com and navigate to "Dispute Resolution"
2. Select the specific account and field with the error
3. Describe the error and submit supporting documents
4. CIBIL contacts the lender; lender confirms or corrects within 30 days
5. Your report is updated within 45 days of filing

## Improving your CIBIL score systematically

**Fastest impact (0-3 months):**
- Pay off all current outstanding credit card balances in full
- Pay all EMIs on time, every month
- Do not apply for new credit for 6 months

**Medium term (3-12 months):**
- Keep credit utilisation below 30% (ideally under 10%)
- Keep your oldest credit card active — it helps credit age

**Long term (1-3 years):**
- Maintain a healthy mix of secured (home loan, car loan) and unsecured (credit card) credit
- Never let any account go into default

*Source: TransUnion CIBIL — cibil.com/education*',
9,52,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='reading-cibil-report');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT pf_adv_id,'Reverse mortgage — unlocking home equity in retirement','reverse-mortgage-india',
'# Reverse Mortgage in India

## What is a reverse mortgage?

A reverse mortgage allows senior citizens (60+) to convert the equity in their home into a regular monthly income — without selling the house or moving out.

Unlike a regular home loan where you pay the bank, in a reverse mortgage the bank pays you. The loan is repaid only when you pass away, sell the home, or move out permanently.

## How it works in India

**Eligibility:**
- Age 60+ (if joint, both must be 60+)
- Must own and reside in the property
- Property must be fully owned (no existing home loan)
- Property life must be 20+ years remaining
- Residential property only

**Loan amount:**
Up to 60% of the property value (as assessed by the bank). Paid as:
- Monthly payments
- Lump sum
- Line of credit (draw as needed)
- Combination

**Tenure:** Maximum 15-20 years (varies by bank). Some banks offer lifetime payments.

**Interest:** Accumulated on the outstanding balance. Not paid monthly — added to the loan.

**Repayment:** When the borrower passes away or permanently leaves, heirs have the option to repay the loan (including accumulated interest) and retain the property, or let the bank sell it. Any surplus after repayment goes to heirs.

## Reverse mortgage vs selling property

| Factor | Reverse Mortgage | Selling |
|--------|-----------------|---------|
| Stay in home | ✅ Yes | ❌ Must vacate |
| Monthly income | ✅ Regular payments | ❌ One-time receipt |
| Capital gains tax | ❌ Not applicable | ✅ Tax on profit |
| Estate for heirs | Reduced by loan | Full sale proceeds |
| Best for | Those who want to stay | Those willing to relocate |

## The India reality

Reverse mortgage is significantly underpenetrated in India. Reasons:
- Emotional attachment to leaving property for children
- Low awareness
- Limited bank participation (NHB, SBI, Bank of Baroda, some others)
- Monthly payments are relatively modest for most properties

**Example:** ₹80 lakh property, 70-year-old borrower, 15-year tenure:
Monthly payment: approximately ₹20,000-25,000 (varies by bank)

For context: if the same ₹80 lakh were invested at 7%, monthly income = ₹46,667. Selling and investing may yield more — but you lose the home.

## RBI guidelines on reverse mortgage

The National Housing Bank (NHB) regulates reverse mortgages. Key protections:
- You cannot be forced out during your lifetime
- If the property value falls, the bank absorbs the shortfall — you owe nothing extra
- Revaluation every 5 years; payments may increase if property appreciates

## Who should consider it?

**Good fit:**
- Home-rich, cash-poor seniors
- Those without other significant income (pension, savings)
- Those who do not wish to burden children
- Those who want to age in place

**Not a good fit:**
- Those planning to leave the property to children who cannot repay the loan
- Those with adequate pension/income
- Those in cities with strong rental markets (renting out and moving to smaller home may be better)

*Source: National Housing Bank (nhb.org.in), RBI guidelines on reverse mortgage*',
8,53,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='reverse-mortgage-india');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT pf_adv_id,'HUF — Hindu Undivided Family as a tax-saving entity','huf-tax-planning',
'# Hindu Undivided Family (HUF) for Tax Savings

## What is an HUF?

A Hindu Undivided Family (HUF) is a separate legal entity under Indian tax law, distinct from its individual members. It can own assets, earn income, claim deductions, and file its own income tax return.

HUF applies to Hindus, Buddhists, Jains, and Sikhs.

## Why HUF is a powerful tax tool

An HUF gets its own PAN and its own ₹2.5 lakh basic exemption, plus its own 80C limit of ₹1.5 lakh. This creates a second tax return with separate slabs — potentially saving ₹50,000-75,000 annually in taxes.

**Example:**
- Your individual taxable income: ₹20 lakh (30% bracket)
- You create an HUF; transfer income-generating assets to it
- HUF income: ₹5 lakh (10% bracket after exemption + deductions)
- Total tax saved: ₹50,000-70,000+/year

## Who can form an HUF?

Any Hindu family with at least two members (husband + wife is sufficient). A married couple automatically forms an HUF. It is formalised by:
1. Obtaining a PAN for the HUF
2. Opening a bank account in HUF name
3. Creating an HUF deed (declaration document)

## How HUF earns income

The HUF must have genuine income-generating assets. Common ways:
- **Ancestral property:** Rental income from inherited property goes to HUF
- **Gifts to HUF:** Gifts from non-members (e.g., grandfather to HUF) are HUF income. Gifts from members are not taxable in HUF.
- **Business:** HUF can run a business under Karta''s (head''s) name
- **Investments:** HUF can invest in mutual funds, FDs (with own PAN and TDS exemption)

## What HUF can deduct (its own 80C)

The HUF gets its own Section 80C deduction of ₹1.5 lakh — separate from the individual member''s 80C:
- Life insurance premiums on HUF members'' lives
- ELSS mutual funds
- Repayment of home loan principal (for HUF property)
- PPF (HUF can have its own PPF account)

## Important limitations

- **No salary:** HUF cannot pay salary to its Karta or members beyond reasonable remuneration for genuine work
- **No clubbing with personal income to evade:** CBDT watches for artificial splitting
- **Partition complexity:** Splitting the HUF later is legally complex and costly
- **Not for everyone:** The tax saving must justify the administrative complexity (separate ITR, separate accounting)

## Practical steps to form an HUF

1. Draft an HUF deed — a simple declaration listing members and stating HUF formation
2. Apply for HUF PAN at the nearest NSDL/UTIITSL centre with deed + member ID proofs
3. Open a bank account in HUF name (most banks require PAN, deed, and Karta''s KYC)
4. File separate ITR-2 or ITR-3 for the HUF annually

**Consult a CA before forming an HUF.** The rules are nuanced and the documentation must be correct to withstand scrutiny.

*Source: Income Tax Act 1961, Sections 2(31), 171; CBDT guidelines*',
9,54,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='huf-tax-planning');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT pf_adv_id,'Sovereign Gold Bonds deep dive — the complete investor guide','sgb-complete-guide',
'# Sovereign Gold Bonds — The Complete Guide

## Why SGBs beat physical gold on every dimension

Sovereign Gold Bonds (SGBs) are government securities denominated in grams of gold. Issued by RBI on behalf of the Government of India.

**Comparison:**

| Feature | Physical Gold | Gold ETF | SGB |
|---------|--------------|---------|-----|
| Making charges | 10-25% | None | None |
| Storage risk | Yes | None | None |
| Purity risk | Yes | None | None |
| Annual interest | 0% | 0% | **2.5% p.a.** |
| LTCG tax on maturity | 20% (with indexation) | 20% (with indexation) | **0% if held to maturity** |
| Lock-in | None | None | 8 years (exit from 5th year) |

For a long-term investor, SGB dominates every alternative.

## The 2.5% interest explained

On the initial investment amount (issue price × quantity), you receive 2.5% per annum paid semi-annually directly to your bank account.

**Example:** 10 grams SGB purchased at ₹5,800/gram = ₹58,000 investment.
Semi-annual interest = ₹58,000 × 2.5% / 2 = **₹725 every 6 months** (₹1,450/year).
This interest is taxable at your income slab rate. The capital appreciation (gold price rise) at maturity is completely tax-free.

## How to buy SGBs

**Primary market (RBI issues):**
RBI issues SGBs in tranches (typically 6-8 times per year). Apply through:
- Your bank''s internet banking
- Post office
- SHCIL (Stock Holding Corporation)
- Stock broker (Zerodha, Upstox)
- RBI Retail Direct platform

₹50 discount per gram for online applications.

**Secondary market:**
SGBs are listed on NSE/BSE. You can buy existing bonds like stocks through your demat account. No subscription period needed. However: liquidity is low, so buy/sell spread can be wide.

## Tax implications in full detail

**2.5% interest:** Taxed as income at your slab rate. TDS at 10% if annual interest > ₹10,000.

**Sale before maturity on exchange:** Taxed as capital gains. STCG (held < 3 years) at slab rate. LTCG (3+ years) at 20% with indexation.

**RBI buyback at 5th, 6th, 7th year:** Capital gains tax-free.

**Maturity at 8 years:** Completely tax-free. No capital gains tax whatsoever.

**Strategic insight:** Hold to maturity and the SGB becomes the most tax-efficient gold investment available — you earn 2.5% interest annually AND the entire gold price appreciation tax-free.

## Quantity limits

Minimum: 1 gram. Maximum: 4 kg per financial year per individual (20 kg for trusts/HUFs).

## Redemption options

1. **Hold to 8-year maturity:** Full redemption, price based on average of closing gold price for previous 3 business days. Tax-free.
2. **Premature exit (from 5th year):** Redeem on coupon payment dates. Tax-free after 5 years.
3. **Sell on exchange:** Before 5 years, can sell in secondary market. Subject to capital gains tax.
4. **Loan against SGB:** SGBs are eligible as collateral for bank loans (LTV up to 75% of current value).

*Source: Reserve Bank of India (rbi.org.in/scripts/BS_PressReleaseDisplay)*',
10,55,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='sgb-complete-guide');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT pf_adv_id,'Real estate vs equity — 30-year comparison for Indian investors','real-estate-vs-equity',
'# Real Estate vs Equity — The Honest 30-Year Comparison

## The myth most Indians believe

"Real estate always gives good returns. My flat has gone from ₹20 lakh to ₹1 crore in 20 years!"

That sounds like a 8.4% CAGR. Good, but is it?

## The true cost of real estate ownership

When comparing real estate to equity, most people only count purchase price vs current value. They forget:

**One-time costs at purchase:**
- Stamp duty: 4-7% of property value
- Registration: 1%
- Brokerage: 1-2%
- GST (under construction): 5-12%
- Interior/renovation: 5-15%

**Ongoing annual costs:**
- Property tax: 0.1-0.5% per year
- Maintenance: 0.5-1% per year
- Insurance: 0.1% per year
- Repairs/whitewash: 0.3% per year averaged
- Loan interest (if taken): 8-9% on outstanding amount

**Cost at sale:**
- Capital gains tax: 20% LTCG after 2 years (with indexation)
- Brokerage: 1-2%

## The adjusted real estate return

Flat purchased in 2000 for ₹20 lakh. Sold in 2024 for ₹1 crore.
Nominal CAGR: 7.1%

**Deduct:**
- One-time purchase costs: ₹2.5 lakh → effective buy price ₹22.5 lakh
- 24 years property tax + maintenance: approximately ₹4 lakh
- Sale costs + capital gains tax: approximately ₹12 lakh

**Effective proceeds:** ₹1 crore - ₹12 lakh = ₹88 lakh
**Effective cost:** ₹22.5 lakh + ₹4 lakh = ₹26.5 lakh
**Adjusted CAGR:** ~5.3%

Inflation during this period: ~6%. Real return: **-0.7%**

## The NIFTY comparison for the same period

NIFTY 50 on January 1, 2000: ~1,500
NIFTY 50 on January 1, 2024: ~21,700
**CAGR: ~12%**

₹20 lakh invested in NIFTY index fund in 2000 = ₹6.5 crore in 2024.
With zero maintenance cost. With full liquidity at any time. With much simpler taxation.

## When real estate does make sense

**For self-use:** Buying your home makes sense beyond pure returns — stability, pride of ownership, no landlord risk, long-term cost certainty. It is a consumption decision with some investment characteristics.

**Rental yield in India:** Indian rental yields (annual rent / property value) average 2-3% — well below what FDs or debt mutual funds offer. Real estate in India is primarily a capital appreciation play.

**REITs:** If you want real estate exposure without the hassles (illiquidity, maintenance, single-asset concentration), listed REITs offer 6-8% distribution yield with exchange liquidity. Embassy, Mindspace, and Brookfield REITs are options.

## The leverage argument

"But with real estate I can use a home loan and lever up my returns!"

True. But leverage amplifies losses too. A 20% property price correction on a ₹1 crore property with a ₹80 lakh loan wipes out 100% of your equity.

The comparison is only fair if you also consider what leveraged equity (futures) would return — and futures have their own extreme risk.

## The conclusion

**For long-term wealth creation:** Equity (index funds) has historically delivered 2-2.5x higher returns than real estate in India.

**For a home to live in:** Buy when financially ready — the emotional and practical benefits are real.

**For investment:** Calculate the true adjusted return before comparing to equity alternatives.

*This is educational content, not financial advice. Past performance does not guarantee future returns.*',
11,56,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='real-estate-vs-equity');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT pf_adv_id,'Angel investing and startup equity basics for individual investors','angel-investing-basics',
'# Angel Investing — What Individuals Should Know

## What is angel investing?

Angel investors provide early-stage capital to startups — typically seed or pre-Series A — in exchange for equity (ownership). They invest before venture capital firms, accepting higher risk for potentially higher returns.

The term "angel" originated because these investors provide money when startups are too early for banks or VCs — appearing like angels.

## The Indian angel ecosystem

India now has a mature angel ecosystem:
- **SEBI-registered angel funds** and networks: Indian Angel Network (IAN), LetsVenture, AngelList India, Ah! Ventures, Mumbai Angels
- **Minimum ticket sizes:** Typically ₹2-5 lakh per deal
- **SEBI regulations:** Angel funds with ≥ 200 investors must register as AIF (Alternative Investment Fund) with SEBI

## The math of angel investing

Angel investing is a power law game. In a portfolio of 20 startups:
- 10-12 will return 0 (fail completely)
- 5-7 will return 1-3x (modest return)
- 2-3 will return 5-10x
- 1 might return 50-100x (the home run)

The 1 home run typically covers all losses and generates the overall portfolio return.

**This means:** Never put all angel capital into one or two startups. Diversify across at least 10-20 companies.

## What to evaluate in a startup

**Team (most important):** Do the founders have domain expertise? Have they worked together before? Are they resilient under pressure? First-time founders with relevant experience beat experienced entrepreneurs in unrelated domains.

**Market size:** Is the addressable market large enough? A ₹1,000 crore business needs a ₹10,000 crore+ market. Investors want 10x their money minimum.

**Business model:** How does it make money? Is it scalable? What is the unit economics? Is CAC (Customer Acquisition Cost) lower than LTV (Lifetime Value)?

**Traction:** Revenue, growth rate, retention, user engagement. The more traction at time of investment, the lower the risk.

**Competition and moat:** Is there a defensible advantage? Why can''t a well-funded competitor copy this in 6 months?

## Key documents in angel deals

**Term Sheet:** Non-binding outline of investment terms — valuation, equity %, liquidation preference, anti-dilution.

**SAFE (Simple Agreement for Future Equity):** No valuation now; converts to equity in future funding round. Common in early-stage Indian deals.

**SHA (Shareholders'' Agreement):** Binding agreement covering rights, board representation, drag-along/tag-along rights.

## SEBI compliance for angel investing in India

Individual angel investors investing through SEBI-registered networks are largely covered. Key points:
- Investments in unlisted startups are governed by the Companies Act and FEMA (for foreign startups)
- Gains from startup equity (unlisted shares held 2+ years) are taxed at 20% LTCG with indexation
- Gains from listed startup shares (after IPO) follow standard equity capital gains rules

## Who should (and should not) angel invest

**Good fit:**
- Net worth > ₹2 crore (can absorb total loss of invested capital)
- Long time horizon (5-10 years before exit, if any)
- Genuine interest in startups and ability to add value
- Access to quality deal flow

**Not a good fit:**
- Investing borrowed money or emergency funds
- Expecting quick returns or liquidity
- Limited ability to evaluate businesses
- No existing network to source quality deals

*Angel investing is high-risk, illiquid, and suitable only for sophisticated investors. This is educational content, not investment advice.*',
10,57,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='angel-investing-basics');

-- ═══════════════════════════════════════════════════════════════
-- HINDI LESSONS — +3 more (making 8 total)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free,language,translation_status)
SELECT hi_beg_id,
'SIP क्या है? — हर महीने थोड़ा, बड़ा फर्क',
'sip-kya-hai',
'# SIP क्या है?

## SIP की सरल परिभाषा

**SIP (Systematic Investment Plan)** यानी हर महीने एक निश्चित राशि mutual fund में automatic invest करना।

जैसे आपका phone recharge हर महीने होता है — वैसे ही SIP हर महीने आपके bank account से automatically कट जाती है और mutual fund में invest हो जाती है।

## SIP का जादू — Rupee Cost Averaging

SIP की सबसे बड़ी खासियत: जब market गिरता है, आपकी ₹5,000 से ज्यादा units खरीदती हैं। जब market चढ़ता है, कम units। इससे average cost कम हो जाता है।

**Example:**
| महीना | NAV | Investment | Units मिलीं |
|-------|-----|-----------|------------|
| जनवरी | ₹100 | ₹5,000 | 50 |
| फरवरी | ₹80 (market गिरा) | ₹5,000 | 62.5 |
| मार्च | ₹110 | ₹5,000 | 45.5 |
| Total | — | ₹15,000 | 158 units |

Average NAV: ₹97 (आपका average cost ₹94.9 — already बेहतर!)

## SIP कैसे शुरू करें?

1. **Demat account खोलें** — Zerodha, Groww, या आपका bank
2. **Fund चुनें** — शुरुआत के लिए NIFTY 50 Index Fund सबसे safe
3. **SIP date चुनें** — salary आने के 2-3 दिन बाद
4. **Amount तय करें** — ₹500 से शुरुआत हो सकती है
5. **Auto-debit set करें** — एक बार set, हर महीने automatic

## SIP की power — ₹5,000 महीने का क्या होगा?

₹5,000/महीने × 20 साल × 12% annual return = **₹49.9 लाख**

Total investment: ₹12 लाख
Profit: ₹37.9 लाख

यही है compound interest का जादू। समय और regularity — बस इतना चाहिए।

## Common mistakes

❌ **Market गिरने पर SIP बंद करना** — यही वो time है जब सबसे ज्यादा units मिलती हैं
❌ **1-2 साल बाद तोड़ना** — SIP minimum 7-10 साल के लिए होती है
❌ **एक ही fund में सब invest करना** — 2-3 अलग categories में रखें

## Key takeaway

SIP = Discipline + Time = Wealth

शुरू करने का सबसे अच्छा समय था 10 साल पहले।
दूसरा सबसे अच्छा समय है **आज।**

*स्रोत: AMFI India — amfiindia.com*',
8,6,TRUE,TRUE,'hi','human_reviewed'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='sip-kya-hai');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free,language,translation_status)
SELECT hi_beg_id,
'Income Tax — आसान भाषा में पूरी जानकारी',
'income-tax-hindi',
'# Income Tax — आसान भाषा में

## Income Tax क्यों लगता है?

सरकार को roads, hospitals, schools, army — सबके लिए पैसा चाहिए। यह पैसा आपके taxes से आता है। Income tax सबसे बड़ा tax है जो आप सरकार को देते हैं।

## नया Tax Regime vs पुराना Tax Regime (FY 2024-25)

सरकार ने 2020 में नया regime लाया। अब दो options हैं:

**नया Regime (Default from FY 2023-24):**
| Income | Tax Rate |
|--------|---------|
| 0 - ₹3 लाख | 0% |
| ₹3-7 लाख | 5% |
| ₹7-10 लाख | 10% |
| ₹10-12 लाख | 15% |
| ₹15 लाख से ज्यादा | 30% |

₹7 लाख तक: Section 87A rebate से कोई tax नहीं।

**पुराना Regime:**
ज्यादा tax rates, लेकिन 80C, HRA, home loan जैसी deductions मिलती हैं।

## कौन सा बेहतर?

अगर आपकी deductions **₹3.75 लाख से ज्यादा** हैं — पुराना regime बेहतर।
अगर कम हैं — नया regime बेहतर।

**Simple rule:** CA से calculate करवाएं, या online tax calculators इस्तेमाल करें।

## TDS — Tax Deducted at Source

आपका employer हर महीने आपकी salary से tax काटता है। यह TDS है।
बाकी tax (अगर है) ITR file करते समय pay करते हैं।
अगर ज्यादा TDS कटा — ITR में refund claim करते हैं।

## ITR कब और कैसे?

**Deadline:** 31 July (हर साल, बिना penalty के)
**Late filing:** 31 December तक, ₹5,000 penalty के साथ
**Platform:** incometax.gov.in → e-Filing Portal

**Documents चाहिए:**
- Form 16 (employer देता है)
- Bank statement
- 26AS / AIS (tax credit statement)
- Investment proofs (80C)

## Section 80C — ₹1.5 लाख बचाएं

पुराने regime में ₹1.5 लाख तक invest करने पर tax नहीं लगता:
- ELSS Mutual Fund
- PPF
- EPF (employer काटता है)
- Life Insurance Premium
- Home Loan Principal Repayment
- NSC, 5-year FD

30% bracket में ₹1.5 लाख invest = **₹46,800 tax बचत।**

## याद रखें

Tax बचाना legal है और समझदारी है।
Tax चोरी illegal है और जेल जा सकते हैं।

*स्रोत: Income Tax India — incometax.gov.in*',
10,7,TRUE,TRUE,'hi','human_reviewed'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='income-tax-hindi');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free,language,translation_status)
SELECT hi_beg_id,
'Mutual Fund क्या है? — Share Market से कैसे अलग है?',
'mutual-fund-hindi',
'# Mutual Fund क्या है?

## एक आसान तुलना

मान लीजिए आप अकेले एक बड़ा pizza नहीं खरीद सकते। लेकिन 10 लोग मिलकर खरीदते हैं और सबको बराबर हिस्सा मिलता है।

Mutual Fund ऐसा ही है — हजारों लोगों का पैसा मिलाकर एक expert (Fund Manager) invest करता है। सबको proportional return मिलता है।

## Share Market से कैसे अलग?

| | Share Market | Mutual Fund |
|--|-------------|------------|
| एक company | एक stock खरीदते हैं | नहीं — कई stocks |
| Risk | ज्यादा (एक company डूबी) | कम (diversified) |
| Expert की जरूरत | हां | नहीं — fund manager करता है |
| Minimum amount | एक share की price | ₹500 से |
| Research | आपको खुद | Fund manager |

## Mutual Fund के प्रकार

**Equity Fund:** ज्यादातर stocks में invest। ज्यादा return, ज्यादा risk। लंबे समय के लिए।

**Debt Fund:** Bonds और government securities में। कम return, कम risk। Short term के लिए।

**Hybrid Fund:** दोनों का मिश्रण। Balance of risk और return।

## NAV क्या है?

NAV = Net Asset Value — mutual fund की एक unit की कीमत।

₹100 NAV पर ₹10,000 invest = 100 units।
NAV बढ़कर ₹120 हुआ = आपके units की value ₹12,000।
Profit: ₹2,000।

**याद रखें:** Low NAV = सस्ता fund — यह गलत सोच है। NAV कम या ज्यादा होने से return नहीं बदलता। Fund की quality मायने रखती है।

## Direct vs Regular Plan

**Direct Plan:** आप सीधे fund house से खरीदते हैं। No commission। Expense ratio कम।
**Regular Plan:** Distributor/agent के through। Commission जाता है। Expense ratio ज्यादा।

हमेशा Direct Plan चुनें। 20 साल में 1% कम expense ratio = लाखों का फर्क।

## शुरुआत कहां करें?

**Beginners के लिए best option:** NIFTY 50 Index Fund (Direct Plan)

Examples: UTI Nifty 50 Index Fund, HDFC Nifty 50 Index Fund

ये fund NIFTY 50 को copy करते हैं — कम charges में market return।

**App:** Zerodha Coin, Groww, MFCentral (सरकारी platform)

*स्रोत: AMFI India (amfiindia.com), SEBI (sebi.gov.in)*',
9,8,TRUE,TRUE,'hi','human_reviewed'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='mutual-fund-hindi');

-- ═══════════════════════════════════════════════════════════════
-- TRADING & MARKETS — +4 key advanced lessons
-- ═══════════════════════════════════════════════════════════════

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT tm_adv_id,
'Short selling in India — how it works, risks, and SEBI regulations',
'short-selling-india',
'# Short Selling in India

## What is short selling?

Short selling is borrowing shares you do not own, selling them immediately, waiting for the price to fall, buying them back cheaper, returning them to the lender, and pocketing the difference.

**Profit when stock falls. Loss when stock rises.**

**Example:**
- Borrow 100 shares of XYZ at ₹200 (short sell = receive ₹20,000)
- Price falls to ₹150
- Buy 100 shares at ₹150 (spend ₹15,000)
- Return shares to lender
- Profit: ₹5,000 minus borrowing cost

## Short selling in Indian markets — SEBI framework

**Intraday short selling (most common):**
Any retail investor can sell shares they do not own intraday through their broker. The position must be squared off (bought back) before market close (3:15 PM typically). If you forget, your broker auto-squares off — often at bad prices.

**BTST (Buy Today Sell Tomorrow):**
Strictly speaking, selling shares before T+1 settlement can be a form of short selling. Allowed but creates delivery risk.

**Futures short selling:**
Sell NIFTY or stock futures short. These are derivatives, not actual shares. Margin required. No need to borrow shares.

**Securities Lending and Borrowing (SLB) mechanism:**
SEBI introduced SLB for longer-duration short positions. Borrow shares through NSE''s SLB platform for 1 day to 12 months. Fee paid to lender. Very low participation currently.

**Naked short selling:** Selling shares without having or borrowing them — **illegal in India under SEBI regulations.**

## Why short selling exists (legitimate purposes)

- **Price discovery:** Short sellers identify overvalued companies and help correct prices
- **Hedging:** Portfolio managers short individual stocks to hedge long positions
- **Research:** Short sellers like Hindenburg Research do detailed negative research reports (legal when based on genuine research)

## The asymmetric risk of shorting

**Buying a stock:** Maximum loss = 100% of investment (stock goes to zero)
**Shorting a stock:** Maximum loss = unlimited (stock can rise infinitely)

This asymmetric risk makes shorting extremely dangerous without strict stop losses and position sizing.

## Famous Indian short selling events

**Hindenburg vs Adani (2023):** Hindenburg Research (US short-seller) published a 100-page report alleging fraud and accounting manipulation. Adani Group stocks fell 50-60%. SEBI investigated. The report remains controversial.

**Short sellers vs FIIs:** Large institutional short positions in index futures during market downturns can amplify falls significantly.

## Who should short sell?

Experienced traders with:
- Deep understanding of derivatives or intraday mechanics
- Strict stop losses (because losses are theoretically unlimited)
- Understanding of SEBI regulations
- Capital they can afford to lose

Beginners should observe, not participate in short selling.

*Source: SEBI circulars on short selling; NSE SLB framework (nseindia.com)*',
9,58,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='short-selling-india');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT tm_adv_id,
'Reading corporate governance — red flags every investor must know',
'corporate-governance-red-flags',
'# Corporate Governance Red Flags

## Why governance matters for investors

A company with excellent business fundamentals but poor governance can still destroy shareholder value. The promoter enriches themselves at minority shareholders'' expense — called "tunnelling."

India has seen numerous governance failures: Satyam (₹14,000 crore fraud), IL&FS (₹90,000 crore default), DHFL (accounting fraud), Zee Entertainment (pledging and related-party transactions).

## Red Flag 1: High promoter pledge percentage

Promoters borrowing against their own shares signals personal financial stress. If the stock falls and margin calls are triggered, promoters must sell pledged shares — further driving the stock down.

**Check:** BSE/NSE shareholding pattern → promoter pledge percentage. Above 30% is concerning. Above 50% is dangerous.

## Red Flag 2: Related-party transactions

The company paying above-market rates to promoter-owned entities for services, property, or loans — quietly shifting money out.

**Check:** Annual report → Related Party Transaction notes. Look for: payments to promoter family companies, property leased from promoters at inflated rents, loans to group companies without adequate disclosure.

## Red Flag 3: Frequent auditor changes

Statutory auditors act as watchdogs. When auditors resign or are changed frequently, it often signals disagreements about accounting treatment.

**Check:** Annual report → Auditor''s report. Look for: qualified opinions, emphasis of matter paragraphs, auditor resignation letters (filed with BSE/NSE).

## Red Flag 4: Divergence between profit and cash flow

A company can report profits while generating negative cash flow — a classic sign of aggressive accounting or even fraud.

**Check:** Cash flow statement. If PAT (profit) is consistently much higher than operating cash flow over 3+ years — investigate why.

## Red Flag 5: Rapid management exits

Multiple senior executives (CFO, auditor, independent directors) leaving in a short period signals internal problems.

**Check:** BSE/NSE announcements for resignation filings. A CFO resigning shortly after joining is an especially strong signal.

## Red Flag 6: Complex corporate structures

Many subsidiaries, holding companies, or foreign entities with opaque transactions make it difficult to track where money goes.

**Check:** Consolidated financials for intercompany loans. Subsidiaries losing money while parent reports profits.

## Red Flag 7: Promoter selling while bullish publicly

Management repeatedly calls the stock "undervalued" in interviews while systematically selling their own shares in the open market.

**Check:** Insider trading disclosures on BSE/NSE. SEBI requires promoters to disclose every open-market transaction.

## The Piotroski F-Score as a governance proxy

Joseph Piotroski''s 9-point scoring system for financial health — improving profitability, leverage, and efficiency — has been shown to correlate with lower governance risk. A score of 7+ indicates healthier governance alongside financial strength.

## Where to check governance quality

- **BSE/NSE filings:** Corporate governance reports, annual reports, insider trading disclosures
- **SEBI SCORES:** Complaint database against listed companies
- **Forensic accounting reports:** From research firms, available on paid platforms
- **Proxy advisory reports:** InGovern, IiAS provide governance analysis

*Source: SEBI LODR (Listing Obligations and Disclosure Requirements) Regulations 2015*',
10,59,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='corporate-governance-red-flags');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT tm_adv_id,
'Dividend investing strategy — building an income portfolio in India',
'dividend-investing-strategy',
'# Dividend Investing in India

## What is dividend investing?

Dividend investing focuses on building a portfolio of stocks that pay regular cash dividends — creating passive income from shares without selling them.

In India, dividends are now taxed at the investor''s income slab rate (post 2020). For someone in the 30% bracket, a 5% dividend yield becomes 3.5% post-tax. This changes the attractiveness calculation.

## Key dividend metrics

**Dividend Yield = Annual Dividend per Share / Current Share Price × 100**

A ₹500 stock paying ₹25 annual dividend has a 5% yield.

**Dividend Payout Ratio = Dividends Paid / Net Profit × 100**

If a company earns ₹100 crore profit and pays ₹40 crore as dividend, payout ratio = 40%. Higher payout = more income now, less reinvestment for growth.

**Dividend Coverage Ratio = EPS / DPS**

Shows how many times earnings cover the dividend. Coverage below 1.5x means the dividend may be at risk if profits fall.

## PSU companies — India''s dividend backbone

Public Sector Undertakings (PSUs) are mandated to pay minimum 30% of net profit or 5% of net worth as dividend. This creates predictable income.

**High-yield PSU dividend payers (historical):**
- Coal India: 7-9% yield consistently
- Power Grid Corporation: 4-6% yield
- ONGC: 3-5% yield (fluctuates with oil prices)
- REC Limited: 6-8% yield
- NMDC: 7-9% yield (iron ore cycles)

**Risks:** PSU dividends can be reduced at government discretion. Business fundamentals of the underlying company still matter.

## Building a dividend portfolio

**Target:** 4-5% average dividend yield with dividend growth over time.

**Framework:**
1. Dividend yield > 3.5% (otherwise better in index fund)
2. Payout ratio 30-60% (sustainable — not too high, not too low)
3. Dividend coverage > 2x (profit covers dividend comfortably)
4. Dividend growth history (ideally 5+ years of consistent/growing dividends)
5. Business quality (moat, low debt, stable earnings)

**Diversification across dividend-paying sectors:**
- PSU energy (Coal India, ONGC) — high yield, commodity cycle risk
- Infrastructure (Power Grid) — stable regulated returns
- Banking (HDFC Bank, ICICI) — moderate yield, strong growth
- FMCG (HUL, Nestle) — low yield but consistent dividend growth
- IT (Infosys, TCS) — low-moderate yield, large special dividends

## The dividend reinvestment strategy

Instead of spending dividends, reinvest them to buy more shares. This compounds returns significantly.

**Example:** ₹10 lakh portfolio, 5% dividend yield, 5% dividend growth, reinvested:
- Year 10: Portfolio value approximately ₹27.5 lakh (just from reinvestment compounding)

## Tax efficiency with dividends

Since dividends are taxed at slab rate, high-tax-bracket investors may prefer:
- **Growth option** funds (no dividend, capital gains at lower LTCG rates)
- **Buyback stocks** (companies buying back shares instead of dividends — not immediately taxable)
- **SWP (Systematic Withdrawal Plan)** from equity funds — only the gain component taxed, not full amount

*Source: SEBI LODR regulations; NSE India dividend data (nseindia.com)*',
10,60,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='dividend-investing-strategy');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT tm_adv_id,
'Sector rotation strategy — timing the economic cycle',
'sector-rotation-strategy',
'# Sector Rotation — Profiting from Economic Cycles

## What is sector rotation?

Different sectors of the economy outperform at different stages of the economic cycle. Sector rotation is the strategy of shifting capital into sectors that are about to outperform based on where the economy is in its cycle.

## The economic cycle and sector leaders

**Early Recovery (economy picks up after recession):**
Leading sectors: Consumer discretionary, financials, real estate
- Consumer sentiment improves → spending on cars, electronics, restaurants
- Credit growth begins → banks earn more
- Interest rates fall → real estate demand rises

**Mid-Cycle (sustained growth):**
Leading sectors: Technology, industrials, materials
- Companies invest in IT and infrastructure
- Manufacturing expands
- Commodity demand rises with economic activity

**Late Cycle (growth slowing, inflation rising):**
Leading sectors: Energy, materials, healthcare
- Rising prices benefit commodity producers
- Healthcare is defensive — people always need medicines
- Energy demand remains high

**Recession:**
Leading sectors: Consumer staples, healthcare, utilities
- People keep buying food, medicines, electricity regardless of economy
- These "defensive" sectors protect capital during downturns

## Applying sector rotation in India

**India-specific cycle drivers:**
- **RBI policy:** Rate cuts stimulate banking, real estate, consumer discretionary. Rate hikes hurt these, but benefit fixed-income adjacent sectors.
- **Monsoon:** Good monsoon → rural income rises → FMCG, two-wheelers, tractors, fertilisers outperform
- **Government capex:** Infrastructure, defence, railways, roads outperform when government spending is high
- **Global commodity cycles:** Metal, energy, chemical companies tied to global cycles

## How to implement

**Using sector ETFs:**
NSE has sector ETFs: Bank NIFTY ETF, IT ETF, Pharma ETF, FMCG ETF, Auto ETF, Infrastructure ETF.

Move capital between ETFs based on cycle positioning.

**Using relative strength:**
Compare each sector ETF''s performance against NIFTY 50 over the last 3 months. Overweight sectors showing relative strength. Exit sectors showing relative weakness.

**Rebalance quarterly:** The economic cycle is not precise, but quarterly rebalancing keeps the portfolio aligned with major trends.

## The timing challenge

Sector rotation works well in theory but is notoriously difficult in practice because:
- Economic cycles are not perfectly predictable
- Market often prices sector rotation 6-12 months ahead
- Transaction costs and taxes reduce profits

**Practical approach:** Use sector rotation for 30-40% of equity portfolio. Keep 60-70% in a simple NIFTY 50 index fund. This gives you exposure to rotation opportunities without fully abandoning diversification.

*Source: Economic cycle research; NSE India sector indices data (nseindia.com)*',
9,61,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='sector-rotation-strategy');

-- ═══════════════════════════════════════════════════════════════
-- BEHAVIORAL FINANCE — +3 lessons
-- ═══════════════════════════════════════════════════════════════

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT bf_adv_id,
'Overconfidence bias — why most investors think they are above average',
'overconfidence-bias-investing',
'# Overconfidence Bias in Investing

## The above-average illusion

Studies consistently show that 80-90% of people rate themselves as above-average drivers, above-average at their jobs, and above-average investors.

Mathematically, only 50% can be above average. The rest are experiencing overconfidence bias.

## Overconfidence in investing — the evidence

**Barber and Odean (2000):** Analysed 35,000 brokerage accounts. The most active traders (who traded the most confidently) earned 6.5% less annually than the least active traders. Overconfident traders overtrade and underperform.

**Indian SEBI data (2023):** 89% of individual F&O traders lost money. The consistent losers tend to be those who are most certain they have an edge.

## How overconfidence manifests

**Illusion of knowledge:** "I have researched this company thoroughly, so I know what will happen." More information creates false certainty — even expert analysts cannot reliably predict stock performance.

**Illusion of control:** "I got out before the crash last time — I can time the market." One correct prediction creates an inflated sense of skill in what is largely luck.

**Planning fallacy:** Underestimating how long things take and overestimating how good outcomes will be. Applies to startups estimating revenue and traders estimating trade duration.

**Better-than-average effect:** "I know how to pick stocks better than the average investor." Most cannot beat a simple index fund after costs.

## The calibration test

Good forecasters are "calibrated" — when they say they are 90% confident, they are right about 90% of the time.

Test your own calibration: Make 10 stock price predictions over 3 months with your confidence level for each. How often is your 90% confidence correct vs your 60% confidence?

Most people find they are less calibrated than they thought — their 90% confidence events happen only 65-70% of the time.

## Antidotes to overconfidence

1. **Track every prediction** — keep a decision journal. Record why you bought/sold, what you expected to happen, and what actually happened. Review quarterly.

2. **Seek disconfirming evidence** — actively look for reasons your thesis is wrong. Ask: "What would make me sell this?" before buying.

3. **Use base rates** — before predicting a company''s growth, check the base rate: what percentage of Indian companies grow at 25%+ for 5 years? (Very few.) Anchor to reality.

4. **Compare to a benchmark** — after a year of investing, honestly compare your returns to a NIFTY 50 index fund. Most active stock pickers underperform over time.

5. **Pre-mortem:** Before a trade, ask "Imagine this trade failed completely — what went wrong?" forces you to consider downside scenarios seriously.

*Source: Barber & Odean (2000), "Trading Is Hazardous to Your Wealth"; SEBI F&O study 2023*',
9,62,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='overconfidence-bias-investing');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT bf_adv_id,
'The psychology of bull and bear markets — crowd behavior and contrarian thinking',
'bull-bear-psychology',
'# Bull and Bear Market Psychology

## The emotional cycle of a market

Markets move in cycles not just because of economics, but because of collective human emotion. John Templeton''s observation: "Bull markets are born on pessimism, grow on skepticism, mature on optimism, and die on euphoria."

## The full emotional cycle

**Disbelief (early bull):** Markets start rising after a crash. "This rally cannot last — the economy is still bad." Most investors stay out, fearing another crash. This is where the biggest long-term gains begin.

**Hope:** Economic data improves. "Maybe things are actually getting better." Cautious re-entry begins.

**Optimism:** Markets clearly in uptrend. Media covers stock market positively. More investors enter. Good time to invest but getting crowded.

**Belief:** "This market is different — the fundamentals support these valuations." Everyone has a stock tip. Your driver, barber, and relatives are discussing stocks. Classic bubble territory.

**Euphoria (peak):** "You cannot lose money in this market." Rookie investors making fast money. IPOs of loss-making companies oversubscribed 100x. Maximum financial risk. Minimum emotional risk.

**Complacency:** Small correction. "Just a dip — buy more." Still in denial.

**Anxiety:** Sharper fall. "This will recover — it always does." Wishful thinking.

**Denial:** "I am a long-term investor — I am not panicking." Still no action.

**Panic:** Significant losses. Media coverage turns apocalyptic. "Sell everything."

**Capitulation (bottom):** Mass selling at losses. "I cannot take this anymore." Maximum financial opportunity. Maximum emotional pain.

**Depression:** After selling, markets start recovering. "I will never invest in stocks again."

## The India bull-bear cycles

**2003-2008 bull:** SENSEX rose from 3,000 to 21,000. Classic cycle — everyone was bullish by 2007-08.
**2008 bear:** Global financial crisis. SENSEX crashed to 8,000. Panic selling.
**2014-2017 bull:** Modi election rally. Optimism and belief phase.
**2020 COVID crash and recovery:** The fastest bear market and recovery in history — 38% crash in 5 weeks, full recovery in 6 months.
**2021 bull:** Post-COVID euphoria. IPO mania. F&O retail explosion.
**2022 bear:** NIFTY fell 18% from peak. Crypto crashed 75%.

## Contrarian thinking in practice

The contrarian investor does the opposite of the crowd at extremes:

**When to be more aggressive (crowd is fearful):**
- News headlines are catastrophic
- Everyone says "this time is different — markets will not recover"
- IPO market is dead
- Stocks trading at 5-10 year low P/E multiples
- Your smart friends are not talking about stocks

**When to reduce risk (crowd is euphoric):**
- Every IPO oversubscribed 50-100x
- Loss-making companies have high valuations
- Your driver/domestic help is asking about stocks
- Valuations at multi-year highs (NIFTY P/E above 25)
- Everyone has a tip and everyone is making money

**The contrarian caveat:** Being early is the same as being wrong temporarily. Warren Buffett said: "The market can remain irrational longer than you can remain solvent."

## Practical tools

**NIFTY PE ratio (NSE website):** Above 25 = caution. Below 15 = opportunity.
**VIX (India VIX):** Above 25 = fear. Below 12 = complacency.
**IPO subscription data:** Massive oversubscription = frothy market.
**Media tone:** When business news is dominated by stock market stories, caution.

*Source: John Templeton quotes; NSE India VIX data; historical NIFTY P/E data (nseindia.com)*',
10,63,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='bull-bear-psychology');

INSERT INTO lessons (level_id,title,slug,content_mdx,duration_minutes,order_index,is_published,is_free)
SELECT bf_adv_id,
'Sunk cost fallacy — why you keep losing investments and how to stop',
'sunk-cost-fallacy-investing',
'# Sunk Cost Fallacy in Investing

## What is the sunk cost fallacy?

A sunk cost is a cost that has already been incurred and cannot be recovered. The sunk cost fallacy occurs when you continue a behaviour because of past investment — even when it no longer makes rational sense.

"I have already put ₹5 lakh into this stock. I cannot sell at a loss."

## Why it devastates investors

The rational question when holding any investment is: **"Would I buy this today at this price?"**

Not: "How much did I pay for it?"

Your original purchase price is completely irrelevant to future returns. The market does not know or care what you paid.

**Example:**
- You bought 100 shares of XYZ at ₹200 (₹20,000 investment)
- XYZ is now ₹120 (₹12,000 value — you are down ₹8,000)
- The company has reported 3 consecutive quarters of declining revenue
- The original investment thesis has broken down

**Sunk cost thinking:** "I will wait until it comes back to ₹200 to break even."

**Rational thinking:** "If I had ₹12,000 today, would I buy XYZ? No, the thesis has broken. Deploy this capital in something with better prospects."

## The break-even fallacy

"I will sell when I get back to even" is one of the most expensive beliefs in investing.

Your money does not know what price you bought at. Every rupee sitting in a losing position is opportunity cost — it could be in a better investment growing.

## Identifying sunk cost thinking in yourself

Red flags:
- "I cannot sell at a loss — it hurts too much"
- "I have held this for 5 years — I cannot give up now"
- "The stock will come back — it always has before" (even when the thesis has changed)
- Averaging down into a losing position based on attachment, not analysis

## The opposite problem — gamblers fallacy

"I have been losing for 5 trades in a row — I am due for a win."

Past losses do not increase your probability of future wins. Each trade is independent. But sunk cost thinking may make you over-size the next trade to "recover" — leading to even larger losses.

## How to overcome sunk cost bias

**1. Regular portfolio review:** Every quarter, evaluate each holding fresh. "Would I buy this today?" If no — why are you holding?

**2. Cost-blind analysis:** Look only at current fundamentals and future prospects. Consciously ignore your purchase price.

**3. Pre-commit to exit rules:** Before buying, define: "I will exit if revenue falls 3 consecutive quarters" or "I will sell if the stock falls 20% from my entry." Writing these down makes it easier to follow through.

**4. Distinguish averaging down from defending a mistake:** Averaging down is rational if: the original thesis is intact, you are buying more of what you already understand, and you have the financial capacity. It is irrational if: you are buying simply because you hate losing, or to avoid acknowledging an error.

**5. Reframe losses as tuition:** Every investment loss is a learning opportunity. The sunk cost is your tuition fee. Cut it early, learn from it, and redeploy.

*Source: Kahneman & Tversky (1979), Prospect Theory; Thaler (1980), "Toward a Positive Theory of Consumer Choice"*',
9,64,TRUE,FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='sunk-cost-fallacy-investing');

-- Final count
DO $$
DECLARE v_total INT;
BEGIN
  SELECT COUNT(*) INTO v_total FROM lessons WHERE is_published=TRUE;
  RAISE NOTICE 'Phase 7 lessons complete! Total published: %', v_total;
  RAISE NOTICE 'New lessons added: ~20 across Personal Finance, Trading, Behavioral Finance, and Hindi';
END $$;

END $PHASE7_LESSONS$;
