export default function TopicsCards({ notesStats }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur-xl p-6">
        <h4 className="font-semibold mb-3">Самые частые темы</h4>
        {notesStats.topTopics.length ? (
          <div className="flex flex-wrap gap-2">
            {notesStats.topTopics.map((t) => (
              <span key={t.word} className="px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs">
                {t.word} · {t.count}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Пока нет текстовых заметок.</p>
        )}
      </div>
      <div className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur-xl p-6">
        <h4 className="font-semibold mb-3">Когда растёт стресс</h4>
        {notesStats.stressTopics.length ? (
          <div className="flex flex-wrap gap-2">
            {notesStats.stressTopics.map((t) => (
              <span key={t.word} className="px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs">
                {t.word} · {t.count}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Недостаточно данных о плохом настроении.</p>
        )}
      </div>
      <div className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur-xl p-6">
        <h4 className="font-semibold mb-3">Что помогает</h4>
        {notesStats.positiveTopics.length ? (
          <div className="flex flex-wrap gap-2">
            {notesStats.positiveTopics.map((t) => (
              <span key={t.word} className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs">
                {t.word} · {t.count}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Недостаточно данных о хорошем настроении.</p>
        )}
      </div>
    </div>
  );
}
