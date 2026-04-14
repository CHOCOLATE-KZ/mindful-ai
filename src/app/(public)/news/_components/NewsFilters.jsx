import { TAGS } from "../_data/newsData";
import { Search, Tags, Star, ArrowUpDown } from "lucide-react";

function Label({ children, className = "" }) {
  return <label className={`text-sm font-medium text-black/70 ${className}`}>{children}</label>;
}

function TagChip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        cursor-pointer rounded-xl px-4 py-2 text-sm font-medium border transition-all duration-300 
        flex items-center gap-1.5 backdrop-blur-sm shadow-sm hover:shadow-md
        ${
          active
            ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-105"
            : "bg-white text-black/70 border-black/10 hover:bg-blue-50 hover:border-blue-200"
        }
      `}
    >
      {children}
    </button>
  );
}

export default function NewsFilters({ filters }) {
  const { q, setQ, tag, setTag, sort, setSort } = filters;

  return (
    <div className="mb-10 space-y-6 rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
      {/* Search Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Search size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-black/70">Поиск материалов</span>
          </Label>
          {q && (
            <button
              onClick={() => setQ("")}
              className="text-xs text-black/50 hover:text-black/70 transition"
            >
              Очистить
            </button>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Введите тему или ключевое слово..."
            className="w-full h-12 pl-12 pr-6 rounded-2xl border border-black/10 bg-white text-black/80 placeholder-black/40 outline-none transition-all
                       focus:border-blue-300 focus:ring-4 focus:ring-blue-100/50 shadow-sm"
          />
        </div>
      </div>

      {/* Tags Filter */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Tags size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-black/70">Категории</span>
        </Label>

        <div className="flex flex-wrap gap-2">
          <TagChip active={!tag} onClick={() => setTag("")}>
            <Star size={14} className="mr-1.5" /> Все
          </TagChip>
          {TAGS.map((t) => (
            <TagChip key={t} active={tag === t} onClick={() => setTag(t)}>
              {t}
            </TagChip>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center justify-between pt-4 border-t border-black/10">
        <div className="flex items-center gap-2">
          <ArrowUpDown size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-black/70">Сортировка</span>
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-10 rounded-xl border border-black/10 bg-white/80 backdrop-blur-sm px-4 text-sm text-black/80 outline-none transition-all
                     focus:border-blue-300 focus:ring-4 focus:ring-blue-100/50 shadow-sm cursor-pointer"
        >
          <option value="latest">Сначала новые</option>
          <option value="oldest">Сначала старые</option>
        </select>
      </div>
    </div>
  );
}
