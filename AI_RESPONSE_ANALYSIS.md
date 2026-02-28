# 🔴 АНАЛИЗ ПРОБЛЕМ AI ОТВЕТОВ - MindfulAI

## 📊 Диагностика Примера из Telegram

### Проблемы в диалоге:

```
lilsus: "Я сегодня тебе писал?"
MindfulAI: "Конечно, Ильяс! Я здесь, чтобы помочь и поддержать тебя..."
❌ ПРОБЛЕМА: Бот отвечает "конечно" на вопрос, который невозможно правильно ответить!
              Бот не имеет информации, писал ли пользователь сегодня или нет.
```

```
lilsus: "а как медитировать и дышать правильно?"
MindfulAI: [Объясняет технику 4-7-8 с примерами]

lilsus: "Спасибо большое. Попробую!"
MindfulAI: [ТОЧНО ТОЖ ЖЕ ОБЪЯСНЕНИЕ техники 4-7-8 ещё раз]
❌ ПРОБЛЕМА: Повтор полностью идентичного контента!
              Это указывает на:
              1. Потерю контекста истории
              2. Или ошибку в сохранении истории
              3. Или модель не видит, что уже это говорила
```

```
❌ СПИСКИ ВЕЗДЕ (1. 2. 3.):
"1. Найдите спокойное место
 2. Присядьте или проложите ноги
 3. Закройте глаза"
 
Хотя SYSTEM_PROMPT явно говорит:
🚨 НИКОГДА НЕ ИСПОЛЬЗУЙ:
   - Списки (-, 1., 2.)
```

```
❌ НЕЕСТЕСТВЕННЫЙ ТОН:
- "Это замечательно слышать" (слишком формально)
- "Позволь рассказать о том..." (странная грамматика)
- "Если ты писал мне сегодня, это не имеет значения" (не может знать)
- Слишком много эмодзи в системе (должны быть только в начале)
```

```
❌ СМЕШИВАНИЕ ТЫ/ВЫ:
"Позволь рассказать..."  (ты)
"Вот несколько простых шагов для вас" (вы)
"Попробуйте записать" (вы)
```

---

## 🔍 ТЕХНИЧЕСКИЕ ПРИЧИНЫ

### 1️⃣ КРИТИЧЕСКАЯ ПРОБЛЕМА: Telegram использует АНГЛОЯЗЫЧНЫЙ промпт!

```javascript
// ❌ НЕПРАВИЛЬНО - В /src/lib/lmStudioClient.js:
const SYSTEM_PROMPT = `You are MindfulAI — a compassionate and supportive assistant...`

// ✅ ПРАВИЛЬНЫЙ - В /src/app/api/chat/route.js:
const SYSTEM_PROMPT = `Ты MindfulAI — психолог. Разговариваешь как реальный человек...`
```

**Поток данных:**
```
Telegram сообщение от пользователя (РУССКИЙ)
    ↓
handleMessage() в handlers.js (line 596)
    ↓
askAIWithHistory() из lmStudioClient.js
    ↓
SYSTEM_PROMPT = "You are MindfulAI..." (АНГЛИЙСКИЙ!)
    ↓
LM Studio (Qwen2.5-7B)
    ↓
❌ КОНФЛИКТ: Русский пользователь, английский промпт, русский ответ = НЕЕСТЕСТВЕННОСТЬ
```

### 2️⃣ Параметры LM Studio слишком консервативны

```javascript
// Текущие параметры (line 95-97 в chat/route.js):
temperature: 0.7,        // Слишком низко для естественности
max_tokens: 256,         // Слишком мало, ограничивает ответы
// Нет: frequency_penalty (приводит к повторениям)
// Нет: top_p (ограничивает разнообразие)
```

**Почему это проблема:**
- `temperature: 0.7` → ответы становятся типичными, шаблонными
- `max_tokens: 256` → недостаточно для развернутого ответа
- Отсутствие `frequency_penalty` → модель повторяет фразы  

### 3️⃣ SYSTEM_PROMPT в lmStudioClient.js слишком скучен

```javascript
// Текущий промпт:
"You are MindfulAI — a compassionate and supportive assistant..."
"ROLE & TONE: Be calm, empathetic, respectful..."
"RESPONSE STYLE: Start by reflecting emotions..."

// Проблемы:
❌ Слишком формально для психолога
❌ Много бюрократических инструкций
❌ Нет примеров ЕСТЕСТВЕННОЙ речи
❌ На английском, хотя бот русскоязычный
```

