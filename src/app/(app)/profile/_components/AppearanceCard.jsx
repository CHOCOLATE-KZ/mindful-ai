"use client";

export default function AppearanceCard({ theme, language, onChange, t }) {
  const isDark = theme === "dark";

  return (
    <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:bg-black/30 dark:border-white/10">
      <h3 className="text-base font-semibold text-black dark:text-white">{t("appearance")}</h3>

      <div className="mt-4 rounded-2xl bg-white/60 p-4 dark:bg-white/5">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-black dark:text-white">{t("darkMode")}</div>
            <div className="text-sm text-black/60 dark:text-white/60">{t("darkModeHint")}</div>
          </div>

          <button
            onClick={() => onChange({ theme: isDark ? "light" : "dark" })}
            className={`h-7 w-12 rounded-full p-1 transition ${
              isDark ? "bg-black/80" : "bg-black/20"
            }`}
            aria-label="toggle theme"
          >
            <div
              className={`h-5 w-5 rounded-full bg-white transition ${
                isDark ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="mt-5">
          <div className="text-sm font-medium text-black/70 dark:text-white/70">{t("language")}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <LangBtn active={language === "ru"} onClick={() => onChange({ language: "ru" })}>Russian</LangBtn>
            <LangBtn active={language === "en"} onClick={() => onChange({ language: "en" })}>English</LangBtn>
            <LangBtn active={language === "kz"} onClick={() => onChange({ language: "kz" })}>Kazakh</LangBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

function LangBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm border transition ${
        active
          ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
          : "bg-white/70 text-black/70 border-black/10 hover:bg-white dark:bg-white/5 dark:text-white/70 dark:border-white/10 dark:hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}
