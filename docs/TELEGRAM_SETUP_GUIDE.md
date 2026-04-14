# 🤖 Telegram Bot Setup Guide

## Структура Telegram интеграции

Все файлы, связанные с Telegram, находятся в одной папке `src/lib/telegram/` и `src/app/api/telegram/`.

```
src/
├── lib/
│   └── telegram/
│       ├── botConfig.js      # Инициализация бота (Telegraf)
│       ├── userManager.js    # Управление пользователями в Supabase
│       └── handlers.js       # Обработчики команд и сообщений
├── app/
│   └── api/
│       └── telegram/
│           ├── webhook/
│           │   └── route.js  # Webhook для получения обновлений
│           └── deep-link/
│               └── route.js  # API для генерации deep link
└── (app)/
    └── profile/
        └── _components/
            └── TelegramLinkCard.jsx  # UI компонент для связи аккаунтов
```

## 1. Создание Telegram бота

### Шаг 1: Создать бота у BotFather

1. Откройте Telegram → найдите **@BotFather**
2. Отправьте команду `/newbot`
3. Следуйте инструкциям:
   - **Имя бота:** diplomaproject (видимое имя)
   - **Username:** diplomaproject_bot (уникальный handle)
4. Получите **токен**: `123456789:ABCDefGhIKlmnoPQRStuvYZAbcDefgHiJK`

### Шаг 2: Сохранить токен в .env.local

```
TELEGRAM_BOT_TOKEN=123456789:ABCDefGhIKlmnoPQRStuvYZAbcDefgHiJK
TELEGRAM_BOT_USERNAME=diplomaproject_bot
```

## 2. Настройка Webhook

После разворачивания проекта на production (например, Vercel):

```bash
# Установить webhook на Telegram серверах
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://yourdomain.com/api/telegram/webhook"

# Пример:
curl -X POST "https://api.telegram.org/bot123456789:ABCDefGhIKlmnoPQRStuvYZAbcDefgHiJK/setWebhook?url=https://diplomaproject.vercel.app/api/telegram/webhook"
```

### Проверка что webhook установлен:

