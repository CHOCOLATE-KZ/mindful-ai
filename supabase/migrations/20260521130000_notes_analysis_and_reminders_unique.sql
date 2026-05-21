-- Audit log for /api/notes/analyze
CREATE TABLE IF NOT EXISTS public.notes_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  comments_count integer NOT NULL DEFAULT 0,
  analyzed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notes_analysis_user_id_idx ON public.notes_analysis (user_id);

-- One reminder row per user (telegram bot upsert)
CREATE UNIQUE INDEX IF NOT EXISTS reminders_user_id_unique ON public.reminders (user_id);
