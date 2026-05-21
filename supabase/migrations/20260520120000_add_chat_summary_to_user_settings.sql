-- Sliding-window chat memory (run in Supabase SQL Editor if not using CLI migrate)
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS chat_summary TEXT,
  ADD COLUMN IF NOT EXISTS chat_summary_msg_count INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN user_settings.chat_summary IS 'Compressed summary of older web chat messages';
COMMENT ON COLUMN user_settings.chat_summary_msg_count IS 'Number of oldest ai_messages covered by chat_summary (web only)';
