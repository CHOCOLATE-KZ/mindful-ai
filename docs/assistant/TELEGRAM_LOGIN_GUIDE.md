# Telegram Login - Документация

## Обзор

Реализована функция входа через Telegram аккаунт, позволяющая пользователям авторизовываться на сайте без использования email и пароля.

## Архитектура

### Компоненты

1. **TelegramLoginButton** (`src/components/TelegramLoginButton.jsx`)
   - Официальный Telegram Login Widget
   - Загружается через `telegram-widget.js`
   - Автоматическая валидация через hash

2. **TelegramLoginLink** (`src/components/TelegramLoginLink.jsx`)
   - Альтернативная кнопка-ссылка
   - Перенаправляет в Telegram бота
   - Не требует загрузки внешних скриптов

3. **API Endpoint** (`src/app/api/auth/telegram/route.js`)
   - Обработка аутентификации
   - Верификация данных от Telegram
   - Создание/поиск пользователя
   - Генерация сессии Supabase

4. **Bot Handler** (`src/lib/telegram/handlers.js`)
   - Обработка параметра `start=login`
   - Инструкции для пользователей

---

## Как это работает

### Метод 1: Telegram Login Widget (рекомендуемый)

```
1. Пользователь нажимает "Log in with Telegram" на странице входа
2. Открывается Telegram Widget (iframe)
3. Пользователь подтверждает вход в Telegram
4. Widget возвращает данные: id, first_name, username, hash, auth_date
5. Клиент отправляет данные на /api/auth/telegram
6. API проверяет подлинность данных (hash validation)
7. API ищет профиль с telegram_id или создает нового пользователя
8. API генерирует Supabase session
9. Пользователь перенаправляется на сайт
```

**Преимущества:**
- ✅ Официальное решение от Telegram
- ✅ Автоматическая валидация через hash
- ✅ Не требует взаимодействия с ботом
- ✅ Работает в iframe

### Метод 2: TelegramLoginLink

```
1. Пользователь нажимает кнопку
2. Открывается Telegram бот с параметром start=login
3. Бот показывает инструкции
4. Пользователь возвращается на сайт
5. Нажимает кнопку с виджетом
6. Процесс как в методе 1
```

**Использование:**
- Для мобильных устройств
- Когда нужно открыть Telegram приложение
- Для информирования пользователей

---

## Установка

### 1. Переменные окружения

Добавьте в `.env.local`:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=IITUpsychologyAIbot

# Site URL (для инструкций в боте)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. База данных

Убедитесь что в таблице `profiles` есть поля:

```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS telegram_username TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id 
ON profiles(telegram_id);
```

### 3. Интеграция в UI

В файле `src/app/(public)/auth/sign-in/page.js`:

```jsx
import TelegramLoginButton from "@/components/TelegramLoginButton";

// В разделе альтернативных входов
<TelegramLoginButton 
  size="large"
  redirectUrl="/chat"
  className="w-full"
/>
```

---

## API Endpoint

### POST /api/auth/telegram

**Request Body:**
```json
{
  "id": 123456789,
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "photo_url": "https://...",
  "auth_date": 1234567890,
  "hash": "abc123..."
}
```

**Response Success:**
```json
{
  "success": true,
  "userId": "uuid",
  "isNewUser": true,
  "redirectUrl": "https://...",
  "message": "Account created successfully"
}
```

**Response Error:**
```json
{
  "error": "Invalid Telegram authentication data"
}
```

### Валидация данных

API проверяет подлинность данных с помощью HMAC-SHA256:

```javascript
function verifyTelegramAuth(data, botToken) {
  const { hash, ...authData } = data;
  
  // Создаем строку для проверки
  const checkString = Object.keys(authData)
    .sort()
    .map((key) => `${key}=${authData[key]}`)
    .join("\n");
  
  // Secret key из bot token
  const secretKey = createHash("sha256").update(botToken).digest();
  
  // Вычисляем hash
  const calculatedHash = createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");
  
  return calculatedHash === hash;
}
```

---

## Создание пользователя

При первом входе через Telegram:

1. **Генерируется временный email:**
   ```
   telegram_123456789@temp.iitu.local
   ```

2. **Создается пользователь в Supabase Auth:**
   ```javascript
   {
     email: tempEmail,
     password: randomPassword,
     email_confirm: true,
     user_metadata: {
       name: "John Doe",
       telegram_id: 123456789,
       telegram_username: "johndoe",
       auth_provider: "telegram"
     }
   }
   ```

3. **Обновляется профиль:**
   ```javascript
   {
     telegram_id: 123456789,
     telegram_username: "johndoe",
     name: "John Doe",
     avatar_url: "https://..."
   }
   ```

4. **Создаются дефолтные настройки:**
   ```javascript
   {
     user_id: userId,
     theme: "light",
     language: "ru",
     notifications_enabled: true,
     data_sharing_with_ai: true
   }
   ```

---

## Связка существующего аккаунта

Если у пользователя уже есть аккаунт с email/password:

### Вариант 1: Профиль -> Telegram
1. Перейти в `/profile`
2. Найти TelegramLinkCard
3. Нажать "Связать с ботом"
4. Перейти по deep link в Telegram
5. Нажать START

