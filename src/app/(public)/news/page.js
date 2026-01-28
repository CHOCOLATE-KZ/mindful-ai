"use client";

import { useEffect, useMemo, useState } from "react";
import Footer from "@/components/landing/Footer";

const TAGS = ["Тревога", "Депрессия", "Сон", "Стресс", "Отношения", "Самооценка", "ADHD", "Психотерапия"];

export default function NewsPage() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const url = useMemo(() => {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (tag) sp.set("tag", tag);
    sp.set("limit", "20");
    return `/api/news?${sp.toString()}`;
  }, [q, tag]);

  useEffect(() => {
    let dead = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json().catch(() => ({ items: [], error: "Bad JSON" }));
        if (data?.error) setErr(data.error);
        if (!dead) setItems(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        if (!dead) setErr(e.message);
      } finally {
        if (!dead) setLoading(false);
      }
    })();
    return () => (dead = true);
  }, [url]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900/80 dark:to-indigo-950/40">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl dark:bg-blue-600/5" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl dark:bg-indigo-600/5" />
      </div>

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-16">
          <div className="inline-block">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 tracking-widest uppercase">Психология</span>
            </div>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-black dark:text-white mb-6">
            Психо-новости
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Подборка интересных статей и материалов по психологии. Изучайте, учитесь и развивайтесь вместе с нами.
          </p>
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">
            Источники: <a href="https://rus.baq.kz" className="font-medium text-indigo-600 hover:text-indigo-700 underline underline-offset-2 decoration-indigo-300 dark:text-indigo-400 dark:hover:text-indigo-300">rus.baq.kz</a>
          </p>
        </div>

        {/* Search + Tags */}
        <div className="mb-12 space-y-6">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск материалов по психологии..."
              className="w-full h-14 pl-14 pr-6 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm text-slate-800 placeholder-slate-400 shadow-lg shadow-blue-500/5 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
            />
          </div>

          {/* Tags Filter */}
          <div className="flex flex-wrap gap-3">
            <TagChip active={!tag} onClick={() => setTag("")}>
              <span className="mr-2">⭐</span> Все материалы
            </TagChip>
            {TAGS.map((t) => (
              <TagChip key={t} active={tag === t} onClick={() => setTag(t)}>{t}</TagChip>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {err && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 backdrop-blur-sm">
            <p className="text-sm font-medium text-rose-700 dark:text-rose-400">⚠️ {err}</p>
          </div>
        )}

        {/* News Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-800 animate-pulse" />
            ))
          ) : items.length ? (
            items.map((n, idx) => (
              <a
                key={n.id}
                href={n.url}
                target="_blank"
                rel="noreferrer"
                className="group relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl shadow-lg shadow-blue-500/5 hover:shadow-2xl hover:shadow-blue-500/15 transition duration-300 hover:-translate-y-2 dark:hover:bg-slate-800/60"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-indigo-600/0 group-hover:from-blue-600/5 group-hover:to-indigo-600/5 transition duration-300" />

                {/* Card content */}
                <div className="relative p-6 sm:p-7 h-full flex flex-col">
                  {/* Source & Date */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {n.source || "Источник"}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {n.published_at ? new Date(n.published_at).toLocaleDateString("ru-RU") : ""}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl sm:text-lg font-bold leading-tight text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition duration-200">
                    {n.title}
                  </h2>

                  {/* Summary */}
                  {n.summary && (
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 flex-grow">
                      {n.summary}
                    </p>
                  )}

                  {/* Tags */}
                  {(n.tags || []).length > 0 && (
                    <div className="mt-auto pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex flex-wrap gap-2">
                        {(n.tags || []).slice(0, 3).map((tg) => (
                          <span
                            key={tg}
                            className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-600/20 dark:to-indigo-600/20 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50"
                          >
                            {tg}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Link arrow */}
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-blue-500/10 dark:bg-blue-600/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                </div>
              </a>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-full bg-slate-200/50 dark:bg-slate-700/50 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">Материалов не найдено</p>
              <p className="text-slate-500 dark:text-slate-400">Попробуйте изменить поисковый запрос или выбрать другую категорию</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function TagChip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        cursor-pointer rounded-full px-4 py-2.5 text-sm font-semibold border transition-all duration-300 
        flex items-center gap-2 backdrop-blur-sm
        ${
          active
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-lg shadow-blue-500/30 dark:border-blue-400 dark:from-blue-500 dark:to-indigo-500"
            : "bg-white/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100/80 dark:hover:bg-slate-700/60 hover:border-slate-300/80 dark:hover:border-slate-600/80"
        }
      `}
    >
      {children}
    </button>
  );
}
