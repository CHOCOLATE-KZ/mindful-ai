# 🚀 RAG System Deployment Guide / Руководство развёртывания RAG системы

## Overview / Обзор

Этот проект теперь использует **Retrieval Augmented Generation (RAG)** систему для обогащения ответов AI релевантными психологическими знаниями из базы данных.

**Архитектура:**
```
User Message → Embedding → Vector Search → Psychology Knowledge → AI Context → Response
```

## Prerequisites / Требования

### 1. Environment Variables / Переменные окружения

Убедитесь, что в `.env.local` присутствуют:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
LMSTUDIO_BASE_URL=http://127.0.0.1:1234
LMSTUDIO_MODEL=gpt-oss-20b
```

### 2. Embedding Service / Сервис embeddings

**Option A: Local Ollama (рекомендуется)**
```bash
# Установите Ollama: https://ollama.ai/
# Запустите модель embeddings в другом терминале:
ollama run nomic-embed-text
```

**Option B: Fallback (случайные embeddings)**
- Если Ollama недоступен, скрипт использует фолбэк со случайными 384-мерными векторами
- Это работает для тестирования, но семантический поиск будет неэффективным

### 3. PostgreSQL with pgvector / PostgreSQL с pgvector

Supabase уже поддерживает `pgvector` расширение (обычно включено по умолчанию).

## Deployment Steps / Шаги развёртывания

### Step 1: Run Database Migration / Запустить миграцию БД

1. Откройте Supabase SQL Editor
2. Скопируйте содержимое файла: `sql/psychology_embeddings.sql`
3. Выполните SQL скрипт

**Что создаст:**
- Таблица `psychology_knowledge` с полями: id, title, section, content_chunk, embedding (vector), category, keywords
- Индексы для быстрого поиска (ivfflat на embeddings, B-tree на category)
- Функция `search_psychology_knowledge()` для семантического поиска

### Step 2: Load Psychology Knowledge / Загрузить психологические знания

```bash
# Из корня проекта:
node scripts/load-psychology-embeddings.js
```

**Что произойдёт:**
1. Прочитает все `.md` файлы из папки `psychology_knowledge/`
2. Разделит контент на чанки (≤500 символов)
3. Сгенерирует embeddings для каждого чанка (через Ollama или случайный фолбэк)
4. Загрузит в Supabase таблицу `psychology_knowledge` батчами по 10 записей
5. Покажет статистику загруженных чанков

**Expected Output / Ожидаемый результат:**
```
✅ Загружено: 26-30 чанков со следующих файлов:
✅ anxiety-management.md (4-5 чанков)
✅ depression-support.md (4-5 чанков)
✅ emotional-regulation.md (3-4 чанка)
✅ mindfulness-meditation.md (3-4 чанка)
✅ stress-management.md (5-6 чанков)
```

### Step 3: Test Knowledge Search / Протестировать поиск знаний

```bash
node scripts/test-knowledge-search.js
```

**Проверяет:**
- ✅ Таблица `psychology_knowledge` создана
- ✅ Данные загружены (подсчёт записей)
- ✅ Категории могут быть найдены
- ✅ Семантический поиск работает для тестовых запросов

**Test Queries / Тестовые запросы:**
- "мне тревожно" → должен найти anxiety-management.md
- "не могу спать" → должен найти stress-management.md или emotional-regulation.md
- "грустно мне" → должен найти depression-support.md
- "медитация" → должен найти mindfulness-meditation.md

### Step 4: Verify Integration / Проверить интеграцию

Обновлены следующие файлы для использования RAG:

**Updated Files / Обновлённые файлы:**
- ✅ `src/lib/lmStudioClient.js` - импортирует `searchPsychologyKnowledge`
- ✅ `src/app/api/chat/route.js` - использует embeddings поиск
- ✅ Telegram handlers автоматически используют новую функцию через `lmStudioClient`

## How It Works / Как это работает

### Для веб-чата:
```
1. Пользователь отправляет сообщение
2. POST /api/chat получает сообщение
3. searchPsychologyKnowledge(message) → ищет embeddings
4. В Supabase: message → embedding → cosine_similarity search
5. Возвращает 3-5 самых релевантных чанков
6. AI использует эти чанки как контекст для ответа
7. Возвращает улучшенный ответ пользователю
```

### Для Telegram бота:
```
1. Пользователь отправляет сообщение боту
2. handlers.js вызывает askAIWithHistory()
3. askAIWithHistory() вызывает searchPsychologyKnowledge()
4. Остальной процесс идентичен веб-чату
```

## Fallback Behavior / Поведение при фалбэке

### Если Ollama недоступен:
```javascript
// knowledge-search.js
getTextEmbedding() → попытка Ollama → фалбэк на random vector

