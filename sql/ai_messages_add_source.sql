-- sql/ai_messages_add_source.sql
-- Добавление поля source для различения источника сообщений (web или telegram)

-- Добавляем колонку source с дефолтным значением 'web'
ALTER TABLE ai_messages
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'web';

-- Создаем индекс для быстрого поиска по источнику
CREATE INDEX IF NOT EXISTS idx_ai_messages_source 
ON ai_messages(user_id, source, created_at DESC);

-- Обновляем существующие записи (если они есть) - устанавливаем 'web'
UPDATE ai_messages
SET source = 'web'
WHERE source IS NULL;

-- Добавляем комментарий к колонке
COMMENT ON COLUMN ai_messages.source IS 'Source of the message: web or telegram';
