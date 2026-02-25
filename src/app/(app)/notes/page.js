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

  // 🔹 Дополнительные поля
  const [energy, setEnergy] = useState("");
  const [stress, setStress] = useState("");
  const [nutrition, setNutrition] = useState("");
  const [exercise, setExercise] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [social, setSocial] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

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
        .select("id, date, mood, sleep, comment, energy, stress, nutrition, exercise, hobbies, social")
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
      energy: energy ? Number(energy) : null,
      stress: stress ? Number(stress) : null,
      nutrition: nutrition || null,
      exercise: exercise || null,
      hobbies: hobbies || null,
      social: social || null,
    };

    let response;
    if (editingId) {
      response = await supabase
        .from("notes")
        .update(payload)
        .eq("id", editingId)
        .select("id, date, mood, sleep, comment, energy, stress, nutrition, exercise, hobbies, social");
    } else {
      response = await supabase
        .from("notes")
        .insert(payload)
        .select("id, date, mood, sleep, comment, energy, stress, nutrition, exercise, hobbies, social");
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
    setEnergy("");
    setStress("");
    setNutrition("");
    setExercise("");
    setHobbies("");
    setSocial("");
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
    setEnergy(n.energy ?? "");
    setStress(n.stress ?? "");
    setNutrition(n.nutrition ?? "");
    setExercise(n.exercise ?? "");
    setHobbies(n.hobbies ?? "");
    setSocial(n.social ?? "");
    setEditingId(n.id);
    if (n.energy || n.stress || n.nutrition || n.exercise || n.hobbies || n.social) {
      setShowAdvanced(true);
    }
  }

  function resetEditor() {
    setEditingId(null);
    setMood("");
    setSleep("");
    setComment("");
    setEnergy("");
    setStress("");
    setNutrition("");
    setExercise("");
    setHobbies("");
    setSocial("");
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
      .select("id, date, mood, sleep, comment, energy, stress, nutrition, exercise, hobbies, social");

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

  // 🔹 Проверка записи за сегодня
  const hasRecordToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return notes.some(n => {
      const noteDate = new Date(n.date).toISOString().split('T')[0];
      return noteDate === today;
    });
  }, [notes]);

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
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white via-white to-violet-50/30 p-8 shadow-sm">
            <div className="h-6 w-56 rounded-lg bg-black/[0.06] animate-pulse" />
            <div className="mt-3 h-4 w-96 rounded-lg bg-black/[0.04] animate-pulse" />
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="h-[500px] rounded-3xl bg-black/[0.04] animate-pulse" />
              <div className="h-[500px] rounded-3xl bg-black/[0.04] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* ====== REMINDER BANNER ====== */}
      {!hasRecordToday && notes.length > 0 && (
        <div className="rounded-2xl border border-blue-200/60 bg-gradient-to-r from-blue-50 via-violet-50/50 to-blue-50 p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="relative flex h-10 w-10">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white text-lg">
                  ✍️
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-black/80">Не забудьте записать сегодняшний день!</h3>
              <p className="text-xs text-black/60 mt-0.5">
                Регулярные записи помогают ИИ лучше понять ваши паттерны и дать точные рекомендации
              </p>
            </div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex-shrink-0 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              Записать
            </button>
          </div>
        </div>
      )}

      {/* ====== HEADER ====== */}
      <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white via-violet-50/20 to-blue-50/40 p-8 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-violet-200/60 bg-white/80 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-violet-700 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-violet-500"></span>
              </span>
              Дневник заметок
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-black">
              Настроение, сон и мысли
            </h1>
            <p className="mt-3 text-base text-black/65 max-w-2xl leading-relaxed">
              Записывайте состояние дня и смотрите динамику. Сон указывайте в минутах
              <span className="inline-flex items-center ml-2 rounded-md bg-blue-100/70 px-2 py-0.5 text-xs font-medium text-blue-700">420 = 7 часов</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="group rounded-2xl border border-violet-200/50 bg-gradient-to-br from-violet-50 to-white px-5 py-3.5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2">
                <span className="text-lg">😊</span>
                <div className="text-xs font-medium text-black/50">Среднее настроение</div>
              </div>
              <div className="mt-1.5 text-2xl font-bold text-violet-600">
                {avgMood}
                <span className="text-base font-normal text-black/40 ml-1">/10</span>
              </div>
            </div>

            <div className="group rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-white px-5 py-3.5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2">
                <span className="text-lg">😴</span>
                <div className="text-xs font-medium text-black/50">Средний сон</div>
              </div>
              <div className="mt-1.5 text-2xl font-bold text-emerald-600">
                {Math.round(avgSleep / 60)}
                <span className="text-base font-normal text-black/40">ч </span>
                {avgSleep % 60}
                <span className="text-base font-normal text-black/40">м</span>
              </div>
            </div>

            <div className="group rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-white px-5 py-3.5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2">
                <span className="text-lg">📝</span>
                <div className="text-xs font-medium text-black/50">Всего записей</div>
              </div>
              <div className="mt-1.5 text-2xl font-bold text-blue-600">
                {fullNotes.length}
                <span className="text-base font-normal text-black/40"> + </span>
                {quickNotes.length}
              </div>
              <div className="text-[11px] text-black/50 font-medium mt-0.5">полные + мини</div>
            </div>
          </div>
        </div>
      </div>

      {/* ====== GRID: только 2 карточки ====== */}
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {/* ===== LEFT: FORM ===== */}
        <Card className="relative overflow-hidden rounded-3xl border border-black/10 bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-gradient-to-br from-violet-100 via-blue-100 to-transparent blur-3xl opacity-50" />

          <div className="relative p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✍️</span>
                  <h2 className="text-2xl font-semibold text-black">
                    {editingId ? "Редактировать запись" : "Новая запись"}
                  </h2>
                </div>
                <p className="mt-2 text-sm text-black/65 leading-relaxed">
                  Заполните настроение и сон (по желанию) и добавьте комментарий.
                </p>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetEditor}
                  className="rounded-xl border border-black/10 bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-black/70 hover:bg-black/[0.04] hover:border-black/20 transition-all shadow-sm"
                >
                  ✕ Сбросить
                </button>
              )}
            </div>

            <form onSubmit={saveNote} className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-black/70">
                    <span>😊</span>
                    Настроение (1–10)
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="h-11"
                  />
                  <div className="text-xs text-black/50 leading-relaxed">
                    💡 Оцени по самочувствию, не по событиям
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-black/70">
                    <span>😴</span>
                    Сон (минуты)
                  </Label>
                  <Input
                    type="number"
                    value={sleep}
                    onChange={(e) => setSleep(e.target.value)}
                    className="h-11"
                  />
                  <div className="text-xs text-black/50 leading-relaxed">
                    💡 Например: 420 = 7 часов
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-black/70">
                  <span>💭</span>
                  Комментарий
                </Label>
                <textarea
                  rows={5}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-[15px] text-black/80 outline-none
                             focus:border-violet-300 focus:ring-4 focus:ring-violet-100/50 transition-all resize-none shadow-sm"
                  placeholder="Как прошёл день? Что было важного или интересного?"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
                <Button className="w-full sm:w-auto text-base font-medium px-6 py-2.5 shadow-md hover:shadow-lg">
                  {editingId ? "💾 Сохранить изменения" : "✨ Сохранить запись"}
                </Button>
                <div className="text-xs text-black/50">
                  Сохранение обновит историю и график
                </div>
              </div>

              {/* ===== EXPANDABLE: ДОПОЛНИТЕЛЬНО ===== */}
              <div className="mt-6 pt-6 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🎯</span>
                    <h3 className="text-lg font-semibold text-black/80">Дополнительные параметры</h3>
                    <span className="rounded-lg bg-blue-100/70 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      Опционально
                    </span>
                  </div>
                  <span className={`text-black/40 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                <p className="mt-2 text-sm text-black/60">
                  Помогает ИИ лучше понять ваше состояние и дать персонализированные рекомендации
                </p>

                {showAdvanced && (
                  <div className="mt-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Energy & Stress */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label className="flex items-center gap-2 text-sm font-medium text-black/70">
                          <span>⚡</span>
                          Энергия (1–10)
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={energy}
                          onChange={(e) => setEnergy(e.target.value)}
                          className="h-11"
                          placeholder="Уровень энергии"
                        />
                        <div className="text-xs text-black/50">Насколько бодро вы себя чувствуете</div>
                      </div>

                      <div className="grid gap-2">
                        <Label className="flex items-center gap-2 text-sm font-medium text-black/70">
                          <span>😰</span>
                          Стресс (1–10)
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={stress}
                          onChange={(e) => setStress(e.target.value)}
                          className="h-11"
                          placeholder="Уровень стресса"
                        />
                        <div className="text-xs text-black/50">Насколько напряжённо/тревожно</div>
                      </div>
                    </div>

                    {/* Activities */}
                    <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-violet-50/30 to-blue-50/20 p-5">
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-black/80 mb-4">
                        <span>📊</span>
                        Активности дня
                      </h4>

                      <div className="grid gap-4">
                        {/* Nutrition */}
                        <ActivityRating
                          icon="🥗"
                          label="Питание"
                          value={nutrition}
                          onChange={setNutrition}
                        />

                        {/* Exercise */}
                        <ActivityRating
                          icon="🏃"
                          label="Физ. активность"
                          value={exercise}
                          onChange={setExercise}
                        />

                        {/* Hobbies */}
                        <ActivityRating
                          icon="🎨"
                          label="Хобби/Развлечения"
                          value={hobbies}
                          onChange={setHobbies}
                        />

                        {/* Social */}
                        <ActivityRating
                          icon="👥"
                          label="Общение"
                          value={social}
                          onChange={setSocial}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>

            {/* ===== MINI NOTES ===== */}
            <div className="mt-8 rounded-3xl border border-dashed border-black/15 bg-gradient-to-br from-blue-50/50 to-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    <h3 className="text-lg font-semibold text-black">Мини-заметки</h3>
                  </div>
                  <p className="mt-1.5 text-sm text-black/65">
                    Быстро записать мысль без настроения и сна
                  </p>
                </div>
                <span className="rounded-full border border-blue-200/60 bg-blue-100/60 px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
                  {quickNotes.length} шт.
                </span>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Input
                  placeholder="✏️ Быстрая мысль или идея…"
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  className="flex-1 h-11"
                />
                <Button
                  type="button"
                  onClick={addQuickNote}
                  className="w-full sm:w-auto px-5 shadow-sm"
                >
                  ➕ Добавить
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* ===== RIGHT: HISTORY + CHART ===== */}
        <Card className="rounded-3xl border border-black/10 bg-white shadow-md hover:shadow-lg transition-shadow duration-300 lg:sticky lg:top-6">
          <div className="p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  <h2 className="text-2xl font-semibold text-black">История и аналитика</h2>
                </div>
                <p className="mt-2 text-sm text-black/65 leading-relaxed">
                  Полные записи и мини-заметки. Ниже — динамика по дням
                </p>
              </div>

              <span className="rounded-full border border-black/15 bg-gradient-to-br from-gray-50 to-white px-4 py-1.5 text-xs font-semibold text-black/60 shadow-sm">
                Всего: {notes.length}
              </span>
            </div>

            {notes.length === 0 ? (
              <div className="mt-8 rounded-3xl border border-dashed border-black/15 bg-gradient-to-br from-gray-50/50 to-white p-8 text-center">
                <div className="text-5xl mb-3">📝</div>
                <p className="text-base font-medium text-black/70">Пока нет записей</p>
                <p className="mt-1 text-sm text-black/50">Добавьте первую запись слева</p>
              </div>
            ) : (
              <>
                {/* FULL NOTES */}
                {fullNotes.length > 0 && (
                  <div className="mt-7">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="flex items-center gap-2 text-base font-semibold text-black/80">
                        <span>📋</span>
                        Полные записи
                      </h3>
                      <span className="rounded-lg bg-violet-100/70 px-2.5 py-1 text-xs font-semibold text-violet-700">
                        {fullNotes.length} шт.
                      </span>
                    </div>

                    <ul className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                      {fullNotes.map((n) => (
                        <li
                          key={n.id}
                          className="group rounded-2xl border border-black/10 bg-gradient-to-br from-violet-50/40 via-white to-blue-50/30 p-4 transition-all hover:shadow-md hover:border-violet-200/60"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-medium text-black/50">
                                📅 {format(new Date(n.date), "dd MMM yyyy", { locale: ru })}
                              </div>

                              {n.comment && (
                                <div className="mt-2 text-sm text-black/80 break-words leading-relaxed">
                                  {n.comment}
                                </div>
                              )}

                              {/* Дополнительные параметры */}
                              {(n.energy || n.stress || n.nutrition || n.exercise || n.hobbies || n.social) && (
                                <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                                  {n.energy && (
                                    <span className="rounded-md bg-blue-100/70 text-blue-700 px-2 py-0.5 font-medium">
                                      ⚡ {n.energy}/10
                                    </span>
                                  )}
                                  {n.stress && (
                                    <span className="rounded-md bg-orange-100/70 text-orange-700 px-2 py-0.5 font-medium">
                                      😰 {n.stress}/10
                                    </span>
                                  )}
                                  {n.nutrition && (
                                    <span className="rounded-md bg-green-100/70 text-green-700 px-2 py-0.5 font-medium">
                                      🥗 {n.nutrition}
                                    </span>
                                  )}
                                  {n.exercise && (
                                    <span className="rounded-md bg-purple-100/70 text-purple-700 px-2 py-0.5 font-medium">
                                      🏃 {n.exercise}
                                    </span>
                                  )}
                                  {n.hobbies && (
                                    <span className="rounded-md bg-pink-100/70 text-pink-700 px-2 py-0.5 font-medium">
                                      🎨 {n.hobbies}
                                    </span>
                                  )}
                                  {n.social && (
                                    <span className="rounded-md bg-indigo-100/70 text-indigo-700 px-2 py-0.5 font-medium">
                                      👥 {n.social}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <div className="flex gap-1.5 text-xs whitespace-nowrap">
                                {n.mood != null && (
                                  <span className="rounded-lg bg-violet-100/80 text-violet-700 px-2.5 py-1.5 font-semibold shadow-sm">
                                    😊 {n.mood}/10
                                  </span>
                                )}
                                {n.sleep != null && (
                                  <span className="rounded-lg bg-emerald-100/80 text-emerald-700 px-2.5 py-1.5 font-semibold shadow-sm">
                                    😴 {Math.round(n.sleep / 60)}ч
                                  </span>
                                )}
                              </div>

                              <div className="flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => editNote(n)}
                                  className="rounded-lg border border-blue-200/60 bg-blue-50/80 backdrop-blur-sm px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all shadow-sm"
                                >
                                  ✏️ Редактировать
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeNote(n.id)}
                                  className="rounded-lg border border-red-200/60 bg-red-50/80 backdrop-blur-sm px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 hover:border-red-300 transition-all shadow-sm"
                                >
                                  🗑️
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
                  <div className="mt-7">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="flex items-center gap-2 text-base font-semibold text-black/80">
                        <span>💬</span>
                        Мини-заметки
                      </h3>
                      <span className="rounded-lg bg-blue-100/70 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {quickNotes.length} шт.
                      </span>
                    </div>

                    <div className="grid gap-2.5 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                      {quickNotes.map((n) => (
                        <div
                          key={n.id}
                          className="group rounded-2xl border border-black/10 bg-gradient-to-br from-blue-50/40 to-white p-3.5 transition-all hover:shadow-md hover:border-blue-200/60"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-black/80 break-words leading-relaxed flex-1">{n.comment}</p>

                            <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                              <button
                                type="button"
                                onClick={() => editNote(n)}
                                className="rounded-lg border border-blue-200/60 bg-white/80 backdrop-blur-sm px-2 py-1 text-xs hover:bg-blue-50 hover:border-blue-300 transition-all"
                                aria-label="Редактировать"
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                onClick={() => removeNote(n.id)}
                                className="rounded-lg border border-red-200/60 bg-white/80 backdrop-blur-sm px-2 py-1 text-xs hover:bg-red-50 hover:border-red-300 transition-all"
                                aria-label="Удалить"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>

                          <div className="mt-2 flex items-center gap-1.5 text-xs text-black/50">
                            <span>🕐</span>
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
              <div className="mt-8 pt-6 border-t border-black/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-black/80">
                    <span>📈</span>
                    Динамика
                  </h3>
                  <span className="rounded-lg bg-gray-100/70 px-2.5 py-1 text-xs font-semibold text-black/60">
                    {chartData.length} точек
                  </span>
                </div>

                <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-white to-gray-50/50 p-5 shadow-sm">
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="date" 
                        style={{ fontSize: "12px", fill: "#6b7280" }}
                        stroke="#9ca3af"
                      />
                      <YAxis 
                        style={{ fontSize: "12px", fill: "#6b7280" }}
                        stroke="#9ca3af"
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "12px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="#8b5cf6" 
                        name="Настроение" 
                        strokeWidth={3}
                        dot={{ fill: "#8b5cf6", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sleep" 
                        stroke="#10b981" 
                        name="Сон (мин)" 
                        strokeWidth={3}
                        dot={{ fill: "#10b981", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 rounded-2xl border border-black/10 bg-gradient-to-br from-violet-50/40 via-blue-50/30 to-white p-5 shadow-sm">
                  <div className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="flex items-center gap-2.5 rounded-xl bg-white/70 backdrop-blur-sm px-4 py-3 border border-violet-200/50">
                      <span className="text-xl">😊</span>
                      <div>
                        <div className="text-xs text-black/50 font-medium">Среднее настроение</div>
                        <div className="text-lg font-bold text-violet-600">{avgMood}/10</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-xl bg-white/70 backdrop-blur-sm px-4 py-3 border border-emerald-200/50">
                      <span className="text-xl">😴</span>
                      <div>
                        <div className="text-xs text-black/50 font-medium">Средний сон</div>
                        <div className="text-lg font-bold text-emerald-600">
                          {Math.round(avgSleep / 60)}ч {avgSleep % 60}м
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-black/10 text-xs text-black/55 text-center">
                    📊 Полных записей: <b className="text-black/70">{fullNotes.length}</b> • 
                    💬 Мини-заметок: <b className="text-black/70">{quickNotes.length}</b>
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

      {/* ====== WEEKLY TRACKER TABLE ====== */}
      {fullNotes.length > 0 && (
        <div className="mt-8">
          <WeeklyTracker notes={notes} />
        </div>
      )}

      {/* ====== INSIGHTS ====== */}
      {fullNotes.length >= 5 && (
        <div className="mt-8">
          <NotesInsights notes={notes} fullNotes={fullNotes} />
        </div>
      )}
    </div>
  );
}

/**
 * � Компонент для показа insights и корреляций
 */
function NotesInsights({ notes, fullNotes }) {
  const insights = useMemo(() => {
    const result = [];

    // 1. Корреляция сна и настроения
    const withSleepAndMood = fullNotes.filter(n => n.sleep != null && n.mood != null);
    if (withSleepAndMood.length >= 3) {
      const goodSleep = withSleepAndMood.filter(n => n.sleep >= 420); // >=7 часов
      const poorSleep = withSleepAndMood.filter(n => n.sleep < 420);
      
      if (goodSleep.length > 0 && poorSleep.length > 0) {
        const avgMoodGoodSleep = goodSleep.reduce((sum, n) => sum + n.mood, 0) / goodSleep.length;
        const avgMoodPoorSleep = poorSleep.reduce((sum, n) => sum + n.mood, 0) / poorSleep.length;
        const diff = avgMoodGoodSleep - avgMoodPoorSleep;
        
        if (Math.abs(diff) > 0.5) {
          result.push({
            icon: "😴",
            type: diff > 0 ? "positive" : "neutral",
            title: "Сон и настроение",
            text: diff > 0 
              ? `При сне ≥7 часов ваше настроение выше на ${diff.toFixed(1)} балла`
              : `При недосыпе (<7ч) настроение ниже на ${Math.abs(diff).toFixed(1)} балла`,
          });
        }
      }
    }

    // 2. Корреляция спорта и настроения
    const withExerciseAndMood = fullNotes.filter(n => n.exercise && n.mood != null);
    if (withExerciseAndMood.length >= 3) {
      const withGoodExercise = withExerciseAndMood.filter(n => n.exercise === 'great' || n.exercise === 'fine');
      const withPoorExercise = withExerciseAndMood.filter(n => n.exercise === 'ok' || n.exercise === 'poor');
      
      if (withGoodExercise.length > 0 && withPoorExercise.length > 0) {
        const avgMoodGoodEx = withGoodExercise.reduce((sum, n) => sum + n.mood, 0) / withGoodExercise.length;
        const avgMoodPoorEx = withPoorExercise.reduce((sum, n) => sum + n.mood, 0) / withPoorExercise.length;
        const diff = avgMoodGoodEx - avgMoodPoorEx;
        
        if (diff > 0.5) {
          result.push({
            icon: "🏃",
            type: "positive",
            title: "Физическая активность",
            text: `Спорт улучшает ваше настроение в среднем на ${diff.toFixed(1)} балла`,
          });
        }
      }
    }

    // 3. Корреляция энергии и стресса
    const withEnergyAndStress = fullNotes.filter(n => n.energy != null && n.stress != null);
    if (withEnergyAndStress.length >= 3) {
      const correlation = calculateCorrelation(
        withEnergyAndStress.map(n => n.energy),
        withEnergyAndStress.map(n => n.stress)
      );
      
      if (correlation < -0.3) {
        result.push({
          icon: "⚡",
          type: "insight",
          title: "Энергия и стресс",
          text: `Чем выше стресс, тем ниже энергия (корреляция ${(correlation * 100).toFixed(0)}%)`,
        });
      }
    }

    // 4. Лучший день недели по настроению
    const byDayOfWeek = {};
    fullNotes.filter(n => n.mood != null).forEach(n => {
      const day = new Date(n.date).getDay();
      if (!byDayOfWeek[day]) byDayOfWeek[day] = [];
      byDayOfWeek[day].push(n.mood);
    });

    const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const dayAverages = Object.entries(byDayOfWeek).map(([day, moods]) => ({
      day: parseInt(day),
      avg: moods.reduce((a, b) => a + b, 0) / moods.length,
      count: moods.length,
    }));

    if (dayAverages.length >= 3) {
      const bestDay = dayAverages.reduce((best, curr) => curr.avg > best.avg ? curr : best);
      if (bestDay.count >= 2) {
        result.push({
          icon: "📅",
          type: "positive",
          title: "Лучший день недели",
          text: `Ваше настроение лучше всего по ${dayNames[bestDay.day].toLowerCase()}ам (${bestDay.avg.toFixed(1)}/10)`,
        });
      }
    }

    // 5. Социализация и настроение
    const withSocialAndMood = fullNotes.filter(n => n.social && n.mood != null);
    if (withSocialAndMood.length >= 3) {
      const withGoodSocial = withSocialAndMood.filter(n => n.social === 'great' || n.social === 'fine');
      const withPoorSocial = withSocialAndMood.filter(n => n.social === 'ok' || n.social === 'poor');
      
      if (withGoodSocial.length > 0) {
        const avgMoodGoodSocial = withGoodSocial.reduce((sum, n) => sum + n.mood, 0) / withGoodSocial.length;
        
        if (withPoorSocial.length > 0) {
          const avgMoodPoorSocial = withPoorSocial.reduce((sum, n) => sum + n.mood, 0) / withPoorSocial.length;
          const diff = avgMoodGoodSocial - avgMoodPoorSocial;
          
          if (diff > 0.5) {
            result.push({
              icon: "👥",
              type: "positive",
              title: "Общение важно",
              text: `Активное общение повышает настроение на ${diff.toFixed(1)} балла`,
            });
          }
        }
      }
    }

    // 6. Стресс без активностей
    const withStressAndActivities = fullNotes.filter(n => 
      n.stress != null && (n.exercise || n.hobbies)
    );
    if (withStressAndActivities.length >= 3) {
      const withGoodActivities = withStressAndActivities.filter(n => 
        (n.exercise === 'great' || n.exercise === 'fine') || 
        (n.hobbies === 'great' || n.hobbies === 'fine')
      );
      const withoutActivities = withStressAndActivities.filter(n => 
        (!n.exercise || n.exercise === 'poor') && 
        (!n.hobbies || n.hobbies === 'poor')
      );
      
      if (withGoodActivities.length > 0 && withoutActivities.length > 0) {
        const avgStressWithActivities = withGoodActivities.reduce((sum, n) => sum + n.stress, 0) / withGoodActivities.length;
        const avgStressWithout = withoutActivities.reduce((sum, n) => sum + n.stress, 0) / withoutActivities.length;
        const diff = avgStressWithout - avgStressWithActivities;
        
        if (diff > 1) {
          result.push({
            icon: "🎨",
            type: "warning",
            title: "Активности снижают стресс",
            text: `В дни без спорта/хобби стресс выше на ${diff.toFixed(1)} балла`,
          });
        }
      }
    }

    return result.slice(0, 6); // Максимум 6 инсайтов
  }, [fullNotes]);

  // Вспомогательная функция для корреляции
  function calculateCorrelation(x, y) {
    const n = x.length;
    if (n === 0) return 0;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  const getInsightColor = (type) => {
    switch (type) {
      case "positive": return "from-emerald-50 to-green-50 border-emerald-200/60";
      case "warning": return "from-orange-50 to-yellow-50 border-orange-200/60";
      case "insight": return "from-blue-50 to-violet-50 border-blue-200/60";
      default: return "from-gray-50 to-white border-gray-200/60";
    }
  };

  if (insights.length === 0) return null;

  return (
    <Card className="rounded-3xl border border-black/10 bg-white shadow-md">
      <div className="p-7">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">💡</span>
              <h2 className="text-2xl font-semibold text-black">Инсайты и паттерны</h2>
            </div>
            <p className="mt-2 text-sm text-black/65 leading-relaxed">
              Автоматический анализ ваших данных для выявления закономерностей
            </p>
          </div>
          <span className="rounded-full border border-violet-200/60 bg-violet-100/60 px-3.5 py-1.5 text-xs font-semibold text-violet-700 shadow-sm">
            {insights.length} найдено
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border bg-gradient-to-br p-5 shadow-sm hover:shadow-md transition-all ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl flex-shrink-0">{insight.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-black/80 mb-1">
                    {insight.title}
                  </h3>
                  <p className="text-sm text-black/70 leading-relaxed">
                    {insight.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl bg-blue-50/50 border border-blue-200/40 p-4">
          <p className="text-xs text-black/65 leading-relaxed">
            💡 <b>Совет:</b> Чем больше записей вы ведете, тем точнее инсайты. Заполняйте дополнительные параметры для более глубокого анализа!
          </p>
        </div>
      </div>
    </Card>
  );
}

/**
 * �📊 Компонент недельного трекера активностей
 */
function WeeklyTracker({ notes }) {
  // Получаем последние 7 дней
  const weekData = useMemo(() => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayNotes = notes.filter((n) => {
        const noteDate = new Date(n.date).toISOString().split('T')[0];
        return noteDate === dateStr;
      });

      // Берем последнюю запись за день или первую с заполненными активностями
      const note = dayNotes.find(n => n.nutrition || n.exercise || n.hobbies || n.social) || dayNotes[0];

      result.push({
        date: d,
        dateStr,
        dayName: format(d, "EEE", { locale: ru }),
        dayNum: format(d, "d MMM", { locale: ru }),
        note: note || null,
      });
    }
    return result;
  }, [notes]);

  const activities = [
    { key: "nutrition", icon: "🥗", label: "Питание" },
    { key: "exercise", icon: "🏃", label: "Спорт" },
    { key: "hobbies", icon: "🎨", label: "Хобби" },
    { key: "social", icon: "👥", label: "Общение" },
  ];

  const getRatingColor = (val) => {
    if (!val) return "bg-gray-100 text-gray-400";
    switch (val) {
      case "great": return "bg-emerald-200 text-emerald-800 font-semibold";
      case "fine": return "bg-blue-200 text-blue-800 font-medium";
      case "ok": return "bg-yellow-200 text-yellow-800";
      case "poor": return "bg-red-200 text-red-800";
      default: return "bg-gray-100 text-gray-400";
    }
  };

  const getRatingIcon = (val) => {
    switch (val) {
      case "great": return "⭐";
      case "fine": return "✓";
      case "ok": return "○";
      case "poor": return "✗";
      default: return "—";
    }
  };

  return (
    <Card className="rounded-3xl border border-black/10 bg-white shadow-md">
      <div className="p-7">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">📅</span>
              <h2 className="text-2xl font-semibold text-black">Недельный трекер</h2>
            </div>
            <p className="mt-2 text-sm text-black/65 leading-relaxed">
              Визуальный обзор ваших активностей за последние 7 дней
            </p>
          </div>
        </div>

        <div className="overflow-x-auto -mx-7 px-7">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b-2 border-black/10">
                <th className="text-left py-3 px-3 text-sm font-semibold text-black/70 w-[140px]">
                  Активность
                </th>
                {weekData.map((day) => (
                  <th key={day.dateStr} className="text-center py-3 px-2 min-w-[90px]">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-black/50 uppercase">
                        {day.dayName}
                      </span>
                      <span className="text-sm font-semibold text-black/80">
                        {day.dayNum}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, idx) => (
                <tr 
                  key={activity.key}
                  className={`border-b border-black/10 ${idx % 2 === 0 ? 'bg-gray-50/30' : ''}`}
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{activity.icon}</span>
                      <span className="text-sm font-medium text-black/70">
                        {activity.label}
                      </span>
                    </div>
                  </td>
                  {weekData.map((day) => {
                    const value = day.note?.[activity.key];
                    return (
                      <td key={day.dateStr} className="text-center py-3 px-2">
                        <div className={`
                          inline-flex items-center justify-center
                          rounded-lg px-2.5 py-1.5 text-xs
                          transition-all hover:scale-105
                          ${getRatingColor(value)}
                        `}>
                          <span className="mr-1">{getRatingIcon(value)}</span>
                          <span className="capitalize">{value || "—"}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Mood & Energy row */}
              <tr className="border-b border-black/10 bg-violet-50/30">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">😊</span>
                    <span className="text-sm font-medium text-black/70">Настроение</span>
                  </div>
                </td>
                {weekData.map((day) => {
                  const mood = day.note?.mood;
                  return (
                    <td key={day.dateStr} className="text-center py-3 px-2">
                      {mood != null ? (
                        <div className="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-violet-200 text-violet-800">
                          {mood}/10
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              <tr className="bg-blue-50/30">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚡</span>
                    <span className="text-sm font-medium text-black/70">Энергия</span>
                  </div>
                </td>
                {weekData.map((day) => {
                  const energy = day.note?.energy;
                  return (
                    <td key={day.dateStr} className="text-center py-3 px-2">
                      {energy != null ? (
                        <div className="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-blue-200 text-blue-800">
                          {energy}/10
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap gap-3 items-center justify-center text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-emerald-200 flex items-center justify-center text-emerald-800">⭐</div>
            <span className="text-black/60">Отлично</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-blue-200 flex items-center justify-center text-blue-800">✓</div>
            <span className="text-black/60">Хорошо</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-yellow-200 flex items-center justify-center text-yellow-800">○</div>
            <span className="text-black/60">OK</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-red-200 flex items-center justify-center text-red-800">✗</div>
            <span className="text-black/60">Плохо</span>
          </div>
        </div>
      </div>
    </Card>
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
        energy: n.energy,
        stress: n.stress,
        nutrition: n.nutrition,
        exercise: n.exercise,
        hobbies: n.hobbies,
        social: n.social,
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

/**
 * 🎯 Компонент для выбора рейтинга активности
 */
function ActivityRating({ icon, label, value, onChange }) {
  const options = [
    { val: "great", label: "Отлично", emoji: "⭐", color: "emerald" },
    { val: "fine", label: "Хорошо", emoji: "✓", color: "blue" },
    { val: "ok", label: "OK", emoji: "○", color: "yellow" },
    { val: "poor", label: "Плохо", emoji: "✗", color: "red" },
  ];

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 min-w-[140px]">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium text-black/70">{label}</span>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.val}
            type="button"
            onClick={() => onChange(value === opt.val ? "" : opt.val)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${value === opt.val
                ? `bg-${opt.color}-100 text-${opt.color}-700 border-${opt.color}-300 shadow-sm scale-105`
                : 'bg-white/80 text-black/50 border-black/10 hover:bg-black/[0.04]'
              }
              border
            `}
            style={value === opt.val ? {
              backgroundColor: opt.color === 'emerald' ? '#d1fae5' : 
                               opt.color === 'blue' ? '#dbeafe' :
                               opt.color === 'yellow' ? '#fef3c7' : '#fee2e2',
              color: opt.color === 'emerald' ? '#047857' :
                     opt.color === 'blue' ? '#1d4ed8' :
                     opt.color === 'yellow' ? '#b45309' : '#dc2626',
              borderColor: opt.color === 'emerald' ? '#6ee7b7' :
                          opt.color === 'blue' ? '#93c5fd' :
                          opt.color === 'yellow' ? '#fcd34d' : '#fca5a5',
            } : {}}
          >
            <span className="mr-1">{opt.emoji}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
