-- SQL миграция для RAG системы с nomic-embed-text (768 dimensions)
-- Выполните этот скрипт в Supabase SQL Editor

-- Удаляем старую таблицу если существует
DROP TABLE IF EXISTS psychology_knowledge CASCADE;

-- Включаем pgvector расширение
CREATE EXTENSION IF NOT EXISTS vector;

-- Создаём таблицу для психологических знаний с 768-мерными embeddings
CREATE TABLE psychology_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  section TEXT,
  content_chunk TEXT NOT NULL,
  embedding vector(768) NOT NULL,
  source_file TEXT,
  category TEXT,
  keywords TEXT[],
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Индекс для быстрого векторного поиска
CREATE INDEX psychology_knowledge_embedding_idx 
  ON psychology_knowledge 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);

-- Индекс для поиска по категории
CREATE INDEX psychology_knowledge_category_idx 
  ON psychology_knowledge (category);

-- Индекс для поиска по ключевым словам
CREATE INDEX psychology_knowledge_keywords_idx 
  ON psychology_knowledge USING GIN (keywords);

-- Функция для семантического поиска похожих документов
CREATE OR REPLACE FUNCTION search_psychology_knowledge(
  query_embedding vector,
  similarity_threshold float DEFAULT 0.3,
  limit_count int DEFAULT 5
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  section TEXT,
  content_chunk TEXT,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pk.id,
    pk.title,
    pk.section,
    pk.content_chunk,
    (1 - (pk.embedding <=> query_embedding))::float as similarity
  FROM psychology_knowledge pk
  WHERE (1 - (pk.embedding <=> query_embedding)) > similarity_threshold
  ORDER BY pk.embedding <=> query_embedding
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Даем доступ для authenticated и anon пользователей
GRANT SELECT ON psychology_knowledge TO authenticated, anon;
GRANT EXECUTE ON FUNCTION search_psychology_knowledge TO authenticated, anon;

-- Комментарии для документирования
COMMENT ON TABLE psychology_knowledge IS 'Таблица психологических знаний с embeddings для RAG системы';
COMMENT ON COLUMN psychology_knowledge.embedding IS 'Vector embedding 768-мерного текста (nomic-embed-text)';
COMMENT ON COLUMN psychology_knowledge.keywords IS 'Массив ключевых слов для быстрого поиска';
