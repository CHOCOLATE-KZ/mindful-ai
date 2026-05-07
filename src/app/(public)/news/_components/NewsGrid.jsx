"use client";

import { useState } from "react";
import NewsCard, { FeaturedSlider, CompactNewsCard } from "./NewsCard";
import { Newspaper } from "lucide-react";

function SkeletonFeatured() {
  return <div className="h-[420px] rounded-2xl bg-slate-200 animate-pulse" />;
}

function SkeletonCard() {
  return <div className="h-48 rounded-2xl bg-slate-100 animate-pulse" />;
}

function SkeletonCompact() {
  return (
    <div className="flex gap-3 py-3 border-b border-slate-100">
      <div className="w-6 h-6 rounded-full bg-slate-200 animate-pulse shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-slate-200 rounded animate-pulse w-full" />
        <div className="h-3 bg-slate-200 rounded animate-pulse w-2/3" />
      </div>
    </div>
  );
}

export default function NewsGrid({ items, loading }) {
  const [activeTab, setActiveTab] = useState("latest");

  const sliderItems = items.slice(0, 5);
  const gridItems = items.slice(5, 11);
  // Sidebar: latest = first 8 by date order, popular = reversed as proxy
  const sidebarItems = activeTab === "latest" ? items.slice(0, 8) : [...items].slice(0, 8).reverse();

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <SkeletonFeatured />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
        <aside className="lg:w-80 shrink-0">
          <div className="h-10 rounded-xl bg-slate-200 animate-pulse mb-4" />
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCompact key={i} />)}
        </aside>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
        <Newspaper size={48} className="mb-4 text-slate-300" />
        <p className="text-lg font-bold text-slate-600 mb-1">Материалов не найдено</p>
        <p className="text-sm text-slate-400">Попробуйте изменить запрос или категорию</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* ── Main column ── */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Featured slider */}
        {sliderItems.length > 0 && <FeaturedSlider items={sliderItems} />}

        {/* Grid */}
        {gridItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {gridItems.map((n) => (
              <NewsCard key={n.id} news={n} />
            ))}
          </div>
        )}
      </div>

      {/* ── Sidebar ── */}
      <aside className="lg:w-72 xl:w-80 shrink-0">
        <div className="sticky top-4 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          {/* Tab header */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab("latest")}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${
                activeTab === "latest"
                  ? "bg-[#74AA9C] text-white"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              Последние
            </button>
            <button
              onClick={() => setActiveTab("popular")}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${
                activeTab === "popular"
                  ? "bg-[#74AA9C] text-white"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              Популярные
            </button>
          </div>

          {/* Compact list */}
          <div className="px-4 py-2">
            {sidebarItems.map((n, i) => (
              <CompactNewsCard key={n.id} news={n} index={i} />
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
