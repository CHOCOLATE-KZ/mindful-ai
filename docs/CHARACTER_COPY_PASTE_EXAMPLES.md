# 🚀 Копируй-Вставляй: Быстрые примеры кода

## Самые часто используемые варианты

### 1️⃣ Базовый персонаж с улыбкой
```javascript
import PsychologistCharacter from '@/components/PsychologistCharacter';

<PsychologistCharacter emotion="happy" size="medium" position="right" />
```

### 2️⃣ Персонаж, который слушает (для чата)
```javascript
import CharacterController from '@/components/CharacterController';

<CharacterController
  chatMessages={messages}
  isLoading={loading}
  position="right"
  size="medium"
  showCharacter={true}
/>
```

### 3️⃣ Персонаж с мыслями
```javascript
<PsychologistCharacter
  emotion="thinking"
  showThoughts={true}
  thoughtText="Давайте разберемся..."
  isActive={true}
/>
```

### 4️⃣ Персонаж в центре страницы с анимацией входа
```javascript
import { CharacterScene } from '@/components/CharacterScenes';

<CharacterScene
  type="welcome"
  subtitle="Добро пожаловать! Я здесь, чтобы помочь."
  showBackground={true}
/>
```

### 5️⃣ Волнующийся персонаж (для тревожных ситуаций)
```javascript
<PsychologistCharacter
  emotion="concerned"
  showThoughts={true}
  thoughtText="Я вас слушаю"
  position="left"
/>
```

---

## 📋 Примеры для разных сценариев

### Сценарий: Загрузка ответа AI

```javascript
const [loading, setLoading] = useState(false);

{loading && (
  <PsychologistCharacter
    emotion="thinking"
    isActive={true}
    showThoughts={true}
    thoughtText="Анализирую вашу ситуацию..."
    position="right"
    size="medium"
  />
)}
```

---

### Сценарий: Ответ получен успешно

```javascript
useEffect(() => {
  if (lastMessage?.role === 'assistant') {
    setCharacterEmotion('happy');
    setTimeout(() => setCharacterEmotion('neutral'), 3000);
  }
}, [lastMessage]);

<PsychologistCharacter emotion={characterEmotion} />
```

---

### Сценарий: Пользователь говорит о тревоге

```javascript
useEffect(() => {
  const userSaidSomethingWorrying = messages
    .filter(m => m.role === 'user')
    .some(m => m.content.includes('тревог') || m.content.includes('беспокой'));

  if (userSaidSomethingWorrying) {
    setCharacterEmotion('concerned');
  }
}, [messages]);

<PsychologistCharacter emotion={characterEmotion} />
```

---

### Сценарий: Мобильная версия

```javascript
import { useMediaQuery } from 'react-responsive';

const isDesktop = useMediaQuery({ minWidth: 1024 });

<CharacterController
  chatMessages={messages}
  isLoading={loading}
  size={isDesktop ? 'medium' : 'small'}
  position={isDesktop ? 'right' : 'center'}
  showCharacter={isDesktop}
/>
```

---

### Сценарий: Полный цикл во время упражнения

```javascript
'use client';

import { useState } from 'react';
import PsychologistCharacter from '@/components/PsychologistCharacter';

export default function ExercisePage() {
  const [exercise, setExercise] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [starting, setStarting] = useState(false);

  const startExercise = (ex) => {
    setExercise(ex);
    setStarting(true);
    setTimeout(() => setStarting(false), 2000);
  };

  const finishExercise = () => {
    setCompleted(true);
    setTimeout(() => {
      setCompleted(false);
      setExercise(null);
    }, 3000);
  };

  return (
    <div className="relative">
      {exercise && (
        <PsychologistCharacter
          emotion={
            completed ? 'happy' : starting ? 'listening' : 'neutral'
          }
          showThoughts={completed}
          thoughtText={
            completed
              ? 'Отлично! Вы делаете большой шаг к здоровью! 🎉'
              : ''
          }
          position="right"
          size="medium"
        />
      )}

      {/* Ваш контент упражнения */}
    </div>
  );
}
```

---

## 🎨 Быстрые кастомизации цветов

### Изменить цвет одежды с синего на фиолетовый

Найдите в `PsychologistCharacter.jsx` раздел с градиентом одежды:

```javascript
// Было:
<stop offset="0%" stopColor="#7b9fc9" />
<stop offset="100%" stopColor="#5a7ba8" />

// Станет:
<stop offset="0%" stopColor="#a74ba2" />
<stop offset="100%" stopColor="#7a3a80" />
```

### Изменить волосы с коричневых на черные

```javascript
// Было:
fill="#5a4a3a"  // коричневый

// Станет:
fill="#1a1a1a"  // черный
```

### Изменить глаза с голубых на зеленые

```javascript
// Было:
fill="#4a90e2"  // голубой

// Станет:
fill="#2ecc71"  // зеленый
```

---

## 📱 Адаптивность: Копируй и используй

### Для всех страниц с персонажем

```javascript
'use client';

import { useMediaQuery } from 'react-responsive';
import CharacterController from '@/components/CharacterController';

export default function YourPage() {
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

  const characterSize = isDesktop ? 'medium' : 'small';
  const characterPosition = isDesktop ? 'right' : 'center';

  return (
    <div className="relative">
      <CharacterController
        chatMessages={messages}
        isLoading={loading}
        position={characterPosition}
        size={characterSize}
        showCharacter={true}
      />

      {/* Ваш контент */}
    </div>
  );
}
```

---

