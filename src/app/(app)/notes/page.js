"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Button from "@/components/ui/Button";

export default function NotesPage() {
  const [mood, setMood] = useState("");
  const [sleep, setSleep] = useState("");
  const [comment, setComment] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("notes");
    if (saved) setItems(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(items));
  }, [items]);

  function addNote(e) {
    e.preventDefault();
    if (!mood && !sleep && !comment) return;
    const note = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      mood: mood ? Number(mood) : null,
      sleep: sleep ? Number(sleep) : null,
      comment: comment || "",
    };
    setItems([note, ...items]);
    setMood(""); setSleep(""); setComment("");
  }
  function removeNote(id) {
    setItems(items.filter((n) => n.id !== id));
  }

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
