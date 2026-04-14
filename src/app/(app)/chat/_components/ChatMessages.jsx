"use client";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { extractAnchors } from "@/lib/utils/extractAnchors";
import CrisisAlert from "./CrisisAlert";

export default function ChatMessages({ messages, loading, atBottom, onAnchorSelect }) {
  const endRef = useRef(null);
  const [dismissedCrisis, setDismissedCrisis] = useState(new Set());

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
    <>
      {/*  чтобы последние сообщения не липли к composer */}
      <div className="space-y-4 pb-10">
        {messages.map((m, idx) => {
          const isAI = m.role === "assistant";

          // Кризисное сообщение
          if (isAI && m.crisis && !dismissedCrisis.has(idx)) {
            return (
              <CrisisAlert
                key={idx}
                onDismiss={() => setDismissedCrisis((s) => new Set([...s, idx]))}
              />
            );
          }
          if (isAI && m.crisis) return null;

          const anchors = isAI
            ? (Array.isArray(m.anchors) && m.anchors.length ? m.anchors : extractAnchors(m.content))
            : [];

          return (
            <div key={idx} className={`flex gap-3 ${isAI ? "justify-start" : "justify-end"}`}>
              {isAI && (
                <div className="h-10 w-10 rounded-full bg-[#74AA9C]/15 ring-1 ring-[#74AA9C]/30 flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/white-logo.svg"
                    alt="MindfulAI"
                    width={24}
                    height={24}
                  />
                </div>
              )}

              <div className="max-w-[78%] lg:max-w-[62%]">
                <div
                  className={`rounded-3xl px-5 py-3 shadow-sm ring-1 ${
                    isAI
                      ? "bg-white/90 dark:bg-slate-800 ring-black/5 dark:ring-white/10 text-slate-900 dark:text-slate-100"
                      : "bg-[#74AA9C] text-white ring-[#5d9088]/30"
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

                {isAI && anchors.length > 0 && (
                  <div className="mt-2 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Якоря разговора</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {anchors.map((anchor) => (
                        <button
                          key={anchor}
                          type="button"
                          onClick={() => onAnchorSelect?.(anchor)}
                          className="rounded-full border border-[#74AA9C]/40 bg-[#74AA9C]/10 px-3 py-1 text-xs text-[#5d9088] hover:bg-[#74AA9C]/20 transition"
                          title="Обсудить тему"
                        >
                          {anchor}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
            <div className="h-10 w-10 rounded-full bg-[#74AA9C]/15 ring-1 ring-[#74AA9C]/30 flex items-center justify-center flex-shrink-0">
              <Image
                src="/white-logo.svg"
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
    </>
  );
}
