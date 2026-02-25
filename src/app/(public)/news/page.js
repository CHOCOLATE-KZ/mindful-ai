"use client";

import { useEffect, useMemo, useState } from "react";
import Footer from "@/components/landing/Footer";

const TAGS = ["Тревога", "Депрессия", "Сон", "Стресс", "Отношения", "Самооценка", "ADHD", "Психотерапия"];

export default function NewsPage() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  // reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedQ, tag, sort]);

  const url = useMemo(() => {
    const sp = new URLSearchParams();
    if (debouncedQ) sp.set("q", debouncedQ);
    if (tag) sp.set("tag", tag);
    sp.set("sort", sort);
    sp.set("limit", "20");
    sp.set("page", String(page));
    return `/api/news?${sp.toString()}`;
  }, [debouncedQ, tag, sort, page]);

  useEffect(() => {
    const controller = new AbortController();
    const isFirst = page === 1;

    (async () => {
      if (isFirst) setLoading(true);
      else setLoadingMore(true);

      setErr("");

      try {
        const res = await fetch(url, { cache: "no-store", signal: controller.signal });
        const data = await res.json().catch(() => ({ items: [], error: "Bad JSON" }));
        if (data?.error) setErr(data.error);

        const got = Array.isArray(data.items) ? data.items : [];
        setTotalCount(Number(data.totalCount || 0));
        setHasMore(Boolean(data.hasMore));

        if (isFirst) setItems(got);
        else setItems((prev) => [...prev, ...got]);
      } catch (e) {
        if (e?.name !== "AbortError") setErr(e?.message || String(e));
      } finally {
        if (isFirst) setLoading(false);
        else setLoadingMore(false);
      }
    })();

    return () => controller.abort();
  }, [url, page]);

  const loadMore = () => {
    if (!hasMore || loading || loadingMore) return;
    setPage((p) => p + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-violet-50/20 to-blue-50/30">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-violet-400/15 to-blue-400/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/15 to-indigo-400/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-violet-400/10 rounded-full blur-3xl" />
      </div>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
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

        {/* Search + Tags */}
        <div className="mb-10 space-y-6 rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
          {/* Search Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <span className="text-lg">🔍</span>
                <span className="text-sm font-medium text-black/70">Поиск материалов</span>
              </Label>
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="text-xs text-black/50 hover:text-black/70 transition"
                >
                  Очистить
                </button>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Введите тему или ключевое слово..."
                className="w-full h-12 pl-12 pr-6 rounded-2xl border border-black/10 bg-white text-black/80 placeholder-black/40 outline-none transition-all
                           focus:border-violet-300 focus:ring-4 focus:ring-violet-100/50 shadow-sm"
              />
            </div>
          </div>

          {/* Tags Filter */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <span className="text-lg">🏷️</span>
              <span className="text-sm font-medium text-black/70">Категории</span>
            </Label>

            <div className="flex flex-wrap gap-2">
              <TagChip active={!tag} onClick={() => setTag("")}>
                <span className="mr-1.5">⭐</span> Все
              </TagChip>
              {TAGS.map((t) => (
                <TagChip key={t} active={tag === t} onClick={() => setTag(t)}>
                  {t}
                </TagChip>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center justify-between pt-4 border-t border-black/10">
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <span className="text-sm font-medium text-black/70">Сортировка</span>
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 rounded-xl border border-black/10 bg-white/80 backdrop-blur-sm px-4 text-sm text-black/80 outline-none transition-all
                         focus:border-violet-300 focus:ring-4 focus:ring-violet-100/50 shadow-sm cursor-pointer"
            >
              <option value="latest">Сначала новые</option>
              <option value="oldest">Сначала старые</option>
            </select>
          </div>
        </div>

        {err && (
          <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/60 backdrop-blur-sm shadow-sm">
            <p className="text-sm font-medium text-red-700 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {err}
            </p>
          </div>
        )}

        {/* News Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className="h-96 rounded-3xl bg-gradient-to-br from-violet-100/50 via-blue-100/50 to-white border border-black/10 animate-pulse" 
              />
            ))
          ) : items.length ? (
            items.map((n) => (
              <a
                key={n.id}
                href={n.url}
                target="_blank"
                rel="noreferrer"
                className="group relative rounded-3xl overflow-hidden border border-black/10 bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/0 to-blue-600/0 group-hover:from-violet-600/5 group-hover:to-blue-600/5 transition-all duration-300 pointer-events-none" />
                
                <div className="relative p-6 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-violet-500" />
                      <span className="text-xs font-semibold text-black/50 uppercase tracking-wide">
                        {n.source || "Источник"}
                      </span>
                    </div>
                    {n.published_at && (
                      <div className="rounded-lg bg-blue-100/70 px-2.5 py-1">
                        <span className="text-xs font-medium text-blue-700">
                          {new Date(n.published_at).toLocaleDateString("ru-RU", { 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-bold leading-tight text-black mb-3 group-hover:text-violet-600 transition-colors duration-200 line-clamp-3">
                    {n.title}
                  </h2>

                  {/* Summary */}
                  {n.summary && (
                    <p className="text-sm leading-relaxed text-black/65 line-clamp-3 mb-4 flex-grow">
                      {n.summary}
                    </p>
                  )}

                  {/* Tags */}
                  {(n.tags || []).length > 0 && (
                    <div className="mt-auto pt-4 border-t border-black/10">
                      <div className="flex flex-wrap gap-2">
                        {(n.tags || []).slice(0, 3).map((tg) => (
                          <span
                            key={tg}
                            className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-violet-100/80 to-blue-100/80 text-violet-700 border border-violet-200/50"
                          >
                            {tg}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* External link indicator */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="rounded-full bg-violet-600 p-2 shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </div>
              </a>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-black/15 bg-gradient-to-br from-gray-50/50 to-white">
              <div className="text-6xl mb-4 opacity-50">📚</div>
              <p className="text-lg font-semibold text-black/70 mb-2">Материалов не найдено</p>
              <p className="text-sm text-black/50">Попробуйте изменить запрос или выбрать другую категорию</p>
            </div>
          )}
        </div>

        {/* Load more */}
        {!loading && items.length > 0 && (
          <div className="mt-12 flex justify-center">
            {hasMore ? (
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loadingMore}
                className="group relative rounded-2xl px-8 py-3.5 font-semibold border border-violet-500 bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <span className="relative flex items-center gap-2">
                  {loadingMore ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Загрузка...
                    </>
                  ) : (
                    <>
                      Показать ещё
                      <svg className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 px-6 py-3">
                <p className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                  <span className="text-lg">✅</span>
                  Это все материалы
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// Label component (if not imported)
function Label({ children, className = "" }) {
  return <label className={`text-sm font-medium text-black/70 ${className}`}>{children}</label>;
}

function TagChip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        cursor-pointer rounded-xl px-4 py-2 text-sm font-medium border transition-all duration-300 
        flex items-center gap-1.5 backdrop-blur-sm shadow-sm hover:shadow-md
        ${
          active
            ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white border-violet-500 shadow-lg scale-105"
            : "bg-white text-black/70 border-black/10 hover:bg-gradient-to-r hover:from-violet-50 hover:to-blue-50 hover:border-violet-200"
        }
      `}
    >
      {children}
    </button>
  );
}