// По умолчанию:
- Embeddings будут случайными 384-мерными векторами
- Поиск будет менее точным
- Но система продолжит работать благодаря фалбэку по ключевым словам
```

### Если Supabase психологической таблицы нет:
```javascript
// Функция сначала пытается semantic search
// Если ошибка → падает на поиск по ключевым словам
// Так что система остаётся функциональной
```

## Troubleshooting / Решение проблем

### ❌ "Таблица psychology_knowledge не существует"
```
Решение: Запустите SQL миграцию в Supabase
- Откройте Supabase SQL Editor
- Скопируйте sql/psychology_embeddings.sql
- Выполните скрипт
```

### ❌ "Embedding service недоступен"
```
Решение: Запустите Ollama или используйте фалбэк
1. Запустить Ollama:
   ollama run nomic-embed-text
2. Или использовать случайные embeddings при запуске скрипта:
   node scripts/load-psychology-embeddings.js
   (скрипт автоматически перейдёт на фолбэк)
```

### ❌ "Результаты поиска низкого качества"
```
Возможные причины:
1. Используются случайные embeddings (не Ollama)
   → Решение: Запустить Ollama и перезагрузить embeddings
2. Пороговое значение similarity слишком высокое
   → Отредактируйте в knowledge-search.js: similarity_threshold
3. Базовая модель LM Studio неправильно подбирает контекст
   → Проверьте system prompt в systemPrompt.js
```

## Performance / Производительность

### Индексы для оптимизации:
```sql
-- Уже создано в миграции:
CREATE INDEX psychology_knowledge_embedding_idx 
  ON psychology_knowledge 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);
  
CREATE INDEX psychology_knowledge_category_idx 
  ON psychology_knowledge (category);
  
CREATE INDEX psychology_knowledge_keywords_idx 
  ON psychology_knowledge USING GIN (keywords);
```

### Típical Response Time:
- Embedding generation: 10-50ms (зависит от Ollama)
- Vector search: 5-10ms (благодаря ivfflat индексу)
- Total: 15-100ms добавляются к времени ответа AI

## Adding More Knowledge / Добавление дополнительных знаний

### Вариант 1: Добавить новый .md файл
```bash
# 1. Создайте новый файл в psychology_knowledge/
psychology_knowledge/sleep-management.md

# 2. Запустите скрипт загрузки
node scripts/load-psychology-embeddings.js

# 3. Скрипт автоматически найдёт новый файл и загрузит
```

### Вариант 2: Прямая вставка в таблицу
```sql
-- Для простого добавления текста без embeddings
INSERT INTO psychology_knowledge (title, section, content_chunk, embedding, category, keywords)
VALUES (
  'My Title',
  'My Section', 
  'My content...',
  array_to_vector(array_agg(0::float)) OVER (),  -- Will be filled based on search
  'anxiety',
  ARRAY['keyword1', 'keyword2']
);
```

## Monitoring / Мониторинг

### Проверить размер таблицы:
```sql
SELECT 
  pg_size_pretty(pg_total_relation_size('psychology_knowledge')) as size,
  COUNT(*) as record_count
FROM psychology_knowledge;
```

### Проверить успешность поиска:
```sql
-- Пример: поиск для "тревога"
SELECT 
  search_psychology_knowledge(
    array[-0.12, 0.45, 0.67, ... ]::vector  -- 384 dims
  );
```

## Next Steps / Следующие шаги

1. ✅ **Готово**: Структура RAG создана
2. ⏳ **Нужно**: Запустить SQL миграцию в Supabase
3. ⏳ **Нужно**: Запустить скрипт загрузки embeddings
4. ⏳ **Нужно**: Протестировать поиск (`test-knowledge-search.js`)
5. ⏳ **Нужно**: Тестировать реальные запросы в чате

## File Structure / Структура файлов

```
📦 Project Root
├── 📂 psychology_knowledge/          ← Исходные MD файлы
│   ├── anxiety-management.md
│   ├── depression-support.md
│   ├── emotional-regulation.md
│   ├── mindfulness-meditation.md
│   └── stress-management.md
│
├── 📂 scripts/
│   ├── load-psychology-embeddings.js  ← Загрузка в БД
│   └── test-knowledge-search.js       ← Тестирование
│
├── 📂 sql/
│   └── psychology_embeddings.sql      ← БД миграция
│
├── 📂 src/
│   ├── lib/
│   │   └── knowledge-search.js        ← RAG поиск функции
│   ├── data/
│   │   └── systemPrompt.js            ← Единая система промпта
│   └── app/api/chat/
│       └── route.js                   ← Использует RAG
│
└── .env.local                         ← Конфиг переменные
```

---

**Questions?** / **Вопросы?**

Проверьте логи скрипта, ошибки обычно указывают на конкретную проблему (Ollama недоступен, Supabase API ошибка и т.д.).
