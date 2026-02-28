export default function LoadMoreButton({ hasMore, loadingMore, onLoadMore }) {
  if (hasMore) {
    return (
      <button
        onClick={onLoadMore}
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
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 px-6 py-3">
      <p className="text-sm font-medium text-emerald-700 flex items-center gap-2">
        <span className="text-lg">✅</span>
        Это все материалы
      </p>
    </div>
  );
}
