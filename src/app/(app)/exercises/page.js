"use client";

import ExercisesHeader from "./_components/ExercisesHeader";
import TestsSection from "./_components/TestsSection";
import ExercisesCarousel from "./_components/ExercisesCarousel";
import BenefitsSection from "./_components/BenefitsSection";
import { useTestsFilter } from "./_hooks/useTestsFilter";
import { useExercisesCarousel } from "./_hooks/useExercisesCarousel";

export default function ExercisesPage() {
  const testsFilter = useTestsFilter();
  const carousel = useExercisesCarousel();

  return (
    <>
      {/* Психологический фон: мягкие органичные формы и успокаивающие цвета */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-slate-50/50">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute top-1/2 -left-32 h-[400px] w-[400px] rounded-full bg-teal-200/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[600px] w-[600px] rounded-full bg-cyan-200/10 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 space-y-16">
        <ExercisesHeader />
        
        {/* Делитель секций */}
        <div className="mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-transparent via-teal-200 to-transparent opacity-50" />
        
        <ExercisesCarousel carousel={carousel} />
        
        <div className="mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-transparent via-teal-200 to-transparent opacity-50" />
        
        <TestsSection filter={testsFilter} />
        
        <BenefitsSection />
      </div>
    </>
  );
}
