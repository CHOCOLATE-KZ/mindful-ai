# 🚀 QUICK REFERENCE - AI Psychology System

## Файлы проекта

### Core Files (основные изменения):

```
src/
├── data/
│   └── psychologyKnowledge.js          ← 📚 База психологических знаний
│
├── lib/
│   └── lmStudioClient.js               ← 🔄 Обновлен (новый промпт + контекст)
│
└── app/
    └── api/
        └── chat/
            └── route.js                ← 🔄 Обновлен (интеграция knowledge base)
```

### Documentation:

```
docs/
└── AI_PSYCHOLOGY_KNOWLEDGE_GUIDE.md    ← 📖 Полный гайд

PSYCHOLOGY_KNOWLEDGE_BASE.txt           ← 📝 Справочник техник
LM_STUDIO_QUICKSTART.md                 ← ⚡ Быстрый старт
AI_KNOWLEDGE_UPDATE_SUMMARY.md          ← ✅ Что сделано
```

---

## Как работает система (1 минута)

```
1. User пишет: "Мне тревожно"
          ↓
2. getRelevantKnowledge() анализирует → находит ключевое слово "тревог"
          ↓
3. Добавляется в контекст:
   - Техники для тревоги
   - Дыхательные упражнения
   - Grounding
   - Принципы поддержки
          ↓
4. LM Studio получает:
   [SYSTEM_PROMPT] + [PSYCHOLOGY CONTEXT] + [USER DATA] + [HISTORY] + [MESSAGE]
          ↓
5. AI генерирует профессиональный ответ
```

---

## Команды для старта

```bash
# 1. Убедитесь что LM Studio запущен
curl http://localhost:1234/v1/models

# 2. Запустите проект
npm run dev

# 3. Откройте браузер
# http://localhost:3000

# 4. Тест
# Перейдите в чат → напишите "Мне тревожно"
```

---

## Добавить свои знания (30 секунд)

### Вариант 1: В код

```javascript
// Откройте: src/data/psychologyKnowledge.js

// Добавьте в нужную секцию:
emotionRegulation: {
  // ...существующие
  
  yourTopic: `
    Ваш контент:
    - Техника 1
    - Техника 2
  `,
},
```

### Вариант 2: Ключевые слова

```javascript
// В функции getRelevantKnowledge():

const keywords = {
  // ...существующие
  yourTopic: ['ключ1', 'ключ2', 'keyword'],
};

if (keywords.yourTopic.some(kw => message.includes(kw))) {
  context.push(psychologyKnowledge.yourTopic);
}
```

---

## Параметры LM Studio

### Рекомендуемая модель:
**Qwen2.5-7B-Instruct-Q4_K_M** (4.7GB)

### Настройки:
```
Context Length: 8192
Temperature: 0.7
Max Tokens: 512
Top P: 0.9
Frequency Penalty: 0.3
```

---

## Debug (если что-то не работает)

### 1. Проверить LM Studio
```bash
curl http://localhost:1234/v1/models
# Должен вернуть JSON с моделями
```

### 2. Проверить .env.local
```env
LMSTUDIO_BASE_URL=http://127.0.0.1:1234
LMSTUDIO_MODEL=your-model-name
```

### 3. Добавить логи
```javascript
// В src/app/api/chat/route.js:

console.log('Psychology Context:', psychologyContext.slice(0, 200));
console.log('Messages count:', messages.length);
```

### 4. Проверить импорты
```javascript
// Должно быть в начале файла:
import { getRelevantKnowledge } from "@/data/psychologyKnowledge";
```

---

## Структура psychologyKnowledge.js

```javascript
export const psychologyKnowledge = {
  approaches: {        // Терапевтические подходы (CBT, Mindfulness, ACT, DBT)
    cbt: "...",
    mindfulness: "...",
  },
  
  emotionRegulation: { // Техники для эмоций
    anxiety: "...",
    depression: "...",
    anger: "...",
    stress: "...",
  },
  
  supportPrinciples: "...", // Как поддерживать (валидация, эмпатия)
  
  referralSigns: "...",     // Когда нужен специалист
  
  techniques: {             // Практические техники
    grounding: "...",
    breathing: "...",
    journaling: "...",
  },
  
  wellness: "...",          // Базовое благополучие (сон, движение)
};

export function getRelevantKnowledge(userMessage) {
  // Анализирует сообщение → возвращает релевантный контекст
}
```

---

## Тесты

| Тест | Input | Expected Behavior |
|------|-------|-------------------|
| Тревога | "Мне тревожно" | Дыхательные техники, заземление, валидация |
| Депрессия | "Нет сил ничего делать" | Поведенческая активация, маленькие шаги |
| Гнев | "Так злюсь!" | Pause & reflect, assertive communication |
| Кризис | "Не хочу жить" | Серьезная эмпатия + направление к помощи |
| Общее | "Как улучшить настроение?" | Wellness tips (сон, движение, социальная связь) |

---

## URLs

- **Проект:** http://localhost:3000
- **LM Studio API:** http://localhost:1234
- **Chat:** http://localhost:3000/(app)/chat

---

## Контакты для помощи

- LM Studio docs: https://lmstudio.ai/docs
- Полный гайд: `docs/AI_PSYCHOLOGY_KNOWLEDGE_GUIDE.md`
- Quick start: `LM_STUDIO_QUICKSTART.md`
- Справочник техник: `docs/PSYCHOLOGY_KNOWLEDGE_BASE.txt`

---

## Что дальше?

1. ✅ Протестировать систему
2. 📝 Добавить больше психологических техник (из `PSYCHOLOGY_KNOWLEDGE_BASE.txt`)
3. 🎨 Расширить детекцию тем (ПТСР, ОКР, grief и др.)
4. 📊 Собирать feedback от пользователей
5. 🚀 Защита диплома!

---

**Все готово к работе! 🎉**

Система автоматически добавляет психологические знания в контекст AI.
Просто запустите LM Studio + проект и тестируйте.

Удачи с дипломом! 🎓
