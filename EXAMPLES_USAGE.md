# 🚀 ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ

**Версия:** 1.0
**Статус:** ✅ Готово

---

## 📌 Примеры URL для тестирования

### Пример 1: Валидный тест (авторизованный пользователь)

```
URL: http://localhost:3000/exercises/uncertainty_tolerance

Ожидаемый результат:
✅ Стартовый экран с информацией о тесте
✅ Кнопка "Начать тест"
✅ При нажатии — первый вопрос с опциями
✅ Прогресс-бар "Вопрос 1 из 3"
✅ После завершения — экран успеха с ссылками
```

---

### Пример 2: Валидный тест (разные регистры)

```
URL: http://localhost:3000/exercises/UNCERTAINTY_TOLERANCE
URL: http://localhost:3000/exercises/Uncertainty_Tolerance
URL: http://localhost:3000/exercises/MANIPULATION_TEST

Ожидаемый результат:
✅ Несмотря на разный регистр, тест найдён (нормализация: toLowerCase())
✅ Показывается правильный тест
✅ Всё работает как обычно
```

**Почему:** В TestRunner.jsx есть строка:
```javascript
const testKey = rawTestKey ? rawTestKey.toLowerCase().trim() : null;
```

---

### Пример 3: Валидный тест с пробелами

```
URL: http://localhost:3000/exercises/uncertainty_tolerance%20%20
(это URL с пробелами: uncertainty_tolerance  )

Ожидаемый результат:
✅ Пробелы обрезаны (trim())
✅ Тест найден и показывается
✅ Всё работает корректно
```

---

### Пример 4: Не существующий тест

```
URL: http://localhost:3000/exercises/invalid_test_key
URL: http://localhost:3000/exercises/not_a_real_test
URL: http://localhost:3000/exercises/xyz123

Ожидаемый результат:
❌ Красный экран "Тест не найден"
❌ Сообщение: "Тест с ключом "invalid_test_key" не существует."
❌ Список доступных тестов:
   • uncertainty_tolerance
   • manipulation_test
   • money_attitude
❌ Кнопка "← Вернуться к упражнениям"
```

---

### Пример 5: Не авторизованный пользователь

```
Шаги:
1. Откройте приватное окно браузера (Ctrl+Shift+P)
2. Откройте http://localhost:3000/exercises/uncertainty_tolerance
3. Вы не авторизованы в приватном окне

Ожидаемый результат:
🔐 Жёлтый экран "Требуется вход"
🔐 Кнопка "Войти в аккаунт"
🔐 При клике → перенаправит на /auth/sign-in?next=/exercises/uncertainty_tolerance
🔐 После входа → вернётся обратно на /exercises/uncertainty_tolerance
```

---

## 💻 Примеры кода

### Пример 1: Как использовать testsData.js функции

```javascript
import { getTestByKey, getAvailableTestKeys, isValidTestKey, TESTS_DATA } from "@/features/exercises/testsData";

// Получить тест по ключу
const test = getTestByKey("uncertainty_tolerance");
console.log(test.title); // "Умеете ли вы выдерживать неопределённость?"

// Получить все доступные ключи
const keys = getAvailableTestKeys();
console.log(keys); // ["uncertainty_tolerance", "manipulation_test", "money_attitude"]

// Проверить, валидный ли ключ
const isValid = isValidTestKey("uncertainty_tolerance");
console.log(isValid); // true

const isInvalid = isValidTestKey("invalid");
console.log(isInvalid); // false

// Получить доступ к TESTS_DATA напрямую
const allTests = TESTS_DATA;
console.log(Object.keys(allTests)); // все ключи тестов
```

---

### Пример 2: Структура теста

```javascript
const test = {
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
};

// Доступ к данным:
console.log(test.title);              // название теста
console.log(test.description);        // описание
console.log(test.questions.length);   // количество вопросов (3)
console.log(test.questions[0].question); // текст первого вопроса
console.log(test.questions[0].options);  // опции первого вопроса
```

---

### Пример 3: Структура ответов (сохраняется в Supabase)

```javascript
// Пользователь отвечает на вопросы:
const answers = {
  0: "Да",              // Вопрос 1: выбран "Да"
  1: "Иногда",          // Вопрос 2: выбран "Иногда"
  2: "Баланс",          // Вопрос 3: выбран "Баланс"
};

// Сохраняется в Supabase таблица tests_log:
// {
//   id: 123,
//   user_id: "uuid-of-user",
//   test_key: "uncertainty_tolerance",
//   answers: { 0: "Да", 1: "Иногда", 2: "Баланс" },  // JSON
//   created_at: "2024-01-15T10:30:00Z"
// }
```

---

### Пример 4: Как добавить новый тест

1. **Добавьте в testsData.js:**

```javascript
export const TESTS_DATA = {
  // ... existing tests ...
  
  new_test: {  // ⭐ Новый ключ
    title: "Название нового теста",
    description: "Описание теста",
    questions: [
      {
        question: "Первый вопрос?",
        options: ["Вариант 1", "Вариант 2", "Вариант 3"],
      },
      // ... больше вопросов ...
    ],
  },
};
```

2. **Добавьте в exercises/page.js TESTS:**

```javascript
const TESTS = [
  // ... existing tests ...
  {
    key: "new_test",
    title: "Название нового теста",
    description: "Описание теста",
  },
];
```

3. **Готово!** Новый тест будет доступен по URL:
```
http://localhost:3000/exercises/new_test
```

