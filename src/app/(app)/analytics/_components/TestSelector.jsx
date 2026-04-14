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
    <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6 space-y-4">
      <h2 className="text-xl font-semibold">{t("selectTestForAnalysis")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {allTestKeys.map((testKey) => {
          const count = testResults.filter((r) => r.test_key === testKey).length;
          const hasResults = count > 0;

          return (
            <button
              key={testKey}
              onClick={() => setSelectedTest(testKey)}
              className={`p-4 rounded-xl border-2 font-medium text-left transition ${
                selectedTest === testKey
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50"
              } ${!hasResults ? "opacity-60" : ""}`}
            >
              <div className="font-semibold">{TEST_NAMES[testKey]}</div>
              <div className="text-sm text-gray-500 mt-1">
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
