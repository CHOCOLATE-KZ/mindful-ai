"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, HeartPulse, ShieldAlert, Users, LineChart } from "lucide-react";

const STATS = [
  {
    label: "Люди, сталкивающиеся с признаками депрессивных состояний",
    value: 28,
    color: "#74AA9C",
  },
  {
    label: "Подростки с выраженной тревожностью",
    value: 16,
    color: "#5d9088",
  },
  {
    label: "Школьники, сообщающие о случаях буллинга",
    value: 17,
    color: "#8fc2b9",
  },
];

export default function DemoSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-120px" });
  const [heroValue, setHeroValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const target = STATS[0].value;
    let start = 0;
    const timer = setInterval(() => {
      start += 1;
      setHeroValue(start);
      if (start >= target) clearInterval(timer);
    }, 35);

    return () => clearInterval(timer);
  }, [isInView]);

  return (
    <section ref={sectionRef} className="relative py-20 overflow-hidden bg-white">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="absolute -top-16 right-20 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl -z-10"
      />
      <div className="absolute -bottom-20 left-10 h-80 w-80 rounded-full bg-slate-100 blur-3xl -z-10" />

      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700"
        >
          <HeartPulse size={16} />
          Why Mental Health Matters
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-black/10 bg-white p-7 shadow-lg"
          >
            <h2 className="text-4xl font-bold leading-tight text-black md:text-5xl">
              Психологическое состояние общества
            </h2>
            <p className="mt-4 max-w-xl text-black/65 text-base">
              Сводные индикаторы показывают, насколько важна ранняя эмоциональная поддержка
              для подростков и взрослых. Эти значения используются в приложении как опорный
              контекст для профилактики тревожности, стресса и выгорания.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoTile
                title={STATS[1].label}
                value={STATS[1].value}
                icon={<Users size={16} className="text-blue-700" />}
              />
              <InfoTile
                title={STATS[2].label}
                value={STATS[2].value}
                icon={<ShieldAlert size={16} className="text-blue-700" />}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-black/10 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-black/70">Тренд индикаторов</div>
                <LineChart size={16} className="text-blue-600" />
              </div>
              <div className="mt-3 h-16 rounded-xl bg-white border border-black/10 px-3 py-2 flex items-end gap-2">
                <div className="h-6 w-2 rounded bg-blue-200" />
                <div className="h-10 w-2 rounded bg-blue-400" />
                <div className="h-8 w-2 rounded bg-blue-300" />
                <div className="h-12 w-2 rounded bg-blue-500" />
                <div className="h-11 w-2 rounded bg-blue-600" />
                <div className="h-14 w-2 rounded bg-blue-700" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="rounded-3xl border border-blue-700 bg-blue-600 p-7 shadow-lg"
          >
            <div className="text-sm font-semibold text-white/80">Ключевой показатель</div>
            <div className="mt-2 text-6xl font-extrabold tracking-tight text-white">
              {heroValue}%
            </div>
            <div className="mt-1 text-sm text-white/80">Группа повышенного риска</div>

            <div className="mt-6 space-y-3">
              {STATS.map((item, idx) => (
                <div key={item.label} className="rounded-2xl border border-black/10 bg-white p-4">
                  <div className="flex items-center justify-between gap-2 text-xs text-black/55">
                    <span>{idx + 1}. Индикатор</span>
                    <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                      {item.value}% <ArrowUpRight size={13} />
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-black/80 leading-snug">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-black/70 max-w-2xl mx-auto leading-relaxed">
            Источники: обобщённые данные на основе открытых общественных исследований
            психологического благополучия населения и подростков, опубликованных в СМИ
            и аналитических обзорах. Показатели приведены в демонстрационных целях для
            визуализации масштабов проблемы психического здоровья.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function InfoTile({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <div className="flex items-center justify-between text-xs text-black/55">
        <span>Индикатор</span>
        {icon}
      </div>
      <div className="mt-2 text-3xl font-bold text-blue-600">{value}%</div>
      <p className="mt-1.5 text-sm leading-snug text-black/75">{title}</p>
    </div>
  );
}
