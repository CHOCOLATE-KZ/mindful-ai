# Персонаж AI Психолога - Руководство интеграции

## Обзор

Создан полнофункциональный персонаж AI психолога с детализированной SVG графикой и динамическими анимациями. Персонаж автоматически меняет выражение лица и эмоции в зависимости от контекста разговора.

## Компоненты

### 1. `PsychologistCharacter.jsx` - Основной компонент

Отвечает за рендеринг SVG персонажа и управление анимациями.

**Props:**
```javascript
{
  isActive: boolean           // Активен ли AI процесс (пульсация)
  emotion: string            // 'neutral' | 'happy' | 'listening' | 'thinking' | 'concerned'
  showThoughts: boolean      // Показывать ли облако с мыслями
  thoughtText: string        // Текст в облаке мыслей
  position: string           // 'left' | 'right' | 'center'
  size: string               // 'small' | 'medium' | 'large'
  animated: boolean          // Включить анимации
}
```

### 2. `CharacterController.jsx` - Контроллер с логикой

Управляет эмоциями персонажа на основе сообщений в чате и состояния загрузки.

**Props:**
```javascript
{
  chatMessages: array        // История сообщений чата
  isLoading: boolean        // Загружается ли ответ
  position: string          // Позиция на экране
  size: string              // Размер персонажа
  showCharacter: boolean    // Показывать ли персонажа
}
```

## Примеры интеграции

### Пример 1: Интеграция в чат-страницу

```javascript
'use client';

import { useState } from 'react';
import CharacterController from '@/components/CharacterController';
import ChatInput from '@/components/chat/ChatInput';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text) => {
    setMessages([...messages, { role: 'user', content: text }]);
    setIsLoading(true);

    // ... ваша логика запроса к API

    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen">
      {/* Персонаж психолога */}
      <CharacterController
        chatMessages={messages}
        isLoading={isLoading}
        position="right"
        size="medium"
        showCharacter={true}
      />

      {/* Остальной контент чата */}
      <div className="container mx-auto p-4">
        {/* ваш чат интерфейс */}
      </div>
    </div>
  );
}
```

### Пример 2: Прямое использование компонента с фиксированными параметрами

```javascript
import PsychologistCharacter from '@/components/PsychologistCharacter';

export default function AnalyticsPage() {
  return (
    <div className="relative min-h-screen">
      <PsychologistCharacter
        isActive={false}
        emotion="happy"
        position="left"
        size="medium"
        animated={true}
      />

      {/* Содержимое страницы */}
    </div>
  );
}
```

### Пример 3: Интеграция с облаком мыслей

```javascript
import PsychologistCharacter from '@/components/PsychologistCharacter';

export default function ThinkingPage() {
  return (
    <PsychologistCharacter
      isActive={true}
      emotion="thinking"
      showThoughts={true}
      thoughtText="Давайте разберемся в ваших эмоциях..."
      position="center"
      size="large"
    />
  );
}
```

### Пример 4: Полная интеграция в существующий чат компонент

Добавьте в ваш основной чат компонент (например, в `src/app/(app)/chat/page.js`):

```javascript
'use client';

import { useState, useEffect } from 'react';
import CharacterController from '@/components/CharacterController';
// ... остальные импорты

export default function ChatPage() {
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ... ваша логика чата

  return (
    <div className="relative flex flex-col h-screen">
      {/* Свободное пространство для персонажа */}
      <CharacterController
        chatMessages={chatMessages}
        isLoading={isLoading}
        position="right"
        size="medium"
        showCharacter={true}
      />

      {/* Контейнер чата с padding-right для персонажа */}
      <div className="flex-1 overflow-y-auto pb-24 pr-40">
        {/* Ваши сообщения чата */}
      </div>

      {/* Инпут чата */}
      <div className="fixed bottom-0 left-0 right-0">
        {/* Чат инпут */}
      </div>
    </div>
  );
}
```

## Кастомизация

### Изменение стиля персонажа

Подредактируйте SVG в `PsychologistCharacter.jsx`:

