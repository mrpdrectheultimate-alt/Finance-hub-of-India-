# FinanceHub — Deploy Now Guide
# Everything you need to go from zip to live website
# October 2026

---

## STEP 0 — One-time setup (15 minutes)

### 0a. Create accounts (if not done)
- Supabase: supabase.com → new project → India region
- Vercel: vercel.com → connect GitHub
- Resend: resend.com → verify domain financehub.in
- Razorpay: razorpay.com → activate account
- Stripe: stripe.com → activate account
- PostHog: posthog.com → create project
- Sentry: sentry.io → create Next.js project

### 0b. Create GitHub repo
```bash
git init financehub
cd financehub
npx create-next-app@14.2.5 . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

### 0c. Install all dependencies
```bash
npm install @anthropic-ai/sdk @supabase/supabase-js @supabase/ssr
npm install posthog-js resend razorpay stripe
npm install @vercel/og
npm install --save-dev @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## STEP 1 — Deploy all files (30 minutes)

Unzip FinanceHub_COMPLETE_FINAL.zip and copy each file to its path.
Use FINANCEHUB_FINAL_STATE.md as the deploy map — every file listed with its exact path.

### Critical files first:
```
package.json           → /package.json          (replace auto-generated)
next.config.js         → /next.config.js
tailwind.config.ts     → /tailwind.config.ts
middleware.ts          → /middleware.ts          (project root)
globals.css            → /app/globals.css
layout.tsx             → /app/layout.tsx
vercel.json            → /vercel.json
robots.txt             → /public/robots.txt
manifest.json          → /public/manifest.json
sw.js                  → /public/sw.js
supabase_client.ts     → /lib/supabase.ts
seo.ts                 → /lib/seo.ts
email_templates.ts     → /lib/email-templates.ts
analytics.tsx          → split into:
                          /components/analytics/PostHogProvider.tsx
                          /lib/analytics.ts
                          /components/ui/ErrorBoundary.tsx
```

### Pages (deploy to app/ directory):
```
landing_page_new.tsx   → app/page.tsx
login_page.tsx         → app/login/page.tsx
signup_page.tsx        → app/signup/page.tsx
dashboard_page.tsx     → app/dashboard/page.tsx
explore_page.tsx       → app/explore/page.tsx
lesson_player.tsx      → app/learn/[slug]/page.tsx
onboarding_page.tsx    → app/onboarding/page.tsx
pricing_page.tsx       → app/pricing/page.tsx
glossary_page.tsx      → app/glossary/page.tsx
review_page.tsx        → app/review/page.tsx
leaderboard_page.tsx   → app/leaderboard/page.tsx
certificates_page.tsx  → app/certificates/page.tsx
library_page_v2.tsx    → app/library/page.tsx
simulators_page.tsx    → app/practice/page.tsx
profile_page.tsx       → app/profile/page.tsx
admin_analytics_page.tsx → app/admin/analytics/page.tsx
sitemap_guide_page.tsx → app/sitemap-guide/page.tsx
og_image_route.tsx     → app/api/og/route.tsx
sitemap.ts             → app/sitemap.ts

From misc_pages.tsx — split into:
  ForgotPasswordPage   → app/forgot-password/page.tsx
  SettingsPage         → app/settings/page.tsx
  KnowledgeMapPage     → app/knowledge-map/page.tsx
  NotesPage            → app/notes/page.tsx
  AITutorPage          → app/ai-tutor/page.tsx
  CaseStudiesPage      → app/case-studies/page.tsx
  VerifyPage           → app/verify/[id]/page.tsx
  TrackPage            → app/tracks/[slug]/page.tsx

From final_pages.tsx — split into:
  RefundPolicyPage     → app/legal/refund/page.tsx
  ResetPasswordPage    → app/reset-password/page.tsx
  CookiePolicyPage     → app/legal/cookies/page.tsx

Legal pages:
  legal_terms_page.tsx      → app/legal/terms/page.tsx
  legal_privacy_page.tsx    → app/legal/privacy/page.tsx
  legal_disclaimer_page.tsx → app/legal/disclaimer/page.tsx

Admin:
  AdminCMS.tsx         → app/admin/cms/page.tsx
  AdminDashboard.tsx   → app/admin/dashboard/page.tsx
```

