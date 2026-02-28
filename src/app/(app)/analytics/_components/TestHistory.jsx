export default function TestHistory({ testResults, selectedTest }) {
  const filteredResults = testResults.filter((r) => r.test_key === selectedTest);

  return (
    <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6">
      <h3 className="text-xl font-semibold mb-6">📝 История попыток</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredResults.map((result, idx) => (
          <div
            key={result.id}
            className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-2"
          >
            <div className="flex justify-between items-start">
              <span className="font-semibold text-gray-800">
                Попытка #{filteredResults.length - idx}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(result.created_at).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Ответы:{" "}
              {Object.entries(result.answers || {})
                .map(([q, a]) => `В${parseInt(q) + 1}: ${a}`)
                .join(" | ")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
