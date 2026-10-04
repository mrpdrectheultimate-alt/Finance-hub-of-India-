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
27_phase8_lessons.sql                   — +27 final lessons: Forex (+6), TA (+7), Crypto (+5), Corporate (+4), Hindi (+5)
```

---

## QUICK VERIFICATION QUERY
After executing all files, run this query in the Supabase SQL Editor:

```sql
SELECT 'Total Published Lessons' AS metric, COUNT(*)::TEXT AS value FROM lessons WHERE is_published = TRUE
UNION ALL
SELECT 'Hindi Lessons',           COUNT(*)::TEXT FROM lessons WHERE is_published = TRUE AND language = 'hi'
UNION ALL
SELECT 'Free Lessons',            COUNT(*)::TEXT FROM lessons WHERE is_published = TRUE AND is_free = TRUE
UNION ALL
SELECT 'Total Quizzes',           COUNT(*)::TEXT FROM quizzes
UNION ALL
SELECT 'Quiz Questions',          COUNT(*)::TEXT FROM quiz_questions
UNION ALL
SELECT 'Video Library Items',     COUNT(*)::TEXT FROM curated_playlists WHERE is_published = TRUE
UNION ALL
SELECT 'Knowledge Graph Concepts',COUNT(*)::TEXT FROM concepts WHERE is_published = TRUE
UNION ALL
SELECT 'Glossary Terms',          COUNT(*)::TEXT FROM glossary WHERE is_published = TRUE
UNION ALL
SELECT 'Case Studies',            COUNT(*)::TEXT FROM case_studies WHERE is_published = TRUE
UNION ALL
SELECT 'Email Sequences',         COUNT(*)::TEXT FROM email_sequences WHERE is_active = TRUE
UNION ALL
SELECT 'User Profiles',           COUNT(*)::TEXT FROM profiles
ORDER BY metric;
```

---

## EXPECTED ENTITY COUNTS AFTER FULL RUN

| Metric | Target Count |
|---|---|
| Published Lessons | 320–340+ |
| Hindi Lessons | 13+ |
| Free Lessons | 40+ |
| Quizzes | 50+ |
| Quiz Questions | 184+ |
| Video Library Items | 82 |
| Concepts in Knowledge Graph | 50 |
| Financial Glossary Terms | 35+ |
| Interactive Case Studies | 5 |
| Email Sequences | 5 |
| League Tiers | 5 |

*Note: All 27 SQL migration scripts are 100% safe, idempotent, and re-runnable.*


---

## UPDATED RUN ORDER — Phase 10 Added

Run AFTER all previous files:

`
32. phase10_cases_hindi.sql   — 13 more case studies (total 25) + 10 Hindi lessons (total 23)
`

## UPDATED EXPECTED COUNTS (After all 34 files)

| Content | Count |
|---------|-------|
| Published lessons | 375+ |
| Hindi lessons | 23+ |
| Case studies | 25 |
| Concepts (knowledge graph) | 100+ |
| Videos | 157+ |
| Career paths | 15 |
| Badges | 20 |
