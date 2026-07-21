-- ============================================================
-- FinanceHub — Seed Lessons (Personal Finance, Beginner Level)
-- Run AFTER supabase_schema.sql
-- ============================================================

-- Helper: get the beginner level ID for personal finance
DO $$
DECLARE
  beginner_level_id UUID;
  l1 UUID; l2 UUID; l3 UUID; l4 UUID; l5 UUID;
  l6 UUID; l7 UUID; l8 UUID; l9 UUID; l10 UUID;
  q1 UUID; q2 UUID; q3 UUID; q4 UUID; q5 UUID;
BEGIN

SELECT lv.id INTO beginner_level_id
FROM levels lv JOIN tracks t ON lv.track_id = t.id
WHERE t.slug = 'personal-finance' AND lv.slug = 'beginner';

-- ─────────────────────────────────────────
-- LESSON 1: Why Money Matters
-- ─────────────────────────────────────────
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES (beginner_level_id, 'Why money management matters', 'why-money-matters',
'# Why money management matters

## The real reason most people struggle

It is not that people do not earn enough. The real reason most people struggle financially is that nobody ever taught them how money works.

Think about it — school teaches us history, mathematics, and science. But it never teaches us how to save, invest, budget, or avoid debt. That gap costs people lakhs of rupees over their lifetime.

> "A financial plan is a bridge between where you are and where you want to be." — Suze Orman

## What happens without financial knowledge

Without basic money skills, most people fall into predictable traps:

- **Lifestyle inflation**: Every time income rises, spending rises equally — so savings stay at zero
- **Debt cycles**: Credit cards and EMIs feel manageable until they snowball
- **No emergency fund**: One unexpected expense — medical, job loss, car breakdown — becomes a crisis
- **Retirement shock**: Reaching 60 with no savings because "there was always time later"

## What changes when you understand money

When you understand how money works, everything changes. You stop living paycheck to paycheck. You make confident decisions about loans, investments, and insurance. You build wealth slowly and steadily, without needing a high salary.

## The compound effect of financial education

The earlier you start, the more powerful the results. A person who learns to invest at 22 will have dramatically more wealth at 60 than someone who starts at 40 — even if they invest less total money. Time is your biggest asset.

## Your journey starts here

This track will take you from complete beginner to financially confident — one lesson at a time. Each concept builds on the last. Do not skip ahead. The foundation matters.

**By the end of this level, you will know how to:**
- Budget your income effectively
- Build an emergency fund
- Understand compound interest
- Make your first investment decisions
- Protect yourself with the right insurance',
5, 1, true, true) RETURNING id INTO l1;

-- Quiz for Lesson 1
INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l1, 'Why Money Matters — Check', 70) RETURNING id INTO q1;
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
(q1, 'What is the main reason most people struggle financially, according to this lesson?',
'["They do not earn enough money", "Nobody taught them how money works", "The economy is too unfair", "Banks charge too many fees"]', 1,
'The lesson states clearly: it is not about earning enough. Most people struggle because financial education is missing from school and family — not because of income levels.', 1),
(q1, 'What is "lifestyle inflation"?',
'["Prices rising due to inflation", "Spending rising every time income rises, keeping savings at zero", "Investing in lifestyle businesses", "Taking loans for luxury items"]', 1,
'Lifestyle inflation means every pay rise gets absorbed by higher spending, so savings never grow. It is one of the most common financial traps.', 2),
(q1, 'Why does starting to invest early matter so much?',
'["Early investors get special tax benefits", "Compound interest grows wealth exponentially over time", "Investments are riskier when you are older", "Banks give better rates to younger customers"]', 1,
'Compound interest means your returns earn returns. The longer the time horizon, the more powerful this effect. Starting at 22 vs 40 can mean millions of rupees difference by retirement.', 3);

