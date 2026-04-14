"use client";

import { Bot } from "lucide-react";

export default function AiPersonalizationCard({ settings, onChange, t }) {
  const enabled = !!settings?.ai_personalization;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-md">
      <div className="flex items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
            <Bot className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-slate-800">{t("ai")}</div>
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
