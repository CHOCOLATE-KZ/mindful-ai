"use client";

import { useEffect, useState, useRef } from "react";
import Card from "../ui/Card";
import { motion, useInView, useMotionValue, useTransform } from "framer-motion";

const STATS = [
  {
    label: "Люди, сталкивающиеся с признаками депрессивных состояний",
    value: 28,
    color: "#6366F1",
  },
  {
    label: "Подростки с выраженной тревожностью",
    value: 16,
    color: "#EC4899",
  },
  {
    label: "Школьники, сообщающие о случаях буллинга",
    value: 17,
    color: "#3B82F6",
  },
];

export default function DemoSection() {
  const bgRef = useRef(null);
  const scrollY = useMotionValue(0);
  const yTransform = useTransform(scrollY, [0, 500], [0, 80]); // параллакс движение

  useEffect(() => {
    const handleScroll = () => scrollY.set(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollY]);

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Параллакс фон */}
      <motion.div
        ref={bgRef}
        style={{ y: yTransform }}
        className="absolute top-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-200/30 blur-3xl -z-10"
      />

      <div className="mx-auto max-w-5xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-semibold text-gray-900 text-center tracking-tight"
        >
          Психологическое состояние общества
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mt-3 text-gray-600 text-center max-w-2xl mx-auto"
        >
          Данные подчёркивают важность своевременной психологической поддержки
        </motion.p>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {STATS.map((stat, i) => (
            <StatCard key={i} stat={stat} delay={i * 0.2} />
          ))}
        </div>

        {/* Источники */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-16 text-center"
        >
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "120px" }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent mx-auto mb-6"
          />

          <p className="text-xs text-gray-500 max-w-2xl mx-auto leading-relaxed">
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

function StatCard({ stat, delay }) {
  const { label, value, color } = stat;
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 1400;
    const step = Math.max(10, Math.floor(duration / value));

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= value) {
        clearInterval(timer);
        setDone(true);
      }
    }, step);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ rotateX: 6, rotateY: -6 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.7, type: "spring" }}
      className="perspective-[1200px]"
    >
      <Card className="relative p-8 text-center backdrop-blur-xl bg-white/80 border border-gray-100 shadow-xl rounded-3xl overflow-hidden">
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${color}22, transparent 70%)`,
          }}
        />

        <CircleProgress percent={count} color={color} pulse={done} />

        <motion.div
          animate={done ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.4 }}
          className="mt-6 text-4xl font-bold text-gray-900"
        >
          {count}%
        </motion.div>

        <p className="mt-3 text-sm text-gray-600 leading-relaxed">{label}</p>
      </Card>
    </motion.div>
  );
}

function CircleProgress({ percent, color, pulse }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex justify-center">
      <svg width="140" height="140">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="12"
        />

        <motion.circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />

        {pulse && (
          <motion.circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 1.08 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </svg>
    </div>
  );
}
