# Сравнение: Было vs Стало

## 📄 page.js

### ❌ БЫЛО (4 строки):
```javascript
import TestRunner from "./TestRunner";

export default function TestPage({ params }) {
  const testKey = params?.testKey;
  return <TestRunner testKey={testKey} />;
}
```

**Проблема:** Direct access к `params.testKey` выбрасывает Promise error в Next.js 16+

---

### ✅ СТАЛО (5 строк):
```javascript
import TestRunner from "./TestRunner";

export default async function TestPage(props) {
  const params = await props.params;
  const testKey = params?.testKey;
  return <TestRunner testKey={testKey} />;
}
```

**Решение:**
- Добавлен `async` к функции (линия 3)
- Изменено: `({ params })` → `(props)` (линия 3)
- Добавлено: `const params = await props.params;` (линия 4)
- Теперь params распакован перед использованием

**Почему:** Next.js 16+ требует await для params в server components

---

---

## 🎬 TestRunner.jsx

### ❌ БЫЛО (базовая версия, 200 строк):

```javascript
"use client";

import { useState, useMemo } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

const TESTS_DATA = {
  uncertainty_tolerance: {
    title: "Умеете ли вы выдерживать неопределённость?",
    questions: [
      { question: "...", options: ["Да", "Иногда", "Нет"] },
      // ...
    ],
  },
  // ... ещё 2 теста
};

export default function TestRunner({ testKey }) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const test = TESTS_DATA[testKey];  // ⚠️ Без валидации!

  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!test) return <p className="p-4">Тест не найден</p>;  // ⚠️ Минимальный экран

  const question = test.questions[currentIndex];

  function selectAnswer(option) {
    setAnswers((prev) => ({ ...prev, [currentIndex]: option }));
  }

  async function nextQuestion() {
    if (currentIndex + 1 < test.questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setLoading(true);
      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth?.user;
        if (!user) throw new Error("Нужно войти в аккаунт");  // ⚠️ На финише!

        const { error } = await supabase.from("tests_log").insert({
          user_id: user.id,
          test_key: testKey,
          answers,
        });

        if (error) throw error;

        setMsg("Тест завершён и сохранён ✅");
      } catch (e) {
        setMsg(e.message || "Ошибка при сохранении");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{test.title}</h1>

      <div className="p-4 border rounded-xl bg-white/70 backdrop-blur-xl">
        <p className="font-medium mb-2">
          Вопрос {currentIndex + 1} из {test.questions.length}
        </p>
        <p className="mb-4">{question.question}</p>

        <div className="flex flex-col gap-2">
          {question.options.map((opt) => (
            <button
              key={opt}
              onClick={() => selectAnswer(opt)}
              className={`p-2 rounded-xl border ${
                answers[currentIndex] === opt ? "bg-blue-500 text-white" : "bg-white border-black/10"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <button
          onClick={nextQuestion}
          disabled={loading || answers[currentIndex] == null}
          className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold disabled:opacity-50"
        >
          {currentIndex + 1 < test.questions.length ? "Следующий вопрос" : "Завершить тест"}
        </button>

        {msg && <p className="mt-4 text-green-600">{msg}</p>}
      </div>
    </div>
  );
}
```

**Проблемы:**
- ❌ Нет валидации testKey (inline TESTS_DATA без проверки ключей)
- ❌ Нет стартового экрана
- ❌ Нет прогресс-бара
- ❌ Авторизация проверяется только на финише (слишком поздно)
- ❌ Нет красивого экрана завершения
- ❌ Нет обработки ошибок для не найденных тестов
- ❌ Inline TESTS_DATA — сложно синхронизировать
- ❌ Одно сообщение об ошибке

---

### ✅ СТАЛО (полная версия, 300+ строк):

```javascript
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { TESTS_DATA, getTestByKey, isValidTestKey, getAvailableTestKeys } from "@/features/exercises/testsData";
//                     ↑ Импорт валидационных функций вместо inline TESTS_DATA

