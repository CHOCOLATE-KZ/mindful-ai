import { TEST_NAMES } from "../_data/analyticsData";

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
                  ? "border-purple-500 bg-purple-50 text-purple-900"
                  : "border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50"
              } ${!hasResults ? "opacity-60" : ""}`}
            >
              <div className="font-semibold">{TEST_NAMES[testKey]}</div>
              <div className="text-sm text-gray-500 mt-1">
                {hasResults ? (
                  <>
                    {count} попыток{count % 10 === 1 && count !== 11 ? "а" : ""}
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
