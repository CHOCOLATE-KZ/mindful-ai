"use client";

import Reveal from "@/components/ui/Reveal";
import Link from "next/link";
import { ShieldCheck, Brain, Sparkles, ArrowRight, HeartPulse } from "lucide-react";

const cards = [
  {
    title: "Рост вашего состояния",
    body: "Отслеживайте эмоциональный прогресс и фиксируйте позитивные изменения каждый день.",
    Icon: HeartPulse,
    highlight: false,
  },
  {
    title: "Всегда рядом, всегда поддержит",
    body: "Поддержка 24/7 без осуждения — получите ответ в любой момент, когда это нужно.",
    Icon: Brain,
    highlight: true,
  },
  {
    title: "100% конфиденциально",
    body: "Ваши данные полностью защищены. Никаких утечек и третьих лиц — только вы и ИИ.",
    Icon: ShieldCheck,
    highlight: false,
  },
];

export default function FeaturesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">

        {/* ── Top row: heading left + description right ── */}
        <div className="flex flex-col gap-6 px-8 pt-10 pb-8 sm:flex-row sm:items-end sm:justify-between lg:px-12">
          <Reveal>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#74AA9C]">
                Why choose MindfulAI
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                Что делает нас<br className="hidden sm:block" /> особенными?
              </h2>
              <Link
                href="/chat"
                className="group mt-5 inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-black hover:text-white"
              >
                Попробовать
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="max-w-sm text-sm leading-relaxed text-black/60 sm:text-right">
              Современный формат психологической поддержки — приватный чат,
              персональные рекомендации и ежедневные практики в одном месте.
            </p>
          </Reveal>
        </div>

        {/* ── Bottom row: 3 dark cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3">
          {cards.map(({ title, body, Icon, highlight }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div
                className={[
                  "flex h-full flex-col justify-between p-7 transition",
                  highlight
                    ? "bg-[#1c2e2b] sm:border-x sm:border-white/10"
                    : "bg-[#233430]",
                  i === 0 ? "sm:rounded-bl-3xl" : "",
                  i === cards.length - 1 ? "sm:rounded-br-3xl" : "",
                ].join(" ")}
              >
                <div>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#74AA9C]/20 text-[#74AA9C]">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-5 text-base font-semibold leading-snug text-white">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{body}</p>
                </div>

                {highlight && (
                  <div className="mt-6">
                    <Sparkles size={16} className="text-[#74AA9C]/60" />
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
