"use client";

import { useMemo, useState, useEffect, type CSSProperties } from "react";
import Link from "next/link";

// ============================================================
// FinanceHub — World-Class Loan & EMI Calculator
// components/simulators/EmiCalculator.tsx
// Bank-grade precision · SVG Donut chart · Prepayment engine · Scenario comparison · Amortization
// ============================================================

type LoanType = "home" | "car" | "personal" | "education";

type LoanPreset = {
  label: string;
  principal: number;
  rate: number;
  tenure: number;
  icon: string;
  benchmark: string;
};

const LOAN_PRESETS: Record<LoanType, LoanPreset> = {
  home: {
    label: "Home Loan",
    principal: 2000000,
    rate: 8.5,
    tenure: 20,
    icon: "🏠",
    benchmark: "Typical home loan: 8.35% – 9.15% p.a.",
  },
  car: {
    label: "Car Loan",
    principal: 800000,
    rate: 9.5,
    tenure: 5,
    icon: "🚗",
    benchmark: "Typical auto loan: 8.75% – 10.5% p.a.",
  },
  personal: {
    label: "Personal Loan",
    principal: 500000,
    rate: 12.5,
    tenure: 3,
    icon: "💼",
    benchmark: "Typical personal loan: 10.5% – 16.0% p.a.",
  },
  education: {
    label: "Education Loan",
    principal: 1500000,
    rate: 10.0,
    tenure: 7,
    icon: "🎓",
    benchmark: "Typical student loan: 9.25% – 11.5% p.a.",
  },
};

const QUICK_AMOUNTS = [500000, 1000000, 2000000, 5000000, 10000000];
const QUICK_TENURES = [5, 10, 15, 20, 25, 30];
const QUICK_PREPAYMENTS = [0, 2500, 5000, 10000, 20000];

