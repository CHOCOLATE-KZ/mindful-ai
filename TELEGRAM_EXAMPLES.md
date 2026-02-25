// TELEGRAM_EXAMPLES.md
# 🤖 Примеры использования Telegram API

## Примеры кода для работы с Telegram ботом

### 1️⃣ Генерация Deep Link (фронт-енд)

```javascript
// src/app/(app)/profile/_components/TelegramLinkCard.jsx

async function generateDeepLink() {
  const response = await fetch('/api/telegram/deep-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.id }),
  });

  const { deepLink } = await response.json();
  // deepLink: "https://t.me/diplomaproject_bot?start=user-uuid"
  
  // Открыть в Telegram
  window.location.href = deepLink;
}
```

### 2️⃣ Связь аккаунтов в боте (back-end)

```javascript
// src/lib/telegram/handlers.js

export async function handleStart(ctx) {
  const userId = ctx.payload; // из deep link параметра
  const telegramId = ctx.from.id;

  if (userId) {
    // Связываем аккаунт
    await linkTelegramAccount(userId, telegramId);
    
    ctx.reply('✅ Аккаунт связан!');
  }
}
```

### 3️⃣ Получение данных связанного пользователя

```javascript
// Получить user_id по telegram_id
const userId = await getUserIdByTelegramId(ctx.from.id);

if (!userId) {
  return ctx.reply('❌ Аккаунт не связан! /link');
}

// Теперь используем userId в запросах
const { data: notes } = await supabaseAdmin
  .from('notes')
  .select('*')
  .eq('user_id', userId)
  .order('date', { ascending: false })
  .limit(5);
```

### 4️⃣ Команда для получения заметок

```javascript
// src/lib/telegram/handlers.js

export async function handleNotes(ctx) {
  const userId = await getUserIdByTelegramId(ctx.from.id);

  if (!userId) {
    return ctx.reply('⚠️ Аккаунт не связан.\nИспользуйте /link');
  }

  // Получаем заметки из Supabase
  const { data: notes } = await supabaseAdmin
    .from('notes')
    .select('id, comment, mood, sleep, date')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(5);

  if (!notes || notes.length === 0) {
    return ctx.reply('📝 У вас еще нет заметок.');
  }

  // Форматируем ответ
  let text = '📝 Ваши последние заметки:\n\n';
  notes.forEach((note, i) => {
    const date = new Date(note.date).toLocaleDateString('ru-RU');
    text += `${i + 1}. ${date}\n`;
    if (note.mood) text += `   Настроение: ${'😊'.repeat(note.mood)}\n`;
    if (note.comment) text += `   "${note.comment}"\n\n`;
  });

  ctx.reply(text);
}
```

### 5️⃣ Добавление заметки через бота

```javascript
// Можно расширить обработчик для сохранения заметок

export async function saveNoteFromTelegram(ctx, noteData) {
  const userId = await getUserIdByTelegramId(ctx.from.id);

  if (!userId) {
    return ctx.reply('❌ Аккаунт не связан!');
  }

  const { data, error } = await supabaseAdmin
    .from('notes')
    .insert({
      user_id: userId,
      comment: noteData.text,
      mood: noteData.mood,
      sleep: noteData.sleep,
      date: new Date().toISOString(),
    });

  if (error) {
    return ctx.reply('❌ Ошибка при сохранении');
  }

  ctx.reply('✅ Заметка сохранена!');
}
```

### 6️⃣ Получение статистики пользователя

```javascript
export async function getUserStats(telegramId) {
  const userId = await getUserIdByTelegramId(telegramId);

  if (!userId) return null;

  const { data: notes } = await supabaseAdmin
    .from('notes')
    .select('mood, sleep')
    .eq('user_id', userId)
    .limit(30);

  if (!notes || notes.length === 0) return null;

  const stats = {
    totalNotes: notes.length,
    avgMood: Math.round(
      notes.reduce((a, n) => a + (n.mood || 0), 0) / notes.length
    ),
    avgSleep: Math.round(
      notes.reduce((a, n) => a + (n.sleep || 0), 0) / notes.length / 60
    ),
  };

  return stats;
}
```

### 7️⃣ Проверка что пользователь зарегистрирован

```javascript
const isRegistered = await isValidUser(userId);

if (!isRegistered) {
  return ctx.reply('❌ Пользователь не найден');
}
```

### 8️⃣ Inline buttons в боте

```javascript
import { Markup } from 'telegraf';

bot.command('menu', (ctx) => {
  ctx.reply(
    'Выберите действие:',
    Markup.inlineKeyboard([
      [
        Markup.button.callback('📝 Заметки', 'notes'),
        Markup.button.callback('📊 Статистика', 'stats'),
      ],
      [
        Markup.button.url('🌐 Открыть сайт', 'https://diplomaproject.com'),
      ],
    ])
  );
});

bot.action('notes', handleNotes);
bot.action('stats', handleStats);
```

