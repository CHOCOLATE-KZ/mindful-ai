"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChatDemo from "@/components/landing/ChatDemo";
import TypingText from "@/components/ui/TypingText";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useAppSettings } from "@/components/AppShell";

export default function HeroSection() {
  const router = useRouter();
  const { user } = useAppSettings();
  const supabase = useMemo(() => supabaseBrowser(), []);
  const codeInputRef = useRef(null);

  const [err, setErr] = useState("");
  const [telegramOpen, setTelegramOpen] = useState(false);
  const [telegramCode, setTelegramCode] = useState("");
  const [telegramLoading, setTelegramLoading] = useState(false);

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "IITUpsychologyAIbot";
  const telegramBotLink = `https://t.me/${botUsername}?start=login`;

  function openTelegramLogin() {
    setErr("");
    setTelegramOpen(true);
    window.open(telegramBotLink, "_blank", "noopener,noreferrer");

    if (codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }

  async function verifyTelegramCode(e) {
    e.preventDefault();
    setErr("");

    if (telegramCode.length !== 6) {
      setErr("Введите 6-значный код из Telegram.");
      return;
    }

    try {
      setTelegramLoading(true);

      const response = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: telegramCode }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Не удалось выполнить вход через Telegram");
      }

      if (!data.accessToken || !data.refreshToken) {
        throw new Error("Сервер не вернул токены сессии");
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.accessToken,
        refresh_token: data.refreshToken,
      });

      if (sessionError) {
        throw new Error("Не удалось установить сессию");
      }

      router.replace("/chat");
    } catch (error) {
      setErr(error?.message || "Ошибка входа через Telegram");
      setTelegramLoading(false);
    }
  }

  function handleCodeChange(value) {
    setTelegramCode(value.replace(/\D/g, "").slice(0, 6));
  }

  return (
    <section className="relative isolate w-full overflow-hidden min-h-[calc(92vh-4.5rem)]">
      <div className="absolute inset-0 -z-20">
        <Image
          src="/wallpaper1gpt.png"
          alt="Спокойный горный пейзаж"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      <div className="absolute inset-0 -z-10 bg-[linear-gradient(105deg,rgba(247,244,236,0.66)_2%,rgba(236,245,242,0.44)_40%,rgba(27,74,67,0.20)_72%,rgba(18,43,39,0.30)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_right,rgba(16,44,39,0.20)_0%,transparent_58%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-[#f7f4ec]/55 via-[#f7f4ec]/20 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[calc(92vh-4.5rem)] w-full max-w-7xl items-start px-4 pt-16 pb-8 lg:pt-30 lg:pb-10">
        <div className="grid w-full items-start gap-8 lg:grid-cols-2">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-sm text-black/70 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#74AA9C]" />
              Спокойно • Приватно • С поддержкой
            </div>

            <h1 className="mt-5 min-h-[2.9em] max-w-xl text-3xl font-semibold tracking-tight text-[#10211f] md:text-4xl lg:text-5xl">
              <span className="block">
                <TypingText
                  texts={[
                    "Почувствуй себя лучше с MindfulAI",
                    "Спокойная поддержка - в любой момент",
                    "Приватно. Бережно. По делу.",
                  ]}
                  speed={45}
                  pause={1200}
                  highlight="AI"
                  highlightClassName="text-[#74AA9C]"
                />
              </span>
            </h1>

            <p className="mt-3 max-w-lg text-base leading-relaxed text-[#17302c]/80 md:text-lg">
              Обсуждай свои переживания в удобном для тебя темпе — без осуждения.
            </p>

            <div className="mt-7 max-w-lg">
              {!user ? (
                <>
                  <button
                    type="button"
                    onClick={openTelegramLogin}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#74AA9C] text-white font-semibold shadow-[0_14px_34px_rgba(116,170,156,0.30)] transition hover:brightness-105"
                  >
                    <Image
                      src="/telegram_green_logo.png"
                      alt=""
                      width={18}
                      height={18}
                      className="h-[18px] w-[18px]"
                      aria-hidden="true"
                    />
                    Войти через Telegram
                  </button>

                  <p className="mt-3 text-sm text-[#17302c]/70">
                    Мы отправим код безопасности в чат-бот. Это быстро и анонимно.
                  </p>

                  {telegramOpen && (
                    <form onSubmit={verifyTelegramCode} className="mt-4 rounded-2xl border border-white/50 bg-white/35 p-4 backdrop-blur-xl">
                      <div className="mb-2 text-xs uppercase tracking-[0.18em] text-[#17302c]/55">
                        Код из Telegram
                      </div>

                      <input
                        ref={codeInputRef}
                        value={telegramCode}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        className="sr-only"
                        aria-label="Код Telegram"
                      />

                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => codeInputRef.current?.focus()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") codeInputRef.current?.focus();
                        }}
                        className="grid grid-cols-6 gap-2"
                      >
                        {Array.from({ length: 6 }).map((_, index) => (
                          <div
                            key={index}
                            className="h-12 rounded-xl border border-white/60 bg-white/65 text-center text-lg font-semibold leading-[3rem] text-[#17302c] shadow-sm"
                          >
                            {telegramCode[index] || ""}
                          </div>
                        ))}
                      </div>

                      <button
                        type="submit"
                        disabled={telegramLoading || telegramCode.length !== 6}
                        className="mt-4 h-11 w-full rounded-xl bg-[#10211f] text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {telegramLoading ? "Проверяем..." : "Подтвердить и войти"}
                      </button>
                    </form>
                  )}
                </>
              ) : (
                <div className="rounded-2xl border border-white/55 bg-white/35 p-4 backdrop-blur-xl">
                  <p className="text-sm text-[#17302c]/75">Вы уже вошли в аккаунт.</p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => router.push("/chat")}
                      className="h-11 flex-1 rounded-xl bg-[#74AA9C] px-4 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(116,170,156,0.30)] transition hover:brightness-105"
                    >
                      Перейти в чат
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/profile")}
                      className="h-11 flex-1 rounded-xl border border-white/70 bg-white/70 px-4 text-sm font-semibold text-[#17302c] transition hover:bg-white"
                    >
                      Открыть профиль
                    </button>
                  </div>
                </div>
              )}

              {err && (
                <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50/95 px-3 py-2 text-sm text-rose-700 backdrop-blur-sm">
                  Ошибка: {err}
                </div>
              )}
            </div>
          </div>

          {/* Right - chat preview */}
          <div className="relative w-full max-w-[620px] lg:justify-self-end">
            <div className="absolute -inset-10 -z-10 rounded-[2rem] bg-[#d7ebe4]/45 blur-3xl" />
            <div className="rounded-[2rem] border border-white/45 bg-white/24 p-2.5 shadow-[0_30px_80px_rgba(33,67,61,0.16)] backdrop-blur-xl">
              <ChatDemo />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
