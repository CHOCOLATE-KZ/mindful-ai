"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ChatDemo() {
  const script = useMemo(
    () => [
      {
        user: "В последнее время я чувствую себя перегруженным.",
        bot: "Похоже, это действительно тяжело. Хочешь попробовать 30-секундную дыхательную паузу вместе?",
        chips: [
          "В последнее время я чувствую себя перегруженным.",
          "Мне нужна быстрая техника успокоения",
          "Сегодня я чувствую тревогу",
        ],
      },
      {
        user: "Мне нужна быстрая техника успокоения",
        bot: "Попробуй так: вдох 4 секунды, пауза 2 секунды, выдох 6 секунд. Повтори 4 раза. Как чувствует себя тело после одного круга?",
        chips: [
          "Мне нужна быстрая техника успокоения",
          "Помоги заснуть",
          "Я не могу перестать думать",
        ],
      },
      {
        user: "Я не могу перестать думать",
        bot: "Давай назовём мысль и проверим её: в чём главная тревога одним предложением? И какие есть доказательства «за» и «против»?",
        chips: ["Я не могу перестать думать", "Я чувствую стресс", "Мне грустно"],
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
      text: "Привет! Я MindfulAI — твой поддерживающий помощник 24/7. Как ты себя чувствуешь сегодня?",
    },
  ]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const timersRef = useRef([]);
  const isRunningRef = useRef(false);
  const lockRef = useRef(false);
  const scrollRef = useRef(null);

  const router = useRouter();

  function clearTimers() {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }

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

    const baseDelay = 45;
    const startDelay = 100;

    timersRef.current.push(
      setTimeout(() => {
        let i = 0;
        const typeNext = () => {
          i++;
          setInput(userText.slice(0, i));
          if (i < userText.length) {
            timersRef.current.push(setTimeout(typeNext, baseDelay));
          } else {
            timersRef.current.push(
              setTimeout(() => {
                pushMessage("user", userText);
                setInput("");

                setTyping(true);

                timersRef.current.push(
                  setTimeout(() => {
                    setTyping(false);
                    pushMessage("assistant", botText);

                    timersRef.current.push(
                      setTimeout(() => {
                        lockRef.current = false;
                        if (nextStep) {
                          setStep((s) => (s + 1) % script.length);
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

  useEffect(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    runTurn(current.user, current.bot, true);

    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isRunningRef.current) return;

    setMessages((prev) => {
      const first = prev[0];
      const tail = prev.slice(-5);
      const cleaned = [first, ...tail.filter((m) => m !== first)];
      return cleaned;
    });

    runTurn(current.user, current.bot, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function onChipClick(text) {
    const fallbackMap = {
      "Помоги заснуть":
        "Давай попробуем мягко подготовиться ко сну: приглуши свет, отложи телефон на 5 минут и сделай 4 медленных вдоха. Во сколько ты хочешь уснуть?",
      "Сегодня я чувствую тревогу":
        "Я слышу тебя. Если готов, оцени тревогу по шкале от 1 до 10 и скажи, где ты ощущаешь её в теле (грудь, живот, плечи).",
      "Я чувствую стресс":
        "Это понятно. Что сейчас больше всего напрягает: работа/учёба, отношения, здоровье или неопределённость?",
      "Мне грустно":
        "Мне жаль, что ты так себя чувствуешь. Хочешь рассказать, что произошло сегодня, или сначала сделать небольшой поддерживающий шаг?",
    };

    const botText =
      text === current.user
        ? current.bot
        : fallbackMap[text] ||
          "Спасибо, что поделился. Расскажи, пожалуйста, что сейчас происходит и какая поддержка тебе нужна больше всего.";

    lockRef.current = false;
    runTurn(text, botText, true);
  }

  return (
    <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-xl h-[620px] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-600 text-white grid place-items-center font-semibold">
            ✦
          </div>
          <div>
            <div className="font-semibold text-black leading-tight">MindfulAI</div>
            <div className="text-sm text-black/50">Спокойно • Приватно • С поддержкой</div>
          </div>
        </div>
        <div className="relative group">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700 animate-pulse cursor-default">
            Демо
          </span>

          <div
            className="
              pointer-events-none absolute right-0 top-10 z-20 w-72
              rounded-2xl border border-black/10 bg-white p-3 shadow-xl
              opacity-0 translate-y-1 transition
              group-hover:opacity-100 group-hover:translate-y-0
            "
          >
            <div className="text-sm font-semibold text-black">Демо-диалог</div>
            <div className="mt-1 text-xs leading-relaxed text-black/60">
              Это пример сценария общения (не реальный чат).
              <div className="mt-2 space-y-1">
                <div>• Сообщения воспроизводятся автоматически</div>
                <div>• Быстрые варианты — подсказки для выбора</div>
                <div>• Попробуйте пообщаться с ИИ в разделе &quot;Чат&quot;</div>
              </div>
            </div>

            <div className="absolute -top-1 right-6 h-2 w-2 rotate-45 border-l border-t border-black/10 bg-white" />
          </div>
        </div>
      </div>

      <div className="mt-5 flex-1 min-h-0 flex flex-col">
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
                  <div className="h-9 w-9 rounded-full bg-blue-200 grid place-items-center font-semibold text-blue-800 shrink-0">
                    Я
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

        <div className="mt-4 flex items-center gap-3 shrink-0">
          <div className="flex-1 rounded-2xl border border-black/10 bg-white px-4 py-3 text-black/60 overflow-hidden whitespace-nowrap text-ellipsis">
            {input.length ? input : <span className="text-black/40">Введите текст…</span>}
            <span className="ml-1 inline-block h-[1.05em] w-[2px] animate-pulse bg-black/30 align-[-2px]" />
          </div>
          <button
            type="button"
            onClick={() => router.push("/chat")}
            className="h-12 rounded-2xl bg-blue-600 px-5 font-semibold text-white shadow-sm transition hover:opacity-95"
            aria-label="Перейти в чат"
          >
            Попробовать
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
