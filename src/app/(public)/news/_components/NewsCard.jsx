export default function NewsCard({ news }) {
  return (
    <a
      href={news.url}
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
              {news.source || "Источник"}
            </span>
          </div>
          {news.published_at && (
            <div className="rounded-lg bg-blue-100/70 px-2.5 py-1">
              <span className="text-xs font-medium text-blue-700">
                {new Date(news.published_at).toLocaleDateString("ru-RU", { 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold leading-tight text-black mb-3 group-hover:text-violet-600 transition-colors duration-200 line-clamp-3">
          {news.title}
        </h2>

        {/* Summary */}
        {news.summary && (
          <p className="text-sm leading-relaxed text-black/65 line-clamp-3 mb-4 flex-grow">
            {news.summary}
          </p>
        )}

        {/* Tags */}
        {(news.tags || []).length > 0 && (
          <div className="mt-auto pt-4 border-t border-black/10">
            <div className="flex flex-wrap gap-2">
              {(news.tags || []).slice(0, 3).map((tg) => (
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
  );
}
