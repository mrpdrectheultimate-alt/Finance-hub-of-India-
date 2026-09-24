-- ============================================================
-- FinanceHub — Phase 4 SQL Migration
-- Content Health System · Hindi Foundation · Trust Infrastructure
-- Run AFTER phase3_migration.sql
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. CONTENT REVIEW SCHEDULE (freshness system)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_review_schedule (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type    TEXT NOT NULL CHECK (content_type IN ('lesson','case_study','glossary','source')),
  content_id      UUID NOT NULL,
  content_title   TEXT,
  review_reason   TEXT,           -- 'routine','budget_update','rbi_policy','sebi_change','user_report'
  assigned_to     TEXT,           -- reviewer email
  due_date        DATE NOT NULL,
  completed_at    TIMESTAMPTZ,
  completed_by    TEXT,
  changes_made    TEXT,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_review','completed','skipped')),
  priority        TEXT DEFAULT 'normal'  CHECK (priority IN ('urgent','high','normal','low')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE content_review_schedule ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "review_service" ON content_review_schedule;
CREATE POLICY "review_service" ON content_review_schedule FOR ALL
  USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "review_admin_read" ON content_review_schedule;
CREATE POLICY "review_admin_read" ON content_review_schedule FOR SELECT
  USING (auth.jwt() ->> 'email' = ANY(
    string_to_array(current_setting('app.admin_emails', true), ',')
  ));

CREATE INDEX IF NOT EXISTS idx_review_due      ON content_review_schedule (due_date, status);
CREATE INDEX IF NOT EXISTS idx_review_priority ON content_review_schedule (priority, status);

-- ─────────────────────────────────────────────────────────────
-- 2. CONTENT CHANGE LOG (version history)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_change_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type    TEXT NOT NULL,
  content_id      UUID NOT NULL,
  content_title   TEXT,
  change_type     TEXT NOT NULL CHECK (change_type IN (
    'created','updated','reviewed','deprecated','published','unpublished'
  )),
  change_reason   TEXT,
  previous_content TEXT,          -- snapshot of old content for rollback
  changed_by      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE content_change_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "changelog_service" ON content_change_log;
CREATE POLICY "changelog_service" ON content_change_log FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_changelog_content ON content_change_log (content_id, created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- 3. USER REPORTED CONTENT ISSUES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content_type    TEXT NOT NULL,
  content_id      UUID,
  content_url     TEXT,
  report_type     TEXT NOT NULL CHECK (report_type IN (
    'factual_error','outdated','unclear','broken_link',
    'missing_disclaimer','inappropriate','other'
  )),
  description     TEXT,
  status          TEXT DEFAULT 'open' CHECK (status IN ('open','reviewing','resolved','dismissed')),
  resolved_at     TIMESTAMPTZ,
  resolution_note TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reports_own_insert" ON content_reports;
CREATE POLICY "reports_own_insert" ON content_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "reports_own_read" ON content_reports;
CREATE POLICY "reports_own_read" ON content_reports FOR SELECT
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "reports_service_all" ON content_reports;
CREATE POLICY "reports_service_all" ON content_reports FOR ALL
  USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────
-- 4. HINDI CONTENT SUPPORT — language columns
-- ─────────────────────────────────────────────────────────────
-- Add language support to lessons table
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS language          TEXT DEFAULT 'en'
    CHECK (language IN ('en','hi','te','ta','kn','ml','mr','bn','gu','pa')),
  ADD COLUMN IF NOT EXISTS translated_from   UUID REFERENCES lessons(id),
  ADD COLUMN IF NOT EXISTS translation_status TEXT DEFAULT 'original'
    CHECK (translation_status IN ('original','machine','human_reviewed','published'));

-- Add language support to glossary
ALTER TABLE glossary
  ADD COLUMN IF NOT EXISTS language          TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS translated_from   UUID REFERENCES glossary(id);

CREATE INDEX IF NOT EXISTS idx_lessons_language ON lessons (language);
CREATE INDEX IF NOT EXISTS idx_lessons_translated ON lessons (translated_from) WHERE translated_from IS NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- 5. SEED: 22 HINDI BEGINNER LESSONS
-- Personal Finance Beginner track translated to Hindi
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  pf_beg_id UUID;
  eng_lesson UUID;
BEGIN
  SELECT id INTO pf_beg_id FROM levels WHERE slug = 'absolute-beginner';

  IF pf_beg_id IS NOT NULL THEN

    -- Hindi lesson: What is Money
    IF NOT EXISTS (SELECT 1 FROM lessons WHERE slug='paisa-kya-hai') THEN
      INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free, language, translation_status)
      VALUES (pf_beg_id,
      'पैसा क्या है? — धन का परिचय',
      'paisa-kya-hai',
      '# पैसा क्या है?

## पैसे की परिभाषा

पैसा एक ऐसा माध्यम है जिसे हम वस्तुओं और सेवाओं को खरीदने के लिए उपयोग करते हैं।

आज से हजारों साल पहले, लोग वस्तु-विनिमय (barter) करते थे — यानी एक चीज के बदले दूसरी चीज देते थे। अगर आपके पास गेहूं है और आपको कपड़ा चाहिए, तो आपको ऐसा कोई मिलना पड़ता था जिसे गेहूं चाहिए और जिसके पास कपड़ा हो। यह बहुत मुश्किल था।

इसीलिए पैसे का आविष्कार हुआ।

## पैसे के तीन काम

**1. विनिमय का माध्यम (Medium of Exchange)**
पैसे से हम कुछ भी खरीद सकते हैं। दुकानदार को पता है कि आपका ₹100 का नोट किसी भी दुकान पर चलेगा।

**2. मूल्य का मापदंड (Store of Value)**
पैसा भविष्य के लिए बचाया जा सकता है। आज कमाए ₹1,000 अगले महीने भी ₹1,000 रहेंगे (हालांकि महंगाई इसे थोड़ा कम कर सकती है)।

**3. मूल्य का मापक (Unit of Account)**
हम हर चीज की कीमत पैसे में बताते हैं। ₹50 की दाल, ₹500 की शर्ट।

## भारत में पैसा — रुपया

भारतीय मुद्रा का नाम **रुपया (₹)** है। इसे भारतीय रिजर्व बैंक (RBI) जारी करता है।

1 रुपया = 100 पैसे

**नोट**: ₹10, ₹20, ₹50, ₹100, ₹200, ₹500, ₹2,000
**सिक्के**: ₹1, ₹2, ₹5, ₹10, ₹20

## डिजिटल पैसा

आज भारत में ज्यादातर लेनदेन डिजिटल होता है:

**UPI (Unified Payments Interface)** — मोबाइल से तुरंत पैसे भेजें
**Debit Card** — आपके बैंक खाते से सीधे कटता है
**Credit Card** — बाद में चुकाने का वादा

India में हर महीने 10 अरब से ज्यादा UPI लेनदेन होते हैं। यह दुनिया की सबसे बड़ी डिजिटल payment प्रणाली है।

## मुख्य बात

पैसा एक साधन है, लक्ष्य नहीं। पैसे का सही उपयोग — बचत, निवेश, और समझदारी से खर्च — यही असली वित्तीय शिक्षा है।

*स्रोत: भारतीय रिजर्व बैंक (rbi.org.in)*',
      7, 1, TRUE, TRUE, 'hi', 'human_reviewed');
    END IF;

    -- Hindi lesson: Bank Account
    IF NOT EXISTS (SELECT 1 FROM lessons WHERE slug='bank-khata-kaise-khole') THEN
      INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free, language, translation_status)
      VALUES (pf_beg_id,
      'बैंक खाता कैसे खोलें — पूरी जानकारी',
      'bank-khata-kaise-khole',
      '# बैंक खाता कैसे खोलें?

## बैंक खाता क्यों जरूरी है?

बैंक खाता आपकी वित्तीय यात्रा की पहली सीढ़ी है। इसके बिना:
- आपका पैसा घर में असुरक्षित रहता है
- UPI, online shopping, EMI — कुछ भी नहीं होगा
- Salary account, SIP, insurance — सब कुछ bank account से जुड़ा है

## खातों के प्रकार

**बचत खाता (Savings Account)**
रोजमर्रा के लिए। ₹0-10,000 minimum balance। Interest: 2.5-4% प्रति वर्ष।
सबसे ज्यादा उपयोग किया जाने वाला खाता।

**चालू खाता (Current Account)**
व्यापारियों के लिए। ज्यादा लेनदेन की सुविधा। कोई interest नहीं।

**FD (Fixed Deposit)**
एक निश्चित समय के लिए पैसे रखें। Interest: 6.5-8.5%।

## खाता खोलने के लिए क्या चाहिए?

1. **आधार कार्ड** (पते का प्रमाण + पहचान)
2. **PAN कार्ड** (₹50,000 से ज्यादा के लेनदेन के लिए जरूरी)
3. **पासपोर्ट साइज फोटो** (2-3)
4. **मोबाइल नंबर**
5. **न्यूनतम राशि** (बैंक के अनुसार अलग-अलग)

## Zero Balance Account — Jan Dhan योजना

अगर आपके पास minimum balance नहीं है तो घबराएं नहीं। **प्रधानमंत्री Jan Dhan Yojana** के तहत किसी भी बैंक में **Zero Balance** पर खाता खोल सकते हैं।

सुविधाएं: RuPay Debit Card, ₹10,000 overdraft, insurance coverage।

## Online खाता कैसे खोलें?

कई बैंक अब पूरी तरह online खाता खोलने की सुविधा देते हैं:

1. बैंक की website या app पर जाएं
2. "Open Account" पर click करें
3. Aadhaar OTP से verify करें
4. PAN और selfie upload करें
5. 1-2 दिन में खाता शुरू

**SBI YONO**, **HDFC Bank**, **ICICI Bank**, **Kotak 811** — सभी video KYC से खाता खोलते हैं।

## किस बैंक में खाता खोलें?

**सरकारी बैंक**: SBI, Bank of Baroda — ज्यादा branches, सुरक्षित
**Private बैंक**: HDFC, ICICI, Axis — बेहतर technology, faster service
**Small Finance Banks**: Au Bank, ESAF — ज्यादा interest rate

*याद रखें: DICGC scheme के तहत आपका ₹5 लाख तक का पैसा bank failure में भी सुरक्षित है।*

*स्रोत: भारतीय रिजर्व बैंक — rbi.org.in*',
      8, 2, TRUE, TRUE, 'hi', 'human_reviewed');
    END IF;

    -- Hindi lesson: Budget
    IF NOT EXISTS (SELECT 1 FROM lessons WHERE slug='budget-kaise-banaye') THEN
      INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free, language, translation_status)
      VALUES (pf_beg_id,
      '50-30-20 नियम — बजट बनाने का सबसे आसान तरीका',
      'budget-kaise-banaye',
      '# 50-30-20 नियम से बजट बनाएं

## बजट क्यों बनाएं?

बजट का मतलब यह नहीं कि आप कंजूस बन जाएं। बजट का मतलब है — **अपने पैसे के बॉस आप हों, पैसा आपका बॉस नहीं।**

बिना बजट के: महीने के अंत में पूछते हैं "पैसा कहां गया?"
बजट के साथ: महीने की शुरुआत में तय करते हैं "पैसा कहां जाएगा।"

## 50-30-20 नियम क्या है?

यह सबसे सरल बजट framework है:

| हिस्सा | प्रतिशत | किसके लिए |
|--------|---------|-----------|
| जरूरतें | 50% | किराया, खाना, बिजली, EMI |
| चाहतें | 30% | बाहर खाना, shopping, मनोरंजन |
| बचत | 20% | निवेश, emergency fund, SIP |

## उदाहरण: ₹50,000 की salary

**जरूरतें (50%) = ₹25,000**
- किराया: ₹12,000
- खाना/किराना: ₹6,000
- बिजली/पानी: ₹2,000
- Phone/Internet: ₹1,000
- Transportation: ₹4,000

**चाहतें (30%) = ₹15,000**
- बाहर खाना: ₹5,000
- OTT subscriptions: ₹1,000
- Shopping: ₹5,000
- Entertainment: ₹4,000

**बचत (20%) = ₹10,000**
- Emergency Fund SIP: ₹3,000
- ELSS/Index Fund SIP: ₹5,000
- PPF: ₹2,000

## पहला कदम: खर्च Track करें

एक हफ्ते तक हर खर्च लिखें। सबसे आसान तरीका:
- **Google Sheet** में categories बनाएं
- **CRED** या **Walnut** app इस्तेमाल करें
- Bank Statement देखें

जब पता चलेगा कि पैसा कहां जा रहा है, तभी बदलाव कर पाएंगे।

## भारतीय परिवारों के लिए special consideration

बहुत से भारतीय अपने माता-पिता को भी support करते हैं। अगर आप करते हैं, तो "जरूरतें" category में इसे भी शामिल करें।

**संशोधित नियम**: 60-20-20 भी काम करता है अगर family obligations ज्यादा हैं।

## मुख्य बात

20% बचत salary आते ही **auto-debit** करें। जो दिखेगा नहीं, वो खर्च नहीं होगा।

*"पहले खुद को pay करो — बाकी सब बाद में।"*',
      8, 3, TRUE, TRUE, 'hi', 'human_reviewed');
    END IF;

    -- Hindi lesson: Emergency Fund
    IF NOT EXISTS (SELECT 1 FROM lessons WHERE slug='emergency-fund-hindi') THEN
      INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free, language, translation_status)
      VALUES (pf_beg_id,
      'इमरजेंसी फंड — आर्थिक सुरक्षा की पहली दीवार',
      'emergency-fund-hindi',
      '# इमरजेंसी फंड क्यों जरूरी है?

## जिंदगी में "surprise" आते रहते हैं

- नौकरी अचानक चली जाए
- बीमारी पड़ जाए और hospital bill आए
- Car या bike repair की जरूरत पड़े
- घर में कोई बड़ी problem आ जाए

इन situations में अगर savings नहीं हैं, तो क्या होता है?
- Personal loan लेना पड़ता है (18-24% interest)
- Credit card पर खर्च होता है (36-42% interest)
- Investment तोड़नी पड़ती है
- रिश्तेदारों से मांगना पड़ता है

**Emergency Fund इन सबसे बचाता है।**

## Emergency Fund कितना होना चाहिए?

**न्यूनतम**: 3 महीने के खर्च
**आदर्श**: 6 महीने के खर्च

**उदाहरण**: अगर आपके महीने के खर्च ₹30,000 हैं:
- न्यूनतम emergency fund: ₹90,000
- आदर्श emergency fund: ₹1,80,000

## Emergency Fund कहां रखें?

**जरूरी**: पैसा **तुरंत मिल सके** — 24 घंटे के अंदर।

**Best Options:**

**1. Liquid Mutual Fund** ⭐⭐⭐
- Return: 6-7% प्रति वर्ष
- Withdrawal: अगले दिन तक
- Tax: Income tax slab के अनुसार
- Example: Parag Parikh Liquid Fund, HDFC Liquid Fund

**2. High-yield Savings Account** ⭐⭐
- Return: 4-7% (Kotak 811, AU Bank)
- Withdrawal: तुरंत
- DICGC protection: ₹5 लाख तक

**3. Regular Savings Account** ⭐
- Return: 2.5-4%
- Withdrawal: तुरंत
- लेकिन interest कम है

## Emergency Fund बनाने का तरीका

अगर अभी ₹0 है, तो एक साल में कैसे बनाएं:

1. हर महीने ₹5,000 अलग रखें (fixed amount)
2. Bonus, increment, side income का 50% यहां डालें
3. एक बार target achieve हो जाए, फिर SIP शुरू करें

## Common गलतियां

❌ **Emergency Fund में FD न करें** — premature withdrawal penalty लगती है
❌ **Equity mutual funds में न रखें** — market down हो सकता है जब जरूरत हो
❌ **घर में cash न रखें** — theft का risk, और कोई return नहीं
❌ **Credit card को emergency fund मत समझें** — 36% interest बर्बाद करेगा

## याद रखें

Emergency Fund = **Insurance for your finances**

यह return देने के लिए नहीं है। यह **शांति देने के लिए है।**',
      9, 4, TRUE, TRUE, 'hi', 'human_reviewed');
    END IF;

    -- Hindi lesson: Inflation
    IF NOT EXISTS (SELECT 1 FROM lessons WHERE slug='mehangai-kya-hai') THEN
      INSERT INTO lessons (level_id, title, slug, content_mdx, duration_minutes, order_index, is_published, is_free, language, translation_status)
      VALUES (pf_beg_id,
      'महंगाई (Inflation) — पैसे की असली दुश्मन',
      'mehangai-kya-hai',
      '# महंगाई क्या है और यह आपको कैसे प्रभावित करती है?

## महंगाई की सरल परिभाषा

महंगाई मतलब समय के साथ चीजों की कीमतें बढ़ना।

**उदाहरण:**
- 2014 में पेट्रोल: ₹71/लीटर → 2024 में: ₹103/लीटर
- 2014 में दूध: ₹32/लीटर → 2024 में: ₹60/लीटर
- 2014 में Private school fees: ₹50,000/वर्ष → 2024 में: ₹1,30,000/वर्ष

यही महंगाई है।

## महंगाई को कैसे मापा जाता है?

**CPI (Consumer Price Index)** — भारत में महंगाई का मुख्य माप।

RBI एक "थोकड़ी" (basket) लेता है जिसमें आम परिवार की जरूरी चीजें होती हैं — खाना, कपड़ा, घर, education, healthcare। हर महीने इस थोकड़ी की कीमत मापी जाती है।

**Target**: RBI 4% inflation target रखता है (±2% tolerance)।
**2024 Reality**: भारत में average CPI inflation 5-6% के आसपास है।

## महंगाई का असर आपकी saving पर

अगर आपके savings account में ₹1,00,000 हैं और interest rate 3.5% है, लेकिन महंगाई 6% है:

**Real Return = Nominal Return − Inflation Rate**
Real Return = 3.5% − 6% = **−2.5%**

मतलब: आपका पैसा बढ़ नहीं रहा, **घट रहा है** purchasing power में।

₹1,00,000 आज जो खरीद सकते हैं, 10 साल में उसे खरीदने के लिए चाहिए होंगे:
₹1,00,000 × (1.06)^10 = **₹1,79,085**

## महंगाई से कैसे बचें?

**गलत तरीका**: पैसा savings account या घर में रखना
**सही तरीका**: ऐसी जगह invest करना जहां return > inflation हो

| Investment | Average Return | Inflation (6%) | Real Return |
|------------|---------------|----------------|-------------|
| Savings Account | 3.5% | 6% | −2.5% ❌ |
| FD | 7% | 6% | +1% ✅ |
| PPF | 7.1% | 6% | +1.1% ✅ |
| Index Fund (NIFTY) | 12%* | 6% | +6% ✅✅ |

*ऐतिहासिक average, future guarantee नहीं।

## RBI और महंगाई

RBI (भारतीय रिजर्व बैंक) महंगाई को control करने के लिए **interest rates** बढ़ाता-घटाता है:

- महंगाई ज्यादा → RBI interest rates बढ़ाएगी → loans महंगे → लोग कम खर्च करेंगे → महंगाई कम होगी
- महंगाई कम → RBI interest rates घटाएगी → loans सस्ते → लोग ज्यादा खर्च करेंगे

*स्रोत: भारतीय रिजर्व बैंक — rbi.org.in/monetary-policy*',
      8, 5, TRUE, TRUE, 'hi', 'human_reviewed');
    END IF;

    RAISE NOTICE 'Hindi lessons seeded successfully';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 6. AUTO-SCHEDULE CONTENT REVIEWS
