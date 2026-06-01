-- Adaptive tests: unlock after chat + AI recommendations

ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS tests_unlocked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tests_unlock_message_count INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN user_settings.tests_unlocked_at IS 'When diagnostic tests were unlocked (after enough AI chat)';
COMMENT ON COLUMN user_settings.tests_unlock_message_count IS 'User message count in ai_messages at unlock time';

CREATE TABLE IF NOT EXISTS ai_test_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'skipped')),
  approach TEXT NOT NULL CHECK (approach IN ('catalog', 'generated')),
  catalog_key TEXT,
  generated_test JSONB,
  rationale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ai_test_recommendations_user_status_idx
  ON ai_test_recommendations (user_id, status, created_at DESC);

ALTER TABLE ai_test_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_test_recommendations" ON ai_test_recommendations;
CREATE POLICY "users_select_own_test_recommendations"
  ON ai_test_recommendations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_insert_own_test_recommendations" ON ai_test_recommendations;
CREATE POLICY "users_insert_own_test_recommendations"
  ON ai_test_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_update_own_test_recommendations" ON ai_test_recommendations;
CREATE POLICY "users_update_own_test_recommendations"
  ON ai_test_recommendations FOR UPDATE
  USING (auth.uid() = user_id);
