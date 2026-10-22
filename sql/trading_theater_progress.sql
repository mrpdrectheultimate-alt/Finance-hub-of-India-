-- ============================================================
-- FinanceHub — 3D Animated Trading Theater Progress Schema
-- sql/trading_theater_progress.sql
--
-- Tracks user progress, checkpoint scores, and completion
-- across all 10 Trading Academy scenarios.
-- Run in Supabase SQL Editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_trading_progress (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id         TEXT NOT NULL,
  completed_steps     INTEGER NOT NULL DEFAULT 0,
  total_steps         INTEGER NOT NULL DEFAULT 0,
  checkpoints_passed  INTEGER NOT NULL DEFAULT 0,
  checkpoints_total   INTEGER NOT NULL DEFAULT 0,
  is_completed        BOOLEAN NOT NULL DEFAULT FALSE,
  last_step_index     INTEGER NOT NULL DEFAULT 0,
  quiz_answers        JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_scenario UNIQUE (user_id, scenario_id)
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_user_trading_progress_user
  ON public.user_trading_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_user_trading_progress_scenario
  ON public.user_trading_progress(scenario_id);

CREATE INDEX IF NOT EXISTS idx_user_trading_progress_completed
  ON public.user_trading_progress(user_id, is_completed);

-- Row Level Security (RLS)
ALTER TABLE public.user_trading_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Users can read own trading progress" ON public.user_trading_progress;
DROP POLICY IF EXISTS "Users can insert own trading progress" ON public.user_trading_progress;
DROP POLICY IF EXISTS "Users can update own trading progress" ON public.user_trading_progress;
DROP POLICY IF EXISTS "Users can delete own trading progress" ON public.user_trading_progress;

-- Policies ensuring users only access their own records
CREATE POLICY "Users can read own trading progress"
  ON public.user_trading_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trading progress"
  ON public.user_trading_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trading progress"
  ON public.user_trading_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trading progress"
  ON public.user_trading_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- Optional trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_trading_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_trading_progress_timestamp ON public.user_trading_progress;
CREATE TRIGGER trg_user_trading_progress_timestamp
  BEFORE UPDATE ON public.user_trading_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.set_trading_progress_timestamp();
