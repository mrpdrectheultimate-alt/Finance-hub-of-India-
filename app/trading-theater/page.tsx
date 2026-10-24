"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { HINDI_TRANSLATIONS } from "./hindiTranslations";

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
  titleHi?: string;
  narrationHi?: string;
  actionHi?: string;
  ruleHi?: string;
  calculationHi?: string;
  narration: string;
  action: string;
  rule?: string;
  calculation?: string;
  checkpoint?: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
    questionHi?: string;
    optionsHi?: string[];
    explanationHi?: string;
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
    | "trail_stop"
    | "draw_fib"
    | "show_compound"
    | string;
  chartData?: Record<string, unknown>;
  highlight?: number[];
  pause?: boolean;
}

interface Scenario {
  id: string;
  title: string;
  titleHi?: string;
  subtitle: string;
  subtitleHi?: string;
  category: string;
  categoryHi?: string;
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
const MA_CANDLES: Candle[] = [
  { open:22100, high:22160, low:22080, close:22140, volume:1100000, time:"09:15" },
  { open:22140, high:22200, low:22120, close:22180, volume:1300000, time:"09:30" },
  { open:22180, high:22220, low:22160, close:22200, volume:1500000, time:"09:45" },
  { open:22200, high:22240, low:22180, close:22220, volume:1200000, time:"10:00" },
  { open:22220, high:22250, low:22190, close:22210, volume:900000,  time:"10:15" },
  { open:22210, high:22230, low:22180, close:22190, volume:800000,  time:"10:30" },
  { open:22190, high:22210, low:22160, close:22170, volume:750000,  time:"10:45" },
  { open:22170, high:22190, low:22140, close:22160, volume:700000,  time:"11:00" },
  { open:22160, high:22200, low:22150, close:22195, volume:1400000, time:"11:15" },
  { open:22195, high:22260, low:22190, close:22250, volume:2100000, time:"11:30" },
  { open:22250, high:22320, low:22240, close:22310, volume:2400000, time:"11:45" },
  { open:22310, high:22380, low:22300, close:22370, volume:2200000, time:"12:00" },
  { open:22370, high:22430, low:22360, close:22410, volume:1900000, time:"12:15" },
  { open:22410, high:22470, low:22400, close:22450, volume:1700000, time:"12:30" },
  { open:22450, high:22500, low:22440, close:22480, volume:1500000, time:"12:45" },
];

const FIBONACCI_CANDLES: Candle[] = [
  { open:1580, high:1650, low:1570, close:1640, volume:600000, time:"Day 1" },
  { open:1640, high:1720, low:1630, close:1710, volume:800000, time:"Day 2" },
  { open:1710, high:1790, low:1700, close:1780, volume:900000, time:"Day 3" },
  { open:1780, high:1850, low:1770, close:1840, volume:1100000, time:"Day 4" },
  { open:1840, high:1900, low:1830, close:1890, volume:1300000, time:"Day 5" },
  { open:1890, high:1950, low:1880, close:1870, volume:1500000, time:"Day 6" },
  { open:1870, high:1880, low:1810, close:1820, volume:1400000, time:"Day 7" },
  { open:1820, high:1840, low:1770, close:1780, volume:1200000, time:"Day 8" },
  { open:1780, high:1800, low:1750, close:1760, volume:1000000, time:"Day 9" },
  { open:1760, high:1790, low:1740, close:1780, volume:900000,  time:"Day 10" },
  { open:1780, high:1840, low:1770, close:1830, volume:1300000, time:"Day 11" },
  { open:1830, high:1900, low:1820, close:1890, volume:1600000, time:"Day 12" },
  { open:1890, high:1960, low:1880, close:1950, volume:1800000, time:"Day 13" },
  { open:1950, high:2010, low:1940, close:2000, volume:1600000, time:"Day 14" },
  { open:2000, high:2060, low:1990, close:2050, volume:1400000, time:"Day 15" },
];

const INTRADAY_CANDLES: Candle[] = [
  { open:22050, high:22080, low:22020, close:22060, volume:800000,  time:"09:15" },
  { open:22060, high:22120, low:22050, close:22100, volume:1200000, time:"09:20" },
  { open:22100, high:22150, low:22090, close:22140, volume:1500000, time:"09:25" },
  { open:22140, high:22180, low:22130, close:22170, volume:1300000, time:"09:30" },
  { open:22170, high:22200, low:22150, close:22160, volume:1000000, time:"09:35" },
  { open:22160, high:22180, low:22130, close:22140, volume:900000,  time:"09:40" },
  { open:22140, high:22160, low:22110, close:22120, volume:850000,  time:"09:45" },
  { open:22120, high:22150, low:22100, close:22145, volume:950000,  time:"09:50" },
  { open:22145, high:22190, low:22140, close:22185, volume:1400000, time:"09:55" },
  { open:22185, high:22240, low:22180, close:22230, volume:1800000, time:"10:00" },
  { open:22230, high:22290, low:22220, close:22280, volume:2000000, time:"10:05" },
  { open:22280, high:22340, low:22270, close:22330, volume:1900000, time:"10:10" },
  { open:22330, high:22380, low:22320, close:22360, volume:1700000, time:"10:15" },
  { open:22360, high:22400, low:22350, close:22390, volume:1500000, time:"10:20" },
  { open:22390, high:22420, low:22380, close:22410, volume:1300000, time:"10:25" },
];

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

const BEARISH_CANDLES: Candle[] = [
  { open:3200, high:3240, low:3180, close:3220, volume:900000,  time:"Day 1" },
  { open:3220, high:3250, low:3200, close:3240, volume:800000,  time:"Day 2" },
  { open:3240, high:3280, low:3220, close:3260, volume:1000000, time:"Day 3" },
  { open:3260, high:3300, low:3240, close:3280, volume:1200000, time:"Day 4" },
  { open:3280, high:3320, low:3260, close:3300, volume:1400000, time:"Day 5" },
  { open:3300, high:3330, low:3270, close:3280, volume:1600000, time:"Day 6" },
  { open:3280, high:3290, low:3230, close:3240, volume:1800000, time:"Day 7" },
  { open:3240, high:3250, low:3180, close:3190, volume:2000000, time:"Day 8" },
  { open:3190, high:3210, low:3140, close:3150, volume:2200000, time:"Day 9" },
  { open:3150, high:3160, low:3080, close:3090, volume:2400000, time:"Day 10" },
  { open:3090, high:3100, low:3020, close:3040, volume:2200000, time:"Day 11" },
  { open:3040, high:3060, low:2980, close:3000, volume:2000000, time:"Day 12" },
  { open:3000, high:3030, low:2950, close:2970, volume:1800000, time:"Day 13" },
  { open:2970, high:3010, low:2930, close:2960, volume:1600000, time:"Day 14" },
  { open:2960, high:2990, low:2920, close:2940, volume:1400000, time:"Day 15" },
];

const CANDLESTICK_CANDLES: Candle[] = [
  { open:580, high:595, low:575, close:590, volume:500000, time:"09:15" },
  { open:590, high:600, low:582, close:585, volume:600000, time:"09:30" },
  { open:585, high:592, low:570, close:572, volume:800000, time:"09:45" },
  { open:572, high:578, low:558, close:562, volume:900000, time:"10:00" },
  { open:562, high:570, low:548, close:552, volume:1000000, time:"10:15" },
  { open:552, high:558, low:540, close:555, volume:1200000, time:"10:30" },
  { open:555, high:580, low:552, close:578, volume:1800000, time:"10:45" },
  { open:578, high:598, low:576, close:595, volume:2000000, time:"11:00" },
  { open:595, high:618, low:593, close:615, volume:1800000, time:"11:15" },
  { open:615, high:635, low:612, close:630, volume:1600000, time:"11:30" },
  { open:630, high:648, low:628, close:645, volume:1400000, time:"11:45" },
  { open:645, high:660, low:642, close:655, volume:1200000, time:"12:00" },
  { open:655, high:668, low:652, close:663, volume:1000000, time:"12:15" },
  { open:663, high:672, low:660, close:669, volume:900000, time:"12:30" },
  { open:669, high:678, low:666, close:675, volume:800000, time:"12:45" },
];

const GAP_CANDLES: Candle[] = [
  { open:21900, high:21940, low:21870, close:21920, volume:900000,  time:"Prev D" },
  { open:22080, high:22140, low:22060, close:22120, volume:1800000, time:"09:15" },
  { open:22120, high:22160, low:22090, close:22100, volume:1400000, time:"09:20" },
  { open:22100, high:22130, low:22070, close:22085, volume:1100000, time:"09:25" },
  { open:22085, high:22100, low:22060, close:22075, volume:900000,  time:"09:30" },
  { open:22075, high:22090, low:22050, close:22080, volume:800000,  time:"09:35" },
  { open:22080, high:22100, low:22070, close:22095, volume:850000,  time:"09:40" },
  { open:22095, high:22120, low:22088, close:22115, volume:950000,  time:"09:45" },
  { open:22115, high:22150, low:22110, close:22145, volume:1200000, time:"09:50" },
  { open:22145, high:22190, low:22140, close:22180, volume:1500000, time:"09:55" },
  { open:22180, high:22230, low:22175, close:22220, volume:1800000, time:"10:00" },
  { open:22220, high:22270, low:22215, close:22260, volume:1600000, time:"10:05" },
  { open:22260, high:22300, low:22255, close:22290, volume:1400000, time:"10:10" },
  { open:22290, high:22330, low:22285, close:22320, volume:1200000, time:"10:15" },
  { open:22320, high:22360, low:22315, close:22350, volume:1000000, time:"10:20" },
];

const BTC_CANDLES: Candle[] = [
  { open:62000, high:62800, low:61500, close:62600, volume:800,  time:"Day 1" },
  { open:62600, high:63400, low:62200, close:63100, volume:900,  time:"Day 2" },
  { open:63100, high:63800, low:62800, close:63500, volume:1000, time:"Day 3" },
  { open:63500, high:64200, low:63200, close:64000, volume:1100, time:"Day 4" },
  { open:64000, high:64800, low:63700, close:64500, volume:1200, time:"Day 5" },
  { open:64500, high:65000, low:64200, close:64600, volume:1000, time:"Day 6" },
  { open:64600, high:64900, low:64100, close:64200, volume:900,  time:"Day 7" },
  { open:64200, high:64500, low:63800, close:64000, volume:850,  time:"Day 8" },
  { open:64000, high:64200, low:63600, close:63800, volume:800,  time:"Day 9" },
  { open:63800, high:64600, low:63700, close:64500, volume:1300, time:"Day 10" },
  { open:64500, high:65800, low:64400, close:65600, volume:1600, time:"Day 11" },
  { open:65600, high:67200, low:65500, close:67000, volume:2000, time:"Day 12" },
  { open:67000, high:68500, low:66800, close:68200, volume:2400, time:"Day 13" },
  { open:68200, high:70000, low:68000, close:69800, volume:2800, time:"Day 14" },
  { open:69800, high:71500, low:69500, close:71200, volume:2600, time:"Day 15" },
];

const EXPIRY_CANDLES: Candle[] = [
  { open:22200, high:22250, low:22180, close:22230, volume:2000000, time:"09:15" },
  { open:22230, high:22280, low:22210, close:22260, volume:2500000, time:"09:30" },
  { open:22260, high:22310, low:22240, close:22290, volume:3000000, time:"09:45" },
  { open:22290, high:22340, low:22270, close:22320, volume:3500000, time:"10:00" },
  { open:22320, high:22360, low:22290, close:22310, volume:4000000, time:"10:15" },
  { open:22310, high:22340, low:22270, close:22280, volume:4500000, time:"10:30" },
  { open:22280, high:22300, low:22240, close:22250, volume:5000000, time:"10:45" },
  { open:22250, high:22270, low:22210, close:22220, volume:5500000, time:"11:00" },
  { open:22220, high:22240, low:22180, close:22190, volume:6000000, time:"11:15" },
  { open:22190, high:22210, low:22150, close:22160, volume:6500000, time:"11:30" },
  { open:22160, high:22180, low:22120, close:22130, volume:7000000, time:"11:45" },
  { open:22130, high:22150, low:22090, close:22100, volume:7500000, time:"12:00" },
  { open:22100, high:22120, low:22060, close:22070, volume:8000000, time:"12:15" },
  { open:22070, high:22090, low:22030, close:22040, volume:8500000, time:"12:30" },
  { open:22040, high:22060, low:22000, close:22010, volume:9000000, time:"12:45" },
];

// ── ALL 8 NEW SCENARIOS ───────────────────────────────────────

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
  {
    id: "moving-average-crossover",
    title: "Moving Average Crossover",
    subtitle: "9 EMA and 21 EMA crossover with volume confirmation",
    category: "Trend Following",
    difficulty: "Intermediate",
    duration: "4 min",
    icon: "📈",
    isPro: false,
    instrument: "NIFTY 50",
    timeframe: "15-minute chart",
    dataSource: "Historical simulation — May 2024",
    disclaimer: "Educational simulation using historical data. Not investment advice.",
    candles: MA_CANDLES,
    steps: [
      {
        id: 1,
        title: "What Moving Averages Tell You",
        narration: "A moving average smooths out price noise to show the underlying trend. The 9 EMA — Exponential Moving Average — reacts quickly to recent prices. The 21 EMA reacts more slowly and represents the medium-term trend. When the fast 9 EMA crosses ABOVE the slow 21 EMA, it signals that short-term momentum has turned bullish. This is called a Golden Cross on a short timeframe.",
        action: "Drawing 9 EMA and 21 EMA on the chart",
        rule: "Rule 1: Fast EMA above Slow EMA = uptrend. Fast EMA below Slow EMA = downtrend.",
        chartAction: "draw_ma",
      },
      {
        id: 2,
        title: "Identify the Crossover Signal",
        narration: "Look at candle number 9. The 9 EMA has just crossed above the 21 EMA. This is our signal. But we have one more condition to check before entering — volume. Is volume expanding on this crossover candle? If volume is low on the crossover, it is a weak signal. If volume is high — 1.5 times the 20-period average or more — the signal is strong.",
        action: "Highlighting EMA crossover at candle 9 — checking volume",
        rule: "Rule 2: Only trade MA crossovers confirmed by ABOVE-average volume",
        highlight: [8, 9],
        chartAction: "highlight_candle",
        checkpoint: {
          question: "The 9 EMA crosses above 21 EMA but volume is 30% BELOW average. What do you do?",
          options: [
            "Enter immediately — crossover is the signal",
            "Skip this trade — volume does not confirm the signal",
            "Enter with half position size",
            "Wait for the next crossover",
          ],
          correct: 1,
          explanation: "Skip it. A crossover without volume confirmation is a weak signal — often a false breakout. Professional traders require volume expansion to confirm momentum. Low-volume crossovers frequently reverse quickly.",
        },
        pause: true,
      },
      {
        id: 3,
        title: "Entry, Stop and Target",
        narration: "Crossover confirmed at 22,195 with above-average volume. We enter long at 22,200 — a few points above the crossover candle's close to confirm upward momentum. Stop-loss goes below the 21 EMA — at 22,140. If price returns below the slow EMA, the trend has reversed and we are wrong. Target is 2 times the risk: 60 points risk means 120 points target — so 22,320.",
        action: "Placing entry order with EMA-based stop loss",
        rule: "Rule 3: Stop goes below the Slow EMA — not below the crossover candle",
        calculation: "Entry: 22,200 | Stop: 22,140 | Target: 22,320\nRisk: 60 pts | Reward: 120 pts | RR: 1:2\nCapital: ₹2,00,000 | 1% Risk: ₹2,000\nPosition: 2,000 ÷ 60 = 33 units",
        chartAction: "mark_entry",
        chartData: { entry: 22200, stop: 22140 },
      },
      {
        id: 4,
        title: "Manage with the EMA",
        narration: "Unlike fixed stops, with EMA strategies we trail our stop WITH the moving average. As the 21 EMA rises, we move our stop up to just below the new EMA level. This keeps us in the trend for as long as the trend continues. Price moved from 22,200 to 22,480 — a 280 point move. If we had a fixed target at 22,320, we would have missed 160 additional points of profit.",
        action: "Trailing stop with the 21 EMA as price trends higher",
        rule: "Rule 4: With trend-following strategies, trail stops with the indicator — not fixed targets",
        chartAction: "trail_stop",
        chartData: { old_stop: 22140, new_stop: 22350 },
      },
      {
        id: 5,
        title: "Exit When EMA Recrosses",
        narration: "We exit when the 9 EMA crosses BACK BELOW the 21 EMA — signaling the trend has ended. Final exit at 22,450. Trade result: 250 points profit on 33 units. P&L approximately 8,250 rupees on 2,000 rupees risk — a 4 to 1 risk-reward. The power of trend following is staying in trades longer than discretionary traders would.",
        action: "Exiting on EMA recross signal",
        calculation: "Entry: 22,200 | Exit: 22,450 | Risk: 60 pts\nProfit: 250 pts × 33 units = ₹8,250\nRisk taken: ₹2,000 | RR achieved: 1:4.1\nNote: Trailing with EMA captured 160 extra points vs fixed target",
        chartAction: "mark_exit",
        chartData: { exit: 22450 },
      },
    ],
  },

