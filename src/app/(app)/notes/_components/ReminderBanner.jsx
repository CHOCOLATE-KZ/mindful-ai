/**
 * Компонент баннера-напоминания о записи за сегодня
 */
export default function ReminderBanner({ hasRecordToday, notesLength }) {
  if (hasRecordToday || notesLength === 0) return null;

  return (
    <div className="rounded-2xl border border-blue-200/60 bg-gradient-to-r from-blue-50 via-violet-50/50 to-blue-50 p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="relative flex h-10 w-10">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white text-lg">
              ✍️
            </span>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-black/80">Не забудьте записать сегодняшний день!</h3>
          <p className="text-xs text-black/60 mt-0.5">
            Регулярные записи помогают ИИ лучше понять ваши паттерны и дать точные рекомендации
          </p>
        </div>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex-shrink-0 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
        >
          Записать
        </button>
      </div>
    </div>
  );
}
