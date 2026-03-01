# Рекомендации по размещению персонажа на страницах

## 📍 Карта страниц вашего проекта

### 🗨️ `/chat` - Основной чат
**Рекомендация:** ✅ ОБЯЗАТЕЛЬНО добавить

**Почему:** Основное место взаимодействия с AI психологом. Персонаж поддерживает разговор и показывает, что "психолог" вас слушает.

**Рекомендуемые настройки:**
```javascript
<CharacterController
  chatMessages={messages}
  isLoading={loading}
  position="right"        // Справа от чата
  size="medium"
  showCharacter={true}
/>
```

**Рекомендуемые эмоции:**
- 🤔 `thinking` - при загрузке ответа
- 👂 `listening` - когда пользователь пишет
- 😊 `happy` - когда получен ответ на позитивное сообщение
- 😟 `concerned` - на тревожные темы

---

### 💪 `/exercises` - Упражнения для благополучия
**Рекомендация:** ✅ РЕКОМЕНДУЕТСЯ добавить

**Почему:** Персонаж может мотивировать и поддерживать пользователя при выполнении упражнений.

**Сценарий использования:**
1. До упражнения: `emotion="happy"` - мотивирующий старт
2. Во время: `emotion="listening"` - сосредоточенность
3. После завершения: `emotion="happy"` с похвалой

**Рекомендуемый код:**
```javascript
'use client';

import PsychologistCharacter from '@/components/PsychologistCharacter';

export default function ExercisesPage() {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [completed, setCompleted] = useState(false);

  return (
    <div className="relative">
      {selectedExercise && (
        <PsychologistCharacter
          emotion={completed ? 'happy' : 'listening'}
          showThoughts={completed}
          thoughtText="Отлично! Вы делаете большой шаг к благополучию."
          position="right"
          size="medium"
        />
      )}
      
      {/* Содержимое упражнений */}
    </div>
  );
}
```

---

### 📊 `/analytics` - Аналитика и статистика
**Рекомендация:** ✅ РЕКОМЕНДУЕТСЯ добавить

**Почему:** Персонаж может анализировать данные вместе с пользователем, показывая, что понимает его прогресс.

**Сценарий использования:**
1. При загрузке: `emotion="thinking"` с облаком "Анализирую ваш прогресс..."
2. После анализа: `emotion="happy"` с позитивным сообщением или support

**Рекомендуемый код:**
```javascript
import { CharacterScene } from '@/components/CharacterScenes';
import { ThinkingCharacter } from '@/components/CharacterScenes';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return <ThinkingCharacter />;
  }

  return (
    <div>
      <CharacterScene 
        type="encouraging"
        subtitle="Вы делаете хороший прогресс! Продолжайте 💪"
      />
      
      {/* Ваша статистика */}
    </div>
  );
}
```

---

### 🗒️ `/notes` - Записи и анализ заметок
**Рекомендация:** ✅ РЕКОМЕНДУЕТСЯ добавить

**Почему:** Когда пользователь создает заметку, персонаж может показать, что активно слушает и анализирует.

**Сценарий использования:**
1. Во время создания заметки: нейтральное состояние
2. При анализе: `emotion="thinking"` + мысли об анализе
3. После анализа: `emotion="happy"` с выводами

**Рекомендуемый код:**
```javascript
import { usePsychologistCharacter } from '@/components/CharacterHooks';

export default function NotesPage() {
  const character = usePsychologistCharacter();
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyzeNote = async (note) => {
    setAnalyzing(true);
    character.setCharacterEmotion(
      'thinking',
      'Анализирую вашу заметку...'
    );

    await analyzeNote(note);

    setAnalyzing(false);
    character.setCharacterEmotion(
      'happy',
      'Спасибо за то, что поделились!'
    );
  };

  return (
    <div className="relative">
      {character.renderCharacter({ position: 'right' })}
      
      {/* Содержимое заметок */}
    </div>
  );
}
```

---

### 🧪 `/language-test` - Языковой тест
**Рекомендация:** ⭐ ОПЦИОНАЛЬНО

**Почему:** Может отвлекать от концентрации. Если добавить, то только в пассивном режиме.

**Сценарий использования:**
- После прохождения теста: `emotion="happy"` с похвалой
- Во время теста: скрыт или минимизирован

**Рекомендуемый код:**
```javascript
export default function LanguageTestPage() {
  const [testComplete, setTestComplete] = useState(false);

  return (
    <div className="relative">
      {testComplete && (
        <PsychologistCharacter
          emotion="happy"
          showThoughts={true}
          thoughtText="Отличная работа! Ваш результат впечатляет."
          size="medium"
        />
      )}
      
      {/* Контент теста */}
    </div>
  );
}
```

---

### 👤 `/profile` - Профиль пользователя
**Рекомендация:** ❌ НЕ РЕКОМЕНДУЕТСЯ