  {
    id: "fibonacci-trade",
    title: "Fibonacci Retracement Entry",
    subtitle: "The 0.618 golden ratio level — identifying high-probability pullback entries",
    category: "Price Action",
    difficulty: "Intermediate",
    duration: "5 min",
    icon: "🌀",
    isPro: true,
    instrument: "HDFC Bank",
    timeframe: "Daily chart",
    dataSource: "Historical simulation — July 2024",
    disclaimer: "Educational simulation using historical data. Not investment advice.",
    candles: FIBONACCI_CANDLES,
    steps: [
      {
        id: 1,
        title: "Draw the Fibonacci Retracement",
        narration: "HDFC Bank has made a strong rally from 1,580 to 1,950 — a move of 370 points. After such a move, price typically pulls back before continuing higher. We use Fibonacci retracement to identify WHERE that pullback is likely to pause. We draw from the swing low at 1,580 to the swing high at 1,950. The tool automatically plots the key levels: 23.6%, 38.2%, 50%, 61.8%, and 78.6%.",
        action: "Drawing Fibonacci retracement from swing low to swing high",
        rule: "Rule 1: Draw Fibonacci from the most significant recent swing low to swing high",
        calculation: "Swing Low: ₹1,580 | Swing High: ₹1,950 | Move: 370 pts\nFibonacci Levels:\n23.6%: ₹1,863\n38.2%: ₹1,809\n50.0%: ₹1,765\n61.8%: ₹1,721 ← Golden Ratio (Key Level)\n78.6%: ₹1,659",
        chartAction: "draw_resistance",
        chartData: { level: 1765, zone_high: 1800, zone_low: 1720 },
      },
      {
        id: 2,
        title: "The 61.8% Level — The Golden Ratio",
        narration: "The 61.8% retracement level — derived from the Fibonacci sequence — is the most powerful level in technical analysis. It represents the Golden Ratio found throughout nature and mathematics. In markets, it represents the deepest retracement that a strong trend typically makes before resuming. Our 61.8% level on HDFC Bank is 1,721. This is our primary target zone.",
        action: "Highlighting the 61.8% golden ratio level on chart",
        rule: "Rule 2: The 61.8% level is the most reliable — but only when supported by other confluences",
        checkpoint: {
          question: "Price reaches the 61.8% Fibonacci level. What ADDITIONAL confirmation should you wait for before entering?",
          options: [
            "Enter immediately at 61.8% — it always works",
            "A trigger candle: bullish engulfing, pin bar, or close above previous candle high",
            "Wait for price to reach 78.6% level instead",
            "Look at RSI — it must be exactly at 30",
          ],
          correct: 1,
          explanation: "Always wait for a trigger candle at Fibonacci levels. The level shows WHERE price may bounce — the trigger candle confirms it HAS bounced. Entering without confirmation means buying into a still-falling price, risking that the level breaks.",
        },
        pause: true,
      },
      {
        id: 3,
        title: "Confluence — Three Confirmations",
        narration: "The best Fibonacci entries have multiple confirmations — called confluence. At our 61.8% level of 1,721, we observe three confluences. One: the 61.8% Fibonacci level itself. Two: a previous support area from Day 3 of the chart — price consolidated here before breaking out. Three: the 50-day moving average is at 1,715 — within the same zone. Three independent technical factors pointing to the same level dramatically increases probability.",
        action: "Marking three confluences at the 61.8% zone",
        rule: "Rule 3: Minimum 2 confluences at a Fibonacci level before considering entry",
        calculation: "Confluence Zone at ₹1,715-1,730:\n1. 61.8% Fibonacci retracement: ₹1,721\n2. Previous structure support: ₹1,718\n3. 50-day Moving Average: ₹1,715\nAll three within 15-point range = High-probability zone",
      },
      {
        id: 4,
        title: "Entry with Precise Stop Placement",
        narration: "Trigger candle forms on Day 10 — a bullish hammer at 1,760, closing at 1,780. We enter at 1,785 — above the trigger candle's high. Stop goes below the 61.8% level and previous structure at 1,700 — giving the trade room to breathe without sacrificing excessive capital. Target is the prior swing high at 1,950 — a 165-point reward versus 85-point risk. Risk-reward: 1 to 1.94.",
        action: "Entering at trigger candle high with structure-based stop",
        calculation: "Entry: ₹1,785 | Stop: ₹1,700 | Target: ₹1,950\nRisk: 85 pts | Reward: 165 pts | RR: 1:1.94\nCapital: ₹5,00,000 | 1% Risk: ₹5,000\nPosition: 5,000 ÷ 85 = 58 shares",
        chartAction: "mark_entry",
        chartData: { entry: 1785, stop: 1700 },
      },
      {
        id: 5,
        title: "Target Reached — Trade Complete",
        narration: "HDFC Bank recovered from 1,760 all the way back to 2,050 — well beyond our initial target of 1,950. We exit at 1,950 as planned. Profit: 58 shares multiplied by 165 points equals 9,570 rupees on 5,000 rupees risk. This demonstrates the power of confluence — when multiple technical factors align at one level, the probability of a successful trade increases significantly.",
        action: "Exiting at prior swing high target",
        calculation: "Entry: ₹1,785 | Exit: ₹1,950 | Stop: ₹1,700\nProfit: 58 × 165 = ₹9,570\nRisk: ₹5,000 | RR: 1:1.9\nNote: Price continued to 2,050 — with trailing stop could have captured more",
        chartAction: "mark_exit",
        chartData: { exit: 1950 },
      },
    ],
  },

