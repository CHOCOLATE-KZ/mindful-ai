import { Search, SlidersHorizontal, X } from "lucide-react";
import TestCard from "./TestCard";
import { useLanguage } from "@/lib/i18n/useLanguage";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function TestsSection({ filter }) {
  const { q, setQ, selectedTag, setSelectedTag, allTestTags, filteredTests } = filter;
  const { t } = useLanguage("exercises");

  return (
    <section className="space-y-8 relative55">
      {/* Мягкий фон для секции тестов */}
      <div className="absolute inset-0 -z-10 rounded-[3rem] bg-white/40 shadow-sm backdrop-blur-sm border border-white/60 -mx-6 sm:-mx-10 px-6 sm:px-10 py-10" />
      
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between pt-4">
        <div className="max-w-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            Глубокая диагностика
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 font-light leading-relaxed">
            Научно обоснованные методы тестирования для понимания ваших эмоций, уровня стресса и внутренних ресурсов.
          </p>
        </div>

        {/* Search */}
        <div className="w-full lg:w-[420px]">
          <div className="flex items-center gap-3 rounded-2xl border border-white/50 bg-white/80 px-5 py-3.5 shadow-sm backdrop-blur-md transition-all focus-within:shadow-md focus-within:border-teal-300 focus-within:ring-4 focus-within:ring-teal-500/10">
            <Search className="h-5 w-5 text-teal-600/70" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full bg-transparent text-base text-slate-800 outline-none placeholder:text-slate-400 font-medium"
            />
            {q.trim().length > 0 && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label={t("clearSearch")}
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 pb-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-md">
          <SlidersHorizontal className="h-4 w-4 text-teal-600" />
          Категории
        </div>

        {allTestTags.map((tag) => {
          const active = tag === selectedTag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={cn(
                "rounded-full border px-5 py-2 text-sm font-medium transition-all duration-300",
                active
                  ? "border-teal-300 bg-teal-50 text-teal-800 shadow-md transform scale-105"
                  : "border-white/40 bg-white/70 text-slate-600 hover:bg-white/90 hover:text-slate-900 hover:border-teal-200 hover:shadow-sm"
              )}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
        {filteredTests.map((test) => (
          <TestCard key={test.key} test={test} />
        ))}

        {filteredTests.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 rounded-3xl border border-white/60 bg-white/80 p-12 text-center backdrop-blur-md shadow-sm flex flex-col items-center justify-center">
            <div className="h-16 w-16 mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-xl font-semibold text-slate-700">{t("noResults")}</p>
            <p className="text-slate-500 mt-2">Попробуйте изменить параметры поиска или фильтры</p>
          </div>
        )}
      </div>
    </section>
  );
}