```javascript
// Изменить цвет одежды
<linearGradient id="clothGradient" x1="0%" y1="0%" x2="0%" y2="100%">
  <stop offset="0%" stopColor="#ВАШ_ЦВЕТ_1" />
  <stop offset="100%" stopColor="#ВАШ_ЦВЕТ_2" />
</linearGradient>

// Изменить цвет волос
fill="#ВАШ_ЦВЕТ_ВОЛОС"

// Изменить цвет глаз
fill="#ВАШ_ЦВЕТ_ГЛАЗ"
```

### Добавление новых эмоций

В `PsychologistCharacter.jsx` добавьте новое выражение в условия рта/бровей:

```javascript
{emotion === 'surprised' && (
  <>
    {/* Округлый рот для удивления */}
    <circle cx="100" cy="105" r="8" fill="#e74c3c" />
    {/* Поднятые брови */}
    <path d="M 70 45 Q 75 40 80 45" stroke="#5a4a3a" strokeWidth="2" />
    <path d="M 120 45 Q 125 40 130 45" stroke="#5a4a3a" strokeWidth="2" />
  </>
)}
```

### Добавление новых анимаций

Добавьте в `psychologist-character.module.css`:

```css
@keyframes customAnimation {
  0% {
    transform: /* ваша трансформация */;
  }
  100% {
    transform: /* ваша трансформация */;
  }
}
```

Затем применить к элементу:

```javascript
<motion.div
  animate={{
    custom: [1, 1.3, 1],
    transition: { duration: 0.8 }
  }}
>
  Content
</motion.div>
```

## Страницы для интеграции

Рекомендуется добавить персонажа на страницы с AI процессами:

1. **Chat (`/chat`)** - основное место ✅
2. **Exercises (`/exercises`)** - при выполнении упражнений
3. **Analytics (`/analytics`)** - при анализе данных
4. **Notes (`/notes`)** - при анализе заметок
5. **Language Test (`/language-test`)** - при тестировании

## Эмоции и их значение

| Эмоция | Когда использовать | Визуал |
|--------|-------------------|-------|
| `neutral` | Начальное состояние | Нейтральное выражение |
| `happy` | После позитивного ответа | Улыбка 😊 |
| `listening` | При получении сообщения | Закрытый рот, внимание |
| `thinking` | Ожидание ответа AI | Задумчивое выражение |
| `concerned` | На тревожные темы | Беспокойное выражение |

## Оптимизация производительности

- Персонаж использует `AnimatePresence` для плавного входа/выхода
- SVG оптимизирован для мобильных устройств
- Анимации используют GPU-дружественные трансформы
- Рекомендуется использовать `size="small"` на мобильных устройствах

## Темизация (Dark mode)

Персонаж автоматически подстраивается под текущую тему благодаря `drop-shadow` эффектам. Цвета SVG можно также адаптировать:

```javascript
const isDark = useTheme().resolvedTheme === 'dark';

<circle
  cx="75"
  cy="75"
  r="8"
  fill={isDark ? "#60a5fa" : "#4a90e2"}
/>
```

## Отладка

Если персонаж не появляется:

1. Убедитесь, что используется `'use client'` обозначение
2. Проверьте, что `showCharacter={true}`
3. Убедитесь, что родительский контейнер имеет `position: relative` или `absolute`
4. Проверьте z-index конфликты в CSS

## Дополнительные идеи для расширения

- ☐ Добавить звуковые эффекты (озвучивание персонажа)
- ☐ Создать кастомные анимации для каждого типа помощи
- ☐ Добавить предустановки персонажей (включить выбор)
- ☐ Интегрировать речевое взаимодействие
- ☐ Добавить виртуального помощника (дополнительный персонаж)
- ☐ Сохранять предпочтения пользователя о видимости персонажа

## Поддержка и вопросы

При возникновении вопросов по интеграции, проверьте:

- Правильность импортов компонентов
- Наличие `framer-motion` в `package.json`
- Проверка консоли браузера на ошибки
- Убедитесь, что проект собирается без ошибок (`npm run build`)
