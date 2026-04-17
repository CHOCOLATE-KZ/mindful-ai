export default function TestHistory({ testResults, selectedTest }) {
  const filteredResults = testResults.filter((r) => r.test_key === selectedTest);

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900">История попыток</h3>
        <button className="rounded-full bg-[#d9eeea] px-3 py-1 text-xs font-semibold text-[#2a4842]">Поделиться</button>
      </div>
      <div className="space-y-3">
        {filteredResults.map((result, idx) => (
          <div
            key={result.id}
            className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-2"
          >
            <div className="flex justify-between items-start">
              <span className="font-semibold text-slate-800">
                Попытка #{filteredResults.length - idx}
              </span>
              <span className="text-sm text-slate-500">
                {new Date(result.created_at).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed">
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
