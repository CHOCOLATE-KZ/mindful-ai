"use client";

import Link from "next/link";
import { useState } from "react";

// ====== КАТАЛОГ ТЕСТОВ ======
const TESTS = [
  {
    key: "uncertainty_tolerance",
    title: "Умеете ли вы выдерживать неопределённость?",
    description: "Оцените, как вы реагируете на неопределённость и нестабильные ситуации.",
  },
  {
    key: "manipulation_test",
    title: "Легко ли вами манипулировать?",
    description: "Тест на вашу восприимчивость к влиянию других людей.",
  },
  {
    key: "money_attitude",
    title: "Тест на отношение к деньгам",
    description: "Проверка ваших привычек и отношения к финансам.",
  },
];

// ====== МИНИ-УПРАЖНЕНИЯ ======
const EXERCISES = [
  {
    key: "box_breathing",
    title: "Дыхание «Квадрат» (1–2 минуты)",
    why: "Снижает тревогу и выравнивает дыхание.",
    steps: ["Вдох 4", "Задержка 4", "Выдох 4", "Задержка 4", "Повтори 4 круга"],
  },
  {
    key: "5_4_3_2_1",
    title: "Заземление 5-4-3-2-1 (2 минуты)",
    why: "Возвращает в «здесь и сейчас» при стрессе.",
    steps: ["5 вещей вижу", "4 ощущаю", "3 слышу", "2 чувствую запах", "1 вкус/мысль"],
  },
  {
    key: "micro_body_scan",
    title: "Мини-body scan (2 минуты)",
    why: "Снимает напряжение в теле.",
    steps: ["Лоб/челюсть расслабить", "Плечи вниз", "Дыхание мягко", "Стопы почувствовать"],
  },
];

export default function ExercisesPage() {
  const [pickedExercise, setPickedExercise] = useState(EXERCISES[0]);

  function pickRandomExercise() {
    const next = EXERCISES[Math.floor(Math.random() * EXERCISES.length)];
    setPickedExercise(next);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-12">
      {/* ===== БЫСТРЫЕ ССЫЛКИ ===== */}
      <div className="flex gap-3 flex-wrap">
        <Link
          href="/analytics"
          className="inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:opacity-90 transition"
        >
          📊 Моя аналитика
        </Link>
      </div>

      {/* ===== КАТАЛОГ ТЕСТОВ ===== */}
      <section>
        <h1 className="text-4xl font-semibold mb-4">Каталог тестов</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {TESTS.map((t) => (
            <Link
              key={t.key}
              href={`/exercises/${t.key}`}
              className="cursor-pointer rounded-2xl border p-4 hover:shadow-md transition"
            >
              <div className="font-semibold text-lg">{t.title}</div>
              <div className="text-black/70 mt-1 text-sm">{t.description}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== МИНИ-УПРАЖНЕНИЯ ===== */}
      <section>
        <h1 className="text-4xl font-semibold mb-4">Мини-упражнения</h1>
        <div className="rounded-3xl border border-black/10 bg-white/70 p-6 backdrop-blur-xl text-black">
          <div className="text-lg font-semibold">{pickedExercise.title}</div>
          <div className="mt-1 text-sm text-black/70">{pickedExercise.why}</div>
          <ul className="mt-4 space-y-2">
            {pickedExercise.steps.map((s, i) => (
              <li key={i} className="rounded-2xl border border-black/10 bg-white/60 px-4 py-3 text-black/80">
                {s}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex gap-2">
            <button
              onClick={pickRandomExercise}
              className="flex-1 cursor-pointer h-12 rounded-2xl bg-black/10 text-black font-semibold hover:bg-black/20"
            >
              Подобрать другое
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
