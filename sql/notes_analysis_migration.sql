-- ═══════════════════════════════════════════════════════════════
-- 📊 МИГРАЦИЯ БАЗЫ ДАННЫХ: Система анализа заметок
-- ═══════════════════════════════════════════════════════════════

-- 🔹 ОСНОВНАЯ ТАБЛИЦА ЗАМЕТОК
-- Хранит полные и мини-заметки с привязкой к пользователю
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMP DEFAULT NOW(),
  mood INT CHECK (mood IS NULL OR (mood >= 1 AND mood <= 10)),
  sleep INT CHECK (sleep IS NULL OR sleep >= 0),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 🔹 ТАБЛИЦА ДЛЯ СОХРАНЕНИЯ ИСТОРИИ АНАЛИЗА
-- Хранит информацию о запросах анализа для ИИ
CREATE TABLE IF NOT EXISTS notes_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  comments_count INT DEFAULT 0,
  analyzed_at TIMESTAMP DEFAULT NOW()
);

-- 🔹 ТАБЛИЦА ДЛЯ ХРАНЕНИЯ РЕЗУЛЬТАТОВ ИИ-АНАЛИЗА
-- Сохраняет рекомендации и анализ от ИИ
CREATE TABLE IF NOT EXISTS notes_analysis_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID REFERENCES notes_analysis(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_response TEXT NOT NULL,
  model_used VARCHAR(100),
  tokens_used INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 🔹 ТАБЛИЦА ДЛЯ СОХРАНЕНИЯ РЕКОМЕНДАЦИЙ
-- Хранит рекомендации от ИИ для отображения пользователю
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50),
  content TEXT NOT NULL,
  priority INT DEFAULT 0,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 🔒 ROW LEVEL SECURITY (RLS) - Защита данных
-- ═══════════════════════════════════════════════════════════════

-- Включение RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

-- 🔹 NOTES - Пользователи видят только свои заметки
CREATE POLICY "Users can only view their notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- 🔹 NOTES_ANALYSIS - Пользователи видят только свои анализы
CREATE POLICY "Users can view their analysis"
  ON notes_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their analysis"
  ON notes_analysis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their analysis"
  ON notes_analysis FOR DELETE
  USING (auth.uid() = user_id);

-- 🔹 NOTES_ANALYSIS_RESULTS - Пользователи видят результаты своих анализов
CREATE POLICY "Users can view their analysis results"
  ON notes_analysis_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their analysis results"
  ON notes_analysis_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 🔹 AI_RECOMMENDATIONS - Пользователи видят только свои рекомендации
CREATE POLICY "Users can view their recommendations"
  ON ai_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert recommendations"
  ON ai_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update recommendations"
  ON ai_recommendations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete recommendations"
  ON ai_recommendations FOR DELETE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- 📈 ИНДЕКСЫ - Оптимизация производительности
-- ═══════════════════════════════════════════════════════════════

-- 🔹 NOTES индексы
-- Для быстрого получения заметок пользователя по дате
CREATE INDEX IF NOT EXISTS idx_notes_user_date ON notes(user_id, date DESC);

-- Для фильтрации по настроению
CREATE INDEX IF NOT EXISTS idx_notes_user_mood ON notes(user_id, mood) WHERE mood IS NOT NULL;

-- Для фильтрации по сну
CREATE INDEX IF NOT EXISTS idx_notes_user_sleep ON notes(user_id, sleep) WHERE sleep IS NOT NULL;

-- 🔹 NOTES_ANALYSIS индексы
CREATE INDEX IF NOT EXISTS idx_notes_analysis_user ON notes_analysis(user_id, analyzed_at DESC);

-- 🔹 NOTES_ANALYSIS_RESULTS индексы
CREATE INDEX IF NOT EXISTS idx_analysis_results_user ON notes_analysis_results(user_id, created_at DESC);

