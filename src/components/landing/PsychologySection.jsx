"use client";

import { useState, useEffect } from "react";
import { psychologyFacts, psychologyTips } from "@/data/psychologyFacts";
import Link from "next/link";
import { Brain, Lightbulb, RefreshCw, ArrowRight, BookOpen } from "lucide-react";

export default function PsychologySection() {
  const [fact, setFact] = useState(psychologyFacts[0]);
  const [tip, setTip] = useState(psychologyTips[0]);
  const [mounted, setMounted] = useState(false);

  // Инициализируем случайный факт только на клиенте после монтирования
  useEffect(() => {
    if (!mounted) {
      const randomFact = psychologyFacts[Math.floor(Math.random() * psychologyFacts.length)];
      const randomTip = psychologyTips[Math.floor(Math.random() * psychologyTips.length)];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFact(randomFact);
      setTip(randomTip);
      setMounted(true);
    }
  }, [mounted]);

  const getNewFact = () => {
    const randomFact = psychologyFacts[Math.floor(Math.random() * psychologyFacts.length)];
    setFact(randomFact);
  };

  const getNewTip = () => {
    const randomTip = psychologyTips[Math.floor(Math.random() * psychologyTips.length)];
    setTip(randomTip);
  };

  if (!fact || !tip) return null;

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto rounded-3xl border border-blue-700 bg-blue-600 p-6 shadow-xl sm:p-8 lg:p-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-100 bg-white text-blue-700 font-semibold mb-4">
            <Brain className="w-5 h-5" />
            <span>Научная психология</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Узнайте, как работает ваш разум
          </h2>
          <p className="text-lg text-white/85 max-w-2xl mx-auto">
            Психологические факты и советы от экспертов, основанные на научных исследованиях
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-blue-100 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {fact.category}
              </span>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-black mb-3">{fact.title}</h3>
            <p className="text-black/80 leading-relaxed mb-4">{fact.fact}</p>

            <div className="pt-4 border-t border-blue-100 flex items-center justify-between gap-3">
              <p className="text-xs text-black/70 italic">{fact.source}</p>
              <button
                onClick={getNewFact}
                className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Ещё
              </button>
            </div>
          </article>

          <article className="rounded-2xl border border-blue-100 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-blue-700" />
                <h3 className="text-2xl font-bold text-black">Совет психолога</h3>
              </div>
              <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {tip.category}
              </span>
            </div>

            <p className="text-black/80 leading-relaxed mb-4 text-lg">{tip.tip}</p>

            <div className="pt-4 border-t border-blue-100 flex items-center justify-between gap-3">
              <p className="text-sm text-black/70 italic">- {tip.author}</p>
              <button
                onClick={getNewTip}
                className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Ещё
              </button>
            </div>
          </article>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex flex-col items-center gap-4 rounded-2xl border border-blue-100 bg-white p-6">
            <div className="text-black text-lg font-medium">
              Хотите узнать <span className="font-bold text-blue-700">30+ научных фактов</span> о психологии?
            </div>
            <Link
              href="/psychology"
              className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-blue-700"
            >
              <Brain className="w-6 h-6" />
              <span>Открыть базу знаний</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <p className="text-sm text-black/70">
              Научные исследования, статистика и экспертные советы
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
