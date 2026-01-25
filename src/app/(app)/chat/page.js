"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

import ChatHeader from "./_components/ChatHeader";
import NextbotFrame from "./_components/NextbotFrame";
import ChatMessages from "./_components/ChatMessages";
import ChatComposer from "./_components/ChatComposer";

import { useOutsideClick } from "./_hooks/useOutsideClick";
import { useNextbotSrc } from "./_hooks/useNextbotSrc";
import { useVoiceInput } from "./_hooks/useVoiceInput";

export default function ChatPage() {
  const supabase = supabaseBrowser();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState("native"); // native | nextbot

  // menu
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useOutsideClick(menuRef, () => setMenuOpen(false), menuOpen);

  // nextbot src
  const NEXTBOT_IFRAME_SRC = useNextbotSrc();

  // voice
  const voice = useVoiceInput({ lang: "ru-RU", autoStopMs: 8000 });

  // подтягиваем voiceText в input (live preview)
  useEffect(() => {
    if (voice.listening) setInput(voice.voiceText);
  }, [voice.voiceText, voice.listening]);

  // load history
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

  const getUserId = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || null;
  }, [supabase]);

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

      setMessages((m) => [...m, { role: "assistant", content: data.reply, created_at: new Date().toISOString() }]);
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
    <div className="min-h-dvh flex flex-col
  bg-gradient-to-b from-[#E8E0FF] via-[#EAF2FF] to-[#FFDCC8]
  dark:from-[#0B0B12] dark:via-[#0B1220] dark:to-[#120B10]">
      <ChatHeader
        mode={mode}
        setMode={setMode}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        menuRef={menuRef}
        exportMyData={exportMyData}
        clearChatHistory={clearChatHistory}
      />

      {mode === "nextbot" ? (
        <NextbotFrame src={NEXTBOT_IFRAME_SRC} />
      ) : (
        <>
          {/* важно: flex-1 + overflow + pb под фиксированный инпут */}
          <div className="flex-1 overflow-y-auto pb-28">
            <ChatMessages messages={messages} loading={loading} />
          </div>

          {/* composer теперь fixed */}
          <ChatComposer input={input} setInput={setInput} onSend={send} loading={loading} voice={voice} />
        </>
      )}
    </div>
  );

}
