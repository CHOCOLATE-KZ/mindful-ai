import Link from "next/link";
import { Sparkles } from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/** Карточка рекомендации: каталог (TestCard) или сгенерированный ИИ опросник. */
export default function RecommendedTestCard({ recommendation, catalogTest }) {
  if (!recommendation) return null;

  if (recommendation.approach === "catalog" && catalogTest) {
    const href = `/exercises/${catalogTest.key}?rec=${recommendation.id}`;
    return (
      <div className="rounded-3xl border-2 border-teal-400/80 bg-gradient-to-br from-teal-50/95 to-white/90 p-1 shadow-lg ring-2 ring-teal-500/10">
        <div className="rounded-[1.35rem] bg-white/60 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-teal-800 font-semibold text-sm mb-3">
            <Sparkles className="h-4 w-4" />
            Рекомендовано ИИ · из каталога
          </div>
          {recommendation.rationale ? (
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">{recommendation.rationale}</p>
          ) : null}
          <Link
            href={href}
            className="group block rounded-2xl border border-teal-200/80 bg-white/90 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-100 text-teal-700 shrink-0">
                <catalogTest.Icon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold text-slate-900">{catalogTest.title}</p>
                <p className="text-sm text-slate-600 mt-1">{catalogTest.description}</p>
                <span className="inline-flex mt-4 text-sm font-semibold text-teal-700 group-hover:text-teal-800">
                  Пройти тест →
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border-2 border-violet-400/70 bg-gradient-to-br from-violet-50/95 to-white/90 p-1 shadow-lg ring-2 ring-violet-500/10">
      <div className="rounded-[1.35rem] bg-white/60 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-violet-800 font-semibold text-sm mb-2">
          <Sparkles className="h-4 w-4" />
          Рекомендовано ИИ · персональный опросник
        </div>
        <h3 className="text-xl font-bold text-slate-900">{recommendation.title}</h3>
        {recommendation.rationale ? (
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">{recommendation.rationale}</p>
        ) : null}
        {recommendation.generatedTest?.description ? (
          <p className="mt-2 text-sm text-slate-500">{recommendation.generatedTest.description}</p>
        ) : null}
        <Link
          href={recommendation.href}
          className={cn(
            "inline-flex mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white",
            "hover:bg-violet-700 transition-colors"
          )}
        >
          Пройти персональный тест
        </Link>
      </div>
    </div>
  );
}
