"use client";

export default function EditProfileModal({
  open,
  onClose,
  user,
  profile,
  nameDraft,
  setNameDraft,
  onSave,
  onAvatarSelected,
  t,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-black/10 bg-white p-6 shadow-2xl dark:bg-[#0B0B0F] dark:border-white/10">
        <div className="text-lg font-semibold text-black dark:text-white">{t("editProfile")}</div>

        <label className="mt-5 block text-sm font-medium text-black/70 dark:text-white/70">
          {t("yourName")}
          <input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10 dark:bg-white/5 dark:border-white/10 dark:text-white"
            placeholder="Your name..."
          />
        </label>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/[0.03] dark:bg-white/5 dark:border-white/10 dark:text-white"
          >
            {t("cancel")}
          </button>
          <button
            onClick={onSave}
            className="rounded-full bg-black px-4 py-2 text-sm text-white hover:opacity-90 dark:bg-white dark:text-black"
          >
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
