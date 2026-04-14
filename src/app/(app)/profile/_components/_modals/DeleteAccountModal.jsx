"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";

export default function DeleteAccountModal({ open, onClose, onConfirm }) {
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleDelete() {
    if (confirm !== "УДАЛИТЬ") return;
    setLoading(true);
    await onConfirm();
    setLoading(false);
  }

  function handleClose() {
    setConfirm("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-6 shadow-2xl dark:bg-[#0B0B0F] dark:border-white/10">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/30">
            <TriangleAlert className="h-5 w-5 text-rose-600" />
          </span>
          <div className="text-lg font-semibold text-black dark:text-white">Удалить аккаунт</div>
        </div>

        <p className="mt-4 text-sm text-black/60 dark:text-white/50">
          Это действие <strong className="text-black dark:text-white">нельзя отменить</strong>. 
          Все ваши данные — заметки, история чатов, настройки — будут удалены навсегда.
        </p>

        <label className="mt-5 block text-sm font-medium text-black/70 dark:text-white/70">
          Введите <code className="rounded bg-slate-100 px-1 dark:bg-white/10">УДАЛИТЬ</code> для подтверждения
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-rose-300 dark:bg-white/5 dark:border-white/10 dark:text-white"
            placeholder="УДАЛИТЬ"
            autoComplete="off"
          />
        </label>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={handleClose}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/[0.03] dark:bg-white/5 dark:border-white/10 dark:text-white"
          >
            Отмена
          </button>
          <button
            onClick={handleDelete}
            disabled={confirm !== "УДАЛИТЬ" || loading}
            className="rounded-full bg-rose-600 px-4 py-2 text-sm text-white transition-colors hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Удаление…" : "Удалить аккаунт"}
          </button>
        </div>
      </div>
    </div>
  );
}
