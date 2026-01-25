"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
          <div className="text-lg font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/[0.04]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 rounded-full transition",
        checked ? "bg-black" : "bg-black/20"
      )}
      aria-pressed={checked}
    >
      <span
        className={cn(
          "absolute top-1 h-5 w-5 rounded-full bg-white transition",
          checked ? "left-6" : "left-1"
        )}
      />
    </button>
  );
}

function Stat({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-sm text-white/80">{label}</div>
    </div>
  );
}

function calcStreak(datesISO) {
  // datesISO: ["2026-01-10", "2026-01-09", ...]
  const set = new Set(datesISO);
  const today = new Date();
  const toISO = (d) => d.toISOString().slice(0, 10);

  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (set.has(toISO(d))) streak++;
    else break;
  }
  return streak;
}

export default function ProfilePage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ name: "" });
  const [settings, setSettings] = useState(null);

  const [activeDays, setActiveDays] = useState(0);
  const [streak, setStreak] = useState(0);
  const [avgSleep, setAvgSleep] = useState(null);
  const [avgMood, setAvgMood] = useState(null);

  // modals
  const [editOpen, setEditOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);

  // form states
  const [nameDraft, setNameDraft] = useState("");
  const [passwordDraft, setPasswordDraft] = useState("");
  const [msg, setMsg] = useState("");

  async function loadAll() {
  setLoading(true);
  setMsg("");

  try {
    const { data: uRes, error: uErr } = await supabase.auth.getUser();
    if (uErr) throw uErr;

    const authUser = uRes?.user;
    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }
    setUser(authUser);

    // ---------- PROFILES ----------
    const { data: pRows, error: pErr } = await supabase
    .from("profiles")
    .select("id, name, created_at, avatar_url")
    .eq("id", authUser.id)
    .limit(1);

    if (pErr) throw pErr;

    let p = pRows?.[0] ?? null;

    if (!p) {
    const { data: upData, error: upErr } = await supabase
        .from("profiles")
        .upsert(
        { id: authUser.id, name: authUser.user_metadata?.name || "" },
        { onConflict: "id" }
        )
        .select("id, name, created_at")
        .limit(1);

    if (upErr) throw upErr;
    p = upData?.[0] ?? null;
    }
    if (pErr) {
        setMsg(`profiles error: ${pErr.message}`);
        setLoading(false);
        return;
    }

    // ---------- USER_SETTINGS ----------
    const { data: sRows, error: sErr } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", authUser.id)
        .limit(1);

    if (sErr) throw sErr;

    let s = sRows?.[0] ?? null;

    if (!s) {
    const { data: upSData, error: upSErr } = await supabase
        .from("user_settings")
        .upsert({ user_id: authUser.id }, { onConflict: "user_id" })
        .select("*")
        .limit(1);

        if (upSErr) throw upSErr;
        s = upSData?.[0] ?? null;
    }
    setProfile({ name: p?.name || "" });
    setNameDraft(p?.name || "");
    setSettings(s || null);
    
    if (sErr) {
        setMsg(`user_settings error: ${sErr.message}`);
        setLoading(false);
        return;
    }



    // ---------- NOTES STATS ----------
    const { data: notes, error: nErr } = await supabase
      .from("notes")
      .select("date, sleep, mood")
      .eq("user_id", authUser.id)
      .order("date", { ascending: false })
      .limit(200);

    if (nErr) throw nErr;

    const dates = (notes || []).map((n) => n.date).filter(Boolean);
    const uniqDates = Array.from(new Set(dates));

    setActiveDays(uniqDates.length);
    setStreak(calcStreak(uniqDates));

        const sleeps = (notes || [])
        .map((n) => n.sleep)
        .filter((v) => typeof v === "number");
        const moods = (notes || [])
        .map((n) => n.mood)
        .filter((v) => typeof v === "number");

        setAvgSleep(
        sleeps.length ? sleeps.reduce((a, b) => a + b, 0) / sleeps.length : null
        );
        setAvgMood(
        moods.length ? moods.reduce((a, b) => a + b, 0) / moods.length : null
        );
    } catch (e) {
        console.error("PROFILE LOAD ERROR:", e);
        setMsg(e?.message || "Не удалось загрузить профиль.");
    } finally {
        setLoading(false);
    }
    }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function uploadAvatar(e) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setMsg("");

    const filePath = `${user.id}.png`;

    const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

    if (uploadError) {
        setMsg(uploadError.message);
        return;
    }

    const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

    const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", user.id);

    if (updateError) {
        setMsg(updateError.message);
        return;
    }

    await loadAll();
  }

  async function saveProfile() {
    setMsg("");
    const name = nameDraft.trim();

    const { error } = await supabase
      .from("profiles")
      .update({ name })
      .eq("id", user.id);

    if (error) {
      setMsg(error.message);
      return;
    }
    setProfile((p) => ({ ...p, name }));
    setEditOpen(false);
  }

  async function onAvatarSelected(file) {
  if (!file || !user) return;
  setMsg("");

  // 1) валидация
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    setMsg("Разрешены только JPG / PNG / WEBP.");
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    setMsg("Файл слишком большой. Максимум 2MB.");
    return;
  }

  try {
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${user.id}/avatar.${ext}`;

      // 2) загрузка в storage (upsert заменяет старый файл)
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (upErr) throw upErr;

      // 3) получаем public URL НЕ НАДО (bucket private).
      // Делаем signed url (например на 1 год) или на 1 час и обновляем при загрузке страницы.
      const { data: signed, error: sErr } = await supabase.storage
        .from("avatars")
        .createSignedUrl(path, 60 * 60 * 24 * 365); // 365 дней

      if (sErr) throw sErr;

      // 4) сохраняем ссылку в profiles.avatar_url
      const { error: dbErr } = await supabase
        .from("profiles")
        .update({ avatar_url: signed.signedUrl })
        .eq("id", user.id);

      if (dbErr) throw dbErr;

      // 5) обновляем UI
      setProfile((p) => ({ ...p, avatar_url: signed.signedUrl }));
      await loadAll();
      setMsg("Аватар обновлён ✅");
    } catch (e) {
      console.error(e);
      setMsg(e?.message || "Ошибка загрузки аватара.");
    }
  }

  async function updateSettings(patch) {
    if (!user) return;
    setSettings((s) => ({ ...s, ...patch })); // optimistic UI

    const { error } = await supabase
      .from("user_settings")
      .update(patch)
      .eq("user_id", user.id);

    if (error) {
      setMsg(error.message);
      // лучше перезагрузить реальные данные
      await loadAll();
    }
  }

  async function changePassword() {
    setMsg("");
    if (!passwordDraft || passwordDraft.length < 8) {
      setMsg("Пароль должен быть минимум 8 символов.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: passwordDraft });
    if (error) {
      setMsg(error.message);
      return;
    }

    setPasswordDraft("");
    setSecurityOpen(false);
    setMsg("Пароль обновлён ✅");
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-black/10" />
        <div className="mt-6 h-44 animate-pulse rounded-3xl bg-black/10" />
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="h-40 animate-pulse rounded-3xl bg-black/10" />
          <div className="h-40 animate-pulse rounded-3xl bg-black/10" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const email = user.email || "";
  const initial = (profile?.name?.trim()?.[0] || email[0] || "U").toUpperCase();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-black">
            Profile & Settings <span className="align-middle">⚙️</span>
          </h1>
          <p className="mt-2 text-black/60">Manage your account and preferences</p>
          {!!msg && <p className="mt-3 text-sm text-rose-600">{msg}</p>}
        </div>

        <button
          onClick={signOut}
          className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-black/[0.03]"
        >
          Выйти
        </button>
      </div>

      {/* Profile Card */}
      <div className="mt-8 overflow-hidden rounded-[32px] bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 shadow-xl">
        <div className="p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="relative h-16 w-16 overflow-hidden rounded-full ring-4 ring-white/20 bg-white/25">
                {profile?.avatar_url ? (
                  <img
                    src={`${profile.avatar_url}${profile.avatar_url.includes("?") ? "&" : "?"}v=${Date.now()}`}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      console.log("Avatar failed to load:", profile.avatar_url);
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-2xl font-semibold text-white">
                    {initial}
                  </div>
                )}
              </div>
              <div className="text-white">
                <div className="text-2xl font-semibold leading-tight">
                  {profile?.name?.trim() ? profile.name : "Unnamed user"}
                </div>
                <div className="mt-1 text-white/80">{email}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setEditOpen(true)}
                className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
              >
                Edit profile
              </button>
              <button
                onClick={() => setSecurityOpen(true)}
                className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
              >
                Security
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <Stat value={activeDays} label="Active Days" />
            <Stat value={streak} label="Day Streak" />
            <Stat value={Math.min(10, Math.floor(activeDays / 3))} label="Achievements" />
          </div>
        </div>
      </div>

      {/* Summary + Appearance */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
          <div className="text-lg font-semibold text-black">This Week’s Summary</div>

          <div className="mt-6 space-y-4 text-black/70">
            <div className="flex items-center justify-between">
              <div>Overall Mood</div>
              <div className="text-black">
                {avgMood == null ? (
                  <span className="text-black/40">No data</span>
                ) : (
                  <span className="font-medium">
                    {avgMood.toFixed(1)} / 10
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>Average Sleep</div>
              <div className="text-black">
                {avgSleep == null ? (
                  <span className="text-black/40">No data</span>
                ) : (
                  <span className="font-medium">{avgSleep.toFixed(1)} hours</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>Goals Completed</div>
              <div className="font-medium text-black">
                {activeDays ? Math.min(100, Math.round((streak / Math.max(1, activeDays)) * 100)) : 0}%
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
          <div className="text-lg font-semibold text-black">Appearance</div>

          <div className="mt-6 flex items-center justify-between rounded-2xl border border-black/10 bg-black/[0.02] p-5">
            <div>
              <div className="font-medium text-black">Dark Mode</div>
              <div className="mt-1 text-sm text-black/60">Easier on the eyes at night</div>
            </div>

            <Toggle
              checked={(settings?.theme || "light") === "dark"}
              onChange={(v) => updateSettings({ theme: v ? "dark" : "light" })}
            />
          </div>
        </div>
      </div>

      {/* Notifications + AI personalization + Privacy */}
      <div className="mt-8 space-y-6">
        <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
          <div className="text-lg font-semibold text-black">Notifications</div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <div className="font-medium text-black">Push Notifications</div>
              <div className="mt-1 text-sm text-black/60">Get reminders and updates</div>
            </div>
            <Toggle
              checked={!!settings?.push_enabled}
              onChange={(v) => updateSettings({ push_enabled: v })}
            />
          </div>

          <div className="mt-6 grid gap-3 text-sm text-black/70">
            <Row label="Morning check-in" right={settings?.reminder_morning ? String(settings.reminder_morning).slice(0,5) : "—"} />
            <Row label="Evening reflection" right={settings?.reminder_evening ? String(settings.reminder_evening).slice(0,5) : "—"} />
            <Row label="Hydration reminder" right={settings?.hydration_enabled ? `Every ${settings?.hydration_every_hours || 2} hours` : "Off"} />
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
          <div className="text-lg font-semibold text-black">AI Personalization</div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <div className="font-medium text-black">Personalized Recommendations</div>
              <div className="mt-1 text-sm text-black/60">Let AI learn from your patterns</div>
            </div>
            <Toggle
              checked={!!settings?.ai_personalization}
              onChange={(v) => updateSettings({ ai_personalization: v })}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
          <div className="text-lg font-semibold text-black">Privacy & Data</div>

          <div className="mt-4 divide-y divide-black/10 overflow-hidden rounded-2xl border border-black/10">
            <button
              onClick={() => setPrivacyOpen(true)}
              className="flex w-full items-center justify-between bg-white px-5 py-4 text-left hover:bg-black/[0.02]"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-black/[0.04]">🔒</span>
                <div>
                  <div className="font-medium text-black">Privacy Settings</div>
                  <div className="text-sm text-black/60">Control what’s stored and used</div>
                </div>
              </div>
              <span className="text-black/40">›</span>
            </button>

            <button
              onClick={() => alert("Экспорт сделаем позже (нужен endpoint /api/export).")}
              className="flex w-full items-center justify-between bg-white px-5 py-4 text-left hover:bg-black/[0.02]"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-black/[0.04]">⬇️</span>
                <div>
                  <div className="font-medium text-black">Export My Data</div>
                  <div className="text-sm text-black/60">Download notes and chat history</div>
                </div>
              </div>
              <span className="text-black/40">›</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <Modal open={editOpen} title="Edit Profile" onClose={() => setEditOpen(false)}>
        <div className="space-y-4">
                <div>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-full border border-black/10 bg-black/[0.03] grid place-items-center">
                        {profile?.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={profile.avatar_url}
                            alt="avatar"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xl font-semibold text-black/60">{initial}</span>
                        )}
                      </div>

                      <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-black/[0.03]">
                        Upload photo
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => onAvatarSelected(e.target.files?.[0])}
                        />
                      </label>
                    </div>
                </div>
          <div>
            <div className="text-sm font-medium text-black">Name</div>
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-black/[0.02] px-4 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              placeholder="Your name"
            />
          </div>

          <div>
            <div className="text-sm font-medium text-black">Email</div>
            <div className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-black/[0.02] px-4 grid items-center text-black/60">
              {email}
            </div>
            <div className="mt-2 text-xs text-black/50">
              Email change is better as a separate screen (needs confirmation flow).
            </div>
          </div>

          <button
            onClick={saveProfile}
            className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 font-semibold text-grey shadow-sm hover:opacity-95"
          >
            ✓ Save Changes
          </button>
        </div>
      </Modal>

      <Modal open={privacyOpen} title="Privacy Settings" onClose={() => setPrivacyOpen(false)}>
        <div className="space-y-4">
          <ItemToggle
            label="Data sharing with AI"
            checked={!!settings?.data_sharing_ai}
            onChange={(v) => updateSettings({ data_sharing_ai: v })}
          />
          <ItemToggle
            label="Anonymous analytics"
            checked={!!settings?.anonymous_analytics}
            onChange={(v) => updateSettings({ anonymous_analytics: v })}
          />
          <ItemToggle
            label="Activity tracking"
            checked={!!settings?.activity_tracking}
            onChange={(v) => updateSettings({ activity_tracking: v })}
          />
          <div className="text-xs text-black/50 pt-2">
            Важно: даже при выключенных тумблерах доступ к данным всё равно ограничен RLS (только владелец).
          </div>
        </div>
      </Modal>

      <Modal open={securityOpen} title="Security" onClose={() => setSecurityOpen(false)}>
        <div className="space-y-4">
          <div className="text-sm text-black/60">
            Change password (Supabase will update the current user).
          </div>

          <div>
            <div className="text-sm font-medium text-black">New password</div>
            <input
              value={passwordDraft}
              onChange={(e) => setPasswordDraft(e.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-black/[0.02] px-4 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              placeholder="Min 8 chars"
              type="password"
            />
          </div>

          <button
            onClick={changePassword}
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-black font-semibold text-white hover:opacity-95"
          >
            Update password
          </button>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, right }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3">
      <span>{label}</span>
      <span className="text-black/60">{right}</span>
    </div>
  );
}

function ItemToggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-4">
      <div className="font-medium text-black">{label}</div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}
