"use client";

export default function PrivacyDataCard({ onOpenPrivacy, onExport, t }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:bg-black/30 dark:border-white/10">
      <h3 className="text-base font-semibold text-black dark:text-white">{t("privacy")}</h3>

      <div className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-white/60 dark:bg-white/5 dark:border-white/10">
        <button
          onClick={onOpenPrivacy}
          className="w-full px-4 py-4 text-left hover:bg-black/[0.03] dark:hover:bg-white/5"
        >
          <div className="font-medium text-black dark:text-white">{t("privacySettings")}</div>
          <div className="text-sm text-black/60 dark:text-white/60">{t("privacyHint")}</div>
        </button>

        <div className="h-px bg-black/10 dark:bg-white/10" />

        <button
          onClick={onExport}
          className="w-full px-4 py-4 text-left hover:bg-black/[0.03] dark:hover:bg-white/5"
        >
          <div className="font-medium text-black dark:text-white">{t("export")}</div>
          <div className="text-sm text-black/60 dark:text-white/60">{t("exportHint")}</div>
        </button>
      </div>
    </div>
  );
}
