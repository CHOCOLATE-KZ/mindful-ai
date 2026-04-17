export default function TopicsCards({ notesStats, t }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="font-semibold mb-3 text-slate-900">{t("mostFrequentTopics")}</h4>
        {notesStats.topTopics.length ? (
          <div className="flex flex-wrap gap-2">
            {notesStats.topTopics.map((t) => (
              <span key={t.word} className="px-3 py-1 rounded-full bg-[#f0f7f5] text-[#3a6058] text-xs border border-[#b3ddd6]">
                {t.word} · {t.count}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">{t("noTextNotes")}</p>
        )}
      </div>
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="font-semibold mb-3 text-slate-900">{t("whenStressRises")}</h4>
        {notesStats.stressTopics.length ? (
          <div className="flex flex-wrap gap-2">
            {notesStats.stressTopics.map((t) => (
              <span key={t.word} className="px-3 py-1 rounded-full bg-[#eef8f6] text-[#2a4842] text-xs border border-[#8ecbc2]">
                {t.word} · {t.count}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">{t("notEnoughLowMood")}</p>
        )}
      </div>
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="font-semibold mb-3 text-slate-900">{t("whatHelps")}</h4>
        {notesStats.positiveTopics.length ? (
          <div className="flex flex-wrap gap-2">
            {notesStats.positiveTopics.map((t) => (
              <span key={t.word} className="px-3 py-1 rounded-full bg-[#e5f3f0] text-[#3a6058] text-xs border border-[#8ecbc2]">
                {t.word} · {t.count}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">{t("notEnoughPositiveMood")}</p>
        )}
      </div>
    </div>
  );
}
