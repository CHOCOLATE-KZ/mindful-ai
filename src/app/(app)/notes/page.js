"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Button from "@/components/ui/Button";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function NotesPage() {
  const [mood, setMood] = useState("");
  const [sleep, setSleep] = useState("");
  const [comment, setComment] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const supabase = supabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("notes")
        .select("id, date, mood, sleep, comment")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(200);

      if (!error && mounted) setItems(data || []);
      setLoading(false);
    })();

    return () => { mounted = false; };
  }, []);

  async function addNote(e) {
    e.preventDefault();
    const supabase = supabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Пожалуйста, войдите в аккаунт");

    const payload = {
      user_id: user.id,
      mood: mood ? Number(mood) : null,
      sleep: sleep ? Number(sleep) : null,
      comment: comment || null,
    };

    const { data, error } = await supabase.from("notes").insert(payload).select("id, date, mood, sleep, comment");
    if (error) return alert(error.message);

    setItems((s) => [data[0], ...s]);
    setMood(""); setSleep(""); setComment("");
  }

  async function removeNote(id) {
    const supabase = supabaseBrowser();
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) return alert(error.message);
    setItems((s) => s.filter((n) => n.id !== id));
  }

  if (loading) return <p className="text-center py-10">Загрузка...</p>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Форма */}
      <Card>
        <h2 className="text-xl font-semibold">Новая заметка</h2>
        <form onSubmit={addNote} className="mt-4 space-y-4">
          <div className="grid gap-1">
            <Label>Настроение (1–10)</Label>
            <Input type="number" min="1" max="10" placeholder="7" value={mood} onChange={(e)=>setMood(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label>Сон (минуты)</Label>
            <Input type="number" placeholder="420" value={sleep} onChange={(e)=>setSleep(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label>Комментарий</Label>
            <textarea
              rows={3}
              placeholder="Как прошёл день?"
              value={comment}
              onChange={(e)=>setComment(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-[15px] outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>
          <Button className="w-full md:w-auto">Сохранить</Button>
        </form>
      </Card>

      {/* Список */}
      <Card>
        <h2 className="text-xl font-semibold">История</h2>
        {items.length === 0 ? (
          <p className="mt-3 text-gray-600">Пока нет заметок.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {items.map((n) => (
              <li key={n.id} className="rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">{n.date}</div>
                  <button onClick={() => removeNote(n.id)} className="text-sm text-red-600 hover:underline">
                    Удалить
                  </button>
                </div>
                <div className="mt-1 text-gray-900">
                  {n.mood != null && <span className="mr-3">😊 {n.mood}/10</span>}
                  {n.sleep != null && <span>🛌 {n.sleep} мин.</span>}
                </div>
                {n.comment && <div className="mt-1 text-gray-700">{n.comment}</div>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
