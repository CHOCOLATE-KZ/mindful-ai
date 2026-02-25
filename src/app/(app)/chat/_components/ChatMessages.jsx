"use client";
import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatMessages({ messages, loading, atBottom }) {
  const endRef = useRef(null);

  // авто-скролл при новых сообщениях (как у тебя было)
  useEffect(() => {
    if (!atBottom) return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, atBottom]);

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
                  <Image
                    src="/gradient-logo.png"
                    alt="MindfulAI"
                    width={24}
                    height={24}
                  />
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
              <Image
                src="/gradient-logo.png"
                alt="MindfulAI"
                width={24}
                height={24}
              />
            </div>
            <div className="bg-white/90 rounded-3xl px-5 py-3 shadow-sm ring-1 ring-black/5 text-slate-700">
              Думаю…
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
}