  {
    id: "intraday-nifty",
    title: "Intraday NIFTY — Full Day Walkthrough",
    subtitle: "Pre-market prep, opening range, entry at 10 AM, trail, exit by 3:15 PM",
    category: "Intraday",
    difficulty: "Advanced",
    duration: "7 min",
    icon: "⚡",
    isPro: true,
    instrument: "NIFTY 50",
    timeframe: "5-minute chart",
    dataSource: "Historical simulation — August 2024",
    disclaimer: "Intraday trading is high-risk. Educational only. Not investment advice.",
    candles: INTRADAY_CANDLES,
    steps: [
      {
        id: 1,
        title: "Pre-Market Preparation (8:45 AM)",
        narration: "Successful intraday trading begins before the market opens. At 8:45 AM, we check three things. One: Singapore Nifty futures — are they indicating a gap-up or gap-down opening? Today SGX Nifty shows 22,080 versus yesterday's NIFTY close of 22,050 — a mild gap-up. Two: Any major news or events today? RBI decision, earnings announcement, global markets? We check NSE's event calendar. Three: Previous day's key levels — support at 22,020, resistance at 22,180.",
        action: "Pre-market analysis — SGX Nifty, news, key levels",
        rule: "Rule 1: Never trade intraday without a pre-market analysis. Know the context before you trade.",
        calculation: "Pre-Market Checklist:\n✅ SGX Nifty: +30 pts gap-up\n✅ Global markets: Asia positive, US flat\n✅ Key levels: Support 22,020 | Resistance 22,180\n✅ No major events today\n✅ Previous day: Closed at 22,050 with bullish candle\nBias: Cautiously bullish — wait for opening range",
      },
      {
        id: 2,
        title: "Opening Range (9:15 - 9:30 AM)",
        narration: "The first 15 minutes of trading, 9:15 to 9:30 AM, is the opening range. This is when retail panic, institutional positioning, and overnight news all collide. Volumes are highest. Moves are often exaggerated and reversed. Rule: DO NOT trade in the first 15 minutes. Watch. Mark the high and low of the opening range. NIFTY opens at 22,060, reaches high 22,140, low 22,050 in the first three candles. These become our reference levels.",
        action: "Marking opening range high and low — 9:15 to 9:30 AM",
        rule: "Rule 2: NEVER trade in the first 15 minutes. Mark the opening range and wait.",
        highlight: [0, 1, 2],
        chartAction: "highlight_candle",
        checkpoint: {
          question: "NIFTY opens with a big gap-up and shoots up 150 points in the first 5 minutes. What do you do?",
          options: [
            "Buy immediately — strong momentum, don't miss it",
            "Short it — gap-ups always reverse",
            "Wait — mark the range and let price settle before taking any position",
            "Buy with 50% position since it might reverse",
          ],
          correct: 2,
          explanation: "Always wait. The first 15 minutes is dominated by retail panic and institutional execution — not sustainable direction. The biggest intraday losses happen to traders who chase the first 5-minute move. Wait for the range to form, then trade the breakout or retest of the range.",
        },
        pause: true,
      },
      {
        id: 3,
        title: "Entry Setup — 10:00 AM",
        narration: "It is now 10:00 AM. NIFTY has broken above the opening range high of 22,140 on the 9:55 candle — with significantly above-average volume. This is our entry signal: Opening Range Breakout. We enter at 22,160 — slightly above the breakout candle close. Stop goes below the opening range low at 22,020 — if price returns there, the breakout has failed. Today we are risking 140 points.",
        action: "Entering on opening range breakout at 10:00 AM",
        rule: "Rule 3: Opening range breakout entries require volume confirmation — minimum 1.5x average",
        calculation: "Opening Range: Low 22,020 | High 22,140 | Range: 120 pts\nEntry: 22,160 (above ORH) | Stop: 22,020 (below ORL)\nRisk: 140 pts | Target 1: 22,280 (1:1) | Target 2: 22,420 (1:2)\nCapital: ₹10,00,000 | 1% Risk: ₹10,000\nPosition: 10,000 ÷ 140 = 71 units (approx 1 lot NIFTY futures)",
        chartAction: "mark_entry",
        chartData: { entry: 22160, stop: 22020 },
      },
      {
        id: 4,
        title: "Managing the Intraday Trade",
        narration: "Intraday trading has one absolute rule: you MUST close all positions before 3:15 PM. This is not optional. Holding NIFTY futures overnight exposes you to gap risk — NIFTY can open 200 points different the next day due to global events. At 11:00 AM, NIFTY reaches 22,280 — our first target. We book 50% of the position here. Stop for remaining 50% moves up to breakeven at 22,160.",
        action: "Partial profit booking at Target 1 — trailing stop on remainder",
        rule: "Rule 4: Intraday positions MUST be closed before 3:15 PM — no exceptions",
        chartAction: "trail_stop",
        chartData: { old_stop: 22020, new_stop: 22160 },
        calculation: "At 11:00 AM:\nTarget 1 hit: 22,280\n50% exit: 35 units × 120 pts = ₹4,200 profit\nRemaining 35 units: Stop moved to 22,160 (breakeven)\nWorst case now: ₹0 loss on remaining position",
      },
      {
        id: 5,
        title: "Final Exit — 3:00 PM",
        narration: "By 3:00 PM, NIFTY has reached 22,410 — well above our second target. We MUST close now — 15 minutes before closing. We exit remaining 35 units at 22,410. Total P&L: first exit 4,200 plus second exit 35 units times 250 points equals 8,750. Total profit 12,950 rupees on 10,000 rupees risk. A disciplined intraday trader focuses on the process: pre-market analysis, opening range, breakout, trailing, exit by 3:15. Never the outcome.",
        action: "Mandatory exit before 3:15 PM close",
        calculation: "Trade Summary:\nExit 1 (11:00 AM): 35 units × 120 pts = +₹4,200\nExit 2 (3:00 PM): 35 units × 250 pts = +₹8,750\nTotal P&L: +₹12,950 | Risk: ₹10,000 | RR: 1:1.3\n\nProcess Score:\n✅ Pre-market analysis done\n✅ No trade in first 15 minutes\n✅ Volume confirmed breakout\n✅ Partial profit at Target 1\n✅ Closed before 3:15 PM\nScore: 5/5 — Perfect execution",
        chartAction: "mark_exit",
        chartData: { exit: 22410 },
      },
    ],
  },

  {
    id: "discipline-no-trade",
    title: "The Disciplined No-Trade Day",
    subtitle: "The most important scenario: when the rules say DO NOT trade",
    category: "Psychology",
    difficulty: "Beginner",
    duration: "3 min",
    icon: "🧘",
    isPro: false,
    instrument: "NIFTY 50",
    timeframe: "15-minute chart",
    dataSource: "Historical simulation — September 2024",
    disclaimer: "Educational simulation using historical data. Not investment advice.",
    candles: MA_CANDLES,
    steps: [
      {
        id: 1,
        title: "Recognizing a No-Trade Setup",
        narration: "Professional traders have a list of conditions that MUST be met before they enter any trade. When those conditions are not met — they do not trade. Today we are going to walk through a day where the chart looks tempting but none of our rules are actually triggered. This is the hardest lesson in trading: the discipline to do nothing.",
        action: "Reviewing checklist — no conditions met",
        rule: "Core Principle: A trade not taken is not a loss. Forcing trades is what causes real losses.",
        calculation: "Today's Trade Checklist:\n❌ No clear breakout above resistance\n❌ Volume is below average all day\n❌ Price in middle of range — no edge\n❌ Mixed signals: RSI neutral, no MA cross\n❌ No clear risk level to define stop\nVERDICT: NO TRADE TODAY",
      },
      {
        id: 2,
        title: "The FOMO Trap",
        narration: "At 11:30 AM, NIFTY makes a quick 80-point move. Every social media group is screaming 'buy now.' Your friends are posting profits. Your heart is racing. This is FOMO — Fear of Missing Out. It is the most expensive emotion in trading. Let us check our rules: Did price break above resistance on high volume? No — price is still inside the range. Did our EMA crossover confirm? No — the 9 EMA is still below the 21 EMA. Rules say no trade.",
        action: "FOMO moment — checking rules and standing aside",
        rule: "Rule: FOMO is not a trading signal. Your checklist is the only valid entry signal.",
        checkpoint: {
          question: "NIFTY shoots up 80 points quickly. Your friend says 'quick, buy now, it's going to 500 points!' What do you do?",
          options: [
            "Buy immediately — momentum is clear",
            "Buy half position just in case",
            "Check your rules checklist — if no confirmation, do not trade",
            "Ask another friend for their opinion",
          ],
          correct: 2,
          explanation: "Always check your rules first. If your setup conditions are not met, do not trade — regardless of what others are doing. Trading based on friends' tips and FOMO is gambling, not trading. The move might continue, or it might reverse. Your edge comes from rules, not emotions.",
        },
        pause: true,
      },
      {
        id: 3,
        title: "The Cost of Doing Nothing — Actually Zero",
        narration: "The day ends. The 80-point spike reversed completely. Traders who bought the FOMO move got stopped out for a loss. You made zero rupees profit — but also zero loss. Your capital is intact. Your rules are intact. Tomorrow you fight fresh, with full capital. The trader who did nothing today is in a better position than the trader who forced a trade. Capital preservation IS profit when the setup is not there.",
        action: "End of day review — capital preserved, rules followed",
        rule: "The best traders spend more time NOT trading than trading. Patience is a strategy.",
        calculation: "End of Day Result:\nTrades taken: 0\nP&L: ₹0\nCapital: 100% intact\n\nFOMO traders who bought the spike:\nEntry: 22,280 | Stop: 22,140 | Stopped out: -140 pts\nP&L: -₹4,620 on 33 units\n\nWinner today: The trader who did nothing.\nTomorrow: Another opportunity with full capital intact.",
      },
    ],
  },

  {
    id: "sip-kya-hai-hindi",
    title: "SIP Kya Hai — Hindi Animation",
    subtitle: "Compound interest aur SIP ka jadu — step by step Hindi mein",
    category: "Personal Finance",
    difficulty: "Beginner",
    duration: "4 min",
    icon: "🌱",
    isPro: false,
    instrument: "Mutual Fund SIP",
    timeframe: "Monthly",
    dataSource: "Educational demonstration",
    disclaimer: "Yeh sirf educational simulation hai. Mutual fund investments are subject to market risks.",
    candles: MA_CANDLES,
    steps: [
      {
        id: 1,
        title: "SIP (सिस्टमैटिक इन्वेस्टमेंट प्लान) क्या है?",
        narration: "नमस्ते! आज हम समझेंगे SIP यानी सिस्टमैटिक इन्वेस्टमेंट प्लान के बारे में। SIP एक ऐसा तरीका है जिसमें आप हर महीने एक निश्चित रकम (जैसे ₹1,000 या ₹5,000) अपनी पसंद के म्यूचुअल फंड में ऑटोमैटिकली इन्वेस्ट करते हैं। यह अनुशासन और नियमित बचत सिखाता है।",
        action: "मंथली ऑटो-डेबिट और अनुशासित निवेश की शुरुआत",
        rule: "नियम 1: मार्केट को टाइम करने की कोशिश न करें, हर महीने नियमित रूप से SIP जारी रखें।",
      },
      {
        id: 2,
        title: "कंपाउंडिंग का जादू — पैसे से पैसा बनना",
        narration: "अल्बर्ट आइंस्टीन ने कंपाउंडिंग को दुनिया का आठवां अजूबा कहा था। जब आपके कमाए गए रिटर्न पर भी दोबारा रिटर्न मिलता है, तो उसे कंपाउंडिंग कहते हैं। 10, 15 या 20 साल में आपकी छोटी सी ₹5,000 की SIP लाखों-करोड़ों का वेल्थ बना सकती है।",
        action: "कंपाउंड ग्रोथ का विज़ुअलाइज़ेशन",
        rule: "नियम 2: कंपाउंडिंग के लिए सबसे महत्वपूर्ण चीज़ है 'समय' — जितनी जल्दी शुरू करेंगे, उतना बड़ा लाभ मिलेगा।",
        calculation: "₹5,000 प्रति माह | 12% वार्षिक अनुमानित रिटर्न:\n10 साल: निवेश ₹6 लाख → वैल्यू ₹11.6 लाख\n20 साल: निवेश ₹12 लाख → वैल्यू ₹49.9 लाख\n30 साल: निवेश ₹18 लाख → वैल्यू ₹1.76 करोड़!",
      },
      {
        id: 3,
        title: "मार्केट क्रैश में रुपया कॉस्ट एवरेजिंग का लाभ",
        narration: "जब बाज़ार गिरता है, तो आम लोग डरकर पैसे निकाल लेते हैं। लेकिन SIP इन्वेस्टर के लिए गिरावट एक डिस्काउंट सेल है! क्योंकि जब NAV गिरती है, तो आपके उसी ₹5,000 में आपको ज़्यादा यूनिट्स मिलते हैं। जब मार्केट रिकवर होता है, तो आपका मुनाफा तेज़ी से बढ़ता है।",
        action: "रुपया कॉस्ट एवरेजिंग (Rupee Cost Averaging) का विश्लेषण",
        rule: "नियम 3: जब बाज़ार गिरे, तो कभी भी अपनी SIP न रोकें। गिरावट में ही सबसे ज़्यादा यूनिट्स जमा होते हैं।",
        checkpoint: {
          question: "यदि शेयर बाज़ार में 15% की भारी गिरावट आ जाती है, तो एक समझदार SIP निवेशक को क्या करना चाहिए?",
          options: [
            "डरकर तुरंत अपनी SIP बंद कर देनी चाहिए",
            "SIP को शांति से जारी रखना चाहिए और संभव हो तो अतिरिक्त निवेश करना चाहिए",
            "सारा पैसा निकालकर फिक्स्ड डिपॉजिट में डाल देना चाहिए",
            "अपने बैंक खाते को ही बंद कर देना चाहिए",
          ],
          correct: 1,
          explanation: "बिल्कुल सही! मंदी के समय म्यूचुअल फंड की एनएवी (NAV) सस्ती हो जाती है, जिससे आपको अधिक यूनिट्स मिलते हैं। इसे रुपया कॉस्ट एवरेजिंग कहते हैं जो लंबी अवधि में भारी मुनाफा देती है।",
        },
        pause: true,
      },
      {
        id: 4,
        title: "स्टेप-अप SIP — वेतन बढ़ने के साथ निवेश बढ़ाएँ",
        narration: "हर साल जब आपकी सैलरी या आमदनी 10% बढ़े, तो अपनी SIP में भी 10% की बढ़ोतरी करें। इसे 'स्टेप-अप SIP' कहते हैं। केवल 10% सालाना स्टेप-अप करने से आपका फाइनल कॉर्पस लगभग दोगुना हो सकता है।",
        action: "सालाना 10% स्टेप-अप एसआईपी का प्रभाव",
        rule: "नियम 4: हर साल अपनी SIP राशि को अपनी आय के अनुपात में 10% ज़रूर बढ़ाएँ।",
        calculation: "₹5,00,000 लक्ष्य | ₹5,000 प्रति माह + 10% सालाना स्टेप-अप:\n20 साल में कुल निवेश: ₹34.3 लाख\nकुल पोर्टफोलियो वैल्यू: ₹98.2 लाख (साधारण SIP से ₹48 लाख अधिक!)",
      },
      {
        id: 5,
        title: "वित्तीय स्वतंत्रता का लक्ष्य हासिल",
        narration: "बधाई हो! आपने SIP के सभी बुनियादी और उन्नत नियमों को समझ लिया है। अनुशासन, धैर्य और लंबी अवधि की सोच ही आपको आर्थिक रूप से स्वतंत्र बनाती है। आज ही अपनी SIP शुरू करें और अपने भविष्य को सुरक्षित करें।",
        action: "सफल लॉन्ग-टर्म वेल्थ क्रिएशन की बधाई",
        calculation: "सफल निवेशक की चेकलिस्ट:\n✅ समय पर SIP शुरू की\n✅ मार्केट की गिरावट में घबराए नहीं\n✅ हर साल 10% स्टेप-अप किया\n✅ 15+ वर्षों तक अनुशासन बनाए रखा\nस्कोर: 5/5 — वित्तीय स्वतंत्रता!",
      },
    ],
  },

