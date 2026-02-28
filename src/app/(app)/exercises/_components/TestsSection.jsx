import { Search, SlidersHorizontal, X } from "lucide-react";
import TestCard from "./TestCard";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function TestsSection({ filter }) {
  const { q, setQ, selectedTag, setSelectedTag, allTestTags, filteredTests } = filter;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Каталог тестов</h2>
          <p className="mt-2 text-sm text-slate-600">
            Короткие опросы, чтобы лучше понять привычки, реакции и установки.
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-[420px]">
          <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/70 px-4 py-2.5 shadow-sm backdrop-blur-sm transition focus-within:shadow-md focus-within:border-blue-200">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск тестов и тегов…"
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            {q.trim().length > 0 && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Очистить поиск"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/60 px-3 py-1.5 text-xs font-medium text-slate-600 backdrop-blur-sm">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Фильтры
        </div>

        {allTestTags.map((tag) => {
          const active = tag === selectedTag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition duration-200",
                active
                  ? "border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100/80 text-blue-700 shadow-sm"
                  : "border-white/20 bg-white/60 text-slate-600 hover:bg-white/80 hover:text-slate-900 hover:border-white/40 backdrop-blur-sm"
              )}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid gap-5 md:grid-cols-2 items-stretch">
        {filteredTests.map((t) => (
          <TestCard key={t.key} test={t} />
        ))}

        {filteredTests.length === 0 && (
          <div className="md:col-span-2 rounded-3xl border border-white/20 bg-white/70 p-8 text-center backdrop-blur-sm shadow-sm">
            <p className="text-slate-600 font-medium">Ничего не найдено</p>
            <p className="text-slate-500 text-sm mt-1">Попробуйте изменить запрос или фильтр.</p>
          </div>
        )}
      </div>
    </section>
  );
}
