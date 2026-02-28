# 🧠 AI Psychology Knowledge Base - Руководство

## 📋 Обзор

Ваш AI-психолог теперь имеет доступ к структурированной базе психологических знаний, которая автоматически добавляется в контекст на основе сообщений пользователя.

## ✅ Что реализовано

### 1. База знаний (`src/data/psychologyKnowledge.js`)

Содержит:
- **Терапевтические подходы**: CBT, Mindfulness, ACT, DBT
- **Эмоциональная регуляция**: Техники для тревоги, депрессии, гнева, стресса
- **Принципы поддержки**: Валидация, активное слушание, автономия
- **Признаки для направления к специалисту**: Кризисные ситуации
- **Практические техники**: Заземление, дыхание, дневниковедение
- **Wellness**: Сон, движение, питание, социальные связи

### 2. Умное добавление контекста

Функция `getRelevantKnowledge(userMessage)` анализирует сообщение пользователя и добавляет только релевантную информацию:

```javascript
// Пример: пользователь пишет "У меня тревога"
// AI получает:
// - Техники работы с тревогой
// - Дыхательные упражнения
// - Техники заземления
// - Базовые принципы поддержки
```

### 3. Интеграция с LM Studio

Психологические знания автоматически добавляются в системный промпт как `PROFESSIONAL KNOWLEDGE BASE`, что позволяет AI:
- Давать evidence-based советы
- Использовать проверенные техники
- Правильно определять кризисные ситуации
- Поддерживать профессиональный уровень ответов

## 🎯 Как это работает

### Workflow:

```
1. Пользователь: "Мне так тревожно..."
   ↓
2. getRelevantKnowledge() анализирует ключевые слова
   ↓
3. Добавляется релевантный контекст:
   - emotionRegulation.anxiety
   - techniques.breathing
   - techniques.grounding
   - supportPrinciples
   ↓
4. LM Studio получает:
   - SYSTEM_PROMPT (ваш главный промпт)
   - PROFESSIONAL KNOWLEDGE BASE (психология)
   - User Context (данные пользователя)
   - История диалога
   - Текущее сообщение
   ↓
5. AI генерирует ответ с учетом всех знаний
```

## 📝 Как добавить свои документы

### Вариант 1: Редактировать `psychologyKnowledge.js`

```javascript
export const psychologyKnowledge = {
  // ... существующие разделы
  
  // Добавьте новый раздел
  yourNewSection: {
    topic: `
      Ваша информация о новой теме:
      - Пункт 1
      - Пункт 2
      
      Практические рекомендации...
    `,
  },
};
```

### Вариант 2: Расширить детекцию ключевых слов

В функции `getRelevantKnowledge()`:

```javascript
const keywords = {
  anxiety: ['тревог', 'волнен', ...],
  // Добавьте свою тему
  grief: ['потер', 'горе', 'умер', 'grief'],
};

// И добавьте логику
if (keywords.grief.some(kw => message.includes(kw))) {
  context.push(psychologyKnowledge.emotionRegulation.grief);
}
```

### Вариант 3: Создать отдельные модули

Для больших объемов информации:

```javascript
// src/data/psychology/cbt-techniques.js
export const cbtTechniques = {
  thoughtRecords: `...`,
  behavioralActivation: `...`,
};

// В psychologyKnowledge.js
import { cbtTechniques } from './psychology/cbt-techniques';

export const psychologyKnowledge = {
  approaches: {
    cbt: cbtTechniques.thoughtRecords,
  },
};
```

## 🔧 Работа с LM Studio

### Настройка модели в LM Studio:

1. **Откройте LM Studio**
2. **Загрузите модель** (рекомендуется Psychology-chat-7B или подобная)
3. **Запустите сервер**: 
   - Local Server → Start Server
   - Port: 1234 (по умолчанию)

### Переменные окружения (.env.local):

```env
# LM Studio настройки
LMSTUDIO_BASE_URL=http://127.0.0.1:1234
LMSTUDIO_MODEL=your-model-name

# Дополнительные параметры
LMSTUDIO_TEMPERATURE=0.7
LMSTUDIO_MAX_TOKENS=512
```

### Параметры модели для психологического ассистента:

```javascript
{
  temperature: 0.7,        // Баланс креативности и консистентности
  max_tokens: 256-512,     // Короткие, но информативные ответы
  top_p: 0.9,              // Разнообразие ответов
  frequency_penalty: 0.3,  // Избегать повторений
}
```

## 📚 Рекомендации по добавлению контента

### ✅ DO:

- **Структурируйте информацию** по темам
- **Используйте краткий формат** (bullet points)
- **Добавляйте источники** если возможно
- **Фокусируйтесь на практических техниках**
- **Включайте примеры**
- **Обновляйте ключевые слова** для детекции

