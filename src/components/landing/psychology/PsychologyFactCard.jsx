import { RefreshCw } from "lucide-react";

export default function PsychologyFactCard({ fact, onRefresh }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-xl border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:-translate-y-1">
      <div className="relative flex items-center justify-between mb-4">
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#5479F7]/10 border border-[#5479F7]/30 text-[#5479F7]">
          {fact.category}
        </span>
        <span className="text-4xl">{fact.icon}</span>
      </div>

      <h3 className="relative text-2xl font-bold text-black mb-3">
        {fact.title}
      </h3>

      <p className="relative text-black leading-relaxed mb-4">
        {fact.fact}
      </p>

      <div className="relative pt-4 border-t border-blue-100 flex items-center justify-between gap-3">
        <p className="text-xs text-black italic">
          📚 {fact.source}
        </p>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-[#5479F7] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Ещё
        </button>
      </div>
    </div>
  );
}
