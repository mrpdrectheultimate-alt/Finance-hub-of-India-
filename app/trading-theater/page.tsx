"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";

// ============================================================
// FinanceHub — 3D Animated Trading Theater
// app/trading-theater/page.tsx
//
// Browser-native animated trading scenarios with:
// - Real-time candlestick chart animation
// - Step-by-step strategy overlays
// - Natural AI voice narration (Web Speech API)
// - Interactive decision checkpoints
// - Cinematic dark terminal aesthetic
// - 10 complete trading scenarios
// - SEBI-compliant disclaimers throughout
// ============================================================

// ── TYPES ────────────────────────────────────────────────────
interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  time: string;
}

interface Step {
  id: number;
  title: string;
  narration: string;
  action: string;
  rule?: string;
  calculation?: string;
  checkpoint?: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  };
  chartAction?:
    | "draw_resistance"
    | "draw_support"
    | "mark_entry"
    | "mark_stop"
    | "mark_target"
    | "draw_ma"
    | "draw_rsi"
    | "show_order"
    | "mark_exit"
    | "draw_macd"
    | "highlight_candle"
    | "show_calculation"
    | "trail_stop";
  chartData?: Record<string, unknown>;
  highlight?: number[];
  pause?: boolean;
}

interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  icon: string;
  isPro: boolean;
  disclaimer: string;
  steps: Step[];
  candles: Candle[];
  instrument: string;
  timeframe: string;
  dataSource: string;
}

// ── CANDLE DATA (Historical — Educational Only) ───────────────
const NIFTY_CANDLES: Candle[] = [
  { open: 21800, high: 21850, low: 21750, close: 21820, volume: 1200000, time: "09:15" },
  { open: 21820, high: 21900, low: 21800, close: 21880, volume: 1500000, time: "09:30" },
  { open: 21880, high: 21920, low: 21860, close: 21870, volume: 980000,  time: "09:45" },
  { open: 21870, high: 21890, low: 21820, close: 21830, volume: 850000,  time: "10:00" },
  { open: 21830, high: 21860, low: 21800, close: 21810, volume: 760000,  time: "10:15" },
  { open: 21810, high: 21840, low: 21790, close: 21800, volume: 680000,  time: "10:30" },
  { open: 21800, high: 21820, low: 21780, close: 21790, volume: 720000,  time: "10:45" },
  { open: 21790, high: 21810, low: 21760, close: 21770, volume: 890000,  time: "11:00" },
  { open: 21770, high: 21800, low: 21750, close: 21780, volume: 1100000, time: "11:15" },
  { open: 21780, high: 21850, low: 21770, close: 21840, volume: 1800000, time: "11:30" },
  { open: 21840, high: 21920, low: 21830, close: 21910, volume: 2200000, time: "11:45" },
  { open: 21910, high: 21980, low: 21900, close: 21970, volume: 2500000, time: "12:00" },
  { open: 21970, high: 22050, low: 21960, close: 22040, volume: 2100000, time: "12:15" },
  { open: 22040, high: 22100, low: 22020, close: 22080, volume: 1900000, time: "12:30" },
  { open: 22080, high: 22150, low: 22060, close: 22130, volume: 1700000, time: "12:45" },
];

const RSI_CANDLES: Candle[] = [
  { open: 2800, high: 2850, low: 2780, close: 2820, volume: 800000,  time: "09:15" },
  { open: 2820, high: 2830, low: 2760, close: 2770, volume: 900000,  time: "09:30" },
  { open: 2770, high: 2780, low: 2720, close: 2730, volume: 1100000, time: "09:45" },
  { open: 2730, high: 2740, low: 2680, close: 2690, volume: 1300000, time: "10:00" },
  { open: 2690, high: 2700, low: 2650, close: 2660, volume: 1500000, time: "10:15" },
  { open: 2660, high: 2670, low: 2630, close: 2640, volume: 1400000, time: "10:30" },
  { open: 2640, high: 2650, low: 2610, close: 2620, volume: 1200000, time: "10:45" },
  { open: 2620, high: 2630, low: 2600, close: 2610, volume: 1100000, time: "11:00" },
  { open: 2610, high: 2640, low: 2600, close: 2635, volume: 900000,  time: "11:15" },
  { open: 2635, high: 2680, low: 2630, close: 2670, volume: 1600000, time: "11:30" },
  { open: 2670, high: 2730, low: 2660, close: 2720, volume: 2000000, time: "11:45" },
  { open: 2720, high: 2790, low: 2710, close: 2780, volume: 1800000, time: "12:00" },
  { open: 2780, high: 2840, low: 2770, close: 2830, volume: 1600000, time: "12:15" },
  { open: 2830, high: 2880, low: 2820, close: 2860, volume: 1400000, time: "12:30" },
  { open: 2860, high: 2900, low: 2850, close: 2890, volume: 1200000, time: "12:45" },
];

const TATAMOTORS_CANDLES: Candle[] = [
  { open: 935, high: 945, low: 930, close: 940, volume: 3400000, time: "09:15" },
  { open: 940, high: 942, low: 928, close: 930, volume: 2800000, time: "09:30" },
  { open: 930, high: 935, low: 922, close: 925, volume: 3100000, time: "09:45" },
  { open: 925, high: 932, low: 924, close: 930, volume: 2400000, time: "10:00" },
  { open: 930, high: 938, low: 929, close: 936, volume: 2600000, time: "10:15" },
  { open: 936, high: 946, low: 934, close: 944, volume: 3900000, time: "10:30" },
  { open: 944, high: 955, low: 942, close: 952, volume: 4500000, time: "10:45" },
  { open: 952, high: 968, low: 950, close: 965, volume: 5800000, time: "11:00" },
  { open: 965, high: 978, low: 962, close: 975, volume: 6200000, time: "11:15" },
  { open: 975, high: 985, low: 972, close: 982, volume: 4900000, time: "11:30" },
  { open: 982, high: 994, low: 980, close: 990, volume: 5100000, time: "11:45" },
  { open: 990, high: 1005, low: 988, close: 1002, volume: 6800000, time: "12:00" },
  { open: 1002, high: 1012, low: 998, close: 1008, volume: 5900000, time: "12:15" },
  { open: 1008, high: 1018, low: 1004, close: 1015, volume: 5400000, time: "12:30" },
  { open: 1015, high: 1025, low: 1010, close: 1022, volume: 4800000, time: "12:45" },
];

const HDFCBANK_CANDLES: Candle[] = [
  { open: 1460, high: 1465, low: 1445, close: 1450, volume: 2200000, time: "09:15" },
  { open: 1450, high: 1452, low: 1438, close: 1440, volume: 2600000, time: "09:30" },
  { open: 1440, high: 1444, low: 1428, close: 1430, volume: 3100000, time: "09:45" },
  { open: 1430, high: 1435, low: 1418, close: 1422, volume: 3800000, time: "10:00" },
  { open: 1422, high: 1425, low: 1410, close: 1412, volume: 4200000, time: "10:15" },
  { open: 1412, high: 1418, low: 1402, close: 1405, volume: 4900000, time: "10:30" },
  { open: 1405, high: 1410, low: 1395, close: 1402, volume: 5600000, time: "10:45" },
  { open: 1402, high: 1416, low: 1380, close: 1414, volume: 7800000, time: "11:00" }, // Hammer
  { open: 1414, high: 1432, low: 1412, close: 1430, volume: 6400000, time: "11:15" }, // Confirm
  { open: 1430, high: 1445, low: 1428, close: 1442, volume: 5200000, time: "11:30" },
  { open: 1442, high: 1458, low: 1440, close: 1455, volume: 4800000, time: "11:45" },
  { open: 1455, high: 1470, low: 1452, close: 1466, volume: 4400000, time: "12:00" },
  { open: 1466, high: 1478, low: 1462, close: 1475, volume: 4100000, time: "12:15" },
  { open: 1475, high: 1488, low: 1472, close: 1484, volume: 3900000, time: "12:30" },
  { open: 1484, high: 1495, low: 1480, close: 1490, volume: 3600000, time: "12:45" },
];

const INFY_CANDLES: Candle[] = [
  { open: 1540, high: 1555, low: 1535, close: 1550, volume: 1800000, time: "09:15" },
  { open: 1550, high: 1568, low: 1548, close: 1564, volume: 2200000, time: "09:30" },
  { open: 1564, high: 1578, low: 1560, close: 1575, volume: 2400000, time: "09:45" },
  { open: 1575, high: 1588, low: 1572, close: 1585, volume: 2100000, time: "10:00" },
  { open: 1585, high: 1600, low: 1582, close: 1596, volume: 2700000, time: "10:15" },
  { open: 1596, high: 1608, low: 1592, close: 1605, volume: 2300000, time: "10:30" },
  { open: 1605, high: 1618, low: 1600, close: 1614, volume: 2100000, time: "10:45" },
  { open: 1614, high: 1625, low: 1610, close: 1622, volume: 1700000, time: "11:00" }, // Higher high, declining vol
  { open: 1622, high: 1628, low: 1612, close: 1615, volume: 1900000, time: "11:15" },
  { open: 1615, high: 1618, low: 1598, close: 1600, volume: 3200000, time: "11:30" }, // Breakdown
  { open: 1600, high: 1602, low: 1582, close: 1586, volume: 3900000, time: "11:45" },
  { open: 1586, high: 1588, low: 1568, close: 1572, volume: 4400000, time: "12:00" },
  { open: 1572, high: 1575, low: 1555, close: 1560, volume: 3800000, time: "12:15" },
  { open: 1560, high: 1562, low: 1542, close: 1548, volume: 3500000, time: "12:30" },
  { open: 1548, high: 1550, low: 1530, close: 1535, volume: 3200000, time: "12:45" },
];

