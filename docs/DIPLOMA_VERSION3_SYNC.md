# Синхронизация диплома Version3 с проектом MindfulAI

> **Документ-источник в Word:** `Version3_Karim_Ilyas,_Sovorovskiy_Artyom,_Shaheen_Amir_IT2CCO_2301.docx`  
> **Код проекта:** `diplomaproject` (состояние на май 2026)  
> **Назначение:** полный список расхождений, что убрали/добавили/изменили, и **готовые формулировки** для правки пояснительной записки перед защитой.

Старые файлы в `docs/` (`DIPLOMA_TEXT.md`, `DIPLOMA_PROJECT_FINAL.md`, `DIPLOMA_CHANGES_MAY_2026.md`) частично **устарели**. Для защиты опирайтесь на **этот файл** + `PROJECT_OVERVIEW.md`.

---

## 1. Краткий итог

| Аспект | В Version3 (Word) | В проекте сейчас |
|--------|-----------------|------------------|
| Якоря в чате | «anchors», цитаты из сообщений | **Убраны.** Только **заметки чата** (`chat_notes`) |
| Тёмная тема | Рис. 3.8, переключатель | **Убрана** (миграция `drop_theme_from_user_settings`) |
| Модель LLM | `gpt-oss-20b` | **`meta-llama-3.1-8b-instruct`** |
| Язык кода | TypeScript | **JavaScript** (`.js`, `.jsx`) |
| Пути в листингах | `.ts`, `bot/index.ts`, `lib/rag.ts` | См. раздел 8 |
| Docker | «не реализован» | **`docker-compose.yml` + `Dockerfile`** |
| OAuth | Email + Telegram (+ Google в тестах) | **Email + Telegram**, без Google/Apple |
| AI-отчёт | JSON / structured | **Markdown** + `formatProfileReport.js` |
| `/api/notes/analyze` | Подразумевается AI-ответ | Только **сохранение промпта** в БД |
| Telegram `/profile` | Упоминается | **Нет**; есть **`/link`** |

**Вывод:** структура диплома (3 главы, 15 источников, тесты, архитектура) — **хорошая**. Нужна **техническая и продуктовая синхронизация** по таблицам ниже.

---

## 2. Что убрали (продукт и текст диплома)

### 2.1. Функционал

| Убрано | Было (в старых описаниях / Version3) | Сейчас |
|--------|--------------------------------------|--------|
| **Якоря (anchors)** | Сохранение фрагментов диалога, теги над полем ввода, `AnchorsModal`, видимость в ленте | Нет компонентов `Anchor*`, нет привязки к `message_id` |
| **Тёмная тема UI** | Переключатель в Navbar / профиле, рис. 3.8 | `AppearanceCard` — только **язык**; класс `dark` в профиле закомментирован |
| **Тема в `user_settings`** | Поле `theme` | Миграция `20260521120000_drop_theme_from_user_settings.sql` |
| **Google / Apple OAuth** | В abstract/тестах иногда | Вход: **email/password** + **привязка Telegram** |
| **Команда Telegram `/profile`** | В §2.2 decomposition | Используйте **`/link`** (привязка аккаунта) |

### 2.2. Устаревшие формулировки в Word (удалить или заменить)

- `anchors feature for saving meaningful messages`
- `conversation anchors` / `anchor tags` (рис. 3.7)
- `Figure 3.8` — dark mode (если скрин не соответствует билду)
- `gpt-oss-20b` (все вхождения)
- `structured JSON` для profile/weekly report (если без оговорки про Markdown)
- `No containerization (Docker) is currently implemented` → см. раздел 5
- `match_psychology_knowledge` → `search_psychology_knowledge`
- `TypeScript` как основной язык реализации → **JavaScript**

---

## 3. Что добавили (по сравнению с ранними описаниями и Version3)

### 3.1. Backend / AI

