"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { ArrowDown, ArrowUp, HelpCircle } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { extractAnchors } from "@/lib/utils/extractAnchors";

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
  const [savedNotes, setSavedNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState("");
  const [savingAnchor, setSavingAnchor] = useState("");
  const [showAnchorTooltip, setShowAnchorTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // ✅ реф на скролл-контейнер
  const scrollRef = useRef(null);
  const helpIconRef = useRef(null);

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

  const loadChatNotes = useCallback(async () => {
    setNotesLoading(true);
    setNotesError("");
    try {
      const res = await fetch("/api/chat/notes", { method: "GET", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Notes error");
      setSavedNotes(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error(err);
      setNotesError("Не удалось загрузить заметки");
    } finally {
      setNotesLoading(false);
    }
  }, []);

  const saveChatNote = useCallback(async (anchor) => {
    if (!anchor || savingAnchor) return;
    setSavingAnchor(anchor);
    setNotesError("");
    try {
      const res = await fetch("/api/chat/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: anchor }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Notes save error");
      if (data.item) setSavedNotes((prev) => [data.item, ...prev].slice(0, 20));
    } catch (err) {
      console.error(err);
      setNotesError("Не удалось сохранить заметку");
    } finally {
      setSavingAnchor("");
    }
  }, [savingAnchor]);

  const latestAnchors = useMemo(() => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) return [];
    if (Array.isArray(lastAssistant.anchors) && lastAssistant.anchors.length) return lastAssistant.anchors;
    return extractAnchors(lastAssistant.content);
  }, [messages]);

  const handleHelpIconHover = useCallback(() => {
    if (helpIconRef.current) {
      const rect = helpIconRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + 8,
        left: rect.left - 100,
      });
      setShowAnchorTooltip(true);
    }
  }, []);

  useEffect(() => {
    loadChatNotes();
  }, [loadChatNotes]);

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
        {
          role: "assistant",
          content: data.reply,
          created_at: new Date().toISOString(),
          anchors: Array.isArray(data.anchors) ? data.anchors : [],
        },
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-48">
        {/* Левая панель sticky на lg, внутри скролла */}
        <aside className="mt-20 hidden lg:flex lg:flex-col items-start px-4 py-6 sticky top-0 h-fit pointer-events-none lg:fixed lg:left-4 lg:top-[calc(var(--app-nav-offset)+1rem)]">
          <div className="pointer-events-auto rounded-2xl border border-blue-100/50 bg-gradient-to-b from-blue-50/80 to-white/80 backdrop-blur p-4 shadow-sm ring-1 ring-blue-500/10 w-60 mt-10 max-h-[calc(100dvh-var(--app-nav-offset)-6rem)] overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-xs uppercase tracking-widest font-semibold text-blue-700">
                💭 Якоря
              </div>
              <button
                ref={helpIconRef}
                type="button"
                onMouseEnter={handleHelpIconHover}
                onMouseLeave={() => setShowAnchorTooltip(false)}
                className="inline-flex items-center justify-center text-blue-500 hover:text-blue-700 transition-colors cursor-help"
                aria-label="Что такое якоря?"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-1.5">
              {latestAnchors.length === 0 && (
                <p className="text-xs text-slate-500 py-2">Напиши запрос</p>
              )}
              {latestAnchors.map((anchor) => (
                <div key={anchor} className="group flex items-stretch gap-1.5 bg-white rounded-lg border border-slate-200 hover:border-blue-300 overflow-hidden transition">
                  <button
                    type="button"
                    onClick={() => setInput(`Хочу обсудить: ${anchor}`)}
                    className="flex-1 px-3 py-2 text-xs text-slate-700 text-left hover:text-blue-700 hover:bg-blue-50/50 transition truncate"
                    title={anchor}
                  >
                    {anchor}
                  </button>
                  <button
                    type="button"
                    onClick={() => saveChatNote(anchor)}
                    disabled={savingAnchor === anchor}
                    className="px-2 py-2 border-l border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition disabled:opacity-40 text-xs font-medium"
                    title="Сохранить"
                  >
                    {savingAnchor === anchor ? "…" : "✓"}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-blue-100/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-xs uppercase tracking-widest font-semibold text-slate-700">📝 Заметки</div>
                {savedNotes.length > 0 && (
                  <span className="text-xs font-medium text-white bg-blue-600 rounded-full px-2 py-0.5">{savedNotes.length}</span>
                )}
              </div>
              <div className="space-y-1.5">
                {notesLoading && <p className="text-xs text-slate-500 py-2">Загрузка…</p>}
                {!notesLoading && notesError && (
                  <p className="text-xs text-rose-600 py-2">{notesError}</p>
                )}
                {!notesLoading && !notesError && savedNotes.length === 0 && (
                  <p className="text-xs text-slate-500 py-2">Сохрани ✓</p>
                )}
                {!notesLoading && !notesError && savedNotes.map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => setInput(`Хочу обсудить: ${note.title}`)}
                    className="w-full rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 px-3 py-2 text-left transition group"
                  >
                    <p className="text-xs text-slate-900 group-hover:text-blue-700 truncate font-medium">{note.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {note.created_at
                        ? new Date(note.created_at).toLocaleDateString("ru-RU", {
                            day: "2-digit",
                            month: "short",
                          })
                        : ""}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Основной контент центрирован */}
        <div className="mx-auto max-w-4xl px-4 py-6">
          <main className="w-full">
            <div className="space-y-4 pb-10">
              <ChatMessages
                messages={messages}
                loading={loading}
                atBottom={atBottom}
                onAnchorSelect={(anchor) => setInput(`Хочу обсудить: ${anchor}`)}
              />
            </div>
          </main>
        </div>
      </div>

      <ChatComposer input={input} setInput={setInput} onSend={send} loading={loading} voice={voice} />

      <button
        type="button"
        onClick={() => {
          const el = scrollRef.current;
          if (el) {
            el.scrollTo({ top: atBottom ? 0 : el.scrollHeight, behavior: "smooth" });
          }
        }}
        className="fixed right-8 bottom-56 z-50 h-12 w-12 rounded-full bg-blue-600 text-white shadow-lg ring-1 ring-blue-700/30 grid place-items-center hover:bg-blue-700 transition"
        aria-label={atBottom ? "Scroll to top" : "Scroll to bottom"}
        title={atBottom ? "Наверх" : "Вниз"}
      >
        {atBottom ? (
          <ArrowUp className="h-6 w-6 text-white" />
        ) : (
          <ArrowDown className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Tooltip для якорей - поверх всего */}
      {showAnchorTooltip && (
        <div 
          className="fixed w-72 p-4 bg-gradient-to-br from-white via-blue-50/90 to-white backdrop-blur-xl border border-blue-200/60 rounded-2xl shadow-2xl ring-1 ring-blue-500/20 z-[100] pointer-events-none"
          style={{ top: `${tooltipPosition.top}px`, left: `${tooltipPosition.left}px` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <HelpCircle className="h-4 w-4 text-white" />
            </div>
            <div className="font-bold text-sm text-slate-900">Что такое якоря?</div>
          </div>
          <p className="text-slate-700 text-xs leading-relaxed mb-3 pl-10">
            ИИ автоматически выделяет <span className="font-semibold text-blue-700">ключевые темы</span> из каждого разговора — это помогает структурировать мысли и возвращаться к важным моментам.
          </p>
          <div className="pl-10 space-y-1.5">
            <div className="flex items-start gap-2 text-[11px] text-slate-600">
              <span className="text-blue-600 font-bold">→</span>
              <span>Нажми на якорь, чтобы обсудить глубже</span>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-slate-600">
              <span className="text-blue-600 font-bold">→</span>
              <span>Сохрани <span className="font-semibold text-blue-700">(✓)</span> в заметки для быстрого доступа</span>
            </div>
          </div>
          <div className="absolute -top-2 left-24 w-4 h-4 bg-gradient-to-br from-white to-blue-50 border-l border-t border-blue-200/60 rotate-45"></div>
        </div>
      )}
    </div>
  );
}
