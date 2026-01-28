# Инструкция по установке исправления тестов

## ✅ Что нужно сделать

### 1. Обновить `page.js` ✅

**Путь:** `src/app/(app)/exercises/[testKey]/page.js`

**Скопируйте:**
```javascript
import TestRunner from "./TestRunner";

export default async function TestPage(props) {
  const params = await props.params;
  const testKey = params?.testKey;
  return <TestRunner testKey={testKey} />;
}
```

---

### 2. Обновить `TestRunner.jsx` ✅

**Путь:** `src/app/(app)/exercises/[testKey]/TestRunner.jsx`

**Скопируйте полный код из файла COMPARISON_BEFORE_AFTER.md** (секция "✅ СТАЛО (полная версия)")

Или используйте файл, который я уже создал (проверьте, что он существует по пути).

---

### 3. Создать `testsData.js` ✅

**Путь:** `src/features/exercises/testsData.js`

**Скопируйте:**
```javascript
/**
 * TESTS_DATA — центральный источник данных для всех тестов
 * Ключи должны совпадать с keys в TESTS каталоге (exercises/page.js)
 */

export const TESTS_DATA = {
  uncertainty_tolerance: {
    title: "Умеете ли вы выдерживать неопределённость?",
    description: "Оцените, как вы реагируете на неопределённость и нестабильные ситуации.",
    questions: [
      {
        question: "Вы легко принимаете решения в неопределённых ситуациях?",
        options: ["Да", "Иногда", "Нет"],
      },
      {
        question: "Новые задачи вас мотивируют?",
        options: ["Да", "Иногда", "Нет"],
      },
      {
        question: "Вы планируете всё заранее или предпочитаете импровизировать?",
        options: ["Всегда план", "Баланс", "Люблю спонтанность"],
      },
    ],
  },
  manipulation_test: {
    title: "Легко ли вами манипулировать?",
    description: "Тест на вашу восприимчивость к влиянию других людей.",
    questions: [
      {
        question: "Вы часто сомневаетесь в своих решениях под влиянием других?",
        options: ["Да", "Иногда", "Нет"],
      },
      {
        question: "Легко ли вас убедить в чём-то, что вы первоначально отвергали?",
        options: ["Очень легко", "Иногда", "Сложно"],
      },
      {
        question: "Вы предпочитаете слушать других или идти своим путём?",
        options: ["Слушаю советы", "Баланс", "Свой путь"],
      },
    ],
  },
  money_attitude: {
    title: "Тест на отношение к деньгам",
    description: "Проверка ваших привычек и отношения к финансам.",
    questions: [
      {
        question: "Вы планируете свой бюджет заранее?",
        options: ["Да, всегда", "Иногда", "Нет, спонтанно"],
      },
      {
        question: "Деньги для вас — это инструмент или символ статуса?",
        options: ["Инструмент", "Оба варианта", "Статус"],
      },
      {
        question: "Вы предпочитаете откладывать деньги или тратить их сразу?",
        options: ["Откладывать", "Баланс", "Тратить сразу"],
      },
    ],
  },
};

/**
 * Получить один тест по ключу
 */
export function getTestByKey(key) {
  if (!key) return null;
  return TESTS_DATA[key] || null;
}

/**
 * Получить все доступные ключи тестов
 */
export function getAvailableTestKeys() {
  return Object.keys(TESTS_DATA);
}

/**
 * Валидировать testKey
 */
export function isValidTestKey(key) {
  if (!key || typeof key !== "string") return false;
  return getAvailableTestKeys().includes(key.toLowerCase().trim());
}
```

---

### 4. Убедитесь, что таблица в Supabase создана ✅

**Таблица:** `tests_log`

