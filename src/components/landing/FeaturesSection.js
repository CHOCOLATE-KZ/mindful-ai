"use client";

import Reveal from "@/components/ui/Reveal";
import Link from "next/link";
import {
  ShieldCheck,
  Brain,
  Sparkles,
  ArrowRight,
  NotebookPen,
  HeartPulse,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

export default function FeaturesSection() {
  const features = [
    {
      title: "Безопасность с приоритетом приватности",
      subtitle: "Ваши данные остаются защищенными и конфиденциальными.",
      Icon: ShieldCheck,
    },
    {
      title: "Умная память",
      subtitle: "Запоминает то, что действительно важно для вас.",
      Icon: Brain,
    },
    {
      title: "Персональная поддержка",
      subtitle: "Помощь, адаптированная под ваши цели.",
      Icon: Sparkles,
    },
    {
      title: "Ежедневные практики",
      subtitle: "Короткие упражнения для снижения стресса.",
      Icon: HeartPulse,
    },
    {
      title: "Дневник состояния",
      subtitle: "Фиксируйте динамику настроения и сна.",
      Icon: NotebookPen,
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="rounded-3xl border border-blue-700 bg-blue-600 p-6 shadow-xl sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <Reveal>
            <FeatureCollage features={features} />
          </Reveal>

          <div>
            <Reveal delay={0.05}>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <CheckCircle2 size={14} />
                Why Choose MindfulAI
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Когда <span className="text-white">MindfulAI</span> на вашей стороне
              </h2>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
                Откройте безопасный и современный формат психологической поддержки:
                приватный чат, персональные рекомендации, ежедневные практики и трекинг
                состояния в одном месте.
              </p>
            </Reveal>

            <Reveal delay={0.22}>
              <ul className="mt-5 space-y-2 text-sm text-white/90">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 text-white" />
                  Приватность и контроль ваших данных
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 text-white" />
                  Поддержка 24/7 без осуждения
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 text-white" />
                  Практики и аналитика для реальных изменений
                </li>
              </ul>
            </Reveal>

            <Reveal delay={0.28}>
              <Link
                href="/chat"
                className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50"
              >
                Попробовать MindfulAI
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCollage({ features }) {
  const [first, second, third, fourth, fifth] = features;

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        <MainCard feature={first} />
      </motion.div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.06 }}
        >
          <MiniCard feature={second} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <MiniCard feature={third} />
        </motion.div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.14 }}
        >
          <MiniCard feature={fourth} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.18 }}
        >
          <MiniCard feature={fifth} />
        </motion.div>
      </div>
    </div>
  );
}

function MainCard({ feature }) {
  const { title, subtitle, Icon } = feature;

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-6 text-black shadow-2xl">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        <Icon size={21} />
      </div>
      <h3 className="mt-4 text-xl font-semibold leading-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-black/70">{subtitle}</p>
    </div>
  );
}

function MiniCard({ feature }) {
  const { title, subtitle, Icon } = feature;

  return (
    <div className="h-full rounded-2xl border border-black/10 bg-white p-4 shadow-lg">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        <Icon size={18} />
      </div>
      <h3 className="mt-3 text-sm font-semibold leading-tight text-black">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-black/60">{subtitle}</p>
    </div>
  );
}
