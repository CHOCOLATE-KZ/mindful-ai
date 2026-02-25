-- SQL: Add activity tracking fields to notes table
-- Run this in your Supabase SQL editor

-- Add new fields for comprehensive tracking
ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS energy integer CHECK (energy >= 1 AND energy <= 10),
  ADD COLUMN IF NOT EXISTS stress integer CHECK (stress >= 1 AND stress <= 10),
  ADD COLUMN IF NOT EXISTS nutrition text CHECK (nutrition IN ('great', 'fine', 'ok', 'poor')),
  ADD COLUMN IF NOT EXISTS exercise text CHECK (exercise IN ('great', 'fine', 'ok', 'poor')),
  ADD COLUMN IF NOT EXISTS hobbies text CHECK (hobbies IN ('great', 'fine', 'ok', 'poor')),
  ADD COLUMN IF NOT EXISTS social text CHECK (social IN ('great', 'fine', 'ok', 'poor'));

-- Update comment
COMMENT ON COLUMN notes.energy IS 'Energy level 1-10';
COMMENT ON COLUMN notes.stress IS 'Stress level 1-10';
COMMENT ON COLUMN notes.nutrition IS 'Balanced nutrition: great/fine/ok/poor';
COMMENT ON COLUMN notes.exercise IS 'Physical activity: great/fine/ok/poor';
COMMENT ON COLUMN notes.hobbies IS 'Hobbies/Entertainment: great/fine/ok/poor';
COMMENT ON COLUMN notes.social IS 'Socialization: great/fine/ok/poor';