// ── 10 COMPLETE SCENARIOS DATA ────────────────────────────────
const SCENARIOS: Scenario[] = [
  {
    id: "support-resistance-breakout",
    title: "Support & Resistance Breakout",
    subtitle: "How to identify, wait, and enter a clean breakout trade",
    category: "Price Action",
    difficulty: "Beginner",
    duration: "4 min",
    icon: "📊",
    isPro: false,
    instrument: "NIFTY 50",
    timeframe: "15-minute chart",
    dataSource: "Historical simulation — March 2024",
    disclaimer: "Educational simulation using historical data. Not investment advice. Past performance does not guarantee future results.",
    candles: NIFTY_CANDLES,
    steps: [
      {
        id: 1,
        title: "Identify the Resistance Zone",
        narration: "We are looking at NIFTY 50 on a 15-minute chart. This is historical data from March 2024, used purely for educational purposes. Our first step is to identify where the market has previously rejected — the resistance zone. Notice how price tested the 21,900 level twice and reversed both times. This creates a resistance zone between 21,880 and 21,920.",
        action: "Drawing horizontal resistance zone on chart",
        rule: "Rule 1: A resistance zone requires minimum 2 price rejections at the same level",
        chartAction: "draw_resistance",
        chartData: { level: 21900, zone_high: 21920, zone_low: 21880 },
      },
      {
        id: 2,
        title: "Wait for the Breakout Signal",
        narration: "Now we wait. This is the hardest part of trading — patience. We do NOT enter just because price is approaching resistance. We wait for a confirmed close ABOVE the resistance zone. Watch this candle carefully. The body must close above 21,920. A wick above does not count — the closing price is our signal.",
        action: "Watching candle 10 form and close above resistance",
        rule: "Rule 2: Wait for candle CLOSE above resistance — not just a wick or intraday touch",
        highlight: [9, 10],
        chartAction: "highlight_candle",
      },
      {
        id: 3,
        title: "Calculate Position Size — The 1% Rule",
        narration: "Before we enter, we MUST calculate our position size. This is non-negotiable. We never risk more than 1 percent of our trading capital on a single trade. Assume our capital is 5 lakh rupees. One percent is 5,000 rupees maximum risk. Our stop-loss will be at 21,780 — below the breakout candle's low. That is a 190-point stop. Position size equals maximum risk divided by stop distance: 5,000 divided by 190 equals approximately 26 units.",
        action: "Calculating position size using risk management formula",
        rule: "Rule 3: Never risk more than 1% of capital on any single trade",
        calculation: "Capital: ₹5,00,000 | Max Risk (1%): ₹5,000\nStop Distance: 21,970 − 21,780 = 190 points\nPosition Size: ₹5,000 ÷ 190 = 26 units",
        chartAction: "show_calculation",
      },
      {
        id: 4,
        title: "Place the Entry Order",
        narration: "Breakout confirmed. Candle has closed at 21,970 — above our resistance zone. We enter a buy order at market price 21,970. Simultaneously, we place our stop-loss at 21,780 — just below the breakout candle's low. This is our defined risk. If price returns below 21,780, our thesis is wrong and we exit.",
        action: "Placing buy order at 21,970 with stop-loss at 21,780",
        rule: "Rule 4: Entry and stop-loss must be placed simultaneously — never enter without a stop",
        chartAction: "mark_entry",
        chartData: { entry: 21970, stop: 21780 },
      },
      {
        id: 5,
        title: "Decision Checkpoint",
        narration: "Let me pause here. Before I reveal what happened next, I want you to think like a trader.",
        action: "Interactive checkpoint — test your understanding",
        checkpoint: {
          question: "Price rises to 22,050 after your entry at 21,970. What should you do with your stop-loss?",
          options: [
            "Move stop-loss up to 21,900 to lock in some profit",
            "Keep stop-loss at the original level of 21,780",
            "Remove the stop-loss since you are in profit",
            "Add to your position by buying more units",
          ],
          correct: 0,
          explanation: "Correct — trail your stop-loss up to lock in profit as price moves in your favor. Moving it to 21,900 means your worst case is now a small profit, not a loss. Never remove a stop-loss. Never average up randomly — it increases risk.",
        },
        pause: true,
      },
      {
        id: 6,
        title: "Trail the Stop-Loss",
        narration: "Price moved up 80 points in our favor. We now trail our stop-loss up to 21,900 — just below the most recent swing low. This locks in approximately 120 rupees per unit of potential profit if stopped out. We never move the stop FURTHER from our entry — that is the cardinal sin of risk management.",
        action: "Trailing stop-loss from 21,780 up to 21,900",
        rule: "Rule 5: Trail stops in the direction of the trade ONLY — never widen a stop against you",
        chartAction: "trail_stop",
        chartData: { old_stop: 21780, new_stop: 21900 },
      },
      {
        id: 7,
        title: "Exit at Target",
        narration: "Our target was set at a 1-to-2 risk-reward. Entry at 21,970, stop at 21,780 — that is 190 points risk. Target is 190 multiplied by 2 equals 380 points above entry — so 22,350. Price reached 22,130 in this session. We exit here with a partial target. Result: 26 units multiplied by 160 points equals approximately 4,160 rupees profit. Risk was 5,000 rupees. This is a losing risk-reward but a winning trade in absolute terms.",
        action: "Exiting position at 22,130 — partial target hit",
        rule: "Rule 6: Always review actual vs planned risk-reward after every trade",
        calculation: "Entry: 21,970 | Exit: 22,130 | Stop: 21,780\nP&L: 26 units × 160 pts = +₹4,160\nRisk taken: ₹5,000 | Reward received: ₹4,160\nNote: Process was correct even though target wasn't fully reached",
        chartAction: "mark_exit",
        chartData: { exit: 22130 },
      },
      {
        id: 8,
        title: "Trade Journal Entry",
        narration: "After every trade, successful traders write in their journal. Not just the profit or loss — but the process. Did you follow all six rules? Was your entry valid? Was your stop in the right place? The goal of trading education is to build a repeatable, rule-based process — not to predict the market. The market is unpredictable. Your process must not be.",
        action: "Recording trade in journal — process review",
        rule: "Rule 7: Journal every trade — focus on process quality, not just outcome",
        calculation: "Journal Entry:\n✅ Resistance identified: YES\n✅ Waited for candle close: YES\n✅ Risk calculated before entry: YES\n✅ Stop placed simultaneously: YES\n✅ Stop never widened: YES\n✅ Exit at defined level: YES\nProcess Score: 6/6 — Excellent",
      },
    ],
  },
  {
    id: "rsi-oversold-bounce",
    title: "RSI Oversold Bounce Strategy",
    subtitle: "Using RSI divergence to identify high-probability reversal entries",
    category: "Momentum",
    difficulty: "Intermediate",
    duration: "5 min",
    icon: "📉",
    isPro: false,
    instrument: "RELIANCE Industries",
    timeframe: "15-minute chart",
    dataSource: "Historical simulation — February 2024",
    disclaimer: "Educational simulation using historical data. Not investment advice.",
    candles: RSI_CANDLES,
    steps: [
      {
        id: 1,
        title: "What is RSI and Why It Matters",
        narration: "The Relative Strength Index, or RSI, measures the momentum of price movement on a scale of 0 to 100. Readings below 30 indicate oversold conditions — meaning the selling has been excessive and a bounce may be due. Readings above 70 indicate overbought conditions. Important: RSI is a guide, not a guarantee. We use it as one piece of evidence, never in isolation.",
        action: "Drawing RSI indicator below the main chart",
        rule: "Rule 1: RSI below 30 = oversold signal. Use as confirmation — never as a standalone entry",
        chartAction: "draw_rsi",
      },
      {
        id: 2,
        title: "Spot the Divergence",
        narration: "Here is the powerful setup we are looking for: RSI divergence. Look at the price chart — it is making lower lows. But look at the RSI — it is making higher lows. This mismatch between price and momentum is called bullish divergence. It tells us that even though price is falling, the selling pressure is weakening. Smart money is quietly accumulating.",
        action: "Drawing divergence lines on price and RSI",
        rule: "Rule 2: Bullish divergence = price makes lower low but RSI makes higher low",
        highlight: [4, 5, 6, 7, 8],
        chartAction: "draw_rsi",
      },
      {
        id: 3,
        title: "Identify the Entry Trigger",
        narration: "Divergence alone is not enough to enter. We need a trigger — a confirmation that the reversal has actually started. Our trigger is a bullish engulfing candle: one where the current candle's green body completely engulfs the previous red candle. Watch candle number 10 in our sequence. It opens at 2,610 and closes at 2,635 — a clear engulfing pattern after the divergence signal.",
        action: "Highlighting the bullish engulfing candle at the trigger point",
        rule: "Rule 3: Wait for a trigger candle to confirm the divergence — engulfing, pin bar, or close above previous high",
        highlight: [8, 9],
        chartAction: "highlight_candle",
        checkpoint: {
          question: "You see RSI divergence but no trigger candle yet. Should you enter now?",
          options: [
            "Yes — the divergence is strong enough",
            "No — wait for a trigger candle to confirm",
            "Yes — but with half position size",
            "No — divergence alone never works",
          ],
          correct: 1,
          explanation: "Correct. Always wait for the trigger. Divergence shows potential — the trigger candle confirms the reversal has actually begun. Entering on divergence alone means entering into a still-falling market.",
        },
        pause: true,
      },
      {
        id: 4,
        title: "Calculate Entry, Stop and Target",
        narration: "Trigger confirmed at candle 10. We enter at 2,635. Stop-loss goes below the most recent swing low at 2,600 — a 35-point risk. Our minimum target is 1-to-2 risk-reward: 35 points times 2 equals 70 points above entry, so 2,705. With capital of 3 lakh and 1% risk, maximum loss is 3,000 rupees. Position size is 3,000 divided by 35 equals 85 units.",
        action: "Drawing entry, stop and target lines on chart",
        rule: "Rule 4: Minimum 1:2 risk-reward. Target must be defined BEFORE entry.",
        calculation: "Entry: ₹2,635 | Stop: ₹2,600 | Target: ₹2,705\nRisk: 35 pts | Reward: 70 pts | RR: 1:2\nCapital: ₹3,00,000 | Max Risk (1%): ₹3,000\nPosition: 3,000 ÷ 35 = 85 units",
        chartAction: "mark_entry",
        chartData: { entry: 2635, stop: 2600, target: 2705 },
      },
      {
        id: 5,
        title: "Exit — Target Reached",
        narration: "Price moved from our entry at 2,635 all the way to 2,890 — well beyond our initial target of 2,705. In practice, we would have taken partial profits at the first target and trailed the stop for the remaining position. Final exit at 2,780 for the trailing portion. This trade demonstrates the power of combining RSI divergence with a trigger candle — but always remember: it does not work every time. Show your losses too.",
        action: "Exiting at target level — trade complete",
        calculation: "Initial exit (50%) at 2,705: +₹2,975\nTrailing exit (50%) at 2,780: +₹6,162\nTotal P&L: +₹9,137 on ₹3,000 risk\nNote: This was an exceptionally good trade outcome — not typical",
        chartAction: "mark_exit",
        chartData: { exit: 2780 },
      },
    ],
  },
  {
    id: "stop-loss-mastery",
    title: "Stop-Loss Placement Mastery",
    subtitle: "The exact rules for placing stops — and why most traders get it wrong",
    category: "Risk Management",
    difficulty: "Beginner",
    duration: "4 min",
    icon: "🛡️",
    isPro: false,
    instrument: "BANKNIFTY",
    timeframe: "5-minute chart",
    dataSource: "Historical simulation — January 2024",
    disclaimer: "Educational simulation using historical data. Not investment advice.",
    candles: NIFTY_CANDLES,
    steps: [
      {
        id: 1,
        title: "What a Stop-Loss Actually Is",
        narration: "A stop-loss is a pre-set instruction to your broker: if price reaches this level, exit my position automatically. It is not a prediction. It is not a defeat. It is a business decision. Professional traders do not think about stop-losses as 'losing.' They think of it as: 'This is the maximum price I am willing to pay to find out if my trade thesis is wrong.'",
        action: "Demonstrating stop-loss concept on a clean chart",
        rule: "Core Rule: A stop-loss defines your maximum loss BEFORE you enter — not after",
      },
      {
        id: 2,
        title: "Where NOT to Place a Stop-Loss",
        narration: "Most beginners make three stop-loss mistakes. First: placing it at a round number like 22,000. Market makers know everyone puts stops there — price hunts them before reversing. Second: placing it too tight — within normal market noise. If your stock moves 50 points in a normal 15-minute candle, a 30-point stop will be hit by random noise. Third: placing it based on how much money you want to risk — not on the chart structure.",
        action: "Showing examples of 3 wrong stop-loss placements",
        rule: "Wrong Method 1: Round numbers | Wrong Method 2: Too tight (inside noise) | Wrong Method 3: Arbitrary rupee amounts",
        checkpoint: {
          question: "You buy NIFTY at 22,000. Normal candle range is 40-60 points. Where is the WRONG place for your stop?",
          options: [
            "21,950 — below recent swing low",
            "21,980 — only 20 points away",
            "21,920 — below the recent consolidation",
            "21,900 — below a clear support zone",
          ],
          correct: 1,
          explanation: "21,980 is only 20 points away — within the normal 40-60 point candle range. This will be hit by random noise almost immediately, even if your trade direction is correct.",
        },
        pause: true,
      },
      {
        id: 3,
        title: "The Correct Method — Structure-Based Stops",
        narration: "The correct stop-loss is placed at a level where, if reached, your trade thesis is proven wrong — not where you lose too much money. For a long trade, place stop below the most recent significant swing low. For a short trade, place stop above the most recent significant swing high. The stop tells a story: if price goes here, the buyers are no longer in control.",
        action: "Drawing structure-based stop-loss on the correct side of a swing low",
        rule: "Correct Method: Place stop beyond the structural level that invalidates your trade thesis",
        chartAction: "mark_stop",
        chartData: { stop: 21750 },
      },
      {
        id: 4,
        title: "The Cardinal Sin — Moving Stop Against You",
        narration: "This is the single most destructive habit in trading. Price goes against you. You are about to be stopped out. Instead of accepting the loss, you move your stop further away. Now you have a larger loss. If price comes back, you say 'see, I was right.' But most times, it does not come back. A 5,000 rupee loss becomes 20,000 rupees. This is how accounts get wiped out.",
        action: "Animated example showing stop being moved — account devastation",
        rule: "Cardinal Sin: NEVER move your stop-loss further from your entry. Stops may only be moved IN the direction of profit.",
      },
    ],
  },
  {
    id: "risk-reward-master",
    title: "Risk-Reward Ratio — The Math of Trading",
    subtitle: "Why you can lose 60% of your trades and still be profitable",
    category: "Risk Management",
    difficulty: "Beginner",
    duration: "3 min",
    icon: "⚖️",
    isPro: false,
    instrument: "Conceptual — Any Market",
    timeframe: "Concept demonstration",
    dataSource: "Mathematical demonstration",
    disclaimer: "Mathematical demonstration only. Not investment advice.",
    candles: NIFTY_CANDLES,
    steps: [
      {
        id: 1,
        title: "The Surprising Math of Trading",
        narration: "Here is something that surprises almost every beginner: you do NOT need to win most of your trades to be profitable. You need your winners to be bigger than your losers. Watch this demonstration carefully. Trader A wins 70% of trades but risks 3 to make 1. Trader B wins only 40% but risks 1 to make 3. After 10 trades, who has more money?",
        action: "Side-by-side comparison of two trading scenarios",
        calculation: "Trader A (70% win, 1:1 RR):\n7 wins × ₹1,000 = +₹7,000\n3 losses × ₹1,000 = -₹3,000\nNet: +₹4,000 ✅\n\nTrader B (40% win, 1:3 RR):\n4 wins × ₹3,000 = +₹12,000\n6 losses × ₹1,000 = -₹6,000\nNet: +₹6,000 ✅✅",
      },
      {
        id: 2,
        title: "The Minimum Standard — 1:2 Risk-Reward",
        narration: "For most strategies, a minimum 1-to-2 risk-reward is required. This means for every rupee you risk, you must aim to make at least 2 rupees. At 1-to-2, you only need to win 34% of your trades to break even. At 1-to-3, you only need 25%. This is why professional traders obsess over risk-reward — not win rate.",
        action: "Break-even win rate calculator visualization",
        calculation: "Minimum win rates to break even:\n1:1 RR → Need 50%+ win rate\n1:2 RR → Need 34%+ win rate\n1:3 RR → Need 25%+ win rate\n1:4 RR → Need 20%+ win rate",
        checkpoint: {
          question: "You have a strategy that wins 45% of the time. What is the MINIMUM risk-reward needed to be profitable?",
          options: [
            "1:1 — you need 50% to be profitable at 1:1",
            "1:1.2 — any ratio above 1:1.2 works",
            "1:2 — need 34% minimum, and 45% > 34%",
            "1:3 — to be safe, always use at least 1:3",
          ],
          correct: 2,
          explanation: "At 1:2 risk-reward, you only need a 34% win rate to break even. With a 45% win rate, you generate consistent edge and edge longevity. Never trade setups under 1:1.5.",
        },
        pause: true,
      },
      {
        id: 3,
        title: "Visualizing a Losing Streak",
        narration: "Every trader faces losing streaks. With proper risk management, losing streaks are survivable. With poor risk management, they are account-ending. Watch what happens to two traders during a 10-trade losing streak. Trader A risks 10% per trade. Trader B risks 1% per trade. Starting capital 1 lakh rupees.",
        action: "Animated drawdown visualization",
        calculation: "10-trade losing streak impact:\nTrader A (10% risk/trade): ₹1,00,000 → ₹34,868 (65% drawdown!)\nTrader B (1% risk/trade): ₹1,00,000 → ₹90,438 (only 9.5% drawdown)\n\nRecovery needed after 65% drawdown: +186% just to break even!\nRecovery needed after 9.5% drawdown: +10.5% — very achievable",
        rule: "The 1% Rule is not conservative — it is how professionals survive long enough to win",
      },
    ],
  },
  {
    id: "options-call-buying",
    title: "Call Option Buying — Entry to Exit",
    subtitle: "How to buy a call option correctly: strike selection, Greeks, and exit",
    category: "Derivatives",
    difficulty: "Advanced",
    duration: "6 min",
    icon: "📈",
    isPro: true,
    instrument: "NIFTY 50 Options",
    timeframe: "Expiry week — weekly options",
    dataSource: "Historical simulation — April 2024",
    disclaimer: "F&O trading involves significant risk. 89% of individual F&O traders lose money (SEBI 2023). Educational only. Not investment advice.",
    candles: NIFTY_CANDLES,
    steps: [
      {
        id: 1,
        title: "Understanding What You Are Buying",
        narration: "When you buy a call option, you are buying the RIGHT — not the obligation — to purchase NIFTY at a specific price, called the strike price, by a specific date, called the expiry. You pay a premium upfront. This premium is your maximum possible loss. Unlike futures, a call option buyer cannot lose more than the premium paid. Today we will walk through buying a NIFTY 22,000 CE expiring this Thursday.",
        action: "Options chain visualization — highlighting call options",
        rule: "Core Concept: Call buyer's max loss = premium paid. Profit is unlimited.",
      },
      {
        id: 2,
        title: "Strike Selection — ATM vs OTM",
        narration: "NIFTY is trading at 21,970. We have three choices. Deep in-the-money: 21,700 CE, premium 310 rupees. At-the-money: 22,000 CE, premium 145 rupees. Out-of-the-money: 22,200 CE, premium 52 rupees. For a directional trade expecting a 200-point NIFTY move, the ATM option at 22,000 offers the best balance of cost, delta sensitivity, and manageable theta decay.",
        action: "Options chain showing three strike selections with Greeks",
        calculation: "Options Chain Snapshot:\n21,700 CE: Premium ₹310 | Delta 0.72 | Theta -₹18/day\n22,000 CE: Premium ₹145 | Delta 0.48 | Theta -₹22/day ← Chosen\n22,200 CE: Premium ₹52  | Delta 0.28 | Theta -₹15/day\n\nChoice: 22,000 CE — best delta for the expected move",
        rule: "Strike selection rule: For directional trades, ATM or slightly OTM offers best risk-reward",
      },
      {
        id: 3,
        title: "Understanding Theta — Your Enemy",
        narration: "This is critical. Every single day, your option loses value due to time decay — called Theta. Our 22,000 CE loses 22 rupees per day just from time passing, even if NIFTY stays completely flat. On Monday morning with 4 days to expiry, your option premium is 145 rupees. On Thursday morning — even if NIFTY has not moved — your premium may only be 40 rupees. Time is always working against the option buyer.",
        action: "Theta decay visualization — daily premium erosion",
        calculation: "Theta impact on 22,000 CE premium:\nMonday (4 days): ₹145\nTuesday (3 days): ₹123 (-₹22)\nWednesday (2 days): ₹90 (-₹33)\nThursday morning (1 day): ₹52 (-₹38)\nThursday expiry (0 days): ₹0 if OTM\n\nKey insight: Theta ACCELERATES near expiry. Avoid holding overnight.",
        checkpoint: {
          question: "You bought NIFTY 22,000 CE for ₹145 on Monday. By Wednesday NIFTY is flat. What is your P&L approximately?",
          options: [
            "₹0 — NIFTY didn't move so nothing changed",
            "-₹55 — theta decay of ~₹55 over 2 days",
            "+₹50 — options gain value over time",
            "-₹145 — option expired worthless",
          ],
          correct: 1,
          explanation: "Correct. Even with NIFTY completely flat, your option lost ~₹55 in 2 days purely from theta decay. This is why option buyers need the underlying to move — and move FAST. Holding options for days while the underlying is flat is a guaranteed loss.",
        },
        pause: true,
      },
      {
        id: 4,
        title: "Entry Rules for Options Buying",
        narration: "We buy the 22,000 CE on Tuesday morning when NIFTY breaks above 21,980 — our technical signal from the chart. We buy 1 lot — 50 units. Total premium paid: 145 times 50 equals 7,250 rupees. This is our MAXIMUM possible loss on this trade. Our profit target is premium doubling to 290 rupees. Our stop is premium halving to 72 rupees.",
        action: "Placing options buy order — premium, lot size, total outlay",
        calculation: "Trade Setup:\nOption: NIFTY 22,000 CE | Lots: 1 (50 units)\nEntry Premium: ₹145 | Total cost: ₹7,250\nProfit Target: ₹290 premium (+₹7,250)\nStop-Loss: ₹72 premium (-₹3,650)\nMax Loss (if held to 0): ₹7,250",
        rule: "Options entry rule: Define profit target and stop in terms of PREMIUM — not NIFTY points",
      },
      {
        id: 5,
        title: "Exit — Premium Target Hit",
        narration: "NIFTY moved up to 22,130. Our 22,000 CE premium rose from 145 to 284 rupees — just below our target of 290. We exit here. Profit: 284 minus 145 equals 139 rupees per unit. Times 50 units equals 6,950 rupees profit on a 7,250 rupee investment in under 2 hours. This is the power of options — but also remember the SEBI study: 89% of F&O traders lose money. The winning trades feel easy. The discipline to cut losses at the stop is what separates the 11% who profit.",
        action: "Exiting call option at target — final P&L calculation",
        calculation: "Exit Premium: ₹284 | Entry: ₹145\nProfit per unit: ₹139 | Total profit: ₹6,950\nReturn on premium invested: 96% in 2 hours\n\nWARNING: This was a favorable outcome. SEBI data shows 89% of F&O\ntraders lose money annually. Always use stops. Never over-leverage.",
        rule: "F&O Exit Rule: Exit at your defined premium target or stop — never hold hoping for more",
      },
    ],
  },
  {
    id: "moving-average-golden-cross",
    title: "20/50 Moving Average Golden Cross",
    subtitle: "Trading intermediate momentum and institutional trend continuations",
    category: "Trend Following",
    difficulty: "Beginner",
    duration: "4 min",
    icon: "📈",
    isPro: false,
    instrument: "TATA MOTORS",
    timeframe: "15-minute chart",
    dataSource: "Historical simulation — May 2024",
    disclaimer: "Educational simulation using historical data. Not investment advice.",
    candles: TATAMOTORS_CANDLES,
    steps: [
      {
        id: 1,
        title: "The Logic of Moving Averages",
        narration: "Moving averages smooth out choppy price noise to reveal the underlying institutional direction. We use two exponential moving averages: the 20 EMA for short-term momentum in cyan, and the 50 EMA for medium-term baseline trend in orange. When the fast 20 EMA crosses above the slow 50 EMA, it signals institutional buying momentum is taking control.",
        action: "Plotting 20 EMA and 50 EMA lines across candles",
        rule: "Rule 1: Never trade MA crossovers in ranging sideways markets; confirm trend slope",
        chartAction: "draw_ma",
      },
      {
        id: 2,
        title: "Waiting for Crossover and Retest",
        narration: "Notice candle 8. The 20 EMA crosses above the 50 EMA at 965 rupees. Amateur traders immediately chase. Disciplined traders wait for the pullback and retest of the 20 EMA to verify that former resistance has converted into dynamic support.",
        action: "Highlighting crossover candle and retest zone",
        rule: "Rule 2: Don't chase the initial spike. Buy the retest of the 20 EMA dynamic support",
        highlight: [7, 8],
        chartAction: "highlight_candle",
      },
      {
        id: 3,
        title: "Execution and Risk Parameters",
        narration: "Retest confirmed with a bullish expansion candle closing at 975. We enter buy at 975. Our stop-loss is placed strictly below the 50 EMA swing low at 950. Risk is 25 points. Target is 2-to-1 ratio, giving 50 points target at 1,025 rupees.",
        action: "Plotting Entry at ₹975, Stop-Loss at ₹950, Target at ₹1,025",
        rule: "Rule 3: Set stop below the slower 50 EMA to avoid being shaken out by minor wicks",
        calculation: "Entry: ₹975 | Stop: ₹950 | Target: ₹1,025\nRisk per share: ₹25 | Reward: ₹50 | R:R = 1:2\nCapital: ₹2,00,000 | 1% Risk: ₹2,000 | Quantity: 80 shares",
        chartAction: "mark_entry",
        chartData: { entry: 975, stop: 950, target: 1025 },
        checkpoint: {
          question: "Price crosses moving averages, but the moving average lines are completely flat. What should you do?",
          options: [
            "Take the trade immediately",
            "Double position size",
            "Avoid the trade — flat MAs indicate choppy sideways market",
            "Switch to 1-minute chart",
          ],
          correct: 2,
          explanation: "Moving averages produce severe false whipsaws in sideways flat markets. Only trade crossovers when the moving averages are distinctly sloping upward.",
        },
        pause: true,
      },
      {
        id: 4,
        title: "Riding the Trend to Full Target",
        narration: "Price surged steadily along the 20 EMA guideline, hitting our target at 1,022 to 1,025. We close our 80 shares for a clean 4,000 rupees profit on 2,000 rupees planned risk. Process followed with zero emotional hesitation.",
        action: "Exiting position at ₹1,022 — Target reached",
        calculation: "Exit Price: ₹1,022 | P&L: 80 × ₹47 = +₹3,760\nMax Drawdown during trade: -₹180\nProcess score: 100%",
        chartAction: "mark_exit",
        chartData: { exit: 1022 },
      },
    ],
  },
  {
    id: "bullish-hammer-demand",
    title: "Bullish Hammer at Key Demand Zone",
    subtitle: "Catching liquidity grabs and institutional accumulation sweeps",
    category: "Price Action",
    difficulty: "Beginner",
    duration: "4 min",
    icon: "🔨",
    isPro: false,
    instrument: "HDFC BANK",
    timeframe: "15-minute chart",
    dataSource: "Historical simulation — June 2024",
    disclaimer: "Educational simulation using historical data. Not investment advice.",
    candles: HDFCBANK_CANDLES,
    steps: [
      {
        id: 1,
        title: "Identifying the Major Demand Zone",
        narration: "HDFC Bank has sold off aggressively for 7 consecutive candles from 1,460 down to 1,400. Retail traders panic-sell here. But institutional volume profiles show a heavy demand and liquidity cluster at the round number 1,400.",
        action: "Drawing green demand support zone between ₹1,395 and ₹1,405",
        rule: "Rule 1: Look for reversal candlestick patterns only at pre-established key support or demand levels",
        chartAction: "draw_support",
        chartData: { zone_high: 1405, zone_low: 1395 },
      },
      {
        id: 2,
        title: "The Anatomy of the Hammer",
        narration: "Look at candle 8. The bears pushed price down to 1,380 to trigger stop-losses. But look at the close: buyers aggressively absorbed all sell orders and forced the candle to close at 1,414 near its high! The lower shadow is more than three times the body size. This is a classic Bullish Hammer.",
        action: "Highlighting the Hammer candle at the demand sweep",
        rule: "Rule 2: A valid Hammer must have a lower wick at least twice the length of the candle body",
        highlight: [7],
        chartAction: "highlight_candle",
      },
      {
        id: 3,
        title: "Confirmation and Entry",
        narration: "Never buy the hammer while it is still forming. Wait for candle 9 to open and trade above the hammer's high. Once 1,418 is breached with expanding volume, confirmation is established.",
        action: "Setting entry above hammer high at ₹1,420 with stop below wick at ₹1,375",
        calculation: "Entry: ₹1,420 | Stop: ₹1,375 (45 pts risk)\nTarget: ₹1,490 (70 pts reward)\nCapital: ₹4,50,000 | 1% Risk: ₹4,500 | Qty: 100 shares",
        chartAction: "mark_entry",
        chartData: { entry: 1420, stop: 1375, target: 1490 },
        checkpoint: {
          question: "Why do we place the stop-loss slightly below the bottom wick of the hammer?",
          options: [
            "Because brokers require it",
            "Because if price breaks below the hammer wick, the bullish rejection thesis is invalid",
            "To maximize our commission",
            "To catch the next downtrend",
          ],
          correct: 1,
          explanation: "The entire logic of the trade is that institutions defended the price at 1,380. If price drops lower, that defense failed and our reason for being in the trade no longer exists.",
        },
        pause: true,
      },
      {
        id: 4,
        title: "Target Achieved at Upper Resistance",
        narration: "Price exploded upward as short sellers were forced to cover their positions. We achieve our target at 1,485 rupees. 100 shares multiplied by 65 points gain equals 6,500 rupees profit.",
        action: "Closing position at ₹1,485",
        calculation: "Exit Price: ₹1,485 | Net Profit: +₹6,500\nRisk Taken: ₹4,500 | Realized R:R = 1:1.44",
        chartAction: "mark_exit",
        chartData: { exit: 1485 },
      },
    ],
  },
  {
    id: "macd-bearish-divergence",
    title: "MACD Bearish Divergence Short Trade",
    subtitle: "Spotting exhaustion in tech rallies and profiting from the reversal",
    category: "Momentum",
    difficulty: "Intermediate",
    duration: "5 min",
    icon: "📉",
    isPro: false,
    instrument: "INFOSYS (INFY)",
    timeframe: "15-minute chart",
    dataSource: "Historical simulation — July 2024",
    disclaimer: "Educational simulation using historical data. Not investment advice.",
    candles: INFY_CANDLES,
    steps: [
      {
        id: 1,
        title: "Recognizing Trend Exhaustion",
        narration: "Infosys rallied from 1,540 to 1,625 rupees. On the surface, the chart looks extremely bullish. But beneath the surface, volume has dropped by 40% on each successive push higher. The rally is running on fumes.",
        action: "Drawing upward trendline on price",
        rule: "Rule 1: Price making new highs on lower volume indicates institutional distribution",
        chartAction: "draw_resistance",
        chartData: { level: 1625, zone_high: 1628, zone_low: 1620 },
      },
      {
        id: 2,
        title: "The MACD Divergence Signature",
        narration: "Looking at the MACD indicator below, while price made a higher high at 1,628, the MACD histogram and signal line formed a distinct lower high. This divergence warns that momentum has dried up completely.",
        action: "Highlighting MACD divergence lines",
        rule: "Rule 2: Bearish divergence occurs when price makes higher highs but MACD momentum lines make lower highs",
        chartAction: "draw_macd",
        highlight: [6, 7, 8],
      },
      {
        id: 3,
        title: "Breakdown Entry and Trade Management",
        narration: "We short sell INFY as soon as price breaks down through the 1,610 support level with a heavy red candle closing at 1,600. Stop-loss goes at 1,630 above the pivot high. Target is set at 1,540.",
        action: "Short entry at ₹1,600, Stop at ₹1,630, Target at ₹1,540",
        calculation: "Short Entry: ₹1,600 | Stop-Loss: ₹1,630 (30 pts risk)\nTarget: ₹1,540 (60 pts reward)\nCapital: ₹3,00,000 | 1% Risk: ₹3,000 | Qty: 100 shares short",
        chartAction: "mark_entry",
        chartData: { entry: 1600, stop: 1630, target: 1540 },
        checkpoint: {
          question: "When short-selling stock in intraday MIS mode, what must you do before 3:15 PM?",
          options: [
            "Transfer money to RBI",
            "Square off your position or your broker auto-liquidates it",
            "Convert to mutual funds",
            "Hold for 30 days",
          ],
          correct: 1,
          explanation: "In Indian equity markets, intraday short positions must be bought back before market close, or the exchange broker auto-squares them off at market rates.",
        },
        pause: true,
      },
      {
        id: 4,
        title: "Exit with Profit on Gap Down",
        narration: "The sell-off accelerated right into our 1,535 target. We buy back 100 shares at 1,535, generating 65 points per share or 6,500 rupees profit.",
        action: "Covering short at ₹1,535",
        calculation: "Cover Price: ₹1,535 | Short Entry: ₹1,600\nProfit: +₹6,500 on ₹3,000 risk\nRealized R:R = 1:2.16",
        chartAction: "mark_exit",
        chartData: { exit: 1535 },
      },
    ],
  },
  {
    id: "trailing-stop-atr",
    title: "ATR Trailing Stop & Trend Riding",
    subtitle: "Letting winners run without giving back profits using mathematical volatility",
    category: "Risk Management",
    difficulty: "Intermediate",
    duration: "4 min",
    icon: "🎯",
    isPro: true,
    instrument: "NIFTY Futures",
    timeframe: "15-minute chart",
    dataSource: "Historical simulation — August 2024",
    disclaimer: "F&O trading involves substantial risk. SEBI warns 89% lose money. Educational only.",
    candles: NIFTY_CANDLES,
    steps: [
      {
        id: 1,
        title: "The Problem of Exiting Too Early",
        narration: "The biggest flaw of developing traders is cutting winners prematurely out of anxiety. The Average True Range, or ATR, measures market volatility in points. By setting a trailing stop at 2 times ATR, we give the market room to breathe while locking in progress.",
        action: "Calculating 2x ATR volatility buffer",
        rule: "Rule 1: Use volatility-based trailing stops rather than fixed arbitrary rupee targets",
        chartAction: "show_calculation",
        calculation: "Current NIFTY 15m ATR = 35 points\nTrailing Stop Offset (2x ATR) = 70 points buffer",
      },
      {
        id: 2,
        title: "Initial Entry and Trail Step 1",
        narration: "We enter long at 21,970 with an initial stop at 21,900 (70 points back). As price advances to 22,040, we ratched our stop up to 21,970 — our breakeven level. The trade is now mathematically risk-free.",
        action: "Trailing stop from 21,900 to 21,970 breakeven",
        rule: "Rule 2: Move stop to breakeven once price travels 1x your risk distance",
        chartAction: "trail_stop",
        chartData: { old_stop: 21900, new_stop: 21970 },
      },
      {
        id: 3,
        title: "Trail Step 2 — Locking Profit",
        narration: "NIFTY surges higher to 22,130. We advance our trailing stop again to 22,060. No matter what happens now, we have locked in 90 points of pure profit.",
        action: "Trailing stop to 22,060",
        calculation: "Locked profit: 22,060 − 21,970 = +90 points\nGuaranteed outcome: +₹4,500 on 1 lot (50 units)",
        chartAction: "trail_stop",
        chartData: { old_stop: 21970, new_stop: 22060 },
        checkpoint: {
          question: "If market suddenly pulls back and hits your trailing stop at 22,060, is that a failed trade?",
          options: [
            "Yes, because price didn't reach the absolute top",
            "No, you captured 90 points of trend while protecting capital completely",
            "Yes, trailing stops are always mistakes",
            "No, but you should re-enter instantly",
          ],
          correct: 1,
          explanation: "Correct! Nobody can consistently exit at the exact tick high. Capturing the majority of a trend with guaranteed profit is the hallmark of professional trading.",
        },
        pause: true,
      },
    ],
  },
  {
    id: "options-iron-condor",
    title: "Iron Condor Range-Bound Strategy",
    subtitle: "Collecting theta time decay when you expect markets to remain sideways",
    category: "Derivatives",
    difficulty: "Advanced",
    duration: "5 min",
    icon: "🦅",
    isPro: true,
    instrument: "NIFTY Options Weekly",
    timeframe: "Weekly expiry",
    dataSource: "Historical simulation — September 2024",
    disclaimer: "F&O trading carries high risk. Educational demonstration. Not investment advice.",
    candles: NIFTY_CANDLES,
    steps: [
      {
        id: 1,
        title: "Market Context: Low Volatility Range",
        narration: "NIFTY is oscillating between 21,800 and 22,150 ahead of a national holiday. Expected volatility is low. Directional bets are risky. An Iron Condor allows us to profit purely from the passage of time as long as price stays within our defined wing boundaries.",
        action: "Plotting Iron Condor boundaries on chart: 21,700 and 22,250",
        rule: "Rule 1: Iron Condors are market-neutral strategies deployed in low-implied-volatility conditions",
        chartAction: "draw_resistance",
        chartData: { zone_high: 22250, zone_low: 21700 },
      },
      {
        id: 2,
        title: "The 4-Leg Option Structure",
        narration: "We sell an OTM Call at 22,150 and buy a protective Call at 22,250. Simultaneously, we sell an OTM Put at 21,800 and buy a protective Put at 21,700. We collect a net credit premium of 45 rupees per unit.",
        action: "Visualizing 4 option legs and max payout diagram",
        calculation: "Sold 22,150 CE (+₹35) & Bought 22,250 CE (-₹12)\nSold 21,800 PE (+₹38) & Bought 21,700 PE (-₹16)\nNet Credit Received: ₹45 points = ₹2,250 per lot\nMax Loss: Width of spread (100) − Credit (45) = ₹55 points = ₹2,750",
        rule: "Rule 2: Never trade naked unhedged options; the long wings strictly cap your maximum possible loss",
      },
      {
        id: 3,
        title: "Expiry Management & Theta Harvest",
        narration: "As Thursday 3:30 PM arrives, NIFTY closes at 22,040 — comfortably between our sold strikes. All sold options expire with zero value. We keep the full 2,250 rupees credit as profit.",
        action: "Full theta decay realized — position closed",
        calculation: "Final Expiry: NIFTY at 22,040 (Within range)\nNet P&L: +₹2,250 per lot\nReturn on Margin Required (₹65,000): +3.4% in 4 days",
        chartAction: "mark_exit",
        chartData: { exit: 22040 },
      },
    ],
  },
];

