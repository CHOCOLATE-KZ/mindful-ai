# MindfulAI — Project Overview

> Актуально на: май 2026  
> Для: передачи другому ИИ, код-ревью, новых фич

---

## Что это

**MindfulAI** — веб-приложение + Telegram-бот для психологической поддержки пользователей. Помогает вести дневник настроения, общаться с ИИ-психологом, проходить тесты и отслеживать динамику состояния.

Дипломный проект, IITU, специальность 6В06106 Software Engineering.

---

## Стек технологий

| Слой | Технологии |
|---|---|
| Frontend | Next.js 16 (App Router), React, Tailwind CSS, Framer Motion |
| Backend | Next.js API Routes (Edge / Node) |
| БД | Supabase (PostgreSQL + RLS + Auth) |
| ИИ | LM Studio (meta-llama-3.1-8b-instruct) + RAG + safety/prompt pipeline |
| Telegram | Webhook + Polling (node-telegram-bot-api) |
| Деплой | Docker, docker-compose |
| Аутентификация | Supabase Auth (email/password, OAuth Google/Apple) |

---

## Структура проекта

```
src/
  app/
    (public)/           # Публичные страницы (без авторизации)
      page.js           # Главная / лендинг
      auth/             # sign-in, sign-up, callback
      psychology/       # Психологические статьи
      news/             # Новости
      about/, faq/, contacts/, privacy/, terms/
    (app)/              # Приватные страницы (нужна авторизация)
      chat/             # Чат с ИИ
      notes/            # Дневник
      analytics/        # Аналитика
      exercises/        # Тесты и упражнения
      profile/          # Профиль пользователя
    api/                # API маршруты
  components/
    landing/            # Секции лендинга
    chat/               # Компоненты чата
    ui/                 # Общие UI-компоненты
  features/
    chat/               # Хуки чата (useChatActions, useChatHistory, useVoiceInput)
  lib/                  # Утилиты, i18n, supabase client
```

---

## Страницы и функционал

### Публичные (без авторизации)

| Страница | Путь | Описание |
|---|---|---|
| Лендинг | `/` | Hero (email/OAuth регистрация), демо-чат, фичи, FAQ, волновой градиент фон |
| Психология | `/psychology` | Статьи по психологическим темам |
| Новости | `/news` | Новости проекта |
| FAQ | `/faq` | Частые вопросы |
| Войти | `/auth/sign-in` | Email + Google/Apple OAuth |
| Регистрация | `/auth/sign-up` | Email + Google/Apple OAuth |

### Приватные (нужна авторизация)

| Страница | Путь | Описание |
|---|---|---|
| Чат с ИИ | `/chat` | Основной функционал — диалог с ИИ-психологом |
| Дневник | `/notes` | Записи настроения, мыслей, событий |
| Аналитика | `/analytics` | Графики настроения, AI-отчёт, статистика тестов |
| Упражнения | `/exercises` | Психологические тесты (PHQ-9, GAD-7, DASS-21 и др.) + карусель упражнений |
| Профиль | `/profile` | Настройки аккаунта, аватар, экспорт данных |

---

## Функционал чата (`/chat`)

### Основные возможности
- **Текстовый чат с ИИ** — стриминг ответов, история сообщений (Supabase)
- **Голосовой режим** — полноэкранная панель с анимированной blob-сферой (Framer Motion):
  - `idle → listening → thinking → speaking`
  - Web Speech API для распознавания (только HTTPS/localhost)
  - TTS для озвучки ответа ИИ
  - Сфера меняет форму и цвет по состоянию (цвет проекта `#74AA9C`)
- **Режим сеанса** — включает EmotionTracker, подтверждение через модалку
- **Анкоры/заметки** — сохранение цитат из чата, просмотр в боковой панели
- **Очистка истории** — через меню
- **Экспорт данных** — через меню

