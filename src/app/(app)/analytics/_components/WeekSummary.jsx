export default function WeekSummary({ notesStats, t }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6">
      <h3 className="text-xl font-semibold mb-4">{t("myWeek")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-600">{t("mood7days")}</p>
          <p className="text-lg font-semibold">
            {notesStats.avgMoodLast7 != null ? notesStats.avgMoodLast7.toFixed(1) : "?"}
            {notesStats.moodDelta != null && (
              <span className={`ml-2 text-xs ${notesStats.moodDelta >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {notesStats.moodDelta >= 0 ? "↑" : "↓"} {Math.abs(notesStats.moodDelta).toFixed(1)}
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500">{t("comparedToPrevWeek")}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-600">{t("sleep7days")}</p>
          <p className="text-lg font-semibold">
            {notesStats.avgSleepLast7 != null ? `${Math.round(notesStats.avgSleepLast7 / 60)}h` : "?"}
            {notesStats.sleepDelta != null && (
              <span className={`ml-2 text-xs ${notesStats.sleepDelta >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {notesStats.sleepDelta >= 0 ? "↑" : "↓"} {Math.abs(notesStats.sleepDelta / 60).toFixed(1)}h
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500">{t("comparedToPrevWeek")}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-600">{t("weekSummary")}</p>
          <p className="text-sm text-gray-700 mt-1">{notesStats.stressSignal}</p>
        </div>
      </div>
    </div>
  );
}
