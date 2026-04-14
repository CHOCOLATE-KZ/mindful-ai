"use client";

import { ExternalLink, Download } from "lucide-react";

export default function PrivacyDataCard({ onOpenPrivacy, onExport, t }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-md">
      <div className="divide-y divide-slate-100">
        <RowButton
          icon={<ExternalLink className="h-4 w-4" />}
          onClick={onOpenPrivacy}
          title={t("privacySettings")}
          hint={t("privacyHint")}
          color="text-blue-500 bg-blue-50"
        />
        <RowButton
          icon={<Download className="h-4 w-4" />}
          onClick={onExport}
          title={t("export")}
          hint={t("exportHint")}
          color="text-emerald-500 bg-emerald-50"
        />
      </div>
    </div>
  );
}

function RowButton({ onClick, title, hint, icon, color }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-slate-50 active:bg-slate-100"
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-medium text-slate-800">{title}</div>
        <div className="text-sm text-slate-500">{hint}</div>
      </div>
      <svg className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
