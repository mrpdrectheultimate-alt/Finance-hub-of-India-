"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

// ============================================================
// FinanceHub — Net Worth Tracker
// app/practice/net-worth/page.tsx
// Track all assets and liabilities, calculate net worth over time
// ============================================================

type AssetCategory = "real_estate" | "equity" | "debt" | "gold" | "epf_ppf" | "cash" | "business" | "other";
type LiabilityCategory = "home_loan" | "car_loan" | "personal_loan" | "credit_card" | "education_loan" | "other";

type Asset = {
  id:       string;
  name:     string;
  category: AssetCategory;
  value:    number;
  note:     string;
};

type Liability = {
  id:       string;
  name:     string;
  category: LiabilityCategory;
  value:    number;
  emi:      number;
  note:     string;
};

const ASSET_CATEGORIES: Record<AssetCategory, { label: string; icon: string; color: string }> = {
  real_estate:  { label: "Real Estate",   icon: "🏠", color: "#1D9E75" },
  equity:       { label: "Equity/Stocks", icon: "📈", color: "#185FA5" },
  debt:         { label: "FD / Bonds",    icon: "🏦", color: "#5A67D8" },
  gold:         { label: "Gold / SGB",    icon: "🥇", color: "#D4A017" },
  epf_ppf:      { label: "EPF / PPF",     icon: "🛡️", color: "#0E6163" },
  cash:         { label: "Cash / Savings",icon: "💵", color: "#38A169" },
  business:     { label: "Business",      icon: "🏢", color: "#B91C1C" },
  other:        { label: "Other Assets",  icon: "📦", color: "#718096" },
};

const LIABILITY_CATEGORIES: Record<LiabilityCategory, { label: string; icon: string }> = {
  home_loan:       { label: "Home Loan",      icon: "🏠" },
  car_loan:        { label: "Car Loan",        icon: "🚗" },
  personal_loan:   { label: "Personal Loan",  icon: "💳" },
  credit_card:     { label: "Credit Card",    icon: "💴" },
  education_loan:  { label: "Education Loan", icon: "🎓" },
  other:           { label: "Other Debt",     icon: "📋" },
};

const formatINR = (v: number) =>
  v >= 10000000 ? `₹${(v/10000000).toFixed(2)}Cr`
  : v >= 100000 ? `₹${(v/100000).toFixed(1)}L`
  : v >= 1000   ? `₹${(v/1000).toFixed(0)}K`
  : `₹${v.toFixed(0)}`;

const genId = () => Math.random().toString(36).slice(2, 9);

const SAMPLE_ASSETS: Asset[] = [
  { id: genId(), name: "Primary Residence", category: "real_estate", value: 8000000, note: "Purchased 2018" },
  { id: genId(), name: "Stock Portfolio",    category: "equity",      value: 1200000, note: "Zerodha + MF" },
  { id: genId(), name: "EPF Balance",        category: "epf_ppf",     value: 900000,  note: "As of last slip" },
  { id: genId(), name: "FD — HDFC Bank",     category: "debt",        value: 500000,  note: "7.25% p.a." },
  { id: genId(), name: "Gold Jewellery",     category: "gold",        value: 300000,  note: "Family jewellery" },
  { id: genId(), name: "Savings Account",    category: "cash",        value: 150000,  note: "Emergency fund" },
];

const SAMPLE_LIABILITIES: Liability[] = [
  { id: genId(), name: "Home Loan — SBI", category: "home_loan", value: 4500000, emi: 38000, note: "8.5% remaining 15yr" },
  { id: genId(), name: "Car Loan",        category: "car_loan",  value: 300000,  emi: 12000, note: "Honda City 2022" },
];

