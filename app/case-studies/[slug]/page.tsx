"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type CaseStudyDetail = {
  id:               string;
  slug:             string;
  title:            string;
  subtitle:         string;
  category:         string;
  difficulty:       string;
  duration_minutes: number;
  content_mdx:      string;
  protagonist:      string;
  key_lesson:       string;
  tags:             string[];
};

const FALLBACK_CASE_STUDIES: Record<string, CaseStudyDetail> = {
  "zaras-health-insurance-rejection": {
    id: "cs-01",
    slug: "zaras-health-insurance-rejection",
    title: "Zara's Health Insurance Rejection — How a ₹5 Lakh Policy Paid ₹42,000 on a ₹4.8 Lakh Bill",
    subtitle: "Room rent sub-limits, proportionate deductions, and the fine print that wipes out Indian hospital claims.",
    category: "personal-finance",
    difficulty: "intermediate",
    duration_minutes: 12,
    protagonist: "Zara, 28, senior product designer in Bengaluru earning ₹14 lakh/year",
    key_lesson: "Never buy health insurance with room rent sub-limits or proportionate deduction clauses — an upgraded room slashes doctor fees, surgery costs, and nursing expenses proportionally.",
    tags: ["health-insurance", "sub-limits", "proportionate-deduction", "irdai"],
    content_mdx: `# Zara's Health Insurance Rejection

## The Setup

In 2022, Zara was 26 and felt invincible. Working as a product designer in a Bengaluru tech unicorn, her employer offered a ₹3 Lakh corporate group health cover. Wanting to be responsible, Zara decided to buy her own personal health insurance policy as a backup.

She searched online and clicked on a policy aggregator. An agent called her within 45 seconds:
*"Madam, this policy gives ₹5 Lakh cover for just ₹4,900 per year! Cashless in 10,000 hospitals, restore benefit, completely hassle-free."*

Zara asked two quick questions:
- *"Does it cover surgeries?"* — *"Yes madam, 100%!"*
- *"I take thyroid medication for hypothyroidism. Does that matter?"* — *"Arey madam, thyroid is very common, almost everyone has it. No need to mention it in the form, it will just delay the policy approval."*

Zara paid the ₹4,900 premium, received the PDF policy bond via WhatsApp, and saved it in her Google Drive without reading past page 1.

---

## The Emergency

In September 2024, Zara experienced sudden, excruciating lower abdominal pain at 2:00 AM. Her roommate rushed her to a premier multi-specialty private hospital in Indiranagar.

The diagnosis: Acute appendicitis with localized perforation. She required an immediate emergency laparoscopic appendectomy and 4 days of intravenous antibiotic hospitalization.

At the hospital admission desk at 3:30 AM, the administrator asked her roommate:
*"Which room category would you prefer? We have Twin Sharing at ₹4,000/day, Single Private at ₹6,500/day, and Deluxe Suite at ₹9,000/day."*

Zara, in agonizing pain, murmured:
*"Give me a Single Deluxe room. I have a ₹5 Lakh insurance policy, and the doctor said the total bill will be around ₹4 to ₹5 Lakhs. My policy will cover it."*

---

## The Shocking Discharge Bill

Four days later, Zara was discharged in stable health. The hospital billing department handed her the final itemized bill:

- Room Rent (Deluxe Suite, 4 days @ ₹9,000/day): ₹36,000
- Surgeon & Laparoscopy Specialist Fees: ₹1,65,000
- Operating Theatre (OT) & Equipment Charges: ₹1,10,000
- Anesthetist & Critical Care Charges: ₹45,000
- Diagnostic Imaging (CT Scan, USG, Blood Panels): ₹34,000
- Pharmacy, Consumables & Surgical Disposables: ₹58,000
- Nursing & Resident Doctor Monitoring Charges: ₹32,000
- **Total Hospital Bill: ₹4,80,000**

Zara confidently provided her health insurance policy details for cashless settlement. 

Four hours later, the Third-Party Administrator (TPA) desk called her roommate with devastating news:
**Total Insurer Approved Amount: ₹42,100.**
**Balance Out-of-Pocket Payment Required Before Discharge: ₹4,37,900.**

Zara broke down: *"What do you mean ₹42,000?! I have a ₹5,00,000 cover! My bill is ₹4.8 Lakhs! Why am I paying ₹4.37 Lakhs out of my own savings?!"*

---

## The Hidden Trap: Proportionate Deduction

When Zara received the TPA claim breakdown, she discovered the brutal reality of Indian health insurance fine print:

### Trap 1: The 1% Room Rent Sub-Limit
In her policy bond (Page 14, Clause 3.2):
> "Room rent eligibility is capped at 1% of the Sum Insured per day."

Her Sum Insured was ₹5,00,000. Her maximum eligible room rent was strictly ₹5,000 per day. By choosing a ₹9,000/day Deluxe Suite, she exceeded her limit by ₹4,000/day (an 80% overshoot).

### Trap 2: The Proportionate Deduction Clause
Most buyers think: *"If I choose an expensive room, I will just pay the ₹4,000 room rent difference from my pocket."*
**Wrong.** Hospitals do not just charge more for the bed — their entire pricing schedule is tiered to the room category. In a Deluxe Suite, the surgeon charges ₹1,65,000, while in a Twin-Sharing room, the exact same surgeon charges ₹75,000 for the identical surgery!

Because Zara exceeded her room rent limit, the insurer applied Proportionate Deduction to ALL associated medical charges:
Eligible Ratio = Eligible Room Rent / Actual Room Rent = ₹5,000 / ₹9,000 = 55.55%

The insurer slashed her surgeon fees, OT charges, anesthesia, and nursing by 44.45% across the board!

### Trap 3: Non-Medical Consumables Slashed
Gloves, PPE, syringes, sanitizers, surgical gowns (₹38,000) were classified as "Non-Medical Items" and rejected completely.

### Trap 4: Non-Disclosure Investigation
Because the hospital discharge summary noted: *"Patient has history of Hypothyroidism on Eltroxin 50mcg,"* the insurer flagged the entire claim under Section 45 (Non-disclosure of Material Facts). They withheld pre- and post-hospitalization reimbursement entirely and threatened to cancel the policy for fraud.

---

## The Claim Breakdown Table

- Room Rent (4 Days @ ₹9,000): Hospital ₹36,000 | Insurer Paid ₹20,000 (Capped at ₹5,000/day)
- Surgeon & OT Charges: Hospital ₹2,75,000 | Insurer Paid ₹1,52,700 (Slashed by 44.4%)
- Anesthesia & Nursing: Hospital ₹77,000 | Insurer Paid ₹42,700 (Slashed by 44.4%)
- Non-Medical Consumables: Hospital ₹38,000 | Insurer Paid ₹0 (Excluded consumables)
- Pre-Existing Penalty / Deductions: Disallowed due to thyroid investigation
- Co-Payment & Admin Deductions: Additional co-pay clause triggered
- **Total Hospital Bill: ₹4,80,000 | Insurer Approved: ₹42,100 | Zara Paid Out of Pocket: ₹4,37,900 (91.2% of the bill!)**

---

## What Zara Learned (The Hard Way)

Zara had to swipe two credit cards and empty her entire emergency liquid mutual fund to walk out of the hospital.

*"I thought I saved ₹3,000 on my annual premium by choosing the cheapest policy. That 'saving' cost me ₹4.37 Lakhs when I was at my most vulnerable."*

---

## The 6-Point Health Insurance Buying Checklist

Before buying or renewing ANY health insurance policy in India, demand this exact checklist:

1. **Zero Room Rent Capping:** Ensure the policy states: *"Single Private Room of choice with No Sub-limits"*.
2. **Zero Proportionate Deduction:** If room rent has no cap, proportionate deduction cannot be triggered.
3. **Zero Co-Payment:** Never buy a policy with a 10% or 20% mandatory co-pay (common in senior citizen policies).
4. **Disclose EVERYTHING in Writing:** Declare asthma, thyroid, diabetes, smoking, previous minor surgeries, and family history. After 3 continuous years (moratorium period under IRDAI), an insurer CANNOT reject a claim based on non-disclosure unless deliberate fraud is proven.
5. **Get a Super Top-Up Policy:** A ₹10 Lakh base policy + ₹40 Lakh Super Top-Up (with ₹10L deductible) costs only ₹3,000 extra per year and gives ₹50 Lakhs of total coverage.
6. **Consumables Add-On Rider:** Spend ₹600/year to add the "Consumables Protector Rider" so gloves, syringes, and PPE kits are paid 100%.`,
  },
  "priya-emergency-fund-mistake": {
    id: "cs-06",
    slug: "priya-emergency-fund-mistake",
    title: "The ₹50,000 Mistake: What Priya Learned About Emergency Funds",
    subtitle: "How one unexpected laptop expense derailed a year of careful saving — and the ₹3.6 Lakh compounding cost.",
    category: "personal-finance",
    difficulty: "beginner",
    duration_minutes: 10,
    protagonist: "Priya, 28, UX designer in Bengaluru earning ₹85,000/month",
    key_lesson: "Always build your emergency fund BEFORE starting SIP investments.",
    tags: ["emergency-fund", "sip", "liquid-fund", "financial-planning", "beginner"],
    content_mdx: `# The ₹50,000 Mistake

## Meet Priya

Priya, 28, is a UX designer in Bengaluru earning ₹85,000/month. She has been saving diligently for two years, building up ₹3 lakh in a NIFTY 50 index fund through monthly SIPs.

She is proud of her financial discipline. She barely touches her savings account.

## The Crisis

In March 2024, Priya's laptop — essential for her freelance work — dies. Repair: impossible. Replacement: ₹65,000.

Priya has only ₹8,000 in her savings account.

## What Priya Did

She redeemed ₹65,000 from her index fund. Logical choice, right?

## The Hidden Cost

1. **Tax**: Short-Term Capital Gains taxed at 15% on units held under 1 year.
2. **Timing**: She redeemed during a market dip, locking in paper losses.
3. **Compounding break**: ₹65,000 reinvested at 12% for 15 years = ₹3.6 lakh. The real cost of this emergency was ₹3.6 lakh in future wealth.

## The Lesson

Investing is step 2. Step 1 is building a 6-month liquid emergency fund in a high-yield savings account or liquid mutual fund.`,
  },
  "rahuls-fd-illusion": {
    id: "cs-02",
    slug: "rahuls-fd-illusion",
    title: "Rahul's FD Illusion: The Hidden Inflation Tax",
    subtitle: "How 20 years of 'safe' fixed deposits silently destroyed ₹10 lakh of purchasing power while appearing to grow.",
    category: "personal-finance",
    difficulty: "beginner",
    duration_minutes: 10,
    protagonist: "Rahul, 48, government employee in Delhi",
    key_lesson: "After 7% inflation and 30% slab tax, the real compounded return on standard fixed deposits is negative.",
    tags: ["fixed-deposit", "inflation", "taxation", "purchasing-power", "debt"],
    content_mdx: `# Rahul's FD Illusion: The Hidden Inflation Tax

## The Setup
In 2004, Rahul received a ₹10,00,000 inheritance. Risk-averse and prioritizing capital safety above all, he put the entire sum into 5-year rolling bank Fixed Deposits yielding 7.5% per annum.

For 20 years, he renewed the principal and reinvested the interest. In 2024, his bank balance had grown from ₹10 Lakhs to approximately ₹38.7 Lakhs. Rahul felt triumphant.

---

## The Reality Check
In 2004, ₹10 Lakhs could purchase a spacious 2BHK apartment in an emerging sector of Gurgaon.

In 2024, that exact same apartment was valued at ₹1.35 Crores. Rahul's ₹38.7 Lakhs could not even cover the 30% down payment for the same property today.

---

## The Mathematics of the Trap
- **Nominal Growth**: ₹10 Lakh $\\rightarrow$ ₹38.7 Lakh (approx 3.8x)
- **TDS and Income Tax**: As Rahul's salary rose into the 30% tax bracket, 30.9% of his annual FD interest was deducted as income tax.
- **Real Post-Tax Return**: $7.5\\% \\times (1 - 0.309) = 5.18\\%$
- **Average Inflation in India (2004–2024)**: $6.8\\%$
- **Net Real Wealth Creation**: $5.18\\% - 6.8\\% = -1.62\\%$ per year!

Rahul experienced negative real purchasing power growth every single year. The safety of FDs was an illusion created by looking at nominal numbers rather than purchasing power.

---

## Key Takeaways
1. **FDs are for liquidity, not wealth creation:** Keep your 6-month emergency fund in FDs, but never your 20-year retirement nest egg.
2. **Always calculate post-tax, post-inflation returns:** If your asset yields 7% but inflation is 6% and tax is 2%, you are losing 1% in purchasing power every year.
3. **Equities protect purchasing power:** High-quality Indian equities (Nifty 50) compounded at 14.2% CAGR over the same 2004–2024 period, beating inflation handsomely.`,
  },
  "the-50-lakh-fo-trap": {
    id: "cs-03",
    slug: "the-50-lakh-fo-trap",
    title: "The ₹50 Lakh F&O Trap: From Hero to Zero",
    subtitle: "How a bull-run win streak created false confidence and led to total capital annihilation in 3 weeks.",
    category: "trading-markets",
    difficulty: "advanced",
    duration_minutes: 15,
    protagonist: "Vikas, 29, software engineering lead in Pune",
    key_lesson: "Leverage works both ways. SEBI verified that 89% of individual retail derivative traders lose money.",
    tags: ["fno", "derivatives", "options", "leverage", "risk-management"],
    content_mdx: `# The ₹50 Lakh F&O Trap: From Hero to Zero

## The Winning Streak
During the post-2020 liquidity surge, Vikas started trading out-of-the-money (OTM) Bank Nifty weekly call options. Starting with ₹5,00,000 in savings, he caught 3 massive trend days and compounded his capital to ₹52,00,000 in just 8 months.

He quit his tech job to trade full-time, convinced he had cracked the market code.

---

## The Trap Springs
In October, market volatility compressed into an erratic multi-week trading range. Vikas continued aggressively buying weekly options with expiry in 2 to 3 days.

1. **Theta Decay (Time Decay)**: Out-of-the-money options lose value every hour even if the underlying index moves sideways.
2. **Revenge Trading**: After losing ₹8 Lakhs in one session, Vikas doubled his lot sizes on expiry day to "win it back".
3. **Overnight Gap Risk**: Holding 200 lots overnight, the market gapped down 450 points on geopolitical headlines. The options expired completely worthless (₹0.05).

Within 18 trading sessions, Vikas lost the entire ₹52,00,000, plus an additional ₹6 Lakh personal loan he had taken to fund margin requirements.

---

## SEBI's Stark Reality
A landmark SEBI study analyzing over 45 lakh active retail derivative traders revealed:
- **89% of active retail F&O traders incur net financial losses.**
- The average loss per retail trader was **₹1.25 Lakh per year**.
- The top 1% of institutional algorithms and high-frequency market makers capture over 95% of all option profits.

---

## The Lesson
- Never confuse a bull market with skill.
- Naked option buying without defined stop-losses and strict position sizing ($< 1\\%$ of capital per trade) is mathematical gambling.`,
  },
  "the-coffee-can-portfolio": {
    id: "cs-04",
    slug: "the-coffee-can-portfolio",
    title: "The Coffee Can Portfolio: Compounding in Peace",
    subtitle: "A classic Indian investing experiment: buying 10 clean, high-ROCE cash-flow generating businesses and never touching them.",
    category: "investing",
    difficulty: "intermediate",
    duration_minutes: 8,
    protagonist: "Arun, 52, long-term investor in Mumbai",
    key_lesson: "Patience is the ultimate edge. High-quality businesses compound wealth when you remove emotional meddling.",
    tags: ["investing", "coffee-can", "compounding", "roce", "equity"],
    content_mdx: `# The Coffee Can Portfolio: Compounding in Peace

## The Concept
Originated by Robert Kirby in 1984, the Coffee Can approach involves selecting 10 to 15 companies with stellar capital allocation track records, buying their stock, and placing them in an imaginary "coffee can" under the mattress for a minimum of 10 years without trading them.

---

## The Selection Criteria in India
In 2004, Arun selected 10 Indian franchise businesses meeting three strict rules:
1. **ROCE (Return on Capital Employed) > 15%** every year for the past decade.
2. **Revenue growth > 10%** every year without unmanageable debt.
3. **Pristine corporate governance** and clear consumer brand moats.

---

## The Result (2004–2024)
- Arun invested ₹1,00,000 in each of the 10 stocks (Total: ₹10,00,000).
- 2 stocks lagged and delivered sub-par returns (5% CAGR).
- 5 stocks delivered steady index-matching returns (13% CAGR).
- 3 phenomenal compounding titans (Titan, Asian Paints, HDFC Bank) compounded at **> 22% CAGR**.

Because Arun never traded in or out, never paid brokerage fees, and never triggered short-term capital gains tax, the winners multiplied by over 30x and dominated the portfolio. The initial ₹10 Lakhs grew into over **₹1.48 Crores** (a 14.4% net portfolio CAGR over 20 years).

---

## Key Takeaway
Activity is the enemy of investment returns. High ROCE businesses compound cash flows internally. Your job as an investor is to buy quality and get out of the way.`,
  },
  "the-ilfs-liquidity-crisis": {
    id: "cs-05",
    slug: "the-ilfs-liquidity-crisis",
    title: "The IL&FS Liquidity Crisis: When AAA Failed",
    subtitle: "How the sudden collapse of a AAA-rated infrastructure giant froze the Indian credit market and tanked debt mutual funds.",
    category: "corporate-finance",
    difficulty: "advanced",
    duration_minutes: 20,
    protagonist: "Institutional market investigation",
    key_lesson: "Credit ratings are opinions, not guarantees. Always scrutinize asset-liability duration mismatches.",
    tags: ["ilfs", "nbfc", "debt-crisis", "credit-risk", "liquidity"],
    content_mdx: `# The IL&FS Liquidity Crisis: When AAA Failed

## The Colossus
Infrastructure Leasing & Financial Services (IL&FS) was considered quasi-sovereign in India. Backed by institutional shareholders including LIC, ORIX of Japan, and Abu Dhabi Investment Authority, it carried the highest possible credit rating: **AAA**.

By 2018, IL&FS had accumulated a colossal debt burden of over **₹91,000 Crores**.

---

## The Structural Flaw: Asset-Liability Mismatch (ALM)
IL&FS financed long-gestation infrastructure projects (highways, tunnels, and thermal power plants taking 15 to 25 years to generate cash flows) using **short-term commercial paper (CPs) and 90-day bank loans**.

As interest rates rose in 2018, the short-term credit market refused to roll over IL&FS commercial paper. On September 4, 2018, IL&FS defaulted on a ₹1,000 Crore loan from SIDBI.

Within 10 days, rating agencies downgraded IL&FS from AAA directly to **D (Default)** — an unprecedented catastrophic drop.

---

## The Contagion
- Indian debt mutual funds with exposure to IL&FS commercial paper suffered instant Net Asset Value (NAV) drops.
- NBFC funding froze across India, triggering liquidity crises at DHFL and Reliance Capital.
- The Government of India superseded the IL&FS board under the Companies Act to prevent complete systemic collapse.

---

## The Lesson
Never blindly trust credit rating agencies. Always check the cash flow statement and asset-liability maturity profiles of financial institutions.`,
  },
  "the-esop-tax-shock": {
    id: "cs-06",
    slug: "the-esop-tax-shock",
    title: "The ESOP Tax Shock: Cashless Tax Demand",
    subtitle: "Neha exercised unlisted unicorn options and was hit with ₹28 lakhs in Section 17(2) perquisite tax with zero secondary liquidity.",
    category: "corporate-finance",
    difficulty: "advanced",
    duration_minutes: 14,
    protagonist: "Neha, 33, VP of Product at a Bengaluru Unicorn",
    key_lesson: "Never exercise private startup options without guaranteed secondary liquidity or an official company buyback.",
    tags: ["esop", "startups", "perquisite-tax", "section-17", "income-tax"],
    content_mdx: `# The ESOP Tax Shock: Cashless Tax Demand

## The Excitement
Neha joined an Indian fintech unicorn as an early product lead. Over 4 years, she vested 15,000 employee stock options (ESOPs) with an exercise strike price of ₹10 per share.

When the company raised a Series E round at a $1.5 Billion valuation, the Fair Market Value (FMV) of each share was determined by a merchant banker to be ₹600.

Neha's options were on paper worth **₹90 Lakhs**!

---

## The Trap: Section 17(2) Perquisite Tax
When Neha decided to exercise her options to convert them into actual shares, she paid the company ₹1,50,000 (15,000 shares $\\times$ ₹10).

Under Indian Income Tax Law (Section 17(2)), the difference between the Fair Market Value (₹600) and the Exercise Price (₹10) is taxed as **Perquisite Salary Income** in the month of exercise:
- **Taxable Perquisite Income**: $15,000 \\times (₹600 - ₹10) = ₹88,50,000$
- **TDS at Highest Slab (31.2%)**: **₹27,61,200!**

Her employer withheld her salary entirely and asked her to deposit ₹27.6 Lakhs in cash to remit the tax to the government.

---

## The Nightmare
The shares were in an unlisted private company. Neha could not sell the shares on NSE/BSE to pay the tax. She had to empty her family savings and borrow from parents to pay ₹27.6 Lakhs in cash tax for paper wealth she could not liquidate.

---

## Key Takeaway
Never exercise private startup options upon vesting unless:
1. There is an immediate company-sponsored buyback program.
2. The startup is filing for an imminent public IPO (DRHP filed with SEBI).`,
  },
  "step-up-sip-compounding": {
    id: "cs-07",
    slug: "step-up-sip-compounding",
    title: "The 10% Step-Up SIP: Beating Active Funds",
    subtitle: "Starting with just ₹5,000/month and increasing by 10% each year created ₹1.42 Cr more than a flat ₹10,000 SIP.",
    category: "investing",
    difficulty: "beginner",
    duration_minutes: 9,
    protagonist: "Kavita, 26, fintech analyst in Hyderabad",
    key_lesson: "Step-up SIPs capture salary increments automatically and overcome the psychological drag of market timing.",
    tags: ["sip", "step-up", "compounding", "mutual-funds", "nifty-50"],
    content_mdx: `# The 10% Step-Up SIP: Beating Active Funds

## The Tale of Two Investors
- **Rohan (Flat SIP)**: Started investing ₹10,000 every single month into a Nifty 50 Index Fund for 25 years. Total invested capital: ₹30,00,000.
- **Kavita (Step-Up SIP)**: Started with only ₹5,000 per month, but enabled an automated **10% annual Step-Up** to mirror her annual salary hike. In year 2, she invested ₹5,500/mo; in year 3, ₹6,050/mo, and so on.

---

## The 25-Year Outcome (at 12.5% CAGR)
- **Rohan's Wealth (Flat SIP)**: **₹1.89 Crores**
- **Kavita's Wealth (Step-Up SIP)**: **₹3.31 Crores!**

Kavita ended up with **₹1.42 Crores more** wealth than Rohan, despite starting with half his initial monthly amount, because her investments expanded in lockstep with her prime earning years.

---

## Key Takeaway
Always enable an annual 10% Step-Up mandate on your SIPs. It neutralizes lifestyle creep and supercharges long-term compounding.`,
  },
  "the-builder-delay-ravis-wait": {
    id: "cs-08",
    slug: "the-builder-delay-ravis-wait",
    title: "The Builder Delay: Ravi's 7-Year Pre-EMI Drain",
    subtitle: "How an under-construction Noida flat was delayed by 7 years, forcing Ravi to pay double rent and interest concurrently.",
    category: "personal-finance",
    difficulty: "intermediate",
    duration_minutes: 13,
    protagonist: "Ravi, 36, marketing manager in Gurgaon",
    key_lesson: "Under-construction projects carry massive completion risks. Enforce RERA Section 18 compensation immediately.",
    tags: ["real-estate", "rera", "home-loan", "pre-emi", "delay"],
    content_mdx: `# The Builder Delay: Ravi's 7-Year Pre-EMI Drain

## The Dream
In 2014, Ravi booked an under-construction 3BHK flat in Sector 75, Noida for ₹65 Lakhs. The builder promised possession within 36 months (by 2017).

Ravi took a ₹50 Lakh home loan at 9.25% interest and opted for a pre-EMI construction-linked payment plan.

---

## The Trap
In 2017, the builder halted construction citing contractor disputes. Construction crawled for the next 7 years.

During this entire period:
- Ravi was paying **₹28,000/month rent** for his existing apartment in Gurgaon.
- Concurrently, he was paying **₹42,000/month pre-EMI interest** to the bank on the disbursed loan.
- Over 7 years of delay, Ravi paid over **₹35.2 Lakhs in rent** and **₹35.2 Lakhs in pre-EMI interest** — paying more than the original cost of the flat while living in a rented house!

---

## The RERA Resolution
In 2021, Ravi joined a collective of home buyers and filed a petition before UP RERA under **Section 18 of RERA Act, 2016**. RERA mandated the builder to pay interest at SBI MCLR + 2% for every month of delay, eventually forcing a forensic audit and completion under an authorized court-appointed administrator.

---

## Key Takeaway
1. Buy ready-to-move properties whenever possible to eliminate execution risk.
2. If buying under construction, verify escrow accounts under RERA and never hesitate to invoke Section 18 compensation.`,
  },
};