-- ─────────────────────────────────────────
-- LESSON 2: How to Budget (50/30/20 Rule)
-- ─────────────────────────────────────────
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES (beginner_level_id, 'How to budget — the 50/30/20 rule', 'how-to-budget',
'# How to budget — the 50/30/20 rule

## What is a budget?

A budget is simply a plan for your money. It tells your money where to go instead of wondering where it went. Most people skip budgeting because it sounds restrictive — but a good budget actually gives you freedom.

## The 50/30/20 rule

The simplest budgeting framework is the 50/30/20 rule:

- **50% — Needs**: Rent, groceries, utilities, EMIs, transport, phone
- **30% — Wants**: Eating out, entertainment, shopping, subscriptions, travel
- **20% — Savings and investments**: Emergency fund, SIPs, provident fund, goals

## How to apply it in India

If your monthly take-home is ₹50,000:

- Needs: ₹25,000 (rent, food, transport, bills)
- Wants: ₹15,000 (dining, entertainment, shopping)
- Savings: ₹10,000 (SIP, emergency fund, goal savings)

> Start with what you earn, not what you wish you earned. The percentages can flex — but 20% to savings is non-negotiable.

## What counts as a need vs a want?

This is where most people cheat their budget. Be honest:

- Rent for a comfortable home = need. Rent for a premium flat when a good one is cheaper = want.
- Groceries = need. Zomato every evening = want.
- Basic internet plan = need. Fastest available tier = want (probably).

## Zero-based budgeting (for the detail-oriented)

Another approach: every rupee of income gets assigned a job at the start of the month. Income minus all assigned expenses = zero. Nothing is "floating" unassigned.

## Tools to budget

- **Simple**: A notes app or spreadsheet
- **Better**: Google Sheets with categories
- **Best**: YNAB, Walnut, or Money Manager app',
6, 2, true, true) RETURNING id INTO l2;

INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l2, 'Budgeting — Check', 70) RETURNING id INTO q2;
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
(q2, 'In the 50/30/20 rule, what does the 20% represent?',
'["Needs like rent and food", "Wants like dining and entertainment", "Savings and investments", "Tax payments"]', 2,
'The 20% in 50/30/20 is specifically for savings and investments — emergency fund, SIPs, goal savings. This is the most important bucket because it builds your future.', 1),
(q2, 'If your monthly take-home salary is ₹60,000, how much should go to needs according to the 50/30/20 rule?',
'["₹12,000", "₹18,000", "₹30,000", "₹60,000"]', 2,
'50% of ₹60,000 is ₹30,000. This covers rent, groceries, utilities, transport, and essential EMIs.', 2),
(q2, 'Is ordering food delivery every evening a "need" or a "want"?',
'["Need — food is essential", "Want — it is a convenience, not a necessity", "It depends on your income", "Needs and wants are the same thing"]', 1,
'Food is a need. But delivery platforms are a convenience. You can buy groceries or cook for a fraction of the cost. Daily food delivery falls clearly in the wants bucket.', 3);

-- ─────────────────────────────────────────
-- LESSON 3: Emergency Fund
-- ─────────────────────────────────────────
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES (beginner_level_id, 'Building your emergency fund', 'emergency-fund',
'# Building your emergency fund

## What is an emergency fund?

An emergency fund is 3–6 months of living expenses kept in a liquid, safe place. It is your financial shock absorber — the thing that stops one bad event from destroying your financial life.

## Why 3–6 months?

- Job loss takes an average of 3–4 months to resolve
- Medical emergencies can cost lakhs with no warning
- Car breakdowns, home repairs, and family emergencies happen without notice

Without an emergency fund, you take a loan. Loans cost interest. Interest costs you more money. The cycle compounds.

## Where to keep it

The emergency fund has two requirements: **safe** and **liquid** (accessible within 24–48 hours).

- **High-yield savings account**: Best option. Some banks offer 6–7% interest.
- **Liquid mutual fund**: Slightly better returns, redeemable in 1 day.
- **Fixed deposit (FD) with premature withdrawal**: Decent option if discipline is needed.

**Do NOT keep it in:** equity mutual funds, stocks, or anything that can fall in value — because emergencies often happen during market crashes.

## How to build it

If you have nothing saved, start with a ₹10,000 mini emergency fund first. Then build toward 1 month, then 3 months, then 6 months.

**Step 1**: Open a separate savings account (not your main account — out of sight, out of mind)
**Step 2**: Set up an auto-transfer on salary day: even ₹2,000/month
**Step 3**: Do not touch it unless it is a real emergency

> An emergency fund is not an investment. Its job is not to grow — its job is to be there.

## What counts as an emergency?

- Job loss or income disruption ✓
- Medical treatment ✓
- Essential home repairs ✓
- Car breakdown (if essential for work) ✓

- Sale at your favourite store ✗
- Holiday ✗
- New phone (unless broken) ✗',
7, 3, true, true) RETURNING id INTO l3;

INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l3, 'Emergency Fund — Check', 70) RETURNING id INTO q3;
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
(q3, 'How many months of expenses should an emergency fund cover?',
'["1 month", "3–6 months", "1 year", "As much as possible"]', 1,
'3–6 months is the standard recommendation. It covers the average job search time and most common emergencies without tying up too much money in low-return savings.', 1),
(q3, 'Where should you NOT keep your emergency fund?',
'["High-yield savings account", "Liquid mutual fund", "Equity mutual funds or stocks", "Fixed deposit with withdrawal option"]', 2,
'Equity funds and stocks can fall sharply in value — often during the same economic conditions that cause job losses or emergencies. Your emergency fund must be safe and liquid.', 2),
(q3, 'What is the first step if you have zero savings right now?',
'["Invest everything in stocks immediately", "Build a ₹10,000 mini emergency fund first", "Take a loan to start the fund", "Wait until you earn more"]', 1,
'Start small. A ₹10,000 mini fund handles small emergencies while you build toward the full 3–6 months. Starting is more important than the size.', 3);

-- ─────────────────────────────────────────
-- LESSON 4: Compound Interest
-- ─────────────────────────────────────────
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES (beginner_level_id, 'Compound interest — the eighth wonder', 'compound-interest',
'# Compound interest — the eighth wonder

## What is compound interest?

Compound interest is interest earned on both your original money AND the interest you have already earned.

Simple interest: ₹1,000 × 10% = ₹100 per year, always on the original amount.
Compound interest: Year 1 = ₹100. Year 2 = 10% on ₹1,100 = ₹110. Year 3 = 10% on ₹1,210 = ₹121. It grows faster every year.

> "Compound interest is the eighth wonder of the world. He who understands it, earns it. He who does not, pays it." — Often attributed to Einstein

## The Rule of 72

A simple trick to know how long it takes to double your money:

**72 ÷ interest rate = years to double**

- At 6% (FD rate): 72 ÷ 6 = 12 years to double
- At 12% (good SIP return): 72 ÷ 12 = 6 years to double
- At 18% (credit card debt): 72 ÷ 18 = 4 years for your DEBT to double

## Why starting early matters

₹5,000 per month invested from age 22 to 60 at 12% = **₹5.8 crore**
₹5,000 per month invested from age 32 to 60 at 12% = **₹1.7 crore**

Same amount invested. Same rate. But 10 years earlier = 3.4x more wealth.

## Compound interest works against you too

Credit card debt at 36–42% per year compounds ruthlessly. A ₹50,000 credit card balance left unpaid for 3 years becomes ₹1.5 lakh+. Pay off high-interest debt before investing.

## Start today

Even ₹500 per month matters. The magic is time, not amount.',
8, 4, true, true) RETURNING id INTO l4;

INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l4, 'Compound Interest — Check', 70) RETURNING id INTO q4;
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
(q4, 'What makes compound interest different from simple interest?',
'["Compound interest is always higher", "Compound interest earns returns on both principal and accumulated interest", "Simple interest is only for savings accounts", "They are the same thing"]', 1,
'Compound interest earns returns on your original principal AND the interest already earned. This creates exponential growth over time, unlike simple interest which always calculates on the original amount.', 1),
(q4, 'Using the Rule of 72, how long does it take to double money at a 9% annual return?',
'["4 years", "6 years", "8 years", "12 years"]', 2,
'72 ÷ 9 = 8 years. The Rule of 72 is a quick mental math trick: divide 72 by the annual interest rate to estimate how many years it takes to double your money.', 2),
(q4, 'Why is credit card debt especially dangerous in the context of compound interest?',
'["Credit cards have hidden fees", "Interest rates of 36–42% cause debt to double every 2–3 years", "Banks can increase your limit without warning", "Credit cards affect your salary"]', 1,
'At 36% APR, the Rule of 72 says debt doubles in just 2 years (72 ÷ 36 = 2). Compound interest works powerfully against you when you carry high-interest debt.', 3);

