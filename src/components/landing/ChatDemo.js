"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Improvements:
 * - Fixed card height to prevent page jumping
 * - Scrollable messages area
 * - Fade + slide-in messages
 * - Clickable chips: plays the clicked message as next user turn
 */
export default function ChatDemo() {
  const script = useMemo(
    () => [
      {
        user: "I’ve been feeling overwhelmed lately.",
        bot: "That sounds heavy. Want to try a 30-second breathing reset together?",
        chips: [
          "I’ve been feeling overwhelmed lately.",
          "I want a quick calming technique",
          "I feel anxious today",
        ],
      },
      {
        user: "I want a quick calming technique",
        bot: "Try this: inhale 4 seconds, hold 2, exhale 6. Repeat 4 times. How does your body feel after one round?",
        chips: [
          "I want a quick calming technique",
          "Help me fall asleep",
          "I can’t stop overthinking",
        ],
      },
      {
        user: "I can’t stop overthinking",
        bot: "Let’s name the thought, then test it: What’s the main worry in one sentence? And what evidence supports/doesn’t support it?",
        chips: ["I can’t stop overthinking", "I feel stressed", "I feel sad"],
      },
    ],
    []
  );

  const [step, setStep] = useState(0);
  const [mode, setMode] = useState("nextbot");
  const [messages, setMessages] = useState([
    {
      id: "m0",
      role: "assistant",
      text: "Hi! I’m MindfulAI, your 24/7 supportive assistant. How are you feeling today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const timersRef = useRef([]);
  const isRunningRef = useRef(false);
  const lockRef = useRef(false); // prevents overlapping animations
  const scrollRef = useRef(null);

  function clearTimers() {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }

  // auto scroll to bottom (without resizing card)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const current = script[step % script.length];
  const currentChips = current.chips;

  function pushMessage(role, text) {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, role, text },
    ]);
  }

  function runTurn(userText, botText, nextStep = true) {
    if (lockRef.current) return;
    lockRef.current = true;

    clearTimers();
    setTyping(false);
    setInput("");

    // type into input
    const baseDelay = 24;
    const startDelay = 500;

    timersRef.current.push(
      setTimeout(() => {
        let i = 0;
        const typeNext = () => {
          i++;
          setInput(userText.slice(0, i));
          if (i < userText.length) {
            timersRef.current.push(setTimeout(typeNext, baseDelay));
          } else {
            // "send"
            timersRef.current.push(
              setTimeout(() => {
                pushMessage("user", userText);
                setInput("");

                // assistant typing
                setTyping(true);

                // assistant reply
                timersRef.current.push(
                  setTimeout(() => {
                    setTyping(false);
                    pushMessage("assistant", botText);

                    // move to next scripted step after a pause
                    timersRef.current.push(
                      setTimeout(() => {
                        lockRef.current = false;
                        if (nextStep) {
                          setStep((s) => (s + 1) % script.length);
                        } else {
                          // keep step if chip-driven (optional)
                        }
                      }, 1800)
                    );
                  }, 950)
                );
              }, 220)
            );
          }
        };
        typeNext();
      }, startDelay)
    );
  }

  // start + loop scripted demo
  useEffect(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    runTurn(current.user, current.bot, true);

    return () => clearTimers();
    setActive(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // whenever step changes, run next scripted turn
  useEffect(() => {
    if (!isRunningRef.current) return;

    // keep first greeting + last messages to keep UI clean
    setMessages((prev) => {
      const first = prev[0];
      const tail = prev.slice(-5);
      const cleaned = [first, ...tail.filter((m) => m !== first)];
      return cleaned;
    });

    runTurn(current.user, current.bot, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // chip click -> play that as user message and choose a relevant bot reply
  function onChipClick(text) {
    // choose reply:
    // if chip matches current.user -> use current.bot
    // otherwise pick a reasonable canned response
    const fallbackMap = {
      "Help me fall asleep":
        "Let’s try a gentle wind-down: dim lights, put your phone away for 5 minutes, and do 4 slow breaths. What time do you want to be asleep by?",
      "I feel anxious today":
        "I hear you. If you’re up for it, rate the anxiety from 1–10, and tell me where you feel it in your body (chest, stomach, shoulders).",
      "I feel stressed":
        "That makes sense. What’s the biggest stressor right now: work/school, relationships, health, or uncertainty?",
      "I feel sad":
        "I’m sorry you’re feeling this way. Do you want to talk about what happened today, or would you prefer a small coping step first?",
    };

    const botText =
      text === current.user
        ? current.bot
        : fallbackMap[text] ||
          "Thanks for sharing. Can you tell me a bit more about what’s been going on and what you need most right now?";

    // IMPORTANT: chip should trigger immediately and also reset loop timing
    lockRef.current = false;
    runTurn(text, botText, true);
  }

  return (
    <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-xl h-[620px] overflow-hidden flex flex-col">
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-600 text-white grid place-items-center font-semibold">
            ✦
          </div>
          <div>
            <div className="font-semibold text-black leading-tight">MindfulAI</div>
            <div className="text-sm text-black/50">Calm • Private • Supportive</div>
          </div>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
          Demo
        </span>
      </div>

      {/* FIXED HEIGHT WRAPPER (prevents page jump) */}
      <div className="mt-5 flex-1 min-h-0 flex flex-col">
        {/* messages area (scroll) */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-hidden pr-2 space-y-4" 
        >
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={`flex items-end gap-3 ${
                  isUser ? "justify-end" : "justify-start"
                } chat-fade`}
              >
                {!isUser && (
                  <div className="h-9 w-9 rounded-full bg-blue-100 grid place-items-center text-blue-700 font-semibold shrink-0">
                    ✦
                  </div>
                )}

                <div
                  className={[
                    "max-w-[78%] rounded-2xl px-4 py-3 text-sm md:text-base",
                    isUser
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-black/[0.03] text-black/80 border border-black/10",
                  ].join(" ")}
                >
                  {m.text}
                </div>

                {isUser && (
                  <div className="h-9 w-9 rounded-full bg-orange-200 grid place-items-center font-semibold text-black shrink-0">
                    U
                  </div>
                )}
              </div>
            );
          })}

          {typing && (
            <div className="flex items-end gap-3 justify-start chat-fade">
              <div className="h-9 w-9 rounded-full bg-blue-100 grid place-items-center text-blue-700 font-semibold shrink-0">
                ✦
              </div>
              <div className="rounded-2xl bg-black/[0.03] px-4 py-3 border border-black/10">
                <TypingDots />
              </div>
            </div>
          )}
        </div>

        {/* chips */}
        <div className="mt-4 flex flex-wrap gap-2 shrink-0">
          {currentChips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChipClick(c)}
              className="rounded-full border border-black/10 bg-white px-3 py-1 text-sm text-black/60 transition hover:bg-black/[0.03] hover:text-black/80 active:scale-[0.98]"
            >
              {c}
            </button>
          ))}
        </div>

        {/* input */}
        <div className="mt-4 flex items-center gap-3 shrink-0">
          <div className="flex-1 rounded-2xl border border-black/10 bg-white px-4 py-3 text-black/60 overflow-hidden whitespace-nowrap text-ellipsis">
            {input.length ? input : <span className="text-black/40">Type here…</span>}
            <span className="ml-1 inline-block h-[1.05em] w-[2px] animate-pulse bg-black/30 align-[-2px]" />
          </div>
          <button
            type="button"
            className="h-12 rounded-2xl bg-blue-600 px-5 font-semibold text-white shadow-sm transition hover:opacity-95"
            aria-label="Send"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="h-2 w-2 rounded-full bg-black/40 animate-bounce [animation-delay:-0.2s]" />
      <span className="h-2 w-2 rounded-full bg-black/40 animate-bounce [animation-delay:-0.1s]" />
      <span className="h-2 w-2 rounded-full bg-black/40 animate-bounce" />
    </div>
  );
}
