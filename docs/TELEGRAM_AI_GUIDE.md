# Telegram Bot AI Integration Guide

## Обзор

Telegram бот теперь интегрирован с LM Studio для предоставления AI-ассистента психологической поддержки.

## Архитектура

### Компоненты

1. **lmStudioClient.js** - Клиент для работы с LM Studio API
   - `callLmStudio()` - Базовый вызов LM Studio API
   - `askAI()` - Простой вопрос-ответ
   - `askAIWithHistory()` - Диалог с историей
   - `buildUserContext()` - Получение контекста пользователя из Supabase

2. **handlers.js** - Обработчики Telegram команд
   - `handleMessage()` - Обработка текстовых сообщений с AI

3. **ai_messages** - Таблица для хранения истории диалогов
   - `source` - Источник сообщения (web/telegram)
   - `role` - Роль (user/assistant)
   - `content` - Текст сообщения

## Настройка

### 1. Переменные окружения

В `.env.local` должны быть установлены:

```env
# LM Studio API
LMSTUDIO_BASE_URL=http://127.0.0.1:1234
LMSTUDIO_MODEL=openai/gpt-oss-20b

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=IITUpsychologyAIbot
```

### 2. База данных

Выполните миграцию для добавления поля `source`:

```sql
ALTER TABLE ai_messages
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'web';

CREATE INDEX IF NOT EXISTS idx_ai_messages_source 
ON ai_messages(user_id, source, created_at DESC);

UPDATE ai_messages
SET source = 'web'
WHERE source IS NULL;
```

## Использование

### Запуск бота

```bash
npm run telegram:poll
```

### Диалог с AI

1. Пользователь связывает аккаунт через `/start {userId}`
2. Отправляет текстовое сообщение боту
3. Бот:
   - Получает историю диалога (последние 10 сообщений)
   - Строит контекст пользователя (имя, язык, последняя заметка)
   - Отправляет запрос в LM Studio
   - Сохраняет оба сообщения (user + assistant) с `source: 'telegram'`
   - Отправляет ответ пользователю

### Примеры диалогов

**Простой вопрос:**
```
User: Как справиться со стрессом?
Bot: [AI ответ с практическими советами]
```

**С контекстом:**
```
User: Не могу уснуть
Bot: [AI учитывает последнюю заметку о сне и настроении]
```

**История диалога:**
```
User: Я чувствую тревогу
Bot: [Первый ответ]
User: А что еще можно?
Bot: [Учитывает предыдущий контекст разговора]
```

## Особенности

### История диалога

- Хранится в таблице `ai_messages` с полем `source = 'telegram'`
- При каждом запросе загружаются последние 10 сообщений
- История изолирована между web и telegram (разные source)

### Контекст пользователя

```javascript
// Строится из:
- profile.name (имя)
- user_settings.language (язык)
- notes.last (последняя заметка: дата, настроение, сон)
```

### System Prompt

```javascript
"Ты эмпатичный психологический ассистент. Отвечай коротко, тепло, без клише. " +
"Давай простые практические шаги (дыхание, сон, движение, дневник). " +
"Избегай диагнозов и директив. Если нужен специалист — мягко предложи обратиться."
```

## Обработка ошибок

### LM Studio недоступен

```
⚠️ AI-ассистент временно недоступен.

Попробуйте позже или используйте команды: /help
```

### Аккаунт не связан

```
⚠️ Ваш аккаунт не связан с сайтом.

Для использования AI-ассистента свяжите аккаунт через /link
```

### Общая ошибка

```
Извините, произошла ошибка. Попробуйте позже.

Или используйте команды: /help
```

## Тестирование

### 1. Запустите LM Studio

Убедитесь, что LM Studio работает на `http://127.0.0.1:1234` с моделью `openai/gpt-oss-20b`.

### 2. Запустите бота

```bash
npm run telegram:poll
```

### 3. Свяжите аккаунт

1. Откройте профиль на сайте
2. Перейдите в раздел Telegram
3. Нажмите "Связать с ботом"
4. Перейдите по ссылке

### 4. Отправьте сообщение

```
Привет, мне грустно
```

### 5. Проверьте БД

```sql
SELECT * FROM ai_messages 
WHERE source = 'telegram' 
ORDER BY created_at DESC 
LIMIT 10;
```

## Отладка

### Проверка подключения к LM Studio

```bash
curl http://127.0.0.1:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-oss-20b",
    "messages": [{"role": "user", "content": "test"}],
    "temperature": 0.7,
    "max_tokens": 256
  }'
```

### Логи бота

При запуске через `npm run telegram:poll` все ошибки выводятся в консоль.

### Проверка истории

```javascript
// В handlers.js добавьте:
console.log('История:', messageHistory);
console.log('Контекст:', userContext);
console.log('Ответ AI:', aiResponse);
```

## Производительность

- **Typing indicator**: Показывается во время генерации ответа
- **Max tokens**: 256 (можно увеличить в lmStudioClient.js)
- **Temperature**: 0.7 (баланс между креативностью и точностью)
- **История**: 10 последних сообщений (можно изменить в handlers.js)

## Безопасность

1. **RLS политики**: Все запросы через supabaseAdmin с правами сервера
2. **Валидация**: Проверка связки аккаунта перед AI запросом
3. **Rate limiting**: Рекомендуется добавить на уровне Telegraf middleware
4. **Privacy**: Контекст не передается если `data_sharing_with_ai = false`

## Дальнейшие улучшения

- [ ] Rate limiting для предотвращения спама
- [ ] Команда `/ai_clear` для очистки истории Telegram
- [ ] Голосовой ввод/вывод
- [ ] Рекомендации упражнений на основе AI
- [ ] Анализ настроения в реальном времени
- [ ] Мультиязычность (сейчас только русский)

## Troubleshooting

### "LM Studio error (502)"

- Проверьте что LM Studio запущен
- Проверьте URL в .env.local
- Убедитесь что модель загружена

### "Ваш аккаунт не связан"

- Пользователь должен пройти по deep link с сайта
- Проверьте наличие telegram_id в profiles

### История не сохраняется

- Проверьте что в таблице `ai_messages` есть колонка `source`
- Проверьте права insert в таблице ai_messages

### AI отвечает не по-русски

- Проверьте SYSTEM_PROMPT в lmStudioClient.js
- Убедитесь что модель поддерживает русский язык
