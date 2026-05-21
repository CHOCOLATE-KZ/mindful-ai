"use client";

import { useState } from "react";

export default function SecurityModal({
  open,
  onClose,
  passwordDraft,
  setPasswordDraft,
  onChangePassword,
  t,
}) {
  const [confirmDraft, setConfirmDraft] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  function handleSubmit() {
    setError("");
    if ((passwordDraft || "").trim().length < 6) {
      setError(t("passwordMinLength"));
      return;
    }
    if (passwordDraft !== confirmDraft) {
      setError(t("passwordsDoNotMatch"));
      return;
    }
    onChangePassword();
    setConfirmDraft("");
    setError("");
  }

  function handleClose() {
    setConfirmDraft("");
    setError("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-black/10 bg-white p-6 shadow-2xl">
        <div className="text-lg font-semibold text-black">{t("security")}</div>
        <p className="mt-1 text-sm text-black/50">{t("newPasswordHint")}</p>

        <label className="mt-5 block text-sm font-medium text-black/70">
          {t("newPassword")}
          <input
            value={passwordDraft}
            onChange={(e) => setPasswordDraft(e.target.value)}
            type="password"
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#74AA9C]/30"
            placeholder={t("newPasswordPlaceholder")}
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-black/70">
          {t("confirmPassword")}
          <input
            value={confirmDraft}
            onChange={(e) => setConfirmDraft(e.target.value)}
            type="password"
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#74AA9C]/30"
            placeholder={t("confirmPasswordPlaceholder")}
          />
        </label>

        {error && (
          <p className="mt-3 text-sm text-rose-500">{error}</p>
        )}

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={handleClose}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/[0.03]"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-full bg-[#74AA9C] px-4 py-2 text-sm text-white hover:bg-[#5d9088] transition-colors"
          >
            {t("changePassword")}
          </button>
        </div>
      </div>
    </div>
  );
}
