"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/browser";
import Loader from "@/components/Loader";
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
import AnalyticsAIReport from "./_components/AnalyticsAIReport";

const STOPWORDS = new Set([
  "и","в","на","что","это","я","мы","ты","он","она","они","мне","моя","моё","мой","нас","вам","вы",
  "как","когда","где","кто","что-то","тоже","очень","сегодня","вчера","завтра","ещё","еще","без",
  "для","при","по","из","до","над","под","у","о","об","про","же","ли","бы","быть","есть","не","нет",
  "and","the","this","that","with","from","into","about","your","you","for","are","was","were","have",
  "меня","тебя","него","нее","их","там","тут","здесь","сейчас","вообще","просто","пока","кажется",
  "жана","жоқ","үшін","мен","сен","ол","біз","сіз","олар","қазір","өте","бүгін","кеше","ертең"
]);

function toISODate(d) {
  return new Date(d).toISOString().slice(0, 10);
}

function avg(list) {
  if (!list.length) return null;
  return list.reduce((a, b) => a + b, 0) / list.length;
}

function stddev(list) {
  if (!list.length) return null;
  const m = avg(list);
  const v = avg(list.map((x) => (x - m) ** 2));
  return Math.sqrt(v);
}

function buildDailySeries(notes, days) {
  const map = new Map();
  for (const n of notes) {
    const day = toISODate(n.date || n.created_at || new Date());
    if (!map.has(day)) map.set(day, { moods: [], sleeps: [] });
    if (typeof n.mood === "number") map.get(day).moods.push(n.mood);
    if (typeof n.sleep === "number") map.get(day).sleeps.push(n.sleep);
  }
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = toISODate(d);
    const rec = map.get(day);
    out.push({
      date: d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" }),
      mood: rec?.moods?.length ? avg(rec.moods) : null,
      sleep: rec?.sleeps?.length ? avg(rec.sleeps) : null,
      _iso: day,
    });
  }
  return out;
}

