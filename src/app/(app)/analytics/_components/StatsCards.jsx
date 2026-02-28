export default function StatsCards({ notesStats, t }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-violet-50 to-white p-6">
        <p className="text-sm text-gray-600 font-semibold">{t("emotionalProfile")}</p>
        <p className="text-xl font-bold text-violet-700 mt-2">{notesStats.profile}</p>
        <p className="text-xs text-gray-500 mt-2">{t("basedOnEntries")}</p>
      </div>
      <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-blue-50 to-white p-6">
        <p className="text-sm text-gray-600 font-semibold">{t("avgMood")}</p>
        <p className="text-2xl font-bold text-blue-700 mt-2">
          {notesStats.avgMood != null ? notesStats.avgMood.toFixed(1) : "?"}/10
        </p>
        <p className="text-xs text-gray-500 mt-2">{t("totalEntries")}: {notesStats.totalNotes}</p>
      </div>
      <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-emerald-50 to-white p-6">
        <p className="text-sm text-gray-600 font-semibold">{t("avgSleep")}</p>
        <p className="text-2xl font-bold text-emerald-700 mt-2">
          {notesStats.avgSleep != null ? `${Math.round(notesStats.avgSleep / 60)}h` : "?"}
        </p>
        <p className="text-xs text-gray-500 mt-2">{notesStats.stressSignal}</p>
      </div>
    </div>
  );
}
