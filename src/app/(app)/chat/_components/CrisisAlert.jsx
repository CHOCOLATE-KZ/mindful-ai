"use client";

import { Phone, Heart, X } from "lucide-react";

/**
 * Кризисный экран — отображается когда API вернул { crisis: true }.
 * Показывает номера телефонов доверия и спрашивает, продолжать ли тяжёлую тему.
 */
export default function CrisisAlert({
  onDismiss,
  onContinueTopic,
  onDeclineTopic,
  busy = false,
}) {
  return (
    <div className="mx-auto max-w-lg my-4">
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 h-11 w-11 rounded-full bg-rose-100 flex items-center justify-center">
            <Heart className="h-6 w-6 text-rose-500" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-rose-800 leading-snug">
              Похоже, тебе сейчас очень тяжело
            </h3>
            <p className="mt-1 text-sm text-rose-700 leading-relaxed">
              Эти чувства реальны, и ты не одинок. Пожалуйста, обратись за поддержкой к
              живому человеку — ниже линии доверия.
            </p>
            <p className="mt-3 text-sm font-medium text-rose-800">
              Хочешь продолжить разговор об этой теме?
            </p>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="flex-shrink-0 h-8 w-8 rounded-full grid place-items-center hover:bg-rose-100 transition text-rose-400"
            aria-label="Закрыть"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
            Линии экстренной психологической помощи
          </p>

          <HotlineItem flag="🇰🇿" country="Казахстан" number="150" hint="Бесплатно, 24/7" />
          <HotlineItem
            flag="🇷🇺"
            country="Россия"
            number="8-800-2000-122"
            hint="Бесплатно, 24/7"
          />
          <HotlineItem
            flag="🌐"
            country="Международный"
            number="+7 (727) 322-22-22"
            hint="Психологическая помощь"
          />
        </div>

        <div className="mt-5 rounded-2xl bg-white/70 px-4 py-3 border border-rose-100">
          <p className="text-sm text-slate-700 leading-relaxed">
            <strong>Я здесь, чтобы поддержать тебя</strong>, но в кризисной ситуации живой
            специалист справится гораздо лучше. Если хочешь поговорить о другом — я
            переключусь и не буду возвращаться к этой теме без твоего запроса.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <button
            type="button"
            onClick={onDeclineTopic}
            disabled={busy || !onDeclineTopic}
            className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold text-rose-800 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Подождите…" : "Поговорить о другом"}
          </button>
          <button
            type="button"
            onClick={onContinueTopic}
            disabled={busy || !onContinueTopic}
            className="inline-flex items-center justify-center rounded-2xl bg-[#74AA9C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5d9088] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Готовлю ответ…" : "Продолжить эту тему"}
          </button>
        </div>
      </div>
    </div>
  );
}

function HotlineItem({ flag, country, number, hint }) {
  return (
    <a
      href={`tel:${number.replace(/\s/g, "")}`}
      className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-white px-4 py-3 hover:bg-rose-50 transition group"
    >
      <span className="text-xl">{flag}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-800">{country}</div>
        <div className="text-xs text-slate-500">{hint}</div>
      </div>
      <div className="flex items-center gap-1.5 text-rose-600 font-semibold text-sm group-hover:text-rose-700">
        <Phone className="h-4 w-4" />
        {number}
      </div>
    </a>
  );
}
