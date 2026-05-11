"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, HeartPulse, ShieldAlert, Users } from "lucide-react";

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
    <section ref={sectionRef} className="relative py-20">
      {/* Background image */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/psychology_statistics.png"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700"
        >
          <HeartPulse size={16} />
          Why Mental Health Matters
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          {/* Text card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-black/10 bg-white/80 backdrop-blur-sm p-7 shadow-lg"
          >
            <h2 className="text-3xl font-bold leading-tight text-black md:text-4xl">
              Психологическое состояние общества
            </h2>
            <p className="mt-4 text-black/65 text-base">
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
          </motion.div>

          {/* Blue stats card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.65, delay: 0.1 }}
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
