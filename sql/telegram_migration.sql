-- sql/telegram_migration.sql
-- Миграция для добавления поддержки Telegram в profiles

-- Добавить колонку telegram_id если её еще нет
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE;

-- Добавить колонку telegram_username для хранения @username
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS telegram_username TEXT;

-- Создать индекс для быстрого поиска по telegram_id
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON public.profiles(telegram_id)
WHERE telegram_id IS NOT NULL;

-- Добавить комментарии к колонкам
COMMENT ON COLUMN public.profiles.telegram_id IS 'ID пользователя в Telegram для связи аккаунтов';
COMMENT ON COLUMN public.profiles.telegram_username IS 'Username пользователя в Telegram (@username)';
