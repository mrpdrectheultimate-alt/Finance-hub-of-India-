# FinanceHub Project Structure

This file lists the canonical files for the current complete build. Older helper SQL files and logs are archived so the run order stays clear.

```text
financehub/
|-- README.md
|-- DEPLOY.sh
|-- .env.example
|-- vercel.json
|-- next.config.js
|-- tailwind.config.ts
|-- middleware.ts
|-- package.json
|-- tsconfig.json
|
|-- app/
|   |-- globals.css
|   |-- layout.tsx
|   |-- page.tsx
|   |-- sitemap.ts
|   |-- robots.ts
|   |-- dashboard/page.tsx
|   |-- explore/page.tsx
|   |-- learn/[lessonId]/page.tsx
|   |-- library/page.tsx
|   |-- simulators/page.tsx
|   |-- practice/page.tsx
|   |-- ai-exam/page.tsx
|   |-- roadmap/page.tsx
|   |-- career/page.tsx
|   |-- pricing/page.tsx
|   |-- profile/page.tsx
|   |-- certificates/page.tsx
|   |-- leaderboard/page.tsx
|   |-- admin/
|   |   |-- page.tsx
|   |   |-- analytics/page.tsx
|   |   |-- lessons/page.tsx
|   |   |-- lessons/[lessonId]/page.tsx
|   |   |-- quizzes/page.tsx
|   |   |-- quizzes/[quizId]/page.tsx
|   |   `-- users/page.tsx
|   `-- api/
|       |-- complete-lesson/route.ts
|       |-- submit-quiz/route.ts
|       |-- badge-check/route.ts
|       |-- award-xp/route.ts
|       |-- ai-tutor/route.ts
|       |-- ai-exam-generator/route.ts
|       |-- ai-weakness-detector/route.ts
|       |-- ai-roadmap-planner/route.ts
|       |-- ai-financial-explainer/route.ts
|       |-- mastery/route.ts
|       |-- recommendations/route.ts
|       |-- career/route.ts
|       |-- daily-challenge/route.ts
|       |-- weekly-mission/route.ts
|       |-- download-lesson-pdf/route.ts
|       |-- create-checkout/route.ts
|       |-- create-portal/route.ts
|       |-- generate-certificate/route.ts
|       |-- send-email/route.ts
|       |-- webhook-signup/route.ts
|       |-- stripe-webhook/route.ts
|       `-- cron/streak-check/route.ts
|
|-- components/
|   |-- layout/AppLayout.tsx
|   |-- layout/GlobalSearch.tsx
|   |-- ui/index.tsx
|   |-- ui/ThemeProvider.tsx
|   |-- theme/design-system.css
|   |-- learn/LessonPlayer.tsx
|   |-- learn/XpCelebration.tsx
|   |-- adaptive/MasteryDashboard.tsx
|   |-- ai/AiExamGenerator.tsx
|   |-- ai/AiRoadmapPlanner.tsx
|   |-- simulators/
|   |-- trading/
|   |-- gamification/
|   `-- community/LessonComments.tsx
|
|-- lib/
|   |-- supabase.ts
|   |-- security.ts
|   |-- rate-limit.ts
|   `-- analytics.ts
|
|-- sql/
|   |-- supabase_schema_safe.sql
|   |-- phase1_critical_fixes.sql
|   |-- phase2_production_hardening.sql
|   |-- phase4/adaptive_learning_engine.sql
|   |-- phase7/gamification.sql
|   |-- phase8/community_career.sql
|   |-- phase9/analytics_views.sql
|   |-- phase10/multimedia_trading.sql
|   `-- seeds/
|       |-- trading_markets_101.sql
|       |-- crypto_basics.sql
|       |-- corporate_business_basics.sql
|       |-- behavioral_finance.sql
|       |-- forex_basics.sql
|       |-- technical_analysis.sql
|       `-- personal_finance_intermediate.sql
|
`-- supabase/
    `-- seed_lessons_personal_finance_beginner.sql
```

## Supabase SQL Run Order

1. `sql/supabase_schema_safe.sql`
2. `supabase/seed_lessons_personal_finance_beginner.sql`
3. `sql/phase1_critical_fixes.sql`
4. `sql/phase2_production_hardening.sql`
5. `sql/seeds/trading_markets_101.sql`
6. `sql/seeds/crypto_basics.sql`
7. `sql/seeds/corporate_business_basics.sql`
8. `sql/phase4/adaptive_learning_engine.sql`
9. `sql/phase7/gamification.sql`
10. `sql/phase8/community_career.sql`
11. `sql/phase9/analytics_views.sql`
12. `sql/phase10/multimedia_trading.sql`
13. `sql/seeds/behavioral_finance.sql`
14. `sql/seeds/forex_basics.sql`
15. `sql/seeds/technical_analysis.sql`
16. `sql/seeds/personal_finance_intermediate.sql`
