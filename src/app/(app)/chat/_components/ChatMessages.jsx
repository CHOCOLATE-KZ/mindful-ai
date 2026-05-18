"use client";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { extractAnchors } from "@/lib/utils/extractAnchors";
import CrisisAlert from "./CrisisAlert";
import { motion } from "framer-motion";

export default function ChatMessages({ messages, userAvatarUrl, loading, atBottom, scrollRef, onAnchorSelect, showAnchors = true, hasAmbientBg = false, ambientBg = "none" }) {
  const endRef = useRef(null);
  const prevMessagesLenRef = useRef(messages.length);
  const typingTimerRef = useRef(null);
  const [dismissedCrisis, setDismissedCrisis] = useState(new Set());
  const [typingIndex, setTypingIndex] = useState(null);
  const [typingText, setTypingText] = useState("");

  useEffect(() => {
    const prevLen = prevMessagesLenRef.current;
    const currentLen = messages.length;

    if (currentLen <= prevLen) {
      prevMessagesLenRef.current = currentLen;
      return;
    }

    const lastIndex = currentLen - 1;
    const lastMessage = messages[lastIndex];

    if (!lastMessage || lastMessage.role !== "assistant" || lastMessage.crisis || !lastMessage.content) {
      prevMessagesLenRef.current = currentLen;
      return;
    }

    if (typingTimerRef.current) {
      window.clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    setTypingIndex(lastIndex);
    setTypingText("");

    let cursor = 0;
    const fullText = String(lastMessage.content);
    const step = fullText.length > 800 ? 4 : 3;

    typingTimerRef.current = window.setInterval(() => {
      cursor = Math.min(cursor + step, fullText.length);
      setTypingText(fullText.slice(0, cursor));

      if (cursor >= fullText.length) {
        window.clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    }, 12);

    prevMessagesLenRef.current = currentLen;

    return () => {
      if (typingTimerRef.current) {
        window.clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  }, [messages]);

  // Автоскролл: если пользователь уже у нижней границы, держим ленту внизу на новых сообщениях.
  useEffect(() => {
    const root = scrollRef?.current;

    if (root && root.scrollHeight - root.clientHeight > 1) {
      const gap = root.scrollHeight - root.scrollTop - root.clientHeight;
      const isTypingActive = typingIndex !== null;
      const shouldFollow = gap <= 100 || loading || isTypingActive;
      if (!shouldFollow) return;

      // Keep exact bottom to avoid tiny "snap-up" when user is near the end.
      root.scrollTo({ top: root.scrollHeight - root.clientHeight, behavior: "auto" });
      return;
    }

    endRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [messages, loading, scrollRef, typingText, typingIndex]);

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

  const userBubblePalette = {
    none: "bg-[#74AA9C] ring-[#5d9088]/30",
    rain: "bg-[#355A8A] ring-[#29486F]/35",
    forest: "bg-[#2F6A4F] ring-[#24533D]/35",
    fireplace: "bg-[#8A4F36] ring-[#6A3B28]/35",
    ocean: "bg-[#2C6F7B] ring-[#22545D]/35",
    space: "bg-[#4C4F8A] ring-[#3A3C6A]/35",
    lofi: "bg-[#6A4F8A] ring-[#543E6D]/35",
  };

  const userBubbleTheme = userBubblePalette[ambientBg] || userBubblePalette.none;

  return (
    <>
      {/*  чтобы последние сообщения не липли к composer */}
      <div className="space-y-4 pb-2">
        {messages.map((m, idx) => {
          const isAI = m.role === "assistant";
          const hideAvatars = hasAmbientBg;

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
              {isAI && !hideAvatars && (
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
                      ? hasAmbientBg
                        ? "text-white"
                        : "text-slate-900 dark:text-slate-100"
                      : `rounded-3xl text-white shadow-sm ring-1 ${userBubbleTheme}`
                  }`}
                >
                  <div className={`prose prose-sm max-w-none ${isAI ? (hasAmbientBg ? "prose-invert" : "prose-slate dark:prose-invert") : "prose-invert"}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {isAI && idx === typingIndex ? typingText : m.content}
                    </ReactMarkdown>
                  </div>

                  <p className={`text-xs mt-2 ${isAI ? (hasAmbientBg ? "text-white/70" : "text-slate-400 dark:text-slate-500") : "text-white/70"}`}>
                    {m.created_at
                      ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : ""}
                  </p>
                </div>

                {isAI && anchors.length > 0 && showAnchors && (
                  <div
                    className={`mt-2 rounded-2xl border px-4 py-3 shadow-sm ${
                      hasAmbientBg
                        ? "border-white/20 bg-black/40 backdrop-blur-sm"
                        : "border-black/10 bg-white/70"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`text-xs uppercase tracking-wide shrink-0 ${hasAmbientBg ? "text-white/75" : "text-slate-500"}`}>
                        Якоря разговора
                      </p>
                      {anchors.map((anchor) => (
                        <button
                          key={anchor}
                          type="button"
                          onClick={() => onAnchorSelect?.(anchor)}
                          className={`rounded-full border px-3 py-1 text-xs transition ${
                            hasAmbientBg
                              ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
                              : "border-[#74AA9C]/40 bg-[#74AA9C]/10 text-[#5d9088] hover:bg-[#74AA9C]/20"
                          }`}
                          title="Обсудить тему"
                        >
                          {anchor}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {!isAI && !hideAvatars && (
                <div className="h-10 w-10 rounded-full bg-slate-900/5 ring-1 ring-black/10 overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
            <div className="px-5 py-3 text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>Думаю</span>
              <span className="inline-flex items-end gap-0.5" aria-hidden="true">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms", animationDuration: "1s" }} />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms", animationDuration: "1s" }} />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms", animationDuration: "1s" }} />
              </span>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </>
  );
}
