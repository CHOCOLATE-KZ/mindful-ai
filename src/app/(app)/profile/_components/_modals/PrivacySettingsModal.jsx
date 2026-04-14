"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function PrivacySettingsModal({ open, onClose, settings, onChange, t }) {
  const [clearConfirm, setClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearDone, setClearDone] = useState(false);

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
      <div className="w-full max-w-lg rounded-3xl border border-black/10 bg-white p-6 shadow-2xl dark:bg-[#0B0B0F] dark:border-white/10">
        <div className="text-lg font-semibold text-black dark:text-white">{t("privacySettings")}</div>
        <p className="mt-1 text-sm text-black/50 dark:text-white/40">
          Управляйте тем, как приложение использует ваши данные
        </p>

        <div className="mt-5 space-y-3">
          <ToggleRow
            title="Персонализация ИИ"
            description="ИИ анализирует ваши заметки и настроение чтобы давать более точные советы"
            value={!!settings?.data_sharing_ai}
            onClick={() => onChange({ data_sharing_ai: !settings?.data_sharing_ai })}
          />
          <ToggleRow
            title="Персонализация чата"
            description="ИИ-ассистент учитывает ваше имя, историю и контекст при ответах"
            value={!!settings?.ai_personalization}
            onClick={() => onChange({ ai_personalization: !settings?.ai_personalization })}
          />

          {/* Clear chat history */}
          <div className="rounded-2xl border border-rose-100 bg-rose-50/60 px-4 py-4 dark:bg-rose-900/10 dark:border-rose-900/30">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-rose-700 dark:text-rose-400">Очистить историю чата</div>
                <div className="mt-0.5 text-xs text-rose-500/80 dark:text-rose-400/60">
                  Удалит все сообщения с ИИ-ассистентом. Заметки и отчёты сохранятся.
                </div>
              </div>
              {clearDone ? (
                <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                  Очищено ✓
                </span>
              ) : clearConfirm ? (
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => setClearConfirm(false)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:bg-slate-50 transition"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleClearChat}
                    disabled={clearing}
                    className="flex items-center gap-1 rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                  >
                    <Trash2 className="h-3 w-3" />
                    {clearing ? "..." : "Удалить"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setClearConfirm(true)}
                  className="shrink-0 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-600 hover:text-white dark:bg-transparent dark:border-rose-700 dark:text-rose-400"
                >
                  Очистить
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/[0.03] dark:bg-white/5 dark:border-white/10 dark:text-white"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ title, description, value, onClick }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white/70 px-4 py-4 dark:bg-white/5 dark:border-white/10">
      <div>
        <div className="text-sm font-medium text-black/80 dark:text-white/80">{title}</div>
        {description && (
          <div className="mt-0.5 text-xs text-black/40 dark:text-white/40">{description}</div>
        )}
      </div>
      <button
        onClick={onClick}
        className={`h-7 w-12 shrink-0 rounded-full p-1 transition ${value ? "bg-black/80" : "bg-black/20"}`}
      >
        <div className={`h-5 w-5 rounded-full bg-white transition ${value ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}