### Компоненты чата
```
chat/_components/
  ChatComposer.jsx       # Поле ввода + кнопки (голос, сеанс, отправка)
  ChatConversation.jsx   # Список сообщений
  ChatHeader.jsx         # Шапка чата с меню
  ChatSidebarNav.jsx     # Иконки навигации слева
  VoiceConversationPanel.jsx  # Полноэкранный голосовой режим
  ChatNotesModal.jsx     # Модалка заметок чата
  ChatBackground.jsx     # Фоновые эффекты
```

### Хуки
```
chat/_hooks/
  useChatPageModel.js    # Главный хук — объединяет всё
  useChatSend.js         # Логика отправки сообщений в ИИ
  useChatHistory.js      # Загрузка истории из Supabase
  useVoiceInput.js       # Web Speech API (распознавание речи)
  useChatNotes.js        # Работа с анкорами/заметками
  useChatScroll.js       # Скролл к низу/верху
```

---

## API маршруты

| Маршрут | Метод | Описание |
|---|---|---|
| `/api/chat` | POST | Отправка сообщения ИИ (LM Studio), персонализация, safety-фильтры, RAG |
| `/api/chat/clear` | POST | Очистка истории чата |
| `/api/chat/notes` | GET/POST | Анкоры/заметки из чата |
| `/api/notes/analyze` | POST | AI-анализ записей дневника |
| `/api/ai/profile-report` | POST | AI-отчёт для аналитики |
| `/api/emotion` | POST | Запись эмоции (EmotionTracker) |
| `/api/export` | GET | Экспорт данных пользователя |
| `/api/profile/stats` | GET | Статистика профиля |
| `/api/profile/delete` | DELETE | Удаление аккаунта |
| `/api/profile/export` | GET | Экспорт профиля |
| `/api/news` | GET | Новости |
| `/api/reminders` | GET/POST | Напоминания |
| `/api/health` | GET | Health-check |
| `/api/telegram/webhook` | POST | Telegram webhook |
| `/api/telegram/deep-link` | GET | Deep link для Telegram |
| `/api/auth/telegram` | POST | Telegram OAuth |
| `/api/rag-debug` | GET | Отладка RAG (psychology knowledge) |
| `/api/debug/session` | GET | Отладка сессии |

---

## ИИ и Psychology Knowledge Base

### Как работает чат с ИИ
1. Пользователь отправляет сообщение
2. До LLM применяется safety-пайплайн:
  - hard-block на криминальные/опасные инструкции
  - crisis detector (суицидальные/опасные триггеры)
  - intent-классификация (greeting/positive/gratitude/neutral)
3. Для не-легковесных сообщений API route собирает контекст пользователя:
  - настройки приватности и персонализации (`user_settings`)
  - профиль (`profiles`)
  - последние заметки (`notes`)
  - историю диалога (`ai_messages`, до 25)
4. Автоклассификатор выбирает режим ответа: `LISTENING`, `ANALYSIS`, `GUIDANCE`
5. При включенном RAG подтягиваются релевантные фрагменты из `psychology_knowledge`
  через embeddings (LM Studio `/v1/embeddings`) и RPC `search_psychology_knowledge`
6. Формируется multi-system prompt (режим, ограничения, контекст, emotion hints)
7. Выполняется запрос к LM Studio (`/v1/chat/completions`) с mode-specific параметрами
8. Ответ проходит post-validation (антидублирование/согласованность тона), сохраняется в `ai_messages`

### Psychology Knowledge Base
```
src/lib/knowledge-search.js      # Semantic search + keyword fallback
psychology_knowledge/            # MD-файлы по темам:
  anxiety-management.md
  depression-support.md
  stress-management.md
  anger-management.md
  burnout-exhaustion.md
  cognitive-distortions.md
  emotional-regulation.md
  grief-loss.md
  mindfulness-meditation.md
  relationships-communication.md
  self-esteem.md
  sleep-problems.md
  social-anxiety.md
  trauma-ptsd.md
```
Ключевые моменты:
- Основной путь: embedding-поиск + Supabase RPC `search_psychology_knowledge`
- Fallback: поиск по ключевым словам при недоступности embeddings
- RAG управляется env-параметрами: `ENABLE_PSYCHOLOGY_RAG`, `RAG_LIMIT`, `RAG_MIN_QUERY_LENGTH`

