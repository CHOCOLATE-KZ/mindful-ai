"use client";

export default function PrivacySettingsModal({ open, onClose, settings, onChange, t }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-black/10 bg-white p-6 shadow-2xl dark:bg-[#0B0B0F] dark:border-white/10">
        <div className="text-lg font-semibold text-black dark:text-white">{t("privacySettings")}</div>

        <div className="mt-5 space-y-3">
          <ToggleRow
            title="Data sharing with AI"
            value={!!settings?.data_sharing}
            onClick={() => onChange({ data_sharing: !settings?.data_sharing })}
          />
          <ToggleRow
            title="Anonymous analytics"
            value={!!settings?.anonymous_analytics}
            onClick={() => onChange({ anonymous_analytics: !settings?.anonymous_analytics })}
          />
          <ToggleRow
            title="Activity tracking"
            value={!!settings?.activity_tracking}
            onClick={() => onChange({ activity_tracking: !settings?.activity_tracking })}
          />
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

function ToggleRow({ title, value, onClick }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/70 px-4 py-4 dark:bg-white/5 dark:border-white/10">
      <div className="text-sm font-medium text-black/80 dark:text-white/80">{title}</div>
      <button
        onClick={onClick}
        className={`h-7 w-12 rounded-full p-1 transition ${value ? "bg-black/80" : "bg-black/20"}`}
      >
        <div className={`h-5 w-5 rounded-full bg-white transition ${value ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}
