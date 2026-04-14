import { TEST_NAMES } from "../_data/analyticsData";

export default function TestStatsCards({ testAnalytics, selectedTest }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-2xl border border-black/10 bg-blue-50 p-6">
        <p className="text-gray-600 text-sm font-semibold">Всего попыток</p>
        <p className="text-3xl font-bold text-blue-600 mt-2">
          {testAnalytics.totalAttempts}
        </p>
      </div>

      <div className="rounded-2xl border border-black/10 bg-emerald-50 p-6">
        <p className="text-gray-600 text-sm font-semibold">Последняя попытка</p>
        <p className="text-lg font-semibold text-green-700 mt-2">
          {new Date(testAnalytics.lastAttempt).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="rounded-2xl border border-black/10 bg-blue-50 p-6">
        <p className="text-gray-600 text-sm font-semibold">Название теста</p>
        <p className="text-lg font-semibold text-blue-700 mt-2">
          {TEST_NAMES[selectedTest]}
        </p>
      </div>
    </div>
  );
}
