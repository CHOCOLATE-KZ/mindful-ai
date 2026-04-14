# Telegram AI - Быстрый старт

## Шаги для тестирования AI в Telegram боте

### 1. Убедитесь что LM Studio запущен

```bash
# Проверьте эндпоинт
curl http://127.0.0.1:1234/v1/models
```

Должен вернуть список моделей, включая `openai/gpt-oss-20b`.

### 2. Выполните миграцию БД

Откройте Supabase Dashboard → SQL Editor и выполните:

```sql
ALTER TABLE ai_messages
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'web';

CREATE INDEX IF NOT EXISTS idx_ai_messages_source 
ON ai_messages(user_id, source, created_at DESC);

UPDATE ai_messages SET source = 'web' WHERE source IS NULL;
```

### 3. Запустите бота

```bash
npm run telegram:poll
```

Должны увидеть:
```
🤖 Telegram бот запущен в режиме polling!
Бот готов принимать сообщения...
```

### 4. Свяжите аккаунт

1. Откройте http://localhost:3000/profile
2. Найдите карточку "Telegram Integration"
3. Нажмите "Связать с ботом"
4. Перейдите по ссылке (откроется Telegram)
5. Нажмите START или /start

Должны увидеть:
```
✅ Аккаунт успешно связан!

Теперь все ваши данные синхронизированы между сайтом и ботом.

Доступные команды:
/help - справка
/notes - ваши заметки
/stats - статистика
```

### 5. Тестируйте AI

**Простой вопрос:**
```
Как справиться со стрессом?
```

**С контекстом:**
```
Мне грустно и не могу уснуть
```

**Продолжение диалога:**
```
А что еще можно попробовать?
```

### 6. Проверьте БД

Supabase Dashboard → Table Editor → ai_messages:

```sql
SELECT 
  created_at,
  role,
  content,
  source
FROM ai_messages
WHERE source = 'telegram'
ORDER BY created_at DESC
LIMIT 10;
```

Должны видеть:
- `role: 'user'` - ваши сообщения
- `role: 'assistant'` - ответы AI
- `source: 'telegram'` - все из бота

## Возможные проблемы

### "AI-ассистент временно недоступен"

**Причина:** LM Studio не запущен или недоступен

**Решение:**
1. Запустите LM Studio
2. Загрузите модель `openai/gpt-oss-20b`
3. Проверьте `.env.local`:
   ```env
   LMSTUDIO_BASE_URL=http://127.0.0.1:1234
   LMSTUDIO_MODEL=openai/gpt-oss-20b
   ```

### "Ваш аккаунт не связан с сайтом"

**Причина:** Telegram аккаунт не связан с пользователем

**Решение:**
1. Откройте профиль на сайте
2. Свяжите аккаунт через кнопку в TelegramLinkCard
3. Пройдите по deep link

### Бот не отвечает

**Причина:** Бот не запущен или crashed

**Решение:**
1. Проверьте терминал где запущен `npm run telegram:poll`
2. Ищите ошибки в логах
3. Перезапустите бота

### Ответы не сохраняются в БД

**Причина:** Не выполнена миграция или нет прав

**Решение:**
1. Выполните миграцию из шага 2
2. Проверьте RLS политики для `ai_messages`
3. Убедитесь что используете `supabaseAdmin` (не `supabase`)

## Команды для отладки

### Проверка LM Studio

```bash
curl -X POST http://127.0.0.1:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-oss-20b",
    "messages": [
      {"role": "system", "content": "Отвечай кратко"},
      {"role": "user", "content": "Привет"}
    ],
    "temperature": 0.7,
    "max_tokens": 50
  }'
```

### Проверка связки аккаунта

```sql
SELECT 
  id,
  name,
  telegram_id,
  telegram_username
FROM profiles
WHERE telegram_id IS NOT NULL;
```

### Очистка истории (если нужно)

```sql
DELETE FROM ai_messages 
WHERE source = 'telegram' 
AND user_id = 'your-user-id';
```

## Готово! 🎉

Теперь ваш Telegram бот работает с AI и готов помогать пользователям!

**Полная документация:** [TELEGRAM_AI_GUIDE.md](./TELEGRAM_AI_GUIDE.md)
