import { TEST_NAMES } from "../_data/analyticsData";

export default function TestStatsCards({ testAnalytics, selectedTest }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-2xl border border-[#b3ddd6] bg-[linear-gradient(135deg,#f0f7f5_0%,#e5f3f0_100%)] p-5 shadow-sm">
        <p className="text-slate-600 text-xs font-semibold uppercase tracking-wide">Всего попыток</p>
        <p className="text-3xl font-bold text-slate-900 mt-2">
          {testAnalytics.totalAttempts}
        </p>
      </div>

      <div className="rounded-2xl border border-[#8ecbc2] bg-[linear-gradient(135deg,#d9eeea_0%,#e5f3f0_100%)] p-5 shadow-sm">
        <p className="text-slate-600 text-xs font-semibold uppercase tracking-wide">Последняя попытка</p>
        <p className="text-lg font-semibold text-slate-900 mt-2 leading-snug">
          {new Date(testAnalytics.lastAttempt).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="rounded-2xl border border-[#8ecbc2] bg-[linear-gradient(135deg,#e5f3f0_0%,#f0f7f5_100%)] p-5 shadow-sm">
        <p className="text-slate-600 text-xs font-semibold uppercase tracking-wide">Название теста</p>
        <p className="text-lg font-semibold text-slate-900 mt-2 leading-snug">
          {TEST_NAMES[selectedTest]}
        </p>
      </div>
    </div>
  );
}
