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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setNotes([]); setLoading(false); return; }

      const { data, error } = await supabase
        .from("notes")
        .select("id, date, mood, sleep, comment")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(200);

      if (!error && mounted) setNotes(data || []);
      setLoading(false);
    })();

    return () => { mounted = false; };
  }, [supabase]);

  // 🔹 Добавление / редактирование заметки
  async function saveNote(e) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
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

    setMood(""); setSleep(""); setComment("");
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

  // 🔹 Мини-заметки (быстрые заметки без настроения/сна)
  async function addQuickNote() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Войдите в аккаунт");
    if (!quickNote.trim()) return;

    const { data, error } = await supabase.from("notes")
      .insert({ user_id: user.id, comment: quickNote })
      .select("id, date, comment");

    if (error) return alert(error.message);
    setNotes((s) => [data[0], ...s]);
    setQuickNote("");
  }

  // 🔹 Разделение заметок на полные и мини
  const fullNotes = useMemo(() => notes.filter(n => n.mood != null || n.sleep != null), [notes]);
  const quickNotes = useMemo(() => notes.filter(n => n.mood == null && n.sleep == null && n.comment), [notes]);

  // 🔹 Данные для аналитики
  const chartData = useMemo(() => {
    return fullNotes
      .map(n => ({
        date: format(new Date(n.date), "dd MMM", { locale: ru }),
        mood: n.mood,
        sleep: n.sleep
      })).reverse();
  }, [fullNotes]);

  const avgMood = useMemo(() => {
    const moodNotes = fullNotes.filter(n => n.mood != null);
    if (!moodNotes.length) return 0;
    return (moodNotes.reduce((sum, n) => sum + n.mood, 0) / moodNotes.length).toFixed(1);
  }, [fullNotes]);

  const avgSleep = useMemo(() => {
    const sleepNotes = fullNotes.filter(n => n.sleep != null);
    if (!sleepNotes.length) return 0;
    return Math.round(sleepNotes.reduce((sum, n) => sum + n.sleep, 0) / sleepNotes.length);
  }, [fullNotes]);

  // 🔹 Данные для ИИ-анализа комментариев
  const aiAnalysisData = useMemo(() => {
    return notes
      .filter(n => n.comment)
      .map(n => ({
        id: n.id,
        date: n.date,
        comment: n.comment,
        mood: n.mood,
        sleep: n.sleep,
        formattedDate: format(new Date(n.date), "dd MMM yyyy HH:mm", { locale: ru })
      }));
  }, [notes]);

  if (loading) return <p className="text-center py-10">Загрузка...</p>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* 🔹 Основной дневник */}
      <Card className="transition-all duration-200 hover:shadow-lg">
        <h2 className="text-xl font-semibold mb-3">{editingId ? "Редактировать запись" : "Новая запись"}</h2>
        <form onSubmit={saveNote} className="space-y-4">
          <div className="grid gap-1">
            <Label>Настроение (1–10)</Label>
            <Input type="number" min="1" max="10" value={mood} onChange={e => setMood(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label>Сон (минуты)</Label>
            <Input type="number" value={sleep} onChange={e => setSleep(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label>Комментарий</Label>
            <textarea
              rows={3}
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-[15px] outline-none focus:ring-2 focus:ring-violet-300 transition-all"
              placeholder="Как прошёл день?"
            />
          </div>
          <Button className="w-full md:w-auto hover:bg-violet-600 transition-colors">
            {editingId ? "Сохранить изменения" : "Сохранить"}
          </Button>
        </form>

        {/* 🔹 Мини-заметки */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Мини-заметки</h3>
          <div className="flex gap-2">
            <Input placeholder="Быстрая мысль..." value={quickNote} onChange={e => setQuickNote(e.target.value)} />
            <Button onClick={addQuickNote}>Добавить</Button>
          </div>
        </div>
      </Card>

      {/* 🔹 История и аналитика */}
      <Card className="transition-all duration-200 hover:shadow-lg">
        <h2 className="text-xl font-semibold mb-3">История и аналитика</h2>

        {notes.length === 0 ? (
          <p className="text-gray-600">Пока нет записей.</p>
        ) : (
          <>
            {/* 🔹 Полные заметки */}
            {fullNotes.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-sm text-gray-700 mb-3">📊 Полные записи</h3>
                <ul className="space-y-3 max-h-[150px] overflow-y-auto">
                  {fullNotes.map(n => (
                    <li key={n.id} className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-3 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start gap-2 text-sm">
                        <div className="flex-1">
                          <div className="text-gray-500 text-xs">{format(new Date(n.date), "dd MMM yyyy", { locale: ru })}</div>
                          {n.comment && <div className="mt-1 text-gray-700 text-sm">{n.comment}</div>}
                        </div>
                        <div className="flex gap-1 text-xs whitespace-nowrap">
                          {n.mood != null && <span className="bg-violet-100 text-violet-700 px-2 py-1 rounded">😊 {n.mood}/10</span>}
                          {n.sleep != null && <span className="bg-green-100 text-green-700 px-2 py-1 rounded">🛌 {Math.round(n.sleep / 60)}ч</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => editNote(n)} className="text-xs text-blue-600 hover:underline">Редактировать</button>
                        <button onClick={() => removeNote(n.id)} className="text-xs text-red-600 hover:underline">Удалить</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 🔹 Мини-заметки */}
            {quickNotes.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-sm text-gray-700 mb-3">💬 Мини-заметки</h3>
                <div className="grid gap-2 max-h-[120px] overflow-y-auto">
                  {quickNotes.map(n => (
                    <div key={n.id} className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-2 text-sm text-gray-700 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start gap-2">
                        <p className="flex-1">{n.comment}</p>
                        <div className="flex gap-1">
                          <button onClick={() => editNote(n)} className="text-xs text-blue-600 hover:underline">✏️</button>
                          <button onClick={() => removeNote(n.id)} className="text-xs text-red-600 hover:underline">🗑️</button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{format(new Date(n.date), "dd MMM yyyy HH:mm", { locale: ru })}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* 🔹 График настроения и сна */}
        {fullNotes.length > 0 && (
          <>
            <h3 className="font-semibold mb-2 text-sm text-gray-700">📈 Аналитика</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" style={{ fontSize: "12px" }} />
                <YAxis style={{ fontSize: "12px" }} />
                <Tooltip />
                <Line type="monotone" dataKey="mood" stroke="#8b5cf6" name="Настроение" strokeWidth={2} />
                <Line type="monotone" dataKey="sleep" stroke="#10b981" name="Сон (мин)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
              <p>📊 Среднее настроение: <b className="text-violet-600">{avgMood}/10</b></p>
              <p>😴 Средний сон: <b className="text-green-600">{Math.round(avgSleep / 60)}ч {avgSleep % 60}м</b></p>
              <p className="text-xs mt-2 text-gray-500">Всего записей: <b>{fullNotes.length}</b> | Мини-заметок: <b>{quickNotes.length}</b></p>
            </div>
          </>
        )}
      </Card>

      {/* 🔹 ИИ-анализ комментариев */}
      {notes.length > 0 && (
        <NotesAIAnalysis notes={notes} avgMood={avgMood} avgSleep={avgSleep} />
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
  const fullNotes = notes.filter(n => n.mood != null || n.sleep != null);
  const quickNotes = notes.filter(n => n.mood == null && n.sleep == null && n.comment);
  
  const avgMood = fullNotes.filter(n => n.mood).length > 0
    ? (fullNotes.filter(n => n.mood).reduce((sum, n) => sum + n.mood, 0) / fullNotes.filter(n => n.mood).length).toFixed(1)
    : 0;

  return {
    totalNotes: notes.length,
    fullNotesCount: fullNotes.length,
    quickNotesCount: quickNotes.length,
    averageMood: parseFloat(avgMood),
    allComments: notes
      .filter(n => n.comment)
      .map(n => ({
        id: n.id,
        text: n.comment,
        mood: n.mood,
        sleep: n.sleep,
        date: n.date,
        type: (n.mood != null || n.sleep != null) ? 'full' : 'quick'
      }))
      .reverse(),
    moodTrend: fullNotes
      .filter(n => n.mood != null)
      .map(n => ({ date: n.date, mood: n.mood }))
      .reverse(),
    sleepTrend: fullNotes
      .filter(n => n.sleep != null)
      .map(n => ({ date: n.date, sleep: n.sleep }))
      .reverse()
  };
}
