import Link from "next/link";
import { Sparkles, ShieldCheck, ChevronLeft, ChevronRight, Shuffle } from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ExercisesCarousel({ carousel }) {
  const { pickedExercise, prevExercise, nextExercise, pickRandomExercise } = carousel;

  return (
    <section className="space-y-8 mt-4 relative">
      <div className="flex flex-col md:items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 mb-4 border border-emerald-100">
          <Sparkles className="h-4 w-4" />
          Скорая помощь
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">Мини-упражнения</h2>
        <p className="mt-3 text-base sm:text-lg text-slate-600 font-light max-w-2xl mx-auto">
          Быстрые и эффективные техники, которые помогут стабилизировать эмоциональный фон, снять напряжение и вернуть фокус прямо сейчас.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-8 sm:p-12 transition-all">
        {/* background blobs */}
        <div
          className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl opacity-60"
        />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-teal-200/30 blur-3xl opacity-60" />

        <div className="relative z-10 space-y-8">
          {/* Header and controls */}
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-6 flex-1">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-teal-700 shadow-sm border border-teal-200/50 flex-shrink-0 transition-transform hover:scale-105">
                <pickedExercise.Icon className="h-8 w-8" />
              </div>
              <div className="pt-1">
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">{pickedExercise.title}</h3>
                <p className="mt-2 text-lg text-slate-600 font-light leading-relaxed">{pickedExercise.why}</p>

                <div className="mt-4 flex flex-wrap gap-2.5">
                  {pickedExercise.tags.map((tg) => (
                    <span
                      key={tg}
                      className="rounded-full border border-teal-100 bg-teal-50/50 px-4 py-1.5 text-xs font-semibold text-teal-700 backdrop-blur-sm shadow-sm"
                    >
                      {tg}
                    </span>
                  ))}
                  <span className="rounded-full border border-slate-200 bg-slate-50/80 px-4 py-1.5 text-xs font-semibold text-slate-600 backdrop-blur-sm shadow-sm flex items-center gap-1.5">
                    <span className="text-slate-400">⏱️</span> {pickedExercise.time}
                  </span>
                </div>
              </div>
            </div>

            {/* Carousel controls */}
            <div className="flex items-center gap-3 flex-shrink-0 md:self-stretch md:items-end">
              <button
                type="button"
                onClick={prevExercise}
                className="h-12 w-12 flex items-center justify-center rounded-2xl border border-white/60 bg-white/90 text-slate-700 shadow-sm backdrop-blur-md hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 active:scale-95 transition-all"
                aria-label="Предыдущее упражнение"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={pickRandomExercise}
                className="h-12 rounded-2xl bg-teal-600 px-6 font-semibold text-white shadow-lg shadow-teal-900/20 hover:bg-teal-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
                aria-label="Случайное упражнение"
              >
                <Shuffle className="h-4 w-4" />
                <span className="hidden sm:inline">Случайное</span>
              </button>

              <button
                type="button"
                onClick={nextExercise}
                className="h-12 w-12 flex items-center justify-center rounded-2xl border border-white/60 bg-white/90 text-slate-700 shadow-sm backdrop-blur-md hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 active:scale-95 transition-all"
                aria-label="Следующее упражнение"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Steps */}
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {pickedExercise.steps.map((s, i) => (
              <div
                key={i}
                className="group relative rounded-2xl border border-white/50 bg-white/80 px-6 py-5 shadow-sm backdrop-blur-md hover:shadow-md hover:border-teal-200/60 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-teal-100/80 text-sm font-bold text-teal-800 flex-shrink-0 group-hover:bg-teal-200 transition-colors">
                    {i + 1}
                  </div>
                  <div className="font-medium text-slate-700 mt-1 leading-relaxed">{s}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer hint */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-teal-200/60 bg-teal-50/80 px-6 py-5 backdrop-blur-md shadow-sm">
            <div className="text-sm text-slate-700 flex-1">
              <span className="font-bold text-teal-900 uppercase tracking-wider text-xs mr-2">Совет:</span> 
              выполняйте упражнение <span className="font-semibold text-teal-800">медленно</span> и {" "}
              <span className="font-semibold text-teal-800">без лишнего напряжения</span>.
            </div>
            
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wide bg-teal-100/50 px-3 py-1.5 rounded-lg">
                <ShieldCheck className="h-4 w-4" />
                Безопасно
              </div>
            </div>
          </div>

          {pickedExercise.key === "4_7_8_breathing" && (
            <div className="mt-8 flex justify-center">
              <Link
                href="/exercises/breathing-478"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-teal-800 px-8 py-4 text-base font-bold text-white shadow-xl shadow-teal-900/20 transition-all hover:bg-teal-900 hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600/0 via-white/20 to-teal-600/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <Sparkles className="h-5 w-5 text-teal-200" />
                <span>Открыть интерактивный тренажер 4-7-8</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
