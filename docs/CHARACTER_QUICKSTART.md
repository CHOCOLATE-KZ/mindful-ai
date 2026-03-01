# Быстрый старт: Персонаж AI Психолога

## ⚡ За 5 минут до первого использования

### Шаг 1: Основные компоненты уже созданы

Проверьте, что у вас есть эти файлы:

```
✅ src/components/PsychologistCharacter.jsx
✅ src/components/CharacterController.jsx
✅ src/components/CharacterScenes.jsx
✅ src/components/CharacterHooks.js
✅ src/components/psychologist-character.module.css
```

### Шаг 2: Добавьте на чат-страницу (самый быстрый способ)

Откройте файл [src/app/(app)/chat/page.js](../src/app/(app)/chat/page.js)

В импортах добавьте:
```javascript
import CharacterController from "@/components/CharacterController";
```

В компоненте (внутри div с className="min-h-dvh"):
```javascript
<CharacterController
  chatMessages={messages}
  isLoading={loading}
  position="right"
  size="medium"
  showCharacter={true}
/>
```

Добавьте `pr-40` к контейнеру чата, чтобы контент не перекрывался:
```javascript
<div ref={scrollRef} className="flex-1 overflow-y-auto pb-48 pr-40">
```

✅ **Готово! Персонаж теперь работает на странице чата**

### Шаг 3: Используйте готовые сцены на других страницах

**На странице приветствия:**
```javascript
import { WelcomingCharacter } from "@/components/CharacterScenes";

export default function WelcomePage() {
  return <WelcomingCharacter />;
}
```

**На странице упражнений:**
```javascript
import { EncouragingCharacter } from "@/components/CharacterScenes";

export default function ExercisesPage() {
  return <EncouragingCharacter />;
}
```

**На странице аналитики (во время загрузки):**
```javascript
import { ThinkingCharacter } from "@/components/CharacterScenes";

if (isLoading) {
  return <ThinkingCharacter />;
}
```

## 🎨 Быстрая кастомизация

### Изменить позицию
```javascript
position="left"   // Слева
position="right"  // Справа
position="center" // В центре
```

### Изменить размер
```javascript
size="small"      // Маленький
size="medium"     // Средний (по умолчанию)
size="large"      // Большой
```

### Изменить эмоцию
```javascript
emotion="happy"       // Счастливый 😊
emotion="listening"   // Слушает
emotion="thinking"    // Думает 🤔
emotion="concerned"   // Беспокоится
emotion="neutral"     // Нейтральный
```

### Добавить облако с мыслями
```javascript
<PsychologistCharacter
  showThoughts={true}
  thoughtText="Ваш текст здесь"
  emotion="thinking"
/>
```

## 📱 Размеры экранов

Для мобильных устройств используйте `size="small"`:

```javascript
import { useMediaQuery } from "next/image";

function ChatPage() {
  const isDesktop = typeof window !== 'undefined' 
    ? window.innerWidth > 1024 
    : true;

  return (
    <CharacterController
      size={isDesktop ? "medium" : "small"}
      {...otherProps}
    />
  );
}
```

## 🌙 Dark mode

Персонаж автоматически работает в обоих режимах. Цвета используют `drop-shadow` для читаемости.

## 🔗 Полная документация

- [Полное руководство](./PSYCHOLOGIST_CHARACTER_GUIDE.md)
- [Примеры интеграции](./INTEGRATION_EXAMPLES.md)
- [Кастомизация](./CHARACTER_CUSTOMIZATION.md)

## ❓ FAQ

**Q: Персонаж не появляется?**
- ✅ Проверьте `showCharacter={true}`
- ✅ Убедитесь, что используется `'use client'`
- ✅ Проверьте z-index в CSS

**Q: Как отключить анимации?**
```javascript
<PsychologistCharacter animated={false} />
```

**Q: Как изменить цвета?**
Смотрите [CHARACTER_CUSTOMIZATION.md](./CHARACTER_CUSTOMIZATION.md)

**Q: Как добавить звук?**
Смотрите раздел "Звуковые эффекты" в [CHARACTER_CUSTOMIZATION.md](./CHARACTER_CUSTOMIZATION.md)

**Q: Работает ли на мобильных?**
Да, используйте `size="small"` для оптимизации

## 🚀 Что дальше?

1. ✅ Добавьте персонажа на основные страницы
2. ✅ Кастомизируйте цвета под ваш дизайн
3. ✅ Добавьте звуковые эффекты (опционально)
4. ✅ Тестируйте на разных устройствах
5. ✅ Собирайте отзывы пользователей

## 💡 Советы для лучшего UX

- Используйте `position="right"` на широких экранах
- Показывайте персонажа только при активности AI
- Дайте персонажу "время на размышление" (думать)
- На мобильных уменьшайте размер до `small`
- Добавляйте мысли только для важных сообщений

---

**Готовы к следующему шагу?** Смотрите полное руководство: [PSYCHOLOGIST_CHARACTER_GUIDE.md](./PSYCHOLOGIST_CHARACTER_GUIDE.md)
