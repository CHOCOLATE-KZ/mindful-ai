"use client";



import Link from "next/link";

import { Lock, MessageCircle, Sparkles } from "lucide-react";



function RecommendationLink({ recommendation, variant }) {

  if (!recommendation) return null;

  const isPersonal = variant === "generated";

  const borderClass = isPersonal

    ? "border-violet-200 bg-violet-50/90"

    : "border-teal-200 bg-teal-50/90";

  const iconClass = isPersonal ? "text-violet-600" : "text-teal-600";

  const titleClass = isPersonal ? "text-violet-900" : "text-teal-900";

  const textClass = isPersonal ? "text-violet-800" : "text-teal-800";

  const btnClass = isPersonal

    ? "bg-violet-600 hover:bg-violet-700"

    : "bg-teal-600 hover:bg-teal-700";



  return (

    <div className={`rounded-2xl border p-5 shadow-sm ${borderClass}`}>

      <div className="flex items-start gap-3">

        <Sparkles className={`h-6 w-6 shrink-0 mt-0.5 ${iconClass}`} />

        <div className="flex-1 min-w-0">

          <p className={`font-semibold ${titleClass}`}>

            {isPersonal ? "Персональный тест от ИИ" : "Рекомендация из каталога"}

          </p>

          <p className={`text-sm mt-1 ${textClass}`}>{recommendation.rationale}</p>

          <p className="text-sm font-medium text-slate-800 mt-2">{recommendation.title}</p>

          <Link

            href={recommendation.href}

            className={`inline-flex mt-3 rounded-xl px-4 py-2 text-sm font-semibold text-white ${btnClass}`}

          >

            Пройти тест

          </Link>

        </div>

      </div>

    </div>

  );

}



export default function TestsGateBanner({

  gate,

  pendingRecommendation,

  pendingRecommendations,

  showRecommendation = true,

}) {

  const recs = pendingRecommendations || {

    generated:

      pendingRecommendation?.approach === "generated" ? pendingRecommendation : null,

    catalog: pendingRecommendation?.approach === "catalog" ? pendingRecommendation : null,

  };



  if (!gate || gate.unlocked) {

    if (showRecommendation && (recs.generated || recs.catalog)) {

      return (

        <div className="space-y-3">

          <RecommendationLink recommendation={recs.generated} variant="generated" />

          <RecommendationLink recommendation={recs.catalog} variant="catalog" />

        </div>

      );

    }

    return null;

  }



  const remaining = gate.remaining ?? 0;



  return (

    <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-md">

      <div className="flex items-start gap-4">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">

          <Lock className="h-6 w-6 text-slate-500" />

        </div>

        <div className="flex-1">

          <h3 className="text-lg font-bold text-slate-800">Персональные рекомендации — после диалога</h3>

          <p className="mt-2 text-sm text-slate-600 leading-relaxed">

            Все тесты ниже доступны сразу. После нескольких сообщений в чате ИИ создаст

            персональный опросник и предложит шкалу из каталога под ваш контекст.

          </p>

          <p className="mt-3 text-sm font-medium text-teal-800">

            Осталось сообщений в чате: {remaining} из {gate.required}

          </p>

          <Link

            href="/chat"

            className="inline-flex items-center gap-2 mt-4 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"

          >

            <MessageCircle className="h-4 w-4" />

            Перейти в чат

          </Link>

        </div>

      </div>

    </div>

  );

}

