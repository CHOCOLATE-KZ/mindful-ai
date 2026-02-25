-- sql/telegram_login_tokens.sql
-- Индексы и функции для таблицы telegram_login_tokens
-- Таблица уже существует в БД Supabase

-- Индекс для быстрого поиска по коду
CREATE INDEX IF NOT EXISTS idx_telegram_login_tokens_code 
ON telegram_login_tokens(code) 
WHERE NOT used;

-- Индекс для очистки старых токенов
CREATE INDEX IF NOT EXISTS idx_telegram_login_tokens_expires 
ON telegram_login_tokens(expires_at);

-- RLS политика: все операции через service role
ALTER TABLE telegram_login_tokens ENABLE ROW LEVEL SECURITY;

-- Функция для очистки истекших токенов (запускать периодически)
CREATE OR REPLACE FUNCTION cleanup_expired_login_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM telegram_login_tokens
  WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
