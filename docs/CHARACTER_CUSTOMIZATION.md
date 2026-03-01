# Кастомизация Персонажа AI Психолога

## Варианты внешнего вида

### Быстрое изменение цветов

Отредактируйте файл [src/components/PsychologistCharacter.jsx](../src/components/PsychologistCharacter.jsx#L150) для изменения цветов:

```javascript
// Изменить цвет одежды
<linearGradient id="clothGradient" x1="0%" y1="0%" x2="0%" y2="100%">
  <stop offset="0%" stopColor="#7b9fc9" />  // ← Измените этот цвет
  <stop offset="100%" stopColor="#5a7ba8" />  // ← И этот
</linearGradient>

// Изменить цвет волос (несколько мест)
fill="#5a4a3a"  // ← Коричневый цвет волос

// Изменить цвет глаз
fill="#4a90e2"  // ← Голубой цвет глаз

// Изменить цвет кожи
<linearGradient id="skinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
  <stop offset="0%" stopColor="#f4d4b0" />  // ← Светлый тон кожи
  <stop offset="100%" stopColor="#e8c29a" />  // ← Темный тон кожи
</linearGradient>
```

## Добавление новых эмоций

Шаг 1: Добавьте в компонент новое выражение лица

```javascript
// В PsychologistCharacter.jsx, добавьте в раздел рта:

{emotion === 'surprised' && (
  <>
    <circle cx="100" cy="105" r="8" fill="#e74c3c" />
    <path
      d="M 70 45 Q 75 40 80 45"
      stroke="#5a4a3a"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M 120 45 Q 125 40 130 45"
      stroke="#5a4a3a"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
  </>
)}
```

Шаг 2: Добавьте в CharacterController.jsx логику распознавания

```javascript
} else if (
  content.includes('удивител') ||
  content.includes('ничего не знал')
) {
  setEmotion('surprised');
  setShowThoughts(true);
  setThoughtText('Интересно!');
}
```

Шаг 3: Обновите типы в документации

```javascript
emotion: string  // 'neutral' | 'happy' | 'listening' | 'thinking' | 'concerned' | 'surprised'
```

## Добавление звуковых эффектов

Установите зависимость:

```bash
npm install use-sound
```

Создайте компонент с звуком:

```javascript
// src/components/CharacterWithSound.jsx

'use client';

import useSound from 'use-sound';
import PsychologistCharacter from './PsychologistCharacter';
import { useEffect } from 'react';

export default function CharacterWithSound({
  emotion,
  onEmotionChange,
  ...props
}) {
  const [playHappy] = useSound('/sounds/happy.mp3');
  const [playThinking] = useSound('/sounds/thinking.mp3');
  const [playConcerned] = useSound('/sounds/concerned.mp3');

  useEffect(() => {
    if (emotion === 'happy') playHappy();
    if (emotion === 'thinking') playThinking();
    if (emotion === 'concerned') playConcerned();
  }, [emotion, playHappy, playThinking, playConcerned]);

  return <PsychologistCharacter emotion={emotion} {...props} />;
}
```

Добавьте звуковые файлы в `public/sounds/`.

## Интеграция с речевым синтезом

```javascript
// src/components/CharacterWithSpeech.jsx

'use client';

import { useEffect } from 'react';
import PsychologistCharacter from './PsychologistCharacter';

export default function CharacterWithSpeech({
  thoughtText,
  emotion,
  enableSpeech = false,
  ...props
}) {
  useEffect(() => {
    if (!enableSpeech || !thoughtText) return;

    const utterance = new SpeechSynthesisUtterance(thoughtText);
    utterance.lang = 'ru-RU';
    utterance.rate = 0.9;
    utterance.pitch = emotion === 'happy' ? 1.2 : 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [thoughtText, emotion, enableSpeech]);

  return (
    <PsychologistCharacter
      emotion={emotion}
      thoughtText={thoughtText}
      {...props}
    />
  );
}
```

## Анимация входа на страницу

```javascript
// Добавьте в компонент с персонажом

import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function Page() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={itemVariants}>
        <PsychologistCharacter {...props} />
      </motion.div>

      <motion.div variants={itemVariants}>
        {/* Остальной контент */}
      </motion.div>
    </motion.div>
  );
}
```

## Сохранение предпочтений пользователя

```javascript
// src/hooks/useCharacterPreferences.js

import { useLocalStorage } from 'usehooks-ts';

export function useCharacterPreferences() {
  const [showCharacter, setShowCharacter] = useLocalStorage(
    'psychologist-character-visible',
    true
  );
  const [characterSize, setCharacterSize] = useLocalStorage(
    'psychologist-character-size',
    'medium'
  );
  const [characterPosition, setCharacterPosition] = useLocalStorage(
    'psychologist-character-position',
    'right'
  );

  return {
    showCharacter,
    setShowCharacter,
    characterSize,
    setCharacterSize,
    characterPosition,
    setCharacterPosition,
  };
}

// Использование в компоненте:
/*
const prefs = useCharacterPreferences();

return (
  <PsychologistCharacter
    size={prefs.characterSize}
    position={prefs.characterPosition}
  />
);
*/
```

## Интеграция с аналитикой

```javascript
// src/utils/characterAnalytics.js

export function trackCharacterInteraction(emotion, context) {
  // Отправить событие в аналитику
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'character_emotion_change', {
      emotion: emotion,
      context: context,
      timestamp: new Date().toISOString(),
    });
  }
}

// Использование:
/*
useEffect(() => {
  trackCharacterInteraction(emotion, 'chat_started');
}, [emotion]);
*/
```

## Тестирование компонента

```javascript
// src/components/__tests__/PsychologistCharacter.test.js

import { render, screen } from '@testing-library/react';
import PsychologistCharacter from '../PsychologistCharacter';

describe('PsychologistCharacter', () => {
  it('renders character with correct emotion', () => {
    render(<PsychologistCharacter emotion="happy" />);
    // Проверить наличие SVG элемента
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('shows thought bubble when enabled', () => {
    render(
      <PsychologistCharacter
        showThoughts={true}
        thoughtText="Test thought"
      />
    );
    expect(screen.getByText('Test thought')).toBeInTheDocument();
  });

  it('changes position correctly', () => {
    const { container } = render(
      <PsychologistCharacter position="left" />
    );
    expect(container.firstChild).toHaveClass('-left-2');
  });
});
```

## Оптимизация производительности

### Мемоизация компонента

```javascript
import { memo } from 'react';

const PsychologistCharacterMemo = memo(PsychologistCharacter, (prevProps, nextProps) => {
  return (
    prevProps.emotion === nextProps.emotion &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.showThoughts === nextProps.showThoughts
  );
});

export default PsychologistCharacterMemo;
```

### Отключение анимаций для слабых устройств

```javascript
export function PsychologistCharacterOptimized(props) {
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)'
  );

  return (
    <PsychologistCharacter
      animated={!prefersReducedMotion}
      {...props}
    />
  );
}
```

## API для темизации

Используйте CSS переменные для динамической темизации:

```css
/* src/app/globals.css */

:root {
  --character-primary: #4a90e2;
  --character-secondary: #d4a574;
  --character-accent: #e74c3c;
}

html.dark {
  --character-primary: #60a5fa;
  --character-secondary: #d4a574;
  --character-accent: #f87171;
}
```

```javascript
// В компоненте используйте CSS переменные:
<circle cx="75" cy="75" r="8" fill="var(--character-primary)" />
```

## Интеграция с CMS содержимым

```javascript
// Загружайте речи/мысли из базы данных

export async function getCharacterResponses(context) {
  const response = await fetch(`/api/character-responses/${context}`);
  return response.json();
}

// Использование:
/*
const thoughts = await getCharacterResponses('anxiety');
setThoughtText(thoughts.random());
*/
```

## Экспорт as компонента библиотеки

Если вы хотите использовать персонажа в других проектах:

```javascript
// src/index.js (для npm пакета)

export { default as PsychologistCharacter } from './components/PsychologistCharacter';
export { default as CharacterController } from './components/CharacterController';
export { useCharacterEmotion } from './components/CharacterHooks';
export * from './components/CharacterScenes';

// package.json
{
  "name": "@diplom/psychologist-character",
  "version": "1.0.0",
  "main": "dist/index.js",
  "exports": {
    ".": "./dist/index.js",
    "./styles": "./dist/styles.css"
  }
}
```
