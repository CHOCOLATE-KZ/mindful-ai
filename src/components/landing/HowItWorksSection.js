"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  MessageCircle,
  NotebookPen,
  BarChart3,
  LineChart,
  Wind,
  ShieldCheck,
  Languages,
  Zap,
  Bot,
  ArrowRight,
} from "lucide-react";
import SectionLabel from "@/components/landing/SectionLabel";

export default function HowItWorksSection() {
  const steps = [
    {
      title: "Поговори с AI",
      desc: "Обсуди то, что волнует. AI выслушает с пониманием и предложит мягкую поддержку.",
      icon: <MessageCircle className="h-6 w-6" />,
    },
    {
      title: "Запиши заметку",
      desc: "Зафиксируй настроение, сон и состояние. Это основа для анализа.",
      icon: <NotebookPen className="h-5 w-5 text-[#4a7a70]" />,
    },
    {
      title: "Получи анализ",
      desc: "AI проанализирует твои данные и даст персональные рекомендации.",
      icon: <BarChart3 className="h-5 w-5 text-[#4a7a70]" />,
    },
    {
      title: "Видь прогресс",
      desc: "Смотри графики, статистику и отслеживай улучшения со временем.",
      icon: <LineChart className="h-5 w-5 text-[#4a7a70]" />,
    },
    {
      title: "Практикуй техники",
      desc: "Дыхательные упражнения и короткие практики для лучшего самочувствия.",
      icon: <Wind className="h-5 w-5 text-[#4a7a70]" />,
    },
  ];

  const trustItems = [
    { icon: ShieldCheck, text: "Конфиденциально" },
    { icon: Languages, text: "AI на русском языке" },
    { icon: Zap, text: "Легко начать" },
    { icon: Bot, text: "Telegram 24/7" },
  ];

  return (
    <section id="how-it-works" className="relative overflow-hidden bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#74AA9C]/30 bg-[#74AA9C]/10 px-3 py-1"
        >
          <SectionLabel className="!tracking-[0.14em]">Как это работает</SectionLabel>
        </motion.div>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-[#10211f] md:text-4xl">
              Пять шагов к поддержке и самопознанию
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-black/70">
              Простой поток: от разговора с ассистентом до заметок, анализа и практик. Каждый
              этап рассчитан на комфорт и бережный темп.
            </p>

            <Link
              href="/auth/sign-in"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#74AA9C] px-6 py-3 font-semibold text-white shadow-[0_14px_34px_rgba(116,170,156,0.28)] transition hover:brightness-105"
            >
              Войти через Telegram
              <ArrowRight className="h-4 w-4" />
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-10 grid gap-3 sm:grid-cols-2"
            >
              {trustItems.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 rounded-xl border border-[#74AA9C]/15 bg-[#f7fbf9] p-4 transition hover:shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#74AA9C]/10">
                    <Icon className="h-5 w-5 text-[#5d9088]" />
                  </div>
                  <span className="font-medium text-[#10211f]">{text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl bg-[#74AA9C] p-8 text-white shadow-xl"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                  {steps[0].icon}
                </div>
                <span className="text-sm font-semibold text-white/80">01</span>
              </div>
              <h3 className="text-2xl font-bold">{steps[0].title}</h3>
              <p className="mt-2 text-white/90">{steps[0].desc}</p>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {steps.slice(1).map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i + 1) * 0.1, duration: 0.45 }}
                  className="rounded-2xl border border-[#74AA9C]/12 bg-white p-5 transition hover:border-[#74AA9C]/25 hover:bg-[#f7fbf9]"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#74AA9C]/10">
                      {step.icon}
                    </div>
                    <span className="text-xs font-semibold text-[#5d9088]">
                      {String(i + 2).padStart(2, "0")}
                    </span>
                  </div>
                  <h4 className="font-semibold text-[#10211f]">{step.title}</h4>
                  <p className="mt-1 text-sm text-black/65">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
