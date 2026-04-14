// scripts/load-psychology-embeddings.js
// Скрипт для загрузки психологических знаний в Supabase с embeddings

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Загрузить .env.local файл
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Инициализация Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Ошибка: NEXT_PUBLIC_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY не установлены');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Функция для чтения всех MD файлов из папки
function readKnowledgeFiles(knowledgeDir) {
  const files = fs.readdirSync(knowledgeDir).filter(f => f.endsWith('.md'));
  
  const documents = [];
  
  for (const file of files) {
    const filePath = path.join(knowledgeDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const filename = path.basename(file, '.md');
    
    documents.push({
      filename,
      title: file.replace('.md', ''),
      content,
      sourceFile: file
    });
  }
  
  return documents;
}

// Функция для маловероятной разбиения контента на чанки
function chunkContent(content, chunkSize = 500) {
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  const chunks = [];
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length > chunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Получаем embeddings через LM Studio (OpenAI-совместимый API)
const LM_BASE_URL = (process.env.LMSTUDIO_BASE_URL || 'http://127.0.0.1:1234').trim();
const LM_EMBED_MODEL = (process.env.LMSTUDIO_EMBED_MODEL || 'text-embedding-nomic-embed-text-v1.5').trim();

async function getEmbedding(text) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${LM_BASE_URL}/v1/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: LM_EMBED_MODEL,
        input: text,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`LM Studio API ошибка: ${response.status}`);
    }

    const data = await response.json();
    const embedding = data?.data?.[0]?.embedding;
    if (Array.isArray(embedding) && embedding.length > 0) {
      return embedding;
    }
    throw new Error('LM Studio вернул неправильный формат');
  } catch (error) {
    console.error('❌ LM Studio embeddings недоступны:', error.message);
    console.error(`   Убедитесь что LM Studio запущен на ${LM_BASE_URL}`);
    console.error('   и загружена модель text-embedding-nomic-embed-text-v1.5');
    process.exit(1);
  }
}

// Функция для извлечения ключевых слов из контента
function extractKeywords(title, content) {
  const commonWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
    'in', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'that', 'this',
    'это', 'и', 'или', 'но', 'в', 'на', 'по', 'из', 'как', 'что',
  ]);
  
  const words = (title + ' ' + content)
    .toLowerCase()
    .match(/\b\w+\b/g) || [];
  
  const keywords = words
    .filter(w => w.length > 3 && !commonWords.has(w))
    .slice(0, 10);
  
  return [...new Set(keywords)];
}

// Основная функция загрузки
async function loadPsychologyKnowledge() {
  console.log('📚 Начинаю загрузку психологических знаний...\n');
  
  const knowledgeDir = path.join(__dirname, '..', 'psychology_knowledge');
  
  if (!fs.existsSync(knowledgeDir)) {
    console.error(`❌ Папка ${knowledgeDir} не найдена`);
    process.exit(1);
  }
  
  // Читаем все MD файлы
  const documents = readKnowledgeFiles(knowledgeDir);
  console.log(`✅ Найдено ${documents.length} документов\n`);
  
  let totalChunks = 0;
  const allChunks = [];
  
  // Обрабатываем каждый документ
  for (const doc of documents) {
    console.log(`📖 Обрабатываю: ${doc.title}`);
    
    const chunks = chunkContent(doc.content);
    console.log(`   └─ Разбито на ${chunks.length} чанков`);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await getEmbedding(chunk);
      
      // Извлекаем первый заголовок как секцию
      const sectionMatch = chunk.match(/^#+\s+(.+)/m);
      const section = sectionMatch ? sectionMatch[1] : 'General';
      const keywords = extractKeywords(doc.title, chunk);
      
      allChunks.push({
        title: doc.title,
        section,
        content_chunk: chunk.substring(0, 2000), // ограничиваем размер
        embedding,
        source_file: doc.sourceFile,
        category: doc.filename,
        keywords,
      });
      
      totalChunks++;
      process.stdout.write(`\r   └─ Обработано чанков: ${totalChunks}`);
    }
    
    console.log();
  }
  
  console.log(`\n✅ Всего чанков подготовлено: ${totalChunks}\n`);
  
  // Загружаем в Supabase
  console.log('💾 Загружаю в Supabase...');
  
  // Очищаем старые данные
  const { error: deleteError } = await supabase
    .from('psychology_knowledge')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (deleteError) {
    console.warn('⚠️  Ошибка при очистке старых данных:', deleteError.message);
  }
  
  // Загружаем новые чанки батчами
  const batchSize = 10;
  for (let i = 0; i < allChunks.length; i += batchSize) {
    const batch = allChunks.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('psychology_knowledge')
      .insert(batch);
    
    if (error) {
      console.error(`❌ Ошибка при загрузке батча ${Math.floor(i / batchSize) + 1}:`, error);
    } else {
      process.stdout.write(`\r📤 Загружено чанков: ${Math.min(i + batchSize, allChunks.length)}/${allChunks.length}`);
    }
  }
  
  console.log(`\n\n✅ Загрузка завершена!\n`);
  console.log(`📊 Статистика:`);
  console.log(`   - Документов: ${documents.length}`);
  console.log(`   - Всего чанков: ${totalChunks}`);
  console.log(`   - Размер вектора embeddings: 384`);
}

// Запускаем скрипт
loadPsychologyKnowledge().catch(error => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});
