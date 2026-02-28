# 🌍 Система локализации (i18n)

## 📁 Файлы

- **`src/lib/i18n/translations.js`** — ОДИН файл со ВСЕМИ переводами (RU, EN, KZ)
- **`src/lib/i18n/useTranslation.js`** — Хук для использования переводов

---

## ✅ Как использовать

### 1. Импортировать хук

```jsx
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useAppSettings } from "@/components/AppShell";
```

### 2. Получить язык пользователя

```jsx
const { settings } = useAppSettings();
const lang = settings?.language || "ru";
```

### 3. Использовать переводы

```jsx
const t = useTranslation("analytics", lang); // секция + язык

return (
  <div>
    <h1>{t("title")}</h1>
    <p>{t("subtitle")}</p>
  </div>
);
```

---

## 📝 Как добавить новые переводы

### Шаг 1: Открыть `src/lib/i18n/translations.js`

### Шаг 2: Найти нужную секцию или создать новую

```javascript
export const translations = {
  // Существующие секции
  nav: { ... },
  profile: { ... },
  analytics: { ... },
  
  // НОВАЯ СЕКЦИЯ (например для модалки)
  modal: {
    ru: {
      confirm: "Подтвердить",
      cancel: "Отмена",
    },
    en: {
      confirm: "Confirm",
      cancel: "Cancel",
    },
    kz: {
      confirm: "Растау",
      cancel: "Бас тарту",
    },
  },
};
```

### Шаг 3: Использовать в компоненте

```jsx
const t = useTranslation("modal", lang);

<button>{t("confirm")}</button>
<button>{t("cancel")}</button>
```

---

## 🎯 Доступные секции

| Секция | Описание | Примеры ключей |
|--------|----------|----------------|
| `common` | Общие слова | `loading`, `save`, `cancel`, `delete` |
| `nav` | Навигация | `home`, `about`, `profile`, `signout` |
| `profile` | Профиль | `title`, `editProfile`, `security` |
| `analytics` | Аналитика | `title`, `avgMood`, `myWeek` |
| `notes` | Дневник | `title`, `addNote`, `mood`, `sleep` |
| `chat` | Чат | `title`, `placeholder`, `send` |
| `exercises` | Упражнения | `title`, `breathing`, `tests` |

---

## 🚀 Быстрый старт

### Пример: Добавить новую страницу с переводами

**1. Добавить переводы в `translations.js`:**

```javascript
myNewPage: {
  ru: {
    welcome: "Добро пожаловать",
    description: "Это описание",
  },
  en: {
    welcome: "Welcome",
    description: "This is description",
  },
  kz: {
    welcome: "Қош келдіңіз",
    description: "Бұл сипаттама",
  },
},
```

**2. Использовать в компоненте:**

```jsx
"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";
import { useAppSettings } from "@/components/AppShell";

export default function MyNewPage() {
  const { settings } = useAppSettings();
  const lang = settings?.language || "ru";
  const t = useTranslation("myNewPage", lang);

  return (
    <div>
      <h1>{t("welcome")}</h1>
      <p>{t("description")}</p>
    </div>
  );
}
```

---

## ⚡ Преимущества этой системы

✅ **Один файл** — все переводы в одном месте  
✅ **Легко редактировать** — не нужно искать по папкам  
✅ **Консистентность** — используется одинаково везде  
✅ **Автокомплит** — IDE подсказывает доступные ключи  
✅ **Нет зависимостей** — без лишних библиотек  
✅ **Быстро** — нет накладных расходов  

---

## 🛠 Замена в существующих компонентах

### ❌ Было (старый способ):

```jsx
// Локальный файл _i18n/dict.js в каждой папке
import { useDict } from "./_i18n/dict";

const t = useDict(lang);
```

### ✅ Стало (новый способ):

```jsx
// Один централизованный файл
import { useTranslation } from "@/lib/i18n/useTranslation";

const t = useTranslation("analytics", lang); // указываем секцию
```

---

## 📌 Примечания

- По умолчанию используется **русский язык** (`ru`)
- Если ключ не найден, возвращается сам ключ
- Если язык не найден, используется русский как fallback
- Для SSR компонентов используйте `getTranslations()` вместо `useTranslation()`

---

*Последнее обновление: 27 февраля 2026*
