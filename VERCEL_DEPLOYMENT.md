# FinanceHub - Vercel Deployment Guide

Complete step-by-step guide to go from local development to a live production app in about 30 minutes.

## Step 1: Push Your Code To GitHub

```bash
git init
git add .
git commit -m "FinanceHub MVP - initial commit"
```

Create a new repository on GitHub, then run:

```bash
git remote add origin https://github.com/yourusername/financehub.git
git branch -M main
git push -u origin main
```

## Step 2: Connect To Vercel

1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New Project**.
3. Import your `financehub` repository.
4. Framework: **Next.js**. Vercel should auto-detect this.
5. Root directory: `./`. Leave the default.
6. Do not click **Deploy** yet. Add environment variables first.

## Step 3: Add Environment Variables In Vercel

Go to **Vercel Dashboard > Project > Settings > Environment Variables**.

Add all of these variables. Set the environment to **Production**, **Preview**, and **Development**.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

ANTHROPIC_API_KEY=sk-ant-your-key

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-key
STRIPE_SECRET_KEY=sk_live_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-key
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
STRIPE_PRO_ANNUAL_PRICE_ID=price_xxx
STRIPE_EXPERT_MONTHLY_PRICE_ID=price_xxx
STRIPE_EXPERT_ANNUAL_PRICE_ID=price_xxx

RESEND_API_KEY=re_your-key
RESEND_FROM_EMAIL=hello@financehub.in

NEXT_PUBLIC_POSTHOG_KEY=phc_your-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=financehub
SENTRY_AUTH_TOKEN=your-auth-token

NEXT_PUBLIC_APP_URL=https://financehub.in
ADMIN_EMAILS=your@email.com
SUPABASE_WEBHOOK_SECRET=make-a-random-32-char-string
INTERNAL_SECRET=another-random-32-char-string
CRON_SECRET=yet-another-random-32-char-string
```

## Step 4: Deploy

1. Click **Deploy** in Vercel.
2. Wait about 2 minutes for the build to complete.
3. Vercel will provide a temporary URL, usually like `financehub.vercel.app`.

## Step 5: Connect Custom Domain

Go to **Vercel Dashboard > Project > Settings > Domains**.

Add:

```text
financehub.in
www.financehub.in
```

In your domain registrar, such as GoDaddy, Namecheap, or Google Domains, add:

```text
A record:     @     76.76.21.21
CNAME:        www   cname.vercel-dns.com
```

SSL is automatic. Vercel handles the certificate.

## Step 6: Update Supabase For Production

Go to **Supabase Dashboard > Authentication > URL Configuration**.

Set:

```text
Site URL: https://financehub.in
```

Add these redirect URLs:

```text
https://financehub.in/**
https://www.financehub.in/**
https://financehub.vercel.app/**
```

Then go to **Supabase Dashboard > Auth > Email Templates** and update the confirmation email to match the FinanceHub brand.

## Step 7: Set Up Stripe Webhook For Production

Go to **Stripe Dashboard > Developers > Webhooks > Add endpoint**.

Set the endpoint URL:

```text
https://financehub.in/api/stripe-webhook
```

Select these events:

```text
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.payment_succeeded
invoice.payment_failed
```

Copy the signing secret and update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables.

Redeploy after updating environment variables.

## Step 8: Set Up Supabase Auth Webhook

This powers the welcome email flow.

Go to **Supabase Dashboard > Database > Webhooks > Create webhook**.

Use:

```text
Name: welcome-email-on-signup
Table: auth.users
Events: INSERT
URL: https://financehub.in/api/webhook-signup
```

Add this header:

```text
x-webhook-secret: <your SUPABASE_WEBHOOK_SECRET>
```

## Step 9: Verify Deployment

Test this checklist manually after deployment:

- [ ] Homepage loads at `financehub.in`.
- [ ] Sign up with a new email.
- [ ] Confirmation email arrives.
- [ ] Onboarding quiz works.
- [ ] Dashboard shows correctly.
- [ ] Explore tracks page loads lessons.
- [ ] Open a lesson, read it, and mark it complete.
- [ ] XP celebration popup appears.
- [ ] AI tutor responds. Check `ANTHROPIC_API_KEY`.
- [ ] Quiz modal opens and works.
- [ ] `/pricing` page loads.
- [ ] Stripe checkout works. Use test card `4242 4242 4242 4242`.
- [ ] After payment, `profile.role` updates to `pro`.
- [ ] Admin: `/admin` redirects non-admin users.
- [ ] Admin: lesson create and publish works.
- [ ] Mobile: test on a real iOS or Android device.

## Troubleshooting Common Errors

### Build Error: Module Not Found

- Check that all imports use the `@/` alias correctly.
- Run `npm install` in the project root.

### Build Error: Type Error

- Run `npm run build` locally first.
- Fix TypeScript errors before pushing.

### Runtime Error: Invalid API Key

- Check environment variables in Vercel.
- Redeploy after updating environment variables.

### Supabase Auth Not Working On Production

- Check **Site URL** and **Redirect URLs** in Supabase settings.
- URLs must include the `https://` prefix.

### Stripe Webhook Not Firing

- Check that the webhook URL is exactly `/api/stripe-webhook`.
- Check that `STRIPE_WEBHOOK_SECRET` matches the Vercel environment variable.

### AI Tutor Returning Errors

- Check that `ANTHROPIC_API_KEY` is valid and has credits.
- Check rate limit logic in `app/api/ai-tutor/route.ts`.