| Добавление | Файлы / API |
|------------|-------------|
| Многоступенчатый **chat pipeline** (intent, hard-block, crisis, режимы LISTENING/ANALYSIS/GUIDANCE, RAG, post-validation) | `src/app/api/chat/route.js`, `src/lib/chat/*` |
| **RAG** с embedding + keyword fallback | `src/lib/knowledge-search.js`, RPC `search_psychology_knowledge` |
| **Персональный контекст** для LLM (профиль, заметки, настройки при consent) | `src/lib/chat/buildUserContext.js` |
| **AI-отчёт** profile + weekly, risk/resource, история | `POST/GET /api/ai/profile-report`, таблица `ai_reports` |
| **Форматирование отчётов** (Markdown, без сырого JSON в UI) | `src/lib/ai/formatProfileReport.js` |
| Кризисные / safety настройки в профиле | миграции `crisis_topic_mode`, `chat_summary` |
| Аудит **`notes_analysis`** | `POST /api/notes/analyze` → таблица `notes_analysis` (промпт, без вызова LLM) |
| **Экспорт** JSON/PDF из чата и профиля | `GET /api/export`, `GET /api/profile/export` |

### 3.2. Frontend / UX

| Добавление | Где |
|------------|-----|
| **Заметки чата** (модалка, боковая кнопка) | `ChatNotesModal.jsx`, `useChatNotes.js`, `/api/chat/notes` |
| **Голосовой режим** (Web Speech + TTS, blob UI) | `VoiceConversationPanel.jsx`, `useVoiceInput.js` |
| **Режим сеанса** + EmotionTracker (face-api) | `EmotionTracker.jsx`, `POST /api/emotion` |
| Отдельный **layout чата** без глобального Navbar | `LayoutContent`, `chat/page.js` |
| **Лендинг** (пересборка секций, tablet/phone mock) | `src/components/landing/*` |
| **Профиль:** AI-отчёт, карточки настроек, удаление аккаунта | `ProfileClient.jsx`, `ProfileAIReportCard.jsx` |
| **Аналитика:** графики, тесты, AI weekly | `analytics/page.js`, `AnalyticsAIReport.jsx` |
| **ABC-заметки** в дневнике | `notes` (`note_type`, `abc_*`) |
| Публичные **`/psychology`**, **`/news`**, FAQ на лендинге | `app/(public)/*` |
| i18n **RU / EN / KZ** | `src/lib/i18n/translations.js` |

### 3.3. Инфраструктура

| Добавление | Где |
|------------|-----|
| **Docker** | `docker-compose.yml`, `Dockerfile` |
| Миграции Supabase (май 2026) | `supabase/migrations/20260520*.sql`, `202605211*.sql` |
| Скрипт бота | `npm run telegram:poll` → `telegram-bot-polling.js` |

### 3.4. Психологические тесты и упражнения (в дипломе часто только GAD-7)

**Тесты:** `uncertainty_tolerance`, `manipulation_test`, `money_attitude`, `anxiety_gad7`, `stress_test`, `emotional_intelligence`, `burnout_test`.

**Практики:** `box_breathing`, `5_4_3_2_1`, `micro_body_scan`, `4_7_8_breathing`, `progressive_muscle_relaxation`, `loving_kindness_meditation`, `gratitude_journal`, `safe_place_visualization`, `autogenic_training`, `mindful_walking` (+ страница `/exercises/breathing-478`).

---

## 4. Что изменили (не убрали, но работает иначе)

### 4.1. Заметки чата вместо якорей

**Было (якоря):** пользователь выделял сообщение → сохранял цитату → теги в UI чата.

**Стало:**

1. Кнопка «Заметки» в `ChatSidebarNav` → модалка **«Заметки чата»**.
2. Пользователь вводит **тему/мысль** (до 120 символов).
3. Сохранение в `chat_notes` через `POST /api/chat/notes`.
4. По клику на заметку в поле ввода: `Хочу обсудить: {текст}` (`applyNoteToInput`).

**Текст для §2.7.1 (English, вставка в Word):**

