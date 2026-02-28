-- Добавление колонки result в таблицу tests_log для хранения результатов тестов
-- Эта колонка содержит score, level, color из системы scoring

-- Добавляем колонку result типа JSONB (может быть NULL для тестов без scoring)
ALTER TABLE tests_log
ADD COLUMN IF NOT EXISTS result JSONB DEFAULT NULL;

-- Добавляем комментарий к колонке
COMMENT ON COLUMN tests_log.result IS 'Результаты теста: {score: number, level: string, color: string}';

-- Создаем индекс для быстрого поиска по полям внутри result
CREATE INDEX IF NOT EXISTS idx_tests_log_result_level 
ON tests_log ((result->>'level'));

-- Примеры использования:
-- SELECT * FROM tests_log WHERE result->>'level' = 'Высокая тревога';
-- SELECT * FROM tests_log WHERE (result->>'score')::int > 15;
