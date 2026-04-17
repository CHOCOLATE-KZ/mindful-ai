"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ChatDemo from "@/components/landing/ChatDemo";
import TypingText from "@/components/ui/TypingText";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function HeroSection() {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const emailOk = useMemo(() => {
    const e = email.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }, [email]);

  async function continueWithEmail() {
    setErr("");
    const e = email.trim();
    if (!emailOk) {
      setErr("Введите корректный email.");
      return;
    }

    //  простой и универсальный вариант: перекинуть на sign-up и прокинуть email
    router.push(`/auth/sign-up?email=${encodeURIComponent(e)}`);
  }

  async function oauth(provider) {
    setErr("");
    if (!supabase) {
      setErr("Supabase не настроен: проверь NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    try {
      setBusy(true);

      // Redirect URL после OAuth (подстрой под свой маршрут)
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });

      if (error) setErr(error.message);
    } catch (e) {
      setErr(e?.message || "OAuth ошибка");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="relative overflow-hidden max-h-[700px]">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 lg:pt-5">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-sm text-black/70">
              <span className="h-2 w-2 rounded-full bg-[#74AA9C]" />
              Спокойно • Приватно • С поддержкой
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-black md:text-5xl min-h-[3.4em]">
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

            <p className="mt-4 max-w-xl text-lg text-black/70">
              Обсуждай свои переживания в удобном для тебя темпе — без осуждения.
            </p>

            {/* Email input row */}
            <div className="mt-8 max-w-xl">
              <div className="flex items-center gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") continueWithEmail();
                  }}
                  placeholder="Ваш email"
                  className="h-14 w-full rounded-xl border border-blue-200 bg-white px-4 text-base text-black outline-none ring-0 placeholder:text-black/40 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={continueWithEmail}
                  disabled={!emailOk}
                  className="h-14 w-14 shrink-0 rounded-full border border-blue-200 bg-white text-[#74AA9C] shadow-sm transition hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Продолжить"
                  title={!emailOk ? "Введите корректный email" : "Продолжить"}
                >
                  →
                </button>
              </div>

              {err && (
                <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  **Ошибка:** {err}
                </div>
              )}
            </div>

            <div className="my-6 flex items-center gap-4 max-w-xl">
              <div className="h-px flex-1 bg-black/10" />
              <span className="text-sm text-black/40">или</span>
              <div className="h-px flex-1 bg-black/10" />
            </div>

            {/* Social buttons */}
            <div className="flex max-w-xl flex-col gap-3">
              <button
                type="button"
                onClick={() => oauth("google")}
                disabled={busy}
                className="h-12 w-full rounded-xl bg-[#74AA9C] text-white font-medium shadow-sm transition hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {busy ? "Подключаем..." : "Продолжить с Google"}
              </button>

              <button
                type="button"
                onClick={() => oauth("apple")}
                disabled={busy}
                className="h-12 w-full rounded-xl bg-black text-white font-medium shadow-sm transition hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {busy ? "Подключаем..." : "Продолжить с Apple"}
              </button>

              <div className="pt-2 text-sm text-black/60">
                Уже есть аккаунт?{" "}
                <Link href="/auth/sign-in" className="text-[#74AA9C] hover:underline">
                  Войти
                </Link>
              </div>
            </div>
          </div>

          {/* Right - chat preview */}
          <div className="relative">
            <div className="absolute -inset-10 -z-10 bg-blue-100/50 blur-2xl" />
            <ChatDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