> The chat interface includes a **chat notes** feature: users save short conversation topics in a modal dialog (`chat_notes` table). Selecting a note inserts a starter phrase into the message input (for example, “I would like to discuss: …”). Notes are **not** bound to specific chat messages and do not display as tags above the input area.

**Подпись к рис. 3.7:**

> Figure 3.7 — AI chat interface with side navigation rail and **chat notes** modal (light theme).

---

### 4.2. AI-отчёты (profile / weekly)

**Было в промптах/коде ранее:** жёсткий JSON (`summaryText`, `keyFindings`, …) → в UI попадал сырой JSON.

**Стало:**

- Промпт для **profile** просит **только Markdown** (`## Общее`, `## Тенденции`, …).
- Сервер: `buildStructuredFromRawReply` + `polishReportText` → чистый текст в БД и API.
- UI: `ReportMarkdown` + форматирование на клиенте (`formatStoredReportText`).
- Для profile под текстом **не дублируются** блоки keyFindings/plan (пустые массивы в ответе API).

**В дипломе писать:** «структурированный отчёт в формате Markdown с разделами; при необходимости метрики risk/resource выводятся отдельным UI-блоком».

---

### 4.3. Лендинг и навигация

- Главная: Hero → HowItWorks → Showcase → Features → Demo → Psychology → FAQ → CTA → Footer.
- Фон лендинга: `#f7f4ec`, без внешних stock-URL в Features.
- Из чата переход в **профиль** исправлен (portal click-outside в `ChatSidebarNav`).

---

### 4.4. Telegram-бот

| Version3 / старые docs | Актуально |
|------------------------|-----------|
| `bot/index.ts` | `telegram-bot-polling.js` + `src/lib/telegram/handlers.js` |
| 8 команд в abstract | `start`, `help`, `link`, `today`, `notes`, `stats`, `analyze`, `remind` |
| Webhook only | Webhook **`/api/telegram/webhook`** **и** polling `npm run telegram:poll` |

---

### 4.5. База знаний RAG

- Папка `psychology_knowledge/*.md` (14 тем).
- RPC: **`search_psychology_knowledge`** (не `match_psychology_knowledge`).
- Реализация: **`src/lib/knowledge-search.js`** (не `lib/rag.ts`).

---

## 5. Актуальные факты для всего документа (шпаргалка)

### 5.1. Стек

| Слой | Технологии |
|------|------------|
| Frontend | Next.js **16.2**, React **19**, Tailwind **4**, Framer Motion, Recharts, react-markdown |
| Backend | Next.js **API Routes** (JavaScript) |
| БД / Auth | Supabase (PostgreSQL, RLS, Auth) |
| AI | **LM Studio**, модель **`meta-llama-3.1-8b-instruct`**, embeddings `text-embedding-nomic-embed-text-v1.5` |
| Telegram | **Telegraf 4.16** |
| Эмоции (прототип) | face-api.js + `POST /api/emotion` (in-memory) |

### 5.2. Основные таблицы

`profiles`, `user_settings`, `ai_messages`, `chat_notes`, `notes`, `tests_log`, `ai_reports`, `emotions`, `reminders`, `psychology_knowledge`, `notes_analysis`.

### 5.3. API (ключевые)

| Маршрут | Назначение |
|---------|------------|
| `POST /api/chat` | Диалог с LLM + pipeline |
| `GET/POST /api/chat/notes` | Заметки чата |
| `POST /api/chat/clear` | Очистка истории |
| `POST /api/ai/profile-report` | Генерация отчёта (profile/weekly) |
| `GET /api/ai/profile-report` | История отчётов |
| `POST /api/notes/analyze` | Подготовка промпта анализа заметок (**без LLM**) |
| `POST /api/emotion` | Прототип эмоций с камеры |
| `GET /api/export`, `GET /api/profile/export` | Экспорт данных |
| `POST /api/telegram/webhook` | Telegram webhook |

