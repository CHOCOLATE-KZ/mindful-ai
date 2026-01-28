"use client";

import { motion } from "framer-motion";

export default function HowItWorksSection() {
  const steps = [
    { title: "Начать диалог", desc: "Короткий ввод — расскажите, что сейчас важно." },
    { title: "Получить поддержку", desc: "AI предлагает мягкие техники и формулировки для практики." },
    { title: "Записать итоги", desc: "Краткие заметки помогут отслеживать настроение." },
  ];

  return (
    <section className="relative bg-gray-50 py-20 overflow-hidden">
      {/* Параллакс фоны */}
      <motion.div
        className="absolute top-0 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-indigo-100/30 blur-3xl -z-10"
        style={{ y: 0 }}
        initial={{ y: 0 }}
        whileInView={{ y: [0, 30] }}
        transition={{ duration: 1.2 }}
      />
      <motion.div
        className="absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-pink-100/20 blur-3xl -z-10"
        style={{ y: 0 }}
        initial={{ y: 0 }}
        whileInView={{ y: [0, -30] }}
        transition={{ duration: 1.5 }}
      />

      <div className="mx-auto max-w-4xl px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-semibold text-gray-900 tracking-tight"
        >
          Как это работает
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mt-3 text-gray-600"
        >
          Простой поток — от запроса до мягкого результата.
        </motion.p>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.6, type: "spring" }}
              whileHover={{ y: -5, scale: 1.03 }}
            >
              <div className="group relative rounded-3xl bg-white/80 p-6 shadow-lg backdrop-blur-xl hover:shadow-2xl transition">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-lg font-semibold">
                  {i + 1}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{s.desc}</p>

                {/* Легкий glow при наведении */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-200/40 via-pink-200/20 to-indigo-200/10 opacity-0 group-hover:opacity-100 transition pointer-events-none"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
