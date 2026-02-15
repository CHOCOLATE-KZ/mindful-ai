"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { TESTS_DATA, getTestByKey, isValidTestKey, getAvailableTestKeys } from "@/features/exercises/testsData";

export default function TestRunner({ testKey: rawTestKey }) {
  const supabase = useMemo(() => supabaseBrowser(), []);

  // Валидируем и нормализуем testKey
  const testKey = rawTestKey ? rawTestKey.toLowerCase().trim() : null;
  const test = testKey ? getTestByKey(testKey) : null;

  // Состояние для пользователя
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // Состояние теста
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info"); // "info", "error", "success"
  const [completed, setCompleted] = useState(false);

  // Получить пользователя при загрузке
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

  // Тест не найден
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

  // Пользователь не авторизован
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

  // Тест завершен
  if (completed) {
    return (
      <div className="mx-auto max-w-2xl p-6 space-y-4">
        <div className="rounded-2xl border border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 p-6 text-center">
          <h2 className="text-3xl font-bold text-green-700">✅ Тест завершён!</h2>
          <p className="text-green-600 text-sm mt-3">
            Ваши ответы сохранены! Вы можете просмотреть аналитику и статистику в разделе &laquo;Аналитика&raquo;.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/analytics"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:opacity-90 transition"
            >
              📊 Посмотреть аналитику
            </Link>
            <Link
              href="/exercises"
              className="px-4 py-2 rounded-xl border border-green-400 text-green-700 font-semibold hover:bg-green-50 transition"
            >
              ← Другой тест
            </Link>
            <Link
              href="/profile"
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
            >
              Профиль
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Начало теста (стартовый экран)
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

  // Прохождение теста
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

    // Завершение теста: сохранить в Supabase
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
      {/* Заголовок и прогресс */}
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