  {
    id: "support-resistance-hindi",
    title: "Support aur Resistance — Hindi",
    subtitle: "Support aur resistance kaise identify karein — step by step Hindi mein",
    category: "Price Action",
    difficulty: "Beginner",
    duration: "4 min",
    icon: "🇮🇳",
    isPro: false,
    instrument: "NIFTY 50",
    timeframe: "15-minute chart",
    dataSource: "Historical simulation — Hindi narration",
    disclaimer: "Yeh sirf educational simulation hai. Investment advice nahi. Historical data use kiya gaya hai.",
    candles: MA_CANDLES,
    steps: [
      {
        id: 1,
        title: "Support kya hai?",
        narration: "Namaskar! Aaj hum sikhenge support aur resistance ke baare mein. Support woh level hai jahan price ke neeche jaane par buyers aate hain aur price wapas upar jaati hai. Socho ek floor ki tarah — price uske neeche bahut mushkil se jaati hai. Chart mein dekho — 22,140 ka level teen baar test hua aur har baar price wapas upar gayi. Yeh hai strong support.",
        action: "Support level identify karna chart par",
        rule: "Rule 1: Minimum 2 baar test hone par hi support valid maana jaata hai",
        chartAction: "draw_support",
        chartData: { level: 22140, zone_high: 22160, zone_low: 22120 },
      },
      {
        id: 2,
        title: "Resistance kya hai?",
        narration: "Resistance woh level hai jahan price ke upar jaane par sellers aate hain aur price wapas neeche aaati hai. Socho ek ceiling ki tarah. Chart mein 22,450 ka level do baar test hua — dono baar price wapas neeche aayi. Iska matlab sellers is level par bahut strong hain. Jab tak is ceiling ko break nahi kiya jaata, price iske upar nahi jaayegi.",
        action: "Resistance level identify karna chart par",
        rule: "Rule 2: Resistance ke upar close hone par hi trend change maana jaata hai",
        chartAction: "draw_resistance",
        chartData: { level: 22450, zone_high: 22470, zone_low: 22430 },
        checkpoint: {
          question: "Price 22,450 ke resistance level par aayi. Ek badi green candle ne 22,470 par close kiya aur volume bahut zyaada tha. Aap kya karenge?",
          options: [
            "Abhi buy karo — resistance toot gaya",
            "Wait karo — ek candle se confirm nahi hota",
            "Short karo — resistance par hamesha short karo",
            "Kuch mat karo — market samajh nahi aa raha",
          ],
          correct: 0,
          explanation: "Bilkul sahi! Jab ek strong bullish candle high volume ke saath resistance ke upar close kare, toh yeh breakout confirm hai. Itne clear signal par buy karna sahi decision hai. Lekin stop-loss zaroor lagaao — resistance ke neeche.",
        },
        pause: true,
      },
      {
        id: 3,
        title: "Trade Entry aur Stop-Loss",
        narration: "Resistance breakout confirm hua 22,470 par. Hum buy karte hain 22,480 par. Stop-loss jaata hai 22,380 par — breakout ke neeche. Agar price wapas 22,380 ke neeche gayi, toh iska matlab breakout fail ho gaya aur hum galat the. Hum apna loss accept karte hain aur bahar nikalte hain. Yeh hai professional trading — loss ko chhota rakhna aur profit ko badhne dena.",
        action: "Buy order 22,480 par, stop-loss 22,380 par",
        rule: "Rule 3: Har trade mein stop-loss zaroori hai — bina stop ke trade mat karo",
        calculation: "Entry: 22,480 | Stop: 22,380 | Target: 22,680\nRisk: 100 pts | Reward: 200 pts | RR: 1:2\nCapital: ₹2,00,000 | 1% Risk: ₹2,000\nPosition: 2,000 ÷ 100 = 20 units",
        chartAction: "mark_entry",
        chartData: { entry: 22480, stop: 22380 },
      },
      {
        id: 4,
        title: "Trade ka Result",
        narration: "NIFTY aage badha aur 22,680 tak pahuncha — hamaara target. Profit: 20 units times 200 points equals 4,000 rupaye. Humaara risk sirf 2,000 rupaye tha. Iska matlab humne 2,000 risk lekar 4,000 kamaye — yeh hai 1 to 2 risk-reward. Yaad rakho: support aur resistance trading mein sabse important cheez hai PATIENCE — sahi setup ka intezaar karna. Jaldi mat karo.",
        action: "Target hit — trade complete",
        calculation: "Entry: 22,480 | Exit: 22,680 | Stop: 22,380\nProfit: 20 × 200 = ₹4,000\nRisk: ₹2,000 | RR: 1:2\n\nSabak:\n✅ Support/resistance clearly identify kiya\n✅ Breakout ka wait kiya\n✅ Volume confirm kiya\n✅ Stop-loss laga kiya\n✅ Target par exit kiya\nScore: 5/5 — Excellent!",
        chartAction: "mark_exit",
        chartData: { exit: 22680 },
      },
    ],
  },

  // ── EXPANSION SCENARIOS 13–20 (Exact Master Specification) ──
  // ── SCENARIO 13: CANDLESTICK PATTERN TRADE ──────────────────
  {
    id: "candlestick-pattern-trade",
    title: "Candlestick Pattern Trade",
    subtitle: "Hammer + Bullish Engulfing — reading candles and entering live",
    category: "Price Action",
    difficulty: "Beginner",
    duration: "5 min",
    icon: "🕯️",
    isPro: false,
    instrument: "HDFC Bank",
    timeframe: "15-minute chart",
    dataSource: "Historical simulation — October 2024",
    disclaimer: "Educational simulation using historical data. Not investment advice.",
    candles: CANDLESTICK_CANDLES,
    steps: [
      {
        id: 1,
        title: "What Candlesticks Actually Tell You",
        narration: "Every single candlestick is a war between buyers and sellers compressed into one time period. The body shows who won — green means buyers won, red means sellers won. The wicks show how far each side fought before losing. A long lower wick with a small green body — called a Hammer — tells us sellers tried hard to push price down but buyers completely overwhelmed them by the close. This is powerful information.",
        action: "Anatomy of a candlestick — body, wick, open, close",
        rule: "Rule 1: Read the STORY of each candle — who tried what, and who actually won",
        calculation: "Hammer anatomy:\nOpen: ₹562 | Low: ₹540 | Close: ₹555\nBody size: ₹ 7 (small — sellers and buyers balanced at close)\nLower wick: ₹22 (sellers pushed hard)\nUpper wick: ₹3 (buyers pushed slightly)\nInterpretation: Sellers failed. Buyers now in control.",
      },
      {
        id: 2,
        title: "The Hammer Candle — Recognizing It",
        narration: "Candle 6 on our chart is a classic Hammer. Price has been falling for 5 candles. Then suddenly: price opens at 552, sellers push it all the way down to 540 — a new low. But then buyers completely reverse it, closing at 555 — almost exactly where it opened. The lower wick is 3 times the body size. This is the definition of a Hammer. It does NOT mean buy immediately. It means: be alert, watch the NEXT candle for confirmation.",
        action: "Highlighting the Hammer candle at candle 6",
        highlight: [5],
        chartAction: "highlight_candle",
        rule: "Rule 2: Hammer signals possible reversal. Wait for NEXT candle to close ABOVE the Hammer's high for confirmation.",
        checkpoint: {
          question: "You see a perfect Hammer candle. The NEXT candle opens up but comes back down and closes BELOW the Hammer's low. What does this mean?",
          options: [
            "The Hammer still works — wait for one more candle",
            "The Hammer is invalidated — sellers have overpowered buyers again",
            "Buy more — this is a better entry",
            "The pattern needs 3 candles to confirm",
          ],
          correct: 1,
          explanation: "If the next candle closes below the Hammer's low, the pattern is completely invalidated. The seller pushed back and won. This is why we ALWAYS wait for confirmation and have a stop below the Hammer's low — if that level breaks, we are wrong.",
        },
        pause: true,
      },
      {
        id: 3,
        title: "The Bullish Engulfing — Double Confirmation",
        narration: "Candle 7 is even more powerful — a Bullish Engulfing. It opens BELOW the previous red candle's close and closes ABOVE the previous red candle's open. The green body completely engulfs the previous red body. This is the highest-probability single-candle reversal pattern. We now have two confirmations: the Hammer at candle 6 and the Engulfing at candle 7. Entry is now valid.",
        action: "Highlighting Bullish Engulfing candle 7 with the Hammer context",
        highlight: [5, 6],
        chartAction: "highlight_candle",
        rule: "Rule 3: Bullish Engulfing after a downtrend = highest-confidence entry signal",
        calculation: "Bullish Engulfing at candle 7:\nPrevious red: Open 552 → Close 555\nEngulfing green: Open 552 → Close 578\nBody completely covers previous red body ✅\nVolume: 1,800,000 vs 1,200,000 average ✅ (1.5x)\nBoth confirmations met — VALID ENTRY",
      },
      {
        id: 4,
        title: "Entry, Stop and Target",
        narration: "We enter at 580 — just above the Engulfing candle's high. Stop goes below the Hammer's low at 540 — this is the level that, if broken, completely invalidates the bullish pattern. Risk is 40 rupees. Target is previous resistance at 660 — a 80-rupee reward. Risk-reward: 1 to 2. Position size on 1 lakh capital at 1% risk: 1,000 rupees divided by 40 equals 25 shares.",
        action: "Placing buy order above Engulfing candle high",
        rule: "Rule 4: Entry above Engulfing high. Stop below Hammer low. Never compromise these levels.",
        calculation: "Entry: ₹580 | Stop: ₹540 | Target: ₹660\nRisk: 40 pts | Reward: 80 pts | RR: 1:2\nCapital: ₹1,00,000 | 1% Risk: ₹1,000\nPosition: 1,000 ÷ 40 = 25 shares",
        chartAction: "mark_entry",
        chartData: { entry: 580, stop: 540 },
      },
      {
        id: 5,
        title: "Target Hit — Candlestick Trade Complete",
        narration: "After the Hammer and Engulfing confirmed the reversal, HDFC Bank rallied from 580 to 675 — well beyond our target of 660. We exit at 660. Profit: 25 shares times 80 rupees equals 2,000 rupees on 1,000 rupees risk. A perfect 1-to-2 risk-reward trade. The pattern worked because we had multiple confirmations, traded at a key level after a downtrend, and had volume supporting the move.",
        action: "Exiting at resistance target — trade complete",
        calculation: "Entry: ₹580 | Exit: ₹660 | Stop: ₹540\nProfit: 25 × 80 = ₹2,000 on ₹1,000 risk\nRR achieved: 1:2 ✅\n\nKey lessons:\n• Hammer alone = alert, not entry\n• Engulfing confirms = valid entry\n• Volume must confirm\n• Stop below Hammer low — always",
        chartAction: "mark_exit",
        chartData: { exit: 660 },
      },
    ],
  },

