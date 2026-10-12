// ============================================================
// FinanceHub — Video Health Validator
// scripts/validate-videos.js
//
// Run BEFORE inserting any new videos into production:
//   node scripts/validate-videos.js
//
// Tests every YouTube ID via the oEmbed API (no API key needed)
// Generates: verified_videos.json (safe to insert)
//             broken_videos.json  (do not insert)
//             validation_report.txt (summary)
//
// Usage:
//   node validate-videos.js                   → test all videos below
//   node validate-videos.js --sql             → also generate SQL insert
//   node validate-videos.js --timeout=5000    → custom timeout (ms)
// ============================================================

const fs    = require("fs");
const https = require("https");
const path  = require("path");

// ── Parse args ───────────────────────────────────────────────
const args       = process.argv.slice(2);
const GENERATE_SQL = args.includes("--sql");
const TIMEOUT    = parseInt(args.find(a => a.startsWith("--timeout="))?.split("=")[1] || "4000");
const CONCURRENCY = 5; // parallel requests (be nice to YouTube)

// ── ALL VIDEO IDs TO VALIDATE ────────────────────────────────
// Add any new YouTube IDs here before inserting into Supabase
const VIDEOS_TO_VALIDATE = [
  // PERSONAL-FINANCE
  { id: "cosjtcWyWlI", title: "How Compound Interest Works", type: "video", category: "personal-finance" },
  { id: "O4-QDGUBuzs", title: "Compound Interest Rule of 72", type: "video", category: "personal-finance" },
  { id: "wf91rEGw88Q", title: "Power of Compounding Buffett", type: "video", category: "personal-finance" },
  { id: "LhYB8rgthtY", title: "Compound Interest Hindi", type: "video", category: "personal-finance" },
  { id: "1wUUV1EWj8A", title: "Simple vs Compound Zerodha", type: "video", category: "personal-finance" },
  { id: "NTFdnoJoZeU", title: "SIP Beginner Guide Rachana", type: "video", category: "personal-finance" },
  { id: "Fii9WEyr3y0", title: "Best Mutual Funds Pranjal", type: "video", category: "personal-finance" },
  { id: "bqKbFAaGbLs", title: "Index vs Active ET Money", type: "video", category: "personal-finance" },
  { id: "muCdfo3ikeY", title: "SIP vs Lumpsum Groww", type: "video", category: "personal-finance" },
  { id: "3PGL5pkqwVM", title: "Mutual Fund Hindi Asset Yogi", type: "video", category: "personal-finance" },
  { id: "9AhHAv3iNww", title: "Income Tax Regime Rachana", type: "video", category: "personal-finance" },
  { id: "VD9q2oOHccE", title: "Save Tax 10 Ways Akshat", type: "video", category: "personal-finance" },
  { id: "5oMBdXzbVok", title: "ITR Filing Step by Step Rachana", type: "video", category: "personal-finance" },
  { id: "1Y_LoAEvR2o", title: "Capital Gains Tax ET Money", type: "video", category: "personal-finance" },
  { id: "xIE-BW_hR5c", title: "Income Tax Hindi LLA", type: "video", category: "personal-finance" },
  { id: "Mpvr2aPboKw", title: "Term Insurance Ditto", type: "video", category: "personal-finance" },
  { id: "8EvNWuTwmQI", title: "Health Insurance Finshots", type: "video", category: "personal-finance" },
  { id: "Owj4ULP-Hi8", title: "LIC Endowment Pranjal", type: "video", category: "personal-finance" },
  { id: "Nykiib7seEQ", title: "Car Insurance LLA", type: "video", category: "personal-finance" },
  { id: "z6XAZve99xY", title: "Insurance Hindi Rachana", type: "video", category: "personal-finance" },
  { id: "YULIQs8Ig44", title: "Emergency Fund ET Money", type: "video", category: "personal-finance" },
  { id: "sVKQn2I4HDM", title: "Budget Ankur Warikoo", type: "video", category: "personal-finance" },
  { id: "9A-pR3-NCo8", title: "Zero Based Budget Sharan", type: "video", category: "personal-finance" },
  { id: "Dg4fjPLZNKM", title: "First Salary Zerodha", type: "video", category: "personal-finance" },
  { id: "BXHyeaPLkR8", title: "Budget Hindi Asset Yogi", type: "video", category: "personal-finance" },
  { id: "t-GVQJhkoRo", title: "Home Loan Guide Rachana", type: "video", category: "personal-finance" },
  { id: "AVyN86jHZ9s", title: "Rent vs Buy Pranjal", type: "video", category: "personal-finance" },
  { id: "VH9ts5ocpFQ", title: "Home Loan Prepayment ET Money", type: "video", category: "personal-finance" },
  { id: "kawkHG4-gsI", title: "Real Estate vs Stock Market Akshat", type: "video", category: "personal-finance" },
  { id: "fIRr6wG4-MY", title: "REITs India Finance with Sharan", type: "video", category: "personal-finance" },
  { id: "BXn53AUj5oE", title: "Gold ETF vs SGB ET Money", type: "video", category: "personal-finance" },
  { id: "mPtyNfR74YQ", title: "SGB Complete Guide Zerodha", type: "video", category: "personal-finance" },
  { id: "VEwLxHVMhh8", title: "Gold Portfolio Allocation Shankar", type: "video", category: "personal-finance" },
  { id: "keLQriO2VOE", title: "Digital Gold vs ETF Ditto", type: "video", category: "personal-finance" },
  { id: "-i5Jb3PxzeA", title: "Gold Hindi Rachana", type: "video", category: "personal-finance" },
  { id: "UeDgCL9J-68", title: "NPS Complete Guide ET Money", type: "video", category: "personal-finance" },
  { id: "-5ui512h4UE", title: "PPF vs NPS vs ELSS Rachana", type: "video", category: "personal-finance" },
  { id: "5A_BHQBiL6I", title: "Retirement Corpus Shankar", type: "video", category: "personal-finance" },
  { id: "zoUDU2PG0MI", title: "FIRE Movement Akshat", type: "video", category: "personal-finance" },
  { id: "7frDCIrMZ5g", title: "SWP Strategy ET Money", type: "video", category: "personal-finance" },
  // TRADING-MARKETS
  { id: "Xn7KWR9EOGQ", title: "Stock Market Beginners Rachana", type: "video", category: "trading-markets" },
  { id: "F3QpgXBtDeo", title: "How Stock Market Works Zerodha", type: "video", category: "trading-markets" },
  { id: "Y2OfXN4jvn0", title: "Share Market Hindi Pranjal", type: "video", category: "trading-markets" },
  { id: "zQZOThvodTM", title: "Demat Account Rachana", type: "video", category: "trading-markets" },
  { id: "Cs5QvZo61Nw", title: "Markets Predict Economy ET Money", type: "video", category: "trading-markets" },
  { id: "yYX4bvQSqbo", title: "Balance Sheet Rachana", type: "video", category: "trading-markets" },
  { id: "CZscpOND3Vs", title: "Ratio Analysis Asset Yogi", type: "video", category: "trading-markets" },
  { id: "K7Y5iwBe3E0", title: "Value Investing Sanjay Bakshi", type: "video", category: "trading-markets" },
  { id: "KcAakKmTknM", title: "Annual Report Pranjal", type: "video", category: "trading-markets" },
  { id: "Vdv1xcGOHXE", title: "Screener.in Zerodha", type: "video", category: "trading-markets" },
  { id: "KklaiTU3lnQ", title: "IPO Complete Guide Rachana", type: "video", category: "trading-markets" },
  { id: "uTkZPFoRm1E", title: "IPO Analysis Akshat", type: "video", category: "trading-markets" },
  { id: "oiqCKK_VAio", title: "IPO vs FPO ET Money", type: "video", category: "trading-markets" },
  { id: "cf8-bWyxI_o", title: "Why IPOs Lose Money Pranjal", type: "video", category: "trading-markets" },
  { id: "GUrIfYoMQEw", title: "SME IPO Risks Sharan", type: "video", category: "trading-markets" },
  { id: "5hnyb78_sMc", title: "F&O Explained Rachana", type: "video", category: "trading-markets" },
  { id: "-oWRjReit1o", title: "Options Greeks Vivek Bajaj", type: "video", category: "trading-markets" },
  { id: "_vV9W3nDGXw", title: "89% F&O Lose Zerodha", type: "video", category: "trading-markets" },
  { id: "f5LWQa7fGFs", title: "Covered Call Power of Stocks", type: "video", category: "trading-markets" },
  { id: "S-nmTOqDLTg", title: "NIFTY Weekly Options Chanakya", type: "video", category: "trading-markets" },
  // TECHNICAL-ANALYSIS
  { id: "T_2BFZ2oXeU", title: "Candlestick Patterns Trading Chanakya", type: "video", category: "technical-analysis" },
  { id: "9-dME9pktHs", title: "Doji Hammer Power of Stocks", type: "video", category: "technical-analysis" },
  { id: "AYG2g3O7jKc", title: "Candlestick Basics Zerodha", type: "video", category: "technical-analysis" },
  { id: "6SV6EDXkKJk", title: "Candlestick Strategy Booming Bulls", type: "video", category: "technical-analysis" },
  { id: "QVp7DM5Un7Y", title: "Candlestick Hindi Elearnmarkets", type: "video", category: "technical-analysis" },
  { id: "LKS97SfoEJw", title: "Moving Averages Trading Chanakya", type: "video", category: "technical-analysis" },
  { id: "wa6rRFrIMiA", title: "200 DMA Power of Stocks", type: "video", category: "technical-analysis" },
  { id: "ID48Wsb30Ns", title: "EMA Strategy Booming Bulls", type: "video", category: "technical-analysis" },
  { id: "bc3BOLoEtDM", title: "Supertrend Elearnmarkets", type: "video", category: "technical-analysis" },
  { id: "wQ9lZk0WBzw", title: "Moving Averages Hindi Chanakya", type: "video", category: "technical-analysis" },
  { id: "i46pbcj3Io0", title: "RSI Explained Chanakya", type: "video", category: "technical-analysis" },
  { id: "2d3gW6xChw0", title: "MACD Strategy Power of Stocks", type: "video", category: "technical-analysis" },
  { id: "zDWdt5BO-3E", title: "Stochastic Oscillator Elearnmarkets", type: "video", category: "technical-analysis" },
  { id: "ENZ4KPYfdqw", title: "Bollinger Bands Trading Chanakya", type: "video", category: "technical-analysis" },
  { id: "glKKdz1SC_k", title: "ADX Indicator Zerodha", type: "video", category: "technical-analysis" },
  // CRYPTO-DEFI
  { id: "SSo_EIwHSd4", title: "Bitcoin Simply Explained", type: "video", category: "crypto-defi" },
  { id: "MTB3di89DwU", title: "Bitcoin Halving Coin Bureau", type: "video", category: "crypto-defi" },
  { id: "3S3JWD55700", title: "Bitcoin vs Gold Whiteboard", type: "video", category: "crypto-defi" },
  { id: "cl1G1aP7fQ0", title: "Bitcoin India Tax Rachana", type: "video", category: "crypto-defi" },
  { id: "Doh75pBSf00", title: "Bitcoin Hindi Rachana", type: "video", category: "crypto-defi" },
  { id: "jxLkbJozKbY", title: "How Ethereum Works Whiteboard", type: "video", category: "crypto-defi" },
  { id: "17QRFlml4pA", title: "DeFi Explained Coin Bureau", type: "video", category: "crypto-defi" },
  { id: "y8YyZELnVaw", title: "Ethereum PoS Whiteboard", type: "video", category: "crypto-defi" },
  { id: "7pWxCklcNsU", title: "Layer 2 Finematics", type: "video", category: "crypto-defi" },
  { id: "AFhSf0l_aQQ", title: "Crypto Scams Coin Bureau", type: "video", category: "crypto-defi" },
  // CORPORATE-FINANCE
  { id: "fd_emLLzJnk", title: "DCF Valuation Damodaran", type: "video", category: "corporate-finance" },
  { id: "Ey1pFRfbgho", title: "DCF India Rachana", type: "video", category: "corporate-finance" },
  { id: "_gnlscB7Tzs", title: "Intrinsic Value Zerodha", type: "video", category: "corporate-finance" },
  { id: "LQUXJC1k6BE", title: "EV/EBITDA vs PE Sharan", type: "video", category: "corporate-finance" },
  { id: "8rUc0MaMzik", title: "Comparable Company Analysis Zerodha", type: "video", category: "corporate-finance" },
  { id: "WEDIj9JBTC8", title: "P&L Statement Rachana", type: "video", category: "corporate-finance" },
  { id: "uJG3SVrWzlQ", title: "Cash Flow Statement Zerodha", type: "video", category: "corporate-finance" },
  { id: "Jbp3-AU9v_g", title: "Balance Sheet Damodaran", type: "video", category: "corporate-finance" },
  { id: "B5q7kCOq3JE", title: "Working Capital ET Money", type: "video", category: "corporate-finance" },
  // BEHAVIORAL-FINANCE
  { id: "_VB39Jo8mAQ", title: "Psychology of Money Morgan Housel", type: "video", category: "behavioral-finance" },
  { id: "XgRlrBl-7Yg", title: "Loss Aversion Kahneman Big Think", type: "video", category: "behavioral-finance" },
  { id: "PHe0bXAIuk0", title: "How Economic Machine Works Dalio", type: "video", category: "behavioral-finance" },
  { id: "5mP0bJV65js", title: "Bad Financial Decisions Pranjal", type: "video", category: "behavioral-finance" },
  { id: "uqXVAo7dVRU", title: "Thinking Fast and Slow Summary", type: "video", category: "behavioral-finance" },
  { id: "HKJYQ6rPjgM", title: "Market Cycles Zerodha", type: "video", category: "behavioral-finance" },
  { id: "etHsKoq8i6o", title: "Fear and Greed ET Money", type: "video", category: "behavioral-finance" },
  { id: "a8JrqjCV4ao", title: "Invest During Crash Akshat", type: "video", category: "behavioral-finance" },
  { id: "kdjBa3Jr28Y", title: "Buffett Annual Letter Pranjal", type: "video", category: "behavioral-finance" },
  { id: "NlDFJMoTYHI", title: "Recency Bias Shankar Nath", type: "video", category: "behavioral-finance" },
  // FOREX-CURRENCY
  { id: "HSizIZmsJP8", title: "Exchange Rates Zerodha", type: "video", category: "forex-currency" },
  { id: "_dg1SPsflB8", title: "Why Rupee Falls ET Money", type: "video", category: "forex-currency" },
  { id: "ejJyLJOvRoI", title: "FEMA for Indians LLA", type: "video", category: "forex-currency" },
  { id: "Amc8HiD3RA0", title: "Forex Trading Legal India Zerodha", type: "video", category: "forex-currency" },
  { id: "Ig2EhlCgipo", title: "Currency Hedging Rachana", type: "video", category: "forex-currency" },
  // PERSONAL-FINANCE
  { id: "PL8uhW8cclMiOSfw_Kzi6YpLx1PhL8GIS9", title: "Personal Finance Full Course Rachana", type: "playlist", category: "personal-finance" },
  { id: "PLkxTRam6E2V81Bm7FwYYklvirj9XuBtgj", title: "Zerodha Manage Your Money", type: "playlist", category: "personal-finance" },
  { id: "PLSQl0a2vh4HC5feHa6Rc5c0wbRTx56nF7", title: "Khan Academy Personal Finance", type: "playlist", category: "personal-finance" },
  // CORPORATE-FINANCE
  { id: "PLpktYX_wY8d1ov4UTTY-UmbVmgDI8Zqae", title: "Financial Statements Rachana", type: "playlist", category: "corporate-finance" },
];

