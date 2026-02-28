import Link from "next/link";
import { BarChart3 } from "lucide-react";

export default function ExercisesHeader() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/80 via-white to-blue-50/50 p-8 shadow-lg backdrop-blur-sm">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 rounded-3xl pointer-events-none" />
      
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-blue-50/60 px-4 py-2 text-sm font-medium text-blue-700 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            Упражнения и тесты
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Быстрые инструменты для фокуса и спокойствия
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600">
            Выберите тест или сделайте короткое упражнение — это займёт всего пару минут. Начните прямо сейчас.
          </p>
        </div>

        <Link
          href="/analytics"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
        >
          <BarChart3 className="h-4 w-4" />
          Моя аналитика
        </Link>
      </div>
    </div>
  );
}
