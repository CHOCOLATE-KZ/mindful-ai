# 📊 Документация - Система анализа заметок

## ✅ Реализованные функции

### 1. **Хранение данных привязанные к юзеру**
- Все заметки хранятся в Supabase связанные с `user_id`
- Автоматическая фильтрация по текущему пользователю
- Защита данных на уровне БД

### 2. **История заметок (полные и мини)**
- **Полные заметки**: содержат настроение (1-10) и/или сон (минуты) + комментарий
- **Мини-заметки**: только комментарий без метрик
- Разделены в UI на отдельные блоки для удобства

### 3. **Отдельный блок для мини-заметок**
```
💬 Мини-заметки (отображаются в синем блоке)
├─ Быстрые заметки только с текстом
├─ Компактный внешний вид
└─ Быстрое добавление через input
```

### 4. **Графики настроения и сна**
- **Двойной линейный график** (recharts):
  - Фиолетовая линия: настроение (1-10)
  - Зеленая линия: сон (минуты)
- Автоматическая сортировка от старых к новым
- Интерактивный tooltip

### 5. **Базовая аналитика**
```javascript
- ✨ Среднее настроение: X.X/10
- 😴 Средний сон: Xч Xм
- 📊 Статистика: N полных записей, M мини-заметок
```

### 6. **Подготовка для ИИ-анализа** 🤖

#### A. Хук `useNotesAnalytics`
```javascript
import { useNotesAnalytics } from '@/app/(app)/notes/_hooks/useNotesAnalytics';

const {
  fullNotes,           // Полные заметки
  quickNotes,          // Мини-заметки
  avgMood,             // Среднее настроение
  avgSleep,            // Средний сон
  emotionalInsights,   // Паттерны эмоций
  moodSleepCorrelation,// Связь настроения и сна
  aiAnalysisPayload    // Готовые данные для ИИ
} = useNotesAnalytics(notes);
```

#### B. API endpoint `/api/notes/analyze`
```bash
POST /api/notes/analyze
Content-Type: application/json

{
  "comments": [
    {
      "date": "2024-01-28",
      "text": "Отличный день",
      "mood": 8,
      "sleep": 480
    }
  ],
  "mood": 7.5,
  "sleep": 7
}

Response:
{
  "success": true,
  "analysisId": "uuid",
  "prompt": "... структурированный запрос для ИИ ...",
  "message": "Analysis data prepared for AI processing",
  "commentsCount": 10
}
```

#### C. Компонент `NotesAIAnalysis`
```jsx
<NotesAIAnalysis 
  notes={notes}
  avgMood={avgMood}
  avgSleep={avgSleep}
/>
```

## 📁 Структура файлов

```
src/app/(app)/notes/
├── page.js                           # Основная страница
├── _components/
│   └── NotesAIAnalysis.jsx           # Компонент ИИ-анализа
├── _hooks/
│   └── useNotesAnalytics.js          # Хук для аналитики

Supabase: таблица `notes` (схема управляется в Supabase)

src/app/api/notes/
└── analyze/
    └── route.js                      # API для анализа
```

## 🤖 Как использовать для ИИ-анализа

### Шаг 1: Подготовка данных
```javascript
const analysisData = aiAnalysisPayload; // Из useNotesAnalytics
```

### Шаг 2: Отправка на анализ
```javascript
const response = await fetch('/api/notes/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    comments: analysisData.allComments,
    mood: analysisData.statistics.averageMood,
    sleep: analysisData.statistics.averageSleep
  })
});
```

### Шаг 3: Получение результатов
Система подготавливает структурированный запрос для ИИ с анализом:
- Эмоциональных паттернов
- Факторов, влияющих на настроение
- Рекомендаций для благополучия
- Трендов и тенденций

## 🔍 Примеры аналитики

### Emotional Insights
```javascript
{
  bestMood: 9,
  worstMood: 3,
  moodStability: "Умеренное",
  averageMood: 6.5,
  totalDays: 15
}
```

### Mood-Sleep Correlation
```javascript
{
  correlation: 0.75,  // От -1 до 1
  interpretation: "Сильная связь"
}
```

## 🔐 Безопасность
- Все операции привязаны к `user_id`
- Использование Supabase Auth для верификации
- RLS (Row Level Security) на БД
- Валидация данных на API

## 🚀 Использование с различными ИИ

### OpenAI API
```javascript
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    { role: "system", content: "Ты психолог-консультант" },
    { role: "user", content: analysisData.prompt }
  ]
});
```

### Ollama (локально)
```javascript
const response = await fetch('http://localhost:11434/api/generate', {
  method: 'POST',
  body: JSON.stringify({
    model: "mistral",
    prompt: analysisData.prompt
  })
});
```

## 📊 Получение данных для ИИ

### Функция экспорта
```javascript
// Из page.js
export function prepareNotesForAIAnalysis(notes) {
  return {
    totalNotes,
    averageMood,
    allComments,    // Все комментарии с метаданными
    moodTrend,      // История настроения
    sleepTrend      // История сна
  };
}
```

## 🎯 Примеры использования

### Вариант 1: Встроенный анализ в компоненте
```jsx
<NotesAIAnalysis notes={notes} avgMood={avgMood} avgSleep={avgSleep} />
// Пользователь нажимает кнопку "Проанализировать"
// Данные отправляются на API
```

### Вариант 2: Кастомный анализ через хук
```javascript
const { aiAnalysisPayload } = useNotesAnalytics(notes);
// Использование payload где угодно в приложении
```

## 🔧 Интеграция с другими сервисами

### Saved Analysis (для истории)
```sql
CREATE TABLE notes_analysis (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  prompt TEXT,
  response TEXT,
  comments_count INT,
  analyzed_at TIMESTAMP
);
```

### Recommendations
```javascript
// Сохранение рекомендаций ИИ
const saveRecommendation = async (userId, recommendation) => {
  await supabase
    .from('ai_recommendations')
    .insert({
      user_id: userId,
      content: recommendation,
      created_at: new Date()
    });
};
```

## 📝 Примечания

- ✅ Все функции протестированы
- ✅ Готово к интеграции с любым ИИ сервисом
- ✅ Масштабируемая архитектура
- ✅ Оптимизирована производительность (useMemo)
- 🚀 Готово к использованию в production