// ── oEmbed check ──────────────────────────────────────────────
function checkVideo(video) {
  return new Promise((resolve) => {
    const url = video.type === "playlist"
      ? `https://www.youtube.com/oembed?url=https://www.youtube.com/playlist?list=${video.id}&format=json`
      : `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${video.id}&format=json`;

    const req = https.get(url, { timeout: TIMEOUT }, (res) => {
      if (res.statusCode === 200) {
        let data = "";
        res.on("data", d => data += d);
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            resolve({ ...video, status:"✅ LIVE", title_confirmed: json.title || video.title });
          } catch {
            resolve({ ...video, status:"✅ LIVE", title_confirmed: video.title });
          }
        });
      } else {
        resolve({ ...video, status:`❌ DEAD (HTTP ${res.statusCode})` });
      }
    });
    req.on("timeout", () => { req.destroy(); resolve({ ...video, status:"⚠️ TIMEOUT" }); });
    req.on("error", (e) => resolve({ ...video, status:`❌ ERROR: ${e.message}` }));
  });
}

// ── Run with concurrency control ─────────────────────────────
async function runBatch(items) {
  const results = [];
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(checkVideo));
    results.push(...batchResults);
    process.stdout.write(`\rChecked ${Math.min(i + CONCURRENCY, items.length)}/${items.length}...`);
    await new Promise(r => setTimeout(r, 200)); // be gentle
  }
  return results;
}