-- ─────────────────────────────────────────
-- LESSON 5: Understanding Bank Accounts
-- ─────────────────────────────────────────
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES (beginner_level_id, 'Bank accounts — what you actually need', 'bank-accounts',
'# Bank accounts — what you actually need

## Types of bank accounts

**Savings account**: For everyday money. Earns 3–7% interest. Use it for your salary and day-to-day expenses. Keep your emergency fund here in a separate savings account.

**Current account**: For businesses. No interest. Unlimited transactions. You do not need this unless you run a business.

**Fixed deposit (FD)**: Lock money for a fixed period (7 days to 10 years) at a guaranteed rate. Safe but illiquid.

**Recurring deposit (RD)**: Like an FD but you contribute monthly. Good for disciplined savings toward a goal.

## What to look for in a savings account

- **Interest rate**: Some small finance banks offer 6–7% vs 3% at big banks
- **Zero minimum balance**: Avoid accounts with high minimum balance requirements
- **Good mobile app**: You will use this daily
- **DICGC insurance**: All Indian bank deposits are insured up to ₹5 lakh per bank

## The two-account system

Set up two savings accounts:

1. **Primary account**: Where your salary lands. Linked to UPI, debit card, bills
2. **Savings account** (different bank): Where your emergency fund lives. No debit card. Out of sight, out of mind.

This simple trick prevents you from accidentally spending your savings.

## DICGC insurance — the most important thing nobody tells you

The Deposit Insurance and Credit Guarantee Corporation insures your deposits up to ₹5 lakh per bank. This means if your bank fails, you get up to ₹5 lakh back.

If you have more than ₹5 lakh to save, spread it across banks.

## Digital banks vs traditional banks

Newer banks (Fi, Jupiter, Niyo) offer better interest rates and UX but have less physical presence. For most people under 30, a digital-first bank for savings + a traditional bank for salary works well.',
6, 5, true, true) RETURNING id INTO l5;

INSERT INTO quizzes (lesson_id, title, passing_score) VALUES (l5, 'Bank Accounts — Check', 70) RETURNING id INTO q5;
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES
(q5, 'What is the DICGC insurance limit per bank in India?',
'["₹1 lakh", "₹2 lakh", "₹5 lakh", "₹10 lakh"]', 2,
'DICGC (Deposit Insurance and Credit Guarantee Corporation) insures all bank deposits up to ₹5 lakh per depositor per bank. If you have more, spread it across multiple banks.', 1),
(q5, 'What is the "two-account system" recommended in this lesson?',
'["Two current accounts at different banks", "One salary account and one separate savings account with no debit card", "One for INR and one for foreign currency", "One for yourself and one for family"]', 1,
'The two-account system keeps your savings separate and harder to accidentally spend. Your emergency fund lives in a second account — ideally at a different bank — with no debit card attached.', 2),
(q5, 'Which type of account would a freelancer use for business transactions?',
'["Savings account", "Fixed deposit", "Current account", "Recurring deposit"]', 2,
'Current accounts are designed for businesses and high-transaction users. They offer unlimited transactions but earn no interest. For personal use, a savings account is always better.', 3);

-- ─────────────────────────────────────────
-- LESSONS 6–10 (shorter seed entries)
-- ─────────────────────────────────────────
INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free)
VALUES
(beginner_level_id, 'What is inflation and why it eats your money', 'what-is-inflation',
'# What is inflation and why it eats your money

Inflation is the rate at which prices rise over time. When inflation is 6%, something that costs ₹100 today costs ₹106 next year.

## Why this matters for your savings

If your savings account earns 4% and inflation is 6%, you are actually losing 2% of purchasing power every year. Your money grows in number but shrinks in real value.

**Real return = Nominal return − Inflation rate**

## How to beat inflation

You need investments that return more than inflation. In India, historically:
- Equity mutual funds: 12–15% long term
- Gold: 8–10% long term
- FDs: 6–7% (barely beats inflation)
- Savings account: 3–4% (loses to inflation)

The lesson: keeping all your money in a savings account is not safe — it is slowly losing value.

## Inflation in India

India targets 4% inflation (RBI mandate). During 2022–23, it ran at 6–7% due to global supply shocks. Understanding the current inflation rate helps you evaluate whether your investments are actually growing your wealth.',
5, 6, true, true),