```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

Результат должен быть похож на:
```json
{
  "ok": true,
  "result": {
    "url": "https://yourdomain.com/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

## 3. Миграция БД

Выполните SQL миграцию в Supabase:

```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON public.profiles(telegram_id)
WHERE telegram_id IS NOT NULL;

COMMENT ON COLUMN public.profiles.telegram_id IS 'ID пользователя в Telegram для связи аккаунтов';
```

## 4. Структура и работа

### botConfig.js
Инициализирует Telegraf бота и регистрирует middleware.

```javascript
import { Telegraf } from 'telegraf';

export const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
```

### userManager.js
Функции для работы с Supabase:
- `linkTelegramAccount(userId, telegramId)` - связать аккаунты
- `getUserByTelegramId(telegramId)` - получить профиль по Telegram ID
- `generateDeepLink(userId, botUsername)` - создать ссылку для связи
- `isValidUser(userId)` - проверить существование пользователя

### handlers.js
Обработчики команд:
- `/start` - начало работы с глубокой ссылкой для связи
- `/help` - справка
- `/link` - как связать аккаунт
- `/notes` - последние заметки
- `/today` - добавить заметку за сегодня
- `/stats` - статистика
- Обработка текстовых сообщений

### webhook/route.js
POST endpoint, который получает обновления от Telegram и передает их боту.

```
POST /api/telegram/webhook
```

### deep-link/route.js
Генерирует глубокую ссылку для связи аккаунтов.

```
POST /api/telegram/deep-link
{ userId: "uuid-of-user" }

Response:
{ deepLink: "https://t.me/diplomaproject_bot?start=uuid-of-user" }
```

## 5. Как работает связь аккаунтов

### Deep Link система:

1. **На сайте:** Пользователь в профиле → Telegram нажимает "Связать с ботом"
2. **Генерируется ссылка:** `/api/telegram/deep-link` создает URL
   ```
   https://t.me/diplomaproject_bot?start=user_12345_abc123def
   ```
3. **В боте:** `handleStart()` получает параметр `userId` и:
   - Проверяет валидность `userId`
   - Сохраняет `telegram_id` в БД
   - Подтверждает связку
4. **Синхронизация:** Теперь все запросы используют один `user_id`

## 6. Использование в коде

### Получить текущего пользователя (Telegram):

```javascript
const userId = await getUserIdByTelegramId(ctx.from.id);

if (!userId) {
  return ctx.reply('❌ Ваш аккаунт не связан');
}

// Теперь используем userId для запросов к Supabase
const { data: notes } = await supabaseAdmin
  .from('notes')
  .select('*')
  .eq('user_id', userId);
```

### Сгенерировать deep link (на фронте):

```javascript
const response = await fetch('/api/telegram/deep-link', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: user.id }),
});

const { deepLink } = await response.json();
window.location.href = deepLink; // Переводит в Telegram
```

## 7. Примеры команд бота

```
/start              → Связь аккаунтов
/help               → Справка по командам
/link               → Как связать аккаунт
/notes              → Последние 5 заметок
/today              → Добавить заметку за сегодня
/stats              → Статистика
```

## 8. RLS Policies для Supabase (Security)

Убедитесь что в таблице `profiles` включен RLS:

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can read all" ON public.profiles
FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Service role can update all" ON public.profiles
FOR UPDATE USING (auth.role() = 'service_role');
```

## 9. Тестирование локально

### Для тестирования webhook локально используйте ngrok:

```bash
# Установить ngrok
npm install -g ngrok

# Запустить локальный сервер на 3000
npm run dev

# Открыть туннель
ngrok http 3000

# Получите URL вроде: https://xxxx-xx-xxx-xxx-xx.ngrok.io

# Установить webhook
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://xxxx-xx-xxx-xxx-xx.ngrok.io/api/telegram/webhook"
```

## 10. Переменные окружения

```
# .env.local

# Telegram Bot
TELEGRAM_BOT_TOKEN=ваш_токен_от_BotFather
TELEGRAM_BOT_USERNAME=ваше_имя_бота_без_@

# Supabase (уже должны быть)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 11. Структура данных в Supabase

### Таблица: profiles
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  avatar_url TEXT,
  telegram_id BIGINT UNIQUE,  -- Новая колонка для связи с Telegram
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

Все заметки, сообщения и данные связаны через `user_id`, поэтому:
- Заметка через сайт → видна в `/notes` команде бота
- Заметка через бота → видна на сайте в Notes разделе
- Статистика синхронизирована везде

## 12. Возможные ошибки и решения

### Ошибка: "TELEGRAM_BOT_TOKEN не установлен"
- Проверьте что `TELEGRAM_BOT_TOKEN` добавлен в `.env.local`
- Перезагрузите сервер после изменения `.env`

### Ошибка: "webhook не установлен"
- Выполните команду curl из шага 2
- Проверьте что domain правильный
- Убедитесь что /api/telegram/webhook открыт (не требует авторизации)

### Бот не отвечает на команды
- Проверьте логи на Vercel/в консоли
- Убедитесь что webhook установлен правильно: `getWebhookInfo`
- Проверьте что `TELEGRAM_BOT_TOKEN` правильный

### "Ваш аккаунт не связан"
- Пользователь не прошел по deep link с сайта
- Или попробовать еще раз нажать "Связать с ботом" в профиле
- Проверить в БД что колонка `telegram_id` добавлена в `profiles`

## 13. Добавление новых команд

Добавьте в `src/lib/telegram/handlers.js`:

```javascript
export async function handleNewCommand(ctx) {
  // ваша логика
  ctx.reply('Ответ');
}
```

Зарегистрируйте в `src/app/api/telegram/webhook/route.js`:

```javascript
bot.command('newcommand', handleNewCommand);
```

---

✅ **Готово!** Теперь ваш Telegram бот полностью интегрирован и все данные синхронизированы.
