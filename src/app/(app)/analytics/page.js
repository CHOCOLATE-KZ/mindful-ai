"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/browser";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const COLORS = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"];
const TEST_NAMES = {
  uncertainty_tolerance: "Умение выдерживать неопределённость",
  manipulation_test: "Восприимчивость к манипуляции",
  money_attitude: "Отношение к деньгам",
};

export default function AnalyticsPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);

  // Получаем пользователя и его результаты тестов
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          setLoading(false);
          return;
        }

        setUser(authUser);

        // Получаем все результаты тестов пользователя
        const { data, error } = await supabase
          .from("tests_log")
          .select("id, test_key, answers, created_at")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false });

        if (!error && mounted && data) {
          setTestResults(data);
          // Выбираем первый тест по умолчанию
          if (data.length > 0) {
            setSelectedTest(data[0].test_key);
          }
        }
      } catch (e) {
        console.error("Failed to load test results:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [supabase]);

  // 📊 Аналитика по выбранному тесту
  const testAnalytics = useMemo(() => {
    if (!selectedTest) return null;

    const filtered = testResults.filter((r) => r.test_key === selectedTest);
    if (filtered.length === 0) return null;

    // Подсчитываем количество прохождений в день
    const dailyStats = {};
    filtered.forEach((result) => {
      const date = new Date(result.created_at).toLocaleDateString("ru-RU");
      dailyStats[date] = (dailyStats[date] || 0) + 1;
    });

    const dailyChart = Object.entries(dailyStats)
      .map(([date, count]) => ({ date, attempts: count }))
      .reverse();

    // Анализируем ответы (какие вариант выбирают чаще)
    const answerStats = {};
    filtered.forEach((result) => {
      Object.entries(result.answers || {}).forEach(([questionIdx, answer]) => {
        const key = `Q${questionIdx}: ${answer}`;
        answerStats[key] = (answerStats[key] || 0) + 1;
      });
    });

    return {
      totalAttempts: filtered.length,
      dailyChart,
      answerStats: Object.entries(answerStats)
        .map(([answer, count]) => ({ answer, count }))
        .sort((a, b) => b.count - a.count),
      lastAttempt: filtered[0].created_at,
    };
  }, [selectedTest, testResults]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6 text-center">
        <p className="text-gray-600">Загрузка аналитики...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-6xl p-6 space-y-4">
        <div className="rounded-2xl border border-yellow-300 bg-yellow-50 p-6">
          <h2 className="text-lg font-semibold text-yellow-800">🔐 Требуется вход</h2>
          <p className="text-yellow-700 text-sm mt-2">
            Пожалуйста, войдите в аккаунт для просмотра аналитики.
          </p>
        </div>
        <Link
          href="/auth/sign-in"
          className="inline-block px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
        >
          Войти
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      {/* Заголовок */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">📊 Аналитика тестов</h1>
        <p className="text-gray-600">Анализ ваших результатов тестирования</p>
      </div>

      {testResults.length === 0 ? (
        <div className="rounded-2xl border border-blue-300 bg-blue-50 p-8 text-center">
          <p className="text-blue-800 font-semibold mb-4">
            У вас ещё нет результатов тестов
          </p>
          <Link
            href="/exercises"
            className="inline-block px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
          >
            Пройти первый тест →
          </Link>
        </div>
      ) : (
        <>
          {/* Выбор теста */}
          <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold">Выберите тест для анализа</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...new Set(testResults.map((r) => r.test_key))].map((testKey) => {
                const count = testResults.filter((r) => r.test_key === testKey).length;
                return (
                  <button
                    key={testKey}
                    onClick={() => setSelectedTest(testKey)}
                    className={`p-4 rounded-xl border-2 font-medium text-left transition ${
                      selectedTest === testKey
                        ? "border-purple-500 bg-purple-50 text-purple-900"
                        : "border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-semibold">{TEST_NAMES[testKey]}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {count} попыток{count % 10 === 1 && count !== 11 ? "а" : ""}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Основная аналитика */}
          {testAnalytics && selectedTest && (
            <div className="space-y-8">
              {/* Общая статистика */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-purple-50 to-blue-50 p-6">
                  <p className="text-gray-600 text-sm font-semibold">Всего попыток</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {testAnalytics.totalAttempts}
                  </p>
                </div>

                <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-green-50 to-emerald-50 p-6">
                  <p className="text-gray-600 text-sm font-semibold">Последняя попытка</p>
                  <p className="text-lg font-semibold text-green-700 mt-2">
                    {new Date(testAnalytics.lastAttempt).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
                  <p className="text-gray-600 text-sm font-semibold">Название теста</p>
                  <p className="text-lg font-semibold text-blue-700 mt-2">
                    {TEST_NAMES[selectedTest]}
                  </p>
                </div>
              </div>

              {/* График попыток по дням */}
              <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6">
                <h3 className="text-xl font-semibold mb-6">📈 Активность по дням</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={testAnalytics.dailyChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="attempts"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      dot={{ fill: "#8B5CF6", r: 5 }}
                      name="Попыток"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Популярные ответы */}
              <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6">
                <h3 className="text-xl font-semibold mb-6">🎯 Выбранные ответы (топ 10)</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={testAnalytics.answerStats.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="answer"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8B5CF6" name="Количество" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Распределение ответов (круговая диаграмма) */}
              {testAnalytics.answerStats.length > 0 && (
                <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6">
                  <h3 className="text-xl font-semibold mb-6">
                    📊 Распределение ответов (все {testAnalytics.answerStats.length} вариантов)
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={testAnalytics.answerStats}
                        dataKey="count"
                        nameKey="answer"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label
                      >
                        {testAnalytics.answerStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* История всех попыток */}
              <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6">
                <h3 className="text-xl font-semibold mb-6">📝 История попыток</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {testResults
                    .filter((r) => r.test_key === selectedTest)
                    .map((result, idx) => (
                      <div
                        key={result.id}
                        className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-gray-800">
                            Попытка #{testResults.filter((r) => r.test_key === selectedTest).length - idx}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(result.created_at).toLocaleDateString("ru-RU", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Ответы:{" "}
                          {Object.entries(result.answers || {})
                            .map(([q, a]) => `В${parseInt(q) + 1}: ${a}`)
                            .join(" | ")}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Кнопка возврата */}
      <div className="flex gap-3">
        <Link
          href="/exercises"
          className="inline-block px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
        >
          ← Вернуться к тестам
        </Link>
        <Link
          href="/profile"
          className="inline-block px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
        >
          Мой профиль
        </Link>
      </div>
    </div>
  );
}
