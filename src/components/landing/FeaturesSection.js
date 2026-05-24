"use client";

import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import Link from "next/link";
import { ShieldCheck, Brain, ArrowRight, HeartPulse, MessageCircle, BarChart3 } from "lucide-react";
import SectionLabel from "@/components/landing/SectionLabel";
import "./holographic.css";

const cards = [
  {
    title: "Отслеживай своё состояние",
    body: "Фиксируй настроение, сон и мысли — замечай изменения и позитивную динамику.",
    Icon: HeartPulse,
    image: "/psychology_statistics.png",
    tag: "Дневник",
  },
  {
    title: "Поддержка без осуждения",
    body: "Спокойный диалог с ИИ в любой момент — в веб-чате или Telegram.",
    Icon: MessageCircle,
    image: "/phone_mockup.jpg",
    tag: "Чат 24/7",
  },
  {
    title: "Конфиденциально и бережно",
    body: "Твои записи и переписка доступны только тебе. Данные не уходят третьим лицам.",
    Icon: ShieldCheck,
    image: "/mind.png",
    tag: "Приватность",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-16 md:py-20">
      <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
        <div className="flex flex-col gap-6 px-6 pt-10 pb-8 sm:flex-row sm:items-end sm:justify-between md:px-10 lg:px-12">
          <Reveal>
            <div>
              <SectionLabel>Почему MindfulAI</SectionLabel>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#10211f] sm:text-4xl">
                Что делает нас особенными?
              </h2>
              <Link
                href="/chat"
                className="group mt-5 inline-flex items-center gap-2 rounded-full border border-[#74AA9C]/25 bg-white px-5 py-2.5 text-sm font-semibold text-[#10211f] shadow-sm transition hover:bg-[#74AA9C] hover:text-white"
              >
                Попробовать чат
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="max-w-sm text-sm leading-relaxed text-black/60 sm:text-right">
              Приватный чат, персональные рекомендации и ежедневные практики — в одном
              спокойном пространстве для заботы о себе.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-6 px-6 pb-10 sm:grid-cols-3 sm:gap-4 md:px-10 lg:px-12 lg:pb-12">
          {cards.map(({ title, body, Icon, image, tag }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div
                className={[
                  "holographic-card flex h-full flex-col overflow-hidden rounded-2xl bg-[#5d9088] sm:rounded-none",
                  i === 0 ? "sm:rounded-bl-3xl" : "",
                  i === cards.length - 1 ? "sm:rounded-br-3xl" : "",
                ].join(" ")}
              >
                <div className="relative h-32 w-full overflow-hidden sm:h-36">
                  <Image
                    src={image}
                    alt=""
                    fill
                    className="object-cover opacity-90"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#5d9088] via-[#5d9088]/40 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5d9088]">
                    {tag}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white">
                    <Icon size={18} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold leading-snug text-white">{title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/70">{body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 border-t border-black/8 bg-[#f7fbf9] px-6 py-5 text-sm text-black/55">
          <span className="inline-flex items-center gap-2">
            <Brain className="h-4 w-4 text-[#74AA9C]" />
            AI-рекомендации
          </span>
          <span className="inline-flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#74AA9C]" />
            Аналитика недели
          </span>
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#74AA9C]" />
            Конфиденциальность
          </span>
        </div>
      </div>
    </section>
  );
}
