-- UI theme toggle removed; app is light-only
ALTER TABLE public.user_settings
  DROP COLUMN IF EXISTS theme;
