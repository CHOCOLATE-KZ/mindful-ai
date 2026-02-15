"use client";

export default function PrivacyDataCard({ onOpenPrivacy, onExport, t }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_12px_35px_rgba(0,0,0,0.06)]">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-blue-600" />

      <h3 className="text-base font-semibold text-black">{t("privacy")}</h3>

      <div className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-white">
        <RowButton
          onClick={onOpenPrivacy}
          title={t("privacySettings")}
          hint={t("privacyHint")}
        />

        <div className="h-px bg-black/10" />

        <RowButton
          onClick={onExport}
          title={t("export")}
          hint={t("exportHint")}
        />
      </div>
    </div>
  );
}

function RowButton({ onClick, title, hint }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full px-4 py-4 text-left transition hover:bg-black/[0.03]"
    >
      <div className="font-medium text-black">{title}</div>
      <div className="text-sm text-black/60">{hint}</div>
    </button>
  );
}
