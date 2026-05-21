"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  getSessionModeConfirmationRequired,
  setSessionModeConfirmationRequired,
} from "@/lib/sessionModeConsent";

export default function PrivacySettingsModal({ open, onClose, settings, onChange, t }) {
  const [clearConfirm, setClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearDone, setClearDone] = useState(false);
  const [sessionConfirmRequired, setSessionConfirmRequired] = useState(true);

  const dataSharingOn = settings?.data_sharing_ai !== false;
  const diaryContextOn = !!settings?.ai_personalization;

  useEffect(() => {
    if (!open) return;
    setSessionConfirmRequired(getSessionModeConfirmationRequired());
  }, [open]);

  const handleToggleSessionConfirm = () => {
    const next = !sessionConfirmRequired;
    setSessionConfirmRequired(next);
    setSessionModeConfirmationRequired(next);
  };

  if (!open) return null;

  async function handleClearChat() {
    setClearing(true);
    try {
      await fetch("/api/chat/clear", { method: "POST" });
      setClearDone(true);
      setClearConfirm(false);
      setTimeout(() => setClearDone(false), 3000);
    } catch {
      // ignore
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-black/10 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-lg font-semibold text-black">{t("privacySettings")}</div>
        <p className="mt-1 text-sm text-black/50">{t("privacyDescription")}</p>

        <div className="mt-5 space-y-3">
          <ToggleRow
            title={t("privacyDataSharingTitle")}
            description={t("privacyDataSharingDescription")}
            value={dataSharingOn}
            onClick={() => {
              const next = !dataSharingOn;
              if (!next) {
                onChange({ data_sharing_ai: false, ai_personalization: false });
              } else {
                onChange({ data_sharing_ai: true });
              }
            }}
          />
          <ToggleRow
            title={t("privacyDiaryContextTitle")}
            description={t("privacyDiaryContextDescription")}
            value={diaryContextOn && dataSharingOn}
            disabled={!dataSharingOn}
            disabledHint={t("privacyDiaryContextRequiresData")}
            onClick={() => {
              if (!dataSharingOn) return;
              onChange({ ai_personalization: !diaryContextOn });
            }}
          />
          <ToggleRow
            title={t("sessionModeConfirmTitle")}
            description={t("sessionModeConfirmDescription")}
            value={sessionConfirmRequired}
            onClick={handleToggleSessionConfirm}
          />

          <div className="rounded-2xl border border-rose-100 bg-rose-50/60 px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-rose-700">{t("clearChatTitle")}</div>
                <div className="mt-0.5 text-xs text-rose-500/80">{t("clearChatDescription")}</div>
              </div>
              {clearDone ? (
                <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                  {t("cleared")}
                </span>
              ) : clearConfirm ? (
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => setClearConfirm(false)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:bg-slate-50 transition"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    onClick={handleClearChat}
                    disabled={clearing}
                    className="flex items-center gap-1 rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                  >
                    <Trash2 className="h-3 w-3" />
                    {clearing ? "..." : t("delete")}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setClearConfirm(true)}
                  className="shrink-0 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-600 hover:text-white"
                >
                  {t("clear")}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/[0.03]"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ title, description, value, onClick, disabled = false, disabledHint }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-2xl border border-black/10 px-4 py-4 ${
        disabled ? "bg-slate-50 opacity-70" : "bg-white/70"
      }`}
    >
      <div className="min-w-0">
        <div className="text-sm font-medium text-black/80">{title}</div>
        {description && <div className="mt-0.5 text-xs text-black/40">{description}</div>}
        {disabled && disabledHint && (
          <div className="mt-1 text-xs text-amber-700/90">{disabledHint}</div>
        )}
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`h-7 w-12 shrink-0 rounded-full p-1 transition ${
          disabled ? "cursor-not-allowed bg-black/10" : value ? "bg-black/80" : "bg-black/20"
        }`}
        aria-label={title}
      >
        <div className={`h-5 w-5 rounded-full bg-white transition ${value ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}
