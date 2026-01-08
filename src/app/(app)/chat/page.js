"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Send, Mic, Sparkles, MoreVertical } from "lucide-react";

export default function ChatPage() {
  const supabase = supabaseBrowser();

  const [messages, setMessages] = useState([]); // { role: "user"|"assistant", content, created_at }
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const endRef = useRef(null);

  // 1) грузим историю
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("ai_messages")
        .select("role, content, created_at")
        .order("created_at", { ascending: true })
        .limit(50);

      if (!error) setMessages(data || []);
      else console.error("history error:", error);
    })();
  }, [supabase]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(e) {
    e?.preventDefault?.();
    if (!input.trim() || loading) return;

    const text = input.trim();
    setInput("");

    // оптимистично добавим user сообщение
    setMessages((m) => [...m, { role: "user", content: text, created_at: new Date().toISOString() }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Chat error");

      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply, created_at: new Date().toISOString() },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Извини, что-то пошло не так. Попробуй ещё раз.", created_at: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    
    <div className="min-h-dvh bg-gradient-to-b from-[#E8E0FF] via-[#EAF2FF] to-[#FFDCC8]">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-black" />
            </div>
            <div>
              <h1 className="text-gray-900 font-medium">MindfulAI Assistant</h1>
              <p className="text-sm text-gray-500">Always here to listen</p>
            </div>
          </div>

          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {messages.map((m, idx) => {
            const isAI = m.role === "assistant";
            return (
              <div key={idx} className={`flex gap-3 ${isAI ? "justify-start" : "justify-end"}`}>
                {isAI && (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-black" />
                  </div>
                )}

                <div
                  className={`max-w-[75%] lg:max-w-[60%] rounded-3xl px-5 py-3 shadow-lg ${
                    isAI
                      ? "bg-white/90 backdrop-blur-sm border border-white/50 text-gray-800"
                      : "bg-gradient-to-br from-purple-500 to-blue-500 black"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  <p className={`text-xs mt-2 ${isAI ? "text-gray-500" : "text-xs mt-2 text-grey/70"}`}>
                    {m.created_at
                      ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : ""}
                  </p>
                </div>

                {!isAI && (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#FFDCC8] to-[#FFB088] flex items-center justify-center flex-shrink-0 text-black font-medium">
                    U
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-black" />
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl px-5 py-3 shadow-lg border border-black/50">
                Думаю…
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 border-t bg-white/80 backdrop-blur-sm shadow-lg">
        <form onSubmit={send} className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full min-h-[48px] max-h-32 resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 pr-12 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(e);
                  }
                }}
              />
            </div>

            <button
              type="button"
              className="h-12 w-12 rounded-full grid place-items-center hover:bg-black/5 transition-colors"
              title="Mic (later)"
            >
              <Mic className="h-5 w-5 text-gray-500" />
            </button>

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="h-12 w-12 rounded-full grid place-items-center
                        bg-gradient-to-br from-purple-500 to-blue-500 text-white
                        shadow-lg hover:opacity-90 transition-opacity
                        disabled:opacity-40 "
              title="Send"
            >
              <Send className="h-5 w-5 stroke-black" />
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-2 text-center">
            💙 This is a supportive space. Take your time and share what feels right.
          </p>
        </form>
      </div>
    </div>
  );
}