(beginner_level_id, 'Needs vs wants — the honest conversation', 'needs-vs-wants',
'# Needs vs wants — the honest conversation

This lesson is uncomfortable for a reason. Most overspending comes from calling wants "needs."

## The test

A **need** is something you cannot function without. A **want** is everything else.

- Smartphone: need. Latest iPhone every year: want.
- Transport to work: need. Owning a car when metro is available: often a want.
- Internet: need. 1 Gbps plan for streaming 4K: want.

## Why this matters

Once you are honest about needs vs wants, you can make intentional choices. You might decide the 4K plan is worth it — that is fine. The goal is conscious spending, not deprivation.

## The 24-hour rule

Before any non-essential purchase over ₹1,000, wait 24 hours. Most impulse purchases disappear after a day. This single habit saves most people ₹2,000–5,000 per month.

## Conscious spending > frugality

The goal is not to spend as little as possible. It is to spend on things that genuinely make you happy and cut ruthlessly on things that do not.',
5, 7, true, true),

(beginner_level_id, 'How credit cards actually work', 'credit-cards',
'# How credit cards actually work

Credit cards are powerful tools when used correctly and financial weapons of mass destruction when misused.

## How they work

A credit card lets you buy now and pay later. Your bank pays the merchant immediately. You repay the bank, ideally within the billing cycle (usually 45–50 days) with zero interest.

If you do not pay in full, you are charged 36–42% annual interest on the outstanding balance. This is not a typo. It is genuinely that high.

## The right way to use a credit card

1. Use it for all planned purchases to earn reward points
2. Set up autopay for the full outstanding amount each month
3. Never carry a balance. Never. Ever.
4. Keep utilisation below 30% of your credit limit

## The wrong way

- Paying only the minimum due (you are charged interest on the rest)
- Using it for things you cannot afford
- Taking cash advances (fees + interest from day 1)
- Having more than 2–3 cards (hard to track)

## Credit score

Every credit card payment (or missed payment) affects your CIBIL score. Score above 750 = good loan rates. Below 650 = loan rejection or very high rates.',
6, 8, true, true),

(beginner_level_id, 'Your first investment — where to start', 'first-investment',
'# Your first investment — where to start

You have an emergency fund. You are budgeting. Now it is time to invest.

## The right order

1. Emergency fund (3–6 months expenses) ✓
2. Pay off high-interest debt (credit cards, personal loans) ✓
3. Start investing ← you are here

## Your first investment: a SIP in an index fund

A **SIP** (Systematic Investment Plan) is an auto-investment of a fixed amount each month into a mutual fund. An **index fund** tracks a market index like NIFTY 50 — it buys all 50 companies in equal proportion.

Why start here?
- No skill required — the market does the work
- Low cost — index funds have expense ratios of 0.1–0.2%
- Proven performance — NIFTY 50 has returned ~12% annually over 20 years
- Start with ₹500/month

## How to start

1. Open a Zerodha or Groww account (15 minutes with Aadhaar)
2. Complete KYC
3. Search for "Nifty 50 index fund"
4. Set up a monthly SIP for whatever you can afford

## What about stocks, crypto, or options?

These come after you understand the basics. Start boring. Get rich slowly.',
7, 9, true, true),

(beginner_level_id, 'Insurance basics — protect before you invest', 'insurance-basics',
'# Insurance basics — protect before you invest

Before you invest, you need to protect. Insurance is not an investment — it is protection against financial catastrophe.

## The two you absolutely need

### 1. Term life insurance
A pure protection plan. If you die, your family gets the sum assured. That is it.

- Buy if: you have dependents (parents, spouse, children)
- How much: 10–15x your annual income
- When: as young as possible (premiums are lowest in your 20s)
- Where: LIC, HDFC Life, ICICI Prudential — compare on PolicyBazaar

A ₹1 crore term plan for a 25-year-old non-smoker costs approximately ₹8,000–10,000 per year.

### 2. Health insurance
Medical costs in India can run ₹5–30 lakh for serious illnesses. Company health insurance disappears when you change jobs.

- Individual plan: ₹5–10 lakh cover minimum
- Family floater: covers the whole family under one plan
- Check: network hospitals, claim settlement ratio, sub-limits

## What to avoid

Endowment plans, money-back policies, and ULIPs mix insurance with investment badly. They give poor returns and poor coverage. Buy term for protection, invest separately.

## The rule

Insure first. Invest second.',
6, 10, true, true);

END $$;