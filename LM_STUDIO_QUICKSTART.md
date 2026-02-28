# ⚡ LM Studio Quick Start для MindfulAI

## 🎯 Быстрый старт (5 минут)

### Шаг 1: Установка LM Studio

1. Скачайте LM Studio: https://lmstudio.ai/
2. Установите приложение
3. Запустите LM Studio

### Шаг 2: Загрузка модели

**Рекомендуемые модели для психологического ассистента:**

1. **Qwen2.5-7B-Instruct** (Best Choice ✅)
   - Размер: ~4.7GB
   - Отличная эмпатия
   - Поддержка multiple languages
   - Хорошо понимает контекст

2. **Mistral-7B-Instruct**
   - Размер: ~4.1GB
   - Balanced performance
   - Хорошо для коротких ответов

3. **OpenHermes-2.5-Mistral-7B**
   - Размер: ~4.1GB
   - Conversational style
   - Естественные ответы

**Как загрузить:**
```
LM Studio → Search → Введите название модели
→ Выберите quantized версию (Q4_K_M или Q5_K_M)
→ Download
```

### Шаг 3: Запуск сервера

1. В LM Studio откройте вкладку **"Local Server"**
2. Выберите загруженную модель
3. Настройте параметры:
   ```
   Context Length: 8192
   Temperature: 0.7
   Max Tokens: 512
   ```
4. Нажмите **"Start Server"**
5. Сервер запустится на `http://127.0.0.1:1234`

### Шаг 4: Настройка проекта

В корне проекта создайте/обновите `.env.local`:

```env
# LM Studio Configuration
LMSTUDIO_BASE_URL=http://127.0.0.1:1234
LMSTUDIO_MODEL=qwen2.5-7b-instruct-q4_k_m

# Optional: Настройка параметров
LMSTUDIO_TEMPERATURE=0.7
LMSTUDIO_MAX_TOKENS=512
```

### Шаг 5: Тест

```bash
# Запустите dev сервер
npm run dev

# Откройте http://localhost:3000
# Перейдите в чат
# Напишите сообщение: "Привет, мне тревожно"
```

Если все работает → ✅ Готово!

## 🎛️ Оптимальные настройки для психологического AI

### В LM Studio (Local Server):

```yaml
Model Settings:
  Context Length: 8192        # Достаточно для истории + база знаний
  GPU Layers: Auto            # Используйте GPU если доступна
  CPU Threads: Auto           # Оптимизация под процессор

Generation:
  Temperature: 0.7            # Баланс креативности/консистентности
  Max Tokens: 512             # Короткие, focused ответы
  Top P: 0.9                  # Nucleus sampling
  Frequency Penalty: 0.3      # Избегать повторений
  Presence Penalty: 0.0       # Не нужно для диалога

Stream: true                  # Плавный вывод текста
```

### Пояснения параметров:

- **Temperature 0.7**: Эмпатичные, но не случайные ответы
- **Max Tokens 512**: Короткие практичные советы (не overwhelm юзера)
- **Context 8192**: Хватает для:
  - System Prompt (~800 tokens)
  - Psychology Knowledge (~1500 tokens)
  - User Context (~200 tokens)
  - History 10 messages (~1000 tokens)
  - Current message (~100 tokens)
  - Response (~512 tokens)
  - **Total: ~4100 tokens (50% от лимита)**

## 🔄 Как добавить документы в контекст

### Вариант 1: Через код (реализовано ✅)

База знаний автоматически добавляется в `src/data/psychologyKnowledge.js`:

```javascript
// Система сама определяет релевантный контекст
User: "Мне тревожно" 
  → AI получает: 
     - Техники для тревоги
     - Дыхательные упражнения
     - Grounding техники
```

**Как добавить свой контент:**
1. Откройте `src/data/psychologyKnowledge.js`
2. Добавьте новый раздел в нужную секцию
3. Обновите ключевые слова в `getRelevantKnowledge()`

### Вариант 2: LM Studio Chat Templates (для экспериментов)

LM Studio позволяет настроить System Message:

1. **Developer → System Prompt**
2. Вставьте ваш промпт + документы
3. Тестируйте в интерфейсе LM Studio

⚠️ **Но!** Это только для тестов. В проде используйте код (Вариант 1).

### Вариант 3: External Knowledge Files (advanced)

Для очень больших документов (>50KB):

