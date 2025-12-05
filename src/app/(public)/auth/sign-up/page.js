"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Button from "@/components/ui/Button";
import Link from "next/link";
import AuthFrame from "@/components/AuthFrame";
import LiquidGlassCard from "@/components/LiquidGlassCard";
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

    const next = searchParams.get("next") || "/notes";
    router.replace(next);
  }

  return (
    <AuthFrame>
      <LiquidGlassCard className="w-full max-w-md">
        <h1 className="text-2xl font-semibold">Регистрация</h1>

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-1">
            <Label>Имя</Label>
            <Input name="name" type="text" placeholder="Ильяс" />
          </div>
          <div className="grid gap-1">
            <Label>Email</Label>
            <Input name="email" type="email" required placeholder="you@example.com" />
          </div>
          <div className="grid gap-1">
            <Label>Пароль</Label>
            <Input name="password" type="password" required placeholder="••••••••" />
          </div>

          {!!msg && <p className="text-sm text-rose-600">{msg}</p>}

          <Button className="w-full" disabled={loading}>
            {loading ? "Создаём..." : "Создать аккаунт"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-gray-700/80">
          Уже есть аккаунт? <Link href="/auth/sign-in" className="underline">Войти</Link>
        </p>
      </LiquidGlassCard>
    </AuthFrame>
  );
}
