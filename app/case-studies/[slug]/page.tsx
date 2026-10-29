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
