"use client";

export default function LanguageSelector({ value, onChange, t }) {
  return (
    <div className="mt-4">
      <div className="text-sm font-medium">{t("language")}</div>
      <div className="mt-2 flex gap-2">
        {[
          ["ru", t("langRu")],
          ["en", t("langEn")],
          ["kz", t("langKz")],
        ].map(([code, label]) => (
          <button
            key={code}
            onClick={() => onChange(code)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              value === code
                ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                : "border-black/10 bg-white hover:bg-black/[0.03] dark:bg-black/20 dark:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