Выполните в Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS public.tests_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  test_key VARCHAR(255) NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Создать индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS tests_log_user_id_idx ON public.tests_log(user_id);
CREATE INDEX IF NOT EXISTS tests_log_test_key_idx ON public.tests_log(test_key);
```

**Если таблица уже существует, просто пропустите этот шаг.**

---

## 🧪 Проверка работоспособности

### Шаг 1: Запустить проект
```bash
npm run dev
```

### Шаг 2: Открыть тест в браузере

#### Вариант А: Авторизованный пользователь
1. Откройте http://localhost:3000/exercises/uncertainty_tolerance
2. Вы должны увидеть:
   - Стартовый экран с информацией о тесте
   - Кнопку "Начать тест"
3. Нажмите кнопку
4. Вы должны видеть:
   - Вопрос
   - Опции ответов
   - Прогресс-бар ("Вопрос 1 из 3")
5. Выберите ответ и нажмите "Следующий вопрос"
6. Повторите для всех вопросов
7. На последнем вопросе нажмите "Завершить тест"
8. Вы должны увидеть:
   - Зелёный экран успеха "✅ Тест завершён!"
   - Кнопки "Назад к упражнениям" и "Мой профиль"

#### Вариант Б: Не авторизованный пользователь
1. Откройте http://localhost:3000/exercises/uncertainty_tolerance (в приватном окне)
2. Вы должны увидеть:
   - Жёлтый экран "🔐 Требуется вход"
   - Кнопку "Войти в аккаунт"
3. Нажмите кнопку
4. Вы должны быть перенаправлены на `/auth/sign-in?next=/exercises/uncertainty_tolerance`

#### Вариант В: Не найденный тест
1. Откройте http://localhost:3000/exercises/invalid_test_key
2. Вы должны увидеть:
   - Красный экран "❌ Тест не найден"
   - Текст: `Тест с ключом "invalid_test_key" не существует.`
   - Список доступных тестов
   - Кнопку "← Вернуться к упражнениям"

### Шаг 3: Проверить сохранение в базе

1. Откройте Supabase Dashboard
2. Перейдите на таблицу `tests_log`
3. Вы должны видеть записи с:
   - `user_id` (UUID вашего пользователя)
   - `test_key` (например, "uncertainty_tolerance")
   - `answers` (JSON с ответами, например `{"0":"Да","1":"Иногда","2":"Баланс"}`)
   - `created_at` (время создания)

---

## 🐛 Решение проблем

### Проблема: Все вопросы видны на одном экране

**Причина:** Состояние `started` не обновляется

**Решение:**
```javascript
// Проверьте, что когда вы нажимаете "Начать тест", вызывается:
onClick={() => {
  setStarted(true);  // ← Это должно быть здесь
  setCurrentIndex(0);
  setAnswers({});
  setMsg("");
}}
```

---

### Проблема: "Тест не найден" для существующего теста

**Причина:** Ключ не совпадает (разный регистр, пробелы)

**Решение:**
1. Проверьте URL: должно быть ровно `uncertainty_tolerance`
2. Проверьте в `testsData.js`, что ключ написан правильно
3. Посмотрите в консоли браузера (F12) → Console, должно быть видно какой testKey приходит

---

### Проблема: "Ошибка при сохранении" при завершении теста

**Причина:** Таблица `tests_log` не создана или нет доступа

**Решение:**
1. Откройте Supabase Dashboard
2. Проверьте, что таблица `tests_log` существует
3. Проверьте Row Level Security (RLS) политики:
   - Пользователь должен иметь доступ для вставки в таблицу
   - Рекомендуется:
     ```sql
     ALTER TABLE public.tests_log ENABLE ROW LEVEL SECURITY;
     
     CREATE POLICY "Users can insert their own test logs" ON public.tests_log
     FOR INSERT WITH CHECK (auth.uid() = user_id);
     
     CREATE POLICY "Users can view their own test logs" ON public.tests_log
     FOR SELECT USING (auth.uid() = user_id);
     ```

---

### Проблема: Ошибка "Failed to fetch user"

**Причина:** Проблемы с инициализацией Supabase

**Решение:**
1. Проверьте переменные окружения в `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   ```
2. Откройте консоль браузера (F12) → Console
3. Должно быть видно сообщение об ошибке с деталями

---

## 📝 Контрольный список

- [ ] Обновил `page.js` с `async` и `await props.params`
- [ ] Обновил `TestRunner.jsx` полностью
- [ ] Создал `testsData.js` с импортом функций валидации
- [ ] Создал/проверил таблицу `tests_log` в Supabase
- [ ] Запустил проект (`npm run dev`)
- [ ] Тестировал открытие существующего теста
- [ ] Тестировал открытие не существующего теста
- [ ] Тестировал открытие без авторизации
- [ ] Прошёл полный тест и проверил сохранение в БД
- [ ] Проверил консоль браузера (F12) на ошибки

---

## 🎉 Готово!

Все исправления установлены. Ваши тесты теперь должны работать корректно с:
- ✅ Правильной обработкой Next.js 16+ params
- ✅ Валидацией testKey
- ✅ Красивыми экранами ошибок
- ✅ Проверкой авторизации
- ✅ Сохранением результатов в Supabase
- ✅ Детальным логированием ошибок