  // ── SCENARIO 14: VWAP INTRADAY ──────────────────────────────
  {
    id: "vwap-intraday-strategy",
    title: "VWAP Intraday Strategy",
    subtitle: "Volume Weighted Average Price — the institutional trader's reference line",
    category: "Intraday",
    difficulty: "Intermediate",
    duration: "5 min",
    icon: "📐",
    isPro: false,
    instrument: "NIFTY 50",
    timeframe: "5-minute chart",
    dataSource: "Historical simulation — October 2024",
    disclaimer: "Educational simulation using historical data. Not investment advice.",
    candles: GAP_CANDLES,
    steps: [
      {
        id: 1,
        title: "What VWAP Is and Why It Matters",
        narration: "VWAP — Volume Weighted Average Price — is the average price at which all trades have occurred during the day, weighted by volume. It is NOT just a simple average. A trade of 10,000 shares at 22,100 counts 10,000 times more than a trade of 1 share at 22,150. VWAP is the single most important reference level for institutional traders. Why? Because large institutions measure their execution quality against VWAP. If they bought below VWAP, they did well. If above, they overpaid.",
        action: "Drawing VWAP line on intraday chart",
        rule: "Rule 1: Price above VWAP = bullish bias for the day. Price below VWAP = bearish bias.",
        chartAction: "draw_ma",
      },
      {
        id: 2,
        title: "The VWAP Pullback Entry",
        narration: "The highest-probability VWAP trade is this: price is above VWAP, showing bullish bias. Price then pulls back TO the VWAP line. At VWAP, institutional buyers who want to buy below their benchmark price step in. Price bounces. We ride this institutional buying. Today NIFTY opened with a gap up, established bullish trend, pulled back to VWAP at 22,080, and formed a small base. This is our entry zone.",
        action: "Price pulling back to VWAP — marking entry zone",
        rule: "Rule 2: Buy at VWAP only when the overall trend is UP (price was above VWAP before pullback)",
        checkpoint: {
          question: "NIFTY has been BELOW VWAP all morning. Price touches VWAP from below. Is this a buy signal?",
          options: [
            "Yes — price touching VWAP is always a buy",
            "No — price below VWAP all day = bearish. VWAP touch from below is resistance, not support",
            "Yes — VWAP is always support",
            "Only if volume is high",
          ],
          correct: 1,
          explanation: "Correct. VWAP context is everything. If price has been BELOW VWAP, the trend is bearish and VWAP acts as RESISTANCE — not support. Only buy VWAP when price has been ABOVE VWAP (bullish day) and pulls back to it. On bearish days, sell VWAP bounces.",
        },
        pause: true,
      },
      {
        id: 3,
        title: "Entry and Exit Rules",
        narration: "NIFTY pulls back to VWAP at 22,080 from above. A small green candle forms at VWAP — the bounce confirmation. We enter at 22,095. Stop goes below VWAP at 22,055 — if price breaks and closes below VWAP, the bullish thesis is done. Target is the morning high at 22,180, with a secondary target of 22,250. Risk 40 points, reward 85 to 155 points.",
        action: "Entering on VWAP bounce with tight stop below VWAP",
        rule: "Rule 3: Stop goes BELOW VWAP — if price closes a candle below VWAP, exit immediately",
        calculation: "Entry: 22,095 | Stop: 22,055 | Target 1: 22,180 | Target 2: 22,250\nRisk: 40 pts | Reward 1: 85 pts (1:2.1) | Reward 2: 155 pts (1:3.9)\nCapital: ₹5,00,000 | 1% = ₹5,000\nPosition: 5,000 ÷ 40 = 125 units",
        chartAction: "mark_entry",
        chartData: { entry: 22095, stop: 22055 },
      },
      {
        id: 4,
        title: "VWAP Trade Result",
        narration: "After the VWAP bounce, NIFTY rallied to 22,350 — well beyond both targets. First target at 22,180: 50% exit — profit 85 points times 62 units equals 5,270 rupees. Second exit at 22,250 as day closes out: 63 units times 155 points equals 9,765 rupees. Total: 15,035 rupees on 5,000 rupees risk. VWAP strategies work because they align retail traders with institutional flow — the most powerful force in markets.",
        action: "Exiting in two parts as price reaches targets",
        calculation: "Exit 1 (50%) at 22,180: 62 units × 85 pts = ₹5,270\nExit 2 (50%) at 22,250: 63 units × 155 pts = ₹9,765\nTotal: ₹15,035 on ₹5,000 risk | RR: 1:3\n\nVWAP works because:\n• Institutions use it as benchmark\n• Self-fulfilling at key intraday levels\n• Combines price AND volume context",
        chartAction: "mark_exit",
        chartData: { exit: 22250 },
      },
    ],
  },

  // ── SCENARIO 15: SHORT SELLING ──────────────────────────────
  {
    id: "short-selling-basics",
    title: "Short Selling — Profiting from Falling Markets",
    subtitle: "How to sell what you don't own and buy it back cheaper",
    category: "Advanced Strategies",
    difficulty: "Intermediate",
    duration: "5 min",
    icon: "📉",
    isPro: false,
    instrument: "Nifty IT Index (Futures)",
    timeframe: "Daily chart",
    dataSource: "Historical simulation — 2024",
    disclaimer: "Short selling carries unlimited risk potential. Educational only. Not investment advice.",
    candles: BEARISH_CANDLES,
    steps: [
      {
        id: 1,
        title: "What Short Selling Actually Is",
        narration: "Most beginners only know how to profit when markets go UP. Short selling allows you to profit when markets go DOWN. Here is how it works. You borrow shares from your broker. You sell them immediately at today's high price. Later, when the price has fallen, you buy the shares back at the lower price. You return them to the broker and keep the difference as profit. In India, intraday short selling on stocks and short futures are the two main methods.",
        action: "Animated diagram — borrow, sell high, buy low, return",
        rule: "Rule 1: Short selling = sell first, buy later. Profit when price FALLS.",
        calculation: "Short selling example:\nDay 1: Borrow 100 shares. Sell at ₹3,300 each = ₹3,30,000 received\nDay 5: Buy back at ₹3,040 each = ₹3,04,000 paid\nReturn shares to broker\nProfit: ₹3,30,000 − ₹3,04,000 = ₹26,000\nNote: If price RISES instead, you LOSE money — unlimited risk",
      },
      {
        id: 2,
        title: "Identifying a Short Setup",
        narration: "The IT index has broken below a key support zone at 3,270 with expanding volume. This is our signal — a breakdown. Breakdown characteristics: price closes below support, volume is higher than average, and the candle bodies are large red candles showing strong selling. We look for short entries on pullbacks to the broken support level — which now becomes resistance.",
        action: "Marking support breakdown and pullback entry zone",
        rule: "Rule 2: Short breakdowns on retest of broken support — not on the initial breakdown candle",
        highlight: [5, 6, 7],
        chartAction: "highlight_candle",
        checkpoint: {
          question: "Price breaks below support at ₹3,270 aggressively. What is the BEST short entry strategy?",
          options: [
            "Short immediately on the breakdown candle at market price",
            "Wait for price to pull back up and RETEST ₹3,270 from below, then short",
            "Short when price reaches the next support at ₹3,000",
            "Short selling is too risky — avoid it completely",
          ],
          correct: 1,
          explanation: "Wait for the retest. When support breaks, price often pulls back UP to retest that level — which now becomes resistance. This gives a better entry price, clearer stop-loss placement, and better risk-reward. Chasing the initial breakdown gets you in at the worst price.",
        },
        pause: true,
      },
      {
        id: 3,
        title: "Short Entry with Proper Stop Loss",
        narration: "Price pulled back to 3,270 after the breakdown — exactly as expected. Sellers defended this level perfectly, forming a red candle at resistance. We enter SHORT at 3,250 — below the pullback candle's low. Stop goes ABOVE the resistance at 3,310. If price breaks back above 3,310, our bearish thesis is wrong. Target is the next support at 2,960 — a 290-point move.",
        action: "Short entry at retest of broken support, stop above resistance",
        rule: "Rule 3: Short stop goes ABOVE resistance. For long trades, stop goes BELOW support.",
        calculation: "Short Entry: ₹3,250 | Stop: ₹3,310 | Target: ₹2,960\nRisk: 60 pts | Reward: 290 pts | RR: 1:4.8\nCapital: ₹5,00,000 | 1% Risk: ₹5,000\nPosition: 5,000 ÷ 60 = 83 units\nNote: In India, use futures for short positions held overnight",
        chartAction: "mark_entry",
        chartData: { entry: 3250, stop: 3310 },
      },
      {
        id: 4,
        title: "Managing and Closing the Short",
        narration: "The IT index fell from 3,250 to 2,960 over 8 trading days — exactly as our breakdown thesis predicted. We cover — buy back — our short at 2,970. Profit: 83 units times 280 points equals 23,240 rupees on 5,000 rupees risk. Important reminder: Short selling has theoretically unlimited risk if price rises instead of falls. Always use stops. Always use futures rather than intraday short for overnight positions in India.",
        action: "Covering short position at target — P&L calculation",
        calculation: "Short entry: ₹3,250 | Cover at: ₹2,970 | Stop: ₹3,310\nProfit: 83 units × 280 pts = ₹23,240\nRisk: ₹5,000 | RR: 1:4.6\n\nRisk warning for short sellers:\nIf price rises: loss grows without limit\nAlways use stop-loss orders\nNever short without predefined exit level",
        chartAction: "mark_exit",
        chartData: { exit: 2970 },
      },
    ],
  },

  // ── SCENARIO 16: GAP STRATEGY ───────────────────────────────
  {
    id: "gap-up-gap-down-strategy",
    title: "Gap Up / Gap Down Opening Strategy",
    subtitle: "How to read and trade the market opening gap every morning",
    category: "Intraday",
    difficulty: "Beginner",
    duration: "4 min",
    icon: "🌅",
    isPro: false,
    instrument: "NIFTY 50",
    timeframe: "5-minute chart",
    dataSource: "Historical simulation — October 2024",
    disclaimer: "Educational simulation using historical data. Not investment advice.",
    candles: GAP_CANDLES,
    steps: [
      {
        id: 1,
        title: "Why Gaps Happen",
        narration: "A gap occurs when today's opening price is significantly different from yesterday's closing price. Gap-up: today opens higher than yesterday's close. Gap-down: today opens lower. Gaps happen because news, earnings, global markets, or RBI decisions create overnight price discovery. NIFTY closed yesterday at 21,920. Today it opened at 22,080 — a 160-point gap up — due to positive US market overnight.",
        action: "Showing gap-up opening — yesterday close vs today open",
        rule: "Rule 1: Gaps above 0.5% are tradeable. Gaps below 0.3% often fill quickly and are noise.",
        calculation: "Yesterday close: 21,920\nToday open: 22,080\nGap size: 160 points = 0.73% ✅ (Tradeable gap)\nGap type: Gap-Up (bullish overnight sentiment)\nSGX Nifty pre-market: Showed 22,060 — gap was expected",
      },
      {
        id: 2,
        title: "Gap Fill vs Gap and Go",
        narration: "Every gap trader must know two scenarios. Gap Fill: price reverses after opening and goes back to fill the gap — closing the space between yesterday's close and today's open. Gap and Go: price continues in the direction of the gap — the gap was caused by a fundamental shift and price keeps moving. Statistically, about 70% of gaps fill within 3 trading days. Today we determine which scenario by watching the first 15 minutes.",
        action: "Demonstrating gap fill vs gap and go with two scenario arrows",
        rule: "Rule 2: Watch the first 15-minute candle direction to determine gap fill or gap and go",
        checkpoint: {
          question: "NIFTY gaps up 200 points. In the first 15 minutes, it falls 80 points from the gap-up open and forms a red candle. What scenario is likely playing out?",
          options: [
            "Gap and Go — still bullish, buy the dip",
            "Gap Fill — price wants to return to yesterday's close",
            "Normal trading — 200 points means nothing",
            "Cannot tell from only 15 minutes of data",
          ],
          correct: 1,
          explanation: "A large red candle in the first 15 minutes after a gap-up is a strong gap-fill signal. Sellers stepped in immediately at the higher prices — indicating the gap-up was overdone. Gap-fill strategy: wait for a retest of the previous day's high (first resistance), then short toward the gap fill target near yesterday's close.",
        },
        pause: true,
      },
      {
        id: 3,
        title: "The Gap and Go Trade",
        narration: "Today's gap-up held. The first 15-minute candle was green and strong, closing at 22,120 — above the opening gap. After a brief consolidation between 9:30 and 9:45, price resumed upward. This is Gap and Go. Entry: buy when price breaks above the 15-minute opening high at 22,140. Stop: below the opening candle low at 22,060 — if price returns to fill the gap, our thesis is wrong.",
        action: "Entry on Gap and Go breakout above first 15-min high",
        rule: "Rule 3: Gap and Go entry = break of first 15-minute candle high. Stop = first 15-minute candle low.",
        calculation: "First 15-min candle: Open 22,080 | High 22,140 | Low 22,060 | Close 22,120\nEntry (above high): 22,145\nStop (below low): 22,055\nTarget: Yesterday's high + Gap size = 21,940 + 160 = 22,100... \nActually: Next round resistance = 22,350\nRisk: 90 pts | Reward: 205 pts | RR: 1:2.3",
        chartAction: "mark_entry",
        chartData: { entry: 22145, stop: 22055 },
      },
      {
        id: 4,
        title: "Gap Trade Complete",
        narration: "NIFTY continued the Gap and Go move reaching 22,350. Exit at target. Profit: approximately 205 points times position size. The key takeaway: gaps are daily opportunities but require careful reading of the first 15 minutes. Never trade before the first 15-minute candle closes. Never chase a gap open blindly. Always identify: is this gap filling or going?",
        action: "Exit at resistance target — Gap and Go complete",
        calculation: "Entry: 22,145 | Exit: 22,350 | Stop: 22,055\nProfit: 205 pts | Risk: 90 pts | RR: 1:2.3\n\nGap Strategy Summary:\n• Gap > 0.5%: Watch first 15 min\n• First 15 min green + gap holds = Gap and Go\n• First 15 min red + gap struggles = Gap Fill\n• Never trade the first 5 minutes",
        chartAction: "mark_exit",
        chartData: { exit: 22350 },
      },
    ],
  },

