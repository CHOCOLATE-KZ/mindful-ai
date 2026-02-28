"use client";

import { useState, useEffect } from "react";
import { psychologyFacts } from "@/data/psychologyFacts";

export default function PsychologyFactCard() {
  const [fact, setFact] = useState(psychologyFacts[0]);
  const [mounted, setMounted] = useState(false);

  // Инициализируем случайный факт только на клиенте после монтирования
  useEffect(() => {
    if (!mounted) {
      const randomFact = psychologyFacts[Math.floor(Math.random() * psychologyFacts.length)];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFact(randomFact);
      setMounted(true);
    }
  }, [mounted]);

  const getNextFact = () => {
    const randomFact = psychologyFacts[Math.floor(Math.random() * psychologyFacts.length)];
    setFact(randomFact);
  };

  if (!fact) return null;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
      {/* Gradient Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${fact.color} opacity-5 group-hover:opacity-10 transition-opacity`}
      />

      {/* Category Badge */}
      <div className="relative flex items-center justify-between mb-4">
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
          {fact.category}
        </span>
        <span className="text-3xl">{fact.icon}</span>
      </div>

      {/* Title */}
      <h3 className="relative text-xl font-bold text-gray-900 mb-3">
        {fact.title}
      </h3>

      {/* Fact Text */}
      <p className="relative text-gray-700 leading-relaxed mb-4">
        {fact.fact}
      </p>

      {/* Source */}
      <div className="relative flex items-center justify-between pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 italic">
          Источник: {fact.source}
        </p>
        <button
          onClick={getNextFact}
          className="px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Следующий →
        </button>
      </div>
    </div>
  );
}
