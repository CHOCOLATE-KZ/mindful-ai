"use client";

import { useState, useEffect } from "react";
import { psychologyTips } from "@/data/psychologyFacts";
import { Lightbulb, RefreshCw } from "lucide-react";

export default function DailyTip() {
  const [tip, setTip] = useState(psychologyTips[0]);
  const [mounted, setMounted] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Инициализируем случайный совет только на клиенте после монтирования
  useEffect(() => {
    if (!mounted) {
      const randomTip = psychologyTips[Math.floor(Math.random() * psychologyTips.length)];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTip(randomTip);
      setMounted(true);
    }
  }, [mounted]);

  const getNewTip = () => {
    setIsShaking(true);
    setTimeout(() => {
      const randomTip = psychologyTips[Math.floor(Math.random() * psychologyTips.length)];
      setTip(randomTip);
      setIsShaking(false);
    }, 300);
  };

  if (!tip) return null;

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 border-2 border-amber-200 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-bold text-gray-900">Совет психолога</h3>
        </div>
        <span className="text-2xl">{tip.icon}</span>
      </div>

      {/* Tip Text */}
      <p className={`text-gray-800 leading-relaxed mb-3 transition-transform ${isShaking ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
        {tip.tip}
      </p>

      {/* Author & Category */}
      <div className="flex items-center justify-between text-sm">
        <div>
          <p className="text-gray-600 italic">— {tip.author}</p>
          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-200 text-amber-800">
            {tip.category}
          </span>
        </div>
        <button
          onClick={getNewTip}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-amber-700 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Ещё
        </button>
      </div>
    </div>
  );
}
