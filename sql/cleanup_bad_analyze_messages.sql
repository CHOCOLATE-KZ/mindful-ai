-- Удаление плохих сообщений /analyze из истории
-- Выполните этот скрипт в Supabase SQL Editor

-- Удалить пары сообщений где:
-- 1. user отправил "/analyze" или содержит "analyze"
-- 2. assistant ответил "Извините, не могу ответить на этот вопрос"

DELETE FROM ai_messages
WHERE id IN (
  -- Находим ID assistant сообщений с дефолтной ошибкой
  SELECT id FROM ai_messages
  WHERE role = 'assistant'
  AND content = 'Извините, не могу ответить на этот вопрос.'
  AND source = 'telegram'
)
OR id IN (
  -- Находим ID user сообщений с /analyze
  SELECT id FROM ai_messages
  WHERE role = 'user'
  AND (content LIKE '%/analyze%' OR content LIKE '%анализ%')
  AND source = 'telegram'
);

-- Проверить результат (сколько осталось сообщений)
SELECT COUNT(*) as remaining_messages, source, role
FROM ai_messages
WHERE source = 'telegram'
GROUP BY source, role;
