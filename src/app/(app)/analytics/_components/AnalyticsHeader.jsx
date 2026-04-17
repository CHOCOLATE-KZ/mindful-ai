export default function AnalyticsHeader({ t, notesCount = 0, testsCount = 0 }) {
  const now = new Date().toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t("title")}</h1>
          <p className="text-sm text-slate-500">{now}</p>
          <p className="text-slate-600 max-w-2xl mt-2">{t("subtitle")}</p>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap justify-end gap-2">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
              {t("sourceNotes")}: {notesCount}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
              {t("sourceTests")}: {testsCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
