import Link from "next/link";

export default function BackButtons() {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] space-y-3">
      <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">Навигация</p>
      <div className="grid grid-cols-1 gap-2">
        <Link
          href="/exercises"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#5d9088] text-white font-semibold hover:bg-[#4a7a70] transition"
        >
          ← Вернуться к тестам
        </Link>
        <Link
          href="/profile"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
        >
          Мой профиль
        </Link>
      </div>
    </div>
  );
}
