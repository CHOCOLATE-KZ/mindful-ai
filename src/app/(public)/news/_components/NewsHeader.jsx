import { TAGS } from "../_data/newsData";

export default function NewsHeader({ totalCount }) {
  return (
    <div className="mb-12 rounded-3xl border border-black/10 bg-gradient-to-br from-white via-violet-50/30 to-blue-50/40 p-8 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-violet-200/60 bg-white/80 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-violet-700 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-violet-500"></span>
            </span>
            Психо-новости
          </div>

          <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight text-black">
            База знаний по психологии
          </h1>

          <p className="mt-3 text-base text-black/65 max-w-2xl leading-relaxed">
            Подборка интересных статей и материалов. Изучайте, учитесь и развивайтесь вместе с нами.
          </p>

          <p className="mt-2 text-sm text-black/50">
            Источники:{" "}
            <a
              href="https://rus.baq.kz"
              className="font-medium text-violet-600 hover:text-violet-700 underline underline-offset-2 decoration-violet-300 transition"
            >
              несколько источников
            </a>
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl border border-violet-200/50 bg-gradient-to-br from-violet-50 to-white px-5 py-3.5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">📚</span>
              <div className="text-xs font-medium text-black/50">Всего материалов</div>
            </div>
            <div className="mt-1.5 text-2xl font-bold text-violet-600">
              {totalCount || "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-white px-5 py-3.5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏷️</span>
              <div className="text-xs font-medium text-black/50">Категорий</div>
            </div>
            <div className="mt-1.5 text-2xl font-bold text-blue-600">
              {TAGS.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