// ── TRADING THEATER COMPONENT ─────────────────────────────────
export default function TradingTheaterPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [candlesVisible, setCandlesVisible] = useState(0);
  const [overlays, setOverlays] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [checkpoint, setCheckpoint] = useState<{
    visible: boolean;
    answered: boolean;
    selected: number | null;
  }>({ visible: false, answered: false, selected: null });
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [progress, setProgress] = useState(0);

  // ── Canvas: Draw Chart ──────────────────────────────────────
  const drawChart = useCallback(
    (candles: Candle[], visibleCount: number, step: Step | null) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;
      const PADDING = { top: 25, right: 85, bottom: 40, left: 70 };
      const chartW = W - PADDING.left - PADDING.right;
      const chartH = H - PADDING.top - PADDING.bottom;

      ctx.clearRect(0, 0, W, H);

      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#080D1A");
      bg.addColorStop(1, "#0B1322");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = PADDING.top + (chartH / 5) * i;
        ctx.beginPath();
        ctx.moveTo(PADDING.left, y);
        ctx.lineTo(W - PADDING.right, y);
        ctx.stroke();
      }
      for (let i = 0; i <= 10; i++) {
        const x = PADDING.left + (chartW / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, PADDING.top);
        ctx.lineTo(x, H - PADDING.bottom);
        ctx.stroke();
      }

      if (visibleCount === 0) return;
      const vis = candles.slice(0, visibleCount);

      // Price range
      const allHighs = vis.map((c) => c.high);
      const allLows = vis.map((c) => c.low);
      const paddingVal = Math.max(30, (Math.max(...allHighs) - Math.min(...allLows)) * 0.1);
      const priceMax = Math.max(...allHighs) + paddingVal;
      const priceMin = Math.min(...allLows) - paddingVal;
      const priceRange = Math.max(1, priceMax - priceMin);
      const priceToY = (p: number) =>
        PADDING.top + chartH - ((p - priceMin) / priceRange) * chartH;

      // Y-axis labels
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = "right";
      for (let i = 0; i <= 5; i++) {
        const price = priceMin + (priceRange / 5) * i;
        const y = priceToY(price);
        ctx.fillText(price.toFixed(0), PADDING.left - 8, y + 4);
      }

      // Candle width
      const maxCandles = candles.length;
      const candleW = Math.max(6, Math.floor(chartW / maxCandles) - 6);
      const candleSpacing = chartW / maxCandles;

      // Draw Candlesticks
      vis.forEach((candle, i) => {
        const x = PADDING.left + i * candleSpacing + candleSpacing / 2;
        const isHighlighted = step?.highlight?.includes(i);
        const isGreen = candle.close >= candle.open;

        const bodyTop = priceToY(Math.max(candle.open, candle.close));
        const bodyBottom = priceToY(Math.min(candle.open, candle.close));
        const bodyH = Math.max(2, bodyBottom - bodyTop);

        // Highlight glow
        if (isHighlighted) {
          ctx.shadowColor = isGreen ? "#00FF88" : "#FF4444";
          ctx.shadowBlur = 18;
        }

        // Wick
        ctx.strokeStyle = isHighlighted
          ? isGreen
            ? "#00FF88"
            : "#FF4444"
          : isGreen
          ? "rgba(0,255,136,0.7)"
          : "rgba(255,68,68,0.7)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, priceToY(candle.high));
        ctx.lineTo(x, priceToY(candle.low));
        ctx.stroke();

        // Body
        ctx.fillStyle = isGreen
          ? isHighlighted
            ? "#00FF88"
            : "rgba(0,210,110,0.85)"
          : isHighlighted
          ? "#FF4444"
          : "rgba(230,55,55,0.85)";
        ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);

        ctx.shadowBlur = 0;

        // Time label
        if (i % 2 === 0) {
          ctx.fillStyle = "rgba(255,255,255,0.3)";
          ctx.font = "9px 'JetBrains Mono', monospace";
          ctx.textAlign = "center";
          ctx.fillText(candle.time, x, H - PADDING.bottom + 16);
        }
      });

      // Overlay: Resistance line
      if (overlays.includes("draw_resistance") && step?.chartData) {
        const { zone_high, zone_low } = step.chartData as { zone_high?: number; zone_low?: number };
        if (zone_high && zone_low) {
          const y1 = priceToY(zone_high);
          const y2 = priceToY(zone_low);

          ctx.fillStyle = "rgba(255, 215, 0, 0.08)";
          ctx.fillRect(PADDING.left, y1, chartW, y2 - y1);

          ctx.strokeStyle = "#FFD700";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(PADDING.left, y1);
          ctx.lineTo(W - PADDING.right, y1);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(PADDING.left, y2);
          ctx.lineTo(W - PADDING.right, y2);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = "#FFD700";
          ctx.font = "bold 11px Inter, sans-serif";
          ctx.textAlign = "right";
          ctx.fillText("RESISTANCE ZONE", W - PADDING.right - 6, y1 - 6);
        }
      }

      // Overlay: Support line
      if (overlays.includes("draw_support") && step?.chartData) {
        const { zone_high, zone_low } = step.chartData as { zone_high?: number; zone_low?: number };
        if (zone_high && zone_low) {
          const y1 = priceToY(zone_high);
          const y2 = priceToY(zone_low);

          ctx.fillStyle = "rgba(0, 255, 136, 0.08)";
          ctx.fillRect(PADDING.left, y1, chartW, y2 - y1);

          ctx.strokeStyle = "#00FF88";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(PADDING.left, y1);
          ctx.lineTo(W - PADDING.right, y1);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(PADDING.left, y2);
          ctx.lineTo(W - PADDING.right, y2);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = "#00FF88";
          ctx.font = "bold 11px Inter, sans-serif";
          ctx.textAlign = "right";
          ctx.fillText("DEMAND / SUPPORT ZONE", W - PADDING.right - 6, y2 + 14);
        }
      }

      // Overlay: Entry marker
      if (overlays.includes("mark_entry") && step?.chartData) {
        const { entry, stop, target } = step.chartData as { entry?: number; stop?: number; target?: number };
        if (entry) {
          const yEntry = priceToY(entry);
          ctx.strokeStyle = "#00FF88";
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(PADDING.left, yEntry);
          ctx.lineTo(W - PADDING.right, yEntry);
          ctx.stroke();

          ctx.fillStyle = "#00FF88";
          ctx.font = "bold 11px Inter, sans-serif";
          ctx.textAlign = "right";
          ctx.fillText(`▶ ENTRY ₹${entry}`, W - PADDING.right - 6, yEntry - 6);
        }

        if (stop) {
          const yStop = priceToY(stop);
          ctx.strokeStyle = "#FF4444";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 3]);
          ctx.beginPath();
          ctx.moveTo(PADDING.left, yStop);
          ctx.lineTo(W - PADDING.right, yStop);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = "#FF4444";
          ctx.font = "bold 11px Inter, sans-serif";
          ctx.textAlign = "right";
          ctx.fillText(`✕ STOP ₹${stop}`, W - PADDING.right - 6, yStop - 6);
        }

        if (target) {
          const yTarget = priceToY(target);
          ctx.strokeStyle = "#00BFFF";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(PADDING.left, yTarget);
          ctx.lineTo(W - PADDING.right, yTarget);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = "#00BFFF";
          ctx.font = "bold 11px Inter, sans-serif";
          ctx.textAlign = "right";
          ctx.fillText(`🎯 TARGET ₹${target}`, W - PADDING.right - 6, yTarget - 6);
        }
      }

      // Overlay: Exit marker
      if (overlays.includes("mark_exit") && step?.chartData) {
        const { exit } = step.chartData as { exit?: number };
        if (exit) {
          const yExit = priceToY(exit);
          ctx.strokeStyle = "#00BFFF";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(PADDING.left, yExit);
          ctx.lineTo(W - PADDING.right, yExit);
          ctx.stroke();
          ctx.fillStyle = "#00BFFF";
          ctx.font = "bold 11px Inter, sans-serif";
          ctx.textAlign = "right";
          ctx.fillText(`◀ EXIT ₹${exit}`, W - PADDING.right - 6, yExit - 6);
        }
      }

      // Current price ticker
      if (vis.length > 0) {
        const lastCandle = vis[vis.length - 1];
        const yLast = priceToY(lastCandle.close);
        const isUp = lastCandle.close >= lastCandle.open;

        ctx.fillStyle = isUp ? "rgba(0,255,136,0.9)" : "rgba(255,68,68,0.9)";
        ctx.fillRect(W - PADDING.right + 2, yLast - 10, PADDING.right - 6, 20);
        ctx.fillStyle = "#000";
        ctx.font = "bold 11px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(
          lastCandle.close.toFixed(0),
          W - PADDING.right + (PADDING.right - 6) / 2 + 2,
          yLast + 4
        );
      }

      // Instrument label
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "bold 13px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText(activeScenario?.instrument || "", PADDING.left + 4, PADDING.top + 16);
    },
    [overlays, activeScenario]
  );

  // ── Animate candles building in ──────────────────────────────
  useEffect(() => {
    if (!activeScenario) return;
    if (candlesVisible < activeScenario.candles.length) {
      const t = setTimeout(() => {
        setCandlesVisible((v) => v + 1);
      }, 100);
      return () => clearTimeout(t);
    }
  }, [candlesVisible, activeScenario]);

  // ── Redraw chart when state changes ──────────────────────────
  useEffect(() => {
    if (!activeScenario) return;
    const step = activeScenario.steps[currentStep];
    drawChart(activeScenario.candles, candlesVisible, step);
  }, [candlesVisible, activeScenario, currentStep, overlays, drawChart]);

  // ── Narration via Web Speech API ─────────────────────────────
  const narrate = useCallback(
    (text: string) => {
      if (!voiceEnabled || typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 0.92;
      utt.pitch = 1.0;
      utt.volume = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.name.includes("Google") ||
          v.name.includes("Daniel") ||
          v.name.includes("Samantha") ||
          v.name.includes("Natural") ||
          v.lang.startsWith("en")
      );
      if (preferred) utt.voice = preferred;

      utt.onstart = () => setIsNarrating(true);
      utt.onend = () => setIsNarrating(false);
      utt.onerror = () => setIsNarrating(false);
      speechRef.current = utt;
      window.speechSynthesis.speak(utt);
    },
    [voiceEnabled]
  );

  // ── Handle step progression ──────────────────────────────────
  const playStep = useCallback(
    (scenario: Scenario, stepIdx: number) => {
      const step = scenario.steps[stepIdx];
      if (!step) return;

      setCurrentStep(stepIdx);
      setProgress(((stepIdx + 1) / scenario.steps.length) * 100);

      if (step.chartAction) {
        setOverlays((prev) => [...new Set([...prev, step.chartAction!])]);
      }

      narrate(step.narration);

      if (step.pause && step.checkpoint) {
        setTimeout(() => {
          setCheckpoint({ visible: true, answered: false, selected: null });
          window.speechSynthesis?.cancel();
        }, 2400);
      }
    },
    [narrate]
  );

  const startScenario = (scenario: Scenario) => {
    setActiveScenario(scenario);
    setCurrentStep(0);
    setCandlesVisible(0);
    setOverlays([]);
    setCheckpoint({ visible: false, answered: false, selected: null });
    setIsPlaying(true);
    setProgress(0);
    setTimeout(() => playStep(scenario, 0), 600);
  };

  const nextStep = () => {
    if (!activeScenario) return;
    const next = currentStep + 1;
    if (next < activeScenario.steps.length) {
      setCheckpoint({ visible: false, answered: false, selected: null });
      playStep(activeScenario, next);
    } else {
      setIsPlaying(false);
    }
  };

  const handleCheckpoint = (optionIdx: number) => {
    setCheckpoint((prev) => ({ ...prev, answered: true, selected: optionIdx }));
    const step = activeScenario?.steps[currentStep];
    if (step?.checkpoint) {
      const isCorrect = optionIdx === step.checkpoint.correct;
      narrate(
        isCorrect
          ? "Correct! " + step.checkpoint.explanation
          : "Not quite. " + step.checkpoint.explanation
      );
    }
  };

  const stopNarration = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsNarrating(false);
  };

  const currentStepData = activeScenario?.steps[currentStep];

  const filteredScenarios = useMemo(() => {
    if (selectedCategory === "All") return SCENARIOS;
    return SCENARIOS.filter((s) => s.category.toLowerCase().includes(selectedCategory.toLowerCase()));
  }, [selectedCategory]);

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#070B14",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: "#E2E8F0",
      }}
    >
      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.3)} }
        @keyframes fade-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 10px rgba(0,255,136,.3)} 50%{box-shadow:0 0 22px rgba(0,255,136,.6)} }
        .step-fade { animation: fade-in 0.35s ease; }
        .glow-green { animation: glow 2s infinite; }
      `}</style>

      {/* ── SEBI DISCLAIMER MODAL ────────────────────────────── */}
      {showDisclaimer && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#0D1524",
              border: "1px solid rgba(0,255,136,0.25)",
              borderRadius: 18,
              padding: 32,
              maxWidth: 540,
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.7)",
            }}
          >
            <div style={{ fontSize: 34, marginBottom: 12 }}>🛡️</div>
            <h2 style={{ fontSize: 21, fontWeight: 800, color: "#FFD700", marginBottom: 12 }}>
              SEBI Educational Disclaimer
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, marginBottom: 16 }}>
              All trading scenarios shown in the 3D Trading Theater are <strong>historical simulated case studies for educational purposes only.</strong> They do not constitute investment advice, trade recommendations, or financial advisory.
            </p>
            <ul style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.9, marginBottom: 24, paddingLeft: 18 }}>
              <li>Past performance does not guarantee future market returns</li>
              <li>Trading equity and derivatives involves substantial financial risk</li>
              <li><strong>89% of individual F&O traders incur net losses</strong> (SEBI 2023 study)</li>
              <li>Always practice risk management and simulate trades before committing capital</li>
            </ul>
            <button
              onClick={() => setShowDisclaimer(false)}
              style={{
                width: "100%",
                padding: "14px",
                background: "linear-gradient(135deg, #0E6163, #1D9E75)",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 800,
                cursor: "pointer",
                letterSpacing: "0.02em",
                transition: "opacity 0.2s",
              }}
            >
              I Understand — Enter Trading Theater
            </button>
          </div>
        </div>
      )}

      {/* ── HEADER NAVIGATION ────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(180deg, #0A0F1E 0%, #070B14 100%)",
          borderBottom: "1px solid rgba(0,255,136,0.12)",
          padding: "18px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#00FF88",
                animation: "pulse-dot 2s infinite",
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#00FF88",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              FinanceHub 3D Trading Theater
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.3px" }}>
            Watch Institutional Trades Unfold — Live
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "4px 0 0" }}>
            Real-time candlestick animations, voice-narrated rules, and decision checkpoints · Historical Data
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            onClick={() => setVoiceEnabled((v) => !v)}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              background: voiceEnabled ? "rgba(0,255,136,0.12)" : "rgba(255,255,255,0.06)",
              border: voiceEnabled ? "1px solid rgba(0,255,136,0.3)" : "1px solid rgba(255,255,255,0.1)",
              color: voiceEnabled ? "#00FF88" : "rgba(255,255,255,0.45)",
              cursor: "pointer",
            }}
          >
            {voiceEnabled ? "🔊 Voice Narration ON" : "🔇 Voice OFF"}
          </button>

          {activeScenario ? (
            <button
              onClick={() => {
                setActiveScenario(null);
                stopNarration();
                setIsPlaying(false);
              }}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              ← Back to Catalog
            </button>
          ) : (
            <Link
              href="/simulators"
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                textDecoration: "none",
              }}
            >
              Open Simulators →
            </Link>
          )}
        </div>
      </div>

      {!activeScenario ? (
        /* ── SCENARIO CATALOG (10 SCENARIOS) ─────────────────── */
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "36px 24px 80px" }}>
          <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
                Select from 10 complete real-market scenarios to start your animated breakdown
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["All", "Price Action", "Risk Management", "Trend Following", "Momentum", "Derivatives"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: "6px 16px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      background: selectedCategory === cat ? "#0E6163" : "rgba(255,255,255,0.06)",
                      border: selectedCategory === cat ? "1px solid #1D9E75" : "1px solid rgba(255,255,255,0.1)",
                      color: selectedCategory === cat ? "#fff" : "rgba(255,255,255,0.6)",
                      cursor: "pointer",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 12, color: "#00FF88", fontWeight: 700 }}>
              Showing {filteredScenarios.length} of {SCENARIOS.length} Interactive Scenarios
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: 20,
            }}
          >
            {filteredScenarios.map((scenario) => (
              <div
                key={scenario.id}
                onClick={() => startScenario(scenario)}
                style={{
                  background: "linear-gradient(145deg, #0E1624, #0A101A)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  padding: "22px",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(0,255,136,0.3)";
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,255,136,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {scenario.isPro && (
                  <div
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      padding: "3px 10px",
                      borderRadius: 20,
                      background: "linear-gradient(135deg,#7B2FBE,#9B4DCA)",
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#fff",
                    }}
                  >
                    PRO MASTERCLASS
                  </div>
                )}

                <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "rgba(0,255,136,0.08)",
                      border: "1px solid rgba(0,255,136,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      flexShrink: 0,
                    }}
                  >
                    {scenario.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1.3, margin: "0 0 4px" }}>
                      {scenario.title}
                    </h3>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.4 }}>
                      {scenario.subtitle}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      background:
                        scenario.difficulty === "Beginner"
                          ? "rgba(0,255,136,0.1)"
                          : scenario.difficulty === "Intermediate"
                          ? "rgba(255,215,0,0.1)"
                          : "rgba(255,80,80,0.1)",
                      color:
                        scenario.difficulty === "Beginner"
                          ? "#00FF88"
                          : scenario.difficulty === "Intermediate"
                          ? "#FFD700"
                          : "#FF6060",
                      border: `1px solid ${
                        scenario.difficulty === "Beginner"
                          ? "rgba(0,255,136,0.2)"
                          : scenario.difficulty === "Intermediate"
                          ? "rgba(255,215,0,0.2)"
                          : "rgba(255,80,80,0.2)"
                      }`,
                    }}
                  >
                    {scenario.difficulty}
                  </span>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 8,
                      fontSize: 11,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    {scenario.category}
                  </span>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 8,
                      fontSize: 11,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    ⏱ {scenario.duration}
                  </span>
                </div>

                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
                  {scenario.steps.length} interactive steps · {scenario.instrument} ({scenario.timeframe})
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#00FF88",
                  }}
                >
                  <span style={{ fontSize: 16 }}>▶</span> Launch Theater Walkthrough
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 40,
              padding: "16px 20px",
              background: "rgba(255,215,0,0.05)",
              border: "1px solid rgba(255,215,0,0.15)",
              borderRadius: 12,
              fontSize: 12,
              color: "rgba(255,215,0,0.7)",
              lineHeight: 1.7,
            }}
          >
            ⚠️ <strong>SEBI Regulatory Note:</strong> All scenarios feature historical educational reconstructions. Under SEBI regulations, simulated trades do not constitute investment advice. Practice with disciplined position sizing in paper trading before deploying capital.
          </div>
        </div>
      ) : (
        /* ── ACTIVE THEATER SCREEN ─────────────────────────── */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 420px",
            height: "calc(100vh - 90px)",
            overflow: "hidden",
          }}
        >
          {/* LEFT: Cinematic Canvas Area */}
          <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
            {/* Progress line */}
            <div style={{ height: 4, background: "rgba(255,255,255,0.06)" }}>
              <div
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #0E6163, #00FF88)",
                  width: `${progress}%`,
                  transition: "width 0.4s ease",
                }}
              />
            </div>

            {/* Canvas */}
            <div style={{ flex: 1, position: "relative", padding: "16px" }}>
              <canvas
                ref={canvasRef}
                width={860}
                height={440}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 12,
                  border: "1px solid rgba(0,255,136,0.15)",
                  background: "#080D1A",
                }}
              />

              {/* Instrument HUD Pill */}
              <div
                style={{
                  position: "absolute",
                  top: 28,
                  left: 28,
                  background: "rgba(10,15,30,0.85)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(0,255,136,0.25)",
                  borderRadius: 10,
                  padding: "8px 14px",
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 800, color: "#00FF88", fontFamily: "JetBrains Mono" }}>
                  {activeScenario.instrument}
                </span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                  {activeScenario.timeframe}
                </span>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 800,
                    background: "rgba(255,215,0,0.12)",
                    color: "#FFD700",
                    border: "1px solid rgba(255,215,0,0.3)",
                  }}
                >
                  SIMULATION
                </span>
              </div>

              {/* Speaking Indicator */}
              {isNarrating && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 28,
                    left: 28,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(0,0,0,0.85)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(0,255,136,0.3)",
                    borderRadius: 10,
                    padding: "8px 14px",
                  }}
                >
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 3,
                        height: 14,
                        background: "#00FF88",
                        borderRadius: 2,
                        animation: `pulse-dot ${0.4 + i * 0.15}s infinite`,
                      }}
                    />
                  ))}
                  <span style={{ fontSize: 12, color: "#00FF88", fontWeight: 700, marginLeft: 4 }}>
                    AI Voice Guide Explaining…
                  </span>
                </div>
              )}
            </div>

            {/* Dynamic Math Box */}
            {currentStepData?.calculation && (
              <div
                style={{
                  margin: "0 16px 16px",
                  background: "rgba(0,191,255,0.06)",
                  border: "1px solid rgba(0,191,255,0.25)",
                  borderRadius: 12,
                  padding: "12px 18px",
                  animation: "fade-in 0.3s ease",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, color: "#00BFFF", letterSpacing: "0.1em", marginBottom: 6 }}>
                  TRADE MATHEMATICS &amp; RISK SIZING
                </div>
                <pre
                  style={{
                    fontSize: 12,
                    fontFamily: "JetBrains Mono, monospace",
                    color: "rgba(255,255,255,0.8)",
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.7,
                  }}
                >
                  {currentStepData.calculation}
                </pre>
              </div>
            )}
          </div>

          {/* RIGHT: Step Guide & Decisions */}
          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", background: "#0B101E" }}>
            {/* Header */}
            <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
                {activeScenario.category} · {activeScenario.difficulty}
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>
                {activeScenario.title}
              </h2>

              {/* Progress step dots */}
              <div style={{ display: "flex", gap: 4 }}>
                {activeScenario.steps.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 4,
                      flex: 1,
                      borderRadius: 2,
                      background:
                        i < currentStep
                          ? "#00FF88"
                          : i === currentStep
                          ? "rgba(0,255,136,0.6)"
                          : "rgba(255,255,255,0.1)",
                      transition: "background 0.3s",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Step Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>
              {currentStepData && (
                <div className="step-fade">
                  {/* Step counter */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg,#0E6163,#1D9E75)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 800,
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      {currentStep + 1}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>
                      {currentStepData.title}
                    </div>
                  </div>

                  {/* Action badge */}
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      marginBottom: 14,
                      background: "rgba(0,255,136,0.06)",
                      border: "1px solid rgba(0,255,136,0.2)",
                      fontSize: 12,
                      color: "#00FF88",
                      fontWeight: 700,
                    }}
                  >
                    🎬 {currentStepData.action}
                  </div>

                  {/* Narration transcript */}
                  <p
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.75)",
                      lineHeight: 1.8,
                      marginBottom: 16,
                    }}
                  >
                    {currentStepData.narration}
                  </p>

                  {/* Trading rule */}
                  {currentStepData.rule && (
                    <div
                      style={{
                        padding: "12px 14px",
                        borderRadius: 10,
                        marginBottom: 16,
                        background: "rgba(255,215,0,0.06)",
                        borderLeft: "3px solid #FFD700",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: "#FFD700",
                          marginBottom: 4,
                          letterSpacing: "0.08em",
                        }}
                      >
                        CORE TRADING RULE
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,215,0,0.9)", lineHeight: 1.6 }}>
                        {currentStepData.rule}
                      </div>
                    </div>
                  )}

                  {/* Checkpoint Modal */}
                  {checkpoint.visible && currentStepData.checkpoint && (
                    <div style={{ animation: "fade-in 0.3s ease" }}>
                      <div
                        style={{
                          padding: "14px 16px",
                          borderRadius: 12,
                          background: "rgba(0,191,255,0.08)",
                          border: "1px solid rgba(0,191,255,0.3)",
                          marginBottom: 16,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color: "#00BFFF",
                            marginBottom: 8,
                            letterSpacing: "0.08em",
                          }}
                        >
                          ⏸ DECISION CHECKPOINT
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#fff",
                            fontWeight: 600,
                            lineHeight: 1.6,
                            marginBottom: 12,
                          }}
                        >
                          {currentStepData.checkpoint.question}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {currentStepData.checkpoint.options.map((opt, i) => {
                            const isSelected = checkpoint.selected === i;
                            const isCorrect = i === currentStepData.checkpoint!.correct;
                            const showResult = checkpoint.answered;

                            return (
                              <button
                                key={i}
                                onClick={() => !checkpoint.answered && handleCheckpoint(i)}
                                style={{
                                  padding: "10px 14px",
                                  borderRadius: 8,
                                  textAlign: "left",
                                  fontSize: 12,
                                  lineHeight: 1.5,
                                  background: showResult
                                    ? isCorrect
                                      ? "rgba(0,255,136,0.15)"
                                      : isSelected
                                      ? "rgba(255,80,80,0.15)"
                                      : "rgba(255,255,255,0.03)"
                                    : "rgba(255,255,255,0.04)",
                                  border: showResult
                                    ? isCorrect
                                      ? "1px solid rgba(0,255,136,0.4)"
                                      : isSelected
                                      ? "1px solid rgba(255,80,80,0.4)"
                                      : "1px solid rgba(255,255,255,0.06)"
                                    : "1px solid rgba(255,255,255,0.1)",
                                  color: showResult
                                    ? isCorrect
                                      ? "#00FF88"
                                      : isSelected
                                      ? "#FF8080"
                                      : "rgba(255,255,255,0.3)"
                                    : "rgba(255,255,255,0.8)",
                                  cursor: checkpoint.answered ? "default" : "pointer",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                {showResult && isCorrect && "✅ "}
                                {showResult && !isCorrect && isSelected && "❌ "}
                                {!showResult && `${String.fromCharCode(65 + i)}. `}
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {checkpoint.answered && (
                          <div
                            style={{
                              marginTop: 12,
                              padding: "10px 12px",
                              background: "rgba(0,255,136,0.08)",
                              borderRadius: 8,
                              fontSize: 12,
                              color: "rgba(0,255,136,0.9)",
                              lineHeight: 1.6,
                            }}
                          >
                            {currentStepData.checkpoint.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* All Steps Roadmap */}
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginBottom: 10 }}>
                  SCENARIO ROADMAP
                </div>
                {activeScenario.steps.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                      padding: "8px 0",
                      opacity: i > currentStep ? 0.35 : 1,
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        flexShrink: 0,
                        marginTop: 1,
                        background:
                          i < currentStep
                            ? "#00FF88"
                            : i === currentStep
                            ? "rgba(0,255,136,0.25)"
                            : "rgba(255,255,255,0.06)",
                        border: i === currentStep ? "1px solid #00FF88" : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 800,
                        color: i < currentStep ? "#000" : i === currentStep ? "#00FF88" : "rgba(255,255,255,0.3)",
                      }}
                    >
                      {i < currentStep ? "✓" : i + 1}
                    </div>
                    <div style={{ fontSize: 12, color: i === currentStep ? "#fff" : "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
                      {s.title}
                      {s.pause && <span style={{ marginLeft: 6, fontSize: 10, color: "#00BFFF" }}>⏸</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Controls */}
            <div
              style={{
                padding: "16px 22px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                gap: 10,
              }}
            >
              {isNarrating ? (
                <button
                  onClick={stopNarration}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "rgba(255,80,80,0.12)",
                    border: "1px solid rgba(255,80,80,0.3)",
                    borderRadius: 10,
                    color: "#FF8080",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  ⏸ Pause
                </button>
              ) : (
                <button
                  onClick={() => currentStepData && narrate(currentStepData.narration)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "rgba(0,255,136,0.08)",
                    border: "1px solid rgba(0,255,136,0.25)",
                    borderRadius: 10,
                    color: "#00FF88",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  🔊 Replay
                </button>
              )}

              {checkpoint.visible && !checkpoint.answered ? (
                <button
                  disabled
                  style={{
                    flex: 2,
                    padding: "12px",
                    background: "rgba(0,191,255,0.06)",
                    border: "1px solid rgba(0,191,255,0.2)",
                    borderRadius: 10,
                    color: "rgba(0,191,255,0.5)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "not-allowed",
                  }}
                >
                  Answer Checkpoint to Continue
                </button>
              ) : currentStep < (activeScenario?.steps.length ?? 0) - 1 ? (
                <button
                  onClick={nextStep}
                  className="glow-green"
                  style={{
                    flex: 2,
                    padding: "12px",
                    background: "linear-gradient(135deg,#0E6163,#1D9E75)",
                    border: "none",
                    borderRadius: 10,
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Next Step →
                </button>
              ) : (
                <button
                  onClick={() => {
                    setActiveScenario(null);
                    stopNarration();
                  }}
                  style={{
                    flex: 2,
                    padding: "12px",
                    background: "linear-gradient(135deg,#7B2FBE,#9B4DCA)",
                    border: "none",
                    borderRadius: 10,
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  ✅ Complete — Explore Next
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