### API Routes:
```
auth_callback_route.ts           → app/api/auth/callback/route.ts
complete_lesson_route.ts         → app/api/complete-lesson/route.ts
search_route.ts                  → app/api/search/route.ts
razorpay_order_route.ts          → app/api/payment/razorpay-order/route.ts
razorpay_webhook_route.ts        → app/api/payment/razorpay-webhook/route.ts
stripe_webhook_route.ts          → app/api/stripe-webhook/route.ts
email_sequence_route.ts          → app/api/email/send-sequence/route.ts
generate_certificate_route.ts    → app/api/generate-certificate/route.ts
notes_api_route.ts               → app/api/notes/route.ts
api_mastery_route.ts             → app/api/mastery/route.ts
api_recommendations_route.ts     → app/api/recommendations/route.ts
api_ai_financial_explainer_route.ts → app/api/ai-mentor/route.ts
api_ai_exam_generator_route.ts   → app/api/ai-exam/route.ts
api_ai_roadmap_planner_route.ts  → app/api/ai-roadmap/route.ts
api_ai_weakness_detector_route.ts → app/api/ai-weakness/route.ts
api_download_lesson_pdf_route.ts → app/api/download-pdf/route.ts
reset_ai_limits_route.ts         → app/api/cron/reset-ai-limits/route.ts
daily_snapshot_route.ts          → app/api/cron/daily-snapshot/route.ts
weekly_league_route.ts           → app/api/cron/weekly-league/route.ts
```

### Components:
```
Logo.tsx                → components/ui/Logo.tsx
Navbar.tsx              → components/layout/Navbar.tsx
Footer.tsx              → components/layout/Footer.tsx
AppLayout.tsx           → components/layout/AppLayout.tsx
AIMentor.tsx            → components/ai/AIMentor.tsx
LessonQA.tsx            → components/community/LessonQA.tsx
KnowledgeGraph.tsx      → components/learn/KnowledgeGraph.tsx
ConceptCard.tsx         → components/learn/ConceptCard.tsx
RoughBook.tsx           → components/tools/RoughBook.tsx
VideoPlayer.tsx         → components/ui/VideoPlayer.tsx
MasteryDashboard.tsx    → components/learn/MasteryDashboard.tsx
AiExamGenerator.tsx     → components/ai/AiExamGenerator.tsx
AiRoadmapPlanner.tsx    → components/ai/AiRoadmapPlanner.tsx
PWAInstall.tsx          → components/pwa/PWAInstall.tsx
ThemeProvider.tsx       → components/ui/ThemeProvider.tsx
RazorpayButton.tsx      → components/ui/RazorpayButton.tsx
SearchBar.tsx           → components/ui/SearchBar.tsx
Skeletons.tsx           → components/ui/Skeletons.tsx
FinanceDisclaimer.tsx   → components/ui/FinanceDisclaimer.tsx
DesignSystem.tsx        → components/ui/DesignSystem.tsx
ErrorBoundary.tsx       → components/ui/ErrorBoundary.tsx
CompoundInterestVisualiser.tsx → components/visualisers/CompoundInterestVisualiser.tsx
NetWorthTracker.tsx     → app/practice/net-worth/page.tsx
GoalPlanner.tsx         → app/practice/goals/page.tsx
CryptoPaperTrader.tsx   → app/practice/crypto/page.tsx
ForexPaperTrader.tsx    → app/practice/forex/page.tsx
LessonVideoTab.tsx      → components/learn/LessonVideoTab.tsx
```

---

## STEP 2 — Environment variables in Vercel (5 minutes)

Go to: Vercel → Project → Settings → Environment Variables
Add all 20 variables:

