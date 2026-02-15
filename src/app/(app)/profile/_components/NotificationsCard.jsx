"use client";

export default function NotificationsCard({ settings, onChange, t }) {
  const enabled = !!settings?.push_notifications;

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_12px_35px_rgba(0,0,0,0.06)]">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-blue-600" />

      <h3 className="text-base font-semibold text-black">{t("notifications")}</h3>

      <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white p-4">
        <div>
          <div className="font-medium text-black">{t("push")}</div>
          <div className="text-sm text-black/60">{t("pushHint")}</div>
        </div>

        <Switch
          checked={enabled}
          onChange={() => onChange({ push_notifications: !enabled })}
          ariaLabel="toggle push"
        />
      </div>
    </div>
  );
}

function Switch({ checked, onChange, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-8 w-14 rounded-full border border-black/10 p-1 transition ${
        checked ? "bg-blue-600/20" : "bg-black/10"
      }`}
      aria-label={ariaLabel}
    >
      <span
        className={`block h-6 w-6 rounded-full bg-white shadow-sm transition ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}
