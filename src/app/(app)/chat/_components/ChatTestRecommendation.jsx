"use client";

import Link from "next/link";
import { Sparkles, X } from "lucide-react";

function RecommendationBanner({ recommendation, onSkip, variant }) {
  if (!recommendation) return null;

  const isPersonal = variant === "generated" || recommendation.approach === "generated";
  const borderClass = isPersonal
    ? "border-violet-200/80 bg-violet-50/95"
    : "border-teal-200/80 bg-teal-50/95";
  const iconClass = isPersonal ? "text-violet-600" : "text-teal-600";
  const titleClass = isPersonal ? "text-violet-900" : "text-teal-900";
  const textClass = isPersonal ? "text-violet-800" : "text-teal-800";
  const btnClass = isPersonal
    ? "bg-violet-600 hover:bg-violet-700"
    : "bg-teal-600 hover:bg-teal-700";

  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-sm backdrop-blur-sm ${borderClass}`}>
      <div className="flex items-start gap-3">
        <Sparkles className={`h-5 w-5 shrink-0 mt-0.5 ${iconClass}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${titleClass}`}>
            {isPersonal ? "Персональный тест от ИИ" : "Рекомендация из каталога"}
          </p>
          <p className={`text-sm mt-0.5 line-clamp-2 ${textClass}`}>{recommendation.rationale}</p>
          <p className="text-xs text-slate-600 mt-1 font-medium">{recommendation.title}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Link
              href={recommendation.href}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white ${btnClass}`}
            >
              Пройти
            </Link>
            {onSkip && (
              <button
                type="button"
                onClick={() => onSkip(recommendation.id)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-white/50 ${textClass} ${
                  isPersonal ? "border-violet-300" : "border-teal-300"
                }`}
              >
                Позже
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatTestRecommendation({
  recommendations,
  recommendation,
  onDismiss,
  onSkip,
}) {
  const recs = recommendations || {
    generated: recommendation?.approach === "generated" ? recommendation : null,
    catalog: recommendation?.approach === "catalog" ? recommendation : null,
  };

  if (!recs.generated && !recs.catalog) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 pt-2 space-y-2">
      {onDismiss && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 text-slate-400 hover:text-slate-600"
            aria-label="Скрыть"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <RecommendationBanner
        recommendation={recs.generated}
        variant="generated"
        onSkip={onSkip}
      />
      <RecommendationBanner
        recommendation={recs.catalog}
        variant="catalog"
        onSkip={onSkip}
      />
    </div>
  );
}