### ❌ DON'T:

- Не добавляйте медицинские диагнозы
- Не включайте инструкции по приему лекарств
- Избегайте чрезмерно академического языка
- Не перегружайте контекст (макс 2-3 темы за раз)
- Не дублируйте информацию из SYSTEM_PROMPT

## 🎨 Примеры использования

### Пример 1: Добавить информацию о ПТСР

```javascript
// В psychologyKnowledge.js
emotionRegulation: {
  // ... существующие
  
  ptsd: `
    Поддержка при травматическом опыте:
    - Признание: травма влияет на работу мозга
    - Безопасность прежде всего
    - Grounding техники при flashbacks
    - Ресурсы стабилизации
    - Направление к trauma-informed специалисту
    - EMDR, Somatic Experiencing (только с терапевтом)
  `,
},

// В getRelevantKnowledge()
const keywords = {
  // ... существующие
  ptsd: ['травма', 'flashback', 'кошмар', 'птср', 'ptsd'],
};

if (keywords.ptsd.some(kw => message.includes(kw))) {
  context.push(psychologyKnowledge.emotionRegulation.ptsd);
  context.push(psychologyKnowledge.referralSigns); // Важно!
}
```

### Пример 2: Добавить техники для работы с прокрастинацией

```javascript
techniques: {
  // ... существующие
  
  procrastination: `
    Работа с прокрастинацией:
    
    Понимание причин:
    - Страх неудачи/перфекционизм
    - Задача кажется огромной
    - Отсутствие интереса/мотивации
    - Истощение/burnout
    
    Техники:
    - 2-минутное правило: "Только начну на 2 минуты"
    - Pomodoro: 25 мин работы, 5 мин отдых
    - Break down: разбить на маленькие шаги
    - Implementation intentions: "Когда X, я сделаю Y"
    - Self-compassion: без самокритики
    - Celebrate small wins
  `,
},
```

## 🔍 Тестирование

### Проверьте работу системы:

1. **Тест 1 - Тревога**:
   ```
   Пользователь: "У меня паническая атака"
   Ожидаемо: AI использует техники заземления и дыхания
   ```

2. **Тест 2 - Кризис**:
   ```
   Пользователь: "Не хочу больше жить"
   Ожидаемо: AI серьезно реагирует + рекомендует помощь
   ```

3. **Тест 3 - Общий вопрос**:
   ```
   Пользователь: "Как улучшить настроение?"
   Ожидаемо: AI дает базовые wellness советы
   ```

### Debug логирование:

```javascript
// В getRelevantKnowledge(), временно добавьте:
console.log('User message:', userMessage);
console.log('Detected keywords:', detectedKeywords);
console.log('Context sections:', context.length);
```

## 📊 Мониторинг токенов

Следите за размером контекста:

```javascript
// В API route, добавьте логирование:
const totalTokens = JSON.stringify(messages).length / 4; // Приблизительно
console.log(`Approximate tokens: ${totalTokens}`);
```

**Оптимальные размеры:**
- SYSTEM_PROMPT: ~500-800 токенов
- Psychology Context: ~800-1500 токенов (в зависимости от темы)
- User Context: ~100-200 токенов
- History: ~500-1000 токенов
- **Total: ~2000-3500 токенов в контексте**

## 🚀 Расширенные возможности

### RAG с векторной базой (будущее улучшение):

Для очень больших объемов документов:

1. **Используйте embeddings**:
   ```javascript
   import { HuggingFaceInference } from '@huggingface/inference';
   // Создать embeddings для всех документов
   ```

2. **Векторная БД** (Pinecone, Weaviate):
   ```javascript
   // Искать семантически близкие фрагменты
   const relevant = await vectorDB.search(userMessage, topK: 3);
   ```

3. **Динамический контекст**:
   ```javascript
   // Добавлять только топ-3 релевантных фрагмента
   ```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте, что LM Studio запущен: `curl http://localhost:1234/v1/models`
2. Проверьте логи: `console.log` в API routes
3. Проверьте размер контекста (не превышает ли лимит модели)
4. Тестируйте функцию `getRelevantKnowledge()` отдельно

## 📖 Дополнительные ресурсы

- [LM Studio Documentation](https://lmstudio.ai/docs)
- [OpenAI API Compatible Format](https://platform.openai.com/docs/api-reference)
- [Psychology Today - Techniques](https://www.psychologytoday.com)
- [APA - Evidence-Based Practice](https://www.apa.org/practice/resources/evidence)

---

**Версия**: 1.0  
**Дата**: February 2026  
**Автор**: MindfulAI Team
