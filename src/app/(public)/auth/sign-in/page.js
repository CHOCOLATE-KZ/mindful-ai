"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Button from "@/components/ui/Button";
import AuthFrame from "@/components/AuthFrame";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showTelegramCode, setShowTelegramCode] = useState(false);
  const [telegramCode, setTelegramCode] = useState("");
  const [telegramLoading, setTelegramLoading] = useState(false);
  const supabase = supabaseBrowser();

  function closeTelegramModal() {
    setShowTelegramCode(false);
    setTelegramCode("");
    setTelegramLoading(false);
    setMsg("");
  }

  useEffect(() => {
    if (!showTelegramCode) return;

    function onKeyDown(e) {
      if (e.key === "Escape") {
        closeTelegramModal();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showTelegramCode]);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email")?.toString().trim();
    const password = form.get("password")?.toString();

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    const next = searchParams.get("next") || "/chat";
    router.replace(next && next.startsWith("/") ? next : "/chat");
  }

  async function handleTelegramCode(e) {
    e.preventDefault();
    if (!telegramCode || telegramCode.length !== 6) {
      setMsg("Please enter a 6-digit code");
      return;
    }

    setTelegramLoading(true);
    setMsg("");

    try {
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: telegramCode }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Invalid code');
      }

      // Устанавливаем сессию в Supabase
      if (data.accessToken && data.refreshToken) {
        console.log('Setting session...');
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.accessToken,
          refresh_token: data.refreshToken,
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          throw new Error('Failed to set session');
        }

        console.log('Session set, redirecting...');
      } else {
        throw new Error('No tokens received from server');
      }

      // Перенаправляем
      const next = searchParams.get("next") || "/chat";
      router.replace(next && next.startsWith("/") ? next : "/chat");
    } catch (err) {
      console.error('Login error:', err);
      setMsg(err.message || 'Failed to verify code');
      setTelegramLoading(false);
    }
  }

  return (
    <AuthFrame>
      <div className="w-full max-w-md rounded-3xl border border-gray-200/60 dark:border-white/[0.08] bg-white/80 dark:bg-[rgb(33_33_46)]/80 backdrop-blur-2xl shadow-md shadow-black/10 p-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#74AA9C]">
            MindfulAI
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">Вход</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-white/70">Рады видеть вас снова.</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label className="text-slate-700 dark:text-white/80">Email</Label>
            <Input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="border-slate-200 dark:border-white/20 bg-white dark:bg-white/10 text-gray-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40"
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-slate-700 dark:text-white/80">Пароль</Label>
            <Input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="border-slate-200 dark:border-white/20 bg-white dark:bg-white/10 text-gray-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40"
            />
          </div>

          {!!msg && <p className="text-sm text-rose-600">{msg}</p>}

          <Button
            className="w-full rounded-2xl bg-blue-600 text-white shadow-[0_12px_30px_rgba(116,170,156,0.25)]"
            disabled={loading}
          >
            {loading ? "Входим..." : "Войти"}
          </Button>
        </form>

        <div className="mt-5 flex items-center gap-3 text-xs text-slate-400 dark:text-white/50">
          <span className="h-px w-full bg-slate-200 dark:bg-white/20" />
          <span className="whitespace-nowrap">или</span>
          <span className="h-px w-full bg-slate-200 dark:bg-white/20" />
        </div>

        <div className="mt-4 grid gap-2">
          {/* Telegram Login via Bot */}
          <button
            type="button"
            onClick={() => {
              setMsg("");
              setShowTelegramCode(true);
            }}
            className="w-full rounded-2xl border border-slate-200 bg-gradient-to-r from-[#2AABEE] to-[#229ED9] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.22 15.51 15.99C15.37 16.74 15.09 16.99 14.83 17.02C14.25 17.07 13.81 16.64 13.25 16.27C12.37 15.69 11.87 15.33 11.02 14.77C10.03 14.12 10.67 13.76 11.24 13.18C11.39 13.03 13.95 10.7 14 10.49C14.0069 10.4582 14.006 10.4252 13.9973 10.3938C13.9886 10.3624 13.9724 10.3337 13.95 10.31C13.89 10.26 13.81 10.28 13.74 10.29C13.65 10.31 12.25 11.24 9.52 13.08C9.12 13.35 8.76 13.49 8.44 13.48C8.08 13.47 7.4 13.28 6.89 13.11C6.26 12.91 5.77 12.8 5.81 12.45C5.83 12.27 6.08 12.09 6.55 11.9C9.47 10.63 11.41 9.79 12.38 9.39C15.16 8.23 15.73 8.03 16.11 8.03C16.19 8.03 16.38 8.05 16.5 8.15C16.6 8.23 16.63 8.34 16.64 8.42C16.63 8.48 16.65 8.66 16.64 8.8Z" fill="currentColor"/>
            </svg>
            Log in with Telegram
          </button>
        </div>

        {/* Telegram Code Modal */}
        {showTelegramCode && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeTelegramModal();
              }
            }}
          >
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Enter Telegram Code</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Open{" "}
                    <a
                      href="https://t.me/IITUpsychologyAIbot?start=login"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#74AA9C] underline"
                    >
                      @IITUpsychologyAIbot
                    </a>{" "}
                    to get a 6-digit code
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeTelegramModal}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close modal"
                >
                  <span aria-hidden="true" className="text-lg leading-none">×</span>
                </button>
              </div>

              <form onSubmit={handleTelegramCode} className="space-y-4">
                <div>
                  <Label>6-digit code</Label>
                  <Input
                    type="text"
                    value={telegramCode}
                    onChange={(e) => setTelegramCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="text-center text-2xl tracking-widest"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                {!!msg && <p className="text-sm text-rose-600">{msg}</p>}

                <Button
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-r from-[#2AABEE] to-[#229ED9] text-white"
                  disabled={telegramLoading || telegramCode.length !== 6}
                >
                  {telegramLoading ? "Verifying..." : "Verify & Login"}
                </Button>
              </form>
            </div>
          </div>
        )}

        <p className="mt-4 text-sm text-slate-600 dark:text-white/70">
          Нет аккаунта? <Link href="/auth/sign-up" className="text-[#74AA9C] underline">Создать</Link>
        </p>
      </div>
    </AuthFrame>
  );
}
