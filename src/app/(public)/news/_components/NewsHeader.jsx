import { Newspaper } from "lucide-react";

export default function NewsHeader({ totalCount }) {
  return (
    <div className="mb-8">
      {/* Masthead bar */}
      <div className="flex items-center justify-between py-4 border-b-2 border-slate-900 mb-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#74AA9C] text-white">
            <Newspaper size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
              Психо<span className="text-[#74AA9C]">Новости</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">База знаний по психологии</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-black text-slate-900">{totalCount || "—"}</div>
            <div className="text-xs text-slate-500">материалов</div>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#74AA9C] opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#74AA9C]" />
            </span>
            <span className="text-xs font-semibold text-[#74AA9C] uppercase tracking-widest">LIVE</span>
          </div>
        </div>
      </div>

      {/* Thin accent line */}
      <div className="h-0.5 bg-gradient-to-r from-[#74AA9C] via-emerald-400 to-transparent" />
    </div>
  );
}
