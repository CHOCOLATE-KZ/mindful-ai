"use client";

import { useRef, useState } from "react";
import Footer from "@/components/landing/Footer";
import LiquidGlassCard from "@/components/LiquidGlassCard";
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
      setMsg("Сообщение отправлено "); // тихо “успешно” для бота
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

      setMsg("Сообщение отправлено ");
      formRef.current?.reset(); //  фикс твоего reset бага
    } catch (err) {
      setMsg(err?.message || "Ошибка отправки");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-slate-900 -mt-[4.5rem] pt-[4.5rem]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#74AA9C]/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#74AA9C]/15 blur-3xl" />
        <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-[#74AA9C]/20 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-5xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-[#74AA9C]">
            MindfulAI
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Контакты
          </h1>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            Напишите нам — мы ответим на вашу почту.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <LiquidGlassCard className="w-full max-w-2xl border border-white/60 bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-10">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
              {/* Honeypot (скрытое поле против ботов) */}
              <input
                name="company"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
              />

              <div className="grid gap-2">
                <Label className="text-sm text-slate-700">Имя</Label>
                <Input
                  name="name"
                  required
                  placeholder="Ваше имя"
                  className="border-slate-200/80 bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-sm text-slate-700">Email</Label>
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="border-slate-200/80 bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-sm text-slate-700">Сообщение</Label>
                <textarea
                  name="message"
                  required
                  rows={6}
                  placeholder="Опишите ваш вопрос"
                  className="w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-slate-900 outline-none transition focus:ring-2 focus:ring-[#74AA9C]/40"
                />
              </div>

              {msg && (
                <p className={`text-sm ${msg.toLowerCase().includes("отправлено") ? "text-emerald-600" : "text-rose-600"}`}>
                  {msg}
                </p>
              )}

              {/* Кнопка как в проекте */}
              <button
                type="submit"
                disabled={loading}
                className="group inline-flex h-12 w-full items-center justify-center rounded-2xl bg-blue-600 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(56,189,248,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(37,99,235,0.25)] disabled:translate-y-0 disabled:opacity-60"
              >
                {loading ? "Отправляем..." : "Отправить"}
              </button>

              <p className="pt-1 text-center text-xs text-slate-500">
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
