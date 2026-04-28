"use client";

import Reveal from "@/components/ui/Reveal";
import Link from "next/link";
import { ShieldCheck, Brain, Sparkles, ArrowRight, HeartPulse } from "lucide-react";
import "./holographic.css";

const cards = [
  {
    title: "Рост вашего состояния",
    body: "Отслеживайте эмоциональный прогресс и фиксируйте позитивные изменения каждый день.",
    Icon: HeartPulse,
    image: "https://ast.ru/upload/resize_cache/iblock/4cb/lw2v00kwv1o2e50wk01blhy332tssk2w/600_315_2/psycho_1200.jpg",
  },
  {
    title: "Всегда рядом, всегда поддержит",
    body: "Поддержка 24/7 без осуждения — получите ответ в любой момент, когда это нужно.",
    Icon: Brain,
    image: "https://today.troy.edu/wp-content/uploads/2021/02/Psychology-Illustration_byMaddie.jpeg",
  },
  {
    title: "100% конфиденциально",
    body: "Ваши данные полностью защищены. Никаких утечек и третьих лиц — только вы и ИИ.",
    Icon: ShieldCheck,
    image: "https://cdn.sanity.io/images/bl383u0v/production/a0c9e9ed8a5a5e76040db8ac735e76adb7c661cc-8000x4000.jpg?w=412&h=206&q=80&fit=max&auto=format&dpr=2.625",
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-12 gap-y-8 px-12 pb-12">
          {cards.map(({ title, body, Icon, image }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div
                className={["holographic-card flex h-full flex-col justify-between p-4 sm:p-5 transition bg-[#74AA9C] sm:border-x sm:border-white/10",
                  i === 0 ? "sm:rounded-bl-3xl" : "",
                  i === cards.length - 1 ? "sm:rounded-br-3xl" : "",
                ].join(" ")}
              >
                {/* Картинка над карточкой */}
                <div className="w-full flex justify-center mb-4">
                  <img
                    src={image}
                    alt={title}
                    style={{ width: "100%", maxHeight: 120, objectFit: "cover", borderRadius: 12 }}
                  />
                </div>
                <div>
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#74AA9C]/20 text-[#74AA9C]">
                    <Icon size={16} />
                  </div>
                  <h3 className="mt-5 text-base font-semibold leading-snug text-white">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{body}</p>
                </div>

                {/* убран Sparkles */}
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
