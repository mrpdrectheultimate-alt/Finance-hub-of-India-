-- ============================================================
-- FinanceHub Phase 4: Adaptive Learning Engine
-- Run AFTER phase1_critical_fixes.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS topics (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  track_slug  TEXT NOT NULL,
  difficulty  INT  DEFAULT 1,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS topic_prerequisites (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id        UUID REFERENCES topics(id) ON DELETE CASCADE,
  prerequisite_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  UNIQUE(topic_id, prerequisite_id)
);

CREATE TABLE IF NOT EXISTS lesson_topics (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id  UUID REFERENCES lessons(id) ON DELETE CASCADE,
  topic_id   UUID REFERENCES topics(id) ON DELETE CASCADE,
  is_primary BOOL DEFAULT TRUE,
  UNIQUE(lesson_id, topic_id)
);

CREATE TABLE IF NOT EXISTS user_mastery (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id        UUID REFERENCES topics(id) ON DELETE CASCADE,
  mastery_score   INT  DEFAULT 0,
  attempts        INT  DEFAULT 0,
  correct_answers INT  DEFAULT 0,
  last_tested     TIMESTAMPTZ,
  next_review     TIMESTAMPTZ,
  ease_factor     DECIMAL(4,2) DEFAULT 2.5,
  interval_days   INT DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

ALTER TABLE user_mastery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_mastery_own" ON user_mastery;
CREATE POLICY "user_mastery_own" ON user_mastery FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS review_queue (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id  UUID REFERENCES lessons(id) ON DELETE CASCADE,
  topic_id   UUID REFERENCES topics(id) ON DELETE CASCADE,
  due_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  priority   INT  DEFAULT 5,
  reason     TEXT,
  completed  BOOL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE review_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "review_queue_own" ON review_queue;
CREATE POLICY "review_queue_own" ON review_queue FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_learning_paths (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID REFERENCES profiles(id) ON DELETE CASCADE,
  goal               TEXT NOT NULL,
  persona            TEXT DEFAULT 'professional',
  recommended_tracks TEXT[],
  next_lesson_id     UUID REFERENCES lessons(id),
  ai_reasoning       TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_learning_paths ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "paths_own" ON user_learning_paths;
CREATE POLICY "paths_own" ON user_learning_paths FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_mastery_user_id    ON user_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mastery_topic_id   ON user_mastery(topic_id);
CREATE INDEX IF NOT EXISTS idx_user_mastery_next_review ON user_mastery(user_id, next_review);
CREATE INDEX IF NOT EXISTS idx_review_queue_user_date  ON review_queue(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_lesson_topics_lesson    ON lesson_topics(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_topics_topic     ON lesson_topics(topic_id);

-- SM-2 Mastery update function
CREATE OR REPLACE FUNCTION update_mastery_after_quiz(
  p_user_id  UUID,
  p_topic_id UUID,
  p_score    INT,
  p_passed   BOOL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_mastery      user_mastery%ROWTYPE;
  v_quality      INT;
  v_new_ease     DECIMAL;
  v_new_interval INT;
  v_new_mastery  INT;
  v_next_review  TIMESTAMPTZ;
BEGIN
  v_quality := CASE
    WHEN p_score >= 90 THEN 5 WHEN p_score >= 75 THEN 4
    WHEN p_score >= 60 THEN 3 WHEN p_score >= 40 THEN 2
    WHEN p_score >= 20 THEN 1 ELSE 0 END;

  SELECT * INTO v_mastery FROM user_mastery WHERE user_id = p_user_id AND topic_id = p_topic_id;

  IF NOT FOUND THEN
    v_new_ease := 2.5; v_new_interval := 1; v_new_mastery := LEAST(p_score, 40);
  ELSE
    v_new_ease := GREATEST(1.3, v_mastery.ease_factor + (0.1 - (5-v_quality)*(0.08+(5-v_quality)*0.02)));
    IF v_quality < 3 THEN v_new_interval := 1;
    ELSIF v_mastery.interval_days = 1 THEN v_new_interval := 6;
    ELSIF v_mastery.interval_days = 6 THEN v_new_interval := ROUND(6 * v_new_ease);
    ELSE v_new_interval := LEAST(ROUND(v_mastery.interval_days * v_new_ease), 365); END IF;
    v_new_mastery := LEAST(100, GREATEST(0, ROUND((v_mastery.mastery_score*0.6)+(p_score*0.4))));
  END IF;

  v_next_review := NOW() + (v_new_interval||' days')::INTERVAL;

  INSERT INTO user_mastery (user_id, topic_id, mastery_score, attempts, correct_answers, last_tested, next_review, ease_factor, interval_days)
  VALUES (p_user_id, p_topic_id, v_new_mastery, 1, CASE WHEN p_passed THEN 1 ELSE 0 END, NOW(), v_next_review, v_new_ease, v_new_interval)
  ON CONFLICT (user_id, topic_id) DO UPDATE SET
    mastery_score=v_new_mastery, attempts=user_mastery.attempts+1,
    correct_answers=user_mastery.correct_answers+CASE WHEN p_passed THEN 1 ELSE 0 END,
    last_tested=NOW(), next_review=v_next_review, ease_factor=v_new_ease,
    interval_days=v_new_interval, updated_at=NOW();

  IF p_score < 70 THEN
    INSERT INTO review_queue (user_id, lesson_id, topic_id, due_date, priority, reason)
    SELECT p_user_id, lt.lesson_id, p_topic_id, CURRENT_DATE+1, 8, 'failed_quiz'
    FROM lesson_topics lt WHERE lt.topic_id=p_topic_id AND lt.is_primary=TRUE LIMIT 1
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN jsonb_build_object('mastery_score',v_new_mastery,'interval_days',v_new_interval,'next_review',v_next_review,'needs_review',p_score<70);
END; $$;

-- Weak topics function
CREATE OR REPLACE FUNCTION get_weak_topics(p_user_id UUID)
RETURNS TABLE(topic_id UUID, topic_title TEXT, mastery_score INT, track_slug TEXT, lesson_id UUID, lesson_title TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.title, um.mastery_score, t.track_slug, l.id, l.title
  FROM user_mastery um
  JOIN topics t ON um.topic_id=t.id
  JOIN lesson_topics lt ON lt.topic_id=t.id AND lt.is_primary=TRUE
  JOIN lessons l ON lt.lesson_id=l.id
  WHERE um.user_id=p_user_id AND um.mastery_score<70 AND um.attempts>0
  ORDER BY um.mastery_score ASC LIMIT 10;
END; $$;

-- Due reviews function
CREATE OR REPLACE FUNCTION get_due_reviews(p_user_id UUID)
RETURNS TABLE(lesson_id UUID, lesson_title TEXT, topic_title TEXT, mastery_score INT, days_overdue INT, priority INT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT l.id, l.title, t.title, um.mastery_score,
    (CURRENT_DATE - um.next_review::DATE)::INT,
    CASE WHEN um.mastery_score<40 THEN 10 WHEN um.mastery_score<70 THEN 7 ELSE 5 END
  FROM user_mastery um
  JOIN topics t ON um.topic_id=t.id
  JOIN lesson_topics lt ON lt.topic_id=t.id AND lt.is_primary=TRUE
  JOIN lessons l ON lt.lesson_id=l.id
  WHERE um.user_id=p_user_id AND um.next_review<=NOW() AND l.is_published=TRUE
  ORDER BY um.mastery_score ASC, um.next_review ASC LIMIT 5;
END; $$;

-- Next lesson recommendation
CREATE OR REPLACE FUNCTION get_next_recommended_lesson(p_user_id UUID, p_track_slug TEXT DEFAULT NULL)
RETURNS TABLE(lesson_id UUID, lesson_title TEXT, level_title TEXT, track_title TEXT, reason TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_completed_ids UUID[];
BEGIN
  SELECT ARRAY_AGG(lesson_id) INTO v_completed_ids FROM user_progress WHERE user_id=p_user_id;

  RETURN QUERY
  SELECT l.id, l.title, lv.title, t.title, 'Due for review'::TEXT
  FROM review_queue rq
  JOIN lessons l ON rq.lesson_id=l.id
  JOIN levels lv ON l.level_id=lv.id
  JOIN tracks t ON lv.track_id=t.id
  WHERE rq.user_id=p_user_id AND rq.completed=FALSE AND rq.due_date<=CURRENT_DATE
    AND l.is_published=TRUE AND (p_track_slug IS NULL OR t.slug=p_track_slug)
  ORDER BY rq.priority DESC LIMIT 1;
  IF FOUND THEN RETURN; END IF;

  RETURN QUERY
  SELECT l.id, l.title, lv.title, t.title, 'Continue where you left off'::TEXT
  FROM lessons l
  JOIN levels lv ON l.level_id=lv.id
  JOIN tracks t ON lv.track_id=t.id
  WHERE l.is_published=TRUE
    AND (v_completed_ids IS NULL OR l.id!=ALL(v_completed_ids))
    AND (p_track_slug IS NULL OR t.slug=p_track_slug)
  ORDER BY lv.order_index, l.order_index LIMIT 1;
END; $$;

-- Dashboard data aggregator
CREATE OR REPLACE FUNCTION get_dashboard_data(p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_profile     profiles%ROWTYPE;
  v_completed   INT; v_total INT; v_weak INT; v_reviews INT;
  v_next        RECORD;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE id=p_user_id;
  SELECT COUNT(*) INTO v_completed FROM user_progress WHERE user_id=p_user_id;
  SELECT COUNT(*) INTO v_total FROM lessons WHERE is_published=TRUE;
  SELECT COUNT(*) INTO v_weak FROM user_mastery WHERE user_id=p_user_id AND mastery_score<70 AND attempts>0;
  SELECT COUNT(*) INTO v_reviews FROM user_mastery WHERE user_id=p_user_id AND next_review<=NOW();
  SELECT * INTO v_next FROM get_next_recommended_lesson(p_user_id) LIMIT 1;

  RETURN jsonb_build_object(
    'xp_total',v_profile.xp_total,'streak_current',v_profile.streak_current,
    'lessons_completed',v_completed,'lessons_total',v_total,
    'progress_pct',CASE WHEN v_total>0 THEN ROUND((v_completed::DECIMAL/v_total)*100) ELSE 0 END,
    'weak_topics',v_weak,'due_reviews',v_reviews,'role',v_profile.role,
    'next_lesson_id',v_next.lesson_id,'next_lesson_title',v_next.lesson_title,
    'next_lesson_reason',v_next.reason
  );
END; $$;

-- Topic taxonomy seed
INSERT INTO topics (slug, title, track_slug, difficulty) VALUES
('budgeting','Budgeting and expense tracking','personal-finance',1),
('savings','Savings strategy','personal-finance',1),
('emergency-fund','Emergency fund','personal-finance',1),
('compound-interest','Compound interest','personal-finance',1),
('sip-investing','SIP and mutual fund investing','personal-finance',1),
('insurance-basics','Insurance fundamentals','personal-finance',2),
('tax-planning','Income tax planning','personal-finance',2),
('retirement-planning','Retirement planning','personal-finance',2),
('stock-market-basics','Stock market fundamentals','trading-markets',1),
('how-prices-move','How share prices move','trading-markets',1),
('market-indices','NIFTY 50 and market indices','trading-markets',1),
('order-types','Order types and execution','trading-markets',1),
('demat-account','Demat and trading accounts','trading-markets',1),
('technical-analysis','Technical analysis basics','trading-markets',2),
('fundamental-analysis','Fundamental analysis','trading-markets',2),
('options-basics','Options and derivatives','trading-markets',3),
('blockchain-basics','Blockchain technology','crypto-defi',1),
('bitcoin','Bitcoin fundamentals','crypto-defi',1),
('ethereum','Ethereum and smart contracts','crypto-defi',1),
('crypto-wallets','Crypto wallets and custody','crypto-defi',1),
('defi-basics','DeFi fundamentals','crypto-defi',2),
('crypto-risks','Crypto risk management','crypto-defi',2),
('financial-statements','Reading financial statements','corporate-finance',1),
('unit-economics','Unit economics','corporate-finance',1),
('startup-funding','Startup fundraising','corporate-finance',2),
('valuation','Business valuation','corporate-finance',2),
('cap-tables','Cap tables and equity','corporate-finance',2)
ON CONFLICT (slug) DO NOTHING;

-- Prerequisite graph
INSERT INTO topic_prerequisites (topic_id, prerequisite_id)
SELECT t.id, p.id FROM topics t, topics p WHERE
  (t.slug='compound-interest' AND p.slug='savings') OR
  (t.slug='sip-investing' AND p.slug='compound-interest') OR
  (t.slug='tax-planning' AND p.slug='budgeting') OR
  (t.slug='retirement-planning' AND p.slug='sip-investing') OR
  (t.slug='technical-analysis' AND p.slug='how-prices-move') OR
  (t.slug='fundamental-analysis' AND p.slug='financial-statements') OR
  (t.slug='options-basics' AND p.slug='stock-market-basics') OR
  (t.slug='options-basics' AND p.slug='technical-analysis') OR
  (t.slug='defi-basics' AND p.slug='blockchain-basics') OR
  (t.slug='defi-basics' AND p.slug='ethereum') OR
  (t.slug='valuation' AND p.slug='financial-statements') OR
  (t.slug='cap-tables' AND p.slug='startup-funding')
ON CONFLICT DO NOTHING;
