"use client";

import { useState, useEffect } from "react";
import { psychologyFacts, psychologyTips } from "@/data/psychologyFacts";
import PsychologyHeader from "./psychology/PsychologyHeader";
import PsychologyFactCard from "./psychology/PsychologyFactCard";
import PsychologyTipCard from "./psychology/PsychologyTipCard";
import PsychologyCta from "./psychology/PsychologyCta";

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
    <section className="relative py-20 px-4 bg-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <PsychologyHeader />

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <PsychologyFactCard fact={fact} onRefresh={getNewFact} />
          <PsychologyTipCard tip={tip} onRefresh={getNewTip} />
        </div>

        <PsychologyCta />
      </div>
    </section>
  );
}
