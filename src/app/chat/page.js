"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import LiquidGlassCard from "@/components/LiquidGlassCard";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ChatPage() {
  const supabase = supabaseBrowser();
  const [messages, setMessages] = useState([]); // {role, content}
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    (async () => {
      // подгружаем историю
      const { data, error } = await supabase
        .from("ai_messages")
        .select("role, content, created_at")
        .order("created_at", { ascending: true })
        .limit(50);

      if (!error) setMessages(data || []);
    })();
  }, [supabase]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(e) {
    e?.preventDefault?.();
    if (!text.trim() || loading) return;

    const userMsg = { role: "user", content: text.trim() };
    setMessages((m) => [...m, userMsg]);
    setText("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat error");

      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Извини, что-то пошло не так. Попробуй ещё раз." },
      ]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh bg-liquid-warm bg-liquid-soft px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <LiquidGlassCard className="w-full">
          <h1 className="text-xl font-semibold mb-4">Чат с MindfulAI</h1>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <div
                  className={
                    "inline-block rounded-2xl px-4 py-2 whitespace-pre-wrap " +
                    (m.role === "user"
                      ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white"
                      : "bg-white/70 backdrop-blur ring-1 ring-black/5 text-gray-800")
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-left">
                <div className="inline-block rounded-2xl px-4 py-2 bg-white/70 ring-1 ring-black/5">
                  Думаю…
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="mt-5 flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Как ты сегодня себя чувствуешь?"
            />
            <Button disabled={loading}>{loading ? "…" : "Отправить"}</Button>
          </form>
        </LiquidGlassCard>
      </div>
    </main>
  );
}
