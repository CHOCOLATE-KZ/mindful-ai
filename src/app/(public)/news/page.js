"use client";

import Footer from "@/components/landing/Footer";
import NewsHeader from "./_components/NewsHeader";
import NewsFilters from "./_components/NewsFilters";
import NewsGrid from "./_components/NewsGrid";
import LoadMoreButton from "./_components/LoadMoreButton";
import { useNewsFilters } from "./_hooks/useNewsFilters";
import { useNewsLoad } from "./_hooks/useNewsLoad";

export default function NewsPage() {
  const filters = useNewsFilters();
  const newsLoad = useNewsLoad({
    debouncedQ: filters.debouncedQ,
    tag: filters.tag,
    sort: filters.sort,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-violet-50/20 to-blue-50/30">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-violet-400/15 to-blue-400/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/15 to-indigo-400/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-violet-400/10 rounded-full blur-3xl" />
      </div>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <NewsHeader totalCount={newsLoad.totalCount} />
        <NewsFilters filters={filters} />

        {newsLoad.err && (
          <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/60 backdrop-blur-sm shadow-sm">
            <p className="text-sm font-medium text-red-700 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {newsLoad.err}
            </p>
          </div>
        )}

        <NewsGrid items={newsLoad.items} loading={newsLoad.loading} />

        {!newsLoad.loading && newsLoad.items.length > 0 && (
          <div className="mt-12 flex justify-center">
            <LoadMoreButton
              hasMore={newsLoad.hasMore}
              loadingMore={newsLoad.loadingMore}
              onLoadMore={newsLoad.loadMore}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