function formatINR(val: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

function formatCompactINR(val: number): string {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(val % 10000000 === 0 ? 0 : 2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(val % 100000 === 0 ? 0 : 1)} Lakh`;
  return `₹${val.toLocaleString("en-IN")}`;
}

function calculateEMI(principal: number, annualRate: number, years: number): number {
  if (years <= 0) return 0;
  const totalMonths = years * 12;
  if (annualRate <= 0) return principal / totalMonths;

  const monthlyRate = annualRate / 12 / 100;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );
}

type YearlySchedule = {
  year: number;
  openingBalance: number;
  emiPaid: number;
  principalPaid: number;
  interestPaid: number;
  closingBalance: number;
  totalInterestToDate: number;
};

interface EmiCalculatorProps {
  onBack?: () => void;
  showBackBtn?: boolean;
}

export default function EmiCalculator({ onBack, showBackBtn = false }: EmiCalculatorProps) {
  const [loanType, setLoanType] = useState<LoanType>("home");
  const [principal, setPrincipal] = useState<number>(2000000);
  const [rate, setRate] = useState<number>(8.5);
  const [tenure, setTenure] = useState<number>(20);
  const [prepay, setPrepay] = useState<number>(0);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  // Apply loan type presets
  const applyPreset = (type: LoanType) => {
    const p = LOAN_PRESETS[type];
    setLoanType(type);
    setPrincipal(p.principal);
    setRate(p.rate);
    setTenure(p.tenure);
    setPrepay(0);
  };

  // Base monthly EMI without prepayment
  const emi = useMemo(() => calculateEMI(principal, rate, tenure), [principal, rate, tenure]);
  const totalBaselinePayment = emi * tenure * 12;
  const totalBaselineInterest = Math.max(0, totalBaselinePayment - principal);

  // Detailed schedule calculation with prepayment
  const calculation = useMemo(() => {
    const monthlyRate = rate / 12 / 100;
    const maxMonths = tenure * 12;
    let balance = principal;
    let totalInterest = 0;
    let totalPaid = 0;
    let actualMonths = 0;

    const yearlyData: YearlySchedule[] = [];
    let currentYearPrincipal = 0;
    let currentYearInterest = 0;
    let currentYearEMI = 0;
    let yearOpeningBalance = principal;

    for (let m = 1; m <= maxMonths + 120; m++) {
      if (balance <= 0) break;

      const interestPart = balance * monthlyRate;
      const effectiveEMI = emi;
      const principalPart = Math.min(balance, effectiveEMI - interestPart + prepay);
      const totalMonthPayment = interestPart + principalPart;

      balance = Math.max(0, balance - principalPart);
      totalInterest += interestPart;
      totalPaid += totalMonthPayment;
      actualMonths = m;

      currentYearPrincipal += principalPart;
      currentYearInterest += interestPart;
      currentYearEMI += totalMonthPayment;

      if (m % 12 === 0 || balance <= 0 || m === maxMonths) {
        const yearNumber = Math.ceil(m / 12);
        yearlyData.push({
          year: yearNumber,
          openingBalance: Math.round(yearOpeningBalance),
          emiPaid: Math.round(currentYearEMI),
          principalPaid: Math.round(currentYearPrincipal),
          interestPaid: Math.round(currentYearInterest),
          closingBalance: Math.round(balance),
          totalInterestToDate: Math.round(totalInterest),
        });

        yearOpeningBalance = balance;
        currentYearPrincipal = 0;
        currentYearInterest = 0;
        currentYearEMI = 0;
      }
    }

    const monthsSaved = Math.max(0, maxMonths - actualMonths);
    const yearsSavedNum = Math.floor(monthsSaved / 12);
    const monthsSavedRem = monthsSaved % 12;
    const interestSaved = Math.max(0, totalBaselineInterest - totalInterest);

    const principalPct = totalPaid > 0 ? (principal / totalPaid) * 100 : 50;
    const interestPct = totalPaid > 0 ? (totalInterest / totalPaid) * 100 : 50;
    const interestToPrincipalRatio = principal > 0 ? Math.round((totalInterest / principal) * 100) : 0;

    return {
      actualMonths,
      actualYears: Math.floor(actualMonths / 12),
      actualMonthsRem: actualMonths % 12,
      monthsSaved,
      yearsSavedNum,
      monthsSavedRem,
      totalInterest: Math.round(totalInterest),
      totalPaid: Math.round(totalPaid),
      interestSaved: Math.round(interestSaved),
      principalPct,
      interestPct,
      interestToPrincipalRatio,
      yearlyData,
    };
  }, [principal, rate, tenure, prepay, emi, totalBaselineInterest]);

  // Scenario comparison (e.g. 15y vs 20y vs 25y)
  const scenarios = useMemo(() => {
    const options = [
      { years: Math.max(5, tenure - 5), label: "Faster Payoff" },
      { years: tenure, label: "Current Plan" },
      { years: Math.min(30, tenure + 5), label: "Lower Monthly EMI" },
    ];

    // Ensure unique years
    const uniqueOptions = options.filter(
      (opt, idx, self) => self.findIndex((o) => o.years === opt.years) === idx
    );

    return uniqueOptions.map((opt) => {
      const scenarioEMI = calculateEMI(principal, rate, opt.years);
      const totalPayment = scenarioEMI * opt.years * 12;
      const totalInterest = totalPayment - principal;
      return {
        years: opt.years,
        label: opt.label,
        emi: Math.round(scenarioEMI),
        totalInterest: Math.round(totalInterest),
        isCurrent: opt.years === tenure,
      };
    });
  }, [principal, rate, tenure]);

  return (
    <div style={s.container}>
      
      {/* Optional Top Navigation Bar */}
      {showBackBtn && (
        <div style={s.topNavRow}>
          {onBack ? (
            <button type="button" onClick={onBack} style={s.backBtn}>
              ← Back to all labs
            </button>
          ) : (
            <Link href="/practice" style={s.backBtn}>
              ← Back to all labs
            </Link>
          )}
          <span style={s.topBreadcrumbBadge}>Personal Finance Lab</span>
        </div>
      )}

      {/* Main Elevated White Card */}
      <div style={s.calculatorCard}>
        
        {/* Header Section */}
        <div style={s.headerSection}>
          <div style={s.headerTitleRow}>
            <span style={s.badgeIcon}>🏦 EMI</span>
            <div>
              <h1 style={s.title}>Loan &amp; EMI Calculator</h1>
              <p style={s.subtitle}>
                Understand the true lifetime cost of borrowing, examine your interest ratio, and simulate prepayments.
              </p>
            </div>
          </div>

          {/* Loan Presets Pill Bar */}
          <div style={s.presetsRow}>
            {(Object.keys(LOAN_PRESETS) as LoanType[]).map((type) => {
              const isActive = loanType === type;
              const p = LOAN_PRESETS[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => applyPreset(type)}
                  style={{
                    ...s.presetPill,
                    background: isActive ? "#0F3D3E" : "#FFFFFF",
                    color: isActive ? "#FFFFFF" : "#334155",
                    borderColor: isActive ? "#0F3D3E" : "#CBD5E1",
                    boxShadow: isActive ? "0 2px 6px rgba(15, 61, 62, 0.2)" : "none",
                  }}
                >
                  <span style={{ marginRight: 6 }}>{p.icon}</span>
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* 2-COLUMN MAIN COMPUTATION GRID                                */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <div style={s.mainGrid}>

          {/* ─── LEFT COLUMN: INTERACTIVE INPUTS (42%) ─── */}
          <div style={s.inputsColumn}>
            
            {/* Input 1: Loan Amount */}
            <div style={s.inputCard}>
              <div style={s.inputHeaderRow}>
                <label style={s.inputLabel}>
                  <span style={s.fieldIcon}>💰</span> Loan Amount
                </label>
                <div style={s.numericInputWrapper}>
                  <span style={s.currencyPrefix}>₹</span>
                  <input
                    type="number"
                    min={50000}
                    max={50000000}
                    step={25000}
                    value={principal}
                    onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                    style={s.numericInput}
                  />
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min={100000}
                max={20000000}
                step={50000}
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                style={{
                  ...s.slider,
                  background: `linear-gradient(to right, #0F3D3E ${((principal - 100000) / (20000000 - 100000)) * 100}%, #E2E8F0 ${((principal - 100000) / (20000000 - 100000)) * 100}%)`,
                }}
              />

              {/* Quick Jump Buttons */}
              <div style={s.quickJumpsRow}>
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setPrincipal(amt)}
                    style={{
                      ...s.quickJumpPill,
                      background: principal === amt ? "#0F3D3E" : "#F1F5F9",
                      color: principal === amt ? "#FFFFFF" : "#475569",
                    }}
                  >
                    {formatCompactINR(amt)}
                  </button>
                ))}
              </div>
            </div>

            {/* Input 2: Interest Rate */}
            <div style={s.inputCard}>
              <div style={s.inputHeaderRow}>
                <label style={s.inputLabel}>
                  <span style={s.fieldIcon}>📊</span> Interest Rate (p.a.)
                </label>
                <div style={s.numericInputWrapper}>
                  <input
                    type="number"
                    min={4}
                    max={24}
                    step={0.1}
                    value={rate}
                    onChange={(e) => setRate(Math.max(0.1, Number(e.target.value)))}
                    style={{ ...s.numericInput, width: 64, textAlign: "right" }}
                  />
                  <span style={s.currencySuffix}>%</span>
                </div>
              </div>

              <input
                type="range"
                min={5}
                max={20}
                step={0.1}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                style={{
                  ...s.slider,
                  background: `linear-gradient(to right, #0F3D3E ${((rate - 5) / (20 - 5)) * 100}%, #E2E8F0 ${((rate - 5) / (20 - 5)) * 100}%)`,
                }}
              />

              <div style={s.benchmarkText}>
                {LOAN_PRESETS[loanType].benchmark}
              </div>
            </div>

            {/* Input 3: Loan Tenure */}
            <div style={s.inputCard}>
              <div style={s.inputHeaderRow}>
                <label style={s.inputLabel}>
                  <span style={s.fieldIcon}>⏱</span> Loan Tenure
                </label>
                <div style={s.numericInputWrapper}>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    step={1}
                    value={tenure}
                    onChange={(e) => setTenure(Math.max(1, Number(e.target.value)))}
                    style={{ ...s.numericInput, width: 56, textAlign: "right" }}
                  />
                  <span style={s.currencySuffix}>Years</span>
                </div>
              </div>

              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                style={{
                  ...s.slider,
                  background: `linear-gradient(to right, #0F3D3E ${((tenure - 1) / (30 - 1)) * 100}%, #E2E8F0 ${((tenure - 1) / (30 - 1)) * 100}%)`,
                }}
              />

              {/* Quick Jump Buttons for Tenure */}
              <div style={s.quickJumpsRow}>
                {QUICK_TENURES.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setTenure(yr)}
                    style={{
                      ...s.quickJumpPill,
                      background: tenure === yr ? "#0F3D3E" : "#F1F5F9",
                      color: tenure === yr ? "#FFFFFF" : "#475569",
                    }}
                  >
                    {yr} yrs
                  </button>
                ))}
              </div>
            </div>

            {/* Input 4: Monthly Prepayment (Power Feature) */}
            <div style={{ ...s.inputCard, borderLeft: "4px solid #10B981" }}>
              <div style={s.inputHeaderRow}>
                <label style={s.inputLabel}>
                  <span style={s.fieldIcon}>💸</span> Monthly Prepayment (Extra)
                </label>
                <div style={s.numericInputWrapper}>
                  <span style={s.currencyPrefix}>₹</span>
                  <input
                    type="number"
                    min={0}
                    max={100000}
                    step={500}
                    value={prepay}
                    onChange={(e) => setPrepay(Math.max(0, Number(e.target.value)))}
                    style={s.numericInput}
                  />
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={50000}
                step={500}
                value={prepay}
                onChange={(e) => setPrepay(Number(e.target.value))}
                style={{
                  ...s.slider,
                  background: `linear-gradient(to right, #10B981 ${(prepay / 50000) * 100}%, #E2E8F0 ${(prepay / 50000) * 100}%)`,
                }}
              />

              <div style={s.quickJumpsRow}>
                {QUICK_PREPAYMENTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setPrepay(amt)}
                    style={{
                      ...s.quickJumpPill,
                      background: prepay === amt ? "#10B981" : "#F1F5F9",
                      color: prepay === amt ? "#FFFFFF" : "#475569",
                    }}
                  >
                    {amt === 0 ? "None" : `+${formatCompactINR(amt)}`}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* ─── RIGHT COLUMN: RESULTS & CHARTS (58%) ─── */}
          <div style={s.resultsColumn}>
            
            {/* Elevated EMI Card (Deep Gradient, Replaces Harsh Black) */}
            <div style={s.emiHeroCard}>
              <div style={s.emiHeroGlow} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={s.emiTag}>YOUR MONTHLY EMI</div>
                <div style={s.emiValue}>{formatINR(Math.round(emi))}</div>
                <div style={s.emiSubtext}>
                  For {tenure} years @ {rate}% p.a.
                  {prepay > 0 && (
                    <span style={s.prepaySubBadge}>
                      + {formatINR(prepay)} prepay = {formatINR(Math.round(emi + prepay))}/mo
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Breakdown with SVG Donut Chart */}
            <div style={s.breakdownCard}>
              <div style={s.breakdownGrid}>
                
                {/* Responsive SVG Donut Chart */}
                <div style={s.donutWrapper}>
                  <DonutChart
                    principalPct={calculation.principalPct}
                    interestPct={calculation.interestPct}
                  />
                </div>

                {/* Metric Summary Rows */}
                <div style={s.metricsList}>
                  <div style={s.metricItem}>
                    <div style={s.metricLabelRow}>
                      <span style={{ ...s.colorDot, background: "#0F3D3E" }} />
                      <span style={s.metricLabel}>Principal Loan Amount</span>
                    </div>
                    <span style={s.metricValueTeal}>{formatINR(principal)}</span>
                  </div>

                  <div style={s.metricItem}>
                    <div style={s.metricLabelRow}>
                      <span style={{ ...s.colorDot, background: "#F43F5E" }} />
                      <span style={s.metricLabel}>Total Interest Payable</span>
                    </div>
                    <span style={s.metricValueRose}>{formatINR(calculation.totalInterest)}</span>
                  </div>

                  <div style={{ ...s.metricItem, borderTop: "1px solid #E2E8F0", paddingTop: 10 }}>
                    <div style={s.metricLabelRow}>
                      <span style={{ ...s.colorDot, background: "#0F172A" }} />
                      <span style={{ ...s.metricLabel, fontWeight: 700, color: "#0F172A" }}>
                        Total Amount Paid
                      </span>
                    </div>
                    <span style={s.metricValueBold}>{formatINR(calculation.totalPaid)}</span>
                  </div>
                </div>

              </div>

              {/* Two-Tone Progress Bar */}
              <div style={s.barContainer}>
                <div style={{ ...s.barSegment, width: `${calculation.principalPct}%`, background: "#0F3D3E" }} title={`Principal: ${calculation.principalPct.toFixed(1)}%`} />
                <div style={{ ...s.barSegment, width: `${calculation.interestPct}%`, background: "#F43F5E" }} title={`Interest: ${calculation.interestPct.toFixed(1)}%`} />
              </div>
              <div style={s.barLegendRow}>
                <span style={s.legendItem}>
                  <span style={{ ...s.legendDot, background: "#0F3D3E" }} />
                  Principal: <strong>{calculation.principalPct.toFixed(0)}%</strong>
                </span>
                <span style={s.legendItem}>
                  <span style={{ ...s.legendDot, background: "#F43F5E" }} />
                  Interest: <strong>{calculation.interestPct.toFixed(0)}%</strong>
                </span>
              </div>
            </div>

            {/* Prepayment Accelerator & Educational Insight Card */}
            <div
              style={{
                ...s.insightBox,
                background: prepay > 0 ? "#ECFDF5" : "#FFFBEB",
                borderColor: prepay > 0 ? "#A7F3D0" : "#FDE68A",
              }}
            >
              <div style={s.insightHeader}>
                <span style={{ fontSize: 20 }}>{prepay > 0 ? "🎉" : "💡"}</span>
                <div>
                  <h4 style={{ ...s.insightTitle, color: prepay > 0 ? "#065F46" : "#92400E" }}>
                    {prepay > 0 ? "Prepayment Acceleration Impact" : "Financial Insight"}
                  </h4>
                  <p style={{ ...s.insightBody, color: prepay > 0 ? "#047857" : "#78350F" }}>
                    You pay <strong>{formatINR(calculation.totalInterest)}</strong> in interest on a <strong>{formatINR(principal)}</strong> loan.
                    That is <strong>{calculation.interestToPrincipalRatio}%</strong> of the principal amount!
                  </p>
                </div>
              </div>

              {prepay > 0 ? (
                <div style={s.prepaySavingsBanner}>
                  <div style={s.savingsChip}>
                    <span style={s.savingsLabel}>TOTAL SAVED</span>
                    <span style={s.savingsNumber}>{formatINR(calculation.interestSaved)}</span>
                  </div>
                  <div style={s.savingsChip}>
                    <span style={s.savingsLabel}>LOAN CLOSES</span>
                    <span style={s.savingsNumber}>
                      {calculation.yearsSavedNum}y {calculation.monthsSavedRem}m earlier
                    </span>
                  </div>
                </div>
              ) : (
                <div style={s.tryPrepayCallout}>
                  <span>Try adding a small prepayment each month to save lakhs in interest:</span>
                  <button
                    type="button"
                    onClick={() => setPrepay(5000)}
                    style={s.testPrepayBtn}
                  >
                    Simulate +₹5,000/mo Prepayment →
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ZONE 3: TENURE SCENARIOS COMPARISON MATRIX                    */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <div style={s.scenariosSection}>
          <div style={s.sectionHeaderRow}>
            <div>
              <h3 style={s.sectionTitle}>Compare Tenure Options</h3>
              <p style={s.sectionSub}>See how changing tenure impacts monthly outflow versus lifetime interest.</p>
            </div>
            <span style={s.scenarioBadge}>3 Scenarios Evaluated</span>
          </div>

          <div style={s.scenariosGrid}>
            {scenarios.map((sc) => (
              <button
                key={sc.years}
                type="button"
                onClick={() => setTenure(sc.years)}
                style={{
                  ...s.scenarioCard,
                  background: sc.isCurrent ? "#0F3D3E" : "#FFFFFF",
                  color: sc.isCurrent ? "#FFFFFF" : "#0F172A",
                  borderColor: sc.isCurrent ? "#0F3D3E" : "#E2E8F0",
                  boxShadow: sc.isCurrent ? "0 4px 14px rgba(15, 61, 62, 0.25)" : "0 1px 3px rgba(0,0,0,0.02)",
                }}
              >
                <div style={s.scenarioCardTop}>
                  <span
                    style={{
                      ...s.scenarioTag,
                      background: sc.isCurrent ? "rgba(255,255,255,0.2)" : "#F1F5F9",
                      color: sc.isCurrent ? "#FFFFFF" : "#475569",
                    }}
                  >
                    {sc.label}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, opacity: sc.isCurrent ? 0.9 : 0.6 }}>
                    {sc.years} Years
                  </span>
                </div>

                <div style={s.scenarioEmiRow}>
                  <span style={s.scenarioEmiNumber}>{formatINR(sc.emi)}</span>
                  <span style={{ fontSize: 12, opacity: 0.8 }}>/mo</span>
                </div>

                <div style={s.scenarioInterestRow}>
                  <span>Total Interest:</span>
                  <strong>{formatCompactINR(sc.totalInterest)}</strong>
                </div>

                <div style={s.scenarioClickHint}>
                  {sc.isCurrent ? "✓ Active Plan" : "Click to select this tenure →"}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ZONE 4: YEAR-BY-YEAR AMORTIZATION SCHEDULE                    */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <div style={s.amortizationSection}>
          <button
            type="button"
            onClick={() => setShowSchedule((prev) => !prev)}
            style={s.accordionToggleBtn}
          >
            <div style={s.accordionLeft}>
              <span style={{ fontSize: 16 }}>📉</span>
              <span style={s.accordionTitle}>Year-by-Year Amortization Schedule</span>
              <span style={s.scheduleCountBadge}>{calculation.yearlyData.length} Years</span>
            </div>
            <div style={s.accordionRight}>
              <span>{showSchedule ? "Hide Schedule" : "View Detailed Breakdown"}</span>
              <span style={{ transform: showSchedule ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                ▼
              </span>
            </div>
          </button>

          {showSchedule && (
            <div style={s.tableCard}>
              <div style={s.tableScrollWrapper}>
                <table style={s.amortTable}>
                  <thead>
                    <tr style={s.tableHeadRow}>
                      <th style={s.thCell}>Year</th>
                      <th style={s.thCellRight}>Opening Balance</th>
                      <th style={s.thCellRight}>Total Payment (EMI)</th>
                      <th style={s.thCellRight}>Principal Paid</th>
                      <th style={s.thCellRight}>Interest Paid</th>
                      <th style={s.thCellRight}>Cumulative Interest</th>
                      <th style={s.thCellRight}>Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculation.yearlyData.map((row, idx) => (
                      <tr
                        key={row.year}
                        style={{
                          ...s.tableRow,
                          background: idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC",
                        }}
                      >
                        <td style={s.tdCellBold}>Year {row.year}</td>
                        <td style={s.tdCellRight}>{formatINR(row.openingBalance)}</td>
                        <td style={s.tdCellRight}>{formatINR(row.emiPaid)}</td>
                        <td style={{ ...s.tdCellRight, color: "#0F3D3E", fontWeight: 600 }}>
                          {formatINR(row.principalPaid)}
                        </td>
                        <td style={{ ...s.tdCellRight, color: "#E11D48", fontWeight: 600 }}>
                          {formatINR(row.interestPaid)}
                        </td>
                        <td style={s.tdCellRightMuted}>{formatINR(row.totalInterestToDate)}</td>
                        <td style={{ ...s.tdCellRight, fontWeight: 700, color: row.closingBalance === 0 ? "#059669" : "#0F172A" }}>
                          {row.closingBalance === 0 ? "🎉 Paid Off" : formatINR(row.closingBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* STATUTORY DISCLAIMER                                         */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <div style={s.disclaimerRow}>
          <span style={{ marginRight: 6 }}>⚖️</span>
          <span>
            <strong>Educational &amp; Planning Simulator:</strong> Monthly EMI calculations use standard reducing-balance amortisation equations. Actual figures charged by commercial lenders in India may vary due to loan processing fees, GST, credit insurance, and periodic interest rate reset clauses under RBI Marginal Cost of Funds Based Lending Rate (MCLR) or External Benchmark Lending Rate (EBLR).
          </span>
        </div>

      </div>
    </div>
  );
}

// ─── SVG Donut Chart Component ─────────────────────────────────

function DonutChart({ principalPct, interestPct }: { principalPct: number; interestPct: number }) {
  const size = 150;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const principalDash = (principalPct / 100) * circumference;

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Interest Track Arc (Rose) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F43F5E"
          strokeWidth={strokeWidth}
        />
        {/* Principal Arc (Teal) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#0F3D3E"
          strokeWidth={strokeWidth}
          strokeDasharray={`${principalDash} ${circumference}`}
          strokeLinecap="butt"
        />
      </svg>
      {/* Center Label */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
          Principal
        </span>
        <span style={{ fontSize: 20, fontWeight: 800, color: "#0F3D3E" }}>
          {principalPct.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

// ─── Design Tokens & Styles ────────────────────────────────────

const s: Record<string, CSSProperties> = {
  container: {
    maxWidth: 1280,
    margin: "0 auto",
    fontFamily: "var(--font-ui, system-ui, -apple-system, sans-serif)",
  },
  topNavRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    background: "#FFFFFF",
    border: "1px solid #CBD5E1",
    borderRadius: 8,
    color: "#334155",
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
  },
  topBreadcrumbBadge: {
    fontSize: 12,
    fontWeight: 600,
    color: "#64748B",
    background: "#F1F5F9",
    padding: "4px 10px",
    borderRadius: 9999,
  },

  /* MAIN CARD */
  calculatorCard: {
    background: "#FFFFFF",
    borderRadius: 16,
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.04)",
    overflow: "hidden",
  },

  /* HEADER */
  headerSection: {
    padding: "24px 28px 18px",
    borderBottom: "1px solid #E2E8F0",
    background: "#F8FAFC",
  },
  headerTitleRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  badgeIcon: {
    padding: "6px 10px",
    borderRadius: 8,
    background: "#E6F3F3",
    color: "#0F3D3E",
    fontWeight: 800,
    fontSize: 13,
    flexShrink: 0,
  },
  title: {
    fontSize: "clamp(1.5rem, 2.5vw, 1.85rem)",
    fontWeight: 800,
    color: "#0F172A",
    margin: "0 0 4px",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: 13.5,
    color: "#64748B",
    margin: 0,
  },
  presetsRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  presetPill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 14px",
    borderRadius: 9999,
    border: "1px solid",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },

  /* 2-COLUMN GRID */
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 1.35fr)",
    gap: 28,
    padding: "24px 28px",
  },
  inputsColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  resultsColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  /* INPUT CARDS */
  inputCard: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    padding: "16px 18px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  },
  inputHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13.5,
    fontWeight: 700,
    color: "#1E293B",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  fieldIcon: {
    fontSize: 15,
  },
  numericInputWrapper: {
    display: "flex",
    alignItems: "center",
    background: "#F8FAFC",
    border: "1px solid #CBD5E1",
    borderRadius: 8,
    padding: "3px 8px",
  },
  currencyPrefix: {
    fontSize: 13,
    fontWeight: 700,
    color: "#64748B",
    marginRight: 4,
  },
  currencySuffix: {
    fontSize: 12,
    fontWeight: 600,
    color: "#64748B",
    marginLeft: 4,
  },
  numericInput: {
    border: "none",
    background: "transparent",
    fontSize: 14,
    fontWeight: 700,
    color: "#0F172A",
    outline: "none",
    width: 100,
  },
  slider: {
    width: "100%",
    height: 6,
    borderRadius: 9999,
    appearance: "none",
    outline: "none",
    cursor: "pointer",
    margin: "6px 0 10px",
  },
  quickJumpsRow: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginTop: 4,
  },
  quickJumpPill: {
    padding: "3px 8px",
    borderRadius: 6,
    border: "none",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s",
  },
  benchmarkText: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 6,
    fontStyle: "italic",
  },

  /* EMI HERO CARD (REPLACES PITCH BLACK BOX) */
  emiHeroCard: {
    position: "relative",
    borderRadius: 14,
    background: "linear-gradient(135deg, #0A1628 0%, #0D282F 60%, #0F3D3E 100%)",
    padding: "24px 28px",
    color: "#FFFFFF",
    overflow: "hidden",
    boxShadow: "0 8px 24px -4px rgba(10, 22, 40, 0.2)",
    textAlign: "center",
  },
  emiHeroGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(0,0,0,0) 70%)",
    pointerEvents: "none",
  },
  emiTag: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.1em",
    color: "#34D399",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  emiValue: {
    fontSize: "clamp(2.2rem, 3.5vw, 2.75rem)",
    fontWeight: 800,
    color: "#FFFFFF",
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
    marginBottom: 6,
  },
  emiSubtext: {
    fontSize: 13,
    color: "#CBD5E1",
  },
  prepaySubBadge: {
    display: "block",
    marginTop: 4,
    color: "#A7F3D0",
    fontWeight: 600,
    fontSize: 12,
  },

  /* BREAKDOWN CARD */
  breakdownCard: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 14,
    padding: "18px 20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  },
  breakdownGrid: {
    display: "grid",
    gridTemplateColumns: "150px 1fr",
    gap: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  donutWrapper: {
    display: "flex",
    justifyContent: "center",
  },
  metricsList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  metricItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricLabelRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  colorDot: {
    width: 9,
    height: 9,
    borderRadius: "50%",
  },
  metricLabel: {
    fontSize: 13,
    color: "#475569",
    fontWeight: 500,
  },
  metricValueTeal: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0F3D3E",
  },
  metricValueRose: {
    fontSize: 14,
    fontWeight: 700,
    color: "#E11D48",
  },
  metricValueBold: {
    fontSize: 15,
    fontWeight: 800,
    color: "#0F172A",
  },

  /* TWO TONE BAR */
  barContainer: {
    display: "flex",
    height: 12,
    borderRadius: 9999,
    overflow: "hidden",
    marginBottom: 8,
    background: "#F1F5F9",
  },
  barSegment: {
    height: "100%",
    transition: "width 0.3s ease",
  },
  barLegendRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 11.5,
    color: "#64748B",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },

  /* PREPAYMENT INSIGHT */
  insightBox: {
    borderRadius: 14,
    border: "1px solid",
    padding: "16px 18px",
  },
  insightHeader: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: 800,
    margin: "0 0 3px",
    letterSpacing: "0.02em",
  },
  insightBody: {
    fontSize: 13,
    lineHeight: 1.55,
    margin: 0,
  },
  prepaySavingsBanner: {
    display: "flex",
    gap: 12,
    marginTop: 14,
    paddingTop: 12,
    borderTop: "1px solid rgba(16, 185, 129, 0.25)",
  },
  savingsChip: {
    flex: 1,
    background: "#FFFFFF",
    borderRadius: 8,
    padding: "8px 12px",
    border: "1px solid #A7F3D0",
  },
  savingsLabel: {
    display: "block",
    fontSize: 10,
    fontWeight: 800,
    color: "#059669",
    letterSpacing: "0.06em",
  },
  savingsNumber: {
    fontSize: 14,
    fontWeight: 800,
    color: "#047857",
  },
  tryPrepayCallout: {
    marginTop: 12,
    paddingTop: 10,
    borderTop: "1px solid rgba(245, 158, 11, 0.25)",
    fontSize: 12.5,
    color: "#92400E",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  testPrepayBtn: {
    background: "#92400E",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 6,
    padding: "5px 10px",
    fontSize: 11.5,
    fontWeight: 700,
    cursor: "pointer",
  },

  /* SCENARIOS SECTION */
  scenariosSection: {
    padding: "20px 28px 24px",
    borderTop: "1px solid #E2E8F0",
    background: "#F8FAFC",
  },
  sectionHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0F172A",
    margin: "0 0 4px",
  },
  sectionSub: {
    fontSize: 12.5,
    color: "#64748B",
    margin: 0,
  },
  scenarioBadge: {
    fontSize: 11,
    fontWeight: 600,
    background: "#E2E8F0",
    color: "#334155",
    padding: "2px 8px",
    borderRadius: 9999,
  },
  scenariosGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14,
  },
  scenarioCard: {
    padding: "16px",
    borderRadius: 12,
    border: "1px solid",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  scenarioCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  scenarioTag: {
    fontSize: 10.5,
    fontWeight: 700,
    padding: "2px 6px",
    borderRadius: 4,
    textTransform: "uppercase",
  },
  scenarioEmiRow: {
    marginBottom: 8,
  },
  scenarioEmiNumber: {
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: "-0.01em",
  },
  scenarioInterestRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    opacity: 0.85,
    marginBottom: 8,
  },
  scenarioClickHint: {
    fontSize: 11,
    fontWeight: 600,
    opacity: 0.8,
    borderTop: "1px dashed rgba(255,255,255,0.2)",
    paddingTop: 6,
  },

  /* AMORTIZATION ACCORDION & TABLE */
  amortizationSection: {
    padding: "16px 28px 20px",
    borderTop: "1px solid #E2E8F0",
  },
  accordionToggleBtn: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: 10,
    padding: "12px 18px",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  accordionLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0F172A",
  },
  scheduleCountBadge: {
    fontSize: 11,
    fontWeight: 700,
    background: "#E2E8F0",
    color: "#475569",
    padding: "2px 7px",
    borderRadius: 9999,
  },
  accordionRight: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    color: "#0F3D3E",
  },
  tableCard: {
    marginTop: 12,
    border: "1px solid #E2E8F0",
    borderRadius: 10,
    overflow: "hidden",
  },
  tableScrollWrapper: {
    maxHeight: 420,
    overflowY: "auto",
  },
  amortTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 12.5,
    textAlign: "left",
  },
  tableHeadRow: {
    background: "#F1F5F9",
    borderBottom: "1px solid #CBD5E1",
    position: "sticky",
    top: 0,
    zIndex: 2,
  },
  thCell: {
    padding: "10px 14px",
    fontWeight: 700,
    color: "#334155",
    fontSize: 11.5,
    textTransform: "uppercase",
  },
  thCellRight: {
    padding: "10px 14px",
    fontWeight: 700,
    color: "#334155",
    fontSize: 11.5,
    textAlign: "right",
    textTransform: "uppercase",
  },
  tableRow: {
    borderBottom: "1px solid #F1F5F9",
  },
  tdCellBold: {
    padding: "9px 14px",
    fontWeight: 700,
    color: "#0F172A",
  },
  tdCellRight: {
    padding: "9px 14px",
    textAlign: "right",
    color: "#334155",
  },
  tdCellRightMuted: {
    padding: "9px 14px",
    textAlign: "right",
    color: "#64748B",
  },

  /* DISCLAIMER */
  disclaimerRow: {
    padding: "16px 28px",
    borderTop: "1px solid #E2E8F0",
    background: "#F8FAFC",
    display: "flex",
    alignItems: "flex-start",
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 1.6,
  },
};
