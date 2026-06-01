"use client";

import { useState, useEffect, useCallback } from "react";
import { psychologyFacts } from "@/data/psychologyFacts";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import SectionLabel from "@/components/landing/SectionLabel";

/** Короткая подборка для главной — индикаторы совпадают с контентом */
const LANDING_FACTS = psychologyFacts.slice(0, 8);

export default function PsychologySection() {
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const total = LANDING_FACTS.length;

  const go = useCallback(
    (dir) => {
      if (animating) return;
      setAnimating(true);
      setTimeout(() => {
        setIndex((i) => (i + dir + total) % total);
        setAnimating(false);
      }, 220);
    },
    [animating, total]
  );

  const goTo = useCallback(
    (i) => {
      if (animating || i === index) return;
      setAnimating(true);
      setTimeout(() => {
        setIndex(i);
        setAnimating(false);
      }, 220);
    },
    [animating, index]
  );

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const t = setTimeout(() => go(1), 7000);
    return () => clearTimeout(t);
  }, [index, go]);

  const fact = LANDING_FACTS[index];

  return (
    <section id="psychology" className="relative overflow-hidden bg-[#10211f]">
      <div className="grid min-h-[560px] lg:grid-cols-2 lg:min-h-[600px]">
        <div className="relative flex min-h-[300px] items-end justify-center overflow-hidden sm:min-h-[360px] lg:min-h-full">
          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#10211f]/70 via-[#10211f]/20 to-transparent" />
          <Image
            src="/xxx.png"
            alt="Психология разума"
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="relative z-20 m-6 mt-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-white/40">
              {fact.source}
            </span>
          </div>
        </div>

        <div className="relative flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          <SectionLabel light className="mb-4">
            Научные факты
          </SectionLabel>

          <div
            className={`mb-4 transition-opacity duration-200 ${animating ? "opacity-0" : "opacity-100"}`}
          >
            <span className="inline-block rounded-full border border-[#a8c5be]/30 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#a8c5be]">
              {fact.category}
            </span>
          </div>

          <h2
            className={`mb-5 text-2xl font-extrabold leading-tight text-white transition-all duration-200 sm:text-3xl lg:text-4xl ${
              animating ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
            }`}
          >
            {fact.title}
          </h2>

          <p
            className={`mb-8 max-w-lg text-base leading-relaxed text-white/65 transition-all duration-200 delay-75 md:text-lg ${
              animating ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
            }`}
          >
            {fact.fact}
          </p>

          <div className="mb-8 flex items-center gap-4">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Предыдущий факт"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/50 transition hover:border-white/40 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex flex-1 flex-wrap items-center gap-2" role="tablist" aria-label="Факты">
              {LANDING_FACTS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Факт ${i + 1} из ${total}`}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-7 bg-white" : "w-1.5 bg-white/25 hover:bg-white/45"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Следующий факт"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/50 transition hover:border-white/40 hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <p className="mb-6 text-xs text-white/35">
            {index + 1} / {total} · ещё {psychologyFacts.length - total}+ в базе знаний
          </p>

          <Link
            href="/psychology"
            className="group inline-flex w-fit items-center gap-3 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-[#10211f] transition hover:bg-white/92"
          >
            Все факты о психологии
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