-- 🔹 AI_RECOMMENDATIONS индексы
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON ai_recommendations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_read ON ai_recommendations(user_id, read) WHERE read = FALSE;

-- ═══════════════════════════════════════════════════════════════
-- 🔄 ТРИГГЕРЫ - Автоматическое обновление
-- ═══════════════════════════════════════════════════════════════

-- Функция для обновления updated_at в notes
CREATE OR REPLACE FUNCTION update_notes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для обновления updated_at
DROP TRIGGER IF EXISTS notes_timestamp_trigger ON notes;
CREATE TRIGGER notes_timestamp_trigger
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_notes_timestamp();

-- ═══════════════════════════════════════════════════════════════
-- 📊 VIEWS - Полезные представления для аналитики
-- ═══════════════════════════════════════════════════════════════

-- 🔹 VIEW: Дневная статистика пользователя
CREATE OR REPLACE VIEW daily_notes_stats AS
SELECT 
  DATE(notes.date) as day,
  notes.user_id,
  COUNT(*) as total_notes,
  COUNT(CASE WHEN mood IS NOT NULL THEN 1 END) as mood_entries,
  COUNT(CASE WHEN sleep IS NOT NULL THEN 1 END) as sleep_entries,
  ROUND(AVG(CASE WHEN mood IS NOT NULL THEN mood END), 1) as avg_mood,
  ROUND(AVG(CASE WHEN sleep IS NOT NULL THEN sleep END), 0) as avg_sleep,
  COUNT(CASE WHEN comment IS NOT NULL THEN 1 END) as comment_count
FROM notes
GROUP BY DATE(notes.date), notes.user_id
ORDER BY day DESC;

-- 🔹 VIEW: Недельная статистика
CREATE OR REPLACE VIEW weekly_notes_stats AS
SELECT 
  DATE_TRUNC('week', notes.date) as week_start,
  notes.user_id,
  COUNT(*) as total_notes,
  ROUND(AVG(CASE WHEN mood IS NOT NULL THEN mood END), 1) as avg_mood,
  ROUND(AVG(CASE WHEN sleep IS NOT NULL THEN sleep END), 0) as avg_sleep
FROM notes
GROUP BY DATE_TRUNC('week', notes.date), notes.user_id
ORDER BY week_start DESC;

-- ═══════════════════════════════════════════════════════════════
-- 📋 ПРИМЕРЫ ЗАПРОСОВ
-- ═══════════════════════════════════════════════════════════════

-- Получить все заметки пользователя за последний месяц
-- SELECT * FROM notes 
-- WHERE user_id = 'user-uuid'
-- AND date >= NOW() - INTERVAL '30 days'
-- ORDER BY date DESC;

-- Получить среднее настроение за неделю
-- SELECT ROUND(AVG(mood), 1) as avg_mood
-- FROM notes
-- WHERE user_id = 'user-uuid'
-- AND date >= NOW() - INTERVAL '7 days'
-- AND mood IS NOT NULL;

-- Получить последний анализ пользователя
-- SELECT * FROM notes_analysis
-- WHERE user_id = 'user-uuid'
-- ORDER BY analyzed_at DESC
-- LIMIT 1;

-- Получить результаты последнего анализа
-- SELECT * FROM notes_analysis_results
-- WHERE user_id = 'user-uuid'
-- ORDER BY created_at DESC
-- LIMIT 1;

-- ═══════════════════════════════════════════════════════════════
-- ✅ ПРОВЕРКА МИГРАЦИИ
-- ═══════════════════════════════════════════════════════════════

-- Проверить наличие всех таблиц
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;

-- Проверить RLS политики
-- SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
-- FROM pg_policies
-- WHERE tablename IN ('notes', 'notes_analysis', 'notes_analysis_results', 'ai_recommendations');

-- Проверить индексы
-- SELECT tablename, indexname FROM pg_indexes
-- WHERE tablename IN ('notes', 'notes_analysis', 'notes_analysis_results', 'ai_recommendations');
