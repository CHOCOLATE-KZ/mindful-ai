"use client";

import Footer from "@/components/landing/Footer";
import NewsHeader from "./_components/NewsHeader";
import NewsFilters from "./_components/NewsFilters";
import NewsGrid from "./_components/NewsGrid";
import LoadMoreButton from "./_components/LoadMoreButton";
import { useNewsFilters } from "./_hooks/useNewsFilters";
import { useNewsLoad } from "./_hooks/useNewsLoad";
import { AlertTriangle } from "lucide-react";

export default function NewsPage() {
  const filters = useNewsFilters();
  const newsLoad = useNewsLoad({
    debouncedQ: filters.debouncedQ,
    tag: filters.tag,
    sort: filters.sort,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-4 pt-10 pb-16 sm:px-6 lg:px-8">
        <NewsHeader totalCount={newsLoad.totalCount} />
        <NewsFilters filters={filters} />

        {newsLoad.err && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-sm font-medium text-amber-700 flex items-center gap-2">
              <AlertTriangle size={16} />
              {newsLoad.err}
            </p>
          </div>
        )}

        <NewsGrid items={newsLoad.items} loading={newsLoad.loading} />

        {!newsLoad.loading && newsLoad.items.length > 0 && (
          <div className="mt-10 flex justify-center">
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
