"use client";

import { useState, useEffect } from "react";
import { psychologyFacts, psychologyTips } from "@/data/psychologyFacts";
import { Brain, Lightbulb, RefreshCw, ArrowRight } from "lucide-react";
import Link from "next/link";

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
    <section className="relative py-20 px-4 bg-gradient-to-b from-white via-violet-50 to-white overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 font-semibold mb-4">
            <Brain className="w-5 h-5" />
            <span>Научная психология</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Узнайте, как работает ваш разум
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Психологические факты и советы от экспертов, основанные на научных исследованиях
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Psychology Fact Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-xl border-2 border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:-translate-y-2">
            {/* Gradient Background */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${fact.color} opacity-5 group-hover:opacity-10 transition-opacity`}
            />

            {/* Category Badge */}
            <div className="relative flex items-center justify-between mb-4">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                {fact.category}
              </span>
              <span className="text-4xl">{fact.icon}</span>
            </div>

            {/* Title */}
            <h3 className="relative text-2xl font-bold text-gray-900 mb-3">
              {fact.title}
            </h3>

            {/* Fact Text */}
            <p className="relative text-gray-700 leading-relaxed mb-4">
              {fact.fact}
            </p>

            {/* Source */}
            <div className="relative pt-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-xs text-gray-500 italic">
                📚 {fact.source}
              </p>
              <button
                onClick={getNewFact}
                className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Ещё
              </button>
            </div>
          </div>

          {/* Daily Tip Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-8 border-2 border-amber-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-amber-600" />
                <h3 className="text-2xl font-bold text-gray-900">Совет психолога</h3>
              </div>
              <span className="text-4xl">{tip.icon}</span>
            </div>

            {/* Tip Text */}
            <p className="text-gray-800 leading-relaxed mb-4 text-lg">
              {tip.tip}
            </p>

            {/* Author & Category */}
            <div className="flex items-center justify-between pt-4 border-t border-amber-200">
              <div>
                <p className="text-sm text-gray-600 italic mb-1">— {tip.author}</p>
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-amber-200 text-amber-800">
                  {tip.category}
                </span>
              </div>
              <button
                onClick={getNewTip}
                className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-amber-700 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Ещё
              </button>
            </div>
          </div>
        </div>

        {/* CTA to Psychology Page */}
        <div className="text-center">
          <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
            <div className="text-gray-700 text-lg font-medium">
              Хотите узнать <span className="font-bold text-indigo-600">30+ научных фактов</span> о психологии?
            </div>
            <Link
              href="/psychology"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <Brain className="w-6 h-6" />
              <span>Открыть базу знаний</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-sm text-gray-600">
              Научные исследования, статистика и экспертные советы
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
