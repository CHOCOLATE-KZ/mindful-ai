"use client";

import { useState } from "react";
import { ExternalLink, Download, FileJson, FileText, X } from "lucide-react";

export default function PrivacyDataCard({ onOpenPrivacy, onExport, t }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleExport(format) {
    setConfirmOpen(false);
    onExport(format);
  }

  return (
    <>
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
            onClick={() => setConfirmOpen(true)}
            title={t("export")}
            hint={t("exportHint")}
            color="text-emerald-500 bg-emerald-50"
          />
        </div>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-6 shadow-2xl">
            {/* header */}
            <div className="flex items-start justify-between gap-3">
              <div className="text-base font-semibold text-slate-800">Экспорт данных</div>
              <button onClick={() => setConfirmOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Выберите формат. Будут включены: заметки, история чатов, результаты тестов, настройки профиля.
            </p>

            {/* format cards */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleExport("json")}
                className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white p-5 text-center transition hover:border-blue-400 hover:bg-blue-50 active:scale-95"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 group-hover:bg-blue-200 transition">
                  <FileJson className="h-6 w-6 text-blue-600" />
                </span>
                <div>
                  <div className="font-semibold text-slate-800">JSON</div>
                  <div className="mt-0.5 text-xs text-slate-400">Для разработчиков и резервных копий</div>
                </div>
              </button>

              <button
                onClick={() => handleExport("pdf")}
                className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white p-5 text-center transition hover:border-rose-400 hover:bg-rose-50 active:scale-95"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 group-hover:bg-rose-200 transition">
                  <FileText className="h-6 w-6 text-rose-500" />
                </span>
                <div>
                  <div className="font-semibold text-slate-800">PDF</div>
                  <div className="mt-0.5 text-xs text-slate-400">Красивый читаемый отчёт</div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setConfirmOpen(false)}
              className="mt-4 w-full rounded-full border border-slate-200 py-2 text-sm text-slate-500 hover:bg-slate-50 transition"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </>
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
    </button>
  );
}
