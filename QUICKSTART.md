# ⚡ БЫСТРЫЙ СТАРТ

## 🎯 За 5 минут

### 1️⃣ SQL миграция (2 минуты)

Откройте **Supabase Dashboard** → **SQL Editor** → скопируйте и выполните:

```sql
-- 📊 Основная таблица
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMP DEFAULT NOW(),
  mood INT CHECK (mood IS NULL OR (mood >= 1 AND mood <= 10)),
  sleep INT CHECK (sleep IS NULL OR sleep >= 0),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 🤖 Анализ
CREATE TABLE IF NOT EXISTS notes_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  comments_count INT DEFAULT 0,
  analyzed_at TIMESTAMP DEFAULT NOW()
);

-- Результаты ИИ
CREATE TABLE IF NOT EXISTS notes_analysis_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID REFERENCES notes_analysis(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_response TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 🔒 RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes_analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their notes" ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notes" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON notes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users view analysis" ON notes_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert analysis" ON notes_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view results" ON notes_analysis_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert results" ON notes_analysis_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 📈 Индексы
CREATE INDEX idx_notes_user_date ON notes(user_id, date DESC);
CREATE INDEX idx_notes_user_mood ON notes(user_id, mood) WHERE mood IS NOT NULL;
CREATE INDEX idx_notes_user_sleep ON notes(user_id, sleep) WHERE sleep IS NOT NULL;
```

✅ **Готово!**

### 2️⃣ Проверка файлов (1 минута)

Убедитесь что существуют:

- ✅ `src/app/(app)/notes/page.js`
- ✅ `src/app/(app)/notes/_components/NotesAIAnalysis.jsx`
- ✅ `src/app/(app)/notes/_hooks/useNotesAnalytics.js`
- ✅ `src/app/api/notes/analyze/route.js`

Если отсутствуют - они уже созданы автоматически ✨

### 3️⃣ Запуск проекта (1 минута)

```bash
npm run dev
```

### 4️⃣ Тестирование (1 минута)

1. Откройте **http://localhost:3000** (или ваш URL)
2. Перейдите в **Заметки**
3. Добавьте полную заметку:
   - Настроение: 7
   - Сон: 480
   - Комментарий: "Отличный день!"
4. Добавьте мини-заметку: "Быстрая мысль"
5. Проверьте график и аналитику
6. Нажмите "🔍 Проанализировать"

✅ **Все работает!**

---

## 📱 Что видит пользователь

```
┌─────────────────────────────────────────────┐
│           ЗАМЕТКИ И АНАЛИТИКА               │
├────────────────┬────────────────────────────┤
│                │  📈 АНАЛИТИКА              │
│ НОВАЯ ЗАПИСЬ   │                            │
│                │  📊 Полные записи          │
│ Настроение: 7  │  ├─ День 1, Настроение 8   │
│ Сон: 480       │  ├─ День 2, Настроение 6   │
│ Комментарий... │  │                         │
│                │  💬 Мини-заметки          │
│ [Сохранить]    │  ├─ Быстрая мысль 1       │
│                │  └─ Быстрая мысль 2       │
│ Мини-заметки   │                            │
│ [INPUT] [Add]  │  📈 ГРАФИК                 │
│                │  [Graph: Mood & Sleep]     │
│                │                            │
│                │  📊 Статистика             │
│                │  Среднее: 7.5/10           │
│                │  Сон: 7ч 30м               │
│                │                            │
│                │  🤖 ИИ-АНАЛИЗ              │
│                │  [Проанализировать]        │
└────────────────┴────────────────────────────┘
```

---

## 🔌 Интеграция с ИИ (5 минут)

### OpenAI

```javascript
// src/app/api/notes/ai-analysis/route.js (создать новый файл)

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request) {
  const { prompt } = await request.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Ты психолог. Анализируй заметки и дай рекомендации."
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  return Response.json({
    analysis: response.choices[0].message.content
  });
}
```

### Ollama (локально)

```javascript
// Просто используйте fetch к http://localhost:11434
const response = await fetch('http://localhost:11434/api/generate', {
  method: 'POST',
  body: JSON.stringify({
    model: 'mistral',
    prompt: analysisPrompt,
    stream: false
  })
});
```

---

## 🧪 Тестовые данные

```javascript
// Вставить в Supabase в таблицу notes
INSERT INTO notes (user_id, mood, sleep, comment, date) VALUES
('your-user-id', 8, 480, 'Отличный день!', NOW() - INTERVAL '7 days'),
('your-user-id', 6, 360, 'Сложный день', NOW() - INTERVAL '6 days'),
('your-user-id', 7, 420, 'Обычный день', NOW() - INTERVAL '5 days'),
('your-user-id', 9, 540, 'Было хорошо', NOW() - INTERVAL '4 days'),
('your-user-id', 5, 300, 'Было сложно', NOW() - INTERVAL '3 days'),
('your-user-id', 7, 480, 'Нормально', NOW() - INTERVAL '2 days'),
('your-user-id', 8, 500, 'Хороший день', NOW());

-- Мини-заметки
INSERT INTO notes (user_id, comment, date) VALUES
('your-user-id', 'Быстрая мысль 1', NOW() - INTERVAL '2 days'),
('your-user-id', 'Быстрая мысль 2', NOW());
```

Замените `your-user-id` на свой ID из `auth.users`

---

## 🚨 Если что-то не работает

### ❌ Заметки не загружаются
```
→ Проверить что пользователь авторизован
→ Проверить RLS политики (скопировать заново из SQL)
→ F12 → Console → искать ошибки
```

### ❌ График не видно
```
→ Добавить хотя бы одну заметку с mood или sleep
→ npm install recharts (уже установлен)
→ Ctrl+Shift+R (полная перезагрузка)
```

### ❌ ИИ-анализ ошибку дает
```
→ Проверить что comments не пусто (добавить комментарии)
→ F12 → Network → analyze POST → Response
→ Проверить что API endpoint существует
```

---

## 📚 Документация

- **Полная документация:** [docs/NOTES_AI_ANALYSIS.md](docs/NOTES_AI_ANALYSIS.md)
- **Примеры кода:** [docs/NOTES_EXAMPLES.js](docs/NOTES_EXAMPLES.js)
- **Чек-лист:** [docs/REQUIREMENTS_CHECKLIST.md](docs/REQUIREMENTS_CHECKLIST.md)

---

## 🎉 Итого

```
⏱️  5 минут → система работает
✅ 6 требований выполнено
🚀 Готово к production
🤖 Интегрируется с любым ИИ
```

**Начните с SQL миграции → Тестирование → Готово!**

---

Успехов! 🚀