```
NEXT_PUBLIC_SUPABASE_URL          = (from Supabase project settings)
NEXT_PUBLIC_SUPABASE_ANON_KEY     = (from Supabase project settings)
SUPABASE_SERVICE_ROLE_KEY         = (from Supabase project settings)

ANTHROPIC_API_KEY                 = (from console.anthropic.com)

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_...
STRIPE_SECRET_KEY                  = sk_live_...
STRIPE_WEBHOOK_SECRET              = whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID        = price_...
STRIPE_PRO_ANNUAL_PRICE_ID         = price_...
STRIPE_EXPERT_MONTHLY_PRICE_ID     = price_...

RAZORPAY_KEY_ID                    = rzp_live_...
RAZORPAY_KEY_SECRET                = (from Razorpay dashboard)
RAZORPAY_WEBHOOK_SECRET            = (set when creating webhook)

RESEND_API_KEY                     = re_...
RESEND_FROM_EMAIL                  = hello@financehub.in

NEXT_PUBLIC_APP_URL                = https://financehub.in
NEXT_PUBLIC_ADMIN_EMAILS           = mrpdrecuniverse@gmail.com

INTERNAL_SECRET                    = (generate: openssl rand -hex 32)
CRON_SECRET                        = (generate: openssl rand -hex 32)

NEXT_PUBLIC_POSTHOG_KEY            = phc_...
NEXT_PUBLIC_POSTHOG_HOST           = https://app.posthog.com

NEXT_PUBLIC_SENTRY_DSN             = https://...@sentry.io/...
```

---

## STEP 3 — Run SQL in Supabase (20 minutes)

Go to: Supabase → SQL Editor → New Query

Run in EXACT order:

```
1.  supabase_schema_safe.sql
2.  phase1_critical_fixes.sql
3.  trading_markets_101.sql
4.  crypto_basics.sql
5.  corporate_business_basics.sql
6.  behavioral_finance.sql
7.  forex_basics.sql
8.  technical_analysis.sql
9.  personal_finance_intermediate.sql
10. adaptive_learning_engine.sql
11. analytics_views.sql
12. video_library_complete.sql
13. lesson_expansion_phase1.sql
14. lesson_expansion_phase2.sql
15. lesson_expansion_phase3.sql
16. lesson_expansion_phase3_part2.sql
17. phase3_quizzes.sql
18. notes_schema.sql
19. phase1_migration.sql
20. phase2_migration.sql
21. phase3_migration.sql
22. phase4_migration.sql
23. phase5_migration.sql
24. phase6_migration.sql
25. phase7_lessons.sql
26. phase8_lessons.sql
27. phase9_lessons.sql
28. phase10_cases_hindi.sql
29. gamification.sql
30. community_career.sql
31. case_studies_expansion.sql
32. concepts_careers_videos.sql
33. phase9_10_quizzes.sql
34. phase10_multimedia_trading.sql
35. sitemap_navigation.sql
36. phase0_reality_audit.sql   ← LAST — verifies everything
```

### Verify after running all 36:
```sql
SELECT 'lessons'       AS item, COUNT(*)::TEXT AS count FROM lessons WHERE is_published=TRUE
UNION ALL SELECT 'hindi',        COUNT(*) FROM lessons WHERE language='hi' AND is_published=TRUE
UNION ALL SELECT 'case_studies', COUNT(*) FROM case_studies WHERE is_published=TRUE
UNION ALL SELECT 'quizzes',      COUNT(*) FROM quizzes
UNION ALL SELECT 'concepts',     COUNT(*) FROM concepts WHERE is_published=TRUE
UNION ALL SELECT 'videos',       COUNT(*) FROM video_library WHERE is_active=TRUE
UNION ALL SELECT 'career_paths', COUNT(*) FROM career_paths WHERE is_published=TRUE
UNION ALL SELECT 'badges',       COUNT(*) FROM badges WHERE is_active=TRUE
ORDER BY item;
```

Expected results:
```
badges        20
career_paths  15
case_studies  25
concepts      100+
hindi         23
lessons       375+
quizzes       70+
videos        157+
```

---

## STEP 4 — Configure webhooks (10 minutes)

### Razorpay Dashboard → Webhooks → Add new
```
URL:    https://financehub.in/api/payment/razorpay-webhook
Events: payment.captured
        subscription.activated
        subscription.charged
        subscription.cancelled
        subscription.halted
Secret: (use RAZORPAY_WEBHOOK_SECRET from env vars)
```

