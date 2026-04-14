# 📋 Telegram Bot - Чек-лист настройки

## ✅ Что уже сделано в коде:

- ✅ Установлен пакет `telegraf`
- ✅ Создана логика инициализации бота в `src/lib/telegram/botConfig.js`
- ✅ Создана система управления пользователями в `src/lib/telegram/userManager.js`
- ✅ Реализованы обработчики команд в `src/lib/telegram/handlers.js`
- ✅ Установлен webhook endpoint: `POST /api/telegram/webhook`
- ✅ Создан API для глубокой ссылки: `POST /api/telegram/deep-link`
- ✅ Добавлена UI компонента в профиль: `TelegramLinkCard.jsx`
- ✅ Подготовлены SQL-инструкции для обновления `profiles`

---

## ⚙️ Что вам нужно сделать (ВАЖНО):

### 1️⃣ Создать бота у BotFather (5 мин)

```
BotFather → /newbot → выбрать имя и username → получить TOKEN
```

**Сохранить токен и username для следующего шага!**

### 2️⃣ Добавить переменные окружения в `.env.local` (2 мин)

```
TELEGRAM_BOT_TOKEN=ваш_токен_от_BotFather
TELEGRAM_BOT_USERNAME=ваш_username_без_@
```

Пример:
```
TELEGRAM_BOT_TOKEN=123456789:ABCDefGhIKlmnoPQRStuvYZAbcDefgHiJK
TELEGRAM_BOT_USERNAME=diplomaproject_bot
```

### 3️⃣ Выполнить SQL миграцию в Supabase (3 мин)

Откройте Supabase Dashboard → SQL Editor → выполните SQL ниже

Или выполните вручную:
```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON public.profiles(telegram_id)
WHERE telegram_id IS NOT NULL;
```

### 4️⃣ После деплоя на production - установить webhook (2 мин)

После того как проект задеплоен на Vercel или другой хостинг:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://yourdomain.com/api/telegram/webhook"
```

Например:
```bash
curl -X POST "https://api.telegram.org/bot123456789:ABCDefGhIKlmnoPQRStuvYZAbcDefgHiJK/setWebhook?url=https://diplomaproject.vercel.app/api/telegram/webhook"
```

Проверить что установлен:
```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

---

## 📂 Структура файлов:

```
src/
├── lib/telegram/
│   ├── botConfig.js      📦 Инициализация
│   ├── userManager.js    👤 Управление пользователями
│   └── handlers.js       💬 Команды и сообщения
│
├── app/api/telegram/
│   ├── webhook/route.js  🔌 POST для получения обновлений
│   └── deep-link/route.js 🔗 API для генерации ссылки
│
└── (app)/profile/_components/
    └── TelegramLinkCard.jsx 🎨 UI компонента

Supabase SQL Editor  🗄️ Изменения схемы БД
```

---

## 🧪 Тестирование локально (опционально)

Для тестирования webhook локально:

```bash
# Установить ngrok
npm install -g ngrok

# Запустить сервер
npm run dev

# В новом termin ale:
ngrok http 3000

# Установить webhook на ngrok URL
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://xxxx-xx-xxx-xxx-xx.ngrok.io/api/telegram/webhook"
```

---

## 🎯 Результат:

Когда всё настроено, пользователи смогут:

1. Открыть свой профиль на сайте
2. Нажать "Связать с ботом" в секции Telegram
3. Перейти в Telegram и нажать на бота
4. Автоматически связать аккаунты
5. Использовать команды бота для управления заметками

**Все данные будут синхронизированы между сайтом и ботом! ✅**

---

## 📖 Полная документация:

Смотрите `TELEGRAM_SETUP_GUIDE.md` для подробных инструкций и примеров.

---

## ❓ Часто задаваемые вопросы:

**В: Когда мне устанавливать webhook?**
А: Только после деплоя на production. Локально используйте ngrok.

**В: Где взять BOT TOKEN?**
А: Напишите @BotFather в Telegram и создайте бота через `/newbot`

**В: Все данные будут синхронизированы?**
А: Да! Все связано через `user_id` в БД. Заметки видны везде.

**В: Можно добавить больше команд?**
А: Да, смотрите раздел 13 в `TELEGRAM_SETUP_GUIDE.md`

---

**Готово к настройке?** 🚀 Начните с шага 1️⃣!