---

## 🧪 Примеры SQL запросов

### Пример 1: Получить все результаты теста пользователя

```sql
SELECT * FROM tests_log 
WHERE user_id = 'uuid-of-user' 
  AND test_key = 'uncertainty_tolerance'
ORDER BY created_at DESC;
```

### Пример 2: Получить последний результат каждого теста

```sql
SELECT DISTINCT ON (test_key) * FROM tests_log 
WHERE user_id = 'uuid-of-user'
ORDER BY test_key, created_at DESC;
```

### Пример 3: Получить ответы конкретного теста

```sql
SELECT answers FROM tests_log 
WHERE id = 123;

-- Результат будет JSON:
-- { "0": "Да", "1": "Иногда", "2": "Баланс" }
```

### Пример 4: Получить количество прохождений теста

```sql
SELECT test_key, COUNT(*) as count 
FROM tests_log 
WHERE user_id = 'uuid-of-user'
GROUP BY test_key;

-- Результат:
-- test_key              | count
-- uncertainty_tolerance | 2
-- manipulation_test     | 1
-- money_attitude        | 1
```

---

## 🐛 Примеры отладки

### Пример 1: Проверка в консоли браузера

```javascript
// Откройте F12 → Console и выполните:

// 1. Проверить, что testKey приходит корректно
console.log("testKey:", document.location.pathname);
// Output: "/exercises/uncertainty_tolerance"

// 2. Проверить, что Supabase инициализирован
import { supabaseBrowser } from "@/lib/supabase/browser";
const supabase = supabaseBrowser();
console.log("Supabase:", supabase);

// 3. Проверить авторизацию
const { data: { user } } = await supabase.auth.getUser();
console.log("User:", user);

// 4. Проверить таблицу tests_log
const { data, error } = await supabase.from("tests_log").select("*").limit(5);
console.log("Tests log:", data, error);
```

---

### Пример 2: Логирование в TestRunner.jsx

```javascript
// Добавьте в TestRunner.jsx для отладки:

// При загрузке пользователя
useEffect(() => {
  (async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      console.log("User loaded:", authUser);  // ← Логирование
      setUser(authUser);
    } catch (e) {
      console.error("Failed to fetch user:", e);  // ← Логирование ошибки
    } finally {
      setUserLoading(false);
    }
  })();
}, [supabase]);

// При сохранении
async function handleNext() {
  // ...
  try {
    console.log("Saving test results:", { user_id: user.id, test_key: testKey, answers });  // ← Логирование
    const { error } = await supabase.from("tests_log").insert({
      user_id: user.id,
      test_key: testKey,
      answers,
    });
    if (error) throw error;
    console.log("Test results saved successfully");  // ← Успех
  } catch (e) {
    console.error("Save error:", e);  // ← Ошибка
  }
}
```

---

## 🎯 Примеры тестирования

### Пример 1: Быстрое прохождение теста

1. Откройте http://localhost:3000/exercises/uncertainty_tolerance
2. Нажмите "Начать тест"
3. Для каждого вопроса нажмите на первый вариант
4. На последнем вопросе нажмите "Завершить тест"
5. Проверьте в Supabase таблицу tests_log

**Ожидаемый результат:**
```json
{
  "user_id": "your-user-id",
  "test_key": "uncertainty_tolerance",
  "answers": {
    "0": "Да",
    "1": "Да",
    "2": "Всегда план"
  },
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### Пример 2: Тестирование ошибок

```
Сценарий 1: Выберите ответ, но не нажимайте "Далее"
- Кнопка должна быть disabled (серая)
- Это предотвращает переход без ответа

Сценарий 2: Откройте /exercises/invalid_test
- Должен показаться красный экран с ошибкой
- Список доступных тестов должен быть видиен

Сценарий 3: Откройте в приватном окне
- Должен показаться жёлтый экран с требованием входа
- Кнопка должна вести на /auth/sign-in?next=/exercises/[testKey]
```

---

## 📈 Примеры аналитики

### Получить статистику пользователя

```javascript
// Функция для получения статистики
async function getUserTestStats(userId) {
  const { data } = await supabase
    .from("tests_log")
    .select("test_key, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const stats = {};
  data?.forEach((record) => {
    if (!stats[record.test_key]) {
      stats[record.test_key] = [];
    }
    stats[record.test_key].push(record.created_at);
  });

  return stats;
  // Результат:
  // {
  //   "uncertainty_tolerance": ["2024-01-15T10:30:00Z", "2024-01-14T09:20:00Z"],
  //   "manipulation_test": ["2024-01-15T10:25:00Z"],
  //   "money_attitude": ["2024-01-13T15:45:00Z"]
  // }
}
```

---

## 🎉 Готовые примеры для копирования

### Copy-paste: Добавить console.log для отладки

```javascript
// Добавьте в TestRunner.jsx после import
console.log("TestRunner mounted, testKey:", testKey);

// Добавьте в useEffect
console.log("User auth status:", { user, userLoading });

// Добавьте в handleNext при сохранении
console.log("Test attempt:", { testKey, answers, user_id: user?.id });

// Результат в консоли браузера:
// TestRunner mounted, testKey: uncertainty_tolerance
// User auth status: { user: {...}, userLoading: false }
// Test attempt: { testKey: "uncertainty_tolerance", answers: {...}, user_id: "uuid" }
```

---

**Все примеры готовы к использованию!** 🚀
