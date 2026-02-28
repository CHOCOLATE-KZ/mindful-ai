"use client";

import { useState, useEffect } from "react";
import { psychologyQuotes } from "@/data/psychologyFacts";
import { Quote } from "lucide-react";

export default function PsychologyQuote() {
  const [quote, setQuote] = useState(psychologyQuotes[0]);
  const [mounted, setMounted] = useState(false);

  // Инициализируем случайную цитату только на клиенте после монтирования
  useEffect(() => {
    if (!mounted) {
      const randomQuote = psychologyQuotes[Math.floor(Math.random() * psychologyQuotes.length)];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuote(randomQuote);
      setMounted(true);
    }
  }, [mounted]);

  if (!quote) return null;

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-8 border border-indigo-200 shadow-md">
      {/* Quote Icon */}
      <Quote className="absolute top-4 right-4 w-12 h-12 text-indigo-200" />

      {/* Quote Text */}
      <blockquote className="relative text-lg text-gray-800 font-medium leading-relaxed mb-4 italic">
        &quot;{quote.quote}&quot;
      </blockquote>

      {/* Author & Book */}
      <div className="relative">
        <p className="text-sm font-semibold text-indigo-700">
          — {quote.author}
        </p>
        {quote.book && (
          <p className="text-xs text-gray-600 mt-1">
            {quote.book}
          </p>
        )}
      </div>
    </div>
  );
}
