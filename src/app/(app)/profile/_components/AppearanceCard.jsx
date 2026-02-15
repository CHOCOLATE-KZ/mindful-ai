"use client";

export default function AppearanceCard({ theme, language, onChange, t }) {
  const isDark = theme === "dark";

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_12px_35px_rgba(0,0,0,0.06)]">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-blue-600" />

      <h3 className="text-base font-semibold text-black">{t("appearance")}</h3>

      <div className="mt-4 rounded-2xl border border-black/10 bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium text-black">{t("darkMode")}</div>
            <div className="text-sm text-black/60">{t("darkModeHint")}</div>
          </div>

          <button
            type="button"
            onClick={() => onChange({ theme: isDark ? "light" : "dark" })}
            className={`relative h-8 w-14 rounded-full border border-black/10 p-1 transition ${
              isDark ? "bg-blue-600/20" : "bg-black/10"
            }`}
            aria-label="toggle theme"
          >
            <span
              className={`block h-6 w-6 rounded-full bg-white shadow-sm transition ${
                isDark ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="mt-5">
          <div className="text-sm font-medium text-black/70">{t("language")}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <LangBtn active={language === "ru"} onClick={() => onChange({ language: "ru" })}>
              Russian
            </LangBtn>
            <LangBtn active={language === "en"} onClick={() => onChange({ language: "en" })}>
              English
            </LangBtn>
            <LangBtn active={language === "kz"} onClick={() => onChange({ language: "kz" })}>
              Kazakh
            </LangBtn>
          </div>
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
      className={`rounded-full px-3 py-1.5 text-sm border transition ${
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-black/70 border-black/10 hover:bg-black/[0.03]"
      }`}
    >
      {children}
    </button>
  );
}
