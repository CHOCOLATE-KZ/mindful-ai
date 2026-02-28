import NewsCard from "./NewsCard";

export default function NewsGrid({ items, loading }) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={i} 
            className="h-96 rounded-3xl bg-gradient-to-br from-violet-100/50 via-blue-100/50 to-white border border-black/10 animate-pulse" 
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-black/15 bg-gradient-to-br from-gray-50/50 to-white">
        <div className="text-6xl mb-4 opacity-50">📚</div>
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
