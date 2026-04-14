"use client";

import { Sun, Moon } from "lucide-react";

export default function AppearanceCard({ theme, language, onChange, t }) {
  const isDark = theme === "dark";

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
      <h3 className="mb-4 text-base font-semibold text-slate-800">{t("appearance")}</h3>

      {/* theme toggle */}
      <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2">
          {isDark ? (
            <Moon className="h-4 w-4 text-blue-500" />
          ) : (
            <Sun className="h-4 w-4 text-amber-500" />
          )}
          <div>
            <div className="text-sm font-medium text-slate-800">{t("darkMode")}</div>
            <div className="text-xs text-slate-500">{t("darkModeHint")}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onChange({ theme: isDark ? "light" : "dark" })}
          className={`relative h-7 w-12 rounded-full p-1 transition-colors ${
            isDark ? "bg-blue-500" : "bg-slate-200"
          }`}
          aria-label="toggle theme"
        >
          <span
            className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${
              isDark ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* language */}
      <div className="mt-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{t("language")}</div>
        <div className="grid grid-cols-3 gap-2">
          <LangBtn active={language === "ru"} onClick={() => onChange({ language: "ru" })}>
            {t ? t("langRu") : "Русский"}
          </LangBtn>
          <LangBtn active={language === "en"} onClick={() => onChange({ language: "en" })}>
            {t ? t("langEn") : "English"}
          </LangBtn>
          <LangBtn active={language === "kz"} onClick={() => onChange({ language: "kz" })}>
            {t ? t("langKz") : "Қазақша"}
          </LangBtn>
        </div>
      </div>
    </div>
  );
}

function LangBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl py-2 text-sm font-medium transition ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}
