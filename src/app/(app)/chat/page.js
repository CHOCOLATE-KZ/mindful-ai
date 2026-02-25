"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";

import ChatHeader from "./_components/ChatHeader";
import ChatMessages from "./_components/ChatMessages";
import ChatComposer from "./_components/ChatComposer";

import { useOutsideClick } from "./_hooks/useOutsideClick";
import { useVoiceInput } from "./_hooks/useVoiceInput";

export default function ChatPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [atBottom, setAtBottom] = useState(true);

  // ✅ реф на скролл-контейнер
  const scrollRef = useRef(null);

  // menu
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useOutsideClick(menuRef, () => setMenuOpen(false), menuOpen);

  // voice
  const voice = useVoiceInput({ lang: "ru-RU", autoStopMs: 8000 });

  useEffect(() => {
    if (voice.listening) setInput(voice.voiceText);
  }, [voice.voiceText, voice.listening]);

  // отслеживаем позицию скролла
  useEffect(() => {
    const el = scrollRef?.current;
    if (!el) return;

    const onScroll = () => {
      const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
      setAtBottom(gap < 80);
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const getUserId = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || null;
  }, [supabase]);

  useEffect(() => {
    let active = true;
    (async () => {
      const uid = await getUserId();
      if (!uid) {
        if (active) setMessages([]);
        return;
      }

      const { data, error } = await supabase
        .from("ai_messages")
        .select("role, content, created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: true })
        .limit(50);

      if (!active) return;

      if (!error) setMessages(data || []);
      else console.error("history error:", error);
    })();

    return () => {
      active = false;
    };
  }, [supabase, getUserId]);

  const clearChatHistory = useCallback(async () => {
    const uid = await getUserId();
    if (!uid) return;

    const ok = confirm("Очистить историю чата? Это действие нельзя отменить.");
    if (!ok) return;

    const { error } = await supabase.from("ai_messages").delete().eq("user_id", uid);
    if (error) {
      console.error(error);
      alert("Не удалось очистить чат");
      return;
    }
    setMessages([]);
    setMenuOpen(false);
  }, [getUserId, supabase]);

  const exportMyData = useCallback(async () => {
    const res = await fetch("/api/export", { method: "GET", credentials: "include" });
    if (!res.ok) {
      alert("Не удалось экспортировать данные");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mindfulai-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setMenuOpen(false);
  }, []);

  async function send(e) {
    e?.preventDefault?.();
    if (!input.trim() || loading) return;

    const text = input.trim();
    setInput("");
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
        {
          role: "assistant",
          content: "Извини, что-то пошло не так. Попробуй ещё раз.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-white text-slate-900">
      {/* фон */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-slate-100" />
        <div className="absolute -top-56 -right-56 h-[620px] w-[620px] rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute top-1/3 -left-56 h-[620px] w-[620px] rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-[-260px] left-1/2 h-[680px] w-[680px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <ChatHeader
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        menuRef={menuRef}
        exportMyData={exportMyData}
        clearChatHistory={clearChatHistory}
      />

      {/* ✅ ref сюда + чуть больше pb, чтобы низ не лип */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-36">
        <ChatMessages messages={messages} loading={loading} atBottom={atBottom} />
      </div>

      <ChatComposer input={input} setInput={setInput} onSend={send} loading={loading} voice={voice} />

      <button
        type="button"
        onClick={() => {
          const el = scrollRef.current;
          if (el) el.scrollTo({ top: atBottom ? 0 : el.scrollHeight, behavior: "smooth" });
        }}
        className="fixed right-6 bottom-28 z-45 h-11 w-11 rounded-full bg-white/90 backdrop-blur shadow-md ring-1 ring-black/10 grid place-items-center hover:bg-white transition"
        aria-label={atBottom ? "Scroll to top" : "Scroll to bottom"}
        title={atBottom ? "Наверх" : "Вниз"}
      >
        {atBottom ? (
          <ArrowUp className="h-5 w-5 text-slate-700" />
        ) : (
          <ArrowDown className="h-5 w-5 text-slate-700" />
        )}
      </button>
    </div>
  );
}