## 🎭 Все эмоции: готовые примеры

### Все 5 эмоций на одной странице (для демо)

```javascript
import { CharacterShowcase } from '@/components/CharacterHooks';

export default function ShowcasePage() {
  return <CharacterShowcase />;
}
```

### Или вручную:

```javascript
const emotions = [
  { emotion: 'happy', label: 'Счастливый', color: 'bg-green-100' },
  { emotion: 'listening', label: 'Слушает', color: 'bg-blue-100' },
  { emotion: 'thinking', label: 'Думает', color: 'bg-purple-100' },
  { emotion: 'concerned', label: 'Беспокоится', color: 'bg-orange-100' },
  { emotion: 'neutral', label: 'Нейтральный', color: 'bg-gray-100' },
];

<div className="grid grid-cols-5 gap-4">
  {emotions.map(({ emotion, label, color }) => (
    <div key={emotion} className={`p-4 rounded ${color}`}>
      <PsychologistCharacter emotion={emotion} />
      <p className="text-center mt-2 text-sm font-medium">{label}</p>
    </div>
  ))}
</div>
```

---

## 🔧 Hook для управления персонажем

```javascript
import { usePsychologistCharacter } from '@/components/CharacterHooks';

function YourComponent() {
  const {
    emotion,
    thoughtText,
    showThoughts,
    setCharacterEmotion,
    resetCharacter,
    renderCharacter,
  } = usePsychologistCharacter();

  // Переключать эмоцию кнопкой
  const handleButtonClick = () => {
    setCharacterEmotion('happy', 'Отлично!');
  };

  return (
    <div>
      <button onClick={handleButtonClick}>Успех</button>
      <button onClick={resetCharacter}>Сброс</button>

      {renderCharacter({ position: 'right', size: 'medium' })}
    </div>
  );
}
```

---

## 🎯 Интеграция с API запросами

```javascript
const [messageText, setMessageText] = useState('');
const [characterEmotion, setCharacterEmotion] = useState('neutral');

const sendMessage = async () => {
  setCharacterEmotion('thinking');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: messageText }),
    });

    setCharacterEmotion('happy');
  } catch (error) {
    setCharacterEmotion('concerned');
  }
};
```

---

## 💾 Сохранение предпочтений пользователя

```javascript
import { useCallback, useEffect } from 'react';

function rememberCharacterSettings() {
  const [showCharacter, setShowCharacter] = useLocalStorage(
    'show-character',
    true
  );
  const [characterSize, setCharacterSize] = useLocalStorage(
    'character-size',
    'medium'
  );

  return { showCharacter, setShowCharacter, characterSize, setCharacterSize };
}

// Использование:
const { showCharacter, characterSize } = rememberCharacterSettings();

if (showCharacter) {
  return <PsychologistCharacter size={characterSize} />;
}
```

---

## 🎬 Сложные сцены

### Сцена: Начало сессии чата

```javascript
import { CharacterScene } from '@/components/CharacterScenes';

export function ChatStartScene() {
  return (
    <CharacterScene
      type="welcome"
      subtitle="Здравствуйте! Расскажите мне о себе. Как ваши дела?"
      showBackground={true}
    />
  );
}
```

### Сцена: Завершение упражнения

```javascript
import { EncouragingCharacter } from '@/components/CharacterScenes';

<div className="mt-8 text-center">
  <EncouragingCharacter />
  <h2 className="mt-4 text-2xl font-bold">Упражнение завершено!</h2>
  <p className="text-gray-600">Вы делаете отличный прогресс</p>
</div>
```

### Сцена: Загрузка уже свершилась

```javascript
import { ThinkingCharacter } from '@/components/CharacterScenes';

if (isLoading) {
  return <ThinkingCharacter />;
}
```

---

## 🐛 Отладка

### Проверить, что все работает

```javascript
// В консоли браузера вставьте:
console.log('Character component is working!');
document.querySelector('svg'); // Должен вернуть SVG элемент
```

### Временно отключить анимации для отладки

```javascript
<PsychologistCharacter
  emotion="happy"
  animated={false}  // Отключить анимации
/>
```

### Проверить z-index

```css
/* Если персонаж скрывается за другим контентом */
.character-container {
  z-index: 40; /* Увеличьте если нужно */
}
```

---

## 📦 Готовые блоки для копирования

### Блок 1: Полная страница чата с персонажем

Copy-paste готово! Только замените `...` на ваш контент:

```javascript
'use client';

import { useState, useEffect } from 'react';
import CharacterController from '@/components/CharacterController';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    setMessages([...messages, { role: 'user', content: input }]);
    setLoading(true);
    setInput('');

    // Ваш код запроса

    setLoading(false);
  };

  return (
    <div className="relative flex flex-col h-screen bg-white">
      {/* Персонаж */}
      <CharacterController
        chatMessages={messages}
        isLoading={loading}
        position="right"
        size="medium"
        showCharacter={true}
      />

      {/* Основной контент */}
      <div className="flex-1 overflow-y-auto pr-40 p-8">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
            {msg.content}
          </div>
        ))}
      </div>

      {/* Инпут */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 p-2 border rounded"
            placeholder="Ваше сообщение..."
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

**Нужен еще пример? Смотрите документацию:**
- [Полный гайд](./PSYCHOLOGIST_CHARACTER_GUIDE.md)
- [Примеры интеграции](./INTEGRATION_EXAMPLES.md)
- [Размещение на страницах](./CHARACTER_PLACEMENT_GUIDE.md)
