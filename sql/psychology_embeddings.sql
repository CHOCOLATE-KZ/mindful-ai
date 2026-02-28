-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table for psychological knowledge with embeddings
CREATE TABLE IF NOT EXISTS psychology_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  section TEXT,
  content TEXT NOT NULL,
  content_chunk TEXT,
  embedding vector(384), -- for embedding size of 384 dimensions
  source_file TEXT,
  category TEXT,
  keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS psychology_knowledge_embedding_idx 
ON psychology_knowledge 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for category search
CREATE INDEX IF NOT EXISTS psychology_knowledge_category_idx 
ON psychology_knowledge(category);

-- Create index for keywords search
CREATE INDEX IF NOT EXISTS psychology_knowledge_keywords_idx 
ON psychology_knowledge USING GIN(keywords);

-- Grant permissions to authenticated users
GRANT SELECT ON psychology_knowledge TO authenticated;
GRANT SELECT ON psychology_knowledge TO anon;

-- Create function for semantic search
CREATE OR REPLACE FUNCTION search_psychology_knowledge(
  query_embedding vector,
  similarity_threshold float DEFAULT 0.3,
  limit_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  section TEXT,
  content_chunk TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pk.id,
    pk.title,
    pk.section,
    pk.content_chunk,
    (1 - (pk.embedding <=> query_embedding))::FLOAT as similarity
  FROM psychology_knowledge pk
  WHERE (1 - (pk.embedding <=> query_embedding)) > similarity_threshold
  ORDER BY pk.embedding <=> query_embedding
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION search_psychology_knowledge TO authenticated;
GRANT EXECUTE ON FUNCTION search_psychology_knowledge TO anon;
