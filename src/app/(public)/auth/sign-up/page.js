"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Button from "@/components/ui/Button";
import Link from "next/link";
import AuthFrame from "@/components/AuthFrame";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const supabase = supabaseBrowser();

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const name = form.get("name")?.toString().trim();
    const email = form.get("email")?.toString().trim();
    const password = form.get("password")?.toString();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    setLoading(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    // Если включено подтверждение email — покажем подсказку
    if (data?.user && !data?.session) {
      setMsg("Подтвердите email по ссылке из письма.");
      return;
    }

    const next = searchParams.get("next") || "/profile";
    router.replace(next && next.startsWith("/") ? next : "/profile");
  }

  return (
    <AuthFrame>
      <div className="w-full max-w-md rounded-3xl border border-gray-200/60 bg-white/80 backdrop-blur-2xl shadow-md shadow-black/10 p-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#74AA9C]">
            MindfulAI
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">Регистрация</h1>
          <p className="mt-2 text-sm text-slate-600">Создайте аккаунт за минуту.</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label className="text-slate-700">Имя</Label>
            <Input
              name="name"
              type="text"
              placeholder="Ваше имя"
              className="border-slate-200 bg-white text-gray-900 placeholder:text-slate-400"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-slate-700">Email</Label>
            <Input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="border-slate-200 bg-white text-gray-900 placeholder:text-slate-400"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-slate-700">Пароль</Label>
            <Input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="border-slate-200 bg-white text-gray-900 placeholder:text-slate-400"
            />
          </div>

          {!!msg && <p className="text-sm text-rose-600">{msg}</p>}

          <Button
            className="w-full rounded-2xl bg-blue-600 text-white shadow-[0_12px_30px_rgba(116,170,156,0.25)]"
            disabled={loading}
          >
            {loading ? "Создаём..." : "Создать аккаунт"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Уже есть аккаунт? <Link href="/auth/sign-in" className="text-[#74AA9C] underline">Войти</Link>
        </p>
      </div>
    </AuthFrame>
  );
}