1. Положите файлы в `src/data/psychology/`
2. Создайте loader:
   ```javascript
   // src/lib/psychologyLoader.js
   import fs from 'fs';
   
   export function loadDocument(name) {
     return fs.readFileSync(`./src/data/psychology/${name}.txt`, 'utf-8');
   }
   ```
3. Используйте в API:
   ```javascript
   import { loadDocument } from '@/lib/psychologyLoader';
   
   const cbtGuide = loadDocument('cbt-techniques');
   messages.push({ role: 'system', content: cbtGuide });
   ```

## 🐛 Troubleshooting

### Проблема: "Failed to contact LLM"

**Решение:**
```bash
# Проверьте, что LM Studio запущен:
curl http://localhost:1234/v1/models

# Должен вернуть список моделей
```

### Проблема: Медленные ответы

**Решение:**
1. Используйте меньшую quantized модель (Q4 вместо Q8)
2. Уменьшите Context Length до 4096
3. Включите GPU Offloading (если есть видеокарта)
4. Закройте другие приложения

### Проблема: AI игнорирует контекст

**Решение:**
```javascript
// В API route, добавьте debug:
console.log('Messages sent to LM Studio:', JSON.stringify(messages, null, 2));

// Проверьте, что psychology context действительно добавлен
```

### Проблема: Ответы на английском вместо русского

**Решение:**
```javascript
// В SYSTEM_PROMPT добавьте:
"LANGUAGE: If the user writes in Russian, you MUST reply in Russian. 
Если пользователь пишет на русском, отвечай ТОЛЬКО на русском языке."
```

## 📊 Мониторинг производительности

### Проверка использования токенов:

```javascript
// В chat/route.js после messages.push(...)
const totalLength = JSON.stringify(messages).length;
const approxTokens = Math.ceil(totalLength / 4);
console.log(`📊 Context size: ~${approxTokens} tokens`);
```

### Оптимальные показатели:
- ✅ Context: 2000-4000 tokens
- ⚠️ Context: 4000-6000 tokens (ok, но watch closely)
- ❌ Context: >6000 tokens (слишком много, нужна оптимизация)

## 🎨 Настройка под разные use cases

### Для более коротких ответов:
```javascript
// В callLmStudio()
max_tokens: 256,
temperature: 0.6,
```

### Для более подробных объяснений:
```javascript
max_tokens: 768,
temperature: 0.8,
```

### Для crisis situations (больше осторожности):
```javascript
temperature: 0.5,  // Более предсказуемые ответы
top_p: 0.8,
```

## 🔐 Production рекомендации

1. **Rate limiting**: Ограничьте количество запросов
   ```javascript
   // Используйте redis или in-memory cache
   const rateLimit = 10; // requests per minute
   ```

2. **Timeout**: Добавьте таймауты
   ```javascript
   const controller = new AbortController();
   setTimeout(() => controller.abort(), 30000); // 30 sec
   
   fetch(url, { signal: controller.signal });
   ```

3. **Fallback**: Если LM Studio не доступен
   ```javascript
   try {
     const lm = await callLmStudio(messages);
     if (lm.error) {
       // Fallback to OpenAI API or static response
     }
   } catch (err) {
     return defaultSupportMessage();
   }
   ```

4. **Monitoring**: Логируйте метрики
   ```javascript
   const startTime = Date.now();
   const result = await callLmStudio(messages);
   const duration = Date.now() - startTime;
   
   console.log(`⏱️ LM Studio response time: ${duration}ms`);
   ```

## 📚 Полезные ресурсы

- 📖 [Полный гайд по базе знаний](./AI_PSYCHOLOGY_KNOWLEDGE_GUIDE.md)
- 🌐 [LM Studio Docs](https://lmstudio.ai/docs)
- 🔌 [OpenAI-compatible API](https://platform.openai.com/docs/api-reference)
- 🤗 [HuggingFace Models](https://huggingface.co/models)

## ✅ Checklist для запуска

- [ ] LM Studio установлен
- [ ] Модель загружена (Qwen2.5-7B recommended)
- [ ] Server запущен на port 1234
- [ ] `.env.local` настроен
- [ ] `npm run dev` работает
- [ ] Тест в чате пройден
- [ ] Проверен русский язык
- [ ] Проверена работа с тревогой/стрессом
- [ ] Проверена обработка кризисных сообщений

---

💡 **Совет**: Начните с простой модели (Qwen2.5-7B-Q4), протестируйте, потом можете перейти на более мощную если нужно.

🚀 **Ready to go!**
