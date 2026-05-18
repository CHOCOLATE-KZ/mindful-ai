"use client";

import { useEffect, useMemo, useState } from "react";

const PHASES = [
  { key: "inhale", label: "Вдох", seconds: 4, hint: "Медленно вдохните через нос" },
  { key: "hold", label: "Задержка", seconds: 7, hint: "Мягко удерживайте дыхание" },
  { key: "exhale", label: "Выдох", seconds: 8, hint: "Длинный спокойный выдох через рот" },
];

function getCircleScale(phaseKey, phaseProgress) {
  if (phaseKey === "inhale") return 1 + 0.25 * phaseProgress;
  if (phaseKey === "hold") return 1.25;
  return 1.25 - 0.35 * phaseProgress;
}

export default function Breathing478Trainer() {
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(PHASES[0].seconds);
  const [cycle, setCycle] = useState(1);
  const [targetCycles, setTargetCycles] = useState(4);

  const phase = PHASES[phaseIndex];
  const elapsedInPhase = phase.seconds - timeLeft;
  const phaseProgress = Math.min(1, Math.max(0, elapsedInPhase / phase.seconds));

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 1) return prev - 1;

        const nextPhaseIndex = (phaseIndex + 1) % PHASES.length;
        if (nextPhaseIndex === 0) {
          if (cycle >= targetCycles) {
            setIsRunning(false);
            return 0;
          }
          setCycle((value) => value + 1);
        }

        setPhaseIndex(nextPhaseIndex);
        return PHASES[nextPhaseIndex].seconds;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, phaseIndex, cycle, targetCycles]);

  const phaseColor = useMemo(() => {
    if (phase.key === "inhale") return "from-blue-500 to-cyan-400";
    if (phase.key === "hold") return "from-indigo-500 to-violet-500";
    return "from-emerald-500 to-teal-400";
  }, [phase.key]);

  const circleScale = getCircleScale(phase.key, phaseProgress);

  function handleStartPause() {
    if (cycle > targetCycles) {
      handleReset();
      setIsRunning(true);
      return;
    }
    if (timeLeft === 0) {
      handleReset();
      setIsRunning(true);
      return;
    }
    setIsRunning((value) => !value);
  }

  function handleReset() {
    setIsRunning(false);
    setPhaseIndex(0);
    setTimeLeft(PHASES[0].seconds);
    setCycle(1);
  }

  const isFinished = timeLeft === 0 && !isRunning;

  return (
    <div className="rounded-3xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Тренажёр дыхания 4-7-8</h1>
          <p className="mt-1 text-sm text-slate-600">
            {isFinished ? "Цикл завершен. Отличная работа." : phase.hint}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
          Цикл {Math.min(cycle, targetCycles)} / {targetCycles}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px] lg:items-center">
        <div className="flex items-center justify-center">
          <div className="relative h-64 w-64 sm:h-72 sm:w-72">
            <div className="absolute inset-0 rounded-full border border-slate-200 bg-slate-50" />
            <div
              className={`absolute inset-5 rounded-full bg-gradient-to-br ${phaseColor} shadow-2xl transition-transform duration-700 ease-in-out`}
              style={{ transform: `scale(${circleScale})` }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-700">
                {isFinished ? "Готово" : phase.label}
              </div>
              <div className="mt-1 text-6xl font-bold text-slate-900">{timeLeft}</div>
              <div className="mt-1 text-xs text-slate-600">секунд</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Количество циклов</p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTargetCycles((value) => Math.max(1, value - 1))}
                className="h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 text-lg font-semibold text-slate-700 transition hover:bg-slate-100"
                aria-label="Уменьшить циклы"
              >
                -
              </button>
              <div className="h-10 flex-1 rounded-xl border border-slate-200 bg-slate-50 text-center text-sm font-semibold leading-10 text-slate-800">
                {targetCycles}
              </div>
              <button
                type="button"
                onClick={() => setTargetCycles((value) => Math.min(10, value + 1))}
                className="h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 text-lg font-semibold text-slate-700 transition hover:bg-slate-100"
                aria-label="Увеличить циклы"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleStartPause}
              className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {isRunning ? "Пауза" : isFinished ? "Начать заново" : "Старт"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Сброс
            </button>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs leading-relaxed text-blue-900">
            Рекомендация: выполняйте упражнение в спокойном темпе и не доводите себя до дискомфорта.
            Если появляется головокружение, сделайте паузу и вернитесь к обычному дыханию.
          </div>
        </div>
      </div>
    </div>
  );
}