### Вариант 2: Автоматическая связка
При входе через Telegram можно добавить логику проверки email:
- Если telegram_username совпадает с первой частью email
- Предложить связать аккаунты
- Требует подтверждения пользователя

---

## Безопасность

### Hash Verification
- Все данные от Telegram проверяются через HMAC-SHA256
- Secret key генерируется из bot token
- Проверяется срок действия (не старше 24 часов)

### Rate Limiting
Рекомендуется добавить:
```javascript
// В API endpoint
const rateLimit = new Map(); // telegram_id -> timestamp
const LIMIT_WINDOW = 60000; // 1 minute
const MAX_ATTEMPTS = 3;
```

### Session Security
- Генерируется magic link через Supabase Admin API
- Короткий срок жизни токена
- HTTPS обязателен в production

---

## Тестирование

### 1. Проверка Widget

Откройте `/auth/sign-in` и проверьте:
- ✅ Кнопка "Log in with Telegram" отображается
- ✅ При клике открывается Telegram виджет
- ✅ После авторизации происходит редирект

### 2. Проверка API

```bash
curl -X POST http://localhost:3000/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{
    "id": 123456789,
    "first_name": "Test",
    "username": "testuser",
    "auth_date": 1234567890,
    "hash": "test_hash"
  }'
```

### 3. Проверка бота

```
/start login
```

Должны получить инструкции по входу.

### 4. Проверка БД

```sql
SELECT 
  id,
  email,
  telegram_id,
  telegram_username,
  name
FROM profiles
WHERE telegram_id IS NOT NULL;
```

---

## Troubleshooting

### "Invalid Telegram authentication data"

**Причина:** Hash не совпадает

**Решение:**
1. Проверьте TELEGRAM_BOT_TOKEN в .env.local
2. Убедитесь что используется правильный bot username
3. Проверьте что данные не были изменены

### "Telegram bot token not configured"

**Причина:** Отсутствует TELEGRAM_BOT_TOKEN

**Решение:**
```env
TELEGRAM_BOT_TOKEN=8328292703:AAFuYaEE_WeuDQwKa0zp2NTg79CihCjqID0
```

### Widget не загружается

**Причина:** Неправильный bot username или скрипт не загрузился

**Решение:**
1. Проверьте NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
2. Откройте консоль браузера для ошибок
3. Проверьте что скрипт загружается: `telegram.org/js/telegram-widget.js`

### Пользователь создается но не логинится

**Причина:** Проблема с генерацией session

**Решение:**
1. Проверьте SUPABASE_SERVICE_ROLE_KEY
2. Используйте более надежный метод создания сессии
3. Проверьте RLS политики в Supabase

---

## Расширенные возможности

### Email-first аккаунт + Telegram

```javascript
// В API endpoint добавить
const { data: existingUser } = await supabaseAdmin
  .from('profiles')
  .select('id')
  .eq('email', `${username}@example.com`)
  .maybeSingle();

if (existingUser) {
  // Предложить связать аккаунты
}
```

### Multiple auth providers

```javascript
user_metadata: {
  auth_providers: ['email', 'telegram'],
  primary_auth: 'telegram'
}
```

### Avatar sync

Автоматическое обновление аватара из Telegram:

```javascript
if (photoUrl && !profile.avatar_url) {
  await supabaseAdmin
    .from('profiles')
    .update({ avatar_url: photoUrl })
    .eq('id', userId);
}
```

---

## Производительность

### Widget Loading
- Скрипт загружается асинхронно
- Не блокирует рендеринг страницы
- Кэшируется браузером

### API Response Time
- Проверка hash: ~1ms
- Database query: ~10-50ms
- Session generation: ~100-200ms
- **Total: ~200-300ms**

### Database Indexing
```sql
-- Для быстрого поиска по telegram_id
CREATE INDEX idx_profiles_telegram_id ON profiles(telegram_id);

-- Для поиска по username
CREATE INDEX idx_profiles_telegram_username ON profiles(telegram_username);
```

---

## FAQ

### Q: Можно ли войти если нет username в Telegram?
**A:** Да, username опциональный. Используется telegram_id (обязателен).

### Q: Что если пользователь меняет username?
**A:** При следующем входе через бота username автоматически обновится.

### Q: Безопасно ли хранить telegram_id?
**A:** Да, telegram_id это публичный идентификатор, но он уникален и постоянен.

### Q: Можно ли отвязать Telegram?
**A:** Да, добавьте функцию в профиле:
```javascript
await supabaseAdmin
  .from('profiles')
  .update({ telegram_id: null, telegram_username: null })
  .eq('id', userId);
```

### Q: Работает ли на мобильных?
**A:** Да, виджет автоматически открывает Telegram приложение на мобильных.

---

## Дальнейшие улучшения

- [ ] Добавить связку существующего email аккаунта с Telegram
- [ ] Rate limiting на API endpoint
- [ ] Логирование попыток входа
- [ ] Двухфакторная аутентификация (optional)
- [ ] Уведомления о входе через Telegram
- [ ] Настройка разрешений для Telegram входа
- [ ] Синхронизация профиля (имя, фото) с Telegram

---

## Ссылки

- [Telegram Login Widget](https://core.telegram.org/widgets/login)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [HMAC-SHA256](https://en.wikipedia.org/wiki/HMAC)

---

*Документация обновлена: 25 февраля 2026*
