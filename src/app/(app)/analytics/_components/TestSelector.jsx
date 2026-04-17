import { TEST_NAMES } from "../_data/analyticsData";

function getRussianAttemptsLabel(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return "попытка";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "попытки";
  return "попыток";
}

export default function TestSelector({ testResults, selectedTest, setSelectedTest, t }) {
  // Показываем ВСЕ доступные тесты из TEST_NAMES
  const allTestKeys = Object.keys(TEST_NAMES);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">{t("selectTestForAnalysis")}</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{allTestKeys.length} тестов</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {allTestKeys.map((testKey) => {
          const count = testResults.filter((r) => r.test_key === testKey).length;
          const hasResults = count > 0;

          return (
            <button
              key={testKey}
              onClick={() => setSelectedTest(testKey)}
              className={`p-4 rounded-2xl border font-medium text-left transition-all ${
                selectedTest === testKey
                  ? "border-[#8ecbc2] bg-[#e5f3f0] text-[#2a4842] shadow-sm"
                  : "border-slate-200 bg-slate-50 text-slate-800 hover:border-[#b3ddd6] hover:bg-white"
              } ${!hasResults ? "opacity-60" : ""}`}
            >
              <div className="font-semibold text-sm leading-snug">{TEST_NAMES[testKey]}</div>
              <div className="text-xs text-slate-500 mt-2">
                {hasResults ? (
                  <>
                    {count} {getRussianAttemptsLabel(count)}
                  </>
                ) : (
                  <span className="text-gray-400">{t("noResults")}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