export default function NetWorthTracker() {
  const [assets,      setAssets]      = useState<Asset[]>(SAMPLE_ASSETS);
  const [liabilities, setLiabilities] = useState<Liability[]>(SAMPLE_LIABILITIES);
  const [tab,         setTab]         = useState<"overview" | "assets" | "liabilities">("overview");
  const [showAddAsset,setShowAddAsset]= useState(false);
  const [showAddLiab, setShowAddLiab] = useState(false);
  const [saved,       setSaved]       = useState(false);

  // New item forms
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({ category: "equity" });
  const [newLiab,  setNewLiab]  = useState<Partial<Liability>>({ category: "personal_loan" });

  // Calculations
  const totalAssets      = assets.reduce((s, a) => s + a.value, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + l.value, 0);
  const totalEMI         = liabilities.reduce((s, l) => s + (l.emi || 0), 0);
  const netWorth         = totalAssets - totalLiabilities;
  const debtToAsset      = totalAssets > 0 ? (totalLiabilities / totalAssets * 100) : 0;

  // Asset breakdown by category
  const assetBreakdown = Object.entries(ASSET_CATEGORIES).map(([key, meta]) => ({
    ...meta, key,
    value: assets.filter(a => a.category === key).reduce((s, a) => s + a.value, 0),
    pct:   totalAssets > 0
      ? assets.filter(a => a.category === key).reduce((s, a) => s + a.value, 0) / totalAssets * 100
      : 0,
  })).filter(b => b.value > 0).sort((a, b) => b.value - a.value);

  const addAsset = () => {
    if (!newAsset.name || !newAsset.value) return;
    setAssets(prev => [...prev, { ...newAsset, id: genId() } as Asset]);
    setNewAsset({ category: "equity" });
    setShowAddAsset(false);
  };

  const addLiability = () => {
    if (!newLiab.name || !newLiab.value) return;
    setLiabilities(prev => [...prev, { ...newLiab, id: genId() } as Liability]);
    setNewLiab({ category: "personal_loan" });
    setShowAddLiab(false);
  };

  const removeAsset     = (id: string) => setAssets(prev => prev.filter(a => a.id !== id));
  const removeLiability = (id: string) => setLiabilities(prev => prev.filter(l => l.id !== id));

  const saveSnapshot = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await (supabase.from("net_worth_snapshots") as any).insert({
      user_id:           user.id,
      total_assets:      totalAssets,
      total_liabilities: totalLiabilities,
      net_worth:         netWorth,
      assets_json:       assets,
      liabilities_json:  liabilities,
      snapshot_date:     new Date().toISOString().split("T")[0],
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px",
    border: "1px solid #e2e8f0", borderRadius: 8,
    fontSize: 14, fontFamily: "var(--font-ui,system-ui)",
    outline: "none", boxSizing: "border-box",
  };

  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px", fontFamily: "var(--font-ui,system-ui)" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1c2b3a", marginBottom: 6, letterSpacing: "-0.4px" }}>
          💎 Net Worth Tracker
        </h1>
        <p style={{ fontSize: 14, color: "#718096", lineHeight: 1.6 }}>
          Track everything you own and owe. Your net worth is the truest measure of financial health.
        </p>
      </div>

      {/* Big number row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Assets",      value: totalAssets,      color: "#1D9E75", bg: "#F0FFF4", icon: "📈" },
          { label: "Total Liabilities", value: totalLiabilities, color: "#E53E3E", bg: "#FFF5F5", icon: "📉" },
          { label: "Net Worth",         value: netWorth,          color: netWorth >= 0 ? "#1D9E75" : "#E53E3E", bg: netWorth >= 0 ? "#F0FFF4" : "#FFF5F5", icon: "💰" },
        ].map(stat => (
          <div key={stat.label} style={{
            background: stat.bg, border: `1px solid ${stat.color}20`,
            borderRadius: 14, padding: "18px 16px", textAlign: "center",
          }}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, letterSpacing: "-0.5px" }}>
              {formatINR(Math.abs(stat.value))}
            </div>
            <div style={{ fontSize: 12, color: "#718096", marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Health indicators */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          {
            label: "Debt-to-Asset Ratio",
            value: `${debtToAsset.toFixed(1)}%`,
            status: debtToAsset < 30 ? "Excellent" : debtToAsset < 50 ? "Good" : debtToAsset < 70 ? "High" : "Danger",
            color:  debtToAsset < 30 ? "#1D9E75" : debtToAsset < 50 ? "#38A169" : debtToAsset < 70 ? "#D4A017" : "#E53E3E",
            hint: "Target: below 30%",
          },
          {
            label: "Monthly EMI Burden",
            value: formatINR(totalEMI),
            status: "Per month",
            color: "#185FA5",
            hint: "Target: below 40% of income",
          },
          {
            label: "Liquid Assets",
            value: formatINR(assets.filter(a => a.category === "cash" || a.category === "debt").reduce((s,a)=>s+a.value,0)),
            status: "Accessible quickly",
            color: "#0E6163",
            hint: "Keep 3-6 months expenses liquid",
          },
        ].map(ind => (
          <div key={ind.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: ind.color, marginBottom: 2 }}>{ind.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1c2b3a", marginBottom: 2 }}>{ind.label}</div>
            <div style={{ fontSize: 11, color: ind.color, fontWeight: 600 }}>{ind.status}</div>
            <div style={{ fontSize: 10, color: "#a0aec0", marginTop: 2 }}>{ind.hint}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #e2e8f0", marginBottom: 20 }}>
        {(["overview", "assets", "liabilities"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: "10px 20px", fontSize: 14, fontWeight: tab === t ? 700 : 400,
              color: tab === t ? "#0E6163" : "#718096",
              background: "none", border: "none",
              borderBottom: tab === t ? "2px solid #0E6163" : "2px solid transparent",
              marginBottom: "-2px", cursor: "pointer", textTransform: "capitalize",
              fontFamily: "var(--font-ui,system-ui)",
            }}>
            {t === "overview" ? "📊 Overview" : t === "assets" ? `📈 Assets (${assets.length})` : `📉 Liabilities (${liabilities.length})`}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === "overview" && (
        <div>
          {/* Asset allocation bars */}
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1c2b3a", marginBottom: 14 }}>Asset Allocation</h3>
          {assetBreakdown.map(cat => (
            <div key={cat.key} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: "#4a5568", display: "flex", alignItems: "center", gap: 6 }}>
                  {cat.icon} {cat.label}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1c2b3a" }}>
                  {formatINR(cat.value)} ({cat.pct.toFixed(1)}%)
                </span>
              </div>
              <div style={{ height: 8, background: "#EDF2F7", borderRadius: 999 }}>
                <div style={{
                  height: "100%", width: `${cat.pct}%`,
                  background: cat.color, borderRadius: 999,
                  transition: "width 0.8s ease",
                }} />
              </div>
            </div>
          ))}

          {/* Net worth formula */}
          <div style={{ background: "#f0f9f9", border: "1px solid #0E616320", borderRadius: 12, padding: "16px 18px", marginTop: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0E6163", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10 }}>
              Net Worth Formula
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, color: "#1D9E75" }}>{formatINR(totalAssets)} assets</span>
              <span style={{ color: "#718096" }}>−</span>
              <span style={{ fontWeight: 700, color: "#E53E3E" }}>{formatINR(totalLiabilities)} liabilities</span>
              <span style={{ color: "#718096" }}>=</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: netWorth >= 0 ? "#1D9E75" : "#E53E3E" }}>
                {formatINR(netWorth)} net worth
              </span>
            </div>
          </div>

          {/* Save snapshot */}
          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            <button onClick={saveSnapshot}
              style={{
                padding: "11px 22px", background: saved ? "#1D9E75" : "#0E6163",
                color: "#fff", border: "none", borderRadius: 10,
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                fontFamily: "var(--font-ui,system-ui)", transition: "background 0.3s",
              }}>
              {saved ? "✓ Snapshot saved!" : "💾 Save Today's Snapshot"}
            </button>
            <p style={{ fontSize: 12, color: "#a0aec0", display: "flex", alignItems: "center" }}>
              Snapshots let you track net worth over time
            </p>
          </div>
        </div>
      )}

      {/* ASSETS TAB */}
      {tab === "assets" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 14, color: "#718096" }}>
              Total: <strong style={{ color: "#1D9E75" }}>{formatINR(totalAssets)}</strong>
            </div>
            <button onClick={() => setShowAddAsset(s => !s)}
              style={{ padding: "8px 16px", background: "#0E6163", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-ui,system-ui)" }}>
              + Add Asset
            </button>
          </div>

          {/* Add asset form */}
          {showAddAsset && (
            <div style={{ background: "#f8f9fa", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 4 }}>Asset Name</label>
                  <input value={newAsset.name || ""} onChange={e => setNewAsset(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. HDFC Bluechip Fund" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 4 }}>Category</label>
                  <select value={newAsset.category} onChange={e => setNewAsset(p => ({ ...p, category: e.target.value as AssetCategory }))} style={selectStyle}>
                    {Object.entries(ASSET_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 4 }}>Current Value (₹)</label>
                  <input type="number" value={newAsset.value || ""} onChange={e => setNewAsset(p => ({ ...p, value: Number(e.target.value) }))}
                    placeholder="e.g. 500000" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 4 }}>Note (optional)</label>
                  <input value={newAsset.note || ""} onChange={e => setNewAsset(p => ({ ...p, note: e.target.value }))}
                    placeholder="Any detail" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={addAsset}
                  style={{ padding: "8px 18px", background: "#0E6163", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-ui,system-ui)" }}>
                  Add Asset
                </button>
                <button onClick={() => setShowAddAsset(false)}
                  style={{ padding: "8px 14px", background: "#fff", color: "#718096", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-ui,system-ui)" }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Asset list */}
          {assets.map(asset => {
            const cat = ASSET_CATEGORIES[asset.category];
            return (
              <div key={asset.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
                padding: "12px 16px", marginBottom: 8,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: cat.color + "18",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
                }}>
                  {cat.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1c2b3a" }}>{asset.name}</div>
                  <div style={{ fontSize: 11, color: "#a0aec0" }}>{cat.label}{asset.note ? ` · ${asset.note}` : ""}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1D9E75" }}>{formatINR(asset.value)}</div>
                  <div style={{ fontSize: 11, color: "#a0aec0" }}>{totalAssets > 0 ? `${(asset.value/totalAssets*100).toFixed(1)}%` : "0%"}</div>
                </div>
                <button onClick={() => removeAsset(asset.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#CBD5E0", fontSize: 16, padding: "0 4px", flexShrink: 0 }}>
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* LIABILITIES TAB */}
      {tab === "liabilities" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 14, color: "#718096" }}>
              Total: <strong style={{ color: "#E53E3E" }}>{formatINR(totalLiabilities)}</strong>
              {totalEMI > 0 && <span style={{ marginLeft: 12, color: "#718096" }}>· EMI: <strong>{formatINR(totalEMI)}/month</strong></span>}
            </div>
            <button onClick={() => setShowAddLiab(s => !s)}
              style={{ padding: "8px 16px", background: "#B91C1C", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-ui,system-ui)" }}>
              + Add Liability
            </button>
          </div>

          {/* Add liability form */}
          {showAddLiab && (
            <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 4 }}>Liability Name</label>
                  <input value={newLiab.name || ""} onChange={e => setNewLiab(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. SBI Home Loan" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 4 }}>Category</label>
                  <select value={newLiab.category} onChange={e => setNewLiab(p => ({ ...p, category: e.target.value as LiabilityCategory }))} style={selectStyle}>
                    {Object.entries(LIABILITY_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 4 }}>Outstanding Amount (₹)</label>
                  <input type="number" value={newLiab.value || ""} onChange={e => setNewLiab(p => ({ ...p, value: Number(e.target.value) }))}
                    placeholder="e.g. 3000000" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 4 }}>Monthly EMI (₹)</label>
                  <input type="number" value={newLiab.emi || ""} onChange={e => setNewLiab(p => ({ ...p, emi: Number(e.target.value) }))}
                    placeholder="e.g. 28000" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={addLiability}
                  style={{ padding: "8px 18px", background: "#B91C1C", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-ui,system-ui)" }}>
                  Add Liability
                </button>
                <button onClick={() => setShowAddLiab(false)}
                  style={{ padding: "8px 14px", background: "#fff", color: "#718096", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-ui,system-ui)" }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Liability list */}
          {liabilities.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#718096" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
              <div style={{ fontWeight: 600 }}>Debt free!</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>No liabilities recorded</div>
            </div>
          ) : liabilities.map(liab => {
            const cat = LIABILITY_CATEGORIES[liab.category];
            return (
              <div key={liab.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "#fff", border: "1px solid #fed7d7", borderRadius: 10,
                padding: "12px 16px", marginBottom: 8,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: "#FFF5F5",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
                }}>
                  {cat.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1c2b3a" }}>{liab.name}</div>
                  <div style={{ fontSize: 11, color: "#a0aec0" }}>
                    {cat.label}
                    {liab.emi ? ` · EMI: ${formatINR(liab.emi)}/month` : ""}
                    {liab.note ? ` · ${liab.note}` : ""}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#E53E3E" }}>{formatINR(liab.value)}</div>
                  <div style={{ fontSize: 11, color: "#a0aec0" }}>{totalLiabilities > 0 ? `${(liab.value/totalLiabilities*100).toFixed(1)}%` : "0%"} of debt</div>
                </div>
                <button onClick={() => removeLiability(liab.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#CBD5E0", fontSize: 16, padding: "0 4px", flexShrink: 0 }}>
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Disclaimer */}
      <div style={{
        marginTop: 28, padding: "10px 14px",
        background: "#F7FAFC", border: "1px solid #E2E8F0",
        borderRadius: 9, fontSize: 11, color: "#718096", lineHeight: 1.6,
      }}>
        🧮 This tracker stores data in your browser session. Use &quot;Save Snapshot&quot; to persist to your account.
        Values are self-reported estimates — consult a financial advisor for comprehensive net worth planning.
      </div>
    </div>
  );
}
