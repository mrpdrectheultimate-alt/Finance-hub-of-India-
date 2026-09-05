# FinanceHub — Complete Deployment Walkthrough
## From Zero to Live Production

---

## Prerequisites checklist

Before starting, ensure you have:
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Git installed (`git --version`)
- [ ] Vercel account (vercel.com — free tier works)
- [ ] Supabase account (supabase.com — free tier works)
- [ ] Anthropic API key (console.anthropic.com) or Google Gemini API Key
- [ ] Stripe account (stripe.com — test mode)
- [ ] Resend account (resend.com — free tier: 3,000 emails/month)
- [ ] Domain name (optional for now, Vercel provides .vercel.app)

**Estimated time**: 2-3 hours for complete setup

---

## PHASE 1 — Local Setup

### Step 1: Clone and install

```bash
# Clone the repository
git clone https://github.com/your-username/financehub.git
cd financehub

# Install dependencies
npm install

# Verify no errors
npm run build
# Should show: ✓ Compiled successfully (62 routes)
```

### Step 2: Environment variables

Copy the example file and fill in all values:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill every value:

```env
# ─── Supabase ───────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# ─── AI Providers ───────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-api03-...
GEMINI_API_KEY=AIzaSy...

# ─── Stripe ─────────────────────────────────────────────────
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_ANNUAL_PRICE_ID=price_...
STRIPE_EXPERT_MONTHLY_PRICE_ID=price_...

# ─── Resend (email) ─────────────────────────────────────────
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=hello@yourdomain.com

# ─── App ────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://financehub.vercel.app
ADMIN_EMAILS=your@email.com
INTERNAL_SECRET=generate-32-char-random-string-here
CRON_SECRET=another-32-char-random-string-here

# ─── Analytics (optional) ───────────────────────────────────
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

**Generate secrets**:
```bash
# Generate INTERNAL_SECRET and CRON_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Run twice to get two different values
```

### Step 3: Test locally

```bash
npm run dev
# Open http://localhost:3000
# Should show the landing page
```

---

## PHASE 2 — Supabase Setup

### Step 4: Create Supabase project

1. Go to supabase.com → New project
2. Choose a strong database password (save it)
3. Select region closest to India: **Singapore (ap-southeast-1)**
4. Wait 2 minutes for provisioning

### Step 5: Get your credentials

In Supabase dashboard:
- **Settings → API**
- Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 6: Run SQL files in order

Go to **Supabase → SQL Editor → New query**

Run each file in exactly this order. Paste the contents and click **Run**:

```
ORDER | FILE                                    | WHAT IT DOES
────────────────────────────────────────────────────────────────────
  1.  supabase_schema_safe.sql                  Base tables & RLS
  2.  seed_lessons.sql                          10 PF beginner lessons
  3.  phase1_critical_fixes.sql                 Atomic RPCs, XP chain
  4.  seeds/trading_markets_101.sql             15 Trading lessons
  5.  seeds/crypto_basics.sql                   15 Crypto lessons
  6.  seeds/corporate_business_basics.sql       15 Corporate lessons
  7.  phase4/adaptive_learning_engine.sql       SM-2 mastery engine
  8.  phase7/gamification.sql                   XP, badges, seasons
  9.  phase8/community_career.sql               50 interview Q&As
 10.  phase9/analytics_views.sql                Admin metrics views
 11.  phase10/multimedia_trading.sql            Playlists, books, paper trading
 12.  seeds/behavioral_finance.sql              15 Behavioral lessons
 13.  seeds/forex_basics.sql                    15 Forex lessons
 14.  seeds/technical_analysis.sql              15 TA lessons
 15.  seeds/personal_finance_intermediate.sql   15 PF intermediate lessons
 16.  video_library_complete.sql                73 verified videos
 17.  lesson_expansion_phase1.sql               +57 lessons (115→172)
 18.  lesson_expansion_phase2.sql               +25 lessons (172→197)
 19.  lesson_expansion_phase2_part2.sql         +27 lessons (197→224+)