### Stripe Dashboard → Developers → Webhooks → Add endpoint
```
URL:    https://financehub.in/api/stripe-webhook
Events: checkout.session.completed
        invoice.payment_succeeded
        invoice.payment_failed
        customer.subscription.updated
        customer.subscription.deleted
```
Copy the webhook signing secret → set as STRIPE_WEBHOOK_SECRET in Vercel.

---

## STEP 5 — Stripe products (5 minutes)

Stripe Dashboard → Products → Add product:

```
Product 1: FinanceHub Pro
  Price 1: ₹499/month recurring → copy price ID → STRIPE_PRO_MONTHLY_PRICE_ID
  Price 2: ₹4990/year recurring → copy price ID → STRIPE_PRO_ANNUAL_PRICE_ID

Product 2: FinanceHub Expert
  Price 1: ₹999/month recurring → copy price ID → STRIPE_EXPERT_MONTHLY_PRICE_ID
```

---

## STEP 6 — Vercel Cron Jobs (2 minutes)

vercel.json already has these configured. They activate on deploy:
```
"0 * * * *"    → /api/email/send-sequence       (hourly)
"0 0 * * *"    → /api/cron/daily-snapshot       (midnight UTC)
"30 18 * * *"  → /api/cron/reset-ai-limits      (midnight IST)
"0 1 * * 1"    → /api/cron/weekly-league        (Monday 1 AM UTC)
```

---

## STEP 7 — Post-deploy checks (30 minutes)

Run through this checklist after first deploy:

### Auth
- [ ] Sign up with Google works
- [ ] Sign up with email works
- [ ] Login works
- [ ] Forgot password email arrives
- [ ] Password reset works
- [ ] Logout works
- [ ] Onboarding quiz completes and redirects to dashboard

### Learning
- [ ] /explore shows all tracks
- [ ] Individual lesson loads at /learn/[slug]
- [ ] Lesson completion marks progress
- [ ] Quiz loads and scores correctly
- [ ] AI Mentor answers a question
- [ ] Rate limit triggers after 5 questions (free tier)

### Payments
- [ ] Razorpay checkout opens (use test mode first)
- [ ] Test payment completes → tier upgrades to Pro in profile
- [ ] Stripe checkout opens
- [ ] Test payment completes → tier upgrades

### Email
- [ ] Welcome email arrives after signup
- [ ] Streak reminder triggers (manually call the cron)
- [ ] Certificate email sends after completing a track

### Mobile
- [ ] All pages work on 375px width
- [ ] Nav hamburger opens/closes
- [ ] Lesson player readable
- [ ] Simulators usable

### SEO
- [ ] /sitemap.xml returns valid XML with all routes
- [ ] /robots.txt accessible
- [ ] OG image loads at /api/og?title=Test
- [ ] Submit sitemap in Google Search Console

---

## STEP 8 — Google Search Console (5 minutes)

1. Go to search.google.com/search-console
2. Add property: financehub.in
3. Verify via DNS TXT record (Vercel → Domain → DNS)
4. Submit sitemap: https://financehub.in/sitemap.xml
5. Request indexing for homepage

---

## WHAT TO DO WEEK 1 AFTER LAUNCH

Monday: Deploy and run all checks above
Tuesday: Share with 5-10 trusted people (friends, colleagues)
Wednesday: Watch them use it — note every confusion point
Thursday: Fix the top 3 things they found confusing
Friday: Share on LinkedIn: "I built this finance education platform — honest feedback wanted"
Weekend: Read every piece of feedback, prioritise fixes

## FIRST METRIC TO WATCH

Not signups. Not traffic.

Watch: Do people complete at least 3 lessons in their first session?

If yes → the learning experience works.
If no → something is broken or confusing in the onboarding flow.

Fix that first. Everything else follows.

---

## CONTACTS FOR SUPPORT

Supabase issues:  supabase.com/docs
Vercel issues:    vercel.com/docs
Razorpay issues:  razorpay.com/docs
Resend issues:    resend.com/docs
Stripe issues:    stripe.com/docs
Anthropic issues: docs.anthropic.com
