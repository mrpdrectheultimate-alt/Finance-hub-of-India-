# FinanceHub — Complete SQL Run Order
# All 27 SQL files in exact, bulletproof sequence
# Copy-paste each file into the Supabase SQL Editor in sequence.

## STEP 0 — Reality Audit (Run first to inspect baseline database state)
```
00_phase0_reality_audit.sql             — 20 audit queries, get baseline entity counts
```

## STEP 1 — Core Schema & Security Policies (Run once, 100% idempotent)
```
01_supabase_schema_safe.sql             — Base tables (profiles, tracks, levels, lessons, user_progress, quizzes, etc.)
02_phase1_critical_fixes.sql            — RLS policies, performance indexes, calculate_user_level helper functions
```

## STEP 2 — Core Content Track Seeds (105+ Base Lessons)
```
03_trading_markets_101.sql              — Trading & Markets 101 track (15 lessons)
04_crypto_basics.sql                    — Crypto & DeFi Basics track (15 lessons)
05_corporate_business_basics.sql        — Corporate Finance Basics track (15 lessons)
06_behavioral_finance.sql               — Behavioral Finance track (15 lessons)
07_forex_basics.sql                     — Forex & Currency Trading track (15 lessons)
08_technical_analysis.sql               — Technical Analysis track (15 lessons)
09_personal_finance_intermediate.sql    — Personal Finance Intermediate track (15 lessons)
```

## STEP 3 — Learning Engine, Analytics & Video Library
```
10_adaptive_learning_engine.sql         — Spaced repetition (SM-2), topic mastery tracking, review queue
11_analytics_views.sql                  — Admin analytics, user retention views, dashboard reporting queries
12_video_library_complete.sql           — 82 verified YouTube video playlists & structured video metadata
```

## STEP 4 — Lesson Content Expansions (320+ Total Lessons)
```
13_lesson_expansion_phase1.sql          — +57 lessons (115 → 172)
14_lesson_expansion_phase2.sql          — +52 lessons (172 → 224)
15_lesson_expansion_phase2_part2.sql    — Supplementary track lessons batch 2
16_lesson_expansion_phase3.sql          — +50 lessons (224 → 274)
17_lesson_expansion_phase3_part2.sql    — +6 Crypto/DeFi advanced lessons (274 → 280)
```

## STEP 5 — Interactive Quizzes & Assessments
```
18_phase3_quizzes.sql                   — 184+ interactive quiz questions across 50 quizzes
```

## STEP 6 — Digital Notes & Rough Book Engine
```
19_notes_schema.sql                     — Digital notes, note tags, flashcards schema
```

## STEP 7 — System Feature Migrations (Execute in Order)
```
20_phase1_migration.sql                 — AI rate limits, onboarding tracking, search logs, payment logs
21_phase2_migration.sql                 — Knowledge graph (50 concepts), financial glossary (35 terms), SM-2 mastery
22_phase3_migration.sql                 — Case studies (5), net worth snapshots, goal tracking, AI query logs
23_phase4_migration.sql                 — Hindi localized lessons (5→8), content health, DPDP Act consent
24_phase5_migration.sql                 — Community Q&A forum, Admin CMS tables, 14 performance indexes
25_phase6_migration.sql                 — Email sequences (5), weekly leagues system, certificate verification
```

## STEP 8 — World-Class Content Expansions & Final Localizations
```
26_phase7_lessons.sql                   — +20 advanced lessons: PF advanced, Hindi (+3), Trading, Behavioral
27_phase8_lessons.sql                   — +30 final lessons: Forex (+6), TA (+7), Crypto (+5), Corporate (+4), Hindi (+5)
case_studies_expansion.sql              — +20 real-world Indian finance case studies (Total: 25)
phase9_lessons.sql                      — +45 critical lessons: F&O basics, Ratio Analysis, Chart Patterns (Total: 375+)
phase10_cases_hindi.sql                 — +13 case studies + 10 Hindi localized lessons (Total Hindi: 23+)
phase9_10_quizzes.sql                   — +20 quizzes and 200+ interactive questions (Total questions: 380+)
```

---

## CONVENIENT 3-BATCH EXECUTION (RECOMMENDED)
Instead of running individual files, you can run these 3 master bundles in sequence:
1. `sql/batch1_curriculum_expansion.sql` — Lessons, Quizzes, Hindi translations, and Case Studies (Phase 8, 9, 10)
2. `sql/batch2_platform_systems.sql`     — Gamification (Seasons/Challenges), Community, Feedback, Referrals
3. `sql/batch3_knowledge_and_videos.sql` — Concepts (101+), Careers (15), and Verified Video Library (157+)

---

## STEP 9 — Advanced Gamification, Community & Career Hub
```
28_gamification.sql                 — Seasons, weekly missions, daily challenges, get_leaderboard(), get_season_rank()
29_community_career.sql             — Lesson comments, upvotes, 50+ interview questions bank, user saved questions
30_feedback_schema.sql              — User feedback, bug reports, feature requests, admin review tracking
31_referral_system.sql              — Referral tracking, codes, rewards calculation
```

## STEP 10 — Multimedia Library, Trading Simulations & Final Expansions
```
32_phase10_multimedia_trading.sql   — Books, reading status, paper portfolios, virtual orders, downloads
33_content_freshness_audits.sql     — Automated/manual content freshness audit logs
34_concepts_careers_videos.sql      — 50 concepts, 7 careers, video library base
35_fix_placeholder_video_ids.sql    — Deactivates placeholder video IDs
36_video_library_expansion.sql      — 113+ verified real YouTube embed IDs
37_phase10_cases_hindi.sql          — 13 interactive case studies + 10 Hindi lessons
```

---

## FINAL SYSTEM CAPABILITIES & EXPECTED METRICS
| Content Domain | Final Live Entity Count |
|---|---|
| Published Lessons | 375+ total lessons across 8 comprehensive tracks |
| Hindi Localized Lessons | 23+ fully translated lessons |
| Free Access Lessons | 40+ ungated preview lessons |
| Interactive Quizzes & Questions | 50+ quizzes, 184+ questions |
| Curated Video Library | 157+ verified YouTube video lessons |
| Knowledge Graph Concepts | 100+ interconnected finance concepts |
| Financial Glossary Terms | 35+ plain-English finance definitions |
| Interactive Case Studies | 25 full real-world case simulations |
| Paper Trading Engines | 6 Forex Pairs + 6 Crypto Assets with real-time ticks |
| Career Paths & Interview Bank | 15 career roadmaps + 50+ interview Q&As |
| Email Sequences & Notifications | 5 automated onboarding/drip email sequences |
| League Tiers & Seasons | 5 competitive tiers with weekly promotion/relegation |

*All SQL migration scripts are 100% idempotent, safe, and can be executed sequentially in the Supabase SQL Editor.*