### 5.4. Запуск

```bash
npm run dev              # http://localhost:3000
npm run telegram:poll    # бот (polling)
docker-compose up        # опционально, порт 3001
```

LM Studio: `http://127.0.0.1:1234`, модель из `.env.local` → `LMSTUDIO_MODEL`.

### 5.5. Ограничения (честно для §3.6.1 — актуализировать)

1. Зависимость от **локального LM Studio**.
2. **`/api/emotion`** — in-memory, не для longitudinal analytics.
3. **Напоминания** — настройка есть, **автоотправка по cron нет**.
4. **`/api/notes/analyze`** — сохраняет промпт, **не возвращает ответ модели**.
5. Система **не является** медицинским изделием / заменой терапевта.

**Docker:** не «отсутствует», а «базовая контейнеризация есть; production orchestration и отказоустойчивый LLM-endpoint — в перспективе».

---

## 6. Правки по главам Version3 (чеклист)

### Глава 1 — Analysis

- [ ] Таблица 1.1 (аналоги) — OK, при желании добавить строку про **локальный LLM + web + Telegram**.
- [ ] Таблица 1.2 — 15 источников — OK.
- [ ] Упоминания **gpt-oss-20b** в введении/abstract — заменить на **meta-llama-3.1-8b-instruct** (или «локальная open-weight модель через LM Studio»).

### Глава 2 — Design

- [ ] §2.3: **JavaScript**, не TypeScript.
- [ ] §2.3.3: модель **`meta-llama-3.1-8b-instruct`**.
- [ ] §2.7.1: **chat notes**, не anchors (см. §4.1).
- [ ] §2.7: убрать **dark theme toggle** или пометить «removed in current build».
- [ ] §2.2 Telegram: **`/link`**, не `/profile`.
- [ ] ERD / таблицы: добавить **`chat_notes`**, **`ai_reports`**, **`notes_analysis`** при необходимости.

### Глава 3 — Implementation

- [ ] **Рис. 3.1:** `src/app/api/chat/route.js` (не `.ts`).
- [ ] **Рис. 3.2:** `src/lib/telegram/handlers.js` + `telegram-bot-polling.js` (не `bot/index.ts`).
- [ ] **Рис. 3.3:** SQL из `supabase/migrations` — OK по смыслу.
- [ ] **Рис. 3.4:** `src/lib/knowledge-search.js`, RPC **`search_psychology_knowledge`**.
- [ ] **Рис. 3.5–3.7:** переснять при необходимости (логин, лендинг, чат **без anchor tags**).
- [ ] **Рис. 3.8:** удалить или заменить (dark mode убран).
- [ ] **Рис. 3.9–3.12:** analytics, exercises, profile — сверить с текущим UI.
- [ ] **Рис. 3.13:** Telegram `/start` menu — OK.
- [ ] **Табл. 3.1:** Authentication — убрать «Google OAuth»; добавить тест **chat notes**; exercises — не только GAD-7.
- [ ] **§3.5 Deployment:** упомянуть **`docker-compose.yml`**; модель **llama 3.1 8B**; `npm run telegram:poll`.
- [ ] **§3.6.2 Prospects:** Docker уже частично есть — формулировка «production-grade orchestration».

### Заключение / Abstract

- [ ] Не «8 команд», если считаете иначе — перечислить актуальный список (§4.4).
- [ ] Подчеркнуть **chat notes**, **Markdown AI reports**, **multi-test library**.

---

## 7. Find & Replace для Word (копировать)