  // ── SCENARIO 17: F&O EXPIRY DAY ─────────────────────────────
  {
    id: "fo-expiry-day-strategy",
    title: "F&O Expiry Day — Theta Decay in Action",
    subtitle: "What really happens on Thursday and how to navigate it safely",
    category: "Derivatives",
    difficulty: "Advanced",
    duration: "6 min",
    icon: "⏱️",
    isPro: true,
    instrument: "NIFTY Options — Weekly Expiry",
    timeframe: "5-minute chart",
    dataSource: "Historical simulation — October 2024",
    disclaimer: "F&O trading involves significant risk. 89% of individual F&O traders lose money (SEBI 2023). Educational only.",
    candles: EXPIRY_CANDLES,
    steps: [
      {
        id: 1,
        title: "Why Expiry Day is Different",
        narration: "Every Thursday — weekly NIFTY option expiry — is the most dangerous and most opportunity-rich trading day of the week. Why? Because options expiring today lose ALL their time value by 3:30 PM. Theta decay, which normally erodes 10-20 rupees per day, accelerates exponentially. An option worth 100 rupees on Monday morning may be worth 8 rupees by Thursday afternoon — even if NIFTY barely moved. The money doesn't disappear — it transfers from option BUYERS to option SELLERS.",
        action: "Theta decay visualization — Monday to Thursday",
        rule: "Rule 1: On expiry day, option sellers have maximum advantage. Option buyers face maximum time pressure.",
        calculation: "NIFTY 22,200 CE — weekly option\nMonday: ₹85 premium\nTuesday: ₹62 premium\nWednesday: ₹38 premium\nThursday 9:15 AM: ₹22 premium\nThursday 12:00 PM: ₹8 premium\nThursday 3:20 PM: ₹1-2 premium (if OTM)\n\nAll premium = pure theta decay if NIFTY stays near 22,200",
      },
      {
        id: 2,
        title: "The Pin Risk — How Expiry Works",
        narration: "NIFTY is trading at 22,200. The 22,200 strike is At-the-Money. As expiry approaches, massive open interest at the 22,200 strike creates what traders call Pin Risk — large option sellers have an incentive to keep NIFTY near 22,200. Above 22,200, calls explode in value — sellers lose. Below 22,200, puts explode — sellers lose. Between them, sellers win. This creates characteristic expiry day behavior: price pinned near round numbers until the last hour.",
        action: "Options chain showing max pain at strike 22,200",
        rule: "Rule 2: On expiry day, NIFTY often gravitates toward Max Pain — the strike with maximum combined option seller profit.",
        calculation: "Max Pain Calculation (simplified):\n22,000 strike: ₹1,84,000 crore open interest\n22,100 strike: ₹2,12,000 crore open interest\n22,200 strike: ₹2,86,000 crore open interest ← Max Pain\n22,300 strike: ₹1,94,000 crore open interest\n22,400 strike: ₹1,52,000 crore open interest\n\nNIFTY gravitates toward 22,200 = Max Pain",
        checkpoint: {
          question: "On expiry morning, NIFTY is at 22,200. You buy a 22,200 CE for ₹22. By 12 PM NIFTY is STILL at 22,200. What happened to your option premium?",
          options: [
            "Still ₹22 — NIFTY didn't move so nothing changed",
            "Rose to ₹30 — more buyers came in",
            "Fell to ₹8 — theta decay accelerated",
            "Expired worthless at ₹0",
          ],
          correct: 2,
          explanation: "Theta decay on expiry day is brutal. Even with NIFTY completely flat, your ₹22 option lost ₹14 in 3 hours purely from time passing. By 3 PM it may be ₹2. This is why buying options on expiry day is extremely high-risk — you need a large, fast move to overcome theta.",
        },
        pause: true,
      },
      {
        id: 3,
        title: "The Safe Approach — Selling Options",
        narration: "On expiry day, the edge lies with OPTION SELLERS, not buyers. We sell an Iron Condor: sell NIFTY 22,100 Put and sell NIFTY 22,300 Call — both expiring today. We collect the premium from both sides. Maximum profit if NIFTY stays between 22,100 and 22,300 — which is where Max Pain suggests. To protect ourselves, we buy a 22,050 Put and a 22,350 Call. This caps our maximum loss.",
        action: "Setting up Iron Condor — selling both sides around current price",
        rule: "Rule 3: On expiry day, selling options near current price is higher probability than buying",
        calculation: "Iron Condor Setup at 10 AM (NIFTY at 22,200):\nSell 22,300 CE at ₹12 | Buy 22,350 CE at ₹6\nSell 22,100 PE at ₹14 | Buy 22,050 PE at ₹8\nNet Premium Collected: (12-6) + (14-8) = ₹12 per unit\n1 lot (50 units) = ₹600 collected\nMax Loss if NIFTY breaches 22,350 or 22,050: ₹1,900\nRisk-Reward: Collect ₹600 to risk ₹1,900 = 31% probability breakeven",
      },
      {
        id: 4,
        title: "Expiry Day Final Hour",
        narration: "Between 2:30 and 3:30 PM is the final hour — most volatile and dangerous. By 2:30 PM our Iron Condor is showing maximum profit with NIFTY at 22,160 — between our strikes. However, large institutions start hedging positions which can cause big last-hour moves. We close our Iron Condor at 2:30 PM — before the final hour chaos. Buy back both sold options for a combined ₹3. Profit: 12 minus 3 equals 9 rupees per unit, times 50 equals 450 rupees.",
        action: "Closing Iron Condor 1 hour before expiry",
        rule: "Rule 4: ALWAYS close expiry day positions by 2:30 PM — never hold into the final chaotic 60 minutes",
        calculation: "Iron Condor Exit at 2:30 PM:\nBuy back 22,300 CE for ₹1\nBuy back 22,100 PE for ₹2\nTotal cost to close: ₹3\nNet profit: ₹12 collected − ₹3 paid = ₹9 per unit\nTotal: 50 units × ₹9 = ₹450 profit\nMax risk was ₹1,900 — risked ₹1,900 to make ₹450\nNote: Works ~70% of weeks when NIFTY stays rangebound",
      },
    ],
  },

  // ── SCENARIO 18: STOP-LOSS HUNT ─────────────────────────────
  {
    id: "stop-loss-hunt-operator-trap",
    title: "Stop-Loss Hunt — The Operator Trap",
    subtitle: "How large players hunt your stop-loss and how to protect yourself",
    category: "Market Mechanics",
    difficulty: "Intermediate",
    duration: "4 min",
    icon: "🪤",
    isPro: false,
    instrument: "Mid-cap Stock",
    timeframe: "5-minute chart",
    dataSource: "Historical simulation — educational demonstration",
    disclaimer: "Educational simulation. Trading involves significant risk. Not investment advice.",
    candles: CANDLESTICK_CANDLES,
    steps: [
      {
        id: 1,
        title: "What is a Stop-Loss Hunt?",
        narration: "Large market participants — institutions, operators, market makers — can see clusters of stop-loss orders in the market through Level 2 data and order flow. They know that most retail traders place stop-losses just below obvious support levels or round numbers. So they push price briefly below those levels — triggering thousands of stop-loss orders which creates a cascade of selling — then immediately reverse and buy all those shares at the now-lower price. Retail traders get stopped out. Operators buy the dip.",
        action: "Animated diagram showing operator stop-loss hunt mechanics",
        rule: "Core Rule: Stop-losses at obvious levels are EASILY targeted. Give your stops breathing room.",
      },
      {
        id: 2,
        title: "Recognizing a Stop Hunt in Real Time",
        narration: "Look at candle 7 on the chart. Price breaks below the obvious support at 552 — exactly where most retail traders placed stops. Notice: the candle WICK goes below 552 but the CLOSE comes back above it. Volume spikes during this wick move. Then price immediately reverses and rallies strongly. This is the classic stop-hunt signature: fast spike below support on high volume, immediate reversal, strong rally. Retail: stopped out at the bottom. Operators: loaded up.",
        action: "Highlighting stop-hunt candle — wick below support, closes above",
        highlight: [5, 6],
        chartAction: "highlight_candle",
        checkpoint: {
          question: "You placed a stop at ₹548 below support at ₹552. Price spikes to ₹542, triggers your stop, then immediately reverses to ₹580. How do you trade this NEXT time?",
          options: [
            "Move stop even tighter to ₹550 to reduce loss",
            "Give stop more room — place at ₹535 below the likely hunt zone",
            "Don't use stop-losses — they always get hunted",
            "Place stop at ₹552 exactly at support",
          ],
          correct: 1,
          explanation: "Give your stop breathing room. If the obvious stop level is ₹548, operators know this. Place yours at ₹535 — below the likely hunt zone. Yes, this means a larger loss if genuinely wrong, so reduce position size to compensate. Never remove stops entirely — that leads to catastrophic losses.",
        },
        pause: true,
      },
      {
        id: 3,
        title: "How to Protect Yourself",
        narration: "Three techniques protect against stop hunts. First: use MENTAL stops, not hard stops, when trading stocks — check price manually near your stop level before exiting. Second: give stops 10 to 15% more room than the obvious level. Third: trail stops only after price has moved significantly in your favor — tight stops early are most vulnerable. The goal is to stay in the trade through noise while exiting on genuine trend reversals.",
        action: "Three protection techniques demonstrated on chart",
        rule: "Protection Rule: Stop below obvious level + 10% buffer. Small position size to compensate for wider stop.",
        calculation: "Example:\nObvious support: ₹552\nWhere most place stop: ₹548 (easily hunted)\nSmarter stop: ₹535 (below likely hunt zone)\n\nPosition size adjustment:\nIf risk at ₹548 = ₹4 per share → 25 shares on ₹100 risk\nIf risk at ₹535 = ₹17 per share → 6 shares on ₹100 risk\nSame rupee risk — harder to trigger — better survival",
      },
    ],
  },

