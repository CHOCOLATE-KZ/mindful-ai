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
      {/* Фоновые элементы */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-purple-300/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-indigo-300/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 space-y-12">
        <ExercisesHeader />
        <TestsSection filter={testsFilter} />
        <ExercisesCarousel carousel={carousel} />
        <BenefitsSection />
      </div>
    </>
  );
}
