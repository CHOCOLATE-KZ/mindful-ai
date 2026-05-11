"use client";

import { Bot, HelpCircle } from "lucide-react";
import { useState } from "react";

export default function AiPersonalizationCard({ settings, onChange, t }) {
  const enabled = !!settings?.ai_personalization;
  const [tooltipVisible, setTooltipVisible] = useState(false);

  return (
    <div className="rounded-3xl border border-slate-100 bg-white shadow-md">
      <div className="flex items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
            <Bot className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-800">{t("ai")}</span>
              <div className="relative">
                <button
                  type="button"
                  onMouseEnter={() => setTooltipVisible(true)}
                  onMouseLeave={() => setTooltipVisible(false)}
                  onFocus={() => setTooltipVisible(true)}
                  onBlur={() => setTooltipVisible(false)}
                  className="flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Что даёт персонализация"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>

                {tooltipVisible && (
                  <div
                    role="tooltip"
                    className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl text-xs text-slate-600 dark:bg-[#1a1a24] dark:border-white/10 dark:text-white/70"
                  >
                    <div className="mb-1.5 font-semibold text-slate-800 dark:text-white text-sm">
                      Что даёт персонализация?
                    </div>
                    <ul className="space-y-1 list-none">
                      <li className="flex gap-1.5"><span className="text-blue-500">•</span>ИИ видит ваш тренд настроения за 7 дней</li>
                      <li className="flex gap-1.5"><span className="text-blue-500">•</span>Учитывает качество вашего сна</li>
                      <li className="flex gap-1.5"><span className="text-blue-500">•</span>Замечает дни с низким настроением</li>
                      <li className="flex gap-1.5"><span className="text-blue-500">•</span>Даёт более точные рекомендации</li>
                    </ul>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-[#1a1a24]" />
                  </div>
                )}
              </div>
            </div>
            <div className="text-sm text-slate-500">{t("aiHint")}</div>
          </div>
        </div>

        <Switch
          checked={enabled}
          onChange={() => onChange({ ai_personalization: !enabled })}
          ariaLabel="toggle ai personalization"
        />
      </div>
    </div>
  );
}

function Switch({ checked, onChange, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-7 w-12 shrink-0 rounded-full p-1 transition-colors ${
        checked ? "bg-blue-500" : "bg-slate-200"
      }`}
      aria-label={ariaLabel}
    >
      <span
        className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
