"use client";

import { useState, useEffect } from "react";
import { Bell, Clock, Trash2, Check, Send } from "lucide-react";

const DAYS_OPTIONS = [
  { value: "Каждый день", label: "Каждый день" },
  { value: "Будни (Пн-Пт)", label: "Будни (Пн-Пт)" },
  { value: "Выходные (Сб-Вс)", label: "Выходные" },
];

const TIME_PRESETS = ["07:00", "08:00", "09:00", "12:00", "18:00", "20:00", "21:00", "22:00"];

export default function NotificationsCard({ settings, t }) {
  const [reminder, setReminder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Форма
  const [time, setTime] = useState("09:00");
  const [days, setDays] = useState("Каждый день");

  const telegramLinked = !!settings?.telegram_id;

  useEffect(() => {
    fetch("/api/reminders")
      .then((r) => r.json())
      .then((d) => {
        setReminder(d.reminder || null);
        if (d.reminder) {
          setTime(d.reminder.time);
          setDays(d.reminder.days);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time, days, enabled: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");
      setReminder(data.reminder);
      setShowForm(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    if (!reminder) return;
    setSaving(true);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !reminder.enabled }),
      });
      const data = await res.json();
      if (res.ok) setReminder(data.reminder);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch("/api/reminders", { method: "DELETE" });
      setReminder(null);
      setShowForm(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-md">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-50">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50">
          <Bell className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <div className="font-medium text-slate-800">Напоминания</div>
          <div className="text-sm text-slate-500">Ежедневные напоминания через Telegram</div>
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
        {/* Telegram не привязан */}
        {!telegramLinked && (
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center">
            <Send className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-medium">Telegram не привязан</p>
            <p className="text-xs text-slate-400 mt-1">
              Привяжите Telegram в разделе ниже, чтобы получать напоминания
            </p>
          </div>
        )}

        {/* Telegram привязан, нет напоминания */}
        {telegramLinked && !loading && !reminder && !showForm && (
          <div className="text-center py-2">
            <p className="text-sm text-slate-500 mb-3">Напоминания ещё не настроены</p>
            <button
              onClick={() => setShowForm(true)}
              className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
            >
              Настроить напоминание
            </button>
          </div>
        )}

        {/* Активное напоминание */}
        {telegramLinked && reminder && !showForm && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{reminder.time}</div>
                  <div className="text-xs text-slate-400">{reminder.days}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={!!reminder.enabled}
                  onChange={handleToggle}
                  disabled={saving}
                  ariaLabel="toggle reminder"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setTime(reminder.time); setDays(reminder.days); setShowForm(true); }}
                className="flex-1 rounded-xl border border-slate-200 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Изменить
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl border border-red-100 py-1.5 px-3 text-xs font-medium text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Форма создания/редактирования */}
        {telegramLinked && showForm && (
          <div className="space-y-3">
            {/* Выбор времени */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Время</label>
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                {TIME_PRESETS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTime(t)}
                    className={`rounded-lg py-1.5 text-xs font-medium transition-colors ${
                      time === t
                        ? "bg-amber-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Выбор дней */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Дни</label>
              <div className="flex gap-2 flex-wrap">
                {DAYS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDays(opt.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      days === opt.value
                        ? "bg-amber-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-xl bg-amber-500 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                {saving ? "Сохранение..." : "Сохранить"}
              </button>
              <button
                onClick={() => { setShowForm(false); setError(""); }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Успех */}
        {success && (
          <div className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
            <Check className="h-4 w-4" />
            Напоминание сохранено!
          </div>
        )}

        {loading && (
          <div className="py-2 text-center text-xs text-slate-400">Загрузка...</div>
        )}
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
