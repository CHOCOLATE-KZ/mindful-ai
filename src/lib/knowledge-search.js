// src/lib/knowledge-search.js
// Поиск психологических знаний через embeddings (LM Studio)

import { supabaseAdmin } from './supabase/admin.js';
import { getUnifiedEmbedding } from './llm/unifiedClient.js';

const RAG_MAX_CHARS = Number(process.env.RAG_MAX_CHARS || 2000);
const RAG_CHUNK_MAX_CHARS = Number(process.env.RAG_CHUNK_MAX_CHARS || 650);

function getSupabaseClient() {
  return supabaseAdmin;
}

/**
 * Получает embedding через LM Studio /v1/embeddings (OpenAI-совместимый)
 */
async function getTextEmbedding(text) {
  const { embedding, error } = await getUnifiedEmbedding(text);
  if (error || !embedding) {
    console.warn(`[RAG]  LM Studio embeddings недоступны: ${error || 'empty embedding'}, keyword fallback`);
    return null;
  }

  return embedding;
}

/**
 * Ищет релевантное психологическое знание по запросу пользователя
 * @param {string} userMessage - сообщение пользователя
 * @param {number} limit - максимум результатов (по умолчанию 3)
 * @returns {Promise<string>} - релевантное знание для контекста
 */
export async function searchPsychologyKnowledge(userMessage, limit = 3) {
  if (!userMessage || userMessage.trim().length < 3) {
    return '';
  }
  
  try {
    console.log(`[RAG]  Поиск знаний для: "${userMessage}"`);
    
    // Получаем embedding для запроса
    const queryEmbedding = await getTextEmbedding(userMessage);
    
    if (!queryEmbedding) {
      // Если embeddings не работают, используем простой поиск по ключевым словам
      console.log(`[RAG]  Используем fallback поиск по ключевым словам`);
      return await searchByKeywords(userMessage, limit);
    }
    
    // Выполняем semantic search через Supabase
    console.log(`[RAG]  Выполняю semantic search в Supabase`);
    const { data, error } = await getSupabaseClient().rpc(
      'search_psychology_knowledge',
      {
        query_embedding: queryEmbedding,
        similarity_threshold: 0.5,  // Повышаем threshold чтобы искать только релевантное
        limit_count: limit,
      }
    );
    
    if (error) {
      console.warn('[RAG]  Ошибка semantic search:', error.message);
      return await searchByKeywords(userMessage, limit);
    }
    
    if (!data || data.length === 0) {
      console.log('[RAG]   Не найдено документов');
      return '';
    }
    
    console.log(`[RAG]  Найдено ${data.length} документов`);
    for (const item of data) {
      console.log(`[RAG]   - ${item.title} (${item.section})`);
    }
    
    // Собираем результаты в текст
    let knowledgeContext = 'ПСИХОЛОГИЧЕСКАЯ БАЗА ЗНАНИЙ:\n\n';
    
    for (const item of data) {
      knowledgeContext += `[${item.title}]\n`;
      if (item.section) {
        knowledgeContext += `Раздел: ${item.section}\n`;
      }
      knowledgeContext += `${String(item.content_chunk || "").slice(0, RAG_CHUNK_MAX_CHARS)}\n\n`;
      if (knowledgeContext.length >= RAG_MAX_CHARS) break;
    }

    if (knowledgeContext.length > RAG_MAX_CHARS) {
      knowledgeContext = `${knowledgeContext.slice(0, RAG_MAX_CHARS)}\n[…]`;
    }

    console.log(`[RAG]  Контекст ${knowledgeContext.length} символов добавлен в ответ`);
    return knowledgeContext;
  } catch (error) {
    console.error('[RAG]  Ошибка при поиске знаний:', error.message);
    return '';
  }
}

/**
 * Фолбэк: поиск по ключевым словам когда embeddings недоступны
 * @param {string} userMessage - сообщение пользователя
 * @param {number} limit - максимум результатов
 * @returns {Promise<string>} - релевантное знание
 */
async function searchByKeywords(userMessage, limit = 3) {
  try {
    console.log(`[RAG]  Fallback поиск по ключевым словам для: "${userMessage}"`);
    
    // Извлекаем ключевые слова из сообщения
    const keywords = userMessage.toLowerCase().match(/\b\w+\b/g) || [];
    console.log(`[RAG]  Ключевые слова: ${keywords.slice(0, 5).join(', ')}`);
    
    // Создаём SQL запрос для поиска
    let query = getSupabaseClient()
      .from('psychology_knowledge')
      .select('title, section, content_chunk, category');
    
    // Ищем по ключевым словам
    if (keywords.length > 0) {
      query = query.or(
        keywords.slice(0, 3).map(kw => `keywords.cs.{${kw}}`).join(',')
      );
    }
    
    const { data, error } = await query.limit(limit);
    
    if (error || !data || data.length === 0) {
      console.log('[RAG]   По ключевым словам ничего не найдено');
      return '';
    }
    
    console.log(`[RAG]  Найдено ${data.length} документов по ключевым словам`);
    
    // Собираем результаты
    let knowledgeContext = 'ПСИХОЛОГИЧЕСКАЯ БАЗА ЗНАНИЙ:\n\n';
    
    for (const item of data) {
      knowledgeContext += `[${item.title}]\n`;
      if (item.section) {
        knowledgeContext += `Раздел: ${item.section}\n`;
      }
      knowledgeContext += `${String(item.content_chunk || "").slice(0, RAG_CHUNK_MAX_CHARS)}\n\n`;
      if (knowledgeContext.length >= RAG_MAX_CHARS) break;
    }

    if (knowledgeContext.length > RAG_MAX_CHARS) {
      knowledgeContext = `${knowledgeContext.slice(0, RAG_MAX_CHARS)}\n[…]`;
    }

    return knowledgeContext;
  } catch (error) {
    console.error('Ошибка при поиске по ключевым словам:', error);
    return '';
  }
}

/**
 * Получает знание по категории
 * @param {string} category - категория (anxiety, depression, mindfulness и т.д.)
 * @returns {Promise<string>} - знание из категории
 */
export async function getKnowledgeByCategory(category) {
  try {
    const { data, error } = await getSupabaseClient()
      .from('psychology_knowledge')
      .select('title, section, content_chunk')
      .eq('category', category)
      .limit(2);
    
    if (error || !data || data.length === 0) {
      return '';
    }
    
    let context = `ЗНАНИЯ ПО ТЕМЕ "${category}":\n\n`;
    
    for (const item of data) {
      context += `[${item.title}] ${item.section}\n`;
      context += `${item.content_chunk}\n\n`;
    }
    
    return context;
  } catch (error) {
    console.error('Ошибка при получении знани по категории:', error);
    return '';
  }
}

// Экспортируем функцию по умолчанию для комfортной замены старой функции
export const getRelevantKnowledge = searchPsychologyKnowledge;

const knowledgeSearchModule = {
  searchPsychologyKnowledge,
  getKnowledgeByCategory,
  getRelevantKnowledge,
};

export default knowledgeSearchModule;
