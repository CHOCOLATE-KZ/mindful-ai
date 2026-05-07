"use client";

import { useState, useEffect, useCallback } from "react";
import { psychologyFacts } from "@/data/psychologyFacts";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const VISIBLE = 5;

export default function PsychologySection() {
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = useCallback((dir) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setIndex((i) => (i + dir + psychologyFacts.length) % psychologyFacts.length);
      setAnimating(false);
    }, 220);
  }, [animating]);

  // auto-advance
  useEffect(() => {
    const t = setTimeout(() => go(1), 6000);
    return () => clearTimeout(t);
  }, [index, go]);

  const fact = psychologyFacts[index];

  return (
    <section className="relative overflow-hidden bg-[#0d0d14] py-0">
      {/* full-bleed grid */}
      <div className="grid lg:grid-cols-2 min-h-[600px]">

        {/* LEFT — image panel */}
        <div className="relative flex items-end justify-center overflow-hidden min-h-[340px] lg:min-h-full">
          {/* dark gradient overlay top */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d14]/60 via-transparent to-transparent z-10 pointer-events-none" />
          <Image
            src="/mind.png"
            alt="Психология разума"
            fill
            className="object-cover object-center"
            priority
          />
          {/* source badge */}
          <div className="relative z-20 mb-8 ml-8 mr-auto">
            <span className="text-xs text-white/40 tracking-widest uppercase font-mono">
              {fact.source}
            </span>
          </div>
        </div>

        {/* RIGHT — content panel */}
        <div className="relative flex flex-col justify-center px-10 py-16 lg:px-16 bg-[#0d0d14]">

          {/* category pill */}
          <div
            key={`cat-${index}`}
            className={`mb-6 transition-opacity duration-200 ${animating ? "opacity-0" : "opacity-100"}`}
          >
            <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#a8c5be] border border-[#a8c5be]/30 rounded-full px-4 py-1">
              {fact.category}
            </span>
          </div>

          {/* big title */}
          <h2
            key={`title-${index}`}
            className={`text-3xl md:text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6 transition-all duration-220 ${animating ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"}`}
            style={{ transition: "opacity 220ms, transform 220ms" }}
          >
            {fact.title}
          </h2>

          {/* body text */}
          <p
            key={`body-${index}`}
            className={`text-white/60 text-base md:text-lg leading-relaxed mb-10 max-w-lg transition-all duration-220 ${animating ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"}`}
            style={{ transition: "opacity 220ms 40ms, transform 220ms 40ms" }}
          >
            {fact.fact}
          </p>

          {/* controls row */}
          <div className="flex items-center gap-6 mb-10">
            <button
              onClick={() => go(-1)}
              aria-label="Назад"
              className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* dots */}
            <div className="flex gap-2">
              {psychologyFacts.slice(0, VISIBLE).map((_, i) => (
                <button
                  key={i}
                  onClick={() => { if (!animating) { setAnimating(true); setTimeout(() => { setIndex(i); setAnimating(false); }, 220); } }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === index % VISIBLE ? "w-6 bg-white" : "w-1.5 bg-white/25"}`}
                />
              ))}
            </div>

            <button
              onClick={() => go(1)}
              aria-label="Вперёд"
              className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* CTA */}
          <div>
            <Link
              href="/psychology"
              className="group inline-flex items-center gap-3 rounded-xl bg-white text-[#0d0d14] px-7 py-3.5 text-sm font-bold tracking-wide hover:bg-white/90 transition-colors"
            >
              Узнать больше
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
