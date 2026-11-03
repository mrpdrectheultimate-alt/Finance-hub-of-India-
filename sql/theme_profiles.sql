-- ============================================================
-- FinanceHub — Theme Modes Schema Migration
-- sql/theme_profiles.sql
-- Run in Supabase SQL Editor
-- ============================================================

-- Add theme preference to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light'
CHECK (theme IN ('light', 'dark', 'sepia', 'focus'));

-- Verify column presence
SELECT id, email, theme FROM profiles LIMIT 5;