  // ── SCENARIO 19: BITCOIN BREAKOUT ───────────────────────────
  {
    id: "crypto-bitcoin-breakout",
    title: "Bitcoin Breakout Trade",
    subtitle: "Technical breakout on Bitcoin — same principles, different asset",
    category: "Crypto",
    difficulty: "Intermediate",
    duration: "4 min",
    icon: "₿",
    isPro: true,
    instrument: "Bitcoin (BTC/USDT)",
    timeframe: "Daily chart",
    dataSource: "Historical simulation — 2024",
    disclaimer: "Crypto is unregulated in India. 30% tax + 1% TDS applies. Educational only. Not investment advice. Crypto is highly volatile.",
    candles: BTC_CANDLES,
    steps: [
      {
        id: 1,
        title: "Bitcoin Technical Analysis — Same Principles",
        narration: "Bitcoin follows the same technical principles as stocks — support, resistance, breakouts, volume confirmation. The main difference: volatility is 5 to 10 times higher than Nifty. A 5% move in Bitcoin is a normal day. A 5% move in Nifty would be extraordinary. This means position sizes must be proportionally smaller. India's crypto tax: 30% on profits plus 1% TDS on every sell transaction. Factor both into every trade.",
        action: "Bitcoin chart analysis — identifying consolidation zone",
        rule: "Rule 1: Crypto uses same technical analysis as stocks — but position sizes must account for 5-10x higher volatility",
        calculation: "India Crypto Tax (2024):\n30% flat tax on ALL crypto gains (no deduction for losses from other assets)\n1% TDS deducted at source on every sell\n\nExample: Buy BTC at ₹55L, sell at ₹60L\nProfit: ₹5L\nTax: ₹1.5L (30%)\nTDS already deducted: ₹60,000 (1% of ₹60L)\nNet after tax: ₹3.5L profit",
      },
      {
        id: 2,
        title: "The Consolidation and Breakout",
        narration: "Bitcoin consolidated between $63,800 and $65,000 for 3 days — candles 7 through 9. This tight range after a rally shows neither buyers nor sellers dominating. It is coiling before a move. On day 10, Bitcoin breaks above $65,000 with volume more than 1.5 times the 20-day average. This is our breakout signal. The consolidation was the spring loading. The breakout is the release.",
        action: "Marking consolidation zone and breakout candle",
        highlight: [6, 7, 8, 9],
        chartAction: "highlight_candle",
        checkpoint: {
          question: "Bitcoin breaks above resistance at $65,000 but volume is LOWER than average. What does this suggest?",
          options: [
            "Strong breakout — price action confirms volume isn't needed",
            "Weak breakout — low volume suggests lack of conviction, high false breakout risk",
            "Volume never matters in crypto",
            "Buy more — low volume breakouts are the best",
          ],
          correct: 1,
          explanation: "Low volume breakouts in any asset — stocks, crypto, or forex — are high false breakout risk. Without volume confirming the move, there aren't enough buyers to sustain the higher price. Price often falls back into the range. Always require volume confirmation on breakouts.",
        },
        pause: true,
      },
      {
        id: 3,
        title: "Entry and Risk Management for Crypto",
        narration: "Bitcoin breaks $65,000 on day 10 with strong volume. We enter at $65,600 — above the breakout candle's high. Stop goes below the consolidation zone low at $63,600 — a $2,000 stop. Crypto position sizing: with capital of $10,000 and 1% risk ($100), maximum quantity is $100 divided by $2,000 equals 0.05 Bitcoin. This seems small but remember: Bitcoin can move 10% in a day — the position size is appropriate for the volatility.",
        action: "Entry above breakout candle with volatility-adjusted position size",
        rule: "Rule 2: Crypto position sizes must be 5-10x SMALLER than stock positions to account for higher volatility",
        calculation: "Entry: $65,600 | Stop: $63,600 | Target: $72,000\nRisk: $2,000 per BTC | Reward: $6,400 per BTC | RR: 1:3.2\nCapital: $10,000 | 1% Risk: $100\nPosition: $100 ÷ $2,000 = 0.05 BTC\n\nIn INR (approx ₹85/dollar):\nEntry: ₹55.76L | Stop: ₹54.06L\nRisk per BTC: ₹1.7L | Position: 0.05 BTC = ₹8,500 risk",
        chartAction: "mark_entry",
        chartData: { entry: 65600, stop: 63600 },
      },
      {
        id: 4,
        title: "Bitcoin Trade Outcome",
        narration: "Bitcoin rallied from $65,600 to $71,200 — well beyond our $72,000 target. Exit at $71,000. Profit: 0.05 BTC times $5,400 equals $270 — or approximately 22,950 rupees before tax. After 30% India crypto tax: net profit approximately 16,065 rupees. Always calculate tax BEFORE celebrating profits. Crypto trading in India requires meticulous record-keeping — every transaction must be reported in ITR.",
        action: "Exiting at target — full post-tax P&L calculation",
        calculation: "Exit: $71,000 | Entry: $65,600 | Stop: $63,600\nGross profit: 0.05 × $5,400 = $270 = ₹22,950\n30% tax: ₹6,885\nNet profit after tax: ₹16,065\n\n1% TDS already deducted at sale\n\nRecord-keeping required:\n• Date of purchase\n• Date of sale\n• Cost of acquisition\n• Sale proceeds\nReport in ITR Schedule VDA",
        chartAction: "mark_exit",
        chartData: { exit: 71000 },
      },
    ],
  },

