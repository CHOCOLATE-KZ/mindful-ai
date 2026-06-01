"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { getTestByKeyFromJSON, getAvailableTestKeysFromJSON } from "@/lib/loadTestsAndExercises";
import { ArrowLeft, X, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";

export default function TestRunner({ testKey: rawTestKey }) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const recommendationId = searchParams?.get("rec") || null;

  // Валидируем и нормализуем testKey
  const testKey = rawTestKey ? rawTestKey.toLowerCase().trim() : null;
  const test = testKey ? getTestByKeyFromJSON(testKey) : null;

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
  const [testResult, setTestResult] = useState(null); // Результат теста с баллами и интерпретацией
  
  // Состояние для модального окна подтверждения выхода
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Функция расчета результата теста
  const calculateTestResult = (testData, answersObj) => {
    if (!testData.scoring) {
      return null; // Нет системы scoring - будем использовать AI
    }

    const { method, ranges } = testData.scoring;
    
    if (method === "sum") {
      // Подсчитываем сумму баллов (индекс ответа = баллы)
      let totalScore = 0;
      Object.keys(answersObj).forEach((questionIndex) => {
        const answer = answersObj[questionIndex];
        const question = testData.questions[questionIndex];
        const answerIndex = question.options.indexOf(answer);
        totalScore += answerIndex;
      });

      // Находим подходящий диапазон
      const result = ranges.find(
        (range) => totalScore >= range.min && totalScore <= range.max
      );

      return {
        score: totalScore,
        maxScore: testData.questions.length * (testData.questions[0].options.length - 1),
        ...result,
      };
    }

    return null;
  };

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

  // Обработчик клика на кнопку "Назад"
  const handleBackClick = () => {
    // Если тест начат и есть хотя бы один ответ, показываем подтверждение
    const hasAnswers = Object.keys(answers).length > 0;
    if (started && hasAnswers) {
      setShowExitConfirm(true);
    } else {
      // Иначе просто возвращаемся
      router.push("/exercises");
    }
  };

  // Подтверждение выхода из теста
  const confirmExit = () => {
    router.push("/exercises");
  };

  // Отмена выхода
  const cancelExit = () => {
    setShowExitConfirm(false);
  };

  if (userLoading) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!test) {
    const availableKeys = getAvailableTestKeysFromJSON();
    return (
      <div className="mx-auto max-w-2xl p-6 space-y-4">
        <div className="rounded-2xl border border-red-300 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-800"> Тест не найден</h2>
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
          <h2 className="text-lg font-semibold text-yellow-800"> Требуется вход</h2>
          <p className="text-yellow-700 text-sm mt-2">
            Чтобы пройти тест и сохранить результаты, пожалуйста, войдите в аккаунт.
          </p>
        </div>
        <Link
          href={`/auth/sign-in?next=/exercises/${testKey}`}
          className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:opacity-90 transition"
        >
          Войти в аккаунт
        </Link>
      </div>
    );
  }

  // Тест завершен
  if (completed) {
    // Определяем цвет на основе результата
    const getColorClasses = (color) => {
      const colorMap = {
        green: {
          border: "border-green-300",
          bg: "bg-green-50",
          text: "text-green-800",
          badge: "bg-green-100 text-green-800",
        },
        yellow: {
          border: "border-yellow-300",
          bg: "bg-yellow-50",
          text: "text-yellow-800",
          badge: "bg-yellow-100 text-yellow-800",
        },
        orange: {
          border: "border-orange-300",
          bg: "bg-orange-50",
          text: "text-orange-800",
          badge: "bg-orange-100 text-orange-800",
        },
        red: {
          border: "border-red-300",
          bg: "bg-red-50",
          text: "text-red-800",
          badge: "bg-red-100 text-red-800",
        },
      };
      return colorMap[color] || colorMap.green;
    };

    return (
      <div className="mx-auto max-w-3xl p-3 space-y-3 mt-15">
        {/* Результаты с scoring */}
        {testResult ? (
          <>
            {/* Заголовок результата */}
            <div className={`rounded-3xl border ${getColorClasses(testResult.color).border} ${getColorClasses(testResult.color).bg} p-4 space-y-3`}>
              <div className="text-center space-y-1.5">
                <CheckCircle2 size={40} className={`mx-auto ${getColorClasses(testResult.color).text}`} />
                <h2 className="text-xl font-bold text-gray-900">Тест завершён!</h2>
                <p className="text-xs text-gray-600">Вот ваши результаты:</p>
              </div>

              {/* Баллы */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 text-center space-y-1">
                <div className="text-3xl font-bold text-gray-900">
                  {testResult.score}
                  <span className="text-lg text-gray-500">/{testResult.maxScore}</span>
                </div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getColorClasses(testResult.color).badge}`}>
                  {testResult.level}
                </div>
              </div>

              {/* Описание */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 space-y-2">
                <p className="text-xs text-gray-800 leading-relaxed">
                  {testResult.description}
                </p>

                {/* Рекомендации */}
                {testResult.recommendations && testResult.recommendations.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                      <TrendingUp size={14} />
                      Рекомендации:
                    </h3>
                    <ul className="space-y-1">
                      {testResult.recommendations.slice(0, 3).map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-700">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span className="leading-tight">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Научная основа и дисклеймер - свернуто */}
              {(test.scientificBasis || test.disclaimer) && (
                <details className="text-xs text-gray-600">
                  <summary className="cursor-pointer font-medium text-gray-700">Подробнее</summary>
                  <div className="space-y-1 pt-2">
                    {test.scientificBasis && (
                      <p className="italic"> {test.scientificBasis}</p>
                    )}
                    {test.disclaimer && (
                      <p className="text-gray-500"> {test.disclaimer}</p>
                    )}
                  </div>
                </details>
              )}
            </div>

            {/* Кнопки действий */}
            <div className="flex flex-col gap-2">
              <Link
                href="/analytics"
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:opacity-90 transition"
              >
                <Sparkles size={16} />
                Получить AI-анализ
              </Link>
              <div className="flex gap-2">
                <Link
                  href="/exercises"
                  className="flex-1 px-3 py-1.5 rounded-xl border-2 border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition text-center"
                >
                  ← Другой тест
                </Link>
                <Link
                  href="/analytics"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition text-center"
                >
                   Аналитика
                </Link>
              </div>
            </div>
          </>
        ) : (
          /* Результаты без scoring - нужен AI анализ */
          <>
            <div className="rounded-3xl border border-blue-300 bg-blue-50 p-4 text-center space-y-3">
              <CheckCircle2 size={40} className="mx-auto text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900"> Тест завершён!</h2>
              <p className="text-gray-700 text-xs">
                Ваши ответы сохранены. Для получения персональной интерпретации используйте AI-анализ.
              </p>

              <div className="bg-blue-100/50 backdrop-blur-sm rounded-2xl p-3 space-y-1.5">
                <p className="text-xs text-gray-700">
                   AI проанализирует ваши ответы и даст персональные рекомендации.
                </p>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex flex-col gap-2">
              <Link
                href="/analytics"
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:opacity-90 transition"
              >
                <Sparkles size={16} />
                Получить AI-анализ
              </Link>
              <div className="flex gap-2">
                <Link
                  href="/exercises"
                  className="flex-1 px-3 py-1.5 rounded-xl border-2 border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition text-center"
                >
                  ← Другой тест
                </Link>
                <Link
                  href="/analytics"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition text-center"
                >
                   Аналитика
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Начало теста (стартовый экран)
  if (!started) {
    return (
      <div className="mx-auto max-w-2xl p-6 space-y-6">
        {/* Кнопка "Назад" */}
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft size={20} />
          <span>Назад к упражнениям</span>
        </button>

        <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-8 space-y-4">
          <h1 className="text-3xl font-bold">{test.title}</h1>
          <p className="text-gray-700">{test.description}</p>
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
            <p className="font-semibold mb-1"> Всего вопросов: {test.questions.length}</p>
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
          className="w-full px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:opacity-90 transition"
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
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  async function handleNext() {
    if (answers[currentIndex] == null) {
      setMsg(" Пожалуйста, выберите ответ");
      setMsgType("info");
      return;
    }

    if (!isLastQuestion) {
      setCurrentIndex(currentIndex + 1);
      setMsg("");
      return;
    }

    // Завершение теста: рассчитать результат и сохранить в Supabase
    setLoading(true);
    setMsg("");
    try {
      // Рассчитываем результат если есть scoring
      const result = calculateTestResult(test, answers);
      setTestResult(result);

      const { error } = await supabase.from("tests_log").insert({
        user_id: user.id,
        test_key: testKey,
        answers,
        result: result ? {
          score: result.score,
          level: result.level,
          color: result.color,
        } : null,
      });

      if (error) {
        throw new Error(error.message || "Ошибка при сохранении результатов");
      }

      if (recommendationId) {
        try {
          await fetch(`/api/tests/recommendation/${recommendationId}/complete`, {
            method: "POST",
            credentials: "include",
          });
        } catch (e) {
          console.warn("recommendation complete:", e);
        }
      }

      setMsgType("success");
      setCompleted(true);
    } catch (e) {
      console.error("Save error:", e);
      setMsg(` ${e.message || "Ошибка при сохранении"}`);
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 space-y-6">
      {/* Кнопка "Назад" */}
      <button
        onClick={handleBackClick}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
      >
        <ArrowLeft size={20} />
        <span>Назад к упражнениям</span>
      </button>

      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">{test.title}</h1>
        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 md:p-6 space-y-5 shadow-[0_8px_32px_rgba(15,23,42,0.06)]">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">
              Question #{currentIndex + 1}
            </p>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight text-slate-800">
              {question.question}
            </h2>
          </div>

          <div className="space-y-3 pt-2">
            {question.options.map((opt, idx) => {
              const isSelected = answers[currentIndex] === opt;
              const optionLetter = String.fromCharCode(65 + idx);

              return (
                <button
                  key={opt}
                  onClick={() => {
                    setAnswers((prev) => ({ ...prev, [currentIndex]: opt }));
                    setMsg("");
                  }}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition flex items-center gap-3 ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50 text-slate-900"
                      : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                  }`}
                >
                  <span
                    className={`h-9 w-9 rounded-md border flex items-center justify-center font-semibold ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-100 text-emerald-700"
                        : "border-slate-200 bg-slate-50 text-slate-500"
                    }`}
                  >
                    {optionLetter}
                  </span>
                  <span className="flex-1 font-medium">{opt}</span>
                  {isSelected && <CheckCircle2 size={18} className="text-emerald-600" />}
                </button>
              );
            })}
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
            className="w-full md:w-auto min-w-[220px] px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition"
          >
            {loading ? "Сохраняю..." : isLastQuestion ? "Завершить тест" : "Submit Answer"}
          </button>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between px-1 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">Quiz Questions List</h3>
              <span className="text-xs text-slate-400">{Object.keys(answers).length}/{totalQuestions}</span>
            </div>
            <div className="mt-3 space-y-2 max-h-[380px] overflow-auto pr-1">
              {test.questions.map((_, idx) => {
                const answered = answers[idx] != null;
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={`question-nav-${idx}`}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-full px-3 py-2 rounded-lg text-left text-sm transition flex items-center justify-between ${
                      isCurrent
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : answered
                          ? "bg-slate-50 text-slate-700 border border-slate-200"
                          : "bg-slate-100/60 text-slate-400 border border-slate-100"
                    }`}
                  >
                    <span>Quiz question {idx + 1}</span>
                    {answered && <CheckCircle2 size={14} className="text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* Модальное окно подтверждения выхода */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900"> Выйти из теста?</h3>
                <p className="text-gray-600 text-sm">
                  Вы уверены, что хотите выйти? Весь ваш прогресс будет потерян, и ответы не сохранятся.
                </p>
              </div>
              <button
                onClick={cancelExit}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={cancelExit}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Продолжить тест
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
              >
                Да, выйти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
