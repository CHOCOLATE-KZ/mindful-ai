"use client";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { extractAnchors } from "@/lib/utils/extractAnchors";
import CrisisAlert from "./CrisisAlert";
import { motion } from "framer-motion";

export default function ChatMessages({ messages, userAvatarUrl, loading, atBottom, scrollRef, onAnchorSelect, showAnchors = true }) {
  const endRef = useRef(null);
  const [dismissedCrisis, setDismissedCrisis] = useState(new Set());

  // Автоскролл: если пользователь уже у нижней границы, держим ленту внизу на новых сообщениях.
  useEffect(() => {
    const root = scrollRef?.current;

    if (root && root.scrollHeight - root.clientHeight > 1) {
      const gap = root.scrollHeight - root.scrollTop - root.clientHeight;
      const shouldFollow = atBottom || gap <= 120;
      if (!shouldFollow) return;

      root.scrollTo({ top: root.scrollHeight, behavior: "smooth" });

      // After smooth animation/layout settles, ensure exact bottom position.
      const settleTimer = window.setTimeout(() => {
        root.scrollTo({ top: root.scrollHeight, behavior: "auto" });
      }, 280);

      return () => {
        window.clearTimeout(settleTimer);
      };

      return;
    }

    if (atBottom) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, loading, scrollRef]);

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
      <div className="space-y-4 pb-2">
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
            <motion.div
              key={idx}
              className={`flex gap-3 ${isAI ? "justify-start" : "justify-end"}`}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 32, duration: 0.32 }}
              layout
            >
              {isAI && (
                <div className="h-10 w-10 rounded-full bg-[#74AA9C] ring-1 ring-[#5d9088]/40 flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/white-logo.svg"
                    alt="MindfulAI"
                    width={24}
                    height={24}
                  />
                </div>
              )}

              <div className={isAI ? "max-w-[90%] lg:max-w-[90%]" : "max-w-[78%] lg:max-w-[62%]"}>
                <div
                  className={`px-5 py-3 ${
                    isAI
                      ? "text-slate-900 dark:text-slate-100"
                      : "rounded-3xl bg-[#74AA9C] text-white shadow-sm ring-1 ring-[#5d9088]/30"
                  }`}
                >
                  <div className={`prose prose-sm max-w-none ${isAI ? "prose-slate dark:prose-invert" : "prose-invert"}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {m.content}
                    </ReactMarkdown>
                  </div>

                  <p className={`text-xs mt-2 ${isAI ? "text-slate-400 dark:text-slate-500" : "text-white/70"}`}>
                    {m.created_at
                      ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : ""}
                  </p>
                </div>

                {isAI && anchors.length > 0 && showAnchors && (
                  <div className="mt-2 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs uppercase tracking-wide text-slate-500 shrink-0">Якоря разговора</p>
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
                <div className="h-10 w-10 rounded-full bg-slate-900/5 ring-1 ring-black/10 overflow-hidden flex-shrink-0">
                  <img
                    src={userAvatarUrl || "/user.png"}
                    alt="User avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </motion.div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="h-10 w-10 rounded-full bg-[#74AA9C] ring-1 ring-[#5d9088]/40 flex items-center justify-center flex-shrink-0">
              <Image
                src="/white-logo.svg"
                alt="MindfulAI"
                width={24}
                height={24}
              />
            </div>
            <div className="px-5 py-3 text-slate-700 dark:text-slate-300">
              Думаю…
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </>
  );
}
