import NewsCard from "./NewsCard";
import { Newspaper } from "lucide-react";

export default function NewsGrid({ items, loading }) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={i} 
            className="h-96 rounded-3xl bg-blue-50/50 border border-black/10 animate-pulse" 
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-black/15 bg-blue-50/30">
        <Newspaper size={56} className="mb-4 text-blue-300" />
        <p className="text-lg font-semibold text-black/70 mb-2">Материалов не найдено</p>
        <p className="text-sm text-black/50">Попробуйте изменить запрос или выбрать другую категорию</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((n) => (
        <NewsCard key={n.id} news={n} />
      ))}
    </div>
  );
}
