"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function GeneratedTestRunner({ recommendationId }) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingRec, setLoadingRec] = useState(true);
  const [test, setTest] = useState(null);
  const [rationale, setRationale] = useState("");
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
      if (!recommendationId) {
        setLoadingRec(false);
        return;
      }
      const res = await fetch(`/api/tests/recommendation/${recommendationId}`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.recommendation?.generatedTest) {
        setTest(data.recommendation.generatedTest);
        setRationale(data.recommendation.rationale || "");
      }
      setLoadingRec(false);
    })();
  }, [supabase, recommendationId]);

  const calculateTestResult = (testData, answersObj) => {
    if (testData?.scoring?.method !== "sum") return null;
    const { ranges } = testData.scoring;
    let totalScore = 0;
    Object.keys(answersObj).forEach((questionIndex) => {
      const answer = answersObj[questionIndex];
      const question = testData.questions[questionIndex];
      const answerIndex = question.options.indexOf(answer);
      if (answerIndex >= 0) totalScore += answerIndex;
    });
    const result = ranges?.find((r) => totalScore >= r.min && totalScore <= r.max);
    return {
      score: totalScore,
      maxScore: testData.questions.length * (testData.questions[0]?.options?.length - 1 || 3),
      ...result,
    };
  };

  const totalQuestions = test?.questions?.length || 0;
  const isLastQuestion = currentIndex + 1 >= totalQuestions;

  async function handleNext() {
    if (answers[currentIndex] == null) return;
    if (!isLastQuestion) {
      setCurrentIndex(currentIndex + 1);
      return;
    }

    setLoading(true);
    try {
      const result = calculateTestResult(test, answers);
      setTestResult(result);

      const testKey = `ai_generated_${recommendationId?.slice(0, 8) || "custom"}`;

      const { error } = await supabase.from("tests_log").insert({
        user_id: user.id,
        test_key: testKey,
        answers,
        result: result
          ? { score: result.score, level: result.level, color: result.color }
          : { level: "completed" },
      });

      if (error) throw error;

      await fetch(`/api/tests/recommendation/${recommendationId}/complete`, {
        method: "POST",
        credentials: "include",
      });
      setCompleted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loadingRec) {
    return <div className="mx-auto max-w-2xl p-6 text-center">Загрузка теста…</div>;
  }

  if (!test) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-red-700">Тест не найден или уже пройден.</p>
        <Link href="/exercises" className="text-teal-600 underline mt-2 inline-block">
          Назад
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Link href={`/auth/sign-in?next=/exercises/r/${recommendationId}`}>Войти</Link>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="mx-auto max-w-2xl p-6 space-y-4">
        <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
        <h2 className="text-xl font-bold text-center">Тест завершён</h2>
        {testResult && (
          <p className="text-center text-slate-600">
            Результат: {testResult.level} ({testResult.score}/{testResult.maxScore})
          </p>
        )}
        <Link href="/chat" className="block text-center text-teal-600 font-semibold">
          Вернуться в чат
        </Link>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="mx-auto max-w-2xl p-6 space-y-4">
        <button type="button" onClick={() => router.push("/exercises")} className="flex items-center gap-2 text-slate-600">
          <ArrowLeft className="h-4 w-4" /> Назад
        </button>
        <h1 className="text-2xl font-bold">{test.title}</h1>
        {rationale && <p className="text-sm text-teal-800 bg-teal-50 p-3 rounded-xl">{rationale}</p>}
        <p className="text-slate-600">{test.description}</p>
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="w-full rounded-xl bg-teal-600 py-3 text-white font-semibold"
        >
          Начать
        </button>
      </div>
    );
  }

  const q = test.questions[currentIndex];

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-4">
      <p className="text-sm text-slate-500">
        Вопрос {currentIndex + 1} из {totalQuestions}
      </p>
      <h2 className="text-lg font-semibold">{q.question}</h2>
      <div className="space-y-2">
        {q.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setAnswers({ ...answers, [currentIndex]: opt })}
            className={`w-full text-left rounded-xl border px-4 py-3 ${
              answers[currentIndex] === opt
                ? "border-teal-500 bg-teal-50"
                : "border-slate-200 bg-white"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={loading}
        onClick={handleNext}
        className="w-full rounded-xl bg-teal-600 py-3 text-white font-semibold disabled:opacity-50"
      >
        {isLastQuestion ? "Завершить" : "Далее"}
      </button>
    </div>
  );
}