```

**After each file runs**, check the output panel. Look for:
- ✅ `Success. No rows returned` — good
- ✅ `NOTICE: Total published lessons: 224+` — good
- ❌ `ERROR: relation "X" does not exist` — wrong order, run the dependency first

### Step 7: Configure Supabase Auth

**Settings → Authentication → Email:**
- Enable email confirmation: ON for production, OFF for testing
- Site URL: `https://financehub.vercel.app` (update after Vercel deploy)

**Settings → Authentication → Providers:**
- Enable Google OAuth (optional but recommended)
  - Create credentials at console.cloud.google.com
  - Add Client ID and Secret

**Settings → Authentication → URL Configuration:**
- Site URL: `https://financehub.vercel.app`
- Redirect URLs: Add `https://financehub.vercel.app/**`

### Step 8: Enable Supabase Storage (for avatars)

**Storage → New bucket:**
- Name: `avatars`
- Public: YES
- File size limit: 5MB

Add this storage policy in SQL editor:
```sql
CREATE POLICY "Avatar upload own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar read public"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

---

## PHASE 3 — Stripe Setup

### Step 9: Create Stripe products

Go to Stripe Dashboard → Products → Add product:

**Product 1: FinanceHub Pro**
- Name: `FinanceHub Pro`
- Monthly price: ₹499 → Recurring → Monthly
  - Copy price ID → `STRIPE_PRO_MONTHLY_PRICE_ID`
- Annual price: ₹399/month → Recurring → Yearly (₹4,788/year)
  - Copy price ID → `STRIPE_PRO_ANNUAL_PRICE_ID`

**Product 2: FinanceHub Expert**
- Name: `FinanceHub Expert`
- Monthly price: ₹999 → Recurring → Monthly
  - Copy price ID → `STRIPE_EXPERT_MONTHLY_PRICE_ID`

### Step 10: Configure Stripe webhook (local testing)

```bash
# Install Stripe CLI
npm install -g stripe

# Login
stripe login

# Forward events to local server
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Copy the webhook signing secret shown → STRIPE_WEBHOOK_SECRET
```

### Step 11: Test checkout flow

```bash
# Start local dev server
npm run dev

# Use Stripe test card: 4242 4242 4242 4242
# Expiry: any future date
# CVV: any 3 digits
# Name: any
```

Verify in Stripe dashboard that test events appear.

---

## PHASE 4 — Vercel Deployment

### Step 12: Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

### Step 13: Deploy

```bash
# From project root
vercel

# Follow prompts:
# Set up and deploy? Y
# Which scope? (your account)
# Link to existing project? N
# Project name: financehub
# Root directory: ./
# Override build settings? N

# First deploy URL will be: https://financehub-xxx.vercel.app
```

### Step 14: Add environment variables to Vercel

**Option A — Vercel Dashboard (recommended):**
1. Go to vercel.com → Your project → Settings → Environment Variables
2. Add EVERY variable from your `.env.local`
3. Set scope: Production + Preview + Development

**Option B — Vercel CLI:**
```bash
# Add all env vars at once
vercel env pull .env.local  # pulls existing (if any)

# Or add individually:
vercel env add ANTHROPIC_API_KEY
# Paste value when prompted
# Select: Production, Preview, Development
```

### Step 15: Production deploy

```bash
vercel --prod

# Your site is now live at:
# https://financehub.vercel.app (or your custom domain)
```

### Step 16: Update Supabase with production URL

Go back to Supabase → Authentication → URL Configuration:
- Site URL: `https://financehub.vercel.app`
- Redirect URLs: `https://financehub.vercel.app/**`

### Step 17: Configure production Stripe webhook

In Stripe Dashboard → Webhooks → Add endpoint:
- URL: `https://financehub.vercel.app/api/stripe-webhook`
- Events to listen:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `customer.subscription.created`
  - `invoice.payment_failed`

Copy the webhook signing secret → Update `STRIPE_WEBHOOK_SECRET` in Vercel env vars → Redeploy:
```bash
vercel --prod
```

---

