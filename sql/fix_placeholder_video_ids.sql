-- ============================================================
-- FinanceHub — Fix Placeholder Video IDs
-- fix_placeholder_video_ids.sql
-- Run AFTER: concepts_careers_videos.sql
-- Run BEFORE: video_library_expansion.sql
--
-- Problem: concepts_careers_videos.sql inserted ~70 videos
-- with FAKE YouTube IDs like 'ppf-elss-nps-hindi',
-- 'sip-step-hindi', etc. These cause the broken embed
-- black boxes that give FinanceHub a broken look.
--
-- This file: unpublishes all fake IDs, then prepares the
-- schema for video_library_expansion.sql to insert the
-- correct real YouTube IDs as replacements.
-- ============================================================

-- STEP 1: Unpublish all fake placeholder IDs
-- (fake IDs never match real YouTube format: 11-char alphanumeric)
-- Real YouTube IDs are exactly 11 characters: [A-Za-z0-9_-]{11}
-- Playlists start with PL and are longer
-- Anything else = placeholder

-- Safely ensure video_library has is_published column if table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'video_library'
  ) THEN
    ALTER TABLE video_library ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;

    UPDATE video_library
    SET is_active = FALSE, is_published = FALSE
    WHERE youtube_id IN (
      'ppf-elss-nps-hindi','sip-step-hindi','itr-file-hindi',
      'term-insurance-hindi','home-loan-guide-hindi','credit-score-hindi',
      'emergency-fund-hindi','gold-invest-hindi','mutual-fund-types-hindi',
      'share-market-beginners-hindi','options-hindi-basics','tax-regime-hindi',
      'gold-comparison-hindi','rbi-rates-affect','india-gdp-explained',
      'inflation-wealth-destroyer','markets-predict-economy',
      'union-budget-guide','fire-india-retire-40','nps-ppf-elss-retirement',
      'retirement-corpus-india','swp-strategy-mutual-fund',
      'rent-vs-buy-india','realestate-vs-mf-30yr',
      'home-loan-prepayment','reit-vs-property',
      'fo-beginners-india','options-greeks-simple',
      'value-investing-india-lecture','annual-report-guide',
      'ratio-analysis-stocks','index-vs-active-evidence',
      'demat-explained','ipo-analysis-framework',
      'cap-categories-india','chart-patterns-backtested',
      'fibonacci-complete-guide','rsi-strategy-india',
      'macd-strategy-nse','volume-analysis-pro','sr-masterclass',
      'eth2-pos-explained','defi-beginners-2024',
      'crypto-tax-india-itr','layer2-explained',
      'crypto-portfolio-strategy','erupee-cbdc-india',
      'crypto-scams-redflag','porters-five-forces-india',
      'esg-india-worth','esop-explained-india',
      'balance-sheet-india','ma-india-explained','dcf-indian-stock',
      'loss-aversion-investing','fomo-investing-avoid',
      'confirmation-bias-stocks','anchoring-bias-investing',
      'mental-accounting-finance','buffett-psychology',
      'forex-india-legal','usdinr-analysis','fema-indians-guide',
      'currency-hedging-business','global-forex-how',
      'emergency-corpus-build','health-insurance-2024',
      'reit-india-2024','salary-tax-optimize','upi-fraud-protect'
    );
  END IF;
END $$;

-- Also fix in curated_playlists if they were inserted there
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'curated_playlists'
  ) THEN
    ALTER TABLE curated_playlists ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
    ALTER TABLE curated_playlists ADD COLUMN IF NOT EXISTS embed_id TEXT;

    UPDATE curated_playlists
    SET is_published = FALSE
    WHERE embed_id IN (
      'ppf-elss-nps-hindi','sip-step-hindi','itr-file-hindi',
      'term-insurance-hindi','home-loan-guide-hindi','credit-score-hindi',
      'emergency-fund-hindi','gold-invest-hindi','mutual-fund-types-hindi',
      'share-market-beginners-hindi','options-hindi-basics','tax-regime-hindi',
      'gold-comparison-hindi','rbi-rates-affect','india-gdp-explained',
      'inflation-wealth-destroyer','markets-predict-economy',
      'union-budget-guide','fire-india-retire-40','nps-ppf-elss-retirement',
      'retirement-corpus-india','swp-strategy-mutual-fund',
      'rent-vs-buy-india','realestate-vs-mf-30yr',
      'home-loan-prepayment','reit-vs-property',
      'fo-beginners-india','options-greeks-simple',
      'value-investing-india-lecture','annual-report-guide',
      'ratio-analysis-stocks','index-vs-active-evidence',
      'demat-explained','ipo-analysis-framework',
      'cap-categories-india','chart-patterns-backtested',
      'fibonacci-complete-guide','rsi-strategy-india',
      'macd-strategy-nse','volume-analysis-pro','sr-masterclass',
      'eth2-pos-explained','defi-beginners-2024',
      'crypto-tax-india-itr','layer2-explained',
      'crypto-portfolio-strategy','erupee-cbdc-india',
      'crypto-scams-redflag','porters-five-forces-india',
      'esg-india-worth','esop-explained-india',
      'balance-sheet-india','ma-india-explained','dcf-indian-stock',
      'loss-aversion-investing','fomo-investing-avoid',
      'confirmation-bias-stocks','anchoring-bias-investing',
      'mental-accounting-finance','buffett-psychology',
      'forex-india-legal','usdinr-analysis','fema-indians-guide',
      'currency-hedging-business','global-forex-how',
      'emergency-corpus-build','health-insurance-2024',
      'reit-india-2024','salary-tax-optimize','upi-fraud-protect'
    );

    -- Defense in depth: catch any remaining non-standard slugs that are not valid YouTube IDs or Playlists
    UPDATE curated_playlists
    SET is_published = FALSE
    WHERE is_published = TRUE
      AND (
        (length(embed_id) > 20 AND embed_id NOT LIKE 'PL%')
        OR embed_id LIKE '%-%-%-hindi'
        OR embed_id LIKE '%-%-india%'
        OR embed_id LIKE '%-guide-%'
        OR embed_id LIKE '%-strategy-%'
        OR embed_id LIKE '%-basics-%'
      );
  END IF;
END $$;

-- STEP 2: Verify the fix
DO $$
DECLARE
  fake_count  INT := 0;
  total_live  INT := 0;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'curated_playlists'
  ) THEN
    -- Count remaining fake IDs (should be 0 after fix)
    SELECT COUNT(*) INTO fake_count
    FROM curated_playlists
    WHERE is_published = TRUE
      AND (
        length(embed_id) > 20 AND embed_id NOT LIKE 'PL%'
        OR embed_id LIKE '%-%-%-hindi'
        OR embed_id LIKE '%-%-india%'
      );

    SELECT COUNT(*) INTO total_live
    FROM curated_playlists
    WHERE is_published = TRUE;
  END IF;

  RAISE NOTICE '✅ Placeholder fix complete';
  RAISE NOTICE '   Remaining fake/broken IDs published: % (should be 0)', fake_count;
  RAISE NOTICE '   Total published videos after cleanup: %', total_live;
  RAISE NOTICE '';
  RAISE NOTICE '   Now run: video_library_expansion.sql';
  RAISE NOTICE '   This adds 113+ real verified YouTube IDs';
END $$;
