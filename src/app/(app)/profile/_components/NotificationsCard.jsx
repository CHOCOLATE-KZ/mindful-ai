"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

export default function NotificationsCard({ settings, onChange, t }) {
  const [saving, setSaving] = useState(false);
  const enabled = !!settings?.push_notifications;

  const handleToggle = async () => {
    setSaving(true);
    try {
      await onChange({ push_notifications: !enabled });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-md">
      <div className="flex items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50">
            <Bell className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <div className="font-medium text-slate-800">{t("push")}</div>
            <div className="text-sm text-slate-500">{t("pushHint")}</div>
          </div>
        </div>

        <Switch
          checked={enabled}
          onChange={handleToggle}
          disabled={saving}
          ariaLabel="toggle push"
        />
      </div>
    </div>
  );
}

function Switch({ checked, onChange, disabled, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative h-7 w-12 shrink-0 rounded-full p-1 transition-colors ${
        checked ? "bg-amber-400" : "bg-slate-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      aria-label={ariaLabel}
    >
      <span
        className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        } ${disabled ? "opacity-70" : ""}`}
      />
    </button>
  );
}