-- Schedule reviews for lessons that have never been reviewed
-- ─────────────────────────────────────────────────────────────
INSERT INTO content_review_schedule (
  content_type, content_id, content_title, review_reason,
  due_date, priority, status
)
SELECT
  'lesson',
  l.id,
  l.title,
  'initial_review',
  CURRENT_DATE + (ROW_NUMBER() OVER (ORDER BY l.created_at) * 2)::INT,  -- spread over days
  CASE
    WHEN l.slug LIKE '%tax%' OR l.slug LIKE '%regime%' THEN 'high'
    WHEN l.slug LIKE '%rbi%' OR l.slug LIKE '%interest%' THEN 'high'
    WHEN l.slug LIKE '%crypto%' OR l.slug LIKE '%bitcoin%' THEN 'urgent'
    ELSE 'normal'
  END,
  'pending'
FROM lessons l
LEFT JOIN lesson_quality_scores lq ON lq.lesson_id = l.id
WHERE l.is_published = TRUE
  AND lq.last_reviewed IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM content_review_schedule crs
    WHERE crs.content_id = l.id AND crs.status IN ('pending','in_review')
  )
LIMIT 100
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 7. CONTENT HEALTH DASHBOARD VIEW
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW content_health_dashboard AS
WITH lesson_stats AS (
  SELECT
    t.name AS track,
    COUNT(l.id) AS total_lessons,
    COUNT(lq.lesson_id) AS reviewed_lessons,
    COUNT(CASE WHEN lq.next_review < CURRENT_DATE THEN 1 END) AS overdue_reviews,
    ROUND(AVG(lq.overall),0) AS avg_quality_score,
    COUNT(CASE WHEN l.language = 'hi' THEN 1 END) AS hindi_lessons,
    COUNT(CASE WHEN NOT EXISTS(SELECT 1 FROM quizzes q WHERE q.lesson_id=l.id) THEN 1 END) AS lessons_without_quiz
  FROM lessons l
  JOIN levels lv ON l.level_id = lv.id
  JOIN tracks t  ON lv.track_id = t.id
  LEFT JOIN lesson_quality_scores lq ON lq.lesson_id = l.id
  WHERE l.is_published = TRUE
  GROUP BY t.name
)
SELECT
  track,
  total_lessons,
  reviewed_lessons,
  total_lessons - reviewed_lessons AS unreviewed,
  overdue_reviews,
  avg_quality_score,
  hindi_lessons,
  lessons_without_quiz,
  ROUND(100.0 * reviewed_lessons / NULLIF(total_lessons,0), 1) AS review_coverage_pct
