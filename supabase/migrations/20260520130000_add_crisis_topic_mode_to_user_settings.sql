  ALTER TABLE public.user_settings
    ADD COLUMN IF NOT EXISTS crisis_topic_mode text;

  COMMENT ON COLUMN public.user_settings.crisis_topic_mode IS
    'continuing | declined — выбор пользователя после кризисного триггера';
