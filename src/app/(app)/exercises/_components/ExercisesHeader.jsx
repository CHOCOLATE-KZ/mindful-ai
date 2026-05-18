import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/useLanguage";

export default function ExercisesHeader() {
  const { t } = useLanguage("exercises");
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/40 bg-white/80 p-10 sm:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
      {/* Декоративные элементы */}
      <div className="absolute top-0 right-0 -m-20 h-40 w-40 rounded-full bg-teal-100 blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -m-20 h-40 w-40 rounded-full bg-emerald-100 blur-3xl opacity-60 pointer-events-none" />
      
      <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between z-10">
        <div className="flex-1 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/50 bg-teal-50/80 px-4 py-2 text-sm font-medium text-teal-800 backdrop-blur-sm shadow-sm transition-all hover:bg-teal-100/80">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            {t("badge")}
          </div>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-800 leading-tight">
            {t("heading")}
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-slate-600 leading-relaxed font-light">
            {t("subheading")}
          </p>
        </div>

        <Link
          href="/analytics"
          className="group inline-flex items-center justify-center gap-2.5 rounded-2xl bg-slate-800 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-slate-900/10 transition-all hover:bg-slate-900 hover:shadow-2xl hover:shadow-slate-900/20 hover:-translate-y-1 active:translate-y-0 active:shadow-md whitespace-nowrap"
        >
          <BarChart3 className="h-5 w-5 text-teal-300 transition-colors group-hover:text-teal-400" />
          <span>{t("myAnalytics")}</span>
        </Link>
      </div>
    </div>
  );
}
