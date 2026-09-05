#!/usr/bin/env bash
set -euo pipefail

echo "FinanceHub Deployment"
echo "====================="

echo "Step 1: Install dependencies"
npm install

echo "Step 2: Build"
npm run build

echo "Step 3: Deploy to Vercel production"
vercel --prod

echo ""
echo "Deployment command completed."
echo ""
echo "POST-DEPLOY CHECKLIST"
echo "1. Confirm all SQL files were run in Supabase in the order below."
echo "2. Add all environment variables in the Vercel dashboard."
echo "3. Configure Stripe webhook: https://your-app.vercel.app/api/stripe-webhook"
echo "4. Configure Supabase signup webhook: https://your-app.vercel.app/api/webhook-signup"
echo "5. Verify Resend domain authentication."
echo "6. Verify Sentry and PostHog project keys."
echo "7. Confirm Vercel cron is enabled for /api/cron/streak-check."
echo ""
echo "SQL RUN ORDER"
echo "  1. sql/supabase_schema_safe.sql"
echo "  2. supabase/seed_lessons_personal_finance_beginner.sql"
echo "  3. sql/phase1_critical_fixes.sql"
echo "  4. sql/phase2_production_hardening.sql"
echo "  5. sql/seeds/trading_markets_101.sql"
echo "  6. sql/seeds/crypto_basics.sql"
echo "  7. sql/seeds/corporate_business_basics.sql"
echo "  8. sql/phase4/adaptive_learning_engine.sql"
echo "  9. sql/phase7/gamification.sql"
echo " 10. sql/phase8/community_career.sql"
echo " 11. sql/phase9/analytics_views.sql"
echo " 12. sql/phase10/multimedia_trading.sql"
echo " 13. sql/seeds/behavioral_finance.sql"
echo " 14. sql/seeds/forex_basics.sql"
echo " 15. sql/seeds/technical_analysis.sql"
echo " 16. sql/seeds/personal_finance_intermediate.sql"
echo " 17. sql/phase10/complete_video_library.sql"
