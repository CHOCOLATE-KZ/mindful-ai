"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, HeartPulse, ShieldAlert, Users } from "lucide-react";
import SectionLabel from "@/components/landing/SectionLabel";

const STATS = [
  {
    label: "Люди, сталкивающиеся с признаками депрессивных состояний",
    value: 28,
  },
  {
    label: "Подростки с выраженной тревожностью",
    value: 16,
  },
  {
    label: "Школьники, сообщающие о случаях буллинга",
    value: 17,
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
    <section ref={sectionRef} id="stats" className="relative py-16 md:py-20">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/psychology_statistics.png"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#f7f4ec]/88 backdrop-blur-[1px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#74AA9C]/25 bg-white/90 px-4 py-1.5 text-sm font-semibold text-[#4a7a70] shadow-sm"
        >
          <HeartPulse size={16} className="text-[#74AA9C]" />
          Зачем важно психическое здоровье
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-black/10 bg-white/90 p-7 shadow-lg backdrop-blur-sm"
          >
            <h2 className="text-3xl font-bold leading-tight text-[#10211f] md:text-4xl">
              Психологическое состояние общества
            </h2>
            <p className="mt-4 text-base text-black/65">
              Сводные индикаторы показывают, насколько важна ранняя эмоциональная поддержка
              для подростков и взрослых. В MindfulAI эти данные помогают осознать масштаб
              проблемы и мотивируют заботиться о себе регулярно.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoTile
                title={STATS[1].label}
                value={STATS[1].value}
                icon={<Users size={16} className="text-[#5d9088]" />}
              />
              <InfoTile
                title={STATS[2].label}
                value={STATS[2].value}
                icon={<ShieldAlert size={16} className="text-[#5d9088]" />}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="rounded-3xl border border-[#5d9088] bg-[#74AA9C] p-7 shadow-lg"
          >
            <div className="text-sm font-semibold text-white/85">Ключевой показатель</div>
            <div className="mt-2 text-6xl font-extrabold tracking-tight text-white">
              {heroValue}%
            </div>
            <div className="mt-1 text-sm text-white/85">Группа повышенного внимания</div>

            <div className="mt-6 space-y-3">
              {STATS.map((item, idx) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/15 bg-white/95 p-4"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-black/55">
                    <span>{idx + 1}. Индикатор</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#5d9088]">
                      {item.value}% <ArrowUpRight size={13} />
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium leading-snug text-black/80">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-black/55"
        >
          Источники: обобщённые данные открытых исследований психологического благополучия.
          Показатели приведены в демонстрационных целях для визуализации масштаба проблемы.
        </motion.p>
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
      <div className="mt-2 text-3xl font-bold text-[#5d9088]">{value}%</div>
      <p className="mt-1.5 text-sm leading-snug text-black/75">{title}</p>
    </div>
  );
}
