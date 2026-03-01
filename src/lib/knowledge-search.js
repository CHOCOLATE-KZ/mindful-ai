// src/lib/knowledge-search.js
// Функция для поиска относительного психологического знания через embeddings

import { supabaseBrowser } from './supabase/browser.js';

/**
 * Получить Supabase клиент
 */
function getSupabaseClient() {
  return supabaseBrowser();
}

/**
 * Получает embedding для текста (используя LM Studio Nomic Embed Text)
 * @param {string} text - текст для получения embeddings
 * @returns {Promise<number[]>} - вектор embeddings
 */
async function getTextEmbedding(text) {
  try {
    // Используем Ollama на localhost:11434
    const response = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: text,
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      // Ollama возвращает embedding напрямую в data.embedding
      return data.embedding || Array(768).fill(0);
    }
  } catch (error) {
    console.warn('[RAG] ⚠️ Ollama embeddings недоступны (localhost:11434), используем fallback keyword search');
  }
  
  // Фолбэк: возвращаем пустой массив - fallback keyword search заберет на себя поиск
  return Array(768).fill(0);
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
    console.log(`[RAG] 🔍 Поиск знаний для: "${userMessage}"`);
    
    // Получаем embedding для запроса
    const queryEmbedding = await getTextEmbedding(userMessage);
    
    if (!queryEmbedding || queryEmbedding.every(v => v === 0)) {
      // Если embeddings не работают, используем простой поиск по ключевым словам
      console.log(`[RAG] 📌 Используем fallback поиск по ключевым словам`);
      return await searchByKeywords(userMessage, limit);
    }
    
    // Выполняем semantic search через Supabase
    console.log(`[RAG] 🎯 Выполняю semantic search в Supabase`);
    const { data, error } = await getSupabaseClient().rpc(
      'search_psychology_knowledge',
      {
        query_embedding: queryEmbedding,
        similarity_threshold: 0.5,  // Повышаем threshold чтобы искать только релевантное
        limit_count: limit,
      }
    );
    
    if (error) {
      console.warn('[RAG] ❌ Ошибка semantic search:', error.message);
      return await searchByKeywords(userMessage, limit);
    }
    
    if (!data || data.length === 0) {
      console.log('[RAG] ⚠️  Не найдено документов');
      return '';
    }
    
    console.log(`[RAG] ✅ Найдено ${data.length} документов`);
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
      knowledgeContext += `${item.content_chunk}\n\n`;
    }
    
    console.log(`[RAG] 📦 Контекст ${knowledgeContext.length} символов добавлен в ответ`);
    return knowledgeContext;
  } catch (error) {
    console.error('[RAG] 🔴 Ошибка при поиске знаний:', error.message);
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
    console.log(`[RAG] 🔑 Fallback поиск по ключевым словам для: "${userMessage}"`);
    
    // Извлекаем ключевые слова из сообщения
    const keywords = userMessage.toLowerCase().match(/\b\w+\b/g) || [];
    console.log(`[RAG] 📋 Ключевые слова: ${keywords.slice(0, 5).join(', ')}`);
    
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
      console.log('[RAG] ⚠️  По ключевым словам ничего не найдено');
      return '';
    }
    
    console.log(`[RAG] ✅ Найдено ${data.length} документов по ключевым словам`);
    
    // Собираем результаты
    let knowledgeContext = 'ПСИХОЛОГИЧЕСКАЯ БАЗА ЗНАНИЙ:\n\n';
    
    for (const item of data) {
      knowledgeContext += `[${item.title}]\n`;
      if (item.section) {
        knowledgeContext += `Раздел: ${item.section}\n`;
      }
      knowledgeContext += `${item.content_chunk}\n\n`;
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
