export default function WeekSummary({ notesStats, t }) {
  return (
    <div className="h-full rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <h3 className="text-xl font-semibold mb-4 text-slate-900">Детальный разбор недели</h3>
      <p className="text-xs text-slate-500 mb-4">Ключевые изменения за последние 7 дней</p>
      <div className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">{t("mood7days")}</p>
          <p className="text-xl font-semibold text-slate-900 mt-1">
            {notesStats.avgMoodLast7 != null ? notesStats.avgMoodLast7.toFixed(1) : "?"}
            {notesStats.moodDelta != null && (
              <span className={`ml-2 text-sm ${notesStats.moodDelta >= 0 ? "text-[#3a6058]" : "text-slate-500"}`}>
                {notesStats.moodDelta >= 0 ? "↑" : "↓"} {Math.abs(notesStats.moodDelta).toFixed(1)}
              </span>
            )}
          </p>
          <p className="text-xs text-slate-500 mt-1">{t("comparedToPrevWeek")}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">{t("sleep7days")}</p>
          <p className="text-xl font-semibold text-slate-900 mt-1">
            {notesStats.avgSleepLast7 != null ? `${Math.round(notesStats.avgSleepLast7 / 60)}h` : "?"}
            {notesStats.sleepDelta != null && (
              <span className={`ml-2 text-sm ${notesStats.sleepDelta >= 0 ? "text-[#3a6058]" : "text-slate-500"}`}>
                {notesStats.sleepDelta >= 0 ? "↑" : "↓"} {Math.abs(notesStats.sleepDelta / 60).toFixed(1)}h
              </span>
            )}
          </p>
          <p className="text-xs text-slate-500 mt-1">{t("comparedToPrevWeek")}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">{t("weekSummary")}</p>
          <p className="text-sm text-slate-700 mt-1 leading-relaxed">{notesStats.stressSignal}</p>
        </div>
      </div>
    </div>
  );
}
