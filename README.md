# FinanceHub

World-class finance education platform built with Next.js, Supabase, Stripe, Claude, PostHog, Sentry, and Resend.

## Quick Start

1. Copy `.env.example` to `.env.local` and fill all required values.
2. Install dependencies:

```bash
npm install
```

3. Start locally:

```bash
npm run dev
```

4. Run the SQL files in Supabase using the order below.
5. Open `http://localhost:3000`.

## What Is Included

- 115 structured lessons across 8 tracks.
- 25 curated YouTube playlists and a 30-book finance library.
- 4-tab lesson player: Learn, Watch, Practice, Download.
- Quizzes, XP, badges, streaks, daily challenges, weekly missions, and seasons.
- SM-2 spaced repetition, mastery tracking, weak-topic detection, and recommendations.
- AI tutor, exam generator, weakness detector, roadmap planner, and financial statement explainer.
- SIP, EMI, retirement, tax, startup cash flow, Forex paper trading, and Crypto paper trading simulators.
- Career Hub with interview Q&A, saved questions, comments, and admin analytics.
- Stripe checkout, customer portal, webhooks, Resend email, PostHog analytics, Sentry, cron, rate limits, dark mode, and mobile layout.

## SQL Run Order

Run these in Supabase SQL Editor in this exact order for a fresh database:

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
17. `sql/phase10/complete_video_library.sql`

Your current Supabase database has already shown the original 55 lessons and analytics views as OK. For a fresh deploy, run all 17 files above.

## Main App Routes

- `/dashboard` - learning dashboard with gamification widgets.
- `/explore` - all tracks and levels.
- `/learn/[lessonId]` - multimedia lesson player.
- `/library` - videos and books.
- `/simulators` - calculators and trading labs.
- `/ai-exam` - AI exam generator.
- `/roadmap` - AI learning roadmap planner.
- `/career` - interview Q&A and career guide.
- `/pricing` - Stripe upgrade flow.
- `/profile` - user stats, settings, badges, mastery, and billing.
- `/admin/analytics` - admin analytics dashboard.

## Deployment

Before deploying, set all environment variables in Vercel. Then run:

```bash
./DEPLOY.sh
```

After deployment, configure:

- Stripe webhook: `/api/stripe-webhook`
- Supabase signup webhook: `/api/webhook-signup`
- Resend domain authentication
- Supabase Auth redirect URLs
- Sentry and PostHog keys

## Local Build Check

```bash
npm run build
```
