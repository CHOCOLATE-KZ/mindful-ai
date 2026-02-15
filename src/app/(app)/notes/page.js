"use client";

import { useEffect, useState, useMemo } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Button from "@/components/ui/Button";
import NotesAIAnalysis from "./_components/NotesAIAnalysis";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function NotesPage() {
  const supabase = supabaseBrowser();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mood, setMood] = useState("");
  const [sleep, setSleep] = useState("");
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [quickNote, setQuickNote] = useState("");

  // 🔹 Получаем заметки пользователя
  useEffect(() => {
    let mounted = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setNotes([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("notes")
        .select("id, date, mood, sleep, comment")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(200);

      if (!error && mounted) setNotes(data || []);
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔹 Добавление / редактирование заметки
  async function saveNote(e) {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return alert("Пожалуйста, войдите в аккаунт");

    const payload = {
      user_id: user.id,
      mood: mood ? Number(mood) : null,
      sleep: sleep ? Number(sleep) : null,
      comment: comment || null,
    };

    let response;
    if (editingId) {
      response = await supabase
        .from("notes")
        .update(payload)
        .eq("id", editingId)
        .select("id, date, mood, sleep, comment");
    } else {
      response = await supabase
        .from("notes")
        .insert(payload)
        .select("id, date, mood, sleep, comment");
    }

    const { data, error } = response;
    if (error) return alert(error.message);

    if (editingId) {
      setNotes((s) => s.map((n) => (n.id === editingId ? data[0] : n)));
      setEditingId(null);
    } else {
      setNotes((s) => [data[0], ...s]);
    }

    setMood("");
    setSleep("");
    setComment("");
  }

  // 🔹 Удаление заметки
  async function removeNote(id) {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) return alert(error.message);
    setNotes((s) => s.filter((n) => n.id !== id));
  }

  // 🔹 Начало редактирования
  function editNote(n) {
    setMood(n.mood ?? "");
    setSleep(n.sleep ?? "");
    setComment(n.comment ?? "");
    setEditingId(n.id);
  }

  function resetEditor() {
    setEditingId(null);
    setMood("");
    setSleep("");
    setComment("");
  }

  // 🔹 Мини-заметки
  async function addQuickNote() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return alert("Войдите в аккаунт");
    if (!quickNote.trim()) return;

    const { data, error } = await supabase
      .from("notes")
      .insert({ user_id: user.id, comment: quickNote })
      .select("id, date, mood, sleep, comment");

    if (error) return alert(error.message);
    setNotes((s) => [data[0], ...s]);
    setQuickNote("");
  }

  // 🔹 Разделение заметок на полные и мини
  const fullNotes = useMemo(
    () => notes.filter((n) => n.mood != null || n.sleep != null),
    [notes]
  );
  const quickNotes = useMemo(
    () => notes.filter((n) => n.mood == null && n.sleep == null && n.comment),
    [notes]
  );

  // 🔹 Данные для аналитики
  const chartData = useMemo(() => {
    return fullNotes
      .map((n) => ({
        date: format(new Date(n.date), "dd MMM", { locale: ru }),
        mood: n.mood,
        sleep: n.sleep,
      }))
      .reverse();
  }, [fullNotes]);

  const avgMood = useMemo(() => {
    const moodNotes = fullNotes.filter((n) => n.mood != null);
    if (!moodNotes.length) return 0;
    return (
      moodNotes.reduce((sum, n) => sum + n.mood, 0) / moodNotes.length
    ).toFixed(1);
  }, [fullNotes]);

  const avgSleep = useMemo(() => {
    const sleepNotes = fullNotes.filter((n) => n.sleep != null);
    if (!sleepNotes.length) return 0;
    return Math.round(
      sleepNotes.reduce((sum, n) => sum + n.sleep, 0) / sleepNotes.length
    );
  }, [fullNotes]);

  // eslint-disable-next-line no-unused-vars
  const aiAnalysisData = useMemo(() => {
    return notes
      .filter((n) => n.comment)
      .map((n) => ({
        id: n.id,
        date: n.date,
        comment: n.comment,
        mood: n.mood,
        sleep: n.sleep,
        formattedDate: format(new Date(n.date), "dd MMM yyyy HH:mm", {
          locale: ru,
        }),
      }));
  }, [notes]);

  if (loading) {
    return (
      <div className="py-12">
        <div className="mx-auto max-w-5xl px-4">
          <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
            <div className="h-4 w-44 rounded bg-black/[0.06] animate-pulse" />
            <div className="mt-4 h-3 w-80 rounded bg-black/[0.06] animate-pulse" />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="h-80 rounded-3xl bg-black/[0.04] animate-pulse" />
              <div className="h-80 rounded-3xl bg-black/[0.04] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* ====== HEADER ====== */}
      <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white via-white to-blue-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-sm text-black/60">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Дневник заметок
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-black">
              Настроение, сон и мысли
            </h1>
            <p className="mt-2 text-sm text-black/60 max-w-2xl">
              Записывайте состояние дня и смотрите динамику. **Сон — в минутах**
              (например, 420 = 7 часов).
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
              <div className="text-xs text-black/50">Среднее настроение</div>
              <div className="mt-1 text-lg font-semibold text-black">
                <span className="text-violet-600">{avgMood}</span>
                <span className="text-black/40">/10</span>
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
              <div className="text-xs text-black/50">Средний сон</div>
              <div className="mt-1 text-lg font-semibold text-black">
                <span className="text-emerald-600">
                  {Math.round(avgSleep / 60)}
                </span>
                <span className="text-black/40">ч </span>
                <span className="text-emerald-600">{avgSleep % 60}</span>
                <span className="text-black/40">м</span>
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
              <div className="text-xs text-black/50">Записей</div>
              <div className="mt-1 text-lg font-semibold text-black">
                {fullNotes.length}
                <span className="text-black/40"> + </span>
                {quickNotes.length}
              </div>
              <div className="text-[11px] text-black/45">полные + мини</div>
            </div>
          </div>
        </div>
      </div>

      {/* ====== GRID: только 2 карточки ====== */}
      <div className="grid gap-6 md:grid-cols-2 items-start">
        {/* ===== LEFT: FORM ===== */}
        <Card className="relative overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-purple-100 via-white to-blue-100 blur-3xl opacity-60" />

          <div className="relative p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-black">
                  {editingId ? "Редактировать запись" : "Новая запись"}
                </h2>
                <p className="mt-1 text-sm text-black/60">
                  Заполните настроение и сон (по желанию) и добавьте комментарий.
                </p>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetEditor}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-black/60 hover:bg-black/[0.03] transition"
                >
                  Сбросить
                </button>
              )}
            </div>

            <form onSubmit={saveNote} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>Настроение (1–10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                  />
                  <div className="text-xs text-black/45">
                    **Совет:** оценивай по самочувствию, не по событиям.
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label>Сон (минуты)</Label>
                  <Input
                    type="number"
                    value={sleep}
                    onChange={(e) => setSleep(e.target.value)}
                  />
                  <div className="text-xs text-black/45">Например: 420 = 7 часов.</div>
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label>Комментарий</Label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[15px] text-black/80 outline-none
                             focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition"
                  placeholder="Как прошёл день? Что было важного?"
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button className="w-full sm:w-auto">
                  {editingId ? "Сохранить изменения" : "Сохранить"}
                </Button>
                <div className="text-xs text-black/45">
                  Сохранение обновит историю и график.
                </div>
              </div>
            </form>

            {/* ===== MINI NOTES ===== */}
            <div className="mt-7 rounded-3xl border border-black/10 bg-white/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-black">Мини-заметки</h3>
                  <p className="mt-1 text-sm text-black/60">
                    Быстро записать мысль без настроения и сна.
                  </p>
                </div>
                <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-black/50">
                  {quickNotes.length} шт.
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Input
                  placeholder="Быстрая мысль…"
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                />
                <Button
                  type="button"
                  onClick={addQuickNote}
                  className="w-full sm:w-auto"
                >
                  Добавить
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* ===== RIGHT: HISTORY + CHART ===== */}
        <Card className="rounded-3xl border border-black/10 bg-white shadow-sm md:sticky md:top-6">
          <div className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-black">История и аналитика</h2>
                <p className="mt-1 text-sm text-black/60">
                  Полные записи и мини-заметки. Ниже — динамика по дням.
                </p>
              </div>

              <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-black/50">
                Всего: {notes.length}
              </span>
            </div>

            {notes.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-black/10 bg-black/[0.02] p-6 text-black/60">
                Пока нет записей. Добавьте первую запись слева.
              </div>
            ) : (
              <>
                {/* FULL NOTES */}
                {fullNotes.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-black/70">📊 Полные записи</h3>
                      <span className="text-xs text-black/45">{fullNotes.length} шт.</span>
                    </div>

                    <ul className="mt-3 space-y-3 max-h-[190px] overflow-y-auto pr-2">
                      {fullNotes.map((n) => (
                        <li
                          key={n.id}
                          className="group rounded-3xl border border-black/10 bg-gradient-to-br from-violet-50 to-white p-4 transition hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-xs text-black/45">
                                {format(new Date(n.date), "dd MMM yyyy", { locale: ru })}
                              </div>

                              {n.comment && (
                                <div className="mt-1 text-sm text-black/75 break-words">
                                  {n.comment}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <div className="flex gap-1 text-xs whitespace-nowrap">
                                {n.mood != null && (
                                  <span className="rounded-full bg-violet-100 text-violet-700 px-2.5 py-1">
                                    😊 {n.mood}/10
                                  </span>
                                )}
                                {n.sleep != null && (
                                  <span className="rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-1">
                                    🛌 {Math.round(n.sleep / 60)}ч
                                  </span>
                                )}
                              </div>

                              <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                                <button
                                  type="button"
                                  onClick={() => editNote(n)}
                                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 transition"
                                >
                                  Редактировать
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeNote(n.id)}
                                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-red-600 hover:bg-red-50 transition"
                                >
                                  Удалить
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* QUICK NOTES */}
                {quickNotes.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-black/70">💬 Мини-заметки</h3>
                      <span className="text-xs text-black/45">{quickNotes.length} шт.</span>
                    </div>

                    <div className="mt-3 grid gap-2 max-h-[170px] overflow-y-auto pr-2">
                      {quickNotes.map((n) => (
                        <div
                          key={n.id}
                          className="group rounded-2xl border border-black/10 bg-gradient-to-br from-blue-50 to-white p-3 transition hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-black/75 break-words">{n.comment}</p>

                            <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                              <button
                                type="button"
                                onClick={() => editNote(n)}
                                className="rounded-full border border-black/10 bg-white px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 transition"
                                aria-label="Редактировать"
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                onClick={() => removeNote(n.id)}
                                className="rounded-full border border-black/10 bg-white px-2 py-1 text-xs text-red-600 hover:bg-red-50 transition"
                                aria-label="Удалить"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>

                          <div className="mt-1 text-xs text-black/45">
                            {format(new Date(n.date), "dd MMM yyyy HH:mm", { locale: ru })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* CHART + SUMMARY */}
            {fullNotes.length > 0 && (
              <div className="mt-7">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-black/70">📈 Аналитика</h3>
                  <span className="text-xs text-black/45">последние {chartData.length} точек</span>
                </div>

                <div className="mt-3 rounded-3xl border border-black/10 bg-white p-4">
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" style={{ fontSize: "12px" }} />
                      <YAxis style={{ fontSize: "12px" }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="mood" stroke="#8b5cf6" name="Настроение" strokeWidth={2} />
                      <Line type="monotone" dataKey="sleep" stroke="#10b981" name="Сон (мин)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-3 rounded-3xl border border-black/10 bg-gradient-to-br from-white to-gray-50 p-4">
                  <div className="grid gap-2 sm:grid-cols-2 text-sm text-black/70">
                    <div>
                      📊 Среднее настроение: <b className="text-violet-600">{avgMood}/10</b>
                    </div>
                    <div>
                      😴 Средний сон:{" "}
                      <b className="text-emerald-600">
                        {Math.round(avgSleep / 60)}ч {avgSleep % 60}м
                      </b>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-black/45">
                    Полных записей: <b>{fullNotes.length}</b> • Мини-заметок: <b>{quickNotes.length}</b>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ✅ ВАЖНО: ИИ-анализ вынесен ВНЕ grid, чтобы sticky не перекрывал */}
      {notes.length > 0 && (
        <div className="mt-6">
          <NotesAIAnalysis notes={notes} avgMood={avgMood} avgSleep={avgSleep} />
        </div>
      )}
    </div>
  );
}

/**
 * 🤖 Функция для подготовки данных к ИИ-анализу комментариев
 * Может быть использована для анализа настроения, выявления паттернов и рекомендаций
 *
 * @param {Array} notes - Массив заметок пользователя
 * @returns {Object} Структурированные данные для анализа ИИ
 */
export function prepareNotesForAIAnalysis(notes) {
  const fullNotes = notes.filter((n) => n.mood != null || n.sleep != null);
  const quickNotes = notes.filter((n) => n.mood == null && n.sleep == null && n.comment);

  const moodOnly = fullNotes.filter((n) => n.mood != null);
  const avgMood =
    moodOnly.length > 0
      ? (moodOnly.reduce((sum, n) => sum + n.mood, 0) / moodOnly.length).toFixed(1)
      : 0;

  return {
    totalNotes: notes.length,
    fullNotesCount: fullNotes.length,
    quickNotesCount: quickNotes.length,
    averageMood: parseFloat(avgMood),
    allComments: notes
      .filter((n) => n.comment)
      .map((n) => ({
        id: n.id,
        text: n.comment,
        mood: n.mood,
        sleep: n.sleep,
        date: n.date,
        type: n.mood != null || n.sleep != null ? "full" : "quick",
      }))
      .reverse(),
    moodTrend: fullNotes
      .filter((n) => n.mood != null)
      .map((n) => ({ date: n.date, mood: n.mood }))
      .reverse(),
    sleepTrend: fullNotes
      .filter((n) => n.sleep != null)
      .map((n) => ({ date: n.date, sleep: n.sleep }))
      .reverse(),
  };
}
