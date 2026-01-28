# Исправление тестов [testKey] - Краткая справка

## 📋 Что было исправлено

### 1. **Next.js 16+ params Promise error** ✅
**Файл:** `src/app/(app)/exercises/[testKey]/page.js`

Была ошибка: "A param property was accessed directly... params is a Promise"

**Решение:** Функция теперь `async` и правильно awaits params:
```javascript
export default async function TestPage(props) {
  const params = await props.params;  // ⭐ Ключевая строка
  const testKey = params?.testKey;
  return <TestRunner testKey={testKey} />;
}
```

---

### 2. **Полная переработка TestRunner.jsx** ✅
**Файл:** `src/app/(app)/exercises/[testKey]/TestRunner.jsx`

**Новые возможности:**
- ✅ Валидация testKey (нормализация: trim + lowercase)
- ✅ Стартовый экран с информацией о тесте
- ✅ Прогресс-бар (Question X of Y)
- ✅ Проверка авторизации (redirect на `/auth/sign-in?next=/exercises/[testKey]`)
- ✅ Сохранение ответов в Supabase таблицу `tests_log`
- ✅ Красивый экран завершения с ссылками
- ✅ Детальное логирование ошибок

---

### 3. **Создание центрального файла testsData.js** ✅
**Файл:** `src/features/exercises/testsData.js`

**Экспортирует:**
- `TESTS_DATA` — объект с определением всех тестов
- `getTestByKey(key)` — получить тест по ключу
- `getAvailableTestKeys()` — получить массив всех ключей
- `isValidTestKey(key)` — проверить валидность ключа

**Синхронизированные ключи:**
- `uncertainty_tolerance` (Умеете ли вы выдерживать неопределённость)
- `manipulation_test` (Легко ли вами манипулировать)
- `money_attitude` (Тест на отношение к деньгам)

---

## 🚀 Как использовать

### Открыть тест
```
http://localhost:3000/exercises/uncertainty_tolerance
http://localhost:3000/exercises/manipulation_test
http://localhost:3000/exercises/money_attitude
```

### Поток пользователя
1. **Загрузка** → проверка авторизации
2. **Если не авторизован** → экран с кнопкой "Войти в аккаунт"
3. **Если авторизован** → стартовый экран теста
4. **Нажимает "Начать тест"** → видит вопросы
5. **Отвечает на все вопросы** → нажимает "Завершить тест"
6. **Ответы сохраняются** → показывается экран успеха
7. **Может перейти** → на `/exercises` или `/profile`

---

## 📊 Структура кода

### TestRunner.jsx имеет 6 состояний:

```javascript
// 1. Загрузка пользователя
if (userLoading) { /* ... */ }

// 2. Тест не найден
if (!test) { /* ... */ }

// 3. Не авторизован
if (!user) { /* ... */ }

// 4. Завершён
if (completed) { /* ... */ }

// 5. Стартовый экран (не started)
if (!started) { /* ... */ }

// 6. Прохождение теста (основной рендер)
// ... UI с вопросом и ответами
```

---

## 🔧 Требуемая схема базы данных

Убедитесь, что в Supabase существует таблица:

```sql
CREATE TABLE IF NOT EXISTS public.tests_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  test_key VARCHAR(255) NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
```

Если таблицы нет, создайте её через Supabase dashboard или выполните SQL выше.

---

## 🐛 Отладка

### Логирование

В консоли браузера (F12) вы увидите:
```javascript
// При ошибке сохранения:
console.error("Save error:", error)

// При других ошибках:
console.error("Failed to fetch user:", error)
```

### Проверка состояния

Каждое состояние имеет мгновенный визуальный индикатор:
- 🔄 **Загрузка** → текст "Загрузка..."
- ❌ **Ошибка (тест не найден)** → красный фон + список доступных тестов
- 🔐 **Требуется вход** → жёлтый фон + кнопка входа
- 📋 **Старт** → информация о тесте + кнопка "Начать"
- ❓ **Вопросы** → вопрос + опции + прогресс-бар
- ✅ **Завершено** → зелёный экран успеха + ссылки

---

## 📍 Файлы, которые нужно изменить/добавить

- ✅ **Изменено:** `src/app/(app)/exercises/[testKey]/page.js` (4 строки)
- ✅ **Изменено:** `src/app/(app)/exercises/[testKey]/TestRunner.jsx` (300+ строк)
- ✅ **Создано:** `src/features/exercises/testsData.js` (80 строк)

---

## ✅ Статус

```
[✅] page.js — async params обработка
[✅] TestRunner.jsx — полная переработка с UX потоком
[✅] testsData.js — центральный файл с тестами
[✅] Синхронизация ключей между файлами
[✅] Сохранение в Supabase
[✅] Обработка ошибок и логирование
[✅] Красивые экраны ошибок
```

**Всё готово к использованию!** 🎉
