# FinanceHub — Which File to Use (Duplicate Resolution)

## Landing Page
USE:     landing_page_new.tsx  → app/page.tsx   ← CURRENT (927 lines, full redesign)
IGNORE:  FinanceHub_landing_page.tsx             ← OLD version, kept for reference only

## Lesson Player
USE:     lesson_player.tsx     → app/learn/[slug]/page.tsx  ← CURRENT
IGNORE:  LessonPlayer.tsx                                   ← OLD version

## Library Page
USE:     library_page_v2.tsx   → app/library/page.tsx  ← CURRENT (v2 with full features)
IGNORE:  library_page.tsx                               ← OLD version

## AI Mentor API Route
USE:     AIMentor_route.ts     → app/api/ai-mentor/route.ts  ← Full streaming version with:
                                   - Intent classification
                                   - Learner context personalisation
                                   - Rate limiting per tier
                                   - Streaming response
IGNORE:  api_ai_financial_explainer_route.ts  ← Different tool (financial statement explainer)
                                                 Deploy as: app/api/ai-explainer/route.ts

## Documentation
USE:     DEPLOY_NOW.md              ← Most complete, written last (Oct 2026)
         DEPLOY_CHECKLIST.md        ← Earlier version, still useful
IGNORE:  DEPLOYMENT_WALKTHROUGH.md  ← Old draft
         FINANCEHUB_DEPLOYMENT_WALKTHROUGH.md  ← Old draft
         FINANCEHUB_DEEP_DIVE_1_REALITY_AUDIT.md  ← Research notes only
         FINANCEHUB_DEEP_DIVE_2_WORLDCLASS_ROADMAP.md  ← Research notes only

## CORRECTION: api_ai_financial_explainer_route.ts
This is NOT a duplicate of AIMentor_route.ts.
It is a SEPARATE feature: financial statement explainer.
Deploy as: app/api/ai-explainer/route.ts  (Pro feature — paste financial data, get analysis)