### AI-отчеты для аналитики
- `POST /api/ai/profile-report` генерирует структурированный JSON-отчет по заметкам, тестам и чату
- Поддерживаются режимы `profile` и `weekly`
- Считаются derived-метрики: `riskIndex`, `resourceIndex`, confidence, тренды, топ-сигналы
- Отчеты сохраняются в `ai_reports`, список доступен через `GET /api/ai/profile-report`

---

## Telegram-бот

- Два режима работы: webhook (`/api/telegram/webhook`) и polling (`src/telegram-bot-polling.js`)
- Команды бота: `/start`, `/help`, `/mood`, `/note`, `/stats`, `/remind`, `/export`, `/stop`
- Интеграция с тем же LM Studio ИИ
- Deep-link авторизация через Supabase

---

## База данных (Supabase)

Основные таблицы:
| Таблица | Описание |
|---|---|
| `profiles` | Профили пользователей (avatar_url, bio и др.) |
| `user_settings` | Настройки (language, ai_personalization, data_sharing_ai, reminders и др.) |
| `ai_messages` | История диалога с ИИ |
| `chat_notes` | Анкоры/заметки из чата |
| `notes` | Записи дневника (mood, sleep, текст) |
| `tests_log` | Результаты психологических тестов |
| `ai_reports` | Профильные и недельные AI-отчеты |
| `emotions` | Записи EmotionTracker |
| `reminders` | Напоминания |
| `psychology_knowledge` | Чанки базы психологических знаний для RAG |

Все таблицы защищены **Row-Level Security (RLS)** — пользователь видит только свои данные.

---

## Лендинг (главная страница)

Секции в порядке расположения:
1. **HeroSection** — заголовок с TypingText, email-форма, OAuth-кнопки, ChatDemo (живой демо-диалог)
2. **ShowcaseSection** — "MindfulAI everywhere", веб + Telegram, WebGL шейдерный фон
3. **FeaturesSection** — ключевые фичи
4. **DemoSection** — демо функционала
5. **PsychologySection** — психологические темы
6. **HowItWorksSection** — как это работает
7. **FinalCtaSection** — призыв к действию
8. **FaqSection** — FAQ
9. **Footer**

---

## Локализация

Поддерживаемые языки: **RU, EN, KZ**  
Переключатель в Navbar. Файл переводов: `src/lib/i18n/translations.js`  
Хук: `useTranslation(namespace, lang)`

---

## Темизация

Светлая/тёмная тема через Tailwind `dark:` классы.  
CSS переменные в `globals.css`: `--bg`, `--fg` и др.  
Переключатель в Navbar (луна/солнце).

---

## Цвета проекта

| Назначение | Цвет |
|---|---|
| Основной (тил) | `#74AA9C` |
| Тёмный тил | `#4d8f82` |
| Светлый фон | `#f4fdfb` |
| Акцент тил | `#5a9e8f` |

---

## Переменные окружения (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
LMSTUDIO_BASE_URL=http://127.0.0.1:1234
LMSTUDIO_MODEL=meta-llama-3.1-8b-instruct
LMSTUDIO_TIMEOUT_MS=15000
LMSTUDIO_TEMPERATURE=0.6
ENABLE_PSYCHOLOGY_RAG=true
RAG_LIMIT=3
RAG_MIN_QUERY_LENGTH=8
LMSTUDIO_EMBED_MODEL=text-embedding-nomic-embed-text-v1.5
TELEGRAM_BOT_TOKEN=
NEXT_PUBLIC_APP_URL=
```

---

## Запуск

```bash
# Разработка
npm run dev

# Docker
docker-compose up

# Telegram polling (отдельно)
node telegram-bot-polling.js
```
