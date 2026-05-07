import { TAGS } from "../_data/newsData";
import { Search } from "lucide-react";

export default function NewsFilters({ filters }) {
  const { q, setQ, tag, setTag } = filters;

  return (
    <div className="mb-6 space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск по материалам..."
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 text-sm outline-none transition-all focus:border-[#74AA9C] focus:ring-2 focus:ring-[#74AA9C]/20 shadow-sm"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tag chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTag("")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
            !tag
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
          }`}
        >
          Все
        </button>
        {TAGS.map((t) => (
          <button
            key={t}
            onClick={() => setTag(t === tag ? "" : t)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
              tag === t
                ? "bg-[#74AA9C] text-white border-[#74AA9C]"
                : "bg-white text-slate-600 border-slate-200 hover:border-[#74AA9C]/50 hover:text-[#74AA9C]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
