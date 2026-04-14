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

  const name = profile?.name || user?.email || "User";
  const initials = (name || "U").slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-black/10 bg-white p-6 shadow-2xl dark:bg-[#0B0B0F] dark:border-white/10">
        <div className="text-lg font-semibold text-black dark:text-white">{t("editProfile")}</div>

        <div className="mt-4 flex items-center gap-4">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-blue-200"
            />
          ) : (
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
              {initials}
            </div>
          )}

          <label className="inline-flex cursor-pointer items-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black/80 transition hover:bg-black/[0.03] dark:bg-white/5 dark:border-white/10 dark:text-white">
            Загрузить аватар
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => onAvatarSelected?.(e.target.files?.[0])}
            />
          </label>
        </div>

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
