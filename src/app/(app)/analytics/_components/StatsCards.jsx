export default function StatsCards({ notesStats, testsCount = 0, t }) {
  const engagement = notesStats.totalNotes > 0 ? Math.min(99, 55 + notesStats.totalNotes) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
      <div className="rounded-2xl border border-[#b3ddd6] bg-[linear-gradient(135deg,#f0f7f5_0%,#e5f3f0_100%)] p-4 shadow-sm">
        <p className="text-[11px] text-slate-600 font-semibold uppercase tracking-wide">{t("totalEntries")}</p>
        <p className="text-2xl font-bold text-slate-900 mt-2">{notesStats.totalNotes}</p>
        <p className="text-xs text-slate-500 mt-2">{t("basedOnEntries")}</p>
      </div>
      <div className="rounded-2xl border border-[#8ecbc2] bg-[linear-gradient(135deg,#d9eeea_0%,#e5f3f0_100%)] p-4 shadow-sm">
        <p className="text-[11px] text-slate-600 font-semibold uppercase tracking-wide">{t("avgMood")}</p>
        <p className="text-2xl font-bold text-slate-900 mt-2">
          {notesStats.avgMood != null ? notesStats.avgMood.toFixed(1) : "?"}/10
        </p>
        <p className="text-xs text-slate-500 mt-2">{t("sourceTests")}: {testsCount}</p>
      </div>
      <div className="rounded-2xl border border-[#8ecbc2] bg-[linear-gradient(135deg,#e5f3f0_0%,#f0f7f5_100%)] p-4 shadow-sm">
        <p className="text-[11px] text-slate-600 font-semibold uppercase tracking-wide">{t("avgSleep")}</p>
        <p className="text-2xl font-bold text-slate-900 mt-2">
          {notesStats.avgSleep != null ? `${Math.round(notesStats.avgSleep / 60)}h` : "—"}
        </p>
        {notesStats.avgSleep == null ? (
          <p className="text-xs text-[#3a6058] mt-2 leading-snug">Записывайте данные о сне 3+ дня, чтобы увидеть статистику</p>
        ) : (
          <p className="text-xs text-slate-500 mt-2">{notesStats.stressSignal}</p>
        )}
      </div>
      <div className="rounded-2xl border border-[#74AA9C] bg-[linear-gradient(135deg,#5d9088_0%,#4a7a70_100%)] p-4 shadow-sm text-white">
        <p className="text-[11px] text-white/85 font-semibold uppercase tracking-wide">{t("emotionalProfile")}</p>
        <p className="text-base font-bold mt-2 leading-snug">{notesStats.profile}</p>
        <p className="text-xs text-white/85 mt-2">Индекс вовлеченности {engagement}%</p>
      </div>
    </div>
  );
}
