# 🎯 КРАТКОЕ РЕЗЮМЕ: 3 ФАЙЛА ДЛЯ КОПИРОВАНИЯ

**Статус:** ✅ ГОТОВО К ВНЕДРЕНИЮ
**Время на внедрение:** 12 минут
**Сложность:** ⭐ Легко

---

## 📋 ЧТО НУЖНО СДЕЛАТЬ

### 1️⃣ ФАЙЛ: `/src/app/(app)/exercises/[testKey]/page.js`

**Действие:** ЗАМЕНИТЕ ПОЛНОСТЬЮ (5 строк)

```javascript
import TestRunner from "./TestRunner";

export default async function TestPage(props) {
  const params = await props.params;
  const testKey = params?.testKey;
  return <TestRunner testKey={testKey} />;
}
```

**Что изменилось:**
- ✅ `async` на функции
- ✅ `props` вместо `{ params }`
- ✅ `const params = await props.params;` — новая строка

**Почему:** Next.js 16+ требует await для params в server components.

---

### 2️⃣ ФАЙЛ: `/src/app/(app)/exercises/[testKey]/TestRunner.jsx`

**Действие:** ЗАМЕНИТЕ ПОЛНОСТЬЮ (300+ строк)

**Скопируйте полный текст ниже:**

```javascript
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { TESTS_DATA, getTestByKey, isValidTestKey, getAvailableTestKeys } from "@/features/exercises/testsData";

export default function TestRunner({ testKey: rawTestKey }) {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const testKey = rawTestKey ? rawTestKey.toLowerCase().trim() : null;
  const test = testKey ? getTestByKey(testKey) : null;

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setUser(authUser);
      } catch (e) {
        console.error("Failed to fetch user:", e);
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
        <Link
          href="/exercises"
          className="inline-block px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
        >
          ← Вернуться к упражнениям
        </Link>
      </div>
    );
  }

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
          href={`/auth/sign-in?next=/exercises/${testKey}`}
          className="inline-block px-4 py-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold hover:opacity-90 transition"
        >
          Войти в аккаунт
        </Link>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="mx-auto max-w-2xl p-6 space-y-4">
        <div className="rounded-2xl border border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 p-6 text-center">
          <h2 className="text-3xl font-bold text-green-700">✅ Тест завершён!</h2>
          <p className="text-green-600 text-sm mt-3">
            Ваши ответы сохранены в профиле. Спасибо за участие!
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/exercises"
              className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
            >
              Назад к упражнениям
            </Link>
            <Link
              href="/profile"
              className="px-4 py-2 rounded-xl border border-green-400 text-green-700 font-semibold hover:bg-green-50 transition"
            >
              Мой профиль
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
      console.error("Save error:", e);
      setMsg(`❌ ${e.message || "Ошибка при сохранении"}`);
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{test.title}</h1>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Вопрос {currentIndex + 1} из {totalQuestions}</span>
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-8 space-y-6">
        <div className="space-y-4">
          <p className="text-lg font-medium text-gray-800">{question.question}</p>

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

**Что добавилось:**
- ✅ Импорт функций из testsData.js
- ✅ Нормализация testKey (toLowerCase, trim)
- ✅ Проверка авторизации через useEffect
- ✅ 6 экранов состояния (loading, error, auth, completed, start, questions)
- ✅ Прогресс-бар
- ✅ Сохранение в Supabase

---

### 3️⃣ ФАЙЛ: `/src/features/exercises/testsData.js`

**Действие:** СОЗДАЙТЕ НОВЫЙ ФАЙЛ (скопируйте полностью)

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

**Что содержит:**
- ✅ TESTS_DATA с 3 тестами
- ✅ getTestByKey() для получения теста
- ✅ getAvailableTestKeys() для списка доступных
- ✅ isValidTestKey() для валидации

---

## 🗄️ СОЗДАТЬ ТАБЛИЦУ В SUPABASE

**Откройте Supabase SQL Editor и выполните:**

```sql
CREATE TABLE IF NOT EXISTS public.tests_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  test_key VARCHAR(255) NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS tests_log_user_id_idx ON public.tests_log(user_id);
CREATE INDEX IF NOT EXISTS tests_log_test_key_idx ON public.tests_log(test_key);
```

---

## ✅ ПРОВЕРКА (5 МИН)

### 1. Запустить проект
```bash
npm run dev
```

### 2. Открыть тест
```
http://localhost:3000/exercises/uncertainty_tolerance
```

### 3. Проверить что видите
- ✅ Стартовый экран с информацией о тесте
- ✅ Кнопка "Начать тест"

### 4. Пройти тест
- ✅ Выбирайте ответы
- ✅ Видите прогресс-бар
- ✅ На последнем вопросе нажимаете "Завершить"

### 5. Проверить результат
- ✅ Зелёный экран успеха
- ✅ Откройте Supabase, таблица tests_log
- ✅ Видите запись с вашими ответами

---

## 🎉 ГОТОВО!

**Всего 3 файла, 12 минут установки, и всё работает!**

---

## 📚 ПОЛНАЯ ДОКУМЕНТАЦИЯ

Если нужно больше информации:
- [README_TESTS_FIX.md](README_TESTS_FIX.md) — краткое резюме
- [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) — подробная инструкция
- [EXAMPLES_USAGE.md](EXAMPLES_USAGE.md) — примеры кода и SQL
- [00_START_HERE.md](00_START_HERE.md) — навигация по всей документации

---

**Версия:** 1.0
**Статус:** ✅ ГОТОВО К ИСПОЛЬЗОВАНИЮ
**Время внедрения:** 12 мин