### 4️⃣ История сообщений может быть некорректной

```javascript
// В handlers.js (line 585-590):
const { data: history } = await supabaseAdmin
  .from('ai_messages')
  .select('role, content')
  .eq('user_id', userId)
  .eq('source', 'telegram')
  .order('created_at', { ascending: false })
  .limit(10);

const messageHistory = history ? history.reverse() : [];
// ✅ Это правильно - reverse() восстанавливает хронологический порядок

// НО: Если сообщений 2 от одного пользователя подряд:
// История может не содержать ответ предидущего вопроса,
// если они слишком быстро отправлены
```

### 5️⃣ Модель игнорирует инструкции о NO LISTS

Несмотря на четкие инструкции:
```
DO NOT use markdown, lists with symbols, code blocks, JSON, XML, or special formatting.
```

Модель все равно генерирует:
```
1. Найдите спокойное место...
2. Присядьте или положите ноги...
3. Закройте глаза...
```

**Причина:** gpt-oss-20b/Qwen2.5 может быть обучена на данных, где все психологические советы даются списками. Модель игнорирует explicit инструкции в пользу learned patterns.

### 6️⃣ Отсутствие контроля за дублированием контента

Нет механизма:
```javascript
// ❌ Не проверяется:
if (lastAssistantMessage.includes("техника дыхания 4-7-8")) {
  // Не шли по-другому
}
```

---

## ✅ РЕШЕНИЯ (в порядке приоритета)

### 🔴 КРИТИЧЕСКОЕ (исправить СЕЙЧАС):

#### 1. Унифицировать SYSTEM_PROMPT для Telegram

**Файл:** `src/lib/lmStudioClient.js` (lines 1-100)

**Что сделать:**
```javascript
// Заменить англоязычный промпт на русский, как в chat/route.js
// Это единственное правильное решение, так как бот отвечает по-русски

const SYSTEM_PROMPT = `Ты MindfulAI — психолог. Разговариваешь как реальный человек, НЕ даёшь инструкции как робот.

🚨 НИКОГДА НЕ ИСПОЛЬЗУЙ:
- Списки (-, 1., 2.)
- Заголовки ("Слушание:", "Техники:")
- Советы без вопросов

[... rest of good prompt from chat/route.js ...]`;
```

#### 2. Увеличить параметры генерации

**Файл:** `src/lib/lmStudioClient.js` (line 95-100)

```javascript
// БЫЛО:
body: JSON.stringify({
  model: options.model || LMSTUDIO_MODEL,
  messages,
  temperature: options.temperature || 0.7,
  max_tokens: options.max_tokens || 256,
}),

// СТАЛО:
body: JSON.stringify({
  model: options.model || LMSTUDIO_MODEL,
  messages,
  temperature: options.temperature || 0.8,      // ↑ 0.7 → 0.8
  max_tokens: options.max_tokens || 512,        // ↑ 256 → 512
  top_p: 0.95,                                   // + добавить
  frequency_penalty: 0.3,                        // + добавить (против повторов)
}),
```

#### 3. Добавить проверку дублирования контента

**Файл:** `src/lib/lmStudioClient.js` в функцию `askAIWithHistory` (поле line 170)

```javascript
export async function askAIWithHistory(userMessage, history = [], userContext = '') {
  // ... (existing code)

  // ✅ ДОБАВИТЬ: Проверка если бот уже говорил об этом
  if (history && history.length >= 2) {
    const lastAssistantMsg = history
      .reverse()
      .find(m => m.role === 'assistant')?.content || '';
    
    // Если последний ответ бота содержит ключевые элементы текущего вопроса,
    // и прошло мало времени - добавить signal в промпт
    if (lastAssistantMsg.length > 100) {
      messages.push({
        role: 'system',
        content: `IMPORTANT: Do not repeat the exact same content as in the previous assistant message. If the user is saying thanks or moving forward, provide new perspective or deeper insight, not repetition.`
      });
    }
  }

  // ... rest of function
}
```

---

### 🟡 ВЫСОКИЙ ПРИОРИТЕТ (исправить через 1-2 дня):

#### 4. Улучшить prompt engineering для естественности