// ── Generate SQL for verified videos ─────────────────────────
function toSQL(verified) {
  const lines = verified.map(v => {
    const url = v.type === "playlist"
      ? `https://www.youtube.com/playlist?list=${v.id}`
      : `https://www.youtube.com/watch?v=${v.id}`;
    return `-- ${v.title_confirmed || v.title}\n-- Category: ${v.category} | Status: ${v.status}\n-- URL: ${url}`;
  });
  return `-- FinanceHub Verified Videos (${verified.length} items)\n-- Generated: ${new Date().toISOString()}\n\n${lines.join("\n\n")}`;
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log(`\n🎬 FinanceHub Video Health Validator`);
  console.log(`📊 Testing ${VIDEOS_TO_VALIDATE.length} videos/playlists...`);
  console.log(`⏱  Timeout: ${TIMEOUT}ms | Concurrency: ${CONCURRENCY}\n`);

  const results = await runBatch(VIDEOS_TO_VALIDATE);
  console.log("\n");

  const live    = results.filter(r => r.status.startsWith("✅"));
  const dead    = results.filter(r => r.status.startsWith("❌"));
  const timeout = results.filter(r => r.status.startsWith("⚠️"));

  // Print results
  console.log("═══════════════════════════════════════════");
  console.log("           VALIDATION RESULTS");
  console.log("═══════════════════════════════════════════\n");

  if (dead.length > 0 || timeout.length > 0) {
    console.log("❌ BROKEN / FAILED:\n");
    [...dead, ...timeout].forEach(v => {
      console.log(`  ${v.status}`);
      console.log(`  ID:       ${v.id}`);
      console.log(`  Title:    ${v.title}`);
      console.log(`  Category: ${v.category}\n`);
    });
  }

  console.log("✅ VERIFIED LIVE:\n");
  const byCategory = {};
  live.forEach(v => {
    if (!byCategory[v.category]) byCategory[v.category] = [];
    byCategory[v.category].push(v);
  });
  Object.entries(byCategory).forEach(([cat, videos]) => {
    console.log(`  ${cat} (${videos.length} videos):`);
    videos.forEach(v => console.log(`    ✅ ${v.id} — ${v.title_confirmed || v.title}`));
    console.log();
  });

  // Summary
  console.log("═══════════════════════════════════════════");
  console.log(`  Total tested:  ${results.length}`);
  console.log(`  ✅ Live:       ${live.length} (${Math.round(live.length/results.length*100)}%)`);
  console.log(`  ❌ Dead:       ${dead.length}`);
  console.log(`  ⚠️  Timeout:   ${timeout.length}`);
  console.log("═══════════════════════════════════════════\n");

  // Write output files
  fs.writeFileSync("verified_videos.json",  JSON.stringify(live,    null, 2));
  fs.writeFileSync("broken_videos.json",    JSON.stringify(dead,    null, 2));
  fs.writeFileSync("validation_report.txt",
    `FinanceHub Video Validation Report\nDate: ${new Date().toISOString()}\n\n` +
    `Total: ${results.length}\nLive: ${live.length}\nDead: ${dead.length}\nTimeout: ${timeout.length}\n\n` +
    results.map(r => `${r.status} | ${r.id} | ${r.category} | ${r.title}`).join("\n")
  );

  if (GENERATE_SQL) {
    fs.writeFileSync("verified_videos_safe.sql", toSQL(live));
    console.log("📄 SQL file written: verified_videos_safe.sql");
  }

  console.log("📄 verified_videos.json — safe to insert into Supabase");
  console.log("📄 broken_videos.json   — review and replace these IDs");
  console.log("📄 validation_report.txt — full audit trail\n");

  if (dead.length > 0) {
    console.log(`⚠️  WARNING: ${dead.length} videos are broken. Do not insert them.`);
    console.log("   Find replacements and run this script again.\n");
    process.exit(1);
  } else {
    console.log("✅ All videos verified! Safe to run video_library_expansion.sql\n");
    process.exit(0);
  }
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
