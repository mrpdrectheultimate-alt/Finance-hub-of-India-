# Stripe Setup Guide for FinanceHub

## Step 1 - Create Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Sign up with your email.
3. Complete business verification. Use `Education` as the business category.

## Step 2 - Get API Keys

1. Go to Stripe Dashboard -> Developers -> API keys.
2. Copy the publishable key into `.env.local` as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. Copy the secret key into `.env.local` as `STRIPE_SECRET_KEY`.

## Step 3 - Create Products And Prices

Go to Stripe Dashboard -> Products -> Add product.

### Pro Plan

- Name: `FinanceHub Pro`
- Monthly price: `Rs. 499 / INR / month`
- Env var: `STRIPE_PRO_MONTHLY_PRICE_ID`
- Annual price: `Rs. 4,990 / INR / year`
- Env var: `STRIPE_PRO_ANNUAL_PRICE_ID`

### Expert Plan

- Name: `FinanceHub Expert`
- Monthly price: `Rs. 999 / INR / month`
- Env var: `STRIPE_EXPERT_MONTHLY_PRICE_ID`
- Annual price: `Rs. 9,990 / INR / year`
- Env var: `STRIPE_EXPERT_ANNUAL_PRICE_ID`

## Step 4 - Set Up Webhook

1. Go to Stripe Dashboard -> Developers -> Webhooks -> Add endpoint.
2. Endpoint URL: `https://yourdomain.com/api/stripe-webhook`
3. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the signing secret into `.env.local` as `STRIPE_WEBHOOK_SECRET`.

For local testing:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

## Step 5 - Enable Customer Portal

1. Go to Stripe Dashboard -> Settings -> Billing -> Customer portal.
2. Enable subscription cancellation and payment method updates.
3. Save settings.

## Step 6 - Enable Indian Payment Methods

1. Go to Stripe Dashboard -> Settings -> Payment methods.
2. Enable Cards, UPI, and NetBanking as available.
3. Note: Stripe India may require business registration.

## Step 7 - Test The Flow

Use Stripe test card:

- Card: `4242 4242 4242 4242`
- Expiry: any future date
- CVC: any 3 digits

Then:

1. Go to `/pricing`.
2. Click `Start 7-day trial` on Pro.
3. Complete checkout with the test card.
4. Verify the user profile role updates to `pro` in Supabase after webhook delivery.

## Required `.env.local`

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_ANNUAL_PRICE_ID=price_...
STRIPE_EXPERT_MONTHLY_PRICE_ID=price_...
STRIPE_EXPERT_ANNUAL_PRICE_ID=price_...
```
