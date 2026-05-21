"use client";

export default function AppearanceCard({ language, onChange, t }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
      <h3 className="mb-4 text-base font-semibold text-slate-800">{t("language")}</h3>

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
