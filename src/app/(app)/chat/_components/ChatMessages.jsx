"use client";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CrisisAlert from "./CrisisAlert";
import { motion } from "framer-motion";

export default function ChatMessages({
  messages,
  userAvatarUrl,
  loading,
  atBottom,
  scrollRef,
  bottomInset = 180,
  onContinueAfterCrisis,
  onDeclineCrisisTopic,
  hasAmbientBg = false,
  ambientBg = "none",
  hideAvatars = false,
  minimalComposer = false,
}) {
  const endRef = useRef(null);
  const prevMessagesLenRef = useRef(0);
  const historyHydratedRef = useRef(false);
  const typingTimerRef = useRef(null);
  const userPinnedRef = useRef(false);
  const [dismissedCrisis, setDismissedCrisis] = useState(new Set());
  const [typingIndex, setTypingIndex] = useState(null);
  const [typingText, setTypingText] = useState("");

  const scrollToEnd = (behavior = "auto") => {
    const root = scrollRef?.current;
    if (!root || root.scrollHeight - root.clientHeight <= 1) {
      endRef.current?.scrollIntoView({ behavior, block: "end" });
      return;
    }
    root.scrollTo({
      top: root.scrollHeight - root.clientHeight,
      behavior,
    });
  };

  // Следим, ушёл ли пользователь от низа — не перехватываем скролл во время typewriter.
  useEffect(() => {
    const root = scrollRef?.current;
    if (!root) return;

    const onScroll = () => {
      const gap = root.scrollHeight - root.scrollTop - root.clientHeight;
      userPinnedRef.current = gap > 120;
    };

    onScroll();
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  useEffect(() => {
    const prevLen = prevMessagesLenRef.current;
    const currentLen = messages.length;

    // Первая загрузка истории с сервера — без анимации
    if (!historyHydratedRef.current) {
      if (currentLen > 0) {
        historyHydratedRef.current = true;
        prevMessagesLenRef.current = currentLen;
      }
      return;
    }

    if (currentLen <= prevLen) {
      prevMessagesLenRef.current = currentLen;
      return;
    }

    const lastIndex = currentLen - 1;
    const lastMessage = messages[lastIndex];

    if (
      !lastMessage ||
      lastMessage.role !== "assistant" ||
      lastMessage.crisis ||
      lastMessage.isWelcome ||
      !lastMessage.content
    ) {
      prevMessagesLenRef.current = currentLen;
      return;
    }

    if (typingTimerRef.current) {
      window.clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    setTypingIndex(lastIndex);
    setTypingText("");

    const root = scrollRef?.current;
    if (root) {
      const gap = root.scrollHeight - root.scrollTop - root.clientHeight;
      userPinnedRef.current = gap > 120;
    }

    let cursor = 0;
    const fullText = String(lastMessage.content);
    const step = fullText.length > 800 ? 4 : 3;

    typingTimerRef.current = window.setInterval(() => {
      cursor = Math.min(cursor + step, fullText.length);
      setTypingText(fullText.slice(0, cursor));

      if (cursor >= fullText.length) {
        window.clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
        setTypingIndex(null);
        setTypingText("");
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

  // Автоскролл после layout (важно при росте текста typewriter).
  useEffect(() => {
    if (userPinnedRef.current) return;

    const root = scrollRef?.current;
    if (!root) return;

    const gap = root.scrollHeight - root.scrollTop - root.clientHeight;
    const isTyping = typingIndex !== null;
    const shouldFollow = gap <= 160 || loading || isTyping;
    if (!shouldFollow) return;

    const run = () => scrollToEnd("auto");
    run();
    const raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [messages, loading, scrollRef, typingText, typingIndex, bottomInset]);

  useEffect(() => {
    const root = scrollRef?.current;
    const content = endRef.current?.parentElement;
    if (!root || !content) return;

    const ro = new ResizeObserver(() => {
      if (userPinnedRef.current) return;
      const gap = root.scrollHeight - root.scrollTop - root.clientHeight;
      if (gap <= 160) scrollToEnd("auto");
    });

    ro.observe(content);
    return () => ro.disconnect();
  }, [scrollRef, typingIndex]);

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

  const accentPalette = {
    none: { bubble: "bg-[#74AA9C] ring-[#5d9088]/30", avatar: "bg-[#74AA9C] ring-[#5d9088]/40" },
    rain: { bubble: "bg-[#355A8A] ring-[#29486F]/35", avatar: "bg-[#355A8A] ring-[#29486F]/40" },
    forest: { bubble: "bg-[#2F6A4F] ring-[#24533D]/35", avatar: "bg-[#2F6A4F] ring-[#24533D]/40" },
    fireplace: { bubble: "bg-[#8A4F36] ring-[#6A3B28]/35", avatar: "bg-[#8A4F36] ring-[#6A3B28]/40" },
    ocean: { bubble: "bg-[#2C6F7B] ring-[#22545D]/35", avatar: "bg-[#2C6F7B] ring-[#22545D]/40" },
    space: { bubble: "bg-[#4C4F8A] ring-[#3A3C6A]/35", avatar: "bg-[#4C4F8A] ring-[#3A3C6A]/40" },
    lofi: { bubble: "bg-[#6A4F8A] ring-[#543E6D]/35", avatar: "bg-[#6A4F8A] ring-[#543E6D]/40" },
  };

  const accent = accentPalette[ambientBg] || accentPalette.none;
  const userBubbleTheme = accent.bubble;
  const aiAvatarTheme = accent.avatar;

  return (
    <>
      {/*  чтобы последние сообщения не липли к composer */}
      <div className="space-y-4 pb-2">
        {messages.map((m, idx) => {
          const isAI = m.role === "assistant";
          const showAvatars = !hideAvatars;

          // Кризисное сообщение
          if (isAI && m.crisis && !dismissedCrisis.has(idx)) {
            const triggerMessage =
              m.triggerMessage ||
              (idx > 0 && messages[idx - 1]?.role === "user" ? messages[idx - 1].content : "");

            return (
              <CrisisAlert
                key={idx}
                busy={loading}
                onDismiss={() => setDismissedCrisis((s) => new Set([...s, idx]))}
                onContinueTopic={
                  onContinueAfterCrisis && triggerMessage
                    ? () => {
                        setDismissedCrisis((s) => new Set([...s, idx]));
                        void onContinueAfterCrisis(triggerMessage);
                      }
                    : undefined
                }
                onDeclineTopic={
                  onDeclineCrisisTopic
                    ? () => {
                        setDismissedCrisis((s) => new Set([...s, idx]));
                        void onDeclineCrisisTopic(triggerMessage);
                      }
                    : undefined
                }
              />
            );
          }
          if (isAI && m.crisis) return null;

          return (
            <motion.div
              key={idx}
              className={`flex gap-3 ${isAI ? "justify-start" : "justify-end"}`}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 32, duration: 0.32 }}
            >
              {isAI && showAvatars && (
                <div
                  className={`h-10 w-10 rounded-full ring-1 flex items-center justify-center flex-shrink-0 ${aiAvatarTheme}`}
                >
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
                        : "text-slate-900"
                      : `rounded-3xl text-white shadow-sm ring-1 ${userBubbleTheme}`
                  }`}
                >
                  <div className={`prose prose-sm max-w-none ${isAI ? (hasAmbientBg ? "prose-invert" : "prose-slate") : "prose-invert"}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {isAI && idx === typingIndex ? typingText : m.content}
                    </ReactMarkdown>
                  </div>

                  {!minimalComposer && (
                    <p className={`text-xs mt-2 ${isAI ? (hasAmbientBg ? "text-white/70" : "text-slate-400") : "text-white/70"}`}>
                      {m.created_at
                        ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : ""}
                    </p>
                  )}
                </div>
              </div>

              {!isAI && showAvatars && (
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
            {!hideAvatars && (
              <div
                className={`h-10 w-10 rounded-full ring-1 flex items-center justify-center flex-shrink-0 ${aiAvatarTheme}`}
              >
                <Image
                  src="/white-logo.svg"
                  alt="MindfulAI"
                  width={24}
                  height={24}
                />
              </div>
            )}
            <div className="px-5 py-3 text-slate-700 flex items-center gap-1">
              <span>Думаю</span>
              <span className="inline-flex items-end gap-0.5" aria-hidden="true">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms", animationDuration: "1s" }} />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms", animationDuration: "1s" }} />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms", animationDuration: "1s" }} />
              </span>
            </div>
          </div>
        )}

        <div
          ref={endRef}
          aria-hidden
          className="h-px w-full shrink-0"
          style={{ scrollMarginBottom: bottomInset }}
        />
      </div>
    </>
  );
}