| Найти | Заменить на |
|-------|-------------|
| `gpt-oss-20b` | `meta-llama-3.1-8b-instruct` |
| `TypeScript` (где про весь проект) | `JavaScript` |
| `src/app/api/chat/route.ts` | `src/app/api/chat/route.js` |
| `bot/index.ts` | `telegram-bot-polling.js` and `src/lib/telegram/handlers.js` |
| `lib/rag.ts` | `src/lib/knowledge-search.js` |
| `match_psychology_knowledge` | `search_psychology_knowledge` |
| `anchors feature for saving meaningful messages` | `chat notes feature for saving conversation topics` |
| `conversation anchors` | `chat notes` |
| `anchor tags` | `chat notes control` |
| `with anchor tags` | `with chat notes` |
| `No containerization (Docker) is currently implemented` | `A basic Docker setup (Dockerfile and docker-compose.yml) is provided; full production orchestration remains future work` |
| `structured JSON` (profile report) | `Markdown-structured psychological report` |
| `Google OAuth` (если нет в коде) | `Telegram account linking` |
| `/profile` (Telegram command) | `/link` |

---

## 8. Актуальные листинги (подписи к рисункам)

### Figure 3.1 — AI pipeline (safety)

**Файл:** `src/app/api/chat/route.js`  
**Смысл:** hard-block, crisis detection, mode selection, RAG, LM Studio call, post-validation.

### Figure 3.2 — Telegram `/today`

**Файлы:** `src/lib/telegram/handlers.js` (`handleToday`, `handleNoteInput`), запуск через `telegram-bot-polling.js`.

### Figure 3.4 — RAG

**Файл:** `src/lib/knowledge-search.js`  
**RPC:** `search_psychology_knowledge`

---

## 9. Скриншоты — что переснять

| Рисунок | Действие |
|---------|----------|
| 3.5 Login | Email + Telegram link (без Google) |
| 3.6 Home | Актуальный лендинг после редизайна |
| 3.7 Chat | **Без** anchor tags; показать иконку **Заметки** / модалку |
| 3.8 Dark chat | **Удалить** или заменить на сеанс/voice/notes |
| 3.9 Analytics | Графики + AI report |
| 3.10 Tests | Несколько тестов, не только GAD-7 |
| 3.11 Exercises | Дыхание + библиотека |
| 3.12 Profile | Язык, privacy, AI report card |
| 3.13 Telegram | Меню `/start`, `/today`, `/analyze` |

---

## 10. Сравнение с `DIPLOMA_CHANGES_MAY_2026.md`

| В DIPLOMA_CHANGES | Статус |
|-------------------|--------|
| «модалка якорей (`AnchorsModal`)» | **Устарело** → заметки чата |
| «переключение видимости якорей в ленте» | **Убрано** |
| AI pipeline, RAG, profile-report | **Актуально** |
| Voice / session | **Актуально** |
| in-memory emotion | **Актуально** |

После правки диплома имеет смысл обновить `DIPLOMA_CHANGES_MAY_2026.md` §4.1 или сослаться на этот файл.

---

## 11. Раздел «Следующие шаги» для команды

1. Пройти **§6 чеклист** в Word (Find & Replace §7).
2. Обновить **рис. 3.7–3.8** и при необходимости 3.5–3.6.
3. Сверить **табл. 3.1** с реальными сценариями (без Google OAuth; + chat notes).
4. На защите демонстрировать: чат → **Заметки** → «Хочу обсудить»; профиль → **AI-отчёт**; analytics → weekly.
5. LM Studio с моделью **`meta-llama-3.1-8b-instruct`** до начала демо.

---

## 12. Ссылки в репозитории

| Документ | Назначение |
|----------|------------|
| `PROJECT_OVERVIEW.md` | Обзор кода для ИИ/разработчиков |
| `REQUIREMENTS_CHECKLIST.md` | Чеклист требований (часть AI — partial) |
| `AI_CHANGES_MAY_2026.md` | Детали AI pipeline |
| `DOCKER_QUICKSTART.md` | Docker |
| **`DIPLOMA_VERSION3_SYNC.md`** (этот файл) | Синхронизация Version3 ↔ код |

---

*Автор синхронизации: по состоянию репозитория и `Version3_..._2301.docx` (modified 2026-05-21). При следующих изменениях продукта обновляйте §2–§5 и чеклист §6.*
