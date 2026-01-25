"use client";

import { useRef, useState } from "react";
import Footer from "@/components/landing/Footer";
import LiquidGlassCard from "@/components/LiquidGlassCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";

export default function ContactsPage() {
  const formRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    const form = e.currentTarget;
    const fd = new FormData(form);

    // honeypot: если заполнено — это бот
    const honey = (fd.get("company") || "").toString().trim();
    if (honey) {
      setLoading(false);
      setMsg("Сообщение отправлено ✅"); // тихо “успешно” для бота
      formRef.current?.reset();
      return;
    }

    const payload = {
      name: (fd.get("name") || "").toString().trim(),
      email: (fd.get("email") || "").toString().trim(),
      message: (fd.get("message") || "").toString().trim(),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Send failed");

      setMsg("Сообщение отправлено ✅");
      formRef.current?.reset(); // ✅ фикс твоего reset бага
    } catch (err) {
      setMsg(err?.message || "Ошибка отправки");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-white">
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-black dark:text-black">
            Контакты
          </h1>
          <p className="mt-3 text-black/60 dark:text-black/60">
            Напишите нам — мы ответим на вашу почту.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <LiquidGlassCard className="w-full max-w-2xl">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot (скрытое поле против ботов) */}
              <input
                name="company"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
              />

              <div className="grid gap-1">
                <Label>Имя</Label>
                <Input name="name" required placeholder="Ваше имя" />
              </div>

              <div className="grid gap-1">
                <Label>Email</Label>
                <Input name="email" type="email" required placeholder="you@example.com" />
              </div>

              <div className="grid gap-1">
                <Label>Сообщение</Label>
                <textarea
                  name="message"
                  required
                  rows={6}
                  placeholder="Опишите ваш вопрос"
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              {msg && (
                <p className={`text-sm ${msg.includes("✅") ? "text-emerald-600" : "text-rose-600"}`}>
                  {msg}
                </p>
              )}

              {/* Кнопка как в проекте */}
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold shadow-lg hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Отправляем..." : "Отправить"}
              </button>

              <p className="pt-1 text-center text-xs text-black/40 dark:text-white/40">
                Мы не передаём ваши данные третьим лицам.
              </p>
            </form>
          </LiquidGlassCard>
        </div>
      </main>

      <Footer />
    </div>
  );
}