  // ── SCENARIO 20: TRADE JOURNAL REVIEW ───────────────────────
  {
    id: "trade-journal-review",
    title: "Trade Journal Review — Post-Trade Analysis",
    subtitle: "How professional traders review, learn, and improve — the missing skill",
    category: "Psychology",
    difficulty: "Beginner",
    duration: "4 min",
    icon: "📔",
    isPro: false,
    instrument: "Portfolio Review",
    timeframe: "Weekly review",
    dataSource: "Demonstration — fictional weekly trade log",
    disclaimer: "Educational demonstration. Not investment advice.",
    candles: CANDLESTICK_CANDLES,
    steps: [
      {
        id: 1,
        title: "Why 99% of Traders Skip This Step",
        narration: "The trade journal is the single most powerful tool for improvement — and the most consistently ignored. After a winning trade, traders feel confident and don't bother reviewing. After a losing trade, traders feel bad and don't want to revisit it. Both reactions are wrong. A winning trade with poor process is dangerous — you got lucky. A losing trade with correct process is fine — you followed your rules. The journal reveals the truth.",
        action: "Opening weekly trade journal — 8 trades this week",
        rule: "Core Principle: You do not learn from outcomes. You learn from reviewing PROCESS quality.",
        calculation: "This Week's Raw P&L:\nTrade 1: +₹4,200 | Trade 2: -₹2,100 | Trade 3: +₹1,800\nTrade 4: -₹3,400 | Trade 5: +₹6,100 | Trade 6: +₹800\nTrade 7: -₹1,200 | Trade 8: +₹2,900\nNet Week: +₹9,100\n\nBut P&L is only half the story...",
      },
      {
        id: 2,
        title: "Grading Each Trade on Process",
        narration: "We grade each trade on 5 criteria — not on profit or loss. Criteria: Was the setup valid? Was position size correct? Was stop placed before entry? Was entry at the planned level? Was exit at the planned level? A trade that made money but violated 3 rules is an F-grade trade. A trade that lost money but followed all 5 rules perfectly is an A-grade trade. Over time, A-grade process produces A-grade results.",
        action: "Grading all 8 trades on 5-criteria scorecard",
        rule: "Rule 1: Grade every trade on PROCESS (1-5 score), not on outcome (profit/loss)",
        calculation: "Process Grades This Week:\nTrade 1: 5/5 ✅ Won ₹4,200 (A)\nTrade 2: 4/5 ✅ Lost ₹2,100 (B) — missed perfect entry\nTrade 3: 5/5 ✅ Won ₹1,800 (A)\nTrade 4: 2/5 ❌ Lost ₹3,400 (F) — NO SETUP, revenge trade\nTrade 5: 5/5 ✅ Won ₹6,100 (A)\nTrade 6: 1/5 ❌ Won ₹800 (F) — random trade, got lucky\nTrade 7: 5/5 ✅ Lost ₹1,200 (A) — good process, stopped out\nTrade 8: 4/5 ✅ Won ₹2,900 (B)\n\nA/B trades: +₹13,000 | F trades: -₹2,600\nConclusion: F trades cost you money even this week",
        checkpoint: {
          question: "Trade 6 made ₹800 profit but had 1/5 process score. Trade 7 lost ₹1,200 but had 5/5 process score. Which trade do you learn from positively?",
          options: [
            "Trade 6 — it made money, so the approach works",
            "Trade 7 — correct process is what matters, the loss was acceptable",
            "Both equally — money and process both matter",
            "Neither — focus on the big winners only",
          ],
          correct: 1,
          explanation: "Trade 7 is the one to replicate — perfect process, unlucky loss. If you repeat this process 100 times, the probabilities will work in your favor. Trade 6 was lucky. If you repeat a 1/5 process trade 100 times, you will lose money overall. Process quality predicts long-term results. Outcome quality is random noise.",
        },
        pause: true,
      },
      {
        id: 3,
        title: "Patterns That Reveal Your Edge",
        narration: "After 3 months of journaling, patterns emerge that are impossible to see trade by trade. Which setups have the highest win rate? What time of day are your worst trades? Do you trade worse after a loss? What is your average risk-reward actually achieved versus planned? This data is your personal edge — or your personal leak. Without the journal, you are flying blind. With it, you become a systematic, improving trader.",
        action: "90-day pattern analysis dashboard",
        rule: "Rule 2: Keep the journal for 90 days before drawing any conclusions. One week is noise.",
        calculation: "90-Day Journal Insights (example):\nBest setup: RSI Divergence — 68% win rate\nWorst time: 9:15–9:30 AM — 28% win rate (stop trading here!)\nWorst trigger: After 2 consecutive losses — win rate drops to 31%\nAvg planned RR: 1:2 | Avg actual RR: 1:1.4 (exiting early!)\nBiggest improvement needed: Hold winners longer\n\nAction items:\n1. No trades in first 15 minutes\n2. Mandatory 30-min break after 2 consecutive losses\n3. Never exit at less than 1:1.5 RR",
      },
      {
        id: 4,
        title: "Your Trading Journal Template",
        narration: "This is the exact template to use for every trade. Date, instrument, setup name, entry price, stop price, target price, actual exit, outcome, and most importantly — the five process criteria scores and written notes on what you observed, felt, and learned. The notes section is where real learning happens. Write: what did you see, what did you feel, and would you take this trade again? Over time, these notes become your personal trading playbook — worth more than any course.",
        action: "Complete trade journal template displayed",
        rule: "Final Rule: The journal is your most valuable trading tool. Fill it in within 30 minutes of every trade close.",
        calculation: "Trade Journal Template:\nDate: _________ | Time: _________\nInstrument: ___________ | Setup: ___________\nEntry: ₹_____ | Stop: ₹_____ | Target: ₹_____\nActual Exit: ₹_____ | P&L: ₹_____\n\nProcess Score (1-5):\nSetup valid?      □1 □2 □3 □4 □5\nSize correct?     □1 □2 □3 □4 □5\nStop before entry?□1 □2 □3 □4 □5\nEntry at plan?    □1 □2 □3 □4 □5\nExit at plan?     □1 □2 □3 □4 □5\nTotal: __/25\n\nNotes: What I saw / felt / learned:\n_________________________________",
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
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [userProgress, setUserProgress] = useState<Record<string, { is_completed: boolean; completed_steps: number; checkpoints_passed: number }>>({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedScenarioData, setCompletedScenarioData] = useState<{ id: string; title: string; xp: number } | null>(null);

  // Load progress from localStorage and API on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem("fh_trading_theater_progress");
      if (cached) {
        setUserProgress(JSON.parse(cached));
      }
    } catch {}

    fetch("/api/trading-theater/progress")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.progress)) {
          const map: Record<string, { is_completed: boolean; completed_steps: number; checkpoints_passed: number }> = {};
          res.progress.forEach((p: any) => {
            const slug = p.trading_scenarios?.slug || p.scenario_id;
            map[slug] = {
              is_completed: Boolean(p.is_completed),
              completed_steps: p.steps_completed ?? p.completed_steps ?? 0,
              checkpoints_passed: p.checkpoints_correct ?? p.checkpoints_passed ?? 0,
            };
          });
          setUserProgress((prev) => {
            const merged = { ...prev, ...map };
            try {
              localStorage.setItem("fh_trading_theater_progress", JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  const completedCount = useMemo(() => {
    return Object.values(userProgress).filter((p) => p?.is_completed).length;
  }, [userProgress]);

  // Persist progress helper
  const saveProgress = useCallback(
    async (
      scenarioId: string,
      stepIdx: number,
      totalSteps: number,
      checkpointsPassed: number,
      checkpointsTotal: number,
      isCompleted: boolean,
      quizAnswers?: Record<string, number>
    ) => {
      setUserProgress((prev) => {
        const current = prev[scenarioId] || { is_completed: false, completed_steps: 0, checkpoints_passed: 0 };
        const updated = {
          is_completed: current.is_completed || isCompleted,
          completed_steps: Math.max(current.completed_steps, stepIdx + 1),
          checkpoints_passed: Math.max(current.checkpoints_passed, checkpointsPassed),
        };
        const nextMap = { ...prev, [scenarioId]: updated };
        try {
          localStorage.setItem("fh_trading_theater_progress", JSON.stringify(nextMap));
        } catch {}
        return nextMap;
      });

      try {
        await fetch("/api/trading-theater/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenario_id: scenarioId,
            scenarioId,
            steps_completed: stepIdx + 1,
            completedSteps: stepIdx + 1,
            checkpoints_correct: checkpointsPassed,
            checkpointsPassed,
            checkpoints_total: checkpointsTotal,
            checkpointsTotal,
            is_completed: isCompleted,
            isCompleted,
            score_pct: 100,
            lastStepIndex: stepIdx,
            quizAnswers,
          }),
        });
      } catch {}
    },
    []
  );

  const finishScenario = useCallback(
    (scenario: Scenario) => {
      saveProgress(scenario.id, scenario.steps.length, scenario.steps.length, 1, 1, true);
      const hiTitle = HINDI_TRANSLATIONS[scenario.id]?.titleHi;
      setCompletedScenarioData({
        id: scenario.id,
        title: lang === "hi" && hiTitle ? hiTitle : scenario.title,
        xp: 40,
      });
      setShowCelebration(true);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsNarrating(false);
    },
    [lang, saveProgress]
  );

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
    (textEn: string, textHi?: string) => {
      if (!voiceEnabled || typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const text = lang === "hi" && textHi ? textHi : textEn;
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = lang === "hi" ? 0.90 : 0.92;
      utt.pitch = 1.0;
      utt.volume = 0.95;

      const voices = window.speechSynthesis.getVoices();
      if (lang === "hi") {
        utt.lang = "hi-IN";
        const hiVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().startsWith("hi") ||
            v.name.toLowerCase().includes("hindi") ||
            v.name.includes("Lekha") ||
            v.name.includes("Kalpana") ||
            v.name.includes("Google हिन्दी")
        );
        if (hiVoice) utt.voice = hiVoice;
      } else {
        const preferred = voices.find(
          (v) =>
            v.name.includes("Google") ||
            v.name.includes("Daniel") ||
            v.name.includes("Samantha") ||
            v.name.includes("Natural") ||
            v.lang.startsWith("en")
        );
        if (preferred) utt.voice = preferred;
      }

      utt.onstart = () => setIsNarrating(true);
      utt.onend = () => setIsNarrating(false);
      utt.onerror = () => setIsNarrating(false);
      speechRef.current = utt;
      window.speechSynthesis.speak(utt);
    },
    [voiceEnabled, lang]
  );

  // ── Handle step progression ──────────────────────────────────
  const playStep = useCallback(
    (scenario: Scenario, stepIdx: number) => {
      const step = scenario.steps[stepIdx];
      if (!step) return;

      setCurrentStep(stepIdx);
      setProgress(((stepIdx + 1) / scenario.steps.length) * 100);

      if (step.chartAction) {
        setOverlays((prev) => Array.from(new Set([...prev, step.chartAction!])));
      }

      const hiData = HINDI_TRANSLATIONS[scenario.id]?.steps[step.id];
      narrate(step.narration, hiData?.narrationHi);

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
      finishScenario(activeScenario);
    }
  };

  const handleCheckpoint = (optionIdx: number) => {
    setCheckpoint((prev) => ({ ...prev, answered: true, selected: optionIdx }));
    const step = activeScenario?.steps[currentStep];
    if (step?.checkpoint) {
      const isCorrect = optionIdx === step.checkpoint.correct;
      const hiData = activeScenario ? HINDI_TRANSLATIONS[activeScenario.id]?.steps[step.id] : null;

      if (lang === "hi") {
        const expl = hiData?.checkpoint?.explanationHi || step.checkpoint.explanation;
        narrate(isCorrect ? "बिल्कुल सही! " + expl : "सही नहीं है। " + expl);
      } else {
        narrate(
          isCorrect
            ? "Correct! " + step.checkpoint.explanation
            : "Not quite. " + step.checkpoint.explanation
        );
      }

      if (activeScenario) {
        saveProgress(
          activeScenario.id,
          currentStep,
          activeScenario.steps.length,
          isCorrect ? 1 : 0,
          1,
          false,
          { [step.id]: optionIdx }
        );
      }
    }
  };

  const stopNarration = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsNarrating(false);
  };

  const currentStepData = activeScenario?.steps[currentStep];

  const ALL_CATEGORIES = useMemo(() => {
    return ["All", ...Array.from(new Set(SCENARIOS.map((s) => s.category)))];
  }, []);

  const filteredScenarios = useMemo(() => {
    if (selectedCategory === "All") return SCENARIOS;
    return SCENARIOS.filter((s) => s.category.toLowerCase() === selectedCategory.toLowerCase() || s.category.toLowerCase().includes(selectedCategory.toLowerCase()));
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
            {lang === "hi" ? "संस्थागत ट्रेडिंग रणनीतियाँ — लाइव सिमुलेशन" : "Watch Institutional Trades Unfold — Live"}
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "4px 0 0" }}>
            {lang === "hi"
              ? "रीयल-टाइम कैंडलस्टिक एनिमेशन, एआई वॉइस कमेंटरी और इंटरैक्टिव निर्णय चेकपॉइंट्स · ऐतिहासिक डेटा"
              : "Real-time candlestick animations, voice-narrated rules, and decision checkpoints · Historical Data"}
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* Language Switcher Toggle */}
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.06)",
              borderRadius: 10,
              padding: 3,
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <button
              onClick={() => setLang("en")}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                border: "none",
                background: lang === "en" ? "linear-gradient(135deg, #0E6163, #1D9E75)" : "transparent",
                color: lang === "en" ? "#fff" : "rgba(255,255,255,0.5)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              🇬🇧 EN
            </button>
            <button
              onClick={() => setLang("hi")}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                border: "none",
                background: lang === "hi" ? "linear-gradient(135deg, #FF9933, #138808)" : "transparent",
                color: lang === "hi" ? "#fff" : "rgba(255,255,255,0.5)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              🇮🇳 हिंदी
            </button>
          </div>

          {/* Progress Counter Pill */}
          <div
            style={{
              padding: "6px 14px",
              borderRadius: 10,
              background: "rgba(0,255,136,0.08)",
              border: "1px solid rgba(0,255,136,0.25)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 13, color: "#00FF88", fontWeight: 800 }}>⚡ {completedCount} / {SCENARIOS.length}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
              {lang === "hi" ? "मास्टर्ड" : "Mastered"}
            </span>
          </div>

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
            {voiceEnabled ? (lang === "hi" ? "🔊 वॉइस चालू" : "🔊 Voice ON") : (lang === "hi" ? "🔇 वॉइस बंद" : "🔇 Voice OFF")}
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
                Select from {SCENARIOS.length} master real-market scenarios to start your animated breakdown
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {ALL_CATEGORIES.map((cat) => (
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

                {userProgress[scenario.id]?.is_completed && (
                  <div
                    style={{
                      position: "absolute",
                      top: 14,
                      left: 14,
                      padding: "3px 10px",
                      borderRadius: 20,
                      background: "rgba(0,255,136,0.15)",
                      border: "1px solid rgba(0,255,136,0.4)",
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#00FF88",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    ✓ {lang === "hi" ? "मास्टर्ड" : "MASTERED"}
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
                      {lang === "hi" && HINDI_TRANSLATIONS[scenario.id]?.titleHi
                        ? HINDI_TRANSLATIONS[scenario.id].titleHi
                        : scenario.title}
                    </h3>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.4 }}>
                      {lang === "hi" && HINDI_TRANSLATIONS[scenario.id]?.subtitleHi
                        ? HINDI_TRANSLATIONS[scenario.id].subtitleHi
                        : scenario.subtitle}
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
                    {lang === "hi" && HINDI_TRANSLATIONS[scenario.id]?.categoryHi
                      ? HINDI_TRANSLATIONS[scenario.id].categoryHi
                      : scenario.category}
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
                  <span style={{ fontSize: 16 }}>▶</span> {lang === "hi" ? "सिमुलेशन शुरू करें" : "Launch Theater Walkthrough"}
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
                {(lang === "hi" && HINDI_TRANSLATIONS[activeScenario.id]?.categoryHi) ? HINDI_TRANSLATIONS[activeScenario.id].categoryHi : activeScenario.category} · {activeScenario.difficulty}
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>
                {(lang === "hi" && HINDI_TRANSLATIONS[activeScenario.id]?.titleHi) ? HINDI_TRANSLATIONS[activeScenario.id].titleHi : activeScenario.title}
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
                      {(() => {
                        const hiStep = activeScenario ? HINDI_TRANSLATIONS[activeScenario.id]?.steps[currentStepData.id] : null;
                        return (lang === "hi" && hiStep?.titleHi) ? hiStep.titleHi : currentStepData.title;
                      })()}
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
                    🎬 {(() => {
                      const hiStep = activeScenario ? HINDI_TRANSLATIONS[activeScenario.id]?.steps[currentStepData.id] : null;
                      return (lang === "hi" && hiStep?.actionHi) ? hiStep.actionHi : currentStepData.action;
                    })()}
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
                    {(() => {
                      const hiStep = activeScenario ? HINDI_TRANSLATIONS[activeScenario.id]?.steps[currentStepData.id] : null;
                      return (lang === "hi" && hiStep?.narrationHi) ? hiStep.narrationHi : currentStepData.narration;
                    })()}
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
                        {(() => {
                        const hiStep = activeScenario ? HINDI_TRANSLATIONS[activeScenario.id]?.steps[currentStepData.id] : null;
                        return (lang === "hi" && hiStep?.ruleHi) ? hiStep.ruleHi : currentStepData.rule;
                      })()}
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
                          {(() => {
                            const hiStep = activeScenario ? HINDI_TRANSLATIONS[activeScenario.id]?.steps[currentStepData.id] : null;
                            return (lang === "hi" && hiStep?.checkpoint?.questionHi) ? hiStep.checkpoint.questionHi : currentStepData.checkpoint.question;
                          })()}
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
                                {(() => {
                                  const hiStep = activeScenario ? HINDI_TRANSLATIONS[activeScenario.id]?.steps[currentStepData.id] : null;
                                  return (lang === "hi" && hiStep?.checkpoint?.optionsHi && hiStep.checkpoint.optionsHi[i]) ? hiStep.checkpoint.optionsHi[i] : opt;
                                })()}
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
                            {(() => {
                              const hiStep = activeScenario ? HINDI_TRANSLATIONS[activeScenario.id]?.steps[currentStepData.id] : null;
                              return (lang === "hi" && hiStep?.checkpoint?.explanationHi) ? hiStep.checkpoint.explanationHi : currentStepData.checkpoint.explanation;
                            })()}
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
                      {(() => {
                        const sHi = HINDI_TRANSLATIONS[activeScenario.id]?.steps[s.id];
                        return (lang === "hi" && sHi?.titleHi) ? sHi.titleHi : s.title;
                      })()}
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
                  onClick={() => {
                    if (currentStepData && activeScenario) {
                      const hiStep = HINDI_TRANSLATIONS[activeScenario.id]?.steps[currentStepData.id];
                      narrate(currentStepData.narration, hiStep?.narrationHi);
                    }
                  }}
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
                  {lang === "hi" ? "अगला चरण →" : "Next Step →"}
                </button>
              ) : (
                <button
                  onClick={() => activeScenario && finishScenario(activeScenario)}
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
                  {lang === "hi" ? "✅ पूरा हुआ — अगली रणनीति" : "✅ Complete — Explore Next"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    
      {/* ── CELEBRATION MODAL ──────────────────────────────────── */}
      {showCelebration && completedScenarioData && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "linear-gradient(145deg, #0D1626, #070B14)",
              border: "1px solid rgba(0,255,136,0.4)",
              borderRadius: 20,
              padding: 36,
              maxWidth: 500,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 25px 50px -12px rgba(0,255,136,0.25)",
            }}
          >
            <div style={{ fontSize: 54, marginBottom: 12 }}>🏆</div>
            <div
              style={{
                display: "inline-block",
                padding: "4px 14px",
                borderRadius: 20,
                background: "rgba(0,255,136,0.15)",
                border: "1px solid rgba(0,255,136,0.4)",
                color: "#00FF88",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.1em",
                marginBottom: 14,
              }}
            >
              {lang === "hi" ? "रणनीति पूरी हुई" : "SCENARIO MASTERED"}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>
              {completedScenarioData.title}
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 20 }}>
              {lang === "hi"
                ? "आपने इस रणनीति के सभी इंटरैक्टिव स्टेप्स और चेकपॉइंट सफलतापूर्वक पूरे कर लिए हैं!"
                : "You have successfully completed all animated steps and decision checkpoints for this scenario!"}
            </p>

            <div
              style={{
                background: "rgba(0,255,136,0.06)",
                border: "1px solid rgba(0,255,136,0.2)",
                borderRadius: 14,
                padding: "16px",
                display: "flex",
                justifyContent: "space-around",
                marginBottom: 24,
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>
                  {lang === "hi" ? "अर्जित XP" : "XP EARNED"}
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#00FF88" }}>
                  +{completedScenarioData.xp} XP
                </div>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
              <div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>
                  {lang === "hi" ? "कुल पूर्ण" : "TOTAL COMPLETED"}
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#00BFFF" }}>
                  {completedCount} / {SCENARIOS.length}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => {
                  setShowCelebration(false);
                  setActiveScenario(null);
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 10,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {lang === "hi" ? "कैटलॉग पर लौटें" : "Academy Catalog"}
              </button>
              <button
                onClick={() => {
                  setShowCelebration(false);
                  const currentIdx = SCENARIOS.findIndex((s) => s.id === completedScenarioData.id);
                  const nextScenario = SCENARIOS[(currentIdx + 1) % SCENARIOS.length];
                  startScenario(nextScenario);
                }}
                className="glow-green"
                style={{
                  flex: 1.3,
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
                {lang === "hi" ? "अगली रणनीति →" : "Next Scenario →"}
              </button>
            </div>
          </div>
        </div>
      )}
</div>
  );
}