```javascript
// Добавить примеры РЕАЛЬНЫХ ответов в SYSTEM_PROMPT:

Клиент: "Не могу сосредоточиться, голова не работает"
❌ ПЛОХО: 
"Вот несколько техник для концентрации:
1. Убрать отвлекающие факторы
2. Использовать метод Pomodoro
3..."

✅ ХОРОШО:
"Это бывает. Когда это началось? Может быть, ты переутомился или просто много на горе сегодня?"

// Побуждение модель быть консультантом, а не инструктором
```

#### 5. Проверить настройки temperature для разных типов вопросов

```javascript
// Динамическая температура:
if (userMessage.includes('как') && userMessage.includes('делать')) {
  // Техническое объяснение → temperature: 0.6 (точнее)
  temp = 0.6;
} else if (userMessage.includes('помощь') || userMessage.includes('страшно')) {
  // Эмоциональная поддержка → temperature: 0.8-0.9 (теплее)
  temp = 0.85;
} else {
  temp = 0.75; // default
}
```

---

### 🟢 СРЕДНИЙ ПРИОРИТЕТ (улучшения):

#### 6. Добавить detection языка в prompts

Убедиться что лингвистический стиль соответствует языку пользователя:

```javascript
// В buildUserContext() добавить:
const userLanguage = detectLanguage(userMessage); // 'ru', 'en', etc

if (userLanguage === 'ru') {
  // Использовать русский стиль: "ты", informal, warm
  messages.push({
    role: 'system',
    content: 'LANGUAGE_STYLE: Informal Russian, use "ты", natural conversation tone, no formal structures.'
  });
}
```

#### 7. Оптимизировать размер истории

```javascript
// Вместо limit(10) → limit(5-8)
// Слишком большая история может "загромождать" контекст

.limit(8); // было: 10, теперь: 8
```

---

## 📈 ОЖИДАЕМЫЕ РЕЗУЛЬТАТЫ После исправлений:

### До:
```
lilsus: "а как медитировать?"
MindfulAI: 
"1. Найдите спокойное место
2. Присядьте...
3. Закройте глаза
4. Начните медленно дышать..."

lilsus: "Спасибо, попробую"
MindfulAI:
"1. Найдите спокойное место
2. Присядьте...  ← ПОВТОР!
```

### После:
```
lilsus: "а как медитировать?"
MindfulAI:
"Хорошо! Для начала найди тихое место, где тебя никто не потревожит. 
Сядь удобно, спину постарайся держать ровной. Потом просто дыши глубоко 
и следи за дыханием. Если мысли отвлекают — это нормально, просто возвращайся к дыханию."

lilsus: "Спасибо, попробую"
MindfulAI:
"Класс! Начни хотя бы с 5-10 минут. Может быть тебе понравится? 
После медитации как себя чувствуешь?"
```

---

## 🚀 ПЛАН РЕАЛИЗАЦИИ

| Шаг | Что | Файл | Время | Приоритет |
|-----|-----|------|-------|-----------|
| 1 | Заменить промпт в lmStudioClient.js | src/lib/lmStudioClient.js | 5 мин | 🔴 КРИТИЧЕСКОЕ |
| 2 | Увеличить temp/tokens/penalties | src/lib/lmStudioClient.js | 2 мин | 🔴 КРИТИЧЕСКОЕ |
| 3 | Добавить проверку дублирования | src/lib/lmStudioClient.js | 15 мин | 🔴 КРИТИЧЕСКОЕ |
| 4 | Улучшить примеры в SYSTEM_PROMPT | src/lib/lmStudioClient.js | 20 мин | 🟡 ВЫСОКИЙ |
| 5 | Динамическая температура | src/lib/lmStudioClient.js | 10 мин | 🟡 ВЫСОКИЙ |
| 6 | Тестирование в Telegram | - | 10 мин | 🟡 ВЫСОКИЙ |

---

## ⚠️ ЧТО ПРОВЕРИТЬ ПОСЛЕ ИСПРАВЛЕНИЙ

1. **История исчезает?** → Проверить `.order('created_at')`
2. **Ответы на английском?** → Убедиться SYSTEM_PROMPT полностью на русском
3. **Списки всё еще?** → Может быть нужна переформулировка примеров
4. **Повторения?** → Проверить frequency_penalty параметр
5. **Обрезанные ответы?** → Увеличить max_tokens ещё больше (до 1024 для тестирования)

