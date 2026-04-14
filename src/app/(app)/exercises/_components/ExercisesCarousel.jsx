import { Sparkles, ShieldCheck, ChevronLeft, ChevronRight, Shuffle } from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ExercisesCarousel({ carousel }) {
  const { pickedExercise, prevExercise, nextExercise, pickRandomExercise } = carousel;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Мини-упражнения</h2>
        <p className="mt-2 text-sm text-slate-600">
          Быстрые техники, которые помогут снять стресс прямо сейчас.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/70 backdrop-blur-sm shadow-lg p-8">
        {/* background blobs */}
        <div
          className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl opacity-50"
        />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-200/20 blur-3xl opacity-50" />

        <div className="relative z-10 space-y-6">
          {/* Header and controls */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-100 text-blue-700 flex-shrink-0">
                <pickedExercise.Icon className="h-7 w-7" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-blue-50/60 px-4 py-2 text-xs font-medium text-blue-700 backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  Рекомендация
                </div>
                <h3 className="mt-3 text-2xl font-bold text-slate-900">{pickedExercise.title}</h3>
                <p className="mt-1 text-base text-slate-600">{pickedExercise.why}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {pickedExercise.tags.map((tg) => (
                    <span
                      key={tg}
                      className="rounded-full border border-white/30 bg-white/60 px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur-sm"
                    >
                      {tg}
                    </span>
                  ))}
                  <span className="rounded-full border border-white/30 bg-white/60 px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur-sm">
                    ⏱️ {pickedExercise.time}
                  </span>
                </div>
              </div>
            </div>

            {/* Carousel controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={prevExercise}
                className="h-11 w-11 rounded-2xl border border-white/30 bg-white/70 text-slate-700 shadow-sm backdrop-blur-sm transition hover:bg-white/90 hover:border-white/50 active:scale-95"
                aria-label="Предыдущее упражнение"
              >
                <ChevronLeft className="mx-auto h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={pickRandomExercise}
                className="h-11 rounded-2xl bg-blue-500 px-4 font-semibold text-white shadow-lg transition hover:shadow-xl hover:opacity-95 active:scale-95 flex items-center gap-2"
                aria-label="Случайное упражнение"
              >
                <Shuffle className="h-4 w-4" />
                <span className="hidden sm:inline">Случайное</span>
                <span className="sm:hidden">Выбрать</span>
              </button>

              <button
                type="button"
                onClick={nextExercise}
                className="h-11 w-11 rounded-2xl border border-white/30 bg-white/70 text-slate-700 shadow-sm backdrop-blur-sm transition hover:bg-white/90 hover:border-white/50 active:scale-95"
                aria-label="Следующее упражнение"
              >
                <ChevronRight className="mx-auto h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Steps */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {pickedExercise.steps.map((s, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/30 bg-white/60 px-5 py-4 text-sm text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white/80 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700 flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="font-medium">{s}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer hint */}
          <div className="mt-7 flex items-center justify-between gap-3 rounded-2xl border border-blue-200/50 bg-blue-50/60 px-5 py-4 backdrop-blur-sm">
            <div className="text-sm text-slate-700">
              <span className="font-semibold text-blue-900"> Совет:</span> выполняйте {" "}
              <span className="font-semibold text-blue-900">медленно</span> и {" "}
              <span className="font-semibold text-blue-900">без напряжения</span>.
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-blue-700">
              <ShieldCheck className="h-4 w-4" />
              Безопасно
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
