"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, ArrowDown, ArrowUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatMessages({ messages, loading, scrollRef }) {
  const endRef = useRef(null);
  const [atBottom, setAtBottom] = useState(true);

  // авто-скролл при новых сообщениях (как у тебя было)
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  // следим, внизу ли пользователь
  useEffect(() => {
    const el = scrollRef?.current;
    if (!el) return;

    const onScroll = () => {
      const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
      setAtBottom(gap < 80); // 80px допуск
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  const scrollToBottom = () => {
    const el = scrollRef?.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  const scrollToTop = () => {
    const el = scrollRef?.current;
    if (!el) return;
    el.scrollTo({ top: 0, behavior: "smooth" });
  };

  const markdownComponents = useMemo(
    () => ({
      code({ inline, children }) {
        return inline ? (
          <code className="rounded bg-slate-900/5 px-1 py-0.5 text-[0.92em]">
            {children}
          </code>
        ) : (
          <pre className="rounded-xl bg-slate-950 p-3 text-slate-100 overflow-x-auto">
            <code>{children}</code>
          </pre>
        );
      },
    }),
    []
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* ✅ чтобы последние сообщения не липли к composer */}
      <div className="space-y-4 pb-10">
        {messages.map((m, idx) => {
          const isAI = m.role === "assistant";

          return (
            <div key={idx} className={`flex gap-3 ${isAI ? "justify-start" : "justify-end"}`}>
              {isAI && (
                <div className="h-10 w-10 rounded-full bg-blue-600/10 ring-1 ring-blue-600/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-blue-700" />
                </div>
              )}

              <div
                className={`max-w-[78%] lg:max-w-[62%] rounded-3xl px-5 py-3 shadow-sm ring-1 ${
                  isAI
                    ? "bg-white/90 ring-black/5 text-slate-900"
                    : "bg-blue-600 text-white ring-blue-700/20"
                }`}
              >
                <div className={`prose prose-sm max-w-none ${isAI ? "prose-slate" : "prose-invert"}`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {m.content}
                  </ReactMarkdown>
                </div>

                <p className={`text-xs mt-2 ${isAI ? "text-slate-500" : "text-white/70"}`}>
                  {m.created_at
                    ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : ""}
                </p>
              </div>

              {!isAI && (
                <div className="h-10 w-10 rounded-full bg-slate-900/5 ring-1 ring-black/10 flex items-center justify-center flex-shrink-0 text-slate-700 font-medium">
                  U
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="h-10 w-10 rounded-full bg-blue-600/10 ring-1 ring-blue-600/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-blue-700" />
            </div>
            <div className="bg-white/90 rounded-3xl px-5 py-3 shadow-sm ring-1 ring-black/5 text-slate-700">
              Думаю…
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* ✅ КНОПКА: если не внизу — показываем "вниз", если внизу — "вверх" */}
      <button
        type="button"
        onClick={atBottom ? scrollToTop : scrollToBottom}
        className="fixed right-6 bottom-28 z-40 h-11 w-11 rounded-full bg-white/90 backdrop-blur shadow-md ring-1 ring-black/10 grid place-items-center hover:bg-white transition"
        aria-label={atBottom ? "Scroll to top" : "Scroll to bottom"}
        title={atBottom ? "Наверх" : "Вниз"}
      >
        {atBottom ? <ArrowUp className="h-5 w-5 text-slate-700" /> : <ArrowDown className="h-5 w-5 text-slate-700" />}
      </button>
    </div>
  );
}