## PHASE 5 — Custom Domain (Optional)

### Step 18: Add custom domain

In Vercel dashboard → Your project → Settings → Domains:
- Add `financehub.in` (or your domain)
- Follow DNS configuration instructions

**Typical DNS setup (Cloudflare/GoDaddy):**
```
Type  Name   Value                       Proxy
A     @      76.76.21.21                 ON
CNAME www    cname.vercel-dns.com        ON
```

SSL certificate: Vercel handles automatically.

---

## PHASE 6 — Post-Deployment Verification

### Step 19: Smoke test checklist

Run through each item manually:

**Auth:**
- [ ] Sign up with email works
- [ ] Login works
- [ ] Password reset email received
- [ ] Google OAuth works (if configured)

**Content:**
- [ ] Dashboard loads with lessons
- [ ] Explore page shows all 8 tracks
- [ ] Lesson opens and content displays
- [ ] Video tab shows videos and player works
- [ ] Quiz submits and XP awarded
- [ ] Library page shows videos and books

**Payments:**
- [ ] Pricing page shows all plans
- [ ] Click Pro → Stripe checkout opens
- [ ] Complete with test card 4242 4242 4242 4242
- [ ] Account upgrades to Pro
- [ ] Manage billing → Stripe portal opens

**AI:**
- [ ] AI tutor responds
- [ ] Rate limit works (6th message shows limit error for free users)

**Simulators:**
- [ ] SIP calculator computes
- [ ] Forex paper trading shows live prices
- [ ] Crypto paper trading shows prices

**Admin:**
- [ ] /admin/analytics loads for admin email
- [ ] Metrics show correctly

### Step 20: Performance check

```bash
# Run Lighthouse
npx lighthouse https://financehub.vercel.app --output html --output-path ./lighthouse-report.html

# Target scores:
# Performance: > 85
# Accessibility: > 90
# Best Practices: > 90
# SEO: > 90
```

---

## PHASE 7 — Monitoring Setup

### Step 21: Sentry error tracking

```bash
npx @sentry/wizard@latest -i nextjs
# Follow prompts
# Copy DSN to NEXT_PUBLIC_SENTRY_DSN
```

### Step 22: PostHog analytics (optional)

```bash
npm install posthog-js
```

### Step 23: Uptime monitoring

Go to uptimerobot.com (free) → Add monitor:
- URL: `https://financehub.vercel.app/api/health`
- Check interval: 5 minutes
- Alert to your email

---

## PHASE 8 — Going Live Checklist

Before announcing publicly:

**Content:**
- [ ] All 224+ lessons load without errors
- [ ] Videos play in library and lesson pages
- [ ] Books section populated
- [ ] Quiz works for all tested lessons

**Legal:**
- [ ] Privacy Policy page live at /privacy
- [ ] Terms of Service page live at /terms
- [ ] Cookie consent banner (if EU users expected)
- [ ] Disclaimer on all financial content
- [ ] SEBI/RBI disclaimer: "Not financial advice"

**SEO:**
- [ ] og:image set (1200×630px)
- [ ] robots.txt allows crawling
- [ ] sitemap.xml generated
- [ ] All page titles unique
- [ ] Meta descriptions set

**Security:**
- [ ] All API routes rate-limited (verify in code)
- [ ] Admin routes protected (check ADMIN_EMAILS)
- [ ] No API keys in client-side code
- [ ] HTTPS enforced (Vercel default)
- [ ] Supabase RLS policies active on all tables

---

## PHASE 9 — First Users & Beta Launch

**Week 1-2: Closed beta (20-50 users)**
- Friends interested in personal finance
- Finance professionals in your network
- Recent graduates starting careers

**Week 3-4: Soft launch**
- r/IndiaInvestments (Reddit)
- r/personalfinanceindia
- Finshots community & LinkedIn

**Month 2: Product Hunt launch**
- 60-word description + demo video + screenshot gallery

---

*FinanceHub — World-Class Finance Education*
*Version: Phase 2 Complete | Lessons: 224+ | Tracks: 8*