### 9️⃣ Обработка текстовых сообщений

```javascript
bot.on('text', async (ctx) => {
  const message = ctx.message.text;
  
  // Проверяем команду
  if (message.toLowerCase().includes('привет')) {
    return ctx.reply('Привет! 👋');
  }

  if (message.toLowerCase().includes('помощь')) {
    return ctx.reply('Используйте /help');
  }

  // Сохраняем как заметку
  const userId = await getUserIdByTelegramId(ctx.from.id);
  
  if (userId) {
    await supabaseAdmin.from('notes').insert({
      user_id: userId,
      comment: message,
      date: new Date().toISOString(),
    });
    
    ctx.reply('✅ Сообщение сохранено как заметка!');
  }
});
```

### 🔟 Отправка уведомлений пользователю

```javascript
import { supabaseAdmin } from '@/lib/supabase/admin';

async function notifyUser(userId, message) {
  // Получаем telegram_id пользователя
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('telegram_id')
    .eq('id', userId)
    .single();

  if (profile?.telegram_id) {
    // Отправляем сообщение
    try {
      await bot.telegram.sendMessage(profile.telegram_id, message);
    } catch (error) {
      console.error('Ошибка при отправке уведомления:', error);
    }
  }
}

// Использование:
// notifyUser(userId, '📝 У вас новая заметка!');
```

### 1️⃣1️⃣ Webhook Verification (опционально)

```javascript
// src/app/api/telegram/webhook/route.js

const SECRET_TOKEN = 'your-secret-token';

export async function POST(request) {
  const token = request.headers.get('x-telegram-bot-api-secret-token');

  if (token !== SECRET_TOKEN) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  await bot.handleUpdate(body);

  return new Response('OK', { status: 200 });
}
```

### 1️⃣2️⃣ Обработка ошибок

```javascript
bot.catch((err, ctx) => {
  console.error('Ошибка бота:', err);
  
  ctx.reply('❌ Произошла ошибка. Попробуйте позже.')
    .catch((error) => {
      console.error('Ошибка при отправке ошибки:', error);
    });
});
```

### 1️⃣3️⃣ Логирование действий пользователей

```javascript
async function logUserAction(telegramId, action, data = {}) {
  const userId = await getUserIdByTelegramId(telegramId);

  if (userId) {
    console.log(`[${userId}] ${action}`, data);
    
    // Можно также сохранить в БД для аналитики
    // await supabaseAdmin.from('telegram_logs').insert({ ... });
  }
}

// В обработчиках:
bot.command('notes', async (ctx) => {
  await logUserAction(ctx.from.id, 'called_notes_command');
  // ... остальная логика
});
```

### 1️⃣4️⃣ Проверка авторизации и RLS

```javascript
// Убедитесь что RLS включен для profiles таблицы
// Это ВАЖНО для безопасности!

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Service role (для бота) может читать и писать
CREATE POLICY "Service role full access" ON public.profiles
FOR ALL USING (auth.role() = 'service_role');

-- Обычные пользователи видят только свой профиль
CREATE POLICY "Users can read own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);
```

---

## 📊 Типичный Flow:

```
Пользователь на сайте
       ↓
Открывает профиль → TelegramLinkCard
       ↓
Нажимает "Связать с ботом"
       ↓
Генерируется deep link через /api/telegram/deep-link
   (содержит userId в параметре ?start=)
       ↓
Переход в Telegram бота
       ↓
handleStart() получает userId
       ↓
linkTelegramAccount(userId, telegramId)
   (сохраняет telegram_id в profiles таблице)
       ↓
✅ Аккаунты связаны!
       ↓
Теперь пользователь может:
- /notes - видеть заметки
- /stats - видеть статистику
- /today - добавить заметку
- И все данные синхронизированы между сайтом и ботом ✅
```

---

## 🔗 Структура данных в БД:

```sql
-- После связи аккаунтов:

profiles таблица:
┌────────────────────────────────────────────┐
│ id (UUID)      | name   | telegram_id     │
├────────────────────────────────────────────┤
│ abc-123-def    | Иван   | 123456789       │ ← Связаны!
└────────────────────────────────────────────┘

notes таблица (одинаковая для всех источников):
┌──────────────────────────────────────────────────────┐
│ user_id        | comment      | source    │ date      │
├──────────────────────────────────────────────────────┤
│ abc-123-def    | Заметка 1    | web       │ 2024-01-15│
│ abc-123-def    | Заметка 2    | telegram  │ 2024-01-14│
│ abc-123-def    | Заметка 3    | web       │ 2024-01-13│
└──────────────────────────────────────────────────────┘

✅ Все связано через user_id!
```

---

Для более сложных сценариев смотрите `TELEGRAM_SETUP_GUIDE.md` 📖