export default function TestRunner({ testKey: rawTestKey }) {
  const supabase = useMemo(() => supabaseBrowser(), []);

  // ✅ Нормализация testKey
  const testKey = rawTestKey ? rawTestKey.toLowerCase().trim() : null;
  const test = testKey ? getTestByKey(testKey) : null;  // ✅ Валидация через функцию

  // ✅ Состояние авторизации (проверка ДО стартового экрана)
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // ✅ Состояния теста
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");  // ✅ Типизированные сообщения
  const [completed, setCompleted] = useState(false);  // ✅ Состояние завершения

  // ✅ useEffect для проверки авторизации при загрузке
  useEffect(() => {
    (async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setUser(authUser);
      } catch (e) {
        console.error("Failed to fetch user:", e);  // ✅ Логирование
      } finally {
        setUserLoading(false);
      }
    })();
  }, [supabase]);

  if (userLoading) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <p>Загрузка...</p>
      </div>
    );
  }

  // ✅ Экран "Тест не найден" с красивым UI
  if (!test) {
    const availableKeys = getAvailableTestKeys();
    return (
      <div className="mx-auto max-w-2xl p-6 space-y-4">
        <div className="rounded-2xl border border-red-300 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-800">❌ Тест не найден</h2>
          <p className="text-red-700 text-sm mt-2">
            Тест с ключом <code className="bg-red-100 px-1 rounded">{rawTestKey}</code> не существует.
          </p>
          <div className="mt-4">
            <p className="text-sm font-semibold text-red-800 mb-2">Доступные тесты:</p>
            <ul className="text-sm text-red-700 space-y-1">
              {availableKeys.map((k) => (
                <li key={k}>• {k}</li>
              ))}
            </ul>
          </div>
        </div>
        <Link href="/exercises" className="inline-block px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition">
          ← Вернуться к упражнениям
        </Link>
      </div>
    );
  }

  // ✅ Экран требования авторизации (ПЕРЕД началом теста)
  if (!user) {
    return (
      <div className="mx-auto max-w-2xl p-6 space-y-4">
        <div className="rounded-2xl border border-yellow-300 bg-yellow-50 p-6">
          <h2 className="text-lg font-semibold text-yellow-800">🔐 Требуется вход</h2>
          <p className="text-yellow-700 text-sm mt-2">
            Чтобы пройти тест и сохранить результаты, пожалуйста, войдите в аккаунт.
          </p>
        </div>
        <Link
          href={`/auth/sign-in?next=/exercises/${testKey}`}  // ✅ Redirect после входа
          className="inline-block px-4 py-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold hover:opacity-90 transition"
        >
          Войти в аккаунт
        </Link>
      </div>
    );
  }

  // ✅ Экран завершения теста
  if (completed) {
    return (
      <div className="mx-auto max-w-2xl p-6 space-y-4">
        <div className="rounded-2xl border border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 p-6 text-center">
          <h2 className="text-3xl font-bold text-green-700">✅ Тест завершён!</h2>
          <p className="text-green-600 text-sm mt-3">
            Ваши ответы сохранены в профиле. Спасибо за участие!
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/exercises" className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition">
              Назад к упражнениям
            </Link>
            <Link href="/profile" className="px-4 py-2 rounded-xl border border-green-400 text-green-700 font-semibold hover:bg-green-50 transition">
              Мой профиль
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Стартовый экран теста
  if (!started) {
    return (
      <div className="mx-auto max-w-2xl p-6 space-y-6">
        <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-8 space-y-4">
          <h1 className="text-3xl font-bold">{test.title}</h1>
          <p className="text-gray-700">{test.description}</p>
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
            <p className="font-semibold mb-1">📋 Всего вопросов: {test.questions.length}</p>
            <p>Время прохождения: примерно 5–10 минут.</p>
          </div>
        </div>
        <button
          onClick={() => {
            setStarted(true);
            setCurrentIndex(0);
            setAnswers({});
            setMsg("");
          }}
          className="w-full px-6 py-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold hover:opacity-90 transition"
        >
          Начать тест →
        </button>
      </div>
    );
  }

  // ✅ Основной экран прохождения теста
  const question = test.questions[currentIndex];
  const totalQuestions = test.questions.length;
  const isLastQuestion = currentIndex + 1 >= totalQuestions;

  async function handleNext() {
    if (answers[currentIndex] == null) {
      setMsg("⚠️ Пожалуйста, выберите ответ");
      setMsgType("info");
      return;
    }

    if (!isLastQuestion) {
      setCurrentIndex(currentIndex + 1);
      setMsg("");
      return;
    }

    // ✅ Завершение теста: сохранить в Supabase
    setLoading(true);
    setMsg("");
    try {
      const { error } = await supabase.from("tests_log").insert({
        user_id: user.id,
        test_key: testKey,
        answers,
      });

      if (error) {
        throw new Error(error.message || "Ошибка при сохранении результатов");
      }

      setMsgType("success");
      setCompleted(true);
    } catch (e) {
      console.error("Save error:", e);  // ✅ Логирование
      setMsg(`❌ ${e.message || "Ошибка при сохранении"}`);
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      {/* Заголовок и прогресс */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{test.title}</h1>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Вопрос {currentIndex + 1} из {totalQuestions}</span>
          {/* ✅ Прогресс-бар */}
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Карточка с вопросом */}
      <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-8 space-y-6">
        <div className="space-y-4">
          <p className="text-lg font-medium text-gray-800">{question.question}</p>

          {/* Опции ответов */}
          <div className="flex flex-col gap-3">
            {question.options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setAnswers((prev) => ({ ...prev, [currentIndex]: opt }));
                  setMsg("");
                }}
                className={`p-4 rounded-xl border-2 font-medium text-left transition ${
                  answers[currentIndex] === opt
                    ? "border-purple-500 bg-purple-50 text-purple-900"
                    : "border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Сообщения об ошибках/статусе */}
        {msg && (
          <div
            className={`p-3 rounded-xl text-sm ${
              msgType === "error"
                ? "bg-red-100 text-red-700"
                : msgType === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
            }`}
          >
            {msg}
          </div>
        )}

        {/* Кнопка навигации */}
        <button
          onClick={handleNext}
          disabled={loading || answers[currentIndex] == null}
          className="w-full px-6 py-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
        >
          {loading ? "⏳ Сохраняю..." : isLastQuestion ? "Завершить тест ✅" : "Следующий вопрос →"}
        </button>
      </div>
    </div>
  );
}
```

**Улучшения:**
- ✅ Импорт валидационных функций вместо inline TESTS_DATA
- ✅ Нормализация testKey: `toLowerCase().trim()`
- ✅ Валидация через `getTestByKey()`
- ✅ Проверка авторизации ДО старта (useEffect)
- ✅ 6 разных экранов состояния
- ✅ Красивый экран "Тест не найден" со списком доступных
- ✅ Экран требования авторизации с redirect параметром
- ✅ Стартовый экран с информацией о тесте
- ✅ Прогресс-бар (визуальная индикация прогресса)
- ✅ Типизированные сообщения (info, error, success)
- ✅ Красивый экран завершения с ссылками
- ✅ Детальное логирование ошибок

---

## 📊 Сравнительная таблица

| Функция | Было | Стало |
|---------|------|-------|
| Валидация testKey | ❌ Нет | ✅ Да |
| Нормализация testKey | ❌ Нет | ✅ Да (trim + lowercase) |
| Проверка авторизации | ⚠️ На финише | ✅ ДО старта |
| Стартовый экран | ❌ Нет | ✅ Да |
| Прогресс-бар | ❌ Нет | ✅ Да |
| Экран завершения | ❌ Просто текст | ✅ Красивый зелёный экран |
| Экран ошибки | ❌ Минимальный | ✅ Красивый с доступными тестами |
| Обработка ошибок | ⚠️ Базовая | ✅ Детальная |
| Логирование | ❌ Нет | ✅ console.error() |
| Сообщения об ошибках | ⚠️ Одно | ✅ Типизированные (info/error/success) |
| Типизация сообщений | ❌ Нет | ✅ setMsgType() |
| Импорт TESTS_DATA | ❌ Inline | ✅ Из файла с валидацией |

---

## 🎯 Ключевые изменения

### Линии кода в page.js:
```diff
- export default function TestPage({ params }) {
+ export default async function TestPage(props) {
+   const params = await props.params;
```

### Основные добавления в TestRunner.jsx:

1. **Валидация** (новое):
   ```javascript
   import { getTestByKey, isValidTestKey, getAvailableTestKeys } from "@/features/exercises/testsData";
   const testKey = rawTestKey ? rawTestKey.toLowerCase().trim() : null;
   const test = testKey ? getTestByKey(testKey) : null;
   ```

2. **Авторизация** (было на финише, стало на старте):
   ```javascript
   useEffect(() => {
     const { data: { user: authUser } } = await supabase.auth.getUser();
     setUser(authUser);
   }, []);
   ```

3. **Красивые экраны** (новое):
   - Загрузка
   - Тест не найден
   - Требуется авторизация
   - Стартовый экран
   - Завершение

4. **Прогресс-бар** (новое):
   ```javascript
   <div className="w-32 h-2 bg-gray-200 rounded-full">
     <div style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }} />
   </div>
   ```

5. **Логирование** (новое):
   ```javascript
   console.error("Save error:", e);
   console.error("Failed to fetch user:", e);
   ```

---

**Результат:** Полностью функциональный, красивый и безопасный test runner! 🎉