**Почему:** На этой странице основное внимание на личной информации пользователя, персонаж может быть отвлекающим.

**Альтернатива:** Если хочется добавить поддержку, используйте `size="small"` и `position="left"` в нижнем углу.

---

## 🎯 Матрица использования

| Страница | Добавить | Позиция | Размер | Эмоции | Особенности |
|----------|----------|---------|--------|--------|------------|
| `/chat` | ✅ Нужно | right | medium | dynamic | CharacterController |
| `/exercises` | ✅ Рек. | right | medium | variable | Мотивирующие |
| `/analytics` | ✅ Рек. | center | large | thinking→happy | Анализирующие |
| `/notes` | ✅ Рек. | right | medium | dynamic | Слушающие |
| `/language-test` | ⭐ Опц. | right | small | happy | После теста |
| `/profile` | ❌ Нет | - | - | - | Отвлекает |

---

## 🛠️ Шаблон для интеграции на новую страницу

Используйте этот шаблон для быстрой интеграции:

```javascript
'use client';

import { useState, useEffect } from 'react';
import CharacterController from '@/components/CharacterController';
// или
import PsychologistCharacter from '@/components/PsychologistCharacter';

export default function NewPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [characterState, setCharacterState] = useState('neutral');

  return (
    <div className="relative min-h-screen">
      {/* СПОСОБ 1: Если нужна динамическая логика */}
      <CharacterController
        chatMessages={messages}
        isLoading={isLoading}
        position="right"
        size="medium"
        showCharacter={true}
      />

      {/* СПОСОБ 2: Если нужна полная кастомизация */}
      <PsychologistCharacter
        emotion={characterState}
        isActive={isLoading}
        showThoughts={isLoading}
        thoughtText="Обрабатываю..."
        position="right"
        size="medium"
      />

      {/* Ваше содержимое */}
      <div className="max-w-5xl mx-auto p-8">
        {/* ... */}
      </div>
    </div>
  );
}
```

---

## 📱 Адаптивность по экранам

### Мобильные (< 768px)
```javascript
position="bottom-center"  // Нижний центр для экономии места
size="small"             // Минимальный размер
showCharacter={isActive} // Показывать только при активности
```

### Планшеты (768px - 1024px)
```javascript
position="right"         // Справа
size="small"            // Маленький
showCharacter={true}
```

### Десктопы (> 1024px)
```javascript
position="right"        // Справа
size="medium"          // Средний или большой
showCharacter={true}
animated={true}        // Включить все анимации
```

**Реализация:**
```javascript
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function ResponsiveCharacter() {
  const isMobile = !useMediaQuery('(min-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  if (isMobile) {
    return <PsychologistCharacter size="small" position="center" />;
  }

  if (isDesktop) {
    return <PsychologistCharacter size="medium" position="right" />;
  }

  return <PsychologistCharacter size="small" position="right" />;
}
```

---

## 💡 Best Practices

### ✅ Делайте
- Использовать `CharacterController` для автоматического управления эмоциями
- Показывать персонажа только при активности AI процесса
- Добавлять `pr-40` или `pr-56` к контентному контейнеру
- Использовать `size="small"` на мобильных
- Давать персонажу "время на размышление" перед ответом

### ❌ Не делайте
- Не показывайте сразу на всех страницах (отвлекает)
- Не используйте большие размеры на мобильных
- Не забывайте про `position: relative` на контейнере
- Не смешивайте `CharacterController` с `PsychologistCharacter` на одной странице
- Не забывайте про `drop-shadow` в темной теме

---

## 🧪 Тестирование

Перед деплоем на каждой странице проверьте:

```javascript
// ✅ Персонаж появляется/исчезает при загрузке
// ✅ Эмоции меняются корректно
// ✅ На мобильных не перекрывает контент
// ✅ В темной теме видно
// ✅ Анимации плавные
// ✅ Мысли отображаются корректно
```

---

## 📝 Чек-лист для реализации

- [ ] Добавить на `/chat` (основное)
- [ ] Добавить на `/exercises` (поддержка)
- [ ] Добавить на `/analytics` (анализ)
- [ ] Добавить на `/notes` (слушание)
- [ ] Тестировать на всех браузерах
- [ ] Тестировать на мобильных
- [ ] Собрать отзывы пользователей
- [ ] Кастомизировать цвета под дизайн
- [ ] Добавить звуки (опционально)

---

## 🚀 Расширение функциональности

После базовой интеграции, можете добавить:
- 🎵 Озвучивание мыслей через TTS
- 📊 Отслеживание взаимодействий с персонажем
- 🎨 Выбор альтернативных образов персонажа
- 💬 Директные ответы персонажа (не только чат)
- 🏆 Достижения с реакцией персонажа
