"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MessageCircle, NotebookPen, BarChart3, LineChart, Wind, ShieldCheck, Languages, Zap, Bot } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      title: "Поговори с AI",
      desc: "Обсуди то, что волнует. AI выслушает с пониманием и предложит мягкую поддержку.",
      icon: <MessageCircle className="h-6 w-6" />,
      isMain: true,
    },
    {
      title: "Запиши заметку",
      desc: "Зафиксируй настроение, сон и состояние. Это основа для анализа.",
      icon: <NotebookPen className="h-5 w-5 text-blue-700" />,
    },
    {
      title: "Получи анализ",
      desc: "AI проанализирует твои данные и даст персональные рекомендации.",
      icon: <BarChart3 className="h-5 w-5 text-blue-700" />,
    },
    {
      title: "Видь прогресс",
      desc: "Смотри графики, статистику и отслеживай улучшения со временем.",
      icon: <LineChart className="h-5 w-5 text-blue-700" />,
    },
    {
      title: "Практикуй техники",
      desc: "Используй дыхательные упражнения, медитацию и йогу для лучшего самочувствия.",
      icon: <Wind className="h-5 w-5 text-blue-700" />,
    },
  ];

  return (
    <section className="relative bg-white py-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        {/* Лейбл */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#74AA9C]/30 bg-[#74AA9C]/10 mb-8"
        >
          <span className="text-sm font-medium text-[#74AA9C]">КАК ЭТО РАБОТАЕТ</span>
        </motion.div>

        {/* Блок заголовка и контента */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Левая часть - текст */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-black mb-4">
              Простой поток от запроса до результата
            </h2>
            <p className="text-lg text-black mb-8 leading-relaxed">
              Четыре шага к поддержке и самопознанию. Каждый этап разработан для максимального комфорта и эффективности.
            </p>

            <Link href="/signup">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#74AA9C] text-white font-semibold hover:bg-blue-600 transition-colors">
                Начать сейчас
                <span>→</span>
              </button>
            </Link>

            {/* Особенности */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-12 space-y-3"
            >
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-blue-100 hover:shadow-md transition-shadow">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-lg">
                  <ShieldCheck className="h-5 w-5 text-blue-700" />
                </div>
                <span className="text-black font-medium">100% конфиденциально</span>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-blue-100 hover:shadow-md transition-shadow">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-lg">
                  <Languages className="h-5 w-5 text-blue-700" />
                </div>
                <span className="text-black font-medium">AI на русском языке</span>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-blue-100 hover:shadow-md transition-shadow">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-lg">
                  <Zap className="h-5 w-5 text-blue-700" />
                </div>
                <span className="text-black font-medium">Легко начать, просто использовать</span>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-blue-100 hover:shadow-md transition-shadow">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-lg">
                  <Bot className="h-5 w-5 text-blue-700" />
                </div>
                <span className="text-black font-medium">24/7 поддержка в Telegram</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Правая часть - карточки */}
          <div className="space-y-4">
            {/* Основная карточка (главный шаг) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl bg-[#74AA9C] p-8 text-white shadow-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-2xl">
                  {steps[0].icon}
                </div>
                <span className="text-sm font-semibold text-white/80">01</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">{steps[0].title}</h3>
              <p className="text-white/90">{steps[0].desc}</p>
            </motion.div>

            {/* Сетка остальных карточек */}
            <div className="grid grid-cols-2 gap-4">
              {steps.slice(1).map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i + 1) * 0.15, duration: 0.5 }}
                  className="rounded-2xl bg-white border border-blue-100 p-6 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-xl">
                      {step.icon}
                    </div>
                    <span className="text-xs font-semibold text-[#74AA9C]">0{i + 2}</span>
                  </div>
                  <h4 className="font-semibold text-black mb-1">{step.title}</h4>
                  <p className="text-sm text-black">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