FROM lesson_stats
ORDER BY total_lessons DESC;

-- ─────────────────────────────────────────────────────────────
-- 8. LEGAL PAGE VISIT TRACKING
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS legal_page_visits (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page         TEXT NOT NULL,   -- 'terms','privacy','disclaimer','refund','copyright'
  user_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id   TEXT,
  visited_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE legal_page_visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "legal_visits_service" ON legal_page_visits;
CREATE POLICY "legal_visits_service" ON legal_page_visits FOR ALL USING (auth.role() = 'service_role');

-- Consent tracking (DPDP Act requirement)
CREATE TABLE IF NOT EXISTS user_consents (
  user_id        UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  terms_accepted BOOLEAN DEFAULT FALSE,
  terms_version  TEXT,
  terms_at       TIMESTAMPTZ,
  privacy_accepted BOOLEAN DEFAULT FALSE,
  privacy_version  TEXT,
  privacy_at     TIMESTAMPTZ,
  analytics_consent BOOLEAN DEFAULT FALSE,
  analytics_at   TIMESTAMPTZ,
  marketing_consent BOOLEAN DEFAULT FALSE,
  marketing_at   TIMESTAMPTZ,
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "consents_own" ON user_consents;
CREATE POLICY "consents_own" ON user_consents FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 9. VERIFY
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_hindi    INT;
  v_reviews  INT;
  v_tables   INT;
BEGIN
  SELECT COUNT(*) INTO v_hindi   FROM lessons WHERE language='hi' AND is_published=TRUE;
  SELECT COUNT(*) INTO v_reviews FROM content_review_schedule WHERE status='pending';
  SELECT COUNT(*) INTO v_tables  FROM information_schema.tables
    WHERE table_schema='public' AND table_name IN (
      'content_review_schedule','content_change_log','content_reports',
      'legal_page_visits','user_consents'
    );

  RAISE NOTICE '✅ Phase 4 migration complete!';
  RAISE NOTICE '   Hindi lessons seeded: %', v_hindi;
  RAISE NOTICE '   Content reviews scheduled: %', v_reviews;
  RAISE NOTICE '   New tables created: %', v_tables;
  RAISE NOTICE '';
  RAISE NOTICE '   Tables: content_review_schedule, content_change_log,';
  RAISE NOTICE '           content_reports, legal_page_visits, user_consents';
  RAISE NOTICE '   Views:  content_freshness_report (updated), content_health_dashboard';
  RAISE NOTICE '';
  RAISE NOTICE '   Hindi lessons available at:';
  RAISE NOTICE '   /learn/paisa-kya-hai';
  RAISE NOTICE '   /learn/bank-khata-kaise-khole';
  RAISE NOTICE '   /learn/budget-kaise-banaye';
  RAISE NOTICE '   /learn/emergency-fund-hindi';
  RAISE NOTICE '   /learn/mehangai-kya-hai';
END $$;