export default function CaseStudyDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [study, setStudy] = useState<CaseStudyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [xpEarned, setXpEarned] = useState(false);

  useEffect(() => {
    async function loadCaseStudy() {
      if (!slug) return;
      try {
        const { data } = await supabase
          .from("case_studies")
          .select("*")
          .eq("slug", slug)
          .single();

        if (data) {
          setStudy(data as unknown as CaseStudyDetail);

          // Check user completion
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: completion } = await (supabase
              .from("user_case_study_completions") as any)
              .select("*")
              .eq("user_id", user.id)
              .eq("case_study_id", (data as any).id)
              .single();

            if (completion) {
              setCompleted(true);
            }
          }
        } else if (FALLBACK_CASE_STUDIES[slug]) {
          setStudy(FALLBACK_CASE_STUDIES[slug]);
        }
      } catch (err) {
        console.warn("Using fallback case study if available:", err);
        if (FALLBACK_CASE_STUDIES[slug]) {
          setStudy(FALLBACK_CASE_STUDIES[slug]);
        }
      } finally {
        setLoading(false);
      }
    }
    loadCaseStudy();
  }, [slug]);

  const handleMarkComplete = async () => {
    if (!study || completed) return;

    setCompleted(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await (supabase.from("user_case_study_completions") as any).upsert({
          user_id: user.id,
          case_study_id: study.id,
          xp_earned: 20,
          completed_at: new Date().toISOString(),
        });

        // Award XP RPC call if available
        try {
          await (supabase as any).rpc("increment_user_xp", { p_user_id: user.id, p_xp: 20 });
        } catch {
          // ignore fallback
        }

        setXpEarned(true);
      }
    } catch (err) {
      console.error("Error marking case study complete:", err);
    }
  };

  if (loading) {
    return (
      <div style={s.page}>
        <div style={s.container}>
          <p>Loading case study...</p>
        </div>
      </div>
    );
  }

  if (!study) {
    return (
      <div style={s.page}>
        <div style={s.container}>
          <h2>Case Study Not Found</h2>
          <Link href="/case-studies" style={s.backLink}>
            ← Back to Case Studies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.container}>
        <Link href="/case-studies" style={s.backLink}>
          ← Back to All Case Studies
        </Link>

        {/* Case Header */}
        <div style={s.headerBox}>
          <div style={s.metaRow}>
            <span style={s.categoryTag}>{study.category}</span>
            {study.protagonist && <span style={s.companyName}>👤 {study.protagonist}</span>}
            <span style={s.readTime}>⏱️ {study.duration_minutes || 10} min read</span>
          </div>
          <h1 style={s.title}>{study.title}</h1>
          {study.subtitle && <p style={s.subtitle}>{study.subtitle}</p>}
        </div>

        {/* Key Lesson Box */}
        {study.key_lesson && (
          <div style={s.keyLessonBox}>
            <div style={s.keyLessonHeader}>💡 KEY TAKEAWAY</div>
            <p style={s.keyLessonText}>{study.key_lesson}</p>
          </div>
        )}

        {/* Content Body */}
        <div style={s.contentCard}>
          <div style={s.prose}>
            {study.content_mdx.split("\n\n").map((para, i) => {
              if (para.startsWith("# ")) {
                return <h1 key={i} style={s.h1}>{para.replace("# ", "")}</h1>;
              }
              if (para.startsWith("## ")) {
                return <h2 key={i} style={s.h2}>{para.replace("## ", "")}</h2>;
              }
              if (para.startsWith("### ")) {
                return <h3 key={i} style={s.h3}>{para.replace("### ", "")}</h3>;
              }
              return (
                <p key={i} style={s.para}>
                  {para}
                </p>
              );
            })}
          </div>
        </div>

        {/* Action / Completion */}
        <div style={s.completionCard}>
          {!completed ? (
            <button onClick={handleMarkComplete} style={s.completeBtn}>
              Mark Case Study Completed (+20 XP)
            </button>
          ) : (
            <div style={s.completedBox}>
              ✅ <strong>Case Study Solved & Mastered!</strong>
              {xpEarned && <span style={s.xpBadge}>+20 XP Awarded</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#F9FAFB",
    padding: "32px 16px 60px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  container: {
    maxWidth: "840px",
    margin: "0 auto",
  },
  backLink: {
    display: "inline-block",
    fontSize: "13px",
    color: "#6B7280",
    textDecoration: "none",
    marginBottom: "16px",
    fontWeight: 500,
  },
  headerBox: {
    background: "#FFFFFF",
    padding: "28px",
    borderRadius: "16px",
    border: "1px solid #E5E7EB",
    marginBottom: "20px",
  },
  metaRow: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    marginBottom: "12px",
    fontSize: "13px",
    flexWrap: "wrap",
  },
  categoryTag: {
    fontWeight: 700,
    color: "#0F766E",
    background: "#E1F5EE",
    padding: "4px 10px",
    borderRadius: "6px",
  },
  companyName: {
    fontWeight: 600,
    color: "#2563EB",
  },
  readTime: {
    color: "#6B7280",
  },
  title: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#111827",
    margin: "0 0 8px",
    letterSpacing: "-0.4px",
  },
  subtitle: {
    fontSize: "15px",
    color: "#4B5563",
    margin: 0,
    lineHeight: "1.5",
  },
  keyLessonBox: {
    background: "#EFF6FF",
    border: "1px solid #BFDBFE",
    padding: "16px 20px",
    borderRadius: "14px",
    marginBottom: "20px",
  },
  keyLessonHeader: {
    fontSize: "11px",
    fontWeight: 800,
    color: "#1E40AF",
    letterSpacing: "0.06em",
    marginBottom: "4px",
  },
  keyLessonText: {
    fontSize: "14px",
    fontWeight: 650,
    color: "#1E3A8A",
    margin: 0,
  },
  contentCard: {
    background: "#FFFFFF",
    padding: "32px",
    borderRadius: "16px",
    border: "1px solid #E5E7EB",
    marginBottom: "20px",
  },
  prose: {
    color: "#374151",
    fontSize: "15px",
    lineHeight: "1.7",
  },
  h1: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#111827",
    margin: "24px 0 12px",
  },
  h2: {
    fontSize: "18px",
    fontWeight: 750,
    color: "#1F2937",
    margin: "20px 0 10px",
  },
  h3: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#374151",
    margin: "16px 0 8px",
  },
  para: {
    marginBottom: "14px",
    whiteSpace: "pre-wrap",
  },
  completionCard: {
    background: "#FFFFFF",
    padding: "20px",
    borderRadius: "14px",
    border: "1px solid #E5E7EB",
    textAlign: "center",
  },
  completeBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    background: "#059669",
    color: "#FFFFFF",
    fontWeight: 750,
    fontSize: "15px",
    border: "none",
    cursor: "pointer",
  },
  completedBox: {
    fontSize: "15px",
    color: "#059669",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  xpBadge: {
    background: "#D1FAE5",
    color: "#059669",
    fontSize: "12px",
    fontWeight: 700,
    padding: "4px 8px",
    borderRadius: "6px",
  },
};
