import { Lightbulb, RefreshCw } from "lucide-react";

export default function PsychologyTipCard({ tip, onRefresh }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-8 border-2 border-blue-100 shadow-xl hover:shadow-2xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-[#74AA9C]" />
          <h3 className="text-2xl font-bold text-black">Совет психолога</h3>
        </div>
        <span className="text-4xl">{tip.icon}</span>
      </div>

      <p className="text-black leading-relaxed mb-4 text-lg">
        {tip.tip}
      </p>

      <div className="flex items-center justify-between gap-3 pt-4 border-t border-blue-100">
        <div>
          <p className="text-sm text-black italic mb-1">— {tip.author}</p>
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[#74AA9C]/10 border border-[#74AA9C]/30 text-[#74AA9C]">
            {tip.category}
          </span>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-[#74AA9C] hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Ещё
        </button>
      </div>
    </div>
  );
}
