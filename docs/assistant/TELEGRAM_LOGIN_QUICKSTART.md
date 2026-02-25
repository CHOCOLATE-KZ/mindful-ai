# Telegram Login - Быстрая настройка

## 🚀 3 шага для запуска

### Шаг 1: Переменные окружения

Добавьте в `.env.local`:

```env
# Telegram Bot (уже должно быть)
TELEGRAM_BOT_TOKEN=8328292703:AAFuYaEE_WeuDQwKa0zp2NTg79CihCjqID0
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=IITUpsychologyAIbot

# Site URL (новое)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Шаг 2: Проверьте БД

Убедитесь что поля `telegram_id` и `telegram_username` уже есть в таблице `profiles` (они должны быть добавлены ранее).

Если нет, выполните:

```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS telegram_username TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id 
ON profiles(telegram_id);
```

### Шаг 3: Запустите проект

```bash
npm run dev
```

## ✅ Проверка

1. Откройте http://localhost:3000/auth/sign-in
2. Увидите кнопку "Log in with Telegram"
3. Нажмите на кнопку
4. Откроется Telegram виджет
5. Нажмите "Accept"
6. Вы будете перенаправлены на /chat

## 🎯 Созданные файлы

### Новые компоненты
- ✅ `src/components/TelegramLoginButton.jsx` - Telegram Login Widget
- ✅ `src/components/TelegramLoginLink.jsx` - Альтернативная кнопка

### Новые API
- ✅ `src/app/api/auth/telegram/route.js` - Обработка Telegram auth

### Обновленные файлы
- ✅ `src/app/(public)/auth/sign-in/page.js` - Добавлена кнопка
- ✅ `src/lib/telegram/handlers.js` - Поддержка start=login

### Документация
- ✅ `docs/assistant/TELEGRAM_LOGIN_GUIDE.md` - Полная документация
- ✅ `docs/assistant/TELEGRAM_LOGIN_QUICKSTART.md` - Этот файл

## 🔧 Как это работает

```
User clicks "Log in with Telegram"
    ↓
Telegram Widget opens (iframe)
    ↓
User accepts in Telegram
    ↓
Widget returns: id, username, hash, auth_date
    ↓
Client sends to /api/auth/telegram
    ↓
API verifies hash (HMAC-SHA256)
    ↓
API finds or creates user in Supabase
    ↓
API generates session
    ↓
User redirected to /chat
```

## 🎨 UI Integration

Кнопка уже добавлена в `/auth/sign-in`:

```jsx
<TelegramLoginButton 
  size="large"
  redirectUrl="/chat"
  className="w-full"
/>
```

## 🐛 Troubleshooting

### Кнопка не появляется
- Проверьте `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` в .env.local
- Перезапустите dev server

### "Invalid Telegram authentication data"
- Проверьте `TELEGRAM_BOT_TOKEN`
- Убедитесь что используете правильный бот

### Widget не загружается
- Откройте консоль браузера
- Проверьте что `telegram.org/js/telegram-widget.js` загрузился
- Проверьте блокировщики рекламы

## 📊 Тестовые сценарии

### Сценарий 1: Новый пользователь
1. Откройте /auth/sign-in
2. Нажмите "Log in with Telegram"
3. Разрешите доступ
4. **Ожидаемый результат:** Новый аккаунт создан, вход выполнен

### Сценарий 2: Существующий пользователь
1. Пользователь ранее входил через Telegram
2. Нажимает "Log in with Telegram"
3. **Ожидаемый результат:** Вход выполнен без создания нового аккаунта

### Сценарий 3: Связка с существующим аккаунтом
1. Пользователь вошел через email/password
2. Открыл /profile
3. Нажал "Связать с ботом" в TelegramLinkCard
4. Перешел в Telegram и нажал START
5. **Ожидаемый результат:** Telegram связан с аккаунтом

## 🔐 Безопасность

✅ Hash валидация (HMAC-SHA256)
✅ Проверка срока действия (24 часа)
✅ Unique constraint на telegram_id
✅ RLS политики Supabase
✅ Генерация случайного пароля

## 🎉 Готово!

После выполнения этих шагов функция входа через Telegram полностью работает!

**Проверьте:**
- ✅ Кнопка на странице входа
- ✅ Widget загружается
- ✅ Вход работает
- ✅ Пользователь создается в БД

## 📚 Дополнительно

**Полная документация:** [TELEGRAM_LOGIN_GUIDE.md](./TELEGRAM_LOGIN_GUIDE.md)

**Вопросы?** Все описано в полной документации!

---

*Обновлено: 25 февраля 2026*
