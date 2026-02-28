-- SQL: create chat_notes table for anchor notes
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS chat_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  detail text,
  source text DEFAULT 'chat',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_notes_user_created
ON chat_notes(user_id, created_at DESC);

ALTER TABLE chat_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their chat notes"
  ON chat_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their chat notes"
  ON chat_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their chat notes"
  ON chat_notes FOR DELETE
  USING (auth.uid() = user_id);