function extractKeywords(texts, limit = 6) {
  const counts = new Map();
  for (const t of texts) {
    const words = String(t || "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, " ")
      .split(/\s+/)
      .filter((w) => w && w.length >= 4 && !STOPWORDS.has(w));
    for (const w of words) {
      counts.set(w, (counts.get(w) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

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
  const [notes, setNotes] = useState([]);

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

        const { data: notesData } = await supabase
          .from("notes")
          .select("id, date, mood, sleep, comment, created_at")
          .eq("user_id", authUser.id)
          .order("date", { ascending: false })
          .limit(200);
        if (mounted) setNotes(notesData || []);

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


  const notesStats = useMemo(() => {
    const withMood = notes.filter((n) => typeof n.mood === "number");
    const withSleep = notes.filter((n) => typeof n.sleep === "number");
    const avgMood = avg(withMood.map((n) => n.mood));
    const avgSleep = avg(withSleep.map((n) => n.sleep));
    const moodStd = stddev(withMood.map((n) => n.mood));

    const series30 = buildDailySeries(notes, 30);
    const series14 = buildDailySeries(notes, 14);
    const last7 = series14.slice(7);
    const prev7 = series14.slice(0, 7);

    const avgMoodLast7 = avg(last7.map((d) => d.mood).filter((v) => v != null));
    const avgMoodPrev7 = avg(prev7.map((d) => d.mood).filter((v) => v != null));
    const avgSleepLast7 = avg(last7.map((d) => d.sleep).filter((v) => v != null));
    const avgSleepPrev7 = avg(prev7.map((d) => d.sleep).filter((v) => v != null));

    const comments = notes.filter((n) => n.comment).map((n) => n.comment);
    const topTopics = extractKeywords(comments, 6);

    const positiveTopics = extractKeywords(
      notes.filter((n) => n.comment && typeof n.mood === "number" && n.mood >= 7).map((n) => n.comment),
      4
    );
    const stressTopics = extractKeywords(
      notes.filter((n) => n.comment && typeof n.mood === "number" && n.mood <= 4).map((n) => n.comment),
      4
    );

    let profile = "Not enough data";
    if (withMood.length >= 5) {
      if (avgMood >= 7 && moodStd <= 1.5) profile = "Stable positive state";
      else if (avgMood <= 4) profile = "Difficult period (low tone)";
      else if (moodStd >= 2.5) profile = "Emotional swings";
      else if (avgMood >= 5.5) profile = "Neutral stable state";
      else profile = "Unstable mood";
    }

    const moodDelta = (avgMoodLast7 != null && avgMoodPrev7 != null) ? (avgMoodLast7 - avgMoodPrev7) : null;
    const sleepDelta = (avgSleepLast7 != null && avgSleepPrev7 != null) ? (avgSleepLast7 - avgSleepPrev7) : null;

    let stressSignal = "Not enough data";
    if (moodDelta != null) {
      if (moodDelta <= -1) stressSignal = "Stress likely increasing (mood dropped)";
      else if (moodDelta >= 1) stressSignal = "State improving (mood increased)";
      else stressSignal = "State is stable (no sharp changes)";
    }

    return {
      avgMood,
      avgSleep,
      moodStd,
      series30,
      avgMoodLast7,
      avgMoodPrev7,
      avgSleepLast7,
      avgSleepPrev7,
      moodDelta,
      sleepDelta,
      profile,
      topTopics,
      positiveTopics,
      stressTopics,
      stressSignal,
      totalNotes: notes.length,
    };
  }, [notes]);

  if (loading) {
    return <Loader />;
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
        <h1 className="text-4xl font-bold">Analytics and Emotional Profile</h1>
        <p className="text-gray-600">Mood tracker, topics, emotional profile, and your week</p>
      </div>

      <AnalyticsAIReport />

      {notesStats.totalNotes === 0 ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-center">
          <p className="text-amber-800 font-semibold">No mood entries yet</p>
          <p className="text-amber-700 text-sm mt-2">Add your first journal entry to see analytics.</p>
          <Link
            href="/notes"
            className="inline-block mt-3 px-4 py-2 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition"
          >
            Go to journal {'>'}
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-violet-50 to-white p-6">
              <p className="text-sm text-gray-600 font-semibold">Emotional profile</p>
              <p className="text-xl font-bold text-violet-700 mt-2">{notesStats.profile}</p>
              <p className="text-xs text-gray-500 mt-2">Based on mood and sleep entries</p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-blue-50 to-white p-6">
              <p className="text-sm text-gray-600 font-semibold">Average mood</p>
              <p className="text-2xl font-bold text-blue-700 mt-2">
                {notesStats.avgMood != null ? notesStats.avgMood.toFixed(1) : "?"}/10
              </p>
              <p className="text-xs text-gray-500 mt-2">Total entries: {notesStats.totalNotes}</p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-emerald-50 to-white p-6">
              <p className="text-sm text-gray-600 font-semibold">Average sleep</p>
              <p className="text-2xl font-bold text-emerald-700 mt-2">
                {notesStats.avgSleep != null ? `${Math.round(notesStats.avgSleep / 60)}h` : "?"}
              </p>
              <p className="text-xs text-gray-500 mt-2">{notesStats.stressSignal}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6">
            <h3 className="text-xl font-semibold mb-4">My week</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Mood (7 days)</p>
                <p className="text-lg font-semibold">
                  {notesStats.avgMoodLast7 != null ? notesStats.avgMoodLast7.toFixed(1) : "?"}
                  {notesStats.moodDelta != null && (
                    <span className={`ml-2 text-xs ${notesStats.moodDelta >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {notesStats.moodDelta >= 0 ? "?" : "?"} {Math.abs(notesStats.moodDelta).toFixed(1)}
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">Compared to previous week</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Sleep (7 days)</p>
                <p className="text-lg font-semibold">
                  {notesStats.avgSleepLast7 != null ? `${Math.round(notesStats.avgSleepLast7 / 60)}h` : "?"}
                  {notesStats.sleepDelta != null && (
                    <span className={`ml-2 text-xs ${notesStats.sleepDelta >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {notesStats.sleepDelta >= 0 ? "?" : "?"} {Math.abs(notesStats.sleepDelta / 60).toFixed(1)}h
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">Compared to previous week</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Weekly summary</p>
                <p className="text-sm text-gray-700 mt-1">{notesStats.stressSignal}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Mood tracker (30 days)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={notesStats.series30}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="mood" stroke="#8B5CF6" strokeWidth={2} name="Mood" />
                <Line type="monotone" dataKey="sleep" stroke="#10B981" strokeWidth={2} name="Sleep (min)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur-xl p-6">
              <h4 className="font-semibold mb-3">Most frequent topics</h4>
              {notesStats.topTopics.length ? (
                <div className="flex flex-wrap gap-2">
                  {notesStats.topTopics.map((t) => (
                    <span key={t.word} className="px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs">
                      {t.word} ? {t.count}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No text notes yet.</p>
              )}
            </div>
            <div className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur-xl p-6">
              <h4 className="font-semibold mb-3">When stress rises</h4>
              {notesStats.stressTopics.length ? (
                <div className="flex flex-wrap gap-2">
                  {notesStats.stressTopics.map((t) => (
                    <span key={t.word} className="px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs">
                      {t.word} ? {t.count}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Not enough low mood data.</p>
              )}
            </div>
            <div className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur-xl p-6">
              <h4 className="font-semibold mb-3">What helps</h4>
              {notesStats.positiveTopics.length ? (
                <div className="flex flex-wrap gap-2">
                  {notesStats.positiveTopics.map((t) => (
                    <span key={t.word} className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs">
                      {t.word} ? {t.count}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Not enough positive mood data.</p>
              )}
            </div>
          </div>
        </>
      )}
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
